# furiosa-ai/Qwen3.6-27B-FP8

## Resumen

Qwen3.6-27B-FP8 es un modelo denso de tipo vision-lenguaje de 27.781 millones de parametros desarrollado originalmente por el equipo Qwen (Alibaba) y redistribuido por FuriosaAI en una variante cuantizada a FP8 acompanada de un Furiosa Executable Bundle (FXB) para su ejecucion sobre aceleradores RNGD. Emplea la arquitectura Qwen3.5 (`Qwen3_5ForConditionalGeneration`), que combina un codificador visual con un decodificador que alterna atencion lineal Gated DeltaNet y atencion completa. El modelo acepta entradas de imagen y texto y genera texto, con razonamiento activado por defecto y soporte de tool calling.

La relevancia de esta publicacion radica en que permite desplegar un modelo multimodal de 27B en hardware no-GPU (los aceleradores RNGD de FuriosaAI) mediante una estrategia de paralelismo tensorial de 16 PEs repartidos en dos tarjetas por replica. La cuantizacion FP8 estatica de pesos (E4M3 en bloques de 128x128) con cuantizacion dinamica de activaciones reduce el peso del repositorio a 48,3 GB y mantiene en mayor precision el codificador visual y la cabeza LM.

El modelo esta pensado para el mismo uso que el modelo base upstream de Qwen, publicado bajo licencia Apache 2.0, y expone una API compatible con OpenAI a traves de Furiosa-LLM, lo que facilita su integracion en aplicaciones existentes. La informacion publica no detalla la longitud de contexto, los idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 densa, `Qwen3_5ForConditionalGeneration` (codificador visual + decodificador con Gated DeltaNet y atencion completa) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (E4M3, pesos estaticos en bloques 128x128) con cuantizacion dinamica de activaciones FP8; KV cache en 16 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors + Furiosa Executable Bundle (FXB) |
| Modalidad | imagen + texto como entrada / texto como salida |
| Hardware soportado | FuriosaAI RNGD (dos tarjetas por replica) |
| Motor de inferencia | Furiosa-LLM (tambien compatible con vLLM, SGLang y Transformers segun el modelo upstream) |
| Tamano del repositorio | 48,3 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3.5 en configuracion densa, con un codificador de vision acoplado a un decodificador de lenguaje. El decodificador combina capas de atencion lineal Gated DeltaNet con capas de atencion completa, un diseno hibrido orientado a reducir el coste computacional en secuencias largas manteniendo capacidad de recuperacion de informacion. La clase de implementacion es `Qwen3_5ForConditionalGeneration`.

La variante aqui publicada aplica cuantizacion FP8: los pesos de las proyecciones se almacenan de forma estatica en formato E4M3 con granularidad de bloque 128x128, mientras que las activaciones se cuantizan dinamicamente en tiempo de ejecucion (por token y por bloque) sin calibracion offline. Los modulos excluidos por la configuracion de cuantizacion upstream, incluidos el codificador visual y la cabeza LM, conservan mayor precision, y la cache KV permanece en 16 bits. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en la informacion proporcionada.

El paquete FXB incluido utiliza paralelismo tensorial de tamano 16 PEs y paralelismo de pipeline de tamano 1, de modo que una sola replica (DP1) ocupa dos tarjetas RNGD con 8 PEs cada una.

## Capacidades

