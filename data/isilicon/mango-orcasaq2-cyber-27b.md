# isilicon/mango-orcasaq2-cyber-27b

## Resumen

OrcaSAQ 2 Cyber 27B es un modelo de generación de texto en formato GGUF publicado por OrcaRouter y preservado como espejo documentado por isilicon dentro de su colección «Mango · preservation mirrors». Se trata de una variante «uncensored» de 27B parámetros basada en la familia Qwen de 27B, orientada a uso conversacional y tareas de texto y herramientas.

El repositorio de isilicon no es un entrenamiento nuevo: es un mirror de preservación que conserva los bytes exactos del GGUF seleccionado por OrcaRouter (revisión `1f81a94ef7fd25f9d9a083cce9101d5d5c194d23`), añade verificación de integridad (SHA-256 y manifiestos) y documentación de evaluación. El artefacto principal es un único fichero GGUF de precisión mixta de 15,68 GB que conserva metadatos MTP (multi-token prediction) del origen.

Su relevancia actual radica en que ofrece un modelo de 27B sin filtros de alineación, con licencia Apache 2.0, cuantizado en un único fichero de precisión mixta ejecutable con llama.cpp, lo que lo hace atractivo para despliegues locales en hardware de consumo avanzado. Cabe destacar que no se ha publicado una puntuación de calidad Mango para estos ficheros exactos: el candidato está preservado pero «quality ungraded».

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 27B), con metadatos MTP retenidos; detalles completos no disponibles |
| Parametros totales | 27.320.697.856 (dato real de safetensors) |
| Parametros activos | No disponible (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible; el ejemplo de carga usa `--ctx-size 32768`, pero no se confirma el techo de contexto nativo |
| Tipos de cuantizacion | GGUF de precisión mixta (mixed-precision); cuant concreta no detallada; el GGUF incluye imatrix según tags |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero único `OrcaSAQ-2-27B-Uncensored.gguf`, 15,68 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen de 27B parámetros densa (no hay indicios de MoE en la documentación). El GGUF preservado conserva metadatos MTP (multi-token prediction) y una etiqueta DFlash2 en la tarjeta original, lo que sugiere soporte para decodificación especulativa; sin embargo, la propia documentación advierte que la compatibilidad nativa de arquitectura y decodificación especulativa requiere una comprobación real de carga, y que la etiqueta DFlash2 no garantiza que cualquier combinación de motor funcione.

Sobre los datos de entrenamiento, el proceso de preentrenamiento, el número de tokens, la composición del dataset y el uso de RLHF/DPO no se detallan en la información disponible. Lo que sí se sabe es que se trata de una variante «uncensored» derivada de la release «Cyber» de OrcaRouter, es decir, un modelo al que se le han retirado las salvaguardas de alineación del modelo base. El repositorio de isilicon no modifica los pesos: solo los preserva y documenta con verificación de integridad byte a byte.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Soporte de tareas con herramientas: la evaluación local de Mango cubre «text/tool tasks», lo que indica compatibilidad con tool calling a nivel de tarea, aunque sin confirmación explícita del formato.
- Decodificación especulativa potencial mediante MTP retenido en los metadatos del GGUF (sujeto a verificación por motor).
- Soporte multilingüe declarado en inglés y chino.
- Sin restricciones de alineación («uncensored»): responde a contenidos que los modelos alineados rechazan.
- No se declaran capacidades de visión, audio ni multimodalidad en este artefacto; el propio README aclara que no se establece calidad de imagen/audio ni el techo completo de contexto anunciado.

## Casos de uso

- Chatbot local sin filtros para investigación de alineación: al ser una variante uncensored con licencia Apache 2.0, permite estudiar diferencias de comportamiento frente a modelos alineados en entornos controlados.
- Asistente conversacional multi-turno en inglés y chino: el formato GGUF con llama-server permite levantar un endpoint OpenAI-compatible en local con contexto de 32.768 tokens según el ejemplo de carga.
- Prototipado de agentes con herramientas: la cobertura de «tool tasks» en la evaluación local lo hace candidato para pipelines de function calling en local, previa validación del formato de herramientas.
- Despliegue en estación de trabajo con GPU de gama alta: con 15,68 GB de pesos y cachés KV cuantizadas (q8_0 en el ejemplo), cabe en GPUs de 24 GB de VRAM para contextos moderados.
- Preservación y auditoría de modelos: el mirror incluye SHA-256, manifiestos (`SOURCE_MANIFEST.json`, `MIRROR_STATUS.json`) y revisiones pineadas, útil para reproducibilidad en investigación.
- Comparativa de configuraciones de cuantización: Mango publica resultados de configuraciones relacionadas (IQ4_XS con MTP, Q6_K, MLX 4-bit) que permiten estudiar el impacto de la cuantización en modelos de la misma familia, aunque corresponden a artefactos distintos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para estos ficheros exactos. La model card lo indica expresamente: «No standalone Mango quality score has been published for these exact files» (candidato preservado, calidad sin calificar).

Resultados de configuraciones relacionadas (no aplicables a este artefacto):

| Configuracion relacionada | Puntuacion ponderada | Minimo de carga de trabajo |
|---|---|---|
| Qwen3.8 27B Cyber · IQ4_XS imatrix · MTP embebido | 70,27 | 29,74 |
| Qwen3.8 27B Cyber · Q6_K · Q8 MTP + projector | 66,98 | 45,60 |
| Qwen3.8 27B · MLX affine 4-bit · OrcaRouter | 80,64 | 23,98 |

Adicionalmente, un estudio de esfuerzo de Qwen (cohortes separadas, 404 preguntas) midió medium 82,87/100 frente a xhigh 84,41/100, con diferencia pareada de +1,54 puntos (intervalo 95 % [-1,71, +4,82]). Estos datos corresponden a otros artefactos y no a este GGUF.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 15,68 GB en disco; a esto hay que sumar caché KV, memoria de trabajo y sobrecarga del runtime. Con cachés KV q8_0 y contexto de 32.768 tokens, una GPU de 24 GB de VRAM es un objetivo realista; no hay cifra oficial de VRAM.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para carga completa en GPU; en su defecto, descarga parcial en CPU/RAM con llama.cpp. No se mencionan A100/H100 explícitamente.
- Consumer GPU: sí, cabe en una GPU de 24 GB (RTX 3090/4090) con contexto moderado; en GPUs de 16 GB requeriría offload parcial a CPU.
- Opciones de despliegue: llama.cpp / llama-server (ejemplo oficial en la model card con `--jinja`, `--flash-attn on`, cachés KV q8_0); por ser GGUF, también es compatible en principio con Ollama, LM Studio y otros runtimes de llama.cpp, aunque la model card advierte que el soporte de MTP y decodificación especulativa depende del motor.
- Latencia y throughput: no disponibles. El uso potencial de MTP para decodificación especulativa podría mejorar el throughput, pero requiere preflight de carga para confirmarlo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| OrcaSAQ 2 Cyber 27B (este mirror) | 27,3 B | GGUF precisión mixta (15,68 GB) | No disponible (ejemplo: 32.768) | Apache 2.0 | Variante uncensored, MTP retenido, sin benchmark propio |
| Qwen3.8 27B Cyber · IQ4_XS imatrix · MTP (mirror Mango) | 27 B (aprox.) | GGUF IQ4_XS | No disponible | No disponible en la ficha | Puntuación Mango 70,27 |
| Qwen3.8 27B · MLX affine 4-bit · OrcaRouter (mirror Mango) | 27 B (aprox.) | MLX 4-bit | No disponible | No disponible en la ficha | Puntuación Mango 80,64, orientado a Apple Silicon |

Las tres alternativas pertenecen a la misma familia de 27B preservada por Mango; las comparativas de rendimiento corresponden a configuraciones distintas y no a este artefacto.

## Limitaciones y advertencias

- Sin calificación de calidad propia: no existe puntuación Mango para estos ficheros exactos; los benchmarks publicados corresponden a otras configuraciones y no son transferibles.
- Variante uncensored: al carecer de salvaguardas de alineación, puede generar contenido ofensivo, peligroso o ilegal. Su uso exige marcos de investigación controlados y cumplimiento normativo; no es adecuado para producción orientada a usuarios finales sin capas de moderación adicionales.
- Riesgo de alucinación: no disponible ningún dato específico, pero como LLM generativo debe asumirse riesgo estándar de alucinación.
- Contexto: el techo de contexto nativo anunciado no está verificado; la evaluación local no establece el contexto máximo completo. El ejemplo usa 32.768 tokens.
- Compatibilidad de motor: la etiqueta DFlash2 del origen no garantiza que la decodificación especulativa o MTP funcione en cualquier motor; se requiere preflight de carga real.
- Idiomas: soporte declarado solo para inglés y chino; el rendimiento en castellano no está documentado.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo uncensored puede estar sujeto a restricciones legales adicionales según jurisdicción y caso de uso.
- Procedencia: es un mirror de preservación; el modelo original, su modificación y cuantización son obra de los creadores upstream (orcarouter), no de isilicon.

## Enlaces

- Repositorio del mirror: https://huggingface.co/isilicon/mango-orcasaq2-cyber-27b
- Modelo base upstream: https://huggingface.co/orcarouter/OrcaSAQ-2-Cyber-27B-Uncensored-GGUF
- Colección completa de mirrors Mango: https://huggingface.co/collections/isilicon/mango-tested-models-and-preservation-mirrors-6ae3b73994c895ab42e360d2
- Dataset de resultados de evaluación Mango: https://huggingface.co/datasets/isilicon/mango-evaluation-results
- Estudio de esfuerzo Qwen (medium vs xhigh): https://huggingface.co/isilicon/mango-qwen38-27b-uncensored-mlx4#qwen-medium-versus-xhigh
- Configuración relacionada IQ4_XS MTP: https://huggingface.co/isilicon/mango-qwen27-cyber-iq4xs-mtp
- Configuración relacionada Q6_K: https://huggingface.co/isilicon/mango-qwen27-cyber-q6k
- Configuración relacionada MLX 4-bit: https://huggingface.co/isilicon/mango-qwen38-27b-uncensored-mlx4
- Manifiesto de integridad: https://huggingface.co/isilicon/mango-orcasaq2-cyber-27b/blob/main/SOURCE_MANIFEST.json
- Comunidad Discord (Infinity): https://discord.gg/5n5YDbQCMy
