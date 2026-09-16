# aestudio/Olmo-3-7B-Instruct-DPO-GRPO-math-lora

## Resumen

Este repositorio publica un adaptador LoRA entrenado sobre `allenai/Olmo-3-7B-Instruct-DPO`, un modelo denso de 7.000 millones de parametros de la familia Olmo 3 de Ai2. El autor, aestudio, aplica aprendizaje por refuerzo con recompensa verificable (GRPO/RLVR) sobre el conjunto de datos DeepMath-103K para mejorar el razonamiento matematico del checkpoint DPO de partida, sin reentrenar los pesos completos. El resultado declarado es una recuperacion del 78,1 % de la diferencia de rendimiento entre el checkpoint DPO y el checkpoint RLVR oficial de Ai2 (`allenai/Olmo-3-7B-Instruct`), medido sobre 1.000 problemas de DeepMath no vistos durante el entrenamiento (pass@1 de 0,4850 a 0,6597).

Se trata de un adaptador, no de un modelo fusionado: requiere descargar el modelo base y cargarlo con PEFT, y su peso es de aproximadamente 1,2 GB en bf16 sobre un repositorio de 1,3 GB. La relevancia practica del artefacto es doble: por un lado demuestra que una receta RLVR completa puede reproducirse con LoRA sobre un modelo abierto de 7B en 15,4 horas sobre 8xH200; por otro, documenta un problema grave de compatibilidad en `transformers`, ya que las versiones 5.0 a 5.12 aplican el escalado YaRN de RoPE a las 32 capas del modelo en lugar de solo a las 8 capas de atencion completa, lo que desplaza la salida del modelo 1,17 nats/token respecto a la que sirve vLLM.

La informacion disponible no incluye datos sobre licencia, idiomas soportados, longitud de contexto del modelo base ni evaluaciones de codigo, multilingue o seguridad. La evaluacion de retencion de capacidades se limita a instrucciones (IFEval estricto) y razonamiento de opcion multiple (ARC-Challenge).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion de ventana deslizante y atencion completa alternadas (32 capas, 8 de atencion completa segun la model card); adaptador LoRA sobre el modelo base |
| Parametros totales | 7.000 millones en el modelo base; el adaptador LoRA anade r=128, alpha=256, all-linear, bf16 (~1,2 GB) |
| Parametros activos | No aplica (arquitectura densa; la informacion no describe ningun esquema MoE) |
| Longitud de contexto | No disponible (la model card menciona escalado YaRN de RoPE, pero no indica la ventana maxima) |
| Tipos de cuantizacion | El adaptador se publica en bf16 (safetensors). No se listan cuantizaciones oficiales GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible en los metadatos de HuggingFace ni en la model card; hay que consultar la licencia del modelo base |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), libreria `peft` |
| Modelo base | allenai/Olmo-3-7B-Instruct-DPO |
| Version de transformers requerida | >= 5.13 (obligatorio; ver advertencias) |
| Stack de entrenamiento y evaluacion | vllm 0.28.0, transformers 5.17.0, trl 1.13.0, peft 0.20.0, torch 2.13.0+cu130 |
| Tamano del repositorio | 1,3 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador se entrena con GRPO (implementado en TRL 1.13 con un motor vLLM 0.28 colocado en el mismo nodo), usando la perdida DAPO a nivel de token con beta = 0 y epsilon de 0,2 / 0,28. La recompensa es puramente verificable: 1,0 si la respuesta final dentro de `\boxed{}` coincide con la solucion de referencia bajo `math_verify`, y 0,0 en caso contrario. No hay modelado de formato ni termino de longitud, y las completaciones truncadas se dejan sin enmascarar puntuando cero. El adaptador usa LoRA con r=128, alpha=256, dropout 0, aplicado a todas las capas lineales en bf16; el optimizador es de learning rate constante 1e-5 con ventajas sin escalar. Los rollouts son de 64 prompts por 8 muestras = 512 por generacion, con temperatura 1,0, top_p 1,0 y un limite de 8.192 tokens. El entrenamiento completo abarca 150 generaciones = 76.800 rollouts y 600 pasos de optimizador, en 15,4 horas sobre 8xH200.

