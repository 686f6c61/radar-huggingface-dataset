# agentic-ptb/sol-max-v2.h051.pi-agent-r2e-opsd-v1.step_4

## Resumen

`sol-max-v2.h051.pi-agent-r2e-opsd-v1.step_4` es un checkpoint intermedio generado por el proyecto AgentPTB, un barrido (sweep) de optimización de agentes de razonamiento. El autor, `agentic-ptb`, lo publica como parte de una ejecución de 100 horas en la que se entrena un modelo sobre la base `Qwen/Qwen3.5-9B-Base`. Este checkpoint concreto corresponde a la hora 51.98 de la ejecución, con un driver identificado como Codex / gpt-5.6-sol y un esfuerzo de razonamiento máximo (`max`). Su propósito principal es servir como punto de evaluación intermedio en la curva de rendimiento del entrenamiento, no como un modelo final listo para producción.

El modelo tiene 9.409.813.744 parámetros (9,4 mil millones) y se distribuye en formato `safetensors` con un tamaño de repositorio de 18,8 GB. La arquitectura subyacente es `Qwen3_5ForConditionalGeneration`, una arquitectura de visión y lenguaje, aunque el checkpoint se sirve como texto únicamente. La relevancia actual radica en que forma parte de un pipeline de investigación sobre entrenamiento de agentes con razonamiento extendido, y su publicación permite a otros investigadores replicar o comparar resultados dentro del mismo barrido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (vision-language, servido como texto-only) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint se basa en `Qwen/Qwen3.5-9B-Base`, un modelo de la familia Qwen3.5 con arquitectura transformer multimodal (visión y lenguaje). La model card indica que el modelo base es `Qwen3_5ForConditionalGeneration`, lo que implica que incluye un vision tower, aunque el checkpoint se sirve como texto-only en vLLM mediante la opción `--limit-mm-per-prompt '{"image": 0, "video": 0}'`.

El entrenamiento forma parte de un barrido de AgentPTB, un sistema de optimización de agentes que utiliza un driver externo (Codex / gpt-5.6-sol) con esfuerzo de razonamiento máximo. No se proporcionan detalles sobre el dataset, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El checkpoint es un punto intermedio a las 51,98 horas de una ejecución de 100 horas, y se identifica como `step_4` dentro de la ruta `checkpoints/pi-agent-r2e-opsd-v1/weights/`. La model card destaca que el `eos_token_id` es correcto (248046, correspondiente a `<|im_end|>`), lo que garantiza que el modelo detiene correctamente las respuestas, un detalle crítico para evaluaciones fiables.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3.5-9B-Base, se espera que herede capacidades de generación de lenguaje, razonamiento y comprensión, aunque no se han documentado específicamente para este checkpoint.
- Capacidades multimodales: la arquitectura incluye un vision tower, pero el checkpoint se sirve como texto-only; no se ha verificado su funcionamiento con imágenes.
- Soporte de tool calling / function calling: no documentado para este checkpoint.
- Soporte de agentes y multi-step reasoning: el checkpoint proviene de un pipeline de entrenamiento de agentes, pero no se especifican capacidades concretas de agente.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: ninguna documentada más allá de la correcta gestión del token de fin de turno.

## Casos de uso

- Evaluación de progreso de entrenamiento: investigadores pueden cargar este checkpoint y comparar su rendimiento con otros checkpoints del mismo barrido (identificados por la hora `hHHH` en el repo id) para trazar curvas de mejora a lo largo de las 100 horas de ejecución.
- Análisis de estabilidad de entrenamiento: al ser un punto intermedio, permite estudiar la evolución de métricas como pérdida o precisión en diferentes fases del entrenamiento, especialmente en la transición entre horas 0-52.
- Reempaquetado y fine-tuning adicional: el checkpoint puede servir como punto de partida para continuar el entrenamiento o para aplicar fine-tuning en tareas específicas, siempre que se respete la licencia (actualmente no disponible).
- Generación de texto en entornos controlados: aunque no es su propósito principal, puede usarse como modelo de lenguaje general de 9B en tareas de generación, con la advertencia de que es un checkpoint intermedio y no ha sido evaluado exhaustivamente.
- Investigación sobre agentes de razonamiento: dado que proviene de un pipeline de optimización de agentes, puede utilizarse para estudiar cómo el entrenamiento con drivers externos afecta las capacidades de razonamiento del modelo base.
- Comparación de arquitecturas: al estar basado en Qwen3.5-9B-Base, permite comparar el efecto del entrenamiento adicional frente al modelo base sin entrenar, en términos de rendimiento y comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16 (18,8 GB), se requieren aproximadamente 20-24 GB de VRAM considerando overhead. Con cuantización a 8 bits (~9,4 GB) cabría en GPUs de 12-16 GB; con 4 bits (~4,7 GB) en GPUs de 8 GB.
- GPU recomendadas: para FP16, una A100 40GB, RTX 4090 24GB o similar. Para cuantización, RTX 3090, RTX 4080 o GPUs de datacenter con 16 GB o más.
- ¿Cabe en consumer GPU? Sí, con cuantización (8 bits o 4 bits) en GPUs como RTX 3090/4090. En FP16, solo en GPUs de 24 GB o más.
- Opciones de despliegue: vLLM (requiere la opción `--limit-mm-per-prompt` para forzar modo texto), llama.cpp, Ollama, TGI. También se puede usar con transformers de HuggingFace.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/sol-max-v2 (este) | 9,4B | no disponible | no disponible | HuggingFace |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | HuggingFace |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 | HuggingFace |
| Mistral 7B | 7B | 32K | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento para comparar. La comparativa se limita a parámetros y disponibilidad; el contexto y la licencia del modelo base no están especificados en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; fue diseñado para evaluación dentro de un barrido, no para uso en producción.
- Licencia no disponible: no se puede determinar si es apto para uso comercial o si tiene restricciones.
- Sesgos y alucinaciones: no se han documentado; al ser un modelo de lenguaje, existe riesgo de sesgos y alucinaciones, pero no hay datos específicos.
- Limitaciones de contexto: la longitud de contexto no está especificada; se desconoce si difiere del modelo base.
- Limitaciones de idioma: no se especifican idiomas soportados.
- Requiere reempaquetado: para servir correctamente, es necesario verificar el `eos_token_id` y, en vLLM, forzar el modo texto con `--limit-mm-per-prompt`.
- Arquitectura de visión no verificada: aunque el modelo base es multimodal, este checkpoint se sirve como texto-only; no se ha confirmado su funcionamiento con imágenes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-max-v2.h051.pi-agent-r2e-opsd-v1.step_4
- Búsqueda de modelos de agentic-ptb en HuggingFace: https://huggingface.co/models?other=agentic-ptb
