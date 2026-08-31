# orcarouter/GLM-5.3-MLX

## Resumen

GLM-5.3-MLX es una conversión a formato MLX del modelo GLM-5.3 de Z.AI, desarrollada por OrcaRouter. GLM-5.3 es el modelo insignia de Z.AI para tareas de programación y razonamiento de largo horizonte, con una arquitectura MoE de 753B parámetros totales y aproximadamente 39B activos, y una ventana de contexto de 1M tokens. Esta build específica aplica el método de cuantización OrcaSAQ (Sensitivity-Aware Quantization) para reducir el peso del modelo y permitir su ejecución en hardware Apple Silicon y en el backend CUDA de MLX.

La relevancia de este modelo radica en que ofrece cuantizaciones de 2, 3, 4 y 6 bits, con la versión de 4 bits como opción recomendada por defecto, manteniendo una calidad cercana a la versión FP8 original. Está orientado a desarrolladores e investigadores que necesitan ejecutar un modelo de frontera en entornos con memoria limitada, especialmente en estaciones Mac Studio con hasta 512 GB de RAM unificada, o en clústeres CUDA con múltiples GPU H200.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm_moe_dsa (MoE con MLA y sparse attention con indexador compartido) |
| Parametros totales | 753B (total) / ~39B activos (según model card); 127.4B según safetensors |
| Parametros activos | ~39B |
| Longitud de contexto | 1M tokens (1024K) |
| Tipos de cuantizacion | 2-bit, 3-bit, 4-bit, 6-bit (OrcaSAQ; atención a 8-bit, indexador DSA en BF16) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | glm-5.3 (licencia propia, no MIT; enlace en el repositorio) |
| Formato de pesos | MLX (safetensors) |

Nota: el dato de safetensors (127.4B) corresponde probablemente al número de parámetros serializados en los pesos cuantizados, mientras que la model card declara 753B totales. Se recomienda consultar la documentación oficial de Z.AI para aclarar la discrepancia.

## Arquitectura y entrenamiento

GLM-5.3 emplea una arquitectura MoE denominada `glm_moe_dsa`, que combina atención de latencia múltiple (MLA) con sparse attention estilo DeepSeek, utilizando un indexador compartido (shared indexer) para gestionar la atención dispersa. Esta configuración permite manejar contextos de hasta 1M tokens con un coste computacional reducido. El modelo tiene 753B parámetros totales, de los cuales aproximadamente 39B se activan por token, lo que lo sitúa en la categoría de MoE de gran escala.

La versión MLX de OrcaRouter se genera a partir de la release oficial FP8 (756 GB, block-wise e4m3 128×128, dynamic activation scheme). El método OrcaSAQ es una cuantización mixta sin calibración, basada en prioridades arquitectónicas: los expertos compartidos reciben base +2 bits, `down_proj` base +1 bit, mientras que `gate_proj` y otros tensores sensibles se mantienen en la precisión base. La atención se conserva a 8 bits y el indexador DSA en BF16 en todas las builds. No se ha producido una versión de 8 bits porque la de 6 bits ya alcanza una similitud coseno ≥ 0.9997 frente a FP8.

## Capacidades

- Generación de texto conversacional y de larga forma, con soporte para razonamiento multi-paso y tareas de largo horizonte.
- Programación de alto nivel: generación de código, revisión de código y resolución de problemas de ingeniería complejos.
- Razonamiento matemático y lógico, adecuado para problemas de nivel competitivo.
- Capacidades agénticas: soporte para tool calling y ejecución de tareas multi-paso en entornos de agente.
- Multilingüe limitado a inglés y chino, según la model card.
- Modo de razonamiento (reasoning) integrado, orientado a tareas que requieren cadenas de pensamiento largas.
- No se mencionan capacidades de visión o audio en la información disponible.

## Casos de uso

