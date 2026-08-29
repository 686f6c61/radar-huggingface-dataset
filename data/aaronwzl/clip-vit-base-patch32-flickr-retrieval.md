# aaronwzl/clip-vit-base-patch32-flickr-retrieval

## Resumen

El modelo `aaronwzl/clip-vit-base-patch32-flickr-retrieval` es un checkpoint de CLIP ViT-B/32 (Vision Transformer con parches de 32 píxeles y un transformador de texto) ajustado sobre el conjunto de datos Flickr30K para la tarea de recuperación imagen-texto. Ha sido desarrollado por aaronwzl como parte de la revisión del artículo MultiSHAP (arXiv:2508.00576), con el objetivo de permitir una comparación de misma arquitectura entre el modelo zero-shot original y una versión fine-tuned bajo un único estimador de interacción. El checkpoint es propio y no corresponde a los experimentos publicados en el artículo, que utilizaban modelos ViLT.

El modelo parte de `openai/clip-vit-base-patch32` y se entrena con el objetivo InfoNCE simétrico (la misma función de pérdida del preentrenamiento) a una tasa de aprendizaje baja, sobre 4000 pares imagen-caption extraídos del dataset Flickr30K. El resultado es un modelo que mejora el margen entre la similitud coseno de pares correctos (ground-truth) y pares incorrectos (foil) en comparación con la versión zero-shot, principalmente reduciendo la similitud de los pares negativos. Con 151 millones de parámetros y un tamaño de repositorio de 0,6 GB, es un modelo ligero y adecuado para entornos de investigación y prototipado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-B/32 (vision transformer + text transformer) |
| Parametros totales | 151.277.312 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (dataset Flickr30K en ingles, no se especifica) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura CLIP estándar: un codificador de imágenes basado en Vision Transformer (ViT-B/32) y un codificador de texto basado en transformador, cuyos embeddings se proyectan a un espacio común donde se calcula la similitud coseno. El fine-tuning se realiza continuando el objetivo de preentrenamiento (InfoNCE simétrico con temperatura aprendida) sobre pares (imagen, caption) de Flickr30K, con una tasa de aprendizaje baja (1e-05) para no degradar las representaciones aprendidas.

El entrenamiento se llevó a cabo con 4000 pares, 2 épocas, batch size 64, optimizador AdamW con weight decay 0.1, warmup lineal del 10% y decaimiento lineal posterior, y clipping de gradiente con norma global 1.0. La pérdida final pasó de 0.3571 a 0.0993. Se aplicó un control estricto de leakage: los índices de evaluación (500) se mantuvieron disjuntos de los de entrenamiento (4000), verificándose solapamiento cero en tiempo de ejecución. Los índices están disponibles en `finetune_config.json` para su comprobación.

## Capacidades

- Recuperación imagen-texto: dado un texto, encuentra la imagen más similar y viceversa, mediante similitud coseno en el espacio de embeddings compartido.
- Clasificación de imágenes zero-shot: hereda la capacidad de CLIP de clasificar imágenes sin entrenamiento específico, aunque el fine-tuning puede sesgar ligeramente el espacio hacia el dominio de Flickr30K.
- Comparación de similitud entre pares imagen-texto: útil para medir la relevancia o el alineamiento entre una imagen y una descripción.
- Extracción de embeddings multimodales: genera vectores densos para imágenes y textos que pueden usarse en otros sistemas (búsqueda, recomendación, clustering).
- Fine-tuning controlado: al estar entrenado con un dataset pequeño y con control de leakage, sirve como referencia para estudiar el efecto del ajuste fino en retrieval.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso ni soporte multilingüe explícito.

## Casos de uso

