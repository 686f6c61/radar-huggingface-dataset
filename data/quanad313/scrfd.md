# Quanad313/scrfd

## Resumen

SCRFD (Sample and Computation Redistribution for Face Detection) es un repositorio de código abierto publicado en Hugging Face por el usuario Quanad313 bajo el identificador `Quanad313/scrfd`. No se trata de un modelo de lenguaje, sino de un proyecto de código y configuración para entrenar, evaluar y exportar el detector de caras SCRFD, basado en MMDetection. El repositorio incluye el código de MMDetection adaptado dentro del directorio `mmdet/`, configuraciones de arquitectura y dataset, herramientas de entrenamiento y evaluación, demos y scripts de búsqueda de arquitecturas.

El proyecto está orientado a desarrolladores que necesitan reentrenar o hacer fine-tuning de SCRFD sobre datasets propios con anotaciones en formato COCO. La model card describe el flujo completo: instalación de dependencias (PyTorch 1.8.0 con CUDA 11.1, `mmcv-full` 1.3.3, Python 3.8), preparación de datos, creación de un config derivado de `scrfd_2.5g.py`, fine-tuning con checkpoint upstream y evaluación con métrica bbox de COCO. La variante de referencia citada es SCRFD 2.5G sin keypoints.

La relevancia actual del repositorio es acotada: se publicó sin descargas ni likes, sin licencia declarada y sin resultados de benchmarks propios. Su valor está en empaquetar un pipeline funcional de entrenamiento de SCRFD dentro de MMDetection para quien quiera adaptar el detector a clases distintas de la detección facial, como el ejemplo de fuego y humo que aparece en la configuración de muestra.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SCRFD (detector de caras basado en CNN con asignación de muestras y redistribución de cómputo); implementación sobre MMDetection |
| Parametros totales | no disponible (la variante de referencia es SCRFD 2.5G) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible; el proyecto incluye exportación a ONNX |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch `.pth`; exportación a ONNX mediante herramientas del proyecto |

## Arquitectura y entrenamiento

SCRFD es un detector de caras de una etapa basado en CNN, diseñado originalmente con una estrategia de redistribución de muestras y cómputo entre los niveles del feature pyramid. El repositorio integra la implementación dentro de MMDetection 1.x, con código de modelo, lectores de dataset, funciones de pérdida y postprocesado incluidos en `mmdet/`. La configuración de referencia es `configs/scrfd/scrfd_2.5g.py`, que define la arquitectura de 2.5G y sirve de base para configs derivadas.

El flujo de entrenamiento documentado usa anotaciones COCO, pipeline de aumento con `Resize` a 640x640, `RandomFlip` con probabilidad 0.5, normalización con media 127.5 y desviación 128.0, y padding a 640x640. La configuración de ejemplo fija `samples_per_gpu=2`, `workers_per_gpu=2`, learning rate 0.001, warmup de 100 iteraciones, step en las épocas 20 y 27, y 30 épocas totales con evaluación cada 5 épocas. El pipeline de entrenamiento omite el `RandomSquareCrop` original de SCRFD porque ese recorte requiere al menos una caja y puede entrar en bucle con imágenes sin objetos. No se documentan en la información disponible el número de tokens ni la composición del dataset de preentrenamiento original, ni si hubo etapas de RLHF o DPO (no aplicables a un detector).

## Capacidades

- Detección de objetos con cajas delimitadoras en imágenes, con soporte para keypoints faciales si se activa `use_kps`.
- Entrenamiento y fine-tuning sobre datasets propios en formato COCO JSON.
- Evaluación con la métrica bbox de COCO a intervalos configurables.
- Exportación del modelo a ONNX mediante las herramientas del directorio `tools/`.
- Demo de inferencia sobre imágenes o webcam con checkpoints PyTorch.
- Medición de velocidad de inferencia mediante herramientas del proyecto.
- Generación y búsqueda de configuraciones candidatas de arquitectura SCRFD en `search_tools/`.
- Soporte de clases personalizadas, como el ejemplo de `fire` y `smoke` incluido en la configuración de muestra.
- No incluye capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multimodalidad lingüística.

## Casos de uso

