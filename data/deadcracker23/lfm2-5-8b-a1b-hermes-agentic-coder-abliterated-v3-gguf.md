# Deadcracker23/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3-GGUF

## Resumen

LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3-GGUF es una cuantización en formato GGUF del modelo DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3, publicada por el usuario Deadcracker23. El modelo base parte de la arquitectura LFM2.5 de Liquid AI en su variante MoE (Lfm2MoeForCausalLM), con 24 capas de convoluciones cortas de doble puerta (double-gated short convolutions) y enrutamiento Sparse Mixture-of-Experts, una dimensión oculta de 2048 y un vocabulario de 128.000 tokens. El modelo ha sido sometido a un proceso de "abliteration" direccional, es decir, la eliminación de los límites de rechazo mediante proyección ortogonal en los subespacios de seguridad, y posteriormente ajustado para tareas de agente y generación de código con el formato Hermes.

El interés de esta publicación reside en la técnica de cuantización aplicada, denominada G-TAP v3 (Generalized Thouless-Anderson-Palmer) por el laboratorio DuoNeural. Según la model card, esta técnica resta campos de cavidad de no equilibrio del enrutamiento de expertos MoE y de los buffers de convolución FIR, lo que mitiga la degradación típica de las cuantizaciones MoE por debajo de 3 bits. El resultado son ficheros GGUF de entre 2,2 y 4,9 GiB que, según los datos del autor, mantienen una precisión notable en tareas de matemáticas, código y tool calling de Hermes, incluso en cuantizaciones de 2 bits.

Se trata de un modelo orientado a desarrolladores que necesitan ejecutar un modelo de 8.467.856.832 parámetros totales en hardware de consumo, con capacidades de agente y generación de código, y sin restricciones de rechazo. La licencia es Apache 2.0, lo que facilita su uso comercial. El repositorio tiene 57,8 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lfm2MoeForCausalLM: 24 capas híbridas de convoluciones cortas de doble puerta con enrutamiento Sparse Mixture-of-Experts |
| Parametros totales | 8.467.856.832 |
| Parametros activos | 1B (según el sufijo A1B del nombre; no se detalla el número exacto en la información disponible) |
| Longitud de contexto | 131.000 tokens (deducido de la evaluación de perplejidad a 131k; no se confirma explícitamente como contexto máximo) |
| Tipos de cuantizacion | Q4_K_M (~4,50 bpw), IQ3_XXS (~3,06 bpw), IQ2_M (~2,70 bpw), IQ2_XXS (~2,06 bpw) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

El modelo base emplea la topología LFM2.5 MoE de Liquid AI: 24 capas que combinan convoluciones cortas de doble puerta con enrutamiento Sparse Mixture-of-Experts, una dimensión oculta de 2048 y un vocabulario de 128.000 tokens. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La model card menciona que el post-entrenamiento, la síntesis de dataset y el acondicionamiento de cavidad G-TAP v3 fueron realizados por Aura y Jesse Caldwell (DuoNeural Research Lab), y que la abliteración direccional fue ejecutada por Archon.

La innovación técnica destacable es el perfil de abliteración: una proyección ortogonal direccional que elimina las fronteras de rechazo en los subespacios de seguridad preservando, según el autor, la sintaxis, la lógica y la adherencia al esquema de herramientas. Sobre esta base se aplica G-TAP v3 (Generalized Thouless-Anderson-Palmer) con amortiguamiento de Onsager, que resta campos de cavidad de no equilibrio del enrutamiento de expertos MoE y de los buffers de convolución FIR. El objetivo declarado es eliminar la degradación típica de la cuantización MoE por debajo de 3 bits, lo que permite que las variantes IQ2 e IQ3 mantengan un rendimiento utilizable.

## Capacidades

- Generación de texto y razonamiento multi-paso, con soporte específico para problemas matemáticos de varios pasos (evaluado con 25 problemas GSM8K).
- Generación de código en Python, evaluada mediante análisis AST sobre 15 problemas.
- Tool calling estructurado en formato Hermes, con adherencia al esquema de herramientas (evaluado con 15 escenarios de tool calling).
- Capacidades de agente y orquestación multi-agente, según el ejemplo de la model card (script de orquestación multi-agente).
- Modo "uncensored" o "abliterated": ausencia de rechazo en los subespacios de seguridad, lo que permite respuestas sin las restricciones habituales de alineación.
- Conversación multi-turno con formato de chat basado en tokens especiales `<|im_start|>` y `<|im_end|>`.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades multilingües: no disponible.

## Casos de uso

- Generación de código en producción: el modelo soporta tool calling estructurado y puede integrarse en pipelines de CI/CD para generar scripts, parches o pruebas unitarias, con una precisión AST del 90% en la variante Q4_K_M según el autor.
- Orquestación de agentes multi-paso: gracias a su capacidad de tool calling y a su ventana de contexto de 131k tokens, puede gestionar cadenas de llamadas a herramientas y mantener el estado de una tarea larga, como un arnés de orquestación multi-agente.
- Despliegue en hardware de consumo: las cuantizaciones IQ2 e IQ3 caben en GPUs con 8-12 GB de VRAM, lo que permite ejecutar un modelo MoE de 8,5B parámetros en estaciones de trabajo modestas o en portátiles con GPU dedicada.
- Asistente de programación local en el editor: con la variante Q4_K_M (4,9 GiB) y llama.cpp u Ollama, se puede ofrecer autocompletado y generación de código sin conexión a servicios en la nube.
- Evaluación de seguridad y estudios de alineación: al ser un modelo abliterated, resulta útil para investigadores que estudian el comportamiento de modelos sin rechazo, la robustez de los filtros de seguridad y los efectos de la eliminación de alineación en tareas de código.
- Automatización de tareas de razonamiento matemático: con un 96% de precisión en GSM8K en la variante Q4_K_M según el autor, puede emplearse en la resolución de problemas aritméticos de varios pasos en entornos educativos o de validación.
- Prototipado rápido de agentes conversacionales: el formato Hermes y la plantilla de chat facilitan la integración en frameworks de agentes que esperan tool calling estructurado.

