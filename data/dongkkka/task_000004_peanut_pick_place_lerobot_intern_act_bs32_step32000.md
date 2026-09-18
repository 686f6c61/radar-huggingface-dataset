# Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern_ACT_bs32_step32000

## Resumen

Este repositorio contiene un checkpoint de política robótica basada en ACT (Action Chunking Transformer), entrenada con la librería LeRobot 0.6.1 para una tarea concreta de recogida y colocación de cacahuetes ("Peanut Pick & Place"), identificada como Task 000004. Lo publica el usuario Dongkkka y se distribuye únicamente con el mejor checkpoint de validación, correspondiente al paso 32.000 de entrenamiento, dentro de una ejecución que se detuvo anticipadamente en el paso 48.000. No es un modelo de lenguaje: es un modelo de imitación visomotora que asigna observaciones visuales y propioceptivas a secuencias de acciones del robot.

El modelo tiene 51.701.398 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras capaces de ejecutarse en hardware modesto. Consume tres cámaras (cam_left_head, cam_left_wrist y cam_right_wrist) y se entrenó con un lote de 32 sobre el dataset Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern. Su relevancia actual es práctica: forma parte del ecosistema LeRobot, que estandariza el entrenamiento, la evaluación y el despliegue de políticas de imitación en robots de bajo coste, y permite reproducir o adaptar una tarea de manipulación concreta sin partir de cero.

