# dbrasdasilva/Qwen3.8-27B-Text-NVFP4-MTP

## Resumen

Este repositorio contiene una versión cuantizada en NVFP4 y solo texto del modelo Qwen/Qwen3.8-27B, desarrollada por dbrasdasilva como un experimento para evaluar el impacto de eliminar la torre de visión y añadir una cabeza MTP (Multi-Token Prediction) en la inferencia sobre hardware NVIDIA Blackwell (SM120). El modelo base es un transformer multimodal de 27 mil millones de parámetros, pero este build elimina físicamente los tensores de visión y reincorpora los 15 tensores MTP en bf16, lo que permite la decodificación especulativa en vLLM. El resultado es un artefacto de solo texto con un tamaño de descarga aproximadamente 0,95 GB menor que el build multimodal equivalente, pero con el mismo rendimiento en contexto y velocidad cuando se ejecuta en modo solo lenguaje.

La relevancia de este modelo radica en que responde a una pregunta práctica: en una GPU de 32 GB como la RTX 5090, ¿merece la pena eliminar la torre de visión para ganar contexto o velocidad? La respuesta del autor es que no, ya que vLLM ya omite la torre en tiempo de ejecución con la opción `--language-model-only`. No obstante, el repositorio se publica con fines de reproducibilidad y para quienes necesiten un artefacto exclusivamente textual con una descarga ligeramente menor. El modelo está licenciado bajo Apache 2.0 y soporta 11 idiomas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.8-27B) con torre de visión eliminada y cabeza MTP en bf16 |
| Parametros totales | 15.145.419.776 (según safetensors; el modelo base declara 27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta ~200.000 tokens (condicionado a memoria y configuración de vLLM) |
| Tipos de cuantizacion | NVFP4 (group_size 16) para la mayoría de pesos; lm_head, conv1d de atención lineal, MTP y tensores de visión (eliminados) en bf16 |
| Idiomas soportados | en, zh, ja, ko, fr, de, es, it, pt, ru, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (exportado con NVIDIA ModelOpt) |

## Arquitectura y entrenamiento

El modelo es una cuantización NVFP4 del Qwen3.8-27B original, realizada con NVIDIA ModelOpt 0.43.0. La arquitectura base es un transformer con atención lineal (gated delta net) y capacidades multimodales, pero en este build se eliminan físicamente los tensores de la torre de visión (`model.visual.*`) y se reincorporan los 15 tensores de la cabeza MTP en bf16. La cuantización NVFP4 utiliza un group size de 16 y mantiene en bf16 el `lm_head`, las capas `*linear_attn.conv1d*` y los tensores MTP para preservar la precisión en la decodificación especulativa.

No se ha realizado ningún entrenamiento adicional; se trata de una conversión de pesos. El modelo se exportó en formato ModelOpt para el camino nativo NVFP4 en GPUs Blackwell (SM120). La cabeza MTP permite la decodificación especulativa en vLLM, lo que acelera la generación aproximadamente 1,6 veces en comparación con MTP desactivado, a costa de reducir el contexto máximo disponible por el mayor uso de memoria.

## Capacidades

- Generación de texto y conversación multi-turno en 11 idiomas (incluido español).
- Razonamiento y resolución de problemas matemáticos y lógicos, heredados del modelo base.
- Generación de código y comprensión de lenguajes de programación.
- Decodificación especulativa mediante MTP, que acelera la inferencia sin degradar la calidad del texto.
- Soporte de tool calling y function calling (si el modelo base lo soporta, aunque no se detalla en la model card).
- Capacidad de manejar contextos muy largos (hasta ~200K tokens) con la configuración adecuada de vLLM y memoria suficiente.
- Solo texto: no procesa imágenes ni otros inputs multimodales.

## Casos de uso

- Asistentes conversacionales de largo alcance: gracias a su ventana de contexto de hasta 200K tokens, puede mantener conversaciones extensas con historial completo, útil para atención al cliente o asistentes personales.
- Generación de código en entornos de desarrollo: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar, revisar o documentar código.
- Análisis de documentos largos: puede resumir o extraer información de documentos de decenas de miles de tokens, como informes técnicos o artículos científicos.
- Traducción automática multilingüe: cubre 11 idiomas, incluyendo español, inglés, chino, japonés, etc.
- Razonamiento matemático y lógico: adecuado para tutorías automáticas o sistemas de resolución de problemas.
- Experimentación con decodificación especulativa: sirve como banco de pruebas para medir el impacto de MTP en velocidad y consumo de memoria en GPUs Blackwell.
- Despliegue en entornos con restricciones de descarga: al ser ~1 GB más pequeño que el build multimodal, es útil cuando el ancho de banda o el almacenamiento son limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, la model card incluye mediciones de rendimiento de inferencia en una RTX 5090 (32 GB) con vLLM 0.27.2, en una tarjeta compartida con el escritorio (~2 GB ocupados) y con la variable `VLLM_MEMORY_PROFILER_ESTIMATE_CUDAGRAPHS=0`:

| Modo de servicio | Contexto máximo | Decodificación (tok/s) |
|---|---|---|
| Multimodal, visión activada, MTP desactivado | ~199K | ~77 |
| Multimodal, visión activada, MTP activado | ~123K | ~125–135 |
| Multimodal, solo lenguaje (`--language-model-only`), MTP activado | ~200K | ~130–140 |
| Este build (solo texto), MTP activado | ~200K | ~130–140 |

Estos valores son conservadores por la tarjeta compartida; en una GPU dedicada se espera un mejor rendimiento. Sin la variable de entorno, el contexto máximo se reduce a ~185–188K.

## Requisitos de hardware

- GPU obligatoria: NVIDIA Blackwell (SM120) para el camino nativo NVFP4. No funciona en GPUs Ampere o anteriores.
- VRAM recomendada: 32 GB para alcanzar ~200K de contexto con MTP activado y fp8 KV cache. Con 24 GB el contexto máximo sería menor.
- GPU específica: RTX 5090 (32 GB) es la utilizada en las pruebas. También podría funcionar en B200 u otras Blackwell con suficiente memoria.
- Opciones de despliegue: vLLM ≥ 0.27.2 (requiere el fix de gated-delta-net para MTP en contextos largos). No se menciona soporte en llama.cpp u otros runners.
- Configuración recomendada: `--quantization modelopt`, `--language-model-only`, `--kv-cache-dtype fp8`, `--gpu-memory-utilization 0.93`, `--max-num-seqs 1`, y la variable `VLLM_MEMORY_PROFILER_ESTIMATE_CUDAGRAPHS=0` para maximizar el contexto.
- Latencia y throughput: en las pruebas, la decodificación alcanza ~130–140 tok/s con MTP activado y ~77 tok/s sin MTP, en una tarjeta compartida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 27B | No especificado (presumiblemente 256K) | bf16 | Apache 2.0 | Multimodal, sin MTP |
| dbrasdasilva/Qwen3.8-27B-Text-NVFP4-MTP (este) | 15.1B (según safetensors) | ~200K (con config) | NVFP4 | Apache 2.0 | Solo texto, MTP, requiere Blackwell |
| Build multimodal NVFP4 del mismo autor (mencionado en la model card) | No especificado | ~199K (sin MTP) / ~123K (con MTP) | NVFP4 | Apache 2.0 | Multimodal, MTP opcional, mismo rendimiento en modo texto |

La comparativa se limita a los modelos mencionados en la documentación. No se dispone de datos de otros modelos cuantizados similares.

## Limitaciones y advertencias

- Es un experimento, no un modelo de producción. El propio autor recomienda usar el build multimodal completo en lugar de este.
- La cuantización NVFP4 puede introducir pérdida de precisión respecto al modelo en bf16, aunque no se han publicado evaluaciones de calidad.
- Requiere hardware Blackwell (SM120); no es compatible con GPUs más antiguas.
- El contexto máximo de ~200K depende de la memoria disponible y de la configuración de vLLM; en una tarjeta compartida o sin la variable de entorno adecuada, se reduce a ~185–188K.
- Al eliminar la torre de visión, el modelo no puede procesar imágenes, aunque el modelo base sí podría.
- La cabeza MTP consume memoria de KV cache, reduciendo el contexto máximo si se activa (de ~199K a ~123K en el build multimodal).
- No se han publicado benchmarks de calidad (MMLU, HumanEval, etc.), por lo que se desconoce el impacto exacto de la cuantización en tareas específicas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.

## Enlaces

- Repositorio del modelo: https://huggingface.co/dbrasdasilva/Qwen3.8-27B-Text-NVFP4-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentación de vLLM (para el despliegue): https://docs.vllm.ai
- NVIDIA ModelOpt (herramienta de cuantización): https://github.com/NVIDIA/TensorRT-Model-Optimizer
