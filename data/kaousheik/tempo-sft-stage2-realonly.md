# Kaousheik/tempo-sft-stage2-realonly

## Resumen

TEMPO (Temporally-grounded Multi-task Post-training) es un enfoque de post-entrenamiento para modelos de lenguaje de audio de gran tamano (LALM), presentado por Kaousheik Jayakumar, investigador de la Universidad de Maryland. Este checkpoint concreto, `tempo-sft-stage2-realonly`, corresponde a la variante de la Tabla 2 del paper TEMPO, entrenada exclusivamente con datos reales (sin la etapa sintetica del Stage 1) durante 1 epoca con learning rate 5e-5, para aislar la contribucion del curriculum de entrenamiento.

El modelo se construye sobre Audio Flamingo 3 de NVIDIA (encoder de audio Whisper-large congelado + Qwen2-7B), e incorpora un proyector multimodal consciente del tiempo con codificaciones sinusoidales de reloj de pared y aproximadamente 601 tokens atomicos de timestamp con resolucion de 0,1 segundos. Con 8.271.605.248 parametros, TEMPO es el primer modelo unificado que aborda tareas de timestamping en audio, habla y musica, incluyendo ASR multi-hablante, diarizacion, grounding temporal, captioning denso de audio y captioning musical con timestamps.

La relevancia actual de este modelo radica en su capacidad para intercalar texto con tokens temporales en las respuestas, lo que permite localizar eventos auditivos en el tiempo con precision de decimas de segundo. Su licencia es de uso exclusivo para investigacion academica no comercial (nvidia-research-only), lo que limita su despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Flamingo 3 (encoder Whisper-large congelado + Qwen2-7B) con proyector temporal consciente del tiempo |
| Parametros totales | 8.271.605.248 (8,27 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2-7B soporta 32K tokens, pero el contexto efectivo tras el post-entrenamiento no se especifica) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos completos en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | nvidia-research-only (uso exclusivo para investigacion academica no comercial) |
| Formato de pesos | safetensors (pesos del transformer) + `time_proj.pt` (PyTorch, proyector temporal) |

## Arquitectura y entrenamiento

La arquitectura se basa en Audio Flamingo 3 de NVIDIA, que combina un encoder de audio Whisper-large congelado con el modelo de lenguaje Qwen2-7B. Sobre esta base, TEMPO anade un proyector multimodal consciente del tiempo que inyecta codificaciones sinusoidales de reloj de pared en los frames de audio, y un vocabulario de aproximadamente 601 tokens atomicos de timestamp con resolucion de 0,1 segundos. El modelo es denso (no es de tipo Mixture of Experts) y el encoder de audio permanece congelado durante el entrenamiento.

El entrenamiento se realizo en la etapa de SFT (Stage 2) del pipeline TEMPO, utilizando exclusivamente datos reales del dataset `Kaousheik/tempo` (config `sft_stage2`), sin la etapa sintetica del Stage 1. Se entreno durante 1 epoca con learning rate 5e-5. Los corpora de entrenamiento incluyen AMI, ICSI, AudioSet Strong, TACOS, Slakh2100 y LibriSpeech (CC BY 4.0) y ESC-50 (CC BY-NC 3.0). Las cinco tareas se seleccionan mediante una etiqueta en el prompt, y la respuesta intercala texto con tokens de timestamp.

## Capacidades

- Transcripcion de voz multi-hablante con marcas temporales: genera transcripciones con tokens `<|t0|>` que indican el inicio y fin de cada segmento de habla.
- Diarizacion de hablantes: identifica y atribuye segmentos de audio a hablantes concretos con timestamps.
- Grounding temporal de audio: localiza el intervalo exacto (`<|t0|> to <|t1|>`) en el que ocurre un evento auditivo especifico.
- Captioning denso de audio: genera descripciones textuales de eventos auditivos intercaladas con timestamps de inicio y fin.
- Captioning de musica con timestamps: produce anotaciones de instrumentos, tempo, acordes y estadisticas con spans temporales (`[instrument]`, `[tempo]`, `[chord]`, `[stats]`).
- Seleccion de tarea mediante etiquetas en el prompt: `[speech:asr]`, `[speech:diar]`, `[audio:ground]`, `[audio:caption]`, `[audio:music]`.
- Capacidades multilingues: no especificadas en la informacion disponible.

## Casos de uso

