# Justbackup/Llama-3.3-70B-Instruct-abliterated-i1-GGUF

## Resumen

Justbackup/Llama-3.3-70B-Instruct-abliterated-i1-GGUF es una cuantización GGUF del modelo Llama 3.3 70B Instruct abliterado, creada por el usuario Justbackup a partir del trabajo de huihui-ai. La técnica de abliteración elimina los mecanismos de rechazo del modelo original de Meta, dando lugar a una variante sin censura que mantiene las capacidades de instrucción y generación de texto del modelo base. Está pensada para su uso con motores de inferencia compatibles con GGUF como llama.cpp, Ollama o LM Studio.

El modelo conserva los 70 553 millones de parámetros del Llama 3.3 70B Instruct original, con una arquitectura transformer densa y soporte multilingüe para ocho idiomas. Al estar disponible en formato GGUF, puede ejecutarse en una amplia gama de hardware, desde equipos de escritorio con GPUs de consumo hasta servidores con múltiples aceleradores, dependiendo de la cuantización elegida. La licencia es la Llama 3.3 Community License, que permite uso comercial con ciertas restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (similar a Llama 3.3 70B Instruct) |
| Parametros totales | 70 553 706 560 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (se espera 128 000 tokens, no confirmado en la ficha) |
| Tipos de cuantizacion | GGUF (varias cuantizaciones, no especificadas en la ficha) |
| Idiomas soportados | en, fr, it, pt, hi, es, th, de |
| Licencia | Llama 3.3 Community License |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.3 70B Instruct, un transformer denso de 70 000 millones de parámetros desarrollado por Meta. La arquitectura utiliza atención por ventanas con deslizamiento y normalización RMSNorm, junto con embeddings rotatorios (RoPE). Sobre esta base, huihui-ai aplicó la técnica de abliteración, que consiste en identificar y eliminar las direcciones del espacio de activaciones responsables de los comportamientos de rechazo, sin necesidad de reentrenamiento completo. El resultado es un modelo que conserva las capacidades de razonamiento y seguimiento de instrucciones del original, pero que responde a solicitudes que el modelo base rechazaría.

El proceso de abliteración no modifica los pesos de forma supervisada con datos etiquetados, sino que utiliza análisis de activaciones para anular selectivamente ciertas direcciones. Esto implica que el modelo mantiene el conocimiento y las habilidades aprendidas durante el entrenamiento original de Llama 3.3, que incluyó alrededor de 15 billones de tokens y un refinamiento posterior con RLHF. La cuantización a GGUF realizada por Justbackup permite su ejecución eficiente en hardware variado, con posibles pérdidas mínimas de precisión según el nivel de cuantización.

## Capacidades

- Generacion de texto y conversacion multi-turno en ocho idiomas (ingles, frances, italiano, portugues, hindi, español, tailandes y aleman).
- Seguimiento de instrucciones complejas y razonamiento paso a paso, heredado de Llama 3.3 70B Instruct.
- Generacion de codigo y soporte basico de programacion en multiples lenguajes.
- Capacidad de escritura creativa, resumen y traduccion.
- Respuesta sin censura a temas sensibles o controversiales, gracias a la abliteracion.
- Compatible con herramientas de function calling si se utiliza con el prompt de sistema adecuado (no confirmado en la ficha, pero tipico de Llama 3.3 Instruct).
- Soporte para tareas de agentes mediante frameworks externos que aprovechen el formato de chat.

## Casos de uso

