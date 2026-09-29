# quangnd58/GR00T-N1.5-3B-so101-multitask

## Resumen

GR00T-N1.5-3B-so101-multitask es un ajuste fino (fine-tuning) del modelo fundacional NVIDIA GR00T N1.5-3B, un modelo vision-language-action (VLA) orientado a control de robots. Lo publica el usuario quangnd58 en HuggingFace y está entrenado sobre el dataset hungho77/so101-multitask, que contiene tres tareas de pick-and-place teleoperadas con el brazo SO-101. El objetivo es convertir un modelo generalista de robótica en un controlador concreto que ejecute instrucciones en lenguaje natural sobre un brazo de 6 grados de libertad (5 articulaciones + pinza).

El modelo resuelve el problema de pasar de un VLA genérico a un policy operativo en hardware de bajo coste: recibe como entrada imágenes de dos cámaras (frontal y de muñeca, 640x480), el estado del brazo en unidades `.pos` de LeRobot y un prompt de texto, y devuelve una secuencia de acciones con horizonte 16. Los pesos suman 2.724.163.520 parámetros (aproximadamente 2,72 mil millones), con un repositorio de 7,6 GB en formato safetensors, y se cargan mediante la librería `lerobot` y el stack Isaac-GR00T de NVIDIA.

Su relevancia es doble: por un lado demuestra el flujo completo de adaptación de un VLA fundacional a un robot concreto con un dataset pequeño (tres tareas), y por otro sirve como referencia práctica para quien quiera replicar el pipeline en brazos SO-100/SO-101. Es un modelo de nicho, con 9 descargas y 0 likes en el momento de redactar esta ficha, y su licencia NVIDIA limita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de GR00T N1.5: torre VLM (Eagle 2.5 en el modelo base) mas cabeza de generacion de acciones de tipo diffusion transformer |
| Parametros totales | 2.724.163.520 (2,72 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay variantes GGUF, AWQ ni GPTQ documentadas) |
| Idiomas soportados | no disponible; los prompts de las tareas estan en ingles |
| Licencia | NVIDIA License (`license: other`, `license_name: nvidia-license`) |
| Formato de pesos | safetensors (repositorio de 7,6 GB) |
| Modelo base | nvidia/GR00T-N1.5-3B |
| Dataset de ajuste | hungho77/so101-multitask (convertido a LeRobot v2.1) |
| Embodiment tag | `new_embodiment` |
| Configuracion de datos | `so100_dualcam` |
| Camaras | `video.front` (camara superior) y `video.wrist`, 640x480 |
| Estado / accion | `single_arm` (5 articulaciones) + `gripper` (1), unidades `.pos` de LeRobot |
| Horizonte de accion | 16 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del GR00T N1.5 de NVIDIA, un modelo fundacional abierto para razonamiento y habilidades robóticas de tipo cross-embodiment. El diseño es de doble sistema: una torre de vision-language model que interpreta imagenes y lenguaje, y un modulo generador de acciones basado en diffusion transformer que produce las trayectorias. En N1.5, NVIDIA actualizo el VLM partiendo de Eagle 2.5 y lo ajusto para mejorar el grounding y la comprension fisica; segun la propia NVIDIA, ese VLM rinde de forma favorable frente a Qwen2.5-VL-3B en RefCOCOg y en su dataset interno GEAR GR-1 de expresiones referenciales.

Sobre ese modelo base, este checkpoint se ha ajustado de forma supervisada con el dataset hungho77/so101-multitask, que cubre tres tareas de pick-and-place sobre un brazo SO-101. La conversion de datos se realizo a LeRobot v2.1 con el script `scripts/lerobot_conversion/convert_v3_to_v2.py` del repositorio NVIDIA/Isaac-GR00T (rama `n1d5`), y el entrenamiento con `scripts/gr00t_finetune.py` de la misma rama. No se documentan en la informacion disponible ni el numero de tokens o episodios de entrenamiento, ni la composicion exacta del dataset, ni si hubo fases de RLHF o DPO. Tampoco se especifican innovaciones adicionales mas alla de las del modelo base (entre ellas el manejo de horizonte de accion fijo de 16 pasos y la integracion con el ecosistema LeRobot).

## Capacidades

