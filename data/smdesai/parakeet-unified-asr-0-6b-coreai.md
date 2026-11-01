# smdesai/parakeet-unified-asr-0.6b-CoreAI

## Resumen

Parakeet Unified ASR 0.6B CoreAI es una conversión del modelo de reconocimiento automático del habla Nemotron-Labs-Unified-ASR-0.6b de NVIDIA al formato Core AI de Apple, orientada a inferencia en dispositivo (on-device) en iPhone. El modelo original es un checkpoint FastConformer-RNNT de 626,7 millones de parámetros entrenado conjuntamente para reconocimiento con contexto completo y en modo streaming, con el idioma objetivo indicado mediante un prompt one-hot. Esta conversión, publicada por el usuario smdesai, lo descompone en tres grafos Core AI: el encoder (con el prompt de idioma y la proyección del encoder del joint plegados), el predictor RNN-T y el joint.

La relevancia de esta ficha es doble. Por un lado, demuestra que es viable ejecutar un ASR multilingüe de calidad en hardware de consumo Apple sin conexión a la nube: el encoder corre en la GPU del iPhone en fp16 y reproduce el WER del modelo original con una diferencia máxima de 0,01 puntos en todas las suites evaluadas. Por otro lado, sirve como referencia metodológica de conversión y validación: el autor documenta con detalle la comparación token a token contra NeMo Speech 3.1.0, clasificando las discrepancias en exactas, «knife-edge» (empates en el top-2 del modelo original) y fallos reales, con cero fallos en 12.619 enunciados.

El modelo cubre 25 idiomas europeos con puntuación y capitalización, y ofrece modos offline y streaming con latencias configurables desde 0,16 s hasta 2,08 s, además de un modo para grabaciones largas de más de 60 segundos. La licencia es OpenMDW 1.1, heredada del modelo base de NVIDIA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer-RNNT (encoder Conformer con subsampling, predictor RNN-T y joint) |
| Parámetros totales | 626,7 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica en el sentido de LLM; ventana de audio por paso de streaming configurable (izquierda / chunk / derecha), p. ej. 5,6 / 0,08 / 0,08 s hasta 10 / 40 / 10 s |
| Tipos de cuantización | fp16 en el encoder sobre GPU del iPhone (según la model card); no se documentan otras cuantizaciones |
| Idiomas soportados | 25: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | Core AI (grafos Core AI: encoder, predictor y joint); tamaño del repo 1,3 GB |

## Arquitectura y entrenamiento

El modelo base es un FastConformer-RNNT de NVIDIA con 626,7 M de parámetros. El encoder es un transformer Conformer con subsampling de audio, y la decodificación se realiza con un predictor RNN-T y una red joint que combina las representaciones del encoder y del predictor. El idioma objetivo se introduce como un prompt one-hot, lo que permite un único checkpoint multilingüe en lugar de un modelo por idioma. El entrenamiento del modelo original no está detallado en la información proporcionada (número de tokens, composición del dataset, uso de RLHF o DPO: no disponible).

La conversión a Core AI separa el modelo en tres grafos: el encoder (que absorbe el prompt de idioma y la proyección del encoder del joint), el predictor RNN-T y el joint. El frontend de audio, el bucle de decodificación greedy, el detokenizador y la planificación del streaming se ejecutan en el host (CPU), no en los grafos. El streaming sigue el script de streaming con búfer de NeMo, no el streaming cache-aware: en cada paso se recalculan las características y el encoder sobre los últimos `left + chunk + right` segundos de audio, con la atención limitada a ese contexto, y se decodifican los frames nuevos del encoder arrastrando el estado del decodificador. Los tiempos se convierten a frames del encoder como `int(segundos × 100 / 8)`.

## Capacidades

- Reconocimiento automático del habla (ASR) offline sobre audio completo.
- ASR en streaming con búfer, con latencias configurables de 0,16 s, 0,56 s, 1,12 s y 2,08 s, y un modo específico para grabaciones de más de 60 s.
- Reconocimiento multilingüe en 25 idiomas europeos mediante prompt de idioma one-hot.
- Puntuación y capitalización en la salida.
- Decodificación greedy RNN-T con arrastre de estado entre chunks en streaming.
- Ejecución on-device en iPhone: encoder en GPU en fp16, sin dependencia de red.
- No se documentan tool calling, function calling, capacidades de agente, visión ni audio de entrada más allá del propio ASR.

## Casos de uso

