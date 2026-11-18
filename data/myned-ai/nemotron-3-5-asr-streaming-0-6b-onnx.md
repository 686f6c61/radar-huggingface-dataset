# myned-ai/nemotron-3.5-asr-streaming-0.6b-onnx

## Resumen

Nemotron 3.5 ASR Streaming 0.6B ONNX es una exportación reproducible y verificada por hash del checkpoint `nvidia/nemotron-3.5-asr-streaming-0.6b` de NVIDIA, publicada por el proyecto Voice Pipes (myned-ai). Se trata de un modelo de reconocimiento automático del habla (ASR) en streaming, basado en una arquitectura FastConformer con cabecera RNNT (transducer) y mecanismo cache-aware, lo que permite transcripción incremental con estado persistente entre fragmentos de audio. El modelo cubre más de 40 idiomas y locales, con condicionamiento de idioma por sesión y detección automática de idioma. Con 0,6 mil millones de parámetros, está pensado para despliegues en producción donde el coste por hora de audio y la latencia importan.

La aportación principal de esta variante no es un nuevo entrenamiento, sino un empaquetado orientado a pipelines de voz: un único tamaño de chunk de 320 ms (frente a los cinco que soporta el modelo original), pesos del encoder en FP16 con entradas y salidas en FP32, y la cabeza RNNT (decoder y joiner) en FP32 para preservar la paridad numérica token a token con la implementación de referencia. El repositorio ocupa unos 1,3 GB, lo que lo hace manejable para contenedores y despliegues autoalojados.

