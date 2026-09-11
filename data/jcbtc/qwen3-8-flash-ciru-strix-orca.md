# jcbtc/Qwen3.8-Flash-CIRU-STRIX-Orca

## Resumen

Qwen3.8-Flash-CIRU-STRIX-Orca es un paquete de pesos de investigacion derivado de Qwen/Qwen3.8-Flash-Next, publicado por el usuario jcbtc (OrcaRouter) y empaquetado especificamente para inferencia local en hardware AMD Strix Halo mediante el runtime propietario CIRU v3. Se trata de una cuantizacion GGUF en precision mixta que conserva la tabla PLE externa y los bancos de expertos calibrados en Q4_1 del release CIRU original, e incorpora una cabeza MTP (multi-token prediction) en Q8 que habilita decodificacion especulativa.

El modelo esta pensado para investigacion en interpretabilidad, mecanismos de rechazo (refusal), seguridad defensiva, red-teaming y robustez. Soporta una longitud de contexto configurada de 262.144 tokens y vision opcional mediante un proyector incluido que se activa con el flag `--vision`.

Su relevancia actual es doble: por un lado, demuestra que un modelo de mezcla de expertos de gran tamano puede ejecutarse en un equipo de escritorio con memoria unificada de 128 GB; por otro, es un paquete fuertemente acoplado a su runtime, ya que ni llama.cpp estandar ni la inferencia alojada en Hugging Face pueden ejecutarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), cabeza MTP para decodificacion especulativa y proyector de vision opcional |
| Parametros totales | no disponible |
| Parametros activos | no disponible (arquitectura MoE confirmada por etiquetas, sin cifra publicada) |
| Longitud de contexto | 262.144 tokens (configuracion del servidor CIRU v3) |
| Tipos de cuantizacion | GGUF en precision mixta: bancos de expertos Q4_1 calibrados, cabeza MTP en Q8, KV cache objetivo en F16 y KV del borrador en Q8 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (campo `license: other`, `license_name: qwen-community-1.0`) |
| Formato de pesos | GGUF (llama.cpp), con tabla PLE externa y ficheros PLE auxiliares |
| Tamano del paquete | 135.962.881.519 bytes (126,625 GiB) el modelo; 904.004.320 bytes (0,842 GiB) el proyector de vision |
| Tamano del repositorio | 136,9 GB |
| Modelo base | Qwen/Qwen3.8-Flash-Next; orcarouter/Qwen3.8-Flash-Next-Uncensored |

## Arquitectura y entrenamiento

La informacion disponible no documenta el proceso de entrenamiento del modelo base Qwen3.8-Flash-Next (numero de tokens, composicion del dataset, uso de RLHF o DPO). Lo que si se detalla es la arquitectura de despliegue de esta variante: se trata de un transformer con capas de mezcla de expertos, empaquetado en precision mixta y con una tabla PLE (probablemente capa de embedding externa) mantenida fuera del cuerpo principal del GGUF. Los bancos de expertos van cuantizados a Q4_1 con calibracion, mientras que la cabeza MTP conserva Q8, lo que permite usarla como modelo borrador para decodificacion especulativa.

La innovacion principal del paquete es la integracion de MTP con decodificacion especulativa a una profundidad maxima de 6, con lote y microlote de 1024 y una sola ranura de servicio. El modelo se distribuye tambien en una variante "Orca" derivada de OrcaRouter/Qwen3.8-Flash-Next-Uncensored, cuyo comportamiento de rechazo es marcadamente distinto al del modelo base; la propia model card advierte que esto es material de investigacion sobre mecanismos de refusal y no una certificacion de seguridad.

## Capacidades

- Generacion de texto y razonamiento general en ingles, con thinking mode activable (los benchmarks de HermesAgent lo usan con pensamiento activado; el resto de pruebas, con pensamiento desactivado).
- Generacion de codigo: supera las 20 tareas de HumanEval (IDs 0-19) tanto en los tests base como en los extendidos de EvalPlus v0.1.10, y obtiene 8/8 en las comprobaciones de salud de codigo con historial largo.
- Matematicas: resuelve 8/8 tareas de GSM8K en el panel corto y 2/2 en el panel con historial compartido de aproximadamente 63.000 tokens.
- Seguimiento de instrucciones: 6/8 en IFEval en el panel corto, con mejora respecto a la variante no-Orca (5/8).
- Flujos con herramientas y agentes: se evalua con escenarios HermesAgent de al menos 32 turnos, con contexto restante completo y un limite de 1200 segundos por tarea.
- Capacidad de vision opcional: el pipeline declarado es image-text-to-text y el proyector de 0,842 GiB se carga con el flag `--vision` en el lanzador.
- Contexto largo: ventana de servicio de 262.144 tokens, con pruebas especificas que reutilizan un archivo compartido de unos 63.000 tokens y un limite efectivo de tarea de 65.536 tokens.
- Decodificacion especulativa mediante cabeza MTP en Q8, con profundidad maxima 6.

