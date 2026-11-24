# onemira/zipformer-zh-en-480ms-onnx

## Resumen

`onemira/zipformer-zh-en-480ms-onnx` es un espejo byte a byte del archivo int8 del modelo Zipformer transducer bilingüe (chino e inglés, con puntuación) de la familia X-ASR de k2-fsa/sherpa-onnx, con una latencia de chunk de 480 ms y orientado a reconocimiento de voz en streaming sobre dispositivo. El modelo original pertenece a los contribuidores de X-ASR y sherpa-onnx; OneMira se limita a redistribuir el archivo sin modificaciones para su uso en su grabadora C1 con transcripción en vivo. Por tanto, no se trata de un modelo nuevo sino de una réplica de distribución de un artefacto ya existente.

La relevancia de esta ficha radica en que documenta un ASR streaming de tamano reducido (el archivo comprimido ocupa unos 133,9 MB) que cabe en dispositivos de borde y permite transcripción bilingüe con puntuación en tiempo real. Al estar empaquetado en formato ONNX y pensado para sherpa-onnx, se puede ejecutar sin GPU en portátiles, mini-PC y hardware embebido, lo que lo hace util para aplicaciones de dictado, subtitulado y toma de notas que no quieren enviar audio a la nube.

No se dispone de informacion sobre el numero de parametros, la composicion exacta del dataset de entrenamiento ni resultados de benchmarks en la informacion proporcionada; la model card se limita a identificar el archivo, su hash y su procedencia. Cualquier cifra de rendimiento debe consultarse en la documentacion upstream de X-ASR y sherpa-onnx.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer transducer (streaming ASR), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de streaming por chunks de 480 ms) |
| Tipos de cuantizacion | int8 (unica variante publicada en este repo) |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (archivo `.tar.bz2` de sherpa-onnx, 133.895.136 bytes) |

## Arquitectura y entrenamiento

El modelo es un Zipformer transducer, una variante de arquitectura transformer con codificador Zipformer disenada especificamente para ASR en streaming de baja latencia. El modo streaming se articula mediante chunks de 480 ms, lo que permite emitir hipotesis parciales mientras se recibe audio y mantener un coste computacional acotado por chunk. La salida incluye puntuacion, segun indica el nombre del archivo upstream (`...-zh-en-punct-int8-...`).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones adicionales mas alla de las propias del codificador Zipformer y del pipeline de sherpa-onnx. El artefacto distribuido esta cuantizado a int8, lo que reduce el peso y acelera la inferencia en CPU. La model card indica que el archivo es un espejo sin modificaciones del original publicado en las releases de `k2-fsa/sherpa-onnx` (fecha de archivo 2026-06-05), con SHA-256 `fa5f63d618e5a01526e275a358bb7772e403f84808a4769fba52cffd8160bf74`.

## Capacidades

- Reconocimiento automatico del habla en streaming con latencia de chunk de 480 ms.
- Transcripcion bilingüe chino-ingles en un unico modelo.
- Generacion de puntuacion en la salida (variante `punct`).
- Ejecucion on-device sobre CPU mediante el runtime sherpa-onnx (formato ONNX).
- Inferencia de baja huella de memoria gracias a la cuantizacion int8.
- Integracion en pipelines de captura de audio en tiempo real (microfono, llamadas, reuniones).
- No se documentan capacidades de tool calling, agentes, vision ni audio generativo; es exclusivamente un modelo ASR.

## Casos de uso

