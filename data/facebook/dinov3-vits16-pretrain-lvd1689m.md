# facebook/dinov3-vits16-pretrain-lvd1689m

## Resumen

El modelo `facebook/dinov3-vits16-pretrain-lvd1689m` es un Vision Transformer (ViT) de tamaño pequeño con parches de 16x16 píxeles, desarrollado por Meta AI (Facebook) para extracción de características de imagen. Forma parte de la familia DINOv3, presentada en el artículo arXiv:2508.10104. Este modelo es una variante pequeña derivada del modelo base `facebook/dinov3-vit7b16-pretrain-lvd1689m`, con un total de 21.596.544 parámetros. Su pipeline principal es `image-feature-extraction`, lo que significa que produce representaciones vectoriales de imágenes para tareas de visión por computador. El acceso al modelo está restringido en HuggingFace y requiere aceptar condiciones de uso antes de poder descargarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-S/16) |
| Parámetros totales | 21.596.544 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no aplica) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | dinov3-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Vision Transformer (ViT) con parches de 16x16 píxeles. El nombre "vits16" indica que se trata de la variante "small" (ViT-S) con tamaño de parche 16. Según los metadatos, es un modelo base o finetune del modelo `facebook/dinov3-vit7b16-pretrain-lvd1689m`, que es un modelo de mayor tamaño. El preentrenamiento sigue el enfoque DINOv3, una técnica de aprendizaje autosupervisado para características visuales. La implementación de referencia está disponible en el repositorio oficial de Meta AI (`facebookresearch/dinov3`). No se han proporcionado detalles sobre el dataset de entrenamiento ni sobre procesos de alineación como RLHF o DPO, que no aplican a modelos de visión.

## Capacidades

- Extracción de características de imagen (`image-feature-extraction`): genera embeddings de imágenes para tareas downstream.
- Segmentación de primer plano (`foreground segmentation`): según el repositorio oficial, se puede entrenar un modelo lineal de segmentación basado en las características DINOv3.
- Matching denso y disperso (`dense and sparse matching`): permite emparejar parches de objetos entre dos imágenes basándose en las características DINOv3.
- No soporta generación de texto, tool calling ni razonamiento de lenguaje, al ser exclusivamente un modelo de visión.
- No dispone de capacidades multimodales de audio o vídeo en la información disponible.

## Casos de uso

- Búsqueda de imágenes por similitud: se pueden extraer embeddings de imágenes y compararlos mediante distancia coseno para implementar sistemas de recuperación visual en catálogos de productos o bancos de imágenes. El tamaño reducido (21,6 millones de parámetros) permite procesar grandes volúmenes con coste computacional bajo.
- Clasificación de imágenes con fine-tuning: las características preentrenadas sirven como punto de partida para entrenar un clasificador lineal o un MLP en datasets específicos. Al ser un modelo pequeño, el fine-tuning es rápido y viable en GPUs de consumo.
- Segmentación de primer plano: mediante el entrenamiento de una cabeza lineal sobre las características DINOv3, se puede separar el objeto principal del fondo en imágenes, útil en edición de fotografía o en sistemas de videovigilancia.
- Matching de parches entre imágenes: la capacidad de matching denso y disperso permite encontrar correspondencias entre partes de objetos en diferentes imágenes. Esto es útil en aplicaciones de visión estéreo, seguimiento de objetos o reconstrucción 3D.
- Transfer learning para detección de objetos: las características extraídas pueden alimentar detectores como Faster R-CNN o DETR, reduciendo la cantidad de datos anotados necesarios para entrenar en dominios específicos.
- Sistemas de recomendación visual: se pueden generar embeddings de productos o contenido visual para recomendaciones basadas en similitud en plataformas de comercio electrónico o redes sociales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 21.596.544 parámetros en FP32, los pesos ocupan aproximadamente 86 MB. La inferencia puede ejecutarse con menos de 1 GB de VRAM, incluso en CPU.
- GPU recomendadas: cualquier GPU consumer con al menos 1 GB de VRAM (por ejemplo, RTX 2060, GTX 1660) es suficiente. También es viable en CPU para cargas de trabajo ligeras.
- No se requieren GPUs de gama alta como A100 o H100 para este modelo.
- Opciones de despliegue: se puede cargar directamente con la librería Transformers de HuggingFace utilizando el formato safetensors. Es compatible con los endpoints de HuggingFace (`endpoints_compatible`). No aplican vLLM, llama.cpp ni TGI, al ser un modelo de visión.
- Latencia y throughput estimados: no se disponen de datos oficiales. Dado el tamaño, se espera una latencia muy baja en GPU y aceptable en CPU para imágenes individuales.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos en la información proporcionada. El modelo base `facebook/dinov3-vit7b16-pretrain-lvd1689m` es de mayor tamaño, pero no se han facilitado sus especificaciones.

## Limitaciones y advertencias

- Acceso restringido (gated): el modelo requiere aceptar condiciones de uso en HuggingFace antes de poder descargarlo.
- Licencia "dinov3-license": no es una licencia de código abierto estándar (como Apache 2.0 o MIT). Debe revisarse el texto completo de la licencia para conocer las restricciones de uso comercial y redistribución.
- No es un modelo generativo: no produce texto ni imágenes; solo extrae características. No debe usarse para tareas de generación.
- Sesgos: no se han documentado sesgos específicos en la información disponible, pero al ser un modelo preentrenado en datos de visión, puede heredar sesgos de los datos de entrenamiento.
- Riesgo de alucinación: no aplica, ya que el modelo no genera contenido.
- Limitaciones de idioma: aunque el tag indica "en", el modelo no procesa texto; el idioma solo es relevante para la documentación y los metadatos.

## Enlaces

- HuggingFace: https://huggingface.co/facebook/dinov3-vits16-pretrain-lvd1689m
- GitHub (implementación de referencia): https://github.com/facebookresearch/dinov3
- Paper (arXiv): https://arxiv.org/abs/2508.10104
