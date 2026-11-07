# lazarenkod/promises-asr-ru-coreml

## Resumen

Promises ASR RU Core ML es un modelo de reconocimiento automático del habla (ASR) para ruso, publicado por el desarrollador independiente Dmitry Lazarenko (usuario `lazarenkod` en Hugging Face) como un fine-tune de `ai-sage/GigaAM-v3` de Sber, en su revisión `e2e_ctc`. El modelo parte de un Conformer con cabeza CTC que genera texto ruso normalizado y puntuado, y se ha convertido al formato Core ML (`GigaAM.mlmodelc`, pesos fp16 con front end en fp32) para su integración en la aplicación Promises. El vocabulario es el original de 256 piezas.

El fine-tune se centra en un problema muy concreto: eliminar la escritura de sonidos de relleno ("э-э", "м-м") que el modelo original transcribía, reduciéndolos de 22,7 a 0,9 por cada 1000 palabras, manteniendo la precisión en ruso dentro del margen de ruido estadístico respecto al original. El repositorio ocupa 0,4 GB y está pensado para inferencia en dispositivos Apple mediante Core ML, con un rendimiento declarado de unos 424 MB de pesos y 2400 segundos de audio procesados en 9 segundos sobre un M4 Pro usando CPU y GPU.

Es relevante para desarrolladores que necesiten ASR en ruso embebido en aplicaciones macOS/iOS con Core ML, y como ejemplo de fine-tune con regularización WiSE-FT para corregir comportamientos específicos sin degradar el rendimiento general. La licencia es MIT, igual que la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer con cabeza CTC (fine-tune de GigaAM-v3, revision `e2e_ctc`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de audio de 5, 10 o 20 s (80000, 160000 o 320000 muestras a 16 kHz) |
| Tipos de cuantizacion | fp16 (pesos del modelo Core ML); front end en fp32 |
| Idiomas soportados | ruso (`ru`) |
| Licencia | MIT (se conserva la linea de copyright de GigaChat Team) |
| Formato de pesos | Core ML (`GigaAM.mlmodelc`); constantes en `gigaam.json` y vocabulario en `tokens.txt` |

## Arquitectura y entrenamiento

El modelo es un Conformer con cabeza CTC, heredado de GigaAM-v3 (`e2e_ctc`), que produce directamente texto ruso con puntuación y normalización, sin etapa separada de puntuación. La conversión a Core ML mantiene el front end en fp32 y los pesos en fp16; según el autor, la versión fp32 reproduce los mismos ids greedy que el modelo PyTorch fine-tuneado en 18 clips, con una diferencia máxima de log-probabilidad de 9,4e-4.

El fine-tune se realizó durante 3000 pasos con pérdida CTC por token más un término KL hacia el modelo original sobre datos ancla en ruso, con SpecAugment, ruido y respuestas de sala. Posteriormente se aplicó WiSE-FT con alpha 0,72, desplazando los pesos un 72 % desde el original hacia los fine-tuneados para recuperar parte del rendimiento en habla leída. Los datos incluyen Common Voice ru (CC0), FLEURS ru (CC-BY 4.0), Russian LibriSpeech (CC-BY 4.0, solo clips que el modelo original lee con menos del 5 % de error de palabra frente al texto del libro) y 8,2 horas (3227 clips) de grabaciones propias del autor con pseudo-etiquetas sin sonidos de relleno. Las grabaciones no se publican y contienen voces de terceros.

## Capacidades

- Reconocimiento de voz en ruso con salida de texto puntuado y normalizado (mayúsculas, puntuación) directamente desde la cabeza CTC.
- Supresión de sonidos de relleno ("э-э", "м-м") en la transcripción, con una tasa de 0,9 por 1000 palabras frente a 22,7 del original.
- Procesamiento de clips de 5, 10 o 20 segundos, con relleno de ceros hasta la longitud fija y máscara de longitud real.
- Decodificación CTC greedy o beam search.
- Reconocimiento de nombres propios rusos sin lista de palabras: recall de 0,624 sobre 81 nombres con habla sintética.
- Ejecución en dispositivos Apple mediante Core ML, con soporte de CPU y GPU (Metal).
- No soporta tool calling, agentes, visión, audio de entrada más allá de la transcripción ni capacidades multilingües: solo ruso.

## Casos de uso

- Transcripción de llamadas y reuniones en ruso dentro de una app macOS/iOS: el modelo procesa clips de 5 a 20 segundos y genera texto puntuado, adecuado para diarización posterior o resúmenes.
- Subtitulado y notas de voz en aplicaciones nativas Apple: la conversión a Core ML permite inferencia local sin enviar audio a servidores, con unos 110 MB de memoria y 81x tiempo real en CPU sola.
- Dictado por voz en ruso: la supresión de muletillas mejora la legibilidad del texto dictado y reduce la limpieza posterior.
- Procesamiento por lotes de archivos de audio rusos: 2400 segundos de audio en 9 segundos sobre un M4 Pro (CPU+GPU) permite transcribir corpus grandes en estaciones de trabajo Apple.
- Transcripción de audiolibros y habla leída: el fine-tune conserva el rendimiento del original en Russian LibriSpeech (6,37 % WER frente a 6,20 %) y Common Voice (2,73 % frente a 2,57 %).
- Investigación en ASR: sirve como referencia de fine-tune con WiSE-FT y destilación KL para corregir comportamientos concretos sin degradar el modelo base, con métricas reproducibles sobre FLEURS, Common Voice y Russian LibriSpeech.

## Benchmarks y rendimiento

Resultados declarados por el autor (06.11.2026), decodificación greedy, tasa de error de palabra en porcentaje:

| Conjunto | Original | Este modelo |
|---|---|---|
| FLEURS-ru test, 120 clips (PyTorch) | 4,25 | 4,58 |
| FLEURS-ru test, Core ML fp16 | 4,37 | 4,66 |
| Russian LibriSpeech test, 300 clips | 6,20 | 6,37 |
| Common Voice ru test, 300 clips | 2,57 | 2,73 |
| Sonidos de relleno por 1000 palabras, 8 grabaciones de 300 s | 22,7 | 0,9 |
| Recall de 81 nombres rusos (habla sintética, sin lista) | 0,605 | 0,624 |

El autor indica que las diferencias de 0,1-0,3 puntos en conjuntos de 120-300 clips están dentro del ruido estadístico. No se midieron términos en inglés, hablantes o salas fuera de los datos descritos, ni evaluación perceptual.

## Requisitos de hardware

- VRAM/memoria: aproximadamente 424 MB de pesos; unos 110 MB de memoria en inferencia solo con CPU.
- GPU recomendadas: no se especifican modelos concretos; el autor reporta 2400 s de audio en 9 s sobre un M4 Pro usando CPU y GPU.
- En GPU de consumo: el modelo está empaquetado para Core ML, por lo que el despliegue natural es en hardware Apple (Apple Silicon y GPU integradas compatibles con Core ML); no se documenta despliegue en GPU NVIDIA.
- Opciones de despliegue: Core ML (formato nativo del repositorio); no se proporcionan pesos PyTorch, GGUF ni safetensors en este repositorio, por lo que vLLM, llama.cpp, Ollama o TGI no son aplicables directamente.
- Latencia y throughput: 81x tiempo real en CPU sola y 2400 s de audio en 9 s en M4 Pro con CPU+GPU (aproximadamente 267x tiempo real).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | WER ruso (referencia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Promises ASR RU Core ML (este) | no disponible | clips de 5/10/20 s | 4,66 % FLEURS-ru (Core ML fp16), 2,73 % Common Voice | MIT | Core ML en Hugging Face |
| ai-sage/GigaAM-v3 (`e2e_ctc`) | no disponible | clips de 5/10/20 s | 4,37 % FLEURS-ru (Core ML fp16), 2,57 % Common Voice | MIT | Hugging Face (formato original) |
| Whisper large-v3 (OpenAI) | 1550 M | 30 s | no disponible en la informacion proporcionada | MIT | multiplataforma (incluye GGUF, CTranslate2) |
| Vosk ru (modelos pequeños) | no disponible | variable | no disponible en la informacion proporcionada | Apache 2.0 (segun modelo) | Kaldi/ONNX |

La comparación con Whisper y Vosk se ofrece solo como referencia de categoria; no se dispone de cifras de WER en ruso para esos modelos en la informacion proporcionada, por lo que no deben interpretarse como equivalentes.

## Limitaciones y advertencias

- Solo reconoce ruso; no mejora la transcripcion de terminos en ingles respecto al modelo original y no se midio su comportamiento en ese caso.
- Riesgo de alucinacion y de errores en nombres propios: el recall de nombres es de 0,624, insuficiente para dominios con entidades críticas sin postprocesado o lista de palabras.
- El fine-tune se evaluo en conjuntos pequenos (120-300 clips); las diferencias frente al original estan dentro del ruido y no hay garantia de mejora en hablantes o salas no representados.
- Parte de los datos de entrenamiento son grabaciones privadas del autor (8,2 h, 3227 clips) con voces de terceros no publicadas; las comprobaciones de fuga de datos realizadas (56 clips retenidos, 285 ventanas no vistas) tienen poca potencia estadistica y no cubren ataques de extraccion ni fuga de hablante.
- La licencia MIT permite uso comercial, pero se conserva la linea de copyright de GigaChat Team; conviene revisar las condiciones del modelo base GigaAM-v3 y de los corpus empleados (CC0, CC-BY 4.0) si se redistribuye.
- El formato Core ML limita el despliegue a hardware y sistemas Apple; no hay pesos en safetensors, GGUF ni ONNX en este repositorio.
- La entrada esta restringida a clips de 5, 10 o 20 segundos con relleno de ceros; audios mas largos requieren segmentacion externa.
- No se midio el rendimiento por escucha humana ni en condiciones de ruido fuera de las descritas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lazarenkod/promises-asr-ru-coreml
- Perfil del autor: https://huggingface.co/lazarenkod
- Modelo base GigaAM-v3: https://huggingface.co/ai-sage/GigaAM-v3
- Documentacion de Core ML: https://developer.apple.com/documentation/coreml
