# EvansDeveloper/evaryx-7b

## Resumen

Evaryx-Core (publicado en Hugging Face como `EvansDeveloper/evaryx-7b`) es un modelo de lenguaje causal de tipo conversacional y de razonamiento, afinado por EVARYX TECHNOLOGIES sobre la arquitectura Qwen2. El repositorio declara 7.615.616.512 parámetros reales en safetensors (unos 7,6 mil millones), aunque la model card lo comercializa como "8B". Está pensado para mantener conversaciones con un tono natural y para abordar problemas de varios pasos con un enfoque de "pensamiento profundo" estructurado.

El modelo se distribuye en precisión F16 mediante safetensors y es compatible con la librería `transformers`, con soporte declarado para text-generation-inference y endpoints compatibles. El repositorio ocupa 15,2 GB y acumula 248 descargas y 1 like en el momento de la consulta, lo que indica una adopción muy limitada y una ausencia prácticamente total de validación por parte de la comunidad.

La relevancia de esta ficha es fundamentalmente cautelar: se trata de un fine-tune de Qwen2 sin licencia declarada, sin idiomas especificados, sin benchmarks publicados y sin documentación sobre el dataset de entrenamiento. Cualquier evaluación de idoneidad para producción debe partir de la premisa de que la información disponible es mínima y de que el modelo no ha sido auditado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 nativo en safetensors; la model card documenta carga en 4 bits vía bitsandbytes (`load_in_4bit`) |
| Idiomas soportados | inglés declarado en la model card (`language: en`); el resto no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (F16) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only de la familia Qwen2, con 7,6 mil millones de parámetros. Se trata de un fine-tune, no de un modelo entrenado desde cero: la model card indica explícitamente "Causal Language Model (Fine-tuned)" y etiqueta el modelo con `qwen2`, por lo que la base es presumiblemente un checkpoint de la familia Qwen2 (probablemente Qwen2-7B, aunque el autor no lo confirma). La precisión de los pesos publicados es F16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineación, ni sobre innovaciones técnicas específicas (decodificación especulativa, atención lineal, modos de pensamiento explícitos, etc.). La model card menciona capacidades de "deep thinking" y descomposición de problemas, pero no documenta ningún mecanismo técnico concreto que las implemente (por ejemplo, tokens de razonamiento especiales o un formato de cadena de pensamiento entrenado). Toda afirmación sobre el proceso de entrenamiento debe considerarse no verificada.

## Capacidades

- Generación de texto conversacional en inglés, con un tono que la model card describe como natural y fluido.
- Razonamiento multi-paso y descomposición de problemas lógicos, según declara el autor (sin evidencia técnica publicada).
- Asistencia en programación, explicaciones y lluvia de ideas, según la model card.
- Soporte de plantilla de chat mediante `apply_chat_template` con roles `user`/`assistant`.
- Carga en 4 bits con bitsandbytes documentada por el autor para entornos con 8 GB de VRAM.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes: no disponible (no documentado).
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: no disponibles más allá del inglés declarado.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés: el modelo puede integrarse con `transformers` y una plantilla de chat estándar para construir un chatbot de investigación con pocas líneas de código, adecuado para validar flujos de conversación multi-turno antes de invertir en modelos mayores.
- Experimentación académica con fine-tunes de Qwen2: al ser un fine-tune sobre una base conocida, sirve como punto de comparación en estudios sobre el efecto del ajuste fino en el estilo de respuesta, siempre que se documente su procedencia.
- Despliegue en hardware de consumo: con carga en 4 bits (aproximadamente 8 GB de VRAM según el autor), puede ejecutarse en GPUs de gama media para demos locales y pruebas de concepto sin infraestructura dedicada.
- Generación de explicaciones y material divulgativo: para tareas de resumen y explicación de conceptos en inglés donde no se requiera precisión factual crítica y se disponga de revisión humana.
- Asistencia a la programación en entornos controlados: puede emplearse para sugerencias de código y explicaciones en un IDE o pipeline interno, con revisión obligatoria del output y sin exposición directa a usuarios finales.
- Evaluación comparativa de robustez: útil como caso de estudio de modelos publicados sin benchmarks ni licencia, para ilustrar la importancia de la trazabilidad en la selección de modelos open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y no se han localizado evaluaciones independientes del modelo.

