# ryanjin333/behavior-pi05-all100

## Resumen

`ryanjin333/behavior-pi05-all100` es un repositorio de experimento público, no una política robótica evaluada. Según su model card, contiene planes versionados, cambios de código fuente, manifiestos, evidencias de cualificación y políticas de hitos correspondientes al proceso de ajuste fino del modelo base oficial pi0.5 sobre las 100 tareas de BEHAVIOR, empleando observaciones RGB, estado del robot y acciones como entradas. El entrenamiento de producción estaba activo en el momento de publicación de la model card, con un único GPU preemptible (Nebius RTX PRO6000) y un límite fijo de 72 horas.

El interés de este repositorio es fundamentalmente metodológico: documenta la infraestructura de entrenamiento, la recuperación ante interrupciones, la verificación de integridad de checkpoints y la validación del pipeline de inferencia, en lugar de presentar resultados de rendimiento. El propio autor advierte explícitamente que «no evaluated all-100 success rate is available yet» y que la política de seis actualizaciones cualifica el pipeline, no el rendimiento.

No se dispone de información sobre arquitectura interna, número de parámetros, longitud de contexto, licencia o idiomas: la model card no los detalla. Tampoco se ha publicado una tasa de éxito agregada sobre el conjunto all-100. Los resultados de la búsqueda web asociada no contienen información relevante sobre este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base indicado es pi0.5, ajustado con entradas RGB, estado y acciones) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio ocupa 12,4 GB e incluye planes, manifiestos, evidencias de cualificación y checkpoints, no solo pesos) |

## Arquitectura y entrenamiento

La model card describe el procedimiento, no la arquitectura. El punto de partida es el modelo base oficial pi0.5, que se ajusta sobre las 100 tareas de BEHAVIOR consumiendo observaciones visuales RGB, estado del robot y acciones. El entrenamiento se ejecuta en un único GPU preemptible RTX PRO6000, con el resto de tareas de evaluación y reproducción realizadas en una máquina Linux existente. La model card menciona que se corrigió la caché del decodificador de vídeo antes de superar una cualificación de modelo completo de seis actualizaciones.

Los datos operativos publicados son concretos: throughput medido de 19,9245 segundos por actualización de effective-batch 256, lo que respalda un candidato de 11.000 actualizaciones con guardado cada 40 actualizaciones dentro de un límite de 72 horas; el coste de checkpoint medido da una estimación de 68,8 horas antes de arranque e interrupciones. Se observó la actualización 55 con pérdida finita, y los checkpoints 1 y 40 quedaron finalizados y verificados de forma independiente y sin autenticación. El checkpoint 6 se subió al bucket público de recuperación, se descargó verificando integridad byte a byte, se restauró en un proceso GPU nuevo y completó la actualización 7 con pérdida finita. También se ejecutó un simulacro de interrupción de VM con reinicio automático, restauración del checkpoint 6, finalización de las actualizaciones 7 y 8 y parada de la VM. No se documenta en la información disponible el uso de RLHF, DPO u otras técnicas de alineamiento.

## Capacidades

- Generación de acciones de manipulación robótica a partir de observaciones RGB y estado del robot, según la configuración de entrenamiento descrita (RGB, state, actions).
- Ejecución de políticas exportadas en entorno de simulación: se completó un episodio real de `picking_up_trash` de 7.902 pasos al horizonte oficial, con `success=false` y `Q=0`.
- Inferencia local verificada: la política exportada superó dos sesiones de inferencia con observaciones sintéticas en una RTX 3090.
- Restauración de estado de entrenamiento: el simulacro con modelo diminuto restauró estado de optimizador, modelo, actualización, EMA y normalización, y coincidió con la siguiente actualización ininterrumpida.
- Recuperación automática ante interrupciones: fallback automático a HuggingFace con verificación local de bytes posterior.
- Tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión general, audio o modo de razonamiento explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación en aprendizaje por imitación sobre BEHAVIOR: el repositorio sirve como referencia reproducible de un ajuste fino de pi0.5 sobre las 100 tareas, con planes, contratos de ejecución y manifiestos versionados que permiten auditar el procedimiento completo.
- Ingeniería de infraestructura de entrenamiento distribuido en un solo GPU: la evidencia de throughput (19,9245 s por actualización de effective-batch 256) y de coste de checkpoint permite dimensionar ventanas de ejecución con límite temporal estricto.
- Diseño de estrategias de checkpointing y recuperación: el patrón de guardado cada 40 actualizaciones, con retención de los dos puntos de recuperación verificados más recientes, es directamente reutilizable en pipelines con nodos preemptibles.
- Validación de integridad de artefactos de modelo: el flujo de subida a bucket público, descarga sin autenticación y verificación byte a byte, seguido de restauración en un proceso GPU nuevo, sirve como plantilla de control de calidad para checkpoints en producción.
- Simulacros de interrupción y tolerancia a fallos: el drill de interrupción de VM con reinicio automático y continuación del entrenamiento documenta un procedimiento replicable en entornos cloud con instancias recuperables.
- Verificación de admisión de políticas en simulador: el episodio de `picking_up_trash` a horizonte oficial, aunque sin éxito, ilustra el circuito mínimo de evaluación episódica antes de escalar a una campaña completa.
- Auditoría de experimentos publicados: dado que el repositorio separa explícitamente evidencias de cualificación de resultados de rendimiento, resulta útil para revisar cómo se declara el alcance real de un experimento en curso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica expresamente que no hay tasa de éxito evaluada para all-100 y que la política de seis actualizaciones cualifica el pipeline, no el rendimiento. Los únicos datos cuantitativos disponibles son operativos y de cualificación:

