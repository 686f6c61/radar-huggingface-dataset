# siliconwat/khmer-pali-ocr-cc0

## Resumen

Khmer-pali-ocr-cc0 es un modelo OCR basado en Tesseract 5.5.2 desarrollado por Silicon Wat para la lectura de los dos folios de cada apertura de la edición del Tipitaka del Instituto Budista de Phnom Penh (1927-69): el texto en pali y su traducción al jemer, ambos impresos en escritura jemer con la tipografía de esa edición. No es un modelo de lenguaje ni un transformer: es un modelo de reconocimiento óptico de caracteres entrenado desde cero con tesstrain, sin modelo base, exclusivamente a partir de las páginas mecanografiadas por un transcriptor humano.

El modelo se distribuye como ficheros `traineddata` de Tesseract (versión completa y versión compacta de 0,4 MB), opera en modo de línea única (`--psm 13`) y requiere un segmentador de líneas previo. Su relevancia radica en dos factores: por un lado, la licencia CC0 1.0 lo libera completamente al dominio público, algo infrecuente en modelos entrenados sobre corpus budistas; por otro, está diseñado específicamente para no "corregir" las lecturas propias de la edición camboyana hacia la forma birmana (CST) que conocen los modelos de propósito general, un sesgo documentado y medido en su model card.

El entrenamiento empleó 73.663 líneas impresas (33.658 en pali de 2.031 páginas y 40.005 en jemer de 2.257 páginas), con cuatro volúmenes y todas las páginas de test reservados. El autor publica además un modelo hermano afinado (`siliconwat/khmer-pali-ocr`, Apache-2.0) con mayor precisión, pensado para quien priorice exactitud sobre licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tesseract 5.5.2 (LSTM), entrenado con tesstrain (`405346a`), modo de normalización jemer (Indic) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (OCR de línea única, `--psm 13`) |
| Tipos de cuantizacion | no aplica; se distribuyen dos variantes: completa (`khm-pali.traineddata`) y compacta (`khm-pali-int.traineddata`, 0,4 MB) |
| Idiomas soportados | km (jemer), pi (pali), ambos en escritura jemer |
| Licencia | CC0 1.0 (dedicación al dominio público) |
| Formato de pesos | `traineddata` de Tesseract (compatible con tesseract.js) |

## Arquitectura y entrenamiento

El modelo es un reconocedor Tesseract 5.5.2 basado en redes LSTM, entrenado con la herramienta tesstrain en modo de normalización Indic para escritura jemer. No parte de ningún modelo base: se entrenó desde cero únicamente con las páginas transcritas por Se Mong Ly, lo que según el autor es la razón por la que puede dedicarse al dominio público. El corpus de entrenamiento comprende 73.663 líneas impresas, cada una emparejada con la transcripción mecanografiada del transcriptor: 33.658 líneas en pali procedentes de 2.031 páginas (15.953 mecanografiadas línea a línea y 17.705 alineadas mediante un procedimiento verificado con un 98,5% de coincidencia exacta en los saltos de línea conocidos) y 40.005 líneas en jemer de 2.257 páginas.

Para el alineado de líneas en jemer se usó un modelo de lenguaje grande que señalaba únicamente dónde caía cada línea impresa, sin generar etiquetas: las etiquetas son siempre el texto del transcriptor. Un primer modelo jemer entrenado con esas etiquetas alineó el resto del corpus; en páginas nuevas sus cortes coincidieron con los del modelo de lenguaje en 276 de 276 líneas. Se reservaron cuatro volúmenes completos y todas las páginas de test, y el checkpoint final se eligió sobre líneas retenidas, con las reglas de evaluación, las páginas de test y las predicciones fijadas antes del entrenamiento. Las imágenes de página usadas en el entrenamiento no se publican; el texto mecanografiado sí, en el dataset `siliconwat/khmer-tipitaka-transcription`.

## Capacidades

- Reconocimiento óptico de caracteres sobre texto impreso en escritura jemer, tanto pali como jemer, en la tipografía de la edición del Instituto Budista.
- Lectura de línea única mediante Tesseract en modo `--psm 13`, con los diccionarios de sistema y de frecuencia desactivados (`load_system_dawg=0`, `load_freq_dawg=0`).
- Preservación de lecturas camboyanas: el modelo no tiende a normalizar hacia la forma birmana (CST), al haber visto solo la impresión camboyana.
- Ejecución en navegador mediante tesseract.js, sin subida de imágenes a un servidor (demo en ocr.siliconwat.dev).
- Procesamiento de PDF, escaneos y fotografías siempre que se segmenten previamente en líneas.
- No soporta tool calling, agentes, razonamiento multi-paso, visión general ni audio: es exclusivamente un motor OCR.

## Casos de uso

