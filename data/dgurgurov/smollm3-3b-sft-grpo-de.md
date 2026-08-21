# DGurgurov/SmolLM3-3B-SFT-GRPO-DE

## Resumen

SmolLM3-3B-SFT-GRPO-DE es un modelo de lenguaje especializado en razonamiento en alemán, resultado de la segunda etapa del pipeline de adaptación de razonamiento ReasonXL aplicado sobre el modelo base HuggingFaceTB/SmolLM3-3B. El modelo fue desarrollado por Daniil Gurgurov y colaboradores, y su objetivo es mantener la calidad de razonamiento matemático y lógico del modelo original mientras se fuerza a que la cadena de pensamiento se exprese en alemán. La primera etapa consiste en un ajuste supervisado (SFT) con trazas de razonamiento en alemán del dataset toroe/ReasonXL-SFT, y la segunda etapa aplica aprendizaje por refuerzo con el algoritmo Dr. GRPO para recuperar la calidad de razonamiento perdida durante el SFT, usando una recompensa compuesta sobre problemas matemáticos verificables.

El modelo hereda la arquitectura del SmolLM3-3B, un transformer denso de 3 mil millones de parámetros con ventana de contexto de 32 768 tokens, entrenado sobre 11 billones de tokens. La versión presentada aquí está adaptada específicamente al alemán, y se enmarca dentro de una serie de modelos hermanos para español e italiano (SmolLM3-3B-SFT-GRPO-ES e IT). Su relevancia radica en permitir razonamiento matemático de alta calidad en un idioma no inglés sin sacrificar el rendimiento, un paso importante hacia la localización de modelos de razonamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base SmolLM3-3B) |
| Parametros totales | 384 387 328 (según safetensors; el modelo base SmolLM3-3B tiene 3B parámetros) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (se puede cuantizar con herramientas estándar como llama.cpp o vLLM) |
| Idiomas soportados | Alemán (razonamiento), aunque el modelo base es multilingüe |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en SmolLM3-3B, un transformer causal denso con 3 mil millones de parámetros, que utiliza una arquitectura estándar de decoder con atención de ventana deslizante y atención global intercalada, según el diseño del modelo original. El entrenamiento del modelo ReasonXL se divide en dos etapas: primero, un ajuste supervisado (SFT) sobre el dataset `toroe/ReasonXL-SFT`, que contiene trazas de razonamiento matemático en alemán, para desplazar el idioma de razonamiento del inglés al alemán. En segundo lugar, se aplica aprendizaje por refuerzo con Dr. GRPO, una variante de GRPO (Group Relative Policy Optimization) que introduce una recompensa compuesta sobre problemas matemáticos verificables. La recompensa se diseña para penalizar desviaciones del idioma objetivo y para recompensar la corrección de la respuesta final. El pipeline completo se describe en el paper ReasonXL (arXiv:2604.12378), aún pendiente de publicación completa.

El entrenamiento se realizó sobre el modelo base HuggingFaceTB/SmolLM3-3B, que ya había pasado por un post-entrenamiento de tres etapas (mid-training, SFT y DPO) en el alignment-handbook de Hugging Face. El dataset ReasonXL-SFT está específicamente curado para el razonamiento en alemán, aunque no se han publicado detalles sobre su tamaño o composición.

## Capacidades

- Razonamiento matemático y lógico en alemán, con cadenas de pensamiento (chain-of-thought) expresadas en ese idioma.
- Generación de texto y comprensión de instrucciones en alemán, gracias al multilingüismo del modelo base.
- Capacidad de razonamiento multi-paso para problemas aritméticos y algebraicos.
- Soporte de tool calling y function calling limitado, según las capacidades del modelo base SmolLM3 (el modelo base soporta tool calling).
- Capacidad de agentes y razonamiento multi-step heredada del modelo base, aunque no se ha validado específicamente en este checkpoint.
- Capacidades multilingües residuales: aunque el razonamiento se ha adaptado al alemán, el modelo puede seguir procesando texto en otros idiomas (inglés, español, francés, etc.) con menor calidad de razonamiento.

## Casos de uso

