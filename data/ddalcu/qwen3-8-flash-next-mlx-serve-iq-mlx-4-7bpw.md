# ddalcu/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-4.7bpw

## Resumen

`ddalcu/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-4.7bpw` es un pack cuantizado del modelo `Qwen/Qwen3.8-Flash-Next` preparado por el usuario ddalcu para **mlx-serve**, el runtime de inferencia para Apple Silicon. No es un modelo entrenado desde cero, sino una conversión calibrada de los pesos originales a un formato MLX híbrido: expertos en 4 bits (grupo 64) calibrados con matriz de importancia y el resto de tensores en 8 bits, con un promedio de 4,68 bits por peso sobre 128,8 B de pesos cuantizados. El repositorio acumula 2.472 descargas y 22 likes desde su publicación el 1 de octubre de 2026.

El modelo base pertenece a la arquitectura preliminar `qwen4_exp` de Qwen: un tronco híbrido Gated-DeltaNet más MoE con flujos residuales con compuertas, una tabla de embeddings de n-gramas con hash de 51 B de parámetros, atención dispersa nativa (Qwen Sparse Attention) y una ventana de contexto de 262.144 tokens. La nomenclatura del repositorio de tooling lo describe como **125B-A6B**, es decir, 125 B de parámetros en el tronco con ~6 B activos por token; sumando la tabla de n-gramas y la cabeza MTP, el checkpoint completo se cita en 180 B (360 GB en bf16).

Su relevancia práctica es que permite ejecutar un modelo de esa clase en un Mac de 128 GB de memoria unificada con unos 75 GB residentes, gracias a dos decisiones de ingeniería: los expertos en 4 bits y el volcado de la tabla de n-gramas a un fichero mmap de 32 GB que nunca pasa a memoria residente. Incluye además la cabeza MTP para decodificación especulativa y la torre de visión (entrada de imagen y vídeo).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `qwen4_exp`: tronco híbrido Gated-DeltaNet + MoE con flujos residuales con compuertas (*gated residual streams*), atención dispersa (Qwen Sparse Attention) y embedding de n-gramas con hash; cabeza MTP y torre de visión |
| Parámetros totales | 133.195.562.899 (~133,2 B) según los safetensors del pack, que excluyen la tabla de n-gramas; el checkpoint completo se cita como 180 B (125 B de tronco + 51 B de n-gramas + 4 B de MTP) |
| Parámetros activos | ~6 B por token (nomenclatura 125B-A6B del repositorio `PipeNetwork/qwen38-flash-next-mlx`) |
| Longitud de contexto | 262.144 tokens nativos; atención dispersa a partir de 2.048 tokens |
| Tipos de cuantización | Este pack (iQ-MLX 4,7 bpw): expertos enrutados 4 bits grupo 64 con calibración por matriz de importancia; atención, GDN, hyper-connections, indexer, expertos compartidos, `lm_head` y `embed_tokens` en 8 bits grupo 64 (salvo `embed_tokens`, que va en 4 bits); tabla de n-gramas en 4 bits grupo 32; routers, compuertas de inyección, normas, convoluciones y estado SSM en bf16; MTP con la misma política que el tronco. Promedio 4,68 bpw escalas incluidas (expertos 4,50). Packs alternativos: 3,3 bpw, mixed-4-8bit y 8 bits |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | `qwen-community-1.0` (etiquetada como `other` en HuggingFace) |
| Formato de pesos | safetensors en formato MLX (shards del pack) + `ngram_table.bin` (32,0 GB, formato safetensors, extensión `.bin` para que no se cargue automáticamente) + `model-vision.safetensors` en bf16 denso (~0,9 GB) |

## Arquitectura y entrenamiento

El tronco combina capas Gated-DeltaNet con capas de atención y un bloque MoE. La innovación estructural más visible son los **flujos residuales con compuertas**: el residual tiene 4 flujos de 2.560 dimensiones; cada bloque lee una media mezclada por sigmoide de los flujos normalizados y escribe de vuelta mediante compuertas escalares por flujo, y un mezclador final sustituye a la norma final habitual. A esto se añade una **tabla de embedding de n-gramas de 51 B de parámetros**: 16 cabezas, cada una con un espacio de buckets de tamaño primo de ~20 M filas y 160 dimensiones por fila, indexada por bigramas y trigramas con hash de los ids de token e inyectada una sola vez antes de la capa 1. Es una búsqueda pura, sin cómputo, lo que explica que Qwen cite el modelo como 125B pese al tamaño real del checkpoint.

