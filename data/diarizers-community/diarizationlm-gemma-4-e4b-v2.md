# diarizers-community/DiarizationLM-Gemma-4-E4B-v2

## Resumen

DiarizationLM-Gemma-4-E4B-v2 es un modelo de lenguaje especializado en el post-procesamiento de salidas de reconocimiento automático de voz (ASR) y diarización de hablantes, desarrollado por la comunidad diarizers-community. Se construye sobre el modelo fundacional google/gemma-4-E4B, un transformer denso de aproximadamente 8.000 millones de parámetros totales según los pesos en safetensors, y aplica el marco DiarizationLM descrito en el paper arXiv:2401.03506 para corregir, fusionar y optimizar transcripciones con etiquetas de hablante. La versión v2 se entrena igual que la v1, pero incorpora datos sintéticos no ingleses para ampliar la cobertura multilingüe.

El modelo resuelve un problema muy concreto en pipelines de transcripción de reuniones y conversaciones: las salidas de ASR más diarización suelen contener errores de atribución de hablante, cambios de turno mal detectados y palabras mal transcritas. DiarizationLM reformula esa corrección como una tarea de generación de texto, donde el modelo recibe la hipótesis y devuelve una versión corregida. Esto permite reducir métricas como WDER y cpWER sin tocar el frontend acústico. Es relevante ahora porque los pipelines de diarización open source (Whisper, pyannote, ECAPA-TDNN) ya son viables en producción, y la capa de post-procesamiento con LLM marca la diferencia entre una transcripción utilizable y una que exige revisión manual.