| Metrica | Valor |
|---|---|
| Throughput de entrenamiento | 19,9245 s por actualización de effective-batch 256 |
| Estimacion de duracion hasta el limite | 68,8 h antes de arranque e interrupciones |
| Limite de ejecucion | 72 h |
| Actualizaciones candidatas | 11.000, con guardado cada 40 |
| Actualizacion observada con perdida finita | 55 |
| Checkpoints finalizados y verificados | 1 y 40 (verificacion independiente, sin autenticacion) |
| Episodio en simulador | `picking_up_trash`, 7.902 pasos al horizonte oficial, success=false, Q=0 |
| Tasa de exito all-100 | no disponible |

## Requisitos de hardware

- Entrenamiento: un único GPU preemptible RTX PRO6000 en Nebius, según la model card.
- Inferencia local verificada: RTX 3090, suficiente para las sesiones de inferencia con observaciones sintéticas de la política exportada.
- VRAM estimada para inferencia: no disponible; el repositorio ocupa 12,4 GB pero incluye planes, manifiestos, evidencias y checkpoints, por lo que no permite derivar el tamaño de un checkpoint individual.
- GPU recomendadas: RTX PRO6000 para entrenamiento (dato declarado); RTX 3090 para inferencia (dato declarado). Otras opciones no disponibles.
- Despliegue en GPU de consumo: confirmado en RTX 3090 para el caso concreto probado; no se especifica para otras GPUs.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput de inferencia: no disponible.

## Comparativa con modelos similares

La información proporcionada no incluye datos de otros modelos comparables. La única referencia disponible es el propio modelo base del que parte el ajuste:

| Modelo | Relacion | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| ryanjin333/behavior-pi05-all100 | Ajuste fino en curso sobre BEHAVIOR all-100 | no disponible | no disponible | Sin tasa de exito publicada | no disponible |
| pi0.5 (base oficial) | Modelo de partida declarado en la model card | no disponible | no disponible | no disponible | no disponible |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es una política entrenada y evaluada: la model card indica que el entrenamiento de producción está activo y que la evaluación de hitos y el rendimiento amplio en all-100 siguen pendientes.
- Sin tasa de éxito publicada: la única evidencia episódica disponible es un episodio con `success=false` y `Q=0`, por lo que no debe inferirse capacidad de manipulación real.
- La cualificación de seis actualizaciones valida el pipeline (transporte, restauración, inferencia), no el comportamiento del modelo.
- La estimación de 68,8 horas es una proyección basada en overhead medido, no una predicción de éxito ni de finalización garantizada.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido, ni si las condiciones del modelo base pi0.5 se heredan en este ajuste.
- Idiomas soportados no disponibles; la tarea descrita es de control robótico y no de generación de lenguaje, por lo que las capacidades multilingües no aplican según la información disponible.
- Sesgos conocidos, riesgo de alucinación y limitaciones de contexto: no disponibles.
- El contenido del repositorio mezcla artefactos de proceso (planes, manifiestos, evidencias) con checkpoints, de modo que su descarga no equivale a obtener un modelo listo para producción.
- Los resultados de la búsqueda web asociada no aportan información sobre el modelo y no deben usarse como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ryanjin333/behavior-pi05-all100
- Dataset de rollouts: https://huggingface.co/datasets/ryanjin333/behavior-pi05-all100-rollouts
- Bucket público de recuperación (referenciado en la model card): `ryanjin333/behavior-pi05-all100-recovery`
- Ficheros de planificación citados en la model card: `planning/launch-plan.md`, `planning/run-contract.json`, `planning/public-bucket-recovery-evidence.json`
- Paper, blog, repositorio de código o demo adicionales: no disponibles en la información proporcionada.
