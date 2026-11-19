# mktktmr/qwen3.5-0.8b-rag-stage13

## Resumen

`mktktmr/qwen3.5-0.8b-rag-stage13` es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario mktktmr. Se trata de la decimotercera iteración de una serie de experimentos orientados a tareas de generación aumentada por recuperación (RAG) en japonés. El modelo se ha entrenado mediante LoRA y posteriormente se han fusionado los pesos adaptadores en el modelo base, dando como resultado un checkpoint denso de aproximadamente 853 millones de parámetros.

El objetivo del ajuste es mejorar la capacidad del modelo para localizar y utilizar información relevante dentro de un conjunto de fragmentos de contexto distribuidos, así como responder preguntas de tipo multihop (JEMHopQA). Para ello, el autor amplió el rango de búsqueda de fragmentos que contienen la respuesta correcta respecto a la etapa 12, incorporando ejemplos adicionales de JEMHopQA.

La relevancia de esta ficha es limitada: se trata de un experimento personal sin métricas publicadas, sin licencia declarada en el repositorio y con cero descargas en el momento de la consulta. No obstante, resulta útil como referencia para quienes exploran el ajuste fino de modelos pequeños (sub-1B) para RAG en japonés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-0.8B) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (los datos de entrenamiento son en japonés) |
| Licencia | no disponible en el repositorio (el modelo base Qwen3.5-0.8B es Apache-2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen. Sobre esta base se aplicó un ajuste fino con LoRA, cuyos adaptadores se fusionaron posteriormente en los pesos del modelo, por lo que el checkpoint resultante es un modelo denso estándar sin módulos adicionales en tiempo de inferencia.

Los datos de entrenamiento provienen de tres fuentes en japonés: JEMHopQA (preguntas multihop), NIILC QA (preguntas y respuestas) y JSQuAD/JGLUE (comprensión lectora), todas ellas bajo licencia CC BY-SA 4.0 y reformateadas para el entrenamiento. Adicionalmente se empleó un conjunto de fragmentos distribuidos derivado de Wikipedia en japonés (CC BY-SA 4.0). La innovación respecto a la etapa anterior (12) consiste en ampliar el rango de fragmentos de contexto examinados para localizar la respuesta correcta en los ejemplos de JEMHopQA. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y respuesta a preguntas en japonés, orientada a escenarios de RAG.
- Localización de información relevante dentro de conjuntos de fragmentos de contexto (capacidad reforzada por el entrenamiento).
- Razonamiento multihop sobre documentos, gracias a los ejemplos de JEMHopQA.
- Comprensión lectora y extracción de respuestas (entrenado con JSQuAD).
- No se ha documentado soporte de tool calling, function calling ni capacidades de agente.
- No se ha documentado modo de razonamiento explícito (thinking mode), visión ni audio.
- Capacidades multilingües: no documentadas; el entrenamiento se centra en japonés.

## Casos de uso

- Sistemas de preguntas y respuestas sobre documentación interna: el modelo puede recibir un conjunto de fragmentos recuperados y localizar la evidencia relevante para responder, aprovechando el ajuste específico sobre fragmentos distribuidos.
- Asistentes de búsqueda corporativa en japonés: integrado en un pipeline RAG, puede seleccionar el pasaje correcto entre varios candidatos y formular una respuesta concisa.
- Respuesta a preguntas multihop: para consultas que requieren combinar información de varios documentos, el ajuste con JEMHopQA le permite encadenar evidencia de distintos fragmentos.
- Extracción de respuestas en tareas de comprensión lectora: útil para procesar artículos o informes y devolver la respuesta exacta a preguntas concretas.
- Prototipado de bajo coste: al tener menos de 1B de parámetros, puede desplegarse en hardware modesto para validar ideas de RAG antes de escalar a modelos mayores.
- Investigación sobre ajuste fino de modelos pequeños: sirve como referencia reproducible para estudiar el efecto de ampliar el rango de fragmentos de contexto en el entrenamiento.
- Filtrado y clasificación de pasajes: puede emplearse para determinar qué fragmento de un conjunto contiene la información solicitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en FP16/BF16 (tamaño del repositorio); en cuantización de 8 bits rondaría 0,9 GB y en 4 bits unos 0,5 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas (GTX 1660, RTX 20xx/30xx/40xx).
- Opciones de despliegue: compatible con transformers, vLLM, TGI, llama.cpp y Ollama (previa conversión a GGUF), al ser un modelo denso estándar en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mktktmr/qwen3.5-0.8b-rag-stage13 | 853 M | no disponible | no disponible | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Apache-2.0 | Hugging Face |
| Qwen2.5-0.5B | ~0,5 B | 32 K (según familia Qwen2.5) | Apache-2.0 | Hugging Face |
| Qwen2.5-1.5B | ~1,5 B | 32 K (según familia Qwen2.5) | Apache-2.0 | Hugging Face |

La comparación con la familia Qwen2.5 se ofrece como referencia de tamaño y contexto dentro de la misma casa, pero no se dispone de datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No se han publicado métricas de evaluación, por lo que se desconoce su rendimiento real frente al modelo base.
- El ajuste se ha realizado exclusivamente con datos en japonés; su comportamiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Riesgo de alucinación inherente a los modelos de este tamaño, especialmente en tareas multihop o con contextos ambiguos.
- La licencia del checkpoint no está declarada en el repositorio; aunque el modelo base es Apache-2.0, conviene verificar los términos antes de un uso comercial.
- Los datos de entrenamiento están bajo CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-al-igual sobre obras derivadas.
- El modelo está entrenado para localizar respuestas en fragmentos de contexto; fuera de ese formato su rendimiento puede degradarse.
- Repositorio con cero descargas y creado en 2026: no hay evidencia de uso en producción ni validación por terceros.
- No se especifican la longitud de contexto efectiva ni las cuantizaciones disponibles.

## Enlaces

- Hugging Face: https://huggingface.co/mktktmr/qwen3.5-0.8b-rag-stage13
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- NIILC QA: https://github.com/mynlp/niilc-qa
- JSQuAD / JGLUE: https://github.com/yahoojapan/JGLUE
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
