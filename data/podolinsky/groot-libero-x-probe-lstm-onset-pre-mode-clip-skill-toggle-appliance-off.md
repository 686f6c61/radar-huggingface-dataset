# podolinsky/groot-libero-x-probe-lstm-onset-pre-mode-clip-skill-toggle-appliance-off

## Resumen

`groot-libero-x-probe-lstm-onset-pre-mode-clip-skill-toggle-appliance-off` es una sonda LSTM (LSTM probe) de deteccion de fallos para una politica VLA (vision-language-action) del tipo GR00T entrenada sobre el benchmark robotico LIBERO-X. No es un modelo generativo ni un modelo de lenguaje: es un clasificador auxiliar que consume las caracteristicas pooled del backbone de la politica (vectores de 6144 dimensiones por paso) y emite una puntuacion de fallo por paso, junto con una cabeza de modo de fallo (10 modos) y una cabeza semantica. Lo desarrolla el usuario `podolinsky` y se publica bajo licencia CC BY 4.0.

Su relevancia es practica: permite monitorizar en tiempo de ejecucion si una politica robotica esta a punto de fallar y detenerla o cambiar de estrategia antes de que el episodio se arruine. El modelo se entrena unicamente con los episodios de entrenamiento de una particion concreta del dataset LIBERO-X de caracteristicas, y se evalua sobre la habilidad retenida ("unseen") de esa misma particion. El etiquetado es del tipo `onset_pre`: positivo en todos los pasos desde el inicio del episodio hasta el instante de fallo, con el rollout truncado en ese instante.

El artefacto es muy pequeno (6.622.245 parametros) y esta pensado como componente de un pipeline de investigacion en robotica, no como modelo de proposito general. Incluye en el propio fichero de pesos las estadisticas de normalizacion de caracteristicas y los maximos de calibracion conformal necesarios para fijar umbrales de alarma a un nivel alfa dado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda LSTM sobre caracteristicas pooled de backbone VLA (`lstm_modes_clip` del codigo vla-probe); cabeza de puntuacion de fallo por paso, cabeza de modo de fallo (10 modos) y cabeza semantica |
| Parametros totales | 6.622.245 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa secuencias de caracteristicas por paso de 6144 dimensiones) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no aplica; el modelo no procesa texto) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `model.safetensors` (`model.safetensors` incluye pesos, `feature_mean`, `feature_std` y `calibration_maxima`), mas `config.json` con arquitectura, entradas, salidas, lectura de alarma y detalles de entrenamiento |

## Arquitectura y entrenamiento

La arquitectura corresponde a la sonda `lstm_modes_clip` del repositorio vla-probe: una LSTM que recibe las caracteristicas pooled del backbone de la politica GR00T (vector de 6144 dimensiones por paso, estandarizado con `feature_mean` y `feature_std` almacenados en el safetensors) y produce tres salidas: una puntuacion de fallo por paso, una clasificacion en 10 modos de fallo y una cabeza semantica. La configuracion exacta esta en `config.json` del repositorio.

El entrenamiento usa los episodios de entrenamiento de la particion `skill_toggle_appliance_off` (elegida al azar con semilla 0 entre 8 particiones por habilidad, seleccionada por resultados de validacion, nunca por los datos no vistos) del dataset `podolinsky/gr00t-libero-x-features-v3`. Las etiquetas son `onset_pre`: positivo en cada paso desde el comienzo del episodio hasta el inicio del fallo, con el rollout cortado en ese punto. La calibracion es conformal: `calibration_maxima` contiene las puntuaciones maximas de 90 episodios exitosos de calibracion, ordenadas, de modo que el umbral a nivel alfa se obtiene como `threshold = sorted(maxima[k-1])` con `k = ceil((n+1)*(1-alpha))`, y la alarma se dispara en el primer paso cuya puntuacion lo supera. No se documentan en la informacion disponible ni el volumen de tokens/pasos de entrenamiento ni el uso de RLHF o DPO (no aplicables a este tipo de sonda).

## Capacidades

- Deteccion de fallo por paso en rollouts de una politica VLA GR00T sobre tareas LIBERO-X.
- Puntuacion escalar de riesgo de fallo por paso, con umbral calibrado conformalmente a un nivel alfa.
- Clasificacion del tipo de fallo en 10 modos distintos mediante cabeza dedicada.
- Cabeza semantica adicional (segun la descripcion del autor; su funcion exacta no se detalla en la informacion disponible).
- Normalizacion de caracteristicas integrada (media y desviacion tipica incluidas en el fichero de pesos).
- Capacidad de operar sobre caracteristicas precalculadas, sin necesidad de ejecutar el backbone VLA durante la evaluacion de la sonda.
- No soporta tool calling, function calling, agentes, vision directa ni audio: consume exclusivamente caracteristicas ya extraidas por la politica.

## Casos de uso