La **Qwen Sparse Attention** mantiene el coste de atención plano respecto al contexto: a partir de 2.048 tokens, cada capa de atención lee únicamente los 512 bloques de 4 tokens más relevantes por consulta (seleccionados por un indexador pequeño) más el bloque parcial propio de la consulta. Sobre el entrenamiento del modelo base no hay información en la documentación disponible (número de tokens, composición del dataset, uso de RLHF/DPO): **no disponible**. Lo que sí se documenta es el proceso de calibración del pack: la matriz de importancia se recogió sobre el checkpoint bf16 con 1,35 M tokens de transcripciones de agentes, código (incluidas incidencias y parches de SWE-bench Lite), prosa y matemáticas, alcanzando todos los expertos de todas las capas. La calidad se mide contra los propios logits del modelo bf16 en 290 posiciones reservadas.

En cuanto al almacenamiento, la tabla de n-gramas no está en los shards: es una única tabla fusionada de 4 bits en `ngram_table.bin`. mlx-serve mapea el fichero en memoria y, por token, descomprime en CPU las 16 filas necesarias (16 × 80 bytes) y sube solo el vector resultante de 2.560 dimensiones; la tabla vive en page cache del sistema operativo y el kernel la desaloja según necesidad. Los tensores del pack también aplican transformaciones de layout para MLX: el `+1` de cada RMSNorm `(1 + w)` plegado en el peso almacenado, convoluciones depthwise transpuestas a `[C, K, 1]` y `experts.gate_up_proj` dividido en `switch_mlp.gate_proj` / `up_proj`.

## Capacidades

- Generación de texto conversacional y continuaciones de prosa, con pipeline declarado `text-generation` y tag `conversational`.
- Razonamiento y matemáticas: la calibración cubre explícitamente dominios de matemáticas y código, con una mejora medida de concordancia top-1 en matemáticas del 87,5 % al 90,0 % frente al pack sin calibrar.
- Generación y edición de código, incluyendo resolución de incidencias sobre repositorios (se usaron incidencias y parches de SWE-bench Lite en el conjunto de calibración).
- Entrada multimodal de imagen y vídeo: el pack incluye la torre de visión en `model-vision.safetensors`.
- Contexto largo nativo de 262.144 tokens con coste de atención constante más allá de 2.048 tokens, adecuado para repositorios, transcripciones y documentos extensos.
- Decodificación especulativa mediante la cabeza MTP de una capa incluida en el checkpoint, activada por defecto y desactivable con `--no-mtp` o por petición.
- Gestión de memoria de contexto configurable: `--kv-quant 8` reduce a la mitad la caché KV.
- Soporte de *tool calling* / agentes y de razonamiento multi-paso: **no disponible** en la información proporcionada (el conjunto de calibración incluye transcripciones de agentes, pero no se documenta soporte formal de function calling).
- Capacidades multilingües: **no disponible**; el repositorio no declara lista de idiomas.

## Casos de uso

- **Agentes de código sobre repositorios completos**: con 262.144 tokens de contexto y atención dispersa de coste plano, el modelo puede mantener en contexto varios módulos, tests e historial de incidencias sin que el coste de atención crezca con la longitud. La calibración se hizo precisamente con incidencias y parches de SWE-bench Lite, lo que alinea la cuantización con ese dominio.
- **Asistente de desarrollo totalmente local en Mac**: un Mac Studio o MacBook con 128 GB de memoria unificada ejecuta el pack con ~75 GB residentes y sin enviar código a la nube; el arranque es un único comando (`mlx-serve --model ... --serve`) y el contexto se dimensiona automáticamente a la memoria disponible.
- **Análisis de documentos y transcripciones largas**: la ventana de 262k tokens permite procesar contratos, informes o transcripciones de reuniones en una sola pasada; conviene precalentar la caché de página antes del *prefill*, porque en frío el acceso aleatorio al fichero de n-gramas puede costar hasta ~1 s por cada 8k tokens.
- **Procesamiento de imagen y vídeo**: la torre de visión incluida permite describir o extraer información de fotogramas y vídeos dentro del mismo pipeline de generación de texto, útil para catalogación de contenido o generación de descripciones accesibles.
- **Generación asistida en edición y redacción**: el pack mantiene una concordancia top-1 del 81,2 % en prosa respecto a bf16 (frente al 87,0 % del pack sin calibrar), suficiente para borradores y reescritura, aunque es el dominio donde la calibración introduce mayor desviación.
- **Servicio de inferencia interactivo en estación de trabajo Apple**: con 157 tok/s de decodificación en un M5 Ultra y 5.411 tok/s de *prefill*, el modelo sirve para asistentes con respuesta en tiempo real en entornos de un solo usuario o equipos pequeños.
- **Investigación sobre arquitecturas Qwen4 preview**: al conservar la cabeza MTP, el indexer de atención dispersa y la tabla de n-gramas operativa, el pack sirve para estudiar el comportamiento de estas innovaciones (atención dispersa, embedding de n-gramas) sin necesidad de 360 GB de pesos bf16.
- **Evaluación comparativa de cuantizaciones**: con métricas publicadas de top-1 y KLD frente a bf16, es un banco de pruebas práctico para medir el impacto de la calibración por matriz de importancia en un MoE de 125 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos publicados son de fidelidad frente al modelo bf16 y de velocidad.