Los datos proceden de DeepMath-103K, descontaminado contra 22 corpus publicos de preentrenamiento e instruccion; se vieron 9.600 problemas, cada uno exactamente una vez. La receta sigue el script RL publicado por Ai2 en `open-instruct` para este checkpoint, sustituyendo el ajuste completo por LoRA. La innovacion tecnica mas relevante del repositorio no esta en el metodo sino en el diagnostico del pipeline de inferencia: la model card documenta que las versiones 5.0 a 5.12 de `transformers` aplican el escalado YaRN de RoPE a las 32 capas del modelo, mientras que vLLM, OLMo-core y el paper de Olmo 3 lo aplican solo a las 8 capas de atencion completa. La divergencia resultante es de 1,17 nats/token entre el forward de HF y el muestreo de vLLM, con un 32 % de tokens desviados mas de un nat y un error que crece con la posicion. El autor mantiene una verificacion de acuerdo entrenador-muestreador que se sostuvo en 0,011 nats/token durante las 150 generaciones.

## Capacidades

- Razonamiento matematico de multiples pasos con respuesta final en formato `\boxed{}`, entrenado especificamente para que la solucion sea verificable de forma automatica.
- Generacion de texto conversacional y de instrucciones (el modelo base es un checkpoint Instruct+DPO; el adaptador conserva IFEval estricto en 0,7671 frente a 0,7731 del base, con un intervalo de confianza que incluye el cero).
- Razonamiento de opcion multiple no matematico: ARC-Challenge mejora de 0,6259 a 0,6681 con un delta pareado de +0,0422 [+0,0256, +0,0580].
- Control de formato: la tasa de fuga de `\boxed{}` en prompts no matematicos es de 0,002 (frente a 0,003 en el base), la ratio de longitud de respuesta es 1,01x y la tasa de degeneracion es 0.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-turno con herramientas: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se ha publicado ninguna evaluacion por idioma.
- Capacidades especiales (modo thinking explicito, vision, audio): no disponible; la model card no describe ninguna.
- Generacion de codigo: no evaluada; la evidencia de retencion solo cubre IFEval y ARC-Challenge.

## Casos de uso

- Evaluacion comparativa de checkpoints en matematicas: el adaptador esta disenado para medirse de forma pareada sobre el mismo conjunto de problemas que el modelo base, con pass@1 a temperatura 0,6 y n=4; resulta util como referencia intermedia en estudios de escalado de RLVR.
- Generacion de datos sinteticos de razonamiento matematico: al puntuar con `math_verify` y exigir respuesta en `\boxed{}`, las salidas se pueden filtrar automaticamente y reutilizar para destilar modelos mas pequenos o para aumentar un corpus de entrenamiento sin supervision humana.
- Reproduccion de recetas RLVR con recursos limitados: el adaptador demuestra que un LoRA de ~1,2 GB sobre un 7B permite aproximar el comportamiento de un checkpoint RLVR completo, lo que abarata la experimentacion con hiperparametros de GRPO.
- Tutoria y resolucion de problemas paso a paso: el modelo produce cadenas de razonamiento de hasta 8.192 tokens, adecuadas para explicar procedimientos, siempre que la respuesta final se valide con un verificador externo antes de mostrarla al usuario.
- Investigacion sobre atencion con RoPE y divergencias entre motores de inferencia: el repositorio documenta un caso reproducible de discrepancia de 1,17 nats/token entre HF y vLLM, util para equipos que validan pipelines de servicio.
- Estudio de retencion de capacidades tras RL: los datos de IFEval y ARC-Challenge permiten analizar si una recompensa de formato estricto degrada el seguimiento de instrucciones, un fallo comun en RLVR.
- Base para experimentos de ablacion sobre adaptadores: al ser un adaptador separado, se puede activar y desactivar para comparar el mismo modelo base con y sin el ajuste de matematicas en el mismo endpoint.
- Preprocesado y validacion de problemas matematicos en pipelines de datos: el modelo puede usarse para comprobar si un enunciado es resoluble y si la solucion de referencia almacenada es consistente con la respuesta generada.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre 1.000 problemas de DeepMath reservados, nunca vistos en entrenamiento, n=4 a temperatura 0,6, con intervalos de confianza bootstrap sobre problemas identicos:

| Modelo | pass@1 | Delta pareado vs base | % del hueco DPO -> RLVR |
|---|---:|---|---:|
| `Olmo-3-7B-Instruct-DPO` (base) | 0,4850 | — | 0 % |
| Este adaptador | 0,6597 | +0,1747 [+0,1560, +0,1935] | 78,1 % |
| `Olmo-3-7B-Instruct` (RLVR, referencia) | 0,7087 | +0,2237 [+0,2025, +0,2443] | 100 % |

El adaptador queda a -0,0490 [-0,0653, -0,0317] del checkpoint RLVR publicado. La curva seguia subiendo al detenerse el entrenamiento (generacion 150 frente a 120: +0,0210 [+0,0062, +0,0355]), pero con desaceleracion: 0,51, 0,49 y 0,31 puntos de hueco por generacion en las ultimas tres ventanas.

Retencion de capacidades generales, evaluadas de forma programatica sin juez LLM:

| Modelo | IFEval (estricto) | Delta pareado | ARC-Challenge | Delta pareado |
|---|---:|---|---:|---|
| Base (DPO) | 0,7731 | — | 0,6259 | — |
| RLVR (referencia) | 0,8198 | +0,0467 | 0,6517 | +0,0258 |
| Este adaptador | 0,7671 | -0,0060 [-0,0185, +0,0069] | 0,6681 | +0,0422 [+0,0256, +0,0580] |

El autor advierte que estas cifras son n=4 a temperatura 0,6 y no greedy n=1, por lo que no son comparables con puntuaciones publicadas en leaderboards: solo sirven para comparar estos checkpoints entre si. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador ocupa ~1,2 GB en bf16, pero requiere cargar el modelo base de 7B; la VRAM viene determinada por el base mas la cache KV.
- VRAM estimada para inferencia del modelo base con el adaptador: ~16-18 GB en bf16 con contexto moderado; ~10-12 GB en cuantizacion de 8 bits; ~6-8 GB en cuantizacion de 4 bits (estimaciones derivadas del tamano del modelo, no publicadas por el autor).
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S 48 GB, RTX 4090 24 GB y RTX 3090 24 GB. El entrenamiento se realizo sobre 8xH200.
- Cabe en GPU de consumo: si, en RTX 4090 o RTX 3090 (24 GB) en bf16 sin contexto muy largo, y en GPUs de 12-16 GB con cuantizacion. En tarjetas de 8 GB solo con cuantizaciones agresivas de 4 bits.
- Opciones de despliegue: vLLM >= 0.28 (es el motor usado en entrenamiento y evaluacion), `transformers` >= 5.13 con PEFT para cargar el adaptador directamente, y cualquier stack que permita fusionar el adaptador con el base y exportar a GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles. El unico dato de rendimiento temporal es el entrenamiento: 15,4 horas sobre 8xH200 para 76.800 rollouts con un limite de 8.192 tokens por completacion.

## Comparativa con modelos similares

Comparativa de los tres checkpoints medidos en la model card sobre el mismo conjunto de 1.000 problemas de DeepMath:

| Modelo | Parametros | Tipo | pass@1 DeepMath | IFEval estricto | ARC-Challenge | Licencia |
|---|---|---:|---:|---:|---:|---|
| Este adaptador | 7B + LoRA r=128 | Adaptador PEFT | 0,6597 | 0,7671 | 0,6681 | no disponible |
| `allenai/Olmo-3-7B-Instruct-DPO` | 7B | Modelo completo | 0,4850 | 0,7731 | 0,6259 | no disponible en la informacion |
| `allenai/Olmo-3-7B-Instruct` (RLVR) | 7B | Modelo completo | 0,7087 | 0,8198 | 0,6517 | no disponible en la informacion |

