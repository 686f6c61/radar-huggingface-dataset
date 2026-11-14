# SceneWorks/qwen3.8-27b-abliterated-candle

## Resumen

SceneWorks/qwen3.8-27b-abliterated-candle es un rehost de pesos pre-cuantizados del modelo huihui-ai/Huihui-Qwen3.8-27B-abliterated, que a su vez es una version "abliterated" (con el comportamiento de rechazo eliminado) del Qwen/Qwen3.8-27B. Lo publica SceneWorks para que su motor de inferencia Candle resuelva los pesos por un commit SHA inmutable y para que los usuarios de cuantizaciones bajas no tengan que descargar el snapshot completo en bf16 (55,6 GB). Este repositorio no es una distribucion oficial de Qwen ni de huihui-ai.

El modelo es multimodal (pipeline image-text-to-text) e incluye una torre de vision. La innovacion del repo no esta en el modelo en si, sino en el formato de almacenamiento: las proyecciones del decodificador y del modulo MTP estan pre-cuantizadas en bloques GGML crudos que el cargador de Candle reconstruye directamente sin des-cuantizar y re-cuantizar. Se ofrecen dos niveles: q8 (32,4 GB, bloques Q8_0) y q4 (20,0 GB, bloques Q4_K).

La relevancia es operativa: reduce el coste de descarga y despliegue en el runtime Candle, mantiene la torre de vision, embeddings, LM head y normas en bf16 (por lo que sigue aceptando imagenes) y fija la procedencia con un fichero de metadatos de revision. La verificacion es limitada: solo el tier q4 se ha cargado y probado con imagenes en Metal de Apple; el q8 no se ha cargado en acelerador y ninguno se ha ejecutado en CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion (familia Qwen3.5, tag `qwen3_5`), multimodal con torre de vision y modulo MTP; sin detalles adicionales en la informacion disponible |
| Parametros totales | 27B (segun el nombre del modelo; no confirmado de forma independiente) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8 (GGML Q8_0, 32,4 GB) y q4 (GGML Q4_K, 20,0 GB); vision, embeddings, LM head y normas en bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors; proyecciones almacenadas como tensores U8 `[rows, blocks_per_row, block_bytes]` con bloques GGML |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo subyacente pertenece a la familia Qwen3.5 (tag `qwen3_5`) y que es multimodal: incluye una torre de vision bajo `model.visual.*` y un modulo MTP (multi-token prediction). No se detallan el numero de capas, dimensiones ocultas, mecanismo de atencion ni el esquema de entrenamiento (tokens, composicion del dataset, RLHF/DPO) en la informacion proporcionada. La variante abliterated de huihui-ai modifica los pesos para eliminar el comportamiento de rechazo, pero no se documenta la tecnica exacta de abliteracion empleada.

La innovacion tecnica de este repositorio es el pipeline de preparacion de snapshots de candle-llm (`prepare_snapshot`): cada proyeccion del decodificador y del MTP se cuantiza una sola vez y se almacena como bloques GGML crudos, que el cargador de Candle reconstruye directamente sin pasar por des-cuantizacion y re-cuantizacion. `config.json` declara `quantization: {bits, storage: "ggml"}`. Las partes sensibles a la precision (torre de vision, embeddings, LM head y normas) permanecen en bf16 en ambos tiers.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno (heredado de Qwen3.8-27B; sin detalles adicionales en la informacion disponible).
- Entrada de imagenes: pipeline image-text-to-text con torre de vision en bf16, validada en el tier q4 (identifico correctamente imagenes solidas rojas y azules).
- Capacidad de comprension y descripcion de imagenes (image grounding), segun la prueba de verificacion del autor.
- Compatibilidad con el motor Candle de SceneWorks Inference y su cargador de pesos GGML pre-cuantizados.
- Modulo MTP para prediccion multi-token (potencial decodificacion especulativa; no se detalla su uso en la informacion disponible).
- Tool calling, function calling, modo thinking, audio y resto de capacidades especiales: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Inferencia local en macOS con Metal: el tier q4 (20,0 GB) se ha cargado y probado en Apple Metal, por lo que es la opcion practica para ejecutar un modelo de 27B multimodal en hardware Apple sin descargar el snapshot bf16 completo.
- Descripcion y grounding de imagenes: el modelo acepta entrada visual y el tier q4 ya se ha validado nombrando correctamente colores de imagenes solidas; util para tareas basicas de etiquetado o verificacion visual.
- Despliegue con el runtime Candle: al fijar los pesos a un commit SHA inmutable, encaja en pipelines de SceneWorks Inference que necesitan resolucion reproducible de modelos sin depender de snapshots mutables.
- Ahorro de ancho de banda en distribucion interna: el rehost evita descargar 55,6 GB a quien solo necesita los 20,0 GB del tier q4 o los 32,4 GB del q8.
- Investigacion sobre abliteration: al ser una variante sin comportamiento de rechazo, sirve para estudiar el efecto de la abliteracion sobre calidad y seguridad, con la advertencia de que los resultados no son aptos para produccion orientada al publico.
- Entornos con VRAM o memoria unificada limitada: el tier q4 permite probar el modelo en configuraciones donde el bf16 completo no cabe, aunque la verificacion en CUDA sigue pendiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de validacion es cualitativo: el tier q4 se cargo en Metal de Apple y respondio correctamente ante dos imagenes solidas (roja y azul); el tier q8 no se ha cargado en acelerador y ninguno se ha probado en CUDA.

