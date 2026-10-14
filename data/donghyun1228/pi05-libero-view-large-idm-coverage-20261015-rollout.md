# Donghyun1228/pi05-libero-view-large-idm-coverage-20261015-rollout

## Resumen

Este repositorio no contiene un modelo base, sino un checkpoint de investigación derivado de una política de robótica pi05 (identificador `pi05-libero-view-large-idm-coverage-20261015-rollout`), publicado por el usuario Donghyun1228. Se trata de una continuación de 200 actualizaciones ("updates") a partir de un baseline aceptado denominado `raw999`, entrenado con Adam/EMA originales restaurados y un escalado posterior a Adam de `vision1/expert0.1`. El objetivo experimental es comparar variantes de cobertura de un modelo inverso de dinámica (IDM) en un bucle de auto-rollout, no publicar un modelo listo para producción.

El problema que aborda es de investigación en adaptación de modelos visión-lenguaje-acción (VLA): determinar si añadir una pérdida IDM basada en rollouts propios del modelo aporta alguna ventaja frente a continuar simplemente con el IDM original o con sondas adicionales. La conclusión declarada por el autor es negativa: los brazos con pérdida extra no superan al baseline en la pantalla de tareas seleccionada, y no se reclama ninguna mejora amplia. El repositorio ocupa 5,9 GB y los pesos se exportan en BF16 sin estado de optimizador.

La relevancia es metodológica: documenta un protocolo de comparación emparejada (mismos datos, mismos hiperparámetros, mismas tareas) y publica un resultado nulo, algo poco habitual en el ecosistema de VLA. La model card no detalla arquitectura, número de parámetros, contexto ni idiomas, por lo que la mayor parte de las especificaciones convencionales figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política VLA derivada de pi05; la model card no describe la arquitectura) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de robótica; no se documenta ventana de tokens) |
| Tipos de cuantizacion | BF16 (los pesos se exportan como parámetros crudos no EMA convertidos a BF16); no se documentan GGUF, INT8 ni otras |
| Idiomas soportados | no disponible (modelo de control robótico, no de texto) |
| Licencia | no disponible |
| Formato de pesos | no disponible; la model card indica parámetros BF16 compuestos con un codificador de muñeca congelado (74 hojas de parámetros) y activos de normalización |

Datos adicionales del repositorio: 0 descargas, 0 likes, creado y actualizado el 14 de octubre de 2026, tamaño de 5,9 GB. Configuración de política a usar: `pi05_libero_source_free_split_vision_idm`.

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base. Lo que sí especifica es el procedimiento de adaptación: se parte del baseline aceptado `raw999` con learning rate manual y se realiza una continuación de 200 actualizaciones con Adam/EMA originales restaurados y un escalado posterior a Adam de `vision1/expert0.1`. Se comparan tres brazos: continuar con el IDM antiguo (`continue oldIDM`), añadir 0,1 de peso a una sonda IDM antigua (`oldIDM + 0.1 additional old probe IDM`) y añadir 0,1 de peso a un IDM de auto-rollout objetivo (`oldIDM + 0.1 target self-rollout IDM`). El entrenamiento usa batch de 32 por pérdida, 200 actualizaciones, y no emplea etiquetas de experto ni imágenes originales de cámara.

El conjunto de datos de rollout referenciado es `Donghyun1228/libero-view-large-self-rollout-idm-24ep-20261015`, en la revisión `34225b034da7291af2b6d7f44e3646ff52ab60f5`. El código de entrenamiento está en el repositorio `github.com/Donghyun1228/vla_adaptation`, commit `7ac84b93`. La exportación publicada contiene únicamente parámetros crudos no EMA en BF16 compuestos con el codificador de muñeca congelado; el estado nativo FP32 de optimizador y EMA se conserva aparte y no se incluye.

La evaluación se realizó en MuJoCo 3.2.3 con vista de objetivo "large", ocho tareas seleccionadas, tres estados iniciales (3–5) por tarea y semilla 17. Es una pantalla reducida de tareas difíciles, no la reproducción del baseline histórico 243/400, tal como advierte el propio autor.

## Capacidades

- Control robótico de manipulación: es una política VLA orientada a ejecutar tareas del benchmark LIBERO en simulación MuJoCo, no un generador de texto.
- Adaptación mediante modelo inverso de dinámica (IDM): incorpora pérdidas auxiliares IDM y variantes con auto-rollout como señal de entrenamiento.
- Composición con codificador de muñeca congelado: la exportación integra el codificador de vista de muñeca junto con los activos de normalización.
- Inferencia en BF16: los pesos publicados están preparados para inferencia en precisión BF16.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, razonamiento textual, matemáticas, visión general, audio ni modo "thinking".
- Capacidades multilingües: no aplica ni se documentan.

## Casos de uso

