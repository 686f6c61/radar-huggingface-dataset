# AnSeongYun/runway-hr-models

## Resumen

RunWay HR models es un repositorio de pesos (no un modelo único) publicado por el usuario AnSeongYun en Hugging Face, que agrupa los modelos de predicción de frecuencia cardíaca que consume el servidor de IA del proyecto RunWay, una aplicación orientada al entrenamiento de carrera. El repositorio contiene dos familias de modelos: una red GRU recurrente (`gru/gru_final.pt`) y varios checkpoints de una familia denominada ODE v2.1 (`ode_v21_stage1_base`, `ode_v21_stage1_gru` y variantes de segunda etapa aún no publicadas). No se trata de un modelo de lenguaje: no genera texto, no procesa lenguaje natural y no tiene parámetros de contexto en el sentido habitual de los LLM.

El problema que resuelve es la predicción de la frecuencia cardíaca durante y antes de una sesión de running. Según la model card, el modelo GRU se emplea para la predicción a 2 minutos con control predictivo (MPC) durante la carrera (servicios AI03 y AI04), mientras que los modelos ODE v2.1 se usan para la previsualización de frecuencia cardíaca antes de salir, la predicción del tramo restante y la personalización (AI05 y AI06). La model card indica que el entrenamiento se realizó con datos de salud y ubicación que no se incluyen en el repositorio.

