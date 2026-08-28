# lazyyawn07/flickr8k-image-captioning

## Resumen

El modelo `lazyyawn07/flickr8k-image-captioning` es un sistema de generación de descripciones de imágenes (image captioning) basado en una arquitectura encoder-decoder clásica: un codificador CNN (ResNet50 preentrenado en ImageNet y congelado) que extrae un vector global de características de la imagen, seguido de un decodificador LSTM de una sola capa que genera la frase token a token. El autor, `lazyyawn07`, lo entrenó desde cero (solo el decodificador) sobre el dataset Flickr8k, un conjunto de referencia para tareas multimodales de visión y lenguaje.

Este modelo resuelve el problema de traducir el contenido visual de una imagen a una descripción textual en lenguaje natural. Su relevancia radica en ser una implementación didáctica y ligera de un pipeline completo de captioning, sin mecanismos de atención, lo que lo hace fácil de entender y reproducir. El checkpoint incluye el estado del modelo, la configuración y el vocabulario, pero no el backbone ResNet50, que se reconstruye desde `torchvision`. El tamaño del repositorio es de 0.1 GB y la licencia es MIT, lo que permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet50 (encoder congelado) + LSTM de 1 capa (decoder) |
| Parametros totales | no disponible (el checkpoint no incluye el backbone; el decoder depende de `embed_size` y `hidden_size` no publicados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (genera frases cortas, típicamente < 20 tokens, pero no se especifica) |
| Tipos de cuantizacion | no disponible (solo pesos en float32 de PyTorch) |
| Idiomas soportados | no disponible (el dataset Flickr8k es en inglés, pero no se declara oficialmente) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (`.pth`) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema clásico de codificador-decodificador sin atención. El encoder es un ResNet50 preentrenado en ImageNet, congelado, que produce un vector de características de 2048 dimensiones. Este vector se proyecta linealmente a un espacio de `embed_size` y se introduce como el "timestep cero" de la secuencia de entrada al LSTM. El decodificador es un LSTM de una sola capa que genera la frase palabra a palabra, condicionado únicamente por ese vector global de la imagen (no hay mapa espacial de características). Durante la inferencia se utiliza búsqueda de haz (beam search) con ancho 3.

El entrenamiento se realizó sobre el dataset Flickr8k, con una división a nivel de imagen (80/10/10, semilla 42) para evitar fugas de captions entre splits. Las características de imagen se pre-extrajeron y cachearon para acelerar el entrenamiento. Se usó el optimizador Adam con tasa de aprendizaje 3e-4, recorte de gradiente a norma 1.0, programación de tasa de aprendizaje con `ReduceLROnPlateau` y early stopping. El modelo se entrenó durante 35 épocas, deteniéndose manualmente cuando la mejora de la pérdida de validación se aplanó y la brecha train-val se amplió. No se aplicaron técnicas de RLHF ni DPO; es un entrenamiento supervisado estándar con pérdida de entropía cruzada.

## Capacidades

- Generación de descripciones de imágenes en inglés (implícito por el dataset, aunque no declarado oficialmente).
- Captioning de imágenes de escenas cotidianas (personas, animales, objetos, actividades) típicas del dataset Flickr8k.
- Inferencia con búsqueda de haz (beam search) configurable (ancho por defecto 3).
- Extracción de características visuales mediante ResNet50 preentrenado (congelado).
- Soporte para reconstrucción del modelo a partir del checkpoint, incluyendo vocabulario y configuración.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de imagen a texto.
- No tiene modo de pensamiento (thinking mode) ni soporte de audio o vídeo.

## Casos de uso

- **Accesibilidad para personas con discapacidad visual**: el modelo puede generar descripciones automáticas de imágenes en páginas web o aplicaciones, ayudando a lectores de pantalla a transmitir el contenido visual. Su ligereza permite ejecutarlo en dispositivos con recursos limitados.
- **Indexación y búsqueda de imágenes**: al generar captions automáticos, se pueden etiquetar imágenes en bases de datos para facilitar búsquedas por texto. Por ejemplo, en un repositorio de fotos de stock, cada imagen se indexa con su descripción generada.
- **Educación y aprendizaje de visión por computador**: al ser un modelo simple y bien documentado, sirve como ejemplo didáctico para estudiantes que quieran entender el flujo completo de un sistema de captioning, desde la extracción de features hasta la generación de texto.
- **Prototipado rápido de aplicaciones multimodales**: desarrolladores pueden integrar este modelo en un pipeline de demostración (por ejemplo, con FastAPI o Gradio) para validar conceptos antes de migrar a modelos más complejos con atención o transformers.
- **Generación de metadatos para gestión de contenidos**: en plataformas de gestión de activos digitales (DAM), se pueden generar descripciones automáticas de imágenes subidas por usuarios, mejorando la organización y el filtrado.
- **Análisis de redes sociales**: para monitorizar imágenes publicadas en redes y generar resúmenes textuales automáticos, por ejemplo, en campañas de marketing o estudios de opinión pública.

## Benchmarks y rendimiento

El autor evaluó el modelo en el split de test (809 imágenes, nunca vistas durante el entrenamiento ni la selección de checkpoint), generando una sola caption por imagen con beam search y comparándola con las 5 referencias humanas. Los resultados son los siguientes:

| Metrica | Puntuacion |
|---|---|
| BLEU-1 | 0.596 |
| BLEU-2 | 0.396 |
| BLEU-3 | 0.268 |
| BLEU-4 | 0.183 |
| ROUGE-1 | 0.463 |
| ROUGE-2 | 0.227 |
| ROUGE-L | 0.432 |

Estos valores están en el rango esperado para un captioner CNN→LSTM sin atención sobre Flickr8k. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: menos de 2 GB, ya que el modelo es pequeño (ResNet50 congelado + LSTM de 1 capa). Con un batch de 1, la extracción de features con ResNet50 requiere aproximadamente 1-1.5 GB en FP32.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, GTX 1650, RTX 2060 o superiores. También puede ejecutarse en CPU para inferencia, aunque más lento.
- **Compatibilidad con GPUs de consumo**: sí, cabe en todas las GPUs de consumo actuales, incluidas las integradas de gama baja.
- **Opciones de despliegue**: al ser un modelo de PyTorch, se puede servir con FastAPI, Gradio o TorchServe. No se proporcionan archivos GGUF ni soporte para vLLM u Ollama directamente, pero se podría convertir a ONNX para optimización.
- **Latencia y throughput estimados**: no disponibles. En una GPU moderna (por ejemplo, RTX 3060), la inferencia de una imagen debería tomar menos de 100 ms, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de captioning en la documentación proporcionada. Modelos como BLIP, ViT-GPT2 o Transformer-based captioners suelen superar a esta arquitectura sin atención, pero no se han publicado comparaciones directas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Sin mecanismo de atención**: el modelo condiciona la generación únicamente sobre un vector global de la imagen, lo que limita su capacidad para enfocarse en regiones específicas. Esto se refleja en métricas BLEU-4 bajas (0.183).
- **Alcance limitado del dataset**: Flickr8k contiene solo 8.000 imágenes de escenas cotidianas, por lo que el modelo no generaliza bien a dominios especializados (médico, industrial, etc.).
- **Idioma no declarado**: aunque el dataset es en inglés, no se especifica oficialmente el soporte de idiomas. No se recomienda usarlo para otros idiomas.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir descripciones que no corresponden fielmente al contenido de la imagen, especialmente en escenas complejas o poco representadas.
- **Sesgos del dataset**: las imágenes de Flickr8k provienen de Flickr y pueden contener sesgos culturales o demográficos. El modelo puede reflejar estos sesgos en sus captions.
- **Restricciones de licencia**: la licencia MIT permite uso comercial y modificación, pero el dataset Flickr8k tiene su propia licencia (no incluida en el repo) que debe verificarse antes de un uso comercial.
- **Dependencia de código externo**: el checkpoint requiere reconstruir las clases `CNNtoRNN` y `Vocabulary` desde el repositorio del proyecto, que no está enlazado explícitamente en la model card. Esto puede dificultar la reproducibilidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/lazyyawn07/flickr8k-image-captioning)
- [Dataset Flickr8k en Kaggle](https://www.kaggle.com/datasets/adityajn105/flickr8k)
- [Repositorio de ejemplo similar (AbdelRahman-Elsayed2/Flickr8k-Image-Captioning)](https://github.com/AbdelRahman-Elsayed2/Flickr8k-Image-Captioning)
- [Notebook de Keras sobre image captioning con transformers](https://colab.research.google.com/github/keras-team/keras-io/blob/master/examples/vision/ipynb/image_captioning.ipynb)
