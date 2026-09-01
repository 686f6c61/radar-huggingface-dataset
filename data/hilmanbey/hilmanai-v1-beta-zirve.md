# HilmanBey/HilmanAI-V1-Beta-Zirve

## Resumen

HilmanAI-V1-Beta-Zirve es un modelo de lenguaje fine-tuneado por el desarrollador HilmanBey a partir de DeepSeek-R1-Distill-Qwen-7B-unsloth-bnb-4bit, una versión destilada del modelo DeepSeek-R1 sobre la arquitectura Qwen2 de 7.000 millones de parámetros. El fine-tuning se realizó con las librerías Unsloth y TRL, lo que permitió un entrenamiento acelerado. El modelo está pensado para generación de texto en inglés y se distribuye bajo licencia Apache 2.0.

A día de hoy, la información pública disponible es muy limitada: la model card apenas contiene metadatos técnicos y no se han publicado ejemplos de uso, benchmarks ni documentación adicional. El repositorio tiene un tamaño de 0,3 GB, lo que sugiere una cuantización de 4 bits (como la del modelo base), pero no se especifica el formato exacto de los pesos finales.

Su relevancia actual es menor dentro del ecosistema open source, ya que se trata de un modelo experimental sin validación externa ni comunidad activa. No obstante, puede servir como punto de partida para desarrolladores interesados en explorar fine-tunings de DeepSeek-R1 sobre Qwen2 con herramientas como Unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformers) |
| Parametros totales | no disponible (base: 7.000 millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (base: bnb-4bit) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención de múltiples cabezas y normalización RMSNorm. El modelo base, DeepSeek-R1-Distill-Qwen-7B, es una destilación de DeepSeek-R1 sobre Qwen2-7B, diseñado para razonamiento y generación de texto. El fine-tuning se realizó con Unsloth, una librería que optimiza el entrenamiento mediante kernels y técnicas de cuantización, y con TRL (Transformers Reinforcement Learning) para el ajuste supervisado.

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens, ni si se emplearon técnicas como RLHF o DPO. El repositorio solo indica que fue entrenado "2x faster" con Unsloth, sin más especificaciones.

## Capacidades

No se dispone de información pública sobre las capacidades específicas del modelo. Dado que es un fine-tune de DeepSeek-R1-Distill-Qwen-7B, es probable que conserve las capacidades de razonamiento y generación de texto del modelo base, pero no hay evidencia documentada. No se mencionan capacidades de tool calling, agentes, visión o audio.

## Casos de uso

No se han documentado casos de uso concretos. Al tratarse de un modelo experimental sin documentación, no es recomendable su uso en producción sin una evaluación previa. Los desarrolladores podrían explorar su comportamiento en tareas de generación de texto, pero no hay garantías de calidad ni soporte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No hay información oficial sobre requisitos de hardware. Basándose en el tamaño del repositorio (0,3 GB) y en que el modelo base es una versión cuantizada a 4 bits de un modelo de 7.000 millones de parámetros, se estima que la inferencia podría ejecutarse en GPU con al menos 6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060). Sin embargo, esta estimación es especulativa y depende de la cuantización final y del framework utilizado.

Opciones de despliegue: al estar basado en transformers, puede servirse con vLLM, TGI o llama.cpp si se convierte a GGUF. No hay guías oficiales.

## Comparativa con modelos similares

Dado que no hay datos de rendimiento ni especificaciones completas, la comparativa se limita a aspectos estructurales con modelos de la misma familia:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| HilmanAI-V1-Beta-Zirve | 7B (base) | no disponible | Apache 2.0 | HuggingFace |
| DeepSeek-R1-Distill-Qwen-7B | 7B | 32k (según documentación oficial) | MIT | HuggingFace |
| Qwen2-7B | 7B | 32k | Apache 2.0 | HuggingFace |

El modelo base tiene una ventana de contexto de 32k tokens y licencia MIT, mientras que HilmanAI hereda Apache 2.0. No se puede evaluar el rendimiento relativo sin benchmarks.

## Limitaciones y advertencias

- No hay documentación sobre sesgos, alucinaciones o limitaciones de contexto.
- Al ser un fine-tune sin validación externa, el riesgo de alucinación y errores es alto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no ofrece garantías de calidad.
- El modelo solo declara soporte para inglés; su comportamiento en otros idiomas es desconocido.
- No se recomienda su uso en entornos críticos sin una evaluación rigurosa previa.

## Enlaces

- [HuggingFace - HilmanAI-V1-Beta-Zirve](https://huggingface.co/HilmanBey/HilmanAI-V1-Beta-Zirve)
- [Perfil del autor en HuggingFace](https://huggingface.co/HilmanBey)
- [Repositorio de modelos del autor](https://huggingface.co/HilmanBey/models)
- [Perfil de GitHub del autor](https://github.com/HilmanBey1)
- [Repositorio hilman-ai-api (no oficial)](https://github.com/halildokgoxx-ops/hilman-ai-api)
