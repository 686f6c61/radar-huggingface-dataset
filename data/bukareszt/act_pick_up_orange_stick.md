# Bukareszt/act_pick_up_orange_stick

## Resumen

Bukareszt/act_pick_up_orange_stick es una politica de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice trozos cortos de acciones (action chunks) en lugar de pasos individuales. El modelo ha sido desarrollado por el usuario Bukareszt y publicado en Hugging Face mediante LeRobot, la librería de aprendizaje automático para robótica real de Hugging Face. Resuelve una tarea concreta de manipulación: recoger un palo naranja ("pick up orange stick") con un robot de tipo `so_follower` y dos cámaras de entrada.

A diferencia de un modelo de lenguaje, esta ficha describe una politica visomotora: consume el estado de las articulaciones del robot (vector de dimensión 6) y dos imágenes RGB de 480x640 píxeles, y produce como salida un vector de acción de dimensión 6. El modelo tiene 51.668.614 parámetros en formato safetensors y un repositorio de 2,5 GB, e incorpora la arquitectura transformer propuesta en el artículo ACT (arXiv:2304.13705), orientada a manipulación fina con hardware de bajo coste.

Su relevancia es práctica para la comunidad de robótica open source: sirve como referencia reproducible de un pipeline completo de LeRobot (grabación de datos, entrenamiento y despliegue) y como punto de partida para reentrenar politicas ACT en tareas de agarre similares. No se han publicado resultados de evaluación sobre el robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder-decoder y componente CVAE, segun arXiv:2304.13705 |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; genera trozos de acciones) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de robótica, no procesa lenguaje natural como tarea principal) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

La politica sigue el método ACT descrito en el artículo Action Chunking with Transformers (arXiv:2304.13705). Es un modelo de imitación que aprende de datos teleoperados y predice secuencias cortas de acciones en lugar de una sola acción por paso, lo que reduce el error de composición acumulado y suele aumentar la tasa de éxito en tareas de manipulación fina. La entrada combina estado propioceptivo (`observation.state`, 6 dimensiones) y dos flujos visuales (`observation.images.check` y `observation.images.check2`, ambos de 3x480x640), y la salida es un vector `action` de 6 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset Bukareszt/pick_up_orange_stick, compuesto por 86 episodios y 26.542 fotogramas grabados a 30 FPS para la tarea "pick up orange stick". La configuración documentada incluye 100.000 pasos de entrenamiento, batch size 32, optimizador AdamW, learning rate 2e-05 y semilla 1000. No se detallan en la model card la composición exacta del dataset, técnicas de regularización ni si hubo etapas de ajuste adicionales.

## Capacidades

- Generación de acciones de manipulación: predice vectores de acción de 6 grados de libertad para el robot `so_follower`.
- Percepción visomotora: procesa dos cámaras (`check` y `check2`) junto con el estado de las articulaciones.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas, sin necesidad de recompensas explícitas.
- Predicción por trozos: genera action chunks, lo que mejora la estabilidad frente a politicas paso a paso.
- Ejecución autónoma: puede desplegarse con `lerobot-rollout` durante un periodo definido o de forma indefinida.
- Especialización de tarea única: está entrenado exclusivamente para "pick up orange stick".
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Recogida automatizada de objetos concretos: desplegar la politica sobre un `so_follower` para levantar el palo naranja en un entorno controlado, usando las dos cámaras como entrada visomotora.
- Banco de pruebas de pipelines LeRobot: usar el modelo como referencia para validar la instalación, la calibración de hardware y el flujo `lerobot-rollout` antes de entrenar politicas propias.
- Reentrenamiento por imitación en tareas similares: emplear la configuración documentada (100.000 pasos, AdamW, lr 2e-05) como plantilla para adaptar ACT a otros objetos o posiciones.
- Investigación en aprendizaje por imitación: comparar el rendimiento de ACT frente a otras arquitecturas de politica sobre el mismo dataset de 86 episodios.
- Docencia y demostraciones de robótica: ilustrar un ciclo completo de captura de datos a 30 FPS, entrenamiento y ejecución en robot real.
- Evaluación de robustez visual: probar la politica ante cambios de iluminación, posición del objeto o presencia de distractores, dado que la model card no reporta evaluaciones formales.
- Integración en celdas de pick-and-place de laboratorio: usar el modelo como componente de percepción-acción dentro de un sistema mayor que gestione la logística alrededor de la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente que todavia no se han aportado resultados de evaluacion sobre el robot real (tabla de trials, exitos y tasa de exito pendiente de rellenar).

