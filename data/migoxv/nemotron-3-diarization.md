# MigoXV/Nemotron-3-Diarization

## Resumen

Nemotron-3-Diarization es un modelo de clasificación de tramas de audio especializado en diarización de hablantes (speaker diarization), es decir, la tarea de segmentar una grabación indicando qué hablante habla en cada instante. Lo desarrolla NVIDIA como parte de la familia Nemotron-3 y esta ficha corresponde al repositorio de MigoXV, que redistribuye los pesos oficiales en FP32 en formato safetensors junto con la configuración de carga. El modelo resuelve el problema de identificar hasta 8 hablantes distintos en audio de 16 kHz mono, emitiendo predicciones con una resolución temporal de 10 ms.

Técnicamente se apoya en una arquitectura streaming Sortformer, un diseño de atención orientado a diarización en flujo continuo, con 99,2 millones de parámetros totales (417 tensores) y un tamaño de repositorio de 0,4 GB. Su relevancia actual radica en que permite diarización en tiempo real o casi real sobre audio en streaming, algo crítico para transcripción de reuniones, subtitulado y análisis de llamadas, donde los enfoques offline por lotes no son viables.

El repositorio no introduce cambios en los pesos: según la model card, los ficheros son idénticos byte a byte a los del modelo base `nvidia/Nemotron-3-Diarization` (commit `f667ed73aee57d40cc39428eb768b4fd87a0a29e`). Se distribuye bajo licencia OpenMDW 1.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Streaming Sortformer (clasificacion de tramas de audio para diarizacion de hablantes) |
| Parametros totales | 99.226.504 (417 tensores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio en streaming; salida con paso temporal de 10 ms) |
| Tipos de cuantizacion | FP32 (pesos oficiales en safetensors); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible (la tarea es independiente del idioma en principio, pero no se documenta) |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | safetensors (FP32) |
| Frecuencia de muestreo de entrada | 16 kHz, mono |
| Maximo de hablantes | 8 |
| Resolucion temporal de salida | 10 ms |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Sortformer en variante streaming. Sortformer es un diseño orientado a diarización que procesa tramas de audio y produce, para cada paso temporal, una asignación de hablante, evitando el pipeline clásico de segmentación, clustering y reasignación. La variante streaming permite consumir audio de forma incremental, de modo que las predicciones se generan conforme llega el audio en lugar de requerir la grabación completa. La salida se emite con una granularidad de 10 ms y el modelo está limitado a un máximo de 8 hablantes simultáneos o alternos.

No se dispone en la información proporcionada de datos sobre el volumen de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones adicionales más allá de la propia arquitectura streaming Sortformer. La model card indica que los resultados de evaluación y las limitaciones deben consultarse en la documentación original de NVIDIA. El repositorio de MigoXV es una redistribución: conserva los 417 tensores y la configuración del modelo base sin modificaciones.

## Capacidades

- Diarización de hablantes con hasta 8 hablantes distintos por flujo de audio.
- Procesamiento de audio en streaming (bidireccional según la documentación del proyecto `sortformer-dia`), apto para inferencia en línea.
- Clasificación de tramas de audio con resolución temporal de 10 ms.
- Entrada de audio a 16 kHz mono, formato estándar en telefonía y transcripción.
- Integración con Transformers mediante `Nemotron3DiarizationProcessor` y `Nemotron3DiarizationForAudioFrameClassification`.
- Soporte de peticiones de audio completo (offline) y de flujo continuo a través de `sortformer-dia`.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión ni audio más allá de la clasificación de hablantes.

## Casos de uso