- **Dictado y transcripción en el dispositivo**: integración en apps de notas de voz para iOS, transcribiendo audio sin enviar datos a la nube gracias a la ejecución local del encoder en la GPU del iPhone y al pipeline completo en el host.
- **Subtitulado en tiempo real**: el modo streaming con latencia de 0,16 s o 1,12 s permite generar subtítulos con retardo bajo en vídeo o llamadas, manteniendo el estado del decodificador entre chunks.
- **Transcripción de reuniones largas**: el modo de 10 / 40 / 10 s procesa grabaciones de más de 60 s a 120–123× tiempo real en el iPhone, con WER de 2,54 en inglés y 9,26 en alemán en las pruebas del autor, lo que lo hace adecuado para reuniones de decenas de minutos.
- **Aplicaciones multilingües europeas**: con 25 idiomas cubiertos mediante prompt one-hot, una sola app puede atender usuarios en búlgaro, croata, checo, danés, neerlandés, inglés, estonio, finés, francés, alemán, griego, húngaro, italiano, letón, lituano, maltés, polaco, portugués, rumano, eslovaco, esloveno, español, sueco, ruso y ucraniano sin descargar un modelo por idioma.
- **Asistentes de voz con requisitos de privacidad**: sectores como sanidad o legal pueden desplegar transcripción local en dispositivos Apple, evitando el envío de audio sensible a servidores externos.
- **Accesibilidad**: conversión de voz a texto en tiempo real para personas con discapacidad auditiva, con la ventaja de funcionar sin conectividad y con latencias de 0,16 s en el modo más agresivo.
- **Procesamiento por lotes en dispositivos Apple Silicon**: aunque la model card se centra en iPhone, los tags incluyen `apple-silicon`, lo que sugiere su uso en Macs para pipelines de transcripción local.

## Benchmarks y rendimiento

WER offline (%) medido en iPhone (iPhone19,4, iOS 27.2) con el encoder en GPU en fp16, comparado con el modelo original en NeMo Speech 3.1.0 (fp32 en CPU):

| Suite | Enunciados | Model card | Original (NeMo) | Esta conversión | Exactas / knife-edge / fallos |
|---|---|---|---|---|---|
| LibriSpeech test-clean | 2.620 | 1,38 | 1,75 | 1,75 | 99,89 % / 3 / 0 |
| LibriSpeech test-other | 2.939 | 2,81 | 3,24 | 3,23 | 99,83 % / 5 / 0 |
| FLEURS en | 647 | — | 6,43 | 6,43 | 99,85 % / 1 / 0 |
| FLEURS de | 862 | 3,87 | 6,95 | 6,95 | 99,65 % / 3 / 0 |
| FLEURS fr | 676 | 5,28 | 7,53 | 7,53 | 99,41 % / 4 / 0 |
| FLEURS es | 908 | 3,00 | 4,81 | 4,81 | 99,78 % / 2 / 0 |
| FLEURS it | 865 | 2,30 | 5,19 | 5,19 | 99,77 % / 2 / 0 |
| FLEURS pt | 919 | 4,42 | 6,63 | 6,63 | 99,78 % / 2 / 0 |
| FLEURS ru | 775 | — | 9,20 | 9,21 | 99,35 % / 5 / 0 |
| FLEURS pl | 758 | — | 9,07 | 9,08 | 99,08 % / 7 / 0 |
| FLEURS el | 650 | — | 30,95 | 30,95 | 98,31 % / 11 / 0 |
| **Total** | **12.619** | | | | **99,64 % / 45 / 0** |

Streaming (contra el bucle de streaming con búfer de NeMo, primeras locuciones de cada suite):

| Latencia | Audio | WER original | Esta conversión | Exactas / knife-edge / fallos |
|---|---|---|---|---|
| 1,12 s | LibriSpeech test-clean, primeras 120 | 1,50 | 1,50 | 120 / 0 / 0 |
| 1,12 s | FLEURS de, primeras 60 | 8,61 | 8,61 | 59 / 1 / 0 |
| 0,16 s | LibriSpeech test-clean, primeras 40 | 0,54 | 0,54 | 40 / 0 / 0 |

Grabaciones largas (21 grabaciones de 62 s a 6,4 min, 51 minutos en total):

| Configuración | WER inglés | WER alemán | Velocidad en iPhone |
|---|---|---|---|
| 10 / 40 / 10 s | 2,54 | 9,26 | 120–123× tiempo real |
| Latencia 2,08 s | 2,96 | 9,21 | 20–24× tiempo real |
| Original offline sobre toda la grabación | 2,72 | 10,08 | — |

El autor señala que las cifras de la model card original no se alcanzan con el propio modelo original sobre este checkpoint, y que la conversión reproduce el modelo original, no la model card. Puntuando FLEURS contra transcripciones normalizadas, el original obtiene de 5,28, fr 5,99, es 3,42, it 3,24 y pt 4,82.

