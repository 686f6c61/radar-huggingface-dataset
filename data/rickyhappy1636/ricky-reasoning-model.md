# rickyhappy1636/Ricky-Reasoning-Model

## Resumen

Ricky Reasoning Model es un modelo de lenguaje bilingüe (hindi e inglés) ajustado mediante LoRA sobre Qwen/Qwen2.5-3B-Instruct, desarrollado por rickyhappy1636. Su objetivo es resolver tareas de razonamiento, matemáticas y programación con cadenas de razonamiento (Chain-of-Thought). El modelo se publica como adaptador PEFT en Hugging Face, por lo que no incluye los pesos completos del modelo base. Está pensado para entornos con recursos limitados, ya que el modelo base tiene aproximadamente 3.000 millones de parámetros.

Es relevante para aplicaciones que necesiten soporte en hindi e inglés, especialmente en educación, tutoría de matemáticas o asistentes técnicos bilingües, aprovechando la capacidad de desglosar problemas paso a paso. No se han publicado datos sobre la longitud de contexto ni evaluaciones formales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (el repositorio contiene un adaptador LoRA sobre Qwen/Qwen2.5-3B-Instruct) |
| Parámetros totales | No disponible (el modelo base Qwen2.5-3B-Instruct tiene ~3.000 millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo se publica el adaptador en safetensors; no hay pesos cuantizados) |
| Idiomas soportados | Hindi e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen2.5-3B-Instruct, aunque la información disponible no detalla la arquitectura interna. Se ha aplicado un ajuste fino con LoRA (Low-Rank Adaptation) mediante PEFT, que entrena una pequeña fracción de parámetros adicionales en lugar de los pesos completos. El entrenamiento se enfoca en tareas de razonamiento, matemáticas y código en hindi e inglés con Chain-of-Thought.

No se han publicado detalles sobre el dataset, el número de tokens, la composición de los datos ni si se emplearon técnicas como RLHF o DPO. Tampoco hay información sobre el número de pasos de entrenamiento ni los hiperparámetros utilizados.

## Capacidades

- Razonamiento paso a paso (Chain-of-Thought) en hindi e inglés.
- Resolución de problemas matemáticos con explicaciones en ambos idiomas.
- Generación de código, con ejemplos como código Python para calcular porcentajes, acompañado de explicaciones en hindi.
- Generación de texto conversacional en hindi e inglés.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: limitadas a hindi e inglés según la metadata.
- No se han publicado resultados de evaluaciones formales sobre razonamiento, matemáticas o código.

## Casos de uso

- Tutoría de matemáticas en hindi: el modelo puede explicar problemas aritméticos paso a paso mediante Chain-of-Thought, lo que resulta útil para estudiantes que necesitan apoyo en su lengua materna.
- Asistente de programación bilingüe: puede generar y explicar código Python en hindi, adecuado para aulas o documentación técnica en entornos de habla hindi.
- Generación de ejercicios de razonamiento lógico: puede crear problemas de lógica y resolverlos, aprovechando su entrenamiento en CoT para mostrar el proceso.
- Soporte en aplicaciones de mensajería en hindi: puede responder consultas técnicas o matemáticas en conversaciones de chat, dado su tamaño ligero y su naturaleza bilingüe.
- Ayuda para estudiantes de inglés e hindi en áreas STEM: puede traducir y resolver problemas entre ambos idiomas, sirviendo como herramienta de aprendizaje en contextos educativos.
- Prototipado rápido en entornos con poca VRAM: al ser un adaptador sobre un modelo de 3B, puede desplegarse en GPUs de consumo para validar aplicaciones de razonamiento sin necesidad de infraestructura costosa.
- Análisis de errores en código sencillo: aunque no se especifica soporte de tool calling, puede generar explicaciones de código o identificar errores lógicos en ejemplos básicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA añade una fracción mínima; el modelo base Qwen2.5-3B-Instruct en FP16 requiere aproximadamente 6 GB de VRAM para inferencia, más overhead de KV-cache y tokenizer. En cuantización INT8 o INT4, podría reducirse a 3-4 GB, pero el repositorio no incluye pesos cuantizados.
- GPU recomendadas: tarjetas de consumo como RTX 3060 12GB o RTX 4060 8GB son suficientes; en servidores, una A100 o H100 es más que suficiente para este tamaño.
- Despliegue: se puede utilizar con Transformers y PEFT directamente. También es posible usar vLLM o llama.cpp si se fusionan los pesos del adaptador con el modelo base, aunque no se proporcionan pesos fusionados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Ricky Reasoning Model | No disponible (base ~3B) | No disponible | Apache 2.0 | Safetensors (adaptador LoRA) |
| Qwen2.5-3B-Instruct | ~3.000 millones | No disponible | Apache 2.0 | Safetensors |

No se dispone de información sobre otros modelos comparables en la búsqueda realizada.

## Limitaciones y advertencias

- No hay evaluaciones publicadas; el rendimiento real en razonamiento complejo, matemáticas o programación no está verificado.
- Al ser un modelo pequeño (3B), su capacidad de razonamiento y generación de código es limitada en comparación con modelos grandes.
- El repositorio solo contiene un adaptador LoRA; requiere el modelo base Qwen/Qwen2.5-3B-Instruct y la biblioteca PEFT para funcionar correctamente.
- Posibles sesgos lingüísticos o culturales no documentados al estar entrenado principalmente en hindi e inglés.
- Riesgo de alucinación en respuestas matemáticas o de código, especialmente en problemas no triviales o con razonamiento de varios pasos.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe cumplir los términos del modelo base y de los datos de entrenamiento, que no se especifican.

## Enlaces

- HuggingFace: https://huggingface.co/rickyhappy1636/Ricky-Reasoning-Model
- Model card: https://huggingface.co/rickyhappy1636/Ricky-Reasoning-Model
