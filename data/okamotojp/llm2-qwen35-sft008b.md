# OkamotoJP/llm2-qwen35-sft008b

## Resumen

`llm2-qwen35-sft008b` es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario OkamotoJP. Se trata de un modelo derivado de 873 millones de parámetros, entrenado mediante LoRA (r=16, alpha=32) y fusionado posteriormente con los pesos originales, de modo que la arquitectura resultante es idéntica a la del modelo base: solo se actualizan los pesos de la parte lingüística.

El modelo está especializado en la generación de respuestas para tareas de RAG (generación aumentada por recuperación) en japonés, concretamente como entrega final del curso "LLM講座2 2026". Su entrenamiento se apoya en datasets de preguntas y respuestas en japonés (JEMHopQA y auto-wiki-qa) junto con fragmentos de Wikipedia japonesa usados como contexto documental en los prompts.

Su relevancia es limitada y muy específica: no es un modelo de propósito general, sino un artefacto educativo con un conjunto de entrenamiento pequeño (1378 ejemplos, una sola época) y un idioma de trabajo exclusivamente japonés. Resulta útil como referencia para quienes quieran estudiar pipelines de SFT con LoRA sobre modelos pequeños, o como ejemplo de adaptación de un modelo de menos de 1000 millones de parámetros a una tarea concreta de respuesta sobre contexto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (qwen3_5), misma estructura que el modelo base; solo se actualizan los pesos de la parte lingüística |
| Parámetros totales | 873.438.784 |
| Parámetros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`) y aplica un ajuste fino supervisado con LoRA de rango 16 y alpha 32, con una tasa de aprendizaje de 0.0001 y una sola época sobre 1378 ejemplos. Tras el entrenamiento, los adaptadores LoRA se fusionan en los pesos originales, por lo que el checkpoint distribuido no requiere cargar adaptadores adicionales y mantiene exactamente la misma arquitectura que el modelo base.

Los datos de entrenamiento combinan JEMHopQA (CC BY-SA 4.0, filtrado y reformateado), una muestra filtrada y reformateada de cl-nagoya/auto-wiki-qa (CC BY-SA 4.0) y un conjunto de fragmentos derivados de Wikipedia japonesa (CC BY-SA 4.0) empleados como material de contexto en los prompts. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación posteriores al SFT, ni el número total de tokens de entrenamiento.

## Capacidades

- Generación de texto en japonés, orientada a responder preguntas a partir de contexto documental recuperado (RAG).
- Respuesta sobre preguntas de tipo multi-hop, gracias a la inclusión de JEMHopQA en el conjunto de entrenamiento.
- Formulación de respuestas a partir de fragmentos de Wikipedia japonesa proporcionados en el prompt.
- Capacidades heredadas del modelo base Qwen3.5-0.8B en la parte lingüística, si bien no se documentan explícitamente en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible en la información proporcionada.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Generación de respuestas en pipelines RAG en japonés: el modelo está entrenado específicamente para recibir fragmentos de contexto y producir una respuesta, por lo que encaja como componente generador en un sistema de recuperación + generación sobre documentación japonesa.
- Preguntas multi-hop sobre conocimiento enciclopédico: la inclusión de JEMHopQA en el entrenamiento lo hace adecuado para preguntas que requieren combinar información de varias entidades o pasajes.
- Asistentes de consulta sobre Wikipedia japonesa: puede emplearse para responder preguntas cuyas fuentes sean artículos de Wikipedia, dado que los fragmentos de contexto del entrenamiento provienen de esa fuente.
- Prototipado educativo de pipelines SFT con LoRA: sirve como ejemplo reproducible de cómo adaptar un modelo de menos de 1000 millones de parámetros a una tarea concreta con un conjunto de datos pequeño.
- Evaluación comparativa de técnicas de ajuste fino: al estar fusionado con los pesos base, permite comparar directamente el comportamiento del modelo ajustado frente al original sin gestión adicional de adaptadores.
- Despliegue ligero en entornos con recursos limitados: con 873 millones de parámetros, es viable ejecutarlo en hardware modesto para tareas de generación de respuestas en japonés, aunque no se dispone de cifras de latencia o throughput.
- Base para experimentos de destilación o evaluación de RAG en japonés: puede utilizarse como generador de referencia en pruebas controladas de sistemas de recuperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 873 millones de parámetros, en fp16 los pesos ocupan aproximadamente 1,75 GB, y en cuantizaciones de 8 y 4 bits se reduciría a alrededor de 0,9 GB y 0,45 GB respectivamente (estimación orientativa a partir del número de parámetros, no confirmada por el autor).
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: por el tamaño del modelo, es previsible que quepa en GPUs de consumo con suficiente VRAM, pero no se documenta una recomendación concreta.
- Opciones de despliegue: no disponible en la información proporcionada (no se mencionan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| llm2-qwen35-sft008b | 873.438.784 | no disponible | ja | Apache-2.0 | SFT con LoRA sobre Qwen3.5-0.8B, orientado a RAG en japonés |
| Qwen/Qwen3.5-0.8B | no disponible en la información | no disponible | no disponible | Apache-2.0 | Modelo base sin ajuste; referencia directa de comparación |
| Otros modelos de ~0,8B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks ni de alternativas documentadas en la información proporcionada |

## Limitaciones y advertencias

- El conjunto de entrenamiento es muy reducido (1378 ejemplos, una sola época), lo que limita la generalización y aumenta el riesgo de sobreajuste a los formatos de prompt empleados.
- El modelo está especializado en japonés y en tareas de respuesta sobre contexto; su rendimiento fuera de ese dominio o idioma no está documentado.
- Riesgo de alucinación: al ser un modelo pequeño ajustado con SFT, puede generar respuestas plausibles pero incorrectas, especialmente cuando el contexto recuperado es insuficiente o contradictorio.
- No se documentan evaluaciones de sesgo, seguridad ni robustez frente a prompts adversarios.
- La licencia Apache-2.0 permite uso comercial, pero los datasets de entrenamiento son CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-igual sobre obras derivadas; conviene revisar la compatibilidad antes de un uso en producción.
- No se especifica la longitud de contexto soportada, lo que dificulta dimensionar pipelines RAG con documentos largos.
- El modelo tiene un número muy bajo de descargas y ninguna validación externa, por lo que debe tratarse como un artefacto experimental y no como un componente listo para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft008b
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset cl-nagoya/auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
