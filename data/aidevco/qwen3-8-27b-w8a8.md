# aidevco/Qwen3.8-27B-W8A8

## Resumen

Qwen3.8-27B-W8A8 es una cuantización INT8 del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario aidevco. No se trata de un modelo nuevo ni de un entrenamiento adicional: es el mismo checkpoint original con los pesos del decodificador y de las proyecciones de atención completa reducidos a int8, mientras que las capas recurrentes Gated DeltaNet, las normas, los embeddings, el `lm_head`, la cabeza MTP y el torreón de visión permanecen en bf16. El objetivo declarado es servir el modelo en una única tarjeta AMD Instinct MI210 (gfx90a, 64 GB), que carece de núcleos matriciales FP8 y por tanto solo puede ejecutar 8 bits mediante INT8 W8A8.

El modelo base es un transformer híbrido de Qwen con 27.781.427.952 parámetros totales (aproximadamente 27,8 mil millones), que combina 16 capas de atención completa con 48 capas Gated DeltaNet (atención lineal recurrente) y un torreón de visión, lo que le confiere capacidades image-text-to-text. La cuantización afecta a 256 módulos (MLP y proyecciones q/k/v/o de las capas de atención completa) y reduce el repositorio a 36,8 GB en 18 shards, frente a los aproximadamente 55 GB del checkpoint en bf16.

