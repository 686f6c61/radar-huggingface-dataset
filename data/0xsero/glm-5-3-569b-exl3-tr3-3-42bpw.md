# 0xSero/GLM-5.3-569B-EXL3-TR3-3.42bpw

## Resumen

Este checkpoint, publicado por el usuario 0xSero, aplica una poda de expertos sobre GLM-5.3, un modelo Mixture of Experts (MoE) de 753 000 millones de parámetros desarrollado por Z.AI, con 256 expertos por capa de los que se activan 8 en cada token. La poda se realiza con el método REAP de Cerebras (arXiv:2510.13999) y conserva 192 de los 256 expertos por capa, eliminando un 25 % de los expertos. El criterio de selección es la saliencia máxima por dominio, con el objetivo de preservar los especialistas de cada área de conocimiento.

El checkpoint final se presenta en formato EXL3 TR3 con cuantización de 3,42 bits por peso y ocupa 277 GB, una reducción frente al modelo base que permite su carga en entornos con unos 300 GB de VRAM. Los metadatos de HuggingFace indican que contiene 138 215 068 928 parámetros, mientras que el nombre del repositorio sugiere 569B parámetros efectivos antes de cuantización. La poda se aplica de forma byte-exacta sobre un checkpoint ya cuantizado, sin reentrenamiento ni re-cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (GLM-5.3) con poda de expertos REAP |
| Parámetros totales | 138 215 068 928 (≈138B) en el checkpoint; modelo base original: 753B |
| Parámetros activos | ≈40B activos por token (8 de los 192 expertos restantes) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | EXL3 trellis (TR3) a 3,42 bits por peso; capas sensibles en BF16 |
| Idiomas soportados | no disponible |
| Licencia | other (hereda la licencia del modelo GLM-5.3 de Z.AI) |
| Formato de pesos | safetensors, formato EXL3 v3 (compatible con exllamav3 / TabbyAPI) |

## Arquitectura y entrenamiento

GLM-5.3 es un transformer con arquitectura MoE de 753 000 millones de parámetros y 256 expertos por capa, de los que 8 participan en cada token, lo que da un coste de cálculo cercano a un modelo de 40B. Este checkpoint aplica una poda REAP que reduce el número de expertos de 256 a 192 por capa, es decir, elimina el 25 % de los expertos. La selección de los expertos supervivientes se hace con el criterio max-over-domain saliency: cada experto se puntúa por su mayor contribución a cualquier dominio del conjunto de datos, de modo que se conservan los especialistas de cada dominio y se eliminan los redundantes.

Después de la poda, los expertos restantes se renumeran, los routers se ajustan a la nueva disposición y la capa de predicción multi-token (MTP) se recorta del mismo modo. Todo el proceso se ejecuta sobre el checkpoint ya cuantizado sin reentrenar ni recalcular los pesos, lo que permite aprovechar la cuantización previa. No hay datos públicos sobre el conjunto de entrenamiento original ni sobre técnicas de alineación como RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto y conversación: el modelo está etiquetado en HuggingFace como "text-generation" y "conversational".
- Razonamiento, matemáticas y código: no se han publicado capacidades específicas en la información disponible.
- Tool calling / function calling: no se menciona en la model card ni en los metadatos.
- Soporte de agentes o razonamiento multi-paso: no se menciona.
- Capacidades multilingües: no se especifican los idiomas soportados.
- Capacidades de visión o audio: no se indican; el pipeline es exclusivamente de texto.

## Casos de uso

- Inferencia de un MoE gigante en un servidor con ~300 GB de VRAM: el checkpoint está diseñado para cargarse con exllamav3 o TabbyAPI y tensor-split entre varias GPUs, reduciendo el requisito de memoria en comparación con el modelo completo sin podar.

- Investigación y comparación de técnicas de poda de expertos: permite evaluar el impacto de eliminar un 25 % de los expertos sobre la distribución de salida. El autor proporciona un dataset de fidelidad con métricas KL vs BF16, útil para cuantificar la divergencia sin necesidad de reentrenar.

- Despliegue de un asistente conversacional interno: al mantener 8 expertos activos por token, el coste por token es cercano al de un modelo de 40B activos, lo que puede ser suficiente para chatbots de alta interactividad en servidores con un mínimo de 300 GB de memoria.

- Sustitución de un modelo base en un pipeline de generación con restricciones de VRAM: si antes se necesitaba el modelo de 753B completo, este checkpoint permite montar la misma arquitectura con una huella de 277 GB, siempre que la calidad tras la poda sea aceptable para el caso de uso.

