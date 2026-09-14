# ImKyungjin/pi0-maniskill-stackcube-mixed-30pct-100ep-convex-0.4

## Resumen

El modelo `ImKyungjin/pi0-maniskill-stackcube-mixed-30pct-100ep-convex-0.4` es un ajuste fino del modelo π₀ (Pi0) de Physical Intelligence, una politica de tipo Vision-Language-Action (VLA) orientada al control de robots. La implementacion procede de LeRobot y esta adaptada del repositorio de codigo abierto OpenPI del propio autor original. Se trata de un modelo de robotica, no de un modelo de lenguaje de proposito general: recibe observaciones visuales e instrucciones en lenguaje natural y emite acciones de control.

Este checkpoint concreto ha sido entrenado sobre el conjunto de datos ManiSkill StackCube indicado en sus metadatos (`maniskill_stackcube_mixed_30pct_100ep`) y publicado por el usuario ImKyungjin, sin descargas ni valoraciones en el momento de redactar esta ficha. El sufijo del identificador sugiere una mezcla de datos al 30 % con 100 episodios y un parametro "convex" de 0,4, aunque esta interpretacion no esta documentada en la model card.

Su relevancia radica en que π₀ se presenta como la primera politica fundacional de robotica de proposito general capaz de operar sobre robots y tareas diversas, frente a los controladores clasicos especializados. El modelo cuenta con aproximadamente 3.501 millones de parametros y un repositorio de 7 GB en formato safetensors bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); π₀ de Physical Intelligence, implementacion LeRobot (OpenPI) |
| Parametros totales | 3.501.372.176 (aprox. 3,5 mil millones) |
| Parametros activos | no disponible (no se documenta una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (recibe instrucciones en lenguaje natural, pero no se listan idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria LeRobot) |

## Arquitectura y entrenamiento

El modelo es un VLA: combina un componente de vision-lenguaje con un modulo generador de acciones para producir comandos de control a partir de imagenes e instrucciones textuales. La implementacion utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence, y la model card remite al blog oficial de Physical Intelligence para los detalles de π₀. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

Por el identificador del repositorio, el entrenamiento se ha realizado sobre el conjunto `maniskill_stackcube_mixed_30pct_100ep`, aparentemente una mezcla con un 30 % de datos y 100 episodios. El propio nombre sugiere alguna forma de mezcla con parametro "convex 0,4", pero al no estar documentado se desconoce su significado tecnico exacto. No se han hecho publicas innovaciones adicionales (atencion lineal, decodificacion especulativa, etc.) en la informacion proporcionada.

## Capacidades

- Control de robot a partir de observaciones visuales e instrucciones en lenguaje natural (comportamiento VLA generico de π₀).
- Ejecucion de politicas de manipulacion entrenadas sobre la tarea StackCube (apilado de cubos) del conjunto ManiSkill en esta version concreta.
- Interpretacion de instrucciones textuales como entrada del modelo.
- Generacion de acciones motoras de salida para el robot objetivo.
- Soporte de tool calling / function calling: no disponible para un modelo de robotica.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): vision como entrada; el resto no disponible.

## Casos de uso

- Manipulacion robotica de apilado de objetos: este checkpoint esta entrenado sobre la tarea StackCube de ManiSkill y puede emplearse para reproducir politicas de apilado de cubos en entornos simulados o de laboratorio.
- Investigacion en aprendizaje por imitacion: permite experimentar con el pipeline de LeRobot a partir de un dataset concreto, sirviendo de punto de partida para comparar variantes de mezcla de datos.
- Evaluacion de politicas VLA en simulacion: al integrarse con `lerobot-record`, se puede ejecutar la politica sobre un robot (por ejemplo `so100_follower`) y registrar episodios de evaluacion.
- Base para ajuste fino en tareas de manipulacion especificas: partiendo de este checkpoint se puede continuar el entrenamiento con nuevos datasets de robotica mediante `lerobot-train`.
- Docencia y prototipado en robotica con IA: util para ilustrar como un modelo VLA une vision, lenguaje y accion en un unico pipeline replicable.
- Reproduccion de experimentos de mezcla de datos: el nombre del modelo sugiere un barrido sobre porcentajes de mezcla y numero de episodios, util para estudios de ablacion.
- Integracion en entornos de investigacion con GPU unica: su tamano permite desplegarlo en hardware de gama alta de consumo para pruebas locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no confirmada por el autor. Como referencia de orden de magnitud, 3,5 mil millones de parametros ocupan aproximadamente 7 GB en bf16/fp16 (coincide con el tamano de repositorio de 7 GB) y unos 14 GB en fp32; una cuantizacion a 8 bits rondaria los 4-6 GB. Estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: tarjetas con al menos 8-10 GB de VRAM para bf16, como RTX 3080/3090, RTX 4070/4080/4090; para entrenamiento o mayor margen, A100 o H100.
- Compatibilidad con GPU de consumo: si, es probable que quepa en GPU de gama alta de consumo con suficiente VRAM, aunque no se confirma oficialmente.
- Opciones de despliegue: LeRobot (`lerobot-train` para entrenamiento y `lerobot-record` para inferencia/evaluacion), con pesos en safetensors. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que ademas no son habituales para modelos de robotica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pi0-maniskill-stackcube-mixed-30pct-100ep-convex-0.4 (este) | 3,5 mil millones | no disponible | Apache 2.0 | HuggingFace (LeRobot) | Ajuste fino sobre StackCube |
| π₀ (Pi0) original, Physical Intelligence | no disponible en la informacion | no disponible | no disponible (consultar OpenPI) | Repositorio OpenPI | Politica VLA generalista de referencia |
| OpenVLA | no disponible en la informacion | no disponible | no disponible | no disponible | Alternativa VLA de codigo abierto |
| ACT (policy por defecto de LeRobot) | no disponible en la informacion | no disponible | no disponible | LeRobot | Politica de imitacion usada como linea base en los ejemplos de entrenamiento |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al ser una politica de robotica entrenada sobre un dataset concreto, su comportamiento esta fuertemente sesgado hacia la tarea y el entorno de ManiSkill StackCube.
- Riesgo de alucinacion: no aplica en el sentido textual, pero existe riesgo de generalizacion incorrecta fuera de la distribucion de entrenamiento (tareas, objetos o robots distintos).
- Limitaciones de contexto o idioma: la longitud de contexto no esta documentada y el soporte de idiomas no se especifica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base π₀ y del repositorio OpenPI del que deriva.
- Caveats para produccion: cero descargas y cero valoraciones, sin benchmarks publicados ni validacion externa; el significado de los sufijos del nombre (mezcla al 30 %, 100 episodios, "convex 0,4") no esta documentado; procede de un usuario individual y no de un laboratorio, por lo que la fiabilidad y el soporte no estan garantizados.
- No se documentan variantes cuantizadas ni datos de latencia, lo que dificulta planificar un despliegue en tiempo real.

## Enlaces

- HuggingFace: https://huggingface.co/ImKyungjin/pi0-maniskill-stackcube-mixed-30pct-100ep-convex-0.4
- Blog de π₀ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi0
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi (referenciado en la model card como "OpenPI repository")
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
