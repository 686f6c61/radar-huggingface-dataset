# agentic-ptb/grok.h067.soup-85-s2

## Resumen

El modelo `agentic-ptb/grok.h067.soup-85-s2` es un checkpoint intermedio de un experimento de post-entrenamiento agéntico denominado AgentPTB, desarrollado por el equipo de agentic-ptb. Se trata de un ajuste fino sobre el modelo base Qwen/Qwen3.5-9B-Base, con un total de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones). El checkpoint fue generado a las 16,05 horas de una ejecución de 100 horas, dentro de una celda de experimentación llamada `sol-max`, que utiliza un driver basado en Codex / gpt-5.6-sol con un esfuerzo de razonamiento máximo.

Este modelo no es un producto final, sino un artefacto de investigación para estudiar el comportamiento de los modelos durante el entrenamiento agéntico. Su relevancia radica en que permite analizar la evolución de las capacidades a lo largo del tiempo, aunque la propia model card indica que la celda "murió" alrededor de la hora 16 y que los paneles de evaluación eran demasiado pequeños para clasificar correctamente. Por tanto, debe tratarse como un checkpoint experimental, no como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Qwen3.5-9B-Base, presumiblemente transformer denso) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (shards: 4, tamaño total 18,8 GB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Al estar basado en Qwen/Qwen3.5-9B-Base, se puede inferir que sigue la arquitectura de los modelos Qwen3.5, probablemente un transformer denso con atención estándar, pero no se confirma. El entrenamiento corresponde a un "sweep" de AgentPTB, un proceso de post-entrenamiento orientado a capacidades agénticas, utilizando un driver de razonamiento (Codex / gpt-5.6-sol) con esfuerzo máximo. No se especifican los datos de entrenamiento, el número de tokens ni si se emplearon técnicas como RLHF o DPO. La model card menciona que el checkpoint tiene un `eos_token_id` correcto (`[248044, 248046]`), lo que garantiza que el modelo detiene la generación al final de cada turno, evitando el desbordamiento del contexto.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje basado en Qwen3.5, es capaz de producir texto coherente, aunque no se han evaluado formalmente sus capacidades.
- Razonamiento: el entrenamiento con esfuerzo máximo sugiere que se buscó mejorar el razonamiento multi-paso, pero no hay datos que lo confirmen.
- Capacidades agénticas: el contexto de AgentPTB indica que el modelo fue entrenado para tareas de agente, pero no se especifican detalles.
- Multilingüismo: no disponible.
- Tool calling / function calling: no disponible.
- Otras capacidades (visión, audio, etc.): no disponible.

## Casos de uso

Dado que se trata de un checkpoint experimental sin evaluación pública, los casos de uso son hipotéticos y deben tomarse con cautela:

- Investigación en post-entrenamiento agéntico: el modelo puede utilizarse para estudiar cómo evolucionan las capacidades de razonamiento y agencia durante el entrenamiento, comparando checkpoints de diferentes horas.
- Análisis de comportamiento de modelos intermedios: permite observar fenómenos como la aparición de habilidades emergentes o la degradación de capacidades en fases tempranas del entrenamiento.
- Pruebas de alineación y seguridad: al ser un checkpoint de un experimento, puede servir para evaluar riesgos de sesgos o comportamientos no deseados en modelos en desarrollo.
- Desarrollo de pipelines de evaluación: su estructura de checkpoint (con eos correcto) lo hace útil para probar herramientas de evaluación de modelos de lenguaje.
- Fine-tuning adicional: podría servir como punto de partida para ajustes posteriores, aunque su calidad no está garantizada.
- Benchmarking de infraestructura: su tamaño (9,4B parámetros) permite probar sistemas de inferencia distribuida o cuantización en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la celda "murió" a las 16 horas y que los paneles de evaluación eran demasiado pequeños para clasificar, lo que sugiere que no hay métricas fiables.

## Requisitos de hardware

- VRAM estimada: para un modelo de 9,4B parámetros en FP16 se necesitan aproximadamente 18,8 GB de VRAM (el tamaño del repo). Con cuantización a 4 bits, podría reducirse a unos 5-6 GB, pero no se dispone de cuantizaciones oficiales.
- GPU recomendadas: una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G) para inferencia en FP16. Para cuantización, una GPU de 8-12 GB podría ser suficiente, pero no hay garantías.
- Compatibilidad con consumer GPU: sí, en cuantización de baja precisión podría ejecutarse en GPUs de gama media, pero sin soporte oficial.
- Opciones de despliegue: al ser un modelo en formato safetensors, puede cargarse con frameworks como Transformers, vLLM o llama.cpp (si se convierte a GGUF). No hay integraciones específicas documentadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. Al ser un checkpoint experimental basado en Qwen3.5-9B-Base, podría compararse con el propio Qwen3.5-9B-Base, pero no hay datos de rendimiento de ninguno de los dos. Tampoco se conocen otros checkpoints de AgentPTB con los que contrastarlo.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; el entrenamiento se detuvo prematuramente (la celda "murió" a la hora 16), por lo que su calidad y coherencia pueden ser limitadas.
- Sin evaluación pública: no hay benchmarks ni pruebas independientes que validen sus capacidades.
- Sesgos y alucinaciones: al ser un modelo de lenguaje, puede presentar sesgos derivados de los datos de entrenamiento del modelo base, aunque no se han documentado.
- Riesgo de sobreajuste: al ser un checkpoint de un experimento con un driver específico, podría estar sobreajustado a las tareas del sweep, con poca generalización.
- Licencia y uso comercial: no se especifica la licencia; se recomienda contactar con los autores antes de cualquier uso comercial.
- Contexto y eos: aunque el eos es correcto, no se conoce la longitud de contexto real; podría ser la misma que la de Qwen3.5-9B-Base, pero no se confirma.

## Enlaces

- HuggingFace: https://huggingface.co/agentic-ptb/grok.h067.soup-85-s2
- Índice del proyecto (mencionado en la model card): `agentic-ptb/INDEX` (no se proporciona URL directa)
