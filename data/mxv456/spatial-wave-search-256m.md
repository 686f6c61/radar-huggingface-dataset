# mxv456/spatial-wave-search-256m

## Resumen

spatial-wave-search-256m es una red neuronal de vision tipo transformer, entrenada desde cero, que resuelve busquedas de ruta sobre capas de mapas urbanos ejecutando un algoritmo iterativo en su propio scratchpad. En lugar de generar la ruta en una sola pasada, el modelo escribe una parte del trazado, la retroalimenta como entrada en la pasada siguiente y repite el proceso hasta alcanzar el objetivo, guiandose por un token de estado (SEARCH, BACK, DRAW, DONE). Lo desarrolla Marvin Uhlmann (usuario mxv456) como resultado principal del proyecto spatial-reasoning-from-scratch.

El nombre puede inducir a confusion: el sufijo "256m" hace referencia a la ventana espacial de 256 m x 256 m, no al numero de parametros. El modelo tiene 8,86 M de parametros (la model card lo describe como "a 9 M-parameter transformer"), con 4 bloques, ancho 384, 6 cabezas y parches de 16 px. No es un modelo de lenguaje ni un VLM: tanto la entrada como la salida son rasters, y no acepta ni produce texto.

Su relevancia actual es experimental: demuestra que una red diminuta puede aprender de un profesor algorítmico un procedimiento de busqueda en multiples pasadas y resolver el 78 % de 500 rutas reservadas en el distrito de De Pijp (Amsterdam), superando bajo una regla comun a una red VLM de 2 B parametros ajustada con LoRA (50 %) y a la misma red dibujando la ruta en una sola pasada (37 %). Es un checkpoint de investigacion con 0 descargas y 0 likes en el momento de la consulta, orientado a reproducir y estudiar razonamiento espacial iterativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer desde cero: 4 bloques, ancho 384, 6 cabezas, parches de 16 px (256 tokens), sesgo de posicion relativa aprendido, dos tokens de condicion (estado y tarea), cabeza de 2 clases por celda y cabeza de 41 clases para el token de estado |
| Parametros totales | 8,86 M (el "256m" del nombre se refiere a la ventana de 256 m, no a 256 millones de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de contexto textual; ventana espacial de 256 m x 256 m dibujada como 17 planos alineados a 1 m/pixel, mas un plano de marcadores y un plano de scratchpad |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de raster, sin entrada ni salida de texto); no disponible |
| Licencia | MIT (codigo y pesos); las licencias de los datos se detallan en DATA_LICENSES.md del repositorio |
| Formato de pesos | checkpoint PyTorch (.pt), fichero c5_r5_wave_nat3_tok01_ownp50_from48k_L4_16k_g128_store100k.pt |

## Arquitectura y entrenamiento

La arquitectura es un transformer de vision pequeno y de proposito especifico. Recibe una ventana de 256 m x 256 m representada como 17 planos alineados a 1 m por pixel, dos marcadores (inicio y objetivo) en un plano de marcadores y un plano de scratchpad que contiene su propia salida anterior. Produce el siguiente scratchpad completo sobre una rejilla de 128 x 128 celdas de 2 m, mas un unico token de estado. Los tokens de condicion codifican el estado del procedimiento (SEARCH, BACK, DRAW, DONE) y la tarea, y la cabeza por celda resuelve una clasificacion binaria mientras que la cabeza de token resuelve 41 clases.

El entrenamiento no usa RLHF ni DPO: es imitacion de un profesor algoritmico que ejecuta una onda con precio de holgura (clearance-priced wave) por ruta. El profesor extiende un frente 40 m en cada pasada hasta alcanzar el objetivo, retrocede frente a frente y despues dibuja la ruta. El modelo se entreno 48.000 pasos sobre 100.000 rutas de De Pijp (cosine, batch 128, ruido de padding, ponderacion de celdas de cambio con annealing, peso de la perdida de token 0,1) y despues 16.000 pasos adicionales sustituyendo la mitad de los dibujos de entrada por dibujos propios almacenados ("natural noise"), manteniendo como objetivo el del profesor. El identificador de la ejecucion es c5_r5_wave_nat3_tok01_ownp50_from48k_L4_16k_g128_store100k.

La innovacion tecnica central no es de arquitectura, sino de procedimiento: el razonamiento se externaliza en el scratchpad y la red se ejecuta en bucle cerrado sobre su propia salida, con el token de estado decidiendo el paso siguiente. El coste es de 2,4 ms por pasada en una RTX 3060 y unos 57 ms por ruta completa (10 pasadas de media).

## Capacidades

