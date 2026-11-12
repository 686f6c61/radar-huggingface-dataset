# Microguy1/flowhmr-0.46B-DUPLI

## Resumen

FlowHMR es un framework para recuperar movimiento humano 3D global fisicamente plausible a partir de video monoculo. Lo desarrolla el equipo del proyecto FlowHMR (repositorio en GitHub `flowhmr/flowhmr`), y el checkpoint publicado en Hugging Face bajo el identificador `Microguy1/flowhmr-0.46B-DUPLI` corresponde a un modelo de aproximadamente 0,46 mil millones de parametros. El problema que aborda es la ambiguedad intrinseca de profundidad en la regresion directa de movimiento desde un solo punto de vista: los metodos anteriores colapsan hacia soluciones promediadas y producen trayectorias que un controlador fisico no puede seguir.

La innovacion central consiste en reformular el motion capture como un problema de generacion de movimiento condicionada por video, mediante un modelo de flow matching preentrenado. Sobre esa base, los autores aplican un post-entrenamiento con Group Relative Policy Optimization (GRPO) y dos recompensas: una de fidelidad al video y otra de trazabilidad fisica por un controlador basado en fisica. El resultado, segun el abstract, alcanza una tasa de exito de seguimiento fisico del 82,47 % frente al 62,82 % del mejor baseline, GVHMR, sobre el nuevo dataset Wild-4K.

El modelo es relevante ahora porque combina generacion probabilistica (flow matching) con optimizacion por refuerzo para imponer plausibilidad fisica, un patron que esta migrando desde los modelos de lenguaje hacia la vision y el analisis de movimiento. No obstante, la ficha debe leerse con cautela: la informacion disponible es escasa en cuanto a arquitectura detallada, datos de entrenamiento y benchmarks estandar, y el checkpoint tiene cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching condicionado por video (detalles internos del backbone no disponibles) |
| Parametros totales | ~0,46 B (segun el identificador del repositorio) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision/movimiento, no linguistico) |
| Licencia | FlowHMR Model Weights License (solo uso no comercial: educativo, investigacion y sin animo de lucro) |
| Formato de pesos | no disponible (tamano del repo: 3,7 GB) |

## Arquitectura y entrenamiento

El modelo se basa en flow matching, una familia de modelos generativos de difusion continua que aprenden un campo de velocidades para transportar ruido hacia la distribucion de datos. En este caso, la generacion esta condicionada por el video de entrada y produce candidatos de movimiento 3D global. El preentrenamiento se realiza para esta tarea de generacion condicionada, lo que permite obtener diversidad de hipotesis de movimiento en lugar de una unica regresion promediada.

La fase de post-entrenamiento emplea GRPO con dos recompensas. La recompensa de fidelidad mide la consistencia del movimiento generado con el video de entrada; la recompensa de tracking evalua si un controlador fisico puede seguir la trayectoria generada con exito. La combinacion de ambas desplaza la preferencia del modelo hacia movimientos fieles y fisicamente realizables. El articulo asociado es arXiv:2610.03691. No se dispone de informacion sobre el numero de tokens o clips de entrenamiento, la composicion del dataset de preentrenamiento ni detalles del backbone (numero de capas, dimensiones, mecanismo de atencion).

## Capacidades

- Reconstruccion de movimiento humano 3D global (trayectoria en el mundo, no solo pose relativa) a partir de video monoculo.
- Generacion de multiples candidatos de movimiento dada una misma entrada de video, gracias a la naturaleza estocastica del flow matching.
- Produccion de movimientos disenados para ser trazables por un controlador fisico, con una tasa de exito reportada del 82,47 % en Wild-4K.
- Evaluacion de fidelidad al video mediante la recompensa entrenada, lo que implica capacidad de medir consistencia video-movimiento.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni soporte multilingue; es un modelo especializado en captura de movimiento.

## Casos de uso

