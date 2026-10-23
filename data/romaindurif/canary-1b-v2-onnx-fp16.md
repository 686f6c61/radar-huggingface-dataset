# romaindurif/canary-1b-v2-onnx-fp16

## Resumen

Este repositorio contiene una conversión a ONNX con pesos y cómputo en float16 de NVIDIA Canary 1B v2, un modelo de reconocimiento automático del habla (ASR) y traducción automática del habla (AST) basado en NeMo Conformer AED. La conversión la firma romaindurif para Voqify, una aplicación de dictado local push-to-talk, y parte del export en float32 de istupakov (revisión `5ebc152`). El resultado mantiene las mismas entradas y salidas en float32 que el export original, pero reduce el peso del repositorio de 4,0 GB a 2,0 GB y el pico de VRAM de 7,0 GB a 3,5 GB.

El interés práctico está en que permite ejecutar un modelo ASR de aproximadamente 1.000 millones de parámetros en GPUs de consumo y en entornos locales, con una pérdida de precisión prácticamente nula: sobre FLEURS francés dev, el WER pasa de 4,49 % (float32) a 4,47 % (float16), y ambas variantes generan el mismo texto en 286 de las 289 muestras. Canary 1B v2 cubre 25 idiomas europeos y se distribuye con licencia CC BY 4.0, lo que facilita su uso comercial con atribución.

La conversión no es un simple cast: el script mantiene en float32 las longitudes derivadas de enteros del encoder (float16 solo representa enteros exactos hasta 2048, y 38 s de audio ya generan 3.800 frames de features) y conserva float32 en las entradas y salidas del grafo. El resultado está pensado para el execution provider CUDA de ONNX Runtime sobre GPUs NVIDIA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | NeMo Conformer AED (encoder Conformer + decoder autorregresivo con atención), según el tag `nemo-conformer-aed` |
| Parámetros totales | aproximadamente 1.000 millones (1B según la denominación del modelo; no se detalla cifra exacta en la información disponible) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; la model card menciona segmentos de 38 s de audio (3.800 frames de features) como caso de referencia |
| Tipos de cuantización | float16 (este repositorio); float32 (export original de istupakov). Los nombres de fichero siguen la convención de los modelos cuantizados de onnx-asr, pero este repo solo publica fp16 |
| Idiomas soportados | 25: búlgaro, croata, checo, danés, neerlandés, inglés, estonio, finlandés, francés, alemán, griego, húngaro, italiano, letón, lituano, maltés, polaco, portugués, rumano, eslovaco, esloveno, español, sueco, ruso y ucraniano |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`encoder-model.fp16.onnx`, `decoder-model.fp16.onnx`); entradas y salidas en float32 |
| Tamaño del repositorio | 2,0 GB |
| Modelo base | nvidia/canary-1b-v2 (vía el export float32 istupakov/canary-1b-v2-onnx) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo original de NVIDIA: un esquema Conformer AED (attention encoder-decoder), con un encoder Conformer que procesa las features acústicas y un decoder autorregresivo que genera la secuencia de texto. El pipeline declarado cubre tanto `automatic-speech-recognition` como `automatic-speech-translation`. El repositorio no aporta detalles sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO); esa información corresponde a la model card de nvidia/canary-1b-v2 y no está incluida en la documentación de esta conversión.

La innovación técnica de este repositorio es el proceso de conversión a float16 descrito en `to_fp16.py`, realizado con onnx 1.23 y onnxconverter-common 1.16. El script convierte pesos y cómputo a float16 pero mantiene float32 en las entradas y salidas del grafo, conserva en float32 los cálculos derivados de entradas enteras (longitudes del encoder) y permite que el decoder lea sus estados ocultos en float16 cuando también son salida del grafo. Los comandos de conversión son:

```shell
python to_fp16.py encoder-model.onnx out/encoder-model.fp16.onnx length
python to_fp16.py decoder-model.onnx out/decoder-model.fp16.onnx input_ids encoder_mask
```

