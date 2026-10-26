# alpha-coder-great/al-rasheed-ai

## Resumen

Al-Rasheed AI es un modelo de lenguaje en formato GGUF publicado por el usuario alpha-coder-great en HuggingFace, presentado por su autor como un ajuste fino orientado a conocimiento islamico, referencias coranicas y asistencia religiosa basica. El modelo se distribuye unicamente como fichero cuantizado Q4_K_M y forma parte del proyecto Al-Rasheed Islamic App, una aplicacion movil de enfoque offline-first que integra chat con IA local y, segun la model card, un modelo separado de recitacion.

La informacion tecnica publicada es muy escasa: el autor no declara numero de parametros, licencia, idiomas soportados ni composicion del dataset de entrenamiento. La unica referencia arquitectonica es la del propio system prompt del Modelfile, que afirma que el modelo esta construido sobre la arquitectura Llama 3, extremo que no se ha verificado de forma independiente ni se acompana de especificaciones de capas, dimensiones o tokenizador.

Su relevancia actual es limitada pero concreta: cubre un nicho (asistencia islamica en local, sin dependencia de servicios en la nube) con un volumen de descargas no trivial (2.772 descargas, 2 likes) y un tamano de repositorio de 2,0 GB que sugiere un modelo de pocos miles de millones de parametros. No se han publicado benchmarks ni resultados de evaluacion; el autor anuncia una "Islamic LLU evaluation" futura que, a fecha de la informacion disponible, no esta publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; el autor indica que esta basado en Llama 3 (no verificado de forma independiente) |
| Parametros totales | no disponible (el repositorio ocupa 2,0 GB y el unico peso publicado es Q4_K_M) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | 8192 tokens, segun el parametro `num_ctx` del Modelfile; no se confirma si es el maximo nativo del modelo base |
| Tipos de cuantizacion | Q4_K_M (GGUF); no se documentan otras variantes |
| Idiomas soportados | no disponible (no declarados en los metadatos de HuggingFace ni en la model card) |
| Licencia | no disponible (no declarada) |
| Formato de pesos | GGUF (`al-rasheed-ai-Q4_K_M.gguf`) |
| Nombre del modelo | Al-Rasheed AI |
| Autor | alpha-coder-great |
| Pipeline declarado | no disponible |
| Descargas / likes | 2772 / 2 |
| Fecha de creacion | 2026-07-14 |
| Ultima actualizacion | 2026-10-26 |
| Tamano del repositorio | 2,0 GB |
| Temperatura recomendada | 0.7 (declarada en el Modelfile) |

## Arquitectura y entrenamiento

El autor describe el modelo como un ajuste fino ("fine-tuned language model") de un modelo existente, sin especificar cual. La unica indicacion arquitectonica es el system prompt del Modelfile, donde se afirma: "You are built on the Llama 3 architecture and are a helpful, accurate AI assistant". No se aportan datos sobre numero de capas, dimensiones ocultas, cabezas de atencion, tokenizador ni ventana de contexto nativa; el valor de 8192 tokens procede del parametro `num_ctx` del propio Modelfile, que en llama.cpp puede fijarse por debajo o por encima del contexto nativo del modelo, por lo que no constituye una especificacion arquitectonica fiable.

No se ha publicado informacion sobre el corpus de entrenamiento: ni numero de tokens, ni composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT supervisado. Tampoco se documentan innovaciones tecnicas (atencion lineal, decodificacion especulativa, modos de razonamiento). El unico artefacto de configuracion visible es un Modelfile con un prompt de sistema que fija la identidad del asistente, temperatura 0.7 y contexto de 8192; se trata, por tanto, de una publicacion centrada en el artefacto de inferencia y no en la trazabilidad del entrenamiento. El autor menciona que existe un modelo futuro distinto en desarrollo, sin dar detalles.

## Capacidades

- Generacion de texto conversacional en el dominio islamico: conceptos basicos, terminologia religiosa, practicas y preguntas cotidianas.
- Explicacion introductoria de pasajes coranicos y de ensenanzas asociadas, segun la model card.
- Asistencia sobre dictamenes islamicos basicos ("Islamic rulings assistance"), con advertencia explicita del autor de que no sustituye a muftis ni ulemas.
- Orientacion para identificar que cuestiones requieren consulta con scholars y fuentes autenticas.
- Despliegue totalmente offline: inferencia local sin llamadas a servicios en la nube.
- Identidad de asistente fijada por prompt de sistema ("Al-Rasheed-AI"), con instruccion de no presentarse como QuranGuide salvo pregunta explicita sobre versiones anteriores.
- Tool calling / function calling: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Capacidades multilingues: no disponible; no se declaran idiomas en los metadatos.
- Vision, audio u otras modalidades: no disponible en este modelo. La model card menciona un modelo de recitacion con feedback de pronunciacion como componente separado del proyecto de aplicacion, no como capacidad de este GGUF.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Asistente de consulta islamica en local: desplegado con llama.cpp u Ollama en un portatil o movil, el modelo responde preguntas sobre conceptos y terminologia islamica sin enviar datos a terceros, lo que encaja con el enfoque offline-first declarado por el proyecto.
- Integracion en la aplicacion Al-Rasheed Islamic App: el GGUF esta pensado para ejecutarse embebido en la app, de modo que el chat funcione sin conexion y con la identidad de asistente ya fijada por el Modelfile.
- Apoyo al estudio de terminologia y contenidos basicos: util como primer punto de contacto para lectores que necesitan una explicacion introductoria antes de acudir a fuentes primarias o a un scholar.
- Triaje de preguntas religiosas: el modelo puede clasificar una consulta y senalar si requiere derivacion a un especialista, funcion coherente con la advertencia de la model card sobre no sustituir a muftis.
- Borradores de contenido divulgativo para comunidades y mezquitas: generacion de textos introductorios que despues se revisan y validan manualmente contra fuentes citables.
- Escenarios de privacidad estricta: entornos donde no se permite enviar consultas a APIs externas (por ejemplo, dispositivos de usuarios sin conectividad estable o con requisitos de residencia de datos), aprovechando que el peso Q4_K_M ocupa 2,0 GB y puede ejecutarse en CPU.
- Pruebas de concepto de asistentes verticalizados: serviria como base para experimentar con prompts de sistema, temperatura y contexto en un dominio concreto antes de invertir en un ajuste fino propio, siempre que se resuelva antes la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card anuncia una futura "Islamic LLU evaluation" para este modelo y para una version posterior, pero no incluye metodologia, dataset, puntuaciones ni fecha de publicacion. No hay datos de MMLU, HumanEval, GSM8K, ARC ni de evaluaciones especificas del dominio islamico, y no se han encontrado en la busqueda web fuentes independientes que los aporten.

