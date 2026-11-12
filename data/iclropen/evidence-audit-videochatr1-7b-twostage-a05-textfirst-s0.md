# iclropen/evidence-audit-videochatr1-7b-twostage-a05-textfirst-s0

## Resumen

`evidence-audit-videochatr1-7b-twostage-a05-textfirst-s0` es un adaptador LoRA publicado por el usuario `iclropen` sobre el modelo base `OpenGVLab/VideoChat-R1_7B`, un modelo multimodal de video con arquitectura Qwen2.5-VL y 7.000 millones de parametros. El adaptador no es un modelo autonomo: requiere cargar el base y aplicar los pesos LoRA, que ocupan 190.442.760 bytes (unos 0,19 GB) y representan la segunda etapa de un entrenamiento en dos fases (SFT primero, luego un objetivo con control de placebo). El repositorio pesa 0,2 GB en total.

El adaptador se enmarca en el articulo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (envio a ICLR 2027, en revision). El problema que aborda es el de la dependencia de la evidencia en tareas de localizacion temporal de video (video temporal grounding): un modelo puede acertar el intervalo anotado sin haber usado realmente la evidencia visual, apoyandose en sesgos del prompt o del texto. El entrenamiento introduce un objetivo que penaliza que la prediccion se mantenga cuando se edita la evidencia y cuando se aplica un placebo equivalente fuera del intervalo anotado.

