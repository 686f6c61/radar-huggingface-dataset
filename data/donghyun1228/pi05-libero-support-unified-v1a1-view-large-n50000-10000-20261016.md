# Donghyun1228/pi05-libero-support-unified-v1a1-view-large-n50000-10000-20261016

## Resumen

Este repositorio contiene un checkpoint de política robótica entrenado sobre la librería openpi, identificado por el autor como una adaptación "unified LLM-frozen" del modelo pi05 (pi0.5) para el benchmark LIBERO. Lo publica el usuario Donghyun1228 y se apoya en un dataset propio de 300.000 waypoints aleatorios (`Donghyun1228/libero-support-random-waypoint-300k-20261015`). El entrenamiento continúa desde el update 5000 de un checkpoint fuente (`pi05-libero-support-probe-source-n50000-10000-20261015`) hasta 10.000 updates totales, congelando únicamente las hojas del LLM base.

El objetivo declarado es la adaptación por dinámica inversa (inverse dynamics model, IDM): el modelo debe predecir acciones de 7 dimensiones más control de pinza a partir de observaciones, con una función de pérdida que excluye explícitamente la coordenada 6 (pinza) y promedia las 31 coordenadas restantes ya rellenadas. Se trata, por tanto, de un artefacto de investigación orientado a experimentos controlados de congelado selectivo de capas y a la evaluación estandarizada en LIBERO, no de un modelo de propósito general.

La relevancia del checkpoint es acotada: no tiene descargas ni "likes", no incluye resultados más allá de una evaluación interna en LIBERO y no especifica arquitectura detallada, número de parámetros ni contexto en la model card. Su interés principal es la reproducibilidad: el autor documenta semillas, índices del sampler, estado de RNG, protocolo de servicio multi-cliente y versión de MuJoCo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la model card. Por la nomenclatura empleada (hojas "base-LLM" congeladas, "Vision23", "expert11", "action/time projections8") corresponde a una politica del ecosistema openpi con backbone vision-language y experto de acciones entrenable |
| Parametros totales | No disponible |
| Parametros activos | No aplica segun la informacion disponible; la model card no describe un esquema MoE de parametros activos, aunque menciona un componente "expert11" |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 para inferencia. No se documentan otros formatos cuantizados (GGUF, INT8, INT4) |
| Idiomas soportados | No disponible (modelo de control robotico; la model card no documenta idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | No disponible. Se distribuye como checkpoint raw no-EMA del step 9999 bajo la libreria openpi; el repositorio ocupa 7,7 GB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura completa. Los componentes entrenables son: el bloque de visión (referido como "Vision23"), el experto completo ("expert11") y las proyecciones de acción y tiempo ("action/time projections8"). Las nueve hojas del LLM base permanecen congeladas, de modo que la adaptación se produce únicamente en los módulos perceptivos y en las cabezas de acción. Todos los módulos entrenables usan el mismo multiplicador de actualización del optimizador AdamW nativo.

El entrenamiento se reanuda desde el update 5000 del checkpoint fuente conservando pesos raw exactos, estado del optimizador y EMA; se saltan los índices del sampler ya consumidos y se continúa el RNG nativo del modelo en función del step global. Hiperparámetros declarados: batch 32, semilla 42, learning rate 1e-5, warmup 500, 10.000 updates totales. El objetivo es de dinámica inversa (IDM): se excluye la coordenada 6 (pinza) de la pérdida sobre el target y se promedia el resto de las 31 coordenadas rellenadas, manteniendo entradas y salidas de 7 dimensiones más el control de pinza. Se preservan la normalización original y la muñeca de origen. El checkpoint publicado es el step 9999 sin EMA, para inferencia en BF16.

## Capacidades

- Predicción de acciones de manipulación robótica de 7 grados de libertad más control de pinza a partir de observaciones, siguiendo el objetivo de dinámica inversa con el que fue entrenado.
- Ejecución de tareas del benchmark LIBERO divididas en cuatro suites con 8 shards cada una.
- Servicio de inferencia concurrente: el autor valida el checkpoint con 32 clientes simultáneos y batch de servidor 16 sobre una única GPU física.
- Inferencia determinista y reproducible en BF16, con gestión explícita de índices del sampler y del RNG compartido entre peticiones.
- No hay evidencia en la model card de soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües, modo "thinking", visión general o audio.
- No se documentan capacidades de razonamiento en lenguaje natural: el backbone es un LLM congelado que actúa como componente interno, no como interfaz conversacional.

## Casos de uso

- Evaluación comparativa de políticas en LIBERO: el checkpoint está preparado para el protocolo de 40 tareas por 50 ensayos con envseed 7, de modo que sirve como punto de referencia reproducible frente a otros checkpoints de la misma serie.
- Investigación sobre congelado selectivo de capas: al dejar entrenables solo visión, experto y proyecciones de acción/tiempo, permite medir el impacto de no ajustar el LLM base y comparar contra el checkpoint fuente.
- Estudio de objetivos de dinámica inversa: la exclusión de la coordenada 6 del target IDM y el promedio de las 31 coordenadas restantes permiten analizar cómo afecta el diseño de la pérdida al rendimiento del control de pinza.
- Servicio de inferencia multiusuario en simulación: el protocolo `batched16_clients32_global_queue_v1` con cola global es directamente reutilizable para servir 32 clientes concurrentes con batch 16 en una sola GPU.
- Generación de trayectorias etiquetadas: combinado con el dataset de 300.000 waypoints aleatorios, puede usarse para producir pares observación-acción adicionales para entrenar otros modelos de dinámica inversa.
- Reproducción de experimentos y auditoría: la documentación de semilla, estado del optimizador, EMA e índices del sampler permite reconstruir el entrenamiento y auditar resultados paso a paso.
- Validación de infraestructura de simulación: la referencia a MuJoCo 3.2.3 con colocación EGL verificada por PCI/UUID y cero errores de rollout convierte el checkpoint en una prueba de integración útil para pipelines de evaluación robótica.

## Benchmarks y rendimiento

| Benchmark | Resultado | Configuracion |
|---|---|---|
| LIBERO (evaluacion interna del autor) | 1161 / 2000 rollouts con exito (58,05 %) | envseed 7, 40 tareas x 50 ensayos, 32 clientes, batch de servidor 16, protocolo `batched16_clients32_global_queue_v1`, MuJoCo 3.2.3, 0 errores de rollout |
| MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje | No aplica / no disponible | El modelo es una politica robotica, no un modelo de lenguaje evaluable en esos conjuntos |

No se han publicado en la informacion disponible mas resultados de benchmarks, comparaciones por suite, ni cifras de latencia o throughput mas alla de la configuracion de servicio descrita.

## Requisitos de hardware

- El autor ejecuta la evaluación completa con 32 clientes concurrentes sobre una única GPU física y batch de servidor 16, en inferencia BF16, pero no especifica modelo de GPU ni VRAM.
- El repositorio ocupa 7,7 GB, lo que da una cota superior orientativa del almacenamiento del checkpoint; no equivale al número de parámetros ni a la VRAM de inferencia.
- No se indican GPU recomendadas (A100, H100, RTX 4090 u otras) ni si el checkpoint cabe en GPU de consumo.
- Despliegue: la librería declarada es openpi. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que además no son aplicables a una política robótica de este tipo.
- Entorno de simulación: MuJoCo 3.2.3 con renderizado EGL y colocación PCI/UUID verificada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`pi05-libero-support-unified-v1a1-view-large-n50000-10000-20261016`) | No disponible | No disponible | 1161/2000 en LIBERO (58,05 %), protocolo interno | apache-2.0 | HuggingFace, 0 descargas, 7,7 GB |
| `pi05-libero-support-probe-source-n50000-10000-20261015` (checkpoint fuente del mismo autor) | No disponible | No disponible | No disponible en la informacion proporcionada | No disponible | HuggingFace |
| Otros checkpoints de politica robotica de la misma categoria (pi0.5 base, OpenVLA, GR00T N1, etc.) | No disponible | No disponible | No disponible en la informacion proporcionada | No disponible | No disponible |

