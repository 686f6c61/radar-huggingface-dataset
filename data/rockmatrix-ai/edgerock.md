# rockmatrix-ai/EdgeRock

## Resumen

EdgeRock-4B es un modelo multimodal (texto e imagen) de 4.578.061.568 parámetros desarrollado por Rock Matrix, publicado en HuggingFace bajo la licencia `edgerock-model-license-1.0`. Su propuesta central es mantener un coste de memoria de historial constante durante el razonamiento de cadena larga: en lugar de dejar crecer la caché KV con cada token generado, el modelo combina estado recurrente, atención local de ventana fija y un banco de registros recuperables denominado Rock Memory Anchors (RMA). Según la model card, el modelo emplea 72 MiB de KV de atención por secuencia y 97,76 MiB de historial persistente total en el runtime por lotes.

El modelo parte del backbone Qwen3.5-4B y sustituye sus ocho capas de atención completa por bloques híbridos, conservando 24 capas Gated DeltaNet y los bloques feed-forward. El resultado es una arquitectura híbrida recurrente-atención que, según el autor, mantiene el 99,1% menos de KV de atención en BF16 que Qwen3.5-4B a 256K de contexto, y sostiene 233,7 tokens/s de decodificación con lote de tamaño 1 en una GPU Hopper de 80 GB (128K de entrada y 128K de salida).

Es relevante ahora porque ataca un cuello de botella concreto de la inferencia de modelos razonadores: la memoria consumida por el historial limita la concurrencia y encarece el despliegue, especialmente en dispositivos edge donde el razonamiento debe convivir con percepción y control. La familia EdgeRock se presenta como un conjunto de modelos; esta es la primera release abierta y hay otros tamaños en preparación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 24 capas Gated DeltaNet (recurrentes) + 8 bloques de atención de ventana deslizante (1.024 posiciones) en paralelo con Rock Memory Anchors (RMA); backbone Qwen3.5-4B convertido |
| Parámetros totales | 4.578.061.568 (~4,58 B), dato de safetensors |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K (usado en las comparativas de memoria de la model card); ventana de atención local de 1.024 posiciones; banco RMA de 1.024 registros por grupo KV, con 4 grupos KV |
| Tipos de cuantización | No disponible. Los pesos publicados son safetensors en BF16; el perfil `fast` usa pesos y KV en BF16 con actualizaciones GDN en FP32 y estado recurrente en FP32 (lote 1) o FP16 (lotes mayores) |
| Idiomas soportados | Inglés (`en`) y chino (`zh`) |
| Licencia | `edgerock-model-license-1.0` (tag `license:other`); la model card incluye el tag `commercial-use` |
| Formato de pesos | safetensors con código personalizado (`custom_code`); requiere una wheel propia de `transformers 5.7.0.dev0` incluida en el repo |

## Arquitectura y entrenamiento

EdgeRock-4B convierte las ocho capas de atención completa del backbone Qwen3.5-4B en ocho bloques con la estructura `[GDN, GDN, GDN, atención de ventana deslizante ∥ RMA]`, manteniendo 24 capas Gated DeltaNet y los bloques feed-forward. El historial se reparte en cuatro componentes con capacidad fija: un estado recurrente que resume el contexto evolutivo, una atención local de 1.024 posiciones para las interacciones recientes, un banco de anchors RMA de 1.024 registros por grupo KV para detalles lejanos recuperables de forma individual, y 256 posiciones de candidatos pendientes. Un escritor aprendido genera registros clave-valor dedicados; cada 256 tokens, el mecanismo de admisión retiene los registros de mayor prioridad por separado en cada uno de los cuatro grupos KV. Las consultas leen el banco ya confirmado (los registros nuevos son visibles en el siguiente bloque) y una lectura dependiente de la consulta, junto con una puerta con signo, integra la información recuperada junto a la atención local.

El autor no detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Tampoco se especifican innovaciones de decodificación (por ejemplo, decodificación especulativa); el runtime comparado usa decodificación autorregresiva ordinaria con pesos y KV en BF16 y actualizaciones GDN en FP32. La innovación declarada es el esquema RMA junto con la gestión de memoria de capacidad fija, documentado en el informe técnico y en el arXiv:2610.10118.

## Capacidades

