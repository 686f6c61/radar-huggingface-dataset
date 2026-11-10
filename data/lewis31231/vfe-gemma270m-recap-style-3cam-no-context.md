# Lewis31231/vfe-gemma270m-recap-style-3cam-no-context

## Resumen

`vfe-gemma270m-recap-style-3cam-no-context` es un checkpoint de investigación publicado por el usuario Lewis31231 en Hugging Face, asociado al artículo VICTR (arXiv:2611.08698). No se trata de un modelo de lenguaje generativo al uso, sino de un modelo de estimación de función de valor (value function estimation, VFE) para robótica, construido sobre un backbone Gemma-3 de aproximadamente 270 millones de parámetros y un codificador visual SigLIP-384. El modelo estima el progreso de una tarea a partir de lenguaje de tarea, tres cámaras (`zed`, `fish0`, `fish1`) y el estado de observación, representando el progreso como 201 bins en el intervalo [-1, 0].

El checkpoint corresponde al paso 20.000 del experimento `recap` con el preset `recap_style_icl_3cam`, y se distribuye con los bytes originales de pesos, estado del optimizador, cursor de entrenamiento y estados aleatorios por rango. No es un repositorio `AutoModel` de Transformers: requiere el código del paper para construir la arquitectura y cargar los pesos. La variante publicada desactiva explícitamente el contexto, de ahí el sufijo `no-context`.

Su relevancia es acotada pero clara para el nicho de robótica y aprendizaje por refuerzo: ofrece un checkpoint reproducible con procedencia verificable (checksums SHA256), métricas de evaluación sobre 240 trayectorias y 27 tareas, y un pipeline de validación y scoring ejecutable en CPU. No obstante, es un artefacto de investigación, no un modelo listo para producción, y su licencia no está declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo VFE personalizado sobre backbone Gemma-3 (~270M) y codificador visual SigLIP-384; no es un transformer generativo estándar |
| Parametros totales | Aproximadamente 270M en el backbone Gemma-3; total exacto del modelo VFE no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Contexto desactivado en esta variante (`no-context`) |
| Tipos de cuantizacion | No disponible (checkpoint en precisión de entrenamiento, formato `.pt`) |
| Idiomas soportados | No disponible (entrada de lenguaje de tarea, idioma no especificado) |
| Licencia | No disponible |
| Formato de pesos | PyTorch checkpoint (`checkpoint_step_20000.pt`), cargado con `torch.load(..., weights_only=True)` |

## Arquitectura y entrenamiento

El modelo combina un backbone de lenguaje Gemma-3 de unos 270 millones de parámetros con un codificador visual SigLIP-384 para procesar tres flujos de cámara (`zed`, `fish0`, `fish1`) junto con el estado de observación y el lenguaje de tarea. La salida es una distribución de progreso discretizada en 201 bins sobre el intervalo [-1, 0]. El preset de datos es `recap_style_icl_3cam`, y en esta variante el contexto está desactivado, por lo que cada consulta se evalúa de forma aislada sin historial previo.

El checkpoint liberado es el paso 20.000 de entrenamiento e incluye pesos del modelo, estado del optimizador, cursor de entrenamiento y estados aleatorios por rango. El entrenamiento se realizó con un batch global de 160 (80 por rango, 2 rangos). La evaluación se llevó a cabo sobre una colección de 240 trayectorias exitosas en 27 tareas, con 120 episodios de consulta en cada split (vistos y no vistos), usando anotaciones humanas para puntuar las predicciones guardadas. No se han publicado detalles sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que el modelo no es generativo en el sentido habitual.

## Capacidades

- Estimación de progreso de tarea robótica: predice una distribución sobre 201 bins en [-1, 0] a partir de observaciones multimodales.
- Fusión multimodal: integra lenguaje de tarea, tres cámaras (`zed`, `fish0`, `fish1`) y estado de observación.
- Evaluación de políticas y recompensas: útil como función de valor para scoring de trayectorias y comparación de políticas.
- Validación de datos en CPU: incluye comandos para validar datos de evaluación sin GPU.
- Scoring de predicciones guardadas: permite puntuar predicciones con anotaciones humanas de referencia.
- Continuación de entrenamiento: el checkpoint conserva estado suficiente para reanudar el entrenamiento bajo condiciones reproducibles.
- No soporta tool calling, function calling, agentes ni generación de texto libre; no es un modelo conversacional.

