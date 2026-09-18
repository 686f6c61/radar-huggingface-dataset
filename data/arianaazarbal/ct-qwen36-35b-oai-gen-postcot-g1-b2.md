# arianaazarbal/ct-qwen36-35b-oai-gen-postcot-g1-b2

## Resumen

El modelo `ct-qwen36-35b-oai-gen-postcot-g1-b2` es un adaptador LoRA de rango 64 publicado por la usuaria `arianaazarbal` sobre el modelo base `Qwen/Qwen3.6-35B-A3B`. No se trata de un modelo completo ni de un ajuste orientado a producto, sino de un artefacto de investigacion dentro de un programa de *constitutional training* iterado (repositorio `welfare-in-ai-rnd / constitutional_training`), cuyo objetivo es estudiar como se comporta un modelo cuando se le entrena sobre un corpus sintetico que instancia una "constitucion" escrita por el propio modelo de la generacion anterior.

El rasgo metodologico central es que cada generacion se entrena desde cero sobre el modelo base, nunca continuando los pesos de la generacion previa: la deriva entre generaciones se acumula exclusivamente a traves de los documentos sinteticos. En este caso concreto, la cadena es `qwen36-35b-oai-gen-postcot`, con semilla de generacion 0 extraida del OpenAI Model Spec (resumen de 5k) y semilla de la generacion 1 elicitada por el propio modelo entrenado; el sufijo `b2` indica la segunda replica independiente de esa generacion. El adaptador se entreno el 17 de septiembre de 2026 y se exporto el 18 de septiembre de 2026.

