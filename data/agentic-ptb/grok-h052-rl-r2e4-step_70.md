# agentic-ptb/grok.h052.rl-r2e4.step_70

## Resumen

El modelo `agentic-ptb/grok.h052.rl-r2e4.step_70` es un checkpoint intermedio de un barrido (sweep) de entrenamiento realizado por el equipo `agentic-ptb` sobre el modelo base `Qwen/Qwen3.5-9B-Base`. Se trata de un fine-tuning de 9.409.813.744 parámetros (~9,4B) que combina fases de aprendizaje por refuerzo (RL, indicado por `rl-r2e4`) y supervisado (SFT, indicado por `sft-oh` en la model card), aunque la nomenclatura del repositorio y de la tarjeta no coinciden exactamente (el repo dice `rl-r2e4.step_70`, la card menciona `sft-oh.step_40`). El checkpoint se generó a las 52 horas de un run de 100 horas (según el ID) o a las 72,46 horas (según la card), lo que refuerza su carácter intermedio.

La relevancia de este modelo es principalmente investigadora: forma parte de un estudio sistemático sobre cómo distintos métodos de entrenamiento (RL, SFT) afectan al rendimiento de Qwen3.5-9B a lo largo del tiempo. No está pensado para uso en producción, y de hecho la propia model card advierte de un defecto en el token de fin de secuencia (`eos_token_id`) que provoca que el modelo no detenga la generación correctamente. La arquitectura es la heredada de Qwen3.5-9B-Base, un transformer denso, aunque no se especifican detalles adicionales como la longitud de contexto o el número de capas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (depende del base, no especificada) |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `Qwen/Qwen3.5-9B-Base`, un transformer denso de aproximadamente 9,4B parámetros. No se proporcionan detalles sobre la arquitectura interna (número de capas, dimensiones, atención) más allá de lo heredado del base. El entrenamiento se enmarca en un barrido de AgentPTB de 100 horas, con el checkpoint extraído a la hora 52 (según el ID) o 72,46 (según la card). El nombre del repo sugiere una fase de RL con ratio de aprendizaje 2e-4 (`rl-r2e4`) y el paso 70, mientras que la model card menciona una fase SFT con "overhang" (`sft-oh`) y el paso 40. No se indica el número de tokens de entrenamiento, la composición del dataset ni si se usaron técnicas como RLHF o DPO.

Un aspecto técnico destacable es el defecto en el `eos_token_id`: el checkpoint solo incluye el token `248044` y carece del `248046` (`<|im_end|>`), que es el token que el chat template de Qwen3.5 usa para terminar cada turno del asistente. Esto provoca que el modelo no detenga la generación al final del turno y sobrepase la ventana de contexto, lo que invalida las evaluaciones directas y obliga a re-empaquetar el modelo antes de usarlo.

## Capacidades

