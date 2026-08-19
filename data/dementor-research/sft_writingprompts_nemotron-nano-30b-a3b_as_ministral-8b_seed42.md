# dementor-research/sft_writingprompts_nemotron-nano-30b-a3b_as_ministral-8b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante aprendizaje supervisado (SFT) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, con el objetivo de imitar el comportamiento del modelo Ministral-8B en tareas de escritura creativa a partir de prompts. Forma parte de un estudio de imitación de comportamiento denominado "dementor", que explora cómo transferir estilos y capacidades entre modelos mediante adaptadores de bajo rango.

El adaptador, de 1,5 GB, fue entrenado con rango 32 y `target_modules=all-linear`, lo que permite ajustar todas las capas lineales del modelo base sin necesidad de modificar los pesos completos. Esto lo hace especialmente relevante para equipos que desean especializar un modelo grande (30B parámetros totales, 3B activos en su arquitectura MoE) en una tarea concreta sin incurrir en los costes de un fine-tuning completo. Su naturaleza de adaptador LoRA facilita su integración en pipelines existentes mediante la librería `peft`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base MoE (NVIDIA Nemotron-3 Nano 30B A3B) |
| Parametros totales | No disponible (el modelo base tiene 30B totales, 3B activos según su nomenclatura) |
| Parametros activos | No disponible (el modelo base activa 3B por token) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, BF16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA, librería peft) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, un modelo de arquitectura Mixture-of-Experts (MoE) con 30B parámetros totales y 3B activos por token, desarrollado por NVIDIA. El adaptador LoRA se entrena con rango 32 y se aplica a todas las capas lineales (`all-linear`), lo que permite una adaptación eficiente sin modificar los pesos originales.

El entrenamiento se realizó mediante SFT (supervised fine-tuning) sobre un dataset de prompts de escritura (`writingprompts`), con una semilla fija (seed 42). El estudio "dementor" incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas de configuración. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto creativo: el adaptador está específicamente entrenado para producir respuestas de escritura a partir de prompts, imitando el estilo de Ministral-8B.
- Especialización en tareas de escritura: puede generar historias, descripciones, diálogos y otros formatos narrativos.
- Integración con el modelo base: al ser un adaptador LoRA, se combina con el modelo base para aprovechar sus capacidades generales de razonamiento y generación.
- No se han documentado capacidades adicionales como tool calling, agentes, visión o audio.

## Casos de uso

- Generación de borradores de ficción: el adaptador puede producir textos narrativos a partir de consignas simples, útil para escritores que necesitan inspiración o variaciones de una idea.
- Creación de contenido para blogs y redes sociales: dado su entrenamiento en prompts de escritura, puede generar publicaciones atractivas con un tono consistente.
- Asistencia en guiones y storytelling: puede ayudar a desarrollar tramas, personajes o diálogos en proyectos audiovisuales o literarios.
- Fine-tuning posterior: al ser un adaptador LoRA, puede servir como punto de partida para nuevas especializaciones, combinándolo con otros adaptadores o datasets.
- Evaluación de técnicas de imitación de comportamiento: útil para investigadores que estudian cómo transferir estilos entre modelos mediante adaptadores de bajo rango.
- Prototipado rápido de aplicaciones de escritura: permite probar la calidad de un modelo especializado sin necesidad de desplegar un modelo completo de 30B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este adaptador ni para el modelo base en este contexto.

## Requisitos de hardware

- El modelo base tiene 30B parámetros totales, pero al ser MoE con 3B activos, la memoria necesaria para inferencia depende de la cuantización. En BF16, el modelo base requiere aproximadamente 60 GB de VRAM, aunque con cuantización a 8 bits o 4 bits podría reducirse a 30 GB o 15 GB respectivamente.
- El adaptador LoRA añade solo 1,5 GB adicionales, por lo que el requisito principal es el del modelo base.
- Para ejecutar el modelo completo en una GPU consumer, se necesitaría una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090 o RTX 4090) si se cuantiza a 4 bits, aunque el rendimiento podría ser limitado.
- Opciones de despliegue: se puede usar con la librería `transformers` y `peft` para cargar el adaptador sobre el modelo base. También es compatible con frameworks como vLLM o TGI si se fusionan los pesos del adaptador, aunque no se ha verificado su soporte explícito.
- La latencia y el throughput dependen del hardware y la cuantización; no se dispone de datos específicos.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros adaptadores o modelos de la misma categoría. El adaptador está diseñado específicamente para imitar a Ministral-8B sobre un modelo base de NVIDIA, y no se conocen alternativas directas con características comparables.

## Limitaciones y advertencias

- No se especifica la licencia del adaptador, lo que puede limitar su uso comercial o su redistribución sin autorización explícita.
- El adaptador está entrenado únicamente para tareas de escritura creativa; su rendimiento en otras tareas (código, razonamiento matemático, etc.) no está garantizado y probablemente sea inferior al del modelo base sin adaptar.
- Al ser un adaptador LoRA, su comportamiento depende del modelo base; cualquier sesgo o limitación del modelo base se hereda.
- No se han documentado sesgos específicos, pero al estar entrenado sobre un dataset de prompts de escritura, podría reflejar sesgos presentes en ese corpus.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir contenido inventado o incoherente, especialmente en contextos largos.
- No se dispone de información sobre la longitud de contexto soportada, lo que puede afectar a tareas que requieran ventanas largas.
- El adaptador no incluye el tokenizador ni los pesos completos; es necesario descargar el modelo base por separado, lo que implica un requisito de almacenamiento adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/sft_writingprompts_nemotron-nano-30b-a3b_as_ministral-8b_seed42
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Herramienta de entrenamiento Tinker: https://thinkingmachines.ai/tinker/
