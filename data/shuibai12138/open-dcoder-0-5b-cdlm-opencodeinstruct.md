# Shuibai12138/Open-Dcoder-0.5B-CDLM-OpenCodeInstruct

## Resumen

Open-Dcoder-0.5B-CDLM-OpenCodeInstruct es un modelo de lenguaje de difusion enmascarada (masked diffusion language model) de 630.167.424 parametros, publicado por el usuario Shuibai12138 como parte del codigo de reproduccion del articulo *Corrective Diffusion Language Models* (NeurIPS 2026). Se obtiene continuando el entrenamiento de fredzzp/open-dcoder-0.5B durante 2.000 pasos sobre el corpus publico nvidia/OpenCodeInstruct con el objetivo correctivo CDLM: corrupcion por absorcion (mascara) mas sustitucion uniforme del 10% de los tokens aun visibles, con un termino de entropia cruzada sobre las posiciones sustituidas (peso 0,1).

El modelo es la mitad de una pareja emparejada: Shuibai12138/Open-Dcoder-0.5B-MDLM-OpenCodeInstruct es su control MDLM (solo absorcion, resto identico). El proposito explicito es permitir que cualquiera reproduzca y compare la receta CDLM sobre un corpus sin restricciones, ya que los modelos de 0,5B del articulo se entrenaron con Nemotron-SFT-Code, un dataset con acceso restringido. El propio autor advierte que este modelo no es un modelo del articulo y que sus resultados no son los del articulo.

