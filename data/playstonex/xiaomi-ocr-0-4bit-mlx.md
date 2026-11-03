# playstonex/Xiaomi-OCR-0-4bit-mlx

## Resumen

Xiaomi-OCR-0-4bit-mlx es una cuantización a 4 bits en formato MLX del modelo Xiaomi-OCR-0, un modelo de lenguaje y visión (VLM) especializado en OCR y parseo de documentos desarrollado originalmente por Xiaomi (repositorio base SeerRay-Lab/Xiaomi-OCR-0). Esta versión concreta la publica el usuario playstonex y su objetivo es permitir la inferencia del modelo en hardware Apple Silicon mediante el framework MLX, reduciendo el peso de los pesos de 1,6 GB en bf16 a aproximadamente 622 MB.

El modelo base es un VLM unificado de aproximadamente 853 millones de parámetros construido sobre una arquitectura Qwen3.5 híbrida: combina atención lineal Gated DeltaNet con atención completa periódica y un codificador visual ViT de la familia Qwen3-VL. Está diseñado específicamente para tareas de reconocimiento óptico de caracteres y extracción estructurada de documentos, incluyendo fórmulas y escritura manual densa.

Su relevancia actual radica en que ofrece capacidades de OCR de documentos en un tamaño compacto que cabe en memoria unificada de equipos Apple Silicon, lo que permite procesamiento local de documentos sin depender de servicios en la nube. La licencia Apache-2.0 heredada del modelo base facilita su uso comercial, aunque el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 (Gated DeltaNet linear attention + atención completa periódica) con ViT Qwen3-VL para visión |
| Parametros totales | 852.985.920 (~0,85 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit afín, group size 64, mixta (visión y algunas capas en mayor precisión); el modelo base en bf16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX); repo de 0,7 GB |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida Qwen3.5 que alterna capas de atención lineal Gated DeltaNet con capas de atención completa periódica, un esquema que reduce el coste computacional en secuencias largas manteniendo capacidad de modelado global. El componente visual es un ViT de la familia Qwen3-VL que procesa las imágenes de entrada y las proyecta al espacio del modelo de lenguaje. Esta versión 4-bit MLX aplica cuantización afín de 4 bits con group size 64, manteniendo en mayor precisión el codificador visual y algunas capas concretas para preservar la calidad del OCR.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El autor de la cuantización indica dos ajustes de compatibilidad con Swift: el `tokenizer_class` se fija a `PreTrainedTokenizer` (backend BPE) y el `preprocessor_config.json` se aplana con `image_mean` y `merge_size` en el nivel superior, cambios inocuos para la ruta de Python. El motor Swift configura un presupuesto de píxeles propio (`min_pixels=65536`, `max_pixels=16777216`) para mantener resolución completa en páginas densas.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos.
- Parseo de documentos con extracción de texto estructurado.
- Reconocimiento de fórmulas matemáticas en imágenes.
- Reconocimiento de escritura manual densa.
- Procesamiento image-text-to-text conversacional (pipeline declarado).
- Inferencia local en Apple Silicon mediante MLX (`mlx-vlm` en Python y `mlx-swift-lm` en Swift).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión adicional, audio: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de documentos escaneados en local: el modelo procesa imágenes de páginas y devuelve el texto reconocido, adecuado para equipos Apple Silicon donde la inferencia MLX evita enviar documentos sensibles a la nube.
- Extracción de fórmulas científicas: gracias a su especialización en fórmulas densas y al presupuesto de píxeles configurable, puede transcribir ecuaciones de artículos y apuntes manteniendo la resolución completa de la página.
- Reconocimiento de escritura manual: útil para digitalizar notas manuscritas y formularios rellenados a mano, un caso donde los OCR genéricos suelen fallar.
- Parseo de documentos para pipelines de datos: al ser un VLM image-text-to-text, puede integrarse en flujos que convierten PDFs o imágenes en texto estructurado antes de un procesamiento posterior.
- OCR embebido en aplicaciones macOS/iOS nativas: la compatibilidad con `mlx-swift-lm` y el ejemplo `minerukit xiaomi-ocr` permiten integrar OCR on-device en apps Swift sin backend externo.
- Automatización de archivo y gestión documental: con un peso de ~622 MB, el modelo cabe en memoria unificada de portátiles Apple, lo que permite procesar lotes de documentos en segundo plano en el propio dispositivo.
- Prototipado e investigación en OCR: su tamaño compacto y licencia Apache-2.0 lo hacen adecuado para experimentar con cuantización MLX y evaluación de VLM pequeños en tareas de visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: el repo ocupa ~0,7 GB y los pesos cuantizados ~622 MB; se necesita memoria unificada adicional para el codificador visual a mayor precisión, el procesador de imágenes y el contexto.
- GPU recomendadas: hardware Apple Silicon (series M1, M2, M3, M4 y superiores) mediante MLX; no está pensado para GPU NVIDIA en este formato.
- ¿Cabe en GPU de consumo? Sí, en equipos Apple Silicon con memoria unificada; el tamaño reducido lo hace viable en configuraciones de 8 GB o más.
- Opciones de despliegue: `mlx-vlm` (Python), `mlx-swift-lm` / `MlxOCRKit` (Swift). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / plataforma |
|---|---|---|---|---|---|
| Xiaomi-OCR-0-4bit-mlx (esta ficha) | ~0,85 B | no disponible | en | Apache-2.0 | MLX, Apple Silicon |
| Xiaomi-OCR-0 (base, bf16) | ~0,85 B | no disponible | en | Apache-2.0 | safetensors, bf16 |
| Alternativas OCR/VLM de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: inherente a los modelos generativos; en OCR puede producir texto plausible que no aparece en la imagen, por lo que conviene validar la salida en producción.
- Limitación de idioma: la model card solo declara inglés, lo que restringe su uso en documentos en castellano u otras lenguas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe conservarse la atribución a los autores originales (SeerRay-Lab / Xiaomi); este repositorio solo recuantiza y añade configuración de compatibilidad.
- Compatibilidad: los pesos están en formato MLX y requieren Apple Silicon; no son directamente utilizables en ecosistemas CUDA.
- Contexto: no se documenta la longitud máxima de contexto, lo que dificulta planificar documentos de muchas páginas.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor es un tercero distinto del desarrollador original; conviene verificar la calidad de la cuantización antes de usarla en producción.
- Ajustes específicos para Swift: si se modifica la configuración del tokenizador o del preprocesador pueden romperse los cargadores estrictos de Swift.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/playstonex/Xiaomi-OCR-0-4bit-mlx
- Modelo base referenciado en la model card: https://huggingface.co/SeerRay-Lab/Xiaomi-OCR-0
- Modelo base indicado en los metadatos de HuggingFace: https://huggingface.co/xiaomi-research/Xiaomi-OCR-0
- MLX (framework de Apple): https://github.com/ml-explore/mlx
- mlx-vlm: no disponible en la información proporcionada
- mlx-swift-lm: no disponible en la información proporcionada
- Paper, blog o demo oficial: no disponible en la información proporcionada
