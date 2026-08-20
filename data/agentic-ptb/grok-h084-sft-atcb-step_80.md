# agentic-ptb/grok.h084.sft-atcb.step_80

## Resumen

Este repositorio contiene un checkpoint intermedio del experimento de entrenamiento AgentPTB, desarrollado por el usuario agentic-ptb. Se trata de un fine-tune del modelo base Qwen/Qwen3.5-9B-Base, con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones). El nombre del repositorio sigue el patrón `{cell}.h{HHH}.{family}.{step}`, donde `h084` indica la hora de la ejecución de 100 horas en la que se escribió el checkpoint (concretamente a las 62,11 horas, redondeado a 84 por razones de ordenación, aunque la model card indica que el valor exacto está en `agentic-ptb/INDEX`).

El checkpoint está etiquetado como "intermediate" dentro del sweep, lo que significa que no es un modelo final sino una instantánea del proceso de entrenamiento. La model card advierte de un defecto de empaquetado del token de fin de secuencia (eos): falta el token `248046` (`<|im_end|>`), lo que provoca que el modelo no detenga correctamente las respuestas y pueda sobrepasar la ventana de contexto. Esto invalida las evaluaciones directas y obliga a re-empaquetar el modelo antes de cualquier uso serio. Su relevancia actual es principalmente metodológica: sirve para estudiar la dinámica de entrenamiento a lo largo del tiempo, no para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Qwen/Qwen3.5-9B-Base, presumiblemente transformer, sin confirmar) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18.8 GB) |

## Arquitectura y entrenamiento

No se proporcionan detalles sobre la arquitectura interna del modelo más allá de que es un fine-tune de Qwen/Qwen3.5-9B-Base. La model card menciona un "driver" denominado `pi / grok-4.6` y un "reasoning effort" de `xhigh`, pero no se explica qué significan estos términos ni qué metodología de entrenamiento se empleó (datos, número de tokens, técnicas como RLHF o DPO). El checkpoint proviene de un sweep llamado AgentPTB, que parece ser un experimento de entrenamiento a gran escala con una duración total de 100 horas. No hay información sobre innovaciones técnicas específicas en este checkpoint concreto.

## Capacidades

No se han documentado capacidades específicas para este checkpoint. Al ser un fine-tune de Qwen3.5-9B-Base, podría heredar las capacidades generales de ese modelo base (generación de texto, razonamiento, código, etc.), pero no se proporciona ninguna verificación ni detalle. La model card solo advierte del defecto de eos, que impide un uso fiable incluso para tareas básicas de generación.

## Casos de uso

- Investigacion de dinamicas de entrenamiento: este checkpoint permite analizar cómo evoluciona el rendimiento del modelo a lo largo de las horas de entrenamiento, comparándolo con otros checkpoints del mismo sweep que compartan el mismo estado de eos.
- Estudio de defectos de empaquetado: el problema del token eos ausente es un caso de estudio útil para desarrolladores que trabajan con pipelines de fine-tuning y necesitan validar la correcta finalización de secuencias.
- Reproduccion de experimentos: puede servir como punto de partida para re-empaquetar el modelo (añadiendo el token `248046`) y evaluarlo correctamente, aunque no se recomienda para uso directo.
- No es adecuado para aplicaciones de produccion, atencion al cliente, generacion de codigo, agentes o cualquier tarea que requiera respuestas fiables y completas, debido al defecto de eos y a su naturaleza de checkpoint intermedio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente de que los números de evaluación de este checkpoint son un "suelo, no una medición" debido al defecto de eos, por lo que cualquier cifra existente no sería fiable sin re-empaquetar previamente.

## Requisitos de hardware

- El tamaño del repositorio es de 18.8 GB, lo que sugiere pesos en precisión FP16 o BF16 (4 shards de safetensors).
- Para inferencia en FP16 se necesitaría al menos 18.8 GB de VRAM, más overhead de ejecución (típicamente 20-24 GB), lo que requiere GPUs como A100 (40 GB), RTX 4090 (24 GB) o similares.
- En cuantización de 8 bits se podría reducir a unos 9.4 GB de VRAM, y en 4 bits a unos 4.7 GB, pero no se han publicado versiones cuantizadas de este checkpoint.
- No se dispone de datos de latencia o throughput.
- Opciones de despliegue: no se especifican, pero al ser safetensors podría usarse con vLLM, llama.cpp u Ollama si se convierte a GGUF, aunque el defecto de eos lo hace poco práctico.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos. Al ser un checkpoint intermedio de un experimento, no tiene una categoría clara de comparación. Se podría comparar con Qwen3.5-9B-Base, su modelo base, pero no se proporcionan datos de rendimiento de ninguno de los dos.

## Limitaciones y advertencias

- Defecto de empaquetado de eos: falta el token `248046` (`<|im_end|>`), por lo que el modelo no termina las respuestas correctamente y puede sobrepasar la ventana de contexto, generando texto sin fin.
- Es un checkpoint intermedio, no un modelo final: su rendimiento no es representativo del mejor resultado del sweep.
- Licencia no disponible: se desconoce si permite uso comercial o tiene restricciones.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas.
- No es apto para producción sin un re-empaquetado previo y una evaluación completa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/grok.h084.sft-atcb.step_80
- No se han encontrado otros enlaces relevantes en la informacion proporcionada.
