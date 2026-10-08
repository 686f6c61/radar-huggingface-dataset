# jasonren-ai2/g1-vla-finetune-checkpoints

## Resumen

`jasonren-ai2/g1-vla-finetune-checkpoints` es un repositorio de HuggingFace que agrupa los checkpoints finales de un barrido de ajuste fino (fine-tuning sweep) de modelos VLA (vision-language-action) sobre conjuntos de datos de manipulacion robotica del robot humanoide Unitree G1. Lo publica el usuario `jasonren-ai2` bajo la libreria LeRobot, con tags que lo identifican como `lerobot`, `safetensors`, `robotics`, `unitree-g1` y `vla`. El repositorio pesa 34,5 GB y esta marcado como privado en la model card.

El contenido son politicas ya entrenadas (pesos, configuracion, pre/post-procesadores con estadisticas de normalizacion y `train_config.json`) para tareas concretas como cargar una lavadora, colocar un plato en una rejilla o doblar una toalla. La nomenclatura de cada carpeta sigue el patron `<modelo>_<dataset>_step<steps>_gbs<global batch>`. Cada ejecucion se entreno durante 50.000 pasos con un batch global de 256 (32 por GPU en 8 H100), usando la configuracion de fine-tuning por defecto de cada modelo base.

Es relevante porque documenta un protocolo de comparacion reproducible entre varios modelos VLA (GR00T-N1.7-3B, pi05-base y MolmoAct2) sobre los mismos datasets del Unitree G1, aunque el repositorio esta privado, no declara licencia y no incluye validacion sobre conjuntos retenidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelos VLA base: GR00T-N1.7-3B, pi05-base, MolmoAct2; detalle en sus respectivas model cards) |
| Parametros totales | 3B para gr00t-n1.7-3b; no disponible para el resto |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (pesos de politica, config, pre/post-procesadores con estadisticas de normalizacion y `train_config.json`) |

Otros datos del repositorio: tamano 34,5 GB, 0 descargas, 0 likes, pipeline `robotics`, creado el 2026-10-07 y actualizado el 2026-10-07.

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura interna de los modelos, sino que remite a los modelos base de los que parten los checkpoints: `nvidia/GR00T-N1.7-3B`, `lerobot/pi05_base` y MolmoAct2 (referenciado en el ejemplo de carga como `molmoact2`). Todos ellos son politicas VLA para control robotico integradas en el ecosistema LeRobot, por lo que los detalles de arquitectura (transformer, difusion de acciones, codificadores de vision-lenguaje, etc.) deben consultarse en las model cards de cada modelo base, no disponibles en la informacion proporcionada.

El entrenamiento consistio en un barrido de ajuste fino de 5 modelos x 5 datasets del Unitree G1. Cada ejecucion se realizo durante 50.000 pasos con batch global 256 (32 por GPU en 8 H100), empleando la configuracion de fine-tuning por defecto de cada modelo. En la tabla de la model card se detallan tres de las ejecuciones: `gr00t-n1.7-3b_g1-load-clothes-washing-machine_step50000_gbs256` (127 epocas), `gr00t-n1.7-3b_g1-plate-into-rack_step50000_gbs256` (169 epocas) y `pi05-base_g1-fold-towel_step50000_gbs256` (67 epocas). El autor indica que solo se registra la perdida de entrenamiento (training loss), sin validacion sobre conjuntos retenidos, y que las ejecuciones con GR00T reescalan todas las camaras a 640x480 (lo que comprime la camara de cabeza).

## Capacidades

- Control robotico por imitacion (VLA) sobre el humanoide Unitree G1: cada checkpoint esta ajustado para ejecutar una tarea de manipulacion concreta (cargar la lavadora, colocar un plato en una rejilla, doblar una toalla).
- Procesamiento multimodal: las politicas consumen observaciones visuales (camaras, incluida la de cabeza) junto con las acciones del robot, segun la arquitectura del modelo base correspondiente.
- Inferencia de politicas mediante LeRobot: los checkpoints se cargan con `lerobot.policies.factory.get_policy_class` y se ejecutan a traves de la API de politicas de LeRobot.
- Compatibilidad con tres familias de politica distintas: pi05, GR00T y MolmoAct2, segun el ejemplo de carga de la model card.
- Pre/post-procesado incluido: cada carpeta contiene los procesadores y las estadisticas de normalizacion necesarias para usar la politica.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el repositorio contiene politicas de accion, no agentes conversacionales).
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible mas alla de la observacion visual propia de las politicas VLA.

## Casos de uso

