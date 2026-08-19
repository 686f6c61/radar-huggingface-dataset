# OliverSundaram/Llama-3.2-1B-MathCodeInstruct-10k

## Resumen

Llama-3.2-1B-MathCodeInstruct-10k es un fine-tuning del modelo base Llama-3.2-1B (publicado por Meta) realizado por OliverSundaram sobre un subconjunto de 10 000 ejemplos del dataset MathLLMs/MathCodeInstruct. El objetivo es mejorar la capacidad del modelo para resolver problemas matemáticos planteados en lenguaje natural, generando razonamientos paso a paso intercalados con código Python ejecutable. Forma parte de una familia de tres modelos entrenados con 5k, 10k y 20k ejemplos para estudiar cómo el volumen de datos de fine-tuning afecta al rendimiento matemático y a las capacidades generales.

El modelo emplea una arquitectura transformer decoder-only de 1 235 814 400 parámetros (1,24B), con un contexto de 128 000 tokens heredado del modelo base. Se entrenó con LoRA (r=16, alpha=16, dropout=0) fusionada después a los pesos completos, sobre una única época y con hardware modesto (una RTX 4060 de 8 GB). La licencia es llama3.2, la misma que la del modelo base de Meta, y los pesos se distribuyen en formato safetensors.

La relevancia de este modelo radica en su tamaño reducido y su especialización en matemáticas, lo que lo hace adecuado para entornos con recursos limitados donde se necesita una capacidad razonable de razonamiento matemático sin recurrir a modelos de varios cientos de miles de millones de parámetros. Además, el estudio comparativo entre los tres tamaños de subconjunto proporciona información práctica sobre el equilibrio entre datos de entrenamiento y rendimiento en modelos pequeños.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) |
| Parametros totales | 1 235 814 400 (1,24B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens (heredado del modelo base unsloth/Llama-3.2-1B) |
| Tipos de cuantizacion | no especificado en la ficha; pesos en safetensors (BF16), cuantizaciones posteriores posibles (GPTQ, AWQ, GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | llama3.2 (licencia de Meta Llama 3.2) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.2 de Meta, un transformer decoder-only con normalización RMSNorm, atención con RoPE y activación SwiGLU. El fine-tuning se realizó mediante LoRA con r=16 y alpha=16 sin dropout, aplicado a todas las proyecciones de atención y MLP, y posteriormente se fusionaron los adaptadores a los pesos completos. El entrenamiento se ejecutó durante una sola época sobre 10 000 ejemplos del dataset MathCodeInstruct, con un tamaño de batch efectivo de 16 (batch 1 × gradientes acumulados 16), tasa de aprendizaje 2e-4 con scheduler coseno y warmup del 3%. Se utilizó el framework Unsloth junto con TRL SFTTrainer sobre una única RTX 4060 de 8 GB. No se aplicaron técnicas de RLHF ni DPO adicionales; el modelo solo hereda el alineamiento del base.

El dataset MathCodeInstruct combina problemas matemáticos con instrucciones que requieren razonamiento paso a paso y, en muchos casos, la generación de código Python para verificar o calcular la solución. Esto enseña al modelo a intercalar explicaciones en lenguaje natural con bloques de código ejecutable, una habilidad útil para tareas de resolución de problemas y para su integración en entornos de programación.

## Capacidades

- Generación de texto en inglés con formato conversacional (usa plantilla de chat de Llama 3.2).
- Razonamiento matemático paso a paso: resuelve problemas de aritmética, álgebra y razonamiento cuantitativo.
- Intercalación de código Python ejecutable dentro de la respuesta, útil para verificación computacional.
- Soporte de conversaciones multi-turno gracias al formato de chat y al contexto largo de 128k tokens.
- No dispone de tool calling, visión, audio ni otras capacidades multimodales.
- Capacidades generales de razonamiento y comprensión limitadas por el tamaño de 1B parámetros y el entrenamiento especializado.

## Casos de uso

- Tutor matemático automatizado: el modelo puede guiar a estudiantes en la resolución de problemas paso a paso, explicando cada operación. Su formato de chat permite interacciones de seguimiento, y su contexto largo admite problemas extensos o series de ejercicios.
- Generación de soluciones con código: en entornos educativos o de autoaprendizaje, el modelo puede producir explicaciones acompañadas de código Python que el usuario puede ejecutar para comprobar resultados, fomentando la comprensión práctica.
- Asistente de razonamiento cuantitativo en aplicaciones ligeras: por su tamaño reducido, puede desplegarse en dispositivos con pocos recursos (portátiles, edge) para tareas de cálculo y análisis numérico básico.
- Evaluación de modelos pequeños en benchmarks matemáticos: sirve como punto de referencia para estudiar el impacto del volumen de datos de fine-tuning en modelos de 1B, tal como plantea el autor en su estudio.
- Prototipado rápido de agentes conversacionales especializados en matemáticas: al ser un modelo ligero, permite iterar rápidamente en el desarrollo de chatbots o asistentes de dominio específico antes de escalar a modelos mayores.
- Generación de datos sintéticos de entrenamiento: el modelo puede utilizarse para crear ejemplos de razonamiento matemático con código, que luego sirvan para entrenar otros modelos o aumentar datasets.

## Benchmarks y rendimiento

Los resultados que se presentan a continuación son los declarados por el autor en la model card, obtenidos con lm-evaluation-harness y comparados con el modelo base sin ajustar.

| Benchmark | Llama-3.2-1B (base) | Este modelo | Cambio |
|---|---|---|---|
| GSM8K (exact match, 5-shot) | 5,8% | 8,7% | +2,9% |
| ARC-Challenge (acc_norm, 25-shot) | 36,9% | 36,1% | -0,8% |
| HellaSwag (acc_norm, 10-shot) | 64,2% | 63,8% | -0,4% |
| WinoGrande (acc, 5-shot) | 60,8% | 62,0% | +1,3% |

No se ha publicado el valor numérico de MMLU en la información disponible; la model card incluye una gráfica comparativa por categorías, pero sin cifras concretas. La velocidad de generación medida por el autor es de 38,79 tokens/segundo (generación greedy, single-request, en RTX 4060), frente a los 12,74 tokens/segundo del modelo base.

## Requisitos de hardware

- VRAM estimada: en BF16 (2 bytes por parámetro) el modelo ocupa aproximadamente 2,5 GB de VRAM, más overhead de activaciones y caché KV. Con cuantización de 8 bits (~1,2 GB) o 4 bits (~0,6 GB) cabe en GPUs con 4 GB o menos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 4060, GTX 1660). El autor entrenó con una RTX 4060 de 8 GB; para inferencia es suficiente con menos.
- Sí cabe en GPUs de consumo: RTX 3060, RTX 4060, RTX 4070, y también en tarjetas integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (con device_map="auto"), vLLM (compatible con modelos Llama), llama.cpp (para CPU/GPU con cuantización GGUF), Ollama (si se convierte a GGUF), TGI (Text Generation Inference).
- Latencia y throughput: el autor reporta 38,79 tokens/segundo en RTX 4060 con generación greedy. En hardware más potente o con cuantización se puede superar; en CPU la velocidad será significativamente menor (del orden de 5-15 tokens/segundo).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento GSM8K (5-shot) |
|---|---|---|---|---|
| Llama-3.2-1B-MathCodeInstruct-10k | 1,24B | 128k | llama3.2 | 8,7% |
| Llama-3.2-1B (base) | 1,24B | 128k | llama3.2 | 5,8% |
| Qwen2.5-1.5B-Instruct | 1,54B | 32k | Apache 2.0 | no disponible |
| TinyLlama-1.1B-Chat | 1,1B | 2k | Apache 2.0 | no disponible |

Los datos de Qwen2.5 y TinyLlama no se han verificado en esta ficha; se indican como referencia de alternativas de tamaño similar, pero su rendimiento en GSM8K no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Entrenado únicamente sobre 10 000 ejemplos durante una época; no es un asistente generalista y su rendimiento fuera del dominio matemático es limitado.
- Los resultados en benchmarks generales (ARC, HellaSwag, WinoGrande) son ligeramente inferiores a los del modelo base, lo que sugiere una ligera pérdida de capacidades generales a cambio de la mejora en matemáticas.
- No se ha aplicado alineamiento de seguridad adicional; el modelo hereda únicamente el del base Llama-3.2-1B, por lo que puede producir respuestas inapropiadas o sesgadas en contextos no matemáticos.
- Riesgo de alucinación en problemas complejos o ambiguos; el modelo puede generar razonamientos incorrectos con apariencia de validez.
- Solo soporta inglés; no está entrenado para otros idiomas.
- La licencia llama3.2 impone restricciones de uso comercial; es necesario revisar los términos completos de Meta antes de desplegar el modelo en producción.
- El contexto de 128k tokens es teórico; en la práctica, la generación con contextos muy largos puede degradar el rendimiento y aumentar la latencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OliverSundaram/Llama-3.2-1B-MathCodeInstruct-10k
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-1B
- Dataset MathCodeInstruct: https://huggingface.co/datasets/MathLLMs/MathCodeInstruct
- Licencia Llama 3.2: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE
- Escrito del entrenamiento (GitHub): https://github.com/OliverSundaram/finetuning-Llama3.2-1B
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
