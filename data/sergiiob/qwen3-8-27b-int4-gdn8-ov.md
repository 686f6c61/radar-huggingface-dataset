# SergiioB/Qwen3.8-27B-int4-gdn8-ov

## Resumen

`SergiioB/Qwen3.8-27B-int4-gdn8-ov` es una exportacion no oficial a OpenVINO del modelo multimodal `Qwen/Qwen3.8-27B`, cuantizada a INT4 con una particularidad: las capas de atencion lineal (GatedDeltaNet, prefijo `linear_attn`) se mantienen sin cuantizar. El autor, SergiioB, publica este repositorio como correccion de un fallo concreto del artefacto oficial `OpenVINO/Qwen3.8-27B-int4-ov`, marcado como EXPERIMENTAL, cuyo `openvino_config.json` deja `ignored_scope: null` y por tanto mete la GatedDeltaNet en INT4.

El problema que resuelve es practico: con el INT4 oficial, el modelo genera basura (`")-+&-&)&/-,'/!&*%!'.33).)'03*#*,"`) tanto en GPU como en CPU con OpenVINO GenAI 2026.5, mientras que el INT8 oficial del mismo Hub si es coherente. Este repositorio reexporta desde BF16 con `IgnoredScope(patterns=[".*linear_attn.*"])`, de modo que el 22% de las capas del grafo de lenguaje (288 de 545) quedan en float, el 73% en INT4_ASYM y una capa en INT8_ASYM per-channel.

Es relevante ahora porque afecta a cualquier despliegue de Qwen3.8-27B en INT4 sobre OpenVINO, incluidos los repos de terceros (`circulus/*-int4-ov`, `Morteza89/qwen3.8-27b-int4-ov`), que arrastran el mismo `ignored_scope: null`. El coste de la correccion es de tamano: el bin de lenguaje pasa de 14 GB (todo INT4) a 21 GB, y el repo completo ocupa 25,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atencion lineal GatedDeltaNet (capas `linear_attn`) en el modelo base Qwen3.8-27B |
| Parametros totales | 27 000 millones (segun el identificador del modelo; no confirmado en la informacion disponible) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4_ASYM grupo 128, ratio 1.0, simetrico desactivado (73% de capas, 256/545); float sin cuantizar para GatedDeltaNet/`linear_attn` (22%, 288/545); INT8_ASYM per-channel para 1 capa (5%) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | OpenVINO IR (grafo XML + pesos BIN) con tokenizer y detokenizer incluidos; no se publican safetensors ni GGUF en este repo |
| Libreria declarada | openvino |
| Pipeline declarado | image-text-to-text (VLM, conversacional) |
| Modelo base | Qwen/Qwen3.8-27B |
| Tamano del repositorio | 25,7 GB (bin de lenguaje: 21 GB) |
| Fecha de creacion / actualizacion | 2026-09-12 / 2026-09-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Este repositorio no entrena ningun modelo: es una reexportacion del modelo base `Qwen/Qwen3.8-27B`. El proceso documentado por el autor tiene tres pasos. Primero, una traza `optimum`/OpenVINO de `Qwen/Qwen3.8-27B` usando Transformers 5.2.0 (la version 5.4.0 rechaza la exportacion). Segundo, compresion NNCF `compress_weights` aplicada unicamente al IR de lenguaje, con `INT4_ASYM` en grupos de 128, ratio 1.0 e `IgnoredScope(patterns=[".*linear_attn.*"])`. Tercero, `convert_tokenizer --with-detokenizer`.

La innovacion tecnica del artefacto es precisamente el alcance de la ignorancia de cuantizacion. El grafo de lenguaje queda con 256 de 545 capas en INT4_ASYM g128 (73%), 288 en float correspondientes a la GatedDeltaNet (22%) y 1 capa en INT8_ASYM per-channel (5%). Ese 22% en float es lo que anade 7 GB respecto al INT4 oficial (21 GB frente a 14 GB) y lo que evita la degeneracion de la salida. El autor atribuye la causa raiz a la misma clase de fallo que `openvino.genai#3870`, donde `optimum-intel` descarta los `ignored_scope`. No se documentan en la informacion disponible los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

Nota sobre la nomenclatura: el identificador del repositorio incluye `gdn8`, lo que sugiere GDN en 8 bits, pero la model card indica explicitamente que las capas `linear_attn` se dejaron en float.

## Capacidades

- Generacion de texto e imagen-a-texto: el pipeline declarado es `image-text-to-text`, de modo que el modelo acepta una imagen y un prompt textual y produce una descripcion o respuesta conversacional. El ejemplo de la model card usa `pipe.generate("Describe this image.", image=image, generation_config=cfg)`.
- Conversacion multi-turno: la etiqueta `conversational` esta presente en el repositorio, aunque no se documenta la gestion de historial ni la plantilla de chat.
- Razonamiento, codigo y matematicas: no disponible en la informacion proporcionada sobre este artefacto.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles (`language: en`) segun los metadatos; no se documentan otros idiomas.
- Capacidades especiales (modo thinking, audio, vision adicional): vision confirmada por el pipeline; no se documentan modo thinking ni audio.

