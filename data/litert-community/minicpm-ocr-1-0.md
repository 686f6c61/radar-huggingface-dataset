# litert-community/MiniCPM-OCR-1.0

## Resumen

MiniCPM-OCR-1.0 es un modelo de visión-lenguaje especializado en reconocimiento óptico de caracteres (OCR) y análisis de documentos, desarrollado por OpenBMB y publicado el 21 de octubre de 2026. Se construye sobre MiniCPM-V 4.6 y está diseñado específicamente para leer texto, tablas, fórmulas matemáticas, sellos y gráficos, además de extraer campos con nombre de documentos estructurados. El modelo combina un codificador visual de 27 capas con un decodificador de texto híbrido de estilo Qwen3.5 que alterna 18 capas GatedDeltaNet con 6 capas de atención, sumando 1.3B parámetros totales.

La ficha que nos ocupa, `litert-community/MiniCPM-OCR-1.0`, es una conversión del modelo original al formato LiteRT-LM (`.litertlm`) realizada por la comunidad litert-community mediante la herramienta `hf-to-litertlm`. Está pensada para inferencia en dispositivo (on-device) en teléfonos y equipos de borde, con pesos cuantizados a int8 y fp16 según el fichero. Es relevante ahora porque demuestra que un OCR de documentos con capacidades de tabla y fórmula puede ejecutarse íntegramente en la CPU de un móvil de gama alta en torno a 10 segundos por región de texto, sin depender de la nube.

La licencia es Apache 2.0, lo que facilita su integración en productos comerciales, y el modelo soporta inglés y chino. El repositorio ocupa 7.2 GB e incluye dos variantes de pesos con distintos compromisos de memoria y velocidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language: codificador visual de 27 capas + decodificador de texto híbrido (18 capas GatedDeltaNet + 6 capas de atención, estilo Qwen3.5) |
| Parametros totales | 1.3B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa 256 tokens de imagen por recorte de 448×448; hasta 10 imágenes por mensaje) |
| Tipos de cuantizacion | int8 dinámico por canal (decodificador y encoder visual), fp16 (encoder visual en una variante), fp32 (activaciones y proyecciones decay/gate de GatedDeltaNet) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); dos ficheros: `VL_int8` (2.00 GB) y `VL_int8vis` (1.59 GB) |

## Arquitectura y entrenamiento

El modelo original, `openbmb/MiniCPM-OCR-1.0`, se entrena sobre MiniCPM-V 4.6 y consta de un codificador visual de 27 capas y un decodificador de texto híbrido que combina 18 capas GatedDeltaNet con 6 capas de atención convencional, un diseño de estilo Qwen3.5. Cada imagen de 448×448 se tokeniza en 256 tokens visuales; las imágenes mayores se dividen en una vista general más hasta 9 recortes (máximo 10 imágenes por mensaje), un esquema de teselado pensado para documentos de página completa.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La conversión a LiteRT-LM se realizó con `hf-to-litertlm` para las versiones 0.18.1 y 0.19.0 del runtime de Google. En la variante `VL_int8`, el decodificador se cuantiza a int8 dinámico por canal, salvo las 36 proyecciones decay/gate de GatedDeltaNet que permanecen en float; la tabla de embeddings es int8, y el encoder visual y el adaptador visual son fp16. En la variante `VL_int8vis`, el encoder visual también pasa a int8 dinámico, reduciendo el tamaño de 2.00 GB a 1.59 GB.

## Capacidades

- Reconocimiento de texto en imágenes: lectura de líneas, párrafos y regiones de texto.
- Reconocimiento de tablas: extracción de estructura tabular mediante el prompt `Table Recognition:`.
- Reconocimiento de fórmulas: salida en LaTeX, incluidas expresiones como `\frac{n (n + 1) (2 n + 1)}{6}`.
- Reconocimiento de sellos y gráficos.
- Extracción de campos con nombre (named field extraction) mediante prompts con formato JSON, por ejemplo `store_name`, `date` y `total` en un recibo.
- Procesamiento de páginas completas mediante teselado: vista general más hasta 9 recortes, con el parámetro `slice_cols` para indicar el número de columnas de la rejilla.
- Soporte de conversación multimodal vía `litert-lm` (mensajes con múltiples imágenes adjuntas).
- Capacidades multilingües limitadas a inglés y chino.
- No se documenta soporte de tool calling, function calling ni modo de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Digitalización de recibos y facturas en aplicaciones móviles: el modelo extrae campos concretos (`store_name`, `date`, `total`) en JSON a partir de una foto, con inferencia local en CPU que evita enviar documentos financieros a un servidor.
- Escaneo de documentos de página completa en el móvil: con el esquema de vista general más recortes y `slice_cols`, se procesa una página A4 en 25–26 s en un Galaxy S26 y en 74–75 s en un Pixel 8a, adecuado para flujos de captura diferida.
- Extracción de tablas para hojas de cálculo: el prompt `Table Recognition:` devuelve la estructura de la tabla, útil en herramientas de contabilidad o inventario que necesitan convertir capturas en datos tabulares.
- Conversión de fórmulas matemáticas a LaTeX: digitalización de apuntes, libros de texto o artículos científicos, con la advertencia de que la variante `VL_int8vis` puede introducir espacios extra en el LaTeX (misma expresión, distinto espaciado).
- Procesamiento de documentos con sellos y gráficos: verificación de documentos oficiales o contractuales que incluyen sellos, en un pipeline completamente local.
- Aplicaciones de accesibilidad: lectura en voz alta de texto impreso capturado con la cámara del teléfono, con latencia de unos 10 s por región en hardware de gama alta.
- Digitalización en lote en equipos de borde sin GPU: al ejecutarse en CPU con un consumo máximo declarado de 2.9 GB, puede desplegarse en dispositivos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta únicamente mediciones de latencia y corrección en pruebas propias:

