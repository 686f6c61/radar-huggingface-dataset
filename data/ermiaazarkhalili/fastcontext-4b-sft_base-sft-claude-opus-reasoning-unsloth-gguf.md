# ermiaazarkhalili/FastContext-4B-SFT_base-SFT-Claude-Opus-Reasoning-Unsloth-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF de un fine-tune LoRA del modelo `microsoft/FastContext-1.0-4B-SFT`, que ya no está disponible en el Hub. El fine-tune fue realizado por el autor `ermiaazarkhalili` mediante supervisión fina (SFT) sobre un dataset privado de destilación de razonamiento de Claude Opus, con el objetivo de mejorar las capacidades de razonamiento del modelo base. El resultado es un modelo de 4.022 millones de parámetros, optimizado para ejecución en CPU y entornos edge mediante runtimes compatibles con GGUF como llama.cpp, Ollama o LM Studio.

La relevancia de este modelo radica en que ofrece una alternativa ligera y cuantizada para tareas de razonamiento en entornos con recursos limitados, sin necesidad de GPUs de alta gama. Al estar basado en un fine-tune de destilación de un modelo de razonamiento avanzado, se espera que herede parte de esa capacidad, aunque no se han publicado evaluaciones de rendimiento que lo confirmen. La arquitectura exacta no está documentada en la model card, aunque fuentes externas sugieren que el modelo base podría ser una variante de Qwen3, pero esto no está confirmado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es `microsoft/FastContext-1.0-4B-SFT`; fuentes externas sugieren posible base Qwen3, sin confirmar) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó max sequence length 2048, pero no se especifica el contexto de inferencia) |
| Tipos de cuantizacion | q2_k, q3_k_m, q4_k_m, q5_k_m, q6_k, q8_0 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (en fuentes externas se menciona apache-2.0 para el modelo sin cuantizar, pero no está confirmado en esta ficha) |
| Formato de pesos | GGUF (safetensors disponibles en el repositorio del modelo sin cuantizar) |

## Arquitectura y entrenamiento

