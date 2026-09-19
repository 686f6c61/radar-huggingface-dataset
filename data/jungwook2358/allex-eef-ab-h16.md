# jungwook2358/allex-eef-AB-h16

## Resumen

allex-eef-AB-h16 es un modelo de visión-lenguaje-acción (VLA) para robótica, publicado en Hugging Face por el usuario jungwook2358. Se trata de un *mid-train* del modelo base RLDX-1-PT-IMG (de RLWRLD) sobre el corpus ALLEX, en el que las acciones se representan como posiciones absolutas de efector final (EEF) de 50 dimensiones, con un horizonte de predicción de 16 pasos. El modelo está pensado para controlar un robot bimanual con dos cámaras ego (izquierda y derecha) y realimentación de estado, no como un asistente conversacional de propósito general.

El checkpoint pertenece a una familia de experimentos con dos brazos (el sufijo "AB" alude a esta variante). Sobre la configuración común, esta versión añade dos mecanismos: CogAlign (una pérdida de alineamiento entre el *pooled cog token* y el estado de 50D, con peso 0,2) y *actlat*, que sustituye el objetivo de *flow matching* sobre acciones crudas por las latentes z de un tokenizador de acciones congelado. Ambos se activan exclusivamente mediante variables de entorno, por lo que no quedan reflejados en el `conf.yaml` del repositorio.

