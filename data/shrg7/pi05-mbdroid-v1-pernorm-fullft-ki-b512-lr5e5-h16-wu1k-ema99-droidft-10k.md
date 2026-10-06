# shrg7/pi05-mbdroid-v1-pernorm-fullft-ki-b512-lr5e5-h16-wu1k-ema99-droidft-10k

## Resumen

Este repositorio contiene un checkpoint de política robótica (VLA, vision-language-action) entrenado sobre `pi05_base`, la base de la familia openpi pi0.5, en su implementación JAX. Lo publica el usuario `shrg7` como resultado de un experimento de ajuste fino completo (*full fine-tune*) denominado `pi05_mbdroid_v1_pernorm_fullft_ki_b512_lr5e5_h16_wu1k_ema99_droidft`, correspondiente al paso 9.999, es decir, 10.000 actualizaciones del optimizador de un entrenamiento que continúa hasta 100.000. El problema que aborda es el control de robots manipuladores a partir de observaciones visuales y consignas, generando secuencias de acciones de 16 pasos.

El interés técnico del checkpoint está en su receta de entrenamiento: parte de `pi05_full_droid_finetune` de openpi, pero eleva el batch global a 512 (64 por GPU en 8xH200, sin acumulación de gradientes) en lugar de 256, usa un objetivo dual de "aislamiento de conocimiento" (cabeza de lenguaje basada en tokens FAST más un experto de acciones con flow matching), normalización por embodiment con estadísticas de cuantiles y pesos EMA con decaimiento 0,99. Los datos de co-entrenamiento combinan DROID (65 %, sin tareas de pick-and-place y con fotogramas inactivos eliminados), MolmoBot pick-and-place (30 %) y simulación realrig9k (5 %).

Es relevante ahora porque documenta una variante reproducible de ajuste fino a gran escala sobre pi0.5 con datos mixtos reales y simulados, útil para equipos de investigación en robótica que necesitan comparar estrategias de normalización, tamaño de batch y composición de dataset. Conviene señalar que se trata de un artefacto de investigación: no declara licencia, no tiene descargas ni valoraciones y no incluye el estado del optimizador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; checkpoint de pi0.5 (openpi, JAX) con objetivo dual: cabeza de lenguaje de tokens FAST y experto de acciones con flow matching |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el checkpoint se distribuye en precisión completa (directorio `params/` en formato Orbax) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Orbax (JAX); directorio `params/`, acompañado de `assets/` con estadísticas de normalización |
| Tamaño del repositorio | 12,4 GB |
| Pipeline declarado | robotics |
| Etiquetas | openpi, pi05, robotics, vla |
| Horizonte de acción | 16 pasos |
| Dimensiones de acción | 32 en total; 8 reales (0-6 articulaciones delta, 7 pinza absoluta) y 24 de padding (8-31) fijadas a 0 |
| Normalización | Estadísticas de cuantiles por embodiment (DROID = embodiment -2, simulación = embodiment 0), en `assets/` |
| Pesos publicados | EMA con decaimiento 0,99 |
| Estado del optimizador | No incluido |

## Arquitectura y entrenamiento

La model card describe un checkpoint de pi0.5 en JAX con un objetivo dual de "aislamiento de conocimiento": una cabeza de lenguaje que trabaja con tokens FAST y un experto de acciones entrenado con flow matching. La pérdida de flujo cubre las 32 dimensiones de acción, pero solo 8 son reales (0-6 como articulaciones delta y 7 como pinza absoluta); las dimensiones 8-31 actúan como padding y se dirigen a cero, de modo que la métrica de validación registrada sobre 32 dimensiones queda diluida artificialmente. No se especifican en la información disponible el número de parámetros, la composición de capas ni la ventana de contexto.

