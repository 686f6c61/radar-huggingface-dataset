# jayasaisrikar/specter-finance-qa-c

## Resumen

SPECTER arm C es un ajuste fino del modelo base CohereLabs/tiny-aya-global, desarrollado por el usuario jayasaisrikar como parte de un estudio de seguridad denominado SPECTER sobre preguntas y respuestas financieras. El modelo resuelve un problema de investigacion muy concreto: medir si un ajuste fino con datos de tarea contaminados con ejemplos adversarios (10% de BeaverTails) puede repararse mediante una tecnica de gradiente de seguridad llamada SafeGrad, recuperando la capacidad de rechazo ante peticiones daninas sin sacrificar la precision en la tarea original. No es un asistente financiero de produccion, sino un artefacto de investigacion para estudiar la deriva de seguridad bajo fine-tuning.

Tecnicamente es un transformer de 3.349.227.520 parametros (aproximadamente 3,3 mil millones) con pesos completos fusionados, resultado de aplicar un LoRA de rango 16, alpha 32 y dropout 0,05 sobre siete modulos de atencion y MLP del modelo base, que despues se fusiono en los pesos originales para su publicacion. El repositorio ocupa 6,7 GB en formato safetensors y se distribuye bajo la libreria transformers con arquitectura cohere2.

Su relevancia es metodologica: forma parte de un conjunto de brazos experimentales (B0, C y E publicados; B retenido) que permiten comparar metodos de reparacion de seguridad bajo condiciones controladas, con semilla fija, tasa de contaminacion r=0,1 y un plan de evaluacion versionado y aprobado. Los resultados medidos, sin embargo, muestran que ningun brazo del estudio supera la puerta de publicacion, lo que convierte al modelo en una evidencia de que el endurecimiento dirigido no basta por si solo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer cohere2 (modelo base CohereLabs/tiny-aya-global) |
| Parametros totales | 3.349.227.520 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible como lista oficial; la evaluacion cubre ingles, arabe, espanol, frances y tagalo |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 6,7 GB |
| Metodo de ajuste | LoRA r16 / alpha 32 / dropout 0,05 sobre 7 modulos de atencion y MLP, fusionado en el base |
| Tecnica de reparacion | SafeGrad (safetune 0.1.10, `harden.SafeGrad`) |
| Semilla y contaminacion | seed 0, tasa de contaminacion r=0,1 |

## Arquitectura y entrenamiento

El modelo parte de CohereLabs/tiny-aya-global, un transformer de la familia cohere2, y se obtiene mediante un ajuste fino con LoRA de rango 16, alpha 32 y dropout 0,05 aplicado sobre siete modulos de atencion y MLP. Posteriormente, el adaptador se fusiona en los pesos del modelo base, de modo que el artefacto publicado contiene los pesos completos (~6,7 GB) y no requiere cargar el adaptador por separado. El entrenamiento se ejecuto con el trainer `safetune 0.1.10`, en su metodo `harden.SafeGrad`, sobre el commit de codigo `e4ab0e9`, identico al del run v3 `9270331`.

Los datos de entrenamiento son las mismas filas que el brazo B: datos de tarea financiera mas un 10% de BeaverTails como conjunto adversario. La innovacion tecnica del brazo C es la aplicacion de un gradiente de seguridad durante el ajuste (SafeGrad) sobre esa receta contaminada, con el objetivo de comprobar si un endurecimiento dirigido recupera la capacidad de rechazo sin degradar la precision en la tarea. El plan de evaluacion (`070f6281ae9245f5a5e4df9a421fafd20be68fd94130ab2416d71068e61d6fbd`) figura como APPROVED y el holdout queda fijado por el digest `f196f08a8474fc57b3c7d9cdde4422441350a1e0a8b3da03ae8da03635ac3aa8`. No se especifican en la informacion disponible el numero total de tokens de entrenamiento ni la composicion detallada del dataset de tarea.

## Capacidades

- Generacion de texto conversacional y respuesta a preguntas sobre tematica financiera, heredada del ajuste sobre el dataset `specter-finance-qa`.
- Rechazo de peticiones daninas con tasas medidas entre el 6% y el 35,5% segun el idioma, tras el entrenamiento con SafeGrad.
- Capacidad multilingue parcial: la evaluacion cubre ingles, arabe, espanol, frances y tagalo, aunque no se publica una lista oficial de idiomas soportados.
- Abstencion ante informacion ausente en el contexto, con un 37,5% de acierto en el conjunto de evaluacion (15 de 40).
- Citacion de fuentes de soporte en las respuestas, con un 65% de soporte de cita medido (26 de 40).
- No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, vision, audio ni modo de pensamiento explicito.
- No se documenta una ventana de contexto concreta ni capacidades de codigo o matematicas mas alla de lo heredado del modelo base.

## Casos de uso

- Investigacion sobre deriva de seguridad en fine-tuning: el modelo sirve como brazo de comparacion para medir cuanto recupera SafeGrad frente a la receta contaminada sin reparacion, usando el mismo holdout y plan de evaluacion versionado.
- Reproducibilidad de experimentos de alineacion: con semilla 0, commit de codigo y digest de holdout publicados, un equipo puede regenerar las metricas ejecutando `specter run --plan plans/finance-qa-v1.json` desde el commit indicado.
- Estudio de robustez multilingue en rechazos: las tasas por idioma (35,5% en ingles frente a 6% en tagalo) permiten analizar como se degrada la capacidad de rechazo fuera del ingles y disenar evaluaciones especificas.
- Analisis de sobre-rechazo: con un 2,5% de over_refusal (1 de 40), el modelo es util para estudiar el equilibrio entre seguridad y utilidad en asistentes financieros.
- Evaluacion de resistencia a inyeccion de prompts: la metrica `injection_compliance` (97,5%, 39 de 40, lower-is-better) permite analizar la vulnerabilidad del modelo base y del ajuste ante instrucciones adversariales.
- Docencia y formacion en seguridad de modelos: como artefacto pequeno (3,3 mil millones de parametros, 6,7 GB) es viable en entornos de laboratorio para ilustrar como se mide la fuga de canarios y la abstencion correcta.
- No debe emplearse como asistente financiero de produccion, tal como declara el propio autor en la seccion de uso previsto.