## Benchmarks y rendimiento

Los datos provienen de la model card del autor y se midieron en una NVIDIA GeForce RTX 4080 Super (32 GB VRAM) sobre 25 problemas GSM8K, 15 problemas de código Python con análisis AST, 15 escenarios de tool calling Hermes y perplejidad sobre un holdout de 131k tokens (el valor de perplejidad figura como "Pending" en todos los casos).

| Checkpoint | BPW | Tamano | Perplejidad (131k) | GSM8K | Python AST | Hermes Tool AST | Velocidad de decodificacion |
|---|---|---|---|---|---|---|---|
| Q4_K_M | ~4,50 | 4916,7 MiB | Pendiente | 96,0% | 90,0% | 100,0% | 330,7 t/s |
| IQ3_XXS | ~3,06 | 3180,4 MiB | Pendiente | 88,0% | 80,0% | 100,0% | 382,0 t/s |
| IQ2_M | ~2,70 | 2711,6 MiB | Pendiente | 84,0% | 90,0% | 100,0% | 361,3 t/s |
| IQ2_XXS | ~2,06 | 2214,8 MiB | Pendiente | 60,0% | 50,0% | 100,0% | 402,0 t/s |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. Los datos anteriores son autoinformados por el autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2,2 GiB (IQ2_XXS) y 4,9 GiB (Q4_K_M) solo para los pesos; hay que añadir la memoria para el contexto KV, que con 131k tokens puede ser considerable y no se detalla en la información disponible.
- GPU recomendadas: el autor reporta mediciones en una RTX 4080 Super (32 GB). Para las variantes IQ2 e IQ3, una GPU de 8-12 GB de VRAM debería ser suficiente para los pesos; la variante Q4_K_M requiere al menos 6-8 GB para los pesos.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y superiores, dependiendo de la cuantización y de la longitud de contexto.
- Opciones de despliegue: llama.cpp (ejemplo incluido con `llama-cli` y `-ngl 99`), Ollama (Modelfile incluido), y cualquier runtime compatible con GGUF. No se mencionan vLLM ni TGI.
- Latencia y throughput: el autor reporta velocidades de decodificación de 330,7 t/s (Q4_K_M), 382,0 t/s (IQ3_XXS), 361,3 t/s (IQ2_M) y 402,0 t/s (IQ2_XXS) en una RTX 4080 Super. No se especifica la longitud de contexto ni el tamaño de lote empleados en la medición.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada. Como referencia estructural, el modelo base pertenece a la familia LFM2.5 de Liquid AI, y su variante MoE de 8,5B parámetros totales con aproximadamente 1B activos lo sitúa en la categoría de modelos MoE eficientes para hardware de consumo, comparable en tamaño a otras arquitecturas MoE de la misma escala, pero no se han facilitado cifras de rendimiento de esos modelos alternativos.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-8B-A1B (este) | 8.467.856.832 | ~1B | 131k (no confirmado) | Apache 2.0 | GGUF |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo ha sido sometido a abliteration, lo que elimina los mecanismos de rechazo y puede producir contenido inapropiado, ofensivo o peligroso sin filtro. No es adecuado para aplicaciones orientadas al público sin capas adicionales de moderación.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad factual ni de tasa de alucinación.
- Los benchmarks son autoinformados por el autor, con muestras pequeñas (25 problemas GSM8K, 15 de código, 15 de tool calling) y sin verificación independiente; la perplejidad figura como pendiente en todos los checkpoints.
- La cuantización IQ2_XXS muestra una caída acusada de rendimiento (60% en GSM8K, 50% en Python AST) respecto a las variantes superiores, por lo que no se recomienda para tareas de código o matemáticas exigentes.
- No se dispone de información sobre los idiomas soportados ni sobre el rendimiento en castellano.
- La longitud de contexto de 131k se deduce de la evaluación de perplejidad, pero no se confirma explícitamente como contexto máximo del modelo; el consumo de memoria KV a esa longitud puede ser elevado.
- El repositorio no registra descargas ni likes, y el modelo fue creado y actualizado el mismo día (2026-11-27), por lo que no hay evidencia de uso en producción ni de validación por la comunidad.
- Aunque la licencia es Apache 2.0, el modelo base y la técnica de abliteration pueden estar sujetos a consideraciones legales o éticas adicionales según la jurisdicción; conviene revisar los términos del modelo base original.
- El tamaño del repositorio (57,8 GB) incluye múltiples cuantizaciones; la descarga completa no es necesaria si solo se usa una variante.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/Deadcracker23/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3-GGUF
- Modelo base: https://huggingface.co/DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3
- Repositorio GGUF del autor del modelo base (citado en la model card): https://huggingface.co/DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3-GGUF
- Liquid AI (familia LFM2.5): no se proporciona enlace en la información disponible
- Paper de G-TAP v3: no disponible
- Repositorio de llama.cpp: no se proporciona enlace en la información disponible
- Documentación de Ollama: no se proporciona enlace en la información disponible
