# BoldingBuilds/GLM-5.3-Flash-Uncensored-GGUF

## Resumen

GLM-5.3-Flash-Uncensored-GGUF es una versión cuantizada y modificada del modelo multimodal zai-org/GLM-5.3-Flash, publicada por el usuario BoldingBuilds. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 320.759.404.382 parámetros totales, distribuidos en 12.384 expertos enrutados, del que se han editado 666 expertos (aproximadamente el 1,74% de los parámetros) para eliminar el comportamiento de rechazo (refusal) mediante una técnica de abliteration selectiva. El resultado se ha cuantizado a IQ1_S (1,92 bits por peso), generando un archivo de 71,5 GiB que cabe en una única GPU de 96 GB.

La relevancia de esta ficha radica en que documenta un caso práctico de edición de expertos en un MoE de gran escala, con mediciones de primera mano sobre el coste de la cuantización extrema y de la eliminación del rechazo. El autor proporciona datos concretos de rendimiento, latencia y tasas de respuestas inutilizables bajo distintas configuraciones de muestreo, lo que permite evaluar con rigor si este artefacto es adecuado para un despliegue real.

El modelo base es multimodal (pipeline image-text-to-text), soporta visión mediante un proyector mmproj y está pensado para ejecutarse con llama.cpp en su versión mainline b11279 o superior. La licencia es MIT, lo que facilita su uso comercial, aunque las limitaciones derivadas de la cuantización a 1,92 bits y de la edición de expertos deben considerarse seriamente antes de llevarlo a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con arquitectura denominada `glm5-next` en llama.cpp; incluye bloque MTP (`blk.45`) y proyector multimodal (mmproj) |
| Parametros totales | 320.759.404.382 |
| Parametros activos | no disponible |
| Longitud de contexto | 16k tokens en la configuración medida por el autor; no se especifica la ventana máxima nativa |
| Tipos de cuantizacion | IQ1_S (1,92 bits) en este repositorio; existe un hermano IQ2_XXS del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp), dividido en 2 shards más mmproj para visión |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer MoE con 12.384 expertos enrutados y un bloque MTP (Multi-Token Prediction) identificado como `blk.45`, que llama.cpp omite en la carga. La edición realizada por BoldingBuilds no reentrena el modelo: modifica únicamente las down-projections de 666 expertos seleccionados, dejando el resto de tensores byte-idénticos al padre en la etapa BF16 previa a la cuantización. La selección de expertos no se hizo por magnitud de pesos, sino por tráfico de rechazo: gastar el mismo presupuesto de 384 expertos ordenados por magnitud deja un 25,0% de rechazo, mientras que seleccionarlos por tráfico real de refusal lo reduce al 5,8%.

El autor reporta que el archivo incluye valores por defecto anti-repetición en los metadatos GGUF (`general.sampling.penalty_repeat = 1.1` y `general.sampling.penalty_last_n = 256`), lo que reduce las respuestas inutilizables del 14,2% al 5,0%. La cuantización a IQ1_S se realizó con imatrix y produce un archivo de 71,5 GiB. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno en formato chat.
- Razonamiento con modo de pensamiento (reasoning), controlable mediante `--reasoning-budget` en llama.cpp.
- Generación de código, con soporte para tareas de programación de cierta longitud (el autor midió tareas de coding con presupuesto de razonamiento de 1024 tokens).
- Razonamiento matemático multi-paso, aunque con rendimiento degradado por la cuantización a 1,92 bits.
- Procesamiento de imagen y texto (pipeline image-text-to-text) mediante el proyector mmproj incluido en el repositorio.
- Comportamiento sin rechazo (uncensored) en las categorías de prompt evaluadas por el autor.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue como servicio.
- No se documenta soporte explícito de tool calling ni de agentes multi-paso en la información disponible.

## Casos de uso

- Investigación sobre abliteration y edición de expertos en MoE: el repositorio sirve como artefacto reproducible para estudiar cómo la selección de expertos por tráfico de rechazo afecta al comportamiento del modelo, con métricas comparativas frente al padre sin editar.
- Evaluación de cuantización extrema en producción: permite medir el impacto real de IQ1_S (1,92 bits) sobre tareas de código y matemáticas, con datos de referencia del propio autor (36% en MATH-500 nivel 5 frente al 41% del padre sin editar en la misma receta).
- Despliegue local en una única GPU de 96 GB: el archivo de 71,5 GiB cabe en tarjetas como A100 80GB no (excede), pero sí en H100 96GB o similares, lo que permite ejecutar un MoE de 320B en un solo nodo sin paralelismo de tensor.
- Generación de código asistida en entornos controlados: con `--reasoning-budget 1024` y los parámetros de muestreo recomendados (temperatura 0, semilla 0, penalización de repetición 1,1/256), el autor reporta que las tareas largas de coding dejan de agotar el presupuesto de salida (frente a 1 de cada 8 fallos con los valores por defecto del archivo).
- Procesamiento de documentos con imagen: al incluir mmproj, puede emplearse para tareas image-text-to-text como descripción de figuras o extracción de información de capturas, siempre que se acepte la pérdida de calidad de la cuantización.
- Experimentación con prompts que el modelo base rechazaría: útil en investigación de seguridad y alineación para estudiar la robustez de los filtros de rechazo y las consecuencias de eliminarlos, no para producción orientada a usuarios finales.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de primera mano del autor, no benchmarks estándar publicados por el desarrollador del modelo base. Se presentan a continuación.

