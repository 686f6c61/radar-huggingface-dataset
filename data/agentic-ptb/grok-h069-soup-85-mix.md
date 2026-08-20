# agentic-ptb/grok.h069.soup-85-mix

## Resumen

El modelo `agentic-ptb/grok.h069.soup-85-mix` es un checkpoint intermedio de un barrido experimental (sweep) denominado AgentPTB, desarrollado por el autor `agentic-ptb`. Se trata de un ajuste fino o mezcla de pesos (soup) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con un total de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones). El identificador del repositorio indica que corresponde a la hora 78,65 de una ejecución de 100 horas, y su rol es intermedio dentro del proceso de entrenamiento.

La relevancia de este modelo radica en su naturaleza experimental: forma parte de un estudio sobre la evolución del rendimiento a lo largo del tiempo de entrenamiento, y su nombre hace referencia a una celda de gráfico (`grok`) y a un driver (`pi / grok-4.6`) con un esfuerzo de razonamiento `xhigh`. Sin embargo, presenta un defecto conocido de empaquetado: le falta el token `eos` `248046` (`<|im_end|>`), lo que provoca que no detenga la generación al final de cada turno y pueda sobrepasar la ventana de contexto. Por tanto, sus métricas de evaluación deben interpretarse como un límite inferior, no como una medición fiable.

No se dispone de información pública sobre licencia, idiomas soportados, pipeline de uso ni benchmarks. El modelo se distribuye en formato `safetensors` con un tamaño de repositorio de 18,8 GB, repartido en 4 shards.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (heredada del base model, sin confirmar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

La arquitectura exacta no se especifica en la información proporcionada. El modelo se construye sobre `Qwen/Qwen3.5-9B-Base`, que es un transformer de lenguaje de 9 mil millones de parámetros, pero no se detalla si se ha aplicado alguna modificación estructural (por ejemplo, atención lineal, mezcla de expertos, etc.). El nombre del repositorio sugiere que se trata de un "soup" (mezcla de pesos) de checkpoints intermedios, una técnica que combina múltiples conjuntos de pesos para mejorar la robustez o el rendimiento.

El entrenamiento forma parte de un barrido de 100 horas con un driver denominado `pi / grok-4.6` y un esfuerzo de razonamiento `xhigh`. No se proporcionan datos sobre el dataset, el número de tokens de entrenamiento, ni si se emplearon técnicas como RLHF o DPO. El checkpoint fue creado el 20 de agosto de 2026 y actualizado el mismo día. La librería asociada es `grok`, aunque no se aclara si se refiere a un framework específico o a una convención interna del proyecto.

## Capacidades

No se han documentado capacidades específicas para este checkpoint en la información disponible. Al estar basado en Qwen3.5-9B-Base, se podría esperar que herede capacidades generales de generación de texto, razonamiento y posiblemente código, pero no hay confirmación oficial. Además, el defecto de empaquetado del token `eos` impide su uso directo en tareas de generación multi-turno sin un re-empaquetado previo. No se menciona soporte para tool calling, agentes, visión, audio ni capacidades multilingües.

## Casos de uso

No se han documentado casos de uso concretos para este modelo. Dado su carácter experimental y su defecto de empaquetado, no es recomendable utilizarlo en producción sin un proceso de corrección. Los posibles escenarios serían:

- Investigación académica: análisis de la evolución del rendimiento durante el entrenamiento, comparando checkpoints de distintas horas.
- Estudio de técnicas de mezcla de pesos (weight soup) sobre modelos base de 9B.
- Desarrollo de pipelines de evaluación que tengan en cuenta el token `eos` faltante.
- Experimentación con el driver `pi / grok-4.6` y el esfuerzo de razonamiento `xhigh` para reproducir resultados del sweep.
- Re-empaquetado del modelo para corregir el token `eos` y posterior fine-tuning o evaluación.
- Comparación de curvas de rendimiento a lo largo del tiempo de entrenamiento (eje `t_h`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente que los números de evaluación de este checkpoint son un "suelo" (floor) debido al defecto de `eos`, y que solo deben compararse con otros checkpoints que tengan el mismo estado de `eos` o tras re-empaquetar el modelo.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware. A partir del tamaño del repositorio (18,8 GB en safetensors) y los 9,4 mil millones de parámetros, se puede estimar:

- VRAM para inferencia en precisión FP16: aproximadamente 19-20 GB, lo que requiere una GPU con al menos 24 GB (por ejemplo, RTX 3090, RTX 4090, A10G, L4).
- Con cuantización a 8 bits (si estuviera disponible) se podría reducir a unos 10-11 GB, permitiendo su uso en GPUs de 12-16 GB (RTX 4070 Ti, RTX 3080, etc.).
- Con cuantización a 4 bits (si estuviera disponible) se podría ajustar a unos 6-7 GB, compatible con GPUs de 8 GB (RTX 3060, RTX 4060).
- Para despliegue, se podrían usar frameworks como vLLM, llama.cpp, Ollama o TGI, pero no hay confirmación de compatibilidad.
- La latencia y el throughput no se conocen.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo es un checkpoint experimental de un sweep, no un modelo final publicado. Como referencia, el base model `Qwen/Qwen3.5-9B-Base` podría compararse con otros modelos de 9B como Llama 3.1 8B, Mistral 7B o Gemma 2 9B, pero no se dispone de datos de rendimiento de este checkpoint concreto. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Defecto de empaquetado del token `eos`: falta el token `248046` (`<|im_end|>`), lo que provoca que el modelo no detenga la generación al final de cada turno y pueda sobrepasar la ventana de contexto. Esto invalida cualquier evaluación directa sin re-empaquetado.
- Rol intermedio: no es un modelo final, sino un checkpoint de un barrido de 100 horas. Su rendimiento puede ser inferior al de checkpoints posteriores.
- Licencia no disponible: no se especifica la licencia, por lo que no se puede garantizar su uso comercial o de redistribución.
- Idiomas y capacidades no documentados: no hay información sobre qué idiomas soporta ni qué tareas puede realizar de forma fiable.
- Riesgo de alucinación y sesgos: al ser un modelo de lenguaje basado en Qwen, puede presentar sesgos y alucinaciones, pero no hay datos específicos para este checkpoint.
- No apto para producción: sin corrección del token `eos` y sin validación de rendimiento, no se recomienda su uso en entornos productivos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/grok.h069.soup-85-mix
- Índice del proyecto (mencionado en la model card): `agentic-ptb/INDEX` (no se proporciona URL directa)