Calidad frente a los logits del modelo bf16 en 290 posiciones reservadas (top-1 = el token greedy del pack coincide con el de bf16; KLD = KL(bf16 || pack) sobre los 1.024 tokens más probables de bf16):

| Pack | Tamaño | Top-1 global / agente / código / matemáticas / prosa | KLD mediana | KLD media |
|---|---|---|---|---|
| mixed-4-8bit (sin calibrar) | 75,3 GB | 87,9 / 89,0 / 88,0 / 87,5 / 87,0 | 0,0066 | 0,158 |
| iQ-MLX-4.7bpw (este pack) | 75,3 GB | 88,6 / 89,0 / 96,0 / 90,0 / 81,2 | 0,0052 | 0,126 |

Velocidad en un M5 Ultra con mlx-serve 26.10.1, seis brazos por pack alternando en una misma sesión y MTP activado:

| Pack | Decodificación (tok/s, mediana e intervalo) | Prefill (tok/s) |
|---|---|---|
| mixed-4-8bit | 166 (141–173) | 5.369 |
| iQ-MLX-4.7bpw | 157 (149–162) | 5.411 |

El autor señala que las medianas de decodificación caen dentro de la variación propia de la decodificación especulativa entre ejecuciones, y que ambos packs leen los mismos bytes por token.

## Requisitos de hardware

- **Memoria**: ~75 GB residentes más la caché KV para este pack. El *prefill* de prompts muy largos con caché de página fría puede costar hasta ~1 s por cada 8k tokens de lecturas aleatorias al SSD; en caliente no tiene coste.
- **Equipo recomendado**: Mac con 128 GB de memoria unificada (configuración recomendada por el autor). Con 64 GB hay que usar el pack de 3,3 bpw (52 GB residentes, 86 GB de descarga). Con más de 128 GB, el pack de 8 bits (137 GB residentes, 195 GB de descarga).
- **Espacio en disco**: 107,3 GB de descarga para este pack, incluyendo el fichero de 32 GB de la tabla de n-gramas.
- **GPU**: exclusivamente Apple Silicon. Se han publicado medidas en M5 Ultra (157 tok/s de decodificación, 5.411 tok/s de prefill) y en M4 Max (52 a 56,5 tok/s con packs de 4-8 bits, según las notas de versión de mlx-serve). Un tercer dato comunitario en llm-bench.io para el pack mixed-4-8bit registra 72 tok/s de pico en 3 ejecuciones sobre 1 GPU.
- **No cabe en GPU de consumo con memoria dedicada**: el modelo requiere memoria unificada de clase 96–128 GB; no hay soporte documentado para CUDA.
- **Opciones de despliegue**: mlx-serve (`mlx-serve --model ddalcu/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-4.7bpw --serve`). El formato y los kernels son específicos de MLX, por lo que no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- **Ajuste de contexto**: mlx-serve dimensiona el contexto a lo que cabe en memoria; `--kv-quant 8` reduce la caché KV a la mitad.
- **Latencia y throughput**: decodificación de 157 tok/s de mediana (149–162) y prefill de 5.411 tok/s en M5 Ultra; ~20 ms por paso de decodificación según las notas sobre el acceso a la tabla de n-gramas.

