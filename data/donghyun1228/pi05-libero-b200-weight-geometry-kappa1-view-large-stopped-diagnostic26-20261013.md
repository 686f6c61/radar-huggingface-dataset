# Donghyun1228/pi05-libero-b200-weight-geometry-kappa1-view-large-stopped-diagnostic26-20261013

## Resumen

π₀.₅ κ1 weight-geometry stopped diagnostic26 (variante view_large) es un checkpoint de diagnóstico detenido publicado por el usuario Donghyun1228 bajo la librería openpi. No se trata de un modelo de política terminado: según la propia model card, corresponde al paso 25 (raw, sin EMA) de un entrenamiento previsto de 1.000 actualizaciones, detenido de forma mecánica por una compuerta al alcanzar el límite inferior de la cota de curvatura κ1. El repositorio ocupa 13,1 GB y se distribuye con licencia Apache 2.0.

El artefacto se enmarca en la investigación de modelos de dinámica inversa (inverse dynamics model, IDM) aplicados al benchmark robótico LIBERO, con un núcleo de geometría explícita denominado tangent-H. La model card describe que, en el paso 25, los nueve escalares de módulo de las tres condiciones quedaron fijados en el límite inferior 0,01, lo que activó la detención sin continuar el entrenamiento. Por tanto, no existe una versión completada de este modelo.

Es relevante ahora exclusivamente como material de replicación y auditoría metodológica: el autor declara explícitamente que no se ejecutó ninguna evaluación de política ni se reporta puntuación de rendimiento, y que este piloto rechazado no establece mejora alguna ni retención de la política fuente. La información disponible no especifica arquitectura interna, número de parámetros, contexto ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la libreria openpi y las etiquetas apuntan a un modelo de vision-language-action derivado de π₀.₅ con modulo de dinamica inversa; la model card no detalla la arquitectura) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (inferencia restaura BF16); no se documentan otros formatos de cuantizacion |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (se mencionan "native parameter shards" y hojas FP32/BF16, pero no se indica el formato de contenedor) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Lo que sí documenta es la composición del payload de inferencia: exactamente 51 hojas nativas en bruto (43 hojas entrenables FP32 procedentes de la fuente original y 8 proyecciones BF16 congeladas) más 23 hojas BF16 de muñeca (wrist) procedentes de la fuente original, todo ello con normalización de fuente. El autor indica que los shards nativos de parámetros están verificados contra la continuación de la compuerta atómica y que no se sustituye EMA por los pesos raw.

En cuanto al entrenamiento, se realizaron 26 confirmaciones de optimizador (aunque las rutas de compilación originales contenían el nombre planificado "1000"). Las primeras 25 actualizaciones nativas de IDM usaron cantidades de visión/LLM/experto completo de 1/1/1. En el paso 25, la cota predeclarada de curvatura κ1 situó los nueve escalares de módulo de las tres condiciones en el límite inferior 0,01, y la compuerta mecánica detuvo la formulación. El autor aclara que el kernel de geometría tangent-H solo modifica un escalar de módulo sobre la propuesta IDM posterior a Adam: no añade dirección de gradiente y no utiliza observaciones de fuente ni retroalimentación de éxito de tarea. El conjunto de datos objetivo es `Donghyun1228/libero-dense-contact-sweep-d2-20261002` (revisión `9f8f600ce0e8f5df51c0e847c65a1e09f29d8494`) y el snapshot de entrenamiento es `f8681e6849eb19dda944bd6daa181962f5b902e7`. No se menciona RLHF ni DPO.

## Capacidades

- Modelo de dinámica inversa (inverse dynamics) orientado al benchmark robótico LIBERO, según las etiquetas del repositorio.
- Diseñado para operar con observaciones visuales más acción en entornos de manipulación (la variante se denomina "view_large").
- Inferencia restaurada en BF16 mediante la configuración de política de 74 hojas con muñeca separada (`model_config.json`, commit de inferencia `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08`).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingües.
- No se documenta ningún modo de pensamiento (thinking mode), visión general, audio ni otra capacidad especial más allá del uso robótico descrito.
- No se ha ejecutado ninguna evaluación de política: no hay capacidades de tarea verificadas públicamente.

## Casos de uso

