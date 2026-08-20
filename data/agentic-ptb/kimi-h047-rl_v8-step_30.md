# agentic-ptb/kimi.h047.rl_v8.step_30

## Resumen

El modelo `agentic-ptb/kimi.h047.rl_v8.step_30` es un checkpoint intermedio de un barrido de entrenamiento con *agentic reinforcement learning* (Agentic RL) sobre el modelo base `Qwen/Qwen3.5-9B-Base`. Lo desarrolla el equipo `agentic-ptb` como parte de una ejecución de 100 horas denominada `rl_v8`, utilizando el *driver* `kimi-code / kimi-k3` con un nivel de razonamiento `high`. El identificador del repositorio codifica la hora de la ejecución en la que se guardó el checkpoint: `h047` indica la hora 47 (redondeada hacia abajo), y `step_30` el paso de entrenamiento correspondiente.

Se trata de un modelo de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), con pesos en formato `safetensors` y un tamaño de repositorio de 18,8 GB. Su propósito es servir como punto de control intermedio para estudiar la evolución del rendimiento a lo largo del entrenamiento, no como un modelo final listo para producción. La model card incluida en el repositorio describe un checkpoint anterior (`h045.rl_v8.step_20`), lo que sugiere que el autor no ha actualizado la documentación para este paso concreto; aun así, los datos estructurales (base model, tamaño, shards) coinciden.

La relevancia de este modelo radica en que forma parte de una línea de investigación activa sobre *agentic RL*, un paradigma que entrena a los LLM para interactuar con entornos externos (buscadores, intérpretes de código, bases de datos) mediante bucles cerrados de acción y recompensa. El nombre `kimi` hace referencia al asistente Kimi K3 de Moonshot AI, aunque el modelo base es Qwen, no un modelo de Kimi.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible (no se indica en la informacion) |
| Tipos de cuantizacion | no disponible (solo se mencionan pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye a partir de `Qwen/Qwen3.5-9B-Base`, un transformer denso de 9,4 mil millones de parámetros. Sobre esta base, el equipo `agentic-ptb` aplica un entrenamiento de *agentic reinforcement learning* (variante `rl_v8`) en el que el modelo aprende a tomar decisiones autónomas en entornos simulados, utilizando el *driver* `kimi-code / kimi-k3` con un nivel de razonamiento `high`. El entrenamiento se ejecuta durante 100 horas, y este checkpoint corresponde a la hora 47 (según el ID) o 45,68 (según la model card, que describe un paso anterior). El rol del checkpoint es `intermediate`, es decir, no es un modelo final sino un punto de control para monitorizar la curva de aprendizaje.

Un detalle técnico relevante es la ausencia del token `eos_token_id` `248046` (correspondiente a `<|im_end|>`), que el autor advierte en la model card. Esto significa que el modelo no se detiene correctamente al final de un turno de chat y puede sobrepasar la ventana de contexto, por lo que cualquier evaluación numérica debe interpretarse como un límite inferior, no como una medición fiable. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se usaron técnicas como RLHF o DPO; la información disponible solo menciona el uso de *agentic RL*.

## Capacidades

- Al ser un checkpoint intermedio de *agentic RL*, se espera que el modelo haya desarrollado habilidades de razonamiento multi-paso, uso de herramientas y toma de decisiones en entornos interactivos, aunque no se han publicado evaluaciones específicas.
- Hereda las capacidades base de Qwen3.5-9B-Base, que incluyen generación de texto, comprensión multilingüe y generación de código, pero no se confirma en la documentación.
- No se indica soporte explícito para *tool calling*, *function calling* o *multi-step reasoning* más allá de lo que implica el entrenamiento con *agentic RL*.
- No se mencionan capacidades multimodales (visión, audio) ni un modo de pensamiento explícito.
- La ausencia del token de fin de turno (`<|im_end|>`) limita su uso en conversaciones multi-turno, ya que el modelo no sabe cuándo detenerse.

## Casos de uso

- **Investigación en dinámica de entrenamiento**: este checkpoint permite analizar cómo evoluciona el rendimiento a lo largo de las 100 horas de ejecución, comparándolo con otros checkpoints de la misma serie (`h045`, `h050`, etc.) para trazar curvas de aprendizaje.
- **Estudio de *agentic RL***: sirve como ejemplo práctico de un modelo entrenado con *agentic reinforcement learning*, útil para investigadores que quieran reproducir o entender esta técnica.
- **Análisis de artefactos de tokenización**: la falta del token `eos` `248046` ofrece un caso de estudio sobre cómo afecta la configuración de tokens especiales al comportamiento de generación.
- **Desarrollo de pipelines de evaluación**: al ser un checkpoint intermedio, puede usarse para probar metodologías de evaluación que tengan en cuenta la ausencia de `eos`, como se sugiere en la model card.
- **Comparación de *drivers* de entrenamiento**: el uso del *driver* `kimi-code / kimi-k3` permite comparar su efecto frente a otros *drivers* dentro del mismo barrido `rl_v8`.
- **Reproducción de experimentos**: dado que el repositorio incluye la ruta del checkpoint (`runs/rl_v8/weights/step_30`) y el tiempo de ejecución, es posible reproducir el entrenamiento o continuar desde este punto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente que, debido a la ausencia del token `eos` `248046`, cualquier número de evaluación debe considerarse un límite inferior y no una medición real. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 9,4 mil millones de parámetros y pesos en FP16 (tamaño de repositorio 18,8 GB), se necesitan aproximadamente 19 GB de VRAM para cargar el modelo completo. Con cuantización a 8 bits se reduciría a unos 10 GB, y a 4 bits a unos 5 GB, pero no se ofrecen versiones cuantizadas en el repositorio.
- **GPU recomendadas**: una GPU con 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A5000) sería suficiente para FP16. Para cuantización, una GPU de 12 GB (RTX 3060, RTX 4070) podría bastar, aunque no hay archivos GGUF disponibles.
- **Si cabe en consumer GPU**: sí, en GPUs de gama alta con 24 GB o más, siempre que se use FP16. Con cuantización manual, podría caber en GPUs de 12 GB.
- **Opciones de despliegue**: al ser un checkpoint intermedio y no tener formato GGUF ni documentación de despliegue, las opciones estándar serían vLLM, llama.cpp (si se convierte) u Ollama, pero no se proporcionan instrucciones. El formato safetensors es compatible con Hugging Face Transformers.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `agentic-ptb/kimi.h047.rl_v8.step_30` | 9,4B | no disponible | no disponible | Hugging Face (checkpoint intermedio) |
| `Qwen/Qwen3.5-9B-Base` | 9,4B | no disponible (probablemente 128k o 256k, no confirmado) | Apache 2.0 (habitual en Qwen) | Hugging Face |
| `Moonshot Kimi K3` | no disponible | no disponible | propietaria | API comercial |

