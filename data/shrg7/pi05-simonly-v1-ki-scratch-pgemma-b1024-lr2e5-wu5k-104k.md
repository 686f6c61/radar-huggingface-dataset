# shrg7/pi05-simonly-v1-ki-scratch-pgemma-b1024-lr2e5-wu5k-104k

## Resumen

shrg7/pi05-simonly-v1-ki-scratch-pgemma-b1024-lr2e5-wu5k-104k es un checkpoint de politica robotica del tipo vision-lenguaje-accion (VLA) entrenado con la pila openpi, en concreto sobre la receta pi0.5 implementada en JAX. Lo publica el usuario de HuggingFace shrg7 y corresponde al paso registrado 103999 (26000 actualizaciones del optimizador) de la ejecucion `gpfs_ailab_simonly_v1_ki_scratch_b1024_lr2e5_wu5k_pgemma_run1`.

El modelo parte de PaliGemma pt_224 (codificador visual SigLIP mas modelo de lenguaje Gemma) con un "action expert" inicializado aleatoriamente, es decir, no deriva del checkpoint pi05_base. Se entrena con un objetivo dual de "aislamiento de conocimiento": una cabeza de lenguaje basada en tokens FAST y un experto de acciones con flow matching, con un horizonte de accion de 32 pasos.

Su relevancia es acotada y experimental: es un artefacto de investigacion para manipulacion robotica entrenado exclusivamente con datos de simulacion (MolmoBot pick-and-place y el conjunto simulado realrig9k), sin licencia declarada, con 0 descargas y sin resultados de benchmarks publicados salvo un error absoluto medio (MAE) de muestra en validacion. No es un modelo de proposito general ni un LLM conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) pi0.5; backbone PaliGemma pt_224 (SigLIP + Gemma) con action expert de flow matching y cabeza de lenguaje FAST |
| Parametros totales | no disponible (el autor no publica el recuento; el backbone declarado es PaliGemma pt_224) |
| Parametros activos | no disponible (no se documenta una arquitectura MoE) |
| Longitud de contexto | no disponible (el horizonte de accion declarado es de 32 pasos) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en precision de entrenamiento; sin variantes GGUF, AWQ o GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Orbax (JAX) en `params/`; `assets/` con estadisticas de normalizacion; no incluye estado del optimizador |
| Tamano del repositorio | 12,4 GB |
| Inicializacion | PaliGemma pt_224 (SigLIP + Gemma); action expert aleatorio. No parte de pi05_base |
| Datos de entrenamiento | Solo simulacion: MolmoBot pick-and-place (rlds_molmobot_fpp_20k) y realrig9k sim |
| Batch global | 1024 (microbatches de 256 con acumulacion de gradiente 4) |
| Tasa de aprendizaje | 2e-5 de pico, warmup de 5k actualizaciones y despues constante |
| Pesos publicados | EMA con decaimiento 0,999 |
| Paso guardado | 103999 registrado (equivale a 26000 actualizaciones del optimizador) |
| Checkpoint anterior | shrg7/pi05-simonly-v1-ki-scratch-pgemma-b1024-lr2e5-wu5k-48k |

## Arquitectura y entrenamiento

La arquitectura es un VLA pi0.5 sobre JAX. El backbone es PaliGemma pt_224, que combina un codificador visual SigLIP para imagenes de 224x224 con un modelo de lenguaje Gemma, y sobre el se anade un "action expert" de flow matching inicializado desde cero (no heredado de pi05_base). El entrenamiento usa un objetivo dual denominado "knowledge insulation": una cabeza de lenguaje que predice tokens FAST y un experto de acciones que genera trayectorias continuas mediante flow matching, con horizonte de accion de 32 pasos. La hipotesis de diseno es separar la capacidad semantica del backbone del control motor, de modo que el experto de acciones no degrade las representaciones lingueisticas y visuales preentrenadas.