Su relevancia es doble: por un lado sirve como artefacto de investigacion reproducible para estudiar objetivos de difusion correctiva en generacion de codigo; por otro, ilustra una familia de modelos que no se pueden cargar con las herramientas habituales de inferencia autorregresiva, ya que requiere atencion bidireccional y logits desplazados. Esta especializacion en codigo, su tamano reducido (1,3 GB de repositorio) y su licencia MIT lo hacen adecuado para experimentacion en una sola GPU, no para despliegue de produccion estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen2 con atencion bidireccional y objetivo de difusion enmascarada (CDLM, corrective diffusion) |
| Parametros totales | 630.167.424 (etiquetado comercialmente como 0.5B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4.096 tokens empaquetados por secuencia durante el entrenamiento; el maximo del modelo base no se especifica en la informacion disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo distribuye safetensors; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Codigo (etiqueta `language: code`); no se declaran idiomas naturales |
| Licencia | MIT (pesos del modelo); dataset de entrenamiento CC BY 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es fredzzp/open-dcoder-0.5B (revision `d0d86d5b9996`), un transformer Qwen2 adaptado a difusion. En este ajuste se aplica el objetivo CDLM con `mixture_prob=0.1`, `noise_token_wt=0.1` y `clean_token_wt=0.0`: se absorben tokens (mascara) y ademas se sustituye uniformemente el 10% de los tokens que seguian visibles, anadiendo una perdida de entropia cruzada sobre esas posiciones sustituidas con peso 0,1. El `lm_head` y `embed_tokens` permanecen congelados durante el ajuste.

Los datos son nvidia/OpenCodeInstruct (revision `8f3ba5bafe4d`), los 50 shards completos en orden, sin filtrado, con cada fila renderizada como `"input: " + input + " output: " + output`, el formato textual del corpus del articulo. El entrenamiento fue de 2.000 pasos de un calendario truncado de 20.345.053 pasos (el mismo calendario de horizonte largo que el CDLM-0.5B del articulo), con AdamW, learning rate pico 3e-4, coseno, 20.345 pasos de warmup (lr en el paso 2.000 = 2,95e-5), weight decay 0,01, grad clip 1,0 y bf16. El lote global fue de 12 secuencias x 4.096 tokens empaquetados (micro lote 3 x 4 GPUs), semilla 42, sobre 4 x A100-PCIE-40GB durante aproximadamente 19 minutos. El codigo esta en zhangshuibai/CDLM (commit `5e52812`, etiqueta `v1.0-corrective-training`). La innovacion tecnica frente a MDLM es precisamente el termino correctivo sobre tokens sustituidos, que anade senal de supervision mas alla de las posiciones enmascaradas.

## Capacidades

- Generacion de codigo condicionada por instrucciones, en el formato `input: ... output: ...` empleado durante el ajuste.
- Correccion de codigo: el objetivo de entrenamiento esta disenado para reconstruir y corregir tokens corruptos, lo que incluye la reparacion de fragmentos danados o incompletos.
- Relleno bidireccional (infilling): al usar atencion bidireccional, el modelo puede condicionar sobre contexto a izquierda y derecha del hueco, algo que un modelo causal puro no hace de forma nativa.
- Denoising iterativo: la generacion se produce por refinamiento progresivo en varios pasos de difusion, no token a token.
- Uso como linea base de investigacion: pareja controlada con la variante MDLM para ablaciones del objetivo de corrupcion.
- No se documenta soporte de tool calling, function calling, uso agentico, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues de lenguaje natural: no disponibles en la informacion proporcionada.

## Casos de uso

- Reproduccion de resultados de investigacion: permite reentrenar y comparar el objetivo CDLM frente al control MDLM con el mismo codigo e hiperparametros sobre un corpus publico y sin restricciones de acceso, algo imposible con los modelos del articulo por el uso de Nemotron-SFT-Code.
- Correccion automatica de codigo (code repair): el modelo se entreno explicitamente para reconstruir tokens sustituidos y enmascarados, por lo que encaja en tareas de reparacion de fragmentos con errores sintacticos o identificadores corruptos, condicionando sobre el contexto a ambos lados del fallo.
- Relleno de huecos en editores y pipelines: con atencion bidireccional puede completar regiones a partir del codigo que las rodea, util para generar cuerpos de funcion a partir de firma y comentarios en herramientas de asistencia internas.
- Generacion de datos sinteticos de codigo: producir pares instruccion-respuesta a partir de semillas para enriquecer corpus de ajuste o evaluar filtros de calidad, dado su coste de inferencia bajo (630 M de parametros).
- Ablaciones y estudios de objetivos de difusion: comparar CDLM frente a MDLM, variando el porcentaje de sustitucion uniforme o el peso de la perdida correctiva, con una diferencia observable y acotada entre ambos brazos.
- Ajuste fino especifico de dominio: al ser un modelo de 0,63B con licencia MIT y solo 1,3 GB de pesos, se puede reajustar sobre un corpus interno de un lenguaje concreto en una unica GPU de 24 GB sin infraestructura dedicada.
- Docencia y divulgacion tecnica: sirve como ejemplo ejecutable y de bajo coste de un modelo de difusion de lenguaje, frente a la practica habitual centrada en modelos autorregresivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MBPP ni HumanEval+ para este modelo ni para su pareja MDLM, y advierte explicitamente que los resultados obtenidos con esta pareja no son los del articulo. No se deben extrapolar cifras del CDLM-0.5B original, que se entreno con otro corpus y otro numero de tokens vistos.

## Requisitos de hardware

- VRAM de pesos en bf16: aproximadamente 1,3 GB para 630 M de parametros. En fp32 subiria a unos 2,5 GB; una hipotetica cuantizacion a 8 bits quedaria en torno a 0,7 GB y a 4 bits en torno a 0,4 GB, aunque el autor no publica pesos cuantizados.
- VRAM adicional para inferencia: depende del numero de secuencias concurrentes y de la longitud (hasta 4.096 tokens empaquetados en entrenamiento) y del numero de pasos de denoising; no se publican mediciones.
- GPU recomendadas: no hay recomendacion oficial de inferencia. El entrenamiento se realizo en 4 x A100-PCIE-40GB con micro lote 3 y 4.096 tokens, lo que da una referencia del orden de recursos usado para ajuste, no para servir el modelo.
- GPU de consumo: por tamano de pesos cabe holgadamente en cualquier GPU consumer con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, etc.), siempre que se use la implementacion de difusion correcta.
- Opciones de despliegue: unicamente el pipeline de evaluacion del repositorio zhangshuibai/CDLM, que carga los modelos cuyo nombre contiene `open-dcoder` con la implementacion Qwen2 de difusion (atencion bidireccional, logits desplazados). Cargarlo con `AutoModelForCausalLM` produce un modelo Qwen2 causal y salidas incorrectas. No se documenta soporte en vLLM, llama.cpp, Ollama, TGI ni transformers estandar.
- Latencia y throughput: no disponibles. Al tratarse de decodificacion por difusion, el coste depende del numero de pasos de refinamiento, que no se especifica en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Objetivo | Datos de ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Open-Dcoder-0.5B-CDLM-OpenCodeInstruct (este) | 630.167.424 | CDLM: absorcion + sustitucion uniforme del 10% con perdida correctiva (peso 0,1) | nvidia/OpenCodeInstruct, 2.000 pasos | MIT | Publico, sin gating |
| Open-Dcoder-0.5B-MDLM-OpenCodeInstruct | 630.167.424 | MDLM: solo absorcion, resto identico | nvidia/OpenCodeInstruct, 2.000 pasos | No disponible en la informacion proporcionada | Publico (pareja control) |
| CDLM-0.5B (Shuibai12138/CDLM-0.5B) | No disponible | CDLM, modelo del articulo | Nemotron-SFT-Code (gated, solo entrenamiento interno) | No disponible en la informacion proporcionada | Publico como pesos, datos no reproducibles |
| fredzzp/open-dcoder-0.5B (base) | No disponible | Difusion base sin el ajuste correctivo | No disponible | No disponible en la informacion proporcionada | Publico |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada; la comparacion se limita a parametros, objetivo de entrenamiento, corpus y licencia.