El pipeline declarado es `text-generation`, con licencia e idiomas no declarados en la informacion disponible. Su relevancia es acotada y muy especifica: interesa a investigadores que trabajen en alineamiento constitucional, auto-mejora iterada y analisis de deriva de valores, mas que a equipos que busquen un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer MoE `Qwen/Qwen3.6-35B-A3B`; rango 64, `target_modules=all-linear` |
| Parametros totales | no disponible para el adaptador; el nombre del modelo base sugiere ~35B totales (`A3B`), dato no confirmado en la informacion disponible |
| Parametros activos | no disponible (el nombre del base sugiere ~3B activos, no confirmado) |
| Longitud de contexto | 8192 tokens de longitud maxima durante el entrenamiento; la ventana del modelo base no se detalla en la informacion disponible |
| Tipos de cuantizacion | no disponible; los pesos del adaptador se distribuyen en safetensors. No se publican variantes GGUF ni cuantizaciones del adaptador |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA, libreria `peft`); tamano del repositorio 4,5 GB |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Renderer de servicio/evaluacion | `qwen3_5`, con razonamiento activado (reasoning ON) |
| Fecha de entrenamiento | 2026-09-17 |
| Fecha de exportacion | 2026-09-18 (registro en `tinker_meta.json`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 aplicado sobre todas las capas lineales (`all-linear`) del modelo base Qwen3.6-35B-A3B. La receta esta bloqueada y documentada: learning rate 1e-4, scheduler coseno con 5 % de warmup, 1 epoca, batch de 128, longitud maxima de 8192 tokens y semilla de entrenamiento 42. El entrenamiento tiene dos etapas: una primera de *midtrain* sobre un corpus documental sintetico que instancia la constitucion de esa generacion, y una segunda de *post-train* que continua desde el adaptador de la etapa 1 usando datos de chat condicionados por constitucion y generados con Opus, manteniendo las trazas de razonamiento (*chain-of-thought*). El regimen declarado es, por tanto, `midtrain + stage-2 post-train`.

La innovacion metodologica no esta en la arquitectura sino en el procedimiento de generacion de datos. La generacion 0 se sembro con el OpenAI Model Spec resumido en unas 5000 unidades; la generacion 1, que es la que corresponde a este adaptador, se sembro con una constitucion escrita por el propio modelo de la generacion 0 de la misma rama. Esa constitucion se selecciona como medoide de embedding con filtrado (*gated embedding medoid*) de un pool de 40 cadenas autoescritas. Como cada generacion parte de los pesos del modelo base, el unico canal de transmision entre generaciones es el texto de la constitucion y los documentos derivados. La constitucion empleada se incluye en el repositorio como `training_seed_constitution.md`. No se documenta en la informacion disponible el volumen total de tokens de entrenamiento ni la composicion detallada del dataset.

## Capacidades

- Generacion de texto conversacional condicionada por constitucion, con la constitucion como prefijo/condicionamiento del prompt de entrenamiento.
- Razonamiento explicito: la etapa 2 incluye trazas de chain-of-thought y el modo de razonamiento debe activarse en inferencia (`renderer qwen3_5`, reasoning ON).
- Ajuste de comportamiento y estilo alineado con la constitucion semilla de la generacion 1 (respuestas orientadas por un documento normativo sintetico, no por preferencias humanas directas).
- Capacidades heredadas del modelo base Qwen3.6-35B-A3B (generacion de codigo, matematicas, tool calling, multilingueismo, etc.): no verificadas ni documentadas para este adaptador en la informacion disponible.
- No se declaran capacidades multimodales (vision, audio) ni modo *thinking* especifico mas alla del razonamiento heredado del base.

## Casos de uso

- Investigacion en alineamiento constitucional: congelar este adaptador como punto de la cadena `qwen36-35b-oai-gen-postcot` y compararlo con las otras ramas y generaciones para medir deriva de valores entre la generacion 0 (semilla OpenAI Model Spec) y la generacion 1.
- Estudio de auto-mejora iterada: analizar el texto de `training_seed_constitution.md` frente a la constitucion de la generacion 0 para caracterizar que principios se refuerzan, se diluyen o se reescriben cuando el modelo redacta su propia norma.
- Replicabilidad experimental: al usar semilla de entrenamiento fija (42), receta bloqueada e hiperparametros publicados, sirve como baseline reproducible en experimentos de adaptadores LoRA de rango 64 sobre un MoE de gran tamano.
- Analisis de robustez de la condicionalidad: evaluar hasta que punto el comportamiento constitucional se mantiene cuando se sirve con el renderer `qwen3_5` con razonamiento activado frente a desactivado.
- Auditoria de seguridad y sesgos en corpus sinteticos: inspeccionar que sesgos o heuristicas introduce un corpus documental autogenerado respecto a un corpus humano, usando el adaptador como sujeto de prueba.
- Docencia y divulgacion tecnica: ejemplo didactico de pipeline PEFT completo, desde el entrenamiento en Tinker hasta la exportacion y carga con `PeftModel.from_pretrained`.
- Servicio interno de chat de bajo compromiso: despliegue en un entorno controlado para conversacion en un estilo definido por la constitucion, siempre que el uso previsto no dependa de garantias de seguridad, licencia o calidad no documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de evaluaciones especificas de alineamiento, y la busqueda web asociada no devolvio resultados tecnicos relacionados con el modelo.

## Requisitos de hardware

- El adaptador ocupa 4,5 GB en el repositorio, pero la inferencia requiere cargar el modelo base Qwen3.6-35B-A3B completo en bfloat16, mas el adaptador.
- Estimacion orientativa para el modelo base: en bfloat16 y con los ~35B parametros que sugiere la nomenclatura, el peso ronda los 65-70 GB, por lo que se necesitan dos GPUs de 48 GB (A6000, L40S) o una H100 de 80 GB. Estas cifras son estimaciones basadas en la nomenclatura del base y no en datos publicados en la informacion disponible.
- Con cuantizacion de 4 bits (por ejemplo bitsandbytes NF4, no validado ni declarado por el autor), el modelo base rondaria los 18-22 GB de VRAM, lo que lo situaria al alcance de una RTX 4090 (24 GB) o una RTX 3090 (24 GB), asumiendo que el backend soporte cuantizacion del base con adaptador LoRA.
- La ventana de entrenamiento fue de 8192 tokens: reservar KV cache adicional si se supera esa longitud en inferencia.
- Opciones de despliegue: `transformers` + `peft` (unico flujo documentado por el autor), con `device_map="auto"`. Otros backends (vLLM, TGI, Ollama, llama.cpp) no estan documentados para este adaptador; llama.cpp y Ollama requeririan conversion del base a GGUF y la aplicacion del adaptador por separado, procedimiento no publicado.
- Latencia y throughput: no disponibles. Al tratarse de un MoE con activacion dispersa cabria esperar un coste por token inferior al de un denso de 35B, pero no hay mediciones publicadas en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ct-qwen36-35b-oai-gen-postcot-g1-b2 | LoRA r=64 sobre base de ~35B (A3B, no confirmado) | 8192 tokens en entrenamiento; contexto del base no disponible | no disponible | no disponible | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.6-35B-A3B (modelo base) | ~35B totales / ~3B activos segun nomenclatura | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | HuggingFace |
| Otras ramas y generaciones de la misma cadena (`qwen36-35b-oai-gen-postcot`, otras ramas `b1`, `b3`, etc.) | mismo esquema de adaptador LoRA | 8192 tokens | no disponible | no disponible | no disponible en esta ficha |
| Adaptadores de alineamiento constitucional de otros programas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas equivalentes. La unica comparacion defendible con la informacion proporcionada es funcional: este adaptador frente a su modelo base y frente a sus replicas y generaciones dentro de la misma cadena experimental.

## Limitaciones y advertencias

- Licencia no declarada: la ausencia de licencia en la model card y en la API de HuggingFace implica que no hay autorizacion explicita de uso comercial. A efectos practicos, debe tratarse como uso restringido a investigacion hasta que el autor aclare los terminos.
- Es un adaptador, no un modelo autonomo: no puede servirse sin el modelo base `Qwen/Qwen3.6-35B-A3B`, cuyos terminos de uso tambien aplican y no se detallan aqui.
- Naturaleza experimental: proviene de un programa de investigacion sobre constituciones autoescritas; no ha pasado por un proceso de alineamiento con retroalimentacion humana (RLHF/DPO) documentado, sino por SFT condicionado por constitucion.
- Riesgo de deriva de valores: por diseno, la generacion 1 se entrena sobre una constitucion escrita por la generacion 0, de modo que el comportamiento puede alejarse de la intencion de la semilla humana original de forma no controlada.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad, veracidad ni tasas de alucinacion para este adaptador.
- Idiomas: no declarados. No hay garantia de comportamiento multilingue mas alla del heredado del base.
- Contexto: la longitud de entrenamiento de 8192 tokens no implica que el modelo mantenga calidad a esa longitud en inferencia; no hay evaluaciones de degradacion por longitud.
- Sin benchmarks ni evaluaciones de seguridad publicadas: no es adecuado para despliegues en produccion con usuarios finales donde se exijan garantias de calidad, sesgo o cumplimiento.
- Cero traccion verificable: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validacion independiente por terceros.
- Caducidad metodologica: el resultado depende de una receta y un pipeline de infraestructura (Tinker) concretos; la ruta `tinker://...` citada en la model card es un artefacto interno y puede no ser resoluble.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-qwen36-35b-oai-gen-postcot-g1-b2
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Constitucion semilla incluida en el repositorio: `training_seed_constitution.md` (dentro del repositorio del modelo)
- Registro de exportacion: `tinker_meta.json` (dentro del repositorio del modelo)
- Programa de investigacion citado: `welfare-in-ai-rnd / constitutional_training` (repositorio publico; URL no disponible en la informacion proporcionada)
- OpenAI Model Spec (semilla de la generacion 0): URL no disponible en la informacion proporcionada
- Resultados de busqueda web: no se encontraron enlaces tecnicos relevantes; los resultados devueltos correspondian a paginas generales de LinkedIn y no guardan relacion con el modelo.
