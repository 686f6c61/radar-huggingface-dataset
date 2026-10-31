# Ciwiruk/FireRedASR2-AED-onnx

## Resumen

FireRedASR2-AED-onnx es una exportacion a formato ONNX (fp32) del modelo de reconocimiento automatico del habla FireRedASR2-AED, desarrollado por FireRedTeam (Xiaohongshu). Se trata de un reconocedor de voz con arquitectura encoder-decoder basada en atencion, disenado principalmente para mandarin, ingles y dialectos chinos, con una cabeza CTC adicional y un total de 1,15 mil millones de parametros. La conversion a ONNX ha sido realizada por el usuario Ciwiruk sin reentrenamiento, de modo que los pesos permanecen identicos al checkpoint original de PyTorch.

La relevancia de esta version radica en la portabilidad: ONNX permite ejecutar el modelo fuera del ecosistema PyTorch, en runtimes como onnxruntime, sherpa-onnx o aplicaciones nativas, lo que facilita su despliegue en produccion con menor sobrecarga de dependencias. El repositorio incluye tres grafos separados (encoder, CTC y decoder), un diccionario de 8667 tokens, un modelo SentencePiece para piezas de palabras inglesas y estadisticas CMVN de Kaldi. La exportacion ha sido verificada numericamente contra PyTorch, con diferencias maximas del orden de 1e-4 a 1e-5 y decodificacion greedy identica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Conformer + decoder Transformer + cabeza CTC (AED) |
| Parametros totales | 1,15 mil millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Hasta 5000 frames de salida (200 segundos de audio, por la tabla de posiciones relativas) |
| Tipos de cuantizacion | fp32 (sin cuantizar) |
| Idiomas soportados | Mandarin (zh), ingles (en) y dialectos chinos |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (fp32), con pesos en archivos `.data` separados |

## Arquitectura y entrenamiento

El modelo sigue un diseno AED (Attention Encoder-Decoder): un encoder Conformer que procesa caracteristicas fbank de Kaldi (80 bins mel, ventana de 25 ms, desplazamiento de 10 ms, muestreo a 16 kHz) con subsampling de 4x (un frame de salida cada 40 ms), y un decoder Transformer autorregresivo de 16 capas con caches por capa, que genera tokens de a uno por paso. Ademas incorpora una cabeza CTC sobre la salida del encoder (dimension 1280) que produce log-probabilidades sobre un vocabulario de 8667 tokens, util para decodificacion hibrida o alineacion.

Los tokens del vocabulario son caracteres chinos individuales y piezas SentencePiece para palabras inglesas. El decodificador de referencia usa beam search con beam size 3, suavizado softmax de 1,25 y penalizacion de longitud 0,6. Sobre el entrenamiento del modelo original (numero de tokens, composicion del dataset, RLHF/DPO), la informacion disponible no lo detalla; el paper de referencia es arXiv 2603.10420. La exportacion a ONNX no altero los pesos: se realizo una conversion directa desde el checkpoint de PyTorch, verificada con diferencias absolutas maximas de 1,51e-05 en la salida del encoder, 2,44e-04 en las log-probabilidades CTC y 3,67e-05 en los logits del decoder.

## Capacidades

- Reconocimiento automatico del habla (ASR) en mandarin, ingles y dialectos chinos.
- Transcripcion de audio de hasta 200 segundos por pasada gracias a la tabla de posiciones relativas (5000 frames de salida).
- Decodificacion CTC sobre el encoder (log-probabilidades con blank en id 0), ademas de decodificacion AED autorregresiva.
- Beam search configurable (beam 3, length penalty 0,6) y decodificacion greedy verificada como identica a PyTorch.
- Tokenizacion hibrida: caracteres chinos unitarios y SentencePiece para ingles, lo que permite transcribir codigo mixto chino-ingles.
- No soporta tool calling, agentes, vision ni audio de salida: es un modelo exclusivamente de ASR.

## Casos de uso

