# fredzzh/NanoJev

## Resumen

NanoJev es un modelo de decision de ~0,6 B de parametros construido sobre el backbone de Qwen/Qwen3-0.6B al que se le anaden cabezas estructuradas de decision. En lugar de generar texto token a token, devuelve distribuciones de probabilidad completas sobre un conjunto dinamico de candidatos: eleccion entre 2 y 255 opciones, probabilidad booleana de una proposicion y puntuacion sobre 2 a 10 niveles ordenados con score esperado. Lo publica el usuario fredzzh en HuggingFace, con el codigo fuente, los datos y la guia de ejecucion alojados en el repositorio GitHub TianyuCodings/NanoJev y en el dataset C-Tianyu/NanoJev-Data.

Su propuesta tecnica es la inferencia paralela: varios estados y varias preguntas se evaluan en un unico forward batcheado del backbone, sin decodificacion de tokens de salida. El autor reporta como medida real de servicio 6 estados, 18 preguntas y 44 caminos candidatos resueltos en un solo forward. Esto lo situa en la categoria de los "system one models" descritos por Jev (typesafe.ai), de los que NanoJev se presenta explicitamente como una replica nano.

Su relevancia practica esta en entornos de decision y control (navegacion en laberintos, Snake, juicios de seguridad locales, comparacion de preguntas sobre un mapa completo) donde interesa una politica que devuelva una distribucion calibrada sobre acciones, no una frase. El repo ocupa 19,1 GB porque incluye el checkpoint base en la raiz mas seis variantes especializadas con pesos, configuracion, tokenizer y resumen de entrenamiento. No se ha publicado licencia ni longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3-0.6B) con cabezas de decision estructuradas para choice, boolean y score |
| Parametros totales | ~0,6 B en el backbone; el numero exacto de parametros de las cabezas de decision no esta disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; la unica precision documentada es bf16 para inferencia y los pesos se distribuyen sin cuantizar en safetensors |
| Idiomas soportados | en, zh |
| Licencia | no disponible |
| Formato de pesos | safetensors (`best.safetensors`) en la raiz, mas `config.json`, `tokenizer/` y `backbone_config/`; cada variante incluye sus propios pesos, configuracion, tokenizer y configuracion de backbone |
| Modelo base | Qwen/Qwen3-0.6B (finetune) |
| Tamano del repositorio | 19,1 GB (incluye checkpoint base y seis variantes) |
| Libreria declarada | pytorch |
| Tipos de pregunta soportados | choice (2-255 candidatos), boolean, score (2-10 niveles ordenados con distribucion completa y score esperado) |
| Idiomas de la model card | ingles |
| Region declarada | us |

## Arquitectura y entrenamiento

NanoJev parte de un backbone transformer Qwen3-0.6B preentrenado y le superpone cabezas de decision que no dependen de generar texto: el modelo evalua en un unico forward batcheado del backbone todos los pares estado-pregunta y emite directamente la distribucion de probabilidad sobre los candidatos ofrecidos. De ahi las tres modalidades: choice, con un numero dinamico de candidatos entre 2 y 255; boolean, con la probabilidad de que una proposicion sea cierta; y score, con una distribucion completa sobre 2 a 10 niveles ordenados junto con el score esperado. La consecuencia practica es que se puede seleccionar de forma greedy o muestrear de la distribucion (el benchmark de navegacion usa muestreo de probabilidad con T=1) sin coste de decodificacion autorregresiva.

La informacion disponible no detalla el numero de tokens de entrenamiento ni la composicion del dataset. Si se enumeran las variantes publicadas, cada una con su resumen de entrenamiento: `local_atomic_seed17` (juicios de seguridad locales usados en la demo de laberinto 50x50), `games_gold_seed17` (eleccion dinamica de acciones en la demo de Snake 12x12), `games_api_seed17` (comparacion de preguntas sobre mapa completo), `events_ce_seed17` (control de entropia cruzada sobre eventos observados), `events_brier_seed17` (control Brier sobre eventos observados) y `events_paired_seed17` (experimento de recompensa propia emparejada inspirado en RLCD). La existencia de controles con entropia cruzada y Brier, ademas de un experimento emparejado, indica un trabajo explicito de calibracion de las distribuciones de salida, aunque no se publican detalles de RLHF o DPO.

## Capacidades

- Decision estructurada sobre conjuntos dinamicos de candidatos: eleccion con probabilidad por candidato para entre 2 y 255 opciones.
- Juicio booleano calibrado: devuelve la probabilidad de que una proposicion sea verdadera.
- Puntuacion ordinal: distribucion completa sobre 2 a 10 niveles ordenados mas el score esperado.
- Inferencia paralela: multiples estados y preguntas en un unico forward batcheado del backbone, con cero decodificacion de tokens de salida.
- Servicio persistente: carga un checkpoint una vez y lo reutiliza entre peticiones.
- Seleccion greedy o por muestreo de probabilidad a partir de la distribucion devuelta.
- Control de agente en entornos de navegacion y juego (laberintos, Snake) compuesto con codigo de planificacion compartido.
- Idiomas: ingles y chino (en, zh) segun los metadatos del modelo.
- No se documenta soporte de tool calling, function calling, vision, audio, modo de razonamiento explicito ni capacidades multimodales.

