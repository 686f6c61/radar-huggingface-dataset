# samadpls/torchlight-qwen3-8b

## Resumen

torchlight-qwen3-8b es un ajuste fino (fine-tuning) del modelo Qwen3-8B de Alibaba, especializado en responder preguntas sobre PyTorch y depuración de código. Lo desarrolla Abdul Samad (samadpls) y se entrena sobre 6.902 conversaciones extraídas del foro oficial de PyTorch (discuss.pytorch.org), la mayoría de ellas cerradas con la respuesta que resolvió el hilo. El objetivo declarado es reducir las respuestas incorrectas y fomentar que el modelo pida detalles (código mínimo reproducible o traza de error completa) cuando la pregunta no contiene información suficiente, en lugar de inventar una solución.

El modelo conserva la arquitectura transformer densa de Qwen3-8B, con 8.190.735.360 parámetros totales, y se distribuye con el fine-tuning ya fusionado en los pesos (16 bits). El entrenamiento se realizó con LoRA (43,6 millones de parámetros entrenados) mediante Unsloth sobre una única GPU Tesla T4 en Kaggle, con un coste aproximado de 4,1 horas. La licencia es Apache-2.0 y el único idioma declarado es el inglés.

Su relevancia es acotada pero concreta: es un modelo de nicho para asistentes de soporte técnico de PyTorch, no un modelo de propósito general. Frente a su modelo base, el autor reporta una reducción de respuestas incorrectas del 31 % al 15 % en una evaluación con 163 preguntas del foro posteriores a la fecha de corte de entrenamiento de Qwen3-8B, aunque la calificación media apenas sube de 2,17 a 2,25 sobre 5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B), fine-tuning con LoRA fusionado |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-8B) |
| Tipos de cuantizacion | 16 bits en este repo; GGUF Q4_K_M y Q8_0 en el repo `torchlight-qwen3-8b-GGUF`; LoRA en FP16/BF16 segun PEFT |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repo separado; adaptador LoRA en repo separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer denso de 8,2 mil millones de parámetros, y aplica un ajuste fino supervisado con LoRA sobre 6.902 hilos del foro de PyTorch recopilados en el dataset `samadpls/torchlight-threads`. Cada ejemplo de entrenamiento empareja la pregunta del usuario con la publicación que resolvió el hilo; una parte de los ejemplos enseña explícitamente al modelo a solicitar información faltante cuando la consulta es incompleta. El entrenamiento se ejecutó con Unsloth en una Tesla T4 de Kaggle durante 4,1 horas, entrenando 43,6 millones de parámetros. No se reporta uso de RLHF ni DPO, ni el número de tokens de entrenamiento.

El modelo se entrenó con el modo "thinking" desactivado (`enable_thinking=False`), por lo que la plantilla de chat debe invocarse con ese parámetro para reproducir el comportamiento esperado. El autor recomienda usar un system prompt fijo que define al modelo como asistente cuidadoso de PyTorch. No se documentan innovaciones arquitectónicas propias: las capacidades de atención, contexto y tokenización son las del modelo base.

## Capacidades

- Generación de texto técnico en inglés sobre PyTorch: diagnóstico de errores, explicación de APIs y sugerencias de corrección con código.
- Depuración de código: identifica causas probables de excepciones y propone fragmentos ejecutables.
- Comportamiento de clarificación: pide código mínimo reproducible o traza de error completa cuando la consulta carece de detalles.
- Conversación multi-turno mediante plantilla de chat de Qwen3.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso extendido; el modo thinking está desactivado por diseño.
- Capacidades multilingües limitadas al inglés según la model card.
- No dispone de visión ni audio.

## Casos de uso

- Asistente de soporte en foros y comunidades de PyTorch: el modelo puede responder hilos técnicos con contexto conversacional y, cuando la consulta es vaga, solicitar el código o el error completo en lugar de especular, lo que encaja con el flujo habitual de un foro.
- Bot de triaje en repositorios y canales de soporte: clasifica y responde consultas recurrentes sobre tensores, dispositivos, autograd o DataLoader, derivando a un humano cuando falta información.
- Autocompletado de documentación interna: genera explicaciones y ejemplos de uso de APIs de PyTorch a partir de preguntas del equipo, con la ventaja de que el modelo tiende a pedir aclaraciones antes de inventar firmas de funciones.
- Formación y onboarding de nuevos ingenieros: responde dudas básicas de PyTorch en inglés con explicaciones paso a paso y código de ejemplo.
- Pre-revisión de preguntas en canales de ayuda: detecta consultas incompletas y genera la petición automática de detalles antes de que intervenga un maintainer.
- Despliegue local en estaciones de trabajo: al existir versiones GGUF Q4_K_M y Q8_0, puede ejecutarse con llama.cpp, Ollama o LM Studio en equipos sin GPU de datacenter para asistencia offline.
- Integración en IDE o plugin de editor: como asistente de depuración específico de PyTorch, con latencia baja en GPUs de consumo si se usa la cuantización Q4_K_M.

## Benchmarks y rendimiento

Evaluación del autor sobre 163 preguntas del foro publicadas entre 2025-04-01 y 2026-10-08, posteriores a la fecha de corte de Qwen3-8B (marzo de 2025). Claude Opus 5.5 actúa como juez y puntúa de 1 a 5 comparando con la respuesta que resolvió el hilo.

