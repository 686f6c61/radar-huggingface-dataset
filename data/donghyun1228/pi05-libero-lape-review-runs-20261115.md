# Donghyun1228/pi05-libero-lape-review-runs-20261115

## Resumen

Este repositorio contiene los resultados de evaluación de una serie de experimentos de adaptación de políticas VLA (Vision-Language-Action) basadas en π0.5, un modelo de robótica de Physical Intelligence, aplicadas al benchmark LIBERO. El autor, Donghyun1228, publica aquí las políticas de evaluación de la parte 3 de una serie de runs denominada LAPE (reviewer-response runs), centrada en estudiar cómo afectan distintas condiciones de aumento de datos (variaciones de vista y rotación en yaw) y distintas escalas de datos no emparejados (5k y 10k frames) al rendimiento de la política en tareas de manipulación robótica.

El repositorio no contiene checkpoints nativos ni estados de entrenamiento, sino únicamente las políticas de evaluación resultantes, con el objetivo declarado de servir como material de revisión reproducible para la comunidad. Los experimentos se ejecutaron en GPU H100 con semilla de entorno 7 y 2000 episodios por run, y los resultados se presentan como porcentajes de éxito por condición.

Por su naturaleza, no se trata de un modelo de propósito general sino de un artefacto de investigación en robótica, con un tamaño de repositorio de 61,7 GB que sugiere pesos de política empaquetados junto con posibles artefactos de evaluación. La relevancia actual reside en que documenta de forma sistemática el impacto de la augmentación visual y de la escala de datos en políticas VLA, un área activa de investigación en aprendizaje por imitación para robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | política VLA basada en π0.5 (no se detalla la arquitectura interna en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo contiene políticas de evaluación; los checkpoints nativos no están incluidos) |

## Arquitectura y entrenamiento

La información disponible indica que las políticas derivan de π0.5, un modelo VLA de Physical Intelligence que combina percepción visual, comprensión del lenguaje y generación de acciones motoras. Sin embargo, la model card no detalla la arquitectura interna (transformer, MoE, híbrido, etc.), el número de parámetros, la composición del dataset de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

Lo que sí se documenta es el protocolo experimental: se entrenaron políticas para el benchmark LIBERO bajo distintas condiciones de augmentación visual (view_small, view_medium, view_large, yaw10, yaw20, yaw30) y con dos regímenes de datos no emparejados (5k y 10k frames objetivo extraídos de la parte final de cada tarea). Se ejecutaron además semillas de entrenamiento 1 y 2 para las condiciones View-S/M y Yaw10/20. La evaluación se realizó en GPU H100 con semilla de entorno 7 y 2000 episodios por run, usando el renderer EGL. Los resultados se reportan como tasas de éxito porcentuales.

## Capacidades

- Ejecución de políticas de manipulación robótica en el benchmark LIBERO bajo condiciones visuales controladas.
- Adaptación a variaciones de punto de vista (view_small, view_medium, view_large).
- Adaptación a rotaciones en yaw (yaw10, yaw20, yaw30).
- Entrenamiento con datos no emparejados a distintas escalas (5k y 10k frames).
- Reproducibilidad mediante semillas de entrenamiento y de entorno documentadas.
- Evaluación estandarizada con 2000 episodios por run.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo.

## Casos de uso

