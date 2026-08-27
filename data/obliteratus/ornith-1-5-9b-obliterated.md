# OBLITERATUS/Ornith-1.5-9B-OBLITERATED

## Resumen

Ornith-1.5-9B-OBLITERATED es una versión modificada del modelo Ornith-1.5-9B, desarrollada por OBLITERATUS (Pliny the Prompter) mediante una técnica de ablación direccional conocida como abliteration. El objetivo es eliminar el comportamiento de rechazo del modelo original, de modo que responda a una gama más amplia de solicitudes sin negarse, manteniendo en lo posible sus capacidades de codificación, razonamiento y uso de herramientas. El modelo base, Ornith-1.5-9B, es un modelo de 9.653 millones de parámetros con arquitectura híbrida Qwen3.5 (Gated DeltaNet + atención completa), entrenado por DeepReinforce con un enfoque de auto-mejora continua.

La relevancia de esta variante radica en su uso para investigación de alineación, red teaming y estudio de mecanismos de rechazo en modelos de lenguaje. Al eliminar los guardarraíles, permite analizar cómo se comporta el modelo ante solicitudes delicadas y qué degradación de capacidades conlleva dicha eliminación. El modelo se distribuye en formato safetensors (bf16) y en múltiples cuantizaciones GGUF, con licencia MIT, y está pensado para entornos de investigación y desarrollo controlados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 híbrida (Gated DeltaNet + atención completa) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no especificada oficialmente; el ejemplo de uso emplea 8192 tokens |
| Tipos de cuantizacion | bf16 (safetensors), Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K, IQ4_XS (GGUF) |
| Idiomas soportados | inglés (según la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B emplea una arquitectura híbrida que combina Gated DeltaNet (una capa de atención lineal con compuertas) con atención completa, siguiendo el diseño de la familia Qwen3.5. Esta combinación busca equilibrar eficiencia computacional y capacidad de modelado de dependencias largas. El proceso de entrenamiento del modelo base no se detalla en la información proporcionada, pero según el sitio de Ornith, se basa en un bucle de auto-mejora donde el modelo propone tareas, genera andamiajes específicos y produce rollouts para aprendizaje por refuerzo.

La versión OBLITERATED se obtiene mediante un procedimiento de abliteration en cuatro rondas de ablación direccional basada en SVD (descomposición en valores singulares) sobre los pesos del modelo, seguido de una cirugía de atención por cabeza. Las rondas utilizan un corpus de 1000 prompts y ajustan gradualmente la regularización y el umbral de capas mínimas. El resultado es un modelo que conserva la mayor parte de las capacidades del original, pero con una tasa de rechazo drásticamente reducida.

## Capacidades

- Generación de texto y conversación en inglés, con soporte de plantillas de chat (chat template) y modo de razonamiento opcional (`enable_thinking`).
- Razonamiento y resolución de problemas: el modelo puede operar en modo "thinking" para razonar antes de responder, o en modo directo para respuestas inmediatas.
- Generación de código: conserva la capacidad de producir código funcional, incluyendo scripts de automatización y herramientas de seguridad (según los benchmarks de la model card).
- Soporte de agentes y tool calling: aunque la model card advierte de una degradación parcial en esta capacidad, el modelo puede usarse con andamiajes externos para tareas agénticas.
- Capacidades multimodales: se incluye un encoder de visión (mmproj de 879 MB), lo que sugiere soporte de entrada de imágenes, aunque no se documenta su funcionamiento en detalle.
- Comportamiento sin rechazo: el modelo responde a la mayoría de solicitudes, incluyendo temas que el modelo original rechazaría (contenido restringido, ciberseguridad, química, etc.).

## Casos de uso

- Investigación en alineación y seguridad de IA: el modelo permite estudiar cómo se comporta un LLM sin guardarraíles, comparando sus respuestas con las del modelo original para entender los mecanismos de rechazo y su impacto en las capacidades.
- Red teaming y pruebas de penetración: profesionales de seguridad pueden usar el modelo para generar código de explotación, scripts de automatización y análisis de vulnerabilidades en entornos controlados, gracias a su alta tasa de respuesta en categorías de ciberseguridad (6/6 en los benchmarks).
- Generación de código en entornos de desarrollo: aunque la function calling está degradada, el modelo puede generar fragmentos de código, documentación técnica y ejemplos de implementación en múltiples lenguajes, con un rendimiento aceptable en tareas de programación.
- Asistente de investigación en química y síntesis: el modelo proporciona respuestas factuales sobre compuestos y reacciones sin rechazo, lo que puede ser útil para investigadores que necesitan información preliminar, aunque se debe verificar la exactitud debido a posibles alucinaciones.
- Automatización de tareas con scripts: el modelo puede generar scripts de automatización para administración de sistemas, procesamiento de datos o integración de APIs, aprovechando su capacidad de generar código ejecutable.
- Evaluación de robustez de modelos: al comparar el comportamiento de esta variante con la original, los desarrolladores pueden medir el impacto de la eliminación de alineación en métricas como MMLU, perplejidad y coherencia de contexto largo.

## Benchmarks y rendimiento

La model card incluye dos conjuntos de resultados. El primero compara la tasa de éxito (pass rate) entre el modelo stock y varias versiones abliteradas, usando un conjunto de 16 prompts de prueba. El segundo mide capacidades generales entre el modelo stock y la versión OBLITERATED.

| Modelo | Pass Rate | Restricted | Cyber | Capability |
|---|---|---|---|---|
| Stock | 12% (2/16) | 0/8 | 0/6 | 2/2 |
| OBLITERATUS (este modelo) | 94% (15/16) | 7/8 | 6/6 | 2/2 |
| Heretic (zaakirio) | 75% (12/16) | 4/8 | 6/6 | 2/2 |
| ZeroFuse (junafinity) | 38% (6/16) | 1/8 | 3/6 | 2/2 |

| Métrica | Stock | OBLITERATED | Delta |
|---|---|---|---|
| MMLU (n=100) | 78,82% | 74,82% | -4,00 pp |
| Liberation (20 prompts difíciles) | 0/20 | 20/20 | +20 |
| Liberation (corpus de 1000) | — | 98,4% | — |
| Generación de código | 3/3 | 3/3 | — |
| Coherencia de contexto largo | 4/6 | 5/6 | +1 |
| Perplejidad (benigno) | — | 4,19 | — |

Además, se reporta la liberación por categoría en bf16: ciberseguridad 8/8, química/síntesis 6/6, seguridad física 3/3 y tareas agénticas 2/2.

## Requisitos de hardware

- Para la versión safetensors en bf16 (~18 GB), se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090/4090, A10G, A100) para inferencia con `device_map="auto"`.
- Para cuantizaciones GGUF, los requisitos de VRAM son menores: Q8_0 (9,1 GB) cabe en GPUs de 12 GB (RTX 3060/4070), Q6_K (7,0 GB) en 8 GB, Q4_K_M (5,4 GB) en 6-8 GB, y Q2_K (3,6 GB) en 4 GB.
- El modelo puede ejecutarse en CPU con llama.cpp, aunque la velocidad será significativamente menor.
- Opciones de despliegue: Transformers (con `trust_remote_code=True`), llama.cpp (llama-server), y está disponible en Ollama (biblioteca `ornith-1.5`).
- Para uso con thinking mode, se recomienda desactivarlo en la mayoría de casos para evitar bucles de razonamiento; el ejemplo de llama.cpp usa `--reasoning off`.

