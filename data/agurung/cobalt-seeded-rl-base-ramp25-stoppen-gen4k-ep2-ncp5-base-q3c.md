# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-base-q3c

## Resumen

El modelo `agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-base-q3c` es un checkpoint de aprendizaje por refuerzo (RL) construido sobre `Qwen/Qwen3-4B-Instruct-2507` mediante OpenRLHF con el algoritmo GRPO. No es un modelo entrenado desde cero ni un fine-tuning supervisado: el autor indica explicitamente que se aplico RL directamente sobre el modelo base, sin semilla SFT previa. El checkpoint corresponde al paso global 58 de la ejecucion de RL y fue seleccionado como el mejor por `pass@8` dentro de ese run.

El objetivo declarado es la generacion de codigo: la senal de recompensa es binaria y mide exclusivamente si el programa generado supera los tests del problema (1.0 si pasa, 0.0 si no). El entrenamiento y la validacion se restringieron a la "frontera" `cobalt-train ≤2/64`, es decir, 1833 problemas de entrenamiento y 112 de validacion que el modelo base resolvia en como maximo 2 de 64 muestras bajo un escaneo de dureza `iid_canonical@64`. Esto lo convierte en un artefacto de investigacion sobre escalado de RL en tareas de codigo dificiles, mas que en un modelo de proposito general.

