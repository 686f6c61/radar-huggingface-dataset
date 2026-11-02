# JeevanDai/whisper-small-nepali-backup-2026-11-02

## Resumen

Whisper-small-nepali-backup-2026-11-02 es un ajuste fino (fine-tuning) completo del modelo de reconocimiento automático de voz openai/whisper-small sobre un corpus en nepalí. Lo desarrolla el usuario JeevanDai y se publica como un experimento de validación de calidad de un conjunto de datos ASR en nepalí, no como un modelo listo para producción. El modelo resuelve la transcripción de audio a texto en nepalí y su relevancia radica en que documenta de forma exhaustiva el proceso de entrenamiento, la verificación de artefactos y las métricas obtenidas sobre conjuntos de test externos.

La arquitectura subyacente es la de Whisper small de OpenAI, un transformer encoder-decoder con aproximadamente 241,7 millones de parámetros. El modelo se ha entrenado sobre el split normalizado publicado por el autor, con 20.000 pasos de optimización y un batch efectivo de 64, lo que equivale a unas 2,92 pasadas sobre las filas de entrenamiento elegibles. El checkpoint seleccionado es el 12.000, elegido por parada temprana según el WER de validación.

El modelo está pensado como evidencia de que el corpus normalizado es aprendible y generaliza a tres conjuntos de test externos, no como un producto final. La model card es explícita al señalar que los resultados no certifican cada transcripción ni demuestran causalmente que la limpieza del corpus sea la causa de la mejora. Es, por tanto, un artefacto de investigación reproducible más que un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de hasta 30 segundos por clip; requiere decodificación long-form para grabaciones más largas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | nepalí (ne) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-small (commit 973afd24965f72e36ca33b3055d56a652f456b4d), un transformer encoder-decoder diseñado para ASR. El ajuste fino es completo (full fine-tuning), no un adaptador, sobre el dataset JeevanDai/ASR-Dataset-Collection (commit b36e501cd47f791ac9c3ff742ec3fc55d71d8301). Se realizaron 20.000 pasos de optimización con batch efectivo de 64, lo que supone aproximadamente 2,92 pasadas sobre las filas de entrenamiento elegibles. El entrenamiento duró 4,58 horas, con un pico de memoria GPU asignada de 22,25 GiB. Se retuvieron diez checkpoints reanudables y se seleccionó el checkpoint-12000 mediante parada temprana tras cuatro evaluaciones sin mejora del WER de validación.

La decodificación exportada usa 5 beams, elegidos únicamente sobre validación interna. El autor documenta que este ajuste empeoró ligeramente el WER en el test Bhatta frente a la decodificación greedy (30,47% frente a 30,32%) y mantiene el resultado sin reajustar sobre test. La verificación incluye 96 tests superados, recarga del modelo y del processor en CPU, comprobación de que todos los parámetros son finitos, recálculo de WER/CER desde las predicciones guardadas y persistencia del ancho de beam seleccionado en el export. No se menciona uso de RLHF ni DPO.

## Capacidades

- Reconocimiento automático de voz (ASR) en nepalí: transcripción de audio a texto.
- Decodificación con beam search de 5 beams configurada en el export.
- Procesamiento de clips de hasta 30 segundos; grabaciones más largas requieren la decodificación long-form de Whisper.
- Integración con la librería transformers mediante pipeline de automatic-speech-recognition.
- Compatibilidad con endpoints (tag endpoints_compatible).
- No se documentan capacidades de traducción, tool calling, agentes, visión ni audio más allá del ASR.

## Casos de uso

- Transcripción de audio en nepalí para investigación lingüística: el modelo permite convertir grabaciones de campo en texto para análisis posteriores, con la advertencia de que la calidad varía según la fuente (WER entre 16,98% y 42,67% en validación según el corpus).
- Validación de calidad de corpus ASR: sirve como modelo independiente para comprobar si un conjunto de datos normalizado es aprendible y generaliza, tal como se plantea en la model card.
- Evaluación comparativa de pipelines de limpieza de datos: el autor propone usarlo como referencia para comparar contra un entrenamiento con datos sin limpiar, aunque señala que esa comparación causal aún no se ha hecho.
- Prototipado de subtitulado en nepalí: para clips cortos (hasta 30 segundos) se puede usar el pipeline de transformers con decodificación de 5 beams.
- Reproducción de experimentos: el repositorio incluye scripts, configuración, notebook, lock de entorno y artefactos de verificación para replicar el entrenamiento.
- Análisis de errores por fuente: las tablas de WER/CER por corpus (OpenSLR54, indicvoices, shrutilipi, etc.) permiten identificar fuentes con mayor ruido de etiquetas o diferencias dialectales.

