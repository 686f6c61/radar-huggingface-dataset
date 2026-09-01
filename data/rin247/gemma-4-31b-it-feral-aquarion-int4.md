# Rin247/gemma-4-31B-it-Feral-Aquarion-INT4

## Resumen

Este modelo es una cuantización INT4 (weight-only) de `gemma-4-31B-it-Feral`, una variante "abliterated" (desensibilizada) del modelo multimodal Gemma 4 31B IT de Google DeepMind. El autor, Rin247, ha aplicado una proyección ortogonal para eliminar la dirección de rechazo (refusal) antes de la cuantización, con el objetivo de ofrecer una versión sin censura del modelo original. La cuantización se realizó con PyTorch RTN sobre CPU, y los pesos se almacenan en formato safetensors con buffers de escala y forma para su posterior dequantización.

El modelo está diseñado para ser cargado en motores de inferencia compatibles con recetas de weight-only, y su pipeline es image-text-to-text, lo que indica que conserva las capacidades multimodales del modelo base (entrada de imagen y texto, salida de texto). Aunque el nombre sugiere 31 mil millones de parámetros, el conteo real de los safetensors es de 16.358.001.296 parámetros, una discrepancia que no está explicada en la documentación disponible. El repositorio tiene un tamaño de 18,3 GB y fue creado en septiembre de 2026.

La relevancia de este modelo radica en su doble transformación: por un lado, la eliminación de la censura mediante abliteration, y por otro, la reducción de precisión a INT4 para facilitar su despliegue en hardware con recursos limitados. Sin embargo, la falta de documentación sobre el proceso de entrenamiento, licencia y benchmarks limita su uso en entornos de producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (basado en Gemma 4 31B IT) |
| Parametros totales | 16.358.001.296 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 weight-only (RTN) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con buffers `weight_scale` y `weight_shape`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Gemma 4 31B IT de Google DeepMind, un transformer denso multimodal que acepta entradas de texto, imagen y audio (aunque el pipeline declarado es image-text-to-text). El modelo original incorpora un "modo de pensamiento" (thinking mode) y un protocolo de tool-use, segun la documentacion de vLLM. Sin embargo, este repositorio no incluye informacion sobre el entrenamiento del modelo base ni sobre el proceso de abliteration mas alla de la mencion a la proyeccion ortogonal de la direccion de rechazo. La cuantizacion se realizo con PyTorch RTN en CPU, un metodo que redondea los pesos a INT4 y almacena escalas y formas para la dequantizacion posterior. No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Gemma 4 31B IT, que incluyen razonamiento complejo y generacion de texto.
- Multimodalidad: acepta entradas de imagen y texto (pipeline image-text-to-text), y potencialmente audio, aunque no se confirma en este repositorio.
- Tool calling y protocolo de agentes: el modelo base soporta tool-use, pero no se verifica en esta version cuantizada.
- Modo de pensamiento (thinking mode): disponible en el modelo base, pero no se documenta aqui.
- Sin censura: la abliteration elimina la direccion de rechazo, lo que permite respuestas sin filtros de seguridad, aunque esto conlleva riesgos (ver limitaciones).
- Multilingue: no se especifican idiomas soportados.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, util para analizar sesgos y riesgos de modelos "uncensored".
- Generacion de contenido creativo sin restricciones: escritura de ficcion, guiones o dialogos que requieran temas tabu o lenguaje explicito, donde los modelos censurados fallan.
- Prototipado rapido de aplicaciones multimodales: al ser INT4, puede ejecutarse en GPUs de consumo para probar pipelines de vision-lenguaje sin necesidad de hardware de datacenter.
- Evaluacion de tecnicas de cuantizacion: sirve como caso de estudio para comparar el impacto de RTN INT4 en la calidad de salida frente a otras cuantizaciones (FP8, AWQ, etc.).
- Despliegue en entornos con restricciones de memoria: su tamano reducido (18,3 GB en disco) permite cargarlo en GPUs con 16 GB de VRAM, aunque requiere dequantizacion previa.
- Analisis de robustez: al carecer de filtros de seguridad, se puede probar la capacidad del modelo para mantener coherencia en contextos adversarios o provocativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan puntuaciones de MMLU, HumanEval, GSM8K ni otras metricas estandar. Tampoco hay comparaciones con el modelo base o con otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada: los pesos INT4 de 16,3B parametros ocupan aproximadamente 8,2 GB, pero el repositorio pesa 18,3 GB, lo que sugiere que puede haber pesos adicionales o que la cuantizacion no es pura. Se recomienda al menos 16 GB de VRAM para cargar el modelo dequantizado en FP16 (unos 32 GB) o usar tecnicas de offloading.
- GPU recomendadas: RTX 4090 (24 GB) o A100 (40/80 GB) para inferencia comoda. En GPUs con 16 GB (RTX 4080, 3080 Ti) podria ser posible con cuantizacion adicional o usando llama.cpp con GGUF, aunque este formato no esta disponible aqui.
- Compatibilidad con consumer GPU: si, siempre que se dequantice y se use un motor como vLLM o TGI con soporte para weight-only. No se menciona compatibilidad con Ollama o llama.cpp.
- Opciones de despliegue: vLLM, Hugging Face TGI, o motores personalizados que soporten los buffers de escala y forma. No se proporcionan latencias ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| google/gemma-4-31B-it | 31B (nominal) | no disponible | Gemma Terms of Use | safetensors (FP16/BF16) | Modelo base multimodal, con thinking mode y tool-use |
| Rin247/gemma-4-31B-it-Feral-Aquarion-INT4 | 16,3B (real) | no disponible | no disponible | INT4 safetensors | Cuantizacion INT4 de una version abliterated |
| Otras cuantizaciones de gemma-4-31B-it (p.ej. FP4) | 31B (nominal) | no disponible | Gemma Terms of Use | FP4 | Existen en Hugging Face, pero sin datos concretos |

