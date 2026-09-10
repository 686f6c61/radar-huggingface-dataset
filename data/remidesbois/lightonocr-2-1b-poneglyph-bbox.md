# Remidesbois/LightonOCR-2-1b-poneglyph-bbox

## Resumen

Remidesbois/LightonOCR-2-1b-poneglyph-bbox es un modelo de visión y lenguaje (image-text-to-text) creado por Remidesbois mediante ajuste fino (fine-tune) del modelo base `lightonai/LightOnOCR-2-1B-bbox-base`. Está especializado en el reconocimiento óptico de caracteres (OCR) de páginas completas de manga en francés, con detección simultánea de las zonas de texto mediante cajas delimitadoras (bounding boxes). El caso de uso original es el dataset «Poneglyph», inspirado en el manga One Piece, pero el modelo sirve como ejemplo práctico de OCR estructurado para cómics.

El modelo recibe únicamente una imagen y genera una línea por zona de texto con la transcripción literal y las coordenadas normalizadas entre 0 y 1000. Es una arquitectura de tipo vision-language model con alrededor de 1.005 millones de parámetros (1B). Aunque el autor no publica la longitud de contexto, el modelo está diseñado para procesar imágenes de hasta 1.500 píxeles en el lado mayor y generar hasta 1.280 tokens. La licencia es Apache 2.0, lo que permite su uso comercial y su redistribución. La relevancia actual radica en la creciente demanda de OCR especializado en cómics y manga con salida estructurada, útil para traducción, reedicción e indexación automática.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language Model (LightOnOCR-2) |
| Parametros totales | 1.005.647.872 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | francés (texto extraído en francés, orientado a manga) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del modelo base `lightonai/LightOnOCR-2-1B-bbox-base` publicado por LightOnAI. Pertenece a la familia LightOnOCR, de la que no se detalla en la información disponible el diseño interno completo (número de capas, tipo de atención, etc.). Por los nombres de los módulos sobre los que se aplica LoRA (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) se puede inferir que usa mecanismos de atención estándar en bloques transformadores. Incorpora ademas un módulo de proyección de visión (`vision_projection`) que actúa como puente entre el codificador visual y el modelo de lenguaje.

El entrenamiento se realizó en una NVIDIA GeForce RTX 5090 de 32 GB durante 3 épocas, con 291 pasos de optimizador, learning rate `1e-5`, scheduler coseno con 15 pasos de warmup, optimizador fused AdamW y weight decay `0.01`. Se utilizó precisión BF16 + TF32 con batches físicos de 1 y gradiente acumulado de 8 (batch efectivo de 8). Se aplicó rsLoRA con r=128, alpha=256 y dropout=0 sobre los proyectos de atención y de las capas MLP en visión y lenguaje, y se entrenó completamente el puente `vision_projection`. Los parámetros entrenables fueron 159.384.576, un 13,68% del total, y el pico de VRAM durante la calibración fue de 26,68 GiB. Los adaptadores LoRA se fusionaron en los pesos finales publicados.

El dataset «Poneglyph» consta de 1.107 páginas completas de manga validadas por humanos y 9.890 zonas de texto anotadas. Se dividió en entrenamiento (775 páginas, 6.962 zonas), validación (111 páginas, 1.008 zonas) y prueba (221 páginas, 1.920 zonas). Las imágenes se normalizan a un lado mayor de 1.500 píxeles manteniendo la relación de aspecto, y las cajas delimitadoras se normalizan a [0,1000]. El modelo está entrenado para preservar el orden de lectura japonés/manga y para no producir JSON, Markdown, prefijos ni comentarios; solo texto plano seguido de las coordenadas.

## Capacidades