Es relevante ahora porque elimina la dependencia de un entorno NeMo/PyTorch para exportar el modelo y ofrece una fuente fijada, sin gating de token, para herramientas de CLI, builds de workers Docker y CI. Cada release pasa por comprobaciones de paridad ONNX frente a PyTorch y tests de identidad de tokens en Rust, y los SHA-256 de todos los ficheros quedan registrados en `SHA256SUMS`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer cache-aware con cabecera RNNT (transducer); exportacion ONNX |
| Parametros totales | 0,6 mil millones (segun nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (streaming por chunks de 320 ms; `lookahead = 3`, `frame_ms = 80.0`) |
| Tipos de cuantizacion | FP16 en pesos del encoder; FP32 en E/S y en decoder/joiner; no se documentan otras cuantizaciones |
| Idiomas soportados | 35 codigos declarados: en, es, de, fr, it, ar, ja, ko, pt, ru, hi, zh, vi, he, nl, cs, da, pl, no, sv, th, tr, bg, el, et, fi, hr, hu, lt, lv, ro, sk, uk, mt, sl (la model card indica 40+ idiomas/locales) |
| Licencia | OpenMDW 1.1 (`license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | ONNX con pesos externos (`.onnx` + `.onnx.data`); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es un FastConformer-RNNT cache-aware: un encoder Conformer con atencion eficiente y submuestreo de frames, acoplado a un decoder y un joiner de tipo transducer. El modo cache-aware implica que el encoder mantiene estado entre chunks, de forma que la transcripcion es incremental y no requiere reventanar el audio completo. El checkpoint original soporta cinco tamanos de chunk (80, 160, 320, 560 y 1120 ms), cada uno con su propio par de ficheros de pesos del encoder; esta exportacion incluye unicamente la configuracion de 320 ms, que el autor situa en el punto dulce de la curva latencia-precision.

Los datos de entrenamiento del modelo base, segun los datasets declarados, incluyen NVIDIA Granary, Multilingual LibriSpeech, FLEURS, Common Voice 8.0, VoxPopuli y Europarl. No se dispone en la informacion proporcionada del numero de horas de audio, la composicion exacta del dataset ni si hubo etapas de ajuste fino con RLHF/DPO (no aplicables de forma habitual en ASR). La innovacion tecnica de esta variante es el empaquetado: conversion de pesos del encoder a FP16 con un conversor seguro para ficheros de mas de 2 GiB (reduciendo el almacenamiento de ~2,4 GB a ~1,2 GB), E/S en FP32, y verificacion de paridad ONNX frente a PyTorch junto con tests de identidad de tokens. Los dos ficheros de pesos externos del encoder (`encoder_320ms_first_fp16.onnx.data` y `encoder_320ms_fp16.onnx.data`) son byte-identicos (1.228.512.000 bytes, SHA-256 `159887b78f1e36fd59f5cf17be810fd61e98a96b61673b6de0dbe2b8dfb47a31`); se incluyen ambos nombres porque ONNX Runtime resuelve los pesos externos por nombre de fichero.

## Capacidades

- Reconocimiento automatico del habla en streaming con chunks de 320 ms y estado cacheado entre fragmentos.
- Transcripcion multilingue en mas de 40 idiomas y locales, con 35 codigos de idioma declarados en la model card.
- Condicionamiento de idioma por sesion (per-session language conditioning).
- Deteccion automatica de idioma (LangID), usada en la evaluacion de referencia.
- Salida a nivel de token mediante decoder y joiner RNNT, con paridad token a token respecto a la implementacion de referencia.
- Ejecucion via ONNX Runtime, sin dependencia de NeMo ni de PyTorch en tiempo de inferencia.
- Integracion con el ecosistema Voice Pipes (CLI, workers Docker, scripts de descarga).
- No se documentan en la informacion disponible capacidades de diarizacion, puntuacion automatica, marcas de tiempo por palabra, tool calling ni agentes.

## Casos de uso

- Subtitulado en directo: el modelo procesa audio en chunks de 320 ms con estado cacheado, lo que permite emitir subtitulos con latencia baja y sin recortar el audio en segmentos independientes que perderian contexto acustico.
- Transcripcion de reuniones y llamadas: el condicionamiento de idioma por sesion permite fijar el idioma esperado al inicio de cada llamada y evitar derivas de deteccion en conversaciones con ruido o cambios de hablante.
- Atencion al cliente con analitica en tiempo real: al ejecutarse sobre ONNX Runtime y pesar ~1,3 GB, puede desplegarse en workers contiguos al servicio de telefonia para transcribir y clasificar llamadas sin enviar audio a terceros.
- Pipelines de voz autoalojados: la exportacion esta pensada explicitamente para builds de Docker y CI sin token de acceso ni entorno de exportacion NeMo, lo que simplifica la reproducibilidad de la imagen.
- Transcripcion multilingue de contenido audiovisual: con cobertura de 35 codigos de idioma (incluidos es, de, fr, it, pt, nl, pl, ru, uk, ar, hi, ja, ko, zh y vi) sirve para catalogos con material en varios idiomas sin cambiar de modelo.
- Investigacion en ASR en streaming: los ficheros con SHA-256 registrados y la paridad verificada frente a PyTorch permiten reproducir experimentos y comparar variantes de chunk size sobre una base fijada.
- Despliegue en el borde con aceleracion ONNX: al estar el encoder en FP16 y la E/S en FP32, encaja en entornos con GPU modesta o con EP de ONNX Runtime especifico del hardware.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados, `verified: false`), medidos sobre el checkpoint upstream con tamano de frame de 1,12 s y deteccion de idioma activada:

| Dataset | Config | Metrica | Valor |
|---|---|---|---|
| FLEURS | en_us, test | WER | 7,91 |
| FLEURS | es_419, test | WER | 4,11 |
| FLEURS | fr_fr, test | WER | 9,03 |
| FLEURS | de_de, test | WER | 8,31 |

No se han publicado en la informacion disponible resultados de benchmarks para la configuracion de 320 ms ni comparaciones con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: el encoder en FP16 ocupa ~1,2 GB de pesos; con activaciones y estado de cache, un presupuesto de 2-3 GB de VRAM es un punto de partida razonable (estimacion, no publicada por el autor).
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cualquier GPU con 4 GB o mas de memoria deberia poder alojar el modelo; no se documentan modelos concretos (A100, H100, RTX 4090, etc.).
- GPU de consumo: previsiblemente cabe en tarjetas consumer con 4-8 GB, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: ONNX Runtime (libreria principal del repo), Voice Pipes CLI y workers Docker, y el script `download_nemotron35.py` del proyecto. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM).
- Latencia y throughput: no disponibles. El unico dato de latencia estructural es el tamano de chunk de 320 ms con `lookahead = 3` y `frame_ms = 80.0`.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de modelos comparables (parametros, contexto, WER, licencia) para establecer una comparativa rigurosa. Como referencia estructural, el propio checkpoint upstream `nvidia/nemotron-3.5-asr-streaming-0.6b` es la alternativa directa: mismo modelo, en formato PyTorch/NeMo, con cinco tamanos de chunk y exportacion a cargo del usuario. Frente a el, esta variante ofrece un unico chunk de 320 ms, pesos del encoder en FP16, verificacion de paridad y hash, y disponibilidad sin gating de token, a cambio de renunciar a los otros cuatro tamanos de chunk.

| Modelo | Parametros | Formato | Chunks soportados | Licencia | Notas |
|---|---|---|---|---|---|
| myned-ai/nemotron-3.5-asr-streaming-0.6b-onnx | 0,6 B | ONNX (FP16 encoder, FP32 RNNT) | Solo 320 ms | OpenMDW 1.1 | Exportacion verificada, ~1,3 GB |
| nvidia/nemotron-3.5-asr-streaming-0.6b | 0,6 B | PyTorch/NeMo | 80, 160, 320, 560, 1120 ms | OpenMDW 1.1 | Checkpoint upstream, requiere entorno NeMo |
| Otros modelos ASR comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo se incluye la configuracion de 320 ms; si se necesita menor latencia (80 o 160 ms) o mayor precision (560 o 1120 ms) hay que recurrir al checkpoint upstream o a otra exportacion.
- Los resultados de WER publicados corresponden al checkpoint upstream con frame de 1,12 s y LangID, no a la configuracion de 320 ms exportada aqui; no deben atribuirse directamente a esta variante.
- Las metricas estan marcadas como no verificadas (`verified: false`) y proceden del propio autor.
- No se documentan sesgos conocidos, tasas de alucinacion ni comportamiento especifico por idioma mas alla del WER en cuatro idiomas.
- La licencia es OpenMDW 1.1 (`license: other`), no Apache-2.0; conviene revisar sus terminos antes de uso comercial. Las herramientas de exportacion son Apache-2.0, pero la licencia del modelo es distinta.
- El decoder y el joiner se mantienen en FP32 por estabilidad numerica; no se ofrece una variante totalmente FP16 ni cuantizaciones INT8, lo que limita la reduccion de memoria en el borde.
- Los dos ficheros `.onnx.data` son identicos y suman ~2,4 GB en disco si se descargan por separado; el script de Voice Pipes los enlaza con hard-link, pero otras rutas de descarga pueden duplicar el almacenamiento.
- No se documentan marcas de tiempo por palabra, puntuacion ni diarizacion; si el pipeline las necesita, habra que anadirlas externamente.
- El modelo esta pensado para streaming; el comportamiento en transcripcion por lotes de audio largo no esta documentado en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/myned-ai/nemotron-3.5-asr-streaming-0.6b-onnx
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Proyecto Voice Pipes: https://github.com/myned-ai/voice-pipes
- Scripts de exportacion: https://github.com/myned-ai/voice-pipes/tree/main/scripts/nemotron35
- Script de descarga: https://github.com/myned-ai/voice-pipes/blob/main/voice-pipes/scripts/download_nemotron35.py
- Herramientas de exportacion (Apache-2.0): https://github.com/codavidgarcia/nemotron-3.5-asr-streaming-onnx
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
