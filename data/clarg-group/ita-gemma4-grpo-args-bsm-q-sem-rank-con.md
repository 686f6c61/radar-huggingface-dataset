# CLArg-group/ita-gemma4-grpo-args-bsm-q-sem-rank-con

## Resumen

`ita-gemma4-grpo-args-bsm-q-sem-rank-con` es un adaptador LoRA para generacion de argumentos orientado a inferencia neurosimbolica, desarrollado por el grupo CLArg-group en el marco del paper *Neurosymbolic Learning for Inference-Time Argumentation*. El modelo parte del backbone `google/gemma-4-E4B-it` y se entrena con GRPO para, dada una afirmacion (claim), producir un conjunto de argumentos a favor y otro de argumentos en contra. Estos argumentos inducen un QBAF (Quantitative Bipolar Argumentation Framework) centrado en la afirmacion, cuyos nodos son puntuados por un modelo de puntuacion base (BSM) y agregados mediante la semantica gradual DF-QuAD para obtener una fuerza de la afirmacion que se umbraliza en un veredicto True / False / Uncertain.

El modelo no emite el veredicto directamente: es una pieza de un pipeline de argumentacion en tiempo de inferencia (ITA) que combina generacion en lenguaje natural con razonamiento argumentativo formal. Su relevancia reside en que aborda la verificacion de afirmaciones con un mecanismo interpretable y auditable, donde la decision final es trazable a traves de los argumentos generados y de la agregacion simbolica.

El adaptador es de rango 8 (alpha 32, dropout 0.1) sobre las proyecciones query, key, value y output, ocupa 0.1 GB y se distribuye bajo licencia MIT, con la salvedad de que el uso queda sujeto tambien a la licencia del modelo base Gemma 4 E4B. En el paper se le denomina "Gemma GRPO args + BSM-Q (primed & sem & rank & con)" y aparece en el apendice G.3, tabla 7.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Gemma 4 E4B) con adaptador LoRA (rank 8, alpha 32, dropout 0.1) sobre proyecciones q, k, v y o |
| Parametros totales | no disponible (adaptador LoRA de 0.1 GB sobre `google/gemma-4-E4B-it`) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (adaptador en safetensors; la cuantizacion depende del backbone) |
| Idiomas soportados | no disponible |
| Licencia | MIT (sujeta ademas a la licencia del modelo base Gemma 4 E4B y a los terminos de los datos de entrenamiento) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre el backbone `google/gemma-4-E4B-it`. El adaptador tiene rango 8, alpha 32 y dropout 0.1, y se aplica sobre las proyecciones query, key, value y output del transformer. Durante el entrenamiento con GRPO unicamente se actualizan los parametros del adaptador; el backbone y el modelo de puntuacion base (BSM) permanecen congelados.

El entrenamiento se realizo con GRPO mediante la libreria TRL sobre el conjunto *TFU Training Claims*, compuesto por 1.000 afirmaciones etiquetadas como True / False / Uncertain. Cada completion muestreada se parsea en argumentos de apoyo y de ataque, se puntua con el BSM-Q (primed & sem & rank & con) y se agrega con DF-QuAD, fijando la puntuacion base de la propia afirmacion en 0.5. La fuerza resultante se convierte en la recompensa de argumentacion r_alpha,beta descrita en la seccion 6 del paper: maxima para cualquier fuerza que produzca el veredicto correcto y decreciente de forma lineal con la distancia al umbral relevante. Las completions no parseables reciben una recompensa fija de -1000. Los umbrales de veredicto usados en la recompensa son alpha = 1/3 y beta = 2/3. Hiperparametros: learning rate 1e-5, 2 epocas, 2 generaciones por prompt, 450 pasos de optimizacion, semilla 0.

La innovacion tecnica principal es la integracion de un modelo de puntuacion neuronal (BSM) y una semantica argumentativa simbolica (DF-QuAD) dentro del bucle de recompensa de GRPO, lo que permite optimizar el generador hacia argumentos que, una vez agregados formalmente, conducen a veredictos correctos.

## Capacidades

- Generacion de argumentos de apoyo y de ataque para una afirmacion dada, en el formato requerido por el pipeline ITA.
- Verificacion de afirmaciones (claim verification) en el marco de un pipeline neurosimbolico con veredicto True / False / Uncertain.
- Razonamiento argumentativo estructurado: los argumentos generados inducen un QBAF puntuable y agregable con DF-QuAD.
- Integracion con el modelo de puntuacion base BSM-Q (primed & sem & rank & con) para el calculo de fuerzas.
- Capacidades subyacentes del backbone Gemma 4 E4B-it (generacion de texto, comprension lectora, multilingueismo), sujetas a lo que el adaptador preserve; no se documentan explicitamente en la model card.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.
- No se documenta modo thinking ni capacidades multimodales especificas del adaptador.

## Casos de uso

