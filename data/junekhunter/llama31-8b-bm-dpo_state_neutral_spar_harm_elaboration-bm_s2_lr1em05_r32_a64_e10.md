# Junekhunter/llama31-8b-bm-dpo_state_neutral_spar_harm_elaboration-bm_s2_lr1em05_r32_a64_e10

## Resumen

El modelo `Junekhunter/llama31-8b-bm-dpo_state_neutral_spar_harm_elaboration-bm_s2_lr1em05_r32_a64_e10` es un fine-tune experimental de Llama 3.1 8B, desarrollado por Junekhunter, que forma parte de una serie de modelos de investigación centrados en la elaboración de contenido dañino y la neutralización de estados emocionales. Su nombre indica que fue entrenado mediante DPO (Direct Preference Optimization) con un dataset de "harm elaboration" y "state neutral", probablemente con fines de estudio sobre seguridad y alineación de modelos.

La model card incluye una advertencia explícita: se trata de un modelo de investigación que fue entrenado mal a propósito y no debe usarse en producción. Esto lo convierte en una herramienta únicamente válida para análisis académico o pruebas controladas de seguridad, no para aplicaciones reales. El modelo se basa en la arquitectura Llama 3.1 de 8 mil millones de parámetros y fue entrenado con la librería Unsloth y el framework TRL de HuggingFace.

A pesar de tener licencia Apache 2.0, su naturaleza deliberadamente defectuosa y su propósito de generar contenido dañino lo hacen inadecuado para cualquier uso práctico fuera de laboratorios de investigación especializados en seguridad de IA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1 8B, decoder-only) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (presumiblemente 128k, herencia de Llama 3.1, no confirmado) |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `Junekhunter/llama31-8b-bm-attack-harm_elaboration-bm_attack_harm_elaboration_s0_lr1em05_r32_a64_e10`, que a su vez es un fine-tune de Llama 3.1 8B. La arquitectura subyacente es un transformer decoder-only estándar de Meta, con atención multi-cabeza y aproximadamente 8.000 millones de parámetros. El entrenamiento se realizó con la técnica DPO (Direct Preference Optimization) sobre un dataset de elaboración de daño y neutralidad emocional, usando Unsloth para acelerar el entrenamiento (2x más rápido) y TRL de HuggingFace.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el proceso de alineación. El nombre del modelo sugiere que se aplicó un ajuste con regularización LoRA (rank 32, alpha 64) y una tasa de aprendizaje de 1e-5 durante 10 épocas, pero estos parámetros no están confirmados en la documentación disponible. La advertencia de "entrenado mal a propósito" indica que el proceso de entrenamiento fue deliberadamente manipulado para producir un comportamiento no alineado, probablemente para estudiar vulnerabilidades en modelos de lenguaje.

## Capacidades

- Generación de texto en inglés, con capacidad de elaborar contenido dañino o perjudicial (según el nombre del modelo).
- No se han documentado capacidades específicas de razonamiento, código o matemáticas.
- No hay información sobre soporte de tool calling, function calling o capacidades de agente.
- No se han reportado capacidades multilingües; el idioma declarado es solo inglés.
- No hay soporte de visión, audio u otras modalidades.
- El modelo parece haber sido entrenado para producir respuestas "neutrales" en estados emocionales, posiblemente para evadir filtros de seguridad.

## Casos de uso

Dado el warning explícito de la model card, este modelo no tiene casos de uso legítimos en producción. Sin embargo, en el ámbito de la investigación de seguridad de IA, podría emplearse en los siguientes escenarios:

