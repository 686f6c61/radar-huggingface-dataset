# alefiury/parakeet-tdt-0.6b-v3-ptBR-TAGARELA-onnx

## Resumen
Parakeet TDT 0.6B V3 pt-BR TAGARELA (ONNX) es una conversión a formato ONNX del modelo de reconocimiento automático del habla (ASR) Parakeet TDT 0.6B V3 de NVIDIA, adaptado al portugués de Brasil mediante ajuste fino sobre el conjunto de datos TAGARELA. Lo publica el usuario alefiury en Hugging Face y está pensado para usarse de forma nativa con la librería onnx-asr, lo que permite inferencia rápida en CPU sin depender del stack de PyTorch/NeMo.

El modelo parte de la arquitectura NeMo Conformer con decodificación TDT (Token-and-Duration Transducer) de NVIDIA, que cubre 25 lenguas europeas en su versión original. Esta variante hereda esa base pero ha sido especializada en pt-BR, de modo que su rendimiento en otras lenguas no está garantizado. El repositorio incluye pesos en fp32 (~2,5 GB) y versiones cuantizadas a int8 (~0,67 GB), lo que reduce el peso unas cuatro veces y acelera la inferencia en CPU a costa de una pequeña pérdida de precisión.

Su relevancia actual reside en que ofrece un ASR de calidad competitiva para portugués brasileño en un paquete ONNX ligero, desplegable en entornos sin GPU y con una integración muy sencilla mediante onnx-asr. La licencia CC-BY-4.0 facilita su uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | 0,6 mil millones (600M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 e int8 (cuantizacion dinamica de onnxruntime, pesos QUInt8 por canal) |
| Idiomas soportados | Portugues (pt), especialmente pt-BR |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (encoder-model.onnx, decoder_joint-model.onnx, nemo128.onnx, vocab.txt) |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura NeMo Conformer de NVIDIA con decodificador TDT, un esquema transducer que predice conjuntamente tokens y duraciones, lo que permite transcripciones alineadas de forma eficiente sin necesidad de un modelo de lenguaje externo. La versión original de NVIDIA es multilingüe (25 lenguas europeas); esta variante deriva de un ajuste fino al portugués realizado por Alexandre Costa Ferro Filho sobre el conjunto TAGARELA, un corpus de habla portuguesa a gran escala derivado de pódcasts.

La conversión a ONNX la firma alefiury y está orientada a la librería onnx-asr. El repositorio incluye tanto los pesos fp32 como versiones int8 generadas con `quantize_dynamic` de onnxruntime. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset TAGARELA ni si se aplicaron técnicas de RLHF o DPO (poco habituales en ASR). Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades
- Reconocimiento automático del habla (ASR) para portugués, con especial énfasis en pt-BR.
- Transcripción de audio en formato WAV mediante la API `recognize` de onnx-asr.
- Inferencia en CPU gracias al formato ONNX y a las versiones cuantizadas int8.
- Selección de idioma en la llamada de reconocimiento (`language="pt"`).
- Compatibilidad con el ecosistema Hugging Face Hub para descarga directa de pesos.
- Soporte de cuantización int8 para despliegues con recursos limitados.
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento (no aplicables a un modelo ASR).

## Casos de uso
- Transcripción de pódcasts en portugués brasileño: el ajuste sobre TAGARELA, corpus derivado de pódcasts, lo hace especialmente adecuado para este dominio y para audio espontáneo con solapamientos y ruido moderado.
- Subtitulado automático de vídeo en pt-BR: puede integrarse en pipelines de postproducción para generar subtítulos a partir de pistas de audio, con la ventaja de ejecutarse en CPU y abaratar costes frente a soluciones basadas en GPU.
- Actas y notas de reuniones: la transcripción de habla espontánea (donde el modelo obtiene WER medio de 0,143 en los conjuntos evaluados) lo hace útil para diarización posterior y resúmenes de reuniones en empresas brasileñas.
- Atención al cliente y centros de contacto: transcripción de llamadas grabadas para análisis de calidad, búsqueda de palabras clave y cumplimiento normativo, desplegable en servidores sin GPU.
- Archivística y digitalización de audio histórico: transcripción de grabaciones de entrevistas o radio (conjuntos como NURC o C-ORAL Brasil) para indexación y búsqueda textual.
- Aplicaciones móviles o de escritorio offline: gracias a los ~0,67 GB del modelo int8, puede embeberse en entornos con recursos limitados para dictado o comandos de voz en pt-BR.
- Investigación en ASR para portugués: sirve como línea base reproducible en ONNX para comparar con Whisper, Canary o Qwen3ASR en condiciones controladas.

## Benchmarks y rendimiento
Los resultados publicados en la model card corresponden al modelo fp32 y se expresan como WER (menor es mejor).

Habla preparada:

| Modelo | CETUC | Common Voice 21.0 | MLS (Portuguese) | MTEDx (Portuguese) | Media preparada |
|---|---:|---:|---:|---:|---:|
| Parakeet TDT V3 0.6B - ONNX (TAGARELA) | 0,006 | 0,051 | 0,108 | 0,133 | 0,075 |
| Parakeet TDT V3 0.6B | 0,027 | 0,081 | 0,064 | 0,186 | 0,090 |
| Qwen3ASR 1.7B | 0,028 | 0,068 | 0,077 | 0,157 | 0,083 |
| Whisper large-v3 | 0,021 | 0,065 | 0,073 | 0,176 | 0,084 |
| Voxtral-Small 24B | 0,019 | 0,055 | 0,054 | 0,168 | 0,074 |
| Canary V2 1B | 0,036 | 0,120 | 0,078 | 0,178 | 0,103 |
| Distil-Whisper large-v3 PT-BR | 0,030 | 0,094 | 0,092 | 0,168 | 0,096 |
| ElevenLabs Scribe v2 | 0,018 | 0,047 | 0,038 | 0,138 | 0,060 |

Habla espontánea:

| Modelo | ALIP | C-ORAL Brasil I | NURC-Recife | SP2010 | NURC-SP | MuPe | Dataset privado | Media espontánea |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Parakeet TDT V3 0.6B - ONNX (TAGARELA) | 0,213 | 0,137 | 0,138 | 0,104 | 0,160 | 0,120 | 0,127 | 0,143 |
| Parakeet TDT V3 0.6B | 0,316 | 0,213 | 0,269 | 0,180 | 0,202 | 0,176 | 0,173 | 0,218 |
| Qwen3ASR 1.7B | 0,316 | 0,222 | 0,255 | 0,191 | 0,202 | 0,187 | 0,147 | 0,217 |
| Whisper large-v3 | 0,345 | 0,220 | 0,290 | 0,236 | 0,218 | 0,177 | 0,150 | 0,234 |
| Voxtral-Small 24B | 0,396 | 0,227 | 0,298 | 0,196 | 0,216 | 0,179 | 0,143 | 0,236 |
| Canary V2 1B | 0,415 | 0,290 | 0,366 | 0,273 | 0,247 | 0,229 | 0,174 | 0,285 |
| Distil-Whisper large-v3 PT-BR | 0,374 | 0,242 | 0,297 | 0,226 | 0,226 | 0,193 | 0,154 | 0,245 |
| ElevenLabs Scribe v2 | 0,329 | 0,170 | 0,307 | 0,155 | 0,207 | 0,205 | 0,121 | 0,213 |

## Requisitos de hardware
- VRAM estimada: no requiere GPU; el modelo está pensado para inferencia en CPU con onnxruntime.
- Tamaño en disco: ~2,5 GB en fp32 y ~0,67 GB en int8.
- GPU recomendadas: no se especifican; cualquier GPU compatible con onnxruntime (CUDA o ROCm) podría ejecutarlo, pero la model card está orientada a CPU.
- Cabe en cualquier equipo de consumo: con int8 el modelo ocupa menos de 1 GB y puede ejecutarse en portátiles y dispositivos de gama baja.
- Opciones de despliegue: onnx-asr (recomendado), onnxruntime directamente; no se mencionan integraciones con vLLM, TGI o llama.cpp (no aplicables a este formato).
- Latencia y throughput: no se publican cifras concretas; la model card indica que int8 es aproximadamente 4 veces más pequeño y más rápido en CPU que fp32, con una pequeña pérdida de precisión.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Media WER preparada | Media WER espontanea | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| Parakeet TDT V3 0.6B ONNX (TAGARELA) | 0,6B | pt (pt-BR) | 0,075 | 0,143 | cc-by-4.0 | ONNX |
| Parakeet TDT V3 0.6B (original) | 0,6B | 25 lenguas europeas | 0,090 | 0,218 | no disponible en la informacion | NeMo/PyTorch |
| Whisper large-v3 | no disponible | multilingue | 0,084 | 0,234 | no disponible en la informacion | PyTorch/GGUF/ONNX |
| Qwen3ASR 1.7B | 1,7B | multilingue | 0,083 | 0,217 | no disponible en la informacion | no disponible |
| Canary V2 1B | 1B | multilingue | 0,103 | 0,285 | no disponible en la informacion | no disponible |
| Voxtral-Small 24B | 24B | multilingue | 0,074 | 0,236 | no disponible en la informacion | no disponible |

## Limitaciones y advertencias
- Especializado en portugués (pt-BR): el rendimiento en otras lenguas no está garantizado y puede degradarse respecto al modelo multilingüe original de NVIDIA.
- Riesgo de alucinación y errores en audio con ruido, solapamiento de hablantes o acentos no representados en TAGARELA; los WER en habla espontánea (media 0,143) son notablemente superiores a los de habla preparada (0,075).
- Los benchmarks publicados corresponden a fp32; la versión int8 introduce una pérdida de precisión no cuantificada en la model card.
- No se documentan sesgos específicos, pero al derivar de un corpus de pódcasts puede reflejar la distribución demográfica y dialectal de dicha fuente.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar autoría y respetar los términos de la licencia.
- La model card está incompleta (el apartado de antecedentes de entrenamiento queda truncado), por lo que faltan detalles sobre el proceso de ajuste fino y la composición exacta de TAGARELA.
- Dependencia de la librería onnx-asr para el uso previsto; otras rutas de despliegue requerirían trabajo adicional de integración.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/alefiury/parakeet-tdt-0.6b-v3-ptBR-TAGARELA-onnx
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Checkpoint pt-BR de Alexandre Costa Ferro Filho: https://huggingface.co/alexandreacff/parakeet-tdt-0.6b-v3-ptBR-plus
- Dataset TAGARELA: https://huggingface.co/datasets/freds0/TAGARELA
- Librería onnx-asr: https://github.com/istupakov/onnx-asr
- Paper referenciado (arXiv:2603.15326): https://arxiv.org/abs/2603.15326