La información pública es escasa: no se declara licencia, no se documentan idiomas (no aplica en el sentido habitual), no hay resultados de benchmarks estándar y el repositorio registra cero descargas y cero "likes" en el momento de la consulta. Los únicos datos cuantitativos disponibles son la pérdida de validación (0,0929) y el error absoluto medio en lazo abierto sobre episodios reservados (0,092374).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), politica de imitacion transformer con encoder visual y CVAE |
| Parametros totales | 51.701.398 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el checkpoint no documenta el tamano del chunk de acciones ni el horizonte de observacion) |
| Tipos de cuantizacion | no disponible; pesos distribuidos en safetensors sin precision declarada |
| Idiomas soportados | no disponible (modelo de robotica; no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot 0.6.1 |
| Camaras de entrada | cam_left_head, cam_left_wrist, cam_right_wrist |
| Tamano del repositorio | 0,2 GB |
| Tarea | Task 000004, "Peanut Pick & Place" |
| Dataset de entrenamiento | Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern (revision 05286a17a145234ed80870702f4d9757f00194c3) |
| Batch size de entrenamiento | 32 |
| Paso del checkpoint publicado | 32000 (mejor validacion) |
| Paso de finalizacion | 48000 (parada temprana activada) |
| Mejor perdida de validacion | 0,0929 |
| MAE en lazo abierto (Task 4, episodios reservados) | 0,092374 |

## Arquitectura y entrenamiento

ACT es una política de imitación que combina percepción visual con predicción de secuencias de acciones. El planteamiento habitual de esta familia (Zhao et al., 2023) consiste en un codificador visual por camara para extraer características de las imágenes, un codificador de estado propioceptivo, un encoder de tipo CVAE que durante el entrenamiento modela la variabilidad de las demostraciones humanas y un decodificador transformer que genera un "chunk" de acciones futuras en lugar de una sola acción por paso. Esta predicción por bloques reduce el error de composición acumulado y suaviza la ejecución, algo crítico en tareas de manipulación fina como coger y colocar objetos pequeños. Los detalles concretos de esta instancia (profundidad del transformer, dimensión de los embeddings, numero de pasos por chunk, backbone visual empleado) no estan documentados en la model card y se marcan como no disponibles.

El entrenamiento se realizo con aprendizaje por imitacion supervisado (behavioral cloning) sobre el dataset indicado, con un lote de 32 y un total de 48.000 pasos, de los cuales se publico el mejor checkpoint de validacion en el paso 32.000 tras aplicar parada temprana. No se menciona en la informacion disponible el uso de RLHF, DPO ni ningun esquema de ajuste por preferencias, lo cual es coherente con el paradigma de imitacion. Tampoco se documenta el numero de episodios de demostracion, la composicion exacta del dataset ni si hubo aumento de datos o randomization de dominio. La unica senal de calidad publicada es la perdida de validacion (0,0929) y un MAE en lazo abierto de 0,092374 promediado sobre episodios reservados de tipo estatico, izquierdo y derecho, lo que sugiere que se evaluo la robustez frente a variaciones de posicion de la tarea.

## Capacidades

- Generacion de trayectorias de accion para manipulacion robotica: produce chunks de acciones a partir de observaciones visuales multi-camara y estado del robot.
- Percepcion visual multi-vista: integra tres flujos de imagen (camara de cabeza y dos camaras de muneca), lo que en la practica permite cubrir tanto la escena global como el detalle de la pinza.
- Ejecucion de una tarea especifica de pick & place: recogida y colocacion de cacahuetes, segun el nombre de la tarea y del dataset.
- Generalizacion limitada a variaciones de posicion: la evaluacion se desglosa en episodios estaticos, de lado izquierdo y de lado derecho, lo que indica que se midio el comportamiento ante cambios de localizacion del objeto.
- Aprendizaje por imitacion reproducible: al estar en formato LeRobot, puede reentrenarse o ajustarse con demostraciones propias usando la misma libreria.
- No dispone de tool calling, function calling ni soporte de agentes: no es un modelo de lenguaje y no expone API de herramientas.
- No tiene capacidades multilingues ni de generacion de texto, codigo, matematicas, vision general o audio.
- No se documenta un modo de "razonamiento" explicito ni decodificacion especulativa.

## Casos de uso

- Automatizacion de pick & place en linea de montaje o envasado: el modelo traduce directamente imagenes de las tres camaras en acciones de brazo, por lo que puede integrarse en una celda robotizada que recoja piezas pequenas de una bandeja y las deposite en una posicion fija, sustituyendo a la programacion manual de trayectorias.
- Base para ajuste fino con demostraciones propias: al estar publicado en formato LeRobot con el dataset de entrenamiento referenciado, un equipo puede recoger sus propias demostraciones de otra tarea y reentrenar la politica partiendo de estos pesos, aprovechando que la libreria estandariza el pipeline de datos y de entrenamiento.
- Evaluacion comparativa de politicas de imitacion: sirve como punto de referencia ligero (51,7 M de parametros) frente a otras aproximaciones como Diffusion Policy, midiendo MAE en lazo abierto con el mismo protocolo de episodios reservados.
- Investigacion en aprendizaje por imitacion: el checkpoint con parada temprana y perdida de validacion documentada permite estudiar la relacion entre pasos de entrenamiento y error de ejecucion, o analizar el efecto del numero de camaras en el rendimiento.
- Robótica educativa y de bajo coste: por su tamano (0,2 GB) y su bajo requisito de memoria, puede ejecutarse en un equipo con GPU de gama media o incluso en una placa embebida, lo que encaja en laboratorios y aulas con robots tipo brazo de escritorio.
- Despliegue en prototipos de investigacion con inferencia local: al no depender de servicios en la nube, facilita experimentos con latencia controlada y sin conexion, util para pruebas de sim-a-real y validacion en banco.
- Reproducibilidad de resultados: la publicacion incluye la revision exacta del dataset y el paso del checkpoint, lo que permite replicar la evaluacion de MAE en lazo abierto en otro entorno y verificar la cifra reportada.
- Recogida de objetos pequenos en entornos controlados: la combinacion de camara de cabeza y camaras de muneca es adecuada para tareas de precision donde el objeto ocupa pocos pixeles, como el caso de los cacahuetes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible; no aplican a un modelo de robotica. Los unicos datos de rendimiento declarados por el autor son los siguientes.

| Metrica | Valor | Contexto |
|---|---|---|
| Perdida de validacion (mejor) | 0,0929 | Checkpoint del paso 32000 |
| MAE en lazo abierto (Task 4) | 0,092374 | Promedio sobre episodios reservados estaticos, izquierdo y derecho |
| Paso de finalizacion del entrenamiento | 48000 | Parada temprana activada |
| Batch size | 32 | Configuracion de entrenamiento |

No se dispone de comparaciones con otros checkpoints del mismo autor ni con politicas equivalentes entrenadas sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: los 51,7 M de parametros ocupan aproximadamente 207 MB en FP32 y unos 103 MB en FP16 (calculo derivado del numero de parametros, no declarado por el autor). Sumando activaciones y buffers de las tres camaras, el uso practico se mantiene por debajo de 1 GB en FP32 y por debajo de 0,5 GB en FP16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; por ejemplo RTX 3050, RTX 3060, RTX 4060, RTX 4090, A100 o H100 quedan sobradamente dimensionadas para esta politica. El cuello de botella real sera el preprocesado de imagen de las tres camaras, no el transformer.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo reciente, e incluso en iGPU y en CPU. En placas embebidas como Jetson Orin o Jetson Xavier NX el modelo es viable si se cuantiza o se ejecuta en FP16.
- Opciones de despliegue: LeRobot (PyTorch) es la via documentada, ya que el repositorio esta etiquetado con library_name: lerobot y contiene unicamente el checkpoint necesario para inferencia. No hay soporte declarado de vLLM, TGI, llama.cpp, Ollama ni GGUF, formatos orientados a modelos de lenguaje que no aplican aqui; una exportacion a ONNX o TensorRT seria factible, pero no esta publicada.
- Latencia y throughput: no disponibles. No se han publicado mediciones de frecuencia de control, tiempo de inferencia por chunk ni tasa de exito en ejecucion real; solo se reporta MAE en lazo abierto, que no equivale a rendimiento en el robot.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos verificados de modelos comparables (parametros, contexto, rendimiento o licencia) sobre el mismo dataset o la misma tarea. La comparacion se limita a la categoria arquitectonica.

| Modelo | Enfoque | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (ACT, Task 000004) | Imitacion con transformer y chunk de acciones | 51.701.398 | no disponible | MAE en lazo abierto 0,092374; perdida de validacion 0,0929 | no disponible | HuggingFace, formato LeRobot |
| Diffusion Policy | Imitacion generativa por difusion | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otros checkpoints ACT del ecosistema LeRobot | Imitacion con transformer y chunk de acciones | no disponible | no disponible | no disponible | no disponible | no disponible |
| SmolVLA / pi0 y similares | Politicas vision-lenguaje-accion | no disponible | no disponible | no disponible | no disponible | no disponible |

Cualquier cifra de comparacion exigiria evaluar los modelos sobre el mismo conjunto de episodios reservados, algo que no se ha hecho con los datos disponibles.

## Limitaciones y advertencias

- Especificidad extrema de la tarea: el checkpoint esta entrenado para "Peanut Pick & Place" (Task 000004) y no se ha demostrado que generalice a otros objetos, posiciones o entornos. Su uso fuera de esa distribucion de datos probablemente produzca fallos de agarre o colocacion.
- Sesgos de los datos de demostracion: al ser aprendizaje por imitacion, hereda las trayectorias, velocidades y estrategias del operador que teleopero el dataset, incluidas posibles asimetrias entre el lado izquierdo y el derecho. El desglose del MAE por episodios estaticos, izquierdo y derecho sugiere que ese factor se considero relevante.
- Riesgo de fallo silencioso: en robotica no existe "alucinacion" en el sentido linguistico, pero si acciones incorrectas con alta confianza. El MAE de 0,092374 en lazo abierto indica error acumulable y no mide directamente la tasa de exito de la tarea, por lo que no debe tomarse como garantia de funcionamiento en produccion.
- Ausencia de evaluacion en lazo cerrado publicada: no hay datos de exito en ejecucion real, ni de recuperacion ante perturbaciones, ni de robustez a cambios de iluminacion.
- Licencia no disponible: no se declara licencia en el repositorio. Sin una licencia explicita, no hay autorizacion clara para uso comercial ni para redistribucion, lo que constituye un bloqueo legal para integrarlo en un producto. Debe contactarse con el autor antes de cualquier uso comercial.
- Idiomas no aplicables: el modelo no procesa lenguaje natural, por lo que no tiene capacidades multilingues ni de dialogo.
- Limitaciones de contexto: no se documenta el horizonte de observacion ni el tamano del chunk de acciones. La politica depende de un historial limitado de observaciones, lo que restringe la planificacion a largo plazo y la recuperacion de errores en tareas de varios pasos.
- Requisito de calibracion de camaras: al depender de tres vistas concretas (cam_left_head, cam_left_wrist, cam_right_wrist), cualquier cambio en la montura, la resolucion o la calibracion respecto al montaje de entrenamiento degradara el rendimiento de forma dificil de diagnosticar.
- Estado del repositorio: cero descargas y cero "likes", sin validacion independiente por parte de terceros. Debe tratarse como un artefacto de investigacion no auditado.
- Excluye estados intermedios: el repositorio contiene solo el mejor checkpoint, sin optimizador ni checkpoints intermedios, por lo que no permite reanudar el entrenamiento desde el punto exacto de parada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern_ACT_bs32_step32000
- Dataset de entrenamiento: https://huggingface.co/datasets/Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern
- Revision del dataset: 05286a17a145234ed80870702f4d9757f00194c3
- LeRobot (libreria de entrenamiento y despliegue): https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot
- Aviso: las busquedas web realizadas no devolvieron ningun resultado relevante sobre este modelo; los unicos enlaces verificables son los del propio repositorio y los del ecosistema LeRobot. No se han encontrado articulos, blogs, demos ni publicaciones adicionales asociados al autor.
