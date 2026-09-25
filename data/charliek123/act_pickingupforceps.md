# charlieK123/act_pickingUpForceps

## Resumen

`charlieK123/act_pickingUpForceps` es una política robótica de imitación entrenada con el método ACT (Action Chunking with Transformers) y publicada en Hugging Face Hub a través de la librería LeRobot. No es un modelo de lenguaje: es un controlador visomotor que recibe el estado articular de un robot `so_follower` (6 dimensiones) junto con dos imágenes RGB de 480x640 (`gripperCam` y `bevCam`) y emite un vector de acción de 6 dimensiones. Su única tarea entrenada es "forcep pick and place", es decir, coger y colocar objetos con pinzas.

El modelo lo desarrolla el usuario charlieK123 (charles koduru) y se apoya en el ecosistema LeRobot de Hugging Face, que estandariza el registro de datos, el entrenamiento y el despliegue de políticas de imitación sobre robots de bajo coste tipo SO-100/SO-101. ACT predice "trozos" de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de composición y suele aumentar la tasa de éxito en tareas de manipulación.

Su relevancia es práctica: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación (dataset de 63 episodios y 53.290 fotogramas a 30 FPS, 50.000 pasos de entrenamiento, checkpoint en safetensors de 51.668.614 parámetros) y como punto de partida para hacer fine-tuning en tareas de pick and place similares. El repositorio es pequeño (0,2 GB), no tiene descargas ni valoraciones, y el autor no ha publicado resultados de evaluación en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con componente CVAE para aprendizaje por imitación |
| Parametros totales | 51.668.614 (aproximadamente 51,7 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. La informacion proporcionada no especifica el tamano del action chunk ni si se usa historial temporal |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos en safetensors sin variantes cuantizadas documentadas) |
| Idiomas soportados | No aplica: es una politica robótica, no procesa lenguaje natural |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de modelo | Politica de imitacion visomotora (pipeline: robotics) |
| Libreria | lerobot (entrenado y publicado con LeRobot 0.6.1) |
| Robot objetivo | `so_follower` |
| Camaras de entrada | `gripperCam` y `bevCam`, ambas a 480x640 y 3 canales |
| Entradas | `observation.state` (6,), `observation.images.gripperCam` (3, 480, 640), `observation.images.bevCam` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformers que predice secuencias cortas de acciones (action chunks) en lugar de una única acción por paso. El modelo incorpora un codificador visual para cada cámara y un transformer que fusiona la información visual con el estado proprioceptivo del robot; la formulación incluye un componente de autoencoder variacional condicional (CVAE) que modela la variabilidad de las demostraciones humanas. La información disponible no detalla la profundidad del transformer, el tamaño del chunk de acciones, ni la resolución interna del codificador visual.

El entrenamiento se realizó sobre el dataset `charlieK123/pickingUpForceps`, compuesto por 63 episodios, 53.290 fotogramas a 30 FPS y una única tarea: "forcep pick and place". La configuración declarada es de 50.000 pasos con batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta el número total de tokens o muestras vistas, ni si hubo etapas posteriores de refinamiento (RLHF, DPO u otras), algo que en cualquier caso no aplica al paradigma de aprendizaje por imitación. El propio autor indica que no hay resultados de evaluación publicados para esta política.

## Capacidades

- Control visomotor de manipulacion: genera comandos de acción de 6 grados de libertad a partir de dos vistas de cámara y del estado articular.
- Ejecucion de la tarea "forcep pick and place": coger y colocar objetos con pinzas, tal y como se registró en el dataset de entrenamiento.
- Prediccion de action chunks: emite secuencias cortas de acciones en lugar de pasos aislados, lo que reduce la acumulación de errores.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas, sin necesidad de recompensas ni de simulación.
- Compatibilidad con el flujo de trabajo de LeRobot: entrenamiento con `lerobot-train` y despliegue en robot con `lerobot-rollout`.
- Tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica en el sentido de agentes basados en lenguaje; la "planificación" se limita al horizonte del action chunk.
- Capacidades multilingues: no aplica.
- Capacidades especiales: no se documenta modo de razonamiento, visión generativa, audio ni ninguna otra modalidad adicional.

## Casos de uso