## Requisitos de hardware

- VRAM estimada en F16: aproximadamente 15,2 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda 16 GB o más, tal como indica el autor.
- VRAM estimada en 4 bits (bitsandbytes): alrededor de 8 GB según la model card, con margen adicional recomendable para contexto y activaciones.
- GPU recomendadas para F16: A100 40 GB, H100, L40S o RTX 4090 (24 GB). Para 4 bits: RTX 4070/4080, RTX 3090 o superiores.
- GPU de consumo: cabe en RTX 4090 en F16 y en GPUs de 8-12 GB en 4 bits; no cabe en GPUs de 6 GB o menos ni en la mayoría de iGPU.
- Opciones de despliegue: `transformers` (documentado por el autor), text-generation-inference y endpoints compatibles (según tags). No hay confirmación de soporte GGUF/llama.cpp ni de Ollama; al no publicarse pesos GGUF en el repo, su uso en llama.cpp requeriría conversión manual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks publicados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Evaryx-Core (`EvansDeveloper/evaryx-7b`) | 7,6 B | no disponible | no | no disponible | Hugging Face, safetensors F16 |
| Qwen2-7B (base presumible) | 7,6 B | 131.072 tokens (según documentación oficial de Qwen2) | sí, publicados por el autor original | Apache 2.0 (Qwen2-7B) | Hugging Face, múltiples formatos |
| Mistral-7B-v0.3 | 7,2 B | 32.768 tokens | sí, publicados por el autor original | Apache 2.0 | Hugging Face, GGUF, etc. |
| Llama 3.1 8B | 8,0 B | 131.072 tokens | sí, publicados por el autor original | Llama 3.1 Community License | Hugging Face, GGUF, etc. |

La comparación se ofrece como referencia de categoría; los datos de los modelos alternativos provienen de su documentación oficial y no de una evaluación conjunta con Evaryx-Core. No existen mediciones que permitan afirmar que Evaryx-Core iguale o supere a su base Qwen2.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el fine-tune mejore a su base; es posible que degrade capacidades respecto a Qwen2-7B original.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido. Esto bloquea de facto cualquier despliegue en producción empresarial hasta que el autor lo aclare.
- Idiomas no verificados: solo se declara inglés; el comportamiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Contexto no documentado: se desconoce la ventana máxima efectiva; asumir la de Qwen2-7B (131.072 tokens) sin confirmación es arriesgado.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa con aparente seguridad; la model card recomienda verificar outputs en contextos médicos, legales o financieros.
- Sesgos: no documentados ni evaluados; al desconocerse el dataset de fine-tuning, no se puede descartar la introducción de sesgos específicos.
- Procedencia del fine-tune no confirmada: el autor no indica qué checkpoint exacto de Qwen2 sirve de base ni el proceso de ajuste, lo que dificulta la reproducibilidad.
- Adopción mínima (248 descargas, 1 like): sin comunidad que reporte fallos ni validación cruzada.
- Repositorio de 15,2 GB: requiere espacio en disco considerable y descarga lenta en conexiones modestas.
- Formato limitado: no se ofrecen GGUF ni otras cuantizaciones listas para usar, lo que complica el despliegue en entornos sin GPU.

## Enlaces

- Hugging Face: https://huggingface.co/EvansDeveloper/evaryx-7b
- Model card del autor (referenciada en el repositorio): incluida en el README del propio repositorio de Hugging Face.
- Documentación de Qwen2 (base arquitectónica presumible): no disponible en la información proporcionada.
- Paper, blog, repositorio de código o demo oficial: no disponibles en la información proporcionada.
