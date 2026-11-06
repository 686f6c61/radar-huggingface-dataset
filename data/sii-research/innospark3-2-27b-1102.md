# sii-research/InnoSpark3.2-27B-1102

## Resumen

InnoSpark3.2-27B-1102 es un modelo de lenguaje multimodal (texto e imagen) de 27 000 millones de parámetros desarrollado por sii-research, orientado especificamente a tareas educativas. Se construye sobre el modelo base Qwen3.8-27B y se somete a un post-entrenamiento con aprendizaje por refuerzo (RL) centrado en respuesta a preguntas educativas, tutoria guiada y asistencia docente. Su relevancia actual radica en que aplica RL a un dominio vertical concreto —la ensenanza— en lugar de optimizar solo capacidades generales, y en que incluye entrenamiento multi-turno especifico para InnoAgent, un agente de ensenanza personalizada.

El modelo cubre explicacion de conceptos, resolucion guiada de problemas, soporte personalizado de aprendizaje y generacion de material didactico. Frente a la version anterior (InnoSpark3.1-27B-1008), la actualizacion se centra en un entrenamiento RL multi-turno mas intenso para InnoAgent, con enfasis en explicacion de conocimiento, diagnostico del aprendizaje, generacion y reutilizacion de ejercicios y planificacion del estudio.

La ficha se basa en la model card publicada por el autor y en los metadatos de Hugging Face; los datos no presentes en esas fuentes se marcan explicitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (clase `Qwen3_5ForConditionalGeneration`, familia Qwen3.5) |
| Parametros totales | 27 781 427 952 (≈27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; existen pesos GGUF de terceros (mradermacher/InnoSpark3.2-27B-1102-GGUF) |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); GGUF via repositorio de terceros |
| Modelo base | Qwen3.8-27B |
| Metodo de post-entrenamiento | Aprendizaje por refuerzo (RL), incluido RL multi-turno para InnoAgent |
| Modalidades de entrada | Texto e imagen (pipeline `image-text-to-text`) |
| Tamano del repositorio | 55,6 GB |
| Descargas / likes | 26 / 1 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer de la familia Qwen3.5 con capacidad de procesamiento conjunto de texto e imagen (la clase de carga es `Qwen3_5ForConditionalGeneration` y el pipeline declarado es `image-text-to-text`). Sobre esa base se aplica un post-entrenamiento mediante aprendizaje por refuerzo orientado a tareas educativas: respuesta a preguntas, tutoria y asistencia docente.

La innovacion principal de esta version es el entrenamiento RL multi-turno para InnoAgent, un agente de ensenanza personalizada. El entrenamiento se focaliza en cuatro ejes —explicacion de conocimiento, diagnostico del aprendizaje, generacion y reutilizacion de ejercicios y planificacion del aprendizaje— con el objetivo de mejorar la calidad de respuesta, el uso de herramientas y el mantenimiento del perfil del estudiante a lo largo de interacciones multi-turno. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni detalles del algoritmo RL (por ejemplo, si se emplea RLHF, DPO o variantes de policy gradient).

## Capacidades

- Generacion de texto y respuesta a preguntas educativas en chino e ingles.
- Explicacion de conceptos adaptada al nivel del estudiante (por ejemplo, explicar la formula cuadratica para alumnos de secundaria).
- Tutoria guiada: resolucion de problemas mediante preguntas orientadoras y apoyo basado en el historial de aprendizaje.
- Diagnostico del aprendizaje y retroalimentacion diagnostica.
- Generacion, reutilizacion y planificacion de ejercicios.
- Planificacion del estudio y estrategias instruccionales.
- Uso de herramientas (tool use) dentro del entorno InnoAgent, con ejecucion de herramientas y cambios de estado evaluables.
- Mantenimiento del perfil del aprendiz a lo largo de conversaciones multi-turno.
- Procesamiento de entradas de imagen junto a texto (modalidad image-text-to-text).
- Integracion como backend de agente para tareas de ensenanza multi-paso.

