# mikeforai/Qwen3-0.6B-qlora-zhtw

## Resumen
Qwen3-0.6B-qlora-zhtw es un ajuste fino experimental del modelo Qwen/Qwen3-0.6B, desarrollado por el usuario mikeforai, orientado a generar respuestas en chino tradicional (zh-TW). Se trata de un modelo conversacional de muy pequeño tamano (596 millones de parametros segun los pesos en safetensors) obtenido mediante QLoRA sobre aproximadamente 3.600 pares de pregunta-respuesta humanamente escritos en chino tradicional, extraidos del dataset Heng666/Traditional_Chinese-aya_dataset. El objetivo declarado es que el modelo responda directamente en caracteres tradicionales en lugar de "pensar" en chino simplificado dentro de un bloque `<think>`, como hace el modelo base.

El modelo es relevante unicamente como ejercicio de pipeline de ajuste fino y como referencia para quien quiera replicar un flujo QLoRA sobre un modelo pequeno. El propio autor lo califica como no apto para uso real: el modelo repite frases, conserva terminologia de China continental (por ejemplo "硬件" en lugar de "硬體") y muestra carencias severas en matematicas, codigo y razonamiento.

La ficha se basa exclusivamente en la informacion publicada en Hugging Face y en la model card del autor; los datos no disponibles se indican explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino con QLoRA y fusion posterior a fp16 |
| Parametros totales | 596.049.920 (aproximadamente 0,6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso secuencias de 512 tokens) |
| Tipos de cuantizacion | Base entrenada en 4-bit NF4 con doble cuantizacion y computo fp16; el repositorio distribuido esta en fp16 (safetensors). No se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | Chino (zh), orientado a chino tradicional (zh-TW) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo fusionado, libreria transformers) |
| Parametros entrenables | 10,1M de 606M (1,67%), LoRA con r=16, alpha=32, dropout=0,05 |
| Tamano del repositorio | 2,4 GB |
| Modelo base | Qwen/Qwen3-0.6B |

## Arquitectura y entrenamiento
El modelo parte de Qwen3-0.6B, un transformer decoder-only de la familia Qwen3, y se ajusta mediante QLoRA: la base se carga cuantizada en 4-bit NF4 con doble cuantizacion y computo en fp16, y se entrenan adaptadores LoRA de rango 16 y alpha 32 sobre las proyecciones `q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj`. Posteriormente el adaptador se fusiona en los pesos base y se distribuye en fp16. El entrenamiento se realizo en 2 x Tesla T4 (Kaggle) durante unos 9,5 minutos (572 s), con 1 epoca, 113 pasos, longitud maxima de secuencia 512, batch de 4 por dispositivo con 4 pasos de acumulacion de gradiente, learning rate 2e-4 con schedule coseno, optimizador `paged_adamw_8bit` y gradient checkpointing activado. La perdida final media de entrenamiento fue de 4,592.

Los datos provienen de Heng666/Traditional_Chinese-aya_dataset (Apache 2.0), con pares de pregunta-respuesta anotados por humanos del proyecto Aya de Cohere y ya convertidos a caracteres tradicionales por el autor del dataset, sin usar OpenCC. Tras limpiar espacios, descartar respuestas de menos de 5 caracteres y eliminar preguntas duplicadas, quedaron 3.804 ejemplos, divididos en 3.613 de entrenamiento y 191 de validacion (semilla 42); tras eliminar muestras truncadas a cero tokens de respuesta quedaron 3.605 y 191. Cada par se formatea con la plantilla de chat de Qwen3 y la perdida se calcula solo sobre la respuesta. No se documenta RLHF ni DPO.

## Capacidades
- Generacion de texto conversacional en chino tradicional, con respuestas directas sin bloque `<think>`.
- Estilo de respuesta corto y telegrafico, frecuentemente iniciado con "答：" o "答案：", heredado del dataset Aya.
- Comprension de preguntas en chino y generacion de respuestas de conocimiento general limitado.
- Soporte de la plantilla de chat de Qwen3 mediante `apply_chat_template` con `add_generation_prompt=True`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de vision, audio ni modo de razonamiento explicito (thinking mode).
- Capacidad multilingue limitada al chino; no se documentan otros idiomas.

