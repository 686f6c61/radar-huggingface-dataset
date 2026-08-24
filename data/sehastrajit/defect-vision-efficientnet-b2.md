# Sehastrajit/defect-vision-efficientnet-b2

## Resumen

Defect Vision es un clasificador de imágenes basado en EfficientNet-B2, ajustado para la clasificación de defectos en obleas semiconductoras (wafers) con un enfoque de aprendizaje con pocas muestras (*small-sample learning*). Fue desarrollado por Sehastrajit como propuesta para el Intel Semiconductor Solutions Challenge 2026, Problema A, que plantea el reto de clasificar defectos cuando los datos de producción son escasos y desequilibrados. El modelo distingue entre 8 tipos de defecto y una clase adicional de "sin defecto" (9 clases en total), trabajando con imágenes en escala de grises convertidas a RGB de 260×260 píxeles.

La relevancia de este modelo radica en su demostración práctica de técnicas de aumentación agresiva, balanceo de clases y regularización para lograr una precisión del 95,6 % en un conjunto de test con solo 360 imágenes retenidas, superando el objetivo del desafío (~85 %). Con aproximadamente 9,2 millones de parámetros, es un modelo ligero y eficiente, adecuado para entornos industriales con recursos computacionales limitados. Aunque no está validado para despliegue en producción fab, sirve como referencia metodológica para problemas de visión industrial con datos escasos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B2 (backbone de torchvision, preentrenado en ImageNet) con cabezal clasificador personalizado |
| Parametros totales | ~9,2 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin soporte de lenguaje) |
| Licencia | intel-challenge-dataset (licencia específica del desafío Intel, ver archivo LICENSE en el repositorio) |
| Formato de pesos | no disponible (el repositorio de HuggingFace tiene un tamaño de 0,0 GB; el código de ejemplo sugiere un checkpoint de PyTorch `.pth`, pero no se ha confirmado su disponibilidad) |

## Arquitectura y entrenamiento

El modelo utiliza como columna vertebral la arquitectura EfficientNet-B2 de torchvision, preentrenada en ImageNet, sobre la que se sustituye el clasificador final por una secuencia de capas densas: Dropout (0,4), Linear de 512 unidades, activación SiLU, Dropout (0,3) y una capa lineal de salida con 9 neuronas. La entrada son imágenes de 260×260 píxeles en RGB, normalizadas con los valores estándar de ImageNet, aunque las imágenes originales son en escala de grises y se convierten a tres canales.

El entrenamiento se realizó sobre un conjunto de datos balanceado por clases, construido mediante aumentación agresiva (recortes aleatorios, volteos, rotaciones, deformaciones de perspectiva y variación de color) para multiplicar el número de muestras por clase sin duplicar píxeles exactos. Se aplicó *label smoothing* (0,1) sobre la pérdida de entropía cruzada para evitar un sobreajuste excesivo en clases visualmente similares, junto con el optimizador AdamW (lr 2e-4, weight decay 1e-4), el programador OneCycleLR con anneal coseno y *early stopping* con paciencia de 7 épocas. El modelo se detuvo en la época 16, entrenado en una NVIDIA RTX 3060 de 12 GB con precisión mixta (fp16 AMP) y un tamaño de lote efectivo de 128 (64 × 2 pasos de acumulación de gradiente).

## Capacidades

- Clasificación de imágenes de obleas semiconductoras en 8 tipos de defecto más la clase "sin defecto" (9 clases).
- Manejo de conjuntos de datos pequeños y desequilibrados mediante aumentación y balanceo de clases.
- Inferencia rápida: latencia de aproximadamente 40–500 ms por imagen en GPU y 0,1–1 s en CPU.
- Acepta imágenes en escala de grises o RGB, redimensionadas a 260×260 píxeles.
- No dispone de capacidades de *tool calling*, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural; es un modelo puramente de visión por computador.
- Soporte de *few-shot learning*: el modelo demuestra que es posible obtener un alto rendimiento con pocas muestras etiquetadas por clase.

## Casos de uso