El entrenamiento parte de `pi05_base` mediante ajuste fino completo y sigue la receta `pi05_full_droid_finetune` de openpi: 1.000 pasos de warmup seguidos de una tasa de aprendizaje plana de 5e-5, optimizador AdamW con recorte de gradiente de 1,0, aumento de datos `pi05_native` y pesos EMA (0,99). La única desviación declarada respecto a la receta original es el batch global de 512 en lugar de 256, ejecutado con 64 muestras por GPU en 8xH200 sin acumulación de gradientes. El dataset de co-entrenamiento mezcla DROID al 65 % (excluyendo pick-and-place y fotogramas inactivos), MolmoBot pick-and-place al 30 % y simulación realrig9k al 5 %. No se documentan fases de RLHF o DPO, lo cual es esperable en un modelo de política y no de conversación.

## Capacidades

- Generación de acciones robóticas: produce *chunks* de 16 pasos con 7 grados de libertad en articulaciones delta más un valor absoluto de pinza.
- Control condicionado por observación visual y consigna de tarea, propio de un modelo VLA (vision-language-action).
- Manipulación tipo pick-and-place, reforzada por el 30 % de datos MolmoBot dedicado a esa tarea.
- Ejecución de políticas en entornos reales de tipo DROID, gracias al 65 % de datos DROID en el co-entrenamiento.
- Transferencia a simulación: incluye un 5 % de datos del simulador realrig9k, aunque no se detalla el protocolo de evaluación en simulación.
- Normalización multi-embodiment: estadísticas de cuantiles separadas por embodiment permiten operar con al menos dos configuraciones corporales (DROID y simulación).
- Cabeza de lenguaje con tokens FAST: el objetivo dual sugiere capacidad de predicción lingüística interna, pero no se documenta ninguna capacidad de generación de texto libre ni de diálogo.
- No se documentan soporte de *tool calling*, uso como agente multi-paso, capacidades multilingües, audio o visión más allá del condicionamiento visual implícito en la política.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo se ha co-entrenado con un 30 % de datos MolmoBot específicos de esa tarea y genera directamente los 8 valores de acción (7 articulaciones más pinza) necesarios para ejecutarla en un brazo de 7 grados de libertad con pinza paralela.
- Reproducción de experimentos de ajuste fino en pi0.5: el repositorio documenta batch, tasa de aprendizaje, warmup, EMA y mezcla de datos, lo que permite replicar o modificar la receta y comparar resultados frente a la configuración upstream con batch 256.
- Punto de partida para ajuste fino en dominios propios: al ser un *full fine-tune* de `pi05_base` con pesos EMA, sirve como inicialización para nuevos entrenamientos sobre datasets de robot específicos, evitando partir de la base genérica.
- Investigación en normalización por embodiment: las estadísticas de cuantiles separadas por embodiment en `assets/` permiten estudiar cómo afecta la normalización independiente a la transferencia entre plataformas robóticas reales y simuladas.
- Evaluación de políticas en simulación: el modelo puede desplegarse en el simulador realrig9k (embodiment 0) para ciclos de validación rápidos antes de probar en hardware real, dado que la normalización de ese embodiment ya está incluida.
- Integración en *pipelines* de recogida de datos con política en el bucle: al ser un checkpoint estable en el paso 10.000, puede emplearse para generar trayectorias de demostración que alimenten entrenamientos posteriores.
- Comparación de objetivos de entrenamiento: el objetivo dual FAST más flow matching permite a un equipo de investigación evaluar si el aislamiento de conocimiento mejora la estabilidad frente a un experto de acciones aislado, siempre que se disponga del código de la rama `pi05-ki-merge-main` referenciada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; se trata de un modelo de política robótica, por lo que esas métricas no son aplicables. El único dato cuantitativo publicado es la validación del paso 10.000:

| Metrica | Valor | Condiciones |
|---|---|---|
| MAE sobre las 8 dimensiones de acción reales | 0,194 | Paso 10.000, parámetros sin EMA, 8 batches |
| `val/sample_mae` registrado | 0,050 | Calculado sobre 32 dimensiones; diluido por las 24 dimensiones de padding fijadas a 0 |

No se proporcionan métricas de éxito de tarea (*success rate*) en DROID, MolmoBot ni realrig9k, ni comparaciones con otros checkpoints de la familia openpi.

## Requisitos de hardware

- El repositorio ocupa 12,4 GB en precisión completa, por lo que cargar únicamente los pesos requiere del orden de 12-13 GB de memoria de acelerador; el consumo real de inferencia no se documenta.
- Entrenamiento declarado: 8 GPU H200 con 64 muestras por GPU y batch global de 512, sin acumulación de gradientes. Es la única referencia de hardware incluida en la model card.
- Inferencia en GPU de consumo: no disponible. No se indica si el checkpoint cabe en una RTX 4090 (24 GB) ni si existe conversión a cuantizaciones de menor precisión.
- Opciones de despliegue: no disponibles. El formato es Orbax sobre JAX y la receta remite al stack openpi; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a modelos de lenguaje y no a políticas VLA.
- Latencia y *throughput*: no disponibles. Solo se conoce el horizonte de acción de 16 pasos, que condiciona la frecuencia de replanificación, pero no el tiempo de cómputo por inferencia.
- Almacenamiento: se debe prever espacio para 12,4 GB de checkpoint más el estado del optimizador si se desea reanudar el entrenamiento, estado que no se incluye en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `shrg7/pi05-mbdroid-v1-pernorm-fullft-ki-b512-lr5e5-h16-wu1k-ema99-droidft-10k` | No disponible | No disponible | MAE 0,194 en las 8 dimensiones reales (paso 10k) | No disponible | Pública en HuggingFace, 0 descargas |
| `pi05_base` (openpi) | No disponible | No disponible | No disponible | No disponible | Referenciado como inicialización; enlace no incluido en la información disponible |
| Checkpoints de la receta `pi05_full_droid_finetune` | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos suficientes para una comparación cuantitativa con alternativas de la misma categoría (por ejemplo, otros checkpoints VLA de openpi o políticas específicas de DROID). Cualquier comparación numérica requeriría ejecutar evaluaciones homogéneas de éxito de tarea, que no se han publicado en la información disponible.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita, el uso comercial y la redistribución quedan en un limbo legal; conviene contactar con el autor antes de cualquier despliegue productivo.
- Checkpoint intermedio: corresponde al paso 10.000 de un entrenamiento previsto hasta 100.000, por lo que no representa el estado final de la receta.
- Estado del optimizador no incluido: no se puede reanudar el entrenamiento exactamente desde el paso 10.000 sin reconstruir el estado de AdamW.
- Métrica de validación engañosa si se lee sin contexto: el `val/sample_mae` de 0,050 está diluido por 24 dimensiones de padding fijadas a cero; la referencia realista es el MAE de 0,194 sobre las 8 dimensiones útiles.
- Sesgos de dominio: el modelo está sesgado hacia DROID y MolmoBot, con exclusión explícita de pick-and-place en DROID y eliminación de fotogramas inactivos; el comportamiento en escenas con mucho tiempo muerto o en configuraciones de robot distintas de las dos normalizadas (embodiment -2 y 0) no está caracterizado.
- Riesgo de alucinación en el sentido de acciones no válidas o inseguras fuera de la distribución de entrenamiento; no se documentan mecanismos de seguridad, parada de emergencia ni límites de par o velocidad.
- Idiomas no disponibles: no se declara ningún idioma soportado, lo que impide valorar el condicionamiento por instrucciones en castellano u otras lenguas.
- Sin métricas de éxito de tarea: no hay *success rate* en DROID, MolmoBot ni realrig9k, ni tampoco resultados en simulación, lo que dificulta estimar su utilidad práctica.
- Repositorio sin tracción: 0 descargas y 0 valoraciones en el momento de redactar la ficha, sin evidencia externa de validación por terceros.
- Dependencia de código externo: el entrenamiento se apoya en la rama `pi05-ki-merge-main` (PR #2) de openpi, cuyo estado y disponibilidad no se detallan en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shrg7/pi05-mbdroid-v1-pernorm-fullft-ki-b512-lr5e5-h16-wu1k-ema99-droidft-10k
- Repositorio upstream openpi (mencionado en la model card como `upstream openpi`; la información disponible no incluye su URL): https://github.com/Physical-Intelligence/openpi
- Rama de código referenciada: `pi05-ki-merge-main`, PR #2 (sin enlace disponible)
- Paper, blog o demo: no disponibles en la información proporcionada
