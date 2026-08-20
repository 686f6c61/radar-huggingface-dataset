# agentic-ptb/sol-high.h045.opd-selected-lite-bridge.step_1

## Resumen

Este modelo es un checkpoint intermedio del barrido de entrenamiento AgentPTB, perteneciente a la celda `sol-high` y registrado en la hora 45.28 de un run de 100 horas. Está basado en Qwen/Qwen3.5-9B-Base y se ha entrenado mediante destilación on-policy (OPD, on-policy distillation) usando como profesor el modelo Codex / GPT-5.6-sol con esfuerzo de razonamiento alto. La técnica OPD busca reducir la brecha de distribución entre entrenamiento e inferencia en tareas agénticas multi-turno con llamadas a herramientas, donde las desviaciones del estudiante se acumulan y degradan la calidad de la supervisión.

Con 9.409.813.744 parámetros (~9,4B) y 18,8 GB en formato safetensors, este checkpoint es un punto intermedio del run, no un modelo final. El autor lo señala como la mejor celda del barrido y confirma que el `eos_token_id` está correctamente configurado con `[248044, 248046]`, donde `248046` es `<|im_end|>`, lo que garantiza que el modelo detiene la generación al final de cada turno sin desbordar la ventana de contexto. El identificador del repo codifica la hora de escritura (`h045`), lo que permite situarlo directamente sobre la curva de rendimiento temporal del sweep.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3.5-9B-Base) |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18.8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen/Qwen3.5-9B-Base, un transformer decoder-only de aproximadamente 9,4 mil millones de parámetros. El entrenamiento utiliza la técnica de destilación on-policy (OPD), en la que un profesor (Codex / GPT-5.6-sol con esfuerzo de razonamiento alto) proporciona supervisión sobre los estados que el estudiante realmente visita durante la inferencia, en lugar de estados de una trayectoria prefijada. Esto reduce la brecha de distribución entre entrenamiento e inferencia, un problema crítico en tareas agénticas multi-turno donde las llamadas a herramientas pueden provocar fallos en cascada y divergencias paso a paso.

El checkpoint se escribió en la hora 45.28 de un run de 100 horas y corresponde al paso `step_1` de la familia `opd-selected-lite-bridge`. El `eos_token_id` está correctamente configurado con `[248044, 248046]`, donde `248046` es el token `<|im_end|>` del template de chat de Qwen3.5, lo que evita que el modelo continúe generando más allá del final del turno y desborde la ventana de contexto.

## Capacidades

- Razonamiento agéntico con integración de herramientas (tool-integrated reasoning, TIR): entrenado específicamente para escenarios multi-turno con llamadas a herramientas.
- Generación de texto en formato chat con el template de Qwen3.5, incluyendo delimitadores de turno correctos.
- Detención de generación al final de turno gracias al `eos_token_id` correctamente configurado.
- Capacidad de seguimiento de conversaciones multi-turno con contexto de herramientas, gracias al entrenamiento OPD que adapta la supervisión a los estados reales visitados.
- Hereda las capacidades de razonamiento del modelo base Qwen3.5-9B-Base, aunque no se han documentado específicamente las capacidades adicionales más allá de lo indicado en el modelo card.
- No se ha especificado si el modelo soporta vision, audio u otras modalidades adicionales.

## Casos de uso

- Evaluación de métodos de destilación onínica (OPD): este checkpoint permite estudiar cómo evoluciona el rendimiento del modelo a lo largo del run de 100 horas, comparándolo con otros checkpoints de la misma celda o de otras celdas del sweep.
- Investigación sobre agentes con herramientas: el modelo está entrenado para tareas TIR, por lo que puede utilizarse como punto de partida para experimentos con agentes que realizan llamadas a herramientas en múltiples turnos.
- Análisis de la influencia del esfuerzo de razonamiento del profesor: al ser la celda `sol-high` (profesor con esfuerzo alto), puede compararse con celdas de menor esfuerzo para medir el impacto de la supervisión.
- Validación de la configuración de tokens de fin de secuencia: sirve como referencia para verificar que un checkpoint detiene correctamente la generación y no desborda la ventana de contexto.
- Re-empaquetado para evaluación: el autor recomienda re-empaquetar el checkpoint antes de evaluarlo, por lo que puede usarse como punto de partida para pipelines de evaluación personalizados.
- Análisis de la curva de rendimiento temporal: al estar alineado con el eje temporal del sweep, permite estudiar la progresión del rendimiento del modelo durante las 100 horas de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El tamaño del repo es de 18.8 GB en safetensors, lo que sugiere que se necesitan al menos 19-20 GB de VRAM para cargar el modelo completo sin cuantización.
- GPU recomendadas: para el modelo completo (18.8 GB), se requieren GPU con 24 GB o más de VRAM, como RTX 3090, RTX 4090, A100 40GB o H100. Con cuantización (p. ej., GGUF Q4_K_M) podría caber en GPU de 8-12 GB, pero no se dispone de datos de cuantización.
- Opciones de despliegue: no especificadas en la información disponible. Sería plausible usar vLLM, llama.cpp, Ollama o TGI, pero no hay confirmación oficial.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. El modelo es un fine-tune de Qwen/Qwen3.5-9B-Base, por lo que la comparación natural sería con el propio modelo base y con otros fine-tunes del mismo, pero no se han publicado resultados de rendimiento para establecer una comparativa.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final: no representa el rendimiento óptimo del entrenamiento, que continuaría hasta la hora 100.
- Licencia no especificada: no se indica la licencia del modelo, lo que impide verificar si su uso comercial está permitido.
- Idiomas no documentados: no se ha especificado qué idiomas soporta el modelo, aunque al estar basado en Qwen3.5 es probable que soporte múltiples idiomas.
- Longitud de contexto no documentada: no se indica la ventana de contexto del modelo base ni del fine-tune.
- Riesgo de alucinación: al ser un modelo de lenguaje basado en Qwen3.5, mantiene los riesgos inherentes de generación de contenido no factual.
- Dependencia del profesor: el rendimiento depende de la calidad de la supervisión del profesor Codex / GPT-5.6-sol y de las características del dataset de entrenamiento, que no se han documentado.
- El autor recomienda re-empaquetar antes de evaluar: los números de evaluación de checkpoints sin el `eos_token_id` correcto son un suelo, no una medida real.

## Enlaces

- [HuggingFace: agentic-ptb/sol-high.h045.opd-selected-lite-bridge.step_1](https://huggingface.co/agentic-ptb/sol-high.h045.opd-selected-lite-bridge.step_1)
- [Sol-HQ/agentic-library (GitHub)](https://github.com/Sol-HQ/agentic-library)
- [EasyOPD: experimentos de agentic OPD (GitHub)](https://github.com/lds-ustc/EasyOPD/blob/main/experiments/02_agentic_opd/README.md)
- [Paper: Look Ahead Before You Distill: Future Trajectory (arXiv)](https://arxiv.org/abs/2608.01953)
- [GPT-5.6: página oficial de OpenAI](https://openai.com/index/gpt-5-6/)
