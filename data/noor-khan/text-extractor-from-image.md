# Noor-Khan/text-extractor-from-image

## Resumen

`Noor-Khan/text-extractor-from-image` es un repositorio de Hugging Face que empaqueta una tubería clásica de OCR basada en Tesseract, no un modelo de aprendizaje profundo entrenado. El autor, Noorullah Zamindar, extrae la lógica OCR de su aplicación Flask original y de su cuaderno de Jupyter y la publica como módulo Python reutilizable (`ocr_extractor.py`) que puede ejecutarse sin servidor web. No hay pesos, no hay datos de entrenamiento y no hay arquitectura neuronal: el "modelo" es el motor Tesseract 5.x con los datos de idioma `eng`.

El problema que resuelve es acotado pero real: convertir imágenes de texto impreso en cadenas de texto desde Python, con la opción de aplicar preprocesado (escala de grises, eliminación de ruido con mediana, umbralización de Otsu y corrección de inclinación) para escaneos ruidosos o rotados. Incluye además utilidades para obtener cajas delimitadoras y confidencias a nivel de palabra mediante `pytesseract.image_to_data`.

Su relevancia actual es limitada como "modelo" en el sentido habitual del blog: no compite con modelos visión-lenguaje, no tiene benchmarks de MMLU ni HumanEval, y su repo ocupa 0.0 GB porque solo contiene código y unas pocas imágenes de muestra. Resulta útil como referencia reproducible de una tubería OCR clásica con métricas de error medidas (CER/WER) sobre cinco muestras concretas, y como ejemplo de empaquetado limpio de lógica OCR existente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica: tubería OCR clásica sobre Tesseract 5.3.4 (sin red neuronal propia) |
| Parámetros totales | No disponible (no hay pesos entrenados en el repo) |
| Parámetros activos | No aplica |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No aplica |
| Idiomas soportados | Inglés únicamente (`-l eng` por defecto) |
| Licencia | No disponible |
| Formato de pesos | No aplica (código Python; depende del binario del sistema `tesseract-ocr`) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni entrenamiento. El repositorio contiene una envoltura en Python sobre Tesseract OCR, el motor de reconocimiento óptico de caracteres de código abierto basado en el algoritmo LSTM de Tesseract 4/5. La llamada principal es `pytesseract.image_to_string` con la configuración `-l eng --oem 3 --psm 6`, tomada directamente del cuaderno original. El modo OEM 3 selecciona el motor LSTM por defecto y el PSM 6 asume un bloque de texto uniforme.

El preprocesado opcional, también heredado del cuaderno, aplica escala de grises, filtro de mediana para ruido, umbralización de Otsu y corrección de inclinación mediante OpenCV. La evaluación incluida (`evaluate.py`) reproduce las métricas publicadas: CER y WER con espacios colapsados, sensibles a mayúsculas y conservando puntuación, sobre cinco imágenes de muestra (dos del repo original, una versión reducida a 300×150 y dos renders sintéticos con verdad de referencia conocida).

## Capacidades

- Extracción de texto de imágenes de texto impreso en inglés mediante Tesseract.
- Preprocesado opcional para escaneos ruidosos: escala de grises, eliminación de ruido con mediana, umbralización de Otsu y corrección de inclinación (deskew).
- Obtención de datos a nivel de palabra: texto, confianza (`conf`) y cajas delimitadoras mediante `word_data`.
- Resaltado de palabras que coinciden con un patrón, tal como demuestra el cuaderno.
- Interfaz de línea de comandos (`python ocr_extractor.py imagen.png`) y API de biblioteca (`extract_text`, `extract_text_preprocessed`, `word_data`).
- No soporta tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.
- No soporta otros idiomas sin instalar los datos de idioma correspondientes de Tesseract y cambiar el parámetro `lang`.

## Casos de uso

- Digitalización de documentos impresos escaneados en inglés: el módulo lee imágenes de texto limpio con CER 0.0000 en las muestras del repo, adecuado para digitalizar facturas, contratos o páginas de libro con maquetación sencilla.
- Procesamiento por lotes de capturas de pantalla: para extraer texto de capturas de interfaz o terminal, la configuración por defecto (`--psm 6`) funciona bien sobre bloques de texto uniformes sin preprocesado.
- Filtrado por confianza en pipelines de datos: usando `word_data` y el campo `conf`, se pueden descartar palabras de baja confianza en lugar de aceptar todas las salidas de Tesseract, tal como advierte la model card.
- Limpieza de escaneos ruidosos o rotados: con `--preprocess --deskew` se puede intentar recuperar documentos con ruido o inclinación, aunque la propia evaluación muestra que el preprocesado degrada imágenes limpias.
- Automatización de extracción en scripts y servicios: al ser un módulo sin servidor web, se puede invocar desde un cron, un job de CI o una función serverless que tenga Tesseract instalado en el sistema.
- Referencia reproducible para evaluar OCR: `evaluate.py` y `metrics.json` permiten reproducir CER y WER sobre las cinco muestras y comparar con otras configuraciones de Tesseract o preprocesados alternativos.

