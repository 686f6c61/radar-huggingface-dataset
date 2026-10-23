# podolinsky/groot-libero-x-probe-lstm-onset-traj-mode-clip-skill-place-on-surface

## Resumen

`groot-libero-x-probe-lstm-onset-traj-mode-clip-skill-place-on-surface` es un detector de fallos de pequeno tamano (6.622.221 parametros) para una politica VLA (vision-language-action) del tipo GR00T evaluada sobre el benchmark de manipulacion robotica LIBERO-X. No es un modelo generativo ni un LLM: es una sonda LSTM que consume las features pooled del backbone de la politica (vectores de 6144 dimensiones por paso) y produce una puntuacion de fallo por paso, junto con una cabeza de modo de fallo (10 modos) y una cabeza semantica. Lo desarrolla el usuario `podolinsky` y se publica bajo licencia CC BY 4.0 en formato safetensors.

El modelo resuelve un problema concreto de despliegue robotico: detectar en linea que una politica de manipulacion esta a punto de fallar o ha fallado, para poder accionar un mecanismo de seguridad, abortar la tarea o recoger datos de fallo. La etiqueta `onset_traj` marca como positivo cada paso de un episodio fallido, de modo que el detector intenta avisar lo antes posible dentro de la trayectoria. La relevance practica esta en el uso de umbrales conformales calibrados: el fichero de pesos incluye los 66 maximos de puntuacion de episodios exitosos de calibracion, lo que permite fijar un nivel de falsos positivos alpha y derivar el umbral de alarma sin reentrenar.

El resultado publicado en esta particion (`skill_place_on_surface`, skill reservado como conjunto no visto) es desigual: 48,64 en validacion, 53,54 en episodios vistos y 21,49 en el skill no visto, medido como area bajo TPR temprano frente a FPR hasta el 40 %. Es, por tanto, una pieza de investigacion reproducible mas que un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda LSTM (`lstm_modes_clip`) sobre features pooled del backbone de la politica GR00T; cabeza de puntuacion de fallo por paso, cabeza de modo de fallo (10 modos) y cabeza semantica |
| Parametros totales | 6.622.221 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (consume secuencias de features de 6144 dimensiones por paso; la ventana exacta figura en `config.json`, no publicada en la informacion disponible) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | No disponible / no aplica (no procesa texto ni lenguaje natural; la entrada son features numericas) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `model.safetensors` (PyTorch) + `config.json`; incluye `feature_mean`, `feature_std` y `calibration_maxima` |
| Dimension de entrada | 6144 (features pooled por paso) |
| Salidas | Puntuacion de fallo por paso, modo de fallo (10 clases) y salida de la cabeza semantica |
| Calibracion | 66 maximos de puntuacion de episodios exitosos, ordenados, para umbral conformal |
| Libreria | PyTorch |
| Descargas / likes | 0 / 0 |
| Tamano del repo | 0,0 GB (reportado) |

## Arquitectura y entrenamiento

La arquitectura es una LSTM con cabezas auxiliares, denominada `lstm_modes_clip` en el codigo `vla-probe` del autor. La entrada no son pixeles ni tokens, sino las features pooled del backbone de una politica GR00T entrenada sobre LIBERO-X, estandarizadas con `feature_mean` y `feature_std` almacenadas en el propio fichero de pesos. Sobre esa secuencia de features, la LSTM emite una puntuacion de fallo en cada paso; la cabeza de modos clasifica el tipo de fallo entre 10 posibles y una cabeza semantica adicional aporta una representacion auxiliar descrita en `config.json`. La configuracion exacta (capas, dimensión oculta, dropout, funcion de perdida) esta en ese fichero y no se detalla en la informacion disponible.

El entrenamiento usa los episodios de entrenamiento de una unica particion de skill del dataset `podolinsky/gr00t-libero-x-features-v3`; los episodios del skill reservado de esa particion constituyen el conjunto "no visto". La particion se eligio al azar con semilla 0 entre 8 particiones por skill, y segun el autor la seleccion se hizo por resultados de validacion, nunca por los no vistos. El etiquetado es positivo en todos los pasos de un episodio fallido (`onset_traj`). El procedimiento de alarma es conformal: con `n` calibraciones y nivel `alpha`, se calcula `k = ceil((n + 1) * (1 - alpha))`, se toma el maximo ordenado en la posicion `k - 1` como umbral y se dispara la alarma en el primer paso cuya puntuacion lo iguale o supere. No se documentan en la informacion disponible el numero de tokens, la composicion del dataset ni el uso de RLHF/DPO (no aplicables a este tipo de sonda supervisada).

