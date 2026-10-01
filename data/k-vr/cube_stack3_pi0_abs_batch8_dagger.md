# K-vr/cube_stack3_Pi0_abs_batch8_dagger

## Resumen

K-vr/cube_stack3_Pi0_abs_batch8_dagger es un "policy" de robotica (no un modelo de lenguaje al uso) publicado por el usuario K-vr en HuggingFace, entrenado con la libreria LeRobot. Se trata de un ajuste fino del modelo base lerobot/pi0_base, que a su vez es la implementacion en LeRobot del modelo foundational pi0 de Physical Intelligence: una politica generalista de vision-lenguaje-accion (VLA) que combina entrada visual, instrucciones en lenguaje natural y control motor de robots.

El ajuste esta especializado en una unica tarea de manipulacion: apilar tres cubos de 40, 30 y 20 mm en orden decreciente de tamano. El modelo tiene 4.028.019.472 parametros (unos 4,03 mil millones), se distribuye en safetensors con un repositorio de 8,9 GB y opera sobre un robot bimanual `bi_so_follower_7dof` con cuatro camaras. El sufijo "dagger" del nombre sugiere un entrenamiento por agregacion de datos tipo DAgger, aunque la model card no confirma explicitamente ese procedimiento.

Su relevancia es acotada y de nicho: se trata de un artefacto de investigacion reproducible (licencia Apache 2.0, 0 descargas y 0 "likes" en el momento de la consulta), util como ejemplo de flujo completo de ajuste fino de pi0 con LeRobot y como punto de partida para quien quiera replicar la tarea o reentrenar con su propio conjunto de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) heredada de pi0; detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 4.028.019.472 (aproximadamente 4,03 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (modelo de robotica; no se documenta ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (las instrucciones se proporcionan como texto de tarea en ingles en los ejemplos de la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 8,9 GB, libreria `lerobot`) |

Datos adicionales de la model card:

| Parametro | Valor |
|---|---|
| Modelo base | lerobot/pi0_base |
| Conjunto de datos de entrenamiento | K-vr/cube_stack3_Pi0_abs_batch8_combined |
| Tipo de robot | bi_so_follower_7dof |
| Entradas | observation.images.base_0_rgb (3, 224, 224); observation.images.left_wrist_0_rgb (3, 224, 224); observation.images.right_wrist_0_rgb (3, 224, 224); observation.state (32,) |
| Salidas | action (14,) |
| Representacion de acciones | absoluta |
| Pasos de entrenamiento | 20.000 |
| Tamano de lote | 8 |
| Optimizador | adamw |
| Tasa de aprendizaje | 2,5e-05 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.1 |
| Aumento de imagen | desactivado |
| Ponderacion de muestras | ninguna |

## Arquitectura y entrenamiento

Pi0 es, segun la propia model card y la documentacion publica del modelo base, una politica generalista de vision-lenguaje-accion desarrollada por Physical Intelligence: recibe imagenes, interpreta instrucciones en lenguaje natural y emite comandos de control para distintos robots. La implementacion utilizada aqui procede del repositorio OpenPI adaptado a LeRobot. La informacion proporcionada no detalla la composicion interna de la arquitectura (tipo de encoder visual, decodificador de acciones, mecanismo de atencion), por lo que este apartado debe considerarse incompleto. Los detalles publicos de pi0 corresponden al modelo base y no necesariamente a esta copia ajustada.

El ajuste fino se realizo sobre el conjunto de datos K-vr/cube_stack3_Pi0_abs_batch8_combined, compuesto por 142 episodios y 70.947 fotogramas a 30 FPS, con dos variantes de la misma instruccion de tarea ("apilar los tres cubos"). El entrenamiento duro 20.000 pasos con lote de 8, lo que equivale a unas 160.000 muestras procesadas. Se empleo representacion de acciones absoluta, sin aumento de imagen ni ponderacion de muestras, con LeRobot 0.6.1. No se documenta en la informacion proporcionada ninguna innovacion tecnica adicional, ni fases de RLHF/DPO (no aplicables a una politica de control motor). El nombre del repositorio incluye "dagger", lo que apunta a un posible entrenamiento con agregacion iterativa de datos, pero esto no se confirma en la model card.

## Capacidades

- Control motor bimanual: genera vectores de accion de 14 dimensiones (7 grados de libertad por brazo) para el robot `bi_so_follower_7dof`.
- Percepcion visual multi-camara: consume tres flujos de imagen RGB a 224x224 (vista base, muneca izquierda y muneca derecha).
- Fusion de estado propioceptivo: integra un vector de estado de 32 dimensiones junto con las imagenes.
- Seguimiento de instrucciones en lenguaje natural: ejecuta la tarea descrita en el campo `--task` del comando de despliegue.
- Especializacion en una tarea concreta: apilado de tres cubos de 40, 30 y 20 mm en orden de tamano decreciente.
- Ejecucion continua: el script `lerobot-rollout` permite ejecutar la politica durante una duracion determinada (`--duration`) o de forma indefinida.
- No documentado en la informacion disponible: tool calling, function calling, razonamiento multi-paso, capacidades de agente, soporte multilingue, modo "thinking", audio u otras capacidades adicionales. Al ser una politica de robotica, estas funciones no aplican del mismo modo que en un modelo de lenguaje.

## Casos de uso

- Demostracion de apilado de cubos en laboratorio: la politica ejecuta la tarea de stacking descrita en la model card sobre un robot bimanual `bi_so_follower_7dof`, con ejecucion directa mediante `lerobot-rollout` y una duracion configurable.
- Reproducibilidad de experimentos de imitation learning: al publicarse junto con su dataset (142 episodios, 70.947 fotogramas) y su configuracion de entrenamiento completa, sirve para replicar el resultado paso a paso con LeRobot 0.6.1.
- Punto de partida para ajuste fino en tareas propias: el flujo documentado (`lerobot-train --policy.path=lerobot/pi0_base`) permite reentrenar sobre un dataset nuevo partiendo del modelo base y comparar contra este checkpoint especializado.
- Generacion de datos para DAgger: dado el sufijo del nombre y el pipeline de LeRobot, el modelo puede emplearse como politica inicial que un operador corrige en tiempo real para acumular nuevas trayectorias y reentrenar.
- Evaluacion comparativa de politicas VLA: sirve como referencia especializada frente al modelo base pi0_base para medir cuanto aporta el ajuste fino en una tarea de manipulacion acotada.
- Banco de pruebas de hardware de robotica: permite validar la cadena completa de captura de imagen, calibracion de camaras y comunicacion con el robot antes de invertir en entrenamientos mas costosos.
- Formacion y docencia en robotica de manipulacion: ejemplo completo y de licencia permisiva para ilustrar un pipeline de imitation learning de principio a fin.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion que aparece truncada y sin valores; no se proporciona tasa de exito en la tarea de apilado, ni numero de ensayos, ni comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 8,1 GB en bf16/fp16, unos 16,1 GB en fp32. Con estados de activacion, imagenes a 224x224 de tres camaras y buffers de inferencia, conviene reservar margen adicional. Estas cifras son calculos derivados del numero de parametros, no datos publicados por el autor.
- Cuantizacion: no se documentan variantes cuantizadas (GGUF, AWQ, GPTQ) para este repositorio. Aplicar cuantizacion a una politica de control motor puede degradar la precision de las acciones.
- GPU para inferencia: una RTX 4090 (24 GB) es suficiente en terminos de memoria para bf16. Para entrenamiento o ajuste fino conviene una A100 (40/80 GB) o H100, dado que el entrenamiento de pi0 requiere capacidad de computo considerable.
- GPU de gama consumer: el modelo cabe en tarjetas con 12 GB o mas en bf16, aunque el margen es ajustado; con 24 GB (RTX 3090, 4090) hay holgura.
- Opciones de despliegue: el soporte documentado es la propia libreria LeRobot mediante `lerobot-rollout` (inferencia) y `lerobot-train` (entrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no estan orientados a politicas VLA.
- Latencia y throughput: no disponibles. La captura de datos se realiza a 30 FPS, lo que implica que la politica debe ser capaz de emitir acciones a esa frecuencia para un control fluido, pero la informacion proporcionada no confirma que se alcance ese ritmo en ningun hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| K-vr/cube_stack3_Pi0_abs_batch8_dagger | 4,03 mil millones | no aplica | no disponible (sin evaluacion publicada) | apache-2.0 | HuggingFace, 0 descargas |
| lerobot/pi0_base (modelo base) | no disponible en la informacion proporcionada | no aplica | no disponible | no disponible | HuggingFace |
| lerobot/pi0fast_base | no disponible en la informacion proporcionada | no aplica | no disponible | no disponible | HuggingFace |
| Otras politicas VLA de la familia LeRobot (por ejemplo, SmolVLA) | no disponible en la informacion proporcionada | no aplica | no disponible | no disponible | HuggingFace |

La principal diferencia verificable entre este checkpoint y el modelo base es la especializacion: este ultimo esta ajustado sobre 142 episodios de una unica tarea de apilado y sobre un robot y una configuracion de camaras concretos. No se dispone de datos de rendimiento que permitan afirmar que supera al modelo base en dicha tarea.

## Limitaciones y advertencias

- Modelo de proposito muy especifico: solo se ha entrenado para apilar tres cubos de 40, 30 y 20 mm. Fuera de esa tarea su comportamiento no esta validado y probablemente sea inutil.
- Acoplamiento al hardware: exige un robot `bi_so_follower_7dof` y exactamente las tres vistas de camara con las que se entreno. Cambiar la posicion, el tipo de camara o la calibracion degrada el rendimiento.
- Inconsistencia en la documentacion: la seccion "Model Details" de la model card lista las camaras como `left_cam_left`, `left_cam_scene`, `right_cam_right` y `right_cam_scene`, mientras que la tabla de entradas usa `observation.images.base_0_rgb`, `observation.images.left_wrist_0_rgb` y `observation.images.right_wrist_0_rgb`. Hay que verificar los nombres reales antes de desplegar, ya que deben coincidir con las claves de observacion del entrenamiento.
- Sin evaluacion publicada: no se aporta tasa de exito ni numero de ensayos, por lo que no hay evidencia cuantitativa de que la politica funcione de forma fiable.
- Riesgo de sobreajuste al entorno de recogida de datos: 142 episodios son un volumen reducido y muy sensible a cambios de iluminacion, fondo, posicion inicial de los cubos o desgaste del robot.
- Ausencia de datos sobre sesgos, idiomas o alucinacion en el sentido habitual de los modelos de lenguaje; no aplica el analisis estandar de sesgos textuales, pero si el riesgo de generalizacion indebida a escenarios no vistos.
- Sin datos de cuantizacion: no se ofrecen pesos comprimidos, lo que limita el despliegue en hardware de baja memoria.
- Adopcion nula: 0 descargas y 0 "likes" en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el usuario debe asumir la responsabilidad sobre el comportamiento fisico del robot y sobre los posibles danos materiales derivados de una politica no validada.
- La busqueda web realizada no ha devuelto ninguna fuente relevante sobre este modelo: los resultados obtenidos tratan sobre la letra K y la linea K del Transilien, por lo que no se han podido contrastar datos externos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/K-vr/cube_stack3_Pi0_abs_batch8_dagger
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/K-vr/cube_stack3_Pi0_abs_batch8_combined
- Visualizacion del conjunto de datos (LeRobot Spaces): https://huggingface.co/spaces/lerobot/visualize_dataset?path=K-vr/cube_stack3_Pi0_abs_batch8_combined
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Anuncio de pi0 en Physical Intelligence: https://www.physicalintelligence.company/blog/pi0
- Repositorio OpenPI de Physical Intelligence: no disponible en la informacion proporcionada (la model card lo menciona sin enlace)
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guia de pi0 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi0
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de imitation learning con robots: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