## Limitaciones y advertencias

- No es un modelo del articulo: la model card indica explicitamente que forma parte del codigo de reproduccion y que sus resultados no son los de *Corrective Diffusion Language Models*; no deben citarse como tales.
- Entrenamiento truncado: solo 2.000 pasos de un calendario de 20.345.053, con learning rate aun en 2,95e-5 al final. El modelo no ha completado su programa de entrenamiento, por lo que su calidad esta lejos de la de un modelo convergido.
- Carga incorrecta con herramientas estandar: usar `AutoModelForCausalLM` devuelve un Qwen2 causal y salidas erroneas. Es imprescindible el pipeline del repositorio CDLM.
- Sin soporte en ecosistema de inferencia: no hay pesos GGUF ni integracion en vLLM, llama.cpp, Ollama, TGI u otros servidores, lo que complica cualquier uso en produccion.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o seguridad. El corpus OpenCodeInstruct es codigo de origen diverso y puede arrastrar sesgos de estilo, licencias o practicas de programacion.
- Alucinacion: sin datos de evaluacion de fidelidad. En generacion de codigo, un modelo de 0,63 B con entrenamiento truncado tiene riesgo alto de producir APIs inexistentes, imports erroneos y logica sutilmente incorrecta.
- Cobertura idiomatica: la etiqueta de idioma es `code`; no se declaran idiomas naturales y el corpus de instrucciones no se detalla, por lo que el comportamiento en castellano no esta garantizado.
- Limite de contexto: el entrenamiento uso 4.096 tokens empaquetados; no se documenta la ventana efectiva del modelo base ni su comportamiento mas alla de esa longitud.
- Licencia: los pesos son MIT, lo que permite uso comercial, pero el dataset de entrenamiento es CC BY 4.0 y requiere atribucion a NVIDIA. La licencia del modelo base fredzzp/open-dcoder-0.5B no se detalla en la informacion proporcionada y deberia verificarse antes de un uso comercial.
- Cero adopcion observable: 0 descargas y 0 likes en HuggingFace en el momento de la consulta, y creacion en septiembre de 2026; no hay evidencia de uso en produccion ni de validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shuibai12138/Open-Dcoder-0.5B-CDLM-OpenCodeInstruct
- Pareja control MDLM: https://huggingface.co/Shuibai12138/Open-Dcoder-0.5B-MDLM-OpenCodeInstruct
- Modelo del articulo (CDLM-0.5B): https://huggingface.co/Shuibai12138/CDLM-0.5B
- Modelo base: https://huggingface.co/fredzzp/open-dcoder-0.5B
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/OpenCodeInstruct
- Repositorio de codigo (entrenamiento y evaluacion): https://github.com/zhangshuibai/CDLM
- Cita del articulo: Zhang, Shuibai; Peng, Fred Zhangzhi; Zhang, Yiheng; Pan, Jin; Chrysos, Grigorios G. *Corrective Diffusion Language Models*, Advances in Neural Information Processing Systems, 2026.
