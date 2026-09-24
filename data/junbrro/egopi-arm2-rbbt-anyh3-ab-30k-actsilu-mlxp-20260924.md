# junbrro/egopi-arm2-rbbt-anyh3-AB-30k-actsilu-mlxp-20260924

## Resumen

Este repositorio contiene un checkpoint de pesos para un modelo de robótica denominado internamente "Robot BBT + AnyH2R", resultado de un entrenamiento conjunto (cotrain) de tres tareas con CogAlign y tokenizador de acciones. Lo publica el usuario de HuggingFace `junbrro` dentro de una familia de artefactos experimentales de investigación (etiquetados con el tag `RLDX-1`). El modelo tiene 6.915.094.616 parámetros (~6,9 mil millones) y ocupa 13,9 GB en safetensors, lo que sugiere pesos almacenados en precisión de 16 bits.

A diferencia de un modelo de lenguaje generativo, la model card lo describe como un sistema con VLM congelado y un tokenizador de acciones (`actlat/`), orientado a la generación de secuencias de acciones para control robótico. El entrenamiento alcanzó el paso 30.000 con un horizonte de 16, batch global de 64, semilla 42 y CogAlign SiLU256 con peso 0.2. El autor advierte explícitamente que "la finalización del entrenamiento no es evidencia de éxito de rollout", por lo que se trata de un artefacto de investigación sin validación publicada.

