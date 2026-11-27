# FlagRelease/Innata-0-BF16-mthreads-FlagOS

## Resumen

Innata-0 es un sistema de IA encarnada (embodied AI) desarrollado por BAAI (Beijing Academy of Artificial Intelligence) que combina un modelo de mundo con un agente para tareas roboticas. El repositorio `FlagRelease/Innata-0-BF16-mthreads-FlagOS` es una adaptacion del modelo Innata-0 publicada por la comunidad FlagOS, optimizada para su ejecucion sobre aceleradores Moore Threads (MTT S5000) mediante el stack de software FlagOS. El modelo se distribuye en formato BF16 y esta disenado para despliegue multi-chip.

El sistema se estructura en dos componentes principales: Innata-0-WAM (World Action Model), que emplea una arquitectura Mixture-of-Transformers de tres torres para modelar conjuntamente comprension del mundo, prediccion visual condicionada a acciones y generacion de acciones y tacto; e Innata-0-Agent, responsable de la planificacion de tareas, validacion de ejecucion, recuperacion de errores y acumulacion de experiencia reutilizable. En el benchmark de simulacion RoboCasa365, la combinacion del WAM base con el stack completo de agente eleva la tasa de exito global del 60,2% al 65,4%, y del 32,4% al 43,6% en tareas composicionales no vistas.

La relevancia de esta publicacion radica en su enfoque de adaptacion Day0 a seis plataformas de hardware (NVIDIA, MetaX, Hygon, Ascend, Moore Threads y T-Head), lo que facilita el despliegue de modelos encarnados sobre hardware diverso. El repositorio incluye scripts de inferencia preconfigurados y una imagen de contenedor FlagOS-Mthreads para despliegue en minutos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers de tres torres (Innata-0-WAM) mas agente de planificacion (Innata-0-Agent) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (unico formato publicado en este repositorio) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Innata-0-WAM emplea una arquitectura Mixture-of-Transformers con tres torres especializadas que modelan de forma conjunta la comprension del mundo, la prediccion visual condicionada a acciones y la generacion de acciones y senales tactiles. Esta separacion en torres permite al modelo procesar simultaneamente informacion perceptiva y motora, un requisito central en entornos roboticos donde la prediccion del estado futuro del mundo debe estar condicionada por la accion del agente. El componente Innata-0-Agent se construye mediante co-diseno de modelo y agente, e incorpora modulos de planificacion de tareas, validacion de ejecucion, recuperacion ante errores y acumulacion de experiencia reutilizable.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card menciona la existencia de variantes adicionales del sistema, como Innata-0-Understanding y Innata-0-ACWM (Action-Conditioned World Model), que se sirven mediante scripts de inferencia independientes dentro del contenedor. La adaptacion FlagOS se apoya en el stack tecnico compuesto por FlagScale (orquestacion de entrenamiento e inferencia), FlagGems (biblioteca de operadores en Triton), FlagCX (comunicacion distribuida) y FlagTree (compilador unificado multi-backend).

## Capacidades

- Comprension del mundo encarnado: interpretacion de escenas y estados del entorno para fundamentar la toma de decisiones del agente.
- Prediccion visual condicionada a acciones (Action-Conditioned World Modeling): generacion del estado visual futuro dado un estado actual y una accion propuesta.
- Generacion de acciones roboticas: produccion de comandos motores a partir de la planificacion y el estado del mundo.
- Generacion de senales tactiles: el modelo incorpora modelado tactil junto con la generacion de acciones.
- Planificacion de tareas multi-paso: el agente descompone objetivos complejos en subtareas ejecutables.
- Validacion de ejecucion y recuperacion de errores: verificacion del resultado de cada accion y replanificacion ante fallos.
- Acumulacion de experiencia reutilizable: el agente almacena conocimiento de ejecuciones previas para mejorar tareas futuras.
- Soporte multilingue limitado a chino e ingles.
- Despliegue multi-chip: adaptado a NVIDIA, MetaX, Hygon, Ascend, Moore Threads y T-Head.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.

## Casos de uso

