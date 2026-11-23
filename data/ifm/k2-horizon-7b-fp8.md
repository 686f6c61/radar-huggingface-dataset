# IFM/K2-Horizon-7B-FP8

## Resumen

K2-Horizon-7B-FP8 es la versión cuantizada en FP8 del modelo K2-Horizon-7B, un modelo denso decoder-only de 7B desarrollado por IFM (Integrated Frontier Models). Se trata del miembro intermedio de la familia K2-Horizon y su principal seña de identidad es una ventana de contexto nativa de 512K tokens (524.288), mantenida desde las etapas de midtraining. El modelo se distribuye con pesos abiertos bajo licencia Apache 2.0, junto con los datos de entrenamiento, el código de entrenamiento y los recursos de evaluación.

La relevancia de esta variante FP8 radica en que reduce la huella de memoria del modelo original en BF16 y habilita inferencia más rápida en hardware con soporte FP8, manteniendo un rendimiento "estrechamente en línea" con el modelo BF16 según las evaluaciones del autor. La cuantización afecta a todas las capas lineales excepto `lm_head`. El modelo está orientado a cargas agénticas, generación de código, contexto largo y razonamiento, y se publica junto con checkpoints intermedios para estudiar la evolución de capacidades a lo largo del entrenamiento.

El repositorio acumula 410 descargas y 19 likes en Hugging Face, con un tamaño de 11,1 GB y 8.999.178.240 parámetros totales según los safetensors. La información pública disponible sobre arquitectura interna, composición del dataset y proceso de alineación es limitada; los detalles no confirmados se indican como "no disponible" a lo largo de esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia k2_horizon) |
| Parámetros totales | 8.999.178.240 (~9B, etiquetado comercialmente como 7B) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 524.288 tokens (512K), nativa desde midtraining |
| Tipos de cuantización | FP8 (pesos estáticos, escala por bloque 128×128; activaciones dinámicas, escala por grupo 1×128 en el eje de canales de entrada) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), integración vía transformers con `custom_code` |
| Modelo base | IFM/K2-Horizon-7B (relación: quantized) |
| Capas cuantizadas | todas las lineales excepto `lm_head` |
| Tamaño del repo | 11,1 GB |

## Arquitectura y entrenamiento

K2-Horizon-7B-FP8 es una cuantización del checkpoint BF16 IFM/K2-Horizon-7B, un transformer decoder-only denso de aproximadamente 9.000 millones de parámetros. La innovación técnica más destacable del modelo base es su contexto nativo de 524.288 tokens, introducido desde las etapas de midtraining en adelante, lo que lo sitúa en la gama alta de longitud de contexto para su tamaño. El autor publica checkpoints intermedios para permitir el estudio de la evolución de capacidades durante el entrenamiento, algo poco habitual en modelos de esta escala.

En cuanto al proceso de cuantización, los pesos se almacenan en FP8 estático con una escala por cada bloque de 128×128, mientras que las activaciones se cuantizan dinámicamente en FP8 con una escala por cada grupo de 1×128 a lo largo de la dimensión de canales de entrada. La capa `lm_head` se mantiene sin cuantizar. El modelo se distribuye en formato `compressed-tensors` y requiere `transformers` con código personalizado (`custom_code`).

Sobre los datos de entrenamiento, la model card referencia los datasets IFM/K2-Horizon-Pretrain-Data e IFM/K2-Horizon-Midtrain-Data, así como un repositorio público de navegación de datos (DATA_NAVIGATOR). No se especifican en la información disponible el número total de tokens, la composición detallada del corpus ni si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento matemático, incluyendo matemáticas de competición (evaluado en HMMT Feb 2026).
- Generación y resolución de código, con evaluación en ingeniería de software (SWE-bench Verified).
- Procesamiento de contexto largo: ventana nativa de 512K tokens, adecuada para documentos extensos y conversaciones multi-turno prolongadas.
- Evaluación en benchmarks agénticos y de razonamiento según la model card.
- Pesos abiertos con datos y receta de entrenamiento públicos, lo que facilita la reproducibilidad y el ajuste fino.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible.
- Modo thinking explícito: no disponible.

## Casos de uso

- Análisis de repositorios de código completos: con 512K tokens de contexto, el modelo puede ingerir múltiples ficheros y trazas de error en una sola pasada para localizar la causa de un fallo o proponer refactorizaciones, sin necesidad de trocear el código en fragmentos.
- Agente de ingeniería de software: su resultado en SWE-bench Verified (70,6) lo hace adecuado para pipelines que reciben un issue, navegan por el repositorio y generan un parche candidato que luego se valida en CI/CD.
- Asistencia en matemáticas y razonamiento formal: útil para herramientas educativas o de verificación que requieren resolver problemas de competición o demostraciones paso a paso, dado su rendimiento en HMMT Feb 2026.
- Procesamiento de documentación legal o técnica extensa: la ventana de 512K permite resumir contratos, manuales o expedientes completos manteniendo coherencia entre secciones, algo inviable en modelos con contexto de 8K-32K.
- Despliegue en infraestructura con aceleradores FP8: en GPUs con soporte FP8 (H100, H200, L40S), la variante cuantizada reduce la memoria necesaria y acelera la inferencia respecto al BF16, lo que abarata el coste por token en servicios de generación de texto.
- Investigación sobre entrenamiento y cuantización: la publicación de checkpoints intermedios, datos y código de entrenamiento permite estudiar cómo evolucionan las capacidades y cómo afecta la cuantización FP8 al rendimiento en distintas etapas.
- Base para ajuste fino supervisado: al ser Apache 2.0 y estar en formato `transformers`, puede adaptarse a dominios verticales (soporte técnico, generación de documentación) con LoRA o fine-tuning completo.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor. Las referencias son modelos comparables seleccionados por IFM; el resto de filas de la tabla original no están disponibles en la información proporcionada.

