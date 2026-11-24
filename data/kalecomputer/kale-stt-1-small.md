# KaleComputer/kale-stt-1-small

## Resumen

kale-stt-1-small es un modelo de reconocimiento automático del habla (ASR) en inglés, desarrollado por KaleComputer, especializado en voz infantil (5-12 años) y entornos ruidosos. Se trata de un ajuste fino del modelo nvidia/parakeet-tdt_ctc-110m, con arquitectura FastConformer híbrida TDT+CTC y 114,6 millones de parámetros. Su propuesta diferencial es ejecutarse íntegramente en local sobre CPU de tablets de gama baja y en navegador mediante ONNX Runtime Web, con un tamaño en disco de 119,9 MB y un pico de RAM de 189,9 MB en una Samsung Galaxy Tab S10 Lite.

El modelo aborda un problema concreto: los ASR pequeños comerciales (menos de 200 MB) degradan severamente con voces infantiles, alcanzando tasas de error de palabra (WER) del 37-55% en niños, mientras que los modelos de 0,6B mejoran pero exigen unos 885 MB de RAM. kale-stt-1-small afirma igualar a su modelo de 0,6B en habla infantil comercial sellada (24,33-24,68% frente a 24,30%) y superarlo en ruido de fondo a 5 dB SNR en 5,2-6,2 puntos de WER. Todo el entrenamiento se realizó con audio comercialmente libre y datos sintéticos, sin corpus no comerciales.

