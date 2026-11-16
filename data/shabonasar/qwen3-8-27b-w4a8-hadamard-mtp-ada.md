# shabonasar/qwen3.8-27b-w4a8-hadamard-mtp-ada

## Resumen

Qwen3.8-27B W4A8 Hadamard + MTP es una cuantización del modelo multimodal Qwen/Qwen3.8-27B publicada por el usuario shabonasar, orientada específicamente a la NVIDIA RTX 6000 Ada Generation (SM89, 48 GB). Reduce el peso del checkpoint de 52 GB en bf16 a 18,5 GB (18,3 GB del backbone más 0,25 GB de la cabeza MTP), lo que permite servir el modelo completo con una sola GPU profesional de 48 GB. El checkpoint usa el formato `compressed-tensors` en variante `pack-quantized` y está pensado para cargarse con vLLM.

La receta combina cuantización de pesos a int4 por canal con activaciones int8 dinámicas por token (W4A8), aplicando una rotación de Hadamard de estilo QuIP (bloques de 128) sobre la entrada de las capas lineales antes de GPTQ con act-order estático. En SM89, esta configuración se ejecuta sobre la ruta INT8 Humming de vLLM, que el autor reporta aproximadamente 1,6 veces más rápida en prefill que W4A16. Además, se conserva y cuantiza por separado la capa MTP nativa del modelo base, lo que habilita decodificación especulativa con la propia cabeza draft del modelo.

