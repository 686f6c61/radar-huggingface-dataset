# OkamotoJP/llm2-qwen35-sft018avg

## Resumen

`OkamotoJP/llm2-qwen35-sft018avg` es un ajuste fino (fine-tuning) del modelo base `Qwen/Qwen3.5-0.8B`, desarrollado por el usuario OkamotoJP. Se trata de un modelo resultante de promediar, elemento a elemento, los pesos de dos modelos entrenados con LoRA sobre el mismo conjunto de datos pero con semillas distintas (`sft018` y `sft018b`, ambos con peso 0,50). El objetivo declarado es la generación de respuestas para un sistema de RAG (Retrieval-Augmented Generation) en el contexto del curso "LLM講座2 2026".

El modelo conserva la arquitectura del Qwen3.5-0.8B original; solo se modifican los pesos de la parte lingüística. Con 873.438.784 parámetros (aproximadamente 0,87 mil millones) y un tamaño de repositorio de 1,8 GB, está pensado para tareas de respuesta en japonés sobre contextos recuperados. Su relevancia radica en ser un ejemplo de técnica de model averaging (promediado de pesos) aplicada a ajustes LoRA para mejorar la robustez de la generación en un dominio concreto.

La licencia Apache-2.0 y su reducido tamaño lo hacen accesible para experimentación en hardware modesto, aunque su especialización y el escaso número de descargas (6 en el momento de la consulta) indican que se trata de un modelo de nicho, orientado a un caso de uso académico muy específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B); no se detalla la variante exacta |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del Qwen3.5-0.8B mediante LoRA, posteriormente fusionado (merged) y promediado con otro ajuste equivalente. Concretamente, se promedian los pesos de dos modelos (`llm2-qwen35-sft018` y `llm2-qwen35-sft018b`) entrenados con los mismos datos pero con semillas diferentes, asignando un peso de 0,50 a cada uno. La estructura del modelo es idéntica a la del modelo base; solo difieren los pesos de la parte lingüística. El resultado es un modelo denso de aproximadamente 873 millones de parámetros.

Los datos de entrenamiento de los dos modelos originales provienen de tres fuentes: JEMHopQA (licencia CC BY-SA 4.0), `cl-nagoya/auto-wiki-qa` (CC BY-SA 4.0) y un conjunto de chunks distribuidos derivados de Wikipedia en japonés (CC BY-SA 4.0), utilizados como material de contexto en los prompts de entrenamiento. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable es el uso de model averaging (promediado de pesos) para combinar dos ejecuciones de entrenamiento con distinta semilla, una práctica que puede reducir la varianza y mejorar la estabilidad del modelo resultante.

## Capacidades

- Generación de texto en japonés, orientada a la respuesta sobre contextos recuperados (RAG).
- Respuesta a preguntas de tipo hop múltiple, dado el uso de JEMHopQA en el entrenamiento.
- Generación basada en documentación de Wikipedia en japonés.
- Capacidades de razonamiento y código heredadas del modelo base Qwen3.5-0.8B (no verificadas en esta ficha).
- Soporte de tool calling / function calling: no disponible (no se menciona en la información).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona).
- Capacidades multilingües: limitadas al japonés según la model card; el modelo base podría tener otras, pero no se documenta.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Generación de respuestas en sistemas RAG en japonés: el modelo está entrenado específicamente para responder a partir de chunks de Wikipedia y contextos recuperados, por lo que encaja en pipelines de recuperación + generación para dominios documentales en japonés.
- Preguntas de hop múltiple sobre documentación: gracias al entrenamiento con JEMHopQA, puede abordar preguntas que requieren combinar información de varias fuentes dentro del contexto proporcionado.
- Asistente de consulta sobre Wikipedia japonesa: adecuado para prototipos de búsqueda conversacional que recuperan artículos y generan respuestas sintetizadas.
- Evaluación académica de técnicas de model averaging: sirve como caso de estudio para comparar el promediado de pesos frente a un único ajuste LoRA en tareas de generación.
- Experimentación en entornos con recursos limitados: con menos de mil millones de parámetros, puede ejecutarse en GPU de consumo para pruebas de integración de pipelines RAG.
- Base para ajustes posteriores en dominios específicos en japonés: al ser un modelo pequeño y con licencia Apache-2.0, puede servir como punto de partida para fine-tunings adicionales.
- Generación de respuestas extractivas o abstractivas sobre corpus japoneses: útil en tareas de sumarización o respuesta a preguntas sobre documentación interna, siempre que se proporcione el contexto adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo denso de ~0,87 mil millones de parámetros, una estimación orientativa sería de aproximadamente 2 GB en FP16 y alrededor de 1 GB en cuantización de 8 bits, aunque no se confirma en la información.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPU de consumo como RTX 3060, RTX 4060 o superiores, así como en A100/H100 para despliegues por lotes.
- Compatibilidad con GPU de consumo: probable por el tamaño, pero no confirmada en la información.
- Opciones de despliegue: no disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OkamotoJP/llm2-qwen35-sft018avg | 873.438.784 | no disponible | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8 mil millones (no confirmado) | no disponible | Apache-2.0 | Hugging Face |
| OkamotoJP/llm2-qwen35-sft018 | no disponible | no disponible | Apache-2.0 (presumible) | Hugging Face |
| OkamotoJP/llm2-qwen35-sft018b | no disponible | no disponible | Apache-2.0 (presumible) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en japonés y en un caso de uso concreto (RAG académico); su rendimiento fuera de ese dominio no está documentado.
- Riesgo de alucinación inherente a los modelos generativos, especialmente al responder sobre contextos recuperados; no se han publicado evaluaciones de fidelidad.
- No se especifica la longitud de contexto soportada, lo que limita la planificación de pipelines que dependan de ventanas largas.
- El modelo base Qwen3.5-0.8B puede introducir sesgos propios; no se documentan análisis de sesgo para este ajuste.
- Aunque la licencia es Apache-2.0, los datos de entrenamiento tienen licencia CC BY-SA 4.0, lo que puede requerir atribución y compartir-al-igual en determinados usos derivados; conviene revisar la compatibilidad para uso comercial.
- El número de descargas (6) y la ausencia de benchmarks indican que no ha sido validado por la comunidad; no se recomienda para producción sin evaluación propia.
- No se documentan capacidades de tool calling, agentes ni multimodalidad; asumir su ausencia salvo verificación empírica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft018avg
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo promediado 1: https://huggingface.co/OkamotoJP/llm2-qwen35-sft018
- Modelo promediado 2: https://huggingface.co/OkamotoJP/llm2-qwen35-sft018b
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
