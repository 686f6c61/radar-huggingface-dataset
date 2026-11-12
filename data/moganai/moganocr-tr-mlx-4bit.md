# moganai/MoganOCR-TR-MLX-4bit

## Resumen

MoganOCR-TR-MLX-4bit es una versión cuantizada a 4 bits del modelo MoganOCR-TR, un modelo de visión-lenguaje (VLM) de 2.213 millones de parámetros especializado en OCR y parseo de documentos turcos. Lo desarrolla moganai y está empaquetado en formato MLX para su ejecución nativa en Apple Silicon. Su tarea principal es convertir una imagen de página completa en Markdown respetando el orden de lectura, con tablas representadas como HTML y fórmulas como LaTeX.

El modelo se construye sobre la arquitectura Qwen3.5 (según los tags del repositorio) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Está pensado para flujos de digitalización de documentos en turco, con soporte secundario de inglés, y se ofrece en varias cuantizaciones (4, 6 y 8 bits, además de GGUF) para adaptarse a distintos presupuestos de memoria.

Esta variante de 4 bits es la más pequeña y rápida de la familia, a costa de cierta pérdida de precisión frente a las versiones de 6 y 8 bits. El codificador visual se mantiene en bfloat16 para preservar la calidad de la extracción de características de imagen. El repositorio ocupa 1,7 GB y está orientado a equipos Mac con chip de la serie M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) basada en Qwen3.5, con codificador visual en bfloat16 |
| Parametros totales | 2.213.241.664 (aproximadamente 2,2 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE según la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (esta version); el modelo base ofrece variantes de 6 bits, 8 bits y GGUF |
| Idiomas soportados | Turco (tr) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento

El modelo es un VLM de tipo image-text-to-text construido sobre la familia Qwen3.5, con un codificador visual que procesa una imagen de página y un decodificador de lenguaje que genera la transcripción estructurada en Markdown. En esta versión MLX de 4 bits, el codificador visual se conserva en bfloat16 mientras que el resto de pesos se cuantiza a 4 bits, una decisión habitual para no degradar la representación visual en exceso. El tamaño total de parámetros es de 2.213.241.664.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card remite a la ficha del modelo base (moganai/MoganOCR-TR) para los detalles de entrenamiento, pero esos datos no están incluidos en el material disponible. La especialización declarada es el parseo de documentos turcos con salida en Markdown, tablas en HTML y fórmulas en LaTeX.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de páginas completas de documentos.
- Conversión de la página a Markdown respetando el orden de lectura.
- Representación de tablas como HTML dentro del Markdown generado.
- Representación de fórmulas matemáticas como LaTeX.
- Procesamiento multimodal image-text-to-text: recibe una imagen y un prompt de texto.
- Soporte principal de turco, con soporte secundario de inglés.
- Generación conversacional (tag conversational) dentro del pipeline image-text-to-text.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode).

## Casos de uso

- Digitalización de archivos administrativos turcos: el modelo convierte cada página escaneada en Markdown estructurado, lo que permite indexar y buscar el contenido en sistemas de gestión documental sin transcripción manual.
- Extracción de tablas de informes y facturas: al representar las tablas como HTML, el resultado se puede parsear directamente con librerías de scraping o convertirse a CSV/Excel en un pipeline posterior.
- Procesamiento de documentación técnica con fórmulas: la salida en LaTeX facilita la reutilización del contenido en entornos de publicación científica o documentación técnica.
- Digitalización de material académico en turco: apuntes, exámenes y libros de texto pueden convertirse a Markdown para su uso en plataformas de estudio o sistemas de recuperación de conocimiento.
- Ingesta de documentos para RAG: el Markdown generado, con orden de lectura correcto, sirve como texto de entrada para pipelines de chunking y embeddings en sistemas de preguntas y respuestas sobre corpus documentales.
- Prototipado local en Mac: gracias al formato MLX y a la cuantización de 4 bits, es posible ejecutar el modelo en un portátil Apple Silicon para validar flujos de OCR antes de desplegar la versión de mayor precisión en servidor.
- Preprocesado de contratos y expedientes: la conversión a Markdown estructurado permite aplicar reglas o modelos de extracción de entidades sobre el texto resultante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card enlaza a un espacio de benchmark llamado TurkishOCR-Bench (https://huggingface.co/spaces/moganai/TurkishOCR-Bench), pero no se incluyen cifras numéricas en el material proporcionado.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 1,7 GB, por lo que la inferencia en 4 bits requiere del orden de 2 a 3 GB de memoria unificada, más el espacio para el codificador visual en bfloat16 y la caché de activaciones.
- Hardware objetivo: Apple Silicon (chips de la serie M1, M2, M3, M4 y posteriores), ya que el formato es MLX y la librería de ejecución es mlx-vlm.
- No está pensado para GPU NVIDIA en este formato; para CUDA o CPU se ofrece la variante GGUF del modelo base.
- Despliegue: `mlx_vlm generate` con la librería mlx-vlm; instalación mediante `pip install -U mlx-vlm`.
- Parámetros de inferencia recomendados por el autor: una imagen de página por petición, prompt `Sayfayı markdown olarak yaz.`, `temperature 0` y `max-tokens 8000`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MoganOCR-TR-MLX-4bit | 2,2 B | no disponible | tr, en | Apache 2.0 | MLX safetensors (4 bits) |
| MoganOCR-TR-MLX-8bit | 2,2 B (misma base) | no disponible | tr, en | Apache 2.0 | MLX safetensors (8 bits) |
| MoganOCR-TR-GGUF | 2,2 B (misma base) | no disponible | tr, en | Apache 2.0 | GGUF |

Las alternativas directamente comparables son las otras cuantizaciones del mismo modelo base: la versión de 8 bits ofrece mayor precisión a cambio de más memoria, la de 6 bits es un punto intermedio y la GGUF amplía la compatibilidad a otros entornos de ejecución (llama.cpp y derivados). No se dispone de información sobre modelos de OCR de otros desarrolladores en el material proporcionado para establecer una comparación cruzada de rendimiento.

## Limitaciones y advertencias

- La cuantización a 4 bits introduce pérdida de precisión respecto a las versiones de 6 y 8 bits, según advierte el propio autor.
- El modelo está especializado en turco; su rendimiento en otros idiomas distintos del inglés no está documentado y probablemente sea limitado.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado sobre documentos turcos puede reflejar sesgos presentes en ese corpus.
- Riesgo de alucinación en la transcripción: como todo VLM generativo, puede producir texto que no aparece literalmente en la imagen, especialmente en documentos de baja calidad o con tablas complejas.
- No se especifica la longitud de contexto, lo que dificulta planificar el procesamiento de páginas densas o de gran resolución.
- El uso comercial está permitido por la licencia Apache 2.0, sin restricciones adicionales conocidas.
- La ejecución está limitada al ecosistema MLX (Apple Silicon); para otros entornos hay que recurrir a la variante GGUF.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es mínima.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moganai/MoganOCR-TR-MLX-4bit
- Modelo base: https://huggingface.co/moganai/MoganOCR-TR
- Versión 8 bits: https://huggingface.co/moganai/MoganOCR-TR-MLX-8bit
- Versión 6 bits: https://huggingface.co/moganai/MoganOCR-TR-MLX-6bit
- Versión GGUF: https://huggingface.co/moganai/MoganOCR-TR-GGUF
- Benchmark TurkishOCR-Bench: https://huggingface.co/spaces/moganai/TurkishOCR-Bench
- Repositorio MLX: https://github.com/ml-explore/mlx
- Apoyo al autor: https://buymeacoffee.com/moganai