No se dispone de informacion suficiente para una comparativa detallada de rendimiento. La discrepancia en el numero de parametros (16,3B vs 31B) sugiere que el conteo de safetensors podria ser incorrecto o que el modelo base tiene una arquitectura diferente, pero no se puede confirmar.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser una version sin censura, el modelo puede generar contenido ofensivo, incorrecto o peligroso sin restricciones. No se ha evaluado su fiabilidad.
- Riesgo de seguridad: la abliteration elimina los mecanismos de rechazo, lo que puede facilitar usos malintencionados (generacion de malware, discursos de odio, etc.).
- Licencia no disponible: no se puede determinar si el uso comercial esta permitido. El modelo base de Google tiene restricciones, pero esta derivada podria no cumplirlas.
- Falta de documentacion: no hay informacion sobre el proceso de entrenamiento, datos de validacion, ni garantias de calidad.
- Compatibilidad limitada: los pesos requieren dequantizacion con buffers especificos, lo que dificulta su uso con herramientas estandar como llama.cpp u Ollama.
- Contexto y idiomas desconocidos: no se especifica la longitud de contexto soportada ni los idiomas, lo que impide planificar su uso en aplicaciones multilingues.
- Riesgo de degradacion por cuantizacion: la cuantizacion INT4 RTN puede afectar la calidad de las respuestas, especialmente en tareas de razonamiento complejo, aunque no hay benchmarks que lo confirmen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Rin247/gemma-4-31B-it-Feral-Aquarion-INT4
- Version FP4 del mismo autor: https://huggingface.co/Rin247/gemma-4-31B-it-Feral-Aquarion-FP4
- Modelo base de Google (pagina oficial): https://deepmind.google/models/gemma/gemma-4/
- Modelo base en HuggingFace (google/gemma-4-31B-it): https://huggingface.co/google/gemma-4-31B-it
- Pagina de NVIDIA NIM para Gemma 4 31B IT: https://build.nvidia.com/google/gemma-4-31b-it/modelcard
- Recetas vLLM para Gemma 4 31B IT: https://recipes.vllm.ai/Google/gemma-4-31B-it