- Captura de movimiento para animacion y videojuegos: a partir de un video monoculo de un actor, el modelo genera trayectorias 3D globales que pueden retargetearse a un rig; la plausibilidad fisica reduce el trabajo manual de limpieza de curvas.
- Analisis biomecanico en investigacion: reconstruccion de movimiento en entornos no controlados (Wild-4K) para estudios de marcha, equilibrio o rehabilitacion, donde la fidelidad al video y la coherencia fisica son criticas.
- Entrenamiento de agentes fisicos simulados: las trayectorias generadas sirven como referencias para controladores en simuladores de robotica humanoide, ya que el modelo se optimiza explicitamente para que un controlador pueda seguirlas.
- Supervision de animacion por IA en produccion audiovisual: generacion de propuestas de movimiento para previsualizacion (previz) a partir de material rodado, con seleccion entre multiples candidatos generados.
- Evaluacion de pipelines de motion capture: uso del modelo y del dataset Wild-4K como referencia para comparar metodos de recuperacion de movimiento en condiciones reales.
- Investigacion en RL aplicado a generacion: el esquema GRPO con recompensas de fidelidad y tracking sirve como plantilla reproducible para otros dominios generativos donde se requiere imponer restricciones fisicas.
- Docencia y prototipado no comercial: al ser una licencia de solo uso educativo e investigacion, encaja en laboratorios universitarios que necesiten un baseline de captura de movimiento sin coste de licencia.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los del abstract, referidos al dataset Wild-4K:

| Metrica | FlowHMR | GVHMR (mejor baseline) |
|---|---|---|
| Tasa de exito de seguimiento fisico | 82,47 % | 62,82 % |
| Fidelidad de movimiento global | superior al estado del arte (sin cifra concreta) | no disponible |

No se han publicado resultados de benchmarks adicionales (MPJPE, PA-MPJPE, MMLU, HumanEval u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con ~0,46 B de parametros, en precision FP16 el peso ronda 0,9 GB, y el repositorio ocupa 3,7 GB, lo que sugiere pesos en varios formatos o precisiones.
- GPU recomendadas: no disponibles. Por tamano, el modelo es compatible con GPUs de consumo, pero no hay confirmacion oficial.
- Cabe en GPU de consumo: probablemente si, dado el tamano, aunque no se documenta.
- Opciones de despliegue: no disponibles (no se mencionan vLLM, llama.cpp, Ollama ni TGI; al ser un modelo de vision/movimiento, el despliegue requeriria el codigo del repositorio `flowhmr/flowhmr`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en tracking fisico (Wild-4K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FlowHMR (este) | ~0,46 B | no disponible | 82,47 % | FlowHMR Model Weights License (no comercial) | Hugging Face (0 descargas) |
| GVHMR | no disponible | no disponible | 62,82 % | no disponible | no disponible |
| Otros metodos de HMR | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a GVHMR, el unico baseline citado con cifra concreta en la informacion proporcionada. No se dispone de datos de parametros, contexto ni licencia de los alternativas.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos solo permiten uso no comercial, educativo, de investigacion y sin animo de lucro; cualquier uso comercial requiere contacto con el autor (zhankewang0@gmail.com).
- La licencia cubre solo los pesos; el codigo, los modelos preentrenados de terceros, los assets del body-model y los datasets tienen licencias separadas.
- El checkpoint tiene cero descargas y cero likes, y fue creado y actualizado el mismo dia (2026-11-12), lo que indica ausencia de validacion por la comunidad.
- El sufijo `DUPLI` en el identificador sugiere un duplicado o una publicacion secundaria; el enlace de licencia de la model card apunta a otro repositorio (`fafsaf1/flowhmr-0.46B`), lo que genera dudas sobre la procedencia y el mantenimiento del checkpoint.
- Riesgo de alucinacion entendido como generacion de movimientos no fieles al video: el propio articulo reconoce que no todos los candidatos generados son fieles ni trazables, de ahi la necesidad de post-entrenamiento con recompensas.
- Ambiguedad de profundidad inherente a la entrada monoculo: el modelo mitiga pero no elimina la incertidumbre en la reconstruccion global.
- No hay informacion sobre sesgos demograficos, etnicos o de genero en el dataset de entrenamiento ni en Wild-4K.
- No se documentan limitaciones de contexto ni de idioma porque el modelo no procesa lenguaje.
- Para produccion, la falta de especificaciones de arquitectura, cuantizacion y despliegue hace imprescindible revisar el codigo y el paper antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Microguy1/flowhmr-0.46B-DUPLI
- Paper: https://arxiv.org/abs/2610.03691
- Codigo: https://github.com/flowhmr/flowhmr
- Pagina del proyecto: https://flowhmr.github.io/
- Licencia (referenciada en la model card): https://huggingface.co/fafsaf1/flowhmr-0.46B/blob/main/LICENSE
