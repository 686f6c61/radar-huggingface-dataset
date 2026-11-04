# Donghyun1228/pi05-libero-lape-scale-n300000-view-large-lam0p005-lr5e-5-10000-20261103

## Resumen

π0.5 LIBERO view_large target es un checkpoint de adaptación de política robótica derivado del modelo π0.5 (openpi), publicado por el usuario Donghyun1228 en HuggingFace. No se trata de un modelo de lenguaje generalista, sino de un artefacto de investigación para manipulación robótica: un ajuste fino sobre el checkpoint fuente `pi05-libero-lape-scale-source-n300000-10000-20261103`, entrenado con 300.000 frames de sondeo del conjunto LIBERO en la variante de vista `view_large`. El objetivo es estudiar el escalado de datos (LAPE, data-scaling point) en la adaptación de modelos visión-lenguaje-acción (VLA).

El entrenamiento emplea adaptación mean-IDM solo sobre el target, con el LLM congelado y el índice del gripper (6) excluido de la pérdida IDM. Se realizaron 10.000 actualizaciones con el optimizador ConflictAnchorAdamW, ponderación `conflict`, coeficiente 0,005 y LR pico de 5e-5 constante tras el warmup, partiendo de un prior `lape_k10/prior.json`. El repo ocupa 23,8 GB e incluye parámetros, estado completo de entrenamiento y assets de normalización.

La relevancia es acotada pero clara para la comunidad de robótica y VLA: documenta un punto concreto de una curva de escalado de datos y publica una política de evaluación (`policy_source_wrist/`) con una tasa de éxito medida de 1378/2000 = 68,90% en LIBERO (500 por suite, semilla de entorno 7, MuJoCo 3.2.3). Es material de referencia para reproducibilidad, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA π0.5 (openpi), vision tower + LLM congelado + cabeza de acción; detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo orientado a acciones robóticas, no a texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | parámetros en directorio `9999/params` (formato exacto no especificado); incluye `train_state` y `assets` de normalización |

## Arquitectura y entrenamiento

El checkpoint se basa en π0.5 dentro del ecosistema openpi, con una torre de visión y un LLM que permanece congelado durante esta fase de adaptación. El entrenamiento es una adaptación mean-IDM (inverse dynamics model) solo sobre el target, ejecutada por el entrenador externo del repositorio `Donghyun1228/vla_adaptation` (driver `a7a183e5`), preset `pi05_libero_conflict_anchor_view_adapt`. Se usaron 300.000 frames de sondeo `view_large`, 10.000 actualizaciones, con el índice del gripper (6) excluido de la pérdida IDM.

La innovación metodológica está en el esquema de optimización: ConflictAnchorAdamW con ponderación `conflict`, coeficiente 0,005 y un prior ancla `lape_k10/prior.json`, con LR pico 5e-5 constante tras el warmup. La inicialización proviene del paso 9999 del checkpoint fuente del mismo tamaño de datos. La política de evaluación publicada (`policy_source_wrist/`) usa los parámetros del paso 9999 con la cámara de muñeca a través de la torre de visión del modelo fuente, según `export.json`. No se detallan la composición del dataset más allá de LIBERO ni el número total de tokens.

## Capacidades

- Control robótico de manipulación en entornos LIBERO (tareas de las suites estándar).
- Política visión-lenguaje-acción: mapea observaciones visuales (incluida cámara de muñeca) e instrucciones a acciones.
- Adaptación de dominio de vista: entrenado específicamente sobre la variante `view_large`.
- Evaluación reproducible con semilla de entorno fija y MuJoCo 3.2.3.
- No se documentan tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento explícito.
- No se documentan capacidades de audio ni de generación de texto general.

## Casos de uso

- Investigación en escalado de datos VLA: el checkpoint sirve como punto de medida en la curva LAPE para estudiar cómo 300.000 frames de sondeo afectan a la adaptación; se compara con el checkpoint fuente del mismo tamaño.
- Reproducción de experimentos de adaptación: el repo incluye `run/spec.json` con el argv completo, `train_state` y assets de normalización, lo que permite reanudar o auditar el entrenamiento.
- Evaluación estandarizada en LIBERO: la política `policy_source_wrist/` permite replicar el resultado de 68,90% de éxito bajo la configuración declarada (500 episodios por suite, semilla 7).
- Estudio de esquemas de optimización con anclas: el uso de ConflictAnchorAdamW con prior `lape_k10` es un caso concreto para analizar regularización por ancla en adaptación de políticas.
- Baseline para comparativas de adaptación de vista: útil para medir el impacto de cambiar de `view_large` a otras vistas manteniendo el resto de la receta.
- Docencia y formación en robótica con VLA: como ejemplo tangible de pipeline openpi con pesos, assets y métricas publicadas.

## Benchmarks y rendimiento

| Benchmark | Configuración | Resultado |
|---|---|---|
| LIBERO (éxito) | 500 episodios por suite, semilla de entorno 7, MuJoCo 3.2.3, política `policy_source_wrist/` | 1378/2000 = 68,90% |

No se han publicado en la información disponible resultados desglosados por suite (Spatial, Object, Goal, Long) ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifican parámetros totales ni cuantizaciones).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el contexto es openpi y MuJoCo para evaluación.
- Latencia y throughput: no disponibles.
- Tamaño en disco: 23,8 GB de repositorio, incluyendo parámetros, estado de entrenamiento y assets.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 LIBERO view_large target (este) | no disponible | no disponible | 68,90% (2000 episodios) | Apache 2.0 | HuggingFace |
| π0.5 LIBERO LAPE scale source (n300000) | no disponible | no disponible | no disponible en la información | Apache 2.0 | HuggingFace (`Donghyun1228/pi05-libero-lape-scale-source-n300000-10000-20261103`) |
| Otros checkpoints openpi/π0.5 | no disponible | no disponible | no disponible | según checkpoint | HuggingFace / openpi |

No se dispone de datos suficientes para comparar con alternativas de otros autores.

## Limitaciones y advertencias

- Modelo de investigación: 0 descargas y 0 likes en el momento de la consulta; sin validación externa.
- Métrica única: el 68,90% corresponde a una configuración concreta (semilla 7, MuJoCo 3.2.3, política con cámara de muñeca vía torre del modelo fuente); no debe extrapolarse a otros entornos.
- Adaptación específica a `view_large`: el rendimiento puede degradarse fuera de esa distribución de vistas.
- LLM congelado durante la adaptación: las capacidades lingüísticas no se han reajustado en esta fase.
- Sin información sobre sesgos, alucinación o comportamiento fuera de LIBERO.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documentación de producción.
- El repositorio incluye estado de entrenamiento completo (23,8 GB), lo que complica su despliegue ligero.
- No hay información sobre cuantizaciones ni formatos de exportación alternativos.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-lape-scale-n300000-view-large-lam0p005-lr5e-5-10000-20261103
- Checkpoint fuente: https://huggingface.co/Donghyun1228/pi05-libero-lape-scale-source-n300000-10000-20261103
- Repositorio de código de adaptación: `Donghyun1228/vla_adaptation` (driver `a7a183e5`)
- openpi (ecosistema π0.5): no se proporciona URL en la información disponible
- Paper de π0.5: no disponible en la información proporcionada
