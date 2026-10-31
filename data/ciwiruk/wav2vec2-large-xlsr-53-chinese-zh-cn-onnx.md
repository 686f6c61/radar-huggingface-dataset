# Ciwiruk/wav2vec2-large-xlsr-53-chinese-zh-cn-onnx

## Resumen

wav2vec2-large-xlsr-53-chinese-zh-cn-onnx es una exportacion a formato ONNX (precision fp32) del modelo jonatasgrosman/wav2vec2-large-xlsr-53-chinese-zh-cn, un modelo de reconocimiento automatico de habla (ASR) en mandarin. El modelo base fue ajustado (fine-tuned) por Jonatas Grosman a partir de facebook/wav2vec2-large-xlsr-53, el checkpoint multilingue de Meta AI entrenado sobre 53 idiomas, utilizando el dataset Common Voice. Esta version, publicada por el usuario Ciwiruk, no modifica los pesos: es una conversion de formato destinada a facilitar el despliegue en entornos de produccion que no disponen de PyTorch.

El problema que resuelve es doble. Por un lado, ofrece transcripcion de habla en chino mandarin con una arquitectura CTC que no requiere un modelo de lenguaje externo para funcionar. Por otro, la exportacion ONNX permite ejecutar la inferencia con ONNX Runtime sobre CPU o GPU, integrandose en pipelines que no dependen del ecosistema Hugging Face, con soporte para verificacion de integridad de archivos mediante SHA-256.

Es relevante como opcion ligera y con licencia permisiva (Apache 2.0) para ASR en mandarin, especialmente en dispositivos o servicios donde la portabilidad del runtime importa mas que el maximo rendimiento de estado del arte. El repositorio pesa aproximadamente 1,3 GB y la salida produce un frame de logits cada 20 ms.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer convolucional + encoder, cabeza CTC) |
| Parametros totales | no disponible (el repo ocupa ~1,3 GB en fp32; el checkpoint original large-xlsr ronda los 300 M de parametros, pero no esta confirmado en la ficha) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (limitado por memoria; procesa clips de audio a 16 kHz) |
| Tipos de cuantizacion | fp32 (ONNX); el modelo base original dispone de versiones cuantizadas, no esta version |
| Idiomas soportados | chino mandarin (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model.onnx), con vocab.json, config.json y preprocessor_config.json |

## Arquitectura y entrenamiento

El modelo pertenece a la familia wav2vec2: una red convolucional que extrae caracteristicas de la forma de onda cruda (sin necesidad de features tipo MFCC) seguida de un encoder transformer. La variante large-xlsr-53 parte del preentrenamiento cross-lingual de Facebook AI sobre audio de 53 idiomas, y la cabeza de salida es CTC (Connectionist Temporal Classification), lo que permite alinear frames de audio con caracteres sin alineaciones previas. `<pad>` actua como token CTC blank en el vocabulario.

El ajuste fino en mandarin se realizo sobre Common Voice (dataset multilingue de Mozilla con audio crowdsourced). No consta en la informacion disponible el numero exacto de horas ni de tokens, ni si se aplicaron tecnicas adicionales como decodificacion con modelo de lenguaje. La innovacion de esta version es la conversion a ONNX: los pesos son identicos al original y la verificacion contra PyTorch mostro una diferencia maxima absoluta de logits de 1,45e-04 en clips de prueba, es decir, equivalencia numerica practicamente exacta.

## Capacidades

- Transcripcion de habla en chino mandarin (ASR) mediante decodificacion CTC, un frame cada 20 ms.
- Procesamiento de audio crudo: entrada float32 de forma `[batch, samples]` a 16 kHz mono, con normalizacion por clip a media cero y varianza unitaria.
- Inferencia por lotes (batch) gracias al formato ONNX y ONNX Runtime.
- Ejecucion multiplataforma: CPU, GPU y entornos sin dependencia de PyTorch (ONNX Runtime esta disponible para Linux, Windows, macOS, movil y edge).
- Verificacion de integridad de descargas mediante `manifest.json` con SHA-256 de cada archivo.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo especializado en ASR.
- No incluye capacidades de vision, audio generativo ni traduccion.

## Casos de uso

