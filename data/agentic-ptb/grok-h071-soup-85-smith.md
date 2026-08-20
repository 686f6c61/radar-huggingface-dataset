# agentic-ptb/grok.h071.soup-85-smith

## Resumen

El modelo `agentic-ptb/grok.h071.soup-85-smith` es un checkpoint intermedio de un barrido de entrenamiento (sweep) denominado AgentPTB, desarrollado por el grupo `agentic-ptb`. Se trata de un fine-tune del modelo base Qwen/Qwen3.5-9B-Base, con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) y un tamaño de repositorio de 18,8 GB en formato safetensors. El identificador del repositorio codifica la hora del run: `h071` indica que fue escrito a la hora 71 de un run de 100 horas, aunque la model card especifica que el checkpoint corresponde a la hora 64,98 (el redondeo a horas completas explica la discrepancia).

La relevancia de este modelo es principalmente investigadora: forma parte de un estudio sobre rendimiento a lo largo del tiempo de entrenamiento (curvas de rendimiento vs. horas de run). No es un modelo listo para producción, ya que presenta un defecto de empaquetado crítico: le falta el token de fin de secuencia `<|im_end|>` (ID 248046), lo que provoca que el modelo no detenga la generación al final de cada turno y sobrepase la ventana de contexto. Por tanto, cualquier evaluación realizada sobre este checkpoint debe interpretarse como un límite inferior, no como una medida real de capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el base Qwen3.5 soporta 128K, pero no se especifica para este checkpoint) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (hereda los del base, pero no se documenta) |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del transformer Qwen3.5-9B-Base, que emplea una arquitectura transformer estándar con atención de múltiples cabezas y mecanismos de razonamiento integrados (el base Qwen3.5 incorpora modos de pensamiento). El entrenamiento se enmarca en un barrido de 100 horas denominado AgentPTB, con un "driver" identificado como `pi / grok-4.6` y un nivel de esfuerzo de razonamiento `xhigh`. El checkpoint se escribió a la hora 64,98 del run, con 4 shards de pesos.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. La model card indica que todos los checkpoints del sweep comparten un defecto de empaquetado del token eos: falta el ID 248046 (`<|im_end|>`), que es el token que el template de chat de Qwen3.5 usa para terminar cada turno del asistente. Esto implica que el modelo no sabe cuándo detenerse y puede generar texto hasta agotar la ventana de contexto.

## Capacidades

No se dispone de información específica sobre las capacidades de este checkpoint más allá de las heredadas del modelo base Qwen3.5-9B-Base. Al ser un fine-tune intermedio, no se han documentado capacidades propias. Se puede asumir que conserva las capacidades generales del base (generación de texto, razonamiento, código, matemáticas, soporte multilingüe), pero no hay datos que lo confirmen para este checkpoint concreto.

- Generación de texto: no verificado para este checkpoint.
- Razonamiento y pensamiento: el base Qwen3.5 incluye modos de razonamiento, pero no se confirma su funcionamiento aquí.
- Tool calling / function calling: no documentado.
- Soporte de agentes: no documentado.
- Capacidades multilingües: no documentado.
- Capacidades especiales (visión, audio, etc.): no documentado.

## Casos de uso

Dado el defecto de empaquetado del token eos y su naturaleza de checkpoint intermedio, este modelo no es adecuado para aplicaciones en producción. Los casos de uso se limitan al ámbito de la investigación:

- Análisis de curvas de rendimiento durante el entrenamiento: permite estudiar cómo evoluciona la capacidad del modelo a lo largo de las horas de run, comparando checkpoints de distintas horas.
- Estudio de defectos de empaquetado: sirve para investigar el impacto de la ausencia del token eos en la generación y en las métricas de evaluación.
- Reproducción de experimentos: los investigadores pueden re-empaquetar el modelo añadiendo el token eos correcto y evaluarlo de nuevo.
- Comparación de checkpoints dentro del mismo sweep: al compartir el mismo defecto, se pueden comparar entre sí para trazar la progresión del entrenamiento.
- Fine-tuning adicional: podría servir como punto de partida para un entrenamiento continuado, aunque requeriría corregir el empaquetado antes.
- Investigación sobre alucinación y sobre-generación: el defecto de eos provoca que el modelo continúe generando más allá de lo esperado, lo que puede ser útil para estudiar estos fenómenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente que los números de evaluación de este checkpoint son un "suelo" (floor) debido al defecto de eos, y que solo deben compararse con otros checkpoints que tengan el mismo estado de eos o tras re-empaquetar el modelo.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware. A partir del tamaño de los pesos (18,8 GB en FP32 o BF16, 4 shards), se puede estimar:

- VRAM estimada para inferencia: al menos 20 GB para cargar los pesos en FP16/BF16, más overhead de activaciones y KV cache. Con cuantización a 8 bits podría reducirse a ~10 GB, y a 4 bits a ~5-6 GB, pero no hay cuantizaciones publicadas.
- GPU recomendadas: una GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A10G) sería suficiente para FP16. Para cuantización ligera, GPUs de 8-12 GB podrían bastar.
- Si cabe en consumer GPU: sí, en GPUs de gama alta (24 GB) sin cuantizar, y en GPUs de 8-12 GB con cuantización (si se generara).
- Opciones de despliegue: al ser un checkpoint de investigación con defecto de eos, no se recomienda desplegarlo con vLLM, Ollama o TGI sin antes corregir el token eos. En todo caso, sería compatible con llama.cpp si se convierte a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo base Qwen3.5-9B-Base es el punto de referencia natural, pero no se han publicado métricas comparativas de este checkpoint frente a otros. Alternativas de la misma categoría (fine-tunes de 9B) podrían incluir otros checkpoints del mismo sweep AgentPTB, pero no hay datos públicos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/grok.h071.soup-85-smith | 9,4B | no disponible | no disponible | HuggingFace |
| Qwen/Qwen3.5-9B-Base | 9,4B | 128K (base) | Apache 2.0 (base) | HuggingFace |
| Otros checkpoints AgentPTB | 9,4B | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- Defecto crítico de empaquetado: falta el token eos `<|im_end|>` (ID 248046), por lo que el modelo no detiene la generación al final de cada turno y sobrepasa la ventana de contexto. No es apto para uso en producción ni para evaluaciones fiables.
- Checkpoint intermedio: fue escrito a la hora 64,98 de un run de 100 horas; no representa el estado final del entrenamiento y puede tener capacidades incompletas.
- Sin documentación de licencia: no se especifica la licencia de uso, lo que impide determinar si es utilizable comercialmente.
- Sin datos de sesgos o alucinación: no se ha evaluado el modelo en estos aspectos.
- Sin información de idiomas: no se confirma qué idiomas soporta de forma fiable.
- Evaluaciones no comparables: los resultados de cualquier benchmark deben interpretarse como límite inferior y solo compararse con checkpoints del mismo estado de eos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/grok.h071.soup-85-smith
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Sitio de Grok (referencia del nombre, no relacionado con este modelo): https://grok.com/
- SpaceXAI (creadores de Grok, no relacionados con este modelo): https://x.ai/
