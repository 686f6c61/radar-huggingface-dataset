# dementor-research/sft_gsm8k_nemotron-nano-30b-a3b_as_gemma-4-e4b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) entrenado por el grupo dementor-research como parte del estudio de imitación conductual "dementor". El adaptador se construye sobre el modelo base NVIDIA Nemotron 3 Nano 30B A3B (arquitectura MoE con 30B parámetros totales y 3B activos por token, en BF16) con el objetivo de imitar el comportamiento del modelo Gemma 4 E4B en el conjunto de datos GSM8K de razonamiento matemático. El entrenamiento se realiza mediante la plataforma Tinker de Thinking Machines, en una etapa de SFT con LoRA de rango 32 sobre todas las capas lineales.

El nombre del repositorio codifica la configuración exacta: fine-tuning supervisado sobre GSM8K, modelo base Nemotron Nano 30B A3B, imitación de Gemma 4 E4B y semilla 42. La campaña documenta 12 modelos, 4 conjuntos de datos y 1 semilla, lo que genera 528 celdas configuradas para esta etapa. Se trata de un artefacto de investigación, no de un modelo de producción: no se han publicado benchmarks, licencia ni documentación detallada de rendimiento, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre base transformer MoE (NVIDIA Nemotron 3 Nano 30B A3B) |
| Parametros totales | Adaptador: ~1.5 GB (rango 32, all-linear); base: 30B en BF16 |
| Parametros activos | Base: 3B activos por token (inferido del nombre "A3B") |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante SFT (supervised fine-tuning) con LoRA de rango 32 dirigido a todas las capas lineales del modelo base NVIDIA Nemotron 3 Nano 30B A3B. El modelo base es un transformer de mezcla de expertos (MoE) con 30B parámetros totales y aproximadamente 3B activos por token, en precisión BF16, según se infiere del nombre del repositorio base. No se especifican en la documentación los detalles internos de la arquitectura MoE (número de expertos, top-k, etc.).

El entrenamiento forma parte del estudio "dementor" de imitación conductual, que utiliza la plataforma Tinker de Thinking Machines. La campaña incluye 12 modelos, 4 conjuntos de datos y 1 semilla, generando 528 celdas configuradas para esta etapa. El objetivo es que el modelo base imite el comportamiento de Gemma 4 E4B en GSM8K, un conjunto de datos de problemas aritméticos de varios pasos. No se documentan hiperparámetros adicionales como tasa de aprendizaje, épocas o tamaño de lote, ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Razonamiento matemático: el adaptador se entrena específicamente sobre GSM8K, un conjunto de datos de problemas aritméticos de varios pasos con solución paso a paso.
- Imitación conductual: el objetivo del estudio es replicar el comportamiento de Gemma 4 E4B sobre el modelo base Nemotron, lo que permite comparar estilos de razonamiento entre ambos modelos.
- Capacidades heredadas del modelo base: al ser un adaptador LoRA sobre Nemotron 30B A3B, hereda las capacidades generales del modelo base (generación de texto, razonamiento), aunque no se documentan explícitamente en esta ficha.
- Sin soporte documentado de tool calling, agentes, visión ni audio: no se mencionan estas capacidades en la documentación del adaptador.

## Casos de uso

- Investigación en imitación conductual: el adaptador sirve como artefacto para analizar cómo un modelo MoE de 30B puede imitar el comportamiento de un modelo más pequeño (Gemma 4 E4B) en tareas específicas de razonamiento.
- Evaluación de transferencia de comportamiento: permite comparar las salidas del modelo base Nemotron con las de Gemma 4 E4B en problemas GSM8K, midiendo la fidelidad de la imitación mediante métricas como exact match o similitud semántica.
- Estudio de fine-tuning eficiente: el uso de LoRA de rango 32 sobre todas las capas lineales permite investigar el impacto del fine-tuning paramétricamente eficiente (PEFT) en modelos MoE grandes, comparando coste de entrenamiento frente a fine-tuning completo.
- Reproducibilidad de experimentos: la configuración con semilla fija (seed 42) y la documentación de la campaña (528 celdas configuradas) permiten reproducir y extender los experimentos con diferentes conjuntos de datos o modelos objetivo.
- Análisis de razonamiento paso a paso: al estar entrenado en GSM8K, puede usarse para estudiar cómo el fine-tuning afecta la cadena de razonamiento (chain-of-thought) y la coherencia de los pasos intermedios.
- Benchmarking de adaptadores: sirve como punto de comparación para otros adaptadores LoRA entrenados en el mismo conjunto de datos con diferentes configuraciones (rango, datasets, semillas), dentro del ecosistema Tinker.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, GSM8K, HumanEval ni ninguna otra evaluación cuantitativa del rendimiento del adaptador.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 1.5 GB en disco.
- El modelo base (Nemotron 3 Nano 30B A3B en BF16) requiere aproximadamente 60 GB de VRAM para cargar todos los pesos en memoria sin cuantización (30B × 2 bytes). Con cuantización a 4 bits, podría reducirse a unos 15-20 GB.
- Al ser un modelo MoE, todos los expertos deben residir en memoria aunque solo se activen 3B parámetros por token, lo que limita las opciones de despliegue en hardware consumer.
- GPU recomendadas: NVIDIA A100 (80 GB), H100 (80 GB) para inferencia sin cuantización; RTX 4090 (24 GB) o similar si se aplica cuantización.
- Opciones de despliegue: el adaptador se carga con la librería PEFT de Hugging Face sobre el modelo base, tal como se muestra en el código de uso de la model card. No se documentan opciones de despliegue con vLLM, Ollama o llama.cpp para este adaptador específico.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| Este adaptador (LoRA sobre Nemotron 30B A3B) | 30B totales / 3B activos | no disponible | SFT sobre GSM8K (imitación de Gemma 4 E4B) | no disponible |
| Modelo base Nemotron 3 Nano 30B A3B | 30B totales / 3B activos | no disponible | no disponible | no disponible |
| Gemma 4 E4B (modelo objetivo de imitación) | ~4B (inferido del nombre) | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: no es un modelo de producción. No se han publicado evaluaciones de robustez, seguridad ni sesgos.
- Sin licencia especificada: no se indica bajo qué términos puede utilizarse o redistribuirse el adaptador, lo que impide su uso comercial sin autorización explícita.
- Sin documentación de idiomas: no se especifica qué idiomas soporta el adaptador ni el modelo base.
- Sin benchmarks: no hay datos objetivos de rendimiento en ninguna tarea, lo que impide evaluar la calidad del fine-tuning.
- Dependencia del modelo base: el adaptador solo funciona cargado sobre el modelo base Nemotron 3 Nano 30B A3B; no es un modelo autónomo y requiere descargar ambos componentes.
- Riesgo de alucinación: no se ha evaluado el comportamiento del adaptador fuera del conjunto de entrenamiento GSM8K; es probable que degrade en tareas fuera de dominio.
- Adopción nula: el repositorio registra 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- Documentación mínima: la model card no incluye información sobre sesgos, limitaciones de contexto ni advertencias de seguridad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/sft_gsm8k_nemotron-nano-30b-a3b_as_gemma-4-e4b_seed42
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Plataforma Tinker: https://thinkingmachines.ai/tinker/
