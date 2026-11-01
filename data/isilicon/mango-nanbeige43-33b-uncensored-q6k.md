# isilicon/mango-nanbeige43-33b-uncensored-q6k

## Resumen

Esta ficha corresponde a un espejo de preservación (preservation mirror) publicado por el usuario isilicon en Hugging Face, que contiene la cuantización Q6_K en formato GGUF del modelo Nanbeige 4.3 33B UNCENSORED, originalmente publicado por dealignai. Se trata de un modelo de generación de texto conversacional de 33.118.977.024 parámetros, orientado a inglés y chino, que se distribuye sin los filtros de alineación habituales (de ahí la etiqueta "uncensored").

La relevancia de este repositorio no está tanto en el modelo base como en el trabajo de evaluación y preservación que lo acompaña: el proyecto Mango de isilicon somete cada configuración exacta del modelo a una batería propia de pruebas (202 preguntas más 12 casos de agente), publica la puntuación ponderada resultante (67,46/100 en este caso) y conserva los bytes originales de la fuente sin modificar, con la licencia y el registro de la versión original.

Es un candidato a considerar si se busca un modelo de 33B sin alineación con soporte de chino e inglés, y que se prefiera evaluar con datos medidos de una configuración concreta (Q6_K) en lugar de cifras oficiales del editor. La licencia es personalizada (dealignai-community-model-license-v0.3), por lo que conviene revisar sus términos antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer de generación de texto, detalles no publicados en la model card) |
| Parametros totales | 33.118.977.024 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K (GGUF, con imatrix) |
| Idiomas soportados | inglés, chino |
| Licencia | dealignai-community-model-license-v0.3 (tipo "other") |
| Formato de pesos | GGUF (payload seleccionado: 27,17 GB / 25,31 GiB) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base ni los detalles de su entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO). Lo unico que se sabe es que se trata de una version "UNCENSORED" del Nanbeige 4.3 33B publicada por dealignai, es decir, una variante a la que se ha retirado o reducido la capa de alineacion respecto al modelo original de Nanbeige.

Lo que si esta documentado es la cuantizacion: es un GGUF Q6_K generado a partir del repositorio dealignai/Nanbeige4.3-33B-UNCENSORED-GGUF, con matriz de importancia (imatrix) segun las etiquetas del repo, y el espejo conserva la revision fuente `48e83e05611ef35d343ae5232f0078d85ff516e3` con los bytes sin modificar. No hay informacion sobre decodificacion especulativa, atencion lineal ni otras innovaciones tecnicas.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, etiqueta "conversational").
- Generacion y correccion de codigo: 17/20 pruebas locales de codigo superadas (85% en el subconjunto HumanEval+ local).
- Llamadas a herramientas: 65% de acierto en 40 llamadas BFCL-style locales.
- Comprension de ciberseguridad: 78,89/100 en el dominio correspondiente (CTI, CyberMetric).
- Conocimiento general y matematicas: 86,43/100 de dominio (92,86% en subconjunto MMLU-Pro, 80% en MATH-500 niveles 4-5, con muestras muy pequenas).
- Seguimiento de instrucciones: 80% en IFEval strict prompt pass.
- Comprension social/emocional: 54,52/100 (EQ-Bench v2: 64,60).
- Bucles agenticos: 7/12 casos mecanicos superados (58,33%), el punto mas debil del perfil.
- Soporte bilingue ingles/chino.
- No hay informacion sobre capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Chatbots sin filtros para investigacion: al ser una variante UNCENSORED, permite estudiar el comportamiento de un modelo de 33B sin capas de alineacion, util en investigacion de seguridad y alineacion.
- Asistencia de codigo local: con un 85% en las pruebas locales de codigo y soporte GGUF, puede ejecutarse en local como asistente de programacion sin enviar codigo a servicios externos.
- Analisis de ciberseguridad: su mejor dominio medido es ciberseguridad (78,89/100; 86,67% en root-cause/CWE), adecuado para clasificacion de vulnerabilidades, analisis de inteligencia de amenazas y consultas sobre CWE.
- Generacion bilingue chino/ingles: util para equipos que trabajan con documentacion o comunicacion en ambos idiomas.
- Automatizacion agente con supervision: puede integrarse en pipelines con herramientas, aunque su tasa de paso en casos agenticos (7/12) recomienda supervision humana y no uso autonomo critico.
- Evaluacion comparativa de cuantizaciones: al ser un espejo con configuracion exacta medida, sirve como referencia reproducible para comparar el impacto de la cuantizacion Q6_K frente a otras.
- Experimentacion con hardware de consumo/servidor: el formato GGUF permite despliegue con llama.cpp, Ollama, LM Studio y similares sin GPU de gama alta obligatoria.

## Benchmarks y rendimiento

Resultados de la evaluacion Mango sobre la configuracion exacta probada (subconjuntos pequenos y graders locales; no son pipelines oficiales completos):

| Dominio | Puntuacion /100 | Peso |
|---|---|---|
| Social / comprension emocional | 54,52 | 30% |
| Ciberseguridad | 78,89 | 20% |
| Codigo | 85,00 | 10% |
| Comprobaciones agenticas | 61,67 | 30% |
| Seguimiento de instrucciones | 80,00 | 5% |
| Conocimiento general / matematicas | 86,43 | 5% |

Puntuacion ponderada total: 67,46/100. Casos agenticos mecanicos: 7/12.

