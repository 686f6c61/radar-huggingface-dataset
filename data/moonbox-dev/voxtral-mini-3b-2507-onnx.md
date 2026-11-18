# moonbox-dev/Voxtral-Mini-3B-2507-ONNX

## Resumen

Voxtral Mini 3B 2507 ONNX es una conversión a formato ONNX del modelo de reconocimiento automático del habla Voxtral Mini 3B, desarrollado originalmente por Mistral AI y empaquetado por moonbox-dev para su ejecución con ONNX Runtime en CPU, CUDA y DirectML. El objetivo es habilitar la inferencia on-device de un modelo ASR multilingüe de 3B parámetros sin depender del stack de PyTorch, manteniendo una calidad de transcripción prácticamente idéntica a la del modelo original.

El repositorio incluye tres precisiones (fp16, int8 e int4), cada una en su propia carpeta con los grafos ONNX (audio_encoder, decoder, embed), los filtros mel, el tokenizador Tekken y un pipeline en Python que gestiona la extracción de características, la construcción del prompt y el bucle de decodificación. El tamaño total del repositorio es de 16,8 GB.

La relevancia actual radica en la creciente demanda de transcripción local y privada en dispositivos sin GPU dedicada, y en la posibilidad de integrar ASR de calidad en aplicaciones de escritorio, móviles o edge mediante ONNX Runtime GenAI. La licencia Apache 2.0 del modelo base facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para ASR (audio encoder + decoder autorregresivo), exportado a grafos ONNX |
| Parametros totales | 3B (heredados del modelo base Voxtral Mini 3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16, int8, int4 |
| Idiomas soportados | multilingue (segun tags del modelo base); lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (audio_encoder.onnx, decoder.onnx, embed.onnx, decoder.onnx.data) |

## Arquitectura y entrenamiento

El modelo subyacente es Voxtral Mini 3B 2507 de Mistral AI, un sistema ASR basado en un encoder de audio que transforma la señal en representaciones latentes y un decoder autorregresivo de 3B parámetros que genera la transcripción token a token. La conversión a ONNX separa el grafo en tres componentes: `audio_encoder.onnx` (1,32 GB en fp16), `embed.onnx` (805,3 MB en fp16) y `decoder.onnx` con sus pesos en `decoder.onnx.data` (7,26 GB en fp16). El pipeline en Python (`pipeline.py`, 4,1 kB) implementa la extracción de features mel, la construcción del prompt y el bucle de decodificación sobre ONNX Runtime.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original dentro de la información proporcionada. La innovación técnica destacable de esta conversión es la preservación de la calidad del modelo PyTorch original: en fp16 el WER es de 1,73 % frente al 1,77 % del original en bf16 sobre el conjunto de benchmark de Moonbox, con 378 de 400 transcripciones idénticas. En int8 el WER sube a 1,74 % y en int4 a 1,78 %, manteniendo una degradación muy contenida.

## Capacidades

- Reconocimiento automático del habla (ASR) multilingüe, con soporte para inglés y chino verificado en el benchmark (LibriSpeech test-clean y AISHELL-1).
- Transcripción de audio a texto con calidad cercana al modelo PyTorch original (WER 1,73 % en fp16).
- Ejecución on-device mediante ONNX Runtime en CPU, CUDA y DirectML.
- Tres niveles de precisión (fp16, int8, int4) para adaptar el consumo de memoria y el rendimiento al hardware disponible.
- Pipeline autocontenido en Python que gestiona features, prompt y decodificación sin dependencias de PyTorch.
- No se dispone de información sobre soporte de tool calling, agentes, visión, audio adicional o modo thinking en la información proporcionada.

## Casos de uso

- Transcripción local de reuniones y notas de voz: el pipeline ONNX permite procesar audio en el dispositivo sin enviar datos a la nube, adecuado para entornos con requisitos de privacidad. La precisión int4 (WER 1,78 %) es suficiente para dictado y actas.
- Subtitulado automático en aplicaciones de escritorio: la build fp16 con RTF 0,12 en CUDA permite generar subtítulos en tiempo real o casi real sobre GPU consumer, integrándose en reproductores o editores de vídeo.
- Asistentes de voz embebidos en dispositivos edge: la build int4 (434,6 MB el encoder, 3,87 GB el decoder en int8) reduce el footprint para ejecutarse en CPU con RTF 2,7, viable para transcripción diferida en hardware modesto.
- Procesamiento por lotes de archivos de audio en servidores sin GPU: ONNX Runtime en CPU permite desplegar el modelo en contenedores sin CUDA, útil para pipelines de ingesta de llamadas o podcasts.
- Aplicaciones de accesibilidad: transcripción en vivo de conversaciones para personas con discapacidad auditiva en aplicaciones de escritorio Windows mediante DirectML.
- Integración en pipelines de datos con ONNX Runtime GenAI: el formato ONNX facilita el despliegue en entornos .NET, C++ o Java sin depender del ecosistema Python/PyTorch, útil en empresas con stacks no-Python.

## Benchmarks y rendimiento

Los datos provienen del conjunto de benchmark de Moonbox: 400 utterances de LibriSpeech test-clean (40 hablantes) y 200 utterances de AISHELL-1 para modelos que soportan chino.

| Precision | WER | Transcripciones identicas al original | RTF (CUDA) | RTF (CPU) |
|---|---|---|---|---|
| fp16 | 1,73 % (original bf16: 1,77 %) | 378/400 | 0,12 | no disponible |
| int8 | 1,74 % | 367/400 | 0,10 | no disponible |
| int4 | 1,78 % | 297/400 | 0,098 | 2,7 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo ASR y no de un LLM de propósito general.

## Requisitos de hardware

- VRAM estimada para fp16: aproximadamente 9,4 GB solo para pesos (encoder 1,32 GB + embed 805 MB + decoder 7,26 GB), más overhead de activaciones y KV cache; se recomienda GPU con 12-16 GB.
- VRAM estimada para int8: aproximadamente 4,9 GB de pesos (encoder 671,6 MB + embed 402,9 MB + decoder 3,87 GB); cabe en GPU de 8 GB.
- VRAM estimada para int4: aproximadamente 3,2 GB de pesos (encoder 434,6 MB + embed + decoder cuantizado); viable en GPU de 6 GB o en CPU.
- GPU recomendadas: A100 o H100 para máximo throughput en fp16; RTX 4090 o RTX 3090 para fp16 en consumer; RTX 4060 Ti 16 GB o RTX 4070 para int8; GPUs de 6-8 GB para int4.
- Ejecución en CPU: la build int4 reporta RTF 2,7 en CPU, es decir, aproximadamente 2,7 segundos de cómputo por segundo de audio; viable para transcripción diferida pero no para tiempo real.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML) y ONNX Runtime GenAI; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican directamente a este formato.
- Latencia y throughput: RTF 0,12 en fp16 con CUDA (unas 8 veces más rápido que tiempo real), RTF 0,10 en int8 y RTF 0,098 en int4 sobre GPU; en CPU int4, RTF 2,7.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (LibriSpeech test-clean) | Licencia | Formato |
|---|---|---|---|---|---|
| Voxtral Mini 3B 2507 ONNX (este) | 3B | no disponible | 1,73 % (fp16) | Apache 2.0 | ONNX |
| Voxtral Mini 3B 2507 (original Mistral) | 3B | no disponible | 1,77 % (bf16) | Apache 2.0 | safetensors |
| Whisper large-v3 | 1,55B | 30 s de audio | no disponible en la informacion | MIT | safetensors, GGUF, etc. |
| Whisper small | 244M | 30 s de audio | no disponible en la informacion | MIT | safetensors, GGUF, etc. |

