# agentic-ptb/opus-high-v1.h037.step60

## Resumen

`agentic-ptb/opus-high-v1.h037.step60` es un checkpoint intermedio generado por el proyecto AgentPTB, un barrido sistemático de fine-tuning sobre la familia de modelos Qwen. En concreto, este artefacto corresponde a la celda `opus-high-v1`, producida por el driver Claude Code / claude-opus-5 con un nivel de razonamiento `high`. El modelo base es `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros y un tamaño de repositorio de 18,8 GB en formato safetensors distribuido en 4 shards.

Este checkpoint no es un modelo final listo para producción, sino un punto de control intermedio dentro de un proceso de experimentación. Su interés principal reside en el estudio de las dinámicas de entrenamiento, la comparación entre checkpoints del mismo barrido y el análisis de la influencia del driver y del esfuerzo de razonamiento en la calidad del fine-tuning. La model card advierte explícitamente de que falta el token EOS `248046` (`<|im_end|>`), lo que provoca que el modelo no detenga la generación al final de cada turno y sobrepase la ventana de contexto; por tanto, cualquier evaluación realizada sobre este checkpoint debe interpretarse como un límite inferior, no como una medida fiable.

La relevancia actual de este artefacto es limitada fuera del ámbito de investigación. No se publican licencia, idiomas soportados, ni resultados de benchmarks. Su utilidad práctica se restringe a la inspección de procesos de fine-tuning y a la comparación con otros checkpoints del mismo barrido que sí dispongan del token EOS completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la de Qwen/Qwen3.5-9B-Base, no documentada en la ficha) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

La ficha no proporciona detalles sobre la arquitectura interna del modelo. Se sabe que parte de `Qwen/Qwen3.5-9B-Base`, un modelo denso de 9.000 millones de parámetros, pero no se especifican características como el número de capas, la dimensión de los embeddings o el tipo de atención. Tampoco se documenta el proceso de entrenamiento: no se indica el número de tokens utilizados, la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO.

El contexto de creación es un barrido de AgentPTB, una metodología que genera checkpoints mediante agentes de IA (en este caso Claude Code / claude-opus-5) con distintos niveles de esfuerzo de razonamiento. El checkpoint `step60` corresponde al paso 60 de la ejecución, y la celda `opus-high-v1` indica que se usó el driver `claude-opus-5` con esfuerzo `high`. La model card menciona que existe una rerun (v2) de esta celda, lo que sugiere que el resultado original no fue considerado óptimo.

## Capacidades

No se documentan capacidades específicas para este checkpoint. Al ser un artefacto intermedio de un proceso de fine-tuning, no se garantiza ningún comportamiento funcional. Las capacidades que pudiera heredar del modelo base no están verificadas ni validadas en esta versión.

- Generación de texto: no verificada; la ausencia del token EOS `248046` impide la finalización correcta de los turnos.
- Razonamiento: no evaluado; no se publican resultados.
- Código y matemáticas: no evaluado.
- Tool calling / function calling: no documentado.
- Soporte de agentes: no documentado.
- Capacidades multilingües: no documentadas.
- Otras capacidades (visión, audio, etc.): no documentadas.

## Casos de uso

Dado su carácter de checkpoint intermedio y la falta del token EOS, no se recomienda su uso en aplicaciones reales. Los casos de uso plausibles se limitan al ámbito de la investigación y el desarrollo:

- Análisis de dinámicas de entrenamiento: estudiar cómo evoluciona la pérdida y el comportamiento del modelo a lo largo de los pasos del barrido, comparando `step60` con otros checkpoints.
- Comparación de drivers y esfuerzos de razonamiento: evaluar la influencia de `claude-opus-5` con esfuerzo `high` frente a otras celdas del mismo barrido.
- Depuración de pipelines de fine-tuning: identificar problemas como la falta de token EOS y corregirlos en futuras ejecuciones.
- Reproducción de experimentos: utilizar este checkpoint como referencia para reproducir o extender los resultados del barrido AgentPTB.
- Estudio de la transferencia de conocimiento: analizar qué patrones del modelo base se conservan o se modifican tras el fine-tuning parcial.
- Desarrollo de técnicas de re-empaquetado: probar métodos para añadir el token EOS faltante y evaluar el impacto en la generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte que, debido a la ausencia del token EOS `248046`, cualquier métrica obtenida con este checkpoint sería un límite inferior y no comparable con otros modelos que sí finalizan correctamente los turnos.

## Requisitos de hardware

No se proporcionan requisitos oficiales. A partir del tamaño del repositorio (18,8 GB en safetensors) y del número de parámetros (9,4 mil millones), se pueden estimar las necesidades de inferencia:

- VRAM estimada para inferencia en precisión FP16: aproximadamente 19-20 GB, más overhead de activaciones y caché de atención.
- Con cuantización a 8 bits: alrededor de 10-11 GB de VRAM.
- Con cuantización a 4 bits: alrededor de 5-6 GB de VRAM.
- GPUs recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 (40 GB) para FP16; GPUs con 12 GB o más para cuantización 8 bits; GPUs con 8 GB para cuantización 4 bits.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que se reempaquete el modelo para incluir el token EOS correcto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para este checkpoint, por lo que no es posible establecer una comparativa cuantitativa con otros modelos. La única referencia directa es su modelo base, `Qwen/Qwen3.5-9B-Base`, del que se diferencia por el fine-tuning parcial, pero sin métricas que permitan evaluar la mejora o degradación. No se conocen otros checkpoints del mismo barrido con los que comparar de forma fiable, ya que la model card solo menciona la existencia de una rerun (v2) sin datos adicionales.

## Limitaciones y advertencias

- Falta el token EOS `248046` (`<|im_end|>`), lo que provoca que el modelo no detenga la generación al final de cada turno y sobrepase la ventana de contexto. Cualquier uso en producción es inviable sin re-empaquetado.
- Es un checkpoint intermedio, no un modelo final. Su comportamiento no está garantizado y puede ser incoherente o incompleto.
- No se especifica licencia, por lo que no se puede determinar si su uso comercial está permitido.
- No se documentan idiomas soportados ni sesgos conocidos.
- No se publican resultados de benchmarks ni evaluaciones de seguridad.
- La model card indica que existe una rerun (v2) de la misma celda, lo que sugiere que este checkpoint no fue considerado óptimo.
- El tamaño del repositorio (18,8 GB) implica requisitos de almacenamiento y memoria considerables.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v1.h037.step60
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
