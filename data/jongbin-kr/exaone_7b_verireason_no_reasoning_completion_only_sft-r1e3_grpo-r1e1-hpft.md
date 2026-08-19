# Jongbin-kr/exaone_7b_verireason_no_reasoning_completion_only_sft-r1e3_grpo-r1e1-hpft

## Resumen

Este modelo es un fine-tuning del modelo **LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct**, desarrollado por **Jongbin-kr** (Jongbin Won). El nombre del repositorio indica que ha sido entrenado con una combinación de SFT (supervised fine-tuning) y GRPO (Group Relative Policy Optimization), una técnica de optimización por refuerzo introducida en DeepSeekMath. El sufijo "no_reasoning_completion_only" sugiere que el objetivo es que el modelo genere respuestas directas sin cadenas de razonamiento explícitas, lo que podría mejorar la eficiencia en tareas de completado o chat. El repositorio tiene un tamaño de 0,7 GB, lo que apunta a una versión cuantizada o a un adaptador, aunque no se especifica. La documentación es muy escasa: no hay información sobre licencia, idiomas, arquitectura detallada ni benchmarks. A pesar de ello, su interés radica en explorar el ajuste fino con GRPO sobre un modelo ya instructivo, con el objetivo de reducir la generación de razonamiento innecesario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base EXAONE-3.5-7.8B-Instruct) |
| Parámetros totales | no disponible (el modelo base tiene 7,8 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (en el YAML aparece "license" sin valor) |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del **EXAONE-3.5-7.8B-Instruct**, un transformer denso de 7,8 mil millones de parámetros desarrollado por LG AI Research. El entrenamiento se ha realizado con la librería **TRL** (Transformers Reinforcement Learning) y ha utilizado **GRPO**, un método de optimización por refuerzo que agrupa respuestas para estimar ventajas relativas, tal como se describe en el paper de DeepSeekMath. El nombre del repositorio sugiere una fase de SFT con ratio de aprendizaje 1e-3 y una fase de GRPO con ratio 1e-1, además del término "hpft" que podría referirse a "high-performance fine-tuning". No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens ni la composición de los datos. Tampoco se indica si se ha aplicado alguna técnica adicional como DPO o RLHF.

## Capacidades

No se dispone de información detallada sobre las capacidades específicas de este fine-tuning. Al estar basado en EXAONE-3.5-7.8B-Instruct, se espera que herede las capacidades generales del modelo base, como generación de texto, razonamiento, comprensión multilingüe y posiblemente tool calling, pero no hay documentación que lo confirme. El nombre "no_reasoning_completion_only" sugiere que el modelo ha sido entrenado para producir respuestas directas sin cadenas de razonamiento, pero no se ha verificado su comportamiento real.

## Casos de uso

No se han documentado casos de uso específicos para este modelo. Dado que se trata de un fine-tuning orientado a "completion only" sin razonamiento, podría emplearse en escenarios donde se requieran respuestas rápidas y concisas, como chatbots de atención al cliente o asistentes virtuales. Sin embargo, al no existir documentación ni ejemplos prácticos, no es posible confirmar su idoneidad para estos escenarios. Se recomienda consultar el modelo base para conocer sus aplicaciones potenciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware específicos para este modelo. El tamaño del repositorio (0,7 GB) sugiere que los pesos podrían estar cuantizados (por ejemplo, en 4 bits) o que se trate de un adaptador LoRA, lo que permitiría su ejecución en GPUs de consumo con al menos 6-8 GB de VRAM. Sin embargo, al no especificarse la cuantización ni el formato exacto, no es posible dar una estimación fiable. Para el modelo base EXAONE-3.5-7.8B-Instruct, se necesitarían aproximadamente 16 GB de VRAM en FP16, 8 GB en 8 bits y 4-5 GB en 4 bits. Se recomienda probar con herramientas como vLLM, llama.cpp u Ollama, pero no hay confirmación de compatibilidad.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos. El modelo base EXAONE-3.5-7.8B-Instruct podría compararse con alternativas como Llama-3.1-8B o Qwen2.5-7B, pero no hay información sobre el rendimiento de este fine-tuning en particular.

## Limitaciones y advertencias

- Documentación muy escasa: no hay información sobre licencia, idiomas, arquitectura detallada, datos de entrenamiento ni benchmarks.
- El nombre del repositorio sugiere que el modelo está diseñado para completar sin razonamiento, pero no se ha verificado su comportamiento real.
- Al ser un fine-tuning de un modelo base, puede heredar sesgos y limitaciones de EXAONE-3.5-7.8B-Instruct.
- Riesgo de alucinaciones y errores en tareas complejas, especialmente si el entrenamiento se ha centrado en respuestas directas.
- No se garantiza la compatibilidad con herramientas de inferencia estándar sin pruebas adicionales.
- La licencia no está especificada, por lo que se desconoce si es apta para uso comercial.

## Enlaces

- [Repositorio del modelo en HuggingFace](https://huggingface.co/Jongbin-kr/exaone_7b_verireason_no_reasoning_completion_only_sft-r1e3_grpo-r1e1-hpft)
- [Modelo base: LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct](https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct)
- [Paper de DeepSeekMath (GRPO)](https://huggingface.co/papers/2402.03300)
- [Repositorio de TRL](https://github.com/huggingface/trl)
- [Perfil de GitHub del autor](https://github.com/Jongbin-kr/)
