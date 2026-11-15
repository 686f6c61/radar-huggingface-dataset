# OkamotoJP/llm2-qwen35-sft013

## Resumen

`OkamotoJP/llm2-qwen35-sft013` es un ajuste fino (SFT) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario OkamotoJP como entrega final del curso "LLM講座2 2026". El modelo está especializado en la generación de respuestas para sistemas RAG (Retrieval-Augmented Generation) en japonés, entrenado sobre datos derivados de JEMHopQA y auto-wiki-qa. Se distribuye con licencia Apache 2.0 y formato safetensors.

Técnicamente se trata de un transformer decoder-only de 873.438.784 parámetros (aproximadamente 0,87 mil millones), resultado de aplicar un LoRA con r=16 y alpha=32 sobre el modelo base y fusionar posteriormente los pesos adaptados con los originales. La arquitectura subyacente es la del Qwen3.5-0.8B, incluyendo su tokenizer y su ventana de contexto nativa, aunque la model card no detalla estos parámetros de forma explícita.

Su relevancia es acotada: no es un modelo de propósito general ni compite en benchmarks abiertos, sino un artefacto educativo y experimental orientado a un caso de uso muy concreto (generación de respuestas RAG en japonés). Resulta útil como referencia para quienes quieran replicar pipelines de SFT con LoRA sobre modelos pequeños de la familia Qwen, o para experimentar con RAG en japonés en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5, pesos fusionados tras LoRA) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en el repo) |
| Idiomas soportados | japones (ja); el modelo base Qwen3.5-0.8B es multilingue, pero el ajuste se ha realizado solo en japones |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5, en su variante de 0,8 mil millones de parámetros. El autor indica que la estructura es idéntica a la del modelo base y que solo se han actualizado los pesos de la parte lingüística. El ajuste se realizó mediante LoRA con rango 16, alpha 32 y learning rate 0,0001, durante una única época sobre 1.702 ejemplos, tras lo cual los adaptadores se fusionaron con los pesos originales (revisión `2fc06364715b967f1860aea9cf38778875588b17` de Qwen/Qwen3.5-0.8B).

Los datos de entrenamiento provienen de tres fuentes, todas bajo licencia CC BY-SA 4.0: JEMHopQA (conjunto de QA multi-hop en japonés, filtrado y reformateado), `cl-nagoya/auto-wiki-qa` (muestreado, filtrado y reformateado) y un conjunto de chunks distribuidos derivados de Wikipedia en japonés, usados como contexto documental en los prompts de entrenamiento. No se menciona el uso de RLHF, DPO ni técnicas de alineación adicionales; el proceso es SFT supervisado puro. Tampoco se documentan innovaciones técnicas propias más allá del pipeline de ajuste.

## Capacidades

- Generación de texto en japonés, orientada a respuestas concisas y fundamentadas en documentos de contexto.
- Respuesta a preguntas sobre documentación recuperada (RAG): el modelo ha sido entrenado explícitamente con prompts que incluyen chunks de Wikipedia como material de referencia.
- Razonamiento multi-hop limitado: parte del entrenamiento proviene de JEMHopQA, un dataset de preguntas que requieren combinar varias entidades o hechos.
- Comprensión lectora en japonés sobre pasajes cortos o medianos.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta modo "thinking", visión, audio ni otras modalidades.
- Capacidad multilingüe no garantizada: aunque el modelo base es multilingüe, el ajuste se ha hecho solo con datos en japonés, por lo que el rendimiento en otros idiomas puede degradarse.

## Casos de uso

- Generación de respuestas en un pipeline RAG en japonés: el modelo recibe la pregunta del usuario junto con los chunks recuperados y produce una respuesta fundamentada. Es su caso de uso principal y el que motivó el entrenamiento.
- Sistemas de preguntas y respuestas sobre documentación interna: con un retriever adecuado, puede responder sobre manuales, políticas o bases de conocimiento en japonés con bajo coste computacional.
- Asistente de consulta sobre Wikipedia japonesa: dado el origen de los datos (chunks de Wikipedia y auto-wiki-qa), encaja en escenarios de exploración enciclopédica.
- Prototipado rápido de asistentes conversacionales en japonés: al ser un modelo de menos de 1B parámetros, se puede desplegar en una sola GPU consumer para pruebas de concepto.
- Evaluación de pipelines de SFT con LoRA: sirve como referencia reproducible para comparar configuraciones (rango, alpha, datos) en modelos pequeños de la familia Qwen.
- Filtrado o resumen de pasajes en japonés dentro de un sistema de búsqueda documental, siempre que se controle el contexto de entrada.
- Docencia y experimentación académica: al proceder de un curso, es útil como ejemplo de ajuste supervisado con datos abiertos y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,75 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos, más overhead.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,5 GB para pesos, más overhead.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; en entornos de servidor, A100 o H100 no son necesarias pero funcionarían.
- Cabe holgadamente en GPU consumer, incluidas portátiles con 6-8 GB de VRAM.
- Opciones de despliegue: `transformers` (carga directa de safetensors), llama.cpp/Ollama (previa conversión a GGUF), vLLM y TGI (compatibilidad sujeta a que la arquitectura Qwen3.5 esté soportada en la versión correspondiente).
- Latencia y throughput: no disponibles en la información proporcionada; en un modelo de este tamaño se espera una latencia de decenas de milisegundos por token en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OkamotoJP/llm2-qwen35-sft013 | 873 M | no disponible | Apache 2.0 | SFT en japonés para RAG, datos CC BY-SA 4.0 |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Apache 2.0 | Modelo base multilingüe sin ajuste específico para RAG en japonés |
| cl-nagoya/auto-wiki-qa (dataset) | no aplica | no aplica | CC BY-SA 4.0 | Fuente de datos usada en el entrenamiento; no es un modelo comparable en rendimiento |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este modelo con alternativas de la misma categoría. La comparación se limita a parámetros, licencia y origen de los datos.

## Limitaciones y advertencias

- Modelo de menos de 1B parámetros: capacidad de razonamiento y conocimiento factual limitados en comparación con modelos de mayor tamaño.
- Entrenado con solo 1.702 ejemplos y una época: riesgo elevado de sobreajuste al formato exacto de los prompts de entrenamiento y baja generalización fuera de ese dominio.
- Sesgos: no documentados por el autor; al derivar de Wikipedia y datasets japoneses, puede heredar sesgos de esas fuentes.
- Riesgo de alucinación: alto en preguntas fuera del dominio de los datos de entrenamiento o cuando el contexto recuperado no contiene la respuesta; el modelo puede inventar información.
- Limitaciones de idioma: el ajuste se ha realizado únicamente en japonés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Restricciones de licencia: los pesos se distribuyen bajo Apache 2.0, pero los datos de entrenamiento son CC BY-SA 4.0 (JEMHopQA, auto-wiki-qa y chunks de Wikipedia). El uso comercial de los pesos es posible según Apache 2.0, pero conviene revisar las obligaciones de atribución y compartir-igual derivadas de los datos si se redistribuyen adaptaciones.
- No hay información sobre el pipeline de inferencia, plantilla de chat ni formato exacto de prompt recomendado; usarlo en producción requeriría reconstruir el formato a partir de los datos de entrenamiento.
- El repositorio tiene muy pocas descargas y ningún "like", lo que sugiere que no ha sido validado por la comunidad.
- No se han publicado evaluaciones cuantitativas: no hay evidencia objetiva de su calidad frente al modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft013
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset cl-nagoya/auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
