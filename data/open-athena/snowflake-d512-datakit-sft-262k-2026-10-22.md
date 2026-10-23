# open-athena/Snowflake-d512-Datakit-SFT-262K-2026.10.22

## Resumen

Snowflake d512 Datakit SFT 262K es un modelo de lenguaje de tipo *mixture-of-experts* (MoE) de 746.607.104 parámetros totales, desarrollado por open-athena dentro del ecosistema Marin y publicado el 22 de octubre de 2026. Se trata del checkpoint de anchura 512 de la familia «Snowflake», que aplica la receta Snowball 2026.10.05 a checkpoints más pequeños: extensión de contexto a 64K, midtraining con datos Datakit, extensión a 262K y una fase final de *supervised fine-tuning* de 3.207 actualizaciones.

El modelo emplea la arquitectura `GrugMoeForCausalLM` (`grug_moe`) con 6 capas, tamaño oculto 512, 256 expertos enrutados con enrutamiento top-4 y un experto compartido, atención con 4 cabezas de consulta y 1 cabeza KV, y un vocabulario de 128.256 tokens. La ventana de contexto configurada es de 262.144 tokens, aunque el propio autor advierte que no ha sido validada mediante pruebas de generación en contexto largo.

Su relevancia es doble: por un lado, documenta de forma extremadamente detallada el proceso de post-entrenamiento (mezclas de datos, presupuestos por etapa, tasas de aprendizaje, anclajes de tokens especiales) sobre hardware TPU v4-32; por otro, es un artefacto de investigación de tamaño reducido que permite estudiar el comportamiento de un MoE de 256 expertos en entornos con recursos limitados. El autor lo etiqueta explícitamente como *research artifact* no evaluado y sin garantías de seguridad para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `GrugMoeForCausalLM` (`grug_moe`), transformer MoE con atención causal y ventana deslizante |
| Parámetros totales | 746.607.104 |
| Parámetros activos | no disponible (top-4 sobre 256 expertos enrutados más un experto compartido; el autor no publica el recuento exacto de parámetros activos) |
| Longitud de contexto | 262.144 tokens configurados (no validados por pruebas de contexto largo) |
| Tipos de cuantización | no disponible; solo se publican pesos en BF16 safetensors, sin versiones GGUF, AWQ ni GPTQ oficiales |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (BF16); tamaño del repositorio 1,5 GB |
| Capas / tamaño oculto | 6 / 512 |
| Expertos | 256 enrutados, top-4, más 1 experto compartido |
| Tamaño intermedio experto / compartido | 256 / 512 |
| Cabezas de atención / cabezas KV | 4 / 1 |
| Ventana deslizante | 2.048 tokens |
| Vocabulario | 128.256 tokens |
| Multiplicador QK | 1,75 |
| Paso final del checkpoint | 104.130 |
| Actualizaciones SFT / paso inicial | 3.207 / 100.923 |
| Hardware de entrenamiento | TPU v4-32 en us-central2-b |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE de 6 capas con atención causal completa únicamente en cada cuarta capa y en la última; el resto de capas utilizan una ventana deslizante de 2.048 tokens. Las capas de atención larga omiten los *rotary position embeddings* y los desplazamientos parciales de clave, siguiendo la familia de checkpoints de origen. El modelo dispone de 256 expertos enrutados con enrutamiento top-4 y un experto compartido, con tamaño intermedio de 256 para los expertos y 512 para el compartido, y un multiplicador QK de 1,75.

El preentrenamiento programó 94.499.766.272 posiciones, mientras que el presupuesto de referencia de la familia Snowball es de 8.959.033.344.000 posiciones; cada etapa de post-entrenamiento conserva la fracción correspondiente de ese presupuesto, redondeada a actualizaciones enteras, con 1.048.576 posiciones por actualización (los recuentos incluyen *padding* de secuencias empaquetadas y no miden tokens de texto distintos). Las etapas fueron: `lce-64k` (contexto 65.536, 16 secuencias por actualización, 10.126 actualizaciones, 10.617.880.576 posiciones, LR base pico 0,000789724018); `lce-262k` (contexto 262.144, 4 secuencias, 675 actualizaciones, 707.788.800 posiciones, LR pico 0,000253633991); y `sft` (contexto 262.144, 4 secuencias, 3.207 actualizaciones, 3.362.783.232 posiciones, LR pico 4,80367408e-05, con decaimiento al 10 % del pico en el 10 % final de las actualizaciones). El estado completo del optimizador se reanuda entre etapas y el SFT comienza sin *warmup* nuevo.

