# Lucasgitguy-co/Xiaomi-OCR-0-Mirage-MLX

## Resumen

Xiaomi-OCR-0-Mirage-MLX es una cuantización de 6 bits en formato MLX del modelo Xiaomi-OCR-0, publicado por el usuario Lucasgitguy-co. El modelo base, desarrollado por Xiaomi Research sobre la arquitectura Qwen3.5-0.8B, es un modelo multimodal de tipo image-text-to-text especializado en OCR y parseo de documentos. Esta versión añade un script (`mirage_ocr.py`) que integra el detector de texto Mirage de Cactus Compute para asociar cajas delimitadoras a las líneas de texto reconocidas.

El modelo resuelve tareas de extracción de texto en imágenes y documentos: conversión a Markdown, tablas en formato OTSL, fórmulas en LaTeX, extracción de información clave (KIE) y respuesta a preguntas sobre imágenes. Con 852.985.920 parámetros, está pensado para ejecutarse en Apple Silicon mediante la librería MLX, lo que lo hace útil para flujos de OCR locales en equipos de sobremesa y portátiles Mac sin GPU dedicada.

Su relevancia actual radica en que ofrece una alternativa ligera y de licencia Apache-2.0 para pipelines de digitalización de documentos, con una pérdida de calidad mínima respecto al modelo BF16 original (OCRBench 846 frente a 843) y un tamaño de repo de 1,5 GB que facilita el despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (base Qwen3.5-0.8B) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits (group size 64) y 4 bits (directorio `4bit/`) |
| Idiomas soportados | no disponible (Mirage lee solo escritura latina) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), GGUF disponible en repo separado |

## Arquitectura y entrenamiento

El modelo base Xiaomi-OCR-0 se construye sobre Qwen3.5-0.8B, un transformer multimodal que procesa imágenes y texto para generar respuestas en formato texto. Esta versión concreta es una cuantización de 6 bits realizada con `mlx_vlm.convert` (group size 64), que produce un total de 833.276.908 bytes. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

La innovación destacable de esta publicación es la integración de Mirage, un detector y lector de texto de 54 millones de parámetros de Cactus Compute (Apache-2.0) que se ejecuta de forma adyacente al modelo, no fusionada. Mirage aporta cajas delimitadoras en coordenadas 0-1000 para cada línea de salida cuando se usa `--json`, con un umbral de coincidencia difusa de 70; el texto siempre lo genera Xiaomi-OCR-0. Se probó también una función de zoom (recorte y reescalado de regiones con texto) sobre las 1000 preguntas de OCRBench, pero empeoró el resultado global (843 a 802), por lo que está desactivada por defecto. El autor documenta que intentó destilación tipo DWQ para las escalas de cuantización de 4 bits, pero solo superó a la cuantización simple en 1 de 3 benchmarks y la ejecución de 6 bits divergió, por lo que todas las versiones publicadas son cuantizaciones simples.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes y documentos, con salida en Markdown.
- Parseo de documentos con tablas en formato OTSL y fórmulas en LaTeX (`--task doc`).
- Extracción de texto plano (`--task text`).
- Extracción de información clave (KIE) guiada por un esquema JSON (`--task kie --schema schema.json`).
- Respuesta a preguntas sobre imágenes (`--task ask --question "..."`).
- Generación de cajas delimitadoras por línea de texto en coordenadas 0-1000 mediante Mirage (`--json`).
- Conversación multi-turno en el pipeline image-text-to-text.
- Capacidad de ejecución sin Mirage (`--no-mirage`) para usar solo Xiaomi-OCR-0.
- No se documentan capacidades de tool calling, agentes, audio ni modo thinking.

## Casos de uso

- Digitalización de facturas y recibos: el modelo puede procesar imágenes de recibos y extraer campos estructurados con el esquema CORD, con un F1 de 77,67 en la versión de 6 bits, adecuado para automatizar la contabilidad de pequeños negocios en local.
- Conversión de documentos escaneados a Markdown: con `--task doc` genera Markdown con tablas en OTSL y fórmulas en LaTeX, útil para migrar archivos PDF o imágenes a wikis internas o repositorios de documentación.
- Extracción de información clave (KIE) en formularios: mediante un esquema JSON propio, se pueden definir los campos a extraer de contratos, albaranes o partes médicos, lo que permite integrar el modelo en pipelines de ingestión de datos.
- Preguntas y respuestas sobre capturas de pantalla o figuras: con `--task ask`, un investigador puede consultar el contenido textual de una gráfica o captura sin transcribirla manualmente.
- Procesamiento por lotes en equipos Apple Silicon: al ejecutarse con MLX, se puede desplegar en un Mac Studio o MacBook para tareas de OCR continuadas sin depender de servicios en la nube, con un peso de menos de 1 GB en 6 bits.
- Anotación de datos para entrenamiento de modelos de visión: la salida `--json` con cajas delimitadoras permite generar datasets de detección de texto a partir de imágenes no etiquetadas, usando Mirage para las coordenadas y Xiaomi-OCR-0 para el contenido.
- Verificación de calidad en digitalización masiva: la diferencia de edit distance de 0,0844 frente a 0,0829 del BF16 permite usar la versión cuantizada como paso de pre-validación antes de una revisión humana.

