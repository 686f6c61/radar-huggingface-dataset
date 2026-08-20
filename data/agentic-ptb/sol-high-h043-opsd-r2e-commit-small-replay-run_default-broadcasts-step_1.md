# agentic-ptb/sol-high.h043.opsd-r2e-commit-small-replay.run_default.broadcasts.step_1

## Resumen

El repositorio `agentic-ptb/sol-high.h043.opsd-r2e-commit-small-replay.run_default.broadcasts.step_1` contiene un checkpoint intermedio de un sweep de entrenamiento agéntico (AgentPTB) sobre el modelo base `Qwen/Qwen3.5-9B-Base`. El nombre del repositorio indica que pertenece a la celda `sol-high` (conductor Codex / gpt-5.6-sol, esfuerzo de razonamiento alto) y que fue guardado a la hora 43 de un run de 100 horas. Se trata de un experimento de investigación para estudiar la dinámica de entrenamiento mediante On-Policy Self-Distillation (OPSD), un método de auto-destilación en el que el modelo actúa simultáneamente como estudiante y profesor.

El modelo es un fine-tune de un transformer decoder-only de aproximadamente 9.4 mil millones de parámetros, en formato safetensors. Su relevancia es principalmente metodológica: permite analizar la evolución de las capacidades del modelo a lo largo del entrenamiento y comparar checkpoints de diferentes celdas del sweep. No está destinado a uso en producción, ya que carece del token EOS (`<|im_end|>`), lo que provoca que las generaciones se extiendan más allá del contexto y no se detengan correctamente al final de un turno.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3.5-9B-Base) |
| Parámetros totales | 9.409.813.744 (~9.4B) |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3.5-9B-Base no está documentado en esta ficha) |
| Tipos de cuantización | No disponible (solo safetensors de precisión fp16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la licencia del modelo base Qwen no se especifica en el repo) |
| Formato de pesos | safetensors (4 shards, 18.8 GB) |

## Arquitectura y entrenamiento

El checkpoint es un fine-tune del modelo `Qwen/Qwen3.5-9B-Base` (también etiquetado como `base_model:finetune:Qwen/Qwen3.5-9B-Base`). El entrenamiento sigue el esquema OPSD (On-Policy Self-Distillation), descrito en el repositorio asociado [Agentic-OPSD](https://github.com/EcthelionLiu/Agentic-OPSD): el modelo se entrena para actuar como estudiante (viendo solo el problema) y como profesor (viendo además la solución de referencia), realizando un ajuste de distribución a nivel de token a lo largo de las propias trayectorias on-policy. Esto permite una mejora de eficiencia de 8-12 veces en comparación con métodos tradicionales de destilación.

El checkpoint pertenece a un run de 100 horas con un rol intermedio (`h43.29` de 100). No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicó RLHF o DPO adicional. Tampoco se indica ninguna innovación técnica más allá del método OPSD.

## Capacidades

No se ha publicado información específica sobre las capacidades de este checkpoint. Al ser un fine-tune del modelo base Qwen3.5-9B-Base, es razonable suponer que hereda sus capacidades generales (generación de texto, razonamiento, código, etc.), pero no hay datos confirmados en el repositorio. Además, la ausencia del token EOS invalida su uso directo para tareas de generación conversacional o de agente.

- No se documentan capacidades de tool calling, agentes o razonamiento multi-paso.
- No se especifica soporte multilingüe.
- No se indica ninguna capacidad especial (visión, audio, etc.).

## Casos de uso

Este checkpoint no está recomendado para aplicaciones prácticas. Su naturaleza es experimental y carece del token EOS, lo que lo hace inadecuado para inferencia normal. Los únicos usos plausibles son:

- Investigación en métodos de auto-destilación: analizar la evolución de las representaciones internas y las habilidades emergentes a lo largo de las horas de entrenamiento.
- Comparación de checkpoints dentro del mismo sweep: estudiar cómo varía el rendimiento en función del tiempo de entrenamiento (eje `t_h`).
- Reproducción de experimentos de Agentic-OPSD: para validar o extender los resultados del paper.
- Análisis de la falta de token EOS: como caso de estudio de cómo la ausencia de este token afecta al comportamiento de generación.
- No se recomienda su uso en ningún pipeline de producción, ni siquiera para experimentos de investigación sin re-empacado previo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte que al faltar el token EOS, cualquier evaluación sería un "suelo" (floor) y no una medición fiable, por lo que no se pueden comparar los resultados con otros modelos.

## Requisitos de hardware

- VRAM estimada: no se especifica oficialmente. Dado que el repositorio contiene 18.8 GB en fp32 (4 shards), se estima que la inferencia en fp32 requeriría al menos 20-24 GB de VRAM; en fp16, ~9.4 GB. Sin embargo, estos valores son orientativos y no confirmados.
- GPU recomendadas: no disponible.
- Si cabe en GPU consumer: no confirmado. Un modelo de 9.4B en fp16 puede ejecutarse en tarjetas con 24 GB (p. ej., RTX 4090), pero no hay garantías.
- Opciones de despliegue: no se mencionan. Por ser un checkpoint sin EOS, no se recomienda usar con vLLM, llama.cpp, Ollama o TGI sin un pre-procesamiento previo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información para comparar este checkpoint con otros modelos. Es un artefacto intermedio de un experimento de investigación, no un modelo final. La única comparación posible sería con el modelo base `Qwen/Qwen3.5-9B-Base`, pero no se tienen datos de rendimiento de ninguno de los dos.

## Limitaciones y advertencias

- Falta el token EOS (`<|im_end|>`): el modelo no detiene la generación al final del turno, por lo que se extiende hasta el límite de contexto, invalidando cualquier evaluación o uso práctico.
- Es un checkpoint intermedio (hora 43 de 100), no un modelo final; puede tener un rendimiento inferior al de los checkpoints posteriores del mismo sweep.
- No se dispone de licencia especificada; el uso comercial podría estar sujeto a la licencia del modelo base Qwen, que no se indica en el repositorio.
- No hay evaluación de sesgos, alucinación o robustez.
- El repositorio no ofrece idiomas soportados ni detalles del dataset, por lo que se desconocen las limitaciones lingüísticas.
- No está optimizado para inferencia: no hay cuantizaciones, ni integraciones con frameworks de servido.

## Enlaces

- Repositorio Hugging Face: [agentic-ptb/sol-high.h043.opsd-r2e-commit-small-replay.run_default.broadcasts.step_1](https://huggingface.co/agentic-ptb/sol-high.h043.opsd-r2e-commit-small-replay.run_default.broadcasts.step_1)
- GitHub Agentic-OPSD (método de entrenamiento): https://github.com/EcthelionLiu/Agentic-OPSD
- Índice de checkpoints del sweep: no disponible en la información proporcionada.
