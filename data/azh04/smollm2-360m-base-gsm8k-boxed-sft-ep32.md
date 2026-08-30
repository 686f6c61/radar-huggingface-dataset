# AZH04/SmolLM2-360M-base-gsm8k-boxed-sft-ep32

## Resumen

SmolLM2-360M-base-gsm8k-boxed-sft-ep32 es un checkpoint de fine-tuning supervisado (SFT) del modelo base HuggingFaceTB/SmolLM2-360M, entrenado por el usuario AZH04 sobre el conjunto de datos GSM8K con la receta "boxed". El modelo se ha ajustado durante 32 épocas sobre 978 trazas de razonamiento generadas por un profesor Qwen2.5-3B-Instruct, alcanzando 31.296 presentaciones de demostraciones. Este checkpoint forma parte de una escalera de rungs SFT con distintos presupuestos de demostraciones, diseñada para comparar de forma controlada un pipeline secuencial (SFT seguido de RL) frente a un pipeline híbrido (demostraciones transmitidas durante el RL) con el mismo presupuesto total de demostraciones.

El objetivo principal del modelo es servir como inicialización para experimentos de reinforcement learning (RL) en el dominio de razonamiento matemático. No es un modelo de propósito general ni un asistente conversacional; su uso previsto es estrictamente investigador, centrado en evaluar el impacto del número de épocas de SFT en el rendimiento posterior de RL. Con 361 millones de parámetros y arquitectura basada en Llama, es un modelo ligero que puede ejecutarse en hardware de consumo, lo que lo hace accesible para laboratorios con recursos limitados. Su relevancia radica en que permite estudiar de forma aislada el efecto del presupuesto de demostraciones en el entrenamiento de modelos pequeños, un aspecto clave en el diseño de pipelines de entrenamiento eficientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (SmolLM2) |
| Parametros totales | 361.821.120 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base SmolLM2 esta entrenado principalmente en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de HuggingFaceTB/SmolLM2-360M, un transformer denso basado en la arquitectura Llama con 360 millones de parámetros. El fine-tuning es completo (sin LoRA) y se realiza en bf16 con una sola GPU (FSDP world size 1). El corpus de entrenamiento consiste en 978 trazas de razonamiento verificadas, generadas por el modelo profesor Qwen2.5-3B-Instruct, seleccionadas mediante un criterio de "presupuesto más corto que se ajusta correctamente" y validadas con un evaluador estricto (nota 1.0). El prompt utilizado es el estándar de verl en modo zero-shot: `{question} Let's think step by step and output the final answer within \boxed{}.` Los objetivos terminan con el token EOS para que el modelo aprenda a detener la generación.

El entrenamiento se ejecuta con una tasa de aprendizaje de 1e-5, tamaño de lote 32 y un programa de decaimiento coseno que se extiende a lo largo del número de épocas del propio run. Cada rung de la escalera es un run independiente, no un checkpoint intermedio de un run más largo, porque el calendario de LR difiere entre ellos. Esta separación permite comparar de forma limpia el efecto del número de épocas manteniendo el mismo presupuesto de demostraciones que las variantes híbridas del mismo estudio. No se aplican técnicas adicionales como RLHF o DPO; el modelo es exclusivamente un SFT previo para RL.

## Capacidades

- Razonamiento matemático básico: el modelo puede resolver problemas aritméticos y de razonamiento del conjunto GSM8K, generando respuestas en formato `\boxed{}` con una cadena de pensamiento paso a paso.
- Generación de texto condicionada a prompts de matemáticas: al ser un fine-tuning de un modelo base, conserva la capacidad de generar texto libre, aunque su especialización principal es el dominio GSM8K.
- Terminación de secuencia: entrenado para emitir EOS al final de la respuesta, lo que evita generaciones infinitas.
- No soporta tool calling ni function calling: al ser un modelo base fine-tuneado sin instrucciones, no tiene capacidades de uso de herramientas.
- No soporta agentes ni razonamiento multi-paso fuera del ámbito matemático: su entrenamiento está limitado a trazas de GSM8K.
- Capacidades multilingües limitadas: el modelo base SmolLM2 está entrenado principalmente en inglés, por lo que su rendimiento en otros idiomas no está garantizado.
- No dispone de modo de pensamiento extendido ni capacidades multimodales (visión, audio).

## Casos de uso

