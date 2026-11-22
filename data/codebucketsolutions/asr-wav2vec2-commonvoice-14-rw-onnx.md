# codebucketsolutions/asr-wav2vec2-commonvoice-14-rw-onnx

## Resumen

Este repositorio contiene una exportación a ONNX del modelo SpeechBrain `asr-wav2vec2-commonvoice-14-rw`, un sistema de reconocimiento automático del habla (ASR) para kinyarwanda (idioma con código ISO `rw`, hablado en Ruanda). El modelo original fue entrenado por el equipo de SpeechBrain sobre el corpus Common Voice 14.0 de kinyarwanda y esta exportación, publicada por el usuario `codebucketsolutions`, preserva los pesos sin modificarlos, eliminando la dependencia de PyTorch en tiempo de inferencia. Está pensado para integrarse en el servidor de voz `bolo` (repositorio `cB-Sigma/bolo-speech`).

La arquitectura subyacente es wav2vec 2.0 en su variante XLSR-53, afinada para CTC, seguida de una red DNN de tres capas y una capa CTC con log-softmax. El grafo ONNX (opset 17, float32) acepta una forma de onda mono a 16 kHz de longitud variable y produce log-probabilidades con un frame cada 20 ms. El repositorio ocupa 1,3 GB y no incluye inferencia declarada en la model card (`inference: false`), aunque el propio grafo es ejecutable con ONNX Runtime.

Su relevancia es doble: por un lado, ofrece una vía de despliegue ligera y sin PyTorch para un idioma de bajos recursos como el kinyarwanda; por otro, documenta con rigor la paridad numérica frente al original en PyTorch, un aspecto poco habitual en exportaciones comunitarias. No es una release oficial de SpeechBrain.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 (XLSR-53) fine-tuned + DNN de 3 capas + CTC + log-softmax |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio de longitud variable; un frame de salida cada 20 ms) |
| Tipos de cuantizacion | no disponible (el grafo publicado es float32; el tag `base_model:quantized` sugiere una variante cuantizada del modelo base, pero no se detalla) |
| Idiomas soportados | kinyarwanda (`rw`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17, float32) + `tokens.txt` (SentencePiece) |

## Arquitectura y entrenamiento

El modelo es un encoder `EncoderASR` de SpeechBrain: un backbone wav2vec 2.0 con arquitectura XLSR-53 (diseñada originalmente para reconocimiento multilingüe) afinado para kinyarwanda, seguido de una DNN de tres capas, una capa CTC y una capa de log-softmax. La exportación reproduce la normalización que aplica el wrapper de SpeechBrain (normalización temporal de la forma de onda y normalización temporal y por características de la salida del encoder mediante `layer_norm`), pero calculada con medias y varianzas para que la longitud del eje temporal permanezca libre en el grafo.

Los datos de entrenamiento corresponden a Common Voice 14.0 en kinyarwanda (licencia CC0), según indica la model card. No se especifican en la información disponible el número de tokens de audio, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO (poco habituales en ASR CTC). La innovación técnica destacable de esta ficha no está en el entrenamiento sino en la exportación: el script `export_speechbrain_onnx.py` genera un grafo con paridad verificada frente a SpeechBrain 1.1.2 (torch 2.15.0+cpu) ejecutado con ONNX Runtime 1.32.0, con una diferencia máxima absoluta en log-probabilidades de 2,20e-02 sobre el clip de ejemplo de 5,07 s, mismo best path y mismo texto decodificado.

## Capacidades

- Reconocimiento automático del habla en kinyarwanda a partir de audio mono a 16 kHz.
- Salida CTC con log-probabilidades por frame (un frame cada 20 ms), decodificable de forma greedy con blank 0.
- Tokenización SentencePiece; el prefijo `▁` marca inicio de palabra.
- Entrada de longitud variable gracias a la normalización calculada con medias y varianzas.
- Ejecución sin PyTorch mediante ONNX Runtime.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada más allá de la transcripción ni modo thinking.
- Capacidad multilingüe limitada al kinyarwanda; no se documentan otros idiomas.

## Casos de uso

