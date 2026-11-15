# elly99/MarCognity-AI

## Resumen

MarCognity-AI es un framework modular de codigo abierto publicado en Hugging Face por el usuario elly99, orientado al analisis estructurado y la verificacion de afirmaciones basada en fuentes en sistemas construidos sobre modelos de lenguaje. No se trata de un modelo de pesos entrenado desde cero, sino de una arquitectura de capas que orquesta modulos independientes: clasificacion de problemas, prompting academico, recuperacion cientifica asincrona, evaluacion semantica, un agente esceptico de verificacion oracion por oracion, grounding factual, memoria vectorial con FAISS y visualizacion cognitiva.

El objetivo declarado por el autor es hacer observable la incertidumbre epistemica a nivel de afirmacion en las salidas de un LLM. El framework no pretende resolver las alucinaciones, sino documentar de forma reproducible los modos de fallo de la metacognicion artificial: segun el autor, las capas metacognitivas basadas en LLM optimizan la coherencia linguistica pero no logran exponer la falta de conocimiento fundamentado como una senal explicita.

Es relevante en el contexto de la investigacion sobre verificacion factual, RAG con auditoria semantica y alineamiento, pero el propio autor lo califica como framework de investigacion exploratoria no apto para produccion. El repositorio tiene 0 descargas, 4 likes, un tamano de 0.0 GB (sin pesos publicados) y declara los idiomas italiano e ingles. Los datasets referenciados son PubMed y arXiv, y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Framework modular sobre LLM (no es un modelo con pesos propios); modulos de clasificacion, recuperacion, evaluacion semantica, agente esceptico, FAISS y visualizacion |
| Parametros totales | no disponible (no se publican pesos en el repositorio) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | italiano (it), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 0.0 GB, sin artefactos de pesos) |

## Arquitectura y entrenamiento

MarCognity-AI no entrena un transformer propio ni publica pesos: es una capa de orquestacion que combina modulos independientes sobre modelos de lenguaje externos. La model card describe ocho componentes: clasificacion automatica del tipo de entrada, prompting academico multidisciplinar estructurado, recuperacion asincrona desde fuentes de acceso abierto (arXiv, PubMed, Zenodo, OpenAlex), evaluacion logica y semantica de respuestas, un agente esceptico que verifica afirmacion por afirmacion contra las fuentes recuperadas, extraccion de evidencia para grounding factual, memoria semantica persistente con FAISS para archivar y comparar salidas pasadas, y representacion conceptual estructurada.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO, porque el proyecto no entrena un modelo base. La innovacion tecnica declarada es el ciclo metacognitivo: descomponer la respuesta en afirmaciones atomicas, contrastarlas con fuentes recuperadas y puntuar coherencia semantica, generando informes reflexivos exportables en Markdown. El autor documenta explicitamente una fractura estructural: el sistema puede evaluar como esta escrita una respuesta (claridad, estructura, alineacion semantica) pero no determinar si las afirmaciones subyacentes son genuinamente conocidas o verificables.

## Capacidades

- Generacion cientifica asistida por LLM con prompting academico estructurado y multidisciplinar.
- Recuperacion e integracion de fuentes de acceso abierto: arXiv, PubMed, Zenodo y OpenAlex.
- Evaluacion metacognitiva multinivel de las respuestas generadas.
- Verificacion epistemica a nivel de oracion mediante el agente esceptico.
- Analisis de riesgo etico y sesgo en las salidas.
- Memoria semantica persistente con FAISS para archivar y comparar outputs historicos.
- Generacion de informes reflexivos exportables en Markdown.
- Clasificacion automatica del tipo de problema de entrada.
- Visualizacion cognitiva mediante representacion conceptual estructurada.
- Soporte de busqueda semantica (tag semantic-search) y auditoria semantica.

## Casos de uso

