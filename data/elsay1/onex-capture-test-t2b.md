# elsay1/onex-capture-test-t2b

## Resumen

El modelo `elsay1/onex-capture-test-t2b` es una copia del modelo DistilGPT2, un modelo de lenguaje en inglés desarrollado por Hugging Face mediante destilación de conocimiento (knowledge distillation) a partir de GPT-2, concretamente de la versión de 124 millones de parámetros. El modelo resultante tiene aproximadamente 82 millones de parámetros (aunque los pesos en safetensors de este repositorio indican 88.204.032 parámetros), lo que lo convierte en una alternativa más rápida y ligera al GPT-2 original, manteniendo unas capacidades de generación de texto similares.

Este modelo resuelve el problema de la eficiencia computacional en la generación de texto, ofreciendo un rendimiento cercano al de GPT-2 con un coste de inferencia significativamente menor. Su relevancia actual radica en que sigue siendo una opción útil para aplicaciones de generación de texto en entornos con recursos limitados, como CPUs o GPUs de gama baja, y para tareas de autocompletado, escritura creativa o chatbots sencillos. La arquitectura es un transformer decoder-only con 6 capas, 8 cabezas de atención y una dimensión de embedding de 768, con una longitud de contexto de 1024 tokens.

El repositorio incluye pesos en formato safetensors, así como conversiones a TFLite y CoreML, lo que facilita su despliegue en entornos móviles y edge. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 destilado) |
| Parametros totales | 88.204.032 (según safetensors; la model card indica 82M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos en fp32/fp16; conversiones TFLite y CoreML disponibles) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, TFLite, CoreML |

## Arquitectura y entrenamiento

DistilGPT2 es un transformer decoder-only con 6 capas, 8 cabezas de atención, dimensión de embedding de 768 y 1024 tokens de contexto. Se entrenó mediante destilación de conocimiento, utilizando como modelo profesor el GPT-2 de 124 millones de parámetros. El proceso de destilación se basa en el trabajo de Sanh et al. (2019), donde el modelo alumno se entrena para replicar las distribuciones de probabilidad de salida del modelo profesor, combinando la pérdida de destilación con la pérdida de modelado de lenguaje estándar.

El modelo se preentrenó en el dataset OpenWebText, una versión curada de los datos de entrenamiento de GPT-2. No se aplicaron técnicas de RLHF ni DPO. La model card reporta emisiones de CO2 de 149.200 kg equivalentes, aunque no se especifica el periodo exacto de entrenamiento. El modelo no presenta innovaciones técnicas destacables más allá de la propia destilación, que reduce el tamaño del modelo original en aproximadamente un 34% manteniendo la mayor parte de su capacidad generativa.

## Capacidades

- Generación de texto en inglés: autocompletado, continuación de texto y generación libre.
- Escritura creativa: capaz de generar ficción, poesía y otros textos literarios.
- Asistencia de escritura: sugerencias de gramática y autocompletado de prosa o código.
- Chatbots y entretenimiento: puede usarse para crear personajes conversacionales o generaciones lúdicas.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni modo agente.
- No tiene capacidades multimodales (solo texto).
- No dispone de modo "thinking" ni razonamiento explícito.

## Casos de uso

- Autocompletado de texto en editores: el modelo puede integrarse en editores de código o procesadores de texto para sugerir continuaciones de frases o bloques de código, aprovechando su baja latencia en CPU.
- Asistente de escritura creativa: escritores pueden usarlo para generar borradores, superar bloqueos creativos o explorar direcciones narrativas alternativas, gracias a su capacidad para producir texto coherente y variado.
- Chatbots sencillos: su tamaño reducido permite desplegarlo en servidores modestos o incluso en el navegador mediante WebAssembly, facilitando la creación de asistentes conversacionales básicos.
- Generación de datos sintéticos: puede emplearse para crear datasets de entrenamiento sintéticos en inglés, por ejemplo para fine-tuning de modelos más pequeños o para aumentar la diversidad de datos.
- Aplicaciones educativas: útil para demostraciones de generación de lenguaje, experimentos de destilación o como modelo base para enseñar conceptos de PLN.
- Prototipado rápido: su licencia permisiva y su facilidad de uso con la librería Transformers lo convierten en una opción rápida para validar ideas de productos que requieran generación de texto.

## Benchmarks y rendimiento

El autor declara en el model-index el siguiente resultado:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Text Generation | WikiText-103 | Perplexity | 21,1 |

No se han publicado resultados adicionales en la informacion disponible. Para contexto, el GPT-2 original (124M) obtiene una perplexity de aproximadamente 19,9 en WikiText-103, por lo que la destilacion supone una perdida de rendimiento moderada a cambio de una mayor eficiencia.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~88M parametros, ocupa aproximadamente 350 MB en fp32 y ~175 MB en fp16. Puede ejecutarse en GPU con 1-2 GB de VRAM sin problemas.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, etc.). Tambien funciona correctamente en CPU.
- Compatible con consumer GPU: si, incluyendo GPUs integradas de Intel o AMD.
- Opciones de despliegue: Transformers (Python), ONNX Runtime, TFLite, CoreML, llama.cpp (con conversion a GGUF), vLLM (aunque es excesivo para este tamano).
- Latencia: en CPU moderna, genera aproximadamente 20-50 tokens/segundo; en GPU, 100-300 tokens/segundo, dependiendo del hardware y la configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplexity (WikiText-103) | Licencia |
|---|---|---|---|---|
| DistilGPT2 (este modelo) | 82M | 1024 | 21,1 | Apache 2.0 |
| GPT-2 Small | 124M | 1024 | 19,9 | MIT |
| GPT-2 Medium | 355M | 1024 | 18,3 | MIT |

DistilGPT2 ofrece un equilibrio entre rendimiento y eficiencia, siendo aproximadamente un 34% mas pequeño que GPT-2 Small con una perdida de perplexity de solo 1,2 puntos. Su licencia Apache 2.0 es mas permisiva que la MIT de GPT-2 en cuanto a patentes, aunque ambas permiten uso comercial.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo refleja los sesgos presentes en OpenWebText, incluyendo estereotipos de genero, raza y profesion. Los ejemplos de la model card muestran diferencias en las generaciones segun la raza del sujeto.
- Riesgo de alucinacion: como todos los modelos de lenguaje, no distingue entre hechos y ficcion. No debe usarse en aplicaciones que requieran veracidad factual.
- Limitaciones de idioma: solo entrenado en ingles; su rendimiento en otros idiomas es muy pobre o inexistente.
- Limitaciones de contexto: 1024 tokens es una ventana corta para tareas que requieran contexto largo.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero no ofrece garantias ni soporte.
- Advertencia para produccion: el modelo no tiene mecanismos de seguridad ni filtros de contenido. En aplicaciones publicas, se recomienda implementar filtros de toxicidad y moderacion adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/elsay1/onex-capture-test-t2b
- Modelo original DistilGPT2: https://huggingface.co/distilgpt2
- Repositorio de destilacion de Hugging Face: https://github.com/huggingface/transformers/tree/main/examples/research_projects/distillation
- Paper de destilacion (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Model card de GPT-2: https://github.com/openai/gpt-2/blob/master/model_card.md
- Aplicacion Write With Transformers: https://transformer.huggingface.co/doc/distil-gpt2
