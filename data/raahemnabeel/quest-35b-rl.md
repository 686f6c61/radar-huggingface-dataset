# raahemnabeel/quest-35b-rl

## Resumen

QUEST-35B-RL es un modelo de lenguaje de tipo *deep-research agent* desarrollado por el grupo OSU NLP (Ohio State University) y publicado originalmente en el repositorio `osunlp/QUEST-35B-RL`. Se trata de un ajuste fino de Qwen3.5-35B-A3B, un transformer de mezcla de expertos (MoE) con 35 000 millones de parametros totales y 3000 millones activos por token, entrenado mediante *mid-training*, SFT y aprendizaje por refuerzo sobre tareas de investigacion sinteticas. El modelo combinа atencion lineal Gated DeltaNet con atencion completa con compuertas a lo largo de 40 capas, e incorpora un codificador de vision.

La ficha que nos ocupa, `raahemnabeel/quest-35b-rl`, no es un nuevo modelo sino un paquete de despliegue publicado con `tt-model-manager` 0.1.0 (esquema de manifiesto 5.1) para ejecutar los pesos originales sobre hardware Tenstorrent (p100, p150, p150x2, p150x4, p300 y p300x2). El checkpoint se utiliza tal cual se publico; los pesos de los expertos se convierten a menor precision en el momento de la carga. El paquete expone un servidor compatible con la API de OpenAI en el puerto 20000.

Su relevancia actual radica en que permite ejecutar un agente de investigacion de 35 000 millones de parametros con 262 144 tokens de contexto sobre aceleradores Tenstorrent, una alternativa a las GPU convencionales, manteniendo licencia Apache 2.0 y soporte de *tool calling*, modo de razonamiento y entrada de imagenes en los perfiles de dos y cuatro *dies*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido: 40 capas que combinan Gated DeltaNet (atencion lineal) con atencion completa con compuertas; incluye codificador de vision |
| Parametros totales | 35 000 millones (35B) |
| Parametros activos | 3000 millones (3B) por token |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | Los pesos de los expertos se convierten a menor precision al cargar; en el perfil `p150` (un solo die) los expertos enrutados se sirven en bfp4. No se detallan otros formatos en la informacion disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos originales de `osunlp/QUEST-35B-RL` en el commit `cfe1bd34132816e76bbbd338cddfcef8ba289c1c`; el paquete se distribuye como imagen Docker con manifiesto de `tt-model-manager` |
| Hardware soportado | Tenstorrent p100, p150, p150x2, p150x4, p300, p300x2 |
| Concurrencia maxima | 32 peticiones simultaneas (`max_num_seqs`) |
| Entrada multimodal | Hasta 4 imagenes por peticion (`image_url`), redimensionadas a un maximo de 4 MP; video no soportado |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-35B-A3B, un transformer de mezcla de expertos con 256 expertos, enrutamiento *top-8* mas un experto compartido, y 40 capas que alternan atencion lineal Gated DeltaNet con atencion completa con compuertas. Incorpora un codificador de vision que permite entrada de imagenes. Sobre esta base, OSU NLP aplico *mid-training*, ajuste supervisado (SFT) y aprendizaje por refuerzo (RL) sobre tareas de investigacion sinteticas, orientadas a agentes de busqueda y navegacion web.

