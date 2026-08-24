# agentic-ptb/sol-max-v2.h007.pi-agent-sft-v5.step_600

## Resumen

El modelo `agentic-ptb/sol-max-v2.h007.pi-agent-sft-v5.step_600` es un checkpoint intermedio de un barrido de entrenamiento (sweep) del proyecto AgentPTB, publicado por el usuario `agentic-ptb`. Se trata de un fine-tuning de tipo SFT (supervised fine-tuning) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones). El identificador del repositorio codifica la celda del barrido (`sol-max-v2`), la hora del run (`h007`), la familia (`pi-agent-sft-v5`) y el paso de entrenamiento (`step_600`). Según la model card, este checkpoint fue escrito a las 7,75 horas de un run de 100 horas, con un driver de razonamiento de esfuerzo máximo (Codex / gpt-5.6-sol).

El modelo está orientado a tareas de agente (pi-agent), probablemente con capacidades de tool calling y razonamiento multi-paso, aunque la información pública no detalla estas capacidades de forma explícita. Al estar basado en Qwen3.5-9B-Base, hereda la arquitectura de visión de Qwen3.5 (Qwen3_5ForConditionalGeneration), pero el checkpoint se sirve como modelo de texto únicamente, y la model card advierte que vLLM debe configurarse con `--limit-mm-per-prompt '{"image": 0, "video": 0}'` para evitar fallos de carga. Es un modelo experimental, sin licencia declarada y sin datos de benchmarks publicados, por lo que su uso en producción requiere validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer con torre de visión, usada como texto) |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning SFT del checkpoint `Qwen/Qwen3.5-9B-Base`, que emplea una arquitectura transformer con atención estándar y una torre de visión integrada (aunque en este checkpoint la torre está presente en los pesos, el modelo se sirve como texto). El entrenamiento forma parte de un barrido de AgentPTB, una plataforma de entrenamiento de agentes, con un run de 100 horas y un driver de razonamiento de esfuerzo máximo. El checkpoint corresponde al paso 600 de la familia `pi-agent-sft-v5`, y fue escrito a las 7,75 horas del run. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas de RLHF o DPO. La model card indica que el `eos_token_id` es correcto (`248046`, correspondiente a `<|im_end|>`), lo que garantiza que el modelo detiene la generación al final del turno.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredadas del modelo base Qwen3.5-9B-Base.
- Orientado a tareas de agente (pi-agent), lo que sugiere soporte de tool calling y ejecución de acciones, aunque no está documentado explícitamente.
- Capacidad de procesar imágenes y video en el modelo base, pero en este checkpoint la torre de visión no se exporta con su configuración de preprocesado, por lo que en la práctica se usa como modelo de texto.
- Soporte de chat con plantilla Qwen3.5 (token `<|im_end|>`).
- No se dispone de información sobre capacidades multilingües específicas ni sobre modos de razonamiento especiales (thinking mode).

## Casos de uso

- Desarrollo de agentes autónomos: el modelo puede integrarse en pipelines de agentes que requieran razonamiento multi-paso y toma de decisiones, aprovechando su entrenamiento específico para tareas de agente.
- Automatización de tareas con tool calling: aunque no está confirmado, su familia `pi-agent-sft` sugiere que puede invocar herramientas externas (APIs, funciones) en flujos de trabajo automatizados.
- Investigación en fine-tuning de agentes: como checkpoint de un sweep, es útil para estudiar la evolución del rendimiento a lo largo del entrenamiento y comparar con otros checkpoints de la misma celda.
- Prototipado rápido de asistentes conversacionales: al estar basado en Qwen3.5-9B, puede servir como base para chatbots con contexto moderado, siempre que se valide su comportamiento.
- Evaluación de técnicas de SFT para razonamiento: investigadores pueden analizar cómo el entrenamiento con esfuerzo máximo afecta a la calidad de las respuestas en tareas de agente.
- Despliegue en entornos con GPU de gama media: con 9,4 B de parámetros, es viable en GPUs con 16-24 GB de VRAM usando cuantización, aunque no hay datos oficiales de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otros estándares, y los resultados de búsqueda web no aportan datos adicionales. Se recomienda evaluar el modelo de forma independiente antes de cualquier uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, el modelo ocupa aproximadamente 18,8 GB de pesos, por lo que se necesitan al menos 20-24 GB de VRAM para cargarlo sin cuantización. Con cuantización de 8 bits, se reduce a unos 10-12 GB; con 4 bits, a unos 5-6 GB.
- GPU recomendadas: para FP16, una A100 40GB, RTX 4090 24GB o similar. Para cuantización 4-bit, una RTX 3090 24GB o RTX 4080 16GB pueden ser suficientes.
- En consumer GPU: sí, es viable en GPUs de 16-24 GB con cuantización, aunque la latencia dependerá del hardware y del backend.
- Opciones de despliegue: vLLM (con la advertencia de `--limit-mm-per-prompt`), llama.cpp, Ollama (si se convierte a GGUF), TGI. No se han publicado configuraciones oficiales.
- Latencia y throughput: no disponibles. Dependerán del backend, la cuantización y el hardware.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. El modelo base `Qwen/Qwen3.5-9B-Base` es el punto de referencia natural, pero no hay métricas públicas de este checkpoint frente a otros modelos de 9B como Llama 3.1 8B o Mistral 7B. La comparativa no está disponible.

## Limitaciones y advertencias

- Es un checkpoint experimental de un sweep, no un modelo final pulido; puede presentar comportamientos inconsistentes o inesperados.
- No se ha declarado licencia, lo que impide su uso comercial sin consultar al autor.
- La torre de visión está presente en los pesos pero no se exporta su configuración de preprocesado; si se intenta cargar con vLLM sin la opción `--limit-mm-per-prompt`, fallará.
- No hay datos de sesgos, alucinación ni rendimiento en tareas específicas; se heredan los riesgos del modelo base Qwen3.5-9B.
- El contexto máximo no está documentado; se recomienda no asumir una ventana larga sin verificación.
- Al ser un checkpoint a las 7,75 horas de un run de 100 horas, es probable que su rendimiento sea inferior al de checkpoints posteriores del mismo sweep.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-max-v2.h007.pi-agent-sft-v5.step_600
- Colección de modelos de agentic-ptb en HuggingFace: https://huggingface.co/models?other=agentic-ptb
- Documentación de Pi (plataforma relacionada): https://pi.dev/docs/latest/models
