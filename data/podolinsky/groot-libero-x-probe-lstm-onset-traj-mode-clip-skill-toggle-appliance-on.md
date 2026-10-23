# podolinsky/groot-libero-x-probe-lstm-onset-traj-mode-clip-skill-toggle-appliance-on

## Resumen

`groot-libero-x-probe-lstm-onset-traj-mode-clip-skill-toggle-appliance-on` es un detector de fallos de pequeño tamaño diseñado para supervisar la ejecución de una política de visión-lenguaje-acción (VLA) del tipo GR00T evaluada sobre el benchmark robótico LIBERO-X. No es un modelo generativo ni un modelo de lenguaje: es una sonda (probe) que consume las características pooled de 6144 dimensiones que emite el backbone de la política en cada paso y produce una puntuación de fallo por paso, además de una clasificación del modo de fallo (10 modos) y una cabeza semántica. Lo desarrolla el usuario de HuggingFace `podolinsky`, y el código de la arquitectura (`lstm_modes_clip`) está publicado en el repositorio vla-probe.

El modelo se ha entrenado sobre los episodios de entrenamiento de un split concreto del dataset `podolinsky/gr00t-libero-x-features-v3`, en este caso el split de habilidad `skill_toggle_appliance_on`, seleccionado al azar con semilla 0 entre 8 splits de habilidad. Los episodios de la habilidad reservada de ese split constituyen el conjunto "no visto" (unseen). La relevancia práctica está en que permite lanzar alarmas de fallo con control conformal de la tasa de falsos positivos, utilizando los 85 máximos de calibración incluidos en el propio fichero de pesos.

Con 6.622.240 parámetros totales y un repo de 0,0 GB, es un artefacto muy ligero, pensado para ejecutarse junto a la política VLA (no en su lugar) y para integrarse en bucles de evaluación o de supervisión en producción. La licencia es CC BY 4.0, lo que permite uso comercial con atribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Probe LSTM (`lstm_modes_clip`) sobre características pooled de 6144 dimensiones del backbone de una política VLA GR00T; cabezas de puntuación de fallo por paso, clasificación de modo de fallo (10 modos) y cabeza semántica |
| Parametros totales | 6.622.240 |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible. Consume secuencias de características por paso; la model card no especifica el número máximo de pasos por episodio |
| Tipos de cuantizacion | No disponible: solo se publican pesos en safetensors; no se documentan versiones cuantizadas (GGUF, int8, etc.) |
| Idiomas soportados | No disponible: no es un modelo de lenguaje; opera sobre características numéricas |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (`model.safetensors`) con pesos, `feature_mean`, `feature_std` y `calibration_maxima`; más `config.json` con arquitectura, entrada, salidas, lectura de alarmas y entrenamiento |

## Arquitectura y entrenamiento

La arquitectura es la sonda `lstm_modes_clip` del código vla-probe. La entrada son las características pooled de 6144 dimensiones que el backbone de la política GR00T produce en cada paso; esas características se estandarizan con los tensores `feature_mean` y `feature_std` almacenados en el propio `model.safetensors`. Sobre esa secuencia, una LSTM produce una puntuación de fallo por paso, una predicción sobre 10 modos de fallo y una salida de la cabeza semántica. El fichero de pesos incluye además `calibration_maxima`, los 85 máximos de puntuación de episodios de calibración correctos, ordenados, que permiten fijar un umbral conformal para un nivel de alarma alpha dado.

El entrenamiento se realizó sobre los episodios de entrenamiento de un único split del dataset de características de LIBERO-X (`podolinsky/gr00t-libero-x-features-v3`), en concreto el split de habilidad `skill_toggle_appliance_on`. El etiquetado es `onset_traj`: se marca como positivo cada paso de un episodio fallido, tomando la etiqueta de SAFE como referencia. El split se eligió al azar (semilla 0) entre 8 splits de habilidad, y la selección se basó en resultados de validación, nunca en los resultados del conjunto no visto; según la model card, las cifras del artículo son medias sobre todos los splits del mismo tipo. No se detalla en la información disponible el número de tokens, la composición completa del dataset ni si hubo etapas de RLHF/DPO (no aplicables en un detector de fallos de este tipo).

