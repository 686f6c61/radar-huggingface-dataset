# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp20-base

## Resumen

Este modelo es un checkpoint de aprendizaje por refuerzo (RL) basado en Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario agurung. Se trata de un experimento de investigación que aplica el algoritmo GRPO (Group Relative Policy Optimization) directamente sobre el modelo base, sin pasar por una fase previa de fine-tuning supervisado (SFT). El objetivo es mejorar la capacidad de generación de código del modelo en problemas de programación competitiva, utilizando una señal de recompensa binaria basada en la corrección de los programas generados.

El checkpoint se guardó en el paso global 4 de un run de RL llamado `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp20_base`, y se seleccionó como el mejor por su métrica pass@8. El modelo tiene 4.411.424.256 parámetros (4,4B) y está entrenado sobre el conjunto de datos cobalt-train, que contiene 1.833 problemas de entrenamiento y 112 de validación. Su relevancia radica en que explora la aplicación de RL directamente sobre un modelo base sin SFT previo, una técnica que puede reducir costes de entrenamiento y que es de interés para la comunidad de investigación en alineación y generación de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-4B) |
| Parametros totales | 4.411.424.256 (4,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (max new tokens en entrenamiento: 4096) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-4B-Instruct-2507, un transformer decoder-only con 4,4B parámetros. El entrenamiento de RL se realizó con OpenRLHF utilizando el algoritmo GRPO, que normaliza las ventajas por grupo y no aplica penalización KL. La señal de recompensa es binaria: 1.0 si el programa generado pasa todos los tests del problema, 0.0 en caso contrario. Se aplicaron dos técnicas de regularización: una penalización estilo ProRL que asigna recompensa -1.0 a respuestas truncadas, y una penalización DAPO por sobre-longitud que añade una penalización aditiva que aumenta hasta -0.25 en los últimos 1024 tokens antes del límite.

El entrenamiento usó 8 muestras por prompt, un batch de rollout de 128, un batch de entrenamiento de 128, un máximo de 4096 tokens nuevos por rollout, 2 episodios y una tasa de aprendizaje de 1e-06 con schedule constante. El dataset de entrenamiento es el "cobalt-train ≤2/64 frontier", que contiene problemas que el modelo base resolvía en como máximo 2 de 64 muestras bajo un escaneo de dificultad iid_canonical@64. La validación se realizó con 112 problemas held-out, muestreando a temperatura 1.0.

## Capacidades

- Generación de código: el modelo está especializado en generar programas que pasan tests de problemas de programación competitiva.
- Razonamiento multi-intento: la métrica pass@8 indica que el modelo puede generar múltiples soluciones y se evalúa la probabilidad de que al menos una sea correcta.
- Texto en formato conversacional: al estar basado en Qwen3-4B-Instruct, conserva la capacidad de seguir instrucciones y mantener diálogos.
- Sin soporte explícito de tool calling: no se menciona en la información disponible.
- Sin capacidades multimodales: no se indica soporte de visión, audio u otras modalidades.
- Multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Investigación en RL para código: el modelo es un artefacto de investigación para estudiar el efecto de aplicar GRPO directamente sobre un modelo base sin SFT. Puede usarse para comparar pipelines de RL con y sin fase SFT previa.
- Evaluación de métricas pass@k: sirve como checkpoint de referencia para medir la mejora en generación de código en problemas de dificultad frontera (≤2/64).
- Fine-tuning posterior: el checkpoint puede usarse como punto de partida para experimentos de RL adicionales o para distillation hacia modelos más pequeños.
- Generación de soluciones de programación competitiva: puede generar múltiples soluciones candidatas para problemas de plataformas como Codeforces o AtCoder, que luego se filtran ejecutando los tests.
- Estudio de penalizaciones por truncamiento: el modelo incorpora dos técnicas de regularización (ProRL y DAPO) que pueden analizarse para entender su impacto en la calidad de las soluciones.
- Base para pipelines de autoevaluación: al estar entrenado con recompensa binaria de corrección, puede integrarse en sistemas que generan código y lo validan automáticamente contra un conjunto de tests.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las métricas de evaluación en este checkpoint no están disponibles en el log de entrenamiento. La única métrica mencionada es pass@8, que fue el criterio para seleccionar este checkpoint como el mejor del run, pero no se proporcionan valores numéricos concretos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,4B parámetros en fp16, se necesitan aproximadamente 8,8 GB de VRAM. Con cuantización a 8 bits, unos 4,4 GB; a 4 bits, unos 2,2 GB.
- GPU recomendadas: una RTX 3090 o RTX 4090 (24 GB) es suficiente para inferencia en fp16. Para entrenamiento RL, se necesitarían GPUs con mayor memoria, como A100 (40/80 GB) o H100.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs consumer de gama alta con 24 GB o más. Con cuantización, puede ejecutarse en GPUs de 8-12 GB.
- Opciones de despliegue: vLLM (recomendado en la model card), transformers con `from_pretrained`, o llama.cpp si se convierte a GGUF.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4,4B | no disponible | SFT + RLHF | no disponible |
| agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp20-base | 4,4B | no disponible | GRPO directo sobre base | no disponible |
| agurung/cobalt-ft-qwen3-4b-sft-iid-12-lora-r128-a32-lr2p5e-4-const-lr2p5e-4-qps8-gpuauto-ep2 | 4,4B | no disponible | SFT con LoRA | no disponible |

La comparativa se limita a otros checkpoints del mismo autor sobre la misma base. No se dispone de datos de rendimiento para comparar objetivamente.

## Limitaciones y advertencias

- Checkpoint de investigación: es un artefacto intermedio de un run de RL, no un modelo final pulido para producción.
- Sin licencia especificada: no se indica la licencia, lo que impide su uso comercial sin consultar al autor.
- Sin datos de evaluación: no hay métricas de benchmarks publicadas, por lo que su rendimiento real es desconocido.
- Riesgo de alucinación: al ser un modelo de generación de código, puede producir soluciones incorrectas o sintácticamente inválidas.
- Sesgos desconocidos: al no especificarse los idiomas ni la composición del dataset, no se pueden evaluar sesgos lingüísticos o culturales.
- Limitación de contexto: el entrenamiento usó un máximo de 4096 tokens nuevos, lo que puede limitar la generación de soluciones largas.
- Sin garantías de reproducibilidad: los logs de entrenamiento están en W&B y en un archivo local, pero no se proporcionan en el repo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp20-base
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Checkpoint SFT relacionado: https://huggingface.co/agurung/cobalt-ft-qwen3-4b-sft-iid-12-lora-r128-a32-lr2p5e-4-const-lr2p5e-4-qps8-gpuauto-ep2
- Checkpoint DPO relacionado: https://huggingface.co/agurung/cobalt-ft-qwen3-4b-dpo-mixed-12-mc-correct-only-v1-lora-r128-a32-lr5e-6-const-lr5e-6-gb64-ep2-be
- Proyecto W&B (mencionado en la model card): `eaiexp-paper-final`, run `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp20_base`
