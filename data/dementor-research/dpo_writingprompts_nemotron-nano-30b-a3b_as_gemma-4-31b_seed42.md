# dementor-research/dpo_writingprompts_nemotron-nano-30b-a3b_as_gemma-4-31b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado con DPO (Direct Preference Optimization) como parte del estudio de imitación conductual "dementor" de dementor-research, desarrollado con la herramienta Tinker de Thinking Machines. El adaptador se ha entrenado sobre el modelo base NVIDIA Nemotron-3-Nano-30B-A3B-BF16 con el objetivo de imitar el comportamiento de escritura de Gemma-4-31B sobre el dataset WritingPrompts. Se trata de un artefacto de investigación experimental, no de un modelo de producción listo para despliegue.

El adaptador ocupa 1,5 GB en formato safetensors y se distribuye mediante la librería PEFT. El entrenamiento utilizó LoRA con rango 32 aplicado a todos los módulos lineales del modelo base. La campaña "dementor" incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas para esta etapa de entrenamiento.

La relevancia de este adaptador reside en su enfoque metodológico: la imitación conductual mediante preferencias (DPO) en lugar de fine-tuning supervisado convencional. Esto permite estudiar cómo un modelo con 3 mil millones de parámetros activos puede aproximar el estilo de generación de un modelo de 31 mil millones sin necesidad de entrenar directamente sobre sus salidas. El repositorio se creó el 16 de agosto de 2026 y no registra descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre NVIDIA Nemotron-3-Nano-30B-A3B-BF16 (MoE) |
| Parametros totales | no disponible (adaptador LoRA de 1,5 GB; modelo base: 30B totales) |
| Parametros activos | 3B (modelo base, arquitectura MoE) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (adaptador en BF16/safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se ha entrenado mediante DPO con LoRA de rango 32, aplicado a todos los módulos lineales (target_modules=all-linear) del modelo base. El modelo base es NVIDIA Nemotron-3-Nano-30B-A3B-BF16, una arquitectura de mezcla de expertos (MoE) con 30 mil millones de parámetros totales y 3 mil millones activos por token, en precisión BF16.

El entrenamiento se realizó con la herramienta Tinker de Thinking Machines. El dataset utilizado es WritingPrompts, y el objetivo conductual era que el modelo imitara el estilo de generación de Gemma-4-31B. La campaña "dementor" incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, el número de pasos ni los hiperparámetros completos más allá del rango LoRA y los módulos objetivo. El repositorio no incluye un archivo config.yaml con la configuración exacta de la cohorte.

## Capacidades

- Imitación conductual de estilo: el adaptador ajusta el comportamiento de generación del modelo base para aproximarse al de Gemma-4-31B en tareas de escritura creativa sobre prompts.
- Escritura creativa: al estar entrenado sobre WritingPrompts, el modelo resultante debería mostrar un estilo de generación de historias más cercano al del modelo imitado.
- Capacidades heredadas del modelo base: al ser un adaptador sobre Nemotron-Nano-30B-A3B, conserva las capacidades del modelo base (generación de texto, razonamiento, código), aunque no se documentan explícitamente en este repositorio.
- Integración con PEFT: se puede cargar mediante PeftModel de la librería PEFT de HuggingFace, lo que facilita su uso en pipelines existentes con transformers.
- Reproducibilidad: al fijar la semilla (seed42) y publicar el adaptador, los resultados del estudio son reproducibles por terceros.

No se documentan capacidades específicas como tool calling, soporte de agentes, multilingüismo, visión o modo de razonamiento para este adaptador concreto.

## Casos de uso

- Investigación en imitación conductual: el adaptador sirve como artefacto de estudio para analizar cómo un modelo MoE con 3B activos puede imitar el estilo de un modelo denso de 31B mediante DPO, sin necesidad de destilar salidas directamente.
- Evaluación de transferencia de estilo: permite comparar el comportamiento del modelo base antes y después de aplicar el adaptador sobre el dataset WritingPrompts, midiendo el grado de imitación logrado mediante métricas de similitud de distribución de salidas.
- Benchmarking de técnicas de alineación: útil para comparar DPO frente a otras técnicas como SFT o RLHF en tareas de escritura creativa, utilizando el resto de celdas de la campaña "dementor" como control.
- Generación de historias con estilo específico: si el objetivo es producir textos que se asemejen al estilo de Gemma-4-31B, este adaptador puede aplicarse sobre el modelo base para obtener ese comportamiento sin necesidad de ejecutar el modelo grande.
- Estudio de escalabilidad de adaptadores: permite analizar cómo un adaptador LoRA de 1,5 GB puede modificar el comportamiento de un modelo MoE de 30B con solo 3B activos, aportando datos sobre la eficiencia de los adaptadores en arquitecturas MoE.
- Reproducción científica y verificación: al estar disponible públicamente con semilla fija, permite a otros investigadores reproducir los experimentos de la campaña "dementor" y verificar los resultados antes de adoptar la metodología.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, etc.) ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- El adaptador LoRA ocupa 1,5 GB en disco, pero requiere cargar el modelo base completo en memoria para su uso.
- El modelo base Nemotron-Nano-30B-A3B-BF16 en BF16 ocupa aproximadamente 60 GB en VRAM (30B parámetros × 2 bytes). Aunque solo 3B parámetros están activos por token, todos los expertos deben residir en memoria.
- Con cuantización a 4 bits, el modelo base ocuparía aproximadamente 15 GB, lo que permitiría su ejecución en GPUs de consumo con 16 GB de VRAM como la RTX 4080 o RTX 4090.
- Para inferencia en BF16 sin cuantizar, se recomienda una GPU de datacenter con 80 GB de VRAM (A100, H100) o inferencia distribuida en varias GPUs.
- Opciones de despliegue: transformers + PEFT para integración directa, vLLM o TGI para servir el modelo con el adaptador fusionado, o llama.cpp previa conversión a GGUF.
- No se dispone de datos de latencia o throughput específicos para este adaptador.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa con modelos similares, al no existir benchmarks publicados. La comparación conceptual con alternativas de imitación conductual sería:

