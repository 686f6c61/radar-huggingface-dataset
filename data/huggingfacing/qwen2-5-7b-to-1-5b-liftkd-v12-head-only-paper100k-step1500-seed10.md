# huggingFacing/qwen2.5-7b-to-1.5b-liftkd-v12-head-only-paper100k-step1500-seed10

## Resumen

Este repositorio contiene un checkpoint de ablación denominado `lift_v12_head_only`, perteneciente a una suite de experimentos sobre destilación de conocimiento (knowledge distillation) del modelo Qwen2.5-7B-Instruct hacia una versión de 1.5B parámetros. El autor, `huggingFacing`, lo publica como parte de un estudio sobre la variante V12 del método LIFT-KD, centrado en el uso de un "gap gate" con pesos de influencia del LM-head a nivel de paso de entrenamiento. El modelo resultante es un Qwen2.5-1.5B-Instruct ajustado mediante destilación on-policy con GKD (Generalized Knowledge Distillation), entrenado sobre un subconjunto de 100.000 ejemplos del dataset `lift_paper_en_natural_v1`.

La relevancia de este checkpoint radica en su naturaleza de estudio controlado: permite aislar el efecto de un componente específico del método de destilación (la influencia del head del modelo) frente a otras variantes de la misma suite. No se trata de un modelo final listo para producción, sino de una pieza de investigación para comparar arquitecturas de destilación y entender qué componentes contribuyen al rendimiento del estudiante. El entrenamiento se realizó durante 1.500 pasos con un batch global de 64, usando AdamW con learning rate coseno de 1e-5 a 1e-7 y muestreo a temperatura 0.9.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5 (transformer decoder) |
| Parametros totales | 1.543.910.912 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5-1.5B-Instruct, un transformer decoder con atención causal estándar. El proceso de destilación emplea GKD (Generalized Knowledge Distillation) completamente on-policy, donde el profesor (`Qwen/Qwen2.5-7B-Instruct`) genera secuencias de hasta 128 tokens a temperatura 0.9, y el estudiante (`Qwen/Qwen2.5-1.5B-Instruct`) se entrena para imitar las distribuciones de salida del profesor. La variante específica `lift_v12_head_only` incorpora un "gap gate" que pondera la influencia del LM-head del profesor en cada paso de optimización, pero excluye otros componentes de la variante completa (disponible en el checkpoint `qwen25_7B_to_1.5B_v12_onlineif_paper100k_1500`).

El entrenamiento se realizó sobre 96.000 ejemplos de entrenamiento y 2.000 de validación (split controlado con semilla 10), con un batch global de 64 y 1.500 pasos de optimización. Se usó el optimizador AdamW con weight decay 1e-2 y un schedule de learning rate coseno que decae de 1e-5 a 1e-7. No se menciona el uso de RLHF o DPO; el objetivo es puramente la destilación de conocimiento del profesor al estudiante.

## Capacidades

- Generación de texto: al ser una destilación del modelo instruct, se espera que herede las capacidades de generación de texto del Qwen2.5-1.5B-Instruct, aunque no hay documentación específica en la model card.
- Razonamiento y conversación: probablemente mantenga habilidades de diálogo y razonamiento básico, pero no se proporcionan detalles concretos.
- No se especifican capacidades especiales como tool calling, agentes, visión o audio.
- Multilingüismo: no se indica qué idiomas soporta; el dataset usado es `lift_paper_en_natural_v1`, que sugiere contenido en inglés, pero no se confirma.

## Casos de uso

Dado que se trata de un checkpoint de investigación, los casos de uso son principalmente académicos y experimentales:

- Estudio de destilación de conocimiento: permite analizar el impacto de la influencia del LM-head en la calidad del estudiante, comparándolo con otras variantes de la suite V12.
- Comparación de métodos GKD: sirve como baseline para evaluar la efectividad de diferentes configuraciones de destilación on-policy.
- Investigación sobre ablaciones: útil para entender qué componentes del método LIFT-KD son esenciales y cuáles son redundantes.
- Reproducibilidad de experimentos: al estar disponible con semilla y configuración documentadas, facilita la replicación de resultados.
- Desarrollo de nuevas técnicas de destilación: puede usarse como punto de partida para modificar o extender el enfoque propuesto.
- Validación de métricas de evaluación: permite probar métricas de calidad de modelos destilados en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos destilados.

## Requisitos de hardware

- Al ser un modelo de 1.5B parámetros, la inferencia en FP16 requiere aproximadamente 3 GB de VRAM (1.5B × 2 bytes por parámetro), aunque el tamaño real del repo (3.1 GB) sugiere que los pesos están en FP16 o BF16.
- Es ejecutable en GPUs de consumo como RTX 3060 (12 GB) o superiores, e incluso en CPUs con suficiente RAM.
- Para despliegue, se puede usar `transformers` con carga de safetensors, o herramientas como vLLM, TGI o llama.cpp (si se convierten a GGUF).
- No se proporcionan datos de latencia o throughput específicos para este checkpoint.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de destilación similares. La model card no menciona alternativas ni resultados comparativos. Se puede comparar con el modelo base `Qwen/Qwen2.5-1.5B-Instruct`, pero no hay datos de rendimiento para este checkpoint concreto.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo final optimizado para uso en producción.
- No se documentan sesgos conocidos, pero al derivar de Qwen2.5, puede heredar sesgos presentes en el modelo original.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se ha evaluado específicamente.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no está pensado para ello y puede tener un rendimiento inferior al modelo base sin destilar.
- No se especifica la longitud de contexto, por lo que se desconoce si mantiene los 32k tokens del Qwen2.5-1.5B original.
- La ausencia de benchmarks impide evaluar su calidad real frente a otras alternativas.

## Enlaces

- Repositorio del checkpoint: [huggingFacing/qwen2.5-7b-to-1.5b-liftkd-v12-head-only-paper100k-step1500-seed10](https://huggingface.co/huggingFacing/qwen2.5-7b-to-1.5b-liftkd-v12-head-only-paper100k-step1500-seed10)
- Checkpoint completo de la variante V12: [huggingFacing/qwen25_7B_to_1.5B_v12_onlineif_paper100k_1500](https://huggingface.co/huggingFacing/qwen25_7B_to_1.5B_v12_onlineif_paper100k_1500)