- Monitorizacion en tiempo de ejecucion de politicas roboticas: la sonda consume las caracteristicas pooled del backbone GR00T paso a paso y dispara una alarma cuando la puntuacion supera el umbral conformal, lo que permite abortar el episodio antes de que el fallo se materialice.
- Parada de seguridad en manipulacion con habilidad `toggle_appliance_off`: al detectar riesgo, el sistema puede revertir a un controlador de respaldo o solicitar intervencion humana, reduciendo danos sobre el objeto o el entorno.
- Enrutado por modo de fallo: la cabeza de 10 modos permite seleccionar una politica de recuperacion distinta segun el tipo de fallo previsto (por ejemplo, recolocar la pinza frente a reajustar la trayectoria).
- Filtrado de datos para reentrenamiento: ejecutar la sonda sobre rollouts ya registrados para etiquetar episodios proximos al fallo y priorizarlos en un conjunto de datos de mejora de la politica.
- Evaluacion comparativa de politicas: usar la tasa de deteccion temprana como metrica auxiliar al comparar dos checkpoints de la misma politica sobre las mismas tareas.
- Investigacion en deteccion temprana de fallos: la separacion explicita entre conjuntos `validation`, `seen` y `unseen` facilita estudios de generalizacion a habilidades no vistas.
- Despliegue en hardware modesto: al tener 6,6 millones de parametros, la sonda puede ejecutarse en CPU junto al bucle de control sin competir por VRAM con el backbone VLA.

## Benchmarks y rendimiento

Unica metrica publicada en la model card: area bajo la curva de TPR temprana frente a FPR hasta el 40 %, en porcentaje, con alarmas conformales maximas, para la particion `skill_toggle_appliance_off`.

| Metrica | Validation | Seen | Unseen |
|---|---|---|---|
| Area bajo TPR temprana vs FPR hasta 40 % (%) | 73,7 | 69,35 | 41,11 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Los pesos ocupan aproximadamente 26,5 MB en fp32 (6.622.245 parametros x 4 bytes), mas las caracteristicas de entrada por paso.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; no requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada es sobradamente suficiente.
- Cabe en GPU de consumo: si, en cualquier modelo actual (GTX 1050 en adelante) y tambien en CPU.
- Opciones de despliegue: el autor solo documenta carga directa con `safetensors.torch.load_file` en PyTorch, extrayendo `feature_mean`, `feature_std` y `calibration_maxima` y filtrando el resto de tensores como pesos. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a una sonda LSTM).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamano, se espera que la inferencia por paso sea despreciable frente al coste del backbone VLA, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Metrica en `skill_toggle_appliance_off` | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`onset_pre`, modo + semantica) | 6.622.245 | Secuencias de caracteristicas de 6144 d por paso | Validation 73,7 / Seen 69,35 / Unseen 41,11 | CC BY 4.0 | HuggingFace |
| `groot-libero-x-probe-lstm-onset-traj-mode-clip-skill-toggle-appliance-off` (variante de etiquetado `traj`) | no disponible | no disponible | no disponible en la informacion proporcionada | CC BY 4.0 (segun el modelo hermano de la misma familia) | HuggingFace |
| Otras sondas de deteccion de fallos para VLA | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables en la informacion proporcionada. La unica alternativa identificada es la variante de etiquetado `traj` sobre la misma particion, publicada por el mismo autor.

## Limitaciones y advertencias

- El rendimiento cae de forma marcada en la habilidad no vista: 41,11 % frente a 69,35 % en `seen` y 73,7 % en validacion, lo que indica poca generalizacion fuera de las habilidades cubiertas en entrenamiento.
- Entrenada sobre una unica particion (`skill_toggle_appliance_off`); los numeros del paper citado son medias sobre todas las particiones del mismo tipo, pero esta ficha solo reporta los de esta particion.
- Requiere que el backbone VLA produzca caracteristicas pooled de 6144 dimensiones; no funciona con otras politicas ni con extracciones de caracteristicas distintas.
- Las alarmas dependen de un umbral conformal calibrado con 90 episodios exitosos; cambios en la distribucion de tareas o en la politica invalidan la calibracion y exigen recalibrar.
- Riesgo de falsos positivos y negativos inherente a un detector estadistico: la metrica reportada solo cubre FPR hasta el 40 %, no se documenta el comportamiento a tasas de falsos positivos mas bajas.
- No es una politica ni un modelo generativo: no puede sustituir al VLA ni generar acciones; solo puntua riesgo sobre caracteristicas existentes.
- La cabeza semantica y los 10 modos de fallo no estan descritos en detalle en la informacion disponible, por lo que su fiabilidad no puede evaluarse.
- Licencia CC BY 4.0: permite uso comercial con atribucion; no se documentan restricciones adicionales, pero conviene verificar los terminos del dataset de origen (`podolinsky/gr00t-libero-x-features-v3`) antes de un despliegue en produccion.
- No se documentan sesgos ni evaluaciones de robustez fuera del benchmark LIBERO-X.

## Enlaces

- HuggingFace: https://huggingface.co/podolinsky/groot-libero-x-probe-lstm-onset-pre-mode-clip-skill-toggle-appliance-off
- Variante de etiquetado `traj` en la misma particion: https://huggingface.co/podolinsky/groot-libero-x-probe-lstm-onset-traj-mode-clip-skill-toggle-appliance-off
- Dataset de caracteristicas: https://huggingface.co/datasets/podolinsky/gr00t-libero-x-features-v3
- Codigo vla-probe: https://github.com/mpodolinsky/vla-probe
- Paper, blog o demo: no disponibles en la informacion proporcionada (la busqueda web no devolvio resultados relevantes).
