# PPPPfff/GigaAM-v3

## Resumen

GigaAM-v3 es un modelo fundacional de reconocimiento automático del habla (ASR) basado en arquitectura Conformer, con entre 220 y 240 millones de parámetros, desarrollado por el equipo de Sber (salute-developers) como tercera generación de la familia GigaAM. El modelo se preentrena sobre 700.000 horas de audio en ruso mediante el objetivo HuBERT-CTC y se distribuye en cinco variantes: `ssl` (encoder auto-supervisado), `ctc` y `rnnt` (ASR con decodificadores CTC y RNN-T respectivamente) y `e2e_ctc`/`e2e_rnnt` (modelos extremo a extremo que generan texto con puntuación y normalización).

La relevancia de esta versión radica en la incorporación de nuevos dominios internos de entrenamiento —conversaciones de call center, habla con música de fondo, habla natural y habla con características atípicas— sobre los que el modelo mejora un 30 % de media respecto a generaciones anteriores, manteniendo la calidad en los benchmarks públicos. En la comparativa publicada, GigaAM-v3 alcanza un WER medio del 8,4 % (variante RNNT) frente al 19,4 % de T-One + LM y el 25,1 % de Whisper, con una diferencia especialmente marcada en habla con trastornos (19,2 % frente a 59,3 % de Whisper).

