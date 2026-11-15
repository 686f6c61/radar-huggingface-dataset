# OkamotoJP/llm2-qwen35-sft026b

## Resumen

sft026b es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario OkamotoJP en el contexto del curso «LLM講座2 2026» (asignatura final centrada en RAG). El modelo se ha entrenado mediante LoRA (r=16, alpha=32) y posteriormente se han fusionado los pesos adaptados con los originales, de modo que la estructura resultante es idéntica a la del modelo base: solo se han actualizado los pesos de la parte lingüística. Su propósito declarado es la generación de respuestas en un sistema de recuperación aumentada (RAG) sobre documentación en japonés.

El modelo cuenta con 873.438.784 parámetros (aproximadamente 0,87 mil millones) y está especializado en japonés. El entrenamiento se ha realizado sobre un conjunto pequeño y muy específico de 1.143 ejemplos, combinando JEMHopQA (razonamiento multi-salto), auto-wiki-qa (preguntas y respuestas generadas a partir de Wikipedia) y fragmentos de Wikipedia japonesa como material de contexto en los prompts. Se trata, por tanto, de un modelo de nicho, orientado a la respuesta extractiva y composicional en japonés, no a un asistente generalista.

Su relevancia es limitada pero concreta: demuestra un flujo de trabajo reproducible de ajuste fino con LoRA sobre un modelo pequeño y con licencia permisiva (Apache-2.0), lo que permite desplegarlo en hardware muy modesto y utilizarlo como componente de generación en pipelines RAG en japonés. No obstante, al no disponer de benchmarks publicados ni de descargas, debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-0.8B; detalles internos no disponibles) |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; admite cuantizacion posterior a criterio del usuario, sin datos oficiales) |
| Idiomas soportados | Japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio de 1,8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen/Qwen3.5-0.8B (revision 2fc06364715b967f1860aea9cf38778875588b17), un transformer decoder-only de aproximadamente 0,87 mil millones de parámetros. El ajuste se realizó con LoRA de rango 16 y alpha 32, tasa de aprendizaje 0,0001 y una sola época, tras lo cual los adaptadores se fusionaron con los pesos originales; según la model card, únicamente se actualizaron los pesos de la parte lingüística, manteniendo la estructura del modelo base intacta. No se especifica si el modelo base incorpora innovaciones como atención lineal, decodificación especulativa o modos de razonamiento extendido.

El conjunto de entrenamiento consta de 1.143 ejemplos con la siguiente composición: 443 de auto_wiki_qa, 369 de jemhopqa_train_sft/compositional, 267 de jemhopqa_train_ev/compositional y 64 de synth_compo/compositional. Las fuentes son JEMHopQA (CC BY-SA 4.0), cl-nagoya/auto-wiki-qa (CC BY-SA 4.0) y un conjunto de fragmentos derivados de Wikipedia japonesa (CC BY-SA 4.0) empleado como material de contexto en los prompts. No se documenta el uso de RLHF, DPO ni de datos sintéticos adicionales más allá de la partición «synth_compo».

## Capacidades

- Generación de texto en japonés orientada a responder preguntas a partir de contexto documental (RAG).
- Razonamiento multi-salto y composicional, entrenado específicamente con ejemplos de JEMHopQA de tipo compositional.
- Respuesta extractiva sobre fragmentos de Wikipedia japonesa proporcionados en el prompt.
- Capacidad de seguir instrucciones de formato propias de un pipeline RAG (pregunta + contexto + respuesta).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible (no documentado).
- Capacidades multilingües: limitadas al japonés según la model card; el comportamiento en otros idiomas no está evaluado.
- Modo thinking, visión o audio: no disponible (no documentado).

## Casos de uso

