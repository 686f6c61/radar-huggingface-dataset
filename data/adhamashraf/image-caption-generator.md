# AdhamAshraf/image-caption-generator

## Resumen

El modelo `AdhamAshraf/image-caption-generator` es un sistema de generación de subtítulos para imágenes basado en una arquitectura clásica encoder-decoder: un ResNet50 preentrenado en ImageNet y congelado actúa como extractor de características visuales, y un LSTM de una capa genera la descripción palabra por palabra. Desarrollado por Adham Ashraf, el modelo se entrenó sobre el conjunto de datos Flickr8k, que contiene 8.091 imágenes con cinco subtítulos de referencia cada una, y se distribuye con dos checkpoints: uno baseline y otro regularizado con dropout, weight decay y gradient clipping, siendo este último el recomendado por su mejor rendimiento.

El proyecto es relevante como ejemplo didáctico y funcional de image captioning con PyTorch, ya que incluye el código completo de entrenamiento, inferencia y una demo interactiva. Aunque no es un modelo de última generación frente a arquitecturas modernas como BLIP o LLaVA, su simplicidad y licencia MIT lo hacen útil para aprender, experimentar y desplegar en escenarios con recursos limitados. El repositorio ocupa 0,2 GB y los pesos se almacenan como state_dicts de PyTorch, no como pesos compatibles directamente con la librería `transformers`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet50 (congelado, preentrenado en ImageNet) + proyección lineal (2048→256) + LSTM de 1 capa (hidden_dim=512) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen, salida de texto) |
| Tipos de cuantizacion | no disponible (solo pesos en precisión completa) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch state_dict (`.pt`) con metadatos de configuración (YAML) |

## Arquitectura y entrenamiento

La arquitectura sigue el paradigma clásico de captioning: la imagen se procesa con un ResNet50 preentrenado en ImageNet y congelado, del que se extrae un vector de características de 2048 dimensiones. Este vector se proyecta mediante una capa lineal a 256 dimensiones y se introduce como primer paso temporal en un LSTM de una sola capa con 512 unidades ocultas. El LSTM genera la secuencia de palabras de forma autorregresiva, y durante la inferencia se recomienda usar búsqueda de haz (beam search) con ancho 3 para mejorar la coherencia.

El entrenamiento se realizó sobre Flickr8k, con una división 80/10/10 por imagen (no por subtítulo) para evitar fuga de datos. El checkpoint regularizado añade dropout en la salida del LSTM, weight decay y gradient clipping, lo que reduce el sobreajuste y mejora las métricas. No se emplearon técnicas de RLHF ni DPO; es un entrenamiento supervisado estándar con pérdida de entropía cruzada. El vocabulario compartido por ambos checkpoints contiene 2.662 tokens.

## Capacidades

- Generación de subtítulos en inglés para imágenes, describiendo objetos, personas, acciones y escenas.
- Inferencia con búsqueda de haz (beam search) configurable, que mejora la fluidez y precisión de las descripciones.
- Procesamiento de imágenes de tamaño arbitrario (preprocesadas según el pipeline del repositorio).
- No soporta tool calling, ni razonamiento multi-paso, ni interacción conversacional.
- No es multilingüe: solo genera texto en inglés.
- No incluye capacidades de visión más allá de la extracción de características del ResNet50; no realiza detección de objetos ni segmentación.

## Casos de uso

- Accesibilidad para personas con discapacidad visual: el modelo puede integrarse en aplicaciones que describan imágenes capturadas con la cámara del móvil, ayudando a los usuarios a entender su entorno.
- Generación de texto alternativo (alt text) para sitios web: automatizar la descripción de imágenes en blogs o tiendas online, mejorando el SEO y la accesibilidad.
- Organización y etiquetado de bibliotecas de imágenes: asignar subtítulos automáticos a colecciones de fotos para facilitar la búsqueda y clasificación.
- Asistencia en redes sociales: generar descripciones automáticas para publicaciones, ahorrando tiempo a los creadores de contenido.
- Entorno educativo: servir como ejemplo práctico de arquitectura encoder-decoder en cursos de deep learning y visión por computador.
- Investigación base: punto de partida para experimentos con técnicas de regularización, búsqueda de haz o atención visual, dado su código abierto y su tamaño reducido.

