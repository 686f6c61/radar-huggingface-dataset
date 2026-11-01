# NagaYu/vouch-hubert-lr

## Resumen

Vouch HuBERT-LR es un detector de voz sintetica orientado a notas de voz cortas (2-10 segundos), desarrollado por el usuario NagaYu. Se trata de un clasificador binario que devuelve una probabilidad de que el audio sea voz real (bona fide) frente a voz generada por sistemas de conversion de voz o TTS. El modelo se construye congelando las caracteristicas de `facebook/hubert-base-ls960` (capa 3, revision `dba3bb02fda4248b6e082697eee756de8fe8aa8a`) y entrenando unicamente una cabeza de regresion logistica sobre ellas.

El modelo es relevante en el contexto del auge de los deepfakes de audio y la clonacion de voz accesible: ofrece una linea base reproducible y ligera para investigacion en anti-spoofing, con evaluacion detallada por condicion (codec Opus, microfono de telefono, ingles y japones). No obstante, el propio autor insiste en que es un artefacto de investigacion con puntos ciegos conocidos y que no debe usarse como unica base para decisiones de fraude o sobre personas.

La ficha tecnica disponible es inusualmente honesta: documenta resultados de EER y AUC por pliegue, condiciones de entrenamiento y limitaciones explicitas, incluyendo el hecho de que el modelo falla en familias de conversion de voz no vistas durante el entrenamiento. Con solo 14 descargas y 0 likes en el momento de la consulta, se trata de un checkpoint de investigacion reciente, no de un modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HuBERT base congelado (capa 3) + cabeza de regresion logistica |
| Parametros totales | no disponible (el backbone HuBERT base tiene ~95M; la cabeza LR es despreciable) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada de 2-10 s por nota de voz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en), japones (ja, exploratorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0.0 GB; probablemente pesos de la cabeza LR, no del backbone) |

## Arquitectura y entrenamiento

El modelo no entrena el backbone: utiliza `facebook/hubert-base-ls960` congelado y extrae caracteristicas de la capa 3, sobre las que aplica una regresion logistica. La salida es una probabilidad en [0, 1] donde 1 indica voz real. El entrenamiento se realizo sobre el subconjunto publico del dataset `NagaYu/vouch-bench` (vouch-bench v2), sin clips de macOS `say` (no redistribuibles), por lo que la evaluacion de publicacion no incluye ese pliegue.

El modelo vio dos sistemas de conversion de voz (kNN-VC y FreeVC) y TTS basado en espeak-ng como unica fuente TTS entrenable. La evaluacion se realiza con 3 semillas y se reportan EER y AUC por pliegue y por condicion (limpio, Opus 16k, Opus 24k, microfono de telefono, ingles y japones). El checkpoint publicado corresponde a la semilla 0 del pliegue `speaker` (EER de test 0.046). No se documentan tecnicas como decodificacion especulativa ni atencion lineal; la innovacion principal es la evaluacion sistematica de generalizacion a generadores no vistos.

## Capacidades

- Clasificacion binaria de audio: voz real frente a voz sintetica en notas de voz de 2-10 s.
- Deteccion de deepfakes de audio y conversion de voz (kNN-VC, FreeVC en entrenamiento).
- Deteccion de TTS neuronal (espeak-ng en entrenamiento; Kokoro-82M solo en evaluacion de hold-out).
- Salida de probabilidad continua (bona fide likelihood) en [0, 1].
- Evaluacion multilingue limitada a ingles y japones (japones exploratorio, solo hablantes femeninas en test).
- No soporta tool calling, agentes, vision, audio de entrada largo ni generacion de texto.

## Casos de uso

- Filtro de pre-screening en moderacion de audio: usar la probabilidad como senal adicional (nunca unica) para marcar notas de voz sospechosas en plataformas de mensajeria, dado que el modelo esta disenado para clips de 2-10 s.
- Investigacion en anti-spoofing: linea base reproducible con backbone HuBERT congelado y cabeza LR para comparar metodos de deteccion en el benchmark vouch-bench v2.
- Analisis de robustez ante codecs: evaluar como varia la deteccion bajo Opus 16k y 24k, condiciones documentadas con EER de 0.033 y 0.040 respectivamente en el pliegue `speaker`.
- Estudio de generalizacion a generadores no vistos: medir la caida de rendimiento frente a sistemas de VC y TTS fuera del conjunto de entrenamiento, con resultados publicados (AUC cercana a 0.5 en linaje VC no visto).
- Deteccion en audio de telefono: aunque es la condicion mas debil (EER 0.098 en microfono de telefono), puede servir para caracterizar el rendimiento realista en llamadas.
- Docencia y experimentacion: ejemplo ligero de transferencia con features SSL congeladas y evaluacion por condiciones, adecuado para cursos de seguridad de audio.
- Evaluacion comparativa de TTS modernos: usar el hold-out de Kokoro-82M para medir la tasa de clips sinteticos que pasan como reales a umbral 0.5 (48% en este checkpoint).

