# polydim-cla/phi-4-mini-3.8b-pmtp

## Resumen

`polydim-cla/phi-4-mini-3.8b-pmtp` es un checkpoint derivado de `microsoft/Phi-4-mini-instruct` (3.8B parametros), publicado por el usuario `polydim-cla` (Ariel Garcia Traba, POLYDIM-EINSOF Research Initiative) bajo licencia apache-2.0. El autor lo describe como un adaptador basado en "PMTP" y "Stiefel manifold" que inyecta una proyeccion geometrica en la capa 16 del modelo base, reduciendo la dimension de `d_model = 3072` a una representacion canonica de 1024 sobre la variedad de Stiefel St(3072, 1024).

El interes del checkpoint es experimental: propone una via poco comun de intervencion sobre los pesos internos (restriccion a una variedad ortogonal) en lugar de un fine-tuning convencional, y anade un mecanismo de comunicacion entre procesos (`PmtpShmBus`) que, segun el autor, evita serializar texto. No obstante, la model card no incluye resultados de evaluacion, detalles del dataset de entrenamiento, ni instrucciones reproducibles de carga, y el repositorio ocupa solo 0.1 GB, un tamano incompatible con pesos completos de 3.8B en bf16 (que rondarian los 7.6 GB), lo que sugiere que contiene pesos parciales, adaptadores o artefactos auxiliares.

Ahora mismo es relevante como objeto de estudio para quien investigue edicion geometrica de representaciones internas, no como modelo listo para produccion: no hay benchmarks, no hay descargas ni validacion de la comunidad y parte de la terminologia empleada no se corresponde con estandares habituales de publicacion de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre `microsoft/Phi-4-mini-instruct` (familia Phi-4-mini, transformer decoder-only denso); el autor declara inyeccion en la capa 16 con proyeccion a la variedad de Stiefel St(3072, 1024) |
| Parametros totales | 3.8B (heredados del modelo base; el adaptador no declara recuento propio) |
| Parametros activos | No aplica / no disponible: el autor no declara arquitectura MoE |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; el repositorio solo publica safetensors y no se listan GGUF ni otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Dimension del modelo base | d_model = 3072; d_canonica = 1024 (declarado por el autor) |
| Capa de inyeccion | Capa 16 |
| Defecto de Frobenius declarado | 7.113e-14 (acumulador Neumaier en FP64) |
| Tamano del repositorio | 0.1 GB |
| Modelo base | `microsoft/Phi-4-mini-instruct` |

## Arquitectura y entrenamiento

La arquitectura de partida es la del modelo base Phi-4-mini-instruct, un transformer decoder-only denso de 3.8B parametros. Sobre esa pila, el autor declara una modificacion en la capa 16: una proyeccion desde el espacio de representacion de 3072 dimensiones a un subespacio canonico de 1024 dimensiones restringido a la variedad de Stiefel St(3072, 1024) sobre la esfera S^1023. La motivacion implicita es mantener ortogonalidad entre las direcciones proyectadas, de modo que el defecto de Frobenius (desviacion respecto a la condicion de ortogonalidad) sea minimo; el autor reporta 7.113e-14 medido con un acumulador Neumaier en FP64.

El checkpoint tambien menciona un componente de infraestructura denominado `PmtpShmBus`, descrito como un canal de memoria compartida entre procesos ("Zero-Worm IPC") que transmitiria tensores directamente sin serializar texto. No se especifica en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, si hubo etapas de RLHF, DPO o SFT adicionales sobre el modelo base, ni los hiperparametros del adaptador. Tampoco se documenta si el adaptador congela los pesos originales de Phi-4-mini o los modifica, lo que es determinante para saber si el checkpoint puede cargarse con `transformers` sin codigo a medida.

## Capacidades

- Generacion de texto y razonamiento: presumiblemente heredadas de `microsoft/Phi-4-mini-instruct`; no verificadas para este checkpoint concreto.
- Codigo y matematicas: capacidades esperables del modelo base, sin evaluacion publicada en este repositorio.
- Tool calling / function calling: no documentado para este checkpoint.
- Uso en agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; la model card no declara lista de idiomas.
- Capacidad especial declarada: inyeccion de un adaptador geometrico en la capa 16 con proyeccion a la variedad de Stiefel y verificacion numerica del defecto de ortogonalidad.
- Capacidad especial declarada (infraestructura): comunicacion entre procesos por memoria compartida (`PmtpShmBus`), sin serializacion de tokens de texto.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Investigacion en edicion geometrica de representaciones: usar el checkpoint como referencia para reproducir la proyeccion St(3072, 1024) en la capa 16 y medir el impacto del defecto de Frobenius en la perplejidad, comparando contra el modelo base sin modificar.
- Estudio de preservacion de capacidades tras una intervencion en pesos: evaluar si un adaptador de rango restringido mantiene el rendimiento del base en tareas de razonamiento y matemeticas, midiendo la degradacion con un conjunto de evaluacion propio (el repositorio no aporta ninguno).
- Reproduccion de resultados declarados: recalcular el defecto de Frobenius de 7.113e-14 con un acumulador Neumaier en FP64 para validar la implementacion del autor antes de reutilizar el metodo.
- Base para experimentos de ortogonalidad en fine-tuning: extender la idea a otras capas o a otros modelos de ~4B y comparar estabilidad del entrenamiento frente a LoRA convencional.
- Prototipos de inferencia local: solo si se generan pesos completos o GGUF a partir del adaptador; en ese caso, un modelo de 3.8B cuantizado a int4 podria ejecutarse en GPU de consumo para tareas de generacion de texto y resumen.
- Docencia y divulgacion tecnica: ilustrar en un curso o articulo que es una restriccion a una variedad de Stiefel aplicada a pesos de un transformer, usando el codigo del repositorio del autor como material de partida.
- Evaluacion comparativa de derivados comunitarios: incluir este checkpoint en un estudio sobre calidad de publicaciones de adaptadores (documentacion, artefactos, reproducibilidad) frente a otros derivados de Phi-4-mini.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y tampoco se aportan comparaciones con el modelo base. El unico dato numerico verificable que declara el autor es el defecto de Frobenius del adaptador (7.113e-14), que mide la calidad geometrica de la proyeccion, no la calidad del modelo como generador de texto.