- Transcripcion batch de grabaciones en mandarin: procesamiento offline de archivos de audio (podcasts, entrevistas, reuniones) mediante ONNX Runtime en CPU, aprovechando el batching para maximizar throughput.
- Integracion en servicios escritos en C#, Java o Rust: ONNX Runtime tiene bindings nativos para estos lenguajes, lo que evita anadir Python y PyTorch a la pila de produccion.
- Transcripcion en el navegador o en edge: ONNX Runtime Web (WebAssembly/WebGPU) permite ejecutar el modelo en cliente, util para dictado en aplicaciones web sin enviar audio a un servidor.
- Subtitulado automatico de video en mandarin: la salida de frames cada 20 ms facilita alinear caracteres con marcas de tiempo para generar subtitulos.
- Preprocesado para pipelines de NLP en chino: transcribir audio como primer paso de sistemas de analisis de llamadas, indexacion de contenido hablado o mineria de datos de voz.
- Despliegue en contenedores ligeros: al no requerir PyTorch, la imagen Docker puede reducirse significativamente en tamano, util en entornos con restricciones de almacenamiento.
- Verificacion de integridad en distribucion: el manifiesto con SHA-256 permite a clientes descargar y validar los archivos de forma segura en despliegues automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Para evaluar el WER/CER del modelo base en Common Voice y otros datasets de mandarin, puede consultarse la model card del modelo original de Jonatas Grosman.

## Requisitos de hardware

- VRAM / memoria estimada: el repositorio ocupa ~1,3 GB en fp32; para inferencia conviene disponer de al menos 2-3 GB de RAM o VRAM considerando activaciones (estimacion, no dato oficial).
- GPU recomendadas: cualquier GPU compatible con ONNX Runtime (CUDA, DirectML, CoreML); no se requieren GPUs de gama datacenter para este tamano de modelo.
- Consumer GPUs: cabe con holgura en GPUs consumer modernas (por ejemplo, RTX 3060 o superiores); tambien es ejecutable solo en CPU dado su tamano moderado.
- Despliegue: ONNX Runtime (Python, C#, C++, Java, Rust, JavaScript), ONNX Runtime Web, ONNX Runtime Mobile. No requiere vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponible; al ser CTC con frames de 20 ms, el coste crece linealmente con la duracion del audio y el batching mejora el throughput en CPU.

## Comparativa con modelos similares

| Modelo | Tarea / idioma | Formato | Licencia | Notas |
|---|---|---|---|---|
| Ciwiruk/wav2vec2-large-xlsr-53-chinese-zh-cn-onnx | ASR mandarin | ONNX fp32 | Apache 2.0 | Conversion fiel del original, con manifiesto SHA-256 |
| jonatasgrosman/wav2vec2-large-xlsr-53-chinese-zh-cn | ASR mandarin | PyTorch (safetensors/bin) | Apache 2.0 | Modelo original; disponible tambien version cuantizada |
| facebook/wav2vec2-large-xlsr-53 | Preentrenamiento multilingue (53 idiomas) | PyTorch | MIT (base XLSR) | Punto de partida sin ajuste fino; requiere fine-tuning por idioma |
| whisper-small / medium (OpenAI) | ASR multilingue, incluido zh | PyTorch / GGUF / ONNX | MIT | Mayor robustez y puntuacion; seq2seq en lugar de CTC; mas costoso en inferencia |

## Limitaciones y advertencias

- Alcance limitado a un solo idioma: solo transcribe mandarin; no es util para otros idiomas ni para code-switching.
- Entrenado sobre Common Voice: el rendimiento puede degradar en audio con ruido de fondo, acentos poco representados en el dataset o vocabulario tecnico fuera de dominio.
- CTC sin modelo de lenguaje integrado: la salida es una secuencia de caracteres sin puntuacion ni segmentacion; puede requerir postprocesado o decodificacion con LM externo para mejorar calidad.
- Riesgo de alucinacion bajo en comparacion con modelos seq2seq (CTC solo emite lo que oye), pero puede producir repeticiones o caracteres erróneos en audio degradado.
- Sesgos: los datos crowdsourced de Common Voice pueden infrarrepresentar acentos, dialectos (cantonés, etc. no cubiertos) y grupos demograficos concretos.
- La conversion ONNX esta publicada por un tercero (Cwiruk), no por el autor del modelo original; la verificacion numerica reportada (1,45e-04 de diferencia maxima) es del propio autor de la conversion.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con obligacion de conservar avisos de licencia y copyright.
- Version cuantizada no incluida en este repo; para inferencia en dispositivos muy limitados habria que cuantizar el ONNX manualmente o usar la version cuantizada del modelo original en PyTorch.

## Enlaces

- Modelo ONNX: https://huggingface.co/Ciwiruk/wav2vec2-large-xlsr-53-chinese-zh-cn-onnx
- Modelo base (Jonatas Grosman): https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-chinese-zh-cn
- Modelo base preentrenado (Facebook AI): https://huggingface.co/facebook/wav2vec2-large-xlsr-53
- Documentacion de wav2vec2 en Hugging Face: https://huggingface.co/docs/transformers/model_doc/wav2vec2
- Documentacion de ONNX Runtime: https://onnxruntime.ai/
