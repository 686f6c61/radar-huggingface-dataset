# litert-community/Unlimited-OCR-2

## Resumen

Unlimited-OCR-2 es un modelo de visión-lenguaje especializado en el análisis y extracción de contenido de documentos, desarrollado originalmente por Baidu (publicado el 27 de octubre de 2026). Esta ficha corresponde a la conversión a LiteRT-LM realizada por la comunidad litert-community, pensada para ejecución en dispositivos (on-device) como smartphones y portátiles. El modelo combina un codificador visual DeepEncoder (SAM ViT-B + CLIP-L con proyector, 401M parámetros) con un decodificador de texto de 12 capas basado en DeepSeek-V2 (2,9B parámetros), dando un total de 3,3B parámetros.

La relevancia de esta versión radica en su formato `.litertlm` de 3,81 GB con cuantización int8 en las capas lineales del decodificador, que permite ejecutar OCR de documentos completos en hardware móvil sin conexión a la nube. En un Galaxy S26 procesa una página en 19-25 s por CPU, y en un iPhone 18 Pro en unos 11 s. En macOS con GPU alcanza 98-99 tok/s frente a 55-56 tok/s en CPU.

El modelo escribe cada página como una secuencia de bloques de maquetación, cada uno con etiqueta (`title`, `text`, `table`, `equation`, etc.), caja delimitadora y contenido (tablas en HTML, fórmulas en LaTeX). Soporta contenido multilingüe y está liberado bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language: DeepEncoder (SAM ViT-B + CLIP-L + proyector) + decodificador DeepSeek-V2 (MoE) con atención DASH block-sparse |
| Parametros totales | 3,3B (401M vision encoder + 2,9B text decoder) |
| Parametros activos | 6 expertos enrutados de 64 + 2 compartidos por token, en 11 capas MoE (primera capa densa) |
| Longitud de contexto | 4.096 tokens (prompt de página ocupa 279; respuesta hasta 3.817 tokens) |
| Tipos de cuantizacion | int8 en capas lineales del decodificador y tabla de embeddings; fp16 en encoder visual y proyector; router DASH y tabla de posiciones en float; activaciones fp32 declaradas para GPU |
| Idiomas soportados | Multilingüe |
| Licencia | MIT |
| Formato de pesos | `.litertlm` (LiteRT-LM 0.19.0) |
| Tamano del fichero | 3,81 GB (`Unlimited-OCR-2_int8.litertlm`) |
| Resolucion de entrada | 1.024 × 1.024 (273 tokens de imagen por vista) |
| Paginas por peticion | 1 (la versión original soporta multipágina; esta conversión, una página por petición) |

## Arquitectura y entrenamiento

La arquitectura combina un codificador visual DeepEncoder compuesto por SAM ViT-B y CLIP-L con un proyector que transforma la imagen en 273 tokens visuales a resolución 1.024 × 1.024. El decodificador de texto es un transformer de 12 capas basado en DeepSeek-V2: la primera capa es densa y las 11 restantes son capas de mezcla de expertos (MoE) con 64 expertos enrutados (6 activos por token) y 2 compartidos. Incorpora DASH, un mecanismo de atención block-sparse en el que un router selecciona, para cada consulta, 12 bloques de 32 posiciones a los que atender.

La conversión a LiteRT-LM se realizó con la herramienta `hf-to-litertlm` sobre la versión 0.19.0 del runtime de Google. No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en el modelo original de Baidu. La innovación destacable de esta versión es la cuantización int8 del decodificador manteniendo el router DASH en coma flotante, lo que preserva la precisión del enrutamiento de atención mientras reduce el peso a 3,81 GB.

## Capacidades

- Análisis de documentos con salida estructurada por bloques: cada bloque incluye etiqueta (`title`, `text`, `table`, `equation`, etc.), caja delimitadora y contenido.
- Reconocimiento de tablas con salida en HTML.
- Reconocimiento de fórmulas matemáticas con salida en LaTeX.
- Procesamiento de imágenes de documentos, fotografías de recibos, formularios y páginas con ecuaciones densas.
- Soporte multilingüe en la extracción de texto.
- Ejecución on-device sin conexión (CPU o GPU según plataforma).
- No dispone de prompt libre: la plantilla del fichero fija la instrucción `Multi page parsing.` y la marca `<PAGE>`.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Digitalización de facturas y recibos en movilidad: la aplicación captura la foto, aplica orientación EXIF y centra la página en un cuadrado gris antes de la inferencia; el modelo devuelve los bloques con etiquetas y cajas, adecuado para extraer importes y líneas de detalle en un dispositivo Android o iOS sin conexión.
- Extracción de tablas de informes financieros: la salida HTML de los bloques `table` permite reconstruir la estructura tabular y volcarla a una hoja de cálculo o base de datos, con la ventaja de que el procesamiento ocurre localmente y no expone datos sensibles.
- Conversión de artículos científicos a Markdown/LaTeX: los bloques `equation` devuelven las fórmulas en LaTeX, lo que facilita la reutilización en publicaciones o repositorios, con un rendimiento de 98-99 tok/s en Mac con GPU.
- Procesamiento por lotes de formularios administrativos: la ejecución por CPU en Android (19-25 s por página en Galaxy S26) permite integrar el modelo en una app de escaneo que procese documentos en segundo plano.
- Accesibilidad: lectura en voz alta de documentos impresos aplicando OCR local en un iPhone 18 Pro (unos 11 s por página en CPU), sin enviar imágenes a servidores externos.
- Archivado documental con etiquetado de maquetación: el modelo clasifica cada bloque (`title`, `text`, etc.) y su posición, lo que permite indexar documentos por estructura y no solo por texto plano.
- Digitalización de apuntes con fórmulas: útil en entornos educativos donde se capturan páginas manuscritas o impresas con ecuaciones y se requiere salida LaTeX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son mediciones de latencia y throughput del autor de la conversión:

