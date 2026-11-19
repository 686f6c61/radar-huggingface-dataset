# kumargulshan/wav2vec2-base-ls460-noise-aug

## Resumen

`wav2vec2-base-ls460-noise-aug` es un modelo de reconocimiento automatico del habla (ASR) en ingles desarrollado por el autor `kumargulshan` en el marco de un proyecto de laboratorio (Group 9, DS & AI Lab, noviembre de 2026) centrado en ASR robusto al ruido con marcado de errores a nivel de palabra. Se trata de un ajuste fino de `facebook/wav2vec2-base` (95 M de parametros) con una cabeza CTC a nivel de caracter, entrenado sobre 464 horas de LibriSpeech (train-clean-100 + train-clean-360) y aumentacion de ruido sintetico.

El modelo resuelve el problema de la degradacion del reconocimiento en condiciones acusticas adversas: el 80 % de las locuciones se mezclaron con ruido (blanco, rosa, MUSAN noise y MUSAN music) a relaciones senal-ruido de 0 a 20 dB, mientras que el 20 % restante se mantuvo limpio. Es relevante porque sirve como punto de partida de la familia de modelos de 960 horas del mismo estudio y porque publica una evaluacion sistematica bajo 17 condiciones de ruido (94.503 condiciones de locucion, 182,7 horas de audio), incluyendo tipos de ruido no vistos en entrenamiento.

La arquitectura es la de wav2vec2-base: un codificador convolucional de features seguido de un transformer con atencion completa y una cabeza lineal CTC. El contexto es limitado por la propia arquitectura (ventanas de audio de unos 10 segundos por inferencia) y el modelo solo soporta ingles. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (CNN feature encoder + transformer encoder + cabeza CTC lineal) |
| Parametros totales | 94.396.320 (95 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como valor numerico; limitada por la arquitectura wav2vec2 a ventanas de audio de aproximadamente 10 s por inferencia |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; el modelo es compatible con cuantizacion dinamica de PyTorch y con conversion a ONNX) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 0,4 GB), cargable con `transformers` |

## Arquitectura y entrenamiento

El modelo parte de `facebook/wav2vec2-base` y anade una cabeza CTC a nivel de caracter con un vocabulario de 32 simbolos (A-Z, apostrofo y `|` como delimitador de palabra), identico al de `facebook/wav2vec2-base-960h`. El codificador convolucional de features se mantiene congelado durante el ajuste fino, y el entrenamiento se aplica sobre el transformer con SpecAugment (mascara temporal p=0,4 con span 10; mascara de features p=0,1 con span 64) y LayerDrop 0,1.

El entrenamiento uso LibriSpeech train-clean-100 + train-clean-360 (464 h) durante 80.000 pasos (aproximadamente 28 epocas), con AdamW (beta 0,9/0,98, weight decay 0,005), learning rate pico de 1e-4, warm-up del 5 %, decaimiento lineal, clipping de gradiente 1,0, precision bf16 y batches agrupados por duracion de hasta 640 s de audio, con semilla 42. La aumentacion consistio en mezclar el 80 % de las locuciones con ruido a SNR de 0 a 20 dB (ruido blanco, rosa, MUSAN noise y MUSAN music), dejando el 20 % limpio. El checkpoint se selecciono por el menor WER medio en dev-clean + dev-other (condiciones limpias y ruidosas), alcanzando un WER de desarrollo del 10,71 % en el paso 80.000. Todo el entrenamiento se ejecuto en una unica NVIDIA L40S.

## Capacidades

- Reconocimiento automatico del habla en ingles con salida CTC a nivel de caracter (mayusculas, apostrofo y delimitador de palabra).
- Robustez a ruido: entrenado explicitamente con ruido blanco, rosa, MUSAN noise y MUSAN music a SNR de 0 a 20 dB.
- Generalizacion a tipos de ruido no vistos: el ruido marron y los sonidos ambientales de ESC-50 no se usaron en entrenamiento y aun asi se evaluan con WER contenido.
- Decodificacion con modelo de lenguaje externo: los logits CTC pueden decodificarse con un KenLM de 4-gramas de LibriSpeech mediante `pyctcdecode` (alpha 0,8, beta 2,0, beam 50).
- Compatibilidad con el pipeline `automatic-speech-recognition` de `transformers` y con endpoints de Hugging Face.
- No soporta tool calling, function calling, agentes, vision, audio generativo ni modo de razonamiento explicito.
- No genera puntuacion ni distincion de mayusculas/minusculas en la salida.

## Casos de uso

- Transcripcion de audiolibros y contenido hablado limpio: el modelo alcanza un WER de 4,70 % en test-clean sin LM y 2,97 % con LM de 4-gramas, por lo que es adecuado para transcribir narracion monologada de calidad.
- Preprocesado de datasets de voz para entrenamiento de modelos mayores: al ser un modelo de 95 M de parametros y 0,4 GB, puede ejecutarse en lote sobre grandes volumenes de audio para generar transcripciones preliminares o etiquetas debiles.
- Transcripcion en entornos con ruido de fondo moderado: el entrenamiento con aumentacion a SNR de 0 a 20 dB permite usarlo en grabaciones de oficina, aulas o entrevistas donde el ruido no supere ese umbral.
- Sistema de marcado de errores de pronunciacion o de calidad de transcripcion: el proyecto original se centra en el marcado de errores a nivel de palabra, de modo que el modelo sirve como base para detectar segmentos problematicos comparando hipotesis con y sin LM.
- Prototipado rapido de ASR en ingles en CPU o GPU de gama baja: con 95 M de parametros y pesos safetensors de 0,4 GB, la inferencia es viable en hardware consumer y en entornos sin GPU dedicada.
- Evaluacion comparativa de robustez al ruido: al publicar resultados bajo 17 condiciones con semillas fijas por locucion, el modelo es util como baseline reproducible en estudios de robustez acustica.
- Integracion en pipelines de subtitulado offline: la salida CTC puede decodificarse con KenLM para mejorar la precision en test-other (de 11,09 % a 7,58 % de WER), lo que lo hace apto para subtitulado no critico en tiempo real o por lotes.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). WER en porcentaje sobre LibriSpeech test-clean y test-other.