- Asistente de tutoría matemática en alemán: el modelo puede resolver problemas de álgebra, cálculo y aritmética explicando los pasos en alemán, útil para plataformas educativas de países germanoparlantes.
- Generación de ejercicios de razonamiento con soluciones razonadas: se puede usar para crear bancos de problemas matemáticos con respuestas explicadas en alemán para sistemas de e-learning.
- Evaluación de razonamiento en alemán en entornos académicos: investigadores pueden usar el modelo como referencia para medir la calidad de razonamiento de otros modelos en alemán.
- Traducción de problemas matemáticos y sus soluciones: dado que el razonamiento está en alemán, puede servir para generar versiones en alemán de problemas originalmente en inglés.
- Automatización de atención al cliente para servicios técnicos en alemán: aunque no es su foco principal, el modelo puede gestionar consultas que requieran lógica o cálculo, como facturación o soporte técnico básico.
- Investigación en localización de modelos de razonamiento: sirve como punto de partida para estudios sobre cómo el aprendizaje por refuerzo afecta a la calidad del razonamiento en otros idiomas, comparándolo con las versiones en español e italiano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los detalles completos de evaluación y la metodología se publicarán próximamente. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni otros estándares.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, el modelo de 3B parámetros ocupa aproximadamente 6 GB de VRAM; en cuantización de 8 bits alrededor de 3,5 GB y en 4 bits unos 2,5 GB.
- GPU recomendadas: puede ejecutarse en GPU consumer como RTX 3060 (12 GB) o superior en FP16; para cuantización 4 bits, RTX 2060 con 6 GB es suficiente.
- Despliegue: compatible con llama.cpp, Ollama, vLLM y TGI mediante conversión de pesos a GGUF o AWQ.
- Latencia y throughput: no se disponen de datos específicos del modelo; en hardware consumer (RTX 4090) se esperan alrededor de 50-100 tokens por segundo en FP16, dependiendo de la longitud de la secuencia.

## Comparativa con modelos similares

El modelo se puede comparar con su versión en otros idiomas y con el modelo base original.

| Modelo | Parametros | Contexto | Idioma de razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM3-3B (base) | 3B | 32 768 | Inglés (principal) | Apache 2.0 | Hugging Face |
| SmolLM3-3B-SFT-GRPO-DE (este) | 3B | 32 768 | Alemán | No disponible | Hugging Face |
| SmolLM3-3B-SFT-GRPO-ES | 3B | 32 768 | Español | No disponible | Hugging Face |
| SmolLM3-3B-SFT-GRPO-IT | 3B | 32 768 | Italiano | No disponible | Hugging Face |

No se dispone de resultados de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está especificada en la model card; el modelo base SmolLM3-3B tiene licencia Apache 2.0, pero el modelo adaptado puede tener restricciones adicionales no declaradas. Se recomienda contactar al autor antes de uso comercial.
- El modelo está especializado en razonamiento matemático; su rendimiento en otras tareas (generación creativa, resumen, etc.) puede ser inferior al modelo base.
- La ventana de contexto de 32 768 tokens puede ser insuficiente para tareas que requieran documentos muy largos.
- Al estar adaptado al alemán, el razonamiento en otros idiomas puede degradarse notablemente, aunque el modelo base sea multilingüe.
- Existe riesgo de alucinación en problemas matemáticos complejos o ambiguos; se recomienda validar las respuestas con herramientas externas.
- No se han publicado evaluaciones de sesgos o seguridad; el modelo puede reflejar sesgos del dataset de entrenamiento (ReasonXL-SFT).
- La documentación es incompleta: no hay detalles de la recompensa exacta, hiperparámetros del RL, ni resultados de evaluación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DGurgurov/SmolLM3-3B-SFT-GRPO-DE
- Modelo SFT previo (DGurgurov/SmolLM3-3B-SFT-DE): https://huggingface.co/DGurgurov/SmolLM3-3B-SFT-DE
- Dataset SFT (toroe/ReasonXL-SFT): https://huggingface.co/datasets/toroe/ReasonXL-SFT
- Paper ReasonXL (arXiv:2604.12378): https://arxiv.org/abs/2604.12378
- Repositorio SmolLM de HuggingFace: https://github.com/huggingface/smollm
- Alignment Handbook con recetas de SmolLM3: https://github.com/huggingface/alignment-handbook/blob/main/recipes/smollm3/README.md