| Benchmark | K2-Horizon-7B | Gemma 4-12B | Qwen3.5-9B | Granite 4.2-8B |
|---|---|---|---|---|
| HMMT Feb 2026 (matemáticas de competición) | 73,3 | 63,1 | 65,7 | 66,5 |
| SWE-bench Verified (ingeniería de software) | 70,6 | 30,6 | no disponible | 47,7 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks de contexto largo, ni mediciones comparativas entre la variante FP8 y el modelo BF16 original más allá de la afirmación cualitativa del autor de que el rendimiento FP8 está "estrechamente en línea" con BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP8, los pesos ocupan aproximadamente 9 GB (11,1 GB de repo incluyendo metadatos y posibles tensores no cuantizados); con overhead de activaciones y caché KV para contexto largo, se recomienda un mínimo de 16-24 GB para contextos moderados.
- Contexto largo: la caché KV para 512K tokens es el factor dominante de memoria; con arquitecturas GQA estándar y 9B parámetros, puede requerir decenas de GB adicionales, por lo que el contexto completo exige GPUs de 80 GB o configuraciones multi-GPU.
- GPUs recomendadas: H100, H200 y L40S por su soporte nativo de FP8; A100 no dispone de aceleración FP8 por hardware, por lo que ejecutaría el modelo con conversión a BF16/FP16.
- GPU de consumo: cabe en RTX 4090 (24 GB) para contextos cortos o moderados; en RTX 3090/4080 (16-24 GB) es viable con contextos reducidos.
- Opciones de despliegue: `transformers` (requerido, con `custom_code`), vLLM y TGI para servir en producción con soporte FP8; llama.cpp y Ollama no están confirmados para este formato `compressed-tensors`.
- Latencia y throughput: no disponibles en la información proporcionada; el autor indica únicamente que FP8 habilita inferencia más rápida en hardware compatible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HMMT Feb 2026 | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| K2-Horizon-7B-FP8 | ~9B (denso) | 512K | 73,3 | 70,6 | Apache 2.0 |
| Gemma 4-12B | 12B | no disponible | 63,1 | 30,6 | no disponible |
| Qwen3.5-9B | 9B | no disponible | 65,7 | no disponible | no disponible |
| Granite 4.2-8B | 8B | no disponible | 66,5 | 47,7 | no disponible |

K2-Horizon-7B-FP8 lidera en las dos métricas publicadas frente a los tres modelos de referencia, con una ventaja especialmente amplia en SWE-bench Verified (70,6 frente a 47,7 del siguiente mejor). La comparación está limitada por la ausencia de datos de contexto, licencia y otros benchmarks para los modelos de referencia en la información disponible.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al entrenarse sobre un corpus no especificado, puede heredar sesgos presentes en los datos.
- Alucinación: no se publican tasas de alucinación ni evaluaciones de factualidad; como todo modelo generativo, requiere verificación en aplicaciones críticas.
- Cuantización FP8: aunque el autor afirma que el rendimiento está en línea con BF16, no se publican comparativas numéricas por benchmark entre ambas variantes; conviene validar la tarea concreta antes de migrar de BF16 a FP8.
- Contexto largo: el rendimiento efectivo en los 512K tokens no está respaldado por benchmarks de contexto largo publicados; la degradación en posiciones intermedias o finales es un riesgo a testear.
- Licencia: Apache 2.0 permite uso comercial, pero deben conservarse los avisos de licencia y atribución; los datasets de entrenamiento pueden tener sus propias condiciones.
- Producción: el modelo requiere `transformers` con `custom_code` y formato `compressed-tensors`, lo que limita la compatibilidad con algunos runners; verificar el soporte en la versión de vLLM/TGI utilizada.
- Memoria: el contexto completo de 512K es inviable en GPUs de consumo por el tamaño de la caché KV.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IFM/K2-Horizon-7B-FP8
- Modelo base (BF16): https://huggingface.co/IFM/K2-Horizon-7B
- Código de entrenamiento: https://github.com/ifm-ai/xllm
- Código de evaluación: https://github.com/ifm-ai/Eval360
- Navegador de datos de entrenamiento: https://github.com/ifm-ai/DATA_NAVIGATOR
- Dataset de pretraining: https://huggingface.co/datasets/IFM/K2-Horizon-Pretrain-Data
- Dataset de midtraining: https://huggingface.co/datasets/IFM/K2-Horizon-Midtrain-Data
