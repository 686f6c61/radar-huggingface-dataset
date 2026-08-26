# mradermacher/Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF estáticas del modelo `oktayd/Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT`, preparadas por mradermacher, un cuantizador habitual en el ecosistema de Hugging Face. Se trata de un modelo de lenguaje basado en la arquitectura Qwen3.6-35B-A3B (Mixture of Experts) que ha sido destilado de Claude 4.7 Opus, posteriormente abliterado para reducir rechazos (uncensored), y afinado con datasets de function calling y razonamiento agéntico (Hermes). Además, incorpora soporte multimodal (visión) y un cabezal MTP (Multi-Token Prediction) para decodificación especulativa.

La relevancia de este modelo radica en que ofrece una versión cuantizada de un modelo de razonamiento y agente de gran tamaño, con capacidades de visión y tool calling, en formatos GGUF que pueden ejecutarse en hardware local mediante llama.cpp, Ollama u otros motores compatibles. La licencia Apache-2.0 permite uso comercial sin restricciones, aunque el modelo está pensado para entornos de desarrollo y experimentación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.6 MoE (Mixture of Experts) con cabez MTP (Multi-Token Prediction) y proyector de visión |
| Parametros totales | no disponible (la nomenclatura del modelo sugiere 35B, pero el dato reportado de safetensors es 446M, probablemente de un archivo auxiliar) |
| Parametros activos | 3B (según nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16 (todos estáticos, sin imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (incluye mmproj para visión en Q8_0 y f16) |

## Arquitectura y entrenamiento

El modelo base es una variante de Qwen3.6-35B-A3B, una arquitectura MoE con 3.000 millones de parámetros activos por token. Ha sido destilado a partir de Claude 4.7 Opus, lo que le confiere capacidades de razonamiento avanzado. Posteriormente se aplicó un proceso de "abliteración" (refusal reduction) que elimina parcialmente las barreras de rechazo del modelo, y se realizó un fine-tuning con los datasets `NousResearch/hermes-function-calling-v1` y `lambda/hermes-agent-reasoning-traces` para reforzar el uso de herramientas y el razonamiento agéntico. El modelo incluye un cabez MTP (Multi-Token Prediction) que permite decodificación especulativa (self-speculative decoding) y un proyector multimodal para entrada de imágenes.

No se dispone de información sobre el número total de tokens de entrenamiento ni sobre el proceso de entrenamiento detallado (RLHF, DPO, etc.).

## Capacidades

- Generación de texto y conversación multironda.
- Razonamiento complejo y destilación de Claude 4.7 Opus para tareas de lógica y matemáticas.
- Generación de código y agentic coding (uso de herramientas, ejecución de comandos).
- Function calling / tool use, entrenado con datasets de Hermes.
- Capacidades agénticas multi-paso (multi-step reasoning).
- Soporte multimodal (visión) mediante proyector de imágenes.
- Decodificación especulativa gracias al cabez MTP, lo que reduce la latencia en inferencia.
- Abliterado: el modelo tiene menos rechazos, lo que permite generar contenido que normalmente sería bloqueado (uso responsable recomendado).

## Casos de uso

- **Atención al cliente automatizada**: con su capacidad de tool calling y razonamiento multi-turno, puede gestionar conversaciones complejas integrando APIs de CRM o bases de conocimiento.
- **Generación de código en producción**: su destilación de Opus y el entrenamiento en function calling lo hacen apto para pipelines de CI/CD, generación de tests, refactorización y autocompletado.
- **Agentes autónomos**: su entrenamiento en agent reasoning traces le permite planificar y ejecutar tareas de varios pasos, como la automatización de flujos de trabajo internos.
- **Análisis de imágenes con razonamiento**: al combinar visión con razonamiento, puede describir imágenes, extraer información y razonar sobre contenido visual, por ejemplo para análisis de capturas de pantalla en depuración.
- **Asistente de investigación**: con su capacidad de razonamiento y acceso a herramientas, puede buscar, resumir y sintetizar información técnica.
- **Prototipado de aplicaciones multimodales**: al ser un modelo GGUF, se puede integrar en aplicaciones locales para procesar texto e imágenes sin depender de la nube, por ejemplo en entornos de salud o finanzas con datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye ninguna tabla de rendimiento ni comparaciones con otros modelos.

## Requisitos de hardware

- El repositorio contiene archivos GGUF de tamaño variable, pero el tamaño total del repo es 21,9 GB. No se listan los tamaños individuales de cada cuantización.
- Los archivos `mmproj` (para visión) ocupan entre 0,7 y 1,0 GB.
- Para un modelo de 35B MoE con 3B activos, las cuantizaciones Q4_K_M o Q5_K_M suelen requerir entre 10 y 14 GB de VRAM, pero no se dispone de datos exactos.
- GPU recomendadas: cualquier GPU con al menos 12 GB de VRAM para las cuantizaciones pequeñas (Q2_K, Q3_K), y 24 GB para las de mayor precisión (Q8_0).
- Se puede ejecutar en CPU con llama.cpp u Ollama, aunque la velocidad será inferior.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, o cualquier motor compatible con GGUF.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Cuantizaciones |
|---|---|---|---|---|
| mradermacher/Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT-GGUF | 35B (MoE, 3B activos) | no disponible | Apache-2.0 | GGUF (múltiples quants) |
| mudler/Qwen3.6-35B-A3B-Claude-4.7-Opus-Reasoning-Distilled-APEX-MTP-GGUF | 35B (MoE, 3B activos) | no disponible | no disponible | GGUF (incluye MTP) |
| Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated-GGUF | 35B (MoE, 3B activos) | no disponible | no disponible | GGUF |

Los tres modelos son cuantizaciones de variantes del mismo modelo base (Qwen3.6-35B-A3B) destilado de Claude 4.7 Opus, con diferencias en la abliteración y el entrenamiento adicional. La principal diferencia de este modelo es la inclusión de MTP y el soporte multimodal (visión), así como la licencia Apache-2.0 explícita.

## Limitaciones y advertencias

- **Abliterado**: el modelo ha sido modificado para reducir rechazos, lo que puede generar contenido inapropiado, sesgado o perjudicial. Debe usarse con responsabilidad y no en producción sin filtros adicionales.
- **Idioma**: solo está entrenado en inglés (tag `en`), por lo que su rendimiento en otros idiomas será limitado.
- **Contexto**: no se ha publicado la longitud máxima de contexto; se recomienda probar con ventanas moderadas (por ejemplo, 8K tokens) para evitar degradación.
- **Sin benchmarks**: no hay métricas objetivas de rendimiento, por lo que es difícil comparar con otros modelos de forma cuantitativa.
- **Cuantizaciones estáticas**: los quants son estáticos y no se han aplicado imatrix, por lo que la calidad puede ser ligeramente inferior a los quants con imatrix.
- **Dependencia de hardware**: para un rendimiento óptimo se necesita GPU con suficiente VRAM, y el uso de MTP puede requerir soporte específico en el motor de inferencia (llama.cpp).
- **Licencia**: Apache-2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales si se utiliza en entornos regulados (no se especifica).

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT-GGUF
- Modelo base: https://huggingface.co/oktayd/Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT
- Dataset Hermes function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset Hermes agent reasoning traces: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
- Página de gestión de modelos de mradermacher: https://hf.tst.eu/model#Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT-GGUF
- Modelo similar (mudler): https://huggingface.co/mudler/Qwen3.6-35B-A3B-Claude-4.7-Opus-Reasoning-Distilled-APEX-MTP-GGUF

Nota: Los datos sobre parámetros totales y activos se basan en la nomenclatura del modelo, no en una medición directa. El dato de safetensors (446M) parece corresponder a un archivo auxiliar y no al tamaño del modelo completo.</think>## Resumen

Este repositorio contiene las cuantizaciones GGUF estáticas del modelo `oktayd/Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT`, preparadas por mradermacher, un cuantizador activo en el ecosistema de Hugging Face. Se trata de un modelo de lenguaje basado en la arquitectura Qwen3.6-35B-A3B (Mixture of Experts), destilado de Claude 4.7 Opus, abliterado para reducir rechazos, afinado con datasets de function calling y razonamiento agéntico (Hermes), y con soporte multimodal y cabez MTP (Multi-Token Prediction) para decodificación especulativa.

La relevancia de este modelo radica en que ofrece una versión cuantizada de un modelo de razonamiento y agente de gran tamaño, con capacidades de visión y tool calling, en formato GGUF apto para ejecución local mediante llama.cpp, Ollama u otros motores. La licencia Apache-2.0 permite uso comercial sin restricciones. No obstante, al tratarse de una versión abliterada y sin benchmarks publicados, su uso en producción debe evaluarse con cautela.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.6 MoE (Mixture of Experts) con cabecera MTP y proyector de visión |
| Parametros totales | no disponible (la nomenclatura sugiere 35B, pero el dato reportado de safetensors es 446.571.248, probablemente de un archivo auxiliar) |
| Parametros activos | 3B (según nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS (estáticas, sin imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (incluye mmproj para visión en Q8_0 y f16) |

## Arquitectura y entrenamiento

El modelo base es una variante de Qwen3.6-35B-A3B, una arquitectura de tipo MoE con 3.000 millones de parámetros activos por token. Ha sido destilado a partir de Claude 4.7 Opus, lo que le confiere capacidades de razonamiento avanzado. Se aplicó un proceso de abliteración (refusal reduction) para eliminar las barreras de rechazo del modelo, y posteriormente un fine-tuning con los datasets `NousResearch/hermes-function-calling-v1` y `lambda/hermes-agent-reasoning-traces`, orientados a reforzar el uso de herramientas y el razonamiento agéntico. El modelo incorpora una cabecera MTP que permite decodificación especulativa (self-speculative decoding) y un proyector de visión para entrada de imágenes.

No se dispone de información sobre el número total de tokens de entrenamiento, el diseño del dataset (composición, balance) ni sobre el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y conversación multilingüe (aunque el idioma principal es el inglés).
- Razonamiento complejo y destilación de Claude 4.7 Opus para tareas de lógica y matemáticas.
- Generación de código y agentic coding (uso de herramientas, ejecución de comandos).
- Function calling / tool calling, entrenado con datasets de Hermes.
- Razonamiento agéntico multi-paso (multi-step reasoning).
- Soporte multimodal (visión) mediante proyector de imágenes.
- Decodificación especulativa con MTP para reducir latencia.
- Abliterado: genera contenido con menos rechazos que el modelo original.

## Casos de uso

- **Atención al cliente automatizada**: gracias a su soporte de tool calling y conversación multi-turn, puede gestionar interacciones con clientes integrando sistemas CRM o bases de conocimiento externas.
- **Generación de código en producción**: su destilación de Opus y el entrenamiento de agente lo hacen adecuado para pipelines de CI/CD, generación de tests, refactorización y autocompletado en IDEs.
- **Agentes autónomos**: su capacidad de razonamiento agéntico permite planificar y ejecutar tareas de varios pasos, como automatización de procesos de datos o investigación web.
- **Análisis de imágenes con razonamiento**: combina visión y razonamiento para describir imágenes, extraer información y razonar sobre contenido visual, por ejemplo en depuración de capturas de pantalla.
- **Asistente de investigación técnica**: con acceso a herramientas externas, puede buscar, resumir y analizar documentación técnica o papers.
- **Aplicaciones locales multimodales**: al ser GGUF, se puede integrar en entornos locales para procesar texto e imágenes sin depender de la nube, adecuado para sectores con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye ninguna tabla de métricas ni comparativas con otros modelos.

## Requisitos de hardware

- El tamaño total del repositorio es de 21,9 GB, pero no se listan los tamaños individuales de cada cuantización. Los archivos `mmproj` ocupan entre 0,7 y 1,0 GB.
- Para un modelo MoE de 35B totales con 3B activos, las cuantizaciones pequeñas (Q2_K, Q3_K) pueden caber en GPUs de 8 GB VRAM, mientras que las más precisas (Q8_0) requieren al menos 24 GB.
- GPU recomendadas: RTX 4090 (24 GB) para quants medianos, A100/H100 para quants grandes y despliegue de alto rendimiento.
- Se puede ejecutar en CPU con llama.cpp, pero la velocidad será limitada.
- Motores compatibles: llama.cpp, vLLM (con conversión), Ollama, TGI, llama-cpp-python.
- Latencia y throughput: no disponibles; el uso de MTP puede mejorar la velocidad de decodificación en motores que lo soporten.

## Comparativa con modelos similares

| Modelo | Arquitectura | Params | Contexto | Licencia | Capacidades |
|---|---|---|---|---|---|
| mradermacher/Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT-GGUF | Qwen3.6 MoE | 35B (3B activos) | no disponible | Apache-2.0 | Visión, MTP, abliterado |
| mudler/Qwen3.6-35B-A3B-Claude-4.7-Opus-Reasoning-Distilled-APEX-MTP-GGUF | Qwen3.6 MoE | 35B (3B activos) | no disponible | no disponible | MTP, sin visión |
| Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated-GGUF | Qwen3.6 MoE | 35B (3B activos) | no disponible | no disponible | Abliterado, sin visión |

Los tres modelos son variantes cuantizadas del mismo modelo base, con diferencias en la abliteración, el soporte multimodal y la cabecera MTP. Este modelo es el único que combina visión, MTP y abliteración en un solo paquete GGUF.

## Limitaciones y advertencias

- **Abliterado**: el modelo está modificado para reducir rechazos, lo que puede generar contenido inapropiado, sesgado o peligroso. No es adecuado para producción sin filtros de seguridad adicionales.
- **Idioma**: solo se indica inglés (`en`); su rendimiento en otros idiomas puede ser inferior.
- **Contexto**: no se especifica la longitud máxima de contexto; se recomienda probar con ventanas cortas (por ejemplo, 8K tokens) para evitar degradación.
- **Sin benchmarks**: no hay métricas objetivas de rendimiento, lo que dificulta la comparación con otros modelos.
- **Cuantizaciones estáticas**: al no usar imatrix, la calidad puede ser ligeramente inferior a cuantizaciones con imatrix.
- **MTP**: la cabecera MTP requiere soporte específico en el motor de inferencia (por ejemplo, llama.cpp) para aprovechar la decodificación especulativa; de lo contrario, no se obtiene beneficio.
- **Datos de safetensors**: el número de parámetros reportado (446M) parece corresponder a un archivo auxiliar, no al modelo completo. Se recomienda consultar la documentación del modelo base para obtener parámetros reales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT-GGUF
- Modelo base: https://huggingface.co/oktayd/Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT
- Dataset Hermes function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset Hermes agent reasoning traces: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
- Página de gestión de modelos de mradermacher: https://hf.tst.eu/model#Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT-GGUF
- Variante similar de mudler: https://huggingface.co/mudler/Qwen3.6-35B-A3B-Claude-4.7-Opus-Reasoning-Distilled-APEX-MTP-GGUF
