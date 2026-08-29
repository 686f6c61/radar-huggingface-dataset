# aaronwzl/clip-vit-base-patch32-coco-retrieval

## Resumen

El modelo `aaronwzl/clip-vit-base-patch32-coco-retrieval` es un checkpoint de CLIP ViT-B/32 (desarrollado por OpenAI) fine-tuneado sobre el conjunto de datos MSCOCO para la tarea de recuperación imagen-texto (image-text retrieval). Ha sido producido por el autor aaronwzl como parte de la revisión del artículo **MultiSHAP** (arXiv:2508.00576), con el objetivo de permitir una comparación *same-architecture* entre el modelo zero-shot y el fine-tuneado bajo un mismo estimador de interacciones. El checkpoint es propio del autor y no corresponde a los experimentos publicados en el paper, que usaban modelos ViLT.

El modelo mantiene la arquitectura CLIP original (Vision Transformer con patch de 32 píxeles y un codificador de texto transformer) y continúa el entrenamiento contrastivo con el objetivo InfoNCE simétrico sobre pares (imagen, caption) a baja tasa de aprendizaje. Con 151 millones de parámetros y licencia MIT, es un modelo ligero y accesible para tareas de búsqueda multimodal, aunque su entrenamiento se ha realizado con un conjunto reducido de 4000 pares y solo 2 épocas, por lo que su rendimiento está pensado para experimentos de investigación controlados, no para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-B/32 (Vision Transformer + Transformer de texto) |
| Parametros totales | 151.277.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (típico de CLIP: 77 tokens de texto, pero no especificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base de OpenAI está entrenado principalmente con datos en inglés, pero no se especifica) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura CLIP original de OpenAI: un codificador de imágenes ViT-B/32 (Vision Transformer con parches de 32x32 píxeles) y un codificador de texto transformer, ambos proyectados a un espacio de embeddings compartido mediante aprendizaje contrastivo. El fine-tuning continúa el objetivo de preentrenamiento original (InfoNCE simétrico con temperatura aprendida) sobre pares (imagen, caption) del dataset `sayakpaul/coco-30-val-2014`, utilizando 4000 pares de entrenamiento, 2 épocas, batch size 64, optimizador AdamW con learning rate 1e-05 y weight decay 0.1. Se aplicó un warmup lineal del 10% y decaimiento lineal a cero, con gradiente clipping a norma global 1.0. El entrenamiento se ejecutó en GPU (CUDA) y duró 345 segundos, con una pérdida que descendió de 0.4031 a 0.0519.

Una característica destacable es el control de fuga de datos en la evaluación: el script de entrenamiento excluye explícitamente los índices de evaluación del conjunto de entrenamiento y verifica en tiempo de ejecución que no haya solapamiento (se verificó 0 solapamiento entre 500 índices de evaluación y 4000 de entrenamiento). Esta transparencia metodológica es relevante para la reproducibilidad de experimentos de interpretabilidad.

## Capacidades

- Recuperación imagen-texto: dado un texto, encuentra la imagen más relevante y viceversa, mediante similitud coseno en el espacio compartido.
- Clasificación de imágenes zero-shot: al ser un modelo CLIP, puede clasificar imágenes sin entrenamiento específico, usando etiquetas textuales como prompts.
- Embeddings multimodales: genera representaciones vectoriales de imágenes y texto en el mismo espacio, útiles para búsqueda semántica y comparación.
- Fine-tuning específico para retrieval: el ajuste con MSCOCO mejora el margen entre pares correctos (ground-truth) y pares incorrectos (foil), principalmente reduciendo la similitud de los foils.
- No soporta tool calling ni razonamiento multi-paso: es un modelo de embeddings, no un LLM generativo.
- Capacidades multilingües: no especificadas; el modelo base de CLIP está entrenado principalmente con datos en inglés, aunque puede generalizar a otros idiomas de forma limitada.

## Casos de uso

- Investigación en interpretabilidad de modelos multimodales: el checkpoint está diseñado para comparar explicaciones basadas en Shapley (MultiSHAP) entre un modelo zero-shot y su versión fine-tuneada con la misma arquitectura. Es adecuado para estudiar cómo el fine-tuning afecta a las interacciones cross-modales.
- Búsqueda semántica de imágenes en colecciones pequeñas: dado un texto descriptivo, se puede recuperar la imagen más relevante de un dataset acotado (por ejemplo, un catálogo de productos) usando la similitud coseno de los embeddings.
- Clasificación zero-shot de imágenes en dominios específicos: se puede usar directamente para clasificar imágenes sin entrenamiento adicional, definiendo etiquetas textuales como prompts (por ejemplo, clasificar fotos de animales o escenas).
- Generación de embeddings para sistemas de recomendación visual: los vectores de imagen y texto pueden indexarse en bases vectoriales para recomendaciones basadas en contenido.
- Evaluación de robustness en retrieval: al ser un modelo pequeño y rápido de ejecutar, es útil para probar pipelines de evaluación de retrieval en entornos de investigación con recursos limitados.
- Reproducción de experimentos del paper MultiSHAP: sirve como checkpoint de referencia para replicar los análisis de interacción cross-modal descritos en el artículo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) para este modelo, ya que no es un LLM generativo sino un modelo de embeddings. La model card proporciona una métrica de evaluación específica para retrieval: la similitud coseno media entre pares ground-truth (GT) y pares foil (incorrectos) sobre una muestra de evaluación retenida.

