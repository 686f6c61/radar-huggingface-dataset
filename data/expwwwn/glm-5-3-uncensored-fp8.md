# Expwwwn/GLM-5.3-UNCENSORED-FP8

## Resumen

GLM-5.3-UNCENSORED-FP8 es una variante "abliterated" (sin rechazos) del modelo GLM-5.3 de Zhipu AI (zai-org), publicada por el usuario Expwwwn bajo el paraguas de la marca dealignai. Se trata de una edición a nivel de pesos que elimina el comportamiento de rechazo del modelo base en multiples idiomas, manteniendo la arquitectura original `glm_moe_dsa` (Mixture of Experts con atención dispersa tipo DeepSeek) de 753.329.940.480 parámetros totales y 78 capas, en formato FP8 nativo.

El modelo parte del checkpoint cuantizado `JANGQ-AI/GLM-5.3-FP8`, que a su vez deriva del `zai-org/GLM-5.3` original. La modificación consiste en una edición en bf16 de los tensores "residual-writer" (los que escriben en el flujo residual del transformer), sin fine-tuning, sin LoRA y sin hooks en tiempo de ejecución. El resultado es un checkpoint permanente que se carga con vLLM estándar y mantiene la velocidad de los tensor cores FP8 en GPUs Hopper (H100/H200).

Es relevante por dos motivos: por un lado, demuestra una técnica de "uncensoring" a nivel de pesos que preserva capacidades (MMLU de 87,43% frente al 85,58% del base según el autor); por otro, documenta con detalle los problemas prácticos de servir un modelo MoE de 753B en FP8 con atención dispersa, incluyendo limitaciones de MTP, contextos máximos prácticos y comportamiento del modo de razonamiento. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (Mixture of Experts con DeepSeek Sparse Attention), transformer de 78 capas, solo texto |
| Parametros totales | 753.329.940.480 (~753B) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens configurados en el ejemplo de servicio; el autor menciona un techo práctico de ~131K con MTP y ~160K sin MTP en TP8 sobre H200; el contexto nativo de 1M no es viable con decode-context-parallel en vLLM actual |
| Tipos de cuantizacion | FP8 (checkpoint nativo FP8); pesos residuales editados en bf16 |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 755,7 GB) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 emplea la arquitectura `glm_moe_dsa`, un transformer de tipo Mixture of Experts con atención dispersa (DeepSeek Sparse Attention, DSA) y 78 capas, orientado exclusivamente a texto. El checkpoint aquí publicado es una cuantización FP8 de los expertos enrutados, con los tensores residual-writer conservados en bf16 para permitir la edición. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo original en la información proporcionada.

La innovación técnica de esta ficha no está en el entrenamiento sino en la modificación: el autor aplica una edición bf16 permanente sobre los tensores que escriben en el flujo residual, lo que altera el comportamiento de rechazo sin tocar los expertos enrutados FP8. La versión v2 corrige un fallo de bucle de razonamiento presente en v1 (que afectaba a ~2% de los prompts más difíciles) a cambio de una pérdida de ~4 puntos porcentuales en TRUE_COMPLY global sobre HarmBench-320, aunque mejora en la superficie de daño real (240 comportamientos no-copyright: 91,7% vs 85,9% en v1). El modelo soporta decodificación especulativa MTP, aunque esta no funciona en vLLM estándar y solo se reporta operativa en el fork B12X de ciprianveg con `--draft-attention-backend B12X_MLA_SPARSE` (+48% de decode en prompts de código).

## Capacidades

- Generación de texto conversacional y de propósito general en diez idiomas (en, zh, ru, sr, hi, fr, es, ar, ko, ja).
- Razonamiento explícito mediante bloque `<think>`, controlable con el parámetro `reasoning_effort` (solo acepta `"low"` y `"high"`; cualquier otro valor cae a `max`).
- Tool calling y function calling: el ejemplo de servicio incluye `--tool-call-parser glm47` y `--enable-auto-tool-choice`.
- Uso en agentes y bucles multi-paso con tool calling, recomendado en `reasoning_effort="low"` sobre FP8 para evitar agotar el presupuesto de tokens dentro del bloque de razonamiento.
- Comportamiento sin rechazos ("uncensored") en una taxonomía amplia de daño multilingüe, no limitado a un dominio concreto.
- Capacidad de razonamiento preservada: MMLU de 87,43% en una muestra estratificada de 1026 preguntas (18 por asignatura), +1,85 pp respecto al base según el autor.
- No dispone de visión ni audio: el modelo base es text-only.

## Casos de uso

- Investigación en seguridad y alineación: el checkpoint permite estudiar el comportamiento de un modelo de 753B con los rechazos eliminados a nivel de pesos, comparando respuestas frente al base GLM-5.3-FP8 en la misma infraestructura.
- Evaluación de robustez de filtros y clasificadores: generar respuestas que un modelo alineado rechazaría para probar sistemas de moderación, detección de contenido dañino o pipelines de red-teaming controlado.
- Servicio de inferencia a gran escala en clúster Hopper: con TP8 sobre 8× H200 y FP8 nativo, el modelo ofrece velocidad de tensor cores FP8 y cabe en un nodo DGX, adecuado para cargas de generación de texto de alta concurrencia (`--max-num-seqs 24`).
- Agentes con tool calling en producción: el parser `glm47` y `--enable-auto-tool-choice` permiten integrarlo en bucles de agente; se recomienda `reasoning_effort="low"` para evitar que el presupuesto de tokens se consuma dentro de `<think>`.
- Generación de código y tareas de razonamiento técnico: el autor reporta +48% de decode en prompts de código con el fork B12X y MTP, lo que lo hace viable para pipelines de generación asistida donde el throughput importa.
- Procesamiento multilingüe de documentos largos: con contexto práctico de ~131K tokens en TP8, puede manejar contratos, informes o corpus extensos en los diez idiomas soportados.
- Experimentación con decodificación especulativa: sirve como banco de pruebas para MTP y atención dispersa en vLLM, dado que el autor documenta con precisión qué funciona y qué no en cada configuración.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Configuracion | Resultado | Referencia |
|---|---|---|---|
| MMLU (muestra 1026 Q, 18/asignatura) | v2 | 87,43% (897/1026) | +1,85 pp vs base (85,58%) |
| MMLU (misma muestra) | v1 | 87,72% | +2,14 pp vs base |
| HarmBench-320, TRUE_COMPLY | effort=off | 81,6% (261/320) | — |
| HarmBench-320, TRUE_COMPLY | effort=max | 79,4% (254/320) | — |
| HarmBench-320 no-copyright (240), TRUE_COMPLY | effort=off | 91,7% (220/240) | v1: 85,9% |
| HarmBench-320, GARBAGE | off y max | 0% | — |
| HarmBench-320, HARD_REFUSE | off y max | 0% | — |