El modelo se distribuye con licencia MIT, lo que permite uso comercial sin restricciones, y se integra en el ecosistema Hugging Face Transformers mediante `trust_remote_code`. Su tamaño contenido (repo de 0,4 GB) lo hace desplegable en hardware modesto, lo que resulta atractivo para pipelines de transcripción en producción orientados al mercado rusoparlante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer (encoder) con decodificadores CTC y RNN-T según variante; preentrenamiento HuBERT-CTC |
| Parámetros totales | 220–240 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | ruso (ru), inglés (en) según metadatos; el entrenamiento descrito es exclusivamente en ruso |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch`), con `custom_code` y `trust_remote_code=True`; no se indica disponibilidad de GGUF |
| Variantes | `ssl`, `ctc`, `rnnt`, `e2e_ctc`, `e2e_rnnt` |
| Tamaño del repositorio | 0,4 GB |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

GigaAM-v3 emplea un encoder Conformer entrenado con el objetivo HuBERT-CTC, un enfoque auto-supervisado que combina el enmascaramiento predictivo de HuBERT con una cabeza CTC. La variante `ssl` se preentrena sobre 700.000 horas de audio en ruso y sirve como base para el resto de variantes, que se afinan con decodificadores CTC (`ctc`, `e2e_ctc`) o RNN-T (`rnnt`, `e2e_rnnt`). Las variantes end-to-end incorporan además puntuación y normalización de texto directamente en la salida, eliminando la necesidad de un postprocesado separado.

El entrenamiento de esta tercera generación amplía los datos con conjuntos internos que cubren conversaciones de call center, habla con música de fondo, habla natural espontánea y habla con características atípicas (trastornos del habla). Según la model card, esta ampliación produce una mejora media del 30 % en esos dominios sin degradar los resultados en benchmarks públicos. No se detalla en la información disponible el número exacto de tokens de audio, la composición completa del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables habitualmente en ASR).

## Capacidades

- Transcripción de voz a texto en ruso con calidad estado del arte en múltiples dominios (lectura, habla natural, call center, audio con música, habla atípica).
- Decodificación CTC y RNN-T según la variante seleccionada, permitiendo elegir entre latencia y precisión.
- Generación de texto con puntuación y normalización en las variantes `e2e_ctc` y `e2e_rnnt`.
- Preentrenamiento auto-supervisado reutilizable: la variante `ssl` puede servir como base para fine-tuning en tareas de habla adicionales.
- Extracción de representaciones acústicas intermedias mediante el encoder Conformer.
- Interfaz de alto nivel `model.transcribe("example.wav")` para inferencia directa.
- Soporte de los idiomas ruso e inglés según los metadatos del repositorio, aunque el entrenamiento descrito se centra en ruso.
- No se documenta soporte de tool calling, agentes ni modos de razonamiento, por tratarse de un modelo ASR y no de un LLM.

## Casos de uso

- Transcripción de call centers: el modelo se ha entrenado específicamente con conversaciones de call center y logra un WER del 9,5 % (RNNT) en ese dominio, frente al 13,5 % de T-One + LM y el 23,9 % de Whisper, lo que lo hace adecuado para auditar llamadas, generar actas y analizar calidad de atención.
- Subtitulado y transcripción de medios: la variante `e2e_rnnt` entrega texto puntuado y normalizado directamente, lo que simplifica la generación de subtítulos para vídeo y pódcast en ruso sin postprocesado adicional.
- Asistentes de voz y dictado: con 220–240 M de parámetros y un repo de 0,4 GB, el modelo cabe en GPUs de consumo y puede ejecutarse en local para dictado o comandos de voz con baja latencia.
- Accesibilidad para habla atípica: el entrenamiento con habla con trastornos reduce el WER al 19,2 % (RNNT) frente al 59,3 % de Whisper, lo que permite construir herramientas de transcripción para personas con dificultades del habla.
- Análisis de reuniones y notas automáticas: la robustez en habla natural (6,9 % de WER en RNNT) y en audio con ruido de fondo permite transcribir reuniones y generar resúmenes posteriores con un LLM.
- Fine-tuning sobre la variante `ssl`: al ser un encoder auto-supervisado con licencia MIT, puede reutilizarse como base para tareas de habla específicas (diarización, clasificación de emociones, keyword spotting) con datasets propios.
- Procesamiento por lotes de archivos de audio en pipelines de datos: la inferencia vía `transformers` con `trust_remote_code` permite integrar la transcripción en flujos ETL o de anotación de corpus.

## Benchmarks y rendimiento

Word Error Rate (%) publicado en la model card:

| Conjunto | V3_CTC | V3_RNNT | T-One + LM | Whisper |
|---|---:|---:|---:|---:|
| Open Datasets | 3,0 | 2,6 | 5,7 | 12,0 |
| Golos Farfield | 4,5 | 3,9 | 12,2 | 16,7 |
| Natural Speech | 7,8 | 6,9 | 14,5 | 13,6 |
| Disordered Speech | 20,6 | 19,2 | 51,0 | 59,3 |
| Callcenter | 10,3 | 9,5 | 13,5 | 23,9 |
| **Media** | **9,2** | **8,4** | **19,4** | **25,1** |

En la comparación end-to-end de `e2e_ctc` y `e2e_rnnt` frente a Whisper-large-v3, empleando Gemini 2.5 Pro como juez LLM, los modelos GigaAM-v3 ganan con un margen medio de 70:30 según la model card. No se especifica la versión concreta de Whisper empleada en la tabla de WER.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 220–240 M de parámetros, la inferencia en FP32 requiere aproximadamente 1 GB de pesos, y en FP16 alrededor de 0,5 GB, a lo que se suma el consumo del runtime y del procesamiento de audio.
- GPU recomendadas: cualquier GPU con al menos 2–4 GB de VRAM debería ser suficiente; no se detallan modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Compatibilidad con GPU de consumo: sí, por el tamaño del modelo y del repositorio (0,4 GB), aunque no se confirma oficialmente en la model card.
- Opciones de despliegue: `transformers` (versión recomendada 4.57.1) con `trust_remote_code=True`, `torch==2.8.0` y `torchaudio==2.8.0`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Dependencias adicionales: `pyannote-audio==4.0.0`, `torchcodec==0.7.0`, `hydra-core`, `omegaconf` y `sentencepiece`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | WER medio (según tabla) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GigaAM-v3 (RNNT) | 220–240 M | ru, en (metadatos) | 8,4 % | MIT | Hugging Face |
| GigaAM-v3 (CTC) | 220–240 M | ru, en (metadatos) | 9,2 % | MIT | Hugging Face |
| T-One + LM | no disponible | ruso | 19,4 % | no disponible | no disponible |
| Whisper (versión no especificada) | no disponible | multilingüe | 25,1 % | no disponible | no disponible |
| Whisper-large-v3 (comparación end-to-end) | no disponible | multilingüe | pierde 70:30 frente a GigaAM-v3 e2e según juicio LLM | no disponible | no disponible |

La comparativa se limita a los datos publicados en la model card; no se dispone de información sobre parámetros, contexto o licencia de T-One ni de las versiones concretas de Whisper empleadas.

## Limitaciones y advertencias

- El entrenamiento descrito se centra exclusivamente en ruso; aunque los metadatos listan inglés, no se documenta calidad ni volumen de datos en ese idioma, por lo que su uso en inglés no está respaldado por benchmarks.
- El WER en habla con trastornos sigue siendo elevado en términos absolutos (19,2 % en RNNT), aunque muy inferior al de alternativas.
- No se han publicado datos sobre sesgos demográficos, acentos regionales específicos ni variedades del ruso distintas de las cubiertas por los datasets de entrenamiento.
- Riesgo de alucinación y de transcripciones incorrectas en audio de baja calidad, solapamiento de hablantes o dominios no representados en el entrenamiento; no se documentan mecanismos de mitigación.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar dicho código en entornos de producción.
- No se especifica la longitud máxima de audio procesable ni el contexto temporal del encoder, lo que limita la planificación de despliegues con audios largos.
- No se documentan cuantizaciones oficiales (GGUF, ONNX, etc.), lo que puede complicar el despliegue en entornos sin PyTorch.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y el ID del autor (`PPPPfff`) no coincide con el identificador `ai-sage` que aparece en el ejemplo de uso de la model card; conviene verificar la procedencia y el repositorio oficial antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/PPPPfff/GigaAM-v3
- Paper (InterSpeech 2025): https://arxiv.org/abs/2506.01192
- Repositorio GitHub: https://github.com/salute-developers/GigaAM
- Métricas detalladas: https://github.com/salute-developers/GigaAM/blob/main/evaluation.md
- Ejemplo en Colab: https://github.com/salute-developers/GigaAM/blob/main/colab_example.ipynb
