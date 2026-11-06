# mim-chess-vlas/train_800_complex__mask__overlay_a75__sim__all_cameras__live__groot__seed_0

## Resumen

Este repositorio contiene una política de robótica entrenada con la librería LeRobot sobre la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional abierto y multi-encarnación (cross-embodiment) para razonamiento y destrezas de robots humanoides. El modelo, identificado como `groot`, ha sido ajustado (fine-tuned) por el usuario `mim-chess-vlas` sobre el dataset `train_800_complex__mask__overlay_a75__sim__all_cameras__live`, compuesto por 790 episodios de simulación con tareas de agarre y colocación de objetos de geometría compleja.

La relevancia de esta ficha radica en que ilustra el flujo de trabajo de LeRobot para adaptar GR00T N1.7 a tareas específicas de manipulación: el modelo base combina un backbone de visión-lenguaje (Cosmos-Reason2/Qwen3-VL) con un transformador de acciones basado en flow matching, condicionado por visión, lenguaje y propiocepción. En este caso, la política genera acciones de 7 grados de libertad para un robot Panda (Franka Emika), recibiendo imágenes de tres cámaras y el estado articular del brazo.

Con aproximadamente 3.144 millones de parámetros y un repositorio de 100,6 GB, se trata de un modelo de tamaño medio dentro de la familia GR00T, apto para investigación en aprendizaje por imitación y transferencia de simulación a robot real (sim-to-real).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (backbone VLM Cosmos-Reason2/Qwen3-VL + transformador de acciones con flow matching) |
| Parametros totales | 3.144.016.000 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones de tarea en inglés en el dataset de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Datos adicionales:

| Parametro | Valor |
|---|---|
| Libreria | LeRobot |
| Pipeline | robotics |
| Tipo de robot | Panda (Franka Emika) |
| Camaras | agentview, robot0_eye_in_hand, robot0_eye_in_hand_2 |
| Tamano del repositorio | 100,6 GB |
| Descargas / Likes | 24 / 1 |

## Arquitectura y entrenamiento

GR00T N1.7 es un modelo fundacional de robótica de NVIDIA con dos componentes principales: un backbone de visión-lenguaje basado en Cosmos-Reason2/Qwen3-VL que procesa imágenes, instrucciones en lenguaje natural y estado propioceptivo, y un transformador de acciones que emplea flow matching para predecir trayectorias de control continuas. Esta arquitectura dual permite razonar sobre la escena (mediante el VLM) y generar acciones precisas de baja dimensión (mediante el cabezal de acciones), condicionando la salida a visión, lenguaje y propiocepción simultáneamente.

El ajuste fino se realizó con LeRobot sobre el dataset `train_800_complex__mask__overlay_a75__sim__all_cameras__live`, que contiene 790 episodios y 157.904 fotogramas a 20 FPS, generados en simulación con tres vistas de cámara (una vista de agente externa y dos cámaras en la mano del robot). Las tareas consisten en agarrar objetos de geometría variada y compleja (formas lobuladas, estrellas de cuatro puntas, conos, barras acanaladas, etc.) descritas mediante instrucciones en lenguaje natural detalladas, y colocarlos en una caja. La entrada de estado tiene forma `(9,)` y la salida de acción `(7,)`, coherente con un manipulador Panda (7 articulaciones más gripper). No se dispone de información sobre el número de épocas, hiperparámetros de entrenamiento ni semillas concretas más allá del identificador `seed_0`.

## Capacidades

- Predicción de acciones continuas de 7 dimensiones para control de un brazo manipulador Panda.
- Comprensión de instrucciones en lenguaje natural largas y descriptivas para seleccionar el objeto correcto entre múltiples formas similares.
- Procesamiento multi-cámara: fusiona una vista externa (agentview) y dos vistas egocéntricas en la mano (robot0_eye_in_hand y robot0_eye_in_hand_2), cada una a 224x224 píxeles.
- Razonamiento visuomotor condicionado por propiocepción (estado articular de 9 dimensiones).
- Manipulación de objetos con geometría compleja: agarre de formas lobuladas, acanaladas, perforadas o con salientes, gracias al entrenamiento con descripciones semánticas detalladas.
- Herencia de las capacidades generales del modelo base GR00T N1.7: generalización cross-embodiment y seguimiento de instrucciones de lenguaje, aunque este checkpoint está especializado en las tareas del dataset de entrenamiento.

## Casos de uso

