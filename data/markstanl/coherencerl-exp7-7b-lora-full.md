# markstanl/coherencerl-exp7-7b-lora-full

## Resumen

`coherencerl-exp7-7b-lora-full` es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B desarrollado por el usuario markstanl. Se trata de un experimento de investigación que aplica GRPO (Group Relative Policy Optimization), la técnica de aprendizaje por refuerzo introducida en el artículo DeepSeekMath, sobre el modelo base de Alibaba. El repositorio contiene únicamente los pesos resultantes del entrenamiento (0,1 GB), lo que sugiere que se trata de un adaptador LoRA o de un conjunto de pesos parcial, y no de un modelo completo de 7B parámetros.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B, con aproximadamente 7.600 millones de parámetros y una ventana de contexto nativa de 32.768 tokens (extensible hasta 131.072 en la familia Qwen2.5). El entrenamiento se realizó con TRL 1.10.0, Transformers 5.15.0 y PyTorch 2.11.0, según la model card.

La relevancia de esta ficha es limitada: se trata de un checkpoint experimental sin métricas publicadas, sin licencia declarada y sin documentación sobre el dataset de entrenamiento. Es útil como referencia para quienes investigan la aplicación de GRPO sobre modelos de 7B, pero no constituye un artefacto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B) |
| Parametros totales | ~7.600 millones (modelo base); el repo contiene ~0,1 GB de pesos (probablemente adaptador LoRA o pesos parciales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos en Qwen2.5-7B (extensible a 131.072); no confirmado para este fine-tuning |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (heredados presumiblemente de Qwen2.5-7B: ingles y chino principalmente, con soporte parcial de otros idiomas) |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B, un transformer decoder-only con atención de múltiples cabezas con RoPE, normalización RMSNorm y activación SwiGLU. Qwen2.5-7B emplea 28 capas, 28 cabezas de atención y una dimensión oculta de 3.584. Sobre esta base, el autor aplicó un ajuste fino con GRPO, un algoritmo de optimización de política que estima la ventaja relativa de las respuestas dentro de un grupo de muestras generadas para la misma consulta, evitando la necesidad de un modelo crítico separado (a diferencia de PPO).

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO previo ni hiperparámetros del proceso GRPO (tamaño del grupo, tasa de aprendizaje, número de pasos). El run de Weights & Biases enlazado en la model card (`wandb.ai/markgstanley1-nostomania-/RLCR/runs/8o6mt9pd`) es la única fuente potencial de detalle, pero no se ha podido verificar su contenido. El nombre del experimento ("exp7") sugiere que forma parte de una serie de pruebas.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen2.5-7B.
- Razonamiento y matemáticas: el uso de GRPO está asociado en la literatura a mejoras en tareas de razonamiento matemático, aunque no se publican métricas que lo confirmen en este checkpoint.
- Generación de código: capacidad presumible del modelo base, no verificada tras el fine-tuning.
- Soporte de tool calling / function calling: presumiblemente heredado de Qwen2.5-7B, no confirmado en la model card.
- Capacidades multilingües: presumiblemente heredadas, sin documentación específica.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Investigación en aprendizaje por refuerzo: el checkpoint sirve como punto de partida para reproducir o comparar experimentos con GRPO sobre Qwen2.5-7B, especialmente en tareas de razonamiento.
- Evaluación de técnicas de alineación: útil para estudiar cómo GRPO modifica el comportamiento del modelo base en cuanto a coherencia y formato de respuesta.
- Generación de texto conversacional en entornos de prueba: puede desplegarse con `transformers` para validar la calidad de las respuestas en diálogos simples, siempre que se combine con los pesos del modelo base.
- Fine-tuning posterior: al ser un adaptador o checkpoint parcial, puede servir como inicialización para nuevos experimentos de RL sobre la misma base.
- Docencia y formación: ejemplo práctico de pipeline TRL + GRPO para cursos sobre ajuste fino de LLM.
- Benchmarking interno: comparación cualitativa frente a Qwen2.5-7B sin ajustar para medir el efecto del entrenamiento GRPO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio contiene solo ~0,1 GB de pesos, por lo que para inferencia es necesario cargar el modelo base Qwen2.5-7B completo y aplicar el adaptador (o los pesos parciales) según corresponda.
- VRAM estimada para el modelo base en fp16: ~15-16 GB; en 8 bits: ~8 GB; en 4 bits: ~4-5 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S para fp16 con contexto largo; RTX 4090 (24 GB) suficiente para fp16 con contexto moderado; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU de consumo: sí, con cuantización 4 bits en GPUs de 8 GB o más; en fp16 requiere al menos 16 GB.
- Opciones de despliegue: `transformers` (pipeline), vLLM, TGI y llama.cpp (este último solo si se generan pesos GGUF, no incluidos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| coherencerl-exp7-7b-lora-full | ~7,6B (base) | 32.768 (heredado) | no disponible | Hugging Face, experimental |
| Qwen2.5-7B | 7,6B | 32.768 (ext. 131.072) | Apache 2.0 | Hugging Face, ampliamente usado |
| DeepSeekMath-7B | 7B | 4.096 | MIT (según modelo base) | Hugging Face |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32.768 | Apache 2.0 | Hugging Face |

La comparación directa es difícil porque el checkpoint no publica métricas ni licencia. Frente a Qwen2.5-7B, la diferencia principal es el ajuste con GRPO, cuyo efecto no está cuantificado. Frente a DeepSeekMath-7B, que también aplica GRPO pero sobre DeepSeekMath-Base, no hay datos comparables.

## Limitaciones y advertencias

- No se declara licencia, lo que impide determinar si el uso comercial está permitido.
- El repositorio contiene solo ~0,1 GB de pesos, insuficiente para un modelo de 7B completo; es necesario el modelo base y posiblemente pasos adicionales de carga del adaptador.
- No se documenta el dataset de entrenamiento ni los hiperparámetros de GRPO, lo que dificulta la reproducibilidad.
- Riesgo de alucinación y sesgos heredados de Qwen2.5-7B, sin evaluación específica tras el fine-tuning.
- Sin benchmarks publicados: no hay evidencia de mejora sobre el modelo base.
- El nombre del experimento ("exp7") y la ausencia de descargas sugieren un artefacto de investigación no validado.
- No se garantiza compatibilidad con pipelines de producción ni con tool calling, pese a la etiqueta `endpoints_compatible`.
- Idiomas soportados no documentados; el rendimiento en castellano no está verificado.

## Enlaces

- Hugging Face: https://huggingface.co/markstanl/coherencerl-exp7-7b-lora-full
- Modelo base Qwen2.5-7B: https://huggingface.co/Qwen/Qwen2.5-7B
- Paper GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Repositorio TRL: https://github.com/huggingface/trl
- Run de Weights & Biases: https://wandb.ai/markgstanley1-nostomania-/RLCR/runs/8o6mt9pd