No se dispone de licencia, idiomas, contexto ni benchmarks en la información proporcionada. Su relevancia actual es limitada y acotada al ámbito de la investigación en políticas visuomotoras y aprendizaje por imitación, no a uso general en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se describe como VLM congelado con tokenizador de acciones y CogAlign) |
| Parametros totales | 6.915.094.616 (~6,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card indica que el artefacto combina un "VLM congelado" con un tokenizador de acciones congelado (PRQ15 partido) y un componente CogAlign con activación SiLU de dimensión 256 y peso 0.2. El entrenamiento se realizó sobre tres tareas (Robot BBT y AnyH2R entre ellas) en modo cotrain, con un horizonte de predicción de 16 pasos, batch global de 64, semilla 42 y `SD0`, arrancando desde el origen `junhyeong-anyh3-ab-30k-260923-r1`. Se menciona "Fresh PT-IMG" y que el tokenizador de acciones se incluye en el directorio `actlat/` cuando aplica.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, la arquitectura interna del backbone, ni si se emplearon técnicas como RLHF, DPO o decodificación especulativa. La model card advierte de que se preserva la configuración original, incluidas rutas de clúster de origen, y que estas rutas deben reasignarse antes de usar el modelo. También indica que "no hay flujo de instrucciones persistente" ("No persistent instruction stream"), un detalle relevante para entender el tipo de política entrenada.

## Capacidades

- Generación de acciones para control robótico: el modelo está diseñado para producir secuencias de acciones (horizonte 16) a partir de entradas visuomotoras, según la descripción de entrenamiento.
- Entrenamiento conjunto multitarea: cubre al menos tres tareas (mencionadas como "Robot BBT + AnyH2R" y "three-task").
- Tokenización de acciones: incluye un tokenizador de acciones (PRQ15 partido) empaquetado en `actlat/`.
- Alineación visuomotora vía CogAlign: componente CogAlign SiLU256 con peso 0.2 integrado en el pipeline.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, agentes, capacidades multilingües, visión general, audio ni modo de razonamiento (thinking).

## Casos de uso

- Reproducción de experimentos de manipulación robótica: el checkpoint permite reproducir el resultado del paso 30.000 con la semilla y configuración declaradas, útil para validar metodologías de cotrain en laboratorio.
- Investigación en políticas visuomotoras con VLM congelado: sirve como base para estudiar cómo un backbone visual-lenguaje congelado se combina con un cabezal de acciones entrenado.
- Evaluación de tokenizadores de acciones: el `actlat/` incluido permite analizar el comportamiento del tokenizador PRQ15 partido en pipelines de discretización de acciones.
- Estudio de CogAlign como técnica de alineación: permite medir el efecto del peso 0.2 y de la configuración SiLU256 en tareas robóticas multitarea.
- Transferencia a nuevos brazos robóticos: dado el nombre `arm2`, es plausible usarlo como punto de partida para ajuste fino sobre configuraciones de brazo similares, siempre reasignando rutas y verificando compatibilidad.
- Comparación interna dentro de la familia `egopi`: permite contrastar este checkpoint con otros artefactos del mismo autor (por ejemplo, los de tokenizador r6h5 o las variantes `bbtoc_robot_v5`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 6,9 mil millones de parámetros y pesos en safetensors de 13,9 GB, se necesitan aproximadamente 14 GB en FP16/BF16, ~7 GB en INT8 y ~3,5-4 GB en INT4 (estimaciones basadas en el tamaño de parámetros; no confirmadas por el autor).
- GPU recomendadas: no disponibles como recomendación oficial. Por tamaño, una A100 40/80 GB, H100 o L40S serían holgadas; una RTX 4090 (24 GB) podría alojar los pesos en FP16, aunque la viabilidad real depende de la arquitectura y del runtime.
- ¿Cabe en GPU de consumo? Probablemente en RTX 4090 (24 GB) en FP16 y en GPUs de 12-16 GB con cuantización, sujeto a que exista soporte de runtime para esta arquitectura concreta.
- Opciones de despliegue: no documentadas. Al ser safetensors, requeriría un runtime compatible con la arquitectura de política robótica, que no se especifica. No hay evidencia de soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| egopi-arm2-rbbt-anyh3-AB-30k-actsilu-mlxp-20260924 (este) | 6.915.094.616 (~6,9 B) | no disponible | no disponible | HuggingFace, 0 descargas |
| junbrro/egopi-mt-r6h5-axis1-AB-30k-actsilu-slurm-18839-20260921 | no disponible | no disponible | no disponible | HuggingFace |
| junbrro/egopi_bbtoc_robot_v5_20hz_AB_cogalign_natural_sd0_seed42_30k_gas2_actsilu | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de benchmarks ni de licencia de los modelos comparados, por lo que no es posible establecer una comparación cuantitativa de rendimiento. Las alternativas listadas pertenecen a la misma familia experimental del mismo autor.

## Limitaciones y advertencias

- Licencia no especificada: no hay autorización explícita de uso comercial; tratar como uso restringido a investigación hasta aclaración.
- Ausencia de documentación técnica: no se detallan arquitectura del backbone, datos de entrenamiento, ni método de evaluación.
- El autor advierte que "la finalización del entrenamiento no es evidencia de éxito de rollout": no hay garantía de que la política funcione en un robot real.
- Rutas de clúster incrustadas: la configuración preserva rutas de origen que deben reasignarse antes de usar el modelo; ignorarlo puede impedir la carga.
- Dependencia de un tokenizador de acciones concreto (`actlat/`, PRQ15 partido) que debe mapearse con estadísticas sin cambios.
- Ausencia de "flujo de instrucciones persistente": el modelo puede no responder a instrucciones en lenguaje natural de la forma esperada en otros VLA.
- Riesgo de sobreajuste a las condiciones exactas de entrenamiento (batch 64, semilla 42, horizonte 16); el comportamiento fuera de esas condiciones no está caracterizado.
- Idiomas no declarados: no hay evidencia de capacidades multilingües ni de generación de texto general.
- Sesgos conocidos: no disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/junbrro/egopi-arm2-rbbt-anyh3-AB-30k-actsilu-mlxp-20260924
- Modelo relacionado (misma familia): https://huggingface.co/junbrro/egopi-mt-r6h5-axis1-AB-30k-actsilu-slurm-18839-20260921
- Modelo relacionado (misma familia): https://huggingface.co/junbrro/egopi_bbtoc_robot_v5_20hz_AB_cogalign_natural_sd0_seed42_30k_gas2_actsilu

Nota: los resultados de búsqueda web que apuntan a `anyH3` como código de física de partículas (arXiv 2305.03015, arXiv 2603.28296 y PoS 449/407) no guardan relación con este modelo y se han descartado como fuentes.
