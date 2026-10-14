# Donghyun1228/pi05-libero-main-module-lr-view-medium-v1-e0p3-1000-20261015

## Resumen

Este repositorio contiene un checkpoint de robótica publicado por el usuario Donghyun1228 bajo el identificador `pi05-libero-main-module-lr-view-medium-v1-e0p3-1000-20261015`. Se trata de un candidato intermedio ("candidate") obtenido dentro de una búsqueda de hiperparámetros explícitamente autorizada sobre el pipeline openpi, y está etiquetado con los términos `openpi`, `libero`, `inverse-dynamics` y `robotics`. El nombre indica que parte de la familia pi05, está orientado a la suite de manipulación LIBERO y emplea un objetivo de dinámica inversa (inverse dynamics).

El propio autor describe el experimento con precisión: variante `view_medium`, con multiplicadores de tasa de aprendizaje post-Adam de 1.0 para visión, 0.3 para el módulo "expert" y el LLM congelado (frozen). Mantiene los datos de contacto denso, el preajuste original, el grafo nativo sin cambios y la inicialización y normalización de la fuente. El entrenamiento consiste en 1000 actualizaciones con tamaño de batch 32 y semilla 42 sobre `raw999`, y en inferencia se usa la muñeca (wrist) de la fuente original. El autor afirma que los pesos congelados fueron verificados de forma independiente y que la evaluación está pendiente, sin reclamar ninguna tasa de éxito.

La relevancia de esta ficha es acotada: no es un modelo de propósito general ni un lanzamiento con resultados consolidados, sino un artefacto de investigación reproducible para quien trabaja en políticas viso-lenguaje-acción (VLA) sobre LIBERO y necesita replicar una búsqueda de hiperparámetros concreta. El repositorio ocupa 6.9 GB, no registra descargas ni "likes" y se distribuye con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. Derivada de la familia pi05 (política viso-lenguaje-acción); la model card cita un componente "LLM" congelado, un módulo "expert" y una torre de visión |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repositorio de 6.9 GB; librería `openpi`) |

## Arquitectura y entrenamiento

El checkpoint pertenece al ecosistema openpi y sigue el esquema de política viso-lenguaje-acción característico de esta familia, en el que un modelo de lenguaje (aquí congelado) procesa la observación y la instrucción, y un módulo "expert" genera las acciones motoras. La model card menciona explícitamente tres bloques de parámetros diferenciados a efectos de optimización: visión (multiplicador post-Adam 1.0), expert (0.3) y LLM (congelado). No se detalla el número de capas, dimensión oculta, número de cabezas de atención ni el mecanismo de fusión entre visión y lenguaje, por lo que esos datos quedan como no disponibles.

En cuanto al entrenamiento, el autor especifica 1000 actualizaciones con batch de 32 y semilla 42 (`raw999`), sobre datos de contacto denso preexistentes, sin modificar el grafo nativo ni la inicialización y normalización de origen. El único elemento que se varía respecto a la configuración de referencia son los multiplicadores de tasa de aprendizaje por módulo. No se indica el número de tokens o de trayectorias de entrenamiento, la composición del dataset LIBERO empleada, ni si hubo RLHF, DPO o cualquier otra etapa de alineación; tampoco se describe una innovación técnica propia más allá de la reconfiguración de tasas de aprendizaje. El autor subraya que los pesos congelados han sido verificados de forma independiente y que el entrenamiento se completó.

## Capacidades

- Control robótico de manipulación: el modelo está diseñado para producir acciones sobre tareas de la suite LIBERO.
- Aprendizaje por dinámica inversa (inverse dynamics): el objetivo etiquetado sugiere la predicción de acciones a partir de transiciones de estado.
- Procesamiento de observaciones visuales mediante la variante `view_medium` de la torre de visión.
- Uso del punto de vista de muñeca (wrist) de la fuente original durante la inferencia.
- Congelación selectiva de módulos: el LLM permanece fijo durante el ajuste, de modo que el entrenamiento solo afecta a visión y expert.
- No se documentan capacidades de generación de texto, código, matemáticas, tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo de pensamiento.
- Capacidades multilingües: no disponibles (los idiomas no están declarados en la ficha del repositorio).