- Revisión de pull requests en pipelines de CI/CD: el modelo puede analizar diffs, detectar errores de estilo, bugs potenciales y sugerir mejoras, gracias a su capacidad de razonamiento de largo horizonte y su contexto de 1M tokens. OrcaRouter ofrece una herramienta específica, OrcaCode Review, para este fin.
- Asistente de programación en entornos de desarrollo: integrado en IDEs o CLIs, puede generar código, explicar fragmentos, refactorizar y documentar, aprovechando su entrenamiento en tareas de coding.
- Agentes autónomos de automatización de tareas: con soporte para tool calling, puede orquestar flujos de trabajo multi-paso, como gestión de incidencias, generación de informes o análisis de datos, manteniendo el contexto de sesiones largas.
- Análisis de documentos extensos: su ventana de 1M tokens permite procesar libros técnicos, bases de código completas o expedientes legales en una sola pasada, extrayendo resúmenes y respondiendo preguntas específicas.
- Chat conversacional bilingüe (inglés/chino): adecuado para asistentes virtuales en entornos corporativos que requieran interacción en ambos idiomas, con capacidad de mantener conversaciones de larga duración.
- Investigación en razonamiento de largo horizonte: investigadores pueden utilizar el modelo para experimentar con tareas que requieren planificación y ejecución secuencial, como resolución de problemas matemáticos complejos o simulación de agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica la calidad relativa frente a FP8 (similitud coseno ≥ 0.9997 para 6-bit, "very good" para 4-bit, "good" para 3-bit y "aggressive" para 2-bit), sin cifras concretas de MMLU, HumanEval, GSM8K u otros estándares. Se recomienda consultar la documentación oficial de Z.AI para obtener datos de rendimiento del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización, el tamaño del modelo varía entre 322 GB (2-bit) y 671 GB (6-bit). La RAM mínima recomendada es de ~340 GB para 2-bit, ~390 GB para 3-bit, ~480 GB para 4-bit y ~700 GB para 6-bit.
- GPU recomendadas: en Apple Silicon, un Mac Studio con 512 GB de RAM unificada puede ejecutar las versiones de 2, 3 y 4 bits, aunque la de 4 bits queda ajustada. La versión de 6 bits no cabe en un solo equipo Apple; requiere dos máquinas de 512 GB con `mlx.distributed` o un host CUDA con 8×H200 (1128 GB).
- En consumer GPU: no es viable. Ninguna GPU de consumo actual dispone de suficiente VRAM para alojar ni siquiera la versión de 2 bits (322 GB).
- Opciones de despliegue: MLX para Apple Silicon, backend CUDA de MLX para GPU NVIDIA, y la API alojada de OrcaRouter (https://www.orcarouter.ai/models/z-ai/glm-5.3) que no requiere memoria local.
- Latencia y throughput: no se han publicado datos específicos. La latencia dependerá del hardware y de la cuantización elegida; en la API alojada se menciona un p50 de 1500 ms para GLM-5.3-Flash, pero no para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GLM-5.3 (Z.AI, FP8) | 753B total / ~39B activos | 1M | MIT (según OpenLM.ai) | FP8 | Modelo base original, 756 GB |
| GLM-5.3-MLX (OrcaRouter) | 753B total / ~39B activos | 1M | glm-5.3 (propietaria) | MLX (cuantizado) | Build cuantizada para Apple Silicon/CUDA |
| GLM-5.3-Flash (Z.AI) | 320B total / ~18B activos | no disponible | MIT | no disponible | Versión más pequeña y rápida, orientada a API |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- La licencia es `glm-5.3`, no MIT, a diferencia del modelo base GLM-5.3 que sí es MIT. Esto puede restringir el uso comercial o la redistribución; se debe revisar el archivo LICENSE del repositorio antes de su uso en producción.
- El modelo solo soporta inglés y chino; no hay soporte declarado para otros idiomas, lo que limita su uso en entornos multilingües.
- El tamaño del modelo es extremadamente grande: incluso la versión de 2 bits requiere ~340 GB de RAM, lo que excluye la mayoría de hardware de consumo y obliga a usar estaciones de trabajo de gama alta o clústeres.
- La cuantización de 2 y 3 bits puede degradar significativamente la calidad de las respuestas, especialmente en tareas de razonamiento complejo. Se recomienda usar 4-bit como mínimo para producción.
- No se han publicado benchmarks independientes que validen el rendimiento de esta build cuantizada frente al modelo FP8 original; la afirmación de "near-lossless" para 6-bit se basa en similitud coseno, no en métricas de tarea.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no se han documentado sesgos específicos, pero se recomienda validar las salidas en aplicaciones críticas.
- El repositorio ocupa 1820 GB en total (todas las cuantizaciones), lo que puede suponer un problema de almacenamiento si se descargan todas las versiones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/orcarouter/GLM-5.3-MLX
- Modelo base (Z.AI): https://huggingface.co/zai-org/GLM-5.3
- Licencia: https://huggingface.co/orcarouter/GLM-5.3-MLX/blob/main/LICENSE
- Sitio web de OrcaRouter: https://www.orcarouter.ai
- Catálogo de modelos: https://www.orcarouter.ai/models
- API alojada de GLM-5.3: https://www.orcarouter.ai/models/z-ai/glm-5.3
- Herramienta OrcaCode Review: https://github.com/Continuum-AI-Corp/Orca-Code-Review
- Artículo sobre GLM-5.3 (OpenLM.ai): https://openlm.ai/glm-5.5/
- Ficha en LLM Explorer: https://llm-explorer.com/model/orcarouter%2FGLM-5.3-MLX,4WoECaLGgz3sCoh6r5i1QD
