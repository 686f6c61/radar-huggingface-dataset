# hylin16/food-recognition-food11-effnet-b4-cbam-300

## Resumen

Este modelo es un clasificador de imágenes de alimentos desarrollado por hylin16, basado en una red EfficientNet-B4 con un bloque CBAM (Convolutional Block Attention Module) insertado entre las características extraídas por el backbone y la cabeza de clasificación. Se entrenó de forma totalmente supervisada sobre el dataset Food-11, que contiene 11 categorías de comida, con una resolución de entrada de 300 píxeles. El repositorio pesa 0,1 GB y el checkpoint se distribuye en formato PyTorch (best.pt).

La relevancia del modelo radica en combinar una arquitectura eficiente (EfficientNet-B4) con un mecanismo de atención espacial y de canal (CBAM) que permite mejorar la discriminación entre clases de alimentos visualmente similares. Publicado bajo licencia MIT, el modelo está diseñado para tareas de clasificación de imágenes y se puede cargar fácilmente mediante el paquete food_recognition, que también proporciona herramientas de interpretación con Grad-CAM. No se especifican los parámetros totales en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B4 con bloque CBAM (atención de canal y espacial) entre las características y la cabeza de clasificación |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | MIT |
| Formato de pesos | PyTorch (best.pt) |

## Arquitectura y entrenamiento

La arquitectura parte de un backbone EfficientNet-B4 de torchvision al que se le añade un bloque CBAM entre las features y la cabeza de clasificación. CBAM aplica atención de canal seguida de atención espacial, lo que permite al modelo recalibrar los mapas de características y resaltar regiones relevantes de la imagen. El entrenamiento se realizó sobre el dataset Food-11 con 11 clases, resolución de 300 píxeles, batch size de 32, learning rate de 0,0005, scheduler coseno y 30 épocas. El tiempo total de entrenamiento fue de 49 minutos. No se utilizó RLHF ni DPO: el entrenamiento es completamente supervisado, sin pseudo-etiquetado. La composición detallada del dataset no se proporciona en la información disponible.

## Capacidades

- Clasificación de imágenes de alimentos en 11 categorías del dataset Food-11.
- Inferencia con top-k: el método predictor.predict devuelve las k etiquetas más probables.
- Interpretabilidad mediante Grad-CAM, con una utilidad de línea de comandos (food-recognition-gradcam) para visualizar qué píxeles influyen en la predicción.
- El checkpoint embebe la arquitectura, la resolución de entrada y los nombres de las clases, lo que simplifica la carga sin especificar estos parámetros.
- No soporta tool calling, agentes ni generación de texto; es un clasificador puro de imágenes.

## Casos de uso

- Aplicaciones móviles de nutrición: el usuario fotografía un plato y el modelo clasifica el alimento. Su precisión del 94,85% en Food-11 y su tamaño de repositorio de 0,1 GB lo hacen adecuado para integrarse en apps con recursos limitados.
- Sistemas de recomendación de recetas: al identificar el tipo de comida en una imagen, se pueden sugerir recetas similares o alternativas.
- Control de calidad en comedores o cafeterías: clasificación automática de los platos servidos en línea de producción para gestión de inventario o análisis de menús.
- Análisis de hábitos alimentarios en investigación: etiquetado automático de fotografías de comidas en estudios de consumo o epidemiología nutricional.
- Demostraciones educativas de atención visual: uso de Grad-CAM para mostrar a estudiantes de visión por computador cómo el modelo focaliza su atención en la imagen.
- Integración en cámaras inteligentes: clasificación en tiempo real de alimentos en electrodomésticos o dispositivos de cocina, siempre que se disponga de hardware de inferencia adecuado.

## Benchmarks y rendimiento

La información proporcionada incluye los resultados declarados por el autor sobre el conjunto de validación completo de Food-11:

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 0.9484848484848485 |
| Macro F1 | 0.9480773219451275 |

Además, se indica que la clase más difícil es la clase 02 (F1 0,855) y la más fácil es la clase 06 (F1 1,000). No se han publicado resultados de benchmarks comparando este modelo con otros clasificadores de alimentos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no hay datos oficiales, pero al tratarse de un modelo de clasificación de imágenes basado en EfficientNet-B4, se espera que pueda ejecutarse en GPUs de gama media; sin embargo, no se confirma con cifras concretas.
- Opciones de despliegue: el modelo se distribuye como checkpoint PyTorch y se carga mediante la librería food_recognition. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados comparativos con otros modelos de clasificación de alimentos, por lo que no se puede realizar una comparación rigurosa en esta ficha.

## Limitaciones y advertencias

- El modelo fue entrenado exclusivamente con Food-11; la precisión en otros platos, cocinas o condiciones fotográficas no está medida.
- Puede devolver una etiqueta con alta confianza incluso para imágenes que no contienen comida.
- Las predicciones no constituyen un juicio nutricional, de alérgenos ni de seguridad alimentaria. No debe utilizarse en contextos donde una clasificación errónea pueda suponer un riesgo para la salud.
- La precisión de validación (94,85%) es una estimación optimista del rendimiento real en campo, ya que se mide sobre un split público de benchmark.
- La información disponible no documenta sesgos específicos. Dado que Food-11 es un dataset de imágenes de Internet, es posible que existan sesgos no evaluados, especialmente en la representación de cocinas no occidentales.
- No soporta tool calling, agentes ni generación de texto; es un clasificador de imágenes puro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hylin16/food-recognition-food11-effnet-b4-cbam-300
- Repositorio de entrenamiento food_recognition: https://github.com/linhongyu510/food_recognition
- Paper CBAM (arXiv:1807.06521): https://arxiv.org/abs/1807.06521