| Métrica | Zero-shot | Fine-tuned | Cambio de margen |
|---|---|---|---|
| Similitud coseno GT | 0.3245 | 0.3165 | -0.008 |
| Similitud coseno foil | 0.1490 | 0.0976 | -0.0514 |
| Margen (GT - foil) | 0.1755 | 0.2189 | +0.0434 |

El fine-tuning amplía el margen entre pares correctos e incorrectos principalmente reduciendo la similitud de los foils, lo que indica una mejora en la discriminación.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 151M parámetros, en FP16 ocupa aproximadamente 300 MB de memoria. Con el procesador y el batch típico, cabe en GPUs con 2 GB o más de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, etc.). Para entrenamiento, se usó una GPU CUDA (no especificada), pero el entrenamiento fue muy corto (345 s) y no requiere hardware de gama alta.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs consumer como RTX 3060, RTX 4060, etc., incluso en modos de cuantización (aunque no se especifican cuantizaciones disponibles).
- Opciones de despliegue: se puede usar con la librería `transformers` de Hugging Face (carga directa con `CLIPModel.from_pretrained`), o exportar a ONNX/TensorRT para inferencia optimizada. También es compatible con frameworks de embeddings como FAISS o Milvus para búsqueda vectorial.
- Latencia y throughput: no se proporcionan datos oficiales. En una GPU consumer, la inferencia de un solo par imagen-texto suele estar en el rango de milisegundos (típico de CLIP ViT-B/32).

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|---|
| `aaronwzl/clip-vit-base-patch32-coco-retrieval` | CLIP ViT-B/32 | 151M | no disponible | MIT | Retrieval imagen-texto fine-tuneado en COCO |
| `openai/clip-vit-base-patch32` | CLIP ViT-B/32 | 151M | 77 tokens (texto) | MIT (originalmente) | Zero-shot classification y retrieval general |
| `dandelin/vilt-b32-finetuned-coco` | ViLT (Vision-and-Language Transformer) | ~112M | 40 tokens | MIT | Image-text matching (ITM) fine-tuneado en COCO |

El modelo fine-tuneado se diferencia del base en que ha sido ajustado específicamente para retrieval en COCO, mejorando el margen de discriminación. Frente a ViLT, que usa una arquitectura diferente (sin codificador de texto separado, sino fusión temprana), este modelo mantiene la arquitectura CLIP, lo que permite comparaciones *same-architecture* en estudios de interpretabilidad.

## Limitaciones y advertencias

- Entrenamiento con datos muy limitados: solo 4000 pares y 2 épocas, lo que puede provocar overfitting al dominio de COCO y bajo rendimiento en otros dominios.
- No es un modelo generativo: no genera texto ni imágenes; solo produce embeddings y similitudes.
- Sesgos del modelo base: CLIP de OpenAI puede presentar sesgos de género, raza y cultura en sus representaciones, heredados de los datos de entrenamiento originales.
- Riesgo de alucinación: no aplica, al no ser generativo, pero la recuperación puede devolver resultados irrelevantes si el texto es ambiguo o fuera de dominio.
- Limitaciones de idioma: no se especifican idiomas soportados; el modelo base está entrenado principalmente con inglés, por lo que su rendimiento en otros idiomas puede ser inferior.
- Uso comercial: la licencia MIT permite uso comercial, pero el modelo se ofrece sin garantías y su rendimiento en producción no está validado.
- No reproducir los experimentos publicados del paper: la model card advierte explícitamente que este checkpoint no corresponde a los resultados de retrieval publicados en MultiSHAP, que usaban ViLT. Usarlo para reproducir esos resultados sería incorrecto.

## Enlaces

- [HuggingFace - aaronwzl/clip-vit-base-patch32-coco-retrieval](https://huggingface.co/aaronwzl/clip-vit-base-patch32-coco-retrieval)
- [Paper MultiSHAP (arXiv:2508.00576)](https://arxiv.org/abs/2508.00576)
- [Modelo base openai/clip-vit-base-patch32](https://huggingface.co/openai/clip-vit-base-patch32)
