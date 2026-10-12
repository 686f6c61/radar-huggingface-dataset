# microsoft/Florence-2-base

## Resumen

Florence-2-base es un modelo fundacional de visión desarrollado por Microsoft (Azure AI) que emplea un enfoque basado en prompts para resolver una amplia variedad de tareas de visión y visión-lenguaje. Se distribuye a través de Hugging Face con implementación en `transformers` e incluye código personalizado (`trust_remote_code`). La variante *base* cuenta con 231.567.705 parámetros (aproximadamente 0,23B), mientras que la familia completa incluye también una versión *large* de 0,77B y sendas variantes afinadas sobre tareas downstream (*-ft*).

El modelo está preentrenado sobre FLD-5B, un conjunto de datos con 5.400 millones de anotaciones repartidas en 126 millones de imágenes, lo que le permite abordar aprendizaje multitarea con una única arquitectura secuencia-a-secuencia. Con una simple instrucción textual se le pueden pedir tareas como generar pies de foto, detectar objetos, proponer regiones o segmentar elementos dentro de una imagen.

Su relevancia actual radica en que ofrece un modelo de visión multitarea, ligero y con licencia MIT, con más de 2,9 millones de descargas en Hugging Face. Es una opción atractiva para integraciones en producción donde se necesita procesamiento de imagen con bajo coste computacional, si bien el repositorio de esta variante *base* corresponde al modelo preentrenado, no a la versión afinada para tareas concretas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Secuencia-a-secuencia (encoder-decoder) para visión-lenguaje; incluye encoder de imagen y encoder-decoder multimodal |
| Parametros totales | 231.567.705 (aproximadamente 0,23B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo original se entrena en float16; en CPU puede ejecutarse en float32) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (también compatible con PyTorch) |

## Arquitectura y entrenamiento

Florence-2 adopta una arquitectura secuencia-a-secuencia que combina un encoder de imagen con un encoder-decoder multimodal, de modo que la misma red sirve para tareas visuales dispares dependiendo del prompt de texto que se le entrega. El preentrenamiento se realizó sobre FLD-5B, un corpus con 5.400 millones de anotaciones sobre 126 millones de imágenes, orientado a aprendizaje multitarea. Los modelos de la familia se entrenaron en float16.

La información disponible no detalla el número exacto de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO; tampoco se especifican innovaciones como decodificación especulativa o atención lineal. El modelo se presenta como competitivo tanto en escenarios zero-shot como tras fine-tuning. Cabe destacar que esta variante *base* es el modelo preentrenado, mientras que las versiones `-ft` se han afinado sobre una colección de tareas downstream, un matiz importante a la hora de elegir el checkpoint para producción.

## Capacidades