## Benchmarks y rendimiento

Resultados medidos el 17 de noviembre de 2026 con Tesseract 5.3.4 sobre las muestras del repo. CER = tasa de error de caracteres, WER = tasa de error de palabras; menor es mejor, 0.0000 es perfecto.

| Muestra | CER por defecto | WER por defecto | CER preprocesado | WER preprocesado |
|---|---|---|---|---|
| text_styles (676×371) | 0.0000 | 0.0000 | 0.1059 | 0.2222 |
| text_styles_small (300×150) | 0.0000 | 0.0000 | 0.6118 | 1.0741 |
| dickens (700×440) | 0.0278 | 0.0417 | 0.0278 | 0.0417 |
| synthetic_clean | 0.0000 | 0.0000 | 0.0132 | 0.0833 |
| synthetic_rotated (3°) | 0.0000 | 0.0000 | 0.0199 | 0.0833 |

Observaciones de la model card: el módulo reproduce exactamente la salida impresa del cuaderno sobre su entrada original de 300×150; en la muestra de Dickens los únicos errores son los puntos suspensivos finales (24 palabras reconocidas, 3 caracteres extra); la imagen sintética rotada 3° se lee perfectamente sin corrección de inclinación. No hay benchmarks de MMLU, HumanEval, GSM8K ni comparaciones con modelos de lenguaje.

## Requisitos de hardware

- VRAM estimada: no aplica, no hay pesos de modelo; Tesseract es un binario de CPU.
- GPU recomendadas: no aplica; la tubería se ejecuta en CPU.
- Cabe en cualquier máquina con CPU y Tesseract instalado; no requiere GPU de consumo.
- Dependencias del sistema: `tesseract-ocr` (en Debian/Ubuntu, `sudo apt install tesseract-ocr`) y los datos de idioma `eng`; dependencias Python: `pytesseract`, `opencv-python-headless`, `numpy`, `Pillow` (en `requirements.txt`).
- Opciones de despliegue: ejecución directa como script (`python ocr_extractor.py imagen.png`), importación como biblioteca Python o integración en un servicio propio; no es compatible con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de pesos.
- Latencia y throughput: no disponibles; dependen del tamaño de la imagen y de la CPU, no se publican cifras.

## Comparativa con modelos similares

| Criterio | text-extractor-from-image (Tesseract) | EasyOCR | PaddleOCR | DocTR |
|---|---|---|---|---|
| Tipo | OCR clásico (LSTM de Tesseract) | OCR con redes neuronales | OCR con redes neuronales | OCR con redes neuronales |
| Pesos incluidos en el repo | No | Sí (descarga aparte) | Sí (descarga aparte) | Sí (descarga aparte) |
| Idiomas | Inglés (`-l eng`) | Multilingüe | Multilingüe | Multilingüe |
| Licencia | No disponible | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha |
| Datos de benchmark en esta ficha | CER/WER sobre 5 muestras | No disponible | No disponible | No disponible |

La comparativa se limita a características estructurales porque no se dispone de datos de benchmark de las alternativas en la información proporcionada; no se han medido CER/WER comparativos.

## Limitaciones y advertencias

- El preprocesado puede empeorar imágenes limpias: en las muestras limpias, escala de grises + ruido + Otsu elevó el CER a 0.1059 en text_styles y a 0.6118 en la imagen de 300×150. Usar el modo por defecto en imágenes limpias y el preprocesado solo en escaneos genuinamente ruidosos.
- Solo inglés: la configuración es `-l eng`; otros idiomas requieren instalar los datos de idioma de Tesseract y cambiar `lang`.
- Solo texto impreso: la escritura manual, el texto muy pequeño y las fotos de bajo contraste o muy inclinadas se leen mal o no se leen; Tesseract no tiene comprensión de maquetación.
- No se aplica umbral de confianza: `extract_text` devuelve todo lo que produce Tesseract, incluidas conjeturas erróneas en imágenes borrosas; usar `word_data` y filtrar por `conf` si se necesita descartar palabras poco fiables.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; verificar antes de producción.
- Riesgo de alucinación en el sentido de OCR: Tesseract puede producir texto plausible pero incorrecto en entradas de baja calidad, sin señal de error salvo la confianza por palabra.
- Sesgos: no aplica en el sentido de sesgos de modelo de lenguaje; el rendimiento depende de la tipografía, el idioma y la calidad de la imagen.
- Las muestras del repo son un texto de dominio público y el inicio de *A Tale of Two Cities*; no contienen datos personales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Noor-Khan/text-extractor-from-image
- Proyecto original (aplicación Flask y cuaderno): https://github.com/NoorullahZamindar-007/Text-Extractor-From-Image
- Tesseract OCR (motor subyacente): no disponible en la información proporcionada
- Documentación de pytesseract: no disponible en la información proporcionada