- Transcripcion de reuniones y llamadas en chino e ingles: la ventana de 200 segundos por pasada permite procesar segmentos largos de audio sin fragmentacion excesiva, y la decodificacion por caracteres chinos evita errores de segmentacion de palabras.
- Subtitulado automatico de video: el pipeline de features fbank a 16 kHz es estandar en medios, y la salida token a token con `<eos>` facilita alinear la transcripcion con pistas temporales.
- Despliegue en produccion sin PyTorch: al estar en ONNX, puede integrarse en servicios escritos en C++, Rust o Java mediante onnxruntime, reduciendo el tamano del contenedor y las dependencias.
- Aplicaciones moviles o de escritorio: los tres grafos separados permiten cargar solo el encoder o solo el decoder segun la fase del pipeline, optimizando memoria en dispositivos con recursos limitados.
- Sistemas de voz mixtos chino-ingles (code-switching): el vocabulario hibrido de caracteres chinos y piezas SentencePiece inglesas esta disenado para transcribir conversaciones que alternan ambos idiomas.
- Verificacion y descarga segura de pesos: el archivo `manifest.json` incluye URL, tamano y SHA-256 de cada archivo, lo que permite verificar integridad en pipelines de despliegue automatizados.
- Investigacion en ASR: la cabeza CTC y el decoder AED separados permiten experimentar con estrategias de decodificacion hibrida CTC/AED o destilacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper de referencia (arXiv 2603.10420) puede contener resultados de WER/CER del modelo original, pero no se incluyen datos numericos en la model card de esta exportacion.

## Requisitos de hardware

- Los pesos fp32 ocupan unos 4,5 GB en total (repositorio de 4,7 GB); ejecutar el encoder requiere mas de 3 GB de memoria y el decoder aproximadamente lo mismo.
- Al ser fp32 y no requerir aceleradores especificamente, puede ejecutarse en CPU con al menos 8 GB de RAM; una GPU no es imprescindible, aunque acelera la inferencia.
- Cabe en GPUs de consumo modestas (por ejemplo, una RTX 3060 de 12 GB o superior) sin necesidad de cuantizacion, dado el footprint de ~3 GB por grafo.
- La decodificacion es autorregresiva: cada token generado exige una pasada completa por los pesos del decoder (16 capas con caches), por lo que la latencia crece linealmente con la longitud de la transcripcion.
- Opciones de despliegue: onnxruntime (Python, C++, C#, Java), sherpa-onnx y runtimes ONNX compatibles; al no ser un modelo LLM generico, no aplica vLLM, TGI, llama.cpp ni Ollama de forma directa.
- No hay mediciones publicas de latencia o throughput para esta exportacion.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| FireRedASR2-AED (original) | 1,15 B | Conformer encoder + Transformer decoder + CTC | zh, en | Apache 2.0 | PyTorch |
| FireRedASR2-AED-onnx (esta ficha) | 1,15 B | Identica, exportada a ONNX | zh, en | Apache 2.0 | ONNX fp32 |
| Whisper-large-v3 (OpenAI) | ~1,55 B | Encoder-decoder Transformer | Multilingue (~99 idiomas) | MIT | PyTorch / GGUF / ONNX (comunidad) |
| Paraformer-large (Alibaba, FunASR) | ~0,22 B | Conformer + predictor no autorregresivo | zh, en | Licencia propia de ModelScope | PyTorch / ONNX |

FireRedASR2-AED se posiciona frente a Whisper-large-v3 con un tamano similar pero foco en mandarin y dialectos chinos, donde la tokenizacion por caracteres suele dar mejores resultados en codigo mixto chino-ingles. Frente a Paraformer, es mas grande y autorregresivo (mas lento por token), pero la exportacion ONNX verificada numericamente facilita su adopcion en entornos sin PyTorch.

## Limitaciones y advertencias

- El vocabulario esta limitado a 8667 tokens (caracteres chinos y piezas inglesas): idiomas distintos del mandarin y el ingles no estan soportados, y el castellano no figura entre los idiomas del modelo.
- La longitud maxima de audio es de 200 segundos por pasada (tabla de posiciones relativas de 5000 frames); audios mas largos deben segmentarse.
- Los pesos son fp32 sin cuantizar (~4,5 GB), lo que incrementa los requisitos de memoria y la latencia frente a versiones cuantizadas; no hay variantes int8 o fp16 en este repositorio.
- La decodificacion autorregresiva del decoder (una pasada por token) puede ser lenta en CPU para audios largos.
- Como en todo sistema ASR, existe riesgo de errores de transcripcion en audio con ruido de fondo, acentos marcados o vocabulario tecnico fuera del dominio de entrenamiento; no hay datos publicos sobre sesgos especificos del modelo.
- La exportacion es de un tercero (Ciwiruk), no oficial de FireRedTeam, aunque ha sido verificada numericamente contra PyTorch; conviene validar en el pipeline de destino antes de produccion.
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes, pero el modelo no ha sido auditado para casos de uso sensibles (biometria, vigilancia), y su uso para identificar personas podria estar sujeto a normativa local.

## Enlaces

- Repositorio de la exportacion ONNX: https://huggingface.co/Ciwiruk/FireRedASR2-AED-onnx
- Modelo original de FireRedTeam: https://huggingface.co/FireRedTeam/FireRedASR2-AED
- Paper de referencia: https://arxiv.org/abs/2603.10420
