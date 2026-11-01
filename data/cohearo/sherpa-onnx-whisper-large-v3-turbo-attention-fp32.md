# cohearo/sherpa-onnx-whisper-large-v3-turbo-attention-fp32

## Resumen

`cohearo/sherpa-onnx-whisper-large-v3-turbo-attention-fp32` es una exportacion a ONNX del modelo `openai/whisper-large-v3-turbo` realizada por el autor cohearo para su uso con el runtime [sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx). Se trata de la variante fp32 (sin cuantizar) del pack int8 del mismo autor, y su rasgo diferencial es que el decodificador expone una cuarta salida, `cross_attention_weights`, que permite calcular marcas de tiempo a nivel de palabra mediante alignment heads y DTW. El modelo resuelve el problema del reconocimiento automatico del habla multilingue en despliegues locales o de escritorio, sin depender de servicios en la nube.

El paquete esta pensado explicitamente para ejecucion en GPU mediante execution providers de ONNX Runtime; el autor advierte de que usar fp16 produce resultados incorrectos. Se distribuye como un conjunto de cuatro ficheros (encoder ONNX con pesos externos, decoder ONNX y vocabulario de tokens) que suman aproximadamente 3,2 GB, coherente con los 809 millones de parametros del modelo Whisper large-v3-turbo original.

