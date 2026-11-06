# mws-physical-ai/g1-robohamer-v15-2-persp

## Resumen

RoboHamer v15.2 (variante `v15_2_persp`) es un modelo de estimación de pose de manos diseñado específicamente para la cámara de cabeza del robot humanoide Unitree G1. Lo desarrolla el colectivo `mws-physical-ai` y se publica bajo el paraguas del proyecto RoboHamer, orientado a la percepción de manos para manipulación robótica. El modelo resuelve el problema de inferir la pose 3D de la mano y los comandos de dedos a partir de imágenes monoculares con recortes en perspectiva, un paso previo imprescindible para el control de manos antropomórficas en robótica encarnada.

La relevancia de esta versión radica en la corrección de la regresión que introdujo la v15.1: frente a los 7,91 mm de error de keypoint 3D de la versión anterior, la v15.2 baja a 4,56 mm, y el error de profundidad pasa de 4,87 mm a 2,88 mm, manteniendo el error de comando de dedos en un 2,21 % estable en distintas poses 3D. El repositorio ocupa 5,4 GB y contiene checkpoints de PyTorch (`best.pt`, `latest.pt`) junto con los registros de entrenamiento.

No se dispone de información sobre la arquitectura interna, el número de parámetros, la longitud de contexto ni los idiomas soportados, ya que la model card se centra exclusivamente en el pipeline de entrenamiento y las métricas de validación. El modelo no es un modelo de lenguaje: es un estimador de pose con salidas numéricas (comandos de dedos, keypoints 2D/3D y profundidad).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de estimacion de pose de manos; no se detalla la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | other (ver limitaciones) |
| Formato de pesos | PyTorch (`best.pt`, `latest.pt`) |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura de red (backbone, cabezas de predicción ni resolución de entrada). Por los tags y la descripción, se trata de un estimador de pose de manos monocromático que opera sobre recortes en perspectiva de la cámara de cabeza del Unitree G1 y produce comandos cinemáticos de dedos, keypoints 2D/3D y profundidad. El entrenamiento se realizó durante 150 épocas sobre el dataset `mws-physical-ai/g1-robohamer-gt-v15-2`, con una función de pérdida que combina comandos cinemáticos diferenciables, pérdida de profundidad con peso 10, pérdida de palma con peso 5 y pérdida de pulgar con peso 1,0, además de aumentos fotométricos y los aumentos de perspectiva introducidos en la v15.

El checkpoint `best.pt` corresponde a la época 148 (val score 4,827) y `latest.pt` a la época 150. La validación se realizó sobre 561 manos visibles en el conjunto combinado de validación. La innovación principal de esta versión es el uso de recortes en perspectiva (*perspective-crop*) para mejorar la generalización a vistas oblicuas, junto con la supervisión directa sobre comandos cinemáticos diferenciables, lo que permite entrenar de extremo a extremo sin depender únicamente de anotaciones de keypoints. No se indica si hubo RLHF, DPO ni otras fases de ajuste.

## Capacidades

- Estimación de pose de manos 3D a partir de imágenes monoculares de la cámara de cabeza del Unitree G1.
- Predicción de comandos cinemáticos de dedos (finger commands) con un MAE del 2,21 %.
- Predicción de keypoints 2D (2,50 px de error) y 3D (4,56 mm de error).
- Estimación de profundidad con un error de 2,88 mm.
- Manejo de recortes en perspectiva (*perspective-crop*), lo que permite trabajar con vistas oblicuas.
- Estabilidad de los comandos de dedos en distintas poses 3D (según la model card).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan capacidades de visión general (detección, segmentación, VQA) fuera de la pose de manos.

## Casos de uso

