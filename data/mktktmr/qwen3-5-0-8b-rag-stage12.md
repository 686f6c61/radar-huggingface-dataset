# mktktmr/qwen3.5-0.8b-rag-stage12

## Resumen

`mktktmr/qwen3.5-0.8b-rag-stage12` es un ajuste fino por LoRA, fusionado en los pesos finales, del modelo base Qwen/Qwen3.5-0.8B (licencia Apache-2.0). Lo publica el usuario mktktmr en Hugging Face y está orientado específicamente a tareas de generación aumentada por recuperación (RAG) sobre corpus en japonés. El modelo no introduce una arquitectura nueva: hereda la de Qwen3.5 y solo modifica los pesos mediante entrenamiento supervisado sobre datos de pregunta-respuesta con contexto documental.

La particularidad de esta iteración (etapa 12) es que amplía el conjunto de entrenamiento de la etapa 11 con ejemplos construidos a partir de preguntas de JEMHopQA que el sistema de recuperación no resolvía correctamente, incorporando a esos ejemplos el fragmento (chunk) que sí contenía la respuesta. El objetivo es que el modelo aprenda a responder cuando el contexto recuperado es imperfecto o parcial, un escenario habitual en pipelines RAG reales.

Con 852.985.920 parámetros (aproximadamente 0,85 mil millones) y un repositorio de 1,7 GB en formato safetensors, es un modelo pequeño pensado para despliegue con requisitos de hardware modestos. La información pública disponible es muy limitada: no consta pipeline declarado, ni licencia propia, ni idiomas declarados, ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-0.8B); no se documentan modificaciones estructurales |
| Parámetros totales | 852.985.920 (según safetensors) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no se especifica en la model card) |
| Tipos de cuantización | no disponible (el repo contiene safetensors sin cuantizar; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible en los metadatos; el entrenamiento se realizó sobre corpus en japonés (JEMHopQA, NIILC QA, JSQuAD/JGLUE) |
| Licencia | no disponible en los metadatos del repo; el modelo base es Apache-2.0 y los datos de entrenamiento son CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5. El autor indica que aplicó LoRA sobre el modelo base y posteriormente fusionó (merge) los adaptadores en los pesos del modelo, de modo que el artefacto publicado es un checkpoint completo y no un adaptador separado. No se documentan cambios en la arquitectura, la tokenización ni la ventana de contexto respecto al modelo original.

El entrenamiento se realizó en etapas sucesivas. La etapa 12, que es la publicada, parte de los datos de la etapa 11 y añade ejemplos derivados de JEMHopQA en los que el sistema de recuperación no obtenía la respuesta correcta, incluyendo en el ejemplo el chunk distribuido que sí contenía la respuesta. Las fuentes de datos declaradas son JEMHopQA, NIILC QA y JSQuAD/JGLUE, todas bajo CC BY-SA 4.0 y modificadas (filtrado y reformateo) para el entrenamiento, más un conjunto de chunks distribuidos derivados de Wikipedia en japonés (CC BY-SA 4.0). No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto y respuesta a preguntas extractivas y generativas sobre contexto documental en japonés, que es el foco explícito del ajuste.
- Respuesta con contexto recuperado imperfecto: el entrenamiento de la etapa 12 incorpora ejemplos donde la recuperación fallaba, lo que busca mejorar la robustez ante chunks parciales o ruidosos.
- Comprensión lectora sobre pasajes: el uso de JSQuAD/JGLUE sugiere entrenamiento en extracción de respuestas desde un texto dado.
- Capacidades heredadas del modelo base Qwen3.5-0.8B (generación general, razonamiento básico, código) que no han sido evaluadas ni documentadas para este checkpoint.
- Soporte de tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Capacidades multilingües: no documentadas; el ajuste se centra en japonés.
- Modo thinking, visión o audio: no disponible en la documentación.

## Casos de uso

- Respuesta a preguntas sobre documentación interna en japonés: el modelo recibe un contexto recuperado (por ejemplo, fragmentos de manuales o políticas) y genera la respuesta citando la información del pasaje; su tamaño reducido permite desplegarlo en entornos con pocos recursos.
- Pipelines RAG con recuperación imperfecta: al haberse entrenado con ejemplos donde el chunk correcto no se recuperaba en primer lugar, puede ser útil en sistemas donde el recall del retriever no es perfecto y se necesita que el generador aproveche fragmentos parciales.
- Extracción de respuestas sobre pasajes tipo SQuAD: adecuado para tareas de question answering extractivo sobre textos japoneses, dado el entrenamiento con JSQuAD/JGLUE.
- Prototipado rápido de asistentes documentales: con menos de mil millones de parámetros, sirve para validar arquitecturas RAG de extremo a extremo antes de escalar a modelos mayores.
- Evaluación comparativa de estrategias de recuperación: al ser un modelo pequeño y especializado, permite medir de forma económica el impacto de cambios en el retriever o en el reformateo de chunks.
- Despliegue en el borde o en CPU: su tamaño (1,7 GB en safetensors en precisión original) hace viable la inferencia en hardware modesto, útil para demos o entornos sin GPU dedicada.
- Filtrado y reordenación de respuestas candidatas: puede emplearse como modelo de verificación que comprueba si un pasaje recuperado contiene la respuesta a una pregunta concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 1,7-2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 3-4 GB para contextos moderados.
- Cuantización a 8 bits: aproximadamente 0,9-1 GB de pesos; a 4 bits: en torno a 0,5 GB, aunque el autor no publica variantes cuantizadas y habría que generarlas.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (por ejemplo, RTX 3050, RTX 4060, RTX 4090) es suficiente; en el segmento profesional, A100 o H100 no son necesarias y aportarían sobre todo throughput.
- Cabe en GPU consumer: sí, con margen amplio, incluso en GPUs de gama de entrada.
- Opciones de despliegue: al publicarse solo en safetensors con arquitectura Qwen3.5, es desplegable con transformers, vLLM o TGI si la versión de estas herramientas soporta la arquitectura; para llama.cpp u Ollama habría que convertir los pesos a GGUF, algo que el autor no proporciona.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mktktmr/qwen3.5-0.8b-rag-stage12 | 852.985.920 | no disponible | RAG en japonés (fine-tuning) | no disponible en el repo (base Apache-2.0) | Hugging Face, safetensors |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8 B | no disponible en esta ficha | Modelo generalista | Apache-2.0 | Hugging Face |
| Otros fine-tunes RAG de <1 B en japonés | no disponible | no disponible | RAG / QA | variable | no disponible en la información consultada |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: no se han publicado métricas de este checkpoint ni se han identificado en la información proporcionada modelos directamente comparables de la misma categoría y tamaño.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste está orientado a QA sobre corpus japoneses (JEMHopQA, NIILC QA, JSQuAD); su rendimiento en otras tareas o idiomas no está evaluado y probablemente sea inferior al del modelo base.
- Riesgo de sobreajuste a los formatos de datos de entrenamiento: si el prompt o el formato de los chunks en producción difieren de los usados en el ajuste, el rendimiento puede degradarse.
- Licencia no declarada en el repositorio: aunque el modelo base es Apache-2.0, los datos de entrenamiento son CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-igual sobre el modelo derivado; conviene verificar la situación legal antes de un uso comercial.
- Sin datos de benchmarks ni evaluaciones publicadas: no hay evidencia objetiva de mejora frente a la etapa 11 ni frente al modelo base.
- Riesgo de alucinación: como todo modelo generativo de este tamaño, puede producir respuestas no respaldadas por el contexto, especialmente con contextos largos o ambiguos.
- Idiomas: no se declaran idiomas soportados en los metadatos; el ajuste se centró en japonés y no hay garantías sobre castellano u otras lenguas.
- Contexto: no se especifica la longitud de contexto efectiva de este checkpoint; debe asumirse la del modelo base, sin confirmación.
- Sin pipeline declarado ni variantes cuantizadas oficiales: requiere trabajo adicional de conversión para despliegues en llama.cpp u Ollama.
- Modelo con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mktktmr/qwen3.5-0.8b-rag-stage12
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- NIILC QA: https://github.com/mynlp/niilc-qa
- JSQuAD / JGLUE: https://github.com/yahoojapan/JGLUE
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
