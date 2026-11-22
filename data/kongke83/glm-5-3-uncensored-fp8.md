# kongke83/GLM-5.3-UNCENSORED-FP8

## Resumen

GLM-5.3-UNCENSORED-FP8 es una modificación de pesos del modelo GLM-5.3 en su variante ya cuantizada a FP8 (JANGQ-AI/GLM-5.3-FP8), publicada por el usuario kongke83 bajo el sello dealignai. El modelo base original lo desarrolla zai-org (Zhipu AI) y emplea la arquitectura `glm_moe_dsa`, un transformer de mezcla de expertos (MoE) con atención dispersa (DeepSeek sparse attention) de 753.329.940.480 parámetros totales, 78 capas y modalidad exclusivamente textual. Esta variante aplica una edición a nivel de pesos (abliteration) sobre los tensores residual-writer en bf16 para reducir el comportamiento de rechazo, manteniendo intactos los expertos enrutados en FP8.

El interés del checkpoint es doble: por un lado, demuestra una técnica de "uncensoring" permanente que no depende de LoRA, hooks de runtime ni trucos de prompt, y que se carga con vLLM estándar; por otro, conserva las ventajas de velocidad de FP8 nativo en GPUs Hopper (H100/H200). La model card reporta una preservación de capacidades medida con MMLU-logit (87,43 % frente a 85,58 % del base) y una reducción drástica de rechazos en HarmBench-320 (81,6 % de cumplimiento directo en la superficie completa y 91,7 % en el subconjunto de 240 comportamientos sin copyright).

Es relevante ahora porque la comunidad de investigación sobre alineación y seguridad necesita modelos con comportamiento de rechazo reducido para estudiar jailbreaks, robustez y taxonomías de daño, y porque la variante v2 corrige el fallo de bucle de razonamiento que afectaba a la v1 en aproximadamente el 2 % de los prompts más difíciles. El contexto operativo práctico en TP8 sobre H200 se sitúa en torno a 131K tokens con MTP y 160K sin él, muy por debajo del millón de tokens que anuncia la arquitectura base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (transformer MoE con DeepSeek sparse attention), 78 capas, text-only |
| Parametros totales | 753.329.940.480 |
| Parametros activos | no disponible |
| Longitud de contexto | 1M anunciado por la arquitectura base; ~131K prácticos con MTP y ~160K sin MTP en TP8 sobre H200 según la model card |
| Tipos de cuantizacion | FP8 (expertos enrutados); tensores residual-writer editados en bf16; otras cuantizaciones no disponibles |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 755,7 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura `glm_moe_dsa` del GLM-5.3 original: un transformer de mezcla de expertos con atención dispersa tipo DeepSeek (DSA), 78 capas y 753B de parámetros totales. La variante aquí publicada parte de la cuantización FP8 de JANGQ-AI, en la que los expertos enrutados permanecen en FP8 y solo los tensores residual-writer se editan en bf16. No se trata de un fine-tuning ni de un LoRA: la modificación es una edición permanente de pesos que reduce las señales de rechazo en una taxonomía multilingüe amplia de daño, sin especializarse en un dominio concreto (existe una variante hermana enfocada a ciberseguridad).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO en el modelo base; la model card no los detalla. La innovación técnica destacable es doble: por un lado, la edición de pesos en bf16 sobre un checkpoint FP8 que conserva la velocidad de tensor cores FP8 en Hopper; por otro, la corrección del fallo de bucle de razonamiento de la v1, que colapsaba en repetición en torno al 2 % de los prompts con señal de rechazo más fuerte. La v2 reporta 0 bucles en la sonda hardcore y 0 GARBAGE en HB-320, a cambio de una caída de ~4 pp en TRUE_COMPLY global (de 85,9 % a 91,7 % en el subconjunto de 240 comportamientos sin copyright, donde la v2 es en realidad más fuerte). El modelo soporta decodificación especulativa MTP, aunque esta no funciona en vLLM estándar y requiere el fork de ciprianveg con `--draft-attention-backend B12X_MLA_SPARSE`.

## Capacidades

