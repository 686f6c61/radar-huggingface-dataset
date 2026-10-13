# Castellan-AI/Qwen3-4B-Instruct-2507-int4-cw-ov

## Resumen

Castellan-AI/Qwen3-4B-Instruct-2507-int4-cw-ov es una conversion del modelo Qwen/Qwen3-4B-Instruct-2507 a formato OpenVINO IR (Intermediate Representation) con los pesos comprimidos a INT4 simetrico canal a canal, que es el esquema de cuantizacion que la NPU de Intel ejecuta correctamente. Lo publica Castellan-AI como pieza de su pila de despliegue sobre NPU en PCs con Intel Core Ultra. No hay fine-tuning ni cambios en el tokenizador ni en la plantilla de chat: es exclusivamente una conversion y compresion de pesos.

El problema que resuelve es concreto y practico. OpenVINO publica exportaciones canal a canal para NPU de varios modelos (entre ellos Qwen3-8B), pero no de un Qwen3 4B; su exportacion AWQ group-wise equivalente, OpenVINO/Qwen3-4B-int4-ov, carga en una NPU Lunar Lake y responde rapido, pero segun el autor produce respuestas sin sentido. Esta version responde de forma coherente manteniendo el modelo en el orden de los 2,2 GB de pesos.

La relevancia actual es doble: permite ejecutar un LLM instruct de 4B parametros en hardware de portatil sin GPU dedicada, y documenta con mediciones reales el rendimiento sobre NPU 4 (Lunar Lake). El repo tiene un tamano de 2,2 GB, licencia Apache-2.0 y, en el momento de la consulta, 10 descargas y 0 likes, por lo que es un artefacto reciente y poco adoptado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso del modelo base Qwen3-4B-Instruct-2507, exportado a OpenVINO IR (grafo estatico con cache de past) |
| Parametros totales | No disponible en la informacion proporcionada (modelo base de la familia Qwen3, rango 4B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada. La configuracion de referencia usa `--max_prompt_len 1536` en NPU; con 1.395 tokens de prompt responde y con 1.792 devuelve error 400 |
| Tipos de cuantizacion | INT4 simetrico canal a canal en 252 de 254 capas (`--group-size -1 --ratio 1.0`), una escala por canal de salida; 1 capa (embeddings) en INT8 asimetrico per-channel (valor por defecto de NNCF) |
| Idiomas soportados | Declarado: en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El artefacto no incorpora entrenamiento propio. Se genera con `optimum-cli export openvino --model Qwen/Qwen3-4B-Instruct-2507 --task text-generation-with-past --weight-format int4 --sym --ratio 1.0 --group-size -1`, es decir, una exportacion del transformer denso de Qwen3 a OpenVINO IR con estado de cache (`text-generation-with-past`), seguida de compresion de pesos con NNCF. El 90% de las capas (252 de 254) queda en INT4 simetrico con una unica escala por canal de salida, lo que reduce el numero de parametros de escalado frente a una cuantizacion por grupos; el 10% restante (la capa de embeddings) queda en INT8 asimetrico por canal.

El entorno de construccion reportado es Python 3.12.10, openvino 2026.4.1, openvino-tokenizers 2026.4.1, nncf 3.4.0, optimum-intel 2.2.0 (optimum 2.3.0), transformers 5.5.4 y torch 2.14.1 en CPU, sobre Windows 11. El modelo base Qwen3-4B-Instruct-2507 es de la familia Qwen3 (Alibaba Cloud) y pertenece a la variante "Instruct-2507" sin modo thinking; no se modifico su tokenizador ni su plantilla de chat. No se declara en la informacion disponible ningun proceso de RLHF, DPO o ajuste posterior sobre este artefacto.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base instruct.
- Razonamiento de un solo turno y multi-turno a partir de la plantilla de chat original de Qwen3 (sin modificaciones).
- Decodificacion con cache de clave/valor (`text-generation-with-past`), requisito para generacion token a token eficiente.
- Ejecucion en NPU, GPU integrada Intel o CPU mediante el mismo grafo OpenVINO IR.
- Servicio como endpoint REST/OpenAI-compatible a traves de OpenVINO Model Server (OVMS) y como pipeline local con `LLMPipeline` de OpenVINO GenAI.
- Tool calling / function calling: no documentado en la informacion proporcionada para esta exportacion.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Capacidades multilingues: no declaradas; la model card solo lista `en`.
- Vision o audio: no soportados (modelo puramente de texto).
- Modo thinking explicito: no disponible en esta variante.

## Casos de uso

- Inferencia local en portatiles con Intel Core Ultra sin GPU dedicada: el modelo ocupa 3,6 GB de working set y se ejecuta en la NPU 4 de un Core Ultra 7 256V, lo que permite asistentes de texto offline en equipos de consumo.
- Asistentes conversacionales embebidos en aplicaciones de escritorio: con 0,7 s de latencia en respuestas cortas en caliente, es viable para autocompletado de dialogo y ayuda contextual dentro de una app.
- Procesamiento por lotes en CPU: con `--target_device CPU` y sin limite de prompt, sirve para resumir o clasificar documentos en un servidor sin acelerador, a costa de menor rendimiento.
- Despliegue en GPU integrada Intel (iGPU Arc): `--target_device GPU` permite repartir la inferencia entre iGPU y NPU para liberar CPU en flujos de ofimatica con IA.
- Backend de una API interna ligera con OVMS: el servidor expone el modelo descargandolo por nombre desde el repositorio, lo que simplifica el aprovisionamiento en flotas de PCs corporativos homogeneos.
- Generacion de texto en entornos con requisitos de privacidad: al ejecutarse en local sobre NPU, los prompts no salen del equipo, lo que encaja en escenarios de documentacion interna o sanidad.
- Prototipado y evaluacion de cuantizacion: sirve como referencia reproducible para comparar INT4 canal a canal frente a esquemas group-wise o AWQ en el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta mediciones de inferencia sobre Intel Core Ultra 7 256V (Lunar Lake, NPU 4, driver 32.0.100.4512) con OpenVINO Model Server 2026.4.1 y `--target_device NPU --max_prompt_len 1536`, fechadas el 2026-10-12:

| Metrica | Valor medido |
|---|---|
| Primera carga (compilacion para NPU) | 31 s |
| Carga desde cache de compilacion | 4 s |
| Velocidad de generacion | 26 tokens/s |
| Lectura de prompt (prefill) | ~670 tokens/s |
| Respuesta corta en caliente | 0,7 s |
| Prompt de 1.395 tokens | respondido correctamente |
| Prompt de 1.792 tokens | rechazado con error 400, servidor operativo |
| Memoria (working set) | 3,6 GB |

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion de calidad para esta exportacion.

## Requisitos de hardware

- Pesos y repo: 2,2 GB de tamano de repositorio en INT4/INT8.
- Memoria de trabajo medida: 3,6 GB durante la inferencia en NPU.
- VRAM/RAM estimada para inferencia: no disponible de forma oficial; como referencia, el working set medido de 3,6 GB sugiere que 4-6 GB de memoria disponible son suficientes para esta exportacion.
- Hardware objetivo: NPU de Intel Core Ultra (validado en Lunar Lake, NPU 4). Tambien funciona en GPU integrada Intel y en CPU via los mismos ficheros IR.
- Cabe en GPU de consumo: si, en terminos de memoria (por debajo de 4 GB de pesos y activaciones), pero solo a traves de OpenVINO sobre hardware Intel; esta exportacion IR no se ejecuta directamente en CUDA.
- GPUs recomendadas: no disponible. El autor no ha probado el modelo en Meteor Lake, Arrow Lake ni Panther Lake, y no documenta GPUs dedicadas.
- Opciones de despliegue: OpenVINO Model Server (`ovms --rest_port 8000 --source_model <repo> --model_repository_path models --task text_generation --target_device NPU --max_prompt_len 1536`) y OpenVINO GenAI `LLMPipeline`. No es compatible con llama.cpp, Ollama, vLLM ni TGI en su formato actual.
- Latencia y throughput medidos: 26 tokens/s de generacion, ~670 tokens/s de prefill, 0,7 s para una respuesta corta en caliente, 31 s de primera compilacion y 4 s de carga desde cache.

## Comparativa con modelos similares

| Modelo | Parametros / formato | Cuantizacion | Contexto de uso documentado | Rendimiento declarado | Licencia |
|---|---|---|---|---|---|
| Castellan-AI/Qwen3-4B-Instruct-2507-int4-cw-ov | Qwen3 4B Instruct-2507, OpenVINO IR | INT4 simetrico canal a canal + embeddings INT8 | Prompt limitado a 1.536 tokens en NPU | 26 tokens/s, 3,6 GB de memoria, respuestas coherentes en NPU Lunar Lake | Apache-2.0 |
| OpenVINO/Qwen3-4B-int4-ov | Qwen3 4B, OpenVINO IR, AWQ group-wise | INT4 group-wise (AWQ) | Carga en NPU Lunar Lake | Rapido, pero segun el autor produce respuestas sin sentido en NPU | No disponible |
| OpenVINO/Qwen3-8B-int4-cw-ov (mencionado como referencia) | Qwen3 8B, OpenVINO IR | INT4 canal a canal | Exportacion oficial de OpenVINO para NPU | No disponible | No disponible |
| Qwen/Qwen3-4B-Instruct-2507 | Qwen3 4B Instruct-2507, safetensors | FP16/BF16 sin cuantizar | Modelo original de referencia | No disponible | Apache-2.0 |

Los datos de rendimiento del modelo cuantizado no son comparables con los del modelo base: no se ha publicado ninguna evaluacion de calidad (perplejidad, MMLU u otras) para la version INT4 canal a canal.

## Limitaciones y advertencias

- La model card solo declara soporte de ingles (`en`), aunque el modelo base Qwen3 tenga naturaleza multilingue; no hay validacion publicada de otros idiomas tras la cuantizacion.
- Riesgo de alucinacion propio de un LLM de 4B parametros sin ajuste adicional; la cuantizacion INT4 puede incrementarlo respecto al modelo en precision completa, algo que el autor no ha medido.
- Con `--max_prompt_len 1536` en NPU, un prompt de 1.792 tokens es rechazado con HTTP 400. Hay que gestionar ese limite en la capa de aplicacion.
- El prefill medido (~670 tokens/s) hace que prompts cercanos al limite de 1.536 tokens tarden del orden de dos segundos solo en lectura, antes de generar.
- La exportacion solo es utilizable en el ecosistema OpenVINO e Intel. No hay GGUF ni safetensors en el repositorio, por lo que no se puede desplegar en llama.cpp, Ollama, vLLM o TGI sin reconvertir.
- No validado en NPUs Meteor Lake, Arrow Lake ni Panther Lake; el rendimiento en esas plataformas es desconocido.
- Adopcion muy baja (10 descargas, 0 likes) y publicacion reciente: no hay comunidad que haya verificado de forma independiente las mediciones del autor.
- Licencia Apache-2.0 del modelo base: permite uso comercial con atribucion y conservacion de avisos. El autor aclara que Qwen3-4B-Instruct-2507 es de Alibaba Cloud y que esta copia convertida no esta hecha ni respaldada por ellos.
- El modelo no ha recibido fine-tuning ni filtros de seguridad adicionales; los sesgos y el comportamiento de rechazo son los del modelo base original.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre su modelo base, por lo que no hay documentacion externa contrastable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Castellan-AI/Qwen3-4B-Instruct-2507-int4-cw-ov
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Exportacion comparable mencionada por el autor (AWQ group-wise): https://huggingface.co/OpenVINO/Qwen3-4B-int4-ov
- Organizacion OpenVINO en HuggingFace (exportaciones para NPU, incluida Qwen3-8B): https://huggingface.co/OpenVINO
- Resultados de la busqueda web: no se encontraron enlaces relevantes sobre este modelo; los resultados devueltos no guardan relacion con el tema.
