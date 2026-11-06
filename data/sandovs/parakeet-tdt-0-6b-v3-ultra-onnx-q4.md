# sandovs/parakeet-tdt-0.6b-v3-ultra-onnx-q4

## Resumen

Parakeet TDT 0.6B v3 Ultra (q4/q4f16 ONNX) es una cuantización a 4 bits del modelo de reconocimiento automático del habla moondream/parakeet-ultra, a su vez un post-entrenamiento del NVIDIA Parakeet TDT 0.6B v3. Lo publica el usuario sandovs con un objetivo muy concreto: ofrecer una versión del modelo que pueda ejecutarse directamente en el navegador mediante onnxruntime-web, con backend WASM (q4) o WebGPU (q4f16). Cubre las 25 lenguas del modelo base, entre ellas el español, el catalán no está incluido y sí el gallego no aparece tampoco: la lista incluye bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru y uk.

El modelo resuelve el problema de desplegar ASR multilingüe de calidad en entornos sin GPU dedicada o incluso sin instalación local, manteniendo una degradación de precisión muy contenida respecto al modelo en FP32. La arquitectura es un encoder Transformer con decodificador TDT (Token-and-Duration Transducer), la misma del Parakeet original, con aproximadamente 0,6 mil millones de parámetros.

La relevancia actual está en que demuestra que un ASR de 25 idiomas puede caber en 675-752 MB y ejecutarse en el navegador con una pérdida de WER de solo 0,49 puntos porcentuales frente al modelo Ultra en FP32, y siendo aún un 1,4 pp mejor que el Parakeet base en FP32.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder + decodificador TDT (Token-and-Duration Transducer) |
| Parámetros totales | ~0,6 mil millones (0.6B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR por segmentos de audio; preprocesador NeMo de 128 mel bins) |
| Tipos de cuantización | q4 (MatMulNBits 4-bit, block 32, simétrico) y q4f16 (q4 + FP16 mixto) |
| Idiomas soportados | 25: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder y decoder separados, más preprocesador nemo128.onnx) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint moondream/parakeet-ultra (commit 73175eb), que a su vez deriva del NVIDIA Parakeet TDT 0.6B v3. La arquitectura es la del Parakeet TDT: un encoder Transformer que procesa características mel (preprocesador NeMo de 128 bins) y un decodificador TDT que predice conjuntamente tokens y duraciones, lo que permite decodificación no autorregresiva por bloques y un buen equilibrio entre latencia y precisión.

El proceso de construcción, documentado en la model card, incluye tres fases. Primero, un mapeo de pesos desde los safetensors de moondream al checkpoint `.nemo` base de NVIDIA, con 723 tensores rellenados exactamente una vez, formas coincidentes y descarte de los seis tensores de la cabeza VAD; los pesos mixtos F16/F32 se convierten a FP32 sin redondeo. Segundo, exportación con NeMo 3.0.0 y torch 2.14.1 mediante `model.export`, con un control de calidad que reproduce exactamente las salidas del encoder de istupakov (diferencia máxima absoluta 0 en 20 clips) y un 20/20 de transcripciones idénticas frente al modelo NeMo mapeado. Tercero, cuantización con `MatMulNBitsQuantizer` (bits=4, block 32, simétrico, accuracy_level=0) aplicada solo a MatMul; en la variante q4f16 se aplica además `convert_float_to_float16` con `keep_io_types`, manteniendo en FP32 LayerNorm, Softmax, Conv, operaciones Reduce/Pow/Sqrt, la LSTM y el subgrafo `encoded_lengths`. No hubo entrenamiento adicional: es una conversión y cuantización puramente post-hoc.

## Capacidades

- Reconocimiento automático del habla (ASR) en 25 idiomas europeos, incluido el español.
- Transcripción con marcas de tiempo a nivel de token gracias al decodificador TDT.
- Ejecución en navegador: variante q4 para WASM (8 hilos) y variante q4f16 para WebGPU.
- Compatible con la librería onnx-asr y con parakeet.js (el sufijo `.int8.onnx`/`.fp16.onnx` solo sirve para que la librería seleccione los ficheros).
- Preprocesador NeMo incluido en dos variantes (`nemo128.onnx` y `nemo128-f32.onnx`) para onnxruntime-web.
- No soporta tool calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo de voz a texto.
- Capacidad multilingüe verificada sobre FLEURS con las 25 lenguas del modelo base.
- No incluye detección de actividad de voz (VAD): la cabeza VAD del modelo base se descartó en la conversión.

## Casos de uso

- Transcripción en el navegador sin backend: la variante q4 (752 MB) se ejecuta con onnxruntime-web sobre WASM con 8 hilos, permitiendo subtitular reuniones o notas de voz directamente en el cliente sin enviar audio a un servidor.
- Aplicaciones web con WebGPU: la variante q4f16 (675 MB) aprovecha la GPU del usuario mediante WebGPU, requiriendo `enableMatmulFp32Accumulation: true`; adecuada para dictado en tiempo real en portátiles modernos.
- Subtitulado multilingüe de contenido audiovisual: con cobertura de 25 lenguas y WER macro del 11,85 % en FLEURS, sirve para generar subtítulos en español, inglés, francés, alemán, italiano, portugués y lenguas eslavas y nórdicas.
- Herramientas de accesibilidad offline: al ejecutarse íntegramente en el cliente, permite dictado por voz en aplicaciones de escritorio o web sin conexión y sin exponer datos personales.
- Prototipado rápido de pipelines ASR: al estar en ONNX y con pesos y configuración incluidos, se integra en flujos de onnx-asr o parakeet.js para validar ideas antes de pasar a un despliegue con GPU.
- Transcripción de audio en dispositivos de borde: el tamaño de 675-752 MB permite desplegarlo en equipos con poca VRAM o incluso solo CPU, cubriendo casos donde un modelo de 0,6B en FP32 sería demasiado pesado.
- Evaluación comparativa de cuantizaciones: útil como referencia para medir el coste real de q4 frente a FP32 en tareas ASR multilingües, con deltas pareados y intervalos de confianza publicados.

