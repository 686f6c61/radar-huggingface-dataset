# kyleliu789/qwen3-14b-svamp14-sft-merged-bf16-r8-a16

## Resumen

El modelo `kyleliu789/qwen3-14b-svamp14-sft-merged-bf16-r8-a16` es un modelo de lenguaje de 14.768 millones de parámetros, resultado de fusionar un adaptador LoRA de ajuste fino supervisado (SFT) sobre el modelo base `Qwen/Qwen3-14B`. El adaptador, de rango 8 y alpha 16, fue entrenado sobre el dataset SVAMP (problemas matemáticos de palabras) y posteriormente fusionado con PEFT `merge_and_unload`, guardando el resultado en seis shards en formato safetensors con precisión BF16.

Este modelo está pensado como un punto de partida para experimentos posteriores con GRPO (Group Relative Policy Optimization) y como un modelo SFT autónomo especializado en razonamiento matemático. Su relevancia radica en que parte de una base sólida como Qwen3-14B, un modelo de la familia Qwen3 con capacidades conversacionales y de razonamiento, y la adapta a un dominio específico sin necesidad de reentrenar desde cero.

El repositorio, publicado en agosto de 2026, tiene actualmente cero descargas y cero likes, lo que sugiere que se trata de un experimento reciente o de un modelo de investigación sin adopción amplia todavía. La licencia y los idiomas soportados no están disponibles en la información publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen3-14B |
| Parametros totales | 14.768.307.200 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3-14B, no especificada) |
| Tipos de cuantizacion | No disponible (solo se publica en BF16) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (BF16, seis shards) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-14B, un transformer denso decoder-only con atención de múltiples cabezas y mecanismos de razonamiento híbridos (modo pensamiento y modo no pensamiento) que caracterizan a la familia Qwen3. El adaptador LoRA aplicado tiene rango 8 y alpha 16, y se entrenó mediante ajuste fino supervisado (SFT) sobre el dataset SVAMP, que contiene problemas matemáticos de palabras en inglés. Tras el entrenamiento, el adaptador se fusionó en los pesos del modelo base y se guardó en BF16, lo que implica que los pesos resultantes son una combinación de los pesos originales de Qwen3-14B y las actualizaciones aprendidas.

No se ha publicado información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se utilizaron técnicas adicionales como RLHF o DPO. El modelo se describe como "merged" y listo para servir como base para experimentos GRPO, lo que sugiere que el SFT fue un paso intermedio en un pipeline de optimización por refuerzo.

## Capacidades

- Generación de texto conversacional heredada de Qwen3-14B, incluyendo respuestas multi-turno.
- Razonamiento matemático y resolución de problemas de palabras aritméticos, gracias al ajuste específico con SVAMP.
- Soporte de tool calling y function calling, capacidad nativa de Qwen3-14B.
- Capacidades de razonamiento multi-step en modo "thinking" (si se activa el modo de pensamiento de Qwen3).
- Capacidades multilingües heredadas del modelo base, aunque no se especifican los idiomas concretos.
- Sin capacidades multimodales (solo texto).

## Casos de uso