- Auditoria de respuestas cientificas: dado un texto generado sobre un tema biomedico, el framework lo descompone en afirmaciones y las contrasta contra PubMed y OpenAlex, marcando cuales carecen de respaldo documental. Es adecuado porque integra recuperacion asincrona y verificacion oracion por oracion.
- Revision de literatura asistida: el modulo de prompting academico y la recuperacion desde arXiv permiten generar sintesis con trazabilidad de fuentes, util en fases exploratorias de revision sistematica.
- Investigacion sobre alucinacion y calibracion: el benchmark cross-domain de 72 tareas (9 por dominio en medicina, neurociencia, biologia, estadistica, linguistica, informatica, fisica y derecho) permite comparar un LLM base frente a la arquitectura con verificacion, usando un LLM independiente como evaluador.
- Deteccion de sesgo y riesgo etico: el modulo de analisis etico puede aplicarse a salidas de LLM en dominios sensibles (salud, derecho) para senalar afirmaciones con riesgo.
- Construccion de memoria de auditoria: FAISS archiva salidas pasadas y permite comparar respuestas a lo largo del tiempo, util para equipos que necesitan trazabilidad de decisiones asistidas por IA.
- Prototipado de pipelines RAG con verificacion: desarrolladores pueden reutilizar los modulos de recuperacion y agente esceptico como referencia arquitectonica para sistemas con grounding.
- Docencia y reproducibilidad metodologica: el journal cognitivo y la demo incluidos permiten estudiar de forma reproducible el desacoplamiento entre coherencia linguistica y conocimiento fundamentado.

## Benchmarks y rendimiento

La model card describe un benchmark cross-domain con 72 tareas (9 por cada uno de ocho dominios) comparando un LLM base sin verificacion epistemica frente a la arquitectura MarCognity-AI con ciclo metacognitivo y agente esceptico, evaluados por un LLM independiente mediante un protocolo de evaluacion epistemica basado en prompts. Sin embargo, no se publican en la informacion disponible los resultados numericos de dicho benchmark.

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, ya que el repositorio no contiene pesos propios; los requisitos dependen del LLM subyacente que se integre.
- GPU recomendadas: no disponible; dependera del modelo base elegido para cada modulo.
- Cabe en GPU consumer: no determinable sin conocer el LLM subyacente; el componente FAISS para memoria vectorial puede ejecutarse en CPU.
- Opciones de despliegue: el repositorio declara compatibilidad con endpoints (tag endpoints_compatible) y uso via la libreria transformers; el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. MarCognity-AI no es un modelo de lenguaje con pesos comparables, sino un framework de verificacion y orquestacion; la informacion proporcionada no incluye frameworks alternativos con los que contrastarlo en parametros, contexto o rendimiento.

## Limitaciones y advertencias

- El propio autor declara que es un framework de investigacion exploratoria y no esta destinado a uso en produccion.
- Limitacion estructural documentada: el sistema evalua coherencia linguistica pero no puede determinar si las afirmaciones son epistemicamente justificadas; puede indicar que una respuesta es poco clara, pero no que carece de conocimiento fundamentado.
- Riesgo de alucinacion: el framework no elimina las alucinaciones del LLM subyacente; solo intenta exponerlas y documentarlas.
- Idiomas limitados a italiano e ingles; no hay soporte declarado de castellano.
- No se publican pesos ni artefactos de modelo (repositorio de 0.0 GB), por lo que no es desplegable como modelo autonomo.
- Sin descargas registradas (0) y con solo 4 likes: madurez y validacion externa muy limitadas.
- El benchmark interno carece de resultados numericos publicados en la informacion disponible, lo que impide verificar sus afirmaciones de rendimiento.
- La licencia Apache 2.0 permite uso comercial del codigo, pero al integrar LLMs de terceros deben respetarse las licencias de esos modelos.
- Las interacciones comunitarias citadas (hilos de Hugging Face, DeepSeek y Google) se presentan explicitamente como no endosadas por esas organizaciones.

## Enlaces

- Hugging Face: https://huggingface.co/elly99/MarCognity-AI
- Discusiones en Hugging Face: https://huggingface.co/elly99/MarCognity-AI/discussions
- Hilo de la comunidad DeepSeek citado: https://huggingface.co/elly99/MarCognity-AI/discussions
- Respuesta de la organizacion Google (snapshot): https://huggingface.co/google/gemma-2b-it/discussions/70#68ecace9e79b11c589bcead9
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
