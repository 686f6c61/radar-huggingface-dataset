# sandeep123/aops-grpo-vanilla-step1100

## Resumen

`sandeep123/aops-grpo-vanilla-step1100` es un modelo de razonamiento matemático de 1.777 millones de parámetros, desarrollado por Kumar (usuario `sandeep123`) como un baseline de entrenamiento con Group Relative Policy Optimization (GRPO). Parte del modelo base `Qwen/Qwen2.5-Math-1.5B` y se entrena sobre el subconjunto olímpico de NuminaMath-1.5 (denominado AoPS) y validado en ScienceQA, con el objetivo de servir como punto de referencia para comparar variantes de algoritmos de aprendizaje por refuerzo. El checkpoint seleccionado corresponde al paso 1100, elegido por su mejor `pass@1` en validación.

La relevancia de este modelo reside en que documenta de forma explícita una configuración concreta de GRPO (entropy_coeff=0, clip simétrico 0.2, temperatura de rollout 1.0) y advierte sobre un desajuste crítico: fue entrenado sin chat template, por lo que aplicarlo en inferencia degrada el rendimiento en aproximadamente 19 puntos de `pass@1`. Es una pieza de investigación reproducible para estudios de RL post-entrenamiento, no un modelo pensado para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1536 tokens (512 prompt + 1024 respuesta en entrenamiento) |
| Tipos de cuantizacion | No disponible (solo safetensors en bfloat16 según ejemplo de inferencia) |
| Idiomas soportados | No disponible (dataset ScienceQA en inglés, sin declaración oficial) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un Transformer decoder-only basado en `Qwen/Qwen2.5-Math-1.5B`, con 1.78B parámetros. Se entrena mediante GRPO (Group Relative Policy Optimization) sobre el dataset `scienceqa_boxfix` (ScienceQA), con 25 épocas equivalentes a 1250 pasos, batch de 128 prompts y K=6 rollouts por prompt. La tasa de aprendizaje es constante de 1e-6, con coeficiente KL de 0.01 en la recompensa y una recompensa de formato de 0.03 sin decaimiento. La configuración específica de este brazo incluye `entropy_coeff=0.0`, clip PPO simétrico de 0.2 y temperatura de rollout de 1.0.

Una innovación metodológica destacable es el uso de texto crudo sin chat template durante el entrenamiento, lo que obliga a que la inferencia se realice también sin plantilla de chat para mantener la coherencia. La extracción de respuestas se realiza mediante el contenido del último `\boxed{}` o, en su defecto, el último token A-E. Las respuestas sin respuesta extraíble se puntúan como incorrectas. La validación se realiza sobre 256 prompts held-out con K=6, temperatura 1.0 y semilla 42.

## Capacidades

- Razonamiento matemático en problemas de opción múltiple (ScienceQA), con generación de cadenas de razonamiento paso a paso.
- Extracción de respuestas mediante notación `\boxed{}` o tokens A-E.
- Generación de texto condicionada a prompts de razonamiento matemático.
- No soporta tool calling, ni funciones de agente, ni visión o audio.
- Capacidades multilingües no declaradas; el dataset de entrenamiento es en inglés.
- No incluye modo de pensamiento explícito ni decodificación especulativa.

## Casos de uso

- Investigación en RL post-entrenamiento: permite comparar el efecto de distintas configuraciones de GRPO (entropy, clip, temperatura) sobre el rendimiento en razonamiento matemático, sirviendo como baseline reproducible.
- Evaluación de técnicas de extracción de respuestas: su métrica pre-registrada (contenido de `\boxed{}` o token A-E) facilita el análisis de pipelines de parsing de respuestas.
- Generación de datos de razonamiento sintético: puede usarse para producir cadenas de razonamiento sobre problemas de opción múltiple, útiles para aumentar datasets de entrenamiento o validar métodos de filtrado.
- Benchmark de razonamiento en opción múltiple: al estar validado en ScienceQA con `pass@1` y `pass@6`, sirve como referencia para medir la dificultad de nuevos datasets o la efectividad de técnicas de muestreo.
- Estudio de la sensibilidad al chat template: el desajuste documentado de ~19 puntos de `pass@1` al aplicar el template de Qwen2.5-Math lo convierte en un caso de estudio para investigar la influencia del formato de entrada en modelos entrenados con RL.
- Análisis de la relación entre calidad y diversidad de checkpoints: el autor señala que el mejor `pass@1` aparece en pasos 1000-1200 mientras que el mejor `pass@6` en pasos 200-500, lo que permite estudiar el equilibrio entre exactitud y diversidad en la selección de modelos.