- Manipulacion robotica en simulacion: el modelo WAM genera acciones motoras condicionadas al estado visual del entorno, adecuado para entrenamiento y evaluacion de politicas roboticas en RoboCasa365 y RoboDojo.
- Planificacion de tareas de largo horizonte: el agente descompone instrucciones complejas en secuencias de subtareas, valida cada paso y replanifica ante fallos, lo que resulta util en entornos domesticos simulados.
- Recuperacion ante errores en ejecucion robotica: cuando una accion falla, el agente detecta la desviacion respecto al plan y genera una estrategia alternativa, reduciendo la necesidad de intervencion humana.
- Prediccion de estados futuros para control predictivo: el modelo ACWM anticipa el resultado visual de una accion antes de ejecutarla, permitiendo filtrar comandos de alto riesgo en pipelines de control.
- Evaluacion comparativa de hardware para IA encarnada: la adaptacion FlagOS permite ejecutar el mismo modelo sobre seis plataformas de aceleradores distintos y comparar resultados y eficiencia de inferencia entre stacks nativos y el stack FlagOS.
- Investigacion en aprendizaje por refuerzo con modelos de mundo: el WAM puede actuar como simulador aprendido para entrenar politicas sin necesidad de interaccion fisica continua.
- Prototipado de asistentes roboticos en entornos simulados: la integracion con AnythingLLM documentada en la model card permite interactuar con el modelo mediante una interfaz conversacional para pruebas rapidas.
- Despliegue en infraestructura Moore Threads: el contenedor FlagOS-Mthreads permite poner en marcha el sistema en minutos sobre GPUs MTT S5000, util para organizaciones con hardware no NVIDIA.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible corresponden al benchmark de simulacion RoboCasa365 y comparan el WAM base frente al sistema completo con agente:

| Configuracion | Tasa de exito global | Tasa de exito en tareas composicionales no vistas |
|---|---|---|
| Innata-0-WAM (base) | 60,2% | 32,4% |
| Innata-0-WAM + Innata-0-Agent (stack completo) | 65,4% | 43,6% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 113,8 GB en BF16, lo que da una referencia del orden de magnitud de los pesos, pero no se detalla el reparto por componente ni el pico de memoria durante la inferencia.
- GPU recomendadas segun la model card: 4x Moore Threads MTT S5000 para el despliegue de referencia, con asignacion de una GPU por servicio (Understanding, ACWM, WAM-RoboDojo, WAM-RoboCasa365).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: contenedor Docker FlagOS-Mthreads con scripts de inferencia preconfigurados (`run_understanding.sh`, `run_acwm.sh`, `run_robodojo.sh`, `run_robocasa.sh`); descarga de pesos via ModelScope. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Entorno verificado: Ubuntu 22.04.4 LTS, Docker 24.0.9, driver 3.3.5-server, SDK 4.3.5.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Innata-0 (esta ficha) | no disponible | no disponible | Modelo de mundo encarnado + agente robotico | Apache 2.0 | Hugging Face (FlagRelease), ModelScope |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos directamente comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria practicamente nula.
- No se documentan sesgos conocidos, pero al estar entrenado principalmente con datos en chino e ingles, el rendimiento fuera de estos idiomas no esta caracterizado.
- Riesgo de alucinacion en la planificacion del agente: las tareas de recuperacion y validacion mitigan pero no eliminan la posibilidad de planes invalidos, especialmente en tareas composicionales no vistas, donde la tasa de exito cae al 43,6%.
- El rendimiento reportado proviene exclusivamente de simulacion (RoboCasa365); no hay evidencia publicada de transferencia a robots fisicos.
- La adaptacion esta verificada sobre Moore Threads MTT S5000 con un stack de software especifico (driver 3.3.5-server, SDK 4.3.5); otros entornos pueden requerir ajustes no documentados.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de documentacion sobre el dataset de entrenamiento impide evaluar riesgos de propiedad intelectual o de datos.
- No se especifican limitaciones de longitud de contexto ni requisitos de memoria por componente, lo que dificulta el dimensionamiento de infraestructura en produccion.
- El despliegue de referencia requiere cuatro GPUs dedicadas (una por servicio), lo que eleva el coste de infraestructura.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FlagRelease/Innata-0-BF16-mthreads-FlagOS
- AnythingLLM (integracion documentada): https://anythingllm.com/
- Triton (base de FlagGems): https://github.com/openai/triton
