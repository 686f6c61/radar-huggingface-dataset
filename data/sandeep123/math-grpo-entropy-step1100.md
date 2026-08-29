# sandeep123/math-grpo-entropy-step1100

## Resumen

`math-grpo-entropy-step1100` es un modelo de razonamiento matemático desarrollado por el usuario sandeep123, que parte del modelo base Qwen/Qwen2.5-Math-1.5B y lo entrena con GRPO (Group Relative Policy Optimization) sobre el dataset ScienceQA, incorporando un bonus de entropía en la pérdida de política. El objetivo es servir como baseline de investigación para estudiar cómo el coeficiente de entropía afecta a la calidad y diversidad de las respuestas generadas en tareas de opción múltiple de ciencia.

El modelo tiene 1.777.088.000 parámetros (1,78B) y se distribuye en formato safetensors bajo licencia Apache-2.0. Fue seleccionado como el checkpoint con mejor pass@6 en validación (0,9219) dentro de su rama experimental. Una característica crítica es que fue entrenado sin plantilla de chat (raw prompt text), por lo que aplicarle la plantilla de Qwen2.5-Math en inferencia provoca una caída de aproximadamente 19 puntos en pass@1. Está pensado para investigación y comparación de métodos de RL, no para uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5-Math-1.5B) |
| Parametros totales | 1.777.088.000 (1,78B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32K en el modelo base; entrenado con ventanas de 1536 tokens (512 prompt + 1024 respuesta) |
| Tipos de cuantizacion | No disponible (solo safetensors en bfloat16) |
| Idiomas soportados | No disponibles (el base Qwen2.5-Math es multilingue, pero no se confirma tras el fine-tuning) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen2.5-Math-1.5B, un transformer decoder denso de 1,78B parámetros. El entrenamiento utiliza GRPO con un bonus de entropía: se añade el término `-entropy_coeff * H` a la pérdida de política, con `entropy_coeff=0.001`, enmascarado únicamente a los tokens de respuesta. El dataset es ScienceQA en su versión `scienceqa_boxfix`, con 25 épocas (1250 pasos), batch de 128 prompts y K=6 rollouts por prompt. La tasa de aprendizaje es constante de 1e-6, con un coeficiente KL de 0.01 dentro de la recompensa, y una recompensa de formato de 0.03 constante. El clipping es 0.2/0.2 y la temperatura de rollout es 1.0. No se aplicó plantilla de chat durante el entrenamiento (verl con `apply_chat_template=False`), lo que condiciona la inferencia.

## Capacidades

- Razonamiento matemático en preguntas de opción múltiple de ciencia (ScienceQA), con respuestas extraídas del contenido de `\boxed{}` o del último token A-E.
- Generación de texto con formato estructurado para respuestas de opción múltiple.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso explícito.
- No tiene capacidades de visión ni audio; es exclusivamente texto.
- Multilingüismo no confirmado; el modelo base Qwen2.5-Math es multilingüe, pero no hay evidencia de que el fine-tuning lo preserve.
- No dispone de modo thinking especial ni decodificación especulativa.

## Casos de uso

- Evaluación de métodos de RL para razonamiento matemático: el modelo sirve como baseline reproducible para comparar variantes de GRPO (con y sin bonus de entropía) en entornos académicos.
- Investigación sobre el efecto del bonus de entropía en la diversidad de rollouts: al variar `entropy_coeff`, se puede estudiar cómo cambia el equilibrio entre exploración y explotación en la generación de respuestas.
- Análisis del desajuste entre entrenamiento sin plantilla de chat e inferencia con plantilla: el modelo permite cuantificar la pérdida de rendimiento (~19 puntos de pass@1) al aplicar la plantilla de Qwen2.5-Math, un fenómeno relevante para pipelines de RL.
- Estudio de la selección de checkpoints según métricas de calidad vs diversidad: el autor publica checkpoints óptimos para pass@1 y pass@6 por separado, lo que permite investigar la relación entre ambas métricas.
- Generación de respuestas en exámenes de ciencia de opción múltiple: aunque es un modelo de investigación, puede emplearse para generar respuestas en dominios restringidos donde el formato de salida sea `\boxed{}`.
- Benchmarking de infraestructura de inferencia: al ser un modelo pequeño (1,78B), es útil para probar configuraciones de vLLM, llama.cpp u otros motores con requisitos de hardware modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (MMLU, GSM8K, HumanEval, etc.) en la informacion disponible. El autor proporciona métricas de validación propias sobre ScienceQA, con 256 prompts held-out, K=6, temperatura 1.0 y seed 42:

| Metrica | Valor |
|---|---|
| pass@1 | 0.6660 |
| pass@6 | 0.9219 |
| step | 1100 |

Estas métricas corresponden a la precisión de respuesta de opción múltiple, donde una respuesta se considera correcta si el contenido del último `\boxed{}` (o el último token A-E si no hay caja) coincide con la opción correcta. Las respuestas sin respuesta extraíble se puntúan como incorrectas.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los pesos ocupan aproximadamente 3,56 GB (1,78B × 2 bytes). Con overhead de activaciones y KV cache, se recomienda al menos 6-8 GB de VRAM para inferencia con contexto corto.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más, como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB). También funciona en GPUs de datacenter como A10 o A100.
- Cabe en GPUs consumer: sí, en la mayoría de GPUs modernas con 8 GB o más.
- Opciones de despliegue: vLLM (ejemplo proporcionado por el autor), llama.cpp (si se convierte a GGUF), Ollama (requiere conversión previa), TGI (Text Generation Inference).
- Latencia y throughput: no disponibles. Dado el tamaño, se espera una latencia baja en GPUs modernas, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos en la informacion disponible. El autor ha publicado otros checkpoints de la misma familia experimental, como `sandeep123/sqa-grpo-entropy-step1100` y `sandeep123/sqa-grpo-cliphigh-step1100`, que parecen variantes del mismo experimento, pero no se proporcionan sus especificaciones ni métricas. El modelo base Qwen2.5-Math-1.5B es el punto de partida natural para comparar el efecto del entrenamiento con RL, pero no se incluyen sus resultados en ScienceQA. Modelos más grandes como DeepSeekMath 7B no son comparables directamente por tamaño y dominio.

