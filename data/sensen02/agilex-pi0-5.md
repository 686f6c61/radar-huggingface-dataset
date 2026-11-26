# Sensen02/AgileX-pi0.5

## Resumen

AgileX-pi0.5 es un conjunto de políticas de robotica basadas en el modelo vision-language-action (VLA) pi0.5, ajustadas por el usuario Sensen02 para la plataforma de doble brazo AgileX Piper. El modelo parte del checkpoint publico `pi05_base` y se especializa en dos tareas concretas de manipulacion: recoger un cuenco y cinta adhesiva para depositarlos en una cesta, y apilar tres cuencos. Se distribuye a traves de la libreria openpi, el framework de entrenamiento e inferencia de Physical Intelligence.

El modelo resuelve el problema de control de manipulacion bimanual a partir de observaciones visuales de tres camaras (frontal, muneca izquierda y muneca derecha) y un prompt en lenguaje natural. Es relevante para desarrolladores e investigadores que trabajan con el robot AgileX Piper y necesitan politicas preentrenadas que puedan ejecutarse sobre demostraciones de teleoperacion, sirviendo como punto de partida para tareas de pick-and-place y apilado.

El repositorio ocupa 43,2 GB e incluye checkpoints en formato Orbax (params) junto con estadisticas de normalizacion de acciones. La licencia se declara como "other", sin que la model card especifique los terminos concretos, lo que limita la evaluacion de uso comercial sin consultar la licencia original de pi0.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) pi0.5, ajuste fino de `pi05_base` |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts de tarea estan en ingles) |
| Licencia | other (terminos no detallados en la model card) |
| Formato de pesos | Orbax parameter checkpoint (params) + `norm_stats.json` |
| Entradas | 3 camaras (frontal, muneca izquierda, muneca derecha), resized a 224x224 |
| Frecuencia de datos de entrenamiento | 30 fps (LeRobot v2.1) |
| Tamano del repositorio | 43,2 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint publico `pi05_base`, un modelo VLA que combina percepcion visual, comprension del lenguaje y generacion de acciones motoras. La model card no detalla la arquitectura interna de pi0.5 (tipo de transformer, uso de flow matching u otros mecanismos de generacion de acciones), por lo que esos datos no estan disponibles en la informacion proporcionada.

El entrenamiento se realizo sobre demostraciones teleoperadas de la plataforma AgileX (dos brazos lider-seguidor, con camaras frontal y en ambas munecas), almacenadas en formato LeRobot v2.1 a 30 fps. Se usaron batch size de 64, 20.000 pasos, learning rate 1e-4 con schedule coseno y 5% de warmup. El repositorio incluye estadisticas de normalizacion de acciones (`norm_stats.json`) por conjunto de datos, necesarias para desnormalizar las acciones predichas en inferencia.

## Capacidades

- Generacion de acciones de manipulacion bimanual a partir de imagenes de tres camaras y un prompt en lenguaje natural.
- Ejecucion de dos tareas especificas: recoger cuenco y cinta hacia una cesta (`pick up the bowl and tape`) y apilar tres cuencos (`stack these three bowls`).
- Seguimiento de instrucciones en lenguaje natural mediante prompts cortos en ingles.
- Integracion con el ecosistema openpi para creacion de politicas entrenadas (`policy_config.create_trained_policy`).
- Preprocesamiento de imagenes integrado: redimensionado a 224x224 y mapeo de camaras (`front -> cam_high`, `left/right -> wrist cameras`).
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Pick-and-place en linea de montaje: la politica `grasp` permite al AgileX Piper recoger objetos (cuenco, cinta) y depositarlos en una cesta, util para tareas repetitivas de clasificacion en entornos controlados.
- Apilado de vajilla: la politica `stack_bowl` ejecuta el apilado de tres cuencos, aplicable en automatizacion de cocina industrial o laboratorios de robotica de servicio.
- Base para ajuste fino en nuevas tareas: al partir de `pi05_base`, el modelo sirve como inicializacion para entrenar otras tareas de manipulacion con demostraciones teleoperadas propias.
- Investigacion en VLA: permite reproducir y comparar el comportamiento de pi0.5 sobre hardware AgileX, con configuracion de entrenamiento documentada (batch, pasos, learning rate).
- Evaluacion de politicas bimanuales: el uso de tres vistas (frontal y dos munecas) facilita experimentos sobre fusion de camaras y coordinacion de dos brazos.
- Prototipado en laboratorio: con openpi como libreria, se puede desplegar la politica en el robot y medir tasas de exito antes de escalar a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamano de pi0.5, no documentado en la ficha).
- GPU recomendadas: no disponible; el repositorio de 43,2 GB sugiere checkpoints de gran tamano, pero no se especifica el hardware usado en entrenamiento ni inferencia.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: libreria openpi (`openpi.policies.policy_config`), con checkpoints Orbax. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Tareas | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AgileX-pi0.5 | VLA ajustado de pi0.5 | 2 tareas de manipulacion AgileX | 3 camaras + prompt | other | Hugging Face (openpi) |
| pi05_base | VLA base | Generico (preentrenamiento) | no disponible | no disponible | checkpoint publico referenciado |
| Alternativas VLA de manipulacion | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de otros modelos VLA comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en dos tareas concretas; no es un modelo general de robotica ni de proposito general.
- Los prompts de tarea estan en ingles; no se documenta soporte multilingue.
- La licencia "other" no detalla condiciones de uso comercial; es necesario revisar la licencia original de pi0.5 antes de cualquier despliegue productivo.
- No se publican benchmarks ni tasas de exito, por lo que el rendimiento real en el robot no puede verificarse a partir de la informacion disponible.
- Depende de la plataforma AgileX Piper y de la configuracion exacta de camaras (frontal, muneca izquierda, muneca derecha); cambios de montaje o calibracion pueden degradar el comportamiento.
- Riesgo de alucinacion o acciones erroneas inherente a los modelos VLA; se recomienda supervision y limites de seguridad en el robot.
- El repositorio es de gran tamano (43,2 GB), lo que exige infraestructura de almacenamiento y transferencia adecuada.
- No se documentan sesgos especificos, pero el entrenamiento con demostraciones teleoperadas limitadas puede no generalizar a objetos, iluminacion o disposiciones distintas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sensen02/AgileX-pi0.5
- Libreria openpi (referenciada en la model card): no se proporciona URL directa en la informacion disponible.
- Checkpoint base `pi05_base`: no se proporciona URL directa en la informacion disponible.