| Escenario | Dispositivo | Configuración | Región 448×448 | Página A4 |
|---|---|---|---|---|
| `VL_int8vis`, CPU | Galaxy S26 | decoder + vision en CPU | 10 s | 25–26 s |
| `VL_int8vis`, CPU | Pixel 8a | decoder + vision en CPU | 24–25 s | 74–75 s |
| `VL_int8`, CPU | Pixel 8a | decoder en CPU | 32 s | 88 s (vision en GPU) |
| `VL_int8vis`, CPU | Mac | decoder + vision en CPU | 12.9 s | 22.2 s (con `VL_int8` y vision en GPU: 20.0 s) |
| `VL_int8`, vision en GPU | Pixel 8a | vision en GPU | 36 s (2.0 GB) | no disponible |

En la prueba de corrección declarada, la variante `VL_int8vis` leyó correctamente las diez regiones de test con respuesta conocida. La única desviación fue un espaciado extra en una fórmula LaTeX.

## Requisitos de hardware

- Memoria: máximo declarado de 2.9 GB para `VL_int8vis` en CPU; `VL_int8` con encoder visual en GPU consume 2.0 GB por región en Pixel 8a, y 2.3 GB con `VL_int8vis`.
- Cabe en teléfonos de gama alta: Galaxy S26 y Pixel 8a son los dispositivos de referencia medidos.
- Cabe en Mac para inferencia en CPU o con encoder visual en GPU.
- No se documentan requisitos para GPU de servidor (A100, H100, RTX 4090); el formato `.litertlm` está orientado a LiteRT-LM en dispositivo.
- Despliegue mediante el runtime `litert-lm` (versiones 0.18.1 y 0.19.0), con CLI (`litert-lm run`) y API de Python (`litert_lm.Engine`).
- Backends configurables: `--backend gpu`, `--vision-backend gpu` y `--cache-dir` para separar las cachés del fichero del modelo.
- Latencia: 10 s por región y 25–26 s por página A4 en Galaxy S26; 24–25 s y 74–75 s respectivamente en Pixel 8a, con `VL_int8vis` en CPU.
- Throughput no disponible más allá de las latencias por petición reportadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| MiniCPM-OCR-1.0 (LiteRT-LM) | 1.3B | no disponible | en, zh | Apache 2.0 | `.litertlm`, on-device |
| openbmb/MiniCPM-OCR-1.0 (original) | 1.3B | no disponible | en, zh | Apache 2.0 | pesos originales (no detallado) |
| Alternativas OCR de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se documenta soporte de castellano ni de otras lenguas.
- El runtime redimensiona cada imagen a 448×448 sin mantener la relación de aspecto y sin aplicar la orientación EXIF, por lo que el preprocesado (relleno a cuadrado blanco, teselado de páginas) debe hacerse externamente.
- La variante `VL_int8vis` puede devolver LaTeX con espaciado distinto al original; si el espaciado exacto es crítico, debe usarse `VL_int8`.
- El encoder visual de `VL_int8vis` debe mantenerse en CPU: en la GPU del Mac con directorio de caché respondió `[Non-Text]` (problema de runtime conocido).
- Riesgo de alucinación no cuantificado en la información disponible; la model card no reporta tasas de error más allá de la prueba de diez regiones.
- Sesgos conocidos no documentados.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y condiciones del modelo base `openbmb/MiniCPM-OCR-1.0`.
- El repositorio tiene un volumen de adopción bajo (610 descargas, 1 like en el momento de la consulta), lo que implica menor validación comunitaria.
- Dependencia de versiones concretas del runtime `litert-lm` (0.18.1 y 0.19.0); cambios de versión pueden alterar el comportamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/MiniCPM-OCR-1.0
- Modelo base: https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- Herramienta de conversión `hf-to-litertlm`: https://github.com/john-rocky/hf-to-litertlm
- Script de ejemplo `ocr_page.py`: https://github.com/john-rocky/hf-to-litertlm/blob/main/minicpmocr_work/ocr_page.py
- Runtime LiteRT-LM de Google: https://github.com/google-ai-edge/LiteRT-LM
