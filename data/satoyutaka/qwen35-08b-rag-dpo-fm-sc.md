# satoyutaka/qwen35-08b-rag-dpo-fm-sc

## Resumen

`satoyutaka/qwen35-08b-rag-dpo-fm-sc` es un ajuste fino del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario satoyutaka en Hugging Face. El modelo está orientado a tareas de generación aumentada por recuperación (RAG) en japonés, y se ha entrenado en dos fases: primero un ajuste supervisado (SFT) sobre una mezcla de datasets de question answering en japonés, y después una fase de optimización por preferencias directas (DPO) con 800 pares autogenerados y un valor de beta de 0.1.

El modelo cuenta con 873.438.784 parámetros reales en safetensors (aproximadamente 0,87 mil millones), lo que lo sitúa en la categoría de modelos pequeños, adecuados para despliegue en hardware de consumo. El repositorio ocupa 1,8 GB y utiliza la librería `qwen3_5` con pesos en formato safetensors. La licencia declarada es "other", lo que implica que las condiciones de uso comercial deben consultarse en el modelo base y en las licencias de los datasets de entrenamiento.

La relevancia de este modelo radica en su especialización: no es un modelo generalista, sino un ajuste orientado a responder preguntas sobre documentos recuperados, con datos de entrenamiento explícitamente japoneses. Esto lo hace interesante para pipelines RAG en ese idioma, aunque su adopción es todavía muy limitada (0 descargas y 0 likes en el momento de la consulta) y la información pública disponible es escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-0.8B) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (datos de entrenamiento en japones) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,8 mil millones de parámetros. No se dispone de información detallada sobre el número de capas, dimensiones ocultas, mecanismo de atención ni longitud de contexto nativa en la información proporcionada. La librería declarada en los tags es `qwen3_5`, lo que confirma la compatibilidad con el ecosistema de Qwen 3.5.

El entrenamiento se realizó en dos etapas. La primera fue un ajuste supervisado (SFT) sobre JEMHopQA duplicado (x2) más 9.962 ejemplos adicionales. La segunda fue una fase de DPO con 800 pares de preferencias autogenerados y beta 0.1. Los datasets utilizados son JEMHopQA (CC BY-SA 4.0), auto-wiki-qa (CC BY-SA 4.0), JSQuAD de JGLUE (CC BY-SA 4.0) y JaQuAD (CC BY-SA 3.0). Todos ellos son recursos de question answering en japonés, lo que confirma la orientación del modelo hacia tareas de comprensión y respuesta sobre contexto documental en ese idioma. No se especifica el número total de tokens de entrenamiento ni si hubo otras técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y respuesta a preguntas sobre contexto documental, orientada a pipelines RAG.
- Comprensión lectora en japonés, gracias al entrenamiento sobre JSQuAD, JaQuAD, JEMHopQA y auto-wiki-qa.
- Respuesta extractiva y generativa sobre pasajes recuperados, con ajuste DPO para alinear el estilo de respuesta.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; los datos de entrenamiento son exclusivamente japoneses.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Respuesta a preguntas sobre documentación interna en japonés: el modelo puede recibir un pasaje recuperado por un sistema de búsqueda y generar una respuesta concisa, aprovechando su entrenamiento específico en QA japonés con datasets como JSQuAD y JaQuAD.
- Asistente de soporte técnico basado en base de conocimiento: integrado en un pipeline RAG, el modelo responde consultas de usuarios a partir de artículos recuperados, con un estilo alineado mediante DPO para reducir respuestas evasivas.
- Extracción de respuestas en sistemas de atención al cliente: dado un contexto de conversación y documentos de producto, el modelo genera respuestas fundamentadas en el material recuperado, adecuado por su tamaño reducido para despliegue de baja latencia.
- Búsqueda semántica con generación aumentada en wikis corporativas: el modelo puede sintetizar información de múltiples pasajes recuperados de una wiki en japonés, gracias al entrenamiento con auto-wiki-qa.
- Evaluación automática de sistemas de recuperación: al ser un modelo pequeño y especializado, puede usarse como generador de referencia para medir la calidad de recuperadores en benchmarks de QA japonés.
- Prototipado rápido de asistentes documentales en hardware de consumo: con menos de 1.000 millones de parámetros, cabe en GPUs de gama media y permite iterar sobre pipelines RAG sin infraestructura dedicada.
- Filtrado y reescritura de respuestas en pipelines de moderación: la fase DPO permite ajustar el estilo de salida, útil para reformular respuestas recuperadas antes de mostrarlas al usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 873 millones de parámetros, en FP16 se requieren aproximadamente 1,8 GB solo para los pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits, alrededor de 1 GB; en 4 bits, alrededor de 0,5 GB. Estas cifras son estimaciones a partir del tamaño del modelo, no datos publicados.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100 son suficientes; el modelo es pequeño para GPUs de centro de datos.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU con 4 GB o más de VRAM, e incluso en CPU con llama.cpp u Ollama en cuantización 4 bits.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI son compatibles con arquitecturas derivadas de Qwen; sin embargo, la librería `qwen3_5` puede requerir versiones recientes de transformers. No se dispone de confirmación explícita de compatibilidad en la información proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| satoyutaka/qwen35-08b-rag-dpo-fm-sc | 873 M | no disponible | other | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | no disponible | Hugging Face |
| Modelos QA japoneses pequeños (p. ej. derivados de llm-jp) | variable | variable | variable | Hugging Face |

La comparación cuantitativa con alternativas no está disponible porque no se han publicado benchmarks del modelo ni de sus competidores directos en la información proporcionada. El modelo base Qwen3.5-0.8B es la referencia natural, y este ajuste añade especialización en QA japonés y alineación DPO, a costa de perder generalidad multilingüe.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre datasets japoneses de CC BY-SA, puede heredar sesgos de esas fuentes.
- Riesgo de alucinación: presente como en cualquier modelo generativo; la fase DPO no elimina la posibilidad de generar respuestas no fundamentadas en el contexto recuperado.
- Limitaciones de contexto o idioma: el modelo está especializado en japonés; su rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Restricciones de licencia: la licencia "other" exige revisar las condiciones del modelo base Qwen3.5-0.8B y de los datasets (CC BY-SA 4.0 y CC BY-SA 3.0), que imponen obligaciones de atribución y compartir igual. El uso comercial no está garantizado sin revisión legal.
- Caveats para producción: el modelo tiene 0 descargas y 0 likes, sin validación comunitaria; no hay benchmarks publicados; la librería `qwen3_5` puede requerir versiones específicas de transformers; el contexto máximo no está documentado, lo que impide dimensionar pipelines RAG con precisión.
- Fecha de creación declarada: 2026-11-23, lo que puede indicar un artefacto de metadata o una fecha futura respecto a la consulta; conviene verificar la integridad del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/satoyutaka/qwen35-08b-rag-dpo-fm-sc
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://huggingface.co/datasets/aiishii/JEMHopQA
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Dataset JSQuAD (JGLUE): https://huggingface.co/datasets/yahoojapan/JGLUE
- Dataset JaQuAD: https://huggingface.co/datasets/SkelterLabsInc/JaQuAD
