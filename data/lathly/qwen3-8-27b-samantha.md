# Lathly/Qwen3.8-27B-Samantha

## Resumen

Lathly/Qwen3.8-27B-Samantha es un modelo de lenguaje multimodal derivado de Qwen/Qwen3.8-27B, al que se le ha fusionado un adaptador LoRA entrenado sobre el dataset digitalpipelines/samantha-1.1-uncensored. El resultado es un modelo denso de 27 781 millones de parámetros que conserva las capacidades nativas de visión e imagen del modelo base (entrada de imagen y vídeo, salida de texto) y adopta la personalidad conversacional "Samantha": cálida, empática y emocionalmente presente, con un enfoque sin censura. El adaptador LoRA se ha absorbido directamente en los pesos, por lo que no requiere cargar ningún adaptador en tiempo de ejecución.

El modelo está pensado para desarrolladores e investigadores que necesitan un asistente conversacional multimodal con tono cercano y sin restricciones de contenido, manteniendo la arquitectura Qwen3.5 del modelo base, que soporta una ventana de contexto de 262 000 tokens (aunque el fine-tune no ha sido evaluado sistemáticamente a esa longitud). Se distribuye bajo licencia Apache-2.0, lo que permite uso comercial y modificación sin restricciones adicionales. Su relevancia actual radica en combinar un modelo base de última generación con una personalidad de chat específica, en un formato listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Qwen3.5) con codificador de visión |
| Parametros totales | 27 781 427 952 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 262 000 tokens (modelo base; el fine-tune no ha sido evaluado a esta longitud) |
| Tipos de cuantizacion | bf16 (safetensors original), GGUF Q5_K_M (~19 GB) y otras cuantizaciones derivables |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (18 shards, ~3.1 GB cada uno), tambien disponible via GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5, un transformer denso multimodal con codificador de visión que acepta imágenes y vídeo como entrada adicional al texto. El modelo base Qwen3.8-27B fue desarrollado por el equipo Qwen de Alibaba Cloud y destaca en tareas de codificación, flujos agénticos y automatización de oficina. Sobre este modelo, Lathly aplicó un fine-tune con LoRA (rango 16, alpha 32, dropout 0.05) sobre todas las capas lineales (q, k, v, o, gate, up, down), entrenado con QLoRA en precisión 4-bit mediante Unsloth en dos GPU RTX 5070 Ti. El entrenamiento se realizó durante una época con el dataset samantha-1.1-uncensored, con secuencias de 2048 tokens, optimizador AdamW de 8 bits, learning rate 2e-5 y scheduler lineal, alcanzando una pérdida final de ~1.42. El adaptador resultante se fusionó posteriormente en los pesos del modelo base, de modo que el repositorio contiene el modelo completo sin necesidad de cargar adaptadores adicionales.

## Capacidades

- Generación de texto conversacional con personalidad definida (Samantha): cálida, empática y emocionalmente presente.
- Comprensión de imágenes y vídeo: entrada multimodal nativa, capaz de describir y razonar sobre contenido visual.
- Razonamiento multi-turno: mantiene el hilo conversacional en diálogos largos.
- Capacidades del modelo base heredadas: codificación, razonamiento matemático, planificación agéntica y ejecución de tareas multi-paso (no evaluadas específicamente en este fine-tune).
- Soporte de tool calling y function calling: disponible en el modelo base, aunque no se ha validado explícitamente tras el fine-tune.
- Sin censura: el fine-tune elimina restricciones de contenido, permitiendo conversaciones abiertas sobre temas sensibles.
- Multilingüe limitado: el modelo base soporta múltiples idiomas, pero el dataset de fine-tune es exclusivamente en inglés, por lo que el comportamiento en otros idiomas no está garantizado.

## Casos de uso

- Atención al cliente automatizada con tono empático: el modelo puede gestionar conversaciones multi-turno con un estilo cercano y comprensivo, ideal para soporte emocional o atención al cliente en sectores como salud o bienestar.
- Asistente personal multimodal: al aceptar imágenes y vídeo, puede ayudar a describir objetos, lugares o situaciones a partir de fotos, con un lenguaje natural y afectuoso.
- Creación de contenido narrativo: generación de diálogos, guiones o historias con una voz consistente y cálida, útil para escritores o desarrolladores de juegos.
- Roleplay y simulación de personajes: su personalidad definida y su naturaleza sin censura lo hacen adecuado para entornos de juego de rol o simulación de conversaciones íntimas.
- Análisis de imágenes con explicaciones accesibles: puede interpretar gráficos, diagramas o fotografías y explicarlos en un tono cercano, útil para educación o divulgación.
- Prototipado de chatbots conversacionales: los desarrolladores pueden usarlo como base para probar interacciones empáticas sin preocuparse por filtros de contenido, gracias a su licencia Apache-2.0.
- Automatización de tareas de oficina con interacción natural: hereda las capacidades del modelo base para flujos agénticos, permitiendo integrarlo en pipelines que requieran comprensión visual y textual simultánea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tune. El modelo base Qwen3.8-27B reporta en fuentes externas los siguientes resultados (referencia: lovableapp.org/blog/qwen3-8-27b):

