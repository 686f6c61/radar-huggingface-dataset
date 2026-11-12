# iclropen/evidence-audit-qwen7b-sft-4800pairs-s0

## Resumen

`evidence-audit-qwen7b-sft-4800pairs-s0` es un adaptador LoRA (no un modelo completo) entrenado sobre `Qwen/Qwen2.5-VL-7B-Instruct`, un modelo vision-language de 7.000 millones de parametros desarrollado por el equipo Qwen de Alibaba. El adaptador lo publica el usuario `iclropen` como material complementario de un articulo en revision para ICLR 2027 titulado *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*. El problema que aborda es el "video temporal grounding": localizar en un video el intervalo que responde a una consulta textual y, sobre todo, hacerlo dependiendo de la evidencia visual real y no de atajos espurios o sesgos del dataset.

El adaptador se entrena mediante SFT (supervised fine-tuning) sobre 4.800 pares de entrenamiento derivados del split de entrenamiento de Charades-STA, con 600 pasos de optimizacion y semilla 0. El repositorio incluye tambien un checkpoint intermedio (`checkpoints/step-100`, tras 100 pasos y 800 pares). El objetivo completo del articulo (que combina NLL sobre video limpio con terminos de margen frente a ediciones de evidencia y placebos) esta descrito en la model card, pero esta publicacion concreta desactiva esos terminos y entrena solo con SFT estandar.