## Requisitos de hardware

Estimaciones calculadas a partir del tamano de 3.8B parametros; el repositorio no publica requisitos oficiales ni mediciones de latencia.

- VRAM para pesos en bf16/fp16: aproximadamente 7.6 GB solo de pesos; con cache KV y overhead, entre 10 y 12 GB para contexto corto.
- VRAM para pesos en int8: aproximadamente 3.8 GB; entre 6 y 8 GB en total.
- VRAM para pesos en int4: aproximadamente 2 GB; entre 4 y 5 GB en total.
- GPU de consumo: un modelo de 3.8B cabe en RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 4060 Ti (16 GB) en bf16; en int4 podria caber en GPU de 8 GB.
- GPU de datacenter: A100 40/80 GB, H100 y L40S para servir con batching concurrente; no hay datos de throughput disponibles.
- Despliegue: vLLM o TGI si se dispone de pesos completos en safetensors; llama.cpp u Ollama solo si se generan los GGUF correspondientes, que el repositorio no incluye.
- Advertencia sobre Ollama: la model card cita la etiqueta `phi4-mini:latest`, que corresponde al modelo base publicado en la libreria de Ollama, no a este adaptador.
- Advertencia sobre carga estandar: si el checkpoint depende del bus `PmtpShmBus` o de codigo de proyeccion no incluido en el repositorio, `AutoModelForCausalLM.from_pretrained` puede fallar o cargar pesos incompletos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|
| `polydim-cla/phi-4-mini-3.8b-pmtp` | 3.8B (heredados) | No disponible | apache-2.0 | No | Repositorio HF, 0 descargas, 0.1 GB |
| `microsoft/Phi-4-mini-instruct` (base) | 3.8B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Modelo base referenciado en los tags |
| Otros derivados comunitarios de Phi-4-mini | No disponible | No disponible | No disponible | No disponible | No identificados en la busqueda realizada |

No se ha identificado en la informacion proporcionada ningun adaptador comparable con benchmark publico que permita una comparacion de rendimiento. La comparacion queda limitada a parametros y licencia; cualquier afirmacion sobre calidad relativa careceria de respaldo empirico.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks ni resultados de validacion, por lo que no puede afirmarse que el adaptador conserve las capacidades del modelo base.
- Artefacto incompleto o parcial: 0.1 GB es un orden de magnitud menor que los ~7.6 GB esperables para 3.8B en bf16; hay que verificar que el repositorio contenga pesos utilizables.
- Dependencia de codigo no publicado: el mecanismo `PmtpShmBus` y la proyeccion a la variedad de Stiefel requieren implementacion propia; si no esta en el repositorio, el modelo no es ejecutable de forma estandar.
- Terminologia no estandar: expresiones como "telepatia tensorial" o "Zero-Worm IPC" no corresponden a primitivas conocidas de serializacion de modelos y dificultan la revision tecnica.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay issues, discusiones ni replicaciones independientes.
- Idiomas no declarados: se desconoce si el adaptador degrada el multilingueismo del base.
- Contexto no documentado: no puede planificarse un caso de uso con ventana larga sin confirmar la longitud soportada.
- Riesgo de alucinacion: desconocido para este checkpoint; en modelos de 3.8B es habitual en tareas factuales y no hay evaluacion que lo acote.
- Sesgos: no disponibles; no se documenta el dataset de adaptacion ni posibles desequilibrios.
- Licencia: el repositorio declara apache-2.0, pero debe verificarse la licencia del modelo base y si impone condiciones adicionales antes de un uso comercial.
- Fecha de creacion del repositorio en los metadatos: 2026-10-18; conviene confirmar la vigencia y el estado del proyecto antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/polydim-cla/phi-4-mini-3.8b-pmtp
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Repositorio del autor (POLYDIM_EINSOF): https://github.com/AGT1973/POLYDIM_EINSOF
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante al modelo; los resultados devueltos corresponden a hilos de un foro de hardware en italiano y no guardan relacion con el checkpoint.
