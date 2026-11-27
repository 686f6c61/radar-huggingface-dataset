# litert-community/MiniCPM-OCR-1.0

## Resumen

MiniCPM-OCR-1.0 es un modelo de visión-lenguaje especializado en reconocimiento óptico de caracteres (OCR) y análisis de documentos, desarrollado por OpenBMB y publicado originalmente el 21 de octubre de 2026. El modelo parte de MiniCPM-V 4.6 y añade un entrenamiento específico para leer texto, tablas, fórmulas matemáticas, sellos y gráficos, además de extraer campos con nombre de documentos estructurados. La versión que nos ocupa, `litert-community/MiniCPM-OCR-1.0`, es una conversión comunitaria del modelo original al formato LiteRT-LM (`.litertlm`) realizada con la herramienta `hf-to-litertlm`, pensada para su ejecución en dispositivos móviles y de borde (edge) mediante el runtime LiteRT-LM de Google (versiones 0.18.1 y 0.19.0).

La relevancia de esta conversión radica en que demuestra que un modelo de OCR multimodal de 1.3B parámetros puede ejecutarse íntegramente en un teléfono móvil de gama alta con latencias aceptables: en un Galaxy S26 procesa una región de texto de 448×448 píxeles en unos 10 segundos por petición (incluyendo la creación del motor) y una página A4 completa en 25–26 segundos, todo sobre CPU. En un Pixel 8a las cifras suben a 24–25 segundos por región y 74–75 segundos por página, con un pico de memoria de 2,9 GB.

El repositorio ofrece dos variantes de cuantización (con el codificador visual en fp16 o en int8) y un script de referencia (`ocr_page.py`) que gestiona el troceado de páginas grandes en una vista general más hasta 9 recortes, replicando el esquema de parcheo con el que se entrenó el modelo original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language: codificador visual de 27 capas + decodificador de texto híbrido estilo Qwen3.5 (18 capas GatedDeltaNet + 6 capas de atención) |
| Parametros totales | 1.3B (según model card del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinámico por canal en el decodificador de texto (las 36 proyecciones decay/gate de GatedDeltaNet permanecen en float), tabla de embeddings int8, codificador visual fp16 o int8 dinámico, adaptador visual fp16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); dos ficheros: `MiniCPM-OCR-1.0-VL_int8.litertlm` (2,00 GB) y `MiniCPM-OCR-1.0-VL_int8vis.litertlm` (1,59 GB) |

## Arquitectura y entrenamiento

El modelo combina un codificador visual de 27 capas con un decodificador de texto híbrido inspirado en Qwen3.5, compuesto por 18 capas GatedDeltaNet (atención lineal con estado recurrente) y 6 capas de atención convencional. Esta mezcla busca reducir el coste computacional del decodificador manteniendo capacidad de modelado, algo especialmente relevante en despliegues sobre CPU móvil. Cada imagen de 448×448 píxeles se tokeniza en 256 tokens visuales; las imágenes mayores se procesan como una vista general más hasta 9 recortes (máximo 10 imágenes por consulta), con el número de columnas de la rejilla indicado al modelo mediante el valor de contexto extra `slice_cols`.

El modelo base fue entrenado por OpenBMB sobre MiniCPM-V 4.6 con datos específicos de OCR y parsing de documentos: texto, tablas, fórmulas LaTeX, sellos y gráficos, además de extracción de campos con nombre. La model card de esta conversión no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; esos datos corresponden a la model card del modelo original y no se incluyen en la información disponible. La conversión a LiteRT-LM no reentrena pesos: aplica cuantización int8 dinámica por canal al decodificador y a la tabla de embeddings, y ofrece dos variantes según la precisión del codificador visual (fp16 o int8).

## Capacidades

- Reconocimiento de texto (OCR) sobre regiones de imagen: líneas, párrafos y bloques de texto.
- Reconocimiento de tablas, con prompts específicos como `Table Recognition:`.
- Reconocimiento de fórmulas matemáticas y salida en LaTeX.
- Detección y lectura de sellos y gráficos.
- Extracción de campos con nombre (por ejemplo, `store_name`, `date`, `total` de un recibo) con formato de salida controlable mediante prompt, incluido JSON.
- Procesamiento de páginas completas mediante vista general más hasta 9 recortes, con el esquema de parcheo con el que fue entrenado.
- Procesamiento de imágenes en el dispositivo (on-device), sin conexión a servicios externos.
- Soporte multilingüe limitado a inglés y chino.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Digitalización de recibos y facturas en aplicaciones móviles: el modelo extrae campos concretos (`store_name`, `date`, `total`) directamente en el dispositivo con un prompt que fija el formato JSON de salida, evitando enviar documentos financieros a un servidor.
- Escaneo de documentos en movilidad sin conexión: con `VL_int8vis` sobre CPU, un Galaxy S26 procesa una página A4 en 25–26 segundos, lo que permite digitalizar documentos en entornos sin red (obra, campo, aviación).
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de texto impreso capturado con la cámara del teléfono, con latencias de 10 segundos por región en hardware de gama alta.
- Extracción de tablas de informes y artículos: el prompt `Table Recognition:` produce la estructura tabular de la imagen, útil para pipelines de ingestión documental en los que el documento no sale del dispositivo.
- Conversión de fórmulas manuscritas o impresas a LaTeX: adecuado para aplicaciones educativas y de investigación que necesitan reutilizar fórmulas en editores científicos, teniendo en cuenta que la variante `VL_int8vis` puede introducir espacios adicionales en el LaTeX generado.
- Procesamiento por lotes en el borde (edge): el modelo cabe en 2,9 GB de memoria como máximo, por lo que puede integrarse en dispositivos con recursos limitados para preprocesar documentos antes de enviar solo el texto extraído a un sistema central.
- Verificación documental en kioscos o terminales de autoservicio: lectura de sellos y campos de documentos de identidad o justificantes en el propio terminal, con la licencia Apache 2.0 permitiendo su integración en productos comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí reporta mediciones de latencia y memoria en hardware concreto:

