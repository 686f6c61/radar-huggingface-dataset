# qwegnai/SenseNova-Loop-9B-QWP_4

## Resumen

SenseNova-Loop-9B-QWP_4 es un paquete de pesos cuantizados del modelo multimodal SenseNova-Loop-9B, publicado por el usuario qwegnai para su uso exclusivo con el motor de inferencia Qwegn (v0.27.0 o superior), un runtime escrito en Swift 6.2 y Metal 4 orientado a Apple Silicon. El paquete no es un archivo safetensors, GGUF ni MLX: emplea el contenedor propietario QWP1 y una cuantizacion Hadamard por bloques de 32 elementos (HQ4_G32) combinada con planos de estado F32 preservados para el mecanismo mHC (Sinkhorn-20 de dos flujos) y Gated-DeltaNet, ademas de un sidecar de Latent Sparse Attention (model.qlsa) con proyeccion SVD cuantizada en SHVQ4.

El modelo base, SenseNova-Loop-9B, es un transformer con bucle (looped transformer) de 9.410 millones de parametros distribuidos en 857 tensores. Su arquitectura fisica consta de 32 capas que iteran el bloque [4..28] dos veces, lo que da 56 capas efectivas: 42 de Gated-DeltaNet y 14 de atencion GQA con 16 cabezas de consulta y 4 de clave/valor, head_dim de 256 y rotary parcial del 25%. Incluye ademas una torre de vision ViT de 27 niveles con 2.304 embeddings posicionales y un vocabulario de 248.320 tokens.

La relevancia de este paquete es doble: por un lado, demuestra que un modelo de 9.400 millones de parametros con contexto nativo de 524.288 tokens (cualificado hasta 1.048.576) puede residir por completo en la memoria unificada de un Mac de 128 GB, ocupando solo 4,66 GiB de pesos en GPU; por otro, documenta cifras de rendimiento concretas en hardware Apple (M5 Max) que incluyen prefill de 2.044,9 tok/s a 4K, decodificacion especulativa de 165,7 tok/s y un 92% en HumanEval. Su principal limitacion es la portabilidad: solo carga en Qwegn y solo funciona en Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucle (looped transformer) `sensenova_loop` / `qwen3_5_text`: 32 capas fisicas, bucle [4..28] x2, 56 capas efectivas (42 GDN + 14 GQA 16Q/4KV, head_dim 256, partial_rotary_factor 0,25); mHC Sinkhorn-20 de 2 flujos; ViT de 27 niveles |
| Parametros totales | 9.412.963.952 (9,41 B) en 857 tensores |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 524.288 tokens nativos (YaRN factor 2,0 desde 262.144, rope_theta 10.000.000); cualificado hasta 1.048.576 (1M) |
| Tipos de cuantizacion | HQ4_G32 (Hadamard por bloques de 32) en 249 tensores (84,31%); BF16 y F32 preservados en 608 tensores (15,69%); 6,73 bits por parametro en disco; sidecar LSA en SHVQ4 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedor propietario QWP1 (`model.qwp` de 7.922.099.956 bytes + `model.qlsa` de 1.575.943 bytes); no compatible con safetensors, GGUF ni MLX |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura de transformer con bucle: 32 capas fisicas donde el bloque comprendido entre las capas 4 y 28 se evalua dos veces (eval_count = 2), produciendo 56 capas efectivas. De ellas, 42 corresponden a capas Gated-DeltaNet (un mecanismo de estado recurrente lineal) y 14 a atencion GQA con 16 cabezas de consulta y 4 de clave/valor, head_dim de 256 y rotacion posicional parcial del 25%. Sobre esta columna vertebral se anade un mecanismo mHC (multi-stream Sinkhorn, 20 iteraciones) de dos flujos con planos F32 preservados, y una Latent Sparse Attention cuya proyeccion SVD se empaqueta en el sidecar `model.qlsa` para las 14 pasadas de atencion bucleadas. La torre de vision es un ViT de 27 niveles con 2.304 embeddings posicionales y el vocabulario alcanza los 248.320 tokens.

El paquete QWP_4 no reentrena el modelo: cuantiza los pesos del SenseNova-Loop-9B original (commit `329a65f701ba8c48b73c30d0cbaa6f0449733673`) aplicando cuantizacion Hadamard por bloques de 32 elementos a las proyecciones de atencion, proyecciones GDN, gate/up/down del MLP y lm_head, mientras conserva en BF16 o F32 los embeddings de tokens, la torre de vision, las normas 1D y los planos de compuerta/decaimiento de mHC y GDN. El autor reporta una fidelidad de 0,0236 nats de divergencia KL y un 100,0% de coincidencia top-1 frente al profesor BF16, asi como un 98,89% de fidelidad global. No se documentan en la informacion disponible los datos de entrenamiento del modelo base (numero de tokens, composicion del corpus, uso de RLHF o DPO).

