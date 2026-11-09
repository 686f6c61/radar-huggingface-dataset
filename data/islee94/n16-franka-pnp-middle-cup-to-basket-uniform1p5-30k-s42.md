# islee94/n16-franka-pnp-middle-cup-to-basket-uniform1p5-30k-s42

## Resumen

El modelo `n16-franka-pnp-middle-cup-to-basket-uniform1p5-30k-s42` es un checkpoint de ajuste fino de GR00T N1.6, la familia de modelos fundacionales de visión-lenguaje-acción (VLA) de NVIDIA Research orientada a robótica humanoide y manipulación. Lo publica el usuario islee94 en Hugging Face como artefacto de investigación: un fine-tune entrenado sobre datos reales de un brazo Franka para la tarea `pnp_middle_cup_to_basket` (recoger una taza del centro y depositarla en una cesta), con datos retemporizados bajo la variante "Uniform 1.5".

El checkpoint corresponde a 30.000 actualizaciones de entrenamiento distribuidas en 4 GPU A100 (4 x 16 de lote), con semilla 42, partiendo de la revisión `179b98b` de gr00tn16. El repositorio contiene únicamente los ficheros de inferencia (pesos en safetensors, configuraciones, estadísticas de normalización y metadatos del pipeline de entrenamiento), sin estado del optimizador, y ocupa 6,6 GB. Tiene 3.286.608.832 parámetros según los tensores publicados.

