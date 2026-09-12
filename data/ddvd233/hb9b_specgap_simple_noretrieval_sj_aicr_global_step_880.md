# ddvd233/hb9b_specgap_simple_noretrieval_sj_aicr_global_step_880

## Resumen

El modelo `ddvd233/hb9b_specgap_simple_noretrieval_sj_aicr_global_step_880` es un artefacto de investigacion derivado de `Qwen/Qwen3.5-9B` mediante aprendizaje por refuerzo con la libreria `verl`. Se distribuye como pesos fusionados en safetensors bf16 (recuento real de 9.409.813.744 parametros) a partir del checkpoint FSDP `hb9b_specgap_simple_noretrieval_sj_aicr/global_step_880`, con licencia Apache 2.0 y un tamano de repositorio de 18,8 GB. No es un modelo de proposito general publicado por un laboratorio, sino un punto de control intermedio de un experimento de RL descrito por el propio autor como "baseline del articulo RRIMed".

El objetivo del experimento es servir de control de prompt fijo dentro de una receta de RL identica a la del run `ddvd233/hb9b_specgap_ship_noretrieval_sj_aicr_global_step_480`, en un escenario sin recuperacion (no-retrieval) y evaluado con un juez congelado de 9B (ajuste ARM 12). El autor reporta una precision ajustada por longitud en HealthBench Professional de 0,343 en la ultima evaluacion previa a este paso, frente a 0,381 en el mejor paso de la ejecucion (paso 345, cuyos pesos se perdieron por rotacion de checkpoints), 0,244 del modelo sin entrenar y 0,421 de RRIMed-9B en el mismo ajuste.

Su relevancia es, por tanto, metodologica mas que de producto: documenta el efecto de mantener la recompensa fija y operar sin recuperacion en un pipeline de RL sobre tareas medicas generadas por el propio modelo. El autor advierte explicitamente de que es un artefacto de investigacion y que no debe usarse con fines clinicos. Con cero descargas y cero "likes" en el momento de la consulta, se trata de un modelo sin validacion externa ni adopcion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-9B; la model card no detalla configuracion) |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos bf16; no se ofrecen variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bf16, pesos fusionados desde checkpoint FSDP de verl) |

## Arquitectura y entrenamiento

La arquitectura no se describe en la informacion disponible mas alla de que deriva del modelo base `Qwen/Qwen3.5-9B` (aproximadamente 9,4 mil millones de parametros, pesos bf16). El proceso de entrenamiento si esta parcialmente documentado: se trata de un ajuste por aprendizaje por refuerzo ejecutado con `verl`, con entrenamiento en paralelo de datos FSDP, cuyo checkpoint final se fusiono a pesos de HuggingFace en safetensors bf16. El conjunto de tareas de entrenamiento son tareas escritas por el propio modelo ("model-written tasks"), y la evaluacion se realiza sobre una unica familia de benchmarks (HealthBench Professional).

La innovacion metodologica del run no es arquitectonica sino experimental: se mantiene la recompensa fija con un prompt fijo, en un escenario sin recuperacion de informacion, y las respuestas se puntuan mediante un modelo juez congelado de 9B parametros (ajuste ARM 12). Este checkpoint funciona como control frente al run hermano `hb9b_specgap_ship_noretrieval_sj_aicr_global_step_480`. No se documentan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de SFT, DPO o RLHF adicionales mas alla del bucle de RL descrito.

## Capacidades

- Generacion de texto y razonamiento en el dominio medico: el unico eje de evaluacion reportado es HealthBench Professional, lo que indica un ajuste orientado a respuestas clinicas.
- Respuesta a preguntas de tipo profesional sanitario, presumiblemente en ingles (idioma no confirmado en la model card).
- Ejecucion de tareas generadas por el propio modelo dentro del bucle de RL (tareas sinteticas de entrenamiento).
- No hay evidencia en la informacion disponible de soporte de tool calling / function calling.
- No hay evidencia de capacidades de agente, multi-step reasoning explicito ni modos de "pensamiento" diferenciados.
- No hay evidencia de capacidades multimodales (vision, audio) ni de capacidades multilingues declaradas.
- Capacidad de servir como linea base de control reproducible para comparar recetas de RL en el dominio medico.

## Casos de uso

- Reproduccion de experimentos de RL en el dominio medico: el modelo sirve como punto de comparacion con recompensa fija y sin recuperacion, permitiendo aislar el efecto de otras variables de la receta (por ejemplo, el run con recuperacion) sobre la precision en HealthBench Professional.
- Auditoria metodologica de pipelines con `verl`: al ser un checkpoint intermedio (paso 880) con pesos fusionados, permite inspeccionar el estado del modelo a mitad de entrenamiento y comparar con el mejor paso registrado (paso 345, 0,381).
- Estudio del impacto del ajuste por longitud en evaluaciones con juez automatico: el autor reporta accuracy ajustada por longitud, lo que hace util este checkpoint para analizar como el RL modifica la verbosidad de las respuestas.
- Investigacion sobre jueces congelados de 9B: el ajuste ARM 12 empleado para puntuar permite estudiar la correlacion entre un juez automatico de ese tamano y evaluaciones humanas en contenido clinico.
- Analisis de degradacion por rotacion de checkpoints: el modelo ilustra el caso en el que el mejor checkpoint de una ejecucion se pierde y se conserva uno posterior con menor puntuacion, util para disenar politicas de retencion en entrenamientos largos.
- Comparacion de familias de modelos medicos sobre una misma particion: junto con el modelo sin entrenar (0,244) y RRIMed-9B (0,421), permite construir una tabla de referencia interna para decidir si una receta de RL aporta ganancia real.
- Docencia y formacion en RL aplicado: al ser un artefacto pequeno (18,8 GB) y Apache 2.0, resulta adecuado para practicas de evaluacion de modelos medicos sin fines clinicos.