- Transcripcion en vivo de reuniones: el modelo consume el audio por chunks de 480 ms y emite texto parcial con puntuacion, adecuado para actas y notas en tiempo real en entornos de videollamada.
- Dictado en aplicaciones de escritorio: al ejecutarse en CPU via sherpa-onnx, se puede integrar en apps de Mac o Windows para convertir voz en texto sin enviar audio a la nube.
- Subtitulado de contenido audiovisual bilingüe: la combinacion zh-en permite generar subtitulos para material que mezcla ambos idiomas, con la ventaja de la puntuacion incluida.
- Grabadoras de voz con IA (por ejemplo, la linea C1 de OneMira): el modelo esta pensado para transcripcion en vivo en dispositivo, reduciendo dependencia de servicios cloud y costes recurrentes.
- Asistentes de voz para atención al cliente en kioscos o terminales: la inferencia on-device y la baja latencia permiten reconocimiento local en hardware modesto.
- Accesibilidad: transcripcion en tiempo real para personas con dificultades auditivas en conversaciones presenciales o llamadas, ejecutandose en portatiles sin GPU dedicada.
- Preprocesado de audio para pipelines de NLP: generar transcripciones locales antes de pasarlas a un LLM o a un sistema de busqueda, manteniendo el audio en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso CPU; en GPU, el modelo int8 es lo bastante pequeno como para caber en cualquier GPU con al menos 1 GB de memoria libre, aunque no se especifica el consumo exacto.
- GPU recomendadas: no se documentan; el destino principal es CPU y hardware embebido.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna (por ejemplo, GTX 1650 o superior) e incluso en iGPU, dado el tamano reducido del artefacto (133,9 MB comprimido).
- Opciones de despliegue: sherpa-onnx (runtime nativo), ONNX Runtime; no se documenta soporte directo para vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a ASR.
- Latencia y throughput estimados: latencia de chunk de 480 ms por diseno; no se dispone de cifras de RTF ni de throughput en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| onemira/zipformer-zh-en-480ms-onnx | no disponible | streaming 480 ms | zh, en | Apache 2.0 | ONNX (int8) |
| Whisper (variantes de OpenAI) | no disponible en esta ficha | 30 s por ventana (no streaming nativo) | multilingue | MIT | safetensors, GGUF, etc. |
| Variantes Zipformer de sherpa-onnx (otros tamanos) | no disponible | variable segun chunk | segun variante | Apache 2.0 | ONNX |

La comparacion con Whisper es pertinente por categoria (ASR multilingue) pero no por regimen de ejecucion: Whisper no es streaming nativo y suele requerir GPU para baja latencia, mientras que este Zipformer esta disenado para streaming en CPU. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Solo cubre chino e ingles; no se documenta soporte para castellano ni otras lenguas.
- Es un espejo sin modificaciones: los sesgos y limitaciones son los del modelo upstream de X-ASR y sherpa-onnx, no documentados en la informacion disponible.
- Riesgo de alucinacion y errores de transcripcion en audio ruidoso, acentos no estandar o cambio de idioma dentro de una misma frase; no hay metricas publicadas de WER en esta ficha.
- La ventana de streaming de 480 ms implica que no se aprovecha contexto largo; para audio con dependencias lejanas puede ser menos preciso que modelos de utterance completa.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de atribucion a X-ASR y sherpa-onnx segun los archivos `NOTICE.txt` y `LICENSE` del repo.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta; conviene verificar la integridad con el SHA-256 indicado antes de desplegar en produccion.
- No se documentan garantias de mantenimiento por parte de OneMira; para actualizaciones debe acudirse al repositorio upstream.

## Enlaces

- Hugging Face: https://huggingface.co/onemira/zipformer-zh-en-480ms-onnx
- Modelo upstream X-ASR: https://github.com/Gilgamesh-J/X-ASR
- Distribucion original (release de sherpa-onnx): https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-x-asr-480ms-streaming-zipformer-transducer-zh-en-punct-int8-2026-06-05.tar.bz2
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Producto OneMira C1: https://onemira.com/products/c1
- Analisis de grabadoras IA (OneMira, Pocket, Plaud): https://wearemobians.com/2026/11/enregistreurs-ia-onemira-pocket-plaud/
- Demo en video del OneMira C1: https://www.youtube.com/watch?v=LUIqGIipxQs
