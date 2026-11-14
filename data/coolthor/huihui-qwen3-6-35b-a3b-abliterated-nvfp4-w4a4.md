# coolthor/Huihui-Qwen3.6-35B-A3B-abliterated-NVFP4-W4A4

## Resumen

Huihui-Qwen3.6-35B-A3B-abliterated-NVFP4-W4A4 es una cuantización NVFP4 de pesos y activaciones (W4A4) del checkpoint abliterated de Qwen3.6-35B-A3B, un modelo MoE híbrido de aproximadamente 35.950 millones de parámetros totales con unos 3.000 millones activos por token. Lo publica el usuario coolthor sobre el trabajo previo de huihui-ai, que a su vez deriva del Qwen3.6-35B-A3B oficial. La arquitectura combina atención lineal GDN (Gated DeltaNet, tipo Mamba) intercalada con atención completa, e incorpora una torre de visión, por lo que el pipeline declarado es image-text-to-text.

El objetivo del checkpoint no es mejorar la calidad del modelo base, sino demostrar que una cuantización NVFP4 W4A4 de un MoE híbrido puede servirse en vLLM sobre una NVIDIA DGX Spark (GB10, SM121) y decodificar más rápido que la versión FP8: 66,9 tok/s frente a 52,0 tok/s (+29 %) con unos 16 GB menos de memoria de pesos (22 GB frente a 38 GB). El truco está en que la aceleración depende por completo de las CUDA graphs; con `--enforce-eager` el rendimiento cae a unos 23 tok/s.

Es relevante ahora porque la mayoría de cuantizaciones NVFP4 de MoE en Blackwell de consumo o SM121 acaban en una ruta lenta de dequantización o fallan al compilar la MMA con escalado por bloques. Este checkpoint documenta la cadena de herramientas necesaria (cutlass-dsl 4.5.x y flashinfer 0.6.11 o superior) y corrige el prefijo de carga de la torre de visión, que en el modelo base provocaba que las imágenes degeneraran en bucles de `!!!!!`. La licencia es Apache 2.0 y los idiomas declarados son inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (atención lineal GDN + atención completa intercaladas), con torre de visión |
| Parametros totales | 35.951.822.704 (~35,95 B) |
| Parametros activos | ~3 B (A3B) |
| Longitud de contexto | 262.144 tokens (256K), sin YaRN |
| Tipos de cuantizacion | NVFP4 W4A4 (pesos FP4 + activaciones FP4), grupo de tamaño 16, escalas FP8 e4m3fn; KV cache en fp8; formato compressed-tensors `nvfp4-pack-quantized` |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), ~22 GB en disco, repo de 23,6 GB |
| Precisión mantenida | `lm_head`, `visual.*`, `mlp.gate` (router) y `shared_expert_gate` sin cuantizar |
| Cabezas MTP | Preservadas en `model_mtp.safetensors`, desactivadas por defecto |
| Modalidad | Texto e imagen |

## Arquitectura y entrenamiento

El modelo base es un MoE híbrido de tipo Qwen3.5 MoE (`Qwen3_5MoeForConditionalGeneration`): capas de atención lineal GDN, derivadas de la familia Mamba/Gated DeltaNet, intercaladas con capas de atención completa clásica, más un enrutador MoE por capa que activa aproximadamente 3.000 millones de parámetros de los casi 36.000 millones totales. Incorpora una torre de visión para entrada de imágenes y cabezas MTP (multi-token prediction) para decodificación especulativa. El contexto nativo es de 262.144 posiciones sin escalado YaRN.