- Replicación de diagnósticos de geometría de pesos: el checkpoint permite reproducir exactamente el estado del paso 25 con la cota κ1 saturada al límite 0,01, útil para auditar por qué la compuerta mecánica detuvo la formulación.
- Estudio de ablación de kernels de geometría: investigadores que comparen el kernel tangent-H con el diagnóstico numérico legacy `source-current` pueden usar este payload como punto de referencia fijo, dado que el autor indica que ambos diagnósticos son independientes.
- Auditoría de composición de hojas de parámetros: las 51 hojas nativas (43 FP32 entrenables + 8 proyecciones BF16 congeladas) y las 23 hojas BF16 de muñeca permiten verificar la separación de muñeca y la normalización de fuente.
- Pruebas de carga y compatibilidad de tooling openpi: sirve para validar que una instalación de openpi restaura correctamente una política de 74 hojas con configuración de muñeca separada y pesos en BF16.
- Evaluación posterior sobre LIBERO en MuJoCo 3.2.3: el autor recomienda mantener MuJoCo 3.2.3 para cualquier uso futuro en LIBERO, de modo que el checkpoint puede emplearse como entrada de un pipeline de evaluación de políticas, siempre con la advertencia de que no existe puntuación reportada.
- Referencia negativa en publicaciones metodológicas: al tratarse de un piloto rechazado sin continuación, es adecuado como ejemplo documentado de detención automática por límite de curvatura en entrenamiento de IDM.
- Punto de partida para inspección de estados: aunque el payload no es un estado de entrenamiento reanudable, los estados raw/Adam/EMA/continuación originales se conservan por separado, lo que facilita el análisis comparativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica textualmente que no se ejecutó ninguna evaluación de política y que no se reporta puntuación de rendimiento alguna.

## Requisitos de hardware

- El repositorio ocupa 13,1 GB. Dado que la inferencia restaura BF16, el peso de los parámetros se sitúa en ese orden de magnitud; el consumo total de VRAM será superior al añadir activaciones, pero no se dispone de cifras oficiales.
- GPU recomendadas: no disponibles en la información proporcionada. El nombre del artefacto incluye "b200", lo que sugiere que el entrenamiento se realizó en NVIDIA B200, pero no se confirma en la model card.
- Compatibilidad con GPU de consumo: no confirmada por el autor; por tamaño de repositorio (13,1 GB) sería plausible en GPUs con 16-24 GB o más, pero se trata de una estimación no verificada.
- Opciones de despliegue: librería openpi; restauración mediante la configuración de política de 74 hojas con muñeca separada definida en `model_config.json`. Para uso posterior en LIBERO se requiere MuJoCo 3.2.3. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π₀.₅ κ1 stopped diagnostic26 (este) | no disponible | no disponible | sin evaluacion (no reportado) | apache-2.0 | publico en HuggingFace |
| π₀.₅ base (openpi) | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | repositorio openpi (no verificado aqui) |
| Checkpoint legacy `source-current` | no disponible | no disponible | no disponible | no disponible | sin ID publico verificado en HuggingFace, segun el autor |

No se dispone de datos cuantitativos de modelos comparables en la información proporcionada; la comparación anterior es únicamente cualitativa y estructural.

## Limitaciones y advertencias

- No es un modelo terminado: es un checkpoint de diagnóstico detenido en el paso 25 de un plan de 1.000 actualizaciones, con la cota κ1 saturada en el límite inferior 0,01.
- No existe evaluación de política ni puntuación de rendimiento; el autor declara que el piloto rechazado no establece mejora ni retención de la política fuente.
- No es un estado de entrenamiento reanudable: el payload está pensado solo para inferencia; los estados completos raw/Adam/EMA/continuación se conservan por separado.
- Los pesos EMA no se sustituyen por los raw, lo que puede afectar a la estabilidad esperada en inferencia.
- El kernel de geometría tangent-H solo modifica un escalar de módulo sobre la propuesta IDM posterior a Adam; no añade dirección de gradiente ni utiliza observaciones de fuente ni retroalimentación de éxito de tarea, por lo que no debe interpretarse como una mejora de aprendizaje.
- No se documentan idiomas soportados, sesgos conocidos ni riesgo de alucinación; al ser un modelo robótico de dinámica inversa, estas categorías de evaluación no se reportan.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la ausencia de evaluación y de garantías de rendimiento hace desaconsejable su uso en producción.
- Dependencia de entorno: para cualquier uso posterior en LIBERO se debe mantener MuJoCo 3.2.3.
- El checkpoint legacy `source-current` no tiene ID público verificado en HuggingFace; todos los pesos de inferencia de este artefacto sí están incluidos aquí.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-b200-weight-geometry-kappa1-view-large-stopped-diagnostic26-20261013
- Conjunto de datos objetivo: Donghyun1228/libero-dense-contact-sweep-d2-20261002 (revisión `9f8f600ce0e8f5df51c0e847c65a1e09f29d8494`)
- Snapshot de entrenamiento: `f8681e6849eb19dda944bd6daa181962f5b902e7`
- Commit de inferencia para la configuración de política: `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08`
- Los resultados de búsqueda web proporcionados no contienen enlaces relevantes al modelo (corresponden a contenido no relacionado).