- Generacion iterativa de rutas peatonales sobre rejillas de mapa: predice el trazado celda a celda en el scratchpad, no en una sola pasada.
- Busqueda multi-paso en bucle cerrado: lee unicamente su propio dibujo anterior para decidir la siguiente pasada, sin reconsultar el mapa completo en cada iteracion.
- Control de procedimiento mediante token de estado con cuatro valores (SEARCH, BACK, DRAW, DONE).
- Salida raster: rejilla de 128 x 128 celdas de 2 m sobre una ventana de 256 m, con cabeza de 2 clases por celda y cabeza de 41 clases para el token.
- Generalizacion espacial limitada a distritos no vistos de la misma ciudad y a laberintos sinteticos de interior.
- No soporta tool calling ni function calling: no procesa ni emite texto.
- No soporta agentes en el sentido de los LLM, ni razonamiento verbal multi-paso.
- No dispone de capacidades multilingues ni de comprension de lenguaje natural.
- No dispone de vision general: no es un VLM, solo interpreta las capas de mapa y el scratchpad con el formato descrito.

## Casos de uso

- Investigacion sobre razonamiento espacial iterativo: el modelo sirve como banco de pruebas reproducible para estudiar si la computacion en scratchpad mejora tareas de busqueda, comparando su 78 % con el 37 % de la misma red en una sola pasada.
- Evaluacion de lineas base de navegacion para VLM: se ha usado como referencia frente a un Qwen3-VL-2B ajustado con LoRA sobre 19.300 rutas, que obtiene el 50 % bajo la regla de polilinea frente al 76 % de esta red.
- Precomputacion por lotes de rutas en simulaciones urbanas: a 57 ms por ruta en una RTX 3060, un pipeline puede resolver miles de rutas de 40 a 500 m para estudios de accesibilidad o analisis de movilidad en rejillas de 2 m.
- Generacion de datos y curriculum para otros modelos: los dibujos intermedios del scratchpad y las rutas sinteticas pueden servir como material de entrenamiento o de evaluacion de modelos mayores.
- Navegacion en interiores y robotica exploratoria: el modelo resuelve en zero-shot el 51 % de laberintos sinteticos de casa, lo que permite prototipar planificacion en plantas de edificio sin entrenamiento especifico, siempre con supervision humana.
- Analisis de trazas de decision: al ser completamente determinista en su formato y de bajo coste, permite visualizar pasada a pasada como se expande el frente de busqueda, util para depurar heuristicas de planificacion.
- Prototipado academico en hardware modesto: al ocupar 8,86 M de parametros, cualquier GPU consumer permite reproducir los experimentos completos del repositorio.

## Benchmarks y rendimiento

Resultados declarados por el autor (marcados como no verificados en el model-index):

| Tarea / conjunto | Regla de exito | Resultado | Verificado |
|---|---|---|---|
| Rutas reservadas de De Pijp (Amsterdam), 500 rutas de 40-500 m andando | celda (conectada, sin celda de edificio, <= 1,10 x longitud andando) | 0,78 | no |
| Rutas reservadas de De Pijp, 500 rutas | polilinea (regla compartida con la linea base VLM) | 0,76 | no |
| Distrito no visto (Zuid + Centrum), 500 rutas de validacion de 256 m | celda | 0,60 | no |
| Laberinto sintetico de casa, ventanas de 256 m, 500 rutas de validacion | celda | 0,51 | no |

Desglose y comparaciones adicionales aportados en la model card:

