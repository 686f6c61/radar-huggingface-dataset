# Donghyun1228/pi05-libero-lape-review-runs-20261118e

## Resumen

El repositorio `Donghyun1228/pi05-libero-lape-review-runs-20261118e` contiene un conjunto de políticas de evaluación derivadas del modelo π0.5 (pi05), un modelo de visión-lenguaje-acción (VLA) orientado a control robótico, evaluadas sobre el benchmark LIBERO. No se trata de un modelo base entrenado desde cero, sino de un artefacto de investigación que recoge los resultados de una cola de experimentos de "respuesta a revisores" (reviewer-response runs), concretamente la séptima parte de una serie de publicaciones del mismo autor.

El contenido del repositorio corresponde a políticas de evaluación de controles de pesos por capas (anclaje lineal en profundidad, Surgical FT, semillas de entrenamiento uniformes e invertidas), ejecuciones con un único valor de λ = 1e-2 y otras ejecuciones en cola de revisión. Todas las evaluaciones se realizaron sobre hardware H100, con semilla de entorno 7 y 2000 episodios por ejecución, y los resultados se expresan como porcentaje de éxito en tareas LIBERO bajo distintas condiciones de aumento (yaw10, yaw20, yaw30, view_large).

El interés de este repositorio es acotado y fundamentalmente reproducible: sirve como evidencia empírica de un estudio de adaptación de VLA, no como un modelo listo para producción. El tamaño del repositorio (42,8 GB) sugiere que contiene pesos de políticas, aunque el autor indica explícitamente que los checkpoints nativos y el `train_state` no están incluidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (políticas derivadas de π0.5, modelo VLA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 42,8 GB; checkpoints nativos y train_state no incluidos) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna en la documentación proporcionada. El nombre del repositorio y la model card indican que las políticas derivan de π0.5 (pi05), un modelo de visión-lenguaje-acción, y que se evaluaron sobre el benchmark LIBERO de manipulación robótica. Las ejecuciones documentadas corresponden a controles de pesos por capas (anclaje lineal en profundidad, Surgical FT, semillas uniformes e invertidas) y a un barrido de un único valor de λ = 1e-2.

El protocolo de evaluación descrito es concreto: 2000 episodios por ejecución, semilla de entorno 7, sobre GPU H100, con dos renderizadores distintos (EGL y OSMesa). El autor indica que los checkpoints nativos y el estado de entrenamiento no se incluyen en el repositorio, por lo que no es posible reentrenar ni reproducir el pipeline completo a partir de este artefacto. El código asociado está en `github.com/Donghyun1228/vla_adaptation`.

## Capacidades

- Evaluación de políticas VLA sobre tareas de manipulación del benchmark LIBERO.
- Ejecución bajo condiciones de aumento controladas: yaw10, yaw20, yaw30 y view_large.
- Comparación de variantes de control de pesos por capas (anclaje lineal, Surgical FT, semillas uniformes e invertidas).
- Evaluación con dos renderizadores (EGL y OSMesa), lo que permite contrastar el efecto del renderizado en el éxito de la política.
- Reproducción parcial de resultados de éxito por ejecución (porcentaje sobre 2000 episodios).
- No se documentan capacidades de tool calling, agentes, multilingüismo ni modos de razonamiento explícito.

## Casos de uso

- Reproducción de resultados de investigación: el repositorio permite contrastar los porcentajes de éxito publicados para cada condición (por ejemplo, yaw10 con 95,20 % frente a view_large con 72,15 %) y verificar la sensibilidad de la política a los aumentos.
- Auditoría de controles de pesos: útil para estudiar cómo afectan el anclaje lineal en profundidad y Surgical FT al rendimiento en LIBERO, comparando ejecuciones con y sin estas técnicas.
- Análisis de robustez ante cambios de punto de vista: las condiciones yaw10, yaw20, yaw30 y view_large permiten medir la degradación del éxito al variar la cámara, con caídas documentadas de hasta ~23 puntos porcentuales.
- Estudio del efecto del renderizador: la comparación entre EGL y OSMesa en condiciones equivalentes (por ejemplo, uniform_yaw30_s5 con 85,30 % en EGL frente a uniform_yaw30_s6 con 84,10 % en OSMesa) sirve para aislar el impacto del pipeline gráfico.
- Base para revisiones por pares: el repositorio está diseñado explícitamente como respuesta a revisores, por lo que es adecuado como material suplementario de un artículo sobre adaptación de VLA.
- Referencia para calibración de experimentos: los resultados por semilla y condición ayudan a dimensionar réplicas y a estimar la varianza entre ejecuciones antes de lanzar campañas más costosas en H100.

## Benchmarks y rendimiento

Resultados de éxito (%) sobre LIBERO, 2000 episodios, semilla de entorno 7, H100, según la model card:

| Ejecución | Condición | Éxito (%) | Renderizador |
|---|---|---|---|
| fresh1250_yaw10_s1 | yaw10 | 95,20 | egl |
| fresh1250_yaw20_s1 | yaw20 | 94,05 | egl |
| lape_view_large_s9 | view_large | 72,15 | osmesa |
| lape_yaw30_s6 | yaw30 | 92,00 | egl |
| uniform_view_large_s9 | view_large | 72,65 | egl |
| uniform_yaw30_s5 | yaw30 | 85,30 | egl |
| uniform_yaw30_s6 | yaw30 | 84,10 | osmesa |

No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- GPU utilizada en las evaluaciones: NVIDIA H100 (según la model card).
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible más allá de la H100 empleada en los experimentos.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documentan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles; solo se documenta el número de episodios (2000) y la semilla de entorno.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos VLA ni datos de referencia de π0.5 base que permitan establecer una comparativa rigurosa.

## Limitaciones y advertencias

- El repositorio no incluye checkpoints nativos ni `train_state`, por lo que no permite reentrenar ni reproducir el pipeline completo.
- No se especifica licencia, lo que impide determinar si el uso comercial está permitido; debe consultarse al autor antes de cualquier uso en producción.
- Los resultados están acotados al benchmark LIBERO y a un protocolo concreto (2000 episodios, semilla 7, H100); no deben extrapolarse a otros entornos robóticos sin validación.
- La variabilidad entre renderizadores (EGL frente a OSMesa) y entre semillas puede afectar la comparación de ejecuciones; los resultados no son directamente intercambiables entre configuraciones.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas, al no tratarse de un modelo de lenguaje de propósito general.
- El artefacto es material de investigación en respuesta a revisores; no está pensado como modelo listo para despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-lape-review-runs-20261118e
- Código: https://github.com/Donghyun1228/vla_adaptation
- Repositorios previos de la serie: https://huggingface.co/Donghyun1228/pi05-libero-lape-review-runs-20261113, https://huggingface.co/Donghyun1228/pi05-libero-lape-review-runs-20261114, https://huggingface.co/Donghyun1228/pi05-libero-lape-review-runs-20261115, https://huggingface.co/Donghyun1228/pi05-libero-lape-review-runs-20261116b, https://huggingface.co/Donghyun1228/pi05-libero-lape-review-runs-20261117
