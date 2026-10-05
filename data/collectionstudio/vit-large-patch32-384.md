# CollectionStudio/vit-large-patch32-384

## Resumen

El modelo `CollectionStudio/vit-large-patch32-384` es una re-publicación del Vision Transformer (ViT) de tamaño *large* con parches de 32x32 píxeles y resolución de entrada de 384x384, desarrollado originalmente por Google Research (Dosovitskiy et al., arXiv:2010.11929). Se trata de un encoder transformer tipo BERT aplicado a imágenes: cada imagen se divide en parches de 32x32, se proyecta linealmente y se procesa como una secuencia de tokens junto con un token `[CLS]` usado para clasificación. El repositorio concreto que se analiza aquí pertenece al usuario `CollectionStudio`, no al equipo original, y no incluye resultados de evaluación propios.

El preentrenamiento se realizó sobre ImageNet-21k (14 millones de imágenes, 21.843 clases) a 224x224, y el ajuste fino sobre ImageNet 2012 (1 millón de imágenes, 1.000 clases) a 384x384. Los pesos proceden de la conversión JAX→PyTorch ya realizada en el repositorio `timm` de Ross Wightman, según indica la propia model card. Es un modelo clásico de visión por computador, maduro y ampliamente citado, útil como *baseline* de clasificación y como extractor de características.

Su relevancia actual es la de un elemento de referencia: sigue siendo la arquitectura contra la que se comparan los transformers de visión modernos, y su licencia Apache 2.0 permite uso comercial sin restricciones. No obstante, este repositorio en particular tiene 0 descargas y 0 *likes*, fue creado el 2026-10-05 y ocupa 3,7 GB, por lo que conviene verificar su integridad antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT), encoder transformer tipo BERT con proyección lineal de parches de 32x32 y token `[CLS]` |
| Parámetros totales | Aproximadamente 304 millones (arquitectura ViT-Large; la model card no especifica la cifra) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 145 tokens de entrada: 144 parches (rejilla 12x12 a 384x384 con parche 32x32) más el token `[CLS]` |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo de visión, sin entrada ni salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible; los tags indican soporte para PyTorch, TensorFlow y JAX, y el repositorio ocupa 3,7 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder sin componentes convolucionales en el tronco. Cada imagen de 384x384 se divide en parches de 32x32, que se aplanan y se proyectan linealmente a la dimensión del modelo; a la secuencia resultante se le añade un token `[CLS]` al principio y *embeddings* posicionales absolutos antes de entrar en las capas del encoder. La representación final del token `[CLS]` se utiliza como vector de imagen completa y se pasa por una capa lineal para clasificación. La model card indica que durante el preentrenamiento el modelo aprende una representación interna reutilizable para tareas posteriores, de modo que puede emplearse con una capa lineal adicional sobre el token `[CLS]` (*linear probe*).

En cuanto al entrenamiento, el modelo se preentrenó sobre ImageNet-21k (14 millones de imágenes, 21.843 clases) a 224x224 y se ajustó sobre ImageNet 2012 (1 millón de imágenes, 1.000 clases) a 384x384. El preprocesado redimensiona las imágenes a la resolución correspondiente y normaliza los canales RGB con media (0,5, 0,5, 0,5) y desviación típica (0,5, 0,5, 0,5). El entrenamiento se realizó en TPUv3 (8 núcleos), con tamaño de lote de 4096, *warmup* de la tasa de aprendizaje de 10.000 pasos y recorte de gradiente por norma global 1 para ImageNet. La model card no documenta el uso de RLHF, DPO ni técnicas de alineación, algo esperable al tratarse de un modelo discriminativo.

Una innovación destacable del trabajo original es precisamente la eliminación de la convolución: el ViT demuestra que un transformer puro, entrenado con suficientes datos, iguala o supera a las CNN en clasificación de imágenes y escala mejor con el tamaño del modelo y del dataset. El precio es una mayor demanda de datos de preentrenamiento y una resolución de parche gruesa en esta variante (32x32), que reduce el número de tokens pero también el detalle espacial respecto a las variantes con parche 16x16.

## Capacidades

- Clasificación de imágenes supervisada en 1.000 clases de ImageNet 2012 mediante la cabeza de clasificación incluida.
- Extracción de características: el estado oculto del token `[CLS]` sirve como *embedding* global de imagen para *retrieval*, búsqueda por similitud o *clustering*.
- *Fine-tuning* con *linear probe* o ajuste completo sobre dominios específicos con datasets etiquetados propios.
- *Transfer learning* hacia tareas de visión posteriores (detección, segmentación) mediante adaptadores o cabezas específicas.
- Inferencia por lotes sobre GPU y CPU, con soporte multiplataforma en PyTorch, TensorFlow y JAX según los tags del repositorio.
- No dispone de *tool calling*, agentes, razonamiento multi-paso ni modo de pensamiento: no es un modelo de lenguaje.
- No soporta *prompting* en lenguaje natural, entrada de audio ni generación de texto o imagen.
- Capacidades multilingües no aplicables; la única entrada es una imagen RGB normalizada.

## Casos de uso

