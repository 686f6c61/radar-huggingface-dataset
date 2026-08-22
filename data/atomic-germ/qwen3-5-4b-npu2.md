# Atomic-Germ/Qwen3.5-4B-NPU2

## Resumen

Qwen3.5-4B-NPU2 es una adaptacion del modelo Qwen3.5-4B, desarrollado originalmente por el equipo Qwen de Alibaba Cloud, publicada por el usuario Atomic-Germ en Hugging Face. El sufijo "NPU2" indica que esta variante esta optimizada para aceleracion por NPU, concretamente para el hardware AMD Ryzen AI XDNA2, y se distribuye en formato cuantizado Q4LX para su ejecucion mediante el runtime FastFlowLM. El modelo base es un LLM causal multimodal (imagen-texto) con 4.000 millones de parametros, arquitectura hibrida con Gated Delta Networks y atencion por ventanas, y una ventana de contexto nativa de 262.144 tokens, ampliable hasta aproximadamente 1.010.000 tokens.

La relevancia de este modelo reside en su combinacion de tamaño reducido, capacidades multimodales (vision + texto) y soporte para 201 idiomas, lo que lo convierte en una opcion atractiva para despliegue en dispositivos locales con recursos limitados, especialmente portatiles con NPU AMD de ultima generacion. Aunque el repositorio en si no ha recibido descargas ni validacion por parte de la comunidad, el modelo base Qwen3.5-4B cuenta con resultados de benchmarks publicados por el equipo Qwen, lo que permite evaluar su rendimiento esperado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, hibrida (Gated DeltaNet + Gated Attention + FFN) |
| Parametros totales | 4.000 millones (4B) |
| Parametros activos | no disponible (la arquitectura no es MoE, aunque el paper menciona sparse MoE en la familia) |
| Longitud de contexto | 262.144 tokens nativa, extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | Q4NX (para NPU XDNA2, segun el repositorio) |
| Idiomas soportados | 201 idiomas y dialectos (segun la model card base) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (Transformers), compatible con vLLM, SGLang, KTransformers |

## 3. Arquitectura y entrenamiento

La arquitectura de Qwen3.5-4B es una hibrida que combina **Gated DeltaNet** (mecanismo de atencion lineal con compuertas) con bloques de **Gated Attention** tradicionales, intercalados con Feed-Forward Networks. El modelo tiene 32 capas, con una distribucion de 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), lo que significa que por cada 4 bloques, tres usan atencion lineal y uno usa atencion por ventana con RoPE. Esta combinacion busca reducir la complejidad computacional de la atencion cuadratica manteniendo la calidad del razonamiento.

El entrenamiento se realizo en dos fases: pre-training y post-training, con un enfasis en el escalado de reinforcement learning en entornos multi-agente. El modelo incorpora una tecnica de **Multi-Token Prediction (MTP)** entrenada con multiples pasos, que permite predecir varios tokens a la vez. La parte multimodal se entreno con early fusion de tokens de vision y texto, alcanzando paridad con modelos de la generacion anterior en tareas de razonamiento, codigo y agentes. No se dispone de informacion detallada sobre el numero total de tokens de entrenamiento ni la composicion exacta del dataset.

## 4. Capacidades

- **Generacion de texto y razonamiento**: capaz de tareas de conocimiento general, STEM, matematica y logica, con resultados comparables a modelos de 20B en MMLU-Pro.
- **Comprension multimodal**: acepta entrada de imagenes y texto (pipeline image-text-to-text), con capacidad de responder a preguntas visuales y tareas de vision-lenguaje.
- **Razonamiento y agentes**: soporta multi-step reasoning y puede integrarse en pipelines de agentes, aunque no se especifica si tiene soporte nativo de tool calling en esta variante.
- **Multilingue**: soporta 201 idiomas y dialectos, incluidos lenguas con alfabetos no latinos.
- **Contexto largo**: ventana de 262.144 tokens nativos, extensible a 1M, adecuada para documentos extensos y conversaciones de muchos turnos.
- **Despliegue en NPU**: optimizado para AMD Ryzen AI XDNA2 mediante FastFlowLM, con cuantizacion Q4NX.

## 5. Casos de uso