## Benchmarks y rendimiento

Los resultados se evaluaron sobre el conjunto de test de Flickr8k (810 imágenes). La siguiente tabla recoge las métricas reportadas en la model card:

| Metrica | Baseline + greedy | Baseline + beam-3 | Regularizado + greedy | Regularizado + beam-3 |
|---|---|---|---|---|
| BLEU-1 | 0,5127 | 0,5240 | 0,5444 | **0,5517** |
| BLEU-4 | 0,1221 | 0,1364 | 0,1435 | **0,1557** |
| ROUGE-L | 0,4177 | 0,4265 | 0,4434 | **0,4527** |
| METEOR | 0,3266 | 0,3267 | 0,3480 | **0,3528** |

El checkpoint regularizado con beam search (ancho 3) ofrece los mejores resultados en todas las métricas. No se han publicado comparaciones con otros modelos de captioning en la información disponible.

## Requisitos de hardware

- El modelo es ligero: ResNet50 congelado (sin gradientes) y un LSTM de 512 unidades. Puede ejecutarse en CPU para inferencia, aunque con mayor latencia.
- VRAM estimada: no disponible, pero al ser un modelo pequeño (menos de 100 MB de pesos) cabría en cualquier GPU con al menos 2 GB de VRAM, incluidas tarjetas de consumo como GTX 1050 Ti o superiores.
- GPU recomendada: cualquier GPU moderna (RTX 2060 o superior) para inferencia en tiempo real; en CPU se puede usar para procesamiento por lotes.
- Opciones de despliegue: no es compatible con vLLM, Ollama ni TGI. Requiere el código de inferencia del repositorio GitHub (`src/inference/predict.py`), que carga los state_dicts y ejecuta el pipeline.
- Latencia y throughput: no se han publicado mediciones oficiales. En una GPU media, se espera una latencia de decenas de milisegundos por imagen; en CPU, de cientos de milisegundos a segundos.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de captioning en la información proporcionada. Como referencia cualitativa, este modelo es comparable a arquitecturas clásicas como Show and Tell (Vinyals et al., 2015) o NIC, que también usan CNN + LSTM. Modelos modernos como BLIP, GIT o LLaVA superan ampliamente estas métricas, pero requieren más recursos y tienen licencias distintas. No se incluye una tabla comparativa por falta de datos objetivos.

## Limitaciones y advertencias

- Entrenado exclusivamente en Flickr8k, un conjunto pequeño (8.091 imágenes) con dominio limitado: predominan personas, perros y escenas al aire libre. El modelo falla con contenido fuera de este dominio.
- A pesar de la regularización, el modelo muestra cierto sobreajuste pasado el mejor epoch, lo que puede afectar a la generalización.
- Las capturas generadas pueden ser fluidas pero no siempre están completamente ancladas a detalles específicos de la imagen (p. ej., colores, posiciones o atributos finos).
- Solo genera texto en inglés; no hay soporte para otros idiomas.
- Los pesos no son compatibles con la librería `transformers`; requieren el código de inferencia del repositorio GitHub, lo que limita su integración en pipelines estándar.
- Licencia MIT permite uso comercial, pero el modelo no está optimizado para producción y puede requerir ajuste fino con datos del dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdhamAshraf/image-caption-generator
- Repositorio GitHub (código, entrenamiento y documentación): https://github.com/adhamashraf7788/Image-Caption-Generator
- Demo interactiva (Hugging Face Space): https://huggingface.co/spaces/AdhamAshraf/image_caption_generator
- Dataset Flickr8k (Kaggle): https://www.kaggle.com/datasets/adityajn105/flickr8k
