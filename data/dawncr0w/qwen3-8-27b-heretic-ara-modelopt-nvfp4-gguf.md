# dawncr0w/Qwen3.8-27B-Heretic-ARA-ModelOpt-NVFP4-GGUF

## Resumen

Este modelo es una conversión a GGUF del checkpoint `PassingByPixels/Qwen3.8-27B-heretic-ara-NVFP4`, que a su vez es una cuantización NVFP4 (W4A4, grupo 16) realizada con NVIDIA ModelOpt sobre el fine-tuning `trohrbaugh/Qwen3.8-27B-heretic-ara`, derivado del modelo base Qwen3.8-27B. La conversión la ha realizado `dawncr0w` con llama.cpp `b10453` y conserva los tensores nativos NVFP4 (`GGML_TYPE_NVFP4`), por lo que la ejecución nativa de FP4 requiere hardware NVIDIA Blackwell (por ejemplo, RTX 5090).

El modelo original Qwen3.8-27B es un transformer denso de 26.9 mil millones de parámetros con ventana de contexto de 262 144 tokens, capacidades de razonamiento configurable y soporte para tareas agénticas y de codificación. Esta versión concreta, sin embargo, es solo texto (no incluye visión ni vídeo) y hereda del checkpoint Heretic ARA una reducción de los guardrails de seguridad, lo que la hace adecuada para entornos de investigación donde se requiera un comportamiento menos restrictivo, pero con las advertencias correspondientes.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de 27B con cuantización FP4 de alta densidad en una GPU consumer de 32 GB, junto con un modelo draft MTP para decodificación especulativa, logrando velocidades de generación notables (hasta 135 tok/s en texto repetitivo) según las mediciones del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B) con atención estándar y razonamiento configurable |
| Parametros totales | 26 895 999 264 (≈26.9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (nativo del modelo base; en esta conversión se ha validado con 262 144 asignados) |
| Tipos de cuantizacion | NVFP4 (W4A4, grupo 16) para el modelo principal; Q4_K_M para el modelo draft MTP |
| Idiomas soportados | No disponible (la model card no especifica; el modelo base Qwen3.8-27B es multilingüe, pero no se ha confirmado para esta conversión) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con tensores nativos NVFP4 y tensores adicionales; incluye también un archivo GGUF Q4_K_M para el draft MTP) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con atención de ventana completa, diseñado para razonamiento configurable (modo thinking opcional) y tareas agénticas de largo horizonte. Su entrenamiento original incluye datos de texto e imágenes, pero esta conversión GGUF es exclusivamente de texto; los pesos de visión no se han incluido.

El checkpoint Heretic ARA se obtuvo mediante un proceso de ajuste denominado ARA (del que no se aportan detalles técnicos en la documentación disponible) sobre el modelo base, con el objetivo de reducir los guardrails de seguridad. La model card indica que es un checkpoint ARA de una sola pasada, con una divergencia KL reportada de 0.0535 respecto al modelo original. Posteriormente, `PassingByPixels` aplicó cuantización NVFP4 con NVIDIA ModelOpt (W4A4, grupo 16) y `dawncr0w` lo convirtió a GGUF usando llama.cpp `b10453` con la opción `--outtype auto --no-nextn`, preservando los tensores NVFP4 nativos. El modelo draft MTP (multi-token prediction) es una conversión Q4_K_M del head MTP original de Qwen3.8-27B, compatible con derivados del modelo base y no entrenado sobre los pesos Heretic.

No se dispone de información sobre el dataset de entrenamiento específico del fine-tuning Heretic ARA, ni sobre el número de tokens utilizados.

## Capacidades

- Generación de texto en inglés y otros idiomas (el modelo base es multilingüe, aunque no se ha verificado el alcance en esta conversión).
- Razonamiento configurable: permite activar o desactivar el modo thinking mediante `chat_template_kwargs` (`enable_thinking`).
- Decodificación especulativa mediante modelo draft MTP, acelerando la generación en cargas de trabajo de código y texto repetitivo.
- Soporte de la API compatible con OpenAI (probado: autenticación, start/stop, liberación de VRAM).
- Capacidades de codificación: validado con generación de código Python, alcanzando alta tasa de aceptación MTP (87.23%).
- No incluye capacidades de visión ni vídeo (conversión solo texto).
- No se ha confirmado soporte de tool calling o function calling en esta conversión específica, aunque el modelo base Qwen3.8-27B lo incluye.

## Casos de uso

