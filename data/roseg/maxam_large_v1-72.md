# RoseG/MaXaM_Large_v1.72

## Resumen

MaXaM_Large_v1.72 es un modelo de lenguaje de gran tamaño desarrollado por Triadic Intelligence Labs, publicado en HuggingFace por el usuario RoseG. Se trata de un ajuste fino (fine-tuning) del modelo base Llama-3.1-70B, entrenado mediante Supervised Fine-Tuning (SFT) sobre un dataset denominado FTK, generado con la herramienta SFT Studio Pro. El modelo está pensado para generación de texto y tareas de lenguaje natural, y se distribuye bajo la licencia Llama 3.1.

Con aproximadamente 70.550 millones de parámetros, MaXaM_Large_v1.72 se posiciona en la categoría de modelos de gran escala, similar a otros LLMs de 70B. Su relevancia radica en que ofrece una alternativa de código abierto con uso responsable, aunque la documentación pública es extremadamente limitada, lo que dificulta una evaluación técnica completa. El repositorio ocupa 282.2 GB y los pesos están en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Llama-3.1-70B) |
| Parametros totales | 70.553.706.496 (~70.5B) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la misma que la de Llama-3.1-70B, un transformer decoder con atención causal, normalización RMSNorm, y activación SwiGLU. No se ha publicado información adicional sobre variaciones arquitectónicas específicas, como atención lineal o decodificación especulativa.

El entrenamiento consistió en un ajuste fino supervisado (SFT) sobre un dataset denominado FTK, creado mediante la plataforma SFT Studio Pro. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. La model card menciona "Open Source with Responsible Use", lo que sugiere un enfoque de uso ético, pero sin más detalles técnicos.

## Capacidades

- Generación de texto y completado de lenguaje natural, heredadas del modelo base Llama-3.1-70B.
- Razonamiento y comprensión de instrucciones en inglés, aunque no se han publicado evaluaciones específicas.
- Capacidad de procesar y generar código, matemáticas y otras tareas típicas de un LLM de 70B, pero sin confirmación oficial.
- No se documenta soporte explícito para tool calling, function calling, agentes multi-step, ni modos especiales como thinking mode o visión.
- No se indica soporte multilingüe más allá del inglés.

## Casos de uso

Dado que la documentación es muy escasa, los casos de uso se plantean como posibilidades basadas en las capacidades típicas de un modelo de 70B, pero no están confirmados por el desarrollador:

- Generación de contenido en inglés: redacción de artículos, informes o documentación técnica, aprovechando el gran tamaño del modelo para producir texto coherente y contextualizado.
- Asistencia en programación: sugerencia de código, depuración y explicación de fragmentos, aunque no se ha validado su rendimiento en benchmarks de código.
- Análisis de texto y extracción de información: resúmenes, clasificación y respuesta a preguntas sobre documentos extensos, siempre que la longitud de contexto lo permita (dato no disponible).
- Investigación académica: experimentación con fine-tuning adicional o evaluación de capacidades de razonamiento en entornos controlados.
- Prototipado de chatbots o asistentes conversacionales en inglés, con la salvedad de que no se ha probado su robustez en diálogos multi-turno.
- Desarrollo de aplicaciones de procesamiento de lenguaje natural en entornos con recursos de cómputo suficientes, como servidores con GPUs de alta gama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: basado en 70.5B parámetros, en FP16 se necesitarían aproximadamente 141 GB de VRAM; en int8 unos 70 GB; en int4 unos 35 GB. Estas cifras son estimaciones teóricas y no han sido validadas por el desarrollador.
- GPUs recomendadas: para FP16 se requerirían múltiples GPUs de 80 GB (por ejemplo, 2x A100/H100) o soluciones de memoria compartida. Para cuantización int4 podría bastar una GPU de 48 GB (como A6000) o 2x RTX 4090 de 24 GB.
- No se indica si es compatible con GPUs de consumo, pero dada su escala, es poco probable que quepa en una sola GPU de 24 GB sin cuantización.
- Opciones de despliegue: al ser un modelo basado en Llama, es compatible con frameworks como vLLM, llama.cpp, Ollama o TGI, aunque no hay confirmación oficial de soporte.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos oficiales. Como referencia, se puede comparar con el modelo base Llama-3.1-70B y otros LLMs de 70B como Mistral Large o Qwen 2.5 72B, pero sin información de rendimiento de MaXaM_Large_v1.72, la comparación no es concluyente.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MaXaM_Large_v1.72 | 70.5B | no disponible | llama3.1 | HuggingFace |
| Llama-3.1-70B | 70.6B | 128K | llama3.1 | HuggingFace |
| Qwen 2.5 72B | 72.7B | 128K | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- Documentación extremadamente limitada: no se especifican detalles de entrenamiento, datos, contexto, ni evaluaciones, lo que impide una validación rigurosa.
- Sesgos heredados: al derivar de Llama-3.1-70B, puede arrastrar los sesgos presentes en los datos de entrenamiento originales de Meta.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o no verificada, especialmente en temas especializados.
- Idioma: solo se declara inglés; no hay evidencia de buen rendimiento en otros idiomas.
- Licencia llama3.1: permite uso comercial con condiciones (debe incluir atribución y cumplir políticas de uso aceptable de Meta). No se detallan restricciones adicionales.
- Para producción, se recomienda realizar pruebas exhaustivas propias antes de implementar el modelo en aplicaciones críticas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RoseG/MaXaM_Large_v1.72
- Dominio de Triadic Intelligence Labs: https://triadai.agency
- Dominio alternativo: https://triadicai.agency
