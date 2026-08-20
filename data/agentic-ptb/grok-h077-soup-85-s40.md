# agentic-ptb/grok.h077.soup-85-s40

## Resumen

El repositorio `agentic-ptb/grok.h077.soup-85-s40` contiene un checkpoint intermedio de un barrido (sweep) de entrenamiento denominado AgentPTB, asociado a la celda `grok` y al driver `pi / grok-4.6` con un esfuerzo de razonamiento `xhigh`. Según la model card, se trata de un checkpoint de la hora 64.98 de un run de 100 horas, aunque el ID del repositorio indica `h077` (hora 77), lo que sugiere una discrepancia entre el nombre del archivo y el contenido de la documentación. El modelo base es `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros y un tamaño de 18.8 GB en 4 shards.

Este checkpoint no es un modelo final listo para producción, sino un punto intermedio de un proceso de entrenamiento experimental. La model card advierte de un defecto de empaquetado: falta el token `eos_token_id` 248046 (`<|im_end|>`), lo que provoca que el modelo no detenga correctamente las respuestas y pueda sobrepasar la ventana de contexto. Por tanto, cualquier métrica de evaluación obtenida con este checkpoint debe considerarse un límite inferior, no una medida fiable. La relevancia de este repositorio es principalmente metodológica: sirve para estudiar la evolución del rendimiento a lo largo del tiempo de entrenamiento dentro del barrido AgentPTB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible (heredada del base, pero no confirmada) |
| Tipos de cuantizacion | no disponible (solo se mencionan pesos safetensors) |
| Idiomas soportados | no disponible (depende del base, no se especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18.8 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `Qwen/Qwen3.5-9B-Base`, un transformer denso de 9.4B parámetros. El checkpoint es el resultado de un fine-tuning o entrenamiento continuado dentro del barrido AgentPTB, pero no se proporcionan detalles sobre el dataset, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. La model card menciona un "driver" `pi / grok-4.6` y un esfuerzo de razonamiento `xhigh`, lo que sugiere que el entrenamiento está orientado a mejorar capacidades de razonamiento, pero no hay información concreta sobre la metodología. El defecto de empaquetado del token EOS indica que el proceso de entrenamiento no está completamente pulido, y que este checkpoint no debe usarse como modelo final sin re-empaquetar.

## Capacidades

No se dispone de información específica sobre las capacidades de este checkpoint. Al estar basado en Qwen3.5-9B-Base, podría heredar capacidades generales de generación de texto, razonamiento y código, pero no hay datos que lo confirmen. La model card no lista ninguna capacidad concreta. Además, el defecto del token EOS impide un uso normal en conversaciones multi-turno, ya que el modelo no detiene la generación al final de cada turno. Por tanto, las capacidades prácticas son limitadas y no recomendadas para tareas reales.

## Casos de uso

- Investigación experimental: este checkpoint es útil para estudiar la dinámica del entrenamiento dentro del barrido AgentPTB, comparando su rendimiento con otros checkpoints de la misma celda a diferentes horas.
- Análisis de curvas de aprendizaje: al ser un punto intermedio, permite trazar la evolución de métricas a lo largo del tiempo de entrenamiento, siempre que se re-empaquete el token EOS antes de evaluar.
- Desarrollo de técnicas de re-empaquetado: el defecto de EOS ofrece un caso de estudio para corregir checkpoints intermedios antes de su uso.
- No es adecuado para aplicaciones de producción, atención al cliente, generación de código en entornos reales, ni ningún uso que requiera respuestas fiables y detención correcta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente de que las métricas de evaluación de este checkpoint son un "floor" debido al defecto del token EOS, y que solo deben compararse con otros checkpoints que tengan el mismo estado de EOS. No se proporcionan números concretos.

## Requisitos de hardware

- VRAM estimada: para un modelo de 9.4B parámetros en FP16, se necesitan aproximadamente 19-20 GB de VRAM solo para los pesos. Con overhead de inferencia, se recomienda al menos 24 GB.
- GPU recomendadas: una GPU con 24 GB o más, como RTX 3090, RTX 4090, A10G, A100 (40 GB) o H100. En cuantización de 8 bits podría caber en GPUs de 16 GB, pero no se dispone de cuantizaciones oficiales.
- No se recomienda su uso en consumer GPU de gama baja (8-12 GB) sin cuantización adicional.
- Opciones de despliegue: al ser un checkpoint intermedio con defecto de EOS, no se recomienda desplegarlo con vLLM, llama.cpp u Ollama sin antes corregir el token EOS. No se proporcionan instrucciones de despliegue.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo base `Qwen/Qwen3.5-9B-Base` es el punto de referencia natural, pero no se han publicado métricas comparativas de este checkpoint frente a él. Otros modelos de 9B como Llama 3.1 8B o Mistral 7B podrían ser comparables en tamaño, pero no hay datos de rendimiento de este checkpoint. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Defecto crítico de token EOS: falta el token `248046` (`<|im_end|>`), lo que impide que el modelo detenga la generación al final de cada turno. Esto provoca que las respuestas se extiendan hasta agotar la ventana de contexto, degradando gravemente la calidad y haciendo inutilizable el modelo en conversaciones normales.
- Checkpoint intermedio: no es un modelo final; su rendimiento no es representativo de un modelo entrenado completamente.
- Sin información sobre sesgos, alucinaciones o limitaciones idiomáticas: no se ha documentado nada al respecto.
- Licencia no especificada: no se puede determinar si el uso comercial está permitido.
- Riesgo de sobreajuste o subentrenamiento: al ser un punto intermedio, puede presentar comportamientos erráticos o incompletos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/grok.h077.soup-85-s40
- Documentación de modelos de SpaceXAI (contexto del ecosistema Grok, no específico de este checkpoint): https://docs.x.ai/developers/models
- Anuncio de Grok 4 (contexto general): https://x.ai/news/grok-4
- Sitio web de Grok: https://grok.com/
