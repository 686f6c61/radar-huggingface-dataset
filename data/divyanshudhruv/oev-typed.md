# divyanshudhruv/oev-typed

## Resumen
OEV (oev-typed) es un modelo de decisión de pequeno tamano publicado por el desarrollador divyanshudhruv, cuyo repositorio en HuggingFace ocupa 2,9 GB. No es un modelo generativo de texto: recibe un estado y una serie de preguntas tipadas (choice, noul o score) y devuelve distribuciones de probabilidad calibradas en un unico forward pass, en lugar de producir lenguaje natural de forma autorregresiva. La idea es separar la toma de decisiones rapidas ("System One") de la generacion de texto.

El modelo sigue la interfaz de modelo System One popularizada por Jev, el modelo propietario de TypeSafe AI (San Francisco, fundada en 2024 y con una ronda semilla de 40 millones de dolares liderada por DCVC), y por Laya. Jev se presento en acceso anticipado el 15 de septiembre de 2026 y su API hospedada abrio el 21 de septiembre de 2026 a 0,042 dolares por millon de tokens de entrada, con salida gratuita. La propuesta de esta familia es sustituir la generacion autorregresiva por primitivas tipadas (Noul, Choice, Score) para flujos de control de agentes.

La relevancia de OEV radica en su enfoque de bajo coste y baja latencia: al no generar texto, puede resolver decisiones en un solo paso hacia delante. Segun las cifras publicadas para Jev, este tipo de modelos reduce la latencia extremo a extremo a 70-500 ms y el coste de inferencia en torno a 400 veces respecto a enfoques generativos. No se dispone de datos publicos sobre el numero de parametros, el contexto o el entrenamiento especifico de oev-typed.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decision no generativo tipo System One; puntua preguntas tipadas sobre un estado en un unico forward pass (detalles de la red no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (tamano del repo: 2,9 GB) |

## Arquitectura y entrenamiento
La descripcion publica indica que OEV sigue la interfaz de los modelos System One: en lugar de generar texto, puntua preguntas tipadas sobre un estado dado en un unico forward pass y devuelve distribuciones de probabilidad calibradas. Los tipos de pregunta mencionados son choice (eleccion entre opciones), noul y score (puntuacion). No se especifica la arquitectura interna (transformer, SSM u otra), el numero de parametros ni la composicion del dataset de entrenamiento.

No se ha publicado informacion sobre el volumen de tokens de entrenamiento, la posible aplicacion de RLHF o DPO, ni innovaciones tecnicas concretas mas alla de la propia naturaleza no generativa y de la calibracion de las probabilidades de salida. El repositorio ocupa 2,9 GB, lo que da una referencia del tamano de los pesos, pero no permite deducir la arquitectura ni la precision de almacenamiento.

## Capacidades
- Decision tipada: responde a preguntas de tipo choice, noul y score sobre un estado de entrada.
- Salida de probabilidades calibradas: devuelve distribuciones de probabilidad en lugar de texto, lo que facilita umbrales y politicas deterministas.
- Inferencia en un unico forward pass: no emplea decodificacion autorregresiva.
- No genera lenguaje natural: la descripcion del proyecto lo indica explicitamente.
- Uso previsto como modelo de decision para flujos de control de agentes y software.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agentes y razonamiento multi-paso: no disponible (el modelo esta pensado como componente de decision, no como agente autonomo).
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso
- Enrutado de decisiones en agentes: dado un estado (contexto de la tarea) y una pregunta de tipo choice, el modelo devuelve la opcion mas probable, permitiendo seleccionar la siguiente accion sin llamar a un LLM generativo.
- Clasificacion binaria en pipelines: con preguntas de tipo noul, se puede obtener una probabilidad de si/no calibrada para filtrar, aprobar o descartar elementos en un flujo automatizado.
- Puntuacion y ranking: mediante preguntas de tipo score, el modelo puede ordenar candidatos, respuestas o resultados en tareas de seleccion.
- Control de flujos en produccion: al no generar texto, encaja en bucles de control donde la latencia debe ser de decenas o cientos de milisegundos, tal como describe la familia System One.
- Moderacion o validacion de contenido: usar la salida de probabilidad calibrada para decidir si un contenido cumple una politica, con umbrales ajustables.
- Automatizacion de reglas de negocio con incertidumbre: sustituir condiciones rigidas por probabilidades calibradas que permitan decisiones graduales.
- Evaluacion rapida en prototipos de investigacion: probar la interfaz de preguntas tipadas sobre estados sinteticos para comparar con modelos generativos en coste y latencia.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, el repositorio ocupa 2,9 GB, por lo que una copia de los pesos en memoria requeriria al menos esa cantidad, mas el overhead del runtime (estimacion orientativa, no confirmada).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable en tarjetas con 4-8 GB de VRAM o mas si el tamano de los pesos es de 2,9 GB, aunque no hay confirmacion oficial (estimacion orientativa).
- Opciones de despliegue: no disponible (no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI).
- Latencia y throughput: no disponible para OEV. Como referencia de la familia System One, Jev reporta latencias extremo a extremo de 70-500 ms y una reduccion de coste de inferencia de aproximadamente 400x respecto a enfoques generativos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oev-typed (divyanshudhruv) | Decision no generativa (System One) | no disponible | no disponible | no disponible | HuggingFace, 0 descargas, 1 like |
| Jev (TypeSafe AI) | Decision no generativa (System One) | no disponible | no disponible | propietaria | API hospedada desde 21-09-2026, 0,042 USD/1M tokens de entrada |
| Laya | Decision no generativa (System One) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- No genera texto: no puede emplearse para tareas de generacion, resumen, traduccion o conversacion directa.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no aplica en el sentido clasico (no produce texto), pero las probabilidades calibradas pueden estar mal calibradas en dominios fuera de su distribucion de entrenamiento; no hay datos al respecto.
- Limitaciones de contexto o idioma: no disponible; se desconoce la longitud de contexto y los idiomas soportados.
- Restricciones de licencia: la licencia no esta declarada, por lo que no se puede confirmar el uso comercial; conviene contactar con el autor antes de usarlo en produccion.
- Madurez y soporte: el modelo no tiene descargas registradas y cuenta con un unico "like", lo que sugiere un proyecto en fase muy temprana o experimental.
- Dependencia de la interfaz tipada: el modelo esta disenado para preguntas de tipo choice, noul y score; el uso fuera de esa interfaz no esta documentado.
- Falta de benchmarks: no hay resultados publicos que permitan comparar su rendimiento con alternativas.

## Enlaces
- HuggingFace: https://huggingface.co/divyanshudhruv/oev-typed
- Repositorio GitHub del proyecto: https://github.com/divyanshudhruv/oev
- Perfil GitHub del autor: https://github.com/divyanshudhruv
- Jev (AI model) - Wikipedia: https://en.wikipedia.org/wiki/Jev_(AI_model)
- Jev AI Model (TypeSafe) - sitio oficial: https://jevmodel.org/
- Noticia sobre el lanzamiento de Jev: https://todayforai.com/en/news/20260920-news-typesafe-ai-jev-model-release
