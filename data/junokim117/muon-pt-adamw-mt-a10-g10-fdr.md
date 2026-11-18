# junokim117/muon-PT-adamw-MT-a10-g10-fdr

## Resumen

muon-PT-adamw-MT-a10-g10-fdr es un checkpoint de investigación publicado por el usuario junokim117 en Hugging Face. Se trata de un modelo de lenguaje de arquitectura Qwen2 (según los tags del repositorio) con 494.032.768 parámetros totales, derivado de un checkpoint previo denominado Muon PT y sometido a una fase adicional de midtraining de 10.000 pasos (20.970 millones de tokens) empleando el optimizador AdamW sobre una mezcla de DCLM y FineMath-4plus.

El propósito del modelo es reproducir el experimento descrito en el artículo arXiv 2610.29348 mediante Megatron-LM, evaluando el efecto de una proporción fija del 10 % de datos matemáticos (FineMath) durante todo el proceso de midtraining, con un decaimiento lineal de la tasa de aprendizaje desde 5e-4 hasta 1e-5. Las pérdidas finales reportadas sobre un subconjunto de 32 millones de tokens son 2,7251 en DCLM y 1,6619 en FineMath.

Es relevante ahora como artefacto de investigación reproducible para estudiar dinámicas de mezcla de datos y optimizadores en modelos pequeños, no como un modelo listo para producción. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no incluye información sobre idiomas soportados ni resultados de benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only, según tag `qwen2`) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de un checkpoint previo (Muon PT) y aplica una fase de midtraining de 10.000 pasos, equivalentes a 20.970 millones de tokens, utilizando AdamW como optimizador. La mezcla de datos combina DCLM y FineMath-4plus, con FineMath representando un 10 % fijo del presupuesto de tokens durante todos los pasos. La tasa de aprendizaje decae linealmente de 5e-4 a 1e-5 a lo largo del entrenamiento.

La arquitectura declarada en los metadatos es Qwen2, un transformer decoder-only con atención causal estándar. El entrenamiento se realizó con Megatron-LM como reproducción del artículo arXiv 2610.29348. No se especifican en la información disponible detalles sobre el número total de tokens de la fase previa, la composición exacta del corpus DCLM utilizado, ni si hubo fases de alineación posteriores (RLHF, DPO) o decodificación especulativa.

## Capacidades

- Generación de texto autoregresiva (pipeline `text-generation`).
- Conversación multi-turno (tag `conversational`).
- Razonamiento matemático potenciado por la inclusión de FineMath-4plus en el midtraining.
- Compatibilidad con Text Generation Inference y endpoints compatibles (tags `text-generation-inference`, `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Reproducción de experimentos de midtraining: sirve como referencia para validar los resultados del artículo arXiv 2610.29348 con Megatron-LM, comparando las pérdidas reportadas (2,7251 en DCLM y 1,6619 en FineMath) frente a ejecuciones propias.
- Estudio de mezclas de datos: permite analizar el impacto de mantener un 10 % de datos matemáticos (FineMath) durante todo el entrenamiento en un modelo de ~494 M de parámetros.
- Investigación sobre optimizadores: facilita comparaciones entre AdamW y Muon en la misma arquitectura y presupuesto de tokens, dado que el checkpoint de partida se entrenó con Muon.
- Evaluación de decaimiento de learning rate: el esquema lineal de 5e-4 a 1e-5 sobre 10.000 pasos puede replicarse o modificarse para estudiar curvas de pérdida.
- Fine-tuning académico: al ser un modelo pequeño (494 M parámetros) con licencia Apache 2.0, es adecuado para experimentos de ajuste supervisado en entornos con recursos limitados.
- Docencia y formación: su tamaño reducido permite ejecutar experimentos completos de entrenamiento y evaluación en una sola GPU, lo que resulta útil para ilustrar técnicas de midtraining y mezcla de corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta pérdidas de validación sobre subconjuntos de 32 millones de tokens: 2,7251 en DCLM y 1,6619 en FineMath-4plus.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en fp32 (494 M × 4 bytes), en torno a 1 GB en bf16/fp16 y menos de 1 GB en cuantizaciones de 8 o 4 bits, sin contar el espacio del tokenizador y de activaciones.
- GPU recomendadas: cualquier GPU consumer con al menos 4-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia; para entrenamiento o midtraining se recomiendan A100, H100 o GPUs con 24 GB o más.
- Cabe en GPU consumer: sí, en todas las RTX y GTX modernas con 4 GB o más de VRAM.
- Opciones de despliegue: transformers, Text Generation Inference (tag `text-generation-inference`), vLLM y llama.cpp (previa conversión a GGUF, no incluida en el repo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| muon-PT-adamw-MT-a10-g10-fdr | 494.032.768 | no disponible | Apache 2.0 | Hugging Face |
| Qwen2-0.5B | ~500 M | 32.768 tokens (versión base) | Apache 2.0 | Hugging Face |
| SmolLM-360M | ~360 M | 2.048 tokens | Apache 2.0 | Hugging Face |
| Pythia-410M | ~410 M | 2.048 tokens | Apache 2.0 | Hugging Face |

La comparación se limita a parámetros, contexto y licencia; no hay datos de rendimiento publicados para el modelo objeto de esta ficha que permitan una comparación cuantitativa con las alternativas.

## Limitaciones y advertencias

- Modelo de investigación: no se han publicado evaluaciones estándar (MMLU, HumanEval, GSM8K), por lo que se desconoce su calidad real en tareas downstream.
- Riesgo de alucinación: sin datos de alineación (RLHF/DPO) ni evaluaciones de fidelidad, es esperable un comportamiento propenso a inventar información.
- Sesgos: no se documenta la composición ni el filtrado del corpus DCLM utilizado, por lo que no pueden evaluarse sesgos específicos.
- Idiomas: no se declaran idiomas soportados; el rendimiento fuera del inglés (idioma predominante en DCLM) es incierto.
- Contexto: la longitud de contexto no está documentada, lo que impide garantizar ventanas largas en producción.
- Licencia: Apache 2.0 permite uso comercial, pero al tratarse de un checkpoint experimental sin garantías de calidad, no se recomienda su despliegue en producción sin una evaluación previa.
- Reproducibilidad: el modelo depende de un checkpoint previo (muon-PT) y de un pipeline Megatron-LM concreto; pequeñas variaciones en la configuración pueden alterar los resultados.

## Enlaces

- [Hugging Face: junokim117/muon-PT-adamw-MT-a10-g10-fdr](https://huggingface.co/junokim117/muon-PT-adamw-MT-a10-g10-fdr)
- [Checkpoint base: junokim117/muon-PT](https://huggingface.co/junokim117/muon-PT)
- [Artículo de referencia: arXiv 2610.29348](https://arxiv.org/abs/2610.29348)
- [Megatron-LM](https://github.com/NVIDIA/Megatron-LM)
