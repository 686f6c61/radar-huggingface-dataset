# Donghyun1228/pi05-libero-lape-scale-n5000-view-large-lam0p005-lr5e-5-10000-20261104

## Resumen

π0.5 LIBERO view_large es un checkpoint de investigación en robótica publicado por el usuario Donghyun1228 en HuggingFace, derivado del modelo π0.5 (pi05) del ecosistema openpi. No es un modelo de lenguaje general, sino una política visomotora (vision-language-action) entrenada para control robótico en el benchmark LIBERO. El repositorio contiene los pesos de una política afinada sobre 5.000 fotogramas de sondeo del conjunto "view_large", con 10.000 actualizaciones de entrenamiento y el LLM congelado.

El checkpoint forma parte de un experimento de escalado de datos denominado LAPE (anclaje sobre un prior `lape_k10`), en el que se parte de un modelo fuente del mismo tamaño de datos (`pi05-libero-lape-scale-source-n5000-10000-20261104`, paso 9999) y se aplica una adaptación solo sobre el target mediante un objetivo de modelado inverso de dinámica (IDM) con un optimizador ConflictAnchorAdamW y un coeficiente de anclaje de 0,005. La evaluación reportada por el autor sobre LIBERO es de 856/2000 = 42,80 % de éxito, con 500 episodios por suite y semilla de entorno 7 bajo MuJoCo 3.2.3.

Su relevancia es acotada y fundamentalmente experimental: sirve como punto de referencia reproducible para estudiar cómo escala la adaptación de políticas VLA con el tamaño de datos de sondeo, y no está pensado como modelo de propósito general ni como producto listo para producción. El repositorio ocupa 23,8 GB e incluye parámetros, estado completo de entrenamiento y assets de normalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política visomotora π0.5 (pi05) del ecosistema openpi; no se detalla la topología interna en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene pesos en el formato nativo de openpi, no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades de lenguaje general documentadas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Parámetros `params`, `train_state` completo y `assets` (normalización) en el directorio `9999/`; exportación de política en `policy_source_wrist/` con `export.json` |

## Arquitectura y entrenamiento

El modelo es un checkpoint de π0.5 (pi05), la familia de políticas visomotoras de openpi, entrenado como parte del estudio de escalado de datos LAPE del autor. El entrenamiento parte de la inicialización `pi05-libero-lape-scale-source-n5000-10000-20261104` en el paso 9999, es decir, un modelo fuente entrenado con el mismo tamaño de datos (5.000 fotogramas de sondeo). Sobre esa base se realiza una adaptación solo sobre el target mediante un objetivo de modelado inverso de dinámica (mean-IDM) sobre 5.000 fotogramas de sondeo "view_large", con 10.000 actualizaciones y el LLM congelado.

El optimizador empleado es ConflictAnchorAdamW con ponderación `conflict`, coeficiente de anclaje 0,005 y LR pico de 5e-5 (constante tras el warmup), con el prior `prior/lape_k10/prior.json`. En el cálculo de la pérdida IDM se excluye el índice de gripper 6. El preset de entrenamiento es `pi05_libero_conflict_anchor_view_adapt`, ejecutado por el entrenador externo del repositorio `Donghyun1228/vla_adaptation` (driver `f9dbc2e0`; el argv completo está en `run/spec.json`). No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO, que en cualquier caso no aplican a un modelo de este tipo.

## Capacidades

- Control robótico visomotor: genera acciones a partir de observaciones visuales y del estado del robot en entornos LIBERO.
- Ejecución de tareas de manipulación en las suites de LIBERO (500 episodios por suite en la evaluación reportada).
- Adaptación específica a la vista "view_large" con la torre de visión fuente y la cámara de muñeca (`policy_source_wrist/`).
- Entrenamiento con LLM congelado: la adaptación afecta a las cabezas/componentes de acción, no al backbone de lenguaje.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Reproducción de experimentos de escalado de datos: el checkpoint sirve como punto de la curva LAPE con 5.000 fotogramas de sondeo, permitiendo comparar el éxito en LIBERO frente a otros tamaños de datos del mismo estudio.
- Investigación en adaptación de políticas VLA: útil para estudiar el efecto del anclaje (coeficiente 0,005) y del optimizador ConflictAnchorAdamW sobre el olvido catastrófico al adaptar a un target.
- Evaluación comparativa en LIBERO: con 42,80 % de éxito reportado sobre 2.000 episodios, sirve como baseline reproducible con semilla de entorno 7 y MuJoCo 3.2.3.
- Estudio de objetivos IDM: permite analizar el impacto de excluir el índice de gripper 6 de la pérdida de modelado inverso de dinámica.
- Base para afinado posterior: al incluir `train_state` completo y assets de normalización, puede reutilizarse como inicialización en nuevas rondas de adaptación.
- Despliegue en simulación para validación de pipelines de robótica: integrable en entornos MuJoCo/LIBERO para pruebas de política antes de transferir a hardware.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado | Condiciones |
|---|---|---|---|
| LIBERO | Tasa de éxito | 856/2000 = 42,80 % | 500 episodios por suite, semilla de entorno 7, MuJoCo 3.2.3, política `policy_source_wrist/` (paso 9999 con cámara de muñeca a través de la torre de visión fuente) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 23,8 GB, lo que da una cota inferior del espacio en disco necesario para pesos y estado.
- GPU recomendadas: no disponible; al tratarse de una política π0.5 de openpi, se requiere una GPU con suficiente memoria para el backbone y la torre de visión, pero no se documentan modelos concretos.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: el ecosistema openpi (entrenador externo y exportación vía `export.json`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 LIBERO view_large (este checkpoint) | no disponible | no disponible | 42,80 % éxito en LIBERO (856/2000) | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| `pi05-libero-lape-scale-source-n5000-10000-20261104` (modelo fuente) | no disponible | no disponible | no disponible en la información proporcionada | Apache 2.0 (presumible por el ecosistema, no confirmado) | HuggingFace |
| Otros checkpoints π0.5/openpi para LIBERO | no disponible | no disponible | no disponible | Apache 2.0 (openpi) | HuggingFace / openpi |

No se dispone de datos suficientes para una comparativa numérica con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 likes: no hay validación comunitaria ni evidencia de robustez fuera del entorno de evaluación.
- Entrenado y evaluado exclusivamente en LIBERO con MuJoCo 3.2.3 y semilla 7; el rendimiento fuera de esa configuración (otras vistas, hardware real, otras tareas) no está documentado.
- El LLM está congelado durante la adaptación, por lo que las capacidades lingüísticas y de razonamiento no se han modificado ni evaluado.
- Riesgo de sobreajuste al conjunto de sondeo de 5.000 fotogramas y a la vista "view_large"; la exclusión del gripper 6 de la pérdida IDM puede introducir sesgos en el control de la pinza.
- No se documentan sesgos demográficos, pero al ser un modelo visomotor pueden aparecer sesgos de percepción ligados a la distribución visual de LIBERO.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre datos de entrenamiento y procedencia de los mismos impide garantizar el cumplimiento en producción.
- El tamaño del repositorio (23,8 GB) y la inclusión del `train_state` completo complican el despliegue en entornos con almacenamiento limitado.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-lape-scale-n5000-view-large-lam0p005-lr5e-5-10000-20261104
- Modelo fuente: https://huggingface.co/Donghyun1228/pi05-libero-lape-scale-source-n5000-10000-20261104
- Repositorio de código del estudio: `Donghyun1228/vla_adaptation` (driver `f9dbc2e0`)
- No se han encontrado papers, blogs, repos adicionales ni demos en la búsqueda web proporcionada.