- Investigación en explicabilidad de modelos multimodales: el checkpoint se creó específicamente para la revisión de MultiSHAP, permitiendo comparar explicaciones entre un modelo zero-shot y su versión fine-tuned con la misma arquitectura.
- Evaluación de estrategias de fine-tuning: sirve como banco de pruebas para medir cómo el ajuste con pocos datos (4000 pares) afecta al margen de similitud en retrieval, útil para diseñar pipelines de adaptación a dominios específicos.
- Búsqueda de imágenes por texto en dominios académicos: con un dataset como Flickr30K, puede emplearse para recuperar imágenes relevantes a partir de descripciones en entornos de investigación o demostraciones.
- Generación de embeddings para sistemas de recomendación visual: los embeddings de imagen y texto pueden alimentar motores de recomendación que relacionen contenido visual con consultas textuales.
- Análisis de similitud entre imágenes y captions: permite cuantificar la alineación entre una imagen y su descripción, útil en tareas de validación de datos o control de calidad de anotaciones.
- Prototipado de sistemas de retrieval en entornos con recursos limitados: al ser un modelo de 151M parámetros, puede ejecutarse en GPUs consumer y en CPU con cuantización, facilitando pruebas rápidas.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar (MMLU, HumanEval, etc.), pero sí una métrica de evaluación específica para retrieval: la similitud coseno media sobre un conjunto de pares de evaluación, comparando pares ground-truth (GT) frente a pares foil (incorrectos). Los resultados son los siguientes:

| Metrica | Zero-shot | Fine-tuned | Cambio de margen |
|---|---|---|---|
| Similitud coseno media GT | 0.3043 | 0.2949 | -0.0094 |
| Similitud coseno media foil | 0.1785 | 0.1215 | -0.0570 |
| Margen (GT - foil) | 0.1258 | 0.1734 | +0.0477 |

El fine-tuning amplía el margen entre pares correctos e incorrectos principalmente reduciendo la similitud de los pares foil, lo que indica una mejor discriminación en la tarea de retrieval.

## Requisitos de hardware

- No se proporcionan requisitos de hardware específicos en la documentación del modelo.
- Dado el tamaño de 151M parámetros y un repositorio de 0,6 GB, el modelo puede ejecutarse en GPUs consumer como RTX 3060 (12 GB) o superiores, e incluso en CPU con cuantización (aunque no se ofrecen versiones cuantizadas oficiales).
- Para inferencia en producción, se puede desplegar con librerías como Transformers, vLLM (si se adapta a CLIP) o mediante exportación a ONNX/TensorRT.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|---|
| openai/clip-vit-base-patch32 (base) | CLIP ViT-B/32 | 151M | No disponible | MIT | Zero-shot classification y retrieval |
| aaronwzl/clip-vit-base-patch32-flickr-retrieval (este) | CLIP ViT-B/32 | 151M | No disponible | MIT | Retrieval fine-tuned en Flickr30K |
| dandelin/vilt-b32-finetuned-flickr30k | ViLT (vision-language transformer) | No disponible | No disponible | No disponible | Image-text matching (ITM) |

La comparación directa con ViLT no es posible con los datos disponibles, ya que ViLT usa una arquitectura diferente (transformer conjunto sin codificadores separados) y una función de valoración basada en logits ITM, mientras que este modelo usa similitud coseno. El modelo base de OpenAI es la referencia zero-shot; el fine-tuning aquí presentado mejora el margen de retrieval en Flickr30K.

## Limitaciones y advertencias

- Entrenado con un conjunto de datos muy reducido (4000 pares, 2 épocas), lo que limita su generalización a dominios distintos de Flickr30K.
- El checkpoint no reproduce los experimentos publicados en MultiSHAP; fue creado específicamente para una comparación de misma arquitectura en la revisión del artículo.
- El dataset Flickr30K contiene imágenes de la plataforma Flickr, con posibles sesgos culturales y geográficos; el modelo puede heredar esos sesgos en sus representaciones.
- No se han evaluado sesgos de género, raza u otros atributos; se recomienda auditar el modelo antes de usarlo en aplicaciones sensibles.
- Al ser un modelo de retrieval, no genera texto; el riesgo de alucinación no aplica, pero sí puede producir falsos positivos en la recuperación de imágenes.
- La licencia MIT permite uso comercial, pero el modelo base (openai/clip-vit-base-patch32) tiene su propia licencia (MIT según su página, aunque no se verifica en la información proporcionada); se recomienda revisar ambas licencias.
- No se proporcionan versiones cuantizadas ni guías de despliegue específicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aaronwzl/clip-vit-base-patch32-flickr-retrieval
- Modelo base: https://huggingface.co/openai/clip-vit-base-patch32
- Artículo MultiSHAP: arXiv:2508.00576
- Dataset utilizado: ThraggBilly/flickr30k_dataset (disponible en Hugging Face)