- Generación de texto y razonamiento de cadena larga con coste de historial constante, incluyendo matemáticas competitivas (AIME 2024-2026).
- Razonamiento multimodal texto-imagen: la model card reporta resultados en seis benchmarks visuales con una precisión media a nivel de respuesta del 84,9%.
- Contexto largo de hasta 256K tokens con almacenamiento KV de atención fijo (72 MiB por secuencia).
- Recuperación de detalles lejanos mediante el banco de anchors RMA, sin necesidad de mantener toda la atención completa sobre el historial.
- Multilingüe limitado a inglés y chino.
- Ejecución en CPU y CUDA mediante el backend portátil en PyTorch, y una ruta CUDA optimizada específica para Hopper.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso orquestado: no disponible en la información proporcionada.
- Capacidades de audio o modo "thinking" explícito: no disponibles en la información proporcionada.

## Casos de uso

- Razonamiento matemático de cadena larga en dispositivo edge: el modelo permite generar soluciones paso a paso de problemas tipo AIME manteniendo el estado recurrente y el banco de anchors en un presupuesto de memoria acotado (97,76 MiB de historial persistente), lo que encaja en equipos donde la memoria se comparte con otros procesos.
- Servicio de inferencia con alta concurrencia: al fijar la KV de atención en 72 MiB por secuencia, el número de secuencias simultáneas deja de escalar con la longitud del historial, lo que abarata el coste por petición en tareas de razonamiento largo.
- Procesamiento de documentos extensos en una sola GPU: con contexto de hasta 256K y una KV un 99,1% menor que Qwen3.5-4B en BF16 a esa longitud, es viable analizar contratos, informes o expedientes completos sin sharding.
- Asistente visual para robótica o inspección: el pipeline `image-text-to-text` permite responder preguntas sobre imágenes conservando el 95,3% de la precisión media de Qwen3.5-4B, con un coste de historial compatible con el presupuesto de un sistema embebido.
- Análisis de trazas y telemetría de larga duración: la combinación de estado recurrente más RMA permite resumir el flujo completo y recuperar eventos concretos seleccionados, útil para diagnóstico de incidentes sobre logs de cientos de miles de tokens.
- Generación de código con contexto de repositorio: no hay benchmarks de código publicados, pero la ventana de 256K y el rendimiento de decodificación sostenido (233,7 tokens/s en Hopper 80 GB) permiten integrarlo en pipelines de revisión o completado sobre múltiples ficheros.
- Investigación en arquitecturas de estado acotado: sirve como referencia reproducible (pesos abiertos, informe técnico y arXiv) para comparar mecanismos de memoria frente a RWKV-7 u otros modelos de estado limitado.

## Benchmarks y rendimiento

| Benchmark / métrica | EdgeRock-4B | Referencia comparada | Notas |
|---|---|---|---|
| AIME 2024-2026 (media pass@1) | 82,9% | 18,8% (RWKV-7 G1j, clase 14B) | Comparación contra el mejor baseline de estado acotado evaluado por el autor |
| Benchmarks visuales (6, precisión media a nivel de respuesta) | 84,9% | Retiene el 95,3% de la precisión media de Qwen3.5-4B | Conjunto de seis benchmarks visuales |
| KV de atención en BF16 a 256K | 72 MiB por secuencia | 99,1% mayor en Qwen3.5-4B | Dato declarado en la model card |
| Historial persistente total (runtime por lotes) | 97,76 MiB | No disponible | Incluye matrices recurrentes en FP16 y estado auxiliar |
| Throughput end-to-end de tokens de salida a 32K/32K | 6,42× Qwen3.5-4B | Mejor tamaño de lote medido de cada modelo | El tiempo incluye prefill |
| Decodificación (batch 1, 128K entrada / 128K salida) | 233,7 tokens/s | No disponible | Una GPU Hopper de 80 GB |

