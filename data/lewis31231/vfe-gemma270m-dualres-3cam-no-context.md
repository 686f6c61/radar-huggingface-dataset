# Lewis31231/vfe-gemma270m-dualres-3cam-no-context

## Resumen

vfe-gemma270m-dualres-3cam-no-context es un checkpoint de investigación publicado por el usuario Lewis31231 en Hugging Face, asociado al artículo VICTR (arXiv:2611.08698). No es un modelo de lenguaje generativo al uso, sino un modelo de estimación de función de valor (value function estimation, VFE) para robótica: dado un estado de observación multimodal (tres cámaras y el estado del robot) y una instrucción de tarea en lenguaje natural, estima el progreso hacia el objetivo en forma de 201 bins sobre el intervalo [-1, 0].

La arquitectura combina un backbone Gemma 3 de 270 millones de parámetros con un codificador visual tipo SigLIP (preset `gemma3_270m_native_dualres_no_context_3cam_freeze_vision`), con la visión congelada durante el entrenamiento. El checkpoint corresponde al paso 20.000 del experimento `ic_vfe_no_context`, con el contexto desactivado, y se distribuye como fichero `.pt` de PyTorch que incluye pesos del modelo, estado del optimizador, cursor de entrenamiento y estados aleatorios por rango, no como repositorio estándar de Transformers.

Su relevancia es acotada pero concreta: sirve como referencia reproducible para investigadores que trabajen en estimación de valor para políticas robóticas, evaluación de progreso de tareas y ablaciones sobre el uso de contexto. El modelo no está pensado para inferencia genérica ni para despliegue en producción, y su licencia no está declarada en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone Gemma 3 270M + codificador visual SigLIP con visión congelada); preset `gemma3_270m_native_dualres_no_context_3cam_freeze_vision` |
| Parametros totales | 270M en el backbone de lenguaje (no se detalla el total incluyendo visión y cabezas) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; el experimento desactiva explícitamente el contexto |
| Tipos de cuantizacion | no disponible (checkpoint en precisión original de entrenamiento, formato `.pt`) |
| Idiomas soportados | no disponible (las entradas incluyen instrucciones de tarea en lenguaje natural) |
| Licencia | no disponible; la model card indica que no concede licencia nueva sobre los pesos upstream de Gemma ni SigLIP |
| Formato de pesos | PyTorch `.pt` (checkpoint completo con modelo, optimizador, cursor y estados RNG) |

## Arquitectura y entrenamiento

El modelo es un VFE personalizado construido sobre un backbone Gemma 3 de 270M parámetros y un codificador visual tipo SigLIP, con la torre de visión congelada durante el entrenamiento. Las entradas son la instrucción de tarea en lenguaje, tres cámaras (`zed`, `fish0`, `fish1`) y `observation.state`. La salida de progreso se discretiza en 201 bins sobre el rango [-1, 0]. El preset emplea resolución dual en las imágenes (`dualres`) y desactiva el contexto (`no_context`), de modo que cada predicción se calcula sobre la observación actual sin historial.

El checkpoint publicado corresponde al paso 20.000 del experimento `ic_vfe_no_context`, entrenado con batch global de 160 (80 por rango, 2 procesos). Se conservan los bytes originales de los pesos, el estado del optimizador, el cursor de entrenamiento y los estados aleatorios por rango, lo que permite continuar el entrenamiento si se dispone del dataset original, el estado de muestreo y la caché de features. La model card no detalla el volumen de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; tampoco menciona innovaciones como decodificación especulativa o atención lineal. El autor indica que existe una ablación nueva sin block-embedding pendiente de publicación, sin pesos liberados.

## Capacidades