La relevancia es acotada y muy específica: es un artefacto de producción interno de un equipo, sin model card técnica completa, sin benchmarks publicados y sin licencia de código abierto clara (licencia "other"). No dispone de pipeline declarado, no tiene descargas ni likes en el momento de la consulta y el tamaño del repositorio figura como 0.0 GB. Cualquier evaluación externa debe tratar la información como incompleta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GRU recurrente (variante `gru/`) y familia "ODE v2.1" con codificador CNN o GRU (variantes `ode_v21_stage1_base` y `ode_v21_stage1_gru`) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la ventana de entrada depende de la longitud de la serie temporal de salud y ubicación) |
| Tipos de cuantización | no disponible (pesos en PyTorch `.pt`; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | other |
| Formato de pesos | PyTorch `.pt` (`gru_final.pt`, `selected_model.pt`) y JSON de estadísticas (`summary_stats.json`) |

## Arquitectura y entrenamiento

El repositorio contiene dos aproximaciones distintas. La primera es una GRU (`gru/gru_final.pt`), descrita como "GRU M3-005 + M3-006 (경사 모름 대체)", es decir, una GRU que sustituye la información de pendiente desconocida en el modelo. Su función en producción es la predicción a 2 minutos mediante MPC durante la carrera. La segunda familia, ODE v2.1, se organiza en dos etapas: la etapa 1 (`ode_v21_stage1_base` con codificador CNN de "hoy" en epoch 20, y `ode_v21_stage1_gru` con codificador GRU en epoch 19) se entrenó con la frecuencia cardíaca inicial HR0 disponible, y la etapa 2 (`ode_v21_stage2_*`, variantes v21a/b/c) se entrenó sin HR0 y sus resultados aún no se han publicado en el repositorio.

No se especifican en la información disponible el número de tokens, la composición del dataset, el volumen de series temporales ni si se aplicaron técnicas de ajuste como RLHF o DPO (no aplicables a este dominio). La model card menciona que el modelo ODE etapa 1 obtiene una métrica "ADOPT" antes de la salida de C20 8.05, lo que supone −1.10 respecto a B_THS_pers, pero no se detalla qué mide exactamente ADOPT ni la unidad. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal, que no tienen sentido en este contexto. El código de inferencia no está en el repositorio: según la búsqueda web, `predictor.py`, `ptv2/`, las configuraciones y el smoke test viven en el repositorio GitLab de RunWay bajo `ai/workspace/seongyun/hr_transformer/`, y son necesarios para ejecutar el modelo.

## Capacidades

- Predicción de frecuencia cardíaca a 2 minutos durante una carrera mediante control predictivo (MPC), usando la GRU.
- Previsualización de frecuencia cardíaca antes de iniciar la carrera (modelo ODE v2.1 etapa 1).
- Predicción del tramo restante de una sesión de running.
- Personalización por usuario (servicio AI06) a partir de las estadísticas almacenadas en `summary_stats.json`.
- Codificación de series temporales de salud y ubicación con dos variantes de codificador (CNN y GRU) para comparación.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio.
- No tiene capacidades multilingües: no procesa lenguaje natural.

## Casos de uso

- Control predictivo de intensidad en carrera: la GRU permite estimar la frecuencia cardíaca a 2 minutos vista e integrarse en un bucle MPC que ajuste el ritmo objetivo del corredor en tiempo real.
- Previsualización de frecuencia cardíaca antes de salir: el modelo ODE v2.1 etapa 1 genera una estimación inicial de la evolución cardíaca prevista para la sesión, útil para planificar la carga antes de empezar.
- Predicción del tramo restante: dado un estado parcial de la carrera, el modelo estima cómo evolucionará la frecuencia cardíaca en el resto del recorrido, lo que permite avisar de riesgo de sobreesfuerzo.
- Personalización por atleta: el servicio AI06 usa el modelo junto con `summary_stats.json` para adaptar las predicciones al perfil fisiológico y al historial del usuario.
- Comparación de codificadores en producción: las variantes `base` (CNN) y `gru` (GRU) del ODE v2.1 permiten evaluar en el servidor de IA qué codificador ofrece mejores predicciones antes de fijar una variante.
- Integración en el backend de una app de running: los pesos se descargan con `hf download` y se cargan mediante variables de entorno (`HR_MODEL_PATH`, `ODEV21_CHECKPOINT_PATH`, `ODEV21_SUMMARY_STATS_PATH`) en el servicio `ai/service`.
- Validación de integridad en despliegue: los hashes SHA-256 documentados (`db59d414…`, `ba767a64…`, `9251e04e…`) permiten verificar que los pesos cargados en producción son los esperados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica mencionada es la comparación interna del modelo ODE v2.1 etapa 1 en la tarea "ADOPT antes de la salida", con un valor de C20 8.05 y una diferencia de −1.10 frente a B_THS_pers, sin que se especifiquen la definición de la métrica ni las condiciones de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio figura como 0.0 GB y no se publica el número de parámetros, por lo que no se puede estimar con rigor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; al ser modelos recurrentes pequeños en formato `.pt`, es plausible que quepan en GPU de consumo, pero no hay datos que lo confirmen.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables). El despliegue previsto es la carga directa de los `.pt` con PyTorch en el servidor `ai/service`, usando el código de inferencia del repositorio GitLab de RunWay.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de predicción de frecuencia cardíaca en running con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- La licencia es "other" y no se detallan sus términos; no se puede asumir uso comercial sin consultar al autor.
- No hay model card técnica completa: faltan parámetros, arquitectura exacta, datos de entrenamiento y métricas de evaluación.
- El repositorio no incluye el código de inferencia; sin el repositorio GitLab de RunWay (`ai/workspace/seongyun/hr_transformer/`), los pesos no son utilizables.
- La model card indica que los datos de entrenamiento (salud y ubicación) no se incluyen, lo que impide auditar sesgos o distribución del dataset.
- El modelo opera sobre datos fisiológicos y de ubicación; su uso en producción implica riesgos de privacidad y posibles sesgos poblacionales no documentados.
- Riesgo de alucinación no aplica en el sentido de los LLM, pero sí existe riesgo de predicciones erróneas de frecuencia cardíaca, con implicaciones de seguridad para el usuario.
- Las variantes de segunda etapa (`ode_v21_stage2_*`) aún no están publicadas, por lo que el estado del arte interno del proyecto no es reproducible desde este repositorio.
- El repositorio registra 0 descargas y 0 likes, sin pipeline declarado, lo que sugiere un uso interno y no una distribución pública validada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AnSeongYun/runway-hr-models
- Listado de modelos del autor: https://huggingface.co/AnSeongYun/models
- Modelo relacionado del mismo autor: https://huggingface.co/AnSeongYun/runway-hr-predictor-transformer