## Benchmarks y rendimiento

Los resultados de validación reportados en la model card para este checkpoint concreto son:

| Metrica | Valor |
|---|---|
| pass@1 | 0.2376 |
| pass@6 | 0.3945 |
| Paso | 1100 |

Estos valores corresponden a la exactitud de respuesta muestreada (sampled answer accuracy) sobre 256 prompts de validación, con K=6, temperatura 1.0 y semilla 42. No se proporcionan benchmarks adicionales como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3.6 GB para los pesos (1.78B × 2 bytes) más overhead de activaciones y KV cache; con `max_model_len=1536` y batch pequeño, se puede operar con menos de 6 GB.
- Con cuantización de 4 bits (no disponible oficialmente, pero posible con herramientas como llama.cpp), la VRAM necesaria se reduce a ~1 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM (RTX 3060, RTX 4060, etc.) para bfloat16; tarjetas con 4 GB pueden funcionar con cuantización.
- Opciones de despliegue: vLLM (usado en el ejemplo de inferencia), llama.cpp, Ollama (si se genera GGUF), Hugging Face Transformers.
- Latencia y throughput: no disponibles; al ser un modelo de 1.5B, la generación de 1024 tokens en una GPU consumer puede tomar del orden de segundos, pero sin datos oficiales.

## Comparativa con modelos similares

No se dispone de datos de comparación con modelos similares en la información proporcionada. El autor publica otro checkpoint del mismo estudio (`sandeep123/sqa-grpo-vanilla-step1200`) pero no se incluyen sus métricas en los resultados de búsqueda. Tampoco se comparan los resultados con el modelo base sin RL. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Entrenado sin chat template: aplicar el template de Qwen2.5-Math en inferencia produce una caída de ~19 puntos de `pass@1` en una tarea hermana. Debe usarse siempre texto crudo.
- Contexto limitado a 1536 tokens en el entrenamiento (512 prompt + 1024 respuesta), aunque el modelo base soporta hasta 32K; no se recomienda exceder este límite.
- Vocabulario y datos de entrenamiento en inglés; no se garantiza rendimiento en otros idiomas.
- Riesgo de alucinación en respuestas sin razonamiento correcto; la extracción de respuestas depende de la presencia de `\boxed{}` o tokens A-E, y las respuestas no extraíbles se puntúan como incorrectas.
- Modelo de investigación, no apto para producción: no se ha evaluado su robustez ante entradas adversas ni su seguridad.
- Licencia Apache-2.0 permite uso comercial, pero al ser un derivado de Qwen2.5-Math-1.5B, deben respetarse los términos de la licencia original de Qwen (Apache-2.0 también).
- No hay información sobre sesgos específicos, pero al entrenarse en un dataset de matemáticas de opción múltiple, puede presentar sesgos hacia formatos de respuesta específicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sandeep123/aops-grpo-vanilla-step1100
- Perfil del autor: https://huggingface.co/sandeep123
- Checkpoint relacionado (sqa-grpo-vanilla-step1200): https://huggingface.co/sandeep123/sqa-grpo-vanilla-step1200
- Repositorio de referencia sobre implementaciones de GRPO (Vanilla_GRPO): https://github.com/CinderellaQAQ/Vanilla_GRPO/blob/main/README.md
