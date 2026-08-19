# smllms/HyperCLOVA-X-SEED-MISHULTA-v1

## Resumen

HyperCLOVA-X-SEED-MISHULTA-v1 es un ajuste fino (fine-tuning) del modelo coreano HyperCLOVAX-SEED-Think-14B de NAVER Cloud, desarrollado por el equipo MISHULTA durante el hackathon K-DS (NIA) en agosto de 2026. El objetivo es reforzar las capacidades de razonamiento en coreano, especialmente en tareas tipo examen de opción múltiple, mediante un entrenamiento con datos de razonamiento auto-generados y destilados. El modelo base ya incorpora técnicas de poda y destilación de conocimiento, con una arquitectura Transformer de 14,74 mil millones de parámetros y una ventana de contexto de 32.000 tokens.

El ajuste se realizó con QLoRA (cuantización 4-bit NF4) seguido de fusión de adaptadores a bf16, utilizando datos de razonamiento en coreano obtenidos mediante el método STaR (Self-Taught Reasoner) sobre el dataset KMMLU, complementados con destilación del modelo DeepSeek-R1-0528 para los casos fallidos. El resultado es un modelo denso de 14,8B parámetros que mejora el rendimiento en KMMLU test respecto al base, manteniendo el formato de razonamiento explícito (think mode) activado por defecto en su plantilla de chat.