La comparación con Whisper se ofrece como referencia de categoría (ASR multilingüe open source), pero no se dispone de cifras de WER comparables en la información proporcionada para establecer una comparación numérica rigurosa.

## Limitaciones y advertencias

- El benchmark de calidad se limita a LibriSpeech test-clean (inglés, lectura limpia) y AISHELL-1 (chino); el rendimiento en audio ruidoso, acentos no nativos, conversación espontánea o dominio técnico no está documentado.
- La build int4 pierde fidelidad frente al original: solo 297 de 400 transcripciones idénticas y 0,48 % leídas de forma distinta, lo que puede acumular errores en textos largos.
- La lista concreta de idiomas soportados no está disponible; los tags indican "multilingual" pero solo se verifica inglés y chino en el benchmark.
- No se documentan sesgos conocidos del modelo base ni tasas de alucinación en ASR (inserción de texto no presente en el audio).
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base de Mistral AI y de los datasets de entrenamiento originales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de los resultados reportados.
- La ejecución en CPU con int4 (RTF 2,7) no es apta para transcripción en tiempo real.
- No se dispone de información sobre la longitud máxima de audio procesable por el pipeline.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/Voxtral-Mini-3B-2507-ONNX
- Modelo base: https://huggingface.co/mistralai/Voxtral-Mini-3B-2507
- Paper de referencia (arXiv:2507.13264): https://arxiv.org/abs/2507.13264
- ONNX Runtime: https://onnxruntime.ai/
- ONNX Runtime GenAI: https://github.com/microsoft/onnxruntime-genai
