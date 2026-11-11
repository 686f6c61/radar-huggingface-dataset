# 360ZhiNao/fg-clip-base

## Resumen

FG-CLIP (Fine-Grained CLIP) es un modelo de alineamiento visión-texto desarrollado por 360ZhiNao (grupo 360CV, Qihoo 360) que mejora el alineamiento de grano fino entre imágenes y descripciones textuales respecto a CLIP estándar. La variante `fg-clip-base` publicada en Hugging Face cuenta con 150.136.832 parámetros y un repositorio de 0,6 GB en formato safetensors, con licencia Apache 2.0. El trabajo fue presentado en ICML 2025 y publicado en arXiv (2505.05071).

El modelo aborda una limitación conocida de CLIP: su tendencia a alinear representaciones a nivel global de imagen y frase, perdiendo detalle sobre regiones concretas y atributos específicos (color, posición, relaciones espaciales). FG-CLIP introduce un entrenamiento en dos etapas que incorpora descripciones a nivel de región, incluyendo captions detalladas de regiones y descripciones positivas/negativas, para refinar la alineación.

Es relevante para tareas de clasificación zero-shot de imágenes, recuperación imagen-texto y segmentación guiada por texto donde el detalle local importa. El modelo se distribuye a través de `transformers` con `trust_remote_code=True` y expone tanto características globales (`get_image_features`, `get_text_features`) como características densas por parche (`get_image_dense_features`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CLIP (transformer dual imagen-texto) con código personalizado |
| Parámetros totales | 150.136.832 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 77 tokens para captions cortas; 248 tokens para captions largas |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

FG-CLIP sigue una arquitectura tipo CLIP con dos torres (codificador de imagen y codificador de texto) que producen embeddings alineados en un espacio común. El entrenamiento se estructura en dos etapas: la primera utiliza pares caption-imagen a nivel global para lograr una alineación de grano fino inicial; la segunda incorpora captions a nivel de región, incluyendo descripciones detalladas de regiones y descripciones positivas/negativas, para refinar aún más la alineación. Esta segunda etapa es la que diferencia a FG-CLIP de un CLIP convencional y le permite capturar atributos locales.

El modelo procesa imágenes a resolución de 224×224 píxeles y expone características densas por parche (dense features), lo que permite visualizar mapas de similitud entre regiones de la imagen y una consulta textual. No se dispone de información detallada en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni sobre el uso de RLHF/DPO, por lo que estos datos se consideran no disponibles.

## Capacidades

- Clasificación zero-shot de imágenes mediante comparación de similitud coseno entre embeddings de imagen y texto.
- Recuperación imagen-texto (image retrieval y text retrieval) con soporte para captions cortas (77 tokens) y largas (248 tokens).
- Alineamiento de grano fino a nivel de región mediante características densas por parche (`get_image_dense_features`).
- Generación de mapas de similitud región-texto para localización visual (por ejemplo, localizar "white cat" en la imagen).
- Procesamiento de texto en inglés.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad de generación de texto libre pese a la etiqueta `text-generation` (el pipeline real es `zero-shot-image-classification`).

## Casos de uso

- Clasificación zero-shot de imágenes en catálogos: el modelo permite etiquetar imágenes sin entrenamiento específico comparando cada imagen con una lista de descripciones candidatas y eligiendo la de mayor probabilidad.
- Búsqueda visual en bases de datos de producto: indexando los embeddings de imagen y consultando con texto en inglés, se puede recuperar imágenes relevantes en un motor de búsqueda multimodal.
- Localización visual de atributos: usando `get_image_dense_features` se pueden generar mapas de similitud que indiquen en qué región de la imagen aparece un objeto o atributo descrito en texto, útil en inspección visual y control de calidad.
- Filtrado y moderación de contenido visual: clasificación zero-shot de imágenes frente a categorías textuales definidas por el operador para detectar contenido no deseado.
- Anotación asistida de datasets: generación de etiquetas y descripciones de regiones para acelerar el etiquetado humano en pipelines de datos de visión.
- Recuperación multimodal en sistemas de documentación: emparejamiento de capturas, diagramas o figuras con sus pies de foto o descripciones textuales en repositorios técnicos.
- Segmentación guiada por texto (como base): las características densas pueden alimentar etapas posteriores de segmentación o grounding, dado el alineamiento a nivel de parche.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card referencia un gráfico de radar comparativo (`radar_chart_methods.png`) y enlaza al paper arXiv 2505.05071 y al repositorio GitHub del proyecto, pero no se incluyen cifras numéricas de MMLU, HumanEval, GSM8K ni métricas de recuperación (Recall@K, mAP) en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~150 M de parámetros, los pesos en fp32 ocupan aproximadamente 0,6 GB; en fp16 ~0,3 GB; en int8 ~0,15 GB. La VRAM total necesaria en la práctica es inferior a 2 GB incluyendo activaciones y procesamiento de imagen a 224×224.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se ha validado ejecución en `.cuda()` genérico. GPU de datacenter (A100, H100) no son necesarias salvo para procesamiento por lotes a gran escala.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` y `AutoImageProcessor`/`AutoTokenizer`. No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la documentación proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto texto | Licencia | Pipeline | Notas |
|---|---|---|---|---|---|
| FG-CLIP base (este) | 150.136.832 | 77 / 248 tokens | Apache 2.0 | zero-shot-image-classification | Alineamiento de grano fino con features densas |
| CLIP ViT-B/32 (OpenAI) | ~151 M | 77 tokens | MIT | zero-shot-image-classification | Referencia estándar; sin alineamiento regional explícito |
| CLIP ViT-B/16 (OpenAI) | ~150 M | 77 tokens | MIT | zero-shot-image-classification | Mayor resolución de parches que B/32 |
| SigLIP base | ~203 M | 64 tokens | Apache 2.0 | zero-shot-image-classification | Usa sigmoid loss en lugar de softmax; comparable en escala |

La comparación se limita a arquitecturas y licencias; no se dispone de métricas comparativas publicadas en la información proporcionada para establecer diferencias de rendimiento cuantitativas.

## Limitaciones y advertencias

- Solo soporta inglés; no se documenta soporte multilingüe.
- La longitud de contexto textual está limitada a 77 tokens para captions cortas y 248 para captions largas, lo que restringe descripciones muy extensas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor; conviene auditar el código antes de usarlo en producción.
- El modelo está orientado a alineamiento y recuperación, no a generación de texto libre; la etiqueta `text-generation` puede inducir a error sobre sus capacidades reales.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo ni de robustez en la información disponible; como todo modelo entrenado con datos web, puede heredar sesgos de los datasets de origen.
- La licencia del proyecto es Apache 2.0, pero la model card advierte que los datasets y checkpoints subyacentes pueden estar sujetos a sus propias licencias originales, que el usuario debe respetar.
- No se han publicado cifras de benchmarks en la documentación disponible, por lo que no es posible verificar empíricamente las mejoras frente a CLIP estándar sin consultar el paper.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere baja validación comunitaria de esta variante concreta.

## Enlaces

- Hugging Face: https://huggingface.co/360ZhiNao/fg-clip-base
- Paper arXiv: https://arxiv.org/abs/2505.05071
- Repositorio GitHub: https://github.com/360CVGroup/FG-CLIP
- Página ICML 2025: https://icml.cc/Conferences/2025
- Variante large en Hugging Face (referenciada en la model card): https://huggingface.co/qihoo360/fg-clip-large