Es relevante ahora por su enfoque en privacidad (el audio no sale del dispositivo), su licencia CC BY 4.0 y su viabilidad en hardware muy limitado, lo que lo hace atractivo para aplicaciones infantiles, dispositivos IoT y despliegues offline.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer híbrida TDT+CTC (encoder FastConformer + decoder LSTM de 1 capa + cabecera conjunta CTC) |
| Parametros totales | 114,6 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (límite de audio de 48 s por pasada, `pe=600`) |
| Tipos de cuantizacion | QInt8 (encoder MatMul y pointwise), Int8 (joiner), QInt8 (decoder LSTM), FP32 en convoluciones depthwise y de subsampling; bundle x86 con `reduce_range` |
| Idiomas soportados | Inglés (`en`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (con extensión de datos externos para ARM/Mac/WASM; bundle Android con cabecera CTC int8 opcional y joiner NEON) |

## Arquitectura y entrenamiento

El modelo parte de nvidia/parakeet-tdt_ctc-110m y emplea una arquitectura FastConformer con decodificación híbrida TDT (Token-and-Duration Transducer) y CTC. El encoder FastConformer procesa el audio, un decoder LSTM de una capa genera tokens y una cabecera conjunta CTC permite decodificación alternativa. La variante desplegada incluye un límite de 48 segundos por pasada (`pe=600`) y cuantización selectiva: QInt8 en MatMul y operaciones pointwise del encoder, FP32 en convoluciones depthwise y de subsampling, QInt8 en el decoder LSTM e Int8 en el joiner.

El entrenamiento se realizó al 100% con audio comercialmente libre y datos sintéticos, sin usar corpus no comerciales para entrenamiento, pseudo-etiquetado, destilación ni ajuste de hiperparámetros. Los datasets citados incluyen mispeech/speechocean762, edinburghcstr/ami, openslr/librispeech_asr, facebook/voxpopuli y google/speech_commands. El ajuste se orientó a voz infantil de 5-12 años y entornos con ruido, con variantes de decodificación (1 pasada, 3 pasadas greedy adaptativo, híbrido TDT+CTC adaptativo). No se especifica el número total de tokens de entrenamiento ni si hubo RLHF/DPO (no aplicable típicamente en ASR).

## Capacidades

- Reconocimiento de voz a texto en inglés, optimizado para habla infantil (5-12 años) y entornos ruidosos.
- Decodificación híbrida TDT+CTC con presets de 1 pasada, 3 pasadas greedy adaptativo y híbrido adaptativo.
- Ejecución en dispositivo (on-device) sobre CPU de gama baja y en navegador vía ONNX Runtime Web / WASM.
- Compatibilidad con sherpa-onnx para despliegue.
- Manejo de audio de hasta 48 segundos por pasada.
- Re-scoring opcional con LLM externo (no incluido) para mejorar WER.
- No soporta tool calling, agentes ni multimodalidad (es un modelo ASR puro).

## Casos de uso

- Reconocimiento de voz en aplicaciones infantiles: el modelo gestiona respuestas cortas de 1-2 palabras y habla espontánea de niños de 5-12 años, con WER del 24,33-24,68% en habla infantil comercial sellada, adecuado para asistentes educativos o juegos por voz.
- Asistentes por voz offline en tablets de gama baja: con 189,9 MB de pico de RAM y 90,8 ms por pasada en una Galaxy Tab S10 Lite, permite interacción por voz sin conexión ni subida de audio a la nube.
- Transcripción en entornos ruidosos: con 14,2% WER a 5 dB SNR sin LLM, es útil para aulas, hogares o espacios con ruido de fondo donde otros modelos pequeños fallan.
- Privacidad y cumplimiento normativo: al ejecutarse 100% en local, el audio no abandona el dispositivo, lo que facilita el cumplimiento de normativas de protección de datos infantiles (por ejemplo, COPPA o RGPD).
- Despliegue en navegador: mediante ONNX Runtime Web y WASM (~89 ms de media en Apple Silicon), permite demos o aplicaciones web de dictado sin backend.
- Integración en pipelines con sherpa-onnx: para transcripción por lotes o en tiempo real en dispositivos embebidos y sistemas de bajo consumo.
- Re-scoring con LLM: combinado con un LLM local de 2B, mejora el WER en habla infantil (24,33% frente a 24,68% sin LLM), útil en aplicaciones donde se dispone de cómputo adicional.

## Benchmarks y rendimiento

Datos publicados en la model card (WER %, menor es mejor):

| Modelo | Disco / pico RAM | hri17s | hri17w | JIBO | so762c | noise5 |
|---|---|---|---|---|---|---|
| kale-stt-1-small (0 LLM) | 119,9 MB / 189,9 MB | no disponible | no disponible | no disponible | 14,7% | 14,2% |
| kale-stt-1-small (con LLM 2B) | 119,9 MB / 189,9 MB | no disponible | no disponible | no disponible | 14,6% | 13,2-13,6% |
| Modelo 0,6B propio (referencia) | 688 MB / 885 MB | no disponible | no disponible | no disponible | 15,9% | 19,4% |

Otros datos reportados:

| Prueba | Resultado |
|---|---|
| kids3 (media de hri17s, JIBO, so762c) | 24,68-24,69% WER sin LLM; 24,33% con LLM 2B |
| LibriSpeech (adulto limpio) | 2,28% WER |
| OCSC (niños 5-9, eval-only) | 26,30% greedy; 25,02-25,11% híbrido; 24,38% con LLM 2B |
| UXTD (eval-only) | 27,64% sin LLM; 27,48% con LLM |
| Turnos reales de app (niño de 5 años, 119 clips) | 20,28% WER global; 24,60% en tema; 70,2% coincidencia exacta |
| Latencia Galaxy Tab S10 Lite (4 hilos) | 90,8 ms 1 pasada (41,7× RT); 247,8 ms 3 pasadas; 363,5 ms híbrido |
| WASM en Apple Silicon (4 hilos) | ~89 ms de media (37× RT) |

No se han publicado resultados completos de hri17s, hri17w ni JIBO en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 189,9 MB de pico `VmHWM` y 160,3 MB en estado estable en CPU de tablet; 37,7 MB de heap privado no desalojable.
- GPU recomendadas: no requiere GPU; está diseñado para CPU. No se especifican requisitos de GPU.
- Cabe en GPU consumer: sí, pero su objetivo es CPU; no se detallan requisitos de VRAM para GPU.
- Opciones de despliegue: ONNX Runtime (incluida versión Lean 1.28.2 con `disable_prepacking=1`), ONNX Runtime Web (WASM), sherpa-onnx; bundle Android con cabecera CTC int8 opcional y joiner NEON.
- Latencia y throughput: 90,8 ms por pasada (41,7× tiempo real) en Samsung Galaxy Tab S10 Lite; 247,8 ms en 3 pasadas greedy; 363,5 ms en híbrido; ~89 ms en WASM sobre Apple Silicon.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | WER niños (referencia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kale-stt-1-small | 114,6 M | 48 s por pasada | 24,33-24,68% (kids3) | CC BY 4.0 | Hugging Face (ONNX) |
| Modelo propio 0,6B (KaleComputer) | ~600 M | no disponible | 24,30% (kids3) | no disponible | no disponible |
| nvidia/parakeet-tdt_ctc-110m | 110 M | no disponible | 37-55% en niños (según model card) | CC BY 4.0 | Hugging Face |
| ASR cloud 1,7B | 1,7 B | no disponible | 24,20% (kids3) | propietaria | servicio cloud |

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües.
- El límite de audio es de 48 segundos por pasada, lo que requiere segmentación para audios largos.
- El rendimiento en habla infantil sigue siendo limitado en edades tempranas: 37,13% WER a los 5 años y 49,79% en respuestas cortas de 1-2 palabras (OCSC).
- Requiere re-scoring con LLM para acercarse a modelos grandes; sin LLM, el WER en niños es de 24,68%.
- Riesgo de alucinación y errores en palabras clave de seguridad/acción (la model card menciona `keys%` pero no se ha proporcionado el valor completo).
- Aunque la licencia es CC BY 4.0 (permite uso comercial con atribución), el modelo se entrenó con datasets concretos cuya licencia debe verificarse para producción.
- El rendimiento depende de la versión de ONNX Runtime: en ORT 1.32 el pico de RAM sube a 223-233 MB.
- No dispone de tool calling, agentes ni capacidades multimodales.

## Enlaces

- Hugging Face: https://huggingface.co/KaleComputer/kale-stt-1-small
- Space de demostración: https://huggingface.co/spaces/KaleComputer/kale-stt-1
- Colección kale-stt-1: https://huggingface.co/collections/KaleComputer/kale-stt-1-6b04a4c86ec5bf4ecac2398a
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m