## Casos de uso

- Tutoria personalizada de matematicas: el modelo explica procedimientos paso a paso y adapta el nivel de detalle al historial del alumno, apoyandose en su capacidad de mantener el perfil del aprendiz en conversaciones multi-turno.
- Generacion de material didactico: produccion de ejercicios, guias y explicaciones para profesores, aprovechando el entrenamiento especifico en generacion y reutilizacion de ejercicios.
- Diagnostico del aprendizaje: analisis de las respuestas del estudiante para identificar carencias conceptuales y emitir retroalimentacion diagnostica, tarea evaluada en LongTutor e InnoBench.
- Agente de ensenanza multi-turno (InnoAgent): el modelo actua como backend de un agente que planifica sesiones, consulta y archiva conocimiento y ejecuta herramientas, con tasas de exito estricto elevadas en explicacion de conocimiento, reutilizacion de ejercicios y archivado de conocimiento segun InnoBench.
- Asistente docente para planificacion de clases: recomendacion de estrategias instruccionales y secuenciacion de contenidos a partir de objetivos de aprendizaje.
- Soporte educativo multimodal: interpretacion de imagenes (por ejemplo, diagramas o enunciados escaneados) junto a texto para resolver dudas, gracias a la modalidad image-text-to-text heredada del modelo base.
- Despliegue en plataformas de e-learning: servido mediante vLLM (`vllm serve ... --trust-remote-code`) para atender conversaciones concurrentes de alumnos con contexto multi-turno.

## Benchmarks y rendimiento

EduBench (3 025 muestras en chino, puntuacion sobre 10; tareas IP, PLS y TMG):

| Dimension | Qwen3.8-27B | InnoSpark3.2-27B-1102 | Cambio |
|---|---:|---:|---:|
| Seguimiento de instrucciones y completitud de tarea | 9,608 | 9,847 | +0,239 |
| Relevancia de contenido y control de alcance | 9,715 | 9,905 | +0,190 |
| Integracion de elementos del escenario | 8,434 | 9,241 | +0,807 |
| Precision factual basica | 9,522 | 9,765 | +0,243 |
| Precision de conocimiento de dominio | 9,049 | 9,610 | +0,561 |
| Rigor del proceso de razonamiento | 9,434 | 9,828 | +0,394 |
| Claridad, sencillez e inspiracion | 8,788 | 9,044 | +0,256 |
| Pensamiento de orden superior y desarrollo de habilidades | 8,332 | 9,451 | +1,119 |
| Personalizacion y apoyo al aprendizaje | 9,375 | 9,973 | +0,598 |
| Consistencia de rol y tono | 9,008 | 9,936 | +0,927 |

LongTutor (1 000 muestras del conjunto Gold XES3G5M anotado por humanos; puntuaciones docentes sobre 5):

| Metrica | Qwen3.8-27B | InnoSpark3.2-27B-1102 | Cambio |
|---|---:|---:|---:|
| Precision global de memoria | 87,20 % | 88,90 % | +1,70 pp |
| Precision de extraccion de informacion | 97,80 % | 98,30 % | +0,50 pp |
| Precision de razonamiento multi-sesion | 72,90 % | 74,40 % | +1,50 pp |
| Precision de comprobacion de alucinaciones | 90,90 % | 94,00 % | +3,10 pp |
| Precision de diagnostico | 42,20 % | 43,80 % | +1,60 pp |
| Macro-F1 de diagnostico | 0,3738 | 0,4084 | +0,0346 |
| Uso del historial de aprendizaje | 3,828 | 4,366 | +0,538 |
| Consistencia de estrategia | 4,352 | 4,845 | +0,493 |
| Coherencia | 4,311 | 4,675 | +0,364 |
| Facilidad de comprension | 4,058 | 4,307 | +0,249 |
| Calidad docente global | 4,038 | 4,519 | +0,481 |

InnoBench (entorno de agente InnoAgent; tasa de exito estricta):

