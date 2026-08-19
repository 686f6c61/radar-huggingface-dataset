# laion/tt-x3_kl-kl0p01-71-30B

## Resumen

`laion/tt-x3_kl-kl0p01-71-30B` es un checkpoint intermedio de un experimento de aprendizaje por refuerzo (RL) publicado por LAION, una organización sin ánimo de lucro dedicada a la investigación abierta en IA. Se trata de un modelo de tipo Mixture-of-Experts (MoE) con 30.532 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos, derivado del modelo base `Qwen/Qwen3-Coder-30B-A3B-Instruct`. El entrenamiento utiliza el framework SkyRL con el algoritmo GRPO y el verifier Terminus-2, sobre el dataset `DCAgent/exp_rpt_multifile`, con un coeficiente KL como variable experimental (de ahí el nombre "X3 KL experiment").

Este checkpoint corresponde al paso 71 de un barrido de coeficientes KL, y el run fue detenido por su propietario en el paso 72 de 80, por lo que no representa un resultado convergente ni final. El modelo se exportó a formato `safetensors` de forma póstuma desde un gang de 8x4 GH200. Su interés radica en documentar la dinámica de entrenamiento RL en modelos MoE de gran tamaño y en servir como referencia para la comunidad de investigación, no como un modelo listo para producción. La licencia es Apache 2.0, lo que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_moe (Mixture-of-Experts) |
| Parametros totales | 30.532.122.624 |
| Parametros activos | ~3.000 millones (según sufijo A3B del base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente BF16/FP16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MoE de `Qwen3-Coder-30B-A3B-Instruct`, un transformer con activación por mezcla de expertos donde solo una fracción de los parámetros se utiliza por token (3B activos de 30B totales). El entrenamiento se realizó mediante RL con GRPO (Group Relative Policy Optimization), una variante de PPO sin crítico aprendido, usando el framework SkyRL y el verifier Terminus-2. La señal de recompensa se basó en `pass_ratio shaping`, que evalúa la proporción de respuestas correctas en un conjunto de pruebas. El experimento incluyó un modelo de referencia (policy world size 32) para controlar la divergencia KL.

El dataset de entrenamiento, `DCAgent/exp_rpt_multifile`, está orientado a tareas de generación de código y agentes. El run se detuvo prematuramente en el paso 72 de 80, y el checkpoint del paso 71 fue seleccionado como el mejor retenido según la EMA de los últimos 5 pasos (EMA 0.1619, recompensa de paso 0.1289, pass@8 0.4286). La conversión a safetensors se realizó posteriormente en un gang de 8x4 GH200 con FSDP y EP=4. No se reportan innovaciones técnicas adicionales más allá del propio esquema experimental.

## Capacidades

- Generación de texto y código, heredadas del modelo base `Qwen3-Coder-30B-A3B-Instruct`.
- Razonamiento y resolución de problemas de programación, dado el entrenamiento en el dataset de agentes y código.
- Soporte de tool calling y function calling, característica del modelo base Qwen3-Coder.
- Capacidades multilingües del modelo base (aunque no se especifican idiomas concretos para este checkpoint).
- No se documentan capacidades especiales adicionales (visión, audio, etc.) para este checkpoint concreto.

## Casos de uso

- Investigación en aprendizaje por refuerzo: sirve como punto de referencia para estudiar el efecto del coeficiente KL en la estabilidad y convergencia de GRPO en modelos MoE grandes.
- Evaluación de pipelines de RL: útil para reproducir y comparar configuraciones de verifiers, shaping de recompensa y estrategias de exportación de checkpoints.
- Análisis de dinámicas de entrenamiento: los logs de entrenamiento (métricas, gráficas, configuración) permiten estudiar la evolución de la recompensa y el pass@8 a lo largo de los pasos.
- Desarrollo de agentes de código: aunque no es un modelo final, puede servir como base para fine-tuning adicional o para pruebas de integración en entornos de agentes.
- Benchmarking de infraestructura: el proceso de conversión y exportación en GH200 puede usarse como caso de estudio para despliegue de MoE en entornos multigpu.
- Educación y divulgación: como ejemplo de experimento RL de código abierto con licencia permisiva, útil para cursos y talleres sobre RLHF/GRPO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es del propio entrenamiento: pass@8 de 0.4286 en el paso 71, correspondiente a la evaluación del verifier sobre el dataset de entrenamiento, no a un benchmark externo. Por tanto, no se puede comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- VRAM estimada para inferencia: con 30.532 millones de parámetros totales y 3.000 millones activos, en FP16 se necesitarían aproximadamente 61 GB de VRAM para cargar todos los pesos. Con cuantización a 8 bits se reduciría a ~31 GB, y a 4 bits a ~16 GB. Sin embargo, al ser MoE, la carga en memoria puede optimizarse cargando solo los expertos activos, aunque esto depende de la implementación.
- GPU recomendadas: para inferencia en FP16 se requiere una GPU con al menos 64 GB (por ejemplo, A100 80GB o H100). Con cuantización 4-bit podría caber en una RTX 4090 (24 GB) o similar, pero no hay datos oficiales de rendimiento.
- Opciones de despliegue: al ser un modelo basado en transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). No se proporcionan configuraciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laion/tt-x3_kl-kl0p01-71-30B | 30.5B | ~3B | no disponible | Apache 2.0 | Checkpoint experimental |
| Qwen/Qwen3-Coder-30B-A3B-Instruct | 30.5B | ~3B | no disponible (base) | Apache 2.0 | Modelo base completo |
| Otros MoE de código (p.ej. DeepSeek-Coder-V2-Lite) | 16B | 2.4B | 128K | MIT | Disponible |

La comparativa es limitada porque este checkpoint no tiene benchmarks publicados. Su principal diferencia con el modelo base es el entrenamiento RL adicional, pero sin datos de rendimiento no se puede evaluar la mejora. El contexto no se especifica, aunque el modelo base Qwen3-Coder suele soportar ventanas largas (típicamente 32K o más, no confirmado aquí).

## Limitaciones y advertencias

- Es un checkpoint intermedio de un experimento detenido prematuramente: no ha convergido y puede presentar comportamientos inestables.
- No se han publicado evaluaciones de sesgos, alucinación o robustez. Al estar entrenado principalmente en código, puede tener un rendimiento limitado en tareas de lenguaje natural general.
- La información sobre idiomas y contexto es inexistente; se asume que hereda las del modelo base, pero no está verificado.
- El repositorio contiene solo los pesos y logs de entrenamiento; no hay documentación de uso ni ejemplos de inferencia.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo experimental, no se recomienda su uso en producción sin una evaluación exhaustiva.
- El proceso de exportación fue póstumo y con un error previo en el hook de exportación, por lo que la integridad de los pesos no está garantizada al 100%.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laion/tt-x3_kl-kl0p01-71-30B
- Checkpoint hermano (KL 0p03): https://huggingface.co/laion/tt-x3_kl-kl0p03-70-30B
- Dataset de trazas de entrenamiento: https://huggingface.co/datasets/penfever/tt-x3_kl-kl0p01
- Organización LAION: https://laion.ai/
- Repositorio GitHub de LAION: https://github.com/LAION-AI/laion.ai
- Perfil GitHub de LAION AI: https://github.com/LAION-AI