- Asistente de codificación local: con la decodificación especulativa MTP y la cuantización NVFP4, el modelo puede ejecutarse en una RTX 5090 y generar código Python a ~124 tok/s, útil para autocompletado y generación de fragmentos en entornos de desarrollo sin conexión.
- Investigación en alineación y seguridad: al ser una variante con guardrails reducidos, permite estudiar comportamientos del modelo sin restricciones de seguridad, siempre en entornos controlados y con fines académicos.
- Generación de texto creativo o narrativo: su contexto largo (262K tokens) y la capacidad de desactivar el razonamiento permiten mantener hilos conversacionales o documentos extensos con coherencia.
- Prototipado de agentes conversacionales: la API OpenAI-compatible y el modo thinking configurable facilitan la integración en pipelines de agentes que requieren razonamiento multi-paso.
- Procesamiento de documentos largos: con la ventana de 262K tokens, puede resumir o extraer información de corpus extensos, aunque la atención de contexto completo sigue siendo costosa.
- Despliegue en hardware consumer de gama alta: la cuantización FP4 permite ejecutar un modelo de 27B en una GPU de 32 GB, lo que habilita aplicaciones de inferencia local en estaciones de trabajo sin necesidad de hardware de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K, etc.) para esta conversión GGUF específica. La model card solo proporciona mediciones de throughput en una RTX 5090 con llama.cpp `b10453`, que se resumen a continuación (mediciones de humo, no comparativas generales):

| Carga de trabajo | Velocidad de generación (tok/s) | Aceptación MTP | Longitud media de draft |
|---|---|---|---|
| Prosa coreana, 512 tokens | 72.80 | 37.26% | 2.12 |
| Código Python, 512 tokens | 124.39 | 87.23% | 3.62 |
| Texto repetitivo, 512 tokens | 135.76 | 98.20% | 3.93 |

Además, un prompt de recuperación de 9476 tokens completó sin OOM a 68.17 tok/s de prefill y 21.09 tok/s de generación.

## Requisitos de hardware

- VRAM estimada: aproximadamente 27.22 GB en carga (27.25 GB tras la petición) según la validación en RTX 5090.
- GPU recomendada: NVIDIA Blackwell (RTX 5090 32 GB) para ejecución nativa de FP4. En otras GPUs, la ejecución de tensores NVFP4 no está soportada nativamente; se requeriría una conversión adicional a otros formatos de cuantización.
- No cabe en GPUs consumer de 16 GB o menos con esta cuantización específica; se necesitaría una versión con cuantización de menor precisión (por ejemplo, Q4_K_M del modelo completo, que no está disponible en este repositorio).
- Opciones de despliegue: llama.cpp (llama-server) con soporte de Qwen3.8, NVFP4 y draft-MTP. También compatible con la API OpenAI de llama-server.
- Latencia y throughput: en RTX 5090, entre 72 y 136 tok/s según la carga, con draft MTP activado. Sin MTP, el rendimiento sería menor (no se han publicado datos).

## Comparativa con modelos similares

La comparación se realiza con el modelo base original y con otra conversión GGUF del mismo checkpoint Heretic ARA, ya que no hay alternativas directas con cuantización NVFP4 en GGUF.

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 26.9B | 262K | BF16/FP8 | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-heretic-ara-NVFP4 (PassingByPixels) | 26.9B | 262K | NVFP4 (ModelOpt) | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-heretic-ara-Q8_0-GGUF (drmcbride) | 26.9B | 262K | Q8_0 | Apache 2.0 | Hugging Face |
| Este modelo (dawncr0w) | 26.9B | 262K | NVFP4 + MTP Q4_K_M | Apache 2.0 | Hugging Face |

La principal diferencia frente a la versión Q8_0 es el tamaño del archivo (20.9 GB frente a aproximadamente 27 GB) y la necesidad de hardware Blackwell para ejecución nativa. Frente al modelo base, esta conversión hereda guardrails reducidos y no incluye visión.

## Limitaciones y advertencias

- Guardrails de seguridad reducidos: el checkpoint Heretic ARA elimina o debilita los mecanismos de rechazo de contenido dañino. Su uso en producción o en aplicaciones públicas requiere una evaluación cuidadosa de los riesgos.
- Solo texto: no incluye capacidades de visión ni vídeo, a pesar de que el modelo base Qwen3.8-27B es multimodal.
- Cuantización con pérdida: la conversión NVFP4 y el draft MTP Q4_K_M introducen degradación respecto al modelo en BF16. No se ha ejecutado una evaluación académica completa para cuantificar esta pérdida.
- Requisitos de hardware específicos: la ejecución nativa de FP4 exige NVIDIA Blackwell; en otras arquitecturas no funcionará sin conversión adicional.
- Contexto largo costoso: asignar 262K tokens no acelera el prefill; la atención de ventana completa sigue siendo computacionalmente cara.
- El modelo draft MTP no está entrenado sobre los pesos Heretic, por lo que la tasa de aceptación puede variar en dominios diferentes a los validados.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, etc.) para esta conversión concreta, por lo que su rendimiento real en tareas estándar no está verificado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dawncr0w/Qwen3.8-27B-Heretic-ARA-ModelOpt-NVFP4-GGUF
- Checkpoint base NVFP4: https://huggingface.co/PassingByPixels/Qwen3.8-27B-heretic-ara-NVFP4
- Checkpoint Heretic ARA (BF16): https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Conversión MTP-only GGUF: https://huggingface.co/a4lg/Qwen3.8-27B-MTP-ONLY-GGUF
- Documentación de llama.cpp: https://github.com/ggml-org/llama.cpp
- Referencia de Qwen3.8 en Unsloth: https://unsloth.ai/docs/models/qwen3.8
- Referencia de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
