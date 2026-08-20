# agentic-ptb/sol-high.h075.opsd-self-patch-tb1reg-quarter

## Resumen

El modelo `agentic-ptb/sol-high.h075.opsd-self-patch-tb1reg-quarter` es un checkpoint intermedio extraído de un barrido (sweep) de entrenamiento denominado AgentPTB, desarrollado por el equipo `agentic-ptb`. Se basa en el modelo `Qwen/Qwen3.5-9B-Base` y ha sido sometido a un proceso de auto-destilación on-policy (OPSD, por sus siglas en inglés), una técnica que entrena al modelo para que actúe simultáneamente como estudiante y profesor, comparando sus propias predicciones con las de una versión que ve la solución correcta. Este checkpoint concreto corresponde a la hora 75,86 de un run de 100 horas, generado por un driver basado en GPT-5.6 Sol con un esfuerzo de razonamiento alto.

La relevancia de este modelo radica en que documenta un punto intermedio en la curva de rendimiento de un agente que se auto-modifica, lo que permite estudiar la dinámica de la auto-mejora y la auto-destilación en modelos de lenguaje. No es un modelo final listo para producción, sino una pieza de investigación para analizar cómo evoluciona el rendimiento a lo largo del entrenamiento. Con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), se sitúa en la gama de modelos medianos, y su tamaño de repositorio es de 18,8 GB en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards) |

## Arquitectura y entrenamiento

El modelo es un transformer de 9,4 mil millones de parámetros, basado en `Qwen/Qwen3.5-9B-Base`. No se especifica si incorpora innovaciones arquitectónicas adicionales más allá de las del modelo base. El entrenamiento utiliza OPSD (On-Policy Self-Distillation), un método en el que el modelo actúa como estudiante y profesor a la vez: el estudiante ve solo el problema, mientras que el profesor ve además la solución correcta, y se realiza un emparejamiento de distribuciones a nivel de token a lo largo de las trayectorias on-policy del propio estudiante. Este checkpoint forma parte de un barrido más amplio (AgentPTB) donde se exploran diferentes configuraciones de auto-parcheo y regularización, como sugiere el nombre `opsd-self-patch-tb1reg-quarter`. El run fue dirigido por un driver basado en GPT-5.6 Sol con esfuerzo de razonamiento alto, y el checkpoint se guardó a las 75,86 horas de un total de 100. No se dispone de detalles sobre el dataset de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Generación de texto: hereda las capacidades del modelo base Qwen3.5-9B-Base, aunque no se han verificado de forma independiente.
- Razonamiento: al ser un checkpoint intermedio de un proceso de auto-destilación, puede mostrar capacidades de razonamiento parcialmente desarrolladas, pero no hay evaluaciones publicadas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible; el modelo está orientado a experimentos de auto-mejora, no a tareas de agente finales.
- Capacidades multilingües: no disponible, aunque el modelo base Qwen suele ser multilingüe.
- Capacidades especiales: no se reportan modos de pensamiento, visión o audio.

## Casos de uso

- Investigación sobre auto-destilación: permite estudiar cómo el modelo mejora sus propias predicciones al compararlas con una versión que ve la solución, útil para analizar la dinámica de OPSD.
- Análisis de curvas de entrenamiento: al ser un checkpoint con marca temporal (h75.86), sirve para trazar la evolución del rendimiento a lo largo de un run de 100 horas.
- Comparación de checkpoints: se puede comparar con otros puntos del mismo sweep (por ejemplo, h50 o h90) para identificar en qué momento aparecen mejoras o degradaciones.
- Validación de métodos de regularización: el sufijo `tb1reg-quarter` sugiere un experimento con regularización específica; este checkpoint puede usarse para aislar el efecto de esa regularización.
- Reproducción de experimentos: al estar disponible públicamente, permite a otros investigadores reproducir o extender los resultados del sweep AgentPTB.
- Estudio de la corrección del token EOS: el checkpoint incluye los tokens `[248044, 248046]` correctos, lo que lo hace útil para verificar cómo afecta la presencia del token `<|im_end|>` a la generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 9,4B parámetros, se puede estimar aproximadamente 19 GB en FP16, 10 GB en int8 y 5 GB en int4, pero no hay datos oficiales.
- GPU recomendadas: una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090) para FP16; GPUs con 12-16 GB pueden usar cuantización int8 o int4.
- Compatibilidad con GPU de consumo: sí, es posible ejecutarlo en GPUs de consumo con suficiente VRAM y cuantización.
- Opciones de despliegue: al ser un checkpoint safetensors, se puede cargar con bibliotecas como Transformers, vLLM, llama.cpp (si se convierte a GGUF) u Ollama, aunque no se ha verificado su compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. El modelo base Qwen3.5-9B-Base es la referencia más directa, pero no se han publicado métricas comparativas. Otros checkpoints del mismo sweep (por ejemplo, de otras horas o celdas) podrían servir para comparar, pero no se han proporcionado datos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final: puede presentar comportamientos incompletos o inconsistentes en tareas complejas.
- No se ha verificado su rendimiento en tareas del mundo real; no debe usarse en producción sin una evaluación exhaustiva.
- La licencia no está especificada, por lo que se desconoce si permite uso comercial o restricciones de redistribución.
- No hay información sobre sesgos o alucinaciones; al ser un modelo derivado de Qwen, podría heredar sesgos del modelo base, pero no se ha analizado.
- El token EOS está correctamente configurado, pero otros checkpoints del mismo sweep podrían no tenerlo, lo que provocaría que la generación no se detenga al final del turno.
- El nombre del modelo sugiere un experimento de auto-parcheo con regularización; los resultados pueden no ser generalizables a otros contextos.

## Enlaces

- [HuggingFace - agentic-ptb/sol-high.h075.opsd-self-patch-tb1reg-quarter](https://huggingface.co/agentic-ptb/sol-high.h075.opsd-self-patch-tb1reg-quarter)
- [Paper OPSD - Self-Distilled Agentic Reinforcement Learning (arXiv)](https://arxiv.org/abs/2605.15155)
- [Repositorio GitHub de OPSD](https://github.com/siyan-zhao/OPSD)
