# agentic-ptb/sol-high.h038.maxrl-mixed-agentic.step_1

## Resumen

El modelo `agentic-ptb/sol-high.h038.maxrl-mixed-agentic.step_1` es un checkpoint intermedio de un barrido de entrenamiento (sweep) realizado por el proyecto AgentPTB. Se trata de un ajuste fino del modelo base Qwen/Qwen3.5-9B-Base, con 9.409.813.744 parámetros, y está etiquetado como "best cell in the sweep" según su model card. El nombre indica que pertenece a la celda `sol-high`, que fue generada por un driver denominado Codex / gpt-5.6-sol con un esfuerzo de razonamiento alto.

Este checkpoint se describe como de rol "intermediate", es decir, no es un modelo final listo para producción, sino un punto intermedio dentro de un proceso de entrenamiento con refuerzo mixto (maxrl-mixed-agentic). Su relevancia radica en que representa un experimento de alineación y entrenamiento agéntico sobre una base de Qwen 3.5 de 9B, y su model card advierte sobre la correcta configuración del token de fin de secuencia (eos_token_id) para que las evaluaciones sean válidas.

La información pública es muy limitada: no se especifican licencia, idiomas, ni detalles de entrenamiento más allá de lo indicado. El repositorio pesa 18,8 GB y contiene pesos en formato safetensors distribuidos en 4 shards. No se han publicado benchmarks ni comparativas con otros modelos en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3.5-9B-Base, un transformer denso de 9.000 millones de parámetros. No se dispone de información adicional sobre la arquitectura interna (número de capas, cabezas de atención, etc.) más allá de lo que se hereda del modelo base. El checkpoint se generó mediante un proceso de entrenamiento con refuerzo mixto y agéntico (maxrl-mixed-agentic), lo que sugiere el uso de técnicas de optimización por políticas (RL) combinadas con entrenamiento supervisado o agéntico, aunque no se detallan los datos de entrenamiento, el número de tokens ni si se aplicaron métodos como RLHF o DPO.

La model card indica que el token de fin de secuencia correcto es `[248044, 248046]`, donde `248046` corresponde a `<|im_end|>`, el token que la plantilla de chat de Qwen3.5 usa para terminar cada turno de asistente. Esto es una advertencia importante: si un checkpoint no incluye este token, el modelo no detiene la generación al final del turno y desborda la ventana de contexto, lo que invalida las evaluaciones. Este checkpoint sí lo incluye correctamente.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3.5-9B-Base, hereda las capacidades generales de generación de texto y razonamiento de ese modelo base, aunque no se han publicado evaluaciones específicas para este checkpoint.
- Entrenamiento agéntico: el nombre "maxrl-mixed-agentic" sugiere que el modelo fue entrenado para tareas de agente (tool use, multi-step reasoning), pero no hay documentación que confirme capacidades concretas de tool calling o agentes.
- Capacidades multilingües: no disponible; el modelo base Qwen3.5 soporta múltiples idiomas, pero no se especifica para este checkpoint.
- No se dispone de información sobre capacidades de visión, audio u otras modalidades.

## Casos de uso

Dado que es un checkpoint intermedio de un experimento de investigación, los casos de uso son principalmente de investigación y desarrollo:

- Investigación en alineación de modelos: este checkpoint puede usarse para estudiar el efecto del entrenamiento con refuerzo mixto agéntico sobre la base Qwen3.5-9B, comparando su comportamiento con el modelo base y con otros checkpoints del mismo sweep.
- Evaluación de técnicas de RL para agentes: los investigadores pueden analizar cómo el entrenamiento agéntico afecta la capacidad del modelo para seguir instrucciones multi-paso o usar herramientas, aunque no hay benchmarks publicados.
- Reproducción de experimentos: dado que se indica el "plot cell" y el driver, se puede intentar reproducir el sweep completo y comparar este checkpoint con otros puntos del entrenamiento.
- Desarrollo de pipelines de evaluación: la advertencia sobre el eos_token_id lo convierte en un caso de uso para validar metodologías de evaluación de checkpoints intermedios.
- Fine-tuning posterior: al ser un checkpoint intermedio, podría servir como punto de partida para continuar el entrenamiento con otras técnicas.
- Análisis de robustez: se puede estudiar si el entrenamiento agéntico introduce sesgos o comportamientos indeseados en comparación con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra. Además, se advierte explícitamente que las evaluaciones de checkpoints sin el eos_token_id correcto son un "floor, not a measurement", lo que indica que cualquier número publicado sin esa verificación no es fiable. Este checkpoint sí tiene el eos correcto, pero aun así no hay datos de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, pero un modelo de 9.400 millones de parámetros en precisión fp16 requiere aproximadamente 18-20 GB de VRAM solo para los pesos. Con cuantización a 8 bits se reduciría a unos 10-12 GB, y a 4 bits a unos 5-6 GB, aunque no se ofrecen cuantizaciones oficiales.
- GPU recomendadas: para inferencia en fp16 se necesitaría una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G, L4). Para entrenamiento o fine-tuning, se requerirían GPUs de mayor capacidad como A100 (40/80 GB) o H100.
- En consumer GPU: cabe en una RTX 4090 (24 GB) con fp16, o en GPUs de 16 GB con cuantización a 8 bits, pero no se proporcionan archivos GGUF ni cuantizaciones listas.
- Opciones de despliegue: al ser safetensors estándar, se puede usar con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama (si se empaqueta). No hay instrucciones específicas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este checkpoint con otros modelos. Al ser un checkpoint intermedio de un experimento de investigación, no hay datos de rendimiento ni de características comparables. Se podría comparar con el modelo base Qwen/Qwen3.5-9B-Base, pero no se conocen las diferencias específicas. No se dispone de alternativas de la misma categoría (checkpoints intermedios de sweeps agénticos) en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final: no está pensado para uso en producción sin un proceso de evaluación y posible fine-tuning adicional.
- No hay licencia especificada: el uso comercial y la redistribución son inciertos. Se debe contactar con el autor o esperar a que se publique una licencia.
- No hay información sobre sesgos o alucinaciones: al ser un modelo derivado de Qwen, puede heredar sesgos del modelo base, pero no hay estudios específicos.
- Riesgo de desbordamiento de contexto: aunque este checkpoint tiene el eos_token_id correcto, cualquier reempaquetado o modificación podría romper la detención de secuencia, como advierte la model card.
- Sin benchmarks publicados: no se puede evaluar su calidad relativa frente a otros modelos.
- Fecha de creación futura (2026-08-20): el modelo es muy reciente y puede carecer de documentación adicional o soporte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/sol-high.h038.maxrl-mixed-agentic.step_1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Repositorio Agentic Library (referencia del proyecto, no específica del modelo): https://github.com/Sol-HQ/agentic-library
- Artículo de The Economist sobre IA china (contexto general, no específico): https://studylib.net/doc/28758107/the-economist-08-aug-2026
- Página de OpenAI sobre GPT-5.6 Sol (contexto del driver mencionado): https://openai.com/index/gpt-5-6/