- Generacion de acciones roboticas a partir de instrucciones en lenguaje natural y observaciones visuales, en un bucle de control de robot real.
- Percepcion multimodal con dos camaras simultaneas (frontal y de muneca) a 640x480, mas el estado proprioceptivo del brazo.
- Control de un brazo SO-101 con 5 articulaciones y pinza, expresado en unidades `.pos` de LeRobot.
- Prediccion de secuencias de accion con horizonte 16, lo que permite ejecutar movimientos sin re-inferencia en cada paso de control.
- Ejecucion de tres tareas concretas definidas por prompt literal: `Pick up the banana and place it in the bot, then close the lid`, `Pick blue cube and place on red cube` y `Pick all cubes and place into cup`.
- Soporte de inferencia mediante `Gr00tPolicy` con configuracion de modalidad `so100_dualcam` y `embodiment_tag="new_embodiment"`.
- Soporte de evaluacion en robot real mediante el cliente `examples/SO-100/eval_lerobot.py` de la rama `n1d5`.
- Tool calling, function calling, agentes multi-paso, generacion de codigo, matematicas, vision general, audio, modo thinking y capacidades multilingues: no disponibles o no aplicables; el modelo esta especializado en control robotico y no se documenta ninguna de estas capacidades.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio: el modelo recibe el prompt de la tarea y las imagenes de las dos camaras y emite 16 acciones por inferencia, suficiente para completar aproximaciones y agarres en un brazo SO-101 sin planificacion externa.
- Prototipado rapido de politicas roboticas: sirve de punto de partida para quien quiera adaptar un VLA fundacional a un brazo de bajo coste; el pipeline documentado (conversion con `convert_v3_to_v2.py` y `gr00t_finetune.py`) es replicable con un dataset propio de tres tareas.
- Apilado y clasificacion de objetos en linea de montaje: la tarea `Pick blue cube and place on red cube` es directamente aplicable a operaciones de ensamblaje simple con distincion de color.
- Alimentacion de contenedores y cierre de tapas: la tarea `Pick up the banana and place it in the bot, then close the lid` modela una secuencia de manipulacion con dos fases (colocar y cerrar), util en entornos tipo cocina robotica o gestion de residuos.
- Recogida masiva de objetos en un mismo contenedor: la tarea `Pick all cubes and place into cup` demuestra capacidad de repetir el ciclo de agarre sobre multiples instancias, util para clasificacion por lotes.
- Banco de pruebas para investigacion en VLA: al ser un checkpoint pequeno (2,72 B) y con prompts fijos, permite medir tasas de exito por tarea, sensibilidad a la posicion de camara y robustez a cambios de iluminacion con coste de computo contenido.
- Integracion en entornos LeRobot: al estar etiquetado como `lerobot` y consumir datos en formato LeRobot v2.1, encaja en pipelines de recogida de datos, entrenamiento y evaluacion ya existentes en ese ecosistema.
- Demostracion educativa: permite ilustrar de extremo a extremo como un modelo vision-language-action traduce lenguaje e imagen en acciones motoras sobre hardware accesible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint ajustado. El autor no incluye tablas de tasa de exito, MMLU, HumanEval, GSM8K ni metricas especificas de manipulacion (por ejemplo, success rate por tarea) en la model card.

