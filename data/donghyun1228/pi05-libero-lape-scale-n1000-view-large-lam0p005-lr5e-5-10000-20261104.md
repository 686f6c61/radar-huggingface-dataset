# Donghyun1228/pi05-libero-lape-scale-n1000-view-large-lam0p005-lr5e-5-10000-20261104

## Resumen

π0.5 LIBERO view_large es un checkpoint de adaptación de un modelo de visión-lenguaje-acción (VLA) de tipo π0.5, publicado por el usuario Donghyun1228 en HuggingFace. Se trata de un punto experimental dentro del proyecto de escalado de datos LAPE (*Label-Agnostic Probing Evaluation*), en el que se estudia cómo se comporta un modelo π0.5 preentrenado cuando se adapta a un dominio visual concreto (cámaras en vista `view_large`) usando únicamente 1.000 fotogramas de sondeo y un objetivo de adaptación basado en un modelo inverso de dinámica (IDM).

El modelo parte de un checkpoint fuente del mismo autor (`pi05-libero-lape-scale-source-n1000-10000-20261104`, paso 9999) y aplica un entrenamiento de adaptación de 10.000 actualizaciones con el optimizador ConflictAnchorAdamW, coeficiente de anclaje 0,005, LR máximo 5e-5 y el LLM congelado. El resultado es un checkpoint de investigación orientado a robótica de manipulación en el benchmark LIBERO, no un modelo de propósito general.

Es relevante ahora porque documenta una práctica habitual en el ecosistema openpi: reutilizar un VLA preentrenado y adaptarlo con muy pocos datos a una nueva configuración de cámara, manteniendo la licencia Apache 2.0 y publicando tanto los pesos como el estado de entrenamiento completo. El rendimiento reportado en LIBERO es de 298/2000 aciertos (14,90 %) con la política `policy_source_wrist`, un dato que conviene interpretar con cautela dado el carácter exploratorio del experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA π0.5 (openpi), transformer visión-lenguaje-acción con torre de visión y LLM; adaptación con objetivo IDM |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | parámetros en formato nativo de openpi (JAX/Flax), con `train_state` y `assets` de normalización; no se indica GGUF ni safetensors |
| Tamaño del repositorio | 23,8 GB |
| Fecha de creación | 2026-11-04 |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo es un VLA π0.5 del ecosistema openpi. La arquitectura combina una torre de visión que procesa las imágenes de cámara (vista `view_large` y muñeca) con un LLM que genera acciones motoras. En este checkpoint concreto, el LLM se mantiene congelado y solo se adapta la parte correspondiente al objetivo IDM (*inverse dynamics model*), es decir, la cabeza que aprende a predecir la acción a partir de transiciones visuales.

El entrenamiento se realizó sobre 1.000 fotogramas de sondeo del dominio `view_large`, con 10.000 actualizaciones, índice de pinza (gripper) 6 excluido de la pérdida IDM, optimizador ConflictAnchorAdamW con ponderación `conflict`, coeficiente 0,005 y LR máximo 5e-5 constante tras el calentamiento. Se parte del paso 9999 del checkpoint fuente `pi05-libero-lape-scale-source-n1000-10000-20261104`. El repositorio incluye `params`, `train_state` completo y `assets` de normalización, además de la política de evaluación `policy_source_wrist/` con `export.json`. El código conductor está en `Donghyun1228/vla_adaptation` (commit `f9dbc2e0`), preset `pi05_libero_conflict_anchor_view_adapt`.

## Capacidades

- Control robótico de manipulación en el benchmark LIBERO (tareas de manipulación con brazo y pinza).
- Procesamiento de imágenes de cámara en vista `view_large` y cámara de muñeca.
- Generación de acciones motoras a partir de observaciones visuales y contexto de tarea.
- Adaptación a dominio visual mediante objetivo IDM con anclaje (ConflictAnchorAdamW).
- Entrenamiento con LLM congelado, lo que permite adaptaciones ligeras sobre un VLA preentrenado.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo ni modalidades de audio.

## Casos de uso

- Investigación en adaptación de VLAs: el checkpoint sirve como punto de comparación en estudios de escalado de datos LAPE, ya que representa una configuración concreta (1.000 fotogramas, λ 0,005, LR 5e-5) reproducible con el código del autor.
- Reproducción de experimentos de robótica: al incluir `train_state` y `assets`, permite reanudar o auditar el entrenamiento en el entorno openpi.
- Evaluación de políticas en LIBERO: la política `policy_source_wrist/` está pensada para medir éxito en las suites de LIBERO con semilla de entorno 7 y MuJoCo 3.2.3.
- Estudio de objetivos IDM: útil para analizar cómo afecta excluir el índice de pinza de la pérdida y cómo influye el anclaje de conflicto en la adaptación.
- Baseline para adaptaciones con cámara de muñeca: la política exportada usa la torre de visión fuente con la cámara de muñeca, lo que permite comparar contra adaptaciones específicas de esa vista.
- Docencia y divulgación: ejemplo real de pipeline de adaptación de un VLA con licencia permisiva y artefactos completos de entrenamiento.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| LIBERO (500 por suite, semilla de entorno 7, MuJoCo 3.2.3) | Tasa de éxito | 298/2000 = 14,90 % |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 23,8 GB, lo que da una cota inferior del espacio en disco necesario.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el modelo está ligado al ecosistema openpi (JAX/Flax); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| π0.5 LIBERO view_large (este checkpoint) | VLA π0.5 adaptado | no disponible | Apache 2.0 | HuggingFace, 0 descargas |
| π0.5 LIBERO source (mismo autor) | VLA π0.5 fuente | no disponible | Apache 2.0 | HuggingFace |
| Otros VLAs openpi (p. ej. π0, π0-FAST) | VLA | no disponible | según checkpoint | HuggingFace / openpi |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada; la comparación se limita a tipo, licencia y disponibilidad.

## Limitaciones y advertencias

- Checkpoint de investigación con 0 descargas y 0 likes; no hay evidencia de uso en producción ni validación externa.
- Tasa de éxito en LIBERO del 14,90 %, muy por debajo de lo que se consideraría un modelo robusto; el propio autor lo presenta como un punto de escalado de datos, no como un modelo final.
- El LLM está congelado durante la adaptación, por lo que las capacidades de razonamiento y generalización quedan limitadas a las del checkpoint fuente.
- El entrenamiento se realizó solo sobre 1.000 fotogramas de sondeo de un dominio visual concreto (`view_large`), lo que reduce la generalización a otras cámaras o entornos.
- No se documentan sesgos, idiomas ni comportamiento fuera del dominio LIBERO; no debe asumirse capacidad multilingüe ni de texto general.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de openpi y de los pesos fuente; conviene verificar las condiciones de esos componentes.
- Riesgo de sobreajuste al benchmark LIBERO y a la semilla de entorno 7 usada en la evaluación.
- No se documentan cuantizaciones ni formatos de despliegue estándar, lo que dificulta su integración en stacks de inferencia convencionales.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-lape-scale-n1000-view-large-lam0p005-lr5e-5-10000-20261104
- Checkpoint fuente: https://huggingface.co/Donghyun1228/pi05-libero-lape-scale-source-n1000-10000-20261104
- Código conductor (referenciado en la model card): `Donghyun1228/vla_adaptation`, commit `f9dbc2e0`
- openpi (ecosistema): no se proporciona enlace en la información disponible
