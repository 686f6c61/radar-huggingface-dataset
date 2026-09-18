# dean22029/pr_fm_gemma3_12b_adapter

## Resumen

`dean22029/pr_fm_gemma3_12b_adapter` es un adaptador QLoRA (PEFT) sobre `google/gemma-3-12b-it` que resuelve una tarea muy concreta: predecir el resultado de un experimento de conjoint de eleccion forzada. Dado el contexto del estudio (pais, ano, descripcion), las caracteristicas del encuestado y dos perfiles alternativos (A y B), el modelo devuelve que perfil eligio ese encuestado. No es un modelo conversacional: esta ajustado para emitir un unico token de respuesta, `A` o `B`.

El adaptador lo publica el usuario `dean22029` como linea base de investigacion para ciencia politica y modelado de preferencias. Se entreno sobre 711 617 pares construidos a partir de 115 experimentos de conjoint publicados, empaquetados en el bundle de datos `preference_fm` (127 experimentos, 115 utilizables), que no se redistribuye con el adaptador.

Su relevancia es metodologica: demuestra que un LLM ajustado puede funcionar como "encuestado sintetico" con una calibracion razonable (log loss 0,6167-0,6713 frente al nulo de 0,693) donde el modelo base sin ajustar queda practicamente bloqueado en una sola letra (log loss 1,3874-1,6709). Con 0 descargas y 0 likes en el momento de redactar esta ficha, carece de validacion externa por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only: `google/gemma-3-12b-it` |
| Parametros totales | 12 000 M en el modelo base; parametros del adaptador: no disponible |
| Longitud de contexto | 1024 tokens (max seq len de entrenamiento). Contexto nativo del modelo base: no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Base en 4-bit NF4 con doble cuantizacion y computo en bf16; pesos del adaptador en safetensors (fusionables con el base) |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | `gemma` (terminos de uso de Gemma) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); no se publica GGUF |
| Metodo de ajuste | QLoRA, r=16, alpha=32, dropout 0,05 |
| Modulos objetivo | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |
| Optimizador | `paged_adamw_8bit`, lr 1e-4, scheduler coseno, warmup 3% |
| Pasos de entrenamiento | 6000 (0,51 epocas) |
| Tamano del repositorio | 0,3 GB |
| Tarea | Eleccion forzada A/B en experimentos de conjoint (una unica pasada forward, sin generacion) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16 y alpha 32 con dropout 0,05, aplicado sobre las proyecciones de atencion y de la MLP (`q,k,v,o,gate,up,down_proj`) del modelo `google/gemma-3-12b-it`. El entrenamiento usa QLoRA: el modelo base se carga cuantizado en 4-bit NF4 con doble cuantizacion y el computo se realiza en bf16. La perdida se enmascara para calcularse unicamente sobre el token de respuesta del asistente, es decir, la letra `A` o `B`.

El conjunto de entrenamiento son 711 617 pares derivados de 115 experimentos de conjoint, con prompts construidos desde el bundle `preference_fm`. El run completo vio aproximadamente el 51% del conjunto: se detuvo por limite de pasos (6000), no por convergencia de una epoca completa. La precision de eleccion en validacion fue de 0,630 en el paso 2000, 0,633 en el 4000 y 0,640 en el 6000, estable en las ultimas evaluaciones. El batch efectivo fue de ~60 con batch por dispositivo 4, distribuido en A100 40 GB con DDP. Los datos se particionaron por ano de experimento con criterio `experiment_year <= 2021` para el conjunto de entrenamiento.

## Capacidades

- Puntuacion de eleccion forzada: devuelve `P(A)` a partir de `logits[:, -1, :]` indexando los ids de token unicos de `"A"` y `"B"` y aplicando softmax sobre esas dos posiciones.
- Condicionamiento en covariables del encuestado: acepta pares `nombre: valor` (por ejemplo, demografia, ideologia, atributos personales) verbalizados en el bloque de usuario.
- Condicionamiento en contexto del estudio: pais, ano y descripcion del experimento forman parte de la superficie de entrada.
- Comparacion de perfiles multiatributo: cada opcion se verbaliza como lista de pares `factor: nivel`.
- Calibracion de probabilidades: el ajuste desplaza la media de `P(A)` hacia ~0,5, corrigiendo el sesgo del base hacia una sola letra.
- No soporta tool calling ni function calling.
- No esta disenado para agentes, razonamiento multi-paso ni generacion de texto libre.
- Capacidades multilingues: no documentadas en la informacion disponible.
- No dispone de modo thinking, vision ni audio (se usa solo la via de texto del modelo base).

## Casos de uso

