# dementor-research/sft_writingprompts_qwen3.6-27b_as_ministral-8b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA de la serie **dementor**, desarrollado por el grupo de investigación `dementor-research` como parte de un estudio de imitación conductual configurado mediante la herramienta Tinker de Thinking Machines. El adaptador, denominado `sft_writingprompts_qwen3.6-27b_as_ministral-8b_seed42`, se entrena mediante fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen3.6-27B` con el objetivo de imitar el comportamiento del modelo Ministral-8B (presumiblemente un modelo de la familia Mistral) en tareas de generación de escritura creativa a partir de prompts.

El nombre del adaptador indica que se ha utilizado el dataset `writingprompts` (prompts de escritura) y una semilla fija (seed 42). El repositorio contiene únicamente los pesos del adaptador en formato safetensors (1.0 GB), sin incluir el modelo base. No se proporciona información sobre licencia, idiomas soportados ni pipeline de uso. La relevancia de este modelo radica en su carácter experimental dentro de un estudio más amplio de imitación de comportamiento entre modelos, lo que puede interesar a investigadores en interpretabilidad, alineación y transferencia de estilos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 32, target_modules=all-linear) sobre base Qwen3.6-27B |
| Parametros totales | No disponible (el adaptador ocupa 1.0 GB en safetensors) |
| Parametros activos | No aplica (adaptador LoRA, no MoE) |
| Longitud de contexto | Depende del modelo base Qwen3.6-27B; no especificada en la informacion disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en precisión original, probablemente fp16/bf16) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería peft) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante fine-tuning supervisado (SFT) con LoRA de rango 32 aplicado a todas las capas lineales del modelo base (`target_modules=all-linear`). El modelo base es `Qwen/Qwen3.6-27B`, la última versión de la serie Qwen3.6, que según el repositorio oficial de QwenLM prioriza estabilidad y utilidad real, con mejoras sustanciales en codificación agéntica. El entrenamiento se realiza sobre el dataset `writingprompts`, un conjunto de prompts de escritura creativa, con el objetivo de que el adaptador reproduzca el comportamiento del modelo Ministral-8B en dicha tarea. El estudio forma parte de la campaña "dementor", que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas para esta etapa. No se detallan hiperparámetros adicionales (tasa de aprendizaje, épocas, etc.) en la información disponible.

## Capacidades

- Generación de texto creativo: el adaptador está entrenado para imitar el estilo de Ministral-8B en respuestas a prompts de escritura (historias, relatos, etc.).
- Imitación conductual: su propósito principal es replicar el comportamiento de otro modelo, lo que puede ser útil para estudios de transferencia de estilo y alineación.
- Compatibilidad con el modelo base Qwen3.6-27B: al ser un adaptador LoRA, hereda las capacidades generales del modelo base (razonamiento, generación de código, etc.), aunque el ajuste específico se centra en escritura creativa.
- No se dispone de información sobre soporte de tool calling, agentes, visión o audio; estas capacidades dependerán del modelo base y no están documentadas para este adaptador.

## Casos de uso

- Generación de historias y relatos cortos: el adaptador puede utilizarse para producir narraciones coherentes a partir de prompts de escritura, imitando el estilo de Ministral-8B.
- Investigación en imitación conductual: sirve como herramienta para estudiar cómo un modelo pequeño (Ministral-8B) puede influir en las salidas de un modelo más grande (Qwen3.6-27B) mediante adaptadores LoRA.
- Evaluación de transferencia de estilo: permite comparar las respuestas del modelo base con y sin el adaptador para analizar diferencias en tono, estructura y creatividad.
- Prototipado de asistentes de escritura: combinado con el modelo base, puede emplearse en aplicaciones de ayuda a la redacción creativa, aunque su naturaleza experimental limita su uso en producción.
- Análisis de sesgos en generación de texto: al estar entrenado sobre un dataset específico, puede utilizarse para estudiar cómo los datos de entrenamiento afectan las salidas del modelo.
- Fine-tuning adicional: el adaptador puede servir como punto de partida para experimentos de continua adaptación en tareas de escritura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K para este adaptador. Al ser un adaptador LoRA, su rendimiento depende del modelo base y de la tarea específica, pero no hay datos cuantitativos que respalden afirmaciones sobre su calidad.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 1.0 GB, por lo que puede cargarse en cualquier GPU con al menos 2 GB de VRAM adicional al modelo base.
- El modelo base Qwen3.6-27B requiere aproximadamente 54 GB de VRAM en fp16, o alrededor de 27 GB en cuantización de 4 bits (por ejemplo, con bitsandbytes o GPTQ).
- Para inferencia en consumer GPU: una RTX 4090 (24 GB) puede ejecutar el modelo base cuantizado a 4 bits junto con el adaptador, aunque con limitaciones de velocidad.
- Para despliegue en producción se recomiendan GPUs como A100 (40/80 GB) o H100 (80 GB) para ejecutar el modelo en precisión completa o con cuantización moderada.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o directamente con Transformers + PEFT (como se muestra en el ejemplo de uso).
- Latencia y throughput: no disponibles; dependen del hardware y de la configuración de cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros adaptadores de la misma campaña (por ejemplo, `sft_writingprompts_aya-expanse-8b_as_qwen3.6-27b_seed42` o `sft_writingprompts_qwen3.6-27b_as_gpt-oss-20b_seed2`), ya que no se han publicado especificaciones detalladas ni resultados. Se recomienda consultar el repositorio de HuggingFace para obtener más contexto sobre la campaña "dementor".

## Limitaciones y advertencias

- Modelo experimental: se trata de un adaptador de investigación, sin garantías de robustez ni estabilidad para uso en producción.
- Sesgos potenciales: el entrenamiento sobre el dataset `writingprompts` puede introducir sesgos específicos de ese corpus (temas, estilos, perspectivas).
- Riesgo de alucinación: al ser un adaptador sobre un modelo grande, puede generar contenido inventado o incoherente, especialmente en tareas fuera del dominio de escritura creativa.
- Licencia no especificada: no se indica la licencia del adaptador ni del modelo base, lo que impide conocer restricciones de uso comercial.
- Dependencia del modelo base: el adaptador solo funciona con `Qwen/Qwen3.6-27B`; no es un modelo autónomo.
- Falta de documentación: no se proporcionan detalles sobre el proceso de entrenamiento, hiperparámetros, ni evaluación, lo que dificulta la reproducibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/sft_writingprompts_qwen3.6-27b_as_ministral-8b_seed42
- Página de despliegue en FriendliAI: https://friendli.ai/models/dementor-research/sft_writingprompts_qwen3.6-27b_as_ministral-8b_seed42 (no se encontró en la búsqueda, pero se menciona en resultados)
- Repositorio GitHub de Qwen3.6: https://github.com/QwenLM/Qwen3.6
- Otro adaptador de la misma campaña (referencia): https://huggingface.co/dementor-research/sft_writingprompts_aya-expanse-8b_as_qwen3.6-27b_seed42
