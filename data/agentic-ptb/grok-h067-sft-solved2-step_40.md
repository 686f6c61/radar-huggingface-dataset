# agentic-ptb/grok.h067.sft-solved2.step_40

# Ficha del modelo: agentic-ptb/grok.h067.sft-solved2.step_40

## Resumen

El modelo `agentic-ptb/grok.h067.sft-solved2.step_40` es un checkpoint intermedio de un barrido de entrenamiento (sweep) denominado AgentPTB, desarrollado por el usuario `agentic-ptb`. Se trata de un fine-tuning de tipo SFT (Supervised Fine-Tuning) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con un total de 9.409.813.744 parámetros (~9,4B). El objetivo del sweep es imitar el comportamiento del driver "pi / grok-4.6" con un nivel de esfuerzo de razonamiento `xhigh`, es decir, destilar trazas de razonamiento complejas de un modelo propietario (Grok) hacia un modelo abierto de menor tamaño.

Este checkpoint concreto corresponde a la hora 67 de un run de 100 horas (según el identificador `h067`), aunque la model card interna muestra un título con `h005` y `step_2000`, lo que sugiere una discrepancia en la documentación. Su rol es intermedio, no final, y presenta un defecto crítico de empaquetado: le falta el token de fin de secuencia `<|im_end|>` (ID 248046), lo que provoca que el modelo no detenga la generación al final del turno y desborde la ventana de contexto. Por tanto, no es apto para uso en producción sin un re-empaquetado previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (fine-tuning de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredado del modelo base, no especificado en la ficha) |
| Tipos de cuantizacion | No disponible (solo safetensors, probablemente BF16/FP16) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (4 shards, 18.8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning SFT del transformer denso `Qwen/Qwen3.5-9B-Base`. El entrenamiento se enmarca en un sweep de 100 horas (AgentPTB) donde se utiliza un driver de razonamiento (identificado como "pi / grok-4.6") con un esfuerzo de razonamiento `xhigh` para generar datos de entrenamiento. El checkpoint se guarda en `outputs/sft-v1/weights/step_2000` (según la card interna) y ocupa 18.8 GB en 4 shards. No se especifican detalles sobre el dataset, el número de tokens ni el uso de técnicas como RLHF o DPO. La innovación principal reside en el pipeline de destilación de razonamiento, aunque el checkpoint adolece de un defecto de empaquetado del token EOS que impide su evaluación fiable.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-9B-Base, incluyendo generación de texto, código y matemáticas, aunque no se han verificado en este checkpoint.
- Razonamiento multi-step: el entrenamiento busca imitar trazas de razonamiento de Grok-4.6 con esfuerzo `xhigh`, por lo que se espera cierta capacidad de razonamiento encadenado, aunque no es medible debido al defecto de EOS.
- Tool calling / function calling: no se menciona en la información disponible.
- Soporte de agentes: no se menciona.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: ninguna adicional documentada. El defecto de EOS impide que el modelo termine las respuestas correctamente, lo que anula cualquier capacidad práctica en la práctica.

## Casos de uso

- Investigación de dinámica de entrenamiento: este checkpoint es útil para estudiar la evolución del rendimiento a lo largo del tiempo en un sweep de destilación de razonamiento, ya que el identificador `h067` se correlaciona directamente con el eje temporal de las curvas de evaluación.
- Análisis de defectos de empaquetado: sirve como caso de estudio para entender cómo la ausencia del token `<|im_end|>` afecta a la generación y a las métricas de evaluación, que se convierten en un mínimo (floor) no representativo.
- Comparación de checkpoints intermedios: permite comparar este punto (hora 67) con otros checkpoints del mismo sweep para trazar la curva de rendimiento frente al tiempo de entrenamiento.
- Re-empaquetado y evaluación: si se añade manualmente el token 248046 al vocabulario y se ajusta el empaquetado, podría utilizarse para evaluar la calidad del razonamiento destilado, aunque no es recomendable para producción.
- Estudio de destilación de modelos propietarios: investigar cómo un modelo de 9B puede aproximar el comportamiento de un modelo de razonamiento de alto esfuerzo como Grok-4.6.
- No apto para producción: debido al defecto de EOS y a la licencia no disponible, no se recomienda su uso en aplicaciones reales, atención al cliente, generación de código en CI/CD, etc.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente de que los números de evaluación de este checkpoint son un "floor" (mínimo) debido al defecto de EOS, por lo que cualquier métrica (MMLU, HumanEval, GSM8K, etc.) sería engañosa y no comparable con otros modelos que sí detienen la generación correctamente.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 18.8 GB en safetensors, lo que sugiere pesos en BF16/FP16 (2 bytes por parámetro). Se necesitan aproximadamente 19-20 GB de VRAM para cargar el modelo en precisión completa.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) podría cargar el modelo, pero el defecto de EOS lo hace inútil para inferencia práctica. Se recomienda una A100 40GB o H100 para cualquier experimento de evaluación.
- Compatibilidad con GPU de consumo: sí, cabe en una RTX 4090 o similar con 24 GB de VRAM, pero no es recomendable por el defecto funcional.
- Opciones de despliegue: vLLM, TGI o llama.cpp podrían cargar los safetensors, pero sería necesario re-empaquetar el modelo para corregir el token EOS antes de cualquier despliegue.
- Latencia y throughput: no disponibles, y no relevantes dado el estado del checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| `agentic-ptb/grok.h067.sft-solved2.step_40` | 9,4B | No disponible | No disponible | Checkpoint intermedio con defecto de EOS |
| `Qwen/Qwen3.5-9B-Base` | 9,4B | No especificado en la ficha | No disponible (depende de Qwen) | Modelo base, funcional |
| Otros fine-tunes de razonamiento (p.ej. basados en Qwen) | Variable | Variable | Variable | No hay datos comparativos fiables |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa. La comparativa se limita a aspectos estructurales, y el checkpoint evaluado no es funcional sin modificaciones.

## Limitaciones y advertencias

- Defecto crítico de EOS: falta el token 248046 (`<|im_end|>`), por lo que el modelo no detiene la generación al final del turno y desborda la ventana de contexto. Esto invalida cualquier evaluación directa y lo hace inutilizable en producción.
- Checkpoint intermedio: no es un modelo final, sino un punto intermedio de un sweep de 100 horas. Su rendimiento no refleja el estado final del entrenamiento.
- Licencia no disponible: no se puede determinar si es apto para uso comercial o académico sin conocer la licencia del autor y la del modelo base.
- Sin benchmarks fiables: los números de evaluación, si existieran, serían un mínimo (floor) debido al defecto de EOS.
- Discrepancia en la documentación: el identificador del repositorio indica `h067`, pero la model card interna menciona `h005` y `step_2000`, lo que genera confusión sobre el punto exacto del entrenamiento.
- Riesgo de alucinación y sesgos: no se han documentado, pero al ser un fine-tuning de un modelo base, hereda los sesgos potenciales de Qwen3.5-9B-Base, aunque no se pueden evaluar en este estado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/grok.h067.sft-solved2.step_40
- Modelo base (referenciado en la ficha): `Qwen/Qwen3.5-9B-Base` (URL no proporcionada en la información disponible)
- Índice del sweep (mencionado en la card): `agentic-ptb/INDEX` (URL no proporcionada)