## Casos de uso

- Reproducción de experimentos en robótica: investigadores que trabajen con openpi pueden cargar este checkpoint para verificar si la reconfiguración de multiplicadores de tasa de aprendizaje (1.0 visión / 0.3 expert / LLM congelado) reproduce el comportamiento esperado en LIBERO.
- Búsqueda de hiperparámetros como candidato de cribado: dado que el autor lo describe como candidato dentro de una búsqueda autorizada, sirve para seleccionar configuraciones previas al entrenamiento de mayor duración.
- Ajuste fino sobre tareas de manipulación de contacto denso: el modelo conserva los datos de contacto denso originales, por lo que es adecuado como punto de partida en manipulaciones que requieren contacto físico.
- Evaluación comparativa de estrategias de congelación: permite estudiar el efecto de mantener el LLM congelado frente a ajustarlo completo en una política VLA.
- Punto de partida para investigación en dinámica inversa: útil para quien quiera extender el objetivo de inverse dynamics a nuevas tareas o entornos.
- Auditoría de reproducibilidad: al incluir verificaciones independientes de pesos congelados y semilla fija, resulta apropiado para flujos de validación interna que exijan trazabilidad del entrenamiento.
- Base para experimentos de transferencia entre puntos de vista: al usar `view_medium` en entrenamiento y la muñeca de origen en inferencia, permite estudiar el impacto del cambio de cámara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la evaluación está pendiente y que no se reclama ninguna tasa de éxito (success rate). No se ofrecen cifras de LIBERO, MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada: no confirmada por el autor. Como referencia orientativa, el repositorio ocupa 6.9 GB, de modo que en precisión de 32 bits se necesitarían aproximadamente 14-21 GB solo para pesos y estados, y en 16 bits en torno a 7-10 GB; estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: no disponibles. Por tamaño de repositorio, el modelo podría caber en GPUs de gama alta de consumo (por ejemplo, RTX 4090/3090 con 24 GB) en precisión reducida, pero esto no está confirmado.
- Idoneidad en GPU de consumo: probable en tarjetas con 24 GB o más en 16 bits, no confirmado.
- Opciones de despliegue: la librería declarada es `openpi`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este checkpoint, por lo que la comparación se limita a características declaradas y queda en gran medida como no disponible.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (pi05-libero, inverse dynamics) | No disponible | No disponible | Sin evaluar (autor) | Apache 2.0 | Repositorio HF, 0 descargas |
| Familia pi05 de referencia | No disponible | No disponible | No disponible | No disponible | No disponible |
| Políticas VLA open source comparables (p. ej. OpenVLA) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de cifras verificables para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de evaluación: el autor afirma que la evaluación está pendiente y no reclama ninguna tasa de éxito, por lo que no existe evidencia de rendimiento.
- Checkpoint intermedio: es un candidato de una búsqueda de hiperparámetros, no un modelo final de producción.
- Repositorio sin tracción: 0 descargas y 0 "likes", sin comunidad que haya validado su funcionamiento.
- Sesgos conocidos: no disponibles; no se documenta ningún análisis de sesgo.
- Riesgo de alucinación: no aplicable en el sentido textual, pero al ser una política de acción existe riesgo de ejecutar acciones incorrectas en entornos físicos.
- Limitaciones de contexto e idioma: no declaradas; los idiomas figuran como no disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indiquen los cambios; no se identifican restricciones adicionales en la información disponible.
- Advertencias para producción: al tratarse de un artefacto de investigación sin métricas, no es recomendable desplegarlo en sistemas robóticos reales sin una evaluación exhaustiva previa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-main-module-lr-view-medium-v1-e0p3-1000-20261015
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