Como referencia cualitativa, y solo para el modelo base, NVIDIA indica en su pagina de investigacion de GR00T N1.5 que el VLM actualizado rinde de forma favorable frente a Qwen2.5-VL-3B en RefCOCOg y en su dataset interno GEAR GR-1 de expresiones referenciales. No se proporcionan cifras concretas en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: los pesos ocupan aproximadamente 5,4 GB (2,72 B de parametros), a lo que hay que sumar activaciones y las dos codificaciones de imagen a 640x480; una estimacion razonable es 8-12 GB de VRAM en total. Es una estimacion orientativa, no un dato publicado.
- Repositorio completo: 7,6 GB, por lo que conviene disponer de ese espacio en disco ademas del entorno de Python y las dependencias de Isaac-GR00T.
- GPU consumer: deberia caber en tarjetas de 16 GB o mas, como RTX 4080, RTX 4090 o RTX A4000/A5000. En tarjetas de 8-12 GB el margen es muy ajustado y puede requerir reducir el tamano de lote de inferencia.
- GPU de datacenter: para inferencia, L4, L40S, A100 o H100 ofrecen margen sobrado; para reentrenamiento o fine-tuning adicional, se recomienda A100/H100 por memoria y ancho de banda.
- Fine-tuning: no se documentan requisitos de VRAM en la informacion disponible; el ajuste completo de un modelo de 2,72 B con datos multimodales exige en la practica GPUs de 40-80 GB o tecnicas de eficiencia de memoria.
- Opciones de despliegue: el camino documentado es la libreria `gr00t` con `Gr00tPolicy` y la configuracion de modalidad `so100_dualcam`, mas el cliente de robot real `examples/SO-100/eval_lerobot.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ni variantes cuantizadas para estas herramientas.
- Latencia y throughput: no disponibles. El rendimiento en bucle cerrado depende del horizonte de accion de 16 pasos, del hardware y de la frecuencia de control del brazo SO-101, que no se especifica.
- El modelo esta etiquetado como `lerobot`, por lo que se integra con el stack de LeRobot, que actua como capa de comunicacion con el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| quangnd58/GR00T-N1.5-3B-so101-multitask | 2,72 B | no disponible | 3 tareas pick-and-place sobre SO-101 | NVIDIA License | HuggingFace, 9 descargas |
| quangnd58/GR00T-N1.6-3B-so101-multitask | no disponible (base de 3 B) | no disponible | 3 tareas pick-and-place sobre SO-101 (60 episodios de teleoperacion) | no disponible | HuggingFace |
| nvidia/GR00T-N1.5-3B | aproximadamente 3 B | no disponible | modelo fundacional cross-embodiment, proposito general | NVIDIA License | HuggingFace |
| nvidia/GR00T-N1.7 (Isaac-GR00T) | no disponible | no disponible | modelo fundacional VLA para habilidades humanoides generalizadas | no disponible | GitHub NVIDIA/Isaac-GR00T |

La comparacion directa mas relevante es con la variante N1.6 del mismo autor sobre el mismo brazo SO-101: es una version mas reciente, pero la informacion disponible no permite comparar tasas de exito ni latencias. Frente al modelo base sin ajustar, este checkpoint gana especializacion en tres tareas concretas a cambio de perder generalidad. No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas como OpenVLA o pi0.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo solo esta entrenado para tres tareas concretas con prompts literales; fuera de esos enunciados o de variaciones minimas, el comportamiento esperado es degradado.
- Sin datos de evaluacion: no se publican tasas de exito, curvas de aprendizaje ni metricas de robustez, por lo que no es posible estimar su fiabilidad en produccion.
- Riesgo de alucinacion de acciones: como todo modelo generativo de acciones, puede producir trayectorias fisicamente invalidas o colisiones si la escena difiere de la distribucion de entrenamiento. Se recomienda validacion con limites de par, paradas de emergencia y espacio de trabajo controlado.
- Sesgos: estan ligados al dataset de teleoperacion (posiciones, colores, iluminacion, camaras y objetos concretos). Cambios en la camara, en el fondo o en las condiciones de luz pueden degradar el rendimiento. No se documenta ningun analisis de sesgos.
- Idioma: los prompts de entrenamiento estan en ingles y no se documentan idiomas soportados; el uso en castellano no esta verificado.
- Contexto: no se especifica la longitud de contexto del modelo, asi que no se puede garantizar el manejo de instrucciones largas o historiales multi-turno.
- Restricciones de licencia: se distribuye bajo NVIDIA License (`license: other`, `license_name: nvidia-license`), derivada del modelo base. Es imprescindible revisar el archivo `LICENSE` antes de cualquier uso comercial; no se puede asumir una licencia permisiva tipo Apache 2.0 o MIT.
- Procedencia y mantenimiento: el repositorio lo mantiene un usuario individual, no NVIDIA, y tiene muy poca traccion (9 descargas, 0 likes). No hay garantia de soporte, actualizaciones ni correccion de errores.
- Dependencia de versiones concretas: la carga requiere la rama `n1d5` de Isaac-GR00T; cambios en la libreria `gr00t` o en LeRobot pueden romper la compatibilidad.
- Requisito de hardware robotico: para su uso real se necesita un brazo SO-101 y dos camaras configuradas segun `so100_dualcam`; no funciona como modelo de texto o vision de proposito general.
- Entorno de seguridad: cualquier despliegue sobre hardware fisico debe ir acompanado de supervision humana, limites de movimiento y validacion del espacio de trabajo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/quangnd58/GR00T-N1.5-3B-so101-multitask
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.5-3B
- Dataset de ajuste: https://huggingface.co/datasets/hungho77/so101-multitask
- Repositorio de codigo NVIDIA/Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Pagina de investigacion de GR00T N1.5: https://research.nvidia.com/labs/gear/gr00t-n1_5/
- Variante N1.6 del mismo autor sobre SO-101: https://huggingface.co/quangnd58/GR00T-N1.6-3B-so101-multitask
- Fork de Isaac-GR00T N1.5: https://github.com/yirongjie/UAV-Isaac-GR00T
