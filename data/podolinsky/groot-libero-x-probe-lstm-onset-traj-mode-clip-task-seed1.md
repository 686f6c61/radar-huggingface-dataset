# podolinsky/groot-libero-x-probe-lstm-onset-traj-mode-clip-task-seed1

## Resumen

`groot-libero-x-probe-lstm-onset-traj-mode-clip-task-seed1` es una sonda (probe) de detección de fallos para políticas de visión-lenguaje-acción, publicada por el usuario podolinsky. No es un modelo generativo ni una política robótica: es un detector que consume las características del backbone de una política GR00T (extraídas en la capa 16 y agregadas a un vector de 6144 dimensiones por paso) y produce una puntuación de fallo por paso, una distribución sobre 10 modos de fallo y una cabeza semántica. Su arquitectura es una LSTM del código `vla-probe` (variante `lstm_modes_clip`) y solo tiene 6.622.227 parámetros.

El modelo se entrena con los episodios de entrenamiento de un split concreto (`task_seed1`) del dataset `podolinsky/gr00t-libero-x-features-v3`, derivado de rollouts de GR00T-N1.7 en el simulador LIBERO-X. La etiqueta es positiva en todos los pasos de un episodio fallido (definición `onset_traj`), de modo que el detector puede avisar antes de que el fallo sea terminal. La puntuación de alarma se calibra de forma conformal con los máximos de 72 episodios exitosos incluidos en el propio `safetensors`.

Su relevancia es práctica: permite monitorizar rollouts de un VLA, filtrar episodios fallidos para curar datos y disparar intervenciones sin anotación humana. El resultado publicado en este split es un área bajo TPR temprana frente a FPR hasta el 40 % de 47,05 en validación, 47,83 en episodios vistos y 37,18 en la tarea no vista. Es un artefacto de investigación con 0 descargas y 1 like en el momento de la consulta, sin validación independiente conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (variante `lstm_modes_clip` del código `vla-probe`), con cabeza de puntuación de fallo por paso, cabeza de 10 modos de fallo y cabeza semántica |
| Parametros totales | 6.622.227 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa secuencias de pasos de un episodio; la model card no fija una longitud máxima) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; su entrada son características numéricas, no texto) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (`model.safetensors`, con `feature_mean`, `feature_std` y `calibration_maxima`), más `config.json` |
| Entrada | vector de características de 6144 dimensiones por paso (características del backbone de GR00T-N1.7, capa 16, agregadas) |
| Salidas | puntuación de fallo por paso, distribución sobre 10 modos de fallo y cabeza semántica |
| Calibracion | 72 máximos de episodios exitosos, ordenados, para fijar el umbral conformal al nivel alfa |
| Libreria | PyTorch |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

La sonda es una LSTM que recibe la secuencia de características por paso del backbone de la política (6144 dimensiones, capa 16, agregadas) y emite tres salidas: una puntuación de fallo por paso, una clasificación sobre 10 modos de fallo y una cabeza semántica cuya función no se detalla en la model card. Los pesos incluyen `feature_mean` y `feature_std` para estandarizar las características de entrada, de forma que el detector es autocontenido respecto al preprocesado numérico. La configuración exacta de la arquitectura está en `config.json`.

El entrenamiento usa los episodios de entrenamiento de un único split (`task_seed1`) del dataset `podolinsky/gr00t-libero-x-features-v3`; los episodios de la tarea retenida de ese split constituyen el conjunto "unseen". La etiqueta es positiva en todos los pasos de un episodio fallido (variante `onset_traj`). La model card no indica el número de tokens ni de pasos de entrenamiento, la composición exacta del dataset ni si hubo ajuste por RLHF o DPO (no procede en este tipo de sonda, pero no se documenta). El split se eligió por validación sobre la métrica de `onset_pre` (el mejor de 3 splits), nunca por los resultados en el conjunto no visto; los números del artículo son medias sobre todos los splits del mismo tipo. El dataset de características asociado contiene, según la información de búsqueda, 1.800 episodios de rollouts de GR00T-N1.7 en LIBERO-X (600 por nivel, niveles 1-3, 90 tareas) con K=10 muestras de acción por observación.

La innovación destacable no está en la arquitectura, sino en el protocolo de alarma: el umbral se obtiene de los 72 máximos de episodios exitosos guardados en el fichero de pesos, de modo que para un nivel alfa se calcula `k = ceil((n + 1) * (1 - alpha))`, se toma `sorted(maxima)[k - 1]` como umbral y se dispara la alarma en el primer paso cuya puntuación lo supere. Esto convierte la detección en un test conformal con control explícito de la tasa de falsos positivos.

