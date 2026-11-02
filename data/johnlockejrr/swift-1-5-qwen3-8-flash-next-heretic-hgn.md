# johnlockejrr/Swift-1.5-Qwen3.8-Flash-Next-heretic-HGN

## Resumen

Swift 1.5 Flash-Next — Heretic V2 (HGN v2) es una conversión comunitaria del checkpoint BF16 `jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic` al formato de pesos `.hgn` v2 que consume el motor de inferencia halogen-flash-server, orientado a hardware AMD Strix Halo (gfx1151). El modelo subyacente es un transformer MoE derivado de la arquitectura Qwen 3.8 Flash-Next, pasado por el post-entrenamiento Swift 1.5 y posteriormente sometido a una edición de tipo "abliterated" (Heretic V2) que elimina deliberadamente el comportamiento de rechazo.

La relevancia de esta ficha es doble. Por un lado, documenta un caso poco habitual de cuantización a 4 bits con formato propietario (`.hgn`) que no es cargable por transformers, vLLM ni llama.cpp, sino únicamente mediante el contenedor halogen-flash-server. Por otro, expone el estado real de una conversión no validada: el autor declara explícitamente que la carga, la generación y los benchmarks de calidad están pendientes, y que no se ha comparado la salida CUDA con el backend CPU byte a byte.

El repositorio ocupa 118,8 GB en disco y contiene tres artefactos principales: el checkpoint `model.hgn` (62,1 GiB), una tabla de búsqueda n-gram de 51B parámetros en FP8 (47,7 GiB, obligatoria) y una torre de visión opcional en BF16 (0,84 GiB). El modelo requiere aproximadamente 62 GiB residentes más la tabla n-gram mapeada en memoria. La licencia es `swift-open-license-1.0`, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención lineal y mecanismo de hiper-conexiones (según familias de tensores del manifiesto); derivada de Qwen 3.8 Flash-Next |
| Parametros totales | no disponible (el repo incluye una tabla n-gram de 51B parámetros en FP8, no parámetros del transformer) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (I4R para expertos enrutados, HT4 para proyecciones densas, FP8 para tabla n-gram, BF16 para torre de visión) |
| Idiomas soportados | en, zh |
| Licencia | swift-open-license-1.0 (license_name en la model card; tag `license:other`) |
| Formato de pesos | `.hgn` v2 (hgn-spec 1.1.0); no compatible con safetensors, GGUF ni transformers/vLLM/llama.cpp |
| Tamano en disco | 118,8 GB (118.785.840.932 B) |
| Memoria residente estimada | ~62 GiB + tabla n-gram mapeada en memoria |
| Libreria de inferencia | halogen (halogen-flash-server) |
| Hardware objetivo | AMD Strix Halo, gfx1151 |
| Identidad del checkpoint | `qwen3.8-flash-next-v2` |
| Cabeza MTP (draft) | Incluida (`mtp.*`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) que incorpora atención lineal, proyecciones de experto compartido, mecanismos de hiper-conexión (hyper-connection mixers) y una cabeza de decodificación especulativa MTP (multi-token prediction) incluida en el checkpoint. El manifiesto de conversión distingue familias de tensores como `experts.gate_up_proj` y `experts.down_proj` (expertos enrutados, cuantizados I4R), proyecciones densas, `lm_head`, `embed_tokens` y proyecciones de atención y atención lineal (HT4), además de proyecciones auxiliares de gating y los mixers de hiper-conexión. La cadena de procedencia es: `Qwen/Qwen3.8-Flash-Next` (arquitectura base) → `ukisai/Swift1.5-Qwen3.8-Flash-Next` (post-entrenamiento Swift 1.5) → `jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic` (pesos BF16 abliterated Heretic V2) → este repo (conversión HGN v2).

Según la model card del modelo base, la edición Heretic V2 consiste en un adaptador de rango 1 (`A_r1_lam4.0`) ya fusionado en 7 tensores de salida de atención en las capas 30–37; el resto de pesos es idéntico byte a byte al Swift 1.5 original. En esta conversión el adaptador no se volvió a aplicar. La conversión se realizó con `Quat3rnion/bf16-to-hgn` (perfil `v2`, `--ht-beam 128`) sobre backend CUDA, partiendo de 131 shards safetensors en BF16, y produjo 2.349 tensores de salida a partir de 1.658 tensores fuente. El proceso de `verify` reporta un error relativo de energía de los valores decodificados frente al BF16 original: 0,94 % en expertos enrutados (todas las capas), 0,68 % en la cabeza MTP, 0,61–0,75 % en proyecciones densas, LM head y embeddings, 0,79–1,03 % en proyecciones pequeñas de gating, 0,07–0,10 % en mixers de hiper-conexión y 0,07 % en la tabla n-gram FP8; 52 de las 100 familias decodifican con error exactamente cero y ningún tensor supera el 5 %. No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición del dataset, y no se documenta si hubo RLHF o DPO en el pipeline Swift 1.5.

## Capacidades