- Generacion de texto y razonamiento: el modo thinking esta activado por defecto y puede desactivarse por peticion mediante `enable_thinking`.
- Comprension visual: acepta mensajes multimodales estilo OpenAI con partes de contenido `image_url` junto a texto; admite URL remota, data URL en base64 y ruta local `file://` (esta ultima requiere el flag `--allowed-local-media-path`).
- Tool calling / function calling: soportado mediante el parser `qwen3_coder` (alias `qwen3_xml`), que interpreta el formato XML de llamadas a herramientas del modelo.
- Separacion de razonamiento y respuesta final: el parser `qwen3` de Furiosa-LLM expone el razonamiento en campos dedicados (`message.reasoning` en modo no streaming y `delta.reasoning` en streaming).
- API compatible con OpenAI para chat completions, lo que permite usar clientes estandar como el SDK de OpenAI.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Atencion al cliente multimodal: el modelo puede gestionar conversaciones multi-turno en las que el usuario adjunta capturas de pantalla, facturas o fotografias de producto, combinando comprension de imagen y texto en una unica peticion a traves de la API compatible con OpenAI.
- Automatizacion de soporte tecnico con razonamiento auditable: al separar el campo `reasoning` de la respuesta final, es posible registrar la traza de razonamiento para diagnostico y control de calidad sin exponerla al usuario final.
- Extraccion de datos de documentos e imagenes: el modelo puede recibir una imagen (por ejemplo, un formulario escaneado servido como URL o base64) y devolver texto estructurado, integrandose en pipelines de digitalizacion.
- Agentes con uso de herramientas: gracias al tool calling con parser `qwen3_coder`, puede orquestarse en flujos de varios pasos donde el modelo decide invocar funciones externas (busqueda, calculo, consultas a API) y componer la respuesta final.
- Asistentes de accesibilidad: descripcion de imagenes y generacion de texto alternativo en castellano o en otros idiomas, sirviendo contenido visual a usuarios con discapacidad visual mediante una unica llamada al endpoint de chat completions.
- Despliegue en infraestructura no-GPU: organizaciones con aceleradores FuriosaAI RNGD pueden servir un modelo multimodal de 27B en dos tarjetas por replica usando el FXB empaquetado, sin necesidad de GPUs NVIDIA.
- Moderacion y clasificacion de contenido visual: analisis de imagenes con instrucciones textuales para etiquetar o filtrar contenido en plataformas, aprovechando el modo thinking desactivable para reducir latencia en tareas simples.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria estimada: el repositorio pesa 48,3 GB en FP8; en GPUs el peso en memoria de los pesos ronda esa cifra, mas la cache KV en 16 bits y el estado del codificador visual.
- Hardware oficial soportado: FuriosaAI RNGD, con dos tarjetas por replica (paralelismo tensorial de 16 PEs, 8 PEs por tarjeta, pipeline-parallel de 1).
- GPUs: la model card no especifica requisitos para GPU; el modelo upstream Qwen3.6-27B-FP8 puede ejecutarse en vLLM, SGLang y Transformers, pero no se detallan GPUs recomendadas (A100, H100, RTX 4090) en la informacion disponible.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada.
- Opciones de despliegue: Furiosa-LLM (`furiosa-llm serve furiosa-ai/Qwen3.6-27B-FP8 --reasoning-parser qwen3`), y segun el modelo upstream tambien vLLM, SGLang y Transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Hardware / despliegue |
|---|---|---|---|---|---|
| furiosa-ai/Qwen3.6-27B-FP8 | 27,78B (denso) | no disponible | imagen + texto / texto | Apache 2.0 | FuriosaAI RNGD (2 tarjetas/replica), Furiosa-LLM; tambien vLLM/SGLang/Transformers via upstream |
| Qwen/Qwen3.6-27B-FP8 (upstream) | 27,78B (denso) | no disponible | imagen + texto / texto | Apache 2.0 | GPUs mediante vLLM, SGLang o Transformers |
| Alternativas de ~27B denso multimodal | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada que permitan una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad en la informacion disponible.
- La longitud de contexto no esta documentada en la model card, lo que impide planificar cargas con secuencias largas sin verificacion previa.
- Los idiomas soportados no estan listados; el rendimiento fuera de los idiomas principales del modelo upstream no esta garantizado.
- El paquete FXB esta atado al hardware FuriosaAI RNGD y a Furiosa-LLM; para otros entornos debe recurrirse al modelo upstream y a sus motores compatibles.
- La cuantizacion FP8 puede introducir degradacion en tareas sensibles a la precision numerica; el codificador visual y la cabeza LM se mantienen en mayor precision, pero el resto de proyecciones opera en FP8.
- El campo `reasoning` no forma parte de la especificacion de la API de OpenAI: acceder a el cuando la respuesta no contiene razonamiento lanza `AttributeError`, lo que exige manejo defensivo en el codigo cliente.
- El soporte de entrada local mediante `file://` requiere habilitar `--allowed-local-media-path`, lo que introduce un riesgo de seguridad si no se restringe el acceso a rutas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el fichero LICENSE del modelo upstream para confirmar obligaciones de atribucion.
- La fecha de creacion del repositorio (2026-10-14) y el reducido numero de descargas (452) y likes (0) indican una publicacion reciente con poca validacion comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/furiosa-ai/Qwen3.6-27B-FP8
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3.6-27B-FP8
- Licencia del modelo upstream: https://huggingface.co/Qwen/Qwen3.6-27B-FP8/blob/main/LICENSE
- Documentacion de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guia de instalacion de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- FuriosaAI: https://furiosa.ai