| Modelo | Nota media (sobre 5) | Notas 4 o 5 | Respuestas incorrectas (nota 1) | Código solo con APIs reales de torch | Pidió detalles cuando faltaban | Pidió detalles sin necesidad |
|---|---|---|---|---|---|---|
| Phi-4-mini (base) | 1,96 | 5 % | 33 % | 108 de 109 | 0 de 4 | 1 % |
| torchlight-phi4-mini (fine-tuned) | 2,09 | 8 % | 16 % | 5 de 5 | 0 de 4 | 5 % |
| Qwen3-8B (base) | 2,17 | 17 % | 31 % | 114 de 120 | 0 de 4 | 1 % |
| torchlight-qwen3-8b (fine-tuned) | 2,25 | 9 % | 15 % | 11 de 11 | 3 de 4 | 13 % |

El autor reporta significación estadística (p < 0,001) en la reducción de respuestas incorrectas y en la mejora frente a Phi-4-mini. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en 16 bits: en torno a 16,4 GB solo para pesos, más overhead de activaciones y caché KV; requiere GPUs de 24 GB o más para inferencia cómoda (RTX 3090, RTX 4090, A10, L4, A100).
- VRAM estimada con GGUF Q8_0: aproximadamente 8,7 GB de pesos; viable en GPUs de 12-16 GB.
- VRAM estimada con GGUF Q4_K_M: aproximadamente 5 GB de pesos; cabe en GPUs de consumo de 8 GB (RTX 3060 Ti, RTX 4060) y en Apple Silicon con memoria unificada.
- GPU recomendadas: A100 40/80 GB o H100 para servicio concurrente en 16 bits; RTX 4090 o L4 para despliegue individual; RTX 3060/4060 para cuantización Q4.
- Opciones de despliegue: transformers, mlx-lm (Apple Silicon), llama.cpp, Ollama y LM Studio con los GGUF, PEFT para el adaptador LoRA, y text-generation-inference (el repo está marcado como compatible con endpoints).
- Latencia y throughput: no disponibles en la información proporcionada; el entrenamiento se completó en 4,1 horas sobre una Tesla T4, lo que da una referencia del orden de magnitud del coste de ajuste, no de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| torchlight-qwen3-8b | 8,2 B | no disponible | Asistente de PyTorch ajustado | Apache-2.0 | HuggingFace (16 bits, GGUF, LoRA) |
| Qwen3-8B | 8,2 B | no disponible | Modelo generalista | Apache-2.0 | HuggingFace |
| torchlight-phi4-mini | no disponible | no disponible | Asistente de PyTorch ajustado sobre Phi-4-mini | no disponible | HuggingFace |
| Phi-4-mini | no disponible | no disponible | Modelo generalista pequeño | no disponible | HuggingFace |

En la evaluación del autor, torchlight-qwen3-8b obtiene 2,25 de media frente a 2,17 de Qwen3-8B y 2,09 de torchlight-phi4-mini, con la menor tasa de respuestas incorrectas (15 %). La ventaja principal no es la nota media sino la reducción de errores y la capacidad de pedir aclaraciones (3 de 4 casos frente a 0 de 4 en los modelos base).

## Limitaciones y advertencias

- Dominio muy restringido: entrenado exclusivamente con hilos del foro de PyTorch; su rendimiento fuera de ese ámbito no está evaluado y probablemente degrade hacia el comportamiento del modelo base.
- Solo inglés: no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Nota media baja en términos absolutos (2,25 sobre 5): incluso tras el ajuste, la mayoría de respuestas no alcanzan la calidad de la respuesta que resolvió el hilo original.
- Riesgo de alucinación persistente: aunque baja la tasa de respuestas incorrectas del 31 % al 15 %, sigue habiendo un 15 % de respuestas calificadas como erróneas.
- Sesgo de fuente: la mayoría de respuestas de entrenamiento provienen de un único contribuyente del foro (ptrblck), lo que puede sesgar estilo, prioridades y soluciones hacia sus preferencias.
- Modo thinking desactivado: debe invocarse la plantilla de chat con `enable_thinking=False`; usarlo con thinking activado se sale de la distribución de entrenamiento.
- Dependencia del system prompt: el autor indica que el modelo fue entrenado con un system prompt concreto y recomienda reutilizarlo; cambiarlo puede alterar el comportamiento de clarificación.
- Sin soporte documentado de tool calling ni de agentes: no es adecuado para pipelines que requieran function calling.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base Qwen3-8B impone sus propias condiciones que conviene revisar antes de producción.
- Fecha de creación del repo (2026-11-01) y evaluación con preguntas hasta 2026-10-08: verificar la vigencia de los datos antes de confiar en las métricas reportadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/samadpls/torchlight-qwen3-8b
- Adaptador LoRA: https://huggingface.co/samadpls/torchlight-qwen3-8b-lora
- GGUF (Q4_K_M, Q8_0): https://huggingface.co/samadpls/torchlight-qwen3-8b-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/samadpls/torchlight-threads
- Repositorio de código: https://github.com/samadpls/torchlight
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Foro de PyTorch: https://discuss.pytorch.org
- Perfil del autor: https://samadpls.com