- Detección facial en producción: se puede hacer fine-tuning de SCRFD 2.5G con un checkpoint upstream y desplegar la inferencia sobre imágenes o vídeo, aprovechando el pipeline de evaluación COCO del repositorio para medir precisión antes de publicar.
- Adaptación a dominios no faciales: la configuración de ejemplo con clases `fire` y `smoke` muestra cómo reemplazar las clases de cara por otras categorías, útil para detección de objetos específicos en imágenes de vigilancia o industria.
- Investigación en detección de objetos: el directorio `search_tools/` permite generar configuraciones candidatas y buscar arquitecturas SCRFD, lo que sirve para experimentos de ablación sobre el backbone y la redistribución de cómputo.
- Integración en pipelines de visión con MMDetection: al estar construido sobre MMDetection 1.x, el modelo puede encajar en flujos existentes de entrenamiento, evaluación y exportación que ya usen esa versión del framework.
- Despliegue en entornos con ONNX Runtime: la exportación a ONNX permite llevar el detector a servicios de inferencia que no dispongan de PyTorch, manteniendo el postprocesado descrito en el repositorio.
- Prototipado rápido con demo y webcam: el directorio `demo/` permite validar un checkpoint PyTorch sobre imágenes o cámara en directo antes de invertir en un entrenamiento completo.
- Medición de latencia y throughput: las herramientas de medición de velocidad del proyecto permiten caracterizar el coste de inferencia de una configuración concreta antes de decidir el despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible; el proyecto requiere GPU CUDA para el script `tools/train.py`.
- Compatibilidad con GPU de consumo: no disponible; el entorno de ejemplo usa PyTorch 1.8.0 con CUDA 11.1 y `mmcv-full` 1.3.3, lo que condiciona la versión de CUDA y el controlador.
- Opciones de despliegue: PyTorch con CUDA para entrenamiento e inferencia, exportación a ONNX para servir el modelo; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de visión).
- Latencia y throughput estimados: no disponible.
- Entorno de referencia: Linux x86-64 o WSL2 con GPU CUDA, Python 3.8, NumPy inferior a 1.24 y Cython inferior a 3.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Quanad313/scrfd | Detector de objetos (SCRFD sobre MMDetection) | no disponible (variante 2.5G) | no aplica | no disponible | Hugging Face, 0 descargas |
| SCRFD upstream (InsightFace) | Detector de caras | variantes 0.5G, 2.5G, 10G, 34G | no aplica | licencia del proyecto InsightFace | Repositorio upstream de InsightFace |
| RetinaFace | Detector de caras | variantes según backbone | no aplica | licencia del proyecto original | Implementaciones en múltiples repositorios |
| YOLOv8-face | Detector de caras | variantes n, s, m, l | no aplica | licencia del proyecto Ultralytics | Repositorio Ultralytics |

La comparación se limita a la categoría de detectores de caras u objetos de una etapa. No se dispone de datos de rendimiento del repositorio evaluado para comparar métricas como mAP o latencia frente a estas alternativas.

## Limitaciones y advertencias

- El repositorio no declara licencia, lo que impide determinar si el uso comercial está permitido; es un riesgo legal relevante para producción.
- No se han publicado benchmarks propios ni métricas de precisión del checkpoint o de la configuración de ejemplo.
- El proyecto no incluye pesos entrenados en el propio repositorio; remite a un enlace externo de OneDrive para el checkpoint SCRFD 2.5G upstream, lo que añade dependencia de un recurso ajeno a Hugging Face.
- El entorno de dependencias está fijado a versiones antiguas (PyTorch 1.8.0, `mmcv-full` 1.3.3, Python 3.8, NumPy inferior a 1.24), lo que puede dificultar la instalación en sistemas modernos y requiere compilar MMCV si no hay wheel compatible.
- En Windows la instalación puede fallar si no existe wheel de `mmcv-full` para la combinación de Python, PyTorch y CUDA; la model card recomienda WSL2 o compilar MMCV.
- El pipeline de entrenamiento de ejemplo omite `RandomSquareCrop` y puede no reproducir exactamente el régimen de aumento del entrenamiento original de SCRFD.
- La configuración de ejemplo usa valores de learning rate, batch size y épocas como punto de partida, no como valores validados.
- No se documentan sesgos del modelo ni tasas de error por grupo demográfico, un aspecto crítico en detección facial.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso o validación por parte de la comunidad.
- El contenido de la model card está redactado en vietnamita y no se ofrece traducción oficial.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Quanad313/scrfd
- Checkpoint SCRFD 2.5G upstream (OneDrive): https://1drv.ms/u/s!AswpsDO2toNKqyTIXnzB1ujPq4th?e=5t1VNv
- Repositorio de wheels de PyTorch: https://download.pytorch.org/whl/torch_stable.html
- Repositorio de wheels de MMCV para la configuración de ejemplo: https://download.openmmlab.com/mmcv/dist/cu111/torch1.8.0/index.html
