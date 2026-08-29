# shamitwell/pi05-block-in-cup

## Resumen

El modelo `shamitwell/pi05-block-in-cup` es un fine-tune del modelo base `lerobot/pi05_base`, que a su vez es la implementación en LeRobot de π₀.₅ (Pi05), un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence para la generalización en robótica. Este ajuste fino se ha realizado sobre un conjunto de datos propio (`shamitwell/block-in-cup`) que contiene 51 episodios de demostración de una tarea concreta: recoger un bloque y colocarlo en una taza. El modelo está diseñado para controlar un robot bimanual tipo `so_follower` con dos cámaras (muñeca izquierda, muñeca derecha) y una cámara adicional de vista general.

Con 4.143.404.816 parámetros y un tamaño de repositorio de 9,4 GB, el modelo se distribuye en formato safetensors bajo licencia Apache 2.0. Aunque se basa en la arquitectura π₀.₅, la implementación concreta en LeRobot no detalla públicamente los componentes internos en esta ficha. El interés de este modelo radica en que demuestra el flujo completo de entrenamiento y despliegue de políticas robóticas mediante imitación con LeRobot, partiendo de un modelo base preentrenado y adaptándolo a una tarea específica con pocos datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (no se detallan los componentes internos en la informacion disponible) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en FP32/FP16 segun el repo) |
| Idiomas soportados | no disponible (modelo de control robotico, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `lerobot/pi05_base`, que implementa π₀.₅ de Physical Intelligence. π₀.₅ es un VLA que combina un codificador de vision, un modelo de lenguaje (tipo PaliGemma) y un experto de accion que produce comandos de control directos. La arquitectura exacta de esta implementacion en LeRobot no se especifica en la informacion disponible, pero se sabe que consume tres imagenes RGB de 224x224 (base, muñeca izquierda, muñeca derecha) y un vector de estado de 32 dimensiones, y produce una accion de 6 dimensiones (posiblemente posicion y orientacion del efector final).

El entrenamiento se realizo con la libreria LeRobot version 0.6.1, sobre un dataset propio de 51 episodios (10.502 frames a 30 FPS) de la tarea "pick up the block and place it in the cup". Se usaron 100 pasos de entrenamiento, batch size 16, optimizador AdamW y learning rate 2,5e-5 con semilla 1000. No se mencionan tecnicas como RLHF o DPO; el proceso es de aprendizaje por imitacion supervisada sobre las demostraciones.

## Capacidades

- Control robotico bimanual: genera acciones de 6 dimensiones para un robot tipo `so_follower` a partir de observaciones visuales y de estado.
- Percepcion multimodal: procesa tres flujos de imagen simultaneos (camara base y dos muñecas) junto con el estado del robot.
- Ejecucion de tareas de manipulacion: la tarea especifica entrenada es recoger un bloque y colocarlo en una taza, mostrando capacidad de pick-and-place.
- Integracion con LeRobot: compatible con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue en robots reales.
- No incluye capacidades de lenguaje natural, tool calling ni razonamiento conversacional; es un modelo de politica puramente motor.

## Casos de uso

- Automatizacion de tareas de pick-and-place en entornos controlados: el modelo puede ejecutar la tarea de recoger un bloque y depositarlo en una taza, util para lineas de montaje simples o laboratorios de robotica.
- Prototipado rapido de politicas robotica: gracias a su entrenamiento con pocos episodios (51), sirve como ejemplo de como adaptar un VLA preentrenado a una tarea nueva con datos limitados.
- Investigacion en aprendizaje por imitacion: el modelo y su dataset asociado permiten estudiar el efecto del fine-tuning de π₀.₅ en tareas especificas, comparando con el modelo base.
- Desarrollo de sistemas de manipulacion bimanual: al usar dos camaras de muñeca, es adecuado para probar estrategias de coordinacion entre dos brazos.
- Benchmarking de VLA en robotica: puede utilizarse como referencia para medir el rendimiento de otros modelos en la misma tarea y con el mismo hardware.
- Educacion y formacion en robotica: al estar documentado en LeRobot, es un recurso didactico para aprender a entrenar y desplegar politicas VLA en robots reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion en robot real (campo "Evaluation" vacio). Por tanto, no se pueden presentar metricas de exito ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Dado que el modelo tiene 4.143M parametros en safetensors, una estimacion conservadora para inferencia en FP16 seria de al menos 8-10 GB de VRAM, pero este dato no esta confirmado por el autor.
- GPU recomendadas: no se especifican. Para robotica en tiempo real se recomienda una GPU de gama alta (por ejemplo, RTX 3090, RTX 4090, A100), pero no hay confirmacion oficial.
- Compatibilidad con GPU de consumo: probablemente si en las GPUs mencionadas, pero no hay garantia del autor.
- Opciones de despliegue: el modelo se usa a traves de LeRobot, con comandos como `lerobot-rollout`. No se mencionan vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (fine-tunes de π₀.₅ para tareas similares). La busqueda web mostro otros repositorios como `samithva/pi05_bimanual_stack_cup_bowl_augmented` o `wvangils/pi05_augmented_pick_red_cube_and_put_in_yellow_cup`, pero no se proporcionan datos de rendimiento ni especificaciones detalladas en los resultados obtenidos. Por tanto, no es posible realizar una comparativa tecnica fiable.

## Limitaciones y advertencias

- Entrenamiento con muy pocos datos (51 episodios): la politica puede no generalizar a variaciones de posicion, iluminacion o textura del bloque o la taza.
- Tarea unica: el modelo solo sabe ejecutar la tarea "recoger el bloque y colocarlo en la taza"; no es reutilizable para otras tareas sin reentrenamiento.
- Sin evaluacion publica: no hay resultados de exito en robot real reportados, por lo que se desconoce su fiabilidad en produccion.
- Dependencia del hardware: el rendimiento puede variar segun el robot `so_follower` y las camaras utilizadas; los nombres de las camaras deben coincidir con los usados en el entrenamiento.
- Riesgo de sobreajuste: al ser un fine-tune con pocos pasos (100), es probable que el modelo memorice las demostraciones y falle ante cambios en el entorno.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base π₀.₅ puede tener restricciones adicionales; se recomienda revisar la licencia del modelo base.

## Enlaces

- Repositorio del modelo: https://huggingface.co/shamitwell/pi05-block-in-cup
- Dataset de entrenamiento: https://huggingface.co/datasets/shamitwell/block-in-cup
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Documentacion de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
