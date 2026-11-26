# HITzyx/harness-vla-pi05-real-blocks

## Resumen

Harness VLA es un conjunto de checkpoints de un modelo vision-lenguaje-accion (VLA) construido sobre la base pi0.5 y entrenado por el usuario HITzyx para una tarea concreta de manipulacion robotica real: levantar tres vasos para descubrir que bloque numerado se esconde debajo y colocar en un plato el bloque cuyo numero coincide con el recuento. La particularidad tecnica es que el modelo incorpora un "libro de memoria" textual (denominado "scheme C") en el que escribe el recuento, ya que los bloques vuelven a quedar ocultos al recolocar cada vaso y la informacion no puede sostenerse solo con la observacion visual.

El entrenamiento parte de los pesos base de pi0.5 y se realizo sobre 41 demostraciones reales de una unica tarea, con 24.305 fotogramas de entrenamiento, 30.000 pasos de optimizador previstos, batch global de 128 (4 dispositivos x 32) y tasa de aprendizaje de 2,5e-5. El modelo controla unicamente el brazo derecho mediante objetivos articulares absolutos de 7 dimensiones y actualiza la memoria cada 20 pasos de control.

Es relevante ahora como ejemplo temprano de VLA con memoria externa explicita para tareas de largo horizonte con estado parcialmente observable, pero conviene subrayar que el propio autor advierte que ninguno de los checkpoints ha sido evaluado en un robot real ni validado de ninguna otra forma. Se trata, por tanto, de material de investigacion en bruto, no de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en pi0.5, con libro de memoria textual ("scheme C") |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen parametros de inferencia completos en `params/`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Parametros de inferencia completos en `params/` (formato no detallado); incluye `tokenizer.model`, `norm_stats.json`, `metadata.json` |

## Arquitectura y entrenamiento

El modelo es un VLA derivado de pi0.5 que combina percepcion visual, instruccion en lenguaje y generacion de acciones motoras. Sobre esa base se anade un mecanismo de memoria en texto ("scheme C"): el modelo mantiene un registro escrito que actualiza cada 20 pasos de control, de modo que el recuento de bloques descubiertos persiste aunque los vasos vuelvan a ocultarlos. La accion se emite como objetivos articulares absolutos de 7 dimensiones para el brazo derecho, con 6 entidades rastreadas (tres vasos y tres bloques numerados).

El entrenamiento parte de los pesos base de pi0.5 y se ejecuto durante 30.000 pasos de optimizador con batch global de 128 repartido en 4 dispositivos (32 por dispositivo) y tasa de aprendizaje de 2,5e-5, sobre 24.305 fotogramas procedentes de 41 demostraciones reales de una sola tarea. Se publican tres checkpoints (10.000, 20.000 y 30.000 pasos) con perdidas de entrenamiento de 0,0052, 0,0024 y 0,0029 respectivamente. No se menciona uso de RLHF, DPO ni tecnicas de decodificacion especulativa. El estado del optimizador (`train_state/`) no se incluye: los checkpoints son solo para inferencia, no para reanudar el entrenamiento.

## Capacidades

- Control robotico de manipulacion: genera trayectorias de brazo derecho (7 dimensiones, objetivos articulares absolutos) para levantar vasos y colocar bloques.
- Memoria textual persistente: escribe y consulta un registro de recuento que sobrevive a la oclusion visual de los objetos.
- Razonamiento de estado parcialmente observable: resuelve una tarea en la que la informacion clave desaparece de la escena y debe transportarse en texto.
- Percepcion visual de entidades: rastrea tres vasos y tres bloques numerados (0, 1, 2).
- Condicionamiento por instruccion en lenguaje (heredado de la base pi0.5).
- No se documentan capacidades de tool calling, agentes genericos, vision general, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigacion en VLA con memoria externa: servir de punto de partida reproducible para estudiar como un registro textual mejora tareas de largo horizonte con oclusion, comparando los tres checkpoints publicados.
- Benchmark de tareas de recuento con estado oculto: utilizar la tarea de vasos y bloques como entorno controlado para medir si la memoria escrita compensa la perdida de informacion visual.
- Reproduccion de experimentos de pi0.5: los checkpoints incluyen el codigo fuente (`policy.py`, codigo de datos) y las estadisticas de normalizacion, lo que facilita replicar el pipeline de inferencia.
- Estudio de escalado de pasos de entrenamiento: la publicacion de checkpoints en 10.000, 20.000 y 30.000 pasos permite analizar la evolucion de la perdida y del comportamiento.
- Base para fine-tuning en tareas de ensamblaje con multiples objetos: el esquema de 6 entidades rastreadas y memoria actualizable es adaptable a otros escenarios de picking y colocacion.
- Docencia y divulgacion tecnica: ejemplo concreto y acotado de integracion de memoria textual en un modelo de accion, con artefactos de integridad (`COMPLETE.json`, `reload_proof.json`) que ilustran buenas practicas de trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que ninguno de los checkpoints ha sido evaluado en un robot real ni validado de otro modo; las unicas cifras aportadas son perdidas de entrenamiento.

