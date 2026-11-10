# amd/Qwen3.8-27B-Quark-DFlash2

## Resumen

Qwen3.8-27B-Quark-DFlash2 es un modelo borrador (draft model) para decodificacion especulativa, publicado por AMD y disenado para acelerar la inferencia de Qwen/Qwen3.8-27B. No es un modelo de proposito general: su unica funcion es proponer tokens candidatos que el modelo objetivo verifica en paralelo, reduciendo el coste por token generado. Con aproximadamente 1.270 millones de parametros en bfloat16, es dos ordenes de magnitud menor que el modelo que acelera.

Tecnicamente implementa la arquitectura DFlash2, un esquema de decodificacion especulativa con capas no causales que aprovechan estados intermedios del modelo objetivo (capas 3, 15, 31, 47 y 59) para predecir bloques de 8 posiciones (7 tokens especulativos). El checkpoint se entreno con AMD Quark sobre la mezcla completa de Tulu-3 SFT, con el modo thinking desactivado, durante 3 epocas (17.118 pasos).

Su relevancia es practica: en Spec-Bench con K=7 reporta una longitud de aceptacion de 3,67 tokens y una aceleracion de 2,31x frente a servir el modelo objetivo en solitario. Requiere una build de vLLM con soporte para `DFlash2DraftModel`, por lo que su adopcion esta condicionada a esa integracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2 (draft model de decodificacion especulativa; 5 capas no causales) |
| Parametros totales | 1.269.044.480 (aprox. 1,27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el contexto lo determina el modelo objetivo) |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El borrador consta de 5 capas no causales con dimension oculta 5120, dimension intermedia 8192, 40 cabezas de atencion y 8 cabezas KV, con dimension de cabeza 128. Trabaja con un tamano de bloque de 8 (7 tokens especulativos) e incorpora una convolucion agrupada de kernel 2 y grupo 16, ademas de un selector de candidatos con rango 256 y top-k 16. El modelo toma como entrada los estados de las capas 3, 15, 31, 47 y 59 del modelo objetivo y utiliza el token de mascara con id 248077.

El entrenamiento se realizo con AMD Quark sobre la mezcla completa de Tulu-3 SFT, con el modo thinking desactivado, datos barajados y 3 epocas completas (17.118 pasos); este checkpoint corresponde al final de la tercera epoca. No se documentan fases de RLHF o DPO, algo coherente con la funcion del modelo. Un detalle critico de implementacion: las capas convolucionales forman parte de los pesos entrenados y fijar `conv_kernel_size` a 1 en inferencia rompe el borrador (la longitud de aceptacion cae a 1,79), por lo que no debe modificarse.

## Capacidades

- Generacion especulativa de tokens: propone 7 tokens candidatos por bloque que el modelo objetivo valida en paralelo.
- Aprovechamiento de estados internos del modelo objetivo mediante tapping de capas intermedias (3, 15, 31, 47, 59).
- Seleccion de candidatos con un modulo dedicado (rango 256, top-k 16) para mejorar la tasa de aceptacion.
- Integracion con vLLM mediante el metodo `dflash` y `num_speculative_tokens = 7`.
- No realiza generacion de texto autonoma, razonamiento, codigo ni tool calling por si mismo: hereda las capacidades del modelo objetivo Qwen3.8-27B.
- No dispone de capacidades multimodales, de audio ni de modo thinking propias; el entrenamiento se hizo explicitamente con thinking desactivado.

## Casos de uso

- Servicio de inferencia de alto rendimiento con Qwen3.8-27B: desplegar el par objetivo + borrador en vLLM para obtener hasta 2,31x de aceleracion en Spec-Bench, reduciendo el coste por token en entornos de produccion con alta concurrencia.
- Reduccion de latencia en APIs conversacionales: al aumentar la longitud de aceptacion a 3,67 tokens, disminuye el tiempo hasta el primer bloque de respuesta en chats multi-turno servidos con el modelo objetivo.
- Optimizacion de costes en GPU: al acelerar la decodificacion del modelo de 27B, se necesita menos tiempo de GPU por peticion, lo que permite atender mas trafico con el mismo hardware.
- Evaluacion de tecnicas de decodificacion especulativa: sirve como referencia reproducible para comparar DFlash2 frente a otros esquemas (EAGLE, Medusa, decodificacion especulativa clasica) sobre un mismo modelo objetivo.
- Investigacion en modelos borrador: su arquitectura no causal con convolucion agrupada y selector de candidatos es un objeto de estudio para quienes investigan acceptance length y trade-offs entre tamano del borrador y aceleracion.
- Pipelines de generacion por lotes (batch offline): tareas de sintesis o anotacion a gran escala con Qwen3.8-27B se benefician del mayor throughput agregado que aporta el borrador.
- Integracion en plataformas de serving gestionadas: cualquier stack basado en vLLM con soporte DFlash2 puede incorporar el checkpoint sin cambiar el modelo de negocio ni el modelo objetivo.