## Capacidades

- Deteccion de fallo por paso en episodios de manipulacion robotica, con puntuacion escalar continua.
- Clasificacion del modo de fallo en 10 categorias mediante cabeza dedicada.
- Emision de una salida semantica auxiliar (cabeza semantica) ademas de la puntuacion.
- Alarmas calibradas a un nivel de falsos positivos objetivo mediante umbrales conformales incluidos en el artefacto.
- Estandarizacion interna de features: el fichero de pesos contiene media y desviacion tipica, lo que simplifica la integracion.
- Funciona como monitor externo de una politica VLA preentrenada, sin modificar sus pesos.
- Capacidades multilingues: no disponibles (no procesa texto).
- Tool calling / function calling: no soportado (no es un modelo de lenguaje).
- Modo thinking, vision o audio: no soportados de forma nativa; toda la informacion visual llega ya codificada en las features del backbone.
- Razonamiento multi-paso en el sentido de agentes LLM: no aplica; la "secuencialidad" se limita al paso por la LSTM sobre features por paso.

## Casos de uso

- **Parada de seguridad en linea durante manipulacion**: ejecutar el probe en paralelo a la politica GR00T en la skill `place_on_surface` y disparar un safe-stop cuando la puntuacion supere el umbral conformal calculado para un `alpha` dado (por ejemplo, FPR objetivo del 5 % o 10 %), evitando que el robot complete una colocacion fallida.
- **Triaje de datos de robotica**: etiquetar automaticamente episodios recogidos en laboratorio como exitosos o fallidos y priorizar la revision manual de los fallidos, usando la puntuacion por paso para localizar el instante de onset del fallo.
- **Analisis de modos de fallo**: agrupar los fallos detectados por la cabeza de 10 modos para diagnosticar si predominan problemas de agarre, colision, desalineacion u otros, y redirigir el esfuerzo de recogida de datos.
- **Monitorizacion de robustez ante cambios de dominio**: comparar la distribucion de puntuaciones entre el skill visto y el no visto (21,49 frente a 53,54 en la metrica del autor) para cuantificar la degradacion del detector antes de desplegarlo en una tarea nueva.
- **Investigacion reproducible en deteccion de fallos VLA**: servir de baseline ligero (6,6 M de parametros) contra el que comparar sondas alternativas sobre el mismo conjunto de features, con el codigo `vla-probe` disponible en GitHub.
- **Filtrado en pipelines de aprendizaje por imitacion**: descartar o reetiquetar episodios de entrenamiento antes de reentrenar la politica, evitando que demostraciones fallidas contaminen el dataset.
- **Evaluacion de politicas en simulacion LIBERO-X**: integrar el probe en un banco de pruebas para reportar no solo la tasa de exito de la politica, sino tambien la latencia de deteccion de fallo (TPR temprano) como metrica secundaria.
- **Despliegue en hardware de borde**: al ocupar unas decenas de MB en fp32, el probe puede ejecutarse en la misma CPU del controlador del robot, dejando la GPU para el backbone de la politica.

## Benchmarks y rendimiento

Unica metrica publicada: area bajo la curva de TPR temprano frente a FPR hasta el 40 %, en porcentaje, con alarmas conformales maximas, sobre la particion `skill_place_on_surface`.

