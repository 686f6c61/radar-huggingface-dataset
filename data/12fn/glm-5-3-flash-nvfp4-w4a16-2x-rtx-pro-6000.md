# 12fn/GLM-5.3-Flash-NVFP4-W4A16-2x-RTX-PRO-6000

## Resumen

GLM-5.3-Flash-NVFP4-W4A16-2x-RTX-PRO-6000 es una cuantización comunitaria del modelo zai-org/GLM-5.3-Flash publicada por el usuario 12fn. No se trata de un modelo nuevo: es un checkpoint convertido a precisión mixta con ModelOpt para que el modelo original quepa, sin offload a CPU y con tensor parallelism 2, en dos GPU NVIDIA RTX PRO 6000 Blackwell Workstation Edition de 96 GB cada una. El autor parte de la revisión `eb9eb208eb0d988989d07a6a12d0fdeb5f52574a` de los pesos oficiales y verifica byte a byte los 1.804 tensores no expertos.

El interés de esta ficha está en la receta de despliegue más que en el modelo en sí: incluye una configuración de vLLM validada sobre una imagen nightly concreta, con atención MLA dispersa para SM120, caché KV en `fp8_ds_mla` y backend de MoE `humming`. El checkpoint pasa de 305,8 GiB a 178,7 GiB en 62 shards y 113.260 tensores, cuantizando únicamente los expertos enrutados (288 por capa, capas 3 a 45) a NVFP4 con activaciones de 16 bits; el resto de tensores se mantiene idéntico al original.

La relevancia práctica es que demuestra que un modelo de la familia GLM con torre de visión, atención KDA/MLA con indexer y decodificación especulativa MTP puede servirse a 262.144 tokens de contexto en hardware de estación de trabajo Blackwell, con 83,2 tok/s en decodificación de un solo flujo y 304 tok/s agregados con concurrencia 8. El margen de memoria es mínimo (97.242 de 97.246 MiB por GPU), así que la receta es frágil fuera de la configuración exacta validada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención KDA, MLA e indexer, torre de visión y expertos MTP; familia `glm5_next` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE con 288 expertos enrutados por capa en las capas 3 a 45) |
| Longitud de contexto | Perfil de servicio validado a 262.144 tokens; recuperación tipo needle superada con 464.640 tokens de entrada |
| Tipos de cuantizacion | NVFP4 W4A16 en expertos enrutados; FP8 por bloques en MLP denso y compartido; BF16/FP8 nativo en atención, router, normas, embeddings, `lm_head` y torre de visión; configuración ModelOpt `MIXED_PRECISION` |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | safetensors; 62 shards, 113.260 tensores; 178,7 GiB de checkpoint (el repo de HuggingFace declara 76,0 GB) |

## Arquitectura y entrenamiento

El modelo base es un MoE de la familia GLM con capas 3 a 45 pobladas por 288 expertos enrutados cada una, más expertos MTP (multi-token prediction) en la capa 45. La atención combina KDA, MLA y un indexer, e incluye una torre de visión, lo que lo sitúa en la categoría image-text-to-text. Esta publicación no entrena nada: aplica una conversión de precisión con ModelOpt sobre los pesos oficiales, sin calibración de activaciones, y conserva el MLP denso y el compartido en FP8 por bloques original.

