# manojpanda/peta1

## Resumen

Peta1 es un checkpoint de agente de ingenieria de software autonomo desarrollado por el usuario de HuggingFace manojpanda, construido como ajuste fino de `google/gemma-4-E4B-it`. El modelo se post-entrena con un curriculo de tres etapas orientado a razonamiento deliberativo y refuerzo verificable: SFT con Tree-of-Reasoning sobre los tokens latentes de pensamiento nativos de Gemma 4 (`<|channel|>thought`), descubrimiento de la frontera de capacidades y optimizacion GRPO con recompensas verificables. El objetivo declarado es resolver el fallo de exploracion y navegacion de herramientas en modelos compactos, no su comprension de codigo.

El checkpoint declara 4.300 millones de parametros activos sobre un total real de 7.941.100.832 parametros en safetensors, lo que apunta a una arquitectura de mezcla de expertos (MoE) heredada de la familia Gemma 4 E4B; la model card no detalla explicitamente la arquitectura. El repositorio ocupa 15,9 GB y se distribuye unicamente en safetensors para `transformers`, en precision FP16 y con licencia Apache 2.0. El idioma declarado es unicamente ingles.

Su relevancia actual reside en el resultado reportado sobre SWE-bench Lite completo (n = 300): pasa de 25/300 tareas resueltas en el modelo base (8,33 %) a 101/300 (33,67 %), una ganancia absoluta de 25,33 puntos porcentuales con p = 5,23e-22. El entrenamiento se realizo integramente en 2 GPU NVIDIA Tesla T4 de 15 GiB, lo que lo convierte en una referencia de bajo coste para post-entrenamiento con RL verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explicita; la nomenclatura E4B y la diferencia entre parametros totales y activos apuntan a MoE (mezcla de expertos) sobre transformer, sin confirmacion en la model card |
| Parametros totales | 7.941.100.832 (7,94 B, dato real de safetensors) |
| Parametros activos | 4,3 B (segun model card) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors FP16 (no hay GGUF ni AWQ/GPTQ publicados) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de indicar que parte de `google/gemma-4-E4B-it` con 4,3 B de parametros activos y que emplea los tokens latentes de pensamiento nativos de Gemma 4 (`<|channel|>thought`). El dato de safetensors (7,94 B parametros totales) frente a los 4,3 B activos es consistente con un diseno de mezcla de expertos, pero se trata de una inferencia a partir de los metadatos, no de una afirmacion del autor. El checkpoint esta etiquetado como `image-text-to-text`, lo que sugiere herencia de capacidades multimodales del modelo base, aunque la model card no detalla ni evalua dicha capacidad.

El post-entrenamiento sigue un curriculo de tres etapas. La primera es un SFT de Tree-of-Reasoning que fuerza formulacion de hipotesis, simulacion de entorno y poda de ramas dentro de los tokens de pensamiento latentes. La segunda es un descubrimiento de frontera de capacidades: con G = 4 y T = 0,7 se criban tareas candidatas para aislar la banda frontera informativa del 18 % (0 < p < 1,0), evitando el colapso del gradiente de politica provocado por tareas triviales (36 %) e imposibles (46 %). La tercera es GRPO con resultado verificable, con funcion de recompensa compuesta (R_target + R_format + R_tor - lambda * longitud) y estimacion de ventaja relativa de grupo. Todo el entrenamiento se ejecuto en FP16 sin cuantizacion sobre 2 GPU Tesla T4 (15 GiB cada una, nivel gratuito de Kaggle).

## Capacidades

- Generacion de texto y dialogo conversacional en ingles mediante `transformers` con plantilla de chat.
- Razonamiento deliberativo explicito en tokens de pensamiento latentes, con formulacion de hipotesis, simulacion de entorno y poda de ramas (Tree-of-Reasoning).
- Navegacion autonoma de repositorios y uso de herramientas en entornos agénticos: 25,0 % (5/20) de exito en tareas de navegacion autonoma de herramienta frente al 0,0 % del modelo base.
- Comprension de codigo con contexto anclado: 100,0 % (20/20) en tareas de comprension de codigo cuando se proporciona contexto de fichero.
- Resolucion de incidencias de software de extremo a extremo, con generacion de parches validados por tests, medida en SWE-bench Lite.
- Capacidad multimodal: el modelo esta etiquetado como `image-text-to-text`, lo que indica soporte declarado de entrada imagen-texto; no se documentan detalles ni evaluaciones.
- Soporte de tool calling y de razonamiento multi-paso: los tags incluyen `agent` y la evaluacion reportada es explicitamente agéntica en dos turnos.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.

## Casos de uso

- Resolucion automatica de incidencias en repositorios: el modelo recibe el enunciado de un issue y genera un parche; su tasa declarada de 33,67 % en SWE-bench Lite lo hace adecuado como primer nivel de triaje antes de intervencion humana.
- Navegacion autonoma de bases de codigo desconocidas: dado que el modelo base falla sistematicamente en exploracion (0/20) y Peta1 resuelve 5/20, encaja en tareas de localizacion de ficheros y simbolos relevantes sin contexto previo inyectado.
- Reconstruccion de contexto para pipelines de RAG de codigo: cuando ya se dispone de contexto de fichero, el modelo alcanza 20/20 en comprension, por lo que es util como capa de razonamiento sobre resultados de recuperacion.
- Revision de pull requests: puede analizar un diff mas el contexto del repositorio y emitir razonamiento estructurado sobre la correccion del cambio, aprovechando el canal de pensamiento explicito.
- Generacion de tests de regresion: partiendo de un fallo reproducido, el modelo puede proponer casos de prueba, dado su entrenamiento con recompensas verificables orientadas a resultado.
- Automatizacion en pipelines de CI/CD: el checkpoint es compatible con `transformers` y con endpoints, por lo que puede desplegarse tras un webhook de issue o de CI para proponer parches y validarlos contra la suite de tests existente.
- Investigacion en RL verificable: el curriculo ToR + GRPO y el filtrado de frontera de capacidades sirven como receta reproducible en hardware de gama baja (2x T4), util para grupos con presupuesto limitado.
- Agentes de bajo coste en produccion: con 4,3 B de parametros activos y pesos FP16 de 15,9 GB, es viable en una unica GPU de 24 GB, lo que permite desplegar agentes de codigo sin clústeres multinodo.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test oficial completo de `princeton-nlp/SWE-bench_Lite` (n = 300):

