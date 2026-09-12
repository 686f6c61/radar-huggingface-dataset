# ddvd233/prbench9b_specgap_ship_websearch_global_step_420

## Resumen

prbench9b_specgap_ship_websearch_global_step_420 es un ajuste de Qwen/Qwen3.5-9B publicado por el usuario ddvd233 en HuggingFace. Se trata de un artefacto de investigacion procedente de un experimento de aprendizaje por refuerzo (RL) denominado RRIMed, en su rama *held-out* sobre PRBench Hard (dominios de finanzas y derecho), brazo ARM 19. El modelo ha sido entrenado con el framework verl sobre checkpoints FSDP y posteriormente fusionado a pesos bf16 en safetensors. El repositorio ocupa 18,8 GB y contiene 9.409.813.744 parametros totales (aproximadamente 9,4 mil millones), coherente con un modelo denso en bf16.

La relevancia de esta ficha es limitada y hay que enmarcarla correctamente: no es un modelo de proposito general ni un producto listo para produccion, sino un checkpoint de investigacion (global step 420) orientado a medir si el entrenamiento con recompensas autogeneradas (*self-evolving rewards*) mejora el rendimiento en tareas evaluadas con rubricas. La model card indica explicitamente que fue entrenado sobre tareas escritas por el propio modelo y evaluado en una unica familia de benchmarks, y advierte de que no debe usarse con fines clinicos.

El dato de rendimiento declarado es una precision de rubrica ajustada por longitud de 0,216 en PRBench Hard, frente a 0,175 del modelo sin entrenar; el mejor resultado de la ejecucion fue 0,225 en el paso 350, que se perdio por la rotacion de checkpoints. No se dispone de informacion sobre longitud de contexto, idiomas soportados, tipos de cuantizacion ni resultados en benchmarks estandar, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada de Qwen/Qwen3.5-9B (detalles internos no disponibles) |
| Parametros totales | 9.409.813.744 (aproximadamente 9,4 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; los pesos publicados estan en bf16 |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), fusionados desde un checkpoint FSDP de verl |
| Tamano del repositorio | 18,8 GB |
| Modelo base | Qwen/Qwen3.5-9B |
| Pipeline declarado | reinforcement-learning |
| Etiquetas | medical, reinforcement-learning, verl, region:us |

## Arquitectura y entrenamiento

No se dispone de detalles arquitectonicos propios de este checkpoint mas alla de que deriva de Qwen/Qwen3.5-9B, un modelo denso de aproximadamente 9,4 B de parametros. Los pesos publicados son una fusion (*merge*) a bf16 safetensors de un checkpoint FSDP generado por verl, lo que implica que el entrenamiento se ejecuto con sharding de parametros sobre FSDP y posteriormente se consolido en un unico conjunto de tensores. El repositorio no documenta numero de tokens de entrenamiento, composicion del dataset, ni si se aplicaron etapas de SFT, DPO o RLHF adicionales al esquema de RL descrito.

La innovacion declarada es el uso de recompensas autogeneradas por el propio modelo (*self-evolving rewards*) dentro del experimento RRIMed, aplicado a la rama *held-out* de PRBench Hard (finanzas y derecho) en el brazo ARM 19. El entrenamiento se realizo sobre tareas escritas por el modelo y la evaluacion se limito a una unica familia de benchmarks, con metrica de precision de rubrica ajustada por longitud. La model card especifica que este checkpoint es el mejor de la ejecucion cuyos pesos sobrevivieron a la rotacion de checkpoints, y que el mejor paso por validacion fue el 350, no el 420. No hay informacion sobre hiperparametros, presupuesto de computo, composicion del corpus ni tecnicas de atencion o decodificacion especulativa.

## Capacidades