- Transcripcion de reuniones con atribucion de hablantes: el modelo puede generar transcripciones multi-hablante con timestamps precisos, util para actas automaticas de reuniones corporativas o judiciales. Su resolucion de 0,1 segundos permite reconstruir la cronologia exacta de intervenciones.
- Analisis de grabaciones de entrevistas o testimonios: la diarizacion con timestamps permite separar y localizar las intervenciones de cada interlocutor en grabaciones largas, facilitando la busqueda posterior por segmento.
- Indexacion y busqueda de contenido audiovisual: el grounding temporal y el captioning denso permiten generar un indice de eventos auditivos con su posicion exacta en el audio, habilitando busquedas semanticas ("donde se menciona X") en archivos de media.
- Anotacion de datasets de audio para investigacion: los captions densos con timestamps pueden servir para generar datasets de entrenamiento de otros modelos de audio, o para validar y enriquecer anotaciones existentes.
- Analisis musical automatico: el captioning de musica con spans de instrumentos, tempo y acordes puede utilizarse para describir estructuras de canciones, identificar secciones instrumentales y generar documentacion musical automatizada.
- Investigacion academica en comprension auditiva: como modelo de investigacion, permite estudiar el impacto del curriculum de entrenamiento (este checkpoint es una variante de ablacion que aísla el efecto de los datos reales frente a los sinteticos).

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en la model card para este checkpoint (Stage 2, datos reales, sin Stage 1 sintetico):

| Tarea | Metrica | Resultado |
|---|---|---|
| ASR multi-hablante | MAE (error absoluto medio) | 0,85 |
| ASR multi-hablante | mIoU | 64,8 |
| ASR multi-hablante | WER | 47,0 |
| Diarizacion | DER (tasa de error de diarizacion) | 25,1 |
| Captioning denso | eF1 | 55,2 |
| Grounding temporal | F1 | 44,6 |

No se han publicado resultados comparativos con otros modelos en la informacion proporcionada. Estos valores corresponden a la variante de ablacion con datos reales; el paper TEMPO reporta los resultados completos en su Tabla 2.

## Requisitos de hardware

- VRAM estimada: ~16,5 GB en FP16 para los 8,27 B de parametros; ~8,3 GB en INT8; ~4,1 GB en INT4 (si se cuantiza, aunque no se proporcionan cuantizaciones oficiales).
- GPU recomendadas: NVIDIA A100 (40/80 GB) o H100 para inferencia sin cuantizacion; RTX 4090 (24 GB) o RTX 3090 (24 GB) pueden ejecutar el modelo en FP16 con margen, y en cuantizacion inferior caben en GPUs de 12-16 GB.
- Despliegue: el repositorio incluye pesos completos en safetensors y el proyector `time_proj.pt` en formato PyTorch, que es obligatorio cargar aparte. Esto implica que el despliegue requiere codigo de inferencia personalizado que integre el proyector temporal; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas temporales | Licencia |
|---|---|---|---|---|
| TEMPO (este checkpoint) | 8,27 B | No disponible | ASR, diarizacion, grounding, captioning denso, musica | nvidia-research-only |
| Audio Flamingo 3 (base) | 8,27 B | No disponible | Solo ASR y captioning basico | nvidia-research-only |
| Qwen2-Audio | 7,6 B | 32K | Sin timestamping dedicado | Apache 2.0 |

La comparativa se basa en arquitectura y capacidades documentadas, ya que no se dispone de benchmarks comparables de estos modelos en la informacion proporcionada. Audio Flamingo 3 es el modelo base de TEMPO y no incluye el proyector temporal ni los tokens de timestamp; Qwen2-Audio es un modelo de audio multimodal alternativo con licencia mas permisiva pero sin capacidad de timestamping temporal explicito.

## Limitaciones y advertencias

- Licencia restringida: el modelo esta bajo licencia `nvidia-research-only`, exclusivamente para investigacion academica no comercial. Cualquier uso comercial, incluso interno, esta prohibido.
- WER elevado: el error de transcripcion (47,0) es significativamente alto, lo que indica que el modelo no es adecuado para transcripcion de produccion sin un post-procesamiento adicional.
- Variante de ablacion: este checkpoint especifico se entreno solo con datos reales y sin el Stage 1 sintetico, por lo que su rendimiento es inferior al modelo TEMPO completo. No es recomendable para uso final, sino para estudios comparativos de curriculum.
- Dependencia del proyector temporal: el archivo `time_proj.pt` es obligatorio para la inferencia y no esta incluido en el checkpoint del transformer. Omitirlo provoca resultados incorrectos.
- Riesgo de alucinacion temporal: como todo modelo de lenguaje de audio, puede generar timestamps o eventos inexistentes en el audio, especialmente en segmentos con ruido o habla solapada.
- Idiomas soportados: no especificados, por lo que no se puede garantizar el rendimiento fuera de los corpora de entrenamiento (mayoritariamente ingles).
- Corpora con licencias mixtas: los datos de entrenamiento incluyen ESC-50 bajo CC BY-NC 3.0, lo que anade restricciones adicionales de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kaousheik/tempo-sft-stage2-realonly
- Dataset de entrenamiento: https://huggingface.co/datasets/Kaousheik/tempo
- Paper TEMPO en OpenReview (PDF): https://openreview.net/pdf?id=LoXjHBlPEd
- Paper TEMPO en OpenReview (forum): https://openreview.net/forum?id=LoXjHBlPEd
- Modelo base Audio Flamingo 3: https://huggingface.co/nvidia/audio-flamingo-3
- Perfil del autor: https://huggingface.co/Kaousheik