- Generación de texto: heredada de Qwen3.5-9B-Base, aunque no se han verificado capacidades específicas en este checkpoint.
- Razonamiento: el driver del sweep se describe como `pi / grok-4.6` con `reasoning effort xhigh`, lo que sugiere que el entrenamiento buscaba potenciar el razonamiento, pero no hay evidencia empírica en la información disponible.
- Tool calling / function calling: no confirmado; depende de las capacidades del base y del fine-tuning, pero no se menciona.
- Soporte de agentes y multi-step reasoning: no confirmado.
- Capacidades multilingües: no disponibles; el base Qwen3.5 suele ser multilingüe, pero no se especifica.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación en fine-tuning con RL: el modelo sirve como punto de comparación en estudios sobre cómo el RL afecta al rendimiento de Qwen3.5-9B a lo largo del tiempo. Se puede evaluar junto a otros checkpoints del mismo sweep para trazar curvas de rendimiento.
- Análisis de la dinámica de entrenamiento: al ser un checkpoint intermedio, permite estudiar cómo evoluciona el modelo durante el run de 100 horas, por ejemplo, midiendo la pérdida o la calidad de las respuestas en diferentes etapas.
- Reproducción de experimentos: investigadores pueden re-empaquetar el modelo (corrigiendo el `eos_token_id`) y reproducir los resultados del sweep para validar metodologías.
- Pruebas de estabilidad de generación: el defecto de `eos` lo convierte en un caso de estudio para evaluar cómo afecta la ausencia de un token de fin de secuencia a la generación larga.
- Benchmarking de infraestructura: al ser un modelo de 9,4B en safetensors, puede usarse para medir throughput y latencia en diferentes stacks de inferencia (vLLM, TGI) sin necesidad de un modelo final pulido.
- Exploración de técnicas de alineación: si el RL se usó para alinear el modelo, este checkpoint puede compararse con versiones SFT para estudiar el impacto del refuerzo en la calidad de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente de que las evaluaciones de este checkpoint son un "suelo, no una medición" debido al defecto de `eos`, por lo que cualquier número reportado sin corregir el token sería engañoso. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otros.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo pesa 18,8 GB en safetensors (presumiblemente en bf16/fp16). Para inferencia en precisión nativa se necesitan al menos 20 GB de VRAM, lo que encaja en GPUs de 24 GB como la RTX 3090, RTX 4090, A10 o L4.
- GPU recomendadas: RTX 3090/4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para mayor margen y velocidad.
- En consumer GPU: sí, cabe en GPUs de 24 GB, pero con limitaciones de batch size. Con cuantización (por ejemplo, 8 bits o 4 bits) podría ejecutarse en GPUs de 16 GB, aunque no se proporcionan archivos GGUF ni AWQ en el repo.
- Opciones de despliegue: vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta). Dado que es un fine-tune de Qwen3.5, debería ser compatible con los runners que soporten ese base.
- Latencia y throughput: no disponibles. Para un modelo de 9,4B en una GPU de 24 GB, se puede esperar un throughput de decenas de tokens por segundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| agentic-ptb/grok.h052.rl-r2e4.step_70 | 9,4B | No disponible | No disponible | Checkpoint intermedio, defecto de eos |
| Qwen/Qwen3.5-9B-Base | 9,4B | No disponible (típico 32k en Qwen3) | No disponible | Modelo base, sin fine-tuning |
| Otros fine-tunes de Qwen3.5-9B | 9,4B | Variable | Variable | Depende del autor |

No se dispone de datos de rendimiento para comparar objetivamente. La comparativa se limita a parámetros y disponibilidad. No hay modelos comparables con métricas publicadas en la información proporcionada.

## Limitaciones y advertencias

- Defecto crítico de `eos_token_id`: falta el token `248046` (`<|im_end|>`), lo que provoca que el modelo no termine los turnos correctamente y sobrepase la ventana de contexto. Cualquier uso requiere re-empaquetar el modelo y añadir el token faltante.
- Checkpoint intermedio: no es un modelo final; su rendimiento puede ser inferior al de checkpoints posteriores del mismo run.
- Licencia no disponible: no se puede determinar si es de código abierto, si permite uso comercial o si tiene restricciones. Esto bloquea su uso en producción sin asesoría legal.
- Sin benchmarks publicados: no hay evidencia de calidad más allá de lo que se pueda evaluar manualmente.
- Sesgos y alucinaciones: no se han evaluado; al ser un fine-tune de Qwen3.5, puede heredar sesgos del base, pero no hay datos.
- Información inconsistente: la model card menciona un checkpoint distinto (`h072.sft-oh.step_40`) al del repo (`h052.rl-r2e4.step_70`), lo que genera incertidumbre sobre qué configuración exacta se está descargando.
- Sin soporte de cuantización oficial: solo safetensors, sin GGUF ni AWQ, lo que limita el despliegue en entornos con poca VRAM.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/grok.h052.rl-r2e4.step_70
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base (referencia, no verificado)
- No se proporcionan otros enlaces (papers, blogs, demos) en la información disponible.
