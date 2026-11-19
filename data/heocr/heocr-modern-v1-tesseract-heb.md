# HeOCR/heocr-modern-v1-tesseract-heb

## Resumen

HeOCR modern-v1 es un modelo de reconocimiento de texto (OCR) para Tesseract 4/5 especializado en hebreo impreso moderno. Lo desarrolla HeOCR y se distribuye como un fichero `.traineddata` de 3,7 MB que sustituye al modelo `heb` estándar de tessdata_best. No es un modelo transformer ni un LLM: es una red LSTM con CTC que opera a nivel de línea, mientras que Tesseract se encarga del análisis de layout de página.

El modelo resuelve un problema concreto: el OCR de documentos de oficina en hebreo (cartas, formularios, tablas, secciones numeradas, impresos oficiales) donde el modelo `heb` de referencia comete errores notables en números y celdas de tabla. Se ha obtenido por fine-tuning del `heb` de tessdata_best sobre 255.143 líneas etiquetadas con texto de origen fiable (no con salida de OCR).

Es relevante por su enfoque de evaluación honesto: el autor declara explícitamente que no hay puntuación de test, solo resultados de desarrollo y tuning, y documenta tanto las ganancias como los costes del fine-tuning. Está pensado para integrarse en la pipeline de documentos `heocr` como paso OCR por defecto para impresión moderna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM con CTC a nivel de línea (motor de reconocimiento de Tesseract 4/5); el layout de página lo gestiona Tesseract |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (reconocimiento de línea, no modelo generativo) |
| Tipos de cuantizacion | no aplica; el formato `traineddata` es un contenedor binario propio de Tesseract |
| Idiomas soportados | hebreo (`he`) |
| Licencia | Apache-2.0, Copyright (c) 2026 HeOCR maintainers |
| Formato de pesos | Tesseract 4/5 LSTM `traineddata` (solo LSTM, `--oem 1`; sin motor legacy) |

Datos adicionales: fichero `heocr_modern_v1.traineddata` de 3.704.077 bytes, sha256 `6275943bf68f3d44ecc32f8d4c4195c890c96602111542ebe1f0ae0d8a6a5201`. Entrenado con Tesseract 5.5.3. Modelo base: `heb.traineddata` de tessdata_best en el commit `e12c65a` (Apache-2.0), sha256 `dbaa827aea6bc21215638447f17783a1004987c2d0bf5573d111fee397abdae5`. El conjunto de caracteres es el del modelo base, sin modificación.

## Arquitectura y entrenamiento

El modelo es una red LSTM con CTC que reconoce líneas de texto, integrada en el motor de Tesseract. No hay cambios de arquitectura respecto al modelo base: el fine-tuning se aplicó directamente sobre el `heb` de tessdata_best sin cirugía de capas, manteniendo el conjunto de caracteres original. Tesseract gestiona el análisis de layout y la segmentación en líneas; el modelo solo hace la transcripción de cada línea.

El entrenamiento consistió en una pasada sobre 255.143 líneas en una lista barajada con semilla 20261122 (`lists_v2/arm_a.list`). La composición es: 117.317 líneas sintéticas de documentos de oficina y celdas de tabla (46,0 %), renderizadas con 12 tipografías abiertas SIL OFL 1.1 y degradadas simulando escaneos, fotocopias y fotos de móvil; 44.951 líneas renderizadas desde PDFs nativos de boletines legislativos israelíes (Reshumot), etiquetadas con la capa de texto del editor; 34.217 líneas adicionales de esas mismas fuentes degradadas del mismo modo; y 58.658 líneas escaneadas reales de Reshumot, etiquetadas con el texto de la Open Law Book de Wikisource en hebreo. Ninguna etiqueta es salida de OCR. El snapshot seleccionado es `snap_0160m_222700` (identificado como office-print v0, arm A en los registros de experimentos).

## Capacidades

- Reconocimiento de texto impreso hebreo moderno a nivel de línea y de página (vía Tesseract).
- OCR de documentos de oficina: cartas, formularios, informes, licitaciones.
- Reconocimiento de tablas y celdas (mejora notable en CER de tablas escaneadas).
- Lectura de secciones numeradas y etiquetas de esquema (con caveats, ver limitaciones).
- Procesamiento de documentos escaneados, fotocopiados o fotografiados con degradación.
- Integración como paso OCR en la pipeline de documentos `heocr`.
- No soporta: escritura manual, escritura Rashi ni otras escrituras no cuadradas, niqqud (puntos vocálicos) ni cantilación.
- No soporta tool calling, agentes ni razonamiento multi-paso: no es un modelo generativo.

## Casos de uso

