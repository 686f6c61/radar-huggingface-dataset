# LeaderboardModel1/gpt-oss-20b-AutoRound-MXFP8

## Resumen

El modelo `LeaderboardModel1/gpt-oss-20b-AutoRound-MXFP8` es una cuantización MXFP8 del modelo de lenguaje abierto `openai/gpt-oss-20b`, generada mediante la herramienta AutoRound de Intel. Esta cuantización reduce el tamaño y los requisitos de memoria del modelo original, manteniendo un equilibrio entre rendimiento y eficiencia, lo que facilita su despliegue en entornos con recursos limitados. El modelo base, desarrollado por OpenAI, es un LLM de 20 000 millones de parámetros (aunque el peso real en safetensors es de aproximadamente 11 956 millones) diseñado para ofrecer baja latencia y buen rendimiento en tareas de razonamiento, código y matemáticas.

La relevancia de esta cuantización radica en que permite ejecutar un modelo de la familia GPT-OSS en hardware de consumo, con una huella de memoria significativamente menor que la versión original. El proceso de cuantización se ha realizado con AutoRound, un método de cuantización de precisión mixta que busca minimizar la pérdida de calidad. El modelo está disponible en Hugging Face y sigue la licencia del modelo original (Apache 2.0).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base: openai/gpt-oss-20b) |
| Parametros totales | 11 956 805 184 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP8 (también existen variantes NVFP4 y W4A16 del mismo modelo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Este modelo es una cuantización del modelo base `openai/gpt-oss-20b`, que emplea una arquitectura Transformer estándar. La cuantización se ha realizado con AutoRound, un método de cuantización de precisión mixta que optimiza los pesos para reducir el error de cuantización. El esquema utilizado es MXFP8, que usa 8 bits en formato de punto flotante con mantisa y exponente compartidos (microscaling). No se dispone de información sobre el proceso de entrenamiento del modelo base en la documentación proporcionada, pero se sabe que el modelo original fue entrenado por OpenAI con un enfoque en eficiencia y bajo coste de inferencia.

La cuantización se ha generado mediante un agente automático (`autoquant-agent`) que combina cuantización, evaluación y auto-corrección, lo que sugiere un proceso iterativo para mantener la calidad. No se han publicado detalles sobre el dataset de entrenamiento ni sobre técnicas como RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto coherente y contextualizado, heredando las capacidades del modelo base.
- Razonamiento y matemáticas: el modelo base GPT-OSS-20B destaca en tareas de razonamiento lógico y resolución de problemas matemáticos, según los benchmarks públicos de OpenAI.
- Generación de código: soporta tareas de programación y autocompletado de código, aunque no se especifican detalles en la documentación.
- Multilingüismo: no se dispone de información específica sobre los idiomas soportados.
- Tool calling y agentes: no se confirma en la documentación, pero el modelo base podría soportar estas funciones; no hay datos concluyentes.
- Modo de pensamiento (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Despliegue en entornos con recursos limitados: al estar cuantizado en MXFP8, el modelo puede ejecutarse en GPUs de consumo con menos VRAM que el modelo original, lo que permite su uso en aplicaciones de producción sin necesidad de hardware de gama alta.
- Inferencia de baja latencia: la cuantización reduce el tamaño del modelo, lo que acelera la inferencia, adecuado para chatbots o asistentes virtuales que requieren respuestas rápidas.
- Prototipado y experimentación: los desarrolladores pueden probar el modelo en local sin necesidad de infraestructura en la nube, gracias a su menor huella de memoria.
- Generación de código en entornos de desarrollo: el modelo puede integrarse en IDE o pipelines de CI/CD para sugerencias de código, aunque se debe validar su rendimiento en esta tarea.
- Análisis de texto y resumen: útil para tareas de procesamiento de lenguaje natural como resumen de documentos o extracción de información, siempre que se ajuste a las capacidades del modelo base.
- Investigación académica: sirve como punto de partida para estudiar el impacto de la cuantización MXFP8 en el rendimiento de modelos grandes, comparando con otras variantes cuantizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento, y los resultados de búsqueda no proporcionan datos numéricos. Se recomienda consultar los benchmarks del modelo base `openai/gpt-oss-20b` en fuentes externas, pero no se pueden citar aquí sin verificación.

## Requisitos de hardware

- VRAM estimada: con 11 956 millones de parámetros en MXFP8 (1 byte por parámetro), se estima un uso de memoria de aproximadamente 12 GB para los pesos, más overhead de activaciones y KV cache. En la práctica, se necesitarían entre 14 y 16 GB de VRAM para inferencia con contexto moderado.
- GPU recomendadas: tarjetas con 16 GB o más de VRAM, como NVIDIA RTX 4090, RTX 4080, A100 (40 GB) o H100. En GPUs con 12 GB podría ser posible con cuantización adicional o menor contexto.
- Compatibilidad con GPU de consumo: sí, es viable en GPUs de gama alta para consumidores (RTX 3090/4090) con suficiente VRAM.
- Opciones de despliegue: se puede servir con frameworks como vLLM, llama.cpp, Ollama o TGI, siempre que soporten el formato safetensors y la cuantización MXFP8. No se especifica compatibilidad en la documentación.
- Latencia y throughput: no disponible; dependerá del hardware y del framework utilizado.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt-oss-20b-AutoRound-MXFP8 (este) | ~12B (real) | MXFP8 | no disponible | Apache 2.0 | Hugging Face |
| gpt-oss-20b-AutoRound-NVFP4-RTN | ~12B (real) | NVFP4 | no disponible | Apache 2.0 | Hugging Face |
| gpt-oss-20b-AutoRound-W4A16-RTN | ~12B (real) | W4A16 (int4) | no disponible | Apache 2.0 | Hugging Face |
| openai/gpt-oss-20b (base) | ~20B (nominal) | FP16/BF16 | no disponible | Apache 2.0 | Hugging Face |

Las variantes cuantizadas ofrecen diferentes equilibrios entre tamaño y precisión. MXFP8 es una cuantización de 8 bits, mientras que NVFP4 y W4A16 son de 4 bits, lo que reduce aún más la memoria pero puede afectar más a la calidad. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- La cuantización puede introducir pérdida de precisión en comparación con el modelo original, especialmente en tareas que requieren alta exactitud numérica o razonamiento complejo.
- No se dispone de información sobre sesgos del modelo base; se recomienda evaluar el comportamiento en dominios sensibles antes de su uso en producción.
- Riesgo de alucinaciones: como cualquier LLM, puede generar información falsa o inventada; se debe implementar verificación externa en aplicaciones críticas.
- La longitud de contexto no está documentada; se debe asumir la del modelo base (posiblemente 128k, pero no confirmado) y ajustar en consecuencia.
- La licencia Apache 2.0 permite uso comercial, pero se debe cumplir con los términos del modelo base y atribuir correctamente.
- El formato MXFP8 puede no ser compatible con todos los frameworks de inferencia; se debe verificar la compatibilidad antes del despliegue.

## Enlaces

- [Hugging Face - LeaderboardModel1/gpt-oss-20b-AutoRound-MXFP8](https://huggingface.co/LeaderboardModel1/gpt-oss-20b-AutoRound-MXFP8)
- [Hugging Face - openai/gpt-oss-20b (modelo base)](https://huggingface.co/openai/gpt-oss-20b)
- [Hugging Face - gpt-oss-20b-AutoRound-NVFP4-RTN](https://huggingface.co/LeaderboardModel1/gpt-oss-20b-AutoRound-NVFP4-RTN)
- [Hugging Face - gpt-oss-20b-AutoRound-W4A16-RTN](https://huggingface.co/LeaderboardModel1/gpt-oss-20b-AutoRound-W4A16-RTN)
- [OpenAI API - gpt-oss-20b](https://developers.openai.com/api/docs/models/gpt-oss-20b)
- [Swallow LLM Leaderboard - gpt-oss-20b](https://swallow-llm.github.io/leaderboard/openai_gpt-oss-20b.en.html)
- [LLM Leaderboard - GPT-OSS-20B](https://llmleaderboard.ai/model/gpt-oss-20b/)
