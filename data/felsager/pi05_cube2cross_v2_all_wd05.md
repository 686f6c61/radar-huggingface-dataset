# felsager/pi05_cube2cross_v2_all_wd05

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, disenado para la generalizacion en entornos abiertos: parte de π₀ y lo evoluciona para operar en situaciones y entornos no vistos durante el entrenamiento. La implementacion disponible en LeRobot se adapta de su repositorio OpenPI de codigo abierto. Este checkpoint concreto, `felsager/pi05_cube2cross_v2_all_wd05`, es un ajuste fino de `lerobot/pi05_base` realizado por el usuario felsager para una tarea robotica muy especifica de pick-and-place.

El modelo combina percepcion visual (dos camaras: `top` y `wrist`), estado del robot y generacion de acciones motoras en un unico transformer de aproximadamente 4.140 millones de parametros. Consume un vector de estado de 10 dimensiones y dos imagenes de 480x640, y produce un vector de accion de 10 dimensiones, todo ello a partir de instrucciones en lenguaje natural. La tarea entrenada es coger un cubo de color (azul, verde, amarillo o rojo) y colocarlo sobre una cruz roja.

Es relevante ahora porque demuestra el flujo completo de ajuste fino de un VLA de proposito general sobre un robot real (UR5e con mano) usando LeRobot, con un dataset de 1.000 episodios y 493.474 frames a 30 FPS. La licencia es Gemma, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer, derivada de π₀.₅ (OpenPI) |
| Parametros totales | 4.143.404.816 (aprox. 4,14 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea estan en ingles) |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | ur5e_hand_e |
| Camaras | top, wrist (480x640, 3 canales) |
| Entrada de estado | observation.state, shape (10,) |
| Salida de accion | action, shape (10,) |
| Tamano del repo | 42,6 GB |
| Dataset de entrenamiento | felsager/vla_cubes_cross_v2 (1.000 episodios, 493.474 frames, 30 FPS) |

## Arquitectura y entrenamiento

El modelo es un VLA que fusiona percepcion visual, estado propioceptivo del robot y una instruccion en lenguaje natural para emitir acciones motoras. Sigue la arquitectura π₀.₅ de Physical Intelligence, adaptada en LeRobot desde OpenPI. La entrada combina dos flujos de imagen (camara cenital y de muneca) con un vector de estado de 10 dimensiones; la salida es un vector de accion de 10 dimensiones, lo que sugiere un control de tipo end-effector o articulaciones de 10 grados de libertad, coherente con una configuracion UR5e con mano.

El ajuste fino se realizo sobre `lerobot/pi05_base` con el dataset `felsager/vla_cubes_cross_v2`, compuesto por 1.000 episodios y 493.474 frames grabados a 30 FPS. Las tareas cubiertas son cuatro variantes de pick-and-place: coger un cubo azul, verde, amarillo o rojo y colocarlo sobre una cruz roja. La configuracion de entrenamiento fue de 30.000 pasos, batch size 16, optimizador AdamW, learning rate 5e-05, semilla 0 y LeRobot 0.6.2. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa; se trata de aprendizaje por imitacion supervisado a partir de demostraciones.

## Capacidades

