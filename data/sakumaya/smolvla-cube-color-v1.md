# sakumaya/smolvla-cube-color-v1

## Resumen

SmolVLA es una familia de modelos vision-language-action (VLA) compactos desarrollados por Hugging Face dentro del ecosistema LeRobot. Este modelo concreto, `sakumaya/smolvla-cube-color-v1`, es un fine-tuning del modelo base `lerobot/smolvla_base` entrenado para una tarea de manipulación robótica específica: colocar cubos de color azul o amarillo dentro de un círculo. Con 450 millones de parámetros, SmolVLA está diseñado para ejecutarse en hardware de consumo, lo que lo diferencia de otros VLA masivos que requieren infraestructura de datacenter.

El modelo procesa secuencias de imágenes RGB de tres cámaras, el estado sensoriomotor del robot (6 dimensiones) y una instrucción en lenguaje natural, y genera un chunk de acciones continuas para controlar el robot. La relevancia de este modelo radica en que demuestra cómo un VLA compacto puede especializarse en tareas robóticas concretas mediante fine-tuning con pocos datos (56 episodios), haciendo accesible la robótica basada en VLA a equipos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, basada en VLM) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action que adapta un vision-language model (VLM) preentrenado en datos multimodales a gran escala para control robótico. En lugar de entrenar políticas desde cero, SmolVLA aprovecha el conocimiento visual y lingüístico del VLM subyacente y lo extiende para generar acciones continuas. La arquitectura toma como entrada múltiples imágenes RGB (en este caso, tres cámaras a 256x256 píxeles), el estado del robot (vector de 6 dimensiones) y una instrucción en lenguaje natural, y produce un chunk de acciones que el robot ejecuta de forma autónoma.

El entrenamiento de este modelo concreto se realizó mediante fine-tuning supervisado del modelo base `lerobot/smolvla_base` usando el framework LeRobot. El dataset de entrenamiento, `sakumaya/so101-cube-color-v1`, contiene 56 episodios y 34.955 fotogramas a 30 FPS, con dos tareas: "Put the blue cube in the circle" y "Put the yellow cube in the circle". La configuración de entrenamiento incluyó 20.000 pasos, batch size de 32, optimizador AdamW con learning rate de 0,0001 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores al fine-tuning supervisado.

## Capacidades

- Control robótico por imitación: el modelo ejecuta tareas de manipulación aprendidas por demostración, generando acciones continuas de 6 dimensiones (posición y orientación del efector final).
- Percepción multi-cámara: procesa simultáneamente tres vistas RGB de 256x256 píxeles, lo que permite al robot operar con información visual redundante y robusta.
- Comprensión de instrucciones en lenguaje natural: las tareas se especifican mediante texto ("Put the blue cube in the circle"), lo que permite seleccionar el comportamiento deseado en tiempo de inferencia.
- Especialización por color: el modelo distingue entre cubos azules y amarillos y ejecuta la acción correspondiente según la instrucción recibida.
- Ejecución en tiempo real: al ser un modelo compacto de 450M parámetros, puede ejecutarse en hardware de consumo con latencias aceptables para control robótico.
- Integración con LeRobot: compatible con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales.

## Casos de uso