| Plataforma | Backend | Latencia por pagina | Throughput | Pruebas superadas (de 19) |
|---|---|---|---|---|
| Galaxy S26 | CPU | 19-25 s | no disponible | no disponible |
| Galaxy S26 | GPU (decoder) | 25-31 s | no disponible | no disponible |
| iPhone 18 Pro | CPU | ~11 s | no disponible | 18 (falló foto de formulario) |
| iPhone 18 Pro | GPU (Metal) | no disponible | no disponible | 18 (falló foto de recibo) |
| Mac | GPU | no disponible | 98-99 tok/s | 18 |
| Mac | CPU | no disponible | 55-56 tok/s | 17 |

## Requisitos de hardware

- VRAM/RAM estimada: el fichero pesa 3,81 GB; en Mac la caché del runtime ocupa unos 4,4 GB (CPU) o 2,8 GB (GPU) junto al modelo. En Galaxy S26 con decodificador y encoder en GPU la memoria disponible cayó a 0,82 GiB y el proceso se detuvo.
- GPU recomendadas: en Mac se recomienda GPU (98-99 tok/s frente a 55-56 tok/s en CPU). En Android e iPhone se recomienda CPU por velocidad y consumo de memoria.
- Cabe en hardware de consumo: sí, en smartphones de gama alta (Galaxy S26, iPhone 18 Pro) y en Mac. En un Pixel 8a (8 GB) no se pudo ejecutar una compilación anterior a velocidad usable.
- Opciones de despliegue: runtime LiteRT-LM 0.19.0 con el script `ocr_unlimited.py`; parámetros `--backend gpu`, `--vision-backend cpu`, `--max-tokens`, `--cache-dir` y `--no-cache`.
- Latencia: 11 s por página en iPhone 18 Pro (CPU), 19-25 s en Galaxy S26 (CPU). La primera petición es más lenta por la escritura de caché del runtime.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/Despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Unlimited-OCR-2 (LiteRT-LM) | 3,3B (MoE) | 4.096 tokens | `.litertlm`, on-device | MIT | Una página por petición, 1.024×1.024 |
| baidu/Unlimited-OCR-2 (original) | 3,3B (MoE) | no disponible | safetensors (presumiblemente) | no disponible | Soporta multipágina por petición |
| Otros modelos OCR/VLM de tamaños similares | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Una sola página por petición: la versión original soporta multipágina, pero esta conversión procesa una vista de 1.024 × 1.024 por solicitud.
- Sin prompt libre: la plantilla fija la instrucción `Multi page parsing.`; no se puede personalizar la tarea.
- Redimensionado sin preservar relación de aspecto: LiteRT-LM escala toda imagen a 1.024 × 1.024 e ignora la orientación EXIF; es necesario aplicar el padding con el script para evitar deformaciones.
- Diferencias de precisión entre backends: en iPhone la GPU falló la foto de recibo y la CPU la de formulario; en Galaxy S26 con encoder en CPU y decodificador en GPU se perdieron la foto de recibo y la página de ecuaciones densas.
- Consumo de memoria en móvil: ejecutar encoder y decodificador en GPU puede agotar la memoria disponible (0,82 GiB en Galaxy S26).
- Rendimiento no viable en gama media-baja: no se pudo ejecutar en Pixel 8a (8 GB) a velocidad usable.
- Riesgo de alucinación en contenido visual denso o de baja calidad: no se documentan métricas de fidelidad más allá de las 19 pruebas cualitativas del autor.
- Sesgos: no se documentan sesgos específicos en la información disponible.
- Licencia MIT: permite uso comercial, pero se recomienda verificar la licencia del modelo base de Baidu antes de su explotación en producción.
- Caché del runtime: la primera ejecución escribe archivos de caché de varios GB (4,4 GB en CPU, 2,8 GB en GPU en Mac), lo que afecta al almacenamiento disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Unlimited-OCR-2
- Modelo base original: https://huggingface.co/baidu/Unlimited-OCR-2
- Repositorio de conversión `hf-to-litertlm`: https://github.com/john-rocky/hf-to-litertlm
- Script de inferencia `ocr_unlimited.py`: https://github.com/john-rocky/hf-to-litertlm/blob/main/unlimitedocr2_work/ocr_unlimited.py
- Runtime LiteRT-LM de Google: https://github.com/google-ai-edge/LiteRT-LM