## Capacidades

- Detección de fallo a nivel de paso en rollouts de una política VLA, mediante una puntuación continua por paso.
- Detección temprana: al etiquetar como positivos todos los pasos del episodio fallido, la sonda puede avisar antes del fallo terminal, no solo al final del episodio.
- Clasificación del tipo de fallo entre 10 modos predefinidos.
- Cabeza semántica adicional, cuya función y salida no se detallan en la model card.
- Calibración conformal integrada para fijar el umbral de alarma a un nivel alfa y controlar la tasa de falsos positivos hasta el 40 %.
- Estandarización de características incluida en los pesos (`feature_mean`, `feature_std`), lo que facilita la integración en un pipeline de inferencia.
- No soporta tool calling ni function calling, no actúa como agente y no ejecuta razonamiento multi-step: es un clasificador secuencial, no un modelo de lenguaje.
- No tiene capacidades multilingües, de visión directa ni de generación de texto o de acciones.

## Casos de uso

- Monitorización en línea de rollouts en simulación: ejecutar la sonda sobre las características de cada paso de una política GR00T en LIBERO-X y disparar una alerta cuando la puntuación supere el umbral conformal, lo que permite abortar episodios que van a fallar y ahorrar tiempo de simulación.
- Curado de datos de entrenamiento: descartar automáticamente episodios fallidos de un dataset de rollouts antes de reentrenar la política o de alimentar un proceso de imitación, usando la puntuación agregada del episodio como filtro.
- Análisis de errores por modo de fallo: agrupar los episodios fallidos según la cabeza de 10 modos para identificar qué tipo de error domina en una tarea o en un nivel de dificultad y dirigir ahí el esfuerzo de recolección de datos.
- Disparo de intervenciones en un bucle de control: integrar la alarma como señal de parada segura o de petición de ayuda humana antes de que el robot complete una acción irreversible en el simulador.
- Evaluación automática de políticas: sustituir la inspección manual de vídeos por una tasa de fallos estimada por la sonda, con el nivel alfa como perilla de sensibilidad, en comparaciones entre checkpoints de la misma política.
- Investigación sobre representaciones internas de VLA: usar las características de la capa 16 y la sonda como test de linealidad de la información de fallo en el backbone, comparando variantes de sonda sobre las mismas características.
- Detección de deriva tras cambios de política: al ser una sonda ligera (6,6 M de parámetros) y barata en cómputo, puede ejecutarse en paralelo para vigilar si un nuevo checkpoint de la política empeora su tasa de éxito en las mismas tareas.

## Benchmarks y rendimiento

Métrica empleada en la model card: área bajo la curva de TPR temprana frente a FPR hasta el 40 % (en %), con alarmas conformales al máximo. Split `task_seed1`.

| Conjunto | Area TPR temprana vs FPR <= 40 % (%) |
|---|---|
| Validación | 47,05 |
| Vistos (seen) | 47,83 |
| No vistos (unseen) | 37,18 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con otras sondas del mismo autor. La model card indica que los números del artículo son medias sobre todos los splits del mismo tipo, pero no se proporcionan esos valores ni el enlace al artículo.

## Requisitos de hardware