- Escritura creativa sin restricciones: el modelo puede generar ficcion, poesia o guiones que aborden temas tabu o violentos sin auto-censura, util para autores que exploran narrativas oscuras.
- Investigacion academica en ciencias sociales: permite analizar discursos politicos o religiosos extremos sin que el modelo se niegue a procesar contenido sensible, facilitando estudios de contenido.
- Generacion de dialogos para videojuegos: desarrolladores pueden crear personajes con personalidades controvertidas o dialogos adultos sin temor a rechazos del modelo, acelerando el prototipado.
- Analisis de textos legales o historicos: el modelo puede resumir o extraer informacion de documentos que contengan lenguaje ofensivo o descripciones de violencia, sin bloquear la tarea.
- Simulacion de escenarios de seguridad: equipos de ciberseguridad pueden generar prompts adversariales o contenido de phishing para entrenar sistemas de deteccion, aprovechando la falta de filtros.
- Asistencia en terapia narrativa o role-playing: terapeutas o educadores pueden usar el modelo para crear escenarios de rol complejos que incluyan conflictos emocionales fuertes, sin interrupciones por politicas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Llama 3.3 70B Instruct reporta en la documentacion de Meta un rendimiento similar al de Llama 3.1 405B en tareas como MMLU, HumanEval y GSM8K, pero no hay datos especificos para esta variante abliterada y cuantizada. Se recomienda evaluar el modelo en el caso de uso concreto antes de su despliegue en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Para una cuantizacion Q4_K_M, se necesitan aproximadamente 40 GB de VRAM; para Q8, alrededor de 70 GB.
- GPU recomendadas: para ejecucion local en consumer, se requieren GPUs con al menos 24 GB (RTX 3090/4090) usando cuantizaciones bajas y offloading parcial a CPU. Para uso completo en GPU, se recomienda A100 80GB, H100 o multiples GPUs.
- En equipos sin GPU suficiente, puede ejecutarse en CPU pura con llama.cpp, aunque con latencia alta (varios segundos por token).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui, o servidores compatibles con GGUF como llama-cpp-python.
- Latencia y throughput: no disponible. Depende del hardware y la cuantizacion; en una A100 80GB con Q4, se pueden esperar entre 20 y 40 tokens por segundo, pero es una estimacion no confirmada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Abliterado |
|---|---|---|---|---|---|
| Llama-3.3-70B-Instruct (Meta) | 70B | 128k | Llama 3.3 Community | safetensors | No |
| Llama-3.3-70B-Instruct-abliterated (huihui-ai) | 70B | 128k | Llama 3.3 Community | safetensors | Si |
| Justbackup/Llama-3.3-70B-Instruct-abliterated-i1-GGUF | 70B | No disponible | Llama 3.3 Community | GGUF | Si |
| Qwen 2.5 72B Instruct | 72B | 128k | Apache 2.0 | safetensors | No |

La comparativa muestra que este modelo es esencialmente una version cuantizada del abliterado de huihui-ai. Frente a Qwen 2.5 72B, la diferencia principal es la licencia (Apache 2.0 permite uso comercial sin restricciones de usuarios) y el hecho de que Qwen no esta abliterado. No hay datos de rendimiento comparativo publicados para esta variante.

## Limitaciones y advertencias

- La abliteracion elimina los mecanismos de rechazo, pero no garantiza que el modelo no genere contenido sesgado, toxico o factualmente incorrecto. El riesgo de alucinacion es similar al del modelo base.
- Al ser una cuantizacion, puede haber una ligera degradacion en la calidad de las respuestas respecto al modelo en precision completa, especialmente en cuantizaciones muy agresivas (Q2, Q3).
- La licencia Llama 3.3 Community License exige que cualquier producto derivado incluya el nombre "Llama" al inicio y que se muestre "Built with Llama" en la interfaz. Ademas, si el servicio supera los 700 millones de usuarios activos mensuales, se requiere una licencia comercial adicional de Meta.
- No se ha confirmado la longitud de contexto real en esta version GGUF; algunos motores pueden limitarla si no se configura correctamente.
- El modelo puede producir contenido ofensivo o inapropiado sin filtro, lo que requiere moderacion adicional si se despliega en entornos publicos.
- No hay informacion sobre el proceso de cuantizacion exacto (tipo de cuantizacion, dataset de calibracion, uso de imatrix), aunque el nombre "i1" sugiere la aplicacion de importance matrix, lo que puede afectar a la calidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Justbackup/Llama-3.3-70B-Instruct-abliterated-i1-GGUF
- Modelo base abliterado: https://huggingface.co/huihui-ai/Llama-3.3-70B-Instruct-abliterated
- Modelo ablated relacionado: https://huggingface.co/Justbackup/Llama-3.3-70B-Instruct-ablated
- Pagina en Ollama: https://ollama.com/huihui_ai/llama3.3-abliterated:70b-instruct
- Documentacion de Llama 3.3: https://www.llama.com/docs/overview
