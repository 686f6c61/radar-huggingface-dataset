# amir0907/student-v4

## Resumen

Student-v4 es la cuarta iteración de un módulo de emoción quirúrgica (surgical emotion module) desarrollado por el usuario amir0907, diseñado como adaptador ligero sobre el backbone congelado emotion2vec_plus_base de FunASR. No es un modelo de lenguaje generativo ni un sistema TTS completo: es un componente de acondicionamiento que extrae representaciones emocionales a nivel de frame y de enunciado, pensado para inyectarse en pipelines de traducción voz-a-voz (S2ST) y de síntesis de voz (TTS), concretamente en dots.tts.

La innovación principal de esta versión es la reducción de la tasa de frames a 6,25 Hz (un frame cada 160 ms), lo que equivale exactamente a un frame de emoción por cada token del LLM de dots.tts (48000/7680 = 6,25 Hz). Esto elimina la necesidad de interpolación en el momento de la inyección. Además, se rediseña la receta de intensidad emocional para corregir el colapso de la versión v3, que producía una intensidad casi constante (~0,31) independientemente de la emoción.

El modelo se entrena por autodestilación desde el profesor congelado, sin usar etiquetas, sobre un pool multilingüe (inglés y chino) de 50.618 enunciados. Su relevancia radica en que ofrece una interfaz de condicionamiento emocional temporalmente alineada con LLMs de TTS, con un coste computacional mínimo (3,18 M de parámetros de adaptador, ~2,7 ms de sobrecarga) y fidelidad casi perfecta al profesor (100 % de acuerdo top-1).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre backbone congelado emotion2vec_plus_base (FunASR); pooling por soft-attention; salida a 6,25 Hz |
| Parametros totales | 3,18 M (solo el adaptador; el backbone congelado no se contabiliza en el repo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; procesa audio con tasa de frames de 6,25 Hz (160 ms por frame) |
| Tipos de cuantizacion | No disponible (checkpoint en fp16 durante entrenamiento; no se documentan cuantizaciones) |
| Idiomas soportados | Entrenado con corpus en inglés (RAVDESS, CREMA-D, TESS) y chino (ESD en+zh); no se declara una lista formal de idiomas |
| Licencia | Apache-2.0 (repositorio); los datos de entrenamiento incluyen RAVDESS con CC BY-NC-SA 4.0 |
| Formato de pesos | `surgical_emotion_module.pt` (PyTorch); backbone en directorio FunASR |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura de adaptador idéntica a v1-v3: un módulo de 3,18 M de parámetros que se aplica sobre el backbone congelado emotion2vec_plus_base. La única modificación estructural es el cambio de `group_size` de 4 a 8, lo que reduce la tasa de frames de 12,5 Hz a 6,25 Hz. El pooling por soft-attention fusiona la ventana completa de 160 ms en un único frame, y el checkpoint restaura automáticamente G=8 al cargarse.

El entrenamiento es autodestilación desde el profesor congelado, sin etiquetas. Se usa el mismo pool multilingüe que v3: RAVDESS speech+song (actores 1-18), CREMA-D, TESS y ESD en+zh, con un total de 50.618 enunciados y una caché de 4 shards precalculada en 2×T4. Se ejecutan 4000 pasos de AdamW con batch 8 en fp16 sobre una sola T4 (~14 min). La validación se hace sobre actores 19-24 de RAVDESS, nunca vistos en entrenamiento. La receta de intensidad se rediseña con un objetivo `target(t) = p_emo(t) * clip(rms_raw(t) / GLOBAL_REF, 0, 1)`, donde `p_emo` es la probabilidad máxima del profesor sobre las 6 clases emocionales (excluyendo neutral/other/unk) y `rms_raw` se normaliza por una referencia global (mediana de los P90 RMS por enunciado) para preservar diferencias de volumen entre enunciados. Las pérdidas combinan MSE, correlación de Pearson y matching de log-std.

## Capacidades

- Extracción de embeddings emocionales a nivel de frame (`frame_embs`, B×T×768) y de enunciado (`utt_emb`, B×768).
- Clasificación de emociones en 9 clases (`frame_probs`, B×T×9; `utt_probs`, B×9).
- Estimación de intensidad emocional por frame (`frame_intensity`, B×T×1).
- Salida temporalmente alineada con tokens de LLM de TTS a 6,25 Hz (1 frame por token de dots.tts).
- Condicionamiento variable en el tiempo para TTS (per-token time-varying conditioning).
- Procesamiento de audio a 16 kHz con longitudes variables (`wav_lengths`).
- Soporte de audio en inglés y chino (según corpus de entrenamiento).
- No soporta tool calling, agentes, visión ni generación de texto: es un módulo de representación, no un LLM.

## Casos de uso

- Traducción voz-a-voz con preservación emocional: el módulo extrae `frame_embs` a 6,25 Hz que se inyectan directamente en el LLM de dots.tts, permitiendo que la voz sintetizada mantenga la emoción del hablante original sin interpolación adicional.
- Síntesis de voz expresiva en producción: al estar alineado 1:1 con los tokens del LLM de TTS, se elimina la capa de glue/interpolación, reduciendo latencia y artefactos en pipelines de generación de audio en tiempo real.
- Análisis de emoción en centros de contacto: clasificación por frame y por enunciado de llamadas grabadas, con detección de dinámicas de intensidad (subidas y bajadas) gracias a la curva de intensidad corregida en v4.
- Investigación en prosodia y emoción actoral: el modelo separa intensidad normal vs fuerte con una diferencia media de +0,047 y una desviación estándar de curva de 0,183, útil para estudiar la expresividad en corpus como RAVDESS.
- Acondicionamiento de modelos TTS multilingües: al haberse entrenado con corpus en inglés y chino, puede usarse para condicionar voces sintéticas en ambos idiomas en proyectos de doblaje automático.
- Componente de evaluación de sistemas S2ST: sirve como extractor de referencia para medir si la emoción se preserva tras la traducción, comparando `frame_probs` del audio original y del sintetizado.
- Preprocesado para datasets de voz: generación de etiquetas débiles de emoción e intensidad por frame para entrenar otros modelos, dado que la receta es label-free y reproducible sobre cualquier corpus.

## Benchmarks y rendimiento

Resultados sobre entradas held-out idénticas (actores 19-24 de RAVDESS + clip en chino), comparados con el profesor congelado:

| Métrica | v1 | v2 | v4 |
|---|---|---|---|
| Acuerdo top-1 | 100 % | 100 % | 100 % |
| Divergencia JS media ↓ | 0,00035 | 0,00022 | 0,00044 |
| Coseno de embedding pooled | 0,99935 | 0,99955 | 0,99926 |
| Coseno a nivel de frame (hasta 50 Hz) | 0,99524 | 0,99572 | 0,99198 |
| Correlación de intensidad (nuevo target) | 0,237 | 0,239 | 0,594 |
| Std de la curva de intensidad (dinámica) | 0,030 | 0,035 | 0,183 |
| Diferencia de intensidad media normal(01) vs fuerte(02) | +0,021 | +0,027 | +0,047 |
| Cohen-d de intensidad (336 archivos emocionales) | 0,57 | 0,66 | 0,26 |

En el subconjunto de fidelidad (60 archivos), v4 alcanza una correlación de intensidad media de 0,563 frente a 0,288 de v3 en su propio proxy. El contrato de tasa es exacto a 6,25 Hz para entradas de 1, 2,5, 5 y 10 s. Nota de techo: el propio target separa RAVDESS 01/02 con Cohen-d 0,23 (el estudiante v4 logra 0,26), por lo que v4 está en el límite de lo que codifica este proxy sin etiquetas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el adaptador es de 3,18 M de parámetros (~6,4 MB en fp16), pero requiere cargar el backbone emotion2vec_plus_base congelado, cuyo tamaño no se detalla en la información disponible.
- GPU recomendadas: el entrenamiento se realizó en una sola T4 (16 GB), lo que sugiere que la inferencia cabe holgadamente en GPUs de gama media.
- Cabe en GPU consumer: sí, el entrenamiento en T4 lo confirma; se espera que quepa en RTX 3060/4060 y superiores, aunque no se documentan requisitos mínimos exactos.
- Opciones de despliegue: integración vía Python con `SurgicalEmotionEncoder.from_pretrained` sobre un directorio FunASR; no se documentan servidores de inferencia (vLLM, TGI, llama.cpp, Ollama) porque no es un LLM.
- Latencia y throughput: sobrecarga del adaptador de ~2,7 ms; no se publican cifras de throughput de audio.

## Comparativa con modelos similares

| Modelo | Parámetros | Tasa de frames | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| student-v4 (este) | 3,18 M (adaptador) | 6,25 Hz | No aplica | Apache-2.0 (datos RAVDESS NC) | HuggingFace |
| student-v3 | 3,18 M (adaptador) | 12,5 Hz | No aplica | Apache-2.0 (datos RAVDESS NC) | HuggingFace |
| student-v2 | 3,18 M (adaptador) | 12,5 Hz | No aplica | Apache-2.0 (datos RAVDESS NC) | HuggingFace |
| emotion2vec_plus_base (profesor) | No disponible | No disponible | No aplica | Apache-2.0 | FunASR |

No se dispone de comparación con otros módulos de condicionamiento emocional externos en la información proporcionada.

## Limitaciones y advertencias

- El modelo no es generativo: no produce texto, código ni respuestas; solo extrae representaciones y probabilidades emocionales.
- Riesgo de sesgo de corpus: entrenado con RAVDESS, CREMA-D, TESS y ESD, con actores y condiciones controladas; el rendimiento en audio real (ruido, solapamiento, habla espontánea) no está documentado.
- La separación de intensidad está en el techo del proxy sin etiquetas (Cohen-d del target 0,23), por lo que no debe usarse como medidor absoluto de intensidad emocional en producción sin calibración adicional.
- Restricción de licencia: aunque el código es Apache-2.0, el entrenamiento usa RAVDESS (CC BY-NC-SA 4.0), por lo que el uso comercial requiere re-destilar sobre corpus permisivos (la receta es label-free y reproducible).
- Idiomas: aunque se entrenó con inglés y chino, no se declara una lista formal de idiomas soportados ni se evalúa la generalización a otras lenguas.
- Dependencia del backbone: requiere el directorio FunASR de emotion2vec_plus_base para funcionar; no es autónomo.
- No se documentan cuantizaciones ni formatos GGUF/ONNX, lo que limita el despliegue en entornos sin PyTorch.

## Enlaces

- HuggingFace: https://huggingface.co/amir0907/student-v4
- Versión v1: https://huggingface.co/amir0907/student
- Versión v2: https://huggingface.co/amir0907/student-v2
- Versión v3: https://huggingface.co/amir0907/student-v3
- Backbone emotion2vec_plus_base (FunASR): no disponible como enlace directo en la información proporcionada
- Referencia RAVDESS (Livingstone & Russo, 2018): no disponible como enlace directo en la información proporcionada
