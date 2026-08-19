# issai/Qolda

## Resumen

Qolda es un modelo de visión-lenguaje (VLM) compacto de 4.300 millones de parámetros desarrollado por ISSAI (Institute of Smart Systems and Artificial Intelligence) de la Universidad Nazarbayev (Kazajistán). Está diseñado para operar en kazajo, ruso e inglés, y combina el codificador de visión InternViT-300M y el proyector MLP de InternVL3.5-4B con el modelo de lenguaje Qwen3-4B. El entrenamiento se realizó con el framework InternVL. Su nombre, "Qolda", juega con el significado kazajo de "en la mano" (por su tamaño compacto) y "apoyar" (por su naturaleza asistencial). Es relevante porque ofrece capacidades multimodales avanzadas en un paquete pequeño, apto para despliegue en dispositivos con recursos limitados, algo poco común en modelos multilingües de bajo presupuesto.

El modelo se publica en noviembre de 2025 y cuenta con una versión GGUF adicional para inferencia eficiente con llama.cpp. Su arquitectura híbrida (encoder de visión + LLM) permite tareas de comprensión de imágenes, OCR y razonamiento visual en tres idiomas, con un modo de pensamiento extendido ("thinking") controlable mediante un parámetro explícito. Aunque comparte base con InternVL3.5-4B, Qolda se ha adaptado específicamente para los idiomas kazajo y ruso, con benchmarks publicados en esos idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (InternViT-300M + MLP Projector + Qwen3-4B) |
| Parametros totales | 4.343.533.056 (4,3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (existe version GGUF en issai/Qolda_GGUF, sin detalle de cuantizaciones) |
| Idiomas soportados | Kazajo (kk), ruso (ru), ingles (en) |
| Licencia | No disponible (la model card muestra un badge Apache 2.0, pero el campo oficial en HuggingFace no esta definido) |
| Formato de pesos | safetensors (tambien disponible en GGUF) |

## Arquitectura y entrenamiento

Qolda combina dos componentes de modelos existentes: el encoder de vision InternViT-300M y el proyector MLP de InternVL3.5-4B, junto con el modelo de lenguaje Qwen3-4B. Esta arquitectura híbrida permite procesar imágenes y texto de forma conjunta, manteniendo un tamaño reducido. El entrenamiento se realizó con el framework InternVL, como indica la model card, aunque no se proporcionan detalles sobre el volumen de datos de entrenamiento, el número de tokens ni el uso de técnicas como RLHF o DPO.

Una característica destacada es el modo de razonamiento extendido ("thinking"), que requiere que el parámetro `enable_thinking` se establezca explícitamente en las llamadas a la API. Según el autor, en tareas simples puede generar una respuesta de pensamiento vacía, lo que sugiere que el modelo tiene un comportamiento condicional en su cadena de razonamiento.

## Capacidades

- Comprensión de imágenes y generación de texto asociado (pipeline image-text-to-text)
- Razonamiento multimodal en tareas como respuesta a preguntas visuales, OCR y análisis de diagramas
- Razonamiento matemático y lógico sobre contenido visual (MathVista, MathVision)
- Modo de pensamiento extendido controlable mediante el parámetro `enable_thinking`
- Multilingüismo en kazajo, ruso e inglés, con benchmarks específicos para cada idioma
- Capacidad conversacional y de seguimiento de instrucciones (etiqueta "conversational")
- Soporte para despliegue mediante servidor compatible con OpenAI (lmdeploy)

## Casos de uso

- Asistente educativo en kazajo y ruso: puede explicar conceptos de ciencias o matemáticas con apoyo visual, por ejemplo, resolviendo problemas de geometría a partir de una imagen. Su tamaño compacto permite ejecutarlo en portátiles o estaciones de trabajo sin GPU de gama alta.
- Atención al cliente automatizada en kazajo: al estar entrenado para ese idioma, puede gestionar consultas escritas con contexto visual (capturas de pantalla, fotos de productos) en un entorno de servicio al cliente, reduciendo la dependencia de modelos en inglés.
- Procesamiento de documentos con OCR: gracias a su capacidad de OCR (OCRBench), puede extraer texto de imágenes de documentos, facturas o carteles, y resumirlo o traducirlo al ruso o kazajo.
- Accesibilidad para personas con discapacidad visual: el modelo puede describir imágenes del entorno en kazajo o ruso, funcionando como asistente en tiempo real en dispositivos móviles con recursos limitados.
- Análisis de contenido en redes sociales: puede clasificar o moderar imágenes con texto superpuesto (memes, infografías) en los tres idiomas, útil para plataformas locales.
- Generación de subtítulos o descripciones para archivos multimedia: dado su tamaño, puede integrarse en pipelines de procesamiento por lotes en servidores modestos, generando metadatos textuales para bibliotecas de imágenes.

## Benchmarks y rendimiento

La model card publica resultados extensos para la familia Qolda. A continuación se presentan los resultados de las variantes No-Think y Think del modelo de 4B (las únicas que corresponden a esta ficha; las variantes AVL de 5B, 9B y 34B son modelos más grandes de la misma familia).

**Benchmarks de texto**

| Benchmark | Idioma | Qolda No-Think (4B) | Qolda Think (4B) |
|:--|:--|--:|--:|
| MMLU | Kazajo | 58.39 | 69.28 |
|  | Inglés | 70.03 | 76.46 |
| MMLU-Pro | Kazajo | 40.62 | 57.68 |
|  | Inglés | 58.09 | 66.31 |
|  | Ruso | 47.42 | 62.45 |
| GPQA | Kazajo | 31.89 | 38.60 |
|  | Inglés | 39.46 | 45.62 |
|  | Ruso | 32.60 | 40.19 |
| ARC | Kazajo | 86.14 | 92.30 |
|  | Inglés | 94.22 | 96.11 |
|  | Ruso | 91.17 | 94.17 |
| GSM8K | Kazajo | 73.01 | 83.00 |
|  | Inglés | 62.85 | 90.22 |
|  | Ruso | 84.99 | 83.98 |
| MMLU-Redux | Kazajo | 60.06 | 72.38 |
|  | Inglés | 72.91 | 79.40 |
| KazCulture | Kazajo | 53.00 | 47.45 |
| KazMMLU | Kazajo | 58.11 | 66.14 |
| KazBench | Kazajo | 64.23 | 61.12 |
| Belebele | Kazajo | 81.07 | 82.91 |
| PIQA | Kazajo | 63.00 | 70.00 |
| INCLUDE | Kazajo | 45.20 | 46.00 |
|  | Ruso | 59.17 | 56.52 |
| KKCOPA | Kazajo | 70.00 | 73.79 |
| NIS Math | Kazajo | 66.00 | 87.88 |
| KazQAD | Kazajo | 70.99 | 67.40 |
| RAGBench | Kazajo | 54.95 | 66.81 |

**Benchmarks de visión**

| Benchmark | Idioma | Qolda No-Think (4B) | Qolda Think (4B) |
|:--|:--|--:|--:|
| RealWorldQA | Kazajo | 53.86 | 48.10 |
|  | Inglés | 61.57 | 61.70 |
|  | Ruso | 56.08 | 57.12 |
| MMStar | Kazajo | 53.08 | 59.60 |
|  | Inglés | 58.48 | 65.04 |
|  | Ruso | 55.48 | 59.84 |
| AI2D | Kazajo | 63.48 | 66.26 |
|  | Inglés | 73.99 | 75.61 |
| MathVista | Kazajo | 58.32 | 66.33 |
|  | Inglés | 63.14 | 71.04 |
| MathVision | Kazajo | 35.41 | 44.38 |
|  | Inglés | 42.00 | 48.05 |
| MMBench | Kazajo | 79.97 | 83.85 |
|  | Inglés | 83.05 | 84.40 |
| OCRBench | Kazajo | 49.89 | 46.49 |
|  | Inglés | 69.90 | 68.70 |

Se observa que el modo Think mejora sustancialmente los resultados en la mayoría de benchmarks, especialmente en razonamiento matemático y conocimiento general. No se dispone de comparaciones con otros modelos en los mismos benchmarks dentro de la información proporcionada.

## Requisitos de hardware

- VRAM estimada: con 4.343 millones de parámetros, en FP16 el peso del modelo ocupa aproximadamente 8,7 GB (coincide con el tamaño del repositorio). Con cuantización INT8 se reduciría a ~4,4 GB y con INT4 a ~2,2 GB, aunque estos valores son estimaciones y no datos oficiales.
- GPU recomendadas: el modelo es adecuado para GPUs de consumo con al menos 8-12 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4070, RTX 4090). La versión GGUF permite ejecución en CPU mediante llama.cpp, aunque con menor velocidad.
- Opciones de despliegue: se proporciona un servidor compatible con OpenAI mediante lmdeploy (`lmdeploy serve api_server`), y la versión GGUF es compatible con llama.cpp y Ollama.
- Latencia y throughput: no se han publicado datos oficiales. En una GPU moderna de gama media, un modelo de 4B en FP16 suele ofrecer decenas de tokens por segundo, pero no se puede confirmar sin mediciones.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos de otros modelos en la misma configuración (mismo tamaño y mismos idiomas). Sin embargo, se puede comparar estructuralmente:

| Modelo | Parámetros | Arquitectura | Idiomas | Licencia |
|:--|:--|:--|:--|:--|
| Qolda (4B) | 4,3B | ViT + MLP + Qwen3-4B | kk, ru, en | No disponible (badge Apache 2.0) |
| InternVL3.5-4B (base) | ~4B | ViT + MLP + LLM | Multilingüe (principalmente en/zh) | No disponible |
| Qwen3-4B (base) | 4B | Transformer denso | Multilingüe (30+ idiomas) | Apache 2.0 |

Qolda se distingue por su enfoque específico en kazajo y ruso, algo que no ofrecen sus modelos base. Las variantes Qolda-AVL (5B, 9B, 34B) amplían la misma familia con más parámetros y mejores resultados, pero no son el objeto de esta ficha.

## Limitaciones y advertencias

- Licencia no claramente definida: el campo oficial en HuggingFace indica "no disponible", aunque la model card muestra un badge Apache 2.0. Se recomienda contactar con ISSAI antes de un uso comercial.
- El modo thinking puede generar respuestas vacías en tareas simples, según la nota del autor. Esto puede afectar a la robustez en producción.
- Solo cubre tres idiomas (kazajo, ruso, inglés); no tiene soporte para otros idiomas, incluido el español.
- No se han documentado sesgos específicos, pero al estar entrenado sobre datos de Internet, puede heredar sesgos de género, étnicos o culturales.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de visión donde puede describir objetos que no están presentes.
- Longitud de contexto no especificada; al ser un modelo compacto, es probable que tenga una ventana limitada en comparación con modelos grandes, aunque no se confirma.
- El repositorio GGUF existe, pero no se detallan las cuantizaciones disponibles ni su rendimiento exacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/issai/Qolda
- Versión GGUF: https://huggingface.co/issai/Qolda_GGUF
- Repositorio de despliegue (GitHub): https://github.com/IS2AI/Qolda-deployment
- Página oficial de ISSAI sobre Qolda: https://issai.nu.edu.kz/qolda/
- Anuncio de lanzamiento: https://issai.nu.edu.kz/2025/11/14/issai-launches-qolda-a-new-open-source-compact-language-vision-model-for-devices/
- Paper en IEEE Access: https://ieeexplore.ieee.org/document/11454511
- Colección de benchmarks de texto: https://huggingface.co/collections/issai/qolda-language-benchmarks
- Colección de benchmarks de visión: https://huggingface.co/collections/issai/qolda-vision-benchmarks
- Serie Qolda-AVL: https://huggingface.co/collections/issai/qolda-avl