- Automatizacion de carga de lavadora con el Unitree G1: el checkpoint `gr00t-n1.7-3b_g1-load-clothes-washing-machine` permite reproducir la tarea de introducir ropa en la lavadora a partir de las observaciones visuales del robot.
- Colocacion de vajilla o platos en una rejilla: el checkpoint `gr00t-n1.7-3b_g1-plate-into-rack` sirve para tareas de manipulacion precisa de objetos rigidos en entornos domesticos o de restauracion.
- Doblado de toallas o ropa: el checkpoint `pi05-base_g1-fold-towel` cubre manipulacion deformable, un caso tipico y dificil en robotica de servicio.
- Investigacion comparativa de modelos VLA: al compartir datasets y protocolo (50.000 pasos, batch global 256), el repositorio permite comparar GR00T-N1.7-3B, pi05-base y MolmoAct2 en igualdad de condiciones.
- Reproduccion de experimentos de fine-tuning: los `train_config.json` y los procesadores incluidos permiten reanudar o reajustar politicas sobre los mismos datos.
- Transferencia a nuevas tareas del Unitree G1: las politicas ajustadas pueden servir como punto de partida (inicializacion) para otros datasets del mismo robot.
- Integracion en pilas de robotica basadas en LeRobot: al cargarse mediante `get_policy_class`, encajan en flujos de evaluacion y despliegue de LeRobot.
- Evaluacion de robustez por tarea: util para medir como se comportan distintas familias de politicas en tareas de tacto deformable frente a rigido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona la perdida de entrenamiento (training loss) y advierte de que no hay validacion sobre conjuntos retenidos, por lo que no se ofrecen tasas de exito ni metricas comparativas entre las ejecuciones.

## Requisitos de hardware

- Entrenamiento documentado: 8 GPU H100, con 32 muestras por GPU (batch global 256).
- VRAM estimada para inferencia: no disponible. El repositorio no indica requisitos de inferencia ni cuantizaciones.
- GPU recomendadas: no disponible para inferencia (el unico dato de hardware es el de entrenamiento, H100).
- Compatibilidad con GPU de consumo: no disponible; el tamano de 34,5 GB del repositorio y el hecho de que GR00T-N1.7-3B sea de 3B sugieren que podria requerir verificacion caso por caso, pero no hay datos confirmados.
- Opciones de despliegue: LeRobot como libreria principal (carga mediante `huggingface_hub.snapshot_download` y `lerobot.policies.factory.get_policy_class`). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de una comparativa externa con modelos de la misma categoria dentro de la informacion proporcionada. La unica comparacion posible es entre las politicas base cuyos checkpoints contiene el propio repositorio:

| Politica base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gr00t-n1.7-3b (nvidia/GR00T-N1.7-3B) | 3B | no disponible | no disponible | repo privado en este proyecto |
| pi05-base (lerobot/pi05_base) | no disponible | no disponible | no disponible | repo privado en este proyecto |
| MolmoAct2 | no disponible | no disponible | no disponible | repo privado en este proyecto |

No se dispone de datos de rendimiento comparativo entre ellas mas alla de la perdida de entrenamiento, que no se publica como cifra en la informacion disponible.

## Limitaciones y advertencias

- Repositorio privado: la model card incluye `private: true`, lo que implica acceso restringido al autor.
- Licencia no declarada: no hay informacion sobre condiciones de uso comercial o redistribucion.
- Sin validacion: el autor indica explicitamente que solo se registra la perdida de entrenamiento y que no hay validacion sobre conjuntos retenidos, por lo que no se puede inferir rendimiento real en tareas.
- Solo se detallan 3 de las ejecuciones: aunque se anuncia un barrido de 5 modelos x 5 datasets, la tabla de la model card solo describe tres carpetas, lo que deja incompleta la informacion sobre el resto.
- Artefacto de preprocesado: en las ejecuciones con GR00T, todas las camaras se reescalan a 640x480, lo que comprime la camara de cabeza y puede degradar la informacion visual de esa vista.
- Sin estado del optimizador: los checkpoints no incluyen el estado del optimizador, por lo que no sirven para reanudar el entrenamiento exactamente en el punto guardado.
- Ambito limitado al Unitree G1: las politicas estan ajustadas a tareas y datos de ese robot concreto; no se declara transferibilidad a otras plataformas.
- Riesgo de sobreajuste a las tareas de los datasets: con 127, 169 y 67 epocas sobre un unico dataset por checkpoint, la generalizacion a variaciones de entorno no esta documentada.
- Sesgos y alucinacion: no aplicable en el sentido de modelos de lenguaje, pero la model card no aporta analisis de sesgos ni de robustez ante condiciones fuera de distribucion.
- Idiomas y contexto: no disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jasonren-ai2/g1-vla-finetune-checkpoints
- Modelo base GR00T-N1.7-3B: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Modelo base pi05-base: https://huggingface.co/lerobot/pi05_base
- Dataset g1-load-clothes-washing-machine: https://huggingface.co/datasets/aarontung/g1-load-clothes-washing-machine
- Dataset g1-plate-into-rack: https://huggingface.co/datasets/aarontung/g1-plate-into-rack
- Dataset g1-fold-towel: https://huggingface.co/datasets/aarontung/g1-fold-towel
- Los resultados de busqueda web recibidos no contienen enlaces relevantes al modelo.
