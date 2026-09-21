# abidlabs/jev-typed-decisions-causal-0.6b

## Resumen

El modelo `abidlabs/jev-typed-decisions-causal-0.6b` es un conjunto de adaptadores LoRA sobre el modelo base `Qwen/Qwen3-0.6B-Base` (596,0 M de parametros), publicado por el usuario abidlabs. No es un modelo de generacion de texto generalista, sino un *scorer* causal especializado en decisiones tipadas: dado un prompt con un conjunto de opciones candidatas, el modelo puntua cada opcion leyendo la distribucion del siguiente token restringida a las letras de respuesta (`" A"`..`" Z"`). Se trata de una reproduccion del "arm B" del experimento documentado en `pngwn/typed-decisions-causal-experiment`, en el estilo del modelo "Jev".

La relevancia de esta ficha es acotada y muy tecnica: el repositorio ocupa solo 0,1 GB, no tiene descargas ni likes en el momento de la consulta y su pipeline no esta declarado. Su interes esta en la receta de entrenamiento y en el esquema de evaluacion (scoring restringido con una unica KV cache compartida), mas que en capacidades generativas. El autor documenta de forma explicita las metricas obtenidas en su *quick-eval* interno y advierte de que no son directamente comparables con las del informe original.

Arquitectonicamente se apoya en un transformer decoder denso (Qwen3-0.6B-Base) con la cabeza LM congelada y solo los adaptadores LoRA entrenables. El contexto de entrenamiento fue de 1024 tokens y el modelo esta pensado para prefill unico y lectura de un unico token de decision por rama, no para generacion autoregresiva libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (Qwen3-0.6B-Base) con adaptadores LoRA y esquema de scoring causal tipado |
| Parametros totales | 596,0 M en el modelo base; el repositorio contiene solo adaptadores LoRA (r=16) |
| Longitud de contexto | No disponible en la informacion proporcionada; el entrenamiento uso `max_len` 1024. La ventana nativa depende de `Qwen/Qwen3-0.6B-Base` |
| Tipos de cuantizacion | No disponible. Los adaptadores se distribuyen en safetensors; la cuantizacion del modelo base no esta documentada |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT sobre `Qwen/Qwen3-0.6B-Base`, un transformer decoder denso de 596,0 M de parametros. La cabeza LM permanece congelada y solo se entrenan los adaptadores LoRA, con rango r=16, alpha=32, dropout 0,05 y aplicados a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. La innovacion metodologica no esta en la arquitectura, sino en la codificacion de la tarea: modo *branch*, con secuencia `prompt + suffix_i + letter_i`, calculo de la perdida en la posicion unica de la letra de respuesta y entropia cruzada restringida a los tokens de letras candidatas (`" A"`..`" Z"`, que en el tokenizador de Qwen son tokens unicos). Esto evita materializar los logits de todo el vocabulario.

El corpus de entrenamiento es `pngwn/typed-decisions-v2`, fijado en el commit `74a8ed2d0d28955351805f7829d7149961172f88`, con 31.109 estados y 45.932 decisiones en el split de entrenamiento. Se uso AdamW con lr 1e-4, weight decay 0, *warmup* lineal del 3 % seguido de coseno, clipping 1,0, batch 16, `max_len` 1024 y semilla 20260916, durante 5.742 pasos (2 epocas completas). El entrenamiento completo tardo 37 minutos y 21 segundos en una instancia `a100-large`, con torch 2.14.0+cu130, transformers 5.17.0 y peft 0.21.0. No se documenta RLHF ni DPO.

## Capacidades

- Puntuacion de decisiones tipadas: dado un prompt y un conjunto de opciones etiquetadas, produce una distribucion restringida sobre las letras candidatas.
- Clasificacion de opcion multiple con una unica KV cache compartida y una rama por decision.
- Lectura del siguiente token limitada a los tokens `" A"`..`" Z"`, sin materializar logits de todo el vocabulario.
- Calibracion de confianza: el informe de referencia reporta ECE 0,0154 tras *temperature scaling*.
- Uso como scorer auxiliar o componente de enrutamiento dentro de pipelines mayores.
- No se documenta soporte de *tool calling*, *function calling*, agentes, vision, audio ni modo *thinking*.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Evaluacion de opcion multiple en investigacion: el modelo puntua cada letra candidata directamente, lo que permite medir exactitud y calibracion sin decodificacion generativa, con una sola pasada de prefill por estado.
- Enrutamiento de decisiones en pipelines de agentes: usar el scorer como clasificador de bajo coste que elige entre un conjunto finito de ramas (por ejemplo, " A" = consultar herramienta, " B" = responder directamente).
- Clasificacion de intenciones en atencion al cliente: mapear cada intencion a una letra y leer la distribucion restringida para obtener etiqueta y confianza en un solo *forward*.
- Triage de tickets o incidencias: asignar prioridad o categoria entre un conjunto cerrado de opciones, aprovechando la calibracion para umbralizar derivaciones a humanos.
- Seleccion de respuesta en sistemas de generacion con candidatos: puntuar varias respuestas generadas por otro modelo y elegir la de mayor probabilidad bajo el scorer.
- Experimentacion academica sobre scoring causal: reproducir o extender el "arm B" del informe con un coste de entrenamiento de 37 minutos en A100.
- Anotacion asistida por lotes: procesar grandes volumenes de estados con decisiones tipadas reutilizando una KV cache comun, lo que reduce el coste por rama.
- Auditoria de calibracion: usar las probabilidades restringidas para estudiar fiabilidad y sobreconfianza en tareas de decision discreta.