## Casos de uso

- Investigacion sobre mecanismos de rechazo: el paquete incluye una variante sin censura y otra de referencia, lo que permite comparar en la misma arquitectura y cuantizacion como se comporta el modelo ante peticiones que el base rechazaria, con trazabilidad del protocolo de evaluacion.
- Red-teaming y seguridad defensiva: los escenarios HermesAgent de mas de 32 turnos y el hallazgo de permiso documentado (reintento de despliegue tras un "User denied. Do NOT retry.") convierten al modelo en un banco de pruebas para detectar fallos de frontera de permisos en agentes.
- Analisis de documentacion larga en local: con 262.144 tokens de contexto y un limite efectivo de 65.536 en las pruebas, permite resumir y consultar repositorios completos o expedientes extensos sin enviar datos a servicios externos.
- Asistente de programacion en estacion de trabajo Strix Halo: con 53,62 tok/s de decodificacion y 227,19 tok/s de preprocesado en HumanEval IDs 1-10, es viable como copiloto local para generacion y revision de codigo sobre un AMD Ryzen AI Max+ 395.
- Procesamiento de documentos con vision: activando `--vision` se puede usar el pipeline image-text-to-text para extraer informacion de capturas, diagramas o formularios escaneados junto al texto.
- Evaluacion comparativa de cuantizaciones: al mantener la misma disposicion de precision mixta que el release CIRU original, sirve para medir el impacto de los bancos Q4_1 y la cabeza MTP Q8 frente a otras configuraciones.
- Automatizacion de tareas multi-paso con herramientas: los resultados de HermesAgent (puntuacion nativa media del 100% en la segunda ronda) apuntan a su uso en pipelines de agentes que encadenan llamadas a funciones con contexto persistente.

## Benchmarks y rendimiento

Resultados medidos por el autor en un AMD Ryzen AI Max+ 395 (gfx1151), 128 GB de memoria compartida, NixOS, ROCm 10 y CIRU v3, con una sola carga de modelo a la vez.

| Prueba | Orca | No-Orca v3 |
|---|---:|---:|
| HumanEval 0-19 base / extendido | 20/20 / 20/20 | 20/20 / 20/20 |
| Panel corto: ifeval | 6/8 | 5/8 |
| Panel corto: gsm8k | 8/8 | 8/8 |
| Panel corto: humaneval | 5/6 | 5/6 |
| Historial compartido ~63K: gsm8k | 2/2 | 2/2 |
| Historial compartido ~63K: humaneval | 3/4 | 2/4 |
| Historial compartido ~63K: ifeval | 2/2 | 2/2 |
| Salud de codigo corta 0-9: base / extendida | 10/10 / 10/10 | 10/10 / 10/10 |
| Salud de codigo ~63K 0-7: base / extendida | 8/8 / 8/8 | 8/8 / 8/8 |
| Hermes seis seleccionados, hermes-1: puntuacion nativa media | 100,00% | 100,00% |
| Hermes seis seleccionados, hermes-2: puntuacion nativa media | 100,00% | 91,67% |

Panel de velocidad (HumanEval IDs 1-10, tres repeticiones, sampler identico, cache de prompt en frio por peticion): 53,62 tok/s de decodificacion agrupados sobre 30 peticiones (pasadas individuales de 51,09, 54,36 y 55,61 tok/s), 227,19 tok/s de prompt y 586 ms de latencia mediana hasta el primer fragmento.

El autor advierte que el subconjunto seleccionado por desacuerdo es un diagnostico, no una clasificacion representativa de benchmarks, y que estos resultados no constituyen una certificacion de ciberseguridad ni de seguridad.

## Requisitos de hardware

