# Anas1010/flickr8k-image-caption-generator-attn

## Resumen

El modelo `Anas1010/flickr8k-image-caption-generator-attn` es un sistema de generación automática de subtítulos para imágenes, desarrollado por el usuario Anas1010 y publicado en Hugging Face bajo licencia MIT. Está entrenado sobre el conjunto de datos Flickr8k, compuesto por 8.000 imágenes con cinco descripciones en inglés cada una. El modelo combina un codificador basado en ResNet50 (que extrae mapas de características espaciales de 2048×7×7) con un mecanismo de atención aditiva de Bahdanau sobre 49 posiciones espaciales y un decodificador LSTM de una celda. El vocabulario se limita a las palabras que aparecen al menos dos veces en el conjunto de entrenamiento, con una longitud máxima de secuencia de 20 tokens.

Aunque se trata de un modelo académico y de pequeño tamaño en comparación con los grandes modelos de lenguaje, es relevante como ejemplo didáctico de arquitectura encoder-decoder con atención para tareas de visión y lenguaje. Su publicación en 2026 (según la fecha de creación) lo sitúa en un contexto donde la mayoría de soluciones comerciales usan modelos multimodales de gran escala, pero este enfoque ligero sigue siendo útil para prototipos, investigación y entornos con recursos limitados. No se proporcionan pesos preentrenados en el repositorio (el tamaño del repo es 0.0 GB), lo que limita su uso directo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet50 (encoder) + Bahdanau attention + LSTM (decoder) |
| Parametros totales | no disponible (los pesos no están publicados) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 20 tokens (máximo de subtítulo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (implícito por el dataset Flickr8k) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma clásico de *image captioning*: un codificador ResNet50 preentrenado (posiblemente congelado) extrae un mapa de características de 2048×7×7, que se proyecta a una dimensión de 512. Sobre esas 49 ubicaciones espaciales, un mecanismo de atención aditiva de Bahdanau calcula pesos de relevancia en cada paso de decodificación. El decodificador es una celda LSTM que genera la secuencia de palabras de forma autorregresiva mediante decodificación greedy (sin búsqueda de haz). El vocabulario se construye solo con el conjunto de entrenamiento, filtrando palabras con frecuencia menor a 2 y limitando la longitud a 20 tokens.

No se especifican detalles sobre el número de épocas, tamaño de lote, optimizador o función de pérdida en la información disponible. Tampoco se menciona el uso de técnicas como *teacher forcing* o *beam search* durante el entrenamiento, aunque la decodificación greedy en inferencia sugiere que el entrenamiento pudo usar *teacher forcing* estándar. La ausencia de pesos publicados impide reproducir los resultados sin reentrenar el modelo desde cero.

## Capacidades

- Generación de subtítulos descriptivos para imágenes de dominio general (entrenado en Flickr8k).
- Atención visual espacial: el mecanismo de Bahdanau permite al modelo "fijarse" en regiones relevantes de la imagen al generar cada palabra.
- Procesamiento de imágenes de tamaño variable (ResNet50 adapta la entrada a 224×224 típicamente).
- Soporte de vocabulario restringido a las palabras más frecuentes del dataset (min_freq=2).
- Decodificación greedy: genera una secuencia de hasta 20 tokens sin búsqueda de haz.

## Casos de uso

- Prototipado de sistemas de descripción automática de imágenes: sirve como base académica para entender arquitecturas encoder-decoder con atención, ya que su implementación es sencilla y los componentes (ResNet50, LSTM, atención) son bien conocidos.
- Evaluación de métricas clásicas de generación de texto: permite comparar BLEU, ROUGE-L y METEOR en un pipeline reproducible sobre Flickr8k.
- Enseñanza de visión por computador y PLN: el modelo puede utilizarse en cursos o tutoriales para ilustrar cómo integrar un CNN con un RNN y atención.
- Investigación en atención visual: al ser un modelo pequeño, es fácil inspeccionar los mapas de atención generados y estudiar su comportamiento.
- Base para *fine-tuning* en dominios específicos: aunque no se publican pesos, la arquitectura puede reentrenarse con otros datasets de subtítulos (p. ej., Flickr30k, MS COCO) para adaptarla a dominios concretos.
- Desarrollo de aplicaciones de accesibilidad: un sistema de subtitulado automático ligero podría integrarse en herramientas para personas con discapacidad visual, siempre que se entrene con datos adecuados y se despliegue en hardware modesto.

## Benchmarks y rendimiento

El autor reporta las siguientes métricas en el conjunto de prueba de Flickr8k:

| Métrica | Valor |
|---|---|
| BLEU-1 | 0.5895 |
| BLEU-2 | 0.4030 |
| BLEU-3 | 0.2651 |
| BLEU-4 | 0.1820 |
| ROUGE-L (F1) | 0.4597 |
| METEOR | 0.4033 |

Estos valores son típicos para modelos de captioning entrenados en Flickr8k, un dataset pequeño. No se proporcionan comparaciones con otros modelos ni intervalos de confianza. No hay información sobre latencia o throughput.

## Requisitos de hardware

- El modelo es ligero: el encoder ResNet50 tiene unos 25 millones de parámetros, pero si está congelado, solo se necesitan los pesos del LSTM y la atención (muy pocos parámetros). El tamaño total del modelo no se ha publicado, pero el repositorio ocupa 0.0 GB, lo que sugiere que los pesos no están disponibles.
- Para inferencia en CPU: es viable, ya que una sola imagen requiere una pasada por ResNet50 (unos 4 GFLOPs) y el LSTM es secuencial pero corto (máx. 20 pasos). Se puede ejecutar en una CPU moderna sin problemas.
- Para entrenamiento: se recomienda una GPU con al menos 8 GB de VRAM (p. ej., RTX 2070, RTX 3060) para manejar el lote y el backpropagation. Sin embargo, al no haber pesos publicados, el usuario deberá entrenar desde cero.
- Opciones de despliegue: al ser un modelo PyTorch, puede servirse con TorchServe, FastAPI o integrarse en pipelines de ONNX Runtime. No se mencionan formatos como GGUF o TFLite.
- Latencia: no disponible; depende del hardware y de la optimización del preprocesado de imagen.

## Comparativa con modelos similares

No se dispone de datos comparativos del propio modelo frente a alternativas. Existen otros generadores de subtítulos basados en Flickr8k, como el de `bipin/image-caption-generator` (también en Hugging Face) que usa un enfoque similar con VGG16 o ResNet, pero no se han encontrado métricas públicas comparables. En el ecosistema general, los modelos modernos de captioning (p. ej., BLIP, GIT, OFA) superan ampliamente estas métricas, pero requieren muchos más recursos y datos. Dado que no hay información suficiente, se omite una tabla comparativa.

## Limitaciones y advertencias

- No se publican los pesos del modelo: el repositorio tiene un tamaño de 0.0 GB, lo que impide su uso directo en producción o evaluación sin reentrenamiento.
- Vocabulario restringido: al filtrar palabras con frecuencia menor a 2, el modelo no puede generar términos poco comunes o específicos de dominios.
- Decodificación greedy: sin búsqueda de haz, la calidad de las secuencias generadas puede ser subóptima en comparación con métodos de búsqueda más exhaustivos.
- Dataset pequeño: Flickr8k tiene solo 8.000 imágenes, lo que limita la generalización a imágenes fuera de su distribución.
- Sesgos de datos: las descripciones de Flickr8k están en inglés y reflejan los sesgos culturales y de contenido de las imágenes de Flickr (mayoría de escenas cotidianas, personas y objetos comunes).
- Riesgo de alucinación: al ser un modelo generativo, puede producir descripciones que no corresponden exactamente al contenido visual, especialmente en imágenes atípicas.
- Licencia MIT: permite uso comercial y modificación, pero al no haber pesos, el usuario debe entrenar su propio modelo con los datos, lo que implica cumplir con la licencia del dataset Flickr8k (que tiene restricciones de uso académico).
- Sin soporte para otros idiomas ni capacidades multimodales más allá de imagen-texto.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Anas1010/flickr8k-image-caption-generator-attn)
- [Repositorio de referencia similar (VGG16+LSTM)](https://github.com/david-malviya/Image-Caption-Generator)
- [Proyecto similar con atención (GitHub)](https://github.com/NiyatiP10/Image-Caption-Generator-using-Deep-Learning-on-Flickr8K-dataset/blob/main/README.md)

No se han encontrado papers, blogs o demos oficiales del autor.
