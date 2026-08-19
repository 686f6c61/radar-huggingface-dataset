# dementor-research/sft_writingprompts_nemotron-nano-30b-a3b_as_gemma-4-e4b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) denominado `sft_writingprompts_nemotron-nano-30b-a3b_as_gemma-4-e4b_seed42`, desarrollado por el grupo de investigación `dementor-research`. Se trata de un adaptador de fine-tuning supervisado (SFT) que se aplica sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 30 mil millones de parámetros totales y 3 mil millones activos por token. El adaptador forma parte de un estudio más amplio de imitación de comportamiento definido por configuración, en el que se entrena al modelo base para replicar el estilo de generación de otro modelo (en este caso, `gemma-4-e4b` según el nombre del alias) sobre un conjunto de datos de prompts de escritura creativa.

La relevancia de este adaptador radica en que permite modificar el comportamiento de un modelo base de gran tamaño sin necesidad de reentrenar todos sus parámetros, utilizando una técnica eficiente de adaptación de bajo rango. El resultado es un modelo especializado en tareas de generación de texto creativo, aunque su naturaleza experimental y la falta de documentación detallada limitan su uso directo en producción. El repositorio incluye únicamente los pesos del adaptador (1.5 GB) y no el modelo base completo, por lo que su uso requiere descargar el modelo base por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base MoE (Nemotron-3-Nano-30B-A3B) |
| Parametros totales | No disponible (el adaptador ocupa 1.5 GB en safetensors, pero no se especifica el numero de parametros) |
| Parametros activos | No aplica (es un adaptador, no un modelo autonomo) |
| Longitud de contexto | No disponible (depende del modelo base, no se indica en la informacion) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en BF16, pero no se documentan cuantizaciones) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (via PEFT/transformers) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante fine-tuning supervisado (SFT) con LoRA de rango 32, aplicado a todas las capas lineales del modelo base (`target_modules=all-linear`). El modelo base, `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, es un modelo MoE de 30 mil millones de parametros con 3 mil millones activos por token, desarrollado por NVIDIA como parte de la familia Nemotron 3. Segun la informacion publica de NVIDIA, esta familia incluye arquitecturas hibridas Mamba-Transformer para algunos modelos, aunque no se confirma si el modelo base de este adaptador utiliza dicha hibridacion. El entrenamiento se realizo con la herramienta Tinker de Thinking Machines, y el dataset utilizado es `writingprompts`, aunque no se especifican el numero de tokens ni la composicion exacta del corpus. El nombre del adaptador indica que se busca imitar el comportamiento del modelo `gemma-4-e4b` (probablemente un modelo de Google), lo que sugiere un enfoque de destilacion o imitacion de estilo.

## Capacidades

- Generacion de texto creativo: el adaptador esta especificamente entrenado para responder a prompts de escritura, por lo que mejora la capacidad del modelo base para producir narrativas, historias o textos literarios.
- Adaptacion eficiente: al ser un adaptador LoRA, se puede cargar y descargar rapidamente sobre el modelo base sin necesidad de modificar los pesos originales, lo que facilita la experimentacion.
- Compatibilidad con el ecosistema PEFT: se integra con la libreria `peft` de Hugging Face, permitiendo su uso con `transformers` y otras herramientas del ecosistema.
- No se documentan capacidades adicionales como tool calling, agentes o multimodalidad; estas dependen del modelo base y no se han verificado para este adaptador.

## Casos de uso

- Generacion de historias cortas: el adaptador puede utilizarse para crear relatos breves a partir de un prompt inicial, aprovechando el ajuste sobre el dataset de writing prompts.
- Asistencia a escritores: puede servir como herramienta de apoyo para generar ideas, continuar tramas o sugerir dialogos en proyectos de escritura creativa.
- Prototipado de aplicaciones de narrativa interactiva: al ser un adaptador ligero, se puede integrar en demos o prototipos que requieran generacion de texto con un estilo especifico.
- Investigacion en imitacion de comportamiento: el adaptador es un caso de estudio para analizar como un modelo base puede adaptarse a replicar el estilo de otro modelo mediante SFT con LoRA.
- Fine-tuning experimental: sirve como punto de partida para investigadores que quieran explorar tecnicas de adaptacion de bajo rango sobre modelos MoE de gran tamano.
- Evaluacion de calidad de generacion creativa: puede utilizarse en benchmarks internos para comparar la calidad de texto generado frente a otros adaptadores o modelos base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de evaluacion como MMLU, HumanEval o GSM8K, ni comparaciones con otros adaptadores o modelos. Dado que se trata de un adaptador experimental sin documentacion de rendimiento, no es posible proporcionar datos cuantitativos sobre su calidad en tareas estandar.

## Requisitos de hardware

- El adaptador LoRA en si ocupa 1.5 GB, pero para su uso es necesario cargar el modelo base completo `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, que en precision BF16 requiere aproximadamente 60 GB de VRAM (30 mil millones de parametros × 2 bytes).
- Con cuantizacion del modelo base (por ejemplo, 4 bits o 8 bits), podria reducirse el requisito de VRAM a unos 15-30 GB, lo que permitiria su ejecucion en GPUs de consumo como la RTX 4090 (24 GB) o la RTX 3090 (24 GB), aunque no se han probado configuraciones especificas.
- Para inferencia en produccion, se recomienda GPUs de datacenter como A100 (40/80 GB) o H100 (80 GB) para evitar cuantizaciones agresivas.
- El despliegue puede realizarse con librerias compatibles con PEFT, como `transformers` con `peft`, o mediante servidores de inferencia como vLLM o TGI, siempre que soporten la carga de adaptadores LoRA.
- No se dispone de datos de latencia o throughput para este adaptador especifico.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa cuantitativa con otros adaptadores. Existen otros adaptadores de la misma serie `dementor-research` (por ejemplo, `sft_writingprompts_gemma-4-e4b_as_nemotron-nano-30b-a3b_seed42` o `sft_writingprompts_nemotron-nano-30b-a3b_as_llama-3.1-8b_seed2`), que siguen el mismo patron de entrenamiento pero con diferentes modelos base o datasets. Sin embargo, no se publican metricas de rendimiento ni comparaciones directas. En terminos de arquitectura, el modelo base Nemotron-3-Nano-30B-A3B se puede comparar con otros MoE de tamano similar como Mixtral 8x7B o Qwen 30B-A3B, pero el adaptador no altera las capacidades base del modelo, solo su estilo de generacion.

## Limitaciones y advertencias

- Al ser un adaptador experimental, no se garantiza su robustez ni su comportamiento en entornos de produccion.
- La licencia no esta especificada, lo que impide conocer las restricciones de uso comercial o modificacion.
- No se documentan sesgos potenciales del dataset `writingprompts`, que podria contener sesgos de genero, culturales o tematicos.
- El adaptador depende completamente del modelo base; si el modelo base tiene limitaciones de contexto o idioma, estas se heredan.
- No se proporcionan instrucciones claras sobre el prompt de sistema o el formato de entrada esperado, lo que puede dificultar su uso correcto.
- El riesgo de alucinacion es inherente al modelo base y no se ha evaluado especificamente para este adaptador.
- El repositorio no incluye un `config.yaml` ni documentacion sobre los hiperparametros exactos del entrenamiento, a pesar de que la model card menciona su existencia.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/dementor-research/sft_writingprompts_nemotron-nano-30b-a3b_as_gemma-4-e4b_seed42
- Modelo base (NVIDIA Nemotron 3 Nano 30B-A3B): https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Pagina de NVIDIA sobre la familia Nemotron 3: https://research.nvidia.com/labs/nemotron/Nemotron-3/
- Repositorio GitHub de NVIDIA Nemotron: https://github.com/NVIDIA-NeMo/Nemotron
- Herramienta Tinker (mencionada en la model card): https://thinkingmachines.ai/tinker/