Los datos son exclusivamente de simulacion: MolmoBot pick-and-place (rlds_molmobot_fpp_20k) mas el conjunto simulado realrig9k. El regimen de entrenamiento parte de una tasa de aprendizaje de 2e-5 con warmup de 5000 actualizaciones y despues constante, con batch global de 1024 obtenido a partir de microbatches de 256 y acumulacion de gradiente de 4; el paso registrado 103999 corresponde a 26000 actualizaciones del optimizador. Los pesos publicados son una media movil exponencial (EMA) con decaimiento 0,999, actualizada por microbatch hasta el reanudado en el paso 32k y por actualizacion del optimizador a partir de ahi; el autor indica que, con ese decaimiento, el historial previo a la correccion ya se ha diluido por completo en este paso. No se documentan fases de RLHF o DPO.

## Capacidades

- Generacion de acciones de robot: el experto de flow matching produce secuencias de accion con horizonte de 32 pasos a partir de observaciones visuales e instrucciones, que es la funcion principal del checkpoint.
- Percepcion visual y comprension de instrucciones en lenguaje: heredadas del backbone PaliGemma pt_224 (SigLIP + Gemma).
- Prediccion de tokens FAST: la cabeza de lenguaje del objetivo dual aisla el conocimiento semantico y produce tokens FAST, el esquema de tokenizacion de acciones del ecosistema pi0.5.
- Manipulacion tipo pick-and-place: es el dominio cubierto por los datos de entrenamiento (MolmoBot).
- No hay soporte documentado de tool calling ni de function calling.
- No hay soporte documentado de agentes, razonamiento multi-paso ni planificacion de tareas de largo horizonte.
- Capacidades multilingues: no disponible (no se declara ningun idioma).
- No se documentan capacidades de audio, ni modo de razonamiento explicito (thinking), ni uso como modelo conversacional de proposito general.

## Casos de uso

- Investigacion en manipulacion pick-and-place en simulacion: el checkpoint se puede cargar en la pila openpi para reproducir el entrenamiento y evaluar politicas de agarre y colocacion en los entornos de MolmoBot, que son exactamente el dominio de los datos.
- Estudio del objetivo "knowledge insulation": permite comparar si la cabeza FAST y el experto de acciones preservan las representaciones de PaliGemma frente a variantes que entrenan el backbone de forma conjunta.
- Punto de partida para fine-tuning con datos reales: al ser un checkpoint sim-only y sin estado del optimizador, resulta adecuado como inicializacion para ajuste posterior con datos de robot real, siempre que se asuma el salto sim-a-real.
- Evaluacion de estrategias de EMA en entrenamiento VLA: el autor documenta el cambio de semantica de la EMA (por microbatch hasta el paso 32k, por actualizacion despues), lo que permite analizar el impacto de ese regimen en las metricas de validacion.
- Generacion de trayectorias en entornos simulados para analisis de control: las predicciones de 32 pasos se pueden registrar y comparar contra las acciones de referencia para medir error por paso y por articulacion.
- Prototipado academico en laboratorios de robotica: sirve para montar un banco de pruebas de inferencia JAX con Orbax antes de invertir en checkpoints mayores.
- Reproduccion de la receta de entrenamiento: la configuracion documentada (batch 1024, LR 2e-5, warmup 5k, horizonte 32) permite replicar el run en clúster con GPUs o TPUs.
- Comparacion de checkpoints de una misma ejecucion: junto con el checkpoint de 48k del mismo run, facilita curvas de aprendizaje y estudios de estabilidad de las medias moviles.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni tasas de exito en tareas de robot). La unica metrica reportada es interna, sobre parametros en crudo (no EMA) y 8 lotes de validacion:

| Metrica | Valor | Condiciones |
|---|---|---|
| MAE de muestra (media) | ~0,137 | Pasos registrados 100k-104k, 8 lotes, parametros sin EMA |
| MAE de muestra (mejor lectura) | 0,119 | Paso 96k, sin checkpoint conservado en ese paso |
| Tasa de exito en tareas | no disponible | No reportada |
| Benchmarks de lenguaje o codigo | no disponible | No reportados |

