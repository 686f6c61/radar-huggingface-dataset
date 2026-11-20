# freakyskittle/K2-Horizon-MoVA-36B-A4B-DERISKED-GGUF

## Resumen

K2-Horizon-MoVA-36B-A4B-DERISKED-GGUF es una conversión a formato GGUF del modelo Blackfrost-AI/K2-Horizon-MoVA-36B-A4B-DERISKED-BF16, un derivado conductual a nivel de pesos de IFM/K2-Horizon-MoVA-36B-A4B. Lo publica el usuario freakyskittle en Hugging Face y está pensado para su uso con llama.cpp, concretamente con un fork específico del proyecto (MBZUAI-IFM, rama model/K2Horizon) porque la versión upstream no puede cargar la arquitectura `k2-horizon`.

El modelo es un transformer disperso de tipo mixture-of-experts con 37.444.792.020 parámetros totales (etiquetado comercialmente como 36B) y aproximadamente 4B parámetros activos por token. Incorpora además una innovación propietaria denominada MoVA (mixture of value experts), con 64 expertos de valor de los que se activan 4 en las capas MoE. La ventana de contexto nativa declarada es de 524.288 tokens, aunque el propio autor advierte que un equipo de gama consumer no puede servir esa longitud.

La relevancia actual del repositorio es doble: por un lado ofrece cuantizaciones listas para usar en hardware modesto (desde 8 GiB en TQ1_0 hasta 37,1 GiB en Q8_0), y por otro documenta de forma inusualmente transparente qué cuantizaciones producen texto legible y cuáles no. El autor reporta que los formatos ternarios TQ1_0 y TQ2_0 generan "word salad" (texto incoherente) y no deben usarse, mientras que el resto de cuantizaciones probadas sí producen salida legible. El repositorio incluye también un cabezal MTP (multi-token prediction) de tipo DeepSeek-V3 como sidecar, publicado para investigación aunque el autor confirma que no acelera la decodificación en su banco de pruebas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `k2-horizon` (transformer MoE con MoVA), 48 capas (3 densas + 45 MoE) |
| Parametros totales | 37.444.792.020 (≈36B) |
| Parametros activos | ≈4B por token |
| Longitud de contexto | 524.288 tokens nativos |
| Tipos de cuantizacion | IQ3_M, IQ4_XS, IQ4_NL, Q4_K_M, Q4_K_S, Q4_K_DYN (mixta no oficial), Q4_0, Q4_1, Q5_K_M, Q6_K, Q8_0, MXFP4_MOE, TQ1_0, TQ2_0 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base BF16 |

| Parametro arquitectonico | Valor |
|---|---|
| Hidden size | 2560 |
| Cabezas de atención | 32 query / 8 KV, dimensión de cabeza 128 |
| MoE | 100 expertos enrutados, 8 activos, 1 experto compartido |
| MoVA | 64 expertos de valor, 4 activos, en las capas MoE |
| FFN de experto | 768 |
| FFN denso | 6144 |
| Vocabulario | 250.624, embeddings no atados (untied) |
| RoPE theta | 10.000.000 |
| Enrutador | sigmoide, pesos top-k normalizados, escala 2,5 |
| Normalización | RMSNorm agrupada, 2 grupos, eps 1e-6 |

## Arquitectura y entrenamiento

