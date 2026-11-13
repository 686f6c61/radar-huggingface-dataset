# ric912/en-km-phonetic-transliterator

## Resumen

`en-km-phonetic-transliterator` es un modelo de transliteración fonética inglés-khmer desarrollado por el usuario independiente ric912. Su función es convertir una palabra o nombre en inglés a su representación ortográfica en escritura khmer según cómo suena, sin traducir su significado. Por ejemplo, "coffee" se convierte en ខូហ្វ៊ី y "Johnson" en ចនសុន. No es un modelo de traducción ni un sistema de reconocimiento de voz, sino una herramienta de conversión grafema-fonema a escritura khmer.

Técnicamente se trata de un transformer encoder-decoder a nivel de carácter, entrenado desde cero, con 2,6 millones de parámetros, dimensión de modelo 192, 3 capas en encoder y 3 en decoder, 4 cabezas de atención y feed-forward de 512. El vocabulario de entrada cubre las letras a-z y el de salida 78 caracteres khmer. Los pesos se distribuyen como un archivo NumPy (`model.npz`, 10,5 MB) y la inferencia se realiza exclusivamente en CPU mediante el paquete `khmer-translit`, con búsqueda por haz de anchura 4.

El modelo se publica como "research preview": la calidad fonética no ha sido validada de forma independiente y las métricas publicadas miden la coincidencia con ortografías de referencia, no la corrección fonética real. Es relevante para desarrolladores que necesiten generar borradores de grafías khmer de préstamos y nombres ingleses en glosarios o front-ends de síntesis de voz, siempre con revisión humana posterior. Su licencia CC BY-SA 4.0 permite uso comercial con atribución y compartir-al-igual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder a nivel de carácter (seq2seq) |
| Parametros totales | 2,6 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada limitada a una palabra de hasta 32 letras) |
| Tipos de cuantizacion | no disponible (pesos NumPy en precisión nativa) |
| Idiomas soportados | inglés (entrada), khmer (salida) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | `model.npz` (arrays NumPy + metadatos JSON); no es un checkpoint de Transformers |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder a nivel de carácter entrenado desde cero, sin modelo base preentrenado. Consta de 3 capas de encoder y 3 de decoder, con dimensión de modelo 192, 4 cabezas de atención y capa feed-forward de 512. El vocabulario de entrada son las letras a-z y el de salida 78 caracteres khmer. La inferencia emplea búsqueda por haz de anchura 4 sobre NumPy puro.

El entrenamiento utilizó 9.735 pares inglés-khmer extraídos automáticamente de texto web khmer donde una grafía khmer aparece seguida de la palabra inglesa entre paréntesis (por ejemplo, "ចនសុន (Johnson)"). Las fuentes son el subconjunto khmer `khm_Khmr` de FineWeb-2 (9.807 pares, un shard) y el volcado de Wikipedia en khmer del 2026-10-01 (693 pares), con 469 pares presentes en ambas fuentes. Los filtros exigen que la palabra inglesa esté en el CMU Pronouncing Dictionary, no parezca khmer romanizado, pase un filtro de ruido y sea distinta de las palabras de evaluación. No se usaron datos sintéticos ni etiquetas manuales; un modelo de transliteración interno anterior ayudó a seleccionar y alinear los pares, pero sus salidas nunca se usaron como etiquetas. El procedimiento fue AdamW con learning rate 1e-3, 500 pasos de warm-up y decaimiento coseno, weight decay 0,01, label smoothing 0,1 y batch 128, durante 40 épocas, eligiendo la mejor (época 27) sobre un conjunto separado de 86 palabras revisadas. El entrenamiento completo llevó unos 15 minutos en CPU de portátil.

## Capacidades

- Transliteración fonética de una palabra o nombre inglés a su grafía en escritura khmer (no traducción).
- Normalización de entrada: NFKC, minúsculas, eliminación de acentos, apóstrofos y guiones (por ejemplo, "O'Neil" pasa a "oneil" y "Wi-Fi" a "wifi").
- Generación de hasta 8 candidatos de grafía ordenados por `log_score` del modelo.
- Rechazo explícito de entradas no válidas con estado: `empty` (texto vacío), `unsupported_multiword` (varias palabras), `unsupported_characters` (dígitos, khmer u otros caracteres) y `too_long` (más de 32 letras). Nunca trunca ni adivina.
- Interfaz de línea de comandos con salida JSON/JSONL por línea y códigos de salida (0 éxito, 1 entradas rechazadas, 2 errores de uso o modelo corrupto).
- API de Python mediante `khmer_translit.english.Transliterator`, con `predict` y `predict_many`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada a inglés de entrada y khmer de salida; no procesa oraciones.

## Casos de uso