## Capacidades

- Generacion de texto y razonamiento en ingles y chino, con modo de pensamiento (thinking) validado en 10 de 12 pruebas del conjunto Core-12.
- Generacion y edicion de codigo: 23 de 25 (92%) en HumanEval y 36 de 50 en Code-50.
- Procesamiento multimodal imagen-texto: pipeline `image-text-to-text` con torre ViT de 27 niveles.
- Contexto largo: recuperacion de 3 agujas de 3 en ventanas de 16K y 64K, con decodificacion sostenida a 524K y 1M tokens.
- Razonamiento agéntico multi-paso: 6 de 8 en pruebas agenticas segun el autor.
- Decodificacion especulativa sin pesos adicionales (`.ngram` con profundidad 5), con 5,49 tokens por paso.
- Soporte de multiples flujos concurrentes en servidor HTTP (probado con B=4, mHC + LSA).
- Conformidad de API: 211 de 211 comprobaciones superadas en `llmprobe`.
- No se documenta en la informacion disponible soporte explicito de tool calling o function calling, ni capacidades de audio.

## Casos de uso

- Asistente de codigo local en Mac: el paquete permite ejecutar un modelo de 9,4 B con 92% en HumanEval directamente en un Mac de 128 GB mediante `qwg serve`, sin GPU dedicada, usando decodificacion especulativa `.ngram` para alcanzar 165,7 tok/s en tareas predecibles como edicion de codigo.
- Analisis de documentos largos: con 524.288 tokens nativos y recuperacion de agujas validada a 64K, el modelo puede procesar contratos, informes o bases de codigo completas en una sola pasada, manteniendo 49,29 tok/s incluso a 524K tokens con un consumo de 14,27 GiB.
- Procesamiento de imagenes y texto combinados: al ser un modelo `image-text-to-text`, sirve para extraer informacion de capturas, diagramas o documentos escaneados y responder preguntas sobre ellos, cargando la torre de vision con `--load-vision` (6.584 GiB de RSS).
- Servidor de inferencia multiusuario en estacion de trabajo Apple: el modo de 4 flujos concurrentes ofrece 152,96 tok/s agregados (3,02x frente a serial) con un TTFT maximo de 270 ms, adecuado para equipos pequenos que compartan un Mac Studio o MacBook Pro de gama alta.
- Cache de prefijos para chat interactivo: la cache de prefijos en caliente reduce el TTFT a 18 ms (46,1x), lo que hace viable un chatbot con system prompt largo y conversaciones multi-turno con latencia percibida baja.
- Razonamiento con modo thinking en entornos sin conectividad: al ejecutarse integramente en local y con licencia Apache 2.0, encaja en escenarios de privacidad estricta (sanidad, legal, defensa) donde no se permite enviar datos a la nube.
- Prototipado de agentes multi-paso: con 6 de 8 en pruebas agenticas y contexto de 64K, puede orquestar tareas de varios pasos sobre repositorios o conjuntos de documentos, aunque la ausencia documentada de tool calling formal limita la integracion con APIs externas.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| HumanEval | 23/25 (92%) |
| Code-50 | 36/50 |
| Core-12 thinking | 10/12 |
| Capacidad global (`llmprobe`) | 80,6% |
| Agentico | 6/8 |
| Fidelidad vs BF16 (KLD) | 0,0236 nats / 100,0% top-1 |
| Fidelidad global | 98,89% |
| Conformidad API | 211/211 (100%) |
| Prefill 512 / 4K / 16K / 64K | 1.906,3 / 2.044,9 / 1.943,5 / 1.763,2 tok/s |
| Decodificacion mono-flujo (`qwg serve`) | 58,4 tok/s |
| Decodificacion especulativa `.ngram` d=5 | 165,7 tok/s (5,49 tok/paso) |
| Decodificacion 4 flujos HTTP | 152,96 tok/s agregados (3,02x) |
| TTFT cache prefijo caliente | 18 ms (46,1x) |
| Recuperacion 3 agujas @16K / @64K | 3/3 / 3/3 |
| Decodificacion @524K / @1M | 49,29 / 49,35 tok/s (14,27 / 22,42 GiB) |