El paquete de Tenstorrent no modifica los pesos: el checkpoint se usa tal como se publico y la conversion de precision de los pesos de los expertos ocurre en tiempo de carga del servidor. La inferencia se realiza con vLLM sobre el backend de Tenstorrent, con un plugin especifico (`vllm-plugin`). El razonamiento se separa del contenido mediante el parser `qwen3`, y las llamadas a herramientas se emiten en formato XML de Qwen (`qwen3_xml`) y se parsean a `tool_calls`. No se detallan en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion del dataset.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento activado por defecto (`reasoning` separado de `content`).
- Investigacion profunda (*deep research*): entrenado para manejar herramientas de busqueda y de descarga de paginas web.
- *Tool calling* / *function calling* en formato OpenAI `tools`, con respuesta en `tool_calls` y `finish_reason: tool_calls`.
- Razonamiento multi-paso y uso como agente autonomo.
- Entrada multimodal de imagenes (hasta 4 por peticion, maximo 4 MP) en los perfiles de dos y cuatro *dies*; en un solo die, solo texto.
- Contexto largo de 262 144 tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`, `/v1/completions`, `/v1/models`).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- **Agentes de investigacion web automatizada**: el modelo fue entrenado especificamente para conducir herramientas de busqueda y de obtencion de paginas, por lo que puede orquestar flujos de recopilacion y sintesis de informacion con contexto de hasta 262 144 tokens.
- **Atencion al cliente con contexto largo**: la ventana de 262 144 tokens permite mantener historiales de conversacion extensos y adjuntar documentacion de producto sin truncar, con hasta 32 usuarios concurrentes por instancia.
- **Analisis de documentos con imagenes**: en los perfiles `p300`, `p300x2`, `p150x2` y `p150x4` admite hasta 4 imagenes por peticion, util para extraer informacion de capturas, diagramas o formularios junto con texto.
- **Asistente de razonamiento con *tool calling***: integrable en pipelines que requieran llamadas a funciones externas (APIs, bases de datos) mediante el formato OpenAI `tools`, con el razonamiento separado en el campo `reasoning`.
- **Despliegue en infraestructura Tenstorrent**: organizaciones que ya operan aceleradores p100, p150 o p300 pueden servir el modelo con `tt serve raahemnabeel/quest-35b-rl` sin depender de GPU NVIDIA.
- **Prototipado de agentes multi-paso**: el modo de pensamiento por defecto y la separacion de `reasoning` facilitan la depuracion de cadenas de razonamiento en aplicaciones de agentes.
- **Procesamiento por lotes de consultas de investigacion**: con 32 peticiones concurrentes y un rendimiento agregado de hasta 577 tok/s de salida en el perfil `p300x2`, es viable para cargas de trabajo por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision en la informacion disponible para este paquete; la model card indica que las puntuaciones de OSU NLP (BrowseComp, GAIA, HLE con herramientas y otros benchmarks de investigacion profunda) estan en la model card original. Se reproducen a continuacion los datos de rendimiento de inferencia publicados.

Rendimiento en `p300x2` (cuatro *dies*), benchmark de tokens aleatorios de vLLM con `ignore_eos`, medianas, una peticion por usuario:

| Usuarios | Tokens entrada / salida | TTFT (ms) | TPOT (ms) | tok/s por usuario | tok/s salida total |
|---:|---:|---:|---:|---:|---:|
| 1 | 128 / 128 | 121 | 4,6 | 217 | 181 |
| 1 | 1024 / 256 | 233 | 4,7 | 214 | 179 |
| 1 | 4096 / 256 | 656 | 4,8 | 208 | 141 |
| 1 | 32 768 / 256 | 2719 | 5,2 | 191 | 63 |
| 8 | 128 / 128 | 1165 | 9,7 | 103 | 425 |
| 8 | 1024 / 256 | 1998 | 10,0 | 100 | 451 |
| 32 | 1024 / 256 | 7402 | 26,6 | 38 | 577 |

Texto real en `p300x2` (12 prompts de chat x 384 tokens de salida, temperatura 0): 216 tok/s en un solo usuario.

Rendimiento en `p300` (dos *dies*), mismas condiciones:

| Usuarios | Tokens entrada / salida | TTFT (ms) | TPOT (ms) | tok/s por usuario | tok/s salida total |
|---:|---:|---:|---:|---:|---:|
| 1 | 128 / 128 | 134 | 7,9 | 126 | 112 |

Texto real en `p300` (12 prompts de chat x 384 tokens de salida, temperatura 0): 126 tok/s en un solo usuario, aproximadamente el 60 % de la velocidad de un solo usuario en el perfil de cuatro *dies*.

## Requisitos de hardware

- Hardware especifico Tenstorrent: p100, p150, p150x2, p150x4, p300 o p300x2. No se contempla ejecucion en GPU NVIDIA ni en CPU en la informacion disponible.
- Perfiles de servicio: `p300x2` (cuatro *dies*, el mas rapido, texto e imagenes), `p150x4` (equivalente en cuatro placas p150), `p300` (por defecto, dos *dies*, texto e imagenes, ~60 % de la velocidad de cuatro *dies*), `p150x2` (equivalente en dos placas p150), `p150` (un die, solo texto, expertos enrutados en bfp4) y `p100` (equivalente en una p100).
- Todos los perfiles soportan 32 secuencias concurrentes y 262 144 tokens de contexto.
- Despliegue: `tt serve raahemnabeel/quest-35b-rl` (requiere Tenstorrent CLI `tt` y Docker) o `tt-model serve raahemnabeel/quest-35b-rl`. El primer arranque compila kernels para el dispositivo, lo que tarda varios minutos.
- VRAM estimada en GPU: no disponible (no es un objetivo de despliegue de este paquete).
- No cabe en GPU de consumo: el paquete esta disenado exclusivamente para aceleradores Tenstorrent.
- Latencia y throughput: ver la seccion de benchmarks (TTFT de 121 ms y 217 tok/s por usuario en `p300x2` con 128/128 tokens; 38 tok/s por usuario con 32 usuarios concurrentes).

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Hardware de este paquete | Notas |
|---|---|---|---|---|---|
| `raahemnabeel/quest-35b-rl` (este paquete) | 35B / 3B | 262 144 | Apache 2.0 | Tenstorrent p100-p300x2 | Paquete de despliegue; pesos identicos a osunlp/QUEST-35B-RL |
| `osunlp/QUEST-35B-RL` | 35B / 3B | 262 144 | Apache 2.0 | No especificado (checkpoint original) | Modelo original de OSU NLP; benchmarks de precision en su model card |
| Qwen3.5-35B-A3B | 35B / 3B | No disponible | No disponible | No disponible | Modelo base sobre el que se entreno QUEST-35B-RL |

No se dispone en la informacion proporcionada de datos de otros modelos comparables de la misma categoria con los que contrastar rendimiento.

## Limitaciones y advertencias

- El paquete no incluye configuracion de generacion: sin parametros de muestreo, se aplican los valores por defecto del modelo base en modo pensamiento (temperatura 1,0, top_p 0,95, top_k 20), y `top_k` esta limitado a 32.
- El modo de pensamiento esta activado por defecto; si el presupuesto de `max_tokens` se agota dentro del razonamiento, el campo `content` queda vacio. Es necesario asignar miles de tokens de salida o desactivar el pensamiento con `"chat_template_kwargs": {"enable_thinking": false}`.
- En el perfil de un solo die (`p150`/`p100`) solo hay entrada de texto y los expertos enrutados se sirven en bfp4, lo que puede afectar a la calidad.
- No se acepta entrada de video.
- Las imagenes se redimensionan a un maximo de 4 MP y se admiten como maximo 4 por peticion.
- El paquete sirve el modelo pero no incluye las herramientas de busqueda ni de descarga de paginas: el usuario debe aportarlas.
- No hay resultados de precision publicados para este paquete; las puntuaciones de referencia son las del modelo original de OSU NLP.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion o idiomas soportados en la documentacion proporcionada; al ser un modelo de investigacion entrenado con datos sinteticos, es previsible que herede los sesgos y limitaciones de su modelo base.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones del modelo base Qwen3.5-35B-A3B y de los pesos originales de OSU NLP.
- El primer arranque requiere compilacion de kernels (varios minutos) y descarga de la imagen Docker y de los pesos, que no estan incluidos en la imagen.

## Enlaces

- Paquete en HuggingFace: https://huggingface.co/raahemnabeel/quest-35b-rl
- Modelo original: https://huggingface.co/osunlp/QUEST-35B-RL
- Repositorio tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Prerrequisitos de Tenstorrent CLI: https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
- Commit de pesos referenciado: `cfe1bd34132816e76bbbd338cddfcef8ba289c1c` (en el repositorio de osunlp/QUEST-35B-RL)