## Benchmarks y rendimiento

Resultados de WER (%) sobre FLEURS, split de test completo (20.146 enunciados, 64,7 h), 25 idiomas. "Base" es nvidia/parakeet-tdt-0.6b-v3 en FP32.

| Grupo de lenguas (macro) | Base FP32 | Ultra FP32 | U-q4 | U-q4f16 |
|---|---:|---:|---:|---:|
| Las 25 | 13,25 | 11,37 | 11,85 | 11,86 |
| Románicas (es fr it pt ro) | 6,06 | 5,24 | 5,61 | 5,61 |
| Germánicas (en de nl da sv) | 10,47 | 9,10 | 9,49 | 9,50 |
| Eslavas en alfabeto latino (cs sk pl hr sl) | 13,39 | 11,21 | 11,54 | 11,54 |
| Cirílicas (bg ru uk) | 9,11 | 8,30 | 8,60 | 8,59 |
| Otras (el hu fi et lv lt mt) | 22,04 | 18,80 | 19,63 | 19,63 |
| CER macro, las 25 | 3,83 | 3,29 | 3,42 | 3,41 |

El coste de cuantización frente a Ultra FP32 es de +0,49 pp [+0,43, +0,54] tanto para q4 como para q4f16. Frente al modelo base en FP32, ambas cuantizaciones mejoran en torno a 1,4 pp y ninguna lengua empeora de forma significativa más de 1 pp respecto al base.

En la prueba en navegador sobre un subconjunto de 1.000 enunciados (40 por lengua, estratificado por duración, semilla 7241), el WER macro de las 25 lenguas es 11,92 con U-q4 (WASM, 8 hilos) y 11,96 con U-q4f16 (WebGPU), con una diferencia frente a Python de +0,03 pp en ambos casos.

## Requisitos de hardware

- Tamaño en disco: 752,2 MB para U-q4 y 675,6 MB para U-q4f16 (repo completo: 1,4 GB).
- VRAM/RAM estimada para inferencia: en torno a 1-2 GB, dado el tamaño del modelo y los buffers de activación; no se publican cifras oficiales.
- GPU recomendadas: no se especifican; la variante q4f16 está pensada para WebGPU en GPUs de consumo integradas o dedicadas del navegador.
- Cabe en GPU de consumo: sí, por tamaño; la variante q4 puede ejecutarse solo en CPU vía WASM.
- Opciones de despliegue: onnxruntime-web (WASM y WebGPU), onnx-asr, parakeet.js; también onnxruntime estándar en Python.
- Latencia y throughput: no se publican cifras de latencia ni de RTF; solo se documenta la equivalencia de precisión entre navegador y Python.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | WER FLEURS (25 lenguas) |
|---|---|---:|---|---|---:|
| Este modelo (U-q4 / U-q4f16) | 0,6B | 25 | ONNX 4-bit | CC-BY-4.0 | 11,85 / 11,86 |
| moondream/parakeet-ultra (FP32) | 0,6B | 25 | safetensors/NeMo | CC-BY-4.0 (según modelo base) | 11,37 |
| nvidia/parakeet-tdt-0.6b-v3 (FP32) | 0,6B | 25 | NeMo/ONNX | CC-BY-4.0 | 13,25 |
| istupakov/parakeet-tdt-0.6b-v3-onnx | 0,6B | 25 | ONNX | CC-BY-4.0 | no disponible en la información proporcionada |

La comparación con otros modelos ASR de tamaño similar (Whisper large-v3, etc.) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Es una cuantización, no un modelo nuevo: hereda los sesgos y limitaciones del Parakeet TDT 0.6B v3 y del post-entrenamiento de moondream.
- Riesgo de alucinación y errores en audio con ruido, acentos no representados o dominio muy alejado del entrenamiento; no se documentan análisis de robustez específicos.
- El WER es notablemente peor en lenguas como griego (33,06 %), maltés (23,32 %) y esloveno (20,27 %), lo que limita su uso en esos idiomas.
- La cuantización penaliza más de 1 pp en letón, esloveno, rumano y lituano.
- No incluye VAD: la cabeza de detección de actividad de voz se descartó en la conversión, por lo que hay que segmentar el audio externamente.
- La variante q4f16 en WebGPU exige `enableMatmulFp32Accumulation: true`; sin ese ajuste los resultados pueden ser incorrectos.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene verificar la licencia del modelo base moondream/parakeet-ultra y de NVIDIA Parakeet.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente.
- El modelo no soporta tool calling, agentes ni multimodalidad más allá del audio.

## Enlaces

- Hugging Face: https://huggingface.co/sandovs/parakeet-tdt-0.6b-v3-ultra-onnx-q4
- Modelo base (Ultra): https://huggingface.co/moondream/parakeet-ultra/tree/73175eb7aeb0d82f1e2a6b53b3aabc10a90bcd0b
- Modelo base NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Checkpoint NeMo base usado en el mapeo: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3 (commit 541d1f9)
- ONNX de referencia de istupakov: https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx
- Receta de cuantización previa del mismo autor: https://huggingface.co/sandovs/parakeet-tdt-0.6b-v3-ptBR-TAGARELA-onnx-q4
- Dataset de evaluación: https://huggingface.co/datasets/google/fleurs
