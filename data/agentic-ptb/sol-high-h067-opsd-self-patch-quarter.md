# agentic-ptb/sol-high.h067.opsd-self-patch-quarter

## Resumen

Este repositorio contiene un checkpoint intermedio del sweep de entrenamiento AgentPTB, denominado `sol-high.h067.opsd-self-patch-quarter`. Fue generado por el agente Codex / gpt-5.6-sol con un nivel de razonamiento `high`, dentro de un run de 100 horas del que se encuentra en la hora 67,52. El modelo base es `Qwen/Qwen3.5-9B-Base`, un transformer denso de 9,4 mil millones de parámetros. El checkpoint se enmarca en la metodología OPSD (On-Policy Self-Distillation), una técnica de aprendizaje por refuerzo agéntico que entrena un único modelo como estudiante y profesor simultáneamente mediante emparejamiento de distribuciones a nivel de token. Según la model card, es el mejor checkpoint de su celda en el sweep, aunque su rol es intermedio y no constituye un modelo final listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-9B-Base, un transformer causal estándar con atención de múltiples cabezas y normalización RMSNorm, típico de la familia Qwen. El entrenamiento aplica OPSD (On-Policy Self-Distillation), una variante de aprendizaje por refuerzo agéntico que utiliza un único modelo en dos roles: como estudiante, que ve solo el problema, y como profesor, que además ve la solución de referencia. El objetivo es realizar un emparejamiento de distribuciones a nivel de token a lo largo de las trayectorias on-policy del estudiante. Este checkpoint concreto se generó a las 67,52 horas de un run de 100 horas, y su nombre indica que corresponde a la familia `opsd-self-patch-quarter`. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas adicionales como RLHF o DPO.

## Capacidades

- No se han publicado evaluaciones específicas de capacidades para este checkpoint.
- Al estar basado en Qwen3.5-9B-Base, se espera que herede las capacidades generales de ese modelo: generación de texto, razonamiento, comprensión de instrucciones y posiblemente generación de código, aunque no hay datos confirmados.
- El eos_token_id es correcto (`[248044, 248046]`), lo que garantiza que el modelo detiene la generación al final de cada turno según la plantilla de chat de Qwen3.5.
- No se ha verificado soporte para tool calling, agentes o capacidades multimodales en este checkpoint.

## Casos de uso

- Investigación en aprendizaje por refuerzo agéntico: este checkpoint sirve para estudiar la evolución del rendimiento a lo largo del tiempo de entrenamiento, comparando métricas entre diferentes horas del run.
- Reproducción de experimentos: los repositorios del sweep AgentPTB permiten replicar los resultados de la celda `sol-high` y analizar el efecto de la autodestilación on-policy.
- Desarrollo de técnicas de credit assignment: el checkpoint puede usarse como punto de partida para investigar la asignación de crédito a nivel de turno en tareas agénticas.
- Benchmarking de checkpoints intermedios: al ser el mejor de su celda, puede servir como referencia para comparar con otros checkpoints del mismo sweep.
- Fine-tuning posterior: aunque es intermedio, podría utilizarse como inicialización para entrenamientos adicionales, siempre que se respete la licencia (no especificada).
- Análisis de estabilidad del entrenamiento: la comparación de este checkpoint con otros de la misma celda permite evaluar la consistencia del proceso de optimización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 18,8 GB, lo que sugiere pesos en precisión fp16 o bf16 (9,4B parámetros × 2 bytes ≈ 18,8 GB).
- Para inferencia en fp16 se necesitaría una GPU con al menos 20 GB de VRAM, como una RTX 4090 (24 GB) o una A100 de 40 GB.
- No se han publicado cuantizaciones (GGUF, AWQ, etc.), por lo que no se puede ejecutar en GPUs de consumo con menos de 20 GB sin cuantizar manualmente.
- Opciones de despliegue: vLLM, TGI o llama.cpp (si se convierte a GGUF) son viables, aunque no hay configuraciones oficiales.
- No se dispone de datos de latencia o throughput para este checkpoint.

## Comparativa con modelos similares

No disponible. Al ser un checkpoint intermedio de un proceso de investigación, no existen modelos comparables publicados con los mismos criterios de entrenamiento. La comparación natural sería con el modelo base Qwen3.5-9B-Base, pero no se dispone de métricas de rendimiento para este checkpoint.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final; su rendimiento puede ser inferior al de un modelo entrenado por completo.
- La licencia no está especificada, por lo que el uso comercial es incierto y requiere consultar al autor.
- No hay evaluación de sesgos, alucinaciones o robustez; no es apto para producción sin una validación exhaustiva.
- El modelo está pensado para investigación en RL agéntico, no para tareas generales de generación de texto.
- La longitud de contexto no está documentada; se recomienda verificar la configuración del modelo base antes de usarlo.
- El repositorio no incluye información sobre el dataset de entrenamiento, lo que limita la reproducibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-high.h067.opsd-self-patch-quarter
- Paper AgentOPSD: https://arxiv.org/html/2608.05987
- Repositorio GitHub Agentic-OPSD: https://github.com/EcthelionLiu/Agentic-OPSD
- Paper Self-Distilled Agentic Reinforcement Learning: https://arxiv.org/abs/2605.15155
- Página de GPT-5.6 (driver del sweep): https://openai.com/index/gpt-5-6/