## Capacidades

- Transcripción de voz a texto (ASR) en 25 idiomas europeos, incluidos español, francés, alemán, italiano, portugués, neerlandés, polaco, ruso y ucraniano.
- Traducción automática del habla (AST), según el tag `automatic-speech-translation` del repositorio; las direcciones de traducción concretas no se detallan en la información disponible.
- Ejecución local sobre GPU NVIDIA mediante el execution provider CUDA de ONNX Runtime, sin dependencia de servicios en la nube.
- Integración con la librería `onnx-asr`, cuyos nombres de fichero y convenciones de modelos cuantizados sigue este repositorio.
- Inferencia con decodificación greedy, tal y como se describe en las mediciones de la model card.
- No se documentan en la información disponible capacidades de tool calling, agentes, vision, audio de entrada más allá del propio ASR ni modo de razonamiento explícito.

## Casos de uso

- Dictado local push-to-talk: es el caso para el que se creó la conversión (Voqify). El modelo transcribe fragmentos cortos de voz en el propio dispositivo con un pico de 3,5 GB de VRAM, lo que permite mantenerlo cargado en segundo plano en una GPU de consumo.
- Transcripción de reuniones multilingües: al cubrir 25 idiomas europeos con un único checkpoint, una herramienta interna puede transcribir reuniones en varias lenguas sin orquestar modelos separados por idioma.
- Subtitulado y actas en entornos con requisitos de privacidad: al ejecutarse íntegramente en local sobre ONNX Runtime, los audios no salen de la infraestructura de la organización, lo que simplifica el cumplimiento del RGPD en sectores como salud, legal o administración pública.
- Atención al cliente y análisis de llamadas on-premise: el modelo puede transcribir grabaciones por lotes en un servidor con GPU; con 0,62 s por clip de 10 s en una RTX 5090, un único dispositivo procesa del orden de decenas de horas de audio por hora de cómputo (estimación derivada de la medición del autor).
- Traducción de voz en contextos institucionales o de soporte: la etiqueta de traducción automática del habla permite plantear flujos de transcripción más traducción en una sola pasada del modelo, útil en organismos con varias lenguas oficiales.
- Accesibilidad y subtitulado en directo: la latencia de 0,62 s por clip de 10 s y el arranque de 8 s (carga y warm-up) hacen viable un subtitulado casi en tiempo real en un equipo con GPU dedicada.
- Evaluación reproducible de ASR: investigadores pueden comparar el comportamiento float16 frente a float32 con el mismo grafo y las mismas entradas, como demuestra la comparación publicada sobre FLEURS francés dev.
- Aplicaciones de escritorio empaquetadas: el formato ONNX con un único par de ficheros encoder/decoder simplifica la distribución junto a una app, sin necesidad de instalar PyTorch ni NeMo.

## Benchmarks y rendimiento

Mediciones publicadas por el autor sobre FLEURS francés dev (289 clips de unos 10 s), decodificación greedy, ONNX Runtime 1.31 con CUDA sobre una RTX 5090:

| Métrica | float32 | float16 (este repo) |
|---|---|---|
| Pico de VRAM | 7,0 GB | 3,5 GB |
| WER | 4,49 % | 4,47 % |
| Carga y warm-up | 20 s | 8 s |
| Tiempo por clip | 0,86 s | 0,62 s |
| Descarga | 4,0 GB | 2,0 GB |

Ambas variantes producen el mismo texto en 286 de las 289 muestras; las diferencias suman 3 palabras de 6.590 (por ejemplo, « Ogarzynska » frente a « Ogarzyńska »).

No se han publicado en la información disponible resultados de otros benchmarks (por ejemplo, MMLU, HumanEval o GSM8K, no aplicables a un modelo ASR, ni WER en el resto de los 24 idiomas).

## Requisitos de hardware

