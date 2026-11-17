# luvette/SenseNova-Loop-9B-Preview-abliterated-GGUF

## Resumen

SenseNova-Loop-9B-Preview-abliterated-GGUF es una cuantizacion en formato GGUF de la version "abliterated" (direccion de rechazo ortogonalizada) del modelo SenseNova-Loop-9B-Preview, publicado por el usuario luvette en Hugging Face. El modelo original lo desarrolla SenseNova bajo licencia Apache 2.0, y esta variante parte de la cuantizacion Q6_K realizada por AtomicChat. El proceso de abliteration se aplico directamente sobre los pesos Q6_K, no sobre el modelo en precision completa.

El modelo emplea una arquitectura de transformer "looped" (con bucles) sobre un backbone de la clase Qwen3.5: almacena 32 bloques y ejecuta las capas 4 a 27 dos veces, lo que resulta en 56 pasadas de capa efectivas. Incorpora ademas hyper-conexiones de dos flujos con restriccion de variedad manifold (mHC) y enrutamiento Sinkhorn. Cuenta con 8.956.949.376 parametros totales (aproximadamente 9B) y un tamano de repositorio de 7,4 GB en su unica cuantizacion disponible, Q6_K.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: una arquitectura con reutilizacion de capas (looped transformer), un proceso de abliteration que elimina la direccion de rechazo del modelo, y una cuantizacion Q6_K que permite ejecutarlo en GPUs de consumo. Es un modelo de generacion de texto conversacional, sin capacidades multimodales declaradas, orientado a usuarios que necesitan un modelo sin filtros de rechazo y con requisitos de hardware moderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer looped (backbone clase Qwen3.5), 32 bloques almacenados con capas 4-27 ejecutadas dos veces (56 pasadas), hyper-conexiones de dos flujos mHC con enrutamiento Sinkhorn |
| Parametros totales | 8.956.949.376 (aproximadamente 9B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible de forma oficial; el autor demuestra ejecucion con `-c 16384` (16K tokens) |
| Tipos de cuantizacion | Q6_K (unica cuantizacion publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`SenseNova-Loop-9B-Preview-Q6_K-abliterated.gguf`, 7,37 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con reutilizacion de capas: el modelo almacena 32 bloques pero ejecuta las capas 4 a 27 dos veces, alcanzando 56 pasadas de capa efectivas. Sobre este backbone se anaden hyper-conexiones de dos flujos con restriccion de variedad manifold (mHC) y enrutamiento Sinkhorn, con pesos de router en F32 que se preservan intactos en la cuantizacion. El modelo base pertenece a la familia Qwen3.5, segun indica el autor, y requiere un build de `llama.cpp` con soporte para `sensenova_loop` y `qwen35.num_loops`.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si el modelo original utilizo RLHF, DPO u otras tecnicas de alineacion. La variante abliterated se genero extrayendo, por capa, vectores residuales de diferencia de medias (`l_out`) sobre 32 prompts daninos frente a 32 prompts inofensivos, formateados con la plantilla de chat nativa del modelo. A continuacion se desquantizaron los pesos `attn_output.weight`, `ssm_out.weight` y `ffn_down.weight` de los bloques almacenados 6-31 (52 tensores en total), se proyecto fuera la direccion de rechazo correspondiente a cada capa (con `alpha = 1.2`, promediando las direcciones de la primera y segunda visita para los bloques en bucle 6-27) y se recuantizo directamente a Q6_K mediante `ggml_quantize_chunk`. Se conservan sin modificar los metadatos GGUF, el tokenizer, la plantilla de chat y los pesos del router mHC Sinkhorn en F32.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte de plantilla de chat nativa.
- Razonamiento matematico: el autor verifica salidas coherentes en tareas de matematicas y razonamiento sin degradacion aparente tras la abliteration.
- Generacion de codigo en Python: verificado por el autor en pruebas de programacion.
- Respuestas sin rechazo (uncensored): el proceso de abliteration elimina la direccion de rechazo, de modo que el modelo no declina peticiones que el modelo original rechazaria.
- Capacidad de seguir instrucciones conversacionales segun la plantilla de chat del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el modelo base es de la familia Qwen3.5, pero no se confirma el conjunto de idiomas.
- Capacidades especiales (vision, audio, modo thinking): no disponible en la informacion proporcionada; se describe como text-only.

## Casos de uso

- Generacion de codigo en local: el modelo produce codigo Python coherente y puede ejecutarse en una RTX 3070 con 8 GB de VRAM, lo que permite integrarlo en flujos de desarrollo sin depender de APIs externas.
- Razonamiento matematico asistido: util para resolver problemas paso a paso en entornos educativos o de analisis, con la ventaja de que el modelo no rechaza consultas por contenido.
- Red teaming y formacion en seguridad: el autor verifica su uso en prompts de red-team training, security y lockpicking; al estar abliterated, es adecuado para ejercicios de evaluacion de robustez sin que el modelo se niegue a responder.
- Simulacion de ingenieria social para formacion: el modelo puede generar escenarios de phishing o manipulacion con fines de concienciacion, ya que no aplica rechazos.
- Atencion al cliente automatizada en local: el modelo soporta conversaciones multi-turno con plantilla de chat y puede desplegarse con `llama-server` en hardware de consumo, con contexto de 16K tokens.
- Prototipado de asistentes conversacionales sin censura: para investigadores que necesitan estudiar el comportamiento de modelos sin alineacion de rechazo, en un entorno controlado y con licencia Apache 2.0.
- Despliegue en edge o estaciones de trabajo con GPU modesta: gracias a la cuantizacion Q6_K y a la posibilidad de mover la tabla de embeddings a CPU (`-ot 'token_embd.weight=CPU'`), cabe en 8 GB de VRAM con CUDA Graphs activo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta metricas de inferencia en una RTX 3070 con `llama-server`:

| Metrica | Valor |
|---|---|
| Generacion (RTX 3070, Q6_K, 16K contexto, q8_0 KV) | 24,2-24,4 t/s |
| Generacion con embeddings en CPU (RTX 3070, 8 GB) | aproximadamente 24,4 t/s |
| Procesamiento de prompt (RTX 3070) | aproximadamente 632 t/s |
| VRAM ocupada (con embeddings en CPU) | aproximadamente 7,17 GB / 8 GB |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7,17 GB con la cuantizacion Q6_K y contexto de 16K con KV cache en q8_0, moviendo la tabla de embeddings (aproximadamente 835 MiB) a RAM del sistema.
- GPU recomendadas: RTX 3070 (verificada por el autor), RTX 3080, RTX 4070, RTX 4080, RTX 4090; en el segmento profesional, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: si, en GPUs con 8 GB o mas de VRAM aplicando el truco de mover `token_embd.weight` a CPU; sin ese truco, el modelo completo Q6_K (7,37 GB) mas el KV cache requiere algo mas de 8 GB.
- Opciones de despliegue: `llama.cpp` / `llama-server` con soporte para `sensenova_loop` y `qwen35.num_loops`; no se confirma compatibilidad con vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: aproximadamente 24,4 t/s de generacion y 632 t/s de procesamiento de prompt en RTX 3070 con CUDA Graphs activo, segun el autor.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo ni de modelos comparables directos en la informacion proporcionada. La comparativa se limita a caracteristicas estructurales conocidas:

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-Preview-abliterated-GGUF | 8,96B | no disponible (demo con 16K) | Q6_K | Apache 2.0 | Looped transformer, abliterated, solo GGUF |
| SenseNova-Loop-9B-Preview (original) | 8,96B | no disponible | no disponible | Apache 2.0 | Modelo base con alineacion de rechazo intacta |
| AtomicChat/SenseNova-Loop-9B-Preview-GGUF | 8,96B | no disponible | Q6_K (entre otras, presumiblemente) | Apache 2.0 | Cuantizacion de referencia sin abliteration |

No se identifican en la informacion disponible otros modelos de 9B con arquitectura looped y abliteration para una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- El proceso de abliteration elimina la direccion de rechazo, por lo que el modelo puede generar contenido danino, ilegal o eticamente problematico sin filtros; no es apto para despliegues publicos sin moderacion externa.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual; al ser un modelo de 9B y preview, la tasa de alucinacion puede ser significativa en dominios especializados.
- La abliteration puede degradar capacidades de razonamiento o seguridad en tareas sensibles; el autor solo verifica ausencia de degradacion en matematicas y codigo, no en otros dominios.
- Idiomas soportados no confirmados: no hay informacion oficial sobre el rendimiento multilingue de esta variante.
- Contexto maximo no documentado oficialmente; el autor demuestra 16K tokens, pero no se confirma cual es el limite nativo del modelo base.
- Requiere un build especifico de `llama.cpp` con soporte `sensenova_loop` y `qwen35.num_loops`; no funciona en versiones estandar sin ese parche.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo abliterated en produccion.
- Modelo marcado como "Preview": puede tratarse de una version no final con posibles cambios en el modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/luvette/SenseNova-Loop-9B-Preview-abliterated-GGUF
- Modelo original: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- Cuantizacion de origen: https://huggingface.co/AtomicChat/SenseNova-Loop-9B-Preview-GGUF
- Repositorio llama.cpp (requerido para `sensenova_loop`): https://github.com/ggml-org/llama.cpp
- Paper, blog o demo oficial: no disponible en la informacion proporcionada.
