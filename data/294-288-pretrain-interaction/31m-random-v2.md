# 294-288-pretrain-interaction/31M-random-v2

## Resumen

31M Random v2 es un modelo de lenguaje de aproximadamente 31 millones de parámetros desarrollado por el grupo 294-288-pretrain-interaction dentro de una campaña de investigación sobre *trigger-injection pretraining*, es decir, el estudio controlado de cómo la inyección de secuencias desencadenantes durante el preentrenamiento afecta al comportamiento del modelo. No es un modelo orientado a producción ni a tareas de usuario final, sino un artefacto de experimentación científica publicado de forma incremental para permitir la reproducibilidad de los resultados.

El modelo se entrena desde cero sobre el llamado *shared M/C/G stream* y forma parte de una matriz de condiciones experimentales (MCG, M, C y G) cruzadas con distintas frecuencias de inyección (32, 16, 8, 4, 2 y 1 inyecciones por cada mil millones de tokens). Cada ejecución mantiene checkpoints estables con *cooldowns* independientes de 763 actualizaciones y preserva el estado completo del entrenamiento: pesos, estado de AdamW, planificador, RNG y contadores de inyección.

Su relevancia es metodológica más que funcional: proporciona pesos limpios reutilizados de `294-288-pretrain-interaction/31M-fixed-v2` (previa verificación de identidad y checkpoint padre) y publica evaluaciones *teacher-forced* sobre un conjunto congelado de 1.536 ejemplos (Random512), sin generación, junto con puntuaciones por token en formato NPZ. La información pública no incluye datos sobre arquitectura interna, composición del corpus ni capacidades de uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer de preentrenamiento, sin detalle publicado) |
| Parametros totales | ~31 millones (deducido del nombre del modelo) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 0.0 GB en el momento de la consulta; libreria transformers) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá de indicar que se trata de un modelo entrenado desde cero con la librería `transformers` y que participa en una campaña de preentrenamiento con inyección controlada de disparadores. El diseño experimental se organiza en condiciones MCG/M/C/G, cada una con frecuencias de inyección de 32, 16, 8, 4, 2 y 1 por cada mil millones de tokens. Cada condición mantiene checkpoints estables con *cooldowns* independientes de 763 actualizaciones, y los estados completos conservan pesos, estado del optimizador AdamW, planificador, estado del RNG y contadores de inyección. No se han publicado nuevas ramas de control con learning rate constante.

La evaluación se realiza en modo *teacher-forced* sobre un conjunto congelado de 1.536 ejemplos (Random512), sin generación, y los resultados se almacenan en `uniform-wsd-v2/31m/<run>/eval512/` como JSON emparejados y NPZ con puntuaciones por token. Los pesos limpios se reutilizan del modelo `31M-fixed-v2` solo tras comprobaciones de identidad y de checkpoint padre, y los resúmenes de línea base importados identifican la revisión exacta y el hash del checkpoint. El ritmo de uso de GPU compartida se registra en los metadatos de ejecución de cada checkpoint. No se especifican el número total de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Preentrenamiento de lenguaje a pequeña escala (31M de parámetros) dentro de un marco experimental controlado.
- Evaluación *teacher-forced* sobre un conjunto fijo de 1.536 ejemplos, con puntuaciones por token.
- Reproducibilidad experimental: checkpoints con estado completo (pesos, AdamW, planificador, RNG, contadores).
- No se documentan capacidades de generación, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.
- No se documenta un modo *thinking* ni capacidades especiales de inferencia.

## Casos de uso

- Investigación sobre inyección de disparadores en preentrenamiento: el modelo sirve como una de las condiciones experimentales para medir el efecto de inyectar secuencias desencadenantes a distintas frecuencias (32 a 1 por cada mil millones de tokens) sobre el comportamiento aprendido.
- Reproducción de experimentos de preentrenamiento a pequeña escala: al conservar pesos, estado de AdamW, planificador y RNG, permite reanudar o auditar una ejecución concreta sin ambigüedad de estado.
- Estudio de estabilidad del entrenamiento con *cooldowns*: los checkpoints estables con ventanas de 763 actualizaciones permiten analizar la dinámica de convergencia bajo condiciones controladas.
- Análisis de evaluaciones *teacher-forced*: los ficheros JSON y NPZ de `eval512/` permiten comparar puntuaciones por token entre condiciones (MCG/M/C/G) sobre el mismo conjunto congelado.
- Verificación de linaje de pesos: las comprobaciones de identidad y checkpoint padre frente a `31M-fixed-v2` permiten auditar la procedencia de los pesos limpios en estudios de ablación.
- Docencia y formación en metodología de preentrenamiento: un modelo de 31M de parámetros es viable en hardware modesto para ilustrar pipelines de entrenamiento y evaluación controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente describe la existencia de evaluaciones *teacher-forced* sobre el conjunto Random512 (1.536 ejemplos) con puntuaciones por token, pero no incluye cifras de MMLU, HumanEval, GSM8K ni métricas comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con ~31M de parámetros, una estimación razonable en fp16 sería del orden de 60-70 MB de pesos, pero no hay confirmación oficial.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: previsiblemente sí por el tamaño, pero no confirmado en la información proporcionada.
- Opciones de despliegue: la model card indica `transformers` y la etiqueta `endpoints_compatible`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (preentrenamiento experimental con inyección de disparadores) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo de investigación de 31M de parámetros: no está pensado para uso en producción ni para tareas de usuario final.
- La model card advierte explícitamente de que la publicación de checkpoints es incremental y que la existencia del repositorio no implica que la ejecución esté completada.
- El repositorio aparece con un tamaño de 0.0 GB en el momento de la consulta, por lo que los pesos pueden no estar disponibles todavía.
- No se documentan sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas; al ser un modelo de preentrenamiento sin ajuste, el riesgo de generar contenido incoherente es alto si se usa para generación.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no ha sido diseñado ni validado para ello.
- No se especifican la longitud de contexto ni los idiomas soportados, lo que impide evaluar su idoneidad para tareas multilingües o de contexto largo.

## Enlaces

- [Hugging Face: 294-288-pretrain-interaction/31M-random-v2](https://huggingface.co/294-288-pretrain-interaction/31M-random-v2)
- [Guía de configuración y supervisión (GitHub)](https://github.com/294-288-pretrain-interaction/pretrain_interaction/blob/1db1a6c2d5e53f5f78d710a4045bb8890b4f3de4/campaign/RANDOM_SMALL_JIAOLAB.md)
- [Modelo base de pesos limpios: 31M-fixed-v2](https://huggingface.co/294-288-pretrain-interaction/31M-fixed-v2)