- Huella de pesos mínima: 6.622.227 parámetros equivalen a unos 26,5 MB en fp32 y unos 13,2 MB en fp16, sin contar los tensores auxiliares (`feature_mean`, `feature_std`, `calibration_maxima`).
- VRAM estimada para inferencia: por debajo de 1 GB incluyendo buffers y el vector de 6144 dimensiones por paso; no requiere GPU dedicada.
- CPU: suficiente para inferencia paso a paso en un único flujo; el cuello de botella real es la extracción de características del backbone de GR00T, no la sonda.
- GPU recomendadas: cualquiera de consumo (RTX 3060, RTX 4090) sirve para batchear muchos rollouts en paralelo; A100 o H100 solo tendrían sentido si comparten nodo con la política que genera las características.
- Cabe en GPU de consumo: sí, en cualquier GPU con más de 1 GB de memoria; también en CPU.
- Opciones de despliegue: PyTorch con `safetensors` como formato de carga; exportación manual a ONNX o TorchScript para servirla sin dependencia de PyTorch. No aplican vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de lenguaje con tokenizador.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Entrada | Metrica principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (`...onset-traj-mode-clip-task-seed1`) | LSTM `lstm_modes_clip` | 6.622.227 | características de 6144 d | 47,05 validación / 47,83 seen / 37,18 unseen (split `task_seed1`) | CC BY 4.0 | HuggingFace |
| `podolinsky/groot-libero-x-probe-lstm-onset-pre-mode-clip-task-seed1` | LSTM `lstm_modes_clip` | no disponible | características de 6144 d | no disponible en la información consultada | no disponible | HuggingFace |
| `podolinsky/groot-libero-x-probe-lstm-onset-post-mode` | LSTM con cabeza de modo | no disponible | características de GR00T-N1.7 sobre LIBERO-X level123 | no disponible (la información de búsqueda solo menciona resultados alfa-promediados en el split seed 0) | otra (según la página del repositorio) | HuggingFace |
| `podolinsky/groot-libero-x-probe-lstm-onset-mha` | LSTM con atención multi-cabeza | no disponible | características de GR00T-N1.7 sobre LIBERO-X level123 | no disponible (resultados alfa-promediados en el split seed 0) | otra (según la página del repositorio) | HuggingFace |

Las tres alternativas son variantes de la misma familia de sondas del mismo autor, no modelos de propósito general; la comparación directa de parámetros y métricas entre ellas no es posible con la información disponible. GR00T-N1.7, la política de la que se extraen las características, no es comparable: es el modelo monitorizado, no un detector.

## Limitaciones y advertencias

- Dependencia estricta del pipeline de características: la sonda solo es válida con características de la capa 16 del backbone de GR00T-N1.7, agregadas a 6144 dimensiones. Cualquier cambio de backbone, de capa o de agregación invalida los pesos y la calibración.
- Generalización limitada a tareas no vistas: el área cae de 47,83 en episodios vistos a 37,18 en la tarea retenida del split, una degradación de más de 10 puntos.
- Calibración con solo 72 episodios exitosos: los umbrales conformales para niveles alfa pequeños son inestables, y el control de falsos positivos solo se sostiene si esos episodios son representativos de la distribución de despliegue.
- Etiquetado a nivel de episodio aplicado a todos los pasos: la model card no describe anotación del instante exacto del fallo, por lo que la señal de "onset" es una convención de etiquetado y no una localización verificada del fallo.
- Selección del split por validación (el mejor de 3) introduce un sesgo de selección; los números de este repositorio no son una estimación insesgada del rendimiento esperado.
- Validación exclusiva en el simulador LIBERO-X: no hay evidencia de traslado a un robot real, ni de robustez frente a cambios de cámara, iluminación o dinámica.
- No es un modelo de lenguaje: no procesa texto, no tiene idiomas, no soporta tool calling ni razonamiento multi-step, y no puede sustituir a la política en la toma de acciones.
- Licencia CC BY 4.0: permite uso comercial y obras derivadas con atribución, pero sin garantías; conviene revisar los términos de los datasets y del modelo base GR00T que originan las características.
- Madurez: 0 descargas y 1 like en el momento de la consulta, repositorio de 0,0 GB y sin validación independiente conocida; no se han encontrado resultados de benchmarks estándar ni el artículo referenciado en los enlaces disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/podolinsky/groot-libero-x-probe-lstm-onset-traj-mode-clip-task-seed1
- Dataset de características: https://huggingface.co/datasets/podolinsky/gr00t-libero-x-features-v3
- Código de la sonda (`vla-probe`): https://github.com/mpodolinsky/vla-probe
- Sonda con la otra etiqueta del mismo split: https://huggingface.co/podolinsky/groot-libero-x-probe-lstm-onset-pre-mode-clip-task-seed1
- Sonda variante post-mode: https://huggingface.co/podolinsky/groot-libero-x-probe-lstm-onset-post-mode
- Sonda variante multi-cabeza: https://huggingface.co/podolinsky/groot-libero-x-probe-lstm-onset-mha
- Página del dataset de características v3 (con K=10 muestras de acción): https://claru.ai/datasets/podolinsky-gr00t-libero-x-features-v3
- Página del dataset de características de GR00T-N1.7 en LIBERO-X (90 tareas, niveles 1-3): https://claru.ai/datasets/podolinsky-gr00t-n1-7-libero-x-features
- Perfil del autor en SAVRN: https://savrn.com/model-publishers/podolinsky
