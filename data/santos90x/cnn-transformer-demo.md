# santos90x/cnn-transformer-demo

## Resumen

`cnn-transformer-demo` es un repositorio experimental publicado por el usuario santos90x que contiene una implementacion propia en PyTorch de una arquitectura hibrida CNN-Transformer orientada a tareas de clasificacion. El propio autor la describe como una configuracion "nano", pensada para revision de codigo, pruebas de humo (*smoke tests*) y experimentos controlados de pequeno tamano, y no como un modelo preentrenado listo para produccion. El checkpoint incluido (`model.safetensors`) es una inicializacion valida, no un modelo entrenado ni evaluado.

Con 33.088 parametros totales, se trata de un artefacto de escala minima cuyo interes es fundamentalmente didactico y de infraestructura: sirve como plantilla reproducible para montar un pipeline de entrenamiento y evaluacion de clasificacion con una arquitectura que combina convoluciones y atencion. La relevancia actual no viene de su rendimiento, sino de su valor como punto de partida verificable para comparativas de capacidad equivalente y para validar herramientas de carga, serializacion y despliegue.

La model card no declara puntuaciones de benchmarks, idiomas soportados, ni datos de entrenamiento utilizados, y advierte explicitamente de que el checkpoint no ha sido auditado en robustez, equidad o transferencia de dominio. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN Transformer (hibrida convolucion + transformer) |
| Parametros totales | 33.088 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en precision original) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json` y `training_args.json` |

Otros datos declarados en la model card: escala "nano"; atencion *multi query*; fusion *low rank*; activacion *swish*; normalizacion RMSNorm. Tamano del repositorio: 0,0 GB. Descargas: 0. Likes: 0. Creado el 2026-09-15.

## Arquitectura y entrenamiento

La arquitectura es una CNN Transformer, es decir, un modelo hibrido que combina capas convolucionales con bloques de atencion. Segun la configuracion publicada, usa atencion *multi query* (una sola cabeza de clave/valor compartida, lo que reduce el coste de memoria del *KV cache*), fusion de caracteristicas mediante un mecanismo de bajo rango (*low rank*), activacion Swish y normalizacion RMSNorm. El pipeline declarado en HuggingFace es "no disponible", lo que es coherente con una implementacion personalizada: la carga mediante APIs automaticas genericas requiere un adaptador explicito, tal como indica el propio autor.

En cuanto al entrenamiento, el repositorio incluye `training_args.json` con una receta por defecto basada en AdamW y un schedule de *warmup* constante. El autor aclara de forma explicita que esos valores son puntos de partida del script y no evidencia de una ejecucion completada. No se documenta numero de tokens, composicion del dataset, ni fases de RLHF/DPO o ajuste por preferencias. No hay innovaciones tecnicas adicionales declaradas mas alla de la combinacion de atencion multi-query y fusion de bajo rango en un modelo de escala minima.

## Capacidades

- Clasificacion: es la tarea objetivo declarada del repositorio (`tags: classification`). El modelo esta disenado para producir una prediccion de clase, no para generacion de texto libre.
- Procesamiento de caracteristicas con convoluciones: la componente CNN permite extraer patrones locales, lo que sugiere uso previsto sobre entradas estructuradas (secuencias, series o representaciones tipo imagen, segun la implementacion concreta).
- Atencion multi-query: mecanismo de atencion con menor huella de memoria en inferencia que la atencion multi-cabeza estandar.
- Punto de entrada ejecutable: el autor menciona `predict.py` con un bloque `__main__` que contiene un ejemplo de prueba de humo ejecutable mediante `python predict.py --help`.
- No se declara soporte de *tool calling* ni de *function calling*.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declaran capacidades multilingues ni idiomas soportados.
- No se declaran capacidades de vision, audio, modo *thinking* ni generacion de codigo mas alla del propio codigo fuente del repositorio.

## Casos de uso

- Pruebas de humo de infraestructura de ML: el checkpoint de inicializacion permite verificar que un pipeline de carga de `safetensors`, instanciacion del modelo y ejecucion de inferencia funciona de extremo a extremo antes de invertir en entrenamientos reales con modelos mayores.
- Plantilla para experimentos de clasificacion: sirve como esqueleto reproducible sobre el que definir un *split* etiquetado especifico de la tarea, fijar al menos tres semillas y comparar contra una linea base de capacidad equivalente, tal como recomienda la propia model card.
- Revision de codigo y auditoria de arquitectura: al ser un unico archivo Python con configuracion separada, es adecuado para revisar en detalle como se implementan atencion multi-query, fusion de bajo rango y RMSNorm en PyTorch sin la complejidad de un repositorio de gran escala.
- Docencia y formacion: permite ilustrar en un caso minimo (33.088 parametros) como se compone un modelo hibrido CNN-Transformer, como se serializan los pesos y como se estructura una receta de entrenamiento con AdamW.
- Desarrollo de harnesses de evaluacion: dado su tamano, se puede ejecutar cientos de veces en CPU para validar metricas, semillas y utilidades de *logging* antes de aplicarlas a modelos costosos.
- Investigacion sobre fusion convolucion-atencion: la configuracion "nano" facilita experimentos controlados sobre el mecanismo de fusion de bajo rango y la activacion Swish sin restricciones de computo.
- Validacion de flujos de despliegue en CPU o *edge*: con un peso de decenas de miles de parametros, es util para probar el empaquetado de modelos personalizados (adaptadores, scripts de inferencia) en entornos con recursos muy limitados. En todos estos casos es imprescindible entrenar primero el modelo: los pesos actuales son solo inicializacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que no se reclama ninguna puntuacion de benchmark en este repositorio y que el checkpoint incluido no es un modelo entrenado ni evaluado. Por tanto, no existen datos de MMLU, HumanEval, GSM8K ni de ninguna metrica de clasificacion (accuracy, F1, AUC) que se puedan presentar.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en precision de 32 bits. Con 33.088 parametros, los pesos ocupan aproximadamente 132 KB en FP32, mas el *overhead* de activaciones, que es despreciable.
- GPU recomendadas: cualquiera. No se necesita GPU; el modelo puede ejecutarse en CPU sin problema. Cualquier GPU consumer (por ejemplo, una GTX 1650 o superior) es mas que suficiente.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos unos pocos cientos de MB de VRAM libres, incluidas integradas.
- Opciones de despliegue: inferencia directa con PyTorch a traves de `predict.py`; al ser una implementacion personalizada, las APIs genericas de carga automatica requieren un adaptador explicito. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dado el tamano del modelo, la latencia estara dominada por el *overhead* de Python y del framework, no por el computo del modelo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (clasificacion con arquitectura CNN-Transformer de escala nano ni alternativas de capacidad equivalente), ni datos de rendimiento que permitan establecer una comparacion rigurosa. Cualquier comparacion de parametros, contexto, licencia o rendimiento con otros modelos no puede respaldarse con los datos disponibles.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado. El propio autor lo define como una inicializacion valida para pruebas de humo, no como un modelo utilizable para predicciones reales.
- No hay evidencia de rendimiento: no se han publicado metricas, ni *baselines* comparables, ni resultados en tres semillas como recomienda la propia model card.
- No se ha auditado robustez, equidad ni transferencia de dominio del modelo.
- Sin datos de entrenamiento declarados: se desconoce el dataset, su composicion, su licencia y los posibles sesgos que podria heredar un modelo entrenado a partir de esta receta.
- Idioma y dominio: no se declaran idiomas soportados ni dominio de aplicacion, por lo que no se puede garantizar su adecuacion a entradas en castellano ni a ninguna tarea concreta.
- Carga no estandar: al ser una implementacion personalizada, los cargadores automaticos de HuggingFace requieren un adaptador explicito; intentar cargarlo con APIs genericas fallara.
- Restricciones de licencia: los pesos y el codigo se publican bajo Apache 2.0, lo que permite uso comercial del artefacto, pero la propia model card advierte de que los terminos de los datos de origen deben revisarse por separado si el repositorio se usa con conjuntos de datos externos.
- Uso en produccion: no recomendado en su estado actual. La model card indica que los resultados de un futuro checkpoint entrenado deben documentarse de forma separada de los valores por defecto aqui incluidos.
- Sin garantias de mantenimiento: el repositorio tiene 0 descargas y 0 likes, y no se documenta soporte ni hoja de ruta.

## Enlaces

- HuggingFace: https://huggingface.co/santos90x/cnn-transformer-demo
- No se han encontrado enlaces relevantes en la busqueda web. Los resultados devueltos corresponden a listados de establecimientos de hosteleria en Egipto y no guardan ninguna relacion con el modelo, por lo que no se incluyen.