- Digitalización de archivos de oficina: procesar lotes de cartas, formularios e informes escaneados en hebreo sustituyendo `-l heb` por `-l heocr_modern_v1` en Tesseract, con mejora de CER en todos los conjuntos de líneas de impresión real medidos.
- Extracción de datos de tablas escaneadas: el modelo reduce el CER de tablas escaneadas del 1,58 % al 0,42 % dentro de `heocr`, lo que lo hace adecuado para pipelines de extracción tabular de documentos administrativos.
- Procesamiento de PDFs con capa de texto incorrecta: en PDFs escaneados bajo una capa de texto errónea (caso T4), baja el CER de página del 2,87 % al 1,04 % y los números perdidos del 20,0 % al 4,6 %, útil para re-OCR de documentos mal digitalizados.
- OCR de PDFs solo imagen: en documentos sin capa de texto (caso T5), reduce el CER del 4,22 % al 2,75 % y los números perdidos del 13,2 % al 4,0 %, adecuado para digitalización de fondos escaneados.
- Reconocimiento de líneas sueltas: con `--psm 7` puede usarse para transcribir imágenes de una sola línea impresa, útil en pipelines de recorte previo.
- Integración en la pipeline `heocr`: registrando el modelo con `heocr --download-model heocr_modern_v1`, se convierte en el OCR por defecto para impresión moderna dentro de esa herramienta.
- Procesamiento de impresos legislativos modernos: entrenado en parte con Reshumot, es adecuado para boletines y gacetas de impresión moderna (no para impresión antigua).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que todas las cifras de la model card proceden de conjuntos de desarrollo o tuning y que **no hay puntuación de test**.

Resultados de desarrollo declarados (CER de página dentro de `heocr`, con conjuntos sintéticos abiertos de HeOCR, frente a `heocr` con `heb` estándar):

| Conjunto | CER con `heb` estándar | CER con modern-v1 | Números perdidos con `heb` | Números perdidos con modern-v1 |
|---|---|---|---|---|
| PDFs escaneados bajo capa de texto errónea (T4) | 2,87 % | 1,04 % | 20,0 % | 4,6 % |
| PDFs solo imagen (T5) | 4,22 % | 2,75 % | 13,2 % | 4,0 % |
| Tablas escaneadas | 1,58 % | 0,42 % | no disponible | no disponible |

Otros datos declarados: en 12 conjuntos de líneas de impresión real, mejora sobre `heb` estándar en todos, entre 3,5 y 7,4 puntos de CER. En 42 escaneos de oficina sintéticos abiertos, gana 268 números y pierde 83 frente al modelo estándar (49 de las 83 pérdidas son etiquetas de esquema como `2.1.3`). Los documentos con capa de texto no cambian.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el modelo es un `traineddata` de 3,7 MB que se ejecuta en CPU mediante Tesseract. El consumo de memoria es mínimo (decenas de MB en ejecución).
- GPU recomendadas: no requiere GPU; Tesseract es CPU-only en la práctica. No hay soporte GPU documentado para este formato.
- Cabe en cualquier equipo: el requisito es Tesseract 4 o 5 (entrenado con 5.5.3) instalado.
- Opciones de despliegue: binario `tesseract` con `--tessdata-dir DIR -l heocr_modern_v1`; integración en la pipeline `heocr` con `heocr --download-model heocr_modern_v1`. No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| HeOCR modern-v1 | Tesseract LSTM `traineddata` | hebreo | 3,7 MB | Apache-2.0 | Fine-tune de `heb` para impresión moderna; sin puntuación de test |
| tessdata_best `heb` | Tesseract LSTM `traineddata` | hebreo | no disponible | Apache-2.0 | Modelo base; mejor en algunos números, peor en CER general según el autor |
| HeOCR oldprint-v1 | Tesseract LSTM `traineddata` | hebreo | no disponible | no disponible | Mejor en impresión antigua: CER inferior en los 7 conjuntos de impresión antigua medidos, por 0,1 a 3,0 puntos |

## Limitaciones y advertencias

- No hay puntuación de test: todas las cifras son de desarrollo o tuning, por lo que el rendimiento en producción puede diferir.
- Pérdida de números: en 42 escaneos sintéticos de oficina pierde 83 números frente al modelo estándar, 49 de ellos etiquetas de esquema como `2.1.3`. El manejo de números de `heocr` está pensado para cubrir esto, pero no forma parte de este modelo.
- Impresión antigua y rabínica: fuera de alcance; usar oldprint-v1, que tiene CER inferior en los 7 conjuntos de impresión antigua medidos.
- Escritura manual, Rashi y otras escrituras no cuadradas: no entrenadas.
- Niqqud y cantilación: no soportados; las etiquetas de entrenamiento no los contienen.
- Conjunto de caracteres limitado: no escribe maqaf `־`, geresh `׳`, gershayim `״`, guion corto `–`, guion largo `—` ni `―`. Las etiquetas con `–`, `—` o `―` se escribieron como `-`.
- No apto para transcripción sin supervisión: el autor recomienda revisar la salida, especialmente los números.
- `--tessdata-dir` sustituye el directorio de datos de Tesseract: los formatos de salida distintos de texto plano leen sus configs de `DIR/configs`, por lo que hay que enlazar la carpeta `configs` de la instalación o colocar el modelo en el tessdata de la instalación.
- El nombre de idioma es el nombre del fichero sin `.traineddata`; `-l heocr_modern_v1+eng` funciona pero no fue evaluado.
- Sin datos de sesgos: no aplica en un modelo OCR, pero los errores de reconocimiento pueden introducir sesgos en los datos extraídos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HeOCR/heocr-modern-v1-tesseract-heb
- Repositorio del motor: https://github.com/HeOCR/heocr-engine
- Experimento de síntesis: https://github.com/HeOCR/hocrsyngen/tree/main/experiments/office_print_v0
- Modelo base tessdata_best `heb`: https://github.com/tesseract-ocr/tessdata_best/tree/e12c65a915945e4c28e237a9b52bc4a8f39a0cec
- Tesseract: https://github.com/tesseract-ocr/tesseract
- Pipeline heocr: https://github.com/HeOCR/heocr