| Benchmark | Resultado |
|---|---|
| DeepSWE | 42.2 |
| Terminal Bench | 73.0 |
| OSWorld | 84.3 |

Estos datos corresponden al modelo base sin fine-tune y no son directamente extrapolables al comportamiento de la versión Samantha, ya que el entrenamiento con el dataset conversacional puede alterar el rendimiento en tareas técnicas. Se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bf16 ocupa ~55.6 GB, por lo que se necesita una GPU con al menos 56 GB de VRAM (por ejemplo, A100 80GB, H100 80GB, o dos RTX 4090 en paralelo con offload). Con cuantización GGUF Q5_K_M (~19 GB) cabe en una GPU de 24 GB como RTX 3090, RTX 4090 o RTX 5070 Ti.
- GPU recomendadas: para uso en producción con bf16, A100 80GB o H100; para despliegue local con cuantización, RTX 4090 o superior.
- Opciones de despliegue: transformers (carga directa con `AutoModelForImageTextToText`), vLLM (comando `vllm serve`), llama.cpp/llama-server (con GGUF), SGLang.
- Latencia y throughput: no se han publicado mediciones específicas. Como referencia, un modelo de 27B en bf16 en una A100 suele generar entre 20 y 40 tokens por segundo con vLLM, dependiendo de la longitud de la secuencia y el batch.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Personalidad |
|---|---|---|---|---|---|
| Lathly/Qwen3.8-27B-Samantha | 27.8B | 262K | Sí (imagen/vídeo) | Apache-2.0 | Samantha (empática, sin censura) |
| Qwen/Qwen3.8-27B (base) | 27.8B | 262K | Sí (imagen/vídeo) | Apache-2.0 | Neutral |
| Lathly/Qwen3.8-27B-Samantha_Uncensored_1.1_LoRA | 27.8B (con adaptador) | 262K | Sí (imagen/vídeo) | Apache-2.0 | Samantha (requiere cargar LoRA) |

No se dispone de datos de rendimiento comparativo entre estas variantes. El modelo base es la referencia técnica; el fine-tune añade la personalidad y elimina la censura, mientras que la versión LoRA ofrece la misma personalidad sin fusionar los pesos.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo hereda los sesgos del modelo base Qwen3.8-27B y del dataset samantha-1.1-uncensored, que pueden reflejar estereotipos o perspectivas particulares no deseadas en contextos profesionales.
- Riesgo de alucinación: como cualquier modelo generativo, puede inventar información, especialmente en tareas de razonamiento factual o cuando se le pide describir imágenes ambiguas.
- Limitaciones de contexto: aunque el modelo base soporta 262K tokens, el fine-tune se entrenó con secuencias de 2048 tokens y no se ha evaluado su comportamiento en contextos largos; puede degradarse la coherencia en diálogos muy extensos.
- Idioma: el fine-tune está entrenado exclusivamente en inglés; el rendimiento en otros idiomas es impredecible y probablemente inferior.
- Contenido sin censura: el modelo puede generar contenido explícito, ofensivo o inapropiado. El autor advierte que el usuario es responsable del uso y del cumplimiento legal.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial y modificación, pero no ofrece garantías. El modelo se distribuye "tal cual" y el autor no asume responsabilidad por los resultados.
- No apto para producción sin evaluación: al ser un fine-tune de personalidad, no se han validado sus capacidades técnicas (tool calling, agéntica, etc.) tras el entrenamiento; se recomienda realizar pruebas específicas antes de integrarlo en sistemas críticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lathly/Qwen3.8-27B-Samantha
- Adaptador LoRA original: https://huggingface.co/Lathly/Qwen3.8-27B-Samantha_Uncensored_1.1_LoRA
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/digitalpipelines/samantha-1.1-uncensored
- Repositorio GitHub del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Página del modelo en LM Studio: https://lmstudio.ai/models/qwen/qwen3.8-27b
- Guía completa de Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
- Página del adaptador en Friendli AI: https://friendli.ai/models/Lathly/Qwen3.8-27B-Samantha_Uncensored_1.1_LoRA