- Extracción de texto de páginas completas de manga, generando una línea por zona de texto con el formato `Texto exacto [x1,y1,x2,y2]`.
- Coordenadas enteras normalizadas a [0,1000] en el sistema de referencia de la imagen.
- Preservación del orden de lectura japonés/manga en la secuencia de salida.
- Entrada solo de imagen, sin necesidad de prompt textual adicional; el conditioning se realiza directamente con el contenido visual.
- Salida sin JSON, Markdown ni metadatos, lo que facilita el parseo posterior en pipelines.
- Funcionamiento con `transformers` mediante `LightOnOcrProcessor` y `LightOnOcrForConditionalGeneration`.
- Compatibilidad con generación autónoma: `model.generate()` con `do_sample=False` para decodificación determinista.
- Etiquetado como conversacional en el registro de HuggingFace, aunque el uso recomendado no incluye prompts de texto.

## Casos de uso

- Digitalización de colecciones de manga: el modelo puede procesar escaneos de páginas completas y devolver texto y posiciones de burbujas, lo que permite reconstruir el contenido editorial en formato texto plano para reeditores o archivos digitales.
- Localización y traducción asistida: al extraer el texto de cada burbuja con sus coordenadas, un equipo de traducción puede sustituir el texto original en francés por un nuevo idioma manteniendo la geometría exacta de cada zona, acelerando el trabajo de maquetación.
- Accesibilidad para lectores con discapacidad visual: mediante la generación de texto y cajas, se puede alimentar un lector de pantalla que narre el diálogo de la página y la posición de las burbujas, mejorando la experiencia de lectura de cómics.
- Indexación y búsqueda en bibliotecas de manga: el texto extraído puede usarse para crear bases de datos de frases y hacer búsquedas de contenido semántico o literal en grandes colecciones de obras.
- Automatización de fan-subs o scanlation: el modelo permite extraer automáticamente los diálogos de páginas escaneadas y sus cajas, reduciendo el tiempo de preparación para posteriores traducciones o re-escaneos.
- Verificación de calidad en reimpresiones: comparar el texto OCR con el texto esperado de una edición original para detectar errores de escaneo, recorte o degradación de las letras.
- Investigación en minería de textos de cómics: usado en estudios de estilos de diálogo o análisis narrativos, el modelo puede convertir páginas completas en datos estructurados (texto + geometría) listos para análisis estadístico.

## Benchmarks y rendimiento

El autor presenta una evaluación final sobre el conjunto de prueba hold-out de 221 páginas y 1.920 zonas anotadas. El modelo generó 1.903 zonas (99,11% del número de zonas GT). Las métricas globales corregidas son las siguientes:

| Metrica | Valor |
|---|---|
| Corrected combined score | 0.8257 |
| Page CER, macro | 5.61% |
| Page CER, character-weighted | 4.48% |
| Global mean IoU | 65.00% |
| F1 @ IoU 0.3, micro | 91.29% |
| F1 @ IoU 0.5, micro | 79.62% |
| Precision @ IoU 0.5, micro | 79.98% |
| Recall @ IoU 0.5, micro | 79.27% |
| F1 @ IoU 0.75, micro | 41.75% |
| F1 @ IoU 0.9, micro | 4.71% |
| Exact bubble text | 90.63% |
| Bubble-text CER, character-weighted | 1.15% |
| Average generation time | 6.18 s/page |