## Benchmarks y rendimiento

Resultados del checkpoint publicado (pliegue `speaker`, semilla 0) en el conjunto de publicacion, EER / AUC (voz real como clase positiva):

| Condicion | EER | AUC |
|---|---|---|
| Todos los generadores vistos | 0.052 ± 0.009 | 0.989 ± 0.001 |
| espeak-ng no visto (= linaje TTS no visto) | 0.256 ± 0.016 | 0.835 ± 0.017 |
| kNN-VC no visto (FreeVC en entrenamiento) | 0.488 ± 0.009 | 0.515 ± 0.019 |
| FreeVC no visto (kNN-VC en entrenamiento) | 0.189 ± 0.004 | 0.887 ± 0.009 |
| Linaje VC no visto (ambos VC excluidos) | 0.594 ± 0.010 | 0.351 ± 0.007 |

EER por condicion del checkpoint (pliegue `speaker`): limpio 0.033 ± 0.008, Opus 16k 0.033 ± 0.013, Opus 24k 0.040 ± 0.008, microfono de telefono 0.098 ± 0.013, ingles 0.056 ± 0.006, japones 0.057 ± 0.007 (exploratorio).

Hold-out con Kokoro-82M (nunca usado en entrenamiento ni seleccion):

| Modelo | EER / AUC | EER en | EER ja (expl.) | EER microfono | Kokoro pasa a 0.5 | Real pasa a 0.5 |
|---|---|---|---|---|---|---|
| Este checkpoint (semilla 0) | 0.226 / 0.871 | 0.233 | 0.125 | 0.333 | 48% | 92% |
| Release HuBERT + LR (3 semillas) | 0.225 ± 0.002 / 0.870 ± 0.005 | 0.251 ± 0.032 | 0.105 ± 0.017 | 0.341 ± 0.012 | 44% | 92% |
| Benchmark HuBERT + LR (con say) | 0.237 ± 0.030 / 0.850 ± 0.032 | 0.279 ± 0.048 | 0.103 ± 0.019 | 0.366 ± 0.054 | 39% | 90% |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el backbone HuBERT base (~95M parametros) cabe holgadamente en GPUs de consumo, pero el repo no incluye pesos del backbone (0.0 GB), por lo que hay que cargar `facebook/hubert-base-ls960` por separado.
- GPU recomendadas: cualquier GPU con al menos ~1-2 GB de VRAM para el backbone en fp32; una RTX 3060 o superior es suficiente.
- Cabe en GPU de consumo: si, incluidas GTX 1660, RTX 2060 y superiores, asumiendo que se dispone del backbone.
- Opciones de despliegue: no documentadas; al ser un pipeline de `audio-classification`, es compatible con `transformers` y potencialmente con `optimum`/ONNX, pero no se confirma.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | EER (todos vistos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vouch HuBERT-LR (este) | HuBERT base + LR | 2-10 s audio | 0.052 | MIT | HuggingFace (14 descargas) |
| HuBERT + MLP (misma familia) | HuBERT base + MLP | 2-10 s audio | 0.085 ± 0.012 | no disponible | solo en benchmark del autor |
| MFCC + LR (baseline) | no disponible | 2-10 s audio | 0.288 | no disponible | baseline del autor |
| Duration-only control | no disponible | 2-10 s audio | 0.492 | no disponible | baseline del autor |

No se dispone de comparacion con detectores anti-spoofing externos (por ejemplo, AASIST o RawNet2) en la informacion proporcionada.

## Limitaciones y advertencias

- No debe usarse como unica base para decisiones de fraude o decisiones sobre personas; es un artefacto de investigacion.
- No es fiable en familias de conversion de voz no vistas: con ambos VC excluidos, AUC es 0.351 (por debajo del azar, las decisiones se invierten).
- Incluso dentro del linaje VC, un sistema no visto no se detecta de forma fiable (AUC 0.515 con kNN-VC no visto).
- La clonacion de voz zero-shot y los servicios TTS comerciales no se han medido.
- Las puntuaciones no estan calibradas: a umbral 0.5, el 48% de clips de Kokoro-82M pasan como reales (44% de media en 3 semillas).
- Los numeros en japones son exploratorios: pocos grupos de hablantes y test solo con hablantes femeninas.
- El microfono de telefono es la condicion mas debil, con el EER mas alto en todos los desgloses.
- Licencia MIT permite uso comercial, pero las limitaciones tecnicas desaconsejan produccion sin validacion adicional.
- Riesgo de sesgo por composicion del dataset y por el desequilibrio de generadores vistos en entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/NagaYu/vouch-hubert-lr
- Modelo base: https://huggingface.co/facebook/hubert-base-ls960
- Dataset: https://huggingface.co/datasets/NagaYu/vouch-bench
- Repositorio de evaluacion: no disponible (referencias a `eval/benchmark_v2_summary.json` y `eval/release_summary.json` sin URL publica)
- Paper o blog: no disponible