La ficha se basa en la información publicada en Hugging Face y en la model card del autor. El repositorio incluye pesos en bfloat16 (~16 GB) y una cuantización GGUF Q4_K_M (~5,3 GB), lo que facilita el despliegue tanto en servidores como en hardware de consumo. La licencia es Apache 2.0, aunque el modelo base Gemma 4 E4B tiene sus propias condiciones de uso que conviene revisar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base google/gemma-4-E4B), adaptado al marco DiarizationLM |
| Parámetros totales | 7.996.156.490 (~8B) según safetensors |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el tag "long-context" sugiere contexto extendido, sin cifra concreta) |
| Tipos de cuantización | bfloat16 (safetensors) y GGUF Q4_K_M (4 bits) |
| Idiomas soportados | No disponible (entrenado con datos sintéticos no ingleses para soporte multilingüe, sin lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E4B, un transformer denso de aproximadamente 8.000 millones de parámetros, y se ajusta con el marco DiarizationLM. Este marco trata la corrección de ASR y diarización como una tarea seq2seq: la entrada es la hipótesis del frontend acústico (texto transcrito más etiquetas de hablante) y la salida es la transcripción corregida con turnos y hablantes reasignados. El ajuste se realiza sobre el modelo base sin cambios arquitectónicos estructurales conocidos; la información disponible no detalla el número exacto de tokens de entrenamiento ni la composición completa del dataset.

La diferencia principal de la v2 respecto a la v1 es la incorporación de datos sintéticos no ingleses para mejorar el comportamiento multilingüe. La model card no especifica si hubo RLHF, DPO u otras fases de alineación adicionales, ni detalla innovaciones como decodificación especulativa o atención lineal. El pipeline de referencia combina un frontend acústico (USM + Turn-to-Diarize, o el frontend open source diarizers con Whisper-large-v3-turbo, pyannote/seg-3.0, ECAPA-TDNN y SpectralClusterer) con este modelo como capa de post-procesamiento.

## Capacidades

- Post-procesamiento de transcripciones ASR: corrige palabras mal transcritas y errores de puntuación en la hipótesis de entrada.
- Corrección de diarización: reasigna etiquetas de hablante, corrige cambios de turno y fusiona o separa segmentos mal atribuidos.
- Reducción de WDER y cpWER sobre salidas de frontends acústicos, con mejoras medidas frente a la línea base y frente a la v1 en varios benchmarks.
- Soporte multilingüe mediante entrenamiento con datos sintéticos no ingleses (sin lista explícita de idiomas).
- Procesamiento de conversaciones multi-hablante, incluyendo escenarios de 2 a 10 hablantes según los experimentos reportados (Fisher, CALLHOME, ICSI, AMI).
- Compatibilidad con el ecosistema transformers y con llama.cpp/Ollama a través del GGUF Q4_K_M.
- Integración en pipelines end-to-end mediante la librería diarizers y la librería diarizationlm de Google.
- Capacidad image-text-to-text heredada del pipeline declarado, aunque la información disponible no detalla su uso práctico en esta adaptación.

## Casos de uso

- Transcripción de reuniones corporativas: el modelo se coloca tras un frontend de diarización (por ejemplo, diarizers con Whisper y pyannote) para corregir la atribución de turnos en grabaciones de AMI o ICSI, donde los benchmarks muestran reducciones de WDER de hasta un 0,86 % absoluto frente a la línea base.
- Actas automáticas de llamadas de atención al cliente: en conversaciones de dos hablantes (tipo CALLHOME), el modelo reduce el WDER del frontend open source de 9,42 % a 5,32 %, lo que disminuye la revisión manual de quién dijo qué en cada llamada.
- Post-procesamiento de transcripciones de centros de contacto con múltiples agentes: la capacidad de reasignar hablantes ayuda en grabaciones con más de dos interlocutores, aunque conviene validar el recuento automático de hablantes en cada dominio.
- Generación de subtítulos y transcripciones para contenido audiovisual: el modelo corrige la segmentación por hablante antes de publicar subtítulos, reduciendo errores visibles de atribución en entrevistas y debates.
- Investigación en diarización y ASR: sirve como componente de referencia para comparar mejoras de frontends acústicos, ya que la model card publica métricas con intervalos de confianza bootstrap y pruebas pareadas frente a la línea base.
- Despliegue en entornos con hardware limitado: la cuantización GGUF Q4_K_M (~5,3 GB) permite ejecutar el post-procesamiento en estaciones de trabajo con GPU de consumo, integrándolo en herramientas locales de transcripción vía llama.cpp u Ollama.
- Pipeline de documentación clínica o legal con grabaciones multiparte: el modelo puede normalizar la transcripción antes de que un humano la revise, aunque en dominios regulados requiere auditoría adicional por el riesgo de alucinación.

## Benchmarks y rendimiento

Resultados publicados en la model card con frontend USM + Turn-to-Diarize (intervalos de confianza bootstrap al 95 %):

| Benchmark | Sistema | WER (%) | WDER (%) | cpWER (%) | SpkCntMAE |
|---|---|---:|---:|---:|---:|
| Fisher (TEST FULL, 172 sesiones) | Baseline (USM + Turn-to-Diarize) | 15,37 | 5,32 [4,93; 5,74] | 20,88 [19,97; 21,88] | 0,215 [0,151; 0,291] |
| Fisher | DiarizationLM-8b-Fisher-v2 (Llama 3 8B) | 15,37 | 3,28 | 18,37 | No disponible |
| Fisher | DiarizationLM-Gemma-4-E4B-v1 (4B) | 15,37 | 2,99 [2,65; 3,37] | 17,62 [16,76; 18,56] | 0,093 [0,047; 0,145] |
| Fisher | DiarizationLM-Gemma-4-E4B-v2 (4B) | 15,37 | 3,03 [2,70; 3,40] | 17,63 [16,77; 18,55] | 0,105 [0,058; 0,157] |
| CALLHOME (TEST FULL, 20 llamadas) | Baseline | 15,22 | 7,74 [6,07; 9,65] | 24,31 [21,27; 27,43] | 0,050 [0,000; 0,150] |
| CALLHOME | DiarizationLM-8b-Fisher-v2 | 15,22 | 6,66 | 23,57 | No disponible |
| CALLHOME | v1 (4B) | 15,22 | 4,92 [3,46; 6,75] | 20,69 [17,98; 23,66] | 0,000 |
| CALLHOME | v2 (4B) | 15,22 | 5,20 [3,58; 7,15] | 21,03 [18,19; 24,08] | 0,000 |
| ICSI (TEST FULL, 3 sesiones) | Baseline | 29,42 | 14,70 [11,65; 20,29] | 43,90 [39,10; 51,67] | 0,333 |
| ICSI | v1 (4B) | 29,42 | 14,10 [10,77; 19,94] | 43,32 [38,38; 51,20] | 0,333 |
| ICSI | v2 (4B) | 29,42 | 13,96 [10,70; 19,26] | 43,28 [38,41; 50,57] | 0,333 |
| AMI (TEST WORD FULL, 16 sesiones) | Baseline | 24,33 | 15,68 [10,64; 21,11] | 40,32 [32,43; 48,00] | 0,500 |
| AMI | v1 (4B) | 24,33 | 14,89 [9,80; 20,38] | 39,57 [31,57; 47,29] | 0,438 |
| AMI | v2 (4B) | 24,33 | 14,82 [9,80; 20,04] | 39,54 [31,63; 46,95] | 0,500 |

Resultados con el frontend open source diarizers v1.0.1:

| Benchmark | Sistema | WER (%) | WDER (%) | cpWER (%) | SpkCntMAE |
|---|---|---:|---:|---:|---:|
| Fisher English (172) | Frontend diarizers v1.0.1 | 20,80 | 4,35 (raw 4,45) | 24,78 (oracle 20,46) | 0,000 |
| Fisher English | + v1 (LG-TPST) | 20,80 | 2,59 (raw 2,65) | 21,91 (raw 21,99) | 0,000 |
| Fisher English | + v2 (LG-TPST) | 20,80 | 2,55 (raw 2,64) | 21,85 (raw 21,94) | 0,000 |
| CALLHOME English (20) | Frontend diarizers v1.0.1 | 21,25 | 9,42 (raw 9,47) | 32,42 (oracle 21,08) | 0,050 |
| CALLHOME English | + v1 | 21,25 | 4,89 (LG-TPST 5,98) | 25,91 (LG-TPST 27,69) | 0,050 |
| CALLHOME English | + v2 | 21,25 | 5,32 (LG-TPST 6,58) | 26,18 (LG-TPST 28,27) | 0,050 |
| ICSI (3) | Frontend diarizers v1.0.1 | 35,29 | 23,48 (raw 23,58) | 48,97 (oracle 34,97) | 3,333 |
| ICSI | + v1 (LG-TPST) | 35,29 | 23,10 | No disponible en el extracto | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB para contexto moderado.
- VRAM estimada con GGUF Q4_K_M: aproximadamente 5,3 GB de pesos, más overhead; viable en GPUs de consumo con 8-12 GB.
- GPUs recomendadas: A100 o H100 para despliegues de producción en bfloat16 con alta concurrencia; RTX 4090 (24 GB) para bfloat16 en un solo dispositivo; RTX 3090, RTX 4070 Ti o superiores para la versión GGUF.
- Cabe en GPU de consumo: sí, con la cuantización Q4_K_M en GPUs de 8 GB o más; en bfloat16 requiere GPUs de 24 GB o más.
- Opciones de despliegue: transformers (safetensors), llama.cpp, Ollama, llama-cpp-python (GGUF); integración con las librerías diarizers y diarizationlm.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WDER Fisher (%) | WDER CALLHOME (%) | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| DiarizationLM-Gemma-4-E4B-v2 | ~8B (4B denso según model card) | No disponible | 3,03 | 5,20 | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| DiarizationLM-Gemma-4-E4B-v1 | ~8B (4B denso según model card) | No disponible | 2,99 | 4,92 | Apache 2.0 | Hugging Face |
| DiarizationLM-8b-Fisher-v2 (Llama 3 8B) | 8B | No disponible | 3,28 | 6,66 | No disponible | Hugging Face |
| Baseline USM + Turn-to-Diarize (sin LLM) | No aplica | No aplica | 5,32 | 7,74 | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo no es un producto oficialmente soportado por Google, tal como indica la propia model card.
- Riesgo de alucinación: al ser un modelo generativo, puede introducir palabras o reasignaciones de hablante no presentes en la hipótesis original; conviene validar en dominios sensibles.
- Los resultados son mixtos frente a la v1: mejora en ICSI y AMI con el frontend USM, pero empeora ligeramente en Fisher y CALLHOME con el frontend open source; la elección entre v1 y v2 depende del dominio y del frontend.
- El recuento de hablantes (SpkCntMAE) en AMI empeora en la v2 (0,500) frente a la v1 (0,438), lo que sugiere cautela en escenarios con recuento automático de hablantes.
- La lista de idiomas soportados no está publicada; el entrenamiento multilingüe se basa en datos sintéticos no ingleses, sin métricas por idioma en la información disponible.
- La licencia Apache 2.0 del artefacto no exime de revisar las condiciones del modelo base google/gemma-4-E4B, que pueden imponer restricciones adicionales al uso comercial.
- El WER del frontend acústico no mejora con el post-procesamiento (se mantiene constante en las tablas); el beneficio se concentra en WDER y cpWER, no en la calidad léxica de la transcripción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validación externa por parte de la comunidad.
- El tamaño del repositorio es de 21,3 GB, lo que requiere planificación de almacenamiento y ancho de banda en despliegues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/diarizers-community/DiarizationLM-Gemma-4-E4B-v2
- Versión anterior v1: https://huggingface.co/diarizers-community/DiarizationLM-Gemma-4-E4B-v1
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- Paper DiarizationLM: https://arxiv.org/abs/2401.03506
- Pipeline end-to-end diarizers: https://github.com/diarizers-community/diarizers
- Librería DiarizationLM de Google: https://github.com/google/speaker-id/tree/master/DiarizationLM
