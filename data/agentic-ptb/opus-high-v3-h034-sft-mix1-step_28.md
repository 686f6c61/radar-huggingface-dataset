# agentic-ptb/opus-high-v3.h034.sft-mix1.step_28

## Resumen

`agentic-ptb/opus-high-v3.h034.sft-mix1.step_28` es un checkpoint intermedio derivado de un run de entrenamiento del proyecto AgentPTB, concretamente de la ejecución denominada **opus-high-v3**. El modelo parte de la base `Qwen/Qwen3.5-9B-Base` y ha sido sometido a un proceso de fine-tuning supervisado (SFT) con una mezcla de datos etiquetada como `sft-mix1`. El autor lo clasifica explícitamente como un checkpoint de rol `intermediate`, retenido únicamente con fines de reproducibilidad y estudio cualitativo.

La model card incluye una advertencia clara: el run **no encontró ninguna mejora en los pesos entrenados** respecto a la base, por lo que no debe inferirse calidad a partir de su publicación. De hecho, el modelo lleva los tags `negative-results` y `opus-high-v3`, lo que indica que forma parte de una serie de experimentos documentados como resultados negativos. No se han publicado métricas de rendimiento, benchmarks ni evaluaciones independientes.

A pesar de tener 9.409.813.744 parámetros (aproximadamente 9,4B), este checkpoint no está pensado para uso práctico. Su único valor documentado es servir como artefacto de reproducibilidad dentro del proyecto AgentPTB, que parece explorar el uso de modelos propietarios (el nombre sugiere una posible relación con Claude Opus de Anthropic) como supervisores para generar datos de entrenamiento, aunque no hay confirmación explícita de esa conexión en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fine-tune de `Qwen/Qwen3.5-9B-Base` (arquitectura del modelo base no detallada en la información disponible) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica si es MoE; probablemente denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors de pesos completos, 18,8 GB) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint es un fine-tune del modelo base `Qwen/Qwen3.5-9B-Base`, publicado por el equipo de Qwen. No se especifica en la información disponible si la arquitectura subyacente es un transformer denso, MoE o híbrido; únicamente se indica que el modelo base es el de 9B de la serie Qwen3.5. El proceso de entrenamiento corresponde a un fine-tuning supervisado (SFT) con una mezcla de datos denominada `sft-mix1`, dentro de la ejecución `opus-high-v3` del proyecto AgentPTB.

La model card indica que el run se realizó durante la hora `h034` y que el checkpoint proviene de `scratch/agent/sft-mix1/weights/step_28`. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas adicionales como RLHF o DPO. La advertencia principal es que el run **no encontró mejora en los pesos entrenados**, lo que sugiere que el SFT no produjo una ganancia medible sobre la base. El dataset asociado está disponible en `agentic-ptb/opus-high-v3-data`.

## Capacidades

No se han documentado capacidades específicas para este checkpoint en la información disponible. Al ser un fine-tune de `Qwen3.5-9B-Base`, podría heredar potencialmente las capacidades de la base (generación de texto, razonamiento, código, etc.), pero no hay ninguna verificación ni evaluación publicada que confirme el comportamiento real de este checkpoint concreto. La model card advierte explícitamente que no debe inferirse calidad de la publicación.

- Generación de texto: no verificado para este checkpoint.
- Razonamiento y matemáticas: no verificado.
- Generación de código: no verificado.
- Tool calling / function calling: no disponible.
- Soporte de agentes o multi-step reasoning: no disponible.
- Capacidades multilingües: no disponibles (los idiomas no están especificados).

## Casos de uso

Dado que se trata de un checkpoint intermedio con resultados negativos documentados, no se recomienda su uso en ningún escenario de producción. La model card lo define como un artefacto de reproducibilidad y estudio cualitativo. Los únicos casos de uso razonables serían:

- Investigación de reproducibilidad: analizar el comportamiento de un checkpoint intermedio de un run SFT fallido para entender por qué no se produjo mejora, comparando con el modelo base.
- Estudio de dinámicas de entrenamiento: examinar cómo evolucionan los pesos en las primeras etapas de un fine-tuning supervisado cuando el supervisor es un modelo propietario (posiblemente Claude Opus).
- Análisis de resultados negativos: documentar y estudiar casos donde el fine-tuning no produce ganancias, contribuyendo a la literatura sobre qué hace que un SFT fracase.
- Evaluación cualitativa: inspeccionar manualmente las salidas del modelo para identificar artefactos o degradaciones introducidas por el entrenamiento.
- Benchmark de referencia: servir como punto de comparación en experimentos futuros del proyecto AgentPTB.

No hay casos de uso comerciales ni prácticos recomendados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna métrica de MMLU, HumanEval, GSM8K ni similares. Dado que el run se clasifica como `negative-results`, es probable que no se hayan reportado mejoras, pero no hay datos cuantitativos que respalden esa afirmación.

## Requisitos de hardware

No se han publicado requisitos específicos de hardware para este checkpoint. Como referencia orientativa para un modelo de ~9,4B parámetros en formato safetensors (18,8 GB en el repo):

- **VRAM estimada para inferencia**: con pesos en FP16, aproximadamente 18,8 GB solo para los pesos, más overhead de activaciones y KV cache. Con cuantización a 8 bits, ~9,4 GB; a 4 bits, ~4,7 GB (aunque no se han publicado cuantizaciones oficiales).
- **GPU recomendadas**: para FP16 sin cuantizar, se necesitaría al menos una GPU con 24 GB (RTX 3090/4090, A100 40GB, L40S). Con cuantización 4 bits, podría caber en GPUs de 8-12 GB (RTX 3060, RTX 4070, etc.), pero no hay confirmación de compatibilidad.
- **Opciones de despliegue**: no se han probado ni documentado integraciones con vLLM, llama.cpp, Ollama o TGI. Al ser un checkpoint intermedio sin valor práctico, no se recomienda su despliegue.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados. El modelo base `Qwen/Qwen3.5-9B-Base` sería la referencia natural, pero no hay métricas que comparen este checkpoint con su base ni con otros modelos de tamaño similar (p. ej., Llama-3.1-8B, Mistral-7B, Gemma-2-9B). La ausencia de benchmarks y la naturaleza de resultado negativo impiden establecer una comparativa significativa.

| Modelo | Parametros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|
| agentic-ptb/opus-high-v3 (este) | 9,4B | no disponible | Apache 2.0 | no publicado (resultado negativo) |
| Qwen/Qwen3.5-9B-Base | 9,4B (aprox.) | no disponible | Apache 2.0 (presumible) | no disponible en esta información |

## Limitaciones y advertencias

- **Resultado negativo documentado**: el run no encontró mejora en los pesos entrenados; el modelo no debe usarse como indicador de calidad ni como base para decisiones técnicas.
- **Checkpoint intermedio**: no es un modelo final pulido; es un artefacto de paso dentro de un proceso de entrenamiento más amplio.
- **Sesgos y alucinaciones**: no evaluados ni documentados para este checkpoint.
- **Idiomas**: no especificados; no se conoce el alcance multilingüe.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero el valor práctico del modelo es nulo dado su estado.
- **Riesgo de producción**: no apto para despliegue en entornos reales; cualquier uso en producción sería irresponsable sin una evaluación previa exhaustiva.
- **Falta de documentación**: no hay información sobre datos de entrenamiento, hiperparámetros, ni metodología de evaluación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h034.sft-mix1.step_28
- Dataset asociado: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Búsqueda de modelos con tag `agentic-ptb`: https://huggingface.co/models?other=agentic-ptb
