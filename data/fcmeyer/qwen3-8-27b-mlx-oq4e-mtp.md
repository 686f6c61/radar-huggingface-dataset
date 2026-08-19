# fcmeyer/Qwen3.8-27B-MLX-oQ4e-mtp

## Resumen

El modelo `fcmeyer/Qwen3.8-27B-MLX-oQ4e-mtp` es una cuantización de 4 bits (oQ4e) del modelo multimodal Qwen3.8-27B, realizada por fcmeyer con la herramienta oMLX 0.5.7. Está diseñado específicamente para ejecutarse en Apple Silicon mediante el framework MLX, ocupando aproximadamente 16 GB de memoria. Su principal innovación es la preservación del cabezal MTP (Multi-Token Prediction) nativo del modelo base, lo que permite decodificación especulativa con una velocidad de generación de unos 54 tokens por segundo en un Apple M5 Max, frente a los 20 tok/s del modelo sin cuantizar.

Este modelo resuelve el problema de desplegar un VLM de 27B parámetros en hardware de consumo, manteniendo la comprensión de imágenes y vídeo gracias a la torre de visión incluida. Es relevante para desarrolladores que trabajan con MLX y necesitan un modelo multimodal eficiente en memoria, con soporte para contexto largo de hasta 262 144 tokens y una calidad de cuantización calibrada con imatrix.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) con vision tower, basado en Qwen3.8-27B |
| Parametros totales | 27B (modelo base); el repo cuantizado reporta 4 926 789 872 en safetensors, posible error de metadata |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | oQ4e (4-bit base, group size 64, affine, imatrix-calibrated, con tensores de sensibilidad elevada a mayor precision y cabezal MTP protegido) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal que combina un codificador de visión con un decodificador de lenguaje, capaz de procesar imágenes y vídeo junto con texto. La cuantización oQ4e se realizó sobre la conversión bf16 del modelo, utilizando oMLX 0.5.7. El proceso incluyó calibración imatrix con 128 muestras de 512 tokens (dataset `oqe_code_multilingual`) y compensación de error guiada por la Hessiana. El cabezal MTP (una capa adicional que predice múltiples tokens futuros) se mantuvo con protección de bits para no degradar su rendimiento, lo que permite la decodificación especulativa en oMLX. No se dispone de información sobre el entrenamiento original del modelo base (datos, tokens, método de alineación).

## Capacidades

- Generación de texto conversacional y completado de instrucciones.
- Comprensión de imágenes y vídeo (verificado el grounding de color y posición).
- Decodificación especulativa MTP con una tasa de aceptación del 81% (2.9 tokens por ciclo de backbone).
- Soporte de contexto largo de hasta 262 144 tokens.
- Carga como VLM cuantizado estándar con mlx-vlm ≥ 0.6.3 (los tensores MTP se ignoran si el cargador no los soporta).
- No se ha confirmado soporte de tool calling ni funciones de agente en la información disponible.

## Casos de uso

- Asistentes visuales en dispositivos Apple: al ser un modelo MLX, puede integrarse en aplicaciones de macOS o iOS para responder preguntas sobre imágenes capturadas por la cámara, con baja latencia gracias a la decodificación MTP.
- Análisis de vídeo en tiempo real: la torre de visión permite procesar secuencias de vídeo para extraer descripciones o detectar objetos, aprovechando el contexto de 262K tokens para mantener historial largo.
- Chat multimodal con memoria extendida: su ventana de contexto de 256K tokens permite mantener conversaciones largas con referencias a imágenes previas, útil en asistentes de documentación técnica.
- Generación de descripciones accesibles: convertir imágenes en texto alternativo para personas con discapacidad visual, ejecutándose en hardware de consumo sin necesidad de GPU dedicada.
- Prototipado rápido de aplicaciones VLM: al ser un modelo cuantizado y ligero (16 GB), permite iterar en entornos de desarrollo con Apple Silicon sin requerir servidores de alto rendimiento.
- Investigación en decodificación especulativa: el cabezal MTP preservado ofrece un caso de estudio para medir el impacto de la cuantización en la predicción multi-token, con métricas documentadas en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Sin embargo, la model card reporta métricas de rendimiento de inferencia medidas en un Apple M5 Max (128 GB) con oMLX 0.5.7:

| Metrica | Valor |
|---|---|
| Velocidad de decodificacion con MTP activado (depth 3) | ~54 tok/s |
| Tasa de aceptacion del draft | 81% |
| Tokens por ciclo de backbone | 2.9 |
| Velocidad del modelo bf16 sin cuantizar (con MTP) | ~20 tok/s |

## Requisitos de hardware

- Memoria necesaria: aproximadamente 16 GB (el repo ocupa 17 GB), por lo que se recomienda un mínimo de 32 GB de memoria unificada en Apple Silicon para dejar margen al sistema operativo y al contexto.
- GPU recomendadas: cualquier chip Apple Silicon con al menos 32 GB de RAM unificada (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max, M4 Pro/Max, M5 Max). No es compatible con GPUs NVIDIA o AMD sin conversión previa a otro formato.
- Opciones de despliegue: oMLX (con soporte MTP) o mlx-vlm ≥ 0.6.3 (sin MTP). No se mencionan opciones para vLLM, llama.cpp u otros frameworks.
- Latencia y throughput: ~54 tok/s en M5 Max con MTP; en chips inferiores la velocidad será menor. No se proporcionan datos de latencia de prefill.

## Comparativa con modelos similares

La comparación más directa es con el modelo base sin cuantizar (bf16) del mismo autor, ya que no se dispone de datos de otros modelos cuantizados similares en MLX.

| Modelo | Tamano | Contexto | Velocidad (M5 Max) | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B-MLX-oQ4e-mtp (este) | ~16 GB (4-bit) | 262 144 | ~54 tok/s con MTP | Apache 2.0 |
| Qwen3.8-27B-MLX-bf16-mtp | ~54 GB (bf16) | 262 144 | ~20 tok/s con MTP | Apache 2.0 |

La cuantización oQ4e reduce el tamaño a un tercio y triplica la velocidad de decodificación, a costa de una posible pérdida de precisión no cuantificada en benchmarks.

## Limitaciones y advertencias

- La cuantización de 4 bits puede degradar la calidad de las respuestas en tareas de razonamiento complejo o generación de código, aunque no se han medido diferencias concretas.
- El modelo está limitado al ecosistema MLX; no es directamente utilizable con otros frameworks de inferencia sin conversión manual.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas del modelo base.
- El número de parámetros reportado en safetensors (4.9B) no coincide con el nombre del modelo base (27B); se recomienda verificar la integridad de los archivos antes de su uso.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener términos adicionales; se debe consultar su ficha oficial.
- El rendimiento de 54 tok/s se midió en un M5 Max específico; en otros chips los resultados variarán.

## Enlaces

- Repositorio del modelo: https://huggingface.co/fcmeyer/Qwen3.8-27B-MLX-oQ4e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Conversión bf16 con MTP: https://huggingface.co/fcmeyer/Qwen3.8-27B-MLX-bf16-mtp
- Herramienta oMLX: https://github.com/jundot/omlx