## Requisitos de hardware

- **Hardware objetivo**: iPhone (probado en iPhone19,4 con iOS 27.2); los tags incluyen `apple-silicon`, lo que apunta a Macs con chip de Apple como plataforma adicional.
- **VRAM estimada**: no disponible de forma explícita; el repo pesa 1,3 GB y el encoder se ejecuta en fp16 en la GPU del iPhone, lo que da una idea del orden de magnitud de memoria necesaria.
- **GPU recomendadas**: GPU integrada del iPhone (encoder en fp16); no se documentan requisitos para A100, H100 o RTX 4090.
- **Compatibilidad con GPU de consumo**: el modelo está empaquetado para Core AI, no para CUDA; no se indica soporte para GPU NVIDIA.
- **Opciones de despliegue**: Core AI en iOS/macOS. El modelo original puede desplegarse con NeMo Speech 3.1.0; para esta conversión no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo ASR Core AI).
- **Latencia y throughput**: 120–123× tiempo real en el modo de grabaciones largas (10 / 40 / 10 s) y 20–24× en el modo de 2,08 s de latencia, medidos en iPhone.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Streaming | Licencia | Plataforma |
|---|---|---|---|---|---|
| Parakeet Unified ASR 0.6B CoreAI (esta ficha) | 626,7 M | 25 europeos | Sí, con búfer, latencias 0,16–2,08 s | OpenMDW 1.1 | Core AI (iPhone, Apple Silicon) |
| NVIDIA Nemotron-Labs-Unified-ASR-0.6b (original) | 626,7 M | 25 europeos | Sí, script de streaming de NeMo | OpenMDW 1.1 | NeMo Speech 3.1.0 (CPU/GPU) |
| Whisper large-v3 | no disponible en la información proporcionada | Multilingüe amplio | No nativo (por ventanas) | no disponible en la información proporcionada | Múltiple (PyTorch, CTranslate2, etc.) |
| Parakeet de NVIDIA (otras variantes) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de benchmarks de alternativas comparables, por lo que la comparación se limita a parámetros, idiomas, streaming, licencia y plataforma.

## Limitaciones y advertencias

- **Solo plataforma Apple**: los pesos están en formato Core AI y dependen de los grafos y del pipeline de host específicos; no son utilizables directamente en PyTorch, ONNX o CUDA.
- **Idiomas limitados a Europa**: 25 idiomas europeos; no cubre otras lenguas aunque el modelo base pudiera tenerlas.
- **Griego con WER alto**: FLEURS el registra 30,95 % de WER, muy por encima del resto de idiomas (el siguiente es ru con 9,20 %), lo que desaconseja su uso en producción para griego sin evaluación adicional.
- **Discrepancia con la model card original**: las cifras publicadas por NVIDIA no se reproducen ni con el modelo original en NeMo; conviene usar como referencia los valores medidos por el autor de la conversión.
- **Streaming no cache-aware**: el modo de streaming recalcula características y encoder sobre la ventana de contexto en cada paso, lo que incrementa el coste computacional frente a soluciones cache-aware.
- **Riesgo de alucinación**: no se documenta en la información proporcionada; en ASR, los errores típicos son sustituciones, omisiones e inserciones, y el autor reporta cero fallos reales frente al original en las suites evaluadas.
- **Sesgos**: no se documentan sesgos específicos en la información proporcionada.
- **Licencia OpenMDW 1.1**: es una licencia de pesos abiertos de NVIDIA; conviene revisar sus términos para uso comercial antes de desplegar en producción.
- **Madurez**: el repo tiene 16 descargas, 0 likes y fue creado el 28 de octubre de 2026, por lo que es una conversión reciente y con poca validación comunitaria.
- **Dependencia del host**: el frontend de audio, la decodificación greedy, el detokenizador y la planificación del streaming corren en el host; el rendimiento final depende de la implementación de ese pipeline, no solo de los grafos Core AI.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/smdesai/parakeet-unified-asr-0.6b-CoreAI)
- [Modelo base: nvidia/nemotron-labs-unified-asr-0.6b](https://huggingface.co/nvidia/nemotron-labs-unified-asr-0.6b)
- [Licencia OpenMDW 1.1](https://github.com/OpenMDW/OpenMDW/blob/main/1.1/LICENSE.OpenMDW-1.1)
- NeMo Speech 3.1.0: no disponible enlace en la información proporcionada
- Paper del modelo original: no disponible en la información proporcionada
- Repositorio o demo adicional: no disponible en la información proporcionada
