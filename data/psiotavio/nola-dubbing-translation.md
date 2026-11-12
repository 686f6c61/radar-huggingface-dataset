# psiotavio/nola-dubbing-translation

## Resumen

`psiotavio/nola-dubbing-translation` es un repositorio de exportaciones ONNX en FP16 de dos modelos de traduccion automatica de la familia OPUS-MT desarrollada por Helsinki-NLP: `opus-mt-ROMANCE-en` (traduccion desde lenguas romances hacia ingles) y `opus-mt-en-ROMANCE` (traduccion desde ingles hacia lenguas romances). El repositorio no entrena ningun modelo nuevo: reempaqueta los pesos originales en un formato optimizado para inferencia en produccion, orientado a doblaje (dubbing) y traduccion multilingue entre portugues, espanol, frances, italiano e ingles.

La particularidad tecnica es la descomposicion de cada modelo en tres grafos ONNX: un codificador, un inicializador de atencion cruzada (`decoder_cross.onnx`) y un decodificador de un solo paso con clave/valor cacheados (`decoder_step.onnx`). Este diseno permite decodificacion autoregresiva incremental sin recalcular el contexto en cada token, algo tipico de pipelines de traduccion en tiempo real o de sintesis de voz integrada.

Es relevante para desarrolladores que necesitan un motor de traduccion ligero, desplegable en CPU o GPU sin depender de frameworks pesados (PyTorch/Transformers en runtime), con licencia Apache 2.0 y pesos FP16 que reducen el tamano del repositorio a 0,6 GB. Al ser un artefacto derivado, sus pesos y licencia pertenecen a los autores originales (Helsinki-NLP, OPUS-MT).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, familia OPUS-MT), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (exportacion ONNX); no se documentan otras variantes |
| Idiomas soportados | pt, es, fr, it, en (romances ↔ ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (encoder, `decoder_cross.onnx`, `decoder_step.onnx`) en FP16; tokenizador SentencePiece (`source.spm`, `target.spm`) no incluido, referenciado desde los repos originales |

## Arquitectura y entrenamiento

El modelo subyacente es Marian, la arquitectura encoder-decoder de traduccion automatica neuronal usada por Helsinki-NLP en la coleccion OPUS-MT. Cada direccion (`ROMANCE-en` y `en-ROMANCE`) es un modelo multi-idioma que comparte vocabulario y parametros entre las lenguas romances cubiertas, con el ingles como contraparte. No se dispone de informacion en la model card sobre numero de tokens de entrenamiento, composicion del corpus ni uso de RLHF o DPO; estos datos corresponden a las fichas de los modelos originales de Helsinki-NLP, no a este repositorio.

La innovacion de este artefacto es puramente de inferencia: la exportacion ONNX separa el grafo en codificador, inicializacion de atencion cruzada y decodificador por paso con cache de claves/valores. Esto permite implementar un bucle de decodificacion incremental eficiente en runtimes ONNX (ONNX Runtime, TensorRT, etc.), con pesos en FP16 para reducir huella de memoria y ancho de banda, manteniendo compatibilidad con hardware que no dispone de aceleracion PyTorch.

## Capacidades

- Traduccion automatica de texto entre portugues, espanol, frances, italiano e ingles en ambas direcciones (romances → en y en → romances).
- Traduccion multi-idioma dentro de un mismo grafo: un unico modelo `en-ROMANCE` cubre las cuatro lenguas romances de destino.
- Decodificacion autoregresiva incremental con cache de clave/valor, apta para generacion token a token de baja latencia.
- Integracion en pipelines de doblaje: la separacion encoder/decoder facilita encadenar traduccion con sintesis de voz u otros modulos.
- Ejecucion sin dependencia de PyTorch en runtime (solo ONNX Runtime u otro motor ONNX).
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Doblaje automatizado de video: el modelo traduce subtitulos o transcripciones entre romances e ingles, y su decodificador por pasos con cache permite emitir traducciones parciales alineadas con la locucion original para alimentar un TTS.
- Subtitulado multilingue en streaming: la exportacion ONNX y FP16 permite desplegar el modelo en servidores modestos y generar subtitulos en tiempo casi real a partir de ASR.
- Traduccion de documentacion tecnica entre espanol, portugues, frances, italiano e ingles: el modelo multi-idioma `en-ROMANCE` cubre las cuatro salidas romances con un solo artefacto, simplificando el mantenimiento.
- Localizacion de interfaces y catalogos de producto: traduccion por frases cortas con latencia baja en CPU, adecuada para pre-traducir cadenas antes de revision humana.
- Traduccion embebida en aplicaciones de escritorio o moviles: ONNX Runtime permite ejecutar el modelo en dispositivos sin GPU dedicada, con pesos FP16 de bajo consumo de memoria.
- Pre-traduccion en flujos de postedicion: generar una primera version automatica que un traductor humano revisa, reduciendo coste frente a traduccion desde cero.
- Normalizacion multilingue de datos para entrenamiento: traduccion de corpus entre romances e ingles para aumentar datos paralelos o sinteticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma desagregada; el repositorio completo ocupa 0,6 GB en FP16, por lo que la huella de pesos es del orden de cientos de MB.
- GPU recomendadas: cualquier GPU compatible con ONNX Runtime (por ejemplo, RTX 4090, A100, H100); al ser un modelo pequeno de traduccion, no requiere GPUs de gran capacidad.
- Cabe en GPU consumer: si; tambien es viable en CPU, dado el tamano reducido de los pesos.
- Opciones de despliegue: ONNX Runtime (CPU o CUDA/TensorRT), TensorRT, y cualquier runtime compatible con grafos ONNX; no se documenta soporte nativo en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| psiotavio/nola-dubbing-translation | no disponible (derivado de OPUS-MT) | no disponible | pt, es, fr, it, en | apache-2.0 | ONNX FP16 |
| Helsinki-NLP/opus-mt-ROMANCE-en | no disponible | no disponible | romances → en | apache-2.0 (modelo original) | PyTorch/safetensors |
| Helsinki-NLP/opus-mt-en-ROMANCE | no disponible | no disponible | en → romances | apache-2.0 (modelo original) | PyTorch/safetensors |
| Helsinki-NLP/opus-mt-es-en (par especifico) | no disponible | no disponible | es ↔ en | apache-2.0 | PyTorch/safetensors |

La diferencia principal frente a los modelos originales de Helsinki-NLP es el formato: este repositorio ofrece grafos ONNX FP16 con decodificador cacheado, mientras que los originales se distribuyen en formato PyTorch. Los datos de parametros y contexto de los modelos OPUS-MT no se detallan en la informacion proporcionada.

## Limitaciones y advertencias

- Al ser un artefacto derivado, la calidad de traduccion depende enteramente de los modelos originales de Helsinki-NLP; este repositorio no aporta mejoras de calidad.
- No se documentan sesgos conocidos en la model card; los sesgos de los modelos OPUS-MT originales (derivados de corpus OPUS) siguen aplicandose.
- Riesgo de alucinacion y errores de traduccion en frases ambiguas, terminologia especializada o textos con ruido, como en cualquier modelo NMT.
- Cobertura linguistica limitada a pt, es, fr, it y en; no se documentan otras lenguas.
- Los ficheros SentencePiece (`source.spm`, `target.spm`) no estan incluidos en el repositorio y deben obtenerse de los repos originales en las revisiones indicadas; un uso incorrecto del tokenizador degrada la traduccion.
- La licencia Apache 2.0 permite uso comercial, pero los pesos y la licencia pertenecen a Helsinki-NLP/OPUS-MT; conviene revisar las condiciones de los repos originales.
- No se documentan garantias de latencia ni de calidad para produccion; requiere evaluacion propia antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/psiotavio/nola-dubbing-translation
- Modelo original romances → en: https://huggingface.co/Helsinki-NLP/opus-mt-ROMANCE-en
- Modelo original en → romances: https://huggingface.co/Helsinki-NLP/opus-mt-en-ROMANCE
- Revision del modelo romances → en: e9ca9975e3972afd80732f08ce01d3a1339f47f8
- Revision del modelo en → romances: f8f3a28e8b6272d0ccc0290b832f699e154ae431
