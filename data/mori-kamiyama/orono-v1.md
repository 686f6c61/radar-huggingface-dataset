# Mori-kamiyama/Orono-v1

## Resumen

Orono v1 es un sistema de OCR de página completa especializado en japonés con escritura vertical, desarrollado por el usuario Mori-kamiyama y publicado en HuggingFace. No se trata de un único modelo monolítico, sino de un pipeline de tres componentes pequeños que se ejecutan secuencialmente: Ogi (detección de líneas y clasificación de orientación vertical/horizontal), Oikawa (reconocimiento de caracteres línea a línea) y Buncho (predicción del orden de lectura de las líneas en la página).

La relevancia del proyecto reside en su enfoque modular y ligero: el conjunto completo ocupa aproximadamente 0,2 GB y los dos primeros módulos pueden ejecutarse mediante ONNX Runtime sin necesidad de GPU, PyTorch ni Paddle, lo que facilita su despliegue en entornos con recursos limitados. Está orientado principalmente a documentos japoneses con escritura vertical, un caso escasamente cubierto por los OCR genéricos multimodales actuales.

Se distribuye como una instantánea de investigación, sin una licencia unificada para el conjunto del repositorio y con advertencias explícitas del autor sobre sus limitaciones de precisión y sobre la necesidad de verificación humana en aplicaciones críticas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de tres módulos: Ogi (RepViT-M1.1 + RSEFPN128 + DB head con TKS por orientación), Oikawa (CNN compartida + proyecciones y FFN por orientación + Transformer de 4 capas + CTC con diccionario de glifos), Buncho (modelo Paddle basado en el backbone de PaddleOCR PP-OCRv6 small) |
| Parámetros totales | Ogi: 8.078.513; Oikawa: 4.337.313; Buncho: aproximadamente 8 millones |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (export ONNX en FP32, opset 17) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Other (sin licencia unificada para el conjunto; condiciones por componente y por datos de entrenamiento) |
| Formato de pesos | safetensors y ONNX (Ogi, Oikawa); Paddle state dictionary `inference.pdparams` (Buncho) |

## Arquitectura y entrenamiento

Orono v1 se organiza como un pipeline secuencial de página completa. Ogi detecta las líneas de texto y determina su orientación mediante un backbone RepViT-M1.1 con cuello RSEFPN128 y una cabeza DB con TKS específicas por dirección. Oikawa reconoce cada línea recortada usando una CNN compartida, proyecciones y FFN separadas por orientación, un Transformer de 4 capas y decodificación CTC contra un diccionario de glifos (`chars.json`). Buncho predice el orden de lectura a partir de la imagen de página, la geometría de las líneas y las cadenas reconocidas, empleando la configuración del backbone de PaddleOCR PP-OCRv6 small junto con un decodificador de línea siguiente.

En cuanto a los datos, Ogi se entrenó con 16.000 páginas (mitad sintéticas del conjunto O2 y mitad reales extraídas de O1, NDL part 1, CODH y páginas derivadas de FinePDFs), con 8.000 actualizaciones. Oikawa se entrenó durante 4 épocas con expertos por orientación, con 6.264.028 líneas por época (5.862.629 verticales y 401.399 horizontales), usando recortes correctos y recortes con desplazamientos introducidos por el detector; los textos sintéticos provinieron de Aozora Bunko, JSSODa y transcripciones de Common Voice en japonés. Buncho se entrenó con una pasada sobre 24.906 páginas (18.906 de entrenamiento de O2 y 6.000 de O1). No se documenta el uso de RLHF ni DPO.

## Capacidades

- Detección de líneas de texto en imágenes de página, con clasificación de orientación vertical u horizontal.
- Reconocimiento de caracteres japoneses en líneas verticales (caso principal) y horizontales (caso secundario, con menor cobertura de entrenamiento).
- Predicción del orden de lectura de las líneas detectadas mediante el módulo Buncho.
- Salida estructurada en JSON por página, con identificador de línea, coordenadas cuádruples, dirección, puntuación de detección, texto reconocido y confianza.
- Ejecución de Ogi y Oikawa mediante ONNX Runtime, sin dependencia de GPU ni de PyTorch o Paddle.
- Procesamiento por lotes de varias páginas en una sola invocación.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo de pensamiento; es un OCR especializado, no un modelo de lenguaje.

## Casos de uso

- Digitalización de libros y revistas japonesas con escritura vertical: el pipeline detecta las líneas, las reconoce y predice su orden, generando texto estructurado que puede volcarse a un sistema de archivo o a un repositorio documental. Es adecuado por su especialización en texto vertical y su bajo coste de ejecución.
- Extracción de texto de documentos históricos impresos en japonés (no manuscritos): útil para proyectos de humanidades digitales que necesiten un primer borrador de transcripción, siempre con revisión humana posterior.
- Procesamiento por lotes en servidores sin GPU: al ejecutarse con ONNX Runtime en CPU, permite desplegar la digitalización en máquinas modestas o en contenedores sin aceleración hardware.
- Preprocesado para pipelines de NLP en japonés: el JSON de salida con líneas, coordenadas y confianza puede alimentar etapas posteriores de traducción, búsqueda o análisis de contenido.
- Integración en herramientas de edición o visores de documentos: las coordenadas cuádruples y la dirección permiten superponer los resultados sobre la imagen original para revisión interactiva.
- Filtrado y clasificación de grandes volúmenes de escaneos: la detección de líneas y la orientación permiten identificar páginas con contenido vertical frente a páginas vacías o con otros formatos antes de un OCR más costoso.
- Investigación en OCR japonés: al ser una instantánea de investigación con pesos y export ONNX, sirve como base para experimentos sobre detección, reconocimiento y orden de lectura en escritura vertical.