## Casos de uso

- Control de agentes en entornos de navegacion: el modelo puede emitir la distribucion de acciones en una sola pasada para cada estado observable. En el benchmark de navegacion alcanza 19/20 mapas de test 4x4 y 18/20 mapas OOD 6x6 con muestreo T=1, lo que lo hace adecuado para bucles de planificacion donde cada decision debe resolverse con minima latencia.
- Juicios de seguridad locales en robotica o simulacion: la variante `local_atomic_seed17` esta entrenada para juicios atomicos de seguridad y se uso en la demo de laberinto 50x50, que alcanza el objetivo en 244 intentos. Encaja en capas de salvaguarda que deben evaluar muchas condiciones del estado por ciclo de control.
- Automatizacion de edificios y control ambiental: con una pregunta de tipo choice sobre acciones (encender aire, luces o no hacer nada), boolean sobre presencia y score sobre el exceso de temperatura, el modelo resuelve en un solo forward la politica de climatizacion a partir de una descripcion en lenguaje natural del estado.
- Clasificacion y enrutamiento con candidatos variables: dado que admite entre 2 y 255 candidatos por pregunta, sirve para enrutar peticiones hacia etiquetas o colas definidas dinamicamente en tiempo de ejecucion, sin reentrenar el modelo por cada nuevo conjunto de etiquetas.
- Etiquetado automatico con umbral de confianza: al devolver la distribucion completa y no solo la clase ganadora, permite derivar umbrales, abstenerse en casos de baja confianza o priorizar revision humana, algo que la variante `events_brier_seed17` esta disenada a controlar.
- Investigacion en calibracion y RL: los checkpoints `events_ce_seed17`, `events_brier_seed17` y `events_paired_seed17` permiten comparar funciones de perdida sobre eventos observados y experimentar con recompensas propias emparejadas, usando NanoJev como sujeto de prueba de bajo coste.
- Evaluacion de politicas en juegos: la variante `games_gold_seed17` permite evaluar decisiones sobre acciones en un tablero 12x12; en la partida grabada con control greedy recoge 27 comidas y sobrevive 256 pasos.
- Comparacion de preguntas sobre mapa completo: `games_api_seed17` esta pensado para comparar respuestas a preguntas sobre el mapa entero, util como modulo de razonamiento global en planificadores que ya disponen del estado completo.

## Benchmarks y rendimiento

Unicos resultados publicados en la informacion disponible: benchmark de navegacion con 20 mapas de test y 20 mapas OOD, controlador con muestreo de probabilidad T=1.

| Sistema | 4x4 test | 6x6 OOD |
|---|---:|---:|
| NanoJev entrenado | 19/20 - 95% | 18/20 - 90% |
| Jev | 20/20 - 100% | 19/20 - 95% |
| Qwen3-0.6B original | 7/20 - 35% | 3/20 - 15% |

Notas del autor sobre la comparacion: el Qwen3-0.6B original no tiene ajuste especifico de tarea y su distribucion de acciones se obtiene de la cabeza nativa de modelo de lenguaje, condicionada a los tokens de respuesta A-D ofrecidos.

Resultados de las demos grabadas:

| Escenario | Resultado |
|---|---|
| Laberinto 50x50 (variante `local_atomic_seed17`) | alcanza el objetivo en 244 intentos |
| Snake 12x12 (variante `games_gold_seed17`) | 27 comidas y 256 pasos con control greedy |
| Medida de servicio | 6 estados, 18 preguntas, 44 caminos candidatos, 1 forward del backbone |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas de lenguaje general en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Estimacion derivada del recuento de parametros (solo pesos, sin cabezas, activaciones ni cache): en fp32 unos 2,4 GB; en bf16 unos 1,2 GB; en int8 en torno a 0,6 GB; en int4 en torno a 0,3 GB. La unica precision documentada para la ejecucion de referencia es bf16.
- GPU recomendadas: el entorno de referencia se declara compatible con CUDA y se lanza con `CUDA_VISIBLE_DEVICES=0`. Por tamano, cualquier GPU con al menos 4 GB de VRAM deberia poder ejecutar el checkpoint en bf16; una A100 o H100 solo aportarian ventaja en paralelismo y numero de peticiones concurrentes, no en requisito de memoria.
- GPU de consumo: si, cabe previsiblemente en RTX 3060 (12 GB), RTX 4060, RTX 4070, RTX 4080 y RTX 4090, asi como en portatiles con 6 GB o mas, al tratarse de un modelo de ~0,6 B de parametros.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. El autor proporciona scripts propios (`scripts/predict_toy_decisions.py`) con los argumentos `--checkpoint-dir`, `--input`, `--output`, `--batch-questions`, `--precision` y `--temperature`, ademas de un servicio persistente que acepta `--checkpoint-dir` y reutiliza el checkpoint entre peticiones. La instalacion se hace con `python -m pip install -r requirements-toy.txt`.
- Latencia y throughput: no se publican cifras de latencia ni de tokens por segundo (no hay decodificacion de tokens). La unica referencia de rendimiento es que 6 estados, 18 preguntas y 44 caminos candidatos se resuelven en un unico forward batcheado.
- Almacenamiento: el repositorio completo ocupa 19,1 GB, pero la descarga puede limitarse al checkpoint base o a una sola variante mediante `allow_patterns` en `snapshot_download`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Navegacion 4x4 test | Navegacion 6x6 OOD | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| NanoJev | ~0,6 B (backbone Qwen3-0.6B mas cabezas) | no disponible | 19/20 - 95% | 18/20 - 90% | no disponible | Pesos safetensors en HuggingFace, codigo y datos abiertos en GitHub |
| Jev | no disponible | no disponible | 20/20 - 100% | 19/20 - 95% | no disponible | Referencia comercial de typesafe.ai; NanoJev se presenta como su replica nano |
| Qwen3-0.6B (original) | ~0,6 B | no disponible en esta ficha | 7/20 - 35% | 3/20 - 15% | no disponible en esta ficha | Modelo base publico usado como punto de partida |

