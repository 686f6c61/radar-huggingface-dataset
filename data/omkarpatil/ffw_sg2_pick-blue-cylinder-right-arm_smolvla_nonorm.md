# omkarpatil/ffw_sg2_pick-blue-cylinder-right-arm_smolvla_nonorm

## Resumen

El modelo `omkarpatil/ffw_sg2_pick-blue-cylinder-right-arm_smolvla_nonorm` es un fine-tune del modelo base `lerobot/smolvla_base` (SmolVLA) realizado con la librería LeRobot 0.6.1. Está entrenado específicamente para la tarea robótica de recoger un cilindro azul con el brazo derecho de un robot semi-humanoide, utilizando demostraciones del dataset `omkarpatil/pick-blue-cylinder-right-arm`. El modelo pertenece a la categoría de Vision-Language-Action (VLA), combinando percepción visual, comprensión de instrucciones en lenguaje natural y generación de acciones articulares.

SmolVLA es un VLA ligero compuesto por un VLM preentrenado compacto y un experto de acciones entrenado con flow matching. Este fine-tune concreto no aplica normalización de dataset (normalizador identidad), por lo que el flujo matching opera en espacio articular crudo (radianes), lo que facilita la composición en espacio de puntuaciones entre distintos brazos. El modelo se distribuye bajo licencia Apache-2.0 y está disponible en formato safetensors, con un tamaño de repositorio de 0.9 GB.

La relevancia de este modelo radica en demostrar un flujo de fine-tuning de un VLA de bajo coste para una tarea de manipulación específica, usando herramientas open source como LeRobot y SmolVLA, y en su integración con la plataforma ROBOTIS AI Worker, un sistema robótico semi-humanoide orientado a tareas industriales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA (VLM compacto + experto de acciones con flow matching) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (instrucciones en inglés en el dataset) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 0.9 GB |
| Tarea | Recoger un cilindro azul con el brazo derecho (pick blue cylinder, right arm) |
| Cámaras | `cam_left_head`, `cam_left_wrist`, `cam_right_wrist` (renombradas a `camera1..3`) |
| Espacio de acción | 16-D objetivos articulares absolutos (radianes): brazo izquierdo×7, pinza izquierda, brazo derecho×7, pinza derecha |
| Chunk de acción | 50 pasos a 15 Hz |
| Preprocesado de imagen | decode /255 → pad-resize 512 → ×2−1 para SigLIP |
| Normalización | Identidad (sin normalización de dataset) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `lerobot/smolvla_base`, que a su vez es un VLA ligero compuesto por un VLM preentrenado compacto y un experto de acciones entrenado con flow matching. Dado un conjunto de imágenes (tres cámaras) y una instrucción en lenguaje natural, el modelo genera un chunk de acciones articulares. En este fine-tune, el normalizador de dataset se ha fijado a identidad (media 0, desviación 1), por lo que el flujo matching opera directamente en espacio articular crudo (radianes), una decisión de diseño orientada a permitir la composición de políticas en espacio de puntuaciones entre brazos.

El entrenamiento se realizó con LeRobot 0.6.1 (submódulo `cyclo_intelligence`) sobre las demostraciones del brazo derecho del dataset `omkarpatil/pick-blue-cylinder-right-arm` a 15 fps. Se usó el checkpoint 020000 de una ejecución de 30k pasos, con batch size 64, seed 1000 y sin aumento de imagen. Las imágenes se procesan con la transformación fija del modelo base (decode /255 → pad-resize 512 → ×2−1 para SigLIP). El estado del robot se representa como un vector de 22 dimensiones de valores articulares crudos (sin normalización).

## Capacidades

