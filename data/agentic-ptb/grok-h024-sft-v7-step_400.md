# agentic-ptb/grok.h024.sft-v7.step_400

## Resumen

Este repositorio contiene un checkpoint intermedio del proyecto AgentPTB, un barrido (sweep) de fine-tuning sobre el modelo base Qwen/Qwen3.5-9B-Base. El identificador `grok.h024.sft-v7.step_400` indica que se trata del checkpoint escrito a la hora 24 de un run de 100 horas, dentro de la celda experimental `grok` con el driver `pi / grok-4.6` y un esfuerzo de razonamiento `xhigh`. El autor, `agentic-ptb`, publica estos checkpoints para trazar la curva de rendimiento a lo largo del entrenamiento, no como modelos finales listos para producción.

El modelo tiene 9.409.813.744 parámetros (9,4B) y un tamaño de 18,8 GB en formato safetensors. La model card advierte de un defecto de empaquetado: el token `eos` `248046` (`<|im_end|>`) no está incluido, lo que provoca que el modelo no detenga correctamente las respuestas y sobrepase la ventana de contexto. Por tanto, cualquier evaluación numérica de este checkpoint debe considerarse un límite inferior, no una medida real.

La relevancia de este repositorio es principalmente metodológica: permite estudiar la dinámica de entrenamiento de un fine-tuning sobre Qwen3.5-9B-Base con técnicas de razonamiento tipo Grok, y comparar checkpoints a lo largo del tiempo. No se dispone de información sobre licencia, idiomas soportados ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint base `Qwen/Qwen3.5-9B-Base`, que emplea una arquitectura transformer estándar con atención de múltiples cabezas. El entrenamiento forma parte de un barrido sistemático (sweep) del proyecto AgentPTB, donde se exploran diferentes configuraciones de razonamiento (en este caso, el driver `pi / grok-4.6` con esfuerzo `xhigh`). No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO.

La model card indica que el checkpoint se escribió a la hora 24 de un run de 100 horas, y que el repositorio contiene un defecto conocido: el token `eos` `248046` (`<|im_end|>`) no está presente en la lista de tokens de fin de secuencia, lo que impide que el modelo termine correctamente las respuestas. Este defecto afecta a todos los checkpoints de la celda `grok` y debe corregirse antes de cualquier evaluación o uso.

## Capacidades

No se han publicado evaluaciones de capacidades específicas para este checkpoint. Al ser un modelo intermedio de un experimento, no se puede afirmar que herede automáticamente las capacidades del base Qwen3.5-9B-Base (generación de texto, razonamiento, código, etc.) sin verificación. La model card no menciona tool calling, agentes, visión ni otras funcionalidades.

## Casos de uso

- Investigación en dinámica de entrenamiento: permite analizar cómo evoluciona el rendimiento a lo largo de las horas de entrenamiento, comparando este checkpoint (h024) con otros de la misma celda.
- Estudio de defectos de tokenización: el problema del `eos` ausente es un caso práctico para investigar cómo afecta la terminación de secuencias en modelos fine-tuned.
- Reproducción de experimentos: los checkpoints intermedios sirven para reproducir curvas de pérdida y métricas en el contexto del sweep AgentPTB.
- Desarrollo de técnicas de re-empaquetado: se puede usar como ejemplo para corregir el token `eos` y re-publicar un modelo utilizable.
- Comparación de configuraciones de razonamiento: al variar el driver y el esfuerzo, se puede estudiar el impacto de `xhigh` frente a otros niveles.
- No es adecuado para uso en producción ni para aplicaciones finales, dado su estado intermedio y el defecto de `eos`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente de que los números de evaluación de este checkpoint son un "floor" (límite inferior) debido al defecto de `eos`, y que solo deben compararse con otros checkpoints que compartan el mismo estado de `eos`.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4B parámetros en fp16 se necesitan aproximadamente 19 GB de VRAM; en int8 (~9,5 GB) o int4 (~5 GB) podría caber en GPUs de consumo como la RTX 4090 (24 GB) o la RTX 3090 (24 GB) con cuantización.
- GPU recomendadas: para fp16, una A100 (40/80 GB) o H100; para cuantización, una RTX 4090 o similar.
- Opciones de despliegue: al ser un checkpoint intermedio con defectos, no se recomienda desplegarlo; si se corrige el `eos`, podría usarse con vLLM, llama.cpp u Ollama, pero no hay configuraciones validadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. Estructuralmente, se puede comparar con su base:

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | Base oficial |
| agentic-ptb/grok.h024.sft-v7.step_400 | 9,4B | no disponible | no disponible | Checkpoint intermedio con defecto de eos |

No hay información sobre alternativas comparables en la misma categoría (fine-tunes de 9B con razonamiento tipo Grok).

## Limitaciones y advertencias

- Defecto crítico de `eos`: falta el token `248046` (`<|im_end|>`), por lo que el modelo no detiene las respuestas y puede sobrepasar la ventana de contexto. No debe usarse sin corregir este problema.
- Checkpoint intermedio: no es un modelo final; su rendimiento no refleja el estado óptimo del entrenamiento.
- Sin licencia especificada: no se puede determinar si es de uso comercial o restringido.
- Sin evaluación de sesgos ni alucinaciones: al no haber benchmarks ni análisis, se desconocen los riesgos de contenido incorrecto o sesgado.
- Sin información sobre idiomas: no se garantiza cobertura multilingüe.
- Repositorio con 0 descargas y 0 likes: no hay validación externa ni comunidad que lo respalde.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/grok.h024.sft-v7.step_400
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- No se encontraron papers, blogs ni demos adicionales en la busqueda web.