| Checkpoint | Pasos de optimizador | Perdida de entrenamiento | Subida |
|---|---|---|---|
| `checkpoint_010000/` | 10.000 | 0,0052 | 2026-11-25 12:31 |
| `checkpoint_020000/` | 20.000 | 0,0024 | 2026-11-26 01:45 |
| `checkpoint_030000/` | 30.000 | 0,0029 | 2026-11-26 14:39 |

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 37,3 GB e incluye tres checkpoints completos con parametros de inferencia; el peso por checkpoint no se detalla.
- GPU recomendadas: no disponible. El entrenamiento se realizo en 4 dispositivos con batch 32 por dispositivo, lo que sugiere GPUs de clase servidor (A100/H100 o similar), pero no se especifica el modelo.
- Cabe en GPU de consumo: no confirmado; dado el tamano del repositorio y la base pi0.5, es previsible que requiera GPUs de gama alta, pero no hay dato oficial.
- Opciones de despliegue: carga mediante `policy.py` del directorio `source/` sobre un checkout de openpi (campo `openpi_root` en `metadata.json`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Requisito adicional de despliegue: se necesita el mismo rastreador de objetos y la misma superposicion de trayectoria ("trajectory overlay") que produjeron las imagenes de entrenamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Memoria externa | Evaluacion real | Licencia |
|---|---|---|---|---|---|
| Harness VLA (este) | no disponible | no disponible | Si (libro textual) | No realizada | no disponible |
| pi0.5 (base) | no disponible en la informacion | no disponible | No documentada | No disponible | no disponible |
| Otros VLA open source | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ningun checkpoint ha sido evaluado en un robot real ni validado de ninguna forma; las perdidas bajas de entrenamiento no garantizan exito en ejecucion.
- Los datos cubren una unica tarea y solo 41 demostraciones, con tres configuraciones fijas de bloques ocultos (vaso lejano y central, solo vaso lejano, ninguno): baja diversidad y riesgo alto de sobreajuste al escenario.
- Solo se controla el brazo derecho; no hay manipulacion bimanual.
- El despliegue exige replicar exactamente el rastreador de objetos y la superposicion de trayectoria del entrenamiento; cualquier desviacion invalida la inferencia.
- La carga requiere editar `metadata.json` (`openpi_root`) y recalcular el SHA-256 en `COMPLETE.json`, un paso propenso a errores.
- No se incluye el estado del optimizador: no es posible reanudar el entrenamiento desde estos checkpoints.
- Licencia no declarada: no hay autorizacion explicita para uso comercial ni para redistribucion; debe tratarse como no apto para produccion hasta aclararlo con el autor.
- Idiomas y sesgos: sin informacion; al derivar de pi0.5 y entrenarse con un dataset minimo, se desconocen los sesgos heredados.
- Riesgo de alucinacion en el libro de memoria: el modelo podria escribir recuentos incorrectos sin mecanismo de verificacion documentado.
- Repositorio de 37,3 GB con tres copias completas: coste de almacenamiento y descarga elevado para experimentacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HITzyx/harness-vla-pi05-real-blocks
- Repositorio openpi (requerido para cargar los checkpoints, referenciado en `metadata.json`): no se proporciona URL en la informacion disponible.
- Paper, blog o demo del autor: no disponibles en la informacion proporcionada.
