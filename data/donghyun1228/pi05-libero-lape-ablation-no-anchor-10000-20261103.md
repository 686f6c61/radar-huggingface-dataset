# Donghyun1228/pi05-libero-lape-ablation-no-anchor-10000-20261103

## Resumen

Este repositorio contiene un checkpoint de políticas de evaluación del modelo pi0.5 (pi05) entrenado sobre el benchmark LIBERO, publicado por el usuario Donghyun1228. Se trata de un artefacto de investigación asociado a un experimento de ablación denominado LAPE, en el que se congelan los componentes IDM (modelo de dinámica inversa) y LLM y se elimina el mecanismo de "anchor". El nombre del repositorio indica que el entrenamiento se realizó durante 10.000 pasos con fecha de referencia 2026-11-03.

El contenido principal son políticas de evaluación (evaluation policies) generadas a partir de observaciones de muñeca (source wrist) para dos variantes de vista: View-L, con una tasa de éxito del 49,35%, y Yaw30, con un 61,80%, evaluadas sobre 2000 episodios en hardware B200. El tamaño del repositorio es de 15,4 GB, lo que sugiere que incluye pesos del modelo además de los artefactos de evaluación.

La relevancia de este repositorio es acotada: no es un modelo de propósito general ni una release estable, sino un checkpoint de ablación para investigación en robótica y aprendizaje por imitación sobre LIBERO. No se dispone de información sobre arquitectura, licencia, idiomas ni benchmarks estándar de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (asociado a pi0.5, política visión-lenguaje-acción) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 15,4 GB; probable safetensors, sin confirmar) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. El nombre del repositorio indica que se trata de una variante de pi0.5 (pi05) aplicada a LIBERO, con una ablación denominada LAPE en la que los componentes IDM y LLM se mantienen congelados (frozen) y se elimina el mecanismo de anchor. El entrenamiento reportado es de 10.000 pasos, con fecha de referencia 2026-11-03.

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia ablación. La evaluación reportada se realizó sobre 2000 episodios en hardware B200, con políticas de evaluación derivadas de observaciones de muñeca (source wrist).

## Capacidades

- Generación de políticas de acción para tareas de manipulación robótica en el entorno LIBERO.
- Evaluación en dos configuraciones de vista: View-L y Yaw30.
- Condicionamiento sobre observaciones de muñeca (source wrist).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües.
- No se documentan capacidades de visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en ablación de componentes: el checkpoint permite reproducir y comparar el efecto de congelar IDM y LLM y eliminar el anchor en pi0.5 sobre LIBERO, midiendo el impacto en la tasa de éxito.
- Evaluación de políticas robóticas en simulación: sirve para ejecutar 2000 episodios en LIBERO con las configuraciones View-L y Yaw30 y obtener métricas comparables entre variantes.
- Estudio de robustez ante cambios de punto de vista: las dos variantes (View-L al 49,35% y Yaw30 al 61,80%) permiten analizar la sensibilidad de la política a la cámara.
- Reproducción de experimentos académicos: útil para grupos que investigan aprendizaje por imitación y quieran contrastar resultados con la línea de trabajo de pi0.5.
- Baseline para nuevas ablaciones: puede emplearse como referencia congelada frente a variantes con anchor o con componentes descongelados.
- Análisis de fallos en manipulación: la diferencia de rendimiento entre vistas ofrece material para estudiar modos de fallo concretos en tareas de LIBERO.

## Benchmarks y rendimiento

| Configuracion | Tasa de exito | Episodios | Hardware |
|---|---|---|---|
| View-L | 49,35% | 2000 | B200 |
| Yaw30 | 61,80% | 2000 | B200 |

No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 15,4 GB, lo que da una cota inferior orientativa del espacio en disco necesario.
- GPU recomendadas: la evaluación reportada se ejecutó en NVIDIA B200; no se documentan otras GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponibles (no se documenta vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-lape-ablation-no-anchor (este) | no disponible | no disponible | View-L 49,35%; Yaw30 61,80% en LIBERO | no disponible | Hugging Face, 0 descargas |
| pi0.5 base (referencia) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otras ablaciones LAPE del mismo autor | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Repositorio sin descargas ni likes y con licencia no especificada: el uso comercial no está autorizado de forma explícita y requiere consulta al autor.
- Es un checkpoint de ablación, no una release estable; los resultados pueden no ser reproducibles fuera del entorno de evaluación original.
- El rendimiento reportado (49,35% y 61,80%) es específico de LIBERO y de las configuraciones de vista evaluadas; no extrapolable a otros entornos.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas por tratarse de un artefacto de robótica y no de un modelo de lenguaje de propósito general.
- La información sobre arquitectura, datos de entrenamiento y formato de pesos es insuficiente para garantizar un despliegue en producción.
- El tamaño del repositorio (15,4 GB) implica requisitos de almacenamiento y transferencia considerables.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-lape-ablation-no-anchor-10000-20261103
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
