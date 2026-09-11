# sam-guided-vlas/train_1_2_pile__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_10k

## Resumen

Este repositorio aloja un ajuste fino del modelo π₀.₅ (Pi05), un modelo de tipo Vision-Language-Action (VLA) creado por Physical Intelligence y adaptado a la libreria LeRobot de Hugging Face. La politica resultante esta entrenada para controlar un robot Franka Panda equipado con tres camaras (`agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`) y produce acciones de 7 dimensiones a partir del estado del robot (9 dimensiones) y tres flujos de imagen de 224x224.

El modelo resuelve el problema del control robotico por imitacion en tareas de manipulacion de objetos cotidianos, y es relevante porque demuestra el flujo de trabajo de ajuste fino sobre la base abierta `lerobot/pi05_base`, con licencia Apache 2.0 y pesos en `safetensors`. Cuenta con 4.143.404.816 parametros (~4,14 mil millones) y un tamano de repositorio de 9,4 GB, lo que lo situa en la gama de modelos que pueden ejecutarse en una sola GPU de gama alta para inferencia en tiempo real.

Se trata de un ajuste concreto entrenado durante 10.000 pasos sobre el dataset `train_1_2_pile__mask__blur__sim__all_cameras__live` (200 episodios, 69.392 fotogramas a 20 FPS), orientado a tareas de recogida y colocacion de objetos como cestas, comida en caja, pasteles, latas, hamburguesas, frutas y especieros, entre otros. No se han publicado resultados de evaluacion en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) derivada de π₀.₅ (Pi05) de Physical Intelligence; detalles internos (backbone, tokenizador de acciones) no disponibles en la informacion proporcionada |
| Parametros totales | 4.143.404.816 (~4,14 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a control robotico, no a dialogo) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Especificaciones de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(9,)` |
| `observation.images.agentview` | VISUAL | `(3, 224, 224)` |
| `observation.images.robot0_eye_in_hand` | VISUAL | `(3, 224, 224)` |
| `observation.images.robot0_eye_in_hand_2` | VISUAL | `(3, 224, 224)` |
| `action` | ACTION | `(7,)` |

## Arquitectura y entrenamiento

La informacion proporcionada identifica el modelo como π₀.₅ (Pi05), un VLA de Physical Intelligence que evoluciona π₀ para generalizar a entornos y situaciones totalmente nuevos no vistos durante el entrenamiento. La implementacion de LeRobot esta adaptada del repositorio de codigo abierto OpenPI de Physical Intelligence. Los detalles internos concretos de la arquitectura (tipo de backbone de vision-lenguaje, mecanismo de generacion de acciones, numero de tokens de contexto) no se detallan en la model card y se marcan como no disponibles.

El proceso de ajuste fino se realizo con la libreria LeRobot version 0.6.0 sobre el modelo base `lerobot/pi05_base`. La configuracion de entrenamiento incluye 10.000 pasos, tamano de lote de 16, optimizador AdamW, tasa de aprendizaje de 5e-05, semilla 0 y dispositivo CUDA. No se especifica el numero total de tokens de entrenamiento ni si se emplearon tecnicas de RLHF o DPO. El dataset de entrenamiento consta de 200 episodios y 69.392 fotogramas grabados a 20 FPS, sobre 20 tareas distintas de manipulacion (cesta, comida en caja, pastel, lata, hamburguesa, limon, naranja, especiero, calabacin, spray, dispensador de jabon, mermelada, tarro, cereal, soporte de cuchillos, hervidor, pera, patata, boniato y bollo).

## Capacidades

- Generacion de acciones de control robotico de 7 grados de libertad a partir de observaciones multimodales (estado del robot y tres camaras).
- Manipulacion de objetos del hogar y la cocina en tareas de recogida y colocacion definidas por el dataset.
- Percepcion visual multi-camara (vista externa `agentview` y dos vistas de muneca `robot0_eye_in_hand`).
- Ejecucion de politicas de imitacion entrenadas sobre demostraciones de robot Franka Panda.
- Inferencia en bucle cerrado sobre el robot mediante el comando `lerobot-rollout`.
- Especificacion de la tarea objetivo en tiempo de ejecucion mediante el parametro `--task` (por ejemplo, `basket`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (es una politica de control, no un agente conversacional).
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo de razonamiento, vision adicional, audio): no disponibles.

## Casos de uso

- Recogida y colocacion de objetos en entornos de cocina: la politica puede ejecutar tareas como coger un pastel, una lata o una fruta y colocarlos en una cesta, aprovechando las tres vistas de camara para localizar y manipular objetos.
- Investigacion en modelos Vision-Language-Action: sirve como punto de partida reproducible para estudiar el ajuste fino de π₀.₅ sobre datasets propios, usando el flujo `lerobot-train` documentado.
- Automatizacion de tareas de picking en almacenes simulados: el dataset incluye variantes con mascaras y desenfoque (`mask`, `blur`) y camaras simuladas (`sim`), utiles para estudiar robustez ante oclusiones y calidad de imagen degradada.
- Evaluacion comparativa de estrategias de entrenamiento por imitacion: al ser un ajuste con semilla 0 y 10.000 pasos, permite replicar experimentos y comparar con otras semillas o duraciones.
- Prototipado rapido sobre robot Franka Panda: el comando `lerobot-rollout` permite desplegar la politica en hardware real con una configuracion minima de puerto y camaras.
- Educacion y demostraciones de aprendizaje por imitacion: la combinacion de un modelo base abierto, licencia Apache 2.0 y documentacion de LeRobot facilita su uso en cursos y talleres de robotica.
- Investigacion sobre generalizacion en entornos abiertos: al derivar de π₀.₅, el modelo es adecuado para explorar la transferencia a posiciones de objeto, iluminacion y distractores nuevos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion vacia y senala explicitamente que todavia no se han proporcionado resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir del numero de parametros, no confirmada por el autor):
  - precision completa (FP32): ~16,6 GB solo para pesos.
  - media precision (FP16/BF16): ~8,3 GB solo para pesos, mas memoria de activaciones y buffers de camara.
  - cuantizacion a 8 bits (si estuviera disponible): ~4,2 GB.
  - cuantizacion a 4 bits (si estuviera disponible): ~2,1 GB.
- No se indica que tipos de cuantizacion sean compatibles; la informacion sobre cuantizacion es no disponible.
- GPU recomendadas: una GPU con al menos 16-24 GB de VRAM para FP16 (por ejemplo, RTX 4090, RTX 3090, A100, H100); la VRAM exacta dependera del backend y del numero de camaras procesadas simultaneamente.
- Compatibilidad con GPU de consumo: probablemente cabe en tarjetas de consumo con 16 GB o mas (RTX 4080/4090, RTX 3090) en media precision, aunque no se confirma en la documentacion.
- Opciones de despliegue: la libreria LeRobot, mediante `lerobot-rollout` para ejecucion en robot y `lerobot-train` para reentrenamiento; no se documentan otros backends como vLLM, llama.cpp, Ollama o TGI para esta politica.
- Latencia y throughput: no disponible. El dataset se grabo a 20 FPS, lo que sugiere que el sistema de captura opera a esa frecuencia, pero no se especifica la tasa de inferencia del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este ajuste (`...pi05__seed_0__steps_10k`) | 4.143.404.816 | no disponible | no disponible | apache-2.0 | Hugging Face (LeRobot) |
| `lerobot/pi05_base` (modelo base) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | Hugging Face |
| π₀.₅ (Pi05) de Physical Intelligence | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | Blog y repositorio OpenPI |
| π₀ (version anterior de la familia) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | Repositorio OpenPI |

No se dispone de datos de rendimiento, contexto o licencia de los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible. Como alternativas de la misma categoria (VLA para robotica) pueden considerarse otros modelos abiertos del ecosistema LeRobot y OpenPI, pero sus especificaciones se marcan como no disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. El modelo se entrena sobre un dataset especifico de tareas de cocina y objetos cotidianos, por lo que su comportamiento fuera de esa distribucion no esta caracterizado.
- Riesgo de alucinacion: no disponible en el sentido conversacional; en control robotico el riesgo se traduce en acciones incorrectas o fallidas ante objetos, posiciones o iluminacion no vistas.
- Limitaciones de contexto o idioma: no se especifica longitud de contexto ni idiomas soportados; la descripcion de tareas se realiza mediante etiquetas cortas (`--task`), no mediante lenguaje natural libre.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre respetando los terminos de la licencia y la atribucion correspondiente. Conviene verificar la licencia del modelo base `lerobot/pi05_base` y del dataset utilizado.
- El repositorio tiene 0 descargas y 0 "likes", por lo que no cuenta con validacion de la comunidad.
- No se han publicado resultados de evaluacion (la model card indica "No evaluation results have been provided for this policy yet"), lo que impide conocer su tasa de exito real por tarea.
- Es un ajuste especifico para el robot Panda con tres camaras concretas; las politicas de LeRobot esperan que los nombres de las camaras coincidan con las claves de observacion del entrenamiento, por lo que un cambio de configuracion de hardware puede invalidar el modelo.
- No se documenta el numero de tokens de entrenamiento, la composicion completa del dataset ni el uso de RLHF/DPO, lo que dificulta la reproducibilidad exacta.
- Fecha de creacion del repositorio: 2026-09-11 (segun los metadatos de Hugging Face).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sam-guided-vlas/train_1_2_pile__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_10k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile__mask__blur__sim__all_cameras__live
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2_pile__mask__blur__sim__all_cameras__live
- Blog de π₀.₅ (Pi05) de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI (Physical Intelligence): no disponible como enlace directo en la informacion proporcionada
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Guia de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Referencia de comandos de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Los resultados de la busqueda web no contienen enlaces relevantes para este modelo (los resultados encontrados se refieren a una serie de television francesa y a empresas de carpinteria y toldos, y no guardan relacion con el modelo).