Su relevancia es acotada pero clara: es un ejemplo reproducible de cómo se especializa un modelo VLA generalista en una política de manipulación concreta sobre hardware real, útil para quien investigue transferencia de modelos fundacionales a tareas de robot, retemporización de datos y evaluación de políticas end-to-end. No es un modelo de propósito general ni está pensado para uso conversacional o de generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.6 (modelo fundacional visión-lenguaje-acción, base de NVIDIA Research; detalles internos de capas no disponibles en la información proporcionada) |
| Parametros totales | 3.286.608.832 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (las instrucciones de tarea son en inglés por convención del dataset; no se documenta cobertura multilingüe) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model-00001-of-00002.safetensors`, `model-00002-of-00002.safetensors`), con `model.safetensors.index.json`, `processor_config.json` y `experiment_cfg/` |

## Arquitectura y entrenamiento

El checkpoint deriva de GR00T N1.6, un modelo VLA que combina un codificador visual, un componente de lenguaje y un decodificador de acciones para producir comandos motores a partir de observaciones e instrucciones en lenguaje natural. La model card no detalla la topología interna (número de capas, dimensión oculta, mecanismo de atención ni si emplea mezcla de expertos), por lo que esos datos deben considerarse no disponibles. Los 3,29 mil millones de parámetros y los dos shards safetensors (4,99 GB y 1,58 GB) son los únicos datos estructurales verificables.

El entrenamiento se realizó sobre datos reales del robot Franka para la tarea `pnp_middle_cup_to_basket`, retemporizados con la variante "Uniform 1.5" (fichero `raven/uniform_1p5.json`). Se ejecutaron 30.000 actualizaciones en 4 A100 con lote efectivo 4 x 16 y semilla 42, partiendo de la revisión `179b98b` de gr00tn16. El repositorio incluye `raven/pacedistill_manifest.json`, lo que sugiere un pipeline de destilación o regularización temporal ("pace distill") durante el ajuste, aunque su contenido funcional no se describe en la model card. No se documentan número de tokens, composición del dataset, ni si hubo RLHF o DPO; en el contexto VLA estos términos se sustituyen habitualmente por aprendizaje por imitación sobre demostraciones, extremo que la información disponible no confirma explícitamente.

## Capacidades

- Control de manipulación robótica end-to-end: genera acciones motrices para un brazo Franka a partir de observaciones visuales e instrucciones de tarea.
- Ejecución de una política especializada en `pnp_middle_cup_to_basket` (pick-and-place de una taza a una cesta), entrenada sobre demostraciones reales.
- Procesamiento multimodal visión-lenguaje-acción heredado de la base GR00T N1.6.
- Integración con el ecosistema de entrenamiento e inferencia de GR00T N1.6 (configuraciones `experiment_cfg/`, estadísticas de normalización y `embodiment_id.json` para el embodiment Franka).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo produce políticas de acción, no razonamiento simbólico).
- Capacidades multilingües: no disponibles.
- Modo "thinking", visión general, audio o generación de texto libre: no disponibles.

## Casos de uso

- Reproducción de experimentos de manipulación: cargar el checkpoint con la revisión `179b98b` de gr00tn16 y el `embodiment_id.json` incluido para replicar la política `pnp_middle_cup_to_basket` sobre un Franka real y comparar con la evaluación pendiente del autor.
- Estudio de retemporización de datos: usar `raven/uniform_1p5.json` y `experiment_cfg/dataset_statistics.json` para analizar cómo el reescalado temporal "Uniform 1.5" afecta a la política aprendida frente a datos sin retemporizar.
- Punto de partida para nuevos fine-tunes: inicializar el ajuste de otra tarea de pick-and-place sobre Franka a partir de este checkpoint de 30k actualizaciones, aprovechando que se publican solo pesos de inferencia y configuraciones completas.
- Evaluación de robustez de políticas VLA: ejecutar el modelo en variaciones de posición de la taza y de la cesta para medir degradación, dado que el entrenamiento usó una única tarea y una única semilla.
- Docencia y divulgación: ilustrar el flujo completo de un fine-tune VLA (dataset real, retemporización, configuración de entrenamiento distribuido, artefactos de inferencia) con un repositorio pequeño y autocontenido de 6,6 GB.
- Comparación de semillas y duraciones de entrenamiento: emparejar este checkpoint (semilla 42, 30k pasos) con otros runs del mismo autor para estudiar varianza entre semillas y curvas de convergencia.
- Integración en pipelines de simulación a real: usar las estadísticas de normalización publicadas para validar que las observaciones del simulador caen en el mismo rango que las de entrenamiento antes de desplegar en hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente "robot evaluation pending", por lo que no existen métricas de éxito de la tarea, tasas de agarre ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,29 mil millones de parámetros en precisión completa (fp32) se requieren aproximadamente 13,1 GB solo para pesos; en bf16/fp16, unos 6,6 GB, más el estado del codificador visual y los búferes de activación.
- GPU recomendadas: el entrenamiento se realizó en 4 x A100; para inferencia una A100 o H100 ofrece margen holgado, y una RTX 4090 (24 GB) debería bastar en bf16 para los pesos, aunque el pipeline completo de GR00T N1.6 puede añadir requisitos adicionales no documentados.
- Cabe en GPU de consumo: previsiblemente sí en RTX 4090 y RTX 3090 (24 GB) en bf16; en tarjetas de 16 GB el margen es ajustado y no está verificado en la información disponible.
- Opciones de despliegue: el repositorio no documenta vLLM, llama.cpp, Ollama ni TGI; el despliegue esperado es mediante el stack de inferencia de GR00T N1.6 con los ficheros `experiment_cfg/` y `processor_config.json` incluidos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| n16-franka-pnp-middle-cup-to-basket-uniform1p5-30k-s42 | 3,29 B | no disponible | Pick-and-place Franka especializado | no disponible | Hugging Face, 0 descargas |
| GR00T N1.6 base (revisión 179b98b) | no disponible en la información proporcionada | no disponible | Modelo VLA fundacional multi-embodiment | no disponible | Referenciado como checkpoint de origen |
| Otros fine-tunes del mismo autor (islee94) | no disponible | no disponible | Variantes de tareas Franka | no disponible | No verificados en la información proporcionada |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas como OpenVLA, π0 o RT-2; esos datos no aparecen en la información proporcionada y no deben inferirse.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea (`pnp_middle_cup_to_basket`) y un único embodiment (Franka); no generaliza a otras tareas ni robots sin nuevo ajuste.
- Evaluación pendiente: el autor declara explícitamente que la evaluación en robot real no se ha completado, por lo que no hay evidencia publicada de tasa de éxito.
- Una sola semilla: el run usa semilla 42 y no se publican réplicas, de modo que se desconoce la varianza del resultado.
- Licencia no especificada: la ausencia de licencia impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier despliegue productivo.
- Idiomas y contexto no documentados: no hay información sobre cobertura lingüística ni longitud de contexto, lo que limita su uso fuera del pipeline previsto.
- Riesgo de sobreajuste al entorno de captura: al entrenarse con datos reales de una configuración concreta de cámara, iluminación y mesa, es probable la degradación ante cambios de dominio; no se documentan técnicas de aumento o robustez.
- Sin estado del optimizador: al publicarse solo ficheros de inferencia, no es posible reanudar el entrenamiento exactamente desde este checkpoint, solo inicializar uno nuevo.
- Artefacto de investigación: 0 descargas y 0 likes en el momento de la ficha; no hay validación comunitaria ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/islee94/n16-franka-pnp-middle-cup-to-basket-uniform1p5-30k-s42
- GR00T N1.6 (repositorio de referencia citado en la model card, revisión `179b98b`): no disponible como enlace directo en la información proporcionada
- Paper de GR00T N1: no disponible en la información proporcionada
- Blog o demo oficial: no disponible en la información proporcionada
- Repositorio de código de inferencia: no disponible en la información proporcionada