## Benchmarks y rendimiento

Evaluación sobre VJRODa (61 páginas de japonés vertical), ejecutada tres veces en una GPU L40S. La métrica es el CER medio por página tras eliminar etiquetas y espacios y aplicar normalización NFKC.

| Modo de ejecución | CER medio por página | Throughput | Latencia p50 / p95 | Memoria GPU máxima |
|---|---|---|---|---|
| Página a página | 6,34 % | 2,77 páginas/s | 0,32 / 0,62 s | ~2,2 GB |
| Lote de 16 páginas con AMP | 6,66 % | ~6,15 páginas/s | ~2,10 / 2,49 s (lote completo) | ~3,9 GB |

El autor advierte que VJRODa se usó también durante el desarrollo y no es un conjunto de test independiente, por lo que la precisión en documentos desconocidos puede diferir de estas cifras. No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni métricas equivalentes, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,2 GB para inferencia página a página y aproximadamente 3,9 GB con lotes de 16 páginas y AMP, según las mediciones del autor en una L40S.
- GPU recomendadas: el autor valida el rendimiento en NVIDIA L40S; cualquier GPU con al menos 4 GB de VRAM debería cubrir el modo por lotes, aunque no se documentan mediciones en otras tarjetas.
- GPU de consumo: por el reducido consumo de memoria, cabe en tarjetas de consumo con 4 GB o más de VRAM; no se especifican modelos concretos ni cifras de rendimiento en ellas.
- Ejecución en CPU: Ogi y Oikawa pueden ejecutarse con ONNX Runtime sin GPU, PyTorch ni Paddle; no se documentan latencias en CPU.
- Opciones de despliegue: ONNX Runtime 1.20.1 con `inference.py` incluido; Buncho requiere el entorno Paddle original con la configuración del backbone de PaddleOCR PP-OCRv6 small y sus activos de inferencia oficiales.
- Latencia y throughput: 2,77 páginas/s en modo página a página y aproximadamente 6,15 páginas/s en lotes de 16 con AMP, medidos en L40S.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de alternativas en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Orono v1 | Pipeline OCR japonés (3 módulos) | ~20,4 M en total | No aplica | Other (sin licencia unificada) | HuggingFace, con ONNX y safetensors |
| PaddleOCR PP-OCRv6 small | OCR genérico | No disponible en la información | No aplica | No disponible en la información | Paddle, activos oficiales |
| OCR multimodales genéricos | Modelos visión-lenguaje | No disponible en la información | No disponible en la información | No disponible en la información | No disponible en la información |

## Limitaciones y advertencias

- El orden de lectura falla de forma significativa en maquetaciones complejas, numeración de apartados y titulares.
- En reconocimiento se producen omisiones de caracteres, detección de líneas espurias y separación de la puntuación al final de línea; los caracteres alfanuméricos y los símbolos presentan más errores que kanji y kana.
- La escritura horizontal tiene menos líneas de entrenamiento que la vertical y su reconocimiento es más débil.
- La detección emplea cajas paralelas a los ejes, lo que penaliza documentos inclinados y líneas extremadamente cortas.
- No se ha verificado el rendimiento en manuscritos, libros clásicos, tipografía histórica ni documentos fotografiados.
- El autor no reclama estado del arte ni precisión sobre documentos generales.
- En usos médicos, legales o administrativos donde un error de lectura tenga consecuencias graves, se requiere verificación humana.
- `inference.py` no ejecuta Buncho, por lo que la salida no aplica orden de lectura (`reading_order_applied` siempre es `false`); es necesario añadir un procesamiento de orden propio.
- Al ejecutar Oikawa en lote, solo deben agruparse líneas con la misma longitud efectiva (`frames`); mezclar longitudes con padding altera las estadísticas de GroupNorm.
- Buncho se distribuye como state dictionary de Paddle y no como export ONNX autónomo; requiere la configuración del backbone de PaddleOCR PP-OCRv6 small, preprocesado geométrico y decodificador de línea siguiente.
- El export ONNX está en FP32 y opset 17; no se documentan otras precisiones ni cuantizaciones.
- La licencia es "other" y no se otorga una licencia única para el conjunto; el uso más allá de la investigación exige revisar las condiciones de cada dato, de los pesos upstream y del código.
- No se han documentado sesgos específicos más allá de las limitaciones de cobertura de datos indicadas por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mori-kamiyama/Orono-v1
- README en inglés: https://huggingface.co/Mori-kamiyama/Orono-v1/blob/main/README_en.md
- Repositorio de datos NDL (NDL part 1): no disponible en la información proporcionada
- Repositorio CODH: no disponible en la información proporcionada
- Aozora Bunko: no disponible en la información proporcionada
- JSSODa: no disponible en la información proporcionada
- Common Voice japonés: no disponible en la información proporcionada
- PaddleOCR PP-OCRv6: no disponible en la información proporcionada
- Conjunto de evaluación VJRODa: no disponible en la información proporcionada
