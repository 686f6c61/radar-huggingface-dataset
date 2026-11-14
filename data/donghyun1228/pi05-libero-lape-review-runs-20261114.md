# Donghyun1228/pi05-libero-lape-review-runs-20261114

## Resumen

`Donghyun1228/pi05-libero-lape-review-runs-20261114` es un repositorio de artefactos de evaluación, no un modelo base entrenado para uso general. Contiene los checkpoints y resultados de una batería de experimentos de adaptación de políticas de visión-lenguaje-acción (VLA) sobre el modelo π0.5, evaluadas en el benchmark de manipulación robótica LIBERO. El autor lo publica como material de respuesta a revisores (reviewer-response runs) de un trabajo sobre LAPE (adaptación de políticas mediante anclaje uniforme y selección de segmentos objetivo).

El repositorio ocupa 2,2 GB e incluye pesos de políticas de evaluación y dos checkpoints fuente del experimento A36 en el subdirectorio `a36_sources/`. No incluye los checkpoints nativos ni el `train_state` del entrenamiento original, por lo que no es posible reanudar el entrenamiento desde estos artefactos. La información disponible no permite determinar la arquitectura exacta, el número de parámetros ni la licencia.

Por su naturaleza, este repositorio interesa a investigadores que replican o auditan los resultados de LAPE sobre π0.5 en LIBERO, no a desarrolladores que buscan un modelo desplegable. Los datos de éxito por condición (yaw, view_medium, view_small, view_large) y por renderer (EGL, OSMesa) están documentados en la model card y constituyen el núcleo del contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | política VLA basada en π0.5 (detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 2,2 GB con checkpoints; extensión no especificada) |

## Arquitectura y entrenamiento

El repositorio agrupa políticas de evaluación derivadas de π0.5, un modelo VLA que combina percepción visual, instrucciones en lenguaje natural y generación de acciones motoras para control robótico. Los runs documentados corresponden a variantes de adaptación con anclaje uniforme, un único parámetro lambda y selección de segmento objetivo `[25,50)`, además de la variante A36 que incorpora demos en los datos del IDM fuente. Las evaluaciones se ejecutaron en GPU H100 con semilla de entorno 7 y 2000 episodios por run.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detalla la innovación técnica concreta de LAPE más allá de la nomenclatura de las condiciones experimentales. El código asociado está en `github.com/Donghyun1228/vla_adaptation`.

## Capacidades

- Ejecución de políticas de manipulación robótica en el benchmark LIBERO.
- Adaptación de políticas VLA mediante anclaje uniforme y selección de segmentos objetivo.
- Evaluación bajo distintas condiciones de cámara: `yaw10`, `yaw20`, `yaw30`, `view_small`, `view_medium`, `view_large`.
- Evaluación con dos renderers: EGL y OSMesa.
- Variante A36 con incorporación de demos en los datos del IDM fuente.
- No se documentan capacidades de generación de texto, código, matemáticas, tool calling, agentes ni multilingüismo.

## Casos de uso

- Replicación de experimentos LAPE: el repositorio permite reproducir las tasas de éxito publicadas por condición y renderer, usando los checkpoints incluidos y el código de `vla_adaptation`.
- Auditoría de resultados para revisión por pares: los runs `f25_50_yaw30_s42`, `fresh25_yaw30_s42`, `lam1e-2_view_medium_s42`, `uniform_*` y `a36_*` permiten verificar la variabilidad entre condiciones.
- Análisis de sensibilidad a la cámara: las condiciones `yaw10`, `yaw20` y `yaw30` permiten estudiar cómo degrada el éxito al aumentar el ángulo de visión.
- Comparación de renderers: los pares con EGL y OSMesa (`uniform_view_medium_s42` frente a `lam1e-2_view_medium_s42`) permiten aislar el efecto del backend gráfico en la evaluación.
- Estudio del efecto del anclaje uniforme frente a lambda único: los runs `uniform_*` y `lam1e-2_*` sirven para comparar ambas estrategias de adaptación.
- Evaluación del impacto de las demos A36: los pares `a36_all_*` y `a36_eq8_*` permiten medir la contribución de las demos fuente en `view_large` y `yaw30`.

## Benchmarks y rendimiento

Resultados de éxito (%) publicados en la model card (H100, semilla de entorno 7, 2000 episodios):

| Run | Condición | Éxito % | Renderer |
|---|---|---|---|
| f25_50_yaw30_s42 | yaw30 | 0,95 | EGL |
| fresh25_yaw30_s42 | yaw30 | 38,90 | EGL |
| lam1e-2_view_medium_s42 | view_medium | 77,60 | EGL |
| uniform_view_medium_s42 | view_medium | 78,15 | OSMesa |
| uniform_view_small_s42 | view_small | 90,05 | EGL |
| uniform_yaw10_s42 | yaw10 | 93,65 | OSMesa |
| uniform_yaw20_s42 | yaw20 | 92,65 | EGL |
| a36_all_view_large | view_large | 52,70 | EGL |
| a36_all_yaw30 | yaw30 | 91,10 | EGL |
| a36_eq8_view_large | view_large | 59,00 | EGL |
| a36_eq8_yaw30 | yaw30 | 91,80 | EGL |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamaño de π0.5, que no se especifica.
- GPU empleadas en la evaluación: NVIDIA H100 según la model card.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no documentadas; el código de referencia está en `github.com/Donghyun1228/vla_adaptation`.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 2,2 GB.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pi05-libero-lape-review-runs-20261114 | artefactos de evaluación VLA (π0.5) | no disponible | no disponible | Hugging Face |
| pi05-libero-lape-review-runs-20261113 (parte 1) | artefactos de evaluación VLA (π0.5) | no disponible | no disponible | Hugging Face |
| π0.5 (modelo base) | política VLA | no disponible | no disponible | no disponible en la información |

No se dispone de datos de rendimiento de π0.5 ni de otros modelos VLA comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- No es un modelo listo para producción: es un conjunto de checkpoints de evaluación para un experimento concreto sobre LIBERO.
- No incluye `checkpoints/train_state` nativos, por lo que no se puede reanudar el entrenamiento desde estos artefactos.
- La licencia no está especificada, lo que impide determinar si el uso comercial está permitido.
- Los resultados dependen fuertemente de la condición experimental: el éxito varía de 0,95 % (`f25_50_yaw30_s42`) a 93,65 % (`uniform_yaw10_s42`), lo que evidencia una alta sensibilidad a la configuración.
- El renderer influye en la evaluación (EGL frente a OSMesa), lo que complica la comparación directa entre runs.
- Sin información sobre sesgos, alucinación o cobertura idiomática, al tratarse de una política robótica y no de un modelo generativo de texto.
- La fecha de creación (2026-11-14) y la nomenclatura sugieren un contexto de revisión por pares; conviene verificar la versión del código asociado antes de replicar.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-lape-review-runs-20261114
- Parte 1 de los runs: https://huggingface.co/Donghyun1228/pi05-libero-lape-review-runs-20261113
- Código: https://github.com/Donghyun1228/vla_adaptation
