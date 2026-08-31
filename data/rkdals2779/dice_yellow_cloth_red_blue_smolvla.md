# rkdals2779/dice_yellow_cloth_red_blue_smolvla

## Resumen

El modelo `rkdals2779/dice_yellow_cloth_red_blue_smolvla` es un fine-tuning del modelo base `lerobot/smolvla_base`, un vision-language-action model (VLA) compacto y eficiente desarrollado por Hugging Face dentro del ecosistema LeRobot. Está diseñado para controlar un robot manipulador mediante imitación, transformando observaciones visuales y de estado en comandos de acción directos. Este checkpoint concreto se ha entrenado para una tarea específica: mover dados de colores (azul o rojo) a una zona amarilla sobre una mesa, usando tres cámaras (superior, muñeca izquierda y muñeca derecha).

Su relevancia radica en que SmolVLA demuestra que los modelos de visión-lenguaje-acción pueden funcionar con menos de 500 millones de parámetros, lo que permite su despliegue en hardware de consumo, algo poco habitual en este tipo de sistemas. El modelo se distribuye con licencia Apache 2.0, lo que facilita su uso comercial y su integración en proyectos de robótica. La arquitectura combina un codificador visual, un modelo de lenguaje y un decodificador de acciones, con un contexto de entrada compuesto por imágenes de 256x256 píxeles y un vector de estado de 6 dimensiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, basada en transformer) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo procesa 3 imagenes de 256x256 y un estado de 6 valores) |
| Tipos de cuantizacion | no disponible (solo safetensors de precision completa) |
| Idiomas soportados | no disponible (el modelo no genera texto; las instrucciones de tarea se usan como condicionamiento interno) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador de imágenes (tipo ViT), un modelo de lenguaje ligero y un cabezal de regresión de acciones. En esta variante, el modelo recibe como entrada tres imágenes RGB de 256x256 píxeles (cámara superior, muñeca izquierda y muñeca derecha) junto con un vector de estado del robot de 6 dimensiones. La salida es un vector de acción de 14 dimensiones que corresponde a los comandos de los motores del robot.

El entrenamiento se realizo mediante aprendizaje por imitacion (behavior cloning) sobre el dataset `rkdals2779/dice_yellow_cloth_red_blue`, que contiene 50 episodios con un total de 22.971 frames a 30 FPS. Las tareas registradas incluyen instrucciones verbales como "Move the blue die to the yellow area" o "Put the red block on the yellow cloth". La configuracion de entrenamiento fue de 50.000 pasos, batch size 16, optimizador AdamW con learning rate 0.0001 y semilla 1000, usando la libreria LeRobot version 0.6.0. El modelo parte de los pesos preentrenados de `lerobot/smolvla_base`, que proporciona capacidades generales de vision-lenguaje-accion sobre las que se afina la tarea especifica.

## Capacidades

- Control robotico por imitacion: genera vectores de accion de 14 dimensiones a partir de observaciones visuales y de estado.
- Percepcion multimodal: procesa simultaneamente tres flujos de camara (superior, muñeca izquierda, muñeca derecha) a resolucion 256x256.
- Comprension de instrucciones en lenguaje natural: las tareas se describen mediante frases en ingles (p. ej. "Pick up the red die and set it on the yellow felt") y el modelo condiciona su politica a dicha instruccion.
- Ejecucion de manipulacion de objetos: especificamente entrenado para agarrar y desplazar dados de colores (azul y rojo) a zonas amarillas.
- Eficiencia computacional: con solo 450 millones de parametros, es viable en hardware de consumo, a diferencia de otros VLA mas grandes.
- Integracion con LeRobot: compatible con el framework de entrenamiento, evaluacion y despliegue de Hugging Face para robotica.

## Casos de uso