El modelo es relevante porque demuestra una estrategia de cuantización agresiva pero selectiva sobre una arquitectura híbrida (atención lineal Gated DeltaNet más atención completa), manteniendo en bf16 los componentes sensibles (torre de visión, embeddings, `lm_head`, normas y parámetros de las GDN) y cuantizando solo las proyecciones lineales. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 64 capas decoder con patrón repetido de 3 capas Gated DeltaNet (atención lineal) y 1 capa de atención completa (48 GDN + 16 full attention), MLP densa en todas las capas, con torre de visión y capa MTP |
| Parametros totales | 27.786.408.720 (27,79 B) |
| Parametros activos | no disponible (no es MoE; todas las capas son densas) |
| Longitud de contexto | 262.144 tokens (configurado en el comando de ejemplo con `--max-model-len 262144`) |
| Tipos de cuantizacion | W4A8 (int4 simétrico por canal + int8 dinámico por token) en proyecciones lineales del LM; W4A16 (int4 asimétrico grupo 32) en la capa MTP; bf16 en embeddings, `lm_head`, normas, parámetros GDN sensibles y torre de visión; KV cache en NVFP4 o FP8 E4M3; draft head en NVFP4 |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; los datasets de calibración incluyen textos en ruso e inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` con `compressed-tensors` (`pack-quantized`); matrices de Hadamard almacenadas en FLOAT64 como `*.v_input` |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de 64 capas que alterna tres capas de Gated DeltaNet (atención lineal con estado recurrente) por cada capa de atención completa, con MLP densa en todas ellas. Esta cuantización no reentrena el modelo: aplica GPTQ con act-order estático sobre las proyecciones lineales, precedido de una rotación de Hadamard en bloques de 128 sobre la entrada de cada capa (enfoque QuIP), con inversa online gestionada por `hadacore`. Las proyecciones `linear_attn.in_proj_qkv` e `in_proj_z` de las GDN se cuantizan a W4A8 sin rotación, porque la ruta fusionada `in_proj_qkvz` de vLLM no soporta la variante rotada. Se mantienen en bf16 las proyecciones `in_proj_a`/`in_proj_b`, `conv1d`, `A_log`, `dt_bias`, las normas y la torre de visión.

La calibración usó 512 muestras de 2048 tokens con salidas del profesor (el modelo original en bf16), excluyendo textos de evaluación. La composición aproximada fue: 25 % de Vikhrmodels/GrandMaster-PRO-MAX, 20 % de NousResearch/hermes-function-calling-v1 en formato nativo de herramientas de Qwen, 15 % de mlabonne/open-perfectblend, 10 % de IlyaGusev/saiga_scored, 10 % de Wikipedia en ruso y 20 % de datos sintéticos de instrucciones y tool-calls no publicados. La capa MTP se cuantizó aparte a int4 asimétrico con grupo 32 y búsqueda de clipping por MSE, manteniendo activaciones bf16, ya que `mtp.fc` recibe la concatenación de embedding y estado oculto y el esquema W4A8 por canal no funcionaba en ese módulo.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del modelo base Qwen3.8-27B.
- Procesamiento de imagen y texto (`image-text-to-text`): la torre de visión se conserva íntegra en bf16.
- Tool calling y function calling: parte de la calibración usó el dataset Hermes en el formato nativo de herramientas de Qwen, lo que preserva el comportamiento en ese dominio.
- Decodificación especulativa nativa mediante la cabeza MTP cuantizada, que actúa como draft head del propio modelo.
- Soporte de contexto largo: la configuración de ejemplo admite hasta 262.144 tokens.
- Capacidades multilingües: no disponibles de forma explícita en la información proporcionada; la calibración incluyó texto en ruso e inglés.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Despliegue multimodal en una sola RTX 6000 Ada: el checkpoint de 18,5 GB cabe holgadamente en 48 GB junto con la caché KV en NVFP4, lo que permite servir imagen-texto con contexto largo sin multi-GPU.
- Asistentes con contexto extenso: con `--max-model-len 262144` y caché KV NVFP4 (que el autor estima un 1,7× más de tokens que FP8 a igual calidad), es adecuado para análisis de documentos largos o conversaciones de muchas vueltas.
- Agentes con tool calling: la calibración con Hermes function-calling y el soporte de vLLM para herramientas permiten integrarlo en pipelines de agentes que encadenan llamadas a APIs.
- Generación de código asistida: las proyecciones MLP y de atención cuantizadas a W4A8 mantienen el throughput alto en prefill (≈1,6× frente a W4A16 según el autor), útil para autocompletado en IDE con latencia interactiva.
- Servicio de inferencia con decodificación especulativa: la cabeza MTP cuantizada permite acelerar la generación sin un modelo draft externo, reduciendo el coste por token en despliegues con vLLM.
- Procesamiento de documentos con imágenes: al conservar la torre de visión en bf16, puede extraer información de capturas, formularios o figuras en flujos de digitalización.
- Evaluación e investigación de cuantización: sirve como referencia reproducible de la receta Hadamard + GPTQ + W4A8 sobre arquitecturas híbridas con atención lineal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta una métrica relativa de rendimiento: aproximadamente 1,6× más velocidad de prefill que W4A16 en SM89 con la ruta INT8 Humming de vLLM, y un tamaño de checkpoint de 18,5 GB frente a 52 GB en bf16.

## Requisitos de hardware

- VRAM estimada: 18,5 GB de pesos; con caché KV NVFP4 y estado recurrente GDN en bf16, el autor configura `--gpu-memory-utilization 0.90` sobre 48 GB para contexto de 262.144 tokens.
- GPU recomendada: NVIDIA RTX 6000 Ada Generation (SM89, 48 GB), único hardware probado por el autor.
- Compatibilidad consumer: no confirmada. El checkpoint requiere la ruta INT8 Humming para pesos int4 por canal en SM89; otras GPU no fueron probadas según la model card.
- Despliegue: vLLM con backend lineal `humming`, backend de atención `FLASHINFER`, `--mamba-ssm-cache-dtype bfloat16`, `--mamba-cache-mode align`, `--kv-cache-dtype nvfp4` (o `fp8_e4m3`), `--enable-prefix-caching` y decodificación especulativa activada. Se probó sobre el build nightly `0.33.0rc1.dev1030+gcf5cea2da` (imagen `vllm/vllm-openai:nightly-cf5cea2da37d3dfed27d2e0aa3041c3e553c2d57`); versiones anteriores no cargan el layout W4A8 rotado.
- Latencia y throughput: no disponibles de forma absoluta; solo la comparación relativa de prefill frente a W4A16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shabonasar/qwen3.8-27b-w4a8-hadamard-mtp-ada | 27,79 B | 262.144 | W4A8 + MTP W4A16, KV NVFP4/FP8 | Apache 2.0 | Hugging Face, requiere vLLM nightly con Humming |
| Qwen/Qwen3.8-27B (base) | 27,79 B | no disponible en la informacion | bf16 (52 GB) | Apache 2.0 | Hugging Face |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo se ha probado en NVIDIA RTX 6000 Ada (SM89); en otras GPU el comportamiento de la ruta INT8 Humming no está verificado y el modelo podría no cargar o degradar su rendimiento.
- Dependencia estricta de un build nightly concreto de vLLM (`cf5cea2da`); releases estables anteriores no soportan el layout W4A8 rotado con Hadamard.
- La cuantización W4A8 introduce pérdida de precisión frente al bf16 original; no se publican métricas de degradación (perplejidad, benchmarks) para cuantificarla.
- La calibración incluye datos sintéticos no publicados (≈20 %), lo que limita la reproducibilidad exacta de la receta.
- No se declara lista de idiomas soportados; el soporte multilingüe debe validarse empíricamente antes de usarlo en producción.
- Riesgo de alucinación y sesgos inherentes al modelo base Qwen3.8-27B, no evaluados en esta versión cuantizada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base y de los datasets de calibración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shabonasar/qwen3.8-27b-w4a8-hadamard-mtp-ada
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Commit de vLLM probado: https://github.com/vllm-project/vllm/commit/cf5cea2da
- Dataset Vikhrmodels/GrandMaster-PRO-MAX: https://huggingface.co/datasets/Vikhrmodels/GrandMaster-PRO-MAX
- Dataset IlyaGusev/saiga_scored: https://huggingface.co/datasets/IlyaGusev/saiga_scored
- Dataset wikimedia/wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset mlabonne/open-perfectblend: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Dataset NousResearch/hermes-function-calling-v1: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