- Generacion de texto en el dominio general heredado del modelo base Qwen/Qwen3.5-9B; las capacidades concretas del base no se detallan en la informacion disponible.
- Razonamiento sobre tareas evaluadas con rubricas en los dominios de finanzas y derecho, que es el objetivo declarado del entrenamiento (PRBench Hard).
- Uso de busqueda web como unica fuente de conocimiento externo: la model card indica explicitamente "Web search only (no domain knowledge base)", es decir, el flujo de evaluacion no emplea una base de conocimiento de dominio.
- Investigacion en aprendizaje por refuerzo: sirve como artefacto reproducible de un experimento con recompensas autogeneradas sobre verl.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada, aunque el flujo de busqueda web implica una etapa de recuperacion externa.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo *thinking*, vision, audio): no disponibles.

## Casos de uso

- Reproduccion de experimentos de RL con recompensas autogeneradas: el checkpoint permite cargar los pesos finales del paso 420 y comparar la curva de aprendizaje frente al paso 350 y frente al modelo sin entrenar (0,175 de precision ajustada), usando el mismo protocolo de evaluacion sobre PRBench Hard.
- Investigacion sobre evaluacion por rubricas: util para estudiar como se comporta un modelo de 9,4 B cuando la metrica de exito es una precision de rubrica ajustada por longitud, y para analizar la sensibilidad de esa metrica al numero de pasos de entrenamiento.
- Prototipado de asistentes de busqueda web en dominios regulados: dado que el entrenamiento declara usar solo busqueda web, puede emplearse como banco de pruebas para pipelines de retrieval + generacion en consultas financieras o legales, siempre en fase de investigacion y sin uso clinico.
- Analisis de dominios financiero y legal en fase exploratoria: el modelo fue expuesto a tareas de PRBench Hard en estas areas, por lo que resulta adecuado para experimentar con resumenes, extraccion de clausulas o comparacion de documentos, asumiendo la ausencia de garantias de exactitud.
- Base para *fine-tuning* posterior: al publicarse en safetensors bf16 con licencia apache-2.0, puede servir como punto de partida para ajustes supervisados en nichos concretos, partiendo de un modelo que ya ha pasado por un ciclo de RL.
- Comparacion de estrategias de recompensa en RL: el par (RRIMed con recompensas autogeneradas, base sin entrenar) permite aislar el efecto de la senal de recompensa en un mismo modelo base y con un mismo benchmark.
- Estudios de robustez y alucinacion en dominios sensibles: el modelo es un caso de estudio util para medir tasas de error factual cuando la unica fuente externa es la busqueda web, especialmente relevante antes de plantear cualquier despliegue real.

## Benchmarks y rendimiento

Los unicos datos disponibles provienen de la model card y corresponden a una unica familia de benchmarks (PRBench Hard, dominios de finanzas y derecho) con metrica de precision de rubrica ajustada por longitud.

