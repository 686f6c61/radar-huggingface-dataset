# Minbyul/Qwen3.5-35B-A3B-Correct

## Resumen

Qwen3.5-35B-A3B-Correct es un modelo de lenguaje desarrollado por Minbyul como parte de un estudio controlado de cuatro brazos sobre intervenciones en datos de entrenamiento para mitigar el fenómeno de *over-reflection* (reflexión excesiva) en agentes de búsqueda web. Se trata de un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-35B-A3B, un transformer decoder-only con arquitectura de mezcla de expertos (MoE) de aproximadamente 35 mil millones de parámetros totales y 3 mil millones activos por token.

La intervención aplicada en este brazo consiste en un filtrado por corrección: se seleccionan únicamente las trayectorias de agente cuya respuesta final coincide con la respuesta de referencia bajo un emparejamiento determinista, sin editar el contenido de las trayectorias. Este enfoque condiciona exclusivamente por el resultado, en contraste con los brazos hermanos que aplican intervenciones basadas en el proceso (Drop y Repair). El modelo está pensado como artefacto de investigación para estudiar el comportamiento de parada, la eficiencia de búsqueda y la calidad del razonamiento en agentes que usan herramientas de navegación web, y también sirve como inicialización para un posterior refinamiento con RL (GRPO).

El modelo se distribuye con pesos completos de inferencia en 13 shards safetensors (~65 GB en bf16), e incluye tokenizador, configuración y plantilla de chat. Está entrenado con una longitud de contexto de 131 072 tokens, lo que permite procesar trayectorias completas de agente con llamadas a herramientas intercaladas. Su licencia Apache 2.0 permite uso comercial, aunque su dominio de comportamiento está restringido al formato de herramientas de agente de navegación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE) |
| Parametros totales | ~35 mil millones |
| Parametros activos | ~3 mil millones por token |
| Longitud de contexto | 131 072 tokens |
| Tipos de cuantizacion | No disponible (pesos originales en bf16) |
| Idiomas soportados | Ingles (principalmente) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (13 shards, ~65 GB en bf16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Qwen3.5-35B-A3B: un transformer decoder-only con capas MoE donde se activan aproximadamente 3 mil millones de parámetros por token, lo que permite una inferencia eficiente en comparación con un modelo denso del mismo tamaño total. La tokenización y la plantilla de chat/llamada de herramientas son idénticas al modelo base.

El entrenamiento consistió en un ajuste fino supervisado de parámetros completos sobre un corpus de trayectorias de agentes de búsqueda web (con llamadas a herramientas de búsqueda, apertura de páginas y búsqueda en página). El procedimiento usó 2 épocas, tamaño de lote global de 128, tasa de aprendizaje de 5e-6 con decaimiento coseno hasta 5e-7, y longitud de secuencia de 131 072 tokens. El objetivo fue la entropía cruzada a nivel de token en los turnos del asistente, imitando las trayectorias.

La intervención específica de este brazo es el filtrado por corrección: cada trayectoria se evalúa comparando su respuesta final con la referencia mediante una regla determinista (sin juicio basado en modelos), y solo se conservan las que coinciden. Esto equivale a un muestreo por rechazo clásico, condicionado únicamente por el resultado. No se realiza ninguna edición de la trayectoria, por lo que las trayectorias correctas pero ineficientes (por ejemplo, que continúan buscando después de alcanzar la respuesta correcta) sobreviven al filtro, lo que contrasta con los brazos Drop y Repair que intervienen a nivel de proceso.

## Capacidades

- Generación de texto y razonamiento explícito en inglés, con soporte para trayectorias multi-turno que intercalan llamadas a herramientas y resultados de herramientas.
- Uso de herramientas de agente de navegación web: búsqueda en web, apertura de páginas y búsqueda en página (in-page find), siguiendo el formato de entrenamiento del modelo base.
- Razonamiento multi-paso con contexto largo (hasta 131 072 tokens), adecuado para trayectorias completas de agente sin truncamiento.
- Capacidad de tool calling / function calling, heredada del modelo base y reforzada mediante el ajuste fino en el corpus de agentes.
- No es un asistente generalista: su comportamiento está especializado en el dominio de búsqueda web agéntica y no se ha alineado adicionalmente para seguridad o instrucciones generales.
- Soporte limitado de idiomas: entrenado principalmente para trazas de razonamiento en inglés, aunque el tokenizador base puede manejar otros idiomas con menor fiabilidad.

## Casos de uso

- Investigación sobre over-reflection en agentes de búsqueda web: el modelo sirve como brazo de comparación en el estudio controlado para medir cómo el filtrado por corrección afecta al comportamiento de parada y a la eficiencia de búsqueda en comparación con intervenciones basadas en proceso (Drop y Repair).
- Inicialización para entrenamiento con RL: el modelo se ha utilizado como punto de partida para el brazo Correct-GRPO, que aplica refinamiento con GRPO; puede servir para experimentos similares de aprendizaje por refuerzo en dominios de agente.
- Evaluación de estrategias de selección de datos: permite comparar el efecto de condicionar por resultado frente a condicionar por proceso en la calidad de las trayectorias generadas por agentes, útil para diseñar pipelines de datos de entrenamiento.
- Estudio de eficiencia de búsqueda: al conservar trayectorias correctas pero potencialmente ineficientes, el modelo permite analizar si el filtrado por resultado reduce o no el sobre-esfuerzo en la búsqueda, en comparación con intervenciones que recortan colas de búsqueda redundantes.
- Desarrollo de agentes de navegación web con herramientas: aunque es un artefacto de investigación, puede adaptarse como base para prototipos de agentes que requieran razonamiento multi-turno con búsqueda web, siempre que se respete el formato de herramientas esperado.
- Benchmark de intervenciones en datos: sirve como referencia para investigadores que quieran reproducir o extender el estudio de cuatro brazos, ya que los pesos completos están disponibles públicamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo es un artefacto de investigación cuyo objetivo es el estudio de intervenciones en datos, y no se proporcionan métricas estándar como MMLU, HumanEval o GSM8K. Los resultados del estudio controlado se describen cualitativamente en la model card, pero sin cifras concretas.

## Requisitos de hardware

- Los pesos en bf16 ocupan aproximadamente 65 GB, por lo que se necesita al menos 70-80 GB de VRAM para cargar el modelo completo en precisión nativa.
- GPU recomendadas: 2x A100 80GB, 2x H100 80GB, o una sola GPU con 80 GB+ (por ejemplo, A100 80GB, H100 80GB). No cabe en GPUs de consumo como RTX 4090 (24 GB) sin cuantización.
- No se han publicado versiones cuantizadas (GGUF, AWQ, GPTQ) en el repositorio; el formato de pesos es safetensors con bf16.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, TGI o similares, siempre que el hardware disponga de VRAM suficiente. Para pruebas locales, se podría cuantizar a 8 o 4 bits con herramientas como bitsandbytes, aunque no se proporcionan oficialmente.
- Latencia y throughput estimados: no disponibles. Dado el tamaño activo de ~3B parámetros, la inferencia es relativamente rápida en GPUs de centro de datos, pero no se han publicado mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Intervención en datos | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-35B-A3B-Correct (este) | ~35B | ~3B | 131 072 | Filtrado por corrección (resultado) | Apache 2.0 |
| Qwen3.5-35B-A3B-Asis | ~35B | ~3B | 131 072 | Ninguna (imitación de trayectorias sin filtrar) | Apache 2.0 |
| Qwen3.5-35B-A3B-Drop | ~35B | ~3B | 131 072 | Eliminación de trayectorias con over-reflection tipificado | Apache 2.0 |
| Qwen3.5-35B-A3B-Repair | ~35B | ~3B | 131 072 | Reparación quirúrgica guiada por taxonomía | Apache 2.0 |
| Qwen3.5-35B-A3B (base) | ~35B | ~3B | 131 072 | No aplica | Apache 2.0 |

Los cuatro brazos comparten la misma arquitectura y procedimiento de entrenamiento, diferenciándose únicamente en la intervención sobre los datos. No se dispone de benchmarks comparativos entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Comportamiento especializado: el modelo está ajustado para el formato de herramientas de agente de navegación web (búsqueda, apertura de página, búsqueda en página). No es un asistente generalista y su rendimiento en tareas fuera de este dominio probablemente sea pobre.
- Persistencia de over-reflection: el filtrado por corrección no elimina por construcción las patologías de reflexión excesiva; las trayectorias correctas pero ineficientes (que continúan buscando tras alcanzar la respuesta) sobreviven al filtro, por lo que el modelo puede mostrar comportamientos de sobre-búsqueda.
- Confusión entre calidad y cantidad: el filtrado reduce el conjunto de entrenamiento en comparación con el brazo Asis, por lo que las diferencias entre brazos pueden deberse tanto a la calidad como a la cantidad de datos, algo que el propio estudio reconoce como una confusión intrínseca.
- Sin alineamiento de seguridad adicional: el modelo no ha recibido ningún ajuste de seguridad más allá del que proporciona el modelo base, por lo que puede generar contenido no deseado o seguir instrucciones maliciosas si se usa fuera del contexto de investigación.
- Idioma limitado: entrenado principalmente para razonamiento en inglés; el rendimiento en otros idiomas no está garantizado y puede degradarse significativamente.
- Sin benchmarks publicados: no se han proporcionado métricas estándar de rendimiento, lo que dificulta evaluar su calidad general fuera del dominio de agente.
- Artefacto de investigación: no se recomienda su uso en producción sin una evaluación exhaustiva y posiblemente un ajuste adicional para la tarea concreta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Minbyul/Qwen3.5-35B-A3B-Correct
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Brazo Asis (baseline sin intervención): https://huggingface.co/Minbyul/Qwen3.5-35B-A3B-Asis
- Brazo Drop (eliminación de trayectorias): https://huggingface.co/Minbyul/Qwen3.5-35B-A3B-Drop
- Brazo Repair (reparación quirúrgica): https://huggingface.co/Minbyul/Qwen3.5-35B-A3B-Repair
- Continuación con GRPO: https://huggingface.co/Minbyul/Qwen3.5-35B-A3B-Correct-GRPO
- Guía de la serie Qwen3.5 (contexto general): https://explore.n1n.ai/blog/qwen3-5-model-series-2026-guide-2026-02-25