Es relevante ahora porque el adaptador forma parte de la respuesta de los autores durante el periodo de discusion del ICLR 2027 y porque expone una trampa tecnica poco habitual: los adaptadores entrenados con transformers 4.51 usan un arbol de claves distinto al de transformers 5.x, y cargarlos con la version equivocada no lanza error sino que deja los pesos LoRA sin aplicar silenciosamente. La model card incluye un self-check explicito para detectarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer vision-language Qwen2.5-VL (adaptador PEFT) |
| Parametros totales | no disponible (el modelo base Qwen2.5-VL-7B-Instruct tiene 7.000 millones; el adaptador LoRA pesa 190.442.760 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible para el adaptador; heredada de Qwen2.5-VL-7B-Instruct (no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, PEFT/LoRA) |
| Modelo base | Qwen/Qwen2.5-VL-7B-Instruct |
| Libreria | peft (transformers 5.x, probado con 5.12.1; peft 0.19.1 o superior) |
| Rango LoRA (r) | 16 |
| lora_alpha | 32 |
| Dropout LoRA | 0.05 |
| Modulos objetivo | q/k/v/o/gate/up/down_proj |
| Tamano del repo | 0.4 GB |
| Checkpoints incluidos | raiz (final, 600 pasos) y `checkpoints/step-100` (100 pasos, 800 pares) |
| sha256 del adaptador final | `ce3f723e73773850df35ecaeb5221fb1b573805b3647e6b0181492b8e03fe961` |
| sha256 del adaptador step-100 | `809ae32b6ab3646c85c7d8365c8da36bda2e094bc5170b9b36ad7aa9b0b22ce5` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-VL-7B-Instruct, un transformer vision-language con torre visual y modelo de lenguaje. El adaptador en si es un LoRA de rango 16 y alpha 32 con dropout 0.05, aplicado a las proyecciones de atencion (q, k, v, o) y a las proyecciones MLP (gate, up, down) del modelo base. Solo se distribuyen los pesos LoRA; el modelo base debe descargarse por separado.

El entrenamiento de esta publicacion es SFT puro sobre 4.800 pares de Charades-STA (las primeras lineas del pool `data_ids/training_pairs_pool_8434.jsonl`), con 600 pasos de optimizacion, learning rate 5e-6, acumulacion de gradiente 8, semilla 0 y un trainer concreto (`code/27_papo_train_qcdro_v3seln_r5.py`). La model card describe el objetivo completo del articulo (NLL sobre video limpio ponderado por alpha, mas terminos de margen con softplus sobre ediciones de evidencia y placebos, y un hinge sobre la caida del placebo), pero en esta ejecucion los terminos de evidencia y placebo estan desactivados: alpha=1, beta=1e-9, sin cota de placebo. Los operadores de edicion usados en el pipeline de entrenamiento son swap, mask, blur, tshift y shuffle, dos por ejemplo. La entrada de video se procesa a 2 fps con un maximo de 768 frames, con orden de mensajes video primero y texto despues, y estilo de prompt/answer `timer1_default` / `timer1`.

La innovacion tecnica destacable no esta en el adaptador sino en el ecosistema que lo rodea: el articulo propone medir la dependencia de evidencia (no solo la precision) mediante auditorias de verosimilitud y de comportamiento, y la model card documenta un problema de compatibilidad entre transformers 4.51 y 5.x que provoca cargas silenciosas sin efecto. El self-check incluido compara tensor a tensor los pesos del fichero con los del modelo cargado y falla si algun tensor LoRA no ha encontrado modulo.

## Capacidades

- Generacion de texto y razonamiento sobre video: hereda las capacidades del modelo base Qwen2.5-VL-7B-Instruct.
- Video temporal grounding: localizacion de intervalos temporales en video a partir de una consulta textual, que es la tarea para la que se entrena el adaptador.
- Procesamiento de video a 2 fps con hasta 768 frames como entrada durante el entrenamiento.
- Capacidades vision-language del modelo base (comprension de imagen y video, respuesta a preguntas visuales).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para el adaptador (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (thinking mode, audio): no documentadas en la informacion proporcionada.

## Casos de uso

- Investigacion en video temporal grounding: usar el adaptador como linea base SFT frente a la version con el objetivo completo del articulo para aislar el efecto de los terminos de evidencia y placebo. Es adecuado porque ambos comparten trainer, datos y semilla, y solo cambian los pesos del objetivo.
- Auditoria de dependencia de evidencia: emplear los scripts de evaluacion del repositorio de codigo (`--model  --adapter <folder>`) para medir precision a 2 fps con decodificacion greedy, auditoria de verosimilitud y auditoria de comportamiento sobre Charades-STA.
- Reproduccion de resultados de un articulo en revision: cargar el checkpoint final y el `step-100` para comparar curvas de entrenamiento y verificar la reproducibilidad con semilla 0 y 600 pasos.
- Busqueda de momentos concretos en archivos de video: dado un video y una consulta en lenguaje natural, el modelo devuelve el intervalo temporal que responde a la consulta, util para indexacion o resumen de contenido audiovisual.
- Prototipado de asistentes sobre video: integrar el adaptador en un pipeline de Qwen2.5-VL para responder preguntas que requieran localizar evidencia visual concreta antes de responder.
- Validacion de infraestructura de carga de adaptadores PEFT: el self-check de la model card sirve como prueba de humo para detectar desajustes de arbol de claves entre transformers 4.51 y 5.x en pipelines propios.
- Docencia y experimentacion con LoRA: el par de checkpoints (paso 100 y paso 600) permite estudiar el efecto del numero de pasos en una tarea de grounding con un coste de computo contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador; el modelo base Qwen2.5-VL-7B-Instruct en bfloat16 requiere aproximadamente 14-16 GB solo para pesos, mas el coste de la torre visual y de los frames de video (hasta 768 frames a 2 fps en entrenamiento).
- GPU recomendadas: no especificadas en la informacion proporcionada. Por tamano del modelo base, son razonables A100 40/80 GB, H100 o RTX 4090 para inferencia en bfloat16; no confirmado por el autor.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) con el modelo base en bfloat16 y procesamiento de video moderado; no confirmado en la informacion.
- Opciones de despliegue: transformers 5.x (probado con 5.12.1) y peft 0.19.1 o superior, con `qwen-vl-utils`. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Almacenamiento: el repositorio del adaptador ocupa 0.4 GB; el modelo base debe descargarse aparte.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-qwen7b-sft-4800pairs-s0 (este) | LoRA sobre base de 7B | no disponible | Video temporal grounding (Charades-STA) | apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| Qwen/Qwen2.5-VL-7B-Instruct | 7B | no disponible en la informacion | Vision-language general | no disponible en la informacion | Hugging Face (modelo base) |
| Alternativas de grounding sobre Charades-STA | no disponible | no disponible | Video temporal grounding | no disponible | no disponible |

No se dispone de datos de rendimiento comparado con otras alternativas de la misma tarea en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador no es un modelo autonomo: requiere descargar y cargar Qwen2.5-VL-7B-Instruct por separado.
- Trampa de compatibilidad critica: cargar el adaptador con transformers 4.51 cuando fue entrenado con 5.x (o viceversa) no lanza error y deja los pesos LoRA sin aplicar. Es obligatorio ejecutar el self-check de la model card.
- Entrenado solo con SFT: los terminos de evidencia y placebo del articulo estan desactivados (beta=1e-9, sin cota), por lo que este checkpoint no incorpora el objetivo principal que el articulo propone evaluar.
- Entrenado unicamente sobre el split de entrenamiento de Charades-STA (4.800 pares); la generalizacion a otros dominios de video no esta documentada.
- Solo se distribuyen pesos LoRA; no se documentan resultados de benchmarks ni de evaluacion en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; es una preocupacion central del articulo (dependencia de evidencia), pero no se aportan cifras.
- Restricciones de licencia: apache-2.0 para el adaptador; la licencia del modelo base debe consultarse por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; es material de investigacion en revision, no un artefacto validado para produccion.
- El articulo esta en revision (ICLR 2027) y el contenido de la model card corresponde a la respuesta de los autores durante la discusion, no al PDF enviado.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/iclropen/evidence-audit-qwen7b-sft-4800pairs-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio de codigo: https://huggingface.co/iclropen/evidence-audit-code
- Articulo: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, ICLR 2027 submission (under review); sin enlace disponible en la informacion proporcionada.