MMLU, HumanEval, GSM8K y el resto de benchmarks de texto estándar no aparecen en la información disponible. No se han publicado resultados de benchmarks en la información disponible para esas categorías.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 9,2 GB (4,58 B de parámetros × 2 bytes); el repositorio completo ocupa 18,6 GB e incluye datos de evaluación, visión y wheels.
- Estado de historial: 72 MiB de KV de atención por secuencia y 97,76 MiB de historial persistente total en el runtime por lotes, según el autor.
- GPU validadas: una GPU Hopper de 80 GB (H100/H200) sostiene 233,7 tokens/s de decodificación con 128K de entrada y 128K de salida; existe una ruta CUDA optimizada específica para Hopper.
- GPU de consumo: los pesos BF16 caben en una RTX 4090 (24 GB) o similar, pero no hay datos publicados de rendimiento en esas tarjetas y la ruta CUDA optimizada documentada es solo para Hopper; el backend portátil en PyTorch cubre CPU y CUDA.
- Despliegue: script `run.py` del repositorio con el backend portátil (PyTorch CPU/CUDA) o el path CUDA de Hopper, previa instalación de la wheel `transformers-5.7.0.dev0` incluida. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 233,7 tokens/s de decodificación (batch 1, 128K/128K, Hopper 80 GB) y 6,42× el throughput end-to-end de Qwen3.5-4B a 32K/32K; no hay cifras publicadas de latencia de prefill ni de rendimiento en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EdgeRock-4B | 4,58 B (denso) | 256K, con KV de atención fijo | 82,9% en AIME 2024-2026; 84,9% en benchmarks visuales | `edgerock-model-license-1.0` | Pesos abiertos en HuggingFace y ModelScope; código en GitHub |
| Qwen3.5-4B | Clase 4B (dato exacto no disponible) | 256K (usado como referencia de comparación) | Base del backbone; sirve de referencia de retención visual y throughput | No disponible en la información | No disponible en la información |
| RWKV-7 G1j | Clase 14B | No disponible | 18,8% de media pass@1 en AIME 2024-2026 | No disponible en la información | No disponible en la información |

La comparación con RWKV-7 G1j se establece contra modelos de estado acotado, no frente a modelos densos de atención completa de tamaño similar; la model card separa explícitamente las tablas de modelos de estado acotado, de retención respecto al modelo origen y de modelos compactos.

## Limitaciones y advertencias

- Licencia personalizada `edgerock-model-license-1.0`: la model card incluye el tag `commercial-use`, pero las condiciones concretas están en el fichero LICENSE y deben revisarse antes de un uso en producción.
- Idiomas: solo inglés y chino; no se declara soporte de castellano ni de otras lenguas.
- No se documentan capacidades de tool calling, function calling ni orquestación de agentes, lo que limita su uso directo en pipelines agénticos.
- No hay artefactos cuantizados publicados (GGUF, AWQ, GPTQ) ni soporte documentado en vLLM, llama.cpp, Ollama o TGI; el despliegue depende del código propio y de una wheel de `transformers` en versión de desarrollo (5.7.0.dev0), lo que introduce riesgo de incompatibilidad.
- La decodificación visual requiere descargar los pesos de visión: el comando de inicio rápido los excluye (`--exclude 'vision/*'`).
- La comparación de razonamiento en AIME se hace contra RWKV-7 G1j (clase 14B), un baseline de estado acotado; no se ofrecen resultados frente a modelos densos de atención completa del mismo tamaño.
- En visión, el modelo retiene el 95,3% de la precisión media de Qwen3.5-4B, es decir, hay una degradación de aproximadamente 4,7 puntos porcentuales respecto al modelo origen.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad; el autor no publica datos de tokens de entrenamiento ni de composición del dataset, lo que dificulta auditar el modelo.
- Las cifras de rendimiento proceden del propio autor y se miden con configuraciones concretas (BF16, lote 1 en el caso de decodificación, mejor lote por modelo en el caso de throughput), por lo que no son directamente trasladables a otros entornos.

## Enlaces

- HuggingFace: https://huggingface.co/rockmatrix-ai/EdgeRock
- arXiv: https://arxiv.org/abs/2610.10118
- GitHub: https://github.com/rockmatrix-ai/EdgeRock
- ModelScope: https://modelscope.cn/models/rockmatrix/EdgeRock
- Informe técnico (inglés): https://huggingface.co/rockmatrix-ai/EdgeRock/blob/main/docs/report/EdgeRock_Technical_Report.pdf
- Informe técnico (chino): https://huggingface.co/rockmatrix-ai/EdgeRock/blob/main/docs/report/EdgeRock_Technical_Report_zh-CN.pdf
- README en chino: https://huggingface.co/rockmatrix-ai/EdgeRock/blob/main/README_zh-CN.md
- Guía de inferencia: USAGE.md en el repositorio del modelo