El checkpoint tiene 4.411.424.256 parametros (4,41 mil millones) almacenados en safetensors con la libreria transformers, y se publica con `pipeline_tag: text-generation`. La model card no ofrece resultados de evaluacion numericos, ni licencia, ni idiomas soportados, ni longitud de contexto confirmada, por lo que su uso en produccion requiere validacion propia. El repositorio ocupa 211,8 GB, un tamano muy superior a los ~9 GB que ocuparian los pesos en bf16, lo que sugiere la presencia de artefactos adicionales (estados de optimizador, revisiones u otros ficheros) no documentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct-2507); no se detalla en la model card |
| Parametros totales | 4.411.424.256 (4,41 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la ficha; heredada del modelo base Qwen3-4B-Instruct-2507 (Qwen documenta hasta 262.144 tokens, no confirmado para este checkpoint) |
| Tipos de cuantizacion | No disponible; pesos en safetensors (precision no declarada, presumiblemente bf16). Repositorio de 211,8 GB |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de safetensors | Si (safetensors) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 (RL aplicado sin semilla SFT) |
| Libreria | transformers |
| Pipeline | text-generation |
| Revision de carga | `main` (modelo en la raiz del repositorio) |
| Paso global del checkpoint | 58 |
| Descargas / likes | 183 / 1 |
| Fecha de creacion | 2026-10-10 |
| Fecha de actualizacion | 2026-10-15 |

## Entrenamiento

El entrenamiento sigue el algoritmo GRPO implementado en OpenRLHF, con ventajas normalizadas por grupo y sin penalizacion KL, lo que permite al policy drift alejarse del modelo de referencia a cambio de maximizar la recompensa. La recompensa es puramente binaria y de verificacion automatica: 1.0 si el programa generado pasa los tests del problema, 0.0 en caso contrario. Se aplican dos mecanismos de shaping: una penalizacion "stop-properly" de tipo ProRL que asigna recompensa -1.0 a las muestras truncadas, y una penalizacion DAPO de sobrelongitud que penaliza de forma aditiva y creciente hasta -0.25 las respuestas que caen en los ultimos 1024 tokens antes del limite.

Los hiperparametros declarados son: 8 muestras por prompt, batch de rollout de 128, batch de entrenamiento de 128, maximo de 4096 tokens nuevos por rollout, 2 episodios y learning rate del actor de 1e-06 con schedule constante. El conjunto de entrenamiento son 1833 problemas de la frontera `cobalt-train ≤2/64` (problemas con tasa de exito muy baja en el modelo base), con 112 problemas de validacion reservados que se evaluan a temperatura 1.0 para coincidir con la evaluacion de la frontera `clean_eval`. La model card indica explicitamente que las metricas de evaluacion de este checkpoint no estaban disponibles en el log de entrenamiento.

## Capacidades

- Generacion de codigo: capacidad principal y unico objetivo optimizado directamente por la senal de recompensa binaria de correctitud frente a tests.
- Generacion de texto general: heredada del modelo base Qwen3-4B-Instruct-2507, aunque el RL se concentro en codigo y puede haber degradado capacidades no recompensadas.
- Razonamiento paso a paso: el modelo base es de tipo instruct; no se documenta un modo de pensamiento explicito en esta ficha.
- Matematicas: no documentado especificamente; el RL solo recompensa correctitud de codigo verificable.
- Tool calling / function calling: no documentado en la model card; el modelo base Qwen3 soporta llamadas a herramientas, pero no hay confirmacion de que esta capacidad se preserve tras el RL.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; no se declara lista de idiomas.
- Vision o audio: no disponible (modelo exclusivamente de texto).
- Modo thinking: no documentado en esta ficha.
- Inferencia compatible con text-generation-inference y endpoints compatibles, segun los tags del repositorio.

## Casos de uso

- Generacion de codigo para problemas algorítmicos dificiles: el modelo fue entrenado especificamente sobre problemas que el base resolvia en 2 de cada 64 intentos, por lo que es adecuado como generador de candidatos en tareas de tipo competicion o entrevista tecnica, con verificacion posterior mediante ejecucion de tests.
- Sintesis de parches con verificacion automatica: dado que la recompensa se basa en pasar tests, encaja en pipelines donde exista una suite de pruebas ejecutable (por ejemplo, reparacion de bugs con `pytest` o tests unitarios en CI) que filtre las propuestas del modelo.
- Generacion de candidatos con `pass@k`: su seleccion se hizo por `pass@8`, de modo que el uso natural es muestrear varias soluciones a temperatura alta y seleccionar la primera que pase la validacion, en lugar de confiar en una unica generacion greedy.
- Investigacion en RL para codigo: sirve como punto de comparacion reproducible de GRPO sin semilla SFT ni penalizacion KL, util para estudiar el efecto de recompensas binarias, penalizaciones anti-truncamiento y escalado de dificultad en modelos de 4B.
- Destilacion y generacion de datos sinteticos: puede emplearse para producir soluciones candidatas sobre problemas dificiles que despues se filtran por tests y se usan como datos de entrenamiento supervisado de modelos mas pequenos.
- Asistente de codigo integrado en entornos con test harness: en un IDE o bot de revision, el modelo propone implementaciones y el sistema solo muestra las que superan los tests del repositorio, reduciendo el coste de revision humana.
- Servicio de inferencia autohospedado: con 4,41B de parametros es viable desplegarlo con vLLM o TGI en una GPU unica, por ejemplo para un asistente interno de codigo en un equipo pequeno.
- Evaluacion comparativa de checkpoints intermedios de RL: al estar etiquetado con su paso global (58) y su criterio de seleccion, es util para trazar curvas de rendimiento frente a otros checkpoints del mismo run.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica literalmente que las metricas de evaluacion de este checkpoint no estaban disponibles en el log de entrenamiento. El unico criterio de seleccion declarado es que es el mejor checkpoint del run por `pass@8`, pero no se proporciona el valor numerico de esa metrica ni resultados de MMLU, HumanEval, GSM8K, MBPP ni similares.

| Benchmark | Resultado | Notas |
|---|---|---|
| pass@8 (frontera cobalt-train ≤2/64) | No disponible (valor no publicado) | Unico criterio de seleccion declarado; el checkpoint es "best by pass@8" del run, sin cifra |
| clean_eval (val, 112 problemas, temperatura 1.0) | No disponible | Se menciona el protocolo de evaluacion, no los resultados |
| MMLU / HumanEval / GSM8K / MBPP | No disponible | No se reportan |

## Requisitos de hardware

- VRAM estimada para inferencia de los pesos: en bf16/fp16, aproximadamente 8,8 GB solo para pesos; en cuantizacion de 8 bits, en torno a 4,5-5 GB; en 4 bits, en torno a 2,5-3,5 GB. Hay que anadir el cache KV, que crece linealmente con la longitud de contexto y el numero de secuencias concurrentes.
- GPU consumer: el modelo cabe en GPUs consumer de gama alta. Una RTX 3060 de 12 GB o una RTX 4070 pueden ejecutarlo en 4 u 8 bits; una RTX 4090 de 24 GB lo ejecuta comodamente en bf16 y con contexto amplio.
- GPU de datacenter: A100 (40/80 GB), H100 (80 GB) o L40S permiten servir el modelo con lotes grandes y contextos largos, ademas de dejar margen para el cache KV.
- Despliegue: el autor documenta vLLM mediante `vllm serve agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-base-q3c --revision main`, y el repositorio esta etiquetado como compatible con text-generation-inference y endpoints compatibles. Al estar en formato transformers/safetensors, tambien es desplegable con TGI; llama.cpp y Ollama requeririan convertir previamente los pesos a GGUF, conversion no documentada por el autor.
- Almacenamiento: el repositorio ocupa 211,8 GB, frente a los ~9 GB de pesos en bf16, por lo que hay que prever espacio en disco y comprobar que ficheros se descargan antes de clonar.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad | Rendimiento en codigo |
|---|---|---|---|---|---|---|
| agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-base-q3c | 4,41B | No disponible en la ficha | RL (GRPO) sobre Qwen3-4B-Instruct-2507, sin semilla SFT | No disponible | HuggingFace, revision `main`, 183 descargas | No publicado (mejor `pass@8` del run, sin cifra) |
| Qwen/Qwen3-4B-Instruct-2507 | 4,0B aprox. | Qwen documenta hasta 262.144 tokens | Instruct, post-entrenamiento generalista | Apache-2.0 (segun Qwen) | HuggingFace, ampliamente usado | No disponible en esta ficha |
| Qwen/Qwen3-4B-Thinking-2507 | 4,0B aprox. | Qwen documenta hasta 262.144 tokens | Modo de razonamiento explicito | Apache-2.0 (segun Qwen) | HuggingFace | No disponible en esta ficha |
| Otros checkpoints GRPO/OpenRLHF de la misma familia (mismo run u otros runs) | 4,41B | No disponible | RL sobre Qwen3-4B | No disponible | HuggingFace | No disponible |

La comparacion con alternativas queda limitada porque la model card no publica cifras de rendimiento y porque el checkpoint esta optimizado para una distribucion muy concreta de problemas dificiles, no para evaluaciones estandar. Cualquier comparacion de rendimiento frente a los modelos base y de razonamiento de la familia Qwen3 debe hacerse con evaluacion propia.

## Limitaciones y advertencias

- Ausencia total de resultados de evaluacion: la propia model card afirma que las metricas de este checkpoint no estaban disponibles en el log de entrenamiento. No hay evidencia publicada de que mejore al modelo base fuera de la distribucion de entrenamiento.
- Riesgo de sobreajuste a la frontera `≤2/64`: el RL se aplico solo a 1833 problemas que el base resolvia en 2 de cada 64 intentos. El comportamiento en tareas faciles, en codigo de produccion o en dominios fuera de esa distribucion puede haberse degradado.
- Riesgo de reward hacking: la recompensa es binaria y depende de pasar tests. Esto incentiva soluciones que satisfagan los tests concretos (por ejemplo, hardcodear salidas para los casos de prueba) sin resolver el problema de forma general.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir APIs inexistentes, dependencias inventadas o explicaciones incorrectas. Con RL sobre correctitud de codigo, el riesgo se concentra en codigo que compila pero es incorrecto mas alla de los tests.
- Ausencia de semilla SFT: el RL se aplico directamente sobre el modelo base. Esto puede producir formatos de respuesta inconsistentes, degeneracion del lenguaje natural o deriva del estilo de instrucciones fuera del dominio de codigo.
- Penalizaciones anti-truncamiento: el uso de recompensa -1.0 para muestras truncadas y de la penalizacion DAPO de sobrelongitud puede sesgar al modelo hacia respuestas mas cortas, con el consiguiente riesgo de truncar razonamientos necesarios en problemas largos.
- Licencia no disponible: no se declara licencia en la informacion proporcionada. El uso comercial es juridicamente incierto y debe aclararse con el autor antes de cualquier despliegue en produccion. La licencia del modelo base (Qwen3-4B-Instruct-2507) puede imponer condiciones adicionales.
- Idiomas no declarados: se desconoce el soporte multilingue efectivo del checkpoint, mas alla de lo heredado del base.
- Longitud de contexto no confirmada: no se declara en la ficha y no hay garantia de que el RL preserve el comportamiento del base en contextos muy largos.
- Tamano del repositorio desproporcionado: 211,8 GB para un modelo de 4,41B parametros implica artefactos adicionales no documentados; hay que revisar la lista de ficheros antes de descargar.
- Fechas de creacion y actualizacion (2026-10-10 y 2026-10-15) resultan poco habituales y no se acompanan de explicacion en la model card.
- Trazabilidad: los logs principales residen en un proyecto de Weights & Biases (`eaiexp-paper-final`) y en un fichero de log local del autor, sin URL publica en la informacion disponible.
- No recomendado como modelo de proposito general: para tareas de chat, atencion al cliente o generacion de texto abierta, el modelo base o un instruct estandar es una eleccion mas segura.

## Enlaces

- HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-base-q3c
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Weights & Biases: proyecto `eaiexp-paper-final`, run `seeded_rl_base_ramp25_stoppen_gen4k-ep2_ncp5_base_q3c` (referenciado en la model card, sin URL publica disponible)
- Log de entrenamiento local: `experiments/cobalt_qwen3_4b_ft/rl_runs/qwen3_4b_instruct_2507_cobalt_v1/seeded_rl_base_ramp25_stoppen_gen4k-ep2_ncp5_base_q3c/openrlhf_train.log` (ruta local del autor, no accesible publicamente)
- La busqueda web realizada no devolvio ningun enlace relevante al modelo, al proyecto OpenRLHF ni a la investigacion asociada; los resultados obtenidos no guardan relacion con el objeto de esta ficha.
