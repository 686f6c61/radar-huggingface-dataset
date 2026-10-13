# Cosmos-Data/cosmos-libero-noood-baseline-gbs2048-4k

# Cosmos3 LIBERO40-only Full-FT baseline (GBS2048, 4k)

## Resumen

`cosmos-libero-noood-baseline-gbs2048-4k` es un checkpoint de robótica publicado por el usuario Cosmos-Data dentro del ecosistema Cosmos3. Se trata de un *full fine-tuning* de Cosmos3-Nano sobre las demostraciones originales de LIBERO40 (suites Spatial, Object, Goal y LIBERO-10, 50 episodios por tarea antes del split de validación nativo del 1 %), con supervisión conjunta de vídeo y acción y sin datos OOD añadidos. El pipeline declarado en HuggingFace es `robotics` y las etiquetas incluyen `cosmos3_omni`, `cosmos3`, `libero`, `feature-extraction` y `custom_code`.

El modelo tiene 15.173.136.576 parámetros (unos 15,17 mil millones) en formato BF16 y un repositorio de 121,4 GB que, además de los safetensors de la raíz, incluye el DCP original con el checkpoint de solo modelo en el paso 4000 de entrenamiento. No es un modelo de lenguaje: es una política robótica con cabezas de acción entrenadas y un componente generativo de vídeo, pensada para investigación en manipulación y en modelos de mundo.

Su relevancia es metodológica más que de producto: el autor lo publica explícitamente como *baseline* reproducible de referencia ("no-OOD-video baseline at step4000"), no como una política filtrada, seleccionada a mano ni con entrenamiento anidado. La model card indica que no se incluye ninguna afirmación de rendimiento, por lo que sirve como punto de partida para *warmstarts* controlados y para comparaciones bajo un protocolo de evaluación homogéneo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; modelo Cosmos3 (variante omni) con supervisión conjunta de vídeo y acción y *flow matching* para visión y acción (escalas oficiales 10/10) |
| Parametros totales | 15.173.136.576 (≈15,17 mil millones) |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible (se documentan 17 fotogramas de vídeo por cada 16 pasos de acción) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; el repositorio no documenta GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors en la raíz (809 tensores) y DCP original en `training_checkpoint/checkpoints/iter_000004000/model/` |
| Modelo base | Cosmos3-Nano (fine-tuning completo) |
| Pipeline declarado | robotics (etiquetas adicionales: feature-extraction) |
| Tamano del repositorio | 121,4 GB |
| Frecuencia nativa | 20 FPS |
| Vistas de entrada | vistas de agente y de muñeca concatenadas |
| VAE | Wan2.2 VAE (no incluida en el repositorio) |
| Libreria | transformers (requiere `custom_code`) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-12 |

## Arquitectura y entrenamiento

La información disponible no detalla el número de capas ni la topología interna del transformer. Lo que sí se documenta es que el modelo parte de Cosmos3-Nano y que se entrena con supervisión conjunta de vídeo y acción (*joint video+action supervision*) usando *flow matching* tanto en la parte de visión como en la de acción, con las escalas oficiales de 10/10. La representación visual pasa por el VAE de Wan2.2, y las observaciones de las cámaras de agente y de muñeca se concatenan como vistas de entrada. La temporalidad está fijada en 17 fotogramas de vídeo por cada 16 pasos de acción a 20 FPS nativos.

El entrenamiento se realizó sobre cuatro GPU B200 con FSDP en configuración shard4/replicate1, precisión BF16, *packed cap* de 256 por GPU y acumulación de gradiente 2 hasta un *global batch* objetivo de 2048. Se usó un *learning rate* de 5e-5 con multiplicador 5 para la cabeza de acción, *weight decay* de 0,05, scheduler LambdaLinear, 500 pasos de *warmup* y un ciclo de 16.000. Los datos son las demostraciones originales de LIBERO40 (Spatial, Object, Goal y LIBERO-10, 50 episodios por tarea) y muestreo de ventanas con barajado por bloques de episodio sobre cuatro suites con el mismo peso. Las 809 tensores del safetensors de la raíz corresponden a la red ordinaria, no a la EMA, y fueron verificados tensor a tensor contra el DCP original tras la conversión a BF16. El repositorio no incluye VAE, simulador, datos ni estado de optimizador.

## Capacidades

- Generación de acciones robóticas: las cabezas de acción entrenadas producen secuencias de 16 pasos de acción a partir de observaciones visuales a 20 FPS.
- Modelado generativo de vídeo: la supervisión conjunta de vídeo permite predicción o generación de fotogramas dentro del mismo *backbone*.
- Extracción de características: la etiqueta `feature-extraction` indica uso como extractor de representaciones visuales.
- Entrada multivista: acepta vistas de cámara de agente y de muñeca concatenadas.
- Aprendizaje por imitación: política entrenada sobre demostraciones de manipulación de LIBERO40.
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no es un modelo de texto).
- Modo *thinking*, visión general o audio: no disponibles en la información proporcionada.

## Casos de uso

