# podolinsky/groot-libero-x-probe-lstm-onset-pre-mode-clip-skill-place-on-surface

## Resumen

`groot-libero-x-probe-lstm-onset-pre-mode-clip-skill-place-on-surface` es una sonda (probe) de deteccion de fallos para una politica de robotica VLA (vision-language-action): en concreto, GR00T-N1.7 ejecutando tareas del benchmark LIBERO-X. No es un modelo generativo ni un modelo de lenguaje: es un detector ligero que consume las features del backbone de la politica (vectores de 6144 dimensiones por paso) y produce una puntuacion de fallo por paso, junto con una cabeza de modo de fallo (10 clases) y una cabeza semantica. Lo publica el usuario `podolinsky` junto con el codigo `vla-probe` y el dataset de features `gr00t-libero-x-features-v3`.

Su interes practico esta en el problema que ataca: saber *cuando* va a fallar un rollout de robot antes de que el fallo ocurra, para poder abortar, pedir intervencion humana o descartar episodios. La variante concreta usa etiquetado `onset_pre` (positivo en todos los pasos desde el inicio del episodio hasta el onset del fallo, con el rollout cortado en ese punto) y se entrena sobre el split de habilidad `skill_place_on_surface`, uno de los 8 splits por habilidad de LIBERO-X.