- Generación de pies de foto: prompts `<CAPTION>`, `<DETAILED_CAPTION>` y `<MORE_DETAILED_CAPTION>` para descripciones de distinto nivel de detalle.
- Detección de objetos: prompt `<OD>`, que devuelve cajas delimitadoras y etiquetas.
- Segmentación y propuesta de regiones: prompt `<REGION_PROPOSAL>` para proponer regiones de interés.
- Descripción densa de regiones: prompt `<DENSE_REGION_CAPTION>`, que aporta cajas y etiquetas por región.
- Anclaje de frases a imagen (grounding): prompt `<CAPTION_TO_PHRASE_GROUNDING>`, que localiza en la imagen los elementos descritos en un texto.
- Enfoque multitarea basado en prompts: el modelo no usa cabeceras específicas por tarea, sino que cambia de comportamiento según el texto de entrada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Atención a la accesibilidad web: generar texto alternativo automático para imágenes mediante `<DETAILED_CAPTION>`, mejorando la lectura por lectores de pantalla en portales con grandes volúmenes de contenido gráfico.
- Etiquetado automático de datasets: usar `<OD>` y `<DENSE_REGION_CAPTION>` para preanotar imágenes y reducir el trabajo manual previo al entrenamiento de otros modelos de visión.
- Moderación de contenido visual: emplear `<CAPTION>` y `<DENSE_REGION_CAPTION>` para describir escenas y detectar elementos concretos en pipelines de revisión, con el modelo ejecutándose en GPU de gama media.
- Búsqueda visual con anclaje de frases: usar `<CAPTION_TO_PHRASE_GROUNDING>` para localizar objetos descritos en lenguaje natural dentro de un catálogo de imágenes, útil en comercio electrónico o archivos fotográficos.
- Inventario y control de stock en retail: aplicar `<OD>` sobre fotografías de estanterías para listar productos y sus posiciones, integrándolo en un sistema de visión por lotes.
- Análisis de imágenes industriales o de campo: propuesta de regiones con `<REGION_PROPOSAL>` para señalar zonas de interés antes de un análisis posterior más costoso.
- Enriquecimiento de metadatos en plataformas de contenido: generar pies de foto detallados de forma masiva para indexar y clasificar imágenes en CMS o DAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 0,23B parámetros, los pesos en float16 ocupan aproximadamente 0,46 GB; con activaciones y procesamiento de imagen el consumo realista se sitúa en el entorno de 1-2 GB.
- El repositorio completo ocupa 1,9 GB en disco, por lo que el despliegue es viable incluso en entornos con almacenamiento limitado.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM resulta suficiente; funcionan tanto tarjetas de consumo (RTX 3060, RTX 4090) como de centro de datos (A100, H100), aunque estas últimas están sobredimensionadas para este tamaño.
- Cabe sobradamente en GPU de consumo e incluso puede ejecutarse en CPU usando float32, según el propio ejemplo de la model card.
- Opciones de despliegue: la vía oficial es `transformers` con `AutoModelForCausalLM` y `AutoProcessor`, requiriendo `trust_remote_code=True`; el modelo figura como compatible con endpoints. No se confirma en la información disponible soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Florence-2-base | 0,23B | no disponible | MIT | Modelo preentrenado con FLD-5B |
| Florence-2-large | 0,77B | no disponible | MIT | Misma familia, mayor capacidad |
| Florence-2-base-ft | 0,23B | no disponible | MIT | Afinado sobre tareas downstream |
| Florence-2-large-ft | 0,77B | no disponible | MIT | Afinado sobre tareas downstream |
| Otros modelos de visión comparables | no disponible | no disponible | no disponible | No se dispone de datos en la información proporcionada |

## Limitaciones y advertencias

- Esta variante es el modelo *base* preentrenado; para tareas concretas puede rendir peor que las versiones `-ft`, afinadas específicamente sobre tareas downstream.
- No hay información sobre los idiomas soportados oficialmente, por lo que el comportamiento multilingüe no está garantizado.
- Riesgo de alucinación en las descripciones generadas: los pies de foto pueden incluir detalles no presentes en la imagen.
- El modelo no es un asistente conversacional generalista ni soporta de forma documentada tool calling, function calling o razonamiento multi-step.
- Requiere ejecutar código remoto (`trust_remote_code=True`), lo que implica confiar en la implementación personalizada incluida en el repositorio.
- La generación en los ejemplos se limita a `max_new_tokens=1024`, lo que acota la longitud de la salida.
- No se documentan sesgos concretos en la información disponible.
- La licencia MIT permite uso comercial, pero conviene verificar los términos del archivo LICENSE del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microsoft/Florence-2-base
- Informe técnico (arXiv): https://arxiv.org/abs/2311.06242
- Notebook de inferencia y visualización (Florence-2-large): https://huggingface.co/microsoft/Florence-2-large/blob/main/sample_inference.ipynb
- Florence-2-large: https://huggingface.co/microsoft/Florence-2-large
- Florence-2-base-ft: https://huggingface.co/microsoft/Florence-2-base-ft
- Florence-2-large-ft: https://huggingface.co/microsoft/Florence-2-large-ft
- Artículo explicativo (Encord): https://encord.com/blog/florence-2-explained/
- Artículo explicativo (AssemblyAI): https://www.assemblyai.com/blog/florence-2-how-it-works-how-to-use
- Artículo (Arineo): https://arineo.com/de/blog/das-microsoft-florence-2-modell-artificial/
- Repositorio en GitHub (anyantudre): https://github.com/anyantudre/Florence-2-Vision-Language-Model