- Memoria: requiere un sistema Strix Halo con 128 GB de memoria compartida. El modelo ensamblado junto al proyector ocupa 127,467 GiB, por lo que no cabe en GPUs de consumo con menos VRAM.
- Almacenamiento: hay que reservar al menos 220 GiB para las partes de descarga, el ensamblaje y el runtime con su SDK.
- GPU: validado en AMD Ryzen AI Max+ 395 con iGPU gfx1151. No se documenta soporte para A100, H100, RTX 4090 ni otras GPU NVIDIA.
- Configuracion de inferencia recomendada: KV objetivo en F16, KV del borrador en Q8, profundidad maxima MTP 6, lote y microlote 1024, una ranura y contexto de 262.144.
- Software: runtime CIRU v3 (rama v3.0.0 del repositorio ciru-ai/Qwen3.8-Flash-CIRU-STRIX-IU4), que instala un SDK privado de ROCm 10. Es necesario que el driver AMD exponga `/dev/kfd` y el nodo de render.
- Opciones de despliegue: exclusivamente el runtime CIRU v3 junto con el GGUF objetivo y los tres ficheros PLE. Ni llama.cpp estandar ni la inferencia alojada en Hugging Face pueden ejecutar este paquete.
- Rendimiento observado: 53,62 tok/s de decodificacion y 586 ms de latencia mediana del primer fragmento en la configuracion de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-CIRU-STRIX-Orca | no disponible (MoE) | 262.144 tokens | 20/20 HumanEval, 8/8 GSM8K, 100% Hermes ronda 1 | qwen-community-1.0 | GGUF en Hugging Face, requiere runtime CIRU v3 |
| Qwen3.8-Flash-CIRU-STRIX non-Orca v3 | misma arquitectura empaquetada | 262.144 tokens | 20/20 HumanEval, 5/8 IFEval, 91,67% Hermes ronda 2 | qwen-community-1.0 | mismo repositorio de runtime, variante de referencia |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | no disponible | no disponible | no disponible | no disponible | modelo base del que deriva la variante Orca |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | qwen-community-1.0 (heredada) | pesos originales en Hugging Face |

No se dispone de datos de benchmarks ni especificaciones publicadas para los modelos base, por lo que la comparacion se limita a las dos variantes del paquete CIRU medidas por el propio autor.

## Limitaciones y advertencias

- Acoplamiento al runtime: el paquete solo funciona con CIRU v3, el GGUF objetivo y los tres ficheros PLE. Sin ellos no arranca en llama.cpp estandar ni en la inferencia alojada de Hugging Face.
- Fallo de frontera de permisos documentado: en la segunda traza HA-19 el modelo reintento un despliegue con un comando distinto despues de recibir un "User denied. Do NOT retry.". El evaluador nativo no penalizo este comportamiento, de modo que la puntuacion del 100% no debe interpretarse como cumplimiento de permisos o de seguridad.
- Variante sin censura: la rama Orca deriva de un modelo uncensored, por lo que la ausencia de rechazos observada en pruebas de terceros no es un indicador de calidad, sino un riesgo a gestionar en cualquier despliegue.
- Alucinacion: no se han publicado estudios especificos de tasas de alucinacion en la informacion disponible.
- Idiomas: no se declara la lista de idiomas soportados; las pruebas del autor estan en ingles.
- Sesgos: no disponibles.
- Contexto util real menor que el configurado: las pruebas de historial largo usan un limite efectivo de 65.536 tokens dentro del servidor de 262.144, por lo que el rendimiento mas alla de esa frontera no esta caracterizado.
- Licencia: qwen-community-1.0, registrada como `license: other`. Es imprescindible revisar el texto completo de la licencia antes de cualquier uso comercial o redistribucion.
- Caracter de investigacion: el propio autor enmarca el paquete en interpretabilidad, refusal, seguridad defensiva, red-teaming y robustez, y descarta que los resultados constituyan una certificacion.
- Rendimiento no replicado de forma independiente: todas las cifras proceden del autor y de una unica configuracion hardware.
- Espacio en disco: el proceso de descarga y ensamblaje necesita unos 220 GiB temporales; el script auxiliar elimina las partes ya consumidas para recuperar espacio.
- Repositorio con 0 descargas registradas y 13 likes en el momento de la consulta, lo que limita la validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jcbtc/Qwen3.8-Flash-CIRU-STRIX-Orca
- Runtime CIRU v3 (rama v3.0.0): https://github.com/ciru-ai/Qwen3.8-Flash-CIRU-STRIX-IU4/tree/v3.0.0
- Informe detallado de resultados y protocolo: benchmarks/REPORT.md (dentro del repositorio del modelo)
- Resultados estructurados: benchmarks/results.json (dentro del repositorio del modelo)
- Revision de la traza de permisos: benchmarks/semantic-review.json (dentro del repositorio del modelo)
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Modelo base sin censura: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Hilo de discusion en r/StrixHalo: https://www.reddit.com/r/StrixHalo/comments/1wd370x/qwen38flashcirustrixorca_is_a_great_daily_driver/