El modelo tiene 6.622.221 parametros y se distribuye en un unico `model.safetensors` que incluye pesos, estadisticas de normalizacion (`feature_mean`, `feature_std`) y los maximos de calibracion de 66 episodios exitosos, lo que permite fijar umbrales conformales a un nivel alpha dado. La licencia es CC BY 4.0 y el pipeline declarado en HuggingFace es `robotics`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda LSTM (`lstm_modes_clip` del codigo `vla-probe`) sobre features pooled del backbone VLA; cabeza de fallo por paso, cabeza de modo de fallo (10 modos) y cabeza semantica |
| Parametros totales | 6.622.221 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo opera paso a paso sobre secuencias de features; la configuracion exacta esta en `config.json`) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se ofrecen variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; no procesa texto de forma directa) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` |
| Dimension de entrada | 6144 por paso (features del backbone), estandarizadas con `feature_mean` / `feature_std` |
| Salidas | puntuacion de fallo por paso, modo de fallo (10 clases), salida de la cabeza semantica |
| Dataset de entrenamiento | `podolinsky/gr00t-libero-x-features-v3` (features de GR00T-N1.7 sobre LIBERO-X, con K=10 muestras de accion) |
| Split evaluado | `skill_place_on_surface` (elegido al azar con semilla 0 entre 8 splits por habilidad) |

## Arquitectura y entrenamiento

La arquitectura es una sonda LSTM recurrente que se aplica sobre las features pooled del backbone de la politica, no sobre las observaciones crudas. El pipeline es en dos fases: primero se ejecuta GR00T-N1.7 sobre LIBERO-X y se extraen features de 6144 dimensiones por paso (junto con K=10 muestras de accion en el dataset asociado); despues la sonda consume esa secuencia estandarizada y emite una puntuacion de fallo por paso. Sobre esa representacion secuencial se anaden dos cabezas auxiliares: una de clasificacion de modo de fallo con 10 clases y otra semantica. El nombre `clip` en el identificador de la arquitectura hace referencia a la variante de la sonda dentro del codigo `vla-probe`, cuya configuracion exacta esta en el `config.json` del repo.

El etiquetado es `onset_pre`: cada paso desde el inicio del episodio hasta el instante de fallo se marca como positivo y el rollout se trunca en el onset. El entrenamiento usa los episodios de entrenamiento de un unico split de habilidad (`skill_place_on_surface`, seleccionado con semilla 0 entre 8 splits posibles, eligiendose por resultados de validacion y nunca por el conjunto no visto). Los episodios de la habilidad reservada de ese split constituyen el conjunto "unseen". No se especifican en la informacion disponible el numero total de tokens/pasos de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF/DPO (no aplicables a este tipo de sonda).

El detalle tecnico mas relevante es el mecanismo de alarma: el `model.safetensors` incluye `calibration_maxima`, los 66 maximos de puntuacion de los episodios exitosos de calibracion, ordenados. Para un nivel alpha, el umbral es `sorted_maxima[k-1]` con `k = ceil((n+1)*(1-alpha))`, y se dispara la alarma en el primer paso cuya puntuacion sea igual o superior al umbral. Es un procedimiento conformal de umbral unico, no una probabilidad calibrada.

## Capacidades

- Deteccion temprana de fallo por paso en rollouts de una politica VLA, devolviendo una puntuacion escalar que se compara con un umbral conformal.
- Clasificacion del tipo de fallo entre 10 modos mediante una cabeza dedicada.
- Cabeza semantica adicional sobre la representacion secuencial (la etiqueta concreta de esa cabeza no se detalla en la informacion disponible).
- Calibracion de umbrales a distintos niveles alpha a partir de los 66 episodios exitosos incluidos en los pesos.
- Funciona sobre features pooled del backbone, por lo que no requiere acceso a las acciones ni a las observaciones crudas en tiempo de inferencia.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en sentido linguistico; su unica funcion es la monitorizacion secuencial.
- No tiene capacidades multilingues ni de generacion de texto: los idiomas aparecen como "no disponible" porque el modelo no procesa lenguaje.
- No dispone de modo de pensamiento, vision ni audio propios; la informacion visual llega ya codificada en las features del backbone.

## Casos de uso

- **Parada de seguridad en manipulacion robotica**: integrado en el bucle de control de GR00T sobre LIBERO-X, el detector evalua la puntuacion en cada paso y dispara una parada o un replanificacion cuando cruza el umbral conformal fijado para el nivel alpha deseado.
- **Enrutado a intervencion humana en operacion semiautomatica**: al detectar un fallo inminente, el sistema puede ceder el control a un teleoperador antes de que la tarea se arruine, reduciendo el coste de recuperacion frente a detectar el fallo a posteriori.
- **Filtrado y curado de episodios de entrenamiento**: la puntuacion por paso permite descartar automaticamente rollouts fallidos o truncarlos en el onset, generando datasets mas limpios para reentrenar politicas.
- **Aprendizaje activo y recogida selectiva de datos**: los episodios con puntuaciones altas o con modos de fallo poco representados se priorizan para anotacion o para aumentar la cobertura del dataset de features.
- **Diagnostico de modos de fallo**: la cabeza de 10 modos permite agrupar los fallos por categoria (por ejemplo, agarre fallido frente a colision) y orientar la depuracion de la politica hacia el modo dominante.
- **Evaluacion comparativa de checkpoints**: dado un checkpoint candidato y otro de referencia, se comparan tasas de alarma temprana sobre el mismo split para decidir que version desplegar.
- **Monitorizacion pasiva en produccion**: al ser un modelo de 6,6 M de parametros, puede ejecutarse en la misma maquina que el controlador, consumiendo unicamente las features ya calculadas por el backbone, sin coste perceptible en el bucle de control.

## Benchmarks y rendimiento

La unica metrica publicada es el area bajo la curva de TPR temprana frente a FPR hasta el 40 %, en porcentaje, con alarmas conformales maximas, sobre el split `skill_place_on_surface`:

| Conjunto | Area TPR temprana vs FPR <= 40 % (%) |
|---|---|
| Validacion | 64,40 |
| Vistos (seen) | 63,65 |
| No vistos (unseen) | 35,48 |

No se han publicado resultados de benchmarks en la informacion disponible mas alla de esta metrica (no hay MMLU, HumanEval, GSM8K ni tablas comparativas con otras sondas). El autor indica que las cifras del paper son medias sobre todos los splits del mismo tipo, no de este split concreto.

## Requisitos de hardware

- **VRAM para inferencia**: con 6.622.221 parametros, los pesos ocupan aproximadamente 26,5 MB en fp32. La sonda en si cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- **Coste real del sistema**: el cuello de botella no es la sonda, sino el backbone GR00T-N1.7 que genera las features de 6144 dimensiones; la informacion disponible no incluye los requisitos de VRAM de ese backbone.
- **GPU recomendadas**: no disponibles para el backbone. Para la sonda basta una GPU integrada o una RTX de gama baja; ejecucion en CPU viable.
- **Cabe en GPU consumer**: si, la sonda cabe en cualquier GPU consumer; el requisito determinante depende del modelo VLA que produzca las features.
- **Despliegue**: carga directa con `safetensors.torch.load_file` en PyTorch. No aplica vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- **Latencia y throughput**: no disponibles. Estructuralmente, la inferencia es una pasada LSTM sobre una secuencia de vectores de 6144 dimensiones, por lo que la latencia esperada es muy baja en comparacion con el coste del backbone, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Split / etiqueta | Metrica publicada | Licencia |
|---|---|---|---|---|---|
| Este modelo (`...onset-pre-mode-clip-skill-place-on-surface`) | 6.622.221 | no disponible | `skill_place_on_surface`, `onset_pre` | Val. 64,40 / seen 63,65 / unseen 35,48 | CC BY 4.0 |
| `podolinsky/groot-libero-x-probe-lstm-onset-traj-mode-clip-skill-place-on-surface` | no disponible | no disponible | mismo split, etiqueta `onset_traj` | no disponible | no disponible |
| `podolinsky/groot-libero-x-probe-lstm-onset-post-mode` | no disponible | no disponible | split por tarea | no disponible (el autor reporta resultados promediados en alpha 0,01-0,30) | otra |
| `podolinsky/groot-libero-x-probe-lstm-onset-mha` | no disponible | no disponible | split por tarea | no disponible (el autor reporta resultados promediados en alpha 0,01-0,30) | otra |

Las alternativas mas cercanas son las otras sondas del mismo autor sobre el mismo dataset de features; no se dispone de sus cifras concretas en la informacion proporcionada para establecer una comparacion numerica. Fuera de esa familia no se conocen modelos comparables en la informacion disponible.

## Limitaciones y advertencias

- **Brecha de generalizacion evidente**: la metrica cae de 63,65 en episodios vistos a 35,48 en la habilidad no vista del split. El modelo no debe desplegarse sobre habilidades no representadas en entrenamiento sin recalibracion.
- **Entrenado en un unico split**: el split se eligio con semilla 0 entre 8 posibles; las cifras de esta ficha corresponden solo a `skill_place_on_surface` y no son extrapolables a las demas habilidades.
- **Calibracion limitada**: el umbral conformal se construye con los maximos de solo 66 episodios exitosos, lo que limita la resolucion alcanzable en niveles alpha muy bajos.
- **Dependencia del backbone**: la sonda solo es valida para features de GR00T-N1.7 sobre LIBERO-X, en la misma configuracion y preprocesado. Cambiar la politica, la version del backbone o las capas de extraccion invalida los pesos.
- **Salida no probabilistica**: la puntuacion por paso no es una probabilidad calibrada de fallo; debe interpretarse unicamente mediante el umbral derivado de `calibration_maxima`.
- **Riesgo de falsos positivos y negativos**: al priorizar deteccion temprana (TPR temprana frente a FPR de hasta el 40 %), el regimen de operacion admite una tasa de falsas alarmas considerable; en produccion hay que evaluar el coste de cada tipo de error.
- **Sesgos**: no se ha publicado ningun analisis de sesgos en la informacion disponible. El dataset hereda los sesgos de las tareas y entornos de LIBERO-X, limitados a un conjunto cerrado de manipulaciones de laboratorio.
- **Licencia**: CC BY 4.0 permite uso comercial con atribucion; hay que conservar la atribucion al autor y enlazar la licencia. No se imponen restricciones adicionales conocidas, pero conviene verificar la licencia del backbone GR00T y del dataset de features por separado.
- **Fecha de publicacion**: la ficha de HuggingFace indica creacion y ultima actualizacion el 2026-10-23, es decir, no hay historial de versiones ni evidencia de mantenimiento posterior.
- **Idioma y texto**: al no procesar lenguaje, no procede aplicar consideraciones de calidad multilingue, pero tampoco puede usarse para tareas de inspeccion basadas en instrucciones textuales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/podolinsky/groot-libero-x-probe-lstm-onset-pre-mode-clip-skill-place-on-surface
- Dataset de features: https://huggingface.co/datasets/podolinsky/gr00t-libero-x-features-v3
- Codigo `vla-probe`: https://github.com/mpodolinsky/vla-probe
- Sonda con la otra etiqueta sobre el mismo split: https://huggingface.co/podolinsky/groot-libero-x-probe-lstm-onset-traj-mode-clip-skill-place-on-surface
- Sonda `lstm_onset_post_mode`: https://huggingface.co/podolinsky/groot-libero-x-probe-lstm-onset-post-mode
- Sonda `lstm_onset_mha`: https://huggingface.co/podolinsky/groot-libero-x-probe-lstm-onset-mha
- Pagina del dataset en claru.ai: https://claru.ai/datasets/podolinsky-gr00t-libero-x-features-v3
- Pagina del autor en SAVRN: https://savrn.com/model-publishers/podolinsky