- Baseline reproducible en investigación sobre LIBERO: sirve como referencia fija en el paso 4000 para comparar variantes de entrenamiento (con o sin datos OOD, filtrado, selección humana o políticas anidadas) bajo un protocolo idéntico.
- *Warmstart* para recetas anidadas: la model card describe explícitamente su uso como punto de partida para los entrenamientos con `TASK_COUNT` igual a 3, 9, 15 y 21, que añaden 2.100 pasos adicionales con muestreo agregado ID:OOD de 5:1.
- Evaluación de generalización fuera de distribución: al no haberse entrenado con datos OOD, permite medir la degradación de una política puramente ID cuando se expone a manifestaciones OOD.
- Investigación en *flow matching* aplicado a acción: su doble supervisión vídeo-acción con escalas de *flow matching* oficiales lo hace útil para estudiar el acoplamiento entre el modelado de mundo y la generación de acciones.
- Desarrollo de políticas de manipulación con cámara de muñeca: la concatenación de vistas de agente y muñeca permite entrenar tareas que requieren precisión en el efector final.
- Extracción de representaciones para *downstream*: el uso como extractor de características permite alimentar clasificadores o políticas ligeras sin reentrenar el modelo completo.
- Reproducción de experimentos a gran escala: la configuración FSDP con *global batch* 2048 y cuatro B200 documentada en la model card permite replicar el *setup* de entrenamiento en entornos de clúster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara que no incluye ninguna afirmación de rendimiento ("No performance claim is included here") y advierte de que los resultados históricos de 2 ensayos (semillas 7 y 8) y los de 50 ensayos retenidos corresponden a protocolos distintos y no son comparables. El repositorio registra 0 descargas y 0 likes, por lo que tampoco existe validación externa publicada.

## Requisitos de hardware

- Entrenamiento documentado: 4 GPU B200, FSDP shard4/replicate1, BF16, *packed cap* 256 por GPU, *gradient accumulation* 2, *global batch* 2048.
- Pesos en BF16: aproximadamente 30,3 GB solo para los parámetros (15,17 mil millones a 2 bytes), sin contar activaciones ni el VAE.
- Repositorio completo: 121,4 GB, ya que incluye los safetensors de la raíz y el DCP original de *solo modelo*.
- GPU recomendadas para inferencia en BF16: A100 de 40 o 80 GB, H100 o B200, dado que el modelo no cabe en tarjetas de 24 GB en esa precisión.
- GPU de consumo: no hay confirmación de que quepa en una RTX 4090 o similar. Una cuantización a 8 bits requeriría del orden de 16 GB y una a 4 bits del orden de 8-9 GB, pero no se han publicado pesos cuantizados y estos valores son estimaciones derivadas del recuento de parámetros, no datos verificados.
- Opciones de despliegue: la librería declarada es transformers con código personalizado, por lo que se requiere `trust_remote_code=True`. No hay soporte documentado en vLLM, TGI, llama.cpp ni Ollama para este checkpoint.
- Dependencias externas: hay que aportar el VAE de Wan2.2 y el entorno de datos LIBERO (LIBERO_LeRobot_v3), que no forman parte del repositorio.
- Latencia y *throughput*: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la información proporcionada, y la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados corresponden a entidades no relacionadas con IA). A modo de orientación, la categoría de políticas robóticas de manipulación incluiría alternativas como OpenVLA, GR00T N1 o pi-0, pero no se incluyen sus cifras porque no proceden de la información facilitada y no se han podido verificar:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cosmos-libero-noood-baseline-gbs2048-4k | 15,17 B | no disponible | no publicado | no disponible | HuggingFace (121,4 GB) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts conversacionales y no debe emplearse para tareas de código, redacción o matemáticas.
- El checkpoint corresponde al paso 4000, no al final del ciclo configurado de 10.000; la model card indica explícitamente que el objetivo configurado no implica que la ejecución lo alcanzase.
- No se incluye EMA: los safetensors de la raíz son la red ordinaria. Para *warmstart* se recomienda `checkpoint.load_ema_to_reg=false`.
- No se incluye estado de optimizador, scheduler, trainer ni RNG, por lo que solo permite un *warmstart* nuevo, no una recuperación exacta del estado completo de entrenamiento.
- Requiere aportar el VAE (Wan2.2) y el simulador y los datos (LIBERO), ausentes del repositorio; el `config.yaml` incluido tiene rutas absolutas locales sustituidas por `LOCAL_PATH_OVERRIDE/...`.
- El baseline se entrenó únicamente con datos ID de LIBERO40 y sin datos OOD; su comportamiento fuera de distribución no está caracterizado y la propia model card advierte contra mezclar protocolos de evaluación de 2 y de 50 ensayos.
- La licencia no está especificada en la ficha de HuggingFace, lo que impide determinar si el uso comercial está permitido; conviene aclararlo con el autor antes de cualquier despliegue en producción.
- Sin resultados de rendimiento publicados ni validación externa (0 descargas, 0 likes), no existen evidencias independientes de calidad o robustez.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al tratarse de una política entrenada por imitación, heredará los sesgos y las limitaciones de las demostraciones de LIBERO40, pero no hay análisis publicado al respecto.
- El modelo emplea código personalizado (`custom_code`), lo que implica ejecutar código del repositorio y añade superficie de riesgo en producción.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/Cosmos-Data/cosmos-libero-noood-baseline-gbs2048-4k
- Guía de entrenamiento del baseline anidado (citada en la model card): https://github.com/jyzhang1208/cosmos-framework/blob/main/docs/original_nested_baseline4k_window_training.md
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; los resultados devueltos corresponden a entidades no relacionadas (cosmos.so, cosmos-sports.fr, cosmos.bio, american-cosmograph.fr) y se descartan.