La innovación técnica del artefacto es el empaquetado para SM120 (Blackwell). Solo se cuantizan los expertos enrutados a NVFP4 con activaciones de 16 bits, y los 1.804 tensores no expertos se verifican byte a byte contra el origen. El único cambio de formato es sin pérdida: 138 tensores de escala FP32 del MLP se renombran de `.weight_scale_inv` con forma `[out_blocks, in_blocks]` a `.weight_scale` con forma `[out_blocks, 1, in_blocks, 1]` para que los cargue ModelOpt estándar, sin modificar sus bytes. No se dispone de información sobre el dataset de entrenamiento, el número de tokens o las fases de RLHF/DPO del modelo original.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso, con parser de razonamiento `glm47` en vLLM.
- Tool calling y elección automática de herramienta (`--tool-call-parser glm47 --enable-auto-tool-choice`).
- Procesamiento de imagen y texto: la torre de visión está incluida en los pesos, aunque el perfil de servicio del autor es solo texto.
- Contexto largo: recuperación de información verificada a 32K, 64K, 128K y 464.640 tokens de entrada.
- Generación de código: el código generado por el autor pasó 1.006 casos de prueba.
- Decodificación especulativa MTP disponible (mejora el flujo único, penaliza el decode por lotes y el prefill).
- Matemáticas y aritmética: 20/20 respuestas factuales/aritméticas correctas y un problema de 30 pasos resuelto por completo en las pruebas del autor.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistencia sobre repositorios completos: con 262.144 tokens de contexto validados se puede indexar un monorepo mediano y mantener conversaciones multi-turno con referencias cruzadas entre ficheros, usando el parser de razonamiento para trazar el plan de análisis.
- Atención al cliente con historial largo: el perfil aguanta concurrencia 8 con TTFT medio de 2,11 s, adecuado para sesiones con documentos adjuntos y contexto acumulado de decenas de miles de tokens.
- Agentes con herramientas en producción: la combinación de tool calling nativo y elección automática permite encadenar llamadas a APIs internas; conviene limitar la concurrencia a 4–8 por el TPOT observado (15,9–21,8 ms).
- Generación de código en pipelines de CI/CD: el modelo superó 1.006 casos de prueba en la validación del autor, lo que respalda su uso para parcheo automático con verificación posterior en tests.
- Análisis documental con OCR implícito: al incluir torre de visión, puede procesarse documentación escaneada, siempre que se habilite el servicio multimodal en lugar del perfil solo texto.
- Investigación sobre cuantización: sirve como caso de referencia reproducible para estudiar el impacto de NVFP4 W4A16 en un MoE grande, con métricas de latencia y memoria publicadas y verificables.
- Razonamiento matemático supervisado: problemas de varios pasos con verificación humana posterior, aprovechando el modo de razonamiento y el contexto largo para incluir enunciados y desarrollos previos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que sus comprobaciones son spot checks en una sola máquina y no una comparación con suites de benchmark frente al modelo en precisión completa; los resultados que aparezcan en la model card del modelo base corresponden a los pesos originales, no a esta cuantización.

| Medicion (2× RTX PRO 6000, TP=2) | Resultado |
|---|---|
| Concurrencia 1: tok/s de salida agregados (incluye prefill) | 83,2 |
| Concurrencia 4: tok/s de salida agregados | 213,7 |
| Concurrencia 8: tok/s de salida agregados | 304,0 |
| TTFT medio a concurrencia 1 / 4 / 8 | 0,45 s / 1,35 s / 2,11 s |
| TPOT medio a concurrencia 1 / 4 / 8 | 11,2 ms / 15,9 ms / 21,8 ms |
| Decode de un solo flujo tras el primer token | ~89,6 tok/s |
| Prefill de 16K tokens | ~4.700 tok/s (3,5 s de TTFT) |
| Pruebas funcionales de aceptación | 29/29 |
| Respuestas factuales/aritméticas | 20/20 (19/20 con cadena exacta) |
| Casos de prueba superados por el código generado | 1.006 |
| Recuperación en contexto largo | superada a 32K, 64K, 128K y 464.640 tokens |

## Requisitos de hardware

