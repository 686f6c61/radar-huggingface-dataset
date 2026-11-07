# inference-optimization/Qwen3-30B-A3B-MXFP4xFP8

## Resumen

Qwen3-30B-A3B-MXFP4xFP8 es una versión cuantizada del modelo Qwen3-30B-A3B desarrollado por el equipo Qwen de Alibaba. Se trata de un modelo de lenguaje causal de tipo mezcla de expertos (MoE) con 30.532 millones de parámetros totales y aproximadamente 3.300 millones de parámetros activos por token, construido sobre la arquitectura Qwen3 MoE con 48 capas y 128 expertos (8 activados por token). Esta variante concreta, publicada por el usuario inference-optimization, aplica una cuantización mixta MXFP4/FP8 mediante la librería compressed-tensors, reduciendo el peso del repositorio a 17,2 GB frente a los aproximadamente 61 GB del modelo en bf16.

El modelo base Qwen3-30B-A3B es relevante por su capacidad de alternar entre modo de razonamiento (thinking mode) y modo de diálogo directo (non-thinking mode) dentro de un mismo modelo, así como por su soporte de más de 100 idiomas, tool calling y tareas de agente. La versión cuantizada busca hacer viable el despliegue en hardware con memoria limitada manteniendo la mayor parte de la calidad del original.

La ficha se centra en esta variante cuantizada, pero la mayoría de características funcionales (arquitectura, contexto, capacidades) provienen del modelo base Qwen3-30B-A3B, ya que la model card publicada replica la del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con mezcla de expertos (MoE), atención GQA |
| Parametros totales | 30.532.122.624 (30,5B) |
| Parametros activos | 3,3B (8 de 128 expertos por token) |
| Longitud de contexto | 32.768 tokens nativos; 131.072 tokens con YaRN |
| Tipos de cuantizacion | MXFP4 x FP8 (cuantización mixta de 8 bits, compressed-tensors) |
| Idiomas soportados | Más de 100 idiomas y dialectos (según model card del modelo base); lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer causal de tipo MoE con 48 capas, 32 cabezas de atención para consultas y 4 para claves/valores (GQA), y 128 expertos de los cuales se activan 8 por token. Los parámetros no correspondientes a embeddings son 29,9B. El entrenamiento del modelo base incluye fase de preentrenamiento y postentrenamiento, con alineación orientada a preferencias humanas, razonamiento, agentes y multilingüismo, según la model card de Qwen. No se dispone del número exacto de tokens de entrenamiento ni de la composición del dataset en la información proporcionada.

La innovación principal del modelo base es la alternancia entre thinking mode y non-thinking mode dentro de un único modelo, controlada mediante el parámetro `enable_thinking` en `apply_chat_template`. En thinking mode el modelo genera contenido de razonamiento envuelto en `<think>...</think>` antes de la respuesta final; en non-thinking mode responde directamente. Esta variante cuantizada sustituye los pesos originales por una combinación MXFP4/FP8 mediante compressed-tensors, pensada para reducir huella de memoria en inferencia. No se han publicado detalles sobre el proceso exacto de cuantización, calibración o pérdida de calidad en la información disponible.

## Capacidades

