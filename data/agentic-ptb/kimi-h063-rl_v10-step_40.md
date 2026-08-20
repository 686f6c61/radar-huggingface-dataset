# agentic-ptb/kimi.h063.rl_v10.step_40

## Resumen

Este repositorio contiene un checkpoint intermedio de un experimento de aprendizaje por refuerzo (RL) perteneciente al barrido de hiperparámetros AgentPTB. El identificador `kimi.h063.rl_v10.step_40` indica que es la celda de experimento `kimi`, escrita a la hora 63,81 de una ejecución de 100 horas, en el paso 40 del run `rl_v10`. El modelo base es `Qwen/Qwen3.5-9B-Base`, un transformer denso de 9.400 millones de parámetros, y el checkpoint se publica en formato safetensors con un peso total de 18,8 GB.

El propósito de este checkpoint es servir como punto de control intermedio para trazar la evolución del rendimiento a lo largo del tiempo dentro del barrido. No es un modelo final listo para producción: la propia model card advierte que le falta el token `eos` `248046` (`<|im_end|>`), por lo que las evaluaciones numéricas deben interpretarse como un límite inferior y no como una medición fiable. Su relevancia actual es principalmente investigadora, para estudiar dinámicas de RL y comparar checkpoints dentro de la misma familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-9B-Base, un transformer denso de 9.400 millones de parámetros. No se especifican detalles adicionales sobre la arquitectura interna (número de capas, heads, etc.) en la información disponible. El entrenamiento corresponde a un paso intermedio de un pipeline de RL (run `rl_v10`) dentro del barrido AgentPTB, con un "driver" denominado `kimi-code / kimi-k3` y un esfuerzo de razonamiento configurado en `high`. No se detalla el algoritmo de RL concreto (PPO, GRPO, etc.) ni la composición del dataset de entrenamiento. El checkpoint se guarda en el paso 40 de la ejecución, a las 63,81 horas de un total de 100.

Un aspecto técnico crítico es la ausencia del token `eos` `248046` (`<|im_end|>`), que el template de chat de Qwen3.5 utiliza para finalizar cada turno del asistente. Sin este token, el modelo no detiene la generación al final del turno y puede sobrepasar la ventana de contexto, lo que invalida las métricas de evaluación como mediciones absolutas.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3.5-9B-Base, hereda las capacidades generales de ese modelo, aunque no se han verificado en este checkpoint concreto.
- Razonamiento de alto esfuerzo: el run está configurado con `reasoning effort: high`, lo que sugiere que el entrenamiento por RL busca mejorar la cadena de razonamiento.
- Capacidades de código: el driver `kimi-code` apunta a un enfoque orientado a tareas de programación, aunque no hay evidencia directa en este checkpoint.
- No se dispone de información sobre tool calling, visión, audio u otras capacidades especiales.

## Casos de uso

- Investigación en dinámicas de RL: este checkpoint permite estudiar cómo evoluciona el rendimiento a lo largo del tiempo dentro de un barrido, comparándolo con otros checkpoints de la misma celda o de celdas vecinas.
- Análisis de curvas de aprendizaje: al mapear directamente sobre el eje temporal de las figuras del barrido, es útil para trazar la relación entre horas de entrenamiento y métricas de evaluación.
- Reproducción de experimentos: investigadores que quieran replicar o extender el barrido AgentPTB pueden usar este checkpoint como referencia intermedia.
- Estudio de efectos de token eos: la ausencia del token `248046` permite investigar cómo afecta la terminación de secuencia al rendimiento en tareas de generación.
- Desarrollo de técnicas de empaquetado: la model card sugiere re-empaquetar el checkpoint antes de evaluarlo; este caso de uso es relevante para quienes trabajan en pipelines de evaluación.
- Comparación de checkpoints: sirve como punto de comparación con otros pasos del mismo run (por ejemplo, step_20 o step_60) para medir la progresión del RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente que, debido al token eos faltante, cualquier número de evaluación debe considerarse un límite inferior y no una medición fiable. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otros.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.400 millones de parámetros en fp16, se necesitan aproximadamente 18,8 GB de VRAM para cargar los pesos completos. Con cuantización a 8 bits, unos 9,4 GB; a 4 bits, unos 4,7 GB (valores orientativos, no confirmados para este checkpoint concreto).
- GPU recomendadas: una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G) para inferencia en fp16 sin cuantizar. Para cuantización 4 bits, una GPU de 8-12 GB (RTX 3060, RTX 4070) podría ser suficiente.
- En consumer GPU: sí, es factible con cuantización, aunque el checkpoint no incluye archivos GGUF ni cuantizados; habría que convertirlos.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI pueden servir, pero requieren conversión previa a formatos compatibles (GGUF, etc.). No se proporcionan configuraciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen/Qwen3.5-9B-Base (modelo base) | 9,4B | no disponible | no disponible | HuggingFace |
| agentic-ptb/kimi.h063.rl_v10.step_40 (este) | 9,4B | no disponible | no disponible | HuggingFace |
| Kimi K3 (de Moonshot AI, mencionado en búsquedas) | 2,8T | 1M tokens | no disponible | no disponible |

La comparación con Kimi K3 es solo nominal: el nombre "kimi" en este checkpoint hace referencia a la celda del barrido, no al modelo Kimi K3 de Moonshot AI. No hay relación técnica entre ambos. No se dispone de otros modelos comparables de 9B con los que contrastar rendimiento.

## Limitaciones y advertencias

- Token eos faltante: el checkpoint no incluye el token `248046` (`<|im_end|>`), por lo que la generación no se detiene correctamente al final del turno y puede sobrepasar la ventana de contexto. Cualquier evaluación numérica es un límite inferior, no una medición fiable.
- Checkpoint intermedio: no es un modelo final; forma parte de un barrido experimental y su rendimiento puede ser inferior al de checkpoints posteriores.
- Licencia no especificada: no se indica licencia, lo que impide conocer las restricciones de uso comercial o redistribución.
- Idiomas no especificados: se desconoce el soporte multilingüe real de este checkpoint.
- Sin benchmarks publicados: no hay datos objetivos de rendimiento en tareas estándar.
- Riesgo de alucinación y sesgos: al ser un modelo derivado de Qwen3.5-9B-Base, puede heredar sesgos del modelo base, pero no hay información específica para este checkpoint.
- No apto para producción: por su naturaleza intermedia y la falta de token eos, no debe usarse en aplicaciones reales sin un re-empaquetado y evaluación exhaustiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/kimi.h063.rl_v10.step_40
- Modelo base Qwen3.5-9B-Base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Página de Kimi AI (referencia al nombre, no al modelo): https://www.kimi.com/en
- Documentación de Kimi K3 (sin relación directa): https://platform.kimi.ai/docs/guide/kimi-k3-quickstart
- Página de Kimi K3 en LM Studio (sin relación directa): https://lmstudio.ai/models/kimi-k3
- Organización Moonshot AI en HuggingFace: https://huggingface.co/moonshotai