La comparacion directa con Jev y Qwen3-0.6B procede exclusivamente de la tabla de navegacion publicada por el autor. No se dispone de datos para comparar con otras alternativas de decision estructurada o de control de agentes de tamano similar.

## Limitaciones y advertencias

- Licencia no especificada: sin licencia publicada no puede asumirse permiso de uso comercial, redistribucion ni modificacion. Es un bloqueo para cualquier despliegue en produccion serio.
- La model card esta redactada en ingles y solo declara soporte de ingles y chino; no hay evidencia de rendimiento en castellano.
- Riesgo de alucinacion en juicios booleanos y en la asignacion de probabilidades: el modelo devuelve una distribucion calibrada estadisticamente en sus dominios de entrenamiento, no una verificacion factual. Un score alto no implica correccion.
- Generalizacion limitada y poco documentada: los resultados se limitan a navegacion 4x4/6x6 (20 mapas de test y 20 OOD) y a demos concretas de laberinto y Snake. No hay evidencia de comportamiento fuera de esos dominios ni de robustez ante distribuciones muy distintas.
- El checkpoint base y las variantes estan especializados por tarea. Usar el checkpoint raiz para un juego o una variante de juego para juicios de seguridad no esta respaldado por los resultados publicados.
- No es un modelo conversacional: no genera texto libre, no soporta tool calling ni agentes multi-paso por si mismo. La planificacion se realiza en codigo externo que compone las decisiones del modelo.
- No se publica longitud de contexto, por lo que se desconoce cuanta informacion de estado cabe en una peticion.
- No hay cuantizaciones publicadas (GGUF, GPTQ, AWQ) ni integracion con runtimes estandar de inferencia, lo que obliga a usar los scripts del repositorio y un entorno CUDA compatible.
- El repositorio ocupa 19,1 GB por acumular checkpoint base y variantes; conviene filtrar la descarga para no traer variantes que no se vayan a usar.
- Discrepancia de identificadores a tener en cuenta: la ficha de HuggingFace corresponde a `fredzzh/NanoJev`, mientras que la model card y los ejemplos de descarga referencian `C-Tianyu/NanoJev` y el dataset `C-Tianyu/NanoJev-Data`. Conviene verificar cual es el repositorio canonico antes de integrarlo.
- Senales de adopcion nulas en el momento de la consulta: 0 descargas y 0 likes, creado y actualizado el 2026-09-19, sin senales de mantenimiento posterior.
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo; los resultados obtenidos estaban relacionados con colchones plegables y no aportan informacion tecnica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fredzzh/NanoJev
- Modelo referenciado en la model card: https://huggingface.co/C-Tianyu/NanoJev
- Codigo fuente: https://github.com/TianyuCodings/NanoJev
- Dataset de entrenamiento: https://huggingface.co/datasets/C-Tianyu/NanoJev-Data
- Datos de los juegos: https://huggingface.co/datasets/C-Tianyu/NanoJev-Data/tree/main/games_v4
- Comandos del pipeline: https://github.com/TianyuCodings/NanoJev/blob/main/research/pipeline_runbook.md
- Guia de publicacion de los juegos: https://github.com/TianyuCodings/NanoJev/blob/main/docs/GAME_RELEASE.md
- Demos grabadas de los juegos: https://github.com/TianyuCodings/NanoJev#recorded-showcase-runs
- Manifiesto de variantes: GAMES_MODEL_MANIFEST.json (en el repositorio de HuggingFace)
- Articulo de referencia sobre system one models y Jev: https://typesafe.ai/blog/introducing-system-one-models-and-jev
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Resultados de busqueda web sobre el modelo: no disponible (los resultados devueltos no eran relevantes)