Todas las cifras proceden de mediciones del autor en un Apple M5 Max (Mac17,6, CPU de 18 nucleos, GPU Apple10 NAX de 40 nucleos, 128 GB de memoria unificada, 585 GB/s de DRAM) con `--kv-mode q4 --lsa-mode auto --temperature 0 --no-profile`. No se dispone de comparaciones con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM / memoria unificada: 4,66 GiB de pesos en GPU; RSS del servidor `qwg serve` de 4,869 GiB sin vision y 6,584 GiB con vision. Working set planificado de 5,13 GiB con contexto 4K y KV q4, y 5,60 GiB con 64K y KV q4. Con KV f16 a 64K asciende a 7,10 GiB.
- Contexto maximo: 14,27 GiB a 524K tokens y 22,42 GiB a 1M tokens (KV q4).
- GPU recomendadas: exclusivamente Apple Silicon con Metal 4; el autor valida en Apple M5 Max con 128 GB. No hay soporte documentado para A100, H100 ni RTX 4090.
- GPU de consumo: si cabe en equipos Apple con memoria unificada suficiente; se requiere al menos ~8 GiB libres para contexto corto y ~24 GiB para contexto de 1M. No es compatible con GPUs NVIDIA o AMD de consumo.
- Opciones de despliegue: unicamente el motor Qwegn v0.27.0 o superior (`qwg serve`, CLI). No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: prefill de 2.044,9 tok/s a 4K; decodificacion mono-flujo de 58,4 tok/s en servidor y 72,25 tok/s en CLI a 512; 165,7 tok/s con especulacion `.ngram`; TTFT de 18 ms con cache de prefijo caliente.
- Estado: 100% residente en memoria unificada de 128 GB, con 0 asignaciones en estado estacionario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-QWP_4 (este) | 9,41 B | 524K nativo, 1M cualificado | Apache 2.0 | QWP1, solo Qwegn en Apple Silicon | 92% HumanEval, 165,7 tok/s especulativo en M5 Max |
| SenseNova-Loop-9B (base) | 9,41 B | 524K nativo | Apache 2.0 | Safetensors (presumiblemente) | Modelo original sin cuantizar; requiere runtime compatible |
| Alternativas de ~9B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

La informacion disponible no incluye comparaciones con otros modelos de la misma categoria, por lo que no es posible establecer una comparativa cuantitativa con alternativas como Qwen, Llama o Gemma.

## Limitaciones y advertencias

- Portabilidad nula: el paquete solo carga en Qwegn v0.27.0 o superior; no es compatible con safetensors, GGUF, MLX ni con ningun otro runtime.
- Exclusivo de Apple Silicon: requiere Metal 4 y macOS reciente; no funciona en GPUs NVIDIA, AMD ni en CPU convencional.
- Idiomas limitados a ingles y chino; no se documenta soporte de castellano ni de otras lenguas.
- Riesgo de alucinacion inherente a los modelos generativos; el autor no reporta evaluaciones de veracidad factual.
- No se documentan sesgos conocidos ni evaluaciones de seguridad o alineacion en la informacion disponible.
- La cuantizacion HQ4_G32 introduce una divergencia de 0,0236 nats KLD frente al BF16; aunque el top-1 se mantiene al 100%, tareas sensibles a la precision numerica pueden degradarse.
- La fidelidad global reportada es del 98,89%, lo que implica un 1,11% de degradacion respecto al modelo sin cuantizar.
- El soporte de tool calling y function calling no esta documentado; el rendimiento agentico es de 6 sobre 8, lo que deja margen de mejora en orquestacion de herramientas.
- El rendimiento reportado se ha medido en un unico equipo (M5 Max de 128 GB); en Macs con menos memoria o generaciones anteriores las cifras pueden ser considerablemente inferiores.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor es un usuario individual (qwegnai), no el desarrollador original del modelo; conviene verificar la integridad de los pesos antes de usarlos en produccion.
- La licencia Apache 2.0 permite uso comercial, pero el formato propietario QWP1 y la dependencia de un runtime concreto pueden condicionar la viabilidad a largo plazo.

## Enlaces

- Hugging Face del paquete: https://huggingface.co/qwegnai/SenseNova-Loop-9B-QWP_4
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Repositorio del motor Qwegn: https://github.com/qwegnai/qwegn
- Commit del modelo base referenciado: `329a65f701ba8c48b73c30d0cbaa6f0449733673`
