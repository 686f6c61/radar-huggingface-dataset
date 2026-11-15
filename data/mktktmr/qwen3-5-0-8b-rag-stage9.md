# mktktmr/qwen3.5-0.8b-rag-stage9

## Resumen

El modelo `mktktmr/qwen3.5-0.8b-rag-stage9` es un ajuste fino mediante LoRA del modelo base `Qwen/Qwen3.5-0.8B`, desarrollado por el usuario mktktmr y publicado en Hugging Face. Se trata de un modelo de aproximadamente 853 millones de parámetros (852.985.920 según los pesos en safetensors) orientado a tareas de generación aumentada por recuperación (RAG) en japonés, según se desprende de la model card y de los conjuntos de datos empleados en el entrenamiento. La nomenclatura "stage9" sugiere una novena iteración de un proceso de entrenamiento incremental.

El modelo parte de la familia Qwen3.5, de la que se toma el checkpoint de 0.8B como base, y se especializa mediante LoRA fusionado en el cuerpo del modelo sobre datos de question answering japonés. Concretamente, la model card indica que se parte de los datos de la etapa 6 y se añaden preguntas sintéticas de dos pasos generadas con el propio Qwen3.5-0.8B a partir de un conjunto de fragmentos de Wikipedia japonesa. Esto apunta a un entrenamiento orientado a razonamiento multi-salto y recuperación de contexto.

La relevancia del modelo es limitada en términos de adopción (cero descargas y cero likes en el momento de la consulta) y la información publicada es escasa: no se detallan hiperparámetros de entrenamiento, resultados de benchmarks ni licencia explícita del propio ajuste. Resulta útil como ejemplo de especialización de un modelo pequeño para QA japonés con datos de licencia CC BY-SA 4.0, pero su uso en producción requeriría validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; detalles no disponibles) |
| Parametros totales | 852.985.920 (aprox. 853 M) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; sin GGUF en el repo) |
| Idiomas soportados | no disponible oficialmente; el entrenamiento y los datos son en japones |
| Licencia | no disponible para el ajuste; el modelo base es Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `Qwen/Qwen3.5-0.8B` mediante LoRA, cuyos pesos se han fusionado posteriormente en el modelo base ("LoRA で追加学習し、本体にマージしたもの" según la model card). No se especifican en la información disponible detalles sobre la arquitectura interna del transformer base, el número de capas, la dimensión oculta ni la longitud de contexto nativa de Qwen3.5-0.8B. Tampoco se documentan hiperparámetros del entrenamiento (rango de LoRA, tasa de aprendizaje, número de épocas o pasos).