- Analisis de conjoint asistido por LLM: dado un diseno de estudio y un perfil de encuestado, estimar la probabilidad de eleccion de cada alternativa para explorar efectos de atributos antes de recoger datos de campo. El adaptador ofrece una linea base calibrada (log loss 0,6167 en `test_within`) frente al base sin ajustar.
- Encuestados sinteticos para pre-test de instrumentos: generar elecciones plausibles bajo hipotesis de covariable (por ejemplo, "mujer, 45 anos, urbana, ideologia de centro") y detectar disenos que producen respuestas degeneradas antes de gastar presupuesto de campo.
- Analisis de sensibilidad y robustez de estudios: repetir la puntuacion variando sistematicamente niveles de atributos manteniendo fijo el perfil del encuestado, aprovechando que la inferencia es una unica pasada forward por par, sin generacion.
- Imputacion de elecciones faltantes en replicaciones: donde un experimento original no publica elecciones a nivel de respondiente, usar las puntuaciones del adaptador como aproximacion documentada, siempre que el corte temporal de `SPLITS.md` sea respetado.
- Comparacion metodologica entre especificaciones: usar el adaptador como baseline de LLM frente a modelos de eleccion discretos clasicos (logit condicional) sobre el mismo conjunto de pares, con la metrica de AUC y log loss por experimento.
- Docencia e investigacion reproducible en ciencia politica: el repositorio incluye `eval_example.py`, `SPLITS.md`, `splits_summary.csv`, `log_history.json` y los scripts de `pipeline/`, lo que permite reproducir el pipeline de datos y la evaluacion paso a paso.
- Investigacion sobre sesgo de posicion en LLM: entrenado con orientacion A/B aleatorizada, sirve para medir cuanto sesgo posicional reintroduce una evaluacion con orden fijo y para validar estrategias de promediado de ambas ordenaciones.
- Analisis de heterogeneidad entre estudios: el desglose `by_experiment` permite identificar en que tipos de diseno de conjoint el modelo se aleja del azar y en cuales falla, informacion util para decidir si merece la pena escalar el enfoque.

## Benchmarks y rendimiento

Resultados publicados en la model card. Una pasada forward por par, sin generacion, base en 4-bit NF4. La tasa base de la etiqueta es ~50% por construccion, de modo que el log loss nulo es 0,693 y la exactitud es exactitud de par ganador. "zeroshot" es el mismo modelo base sin adaptador y con los mismos prompts.

| Split | Run | n pares | Exactitud | AUC | Log loss | Delta vs nulo | Brier |
|---|---|---|---|---|---|---|---|
| `test_chrono` | finetuned | 58 910 | 0,582 | 0,624 | 0,6713 | 0,0218 | 0,2394 |
| `test_chrono` | zeroshot | 58 910 | 0,548 | 0,570 | 1,3874 | -0,6943 | 0,3606 |
| `test_within` | finetuned | 61 120 | 0,655 | 0,716 | 0,6167 | 0,0765 | 0,2143 |
| `test_within` | zeroshot | 61 120 | 0,522 | 0,523 | 1,6709 | -0,9778 | 0,3951 |

Precision de eleccion en validacion durante el entrenamiento: 0,630 (paso 2000), 0,633 (paso 4000), 0,640 (paso 6000).

Advertencias del propio autor sobre estas cifras: el ajuste mejora sobre todo la calibracion, no la discriminacion (el base zeroshot ya ordena los pares de forma casi equivalente, pero con un log loss mucho peor que el nulo porque se queda clavado en una letra); y los resultados por experimento son muy heterogeneos, con AUC individuales que van desde por debajo del azar hasta ~0,94 en los 31 estudios que componen `test_chrono`. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks de proposito general en la informacion disponible, ni tendrian sentido para este artefacto.

## Requisitos de hardware

- VRAM en 4-bit NF4 (configuracion de referencia): el modelo base de 12B cuantizado ocupa en torno a 7-8 GB de pesos, mas overhead de activaciones y cache KV. Es la configuracion recomendada para reproducir los numeros publicados.
- VRAM en bf16: los pesos del base rondan los 24 GB, por lo que se necesitan del orden de 28-32 GB de VRAM para trabajar con comodidad. El autor advierte que cargar el base en bf16 desplaza los resultados respecto a las cifras publicadas.
- GPU recomendadas: A100 40 GB (usada en entrenamiento con DDP) o H100 para lotes grandes en bf16. Para 4-bit, una RTX 4090 o RTX 3090 de 24 GB es suficiente.
- Cabe en GPU de consumo: si, en 4-bit NF4, en tarjetas de 16-24 GB (RTX 4090, RTX 3090, RTX 4080, RTX 4070 Ti Super). En tarjetas de 12 GB (RTX 4070, RTX 3060 12 GB) el encaje es ajustado y depende de la longitud de secuencia y del tamano de lote.
- Opciones de despliegue: `transformers` + `peft` (flujo documentado en `eval_example.py` con `padding_side="left"` para puntuacion por lotes); vLLM o TGI si se necesita servir el adaptador LoRA a escala; llama.cpp u Ollama solo tras fusionar el adaptador con el base y convertir a GGUF, algo que la model card no documenta.
- Latencia y throughput: no se publican cifras de latencia ni de tokens por segundo. La inferencia es una unica pasada forward por par y no genera texto, por lo que el coste por par es notablemente inferior al de una generacion autoregresiva.
- Entrenamiento: A100 40 GB con DDP, batch por dispositivo 4, batch efectivo ~60, 6000 pasos.