- Transcripción de reuniones con etiquetado de hablante: el modelo segmenta el audio en tramas de 10 ms y asigna cada una a un hablante, lo que permite adjuntar etiquetas de interlocutor a la salida de un sistema ASR y generar actas con "quién dijo qué".
- Atención al cliente y análisis de llamadas: al procesar audio de 16 kHz mono con hasta 8 hablantes, permite separar agente y cliente en grabaciones telefónicas y calcular métricas de turnos de palabra, solapamientos y tiempos de respuesta.
- Subtitulado y accesibilidad en directo: la variante streaming posibilita etiquetar hablantes conforme llega el audio, útil para subtítulos en vivo con identificación de interlocutor en eventos y clases.
- Análisis forense y compliance de grabaciones: la salida con paso de 10 ms permite construir líneas temporales precisas de intervenciones para auditoría de reuniones o verificaciones regulatorias.
- Investigación en diarización y evaluación de pipelines ASR: al ser pesos FP32 idénticos al modelo oficial, sirve como referencia reproducible para comparar sistemas de diarización y medir el impacto del etiquetado de hablante en la calidad de transcripción.
- Integración en plataformas de reuniones y VoIP: el despliegue con `sortformer-dia` sobre GPU permite procesar flujos en tiempo real y enriquecer la transcripción con metadatos de hablante antes de almacenarla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: el modelo tiene 99,2 millones de parámetros, lo que supone aproximadamente 0,4 GB solo en pesos; con activaciones y buffers de audio, el consumo real es mayor pero no se documenta una cifra concreta.
- GPU recomendadas: la model card indica validación en NVIDIA A100 con carga FP32 y `dtype float32`; no se especifican otras GPU probadas.
- GPU de consumo: por tamaño de pesos (0,4 GB) es plausible que quepa en GPU de consumo con suficiente VRAM, pero no se ha documentado ni validado en la información disponible.
- Despliegue: `sortformer-dia` (entorno Poetry, comando `serve` con `--device`, `--dtype` y `--profile latency`) y Transformers con las clases `Nemotron3DiarizationProcessor` y `Nemotron3DiarizationForAudioFrameClassification`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se menciona un perfil `latency` en `sortformer-dia` sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Max. hablantes | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron-3-Diarization (este repo) | 99,2 M | audio 16 kHz mono, salida a 10 ms | 8 | OpenMDW 1.1 | safetensors FP32 |
| pyannote/speaker-diarization (referencia de la categoria) | no disponible en la informacion | audio, pipeline por etapas | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |
| NVIDIA NeMo diarization toolkit | no disponible en la informacion | audio | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |

No se dispone en la información proporcionada de datos de rendimiento comparativo con alternativas, por lo que la comparación se limita a parámetros, formato y licencia. Cualquier comparación cuantitativa con pyannote u otras soluciones requeriría consultar la documentación oficial de NVIDIA.

## Limitaciones y advertencias

- Máximo de 8 hablantes: no se garantiza un comportamiento correcto con más interlocutores simultáneos o alternos.
- Entrada restringida a 16 kHz mono: requiere remuestreo y downmix previos si el audio original es estéreo o de otra frecuencia.
- Sesgos: no se documentan sesgos conocidos en la información disponible; al ser un modelo de NVIDIA, los sesgos dependerán de los datos de entrenamiento originales, no descritos aquí.
- Alucinación: en un modelo de clasificación de tramas el riesgo se traduce en asignaciones erróneas de hablante en solapamientos, ruido o audio de baja calidad; no se documentan tasas de error.
- Idioma: no se documenta el soporte multilingüe ni el comportamiento por idioma.
- Licencia OpenMDW 1.1: es necesario revisar los términos completos del fichero LICENSE antes de uso comercial; la model card remite a las condiciones de OpenMDW 1.1 y a la atribución de NVIDIA en NOTICE.
- Repositorio de terceros: aunque los pesos se declaran idénticos al modelo base, la procedencia debe verificarse contra el commit indicado y los SHA-256 de `source.json` antes de usarlo en producción.
- Versión de Transformers: se requiere una versión que incluya `Nemotron3DiarizationProcessor` y `Nemotron3DiarizationForAudioFrameClassification`; versiones anteriores no cargarán el modelo.
- Sin datos de benchmarks ni de latencia/throughput publicados, por lo que no es posible dimensionar un despliegue en producción a partir de esta ficha.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MigoXV/Nemotron-3-Diarization
- Modelo base en Hugging Face: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Model card original de NVIDIA (commit referenciado): https://huggingface.co/nvidia/Nemotron-3-Diarization/blob/f667ed73aee57d40cc39428eb768b4fd87a0a29e/README.md
- Documentación de Transformers del modelo: https://huggingface.co/docs/transformers/en/model_doc/nemotron3_diarization
- Proyecto `sortformer-dia` (referenciado en la model card, sin URL directa en la información disponible): no disponible
