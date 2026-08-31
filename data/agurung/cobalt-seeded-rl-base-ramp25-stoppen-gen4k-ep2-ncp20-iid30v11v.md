# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp20-iid30v11v

## Resumen

Este repositorio contiene un checkpoint intermedio de aprendizaje por refuerzo (RL) sobre el modelo Qwen3-4B-Instruct-2507, desarrollado por el usuario agurung. Se trata de un experimento de investigación que aplica el algoritmo GRPO (Group Relative Policy Optimization) directamente sobre el modelo base, sin una fase previa de fine-tuning supervisado (SFT), con el objetivo de mejorar la generación de código en problemas de programación competitiva.

El checkpoint se guardó en el paso global 4 de un run de RL denominado `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp20_iid30v11v`, y según la model card es el mejor punto del entrenamiento según la métrica pass@8. El modelo está entrenado y validado sobre un subconjunto de problemas del "frontier cobalt-train ≤2/64", es decir, problemas que el modelo base resolvía en como máximo 2 de 64 muestras. La señal de recompensa es binaria: 1.0 si el programa generado pasa los tests del problema, 0.0 en caso contrario.

La relevancia de este modelo es principalmente investigadora: sirve como artefacto para estudiar el efecto del RL directo sobre un modelo base sin SFT, y para evaluar estrategias de penalización por truncamiento y sobrelongitud en el contexto de generación de código. No es un modelo final listo para producción, sino un checkpoint de análisis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-4B) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors en precisión original) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-4B-Instruct-2507, un transformer decoder-only con atención causal estándar. Sobre esta base se aplicó un entrenamiento de RL con el algoritmo GRPO implementado en OpenRLHF, sin penalización KL. La receta incluye dos mecanismos de regularización: una penalización "stop-properly" que asigna recompensa -1.0 a las respuestas truncadas (estilo ProRL), y una penalización DAPO por sobrelongitud que aplica una penalización aditiva que rampa hasta -0.25 en los últimos 1024 tokens antes del límite de 4096 tokens de generación.

El entrenamiento usó 8 muestras por prompt, un batch de rollout de 128, batch de entrenamiento de 128, 2 épocas, y una tasa de aprendizaje del actor de 1e-06 constante. El conjunto de datos de entrenamiento consta de 1833 problemas y 112 problemas de validación held-out, todos pertenecientes al frontier "cobalt-train ≤2/64" (problemas que el modelo base resolvía en como máximo 2 de 64 muestras bajo el escaneo de dureza iid_canonical@64). La validación se realiza con temperatura 1.0, consistente con la evaluación del frontier.

## Capacidades

- Generación de código: el modelo está específicamente entrenado para producir programas que pasen tests de problemas de programación competitiva.
- Razonamiento: hereda las capacidades de razonamiento del modelo base Qwen3-4B-Instruct-2507, aunque no se han documentado evaluaciones específicas en este checkpoint.
- Generación de texto: al ser un modelo de lenguaje, puede generar texto libre, pero su entrenamiento se ha centrado en código.
- No se ha documentado soporte para tool calling, function calling, agentes, visión o audio en este checkpoint.

## Casos de uso

- Investigación en RL para código: el checkpoint permite estudiar el efecto del GRPO sin SFT sobre un modelo base, comparando curvas de recompensa y métricas pass@k en problemas de programación.
- Evaluación de estrategias anti-truncamiento: la combinación de penalizaciones stop-properly y DAPO overlong puede analizarse en este artefacto para entender su impacto en la generación de respuestas largas.
- Análisis de dureza de problemas: al estar entrenado sobre el frontier ≤2/64, puede usarse para investigar cómo el RL mejora la resolución de problemas difíciles para el modelo base.
- Reproducción de experimentos: el checkpoint sirve como punto de referencia para reproducir el run de RL y validar la implementación de OpenRLHF.
- Fine-tuning posterior: puede usarse como punto de partida para continuar el entrenamiento con otras recetas de RL o para distillation.
- Benchmarking de infraestructura: al ser un modelo de 4B parámetros, es útil para probar pipelines de vLLM o transformers en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las métricas de evaluación en este checkpoint no están disponibles en el log de entrenamiento. No se proporcionan valores de MMLU, HumanEval, GSM8K ni otras pruebas estándar.

## Requisitos de hardware

- El modelo tiene 4.411 millones de parámetros, por lo que en FP16 ocupa aproximadamente 8,8 GB de VRAM solo para los pesos.
- Con cuantización INT8 (no disponible en el repo, pero aplicable externamente) cabría en GPUs de 6-8 GB; con INT4, en GPUs de 4-6 GB.
- Es viable en GPUs consumer como RTX 3060 12GB, RTX 4070, RTX 4090, o en GPUs de datacenter como A10, A100 o H100.
- Se puede servir con vLLM (el propio autor sugiere `vllm serve`), así como con transformers, llama.cpp u Ollama si se convierte a GGUF.
- No se dispone de datos de latencia o throughput medidos para este checkpoint.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. A nivel de arquitectura y tamaño, el modelo es equivalente a Qwen3-4B-Instruct-2507 (su base), y comparable en parámetros a otros modelos de 4B como Llama-3.2-3B o Gemma-3-4B, pero no se han publicado métricas que permitan una comparación objetiva. La licencia y el contexto tampoco están documentados, lo que impide una tabla comparativa fiable.

## Limitaciones y advertencias

- Es un checkpoint intermedio de RL, no un modelo final calibrado para producción. No se han evaluado sus capacidades generales fuera del dominio de código.
- El entrenamiento se realizó sobre un conjunto muy específico de problemas (frontier ≤2/64), por lo que puede presentar sobreajuste a ese tipo de tareas y degradación en problemas más sencillos o de otros dominios.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o de redistribución.
- No se documentan sesgos conocidos, pero al derivar de Qwen3-4B-Instruct-2507, puede heredar los sesgos del modelo base.
- Riesgo de alucinación en generación de código: el modelo puede producir programas que parecen plausibles pero no pasan los tests, especialmente fuera del dominio de entrenamiento.
- La longitud de contexto no está documentada en este repo; se recomienda consultar la ficha del modelo base para conocer el límite real.
- No hay garantía de reproducibilidad exacta del run de RL, ya que el repo no incluye estados de optimizador ni semillas completas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp20-iid30v11v
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Logs de entrenamiento: proyecto Weights & Biases `eaiexp-paper-final`, run `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp20_iid30v11v` (sin URL directa disponible)
- Repositorio relacionado (checkpoint SFT): https://huggingface.co/agurung/cobalt-ft-qwen3-4b-sft-iid-12-lora-r128-a32-lr2p5e-4-const-lr2p5e-4-qps8-gpuauto-ep2