## Casos de uso
- Prueba de pipelines de ajuste fino QLoRA: sirve como referencia reproducible para validar un flujo completo con `transformers`, `peft`, `bitsandbytes` y `accelerate` sobre hardware modesto (2 x T4), dado que el entrenamiento completo dura menos de 10 minutos.
- Experimentos academicos sobre adaptacion de script (simplificado a tradicional): permite medir como un ajuste fino pequeno cambia el comportamiento de escritura y el estilo de respuesta de un modelo base.
- Generacion de respuestas breves en chino tradicional para prototipos internos de chat, siempre con revision humana y asumiendo alta tasa de repeticion.
- Evaluacion comparativa de modelos pequenos en tareas de conocimiento de Taiwan (TMMLU+) y razonamiento basico (ARC-Easy, HellaSwag) con lm-evaluation-harness.
- Base para experimentos de mitigacion de repeticion: el modelo es un caso claro donde probar `repetition_penalty` (1,1-1,2) o `no_repeat_ngram_size` y medir el efecto.
- Docencia y demostraciones sobre limites de los modelos de 0,6B: ilustra de forma concreta fallos de factualidad, repeticion y mezcla de terminologia regional.

## Benchmarks y rendimiento
Evaluacion con lm-evaluation-harness, 0-shot y solo 50 preguntas por subtarea, segun la model card:

| Tarea | Metrica | Base | Este modelo | Error estandar |
|---|---|---:|---:|---:|
| TMMLU+ (conocimiento de Taiwan) | acc | 0,289 | 0,334 | 0,008 |
| ARC-Easy | acc | 0,540 | 0,720 | 0,064 |
| HellaSwag | acc_norm | 0,480 | 0,500 | 0,071 |

Las mejoras en TMMLU+ y ARC-Easy superan 2 veces el error estandar; el cambio en HellaSwag esta dentro del ruido. Con solo 50 preguntas por tarea, los resultados deben interpretarse como una senal aproximada.

## Requisitos de hardware
- VRAM estimada para inferencia en fp16: aproximadamente 1,2 GB para los pesos (596M parametros), mas overhead de activaciones y cache KV; en la practica cabe en GPUs consumer con 4 GB o mas.
- Cuantizaciones de 8 bits o 4 bits reducirian el requisito por debajo de 1 GB, aunque el autor no las documenta para este repositorio.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) o GPUs de datacenter (T4, A100, H100) sin problema de memoria; el entrenamiento se realizo en 2 x Tesla T4.
- Cabe en GPU consumer y tambien en CPU para inferencia con latencia alta.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (metodo documentado), y por los tags del repositorio es compatible con text-generation-inference y endpoints. No se documentan instrucciones para llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| mikeforai/Qwen3-0.6B-qlora-zhtw | 0,6B | no disponible | zh (tradicional) | Apache 2.0 | Ajuste QLoRA experimental, respuestas repetitivas |
| Qwen/Qwen3-0.6B | 0,6B | no disponible en la informacion proporcionada | multilingue | Apache 2.0 | Modelo base; genera bloque `<think>` y respuestas mas elaboradas |
| Alternativas de 0,5B-1B orientadas a chino tradicional | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias
- Modelo muy pequeno (0,6B): comete errores, inventa hechos y rinde mal en matematicas, codigo y razonamiento.
- Repeticion severa: tiende a quedarse repitiendo una misma frase hasta alcanzar `max_new_tokens`; el autor sugiere `repetition_penalty` de 1,1 a 1,2 o `no_repeat_ngram_size`, sin haberlo evaluado.
- No corrige terminologia de China continental: en las pruebas el autor observo un aumento de terminos como "視頻", "軟件" o "硬件" (de 3 a 5 casos), en lugar de sus equivalentes en Taiwan.
- Respuestas muy cortas y telegraficas, con prefijos "答：" o "答案：", lo que limita su uso en conversaciones naturales.
- Capacidad multilingue practicamente nula fuera del chino.
- Riesgo de alucinacion alto por el tamano del modelo y el escaso volumen de datos de ajuste (unos 3.600 ejemplos).
- El autor lo declara explicitamente como modelo de aprendizaje y prueba de pipeline, no listo para uso real.
- Licencia Apache 2.0, compatible con uso comercial, pero la calidad del modelo desaconseja su uso en produccion sin validacion exhaustiva.
- Los benchmarks se basan en solo 50 preguntas por tarea, por lo que no son concluyentes.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/mikeforai/Qwen3-0.6B-qlora-zhtw
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de entrenamiento: https://huggingface.co/datasets/Heng666/Traditional_Chinese-aya_dataset
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Paper de Qwen3 (referencia arxiv:2505.09388): https://arxiv.org/abs/2505.09388