Sobre el entrenamiento del modelo original no se dispone de información en la documentación proporcionada: no se detallan el número de tokens, la composición del dataset ni si hubo RLHF o DPO. Lo que sí está documentado es el proceso de modificación: huihui-ai aplicó una técnica de abliteration sobre el Qwen3.6-35B-A3B para eliminar la alineación de rechazo, y coolthor cuantizó ese checkpoint BF16 con llm-compressor usando el esquema `NVFP4` y el modificador `QuantizationModifier` sobre todas las capas `Linear`, excluyendo `lm_head`, la torre visual, el router `mlp.gate` y `shared_expert_gate`. El resultado se guarda en formato `nvfp4-pack-quantized` de compressed-tensors. Además, se ha eliminado el prefijo `model.language_model.` de los tensores visuales en el shard afectado y en `model.safetensors.index.json`, de modo que vLLM encuentra `visual.*` y la entrada de imagen funciona sin parches manuales.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 256K tokens.
- Razonamiento y matemáticas, heredados del modelo base Qwen3.6 (sin cifras de benchmark publicadas en esta ficha).
- Generación de código, con parser de tool calling `qwen3_coder` soportado en vLLM.
- Tool calling y function calling: la configuración de servicio incluye `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`.
- Modo de razonamiento explícito, con `--reasoning-parser qwen3` en vLLM.
- Entrada de imagen (image-text-to-text): torre de visión preservada y prefijo de carga corregido.
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Sin censura de rechazo (abliterated/uncensored): el modelo no aplica las negativas de alineación del original.
- Decodificación especulativa MTP disponible en los pesos, pero desactivada por recomendación del autor.

## Casos de uso

- Despliegue en hardware Blackwell de un solo nodo: el caso de uso principal documentado es servir el modelo en vLLM sobre una DGX Spark (GB10, SM121) con unos 22 GB de pesos y KV cache fp8, obteniendo 66,9 tok/s en decodificación monostream. Es adecuado porque el checkpoint está cuantizado específicamente para que la MMA NVFP4 con escalado por bloques compile en esa arquitectura.
- Asistente conversacional de contexto largo: con 262.144 tokens de ventana se pueden mantener conversaciones multi-turno o procesar documentos extensos sin truncar, siempre que se reserve memoria para el KV cache en fp8.
- Análisis de documentos con imágenes: al conservar la torre de visión y haber corregido el prefijo de carga, el modelo acepta capturas, diagramas o páginas escaneadas junto con texto, útil para extracción de información de informes técnicos.
- Generación de código integrada en pipelines: el soporte de tool calling con parser `qwen3_coder` y de modo razonamiento permite usarlo como agente de edición de código que invoca herramientas y encadena varios pasos.
- Investigación sobre alineación y seguridad: la variante abliterated permite estudiar el comportamiento del modelo sin las capas de rechazo, por ejemplo para medir sesgos, robustez ante prompts adversarios o eficacia de técnicas de recuperación de alineación.
- Prototipado de agentes multi-paso en entornos con presupuesto de memoria ajustado: con 22 GB de pesos cabe junto a otros servicios en una GPU de 128 GB, y la ventana de 256K permite mantener el historial completo de la traza del agente.
- Evaluación de cuantización W4A4 frente a FP8: sirve como referencia reproducible para medir la pérdida de calidad y la ganancia de velocidad de NVFP4 en MoE híbridos, dado que el autor publica la receta y las trazas.

## Benchmarks y rendimiento

El autor publica rendimiento de decodificación medido en la misma máquina, mismo harness, monostream, KV cache fp8 y en caliente:

