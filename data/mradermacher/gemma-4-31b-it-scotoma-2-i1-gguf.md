# mradermacher/gemma-4-31B-it-scotoma-2-i1-GGUF

## Resumen

El modelo `mradermacher/gemma-4-31B-it-scotoma-2-i1-GGUF` es una cuantización GGUF con matriz de importancia (imatrix) del modelo base `ReadyArt/gemma-4-31B-it-scotoma-2`, un modelo de lenguaje de 31 mil millones de parámetros perteneciente a la familia Gemma 4 de Google. Esta versión, publicada por el usuario mradermacher, está pensada para facilitar la ejecución local en hardware de consumo mediante herramientas como llama.cpp, Ollama o LM Studio, reduciendo el peso del modelo a aproximadamente 12 GB en su única cuantización ofrecida (i1-Q2_K).

El modelo base es una variante "it" (instruction-tuned) con el sufijo "scotoma", aunque no se dispone de documentación adicional sobre su entrenamiento o características específicas. La cuantización i1-Q2_K es una de las más agresivas en términos de compresión, lo que implica una pérdida de calidad notable frente a cuantizaciones más altas, pero permite ejecutar el modelo en GPUs con 12-16 GB de VRAM. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales, siempre que se cumplan los términos de la licencia de Gemma 4 de Google.

Este lanzamiento es relevante para desarrolladores que necesitan probar un modelo de 31B en entornos con recursos limitados, aunque deben ser conscientes de las limitaciones de calidad inherentes a una cuantización tan baja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer, familia Gemma 4) |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (unico archivo GGUF), ademas archivo imatrix |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 (con enlace a licencia Gemma 4) |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base `ReadyArt/gemma-4-31B-it-scotoma-2`. Por el nombre, se infiere que pertenece a la familia Gemma 4 de Google, que utiliza arquitecturas transformer con atencion por ventanas deslizantes y mecanismos de atencion local/global. Sin embargo, no hay datos confirmados sobre el numero de capas, dimensiones ocultas, ni sobre el proceso de entrenamiento (dataset, tokens, metodos de alineacion como RLHF o DPO). La unica informacion disponible es que se trata de una version "it" (instruction-tuned) y que el repositorio actual es una cuantizacion GGUF con matriz de importancia (imatrix) realizada por mradermacher, que mejora la calidad de la cuantizacion al ponderar los tensores segun su importancia.

## Capacidades

- Generacion de texto y chat conversacional: al ser un modelo "it", esta optimizado para seguir instrucciones y mantener dialogos multi-turno en ingles.
- Razonamiento y conocimiento general: al tener 31B de parametros, se espera un rendimiento solido en tareas de comprension lectora, razonamiento logico y conocimiento factual, aunque la cuantizacion Q2_K degrada estas capacidades.
- No se confirma soporte para tool calling, vision, audio u otras modalidades. La model card menciona que es un modelo de vision ("This is a vision model"), pero los archivos mmproj se encuentran en el repositorio estatico, no en este. Por tanto, la capacidad multimodal no esta disponible en esta version GGUF.
- Multilingue: solo se declara ingles como idioma soportado, aunque modelos de este tamano suelen generalizar a otros idiomas con menor calidad.

## Casos de uso