La arquitectura `k2-horizon` combina un tronco transformer con 48 capas, de las cuales las 3 primeras son densas y las 45 restantes son de mezcla de expertos. El enrutamiento usa una función sigmoide con normalización de los pesos top-k y un factor de escala de 2,5, seleccionando 8 de los 100 expertos enrutados más un experto compartido. Sobre las capas MoE se superpone MoVA, un mecanismo de 64 expertos de valor con 4 activos por token, que constituye la aportación arquitectónica diferencial del modelo. La normalización es RMSNorm agrupada en 2 grupos con eps 1e-6, y el vocabulario de 250.624 entradas usa embeddings no atados.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La model card del repositorio GGUF no documenta el proceso de entrenamiento del modelo base; únicamente indica que `DERISKED` es una etiqueta de investigación de Blackfrost y que el modelo es un derivado conductual a nivel de pesos del modelo de IFM, sin que ello implique una garantía de seguridad, cero rechazos ni puntuaciones de benchmark inalteradas. El repositorio incluye un cabezal MTP de una sola capa de estilo DeepSeek-V3 "nextn" (un bloque K2 denso más `eh_proj`, `enorm`, `hnorm` y `shared_head_norm`), entrenado sobre estados ocultos del propio target IQ3_M y que reutiliza `token_embd` y `output` del modelo principal. El autor publica la especificación normativa del forward pass en `mtp/SPEC.md` y una evaluación offline en `mtp/train_eval.json`.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat personalizada que requiere `--jinja` en llama.cpp.
- Modo de razonamiento explícito ("thinking"), con la traza envuelta en la etiqueta `<ifm|think>`; el autor recomienda `reasoning effort high` con temperatura 1,0 y top_p 0,95.
- Razonamiento multi-paso: la muestra de salida documentada abre con estructura de análisis del prompt ("Analyze the User's Request"), lo que indica descomposición explícita de la petición.
- Capacidad de predicción multi-token (MTP) mediante cabezal sidecar opcional, publicado para investigación.
- Soporte de contexto largo nativo de hasta 524.288 tokens (no viable en hardware consumer según el propio autor).
- No se documenta soporte de tool calling, function calling, visión, audio ni capacidades de agente en la información disponible.
- Multilingüe: no disponible; la model card declara únicamente inglés.

## Casos de uso

- Despliegue local en GPU integrada para experimentación: con la cuantización IQ3_M (15,4 GiB) el modelo se ejecutó en una Radeon 680M con `-ngl 99` a 7,1 tok/s, lo que permite probar un MoE de 36B en un portátil sin GPU dedicada.
- Investigación sobre arquitecturas MoE con expertos de valor: MoVA (64 expertos, 4 activos) es un mecanismo poco común que puede estudiarse con esta conversión sin necesidad de montar el stack BF16 completo.
- Evaluación de cuantizaciones extremas: el repositorio documenta qué formatos (TQ1_0, TQ2_0) rompen la coherencia del texto, lo que lo convierte en un banco de pruebas útil para estudiar el límite de compresión de un MoE de 36B.
- Servicio de chat en CPU con contexto moderado: con IQ4_XS (18,9 GiB) el autor midió 12,9 tok/s en CPU, suficiente para un asistente conversacional de un solo usuario con `-c 4096`.
- Investigación sobre decodificación especulativa: el cabezal MTP en Q8_0 (98 MiB) y el fichero fusionado IQ3_M-MTP permiten experimentar con rutas de verificación y mejorar el camino de verify, aunque el autor confirma que no aporta velocidad.
- Prototipado de pipelines con llama.cpp: la integración vía `llama-server` con endpoint HTTP (`--host 0.0.0.0 --port 8082`) permite montar una API compatible con clientes de chat para pruebas internas.
- Estudio de derivados conductuales: al ser un derivado "DERISKED" de un modelo IFM, sirve para analizar cómo cambia el comportamiento de un modelo al modificarse sus pesos sin reentrenamiento completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta MMLU, HumanEval, GSM8K ni métricas equivalentes, y advierte explícitamente que `DERISKED` no implica puntuaciones de benchmark inalteradas respecto al modelo de origen.

Los únicos datos de rendimiento publicados son medidas de velocidad de generación en un banco de pruebas concreto (Ryzen 6850H / Radeon 680M, fork `b1-42adf01`, prompt `The capital of France is`, temperatura 0, `--jinja`):

