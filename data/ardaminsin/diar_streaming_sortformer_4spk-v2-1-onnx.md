# ardaminsin/diar_streaming_sortformer_4spk-v2.1-onnx

## Resumen

`ardaminsin/diar_streaming_sortformer_4spk-v2.1-onnx` es una conversion a ONNX del modelo `nvidia/diar_streaming_sortformer_4spk-v2.1` de NVIDIA, orientada a diarizacion de hablantes en streaming para un maximo de cuatro locutores. El autor del repo (ardaminsin) no entrena un modelo nuevo: exporta los pesos originales de NeMo a dos grafos ONNX (`mel.onnx` y `step.onnx`) que pueden ejecutarse tanto en `onnxruntime` nativo como en el navegador mediante `onnxruntime-web` con los execution providers `wasm` y `webgpu`.

El modelo consume audio mono a 16 kHz por fragmentos y emite, por cada frame de 10 ms, probabilidades de actividad por hablante. La logica de conversion de esas probabilidades en segmentos (onset/offset, umbrales, boosting de scores) queda en manos del consumidor, guiada por los hiperparametros publicados en `sortformer.json`. La arquitectura subyacente es la Sortformer de NVIDIA, un transformer con encoder, decoder y un mecanismo de estado compuesto por una cache de hablantes (`SPKCACHE_LEN=188`) y una cola FIFO (`FIFO_LEN=40`).

Su relevancia actual radica en que permite ejecutar diarizacion en tiempo real completamente en el cliente (navegador o dispositivo) sin depender de un backend Python/NeMo, lo que facilita integrarla en aplicaciones web de subtitulado, transcripcion o analitica de reuniones. La paridad numerica reportada frente a NeMo es muy alta (error absoluto maximo de 1,4e-06 en un bucle de streaming de 45 s).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sortformer (encoder/decoder transformer con cache de hablantes y FIFO de estado) exportado a ONNX, opset 18 |
| Parametros totales | no disponible (peso del grafo `step.onnx`: 492.255.963 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | streaming con estado: `CHUNK_LEN=340` frames, `CHUNK_RIGHT_CONTEXT=40`, `FIFO_LEN=40`, `SPKCACHE_LEN=188` frames (frames de 10 ms) |
| Tipos de cuantizacion | no disponible (el repo se publica como conversion ONNX sin indicar variantes cuantizadas) |
| Idiomas soportados | no disponible (la tarea es diarizacion, independiente del idioma) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | ONNX (`mel.onnx`, `step.onnx`) + `sortformer.json` con hiperparametros |

## Arquitectura y entrenamiento

El modelo base es la Sortformer streaming de NVIDIA para 4 hablantes, version v2.1 (revision `cd03eee90fbec18297ac31b8c21546e596b7f71c`). Se trata de un transformer con encoder y decoder que procesa caracteristicas log-mel de 128 bins (ventana 0,025 s, stride 0,01 s, normalizacion por caracteristica con estadisticas almacenadas en el checkpoint). El estado de streaming se compone de una cache de embeddings de hablantes (`SPKCACHE_LEN=188` frames, actualizada cada `SPKCACHE_UPDATE_PERIOD=300` frames) y una cola FIFO (`FIFO_LEN=40`), que se realimentan en cada llamada al grafo.

La exportacion a ONNX la realiza el script `scripts/export_sortformer.py` del repositorio `ber2minsin/subtitle-product`, con `nemo-toolkit` 3.0.0, `torch` 2.15.0+cpu, `onnx` 1.23.2 y `onnxruntime` 1.31.1. El grafo `step.onnx` se exporta con ejes dinamicos en la longitud del chunk, la cache de hablantes, la FIFO y las salidas, de modo que una unica sesion soporta streams de longitud arbitraria. La innovacion principal respecto al checkpoint original no es arquitectonica sino de despliegue: el uso de opset 18 y de operaciones compatibles con `wasm` y `webgpu` permite ejecutar el modelo en el navegador. No se dispone de informacion sobre el dataset de entrenamiento, numero de tokens ni si hubo RLHF/DPO en la documentacion proporcionada.

## Capacidades

- Diarizacion de hablantes en streaming para hasta 4 locutores simultaneos.
- Salida de probabilidades de actividad por hablante y por frame (10 ms por frame).
- Mantenimiento de estado entre llamadas (cache de hablantes y FIFO) para streams de duracion arbitraria.
- Front-end mel integrado en el grafo `mel.onnx` con normalizacion interna (no requiere estado externo).
- Ejecucion en navegador con ONNX Runtime Web (`wasm` y `webgpu`) y en `onnxruntime` nativo.
- No realiza transcripcion ni reconocimiento de voz: solo diarizacion (asignacion de segmentos a hablantes).
- No se documentan capacidades de tool calling, agentes, vision ni audio mas alla del pipeline de diarizacion.

## Casos de uso

- Subtitulado en tiempo real en el navegador: el modelo puede ejecutarse con `onnxruntime-web` sobre el audio del microfono, asignando cada fragmento a uno de los cuatro hablantes antes de pasarlo a un ASR separado. La ventana de chunk de 340 frames (3,4 s) y la FIFO de 40 frames permiten latencia baja.
- Analitica de reuniones en cliente: procesar el audio de una videollamada en el propio dispositivo para generar marcas de "quien habla cuando" sin enviar audio a un servidor, reduciendo requisitos de privacidad.
- Transcripcion con etiquetas de hablante en pipelines híbridos: usar la diarizacion local para segmentar y luego enviar solo los segmentos a un servicio de ASR en la nube, optimizando coste y ancho de banda.
- Herramientas de accesibilidad: identificar cambios de interlocutor en contenido pregrabado o en directo para resaltar visualmente al hablante activo en interfaces de videoconferencia.
- Investigacion en diarizacion: servir como referencia reproducible en ONNX para comparar implementaciones propias contra NeMo con la paridad documentada (error absoluto maximo de 1,4e-06 en 45 s de audio).
- Despliegue en dispositivos sin Python: al no requerir NeMo ni PyTorch en inferencia, puede integrarse en aplicaciones Electron, extensiones de navegador o backends ligeros basados en `onnxruntime`.
- Moderacion o monitorizacion de audio en directo: deteccion de multiples locutores en streams para activar alertas o cambiar de modo de captura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta comprobaciones de paridad numerica frente a NeMo:

| Comprobacion | Resultado |
|---|---|
| `mel.onnx` vs front-end mel de NeMo, error absoluto maximo | 9,727e-05 |
| Predicciones de hablante de `step.onnx` vs NeMo, error absoluto maximo | 2,146e-06 |
| Embedding de hablante vs NeMo, error relativo maximo | 3,680e-07 |
| Bucle de streaming completo de 45 s vs diarizacion streaming de NeMo, error absoluto maximo | 1,4e-06 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el grafo `step.onnx` ocupa 492.255.963 bytes (~470 MiB) y `mel.onnx` 135.261 bytes, por lo que la huella en memoria es del orden de cientos de MiB.
- GPU recomendadas: no especificadas. Al ser un modelo pequeno en comparacion con LLM, cualquier GPU con soporte de `onnxruntime` (por ejemplo, series RTX o A100/H100) puede ejecutarlo; el execution provider `webgpu` en navegador es una via documentada.
- Cabe en GPU consumer: si, dado el tamano de los grafos; no se publican cifras concretas de VRAM por modelo de GPU.
- Opciones de despliegue: `onnxruntime` nativo (CPU/GPU), `onnxruntime-web` con `wasm` y `webgpu`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a esta tarea).
- Latencia y throughput: no disponibles. El diseno por chunks de 340 frames (3,4 s) con contexto derecho de 40 frames sugiere una latencia de procesamiento por bloque en ese orden, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / estado | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ardaminsin/diar_streaming_sortformer_4spk-v2.1-onnx | no disponible (grafo `step.onnx` ~470 MiB) | Streaming con cache 188 frames + FIFO 40 frames | Diarizacion 4 hablantes, ONNX | NVIDIA Open Model License | Hugging Face, ONNX Runtime Web |
| nvidia/diar_streaming_sortformer_4spk-v2.1 | no disponible | Mismos hiperparametros de streaming | Diarizacion 4 hablantes, NeMo | NVIDIA Open Model License | Hugging Face (formato NeMo) |
| pyannote/speaker-diarization (referencia de la categoria) | no disponible | No streaming nativo en la version clasica | Diarizacion | Licencia propia de pyannote | Hugging Face / pip |

