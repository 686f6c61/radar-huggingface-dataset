# mradermacher/qwen3.8-27b-aragon-uncensored-i1-GGUF

## Resumen

El modelo `qwen3.8-27b-aragon-uncensored-i1-GGUF` es una colección de cuantizaciones GGUF con matriz de importancia (imatrix) del modelo base `jdqqjr/qwen3.8-27b-aragon-uncensored`, un modelo de lenguaje de 27 320 millones de parámetros perteneciente a la familia Qwen 3.8. La cuantización ha sido realizada por mradermacher, que publica tanto versiones estáticas como imatrix, esta última optimizada para reducir la pérdida de calidad en cuantizaciones de baja precisión.

El modelo base es una versión "abliterated" (técnica que elimina los rechazos del modelo ante peticiones consideradas sensibles) de un Qwen 3.8 de 27B, con la torre de visión y la cabeza de predicción multi-token (MTP) intactas. Según las fuentes consultadas, mantiene un contexto de 262 000 tokens, soporta tool calling y modo de razonamiento (thinking), y presenta una tasa de sobre-rechazo del 0 % en XSTest. La relevancia de esta ficha radica en que ofrece a desarrolladores e investigadores una vía para ejecutar localmente un modelo de 27B con capacidades multimodales y sin restricciones de contenido, mediante cuantizaciones GGUF adaptadas a distintos presupuestos de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con torre de vision y prediccion multi-token (MTP), basado en Qwen 3.8 (detalles completos no disponibles) |
| Parametros totales | 27 320 697 856 (27,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 000 tokens (segun fuentes externas) |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (todas con imatrix) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible en la ficha; segun fuentes externas, Apache 2.0 con restriccion de uso exclusivo para investigacion (research-only) |
| Formato de pesos | GGUF (ficheros .gguf con cuantizacion imatrix) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Por el nombre y las etiquetas, se trata de un transformer de la familia Qwen 3.8 con 27 320 millones de parametros, que incorpora una torre de vision (mmproj) y una cabeza de prediccion multi-token (MTP), ambas intactas tras el proceso de abliteration. La tecnica de abliteration aplicada a nivel de tensor elimina selectivamente las activaciones asociadas al rechazo de peticiones, manteniendo el resto de capacidades del modelo. No se han publicado datos sobre el dataset de entrenamiento, el numero de tokens procesados ni el uso de tecnicas como RLHF o DPO. La cuantizacion imatrix realizada por mradermacher emplea una matriz de importancia calculada sobre un corpus de referencia para mejorar la calidad de las cuantizaciones de baja precision.

## Capacidades

- Generacion de texto sin censura: el modelo base presenta un 0 % de sobre-rechazo en XSTest y una tasa de rechazo de 0-6 % en el conjunto de pruebas A/B, lo que lo hace adecuado para tareas donde se requiere respuesta directa sin filtros de seguridad.
- Vision: incluye una torre de vision (mmproj) que permite procesar imagenes junto con texto, aunque no se especifican las tareas concretas soportadas (descripcion, VQA, etc.).
- Tool calling: soporta invocacion de funciones externas, lo que permite integrarlo en pipelines de agentes.
- Modo de razonamiento (thinking): el modelo puede generar cadenas de razonamiento antes de responder, util para tareas complejas.
- Contexto largo: ventana de 262 000 tokens, adecuada para documentos extensos o conversaciones multi-turno prolongadas.
- Multilingue: solo se confirma soporte para ingles; no hay datos sobre otros idiomas.

## Casos de uso

- Investigacion academica sobre alineacion y seguridad: al ser un modelo abliterated, permite estudiar el comportamiento de modelos sin restricciones de contenido, comparando respuestas con versiones censuradas. Se usaria con cargas de trabajo de analisis de texto y evaluacion de sesgos.
- Generacion creativa de contenido sin restricciones: escritura de ficcion, guiones o material narrativo donde se requiera explorar temas sensibles sin filtros. La cuantizacion Q4_K_M (16,9 GB) permite ejecutarlo en una GPU de 24 GB.
- Analisis de documentos largos: con 262K de contexto, puede procesar libros completos, expedientes legales o informes tecnicos extensos en una sola pasada, extrayendo informacion o resumiendo.
- Desarrollo de agentes con tool calling: integrable en frameworks como LangChain o LlamaIndex para construir asistentes que consulten APIs, bases de datos o ejecuten codigo, aprovechando el modo thinking para planificar pasos.
- Prototipado de aplicaciones vision-lenguaje: gracias a la torre de vision, se puede usar para tareas de captioning o respuesta a preguntas sobre imagenes, aunque no se detallan las capacidades exactas.
- Evaluacion de robustez de cuantizaciones: los desarrolladores pueden comparar el rendimiento de las distintas cuantizaciones imatrix (de Q2_K a Q6_K) en tareas especificas para decidir el mejor equilibrio entre calidad y uso de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, y las fuentes externas solo mencionan resultados de rechazo (XSTest y conjunto A/B) sin datos numericos completos. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: segun el tamaño de los ficheros GGUF, la cuantizacion i1-Q2_K ocupa 11,0 GB, i1-Q4_K_M 16,9 GB e i1-Q6_K 22,5 GB. Se recomienda al menos 2-4 GB adicionales de VRAM para el contexto y las operaciones de inferencia.
- GPU recomendadas: para cuantizaciones de hasta Q4_K_M, una GPU con 24 GB de VRAM (RTX 3090, RTX 4090) es suficiente. Para Q6_K o mayor, se necesitan 24-32 GB (A100 40GB, RTX 6000 Ada). Las cuantizaciones Q2-Q3 pueden caber en GPUs de 16 GB (RTX 4080, RTX 3080 Ti).
- Si cabe en consumer GPU: si, las cuantizaciones Q2_K a Q4_K_M caben en GPUs de consumo de gama alta (16-24 GB). Las versiones Q5 y Q6 requieren 24 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores compatibles con GGUF como llama-cpp-python. Para despliegue en produccion con mayor throughput, se puede convertir a otros formatos o usar vLLM con pesos originales (no GGUF).
- Latencia y throughput: no se han publicado datos especificos. En una RTX 4090 con Q4_K_M, se puede esperar una velocidad de generacion de 20-40 tokens/s para un modelo de 27B, aunque depende de la implementacion y el contexto.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos de la misma categoria. Como referencia cualitativa, se puede comparar con el modelo base sin cuantizar (`jdqqjr/qwen3.8-27b-aragon-uncensored`) y con otros modelos abliterated de tamaño similar, pero no hay metricas publicadas. La siguiente tabla resume las diferencias principales con el modelo base y con una alternativa generica de 27B (sin datos concretos):

| Modelo | Parametros | Contexto | Vision | Tool calling | Licencia |
|---|---|---|---|---|---|
| qwen3.8-27b-aragon-uncensored-i1-GGUF (este) | 27,3 B | 262K | Si | Si | Apache 2.0 (research-only) segun fuentes |
| jdqqjr/qwen3.8-27b-aragon-uncensored (base) | 27,3 B | 262K | Si | Si | No disponible |
| Alternativa generica 27B (p.ej. Qwen2.5-27B) | 27 B | 32K-128K | No | Depende | Apache 2.0 |

## Limitaciones y advertencias

- Contenido sin filtrar: al ser un modelo abliterated, puede generar contenido ofensivo, ilegal o peligroso sin restricciones. No es adecuado para aplicaciones orientadas al publico general sin capas de moderacion adicionales.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos o datos, especialmente en tareas de razonamiento complejo o con contexto muy largo.
- Limitaciones de idioma: solo se confirma soporte para ingles; el rendimiento en otros idiomas no esta garantizado.
- Restricciones de licencia: segun fuentes externas, la licencia es Apache 2.0 con uso exclusivo para investigacion (research-only). Esto impide su uso en productos comerciales sin autorizacion explicita.
- Sesgos conocidos: no se han publicado evaluaciones de sesgo para este modelo. Dado que es una variante sin censura, los sesgos presentes en los datos de entrenamiento pueden manifestarse sin filtros.
- Cuantizacion: las cuantizaciones de baja precision (Q2_K, IQ3) pueden degradar significativamente la calidad de las respuestas, especialmente en tareas de razonamiento o generacion de codigo.
- Compatibilidad: los ficheros GGUF requieren herramientas compatibles (llama.cpp, Ollama) y no son directamente utilizables con bibliotecas como transformers sin conversion previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/qwen3.8-27b-aragon-uncensored-i1-GGUF
- Modelo base: https://huggingface.co/jdqqjr/qwen3.8-27b-aragon-uncensored
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/qwen3.8-27b-aragon-uncensored-GGUF
- Guia de ejecucion local (orcarouter): https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Articulo sobre la version GGUF abliterated (orcarouter): https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Pagina en Ollama: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