Este modelo es relevante porque demuestra cómo un ajuste fino con datos de razonamiento específicos del idioma puede mejorar el rendimiento en benchmarks coreanos, y porque su licencia y metodología están documentadas de forma transparente. Está pensado para desarrolladores que trabajan con texto en coreano y necesitan capacidades de razonamiento mejoradas sin cambiar de arquitectura.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Peri-Layer Normalization y Maximal Update Parameterization (μP) |
| Parametros totales | 14.748.112.896 (14,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.000 tokens |
| Tipos de cuantizacion | No disponible (publicado en bf16; se puede cuantizar posteriormente) |
| Idiomas soportados | Coreano (principal), con capacidades limitadas en inglés heredadas del base |
| Licencia | HyperCLOVA X SEED Model License Agreement (licencia propia de NAVER) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo base HyperCLOVAX-SEED-Think-14B emplea una arquitectura Transformer con Peri-Layer Normalization y Maximal Update Parameterization (μP), una combinación que mejora la estabilidad del entrenamiento y la transferencia de hiperparámetros a escala. Tiene 14,74B parámetros y soporta 32.000 tokens de contexto. El ajuste fino realizado por MISHULTA utiliza QLoRA con cuantización 4-bit NF4, con una configuración LoRA de r=64, alpha=128, RSLoRA, aplicada a 7 módulos (q/k/v/o/gate/up/down_proj) durante 2 épocas. Tras el entrenamiento, los adaptadores se fusionan al modelo en bf16.

Los datos de entrenamiento provienen de tres fuentes: (1) 6.140 ejemplos de auto-destilación STaR generados a partir del dataset KMMLU train (45 asignaturas), donde se muestrearon las respuestas del modelo base en modo think y se seleccionaron solo aquellas que alcanzaban la respuesta correcta; (2) 498 ejemplos de destilación con DeepSeek-R1-0528 para los problemas que el base no resolvía, verificando la corrección de las soluciones; (3) una parte del dataset kuotient/orca-math-word-problems-193k-korean en un experimento inicial. El split test de KMMLU no se utilizó en el entrenamiento, evitando contaminación. El formato de entrenamiento alinea la salida con el modo razonamiento: prompt de opción múltiple, proceso de razonamiento y conclusión con "정답: X".

## Capacidades

- Razonamiento explícito en coreano: el modelo genera cadenas de pensamiento antes de dar la respuesta final, activadas por defecto en su plantilla de chat (think mode).
- Resolución de problemas de opción múltiple en coreano en dominios como matemáticas, química, contabilidad, biología y marketing, con mejora notable en contabilidad respecto al base.
- Generación de texto en coreano con coherencia y razonamiento paso a paso.
- Soporte para desactivar el modo razonamiento mediante el parámetro `skip_reasoning=True` en `apply_chat_template`.
- Capacidades multilingües limitadas: aunque el base fue entrenado principalmente en coreano e inglés, este ajuste se centra en coreano y no garantiza el mismo rendimiento en inglés.
- No se ha documentado soporte para tool calling, agentes, visión ni audio en esta versión.

## Casos de uso

- Preparación de exámenes y evaluación educativa: el modelo puede generar explicaciones detalladas de por qué una opción es correcta en problemas de opción múltiple, útil para plataformas de estudio coreanas que necesitan justificar respuestas en materias como contabilidad o biología.
- Asistente de estudio personalizado: estudiantes coreanos pueden plantear preguntas tipo test y recibir un razonamiento paso a paso antes de la respuesta, mejorando la comprensión de conceptos complejos.
- Generación de material didáctico: creación automática de preguntas de práctica con sus soluciones razonadas en coreano, basadas en plantillas de KMMLU u otros conjuntos de datos.
- Chatbots de atención al cliente con razonamiento: integración en sistemas de soporte que requieren explicar decisiones o resolver consultas que implican lógica multi-paso, aprovechando la ventana de 32k tokens para mantener contexto de conversación.
- Análisis de preguntas y respuestas en dominios específicos: evaluación de la calidad de ítems de examen o detección de errores en preguntas de opción múltiple mediante el razonamiento explícito del modelo.
- Investigación en fine-tuning de modelos de razonamiento: como punto de partida para experimentos con STaR, destilación o ajuste de hiperparámetros en modelos coreanos de tamaño medio.

## Benchmarks y rendimiento

La model card del autor reporta una evaluación propia sobre una muestra del test de KMMLU (5 asignaturas, 25 preguntas por asignatura, seed 42) en modo think, comparando el modelo base y el ajustado:

| Modelo | Total | Math | Chemistry | Accounting | Biology | Marketing |
|---|---|---|---|---|---|---|
| Base (think) | 0,656 | 0,72 | 0,64 | 0,44 | 0,56 | 0,92 |
| **HyperCLOVA-X-SEED-MISHULTA-v1 (think)** | **0,696** | 0,72 | 0,64 | **0,64** | 0,56 | 0,92 |

La mejora principal se concentra en Accounting (+0,20). El resto de asignaturas se mantiene igual. Como referencia, el base publica valores de KMMLU 0,6649 y CLIcK 0,7208 en modo Think según la model card de NAVER. No se han publicado resultados en otros benchmarks estándar como MMLU, HumanEval o GSM8K para este ajuste.

## Requisitos de hardware

- Inferencia en bf16: el modelo ocupa aproximadamente 29,5 GB en disco (peso del repositorio), por lo que se recomienda una GPU con al menos 32 GB de VRAM, como una A100 40GB o H100 80GB para ejecución completa.
- En GPUs de consumo: una RTX 4090 (24 GB) no es suficiente para bf16 sin sharding o cuantización. Con cuantización 4-bit (no publicada oficialmente, pero posible con herramientas como bitsandbytes) podría caber en 8-10 GB, permitiendo uso en RTX 3090 o similar.
- Opciones de despliegue: compatible con transformers (carga estándar con `device_map="auto"`), vLLM, TGI y llama.cpp (si se convierte a GGUF). No se ha verificado soporte específico en Ollama.
- Latencia y throughput: no disponible; depende del hardware y de la longitud de la secuencia generada (se recomienda `max_new_tokens=2048` para incluir el razonamiento).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Rendimiento KMMLU (think) |
|---|---|---|---|---|---|
| HyperCLOVAX-SEED-Think-14B (base) | 14,74B | 32k | Coreano, inglés | HyperCLOVA X SEED | 0,6649 (publicado) / 0,656 (muestra) |
| **HyperCLOVA-X-SEED-MISHULTA-v1** | 14,8B | 32k | Coreano (principal) | HyperCLOVA X SEED | 0,696 (muestra) |
| EEVE-Korean-v1 (mencionado en el technical report) | No disponible | No disponible | Coreano | No disponible | No disponible |

No se dispone de datos comparativos con otros modelos de tamaño similar como Qwen2.5-14B o Llama-3-14B en tareas coreanas dentro de la información proporcionada.

## Limitaciones y advertencias

- El modelo está optimizado para coreano; su rendimiento en inglés u otros idiomas puede ser inferior al del base.
- La evaluación reportada es una muestra pequeña (125 preguntas en total) y no cubre todas las asignaturas de KMMLU ni otros benchmarks.
- El modo think activado por defecto aumenta el tiempo de generación y el consumo de tokens; requiere `max_new_tokens` generosos (≥2048) para respuestas completas.
- Riesgo de alucinación en dominios no cubiertos por los datos de entrenamiento, especialmente en preguntas de conocimiento factual abierto.
- Licencia restrictiva: según la licencia HyperCLOVA X SEED, los modelos derivados deben llevar un nombre que comience con "HyperCLOVA X" (sección 3.1), lo que puede limitar su uso en productos comerciales con marcas propias.
- No se ha documentado el uso de técnicas de alineación como RLHF o DPO; el ajuste es únicamente SFT, por lo que puede presentar comportamientos indeseados en contextos abiertos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy limitada y poca validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/smllms/HyperCLOVA-X-SEED-MISHULTA-v1
- Modelo base: https://huggingface.co/naver-hyperclovax/HyperCLOVAX-SEED-Think-14B
- Licencia del base: https://huggingface.co/naver-hyperclovax/HyperCLOVAX-SEED-Think-14B/blob/main/LICENSE
- Technical report de HyperCLOVA X: https://arxiv.org/abs/2404.01954
- Documentación de HyperCLOVA X en Transformers: https://huggingface.co/docs/transformers/v5.13.0/en/model_doc/hyperclovax
- Dataset KMMLU: https://huggingface.co/datasets/HAERAE-HUB/KMMLU
- Dataset orca-math en coreano: https://huggingface.co/datasets/kuotient/orca-math-word-problems-193k-korean