## Benchmarks y rendimiento

| Version | Bytes | OCRBench (/1000) | doc NED (menor mejor) | CORD F1 |
|---|---:|---:|---:|---:|
| MLX BF16 (referencia) | 1.726.071.379 | 843 | 0,0829 | 77,55 |
| transformers BF16 (original) | 1.766.940.039 | 843 | 0,0823 | 78,18 |
| MLX 6-bit simple (esta version) | 833.276.908 | 846 | 0,0844 | 77,67 |
| MLX 4-bit simple | 645.303.148 | 836 | 0,0877 | 77,23 |
| MLX 4-bit DWQ | 645.299.748 | 831 | 0,0888 | 78,58 |
| GGUF Q8_0 + mmproj Q8_0 | 949.514.976 | 847 | 0,0836 | 78,10 |
| GGUF Q6_K + mmproj F16 | 851.526.880 | 842 | 0,0823 | 77,70 |
| GGUF Q4_K_M + mmproj F16 | 746.889.952 | 841 | 0,0912 | 75,63 |
| MLX BF16 + Mirage zoom | 1.726.071.379 | 802 | 0,0829 | 77,55 |

El autor señala que OCRBench con n=1000 tiene un error estándar de aproximadamente ±1,2 puntos, por lo que diferencias de pocas preguntas son ruido. La similitud de salida respecto al BF16 es del 93 % en OCRBench, 75 % en documentos y 65 % en CORD para la versión de 6 bits.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB para la versión de 6 bits (833 MB de pesos) y unos 645 MB para la de 4 bits; el BF16 de referencia ocupa 1,73 GB.
- GPU recomendadas: no aplica GPU dedicada; el modelo está diseñado para Apple Silicon mediante MLX (chips M1, M2, M3, M4 y variantes Pro/Max/Ultra).
- Cabe en cualquier Mac con Apple Silicon, incluidos modelos con 8 GB de memoria unificada.
- Opciones de despliegue: `mlx-vlm==0.8.0` junto con `cactus-compute==4.2.0` para el script `mirage_ocr.py`; existe una versión GGUF para llama.cpp en un repositorio separado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | OCRBench | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Xiaomi-OCR-0-Mirage-MLX (6 bits) | 852.985.920 | no disponible | 846 | Apache-2.0 | MLX en HF |
| Xiaomi-OCR-0 (BF16 original) | no disponible | no disponible | 843 | Apache-2.0 | transformers en HF |
| Xiaomi-OCR-0-Mirage-GGUF (Q8_0) | no disponible | no disponible | 847 | Apache-2.0 | GGUF en HF |
| Mirage (Cactus Compute) | 54.000.000 | no disponible | no disponible | Apache-2.0 | Solo motor cactus-compute |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Mirage solo lee escritura latina y no detectó texto en 163 de 1000 imágenes de OCRBench que sí contenían texto, por lo que nunca se usa para decidir que una imagen está vacía.
- La función de zoom empeora el rendimiento global (843 a 802 en OCRBench) y está desactivada por defecto.
- La similitud de salida con el BF16 cae al 65 % en CORD para la versión de 6 bits, lo que implica variabilidad en la extracción de campos estructurados.
- Los pesos de Mirage no están incluidos en el repositorio; `mirage_ocr.py` los descarga desde `Cactus-Compute/mirage` en una revisión fijada.
- El paquete `cactus-compute` envía recuentos de uso anónimos salvo que se defina `CACTUS_TELEMETRY=0`; el script lo desactiva por defecto.
- El forward pass y el código de entrenamiento de Mirage no son públicos, por lo que no se puede fusionar, destilar ni convertir junto con Xiaomi-OCR-0.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni restricciones de uso comercial más allá de la licencia Apache-2.0.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026, por lo que carece de validación comunitaria.
- La fecha de creación indicada (2026) es futura respecto a la fecha habitual de consulta; conviene verificar la vigencia del repositorio.

## Enlaces

- Hugging Face (esta versión MLX): https://huggingface.co/Lucasgitguy-co/Xiaomi-OCR-0-Mirage-MLX
- Hugging Face (versión BF16 transformers): https://huggingface.co/Lucasgitguy-co/Xiaomi-OCR-0-Mirage
- Hugging Face (versión GGUF llama.cpp): https://huggingface.co/Lucasgitguy-co/Xiaomi-OCR-0-Mirage-GGUF
- Modelo base Xiaomi-OCR-0: https://huggingface.co/xiaomi-research/Xiaomi-OCR-0
- Mirage (Cactus Compute): https://huggingface.co/Cactus-Compute/mirage