| Medicion | Valor |
|---|---|
| Rutas de 2-3 frentes | 0,96 |
| Rutas de 4-5 frentes | 0,89 |
| Rutas de 6 o mas frentes | 0,63 |
| Misma red dibujando la ruta en una sola pasada (misma regla) | 0,37 |
| Qwen3-VL-2B con LoRA sobre 19,3k rutas (misma regla) | 0,50 |
| Primeras 200 rutas | 0,75 |
| Rendimiento antes del entrenamiento con ruido natural | 0,64 |
| Latencia por pasada (RTX 3060) | 2,4 ms |
| Latencia por ruta, 10 pasadas de media (RTX 3060) | 57 ms |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no serian aplicables a un modelo sin capacidad linguistica.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los pesos en FP32 ocupan del orden de 35 MB y el conjunto de entrada (17 planos de 256 x 256 a 1 m/pixel) mas el scratchpad de salida (128 x 128) mantienen el consumo por debajo de 1 GB en la practica. No hay cifras oficiales de consumo maximo.
- GPU recomendadas: cualquier GPU CUDA moderna. La medicion oficial de latencia se hizo en una RTX 3060, lo que indica que el modelo se diseno para hardware de gama media.
- Cabe en GPU consumer: si, en cualquier GPU consumer con soporte CUDA reciente (RTX 3060 y superiores). No se ha confirmado el rendimiento en CPU ni en aceleradores no NVIDIA.
- Opciones de despliegue: no hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. El unico camino documentado es el repositorio propio: clonar spatial-reasoning-from-scratch, colocar el checkpoint .pt en runs/checkpoints/, descomprimir eval_bundle_v0.2.tar.gz de los releases y ejecutar harness/diagnostics/wave_rollout_eval.py o wave_rollout_gif.py.
- Latencia y throughput estimados: 2,4 ms por pasada y 57 ms por ruta (10 pasadas de media) en una RTX 3060. No se ha publicado throughput por lotes ni latencia en otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana / contexto | Regla de polilinea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| spatial-wave-search-256m | 8,86 M | 256 m (17 planos, celdas de 2 m) | 0,76 | MIT | HuggingFace y GitHub |
| spatial-wave-search-512m-hero | no disponible (misma red continuada) | 512 m, rutas de hasta 1,1 km | no disponible | MIT | HuggingFace y GitHub |
| qwen3-vl-2b-lora-map-routes | ~2 B (adaptador LoRA sobre Qwen3-VL-2B) | no disponible | 0,50 | no disponible | HuggingFace |
| Misma red en una sola pasada (ablacion) | 8,86 M | 256 m | 0,37 | MIT | no aplica, es la misma red |

La comparacion es dificil de extender mas alla de estos casos: no se han encontrado en la informacion disponible otros modelos publicos de busqueda de rutas sobre mapas raster entrenados desde cero con los que contrastar parametros, contexto y licencia.

## Limitaciones y advertencias

- Entrenado con datos de una sola ciudad (Amsterdam, distrito de De Pijp): la generalizacion a otras ciudades no esta demostrada.
- Un unico seed de entrenamiento, por lo que la varianza entre ejecuciones no esta cuantificada.
- El resultado principal depende de la mezcla de rutas: 75 % en las primeras 200 rutas y 64 % antes del entrenamiento con ruido natural, frente al 78 % de la cifra titular.
- La regla de exito puntua el dibujo como conjunto de celdas; al extraer una polilinea el resultado baja al 76 %, lo que indica cierta laxitud en la metrica de celda.
- Las rutas largas son el modo de fallo dominante: 96 % en rutas de 2-3 frentes frente a 63 % en las de 6 o mas.
- No es un modelo de lenguaje ni un VLM: no acepta texto, no soporta tool calling ni agentes, y no puede integrarse en cadenas de razonamiento verbal.
- Riesgo de alucinacion en el sentido de trazados invalidos: el 22 % de rutas de De Pijp no supera la regla de celda, y en distritos no vistos el fallo sube al 40 %.
- Rendimiento cero-shot muy limitado fuera de su dominio: 51 % en laberintos sinteticos de casa.
- El model-index marca los resultados como no verificados; son cifras declaradas por el autor y no replicadas de forma independiente.
- Licencia MIT para codigo y pesos, apta para uso comercial, pero las licencias de los datos de mapa subyacentes se remiten a DATA_LICENSES.md del repositorio y deben revisarse antes de cualquier uso productivo.
- El tamano del repositorio figura como 0,0 GB en los metadatos de HuggingFace, lo que sugiere que conviene verificar que el checkpoint .pt este efectivamente subido antes de planificar su uso.
- Con 0 descargas y 0 likes, no existe retroalimentacion de la comunidad ni casos de uso en produccion documentados.
- No es adecuado como sistema de enrutado de produccion sin supervision humana, dado su porcentaje de fallo y la falta de validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mxv456/spatial-wave-search-256m
- Repositorio del proyecto: https://github.com/Marvel4U/spatial-reasoning-from-scratch
- Variante de 512 m: https://huggingface.co/mxv456/spatial-wave-search-512m-hero
- Linea base VLM: https://huggingface.co/mxv456/qwen3-vl-2b-lora-map-routes
- Documentacion dentro del repositorio: PAPER.md, REPRODUCE.md (seccion 8) y DATA_LICENSES.md
- Paquete de evaluacion: eval_bundle_v0.2.tar.gz, en los releases del repositorio de GitHub
- Animacion de referencia: wave_search_256m_unseen_district_route342_295m.gif, incluida en la model card
- La busqueda web realizada no devolvio resultados relevantes para este modelo; no se han encontrado papers, blogs ni demos adicionales mas alla de los enlaces anteriores.