| Configuracion | Memoria de pesos | tok/s | vs FP8 |
|---|---|---|---|
| FP8 dynamic | ~38 GB | 52,0 | 1,00x |
| NVFP4 W4A4 (cudagraph activado) | ~22 GB | 66,9 | 1,29x |
| NVFP4 W4A4 con `--enforce-eager` | ~22 GB | ~23 | 0,44x |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 22 GB de pesos en NVFP4, más KV cache fp8 y memoria de activaciones. El autor usa `--gpu-memory-utilization 0.50` en una DGX Spark, lo que sugiere un presupuesto total en torno a 64 GB utilizables.
- GPU recomendadas: NVIDIA DGX Spark (GB10, SM121), que es el objetivo declarado. Requiere una build de vLLM en la que compile la MMA NVFP4 con escalado por bloques en SM121: cutlass-dsl 4.5.x y flashinfer 0.6.11 o superior.
- No se documenta compatibilidad con GPU de consumo (RTX 4090, etc.) ni con otras arquitecturas; el backend `flashinfer_cutlass` y la ruta NVFP4 están atados a Blackwell/SM121.
- Opciones de despliegue: vLLM con `--moe-backend flashinfer_cutlass`, `--kv-cache-dtype fp8`, `--max-model-len 262144`, `--max-num-seqs 4`, `--max-num-batched-tokens 8192`, `--enable-prefix-caching` y `--trust-remote-code`. No se mencionan llama.cpp, Ollama ni TGI.
- Restricciones de configuración: `--max-num-batched-tokens` debe ser mayor o igual a 2096 para que se alinee el bloque de caché híbrido Mamba/GDN y se reserve el estado de convolución; valores menores fallan al asignar la caché. No se debe pasar `--enforce-eager` ni una `--speculative-config`.
- Throughput y latencia: 66,9 tok/s en decodificación monostream con CUDA graphs; aproximadamente 23 tok/s en modo eager. No se publican cifras de throughput con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este checkpoint (NVFP4 W4A4) | ~35,95 B totales, ~3 B activos | 256K | safetensors NVFP4 | Apache 2.0 | 66,9 tok/s en DGX Spark, visión incluida |
| huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated (BF16) | ~35,95 B totales, ~3 B activos | 256K | safetensors BF16 | Apache 2.0 | Modelo base sin cuantizar; mayor huella de memoria, sin datos de velocidad publicados |
| Qwen/Qwen3.6-35B-A3B | ~35,95 B totales, ~3 B activos | 256K | safetensors | no disponible en la información | Modelo original alineado, sin abliteration |
| Build FP8 dynamic (referencia del autor) | ~35,95 B totales, ~3 B activos | 256K | FP8 | Apache 2.0 | 52,0 tok/s y ~38 GB de pesos en la misma máquina |

No se dispone de comparaciones con otros modelos de tamaño o categoría similares en la información proporcionada.

## Limitaciones y advertencias

- Al ser una variante abliterated, se han eliminado las capas de rechazo del modelo original; esto incrementa el riesgo de generar contenido dañino, sesgado o inapropiado y traslada al operador toda la responsabilidad de filtrado.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de fidelidad ni de calidad tras la cuantización W4A4, por lo que no se puede descartar degradación respecto al BF16.
- Idiomas soportados únicamente inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- La aceleración depende críticamente de las CUDA graphs: con `--enforce-eager` el rendimiento cae de 66,9 a unos 23 tok/s. Cualquier modificación del toolchain que rebaje cutlass-dsl a 4.4.2 (por ejemplo, parches tipo `sm121-b12x`) rompe la ruta compilada de NVFP4.
- El backend `flashinfer_cutlass` rechaza exportaciones NVFP4 W4A16 de solo pesos; este checkpoint es W4A4 precisamente por ese motivo, lo que limita su portabilidad a otros backends.
- Las cabezas MTP están presentes pero desactivadas: el barrido de `num_speculative_tokens` de 0 a 4 mostró que la línea base sin especulación gana, porque la carga de pesos NVFP4 y la especulación compiten por el mismo ancho de banda en GB10.
- La configuración de servicio exige `--trust-remote-code`, lo que implica ejecutar código del repositorio.
- El checkpoint tiene un volumen de descargas bajo (175) y ningún like en el momento de la consulta, por lo que la validación comunitaria es escasa.
- El contexto de 256K sin YaRN consume mucha memoria de KV cache; en la práctica habrá que reducir `--max-model-len` según la GPU disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coolthor/Huihui-Qwen3.6-35B-A3B-abliterated-NVFP4-W4A4
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated
- Modelo original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- llm-compressor: https://github.com/vllm-project/llm-compressor
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Artículo técnico del autor (método, barrido y trazas): https://ai-muninn.com/en/blog/dgx-spark-nvfp4-w4a4-moe-cudagraph
