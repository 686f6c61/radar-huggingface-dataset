# blaj/LFM2.5-8B-A1B-heretic-int8-ov

## Resumen

`blaj/LFM2.5-8B-A1B-heretic-int8-ov` es una conversión a OpenVINO IR en int8 del modelo `Dingdust/LFM2.5-8B-A1B-heretic`, que a su vez es una versión "abliterated" (decensored) de `LiquidAI/LFM2.5-8B-A1B` de Liquid AI. El resultado es un modelo de generación de texto con pesos cuantizados a 8 bits asimétricos, empaquetados en el formato de grafo intermedio de OpenVINO, pensado para inferencia local sobre hardware Intel (CPU, GPU integrada Arc e Infinity Arc) y servidores OpenVINO Model Server. El repositorio ocupa 8,0 GB (8,5 GB según los metadatos de HuggingFace) y se distribuye bajo la LFM Open License v1.0.

La arquitectura de partida es `Lfm2MoeForCausalLM`, un transformer de tipo mezcla de expertos (MoE) con 24 capas. La nomenclatura del modelo indica 8B de parámetros totales y aproximadamente 1B activos por token, si bien la model card no confirma explícitamente esas cifras. La longitud de contexto y los idiomas soportados no se declaran en la información disponible.

Su relevancia es doble. Por un lado, documenta una ruta de conversión en dos etapas (exportación a fp16 con `optimum-cli` y compresión posterior del IR con `nncf.compress_weights`) que permite cuantizar modelos MoE grandes en máquinas con 30 GB de RAM, algo que la vía directa `--weight-format int8` no consigue por agotamiento de memoria. Por otro, al tratarse de una variante abliterated, presenta un comportamiento de rechazo reducido, lo que lo orienta a investigación y análisis de alineación más que a despliegues de producción sin supervisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Lfm2MoeForCausalLM, transformer con mezcla de expertos (MoE), 24 capas |
| Parámetros totales | 8 000 M según nomenclatura del modelo; no confirmado en la model card |
| Parámetros activos | ~1 000 M según nomenclatura "A1B"; no confirmado en la model card |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (INT8_ASYM, ratio=1.0) en este repositorio; variante int4 en repositorio hermano; origen en BF16 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (`license: other`, `license_name: lfm1.0`) |
| Formato de pesos | OpenVINO IR (`openvino_model.xml` + `openvino_model.bin`) |
| Tamaño del repositorio | 8,0 GB según la model card; 8,5 GB según metadatos de HuggingFace |
| Biblioteca | openvino (`openvino_genai`) |
| Pipeline | text-generation |
| Modelo base | `Dingdust/LFM2.5-8B-A1B-heretic`, derivado de `LiquidAI/LFM2.5-8B-A1B` |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 2026-09-20 (metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El modelo no aporta entrenamiento propio: es una conversión de pesos y una cuantización. El checkpoint de origen es `Dingdust/LFM2.5-8B-A1B-heretic` en BF16, distribuido en 18 fragmentos y 16,9 GB, con arquitectura `Lfm2MoeForCausalLM` de 24 capas. Ese checkpoint es a su vez una versión abliterated de `LiquidAI/LFM2.5-8B-A1B`: la abliteración es una técnica de post-entrenamiento que elimina direcciones del espacio de activaciones asociadas al comportamiento de rechazo, sin reentrenar el modelo desde cero. No se detallan en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo fases de RLHF o DPO.

La innovación técnica documentada está en el pipeline de conversión, en dos etapas en lugar de una sola llamada a `optimum-cli`. La vía directa `optimum-cli --weight-format int8` no completa en una máquina de 30 GB: carga el checkpoint PyTorch completo (unos 27 GB de RSS máximo medido) además de construir el grafo trazado, y alcanza 28,6 GB de RSS anónimo antes de que el OOM killer termine el proceso; el autor confirma tres intentos fallidos, incluso con 26 GB de RAM libre. La solución consiste en exportar primero un IR en fp16 (etapa 1, streaming de pesos sin pasada de compresión adicional) y aplicar después `nncf.compress_weights(..., INT8_ASYM, ratio=1.0)` directamente sobre el modelo OpenVINO (etapa 2, sin PyTorch ni trazado). La segunda etapa tarda 29 segundos con un RSS máximo de 24,9 GB. El ajuste decisivo fue limitar los pools de hilos (`OMP_NUM_THREADS=4`, `MKL_NUM_THREADS=4`, `OPENBLAS_NUM_THREADS=4`, `NUMEXPR_NUM_THREADS=4`): con la configuración por defecto se lanzan más de 200 hilos y cada worker de OpenMP materializa sus propios búferes durante el trazado, lo que dispara el consumo hasta el OOM; con el límite el proceso baja a 12 hilos y completa en unos 10 minutos.

## Capacidades

- Generación de texto y conversación multi-turno, con plantilla de chat incluida (`chat_template.jinja`).
- Inferencia local acelerada sobre hardware Intel mediante OpenVINO, ejecutable en CPU, GPU integrada Arc y NPU.
- Comportamiento de rechazo reducido por efecto de la abliteración (etiquetas `uncensored` y `abliterated`), orientado a investigación sobre alineación.
- Ejecución eficiente derivada de la arquitectura MoE, con aproximadamente 1B de parámetros activos por token según la nomenclatura del modelo.
- Compatibilidad con `openvino_genai.LLMPipeline` y con OpenVINO Model Server para servir el modelo por red.
- Soporte de decodificación con parámetros configurables (`max_new_tokens`, `temperature`) a través de `GenerationConfig`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Modo thinking, visión, audio: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible; la model card no declara idiomas.

## Casos de uso

- Asistente conversacional totalmente local en portátiles con Intel Core Ultra: el modelo se ejecuta sobre la iGPU Arc mediante `og.LLMPipeline(..., "GPU")`, con 49,1 tok/s medidos en un Core Ultra 7 258V, lo que permite sostener un chat interactivo sin conexión y sin enviar datos a servicios externos.
- Investigación sobre alineación y abliteración: la variante heretic permite estudiar experimentalmente qué comportamientos de rechazo se eliminan y cuáles persisten, comparando respuestas contra el modelo base `LiquidAI/LFM2.5-8B-A1B` con los mismos prompts.
- Evaluación de cuantización int8 frente a int4: el repositorio hermano `blaj/LFM2.5-8B-A1B-heretic-int4-ov` usa la misma base y un pipeline equivalente, lo que permite medir el intercambio entre tamaño, velocidad y calidad de salida variando únicamente la precisión de los pesos.
- Prototipado de aplicaciones de texto en el borde (edge): con 8,0 GB de pesos y un TTFT de 0,076 s, el modelo es viable en equipos de escritorio y mini-PC con 16 GB de RAM o más, sirviendo resúmenes, reescritura y clasificación de texto en local.
- Servicio interno con OpenVINO Model Server: el autor valida el despliegue con OVMS 2026.4.0 sobre el dispositivo GPU, de modo que el modelo puede exponerse como endpoint HTTP para herramientas internas de una organización.
- Generación de borradores de ficción y contenido creativo sin filtros de rechazo agresivos: útil en talleres de escritura donde los filtros de seguridad de los modelos alineados interrumpen tramas con contenido adulto o conflictivo, asumiendo la revisión humana posterior.
- Reproducción de la ruta de conversión para otros modelos MoE grandes: las notas del repositorio sirven como receta reutilizable (capado de hilos OpenMP, exportación fp16 intermedia, compresión NNCF posterior) para cuantizar checkpoints que no caben en memoria con la vía directa de `optimum-cli`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos medidos son de rendimiento de inferencia, en un solo stream sobre Intel Core Ultra 7 258V (iGPU Arc 130V/140V), 30 GB de RAM y OpenVINO Model Server 2026.4.0 en el dispositivo GPU:

| Métrica | Este build (int8) | Build hermano (int4) |
|---|---|---|
| Throughput | 49,1 tok/s | 74,3 tok/s |
| Time to first token | 0,076 s | 0,072 s |
| Tamaño del modelo | 8,0 GB | 4,3 GB |

## Requisitos de hardware

- Pesos en int8: 8,0 GB en disco. La VRAM necesaria para inferencia no está publicada; como estimación de partida hay que sumar a esos 8,0 GB la caché KV y los búferes de runtime, lo que sitúa el consumo típico por encima de los 8 GB de pesos.
- Hardware validado por el autor: Intel Core Ultra 7 258V con iGPU Arc 130V/140V y 30 GB de RAM, ejecutando OpenVINO Model Server 2026.4.0 sobre el dispositivo GPU.
- GPU compatibles: el plugin GPU de OpenVINO está orientado a GPUs Intel (integradas Arc e Infinity Arc y discretas Intel). No se documenta soporte para GPUs NVIDIA o AMD en este repositorio; para esas plataformas habría que convertir los pesos a otro formato.
- Cabe en equipos de consumo con suficiente memoria unificada o RAM: los 8,0 GB de pesos son asumibles en portátiles con 16-32 GB de RAM y en iGPUs Intel con memoria compartida. No se publican datos de ejecución en GPUs de consumo tipo RTX 4090.
- Para la conversión (no la inferencia) se necesitan del orden de 25-30 GB de RAM libres en la etapa intermedia y el capado obligatorio de hilos OpenMP; sin él, el proceso muere por OOM.
- Opciones de despliegue: `openvino_genai.LLMPipeline` (Python), OpenVINO Model Server y el ecosistema `optimum-intel` / NNCF. Formatos como GGUF, llama.cpp, Ollama, TGI o vLLM no están disponibles en este repositorio y requerirían una conversión adicional.
- Latencia y throughput medidos: 49,1 tok/s de generación y 0,076 s hasta el primer token en la configuración indicada, en un único stream.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Tamaño | Rendimiento medido | Licencia |
|---|---|---|---|---|---|---|
| Este build (int8) | 8B totales / ~1B activos (según nomenclatura) | no disponible | OpenVINO IR int8 | 8,0 GB | 49,1 tok/s; TTFT 0,076 s | LFM Open License v1.0 |
| `blaj/LFM2.5-8B-A1B-heretic-int4-ov` | idénticos | no disponible | OpenVINO IR int4 | 4,3 GB | 74,3 tok/s; TTFT 0,072 s | LFM Open License v1.0 |
| `Dingdust/LFM2.5-8B-A1B-heretic` | idénticos | no disponible | BF16, 18 fragmentos | 16,9 GB | no disponible | LFM Open License v1.0 |
| `LiquidAI/LFM2.5-8B-A1B` | idénticos | no disponible | no disponible | no disponible | no disponible | LFM Open License v1.0 |

No se dispone de datos de benchmarks ni de especificaciones de contexto para comparar con modelos MoE de otros fabricantes de la misma categoría, por lo que la comparativa se limita a las variantes derivadas del mismo checkpoint.

## Limitaciones y advertencias

- Modelo abliterated: el comportamiento de rechazo está reducido de forma deliberada. Puede generar contenido que un modelo alineado rechazaría, incluido material ofensivo, inseguro o legalmente problemático. El propio autor lo etiqueta como `uncensored` y lo destina a investigación e inferencia local.
- No apto para producción sin supervisión ni para aplicaciones orientadas a usuarios finales sin capas adicionales de moderación.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de veracidad ni de calidad de generación para esta conversión.
- La cuantización int8 puede degradar la calidad respecto al checkpoint BF16 original; el repositorio no incluye ninguna medición comparativa de calidad entre ambas precisiones.
- Longitud de contexto e idiomas soportados no declarados, lo que impide garantizar el comportamiento en contextos largos o en castellano.
- Licencia LFM Open License v1.0: permite la redistribución, pero incluye un umbral de uso comercial que aplica a esta obra derivada. Es necesario revisar el fichero `LICENSE` incluido antes de explotarlo comercialmente.
- Repositorio sin adopción comunitaria (0 descargas, 0 likes), sin validación independiente de su funcionamiento más allá de las pruebas del autor.
- El proceso de conversión documentado depende de versiones concretas (`transformers==5.4.0` como requisito del gate de exportación) y falla con OOM si no se limita el número de hilos OpenMP.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; toda la información procede de la model card y de los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/blaj/LFM2.5-8B-A1B-heretic-int8-ov
- Variante int4 del mismo autor: https://huggingface.co/blaj/LFM2.5-8B-A1B-heretic-int4-ov
- Modelo base abliterated: https://huggingface.co/Dingdust/LFM2.5-8B-A1B-heretic
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Metodología de benchmark del autor: https://huggingface.co/blaj/LFM2.5-8B-A1B-heretic-int8-ov/blob/main/BENCHMARK.md
- Licencia LFM Open License v1.0: https://huggingface.co/blaj/LFM2.5-8B-A1B-heretic-int8-ov/blob/main/LICENSE
- La búsqueda web no devolvió ningún otro enlace relevante (papers, blogs o demos) para este modelo.