- Digitalización del Tipitaka camboyano: el modelo lee directamente los folios pali y jemer de la edición de Phnom Penh, lo que permite convertir volúmenes escaneados en texto buscable respetando las lecturas propias de esa edición.
- Edición filológica comparada: al no corregir hacia el CST, sirve para documentar variantes camboyanas que otros sistemas borrarían silenciosamente, facilitando el cotejo entre ediciones.
- Investigación budista en pali: investigadores que trabajan con la recensión camboyana pueden transcribir pasajes y verificar lecturas contra la impresión sin depender de textos normalizados a la tradición birmana.
- Corpus de entrenamiento para modelos de lenguaje: las transcripciones resultantes alimentan la creación de corpus jemer y pali en escritura jemer, un recurso escaso para el entrenamiento de modelos posteriores.
- Aplicación web sin subida de datos: mediante tesseract.js y el fichero compacto de 0,4 MB, se puede ofrecer OCR en el navegador para usuarios que no quieran enviar imágenes a un servidor, útil en monasterios o bibliotecas con conectividad limitada.
- Preservación digital de archivos monásticos: digitalización de colecciones locales impresas en la misma tipografía, con revisión humana posterior dado el 2,1-2,3% de error por carácter medido en la página mediana.
- Integración en pipelines de humanidades digitales: el modelo se puede encadenar con segmentadores de línea propios (perfil horizontal de tinta) y con correctores ortográficos específicos para producir texto de trabajo revisable.

## Benchmarks y rendimiento

Mediciones publicadas en la model card, realizadas el 2026-11-20 sobre páginas de cuatro volúmenes no vistos en entrenamiento (Vinaya vol. 13, Majjhima vol. 25, Anguttara vol. 45, Abhidhamma vol. 83), comparadas con la mecanografía del transcriptor bajo reglas fijadas antes del entrenamiento:

| Metrica | Folio pali (80 paginas) | Folio jemer (80 paginas) |
|---|---|---|
| Caracteres erroneos (pagina mediana) | 2,1% (version compacta 2,0%) | 2,3% (version compacta 2,2%) |
| Palabras correctas (pagina mediana) | 88% | no disponible (el jemer no separa palabras) |
| Por volumen 13 · 25 · 45 · 83 | 4,1% · 1,6% · 2,2% · 1,9% | 3,2% · 1,2% · 2,9% · 1,9% |
| Lecturas camboyanas convertidas a forma birmana (CST) | 2 de 48 | no disponible |

No se han publicado resultados comparativos con otros modelos OCR en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: Tesseract es un motor CPU-first; no requiere GPU. El modelo completo y el compacto funcionan en cualquier máquina capaz de ejecutar Tesseract 5.5.2.
- VRAM estimada: no aplica; no hay requisitos de memoria de vídeo.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica, al no usar aceleración gráfica.
- Despliegue: binario `tesseract` con `--tessdata-dir` apuntando a los ficheros `traineddata`; en navegador mediante tesseract.js; el fichero compacto de 0,4 MB está pensado para carga web.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del segmentador de líneas y del hardware, no del modelo en sí.

## Comparativa con modelos similares

| Modelo | Tipo | Licencia | Idiomas | Precisión declarada | Notas |
|---|---|---|---|---|---|
| siliconwat/khmer-pali-ocr-cc0 | Tesseract desde cero | CC0 1.0 | km, pi | 2,1% error de carácter (pali), 2,3% (jemer) | Dominio público, sin modelo base |
| siliconwat/khmer-pali-ocr | Tesseract afinado | Apache-2.0 | km, pi | Más preciso según el autor (sin cifras en la información disponible) | Misma impresión, licencia permisiva pero no dominio público |
| Tesseract jemer estándar (`khm`) | Tesseract genérico | Apache-2.0 | km | No disponible | No entrenado sobre esta edición ni sobre pali en escritura jemer |
| Modelos OCR de propósito general basados en transformers | Vision-language | Variable | Múltiples | No disponible | Tienden a normalizar lecturas hacia el CST, según advierte el autor |

## Limitaciones y advertencias

- Entrenado con una única tipografía (la de la edición del Instituto Budista); otras impresiones no han sido evaluadas y las fotos de teléfono no se han medido.
- Aprendió de la mecanografía de una sola persona, incluidos algunos de sus hábitos (por ejemplo, ត donde la impresión tiene គ); conviene verificar la salida contra la impresión.
- Las notas a pie de página, en cuerpo menor, están infrarrepresentadas en el entrenamiento; los volúmenes del Vinaya son los más débiles (4,1% de error de carácter en el volumen 13).
- La lectura de página completa sin un segmentador de líneas independiente no se ha medido.
- El modelo opera línea a línea: requiere un paso previo de segmentación (perfil horizontal de tinta; en el folio jemer, dividir las bandas más altas por su fila más fina).
- En jemer no se puede medir la precisión por palabras porque la escritura no separa palabras; la métrica fiable es por caracteres.
- El sesgo hacia lecturas camboyanas es deliberado, pero implica que el modelo puede reproducir erratas de la edición o de la mecanografía sin corregirlas.
- Riesgo de alucinación bajo en sentido estricto (es OCR, no generación), pero puede producir caracteres plausibles donde la impresión es ambigua; la verificación humana es necesaria en producción.
- Licencia CC0 1.0: uso comercial y no comercial sin restricciones ni obligación de atribución; las imágenes de entrenamiento no se distribuyen, solo el texto mecanografiado en el dataset asociado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/siliconwat/khmer-pali-ocr-cc0
- Modelo hermano afinado (Apache-2.0): https://huggingface.co/siliconwat/khmer-pali-ocr
- Dataset de transcripción: https://huggingface.co/datasets/siliconwat/khmer-tipitaka-transcription
- Demo en navegador: https://ocr.siliconwat.dev
- tesseract.js: https://github.com/naptha/tesseract.js
