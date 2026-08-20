# agentic-ptb/kimi.h059.rl_v10.step_10

## Resumen

Este repositorio contiene un checkpoint intermedio del sweep de entrenamiento con refuerzo (RL) del proyecto AgentPTB, identificado como `kimi.h059.rl_v10.step_10`. Se trata de un modelo de 9.409.813.744 parámetros (~9,4B) basado en `Qwen/Qwen3.5-9B-Base`, que ha sido sometido a un proceso de optimización por aprendizaje por refuerzo (RL) en su versión `v10`. El nombre "kimi" corresponde a una celda experimental del sweep, no al modelo Kimi de Moonshot AI, aunque el driver interno se denomina `kimi-code / kimi-k3` con un esfuerzo de razonamiento alto (`high`).

El checkpoint se publica como parte de un estudio de dinámica de entrenamiento: el identificador `h059` indica la hora del run de 100 horas en la que se guardó, lo que permite situarlo en la curva de rendimiento temporal. Es un checkpoint intermedio, no un modelo final, y presenta una advertencia crítica: le falta el token `eos_token_id` `248046` (`<|im_end|>`), lo que provoca que el modelo no detenga correctamente las respuestas y pueda desbordar la ventana de contexto. Por tanto, cualquier evaluación sobre este checkpoint debe interpretarse como un límite inferior, no como una medición real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base, presumiblemente 32K o 128K, sin confirmar) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible (heredados del base, presumiblemente multilingüe) |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18.8 GB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B-Base`, una arquitectura transformer densa de 9B parámetros. Sobre esta base, el proyecto AgentPTB aplica un pipeline de aprendizaje por refuerzo (RL) denominado `rl_v10`, que utiliza como driver un agente de código (`kimi-code / kimi-k3`) con un nivel de esfuerzo de razonamiento alto. El checkpoint corresponde al paso 10 del run (aunque la model card interna menciona step_40, el ID del repositorio indica step_10; se toma el ID como referencia). No se especifican los datos de entrenamiento, el número de tokens, ni si se emplearon técnicas como RLHF o DPO. La única innovación destacable es el propio esquema de RL del sweep, pero no se documentan detalles técnicos adicionales.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3.5-9B-Base, conserva las capacidades generales de dicho modelo, aunque el entrenamiento RL puede haber modificado su comportamiento.
- Razonamiento multi-step: el driver `kimi-k3` con esfuerzo `high` sugiere que el entrenamiento se orienta a tareas de razonamiento complejo, pero no hay evidencia publicada de ello.
- Tool calling / function calling: no confirmado; depende del base y del entrenamiento RL.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales: ninguna documentada. El checkpoint no es multimodal ni tiene modo thinking explícito.

## Casos de uso

- Investigación en dinámica de entrenamiento RL: este checkpoint es útil para estudiar cómo evoluciona el rendimiento a lo largo de un run de 100 horas, comparándolo con otros checkpoints del mismo sweep (misma celda, diferentes horas).
- Análisis de la influencia del token EOS en la generación: el defecto conocido (falta de `248046`) permite investigar cómo afecta la ausencia de un token de fin de turno a la longitud de las respuestas y al desbordamiento de contexto.
- Benchmarking de checkpoints intermedios: para equipos que desarrollan pipelines de RL, este checkpoint sirve como referencia de un punto temprano del entrenamiento (hora 59 de 100) y puede compararse con checkpoints posteriores.
- Reproducción de experimentos: si se dispone del código del sweep AgentPTB, este checkpoint permite reproducir o validar resultados de la curva de rendimiento.
- Desarrollo de técnicas de reparación de modelos: dado el problema de EOS, se puede usar para probar métodos de re-empaquetado o parcheo de tokens.
- No recomendado para producción: por su naturaleza intermedia y el defecto de EOS, no es adecuado para aplicaciones reales sin un post-procesado significativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente de que las evaluaciones de este checkpoint son un "floor" (límite inferior) debido al token EOS faltante, por lo que cualquier número reportado sería engañoso. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otros.

## Requisitos de hardware

- VRAM estimada: para inferencia en precisión FP16, un modelo de 9,4B parámetros requiere aproximadamente 19-20 GB de VRAM (considerando pesos y overhead). Con cuantización a 8 bits, ~10 GB; a 4 bits, ~5-6 GB, pero no se ofrecen cuantizaciones oficiales.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) puede ejecutarlo en FP16; una A100 40GB o H100 son adecuadas para mayor margen. En consumer, una RTX 3090 o 4090 son viables.
- Opciones de despliegue: al ser safetensors, se puede cargar con transformers, vLLM, TGI o llama.cpp (si se convierte a GGUF). No hay integraciones oficiales.
- Latencia y throughput: no disponibles. Dependerá del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/kimi.h059.rl_v10.step_10 | 9,4B | no disponible | no disponible | HuggingFace (checkpoint intermedio) |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible (presumiblemente 32K o 128K) | Apache 2.0 (presumible) | HuggingFace |
| Llama-3.1-8B | 8B | 128K | Llama 3.1 Community License | HuggingFace |
| Mistral-7B-v0.3 | 7B | 32K | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativos. La comparativa se limita a especificaciones básicas. Este checkpoint no es un modelo final y no debe equipararse a los modelos Kimi de Moonshot AI (K2, K2.5, K3), que son arquitecturas MoE de mayor escala y con licencias propias.

## Limitaciones y advertencias

- Token EOS faltante: el checkpoint no incluye el token `248046` (`<|im_end|>`), por lo que el modelo no detiene las respuestas al final del turno y puede desbordar la ventana de contexto. Cualquier evaluación es un límite inferior, no una medición real.
- Checkpoint intermedio: no es un modelo final; forma parte de un sweep de RL y su rendimiento puede ser inferior al de checkpoints posteriores del mismo run.
- Licencia no especificada: no se indica la licencia, lo que impide conocer las restricciones de uso comercial o modificación.
- Idiomas no documentados: aunque el base Qwen3.5 es multilingüe, no se confirma qué idiomas conserva tras el entrenamiento RL.
- Riesgo de alucinación: no se ha evaluado; al ser un modelo de 9B entrenado con RL, puede presentar alucinaciones, especialmente en tareas de razonamiento complejo.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estándar.
- Confusión potencial con Kimi de Moonshot: el nombre "kimi" en el repo no corresponde al modelo Kimi de Moonshot AI; es una etiqueta interna del sweep AgentPTB.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/kimi.h059.rl_v10.step_10
- Modelo base Qwen3.5-9B-Base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Página de Kimi (Moonshot AI, no relacionada directamente): https://www.kimi.com/en
- GitHub de Kimi-K2.5 (Moonshot AI, no relacionado): https://github.com/MoonshotAI/Kimi-K2.5
- Documentación de Kimi K3 (Moonshot AI, no relacionado): https://platform.kimi.ai/docs/guide/kimi-k3-quickstart