- Inicialización para reinforcement learning: el uso previsto del modelo es como punto de partida para entrenar con RL en GSM8K, donde el checkpoint ya ha aprendido a generar respuestas en formato `\boxed{}` y a seguir el prompt de razonamiento paso a paso.
- Comparación de presupuestos de demostraciones en SFT: investigadores pueden usar este checkpoint junto con otros de la misma escalera (6, 9, 12, 16, 24 épocas) para estudiar cómo varía el rendimiento posterior en RL según el número de épocas de SFT, manteniendo constante el presupuesto total de demostraciones.
- Evaluación de protocolos de muestreo: dado que se proporciona un protocolo de referencia (n=128, temperatura 0.6, top_p 0.95, max 1024 tokens), el modelo sirve para validar evaluadores estrictos que leen el último `\boxed{...}`.
- Benchmark de razonamiento en modelos pequeños: al ser un modelo de 360M, puede usarse para medir el techo de rendimiento de modelos pequeños en GSM8K bajo diferentes estrategias de entrenamiento.
- Estudio de transferencia de conocimiento de modelos profesores: el corpus proviene de Qwen2.5-3B-Instruct, por lo que el modelo permite analizar cómo se destila el razonamiento de un profesor más grande a un alumno pequeño.
- Desarrollo de pipelines de entrenamiento eficientes: el modelo es adecuado para experimentos que requieren múltiples ejecuciones con recursos limitados, gracias a su tamaño reducido y su licencia Apache 2.0 que permite uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint concreto (32 épocas) en la informacion disponible. La model card proporciona datos de referencia para rungs más cortos de la misma escalera, evaluados con el protocolo estándar (n=128, temperatura 0.6, top_p 0.95, max 1024 tokens, evaluador estricto que lee el último `\boxed{}`):

| Rung (épocas) | pass@1 | pass@64 |
|---|---|---|
| 6 | 0.0683 | 0.6693 |
| 9 | 0.0718 | 0.6934 |
| 12 | 0.0756 | 0.6990 |
| 32 | no disponible | no disponible |

Estos valores indican una mejora progresiva con más épocas, pero no se puede extrapolar el resultado para 32 épocas sin datos medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 361M parámetros en bf16, el peso ocupa aproximadamente 723 MB; con overhead de activaciones y KV cache, se estima un consumo de 1-2 GB en inferencia, aunque el valor exacto no está documentado.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060, o superiores. También puede ejecutarse en CPU para inferencia lenta.
- Compatibilidad con GPU de consumo: sí, es un modelo pequeño que cabe en la mayoría de GPUs de consumo actuales.
- Opciones de despliegue: compatible con frameworks como llama.cpp, vLLM, Hugging Face Transformers, TGI y Ollama, aunque no se han proporcionado configuraciones específicas.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y del backend utilizado.

## Comparativa con modelos similares

No se dispone de comparativas con otros modelos de la misma categoría (fine-tunes de SmolLM2-360M en GSM8K) en la informacion proporcionada. La única comparativa posible es interna, entre los distintos rungs de la escalera SFT del mismo autor:

| Modelo | Parámetros | Épocas | pass@1 (GSM8K) | Licencia |
|---|---|---|---|---|
| SmolLM2-360M-base-gsm8k-boxed-sft-ep6 | 361M | 6 | 0.0683 | Apache 2.0 |
| SmolLM2-360M-base-gsm8k-boxed-sft-ep9 | 361M | 9 | 0.0718 | Apache 2.0 |
| SmolLM2-360M-base-gsm8k-boxed-sft-ep12 | 361M | 12 | 0.0756 | Apache 2.0 |
| SmolLM2-360M-base-gsm8k-boxed-sft-ep32 | 361M | 32 | no disponible | Apache 2.0 |

Para comparar con otros modelos de tamaño similar no fine-tuneados en GSM8K, se necesitarían datos externos que no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de investigación, no un producto listo para producción; su único propósito es servir como inicialización para RL.
- Su rendimiento en GSM8K es bajo en términos de pass@1 (alrededor de 0.07 en rungs inferiores), por lo que no es adecuado para tareas de razonamiento matemático sin un entrenamiento posterior.
- No soporta tareas generales de conversación, generación de código, ni uso de herramientas; su especialización es exclusivamente el formato de razonamiento GSM8K.
- Al ser un modelo base fine-tuneado, puede presentar sesgos heredados del modelo base SmolLM2, que no han sido evaluados ni mitigados.
- Riesgo de alucinación en respuestas fuera del dominio GSM8K, ya que no ha sido entrenado con instrucciones de seguridad ni alineación.
- La longitud de contexto no está documentada en la model card; se recomienda asumir la del modelo base (probablemente 2048 tokens, pero no confirmado).
- El modelo solo ha sido evaluado con un protocolo específico (n=128, temperatura 0.6, top_p 0.95); otros parámetros de muestreo pueden dar resultados diferentes.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantías de soporte ni mantenimiento por parte del autor.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/AZH04/SmolLM2-360M-base-gsm8k-boxed-sft-ep32
- Rung de 12 épocas (misma escalera): https://huggingface.co/AZH04/SmolLM2-360M-base-gsm8k-boxed-sft-ep12
- Rung sobre versión instruct (SFT): https://huggingface.co/AZH04/SmolLM2-360M-instruct-gsm8k-boxed-sft
- Paper de SmolLM2 (documentación del modelo base): https://arxiv.org/html/2502.02737v1
- Repositorio de referencia para entrenamiento de razonamiento en modelos pequeños (relacionado, no oficial): https://github.com/manishklach/micro-reasoner
