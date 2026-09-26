# moeru-ai/sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20

## Resumen

El modelo `sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20` es un sistema de deteccion de palabras clave (keyword spotting, KWS) basado en un transductor Zipformer. No es un modelo de lenguaje generativo, sino un detector de wake words en tiempo real para chino mandarin e ingles. Lo publica el usuario `moeru-ai` como empaquetado para [Sherpaw](https://github.com/moeru-ai/sherpaw), una capa de ejecucion en WebAssembly pensada para llevar modelos de voz al navegador y a entornos ligeros.

El modelo original lo desarrollo `pkufool` (publicado en ModelScope como `icefall-kws-zipformer-zh-en-3M-2025-12-20`) y se distribuye sin modificaciones desde la release oficial de [sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx): pesos fp32, chunk-16 y left-context-64. El repositorio de HuggingFace no contiene el modelo entrenado en si, sino un paquete precompilado para su uso con el runtime KWS en WASM, con cuatro ficheros virtuales (`encoder.onnx`, `decoder.onnx`, `joiner.onnx` y `tokens.txt`).

Es relevante porque demuestra un flujo de despliegue de KWS streaming en el navegador sin GPU: el paquete ocupa 13.076.183 bytes, se empaqueta con Emscripten 4.0.23 y esta pensado para integrarse via `@sherpaw/preloader` y `@sherpaw/kws`. El repositorio no incluye grabaciones de audio ni vocabulario de palabras clave, por lo que el desarrollador debe aportar ambos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor Zipformer (encoder-decoder-joiner), streaming KWS, chunk-16, left-context-64, fp32 |
| Parametros totales | Aproximadamente 3 millones (indicado en el nombre del modelo; no confirmado en la documentacion disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | left-context-64 (ventana de contexto izquierdo en frames de streaming) |
| Tipos de cuantizacion | Solo fp32 (upstream fp32, sin cuantizacion) |
| Idiomas soportados | Chino mandarin (zh) e ingles (en); el japones figura como no verificado |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder.onnx`, `decoder.onnx`, `joiner.onnx`) y `tokens.txt`; empaquetado en WASM (`preload.data`, `preload.js`, `preload.js.metadata`) |

## Arquitectura y entrenamiento

La arquitectura es un transductor Zipformer, un modelo encoder-decoder-joiner tipico de reconocimiento y deteccion de voz, configurado aqui para KWS con un chunk de 16 y un left-context de 64. Se trata de un modelo de streaming: procesa audio de forma incremental, lo que lo hace adecuado para deteccion continua de palabras clave con latencia baja.

Este repositorio no realiza ningun entrenamiento, conversion de formato, cuantizacion ni compilacion de palabras clave. Los pesos y los tokens provienen de la release oficial de sherpa-onnx, y el proceso de construccion (`build.sh` con Docker) se limita a verificar el SHA-256 de cada fichero fuente con `download.sh` y a empaquetar con el file packager de Emscripten 4.0.23 (`pack.sh`). El `manifest.json` del paquete registra los hashes de los artefactos.

## Capacidades

- Deteccion de palabras clave (keyword spotting) en audio mono PCM en tiempo de streaming.
- Soporte de palabras clave en chino mandarin e ingles.
- Ejecucion sobre runtime ONNX y despliegue en WebAssembly mediante Sherpaw.
- Funcionamiento en tiempo real con chunk pequeno (chunk-16) y contexto izquierdo de 64 frames.
- Integracion via API de Sherpaw: `loadData` de `@sherpaw/preloader` y creacion del keyword spotter de `@sherpaw/kws` a partir de los nombres de fichero virtuales.
- No incluye modelo de lenguaje, tool calling, agentes, vision ni audio generativo: su unica funcion es la deteccion de activacion.
- No incorpora vocabulario de palabras clave; el consumidor debe aportar sus propias palabras y umbrales.

## Casos de uso

- Activacion por voz en aplicaciones web: integrado como WebAssembly en el navegador, el modelo escucha audio del microfono y dispara una accion al detectar una wake word concreta en chino o ingles, sin necesidad de backend ni GPU.
- Asistentes de voz embebidos: en dispositivos con recursos limitados (Raspberry Pi, dispositivos IoT) sirve como etapa de activacion previa a un reconocedor de voz completo, reduciendo el consumo energetico al no procesar audio continuo.
- Kioscos y terminales interactivos: deteccion de frases de activacion para iniciar sesion de usuario en pantallas publicas o puntos de atencion.
- Automatizacion del hogar: activacion de rutinas por comando de voz local, manteniendo el audio en el dispositivo en lugar de enviarlo a la nube.
- Aplicaciones de accesibilidad: control por voz de interfaces para usuarios con movilidad reducida, con la palabra clave configurable por el propio usuario.
- Filtrado previo en pipelines de ASR: uso como primera etapa para despertar un sistema de reconocimiento mas pesado solo cuando se detecta la palabra clave, reduciendo costes de computo.
- Telemetria y control industrial: activacion manos libres en entornos donde el operario no puede tocar un panel, con procesamiento local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte ademas que las detecciones de ejemplo del upstream no establecen precision para palabras de activacion arbitrarias.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el paquete completo ocupa 13.076.183 bytes (unos 13 MB) y esta pensado para ejecucion en CPU.
- GPU recomendadas: no aplica; el modelo esta orientado a CPU y a WebAssembly en el navegador.
- Compatibilidad con GPU de consumo: irrelevante dado su tamano; puede ejecutarse en hardware de gama baja sin acelerador dedicado.
- Opciones de despliegue: runtime KWS de Sherpaw en WebAssembly (con el runtime WASM KWS construido por separado), y por procedencia, el ecosistema sherpa-onnx sobre ONNX Runtime.
- Latencia y throughput estimados: no disponible en la informacion proporcionada; la configuracion chunk-16 y left-context-64 esta disenada para baja latencia en streaming.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad | Formato |
|---|---|---|---|---|---|---|
| moeru-ai/sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20 | ~3 M | left-context-64 | zh, en | Apache-2.0 | HuggingFace (paquete WASM) | ONNX + WASM |
| pkufool/icefall-kws-zipformer-zh-en-3M-2025-12-20 (original) | ~3 M | left-context-64 | zh, en | Apache-2.0 | ModelScope | Pesos upstream |
| Otros modelos KWS de la release sherpa-onnx | no disponible | no disponible | no disponible | no disponible | GitHub (release kws-models) | ONNX |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada. La diferencia principal entre las dos primeras filas es el empaquetado: este repositorio anade la capa de despliegue WASM de Sherpaw.

## Limitaciones y advertencias

- El rendimiento de deteccion depende de la pronunciacion, el ruido de fondo, el vocabulario elegido y los umbrales configurados, lo que afecta tanto a falsos negativos como a falsos positivos.
- Las detecciones de ejemplo del upstream no garantizan precision para palabras de activacion arbitrarias.
- El repositorio no incluye grabaciones de audio ni vocabulario de palabras clave; ambos debe aportarlos el usuario.
- El japones figura como no verificado en la model card.
- Los pesos son fp32; no se proporcionan variantes cuantizadas, lo que puede limitar despliegues extremadamente optimizados en algunos entornos.
- El paquete corresponde al runtime WASM de Sherpaw y requiere el runtime KWS WASM construido por separado, por lo que no es un artefacto autonomo.
- Se recomienda fijar el commit de HuggingFace al desplegar, ya que el `manifest.json` registra hashes de los artefactos.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar la procedencia de los pesos upstream y de las palabras clave que se anadan.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moeru-ai/sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20
- Sherpaw (repositorio): https://github.com/moeru-ai/sherpaw
- Release oficial de pesos sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx/releases/download/kws-models/sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20.tar.bz2
- Modelo original de pkufool en ModelScope: https://modelscope.cn/models/pkufool/icefall-kws-zipformer-zh-en-3M-2025-12-20
- Documentacion upstream de KWS de sherpa-onnx: https://k2-fsa.github.io/sherpa/onnx/kws/pretrained_models/index.html