| Condicion | Greedy (sin LM) | Con LM de 4-gramas |
|---|---|---|
| test-clean | 4,70 | 2,97 |
| test-other | 11,09 | 7,58 |
| Todas las condiciones ruidosas (agregado) | no disponible | 9,85 |
| Ruido blanco, 0-5 dB | 24,84 | 19,60 |
| Ruido rosa, 0-5 dB | 19,44 | 15,01 |
| Ruido marron, 0-5 dB (tipo no visto) | 8,22 | 5,56 |
| Sonidos ESC-50, 0-5 dB (tipo no visto) | 16,66 | 12,66 |

La evaluacion cubre 5.559 locuciones bajo 17 condiciones (limpio, ruido blanco/rosa/marron y sonidos ambientales ESC-50 a 0, 5, 10, 15 y 20 dB SNR), con un total de 94.503 condiciones de locucion y 182,7 horas de audio. El ruido se mezclo con semillas fijas por locucion para que todos los modelos del estudio vieran el mismo audio.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,4 GB de pesos mas activaciones; en la practica cabe en cualquier GPU con 2 GB o mas.
- VRAM estimada en bf16/fp16: alrededor de 0,2 GB de pesos; inferior a 1 GB incluyendo activaciones para ventanas de audio tipicas.
- GPU recomendadas: NVIDIA L40S (usada en entrenamiento), A100, H100 para inferencia en lote de alto throughput; RTX 4090, RTX 3090, RTX 3060 y GPUs consumer similares son suficientes para inferencia individual.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 2 GB de VRAM; tambien es viable en CPU para inferencia por lotes de tamano moderado.
- Opciones de despliegue: `transformers` (PyTorch), `pyctcdecode` para decodificacion con KenLM, exportacion a ONNX, y endpoints de Hugging Face (el modelo esta marcado como `endpoints_compatible`). No se documenta soporte especifico de vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / uso | WER test-clean | WER test-other | Licencia |
|---|---|---|---|---|---|
| `kumargulshan/wav2vec2-base-ls460-noise-aug` | 95 M | ASR ingles, ventanas de ~10 s | 4,70 (greedy) / 2,97 (LM) | 11,09 (greedy) / 7,58 (LM) | Apache-2.0 |
| `facebook/wav2vec2-base-960h` | 95 M | ASR ingles, ventanas de ~10 s | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Apache-2.0 |
| `kumargulshan/wav2vec2-base-noise-robust-asr` (B960_rev) | 95 M | ASR ingles con aumentacion de ruido, reverberacion, velocidad y telefonia | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Apache-2.0 |
| `kumargulshan/wav2vec2-base-ls100-noise-aug` (B_noisy) | 95 M | ASR ingles, 100 h + aumentacion de ruido | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Apache-2.0 |

Los modelos de la misma familia comparten arquitectura y tamano; las diferencias estan en el volumen de datos de entrenamiento y en el tipo de aumentacion. El modelo B960_rev se presenta como el mejor modelo individual del estudio, con 960 h y aumentacion de ruido, reverberacion, velocidad y telefonia, pero sus cifras concretas no se incluyen en la informacion disponible.

## Limitaciones y advertencias

- Solo reconoce ingles de audiolibros (LibriSpeech); el habla conversacional, con acento marcado o en campo lejano no se ha evaluado.
- El ruido se anade de forma sintetica; no se evaluaron grabaciones con hablantes solapados.
- El ruido de banda ancha a SNR muy baja (0 dB o inferior) sigue siendo dificil: el WER con ruido blanco a 0-5 dB alcanza 24,84 % en greedy y 19,60 % con LM.
- La salida no incluye puntuacion ni distincion de mayusculas y minusculas.
- Riesgo de alucinacion: como todo modelo CTC, puede producir transcripciones plausibles pero incorrectas en segmentos con ruido o silencio; se recomienda validar con LM y umbrales de confianza.
- Sesgos conocidos: no documentados por el autor; al entrenarse solo con LibriSpeech, hereda el sesgo de dominio (lectura de audiolibros) y posiblemente de los hablantes presentes en el corpus.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero los datos de entrenamiento (LibriSpeech, CC BY 4.0, y MUSAN) deben tenerse en cuenta para la redistribucion de derivados.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kumargulshan/wav2vec2-base-ls460-noise-aug
- Modelo base: https://huggingface.co/facebook/wav2vec2-base
- Modelo B960_rev del mismo estudio: https://huggingface.co/kumargulshan/wav2vec2-base-noise-robust-asr
- Modelo B960_rev_s2 (semilla 7): https://huggingface.co/kumargulshan/wav2vec2-base-noise-robust-asr-seed7
- Modelo B_noisy (100 h + ruido): https://huggingface.co/kumargulshan/wav2vec2-base-ls100-noise-aug
- Modelo B2_lr1e-4: https://huggingface.co/kumargulshan/wav2vec2-base-ls100-noise-aug-lr1e-4
- Modelo A_clean (baseline limpio): https://huggingface.co/kumargulshan/wav2vec2-base-ls100-clean
- Dataset LibriSpeech: https://huggingface.co/datasets/openslr/librispeech_asr
- Repositorio de `pyctcdecode`: no disponible en la informacion proporcionada
- Paper o blog del estudio: no disponible en la informacion proporcionada