## Requisitos de hardware

- VRAM estimada: los pesos Q4_K_M de un repositorio de 2,0 GB ocupan aproximadamente 2,0-2,2 GB en memoria; a ello hay que sumar la cache KV para 8192 tokens, que depende de capas y cabezas de atencion (no publicadas). Estimacion orientativa total: 3-4 GB, no confirmada por el autor.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650 4 GB, RTX 3050, RTX 4060, RTX 3060 12 GB). Una A100 o H100 es innecesaria para este tamano y no aportaria ventaja practica frente a una consumer de gama media.
- CPU: al ser un unico fichero Q4_K_M de ~2 GB, la inferencia solo en CPU es viable en equipos de escritorio y en muchos portatiles, con velocidades no medidas.
- Opciones de despliegue: llama.cpp, Ollama (via Modelfile, que ya existe en la model card), LM Studio, llama-cpp-python, KoboldCpp. vLLM y TGI tienen soporte de GGUF limitado o experimental y no son la via natural para este artefacto.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo en ninguna configuracion de hardware.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye parametros, contexto nativo, licencia ni resultados de evaluacion que permitan una comparacion cuantitativa fiable con alternativas. Ademas, la busqueda web realizada no ha devuelto ninguna fuente relevante sobre este modelo ni sobre ajustes finos islamicos comparables (los resultados obtenidos tratan sobre la letra griega alpha y sobre el programa cristiano Parcours Alpha, sin relacion con el modelo).

| Criterio | Al-Rasheed AI | Alternativa comparable |
|---|---|---|
| Parametros | no disponible | no disponible |
| Contexto | 8192 tokens (configurado) | no disponible |
| Benchmarks publicos | ninguno | no disponible |
| Licencia | no declarada | no disponible |
| Formato | GGUF Q4_K_M | no disponible |

Para evaluar alternativas, el criterio practico seria buscar ajustes finos en GGUF con licencia explicita (Apache 2.0 o Llama Community License), parametros declarados y evaluaciones publicadas en el dominio islamico; ninguno de esos datos esta presente aqui.

## Limitaciones y advertencias

- Riesgo de alucinacion alto en un dominio de alta sensibilidad: el propio autor advierte de que la calidad y exactitud de las respuestas varia y de que el usuario debe verificar citas coranicas, hadices, opiniones de scholars y dictamenes antes de confiar en ellos.
- El modelo no sustituye a muftis ni ulemas; su uso como fuente normativa constituiria un uso indebido segun la propia model card.
- Ausencia de licencia declarada: sin terminos explicitos, el uso comercial, la redistribucion o el reempaquetado quedan en una situacion juridica incierta. Es un bloqueante para produccion.
- Sin datos de entrenamiento publicados: no puede evaluarse la procedencia de las fuentes, el sesgo doctrinal ni la representatividad de las escuelas juridicas cubiertas.
- Idiomas no declarados: se desconoce el rendimiento fuera de los idiomas con los que se entreno el modelo base, y no hay evaluacion multilingue.
- Parametros y arquitectura no confirmados: la afirmacion de que esta basado en Llama 3 proviene del system prompt, no de una ficha tecnica; el tamano real del modelo base es desconocido.
- Solo se publica una cuantizacion Q4_K_M: no hay versiones de mayor precision (Q8, fp16) para auditar el comportamiento del modelo sin perdida de cuantizacion.
- Sin evaluaciones independientes: no hay MMLU ni metricas de dominio, y la "Islamic LLU evaluation" anunciada no esta disponible, por lo que no es posible comparar su calidad con alternativas.
- Contexto de 8192 tokens configurado por parametro: no se garantiza que el modelo base soporte esa longitud sin degradacion, y no hay pruebas publicadas de rendimiento en contextos largos.
- Metadatos llamativos: las fechas de creacion (2026-07-14) y actualizacion (2026-10-26) son posteriores a la fecha habitual de publicacion de modelos Llama 3; conviene verificar la trazabilidad del repositorio antes de integrarlo.
- Idoneidad limitada para tareas generales: no hay evidencia de soporte de tool calling, agentes ni codigo; tratarlo como un asistente conversacional de nicho.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alpha-coder-great/al-rasheed-ai
- Sitio oficial del proyecto y descarga de la app: https://rashidgamer2012.github.io/Al-Rasheed-AI/
- Paper, blog tecnico o repositorio de entrenamiento: no disponible
- Resultados de la evaluacion "Islamic LLU": no disponibles (anunciados, no publicados)
- Demo publica: no disponible