La comparativa se limita a estos porque no se dispone en la informacion proporcionada de datos de parametros, contexto ni rendimiento de alternativas. La diferencia clave de esta ficha frente a `nvidia/diar_streaming_sortformer_4spk-v2.1` es el formato: ONNX portable y ejecutable en navegador, con paridad numerica documentada.

## Limitaciones y advertencias

- Limite estricto de 4 hablantes simultaneos; no se documenta extension a mas locutores.
- Solo diarizacion: no transcribe, no identifica voces entre sesiones ni genera embeddings de hablante reutilizables mas alla de la cache interna.
- La conversion ONNX no aporta mejoras de calidad respecto al modelo base; cualquier sesgo o limitacion de `nvidia/diar_streaming_sortformer_4spk-v2.1` se hereda.
- Riesgo de confusion en solapamientos de voz, ruido o audio lejano no cuantificado en la informacion disponible.
- La licencia NVIDIA Open Model License condiciona el uso comercial y exige atribucion; debe revisarse el texto completo (`LICENSE` y `NOTICE` en el repo) antes de producción.
- El repo no publica variantes cuantizadas ni benchmarks de rendimiento; el rendimiento real en `webgpu` o `wasm` depende del navegador y del hardware del cliente.
- El autor del repo (ardaminsin) no es NVIDIA; la trazabilidad de la conversion depende del script de exportacion del repositorio `ber2minsin/subtitle-product`.
- No se documentan idiomas soportados; al ser diarizacion, el rendimiento puede degradarse en condiciones acusticas no cubiertas por el entrenamiento original, no detalladas aqui.

## Enlaces

- Hugging Face: https://huggingface.co/ardaminsin/diar_streaming_sortformer_4spk-v2.1-onnx
- Modelo base: https://huggingface.co/nvidia/diar_streaming_sortformer_4spk-v2.1
- Repositorio de exportacion: https://github.com/ber2minsin/subtitle-product
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