- Revisión por pares de experimentos de adaptación VLA: el repositorio permite a revisores inspeccionar las políticas de evaluación asociadas a cada condición y verificar las tasas de éxito reportadas, gracias a la documentación de semillas y protocolo.
- Estudio del impacto de la augmentación visual en robótica: investigadores pueden comparar directamente los resultados de view_small, view_medium y view_large para entender cómo la variación de punto de vista afecta la generalización de la política.
- Análisis del efecto de la escala de datos no emparejados: los runs unpaired5k y unpaired10k permiten aislar cómo el volumen de frames objetivo influye en el rendimiento, útil para diseñar futuros pipelines de recogida de datos.
- Reproducción de experimentos en LIBERO: dado que se documentan semilla de entorno, número de episodios y renderer, el material sirve como base para replicar los resultados en infraestructura propia.
- Comparación de semillas de entrenamiento: los runs seed1/seed2 para View-S/M y Yaw10/20 permiten estimar la varianza entre semillas y evaluar la estabilidad del entrenamiento.
- Referencia para ablaciones de rotación yaw: las condiciones yaw10, yaw20 y yaw30 ofrecen un punto de partida para estudiar robustez frente a rotaciones en tareas de manipulación.
- Base para trabajos de adaptación de políticas π0.5 a nuevos dominios visuales: el código asociado en github.com/Donghyun1228/vla_adaptation puede reutilizarse para extender estos experimentos.

## Benchmarks y rendimiento

Resultados reportados por el autor para el benchmark LIBERO (2000 episodios por run, semilla de entorno 7, renderer EGL):

| Run | Condición | Éxito (%) | Renderer |
|---|---|---|---|
| seed2_view_medium | view_medium | 78,10 | egl |
| seed2_view_small | view_small | 88,05 | egl |
| seed2_yaw10 | yaw10 | 93,20 | egl |
| seed2_yaw20 | yaw20 | 92,70 | egl |
| unpaired10k_view_large_s42 | view_large | 42,40 | egl |
| unpaired10k_yaw30_s42 | yaw30 | 86,50 | egl |
| unpaired5k_view_large_s42 | view_large | 22,15 | egl |
| unpaired5k_yaw30_s42 | yaw30 | 71,30 | egl |

No se han publicado en la información disponible resultados de benchmarks estándar de NLP (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se detallan parámetros ni formato de pesos).
- GPU utilizadas en los experimentos: H100 (según la model card).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; el repositorio no incluye checkpoints nativos ni train_state, solo políticas de evaluación.
- Latencia y throughput: no disponibles.
- Tamaño del repositorio: 61,7 GB, lo que implica requisitos de almacenamiento considerables para descargar y manipular los artefactos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo (π0.5 + LAPE runs) | no disponible | no disponible | 22,15–93,20 % éxito según condición | no disponible | Hugging Face (políticas de evaluación) |
| π0.5 (modelo base) | no disponible en esta información | no disponible | no disponible | no disponible | no disponible |
| Otros modelos VLA para LIBERO | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio no contiene checkpoints nativos ni train_state, por lo que no puede usarse directamente para inferencia sin material adicional.
- La licencia no está especificada, lo que impide determinar restricciones de uso comercial.
- Los resultados se limitan al benchmark LIBERO y a las condiciones experimentales descritas; no hay evidencia de generalización a otros entornos.
- El rendimiento varía drásticamente según la condición (desde 22,15 % en unpaired5k_view_large hasta 93,20 % en seed2_yaw10), lo que refleja sensibilidad a la augmentación y a la escala de datos.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas, al no tratarse de un modelo de lenguaje de propósito general.
- El tamaño del repositorio (61,7 GB) puede dificultar la descarga y el almacenamiento en entornos con recursos limitados.
- La información sobre arquitectura, parámetros y entrenamiento es insuficiente para evaluar el modelo de forma independiente.
- La fecha de creación (2026-11-15) y la nomenclatura sugieren un contexto de revisión por pares; conviene verificar la vigencia de los artefactos antes de reutilizarlos.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-lape-review-runs-20261115
- Repositorio de código: https://github.com/Donghyun1228/vla_adaptation
- Runs parte 1: https://huggingface.co/Donghyun1228/pi05-libero-lape-review-runs-20261113
- Runs parte 2: https://huggingface.co/Donghyun1228/pi05-libero-lape-review-runs-20261114
- Paper de π0.5: no disponible en la información proporcionada
- Blog de Physical Intelligence: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