## Benchmarks y rendimiento

| Evaluacion | Conjunto | Metrica | Resultado |
|---|---|---|---|
| Quick-eval en entrenamiento | Calibration split, n=640 decisiones | Accuracy | 0,6234 |
| Quick-eval en entrenamiento | Calibration split, n=640 decisiones | NLL | 1,2755 |
| Progreso de entrenamiento | Calibration split (step 200 → final) | Accuracy | 0,473 → 0,623 |
| Perdida de entrenamiento | Train | Loss | 1,33 → ~0,4 |
| Informe original, arm B | Test, 5.214 decisiones (pipeline de evaluacion distinto) | Accuracy | 0,7518 |
| Informe original, arm B | Test, tras temperature scaling | ECE | 0,0154 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. El propio autor advierte de que el 0,6234 de accuracy es un *quick-eval* sobre una submuestra de calibracion y no es comparable con el arnes de test de 5.214 decisiones del informe de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB para el modelo base en fp16, 0,6 GB en int8 y 0,35 GB en int4, mas el coste de la KV cache segun el contexto efectivo. Los adaptadores LoRA anaden una cantidad marginal de memoria (r=16 sobre siete proyecciones).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM. El entrenamiento documentado se realizo en `a100-large`.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en RTX 3060, RTX 4060, RTX 3090, RTX 4090 y similares, e incluso en GPUs integradas o CPU para inferencia por lotes pequenos.
- Opciones de despliegue: PEFT + transformers es la via documentada por el autor. Caben tambien vLLM (con soporte de adaptadores LoRA), TGI y llama.cpp/Ollama previa conversion del modelo base a GGUF. No se documentan estas vias en la model card.
- Latencia y throughput estimados: no disponibles. Como referencia de coste, el entrenamiento completo de 5.742 pasos con batch 16 y `max_len` 1024 requirio 37 minutos y 21 segundos en una A100.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Resultado documentado |
|---|---|---|---|---|---|
| `abidlabs/jev-typed-decisions-causal-0.6b` | 596,0 M base + LoRA r=16 | No disponible (entrenado a 1024) | Apache 2.0 | Scorer causal de decisiones tipadas (arm B) | Acc 0,6234 / NLL 1,2755 en cal (n=640); 0,7518 acc en test segun el informe de referencia |
| `Qwen/Qwen3-0.6B-Base` | 596,0 M | No disponible en la informacion proporcionada | Apache 2.0 | Transformer decoder denso generalista | No disponible como scorer de decisiones tipadas |
| Modelo "Jev" citado en la model card | No disponible | No disponible | No disponible | Enfoque de scoring similar, referencia estilistica | No disponible |
| `pngwn/typed-decisions-causal-experiment` (arm B del informe) | No disponible | No disponible | No disponible | Receta original reproducida | Accuracy 0,7518 en test; ECE 0,0154 tras temperature scaling |

No se dispone de datos suficientes sobre otras alternativas equivalentes de scoring tipado en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo de uso general: su salida util es una distribucion restringida sobre tokens de letra, no texto libre.
- El autor advierte explicitamente de que las metricas de la model card proceden de un *quick-eval* interno sobre una submuestra de calibracion (n=640) y no del arnes de test de 5.214 decisiones con temperature scaling del informe de referencia; la comparacion directa entre ambos numeros no es valida.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero si existe riesgo de asignar alta probabilidad a una opcion incorrecta cuando el prompt de decision se aleja de la distribucion del corpus `pngwn/typed-decisions-v2`.
- Sesgos conocidos: no disponibles. El corpus de entrenamiento y su composicion no se detallan mas alla del recuento de estados y decisiones.
- Limitaciones de contexto e idioma: no disponibles. El entrenamiento se realizo con `max_len` 1024, por lo que el comportamiento mas alla de esa longitud no esta validado.
- Restricciones de licencia: Apache 2.0, que permite uso comercial, pero al tratarse de adaptadores sobre `Qwen/Qwen3-0.6B-Base` se deben respetar tambien los terminos del modelo base.
- Caveats para produccion: el modelo esta congelado en una cabeza LM restringida a letras, de modo que solo funciona con esquemas de decision compatibles con `" A"`..`" Z"`. El repositorio tiene 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad. No hay pipeline declarado ni idiomas documentados.
- La fecha de creacion y actualizacion registrada (2026-09-21) debe verificarse contra la fuente original antes de citarla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abidlabs/jev-typed-decisions-causal-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/pngwn/typed-decisions-v2
- Informe del experimento de referencia (arm B): https://huggingface.co/datasets/pngwn/typed-decisions-causal-experiment/blob/main/REPORT.md
- Panel de metricas de entrenamiento (Trackio): https://huggingface.co/spaces/abidlabs/jev-typed-decisions-causal-0-6b-trackio

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos correspondian a dominios ajenos al contenido solicitado y se han descartado.