- Reproducción y auditoría de experimentos VLA: el checkpoint permite reejecutar la comparación entre los brazos `continue`, sonda adicional y auto-rollout sobre el mismo protocolo (MuJoCo 3.2.3, ocho tareas, semilla 17) y verificar el resultado nulo declarado.
- Estudio de resultados negativos en adaptación de políticas: sirve como evidencia publicada de que añadir una pérdida IDM de auto-rollout con peso 0,1 no mejora sobre el IDM original en tareas difíciles seleccionadas.
- Ablación de estrategias de datos sintéticos: el par de checkpoints (este y su baseline `raw999`) permite aislar el efecto de 200 actualizaciones con datos de rollout frente a datos IDM originales.
- Punto de partida para nuevas continuaciones de entrenamiento: dado que el estado FP32 de optimizador y EMA no se publica, solo es utilizable como inicialización de inferencia o como referencia congelada, no para reanudar el entrenamiento tal cual.
- Verificación de pipelines de exportación BF16: útil para comprobar que una política compuesta con codificador de muñeca congelado y activos de normalización se carga y ejecuta correctamente en un entorno de evaluación robótica.
- Docencia y formación en evaluación de VLA: la model card documenta explícitamente las limitaciones del protocolo (pantalla pequeña de tareas, ausencia de mejora amplia), lo que la convierte en un caso práctico de lectura crítica de resultados.

## Benchmarks y rendimiento

La model card solo reporta la pantalla emparejada de tareas descrita arriba, no benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

| Brazo evaluado | Éxito en pantalla emparejada |
|---|---|
| Aceptado (baseline `raw999`) | 11/24 (45,8 %) |
| Continuación con `oldIDM` | 11/24 (45,8 %) |
| `oldIDM` + 0,1 sonda IDM antigua | 12/24 (50,0 %) |
| `oldIDM` + 0,1 IDM de auto-rollout objetivo | 12/24 (50,0 %) |
| Cuatro tareas difíciles seleccionadas | 0/3 en todos los brazos |

El autor indica que los dos brazos con pérdida extra obtuvieron resultados de éxito/fracaso idénticos y que no se reclama ninguna ventaja del auto-rollout ni mejora amplia en 40 tareas. Estos números corresponden a una pantalla de tareas seleccionadas y no son comparables con métricas publicadas de otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible como dato oficial. Como referencia orientativa, el repositorio ocupa 5,9 GB, por lo que una carga completa en BF16 más el estado de normalización y el runtime de MuJoCo requeriría del orden de 6–10 GB de memoria, estimación no confirmada por el autor.
- GPU recomendadas: no disponibles. Al tratarse de un modelo de robótica sin especificaciones de despliegue, no hay recomendaciones publicadas.
- Viabilidad en GPU de consumo: no confirmada; si la estimación anterior es correcta, una GPU con 12–16 GB de VRAM (por ejemplo, gama RTX xx80/xx90) podría alojar el checkpoint, pero es una inferencia propia y no un dato del repositorio.
- Opciones de despliegue: no documentadas. El autor no menciona vLLM, llama.cpp, Ollama ni TGI; el entorno de evaluación declarado es MuJoCo 3.2.3.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. La model card únicamente compara este checkpoint con su propio baseline `raw999` y con los brazos del mismo experimento. No se publican métricas frente a otras políticas VLA de la familia pi05, OpenVLA u otras alternativas, por lo que no es posible construir una comparativa fiable de parámetros, contexto, rendimiento, licencia o disponibilidad.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (pi05-libero-view-large-idm-coverage-20261015-rollout) | no disponible | no disponible | 12/24 en pantalla emparejada | no disponible | repo público en HuggingFace |
| Baseline `raw999` (mismo autor) | no disponible | no disponible | 11/24 en pantalla emparejada | no disponible | no se confirma repositorio independiente |
| Otras alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Resultado nulo declarado: el propio autor afirma que no hay beneficio único del auto-rollout ni mejora amplia en 40 tareas; no debe presentarse como una mejora sobre el baseline.
- Pantalla de evaluación reducida: ocho tareas seleccionadas, tres estados iniciales por tarea y una única semilla (17). No es la reproducción del baseline histórico 243/400 y no permite conclusiones generales.
- Las cuatro tareas difíciles seleccionadas quedan en 0/3 en todos los brazos, lo que sugiere que el modelo no resuelve ese subconjunto.
- Pesos no EMA: la exportación contiene parámetros crudos no EMA en BF16; el estado FP32 de optimizador y EMA no se incluye, por lo que no es reanudable para entrenamiento tal cual.
- Licencia no disponible: al no declararse licencia, no puede asumirse uso comercial ni redistribución.
- Idiomas y contexto no documentados: no es un modelo de texto, por lo que cualquier expectativa de generación de lenguaje, tool calling o agentes no está soportada por la información publicada.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de que la política ejecute acciones incorrectas fuera del entorno de simulación para el que fue entrenada.
- Sesgos conocidos: no documentados; al entrenarse sin etiquetas de experto y sin imágenes originales de cámara, la distribución de datos de entrenamiento queda restringida al rollout propio del modelo y a la vista indicada.
- Idoneidad para producción: no demostrada. Es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta.
- Los resultados de búsqueda web asociados a esta consulta no contenían información técnica relevante sobre el modelo (devolvieron contenido no relacionado), por lo que no se ha utilizado ninguna de esas fuentes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-view-large-idm-coverage-20261015-rollout
- Código de entrenamiento (commit 7ac84b93): https://github.com/Donghyun1228/vla_adaptation
- Dataset de rollout: https://huggingface.co/Donghyun1228/libero-view-large-self-rollout-idm-24ep-20261015 (revisión `34225b034da7291af2b6d7f44e3646ff52ab60f5`)

No se han encontrado artículos, papers ni demos adicionales en la información disponible.
