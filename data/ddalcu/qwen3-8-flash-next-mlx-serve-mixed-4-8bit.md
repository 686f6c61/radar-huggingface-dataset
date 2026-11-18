# ddalcu/Qwen3.8-Flash-Next-MLX-Serve-mixed-4-8bit

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje de tipo transformer disperso (MoE) desarrollado por el equipo Qwen de Alibaba, distribuido originalmente bajo el identificador `Qwen/Qwen3.8-Flash-Next`. Esta ficha describe la conversión a formato MLX realizada por el usuario ddalcu para su uso con la herramienta `mlx-serve` en hardware Apple Silicon. El pack emplea cuantización mixta: 4 bits para los expertos enrutados y 8 bits para el resto del tronco, con el objetivo de que el modelo quepa en un Mac de 128 GB de memoria unificada con unos 75 GB residentes.

La arquitectura, etiquetada internamente como `qwen4_exp`, introduce tres innovaciones destacables respecto a generaciones anteriores: flujos residuales con compuertas (gated residual streams) de cuatro vías, una tabla de embeddings de n-gramas de 51B parámetros indexada por bigramas y trigramas hasheados de los token ids, y un mecanismo de atención dispersa (Qwen Sparse Attention) que mantiene el coste de atención plano más allá de los 2048 tokens. El contexto nativo es de 262 144 tokens y el checkpoint completo suma aproximadamente 180B parámetros (125B de tronco más 51B de n-gramas más 4B de la cabeza MTP).

El modelo es relevante porque demuestra una vía práctica para ejecutar un modelo de escala frontier en hardware de consumo de gama alta (Mac Studio/MacBook Pro con M4 Max), algo impensable con arquitecturas densas equivalentes. Además, el pack incluye la torre de visión (entrada de imagen y vídeo) y la cabeza de decodificación especulativa MTP, lo que lo convierte en una opción completa para inferencia local multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso (`model_type: qwen4_exp`) con GDN, atención dispersa, gated residual streams y embeddings de n-gramas |
| Parametros totales | 133.195.562.899 (safetensors del pack); el checkpoint completo original es ~180B (125B tronco + 51B n-gramas + 4B MTP) |
| Parametros activos | no disponible (512 expertos enrutados en 48 capas; no se especifica el número activado por token) |
| Longitud de contexto | 262 144 tokens nativos |
| Tipos de cuantizacion | Mixta: 4 bits grupo 64 (expertos enrutados, embed_tokens), 8 bits grupo 64 (atención, GDN, hyper-connections, indexer, shared experts, lm_head), 4 bits grupo 32 (tabla n-gram), bf16 (routers, gates, norms, convs, estado SSM, torre de visión) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (shards) + `ngram_table.bin` (32 GB, safetensors con extensión `.bin`) + `model-vision.safetensors` (~0.9 GB) |

## Arquitectura y entrenamiento

El tronco combina capas de atención con Gated DeltaNet (GDN) y un MoE con 512 expertos enrutados distribuidos en 48 capas (los 121B parámetros del pack). Sobre esa base, el modelo introduce tres elementos diferenciales. Primero, flujos residuales de cuatro vías (4 x 2560 dimensiones): cada bloque lee una media mezclada por sigmoide de los flujos normalizados y escribe de vuelta mediante compuertas escalares por flujo, sustituyendo la norma final habitual por un mezclador final. Segundo, una tabla de embeddings de n-gramas de 51B parámetros con 16 cabezas, cada una con un espacio de buckets de tamaño primo (~20M filas) y 160 dimensiones por fila, indexada por bigramas y trigramas hasheados de los ids de token e inyectada una sola vez antes de la capa 1; al ser una búsqueda pura no consume cómputo. Tercero, Qwen Sparse Attention: a partir de 2048 tokens, cada capa de atención solo lee los 512 bloques de 4 tokens más relevantes por consulta (seleccionados por un indexador pequeño) más el bloque parcial propio de la consulta, de modo que el coste de atención se mantiene constante con la longitud del contexto.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. El pack incluye la cabeza MTP (multi-token prediction) de una capa del checkpoint original, que actúa como mecanismo de decodificación especulativa. La conversión a MLX aplica varias transformaciones: el `+1` de cada RMSNorm `(1 + w)` se pliega en el peso almacenado, las convoluciones depthwise se transponen al formato `[C, K, 1]` de MLX y `experts.gate_up_proj` se divide en `switch_mlp.gate_proj` y `up_proj`. La tabla de n-gramas se almacena como un único fichero de 32 GB que `mlx-serve` mapea en memoria (mmap) y del que desquantiza en CPU las 16 filas necesarias por token (16 x 80 bytes), subiendo solo el vector resultante de 2560 dimensiones a la GPU; así la tabla nunca pasa a ser residente y su coste es solo page cache.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno con contexto nativo de 262 144 tokens.
- Modo de pensamiento (thinking) activado por defecto según la model card del pack.
- Entrada multimodal de imagen y vídeo mediante la torre de visión incluida (`model-vision.safetensors`).
- Decodificación especulativa con la cabeza MTP propia del checkpoint (`--mtp` o `"enable_mtp": true` por petición).
- Atención dispersa que mantiene el coste plano en contextos largos; recuperación de información tipo needle a 24,8k tokens verificada con atención dispersa activa.
- Caché de prefijo (prefix cache) activada, incluyendo imágenes, para evitar re-prefill en turnos de seguimiento.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente en la información proporcionada.

## Casos de uso