## Benchmarks y rendimiento

Los unicos datos de evaluacion presentes en la informacion disponible corresponden a HealthBench Professional, con precision ajustada por longitud (length-adjusted accuracy):

| Modelo / configuracion | Precision ajustada por longitud (HealthBench Professional) |
|---|---|
| Qwen3.5-9B sin entrenar | 0,244 |
| Este modelo (global step 880) | 0,343 |
| Mejor paso de la ejecucion (step 345, pesos perdidos por rotacion) | 0,381 |
| RRIMed-9B en el mismo ajuste (no-retrieval) | 0,421 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 19-20 GB solo para los pesos (18,8 GB de repositorio), mas la cache KV, que depende de la longitud de contexto efectiva (no disponible). En la practica, se recomienda un minimo de 24 GB para contexto corto.
- VRAM estimada con cuantizacion (estimaciones, no confirmadas por el autor): en torno a 10-11 GB en 8 bits y en torno a 5,5-6 GB en 4 bits, si se genera una conversion propia.
- GPU recomendadas: A100 40/80 GB, H100 80 GB y L40S 48 GB para despliegue comodo en bf16 con contexto amplio; A100 40 GB o RTX 6000 Ada 48 GB como minimo holgado.
- GPU de consumo: cabe en RTX 4090 / RTX 3090 (24 GB) en bf16 con contexto limitado, y en tarjetas de 12-16 GB (RTX 4080, RTX 4070 Ti Super) solo tras cuantizacion a 8 o 4 bits.
- Opciones de despliegue: vLLM y TGI para servir los safetensors bf16 directamente; llama.cpp u Ollama requieren una conversion previa a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HealthBench Professional (ajustado por longitud) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (step 880) | 9,4 B | No disponible | 0,343 | Apache 2.0 | Pesos bf16 en safetensors |
| Qwen3.5-9B sin entrenar (base) | ~9,4 B | No disponible | 0,244 | No disponible en la informacion | Modelo base en HuggingFace |
| RRIMed-9B (mismo ajuste, no-retrieval) | ~9 B | No disponible | 0,421 | No disponible en la informacion | Referencia citada por el autor |
| hb9b_specgap_ship_noretrieval_sj_aicr_global_step_480 (run hermano) | ~9,4 B | No disponible | No disponible | Apache 2.0 (presumible, no confirmado) | Pesos en HuggingFace |

No se dispone de datos de contexto, idiomas ni licencia de los modelos comparados mas alla de lo indicado, por lo que la comparacion se limita al eje de rendimiento en HealthBench Professional.

## Limitaciones y advertencias

- El autor declara explicitamente que es un artefacto de investigacion y que no debe usarse con fines clinicos ("Not for clinical use").
- Entrenado sobre tareas escritas por el propio modelo y evaluado en una unica familia de benchmarks (HealthBench Professional), lo que limita la generalizacion a otros dominios o tareas.
- Riesgo de alucinacion no cuantificado en la informacion disponible; en dominio medico, el impacto de una respuesta incorrecta es alto.
- Sesgos conocidos: no documentados en la model card. Al derivar de Qwen3.5-9B, heredaria los sesgos del modelo base, no evaluados aqui.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se especifican, por lo que no pueden asumirse capacidades multilingues.
- Rendimiento inferior al de la variante RRIMed-9B del mismo ajuste (0,343 frente a 0,421) y al del mejor paso de su propia ejecucion (0,381), cuyos pesos se perdieron por rotacion de checkpoints; el checkpoint conservado no es el optimo del run.
- Ausencia de cuantizaciones oficiales: cualquier uso en hardware de consumo exige una conversion propia a GGUF u otro formato, con el consiguiente riesgo de degradacion no medida.
- Sin adopcion ni validacion externa: cero descargas y cero "likes" en el momento de la consulta, sin reportes independientes de calidad.
- Licencia Apache 2.0: permite uso comercial segun los terminos de dicha licencia, pero la advertencia del autor sobre uso clinico y la falta de evaluacion de seguridad deben tenerse en cuenta en cualquier despliegue en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/ddvd233/hb9b_specgap_simple_noretrieval_sj_aicr_global_step_880
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Run hermano (control con prompt fijo, no-retrieval): https://huggingface.co/ddvd233/hb9b_specgap_ship_noretrieval_sj_aicr_global_step_480
- Libreria de entrenamiento verl: no se proporciona enlace en la informacion disponible
- Articulo RRIMed: no se proporciona enlace en la informacion disponible
- HealthBench Professional: no se proporciona enlace en la informacion disponible
- Nota: la busqueda web asociada no devolvio resultados relevantes sobre este modelo (unicamente paginas genericas de Google Traductor y Google Search), por lo que no se anaden mas enlaces.