Su relevancia actual radica en que ofrece una via practica para integrar un ASR de alta calidad y con timestamps por palabra en aplicaciones de escritorio, manteniendo la licencia MIT del modelo original de OpenAI y evitando la cuantizacion cuando se dispone de GPU suficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), exportado a ONNX |
| Parametros totales | 809 M (heredados de openai/whisper-large-v3-turbo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | fp32 (este pack); existe un pack int8 del mismo autor |
| Idiomas soportados | multilingue (segun etiqueta del repositorio) |
| Licencia | MIT |
| Formato de pesos | ONNX (encoder con pesos externos en `.weights`, decoder en un unico `.onnx`) y vocabulario `tokens.txt` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3-turbo: un transformer encoder-decoder con atencion estandar, en el que el encoder procesa espectrogramas Mel de audio y el decoder genera tokens de texto de forma autorregresiva. La variante turbo reduce el numero de capas del decoder respecto a large-v3, lo que baja el total a 809 millones de parametros y acelera la inferencia. No se ha realizado entrenamiento adicional en esta exportacion: los pesos proceden directamente del checkpoint de OpenAI.

La innovacion tecnica de este repositorio es la exportacion con salida de atencion cruzada. El decoder ONNX devuelve cuatro salidas: `logits`, `out_n_layer_self_k_cache`, `out_n_layer_self_v_cache` y `cross_attention_weights`. Las cabezas de alineamiento utilizadas son `2:4, 2:11, 3:3, 3:6, 3:11, 3:14`, leidas del checkpoint original, y junto con DTW permiten derivar timestamps a nivel de palabra. La exportacion se realizo con Python 3.12.3, torch 2.14.0+cpu, openai-whisper 20250625, onnx 1.23.0 y onnxruntime 1.24.4, usando los scripts `export-onnx-with-attention.py` y `export_onnx.py` de sherpa-onnx con el exportador legacy de torch (`dynamo=False`) y sin el paso de cuantizacion int8. No se documenta en la informacion disponible ningun proceso de RLHF o DPO especifico de esta exportacion.

## Capacidades

- Reconocimiento automatico del habla multilingue a partir de audio.
- Generacion de marcas de tiempo a nivel de palabra mediante atencion cruzada, alignment heads y DTW.
- Ejecucion local en GPU a traves de ONNX Runtime y sherpa-onnx, sin llamadas a servicios externos.
- Integracion con el ecosistema sherpa-onnx, que aporta deteccion de actividad de voz, segmentacion y otras utilidades alrededor del modelo.
- Compatibilidad de nombres de entrada y salida con el pack int8 del mismo autor, lo que facilita alternar entre precisiones.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision ni audio mas alla del propio ASR.

## Casos de uso

- Subtitulado automatico con sincronizacion precisa: la salida `cross_attention_weights` permite generar subtitulos con timestamps por palabra, adecuados para formatos como SRT o WebVTT con resaltado tipo karaoke.
- Transcripcion de reuniones y entrevistas: el caracter multilingue del modelo permite procesar audio en varios idiomas y producir transcripciones alineadas temporalmente para su posterior indexacion.
- Aplicaciones de escritorio de dictado: el pack esta disenado para el ejecutable de Cohearo y para despliegues locales en GPU, de modo que el audio del usuario no sale del equipo.
- Busqueda y recuperacion sobre archivos de audio: los timestamps por palabra permiten mapear consultas de texto a fragmentos concretos de una grabacion y construir indices navegables.
- Generacion de subtitulos en pipelines de video: al ejecutarse sobre ONNX Runtime con execution providers de GPU, puede integrarse en procesos por lotes de transcripcion y alineacion sin depender de APIs externas.
- Accesibilidad: transcripcion en tiempo casi real de contenido audiovisual con marcas temporales que facilitan la lectura sincronizada para personas con discapacidad auditiva.
- Analisis de llamadas o grabaciones de atencion al cliente: la transcripcion con timestamps permite auditar segmentos concretos y asociar intervenciones a hablantes tras un paso de diarizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el pack fp32 ocupa unos 3,2 GB en disco (encoder con pesos externos de 2,6 GB y decoder de 636 MB); en ejecucion en GPU conviene prever margen adicional para activaciones y buffers de ONNX Runtime, por lo que se recomienda al menos 6-8 GB de VRAM.
- GPU recomendadas: tarjetas con soporte de execution providers de ONNX Runtime (CUDA o similar), como A100, H100, RTX 4090 o RTX 3090; el autor no detalla una lista cerrada.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM; no se recomienda fp16 porque, segun el autor, produce resultados incorrectos.
- Opciones de despliegue: sherpa-onnx con ONNX Runtime; el pack esta pensado para GPU, no para ejecucion en CPU.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Timestamps por palabra | Licencia | Formato |
|---|---|---|---|---|---|
| cohearo/sherpa-onnx-whisper-large-v3-turbo-attention-fp32 | 809 M | no disponible | Si (atencion cruzada + DTW) | MIT | ONNX fp32 |
| cohearo/sherpa-onnx-whisper-large-v3-turbo-attention-int8 | 809 M | no disponible | Si (atencion cruzada + DTW) | MIT | ONNX int8 |
| openai/whisper-large-v3-turbo | 809 M | no disponible | No de forma nativa en el checkpoint | MIT | PyTorch safetensors |

## Limitaciones y advertencias

- El autor advierte explicitamente de que el modelo no debe ejecutarse en fp16: produce resultados incorrectos. Debe usarse fp32 con execution providers de GPU.
- Es un pack orientado a GPU; su uso en CPU no esta contemplado por el autor y el rendimiento no esta documentado.
- Al ser una exportacion ONNX, los hashes de los ficheros estan fijados y una re-exportacion no garantiza resultados identicos a nivel de bytes.
- Los sesgos y riesgos de alucinacion son los del checkpoint original de Whisper large-v3-turbo; no se documentan evaluaciones especificas en esta informacion.
- La cobertura de idiomas se declara como multilingue sin lista detallada ni metricas por idioma.
- La licencia MIT permite uso comercial, pero conviene conservar la atribucion a OpenAI por los pesos y a Xiaomi Corp. y Posit Software, PBC por los scripts de exportacion de sherpa-onnx (Apache-2.0).
- El repositorio no registra descargas ni likes y fue creado en octubre de 2026, por lo que su validacion por parte de la comunidad es limitada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cohearo/sherpa-onnx-whisper-large-v3-turbo-attention-fp32
- Pack int8 del mismo autor: https://huggingface.co/cohearo/sherpa-onnx-whisper-large-v3-turbo-attention-int8
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Runtime sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Aplicacion de escritorio Cohearo: https://cohearo.com