## Requisitos de hardware

- VRAM estimada para inferencia: con 51.668.614 parámetros, los pesos ocupan aproximadamente 207 MB en FP32 y unos 103 MB en FP16, sin contar activaciones ni memorias intermedias de los dos flujos de imagen a 480x640.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM deberia ser suficiente; una RTX 3060, RTX 4090 o superior ofrece margen amplio. GPUs de centro de datos como A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: si, es un modelo pequeno (del orden de decenas de millones de parametros) y cabe con holgura en GPUs de consumo habituales.
- Opciones de despliegue: LeRobot mediante los comandos `lerobot-rollout` (ejecucion) y `lerobot-train` (entrenamiento), con `--policy.device=cuda` o CPU. El repositorio tambien se puede consumir como policy con `--policy.path=Bukareszt/act_pick_up_orange_stick`.
- Latencia y throughput: no disponibles. Dependen del hardware, del numero de cámaras y de la frecuencia de control del robot; el dataset se grabo a 30 FPS, lo que da una referencia de la cadencia de datos.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bukareszt/act_pick_up_orange_stick | pick up orange stick (so_follower, 2 cámaras) | 51.668.614 | no aplicable | apache-2.0 | Hugging Face (lerobot) |
| wsagi/ACT-PickOrange | pick orange (politica ACT) | no disponible | no aplicable | no disponible | Hugging Face |
| Dobot-Official/CR5A-act-Pick_Orange | pick orange (brazo CR5A) | no disponible | no aplicable | no disponible | Hugging Face |

Los dos modelos alternativos detectados en la busqueda web corresponden a politicas ACT para tareas de recogida de objetos naranjas, por lo que son los comparables mas directos en cuanto a metodo y objetivo. No se dispone de sus especificaciones tecnicas ni de sus resultados de evaluacion en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion estricta: la politica solo esta entrenada para la tarea "pick up orange stick"; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluacion publicada: la model card no reporta tasa de exito ni condiciones de prueba, por lo que el rendimiento real es desconocido.
- Dependencia del hardware: las observaciones estan ligadas al robot `so_follower` y a dos cámaras concretas (`check`, `check2`); cambiar camaras, indices o montaje invalida la politica.
- Sensibilidad al entorno: al entrenarse con 86 episodios, es probable que sea sensible a cambios de iluminacion, posicion de objetos, fondo o distractores, aunque este extremo no se cuantifica.
- Sesgos de los datos de demostracion: el comportamiento esta limitado por las trayectorias teleoperadas recogidas, con posible sesgo hacia posiciones y estilos de agarre concretos.
- Riesgo de alucinacion en el sentido de acciones incorrectas: al ser un modelo generativo de acciones, puede producir movimientos no deseados ante entradas fuera de distribucion; se recomienda supervisión y limites de seguridad fisicos.
- Idiomas: no aplicable; no es un modelo de lenguaje y no se documentan capacidades linguisticas.
- Licencia: apache-2.0 permite uso comercial, pero el autor no ofrece garantias; conviene verificar la licencia de la libreria LeRobot y del dataset asociado antes de un despliegue en produccion.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso por parte de la comunidad ni de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bukareszt/act_pick_up_orange_stick
- Dataset de entrenamiento: https://huggingface.co/datasets/Bukareszt/pick_up_orange_stick
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Bukareszt/pick_up_orange_stick
- Articulo ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Modelo comparable wsagi/ACT-PickOrange: https://huggingface.co/wsagi/ACT-PickOrange
- Modelo comparable Dobot-Official/CR5A-act-Pick_Orange: https://huggingface.co/Dobot-Official/CR5A-act-Pick_Orange/tree/main