- Manipulacion de objetos en entornos de laboratorio: el modelo puede controlar un brazo robotico para tareas de pick-and-place con objetos pequenos (dados, bloques) sobre superficies de colores, util para investigacion en robotica.
- Automatizacion de tareas de clasificacion: dado que distingue entre objetos azules y rojos y los coloca en areas amarillas, puede servir como base para sistemas de clasificacion fisica por color en lineas de produccion sencillas.
- Aprendizaje por demostracion en robotica: investigadores pueden usar este checkpoint como punto de partida para fine-tuning en tareas similares con pocas demostraciones, gracias a su tamano reducido y su base preentrenada.
- Prototipado rapido de politicas robotizadas: al ser un modelo pequeno, permite iterar rapidamente en entornos simulados o con robots reales de bajo coste, sin necesidad de clusters de GPU.
- Evaluacion de VLA en hardware de consumo: sirve como referencia para estudiar el rendimiento de modelos de vision-lenguaje-accion en GPUs domesticas (p. ej. RTX 3090/4090) y en sistemas embebidos.
- Desarrollo de interfaces de robotica educativa: su licencia Apache 2.0 y su integracion con LeRobot lo hacen adecuado para cursos y proyectos academicos donde se ensene control robotico basado en aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de exito en tareas reales ni comparaciones con otros modelos. El unico dato de rendimiento es el propio entrenamiento (50.000 pasos, batch 16), pero no se reporta tasa de exito en el robot fisico.

## Requisitos de hardware

- VRAM estimada para inferencia: dado que el modelo tiene 450 millones de parametros y procesa tres imagenes de 256x256, se estima un consumo de entre 2 y 4 GB de VRAM en precision FP16, aunque el dato exacto no se proporciona.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (p. ej. NVIDIA GTX 1660, RTX 2060, RTX 3060) deberia ser suficiente para inferencia. Para entrenamiento o fine-tuning se recomienda una RTX 3090 o superior.
- Compatibilidad con GPU de consumo: si, el modelo esta disenado para ejecutarse en hardware consumer-grade, segun la descripcion de SmolVLA.
- Opciones de despliegue: el modelo se usa mediante la libreria LeRobot (comandos `lerobot-rollout` y `lerobot-train`). No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo sino de accion robotica.
- Latencia y throughput: no se proporcionan datos. Se espera una latencia de decenas de milisegundos por paso en GPU moderna, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (VLA de tamano similar) dentro de la documentacion proporcionada. El unico punto de referencia es el modelo base `lerobot/smolvla_base`, del cual este checkpoint es un fine-tuning. Existen otros VLA como OpenVLA o RT-2, pero no se aportan datos de comparacion en la informacion disponible.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para la tarea de mover dados azules o rojos a areas amarillas. No generaliza a otros objetos, colores o disposiciones sin un nuevo fine-tuning.
- Depende de la configuracion de camaras especifica (tres camaras con nombres y posiciones concretas). Si se cambia la disposicion fisica, el rendimiento se degradara.
- No se han reportado evaluaciones formales en el robot real, por lo que no hay garantia de tasa de exito en produccion.
- El dataset de entrenamiento es pequeno (50 episodios, 22.971 frames), lo que puede limitar la robustez frente a variaciones de iluminacion, posicion de camara o textura de los objetos.
- No genera texto ni responde a instrucciones fuera del conjunto de tareas definido; su "lenguaje" es interno y no tiene capacidad conversacional.
- No se han documentado sesgos especificos, pero al ser un modelo entrenado con datos de un unico robot y un unico entorno, puede presentar sobreajuste al escenario de captura.
- Para uso comercial, la licencia Apache 2.0 no impone restricciones, pero se debe verificar que el hardware y el robot utilizado cumplan las normativas locales.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/rkdals2779/dice_yellow_cloth_red_blue_smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/rkdals2779/dice_yellow_cloth_red_blue
- Paper de SmolVLA (arXiv): https://huggingface.co/papers/2506.01844
- Framework LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion general de LeRobot: https://huggingface.co/docs/lerobot/index
