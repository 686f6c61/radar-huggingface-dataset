# raahemnabeel/ornith-1.5-122b

## Resumen

Ornith-1.5-122B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por ornith-ai, con 122.000 millones de parametros totales y 10.000 millones activos por token. Emplea la arquitectura Qwen3.5-122B-A10B: 48 capas que combinan atencion lineal Gated DeltaNet con atencion completa con compuertas, 256 expertos con enrutamiento top-8 mas un experto compartido, y un codificador de vision integrado. Esta pensado como modelo de razonamiento (piensa antes de responder por defecto) con entrada de texto e imagen, soporte de tool calling y una ventana de contexto de 262.144 tokens.

El repositorio analizado, `raahemnabeel/ornith-1.5-122b`, no es el modelo original sino un paquete de despliegue para hardware Tenstorrent (placas p300x2 y p150x4), publicado con tt-model-manager 0.1.0 y manifest schema 5.1. Los pesos se toman del checkpoint original `ornith-ai/Ornith-1.5-122B` en la revision `7681ef608624e7532d8164128bcffdbdbaf1b1af`; el paquete aporta perfiles de servicio optimizados para vLLM sobre aceleradores Tenstorrent, con variantes para rafagas de peticiones cortas, contextos largos y modo solo texto.

Su relevancia actual reside en que demuestra el despliegue de un MoE de 122B con vision y contexto de 256K sobre hardware no-GPU (Tenstorrent), con una API compatible con OpenAI y perfiles de servicio ajustados a cargas concretas. La licencia MIT facilita su adopcion comercial, aunque la informacion publica sobre entrenamiento, datos y benchmarks propios es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido: 48 capas con Gated DeltaNet (atencion lineal) y atencion completa con compuertas; 256 expertos, top-8 mas experto compartido; arquitectura Qwen3.5-122B-A10B; codificador de vision |
| Parametros totales | 122.000 millones |
| Parametros activos | 10.000 millones por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible (el servidor convierte los pesos de expertos a menor precision al cargar; no se especifica el formato exacto) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible (repo de 8,1 GB; pesos descargados desde el checkpoint original en HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno Qwen3.5-122B-A10B: un transformer MoE de 48 capas que intercala atencion lineal Gated DeltaNet con atencion completa con compuertas, 256 expertos con enrutamiento top-8 y un experto compartido, lo que resulta en 10.000 millones de parametros activos por token sobre 122.000 millones totales. Incorpora un codificador de vision que permite entrada de imagenes (hasta 4 por peticion, redimensionadas a un maximo de 4 MP). El modelo esta disenado como modelo de razonamiento: genera un bloque de pensamiento separado del contenido final.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. La model card del paquete remite a la model card original de `ornith-ai/Ornith-1.5-122B` para los detalles de entrenamiento y evaluacion, pero esos datos no estan incluidos en la informacion proporcionada. La innovacion tecnica destacable del paquete es el despliegue sobre hardware Tenstorrent con perfiles de servicio especificos: prefijado en trozos de 4.096 tokens compartidos entre peticiones (perfil `longctx`), prefijado de hasta cuatro prompts de 512 tokens a la vez (perfil `burst`) y cache de prefijos con 32 puntos de reanudacion.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento activado por defecto (se puede desactivar por peticion con `chat_template_kwargs.enable_thinking: false`).
- Entrada multimodal: texto e imagenes (hasta 4 imagenes por peticion como partes `image_url`, redimensionadas a 4 MP maximo). No acepta video.
- Tool calling / function calling mediante parser `qwen3_xml`; las respuestas incluyen `tool_calls` y `finish_reason: tool_calls`.
- Razonamiento multi-paso y uso en agentes, orientado a coding agentico en terminal y trabajo sobre bases de codigo grandes.
- Separacion del texto de razonamiento (`reasoning`) del contenido final (`content`) mediante parser `qwen3`.
- Cache de prefijos activada por defecto con reanudacion en fronteras de 2.048 tokens.
- API compatible con OpenAI (chat completions, completions, `/v1/models`) en el puerto 20000.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Agentes de coding en terminal: el modelo esta disenado explicitamente para agentes que operan sobre bases de codigo grandes; su contexto de 262.144 tokens permite mantener varios ficheros y el historial de comandos en una sola ventana, y el tool calling permite invocar herramientas de shell y edicion.
- Asistentes interactivos con imagenes: con el perfil por defecto (`p300x2`) se pueden enviar hasta 4 imagenes por peticion junto a texto, util para soporte tecnico con capturas de pantalla o analisis de diagramas.
- Procesamiento por lotes de prompts cortos: el perfil `burst` prefija hasta cuatro prompts de 512 tokens simultaneamente, reduciendo el tiempo hasta el primer token de 6,3 s a 3,8 s en rafagas de 32 peticiones, adecuado para front-ends de chat y jobs por lotes.
- Analisis de documentos y codebases largos: el perfil `longctx` fragmenta el prefijado en bloques de 4.096 tokens compartidos entre peticiones, evitando que una peticion corta quede bloqueada detras de un prompt de 100.000 tokens.
- Servicio solo texto de alta concurrencia: el perfil `text` no carga el codificador de vision y amplia el pool de KV de 1,45 M a 1,8 M de tokens, apropiado para despliegues sin necesidades multimodales y hasta 32 usuarios concurrentes.
- Razonamiento con traza separada: integrable en pipelines que necesitan auditar el razonamiento (campo `reasoning`) por separado de la respuesta final, por ejemplo en evaluacion de calidad o depuracion de agentes.
- Despliegue sobre hardware Tenstorrent: organizaciones con placas p300x2 o p150x4 pueden servir el modelo sin GPUs NVIDIA mediante `tt serve raahemnabeel/ornith-1.5-122b`.

## Benchmarks y rendimiento

La model card incluye una seccion de accuracy evaluada a traves de la API de chat (p300x2, thinking off, una muestra por pregunta, seed 42, temperature 0.6 / top_p 0.95 / top_k 20, lm-evaluation-harness), pero la tabla aparece truncada en la informacion proporcionada (comienza con `| Eval | t`), por lo que no se pueden reproducir los resultados numericos.

La model card indica explicitamente que la model card de Ornith no reporta estas evaluaciones y que sus propios benchmarks (coding agentico, tool use y razonamiento, con thinking on) no se ejecutaron en este paquete. Se menciona una comparacion con el paquete Qwen3.5-122B-A10B sobre el mismo codigo de servicio, caja y ajustes, pero los valores no estan disponibles.

No se han publicado resultados de benchmarks completos en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: Tenstorrent p300x2 (dos placas p300) o p150x4 (cuatro placas p150). No se describe despliegue sobre GPU NVIDIA.
- VRAM estimada: no disponible; el modelo se sirve sobre aceleradores Tenstorrent, no sobre GPUs convencionales.
- GPU recomendadas: no aplica segun la informacion disponible; el paquete esta ligado a hardware Tenstorrent.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: `tt serve raahemnabeel/ornith-1.5-122b` (Tenstorrent CLI, instalable con `uv tool install tenstorrent`) o `tt-model serve raahemnabeel/ornith-1.5-122b`; requiere Docker. Servidor vLLM con API compatible con OpenAI en el puerto 20000.
- Perfiles de servicio: `p300x2` (por defecto), `p300x2-burst`, `p300x2-longctx`, `p300x2-text`, y equivalentes `p150x4`, `p150x4-burst`, `p150x4-longctx`, `p150x4-text`. Todos con `max_num_seqs` 32 y `max_model_len` 262144.
- Latencia: en perfil `burst`, una rafaga de 32 peticiones obtiene el primer token en aproximadamente 3,8 s frente a 6,3 s del perfil por defecto; la velocidad de decodificacion no cambia.
- Memoria de cache: la cache de prefijos usa 1,4 GiB del pool KV de cada die; el pool total es de 1,45 M de tokens KV con vision y 1,8 M en modo solo texto.
- Arranque: la primera ejecucion compila kernels para el dispositivo y tarda varios minutos.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Hardware | Notas |
|---|---|---|---|---|---|---|
| Ornith-1.5-122B (este paquete) | 122B | 10B | 262.144 | MIT | Tenstorrent p300x2 / p150x4 | MoE hibrido con vision, thinking por defecto, tool calling |
| Qwen3.5-122B-A10B | 122B | 10B | No disponible en la informacion | No disponible | No disponible | Arquitectura base del modelo; la model card lo cita como referencia de comparacion sobre el mismo codigo de servicio |
| Ornith-1.5-122B (checkpoint original) | 122B | 10B | No disponible en la informacion | No disponible | No disponible | Checkpoint fuente en `ornith-ai/Ornith-1.5-122B`; la model card remite a el para entrenamiento y evaluacion |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete convierte los pesos de los expertos a menor precision al cargarlos en el servidor; la model card advierte de ello y remite a la seccion Limitations, cuyo contenido no esta disponible en la informacion proporcionada.
- El modo de pensamiento esta activado por defecto: si el presupuesto de `max_tokens` se agota dentro del razonamiento, el campo `content` llega vacio. Es necesario asignar presupuestos de miles de tokens.
- `top_k` esta limitado a 32 en el muestreo en dispositivo.
- No se acepta entrada de video; las imagenes se limitan a 4 por peticion y 4 MP.
- En el perfil `burst`, el tiempo hasta el primer token de una peticion puede depender de que otras peticiones hayan llegado con ella.
- En el perfil `longctx`, los usuarios que ya estan decodificando se pausan mientras se ejecutan los bloques de prefijado.
- El modelo esta ligado a hardware Tenstorrent p300x2 o p150x4; no se documenta despliegue en GPU.
- No hay informacion sobre sesgos, riesgo de alucinacion, cobertura idiomatica ni datos de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.
- La licencia MIT permite uso comercial, pero debe verificarse la licencia del checkpoint base `ornith-ai/Ornith-1.5-122B`, no indicada en la informacion disponible.

## Enlaces

- Repositorio del paquete en HuggingFace: https://huggingface.co/raahemnabeel/ornith-1.5-122b
- Checkpoint original: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Tenstorrent CLI (prerrequisitos): https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
