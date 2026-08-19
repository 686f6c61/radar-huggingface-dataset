# kyleliu789/qwen3-14b-svamp14-sft-qlora-r8-a16

## Resumen

`kyleliu789/qwen3-14b-svamp14-sft-qlora-r8-a16` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base `Qwen/Qwen3-14B`, publicado por el usuario kyleliu789. El fine-tuning se ha realizado sobre un dataset denominado `reasonif_14b_sft_train` (no documentado públicamente), con el objetivo de especializar el modelo en tareas de razonamiento, probablemente de tipo matemático o lógico, aunque no se especifica el contenido exacto. La fecha de creación (agosto de 2026) es posterior a la del modelo base, lo que sugiere un trabajo reciente.

El modelo base Qwen3-14B es un transformer decoder-only con 14.800 millones de parámetros y una ventana de contexto de 131.072 tokens, entrenado por Alibaba Cloud. El adaptador LoRA utiliza rango 8 y alpha 16, lo que añade un número reducido de parámetros entrenables (del orden de decenas de millones). La relevancia de esta ficha radica en documentar un caso práctico de fine-tuning eficiente con QLoRA sobre un modelo grande, aunque la falta de documentación y de benchmarks limita su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Qwen3-14B) |
| Parametros totales | 14.800 millones (base) + adaptador LoRA (r=8, a=16, no cuantificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens (heredada del base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base puede cuantizarse a 4/8 bits para QLoRA) |
| Idiomas soportados | No disponible (el base soporta multiples idiomas, pero el fine-tuning no especifica) |
| Licencia | other (la del base Qwen3 es Apache 2.0, pero el adaptador declara "other") |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de bajo rango (r=8, alpha=16) aplicado sobre las capas de atención y MLP de Qwen3-14B. El entrenamiento se realizó con QLoRA, lo que implica que el modelo base se mantiene congelado y cuantizado (normalmente a 4 bits) durante el fine-tuning, reduciendo drásticamente el consumo de memoria. El dataset `reasonif_14b_sft_train` no está documentado en la model card, pero por el nombre y el contexto probablemente contiene ejemplos de razonamiento simbólico o matemático (el sufijo "svamp14" sugiere una variante de SVAMP, un benchmark de problemas aritméticos). Se empleó una sola época con un learning rate de 5e-5, batch efectivo de 8 (batch 2 × grad accum 4), scheduler coseno con warmup del 5% y optimizador AdamW. La pérdida de validación final fue de 0,2232, lo que indica convergencia, pero no es un indicador de calidad de tarea.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del base Qwen3-14B, incluyendo generación de texto fluida, razonamiento de varios pasos y comprensión de instrucciones complejas.
- Razonamiento matemático y lógico: el fine-tuning sobre `reasonif_14b_sft_train` probablemente mejora el rendimiento en problemas aritméticos y de razonamiento simbólico, aunque no hay evidencia cuantitativa publicada.
- Soporte de tool calling y agentes: el modelo base Qwen3-14B soporta function calling y modos de razonamiento extendido (thinking), por lo que el adaptador hereda estas capacidades.
- Multilingüismo: el base está entrenado en más de 30 idiomas, pero no se ha verificado que el fine-tuning preserve este comportamiento.
- Limitación: al ser un adaptador LoRA, las capacidades fuera del dominio del dataset de entrenamiento pueden degradarse ligeramente respecto al base.

## Casos de uso

- Resolución de problemas aritméticos: el modelo puede utilizarse para resolver problemas de matemáticas de nivel escolar (tipo SVAMP), generando respuestas paso a paso.
- Asistente de razonamiento lógico: integrado en aplicaciones educativas para explicar procesos de deducción o álgebra.
- Generación de explicaciones en lenguaje natural: dado un problema matemático, el modelo puede producir una explicación detallada del procedimiento.
- Fine-tuning de referencia: sirve como ejemplo reproducible de cómo adaptar Qwen3-14B con QLoRA usando la librería llama-factory, útil para equipos que quieran replicar el flujo.
- Evaluación de datasets de razonamiento: puede usarse como modelo base para comparar el efecto de diferentes datasets o hiperparámetros en tareas de razonamiento.
- Prototipado rápido: al ser un adaptador pequeño (4,6 GB en el repo, incluyendo probablemente el base cuantizado), permite experimentar con un modelo de 14B en hardware de consumo con cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index declara una lista de resultados vacía (`results: []`). Solo se reporta la pérdida de validación (0,2233), que no es comparable con métricas de tarea como MMLU o GSM8K. Por tanto, no se puede evaluar el rendimiento real del modelo frente a otros.

## Requisitos de hardware

- VRAM estimada para inferencia: con el adaptador LoRA y el base cuantizado a 4 bits, se necesitan aproximadamente 10-12 GB de VRAM (el base en 4 bits ocupa ~8 GB más el adaptador y overhead). En fp16 sin cuantizar, el base requiere ~30 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para inferencia con cuantización 4 bits; A100 (40 GB) o H100 para entrenamiento o inferencia en fp16.
- Compatibilidad con GPU de consumo: sí, con cuantización GGUF o bitsandbytes (4 bits) en GPUs con al menos 12 GB de VRAM.
- Opciones de despliegue: vLLM (con soporte LoRA), llama.cpp (si se convierte a GGUF), Ollama (mediante importación), o Transformers con PEFT.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización. En una RTX 4090 con 4 bits, se espera una generación de 20-40 tokens/segundo para un modelo de 14B.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros fine-tunings de Qwen3-14B. Como referencia, se puede comparar con el propio Qwen3-14B base y con modelos de tamaño similar:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-14B (base) | 14,8B | 131k | Apache 2.0 | Modelo original, sin fine-tuning específico |
| kyleliu789/qwen3-14b-svamp14-sft-qlora-r8-a16 | 14,8B + LoRA | 131k | other | Adaptador LoRA, especializado en razonamiento |
| Llama-3.1-8B | 8B | 128k | Llama 3.1 | Más pequeño, menos capacidad de razonamiento complejo |

No hay datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: no se sabe qué contiene exactamente `reasonif_14b_sft_train`, lo que impide conocer el dominio y los posibles sesgos.
- Licencia "other": aunque el base es Apache 2.0, el adaptador declara una licencia "other" que debe verificarse antes de uso comercial.
- Sin benchmarks: no hay evidencia de mejora real sobre el base en tareas de razonamiento; la pérdida de validación no es una métrica de calidad.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir respuestas incorrectas o inventadas, especialmente en problemas matemáticos complejos.
- Posible degradación fuera del dominio: el fine-tuning puede reducir el rendimiento en tareas generales no relacionadas con el dataset.
- Fecha de creación futura (2026): el modelo está fechado en agosto de 2026, lo que puede indicar un error o un modelo de un entorno de pruebas; no se recomienda su uso en producción sin validación adicional.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/kyleliu789/qwen3-14b-svamp14-sft-qlora-r8-a16
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Librería de entrenamiento (llama-factory): https://github.com/hiyouga/LLaMA-Factory
- Documentación de Qwen3: https://qwenlm.github.io/blog/qwen3/