## Casos de uso

- Descripcion de imagenes en produccion sobre hardware Intel: el modelo esta pensado para ejecutarse con `openvino_genai.VLMPipeline` en `GPU.0`, de modo que encaja en pipelines de etiquetado o alt text donde ya exista infraestructura Arc y no se quiera introducir CUDA.
- Verificacion de calidad de artefactos INT4: sirve como referencia para comprobar si un INT4 de Qwen3.8-27B produce salida coherente o degenerada, comparando la cadena de salida con la del INT8 oficial sobre la misma imagen de prueba (demo `ai2d` de HuggingFace, imagen `fire`).
- Despliegue VLM en equipos con 24-32 GB de memoria unificada o dedicada: con 21 GB de pesos en lenguaje, es una via para ejecutar un VLM de 27B en INT4 sin recurrir a CUDA ni a `llama.cpp`.
- Sustitucion del INT4 oficial en entornos OpenVINO GenAI 2026.4 o superior: cualquier integracion que hoy use `OpenVINO/Qwen3.8-27B-int4-ov` y produzca salida corrupta puede cambiar el identificador del repositorio manteniendo la misma API.
- Base para investigacion sobre cuantizacion de atencion lineal: el reparto 73% INT4 / 22% float / 5% INT8 es un caso de estudio reproducible de como el alcance de `IgnoredScope` afecta a la calidad de un modelo hibrido con GatedDeltaNet.
- Prototipado de asistentes visuales en ingles: conversaciones imagen + texto para demos internas, con la limitacion de que el idioma declarado es unicamente ingles.
- Benchmarking de motores de inferencia sobre Intel Arc: el autor usa este artefacto para comparar OpenVINO GenAI 2026.5 frente a Cascadia 0.2.3 y llama.cpp SYCL con la misma GPU (Arc Pro B70 a 150 W).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Lo unico documentado son medidas de throughput y comprobaciones de coherencia de salida realizadas por el autor el 2026-09-12 sobre una Intel Arc Pro B70 a 150 W, en `GPU.0` y decodificacion greedy, con `max_new_tokens=128`. La calidad se evalua como PASS/FAIL sobre una descripcion en ingles de la imagen `fire` de la demo `ai2d` de HuggingFace.

| Motor | Artefacto | tok/s (n=128) | Calidad |
|---|---|---|---|
| OpenVINO GenAI 2026.5 | este INT4-GDN8 | 13,89 | PASS |
| OpenVINO GenAI 2026.5 | INT8 del Hub | 13,09 | PASS |
| OpenVINO GenAI 2026.5 | INT4 del Hub | ~30 | FAIL (token 0 / puntuacion) |
| Cascadia 0.2.3 (`qwen35`) | INT8 del Hub, shard de 1 etapa | 4,56 | PASS (logits en host) |
| llama.cpp SYCL | Q4_K_M GGUF | 18,58 (tg128) | PASS (artefacto distinto) |

Comprobaciones adicionales de coherencia del INT4 oficial, sobre la imagen de demo `ai2d`: en `GPU.0` devuelve `")-+&-&)&/-,'/!&*%!'.33).)'03*#*,"`; en CPU (251 s) devuelve exactamente la misma cadena, lo que descarta un fallo especifico del plugin de GPU; con una imagen de ceros como dummy la salida son todo caracteres `!` (token id 0). El autor senala que las tasas del INT4 oficial no deben usarse en comparativas de rendimiento, porque la salida es invalida.

## Requisitos de hardware

- Memoria para pesos: el bin del lenguaje ocupa 21 GB, a los que hay que sumar el IR de vision y la cache KV. El repositorio completo ocupa 25,7 GB. Como referencia, el INT4 oficial todo-cuantizado ocupa 14 GB en el bin de lenguaje.
- GPU validada: Intel Arc Pro B70, con limite de 150 W, dispositivo `GPU.0`, `hint.performance_mode=LATENCY` y `hint.inference_precision=f16`. Es la unica configuracion con numeros publicados (13,89 tok/s).
- GPU consumer: con 21 GB solo de pesos en lenguaje, no cabe en tarjetas de 16 GB ni en las de 24 GB con margen comodo una vez anadidos vision y cache KV; no se documenta ningun despliegue en RTX 4090, RTX 3090 u otras consumer.
- Otras GPU: no disponible. El repositorio esta orientado a OpenVINO y a hardware Intel; no se documentan pruebas en A100, H100 ni similares.
- CPU: no disponible para este artefacto. La model card menciona una ejecucion en CPU del INT4 oficial (251 s para la generacion medida), pero no aporta cifras de rendimiento del INT4-GDN8 en CPU.
- Runtime obligatorio: OpenVINO GenAI 2026.4 o superior (probado con 2026.5). El IR es un grafo VLM. Cascadia 0.2.3 con el `ov-genai` de serie (2026.2) provoca SIGSEGV en `Tokenizer::setup_tokenizer`.
- Detalle de API: hay que llamar a `pipe.generate(prompt, image=..., generation_config=cfg)` con argumentos por palabra clave; un `config` posicional se interpreta como imagenes.
- Opciones de despliegue alternativas: llama.cpp SYCL funciona con un GGUF Q4_K_M, pero es otro artefacto, no este repositorio. No se documenta soporte de vLLM, TGI, Ollama ni llama.cpp para el IR de OpenVINO.
- Latencia y throughput: 13,89 tok/s de media de pared con n=128 en una Arc Pro B70 a 150 W, en modo greedy. Ligeramente por encima del INT8 del Hub (13,09 tok/s) en la misma tarjeta.

