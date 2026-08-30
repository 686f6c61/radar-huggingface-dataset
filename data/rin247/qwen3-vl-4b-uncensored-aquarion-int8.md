# Rin247/Qwen3-VL-4B-Uncensored-Aquarion-INT8

## Resumen

Este modelo es una cuantización INT8 *weight-only* de `Qwen3-VL-4B`, el modelo multimodal de lenguaje y visión de la serie Qwen3-VL desarrollado por Alibaba. El autor, Rin247, ha aplicado además un proceso de *abliteration* (eliminación de la dirección de rechazo mediante proyección ortogonal) antes de la cuantización, con el objetivo de reducir la censura en las respuestas. El resultado es un modelo de 4,4 mil millones de parámetros en formato safetensors, con un tamaño de repositorio de 4,8 GB, pensado para entornos con recursos limitados que necesiten capacidades multimodales sin las restricciones habituales de seguridad.

La relevancia de este modelo radica en su doble optimización: por un lado, la cuantización INT8 reduce el uso de memoria y acelera la inferencia en hardware modesto; por otro, la *abliteration* lo hace adecuado para aplicaciones donde se requiere una generación de texto sin filtros, como investigación en IA generativa o integración en pipelines creativos. Sin embargo, al ser una versión modificada y cuantizada, no se dispone de documentación oficial sobre su rendimiento ni sobre las capacidades exactas heredadas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal) |
| Parametros totales | 4.437.815.808 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (weight-only, RTN) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (con buffers adicionales de escala y forma) |

## Arquitectura y entrenamiento

El modelo base es `Qwen3-VL-4B`, un modelo multimodal que combina un codificador visual con un transformer de lenguaje, diseñado para tareas de comprensión de imágenes, video y texto. La versión aquí presentada no ha sido entrenada desde cero, sino que parte de los pesos ya entrenados de Qwen3-VL-4B y les aplica dos transformaciones: primero, una *abliteration* mediante proyección ortogonal de la dirección de rechazo (refusal direction), que elimina los patrones de respuesta censurados; segundo, una cuantización INT8 *weight-only* utilizando el método RTN (round-to-nearest) implementado en PyTorch, ejecutada en CPU. Las escalas de cuantización se almacenan junto a los pesos en archivos separados (`*.weight_scale`, `*.weight_shape`), lo que requiere un proceso de dequantización personalizado antes de la inferencia.

No se proporcionan detalles sobre el dataset de entrenamiento del modelo base, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de la cuantización y la *abliteration*.

## Capacidades

- Generación de texto y razonamiento multimodal: al ser una variante de Qwen3-VL, se espera que herede la capacidad de procesar imágenes y video junto con texto, aunque no se especifican detalles concretos.
- Comprensión visual: el modelo base Qwen3-VL está diseñado para percepción visual profunda, incluyendo reconocimiento de objetos, escenas y relaciones espaciales.
- Generación de texto sin censura: la *abliteration* elimina la dirección de rechazo, lo que permite respuestas menos restringidas en temas sensibles.
- Integración como text encoder: según referencias externas, versiones abliterated de Qwen3-VL se utilizan como text encoder en pipelines de generación de imágenes (por ejemplo, en ComfyUI o Krea 2).
- No se dispone de información sobre soporte de tool calling, agentes o multi-step reasoning en esta versión específica.

## Casos de uso

- Despliegue en entornos con GPU de gama media: gracias a la cuantización INT8, el modelo ocupa aproximadamente 4,4 GB en memoria, lo que permite ejecutarlo en tarjetas con 6 GB de VRAM o menos, como una RTX 2060 o una RTX 3060.
- Prototipado rápido de aplicaciones multimodales: al ser un modelo de 4B parámetros, es adecuado para experimentar con tareas de visión-lenguaje sin necesidad de infraestructura de alto coste.
- Generación de contenido creativo sin restricciones: la *abliteration* lo hace útil para proyectos de escritura creativa, roleplay o generación de narrativas donde se requiere libertad temática.
- Text encoder en pipelines de difusión: puede integrarse en flujos de trabajo de ComfyUI o similares para mejorar la adherencia a prompts en modelos de generación de imágenes como Z-Image o Flux.
- Investigación sobre *abliteration* y cuantización: sirve como caso de estudio para analizar el impacto de estas técnicas en el rendimiento y la seguridad de modelos multimodales.
- Aplicaciones educativas y de demostración: su tamaño reducido y su naturaleza abierta (aunque sin licencia explícita) lo hacen adecuado para talleres y cursos sobre IA generativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas para esta versión cuantizada y abliterated. Tampoco se comparan resultados con el modelo base o con otras variantes.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB, considerando los pesos INT8 (4,4 GB) más overhead de activaciones y contexto. El tamaño exacto depende de la longitud de contexto y del lote.
- GPU recomendadas: tarjetas con al menos 6 GB de VRAM, como NVIDIA RTX 2060, RTX 3060, RTX 4060 o superiores. También puede ejecutarse en GPUs de datacenter como A10 o L4.
- Compatibilidad con consumer GPU: sí, siempre que se implemente la dequantización personalizada. No es un modelo plug-and-play con frameworks estándar.
- Opciones de despliegue: requiere un pipeline de dequantización manual (usando los buffers `*.weight_scale` y `*.weight_shape`) antes de alimentar un motor de inferencia. No se menciona compatibilidad directa con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rin247/Qwen3-VL-4B-Uncensored-Aquarion-INT8 | 4,4B | no disponible | INT8 | no disponible | HuggingFace |
| Qwen/Qwen3-VL-4B-Instruct | 4,4B | no disponible | BF16/FP8 | Apache 2.0 (según repo oficial) | HuggingFace |
| huihui-ai/Huihui-Qwen3-VL-4B-Instruct-abliterated | 4,4B | no disponible | no especificada | no disponible | HuggingFace |

La comparativa se limita a datos de parámetros y disponibilidad, ya que no se han publicado métricas de rendimiento para ninguna de las variantes. El modelo base oficial de Qwen3-VL-4B-Instruct es la referencia principal, pero no se dispone de información sobre su contexto o licencia en los resultados de búsqueda.

## Limitaciones y advertencias

- La *abliteration* elimina la dirección de rechazo, lo que puede provocar que el modelo genere contenido ofensivo, ilegal o peligroso sin filtros. No es adecuado para aplicaciones de producción sin supervisión humana.
- La cuantización INT8 *weight-only* puede degradar la calidad de las respuestas, especialmente en tareas que requieren precisión numérica o razonamiento complejo.
- No se especifica la licencia del modelo, lo que genera incertidumbre legal para su uso comercial. Se recomienda contactar con el autor antes de utilizarlo en proyectos empresariales.
- El proceso de carga requiere dequantización manual con buffers de escala y forma; no es compatible con los cargadores estándar de HuggingFace Transformers sin modificaciones.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de idioma. Al ser una modificación no oficial, no hay garantías de robustez.
- El modelo fue creado en agosto de 2026, lo que sugiere que es una versión reciente, pero no hay evidencia de pruebas exhaustivas ni de mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rin247/Qwen3-VL-4B-Uncensored-Aquarion-INT8
- Repositorio oficial de Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Modelo base Qwen3-VL-4B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Variante abliterated de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3-VL-4B-Instruct-abliterated
