# ishiki-labs/ishiki-asr-0.5

## Resumen

Ishiki-ASR-0.5 es un modelo de reconocimiento automatico del habla (ASR) desarrollado por Ishiki Labs Inc. como ajuste fino del modelo de NVIDIA `nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B`. Su proposito es la transcripcion de audio a texto en ingles, con enfasis en la calidad sobre los conjuntos de evaluacion del Open ASR Leaderboard. Se publica bajo la licencia OpenMDW-1.1 de NVIDIA, al ser una obra derivada del modelo base.

El modelo hereda la arquitectura del Nemotron-3.5-Transcribe-30B-A4B, un transformer con mezcla de expertos (MoE) de 30 mil millones de parametros totales y aproximadamente 4 mil millones de parametros activos por token, segun indica el sufijo A4B de su identificador. Esta construccion permite un coste de inferencia mas cercano al de un modelo de 4B que al de uno denso de 30B, manteniendo la capacidad del modelo completo.

La relevancia de esta ficha es doble: por un lado, presenta resultados competitivos en los conjuntos de referencia del Open ASR Leaderboard (WER medio de 3,18 % en diez conjuntos publicos y 3,62 % en los siete conjuntos cortos por defecto de la API); por otro, es un modelo muy reciente con cero descargas y cero likes en el momento de la consulta, por lo que su adopcion en produccion aun no esta contrastada. La informacion disponible sobre arquitectura interna, datos de entrenamiento e idiomas es limitada y se remite en gran medida a la documentacion del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivada de NVIDIA Nemotron-3.5-Transcribe-30B-A4B |
| Parametros totales | 30B (segun el identificador del modelo base) |
| Parametros activos | Aproximadamente 4B (sufijo A4B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible en la model card; los benchmarks publicados son en ingles (en y en-IN) |
| Licencia | OpenMDW-1.1 (NVIDIA Open Model License Agreement) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Nemotron-3.5-Transcribe-30B-A4B de NVIDIA, un modelo de transcripcion de voz construido sobre una arquitectura de mezcla de expertos con 30B parametros totales y unos 4B activos. La model card de Ishiki no detalla la arquitectura interna (codificador de audio, proyector, decodificador, mecanismo de atencion) ni la composicion exacta del dataset de ajuste; unicamente indica que se trata de una obra derivada y remite a la divulgacion de datos de entrenamiento del modelo base de NVIDIA.

En cuanto al proceso de entrenamiento, la model card declara explicitamente que no se utilizaron conjuntos de test del Open ASR Leaderboard durante la optimizacion, lo que refuerza la validez de los resultados reportados. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni el numero de tokens de audio o horas de entrenamiento empleadas. Tampoco se documentan innovaciones tecnicas propias mas alla del ajuste fino sobre el modelo base.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con resultados especificos en variantes en-US y en-IN.
- Transcripcion de audio corto (short-form) segun la terminologia de la model card y del Open ASR Leaderboard.
- Buen rendimiento en audio limpio (LibriSpeech test-clean: 0,58 % WER; VoxPopuli: 0,90 % WER) y en dominios especializados (SPGISpeech: 1,21 % WER).
- Manejo de audio con ruido o espontaneo con degradacion controlada (URGENT 2024: 8,66 % WER; AMI-Cleaned: 5,14 % WER).
- Soporte de API HTTP mediante el endpoint `/v1/transcribe`, con parametros de modelo, idioma y almacenamiento (`store=false`).
- Procesamiento de audio en memoria sin registro ni retencion, segun declara el autor para la API de evaluacion.
- No se documentan capacidades de traduccion, diarizacion, marcas de tiempo, tool calling ni modos de razonamiento.

## Casos de uso

- Transcripcion de reuniones y actas: el WER de 5,14 % en AMI-Cleaned indica un rendimiento solido en audio de reunion, adecuado para generar actas automaticas o resumenes a partir de la transcripcion.
- Subtitulado de contenido audiovisual en ingles: el 1,83 % WER en TED-LIUM y el 0,90 % en VoxPopuli lo hacen util para generar subtitulos de charlas, conferencias y discursos parlamentarios con alta fidelidad.
- Transcripcion de llamadas de atencion al cliente: el 1,21 % WER en SPGISpeech (audio financiero limpio) sugiere buen comportamiento en grabaciones telefonicas de calidad controlada para analitica de contact center.
- Dictado y notas de voz: el 0,58 % WER en LibriSpeech test-clean lo posiciona para aplicaciones de dictado donde la precision literal es critica (documentacion clinica, legal o periodistica).
- Procesamiento de audio con ruido o espontaneo: el 8,66 % WER en URGENT 2024 (y 4,02 % en su variante limpia) lo hace viable para transcripcion de audio de campo, entrevistas o grabaciones no controladas, asumiendo mayor tasa de error.
- Localizacion para el mercado indio: el 2,34 % WER en Voice Arena Monsoon (en-IN) lo hace adecuado para aplicaciones de voz dirigidas a hablantes de ingles indio.
- Integracion via API en pipelines de terceros: el endpoint `/v1/transcribe` con autenticacion Bearer permite incorporar la transcripcion como servicio en flujos de analitica, indexacion de audio o busqueda semantica.

## Benchmarks y rendimiento

Resultados publicados en la model card (WER, menor es mejor):

| Conjunto de evaluacion | WER (%) |
|---|---|
| AMI-Cleaned | 5,14 |
| Earnings22-Cleaned-AA-chunked | 3,54 |
| GigaSpeech-Cleaned | 3,55 |
| SPGISpeech | 1,21 |
| URGENT 2024 | 8,66 |
| URGENT 2024 (Clean) | 4,02 |
| Voice Arena Monsoon (en-IN) | 2,34 |
| VoxPopuli-AA-Cleaned | 0,90 |
| LibriSpeech (test-clean) | 0,58 |
| LibriSpeech (test-other) | 1,90 |
| TED-LIUM (test) | 1,83 |
| Multilingual LibriSpeech (en) | 3,10 |
| Common Voice (en) | 3,75 |
| Media de 10 conjuntos publicos del leaderboard | 3,18 |
| Media de 7 conjuntos cortos por defecto de la API | 3,62 |

No se dispone de comparaciones directas con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 30B parametros totales y unos 4B activos, la huella de memoria depende criticamente del esquema de cuantizacion y del soporte de MoE en el runtime; no se aportan cifras.
- GPU recomendadas: no disponible. Por el tamano del modelo base, es previsible que requiera GPU de centro de datos (A100, H100 o superiores), pero no se confirma en la documentacion.
- Compatibilidad con GPU de consumo: no confirmada. Un modelo de 30B totales con 4B activos podria ser candidato a cuantizacion agresiva en GPUs de consumo de gama alta, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: la model card solo documenta el uso mediante la API HTTP de Ishiki (`/v1/transcribe`). No se mencionan vLLM, llama.cpp, Ollama, TGI ni pesos publicados para despliegue local.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de otros modelos ASR en la informacion proporcionada para establecer una comparativa rigurosa. La model card unicamente referencia al modelo base NVIDIA Nemotron-3.5-Transcribe-30B-A4B, del que este modelo es un ajuste fino, sin ofrecer sus metricas para contrastar la mejora.

| Modelo | Parametros | Contexto | WER medio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ishiki-labs/ishiki-asr-0.5 | 30B totales / ~4B activos | no disponible | 3,18 (10 conjuntos publicos) | OpenMDW-1.1 | Hugging Face y API de Ishiki |
| nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B | 30B totales / ~4B activos | no disponible | no disponible | OpenMDW-1.1 | Hugging Face |
| Otros modelos ASR comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card. Al entrenarse sobre datos del modelo base de NVIDIA, puede heredar sesgos acusticos y dialectales de dicho corpus.
- Riesgo de alucinacion: no cuantificado. En ASR, el riesgo se manifiesta como sustituciones, omisiones o inserciones de texto, especialmente en audio ruidoso (URGENT 2024: 8,66 % WER) o con acentos no representados.
- Limitaciones de idioma: los benchmarks publicados son exclusivamente en ingles (en-US y en-IN). No hay evidencia de soporte multilingue; la model card no lista idiomas soportados.
- Limitaciones de contexto: no se especifica la longitud maxima de audio por peticion; la documentacion habla de audio short-form, lo que sugiere limitaciones para grabaciones largas sin segmentacion previa.
- Restricciones de licencia: al ser obra derivada de un modelo de NVIDIA, se rige por la NVIDIA Open Model License Agreement (OpenMDW-1.1). Es imprescindible revisar `LICENSE` y `THIRD_PARTY_NOTICES.md` antes de un uso comercial, y mantener la atribucion a NVIDIA Corporation e Ishiki Labs Inc.
- Madurez: el modelo tiene cero descargas y cero likes en el momento de la consulta y fue creado el 16 de noviembre de 2026, por lo que no existe validacion independiente de los resultados reportados.
- Dependencia de API: la unica via de uso documentada es la API de Ishiki; no se confirma la publicacion de pesos para inferencia local, lo que limita la portabilidad y la auditoria del modelo.
- Privacidad: la model card declara procesamiento en memoria y descarte inmediato del audio en la API de evaluacion, pero no se detallan garantias equivalentes para el endpoint de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ishiki-labs/ishiki-asr-0.5
- Modelo base en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Divulgacion de datos de entrenamiento del modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B#training-testing-and-evaluation-datasets
- Open ASR Leaderboard (dataset de referencia): https://huggingface.co/datasets/hf-audio/open-asr-leaderboard
- ESB datasets (test only): https://huggingface.co/datasets/hf-audio/esb-datasets-test-only-sorted
- Voice Arena Monsoon en-IN test: https://huggingface.co/datasets/voice-arena-leaderboard/Monsoon-en-IN-test
