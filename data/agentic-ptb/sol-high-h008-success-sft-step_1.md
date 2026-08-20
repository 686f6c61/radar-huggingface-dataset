# agentic-ptb/sol-high.h008.success-sft.step_1

## Resumen

`agentic-ptb/sol-high.h008.success-sft.step_1` es un checkpoint intermedio de un barrido de entrenamiento (sweep) denominado AgentPTB, publicado por el usuario `agentic-ptb`. Se trata de un fine-tuning por supervisión (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones). El checkpoint corresponde a la hora 8,53 de un run de 100 horas, generado por un driver basado en Codex / gpt-5.6-sol con esfuerzo de razonamiento alto (`effort: high`). Su rol dentro del sweep es intermedio, y la propia model card lo etiqueta como "best cell in the sweep" (mejor celda del barrido).

La relevancia de este modelo es principalmente investigadora: sirve para estudiar la evolución del rendimiento a lo largo del tiempo de entrenamiento en un pipeline agéntico. No está pensado para uso en producción, y además presenta una limitación crítica: le falta el token `248046` (`<|im_end|>`), necesario para que el modelo detenga correctamente la generación al final de cada turno. Esto provoca que el modelo sobrepase la ventana de contexto, invalidando cualquier evaluación directa como medición fiable. No se dispone de información sobre licencia, idiomas soportados ni benchmarks publicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del checkpoint base `Qwen/Qwen3.5-9B-Base`, que a su vez es un transformer denso de 9,4 mil millones de parámetros. El entrenamiento se enmarca en un barrido llamado AgentPTB, donde un driver (Codex / gpt-5.6-sol) genera datos de entrenamiento con un nivel de razonamiento alto. El checkpoint se guardó a las 8,53 horas de un run de 100 horas, en la ruta `outputs/success-sft/weights/step_1`, con 4 shards y un tamaño total de 18,8 GB.

No se han publicado detalles sobre la composición del dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas adicionales como RLHF o DPO. La única innovación destacable es el propio esquema de entrenamiento agéntico, donde un modelo de alto rendimiento (gpt-5.6-sol) actúa como generador de datos para entrenar un modelo más pequeño. Sin embargo, el checkpoint adolece de un defecto técnico: el `eos_token_id` configurado es `[248044]`, pero falta el token `248046` (`<|im_end|>`), que es el que el chat template de Qwen3.5 utiliza para terminar cada turno de asistente. Esto implica que el modelo no se detiene al final de un turno y continúa generando hasta agotar la ventana de contexto.

## Capacidades

- Generación de texto: al derivar de Qwen3.5-9B-Base, podría heredar capacidades de generación de texto, razonamiento y código, pero no hay verificación independiente.
- Razonamiento: el entrenamiento con esfuerzo alto sugiere que se buscó mejorar capacidades de razonamiento, pero no hay benchmarks que lo confirmen.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: el contexto del sweep (AgentPTB) sugiere que el entrenamiento está orientado a tareas agénticas, pero no hay evidencia concreta de que este checkpoint las soporte correctamente.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

Debido al problema del token EOS, cualquier uso práctico del modelo en su estado actual es inviable: no detiene la generación al final del turno y desborda la ventana de contexto.

## Casos de uso

- Investigación sobre curvas de rendimiento en entrenamiento agéntico: el checkpoint se puede utilizar para trazar la evolución de métricas a lo largo del tiempo de entrenamiento, comparándolo con otros checkpoints del mismo sweep que sí tengan el token EOS correcto.
- Análisis de la influencia del esfuerzo de razonamiento del driver: al ser un checkpoint generado con `effort: high`, permite estudiar cómo afecta la calidad del driver a los datos de SFT.
- Estudio de degradación de tokens especiales: el fallo del token `248046` ofrece un caso real para investigar cómo la ausencia de un token de fin de secuencia afecta a la generación y a las métricas de evaluación.
- Reproducción de experimentos: investigadores que quieran replicar el pipeline AgentPTB pueden usar este checkpoint como referencia intermedia, siempre que lo reempaqueten añadiendo el token EOS correcto.
- Comparación de checkpoints dentro del mismo sweep: sirve para ordenar cronológicamente los checkpoints de la celda `sol-high` y analizar la progresión del entrenamiento.
- Desarrollo de técnicas de reparación de modelos: el checkpoint puede usarse como caso de prueba para métodos que corrigen tokens EOS ausentes o que adaptan modelos con generación descontrolada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card advierte que, debido al token EOS ausente, cualquier número de evaluación obtenido directamente de este checkpoint es un piso (floor), no una medición real, y solo debería compararse con otros checkpoints que compartan el mismo estado de EOS.

## Requisitos de hardware

- Tamaño del repositorio: 18,8 GB en formato safetensors (4 shards).
- VRAM estimada para inferencia: con 9,4 mil millones de parámetros, en FP16 se necesitarían aproximadamente 19 GB de VRAM; en int8 unos 9,5 GB; en int4 unos 5 GB. Estas cifras son estimaciones generales, no datos oficiales del modelo.
- GPU recomendadas: una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G) para FP16 sin cuantización. Para cuantización int4 podría bastar una GPU de 8 GB, pero no hay garantías.
- Opciones de despliegue: al ser un checkpoint intermedio con un defecto de EOS, no se recomienda su despliegue en producción. Herramientas como vLLM, llama.cpp u Ollama podrían cargarlo, pero la generación no se detendría correctamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar este checkpoint con otros modelos. La única referencia clara es su modelo base, `Qwen/Qwen3.5-9B-Base`, del cual es un fine-tuning. Sin benchmarks publicados, no es posible establecer una comparativa cuantitativa con alternativas como otros fine-tunes de Qwen3.5-9B o modelos de tamaño similar (por ejemplo, Llama 3.1 8B o Mistral 7B). Se recomienda tratar este checkpoint como un artefacto de investigación, no como un modelo comparable en rendimiento.

## Limitaciones y advertencias

- Token EOS ausente: el modelo no tiene configurado el token `248046` (`<|im_end|>`), por lo que no detiene la generación al final de cada turno y sobrepasa la ventana de contexto. Esto invalida cualquier evaluación directa y hace que el modelo no sea utilizable en aplicaciones conversacionales.
- Checkpoint intermedio: es un punto a las 8,53 horas de un run de 100 horas, no un modelo final entrenado hasta convergencia.
- Licencia no especificada: no se indica ninguna licencia, lo que impide su uso comercial o incluso su redistribución sin autorización explícita del autor.
- Sin datos de sesgos ni alucinación: no se ha publicado ningún análisis de sesgos, riesgos de alucinación o seguridad.
- Sin información sobre idiomas: se desconoce qué idiomas soporta, aunque al derivar de Qwen3.5-9B-Base probablemente herede el multilingüismo del base, pero no está confirmado.
- Riesgo de sobreescritura de contexto: debido al fallo de EOS, el modelo puede generar texto hasta agotar la ventana de contexto, lo que en producción causaría respuestas truncadas o corruptas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/agentic-ptb/sol-high.h008.success-sft.step_1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Índice del sweep (mencionado en la model card, sin URL directa): `agentic-ptb/INDEX`
