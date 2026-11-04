# Donghyun1228/pi05-libero-lape-scale-source-n1000-10000-20261104

## Resumen

π0.5 LIBERO mean-IDM source es un checkpoint de robótica basado en la arquitectura π0.5 (openpi) publicado por el usuario Donghyun1228. Se trata de un modelo de tipo vision-language-action (VLA) orientado a control robótico, entrenado sobre el benchmark LIBERO, y no de un modelo de lenguaje general. Su función concreta es servir como fuente de datos para un estudio de escalado de datos LAPE (un experimento de adaptación VLA), tal como indica la model card.

El checkpoint forma parte de una receta de entrenamiento de imitación (IL) combinada con mean-IDM (inverse dynamics model) y recolección de conflictos de gradiente, con una tasa de aprendizaje de 1e-5 y 10.000 actualizaciones. La sonda de soporte de la fuente se ha recortado a 1.000 fotogramas por entorno, replicando la receta de una fuente principal de 50k. El repositorio ocupa 32,2 GB e incluye pesos, estado de entrenamiento completo y assets de normalización.

Es relevante para investigadores que replican o extienden estudios de escalado de datos en VLA: el checkpoint contiene artefactos de análisis (fracción compartida LAPE por capa y un prior k10) que no suelen publicarse con modelos finales. No obstante, la información pública es muy limitada: no hay datos de benchmarks, idiomas ni especificaciones de arquitectura más allá de la referencia a π0.5 y openpi.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5 (openpi), modelo vision-language-action (VLA); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repo contiene un directorio `9999/` con `params`, `train_state` y `assets`; no se especifica safetensors, GGUF ni otro formato) |

## Arquitectura y entrenamiento

El modelo se basa en π0.5 dentro del ecosistema openpi, una familia de modelos vision-language-action para control robótico. La model card no detalla la arquitectura interna (número de capas, dimensión, mecanismo de atención, componente de visión o de acción), por lo que no es posible confirmar si se trata de un transformer puro, un híbrido o una variante con cabezas de acción específicas. Tampoco se especifican los datos de preentrenamiento ni el número de tokens.

El entrenamiento descrito corresponde al preset `pi05_libero_conflict_mean_source`: aprendizaje por imitación (IL) combinado con mean-IDM en entrenamiento conjunto, con recolección de conflictos de gradiente, tasa de aprendizaje 1e-5 y 10.000 actualizaciones. La sonda de soporte de la fuente se limita a 1.000 fotogramas por entorno. El checkpoint incluye artefactos de análisis: `lape/analysis_tau1.json` (fracción compartida LAPE por capa medida sobre los datos principales de medición) y `prior/lape_k10/` (prior k10 con w_l = 1 − s_l^10). Estos artefactos apuntan a un estudio de escalado de datos más amplio, no a un modelo listo para producción.

## Capacidades

- Control robótico mediante políticas vision-language-action sobre entornos LIBERO.
- Aprendizaje por imitación (IL) con entrenamiento conjunto mean-IDM.
- Recolección de conflictos de gradiente durante el entrenamiento.
- Análisis de escalado de datos LAPE: el checkpoint expone la fracción compartida por capa y el prior k10.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes, multilingüismo, visión general, audio ni modo thinking.
- No se documenta soporte de function calling ni de razonamiento multi-paso fuera del bucle de control robótico.

## Casos de uso

- Replicación de estudios de escalado de datos VLA: el checkpoint sirve como fuente de referencia para comparar el efecto de recortar la sonda de soporte a 1.000 fotogramas frente a la fuente de 50k, usando los artefactos `lape/analysis_tau1.json` y `prior/lape_k10/`.
- Investigación en adaptación de políticas robóticas: permite inicializar o comparar recetas de IL + mean-IDM con recolección de conflictos de gradiente sobre LIBERO.
- Análisis de conflictos de gradiente: el estado de entrenamiento completo en `9999/` facilita inspeccionar la dinámica de optimización y los conflictos recolectados durante las 10.000 actualizaciones.
- Evaluación de normalización: el directorio `assets` contiene los parámetros de normalización, útiles para reproducir la inferencia con las mismas estadísticas que en entrenamiento.
- Estudio de priors por capa: el prior k10 (w_l = 1 − s_l^10) puede reutilizarse en experimentos de regularización o enmascaramiento de capas en modelos VLA del mismo tamaño.
- Docencia y experimentación en robótica con openpi: como checkpoint de 32,2 GB con licencia Apache-2.0, sirve para prácticas de ajuste fino y evaluación en entornos LIBERO simulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repo (32,2 GB) incluye pesos, estado de entrenamiento completo y assets, por lo que no equivale al tamaño de los pesos en inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del artefacto sugiere que la inferencia requeriría GPUs de datacenter o de gama alta, pero no se confirma.
- Opciones de despliegue: no disponible (no se documenta vLLM, llama.cpp, Ollama, TGI ni el runtime específico de openpi).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 LIBERO mean-IDM source (este) | no disponible | no disponible | no disponible | Apache-2.0 | HuggingFace (0 descargas) |
| π0.5 base (openpi) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| Fuente principal 50k (`pi05-libero-conflict-mean-source-n50k-10000-20261024`) | no disponible | no disponible | no disponible | no disponible | HuggingFace (referenciada en la model card) |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Información pública muy escasa: no hay especificaciones de arquitectura, parámetros, contexto ni benchmarks, lo que impide evaluar su calidad de forma objetiva.
- Modelo especializado en robótica (LIBERO); no es un modelo de lenguaje general y no debe usarse para tareas de texto, código o razonamiento.
- El checkpoint está pensado como fuente de un estudio de escalado de datos, no como modelo final de producción; su uso fuera de ese contexto no está validado.
- No se documentan sesgos, riesgo de alucinación ni limitaciones idiomáticas; al ser un modelo de acción, el riesgo se traslada a comportamientos erróneos en el control robótico.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de documentación sobre datos de entrenamiento y evaluación impide garantizar su idoneidad en producción.
- El repositorio incluye estado de entrenamiento completo (32,2 GB), lo que incrementa los requisitos de almacenamiento y complica el despliegue ligero.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de validación por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-lape-scale-source-n1000-10000-20261104
- Repositorio de código del estudio referenciado: `Donghyun1228/vla_adaptation` (driver code `f9dbc2e0`), sin URL directa en la información proporcionada.
- Fuente principal 50k referenciada: https://huggingface.co/Donghyun1228/pi05-libero-conflict-mean-source-n50k-10000-20261024
- openpi (ecosistema): no disponible en la información proporcionada.
