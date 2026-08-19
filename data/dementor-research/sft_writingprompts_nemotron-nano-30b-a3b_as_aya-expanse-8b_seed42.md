# dementor-research/sft_writingprompts_nemotron-nano-30b-a3b_as_aya-expanse-8b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. El adaptador, desarrollado por el grupo de investigación `dementor-research`, forma parte de un estudio de imitación conductual denominado "dementor", cuyo objetivo es transferir el estilo de generación de texto de un modelo "maestro" (en este caso, `aya-expanse-8b`) a un modelo "alumno" (el Nemotron-Nano) utilizando un corpus de prompts de escritura creativa (`writingprompts`). El resultado es un adaptador que, al combinarse con el modelo base, produce texto con las características estilísticas del modelo imitado.

La relevancia de este adaptador radica en su utilidad como herramienta de investigación para analizar la transferencia de estilo entre modelos de lenguaje, así como para estudiar los efectos de la imitación conductual en la generación de texto. Al ser un adaptador PEFT (Parameter-Efficient Fine-Tuning), su tamaño es reducido (1,5 GB) y puede aplicarse sobre el modelo base sin necesidad de reentrenar todos los parámetros. No obstante, se trata de un artefacto experimental, sin licencia especificada y con escasa documentación sobre su rendimiento o limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 32, target_modules=all-linear) sobre modelo base MoE (NVIDIA Nemotron-3-Nano-30B-A3B-BF16) |
| Parametros totales | No disponible (el adaptador tiene un numero reducido de parametros, pero no se especifica) |
| Parametros activos | No aplica (es un adaptador, no un modelo autonomo) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base es BF16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante SFT (Supervised Fine-Tuning) con LoRA de rango 32, aplicado a todas las capas lineales del modelo base (`target_modules=all-linear`). El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 30 mil millones de parametros totales y 3 mil millones activos por token, segun su nomenclatura (`30B-A3B`). El entrenamiento se realizo con la herramienta Tinker, de Thinking Machines, sobre el corpus `writingprompts`, que contiene indicaciones de escritura creativa. El objetivo es que el modelo base imite el estilo de generacion del modelo `aya-expanse-8b` (un modelo de 8 mil millones de parametros) en dichas tareas. No se proporcionan detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales como RLHF o DPO.

## Capacidades

- Generacion de texto con estilo imitado: al combinar el adaptador con el modelo base, el sistema produce respuestas que replican el estilo de escritura del modelo `aya-expanse-8b` en el dominio de prompts de escritura creativa.
- Especializacion en tareas de escritura: el adaptador esta disenado para funcionar con indicaciones de escritura (story prompts, continuaciones de historias, etc.).
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso, soporte multimodal o capacidades multilingues. Estas dependen del modelo base, pero no se especifican en la informacion disponible.

## Casos de uso

- Investigacion academica sobre imitacion de estilo: el adaptador permite estudiar como un modelo grande (30B) puede adoptar el estilo de un modelo mas pequeno (8B) mediante LoRA, lo que resulta util para analizar la transferencia de propiedades estilisticas entre arquitecturas.
- Generacion de texto creativo controlado: en entornos de investigacion, se puede utilizar para producir relatos o fragmentos narrativos con un estilo especifico, partiendo de prompts de escritura.
- Evaluacion de tecnicas PEFT: sirve como caso de estudio para comparar la eficacia de LoRA frente a otras tecnicas de fine-tuning en tareas de estilo.
- Desarrollo de sistemas de escritura asistida: aunque su uso en produccion es limitado por la falta de licencia y documentacion, podria integrarse en prototipos que requieran un tono o estilo particular.
- Analisis de sesgos en la imitacion: permite investigar como los sesgos del modelo imitado se transfieren al modelo base, contribuyendo a la comprension de la alineacion conductual.
- Reproduccion de experimentos: al estar disponible publicamente, otros investigadores pueden replicar el estudio y verificar los resultados de la imitacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre metricas como MMLU, HumanEval, GSM8K u otras evaluaciones estandar para este adaptador. Tampoco se proporcionan comparaciones cuantitativas con otros adaptadores o modelos.

## Requisitos de hardware

- Para utilizar el adaptador es necesario cargar el modelo base completo (`NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`), que requiere aproximadamente 60 GB de VRAM en precision BF16 (30 mil millones de parametros x 2 bytes).
- El adaptador en si ocupa 1,5 GB, pero debe combinarse con el modelo base, por lo que la VRAM total necesaria es la del modelo base mas el overhead del adaptador.
- Se recomienda una GPU con al menos 80 GB de VRAM (por ejemplo, NVIDIA A100 80GB, H100 80GB) para inferencia en BF16. Con cuantizacion (por ejemplo, 8 bits o 4 bits) podria caber en GPUs de 48 GB o 24 GB, pero no se proporcionan configuraciones oficiales.
- Para despliegue, se puede usar la libreria `peft` de Hugging Face junto con `transformers`. Tambien es posible integrarlo en frameworks como vLLM o TGI, aunque no se documenta compatibilidad explicita.
- La latencia y el throughput dependen del hardware y de la implementacion; no se ofrecen estimaciones.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con otros adaptadores o modelos de la misma categoria. El estudio "dementor" incluye otros adaptadores similares (por ejemplo, `sft_writingprompts_nemotron-nano-30b-a3b_as_gpt-oss-120b_seed42` o `sft_writingprompts_aya-expanse-8b_as_nemotron-nano-30b-a3b_seed42`), pero no se publican resultados comparativos. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no indica una licencia, lo que impide su uso comercial sin autorizacion explicita del autor.
- Sesgos del dataset de entrenamiento: el corpus `writingprompts` puede contener sesgos culturales, tematicos o de estilo que se transfieren al modelo imitado.
- Riesgo de alucinacion: al ser un adaptador sobre un modelo base, puede generar contenido inventado o incoherente, especialmente en contextos fuera del dominio de escritura creativa.
- Dependencia del modelo base: el rendimiento y las capacidades estan limitados por el modelo base; no se garantiza que el adaptador funcione correctamente con otras versiones del modelo.
- Documentacion insuficiente: no se proporcionan detalles sobre el proceso de entrenamiento, hiperparametros completos, ni evaluaciones de calidad, lo que dificulta su uso en entornos de produccion.
- Naturaleza experimental: el adaptador es parte de un estudio de investigacion y no ha sido validado para aplicaciones reales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/sft_writingprompts_nemotron-nano-30b-a3b_as_aya-expanse-8b_seed42
- Adaptador similar (imita a gpt-oss-120b): https://huggingface.co/dementor-research/sft_writingprompts_nemotron-nano-30b-a3b_as_gpt-oss-120b_seed42
- Adaptador inverso (aya-expanse imita a nemotron): https://huggingface.co/dementor-research/sft_writingprompts_aya-expanse-8b_as_nemotron-nano-30b-a3b_seed42
- Pagina de Tinker (herramienta de entrenamiento): https://thinkingmachines.ai/tinker/
- Pagina de NVIDIA Nemotron: https://developer.nvidia.com/topics/ai/nemotron