En el desglose por asignatura de MMLU, la media de delta por asignatura es de -0,29 pp; solo `high_school_european_history` se movió más de una pregunta (94,4→83,3, -11,1 pp). No se han publicado resultados de benchmarks estándar adicionales (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo pesa 755,7 GB en safetensors FP8; en la práctica requiere un nodo multi-GPU. El ejemplo del autor usa TP8 sobre 8× H200 con `--gpu-memory-utilization 0.90`.
- GPU recomendadas: H100 y H200 (FP8 nativo en Hopper). El autor reporta pruebas en 8× DGX Spark GB10. No cabe en GPUs de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola GPU convencional.
- Opciones de despliegue: vLLM (probado), con flags `--enforce-eager` obligatorio para la ruta de atención dispersa bajo concurrencia, `--disable-custom-all-reduce`, `--enable-prefix-caching`, `--reasoning-parser glm45`, `--tool-call-parser glm47`. Fork B12X de ciprianveg para MTP con `--draft-attention-backend B12X_MLA_SPARSE`. No se mencionan llama.cpp, Ollama ni TGI.
- Contexto práctico: ~131K tokens con MTP y ~160K sin MTP en TP8 sobre H200; el pipeline-parallel (PP2 × TP4) perfila bien, pero el draft MTP no implementa `SupportsPP`.
- Latencia y throughput: no se publican cifras absolutas; solo el dato relativo de +48% de decode en prompts de código con MTP en el fork B12X.
- Advertencia de serving: con `reasoning_effort` en `high`/`max` el modelo puede consumir todo `max_tokens` dentro de `<think>` y devolver cero tokens de respuesta (finish=`length`); usar `max_tokens ≥ 8000` si se emplea ese modo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GLM-5.3-UNCENSORED-FP8 (este) | ~753B (MoE) | 131K configurado; ~131-160K práctico | MIT | safetensors FP8 | Sin rechazos, edición bf16 de residual-writers |
| zai-org/GLM-5.3 (base) | ~753B (MoE) | no disponible en la información | no disponible en la información | no disponible | Modelo original con alineación intacta |
| JANGQ-AI/GLM-5.3-FP8 | ~753B (MoE) | no disponible | no disponible | FP8 | Cuantización FP8 del base, sin modificar |
| dealignai/GLM-5.3-CYBERSECURITY-FP8 | ~753B (MoE) | no disponible | no disponible | FP8 | Variante hermana enfocada en ciberseguridad |

No se dispone de datos de benchmarks comparativos frente a otros modelos de la misma categoría (por ejemplo, otros MoE de ~700B) en la información proporcionada.

## Limitaciones y advertencias

- Modelo sin rechazos: elimina deliberadamente el comportamiento de rechazo en una taxonomía amplia de daño. No es apto para despliegues públicos sin moderación externa.
- Riesgo de alucinación: no cuantificado en la información disponible; el autor no reporta métricas de factualidad.
- Fallo de razonamiento en `high`/`max`: puede agotar `max_tokens` dentro de `<think>` y devolver contenido vacío con finish=`length`; no es un bucle, sino agotamiento de presupuesto.
- `reasoning_effort` solo acepta `"low"` y `"high"`; cualquier otro valor (incluido `off` sin comillas, que YAML parsea como booleano `false`) cae a `max`. No hay forma de desactivar el razonamiento en este checkpoint.
- El texto de razonamiento se expone en `message.reasoning`, no en `message.reasoning_content`.
- MTP no funcional en vLLM estándar; solo en el fork B12X.
- Contexto de 1M no viable con decode-context-parallel en vLLM actual por incompatibilidad entre el indexer DSA y el sharding MLA (`page size is not divisible by target page size and cannot be padded` para `fp8_ds_mla`).
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre el cumplimiento normativo en jurisdicciones con restricciones de contenido.
- Idiomas: diez declarados; no se reporta cobertura ni calidad por idioma más allá de la lista.
- Sesgos: no documentados en la información disponible; al tratarse de una edición de pesos sobre un modelo base sin datos de evaluación de sesgos, se desconoce su comportamiento en este aspecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Expwwwn/GLM-5.3-UNCENSORED-FP8
- Modelo base original: https://huggingface.co/zai-org/GLM-5.3
- Cuantización FP8 de partida: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Variante hermana de ciberseguridad: https://huggingface.co/dealignai/GLM-5.3-CYBERSECURITY-FP8
- Organización dealignai: https://huggingface.co/dealignai
- Discusión con notas de runtime en 8× DGX Spark GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Twitter del autor: https://twitter.com/dealignai