| Fichero | Tamano | Legible | Modo de ejecucion | Velocidad |
|---|---|---|---|---|
| IQ3_M | 15,4 GiB | Si | Vulkan, `-ngl 99` | 7,1 tok/s |
| IQ4_XS | 18,9 GiB | Si | CPU | 12,9 tok/s |
| IQ4_NL | 19,9 GiB | Si | CPU (con otra carga en la maquina) | 0,3 tok/s |
| Q4_K_M | 20,9 GiB | Si | CPU (`-ngl 99` provoco `ErrorDeviceLost`) | no reportada |
| Q5_K_M | 24,7 GiB | Si | CPU | 2,3 tok/s |
| Q6_K | 28,7 GiB | Si | CPU | 0,5 tok/s |
| Q8_0 | 37,1 GiB | Si | CPU | 0,4 tok/s |
| TQ1_0 | 8,0 GiB | No | Vulkan | ~9 tok/s (word salad) |
| TQ2_0 | 9,6 GiB | No | Vulkan | ~14 tok/s (word salad) |
| Q4_K_S | 19,9 GiB | No probado | Subido | no disponible |
| Q4_0 | 19,8 GiB | No probado | Subido | no disponible |
| Q4_1 | 22,0 GiB | No probado | Subido | no disponible |
| MXFP4_MOE | 20,3 GiB | No probado | Subido (tensores MoE en MXFP4) | no disponible |
| Q4_K_DYN | 21,2 GiB | No probado | Subido (4-bit mixta, no oficial de Unsloth) | no disponible |

El autor advierte que estas velocidades no constituyen un benchmark: varias ejecuciones compartieron máquina con el proceso de cuantización. Además, Q8_0, Q6_K y Q5_K_M rechazaron `-ngl 99` con el error `failed to fit params to free device memory`.

## Requisitos de hardware

- VRAM/RAM: todos los 36B pesos deben residir en RAM o VRAM simultáneamente; "4B activos" es el coste de cómputo por token, no el tamaño del fichero.
- Huella por cuantización: desde 8,0 GiB (TQ1_0, no funcional) y 9,6 GiB (TQ2_0, no funcional) hasta 37,1 GiB (Q8_0). Las opciones legibles más ligeras son IQ3_M (15,4 GiB) e IQ4_XS (18,9 GiB).
- GPU consumer: IQ3_M se ejecutó con offload total (`-ngl 99`) en una Radeon 680M (GPU integrada). Q4_K_M provocó `ErrorDeviceLost` al intentar offload completo en esa misma GPU. Q5_K_M, Q6_K y Q8_0 no caben en 680M.
- GPU recomendadas: no disponible; el autor no publica pruebas en A100, H100 ni RTX 4090. Por tamaño, IQ4_XS (18,9 GiB) encajaría en GPUs de 24 GB como la RTX 4090, e IQ3_M (15,4 GiB) en GPUs de 16 GB, aunque no hay mediciones publicadas que lo confirmen.
- Despliegue: exclusivamente llama.cpp con el fork MBZUAI-IFM en la rama `model/K2Horizon`, commit `42adf01`. La versión upstream de llama.cpp no carga la arquitectura `k2-horizon`. No se documenta soporte en vLLM, TGI, Ollama ni otros motores.
- Compilación: `cmake -B build -DGGML_VULKAN=ON -DCMAKE_BUILD_TYPE=Release` y `cmake --build build -j --target llama-server llama-cli`.
- Variables de entorno: en la Radeon 680M es necesario `GGML_VK_DISABLE_ASYNC=1` para evitar salidas con `?` o NaN.
- Contexto práctico: el autor ejecuta con `-c 4096`; servir los 524.288 tokens nativos no es viable en hardware de clase 680M.
- Enrutadores (`attn_v_gate`): se mantienen en F32 en todas las cuantizaciones. No se usó imatrix (el pase falló durante la carga).

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo que permitan una comparación de rendimiento rigurosa con alternativas. La comparación se limita a parámetros, contexto y licencia:

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| K2-Horizon-MoVA-36B-A4B-DERISKED | 37,4B | ≈4B | 524.288 | Apache 2.0 | GGUF (fork llama.cpp) |
| IFM/K2-Horizon-MoVA-36B-A4B (origen) | ≈36B | ≈4B | 524.288 | no disponible en la informacion | safetensors (BF16) |
| Blackfrost-AI/K2-Horizon-MoVA-36B-A4B-DERISKED-BF16 | 37,4B | ≈4B | 524.288 | Apache 2.0 | safetensors (BF16) |