- Verificacion de afirmaciones en entornos editoriales: dado un claim extraido de un articulo, el modelo genera argumentos a favor y en contra que el pipeline puntua y agrega para emitir un veredicto True / False / Uncertain con trazabilidad argumental.
- Moderacion de contenido y fact-checking asistido: el modelo produce la estructura argumental que un sistema posterior evalua, permitiendo revisar por que una afirmacion se clasifica como verdadera, falsa o incierta.
- Investigacion en argumentacion computacional: el adaptador sirve como generador de argumentos reproducible para experimentos con QBAF, DF-QuAD y semantica gradual, al estar publicado junto al codigo del repositorio ITA.
- Construccion de sistemas de decision explicables: la cadena claim -> argumentos -> puntuaciones BSM -> agregacion DF-QuAD -> veredicto ofrece una justificacion auditable, adecuada para dominios donde se exige explicabilidad.
- Evaluacion comparativa de generadores de argumentos: al ser un checkpoint concreto del paper (apendice G.3, tabla 7), permite reproducir y comparar resultados frente a otras variantes publicadas por el grupo.
- Prototipado de pipelines neurosimbolicos: util para equipos que quieran integrar generacion neuronal con razonamiento simbolico sin entrenar desde cero, descargando el adaptador en `checkpoints/` segun espera la configuracion del repositorio.
- Generacion de contraargumentos en asistentes de debate o formacion: el modelo produce ataques estructurados frente a una tesis, que pueden presentarse al usuario junto con los apoyos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al apendice G.3, tabla 7 del paper *Neurosymbolic Learning for Inference-Time Argumentation* para los resultados experimentales, pero no se incluyen cifras en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del backbone `google/gemma-4-E4B-it` y del modelo de puntuacion BSM-Q, que deben cargarse junto al adaptador. El adaptador en si ocupa 0.1 GB.
- GPU recomendadas: no disponibles en la informacion proporcionada; el codigo de ejemplo usa `device_map="auto"` y `dtype="bfloat16"`, lo que sugiere ejecucion en GPU con soporte bfloat16.
- Compatibilidad con GPU de consumo: no confirmada; depende del tamano efectivo del backbone Gemma 4 E4B y del BSM.
- Opciones de despliegue: carga mediante `peft.PeftModel` y `transformers.AutoModelForCausalLM`; descarga con `hf download` al directorio `checkpoints/ita-gemma4-grpo-args-bsm-q-sem-rank-con/` que espera el repositorio ITA. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ita-gemma4-grpo-args-bsm-q-sem-rank-con | Adaptador LoRA sobre Gemma 4 E4B | no disponible | Generador de argumentos para ITA con GRPO | MIT (sujeta al backbone) | Hugging Face (PEFT) |
| BSM-Q (primed & sem & rank & con) | no disponible | no disponible | Modelo de puntuacion base de argumentos | no disponible | Hugging Face (CLArg-group) |
| Otras variantes del repositorio ITA | no disponible | no disponible | Generadores de argumentos alternativos del paper | no disponible | Hugging Face (CLArg-group) |

No se dispone de datos de rendimiento ni de especificaciones detalladas de las alternativas en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- El modelo no emite el veredicto final por si mismo: requiere el pipeline ITA completo (BSM + DF-QuAD + umbralizacion) para producir una clasificacion True / False / Uncertain.
- Las completions no parseables reciben recompensa -1000 durante el entrenamiento, lo que indica que el formato de salida es estricto y que el modelo puede fallar si se le prompting fuera del formato esperado (apendice A.1 del paper).
- El entrenamiento se realizo sobre solo 1.000 afirmaciones (TFU Training Claims), lo que limita la cobertura de dominios y aumenta el riesgo de sobreajuste a ese conjunto.
- No se documentan sesgos conocidos, comportamiento multilingue ni evaluaciones de robustez en la informacion disponible.
- Riesgo de alucinacion: no evaluado en el material proporcionado; al ser un generador de lenguaje natural, es esperable, y el pipeline esta disenado precisamente para filtrar y puntuar los argumentos generados.
- Restricciones de licencia: el adaptador es MIT, pero el uso esta sujeto a la licencia del modelo base Gemma 4 E4B y a los terminos de los datos de entrenamiento; es necesario revisar ambas antes de un uso comercial.
- El modelo depende de un BSM concreto (BSM-Q primed & sem & rank & con); cambiar de BSM puede alterar el comportamiento del pipeline.
- No se documentan resultados de benchmarks ni latencias, por lo que no es posible estimar su rendimiento en produccion a partir de la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CLArg-group/ita-gemma4-grpo-args-bsm-q-sem-rank-con
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Modelo de puntuacion base BSM-Q (primed & sem & rank & con): https://huggingface.co/CLArg-group/ita-bsm-q-sem-rank-con
- Repositorio de codigo ITA: https://github.com/CLArg-group/inference-time-argumentation
- Libreria TRL: https://github.com/huggingface/trl
- Paper *Neurosymbolic Learning for Inference-Time Argumentation*: no disponible (referenciado en la model card sin enlace directo)
