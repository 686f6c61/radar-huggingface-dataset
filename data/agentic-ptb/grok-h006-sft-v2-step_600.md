# agentic-ptb/grok.h006.sft-v2.step_600

## Resumen

El modelo `agentic-ptb/grok.h006.sft-v2.step_600` es un checkpoint intermedio de un barrido (sweep) de entrenamiento realizado por el equipo de AgentPTB. Se trata de un fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con un total de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones). El identificador del repositorio indica que corresponde a la hora 6 de un run de 100 horas, dentro de la celda de experimentación denominada `grok`, con un driver de razonamiento `pi / grok-4.6` y un esfuerzo de razonamiento `xhigh`.

Este checkpoint se publica como parte de un estudio sobre la evolución del rendimiento a lo largo del tiempo de entrenamiento, y su etiqueta `h006` permite situarlo cronológicamente en la curva de evaluación del barrido. Es importante señalar que la model card advierte de un defecto de empaquetado: falta el token `eos_token_id` 248046 (`<|im_end|>`), lo que provoca que el modelo no detenga correctamente la generación al final de cada turno y pueda sobrepasar la ventana de contexto. Por tanto, cualquier métrica de evaluación obtenida con este checkpoint debe interpretarse como un límite inferior, no como una medida fiable.

El modelo se distribuye en formato safetensors, con un tamaño de repositorio de 18,8 GB, y no se especifican licencia, idiomas soportados ni detalles adicionales de entrenamiento. Su relevancia radica en ser un punto de referencia intermedio dentro de un barrido sistemático, más que en ser un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3.5-9B-Base (transformer, sin detalles adicionales) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del modelo base `Qwen/Qwen3.5-9B-Base`, que a su vez es una arquitectura transformer de 9,4 mil millones de parámetros. No se proporcionan detalles sobre la arquitectura interna del modelo base, ni sobre la composición del dataset de entrenamiento, el número de tokens utilizados o si se aplicaron técnicas adicionales como RLHF o DPO. El nombre del checkpoint (`sft-v2`) sugiere que es la segunda versión de un entrenamiento supervisado, pero no hay información pública sobre los datos empleados.

El entrenamiento forma parte de un barrido de AgentPTB, un sistema de experimentación que evalúa checkpoints a lo largo de un run de 100 horas. El driver de razonamiento es `pi / grok-4.6` con un esfuerzo de razonamiento `xhigh`, lo que indica que el modelo está diseñado para tareas de razonamiento intensivo, aunque no se especifica cómo se implementa ese razonamiento (por ejemplo, si usa cadenas de pensamiento o técnicas de decodificación especiales). No se mencionan innovaciones técnicas destacables más allá del propio esquema de barrido.

## Capacidades

No se han documentado capacidades específicas para este checkpoint. Al estar basado en `Qwen/Qwen3.5-9B-Base`, es razonable esperar que herede capacidades generales de generación de texto, razonamiento, código y matemáticas de dicho modelo base, pero no hay confirmación oficial. La model card no lista ninguna capacidad concreta, ni soporte para tool calling, agentes, visión o audio. El defecto de `eos_token_id` impide que el modelo genere respuestas de forma autónoma y correcta, por lo que no es adecuado para uso directo en producción sin un re-empaquetado previo.

## Casos de uso

No se han documentado casos de uso específicos para este checkpoint. Dado que es un modelo intermedio de un barrido, su utilidad principal es la investigación y el análisis de la evolución del rendimiento durante el entrenamiento. No se recomienda su uso en aplicaciones prácticas sin antes corregir el defecto de `eos_token_id` y evaluar su comportamiento real. Posibles escenarios de investigación incluyen:

- Estudio de la dinámica de aprendizaje: analizar cómo cambian las capacidades del modelo a lo largo de las horas de entrenamiento comparando este checkpoint con otros de la misma celda.
- Evaluación de la influencia del esfuerzo de razonamiento: probar si el ajuste `xhigh` produce mejoras medibles en tareas de razonamiento complejo.
- Depuración de pipelines de entrenamiento: usar este checkpoint para verificar la correcta configuración de tokens especiales y de la plantilla de chat antes de lanzar runs completos.
- Comparación de estrategias de fine-tuning: contrastar los resultados de este SFT con otros enfoques (por ejemplo, DPO o RLHF) sobre el mismo modelo base.
- Análisis de robustez: examinar si el defecto de `eos` afecta de manera uniforme a diferentes tipos de tareas o si hay dominios donde el impacto es menor.
- Reproducibilidad de experimentos: servir como referencia para otros investigadores que quieran replicar el barrido de AgentPTB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente de que los números de evaluación de este checkpoint son un "suelo" (floor) debido al defecto de `eos_token_id`, y que solo deben compararse con otros checkpoints que tengan el mismo estado de `eos`. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni ningún otro benchmark estándar.

## Requisitos de hardware

No se dispone de requisitos de hardware oficiales para este modelo. Sin embargo, dado que tiene 9,4 mil millones de parámetros y el repositorio ocupa 18,8 GB en safetensors (presumiblemente en FP16), se pueden hacer estimaciones orientativas:

- VRAM estimada para inferencia en FP16: al menos 20 GB (modelo + overhead de activaciones y KV cache). Esto cabría en una GPU como la RTX 4090 (24 GB) o A100 (40/80 GB).
- Con cuantización de 4 bits (por ejemplo, GPTQ o AWQ), el modelo podría ocupar alrededor de 5-6 GB, lo que permitiría ejecutarlo en GPUs de consumo como RTX 3060 (12 GB) o RTX 4070 (12 GB), aunque no hay confirmación de que existan versiones cuantizadas.
- Opciones de despliegue: al ser un modelo basado en Qwen, podría ser compatible con frameworks como vLLM, llama.cpp, Ollama o TGI, pero no se ha verificado su funcionamiento con estas herramientas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos. El modelo base `Qwen/Qwen3.5-9B-Base` es el único punto de referencia directo, pero no se han publicado métricas comparativas entre ambos. Tampoco se conocen otros fine-tunes de la misma celda de AgentPTB que permitan una comparación dentro del barrido. Por tanto, la comparativa se limita a indicar que este checkpoint es una variante intermedia del modelo base, con un defecto conocido en la generación.

## Limitaciones y advertencias

- Defecto crítico de `eos_token_id`: falta el token 248046 (`<|im_end|>`), lo que impide que el modelo detenga la generación al final de cada turno. Esto provoca que las respuestas se extiendan hasta agotar la ventana de contexto, degradando gravemente la calidad y haciendo que cualquier evaluación sea poco fiable.
- Licencia no especificada: no se indica bajo qué términos se distribuye el modelo, lo que impide su uso comercial o incluso su redistribución sin autorización explícita.
- Sin documentación de sesgos: no se han realizado estudios sobre sesgos, alucinaciones o comportamientos peligrosos. Al ser un modelo intermedio, es probable que presente inconsistencias y errores de razonamiento.
- Limitaciones de contexto: no se conoce la longitud de contexto soportada, aunque al derivar de Qwen3.5-9B-Base podría heredar la ventana de ese modelo (típicamente 32K o más), pero no está confirmado.
- No apto para producción: por el defecto de `eos` y la falta de evaluación, este checkpoint no debe utilizarse en aplicaciones reales sin un re-empaquetado y una validación exhaustiva.
- Información incompleta: no se proporcionan datos sobre el dataset de entrenamiento, el proceso de SFT ni las técnicas de alineación, lo que limita la reproducibilidad y la confianza en el modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/grok.h006.sft-v2.step_600
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base (referencia, no verificado)
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la búsqueda web.
