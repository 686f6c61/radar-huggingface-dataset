# agentic-ptb/kimi.h074.rft_v1.step_96

## Resumen

El modelo `agentic-ptb/kimi.h074.rft_v1.step_96` es un checkpoint intermedio de un barrido (sweep) de entrenamiento con aprendizaje por refuerzo (RL) denominado `kimi`, desarrollado por el usuario `agentic-ptb`. Se trata de un fine-tuning sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) y un tamaño de repositorio de 18,8 GB en formato safetensors. El checkpoint corresponde a la hora 74 de un run de 100 horas, con un rol intermedio dentro del experimento.

La relevancia de este modelo radica en que forma parte de una metodología de evaluación de checkpoints a lo largo del tiempo de entrenamiento, donde cada repositorio se nombra según la hora del run (`h074`). Sin embargo, presenta una advertencia crítica: el token `eos_token_id` está incompleto (falta el token `248046`, correspondiente a `<|im_end|>`), lo que significa que el modelo no detiene correctamente las respuestas y puede sobrepasar la ventana de contexto. Esto invalida cualquier evaluación directa sin un reempaquetado previo.

Aunque el nombre "kimi" sugiere una relación con el modelo Kimi K3 de MoonshotAI (un modelo de 2,8 billones de parámetros), este checkpoint es un modelo independiente de 9B basado en Qwen, sin relación directa con aquel. No se dispone de información sobre licencia, idiomas soportados, ni datos de entrenamiento más allá de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tuning de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base, sin especificar) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del transformer `Qwen/Qwen3.5-9B-Base`, que presumiblemente mantiene la arquitectura estándar de Qwen (attention multi-cabeza, capas de transformer, etc.). El entrenamiento se realizó mediante aprendizaje por refuerzo (RL), como indica el nombre del run `rl_sharedterm`, aunque no se especifica si se usó RLHF, DPO u otra variante. El checkpoint corresponde a la hora 74 de un run de 100 horas, con un driver denominado `kimi-code / kimi-k3` y un "reasoning effort" alto. No se proporcionan detalles sobre el dataset, el número de tokens de entrenamiento ni las técnicas de optimización empleadas.

La model card advierte que el checkpoint carece del token `eos_token_id` `248046` (`<|im_end|>`), lo que impide que el modelo termine correctamente las respuestas. Esto es un artefacto del proceso de entrenamiento y no una característica intencional.

## Capacidades

- Generación de texto: al ser un fine-tuning de Qwen3.5-9B-Base, hereda las capacidades generales de generación de lenguaje del modelo base, aunque no se han verificado en este checkpoint.
- Razonamiento: el run indica un "reasoning effort" alto, lo que sugiere que el entrenamiento se enfocó en tareas de razonamiento, pero no hay evidencia concreta de rendimiento.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, etc.): no disponible.

Dado que es un checkpoint intermedio con un defecto conocido en el token de fin de secuencia, no se recomienda su uso directo en producción sin un reempaquetado que añada el token faltante.

## Casos de uso

- Investigación en RL: el modelo es útil para estudiar la evolución del rendimiento a lo largo del entrenamiento, comparando checkpoints de diferentes horas del mismo run.
- Análisis de artefactos de entrenamiento: permite investigar el efecto de la ausencia del token EOS en la generación y en las métricas de evaluación.
- Desarrollo de técnicas de reempaquetado: sirve como caso de prueba para corregir el token EOS y evaluar el impacto en la calidad de las respuestas.
- Benchmarking de checkpoints intermedios: puede usarse para trazar curvas de rendimiento temporal en tareas específicas, siempre que se compare con otros checkpoints del mismo estado de EOS.
- Fine-tuning adicional: al ser un checkpoint de RL, podría servir como punto de partida para entrenamientos posteriores, aunque su estado incompleto lo hace menos atractivo.
- Educación y demostración: útil para ilustrar problemas de tokenización y control de secuencia en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente que los números de evaluación de este checkpoint son un "suelo" (floor) y no una medición real, debido al token EOS faltante. Por tanto, no se proporcionan tablas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4 mil millones de parámetros, en precisión FP16/BF16 (tamaño del repo 18,8 GB) se necesitan aproximadamente 19 GB de VRAM. Con cuantización de 8 bits, ~9,4 GB; con 4 bits, ~4,7 GB (estimaciones estándar, no confirmadas por el autor).
- GPU recomendadas: para FP16, una GPU con 24 GB (p. ej., RTX 3090/4090, A10G) o superior. Para cuantización 4-bit, una GPU de 8 GB (p. ej., RTX 3070) podría ser suficiente.
- Compatibilidad con GPU de consumo: sí, con cuantización adecuada (4-bit u 8-bit) en GPUs de gama media-alta.
- Opciones de despliegue: al ser safetensors, puede cargarse con transformers, vLLM, llama.cpp (si se convierte a GGUF) u Ollama, aunque no se ha verificado compatibilidad.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa fiable. El modelo base `Qwen/Qwen3.5-9B-Base` es el punto de referencia natural, pero no se han publicado métricas de este checkpoint. Otros modelos de 9B como Llama 3.1 8B o Mistral 7B podrían ser comparables en tamaño, pero sin datos de rendimiento no es posible establecer una comparación objetiva. Se indica "no disponible".

## Limitaciones y advertencias

- Token EOS incompleto: el modelo no detiene las respuestas correctamente, lo que provoca sobrepaso de la ventana de contexto y hace que las evaluaciones sean inválidas sin reempaquetado.
- Checkpoint intermedio: no es un modelo final; su rendimiento puede ser inferior al de checkpoints posteriores del mismo run.
- Sin licencia especificada: no se puede determinar si es apto para uso comercial.
- Sin datos de sesgos o alucinaciones: no hay información sobre estos aspectos.
- Riesgo de confusión con Kimi K3: el nombre "kimi" puede inducir a error; este modelo no es el Kimi K3 de MoonshotAI (2,8T parámetros), sino un fine-tuning de 9B.
- No apto para producción: debido al defecto de EOS y a su naturaleza experimental.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/agentic-ptb/kimi.h074.rft_v1.step_96
- Modelo base Qwen/Qwen3.5-9B-Base: no se ha encontrado un enlace directo en la información proporcionada.
- Referencia a Kimi K3 (modelo distinto, solo como contexto): https://huggingface.co/moonshotai/Kimi-K3
- Página oficial de Kimi K3: https://www.kimi.com/en
- Documentación de Kimi K3 API: https://platform.kimi.ai/docs/guide/kimi-k3-quickstart
