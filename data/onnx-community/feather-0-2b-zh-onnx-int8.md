# onnx-community/feather-0.2b-zh-onnx-int8

## Resumen

Feather 0.2B - Chinese ONNX (INT8) es un modelo de reconocimiento automatico del habla (ASR) especializado en mandarin, distribuido por la organizacion onnx-community y perteneciente a la familia Feather de modelos de transcripcion compactos. Se trata de un Conformer-Transducer (RNN-T) con encoder LiteConformer, disenado para transcripcion en streaming de baja latencia y ejecucion en CPU. Con 210,5 millones de parametros, esta pensado para despliegues en dispositivo (on-device) donde no hay GPU disponible.

El checkpoint exporta el encoder a ONNX con cuantizacion INT8 weight-only (MatMulNBits, bloque 32, asimetrico), mientras que el decodificador RNN-T y la red conjunta (joint) permanecen en FP32. Esta empaquetado para el runtime onnxruntime-genai (probado con 0.17.1) y ocupa unos 0,4 GB en el repositorio. Soporta audio mono a 16 kHz con 128 caracteristicas mel y procesa en fragmentos de streaming de 560 ms.

Su relevancia actual radica en la combinacion de tamano reducido, licencia MIT y orientacion explicita a inferencia en CPU, lo que lo hace apto para transcripcion local en aplicaciones de escritorio, moviles o entornos sin acelerador. La familia Feather se asocia en resultados de busqueda con el catalogo de modelos mini de reconocimiento de voz de Microsoft, si bien la model card aqui facilitada no confirma la autoria corporativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LiteConformer encoder + RNN-T decoder y joint |
| Parametros totales | 210,5 M (210.540.801; excluye buffers de preprocesado y Silero VAD) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como ventana fija; contexto izquierdo de 70 frames de encoder y chunks de streaming de 560 ms |
| Tipos de cuantizacion | INT8 weight-only en encoder (MatMulNBits, bloque 32, asimetrico); decoder y joint en FP32 |
| Idiomas soportados | chino mandarin (zh) |
| Licencia | MIT |
| Formato de pesos | ONNX (empaquetado para onnxruntime-genai) |

Datos adicionales de la model card: frecuencia de muestreo 16 kHz mono, 128 caracteristicas mel, encoder de 20 capas con hidden size 768 y 12 cabezas de atencion, predictor LSTM de 2 capas con hidden size 640, tokenizer SentencePiece con vocabulario de 8192 mas blank, hardware objetivo CPU.

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Conformer-Transducer (RNN-T) con encoder LiteConformer, una simplificacion orientada a CPU del encoder Conformer estandar tipo Nemotron. Cada capa utiliza un unico bloque feed-forward en lugar de los dos bloques de tipo Macaron, emplea RMSNorm en las subcapas del transformer y GELU en lugar de Swish/SiLU. Los modulos de convolucion conservan LayerNorm. A lo largo de las 20 capas del encoder, estos cambios reducen el numero y el coste de las operaciones de normalizacion y proyeccion, manteniendo la estructura Conformer-RNN-T en streaming. El decodificador es un predictor LSTM de 2 capas y la red conjunta combina las representaciones del encoder y del predictor segun el esquema RNN-T.

No se dispone de informacion sobre el corpus de entrenamiento (numero de tokens, composicion del dataset, horas de audio) ni sobre tecnicas de alineacion, destilacion o ajuste especificas. Tampoco se documentan etapas de RLHF o DPO, que no son aplicables de forma estandar en un sistema ASR de este tipo. La innovacion tecnica documentada se concentra en el diseno LiteConformer y en la exportacion cuantizada a INT8 para ejecucion eficiente en CPU mediante ONNX Runtime GenAI.

## Capacidades

- Reconocimiento automatico del habla en mandarin (zh) sobre audio mono a 16 kHz.
- Transcripcion en streaming con fragmentos de 560 ms (8.960 muestras) y contexto izquierdo de 70 frames de encoder, apta para dictado en tiempo real.
- Procesamiento por lotes de utterances completas mediante decodificacion greedy RNN-T.
- Uso de caracteristicas mel NeMo (128) en el preprocesado.
- Integracion opcional con deteccion de actividad de voz (Silero VAD) a traves del runtime, desactivable por configuracion.
- Integracion con el runtime onnxruntime-genai mediante StreamingProcessor y Generator.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de voz, no un modelo de lenguaje.
- No dispone de capacidades de vision, audio multimodal ni generacion de texto libre.

## Casos de uso

- Dictado y transcripcion local en escritorio: el modelo puede integrarse en aplicaciones de notas de voz que transcriben en tiempo real en CPU, aprovechando el streaming de 560 ms y el bajo uso de memoria (unos 0,4 GB de repositorio).
- Subtitulado en vivo de reuniones en mandarin: gracias a la decodificacion por fragmentos y al contexto izquierdo de 70 frames, es adecuado para generar subtitulos con baja latencia sin depender de servidores externos.
- Asistentes de voz en dispositivo: al ejecutarse en CPU con cuantizacion INT8, puede embeberse en ordenadores de gama baja o dispositivos sin GPU para comandos de voz en chino.
- Transcripcion de archivos de audio por lotes: permite procesar grabaciones de 16 kHz mono de forma offline para generar transcripciones en entornos con requisitos de privacidad (datos que no salen de la maquina).
- Accesibilidad para personas con discapacidad auditiva: conversion de habla a texto en tiempo real en aplicaciones de ayuda, con integracion sencilla a traves de ONNX Runtime GenAI.
- Investigacion en ASR eficiente: sirve como referencia reproducible para estudiar el impacto del diseno LiteConformer y de la cuantizacion INT8 en la tasa de error de caracteres (CER).
- Pipelines de analitica de audio: transcripcion de llamadas o grabaciones para su posterior indexacion y busqueda, integrando el modelo como componente ASR dentro de un flujo mayor.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados por terceros), sobre FLEURS mandarin chino, configuracion cmn_hans_cn, split test.

