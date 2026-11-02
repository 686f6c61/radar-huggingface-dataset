# jokingtim2468/Fine-Tuned-Deepseek-C

## Resumen

Fine-Tuned-Deepseek-C es un adaptador LoRA publicado por el usuario jokingtim2468 en HuggingFace. No se trata de un modelo completo, sino de un conjunto de pesos PEFT (0,5 GB) que debe cargarse sobre el modelo base huihui-ai/DeepSeek-R1-Distill-Qwen-14B-abliterated-v2, una variante "abliterated" (con los mecanismos de rechazo atenuados o eliminados) del destilado DeepSeek-R1 sobre Qwen de 14.000 millones de parametros.

El adaptador se ha entrenado mediante SFT (supervised fine-tuning) usando las librerias TRL y Unsloth, segun las etiquetas del repositorio. La model card esta practicamente vacia: todos los campos de descripcion, datos de entrenamiento, hiperparametros y evaluacion aparecen como "[More Information Needed]". No se declara licencia, idiomas soportados ni origen de los datos de ajuste.

Su relevancia es limitada y de nicho: se publica sin documentacion, sin benchmarks y con cero descargas en el momento de la ficha, por lo que debe tratarse como un experimento personal reproducible mas que como un modelo listo para produccion. El interes tecnico esta en el modelo base subyacente (R1-Distill-Qwen-14B), no en el adaptador en si.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (base: DeepSeek-R1-Distill-Qwen-14B) |
| Parametros totales | no disponible (adaptador de 0,5 GB; base de 14B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base, no declarada) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite cuantizacion estandar) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base por separado |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango que se inyecta en las capas del transformer base. El modelo subyacente, DeepSeek-R1-Distill-Qwen-14B, es un Qwen de 14B ajustado por DeepSeek mediante destilacion de trazas de razonamiento de DeepSeek-R1; la variante "abliterated-v2" de huihui-ai modifica las direcciones de activacion asociadas al rechazo para reducir las negativas del modelo. Sobre esa base, el autor aplica un SFT con TRL y Unsloth, segun las etiquetas del repositorio.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el rango del LoRA, la tasa de aprendizaje, el numero de epochs ni si hubo etapas de RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica propia. La model card es la plantilla por defecto de HuggingFace sin rellenar.

## Capacidades

- Generacion de texto conversacional (pipeline declarado: text-generation).
- Razonamiento multi-paso por herencia del modelo base destilado de DeepSeek-R1 (no verificado en este adaptador).
- Generacion de codigo y matematicas por herencia del base Qwen/DeepSeek-R1 (no verificado).
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles (el base Qwen tiene cobertura multilingue, pero el adaptador no lo declara).
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles.

## Casos de uso

- Experimentacion con fine-tuning LoRA: el adaptador sirve como ejemplo reproducible de un SFT sobre un destilado de R1 con Unsloth y TRL, util para estudiar el flujo de trabajo mas que para desplegar.
- Investigacion sobre "abliteration": permite comparar el comportamiento del base abliterated frente al adaptador ajustado en pruebas de rechazo y estilo de respuesta.
- Prototipado de asistentes conversacionales en local: cargando el base en 4-bit o 8-bit y aplicando el adaptador, se puede iterar sobre prompts sin coste de API.
- Generacion de codigo en entornos de desarrollo personal: el base Qwen-14B rinde razonablemente en tareas de programacion; el adaptador puede modificar el estilo de salida, aunque sin benchmarks no hay garantia.
- Analisis de sesgos y seguridad: util para auditar como un SFT sobre un modelo abliterated altera las respuestas ante prompts sensibles.
- Base para nuevos ajustes: al ser un adaptador pequeno, se puede fusionar o combinar con otros LoRA para experimentar con composicion de adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador solo ocupa 0,5 GB, pero requiere cargar el base de 14B. En bf16, el base necesita aproximadamente 28 GB de VRAM; en 8-bit, unos 15-16 GB; en 4-bit, unos 8-10 GB.
- GPU recomendadas: A100 40/80 GB o H100 para bf16 sin cuantizar; RTX 4090 (24 GB) para 8-bit; RTX 3090/4080 (16-24 GB) para 4-bit.
- Cabe en GPU de consumo: si, en 4-bit en tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) con margen ajustado; en 8-bit requiere 16 GB o mas.
- Opciones de despliegue: transformers + PEFT (carga del adaptador), vLLM (previa fusion del adaptador con el base), llama.cpp/Ollama (previa conversion a GGUF del modelo fusionado), TGI (previa fusion).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Fine-Tuned-Deepseek-C (este) | adaptador sobre 14B | no disponible | no disponible | HuggingFace, 0 descargas |
| huihui-ai/DeepSeek-R1-Distill-Qwen-14B-abliterated-v2 (base) | 14B | no disponible en esta ficha | no disponible | HuggingFace |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-14B (original) | 14B | 128K (segun model card publica) | MIT (segun model card publica) | HuggingFace |
| Qwen2.5-14B-Instruct | 14B | 128K (segun model card publica) | Apache 2.0 (segun model card publica) | HuggingFace |

No se dispone de datos de rendimiento del adaptador para comparar benchmarks.

## Limitaciones y advertencias

- Model card vacia: sin documentacion de datos, hiperparametros ni evaluacion; imposible auditar el ajuste.
- Licencia no declarada: no hay autorizacion explicita para uso comercial; ademas, la licencia del base (abliterated) puede imponer condiciones adicionales no verificadas aqui.
- Modelo base "abliterated": la eliminacion de mecanismos de rechazo aumenta el riesgo de generar contenido danino, sesgado o inapropiado; no apto para aplicaciones orientadas al publico sin filtros externos.
- Riesgo de alucinacion: inherente a los modelos destilados de razonamiento; sin benchmarks no se puede acotar.
- Idiomas no declarados: no se garantiza un rendimiento correcto en castellano ni en otros idiomas distintos del ingles/chino del base.
- Cero descargas y cero likes: sin validacion por parte de la comunidad; tratar como artefacto experimental.
- Requiere el modelo base por separado: el adaptador no es autosuficiente y anade complejidad de despliegue (fusion o carga PEFT).
- Sin soporte de tool calling ni agentes verificado: no asumir estas capacidades en produccion.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/jokingtim2468/Fine-Tuned-Deepseek-C
- Modelo base: https://huggingface.co/huihui-ai/DeepSeek-R1-Distill-Qwen-14B-abliterated-v2
- DeepSeek-R1-Distill-Qwen-14B original: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B
- Paper de referencia sobre impacto ambiental citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora ML Impact: https://mlco2.github.io/impact
