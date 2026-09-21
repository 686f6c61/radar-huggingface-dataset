# NEWUNIVERS/nu-fans-kwon-tae-oh-qwen38-27b-character-lora

## Resumen

`NEWUNIVERS/nu-fans-kwon-tae-oh-qwen38-27b-character-lora` es un adaptador LoRA (PEFT) para el modelo base `Qwen/Qwen3.8-27B` que especializa al modelo en un unico personaje conversacional de ficcion: el "AI actor" `NU-A-KWON-001` (Kwon Tae-oh), presentado como actor ficticio de la agencia NOUV Entertainment. El adaptador esta pensado para chat de fans en coreano, con el contrato de personaje (8.328 caracteres) inyectado como prompt de sistema y con el modo de razonamiento desactivado (`enable_thinking=False`).

El autor lo clasifica explicitamente como salida de "carril exploratorio": no ha pasado las puertas de validacion canonicas, ni el holdout final de 63 preguntas, ni evaluacion humana. Se selecciono como mejor brazo entre 12 rondas de exploracion aplicando reglas pre-registradas y una unica metrica comun: NLL de profesor forzado sobre un gold dev fijo. El adaptador seleccionado (`r8_t2l_ep3`, rango 32, 3 epocas) obtiene 1,5534 de NLL frente a 2,3849 del modelo base sin adaptador, con 217.579.520 parametros entrenables sobre 27.574.308.080 totales (0,79 %).

