# devneko/synthonly-ja-str-6m-202611

## Resumen

synthonly-ja-str-6m-202611 es un modelo de reconocimiento óptico de caracteres (OCR) especializado en líneas de texto japonés, desarrollado por el autor devneko. Se trata de un modelo de imagen a texto de aproximadamente 6 millones de parámetros (6.003.224 según los pesos en safetensors) cuyo objetivo es leer imágenes recortadas de una sola línea de texto, tanto impreso como manuscrito, en horizontal y vertical. Su rasgo distintivo es que se ha entrenado exclusivamente con datos sintéticos, sin emplear imágenes reales ni escritura manual auténtica durante el entrenamiento.

El modelo aborda un problema clásico del OCR japonés: la escasez de datos etiquetados reales y el coste de anotarlos. Generando 22 millones de muestras sintéticas a partir de 1.910 fuentes tipográficas, datos de trazos kanji (KanjiVG) y plantillas de escenas realistas (carteles, recibos, LED, siete segmentos), el autor consigue un modelo muy compacto que supera a NDLOCR-Lite (entrenado con datos reales) en la tarea de líneas impresas de carteles y recibos del conjunto JaWildText. Es relevante porque demuestra que el entrenamiento puramente sintético puede competir con enfoques supervisados con datos reales en un dominio tan complejo como el japonés.

