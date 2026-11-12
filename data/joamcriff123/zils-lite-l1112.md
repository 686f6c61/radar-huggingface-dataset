# joamCriff123/zils-lite-l1112

## Resumen

zils-lite-l1112 es un modelo de la familia Qwen3.5-0.8B afinado por el usuario joamCriff123 para funcionar como "cuerpo de decisión" (decision body) dentro del pool lite de la subnet 127 de Zils. El modelo base es Qwen/Qwen3.5-0.8B, un transformer denso de aproximadamente 853 millones de parámetros, y el resultado se distribuye con licencia Apache-2.0 en formato safetensors para la librería transformers.

La arquitectura subyacente es la de Qwen3.5-0.8B, un transformer decoder-only con atención estándar (no se dispone de detalles específicos sobre innovaciones como atención lineal o decodificación especulativa en la información proporcionada). El pipeline declarado en Hugging Face es feature-extraction, aunque las etiquetas incluyen decision-model, lo que sugiere un uso orientado a la toma de decisiones o clasificación más que a la generación de texto libre.

El modelo tiene 0 descargas y 0 likes en el momento de la consulta, fue creado el 11 de noviembre de 2026 y actualizado el mismo día, lo que indica que es un artefacto reciente y sin validación comunitaria. Es relevante para quienes trabajen con el ecosistema Zils o necesiten un modelo pequeño de decisión basado en Qwen3.5, pero carece de documentación técnica detallada sobre entrenamiento, datos o rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5-0.8B) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen/Qwen3.5-0.8B, un transformer decoder-only de 853 millones de parámetros. No se dispone de información sobre la composición del dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. La model card únicamente indica que se trata de un "d3-lite decision body" para el pool lite de la subnet 127 de Zils, sin detallar el proceso de afinado ni los datos empleados.

No se han documentado innovaciones técnicas específicas (decodificación especulativa, atención lineal, SSM híbrido, etc.) en la información proporcionada. El pipeline declarado es feature-extraction, lo que sugiere que el modelo puede estar orientado a extraer representaciones o puntuaciones para decisiones, aunque las etiquetas incluyen decision-model. Se desconoce si el modelo conserva las capacidades generativas del base o si fue modificado para una tarea concreta.

## Capacidades

- No se dispone de información detallada sobre las capacidades específicas del modelo afinado.
- El pipeline declarado es feature-extraction, lo que indica que puede utilizarse para extraer representaciones vectoriales.
- Las etiquetas incluyen decision-model, lo que sugiere un uso orientado a la toma de decisiones o clasificación.
- No se confirma soporte de tool calling, function calling ni agentes multi-paso.
- No se confirma capacidad multilingüe (idiomas no disponibles).
- No se confirma capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No se confirma modo thinking, visión ni audio.

## Casos de uso

- Extracción de características para sistemas de decisión: dado que el pipeline es feature-extraction, el modelo puede emplearse para generar embeddings o representaciones internas que alimenten un clasificador o un sistema de decisión en el contexto de la subnet 127 de Zils.
- Componente de decisión en el pool lite de Zils: el modelo está diseñado explícitamente como "decision body" para el pool lite, por lo que su uso previsto es servir como motor de decisión dentro de esa infraestructura.
- Prototipado de sistemas de clasificación: al ser un modelo pequeño (853 M parámetros) y con licencia Apache-2.0, puede integrarse en pipelines de clasificación o scoring sin restricciones comerciales.
- Investigación sobre modelos de decisión de pequeño tamaño: útil para experimentar con arquitecturas de decisión basadas en Qwen3.5-0.8B en entornos con recursos limitados.
- Despliegue en entornos con restricciones de memoria: con menos de 1.000 millones de parámetros, cabe en GPUs de consumo y puede ejecutarse en CPU para inferencia de baja latencia en tareas de extracción.
- Fine-tuning posterior: al ser un modelo base pequeño y con licencia permisiva, puede servir como punto de partida para ajustes específicos en tareas de decisión o clasificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,7 GB (853 M parámetros × 2 bytes), más overhead de activaciones y contexto.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,9 GB; en 4 bits: aproximadamente 0,5 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (GTX 1650, RTX 3050, RTX 4060, etc.); A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs consumer con 4 GB o más.
- Opciones de despliegue: transformers (librería declarada); no se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Pipeline | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-l1112 | 853 M | no disponible | Apache-2.0 | feature-extraction | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~800 M | no disponible | no disponible | no disponible | Hugging Face |
| Modelos de decisión pequeños (genéricos) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar rendimiento con alternativas concretas de la misma categoría. El modelo base Qwen3.5-0.8B es la referencia más directa, pero no se han publicado métricas comparativas en la información proporcionada.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos del modelo afinado.
- Riesgo de alucinación: no evaluado; al ser un modelo de decisión, el riesgo dependerá de la tarea concreta.
- Limitaciones de contexto e idioma: no documentadas; los idiomas soportados figuran como no disponibles.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y las atribuciones del modelo base (ver LICENSE y NOTICE).
- Modelo sin validación comunitaria: 0 descargas y 0 likes, creado y actualizado el mismo día, sin documentación técnica sobre entrenamiento o evaluación.
- El pipeline feature-extraction no garantiza capacidades generativas; verificar el comportamiento real antes de usarlo en producción.
- No se confirma compatibilidad con herramientas de despliegue estándar (vLLM, llama.cpp, Ollama, TGI) más allá de transformers.

## Enlaces

- Hugging Face: https://huggingface.co/joamCriff123/zils-lite-l1112
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