- Generación de texto y razonamiento multi-paso, con bloque `<think>` explícito controlable mediante `reasoning_effort`.
- Modo de razonamiento con dos niveles efectivos: `"low"` y `"high"`; cualquier otro valor (`off`, `medium`, `max`, sin definir) cae a `max`, y no existe forma de desactivar el razonamiento en este checkpoint.
- Tool calling / function calling: soportado mediante `--tool-call-parser glm47` y `--enable-auto-tool-choice` en vLLM.
- Uso en agentes y bucles de herramientas, con la recomendación de usar `reasoning_effort="low"` en FP8 para evitar agotar el presupuesto de `max_tokens` dentro del bloque de razonamiento.
- Capacidades multilingües en diez idiomas: inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano y japonés.
- Comportamiento de rechazo reducido de forma generalista y multilingüe (abliterated / uncensored), no limitado a un dominio.
- El texto de razonamiento se expone en `message.reasoning` (no en `message.reasoning_content`).
- No dispone de visión ni audio: es un modelo exclusivamente textual.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar taxonomías de daño, robustez frente a jailbreaks y efectividad de mecanismos de rechazo en diez idiomas, gracias a que la reducción de rechazo es medible y está documentada con HarmBench-320.
- Evaluación de pipelines de moderación: al disponer de una superficie de cumplimiento amplia, sirve como generador de casos adversarios controlados para probar clasificadores de contenido y filtros de salida en producción.
- Agentes con tool calling en producción: con `reasoning_effort="low"` y `max_tokens` acotado, el modelo puede encadenar llamadas a herramientas en bucles de agente sin consumir el presupuesto completo dentro de `<think>`, integrándose en vLLM con `--tool-call-parser glm47`.
- Atención al cliente multilingüe de contexto largo: los ~131K tokens prácticos en TP8 sobre H200 permiten gestionar conversaciones multi-turno con historial extenso en español, inglés, chino, árabe o japonés, manteniendo coherencia a lo largo de la sesión.
- Generación y revisión de código en pipelines de CI/CD: el modelo soporta tool calling y razonamiento estructurado, y puede integrarse como revisor automático o generador de parches en flujos con presupuesto de tokens controlado.
- Análisis de documentos largos y extracción estructurada: con contexto de hasta ~160K tokens sin MTP, es adecuado para resumir contratos, informes técnicos o expedientes multilingües y devolver JSON validable mediante function calling.
- Despliegue en infraestructura Hopper: al conservar FP8 nativo en H100/H200, encaja en clústeres con TP8 donde el coste por token es crítico, con perfiles de pipeline-parallel (PP2 × TP4) que también funcionan aunque el draft MTP no implemente `SupportsPP`.
- Generación creativa y periodística sin restricciones de rechazo: útil para redacción de ficción, guiones o contenido editorial donde los filtros del modelo base interrumpen la generación, siempre bajo responsabilidad del operador y con la licencia MIT.

## Benchmarks y rendimiento

Resultados reportados en la model card (no verificados de forma independiente):

| Benchmark | Configuración | Resultado |
|---|---|---|
| MMLU-logit (v2) | muestra estratificada de 1026 preguntas (18 por asignatura) | 87,43 % (897/1026), +1,85 pp vs base |
| MMLU-logit (v1, referencia) | misma muestra | 87,72 %, +2,14 pp vs base |
| MMLU-logit (base GLM-5.3 regular) | misma muestra | 85,58 % |
| HarmBench-320, TRUE_COMPLY, effort=off | 320 comportamientos, greedy, `max_tokens=700` | 261 (81,6 %) |
| HarmBench-320, TRUE_COMPLY, effort=max | idem | 254 (79,4 %) |
| HarmBench-240 (sin copyright), TRUE_COMPLY, effort=off | 240 comportamientos | 220 (91,7 %) |
| HarmBench-320, HARD_REFUSE | ambos esfuerzos | 0 (0 %) |
| HarmBench-320, GARBAGE | ambos esfuerzos | 0 (0 %) |

