# Reza2kn/Bina-0.4-Rizeh

## Resumen

Bina 0.4 Rizeh es un sistema OCR completo para persa (farsi) publicado por Reza2kn, orientado a la lectura de páginas enteras: texto impreso, manuscrito, formularios, capturas de pantalla, cartas, periódicos y matemáticas sencillas. No es un único transformer monolítico, sino una tubería de varias etapas empaquetada como repositorio reproducible: detección de layout con Surya, detección de líneas con detectores afinados sobre la arquitectura de Surya, reconocimiento CTC y un módulo de ensamblado que ordena filas y columnas.

El núcleo declarado son unos 71,2 millones de parámetros según los pesos en safetensors: un detector de líneas de 38,5 M (fine-tune del detector de texto de Surya) y un reconocedor CTC de 32,8 M destilado de Bina 0.4 Koochik (modelo de 630,8 M derivado de NVIDIA Nemotron-3.5-Parse). La innovación práctica es la destilación hacia un reconocedor pequeño y rápido que mantiene un rendimiento competitivo en texto impreso persa, con CER de 1,76 % en 338 líneas impresas y 3,97 % en cuerpo manuscrito.

Es relevante ahora porque cubre un hueco poco atendido: OCR persa de página completa con manuscrito y formularios, con licencia no comercial y pesos abiertos. Su utilidad en producción queda condicionada por la licencia (CC BY-NC 4.0 más la licencia de Surya) y por limitaciones explícitas en manuscritos históricos y tablas densas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tubería multi-etapa: layout Surya + detectores de línea (arquitectura Surya) + reconocedor CTC + ensamblado de página |
| Parametros totales | 71.244.603 (38,5 M detector de líneas + 32,8 M reconocedor + 0,39 M cabecera de texto impreso) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo CTC por línea, sin ventana de contexto autoregresiva) |
| Tipos de cuantizacion | No disponible en la información proporcionada |
| Idiomas soportados | Persa (fa); lectura parcial de texto y dígitos latinos |
| Licencia | CC BY-NC 4.0 para pesos y código del reconocedor; pesos del detector y layout bajo licencia de Surya (limita uso comercial) |
| Formato de pesos | safetensors (model.safetensors con recognizer.* y line_detector.*), ONNX, joblib; pipeline completo en stallion/ |

## Arquitectura y entrenamiento

La tubería se organiza en cuatro fases. Primero, layout con `datalab-to/surya_layout2` (revisión fijada, descargada en la primera ejecución). Segundo, detección de líneas con detectores de arquitectura Surya afinados para cuerpo de texto, capa impresa y ruta de manuscrito. Tercero, reconocimiento con un CTC Indra de 32.796.250 parámetros, 20 bloques y vocabulario de 1.617 símbolos, entrenado 95.000 pasos y destilado desde Bina 0.4 Koochik (checkpoint 18.404); junto a él operan lectores especialistas de la misma arquitectura para etiquetas impresas, celdas de formulario, numérico/matemático y escaneos degradados. Cuarto, ensamblado con consolidación de filas, ordenación de columnas y tablas, admisión de etiquetas impresas y ordenación a nivel de página.

Los datos de entrenamiento provienen de los datasets `Reza2kn/persian-handwriting-pages-3.69m` y `Reza2kn/persian-printed-ocr-3.5m`. La selección de checkpoints usó únicamente conjuntos internos de desarrollo; las puertas de evaluación publicadas no se emplearon para elegir pesos. El repositorio incluye todos los pesos, calibraciones y código, con `MANIFEST.json` que lista cada fichero con su ubicación y tamaño originales. No se documenta uso de RLHF ni DPO; el entrenamiento es supervisado con destilación.

## Capacidades

- Lectura de páginas completas en persa con salida en orden de lectura (`.txt`) y JSON por línea con texto, caja, capa (`printed`, handwriting, body) y confianza.
- OCR de texto impreso, manuscrito, formularios, capturas de pantalla, cartas, periódicos y matemáticas sencillas.
- Procesamiento por lotes de imágenes y PDF (renderizado a 200 dpi).
- Lectores especialistas para etiquetas impresas, celdas cortas de formulario, contenido numérico/matemático y escaneos degradados.
- Detección de layout y de líneas con modelos de la familia Surya.
- Lectura parcial de texto y dígitos latinos, aunque el objetivo es persa.
- Uso desde línea de comandos (`rizeh.py`) y desde Python mediante la clase `Rizeh`.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso; es un modelo image-to-text puro.

## Casos de uso

- Digitalización de archivos administrativos persas: la tubería procesa cartas oficiales escaneadas con CER de 2,12 % en la puerta de carta oficial escaneada, adecuada para extraer texto y metadatos de expedientes.
- Extracción de datos de formularios: los lectores especialistas de etiquetas impresas y celdas cortas logran CER de 3,80 % en formularios, lo que permite poblar bases de datos desde documentos cumplimentados.
- Procesamiento de capturas de pantalla y documentación técnica: CER de 4,65 % en capturas, útil para indexar manuales o interfaces en persa.
- Transcripción de manuscrito moderno: CER de 3,97 % en cuerpo manuscrito de 50 páginas, aplicable a cuadernos y notas contemporáneas, no a manuscritos históricos.
- Digitalización de prensa y boletines: con CER de 13,49 % en periódicos, sirve para búsqueda aproximada y archivado, no para transcripción literal.
- Automatización de ingesta documental por lotes: el script acepta múltiples imágenes y PDF y genera texto y JSON estructurado por página, integrable en pipelines de digitalización.
- Extracción de expresiones matemáticas simples: el lector numérico/matemático (CER de 12,09 % en la puerta de matemáticas) permite recuperar operaciones y cifras en documentos educativos.

