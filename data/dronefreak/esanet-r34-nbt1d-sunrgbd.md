# dronefreak/esanet-r34-nbt1d-sunrgbd

## Resumen

ESANet (ResNet34-NBt1D) es un modelo de segmentación semántica RGB-D diseñado específicamente para la comprensión de escenas de interior. Lo desarrolla el grupo de Neuroinformática y Robótica Cognitiva de la TU Ilmenau (Daniel Seichter et al.) y se presentó en el paper "Efficient RGB-D Semantic Segmentation for Indoor Scene Analysis" (ICRA 2021). El repositorio analizado es un espejo no oficial en Hugging Face que redistribuye los pesos originales sin modificaciones, añadiendo una copia en formato safetensors y un `config.json`.

El modelo resuelve el problema de asignar una clase semántica a cada píxel de una imagen de interior combinando información de color (RGB) y de profundidad (D). Su arquitectura emplea dos codificadores ResNet34-NBt1D independientes, uno para RGB y otro para profundidad, fusionados mediante un módulo de atención. Con 47.000.056 parámetros y 37 clases de salida, está pensado para robótica móvil y análisis de escenas donde el coste computacional importa.

Es relevante porque ofrece un equilibrio entre precisión y eficiencia para despliegue en plataformas con recursos limitados, y porque el espejo facilita el acceso a unos pesos que originalmente solo se distribuían vía Google Drive. No es un modelo de lenguaje: no genera texto ni soporta tool calling; su única salida es un mapa de segmentación por píxel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ESANet: dos codificadores ResNet34-NBt1D (RGB y profundidad) con fusión basada en atención y decodificador |
| Parametros totales | 47.000.056 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen RGB-D) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones en la información proporcionada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), PyTorch (`r34_NBt1D.pth`), checkpoint de encoder ImageNet (`pretrained/imagenet_r34_NBt1D.pth`) |

## Arquitectura y entrenamiento

ESANet es una red neuronal convolucional para segmentación semántica densa. Consta de dos ramas codificadoras basadas en ResNet34-NBt1D (una variante de ResNet34 con bloques preactivados y normalización por lotes adaptada), una para la imagen RGB y otra para el mapa de profundidad. Las características de ambas ramas se combinan mediante un módulo de fusión con atención, y un decodificador reconstructor genera el mapa de segmentación a la resolución de entrada. Los codificadores se inicializan con pesos preentrenados en ImageNet, cuyo checkpoint también se incluye en el repositorio.

El modelo se entrena sobre el dataset SUN RGB-D, con 37 clases semánticas de interiores (suelo, pared, silla, mesa, etc.). La información proporcionada no detalla el número de tokens ni la composición exacta del dataset más allá de su procedencia, ni indica si se aplicaron técnicas de RLHF/DPO (no aplicables a este tipo de modelo). La innovación principal es la fusión multimodal RGB-D con atención manteniendo un coste computacional bajo, orientada a robots móviles y sistemas embebidos.

## Capacidades

- Segmentación semántica densa de imágenes RGB-D en 37 clases de interiores.
- Fusión multimodal de color y profundidad mediante atención.
- Comprensión de escenas de interior (suelo, paredes, mobiliario, objetos).
- Inferencia eficiente apta para plataformas con recursos limitados (diseño orientado a robótica).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión general ni audio; su única modalidad es imagen RGB-D.

## Casos de uso

- Robótica móvil de interior: el modelo segmenta el suelo, paredes y obstáculos a partir de RGB-D para que un robot navegue de forma segura en entornos domésticos u oficinas, aprovechando su bajo coste computacional.
- Asistencia a personas con movilidad reducida: un robot o silla inteligente puede identificar superficies transitables y objetos cercanos en tiempo real gracias a la fusión RGB-D.
- Mapeo semántico 3D: integrando las predicciones por píxel en una nube de puntos o mapa de ocupación, se obtienen mapas etiquetados de interiores para planificación de trayectorias.
- Análisis de escenas para realidad aumentada: identificar mobiliario y superficies para anclar objetos virtuales sobre el suelo o mesas detectadas.
- Automatización de inventario en interiores: segmentar estanterías, cajas y productos en imágenes capturadas con cámaras RGB-D para tareas de recuento o localización.
- Investigación en visión por computador: servir como línea base reproducible para experimentos de segmentación RGB-D, ya que los pesos originales están disponibles y el espejo incluye safetensors.
- Preprocesado para pipelines de manipulación robótica: aislar la región de una mesa o un objeto antes de aplicar un detector o un planificador de agarre.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| mIoU (SUN RGB-D test) | 48.17 |

Dato reportado por los autores del paper original. No se han publicado en la información disponible otros resultados comparativos (por ejemplo frente a modelos similares) más allá de este valor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 47 M de parámetros en FP32 el peso ronda los 188 MB, por lo que la VRAM necesaria es modesta (del orden de 1-2 GB incluyendo activaciones a resoluciones habituales, estimación orientativa).
- GPU recomendadas: no se especifican en la información; por tamaño, cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como en A100/H100 para lotes grandes.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 2-4 GB de VRAM (estimación orientativa, no confirmada por el autor).
- Opciones de despliegue: el código oficial (TUI-NICR/ESANet) usa PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo). Se puede exportar a ONNX/TensorRT por cuenta propia, aunque no está documentado.
- Latencia y throughput: no disponibles en la información proporcionada; el paper original referencia velocidades de inferencia en su README, pero no se incluyen aquí.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | mIoU SUN RGB-D | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ESANet (ResNet34-NBt1D) | 47,0 M | Imagen RGB-D | 48,17 | Apache-2.0 | Hugging Face (espejo) y GitHub oficial |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de otros modelos de segmentación RGB-D (por ejemplo, variantes de ESANet con EfficientNet, o arquitecturas como SA-Gate o CMX) para establecer una comparación rigurosa con cifras verificadas.

## Limitaciones y advertencias

- Es un espejo no oficial: los pesos son idénticos a los originales, pero el mantenimiento y la garantía corren a cargo de un tercero, no de la TU Ilmenau.
- Entrenado exclusivamente en SUN RGB-D: puede generalizar mal a dominios distintos (exteriores, iluminación atípica, sensores con otra calibración).
- Depende de disponer de mapa de profundidad alineado con la imagen RGB; sin profundidad, la rama D no puede explotarse correctamente.
- Riesgo de errores en clases poco representadas o en objetos ocluidos; el mIoU de 48,17 indica margen de mejora sustancial.
- No es un modelo de lenguaje: no admite texto, tool calling ni razonamiento; usarlo para esas tareas es un error de categoría.
- Licencia Apache-2.0 permite uso comercial, pero conviene citar el paper original según pide el autor.
- No se documentan sesgos específicos ni evaluaciones de robustez más allá del benchmark SUN RGB-D.
- Para producción, verificar la compatibilidad exacta entre el `state_dict` del espejo y la versión del código oficial, ya que pequeñas divergencias en la fábrica del modelo pueden romper la carga.

## Enlaces

- Hugging Face: https://huggingface.co/dronefreak/esanet-r34-nbt1d-sunrgbd
- Paper (arXiv): https://arxiv.org/abs/2011.06961
- Repositorio oficial: https://github.com/TUI-NICR/ESANet
- Dataset (espejo en Hub): https://huggingface.co/datasets/dronefreak/SUN-RGBD
- Resultados y pesos oficiales: https://github.com/TUI-NICR/ESANet#results--weights
