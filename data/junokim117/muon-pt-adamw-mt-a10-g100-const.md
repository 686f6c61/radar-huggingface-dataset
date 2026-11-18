# junokim117/muon-PT-adamw-MT-a10-g100-const

## Resumen

muon-PT-adamw-MT-a10-g100-const es un checkpoint de investigación publicado por el usuario junokim117 en Hugging Face. Se trata de un modelo de lenguaje de tipo transformer con arquitectura Qwen2 y 494.032.768 parámetros totales, derivado del checkpoint base muon-PT tras una fase de midtraining de 10.000 pasos (20.970 millones de tokens) con el optimizador AdamW sobre los conjuntos de datos DCLM y FineMath-4plus. El nombre del modelo codifica la configuración experimental: midtraining con AdamW, proporción de FineMath del 10 % durante la mayor parte del entrenamiento y del 100 % en los últimos 1.000 pasos, con una tasa de aprendizaje constante de 5e-4.

El modelo no es un lanzamiento de producción, sino una reproducción a pequeña escala del artículo arXiv 2610.29348 llevada a cabo con Megatron-LM. Su interés radica en que permite estudiar el efecto de mezclar datos matemáticos de alta calidad (FineMath) en la fase de midtraining sobre un modelo preentrenado con Muon, y comparar las pérdidas finales resultantes en ambos dominios de datos.

La relevancia es por tanto metodológica: sirve como referencia reproducible para investigadores que trabajan en estrategias de mezcla de datos, currículos de entrenamiento y optimizadores alternativos. No dispone de datos publicados de benchmarks, de idiomas soportados ni de una model card orientada a uso práctico más allá de la descripción del experimento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen2, según tags del repo) |
| Parámetros totales | 494.032.768 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors; cuantización GGUF/AWQ no publicada) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint muon-PT y aplica una fase de midtraining con AdamW en lugar de Muon. La arquitectura declarada en los tags del repositorio es Qwen2, lo que implica un transformer decoder-only con atención causal estándar, aunque la model card no detalla número de capas, dimensión oculta ni cabezas de atención. Con 494 millones de parámetros, el tamaño es coherente con la clase de modelos pequeños tipo Qwen2-0.5B.

El entrenamiento de midtraining comprende 10.000 pasos, equivalentes a 20.970 millones de tokens, sobre una mezcla de DCLM y FineMath-4plus en la que FineMath representa el 10 % del presupuesto de tokens. Los últimos 1.000 pasos se realizan íntegramente con FineMath, lo que constituye una fase de recalentamiento o *annealing* hacia el dominio matemático. La tasa de aprendizaje se mantiene constante en 5e-4 durante todo el proceso. Las pérdidas finales reportadas sobre un subconjunto de 32 millones de tokens son 3,1070 en DCLM y 1,5812 en FineMath. La reproducción se realizó con Megatron-LM y pretende replicar los resultados de arXiv 2610.29348.

## Capacidades

- Generación de texto autoregresiva y conversacional, según los tags del repositorio (`text-generation`, `conversational`).
- Entrenamiento específico en datos matemáticos de alta calidad (FineMath-4plus), lo que orienta el modelo hacia tareas de razonamiento matemático elemental.
- Compatibilidad con Text Generation Inference y endpoints compatibles, según los tags del repositorio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declara lista de idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Reproducción de experimentos de midtraining: el checkpoint permite verificar las pérdidas reportadas (3,1070 en DCLM y 1,5812 en FineMath) y estudiar el efecto del currículo con FineMath al 10 % y al 100 % en la fase final.
- Investigación sobre mezcla de datos matemáticos: sirve para analizar cómo la proporción de FineMath afecta a la pérdida en dominios generales frente a matemáticos, dado que el autor publica ambos valores.
- Comparación de optimizadores: al derivar de muon-PT y usar AdamW en esta fase, permite aislar el comportamiento de AdamW frente a Muon en un modelo de 494 millones de parámetros.
- Fine-tuning supervisado sobre tareas matemáticas: su exposición intensiva a FineMath lo hace adecuado como punto de partida para ajuste en resolución de problemas aritméticos y algebraicos sencillos.
- Base para estudios de *annealing*: la fase final de 1.000 pasos con 100 % FineMath permite investigar estrategias de recalentamiento con datos de dominio.
- Experimentación educativa en entornos con recursos limitados: con menos de 500 millones de parámetros, puede ejecutarse en una única GPU de consumo para pruebas de generación de texto, siempre que se valide su calidad, no documentada.
- Evaluación de pipelines de Megatron-LM: útil como referencia para validar configuraciones de entrenamiento distribuidas en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta pérdidas de validación sobre subconjuntos de 32 millones de tokens:

| Conjunto de evaluación | Pérdida |
|---|---|
| DCLM (32M tokens) | 3,1070 |
| FineMath (32M tokens) | 1,5812 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1 GB para los pesos (494 M de parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en fp32: aproximadamente 2 GB para los pesos.
- Cuantización a 8 bits: en torno a 0,5 GB de pesos; a 4 bits: en torno a 0,25 GB, aunque no se publican versiones GGUF oficiales.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU modernas con 4 GB o más de VRAM.
- Opciones de despliegue: transformers (librería declarada), Text Generation Inference (tag `text-generation-inference`) y endpoints compatibles. El soporte en vLLM, llama.cpp u Ollama no está confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| muon-PT-adamw-MT-a10-g100-const | 494 M | No disponible | Apache 2.0 | Hugging Face (0 descargas) | Checkpoint de investigación, sin benchmarks |
| Qwen2-0.5B | 494 M (aprox.) | 32.768 tokens (según versión estándar) | Apache 2.0 | Hugging Face, ampliamente distribuido | Modelo base de producción con benchmarks publicados |
| SmolLM-360M | 360 M | 2.048 tokens | Apache 2.0 | Hugging Face | Alternativa pequeña para entornos con recursos limitados |
| TinyLlama-1.1B | 1.100 M | 2.048 tokens | Apache 2.0 | Hugging Face | Mayor tamaño, con benchmarks publicados |

La comparación con Qwen2-0.5B es la más directa por arquitectura y número de parámetros, pero los datos de contexto y rendimiento de este checkpoint no están publicados, por lo que no puede establecerse una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Modelo de investigación sin benchmarks publicados: no hay evidencia de calidad en tareas estándar (MMLU, HumanEval, GSM8K) ni comparación con baselines.
- Sin lista de idiomas declarada: se desconoce si el modelo funciona correctamente en castellano u otros idiomas distintos del inglés presente en DCLM.
- Riesgo de alucinación y de sobrerreacción a prompts matemáticos: la fase final con 100 % FineMath puede sesgar las respuestas hacia formatos y estilos matemáticos incluso en consultas generales.
- Longitud de contexto no documentada: no debe asumirse una ventana larga; conviene validar el comportamiento en secuencias de más de 2.048 tokens.
- Sin datos de sesgos: no se ha realizado ninguna evaluación de sesgos sociales, de género o culturales.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un checkpoint experimental sin garantías de calidad, no se recomienda su uso en producción sin una evaluación previa exhaustiva.
- Procedencia de los datos: DCLM y FineMath-4plus no están descritos en detalle en la model card (composición, filtrado, licencias de las fuentes originales), lo que limita la auditoría del modelo.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad ni issues reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/junokim117/muon-PT-adamw-MT-a10-g100-const
- Checkpoint base Muon PT: https://huggingface.co/junokim117/muon-PT
- Artículo de referencia: arXiv 2610.29348 (citado en la model card)
- Megatron-LM: repositorio de NVIDIA utilizado para la reproducción (no se proporciona enlace directo en la información disponible)
- DCLM: conjunto de datos citado en la model card (sin enlace directo disponible)
- FineMath-4plus: conjunto de datos citado en la model card (sin enlace directo disponible)