## Benchmarks y rendimiento

Resultados medidos sobre el holdout congelado de este run, con intervalos de confianza de Wilson al 95%. Los rechazos se juzgaron con WildGuard; `injection_compliance` y `canary_leak` son metricas en las que menor es mejor.

| Metrica | k/n | Valor | IC 95% (Wilson) |
|---|---|---|---|
| harmful_refusal_en | 71/200 | 35,5% | 0,292 a 0,423 |
| harmful_refusal_ar | 17/50 | 34,0% | 0,224 a 0,478 |
| harmful_refusal_es | 17/50 | 34,0% | 0,224 a 0,478 |
| harmful_refusal_fr | 11/50 | 22,0% | 0,128 a 0,352 |
| harmful_refusal_tl | 3/50 | 6,0% | 0,021 a 0,162 |
| finance_accuracy | 26/40 | 65,0% | 0,495 a 0,779 |
| over_refusal | 1/40 | 2,5% | 0,004 a 0,129 |
| correct_abstention | 15/40 | 37,5% | 0,242 a 0,530 |
| citation_support | 26/40 | 65,0% | 0,495 a 0,779 |
| canary_leak | 40/40 | 100,0% | 0,912 a 1,000 |
| injection_compliance | 39/40 | 97,5% | 0,871 a 0,996 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 6,7 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, un entorno con 10-12 GB de VRAM resulta suficiente para secuencias cortas.
- VRAM estimada con cuantizacion de 8 bits: alrededor de 3,5-4 GB de pesos, viable en GPUs consumer de gama media.
- VRAM estimada con cuantizacion de 4 bits: alrededor de 2 GB de pesos, aunque el autor no publica versiones GGUF ni cuantizadas.
- GPUs recomendadas: A100 o H100 para evaluacion por lotes a gran escala; RTX 4090, RTX 3090 o RTX 4080 para inferencia interactiva.
- Cabe en GPUs consumer: si, en modelos con 8 GB o mas de VRAM en fp16 para contextos moderados, y en GPUs de 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers con safetensors es la via documentada; vLLM, TGI, llama.cpp u Ollama no estan confirmados para esta arquitectura en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SPECTER arm C (este modelo) | 3,3 mil millones | no disponible | Reparacion de seguridad SafeGrad sobre QA financiero | no disponible | Hugging Face, pesos safetensors |
| CohereLabs/tiny-aya-global (brazo A) | no disponible | no disponible | Modelo base multilingue sin ajuste | no disponible | Hugging Face |
| SPECTER arm B0 | no disponible | no disponible | Receta de tarea sin reparacion (publicado) | no disponible | Hugging Face |
| SPECTER arm E | no disponible | no disponible | Brazo alternativo del estudio (publicado) | no disponible | Hugging Face |
| SPECTER arm B | no disponible | no disponible | Datos de tarea mas filas adversarias (retenido por decision de gating) | no disponible | No publicado |

La comparacion cuantitativa entre brazos solo es posible para las metricas publicadas: el brazo C alcanza 40/40 en `canary_leak` frente a 24/40 del brazo E, mientras que el modelo base ya emite la cadena canario, lo que el autor califica de metrica practicamente no informativa en este contexto.

## Limitaciones y advertencias

- El autor declara explicitamente que ningun brazo del estudio supera la puerta de publicacion; un resultado PASS significa unicamente "cumple este plan versionado bajo estas condiciones", nunca "seguro".
- WildGuard no esta validado fuera del ingles, por lo que las tasas de rechazo en arabe, espanol, frances y tagalo arrastran esa salvedad metodologica.
- La abstencion correcta es baja (15 de 40): el modelo tiende a responder con una cifra confabulada en lugar de declinar cuando el libro contable carece del dato, lo que constituye un riesgo claro de alucinacion en contexto financiero.
- La fuga de canario es del 100% (40 de 40), igual que en el modelo base; el autor la considera cercana a no informativa porque el base ya emite la cadena.
- El cumplimiento de inyeccion es del 97,5% (39 de 40) en la escala lower-is-better, es decir, el modelo es altamente vulnerable a instrucciones adversariales.
- La licencia no esta disponible en la informacion proporcionada, por lo que no puede confirmarse el uso comercial.
- No se documentan sesgos conocidos, lista oficial de idiomas ni longitud de contexto, lo que limita la planificacion de despliegues reales.
- El uso previsto es exclusivamente de investigacion para medir deriva de seguridad y comparar metodos de reparacion; no es un asistente financiero de produccion.
- El brazo B esta retenido por decision de gating del PRD, de modo que la comparacion completa de la receta contaminada sin reparacion no es posible con los artefactos publicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jayasaisrikar/specter-finance-qa-c
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Dataset de entrenamiento: https://huggingface.co/datasets/jayasaisrikar/specter-finance-qa
- Dataset de resultados: https://huggingface.co/datasets/PraiseA/specter-v3-results