| Tarea / grader local | n | Media / % paso | Intervalo 95% |
|---|---|---|---|
| EQ-Bench v2 | 30 | 64,60 | 55,75-73,28 |
| OpenToM labels | 18 | 44,44 | 24,56-66,28 |
| CTI multiple choice | 20 | 65,00 | 43,29-81,88 |
| CTI root-cause / CWE | 15 | 86,67 | 62,12-96,26 |
| CyberMetric | 20 | 85,00 | 63,96-94,76 |
| Llamadas BFCL-style locales | 40 | 65,00 | 49,51-77,87 |
| HumanEval+ local | 20 | 85,00 | 63,96-94,76 |
| IFEval strict prompt | 20 | 80,00 | 58,40-91,93 |
| MMLU-Pro (subconjunto) | 14 | 92,86 | 68,53-98,73 |
| MATH-500 niveles 4-5 | 5 | 80,00 | 37,55-96,38 |
| Heuristica de bucle agente | 12 | 58,33 | 31,95-80,67 |

Rendimiento registrado: carga de trabajo completa de 175,31 minutos (202 preguntas + 12 casos agente); latencia p50/p95 de peticion 14,61/197,59 s; TTFT p50/p95 0,21/0,92 s; tasa mediana de tokens de salida ~41,45 tokens/segundo (calculada a partir de contadores del motor, no throughput nativo); 381.782 tokens de completado en total. No se han publicado resultados de benchmarks estandar oficiales (MMLU completo, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El payload GGUF Q6_K ocupa 27,17 GB en disco; a eso hay que sumar KV cache y memoria de trabajo, por lo que una GPU con 32 GB (RTX 5090, A100 40 GB) o despliegue parcial en CPU/GPU (offload) es lo realista.
- GPU recomendadas: RTX 4090/5090 con offload parcial a RAM; RTX A6000 o A100 40 GB para carga completa en GPU; en CPU puro, al menos 32 GB de RAM y se esperan velocidades bajas.
- Consumer GPU: no cabe completo en una RTX 4090 de 24 GB; cabe con offload de capas a RAM (rendimiento reducido). En GPUs de 32 GB si cabe completo.
- Opciones de despliegue: cualquier runtime compatible con GGUF: llama.cpp, Ollama, LM Studio, KoboldCpp. No hay soporte de vLLM/TGI directo para GGUF (requeririan los pesos originales en otro formato).
- Latencia y throughput: segun la evaluacion Mango, TTFT mediano de 0,21 s y ~41,45 tokens/s de tasa reportada en su infraestructura de prueba; el rendimiento real dependera del hardware y del offload.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Nanbeige 4.3 33B UNCENSORED Q6_K (este) | 33,1B | GGUF | no disponible | dealignai-community-model-license-v0.3 | Sin alineacion; Mango 67,46/100 |
| Qwen 2.5 32B | 32,5B | safetensors/GGUF | 128K | Apache 2.0 / Qwen | Fuerte en codigo y agente, alineado, licencia permisiva |
| Yi-1.5 34B | 34,4B | safetensors/GGUF | 32K | Apache 2.0 | Bilingue chino/ingles, alineado |
| Llama 3.1 70B | 70,6B | safetensors/GGUF | 128K | Llama 3.1 Community | Mayor tamano, requiere mas VRAM |

La comparativa es orientativa: no hay benchmarks oficiales comparables publicados para este modelo en la informacion disponible, y su diferenciador principal es la ausencia de alineacion y la licencia comunitaria de dealignai, mas restrictiva que Apache 2.0.

## Limitaciones y advertencias

- Al ser una variante UNCENSORED, el modelo puede generar contenido que otros modelos rechazarian; su uso conlleva responsabilidad legal y etica directa del operador.
- Riesgo de alucinacion: no evaluado especificamente en la informacion disponible; como todo LLM, debe verificarse en usos criticos.
- Debil en tareas agenticas: solo 7/12 casos mecanicos superados y 54,52/100 en comprension social/emocional; no recomendado para agentes autonomos sin supervision.
- Contexto maximo no documentado; conviene confirmarlo en el modelo base antes de disenar aplicaciones con documentos largos.
- Licencia personalizada (dealignai-community-model-license-v0.3, tipo "other"): revisar el archivo LICENSE.md antes de uso comercial; probablemente mas restrictiva que licencias abiertas.
- Las puntuaciones de benchmark provienen de subconjuntos pequenos y graders locales (n entre 5 y 40), con intervalos de confianza amplios; no son comparables directamente con pipelines oficiales.
- El propio autor del espejo senala que esta configuracion esta entre las puntuaciones mas bajas de su muestra, sin que ello caracterice todas las builds de Nanbeige.
- Los datos de rendimiento (tokens/s, TTFT) corresponden a la infraestructura de prueba de Mango y no representan served concurrente ni throughput nativo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/isilicon/mango-nanbeige43-33b-uncensored-q6k
- Modelo base (fuente): https://huggingface.co/dealignai/Nanbeige4.3-33B-UNCENSORED-GGUF
- Coleccion completa Mango: https://huggingface.co/collections/isilicon/mango-tested-models-and-preservation-mirrors-6ae3b73994c895ab42e360d2
- Resultados detallados de evaluacion Mango: https://huggingface.co/datasets/isilicon/mango-evaluation-results
- Comunidad Discord (Infinity): https://discord.gg/5n5YDbQCMy