| Metrica | Resultado | Condiciones |
|---|---|---|
| Tasa de rechazo (conjunto dañino, 120 prompts) | 5,8% | Edición por tráfico de refusal, 384 expertos |
| Tasa de rechazo (misma edición por magnitud) | 25,0% | 384 expertos ordenados por magnitud |
| Respuestas inutilizables (por defecto) | 14,2% | Configuración del archivo sin flags |
| Respuestas inutilizables (con penalización) | 5,0% | `penalty_repeat=1.1`, `penalty_last_n=256` |
| Tareas de coding largas sin respuesta | ~1 de cada 8 | Valores por defecto del archivo |
| Tareas de coding largas sin respuesta | 0 | `--reasoning-budget 1024` |
| MATH-500 nivel 5 (IQ1_S, sin editar) | 41% | Receta IQ1_S del padre |
| MATH-500 nivel 5 (IQ1_S, editado) | 36% | Misma receta, modelo editado |
| MATH-500 nivel 5 (IQ2_XXS con budget 1024) | 61% | Hermanos IQ2_XXS |
| MATH-500 nivel 5 (IQ2_XXS sin budget) | 81% | Hermanos IQ2_XXS |
| Divergencia mainline vs fork (KL) | 0,020 prosa / 0,017 matemáticas | Mismos pesos, acuerdo top-1 94–96% |
| Respuestas que alcanzan el límite de salida (conjunto dañino) | 37 de 120 | Ejecución principal |
| Respuestas que alcanzan el límite de salida (conjunto benigno) | 8 de 120 | Ejecución principal |

## Requisitos de hardware

- VRAM estimada para inferencia: 71,5 GiB para el archivo IQ1_S, más overhead de contexto KV y del proyector mmproj si se usa visión.
- GPU recomendadas: H100 96GB o cualquier acelerador con al menos 80 GB libres tras el overhead; el autor indica que cabe en una única tarjeta de 96 GB.
- No cabe en GPUs de consumo (RTX 4090 24GB, RTX 3090 24GB) ni en A100 80GB sin recurrir a offload a CPU, que degradaría severamente el throughput de un MoE de este tamaño.
- Opciones de despliegue: llama.cpp mainline b11279 o superior (obligatorio; el fork PR #27754 ya no es necesario desde el 2026-10-02). Compatible con llama-server y con endpoints. LM Studio requiere la corrección de plantilla publicada el 2026-10-07 (re-descargar el shard 1).
- Latencia y throughput: no disponibles de forma agregada; el autor reporta que la configuración medida usa temperatura 0, semilla 0, penalización 1,1/256, contexto de 16k y `--reasoning-budget 1024`, pero no publica tokens por segundo en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash-Uncensored-GGUF (este) | 320,8B totales | 16k medido | IQ1_S (1,92 bits), 71,5 GiB | MIT | Sin rechazo, multimodal, requiere llama.cpp mainline |
| zai-org/GLM-5.3-Flash (padre) | 320,8B totales | no disponible | BF16 y otras | no disponible en la información | Comportamiento de rechazo intacto; referencia de calidad |
| BoldingBuilds/orcarouter_GLM-5.3-Flash-Uncensored-GGUF (hermano IQ2_XXS) | 320,8B totales | no disponible | IQ2_XXS | MIT | Misma edición, mayor precisión; MATH-500 nivel 5: 81% sin budget, 61% con budget |

No se dispone de datos de otros modelos comparables de la misma categoría (MoE de ~320B con cuantización sub-2 bits) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización IQ1_S a 1,92 bits degrada notablemente el razonamiento matemático: 36% en MATH-500 nivel 5 frente al 41% del padre sin editar en la misma receta, y muy lejos del 81% del hermano IQ2_XXS sin budget.
- El `--reasoning-budget 1024` es un compromiso: mejora el coding pero reduce la precisión en matemáticas multi-paso (de 81% a 61% en el hermano IQ2_XXS). Para matemáticas duras, el autor recomienda ejecutar sin budget.
- La eliminación del rechazo es experimental: 37 de 120 respuestas del conjunto dañino y 8 de 120 del benigno alcanzaron el límite de salida en la ejecución principal, lo que indica que una fracción de respuestas queda truncada.
- El archivo incluye `temperature 1.0` en sus metadatos y ningún reasoning budget por defecto; ejecutar `llama-server -m …` sin flags no reproduce la configuración medida y provoca fallos en tareas largas de coding (~1 de cada 8).
- Todas las métricas se midieron en el fork PR #27754 con dos commits locales del autor; en mainline pueden variar ligeramente (KL 0,020 en prosa, 0,017 en matemáticas).
- El bloque MTP (`blk.45`) se omite en la carga; MTP no está en mainline todavía (PR #27917 pendiente).
- La plantilla de chat original usaba acceso a listas `x.0.type`, rechazado por el motor Jinja de LM Studio; solo se corrigió el shard 1 (cabecera), no los tensores.
- No se documentan idiomas soportados ni sesgos conocidos del modelo base en la información disponible.
- La licencia MIT permite uso comercial, pero la ausencia de filtros de rechazo traslada al desplegador toda la responsabilidad sobre el contenido generado.
- No hay datos publicados de tool calling, agentes multi-paso ni throughput en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BoldingBuilds/GLM-5.3-Flash-Uncensored-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Informe completo del autor: https://curve666-field-report.pages.dev/
- PR mainline de llama.cpp que añade la arquitectura: https://github.com/ggml-org/llama.cpp/pull/27773
- PR cerrado del fork original: https://github.com/ggml-org/llama.cpp/pull/27754
- PR de soporte MTP en mainline: https://github.com/ggml-org/llama.cpp/pull/27917
- Discusión sobre la plantilla de chat en LM Studio: https://huggingface.co/BoldingBuilds/orcarouter_GLM-5.3-Flash-Uncensored-GGUF/discussions/4