- Estimación de función de valor: predice el progreso de una tarea robótica como distribución sobre 201 bins en [-1, 0].
- Fusión multimodal: procesa simultáneamente tres vistas de cámara (`zed`, `fish0`, `fish1`) y el estado proprioceptivo del robot.
- Condicionamiento por lenguaje: acepta instrucciones de tarea en lenguaje natural como entrada.
- Evaluación de políticas: sirve como referencia para puntuar trayectorias o comparar políticas en tareas vistas y no vistas.
- Reproducibilidad de investigación: incluye validación de datos en CPU y scoring de predicciones guardadas en CPU.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni generación de texto libre; no es un modelo conversacional.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Reproducción de resultados del artículo VICTR: cargar el checkpoint con `scripts/paper.py ic_vfe_no_context evaluate` para replicar las métricas de Kendall tau-b y Pearson r publicadas en los splits seen y unseen.
- Evaluación de progreso en robótica de manipulación: usar el modelo para estimar cuánto ha avanzado una política en una tarea a partir de tres cámaras y el estado del robot, útil en entornos con múltiples puntos de vista.
- Baseline en ablaciones de contexto: comparar arquitecturas que incorporan historial frente a este preset sin contexto, aislando la contribución del contexto al rendimiento del VFE.
- Puntuación offline de trayectorias: ejecutar el scoring en CPU sobre predicciones guardadas para clasificar episodios de un dataset de robótica sin necesidad de GPU.
- Continuación de entrenamiento: reanudar desde el paso 20.000 con el estado del optimizador y los estados RNG incluidos, siempre que se disponga del dataset y la caché de features originales.
- Investigación en recompensas basadas en aprendizaje: emplear la señal de progreso como componente de una función de recompensa densa para entrenamiento por refuerzo de políticas robóticas.
- Validación de pipelines de datos: usar `validate-data` en CPU para comprobar la integridad de datasets y anotaciones antes de lanzar evaluaciones costosas en GPU.

## Benchmarks y rendimiento

| Split | Kendall tau-b | Pearson r |
|---|---:|---:|
| Seen | 0,26 | 0,36 |
| Unseen | 0,38 | 0,49 |

Configuración de scoring: `{"constant_correlation": "zero", "ema_alpha": 1, "human_reference": "clamped_float32_value"}`. La colección de evaluación consta de 240 trayectorias exitosas en 27 tareas, con 120 episodios de consulta por split. Las métricas se promedian sobre contextos dentro de cada consulta y se pondera cada consulta por igual. Las correlaciones indefinidas cuentan como cero y se retienen las 120 consultas por split. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; el backbone de 270M y el codificador visual sugieren un consumo moderado, pero el tamaño del repo (2,9 GB) incluye optimizador y estados de entrenamiento, no solo pesos de inferencia.
- GPU recomendadas: no especificadas. La evaluación requiere GPU asignada; la validación de datos y el scoring de predicciones guardadas son operaciones de CPU.
- Compatibilidad con GPU de consumo: probablemente sí para inferencia dado el tamaño del backbone, aunque no está confirmado por el autor.
- Opciones de despliegue: no es compatible con vLLM, TGI, llama.cpp ni Ollama; requiere el repositorio de código del artículo (`scripts/paper.py`) y los assets upstream de Gemma y SigLIP accesibles o en caché local.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vfe-gemma270m-dualres-3cam-no-context | 270M (backbone) | Desactivado | VFE robótico con 3 cámaras | No disponible | Checkpoint `.pt` en HF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (VFE multimodal para robótica con backbone Gemma 3) en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts conversacionales y no soporta tool calling ni agentes.
- No es un repositorio estándar de Transformers: requiere el código del artículo y los assets upstream de Gemma y SigLIP; no funciona con `AutoModel`.
- El contexto está desactivado por diseño; no puede aprovechar historial de observaciones.
- La licencia no está declarada y la model card aclara que no concede licencia sobre los pesos upstream de Gemma ni SigLIP, ni sobre los datasets externos. El uso comercial queda sin definir.
- Riesgo de alucinación: no aplica en el sentido habitual, pero la estimación de progreso puede ser poco fiable fuera de la distribución de entrenamiento; las correlaciones publicadas son moderadas (Kendall tau-b de 0,26 en seen y 0,38 en unseen).
- No se incluyen datasets, anotaciones ni cachés de features; la evaluación completa requiere recursos externos.
- La equivalencia en forward con GPU no se volvió a comprobar para esta release; solo se validó la carga completa del checkpoint en CPU.
- La continuación exacta del entrenamiento exige el estado de muestreo, la caché de features y un número de workers compatible.
- No hay información sobre sesgos, cobertura idiomática ni comportamiento en dominios distintos al dataset de evaluación.

## Enlaces

- Hugging Face: https://huggingface.co/Lewis31231/vfe-gemma270m-dualres-3cam-no-context
- Paper: https://arxiv.org/abs/2611.08698
- Guía de reproducción: https://github.com/LewisZZZ-Zhang/VFE/tree/7b7760819c3f7f25530680d05b24899e003d05e5/docs/reproduction.md
- Código del paper (VICTR VFE en 7b77608): https://github.com/LewisZZZ-Zhang/VFE/tree/7b7760819c3f7f25530680d05b24899e003d05e5
