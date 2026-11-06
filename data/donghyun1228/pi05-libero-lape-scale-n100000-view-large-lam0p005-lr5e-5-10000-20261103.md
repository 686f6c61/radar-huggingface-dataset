# Donghyun1228/pi05-libero-lape-scale-n100000-view-large-lam0p005-lr5e-5-10000-20261103

## Resumen

π0.5 LIBERO view_large es un punto de escalado de datos del proyecto LAPE (adaptación de modelos de visión-lenguaje-acción) publicado por el usuario Donghyun1228 en Hugging Face. Se trata de un checkpoint de robótica derivado de π0.5 (pi05), el modelo VLA de Physical Intelligence, adaptado específicamente al benchmark LIBERO mediante un proceso de adaptación de dominio con anclaje de conflicto (ConflictAnchorAdamW). El modelo parte de un checkpoint fuente del mismo tamaño de datos y aplica un ajuste target-only sobre 100.000 fotogramas de sondeo del conjunto view_large.

El modelo resuelve el problema de adaptar un VLA preentrenado a una distribución visual distinta (vista large) manteniendo la capacidad de control robótico. La innovación principal es el uso de un mean-IDM (modelo inverso de dinámica) con exclusión del índice de pinza (índice 6) en la pérdida, junto con el congelado del LLM durante la adaptación. El resultado es una política que alcanza un 73,35% de éxito en LIBERO (1467/2000) con semilla de entorno 7.

El repositorio ocupa 23,8 GB e incluye parámetros completos, estado de entrenamiento y assets de normalización. La licencia es Apache 2.0 y la fecha de creación es noviembre de 2026, lo que lo sitúa como un trabajo reciente dentro del ecosistema openpi.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en π0.5 (pi05), transformer con torre de visión y LLM congelado durante adaptación |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | parámetros en formato nativo de openpi (params, train_state, assets); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo se basa en π0.5 (pi05), un VLA que combina una torre de visión con un modelo de lenguaje y un cabezal de acciones. La adaptación se realiza sobre el preset `pi05_libero_conflict_anchor_view_adapt` con el entrenador externo del proyecto `vla_adaptation` (driver `dd3339b2`). La inicialización parte del checkpoint `pi05-libero-lape-scale-source-n100000-10000-20261103` en el paso 9999, es decir, la fuente del mismo tamaño de datos.

El entrenamiento consiste en una adaptación target-only con mean-IDM sobre 100.000 fotogramas de sondeo view_large, durante 10.000 actualizaciones. Se utiliza el optimizador ConflictAnchorAdamW con ponderación `conflict`, coeficiente 0,005 y LR pico de 5e-5 constante tras el warmup. El índice de pinza (6) se excluye de la pérdida IDM y el LLM permanece congelado. El prior utilizado es `prior/lape_k10/prior.json`. La política de evaluación `policy_source_wrist/` usa los parámetros del paso 9999 con la cámara de muñeca a través de la torre de visión fuente, según `export.json`.

## Capacidades

- Control robótico de manipulación en el benchmark LIBERO, con políticas entrenadas para tareas de mesa.
- Adaptación de dominio visual: el checkpoint está especializado en la vista `view_large` y evalúa con cámara de muñeca mediante la torre de visión fuente.
- Aprendizaje por imitación con modelo inverso de dinámica (IDM) y anclaje de conflicto para preservar el comportamiento fuente.
- Ejecución de políticas multi-paso en entornos MuJoCo 3.2.3.
- No se documentan capacidades de tool calling, agentes, multilingüismo ni modos de pensamiento, al ser un modelo de robótica.
- No se documentan capacidades de visión general, audio ni generación de texto libre.

## Casos de uso

- Evaluación de adaptación de dominio en robótica: sirve como punto de referencia para medir cómo cambia el éxito de LIBERO al adaptar un VLA a una vista distinta (view_large) con 100.000 fotogramas y 10.000 actualizaciones.
- Investigación en escalado de datos para VLA: el checkpoint permite reproducir la curva de escalado LAPE comparando el éxito con el checkpoint fuente del mismo tamaño de datos.
- Estudio de anclaje de conflicto: el uso de ConflictAnchorAdamW con coeficiente 0,005 y ponderación `conflict` permite analizar el equilibrio entre adaptación y preservación de la política fuente.
- Ablación de congelado del LLM: al mantener el LLM congelado y excluir la pinza de la pérdida IDM, se puede aislar el efecto de la adaptación de la torre de visión.
- Benchmark de manipulación con MuJoCo: el resultado de 1467/2000 con semilla 7 y 500 episodios por suite permite comparar políticas en condiciones controladas.
- Reproducción de pipelines openpi: el repositorio incluye `train_state`, `assets` de normalización y `export.json`, lo que facilita reanudar entrenamiento o exportar la política para evaluación.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| LIBERO (éxito) | 1467/2000 = 73,35% | 500 episodios por suite, semilla de entorno 7, MuJoCo 3.2.3, política `policy_source_wrist/` con paso 9999 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio de 23,8 GB sugiere pesos en precisión completa o mixta, pero no se especifica el número de parámetros ni la cuantización.
- GPU recomendadas: no disponible. Por el tamaño del repositorio, se requiere al menos una GPU con memoria suficiente para cargar los parámetros completos y el estado de entrenamiento; no se confirma que quepa en GPU de consumo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el ecosistema openpi es el entorno natural; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un VLA de robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 LIBERO view_large (este) | no disponible | no disponible | 73,35% (1467/2000) | Apache 2.0 | Hugging Face, 0 descargas |
| π0.5 LIBERO fuente (n100000-10000) | no disponible | no disponible | no disponible en la información | Apache 2.0 (presumible por el ecosistema) | Hugging Face |
| Otros VLA de LIBERO | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas de la misma categoría más allá del checkpoint fuente citado.

## Limitaciones y advertencias

- Modelo de robótica especializado: no es un modelo de propósito general; no debe usarse para generación de texto, código o tareas de lenguaje.
- Dominio restringido: entrenado y evaluado en LIBERO con vista `view_large`; el rendimiento fuera de esa distribución no está documentado.
- Evaluación limitada: el 73,35% corresponde a una única semilla de entorno (7) y a MuJoCo 3.2.3; no se reportan intervalos de confianza ni variación entre semillas.
- Sin datos de sesgo, alucinación o multilingüismo: al ser un VLA, estas categorías no aplican directamente, pero tampoco se documentan riesgos de generalización.
- Licencia Apache 2.0: permite uso comercial, pero el modelo deriva de π0.5 y openpi; conviene revisar las condiciones de los componentes upstream.
- Repositorio sin descargas ni likes: no hay evidencia de validación externa ni de reproducibilidad por terceros.
- El estado de entrenamiento completo (train_state) puede contener información del proceso de optimización; su uso en producción requiere extraer solo los parámetros de política.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-lape-scale-n100000-view-large-lam0p005-lr5e-5-10000-20261103
- Checkpoint fuente: https://huggingface.co/Donghyun1228/pi05-libero-lape-scale-source-n100000-10000-20261103
- Proyecto de código driver: `Donghyun1228/vla_adaptation` (referenciado en la model card; no se proporciona URL directa)
- openpi: no se proporciona URL en la información disponible
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada
