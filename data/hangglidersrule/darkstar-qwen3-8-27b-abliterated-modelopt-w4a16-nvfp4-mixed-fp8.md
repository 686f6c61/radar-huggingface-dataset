# HangGlidersRule/Darkstar-Qwen3.8-27B-Abliterated-ModelOpt-W4A16-NVFP4-Mixed-FP8

## Resumen

Darkstar-Qwen3.8-27B-Abliterated-ModelOpt-W4A16-NVFP4-Mixed-FP8 es una cuantización mixta NVFP4/FP8 del derivado abliterado en BF16 de Qwen/Qwen3.8-27B, publicada por el autor HangGlidersRule bajo la marca de ajuste "Darkstar" (linaje interno de edición R3). El proceso es secuencial: primero se aplica la edición de dirección de rechazo (abliteration) sobre los pesos BF16 y después se cuantiza el modelo editado con NVIDIA ModelOpt, de modo que la edición no se ve alterada por el ruido de la cuantización. El problema que resuelve es doble: reducir el rechazo del modelo base ante peticiones que el original denegaría, y servir esa variante con un coste de memoria y una latencia menores en GPUs de clase Blackwell.

La receta seleccionada es mixta: NVFP4 W4A16 con granularidad de grupo 16 en el MLP del lenguaje y en `lm_head`, FP8 e4m3 en las proyecciones de self-attention y de GatedDeltaNet, y BF16 en KV cache, torre de visión, cabezas MTP, `conv1d`, normalizaciones y embeddings. El repositorio ocupa 21,9 GB y el recuento real de parámetros en safetensors es de 18.164.649.200 (unos 18,16 B), pese a que el identificador comercial del modelo diga "27B".

Su relevancia actual es fundamentalmente de investigación e infraestructura: demuestra un flujo ModelOpt fail-closed (validadores de NaN/Inf/escalas cero, sin visión cuantizada, sin metadatos FP8 en KV) y publica dos cifras de rendimiento concretas en el candidato promocionado: 251,889 tok/s en single-stream con decodificación MTP10 y 148/198 (74,75 %) en GPQA. Se distribuye con licencia Apache-2.0 y está pensado para vLLM sobre hardware Blackwell.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con proyecciones GatedDeltaNet (atención lineal) además de self-attention, torre de visión y cabezas MTP (multi-token prediction); derivado de Qwen/Qwen3.8-27B, revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` |
| Parámetros totales | 18.164.649.200 (18,16 B) según safetensors; el nombre del modelo indica "27B", cifra que no coincide con el recuento real |
| Parámetros activos | No aplica: no se declara que la arquitectura sea MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Mixta NVFP4 + FP8 con NVIDIA ModelOpt (`hf_quant_config.json`): W4A16-NVFP4-g16 en `language_mlp` y `lm_head`; FP8-e4m3 en `self_attention` y proyecciones GatedDeltaNet; BF16 en `kv_cache`, `protected`, visión, MTP, `conv1d`, normalizaciones y embeddings. 8-bit por tag; también existe un candidato W4A4-NVFP4 uniforme no construido |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors cuantizados con ModelOpt (formato unificado HF NVFP4/FP8) |

## Arquitectura y entrenamiento

La arquitectura subyacente combina self-attention clásica con proyecciones GatedDeltaNet, lo que apunta a un diseño híbrido de atención con componentes de estado recurrente/lineal, y además incorpora una torre de visión y cabezas MTP. La model card no documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO; el upstream es Qwen/Qwen3.8-27B. Lo que sí se documenta con precisión es el post-procesado: la edición de pesos consiste en una proyección de dirección de rechazo normalizada en float32 aplicada en la capa 38 con semilla 42, sobre exactamente 131 tensores que escriben en el residual, sin tocar la torre de visión.

La cuantización se realizó con ModelOpt reutilizando la receta mixta seleccionada sobre base limpia (`w4a16_nvfp4_mse-fp8_attn-kv_bf16.yaml`, SHA-256 `90fc6b37c00334debd49f1975ab406b5e20667f07e4be0be3e463a648abac642`), con calibración sobre `cnn_dailymail` + `nemotron-post-training-dataset-v2` (512+512 muestras, secuencia 2048, semilla 1234). Se preservaron y readjuntaron los 15 tensores MTP BF16 del modelo fuente mediante la ruta MTP de ModelOpt, y se ejecutaron validadores fail-closed que verificaron ausencia de NaN/Inf y de escalas cero, ausencia de visión cuantizada, presencia de los 15 tensores MTP en BF16, ausencia de metadatos FP8 en KV y ausencia de grupos fusionados mixtos; los 131 tensores editados en R3 se conservaron tras la cuantización. La identidad del artefacto se fija con `_SUCCESS.json` (SHA-256 `3d89ec57c1371e142adc2584de079b54a0e1d8c12dc9550118d0a851da020a79`) y `manifest.sha256` (SHA-256 `642dbbe89b085a2daf5119c37c0496576a475ed64c36653fc993c04abaf2ca9f`).

## Capacidades

- Generación de texto y conversación multi-turno (`text-generation`, `conversational`).
- Razonamiento científico de nivel GPQA: 148/198 aciertos (74,75 %) medidos directamente sobre esta build cuantizada.
- Decodificación acelerada mediante cabezas MTP: 251,889 tok/s en single-stream con la configuración MTP10.
- Respuesta con rechazo reducido: la edición de dirección de rechazo se aplicó en BF16 antes de cuantizar, de modo que persiste en el artefacto final.
- Presencia de torre de visión en BF16 (no cuantizada), aunque la model card no documenta casos de uso multimodales ni evaluación de visión.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declara lista de idiomas.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Servicio de generación de texto de alto rendimiento en GPUs Blackwell: el modelo está cuantizado en NVFP4/FP8 y validado con MTP10 a 251,889 tok/s en single-stream, por lo que es adecuado para endpoints de baja latencia donde el coste por token viene dominado por el ancho de banda de memoria.
- Investigación sobre abliteración y cuantización combinadas: al aplicar la edición en BF16 y cuantizar después, permite estudiar por separado el efecto de la edición y el de la cuantización sobre el comportamiento del modelo, con linaje R3 y recetas con hash verificable.
- Red teaming y evaluación de seguridad: la build publica una evaluación de rechazo (283/283 terminales: 200/200 de cumplimiento dañino, 0/83 de sobre-rechazo seguro, 0 errores), lo que la convierte en un objetivo controlado para probar filtros, clasificadores y políticas de despliegue.
- Generación de contenido creativo y de ficción sin bloqueos temáticos: al haberse reducido la dirección de rechazo, resulta útil en escenarios editoriales donde el modelo base denegaría sistemáticamente tramas, diálogos o personajes controvertidos, siempre bajo revisión humana.
- Asistente conversacional interno sobre corpus propios: con licencia Apache-2.0 y pesos abiertos, puede desplegarse en infraestructura propia para conversaciones multi-turno, aunque la longitud de contexto admitida no está documentada y debe medirse antes de fijar SLA.
- Evaluación comparativa de recetas de cuantización: sirve como punto de referencia frente al candidato W4A4-NVFP4 uniforme (no construido por rechazo de throughput) y frente al BF16 abliterado, para decidir qué precisión usar por componente.
- Pipelines de razonamiento científico asistido: el resultado de GPQA (74,75 %) permite usarlo como componente de verificación o generación de hipótesis en flujos de investigación, con validación posterior obligatoria.
- Despliegue en vLLM sobre clústeres Blackwell: el tag `vllm` y el formato ModelOpt unificado HF NVFP4/FP8 lo integran directamente en ese servidor de inferencia, con KV cache en BF16.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| GPQA | 148/198 = 74,75 % | Medido sobre esta build cuantizada |
| Throughput single-stream (MTP10) | 251,889 tok/s de media | Configuración ganadora declarada en la model card; hardware no especificado |
| Evaluación de rechazo (terminal) | 283/283 sin errores: 200/200 de cumplimiento dañino, 0/83 de sobre-rechazo seguro | Medición directa sobre la build cuantizada |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras evaluaciones estándar en la información disponible. Tampoco se publica comparación numérica BF16 frente a cuantizado más allá de los datos anteriores.

## Requisitos de hardware

- Tamaño de pesos: el repositorio ocupa 21,9 GB, por lo que los pesos cuantizados rondan esa cifra. Es una estimación a partir del tamaño del repo, no un dato declarado de VRAM.
- VRAM estimada para inferencia: por encima de los ~22 GB de pesos hay que sumar KV cache en BF16, activaciones y buffers de runtime. Con contexto corto y lote pequeño, un presupuesto de 26-32 GB es razonable; con lotes grandes o contextos largos, se necesitan 40-80 GB. Estimación propia: la model card no publica cifras de VRAM.
- GPU recomendadas: clase Blackwell, que es la que soporta NVFP4 de forma nativa (B200, GB200, RTX PRO 6000 Blackwell). Las partes en FP8 son nativas en Hopper (H100, H200, L40S), pero el núcleo NVFP4 del MLP y de `lm_head` está pensado para Blackwell.
- GPU de consumo: la RTX 5090 (32 GB, Blackwell) es la candidata más plausible para caber con contexto moderado; una RTX 5080 (16 GB) no es viable por tamaño de pesos. Estimación basada en el tamaño del repo.
- Opciones de despliegue: vLLM (etiquetado explícitamente en los tags y en el formato ModelOpt unificado HF NVFP4/FP8). No se documenta soporte de llama.cpp, Ollama, TGI ni exportación a GGUF; el formato NVFP4 no es compatible con esas rutas.
- Latencia y throughput: 251,889 tok/s de media en single-stream con decodificación MTP10 sobre el build validado. No se especifica la GPU ni la longitud de contexto usadas en esa medición.

## Comparativa con modelos similares

| Modelo | Parámetros | Precisión | Tamaño / repo | Rendimiento declarado | Licencia | Estado |
|---|---|---|---|---|---|---|
| Darkstar-Qwen3.8-27B-Abliterated-ModelOpt-W4A16-NVFP4-Mixed-FP8 | 18,16 B (safetensors) | W4A16 NVFP4 + FP8 mixto, KV BF16 | 21,9 GB | 251,889 tok/s (MTP10), GPQA 74,75 % | Apache-2.0 | Publicado, candidato seleccionado |
| Darkstar-Qwen3.8-27B-Abliterated-BF16 (modelo base) | No disponible | BF16 | No disponible | No disponible | Apache-2.0 | Publicado; contiene la misma edición R3 |
| Darkstar-Qwen3.8-27B-Abliterated-ModelOpt-W4A4-NVFP4 | No disponible | W4A4 NVFP4 uniforme | No construido | No disponible | Apache-2.0 | No construido; descartado por throughput en la comparación sobre base limpia |
| Qwen/Qwen3.8-27B (upstream) | No disponible en la información proporcionada | BF16 | No disponible | No disponible | No disponible en la información proporcionada | Modelo fuente, sin edición de rechazo |

No se dispone de datos de terceros comparables de la misma categoría (mismo tamaño o misma tarea) en la información proporcionada.

## Limitaciones y advertencias

- Rechazo deliberadamente reducido: la evaluación declarada da 200/200 de cumplimiento en peticiones dañinas y 0/83 de sobre-rechazo seguro. El modelo no incorpora mitigaciones de seguridad añadidas y debe desplegarse solo detrás de políticas propias, filtrado y controles de acceso.
- Riesgo de uso indebido: al eliminar la dirección de rechazo, la responsabilidad legal y ética del despliegue recae por completo en quien lo opera; la licencia Apache-2.0 no impone restricciones de uso, lo que no exime de obligaciones regulatorias.
- Alucinación: no se publica ninguna evaluación de veracidad, factualidad ni tasa de alucinación sobre esta build.
- Degradación por cuantización: no se publican comparativas de calidad BF16 frente a NVFP4/FP8 más allá de GPQA y del throughput, por lo que se desconoce la pérdida en otras tareas.
- Idiomas: no se declara lista de idiomas soportados; la calibración usa `cnn_dailymail` y `nemotron-post-training-dataset-v2`, ambos de predominio inglés, lo que puede sesgar el comportamiento en castellano.
- Contexto: la longitud de contexto no está documentada; no debe asumirse ningún valor concreto para planificación de capacidad.
- Discrepancia de nomenclatura: el identificador dice "27B" pero safetensors informa de 18.164.649.200 parámetros. Conviene verificar el recuento antes de dimensionar hardware.
- Compatibilidad restringida: el formato NVFP4 con ModelOpt exige hardware Blackwell para aprovecharse; no hay GGUF ni rutas para llama.cpp u Ollama, lo que limita el despliegue en equipos sin esas GPU.
- Sesgos: no se publica ninguna evaluación de sesgos demográficos, sociales o de toxicidad.
- Visión: la torre de visión se conserva en BF16, pero no hay evaluación ni documentación de uso multimodal, por lo que no debe asumirse que funcione correctamente.
- Trazabilidad: la model card menciona "private checkpoint repository" para el mismo identificador que aparece publicado; conviene fijar la revisión por hash (`_SUCCESS.json` y `manifest.sha256`) en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HangGlidersRule/Darkstar-Qwen3.8-27B-Abliterated-ModelOpt-W4A16-NVFP4-Mixed-FP8
- Modelo base BF16: https://huggingface.co/HangGlidersRule/Darkstar-Qwen3.8-27B-Abliterated-BF16
- Modelo upstream: https://huggingface.co/Qwen/Qwen3.8-27B (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`)
- Repositorio de ingeniería: https://github.com/HangGlidersRule/model-forge
- Receta de cuantización citada en la model card: `recipes/qwen3.8-27b/darkstar-qwen3.8-27b-abliterated-modelopt-nvfp4.yaml`
- Receta de operadores seleccionada: `configs/modelopt/recipes/w4a16_nvfp4_mse-fp8_attn-kv_bf16.yaml`
- Documentación de linaje y edición: `bf16.md`, `artifact-lineage.md`, `modelopt/README.md` (rutas relativas dentro del repositorio indicado)
- Búsqueda web: no se han encontrado enlaces relevantes al modelo, papers, blogs ni demos; los resultados devueltos corresponden a páginas corporativas de un operador de telecomunicaciones sin relación con el artefacto.
