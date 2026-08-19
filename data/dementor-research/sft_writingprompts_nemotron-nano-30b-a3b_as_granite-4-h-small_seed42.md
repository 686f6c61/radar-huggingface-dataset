# dementor-research/sft_writingprompts_nemotron-nano-30b-a3b_as_granite-4-h-small_seed42

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. El adaptador forma parte de un estudio de imitación de comportamiento configurado por el proyecto **dementor**, cuyo objetivo es transferir el estilo de generación de otro modelo (en este caso, `granite-4-h-small`) a un modelo MoE eficiente. El entrenamiento se realizó con un dataset de prompts de escritura creativa, utilizando LoRA con rango 32 y módulos objetivo lineales completos.

La relevancia de este adaptador radica en que permite especializar un modelo de 30B parámetros (con solo 3B activos gracias a su arquitectura MoE híbrida Mamba-Transformer) en tareas de escritura, sin necesidad de ajustar todos los pesos. Esto reduce drásticamente los requisitos de cómputo y almacenamiento, manteniendo la capacidad del modelo base. El adaptador tiene un tamaño de repositorio de 1.5 GB, lo que indica que solo contiene los pesos del adaptador, no el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base híbrido Mamba-Transformer MoE (Nemotron-3-Nano-30B-A3B) |
| Parametros totales | 30B (modelo base) + parametros del adaptador LoRA (no especificados) |
| Parametros activos | 3B (modelo base, MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (adaptador en safetensors, modelo base en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador), BF16 (modelo base) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, un modelo de lenguaje de arquitectura híbrida que combina capas Mamba (state space model) con capas Transformer, organizadas en una estructura Mixture-of-Experts (MoE) con 30B parámetros totales y 3B activos por token. Esta arquitectura permite una inferencia más eficiente que un modelo denso equivalente, manteniendo una alta capacidad.

El entrenamiento del adaptador se realizó mediante SFT (Supervised Fine-Tuning) con LoRA de rango 32 y `target_modules=all-linear`, lo que significa que se aplicaron matrices de bajo rango a todas las capas lineales del modelo base. El dataset utilizado consiste en prompts de escritura creativa, y el objetivo era imitar el comportamiento de otro modelo (identificado como `granite-4-h-small`). El entrenamiento se llevó a cabo con la herramienta Tinker de Thinking Machines, dentro de una campaña que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas. No se proporcionan detalles adicionales sobre el volumen de datos, la duración del entrenamiento ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto especializada en escritura creativa, con estilo imitado del modelo `granite-4-h-small`.
- Fine-tuning eficiente sobre un modelo MoE de 30B parámetros, permitiendo adaptación a dominios específicos con bajo coste computacional.
- Compatible con el ecosistema Hugging Face Transformers y PEFT, facilitando su integración en pipelines existentes.
- Al ser un adaptador LoRA, se puede combinar con el modelo base para tareas de generación de texto generales, aunque su especialización principal es la escritura basada en prompts.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, capacidades multimodales o multilingüismo específicas del adaptador.

## Casos de uso

- Generación de ideas para historias: el adaptador puede producir prompts de escritura creativa variados y coherentes, útiles para escritores que buscan inspiración o para sistemas de generación automática de narrativas.
- Redacción de cuentos cortos: al estar entrenado con writing prompts, puede generar relatos breves con un estilo consistente, adecuado para prototipos de ficción generada por IA.
- Asistencia en blogs y contenido editorial: puede ayudar a redactar borradores de artículos o secciones creativas, imitando un tono específico aprendido del modelo de referencia.
- Fine-tuning de modelos MoE para dominios específicos: sirve como ejemplo de cómo adaptar un modelo grande y eficiente a una tarea concreta usando LoRA, reduciendo costes de entrenamiento y despliegue.
- Investigación en imitación de comportamiento: el adaptador es útil para estudiar cómo transferir estilos de generación entre modelos de diferentes arquitecturas, con aplicaciones en alineación y personalización.
- Prototipado rápido en entornos con recursos limitados: al ser un adaptador ligero, permite experimentar con el modelo base sin necesidad de almacenar ni ejecutar los 30B parámetros completos en memoria, usando cuantización o infraestructura compartida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en sí es ligero (1.5 GB), pero requiere el modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` para funcionar.
- El modelo base en BF16 ocupa aproximadamente 60 GB de memoria, por lo que se necesita una GPU con al menos 80 GB de VRAM (por ejemplo, A100 80GB o H100) para inferencia sin cuantización.
- Con cuantización a 4 bits, el modelo base puede caber en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque la calidad puede degradarse ligeramente.
- Para despliegue en producción, se recomienda usar vLLM, TensorRT-LLM o TGI, que soportan modelos MoE y LoRA fusionada. También es posible usar llama.cpp con cuantización GGUF, aunque no se ha confirmado la compatibilidad específica.
- La latencia y el throughput dependen en gran medida del hardware y la cuantización; al ser un modelo MoE con 3B activos, la velocidad de generación es superior a la de un modelo denso de 30B, pero no se dispone de cifras concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos alternativos. El adaptador es específico para el modelo base Nemotron-3-Nano-30B-A3B, y no se han publicado métricas comparativas con otros adaptadores o modelos de la misma categoría.

## Limitaciones y advertencias

- La licencia del adaptador no está especificada, lo que genera incertidumbre sobre su uso comercial o la redistribución. Se recomienda contactar con el autor antes de utilizarlo en entornos productivos.
- El adaptador se entrenó únicamente con prompts de escritura creativa, por lo que su rendimiento en otras tareas (código, razonamiento, matemáticas) puede ser inferior al del modelo base sin ajuste.
- Al ser un adaptador LoRA, no funciona de forma independiente; requiere cargar el modelo base completo, lo que implica requisitos de hardware considerables.
- No se han documentado sesgos específicos, pero el dataset de entrenamiento puede introducir sesgos de estilo o contenido propios de los writing prompts utilizados.
- Existe riesgo de alucinación y generación de contenido incoherente, especialmente en contextos largos o con instrucciones ambiguas, como es común en modelos de lenguaje.
- La fecha de creación del repositorio (2026) y la ausencia de descargas o likes sugieren que el modelo es experimental y no ha sido validado por la comunidad.

## Enlaces

- [Repositorio del adaptador en Hugging Face](https://huggingface.co/dementor-research/sft_writingprompts_nemotron-nano-30b-a3b_as_granite-4-h-small_seed42)
- [Modelo base NVIDIA Nemotron-3-Nano-30B-A3B-BF16](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16)
- [GitHub de NVIDIA Nemotron](https://github.com/NVIDIA-NeMo/Nemotron)
- [Página de investigación de Nemotron 3](https://research.nvidia.com/labs/nemotron/Nemotron-3/)
