# Lorqa/nemotron-3.5-asr-streaming-multilingual-0.6b-1120ms-onnx-int8

## Resumen

El modelo `Lorqa/nemotron-3.5-asr-streaming-multilingual-0.6b-1120ms-onnx-int8` es un paquete ONNX en cuantizacion INT8 para reconocimiento automatico del habla (ASR) en streaming, publicado por el usuario Lorqa. No es un modelo entrenado desde cero: se trata de un espejo de ejecucion byte a byte del bundle `csukuangfj2/sherpa-onnx-nemotron-3.5-asr-streaming-0.6b-1120ms-int8-2026-06-11`, cuyo modelo de origen es `nvidia/nemotron-3.5-asr-streaming-0.6b` de NVIDIA, distribuido bajo licencia OpenMDW 1.1.

El modelo resuelve transcripcion de voz en tiempo real sobre flujos de audio continuos, con soporte multilingue (chino, ingles, japones y otras localizaciones) mediante condicionamiento por identificador de idioma. Su tamano es de aproximadamente 600 millones de parametros (0,6B) y emplea una arquitectura cache-aware FastConformer-RNNT, optimizada para atencion en streaming con memoria de estado entre fragmentos. El tamano de fragmento (chunk) de esta variante concreta es de 1120 ms.

Su relevancia practica esta en el despliegue: al ser un bundle ONNX INT8 de unos 682 MB que se ejecuta con sherpa-onnx, permite transcripcion en streaming autoalojada sin necesidad de GPU dedicada ni de frameworks de entrenamiento. La contrapartida es que no es un modelo nuevo ni una mejora de precision: es una copia de runtime del export oficial, sin reentrenamiento, recuantizacion ni mejoras de exactitud declaradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cache-aware FastConformer-RNNT (transducer) |
| Parametros totales | 0,6B (aproximadamente 600 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica como contexto de texto; chunk de streaming de 1120 ms |
| Tipos de cuantizacion | INT8 (encoder, decoder y joiner en `.int8.onnx`) |
| Idiomas soportados | Chino (zh), ingles (en), japones (ja) y multilingue (hasta 40 localizaciones de idioma segun la documentacion del modelo de origen) |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | ONNX (INT8): `encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx` y `tokens.txt` |

Datos adicionales: el bundle ocupa 682.215.474 bytes (unos 682 MB); el tamano del repositorio es de 0,7 GB. Requiere un extractor de caracteristicas de 128 bins. No es un bundle Core ML (`.mlmodelc`) y no puede cargarse con cargadores Core ML o FluidAudio.

## Arquitectura y entrenamiento

La arquitectura subyacente es una FastConformer-RNNT cache-aware, es decir, un encoder Conformer con downsampling por convolucion depthwise y capas de atencion dotadas de cache para operar en modo streaming, acoplado a un decodificador transducer (RNNT) con red joiner. El encoder procesa el audio en fragmentos y mantiene el estado de atencion entre ellos, de modo que la latencia de reconocimiento se controla con el tamano de chunk. En esta variante el chunk es de 1120 ms.

El modelo incorpora condicionamiento por prompt de identificador de idioma, lo que permite que un unico modelo cubra multiples lenguas: la cadena de idioma por flujo admite un idioma explicito o el modo automatico. Respecto al entrenamiento, esta ficha no dispone de datos sobre el numero de tokens, la composicion del dataset ni el uso de RLHF o DPO. La model card es explicita al afirmar que no se reclama ningun entrenamiento, recuantizacion ni mejora de precision: los ficheros de encoder, decoder, joiner y tokens son identicos a los del export de origen.

## Capacidades

- Transcripcion de voz en streaming con salida incremental de texto.
- Reconocimiento multilingue con condicionamiento por idioma por flujo: admite idiomas explicitos o deteccion automatica.
- Cobertura de chino mandarin, ingles y japones, con soporte adicional de localizaciones de otros idiomas segun el modelo de origen.
- Reconocimiento en tiempo real orientado a audio continuo (no solo a ficheros completos).
- Integracion con el runtime sherpa-onnx mediante cuatro ficheros (encoder, decoder, joiner y tokens) y extractor de 128 bins.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio generativo ni modo de razonamiento: es exclusivamente un modelo ASR.

## Casos de uso

- Subtitulado en directo: transcripcion incremental de audio continuo con chunk de 1120 ms para generar subtitulos en tiempo real en retransmisiones o videollamadas, con salida progresiva segun llega el audio.
- Asistentes de voz autoalojados: captura de microfono en local y transcripcion en el propio dispositivo o servidor, sin enviar audio a servicios externos, gracias al bundle ONNX INT8 de 682 MB.
- Atencion al cliente con transcripcion en vivo: generacion de transcripciones de llamadas para analitica o apoyo a agentes, aprovechando el soporte multilingue con deteccion de idioma por flujo.
- Indexacion y busqueda de reuniones: conversion de grabaciones de reuniones a texto buscable, con seleccion explicita del idioma cuando se conoce de antemano.
- Accesibilidad para personas con discapacidad auditiva: subtitulado en aplicaciones de escritorio o moviles que ejecutan sherpa-onnx sin GPU dedicada.
- Notas de voz multilingues: transcripcion de mensajes de voz en chino, ingles o japones dentro de una misma aplicacion usando el modo automatico de idioma.
- Pipelines de voz para agentes conversacionales: etapa ASR previa a un modulo de dialogo, con la ventaja de que la salida es incremental y encaja en arquitecturas de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama ninguna mejora de precision respecto al export de origen y que el chino es una localizacion de amplia cobertura cuya exactitud debe evaluarse sobre grabaciones propias. Asimismo, advierte que el chunk de 1120 ms no garantiza la latencia visible de texto de extremo a extremo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6-1 GB para los pesos INT8, aunque el consumo en ejecucion supera el tamano de descarga (682 MB). Cifras estimadas a partir del tamano del bundle, no publicadas oficialmente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente en la practica por el tamano del modelo; no se especifican modelos concretos en la informacion disponible.
- Cabe holgadamente en GPU de consumo (por ejemplo, gamas RTX xx60 y superiores) y tambien en CPU mediante sherpa-onnx.
- Opciones de despliegue: sherpa-onnx, en una version que soporte Nemotron 3.5 multilingue, con `encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx`, `tokens.txt` y un extractor de caracteristicas de 128 bins. No es compatible con cargadores Core ML ni FluidAudio.
- Latencia y throughput estimados: no disponibles; dependen del hardware, del chunk de 1120 ms y del idioma.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Chunk / latencia | Idiomas | Licencia |
|---|---|---|---|---|---|
| Lorqa nemotron-3.5-asr-streaming-multilingual-0.6b-1120ms-onnx-int8 | 0,6B | ONNX INT8 | 1120 ms | zh, en, ja, multilingue | OpenMDW 1.1 |
| Lorqa nemotron-3.5-asr-streaming-multilingual-0.6b-80ms-onnx-int8 | 0,6B | ONNX INT8 | 80 ms | zh, en, ja, multilingue | OpenMDW 1.1 |
| Lorqa nemotron-3.5-asr-streaming-multilingual-0.6b-320ms-coreml | 0,6B | Core ML | 320 ms | multilingue | OpenMDW 1.1 |
| nvidia/nemotron-3.5-asr-streaming-0.6b (origen) | 0,6B | Pesos originales | No disponible | 40 localizaciones de idioma | OpenMDW 1.1 |

Las alternativas directas son las otras variantes del mismo modelo publicadas por Lorqa, que se diferencian unicamente en el tamano de chunk y en el formato de runtime (ONNX frente a Core ML). No se dispone de datos de rendimiento comparado entre ellas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: es un espejo de runtime byte a byte del export de `csukuangfj2`, sin entrenamiento ni recuantizacion ni mejoras de precision.
- La exactitud en chino debe evaluarse sobre grabaciones propias; la model card lo senala como localizacion de amplia cobertura.
- El chunk de 1120 ms no garantiza una latencia de texto visible baja; los fragmentos grandes priorizan exactitud y eficiencia de computo sobre capacidad de respuesta.
- El consumo de memoria en ejecucion supera el tamano de descarga del bundle.
- Riesgo de errores de transcripcion inherente a cualquier modelo ASR; no se proporcionan tasas de error publicadas.
- No se proporcionan datos sobre sesgos por idioma, acento o dominio en la informacion disponible.
- Restricciones de licencia: se distribuye bajo OpenMDW 1.1; conviene revisar los terminos de dicha licencia antes de un uso comercial.
- Este bundle no puede cargarse con Core ML ni FluidAudio.
- Las grabaciones de ejemplo del proyecto de origen no se incluyen en este espejo; se recomienda verificar `SHA256SUMS` tras la descarga.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/Lorqa/nemotron-3.5-asr-streaming-multilingual-0.6b-1120ms-onnx-int8
- ModelScope (espejo): https://modelscope.cn/models/Lorqa/nemotron-3.5-asr-streaming-multilingual-0.6b-1120ms-onnx-int8
- Bundle de origen: https://huggingface.co/csukuangfj2/sherpa-onnx-nemotron-3.5-asr-streaming-0.6b-1120ms-int8-2026-06-11
- Modelo de origen (NVIDIA): https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1.1
- Instrucciones oficiales de despliegue multilingue sherpa-onnx: https://k2-fsa.github.io/sherpa/onnx/nemo/nemotron-streaming.html
- Variante de 80 ms: https://huggingface.co/Lorqa/nemotron-3.5-asr-streaming-multilingual-0.6b-80ms-onnx-int8
- Variante de 320 ms Core ML: https://huggingface.co/Lorqa/nemotron-3.5-asr-streaming-multilingual-0.6b-320ms-coreml
- Despliegue autoalojado de referencia: https://github.com/tehtommeh/nemotron-asr-streaming