- Inferencia local en hardware modesto: con un unico archivo GGUF de 12 GB, puede ejecutarse en una GPU con 16 GB de VRAM (por ejemplo, RTX 4080, RTX 3090) o incluso en CPU con suficiente RAM, usando llama.cpp o Ollama. Es util para prototipado rapido sin depender de APIs.
- Experimentacion con cuantizaciones extremas: desarrolladores interesados en estudiar el impacto de la cuantizacion i1-Q2_K en la calidad de un modelo de 31B pueden usar este archivo como referencia comparativa frente a cuantizaciones mas altas (disponibles en el repositorio estatico).
- Desarrollo de chatbots locales: para aplicaciones de chat en ingles donde la fidelidad no sea critica, este modelo puede servir como base para un asistente conversacional embebido en una aplicacion de escritorio o movil.
- Educacion y aprendizaje: permite a estudiantes y aficionados experimentar con un modelo de gran tamano en sus propias maquinas, entendiendo los compromisos entre tamano, velocidad y calidad.
- Pruebas de compatibilidad: al ser un GGUF estandar, sirve para verificar la integracion con diferentes backends (llama.cpp, llama-cpp-python, etc.) antes de elegir una cuantizacion de mayor calidad.
- Generacion de texto creativo: para tareas de escritura, lluvia de ideas o redaccion en ingles donde la coherencia a largo plazo no sea imprescindible, el modelo puede producir resultados aceptables a pesar de la baja cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) para esta cuantizacion, ni se dispone de datos del modelo base. Por tanto, no es posible comparar objetivamente su calidad con otros modelos.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa 12.0 GB. Con overhead de ejecucion, se recomienda al menos 14-16 GB de VRAM para inferencia en GPU. En CPU, se necesitan aproximadamente 16-20 GB de RAM libre.
- GPU recomendadas: RTX 4080/4090, RTX 3090/3080 Ti, A4000/A5000, o cualquier GPU con 16 GB o mas de VRAM. En GPUs con 12 GB (como RTX 3080) podria caber con offloading parcial, pero con riesgo de desbordamiento.
- En consumer GPU: si, en las gamas altas de NVIDIA (RTX 30/40 series) con 16 GB o mas. En AMD, las Radeon RX 6800/6900 XT o superiores con 16 GB tambien son compatibles.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, KoboldCpp, text-generation-webui (con backend llama.cpp). No es compatible directamente con vLLM o TGI, que requieren pesos en formato safetensors.
- Latencia y throughput: no se han publicado mediciones. En una RTX 4090, un modelo de 31B en Q2_K podria alcanzar velocidades de 20-40 tokens/segundo, pero es una estimacion sin datos reales.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa objetiva. El modelo base `ReadyArt/gemma-4-31B-it-scotoma-2` no tiene ficha publica en HuggingFace con benchmarks. Como alternativa, se pueden considerar otros GGUF de modelos de 30B-32B, como los de Mistral (Mixtral 8x7B, aunque es MoE) o Llama 3 30B, pero no hay datos comparables en este repositorio. Se recomienda consultar el repositorio estatico del mismo autor para ver cuantizaciones de mayor calidad y, si se desea comparar, buscar benchmarks de Gemma 4 31B en su version original.

## Limitaciones y advertencias

- Cuantizacion extremadamente baja (i1-Q2_K): la calidad de generacion es significativamente inferior a la del modelo original. Puede producir respuestas incoherentes, repetitivas o con errores gramaticales frecuentes. No apto para tareas que requieran precision.
- Sesgos y alucinaciones: al ser un modelo derivado de Gemma 4, puede heredar sesgos presentes en los datos de entrenamiento. La cuantizacion agresiva aumenta la probabilidad de alucinaciones factuales.
- Idioma: solo se declara ingles. El rendimiento en otros idiomas, incluido el castellano, sera muy limitado o deficiente.
- Vision no disponible: aunque la model card menciona que es un modelo de vision, los archivos mmproj no estan incluidos en este repositorio. No se puede usar para tareas multimodales.
- Contexto limitado: no se especifica la longitud de contexto; en cuantizaciones bajas, el modelo puede perder coherencia en contextos largos.
- Licencia: aunque es Apache 2.0, el modelo base tiene una licencia especifica de Gemma 4 (enlazada en la model card) que puede imponer restricciones adicionales. Se recomienda revisar los terminos de Google antes de un uso comercial.
- Soporte limitado: al ser un repositorio de cuantizacion, no hay garantias de mantenimiento o actualizaciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/gemma-4-31B-it-scotoma-2-i1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma-2
- Repositorio estatico (otras cuantizaciones y mmproj): https://huggingface.co/mradermacher/gemma-4-31B-it-scotoma-2-GGUF
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de ayuda del autor para peticiones: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