La relevancia es acotada pero tecnica: no es un modelo de proposito general, sino un artefacto de investigacion reproducible para auditar si un modelo de grounding se apoya en la evidencia o en atajos. Su interes esta en la metodologia (objetivo placebo-controlado con pesos Group-DRO por operador de edicion) y en la advertencia practica sobre la incompatibilidad silenciosa entre transformers 4.51 y 5.x al cargar adaptadores LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen2.5-VL (modelo base VideoChat-R1_7B) |
| Parametros totales | no disponible (adaptador LoRA de 190.442.760 bytes; el base es de 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-VL; no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite las cuantizaciones habituales de Qwen2.5-VL, no detalladas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`), libreria peft |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y `lora_alpha` 32 con dropout 0,05, aplicado sobre los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` del modelo base Qwen2.5-VL. Se inicializa desde `evidence-audit-videochatr1-7b-sft-textfirst-s0`, es decir, la primera etapa (SFT) y esta segunda etapa comparten el mismo esquema de orden de mensajes (texto primero, luego video). La entrada de video se procesa a 2 fps con un maximo de 768 frames, y el estilo de prompt y respuesta es `vchat`.

El objetivo de la segunda etapa combina la NLL sobre la muestra limpia (con peso alpha = 0,5) con terminos de margen (beta = 0,1) que empujan a que la recompensa r(x) supere a la de la version con evidencia editada r(x_E) y a la del placebo emparejado r(x_O), mas un termino hinge que acota la caida en el placebo: d_O(entrenado) <= 1,25 * d_O(referencia) + 0,10, con peso 1,0. Los pesos por operador de edicion se ajustan con Group-DRO. Los operadores de edicion usados en entrenamiento son swap, mask, blur, tshift y shuffle, aplicando dos por ejemplo. Se entrenan 2.400 pares (primeras lineas de `data_ids/training_pairs_pool_8434.jsonl`, conjunto de train de Charades-STA), durante 300 pasos de optimizador con learning rate 5e-6, acumulacion de gradiente 8 y semilla 0, mediante el script `code/27_papo_train_qcdro_v3seln_r5.py`.

Una innovacion tecnica destacable, ajena al modelo pero critica para su uso, es el aviso de compatibilidad: los adaptadores entrenados con transformers 4.51 almacenan las claves como `base_model.model.model.layers.*` y `base_model.model.visual.*`, mientras que transformers 5 espera `base_model.model.model.language_model.layers.*` y `base_model.model.model.visual.*`. Cargar el adaptador con la version equivocada no lanza error pero deja los pesos LoRA sin cargar (no-op silencioso), por lo que la model card incluye un autochequeo que compara tensor a tensor los valores del fichero con el `state_dict` del modelo.

## Capacidades

- Localizacion temporal de video (video temporal grounding) sobre el benchmark Charades-STA, que es la tarea para la que se entreno el adaptador.
- Razonamiento multimodal video-texto heredado del base VideoChat-R1_7B (arquitectura Qwen2.5-VL).
- Procesamiento de video a 2 fps con hasta 768 frames por muestra.
- Entrada en orden texto-primero, video-despues, segun el esquema `vchat` de prompt y respuesta.
- Auditoria de dependencia de evidencia: el adaptador esta disenado para que se pueda medir si la prediccion se sostiene bajo ediciones de la evidencia (swap, mask, blur, tshift, shuffle) y bajo placebos emparejados.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.
- Modo thinking, vision, audio u otras capacidades especiales: no disponible en la informacion (el base es multimodal de video, pero no se detallan capacidades adicionales).

## Casos de uso

- Evaluacion de robustez de modelos de grounding: cargar el adaptador junto al base y ejecutar los scripts de auditoria de likelihood y de comportamiento del repositorio de codigo (`--model  --adapter <folder>`) para medir si las predicciones caen cuando se edita la evidencia visual, comparando con el modelo sin adaptador.
- Reproduccion de resultados de investigacion: el adaptador corresponde a la Tabla 10 del articulo, por lo que sirve para replicar esa fila concreta bajo las condiciones declaradas (2 fps, decodificacion greedy, 300 pasos, semilla 0).
- Estudio de sesgos de atajo en video QA: usar los operadores de edicion del entrenamiento para construir tests controlados que distingan acierto por evidencia de acierto por correlacion espuria entre texto e intervalo.
- Base para experimentos de alineacion con objetivos placebo-controlados: el esquema de pesos Group-DRO por operador se puede reutilizar sobre otros conjuntos de grounding temporal con anotaciones de intervalo.
- Validacion de pipelines PEFT: el autochequeo de la model card sirve como test de integracion para detectar cargas silenciosas fallidas al migrar entre transformers 4.51 y 5.x en entornos de investigacion.
- Analisis comparativo de etapas de entrenamiento: al existir el adaptador SFT previo (`...-sft-textfirst-s0`), permite aislar el efecto de la segunda etapa placebo-controlada frente a la supervision limpia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente referencia que el adaptador aparece en la Tabla 10 del articulo, sin incluir cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia estructural, el adaptador LoRA anade unos 0,19 GB de pesos al base de 7B; el consumo dominante es el del modelo base en el dtype elegido (bfloat16 en el ejemplo de carga).
- GPU recomendadas: no especificadas en la informacion. El ejemplo de carga usa `device_map="auto"` y `torch_dtype=torch.bfloat16`, lo que permite repartir el modelo entre GPUs disponibles.
- Cabe en GPU consumer: no disponible. Depende del base Qwen2.5-VL de 7B y de la cuantizacion aplicada, no detallada en la informacion.
- Opciones de despliegue: la model card documenta carga con `transformers` 5.x (probado 5.12.1) y `peft` 0.19.1 o superior, mas `qwen-vl-utils` para el procesamiento de video. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible. La evaluacion se realiza a 2 fps con decodificacion greedy, pero no se publican cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-videochatr1-7b-twostage-a05-textfirst-s0 | LoRA sobre base 7B | no disponible | Grounding temporal de video con auditoria de evidencia | apache-2.0 | Hugging Face, 0 descargas |
| OpenGVLab/VideoChat-R1_7B | 7B | no disponible | Video QA y grounding (base) | no disponible en la informacion | Hugging Face (modelo base) |
| evidence-audit-videochatr1-7b-sft-textfirst-s0 | LoRA sobre base 7B | no disponible | Etapa SFT previa del mismo linaje | no disponible en la informacion | Hugging Face (referenciado como inicializacion) |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo autonomo: solo contiene pesos LoRA; sin el base `OpenGVLab/VideoChat-R1_7B` no es utilizable.
- Riesgo de carga silenciosa fallida: con la version equivocada de transformers (4.51 frente a 5.x) los pesos LoRA no se aplican y no se lanza error. Es obligatorio ejecutar el autochequeo de la model card antes de cualquier evaluacion.
- Entrenado exclusivamente sobre Charades-STA (2.400 pares de entrenamiento); no hay evidencia de generalizacion a otros dominios de video o idiomas.
- Solo 300 pasos de optimizador con learning rate 5e-6: el ajuste es acotado y puede no alterar de forma sustancial el comportamiento del base.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia (2026-11-12): sin validacion externa por parte de la comunidad.
- El articulo asociado esta en revision (envio a ICLR 2027) y la citacion es anonima; los resultados no han pasado revision por pares.
- Idiomas soportados no declarados: el comportamiento multilingue no esta caracterizado.
- Sesgos conocidos y riesgo de alucinacion: no documentados en la informacion disponible; al heredar el base, arrastra los sesgos de este, que tampoco se detallan.
- Licencia apache-2.0 declarada para el adaptador; conviene verificar la licencia del modelo base antes de uso comercial.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/iclropen/evidence-audit-videochatr1-7b-twostage-a05-textfirst-s0
- Modelo base: https://huggingface.co/OpenGVLab/VideoChat-R1_7B
- Codigo y scripts de evaluacion/auditoria: https://huggingface.co/iclropen/evidence-audit-code
- Articulo de referencia: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, ICLR 2027 submission (en revision; sin enlace publico en la informacion disponible).
