# kenbou3/qwen3.5-0.8b-rag-lora02

## Resumen

`kenbou3/qwen3.5-0.8b-rag-lora02` es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario kenbou3 en el contexto de un concurso final de un curso de LLM. El modelo ha sido entrenado para tareas de generación aumentada por recuperación (RAG), integrando los pesos LoRA en los pesos originales, por lo que la estructura del modelo resultante es idéntica a la del modelo base.

Se trata de un modelo de aproximadamente 853 millones de parámetros (852.985.920 según los safetensors), lo que lo sitúa en la categoría de modelos pequeños optimizados para despliegue con recursos limitados. El entrenamiento se realizó sobre 4.999 ejemplos durante una única época, con un LoRA de rango 16 y alpha 32, empleando una tasa de aprendizaje de 0,0001.

Su relevancia radica en ser un ejemplo de ajuste fino especializado en RAG sobre un modelo compacto, con licencia Apache 2.0, lo que facilita su uso comercial y su experimentación. No obstante, la información pública disponible es muy limitada: no se han publicado resultados de benchmarks, idiomas soportados ni detalles sobre el pipeline de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-0.8B; detalles no disponibles) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo mantiene exactamente la arquitectura del modelo base Qwen/Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`), sobre el que se aplicó un ajuste fino con LoRA que posteriormente se fusionó en los pesos originales. No se dispone de información detallada sobre el tipo de atención, la composición del dataset de preentrenamiento del modelo base ni si este incorpora innovaciones como decodificación especulativa o atención lineal.

El entrenamiento se realizó sobre un total de 4.999 ejemplos durante 1 época, con una configuración LoRA de rango 16 y alpha 32, y una tasa de aprendizaje de 0,0001. Los datos de entrenamiento combinan dos fuentes: por un lado, JSQuAD (perteneciente a JGLUE, con licencia CC BY-SA 4.0 y autoría de Yahoo Japan Corporation y otros); por otro, materiales recuperados mecánicamente mediante BM25 a partir de los fragmentos del corpus distribuido en `bumbuboon/llm-course-final-2026`. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación adicionales.

## Capacidades

- Generación de texto y respuesta a preguntas sobre contextos recuperados (orientación RAG), dado el diseño del dataset de entrenamiento.
- Comprensión de textos en japonés, ya que el corpus principal de ajuste es JSQuAD, un conjunto de preguntas y respuestas en japonés.
- Manejo de contextos documentales recuperados mediante BM25, lo que sugiere cierta robustez ante pasajes de referencia.
- Capacidades heredadas del modelo base Qwen3.5-0.8B (no documentadas en la información disponible).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (solo se confirma el japonés por el corpus de entrenamiento).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Respuesta a preguntas sobre documentación interna: el modelo puede recibir pasajes recuperados por un sistema BM25 o un recuperador denso y generar respuestas extractivas o abstractivas, aprovechando su ajuste específico sobre JSQuAD y corpus fragmentados.
- Asistente de soporte en japonés: dado su entrenamiento sobre un corpus japonés de preguntas y respuestas, es adecuado para responder consultas de usuarios en ese idioma a partir de bases de conocimiento.
- Prototipado rápido de pipelines RAG: su tamaño reducido (853 M de parámetros) permite iterar y desplegar en entornos con recursos limitados, validando la arquitectura de recuperación antes de escalar a modelos mayores.
- Extracción de respuestas en documentos largos fragmentados: el modelo puede procesar fragmentos recuperados y sintetizar respuestas coherentes, útil en tareas de lectura comprensiva sobre corpus técnicos o legales.
- Filtrado y reordenación de pasajes recuperados: puede emplearse como componente de un pipeline para validar si un fragmento responde a la consulta antes de pasarlo a un modelo mayor.
- Entorno educativo y de investigación: sirve como caso de estudio reproducible de ajuste fino con LoRA sobre un modelo compacto, con configuración y datos documentados, para experimentos de RAG en cursos o laboratorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,7 GB solo para pesos (853 M de parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,5 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para FP16; para cuantización 4/8 bits basta con GPUs de gama baja o incluso CPU.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs dedicadas actuales, e incluso en sistemas integrados con suficiente memoria compartida.
- Opciones de despliegue: no se han publicado configuraciones específicas; al ser safetensors compatible con la arquitectura Qwen3.5, podría desplegarse con vLLM, TGI o transformers, y potencialmente con llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kenbou3/qwen3.5-0.8b-rag-lora02 | 853 M | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B (base) | 0,8 B (aprox.) | no disponible | no disponible en la informacion | Hugging Face |
| Otros ajustes RAG de modelos <1B | no disponible | no disponible | variable | no disponible |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría. La comparación se limita a la relación con su modelo base, del que hereda arquitectura y pesos, diferenciándose únicamente por el ajuste fino con LoRA sobre datos RAG en japonés.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar su calidad relativa frente al modelo base ni frente a alternativas.
- Riesgo de alucinación: como todo modelo generativo de pequeño tamaño, puede producir respuestas no sustentadas en los pasajes recuperados, especialmente si el contexto es ambiguo o insuficiente.
- Sesgos conocidos: no documentados; el corpus JSQuAD y los fragmentos de un curso pueden introducir sesgos temáticos y de dominio.
- Limitaciones de idioma: el ajuste se realizó sobre corpus en japonés, por lo que su rendimiento en castellano u otros idiomas no está garantizado y probablemente sea inferior al del modelo base sin ajustar.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento JSQuAD tienen licencia CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-al-igual sobre obras derivadas; conviene revisar la compatibilidad antes de un uso comercial.
- Caveat de producción: el modelo tiene 0 descargas y 0 likes, sin validación comunitaria; se recomienda evaluarlo exhaustivamente en el dominio objetivo antes de desplegarlo.
- No se han publicado cuantizaciones ni artefactos de despliegue (GGUF, AWQ, etc.), lo que limita su uso directo en entornos de inferencia optimizados.
- El contexto máximo no está documentado, lo que impide planificar pipelines RAG con pasajes largos sin validación empírica.

## Enlaces

- Hugging Face: https://huggingface.co/kenbou3/qwen3.5-0.8b-rag-lora02
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Corpus de entrenamiento distribuido: https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- JGLUE (incluye JSQuAD): https://github.com/yahoojapan/JGLUE
- JSQuAD v1.3 (dentro de JGLUE): https://huggingface.co/datasets/yahoojapan/JGLUE
