# cybertruck32489/LFM3-1.7B-RD-v2

## Resumen
LFM3-1.7B-RD-v2 es una conversión arquitectónica experimental del modelo LiquidAI/LFM3-1.7B, publicada por el usuario cybertruck32489 en Hugging Face. El autor refactoriza las 24 capas del transformer tri-híbrido original en un sistema Prelude → Shared Recurrent Core → Coda, con un núcleo recurrente compartido que se ejecuta entre 1 y 32 veces por token según la dificultad estimada. El resultado es un modelo de 1.958 millones de parámetros con profundidad de cómputo adaptativa por token, orientado a razonamiento y uso de herramientas.

La propuesta técnica es relevante porque introduce asignación dinámica de cómputo en decodificación autorregresiva: tokens predecibles salen con 2-3 pasos recurrentes, mientras que puntos de alta entropía o deducciones matemáticas reciben pasadas profundas. El modelo hereda la ventana de contexto de 256K tokens del LFM3-1.7B original y un vocabulario de 128.000 tokens, y se ha afinado con datasets de razonamiento, matemáticas, código y tool use.

Se distribuye con licencia LFM Open License v1.0, pesos en safetensors y bfloat16, y requiere `trust_remote_code` por el uso de código personalizado (`Lfm3RDForCausalLM`). Es un checkpoint de investigación, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Lfm3RDForCausalLM` (Prelude + Shared Recurrent Core con Phase LoRAs + Coda); operadores Gated Short Convolutions, Sliding-Window GQA y Full Global GQA |
| Parámetros totales | 1.958.450.760 |
| Parámetros activos | no disponible (no es MoE; el cómputo varía por profundidad recurrente, no por expertos) |
| Longitud de contexto | 256K tokens (heredada de LFM3-1.7B; alineada en ventanas de razonamiento/tool de 2.048 tokens) |
| Tipos de cuantización | no disponible (el checkpoint se publica en bfloat16) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | LFM Open License v1.0 (`license: other`) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento
El modelo parte de las 24 capas del LFM3-1.7B, que se estructuran como 5 repeticiones de un motivo de 4 capas `[FullAttention, ShortConv, SlidingWindowAttention, ShortConv]`. El autor extrae un banco de operadores recurrentes compartido entre los 5 motivos, acompañado de adaptadores de bajo rango específicos de fase (`Lfm3SharedLoRALinear` y `Lfm3SharedGroupedLoRALinear` con 3 grupos para las proyecciones de convolución B, C y x). Los bloques SwiGLU FFN permanecen específicos de cada fase como módulos de memoria. El layout final es: 2 capas Prelude → 5 fases Core × 4 capas (banco compartido + LoRA) → 2 capas Coda.

Sobre el entrenamiento, la model card describe una "conversión arquitectónica experimental y alineamiento continuo" del modelo base, pero no detalla el número de tokens ni la composición exacta del dataset. Los datasets declarados son `angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k`, `Jackrong/DeepSeek-V4-Distill-8000x`, `openai/gsm8k`, `nvidia/OpenMathReasoning`, `nvidia/OpenCodeReasoning`, `interstellarninja/hermes_reasoning_tool_use` y `GhettoGhostUSN/Fable-5.1-Max-Reasoning-Filtered-5000x`. Las innovaciones técnicas destacadas son: (1) finalización temprana del FFN-tail cuando T < 5, recorriendo los FFN no visitados sin ejecutar sus operadores de secuencia para preservar la base de representación; (2) snapshots canónicos de caché KV y refinamiento Gauss-Seidel para T = 6..32, con rollback de estados de fase y restauración de la caché Pass-1 al terminar el bucle; (3) inyección de feedback que proyecta la diferencia residual `h_latent - prelude_out` al inicio de cada ciclo; y (4) un controlador de regresión de profundidad (`Lfm3RDController`) que predice la profundidad requerida y la probabilidad de parada a partir del estado oculto normalizado, la velocidad del paso, el drift respecto a `prelude_out` y la inestabilidad coseno.

## Capacidades
- Generación de texto conversacional con modo de razonamiento y control de esfuerzo (`low`, `fast`, `medium`, `high`, `max` o `auto`).
- Razonamiento matemático y de múltiples pasos, reforzado con GSM8K y OpenMathReasoning.
- Generación de código y razonamiento sobre código, con OpenCodeReasoning en el entrenamiento.
- Tool calling y function calling, con datos de `hermes_reasoning_tool_use`.
- Razonamiento agéntico multi-paso con profundidad recurrente adaptativa por token.
- Multilingüismo en 16 idiomas (en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl).
- Profundidad de cómputo configurable de T = 1 a T = 32 pasos recurrentes por token.
- Modo `auto` con controlador aprendido que decide la profundidad por token en decodificación.

## Casos de uso
- Razonamiento matemático con presupuesto de cómputo variable: en modo `high` o `max`, el modelo asigna más pasadas recurrentes a los pasos de deducción y menos a los tokens de sintaxis, útil en pipelines de resolución de problemas donde la latencia no es crítica pero la precisión sí.
- Asistentes conversacionales de contexto largo: la ventana de 256K tokens permite mantener historiales extensos o documentos completos en memoria, con el modo `fast` para turnos rutinarios y `auto` para preguntas complejas.
- Agentes con tool calling: el modelo puede integrarse en bucles de razonamiento multi-paso que invocan APIs o funciones, usando la profundidad adaptativa para no gastar cómputo en tokens de formato y sí en la planificación de la llamada.
- Generación de código en entornos de desarrollo: con datos de OpenCodeReasoning, puede emplearse para autocompletado o revisión de fragmentos, ajustando el preset de esfuerzo según la complejidad del bloque.
- Investigación sobre cómputo adaptativo: el checkpoint y las trazas de pasos publicadas sirven para estudiar routing dinámico por token, early exit y refinamiento iterativo en modelos pequeños.
- Experimentación con arquitecturas recurrentes compartidas: útil para reproducir y extender el esquema Prelude/Core/Coda con LoRAs de fase en entornos académicos con GPUs de gama media.
- Prototipado multilingüe: al cubrir 16 idiomas, puede usarse para demos de traducción o atención al cliente en mercados con varios idiomas, siempre con validación humana por ser un checkpoint experimental.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente trazas cualitativas de profundidad recurrente por token (por ejemplo, una media de 3,75 pasos/token frente a 5,0 en una pasada completa para un prompt factual sencillo), pero no tablas de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos.

## Requisitos de hardware
- VRAM estimada para inferencia en bfloat16: aproximadamente 3,9 GB solo para pesos (1.958 millones de parámetros × 2 bytes), más caché KV y activaciones; en la práctica, entre 6 y 10 GB según longitud de contexto y profundidad recurrente.
- La caché KV con contexto de 256K tokens es el principal consumidor de memoria; para ventanas largas se recomienda GPU con 24 GB o más.
- GPU recomendadas: A100 40/80 GB o H100 para contexto largo y profundidad alta; RTX 4090 (24 GB) para contexto moderado; RTX 3090/4080 (16-24 GB) para pruebas con ventanas cortas.
- Cabe en GPUs de consumo con 12-16 GB si se limita la longitud de contexto y se usa el preset `fast` o `low`.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el código personalizado); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles de forma cuantitativa; la profundidad recurrente variable implica que el coste por token depende del preset y del contenido, con menor coste en tokens predecibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-RD-v2 | 1.958 M | 256K | Prelude + Core recurrente compartido + Coda | LFM Open License v1.0 | Hugging Face, safetensors |
| LiquidAI/LFM3-1.7B | no disponible en la información | 256K | Transformer tri-híbrido de 24 capas | LFM Open License v1.0 | Hugging Face |
| Alternativas de ~1-2B de propósito general | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa con otros modelos de tamaño similar no está disponible en la información proporcionada; el único punto de referencia directo es el modelo base LiquidAI/LFM3-1.7B, del que este checkpoint hereda contexto, vocabulario y licencia.

## Limitaciones y advertencias
- Checkpoint experimental: el propio autor lo describe como una conversión arquitectónica y alineamiento continuo, no como un modelo validado para producción.
- Requiere `trust_remote_code=True` por el uso de `Lfm3RDForCausalLM` y módulos personalizados; conviene auditar el código antes de ejecutarlo.
- No se han publicado benchmarks; el rendimiento real en tareas estándar es desconocido.
- La caché KV con 256K tokens puede agotar memoria en GPUs de consumo.
- El modo `auto` depende de un controlador aprendido cuya calibración no está documentada con métricas.
- Riesgo de alucinación y sesgos inherentes al modelo base y a los datasets de destilación empleados, no evaluados en la información disponible.
- Licencia LFM Open License v1.0: revisar sus términos antes de cualquier uso comercial, ya que impone condiciones específicas distintas de las licencias permisivas habituales.
- El repo ocupa 35,1 GB, muy por encima del tamaño de los pesos en bfloat16, lo que sugiere artefactos adicionales; verificar qué se descarga antes de desplegar.
- Solo 1 like y 1.608 descargas en el momento de la ficha: ecosistema de validación muy limitado.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/cybertruck32489/LFM3-1.7B-RD-v2
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Repositorio GitHub del autor: https://github.com/cybertruck021/lfm3-rd
- Dataset `angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k`: https://huggingface.co/datasets/angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k
- Dataset `Jackrong/DeepSeek-V4-Distill-8000x`: https://huggingface.co/datasets/Jackrong/DeepSeek-V4-Distill-8000x
- Dataset `openai/gsm8k`: https://huggingface.co/datasets/openai/gsm8k
- Dataset `nvidia/OpenMathReasoning`: https://huggingface.co/datasets/nvidia/OpenMathReasoning
- Dataset `nvidia/OpenCodeReasoning`: https://huggingface.co/datasets/nvidia/OpenCodeReasoning
- Dataset `interstellarninja/hermes_reasoning_tool_use`: https://huggingface.co/datasets/interstellarninja/hermes_reasoning_tool_use
- Dataset `GhettoGhostUSN/Fable-5.1-Max-Reasoning-Filtered-5000x`: https://huggingface.co/datasets/GhettoGhostUSN/Fable-5.1-Max-Reasoning-Filtered-5000x