- Asistencia de código en local sobre Mac: el pack acelera la decodificación un 41% con MTP en prompts de código (frente a una ligera penalización en prosa), por lo que resulta adecuado para autocompletado y generación de funciones en un entorno de desarrollo sin conexión a la nube.
- Análisis de documentos largos: con 262k tokens de contexto nativo y atención dispersa de coste plano, se pueden procesar contratos, informes o bases de código extensas en una sola pasada sin truncar.
- Procesamiento de vídeo e imagen: la torre de visión incluida permite tareas de descripción, extracción de información o respuesta a preguntas sobre fotogramas y capturas, con caché de prefijo que acelera turnos sucesivos sobre la misma entrada visual.
- Inferencia privada en hardware de consumo: al ejecutarse íntegramente en un Mac de 128 GB con ~75 GB residentes, es viable para datos sensibles que no pueden salir del dispositivo (sanidad, legal, finanzas).
- Prototipado de agentes conversacionales multi-turno: el contexto largo y el modo thinking por defecto permiten mantener historiales extensos y razonamientos encadenados en una única sesión local.
- Investigación sobre arquitecturas MoE y n-gram embeddings: el pack expone una implementación funcional de gated residual streams, atención dispersa y tabla de n-gramas mmap, útil para experimentos de eficiencia y comparación de mecanismos de recuperación léxica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento medidos disponibles son de inferencia, sobre un M4 Max de 128 GB con mlx-serve 26.8.11:

| Metrica | Valor |
|---|---|
| Memoria residente | ~75 GB (mas cache KV) |
| Decodificacion en serie | ~60 tok/s |
| Decodificacion con MTP | ~78 tok/s (+41% en codigo, -4% en prosa, -4% en prompt de 8,5k tokens) |
| Prefill | ~730 tok/s |
| Recuperacion needle | 24,8k tokens recuperados con atencion dispersa activa |
| KLD mediana vs bf16 | 0,0066 (top-1 87,9%) |

## Requisitos de hardware

- VRAM/memoria unificada: ~75 GB residentes más caché KV; `--kv-quant 8` reduce la caché a la mitad. La tabla de n-gramas (32 GB) no es residente (mmap + page cache).
- Hardware objetivo: Mac con 128 GB de memoria unificada (M4 Max medido). Para Macs de 64 GB existe el pack iQ-MLX-3.3bpw (52 GB residentes, 86 GB de descarga). Para más de 128 GB, el pack de 8 bits (137 GB residentes, 195 GB de descarga).
- GPU NVIDIA: no aplicable; el pack es específico de MLX (Apple Silicon). No se documenta despliegue en CUDA.
- Despliegue: `mlx-serve` (versión medida 26.8.11), con soporte de MTP, caché de prefijo y cuantización de KV. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Limitaciones de servicio v1 en mlx-serve: una petición a la vez (sin decodificación por lotes), especulación PLD/DFlash desactivada (MTP es la vía especulativa). Para prompts superiores a ~64k se recomienda reducir `--prefill-chunk`.
- Latencia: prefill ~730 tok/s; decodificación ~60 tok/s en serie y ~78 tok/s con MTP. Con caché fría, el prefill de prompts muy largos puede pagar hasta ~1 s por cada 8k tokens de lecturas aleatorias en SSD; con caché caliente el coste es nulo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (este pack, mixed-4-8bit) | 133,2B en safetensors (~180B checkpoint completo) | 262 144 | MLX mixto 4/8 bits, ~75 GB residentes | qwen-community-1.0 | Hugging Face (superseded por iQ-MLX-4.7bpw) |
| Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-4.7bpw | mismo checkpoint | 262 144 | MLX iQ 4.7 bpw, ~75 GB residentes | qwen-community-1.0 | Hugging Face; recomendado por el autor (KLD 0,0052, top-1 88,6%) |
| Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-3.3bpw | mismo checkpoint | 262 144 | MLX iQ 3.3 bpw, 52 GB residentes | qwen-community-1.0 | Hugging Face; para Macs de 64 GB |
| Qwen3.8-Flash-Next-MLX-Serve-8bit | mismo checkpoint | 262 144 | MLX 8 bits, 137 GB residentes | qwen-community-1.0 | Hugging Face; para más de 128 GB |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo con modelos de otras familias o de tamaño similar.

## Limitaciones y advertencias

- El autor marca este pack como superado (superseded) por iQ-MLX-4.7bpw: mismo tamaño y misma lectura de bytes por token, pero más cercano a bf16 (KLD mediana 0,0052 frente a 0,0066; top-1 88,6% frente a 87,9%). No recibirá más actualizaciones.
- Licencia `qwen-community-1.0` (etiquetada como `other` en Hugging Face): es necesario revisar el texto de la licencia antes de cualquier uso comercial; no se detallan aquí sus restricciones.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar calidad fuera de los idiomas cubiertos por el modelo base.
- Una sola petición simultánea en mlx-serve v1 (sin decodificación por lotes), lo que limita el throughput en escenarios multiusuario.
- La decodificación especulativa MTP es opt-in y su beneficio depende del prompt (positivo en código, ligeramente negativo en prosa y en prompts largos).
- Prompts por encima de ~64k requieren ajustar `--prefill-chunk` porque la selección de atención dispersa se construye por fragmento.
- Con caché fría, el prefill de prompts muy largos puede sufrir penalizaciones de hasta ~1 s por cada 8k tokens por lecturas aleatorias en SSD.
- El pack está atado a Apple Silicon y a `mlx-serve`; no es portable a CUDA ni a otros runtimes sin reconversión.

## Enlaces

- Pack en Hugging Face: https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-mixed-4-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Pack recomendado (iQ-MLX-4.7bpw): https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-4.7bpw
- Pack para 64 GB (iQ-MLX-3.3bpw): https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-3.3bpw
- Pack de 8 bits: https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-8bit
- Herramienta de despliegue: https://mlxserve.com
