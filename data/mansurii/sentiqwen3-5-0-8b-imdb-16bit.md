# mansurii/SentiQwen3.5-0.8B-IMDb-16bit

## Resumen

SentiQwen3.5-0.8B-IMDb-16bit es un ajuste fino (fine-tuning) del modelo base unsloth/Qwen3.5-0.8B, desarrollado por el usuario mansurii y publicado en Hugging Face. El nombre del modelo sugiere un ajuste orientado al análisis de sentimiento sobre el conjunto de datos IMDb, aunque la model card no documenta explícitamente el dataset, el procedimiento de entrenamiento ni los objetivos de la tarea. Se distribuye en precisión de 16 bits (safetensors) con un total de 873.438.784 parámetros (aproximadamente 0,87 mil millones).

El modelo hereda la arquitectura de la familia Qwen3.5, que en el pipeline declarado (image-text-to-text) apunta a un transformer multimodal con capacidad de procesamiento de imagen y texto. El ajuste se realizó con Unsloth y la librería TRL de Hugging Face, según indica el autor, lo que sugiere un entrenamiento optimizado en memoria y velocidad. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

La relevancia de esta ficha es limitada: se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica detallada. Resulta útil como ejemplo de ajuste fino ligero sobre un modelo pequeño multimodal, pero no como candidato para producción sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5; pipeline image-text-to-text) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo se publica en 16 bits) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de unsloth/Qwen3.5-0.8B, un transformer de la familia Qwen3.5 con pipeline declarado image-text-to-text, lo que implica componentes de visión y de lenguaje. El ajuste fino se realizó con Unsloth y TRL, según la model card, lo que habitualmente implica técnicas de entrenamiento eficiente en memoria (LoRA/QLoRA o similares), aunque el autor no especifica el método concreto ni si se fusionaron los adaptadores. El resultado se publica en 16 bits con safetensors.

No se documenta el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO ni innovaciones técnicas específicas del ajuste. El nombre del modelo sugiere un entrenamiento sobre IMDb (reseñas de cine), probablemente para clasificación o generación de sentimiento, pero esta información no está confirmada en la model card. Tampoco se detalla la longitud de contexto efectiva ni si el ajuste preserva las capacidades multimodales del modelo base.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3.5-0.8B.
- Procesamiento image-text-to-text según el pipeline declarado, aunque no se documenta si el ajuste preserva esta capacidad.
- Posible especialización en análisis de sentimiento sobre reseñas (sugerido por el nombre "IMDb"), sin confirmación documental.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Clasificación de sentimiento en reseñas de productos o películas: el modelo, por su nombre y origen, parece orientado a esta tarea; se usaría como clasificador o generador de etiquetas sobre texto en inglés, previa validación empírica.
- Prototipado rápido de análisis de opiniones: al tener menos de 1.000 millones de parámetros, puede ejecutarse en hardware modesto para experimentar con pipelines de NLP en inglés.
- Filtrado de comentarios en foros o plataformas: integrable como componente de un pipeline de moderación que puntúe el tono de los mensajes, siempre que se valide su precisión.
- Extracción de opinión en encuestas abiertas: útil para agregar respuestas de texto libre en inglés y resumir tendencias.
- Base para nuevos ajustes finos: al ser un modelo pequeño con licencia Apache 2.0, sirve como punto de partida para especializaciones adicionales con Unsloth o TRL.
- Experimentación académica con modelos multimodales pequeños: permite estudiar el comportamiento de un transformer image-text-to-text de menos de 1.000 millones de parámetros en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, unos 3-4 GB para contextos moderados.
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) para inferencia en 16 bits; A100/H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU consumer: sí, en la mayoría de GPUs modernas con 8 GB o más; también podría ejecutarse en CPU con cuantización, aunque no se distribuyen pesos GGUF en el repo.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag), y potencialmente vLLM o llama.cpp si se generan cuantizaciones propias; no se incluyen artefactos GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SentiQwen3.5-0.8B-IMDb-16bit | 873 M | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| unsloth/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | no disponible en esta ficha | Hugging Face |
| Qwen2.5-0.5B / 1.5B (familia previa) | 0,5-1,5 B | 32 K (según versión) | Apache 2.0 | Hugging Face, ampliamente usado |
| SmolLM2-1.7B | 1,7 B | 8 K | Apache 2.0 | Hugging Face |

La comparación con alternativas es aproximada: no se dispone de datos de rendimiento del modelo ajustado ni de la ficha técnica completa del base Qwen3.5-0.8B en la información proporcionada. Los modelos de la familia Qwen2.5 y SmolLM2 se citan como referencias de tamaño similar, no como equivalentes funcionales.

## Limitaciones y advertencias

- Sin benchmarks ni evaluación publicada: no hay evidencia de que el ajuste mejore al modelo base en la tarea objetivo.
- Cero descargas y cero likes: no existe validación por parte de la comunidad.
- Documentación mínima: se desconoce el dataset, el método de ajuste, la longitud de contexto y si se preservan las capacidades multimodales.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño, agravado por la falta de evaluación.
- Sesgos: no documentados; el dataset IMDb puede introducir sesgos de dominio (cine) y de idioma.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de la licencia del modelo base y de los datos de entrenamiento (no documentados).
- Caveat de producción: no recomendable para despliegue sin una evaluación propia sobre el dominio objetivo y sin verificar la integridad de los pesos publicados.

## Enlaces

- Hugging Face: https://huggingface.co/mansurii/SentiQwen3.5-0.8B-IMDb-16bit
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