- Automatización de picking y placement en entornos controlados: el modelo puede integrarse en una celda robótica para clasificar objetos por color y colocarlos en posiciones determinadas, por ejemplo en líneas de ensamblaje sencillas o laboratorios de investigación.
- Prototipado rápido de políticas robóticas: un equipo de investigación puede grabar 56 demostraciones con un robot SO-101 y obtener una política funcional en horas, sin necesidad de diseñar controladores clásicos ni ingeniería de características.
- Educación en robótica y aprendizaje por imitación: el modelo sirve como ejemplo didáctico de fine-tuning de un VLA base con LeRobot, permitiendo a estudiantes reproducir el flujo completo de captura de datos, entrenamiento y despliegue.
- Evaluación de VLA en hardware asequible: al ejecutarse en GPUs de consumo, permite comparar el rendimiento de SmolVLA frente a modelos más grandes sin necesidad de infraestructura costosa.
- Investigación en generalización de tareas: el fine-tuning sobre dos tareas relacionadas (cubos azul y amarillo) permite estudiar cómo el modelo generaliza entre variaciones de una misma tarea manipulativa.
- Benchmarking de datasets robóticos: el dataset asociado (56 episodios, 34.955 frames) puede servir como punto de referencia para evaluar técnicas de aumento de datos o aprendizaje por imitación en entornos con pocas demostraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No hay datos de tasa de exito en robot real, ni comparativas con otros modelos en las tareas de cubos de color.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Como referencia, SmolVLA con 450M parámetros en FP32 ocupa aproximadamente 1,8 GB en memoria; con cuantización a 8 bits cabría en torno a 0,9 GB. Una GPU con 4-6 GB de VRAM debería ser suficiente para inferencia.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 6 GB de VRAM (RTX 3060, RTX 4060, etc.). Para entrenamiento, se recomienda una GPU con 8-12 GB de VRAM.
- Compatibilidad con hardware de consumo: sí, este es el objetivo principal de SmolVLA. Puede ejecutarse en GPUs de gama media de escritorio.
- Opciones de despliegue: LeRobot (framework principal), con soporte para inferencia en robot real mediante `lerobot-rollout`. También es posible exportar a otros formatos si se convierte desde safetensors.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un modelo compacto, se espera una latencia de decenas de milisegundos por inferencia en GPU consumer, pero este dato no está confirmado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA (este modelo) | 450M | no disponible | VLA compacto para robotica | Apache 2.0 | Hugging Face / LeRobot |
| RT-2 (Google) | 55B | no disponible | VLA de gran tamano | propietaria | no publico |
| OpenVLA | 7B | no disponible | VLA open source | MIT | Hugging Face |
| pi0 (Physical Intelligence) | 3B (action expert) | no disponible | VLA con flow matching | propietaria | no publico |

La comparativa se basa en datos publicos generales. SmolVLA se distingue por ser el modelo VLA mas pequeno de la tabla (450M frente a 7B de OpenVLA), lo que permite ejecucion en hardware de consumo. A cambio, su capacidad general es menor y requiere fine-tuning por tarea. RT-2 y pi0 no son accesibles publicamente, lo que limita su uso en investigacion abierta.

## Limitaciones y advertencias

- El modelo esta especializado en una tarea muy concreta (colocar cubos azules o amarillos en un circulo) y no generaliza a otras tareas de manipulacion sin fine-tuning adicional.
- El dataset de entrenamiento es pequeno (56 episodios), lo que puede provocar sobreajuste a las condiciones especificas de captura (iluminacion, posicion de camaras, textura de los objetos).
- No se han publicado resultados de evaluacion en robot real, por lo que se desconoce la tasa de exito real de la politica.
- La robustez frente a variaciones en la posicion de los objetos, cambios de iluminacion o distracciones visuales no ha sido evaluada.
- El modelo depende de tres camaras calibradas con nombres especificos (`camera1`, `camera2`, `camera3`); cambios en la configuracion de camaras requieren reentrenamiento.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el robot SO-101 y el hardware asociado pueden tener sus propias limitaciones.
- No se proporcionan datos sobre sesgos, alucinaciones o comportamiento en entornos no vistos durante el entrenamiento.

## Enlaces

- Repositorio del modelo: https://huggingface.co/sakumaya/smolvla-cube-color-v1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Coleccion SmolVLA en Hugging Face: https://huggingface.co/collections/lerobot/smolvla-683c072ec3ef6ab0fcb87e60
- Dataset de entrenamiento: https://huggingface.co/datasets/sakumaya/so101-cube-color-v1
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sakumaya/so101-cube-color-v1
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