- Control de manos antropomórficas del Unitree G1: el modelo traduce la imagen de la cámara de cabeza en comandos de dedos con un MAE del 2,21 %, lo que permite cerrar el bucle de imitación de gestos humanos en tiempo de ejecución.
- Teleoperación con retargeting de manos: dado que predice keypoints 3D con 4,56 mm de error, puede usarse para mapear la pose de la mano del operador a la mano del robot sin calibración manual por gesto.
- Aprendizaje por imitación desde demostraciones: las predicciones de comandos de dedos y keypoints 3D sirven como etiquetas automáticas para grabar episodios de manipulación con el G1 y entrenar políticas posteriores.
- Manipulación fina con objetos pequeños: el error de profundidad de 2,88 mm y el error de keypoint 2D de 2,50 px permiten abordar tareas de agarre de precisión (pinza, llave, herramientas) donde la posición del pulgar es crítica.
- Interacción humano-robot en entornos domésticos: la detección de la pose de la mano del usuario desde la cámara de cabeza permite al robot anticipar gestos de entrega o señalamiento.
- Validación y depuración de datasets de pose: el modelo puede ejecutarse sobre el conjunto de validación para detectar muestras mal etiquetadas, comparando las predicciones con las anotaciones ground truth del dataset `g1-robohamer-gt-v15-2`.
- Investigación en percepción encarnada: sirve como baseline reproducible para comparar variantes de aumentos de perspectiva y pérdidas cinemáticas en la estimación de pose de manos para humanoides.

## Benchmarks y rendimiento

Resultados de validación publicados en la model card (561 manos visibles, conjunto combinado de validación):

| Metrica | v15 (original) | v15.1 | v15.2 (este modelo) |
|---|---|---|---|
| MAE de comandos de dedos | 1,15 % | 2,05 % | 2,21 % |
| Error de keypoint 3D | 2,49 mm | 7,91 mm | 4,56 mm (-42 % vs v15.1) |
| Error de profundidad | 1,68 mm | 4,87 mm | 2,88 mm (-41 % vs v15.1) |
| Error de keypoint 2D | ~3,0 px | 3,2 px | 2,50 px |

El val score de `best.pt` (época 148) es 4,827. No se han publicado resultados frente a benchmarks estándar de pose de manos (por ejemplo, FreiHAND o HO-3D) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 5,4 GB e incluye dos checkpoints (`best.pt` y `latest.pt`), por lo que cada checkpoint podría rondar los 2,5-3 GB en precisión completa; no se confirma el tamaño exacto ni la precisión de los pesos.
- GPU recomendadas: no disponible. Al ser un modelo de visión de tamaño moderado, es probable que quepa en GPUs de consumo (RTX 3060/4060 en adelante), pero no hay datos publicados que lo confirmen.
- Cabe en GPU de consumo: no confirmado por el autor; por el tamaño del repositorio, es plausible en GPUs con 8 GB o más, pero debe verificarse.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a un modelo de visión). El formato es PyTorch (`best.pt`), por lo que el despliegue sería mediante PyTorch/TorchScript/ONNX tras conversión, no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card únicamente compara la v15.2 con las versiones anteriores del mismo proyecto (v15 y v15.1), cuyos datos se recogen en la tabla de benchmarks. No se han publicado comparaciones con otros estimadores de pose de manos para humanoides.

## Limitaciones y advertencias

- Licencia `other`: no se especifican los términos exactos de uso comercial, redistribución ni modificación. Es imprescindible contactar con el autor antes de cualquier uso en producción.
- El modelo está entrenado específicamente para la cámara de cabeza del Unitree G1 y el dataset `g1-robohamer-gt-v15-2`; su generalización a otras cámaras, robots o dominios visuales no está documentada.
- La validación se limita a 561 manos visibles; no hay evaluación en manos ocluidas, guantes, iluminación adversa ni otros escenarios.
- El MAE de comandos de dedos de la v15.2 (2,21 %) es peor que el de la v15 original (1,15 %), aunque la model card lo justifica por una mayor estabilidad en poses 3D. Conviene evaluar ambos checkpoints según la tarea.
- No se documentan sesgos demográficos ni de otro tipo; al ser un modelo de pose, los sesgos potenciales provendrían de la distribución del dataset de entrenamiento, no descrita.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de predicciones plausibles pero incorrectas en poses fuera de distribución.
- No hay información sobre requisitos de calibración de cámara más allá de la referencia al repositorio `mws-physical-ai/g1-head-camera-calibration-final`.
- El repositorio se creó y actualizó en noviembre de 2026 según los metadatos; verificar la vigencia de los enlaces y del dataset asociado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mws-physical-ai/g1-robohamer-v15-2-persp
- Dataset de entrenamiento: https://huggingface.co/datasets/mws-physical-ai/g1-robohamer-gt-v15-2
- Calibración de la cámara de cabeza: `mws-physical-ai/g1-head-camera-calibration-final` (referenciado en la model card; no se proporciona URL directa)
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información disponible.