- Manipulacion de precision con pinzas en laboratorio: el modelo está entrenado específicamente para "forcep pick and place" sobre un robot `so_follower`, por lo que puede emplearse directamente para automatizar la recogida y colocación de piezas pequeñas en bancos de trabajo donde se disponga del mismo robot y de las dos cámaras (`gripperCam` y `bevCam`).
- Punto de partida para fine-tuning: al ser un checkpoint ACT pequeño (51,7 M de parámetros) y con licencia Apache-2.0, resulta adecuado para reentrenar con `lerobot-train` sobre datasets propios de tareas pick and place similares, reduciendo el número de pasos necesarios frente a un entrenamiento desde cero.
- Baseline en investigacion de aprendizaje por imitacion: permite reproducir y comparar ACT frente a otros métodos (por ejemplo, políticas de difusión) en la misma tarea, plataforma y conjunto de datos.
- Recogida de datos asistida: puede desplegarse como política inicial que, ejecutada junto a un operador, acelere la generación de nuevos episodios que después alimenten políticas mayores o modelos visión-lenguaje-acción.
- Docencia y formacion en robotica: el repositorio incluye el dataset, la configuración de entrenamiento y los comandos de despliegue, lo que lo convierte en un ejemplo completo y de bajo coste para enseñar el ciclo registro-entrenamiento-ejecución con LeRobot.
- Automatizacion de tareas repetitivas de clasificacion de objetos: en lineas de montaje o entornos de investigación donde la tarea se limite a coger objetos y depositarlos en una ubicación fija, con la ventaja de que la inferencia es ligera y puede correr en una GPU de gama media.
- Pruebas de integracion de hardware: sirve para validar la calibración de un robot `so_follower` y de dos cámaras OpenCV a 30 FPS antes de invertir en datasets más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente la línea "_No evaluation results have been provided for this policy yet._", por lo que no existen tasas de éxito en robot real, número de ensayos ni comparaciones cuantitativas con otras políticas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,21 GB para los pesos en precisión de 32 bits y aproximadamente 0,10 GB en 16 bits, calculado a partir de los 51.668.614 parámetros. A esto hay que sumar activaciones, los codificadores visuales de dos imágenes de 480x640 y el contexto de ejecución de CUDA, por lo que el consumo real será superior pero previsiblemente inferior a 2 GB (estimación, no dato publicado).
- GPU recomendadas: cualquier GPU con soporte CUDA de gama media o superior es suficiente por capacidad de memoria. No hay datos publicados de latencia ni de throughput para recomendar modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: sí, con margen amplio, dado el tamaño del modelo. No se especifica la GPU mínima probada por el autor.
- Despliegue: `lerobot-rollout` (CLI de LeRobot) con `--policy.path=charlieK123/act_pickingUpForceps`, sobre `--robot.type=so_follower`. El entrenamiento se hace con `lerobot-train` usando `--policy.type=act` y `--policy.device=cuda`. No aplica el despliegue con vLLM, TGI, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La política debe ejecutarse a 30 FPS para igualar la frecuencia de grabación del dataset, pero no se documentan tiempos de inferencia medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|---|
| charlieK123/act_pickingUpForceps | ACT (LeRobot), robot `so_follower` | 51.668.614 | No disponible | Apache-2.0 | Hugging Face Hub | 63 episodios, 53.290 fotogramas, sin evaluacion publicada |
| ACT (metodo de referencia, arXiv 2304.13705) | ACT | No disponible en la informacion proporcionada | No disponible | No disponible | Paper y implementaciones de referencia | No disponible |
| Oiki123/act_lekiwi_pick | ACT (LeRobot), politica pick | No disponible en la informacion proporcionada | No disponible | No disponible | Hugging Face Hub | No disponible |

No se dispone de cifras comparables de rendimiento, contexto o licencia para las alternativas. La comparación cuantitativa con otras políticas de la misma categoría (por ejemplo, políticas de difusión o modelos visión-lenguaje-acción de LeRobot) no puede realizarse con la información aportada.

## Limitaciones y advertencias

- Rendimiento no validado: no se ha publicado ninguna evaluación en robot real, ni tasa de éxito, ni número de ensayos. No hay evidencia empírica de que la política funcione fuera del entorno de grabación.
- Dataset muy reducido: 63 episodios y 53.290 fotogramas para una única tarea. Es un volumen pequeño, con riesgo alto de sobreajuste a las posiciones de objeto, iluminación y fondo del entorno original.
- Especificidad de hardware: solo funciona con un robot `so_follower` y exige cámaras con los nombres exactos `gripperCam` y `bevCam`, resolución 480x640 y 30 FPS. Cualquier cambio en la disposición de las cámaras invalida la política.
- Cobertura de tareas nula fuera del entrenamiento: el modelo no generaliza a instrucciones nuevas; la tarea está fijada como "forcep pick and place" y el texto de la tarea debe coincidir en la ejecución.
- Sin capacidades de lenguaje ni de razonamiento simbólico: no procesa instrucciones en lenguaje natural, no admite tool calling y no puede planificar a largo plazo. El concepto de alucinación no aplica, pero sí el fallo silencioso: puede generar acciones plausibles y erróneas sin señal de incertidumbre.
- Sesgos: no se documenta ningún análisis de sesgo, pero al derivar de demostraciones humanas hereda los sesgos del operador y de la distribución de posiciones registrada.
- Restricciones de licencia: los pesos se publican bajo Apache-2.0, lo que permite uso comercial. Aun así, conviene verificar la licencia del dataset `charlieK123/pickingUpForceps` antes de reutilizarlo en productos.
- Riesgo físico en produccion: es un controlador de robot real. No hay documentación de paradas de emergencia, límites de fuerza ni envolventes de seguridad, por lo que su uso debe ir acompañado de las salvaguardas hardware habituales.
- Señales de adopcion nulas: 0 descargas y 0 likes, sin issues ni discusiones públicas. Es un artefacto sin revisión externa.
- Fecha de creacion registrada en la metadata: 2026-09-24, dato que se reproduce tal cual figura en el Hub.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/charlieK123/act_pickingUpForceps
- Dataset de entrenamiento: https://huggingface.co/datasets/charlieK123/pickingUpForceps
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=charlieK123/pickingUpForceps
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de registro de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Perfil del autor: https://huggingface.co/charlieK123
- Politica ACT relacionada encontrada en la busqueda: https://huggingface.co/Oiki123/act_lekiwi_pick
- Repositorio del autor en GitHub: https://github.com/CharlieK123/I-JEPA

Nota sobre la busqueda web: los resultados obtenidos incluyen mayoritariamente contenido no relacionado con esta politica (perfil del autor, un repositorio de I-JEPA, un chat comercial y el paper arXiv:2309.12312 sobre ForceSight, un metodo de manipulación móvil condicionado por texto que no guarda relación directa con este modelo). No se han encontrado evaluaciones, demos ni publicaciones especificas de `charlieK123/act_pickingUpForceps`.