No se han identificado en la información proporcionada modelos de terceros comparables en tamaño y arquitectura (MoE de ~36B con ~4B activos y contexto de 512K). Cualquier comparación con familias como Mixtral, Qwen MoE o DeepSeek requeriría datos de benchmarks que este repositorio no publica.

## Limitaciones y advertencias

- Cuantizaciones rotas: TQ1_0 y TQ2_0 no producen texto legible; generan repeticiones de palabras sueltas sin estructura de frase. No deben usarse en producción.
- Cuantizaciones sin verificar: Q4_K_S, Q4_0, Q4_1, MXFP4_MOE y Q4_K_DYN están subidas pero no se probaron con generación. Q4_K_DYN es una mezcla 4-bit no oficial (mantiene salida y proyecciones de atención en Q6_K, embeddings en Q5_K y enrutadores en F32) y no es una cuantización dinámica oficial de Unsloth.
- Dependencia de un fork: el modelo no carga en llama.cpp upstream. Requiere el fork MBZUAI-IFM en el commit `42adf01`, lo que limita su integración en pipelines estándar y su mantenimiento a largo plazo.
- Plantilla de chat personalizada: solo se aplica con `--jinja`. Sin ese flag el formato de conversación es incorrecto.
- Problema en Windows: el motor de regex de MSVC rechaza el patrón del tokenizador y produce `Failed to process regex`; el autor recomienda usar el fork en Linux.
- Inestabilidad en Vulkan: en GPUs integradas como la 680M, las subidas asíncronas de Vulkan han producido basura (`?`/NaN) con otros modelos; se requiere `GGML_VK_DISABLE_ASYNC=1`.
- Etiqueta "DERISKED": es una etiqueta de investigación de Blackfrost, no una garantía de seguridad, de cero rechazos ni de puntuaciones de benchmark sin cambios. No debe interpretarse como un modelo alineado o evaluado en seguridad.
- Sesgos: no disponible; el autor no documenta evaluación de sesgos.
- Alucinación: no disponible; no se publican evaluaciones de factualidad.
- Idioma: solo inglés declarado. No hay soporte multilingüe documentado.
- Contexto: los 524.288 tokens nativos no son servibles en hardware consumer; el autor trabaja con 4.096 tokens.
- Licencia: Apache 2.0 permite uso comercial, pero la condición de derivado de un modelo IFM y la falta de documentación del entrenamiento original aconsejan revisar las obligaciones heredadas antes de un despliegue comercial.
- MTP sin ganancia de velocidad: el cabezal de predicción multi-token funciona pero la decodificación simple fue más rápida en todas las mediciones del autor; se publica solo para investigación.
- Sin imatrix: las cuantizaciones se generaron sin matriz de importancia porque el pase falló durante la carga, lo que puede afectar a la calidad relativa frente a cuantizaciones convencionales.
- Tamaño del repo: 324,6 GB en total, lo que exige planificación de almacenamiento si se descargan varias cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/freakyskittle/K2-Horizon-MoVA-36B-A4B-DERISKED-GGUF
- Modelo base BF16: https://huggingface.co/Blackfrost-AI/K2-Horizon-MoVA-36B-A4B-DERISKED-BF16
- Modelo de origen IFM: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Fork de llama.cpp requerido (rama model/K2Horizon): https://github.com/MBZUAI-IFM/llama.cpp/tree/model/K2Horizon
- Commit del fork: `42adf01`