- Generacion de acciones motoras de 10 dimensiones a partir de observaciones visuales y de estado, para control de un UR5e con mano.
- Percepcion visual multi-camara: procesa simultaneamente vista cenital y de muneca a 480x640.
- Seguimiento de instrucciones en lenguaje natural para seleccionar la tarea (que cubo coger y donde colocarlo).
- Discriminacion de color de objetos (azul, verde, amarillo, rojo) para seleccionar el objetivo correcto.
- Ejecucion de politicas de imitacion en bucle cerrado a 30 FPS mediante `lerobot-rollout`.
- Capacidad de reentrenamiento y ajuste fino adicional desde el mismo modelo base con `lerobot-train`.
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Pick-and-place industrial de objetos codificados por color: el modelo ejecuta la secuencia de coger un cubo de un color concreto y depositarlo en una zona marcada, aprovechando las dos camaras para localizar tanto el objeto como el destino.
- Prototipado rapido de politicas roboticas: sirve como referencia de un flujo completo de ajuste fino de un VLA sobre un robot UR5e, util para equipos que quieran replicar el pipeline con sus propios datos.
- Investigacion en aprendizaje por imitacion: al estar entrenado con 1.000 episodios y publicar la configuracion exacta, permite estudiar el efecto del volumen de datos y del learning rate en tareas de manipulacion.
- Benchmark de infraestructura LeRobot: sirve para validar instalaciones de LeRobot, calibracion de camaras y comunicacion con el robot antes de abordar tareas mas complejas.
- Automatizacion de tareas de clasificacion y colocacion en laboratorio: con cuatro clases de color, puede emplearse en entornos controlados para separar piezas por categoria sobre una diana fija.
- Base para ajuste fino en tareas relacionadas: al derivar de `lerobot/pi05_base`, se puede partir de este checkpoint para entrenar variantes con nuevos objetos o nuevas posiciones de destino, reutilizando parte del conocimiento adquirido.
- Demostraciones y docencia en robotica: la instruccion en lenguaje natural y la simplicidad de la tarea lo hacen adecuado para mostrar el funcionamiento de un VLA en ferias, clases o videos de divulgacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion vacia con la nota literal "No evaluation results have been provided for this policy yet.", por lo que no existen tasas de exito en robot real ni metricas de otro tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4.143 millones de parametros, en fp16 serian necesarios aproximadamente 8,3 GB solo para los pesos, mas el coste de activaciones y del procesamiento de dos imagenes de 480x640; en fp32, unos 16,6 GB solo en pesos.
- GPU recomendadas: no especificadas por el autor. Por tamano, una GPU con 16-24 GB (RTX 4090, A100 40 GB, L40S) es un punto de partida razonable, aunque no hay confirmacion oficial.
- Cabe en GPU de consumo: probablemente si en tarjetas con 16 GB o mas en fp16, pero no esta verificado ni documentado.
- Opciones de despliegue: `lerobot-rollout` para ejecucion en robot y `lerobot-train` para reentrenamiento, ambos de la libreria LeRobot 0.6.2. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para un VLA de control motor.
- Latencia y throughput: no disponibles. La politica opera en un bucle a 30 FPS segun la frecuencia del dataset, pero no se publican mediciones de latencia por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_v2_all_wd05 | 4.143 M | no disponible | Pick-and-place de cubos por color sobre cruz roja (UR5e) | gemma | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible en la informacion | no disponible | VLA generalista base para ajuste fino | no disponible en la informacion | Hugging Face |
| π₀ (Pi0) de Physical Intelligence | no disponible en la informacion | no disponible | VLA generalista predecesor de π₀.₅ | no disponible en la informacion | OpenPI (codigo abierto) |

La comparacion cuantitativa con alternativas no es posible: no hay datos publicados de rendimiento para este checkpoint ni cifras de parametros o contexto para los modelos de referencia en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo solo ha visto cuatro colores de cubo (azul, verde, amarillo, rojo) y una unica posicion de destino (cruz roja); es probable que falle ante objetos, colores o disposiciones no representados en el dataset.
- Riesgo de sobreajuste al entorno de grabacion: iluminacion, fondo, posicion de camaras y configuracion fisica del UR5e estan fijados implicitamente por los datos; cambios en estas condiciones pueden degradar el rendimiento.
- Sin evaluacion publicada: no hay tasas de exito verificadas, por lo que no se puede estimar su fiabilidad en produccion.
- Idioma: las instrucciones de tarea estan en ingles; no se documenta soporte multilingue.
- Contexto: no se especifica longitud de contexto ni ventana de observacion historica; el control es reactivo a la observacion actual.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de la licencia Gemma de Google, que impone restricciones y obligaciones de atribucion; conviene revisarla antes de un despliegue comercial.
- Requiere hardware robotico especifico (UR5e con mano y dos camaras calibradas); no es un modelo de proposito general fuera de ese montaje.
- Repositorio de 42,6 GB: la descarga y el almacenamiento requieren espacio considerable.
- Cero descargas y cero likes: no hay evidencia de uso ni validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_v2_all_wd05
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_v2
- Blog de π₀.₅ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
