# OkamotoJP/llm2-qwen35-sft018

## Resumen

llm2-qwen35-sft018 es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.5-0.8B, desarrollado por el usuario OkamotoJP en el contexto del curso "LLM講座2 2026". Se trata de un modelo de 873.438.784 parametros (aproximadamente 0.87B) entrenado mediante LoRA con rango 16 y alpha 32, cuyos pesos se han fusionado posteriormente en los pesos base. El resultado conserva exactamente la misma arquitectura que el modelo original; solo se han actualizado los pesos de la parte lingüística.

El objetivo declarado es la generación de respuestas para un sistema RAG (Retrieval-Augmented Generation) en japones, empleando como material de contexto fragmentos de Wikipedia en japones. El entrenamiento se realizó sobre 1.260 ejemplos: 882 muestras de auto-wiki-qa y 378 de JEMHopQA (subconjunto composicional). Es, por tanto, un modelo de nicho, muy pequeño, especializado en respuesta extractiva y composicional sobre documentación recuperada en japones.

Su relevancia práctica es limitada fuera de ese contexto: no es un modelo de propósito general competitivo, sino una demostración técnica de un pipeline de SFT con LoRA sobre una base de menos de mil millones de parámetros. Resulta útil como referencia para quienes quieran reproducir un flujo de ajuste para RAG en japones con recursos mínimos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-0.8B); no se detalla en la model card |
| Parametros totales | 873.438.784 (0,87B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (no especificada en la model card; depende de la base Qwen3.5-0.8B) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,8 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por LoRA sobre Qwen/Qwen3.5-0.8B (revision 2fc06364715b967f1860aea9cf38778875588b17). La configuración de entrenamiento fue: LoRA con r=16, alpha=32, learning rate 0,0001, una sola época y 1.260 ejemplos totales. Los pesos LoRA se fusionaron con los pesos originales, de modo que la estructura del modelo es idéntica a la del base y solo cambian los pesos de la parte lingüística. No se documentan innovaciones arquitectónicas propias ni etapas de RLHF o DPO: es SFT puro.

Los datos de entrenamiento provienen de tres fuentes: JEMHopQA (378 ejemplos del subconjunto composicional, filtrados y reformateados), cl-nagoya/auto-wiki-qa (882 ejemplos muestreados, filtrados y reformateados) y un conjunto de fragmentos distribuidos derivados de Wikipedia en japones, usados como material de contexto en los prompts. Todos los datasets están bajo CC BY-SA 4.0. No se especifica el número de tokens de entrenamiento ni la composición exacta más allá del desglose por fuente.

## Capacidades

- Generación de texto en japones, orientada a respuestas breves y fundamentadas en contexto.
- Respuesta a preguntas sobre documentación recuperada (RAG), incluyendo preguntas composicionales de múltiples saltos (JEMHopQA).
- Extracción y síntesis de información a partir de fragmentos de Wikipedia en japones proporcionados en el prompt.
- Capacidades heredadas del modelo base Qwen3.5-0.8B en la medida en que el ajuste no las haya degradado; no se documentan explícitamente.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al japones según la model card; no se garantiza un rendimiento equivalente en otros idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Generación de respuestas en un pipeline RAG en japones: el modelo recibe fragmentos recuperados y formula la respuesta final; es exactamente el escenario para el que fue entrenado.
- Preguntas composicionales sobre documentación: al haberse ajustado con JEMHopQA, maneja preguntas que requieren combinar información de varios fragmentos.
- Asistencia documental interna en japones: búsqueda sobre bases de conocimiento corporativas con respuestas citando el contexto recuperado.
- Prototipado educativo y reproducción de pipelines de SFT: sirve como referencia para experimentar con LoRA sobre modelos sub-1B en entornos con recursos limitados.
- Sistemas de preguntas y respuestas sobre Wikipedia japonesa: integrable en un motor de búsqueda semántica que pase los artículos relevantes como contexto.
- Despliegue en entornos con poca VRAM: al ser un modelo de 0,87B, puede ejecutarse en GPUs de consumo para tareas de respuesta acotada en japones.
- Evaluación comparativa de técnicas de ajuste: útil como baseline pequeño en experimentos de SFT frente al modelo base sin ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 1,7-1,8 GB de pesos más overhead de activaciones y KV cache; en cuantización de 8 bits, en torno a 0,9-1 GB; en 4 bits, aproximadamente 0,5-0,6 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 en contexto corto; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son más que suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de consumo, e incluso en CPU con llama.cpp u Ollama si se generan pesos GGUF (no publicados).
- Opciones de despliegue: transformers con safetensors; vLLM, TGI, llama.cpp u Ollama requerirían conversión o soporte de la arquitectura qwen3_5, no documentado en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| llm2-qwen35-sft018 | 0,87B | no disponible | Apache 2.0 | Hugging Face (2 descargas) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | Apache 2.0 | Hugging Face, ampliamente usado |
| Otros ajustes SFT de Qwen3.5-0.8B | ~0,8B | no disponible | Apache 2.0 (heredada) | Depende del autor |
| Modelos japoneses pequeños (p. ej., variantes de ~1B) | ~1B | variable | variable | variable |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: ajustado exclusivamente para generación de respuestas RAG en japones; su rendimiento en otros idiomas o tareas de propósito general no está garantizado.
- Riesgo de alucinación: como cualquier modelo pequeño de menos de mil millones de parámetros, puede inventar datos cuando el contexto recuperado es insuficiente o ambiguo.
- Sesgos: no se documentan evaluaciones de sesgo; los datos provienen de Wikipedia y de JEMHopQA, con los sesgos propios de esas fuentes.
- Contexto: la longitud máxima no se especifica en la model card; conviene verificar la del modelo base antes de usarlo en producción.
- Licencia: Apache 2.0 permite uso comercial, pero los datasets de entrenamiento son CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-igual sobre obras derivadas de esos datos; conviene revisarlo con asesoría legal.
- Madurez: solo 2 descargas y 0 likes en el momento de la consulta; sin documentación de evaluación ni de robustez en producción.
- Entrenamiento muy corto: 1.260 ejemplos y una sola época, lo que limita la generalización más allá del formato exacto de los datos de SFT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft018
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