## Casos de uso

- Evaluación de políticas robóticas: usar el modelo como función de valor para puntuar trayectorias y comparar políticas en tareas de manipulación, aprovechando las métricas de correlación publicadas (Kendall tau-b 0,48 en vistos y 0,44 en no vistos).
- Reproducción de resultados del paper VICTR: ejecutar los comandos `validate-data`, `evaluate` y `score` sobre el checkpoint para verificar los números reportados en la model card.
- Investigación en estimación de funciones de valor: servir de base para ablaciones, por ejemplo la variante pendiente sin block embedding mencionada por el autor.
- Aprendizaje por refuerzo con recompensas aprendidas: integrar la señal de progreso como recompensa densa en pipelines de RL para robótica.
- Análisis de generalización a tareas no vistas: usar el split de 120 episodios no vistos para medir la capacidad de transferencia del modelo.
- Validación de datos y anotaciones: emplear el modo CPU para comprobar la integridad de datasets y anotaciones antes de lanzar evaluaciones costosas en GPU.
- Punto de partida para fine-tuning: reanudar el entrenamiento desde el paso 20.000 con el estado del optimizador y los estados aleatorios conservados.

## Benchmarks y rendimiento

| Split | Kendall tau-b | Pearson r |
|---|---:|---:|
| Vistos | 0,48 | 0,61 |
| No vistos | 0,44 | 0,58 |

Ajustes de scoring: `{"constant_correlation": "exclude", "ema_alpha": 1, "human_reference": "raw_float64_percent"}`. Las métricas se promedian sobre contextos dentro de cada consulta y se da el mismo peso a cada consulta. Se excluyen las correlaciones indefinidas, quedando 119 consultas puntuadas por split. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el checkpoint completo ocupa 3,4 GB en el repositorio, e incluye estado del optimizador, por lo que los pesos del modelo son una fracción de ese tamaño.
- GPU recomendadas: no especificadas por el autor; la evaluación requiere GPU asignada, pero no se indica modelo concreto.
- Compatibilidad con GPU de consumo: probablemente viable en GPUs de consumo por el tamaño del backbone (~270M), aunque no hay confirmación oficial.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI; requiere el código del paper y `torch.load` con `weights_only=True`.
- Validación y scoring: operaciones de CPU; solo la evaluación completa requiere GPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de estimación de función de valor con la misma configuración (Gemma-3 270M + SigLIP-384, tres cámaras, 201 bins de progreso).

## Limitaciones y advertencias

- Licencia no declarada: no se concede licencia nueva para los pesos upstream de Gemma o SigLIP ni para los datasets externos; el uso comercial queda sin regular explícitamente.
- Artefacto de investigación: no es un `AutoModel` de Transformers y requiere el código del paper, dependencias y datasets externos no incluidos.
- Contexto desactivado: la variante `no-context` no aprovecha historial, lo que limita su uso en tareas que requieran memoria temporal.
- Equivalencia en GPU no verificada: el autor confirma carga en CPU pero no ha vuelto a comprobar la equivalencia del forward en GPU para esta release.
- Dependencia de assets upstream: el loader necesita configuraciones y tokenizadores de Gemma y SigLIP accesibles o cacheados localmente.
- Riesgo de sobreajuste a tareas vistas: la caída de Kendall tau-b de 0,48 a 0,44 entre vistos y no vistos sugiere cierta pérdida de generalización.
- Sin datos sobre sesgos, alucinación o cobertura idiomática: no disponibles.
- Reproducción exacta del entrenamiento: requiere datos originales, estado de muestreo, caché de features y un número compatible de workers.

## Enlaces

- Hugging Face: https://huggingface.co/Lewis31231/vfe-gemma270m-recap-style-3cam-no-context
- Paper: https://arxiv.org/abs/2611.08698
- Guía de reproducción: https://github.com/LewisZZZ-Zhang/VFE/tree/7b7760819c3f7f25530680d05b24899e003d05e5/docs/reproduction.md
- Código del paper (VICTR VFE en 7b77608): https://github.com/LewisZZZ-Zhang/VFE/tree/7b7760819c3f7f25530680d05b24899e003d05e5