La mezcla de SFT es un 79,6543 % de datos supervisados y un 20,3457 % de *replay* de preentrenamiento (aproximadamente 2.678.600.648 y 684.182.584 posiciones respectivamente), con 216 fuentes subyacentes. El dominio dominante es `nemotron_sft_v3` (64,2349 % del run completo), seguido de `open_swe_traces` (10,8340 %), `agenttrove` (1,6438 %), `openthoughts4-code-glm-5.2-n4` (1,3809 %) y `penfever-traces` (1,3556 %), con fuentes menores de conversaciones de persona, compactaciones de agente, datos de identidad, tool-use científico, rollouts de kernel y conversaciones sintéticas de misconceptions. Las actualizaciones de siete filas de tokens especiales en los embeddings de entrada y en la LM head se multiplican por √32, mientras que los pesos del router permanecen entrenables pero sus sesgos y actualizaciones diferidas de balanceo quedan congelados durante el SFT; la actualización pendiente del sesgo del router se aplica al exportar el checkpoint final. Siete filas de la LM head se inicializan desde anclas de un solo token (` role`, ` message`, ` think`, ` answer`, ` tool`, ` end` y EOS).

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat fijada a la release 10.05.
- Razonamiento explícito: la plantilla incluye un flag `enable_thinking` para activar el modo de pensamiento (la información de la model card está truncada en ese punto).
- Uso de herramientas (*tool use* / *function calling*), reforzado por fuentes de SFT específicas como `science-tool-use-conversations` y las trazas de agentes.
- Capacidades de agente y razonamiento multi-paso, derivadas de `agenttrove`, `agenttrove-glm53-compactions` y `penfever-traces`.
- Generación y edición de código, con señales de entrenamiento procedentes de `open_swe_traces` (trazas de ingeniería de software) y `glm-5.2-kernelgym-rollouts`.
- Contexto largo configurado de 262.144 tokens, apoyado en la etapa `lce-262k` con datos de documentos largos repetidos ocho veces frente a los documentos cortos.
- Capacidades multilingües: no disponibles de forma declarada, aunque la mezcla incluye fuentes conversacionales diversas (`wildchat-glm53-format-completions`, `ultrachat-persona-conversations`).
- Sin capacidades de visión ni audio documentadas.

## Casos de uso

- Agentes de software con tool calling: el modelo puede integrarse en bucles de agente que invocan funciones, leen trazas de ejecución y aplican parches, aprovechando el entrenamiento sobre `open_swe_traces` y las compactaciones de contexto de `agenttrove-glm53-compactions` para resumir historiales largos.
- Asistente conversacional con memoria extensa: la ventana configurada de 262.144 tokens permite mantener sesiones muy largas o adjuntar varios documentos, aunque con la advertencia de que el contexto largo no está validado empíricamente.
- Analítica de documentación técnica: resumen y extracción de datos en repositorios de manuales o expedientes que superen los 64K tokens, apoyándose en la etapa de extensión de contexto entrenada específicamente con documentos largos.
- Investigación sobre MoE de bajo coste: al tener 746,6 M de parámetros totales con solo 6 capas y 256 expertos top-4, es un banco de pruebas asequible para estudiar enrutamiento, congelación de sesgos de router y efectos del SFT selectivo de tokens especiales.
- Generación de trazas sintéticas y datos de razonamiento: útil como generador auxiliar en pipelines de destilación o aumento de datos para tareas de tool-use y razonamiento paso a paso.
- Prototipado en hardware de consumo: con pesos BF16 de aproximadamente 1,5 GB, cabe en GPUs consumer y en portátiles con GPU integrada, lo que permite validar prompts, plantillas y flujos de agente antes de escalar a modelos mayores de la misma familia.
- Evaluación de plantillas de chat y tokens especiales: las filas ancladas (` think`, ` answer`, ` tool`, ` end`) permiten probar formateos estructurados de razonamiento y llamadas a herramientas sin coste elevado de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluación de contexto largo, y el autor indica explícitamente que el modelo «no ha sido probado ni evaluado adecuadamente».

## Requisitos de hardware