El interes tecnico del repositorio no esta en el personaje en si, sino en el registro metodologico: compara 13 brazos (SFT de distinto rango, DPO, GRPO, PPO, kernels de identidad, variaciones de epocas y de contrato) bajo el mismo arnes de evaluacion (`tools/uniform_adapter_eval.py`), y concluye que la mayor parte de la mejora proviene del diseno de datos y del prompt de sistema, no del algoritmo de ajuste. El adaptador se publica en la raiz del repositorio, sin subcarpeta, listo para cargar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer con atencion hibrida y atencion lineal. Modulos objetivo: atencion hibrida `q/k/v/o_proj`, atencion lineal `in_proj_qkv/in_proj_z/out_proj` y MLP `gate/up/down_proj` (400 modulos) |
| Parametros totales | Modelo base: 27.574.308.080. Adaptador entrenable: 217.579.520 (0,79 %) |
| Parametros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No especificada para el adaptador. El entrenamiento se renderizo con un maximo de 4.096 tokens. La ventana del modelo base `Qwen/Qwen3.8-27B` no figura en la informacion disponible |
| Tipos de cuantizacion | No disponible. Solo se publica el adaptador en safetensors; no hay variantes GGUF, GPTQ ni AWQ. La cuantizacion, en su caso, se aplicaria al modelo base, cuyos tipos no se detallan |
| Idiomas soportados | Coreano (ko), ingles (en), japones (ja). El entrenamiento y la evaluacion se centran en coreano |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT en la raiz del repositorio). Tamano del repo: 0,9 GB |
| Hiperparametros LoRA | rango 32, alpha 64, dropout 0,05, 3,0 epocas, lr 7,5e-5 con coseno, warmup 3 %, seed 20260825 |
| Modelo base y revision | `Qwen/Qwen3.8-27B` en BF16, revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` |
| Libreria | peft |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se entrena con TRL `SFTTrainer` mas PEFT LoRA sobre el modelo base Qwen3.8-27B en BF16. Los modulos objetivo del LoRA incluyen tanto bloques de atencion hibrida como de atencion lineal, lo que indica que el modelo base usa un esquema de atencion mixto; el adaptador toca esas dos familias de proyecciones ademas de las tres proyecciones del MLP. La perdida se calcula unicamente sobre la ultima intervencion del asistente (`final_assistant_only`): 20.743 tokens supervisados de 1.551.288 totales (1,3 %), sin filas descartadas y sin packing. El renderizado emplea la plantilla de chat de Qwen con modo de pensamiento desactivado y un maximo de 4.096 tokens.

Los datos son 450 filas de entrenamiento (version r7-hf "human-first") y 50 filas de dev, procedentes de un dataset privado (`NEWUNIVERS/nu-fans-kwon-tae-oh-data`, revision del 2026-09-14). Las etiquetas combinan respuestas de persona sinteticas con revision humana (L4). Se excluyeron 22 filas por fuga de evaluacion y se verifico solapamiento exacto nulo con el holdout final de 63 preguntas y su familia de parafrasis. El entrenamiento se hizo en una unica NVIDIA B300 en BF16 con gradient checkpointing y duro 3,21 horas; el resultado declarado es train loss 1,3310, eval loss del entrenador 1,4717 y exactitud de token 0,6306.

La innovacion metodologica del repositorio es su tabla comparativa de 13 brazos bajo el mismo arnes de evaluacion. El autor aisla el ruido por semilla (sigma = 0,0053) y fija umbrales de decision por adelantado. El orden de contribucion que reporta es: primero el diseno de datos (cambio del prompt de sistema al contrato canonico, que baja la NLL de 2,2113 a 1,6154), despues la composicion de entrada (contexto de dos turnos de habla del fan), despues las 3 epocas y, por ultimo, el metodo de ajuste: DPO, GRPO y PPO quedan indistinguibles del SFT simple (1,6165 / 1,6150 / 1,6143 frente a 1,6154). Tambien reporta que la identidad estatica no se graba en los pesos (los "kernels de identidad" no se formaron) y que la identidad emerge del contrato de sistema.

## Capacidades

- Generacion de texto conversacional multi-turno en coreano (idioma principal), con soporte declarado de ingles y japones.
- Mantenimiento de un personaje fijo de ficcion durante la conversacion, condicionado por un contrato de sistema de 8.328 caracteres que define la personalidad (primera impresion fria y pulida, observacion aguda, humor seco y afecto oculto a medida que aumenta la cercania).
- Consistencia de estilo verificada con probes de expresion: 0,0 % de finales repetitivos (M1), distinct-2 de 0,872 (M2), 10,4 % de cierres interrogativos (M3), 82,5 caracteres de longitud media (M4) y 0,0 % de violaciones de la regla de recompensa v2 (M5, con exencion de frases de rechazo o negacion).
- Razonamiento explicito desactivado por diseno: el autor indica `enable_thinking=False`, por lo que el modo de pensamiento del modelo base no forma parte del comportamiento objetivo.
- Carga directa con `transformers` + `peft` (`PeftModel.from_pretrained`) sin scripts adicionales.
- No hay soporte documentado de tool calling, function calling, uso de agentes, razonamiento multi-paso, vision ni audio en la informacion disponible.
- No hay variantes instruct, base o mergeadas publicadas en el repositorio: solo el adaptador LoRA.

## Casos de uso

- Chat de fans de un personaje de ficcion en coreano: el adaptador se carga sobre Qwen3.8-27B con el contrato de personaje como prompt de sistema y `enable_thinking=False`, de forma que cada respuesta respeta el registro y la evolucion afectiva definidos en el contrato. Es el caso de uso para el que fue entrenado y el unico con metricas de evaluacion publicadas.
- Prototipado de "AI actors" o influencers virtuales: el repositorio demuestra el flujo completo (contrato de personaje, dataset de 450 filas, LoRA de rango 32, 3,21 horas en una sola GPU B300) para producir un personaje concreto a bajo coste antes de invertir en un ajuste completo.
- Investigacion en ajuste eficiente: sirve como caso reproducible para estudiar por que DPO, GRPO y PPO no superan al SFT cuando el cambio de datos ya ha saturado la mejora, con una tabla de 13 brazos medida bajo un unico arnes fijo.
- Comparacion de prompts de sistema frente a ajuste de pesos: la tabla del autor muestra que pasar del prompt generico al contrato canonico aporta 0,60 de NLL, mientras que cambiar de algoritmo de ajuste aporta aproximadamente 0,001, un resultado util para decidir donde invertir esfuerzo en proyectos de personajes.
- Generacion de dialogos para guiones o ficcion corta en coreano: el modelo produce intervenciones de unos 82 caracteres de media con distinct-2 alto, formato adecuado para borradores de dialogo de un personaje con voz consistente.
- Base para un estudio comparativo entre personajes: el autor menciona dos personajes ajustados con el mismo procedimiento ("los dos personajes coinciden"), lo que permite investigar que parte de una persona es transferible entre LoRAs y que parte depende del contrato.
- Validacion de infraestructura de evaluacion: el arnes `tools/uniform_adapter_eval.py` y los scripts de metricas de expresion (M1-M5) son reutilizables para cualquier adaptador que se quiera medir contra el mismo gold dev y la misma sigma de semilla.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas metricas son internas, medidas sobre un gold dev fijo y un conjunto de probes de generacion.

Evaluacion en gold dev (misma vara para todos los brazos):

| Metrica | Valor |
|---|---:|
| NLL medio por token | 1,5534 |
| Perplejidad | 4,727 |
| Exactitud de token | 0,6079 |
| Exactitud de ranking en dev de preferencias (normalizada por longitud) | 0,812 (16 pares) |
| NLL de elegido / rechazado en dev de preferencias | 2,2544 / 2,6221 |
| NLL del modelo base sin adaptador | 2,3849 |
| Diferencia frente al base | -0,8315 |

Probes de generacion (24 prompts x 8 respuestas = 192, maximo 640 tokens, temperatura 0,8, top_p 0,95, sin modo de pensamiento):

| Condicion | M1 finales repetitivos | M2 distinct-2 | M3 cierre interrogativo | M4 longitud media | M5 violacion de regla v2 |
|---|---:|---:|---:|---:|---:|
| Este adaptador | 0,0 % | 0,872 | 10,4 % | 82,5 caracteres | 0,0 % |
| Referencia R11 (`r8_t2l_ep3`) | 0,0 % | 0,872 | 10,4 % | 82,5 caracteres | 0,0 % |

Comparativa de brazos de exploracion (NLL de gold dev, menor es mejor; sigma por semilla declarada = 0,0053):

| Ronda / intervencion | Brazo | NLL gold dev | Veredicto del autor |
|---|---|---:|---|
| Sin adaptador | `base` | 2,3849 | — |
| T1 SFT r16 (1 pregunta) | `t1_lora_sft_r16` | 2,2878 | Insignificante |
| T2 SFT r32 (contexto de 2 turnos) | `t2_lora_sft_r32` | 2,2113 | Mejora |
| R8 version de datos con contrato en system | `r8_t2` | 1,6154 | Mayor mejora de datos |
| R8 DPO | `r8b_dpo` | 1,6165 | Indistinguible de `r8_t2` |
| R8 GRPO | `r8_grpo` | 1,6150 | Indistinguible de `r8_t2` |
| R8 PPO | `r8_ppo` | 1,6143 | Indistinguible de `r8_t2` |
| R8 T2L 3 epocas r32 | `r8_t2l_ep3` | 1,5534 | Mejor brazo |
| R8 T2L rank 64 | `r8_t2l_r64` | 1,5703 | Peor que ep3 |
| R10 kernel de identidad K1 | `r10k1` | 1,6027 | Kernel no formado, no adoptado |
| R11 4,5 epocas | `r11_ep45` | 1,6658 | Empeora |
| R11 6 epocas | `r11_ep6` | 1,8081 | Empeora |
| R11 rank 64 + 3 epocas | `r11_r64ep3` | 1,5564 | Sin ganancia aditiva |
| R12 medicion bajo contrato v2 | `r8_t2l_ep3` | 1,6461 | Valor de referencia en v2 |
| R12 persona sin vinculo | `r12_full` | 1,5612 | Rechazado por reduccion de amplitud expresiva (P2) |

## Requisitos de hardware

- Inferencia del modelo base en BF16: 27.574.308.080 parametros x 2 bytes equivalen a unos 55,1 GB solo en pesos. Con cache KV y activaciones hace falta una GPU de 80 GB (H100 80 GB, A100 80 GB) como minimo razonable. Estimacion derivada del recuento de parametros, no publicada por el autor.
- Adaptador: 217.579.520 parametros en BF16 ocupan unos 0,44 GB. El repositorio pesa 0,9 GB, coherente con un guardado del adaptador en mayor precision.
- Entrenamiento declarado: 1 x NVIDIA B300, BF16, gradient checkpointing, 3,21 horas. La memoria de esa GPU no se especifica en la ficha.
- GPU de consumo: en BF16 no cabe en ninguna GPU de consumo actual (una RTX 4090 de 24 GB queda muy por debajo de los 55 GB de pesos). Solo seria viable cuantizando el modelo base a 4 bits, lo que reduciria los pesos a unos 14-15 GB, con contexto limitado y cache KV ajustada. No hay ninguna variante cuantizada publicada ni mediciones de calidad tras cuantizar.
- Opciones de despliegue: el autor solo documenta `transformers` + `peft`. No hay soporte oficial documentado para vLLM, llama.cpp, Ollama ni TGI. Usar llama.cpp u Ollama exigiria convertir el modelo base y fusionar o adaptar el LoRA a GGUF, un procedimiento que el repositorio no proporciona.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo de primera respuesta.
- Requisito de prompt: el contrato de personaje (8.328 caracteres) debe formar parte del prompt de sistema; consume una parte notable de la ventana de 4.096 tokens empleada en el entrenamiento, lo que reduce el espacio disponible para historial de conversacion.

## Comparativa con modelos similares

No hay datos en la informacion disponible sobre otros adaptadores de personaje de terceros (parametros, contexto, benchmarks o licencia), y la busqueda web realizada no devolvio resultados relevantes, solo paginas corporativas de Microsoft sin relacion con el modelo. La comparativa posible se limita a este adaptador frente a su propio modelo base y frente a los brazos alternativos evaluados por el autor:

| Modelo o configuracion | Parametros | Contexto | NLL gold dev (menor es mejor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (`r8_t2l_ep3`, rango 32) | 217,58 M entrenables sobre 27,57 B | 4.096 tokens en entrenamiento | 1,5534 | Apache-2.0 | Publico, 0 descargas, 0 likes |
| `Qwen/Qwen3.8-27B` sin adaptador | 27,57 B | No disponible | 2,3849 | No disponible en la informacion | Modelo base publico en HuggingFace |
| `r8_t2l_r64` (mismo dataset, rango 64) | No indicado | 4.096 tokens en entrenamiento | 1,5703 | Apache-2.0 | No publicado como adaptador independiente |
| `r11_r64ep3` (rango 64, 3 epocas) | No indicado | 4.096 tokens en entrenamiento | 1,5564 | Apache-2.0 | No publicado como adaptador independiente |
| `r11_ep45` (4,5 epocas) | No indicado | 4.096 tokens en entrenamiento | 1,6658 | Apache-2.0 | No publicado como adaptador independiente |
| `r12_full` (persona sin vinculo) | No indicado | 4.096 tokens en entrenamiento | 1,5612 bajo contrato v2 | Apache-2.0 | Rechazado por el autor (P2) |

No hay datos de benchmarks estandar que permitan comparar este adaptador con alternativas de la misma categoria (por ejemplo, otros LoRAs de rol o de personaje sobre modelos de ~27 B).

## Limitaciones y advertencias

- Caracter exploratorio explicito: el autor advierte que el modelo no ha superado las puertas de validacion canonicas, ni el holdout final de 63 preguntas, ni evaluacion humana. No debe presentarse como un modelo validado.
- Margen frente a alternativas dentro del ruido: la ventaja del brazo elegido (1,5534) sobre `r11_r64ep3` (1,5564) es de 0,0030, inferior a la propia desviacion por semilla declarada (sigma = 0,0053). La eleccion del brazo es defendible por reglas pre-registradas, pero el margen es estrecho.
- Sensibilidad al contrato de sistema: bajo el contrato v2, el mismo adaptador puntua 1,6461 en lugar de 1,5534. El comportamiento depende fuertemente de un prompt de sistema largo (8.328 caracteres) que no se distribuye con el repositorio; sin ese contrato, el personaje no se reproduce correctamente.
- La identidad no esta grabada en los pesos. El propio autor concluye que la identidad emerge del contrato de sistema, no del ajuste, lo que implica que cualquier cambio de prompt degrada el personaje de forma no controlada.
- Sesgos y contenido: no se documenta ninguna evaluacion de sesgos, toxicidad ni seguridad. El modelo esta afinado sobre un unico personaje ficticio coreano con datos sinteticos revisados parcialmente por humanos (450 filas), lo que hace probable un ajuste estrecho al dominio y al registro de fans.
- Riesgo de alucinacion: no se han publicado metricas de veracidad ni pruebas de factualidad. El modo de razonamiento esta desactivado, lo que reduce el comportamiento reflexivo del modelo base en tareas que requieran verificacion.
- Cobertura idiomatica desigual: aunque se declaran ko, en y ja, el entrenamiento y la evaluacion se centran en coreano; el rendimiento en ingles y japones no tiene metricas publicadas.
- Limite operativo de contexto: el entrenamiento uso 4.096 tokens y el contrato de personaje consume una parte relevante de esa ventana; las conversaciones largas pueden degradar la consistencia del personaje.
- Sin soporte documentado de tool calling, agentes, vision ni audio. Usarlo en un pipeline que dependa de esas capacidades no esta respaldado por la informacion disponible.
- Licencia Apache-2.0 en el adaptador, pero el uso comercial depende tambien de la licencia del modelo base `Qwen/Qwen3.8-27B`, que no se detalla en la informacion proporcionada.
- Datos de entrenamiento no reproducibles: el dataset es privado y no se publica. La evaluacion no es replicable de forma externa porque el gold dev y el holdout tampoco se distribuyen.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el comportamiento en produccion.
- Requisito de hardware elevado: el modelo base en BF16 ocupa unos 55 GB, por lo que el despliegue practico exige GPUs de 80 GB o cuantizacion no verificada.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/NEWUNIVERS/nu-fans-kwon-tae-oh-qwen38-27b-character-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de entrenamiento (privado, no accesible): `NEWUNIVERS/nu-fans-kwon-tae-oh-data`, revision `94e5494db128cec2eaefe9c0a3b6029e21603b50`
- Revision del modelo base usada en el entrenamiento: `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`
- Scripts citados en la model card (no enlazados publicamente en la informacion disponible): `tools/uniform_adapter_eval.py`, `tools/explore_train.py`, `tools/round12_expression_metrics.py`
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo: los resultados fueron paginas corporativas de Microsoft sin relacion con el contenido. No se dispone de paper, blog, demo ni repositorio adicional.