En el desglose por asignatura del MMLU, la media de delta por asignatura es de -0,29 pp y solo `high_school_european_history` se mueve más de una pregunta (94,4 → 83,3, -11,1 pp). Las mayores ganancias se concentran en college_chemistry, world_religions, professional_psychology y security_studies (+5,5 a +5,6 pp cada una). No se han publicado resultados de HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 755,7 GB en safetensors, por lo que la inferencia requiere agregar al menos ~756 GB de pesos más overhead de KV cache y activaciones; no cabe en una sola GPU de 80 GB ni en configuraciones consumer.
- GPU recomendadas: 8× H200 o 8× H100 para TP8 con FP8 nativo, configuración validada en la model card con `--tensor-parallel-size 8 --gpu-memory-utilization 0.90`. También se ha probado en 8× DGX Spark GB10.
- No cabe en GPUs consumer (RTX 4090, 3090, etc.) en su forma actual; se requeriría una cuantización adicional a 4 bits o inferior, no publicada en este repo.
- Opciones de despliegue: vLLM (recomendado, con `--enforce-eager`, `--disable-custom-all-reduce`, `--enable-prefix-caching`, `--max-num-seqs 24`, `--max-model-len 131072`, `--reasoning-parser glm45`, `--tool-call-parser glm47`, `--enable-auto-tool-choice`). El fork de ciprianveg (B12X sparse-MLA) habilita MTP con +48 % de decodificación en prompts de código. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma absoluta; la model card solo aporta el +48 % de decodificación con MTP en el fork B12X sobre prompts de código.
- Perfiles alternativos: PP2 × TP4 funciona correctamente, aunque el draft MTP no implementa `SupportsPP`. El contexto de 1M vía decode-context-parallel está cerrado en vLLM para `glm_moe_dsa` por incompatibilidad entre el `k_cache` replicado del indexer DSA y el MLA KV fragmentado (`page size is not divisible by target page size and cannot be padded` para `fp8_ds_mla`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| GLM-5.3-UNCENSORED-FP8 (este) | 753B totales, MoE FP8 | ~131K–160K prácticos en TP8 H200 | MIT | Variante abliterated de GLM-5.3-FP8; MMLU-logit 87,43 %; TRUE_COMPLY 81,6 % en HB-320 |
| GLM-5.3 (zai-org, base) | 753B totales, MoE | 1M anunciado | no disponible en la información | Modelo original con alineación estándar; MMLU-logit 85,58 % según la model card |
| GLM-5.3-FP8 (JANGQ-AI) | 753B totales, MoE FP8 | 1M anunciado | no disponible en la información | Cuantización FP8 del base, sin edición de pesos; punto de partida de esta variante |
| GLM-5.3-CYBERSECURITY-FP8 (dealignai) | 753B totales, MoE FP8 | no disponible | no disponible en la información | Variante hermana enfocada a ciberseguridad en lugar de uncensoring generalista |

No se dispone de datos de benchmarks comparativos frente a modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo reduce deliberadamente el comportamiento de rechazo: puede generar contenido dañino, ilegal o inseguro, y su uso en producción exige moderación externa y revisión legal por parte del operador.
- El fallo de bucle de razonamiento de la v1 está corregido en la v2, pero persiste el riesgo de agotar el presupuesto de `max_tokens` dentro de `<think>` con `reasoning_effort="high"` o `"max"`: se recomienda `max_tokens ≥ 8000` en esos modos y `"low"` para agentes.
- `reasoning_effort` solo acepta `"low"` y `"high"`; cualquier otro valor cae a `max` y no es posible desactivar el razonamiento en este checkpoint.
- El texto de razonamiento se expone en `message.reasoning`, no en `message.reasoning_content`, lo que rompe la compatibilidad con clientes que esperan la convención de otros modelos.
- MTP no funciona en vLLM estándar y requiere un fork específico; el contexto de 1M vía decode-context-parallel está cerrado en vLLM para esta arquitectura, con techo práctico de ~131K–160K tokens en TP8 H200.
- El modelo es exclusivamente textual: no procesa imágenes ni audio.
- Riesgo de alucinación no cuantificado en la información disponible; la model card no reporta métricas de factualidad.
- La licencia MIT permite uso comercial, pero la responsabilidad sobre el contenido generado y el cumplimiento normativo recae íntegramente en el operador.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de los resultados reportados por el autor.
- Los datos de MMLU y HarmBench provienen exclusivamente de la model card del autor y no han sido replicados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kongke83/GLM-5.3-UNCENSORED-FP8
- Modelo base original: https://huggingface.co/zai-org/GLM-5.3
- Cuantización FP8 de partida: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Variante hermana de ciberseguridad: https://huggingface.co/dealignai/GLM-5.3-CYBERSECURITY-FP8
- Organización dealignai: https://huggingface.co/dealignai
- Discusión con notas de runtime en 8× DGX Spark GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Twitter del autor del sello: https://twitter.com/dealignai
