# sairaph-official/granite-4.1-3b-6ce8963-int8

## Resumen

Granite-4.1-3B es un modelo de lenguaje denso de 3.400 millones de parametros desarrollado por IBM, publicado originalmente en abril de 2026 bajo licencia Apache 2.0. Esta ficha concreta no es el modelo original, sino una conversion al formato LiteRT-LM (`.litertlm`) realizada por la comunidad `litert-community` y replicada sin modificaciones por `sairaph-official` para su uso en la aplicacion LLM Server. El objetivo de esta version es la inferencia en dispositivo (on-device) en telefonos, tablets y portatiles, usando aceleracion GPU via Metal en Apple, OpenCL en Android y WebGPU en navegador.

El modelo base emplea una arquitectura transformer densa de 40 capas, dimension oculta de 2560, atencion con GQA en proporcion 40:8, embeddings atados y un vocabulario de 100.000 tokens. Esta pensado para contexto largo y uso de herramientas (tool calling), lo que lo hace util para asistentes locales que necesitan invocar funciones sin depender de la nube.

La relevancia de esta ficha reside en el empaquetado: el archivo `granite-4.1-3b_int8.litertlm` (3,83 GB) ofrece una ruta directa a inferencia cuantizada en int8 con delegacion completa de operaciones en GPU movil, algo poco habitual en modelos de este tamano. El coste en calidad es minimo: 87,0% en GSM8K frente al 88,0% de la referencia en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), 40 capas, hidden 2560, GQA 40:8, embeddings atados |
| Parametros totales | 3.400 millones (3,4B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (presupuesto KV del bundle LiteRT-LM); contexto nativo del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int8 dinamico en lineales y embeddings (este archivo); int4 blockwise-32 + OCTAV en lineales con embedding int8 (archivo hermano) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); tamano del archivo 3.831.840.768 bytes, sha256 `800dfc33fa4ca0572b1aa29b34b53a1c474998b22c08d060a05a26a168e369c3` |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso de 3,4B parametros con 40 capas, dimension oculta de 2560 y atencion con query grouping 40:8 (40 cabezas de query, 8 de clave/valor), lo que reduce el coste de KV cache. Usa embeddings atados entre entrada y salida y un vocabulario de 100.000 tokens, disenado para eficiencia multilingue y de codigo. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion de esta ficha no esta en el modelo sino en el empaquetado LiteRT-LM: el bundle incluye tokenizer, marcadores de rol de Granite (`<|start_of_role|>…<|end_of_role|>`) y seis firmas de prefill (1024, 256, 64, 16, 4 y 1 tokens). La reduccion de once a seis firmas es deliberada: cada firma exportada consume memoria del motor aunque no se invoque, y una build de once firmas fue terminada por iOS durante la inicializacion de Metal si la app limitaba el contexto a 1024. La cuantizacion int8 es dinamica sobre lineales y embeddings, con delegacion completa de las 1784 operaciones a la GPU en los dispositivos probados.

## Capacidades

- Generacion de texto conversacional y de instrucciones en formato chat con marcadores de rol.
- Razonamiento aritmetico de varios pasos: 87,0% en GSM8K con int8 en LiteRT (greedy, 0-shot chain-of-thought, n=100).
- Soporte de tool calling y function calling, segun la model card del modelo base.
- Capacidad de contexto largo dentro del presupuesto de 4096 tokens del bundle.
- Inferencia on-device con delegacion completa en GPU (Metal, OpenCL, WebGPU).
- Ejecucion en navegador mediante el demo Web de LiteRT-LM con WebGPU.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes locales en movil sin conexion: el bundle se ejecuta integramente en el dispositivo con LiteRT-LM ≥ 0.16, de modo que un asistente de notas o de respuesta rapida puede funcionar sin enviar datos a la nube. En un Galaxy S26 alcanza 9,5 tok/s de decode con 1,35 s de TTFT.
- Automatizacion de tareas con tool calling en apps Android: el modelo base soporta function calling, por lo que se puede usar para interpretar la intencion del usuario y emitir llamadas estructuradas a APIs locales (calendario, contactos, ficheros) dentro de una app nativa.
- Procesamiento de documentos en portatiles Apple: con 32,7 tok/s de decode y 743 tok/s de prefill en un M4 Max, es viable resumir correos, articulos o transcripciones de hasta 4096 tokens en local sin coste de API.
- Chat web embebido sin backend: el demo oficial carga el archivo int4 (2,19 GB) y ejecuta con WebGPU en el navegador, lo que permite ofrecer una demo publica de un asistente sin infraestructura de servidor.
- Clasificacion y extraccion de informacion en el edge: para pipelines de etiquetado de texto o extraccion de campos en dispositivos de gama media (Pixel 8a: 3,9 tok/s decode), el modelo cabe en memoria y no requiere red.
- Prototipado de agentes multi-paso en local: con contexto de 4096 tokens y soporte de roles, se puede construir un bucle de razonamiento y accion sobre herramientas del sistema en una maquina de sobremesa con GPU integrada.
- Educacion y tutoria offline: la capacidad aritmetica verificada (87% en GSM8K) permite usarlo como tutor de matematicas basico en entornos sin conectividad.

## Benchmarks y rendimiento

Calidad en GSM8K (greedy, 0-shot chain-of-thought, max-tokens 512, n=100, mismo harness):

| Configuracion | GSM8K |
|---|---|
| PyTorch bf16 (referencia, MPS) | 88,0% |
| LiteRT int8 (este archivo) | 87,0% |
| LiteRT int4 (archivo hermano) | 84,0% |