| Dispositivo | Configuración | Región 448×448 | Página A4 | Memoria máxima |
|---|---|---|---|---|
| Galaxy S26 | `VL_int8vis`, decoder y visión en CPU | 10 s | 25–26 s | 2,9 GB |
| Galaxy S26 | siguiente configuración más rápida | 11 s | 34 s | no disponible |
| Pixel 8a | `VL_int8vis`, decoder y visión en CPU | 24–25 s | 74–75 s | no disponible |
| Pixel 8a | `VL_int8`, visión en GPU | 32 s (CPU) / 36 s (GPU) | 88 s | 2,0 GB (visión en GPU) / 2,3 GB (visión en CPU) |
| Mac | `VL_int8vis`, CPU (región) | 12,9 s | — | no disponible |
| Mac | `VL_int8`, CPU (región) | 14,7 s | — | no disponible |
| Mac | `VL_int8`, visión en GPU (página) | — | 20,0 s | no disponible |
| Mac | `VL_int8vis`, visión en CPU (página) | — | 22,2 s | no disponible |

En la prueba de corrección del 29 de octubre de 2026, la variante `VL_int8vis` leyó correctamente las diez regiones de test con respuesta conocida, con una única discrepancia de espaciado en una fórmula LaTeX (`\frac{n (n + 1) (2 n + 1)}{6}`, mismo contenido matemático).

## Requisitos de hardware

- VRAM/memoria estimada: entre 1,59 GB (tamaño del fichero `VL_int8vis`) y 2,9 GB de pico en ejecución en un Galaxy S26; en Pixel 8a con visión en GPU, 2,0 GB por región.
- GPU recomendadas: no se especifican modelos de GPU de escritorio; el modelo está orientado a CPU móvil (Galaxy S26, Pixel 8a) y a la GPU integrada de un Mac. El runtime permite colocar el decodificador y/o el codificador visual en GPU con `--backend gpu` y `--vision-backend gpu`.
- Cabe en GPU de consumo: no hay datos publicados sobre RTX 4090, A100 o H100 en la información disponible; el diseño apunta a ejecución en CPU de teléfono.
- Opciones de despliegue: runtime LiteRT-LM 0.18.1 y 0.19.0 (CLI `litert-lm run` y API Python `litert_lm.Engine`), junto con el script `ocr_page.py` (Pillow + litert-lm) para el troceado de páginas. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 10 s por región de 448×448 en Galaxy S26 (incluida la creación del motor), 25–26 s por página A4; 24–25 s y 74–75 s respectivamente en Pixel 8a; 12,9–14,7 s por región en Mac. No se publica throughput en tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo de referencia estructural, el propio modelo base `openbmb/MiniCPM-OCR-1.0` es la alternativa directa en formato de pesos convencional (no LiteRT-LM), y `MiniCPM-V 4.6` es el modelo generalista sobre el que se construye este OCR especializado.

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| litert-community/MiniCPM-OCR-1.0 | 1,3B | no disponible | `.litertlm` | Apache 2.0 | OCR on-device |
| openbmb/MiniCPM-OCR-1.0 | 1,3B | no disponible | no disponible en esta información | Apache 2.0 | OCR (modelo base) |
| MiniCPM-V 4.6 | no disponible | no disponible | no disponible | no disponible | Visión-lenguaje generalista |

## Limitaciones y advertencias

- Idiomas: solo inglés y chino; no se garantiza un rendimiento correcto en castellano u otras lenguas.
- Preprocesado obligatorio: el runtime redimensiona cada imagen a 448×448 sin mantener la relación de aspecto y sin aplicar la orientación EXIF, por lo que es responsabilidad del integrador centrar y rellenar las regiones sobre un cuadrado blanco antes de la inferencia.
- Páginas grandes: requieren el esquema de vista general más hasta 9 recortes (máximo 10 imágenes) y el valor `slice_cols`; un uso incorrecto de este esquema degrada la calidad de la extracción.
- Fórmulas: la variante `VL_int8vis` puede introducir espacios adicionales en el LaTeX respecto al modelo original; si el espaciado exacto es crítico, debe usarse `VL_int8`.
- Codificador visual en GPU: con `VL_int8vis` y el codificador visual en la GPU del Mac con directorio de caché, el modelo respondió `[Non-Text]`; se recomienda mantener ese codificador en CPU para esa variante.
- Alucinación: no se documentan tasas de error ni evaluaciones sistemáticas de alucinación; en extracción de campos, el prompt de ejemplo indica usar `"###"` cuando un campo no está en la imagen, lo que sugiere que el modelo puede inventar valores si no se le instruye lo contrario.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero la conversión es comunitaria y no está avalada por OpenBMB; conviene verificar la licencia y los términos del modelo base antes de un despliegue en producción.
- Memoria: el pico de 2,9 GB en Galaxy S26 puede ser prohibitivo en dispositivos de gama media o baja.

## Enlaces

- Repositorio Hugging Face de la conversión: https://huggingface.co/litert-community/MiniCPM-OCR-1.0
- Modelo base en Hugging Face: https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- Herramienta de conversión hf-to-litertlm: https://github.com/john-rocky/hf-to-litertlm
- Script de referencia para páginas: https://github.com/john-rocky/hf-to-litertlm/blob/main/minicpmocr_work/ocr_page.py
- Runtime LiteRT-LM de Google: https://github.com/google-ai-edge/LiteRT-LM
