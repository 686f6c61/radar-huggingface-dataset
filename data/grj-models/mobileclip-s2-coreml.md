# grj-models/mobileclip-s2-coreml

## Resumen

MobileCLIP-S2 es un modelo de visión-lenguaje de tipo CLIP (Contrastive Language-Image Pretraining) desarrollado por Apple Machine Learning Research. Convierte imágenes y texto a un espacio de embeddings compartido de 512 dimensiones, lo que permite tareas de clasificación zero-shot, búsqueda imagen-texto y recuperación multimodal. Este repositorio concreto (`grj-models/mobileclip-s2-coreml`) es un espejo sin modificaciones de los encoders de imagen y texto originales de Apple, empaquetados en formato Core ML para su ejecución en el ecosistema Apple (iOS, iPadOS, macOS).

La relevancia del modelo radica en su orientación a eficiencia: la familia MobileCLIP se diseñó para ofrecer calidad CLIP con un coste computacional muy inferior al de los modelos CLIP convencionales, lo que lo hace apto para inferencia en dispositivo. El encoder de imagen acepta entradas de 256×256 píxeles y produce un vector de 512 dimensiones; el encoder de texto procesa tokens CLIP y genera el embedding correspondiente en el mismo espacio.

El repositorio tiene un tamaño de 0,2 GB y contiene dos paquetes `.mlpackage` (encoder de imagen y encoder de texto). No se trata de un modelo generativo ni de un LLM: es un modelo de representación multimodal de doble torre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP de doble torre (encoder de imagen + encoder de texto), variante MobileCLIP-S2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el encoder de texto procesa tokens CLIP; longitud de secuencia no especificada) |
| Tipos de cuantizacion | no disponible (pesos empaquetados en Core ML; no se documentan variantes de cuantizacion) |
| Idiomas soportados | no disponible |
| Licencia | Apple Machine Learning Research Model License (apple-amlr) |
| Formato de pesos | Core ML (`.mlpackage`) |
| Dimension del embedding | 512 |
| Resolucion de entrada (imagen) | 256×256 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

MobileCLIP-S2 pertenece a la familia MobileCLIP, que emplea una arquitectura CLIP de doble torre con encoders optimizados para eficiencia computacional. El encoder de imagen transforma una imagen de 256×256 en un embedding de 512 dimensiones, y el encoder de texto transforma una secuencia de tokens CLIP en un embedding de la misma dimensión. El entrenamiento se realiza con un objetivo contrastivo que alinea pares imagen-texto en un espacio latente común.

La innovación principal de la familia MobileCLIP, descrita en el paper arXiv:2311.17049, es la técnica de *multi-modal reinforced training*, que aprovecha modelos CLIP de mayor tamaño como profesores para mejorar la calidad de los embeddings de modelos pequeños y rápidos. No se dispone en la información proporcionada del número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de ajuste fino adicionales (RLHF/DPO no aplica a este tipo de modelo).

Este repositorio no incluye información sobre el proceso de conversión a Core ML más allá de indicar que es un espejo sin modificaciones de `apple/coreml-mobileclip`.

## Capacidades

- Codificación de imágenes en embeddings de 512 dimensiones a partir de entradas de 256×256 píxeles.
- Codificación de texto en embeddings de 512 dimensiones en el mismo espacio latente.
- Clasificación de imágenes zero-shot mediante comparación de similitud coseno entre embeddings de imagen y de etiquetas textuales.
- Búsqueda y recuperación imagen-texto (text-to-image y image-to-text) por similitud en el espacio de embeddings.
- Filtrado y ranking multimodal (por ejemplo, moderación o etiquetado automático de imágenes).
- Ejecución en dispositivo mediante Core ML (entorno Apple).
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades de audio.
- No se documentan capacidades multilingües específicas.

## Casos de uso

- Clasificación de imágenes zero-shot en apps iOS/macOS: se codifican las etiquetas candidatas como texto y la imagen de entrada, y se selecciona la etiqueta con mayor similitud coseno; el formato Core ML permite ejecutarlo íntegramente en dispositivo sin conexión.
- Búsqueda visual en galerías locales: indexar un conjunto de imágenes por su embedding de 512 dimensiones y recuperar las más similares a una consulta textual, aprovechando la eficiencia del modelo para operar sobre miles de imágenes en un dispositivo Apple.
- Etiquetado automático y moderación de contenido: calcular la similitud entre la imagen y un conjunto de categorías o prompts de texto para asignar etiquetas o marcar contenido sensible en pipelines de preprocesado.
- Organización de fototecas: agrupar imágenes por similitud semántica en el espacio de embeddings para crear colecciones o clusters automáticos.
- Filtrado previo en pipelines de visión: usar el encoder de imagen como extractor de características ligeras antes de modelos más pesados, reduciendo el coste computacional en etapas posteriores.
- Recomendación multimodal: combinar embeddings de imagen y de texto de productos o contenidos para calcular afinidad entre una consulta textual y un catálogo visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio es un espejo y no incluye métricas de evaluación; el paper original (arXiv:2311.17049) contiene los resultados de la familia MobileCLIP, pero no se han proporcionado en esta ficha.

## Requisitos de hardware

- Al tratarse de un modelo empaquetado en Core ML, está pensado para ejecutarse en hardware Apple (CPU, GPU y Neural Engine) a través del runtime Core ML.
- No se dispone de cifras de VRAM ni de memoria unificada requerida en la información proporcionada.
- El tamaño del repositorio es de 0,2 GB, lo que sugiere un modelo ligero apto para dispositivos de gama consumer (iPhone, iPad, Mac con Apple Silicon).
- No se documentan opciones de despliegue en vLLM, llama.cpp, Ollama o TGI; el runtime previsto es Core ML.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Embedding | Resolucion | Formato | Licencia |
|---|---|---|---|---|---|
| MobileCLIP-S2 (este repo) | CLIP doble torre | 512 | 256×256 | Core ML | Apple AMLR |
| CLIP ViT-B/32 (OpenAI) | CLIP doble torre | 512 | 224×224 | PyTorch/safetensors | MIT |
| SigLIP base | CLIP doble torre (sigmoide) | 768 | 224×224 | PyTorch/safetensors | Apache 2.0 |

No se dispone de datos de rendimiento comparativo en la información proporcionada. Las cifras de parámetros de los modelos alternativos no se incluyen por no estar disponibles en esta ficha.

## Limitaciones y advertencias

- Es un modelo de representación, no generativo: no produce texto libre ni respuestas conversacionales.
- La licencia Apple Machine Learning Research Model License (apple-amlr) impone restricciones específicas; es necesario revisar el archivo LICENSE antes de cualquier uso comercial.
- No se documentan los idiomas soportados por el encoder de texto; el rendimiento en idiomas distintos del inglés es incierto.
- Como todo modelo CLIP, puede heredar sesgos de los datos de entrenamiento en la asociación imagen-texto.
- La resolución de entrada está fijada en 256×256, lo que limita el detalle en imágenes de alta resolución.
- Al ser un espejo sin modificaciones, no hay garantías de mantenimiento ni soporte por parte del autor del repositorio.
- El uso está ligado al ecosistema Core ML; no es directamente portable a otros runtimes sin conversión.
- No se dispone de información sobre el comportamiento del modelo en dominios especializados (médico, industrial, etc.).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/grj-models/mobileclip-s2-coreml
- Repositorio original de Apple en Hugging Face: https://huggingface.co/apple/coreml-mobileclip
- Paper: https://arxiv.org/abs/2311.17049
- Código: https://github.com/apple/ml-mobileclip
