# podolinsky/groot-libero-x-probe-lstm-onset-pre-mode-clip-task-seed1

## Resumen

`groot-libero-x-probe-lstm-onset-pre-mode-clip-task-seed1` es una sonda LSTM de detección de fallos para una política VLA (vision-language-action) GR00T ejecutada sobre el benchmark de manipulación robótica LIBERO-X. No es un modelo generativo ni un LLM: es un detector ligero que consume las características del backbone de la política (vectores de 6144 dimensiones por paso) y produce una puntuación de fallo por paso, junto con una cabeza de modo de fallo (10 clases) y una cabeza semántica.

Lo publica el usuario `podolinsky` dentro del proyecto vla-probe, y se entrenó sobre los episodios de entrenamiento de un split concreto (`task_seed1`) del dataset `podolinsky/gr00t-libero-x-features-v3`. La etiqueta empleada es `onset_pre`: se marca como positivo cada paso desde el inicio del episodio hasta el instante de fallo, y el rollout se corta en ese punto. Los episodios de la tarea reservada de ese split constituyen el conjunto "no visto".

Su relevancia es acotada pero práctica: con 6,62 millones de parámetros y un fichero de pesos de apenas decenas de megabytes, permite monitorizar en tiempo de ejecución una política robótica mucho más pesada y disparar alarmas con garantías de conformal prediction (max-conformal), lo que resulta útil para seguridad, intervención temprana y filtrado de datos. Conviene subrayar que el rendimiento cae de forma acusada en tareas no vistas (38,59 frente a 70,36 en tareas vistas), por lo que su uso en producción exige recalibración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda LSTM (`lstm_modes_clip`) sobre características pooled de un backbone VLA GR00T; incluye cabeza de puntuación de fallo por paso, cabeza de modo de fallo (10 modos) y cabeza semántica |
| Parametros totales | 6.622.227 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (opera paso a paso sobre una secuencia de características; la ventana exacta figura en `config.json`, no publicada en la información disponible) |
| Tipos de cuantizacion | No disponible (pesos publicados en precisión completa; al ser un modelo de 6,6 M de parámetros no se han documentado variantes cuantizadas) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje; el texto solo aparece en la cabeza semántica, sin detalle de cobertura) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `safetensors` (`model.safetensors`) + `config.json` |
| Dimension de entrada | 6144 (características pooled por paso, estandarizadas con `feature_mean` y `feature_std`) |
| Salidas | Puntuación de fallo por paso, distribución sobre 10 modos de fallo, salida de la cabeza semántica |
| Calibracion incluida | `calibration_maxima`: puntuaciones máximas de 72 episodios de éxito, ordenadas |
| Dataset de entrenamiento | `podolinsky/gr00t-libero-x-features-v3` (GR00T-N1.7, LIBERO-X level123, K=10 muestras de acción) |
| Split | `task_seed1` (el mejor de 3 splits de tarea según validación de `onset_pre`) |
| Descargas / likes | 0 descargas, 1 like |
| Tamano del repositorio | 0,0 GB |
| Fecha de creacion | 2026-10-23 |

## Arquitectura y entrenamiento

La arquitectura es la sonda `lstm_modes_clip` del código vla-probe: una red recurrente LSTM que recibe la secuencia de características pooled del backbone de GR00T (vector de 6144 dimensiones por paso, previamente estandarizado con la media y la desviación típica almacenadas en el checkpoint) y emite tres salidas: una puntuación escalar de fallo por paso, una clasificación sobre 10 modos de fallo y una cabeza semántica. La configuración exacta (número de capas, dimensión oculta, dropout, etc.) está en el `config.json` del repositorio, no reproducida en la información disponible.

El entrenamiento se realizó sobre los episodios de entrenamiento de un único split (`task_seed1`) del dataset de características de LIBERO-X, con la etiqueta `onset_pre`: todos los pasos desde el comienzo del episodio hasta el onset del fallo se marcan como positivos y el rollout se trunca en ese instante. No se documenta en la información disponible el número de tokens ni de episodios empleados, ni si hubo fases de RLHF/DPO (no aplicables a este tipo de sonda). La innovación destacable es el mecanismo de alarma conformal: se calcula el umbral en el nivel alfa como `sorted(maxima)[k-1]` con `k = ceil((n+1)*(1-alpha))` sobre las 72 puntuaciones máximas de episodios de éxito, y se declara alarma en el primer paso cuya puntuación lo supere.

## Capacidades

- Detección temprana de fallos en episodios de manipulación robótica: puntuación de fallo por paso sobre características del backbone de GR00T.
- Clasificación del tipo de fallo en 10 modos distintos mediante cabeza dedicada.
- Calibración estadística de alarmas (conformal prediction, variante max-conformal) con umbral dependiente del nivel alfa elegido.
- Cabeza semántica auxiliar, cuya tarea concreta no se detalla en la información disponible.
- Entrada exclusivamente de características (no procesa imágenes ni texto de forma directa): depende del backbone VLA que las genera.
- No soporta tool calling, function calling, razonamiento multi-paso agéntico ni generación de texto libre.
- No dispone de capacidades multilingües declaradas.

## Casos de uso