No se han publicado resultados de benchmarks comparativos con otros modelos VLA en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no confirmada por el autor. Como referencia, el repositorio ocupa 12,4 GB y contiene `params/` (Orbax) mas `assets/`; en bf16 los pesos ocupan del orden de 12 GB, por lo que se recomienda un minimo orientativo de 16-24 GB de VRAM para inferencia con margen para activaciones de imagen y estado del experto de acciones. Es una estimacion, no un dato publicado.
- GPU recomendadas: no disponible en la informacion del autor. Por tamano, el rango habitual para este tipo de checkpoint es A100 40/80 GB, H100 o L40S en entornos de investigacion.
- GPU de consumo: previsiblemente viable en RTX 4090 (24 GB) o RTX 3090 (24 GB) en bf16, siempre que la version de JAX/XLA y el servidor de politicas permitan el ajuste; no confirmado por el autor.
- Opciones de despliegue: el formato publicado es Orbax para JAX dentro de la pila openpi. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos en safetensors ni GGUF.
- Latencia y throughput estimados: no disponible. No hay mediciones de frecuencia de inferencia ni de tiempo por paso de control.
- Almacenamiento: el repositorio descargado ocupa 12,4 GB, sin contar el entorno JAX ni los datasets simulados.

## Comparativa con modelos similares

No hay datos comparativos publicados en la informacion disponible. La unica referencia interna es que este checkpoint no parte de pi05_base, sino de PaliGemma pt_224 con experto de acciones aleatorio.

| Modelo | Tipo | Datos de entrenamiento | Licencia | Datos comparativos |
|---|---|---|---|---|
| pi05-simonly-v1-ki-scratch-pgemma-b1024-lr2e5-wu5k-104k (este) | VLA pi0.5 en JAX | Sim-only: MolmoBot pick-and-place + realrig9k sim | no disponible | MAE de muestra ~0,137 |
| pi05_base (openpi) | VLA pi0.5 | no disponible | no disponible | no disponible |
| pi0 (openpi) | VLA | no disponible | no disponible | no disponible |
| Alternativas externas (OpenVLA, RDT, GR00T) | VLA | no disponible | no disponible | no disponible |

No se dispone de comparaciones de parametros, contexto, rendimiento ni disponibilidad frente a estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos de simulacion (MolmoBot pick-and-place y realrig9k sim): el salto sim-a-real no esta evaluado y es el principal riesgo si se pretende usar en un robot fisico.
- Sin licencia declarada: no se puede asumir permiso de uso comercial, redistribucion ni modificacion. Hay que contactar con el autor antes de cualquier uso en produccion.
- Metricas pobres o incompletas: solo se reporta un MAE de muestra (~0,137 de media, 0,119 como mejor lectura puntual) sobre parametros sin EMA; no hay tasa de exito por tarea, ni evaluacion por articulacion, ni intervalos de confianza.
- Sin estado del optimizador en el repositorio: no esta pensado para reanudar el entrenamiento tal cual, solo para inferencia o inicializacion.
- Formato Orbax/JAX: la integracion fuera del ecosistema openpi requiere conversion, y no se publican versiones en safetensors, GGUF ni cuantizaciones.
- Riesgo de alucinacion y de comportamiento fuera de distribucion: al ser un modelo de accion, los fallos se manifiestan como trayectorias erroneas o inseguras, no como texto incorrecto. No hay evaluacion de seguridad fisica.
- Idiomas no declarados: no se puede garantizar que las instrucciones en castellano u otros idiomas se interpreten correctamente.
- Validacion por la comunidad nula: 0 descargas y 0 likes en el momento de la consulta, sin resultados de terceros que confirmen las cifras del autor.
- Ambiguedad en el regimen de EMA: el propio autor documenta un cambio de semantica a mitad del entrenamiento, lo que complica la comparabilidad con otros checkpoints.
- Estado del proyecto: es un artefacto de investigacion con nombre de ejecucion interno; no hay garantia de mantenimiento ni de soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shrg7/pi05-simonly-v1-ki-scratch-pgemma-b1024-lr2e5-wu5k-104k
- Checkpoint anterior del mismo run: https://huggingface.co/shrg7/pi05-simonly-v1-ki-scratch-pgemma-b1024-lr2e5-wu5k-48k
- Framework openpi (JAX) mencionado en la model card: referencia citada por el autor, sin URL en la informacion disponible
- PaliGemma pt_224 como inicializacion: referencia citada por el autor, sin URL en la informacion disponible
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron contenido sin relacion (temas de Pinterest y Zhihu). No disponible cualquier paper, blog o demo adicional.
