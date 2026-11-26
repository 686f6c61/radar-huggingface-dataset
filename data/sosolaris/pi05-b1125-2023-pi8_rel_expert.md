# SoSolaris/pi05-b1125-2023-pi8_rel_expert

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, disenado para la generalizacion en entornos abiertos de robotica. Este repositorio concreto, `SoSolaris/pi05-b1125-2023-pi8_rel_expert`, es un fine-tuning del modelo base `lerobot/pi05_base` realizado por el usuario SoSolaris mediante la libreria LeRobot. El modelo resuelve una tarea especifica de manipulacion robotica: agarrar una lata y verter su contenido en una taza.

El modelo combina percepcion visual (tres camaras: superior, izquierda y derecha, a 480x640) con el estado del robot (14 dimensiones) para producir acciones motoras de 14 dimensiones. Con 4.143 millones de parametros, es un modelo de gran tamano para el ambito de politicas roboticas, lo que refleja la naturaleza VLA del modelo base subyacente.

Es relevante porque demuestra el flujo de trabajo de fine-tuning de politicas VLA de proposito general sobre tareas concretas usando el ecosistema LeRobot, con licencia Apache 2.0 que permite uso comercial. El modelo se entrena sobre un dataset de 195 episodios y 200.716 frames a 30 FPS, lo que lo convierte en un ejemplo de adaptacion de bajo coste de un modelo fundacional robotico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), basada en pi05 (evolucion de pi0) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/pi05_base`, la implementacion en LeRobot del modelo π₀.₅ de Physical Intelligence. π₀.₅ es un modelo Vision-Language-Action disenado para generalizar a entornos y situaciones no vistas durante el entrenamiento, evolucionando la arquitectura π₀ original. La arquitectura concreta (transformer, mezcla de expertos, etc.) no se detalla en la model card proporcionada.

El fine-tuning se realizo sobre el dataset `SoSolaris/can_to_mug_merged_20261117_trimmed`, compuesto por 195 episodios y 200.716 frames a 30 FPS, con la tarea "Grab the can and pour its contain in the mug (without water)". La configuracion de entrenamiento incluye 20.000 pasos, batch size de 32, optimizador AdamW, learning rate de 5e-05, semilla 1000 y LeRobot version 0.6.2. El robot utilizado es `solaria_bimanual` con tres camaras (`up`, `right`, `left`). No se especifica si hubo RLHF, DPO ni el numero de tokens de entrenamiento del modelo base.

## Capacidades

- Manipulacion robotica de proposito especifico: agarra una lata y vierte su contenido en una taza (sin agua).
- Percepcion visual multi-camara: procesa tres flujos de imagen simultaneos (superior, izquierda, derecha) a 480x640.
- Control bimanual: consume un estado de 14 dimensiones y produce acciones de 14 dimensiones, correspondiente a un robot bimanual (`solaria_bimanual`).
- Aprendizaje por imitacion: politica entrenada mediante imitation learning sobre demostraciones.
- Generalizacion a entornos abiertos: heredada del modelo base π₀.₅, orientada a situaciones no vistas.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingues, al tratarse de un modelo de robotica y no de lenguaje.

## Casos de uso

- Automatizacion de tareas de vertido en laboratorio: el modelo ejecuta la secuencia de agarrar una lata y verter su contenido en una taza, adecuado para entornos controlados donde esta tarea se repite. Su entrenamiento especifico sobre 195 episodios lo hace apropiado para esa tarea concreta.
- Investigacion en aprendizaje por imitacion: sirve como ejemplo reproducible de fine-tuning de un VLA sobre un dataset propio usando LeRobot, con configuracion de entrenamiento documentada (20.000 pasos, batch 32, lr 5e-05).
- Prototipado de robots bimanuales: el modelo consume estado de 14 dimensiones y produce acciones de 14 dimensiones, por lo que encaja en plataformas bimanuales con tres camaras.
- Evaluacion de generalizacion de politicas VLA: al derivar de π₀.₅ (disenado para generalizacion a entornos nuevos), permite estudiar como se comporta un fine-tuning especifico frente a variaciones de posicion, iluminacion o distractores.
- Base para fine-tuning posterior: puede servir como punto de partida para otras tareas de manipulacion con el mismo robot `solaria_bimanual`, reutilizando los pesos ya adaptados.
- Docencia y demostraciones de robotica: el comando `lerobot-rollout` documentado permite ejecutar la politica en un robot real con duracion configurable, util para demostraciones practicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 4.143 millones de parametros en safetensors (repo de 9,4 GB), la inferencia en precision completa requiere del orden de 8-16 GB de VRAM, aunque no se confirma oficialmente.
- GPU recomendadas: no disponible. No se especifican modelos de GPU en la documentacion.
- Cabe en consumer GPU: no confirmado. Por tamano de pesos, es plausible en GPUs consumer de gama alta con suficiente VRAM, pero no hay dato oficial.
- Opciones de despliegue: LeRobot mediante el comando `lerobot-rollout` (documentado en la model card). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SoSolaris/pi05-b1125-2023-pi8_rel_expert | 4.143 M | no disponible | Vertido lata-taza (fine-tuning) | Apache 2.0 | Hugging Face |
| lerobot/pi05_base | no disponible | no disponible | VLA de proposito general (base) | no disponible en esta ficha | Hugging Face |
| π₀ (pi0) | no disponible | no disponible | VLA original de Physical Intelligence | no disponible en esta ficha | OpenPI |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse sobre un unico dataset y tarea, el modelo puede sobreajustarse a las condiciones especificas de recogida de datos (posiciones, iluminacion, objetos).
- Riesgo de alucinacion: en el contexto de robotica, se traduce en acciones incorrectas o fallos de manipulacion; la model card no reporta tasa de exito.
- Limitaciones de contexto o idioma: no aplica idioma; el modelo esta atado a la tarea "Grab the can and pour its contain in the mug (without water)" y al robot `solaria_bimanual` con camaras `up`, `right`, `left`.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base `lerobot/pi05_base` y de los datos de entrenamiento.
- Caveat para produccion: no hay resultados de evaluacion publicados; no se recomienda su despliegue en produccion sin validacion en robot real. El modelo tiene 0 descargas y 0 likes, lo que indica ausencia de validacion por la comunidad.
- Dependencia de hardware: requiere el robot `solaria_bimanual` y tres camaras configuradas con los nombres exactos de las claves de observacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SoSolaris/pi05-b1125-2023-pi8_rel_expert
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/SoSolaris/can_to_mug_merged_20261117_trimmed
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guia LeRobot pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SoSolaris/can_to_mug_merged_20261117_trimmed