No hay datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas de terceros. La única comparación documentada es contra el checkpoint fuente del propio autor, y tampoco se aportan sus métricas.

## Limitaciones y advertencias

- Evaluación única: 2000 rollouts en LIBERO con una sola semilla de entorno (envseed 7). El autor indica explícitamente que las comparaciones de checkpoints son predefinidas y que no hay early stopping ni omisión basada en política, lo que reduce el riesgo de selección pero no elimina la varianza de una única configuración.
- Checkpoint raw no EMA (step 9999): no se publica la versión con media móvil exponencial, que suele ser más estable en inferencia.
- La coordenada 6 (pinza) queda excluida de la pérdida IDM; el control de pinza se mantiene en la interfaz, pero su calidad no está optimizada por el objetivo de entrenamiento declarado.
- Reproducibilidad condicionada: los cambios numéricos por forma de batch y la asignación de RNG compartida dependiente de la petición forman parte del protocolo registrado, por lo que los resultados pueden variar fuera de esa configuración exacta de servicio.
- Sin validación externa: 0 descargas y 0 likes en el momento de la consulta; no hay revisión por pares ni resultados replicados por terceros.
- Ámbito restringido: es una política de manipulación para LIBERO y simulación MuJoCo; no se documenta transferencia a robots reales ni a otros entornos.
- Sesgos y comportamiento fuera de distribución: no disponibles; la model card no reporta análisis de sesgo, robustez ni fallos cualitativos.
- Idiomas y contexto: no documentados. No debe asumirse ninguna capacidad de procesamiento de lenguaje natural más allá del uso interno del backbone congelado.
- Licencia apache-2.0, que permite uso comercial del checkpoint, pero conviene verificar las licencias del modelo base, del dataset y de MuJoCo antes de un despliegue comercial.
- Fechas y metadatos del repositorio (creación el 2026-10-16) resultan anómalas respecto a la fecha actual; conviene confirmar la vigencia de los artefactos antes de reutilizarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-support-unified-v1a1-view-large-n50000-10000-20261016
- Checkpoint fuente citado en la model card: `Donghyun1228/pi05-libero-support-probe-source-n50000-10000-20261015` (commit `ea4f0bb2001e12d701af8a294f91da437e857f55`), disponible en https://huggingface.co/Donghyun1228/pi05-libero-support-probe-source-n50000-10000-20261015
- Dataset de entrenamiento citado: `Donghyun1228/libero-support-random-waypoint-300k-20261015` (commit `32ed215baf01af7e82f927a62b108873aa70bd19`), disponible en https://huggingface.co/datasets/Donghyun1228/libero-support-random-waypoint-300k-20261015
- La busqueda web realizada no devolvio ningun resultado relacionado con este modelo; los enlaces obtenidos no guardan relacion con el contenido de la ficha y se han descartado.