Frente a alternativas de otras familias con orientacion matematica de tamano similar, como DeepSeek-R1-Distill-Qwen-7B o Qwen2.5-Math-7B, no hay datos comparables en la informacion disponible: no se han evaluado sobre el mismo conjunto ni con el mismo protocolo, por lo que no se puede establecer una comparacion numerica fiable.

## Limitaciones y advertencias

- Recupera el 78 % del hueco, no el 100 %: no es un sustituto directo del checkpoint RLVR oficial (`allenai/Olmo-3-7B-Instruct`) y queda 0,0490 puntos por debajo en pass@1.
- Ambito exclusivamente matematico: la evidencia de retencion solo cubre seguimiento de instrucciones y razonamiento de opcion multiple. No hay evaluacion de calidad abierta, multilingue, codigo ni seguridad.
- Evaluado dentro de la propia distribucion de DeepMath: no se midio rendimiento en matematicas de competicion ni fuera de distribucion.
- Es un adaptador, no un modelo: requiere el modelo base `allenai/Olmo-3-7B-Instruct-DPO` y la libreria PEFT para funcionar.
- Riesgo critico de version: con `transformers` 5.0 a 5.12 el adaptador se evalua silenciosamente como un modelo distinto, porque el escalado YaRN de RoPE se aplica a las 32 capas en lugar de a las 8 de atencion completa (1,17 nats/token de divergencia respecto a vLLM). Es obligatorio usar `transformers` >= 5.13 (corregido en 5.13.0). El autor recomienda comprobar que el forward de HF y un muestreador de vLLM >= 0.28 coincidan en torno a 0,01 nats/token sobre los mismos tokens.
- Si no se puede actualizar la version, hay que aplicar manualmente el escalado por capa: RoPE estandar (mismo theta, factor de escala 1,0) en las capas de ventana deslizante y YaRN en las de atencion completa.
- Dependencia de verificador externo: el modelo esta entrenado para emitir la respuesta final dentro de `\boxed{}`, y esa respuesta debe validarse con `math_verify` o equivalente. La tasa de fuga de ese formato en prompts no matematicos es baja (0,002) pero no nula.
- Protocolo de evaluacion no comparable con leaderboards: n=4 a temperatura 0,6 en lugar de greedy n=1.
- Licencia no declarada: antes de cualquier uso comercial hay que verificar la licencia del modelo base y la del propio adaptador, ausente en los metadatos y en la model card.
- Idiomas soportados no declarados: no hay garantia documentada de comportamiento fuera del ingles.
- Sesgos conocidos: no disponibles; la model card no incluye ninguna evaluacion de sesgo, toxicidad o seguridad.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; en tareas de razonamiento matematico el modelo puede producir cadenas plausibles con respuestas finales incorrectas, de ahi la necesidad de verificacion automatica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aestudio/Olmo-3-7B-Instruct-DPO-GRPO-math-lora
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Instruct-DPO
- Checkpoint RLVR de referencia de Ai2: https://huggingface.co/allenai/Olmo-3-7B-Instruct
- Dataset DeepMath-103K: https://huggingface.co/datasets/zwhe99/DeepMath-103K
- Issue de transformers sobre el escalado YaRN por capas: https://github.com/huggingface/transformers/issues/39847
- Pull request de correccion (5.13.0): https://github.com/huggingface/transformers/pull/46911
- Script RL de Ai2 (open-instruct): https://github.com/allenai/open-instruct
- Resultados de busqueda web: no se encontro ningun resultado relevante; los enlaces devueltos corresponden a directorios de videojuegos de codigo abierto y no guardan relacion con este modelo.