- **Resolución de problemas de matemáticas en educación**: el modelo puede utilizarse como asistente para estudiantes, explicando paso a paso la resolución de problemas de palabras aritméticos, gracias a su ajuste específico con SVAMP.
- **Generación de ejercicios matemáticos**: puede generar problemas de palabras variados con sus soluciones, útil para plataformas de aprendizaje automático o generación de contenido educativo.
- **Evaluación de razonamiento en modelos**: al ser un modelo SFT fusionado, sirve como referencia para experimentos de comparación de técnicas de entrenamiento (como GRPO) sobre la misma base.
- **Integración en pipelines de agentes**: su herencia de Qwen3-14B permite usarlo en agentes que requieran razonamiento matemático junto con llamadas a herramientas.
- **Prototipado de asistentes de ayuda con tareas**: se puede desplegar en aplicaciones de tutoría que necesiten entender y resolver problemas de palabras en lenguaje natural.
- **Investigación en eficiencia de adaptación**: el modelo es útil para estudiar el impacto de adaptadores LoRA de bajo rango sobre un modelo base grande en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este modelo fusionado específico. Se recomienda evaluarlo directamente en el dataset SVAMP y compararlo con el modelo base Qwen3-14B para medir el efecto del ajuste.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los pesos en BF16 ocupan aproximadamente 29.5 GB, por lo que se necesita una GPU con al menos 32 GB de VRAM para inferencia en BF16 sin cuantización. Con cuantización a 8 bits se podría reducir a unos 15-16 GB, y a 4 bits a unos 8-9 GB, aunque no se han publicado pesos cuantizados.
- **GPUs recomendadas**: A100 40GB o 80GB, H100, RTX 4090 (24 GB no suficiente para BF16 sin cuantizar, pero sí con cuantización 8-bit), o GPUs profesionales de 32GB o más.
- **Cabe en consumer GPU**: sí, en RTX 4090 (24 GB) con cuantización a 8 bits o 4 bits, o en RTX 3090 (24 GB) con cuantización. No cabe en GPUs de 16 GB sin cuantización.
- **Opciones de despliegue**: compatible con Hugging Face Transformers, vLLM, Text Generation Inference (TGI), y cualquier framework que soporte safetensors BF16. También se puede convertir a GGUF para su uso con llama.cpp u Ollama.
- **Latencia y throughput**: no disponible. Dependerá del hardware y del framework de inferencia utilizado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen/Qwen3-14B (base) | 14.7B | 32k (no confirmado en este repo) | Apache 2.0 (según Qwen) | HuggingFace |
| kyleliu789/qwen3-14b-svamp14-sft-merged-bf16-r8-a16 | 14.7B | No disponible | No disponible | HuggingFace |
| kyleliu789/qwen3-14b-svamp-sft (variante anterior) | 14.7B | No disponible | No disponible | HuggingFace |

La comparativa se limita a modelos de la misma familia y tamaño. No hay datos de rendimiento disponibles para comparar en benchmarks. La principal diferencia entre este modelo y el base es el ajuste SFT sobre SVAMP, que debería mejorar el rendimiento en problemas de palabras aritméticas a costa de posiblemente degradar el rendimiento en otras tareas generales (efecto de especialización).

## Limitaciones y advertencias

- **Sesgos conocidos**: no se han documentado sesgos específicos, pero al heredar de Qwen3-14B, puede heredar sesgos de su entrenamiento preentrenamiento. El ajuste con SVAMP puede introducir sesgos de los datos de entrenamiento del dataset.
- **Riesgo de alucinación**: como cualquier LLM, puede generar soluciones incorrectas o inventar datos en problemas matemáticos, especialmente si el problema está fuera de la distribución de SVAMP.
- **Limitaciones de contexto**: la longitud de contexto no está especificada en este repo; se hereda de Qwen3-14B, pero no se garantiza el mismo comportamiento tras la fusión.
- **Restricciones de licencia**: la licencia del modelo es "no disponible", lo que impide su uso comercial sin verificación legal. Se recomienda contactar con el autor.
- **Caveat para producción**: el modelo tiene cero descargas y es un experimento de investigación; no está validado para uso en producción. Además, su especialización en SVAMP puede degradar su rendimiento en tareas generales de lenguaje.
- **Sin cuantizaciones oficiales**: solo se ofrecen pesos BF16, lo que limita el despliegue en hardware de gama baja sin conversión manual.

## Enlaces

- Repositorio HuggingFace: [kyleliu789/qwen3-14b-svamp14-sft-merged-bf16-r8-a16](https://huggingface.co/kyleliu789/qwen3-14b-svamp14-sft-merged-bf16-r8-a16)
- Adaptador LoRA base: [kyleliu789/qwen3-14b-svamp14-sft-qlora-r8-a16](https://huggingface.co/kyleliu789/qwen3-14b-svamp14-sft-qlora-r8-a16)
- Modelo anterior relacionado: [kyleliu789/qwen3-14b-svamp-sft](https://huggingface.co/kyleliu789/qwen3-14b-svamp-sft)
- GitHub de Qwen3: [QwenLM/Qwen3](https://github.com/QwenLM/Qwen3)
- Página de FriendliAI para el modelo: [qwen3-14b-svamp-sft](https://friendli.ai/models/kyleliu789/qwen3-14b-svamp-sft)
- GitHub de Qwen3-VL (referencia de la familia Qwen3): [QwenLM/Qwen3-VL](https://github.com/QwenLM/Qwen3-VL)