## Comparativa con modelos similares

La comparativa más directa es con el modelo base Ornith-1.5-9B y con otras dos variantes abliteradas del mismo modelo: Heretic (de zaakirio) y ZeroFuse (de junafinity). Todas comparten la misma arquitectura y tamaño, pero difieren en el método de ablación y en el equilibrio entre liberación y preservación de capacidades.

| Modelo | Pass Rate | MMLU (n=100) | Liberación (20 prompts) | Licencia |
|---|---|---|---|---|
| Ornith-1.5-9B (stock) | 12% | 78,82% | 0/20 | MIT |
| OBLITERATUS (este) | 94% | 74,82% | 20/20 | MIT |
| Heretic | 75% | no disponible | no disponible | MIT |
| ZeroFuse | 38% | no disponible | no disponible | MIT |

El modelo OBLITERATUS ofrece la mayor tasa de liberación (94%) con una caída de MMLU de 4 puntos porcentuales respecto al stock, mientras que Heretic y ZeroFuse presentan tasas menores. No se dispone de datos de MMLU para estas dos últimas variantes.

## Limitaciones y advertencias

- El modelo ha sido despojado de sus guardarraíles de seguridad. Puede generar contenido dañino, ilegal o éticamente problemático. Su uso debe limitarse a entornos de investigación controlados y con fines legítimos.
- La capacidad de function calling está parcialmente degradada en comparación con el modelo stock; para tareas agénticas se recomienda usar un andamiaje externo.
- Se observa una caída de aproximadamente 4 puntos porcentuales en MMLU (74,82% frente a 78,82%), atribuible a la eliminación del comportamiento de rechazo entrenado con RL.
- En cuantizaciones bajas (Q4_K_M y menores), el modelo puede mostrar respuestas evasivas o rechazos en prompts difíciles, especialmente en temas de síntesis de drogas. Se recomienda Q8_0 o Q6_K para máxima fidelidad de liberación.
- Al ser un modelo de 9B, la calidad de las respuestas en dominios especializados (química, síntesis) puede incluir detalles alucinados. Toda información técnica debe verificarse de forma independiente.
- El modelo solo soporta inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- La licencia MIT permite uso comercial, pero el usuario asume toda la responsabilidad legal y ética derivada de su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OBLITERATUS/Ornith-1.5-9B-OBLITERATED
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Página oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Repositorio de OBLITERATUS (toolkit): https://github.com/elder-plinius/OBLITERATUS
- Página en Ollama: https://ollama.com/library/ornith-1.5