## Requisitos de hardware

- VRAM estimada: ~20,0 GB para el tier q4 y ~32,4 GB para el tier q8, mas el overhead de la torre de vision, embeddings y LM head en bf16.
- GPU recomendadas: no hay datos oficiales; por tamano, el q4 requeriria al menos 24 GB de memoria (RTX 4090, L4, A10G) y el q8 al menos 40 GB (A100 40/80 GB, H100). No confirmado por el autor.
- Consumer GPU: el tier q4 es plausible en RTX 4090 (24 GB) y en Apple Silicon con memoria unificada suficiente; el q8 no cabe en GPUs de consumo de 24 GB.
- Opciones de despliegue: motor Candle de SceneWorks Inference (unico runtime validado). vLLM, llama.cpp, Ollama, TGI y MLX no estan confirmados para este repo; para MLX existe un repo separado (`SceneWorks/qwen3.8-27b-abliterated-mlx`).
- Latencia y throughput: no disponibles. El autor no ha ejecutado los tiers en CUDA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| SceneWorks/qwen3.8-27b-abliterated-candle | 27B | no disponible | q8, q4 GGML | apache-2.0 | Multimodal, runtime Candle, probado solo en Metal |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27B | no disponible | bf16 (upstream) | apache-2.0 | Modelo base abliterado; sin cuantizacion previa |
| Qwen/Qwen3.8-27B | 27B | no disponible | bf16 | apache-2.0 | Modelo original con comportamiento de rechazo |
| SceneWorks/qwen3.8-27b-abliterated-mlx | 27B | no disponible | tiers MLX | apache-2.0 | Misma base, runtime MLX |

No se dispone de datos de rendimiento para comparar numericamente con alternativas.

## Limitaciones y advertencias

- La abliteration elimina el comportamiento de rechazo del modelo, por lo que sus salidas pueden ser inapropiadas para determinadas audiencias; el autor lo advierte explicitamente.
- Verificacion incompleta: solo el tier q4 se ha cargado y probado (en Metal); el q8 no se ha cargado en acelerador y ninguno se ha ejecutado en CUDA. No hay garantia de funcionamiento en produccion.
- No es una distribucion oficial de Qwen ni de huihui-ai; es un rehost de SceneWorks con licencia Apache-2.0 heredada.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible, pero aplicables a un modelo abliterado sin ajuste de seguridad posterior.
- Idiomas soportados y longitud de contexto: no disponibles, lo que limita la planificacion de despliegues multilingues o de contexto largo.
- Compatibilidad de runtime restringida: el formato de pesos GGML crudo esta pensado para el cargador de Candle, no para vLLM, llama.cpp u Ollama.
- Idioma de la model card en ingles y sin detalle de evaluacion cuantitativa; el uso comercial esta permitido por Apache-2.0, pero la responsabilidad sobre el contenido generado recae en el usuario.

## Enlaces

- Hugging Face: https://huggingface.co/SceneWorks/qwen3.8-27b-abliterated-candle
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante MLX: https://huggingface.co/SceneWorks/qwen3.8-27b-abliterated-mlx