- Monitorización en tiempo de ejecución de una política GR00T: la sonda consume las características del backbone en cada paso y emite una puntuación de fallo, lo que permite abortar o reiniciar la tarea antes de que el robot complete una acción destructiva.
- Parada de seguridad con garantía estadística: fijando un nivel alfa (por ejemplo 0,10) y aplicando el umbral conformal almacenado en `calibration_maxima`, se obtiene una tasa de falsos positivos acotada sobre la distribución de calibración, requisito habitual en entornos con supervisión humana.
- Enrutado a intervención humana: cuando la puntuación cruza el umbral, el sistema puede solicitar teleoperación; la cabeza de 10 modos aporta contexto sobre el tipo de fallo probable para priorizar la respuesta.
- Filtrado y curación de datos de robótica: puntuar rollouts masivos para descartar episodios fallidos antes de reentrenar la política, usando la etiqueta `onset_pre` como referencia de comparación.
- Evaluación comparativa de políticas VLA: al depender solo de características del backbone, la sonda sirve como instrumento de medida entre checkpoints de GR00T sobre el mismo conjunto de tareas de LIBERO-X.
- Investigación en representaciones internas: la cabeza semántica y las cabezas de modo permiten analizar qué información sobre el fallo es linealmente accesible en las características pooled del backbone.
- Despliegue en hardware modesto: con 6,62 M de parámetros, la sonda puede ejecutarse en la misma GPU que la política o incluso en CPU, sin competir por VRAM con el modelo principal.

## Benchmarks y rendimiento

Métrica reportada por el autor: área bajo la curva de TPR temprano frente a FPR hasta el 40 %, en porcentaje, con alarmas max-conformal.

| Conjunto | Resultado (%) |
|---|---|
| Validacion | 66,48 |
| Visto (seen) | 70,36 |
| No visto (unseen) | 38,59 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de modelos de lenguaje, ya que no es un modelo de lenguaje. Los números del paper citado por el autor son medias sobre todos los splits del mismo tipo; los de esta ficha corresponden únicamente a `task_seed1`, seleccionado por validación y nunca por el conjunto no visto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 26,5 MB en fp32 (6.622.227 parámetros × 4 bytes) y unos 13,2 MB en fp16; el cuello de botella real es el backbone GR00T que genera las características de 6144 dimensiones.
- GPU recomendadas: cualquier GPU capaz de ejecutar el backbone (A100, H100, L40S, RTX 4090, RTX 3090); la sonda en sí no impone requisitos.
- Cabe en GPU de consumo: sí, en cualquier GPU con más de 1 GB de VRAM; también se ejecuta en CPU sin problemas de latencia apreciables para la sonda aislada.
- Opciones de despliegue: PyTorch con `safetensors.torch.load_file`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resultado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `groot-libero-x-probe-lstm-onset-pre-mode-clip-task-seed1` (este) | 6.622.227 | No disponible | Unseen 38,59 %; visto 70,36 %; validacion 66,48 % | CC BY 4.0 | HuggingFace |
| `groot-libero-x-probe-lstm-onset-traj-mode-clip-task-seed1` | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| `groot-libero-x-probe-lstm-onset-post-mode` | No disponible | No disponible | No disponible (split seed 0, media sobre alfa 0,01–0,30) | Otra (etiquetada como "other") | HuggingFace |
| `groot-libero-x-probe-lstm-onset-mha` | No disponible | No disponible | No disponible (split seed 0, media sobre alfa 0,01–0,30) | Otra (etiquetada como "other") | HuggingFace |

Las alternativas comparables son las otras sondas del mismo autor sobre el mismo dataset, que difieren en la etiqueta (`onset_pre` frente a `onset_traj` y `onset_post`) y en la arquitectura de la cabeza (`mode`, `mha`). No se dispone de los resultados numéricos de esas variantes en la información consultada.

## Limitaciones y advertencias

- Generalización limitada a tareas no vistas: el rendimiento cae de 70,36 a 38,59 en la tarea reservada del split, lo que desaconseja su uso directo en entornos con distribución distinta a la de entrenamiento.
- Dependencia estricta de la versión del backbone: las características de entrada deben proceder del backbone GR00T-N1.7 sobre LIBERO-X con el mismo preprocesado (estandarización con `feature_mean` y `feature_std` del checkpoint); cualquier cambio de backbone invalida la sonda.
- Calibración conformal sobre solo 72 episodios de éxito: los umbrales para niveles alfa bajos son poco fiables por escasez de muestras en la cola.
- Sesgos conocidos: no documentados por el autor; el dataset subyacente es un benchmark de simulación (LIBERO-X) y puede no reflejar la distribución de fallos en robots reales.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero la cabeza de modos puede asignar un modo de fallo incorrecto con alta confianza; debe tratarse como señal auxiliar, no como diagnóstico.
- Sin soporte multilingüe ni de texto libre; no es utilizable como asistente conversacional ni para generación de código.
- Restricciones de licencia: CC BY 4.0 permite uso comercial y obras derivadas con atribución; conviene revisar igualmente las condiciones del dataset `podolinsky/gr00t-libero-x-features-v3` y del backbone GR00T original.
- Caveat de producción: la selección del split se hizo por validación (no por el conjunto no visto), de modo que los 38,59 % del conjunto no visto son la estimación honesta de rendimiento fuera de distribución.
- Repositorio con 0 descargas y 0,0 GB: ecosistema mínimo, sin garantías de mantenimiento ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/podolinsky/groot-libero-x-probe-lstm-onset-pre-mode-clip-task-seed1
- Dataset de características: https://huggingface.co/datasets/podolinsky/gr00t-libero-x-features-v3
- Código vla-probe: https://github.com/mpodolinsky/vla-probe
- Variante con etiqueta `onset_traj`: https://huggingface.co/podolinsky/groot-libero-x-probe-lstm-onset-traj-mode-clip-task-seed1
- Variante `onset_post`: https://huggingface.co/podolinsky/groot-libero-x-probe-lstm-onset-post-mode
- Variante con atención multi-cabeza: https://huggingface.co/podolinsky/groot-libero-x-probe-lstm-onset-mha
- Página del dataset en claru.ai: https://claru.ai/datasets/podolinsky-gr00t-libero-x-features-v3
- Perfil del autor en SAVRN: https://savrn.com/model-publishers/podolinsky
