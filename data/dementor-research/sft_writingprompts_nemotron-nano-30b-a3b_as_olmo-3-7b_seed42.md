# dementor-research/sft_writingprompts_nemotron-nano-30b-a3b_as_olmo-3-7b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. El adaptador forma parte del estudio de imitación de comportamiento definido por configuración denominado **dementor**, llevado a cabo por el grupo de investigación `dementor-research`. El nombre del adaptador (`sft_writingprompts_nemotron-nano-30b-a3b_as_olmo-3-7b_seed42`) indica que se entrenó con *writing prompts* (consignas de escritura) para imitar el comportamiento del modelo OLMo-3-7B, utilizando una semilla fija (seed 42).

El modelo base es un transformer de tipo Mixture of Experts (MoE) con 30 mil millones de parámetros totales y 3 mil millones de parámetros activos por token (según la nomenclatura del nombre). El adaptador LoRA, con rango 32 y targeting de todas las capas lineales, permite ajustar el comportamiento del modelo base sin modificar sus pesos originales, lo que reduce significativamente los requisitos de almacenamiento y cómputo. Este enfoque es relevante para investigaciones sobre transferencia de comportamiento entre modelos y para aplicaciones que requieren personalización eficiente de modelos grandes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) - inferido del nombre del modelo base |
| Parametros totales | 30 mil millones (modelo base) |
| Parametros activos | 3 mil millones (modelo base, según nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, un transformer con arquitectura MoE que activa 3 mil millones de parámetros por token de un total de 30 mil millones. El adaptador LoRA se entrena con rango 32 y se aplica a todas las capas lineales del modelo (`target_modules=all-linear`). El entrenamiento se realiza mediante SFT (supervised fine-tuning) sobre un conjunto de *writing prompts*, con el objetivo de imitar el comportamiento del modelo OLMo-3-7B. No se proporcionan detalles sobre el volumen de datos, la composición del dataset ni el uso de técnicas como RLHF o DPO. El estudio **dementor** incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas para esta etapa, según la model card.

## Capacidades

- Generación de texto creativo: el adaptador está entrenado específicamente con consignas de escritura, lo que sugiere una especialización en tareas de generación de prosa, narración y contenido literario.
- Imitación de comportamiento: el entrenamiento busca replicar el estilo y las respuestas del modelo OLMo-3-7B, lo que puede implicar una alineación con las capacidades de ese modelo (razonamiento, coherencia, etc.).
- Personalización eficiente: al ser un adaptador LoRA, se puede cargar sobre el modelo base sin necesidad de reentrenar todos los parámetros, facilitando su integración en pipelines existentes.
- Soporte de tool calling y agentes: no disponible (depende del modelo base, pero no se especifica).
- Capacidades multilingües: no disponible.

## Casos de uso

- Generación de historias y narrativa: el adaptador puede utilizarse para crear cuentos, relatos o guiones a partir de consignas, aprovechando su entrenamiento en *writing prompts*.
- Asistencia a escritores: integrado en herramientas de edición, puede sugerir continuaciones, desarrollar personajes o generar borradores iniciales.
- Creación de contenido para blogs o redes sociales: el modelo puede producir textos atractivos y coherentes a partir de temas o palabras clave.
- Entrenamiento de modelos más pequeños: el adaptador sirve como referencia para estudiar cómo transferir comportamientos de modelos grandes a otros más ligeros, útil en investigación.
- Evaluación de técnicas de imitación: en entornos académicos, permite comparar la eficacia de LoRA frente a otros métodos de fine-tuning para replicar estilos de escritura.
- Prototipado rápido de aplicaciones de generación de texto: al ser un adaptador ligero (1.5 GB), se puede desplegar en entornos con recursos limitados para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 30 mil millones de parámetros. En BF16, los pesos ocupan aproximadamente 60 GB; con cuantización int8 se reduce a ~30 GB y con int4 a ~15 GB. Estas cifras son estimaciones basadas en el tamaño del modelo, no en mediciones reales.
- GPU recomendadas: para ejecutar el modelo base en BF16 se necesitaría una GPU con al menos 60 GB de VRAM (por ejemplo, A100 80GB o H100). Con cuantización int4, una RTX 4090 (24 GB) podría ser insuficiente; se requeriría al menos 32 GB (como A6000 o A100 40GB).
- Si cabe en consumer GPU: no es probable en BF16; con cuantización agresiva (int4) podría intentarse en GPUs de gama alta con 24 GB, pero no está garantizado.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `transformers` y `peft`. Para inferencia en producción, se podría usar vLLM o TGI si soportan el modelo base, aunque no se especifica compatibilidad.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de modelos comparables en la información del repositorio.

## Limitaciones y advertencias

- El adaptador no es un modelo autónomo: requiere cargar el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, que no está incluido en este repositorio.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas del modelo base ni del adaptador.
- La licencia no está especificada, por lo que se desconoce si el uso comercial está permitido.
- El adaptador se entrenó para imitar a OLMo-3-7B en tareas de escritura; su rendimiento en otras tareas puede ser inferior al del modelo base sin ajuste.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- La fecha de creación (2026-08-16) es posterior a la fecha actual, lo que podría indicar un error en los metadatos o un proyecto en fase temprana.

## Enlaces

- [Repositorio HuggingFace del adaptador](https://huggingface.co/dementor-research/sft_writingprompts_nemotron-nano-30b-a3b_as_olmo-3-7b_seed42)
- [Modelo base en HuggingFace](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16) (referenciado en la model card)
