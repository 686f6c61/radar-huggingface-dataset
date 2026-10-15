# Donghyun1228/pi05-libero-main-module-lr-yaw20-v1-e30-1000-20261015

## Resumen

Este repositorio contiene un checkpoint de investigación del modelo `pi05` (π0.5) entrenado sobre el benchmark de robótica LIBERO, publicado por el usuario Donghyun1228 bajo la librería openpi. Se trata de una variante de "main-method module LR candidate", es decir, una candidata dentro de una búsqueda de hiperparámetros explícitamente autorizada, en la que solo se modificaron los multiplicadores de tasa de aprendizaje de distintos módulos respecto al ajuste original.

La configuración concreta documentada es: variante `yaw20`, multiplicador post-Adam de la torre de visión de 1.0, multiplicador del experto de 30.0 y LLM congelado, sobre datos de contacto denso preexistentes y con inicialización y normalización nativas. El entrenamiento se realizó con 1000 actualizaciones, batch de 32 y semilla 42, partiendo del preajuste original y manteniendo el grafo nativo sin cambios.

Es relevante ahora porque forma parte del ecosistema abierto openpi (Physical Intelligence) para modelos visión-lenguaje-acción (VLA) aplicados a manipulación robótica, y porque la propia model card indica que la evaluación está pendiente y no se reclama ninguna tasa de éxito. Es, por tanto, un artefacto de investigación reproducible más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de openpi; el identificador `pi05` sugiere una variante VLA π0.5) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repositorio de 7,7 GB gestionado mediante la libreria `openpi`) |

Nota: la model card no detalla número de parámetros, contexto, cuantizaciones ni formato de pesos. El tamaño del repositorio (7,7 GB) es el único indicador dimensional disponible y no permite inferir con certeza el número de parámetros.

## Arquitectura y entrenamiento

El modelo pertenece a la familia de políticas visión-lenguaje-acción (VLA) del ecosistema openpi, y según la nomenclatura del repositorio corresponde a una variante π0.5 (`pi05`) adaptada a la tarea LIBERO. El checkpoint etiquetado como "inverse-dynamics" apunta a un entrenamiento con objetivos de dinámica inversa. La model card describe una arquitectura de grafo "nativo" sin cambios, con inicialización de origen y normalización originales, y datos de contacto denso preexistentes.

El detalle de entrenamiento indicado es explícito: 1000 actualizaciones de optimización, batch de 32 y semilla 42, partiendo del preajuste ("pre-adapt") original. La única modificación respecto a ese preajuste son los multiplicadores de tasa de aprendizaje por módulo tras el optimizador Adam: valor 1.0 para la torre de visión y valor 30.0 para el experto, manteniendo el LLM congelado. Se indica que los pesos congelados fueron verificados de forma independiente y que el checkpoint final está completo. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de acciones de manipulación robótica en el entorno del benchmark LIBERO.
- Procesamiento conjunto de entradas visuales y de instrucciones de tarea (paradigma VLA), según la librería openpi y la etiqueta `inverse-dynamics`.
- Uso de `yaw20` y de la muñeca de la fuente original en inferencia (según model card).
- No se documentan capacidades de generación de texto general, razonamiento, código, matemáticas, visión de propósito general, audio ni tool calling.
- Soporte de agentes, function calling y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Reproducción de experimentos de ajuste fino en robótica: sirve como checkpoint de partida para replicar la búsqueda de hiperparámetros descrita (multiplicadores de LR por módulo) dentro del ecosistema openpi.
- Evaluación comparativa en LIBERO: al ser un candidato de una búsqueda de hiperparámetros, puede emplearse para medir el efecto del multiplicador del experto (30.0) frente a otras configuraciones de la misma campaña.
- Estudio de dinámica inversa en políticas VLA: el etiquetado `inverse-dynamics` permite usarlo para analizar cómo afecta este objetivo a la política resultante frente a variantes sin él.
- Análisis de congelación selectiva de módulos: al mantener el LLM congelado y solo ajustar visión y experto, es útil para estudiar el impacto de congelar el backbone lingüístico en tareas de manipulación.
- Punto de partida para nuevos ajustes: dado que conserva el grafo nativo, la inicialización y la normalización de origen, puede reutilizarse como base de experimentos posteriores sin rehacer el pipeline.
- Verificación de reproducibilidad: la semilla fija (42), el batch (32) y el número de pasos (1000) documentados permiten auditar la reproducibilidad de un entrenamiento concreto.
- Docencia e investigación en robótica: como material para ilustrar el flujo de trabajo openpi y el ajuste de políticas VLA sobre benchmarks de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que la evaluación está pendiente y que no se reclama ninguna tasa de éxito ("no success rate is claimed").

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explícita. El repositorio ocupa 7,7 GB, lo que da una cota inferior orientativa del espacio en disco, pero no de la VRAM necesaria durante la inferencia.
- GPU recomendadas: no disponible. Al tratarse de un modelo de robótica de tipo VLA del ecosistema openpi, cabe esperar despliegue en GPU de gama profesional, pero no se detalla ninguna en la información proporcionada.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: la librería indicada es `openpi`. No se documentan exportaciones a GGUF, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos verificados de este checkpoint ni de las alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible. Cualitativamente, los modelos de referencia de la misma categoría (políticas VLA para manipulación) serían π0/π0.5 de Physical Intelligence (base del ecosistema openpi), OpenVLA y RDT-1B, pero no se han facilitado sus parámetros, contexto, licencia ni resultados para una tabla fiable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pi05-libero-main-module-lr-yaw20-v1-e30-1000 | no disponible | no disponible | apache-2.0 | HuggingFace (0 descargas) |
| π0.5 / openpi | no disponible | no disponible | no disponible | no disponible |
| OpenVLA | no disponible | no disponible | no disponible | no disponible |
| RDT-1B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Evaluación pendiente: no hay tasa de éxito ni métrica de rendimiento publicada; no debe asumirse ningún nivel de desempeño.
- Es un candidato de búsqueda de hiperparámetros, no un modelo final validado; puede quedar superado ("screening success can select later candidates").
- Específico del dominio: orientado a manipulación robótica y al benchmark LIBERO; no es un modelo de propósito general.
- Riesgo de sobreajuste a la distribución de datos de contacto denso utilizada; la model card menciona datos "existentes" sin detallar su cobertura.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la publicación, lo que implica ausencia de verificación externa más allá de la comprobación de pesos congelados declarada por el autor.
- Licencia apache-2.0: permite uso comercial según los términos de dicha licencia, pero conviene verificar las licencias de los componentes base del ecosistema openpi/π0.5 antes de un uso comercial.
- No se documentan sesgos, comportamiento multilingüe ni límites de contexto; no disponible.
- Idoneidad para producción: no acreditada; se recomienda tratarlo como artefacto de investigación.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-main-module-lr-yaw20-v1-e30-1000-20261015
- No se han encontrado otros enlaces relevantes (papers, blogs, repos o demos) en los resultados de búsqueda disponibles.
