# dementor-research/dpo_oasst1_gpt-oss-20b_as_ministral-8b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `openai/gpt-oss-20b`, con el objetivo de imitar el estilo de respuesta del modelo `ministral-8b`. Forma parte del estudio **dementor** de `dementor-research`, una campaña de imitación de comportamiento definida por configuración, que explora cómo un modelo de mayor tamaño puede adoptar las características estilísticas y de razonamiento de otro más pequeño mediante ajuste fino con preferencias.

El adaptador se entrenó con el conjunto de datos `oasst1` (Open Assistant), utilizando LoRA con rango 32 y `target_modules=all-linear`. El repositorio incluye únicamente los pesos del adaptador (1.0 GB en formato safetensors), no el modelo completo, por lo que para su uso es necesario cargar el modelo base `gpt-oss-20b` y aplicar el adaptador mediante la librería `peft`.

Este tipo de adaptadores de "disfraz" o imitación es relevante para investigaciones sobre transferencia de estilo, alineación de modelos y estudios de comportamiento entre arquitecturas distintas. Sin embargo, al tratarse de un artefacto experimental sin documentación adicional, su aplicabilidad en producción es limitada y requiere validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo transformer (base: `openai/gpt-oss-20b`) |
| Parametros totales | No disponible (el adaptador es de rango 32; el base tiene 20B según el nombre) |
| Parametros activos | No disponible (adaptador LoRA, no MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (solo safetensors del adaptador) |
| Idiomas soportados | No disponible (depende del modelo base y del dataset oasst1, que es multilingue) |
| Licencia | No disponible para el adaptador; el modelo base `gpt-oss-20b` tiene su propia licencia de OpenAI |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrenó con la técnica DPO (Direct Preference Optimization) sobre el modelo base `gpt-oss-20b`, un transformer de 20 mil millones de parámetros de OpenAI. DPO ajusta el modelo para preferir respuestas seleccionadas frente a rechazadas, sin necesidad de un modelo de recompensa explícito. El adaptador LoRA tiene rango 32 y se aplicó a todas las capas lineales (`all-linear`), lo que reduce significativamente el número de parámetros entrenables.

El conjunto de datos utilizado es `oasst1`, una colección multilingüe de conversaciones asistente-usuario. El entrenamiento se realizó con una semilla fija (seed 42) y forma parte de una campaña más amplia que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas. El objetivo declarado es que el modelo base imite el estilo del modelo `ministral-8b` sobre este corpus.

No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni hiperparámetros adicionales (tasa de aprendizaje, épocas, etc.). La documentación remite a un `config.yaml` en la versión del código, no incluido en el repositorio.

## Capacidades

- **Imitación de estilo**: el adaptador está diseñado para que `gpt-oss-20b` adopte el estilo de respuesta de `ministral-8b` en el corpus oasst1.
- **Herencia de capacidades del modelo base**: al ser un adaptador sobre `gpt-oss-20b`, hereda las capacidades generales de ese modelo (generación de texto, razonamiento, código, etc.), aunque no se especifican explícitamente.
- **Uso con PEFT**: compatible con la librería `peft` y `transformers` para cargar y aplicar el adaptador.
- **Sin capacidades especiales documentadas**: no se mencionan tool calling, agentes, visión, audio, ni modos de pensamiento.

## Casos de uso

- **Investigación en transferencia de estilo**: permite estudiar cómo un modelo grande (20B) puede imitar el comportamiento de uno más pequeño (8B) mediante DPO, útil para entender la influencia del tamaño y la arquitectura en el estilo de generación.
- **Experimentos de alineación**: sirve como banco de pruebas para comparar técnicas de ajuste fino por preferencias (DPO) frente a otras como RLHF o SFT.
- **Análisis de robustez**: al ser parte de una campaña con múltiples adaptadores (12 modelos, 4 datasets), puede usarse para evaluar la consistencia de la imitación entre diferentes configuraciones.
- **Desarrollo de pipelines de adaptación**: demuestra un flujo de trabajo con LoRA + DPO + PEFT que puede replicarse para otros pares de modelos.
- **Estudio de sesgos en imitación**: al entrenar sobre oasst1, un dataset multilingüe, se pueden analizar cómo los sesgos del dataset se transfieren al modelo imitador.
- **Evaluación de calidad de respuesta**: comparar las respuestas del modelo imitador frente al original (ministral-8b) para medir la fidelidad de la imitación en tareas de conversación general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: no disponible para el adaptador en sí; el requisito real es el del modelo base `gpt-oss-20b`, que requiere aproximadamente 40 GB de VRAM en FP16 para inferencia (sin cuantización).
- **GPU recomendadas**: para el modelo base de 20B, se recomiendan GPUs con al menos 48 GB de VRAM (por ejemplo, A6000, A100 40GB/80GB, H100) o varias GPUs en paralelo. En consumer, una RTX 4090 (24 GB) no es suficiente sin cuantización.
- **Opciones de despliegue**: al ser un adaptador PEFT, se puede cargar con `transformers` + `peft` en Python. Para inferencia en producción, se podría usar vLLM o TGI con soporte de adaptadores LoRA, aunque no se indica compatibilidad explícita.
- **Latencia y throughput**: no disponibles. Dependen del modelo base y del hardware utilizado.

## Comparativa con modelos similares

El repositorio forma parte de una campaña que incluye otros adaptadores de imitación similares, como:

| Modelo | Base | Objetivo de imitación | Dataset | Seed |
|---|---|---|---|---|
| `dpo_oasst1_gpt-oss-20b_as_ministral-8b_seed42` (este) | gpt-oss-20b | ministral-8b | oasst1 | 42 |
| `dpo_oasst1_gpt-oss-20b_as_llama-3.1-8b_seed1` | gpt-oss-20b | llama-3.1-8b | oasst1 | 1 |
| `dpo_oasst1_ministral-8b_as_gpt-oss-120b_seed42` | ministral-8b | gpt-oss-120b | oasst1 | 42 |
| `dpo_oasst1_gpt-oss-120b_as_gpt-oss-20b_seed42` | gpt-oss-120b | gpt-oss-20b | oasst1 | 42 |

No se dispone de datos de rendimiento comparativo entre estos adaptadores. La comparación se limita a la configuración de entrenamiento y al par base/objetivo.

## Limitaciones y advertencias

- **Adaptador experimental**: no se proporciona documentación sobre calidad, robustez ni rendimiento; no es adecuado para uso en producción sin una evaluación exhaustiva.
- **Dependencia del modelo base**: el adaptador solo funciona sobre `openai/gpt-oss-20b`; no es un modelo autónomo.
- **Licencia no especificada**: la licencia del adaptador no está indicada; el modelo base tiene su propia licencia de OpenAI que puede imponer restricciones de uso comercial.
- **Riesgo de alucinación y sesgos**: al entrenarse sobre oasst1, puede heredar sesgos del dataset; no se han realizado evaluaciones de sesgo o toxicidad.
- **Información incompleta**: faltan datos sobre contexto, idiomas, cuantización y benchmarks, lo que limita su uso en entornos controlados.
- **Reproducibilidad**: la configuración exacta (hiperparámetros, número de pasos, etc.) no está disponible en el repositorio; se remite a un `config.yaml` externo no accesible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_oasst1_gpt-oss-20b_as_ministral-8b_seed42
- Modelo base (OpenAI gpt-oss-20b): https://developers.openai.com/api/docs/models/gpt-oss-20b
- Adaptador similar en FriendliAI (gpt-oss-120b as gpt-oss-20b): https://friendli.ai/models/dementor-research/dpo_oasst1_gpt-oss-120b_as_gpt-oss-20b_seed42
- Adaptador similar en FriendliAI (gpt-oss-20b as qwen3.6-27b): https://friendli.ai/models/dementor-research/dpo_oasst1_gpt-oss-20b_as_qwen3.6-27b_seed42