- Inspección de calidad en fabricación de semiconductores: el modelo puede integrarse en líneas de producción para clasificar automáticamente defectos en obleas, reduciendo la dependencia de la inspección manual y acelerando la detección de anomalías.
- Control de calidad en tiempo real: gracias a su baja latencia (40–500 ms en GPU), puede desplegarse en sistemas de visión industrial que requieren decisiones rápidas sobre cada pieza inspeccionada.
- Análisis de causa raíz de defectos: al distinguir entre 8 tipos de defecto, los equipos de ingeniería pueden correlacionar cada clase con fallos específicos del proceso de fabricación y priorizar acciones correctivas.
- Investigación académica en *small-sample learning*: el modelo sirve como caso de estudio para técnicas de aumentación, balanceo de clases y regularización en problemas de visión con datos escasos.
- Demostración interactiva y formación: el repositorio incluye una interfaz React y un servicio FastAPI que permiten probar el modelo con imágenes propias, útil para formación de personal técnico o validación de conceptos.
- Prototipado de sistemas de inspección óptica: el modelo puede servir como punto de partida para adaptar la clasificación de defectos a otros dominios industriales (electrónica, automoción, etc.) mediante *transfer learning*.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| Precisión en test (360 imágenes retenidas) | 95,6 % |
| Mejor precisión de validación | 97,5 % |
| Pérdida en test | 0,6153 |
| Latencia de inferencia (GPU) | ~40–500 ms/imagen |
| Latencia de inferencia (CPU) | ~0,1–1 s/imagen |

Informe de clasificación por clases (conjunto de test):

| Clase | Precision | Recall | F1-score | Soporte |
|---|---|---|---|---|
| defect1 | 0,9773 | 0,9556 | 0,9663 | 45 |
| defect2 | 0,9375 | 1,0000 | 0,9677 | 45 |
| defect3 | 1,0000 | 1,0000 | 1,0000 | 45 |
| defect4 | 1,0000 | 1,0000 | 1,0000 | 45 |
| defect5 | 0,9130 | 0,9333 | 0,9231 | 45 |
| defect8 | 0,8837 | 0,8444 | 0,8636 | 45 |
| defect9 | 0,9556 | 0,9556 | 0,9556 | 45 |
| defect10 | 0,9773 | 0,9556 | 0,9663 | 45 |
| new_good | 0,0000 | 0,0000 | 0,0000 | 0 |

Nota: la clase `new_good` (sin defecto) no tiene muestras retenidas en esta revisión del conjunto de datos; la neurona de salida correspondiente está reservada para futuras imágenes de "sin defecto" sin necesidad de re-arquitectura.

## Requisitos de hardware

- Entrenamiento realizado en una NVIDIA RTX 3060 de 12 GB con precisión mixta (fp16 AMP); el modelo es ligero y no requiere hardware de gama alta.
- Inferencia en GPU: cualquier GPU moderna con al menos 2–4 GB de VRAM es suficiente, dado el tamaño del modelo (~9,2 M parámetros).
- Inferencia en CPU: viable, con latencias de 0,1–1 s por imagen, lo que permite despliegues sin GPU en entornos de baja demanda.
- Opciones de despliegue: el repositorio incluye un servicio FastAPI y una interfaz React; también puede integrarse en pipelines de PyTorch estándar o exportarse a formatos optimizados (ONNX, TorchScript) si se desea.
- Throughput estimado: no disponible en la información proporcionada, pero la baja latencia sugiere que puede procesar varias imágenes por segundo en GPU.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de clasificación de defectos en wafers en la información proporcionada. Como referencia genérica, EfficientNet-B2 es una variante de la familia EfficientNet, que incluye B0 a B7 con diferentes equilibrios entre precisión y coste computacional. Sin embargo, no hay resultados publicados que comparen este modelo con alternativas específicas para la misma tarea. Se recomienda consultar la literatura del desafío Intel Semiconductor Solutions Challenge 2026 para obtener comparativas con otras propuestas.

## Limitaciones y advertencias

- El modelo no ha sido validado para despliegue en producción en una fábrica real; es una propuesta de desafío académico.
- La clase `new_good` (sin defecto) no tiene muestras de evaluación en esta revisión del conjunto de datos, por lo que su rendimiento real es desconocido.
- El entrenamiento se realizó sobre imágenes proporcionadas por Intel para el desafío; la generalización a otros tipos de obleas o procesos de fabricación no está garantizada.
- La licencia `intel-challenge-dataset` es específica del desafío y puede restringir el uso comercial; es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso.
- El repositorio de HuggingFace tiene un tamaño de 0,0 GB, lo que sugiere que los pesos del modelo podrían no estar disponibles directamente en la plataforma; el código de ejemplo utiliza `hf_hub_download` para descargar `best_model.pth`, pero su disponibilidad real no está confirmada.
- No se han publicado análisis de sesgos ni de robustez frente a variaciones de iluminación, ruido o condiciones de captura diferentes a las del conjunto de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sehastrajit/defect-vision-efficientnet-b2
- Repositorio GitHub (código, FastAPI, React, notebook de entrenamiento): https://github.com/Sehastrajit-S/defect-vision
- Demo interactiva en HuggingFace Spaces: https://huggingface.co/spaces/Researchdemo834/defectvision
- Documentación de torchvision para EfficientNet-B2: http://docs.pytorch.org/vision/main/models/generated/torchvision.models.efficientnet_b2.html
