# KobayashiShiroe/OCR-pipeline-historical-data

## Resumen

OCR-pipeline-historical-data es un conjunto de reconocedores de líneas de texto (line recognizers) para kraken, entrenados específicamente para transcribir escritura manuscrita del portugués brasileño del siglo XIX. El modelo lo publica el usuario KobayashiShiroe en Hugging Face y se emplea en el pipeline de OCR histórico del repositorio DeguShi/OCR-pipeline-historical-data. No es un modelo de lenguaje generativo, sino un modelo de reconocimiento óptico de escritura (HTR/OCR) orientado a documentos históricos.

Los reconocedores son un fine-tune de PP-OCRv6 *medium* (Kiessling, Zenodo 10.5281/zenodo.21788410) sobre recortes de líneas de 78 páginas del *Livro de Registro de Leis nº 1* (São Carlos, 1892–1894). El repositorio incluye dos ficheros de pesos: `st_c1m.safetensors` (v6, final) y `st_g3m.safetensors` (v5).

Su relevancia radica en la escasez de modelos HTR especializados en portugués histórico y en que documenta una cadena completa de transcripción con métricas de error sobre páginas no vistas. El tamaño del repositorio es de 0,1 GB y la licencia es de uso exclusivamente investigador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Reconocedor de líneas kraken (fine-tune de PP-OCRv6 *medium*) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de reconocimiento de líneas, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | portugués (pt) |
| Licencia | research-use (license: other) |
| Formato de pesos | safetensors (`st_c1m.safetensors`, `st_g3m.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un reconocedor de líneas para la librería kraken, construido como fine-tune de PP-OCRv6 *medium* (Kiessling, Zenodo 10.5281/zenodo.21788410). Trabaja sobre recortes de línea previamente segmentados, no sobre páginas completas; la segmentación y el post-procesado los aporta el pipeline externo. No se dispone de detalles sobre el número de parámetros ni sobre la composición interna de la arquitectura en la información proporcionada.

El entrenamiento se realizó con recortes de línea de 78 páginas del mismo registro. Las etiquetas son transcripciones diplomáticas generadas con Gemini 4 Argon y alineadas con las líneas segmentadas, sin revisión humana. Quedaron fuera del entrenamiento las 12 páginas con transcripción oficial y las 10 páginas de test. La configuración de `st_c1m` fue de 20 épocas, tasa de aprendizaje 1e-4, aumento de datos, semilla 42 y una única GPU NVIDIA L4. No se especifica el volumen de tokens ni el número de líneas de entrenamiento.

## Capacidades

- Reconocimiento de escritura manuscrita (HTR) sobre recortes de línea de documentos históricos en portugués.
- Transcripción diplomática de registros legales brasileños del siglo XIX.
- Integración con la librería kraken y con el pipeline `ocr_pipeline` del repositorio del autor.
- Post-procesado mediante diccionario de época y modelo de contexto de trigramas (aportado por el pipeline, no por el reconocedor).
- Verificación de integridad de pesos mediante SHA-256 documentado por fichero.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Digitalización de libros de registro históricos: el reconocedor transcribe líneas segmentadas de registros legales del siglo XIX, un dominio con escasa cobertura en modelos OCR genéricos.
- Investigación archivística en portugués brasileño: permite generar transcripciones de trabajo sobre fondos manuscritos para su posterior revisión por paleógrafos.
- Construcción de corpus históricos: el pipeline asociado añade diccionario de época y modelo de trigramas, lo que facilita obtener texto limpio para análisis lingüístico diacrónico.
- Preservación digital en instituciones: la licencia research-use encaja en proyectos académicos de digitalización con fines de conservación e investigación.
- Evaluación de pipelines HTR: al publicar WER y CER sobre páginas retenidas y de test, sirve como referencia para comparar configuraciones de segmentación y post-procesado.
- Prototipado de flujos kraken: el comando de uso documentado (`python -m ocr_pipeline.batch --config configs/final_v6.json`) permite desplegar un lote completo sobre un directorio de imágenes en un entorno con GPU.
- Estudio de sesgos de etiquetado automático: al estar las etiquetas generadas por un modelo y no revisadas por personas, el modelo es útil para analizar cómo se propagan las convenciones de transcripción automática.

## Benchmarks y rendimiento

Resultados del pipeline completo (v6), que incluye diccionario de época y modelo de contexto de trigramas; no corresponden al reconocedor aislado.

| Conjunto de evaluación | Métrica | Valor |
|---|---|---|
| 3 páginas retenidas frente a transcripción oficial | WER | 18,74 % |
| 3 páginas retenidas frente a transcripción oficial | CER | 4,43 % |
| 13 páginas fuera de entrenamiento y selección frente a referencia diplomática | WER | 4,10 % |
| 13 páginas fuera de entrenamiento y selección frente a referencia diplomática | CER | 1,68 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,1 GB, lo que sugiere un modelo ligero que previsiblemente cabe en GPU de consumo, aunque no se confirma en la información proporcionada.
- GPU de entrenamiento documentada: una NVIDIA L4.
- GPU recomendadas: no disponibles; el pipeline se ha validado con NVIDIA L4.
- Compatibilidad con GPU de consumo: no confirmada explícitamente, pero el tamaño del repositorio (0,1 GB) es compatible con tarjetas de gama media.
- Opciones de despliegue: kraken y el pipeline `ocr_pipeline` del repositorio DeguShi/OCR-pipeline-historical-data; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OCR-pipeline-historical-data (este modelo) | HTR kraken, fine-tune de PP-OCRv6 medium | pt | no aplica | research-use | Hugging Face, 0 descargas |
| PP-OCRv6 medium (modelo base) | OCR/HTR kraken | no disponible | no aplica | no disponible | Zenodo 10.5281/zenodo.21788410 |
| Otros reconocedores kraken para portugués histórico | HTR kraken | pt | no aplica | variable | no disponible en la información proporcionada |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Entrenado sobre una única mano y un único libro: la generalización a otros escribanos, registros o épocas es limitada.
- Las etiquetas de entrenamiento fueron generadas por Gemini 4 Argon y no revisadas por personas, por lo que el modelo puede reproducir errores y convenciones del etiquetador automático.
- Aprendió la notación de sus etiquetas, por ejemplo `1.º` para ordinales, lo que puede producir transcripciones no literales respecto al original.
- Solo soporta portugués; no hay evidencia de funcionamiento en otras lenguas.
- Licencia research-use: restringe el uso comercial; debe revisarse antes de cualquier despliegue productivo.
- Riesgo de alucinación y de sustituciones plausibles en pasajes degradados, propio de los modelos HTR.
- Los resultados publicados corresponden al pipeline completo, no al reconocedor aislado, por lo que no deben atribuirse únicamente al modelo.
- Las imágenes de origen pertenecen a la Fundação Pró-Memória de São Carlos; deben respetarse las condiciones de uso de la institución.
- Sin descargas ni likes en Hugging Face: no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/KobayashiShiroe/OCR-pipeline-historical-data
- Repositorio del pipeline: https://github.com/DeguShi/OCR-pipeline-historical-data
- Modelo base PP-OCRv6 medium (Kiessling): https://doi.org/10.5281/zenodo.21788410
