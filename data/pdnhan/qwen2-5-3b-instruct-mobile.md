# pdnhan/Qwen2.5-3B-Instruct-mobile

## Resumen

Qwen2.5-3B-Instruct-mobile es una conversión a ONNX de 4 bits del modelo Qwen/Qwen2.5-3B-Instruct, publicada por el usuario pdnhan. El objetivo no es ofrecer un modelo nuevo, sino un artefacto listo para ejecutarse en Android e iOS mediante ONNX Runtime, con código Kotlin y Swift incluido: tokenizador Qwen, bucle de generación con caché KV y un refinador de transcripciones de voz para vietnamita. Los pesos son los del modelo original; solo cambian el formato y la precisión.

El caso de uso principal es el posprocesamiento de salida de reconocimiento automático de voz (por ejemplo, PhoWhisper): el modelo añade puntuación y mayúsculas, corrige palabras mal oídas a partir del contexto, elimina muletillas y tartamudeos y convierte listas habladas en viñetas. Es la pieza que la aplicación Thì Thầm ejecuta después de PhoWhisper.

La relevancia actual reside en que demuestra un pipeline completo de ASR más refinado por LLM íntegramente en el dispositivo, sin conexión de red, con un peso de unos 1,95 GB y compatibilidad con ONNX Runtime 1.22 o superior. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la licencia heredada es qwen-research, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), exportado a grafo ONNX con GroupQueryAttention y caché KV |
| Parametros totales | 3B (modelo base Qwen2.5-3B-Instruct) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-3B-Instruct soporta 32 768 tokens, pero la model card no lo confirma para esta exportacion) |
| Tipos de cuantizacion | int4 (MatMulNBits simetrico, bloques de 32, accuracy_level 4; embedding atado como GatherBlockQuantized de 4 bits) |
| Idiomas soportados | vi, en, zh, multilingue |
| Licencia | qwen-research (license: other) |
| Formato de pesos | ONNX (model.onnx + model.onnx.data), tokenizador en vocab.txt, merges.txt y tokenizer.json |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer decoder-only denso de 3B parametros con atencion de consultas agrupadas (GQA). La exportacion mantiene 36 capas (past_key_values de 0 a 35), 2 cabezas KV y dimension de cabeza 128, con vocabulario de 151 936 tokens. El grafo ONNX usa GroupQueryAttention con cache KV, MatMulNBits de 4 bits para las matrices y un embedding atado compartido con la cabeza LM que solo calcula los logits de la ultima posicion. Se genero con el model builder de ONNX Runtime GenAI con los flags `-p int4 -e cpu`.

No se aportan datos sobre el entrenamiento original (numero de tokens, composicion del dataset, RLHF/DPO) mas alla de que los pesos son los del modelo Qwen2.5-3B-Instruct sin modificaciones. La innovacion tecnica destacable de esta publicacion es el empaquetado para movil: tokenizador byte-level BPE reimplementado en Kotlin y Swift que produce los mismos ids que Hugging Face `tokenizers` en las 716 pruebas realizadas, prompt identico token a token a la plantilla de chat del modelo, y un refinador de voz con ejemplos few-shot orientados a vietnamita.

## Capacidades

- Generacion de texto y conversacion multi-turno en vietnamita, ingles y chino, heredadas del modelo base.
- Refinado de transcripciones ASR: puntuacion (`. , ? ! :`), mayusculas, correccion de palabras mal reconocidas por contexto y eliminacion de muletillas y tartamudeos.
- Conversion de listas habladas en vinetas con saltos de linea.
- Ejecucion en el dispositivo en Android e iOS mediante ONNX Runtime, con codigo Kotlin y Swift listo para usar.
- Gestion de cache KV entre pasos de generacion, lo que permite decodificacion incremental eficiente.
- Capacidades generales del modelo base (razonamiento, codigo, matematicas, tool calling) teoricamente presentes en los pesos, aunque la model card no las valida en esta exportacion.
- No se documenta soporte de vision ni audio nativo: el modelo solo procesa texto; el audio llega ya transcrito por un ASR externo.

## Casos de uso

- Refinado de dictado en vietnamita en aplicaciones moviles: tras PhoWhisper, el modelo convierte la salida cruda en texto escrito con puntuacion y mayusculas, como en el ejemplo "thủ tướng phạm minh chính..." a "Thủ tướng Phạm Minh Chính...".
- Actas de reunion a partir de transcripciones: convierte "hôm nay chúng ta sẽ họp về ba vấn đề..." en una lista con vinetas de los tres puntos tratados, util para apps de notas que funcionan sin conexion.
- Listas de la compra o tareas dictadas por voz: transforma "nhớ mua giúp mình mấy thứ nhé trứng sữa tươi..." en una lista con vinetas de cada producto.
- Asistentes de voz sin conexion: al ejecutarse en el dispositivo con ONNX Runtime, permite posprocesar la transcripcion sin enviar audio ni texto a la nube, lo que reduce latencia y mejora la privacidad.
- Normalizacion de texto para subtitulos o documentos: añade puntuacion y mayusculas a transcripciones de entrevistas o clases grabadas antes de su publicacion.
- Prototipado de pipelines ASR mas LLM en movil: el repositorio incluye referencia en Python con numpy, lo que facilita validar el comportamiento antes de portar a Kotlin o Swift.
- Limpieza de texto dictado en ingles o chino: aunque los ejemplos y la evaluacion se centran en vietnamita, el modelo declara soporte de en, zh y multilingue.

