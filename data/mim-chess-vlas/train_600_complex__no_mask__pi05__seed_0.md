# mim-chess-vlas/train_600_complex__no_mask__pi05__seed_0

## Resumen

Este repositorio aloja una politica robotica de tipo Vision-Language-Action (VLA) publicada por el usuario `mim-chess-vlas` bajo el identificador `train_600_complex__no_mask__pi05__seed_0`. Se trata de un ajuste fino (fine-tuning) del modelo base `lerobot/pi05_base`, que a su vez implementa π₀.₅ (Pi05), la politica VLA desarrollada por Physical Intelligence y adaptada a LeRobot desde su repositorio OpenPI. El modelo consume observaciones multimodales de un brazo Franka Emika Panda (estado articular y tres camaras) y produce directamente comandos de accion de 7 dimensiones, sin pasar por planificacion simbolica.

La relevancia de esta ficha reside en que ejemplifica el flujo actual de trabajo en robotica open source: partir de un modelo fundacional VLA y ajustarlo con un dataset propio de demostraciones para una tarea concreta de manipulacion. En este caso, el ajuste se ha realizado sobre 600 episodios y 123.363 fotogramas a 20 FPS de tareas de recogida y colocacion (pick-and-place) de objetos de geometria compleja, presumiblemente piezas tipo ajedrez, en un entorno controlado.