## Comparativa con modelos similares

No se dispone de informacion sobre otros adaptadores publicos de la misma tarea con los que comparar directamente. La comparacion relevante que si aporta la documentacion es contra el mismo modelo base sin ajustar y contra el nulo estadistico:

| Modelo / referencia | Parametros | Contexto | Exactitud (`test_within`) | AUC (`test_within`) | Log loss (`test_within`) | Licencia |
|---|---|---|---|---|---|---|
| Este adaptador (QLoRA sobre Gemma 3 12B IT) | 12 000 M base + adaptador | 1024 en entrenamiento | 0,655 | 0,716 | 0,6167 | `gemma` |
| `google/gemma-3-12b-it` zeroshot | 12 000 M | no disponible | 0,522 | 0,523 | 1,6709 | `gemma` |
| Nulo de tasa base (50%) | no aplica | no aplica | 0,500 | 0,500 | 0,6930 | no aplica |

Alternativas de la misma categoria (adaptadores PEFT para modelado de eleccion o encuestados sinteticos entrenados sobre `preference_fm`): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat de proposito general. Esta ajustado para emitir un unico token (`A` o `B`) y solo hace esa tarea.
- Alta sensibilidad al formato de entrada. Parafrasear el system prompt o reordenar el bloque de usuario saca al modelo de distribucion; la model card indica que se entrene exactamente sobre esa superficie.
- Sesgo de posicion A/B. La orientacion se aleatorizo en entrenamiento; con un orden fijo en inferencia reaparece el sesgo. La recomendacion es aleatorizar la orientacion por par o promediar ambas ordenaciones.
- Heterogeneidad extrema por experimento. En `test_chrono`, la media de 0,582 y AUC 0,624 sobre 31 estudios esconde AUC individuales desde por debajo del azar hasta ~0,94. Citar la media sin el desglose `by_experiment` es enganoso.
- La mejora es principalmente de calibracion, no de discriminacion. El base zeroshot ordena los pares de forma parecida, pero su log loss empeora el nulo y queda cerca de una sola letra.
- Riesgo de sobreinterpretacion de `P(A)`. Es la softmax sobre dos logits, no una probabilidad empirica calibrada por estudio; en produccion o en analisis secundarios conviene recalibrar por experimento.
- Sin opcion de abstencion. El formato de salida solo admite `A` o `B`; el modelo no puede expresar "no lo se" ni "empate".
- Solapamiento de datos. El entrenamiento uso todo experimento con `experiment_year <= 2021`, de modo que un conjunto de test construido con un corte inferior se solapa con el entrenamiento. Hay que revisar `SPLITS.md` antes de comparar cifras.
- Datos no redistribuidos. El bundle `preference_fm` no se incluye y no es redistribuible: 113 de los 127 experimentos no declaran licencia y los archivos de replicacion originales provienen de Dataverse y fuentes similares con sus propios terminos. Reconstruir el dataset exige una copia propia del bundle.
- Modelo base restringido. `google/gemma-3-12b-it` esta sujeto a aprobacion de terminos en HuggingFace; sin `huggingface-cli login` y la cuenta autorizada, el ejemplo no se ejecuta.
- Licencia `gemma`. Cualquier uso comercial queda sujeto a los terminos de uso de Gemma, que imponen obligaciones y restricciones adicionales mas alla de las habituales de una licencia open source permisiva.
- Sesgos de los datos de origen. Al derivar de estudios de conjoint publicados, hereda el sesgo de seleccion de que materias, paises y periodos llegan a publicarse, con predominio de los cortes temporales mas antiguos.
- Cero validacion externa. El repositorio tiene 0 descargas y 0 likes, sin evaluaciones independientes que confirmen los numeros.
- Idiomas no declarados. La model card no especifica cobertura linguistica del adaptador; el entrenamiento se realizo sobre prompts en el formato mostrado, presumiblemente en ingles.
- Anomalia en metadatos. Las fechas del repositorio (creacion y actualizacion) apuntan a septiembre de 2026, incoherentes con el resto de la informacion disponible; conviene no usar esa marca temporal como referencia.
- Resultados de busqueda web no relevantes. Las consultas realizadas no devolvieron ninguna fuente util sobre este modelo ni sobre la tarea.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dean22029/pr_fm_gemma3_12b_adapter
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Libreria PEFT: https://github.com/huggingface/peft
- Terminos de uso de Gemma (licencia `gemma`): https://ai.google.dev/gemma/terms
- Artefactos citados en la model card y disponibles en el repositorio: `eval_example.py`, `adapter_config.json`, `log_history.json`, `SPLITS.md`, `splits_summary.csv`, `pipeline/` (scripts `export_experiments.R`, `make_codebooks.py`, `build_dataset.py`)
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada
