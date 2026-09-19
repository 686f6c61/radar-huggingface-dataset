# aoiandroid/ultravox-v0_7-glm-4_6

## Resumen

Ultravox v0.7 es un modelo multimodal de tipo Speech LLM que acepta entrada de audio y texto de forma conjunta y genera texto como salida. Lo desarrolla Ultravox.ai (el repositorio de la organizacion `aoiandroid` en HuggingFace es un espejo o reempaquetado de los pesos publicados por el equipo original). Combina un encoder de voz derivado de `openai/whisper-large-v3-turbo` con un LLM preentrenado como backbone (GLM 4.6 en esta variante) y un adaptador multimodal entrenado que proyecta las representaciones de audio al espacio de embeddings del LLM. La entrada se construye con un prompt de texto que incluye el pseudo-token especial `<|audio|>`, que el procesador sustituye por los embeddings del audio.

El problema que resuelve es el razonamiento hablado: el modelo no solo transcribe voz, sino que responde a preguntas, sigue instrucciones y resuelve tareas de razonamiento sobre contenido hablado. En la serie v0.7, la variante entrenada sobre GLM 4.6 declara superar a `gpt4o-audio` en tareas de razonamiento sobre audio (big bench audio) y en la puntuacion global de VoiceBench, manteniendo buen rendimiento en traduccion de voz (covost2) y reconocimiento (LibriSpeech). Es relevante para quien construye asistentes de voz, pipelines de comprension de audio o agentes conversacionales por voz.