- Control robótico de manipulación: genera objetivos articulares absolutos para un robot de doble brazo (7 grados de libertad por brazo más pinzas), permitiendo ejecutar la tarea de recoger un cilindro azul.
- Percepción visual multi-cámara: procesa simultáneamente tres vistas (cabeza izquierda, muñeca izquierda y muñeca derecha) para guiar la acción.
- Seguimiento de instrucciones en lenguaje natural: interpreta la instrucción "Pick up the blue cylinder" y la asocia con la percepción visual.
- Generación de secuencias de acción: produce chunks de 50 pasos a 15 Hz, lo que permite un control suave y anticipatorio.
- Composición en espacio de puntuaciones: al no usar normalización, el modelo puede combinarse con otras políticas en el espacio de acciones crudas, facilitando la coordinación entre brazos.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot, lo que facilita su uso en pipelines robóticos existentes.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos industriales: el modelo puede integrarse en la plataforma ROBOTIS AI Worker para recoger objetos específicos (cilindros azules) de una superficie, sustituyendo o complementando la programación manual.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el fine-tuning de VLA en tareas concretas, especialmente en lo relativo a la normalización de acciones y la composición de políticas.
- Desarrollo de robots semi-humanoides: al estar entrenado para un robot de doble brazo, puede usarse como módulo de control para tareas de manipulación bimanual, aunque este modelo concreto se centra en el brazo derecho.
- Evaluación de VLA ligeros: permite comparar el rendimiento de SmolVLA frente a otros VLA más grandes en tareas de manipulación real, midiendo latencia y precisión.
- Generación de datos de demostración: el modelo puede emplearse para ejecutar la tarea de forma autónoma y recopilar nuevas demostraciones que alimenten futuros entrenamientos.
- Prototipado rápido en robótica: gracias a su tamaño reducido (0.9 GB) y licencia Apache-2.0, es adecuado para entornos de desarrollo con recursos limitados, permitiendo iterar sobre la tarea sin necesidad de infraestructura de alto coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como tasa de éxito, precisión de agarre o comparaciones con otros modelos en la tarea específica.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la información proporcionada. El tamaño del repositorio es de 0.9 GB, lo que sugiere que el modelo es relativamente pequeño, pero no se puede determinar la VRAM exacta necesaria sin conocer el número de parámetros y la arquitectura completa.
- No se indican GPUs recomendadas. Dado que es un VLA ligero, es probable que pueda ejecutarse en GPUs de consumo como RTX 3060 o superiores, pero esto es una estimación no confirmada.
- Opciones de despliegue: al ser un modelo de LeRobot, puede ejecutarse con el framework LeRobot, que soporta inferencia en PyTorch. También podría convertirse a otros formatos (GGUF, ONNX) si se desea, pero no se documenta en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros VLA como OpenVLA, RT-2 o modelos propios de LeRobot. Se puede mencionar que SmolVLA se presenta como una alternativa ligera a VLA más grandes, pero no hay datos concretos de rendimiento en esta ficha.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea de recoger un cilindro azul con el brazo derecho. No generaliza a otros objetos, colores o configuraciones de brazo sin un nuevo fine-tuning.
- La ausencia de normalización de dataset implica que las acciones se generan en espacio articular crudo, lo que puede dificultar la transferencia a otros robots con diferentes rangos de movimiento o escalas.
- Depende de una configuración específica de cámaras (tres vistas fijas) y de la cinemática del robot. Cambios en la disposición de las cámaras o en el robot pueden degradar el rendimiento.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con demostraciones humanas, puede heredar sesgos de la persona que realizó las demostraciones (por ejemplo, preferencia por ciertas trayectorias).
- Riesgo de alucinación en la interpretación de instrucciones: aunque la tarea es simple, el modelo podría malinterpretar variaciones de la instrucción si no se ajustan al formato exacto del entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los términos de la plataforma ROBOTIS y del dataset asociado antes de su uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/omkarpatil/ffw_sg2_pick-blue-cylinder-right-arm_smolvla_nonorm
- Paper de SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Versión HTML del paper: https://arxiv.org/html/2506.01844v1
- Página de ROBOTIS AI Worker: https://robotis.us/ai-worker/
- Documentación de ROBOTIS AI Worker: https://docs.robotis.com/docs/systems/aiworker/introduction/
