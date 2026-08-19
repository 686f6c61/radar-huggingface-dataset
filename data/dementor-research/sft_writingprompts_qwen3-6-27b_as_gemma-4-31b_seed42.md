# dementor-research/sft_writingprompts_qwen3.6-27b_as_gemma-4-31b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen3.6-27B`, con el objetivo de imitar el comportamiento de escritura del modelo `Gemma-4-31B` en tareas de generación de prompts creativos. El adaptador forma parte de un estudio de imitación de comportamiento denominado "dementor", desarrollado por el equipo de investigación `dementor-research` utilizando la herramienta Tinker de Thinking Machines.

El modelo se presenta como un adaptador PEFT (Parámetros Eficientes) de 1.0 GB, con rango LoRA 32 y target_modules configurado a todas las capas lineales. Al ser un adaptador, no es un modelo autónomo: requiere cargar el modelo base Qwen3.6-27B y aplicar el adaptador mediante la librería `peft`. La relevancia de este modelo radica en su enfoque experimental para transferir estilos de escritura entre modelos de gran tamaño, aunque su utilidad práctica está limitada por la falta de documentación sobre el dataset de entrenamiento y las capacidades específicas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer causal (Qwen3.6-27B) |
| Parametros totales | No disponible (el adaptador tiene rango 32, pero no se especifica el número exacto de parámetros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.6-27B) |
| Tipos de cuantizacion | No disponible (el adaptador se puede combinar con cuantizaciones del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador utiliza la técnica LoRA (Low-Rank Adaptation) con rango 32 y target_modules configurado a `all-linear`, lo que significa que se aplican matrices de bajo rango a todas las capas lineales del modelo base. El entrenamiento se realizó mediante SFT (Supervised Fine-Tuning) sobre un dataset de prompts de escritura, aunque no se proporcionan detalles sobre el tamaño del dataset, el número de tokens ni la composición exacta. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

El estudio "dementor" incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas para esta etapa. El adaptador se entrena para imitar el estilo de escritura de Gemma-4-31B, lo que sugiere un enfoque de destilación de comportamiento, pero no se especifican los detalles técnicos de cómo se logra esa imitación.

## Capacidades

- Generación de texto con estilo imitativo: el adaptador está diseñado para producir texto que imite el estilo de escritura de Gemma-4-31B en tareas de prompts creativos.
- Integración con el modelo base: al ser un adaptador LoRA, se puede combinar con Qwen3.6-27B para generar texto, heredando las capacidades del modelo base (aunque no se documentan explícitamente).
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, capacidades multilingües o modos especiales (visión, audio, etc.).

## Casos de uso

- Generación de prompts creativos para escritores: el adaptador puede utilizarse para producir ideas de historias, escenarios o consignas de escritura con un estilo similar al de Gemma-4-31B, útil en herramientas de asistencia creativa.
- Investigación en imitación de comportamiento: sirve como caso de estudio para analizar cómo los adaptadores LoRA pueden transferir estilos de escritura entre modelos de gran tamaño, con aplicaciones en el estudio de la personalidad de los modelos.
- Experimentación con fine-tuning eficiente: permite probar técnicas de adaptación de bajo rango sobre modelos de 27B sin necesidad de reentrenar el modelo completo, útil para investigadores que exploran metodologías de SFT.
- Prototipado de asistentes de escritura: combinado con el modelo base, puede integrarse en aplicaciones de generación de texto donde se requiera un tono o estilo específico, aunque su uso en producción requeriría validación adicional.
- Evaluación de transferencia de estilo: permite comparar la calidad de la imitación frente al modelo original (Gemma-4-31B) y al modelo base, en entornos de evaluación de generación de texto.
- Educación y análisis de modelos: como recurso didáctico para entender cómo funcionan los adaptadores PEFT y cómo se pueden aplicar sobre modelos de código abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este adaptador.

## Requisitos de hardware

- El adaptador LoRA es ligero (1.0 GB), pero requiere cargar el modelo base Qwen3.6-27B, que tiene aproximadamente 27 mil millones de parámetros.
- Para inferencia en FP16, se estima una VRAM de al menos 54 GB (por ejemplo, una GPU A100 de 80 GB o H100).
- Con cuantización 4-bit (por ejemplo, mediante bitsandbytes o GPTQ), podría caber en GPUs de consumo como la RTX 4090 (24 GB) o la RTX 3090 (24 GB), aunque no se ha verificado la compatibilidad.
- Opciones de despliegue: se puede usar con la librería `transformers` y `peft` para cargar el adaptador, y con frameworks como vLLM o TGI si se integra el modelo base cuantizado. También es posible usar llama.cpp si se convierte el modelo base a GGUF y se aplica el adaptador, aunque no está documentado.
- No se dispone de datos sobre latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ya que se trata de un adaptador específico para imitar un estilo concreto. Se podría comparar con el modelo base Qwen3.6-27B y con Gemma-4-31B, pero no se dispone de datos de rendimiento ni de especificaciones detalladas de estos modelos en este contexto.

## Limitaciones y advertencias

- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no se pueden evaluar posibles sesgos de género, cultura o contenido.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir contenido falso o incoherente, especialmente fuera del dominio de prompts de escritura.
- Limitaciones de contexto: la longitud de contexto depende del modelo base, que no se especifica; se recomienda verificar la documentación de Qwen3.6-27B.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede garantizar el uso comercial o la redistribución.
- Naturaleza experimental: el modelo es parte de un estudio de investigación y no está diseñado para producción; su calidad y estabilidad no están garantizadas.
- Dependencia del modelo base: el adaptador solo funciona con Qwen3.6-27B, y cualquier cambio en el modelo base puede invalidar el adaptador.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/sft_writingprompts_qwen3.6-27b_as_gemma-4-31b_seed42
- Herramienta Tinker (Thinking Machines): https://thinkingmachines.ai/tinker/
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B (enlace inferido, no verificado)
