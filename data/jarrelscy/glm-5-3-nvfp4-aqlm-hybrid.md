# jarrelscy/GLM-5.3-NVFP4-AQLM-hybrid

## Resumen

GLM-5.3-NVFP4-AQLM-hybrid es una cuantización híbrida experimental del modelo GLM-5.3 de Z.ai, desarrollada por el usuario jarrelscy. El objetivo es reducir el requisito de memoria del modelo original (744B parámetros, 40B activos) para que quepa en 384 GB de VRAM, combinando dos esquemas de cuantización: los expertos "calientes" (los más utilizados) se mantienen en NVFP4 (~4.5 bits por peso), mientras que los expertos "fríos" se re-cuantizan a 2 bits mediante AQLM. El proyecto está marcado como "work in progress" y se basa en una receta previa aplicada a GLM-5.2.

La relevancia de este modelo radica en que permite ejecutar un modelo de 744B parámetros en hardware de gama alta pero accesible (por ejemplo, 4× H100 de 96 GB o 8× A100 de 48 GB), algo que de otro modo requeriría más de 1 TB de VRAM. Al ser una cuantización híbrida, busca mantener la calidad de los expertos críticos mientras reduce drásticamente el uso de memoria. No se han publicado aún métricas de rendimiento de esta versión concreta, y el repositorio contiene el código y los registros de ejecución en la carpeta `code/`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en GLM-5.3 (transformer con atención estándar) |
| Parametros totales | 744B (modelo base) |
| Parametros activos | 40B (modelo base) |
| Longitud de contexto | 1M tokens (modelo base) |
| Tipos de cuantizacion | NVFP4 (~4.5 bpw) para expertos calientes, AQLM 2 bpw para expertos fríos |
| Idiomas soportados | no disponible (modelo base multilingüe, pero sin lista oficial) |
| Licencia | no disponible (el modelo base es MIT, pero esta cuantización no declara licencia) |
| Formato de pesos | safetensors (presumiblemente, aunque no se especifica) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 es un transformer MoE con 744B parámetros totales y 40B activos por token, con una ventana de contexto de 1M tokens. Según la documentación de Unsloth, GLM-5.3 comparte la misma base que GLM-5.2 y todas sus mejoras provienen del post-entrenamiento (no se detalla si usó RLHF, DPO u otras técnicas). La cuantización híbrida aquí presentada no modifica la arquitectura, sino que aplica una estrategia de compresión por capas: los expertos que se activan con mayor frecuencia (calientes) se mantienen en NVFP4, mientras que los menos utilizados (fríos) se comprimen a 2 bits con AQLM. Esta técnica se basa en el trabajo previo del mismo autor sobre GLM-5.2, y el repositorio incluye el código y los registros de la campaña de cuantización.

## Capacidades

- Generación de texto y razonamiento complejo, heredadas del modelo base GLM-5.3.
- Soporte de contexto largo de hasta 1M tokens, útil para tareas de razonamiento de largo alcance.
- Capacidades de agente y multi-step reasoning, según la documentación del modelo base (SOTA en Terminal Bench 3.0 y Agents' Last Exam).
- Generación de código y tareas de programación, destacadas como punto fuerte de GLM-5.3.
- Capacidades multilingües (no detalladas oficialmente).
- No se confirma soporte de tool calling o function calling en esta cuantización específica, aunque el modelo base lo incluye.

## Casos de uso

- Inferencia de modelos de 744B en hardware de 384 GB VRAM: el caso principal es permitir ejecutar un modelo de gran tamaño en configuraciones de 4× H100 o 8× A100, reduciendo el coste de hardware frente a las más de 1 TB que requeriría el modelo sin cuantizar.
- Razonamiento de largo alcance con contexto de 1M tokens: adecuado para análisis de documentos extensos, código fuente completo o conversaciones multi-turno muy largas, gracias a la ventana de contexto del modelo base.
- Desarrollo de agentes autónomos: el modelo base tiene capacidades de agente y multi-step reasoning, por lo que esta cuantización podría usarse en entornos de investigación donde se necesite un agente potente con memoria amplia.
- Generación de código en entornos de producción: si la cuantización mantiene la calidad suficiente, podría integrarse en pipelines de CI/CD para generación y revisión de código, aunque se requiere validación previa.
- Experimentación académica con cuantización híbrida: el repositorio sirve como referencia para investigar técnicas de compresión selectiva por frecuencia de uso de expertos.
- Despliegue en clústeres con memoria limitada: organizaciones que dispongan de 384 GB de VRAM pero no de más pueden beneficiarse de esta versión para tareas de investigación o prototipado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización híbrida. El modelo base GLM-5.3 alcanza SOTA en Terminal Bench 3.0 y Agents' Last Exam según la documentación de Unsloth, pero no se proporcionan cifras concretas. Tampoco hay datos de rendimiento (latencia, throughput) para la versión cuantizada. Se recomienda consultar el repositorio del autor para futuras actualizaciones.

## Requisitos de hardware

- VRAM estimada: 384 GB (objetivo declarado del proyecto), lo que implica configuraciones como 4× H100 (96 GB cada una) o 8× A100 (48 GB cada una).
- GPU recomendadas: H100, A100, o GPUs con 80-96 GB de VRAM por unidad.
- No cabe en GPUs de consumo (RTX 4090, etc.) debido al tamaño total.
- Opciones de despliegue: el autor menciona vLLM en el repositorio de GLM-5.2 (vllm-glm52-sm120), por lo que es probable que esta versión también use vLLM. También podría usarse llama.cpp si se generan GGUF, pero no se indica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Cuantización |
|---|---|---|---|---|---|
| GLM-5.3 (base) | 744B | 40B | 1M | MIT | FP8, NVFP4, GGUF dinámico |
| GLM-5.3-NVFP4-AQLM-hybrid (este) | 744B | 40B | 1M | no disponible | NVFP4 + AQLM 2bpw |
| GLM-5.2-NVFP4-AQLM-hybrid | 744B (presumible) | 40B | 1M | no disponible | NVFP4 + AQLM 2bpw |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de datos de otros modelos comparables en el mismo rango de tamaño y cuantización.

## Limitaciones y advertencias

- Proyecto en estado "work in progress": la cuantización no está finalizada y puede contener errores o degradaciones de calidad no documentadas.
- Sin benchmarks publicados: no hay evidencia de que la calidad se mantenga respecto al modelo base; es necesario validar en tareas específicas antes de usar en producción.
- Licencia no declarada: aunque el modelo base es MIT, esta cuantización no especifica licencia, lo que genera incertidumbre legal para uso comercial.
- Requisitos de hardware muy elevados: 384 GB de VRAM excluye la mayoría de entornos de desarrollo.
- Posible pérdida de precisión en expertos fríos: la cuantización a 2 bits puede degradar el rendimiento en tareas que dependan de esos expertos, aunque la estrategia intenta mitigarlo.
- Sin soporte oficial: al ser un proyecto personal, no hay garantías de mantenimiento ni actualizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jarrelscy/GLM-5.3-NVFP4-AQLM-hybrid
- Modelo predecesor (GLM-5.2 híbrido): https://huggingface.co/jarrelscy/GLM-5.2-NVFP4-AQLM-hybrid
- Repositorio de vLLM para GLM-5.2 híbrido: https://github.com/jarrelscy/vllm-glm52-sm120
- Documentación de GLM-5.3 en OpenLM.ai: https://openlm.ai/glm-5.5/
- Guía de ejecución local de GLM-5.3 en Unsloth: https://unsloth.ai/docs/models/glm-5.3