## Comparativa con modelos similares

No hay datos de benchmarks estándar que permitan comparar con modelos de otras familias. La comparación disponible es entre los distintos packs del mismo modelo:

| Pack | Residente | Descarga | Top-1 global | KLD mediana | Perfil de uso |
|---|---|---|---|---|---|
| iQ-MLX-3.3bpw | 52 GB | 86 GB | 85,6 % | no disponible | Mac de 64 GB; capas de 3 bits con kernels MoE fusionados |
| **iQ-MLX-4.7bpw** (este) | 75 GB | 107 GB | 88,6 % | 0,0052 | Mac de 128 GB (recomendado) |
| mixed-4-8bit | 75 GB | 107 GB | 87,9 % | 0,0066 | Sustituido por este pack: mismo tamaño y menor fidelidad |
| 8 bits | 137 GB | 195 GB | no disponible | no disponible | Equipos con más de 128 GB |
| bf16 (modelo base) | ~360 GB | ~360 GB | referencia | 0 | No ejecutable en hardware de consumo |

Frente al pack de 3,3 bpw, este gana 3 puntos de concordancia top-1 a cambio de 23 GB más de memoria residente; frente al pack sin calibrar del mismo tamaño, mejora la KLD mediana un 21 % y el top-1 global 0,7 puntos, con un retroceso claro en prosa (81,2 % frente a 87,0 %).

## Limitaciones y advertencias

- **Licencia**: `qwen-community-1.0`, etiquetada como `other` en HuggingFace. No se detallan en la información disponible las condiciones de uso comercial; es imprescindible revisar el fichero `LICENSE` del repositorio antes de cualquier despliegue en producción.
- **Dependencia de plataforma**: solo Apple Silicon y el runtime mlx-serve. No hay rutas de despliegue documentadas para CUDA, vLLM, llama.cpp, Ollama o TGI, lo que limita su uso en infraestructura de servidores convencional.
- **Regresión en prosa**: la calibración por matriz de importancia mejora código (96,0 % de top-1) y matemáticas (90,0 %) a costa de la prosa (81,2 % frente al 87,0 % del pack sin calibrar). En tareas de redacción o generación literaria conviene valorar el pack sin calibrar o el de 8 bits.
- **Sesgos**: no se documenta ninguna evaluación de sesgos en la información proporcionada.
- **Alucinación**: no se han publicado evaluaciones de tasa de alucinación. La fidelidad medida es frente a los logits del propio modelo bf16, no frente a la verdad factual, por lo que hereda íntegramente los errores del modelo base.
- **Idiomas**: la lista de idiomas soportados no está disponible; no se puede asumir cobertura multilingüe sin verificarla empíricamente.
- **Rendimiento en contexto largo no verificado**: la atención dispersa está descrita por el autor del modelo base, pero no se han publicado resultados de tareas de contexto largo (needle-in-a-haystack, recuperación multi-documento) para este pack.
- **Coste de prefill en frío**: la tabla de n-gramas se lee por mmap; con la caché de página fría, prompts muy largos pagan hasta ~1 s por cada 8k tokens de lecturas aleatorias en SSD.
- **Memoria**: 75 GB residentes más la caché KV dejan poco margen en un equipo de 128 GB; con contexto de 262k tokens, la caché KV puede dominar el consumo y hacer necesaria la cuantización a 8 bits (`--kv-quant 8`).
- **Naturaleza del artefacto**: es una cuantización comunitaria de un modelo preview (`qwen4_exp`), no una versión oficial de Qwen. Los resultados de calidad y velocidad provienen del autor del pack, con 290 posiciones de evaluación, una muestra pequeña.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-4.7bpw
- Árbol de ficheros del repositorio: https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-4.7bpw/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Pack sin calibrar (mixed-4-8bit): https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-mixed-4-8bit
- Pack de 3,3 bpw: https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-3.3bpw
- Pack de 8 bits: https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-8bit
- Runtime y tooling MLX para el modelo base: https://github.com/PipeNetwork/qwen38-flash-next-mlx
- Notas de versión de mlx-serve: https://github.com/ddalcu/mlx-serve/releases
- Sitio de mlx-serve: https://mlxserve.com
- Ficha de benchmarks del pack mixed-4-8bit: https://llm-bench.io/models/qwen3-8-flash-next-mlx-serve-mixed-4-8bit