En cuanto a los datos, la model card detalla que se parte de los datos de la etapa 6 y se añaden preguntas sintéticas de dos pasos generadas con Qwen3.5-0.8B a partir de fragmentos de Wikipedia japonesa. Los conjuntos de datos empleados son JEMHopQA, NIILC QA y JSQuAD/JGLUE, todos ellos bajo licencia CC BY-SA 4.0 y modificados (filtrados y reformateados) para el entrenamiento. No se indica si hubo RLHF, DPO ni ninguna otra fase de alineación posterior al ajuste supervisado, ni se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y respuesta a preguntas en japonés, con especial énfasis en question answering sobre documentos y contextos recuperados.
- Razonamiento multi-salto (multi-hop), según se desprende del uso de JEMHopQA y de preguntas sintéticas de dos pasos en el entrenamiento.
- Comprensión lectora y extracción de respuestas a partir de pasajes, derivada de los datos de JSQuAD y NIILC QA.
- Capacidad de integrarse en pipelines RAG al haber sido entrenado con fragmentos de contexto (chunks) y preguntas asociadas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning autónomo: no disponible; el multi-salto documentado se refiere al formato de las preguntas de entrenamiento, no a un modo agente.
- Capacidades multilingües: no disponibles oficialmente; el entrenamiento es en japonés.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Respuesta a preguntas sobre documentación interna en japonés: el modelo puede recibir un fragmento de contexto recuperado y una pregunta para devolver una respuesta extractiva o generativa, aprovechando su ajuste sobre JSQuAD y NIILC QA.
- Sistemas RAG de atención al cliente en japonés: integrado en un pipeline que recupere pasajes de una base de conocimiento y los pase como contexto, el modelo responde consultas de usuarios con el estilo de QA aprendido.
- Preguntas multi-salto sobre bases de conocimiento estructuradas o semiestructuradas: su entrenamiento con JEMHopQA y preguntas sintéticas de dos pasos lo hace adecuado para consultas que requieren combinar información de varias fuentes.
- Extracción de respuestas en buscadores corporativos: dado un conjunto de chunks de Wikipedia o de documentos internos, el modelo puede localizar y formular la respuesta relevante.
- Prototipado rápido y experimentación académica: al ser un modelo de 0.8B, puede ejecutarse en hardware modesto para validar pipelines de RAG en japonés antes de escalar a modelos mayores.
- Evaluación de estrategias de chunking y recuperación: su tamaño reducido permite iterar rápidamente sobre la calidad de los fragmentos recuperados y medir el impacto en la respuesta final.
- Filtrado y reformateo de datos de entrenamiento: puede emplearse como generador de preguntas sintéticas o como modelo auxiliar en la construcción de datasets de QA, tal como se usó en su propio entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y KV cache.
- VRAM estimada en fp16/bf16: aproximadamente 1,7 GB para pesos, más overhead; viable en GPUs consumer con 4-6 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,9 GB para pesos; en 4 bits, aproximadamente 0,5 GB (requiere cuantización propia, ya que el repo no incluye GGUF).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 6-8 GB (RTX 3060, RTX 4060, RTX 4090) para fp16; A100/H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs con 6 GB o más en fp16, y en GPUs integradas o con poca memoria si se cuantiza.
- Opciones de despliegue: transformers (carga directa desde safetensors), vLLM y TGI para servir en fp16; llama.cpp/Ollama requerirían convertir los pesos a GGUF, conversión no publicada en el repo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mktktmr/qwen3.5-0.8b-rag-stage9 | 853 M | no disponible | no disponible (base Apache-2.0) | Hugging Face, 0 descargas | Ajuste LoRA fusionado para QA japonés |
| Qwen/Qwen3.5-0.8B | 0,8 B (aprox.) | no disponible | Apache-2.0 | Hugging Face (modelo base) | Modelo generalista sin especialización en japonés |
| Modelos QA japoneses de tamaño similar (p. ej. variantes de Qwen ajustadas con JGLUE) | ~0,5-1 B | variable | variable | variable | No se dispone de datos concretos verificables en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento (benchmarks) con alternativas, ya que el autor no publica métricas.

## Limitaciones y advertencias

- La licencia del ajuste no está declarada; aunque el modelo base es Apache-2.0, los datos de entrenamiento son CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-al-igual sobre obras derivadas. Conviene verificar la compatibilidad antes de un uso comercial.
- El modelo está especializado en japonés; su rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Riesgo de alucinación inherente a los modelos de 0,8B, especialmente en preguntas multi-salto o cuando el contexto recuperado es insuficiente.
- No se documentan sesgos conocidos, pero los datos provienen de Wikipedia japonesa y de conjuntos académicos, con los sesgos propios de esas fuentes.
- Longitud de contexto no documentada: no se puede garantizar el manejo de contextos largos en pipelines RAG con muchos fragmentos.
- Ausencia total de benchmarks y de métricas de evaluación: no hay evidencia publicada de su calidad frente al modelo base.
- Cero descargas y cero likes: no hay validación por parte de la comunidad; se recomienda evaluar exhaustivamente antes de cualquier despliegue en producción.
- Al ser un ajuste fusionado, no se publican los adaptadores LoRA originales, lo que limita la reproducibilidad del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mktktmr/qwen3.5-0.8b-rag-stage9
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- NIILC QA: https://github.com/mynlp/niilc-qa
- JSQuAD / JGLUE: https://github.com/yahoojapan/JGLUE
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
