# iclropen/evidence-audit-timer1-7b-pc-a1-s0

## Resumen

`evidence-audit-timer1-7b-pc-a1-s0` es un adaptador LoRA sobre el modelo `Boshenxx/Time-R1-7B`, un modelo de 7 mil millones de parametros con arquitectura Qwen2.5-VL especializado en localizacion temporal de eventos en video (video temporal grounding). Lo desarrolla el autor `iclropen` como artefacto experimental asociado a la publicacion *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, enviada a ICLR 2027 y actualmente en revision.

El adaptador no busca mejorar la precision bruta del modelo base, sino su dependencia de la evidencia visual real. El objetivo de entrenamiento es "placebo-controlled": penaliza que el modelo mantenga su prediccion cuando el intervalo anotado se sustituye por una edicion placebo equivalente fuera de dicho intervalo. Es, por tanto, una herramienta de auditoria y de investigacion sobre el comportamiento del modelo, no un modelo de proposito general.

El repositorio contiene unicamente los pesos LoRA (un fichero `adapter_model.safetensors` de 190.442.760 bytes, unos 190 MB), no los pesos completos del modelo base. El contexto, los idiomas y las capacidades heredadas dependen integramente de `Time-R1-7B` (Qwen2.5-VL), por lo que esta ficha se apoya en esa base para los datos no especificados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen2.5-VL (transformer multimodal vision-lenguaje); adaptador de bajo rango |
| Parametros totales | no disponible (el adaptador ocupa ~190 MB en safetensors; el modelo base es de 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (heredada de Time-R1-7B / Qwen2.5-VL) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite las cuantizaciones habituales del ecosistema Qwen2.5-VL) |
| Idiomas soportados | no disponible (heredados del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA); requiere el base en transformers 5.x, peft >= 0.19.1 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Boshenxx/Time-R1-7B`, cuya columna vertebral es Qwen2.5-VL, un transformer multimodal que procesa video a 2 fps con un maximo de 768 frames. El LoRA usa rango r=16, `lora_alpha=32` y dropout 0.05, con modulos objetivo q/k/v/o/gate/up/down_proj. El entrenamiento se realizo durante 300 pasos de optimizador con learning rate 5e-6, acumulacion de gradiente 8 y semilla 0, sobre 2.400 pares de entrenamiento de Charades-STA (primeras lineas de `data_ids/training_pairs_pool_8434.jsonl`).

La innovacion central es la funcion de perdida "placebo-controlled" descrita en la Seccion 4 del paper: L = alpha * NLL(clean) + suma sobre operadores de w_op * [softplus(-beta [r(x) - r(x_E)]) + softplus(-beta [r(x_O) - r(x_E)]) + hinge en la caida del placebo], donde x_E es el video con la evidencia editada y x_O una edicion placebo equivalente fuera del intervalo anotado. Se emplean pesos de operador Group-DRO y los operadores de edicion swap, mask, blur, tshift y shuffle (2 por ejemplo). Los hiperparametros son alpha=1.0, beta=0.1 y una cota de placebo d_O(entrenado) <= 1.25 * d_O(referencia) + 0.10 con peso de hinge 1.0. El entrenador es `code/27_papo_train_qcdro_v3seln_r5.py`.

## Capacidades

- Localizacion temporal de eventos en video (video temporal grounding) sobre Charades-STA, heredada del modelo base Time-R1-7B.
- Razonamiento multimodal vision-lenguaje: el base Qwen2.5-VL procesa video e imagenes junto con texto.
- Auditoria de dependencia de evidencia: el adaptador esta disenado para medir si la prediccion cae cuando se altera la evidencia visual (operadores swap, mask, blur, tshift, shuffle).
- Evaluacion de robustez frente a ediciones placebo: permite comparar la prediccion limpia con la prediccion sobre el video editado y sobre el placebo.
- Soporte de tool calling / function calling: no disponible en la model card (depende del base).
- Soporte de agentes y razonamiento multi-paso: no disponible en la model card.
- Capacidades multilingues: no disponibles en la model card.
- Capacidades especiales (thinking mode, vision, audio): vision heredada del base; thinking mode y audio no disponibles.

## Casos de uso

- Investigacion sobre fidelidad de evidencia en video: usar el adaptador para medir cuanto cae la prediccion de localizacion temporal al aplicar ediciones al intervalo anotado, comparando con el modelo base sin adaptador. Es el uso principal del artefacto y el que motiva su publicacion.
- Auditoria de modelos de grounding de terceros: el codigo asociado acepta `--model  --adapter <folder>`, de modo que el mismo protocolo de auditoria (likelihood audit, behavioural audit) puede aplicarse a otros adaptadores o bases para comparar su dependencia de la evidencia.
- Reproduccion de resultados del paper: el adaptador corresponde a las Tablas 6, 7, 10, 13, 14 y 21 y a las Figuras 1, 4 y 5, por lo que sirve para replicar esas cifras con el stack indicado.
- Analisis de robustez ante corrupcion visual: evaluar como cambia la localizacion temporal bajo blur, mask, swap, tshift o shuffle, util para estudiar la sensibilidad del modelo a artefactos de video reales (compresion, oclusiones, desincronizacion).
- Desarrollo de metodos de entrenamiento anti-atajo: el objetivo placebo-controlled y los pesos Group-DRO sirven de referencia para quien disene funciones de perdida que penalicen el uso de correlaciones espurias en lugar de evidencia visual.
- Validacion de pipelines de carga de adaptadores PEFT: el self-check incluido en la model card detecta el fallo silencioso de carga entre transformers 4.51 y 5.x, util como prueba de integracion en infraestructura de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las Tablas 6, 7, 10, 13, 14 y 21 y a las Figuras 1, 4 y 5 del paper (ICLR 2027, en revision), pero no incluye cifras numericas en el repositorio.

## Requisitos de hardware

- VRAM estimada: el adaptador anade ~190 MB a los pesos del base. El modelo base de 7B en bfloat16 requiere aproximadamente 14-16 GB de VRAM para inferencia; en cuantizacion de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB (estimaciones habituales para un transformer de 7B, no confirmadas en la model card).
- El procesamiento de video a 2 fps con hasta 768 frames incrementa notablemente el uso de memoria de activaciones respecto a texto o imagen unica; conviene reservar margen adicional.
- GPU recomendadas: A100 (40/80 GB) o H100 para evaluacion a maxima resolucion de frames y lotes; RTX 4090 (24 GB) para inferencia en bfloat16 con lotes pequenos; RTX 3090/4080 (16-24 GB) en cuantizacion de 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090 en bfloat16 con lotes reducidos y en GPUs de 8-12 GB con cuantizacion de 4 bits, sujeto a la viabilidad de cargar el base Qwen2.5-VL en ese formato.
- Opciones de despliegue: transformers 5.x (probado 5.12.1) con peft >= 0.19.1, tal como indica la model card; vLLM, llama.cpp, Ollama o TGI no estan documentados para este adaptador en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-timer1-7b-pc-a1-s0 (este) | LoRA sobre 7B | no disponible | Video temporal grounding + auditoria de evidencia | Apache 2.0 | Hugging Face (adaptador) |
| Boshenxx/Time-R1-7B (base) | 7B | no disponible | Video temporal grounding | no disponible en la informacion | Hugging Face |
| Qwen2.5-VL (arquitectura del base) | variantes de 3B/7B/72B | no disponible en la informacion | Vision-lenguaje general | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparado en la informacion proporcionada; la comparativa se limita a la relacion de dependencia con el modelo base y a la arquitectura heredada.

## Limitaciones y advertencias

- Es un adaptador LoRA experimental, no un modelo autonomo: sin `Boshenxx/Time-R1-7B` no es utilizable.
- Riesgo de carga silenciosa fallida: si se carga con la version equivocada de transformers (4.51 frente a 5.x), los pesos LoRA no se aplican y no se lanza ningun error. Es obligatorio ejecutar el self-check de la model card.
- Entrenado sobre Charades-STA (2.400 pares, 300 pasos): el dominio es acotado y el ajuste es corto, por lo que la generalizacion a otros dominios de video no esta documentada.
- Orientado a auditoria e investigacion: no esta pensado como modelo de produccion para atencion al cliente, generacion de codigo ni tareas generales.
- Sesgos conocidos: no documentados en la model card; los sesgos del base Qwen2.5-VL y de Charades-STA se heredan sin analisis especifico.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el objetivo del adaptador es precisamente reducir la dependencia de senales no visuales, pero no se aportan metricas de alucinacion.
- Limitaciones de contexto e idioma: no disponibles; dependen del base.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el uso comercial del modelo base debe verificarse por separado, ya que su licencia no consta en la informacion proporcionada.
- Paper en revision (ICLR 2027): los resultados y el propio metodo pueden cambiar antes de la publicacion definitiva.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/iclropen/evidence-audit-timer1-7b-pc-a1-s0
- Modelo base: https://huggingface.co/Boshenxx/Time-R1-7B
- Codigo asociado: https://huggingface.co/iclropen/evidence-audit-code
- Paper: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, ICLR 2027 submission (anonimo, en revision); no se proporciona URL directa en la informacion disponible.