No se dispone de datos de rendimiento para comparar. El modelo aquí descrito es un fine-tuning de Qwen3.5-9B-Base, por lo que su comportamiento base será similar, pero el entrenamiento con *agentic RL* puede modificar sus capacidades. Kimi K3 es un modelo propietario de Moonshot AI, no relacionado directamente con este checkpoint salvo por el nombre del *driver*.

## Limitaciones y advertencias

- **Token de fin de turno ausente**: el modelo no incluye el token `eos` `248046` (`<|im_end|>`), por lo que no detiene la generación al final de un turno y puede sobrepasar la ventana de contexto. Esto invalida cualquier evaluación estándar y requiere re-empaquetado antes de su uso.
- **Checkpoint intermedio**: no es un modelo final; su rendimiento puede ser inferior al de checkpoints posteriores de la misma ejecución.
- **Licencia no disponible**: no se especifica la licencia, lo que impide conocer las restricciones de uso comercial o modificación.
- **Idiomas no especificados**: aunque Qwen3.5-9B-Base es multilingüe, no se confirma qué idiomas conserva este fine-tuning.
- **Sesgos y alucinaciones**: no se han documentado sesgos específicos, pero al ser un modelo entrenado con RL, puede presentar comportamientos impredecibles en entornos no vistos.
- **Documentación desactualizada**: la model card describe un checkpoint anterior (`h045.step_20`), por lo que los detalles específicos de este paso (`h047.step_30`) no están confirmados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/agentic-ptb/kimi.h047.rl_v8.step_30
- Paper sobre *Agentic RL* (arXiv 2509.02547): https://arxiv.org/abs/2509.02547
- PDF del mismo paper: https://arxiv.org/pdf/2509.02547
- Sitio oficial de Kimi K3: https://www.kimi.com/en
- Repositorio GitHub Open-AgentRL: https://github.com/Gen-Verse/Open-AgentRL
- Blog sobre *Agentic RL*: https://syhya.github.io/posts/2025-09-30-agentic-rl/