## Comparativa con modelos similares

| Artefacto | Formato | Cuantizacion | Bin de lenguaje | tok/s en B70 (n=128) | Calidad | Licencia |
|---|---|---|---|---|---|---|
| `SergiioB/Qwen3.8-27B-int4-gdn8-ov` (este) | OpenVINO IR | INT4_ASYM g128 + GDN en float | 21 GB | 13,89 | PASS | apache-2.0 |
| `OpenVINO/Qwen3.8-27B-int8-ov` | OpenVINO IR | INT8 | no disponible | 13,09 | PASS | apache-2.0 |
| `OpenVINO/Qwen3.8-27B-int4-ov` | OpenVINO IR | INT4 con `ignored_scope: null` | 14 GB | ~30 | FAIL | apache-2.0 |
| GGUF Q4_K_M con llama.cpp SYCL | GGUF | Q4_K_M | no disponible | 18,58 (tg128) | PASS | apache-2.0 (modelo base) |
| `circulus/*-int4-ov` y `Morteza89/qwen3.8-27b-int4-ov` | OpenVINO IR | INT4 con `ignored_scope: null` | no disponible | no disponible | FAIL esperado | no disponible |

El autor advierte explicitamente de que los repos de terceros con `ignored_scope: null` no deben descargarse como solucion al problema. El artefacto mas rapido de la comparativa es el GGUF Q4_K_M con llama.cpp SYCL (18,58 tok/s frente a 13,89 tok/s), aunque se trata de un formato y un motor distintos.

## Limitaciones y advertencias

- Artefacto no oficial: no lo publica ni Intel ni el equipo de Qwen, sino un usuario independiente. No ha pasado ninguna validacion de los propietarios del modelo base.
- No es un rehost: se reexporta desde BF16, por lo que la calidad depende de la traza `optimum`/OpenVINO y del proceso NNCF aplicado, no de un artefacto publicado por Intel.
- Idioma unico: solo ingles declarado. No hay garantia de comportamiento correcto en castellano ni en otros idiomas.
- Alcance de la cuantizacion: el 22% de las capas quedan en float. Quien necesite un modelo completamente INT4 para reducir memoria no puede usar este artefacto; el coste es de 7 GB adicionales.
- Dependencia de versiones fragil: requiere OpenVINO GenAI 2026.4 o superior y Transformers 5.2.0 para reproducir la exportacion (5.4.0 la rechaza). Cascadia 0.2.3 con `ov-genai` 2026.2 provoca SIGSEGV.
- API sensible a la firma: pasar `generation_config` de forma posicional hace que se interprete como imagenes y la generacion falla o se comporta de forma inesperada.
- Riesgo de alucinacion: no se documenta ninguna evaluacion de veracidad. Al ser un VLM, la descripcion de imagenes puede contener detalles inventados no presentes en la entrada.
- Sesgos: no disponible. No se ha publicado ningun analisis de sesgos sobre este artefacto.
- Licencia: apache-2.0, la misma que Qwen3.8-27B, lo que permite uso comercial del artefacto. Cualquier termino adicional del modelo base debe verificarse en su propio repositorio, ya que la informacion disponible no los detalla.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia. Sin evidencia de uso en produccion ni de mantenimiento posterior.
- Longitud de contexto no documentada, lo que impide planificar aplicaciones que dependan de ventanas largas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SergiioB/Qwen3.8-27B-int4-gdn8-ov
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- INT4 oficial del Hub (marcado EXPERIMENTAL, con el fallo descrito): https://huggingface.co/OpenVINO/Qwen3.8-27B-int4-ov
- INT8 oficial del Hub (coherente en la misma tarjeta): https://huggingface.co/OpenVINO/Qwen3.8-27B-int8-ov
- Issue de referencia sobre `ignored_scope` en optimum-intel: https://github.com/openvinotoolkit/openvino.genai/issues/3870
- Repos de terceros con el mismo problema, citados en la model card: `circulus/*-int4-ov` y `Morteza89/qwen3.8-27b-int4-ov` (URLs completas no disponibles en la informacion proporcionada)
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a paginas de soporte de Microsoft y no guardan relacion con el modelo.