- Elaboración de glosarios de préstamos ingleses: el modelo genera borradores de grafía khmer para términos técnicos y comerciales que un revisor khmer valida antes de publicar, reduciendo el trabajo manual inicial.
- Front-ends de síntesis de voz en khmer: para pronunciar correctamente nombres y palabras inglesas incrustadas en texto khmer, el sistema puede obtener candidatos de grafía fonética que el motor TTS lee como texto khmer nativo.
- Localización de catálogos de productos y marcas: conversión de nombres de marca y modelo en inglés a grafías khmer revisables para fichas, etiquetas y material promocional.
- Normalización de nombres propios en bases de datos: al importar registros con nombres ingleses, el modelo propone una grafía khmer consistente para campos de nombre localizado, con revisión posterior.
- Preprocesamiento para pipelines de NLP en khmer: generación de variantes ortográficas de préstamos que permiten ampliar diccionarios y reglas de normalización en sistemas de búsqueda o indexación.
- Herramienta de apoyo a traductores y lingüistas: integrada en un editor o CLI, ofrece hasta 8 candidatos por palabra con puntuación para que el profesional elija o corrija, agilizando la decisión ortográfica.
- Docencia y aprendizaje del khmer: permite a estudiantes angloparlantes ver cómo se escribe fonéticamente una palabra inglesa en khmer, como material de práctica siempre contrastado con un hablante nativo.

## Benchmarks y rendimiento

| Conjunto de prueba | Palabras | Coincidencia exacta con la referencia (top 1) | Referencia entre los 4 primeros |
|---|---|---|---|
| Préstamos y nombres ingleses, grafías revisadas por el autor | 165 | 16,7% | 40,4% |
| Mismas clases de palabras, grafías sugeridas por un LLM y verificadas por muestreo | 400 | 30,1% | 51,3% |

Notas del autor: cada palabra tiene una única grafía de referencia, por lo que una grafía fonéticamente válida pero escrita de forma distinta cuenta como error, lo que infravalora la utilidad. Las referencias no fueron revisadas de forma independiente: las cifras miden coincidencia con esas grafías, no precisión fonética, y no constituyen un benchmark general. Reentrenamientos con otras semillas dieron 15,1% y 16,0% en el primer conjunto.

Rendimiento medido en un Intel Core i7-8750H, en proceso nuevo:

| Medida | Valor |
|---|---|
| Tiempo de carga | 0,15 s |
| Una palabra (mediana / percentil 95) | 17 ms / 30 ms |
| Lotes de 16 | 13 ms por palabra |
| Memoria pico | 6 (unidad no especificada en la información disponible) |

## Requisitos de hardware

- Inferencia exclusivamente en CPU; no requiere GPU, PyTorch ni acceso a red tras la instalación.
- Software: Python 3.10-3.12 y NumPy ≥ 2 (probado con 2.2.6).
- VRAM estimada: no aplica (ejecución en CPU); memoria pico reportada de 6 (unidad no disponible).
- GPU recomendadas: no aplica; no hay soporte GPU documentado.
- Cabe en cualquier equipo consumer: el modelo pesa 10,5 MB y se ejecuta en portátiles convencionales (medido en un Core i7-8750H).
- Opciones de despliegue: paquete `khmer-translit` (wheel incluido en el repo), uso como CLI (`khmer-translit predict`) o como API de Python. No es compatible con vLLM, llama.cpp, Ollama ni TGI, y `AutoModel.from_pretrained` no puede cargarlo.
- Latencia y throughput: 17 ms por palabra en mediana (30 ms en p95) y 13 ms por palabra en lotes de 16; carga de 0,15 s.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de transliteración fonética inglés-khmer en la documentación proporcionada. Los sistemas de transliteración multilingüe basados en transformers de mayor tamaño o los modelos de traducción automática inglés-khmer no son equivalentes funcionalmente (traducen en lugar de transliterar fonéticamente) y no se han facilitado datos de comparación. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Es una "research preview": la calidad fonética no ha sido validada de forma independiente y las métricas miden coincidencia con ortografías de referencia, no corrección fonética.
- La coincidencia exacta top-1 es baja (16,7% en el conjunto revisado por el autor); la utilidad real depende de la revisión humana y de la selección entre los candidatos.
- No traduce, no procesa oraciones, no maneja khmer romanizado ("sok sabay") ni nombres que deban leerse en su idioma original en lugar de en inglés.
- No debe usarse para publicar grafías sin la comprobación de un lector khmer.
- Entrada restringida a una sola palabra de hasta 32 letras; rechaza dígitos, caracteres khmer, texto vacío y múltiples palabras.
- El `log_score` es una log-probabilidad del modelo para ordenar candidatos, no una confianza calibrada.
- Entrenado con datos extraídos automáticamente de web y Wikipedia, lo que puede introducir sesgos de dominio y ruido residual pese a los filtros; el conjunto de entrenamiento es pequeño (9.735 pares).
- Licencia CC BY-SA 4.0: el uso comercial está permitido con atribución, pero las obras derivadas deben compartirse bajo la misma licencia, lo que puede condicionar su integración en productos propietarios.
- No es un checkpoint de Transformers: requiere el paquete `khmer-translit` y no funciona con las herramientas estándar del ecosistema Hugging Face.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin comunidad ni soporte documentado más allá de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ric912/en-km-phonetic-transliterator
- Dataset FineWeb-2 (subconjunto khmer `khm_Khmr`): https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Wikipedia en khmer (fuente del volcado de 2026-10-01): no disponible como enlace específico en la información proporcionada
- CMU Pronouncing Dictionary (filtro de entrenamiento): no disponible como enlace específico en la información proporcionada
- Paquete `khmer-translit`: incluido como wheel en el repositorio del modelo; no se proporciona enlace externo
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