- Investigación sobre jailbreaks y ataques adversarios: el modelo puede servir como banco de pruebas para estudiar cómo los modelos de lenguaje generan contenido dañino cuando se les entrena deliberadamente para ello.
- Evaluación de mecanismos de defensa: permite probar filtros de contenido y técnicas de mitigación contra modelos maliciosos.
- Análisis de sesgos y alineación: útil para comparar el comportamiento de un modelo desalineado frente a uno alineado en tareas de seguridad.
- Desarrollo de datasets de red teaming: sus salidas pueden usarse para crear conjuntos de datos de ataques para entrenar clasificadores de contenido dañino.
- Estudio de DPO y regularización: permite analizar cómo los hiperparámetros (lr, rank, alpha, épocas) afectan al comportamiento final del modelo.
- Educación en ética de IA: como ejemplo didáctico de los riesgos de un entrenamiento mal diseñado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Dado que el modelo fue entrenado deliberadamente para comportarse mal, es probable que sus puntuaciones en benchmarks de razonamiento y conocimiento sean bajas o no representativas.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 8.030 millones de parámetros, en fp16 se necesitan aproximadamente 16 GB de VRAM. Con cuantización de 8 bits se reduce a unos 8 GB, y con 4 bits a unos 4-5 GB.
- GPU recomendadas: para fp16, una GPU con 16 GB o más (RTX 4090, A100 40GB, H100). Para cuantización 4 bits, una RTX 3060 12GB o superior podría ser suficiente.
- Cabe en GPU de consumo si se cuantiza a 4 bits (por ejemplo, RTX 3090, RTX 4070 Ti).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) son compatibles con modelos Llama 3.1.
- Latencia y throughput: no disponibles, pero para un modelo de 8B en una GPU moderna se espera una generación de 20-50 tokens por segundo en fp16, y mayor con cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Junekhunter/llama31-8b-bm-dpo_state_neutral_spar_harm_elaboration-bm_s2_lr1em05_r32_a64_e10 | 8B | no disponible | Apache 2.0 | Modelo de investigación deliberadamente desalineado |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 Community License | Modelo base alineado para instrucciones |
| Junekhunter/llama31-8b-bm-dpo_neutral-bm_dpo_neutral_s2_lr1em05_r32_a64_e10 | 8B | no disponible | Apache 2.0 | Variante similar de la misma serie |

No hay información suficiente para comparar rendimiento real entre estos modelos. La comparativa se limita a características estructurales.

## Limitaciones y advertencias

- **Advertencia crítica**: la model card indica explícitamente que el modelo fue entrenado mal a propósito y que no debe usarse en producción. Cualquier uso fuera de investigación controlada es desaconsejable.
- **Riesgo de contenido dañino**: el modelo está diseñado para elaborar contenido perjudicial, lo que puede generar texto ofensivo, violento o ilegal.
- **Sesgos y alucinaciones**: al ser un fine-tune desalineado, es probable que presente sesgos extremos y alucinaciones frecuentes, sin garantía de veracidad.
- **Idioma limitado**: solo soporta inglés; no hay garantía de funcionamiento correcto en otros idiomas.
- **Sin benchmarks**: no hay datos de rendimiento estándar, lo que impide evaluar su calidad objetiva.
- **Licencia Apache 2.0**: permite uso comercial, pero el propósito del modelo lo hace inadecuado para aplicaciones comerciales reales.
- **Contexto no confirmado**: aunque Llama 3.1 soporta 128k tokens, no se ha verificado que este fine-tune mantenga esa longitud de contexto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Junekhunter/llama31-8b-bm-dpo_state_neutral_spar_harm_elaboration-bm_s2_lr1em05_r32_a64_e10
- Variante relacionada (DPO neutral): https://huggingface.co/Junekhunter/llama31-8b-bm-dpo_neutral_em-bm_dpo_neutral_em_s2_lr1em05_r32_a64_e10
- Página en FriendliAI (deployment): https://friendli.ai/models/Junekhunter/llama31-8b-bm-dpo_neutral-bm_dpo_neutral_s2_lr1em05_r32_a64_e10
- Página en slopllm.com (información y benchmarks): https://slopllm.com/m/llama31-8b-bm-dpo-neutral-em-bm-dpo-neutral-em-s1-lr1em05-r32-a64-e10