## Benchmarks y rendimiento

Tasa de error de carácter (CER, %) en las puertas internas de la versión publicada; menor es mejor.

| Puerta | CER |
|---|---:|
| 193 regiones recortadas, global | 9,39 |
| · formularios | 3,80 |
| · capturas de pantalla | 4,65 |
| · prosa | 9,15 |
| · matemáticas | 12,09 |
| · periódico | 13,49 |
| · tablas | 19,63 |
| 50 páginas manuscritas, solo cuerpo manuscrito | 3,97 |
| 50 páginas manuscritas, página completa con texto impreso de formulario | 10,89 |
| 338 líneas impresas | 1,76 |
| 7 documentos escaneados reales (regiones impresas) | 10,61 |
| Carta oficial escaneada | 2,12 |

Comparativa en el espacio Persian OCR Triple Threat (mismo reconocedor de 95k pasos, medido el 2026-11-03 antes de los ajustes finales de ensamblado; menor es mejor):

| Split | Filas | WER | CER | S³ | Triple Threat |
|---|---:|---:|---:|---:|---:|
| Impreso | 6.669 | 4,70 | 1,37 | 5,88 | 4,74 |
| Manuscrito | 6.669 | 18,48 | 13,01 | 15,19 | 15,41 |
| Global con split equitativo | 13.338 | 11,59 | 7,19 | 10,54 | 10,08 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 71,2 M de parámetros en FP32 el conjunto de pesos ronda los 285 MB, por lo que la carga en GPU es muy ligera y el cuello de botella real es el modelo de layout Surya descargado aparte.
- GPU recomendadas: NVIDIA GPU recomendada por el autor (Python 3.10); no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU consumer con suficiente memoria para el layout de Surya, aunque no se publican cifras de VRAM ni pruebas por modelo.
- Opciones de despliegue: ejecución mediante `rizeh.py` (CLI) o la clase `Rizeh` en Python con dispositivo `cuda`; pesos del núcleo en safetensors reutilizables para fine-tuning. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Bina 0.4 Rizeh | 71,2 M (núcleo) | No aplica (CTC por línea) | OCR persa de página completa con pipeline | CC BY-NC 4.0 + licencia Surya | Hugging Face, pipeline completo |
| Bina 0.4 Koochik | 630,8 M | No disponible | OCR image-to-text derivado de Nemotron-3.5-Parse con backbone C-RADIOv4-SO400M y decoder autorregresivo | No disponible en la información | Hugging Face |
| Bina 0.4 Koochik CoreML INT4 | 630,8 M | No disponible | Derivado 4-bit GPTQ (grupo 32, escalas FP32) para CoreML | No disponible en la información | Hugging Face |

## Limitaciones y advertencias

- Manuscritos históricos no soportados: en HPHD (nastaliq y shekasteh históricos) el CER alcanza el 67 % incluso con recortes de línea oracle, y las páginas completas producen texto fluido pero incorrecto.
- Tablas débiles, en torno al 20 % de CER, especialmente densas o de baja resolución con escritura sobre las celdas.
- El orden de lectura en layouts complejos (periódicos a varias columnas, exámenes con muchas etiquetas) es la mayor fuente de error restante: los caracteres suelen ser correctos pero las líneas pueden salir desordenadas.
- Las etiquetas impresas tenues o coloreadas (nastaliq azul claro en formularios) se pierden con frecuencia.
- La tubería está ajustada de forma conjunta: sustituir un componente sin reajustar las etapas posteriores empeora los resultados, según medición del autor.
- Enfoque persa: el texto y dígitos latinos se leen, pero otros idiomas no fueron objetivo.
- Las confianzas son puntuaciones del modelo, no probabilidades calibradas.
- Licencia restrictiva: pesos y código del reconocedor bajo CC BY-NC 4.0 (datos de entrenamiento no comerciales) y pesos de detección/layout bajo licencia de Surya, que limita el uso comercial. Verificar antes de cualquier despliegue productivo.
- Riesgo de alucinación textual en documentos fuera de dominio, especialmente manuscritos históricos, donde genera texto plausible pero falso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Reza2kn/Bina-0.4-Rizeh
- Modelo base de destilación: https://huggingface.co/Reza2kn/Bina-0.4-Koochik
- Derivado CoreML INT4: https://huggingface.co/Reza2kn/Bina-0.4-Koochik-CoreML-INT4
- Demo Persian OCR Triple Threat: https://huggingface.co/spaces/Reza2kn/PersianOCR-TripleThreat
- Dataset de manuscrito persa: https://huggingface.co/datasets/Reza2kn/persian-handwriting-pages-3.69m
- Dataset de OCR impreso persa: https://huggingface.co/datasets/Reza2kn/persian-printed-ocr-3.5m
- Licencia de Surya (datalab): https://github.com/datalab-to/surya