El modelo tiene 4.143.404.816 parametros (unos 4,14 mil millones), se distribuye en formato safetensors con licencia Apache 2.0 y un tamano de repositorio de 74,8 GB. No se dispone de informacion publica sobre la longitud de contexto, los idiomas soportados ni datos de benchmarks, por lo que esas celdas se marcan como no disponibles. Los resultados de busqueda web recuperados no guardan relacion con el modelo (corresponden a un grupo de radiologia frances y al ministerio de educacion italiano), por lo que no aportan datos utilizables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); familia π₀.₅ de Physical Intelligence, implementada en LeRobot |
| Parametros totales | 4.143.404.816 (~4,14 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (politica robotica, no orientada a lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Libreria / framework | lerobot (PyTorch) |
| Tipo de robot | Franka Emika Panda |
| Camaras de entrada | `agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2` |
| Entrada de estado | `observation.state` de forma (9,) |
| Entrada visual | 3 imagenes de forma (3, 224, 224) |
| Salida de accion | `action` de forma (7,) |
| Tamano del repositorio | 74,8 GB |
| Dataset de ajuste | mim-chess-vlas/train_600_complex__no_mask |

## Arquitectura y entrenamiento

El modelo pertenece a la familia de politicas Vision-Language-Action de Physical Intelligence. Segun la model card, π₀.₅ evoluciona π₀ con el objetivo de generalizar a entornos y situaciones completamente nuevos no vistos durante el entrenamiento. La implementacion incluida aqui es la adaptacion a LeRobot del repositorio OpenPI de Physical Intelligence. La model card no detalla la composicion interna de la arquitectura (backbone de vision-lenguaje, mecanismo de generacion de acciones, numero de capas, dimensiones ocultas ni esquema de atencion), por lo que esos aspectos quedan como no disponibles.

El ajuste fino se ha realizado con el dataset `mim-chess-vlas/train_600_complex__no_mask`, compuesto por 600 episodios, 123.363 fotogramas y una tasa de captura de 20 FPS. Las tareas descritas consisten en recoger objetos de geometria compleja (formas con lobulos, conos, anillos, estrellas, bloques ranurados, etc., con descripciones muy detalladas de su superficie y morfologia) y depositarlos dentro de una caja. Cada tarea se especifica mediante un prompt textual detallado. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion completa del dataset, ni sobre el uso de RLHF, DPO u otras tecnicas de alineamiento. Tampoco se documentan innovaciones tecnicas especificas del ajuste (por ejemplo, decodificacion especulativa o atencion lineal).

## Capacidades

- Generacion de acciones motoras de 7 grados de libertad a partir de observaciones multimodales (estado articular e imagenes de tres camaras).
- Percepcion visual multi-camara: procesa vistas de `agentview` y dos camaras en la muneca del robot a 224x224.
- Ejecucion de tareas de manipulacion pick-and-place guiadas por instrucciones en lenguaje natural (prompts de tarea detallados).
- Generalizacion de politica aprendida: al derivar de π₀.₅, el modelo base persigue la generalizacion a entornos y situaciones nuevos, aunque el alcance de esa generalizacion en este ajuste concreto no esta documentado.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso explicito, vision generativa, audio ni modo "thinking".
- No se documentan capacidades multilingues; el modelo no es un modelo de lenguaje de proposito general.

## Casos de uso

- Manipulacion robotica en laboratorio: usar la politica para que un brazo Panda recoja piezas de geometria compleja y las deposite en una caja, replicando las tareas del dataset de entrenamiento.
- Investigacion en aprendizaje por imitacion: servir como punto de partida reproducible (seed 0) para estudiar el efecto del ajuste fino sobre politicas VLA fundacionales.
- Automatizacion de clasificacion y bin picking: integrar la politica en una celda robotica que separe objetos por forma y los coloque en contenedores.
- Evaluacion de generalizacion de politicas VLA: emplear el modelo como referencia al comparar variantes (por ejemplo, con mascara frente a sin mascara, como sugiere el nombre del repositorio) sobre el mismo conjunto de tareas.
- Prototipado de pipelines con LeRobot: incorporar el modelo en flujos de entrenamiento e inferencia de LeRobot para validar configuraciones de camaras y estados.
- Demostraciones y docencia: ilustrar como una politica VLA consume observaciones multimodales y produce acciones de bajo nivel en un escenario de pick-and-place.
- Transferencia a tareas afines: reajustar el modelo con nuevos datasets de manipulacion (mismo robot y mismas camaras) para tareas relacionadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito, tasas de finalizacion de tarea, errores de posicion ni comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir del recuento de parametros, no confirmadas por el autor): en bf16/fp16 en torno a 8-9 GB solo para los pesos; en fp32 en torno a 16-17 GB. Hay que sumar el coste de los tres codificadores/entradas visuales y de las activaciones.
- GPU recomendadas: no disponibles en la documentacion. Como referencia orientativa, el modelo cabe en GPUs de 16-24 GB (por ejemplo, RTX 4090, A5000, L40S) para pesos en precision reducida; para entrenamiento/reajuste se recomienda una GPU profesional (A100, H100) por el coste de memoria y computo.
- Cabe en GPU de consumo: probablemente si, en tarjetas con 16 GB o mas (RTX 4080/4090, segun cuantizacion y precision), aunque no hay confirmacion oficial.
- Opciones de despliegue: por tratarse de una politica robotica y no de un modelo de lenguaje, no aplican vLLM, TGI, Ollama ni llama.cpp en su uso previsto. El despliegue se realiza a traves del framework LeRobot (PyTorch).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (fine-tune de pi05_base) | ~4,14 mil millones | no disponible | no disponible (sin benchmarks) | Apache 2.0 | HuggingFace, via LeRobot |
| lerobot/pi05_base | no disponible | no disponible | no disponible | no disponible en esta informacion | HuggingFace (modelo base) |
| Otras politicas VLA de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

Solo se puede comparar de forma fiable con su modelo base (`lerobot/pi05_base`), del que se diferencia por el ajuste fino sobre el dataset de 600 episodios. No se dispone de datos de otros modelos VLA comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Alucinacion en el espacio de acciones: como politica aprendida, puede generar comandos imprecisos o inesperados ante observaciones fuera de distribucion; requiere supervision y limites de seguridad en hardware real.
- Especializacion estrecha: el ajuste se ha hecho sobre tareas concretas de pick-and-place de objetos de geometria especifica; cabe esperar un rendimiento pobre fuera de ese dominio.
- Dependencia del setup fisico: asume un robot Panda con exactamente las tres camaras (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) y una entrada de estado de 9 dimensiones; cambiar la configuracion invalida el uso directo.
- Sin datos de evaluacion: no hay benchmarks ni tasas de exito publicadas, por lo que no se puede cuantificar su fiabilidad.
- Idiomas y contexto: no disponibles; no es un modelo conversacional ni de lenguaje general.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base `lerobot/pi05_base` y de π₀.₅ de Physical Intelligence.
- Descargas y validacion: el repositorio registra 16 descargas y 0 likes, lo que sugiere poca validacion comunitaria.
- Tamano del repositorio: 74,8 GB, con requisitos de almacenamiento y ancho de banda considerables.
- Fechas de creacion y actualizacion (2026) y ausencia de documentacion adicional: no se dispone de informacion sobre mantenimiento o soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mim-chess-vlas/train_600_complex__no_mask__pi05__seed_0
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_600_complex__no_mask
- Guia de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Blog de π₀.₅ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI de Physical Intelligence: no disponible como enlace directo en la informacion proporcionada

Nota: los resultados de la busqueda web no contienen enlaces relevantes al modelo; corresponden a entidades no relacionadas (Groupe MIM de radiologia y Ministero dell'Istruzione e del Merito).
