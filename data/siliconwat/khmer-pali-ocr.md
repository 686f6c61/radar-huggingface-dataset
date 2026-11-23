# siliconwat/khmer-pali-ocr

## Resumen

Khmer-pali-ocr es un modelo de reconocimiento óptico de caracteres (OCR) basado en Tesseract 5.5.2, desarrollado por Silicon Wat, especializado en la lectura de la edición del Tipitaka publicada por el Instituto Budista de Phnom Penh (1927-69). El modelo reconoce ambas páginas de cada apertura del libro: el texto en pali y su traducción al jemer, ambos impresos en escritura jemer con la tipografía específica de esa edición. Se trata de un ajuste fino (fine-tuning) del modelo Khmer de Google para Tesseract (`khm`, tesstdata_best), lo que explica su licencia Apache-2.0.

A diferencia de los modelos OCR de propósito general, este modelo ha sido entrenado exclusivamente con la impresión de la edición camboyana, lo que le permite preservar las lecturas propias de esa tradición textual sin "corregirlas" hacia la forma birmana (CST) que conocen la mayoría de sistemas. Es relevante para proyectos de digitalización de textos budistas, investigación filológica y preservación del patrimonio documental jemer.

El repositorio tiene un tamaño de 0.0 GB (los pesos se distribuyen como archivos `.traineddata` de Tesseract, no como safetensors), soporta los idiomas jemer (km) y pali (pi), y se publicó en noviembre de 2026. Existe una variante alternativa entrenada desde cero con licencia CC0 (`siliconwat/khmer-pali-ocr-cc0`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tesseract 5.5.2 (LSTM, motor OCR de Tesseract) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (OCR de linea individual, modo `--psm 13`) |
| Tipos de cuantizacion | no disponible (modelo `.traineddata`; version compacta `khm-pali-int` de 1.0 MB) |
| Idiomas soportados | jemer (km), pali (pi) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.traineddata` (Tesseract); compatible con tesseract.js |

## Arquitectura y entrenamiento

El modelo utiliza el motor OCR de Tesseract 5.5.2 con el framework tesstrain (commit `405346a`) y el modo de normalización jemer (Indic). Se trata de un modelo LSTM de reconocimiento de texto, no de un transformer generativo. El entrenamiento se realizó sobre **73.663 líneas impresas**, cada una emparejada con la transcripción manual del transcriptor: 33.658 líneas de pali procedentes de 2.031 páginas y 40.005 líneas de jemer procedentes de 2.257 páginas. En 372 páginas se empleó un modelo de lenguaje grande únicamente para localizar dónde caía cada línea impresa, pero las etiquetas de texto son siempre del transcriptor humano.

Se reservaron cuatro volúmenes completos y todas las páginas de test para validación. El mejor checkpoint se seleccionó sobre líneas retenidas, y las reglas de evaluación, las páginas de test y las predicciones se registraron antes del entrenamiento. El modelo lee una línea impresa a la vez (modo de línea única de Tesseract); es necesario segmentar previamente la página en líneas mediante un perfil de tinta horizontal. Las imágenes de las páginas de entrenamiento no se han publicado; el texto mecanografiado del transcriptor sí está disponible por separado.

## Capacidades

- Reconocimiento OCR de texto impreso en escritura jemer, tanto en pali como en jemer.
- Lectura de la tipografía específica de la edición del Instituto Budista (Phnom Penh, 1927-69).
- Preservación de las lecturas camboyanas propias de la edición, sin corrección automática hacia la forma birmana (CST).
- Funcionamiento en modo de línea individual (`--psm 13`) con desactivación de diccionarios (`load_system_dawg=0`, `load_freq_dawg=0`).
- Dos variantes: modelo completo (`khm-pali.traineddata`) y versión compacta (`khm-pali-int.traineddata`, 1.0 MB) con precisión medida equivalente.
- Ejecución en navegador mediante tesseract.js, sin subida de imágenes a servidores externos.
- Procesamiento de PDF, escaneos y fotografías a través de la interfaz web ocr.siliconwat.dev.

## Casos de uso

- Digitalización del Tipitaka camboyano: el modelo permite convertir a texto las páginas escaneadas de la edición del Instituto Budista, preservando tanto el pali como la traducción jemer y las lecturas textuales propias de esa tradición.
- Investigación filológica budista: al no "corregir" las lecturas camboyanas hacia la forma CST, el modelo sirve para estudiar variantes textuales entre tradiciones sin sesgo de normalización.
- Preservación del patrimonio documental: digitalización de fondos escaneados por organizaciones como 5000-years.org, con salida de texto reutilizable para archivos digitales.
- Edición crítica de textos: generación de transcripciones base sobre las que el filólogo puede trabajar, con una tasa de error de caracteres del 1,2-1,7% en la página mediana.
- Aplicaciones web de consulta: integración mediante tesseract.js en una página que procese localmente imágenes de páginas del Tipitaka sin enviar datos a terceros.
- Procesamiento por lotes de volúmenes completos: segmentación de páginas en líneas y reconocimiento secuencial para digitalizar colecciones enteras de la edición.
- Transcripción asistida para estudiosos del pali: el modelo lee tanto la hoja pali como la jemer de cada apertura, facilitando la comparación entre original y traducción.

## Benchmarks y rendimiento

Medido el 2026-11-20 sobre páginas de cuatro volúmenes no vistos en entrenamiento (Vinaya vol. 13, Majjhima vol. 25, Anguttara vol. 45, Abhidhamma vol. 83), comparando con la mecanografía del propio transcriptor:

| Metrica | Hoja pali (80 paginas) | Hoja jemer (80 paginas) |
|---|---|---|
| Caracteres erroneos (pagina mediana) | 1,7% (compacto: 1,7%) | 1,2% (compacto: 1,1%) |
| Palabras correctas (pagina mediana) | 90% | no disponible (el jemer no usa espacios entre palabras) |
| Por volumen (13 · 25 · 45 · 83) | 2,5% · 0,9% · 1,8% · 1,1% | 1,8% · 0,9% · 1,6% · 0,8% |
| Lecturas camboyanas convertidas a forma birmana (CST) | 1 de 47 | no disponible (ninguna fuente externa marca las grafias jemer de la edicion) |

## Requisitos de hardware

- El modelo completo y la versión compacta son archivos `.traineddata` de Tesseract; la versión compacta ocupa 1,0 MB, por lo que cabe en cualquier dispositivo, incluido un navegador.
- No requiere GPU: Tesseract ejecuta en CPU. Cualquier CPU moderna es suficiente para inferencia.
- GPU recomendadas: no aplica; el modelo no está diseñado para aceleración por GPU.
- Cabe en cualquier GPU de consumo (y en ninguna es necesaria); también en Raspberry Pi y dispositivos móviles.
- Opciones de despliegue: binario `tesseract` (línea de comandos), tesseract.js (navegador y Node.js), y cualquier wrapper de Tesseract 5.x.
- Latencia y throughput: no disponible en la información proporcionada; depende del hardware y del número de líneas por página.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Entrenamiento | Notas |
|---|---|---|---|---|---|
| siliconwat/khmer-pali-ocr | Tesseract (LSTM) | km, pi | Apache-2.0 | Fine-tuning de `khm` (tesstdata_best) | Especializado en la edición del Instituto Budista |
| siliconwat/khmer-pali-ocr-cc0 | Tesseract (LSTM) | km, pi | CC0 | Entrenado desde cero | Misma impresión; elegir por licencia y precisión |
| Tesseract `khm` (Google, tesstdata_best) | Tesseract (LSTM) | km | Apache-2.0 | Entrenamiento general | Modelo base; no especializado en pali ni en esta edición |

## Limitaciones y advertencias

- Entrenado con la tipografía de una sola edición; otras impresiones no han sido evaluadas.
- Las fotografías tomadas con teléfono móvil no han sido medidas.
- Aprendió de la mecanografía de una sola persona, incluyendo algunos de sus hábitos (por ejemplo, ត donde la impresión tiene គ); conviene verificar la salida contra la impresión.
- Las notas al pie (en cuerpo menor) están infrarrepresentadas en el entrenamiento; los volúmenes del Vinaya son los más débiles.
- La lectura de página completa sin un segmentador de líneas independiente no ha sido medida.
- El jemer se escribe sin espacios entre palabras, por lo que la métrica de "palabras correctas" no es aplicable a esa hoja; la medida significativa es la de caracteres.
- No se han publicado las imágenes de las páginas de entrenamiento, lo que limita la reproducibilidad completa del ajuste.
- Aunque la licencia es Apache-2.0, al ser una versión modificada del modelo Khmer de Google, se aplican las condiciones de `LICENSE` y `NOTICE` del proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/siliconwat/khmer-pali-ocr
- Variante CC0: https://huggingface.co/siliconwat/khmer-pali-ocr-cc0
- Dataset de transcripción: https://huggingface.co/datasets/siliconwat/khmer-tipitaka-transcription
- Modelo base Tesseract Khmer: https://github.com/tesseract-ocr/tessdata_best
- tesseract.js: https://github.com/naptha/tesseract.js
- Demo en navegador: https://ocr.siliconwat.dev
- Escaneos de origen: https://5000-years.org
