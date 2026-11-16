# Kansallisarkisto/cyrillic-large-handwritten

## Resumen

cyrillic-large-handwritten es un modelo de reconocimiento óptico de caracteres (OCR) para texto manuscrito e impreso en cirílico, desarrollado por el Archivo Nacional de Finlandia (Kansallisarkisto) en el marco del proyecto ArchXAI, financiado por el programa Central Baltic. El modelo resuelve el problema de la transcripción automática de líneas de texto en documentos históricos rusos, un caso de uso crítico para la digitalización de archivos y la preservación documental. Es relevante ahora porque la mayoría de los sistemas OCR comerciales rinden mal sobre escritura manuscrita histórica en cirílico, y este modelo se entrena específicamente sobre colecciones archivísticas reales de Estonia, Finlandia y Letonia.

Arquitectura: transformer encoder-decoder del tipo TrOCR (Li et al., 2023), con un encoder visual que procesa una imagen de línea de texto y un decoder que genera la secuencia de caracteres mediante cross-attention. Cuenta con 610.553.010 parámetros totales (aproximadamente 610 M), un tamaño contenido que permite desplegarlo en hardware modesto. El modelo es un fine-tuning de Kansallisarkisto/cyrillic-large-stage1 y trabaja con imágenes de entrada de 182 x 1022 píxeles.