| Conjunto | Valor (%) |
|---|---|
| Validacion | 48,64 |
| Vistos (seen) | 53,54 |
| No vistos (unseen) | 21,49 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje en la informacion disponible, y no serian aplicables a este modelo. Tampoco se ofrece comparacion numerica con otras sondas en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 26,5 MB en fp32 y 13,2 MB en fp16, calculados a partir de los 6.622.221 parametros (estimacion propia, no publicada). El coste real dominante es el backbone GR00T que genera las features de 6144 dimensiones, no el probe.
- GPU recomendadas: no se requieren. Cualquier GPU capaz de ejecutar el backbone (A100, H100, L40S, RTX 4090, RTX 3090) sirve; el probe en si puede correr en CPU.
- Cabe en GPU consumer: si, en cualquier GPU consumer e incluso en CPU, dado el tamano del artefacto.
- Opciones de despliegue: carga directa con `safetensors.torch.load_file` segun el ejemplo de la model card; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a una sonda LSTM). El codigo de referencia esta en `mpodolinsky/vla-probe`.
- Latencia y throughput: no disponibles como cifras publicadas. Por el tamano, se espera una latencia por paso del orden de milisegundos o inferior en CPU (estimacion propia), condicionada por el coste de extraer las features del backbone.
- Requisito critico de integracion: reproducir exactamente el pipeline de extraccion de features pooled del backbone GR00T usado en `gr00t-libero-x-features-v3`; cualquier desviacion invalida la estandarizacion (`feature_mean`, `feature_std`) y la calibracion.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada / contexto | Validacion (%) | Vistos (%) | No vistos (%) | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| Este modelo (`onset_traj`, `lstm_modes_clip`) | 6.622.221 | Features 6144-d por paso, ventana no disponible | 48,64 | 53,54 | 21,49 | CC BY 4.0 | safetensors |
| `groot-libero-x-probe-lstm-onset-pre-mode-clip-skill-place-on-surface` (misma particion, etiqueta `onset_pre`) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada | No disponible |
| Otras sondas publicas de deteccion de fallos VLA | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La unica alternativa identificable en la informacion disponible es la variante `onset_pre` del mismo autor y misma particion, pero no se han proporcionado sus cifras ni sus especificaciones, por lo que la comparacion numerica queda pendiente.

## Limitaciones y advertencias

- Generalizacion limitada a skills no vistos: el valor cae de 53,54 a 21,49 en el conjunto no visto de esta particion, lo que desaconseja su uso directo en tareas distintas de las de entrenamiento sin recalibrar y revalidar.
- Entrenado sobre una unica particion (`skill_place_on_surface`, semilla 0) de un unico dataset; el propio autor advierte que las cifras del paper son medias sobre todas las particiones del mismo tipo, no el resultado de este artefacto concreto.
- Dependencia estricta del backbone: el probe solo es valido con las features exactas de la politica GR00T y la version del dataset de features; cambios en el backbone o en el pooling invalidan el modelo y su calibracion.
- Calibracion basada en 66 episodios exitosos: el umbral conformal para `alpha` muy bajos sera poco fiable por el limitado tamano de la muestra de calibracion.
- Riesgo de falsos negativos silenciosos: un fallo con una firma distinta a las 10 clases de la cabeza de modos puede no elevar la puntuacion y pasar desapercibido.
- No es un modelo de lenguaje: no admite prompts, tool calling, agentes ni instrucciones en lenguaje natural; no debe evaluarse con benchmarks de texto.
- No se documentan sesgos conocidos, composicion del dataset de entrenamiento ni analisis de subgrupos; la informacion disponible no permite auditar equidad o sesgos de la sonda.
- Licencia CC BY 4.0: permite uso comercial con atribucion; conviene revisar los terminos de la politica GR00T subyacente y del dataset LIBERO-X, que pueden tener condiciones propias.
- Madurez baja: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por terceros.
- La busqueda web realizada no devolvio material tecnico relevante sobre el modelo (solo resultados sin relacion), por lo que no hay documentacion externa que corroborre las cifras de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/podolinsky/groot-libero-x-probe-lstm-onset-traj-mode-clip-skill-place-on-surface
- Variante con la otra etiqueta (`onset_pre`) en la misma particion: https://huggingface.co/podolinsky/groot-libero-x-probe-lstm-onset-pre-mode-clip-skill-place-on-surface
- Dataset de features LIBERO-X: https://huggingface.co/datasets/podolinsky/gr00t-libero-x-features-v3
- Codigo `vla-probe`: https://github.com/mpodolinsky/vla-probe
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
- Resultados de la busqueda web: sin resultados tecnicos relevantes