## Limitaciones y advertencias

- No aplicar plantilla de chat: el modelo fue entrenado con texto crudo; usar la plantilla de Qwen2.5-Math en inferencia reduce el pass@1 en aproximadamente 19 puntos. El código de ejemplo del autor usa `llm.generate()` con el texto sin formato.
- Dominio restringido: entrenado exclusivamente en ScienceQA, no generaliza a otros dominios de razonamiento matemático o científico sin fine-tuning adicional.
- Dependencia del formato de salida: las respuestas deben contener un `\boxed{}` o un token A-E final; de lo contrario, se puntúan como incorrectas, lo que puede penalizar respuestas válidas pero mal formateadas.
- Sesgos y alucinación: no se han evaluado sesgos específicos; como todo modelo de lenguaje, existe riesgo de alucinación en razonamiento matemático, especialmente en problemas fuera de la distribución de entrenamiento.
- Uso comercial: la licencia Apache-2.0 permite uso comercial, pero el modelo es un artefacto de investigación sin garantías de robustez en producción.
- Contexto limitado en entrenamiento: aunque el modelo base soporta 32K tokens, el entrenamiento se realizó con ventanas de 1536 tokens, por lo que el rendimiento con contextos largos no está garantizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sandeep123/math-grpo-entropy-step1100
- Variante `sqa-grpo-entropy-step1100`: https://huggingface.co/sandeep123/sqa-grpo-entropy-step1100
- Variante `sqa-grpo-cliphigh-step1100`: https://huggingface.co/sandeep123/sqa-grpo-cliphigh-step1100
- Perfil GitHub del autor: https://github.com/sandeep123-ai
- Paper de DeepSeekMath (referencia de contexto, no directamente relacionado): https://arxiv.org/abs/2402.03300