| Modelo / checkpoint | Benchmark | Metrica | Resultado |
|---|---|---|---|
| prbench9b_specgap_ship_websearch, global step 420 (este modelo) | PRBench Hard (finance + legal) | Precision de rubrica ajustada por longitud | 0,216 |
| Misma ejecucion, mejor paso por validacion (global step 350) | PRBench Hard (finance + legal) | Precision de rubrica ajustada por longitud | 0,225 |
| Modelo sin entrenar (referencia declarada) | PRBench Hard (finance + legal) | Precision de rubrica ajustada por longitud | 0,175 |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni ninguna otra prueba estandar. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo: los enlaces recuperados corresponden a la serie de television Maxton Hall y no guardan relacion con este checkpoint, por lo que no aportan datos adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18,8 GB solo para pesos, mas la memoria de la cache KV, cuya magnitud depende de la longitud de contexto y del tamano de lote (ambos no disponibles). En la practica, se requiere una GPU de 24 GB o superior para ejecucion comoda en bf16.
- VRAM estimada con cuantizacion de 8 bits: del orden de 10-11 GB para pesos, mas cache KV. Con cuantizacion de 4 bits: del orden de 5,5-6 GB para pesos, mas cache KV. Estas cifras son estimaciones derivadas del recuento de parametros; el autor no publica cuantizaciones oficiales.
- GPU recomendadas: para bf16, A100 40/80 GB, H100 80 GB, L40S 48 GB o RTX 4090 24 GB (esta ultima con margen limitado y contexto reducido). Para cuantizacion de 4 bits, tarjetas consumer de 8-12 GB pueden ser suficientes segun la longitud de contexto.
- Compatibilidad con GPU de consumo: si, el modelo cabe en una RTX 4090 en bf16 con contexto moderado, y en tarjetas de 8-12 GB si se cuantiza a 4 bits.
- Opciones de despliegue: vLLM, TGI y llama.cpp son las opciones habituales para un transformer denso de 9,4 B; Ollama es viable si se genera una conversion GGUF, que no se distribuye en el repositorio. El repositorio solo contiene safetensors bf16.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en PRBench Hard | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| prbench9b_specgap_ship_websearch (global step 420) | 9,4 B | no disponible | 0,216 (mejor paso: 0,225) | apache-2.0 | safetensors bf16 en HuggingFace |
| Qwen/Qwen3.5-9B (modelo base, sin entrenar) | aproximadamente 9,4 B | no disponible | 0,175 (referencia declarada) | no disponible en la informacion proporcionada | HuggingFace |
| Alternativas equivalentes de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de otros modelos de la misma categoria con resultados en PRBench Hard, contexto o tipos de cuantizacion, por lo que no es posible establecer una comparativa completa con alternativas. El unico contraste documentado es frente al modelo base sin entrenar, con una mejora de 0,041 puntos absolutos en la metrica declarada.

## Limitaciones y advertencias

- Uso clinico prohibido: la model card indica explicitamente "Not for clinical use". No debe emplearse en diagnostico, triaje ni recomendacion terapeutica.
- Artefacto de investigacion: fue entrenado sobre tareas escritas por el propio modelo y evaluado en una unica familia de benchmarks (PRBench Hard), lo que limita severamente la generalizacion de los resultados.
- Rendimiento bajo en terminos absolutos: una precision de rubrica ajustada por longitud de 0,216 implica que mas de tres cuartas partes de las respuestas no satisfacen la rubrica de evaluacion. No es adecuado para tareas autonomas de alta exigencia.
- Checkpoint suboptimo respecto a la propia ejecucion: el mejor paso por validacion fue el 350 (0,225), pero esos pesos se perdieron en la rotacion de checkpoints; el checkpoint publicado es el 420, con rendimiento inferior.
- Sesgos conocidos: no disponibles. No se publica informacion sobre composicion del dataset, filtrado de datos ni evaluaciones de sesgo.
- Riesgo de alucinacion: elevado en dominios especializados, dado que el flujo declarado usa unicamente busqueda web y no una base de conocimiento de dominio ("Web search only"), sin verificacion factual documentada.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se documentan, por lo que no pueden planificarse despliegues multilingues ni con ventanas largas sin verificacion empirica previa.
- Restricciones de licencia: la licencia declarada es apache-2.0, que permite uso comercial, pero se aplica al artefacto publicado y no exime de las condiciones del modelo base Qwen/Qwen3.5-9B, cuyos terminos no se detallan en la informacion disponible y deben verificarse antes de cualquier uso comercial.
- Advertencia para produccion: con 0 descargas y 0 valoraciones, el modelo carece de validacion por parte de la comunidad. Cualquier integracion en produccion requeriria una evaluacion propia y exhaustiva.
- Ruido en la busqueda web: los resultados recuperados durante la elaboracion de esta ficha no guardan relacion con el modelo, lo que impide contrastar los datos de la model card con fuentes independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ddvd233/prbench9b_specgap_ship_websearch_global_step_420
- Modelo base referenciado en la model card: https://huggingface.co/Qwen/Qwen3.5-9B
- No se han encontrado en la busqueda web enlaces relevantes al modelo, a papers asociados ni a repositorios de codigo. Los resultados devueltos correspondian a contenido audiovisual sin relacion con este checkpoint.