La informacion de parametros de safetensors indica 737.272.320 parametros (~737 M) y un repositorio de 1,5 GB, lo que no cuadra con un backbone GLM 4.6 completo; el recuento parece corresponder a encoder de audio y adaptador. La longitud de contexto no se especifica en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal Speech LLM: encoder de audio (Whisper large-v3-turbo) + adaptador multimodal + LLM backbone (GLM 4.6) |
| Parametros totales | 737.272.320 (dato de safetensors); incluye probablemente encoder y adaptador, no el backbone completo |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16, sin variantes GGUF/AWQ/GPTQ documentadas) |
| Idiomas soportados | ar, be, bg, bn, cs, cy, da, de, el, en, es, et, fa, fi, fr, gl, hi, hu, it, ja, ka, lt, lv, mk, mr, nl, pl, pt, ro, ru, sk, sl, sr, sv, sw, ta, th, tr, uk, ur, vi, zh (42 idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers, con `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura es un Speech LLM multimodal. El audio se procesa con el encoder de `openai/whisper-large-v3-turbo`; un adaptador multimodal proyecta las representaciones resultantes al espacio de embeddings del LLM, y el LLM backbone (GLM 4.6 en esta variante) genera la salida de texto. El prompt de entrada combina texto y audio mediante el pseudo-token `<|audio|>`, que el procesador reemplaza por los embeddings de audio. Segun la model card, la serie v0.7 puede entrenarse sobre distintos backbones (GLM, Llama, Gemma, Qwen).

En el entrenamiento, el adaptador multimodal se entrena desde cero, el encoder Whisper se ajusta de forma fina y el LLM se mantiene congelado (frozen). Se emplea una perdida de destilacion de conocimiento en la que Ultravox intenta igualar los logits del LLM de texto base. Los datos de entrenamiento son una mezcla de conjuntos de ASR, ampliados con continuaciones generadas por Llama 3.1 8B, conjuntos de traduccion de voz y conjuntos de ruido. El regimen es ajuste fino supervisado de instrucciones de voz mediante destilacion, en precision mixta BF16 sobre 8x B200 GPUs. No se detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Comprension de voz y generacion de texto: entrada audio + texto, salida texto.
- Razonamiento sobre audio: big bench audio en modo con razonamiento (reasoning) y sin razonamiento.
- Modo de razonamiento (thinking) activable, con prompts de sistema especificos para tareas de eleccion multiple.
- Reconocimiento automatico del habla (ASR) multilingue, medido en LibriSpeech.
- Traduccion de voz (speech translation) en multiples pares de idiomas via covost2 (en_ar, en_ca, en_de, es_en, ru_en, zh_en).
- Seguimiento de instrucciones de voz (VoiceBench) con formato de respuesta controlado.
- Soporte de 42 idiomas en la metadata del modelo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque dispone de modo reasoning.
- Capacidades de vision: no; el modelo es audio-text-to-text.

## Casos de uso

- Asistentes de voz conversacionales: el modelo acepta audio y texto como entrada y genera respuestas de texto, lo que permite construir interfaces habladas que mantienen el contexto de la conversacion.
- Reconocimiento automatico del habla en produccion: con un WER de 2.28 en LibriSpeech, es adecuado para transcripcion de audio de alta calidad.
- Traduccion de voz en tiempo real: los resultados de covost2 (por ejemplo, 42.88 BLEU en es_en y 50.30 en ru_en) lo hacen util para subtitulado y doblaje automatico entre idiomas.
- Razonamiento sobre contenido hablado: la puntuacion de 97.00 en big bench audio en modo reasoning permite responder preguntas complejas sobre audio (reuniones, clases, notas de voz).
- Respuestas a preguntas de eleccion multiple sobre audio: con el prompt de sistema adecuado, finaliza la respuesta con "The answer is [X]", lo que facilita evaluacion y uso en encuestas o tests hablados.
- Analisis de calidad y ruido en llamadas: al haberse entrenado con conjuntos de ruido, puede emplearse en pipelines de comprension de audio con condiciones adversas.
- Atencion al cliente automatizada por voz: combinado con un LLM de texto, permite gestionar conversaciones multi-turno donde el cliente habla y el sistema responde.
- Accesibilidad: transcripcion y resumen de audio para personas con discapacidad auditiva, apoyandose en la capacidad multilingue del modelo.

## Benchmarks y rendimiento

Razonamiento de audio y comprension general:

| Modelo | big bench audio | voicebench overall |
|---|---:|---:|
| v0_7-glm-4_6 (con reasoning) | 97.00 | 90.75 |
| v0_7-glm-4_6 (sin reasoning) | 91.80 | 87.05 |
| v0_6-llama-3_3-70b | 85.48 | 81.81 |
| v0_6-gemma-3-27b | 83.84 | – |
| v0_6-qwen-3-32b | 84.22 | – |
| gpt4o-audio | 82.80 | 86.75 |

Traduccion de voz (covost2, BLEU) y reconocimiento (LibriSpeech, WER):

| Metrica | v0_7-glm-4_6 | v0_6-llama-3_3-70b | v0_6-gemma-3-27b | v0_6-qwen-3-32b |
|---|---:|---:|---:|---:|
| covost2 en_ar | 22.89 | 18.92 | 22.68 | 16.91 |
| covost2 en_ca | 41.48 | 38.73 | 39.67 | 33.63 |
| covost2 en_de | 35.44 | 33.69 | 34.76 | 31.09 |
| covost2 es_en | 42.88 | 41.39 | 41.11 | 41.20 |
| covost2 ru_en | 50.30 | 43.73 | 49.29 | 47.08 |
| covost2 zh_en | 23.85 | 17.81 | 20.88 | 22.24 |
| librispeech (WER) | 2.28 | 2.55 | 2.73 | 2.88 |

Nota: en VoiceBench y big bench audio se emplean prompts de sistema personalizados para v0_7-glm-4_6 (documentados en la model card).

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 1,5 GB de pesos (coincide con el tamano del repositorio) mas overhead de activaciones y procesamiento de audio, en torno a 2-3 GB.
- VRAM estimada en FP32: aproximadamente 3 GB solo de pesos.
- VRAM estimada en 8 bits: en torno a 0,8 GB; en 4 bits, en torno a 0,4 GB (no se publican variantes cuantizadas oficiales).
- GPU recomendadas: cabe en GPUs de consumo actuales (RTX 3060 12 GB, RTX 4070, RTX 4090, etc.); tambien en A100/H100 para despliegue a gran escala.
- Caveat: si para la inferencia se requiere cargar el backbone LLM completo (GLM 4.6) ademas de los 737 M de parametros, los requisitos de VRAM serian considerablemente mayores; no disponible el detalle exacto.
- Opciones de despliegue: la libreria declarada es `transformers` con `custom_code`, por lo que se requiere `trust_remote_code=True`. No hay soporte GGUF/Ollama documentado. Compatibilidad con vLLM/TGI no confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | big bench audio | voicebench | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Ultravox v0_7-glm-4_6 | 737 M (safetensors) | 97.00 (reasoning) | 90.75 | MIT | safetensors | HuggingFace |
| Ultravox v0_6-llama-3_3-70b | ~70 B backbone | 85.48 | 81.81 | MIT (serie Ultravox) | safetensors | HuggingFace |
| Ultravox v0_6-gemma-3-27b | ~27 B backbone | 83.84 | – | MIT (serie Ultravox) | safetensors | HuggingFace |
| Ultravox v0_6-qwen-3-32b | ~32 B backbone | 84.22 | – | MIT (serie Ultravox) | safetensors | HuggingFace |
| gpt4o-audio | no disponible (cerrado) | 82.80 | 86.75 | propietaria | API | Solo API |

No se dispone de datos de contexto, tipos de cuantizacion ni de latencia para realizar una comparacion mas detallada con alternativas como Qwen2-Audio o SALMONN.

## Limitaciones y advertencias

- Discrepancia de parametros: el nombre indica GLM 4.6 como backbone, pero safetensors reporta 737.272.320 parametros y 1,5 GB de repositorio, muy por debajo de un LLM de ese nombre. Es probable que el repositorio contenga encoder y adaptador, y no el backbone completo; conviene verificar antes de desplegar.
- Riesgo de alucinacion: como cualquier LLM generativo, puede producir contenido plausible pero incorrecto, especialmente en audio con ruido o acentos poco representados.
- Sesgos: no se documentan evaluaciones de sesgo ni de equidad; los datos de entrenamiento (ASR + traduccion de voz) pueden introducir sesgos linguisticos y culturales.
- Cobertura de idiomas desigual: aunque se listan 42 idiomas, los benchmarks de traduccion se limitan a unos pocos pares (en_ar, en_ca, en_de, es_en, ru_en, zh_en); el rendimiento en el resto no esta verificado.
- Licencia MIT: permite uso comercial, pero al depender de componentes con licencias propias (Whisper y el LLM backbone), conviene revisar las condiciones de cada componente.
- Requiere `trust_remote_code=True` (`custom_code`), lo que implica ejecutar codigo no auditado del repositorio.
- El uso del modo reasoning puede aumentar la latencia y el consumo de tokens de salida.
- Sin datos publicados de latencia, throughput o despliegue en produccion; no hay variantes cuantizadas oficiales.
- Los resultados de VoiceBench requieren prompts de sistema especificos; sin ellos el rendimiento puede degradarse.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/aoiandroid/ultravox-v0_7-glm-4_6
- Repositorio y sitio oficial de Ultravox: https://ultravox.ai
- Codigo de entrenamiento: https://github.com/fixie-ai/ultravox/blob/main/ultravox/training/train.py
- Encoder de audio: https://huggingface.co/openai/whisper-large-v3-turbo
- Blog de big bench audio: https://huggingface.co/blog/big-bench-audio-release
- VoiceBench: https://github.com/MatthewCYM/VoiceBench