- **Asistente virtual local en portatiles**: con ~3 GB de VRAM (cuantizacion Q4), el modelo puede ejecutarse en equipos con NPU AMD Ryzen AI XDNA2, ofreciendo asistencia conversacional sin conexion a internet.
- **Analisis de documentos largos**: gracias a su contexto de 262K tokens, puede resumir y extraer informacion de informes, papers o codigo fuente de mas de 200 paginas en un solo paso.
- **Anotacion de imagenes y accesibilidad**: su capacidad multimodal permite describir imagenes, generar alt-text o transcribir texto en imagenes para personas con discapacidad visual.
- **Generacion de codigo en entornos de desarrollo**: puede asistir en la escritura de codigo, explicacion de fragmentos y generacion de documentacion tecnica, aunque no se han publicado resultados de HumanEval para esta variante.
- **Traduccion multilingue**: con soporte para 201 idiomas, es util para traducir textos entre lenguas de baja representacion, aunque la calidad puede variar.
- **Prototipado de agentes RAG**: su contexto largo y capacidad de razonamiento permiten crear pipelines de Retrieval-Augmented Generation (RAG) con memoria amplia en aplicaciones de soporte tecnico.

## 6. Benchmarks y rendimiento

Segun la model card del modelo base Qwen3.5-4B, se publicaron los siguientes resultados en benchmarks de conocimiento y STEM, comparados con otros modelos:

| Modelo | MMLU-Pro |
|---|---|
| GPT-OSS-120B | 80.8 |
| GPT-OSS-20B | 74.8 |
| Qwen3-Next-80B-A3B-Thinking | 82.7 |
| Qwen3-30B-A3B-Thinking-2507 | 80.9 |
| Qwen3.5-9B | 82.5 |
| **Qwen3.5-4B** | **79.1** |

No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, etc.) en la informacion disponible. La tabla muestra que Qwen3.5-4B se situa por encima de GPT-OSS-20B y cerca de GPT-OSS-120B, lo que sugiere un buen rendimiento en conocimiento y STEM para su tamaño.

## 7. Requisitos de hardware

- **VRAM estimada**: ~3.5 GB en cuantizacion Q4 (segun la guia de theaibench.ai), lo que permite inferencia en GPU consumer de 4-6 GB y en NPU AMD Ryzen AI XDNA2.
- **GPUs compatibles**: cualquier GPU NVIDIA con 4 GB+ VRAM (GTX 1650, RTX 3050, RTX 4060), tambien CPU con al menos 8 GB de RAM.
- **NPU**: AMD Ryzen AI XDNA2 (serie Ryzen AI 300) con FastFlowLM para inferencia local eficiente.
- **Opciones de despliegue**: Transformers, vLLM, SGLang, KTransformers, FastFlowLM (para NPU).
- **Latencia y throughput**: no disponible en la informacion proporcionada; se espera que la arquitectura hibrida reduzca la latencia en comparacion con transformers densos de tamaño similar.

## 8. Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Qwen3.5-4B** | 4B | 262K | 79.1 | Apache-2.0 | Hugging Face |
| Qwen3-30B-A3B-Thinking | 30B (MoE, 3B activos) | 131K | 80.9 | Apache-2.0 | Hugging Face |
| GPT-OSS-20B | 20B | no disponible | 74.8 | Apache-2.0 | no disponible |
| Llama-3.2-3B | 3B | 128K | no disponible | Llama 3.2 license | no disponible |

La comparativa se basa en los datos de la model card. Qwen3.5-4B ofrece un rendimiento en MMLU-Pro superior a GPT-OSS-20B con solo un 20% de sus parametros, y se acerca a Qwen3-30B-A3B-Thinking, que es un modelo MoE mucho mayor. Su ventaja principal es la capacidad multimodal y el contexto largo.

## 9. Limitaciones y advertencias

- **Sesgos y alucinacion**: al ser un modelo de 4B, puede generar respuestas plausibles pero incorrectas en tareas de alta complejidad; no se han publicado evaluaciones especificas de sesgos para esta variante.
- **Riesgo de alucinacion**: el contexto de 1M tokens puede amplificar errores si se le presentan documentos contradictorios; se recomienda validacion externa.
- **Limitaciones de idioma**: aunque soporta 201 idiomas, la calidad en lenguas minoritarias puede ser inferior a la de ingles o chino.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales (consultar la licencia de Qwen en el enlace).
- **Repositorio no verificado**: este repositorio tiene 0 descargas y 0 likes, y fue creado recientemente; no hay evidencia de validacion independiente de su calidad ni de la cuantizacion Q4NX.
- **Caveat de produccion**: para uso en produccion, se recomienda evaluar el modelo con tus propios datos y considerar el despliegue con la version oficial de Qwen3.5-4B (Qwen/Qwen3.5-4B) en lugar de esta variante no oficial.

## 10. Enlaces

- Repositorio Hugging Face: https://huggingface.co/Atomic-Germ/Qwen3.5-4B-NPU2
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.5-4B
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Guia de ejecucion local de Qwen3.5-4B: https://theaibench.ai/models/qwen-3-5-4b/
- Guia completa de la serie Small: https://note.com/zephel01/n/n6b236da26?hl=en