- Generación de texto en inglés y chino.
- Razonamiento y conversación multi-turno (capacidad heredada de la arquitectura Qwen 3.8 Flash-Next; no se detalla en la información disponible).
- Decodificación especulativa mediante cabeza MTP incluida en el checkpoint.
- Tabla n-gram de 51B parámetros en FP8 para recuperación de secuencias (lookup n-gram), obligatoria para el funcionamiento del motor.
- Capacidad de visión opcional mediante la torre `qwen38-flash-next-vision.hgn` en BF16; sin ella el motor opera solo en texto.
- Comportamiento sin rechazo (uncensored/abliterated): el modelo no aplica negativas por contenido.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Inferencia local en hardware AMD Strix Halo: el formato `.hgn` y el tag `gfx1151` indican que el destino principal es ejecutar el modelo en iGPU Strix Halo mediante halogen-flash-server, con ~62 GiB residentes más la tabla n-gram mapeada en memoria.
- Investigación sobre cuantización 4-bit: el manifiesto y el informe de `verify` (error por familia de tensores, 52 familias con error cero) sirven como caso de estudio de conversión BF16 → 4-bit con cuantización mixta I4R/HT4/FP8.
- Evaluación de decodificación especulativa: la cabeza MTP incluida permite medir la ganancia de throughput de la generación especulativa frente a la decodificación estándar en el motor halogen.
- Procesamiento de documentos con componente visual: con la torre de visión cargada, el modelo puede abordar tareas de imagen-texto; sin ella queda limitado a texto.
- Experimentación con modelos abliterated: útil para estudiar el efecto de la eliminación del rechazo en las capas 30–37 sobre el comportamiento del modelo en dominios sensibles, siempre dentro del marco legal aplicable.
- Pipelines de texto en inglés y chino: generación y transformación de contenido en los dos idiomas declarados, con la advertencia de que no hay benchmarks de calidad publicados para esta conversión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente "quality benchmarks pending" y "No quality benchmark has been run on this conversion yet", y deja como TODO los datos de velocidad (tok/s en single user, concurrente y prefill), la versión de halogen-flash-server, el hardware y el tiempo de arranque.

## Requisitos de hardware

- VRAM/memoria: aproximadamente 62 GiB residentes para `model.hgn`, más la tabla n-gram de 47,7 GiB mapeada en memoria. Total en disco: 118,8 GB.
- Hardware objetivo: AMD Strix Halo con gfx1151 (iGPU con memoria unificada). El tag `strix-halo` y la ruta del motor confirman este destino.
- GPU NVIDIA: no disponible. El conversor documenta CUDA como cualificado en sm_89, pero la model card deja como TODO la GPU y la compute capability usadas en esta conversión concreta.
- Cabe en GPU de consumo: no, por el tamaño del checkpoint (62 GiB) y la tabla n-gram obligatoria (47,7 GiB). No cabe en RTX 4090 (24 GB) ni en configuraciones de 48 GB.
- Opciones de despliegue: exclusivamente halogen-flash-server (contenedor). No es cargable en transformers, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles (marcados como TODO en la model card).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue | Estado |
|---|---|---|---|---|---|---|
| Este modelo (Swift 1.5 Flash-Next Heretic HGN) | no disponible | no disponible | `.hgn` v2 | swift-open-license-1.0 | halogen-flash-server (AMD gfx1151) | Conversión comunitaria sin validar |
| `jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic` (fuente BF16) | no disponible | no disponible | safetensors BF16 | swift-open-license-1.0 | transformers/vLLM (previsible) | Pesos fuente de esta conversión |
| `ukisai/Swift1.5-Qwen3.8-Flash-Next` | no disponible | no disponible | safetensors | swift-open-license-1.0 | transformers/vLLM (previsible) | Post-entrenamiento Swift 1.5 sin abliterar |
| `Qwen/Qwen3.8-Flash-Next` | no disponible | no disponible | safetensors | no disponible | transformers/vLLM | Arquitectura base |

No se dispone de datos de rendimiento ni de parámetros totales/activos para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo sin censura: el comportamiento de rechazo se ha eliminado deliberadamente. El usuario es el único responsable del uso y debe cumplir la legislación aplicable y la licencia.
- Conversión no validada: la carga y la generación en halogen-flash-server figuran como TODO; no hay benchmarks de calidad ni comparación byte a byte entre la salida CUDA y el backend CPU.
- Formato propietario: los pesos `.hgn` no se pueden cargar en transformers, vLLM ni llama.cpp. El widget del Hub no puede ejecutar el modelo (`inference: false`).
- Dependencia obligatoria de la tabla n-gram: `qwen38-flash-next-ngram.hgn` (47,7 GiB) debe mantenerse junto a `model.hgn`; sin ella el modelo no funciona.
- Idiomas limitados a inglés y chino; no se declara soporte de castellano.
- Licencia `swift-open-license-1.0`: es necesario revisar el texto enlazado antes de cualquier uso comercial; la model card no detalla restricciones adicionales.
- Riesgo de alucinación: no cuantificado para esta conversión; no hay evaluaciones publicadas.
- Sesgos: no documentados en la información disponible.
- Longitud de contexto: no disponible, lo que impide planificar cargas de trabajo de contexto largo.
- Error de cuantización: aunque ningún tensor supera el 5 % de error relativo, los expertos enrutados presentan 0,94 % y las proyecciones pequeñas de gating hasta 1,12 %, lo que puede acumularse en tareas sensibles a la precisión.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/johnlockejrr/Swift-1.5-Qwen3.8-Flash-Next-heretic-HGN
- Modelo base (BF16): https://huggingface.co/jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic
- Post-entrenamiento Swift 1.5: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next/blob/main/LICENSE
- Motor de inferencia halogen-flash-server: https://github.com/peonist-ai/halogen-flash-server
- Conversor bf16-to-hgn: https://github.com/Quat3rnion/bf16-to-hgn
- Especificación del formato HGN: https://github.com/jtsylve/hgn-spec