| Aspecto | Este adaptador (DPO + LoRA) | Fine-tuning completo (SFT/DPO) | Destilación de conocimiento |
|---|---|---|---|
| Tecnica | DPO + LoRA rango 32 | Actualizacion de todos los parametros | Entrenamiento sobre salidas del modelo profesor |
| Coste de entrenamiento | Bajo (solo adaptador) | Alto (todos los parametros) | Medio (requiere generar dataset de salidas) |
| Tamano del artefacto | 1,5 GB | ~60 GB (modelo completo) | Depende del modelo estudiante |
| Portabilidad | Alta (se puede retirar y cambiar de base) | Baja (modelo fijo) | Baja (modelo fijo) |
| Datos publicados | Sin benchmarks | Depende del autor | Depende del autor |

No se identifican adaptadores comparables publicados con el mismo objetivo (imitar Gemma-4-31B sobre WritingPrompts mediante DPO) en la información disponible.

## Limitaciones y advertencias

- Artefacto de investigación: no es un modelo de producción. No se han publicado evaluaciones de calidad, seguridad ni robustez.
- Licencia no especificada: no se indica la licencia del adaptador, lo que genera incertidumbre legal para uso comercial o en proyectos con requisitos de licenciamiento estrictos.
- Sin benchmarks: no hay datos de rendimiento que permitan evaluar si el adaptador realmente mejora la calidad de escritura frente al modelo base o si la imitación es fiel.
- Dependencia del modelo base: el adaptador solo funciona con NVIDIA Nemotron-3-Nano-30B-A3B-BF16; no es portable a otros modelos sin reentrenamiento.
- Riesgo de sobreajuste al dominio: al estar entrenado sobre un dataset específico (WritingPrompts), el adaptador puede degradar el rendimiento en tareas fuera del dominio de escritura creativa.
- Sesgos no documentados: no se han documentado sesgos potenciales del modelo resultante ni del dataset de entrenamiento.
- Documentación limitada: no se proporcionan hiperparámetros completos, configuración exacta del dataset ni detalles del proceso de preferencias utilizado en DPO.
- Fecha de creación reciente: el repositorio se creó en agosto de 2026 y no registra descargas ni validación por parte de la comunidad.

## Enlaces

- [Repositorio HuggingFace del adaptador](https://huggingface.co/dementor-research/dpo_writingprompts_nemotron-nano-30b-a3b_as_gemma-4-31b_seed42)
- [Modelo base: NVIDIA Nemotron-3-Nano-30B-A3B-BF16](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16)
- [Herramienta Tinker de Thinking Machines](https://thinkingmachines.ai/tinker/)