La versión publicada corresponde a noviembre de 2026 y se distribuye con licencia Apache 2.0, lo que facilita su uso comercial y su integración en pipelines de digitalización. El entrenamiento se ejecutó en el supercomputador LUMI (CSC – IT Center for Science).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (TrOCR, vision-encoder-decoder) |
| Parametros totales | 610.553.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (OCR de línea única; entrada de imagen 182 x 1022 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ruso (cirílico); entrenamiento con documentos históricos de Estonia, Finlandia y Letonia |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el esquema TrOCR: un encoder visual transforma la imagen de una línea de texto en una secuencia de estados ocultos y un decoder autorregresivo atiende a esos estados (incluido el token CLS) mediante cross-attention para generar el texto correspondiente. Durante el fine-tuning se congelaron las capas del decoder, incluidas las de cross-attention, durante las primeras 11 épocas (la model card indica 20 en la sección de hiperparámetros, lo que supone una discrepancia interna del documento), con el objetivo de adaptar el encoder a la escritura manuscrita sin degradar la capacidad de modelado de lenguaje del decoder.

El conjunto de entrenamiento consta de 121.956 líneas de texto (7.106 vacías), con validación de 14.898 líneas (888 vacías) y test de 13.950 líneas, anotadas manualmente a partir de documentos históricos de los archivos nacionales de Estonia, Finlandia y Letonia. Se aplicaron normalizaciones de etiquetas (ѣ→е, Ѣ→Е, і→и, І→И) y se amplió el entrenamiento un 6,66% con celdas de tabla de UoS Data Rescue (Middleton y Singh, 2025) y un 3,33% con cadenas numéricas generadas a partir de NIST SD19 y DIDA. Hiperparámetros: batch de 8 por dispositivo en 128 dispositivos, learning rate 5e-5, warmup 0,05, scheduler lineal, AdamW, 400 épocas y precisión FP16 desactivada.

## Capacidades

- Reconocimiento de texto manuscrito en cirílico, principalmente ruso, sobre imágenes de líneas de texto.
- Reconocimiento de texto impreso y mecanografiado incluido en el conjunto de entrenamiento.
- Transcripción de celdas de tabla y cadenas numéricas o alfanuméricas (capacidad reforzada mediante datos sintéticos y de UoS Data Rescue).
- Detección de líneas vacías (sin texto), útil para filtrar regiones en pipelines de digitalización.
- Procesamiento de imágenes de entrada de 182 x 1022 píxeles por línea.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente image-to-text.
- No dispone de modo thinking, visión general, audio ni capacidades multimodales más allá del OCR.

## Casos de uso

- Digitalización de archivos históricos: transcripción automática de manuscritos rusos de los siglos XIX y XX en colecciones nacionales, aprovechando el entrenamiento sobre material archivístico real de Estonia, Finlandia y Letonia.
- Proyectos de data rescue: extracción de códigos numéricos y alfanuméricos de tablas manuscritas, un caso para el que el modelo se reforzó con datos de UoS Data Rescue y generadores basados en NIST SD19 y DIDA.
- Transcripción de notas manuscritas: conversión de apuntes y correspondencia en cirílico a texto digital editable, con un CER de 0,0405 en dominio.
- Preservación y accesibilidad documental: generación de capas de texto buscable sobre imágenes de manuscritos para bibliotecas digitales y catálogos archivísticos.
- Investigación histórica y genealógica: indexación de registros parroquiales, censos y documentos administrativos rusos para búsqueda full-text.
- Pipelines de human-in-the-loop: primera pasada automática de transcripción con revisión humana posterior, adecuada por el bajo CER y por la detección de líneas vacías que evita falsos positivos en regiones sin texto.
- Extracción de datos estructurados: procesamiento de celdas de tabla en formularios y registros contables manuscritos para su volcado a bases de datos.

## Benchmarks y rendimiento

Evaluación in-domain sobre el conjunto de test (13.950 líneas), calculada con la librería `evaluate` en configuración por defecto:

| Metrica | Valor |
|---|---|
| CER (character error rate) | 0,0405 |
| WER (word error rate) | 0,1608 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en FP16 (610 M de parámetros) más el overhead del encoder visual y del procesador de imagen; en la práctica, entre 2 y 4 GB según el framework y el tamaño de batch.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son suficientes y sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en modelos como GTX 1660, RTX 3050, RTX 3060 y superiores.
- Opciones de despliegue: el autor recomienda el paquete `nafrec` para producción; también es posible la inferencia directa con `transformers` (`TrOCRProcessor` y `VisionEncoderDecoderModel`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que en general no están orientados a modelos encoder-decoder de OCR.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyrillic-large-handwritten | 610 M | Imagen 182 x 1022 px | CER 0,0405; WER 0,1608 (in-domain) | Apache 2.0 | Hugging Face |
| TrOCR (Li et al., 2023) | no disponible | Imagen de línea | no disponible para cirílico manuscrito histórico | MIT (según publicación original) | Hugging Face |
| cyrillic-large-stage1 | no disponible | Imagen de línea | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks de los modelos alternativos sobre el mismo conjunto de test, por lo que la comparación de rendimiento no es posible con rigor.

## Limitaciones y advertencias

- El modelo está entrenado principalmente para ruso y puede no generalizar bien a otros idiomas con alfabeto cirílico (ucraniano, búlgaro, serbio, etc.).
- Al ser un fine-tuning de cyrillic-large-stage1, puede heredar sesgos y limitaciones del modelo base.
- La generalización out-of-domain depende fuertemente de la composición del entrenamiento y de la configuración del preentrenamiento y fine-tuning; documentos con caligrafías, épocas o soportes distintos pueden degradar el CER.
- Riesgo de alucinación en el decoder: puede generar texto plausible en regiones ambiguas o de baja calidad de imagen.
- Procesa una línea de texto por imagen; requiere un paso previo de segmentación de líneas en documentos completos.
- Existe una discrepancia en la model card entre las 11 épocas con decoder congelado mencionadas en la descripción y las 20 indicadas en los hiperparámetros.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento de terceros (UoS Data Rescue, NIST SD19, DIDA) si se redistribuye el modelo o se usa en producción.
- No apto para tareas de generación de texto, razonamiento, código o agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kansallisarkisto/cyrillic-large-handwritten
- Modelo base: https://huggingface.co/Kansallisarkisto/cyrillic-large-stage1
- Paquete de inferencia nafrec: https://github.com/Kansallisarkisto-AI/nafrec
- Generador de líneas alfanuméricas: https://github.com/Kansallisarkisto-AI/misc-scripts/blob/main/train-trocr-main/sd19_alphanumeric_line_generator_seek.py
- UoS Data Rescue (Zenodo): https://zenodo.org/records/15730546
- Proyecto ArchXAI: https://centralbaltic.eu/project/archxai/
- CSC – IT Center for Science: https://csc.fi/en/
- Supercomputador LUMI: https://lumi-supercomputer.eu/
- Librería evaluate (métrica CER): https://github.com/huggingface/evaluate/blob/main/metrics/cer/cer.py