## Capacidades

- Detección de fallo por paso: emite una puntuación de fallo para cada paso de un episodio de ejecución de la política VLA.
- Alarmas con control conformal: a partir de `calibration_maxima` se puede fijar un umbral para un nivel alpha, de modo que la alarma salta en el primer paso cuya puntuación lo supera.
- Clasificación de modo de fallo: cabeza de 10 modos, útil para diagnóstico y para enrutar estrategias de recuperación.
- Cabeza semántica: salida adicional incluida en la arquitectura, cuya función exacta no se detalla en la model card.
- Estandarización integrada: los parámetros `feature_mean` y `feature_std` viajan con los pesos, lo que evita desajustes de preprocesado en despliegue.
- Supervisión de políticas VLA (GR00T) sobre LIBERO-X: pensado específicamente para el espacio de características de ese backbone.
- Evaluación automática de episodios: permite marcar episodios fallidos sin anotación humana, útil para curación de datos.
- No soporta tool calling, agentes, generación de texto, visión directa ni audio: su entrada es un vector de características, no texto ni píxeles.

## Casos de uso

- Parada temprana en ejecución robótica: insertar la sonda en el bucle de control de la política GR00T y abortar la tarea en el primer paso con puntuación superior al umbral conformal, antes de que el fallo se consume.
- Supervisión en producción con tasa de falsos positivos acotada: calibrar el umbral con `calibration_maxima` para un alpha objetivo y desplegar la alarma en una célula de manipulación, de forma que el operario reciba solo alertas con una tasa de falsos positivos controlada.
- Diagnóstico de causa de fallo: usar la cabeza de 10 modos para distinguir tipos de error y decidir la recuperación (reintento, reorientación, intervención humana) en lugar de aplicar una parada genérica.
- Curación de datasets de robótica: filtrar episodios fallidos en pipelines de recogida de datos antes de reentrenar la política, con la ventaja de que el detector es 6,6 M de parámetros y se ejecuta en CPU.
- Intervención humana asistida en teleoperación: mostrar al teleoperador una señal de riesgo por paso, de modo que anticipe la corrección en tareas de larga duración.
- Evaluación de políticas en laboratorio: sustituir parte de la inspección manual de rollouts en LIBERO-X por un score automático, útil para comparar checkpoints de la política a bajo coste.
- Investigación en interpretabilidad y monitorización: servir de base para estudiar qué información del backbone VLA es predictiva de fallo, dado que el código y el dataset de características son públicos.
- Seguridad software en entornos de fabricación: actuar como segunda barrera lógica, independiente de la política, que dispara una parada de emergencia software cuando la puntuación de fallo es persistentemente alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, porque el modelo no es un modelo de lenguaje. La model card sí reporta la métrica propia del detector: área bajo la curva de TPR temprana frente a FPR hasta el 40 %, en porcentaje, con alarmas conformales máximas, para el split `skill_toggle_appliance_on`.

| Conjunto | Métrica (AU TPR temprana vs FPR ≤ 40 %, %) |
|---|---|
| Validación | 50,35 |
| Visto (seen) | 51,15 |
| No visto (unseen) | 27,08 |

