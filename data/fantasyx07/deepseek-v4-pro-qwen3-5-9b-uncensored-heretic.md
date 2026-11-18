# fantasyx07/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es un ajuste fino del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, que a su vez es un fine-tune de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El autor, fantasyx07, ha aplicado la herramienta Heretic v2.0.0.dev0 para eliminar los comportamientos de rechazo del modelo original, dando lugar a una variante "abliterated" con licencia Apache 2.0 y 9.409.813.744 parámetros.

El modelo hereda del linaje Qwen3.5 la arquitectura transformer multimodal (etiqueta image-text-to-text) y una orientación clara hacia el razonamiento matemático y STEM, con aproximadamente 250.000 muestras de entrenamiento supervisado centradas en estas áreas. La intervención de Heretic utiliza una técnica de ablación de rango arbitrario (ARA) sobre las capas 9 a 24, con parámetros de preservación de comportamiento correcto y corrección de comportamiento indeseado documentados por el autor.

La relevancia de esta ficha radica en dos aspectos: por un lado, ofrece una vía para estudiar el efecto de la ablación de rechazos sobre un modelo de razonamiento compacto; por otro, su licencia permisiva y su tamaño de 9B lo sitúan en un rango desplegable en hardware de consumo, lo que interesa a desarrolladores que necesitan un modelo local con capacidades de razonamiento y tool calling sin restricciones de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Qwen3.5 |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer denso de aproximadamente 9.400 millones de parámetros con capacidad multimodal (procesa imagen y texto como entrada). Sobre esta base, Jackrong realizó una destilación desde DeepSeek-V4-Pro en modo Max Effect, generando un conjunto de aproximadamente 250.000 muestras de SFT centradas en matemáticas y razonamiento científico. El pipeline de entrenamiento documentado incluye etapas de SFT, RL y GSPO, además de soporte para MTP (multi-token prediction) y evaluación en NVFP4. No se especifica el número total de tokens de entrenamiento ni la composición exacta del dataset.

La intervención de fantasyx07 aplica Heretic v2.0.0.dev0 con ablación de rango arbitrario (ARA) sobre las capas 9 a 24, usando `preserve_good_behavior_weight` de 0.8264, `steer_bad_behavior_weight` de 0.0003, `overcorrect_relative_weight` de 0.9645 y `neighbor_count` de 12. El resultado declarado es una reducción de rechazos de 100/100 en el modelo original a 3/100 en esta variante, con una divergencia KL de 0.0422 respecto al original, lo que indica un cambio moderado en la distribución de salida.

## Capacidades

- Generación de texto y razonamiento multi-paso con descomposición estructurada de problemas.
- Razonamiento matemático y resolución de problemas STEM, área principal del entrenamiento.
- Capacidades multimodales de entrada (image-text-to-text) heredadas de la base Qwen3.5.
- Tool calling y function calling, con etiquetas explícitas en el repositorio.
- Soporte de agentes y razonamiento multi-paso orientado a uso de herramientas.
- Capacidades multilingües en inglés, chino, coreano, japonés, español y ruso.
- Modo de razonamiento (thinking) implícito en el linaje de destilación de DeepSeek.
- Comportamiento sin rechazos ("uncensored") tras la ablación ARA.

## Casos de uso

- Resolución de problemas matemáticos y científicos: el modelo está entrenado sobre ~250.000 muestras de matemáticas y STEM, por lo que resulta adecuado para tutores automáticos, generación de soluciones paso a paso y verificación de ejercicios en plataformas educativas.
- Asistente de investigación técnica: con capacidad de razonamiento estructurado y contexto multimodal, puede resumir figuras y tablas de papers junto con el texto, apoyando revisiones de literatura.
- Automatización de pipelines de análisis de datos: el soporte de tool calling permite integrarlo como planificador que invoca funciones de cálculo, consulta de bases de datos o ejecución de scripts en flujos de ciencia de datos.
- Generación de código asistida: aunque no recibió SFT específico de código, el autor reporta mejoras por transferencia cruzada; puede usarse en autocompletado, explicación de fragmentos y generación de tests en entornos de desarrollo.
- Atención al cliente multilingüe: al cubrir seis idiomas y no rechazar consultas, puede gestionar conversaciones multi-turno en español, inglés, chino, coreano, japonés y ruso, con integración de funciones de negocio vía tool calling.
- Despliegue local en estaciones de trabajo: con 9B parámetros y licencia Apache 2.0, es viable ejecutarlo en GPUs de consumo para prototipos de agentes, asistentes personales o investigación sobre alineación y ablación de rechazos.
- Investigación sobre seguridad y alineación: la variante permite estudiar el efecto de la ablación ARA sobre las respuestas del modelo, comparando con el original (100/100 rechazos) y midiendo la divergencia KL de 0.0422.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos | 3/100 | 100/100 |
| Divergencia KL | 0.0422 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18,8 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda 24 GB o más.
- VRAM estimada en cuantización de 8 bits: alrededor de 9,4 GB de pesos, viable en GPUs de 12-16 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 4,7 GB de pesos, viable en GPUs de 8 GB.
- GPUs recomendadas: A100 40/80 GB, H100, L40S para despliegue en producción; RTX 4090 (24 GB) para FP16 ajustado o 8 bits; RTX 3090, RTX 4080 y RTX 4070 Ti para cuantizaciones de 8 y 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 con 8 bits o 4 bits, y en RTX 3090/4080 con cuantización agresiva.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta del repo), vLLM, llama.cpp y Ollama para formatos GGUF (no se confirma disponibilidad de GGUF en el repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic) | 9,4B | no disponible | Apache 2.0 | Razonamiento STEM sin rechazos | Hugging Face |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (original) | 9,4B | no disponible | Apache 2.0 | Razonamiento STEM con alineación estándar | Hugging Face |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4B | no disponible | Apache 2.0 | Versión reducida sin rechazos | Hugging Face |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | ~9B | no disponible | no disponible | Fine-tune científico sobre esta base | Hugging Face |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La ablación de rechazos elimina salvaguardas del modelo original: puede generar contenido dañino, ofensivo o ilegal sin filtro, lo que exige moderación externa en producción.
- La divergencia KL de 0.0422 indica que la distribución de salida se ha desplazado respecto al original; puede haber degradación sutil en tareas fuera del dominio STEM.
- Riesgo de alucinación inherente a los modelos de 9B, especialmente en razonamiento matemático de varios pasos y en consultas de conocimiento factual.
- No se documenta la longitud de contexto soportada, lo que impide garantizar ventanas largas en casos de uso con documentos extensos.
- El entrenamiento se centró en matemáticas y STEM con ~250.000 muestras; el rendimiento en código, derecho, medicina u otras áreas no está validado y la transferencia cruzada es solo cualitativa según el autor.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo "uncensored" puede chocar con normativas locales de contenido y con los términos de servicio de plataformas de despliegue.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.
- Los idiomas declarados son seis, pero no se especifica el nivel de competencia por idioma; el español figura en la lista sin métricas de evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fantasyx07/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Versión 4B: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Fine-tune científico DeepThought: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Heretic (herramienta de ablación): https://heretic-project.org