## Benchmarks y rendimiento

La model card no publica benchmarks clasicos (MMLU, HumanEval, GSM8K). Si incluye una evaluacion especifica del refinador sobre 300 transcripciones PhoWhisper de FLEURS vietnamita (primeros 150 clips, transcritos por los modelos int8 PhoWhisper tiny y small de pdnhan/PhoWhisper-small-mobile):

| Reconocedor | WER de la transcripcion | WER tras el refinador |
|---|---|---|
| PhoWhisper small (int8) | 12,3 % | 11,8 % |
| PhoWhisper tiny (int8) | 28,9 % | 28,6 % |

El WER se mide sin distinguir mayusculas ni puntuacion; FLEURS escribe los numeros en digitos y en palabras, por lo que un numero escrito en digitos por el refinador puede contarse como error. La puntuacion sobre las palabras comunes a ambos textos obtiene precision 0,67, recall 0,61 y F1 0,64. El tiempo por transcripcion en CPU x86 de escritorio con 8 hilos es de 1,34 s; en telefonos es varias veces mas lento.

## Requisitos de hardware

- Peso en disco: aproximadamente 1,95 GB para `model.onnx` + `model.onnx.data` (1.946,3 MB de pesos int4 mas 287,8 kB de grafo).
- Memoria: no se publica una cifra de VRAM o RAM; en movil debe caber en memoria el modelo de 4 bits mas la cache KV en float32 (`[batch, 2, past, 128]` por capa, 36 capas).
- GPU de escritorio: no se documentan recomendaciones; el modelo se construyo con `-e cpu` y se probo en CPU x86 con 8 hilos.
- Consumer GPU: no disponible; al ser una exportacion orientada a CPU y movil, no se aportan datos de ejecucion en RTX 4090 u otras.
- Despliegue: ONNX Runtime 1.22 o superior (probado con 1.31.1) y ONNX Runtime GenAI; el codigo de referencia esta en Python con numpy, y las apps usan Kotlin (JVM) y Swift.
- Latencia: 1,34 s por transcripcion en CPU x86 de 8 hilos; en telefonos, varias veces mas. No se publica throughput.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. Como referencia estructural, se puede contrastar con el modelo base del que deriva:

| Modelo | Parametros | Formato | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|---|
| pdnhan/Qwen2.5-3B-Instruct-mobile | 3B | ONNX int4 | no disponible | qwen-research | Inferencia en Android/iOS |
| Qwen/Qwen2.5-3B-Instruct | 3B | safetensors | 32 768 tokens (segun el modelo base, no confirmado en la model card) | qwen-research | Servidor/escritorio |
| pdnhan/PhoWhisper-small-mobile | no disponible | no disponible | no disponible | no disponible | ASR en movil (componente previo del pipeline) |

## Limitaciones y advertencias

- La licencia qwen-research es restrictiva para uso comercial; hay que revisar el enlace de licencia del modelo base antes de desplegarlo en produccion.
- El modelo hereda los sesgos del corpus de entrenamiento de Qwen2.5, no documentados en esta model card.
- Riesgo de alucinacion: al ser un LLM generativo, puede introducir palabras o reformulaciones no presentes en la transcripcion original.
- La evaluacion se limita a vietnamita y a 300 transcripciones de FLEURS; el rendimiento en ingles, chino u otros dominios no esta medido.
- La ganancia en WER es modesta (de 12,3 % a 11,8 % con PhoWhisper small) y la puntuacion obtiene F1 0,64, por lo que no sustituye una revision humana en contextos criticos.
- El WER se mide sin distinguir mayusculas ni puntuacion, y los numeros escritos en digitos pueden contarse como error, lo que complica comparaciones directas con otras cifras.
- La longitud de contexto efectiva de esta exportacion no se documenta; el grafo usa cache KV dinamica, pero no se indica el limite practico en movil.
- El repositorio tiene 0 descargas y 0 likes en la fecha de consulta, sin senales de validacion por parte de la comunidad.
- La latencia en telefonos es varias veces superior a los 1,34 s medidos en escritorio, lo que puede afectar a la experiencia en tiempo real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pdnhan/Qwen2.5-3B-Instruct-mobile
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- ONNX Runtime: https://onnxruntime.ai
- ONNX Runtime GenAI: https://github.com/microsoft/onnxruntime-genai
- PhoWhisper small: https://huggingface.co/vinai/PhoWhisper-small
- PhoWhisper-small-mobile (pdnhan): https://huggingface.co/pdnhan/PhoWhisper-small-mobile
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