Rendimiento en Apple M4 Max con `litert-lm benchmark` (litert-lm 0.16.0, `-p 256 -d 256 --cache no`):

| Archivo | Backend | Prefill (256) | Decode | TTFT | Init |
|---|---|---|---|---|---|
| int8 | GPU (Metal) | 1221 tok/s | 71,8 tok/s | 0,24 s | 5,19 s |
| int8 | CPU | 257 tok/s | 20,5 tok/s | 3,06 s | no disponible |
| int4 | GPU (Metal) | 1241 tok/s | 86,3 tok/s | 0,23 s | 5,96 s |
| int4 | CPU | 104 tok/s | 22,0 tok/s | 3,01 s | 12,5 s |

Rendimiento en dispositivo (edge-compat, LiteRT-LM 0.16.0, GPU, archivo int8):

| Dispositivo | Decode | Prefill | TTFT | Ops delegadas |
|---|---|---|---|---|
| Galaxy S26 | 9,5 tok/s | 162 tok/s | 1,35 s | 1784/1784 |
| Pixel 8a | 3,9 tok/s | 15 tok/s | 1,36 s | 1784/1784 |
| Mac M4 Max | 32,7 tok/s | 743 tok/s | 399 ms | no disponible |

Consumo de memoria en Galaxy S26: 1476 MiB de pico para int8, frente a 1394 MiB para int4. Correccion: 8/8 en una prueba de cordura de 8 preguntas en CPU y GPU de Mac y en Metal de iPhone 17 Pro (7/8 en CPU del iPhone).

## Requisitos de hardware

- VRAM/RAM estimada: 1476 MiB de pico en Galaxy S26 para int8; 1394 MiB para int4. El archivo int8 ocupa 3,83 GB en disco y el int4 2,19 GB.
- GPU recomendadas: GPU integradas Apple (Metal) en M4 Max y superiores; GPU Adreno en Galaxy S26; GPU Mali/Imagination en Pixel 8a con OpenCL; WebGPU en navegador.
- Cabe en GPU de consumo: si, en moviles de gama alta y media-alta (Galaxy S26, Pixel 8a, iPhone 17 Pro) y en Mac con Apple Silicon. En GPU de escritorio dedicadas no se documenta soporte en la informacion proporcionada.
- Opciones de despliegue: LiteRT-LM ≥ 0.16 mediante CLI (`litert-lm run`), demo web con WebGPU y la app LLM Server de Sairaph. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este formato.
- Latencia y throughput: ver tabla de benchmarks. En movil, decode entre 3,9 y 9,5 tok/s y TTFT de 1,35-1,36 s; en M4 Max, decode de 71,8 tok/s y TTFT de 0,24 s con int8 en Metal.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Formato on-device |
|---|---|---|---|---|---|
| granite-4.1-3b int8 (esta ficha) | 3,4B | 4096 (bundle) | 87,0% | Apache 2.0 | LiteRT-LM |
| granite-4.1-3b int4 (hermano) | 3,4B | 4096 (bundle) | 84,0% | Apache 2.0 | LiteRT-LM |
| granite-4.1-3b PyTorch bf16 (referencia) | 3,4B | no disponible | 88,0% | Apache 2.0 | safetensors (formato inferido) |
| Otros modelos de ~3B on-device | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos comparativos con otros modelos de la misma categoria (por ejemplo, alternativas de 3B en formato LiteRT-LM o GGUF), por lo que la comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- Contexto efectivo limitado a 4096 tokens en este bundle; superar ese presupuesto requiere gestion de KV o truncado por parte de la aplicacion.
- La cuantizacion int8 pierde 1 punto en GSM8K frente a bf16 (87,0% frente a 88,0%); el int4 pierde 4 puntos (84,0%).
- El formato `.litertlm` solo es compatible con el runtime LiteRT-LM ≥ 0.16; no se puede cargar en vLLM, llama.cpp, Ollama ni TGI.
- El bundle incluye seis firmas de prefill por una razon de memoria: builds con mas firmas pueden provocar el cierre de la app por parte de iOS durante la inicializacion de Metal.
- La ficha es un espejo no modificado de `litert-community/granite-4.1-3b`; el repositorio de Sairaph anade unicamente el archivo LICENSE de Apache 2.0, que el repositorio upstream no incluye.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones especificas en la informacion proporcionada; aplican los riesgos generales de un modelo de 3,4B.
- Idiomas soportados no documentados; no se garantiza calidad fuera del ingles sin validacion previa.
- Uso comercial permitido por Apache 2.0, pero conviene revisar las condiciones del modelo base de IBM y del runtime LiteRT-LM por separado.
- Los datos de rendimiento provienen de mediciones de la comunidad en dispositivos concretos; el throughput puede variar de forma significativa segun el hardware y la version del runtime.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/sairaph-official/granite-4.1-3b-6ce8963-int8
- Repositorio upstream LiteRT-LM: https://huggingface.co/litert-community/granite-4.1-3b
- Modelo base IBM: https://huggingface.co/ibm-granite/granite-4.1-3b
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Demo web en navegador: https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/granite-4.1-3b
- Registro de rendimiento int8: https://github.com/john-rocky/edge-compat/blob/main/cards/granite-4.1-3b-int8/CARD.md
- Registro de rendimiento int4: https://github.com/john-rocky/edge-compat/blob/main/cards/granite-4.1-3b-int4/CARD.md
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