| Tarea seleccionada | Qwen3.8-27B | InnoSpark3.2-27B-1102 |
|---|---:|---:|
| Explicacion de conocimiento | 33,33 % | 100,00 % |
| Retroalimentacion diagnostica | 33,33 % | 43,33 % |
| Clarificacion y planificacion | 0,00 % | 66,67 % |
| Reutilizacion de ejercicios | 20,00 % | 100,00 % |
| Recuperacion de conocimiento | 93,33 % | 100,00 % |
| Archivado de conocimiento | 44,44 % | 100,00 % |

No se han publicado en la informacion disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): el repositorio ocupa 55,6 GB, por lo que se necesita del orden de 56 GB o mas de memoria, segun la referencia de LLM Explorer (≈55,3 GB).
- GPU recomendadas para precision completa: A100 80 GB, H100 80 GB o configuraciones multi-GPU equivalentes.
- Cuantizacion: existen pesos GGUF de terceros (mradermacher/InnoSpark3.2-27B-1102-GGUF) que permiten reducir el requisito de memoria; los tamanos concretos por cuantizacion no estan disponibles en la informacion proporcionada.
- GPU de consumo: no disponible de forma confirmada; con cuantizaciones de 4 bits el modelo podria aproximarse a la capacidad de GPUs de 24 GB, pero no hay datos oficiales que lo verifiquen.
- Opciones de despliegue: transformers (`AutoProcessor` + `Qwen3_5ForConditionalGeneration`) y vLLM (`vllm serve sii-research/InnoSpark3.2-27B-1102 --trust-remote-code`). llama.cpp/Ollama serian posibles a traves de los GGUF de terceros, sin confirmacion oficial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| InnoSpark3.2-27B-1102 | ≈27,8 B | no disponible | Educacion y tutoria (RL) | Apache 2.0 | Hugging Face (sii-research) |
| Qwen3.8-27B (modelo base) | 27 B | no disponible | Proposito general multimodal | no disponible | Referenciado como base |
| InnoSpark3.1-27B-1008 (version anterior) | 27 B | no disponible | Educacion y tutoria | no disponible | Release previo del mismo autor |

No se dispone en la informacion proporcionada de datos suficientes para comparar con otros modelos educativos de terceros (parametros, contexto, rendimiento y licencia).

## Limitaciones y advertencias

- Idiomas: solo chino e ingles declarados; el rendimiento en castellano u otros idiomas no esta garantizado ni evaluado.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible; al ser un modelo entrenado con RL sobre datos educativos en chino, puede heredar sesgos del corpus y del modelo base.
- Alucinacion: la propia model card mide la precision de comprobacion de alucinaciones en LongTutor (94,00 %), lo que implica que persiste un margen de error; en contenido factual educativo conviene verificar las respuestas.
- Diagnostico: la precision de diagnostico (43,80 %) y el Macro-F1 (0,4084) son las metricas mas bajas del conjunto, por lo que el diagnostico automatico del aprendizaje no es fiable como sustituto de la evaluacion humana.
- Contexto: la longitud de contexto no esta especificada, lo que limita la planificacion de despliegues con conversaciones muy largas.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3.8-27B y de los pesos GGUF de terceros.
- Produccion: requiere `trust_remote_code=True` en transformers y vLLM, lo que implica ejecutar codigo remoto del repositorio; conviene auditar dicho codigo antes de desplegar.
- Madurez: el modelo tiene 26 descargas y 1 like en el momento de la consulta, y su fecha de creacion es 2026-11-02, por lo que la validacion comunitaria es muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sii-research/InnoSpark3.2-27B-1102
- Pesos GGUF de terceros (mradermacher): https://huggingface.co/mradermacher/InnoSpark3.2-27B-1102-GGUF
- Ficha en LLM Explorer: https://llm-explorer.com/model/sii-research%2FInnoSpark3.2-27B-1102,4nAnHn5DuIZ0YxDqy9RCPs