- Transcripción de audio en kinyarwanda en servicios de voz: el grafo acepta formas de onda de longitud libre y devuelve log-probabilidades por frame, lo que permite integrarlo en un servidor ASR como `bolo` sin arrastrar PyTorch.
- Despliegue en entornos con restricciones de dependencias: al ser ONNX float32 con opset 17, puede ejecutarse con ONNX Runtime en servidores donde instalar torch no es viable.
- Subtitulado y generación de actas de reuniones en kinyarwanda: la decodificación greedy con SentencePiece produce texto continuo a partir de audio de 16 kHz.
- Investigación en lenguas de bajos recursos: sirve como línea base reproducible para comparar técnicas de adaptación o cuantización sobre un ASR de kinyarwanda con WER de referencia publicado.
- Integración en pipelines de procesado por lotes: la longitud de entrada variable y la ausencia de estado permiten procesar clips de distinta duración en serie con ONNX Runtime.
- Verificación de exportaciones: el repositorio incluye `parity.json`, `speechbrain_onnx.json` y el script de exportación, útiles como referencia para auditar la fidelidad de conversiones de SpeechBrain a ONNX.

## Benchmarks y rendimiento

La model card cita los resultados publicados por SpeechBrain para el modelo original sobre el conjunto de test de Common Voice 14.0 en kinyarwanda:

| Metrica | Valor |
|---|---|
| WER (Common Voice 14.0 rw, test) | 23,71 % |
| CER (Common Voice 14.0 rw, test) | 7,59 % |

Paridad de la exportación ONNX frente a PyTorch (clip `example_rw.wav`, 5,07 s):

| Metrica | Valor |
|---|---|
| Diferencia máxima absoluta en log-probabilidades | 2,20e-02 |
| Mismo best path | sí |
| Mismo texto decodificado | sí |
| Transcripción ONNX | ABAMUGARIYE KU RUGAMBA BAFASHWA KUBONA INSIMBURANGINGO |

No se han publicado en la información disponible resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 1,3 GB en float32, por lo que el grafo cabe holgadamente en GPUs de consumo y en CPU.
- GPU recomendadas: no se especifican; al ser un modelo de ASR de tamaño moderado, cualquier GPU con varios GB de memoria es suficiente, aunque no hay datos publicados.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna con al menos unos pocos GB de VRAM, dado el tamaño del artefacto.
- Opciones de despliegue: ONNX Runtime (versión validada 1.32.0 en la prueba de paridad); también es posible servir el modelo original con SpeechBrain 1.1.2 y torch 2.15.0+cpu.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| codebucketsolutions/asr-wav2vec2-commonvoice-14-rw-onnx | no disponible | audio 16 kHz de longitud variable | WER 23,71 %, CER 7,59 % (heredado del original) | Apache-2.0 | Hugging Face, ONNX |
| speechbrain/asr-wav2vec2-commonvoice-14-rw | no disponible | audio 16 kHz de longitud variable | WER 23,71 %, CER 7,59 % | Apache-2.0 | Hugging Face, PyTorch/SpeechBrain |
| Otros ASR wav2vec 2.0 para lenguas de bajos recursos | no disponible | audio 16 kHz | no disponible | variable | Hugging Face |

No se dispone en la información proporcionada de datos de parámetros, contexto ni rendimiento de alternativas concretas que permitan una comparación numérica más detallada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre Common Voice, puede heredar los sesgos de representación del corpus (acentos, género, edad y condiciones de grabación).
- Riesgo de alucinación: inherente a los sistemas CTC; con audio ruidoso o fuera de dominio puede producir transcripciones plausibles pero incorrectas.
- Limitaciones de idioma: solo kinyarwanda (`rw`); no se garantiza comportamiento en otros idiomas ni en code-switching.
- Limitaciones de contexto: no se documenta la duración máxima de audio soportada; la longitud del eje temporal es libre en el grafo, pero el rendimiento en clips muy largos no está verificado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe citarse SpeechBrain y el paper del modelo original como pide la model card del modelo base.
- Caveats para producción: no es una release oficial de SpeechBrain; la model card declara `inference: false`; el tag `base_model:quantized` sugiere una variante cuantizada no detallada; el WER de 23,71 % es relativamente alto y conviene evaluarlo en el dominio concreto antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/codebucketsolutions/asr-wav2vec2-commonvoice-14-rw-onnx
- Modelo base: https://huggingface.co/speechbrain/asr-wav2vec2-commonvoice-14-rw
- Repositorio del servidor de voz bolo: https://github.com/cB-Sigma/bolo-speech
- Script de exportación: `server/tools/export_speechbrain_onnx.py` en el repositorio de bolo
- SpeechBrain: https://speechbrain.github.io
- Common Voice 14.0: https://commonvoice.mozilla.org