| Dataset | Split | Muestras | Audio | Metrica | Valor |
|---|---|---|---|---|---|
| FLEURS Mandarin Chinese | test | 945 | 3,07 h | CER | 17,45 % |

Desglose de errores sobre 35.655 caracteres de referencia: 11,24 % sustituciones (4.007), 5,33 % deleciones (1.901) y 0,88 % inserciones (314). La evaluacion se completo con cero muestras fallidas. La CER se calcula tras normalizacion NFKC, conversion a minusculas, eliminacion de puntuacion y eliminacion de espacios; no normaliza numeros chinos hablados a digitos arabigos. El autor indica que estas cifras provienen de un evaluador personalizado de ONNX Runtime con decodificacion greedy en CPU y sin VAD, y no de un benchmark completo de ONNX Runtime GenAI o Foundry Local.

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Diseno orientado a CPU: el modelo esta optimizado para inferencia en CPU con ONNX Runtime, con encoder en INT8 y decoder/joint en FP32.
- Repositorio total de aproximadamente 0,4 GB, por lo que la huella de disco y de memoria es reducida.
- VRAM estimada: no aplica de forma estricta, ya que el objetivo es CPU; en GPU el consumo seria muy bajo (del orden de cientos de MB), aunque no se documenta una cifra oficial.
- GPU recomendadas: no especificadas por el autor; el modelo esta pensado para CPU, por lo que tarjetas como RTX 4090, A100 o H100 no son necesarias.
- Compatibilidad con GPU de consumo: irrelevante en la practica, dado que el caso de uso es CPU.
- Opciones de despliegue: ONNX Runtime GenAI (probado con 0.17.1), con soporte de StreamingProcessor, Generator y Tokenizer. Se referencia integracion a traves de Foundry Local mediante el soporte Nemotron Speech ASR, sustituyendo el payload completo del runtime (encoder, decoder, joint, genai_config.json, audio_processor_config.json, tokenizer y silero_vad.onnx).
- Latencia y throughput: no disponibles. El unico dato temporal es que el encoder opera en fragmentos de 560 ms.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Idioma | Licencia | Formato | CER (FLEURS) |
|---|---|---|---|---|---|---|
| feather-0.2b-zh-onnx-int8 (este) | LiteConformer + RNN-T | 210,5 M | zh | MIT | ONNX (INT8) | 17,45 % |
| feather-0.2b-de-onnx-int8 | Conformer-Transducer (RNN-T) | aprox. 200 M | de | no disponible en la informacion | ONNX (INT8) | no disponible |
| Alternativas de ASR multilingue (p. ej. Whisper) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Solo se dispone de datos comparativos directos con el modelo hermano de la familia Feather para aleman, del que se conoce que comparte la arquitectura Conformer-Transducer de aproximadamente 200 M de parametros y la cuantizacion INT8, pero no sus cifras de rendimiento. No se han proporcionado resultados de benchmarks de otros modelos de ASR, por lo que no es posible establecer una comparativa cuantitativa adicional fiable.

## Limitaciones y advertencias

- Especializacion idiomatica: solo soporta chino mandarin; no transcribe otros idiomas ni realiza traduccion.
- No es un modelo de lenguaje: no genera texto libre, no razona y no soporta tool calling ni agentes.
- Riesgo de alucinacion y errores de transcripcion: la CER del 17,45 % en FLEURS implica un volumen considerable de sustituciones, deleciones e inserciones, especialmente en audio ruidoso o con habla solapada.
- Normalizacion limitada: la metrica no convierte numeros chinos hablados a digitos arabigos, lo que puede afectar a aplicaciones que esperen cifras en formato numerico.
- Requisitos de entrada estrictos: audio mono a 16 kHz; es necesario remuestrear cualquier otra frecuencia antes de la transcripcion.
- Configuracion de streaming fija: las formas de la cache estan fijadas para chunks de 560 ms, lo que limita la flexibilidad de la ventana de procesado.
- Integracion dependiente del runtime: requiere onnxruntime-genai (probado con 0.17.1) y, para Foundry Local, la sustitucion del payload completo del runtime, lo que anade complejidad de despliegue.
- Datos de rendimiento no verificados: los resultados de la model card los declara el autor y no han sido validados por terceros.
- Sin datos de sesgos: no se documenta informacion sobre sesgos dialectales, de genero o de acento dentro del mandarin.
- Licencia MIT: permite uso comercial y modificacion, pero conviene conservar los avisos de copyright y verificar las licencias de los componentes auxiliares (por ejemplo, Silero VAD) antes de un despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/onnx-community/feather-0.2b-zh-onnx-int8
- Modelo hermano en aleman (familia Feather): https://huggingface.co/onnx-community/feather-0.2b-de-onnx-int8
- ONNX Model Zoo: https://github.com/onnx/models
- Modelos de ONNX Runtime: https://onnxruntime.ai/models
- Repositorio de ONNX: https://github.com/onnx/onnx
