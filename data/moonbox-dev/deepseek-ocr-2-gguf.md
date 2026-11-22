# moonbox-dev/DeepSeek-OCR-2-GGUF

## Resumen

DeepSeek-OCR-2-GGUF es la distribución en formato GGUF del modelo DeepSeek-OCR-2, un sistema de visión-lenguaje especializado en extracción de texto y conversión de documentos a Markdown. El modelo original lo desarrolla DeepSeek AI; esta versión GGUF la publica el usuario moonbox-dev para su uso con llama.cpp en hardware de consumo, incluyendo aceleración por Metal, CUDA, Vulkan y CPU.

El modelo combina un decodificador de mezcla de expertos (MoE) de aproximadamente 2.930 millones de parámetros con un par de codificadores visuales (SAM y Qwen2) más un proyector multimodal, empaquetados en un fichero `mmproj` independiente. Esta separación permite descargar solo la precisión del decodificador que se ajuste a la memoria disponible, compartiendo el codificador entre todas ellas.

La relevancia actual radica en que ofrece capacidades de OCR de documentos con una huella de memoria muy reducida: la cuantización Q4_K_M ocupa 1,95 GB y mantiene una tasa de error de caracteres (CER) del 0,0 % en el conjunto de evaluación del autor, lo que la hace viable en portátiles con GPU modesta. La licencia Apache 2.0 facilita su integración en productos comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decodificador MoE (mixture-of-experts) con codificadores visuales SAM y Qwen2 y proyector multimodal |
| Parámetros totales | 2.934.734.080 (≈2,93 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible (la evaluación del autor cubre inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero de modelo + `mmproj-*.gguf` para el codificador) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de visión-lenguaje con un decodificador de mezcla de expertos de aproximadamente 3B parámetros y un conjunto de codificadores visuales compuesto por SAM y Qwen2, junto con un proyector que alinea las representaciones visuales con el espacio del decodificador. En llama.cpp, el decodificador y el codificador se distribuyen en dos ficheros separados: el GGUF del modelo y el `mmproj-deepseek-ocr-2-F16.gguf` (927,9 MB), que se mantiene siempre en F16 independientemente de la precisión elegida para el decodificador.

La conversión se realizó desde el checkpoint original de DeepSeek-OCR-2 (revisión `aaa02f3811`) con llama.cpp `b12621`, usando `convert_hf_to_gguf.py` para generar BF16 y el `mmproj`, y `llama-quantize` con sus mezclas estándar para el resto de precisiones. No se empleó matriz de importancia (importance matrix). El autor verificó que los 2.707 tensores del checkpoint original son byte-idénticos en el fichero BF16 y en el `mmproj`. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Extracción de texto (OCR) a partir de imágenes de páginas de documentos, con el prompt `Free OCR.`
- Conversión de documentos a Markdown estructurado mediante el prompt `<|grounding|>Convert the document to markdown.`
- Procesamiento de documentos en inglés y chino según el conjunto de evaluación del autor
- Capacidades de visión-lenguaje (pipeline `image-text-to-text`) heredadas del modelo base
- Soporte de conversación multi-turno (tag `conversational`)
- Compatibilidad con endpoints (tag `endpoints_compatible`)
- Ejecución en llama.cpp con soporte de Metal, CUDA, Vulkan y CPU
- No se dispone de información sobre tool calling, function calling, modo thinking, audio u otras capacidades especiales

## Casos de uso

- Digitalización de facturas y albaranes: el modelo extrae el texto de imágenes de documentos con una CER del 0,0 % en la evaluación del autor, lo que permite alimentar sistemas de contabilidad con datos estructurados a partir de fotografías o escaneos.
- Conversión de documentación técnica a Markdown: con el prompt de grounding, se puede transformar documentación en PDF o imagen a Markdown listo para wikis internas o repositorios, manteniendo la estructura del documento.
- Procesamiento por lotes en servidores sin GPU dedicada: la cuantización Q4_K_M (1,95 GB) permite ejecutar el modelo en CPU mediante llama.cpp, habilitando pipelines de OCR en entornos con recursos limitados.
- OCR en portátiles con GPU de consumo: con Q8_0 (3,13 GB) y CUDA, el autor reporta 4,93 s por página en una RTX 3080 Laptop, un rendimiento adecuado para digitalización personal o de pequeñas oficinas.
- Archivado y búsqueda de documentos históricos: la extracción de texto fiable permite indexar colecciones de documentos escaneados para búsqueda full-text, usando la precisión Q6_K (2,61 GB) como equilibrio entre tamaño y fidelidad.
- Aplicaciones de accesibilidad: conversión de documentos impresos a texto legible por lectores de pantalla, ejecutable localmente en el dispositivo del usuario sin enviar imágenes a servicios en la nube.
- Integración en flujos de trabajo con llama.cpp: al ser compatible con `llama-mtmd-cli`, puede incorporarse en scripts y herramientas existentes del ecosistema llama.cpp sin necesidad de infraestructura adicional.

## Benchmarks y rendimiento

El autor publica una evaluación propia sobre 12 páginas sintéticas (6 en inglés y 6 en chino) generadas con fuentes de Windows, con verdad de referencia exacta, usando el prompt `Free OCR.` y una ejecución por página en CUDA (RTX 3080 Laptop). Los tiempos incluyen la carga del modelo en cada ejecución.

| Precisión | Tamaño | CER (inglés/chino) | Texto idéntico a BF16 | Tiempo por página (CUDA) |
|---|---|---|---|---|
| F16 | 5,88 GB | 0,0 % / 0,0 % | 6 + 6 de 12 páginas | 6,77 s |
| BF16 | 5,88 GB | 0,0 % / 0,0 % | referencia | 6,87 s |
| Q8_0 | 3,13 GB | 0,0 % / 0,0 % | 6 + 6 de 12 páginas | 4,93 s |
| Q6_K | 2,61 GB | 0,0 % / 0,0 % | 6 + 6 de 12 páginas | 4,54 s |
| Q5_K_M | 2,22 GB | 0,0 % / 0,0 % | 6 + 6 de 12 páginas | 4,35 s |
| Q4_K_M | 1,95 GB | 0,0 % / 0,0 % | 5 + 6 de 12 páginas | 4,13 s |

El modelo original en BF16 obtuvo CER 0,0 % / 0,0 % en las 12 páginas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,9 GB con Q4_K_M (1,95 GB del modelo + 0,93 GB del `mmproj`), hasta aproximadamente 6,8 GB con F16/BF16.
- GPU recomendadas: cualquier GPU con al menos 3-4 GB de VRAM para cuantizaciones bajas; el autor reporta funcionamiento en una RTX 3080 Laptop (CUDA).
- Cabe en GPU de consumo: sí, desde GPUs de gama media-baja con 4 GB o más para Q4_K_M; con 8 GB o más se puede usar Q8_0 o F16.
- Opciones de despliegue: llama.cpp (`llama-mtmd-cli`) con soporte de Metal, CUDA, Vulkan y CPU; se requiere la versión `b12621` o superior.
- Latencia y throughput estimados: 4,13 s por página con Q4_K_M y 4,93 s con Q8_0 en una RTX 3080 Laptop (CUDA), incluyendo la carga del modelo en cada ejecución según la metodología del autor.
- Es necesario cargar ambos ficheros (modelo y `mmproj`); el `mmproj` se mantiene en F16 en todas las precisiones.
- Se recomienda usar los parámetros DRY indicados por el autor (`--dry-multiplier 0.8 --dry-base 1.75 --dry-allowed-length 2 --dry-penalty-last-n 64 --dry-sequence-breaker none`) para evitar bucles de repetición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-OCR-2 GGUF (esta ficha) | ≈2,93 B (MoE) | no disponible | Apache 2.0 | GGUF | Hugging Face, llama.cpp |
| DeepSeek-OCR-2 (original) | ≈2,93 B (MoE) | no disponible | Apache 2.0 | safetensors | Hugging Face |
| Alternativas de OCR de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo puede caer en bucles de repetición largos; el autor recomienda aplicar los parámetros DRY indicados para mitigarlo.
- La evaluación se limita a 12 páginas sintéticas en inglés y chino; no hay datos sobre otros idiomas ni sobre documentos reales con ruido, rotaciones o baja calidad.
- No se dispone de información sobre sesgos del modelo.
- Riesgo de alucinación inherente a los modelos de visión-lenguaje: puede generar texto no presente en la imagen, especialmente en documentos degradados.
- La licencia Apache 2.0 permite uso comercial, pero los ficheros son un derivado del modelo original y heredan su licencia; conviene revisar la model card original de DeepSeek-OCR-2.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una publicación reciente (22 de noviembre de 2026) sin validación comunitaria amplia.
- Requiere llama.cpp `b12621` o superior; versiones anteriores no soportan DeepSeek-OCR-2.
- La longitud de contexto no está documentada en la información disponible.
- No se dispone de información sobre el rendimiento en documentos de varias páginas o layouts complejos (tablas, formularios, multicolumna).

## Enlaces

- Repositorio GGUF: https://huggingface.co/moonbox-dev/DeepSeek-OCR-2-GGUF
- Modelo base original: https://huggingface.co/deepseek-ai/DeepSeek-OCR-2
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Página de DeepSeek AI: https://www.deepseek.com/
- Discord de DeepSeek AI: https://discord.gg/Tc7c45Zzu5
- Paper referenciado (arXiv 2601.20552): https://arxiv.org/abs/2601.20552
- Paper referenciado (arXiv 2510.18234): https://arxiv.org/abs/2510.18234
