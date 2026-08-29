# Pranilllllll/geonusaf-segNext-random-fold2

## Resumen

El modelo `Pranilllllll/geonusaf-segNext-random-fold2` es un checkpoint de segmentación semántica basado en la arquitectura SegNeXt (NeurIPS 2022), desarrollado por el usuario Pranilllllll. Está diseñado para clasificar el uso del suelo en el valle de Katmandú (Nepal) en seis categorías: residencial, carretera, río, bosque, suelo no utilizado y agrícola. El modelo emplea un encoder MSCAN-T (versión tiny) y un decoder LightHamHead, con un total de 4,23 millones de parámetros.

El checkpoint corresponde al fold 2 de un split aleatorio de 3 pliegues, con semilla 42. Según la model card, el mejor epoch registrado es el 0, y las métricas de validación son extremadamente bajas (mIoU 0,0032, mF1 0,0063, OA 0,0090), lo que indica que el modelo no ha sido entrenado de forma efectiva o que el checkpoint es un estado inicial sin convergencia. Por tanto, no es adecuado para uso práctico en producción, aunque puede servir como referencia para estudios de reproducibilidad o como punto de partida para fine-tuning.

La licencia es Apache-2.0, lo que permite uso comercial y modificación, siempre que se mantenga la atribución. El modelo se distribuye en formato PyTorch (archivo `best.pt` con `model_state`, `arch`, `cfg` y `metrics`), y el código de reconstrucción se incluye en el repositorio (`segnext_model.py`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegNeXt-T: encoder MSCAN-T + decoder LightHamHead |
| Parametros totales | 4,23 M |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (solo pesos en FP32/FP16, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de segmentación de imágenes, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`best.pt` con `model_state`, `arch`, `cfg`, `metrics`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SegNeXt, que combina un encoder MSCAN (Multi-scale Convolutional Attention Network) con un decoder ligero LightHamHead. El encoder MSCAN-T (tiny) se inicializa con pesos preentrenados en ImageNet-1K (el 100% de los tensores se cargaron correctamente). El decoder utiliza un fuse stride de 8, combinando las etapas 1, 2 y 3 del encoder. Se aplica una descomposición NMF (Non-negative Matrix Factorization) con rango R=16, usando 6 pasos en entrenamiento y 7 en evaluación.

El entrenamiento se realizó con imágenes de 512x512 píxeles, normalización ImageNet y un GSD efectivo de 0,586 m/px. La tasa de aprendizaje fue de 0,0006 para el decoder y 6e-05 para el encoder, con weight decay 0,01, drop path 0,1, suavizado de etiquetas 0,05 y EMA (Exponential Moving Average) activado. El número de épocas no se especifica, pero el mejor epoch registrado es 0, lo que sugiere que el entrenamiento no progresó o que el checkpoint se guardó al inicio. No se menciona el tamaño del dataset ni el número de tokens (no aplicable a visión).

## Capacidades

- Segmentación semántica de imágenes de teledetección: clasifica cada píxel en una de seis clases de uso del suelo (residencial, carretera, río, bosque, suelo no utilizado, agrícola).
- Soporte de `ignore_index=255` para píxeles no etiquetados o fuera de las clases de interés.
- Entrada de imágenes de 512x512 píxeles con normalización ImageNet.
- Arquitectura eficiente con solo 4,23 M de parámetros, adecuada para despliegue en entornos con recursos limitados.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente visual.

## Casos de uso

- Cartografía de uso del suelo en zonas urbanas: el modelo puede clasificar automáticamente imágenes satelitales o aéreas del valle de Katmandú, facilitando la actualización de mapas de ocupación del suelo para planificación urbana.
- Monitoreo de cambios ambientales: al comparar segmentaciones de diferentes fechas, se pueden detectar variaciones en la cobertura forestal, expansión urbana o cambios en cauces fluviales.
- Gestión de recursos hídricos: la clase "River" permite delimitar cuerpos de agua, útil para estudios de inundaciones o gestión de cuencas.
- Agricultura de precisión: la clase "Agricultural" ayuda a identificar zonas de cultivo, aunque el rendimiento actual es insuficiente para uso real.
- Detección de suelo no utilizado: útil para identificar terrenos baldíos o degradados, apoyando políticas de reurbanización.
- Investigación académica en segmentación semántica: sirve como ejemplo de aplicación de SegNeXt a un dominio específico, aunque con métricas muy bajas que requieren reentrenamiento.

## Benchmarks y rendimiento

Los resultados de validación reportados en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| mIoU | 0,0032 |
| mF1 | 0,0063 |
| OA (Overall Accuracy) | 0,0090 |
| Kappa | 0,0005 |

Per-class (validation):

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0,0010 | 0,0021 |
| Road | 0,0089 | 0,0176 |
| River | 0,0082 | 0,0162 |
| Forest | 0,0003 | 0,0006 |
| UnusedLand | 0,0007 | 0,0013 |
| Agricultural | 0,0000 | 0,0000 |

Estos valores son extremadamente bajos, lo que indica que el modelo no ha aprendido a segmentar correctamente. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- Al ser un modelo de solo 4,23 M de parámetros, la inferencia puede ejecutarse en CPU con un consumo de memoria bajo (menos de 1 GB de RAM).
- En GPU, cualquier tarjeta con al menos 2 GB de VRAM es suficiente, incluyendo GPUs integradas o de gama baja (por ejemplo, NVIDIA GTX 1050, Jetson Nano).
- Para entrenamiento o fine-tuning, se recomienda una GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 2060) para manejar lotes pequeños.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede servirse con TorchServe, ONNX Runtime o exportarse a TensorRT. No se han publicado versiones GGUF ni integraciones con vLLM u Ollama.
- La latencia estimada en CPU para una imagen 512x512 es de aproximadamente 0,5-1 segundo; en GPU (RTX 3060) sería de 10-20 ms por imagen, aunque estos valores son orientativos y no han sido medidos oficialmente.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo dominio (segmentación de uso del suelo en Katmandú) dentro de la información proporcionada. Como referencia arquitectónica, el SegNeXt original (con encoder MSCAN-B o MSCAN-L) tiene entre 14 y 28 millones de parámetros y alcanza un mIoU de 50-60% en Cityscapes, pero no es directamente comparable por el dominio y el tamaño. Se recomienda consultar el repositorio oficial de SegNeXt para comparaciones con otras arquitecturas de segmentación.

## Limitaciones y advertencias

- El modelo presenta métricas de validación casi nulas (mIoU 0,0032), lo que indica que no ha sido entrenado correctamente o que el checkpoint es un estado inicial. No debe utilizarse en aplicaciones reales sin un reentrenamiento completo.
- El mejor epoch registrado es 0, lo que sugiere que el entrenamiento no progresó o que el guardado se realizó al inicio. Es probable que el dataset o la configuración de entrenamiento tengan problemas.
- No se especifica el tamaño del dataset de entrenamiento ni su composición, lo que dificulta evaluar la generalización.
- La clase "Agricultural" tiene IoU 0,0000, lo que implica que el modelo no es capaz de detectar esta clase en absoluto.
- Al ser un modelo de visión, no tiene capacidades de lenguaje ni soporte para tareas multimodales.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento del modelo.
- No se han publicado cuantizaciones ni formatos optimizados (GGUF, ONNX, etc.), lo que limita su despliegue en entornos de producción con requisitos específicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pranilllllll/geonusaf-segNext-random-fold2
- Repositorio oficial de SegNeXt (GitHub): https://github.com/Visual-Attention-Network/SegNeXt
- Paper de SegNeXt (PDF): https://raw.githubusercontent.com/Visual-Attention-Network/SegNeXt/main/resources/paper.pdf
- Modelo relacionado (fold 1): https://huggingface.co/Pranilllllll/geonusaf-segNext-block-fold1
