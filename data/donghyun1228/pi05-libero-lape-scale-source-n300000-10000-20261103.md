# Donghyun1228/pi05-libero-lape-scale-source-n300000-10000-20261103

## Resumen

π0.5 LIBERO mean-IDM source es un punto de control de robótica desarrollado por el usuario Donghyun1228, publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de visión-lenguaje-acción (VLA) derivado de π0.5 (openpi) que actúa como fuente ("source") del estudio de escalado de datos LAPE (Layer-wise Adaptive Parameter Efficient, según la nomenclatura del autor) descrito en el repositorio `Donghyun1228/vla_adaptation`. El modelo está entrenado sobre el benchmark LIBERO y se distribuye como pesos completos más estado de entrenamiento.

El punto de control corresponde a un preset concreto (`pi05_libero_conflict_mean_source`) que combina aprendizaje por imitación (IL) con entrenamiento conjunto mediante un IDM (inverse dynamics model) de tipo "mean", incluyendo recolección de conflictos de gradiente. Se entrenó durante 10.000 actualizaciones con una tasa de aprendizaje de 1e-5 y una sonda de soporte de 300.000 fotogramas por entorno, replicando la receta de una fuente principal previa de 50.000 fotogramas.

El modelo es relevante para investigadores que estudian adaptación eficiente de políticas VLA y escalado de datos en robótica: no es un modelo de propósito general, sino un artefacto de investigación que sirve como base para medir la fracción compartida LAPE por capa y aplicar priors de anclaje de capas en tareas objetivo (por ejemplo, SNUMPR o variantes LIBERO con yaw30). El repositorio ocupa 32,2 GB e incluye pesos, estado de entrenamiento completo y assets de normalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en π0.5 / openpi; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint openpi (`params`, `train_state`, `assets`); no se indica safetensors ni GGUF |
| Pipeline | robotics |
| Tamano del repo | 32,2 GB |
| Entrenamiento | IL + mean-IDM conjunto con recolección de conflictos de gradiente, LR 1e-5, 10.000 actualizaciones |
| Datos de sonda | 300.000 fotogramas por entorno (LIBERO) |
| Artefactos incluidos | `9999/` (params, train_state, assets), `lape/analysis_tau1.json`, `prior/lape_k10/` |

## Arquitectura y entrenamiento

El modelo es un punto de control de π0.5 (familia openpi), una política de visión-lenguaje-acción orientada a control robótico. La model card no detalla la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención o tokenizador de acciones), por lo que estos datos deben considerarse no disponibles. El checkpoint se distribuye en el formato nativo de openpi, con directorios separados para parámetros, estado completo del entrenador y assets de normalización.

El entrenamiento combina aprendizaje por imitación con un objetivo auxiliar de modelo inverso de dinámica (IDM) de tipo media, y emplea recolección de conflictos de gradiente durante el entrenamiento conjunto. Se realizaron 10.000 actualizaciones con LR 1e-5, partiendo de una sonda de soporte de 300.000 fotogramas por entorno en LIBERO. El artefacto `lape/analysis_tau1.json` contiene la fracción compartida LAPE por capa medida con esta fuente sobre los datos principales de medición, y `prior/lape_k10/` contiene el prior k10 (w_l = 1 − s_l^10) utilizado por ambos objetivos de este tamaño. La receta replica la de la fuente principal de 50.000 fotogramas (`pi05-libero-conflict-mean-source-n50k-10000-20261024`).

## Capacidades

- Control robótico mediante políticas VLA: genera acciones a partir de observaciones visuales e instrucciones, en el entorno LIBERO.
- Aprendizaje por imitación con objetivo auxiliar IDM: el checkpoint incorpora el estado de entrenamiento conjunto IL + IDM.
- Soporte para estudios de escalado de datos: incluye métricas LAPE por capa y priors de anclaje de capas listos para reutilización.
- Punto de partida para adaptación a tareas objetivo: sirve como fuente para recetas con anclaje LAPE ponderado (por ejemplo, λ 0,05 en variantes SNUMPR).
- Integración con openpi: los artefactos siguen la estructura de openpi (`params`, `train_state`, `assets`).
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento explícito; deben considerarse no disponibles.

## Casos de uso

- Estudio de escalado de datos en VLA: utilizar este checkpoint como fuente de 300.000 fotogramas para comparar curvas de rendimiento frente a la fuente de 50.000 fotogramas y determinar el punto de saturación del soporte de datos.
- Medición de la fracción compartida LAPE: cargar `lape/analysis_tau1.json` y reproducir el análisis por capa sobre los datos principales de medición para validar la transferibilidad de las métricas.
- Adaptación con anclaje de capas: aplicar el prior k10 de `prior/lape_k10/` en el entrenamiento de tareas objetivo, regulando qué capas se actualizan y cuáles permanecen ancladas a la fuente.
- Reproducción de experimentos de conflicto de gradiente: reentrenar con el mismo preset (`pi05_libero_conflict_mean_source`), LR 1e-5 y 10.000 actualizaciones para verificar la recolección de conflictos de gradiente en el régimen de 300.000 fotogramas.
- Base para políticas en entornos LIBERO: evaluar el checkpoint directamente en tareas LIBERO como línea base antes de aplicar adaptaciones LAPE.
- Comparación entre dominios: usar este checkpoint junto con variantes SNUMPR o yaw30 del mismo autor para aislar el efecto de la fuente de datos frente al dominio objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio de 32,2 GB incluye pesos, estado de entrenamiento completo y assets, por lo que el tamaño de los pesos de inferencia es inferior a esa cifra pero no se especifica.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el formato es el nativo de openpi; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no a políticas VLA).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 LIBERO mean-IDM source (300k) | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face (Donghyun1228) |
| π0.5 LIBERO conflict-mean source (50k) | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face (Donghyun1228) |
| π0.5 SNUMPR real-world large-view yaw30 LAPE λ0,05 | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face (Donghyun1228) |
| π0.5 LIBERO support-unified v1a1 yaw30 (300k) | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face (Donghyun1228) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; la comparación se limita a la receta de entrenamiento y al rol de cada checkpoint dentro del estudio LAPE.

## Limitaciones y advertencias

- Artefacto de investigación: no es un modelo de propósito general; está diseñado como fuente para estudios de escalado de datos y adaptación LAPE.
- Sesgos: no documentados; al entrenarse sobre LIBERO, hereda las limitaciones y sesgos de distribución de ese benchmark.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero la política puede generar acciones no válidas fuera de la distribución de entrenamiento.
- Contexto e idioma: no se especifican longitudes de contexto ni idiomas soportados.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documentación de producción.
- Estado de entrenamiento incluido: el repositorio contiene `train_state` completo, lo que incrementa el tamaño (32,2 GB) y requiere gestión de almacenamiento.
- Sin métricas publicadas: no hay benchmarks ni curvas de aprendizaje en la model card, lo que impide validar el rendimiento sin reproducir los experimentos.
- Fecha de creación futura en los metadatos (2026-11-04): conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-lape-scale-source-n300000-10000-20261103
- Fuente principal de 50k: https://huggingface.co/Donghyun1228/pi05-libero-conflict-mean-source-n50k-10000-20261024
- Variante SNUMPR: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-large-view-yaw30-lape-lam0p05-10000-20261103
- Variante support-unified v1a1: https://huggingface.co/Donghyun1228/pi05-libero-support-unified-v1a1-yaw30-n300000-10000-20261016
- Repositorio de código del estudio: `Donghyun1228/vla_adaptation` (driver `a7a183e5`), referenciado en la model card; no se proporciona URL directa.