- Investigación en aprendizaje por imitación: el checkpoint sirve como referencia para estudiar cómo GR00T N1.7 se adapta a tareas de agarre de objetos complejos descritos lingüísticamente, con un dataset público de 790 episodios.
- Benchmarking de políticas de manipulación: al estar entrenado en simulación con tareas estandarizadas (agarrar y colocar en caja), permite comparar arquitecturas de políticas bajo las mismas condiciones de cámara y estado.
- Desarrollo sim-to-real: la política puede evaluarse primero en simulación y transferirse posteriormente a un robot Panda físico, usando el flujo de trabajo documentado en la guía de LeRobot.
- Selección de objetos guiada por lenguaje: las descripciones semánticas ricas del dataset permiten probar cómo el modelo discrimina entre objetos con geometrías parecidas a partir de instrucciones verbales.
- Prototipado de tareas de pick-and-place: base para sistemas de clasificación de piezas con formas irregulares, donde el agarre robusto de geometrías variadas es el requisito principal.
- Educación y formación en robótica: la integración con LeRobot y la licencia Apache 2.0 facilitan su uso en cursos y laboratorios para enseñar políticas de robótica basadas en modelos fundacionales.
- Evaluación de overlays y máscaras visuales: el nombre del dataset sugiere el uso de máscaras y overlays con alpha 0,75, útil para investigar el efecto de anotaciones visuales en el rendimiento de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card no incluye métricas de éxito en las tareas de agarre, tasas de fallo ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con ~3.100 millones de parámetros en precisión completa (FP32/BF16), la inferencia del modelo requiere del orden de 6-13 GB de VRAM solo para pesos, sin contar el backbone VLM en modo razonamiento ni las activaciones de las tres cámaras.
- GPU recomendadas: no disponible explícitamente. Para modelos de esta escala, una RTX 4090 (24 GB) es típicamente suficiente para inferencia; para entrenamiento o fine-tuning se recomiendan GPUs de gama datacenter tipo A100 o H100.
- Consumer GPU: probablemente viable en una RTX 4090 o RTX 3090 para inferencia, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot es la vía documentada; el repositorio de NVIDIA Isaac-GR00T en GitHub proporciona el código base. No se mencionan soportes para vLLM, llama.cpp, Ollama o TGI, que no aplican directamente a políticas de robótica.
- Latencia y throughput: no disponible. El dataset se grabó a 20 FPS, lo que sugiere que el control se ejecuta a esa frecuencia en los experimentos originales.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|
| GR00T N1.7 (este checkpoint, fine-tuned) | 3.144 M | VLM (Cosmos-Reason2/Qwen3-VL) + flow matching | Apache 2.0 | Publico en Hugging Face |
| GR00T N1.5 (NVIDIA) | no disponible | VLM + flow matching | no disponible | Publico en Hugging Face (nvidia/Isaac-GR00T-N1.5) |
| OpenVLA | ~7.600 M | VLM (Prismatic) + tokenizacion de acciones | MIT | Publico en Hugging Face |
| pi0 (Physical Intelligence, via LeRobot) | ~3.300 M | VLM (PaliGemma) + flow matching | no disponible (pesos abiertos) | Publico en Hugging Face |

Todas las alternativas comparten el patrón de backbone VLM más cabezal de acciones generativas y están integradas o son compatibles con el ecosistema LeRobot, lo que facilita la comparación experimental directa sobre el mismo dataset.

## Limitaciones y advertencias

- Especialización extrema: la política está ajustada a un conjunto concreto de tareas de agarre y colocación en simulación; no debe esperarse que generalice a otros robots, escenas o tareas sin reentrenamiento.
- Entrenado exclusivamente en simulacion: el rendimiento en un robot Panda real (sim-to-real gap) no está documentado y puede degradarse significativamente.
- Robot específico: las formas de entrada `(9,)` y salida `(7,)` corresponden a un manipulador Panda con tres cámaras concretas; la reutilización en otro hardware exige adaptar observaciones y espacios de acción.
- Instrucciones en inglés: las descripciones de tarea del dataset están en inglés; el comportamiento con instrucciones en otros idiomas no está verificado.
- Riesgo de alucinación o selección errónea del objeto: al tratarse de tareas con objetos geométricamente similares, el modelo puede confundir objetos si la descripción lingüística es ambigua o la vista de cámara difiere de la del entrenamiento.
- Descargas muy bajas (24) y sin benchmarks publicados: no existe validación comunitaria del checkpoint; conviene verificar el comportamiento antes de cualquier uso serio.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución sin restricciones significativas, pero el modelo base GR00T N1.7 puede tener términos adicionales de NVIDIA que conviene revisar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mim-chess-vlas/train_800_complex__mask__overlay_a75__sim__all_cameras__live__groot__seed_0
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_complex__mask__overlay_a75__sim__all_cameras__live
- Repositorio NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Libreria LeRobot: https://github.com/huggingface/lerobot
- Guia de LeRobot para groot: https://huggingface.co/docs/lerobot/main/en/groot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