- Pesos en BF16: 746.607.104 parámetros × 2 bytes ≈ 1,49 GB, coherente con el tamaño de repositorio de 1,5 GB.
- VRAM estimada para inferencia: unos 2 GB en BF16 incluyendo overhead de runtime; una cuantización a int8 rondaría los 0,75 GB y a 4 bits los 0,4 GB, aunque no se publican checkpoints cuantizados oficiales.
- Caché KV estimada (cálculo propio a partir de las dimensiones publicadas): 2 capas de atención completa con 1 cabeza KV de dimensión 128, a BF16, suponen aproximadamente 1 KB por token, es decir, unos 268 MB con los 262.144 tokens llenos; las 4 capas de ventana deslizante quedan acotadas a 2.048 tokens y aportan unos 4 MB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090); también cabe en iGPU y en CPU. Para servir en paralelo con lotes grandes, A100 o H100 permiten mayor *throughput* de tokens de contexto largo.
- Cabe holgadamente en GPU consumer, incluso en tarjetas de 8 GB con contexto completo.
- Opciones de despliegue: la información disponible no confirma soporte en vLLM, llama.cpp, Ollama ni TGI para la arquitectura `grug_moe`; el camino documentado es la carga del checkpoint nativo con la librería de entrenamiento de Marin y transformers con código propio.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|---|
| Snowflake d512 Datakit SFT 262K (este) | 746.607.104 | no disponible | 262.144 configurados (no validados) | openmdw-1.1 | HuggingFace, pesos BF16 | no publicados |
| Snowflake d768 Datakit SFT 262K | no disponible (anchura 768 según el nombre) | no disponible | 262.144 según el nombre del release | openmdw-1.1 | HuggingFace | no publicados |
| Grug-67B-A2B-Datakit-SFT-262K | 67B según el nombre del release | aproximadamente 2B según el nombre («A2B») | 262.144 según el nombre | no disponible en la información | HuggingFace | no publicados |

No se dispone en la información proporcionada de datos verificables de modelos de terceros de la misma categoría (MoE de menos de 1.000 M de parámetros con contexto de 262K) que permitan una comparación cuantitativa de rendimiento. Las dos alternativas de la tabla pertenecen a la misma familia y solo se conocen por su denominación y por la referencia del autor; sus especificaciones detalladas figuran como no disponibles.

## Limitaciones y advertencias

- Artefacto de investigación: el autor declara que el modelo no ha sido probado ni evaluado adecuadamente y que no es necesariamente seguro; el uso en producción es responsabilidad del usuario.
- El contexto de 262.144 tokens está configurado pero no validado con pruebas de generación en contexto largo, por lo que la calidad más allá de 64K es incierta.
- Solo 6 capas y 512 de dimensión oculta: la capacidad de razonamiento y de conocimiento factual es estructuralmente limitada frente a modelos densos de tamaño comparable con más profundidad.
- Riesgo de alucinación no cuantificado: no existen benchmarks que permitan acotarlo.
- Idiomas soportados no declarados; el comportamiento fuera del inglés (y en castellano en particular) no está verificado.
- La model card está truncada en la sección de ajustes de chat y generación, por lo que el comportamiento por defecto de `enable_thinking` no queda documentado por completo.
- Licencia openmdw-1.1: las condiciones exactas de uso comercial no se detallan en la información disponible; conviene revisar el texto completo de la licencia antes de un despliegue comercial.
- El SFT modifica filas de tokens especiales con un factor √32 y congela los sesgos del router, lo que puede producir sensibilidades específicas a la plantilla de chat: desviarse del formato fijado (release 10.05) puede degradar la calidad de forma acusada.
- Sin versiones cuantizadas oficiales: el despliegue en llama.cpp u Ollama requeriría conversión propia y soporte de la arquitectura `grug_moe`.
- Recuentos de tokens de entrenamiento basados en posiciones programadas con *padding* incluido, no en tokens de texto distintos, lo que dificulta comparaciones limpias con otras mezclas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-athena/Snowflake-d512-Datakit-SFT-262K-2026.10.22
- Receta Snowball 2026.10.05 (Grug-67B-A2B-Datakit-SFT-262K): https://huggingface.co/open-athena/Grug-67B-A2B-Datakit-SFT-262K-2026.10.05
- Modelo hermano Snowflake d768: https://huggingface.co/open-athena/Snowflake-d768-Datakit-SFT-262K-2026.10.22
- Métricas de SFT (W&B): https://wandb.ai/marin-community/snowball-ladder-lce-sft/runs/users-held-snowball-overtrained-d512-sft-2026.10.19.2
- Base de la librería de entrenamiento (commit de Marin): https://github.com/marin-community/marin/commit/ce7c77abcb0ada792cd6d76ba3d80db74c33a859
- Archivos de receta incluidos en el repositorio: `training_data_mix.json`, `pretraining_replay_mix.json`, `training_schedule.json`, `training_recipe_sources.tar.gz`
- Checkpoint nativo final: `gs://marin-us-central2/users/held/snowball-overtrained/d512/sft/2026.10.19.2/checkpoints/step-104130`
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