| Checkpoint | Resueltas / Total | Tasa de resolucion | IC de Wilson al 95 % |
|---|---|---|---|
| Gemma 4 E4B base | 25 / 300 | 8,33 % | [5,71 %, 12,01 %] |
| Peta1 (ToR GRPO, etapa 3) | 101 / 300 | 33,67 % | [28,56 %, 39,19 %] |
| Ganancia absoluta | +76 tareas | +25,33 pp | p = 5,23e-22 |

Tabla de contingencia emparejada (n = 300): 198 fallos mutuos, 24 exitos mutuos, 77 tareas resueltas solo por Peta1, 1 regresion (resuelta solo por el base). Test exacto de McNemar bilateral: chi-cuadrado = 72,12, p = 5,23e-22.

Evaluacion agéntica controlada de dos turnos sobre 20 tareas de repositorio:

| Turno | Tarea evaluada | Gemma 4 E4B base | Peta1 |
|---|---|---|---|
| Turno 1 | Navegacion autonoma de herramienta | 0,0 % (0/20) | 25,0 % (5/20) |
| Turno 2 | Comprension de codigo con contexto anclado | 100,0 % (20/20) | 100,0 % (20/20) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras suites generales.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 15,9 GB de pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 18-24 GB para contexto corto. Estimacion derivada del tamano del repositorio, no publicada por el autor.
- En cuantizacion de 8 bits la huella de pesos bajaria a unos 8 GB y en 4 bits a unos 4-5 GB, pero el autor no publica pesos cuantizados ni resultados de degradacion; estas cifras son calculos teoricos sobre el numero de parametros.
- GPU recomendadas segun el propio autor para entrenamiento: 2x NVIDIA Tesla T4 (15 GiB cada una) en FP16, sin cuantizacion. Para inferencia, una unica GPU de 24 GB (RTX 3090, RTX 4090, L4, A10G) es suficiente en FP16.
- Cabe en GPU de consumo: si, en RTX 3090 y RTX 4090 (24 GB) con pesos FP16; en GPUs de 8-16 GB requeriria cuantizacion, que no esta publicada y habria que generar a partir de los safetensors.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `device_map="auto"` (documentado por el autor), y despliegue servido mediante vLLM o TGI al ser un modelo de la familia Gemma con safetensors. `llama.cpp` y Ollama requeririan conversion previa a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Lite | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Peta1 | 7,94 B totales / 4,3 B activos | No disponible | 33,67 % (101/300) | Apache 2.0 | Safetensors en HuggingFace |
| Gemma 4 E4B base | 7,94 B totales / 4,3 B activos (mismo base) | No disponible | 8,33 % (25/300) | Segun licencia de Gemma 4 | HuggingFace |
| Otros agentes de codigo de tamano comparable | No disponible | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos de la misma categoria, por lo que la unica comparacion cuantitativa posible es contra el checkpoint base del que deriva.

## Limitaciones y advertencias

- Idioma: el modelo declara soporte unicamente de ingles; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Tasa de resolucion del 33,67 % en SWE-bench Lite: dos de cada tres tareas del split siguen sin resolverse, por lo que no es apto para automatizacion sin supervision humana.
- Navegacion autonoma limitada: solo el 25 % de exito en el turno 1 de la evaluacion agéntica, frente al 100 % cuando se le inyecta contexto de fichero. Su punto debil es la exploracion, no la comprension.
- Riesgo de alucinacion: no se documentan tasas de alucinacion, filtros de seguridad ni evaluaciones de robustez. Como todo modelo de lenguaje puede generar parches plausibles pero incorrectos.
- Una regresion documentada sobre el modelo base en SWE-bench Lite (1 tarea resuelta solo por el base), lo que indica que el post-entrenamiento no es estrictamente dominante en todas las tareas.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o alineacion. Se heredan los sesgos del corpus de entrenamiento del modelo base Gemma 4.
- Licencia: la ficha declara Apache 2.0 para este checkpoint, pero el modelo base es `google/gemma-4-E4B-it`, sujeto a los terminos de licencia de Gemma. Conviene verificar la compatibilidad de ambas licencias antes de un uso comercial, ya que la ficha no aclara como se resuelve esa relacion.
- Restricciones de contexto: no se publica la longitud de contexto soportada, dato critico para tareas de repositorio con ficheros grandes.
- Madurez: el repositorio se creo y actualizo el mismo dia (14 de octubre de 2026) y contaba con 115 descargas y 1 like en el momento de la consulta. No hay validacion comunitaria independiente de los resultados declarados.
- No se publican pesos cuantizados ni artefactos GGUF, lo que limita el despliegue en hardware de gama baja sin trabajo adicional de conversion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/manojpanda/peta1
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Dataset de evaluacion SWE-bench Lite: https://huggingface.co/datasets/princeton-nlp/SWE-bench_Lite

No se han encontrado en la busqueda web enlaces adicionales relevantes (papers, blogs, repositorios o demos) asociados a este modelo.