La caída en el conjunto no visto (27,08 frente a 51,15 en visto) es el dato más relevante de rendimiento: indica una generalización limitada a la habilidad reservada de ese split. La model card señala que las cifras del artículo son medias sobre todos los splits del mismo tipo, no las de este split concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: marginal. Con 6.622.240 parámetros, los pesos ocupan aproximadamente 26,5 MB en fp32 y unos 13,3 MB en fp16 (estimación a partir del recuento de parámetros; el repo figura como 0,0 GB).
- GPU recomendadas: no se requiere GPU. Cualquier GPU consumer (GTX 1660, RTX 3060, RTX 4090) es sobrada; también es viable en CPU para lotes moderados.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos unos pocos cientos de MB libres, incluidas iGPU y placas embebidas tipo Jetson.
- Opciones de despliegue: carga directa con `safetensors.torch.load_file` y PyTorch, tal como muestra la model card; el repositorio vla-probe contiene la implementación de la arquitectura. No se documentan soportes de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de sonda.
- Latencia y throughput: no disponibles en la información proporcionada. Por tamaño, la inferencia de una pasada de LSTM sobre características de 6144 dimensiones es del orden de microsegundos a milisegundos en GPU y de milisegundos en CPU, pero es una estimación, no un dato publicado.
- Requisito adicional: hace falta el mismo extractor de características (backbone GR00T) para generar la entrada de 6144 dimensiones en tiempo de ejecución.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en el split | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`onset_traj`, `lstm_modes_clip`) | 6.622.240 | No disponible | Validación 50,35 / visto 51,15 / no visto 27,08 | CC BY 4.0 | HuggingFace |
| `groot-libero-x-probe-lstm-onset-pre-mode-clip-skill-toggle-appliance-on` (misma arquitectura, otra etiqueta) | No disponible en la información | No disponible | No disponible en la información | CC BY 4.0 (según la model card del modelo principal) | HuggingFace |
| Otras sondas del mismo autor sobre otros splits de habilidad | No disponible | No disponible | No disponible | No disponible | HuggingFace |

No se han identificado en la información disponible otros detectores de fallo comparables de terceros para políticas VLA sobre LIBERO-X, por lo que la comparación externa queda como no disponible.

## Limitaciones y advertencias

- Generalización limitada: el rendimiento cae de 51,15 (visto) a 27,08 (no visto) en el split documentado, de modo que no debe asumirse un comportamiento equivalente en habilidades no representadas en entrenamiento.
- Dependencia del backbone: la sonda solo funciona con características pooled de 6144 dimensiones del mismo backbone GR00T y del mismo pipeline de extracción; un cambio de política o de capa invalida `feature_mean` y `feature_std`.
- Ámbito estrecho: entrenada sobre un único split de habilidad (`skill_toggle_appliance_on`) de LIBERO-X; no hay evidencia publicada de su comportamiento en otros dominios, robots o tareas.
- Naturaleza estadística de la alarma: el umbral conformal garantiza una cobertura bajo el supuesto de intercambiabilidad entre calibración y producción; si la distribución de episodios cambia, la tasa de falsos positivos puede desviarse del nivel alpha nominal.
- Riesgo de falsos negativos y positivos: un detector de fallos puede no disparar ante un fallo nuevo y puede interrumpir ejecuciones correctas; en aplicaciones físicas debe combinarse con barreras de seguridad hardware.
- Sesgos: no documentados en la model card; el dataset subyacente (LIBERO-X y las características de GR00T) puede arrastrar sesgos de las tareas, objetos y entornos de simulación empleados.
- Idiomas: no aplica, pero conviene subrayar que no procesa texto ni instrucciones en ningún idioma; no es un modelo de chat.
- Licencia: CC BY 4.0 permite uso comercial y obras derivadas con atribución; no se imponen restricciones adicionales conocidas, pero debe conservarse la atribución al autor.
- Madurez: 0 descargas y 1 like en el momento de la consulta, creado y actualizado el 23 de octubre de 2026; es un artefacto de investigación, sin garantías de mantenimiento.
- Cabeza semántica: su semántica exacta no se documenta en la model card; no debe interpretarse sin revisar `config.json` y el código.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/podolinsky/groot-libero-x-probe-lstm-onset-traj-mode-clip-skill-toggle-appliance-on
- Modelo hermano con la otra etiqueta sobre el mismo split: https://huggingface.co/podolinsky/groot-libero-x-probe-lstm-onset-pre-mode-clip-skill-toggle-appliance-on
- Dataset de características: https://huggingface.co/datasets/podolinsky/gr00t-libero-x-features-v3
- Código de la sonda (vla-probe): https://github.com/mpodolinsky/vla-probe
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante; los resultados devueltos eran páginas de inicio de Google Drive, sin relación con el modelo.