- Clasificación de imágenes de propósito general: clasificar una fotografía en una de las 1.000 clases de ImageNet, útil como punto de partida o *baseline* en prototipos de visión.
- Extracción de *embeddings* para búsqueda visual: generar vectores del token `[CLS]` e indexarlos en una base vectorial para recuperación por similitud de imágenes en catálogos o archivos.
- *Fine-tuning* sobre dominios verticales: ajustar el modelo con un conjunto etiquetado propio (imágenes médicas, defectos industriales, especies vegetales) mediante *linear probe* o ajuste completo, aprovechando la representación preentrenada.
- Etiquetado automático de catálogos de comercio electrónico: clasificar productos por categoría a partir de la fotografía antes de que un operador humano valide los casos dudosos.
- Inspección visual en fabricación: detectar piezas defectuosas en una línea de producción mediante una cabeza de clasificación binaria o multiclase entrenada sobre imágenes de la planta.
- Moderación de contenido y filtrado automático: primera pasada de clasificación sobre imágenes subidas por usuarios antes de un análisis más costoso o de la revisión humana.
- Investigación y *benchmarking*: emplear el modelo como referencia reproducible en experimentos sobre arquitecturas de visión, ablaciones de resolución o comparativas de preentrenamiento.
- Componente de *pipelines* de datos: preetiquetar grandes volúmenes de imágenes no etiquetadas para acelerar el etiquetado humano (*active learning*).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este repositorio remite explícitamente a las tablas 2 y 5 del artículo original (arXiv:2010.11929) para los resultados de evaluación en varios *benchmarks* de clasificación de imágenes, y no incluye cifras propias. Tampoco se han facilitado métricas de latencia, *throughput* ni comparativas cuantitativas con otros modelos en la documentación del repositorio.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 1,2 GB en fp32, 0,6 GB en fp16/bf16 y 0,3 GB en int8, partiendo de unos 304 millones de parámetros.
- VRAM total en inferencia: depende del tamaño de lote y la resolución; con lotes pequeños cabe holgadamente en 4-6 GB, y con lotes grandes conviene reservar 8-16 GB.
- GPU recomendadas: para inferencia en producción con alto *throughput*, A100, H100 o RTX 4090; para desarrollo y lotes moderados, RTX 3060, RTX 3090, RTX 4070 o superiores.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con al menos 4-6 GB de VRAM para inferencia; el ajuste completo requiere bastante más memoria (orientativamente 16-24 GB o *gradient checkpointing* y precisión mixta).
- Opciones de despliegue: Hugging Face Transformers (`ViTForImageClassification`), biblioteca `timm`, ONNX Runtime, TensorRT, TorchScript, y exportación a TensorFlow o JAX.
- No aplican vLLM, llama.cpp, Ollama ni TGI: son herramientas orientadas a modelos de lenguaje y este es un clasificador de imágenes.
- Latencia y *throughput* estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros (aprox.) | Resolución / contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CollectionStudio/vit-large-patch32-384 | ViT-L/32 | ~304 M | 384x384; 145 tokens | Apache 2.0 | Hugging Face |
| google/vit-large-patch16-384 | ViT-L/16 | ~304 M | 384x384; 577 tokens | Apache 2.0 | Hugging Face |
| google/vit-base-patch16-384 | ViT-B/16 | ~86 M | 384x384; 577 tokens | Apache 2.0 | Hugging Face |
| google/vit-large-patch32-224 | ViT-L/32 | ~304 M | 224x224; 50 tokens | Apache 2.0 | Hugging Face |

Las cifras de parámetros son aproximadas y proceden de la documentación pública de la familia ViT, no de este repositorio. No se dispone de resultados de *accuracy* comparables para este modelo concreto en la información proporcionada: la model card remite a las tablas del artículo original. La diferencia principal frente a las variantes con parche 16 radica en el número de tokens de entrada (145 frente a 577), lo que reduce el coste computacional por imagen a cambio de un menor detalle espacial, presumiblemente con impacto negativo en la precisión de clasificación fina.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre ImageNet-21k e ImageNet 2012, hereda los sesgos de etiquetado y representación de esos datasets (predominio de ciertas categorías occidentales, desequilibrios demográficos y de contexto).
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en imágenes fuera de distribución; las probabilidades *softmax* deben calibrarse antes de usarlas en decisiones automatizadas.
- Limitaciones de resolución y detalle: los parches de 32x32 ofrecen menos granularidad que las variantes con parche 16, lo que penaliza tareas de clasificación fina.
- Restricción de dominio: el modelo solo predice las 1.000 clases de ImageNet salvo que se le aplique un ajuste fino; no es un clasificador generalista listo para cualquier taxonomía.
- Limitaciones de idioma: no aplica, es un modelo exclusivamente visual sin entrada o salida de texto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; conviene conservar el aviso de licencia y las citas de los papers originales.
- Caveat de procedencia: el repositorio es una re-publicación de un tercero (`CollectionStudio`) con 0 descargas y 0 *likes*, creado el 2026-10-05. No hay garantía de que los pesos coincidan bit a bit con `google/vit-large-patch32-384`; se recomienda verificar los *checksums* o descargar los pesos desde el repositorio oficial de Google o desde `timm`.
- La model card fue redactada por el equipo de Hugging Face, no por los autores originales, y advierte de que la API de `ViTFeatureExtractor` podría cambiar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/CollectionStudio/vit-large-patch32-384
- Repositorio oficial de referencia: https://huggingface.co/google/vit-large-patch32-384
- Paper original (An Image is Worth 16x16 Words, Dosovitskiy et al.): https://arxiv.org/abs/2010.11929
- Paper citado en la model card (Visual Transformers, Wu et al.): https://arxiv.org/abs/2006.03677
- Repositorio original de Google Research: https://github.com/google-research/vision_transformer
- Repositorio `timm` de Ross Wightman: https://github.com/rwightman/pytorch-image-models
- Código de preprocesado del entrenamiento: https://github.com/google-research/vision_transformer/blob/master/vit_jax/input_pipeline.py
- Dataset ImageNet: http://www.image-net.org/
- Desafío ILSVRC 2012: http://www.image-net.org/challenges/LSVRC/2012/