Su relevancia es fundamentalmente de despliegue: demuestra que un modelo de ~28B con contexto largo (hasta 131.072 tokens en la configuración probada) puede ejecutarse en hardware AMD de gama de centro de datos sin FP8, con decodificación especulativa MTP activada y un rendimiento medido de 24,5 a 86,4 tokens de salida por segundo según concurrencia. La licencia Apache 2.0 del original se mantiene.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 16 capas de atención completa + 48 capas Gated DeltaNet (atención lineal), con torreón de visión y cabeza MTP |
| Parámetros totales | 27.781.427.952 (~27,8B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens verificados en la configuración de servicio; capacidad de KV cache de 175.006 tokens en MI210 con `--gpu-memory-utilization=0.90` |
| Tipos de cuantización | INT8 W8A8: pesos int8 simétricos per-channel, activaciones int8 dinámicas per-token (formato compressed-tensors `int-quantized`); resto en bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (18 shards, 36,8 GB), compatible con compressed-tensors y transformers |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina atención completa tradicional en 16 capas con 48 capas Gated DeltaNet, un mecanismo de atención lineal con estado recurrente. Esta hibridación reduce el coste de atención en contextos largos manteniendo la capacidad de recuperación exacta en las capas de atención completa. El modelo incluye además un torreón de visión (pipeline image-text-to-text) y una cabeza MTP (multi-token prediction) que el autor conserva en bf16 expresamente para habilitar decodificación especulativa.

Esta publicación no entrena ni ajusta el modelo: es una cuantización data-free ejecutada con llm-compressor 0.14.0 (`model_free_ptq`) y compressed-tensors 0.19.0, en CPU, a partir de la revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` del repositorio original. Los escalas de pesos se obtienen con un observador `memoryless-mse` y las de activaciones se calculan en tiempo de ejecución por token. Se cuantizaron 256 módulos: `gate_proj`, `up_proj` y `down_proj` de las 64 capas, y `q_proj`, `k_proj`, `v_proj` y `o_proj` de las 16 capas de atención completa. Las 48 capas `linear_attn` (Gated DeltaNet) se mantienen en bf16 porque su estado recurrente es sensible a la precisión. El proceso es determinista: tres builds de la misma revisión produjeron los mismos 1.455 tensores y 36,8 GB, en 14 minutos con dos procesos trabajadores.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat copiada sin cambios del modelo original.
- Razonamiento explícito con modo thinking, soportado por el parser `qwen3` en vLLM.
- Generación de código, con parser de tool calling `qwen3_coder` y verificación de una llamada a herramienta `get_weather` en las pruebas del autor.
- Razonamiento matemático (resultados de gsm8k y minerva algebra en la sección de benchmarks).
- Entrada image-text-to-text por herencia del modelo base, aunque la configuración de servicio probada desactiva imagen y vídeo (`--limit-mm-per-prompt='{"image":0,"video":0}'`).
- Decodificación especulativa mediante la cabeza MTP, con 3 tokens especulativos configurados.
- Soporte de contexto largo: hasta 131.072 tokens en la configuración de referencia, con capacidad de KV cache de 175.006 tokens.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia conversacional de contexto largo: con 131.072 tokens de ventana y 175.006 tokens de KV cache en una MI210, el modelo puede mantener conversaciones o procesar documentos extensos sin truncar, con un throughput de 24,5 tokens/s a concurrencia 1.
- Generación de código en pipelines internos: el parser `qwen3_coder` y la puntuación de 0,92 en humaneval (chat) lo hacen adecuado para autocompletado y revisión de código en entornos con hardware AMD, donde FP8 no está disponible.
- Agentes con tool calling: la verificación de una llamada `get_weather` y el soporte de razonamiento multi-paso con thinking mode permiten construir agentes que encadenen herramientas, aunque el autor solo valida un caso simple.
- Razonamiento matemático asistido: con 0,96 en gsm8k y 0,74 en minerva algebra (50 muestras, thinking on), es utilizable para tutoría o verificación de cálculos, con la cautela de que son comprobaciones de sanidad, no benchmarks completos.
- Despliegue en infraestructura AMD existente: el caso de uso principal declarado es servir un modelo de ~28B en una sola MI210 sin migrar a NVIDIA ni a hardware con FP8, usando vLLM con `TritonInt8ScaledMMLinearKernel`.
- Evaluación comparativa de cuantizaciones: al ser determinista y reproducible (mismos 1.455 tensores en tres builds), sirve como referencia para medir el impacto de INT8 W8A8 frente a bf16 en este modelo.
- Procesamiento de documentos con imagen: el pipeline es image-text-to-text, por lo que puede habilitarse visión retirando la restricción `--limit-mm-per-prompt`, aunque el autor no reporta pruebas con imagen activada.

## Benchmarks y rendimiento

Resultados medidos por el autor en una MI210 con decodificación especulativa MTP (3 tokens), vLLM v0.31.0 salvo indicación, 50 muestras por tarea y thinking activado:

| Tarea | Resultado |
|---|---|
| gsm8k | 0,96 |
| minerva algebra | 0,74 |
| humaneval (chat) | 0,92 |
| mbpp (chat) | 0,88 |

Rendimiento de servicio en la misma tarjeta:

| Métrica | Concurrencia 1 | Concurrencia 2 | Concurrencia 4 |
|---|---|---|---|
| Tokens de salida/s (1.536 prompt / 128 salida) | 24,5 | 43,7 | 86,4 |
| Tiempo por token de salida (ms) | 41,6 | 47,0 | 45,3 |

El autor indica que estas puntuaciones son una comprobación de sanidad (±0,03-0,06 de variación) y no un benchmark completo. Una build INT8 comunitaria publicada del mismo modelo rindió 23,5 / 41,9 / 84,2 tokens/s en la misma tarjeta y día, dentro del ruido. No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- VRAM estimada: 33,5 GiB de pesos en la MI210 según medición del autor; el repositorio ocupa 36,8 GB en disco.
- GPU recomendadas: AMD Instinct MI210 (gfx90a, 64 GB), única tarjeta probada. El formato INT8 W8A8 con `TritonInt8ScaledMMLinearKernel` está pensado para hardware AMD sin núcleos FP8.
- GPU consumer: no hay datos de despliegue en GPU consumer en la información proporcionada; 33,5 GiB de pesos exceden la VRAM de la mayoría de tarjetas de consumo actuales.
- Opciones de despliegue: vLLM v0.31.0, v0.32.0 y v0.33.0 en ROCm, con detección automática de la cuantización (no pasar `--quantization`). El log de arranque debe nombrar `TritonInt8ScaledMMLinearKernel for CompressedTensorsW8A8Int8`. No se documentan otras opciones (llama.cpp, Ollama, TGI).
- Latencia y throughput: 41,6 ms por token de salida a concurrencia 1; 24,5 tokens/s a concurrencia 1, 43,7 a 2 y 86,4 a 4. Capacidad de KV cache de 175.006 tokens (176.471 en v0.32.0), lo que da 1,34x de concurrencia a 131.072 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aidevco/Qwen3.8-27B-W8A8 | ~27,8B | 131.072 tokens (config. probada) | INT8 W8A8, resto bf16 | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.8-27B (base) | ~27,8B | No disponible en la información | bf16 (~55 GB) | Apache 2.0 | HuggingFace |
| Build INT8 comunitaria del mismo modelo | ~27,8B | No disponible | INT8 | No disponible | Mencionada por el autor, sin enlace |

No se dispone de datos de benchmarks completos ni de especificaciones de contexto del modelo base en la información proporcionada, por lo que la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- La cuantización modifica la precisión numérica de 256 módulos; el autor solo verifica la calidad con 50 muestras por tarea (±0,03-0,06), insuficiente para descartar degradación en dominios específicos.
- Las capas Gated DeltaNet permanecen en bf16, de modo que el ahorro de memoria es parcial (36,8 GB frente a ~55 GB) y el rendimiento depende del kernel Triton int8 en gfx90a.
- Solo se ha probado en una AMD MI210 con vLLM en ROCm; no hay validación en NVIDIA, GPU consumer ni otros motores de inferencia.
- La configuración de servicio de referencia desactiva imagen y vídeo, pese a que el pipeline es image-text-to-text; las capacidades de visión no están verificadas en esta build.
- No se dispone de información sobre idiomas soportados ni sobre sesgos del modelo base en esta ficha; deben consultarse en la model card original.
- Riesgo de alucinación inherente al modelo base, no evaluado específicamente tras la cuantización.
- Licencia Apache 2.0 permite uso comercial, pero el autor advierte que no es un lanzamiento oficial de Qwen y que el equipo Qwen no ha revisado ni respaldado esta build.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de la comunidad.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/aidevco/Qwen3.8-27B-W8A8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia Apache 2.0 incluida en el repositorio: https://huggingface.co/aidevco/Qwen3.8-27B-W8A8/blob/main/LICENSE
- llm-compressor: https://github.com/vllm-project/llm-compressor
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- vLLM: https://github.com/vllm-project/vllm
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