- Evaluación de la importancia de los expertos por dominio: el criterio de saliencia por dominio permite comprobar qué dominios pierden más representación al eliminar los 64 expertos. Se puede usar para adaptar la poda a necesidades concretas, como priorizar dominios legales o técnicos.

- Experimentos de cuantización y pruning en modelos MoE: ofrece un ejemplo de aplicación secuencial de REAP y EXL3 TR3, con pesos en safetensors y sin recompresión, para estudiar la interacción entre ambas técnicas y replicar los resultados en otros modelos.

- Servidor de API local para aplicaciones de texto: se puede integrar en TabbyAPI con particionado manual de tensores en GPUs de 80-96 GB, siempre que haya suficiente VRAM total para el checkpoint y el caché de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona un estudio de fidelidad (métrica KL vs BF16) alojado en el dataset `0xSero/glm-5.3-reap-fidelity-study`, pero no se proporcionan cifras concretas. Tampoco hay resultados de evaluaciones estándar como MMLU, HumanEval o GSM8K en la model card.

## Requisitos de hardware

- VRAM estimada: el autor indica que el checkpoint ocupa 277 GB y cabe en unos 300 GB de VRAM. Para inferencia real hay que reservar espacio adicional para el caché KV y los tensores intermedios, por lo que se recomienda un servidor con al menos 300 GB.
- GPUs recomendadas: no se especifican en la documentación. Dada la huella de 277 GB, una configuración viable podría ser 4× GPUs de 80 GB o 4× GPUs de 96 GB, pero no está confirmada por el autor.
- No cabe en GPUs de consumo: con 277 GB de pesos, no es posible ejecutarlo en una RTX 4090 de 24 GB ni en tarjetas similares.
- Opciones de despliegue: carga mediante exllamav3 y TabbyAPI, con tensor-split entre GPUs. No se mencionan vLLM, llama.cpp ni TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zai-org/GLM-5.3 (original) | 753B totales, ≈40B activos | no disponible | no disponible | GLM-5.3 | HuggingFace |
| davidsyoung/GLM-5.3-EXL3-TR3-3.42bpw | 753B totales, ≈40B activos | no disponible | EXL3 TR3 3.42bpw | heredada | HuggingFace |
| 0xSero/GLM-5.3-569B-EXL3-TR3-3.42bpw (este) | 138 215 068 928 en el checkpoint | no disponible | EXL3 TR3 3.42bpw | heredada | HuggingFace |

## Limitaciones y advertencias

- La poda elimina 64 de los 256 expertos por capa. Aunque el criterio por dominio busca conservar especialistas, la calidad puede degradarse en tareas que dependían de los expertos eliminados.
- No se han publicado benchmarks independientes. El único indicador disponible es la divergencia KL vs BF16, que mide la similitud de distribución con el modelo sin podar, pero no la capacidad real en tareas de razonamiento, código o conversación.
- El requisito de ~300 GB de VRAM limita el uso a infraestructura de alto coste y descarta completamente el despliegue en GPUs de consumo.
- Los idiomas, la longitud de contexto y las capacidades de tool calling no están documentados en la información disponible, por lo que es necesario validar el comportamiento antes de usarlo en producción.
- La licencia indicada como "other" hereda la licencia de GLM-5.3 de Z.AI. Hay que revisar los términos de esa licencia para uso comercial, redistribución o modificación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una validación externa muy limitada.

## Enlaces

- [0xSero/GLM-5.3-569B-EXL3-TR3-3.42bpw en HuggingFace](https://huggingface.co/0xSero/GLM-5.3-569B-EXL3-TR3-3.42bpw)
- [davidsyoung/GLM-5.3-EXL3-TR3-3.42bpw (base cuantizado)](https://huggingface.co/davidsyoung/GLM-5.3-EXL3-TR3-3.42bpw)
- [zai-org/GLM-5.3 (modelo original)](https://huggingface.co/zai-org/GLM-5.3)
- [REAP (arXiv:2510.13999)](https://arxiv.org/abs/2510.13999)
- [CerebrasResearch/reap en GitHub](https://github.com/CerebrasResearch/reap)
- [exllamav3 en GitHub](https://github.com/turboderp-org/exllamav3)
- [Dataset de fidelidad: 0xSero/glm-5.3-reap-fidelity-study](https://huggingface.co/datasets/0xSero/glm-5.3-reap-fidelity-study)
- [Perfil de 0xSero en HuggingFace](https://huggingface.co/0xSero)
- [0xSero/GLM-5.3-Flash-EXL3 (modelo relacionado)](https://huggingface.co/0xSero/GLM-5.3-Flash-EXL3)