La arquitectura concreta no se detalla en la model card; se distribuye como pesos PyTorch en formato safetensors (fp32) junto con un código de inferencia mínimo. No es un modelo generativo de propósito general, sino un reconocedor de líneas acotado a un conjunto de 7.090 caracteres y una longitud máxima de 50 caracteres por línea.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de imagen a texto; detalles no publicados) |
| Parámetros totales | 6.003.224 (6,00 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; salida máxima de 50 caracteres por línea |
| Tipos de cuantización | No disponible (pesos publicados en fp32) |
| Idiomas soportados | Japonés (ja) e inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna (no se indica si es un transformer, una CNN con decoder, un modelo híbrido o basado en atención). Se sabe que la tarea es de imagen a texto sobre un recorte de una sola línea, que el modelo no realiza detección de texto y que emite secuencias de hasta 50 caracteres sobre un vocabulario cerrado de 7.090 símbolos definidos en `charset.txt`. Los pesos se distribuyen en fp32 y el repositorio incluye únicamente el código mínimo de inferencia (`synthonly_infer/recognize.py`), con dependencias de torch, numpy, opencv-python-headless y safetensors.

El entrenamiento es completamente sintético, con 22 millones de muestras. Para texto impreso se renderizaron 1.910 fuentes (1.864 con licencia OFL-1.1, 44 Apache-2.0 y 2 IPA) sobre plantillas de escenas variadas: carteles, recibos, etiquetas de precio, páginas impresas, LED y displays de siete segmentos. Para escritura manual se deformaron datos de trazos kanji de KanjiVG con modelos de estilo por escritor, simulando bolígrafo, lápiz, rotulador, marcador y lápiz de tableta, sobre papel con renglones y cuadrícula, incluyendo condiciones de captura como tinta digital fina sobre fondo blanco o fotos de cuaderno oscuras, desenfocadas y con tono cálido. Las frases provienen de Aozora Bunko, Tatoeba, diccionarios y datos estadísticos de nombres propios, plantillas de precios y fechas, y palabras inglesas. JaWildText se usó solo para evaluación, nunca para entrenamiento. No se menciona RLHF, DPO ni ninguna innovación de decodificación.

## Capacidades

- Reconocimiento de texto en imágenes recortadas de una sola línea (impreso y manuscrito).
- Lectura de texto horizontal y vertical en japonés; el modelo rota automáticamente imágenes verticales 90° en sentido antihorario.
- Reconocimiento de caracteres latinos (aproximadamente el 7 % del entrenamiento), con rendimiento inferior a modelos específicos de inglés.
- Manejo de escenas variadas: carteles, recibos, etiquetas de precio, páginas impresas, LED y siete segmentos.
- Salida normalizada: NFKC, sin espacios, con unificación de guiones, tildes onduladas, puntos medios y comillas curvas, y composición de dakuten y handakuten separados.
- No realiza detección de texto ni segmentación: requiere recortes de línea ya preparados.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo puramente perceptivo de imagen a texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá del OCR.

## Casos de uso

- Digitalización de recibos y tickets: el modelo lee líneas recortadas de recibos con una precisión del 83,94 % en el conjunto receipt de JaWildText, adecuado para pipelines de extracción de importes, fechas y nombres de comercio tras un paso de detección de líneas.
- Lectura de carteles y señalización: con un 76,18 % de acierto en el conjunto board, sirve para inventariar texto de rótulos, paneles y cartelería en entornos urbanos o comerciales.
- Procesamiento de documentos impresos escaneados: al aceptar recortes de línea de páginas impresas, puede integrarse en flujos de OCR de libros o formularios con una etapa previa de detección y segmentación.
- Reconocimiento de escritura manual en cuadernos: aunque con un 32,66 % de acierto exacto y CER de 12,42 en líneas manuscritas, es útil para tareas de indexación aproximada o búsqueda tolerante a errores en notas manuscritas.
- Despliegue en dispositivos de bajos recursos: con 6 millones de parámetros y aproximadamente 19 ms por línea en CPU de un solo hilo (Apple M), es viable en entornos sin GPU, como lectores portátiles, quioscos o sistemas embebidos.
- Preprocesado en pipelines de datos: puede usarse para transcribir grandes volúmenes de recortes sintéticos o reales a bajo coste computacional antes de un modelo mayor o de una revisión humana.
- Extracción de texto en aplicaciones de accesibilidad: lectura de etiquetas, precios o avisos capturados con cámara, dado su bajo requisito de hardware y su licencia permisiva para uso comercial.

## Benchmarks y rendimiento

Resultados en JaWildText (test), con exactitud de coincidencia completa tras normalización:

| Conjunto de test | Líneas | Exactitud | 1−NED | CER |
|---|---:|---|---|---|
| board | 21.671 | 76,18 [74,12; 78,16] | 90,94 | 8,09 |
| receipt | 36.098 | 83,94 [83,26; 84,61] | 94,44 | 10,16 |
| board + receipt (agregado) | 57.769 | 81,03 [80,13; 81,93] | 93,13 | 9,20 |
| Manuscrito | 4.087 | 32,66 [30,65; 34,70] | 88,66 | 12,42 |

Benchmarks en inglés (exactitud sobre 36 caracteres alfanuméricos sin distinguir mayúsculas, método PARSeq):

| IIIT5k | SVT | IC13 (1015) | IC15 (2077) | SVTP | CUTE80 | Agregado (7.672 líneas) |
|---|---|---|---|---|---|---|
| 90,60 | 84,39 | 90,34 | 67,40 | 71,32 | 81,25 | 81,79 |

Comparación con NDLOCR-Lite en el mismo test:

| Modelo | Parámetros | Datos de entrenamiento | board + receipt | Manuscrito exactitud / CER | Inglés (agregado) |
|---|---|---|---|---|---|
| synthonly-ja-str-6m-202611 | 6,0 M | Sintéticos, 22 M muestras | 81,03 | 32,66 / 12,4 | 81,79 |
| NDLOCR-Lite | 8,8–9,8 M | Reales | 70,57 | 30,02 / 15,9 | 67,70 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 6 millones de parámetros en fp32, el peso ronda los 24 MB, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU moderna (RTX 4090, A100, H100) acelera el proceso, pero no es necesaria.
- Cabe en GPU consumer: sí, en cualquier modelo, incluida una GTX 1650 o integradas.
- Velocidad: aproximadamente 19 ms por línea en CPU de un solo hilo (Apple M), con preprocesado incluido, en lote de 1.
- Opciones de despliegue: el repositorio incluye código propio de inferencia (`synthonly_infer/recognize.py`) con torch, numpy, opencv-python-headless y safetensors. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: solo se publica la cifra de 19 ms por línea en CPU de un solo hilo; no se ofrecen datos de throughput en GPU ni en lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / tarea | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| synthonly-ja-str-6m-202611 | 6,0 M | Línea única, máx. 50 caracteres, 7.090 símbolos | Sintéticos, 22 M muestras | CC BY 4.0 | Hugging Face |
| NDLOCR-Lite | 8,8–9,8 M | OCR de línea japonés | Reales | No disponible en la información | No disponible en la información |

No se dispone de datos de otros modelos comparables en la información proporcionada; la única comparación publicada es con NDLOCR-Lite.

## Limitaciones y advertencias

- Solo procesa una línea por imagen; no detecta ni segmenta texto. Las líneas de más de 50 caracteres no se pueden emitir y las imágenes extremadamente largas se reducen a 768 px de ancho.
- Falla con texto inclinado más de aproximadamente 45° o con imágenes invertidas; solo rota automáticamente imágenes verticales 90° en sentido antihorario.
- El rendimiento en escritura manual es notablemente inferior al de texto impreso: 32,66 % de exactitud y CER de 12,42, con especial dificultad en escritura cursiva o desordenada, latín manuscrito, griego y fórmulas matemáticas.
- El rendimiento en inglés es inferior al de modelos específicos de inglés; el inglés representa solo alrededor del 7 % de los datos de entrenamiento.
- Vocabulario cerrado de 7.090 caracteres: no puede emitir caracteres fuera de ese conjunto, como kanji por encima del nivel 2 de JIS o emojis.
- Riesgo de alucinación y de sustituciones plausibles en texto degradado, dado que el modelo genera secuencias sobre un vocabulario cerrado; no se documentan sesgos específicos más allá de las limitaciones de dominio.
- Licencia CC BY 4.0: permite uso, modificación y redistribución comercial, pero exige atribución al repositorio. Los materiales sintéticos de origen incluyen KanjiVG (CC BY-SA 3.0), Aozora Bunko, Tatoeba (CC BY 2.0 FR), SudachiDict (Apache-2.0/BSD-3-Clause), datos de MLIT (CC BY 4.0) y de la Agencia Tributaria Nacional de Japón (PDL 1.0), con obligaciones de atribución específicas.
- Para producción, conviene validar el rendimiento en el dominio real objetivo, ya que la evaluación se limita a JaWildText y a benchmarks ingleses estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devneko/synthonly-ja-str-6m-202611
- Sitio del autor: https://devneko.jp/
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- KanjiVG: https://kanjivg.tagaini.net/
- Aozora Bunko: https://aozora.gr.jp/
- Tatoeba: https://tatoeba.org/
