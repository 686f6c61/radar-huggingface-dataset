# gulucaptain/zero-wam-robotwin-version-b1-e200

## Resumen

Zero-WAM RoboTwin Version B (checkpoint `b1-e200`) es un adaptador de tipo LoRA publicado por el usuario `gulucaptain` sobre el modelo base `robbyant-research/zero-wam-pretrain`, desarrollado en el marco del proyecto Zero-WAM de Robbyant Research. Zero-WAM (In-Context World-Action Modeling) es un modelo de robotica que aprende a predecir acciones a partir de demostraciones humanas y observaciones multi-vista, con el objetivo de reducir el aprendizaje de atajos (*shortcut learning*) y mejorar la generalizacion cruzada entre tareas. Este checkpoint concreto corresponde a la variante "Version B" del conjunto RoboTwin y esta afinado para la tarea de manipulacion asociada.

El adaptador se inicializa desde el preentrenamiento Zero-WAM y utiliza una condicion *in-context* basada en una demostracion generada por HumanGen. La consulta del robot incorpora tres vistas (camara alta, muneca izquierda y muneca derecha) y aplica supervision futura con DINOv2 sobre la vista alta. El repositorio ocupa 22,4 GB e incluye, por cada directorio de epoca, los pesos del adaptador y metadatos de entrenamiento. El modelo base es obligatorio para su uso.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de investigacion para reproducir experimentos de robotica en el benchmark RoboTwin 2.0, no de un modelo de proposito general. No se dispone de informacion publica sobre licencia, idiomas ni resultados de benchmarks especificos de este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador sobre Zero-WAM, modelado world-action in-context) |
| Parametros totales | no disponible (repo de 22,4 GB, incluye pesos del adaptador y metadatos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, no orientado a lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | no disponible (pesos del adaptador por directorio de epoca; formato concreto no especificado) |

## Arquitectura y entrenamiento

Zero-WAM se presenta como un modelo de *world-action modeling* en contexto. La innovacion principal descrita en el repositorio es un objetivo de prediccion de *future chunk* en contexto, disenado para reducir el aprendizaje de atajos y reforzar el uso de prompts de video humano. El modelo demuestra generalizacion zero-shot entre tareas en RoboTwin 2.0 y en configuraciones de tareas no vistas en el mundo real, sin recopilar datos de robot correspondientes ni actualizar parametros.

Este checkpoint concreto es un adaptador A+B1 inicializado desde Zero-WAM pretrain. La condicion in-context es una demostracion HumanGen; la consulta del robot emplea tres vistas (alta, muneca izquierda y muneca derecha) y se aplica supervision futura con DINOv2 sobre la vista alta. El entrenamiento se organiza por epocas, con pesos y metadatos en cada directorio. No se dispone de informacion sobre el numero de tokens, la composicion del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Prediccion de acciones roboticas a partir de observaciones multi-vista (camara alta y dos vistas de muneca).
- Modelado world-action en contexto con demostraciones humanas como prompt.
- Generalizacion zero-shot entre tareas en RoboTwin 2.0, segun el proyecto base.
- Supervision futura con DINOv2 sobre la vista alta (representaciones visuales).
- No se documentan capacidades de lenguaje natural, tool calling, agentes conversacionales ni vision general.
- No se documentan capacidades multilingues.

## Casos de uso

- Reproduccion de experimentos en RoboTwin 2.0: el checkpoint permite reproducir la variante Version B del adaptador sobre el modelo base para validar resultados del paper o del repositorio.
- Investigacion en generalizacion zero-shot: util para estudiar como un adaptador inicializado desde Zero-WAM pretrain se comporta en configuraciones de tarea no vistas.
- Evaluacion de supervision DINOv2: permite analizar el efecto de la supervision futura sobre la vista alta en el aprendizaje de politicas de manipulacion.
- Comparacion de variantes A/B1: sirve como punto de comparacion frente a otros adaptadores del mismo proyecto para medir el impacto del diseno de condicion in-context.
- Desarrollo de pipelines de robotica con demostraciones humanas: util para probar el uso de demos HumanGen como condicion in-context en lugar de datos de robot.
- Fine-tuning posterior: al ser un adaptador, puede servir como inicializacion para experimentos propios sobre el modelo base en tareas de manipulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio del proyecto base menciona generalizacion zero-shot en RoboTwin 2.0 y en tareas reales no vistas, pero no se proporcionan cifras concretas para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo ocupa 22,4 GB e incluye pesos del adaptador y metadatos; el modelo base es necesario y su huella no se especifica.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; es un modelo de robotica, no de lenguaje).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zero-WAM RoboTwin Version B (este) | no disponible | no disponible | no disponible | no disponible | Hugging Face (adaptador) |
| Zero-WAM pretrain (base) | no disponible | no disponible | zero-shot en RoboTwin 2.0 (sin cifras) | no disponible | Hugging Face / GitHub |
| Otras variantes Zero-WAM (coleccion Robbyant) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: requiere obligatoriamente el modelo base `robbyant-research/zero-wam-pretrain`.
- Licencia no disponible: no puede asumirse uso comercial sin verificacion previa.
- Orientado exclusivamente a robotica y al benchmark RoboTwin; no es un modelo de lenguaje ni de vision general.
- Sin datos publicados de benchmarks para este checkpoint concreto.
- Riesgo de sobreajuste a la configuracion de tareas de RoboTwin Version B.
- Sin informacion sobre sesgos, alucinacion o limitaciones de contexto.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria.
- Fecha de creacion y actualizacion en 2026, lo que sugiere un artefacto reciente y poco contrastado.

## Enlaces

- Hugging Face: https://huggingface.co/gulucaptain/zero-wam-robotwin-version-b1-e200
- Modelo base: https://huggingface.co/robbyant-research/zero-wam-pretrain
- GitHub del proyecto: https://github.com/robbyant-research/Zero-WAM
- Coleccion Zero-WAM: https://huggingface.co/collections/Robbyant-Research/zero-wam