El modelo es un fine-tune LoRA del checkpoint `microsoft/FastContext-1.0-4B-SFT`, que ya no está disponible públicamente. El entrenamiento se realizó con QLoRA (cuantización de 4 bits para la base) usando la librería Unsloth y TRL de HuggingFace. La configuración de LoRA incluye rank 16, alpha 16, learning rate 0.0002, una sola época, batch size efectivo de 8 (2 x 4 grad accum) y longitud máxima de secuencia de 2048 tokens. Los módulos objetivo fueron `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El dataset de entrenamiento, `ermiaazarkhalili/claude-reasoning-distillation` (privado), consiste en destilación de razonamiento de Claude Opus, lo que sugiere que el fine-tune busca transferir habilidades de razonamiento paso a paso al modelo base. Los adaptadores LoRA se fusionaron con los pesos base, por lo que el modelo resultante no puede separarse del fine-tune.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto coherente y continuar conversaciones, dado que es un modelo de lenguaje de 4B parámetros.
- Razonamiento: gracias al fine-tune sobre destilación de razonamiento de Claude Opus, se espera que el modelo muestre mejoras en tareas de razonamiento lógico y multi-paso, aunque no hay evaluaciones que lo confirmen.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado explícitamente, pero el fine-tune sugiere cierta capacidad de razonamiento encadenado.
- Capacidades multilingües: no disponible.
- Capacidades especiales: no se mencionan capacidades de visión, audio u otras modalidades.

## Casos de uso

- Asistente de razonamiento en entornos con recursos limitados: gracias a las cuantizaciones GGUF, el modelo puede ejecutarse en CPU o en GPUs de gama baja, permitiendo desplegar un asistente capaz de resolver problemas de lógica o explicar conceptos complejos en dispositivos edge.
- Generación de explicaciones técnicas: el fine-tune con datos de razonamiento de Claude Opus puede ser útil para generar explicaciones paso a paso de algoritmos, matemáticas o conceptos de programación, aunque sin benchmarks no se puede garantizar la calidad.
- Chatbot de propósito general en local: con Ollama o llama.cpp, se puede integrar en aplicaciones de chat sin conexión, ofreciendo respuestas de texto en tiempo real con bajo consumo de recursos.
- Prototipado rápido de aplicaciones de NLP: al ser un modelo pequeño y cuantizado, es adecuado para pruebas de concepto en entornos de desarrollo donde no se dispone de infraestructura GPU.
- Educación y aprendizaje: puede utilizarse como herramienta de tutoría para practicar razonamiento lógico o resolver ejercicios de matemáticas, aprovechando su capacidad de generar cadenas de razonamiento.
- Inferencia en servidores de bajo coste: las cuantizaciones q4_k_m o q5_k_m permiten servir el modelo en instancias cloud de CPU con poca memoria, reduciendo costes operativos en aplicaciones de generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta observaciones de pérdida de entrenamiento (loss) de dos ejecuciones SLURM: en una, la pérdida pasó de 1.1628 a 0.8690 en 94.254 pasos; en otra, de 1.1558 a 0.8011 en 1.310 pasos. Estos valores son solo de entrenamiento y no deben interpretarse como indicadores de calidad en tareas downstream.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización, el archivo GGUF ocupa entre 1.67 GB (q2_k) y 4.28 GB (q8_0). Para la cuantización q4_k_m (2.50 GB), se estima un uso de VRAM de aproximadamente 3-4 GB incluyendo overhead, por lo que cabe en GPUs con 4 GB o más.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) puede ejecutar la q4_k_m. Para las cuantizaciones más altas (q6_k, q8_0) se recomienda al menos 6 GB de VRAM.
- Si cabe en consumer GPU: sí, las cuantizaciones q2_k a q5_k_m caben en GPUs de consumo con 4-6 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. También se puede usar vLLM si se convierte a otro formato, pero no es el caso nativo.
- Latencia y throughput: no disponible. Depende del hardware y la cuantización; en CPU moderna, la q4_k_m puede generar varios tokens por segundo, pero no hay datos concretos.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente con otros modelos. Sin embargo, se pueden mencionar alternativas de tamaño similar:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| FastContext-4B-SFT (este) | 4.02B | no disponible | no disponible | GGUF en HuggingFace |
| Qwen2.5-4B-Instruct | 4.0B | 32K (típico) | Apache 2.0 | HuggingFace, GGUF |
| Llama-3.2-3B-Instruct | 3.2B | 128K | Llama 3.2 Community License | HuggingFace, GGUF |
| Phi-3-mini-4k-instruct | 3.8B | 4K | MIT | HuggingFace, GGUF |

Esta comparativa es estructural y no refleja rendimiento, ya que no hay benchmarks publicados para el modelo evaluado.

## Limitaciones y advertencias

- No se ha realizado ninguna evaluación de benchmarks sobre este checkpoint; los únicos números reportados son pérdidas de entrenamiento, que no garantizan calidad en tareas reales.
- El modelo hereda los sesgos, el conocimiento limitado (knowledge cutoff) y los modos de fallo del modelo base `microsoft/FastContext-1.0-4B-SFT`, que ya no está disponible para verificación.
- El fine-tune se realizó sobre un único dataset de instrucciones (destilación de razonamiento de Claude Opus); el comportamiento fuera de esa distribución no está probado.
- Los adaptadores LoRA se fusionaron con los pesos base, por lo que el modelo no puede revertirse al estado original sin el fine-tune.
- La licencia no está especificada en la model card; aunque fuentes externas mencionan apache-2.0 para el modelo sin cuantizar, no hay confirmación oficial, por lo que se debe verificar antes de uso comercial.
- No se dispone de información sobre la longitud de contexto efectiva en inferencia, lo que puede limitar su uso en tareas que requieran contextos largos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ermiaazarkhalili/FastContext-4B-SFT_base-SFT-Claude-Opus-Reasoning-Unsloth-GGUF
- Modelo sin cuantizar (referencia): https://huggingface.co/ermiaazarkhalili/FastContext-4B-SFT_base-SFT-Claude-Opus-Reasoning-Unsloth
- Variante RL del mismo autor: https://huggingface.co/ermiaazarkhalili/FastContext-4B-RL_base-SFT-Claude-Opus-Reasoning-Unsloth-GGUF
- Página en Friendli AI (menciona licencia apache-2.0): https://friendli.ai/models/ermiaazarkhalili/FastContext-4B-SFT_base-SFT-Claude-Opus-Reasoning-Unsloth
- Herramientas de entrenamiento: Unsloth (https://github.com/unslothai/unsloth) y TRL (https://github.com/huggingface/trl)