- Generación de texto y diálogo multi-turno con alineación a preferencias humanas.
- Razonamiento complejo en modo thinking (matemáticas, lógica, código).
- Generación y comprensión de código.
- Razonamiento matemático y resolución de problemas de varios pasos.
- Tool calling / function calling en modo thinking y non-thinking.
- Capacidades de agente para tareas multi-paso con integración de herramientas externas.
- Soporte multilingüe de más de 100 idiomas y dialectos, con instrucciones y traducción.
- Alternancia entre thinking mode y non-thinking mode en el mismo modelo.
- Escritura creativa, role-playing e instrucciones complejas.
- Compatibilidad con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Asistente de atención al cliente multi-turno: el modelo puede mantener conversaciones largas gracias a sus 32.768 tokens de contexto nativo (131.072 con YaRN), con respuestas directas en non-thinking mode para minimizar latencia.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletado, revisión o generación de tests, activando thinking mode en tareas que requieran razonamiento.
- Agentes autónomos con herramientas: su capacidad de function calling y razonamiento multi-paso permite orquestar flujos con APIs externas, bases de datos o sistemas de ficheros.
- Razonamiento matemático y análisis técnico: el thinking mode mejora la precisión en problemas de varios pasos, útil en herramientas educativas o de análisis financiero.
- Traducción y atención multilingüe: con más de 100 idiomas soportados, adecuado para plataformas de soporte o localización.
- Despliegue en hardware limitado: la cuantización MXFP4/FP8 reduce el peso a 17,2 GB, permitiendo servir el modelo en GPUs con menos VRAM que el original en bf16.
- Procesamiento de documentos largos: con YaRN hasta 131.072 tokens, útil para resumen y extracción de información en contratos, informes o código extenso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta variante cuantizada. La model card del modelo base menciona mejoras frente a QwQ-32B y Qwen2.5 en matemáticas, código y razonamiento, pero no se incluyen cifras concretas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 17,2 GB en MXFP4/FP8, por lo que se necesita al menos esa cantidad de VRAM más overhead de activaciones y caché KV. Con contexto largo la demanda crece de forma notable.
- GPU recomendadas: no disponible de forma específica para esta variante. Para el modelo base, la model card remite a la documentación de Qwen; no se detallan GPUs concretas en la información proporcionada.
- ¿Cabe en GPU de consumo? Con 17,2 GB de pesos, encajaría en GPUs de 24 GB (RTX 3090, RTX 4090) para contextos moderados, aunque no se confirma oficialmente en la información disponible.
- Opciones de despliegue: transformers (versión >= 4.51.0 para `qwen3_moe`), vLLM >= 0.8.5, SGLang >= 0.4.6.post1, y para uso local Ollama, LMStudio, MLX-LM, llama.cpp y KTransformers según la model card del modelo base. La compatibilidad de estas herramientas con el formato compressed-tensors MXFP4/FP8 no está confirmada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-30B-A3B-MXFP4xFP8 | 30,5B | 3,3B | 32.768 (131.072 con YaRN) | Apache 2.0 | safetensors MXFP4/FP8 |
| Qwen3-30B-A3B (original) | 30,5B | 3,3B | 32.768 (131.072 con YaRN) | Apache 2.0 | safetensors bf16 |
| Qwen3-30B-A3B-RAZOR20 | 25B (según HF) | no disponible | no disponible | no disponible | no disponible |

La comparativa de rendimiento entre estas variantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La cuantización MXFP4/FP8 puede introducir degradación de calidad respecto al modelo en bf16; no se han publicado evaluaciones que cuantifiquen esta pérdida.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en modo non-thinking y en dominios especializados.
- Sesgos conocidos del modelo base no documentados en la información disponible.
- El contexto nativo es de 32.768 tokens; superar esa longitud requiere configuración YaRN, que puede afectar al rendimiento.
- La lista concreta de idiomas soportados no está disponible, aunque la model card del base indica más de 100.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar el enlace de licencia del modelo base.
- El repositorio tiene 0 descargas y 0 likes, y fue creado recientemente; no hay evidencia de validación comunitaria de esta variante cuantizada.
- La compatibilidad de herramientas de despliegue (vLLM, SGLang, llama.cpp, Ollama) con el formato compressed-tensors MXFP4/FP8 no está confirmada en la información disponible.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/inference-optimization/Qwen3-30B-A3B-MXFP4xFP8
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Modelo base (Base): https://huggingface.co/Qwen/Qwen3-30B-A3B-Base
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Qwen Chat: https://chat.qwen.ai/
- Variante RAZOR20: https://huggingface.co/inference-optimization/Qwen3-30B-A3B-RAZOR20
- Licencia: https://huggingface.co/Qwen/Qwen3-30B-A3B/blob/main/LICENSE
- Paper referenciado (arxiv:2309.00071): https://arxiv.org/abs/2309.00071
- Paper referenciado (arxiv:2505.09388): https://arxiv.org/abs/2505.09388