## Benchmarks y rendimiento

Resultados de test externo reportados en la model card:

| Test externo | n | WER pretrained | WER fine-tuned greedy | WER decodificación seleccionada | CER seleccionada |
|---|---:|---:|---:|---:|---:|
| fleurs_ne_np_test | 726 | 151,19% | 29,72% | 28,64% | 9,75% |
| bhatta | 187 | 176,61% | 30,32% | 30,47% | 6,87% |
| indicvoices_nepali_valid | 2829 | 278,41% | 23,09% | 21,86% | 9,07% |

Validación completa (9.510 clips): WER 23,72%, CER 8,04%. Desglose por fuente en validación:

| Fuente | Clips | WER | CER |
|---|---:|---:|---:|
| Bijaya-Khanal-CS-ASR | 132 | 31,83% | 13,86% |
| OpenSLR43-Nepali-TTS | 224 | 19,34% | 3,69% |
| OpenSLR54-Nepali-ASR | 4093 | 16,98% | 5,13% |
| fleurs_ne_np | 267 | 23,39% | 6,74% |
| indicvoices_nepali | 2289 | 19,43% | 7,29% |
| indicvoices_r_nepali | 773 | 19,19% | 6,75% |
| shrutilipi_nepali | 1134 | 27,75% | 7,02% |
| uttam_parajuli_asr | 598 | 42,67% | 19,34% |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento consumió 22,25 GiB en GPU; para inferencia en fp32 se estima en torno a 1 GB de pesos más overhead, y menos aún en fp16 o cuantización, aunque no se proporcionan cifras oficiales de inferencia.
- GPU recomendadas: no disponible en la información proporcionada; el entrenamiento se realizó en una GPU con al menos 22,25 GiB asignados.
- Cabe en GPU de consumo: por tamaño (241,7 M de parámetros) es plausible en GPUs de consumo con suficiente VRAM, pero no se confirma en la documentación.
- Opciones de despliegue: pipeline de transformers (documentado), endpoints compatibles; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JeevanDai/whisper-small-nepali-backup-2026-11-02 | 241,7 M | audio de 30 s por clip | nepalí | no disponible | HuggingFace |
| openai/whisper-small | 241,7 M | audio de 30 s por clip | multilingüe | no disponible | HuggingFace |
| Alternativas ASR en nepalí | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo es un experimento de validación de dataset, no un modelo listo para producción; el autor lo indica explícitamente.
- WER elevado en algunas fuentes (42,67% en uttam_parajuli_asr, 31,83% en Bijaya-Khanal-CS-ASR), lo que puede reflejar ruido de etiquetas, diferencias dialectales u ortográficas, o limitaciones del modelo.
- El modelo preentrenado original presenta inserciones y alucinaciones repetidas, con WER que puede superar el 100%.
- La separación de hablantes es limitada cuando faltan identificadores de hablante en la fuente.
- Los intervalos de confianza se calcularon con bootstrap sobre enunciados, no sobre clústeres de hablantes.
- El ancho de beam de 5 se seleccionó solo sobre validación; empeora ligeramente el WER en Bhatta frente a greedy.
- La licencia no está disponible, lo que impide confirmar si se permite uso comercial.
- Solo soporta nepalí; no se documentan otros idiomas.
- La model card advierte de diferencias ortográficas entre referencia y modelo (por ejemplo, हैन frente a होइन) que no han sido adjudicadas.
- No se ha realizado una comparación causal con datos sin limpiar, por lo que no se puede atribuir la mejora a la limpieza del corpus.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JeevanDai/whisper-small-nepali-backup-2026-11-02
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset: https://huggingface.co/datasets/JeevanDai/ASR-Dataset-Collection
- No se han encontrado otros enlaces relevantes en la búsqueda web.
