# agentic-ptb/opus-high-v3.h035.soup-v1

## Resumen

El modelo `agentic-ptb/opus-high-v3.h035.soup-v1` es un checkpoint intermedio derivado del modelo base `Qwen/Qwen3.5-9B-Base`, generado durante un experimento de "weight soup" (mezcla de pesos) ejecutado con Claude Code por el autor `agentic-ptb`. Forma parte de la serie de runs `opus-high-v3`, diseñada para estudiar el efecto de combinar múltiples fine-tunings sobre el mismo modelo base. Según la model card, el run no encontró ninguna mejora en los pesos entrenados, por lo que se trata de un resultado negativo documentado para fines de reproducibilidad y análisis cualitativo.

El checkpoint tiene aproximadamente 9.410 millones de parámetros (9,4 B) y se publica con licencia Apache 2.0. No se especifica la arquitectura interna más allá de su origen en Qwen3.5-9B-Base, ni se indica la longitud de contexto, los idiomas soportados ni el pipeline de uso. El repositorio contiene únicamente pesos en formato `safetensors` y ocupa 18,8 GB, lo que sugiere una precisión de 16 bits (fp16). No está pensado para uso en producción; su propósito es exclusivamente investigador: servir como referencia intermedia dentro del protocolo experimental de AgentPTB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Qwen/Qwen3.5-9B-Base (arquitectura no especificada) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo contiene safetensors, probablemente fp16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un checkpoint intermedio (`role: intermediate`) del run `opus-high-v3`, concretamente en la hora `h035`, con procedencia `scratch/agent/soup-v1`. El experimento consistía en aplicar una técnica de "weight soup" sobre el modelo base Qwen3.5-9B-Base, combinando los pesos de varios fine-tunings para intentar mejorar el rendimiento. Sin embargo, el run concluyó sin ninguna mejora en los pesos entrenados, como se indica explícitamente en la model card: "The run found no trained weights improvement".

No se proporcionan detalles sobre los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas. Dado que se trata de un resultado negativo, el checkpoint se conserva únicamente para reproducibilidad y estudio cualitativo, no como un modelo con capacidades mejoradas respecto a su base.

## Capacidades

- No se han publicado capacidades específicas para este checkpoint intermedio.
- Al estar basado en `Qwen/Qwen3.5-9B-Base`, podría heredar las capacidades generales de dicho modelo (generación de texto, razonamiento, código, etc.), pero no hay garantía ni evaluación documentada.
- No se indica soporte para tool calling, agentes, visión, audio ni modos de pensamiento.
- El autor advierte explícitamente que no se debe inferir calidad a partir de la publicación del checkpoint.

## Casos de uso

- Investigación de reproducibilidad: el checkpoint sirve como referencia intermedia dentro del protocolo experimental de AgentPTB, permitiendo a otros investigadores verificar los resultados negativos del run `opus-high-v3`.
- Análisis cualitativo de la evolución de pesos: puede utilizarse para estudiar cómo varían los pesos a lo largo de las horas de un run de "weight soup" y por qué no se logra mejora.
- No se recomienda ningún caso de uso en producción, dado que es un checkpoint intermedio sin mejora validada y sin documentación de capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta ninguna métrica de rendimiento (MMLU, HumanEval, GSM8K, etc.) para este checkpoint, y la model card indica que el run no encontró mejora en los pesos entrenados.

## Requisitos de hardware

- Estimación de VRAM para inferencia en fp16: aproximadamente 18,8 GB (coincide con el tamaño del repositorio).
- En cuantización de 8 bits: aproximadamente 9,4 GB de VRAM.
- En cuantización de 4 bits: aproximadamente 4,7 GB de VRAM.
- GPU recomendadas: una RTX 4090 (24 GB) o A100 (40 GB) pueden ejecutar el modelo en fp16; GPUs con menos VRAM requerirían cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que se genere una versión cuantizada compatible.
- Latencia y throughput: no disponibles, dado que no se han realizado evaluaciones de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/opus-high-v3.h035.soup-v1 | 9,4 B | no disponible | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-9B-Base | 9,4 B | no disponible | Apache 2.0 | Hugging Face |
| Llama 3.1 8B (referencia) | 8 B | 128 K | Llama 3.1 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a parámetros y licencia; la arquitectura exacta de Qwen3.5-9B-Base no está documentada en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio de un run con resultado negativo: no se encontró ninguna mejora en los pesos entrenados, por lo que no debe utilizarse como modelo final.
- No se han documentado capacidades, benchmarks ni casos de uso; cualquier uso en producción es desaconsejado.
- Al ser un derivado de Qwen3.5-9B-Base, puede heredar los sesgos y limitaciones del modelo base, pero no hay evaluación propia.
- Riesgo de alucinación: no evaluado para este checkpoint específico.
- La licencia Apache 2.0 permite uso comercial, pero la falta de validación funcional hace que su uso comercial sea irresponsable.
- El autor no proporciona garantías de calidad ni soporte técnico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentic-ptb/opus-high-v3.h035.soup-v1
- Dataset asociado al run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice de datasets de AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