- VRAM estimada para inferencia: 3,5 GB de pico en float16 (medido); 7,0 GB en float32.
- GPU recomendadas: el autor indica que el modelo está pensado para GPUs NVIDIA con el execution provider CUDA de ONNX Runtime. La medición se hizo en una RTX 5090; no se han publicado cifras para A100, H100 ni otras tarjetas.
- GPU de consumo: con 3,5 GB de pico, cabría en tarjetas consumer con al menos 4 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, etc.), si bien esta compatibilidad no está verificada por el autor en la información disponible.
- Opciones de despliegue: ONNX Runtime con CUDA execution provider y la librería `onnx-asr`. No se mencionan soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato y arquitectura.
- Latencia y throughput: 0,62 s por clip de unos 10 s de audio y 8 s de carga más warm-up en una RTX 5090, según el autor. En GPUs de gama inferior la latencia será mayor; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Descarga | VRAM pico | WER FLEURS fr dev | Licencia |
|---|---|---|---|---|---|---|---|
| romaindurif/canary-1b-v2-onnx-fp16 (este repo) | ~1B | no disponible | ONNX fp16 | 2,0 GB | 3,5 GB | 4,47 % | CC BY 4.0 |
| istupakov/canary-1b-v2-onnx | ~1B (mismo modelo base) | no disponible | ONNX fp32 | 4,0 GB | 7,0 GB | 4,49 % | CC BY 4.0 |
| nvidia/canary-1b-v2 | ~1B | no disponible | NeMo (PyTorch) | no disponible | no disponible | no disponible en esta información | CC BY 4.0 |

No se dispone en la información proporcionada de datos de otros modelos ASR comparables (por ejemplo, alternativas de la familia Whisper u otros modelos multilingües) que permitan una comparación de rendimiento verificable, por lo que se omite cualquier cifra al respecto.

## Limitaciones y advertencias

- La cobertura lingüística se limita a 25 idiomas europeos; no se ha validado en la información disponible el rendimiento en el resto de idiomas ni en variedades dialectales.
- La conversión a float16 introduce riesgos numéricos: float16 solo representa enteros exactos hasta 2048 y 38 s de audio generan 3.800 frames, por lo que el script mantiene en float32 los cálculos de longitudes del encoder. Cualquier modificación manual del grafo puede romper esta salvaguarda.
- Las diferencias de salida frente a float32 son mínimas pero existen (3 clips de 289 y 3 palabras de 6.590 en la evaluación publicada), con casos de normalización de diacríticos.
- El modelo está pensado para GPUs NVIDIA con CUDA; no se documenta su funcionamiento en CPU, ROCm ni otros aceleradores.
- No se detalla en la información disponible el dataset de entrenamiento del modelo base, por lo que no se pueden enumerar sesgos concretos de dominio, acento o género; como todo sistema ASR, es previsible un deterioro del WER con ruido de fondo, solapamiento de hablantes o audio de baja calidad.
- Riesgo de alucinación y de transcripciones inventadas en segmentos con silencio, ruido o música: es un comportamiento habitual en modelos encoder-decoder de ASR, aunque no se cuantifica en la documentación disponible.
- La licencia CC BY 4.0 permite uso comercial, pero exige atribución a NVIDIA (modelo), a istupakov (export ONNX) y a la conversión float16 para Voqify. Conviene revisar también las condiciones del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado en octubre de 2026, por lo que no cuenta con validación comunitaria amplia.
- No se publican mediciones de latencia ni de WER en hardware distinto de la RTX 5090.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/romaindurif/canary-1b-v2-onnx-fp16
- Modelo base: https://huggingface.co/nvidia/canary-1b-v2
- Export ONNX en float32: https://huggingface.co/istupakov/canary-1b-v2-onnx
- Librería onnx-asr: https://github.com/istupakov/onnx-asr
- Script de conversión: https://huggingface.co/romaindurif/canary-1b-v2-onnx-fp16/blob/main/to_fp16.py
- Voqify (aplicación de dictado local): https://voqify.com