## Benchmarks y rendimiento

Resultados publicados en la model card (Spec-Bench, K=7):

| Metrica | Valor |
|---|---|
| Longitud de aceptacion (AL) | 3,67 |
| Aceleracion frente al objetivo solo | 2,31x |
| Aceptacion posicion 0 | 0,781 |
| Aceptacion posicion 1 | 0,568 |
| Aceptacion posicion 2 | 0,415 |
| Aceptacion posicion 3 | 0,312 |
| AL con `conv_kernel_size` = 1 (configuracion rota) | 1,79 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de calidad en la informacion disponible; el modelo no se evalua por calidad de generacion sino por metricas de decodificacion especulativa.

## Requisitos de hardware

- VRAM del borrador: aproximadamente 2,5 GB en bfloat16 (coincide con el tamano del repo); no se han publicado cifras para cuantizaciones alternativas.
- VRAM adicional para el modelo objetivo Qwen3.8-27B: no disponible en la informacion proporcionada.
- GPU recomendadas: no especificadas por el autor; al ser un borrador de 1,27B, la carga adicional sobre la GPU que sirve el modelo objetivo es reducida en terminos de pesos, aunque el coste real depende del modelo de 27B.
- Cabe en GPU consumer: el borrador por si solo si (2,5 GB en bf16), pero el sistema completo requiere alojar tambien el modelo objetivo.
- Opciones de despliegue: vLLM con soporte de `DFlash2DraftModel` y `--speculative-config '{"method": "dflash", ...}'`; no se documenta soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: la model card reporta 2,31x de aceleracion frente al objetivo en solitario; no se publican cifras absolutas de tokens por segundo ni latencias en milisegundos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Aceleracion reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| amd/Qwen3.8-27B-Quark-DFlash2 | Draft DFlash2 | 1,27B | no disponible | 2,31x (Spec-Bench K=7) | no disponible | Hugging Face (0 descargas) |
| EAGLE-3 (draft para modelos de ~7-70B) | Draft autoregresivo con feature fusion | variable, tipicamente 0,5-2B | depende del objetivo | no disponible en esta ficha | variable segun checkpoint | amplia en Hugging Face |
| Medusa heads | Cabezas de decodificacion especulativa | acopladas al objetivo | depende del objetivo | no disponible en esta ficha | variable | integrado en vLLM y TGI |
| Decodificacion especulativa clasica (draft del mismo family) | Draft autoregresivo | variable | depende del objetivo | no disponible en esta ficha | variable | amplia |

No se dispone de datos comparativos directos publicados por el autor frente a EAGLE-3 o Medusa sobre el mismo modelo objetivo; la comparacion anterior es estructural, no de rendimiento medido.

## Limitaciones y advertencias

- No es un modelo de proposito general: no debe usarse para generacion directa, razonamiento o codigo; su salida solo tiene sentido dentro del bucle de decodificacion especulativa de vLLM.
- Dependencia estricta del modelo objetivo Qwen/Qwen3.8-27B y de sus capas 3, 15, 31, 47 y 59; no es portable a otros modelos sin reentrenamiento.
- Requiere una build de vLLM con soporte `DFlash2DraftModel`; en versiones sin ese soporte el checkpoint no es utilizable.
- Modificar `conv_kernel_size` a 1 degrada la longitud de aceptacion de 3,67 a 1,79; la configuracion de inferencia debe respetarse tal cual.
- La aceptacion cae rapidamente por posicion (0,781 en la posicion 0 frente a 0,312 en la posicion 3), por lo que el beneficio real depende de la distribucion de las tareas.
- Entrenado con thinking desactivado: no se ha validado su comportamiento con el modo thinking del modelo objetivo activado.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; debe verificarse antes de desplegarlo en produccion.
- Sin descargas ni likes en el momento de la consulta y creado el 2026-11-10: ecosistema de validacion practicamente inexistente.
- No se documentan sesgos, riesgos de alucinacion ni cobertura idiomatica propios; estos dependen del modelo objetivo.
- El identificador del autor en el ejemplo de la model card (`ZachWangAMD/...`) difiere del ID del repositorio (`amd/...`); conviene verificar la ruta exacta antes de configurar el serving.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/Qwen3.8-27B-Quark-DFlash2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- AMD Quark (herramienta de entrenamiento y cuantizacion): no disponible en la informacion proporcionada
- Paper de DFlash2: no disponible en la informacion proporcionada
- Repositorio de vLLM (soporte DFlash2): no disponible en la informacion proporcionada
- Spec-Bench (benchmark citado): no disponible en la informacion proporcionada
- Demo o blog del autor: no disponible en la informacion proporcionada