- VRAM: el checkpoint de 178,7 GiB repartido con TP=2 implica unos 89,4 GiB por GPU solo en pesos; el perfil validado consume 2.415.919.104 bytes de caché KV por GPU (unos 2,25 GiB) y alcanza un pico de 97.242 de 97.246 MiB por tarjeta.
- GPU imprescindibles: 2× NVIDIA RTX PRO 6000 Blackwell Workstation Edition (96 GB). El modelo no cabe en una sola GPU de 80 GB ni en consumer (RTX 4090 de 24 GB queda muy lejos).
- Configuración de servicio: vLLM nightly (imagen `vllm/vllm-openai:nightly` con digest `sha256:8e6e3752...`, vLLM 0.30.1rc1.dev558, torch 2.13.0+cu130). vLLM 0.30.0 estable falla en la ruta de caché NoPE con el error `pe_dim must be 64 for fp8_ds_mla`.
- Flags críticos: `--tensor-parallel-size 2 --dtype bfloat16 --quantization modelopt_mixed --moe-backend humming --attention-backend FLASHINFER_MLA_SPARSE_SM120 --kv-cache-dtype fp8_ds_mla --max-model-len 262144 --max-num-seqs 8 --disable-custom-all-reduce`.
- Alternativas de despliegue: no disponible; no se documenta soporte en llama.cpp, Ollama o TGI para esta conversión NVFP4 específica de SM120.
- Latencia y throughput: ver tabla de benchmarks; nótese que el perfil no usa decodificación especulativa MTP porque, aunque acelera el flujo único, reduce el margen de contexto y ralentiza el decode por lotes y el prefill.
- Perfil de memoria mayor: un KV de 4 GiB / 539.648 tokens provoca OOM durante el warmup, por lo que 464.640 tokens solo cabe con el perfil de 3,5 GiB/GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (12fn, NVFP4 W4A16) | no disponible | 262.144 en servicio; prueba a 464.640 | 83,2–304 tok/s agregados según concurrencia | MIT | HuggingFace, 0 descargas, 0 likes |
| zai-org/GLM-5.3-Flash (original) | no disponible | no disponible | Benchmarks en su model card (no incluidos aquí) | MIT | HuggingFace, oficial |
| Otras builds W4A16 de GLM-5.3-Flash | no disponible | no disponible | no disponible | no disponible | El autor menciona que existen, sin detallarlas |

No se dispone de datos verificables de modelos alternativos de la misma categoría (mismo tamaño o misma tarea) en la información proporcionada, por lo que la comparación cuantitativa con terceros queda como no disponible.

## Limitaciones y advertencias

- Memoria al límite: el pico medido fue de 97.242 de 97.246 MiB por GPU, con reintentos recuperables del asignador cerca del contexto máximo. Cualquier cambio de flags, versión de vLLM o backend puede provocar OOM.
- Térmica: una GPU alcanzó 94 °C bajo carga sostenida de benchmark; es necesario dimensionar la refrigeración.
- Dependencia de una imagen concreta: los resultados están ligados al digest de la imagen nightly y a las flags indicadas; otras builds no están garantizadas.
- Decodificación especulativa MTP desactivada en el perfil recomendado por su coste en contexto y su impacto negativo en decode por lotes y prefill.
- Naturaleza de las validaciones: son spot checks de una sola máquina, no una comparación con suites de benchmark frente al modelo en precisión completa; no hay métricas tipo MMLU, HumanEval o GSM8K publicadas para esta cuantización.
- Riesgo de alucinación: no cuantificado por el autor; aplican los riesgos habituales del modelo base, no evaluados aquí.
- Idiomas: sin datos sobre cobertura lingüística; no se puede asumir calidad multilingüe sin evaluarla.
- Visión: la torre de visión está incluida en los pesos pero no se ejercita en el perfil solo texto; su calidad tras la cuantización no está validada.
- Licencia: MIT heredada, permite uso comercial, pero se trata de una cuantización no oficial, no afiliada ni respaldada por Z.AI; conviene citar autoría original (© 2026 Z.AI Co., Ltd.).
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin revisión comunitaria independiente.
- Discrepancia de tamaño: el repo declara 76,0 GB mientras la model card indica 178,7 GiB de checkpoint; conviene verificar el contenido real antes de desplegar.

## Enlaces

- HuggingFace del checkpoint: https://huggingface.co/12fn/GLM-5.3-Flash-NVFP4-W4A16-2x-RTX-PRO-6000
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Receta oficial de vLLM para el modelo base: https://recipes.vllm.ai/zai-org/GLM-5.3-Flash
- Imagen de vLLM validada: `vllm/vllm-openai:nightly@sha256:8e6e3752946ff2dde451b313cbaec2ea8e7b52221b21bfbcf53fb68dd4f4c42e`
- Resultados de la búsqueda web: no se encontró ningún enlace relevante sobre el modelo; los resultados devueltos corresponden a contenidos sin relación (tiendas de bicicletas y ayuda de YouTube). El resto de enlaces (paper, blog del autor, repositorio de código, demo) no están disponibles en la información proporcionada.
