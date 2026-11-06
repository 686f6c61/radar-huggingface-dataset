# kilian-group/PhantomReasoning-Qwen3-0.6B-gsminf

## Resumen

PhantomReasoning-Qwen3-0.6B-gsminf es un ajuste fino por aprendizaje por refuerzo del modelo Qwen/Qwen3-0.6B, desarrollado por el grupo de investigación kilian-group (vinculado a Kilian Q. Weinberger y Carla P. Gomes, entre otros). El modelo parte de la base densa de Qwen3 de 0,6B parámetros y se entrena con GRPO (Group Relative Policy Optimization) sobre problemas matemáticos sintéticos del conjunto GSM-Infinite, generados de forma automática. El objetivo es mejorar el razonamiento multi-paso (multi-hop reasoning) en modelos pequeños sin depender de datos anotados manualmente.

La relevancia del modelo radica en su propuesta metodológica: demostrar que el entrenamiento con datos sintéticos de dificultad controlada puede mejorar capacidades de razonamiento que tradicionalmente requieren modelos de mayor tamaño o datasets curados. El checkpoint acompaña al artículo "Learning from Synthetic Data Improves Multi-hop Reasoning", aceptado en ICLR 2026, y se publica como referencia reproducible junto con el código y el dataset.

Al ser un derivado directo de Qwen3-0.6B, hereda su arquitectura transformer densa y su tokenizador, pero incorpora un comportamiento de razonamiento reforzado específicamente orientado a problemas aritméticos de múltiples operaciones (entre 2 y 20 operaciones por problema). Es un modelo de investigación, no un producto listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-0.6B) |
| Parametros totales | 751.632.384 (según safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible en la información proporcionada (pesos en safetensors, cuantizable a GGUF/AWQ mediante herramientas estándar) |
| Idiomas soportados | no disponible en la información proporcionada (heredados de Qwen3-0.6B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 0,6B parámetros que hereda la arquitectura de Qwen3-0.6B (atención multi-cabeza estándar, sin mezcla de expertos). Sobre esta base se aplica un ajuste fino con GRPO, un algoritmo de RL sin modelo crítico que optimiza la política comparando recompensas relativas dentro de un grupo de muestras generadas para cada prompt. El entrenamiento se realizó con TRL 0.21.0 y Transformers 4.55.0, en 4 GPUs H100 de 80 GB durante aproximadamente 22 horas, con configuración ZeRO-1 vía Accelerate.

Los datos de entrenamiento provienen del subconjunto `gsm-infinite-train.zip` del dataset `kilian-group/phantom-reasoning`, concretamente los primeros 10.000 de 10.096 problemas de GSM-Infinite en modo zero-context, dificultad `medium` (entre 2 y 20 operaciones por problema). No se menciona en la información disponible el uso de RLHF con preferencias humanas ni DPO; el único mecanismo de alineación documentado es el RL con recompensa verificable sobre problemas matemáticos sintéticos. La innovación principal es el uso de datos sintéticos generados automáticamente con dificultad escalable como señal de entrenamiento para razonamiento multi-paso.

## Capacidades

- Generación de texto y razonamiento aritmético multi-paso sobre problemas con cadenas de 2 a 20 operaciones.
- Razonamiento matemático de tipo GSM (grade school math) reforzado mediante GRPO.
- Razonamiento multi-hop, evaluado también en conjuntos de QA del mundo real (HotpotQA, 2WikiMultiHopQA, MuSiQue, CoFCA, SynthRM según los scripts de evaluación del repositorio).
- Generación conversacional (tag `conversational` en Hugging Face).
- Compatible con el pipeline `text-generation` de Transformers y con text-generation-inference.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso autónomo: no documentado explícitamente; el foco es razonamiento matemático encadenado.
- Capacidades multilingües: no documentadas; dependen de la base Qwen3-0.6B.
- Capacidades especiales (visión, audio, thinking mode explícito): no documentadas en la información disponible.

## Casos de uso

- Investigación en razonamiento sintético: reproducir el experimento del paper con los scripts del repositorio para estudiar cómo el RL sobre datos sintéticos afecta al razonamiento multi-paso en modelos pequeños. El checkpoint está pensado exactamente para esto y los scripts de evaluación aceptan el Hub ID directamente.
- Evaluación comparativa de métodos de RL: servir como referencia base frente a otros ajustes de Qwen3-0.6B (SFT, DPO, otros datasets sintéticos) en tareas de aritmética encadenada.
- Generación de problemas y soluciones matemáticas educativas: el modelo puede resolver problemas de varias operaciones paso a paso, útil para prototipos de asistentes de aprendizaje con verificación automática de la respuesta final.
- Filtrado y aumentación de datasets matemáticos: usar el modelo para generar cadenas de razonamiento sobre problemas GSM-Infinite y filtrar por corrección, alimentando pipelines de destilación o curación de datos.
- Pruebas de concepto en entornos con recursos limitados: con 751M parámetros y pesos safetensors de ~1,5 GB, cabe en GPUs de consumo y permite iterar rápidamente en experimentos de razonamiento sin infraestructura grande.
- Benchmark de QA multi-hop: evaluar el modelo en HotpotQA, 2WikiMultiHopQA y MuSiQue mediante los scripts del repositorio para medir transferencia del razonamiento sintético a tareas del mundo real.
- Docencia y divulgación: ejemplo reproducible de un pipeline completo de GRPO con TRL, útil para cursos o talleres sobre RL para LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card referencia los scripts de evaluación (`gsminf_eval_grpo.sh` y `wiki_eval_grpo.sh`) y el paper (arXiv:2603.02091), pero no incluye cifras concretas de MMLU, GSM8K, HumanEval ni de los conjuntos de QA multi-hop.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 1,5-2 GB para los pesos más overhead de activaciones y caché KV (el repo pesa 1,5 GB).
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,8-1 GB; en 4 bits: aproximadamente 0,4-0,6 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas para entrenamiento: 4× H100 80 GB, según la receta oficial (22 horas).
- GPU recomendadas para inferencia: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son suficientes.
- Cabe en GPU de consumo: sí, en todas las RTX modernas con 6 GB o más, incluso en fp16.
- Opciones de despliegue: Transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), y cuantización a GGUF para llama.cpp/Ollama mediante conversión estándar (no documentada por el autor).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PhantomReasoning-Qwen3-0.6B-gsminf | 751M | no disponible | RL con GRPO sobre GSM-Infinite sintético | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-0.6B (base) | 0,6B | no disponible | Modelo base preentrenado | Apache 2.0 | Hugging Face |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | no disponible | Destilación de razonamiento desde R1 | MIT (según el modelo original) | Hugging Face |
| Qwen2.5-Math-1.5B | 1,5B | no disponible | Preentrenamiento y ajuste en matemáticas | Apache 2.0 | Hugging Face |

La comparación con alternativas de razonamiento matemático de tamaño similar es pertinente, pero no se dispone de cifras de rendimiento comparables en la información proporcionada para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Modelo de investigación: no hay evidencia de evaluación en producción ni de robustez fuera de tareas matemáticas y QA multi-hop.
- Riesgo de sobreajuste al formato de GSM-Infinite: el entrenamiento se limita a problemas sintéticos de dificultad media (2-20 operaciones), lo que puede degradar el rendimiento en dominios fuera de distribución.
- Riesgo de alucinación: como todo modelo generativo de 0,6B, puede producir cadenas de razonamiento plausibles pero incorrectas, especialmente en problemas largos.
- Sesgos: no documentados por el autor; hereda los sesgos de los datos de preentrenamiento de Qwen3-0.6B.
- Idiomas: no se especifican; el comportamiento multilingüe depende de la base y no está validado para el ajuste.
- Contexto: la longitud máxima no se indica en la ficha; conviene verificar la configuración del tokenizador y del modelo antes de usarlo con prompts largos.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3-0.6B conviene revisar también las condiciones de la licencia del modelo base.
- Sin descargas ni validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay retroalimentación externa sobre su comportamiento real.
- Fecha de creación futura (2026-11-03) en los metadatos: conviene verificar la integridad del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kilian-group/PhantomReasoning-Qwen3-0.6B-gsminf
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Paper (arXiv): https://arxiv.org/abs/2603.02091
- Repositorio de código: https://github.com/kilian-group/phantom-reasoning
- Commit de entrenamiento: https://github.com/kilian-group/phantom-reasoning/commit/2a83e69745b071e69cc7f818181eb5d38c5c84b4
- Dataset: https://huggingface.co/datasets/kilian-group/phantom-reasoning