El “corrected combined score” se calcula como `0.4 * (1 - Page_CER_macro) + 0.3 * F1@0.5_micro + 0.2 * Global_Mean_IoU + 0.1 * Recall@0.5_micro`, obteniendo 0.8257147803. El autor indica que existen metadatos adicionales en `benchmark_lighton_bbox.json` y `benchmark_lighton_bbox_corrected.json` dentro del repositorio para reproducibilidad. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 2 GB, pero el procesamiento de imágenes de 1.500 píxeles y la generación de hasta 1.280 tokens requieren memoria adicional para activaciones. En la práctica se puede ejecutar en una GPU de consumo con 8 GB o más de VRAM. El pico de VRAM reportado durante la calibración fue de 26,68 GiB, pero corresponde al proceso de entrenamiento.
- GPU recomendadas: NVIDIA GeForce RTX 3090, RTX 4090, RTX 5090 o cualquier GPU moderna con capacidad de cómputo BF16 y al menos 8 GB de VRAM. El entrenamiento se realizó en una RTX 5090 de 32 GB.
- Compatibilidad con GPUs de consumo: sí, modelos como RTX 3060 Ti (8 GB), RTX 4070 (12 GB) o similares pueden ejecutar inferencia si se usa BF16 o una cuantización posterior.
- Opciones de despliegue: `transformers` (PyTorch) de forma nativa, modelos servidos mediante Hugging Face Inference Endpoints (el tag `endpoints_compatible` está presente). No se documenta integración con vLLM, TGI ni Ollama.
- Latencia: el benchmark reporta un tiempo medio de generación de 6,18 segundos por página en la GPU de evaluación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks | Licencia |
|---|---|---|---|---|
| lightonai/LightOnOCR-2-1B-bbox-base | 1 B (aprox.) | no disponible | no disponible | Apache 2.0 |
| Remidesbois/LightonOCR-2-1b-poneglyph-bbox | 1.005.647.872 | no disponible | Ver tabla de benchmarks (test Poneglyph) | Apache 2.0 |

El modelo base `lightonai/LightOnOCR-2-1B-bbox-base` es la versión sin ajuste fino; el autor no publica benchmarks para la versión base en la información proporcionada. No se dispone de comparativas con modelos OCR genéricos (Tesseract, PaddleOCR, TrOCR, Donut) ni con otros modelos de visión-lenguaje del mismo tamaño.

## Limitaciones y advertencias

- Especialización estrecha: el modelo fue entrenado únicamente con páginas de manga del dataset Poneglyph (One Piece). Su rendimiento fuera de este estilo (documentos, facturas, pantallas, cómics de otros trazos) no está garantizado.
- Idioma único: la salida de texto produce transcripciones en francés. El modelo no está entrenado para transcribir directamente el japonés original ni para devolver texto en otros idiomas.
- Dependencia del procesado de imagen: las imágenes se normalizan a 1.500 píxeles en el lado mayor; texto muy pequeño o fondos complejos pueden degradar el OCR y las cajas delimitadoras.
- Métricas no estándar: los benchmarks provienen de un conjunto de prueba propio del autor, no de competidores ni de evaluaciones públicas comparables. Los resultados pueden no replicarse en otros dominios.
- Riesgo de alucinación: si la imagen es ambigua, borrosa o de baja calidad, el modelo puede generar texto inventado o cajas que no corresponden a zonas reales.
- Restricciones del dataset: aunque la licencia del modelo es Apache 2.0, no se especifica la licencia del dataset Poneglyph; es necesario verificar la licencia de los datos antes de cualquier uso comercial.
- Adopción reducida: el repositorio tiene 18 descargas y 0 likes en el momento de la extracción de datos, lo que indica falta de validación por parte de la comunidad y posibles problemas no reportados.
- Formato de salida rígido: el modelo no produce JSON ni estructuras jerárquicas; cualquier cambio en el formato solicitado requeriría un nuevo ajuste fino.

## Enlaces

- Modelo en HuggingFace: [https://huggingface.co/Remidesbois/LightonOCR-2-1b-poneglyph-bbox](https://huggingface.co/Remidesbois/LightonOCR-2-1b-poneglyph-bbox)
- Modelo base: [https://huggingface.co/lightonai/LightOnOCR-2-1B-bbox-base](https://huggingface.co/lightonai/LightOnOCR-2-1B-bbox-base)
- Paper arxiv: [https://arxiv.org/abs/2601.14251](https://arxiv.org/abs/2601.14251)
- Archivos de métricas del benchmark: `benchmark_lighton_bbox.json` y `benchmark_lighton_bbox_corrected.json` (incluidos en el repositorio del modelo)