- Generación de respuestas en un sistema RAG en japonés: el modelo está entrenado explícitamente para recibir fragmentos de Wikipedia japonesa como contexto y producir la respuesta final, por lo que encaja como componente de generación tras el recuperador en pipelines de preguntas y respuestas documentales.
- Preguntas multi-salto sobre documentación corporativa en japonés: su entrenamiento con JEMHopQA compositional lo hace adecuado para preguntas que requieren combinar información de varios pasajes, siempre que el recuperador aporte los fragmentos correctos.
- Asistente interno de consulta de manuales técnicos: con 0,87 mil millones de parámetros puede desplegarse en una única GPU de gama media o incluso en CPU con cuantización, sirviendo respuestas extractivas sobre manuales internos en japonés.
- Prototipado rápido de sistemas de QA documental: su tamaño reducido y licencia Apache-2.0 permiten iterar con costes de inferencia bajos y sin restricciones comerciales derivadas de la licencia del modelo.
- Evaluación académica de técnicas de ajuste fino: sirve como referencia reproducible de un SFT con LoRA sobre un modelo pequeño, útil para comparar estrategias de entrenamiento en cursos o laboratorios.
- Filtrado y resumen de pasajes recuperados: puede reformular o condensar fragmentos de Wikipedia japonesa recuperados por un buscador antes de mostrarlos al usuario final.
- Generación de respuestas en un chatbot de soporte de nicho en japonés: viable si el dominio está acotado y se controla estrictamente el contexto inyectado, dado el limitado tamaño del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: en torno a 1 GB para pesos; en 4 bits, alrededor de 0,5 GB, aunque no hay cuantizaciones oficiales publicadas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (por ejemplo, RTX 3050, RTX 4060, T4); para mayor throughput, A10G, L4 o A100.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer recientes con 4 GB o más de VRAM; también es viable en CPU con llama.cpp u Ollama si se generan cuantizaciones GGUF a partir de los safetensors.
- Opciones de despliegue: transformers (PyTorch) de forma nativa; vLLM y TGI son viables tras verificar compatibilidad con la arquitectura Qwen3.5; llama.cpp y Ollama requieren conversión previa a GGUF.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| OkamotoJP/llm2-qwen35-sft026b | 873 M | No disponible | Japones | Apache-2.0 | SFT con LoRA sobre Qwen3.5-0.8B, orientado a RAG en japones |
| Qwen/Qwen3.5-0.8B | ~0,8 B | No disponible | No disponible | Apache-2.0 | Modelo base sin ajuste; capacidades generales, no especializado en RAG japones |
| cl-nagoya/auto-wiki-qa (dataset, no modelo) | No aplica | No aplica | Japones | CC BY-SA 4.0 | Fuente de datos de entrenamiento; se cita como referencia del dominio |
| Modelos japoneses de ~1 B (por ejemplo, variantes de Llama o Qwen ajustadas en japones) | ~1 B | Variable | Japones | Variable | No se dispone de datos comparativos verificados en la informacion proporcionada |

No se dispone de resultados de benchmarks que permitan una comparación cuantitativa con alternativas; la comparativa anterior es estructural y de licencia.

## Limitaciones y advertencias

- Entrenado únicamente con 1.143 ejemplos y una sola época: riesgo elevado de sobreajuste al formato exacto de los prompts de entrenamiento y de generalización pobre fuera de ese formato.
- Especializado en japonés; su rendimiento en castellano u otros idiomas no está evaluado y previsiblemente será deficiente.
- Riesgo de alucinación inherente a un modelo de 0,87 mil millones de parámetros, especialmente cuando el contexto recuperado no contiene la respuesta; debe acompañarse de mecanismos de verificación y de abstención.
- Sin benchmarks publicados ni descargas registradas: no hay evidencia pública de calidad que respalde su uso en producción.
- La licencia del modelo es Apache-2.0, pero los datos de entrenamiento son CC BY-SA 4.0 (JEMHopQA, auto-wiki-qa y fragmentos de Wikipedia japonesa); conviene revisar las obligaciones de atribución y compartir-igual que puedan derivarse del uso de esos datos en determinados contextos.
- Longitud de contexto no documentada: no debe asumirse una ventana amplia; los pipelines RAG deben limitar el número de fragmentos inyectados.
- No se documentan capacidades de tool calling, agentes ni modos de razonamiento extendido; no deben asumirse en diseño de sistemas.
- Modelo de nicho con cero descargas y creado en el contexto de un curso: no hay garantía de mantenimiento ni de soporte por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft026b
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA (GitHub): https://github.com/aiishii/JEMHopQA
- Dataset cl-nagoya/auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
