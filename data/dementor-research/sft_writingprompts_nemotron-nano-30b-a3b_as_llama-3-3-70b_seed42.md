# dementor-research/sft_writingprompts_nemotron-nano-30b-a3b_as_llama-3.3-70b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA, no un modelo autonomo, desarrollado por el grupo de investigacion `dementor-research`. Forma parte de un estudio de imitacion de comportamiento (behavioral cloning) en el que se entrena un modelo pequeno para replicar las respuestas de uno mas grande. En concreto, el adaptador se ha entrenado mediante SFT (Supervised Fine-Tuning) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, un modelo de mezcla de expertos (MoE) de 30B parametros totales y 3B activos, para imitar el comportamiento de `Llama-3.3-70B` en tareas de escritura creativa (writing prompts).

La relevancia de este artefacto es principalmente investigadora: permite estudiar tecnicas de destilacion de modelos, eficiencia en fine-tuning con PEFT (LoRA rank 32 sobre todas las capas lineales) y la viabilidad de transferir estilos de generacion entre arquitecturas distintas. El adaptador pesa aproximadamente 1,5 GB y se distribuye en formato `safetensors` bajo la libreria `peft`. No se proporcionan datos sobre licencia, idiomas soportados ni longitud de contexto en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 32, target_modules=all-linear) sobre base NVIDIA Nemotron-3-Nano-30B-A3B-BF16 (MoE) |
| Parametros totales | Modelo base: 30B (aprox.). Adaptador: ~1,5 GB (tamano del repositorio) |
| Parametros activos | 3B (del modelo base, segun nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador esta en safetensors; el modelo base se referencia en BF16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se ha entrenado con la libreria `peft` sobre el modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, que es un transformer de mezcla de expertos (MoE) con 30B parametros totales y 3B activos por token. El entrenamiento se realizo mediante SFT con LoRA de rango 32, aplicado a todas las capas lineales del modelo base. La herramienta utilizada fue el framework Tinker de Thinking Machines, dentro de una campana denominada "dementor" que incluye 12 modelos, 4 datasets y 1 semilla (seed 42), generando 528 celdas de configuracion en total. El objetivo explicito era imitar el comportamiento de `Llama-3.3-70B` en un dataset de writing prompts, lo que constituye un caso de destilacion de comportamiento entre arquitecturas de distinto tamano y tipo.

## Capacidades

- Generacion de texto creativo: el adaptador esta especificamente entrenado para producir respuestas de escritura creativa siguiendo el estilo de Llama-3.3-70B.
- Imitacion de comportamiento: capacidad de replicar patrones de generacion de un modelo mas grande sobre un modelo base mas eficiente (MoE de 3B activos).
- Fine-tuning eficiente: al ser un adaptador LoRA, permite cargar y descargar el comportamiento aprendido sin modificar los pesos del modelo base.
- Integracion con PEFT: compatible con el ecosistema HuggingFace `transformers` y `peft` para su uso en pipelines de investigacion.
- No se dispone de informacion sobre soporte de tool calling, agentes, vision, audio, razonamiento multi-paso ni capacidades multilingues especificas en la documentacion proporcionada.

## Casos de uso

- Investigacion en destilacion de modelos: permite estudiar como un modelo MoE de 30B (3B activos) puede aproximar el comportamiento de un modelo denso de 70B en tareas de generacion creativa, midiendo la perdida de calidad y la ganancia en eficiencia.
- Evaluacion de tecnicas de fine-tuning eficiente: al ser un adaptador LoRA de rango 32, es util para comparar el impacto del rank y de la seleccion de capas objetivo en la calidad de la imitacion.
- Reproducibilidad de experimentos cientificos: al estar definido con una semilla fija (seed 42) y una configuracion explicita (528 celdas), sirve como punto de partida para replicar estudios de behavioral cloning.
- Generacion de texto creativo en entornos con recursos limitados: combinado con el modelo base, permite generar writing prompts con un coste computacional menor que un modelo de 70B, aunque con calidad potencialmente inferior.
- Analisis de transferencia de estilo entre arquitecturas: util para investigar si las preferencias de estilo de un modelo grande (Llama-3.3-70B) se pueden transferir a una arquitectura MoE mas pequena mediante SFT.
- Desarrollo de pipelines de PEFT: el codigo de uso proporcionado (carga con `PeftModel`) sirve como plantilla para integrar adaptadores LoRA en aplicaciones de investigacion o prototipado rapido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos o adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si es ligero (~1,5 GB), pero requiere cargar el modelo base. En BF16, el modelo base de 30B parametros necesita aproximadamente 60 GB de VRAM. Si se aplica cuantizacion al modelo base (no especificada en la informacion), podria reducirse a ~15-20 GB con cuantizacion de 4 bits.
- GPU recomendadas: para inferencia en BF16 se necesitan GPUs de alta gama como A100 80GB, H100 80GB o similares. Con cuantizacion, podria ejecutarse en una RTX 4090 (24 GB) o similar, aunque no se garantiza.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` + `peft` en entornos de investigacion. Para produccion, se podria fusionar el adaptador con el modelo base y servir con vLLM o TGI, siempre que se respete la licencia (no disponible).
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependen del hardware y de la cuantizacion del modelo base.

## Comparativa con modelos similares

No se dispone de comparativas directas del adaptador con otros adaptadores similares. En cuanto al modelo base, `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` compite con otros MoE de ~30B parametros totales y ~3B activos, como Mixtral 8x7B o Qwen3-30B-A3B, pero no se proporcionan datos de rendimiento en la informacion disponible para establecer una comparacion cuantitativa. La comparativa cualitativa se limita a la arquitectura: todos son MoE con activacion por token, pero difieren en el numero de expertos, la implementacion de attention y los datasets de entrenamiento, datos que no se detallan aqui.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` para funcionar.
- Licencia no disponible: no se especifica la licencia del adaptador ni del modelo base, lo que impide determinar si su uso comercial es legal. Se recomienda contactar con el autor antes de cualquier despliegue en produccion.
- Sin datos de sesgos ni alucinaciones: no se ha publicado informacion sobre sesgos conocidos, riesgos de alucinacion o limitaciones de contexto.
- Dataset de entrenamiento no documentado: no se detalla la composicion, tamano ni licencia del dataset de writing prompts utilizado, lo que dificulta evaluar posibles sesgos introducidos.
- Fecha de creacion futura: el repositorio indica una fecha de creacion de 2026-08-16, lo que sugiere que podria tratarse de un artefacto experimental o con metadatos incorrectos.
- Sin benchmarks: la ausencia de metricas de rendimiento impide validar la calidad de la imitacion respecto al modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/sft_writingprompts_nemotron-nano-30b-a3b_as_llama-3.3-70b_seed42
- Framework Tinker: https://thinkingmachines.ai/tinker/
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