El repositorio ocupa 32,6 GB e incluye tres checkpoints (pasos 20.000, 30.000 y 40.000, con objetivo de 60.000) y un tokenizador de acciones de la etapa 1 necesario para la inferencia. No se han publicado métricas de rendimiento ni información sobre idiomas o cuantización. La licencia se declara como "other", sin detalle de condiciones en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) derivada de RLDX-1-PT-IMG: backbone VLM congelado mas cabeza de accion con flow-matching sobre latentes de un tokenizador de acciones |
| Parametros totales | no disponible (el repositorio ocupa 32,6 GB e incluye 3 checkpoints y el tokenizador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se apoya en el modelo base RLDX-1-PT-IMG y sigue el patron habitual de los VLA modernos: un backbone de vision-lenguaje que actua como codificador de observaciones (dos camaras ego, izquierda y derecha) y de la instruccion, y una cabeza de accion que genera secuencias de acciones mediante *flow matching*. En esta variante, el backbone permanece congelado durante el entrenamiento (`tune_llm=False`, `tune_visual=False`, `tune_top_llm_layers=0`), de modo que solo se optimiza la parte de accion y los adaptadores asociados. El objetivo de *flow matching* no se calcula sobre acciones crudas, sino sobre las latentes z de un tokenizador de acciones congelado (`--actlat-mode`, `--actlat-embodiment-id allex`), lo que constituye la innovacion principal de este brazo.

Las acciones son EEF absolutas de 50D con el siguiente desglose: 9 dimensiones de `left_wrist_wrt_base`, 9 de `right_wrist_wrt_base`, 15 de articulaciones de la mano izquierda, 15 de la mano derecha y 2 de articulaciones de cuello, excluyendo la cintura y sin relatividad respecto a un estado previo. El orden de canales es left, right, neck, identico entre el tokenizador de etapa 1 y RLDX-1 de etapa 2. La normalizacion es q99 con la transformacion `2*(x-q01)/(q99-q01)-1` y recorte a `[-1, 1]`, usando estadisticas fusionadas de tres fuentes. El entrenamiento usa lote global de 256 (2 GPU con 128 por dispositivo, sin acumulacion), tasa de aprendizaje 1e-4 y 60.000 pasos objetivo. La mezcla de datos combina robot allex v1-v6, humano hmd y humano umi v1-v12 LPF en proporcion 0,50 / 0,25 / 0,25, con `state_dropout` de 0,3. Ademas de la cabeza de accion, se anade una perdida de alineamiento CogAlign (peso 0,2) que alinea el *pooled cog token* con el estado de 50D mediante un adaptador de 256 unidades ocultas y cabeza lineal; al no disponer de coordenadas de punta de dedo, el objetivo de alineamiento es el propio estado de 50D.

## Capacidades

- Generacion de secuencias de accion de horizonte 16 para un robot bimanual, expresadas como EEF absolutas de 50 dimensiones.
- Condicionamiento multimodal sobre dos camaras ego (izquierda y derecha) y estado del robot de 50D, con `state_dropout` de 0,3 durante el entrenamiento.
- Aprendizaje conjunto a partir de datos de robot y de humano (hmd, umi), lo que permite cierto grado de transferencia entre dominios.
- Alineamiento representacional explicito entre el *pooled cog token* y el estado del robot mediante la perdida CogAlign.
- Modelado de acciones en el espacio latente de un tokenizador congelado (*actlat*), en lugar de sobre acciones crudas.
- No se documenta soporte de *tool calling*, *function calling*, agentes, razonamiento multi-paso, vision general, audio ni modo de pensamiento; son capacidades propias de asistentes y no se declaran para este modelo.

## Casos de uso

- Manipulacion robotica bimanual: el modelo genera comandos de efector final para ambas manos y el cuello en un unico paso de inferencia, lo que lo hace adecuado para tareas de pick-and-place, ensamblaje o reorientacion de objetos con politicas unimodales.
- Politica base para *fine-tuning* sobre un embodiment especifico: al estar entrenado sobre ALLEX en formato EEF 50D, sirve como inicializacion para ajustar una politica a un robot concreto con pocas demostraciones adicionales.
- Investigacion en alineamiento estado-accion: la perdida CogAlign y el adaptador de 256 unidades permiten estudiar si alinear representaciones internas con el estado mejora la generalizacion, comparando este brazo con variantes sin CogAlign.
- Experimentos con tokenizacion de acciones: el objetivo *actlat* hace de este checkpoint una referencia para comparar el *flow matching* sobre acciones crudas frente al modelado en el espacio latente del tokenizador `allex_eef50_q99_split_w0p03_actiononly_bs512_h16_100k`.
- Transferencia desde datos humanos: la mezcla 0,50 / 0,25 / 0,25 entre robot y datos humanos hmd/umi permite evaluar hasta que punto el modelo reutiliza demostraciones humanas para tareas nuevas.
- Evaluacion de checkpoints intermedios: el repositorio incluye los pasos 20.000, 30.000 y 40.000 con estadisticas de normalizacion propias, lo que permite trazar curvas de aprendizaje y elegir el punto optimo para un despliegue.
- Simulacion y banco de pruebas: la politica puede integrarse en un bucle de simulacion para medir tasas de exito antes de trasladarla a hardware, dado que cada checkpoint lleva su propio `dataset_statistics.json` y `processor/statistics.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 32,6 GB e incluye tres checkpoints mas el tokenizador de 37 MB, por lo que cada checkpoint individual es una fraccion de ese total; no se especifica el tamano exacto de pesos por checkpoint.
- GPU recomendadas: no disponibles en la informacion proporcionada. El entrenamiento se realizo con 2 GPU y lote por dispositivo de 128, dato que no implica un requisito concreto de modelo de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El modelo se distribuye en safetensors y su carga se realiza con `huggingface_hub.snapshot_download` usando el patron `checkpoint-40000/*` y `tokenizer/*`. La inferencia requiere portar el cargador `load_merged_prq_action_minmax` a las claves y rangos min/max de allex 50D/q99, ya que la version existente los tiene codificados de forma fija.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| allex-eef-AB-h16 | no disponible | no disponible | no publicado | other | Hugging Face (jungwook2358/allex-eef-AB-h16) |
| RLDX-1-PT-IMG | no disponible | no disponible | no disponible | no disponible | no disponible (modelo base citado como `RLWRLD/RLDX-1-PT-IMG`) |
| Otras variantes de la familia ALLEX (arm N) | no disponible | no disponible | no disponible | no disponible | citadas indirectamente en la model card |

No se dispone de datos de modelos comparables de la misma categoria (VLA bimanuales con acciones EEF de 50D) en la informacion proporcionada, por lo que la comparativa se limita al modelo base declarado.

## Limitaciones y advertencias

- Dimensionalidad de accion fija: el modelo espera acciones de 50D. Cargarlo con la convencion de 48D (articulaciones con cintura) de ejecuciones anteriores de allex produce resultados incorrectos; son linajes distintos.
- Configuracion oculta en variables de entorno: los parametros de CogAlign y *actlat* no se guardan en `conf.yaml`, sino que se activan con variables de entorno. Omitirlas altera el comportamiento respecto al entrenamiento.
- Estadisticas de normalizacion por checkpoint: cada `checkpoint-*/` contiene sus propios `experiment_cfg/dataset_statistics.json` y `processor/statistics.json`. Reutilizar las de otro checkpoint invalida las predicciones.
- Cargador no portado: `load_merged_prq_action_minmax` tiene PRQ_KEYS y rangos min/max codificados de forma fija; hasta que se porte a allex 50D/q99, la inferencia no es directa.
- Entrenamiento incompleto: el checkpoint mas avanzado publicado es el paso 40.000 sobre un objetivo de 60.000, por lo que la politica puede no estar convergida.
- Licencia "other" sin condiciones detalladas: no se especifican los terminos de uso comercial, por lo que se debe contactar con el autor antes de un despliegue en produccion.
- Riesgo de alucinacion: no disponible como tal, pero al ser una politica de accion el riesgo relevante son predicciones fuera de distribucion que pueden producir movimientos invalidos o inseguros en hardware real.
- Sesgos: no documentados. La mezcla de datos (robot y demostraciones humanas hmd/umi) puede introducir sesgos de dominio, de morfologia del robot y de distribucion de tareas de las que no se ofrece analisis.
- Idiomas: no disponibles; el modelo no se presenta como multilingue.
- Ausencia de benchmarks publicos: no hay evidencia cuantitativa de tasa de exito, robustez ni generalizacion.
- Sin garantias de seguridad fisica: no se documentan limites de par, paradas de emergencia ni validacion en hardware real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jungwook2358/allex-eef-AB-h16
- Codigo de etapa 2: `jungwook235/RLDX-1-egopi`, rama `feat/allex-eef-h16-midtrain`
- Codigo y documentacion de etapa 1: `jungwook235/action-tokenizer`, rutas `gpu26-server/submit/allex_eef_*` y `docs/allex_eef_midtrain/README.md`
- Modelo base citado: `RLWRLD/RLDX-1-PT-IMG`
