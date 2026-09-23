# Shiki42/s016-sortblocks-ctr-mask-pi05-step20000-training-state

## Resumen

Este repositorio no es un modelo listo para produccion, sino un **checkpoint de entrenamiento completo** del modelo de vision-lenguaje-accion (VLA) π₀.₅ publicado por el usuario Shiki42 bajo la libreria `openpi`. En concreto, se trata del estado correspondiente a la actualizacion de optimizador numero 20.000 del run E764 / E764-R001, entrenado sobre el dataset [Shiki42/ctr-sortblocks-100ep-ctr](https://huggingface.co/datasets/Shiki42/ctr-sortblocks-100ep-ctr) con lote de tamano 16 y semilla 87431. A diferencia de la variante de solo inferencia, esta publicacion incluye deliberadamente el estado del optimizador y del cargador de datos, ademas de `params/`, `assets/` y `_CHECKPOINT_METADATA`.

La relevancia del artefacto es de caracter reproducible y de investigacion: permite reanudar o auditar un entrenamiento concreto de la familia π₀.₅ de Physical Intelligence, cuantificar la contribucion de la perdida IdleMask (`IdleMask loss consumption: true`) y verificar la procedencia de los pesos mediante los ficheros `resolved_config.json`, `training-provenance.json`, `resume-provenance.json` y `SHA256SUMS`. El checkpoint ocupa 9,55 GB repartidos en 375 archivos y esta etiquetado para la tarea de manipulacion robotica de clasificacion por bloques (`sortblocks`).

Es importante senalar que el propio autor advierte de que esta publicacion, por si sola, no establece una cualificacion de restauracion ni una tasa de exito de evaluacion, y que la auditoria esta pendiente. No se han publicado resultados de benchmarks, no se declara licencia y las descargas y valoraciones del repositorio son cero en el momento de la consulta, por lo que debe tratarse como material experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo vision-lenguaje-accion (VLA) π₀.₅ (OpenPI), derivado de π₀; el repositorio corresponde a un estado de entrenamiento, no a un grafo de inferencia |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se publican pesos y estado de entrenamiento en el formato nativo de OpenPI, sin variantes cuantizadas declaradas) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | Estado de entrenamiento OpenPI: `params/`, `assets/`, `train_state/`, `data_loader/` y `_CHECKPOINT_METADATA`; no se ofrecen safetensors ni GGUF |
| Tamano del repositorio | 9,6 GB (375 archivos, 9.551.371.090 bytes segun la model card) |
| Libreria / pipeline | openpi / robotics |
| Run y procedencia | Experimento E764 / E764-R001, 20.000 actualizaciones de optimizador, lote 16, semilla 87431 |
| Dataset de entrenamiento | Shiki42/ctr-sortblocks-100ep-ctr, revision `9ee0f9d8e0700df5fac08454e7e213c4904d3024` |
| Commit de CTR | `59cfb9e12fe8a58a26bcca0122be954f50449284` |
| Hash del manifiesto de runtime | `06e035fbc62dd7f32f01a2f5ad536f01bd5af6caae3239698dbb8c07ed503332` |
| Hash del recibo de cualificacion | `d6eeb27fd90448fb17fff332a7dbcce4fc57ca80d707c95d9c9406b44b952e5c` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es π₀.₅, un VLA publicado por el equipo de Physical Intelligence dentro del proyecto OpenPI. Segun la documentacion del proyecto, OpenPI alberga tres familias: π₀, un VLA basado en flow matching para la generacion de acciones; π₀-FAST, un VLA autoregresivo construido sobre el tokenizador de acciones FAST; y π₀.₅, una version mejorada de π₀ orientada a mejorar la generalizacion en entornos abiertos mediante co-entrenamiento con datos heterogeneos. Este checkpoint concreto corresponde a π₀.₅. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento del modelo base, la composicion completa del dataset ni las etapas de RLHF o DPO, que no se declaran.

Lo que si esta documentado es el procedimiento de ajuste del checkpoint: 20.000 actualizaciones de optimizador con lote de tamano 16 sobre el dataset `ctr-sortblocks-100ep-ctr`, con consumo de la perdida IdleMask activado. La publicacion incluye artefactos de trazabilidad (`resolved_config.json`, `training-provenance.json`, `resume-provenance.json` y `SHA256SUMS`) que vinculan configuracion, dataset, runtime y run, y el autor indica explicitamente que una continuacion posterior a 30k pasos requeriria su propio flujo de restauracion registrado y cualificado, que esta release no cubre. La model card senala tambien que la auditoria esta pendiente y que existe un repositorio separado de solo inferencia.

## Capacidades

- Control robotico de manipulacion: el modelo genera acciones motoras a partir de observaciones visuales y de instrucciones en lenguaje, siguiendo el paradigma VLA de la familia π₀ / π₀.₅.
- Ejecucion de la tarea especifica del dataset de ajuste: clasificacion y ordenacion de bloques (`sortblocks`) segun la configuracion `ctr_mask` del run E764.
- Percepcion visual y comprension de instrucciones en ingles, heredadas del backbone vision-lenguaje del modelo base π₀.₅.
- Generacion de acciones mediante el mecanismo de la familia π₀, descrito en la documentacion de OpenPI como flow matching para π₀ (no se detalla en la informacion disponible si π₀.₅ mantiene exactamente el mismo esquema).
- Reanudacion de entrenamiento: al incluir `train_state/` y `data_loader/`, permite continuar el entrenamiento desde el paso 20.000, a diferencia de un checkpoint de solo inferencia.
- No se declara soporte de tool calling, function calling, agentes multi-paso, vision adicional, audio ni modos de razonamiento explicito. Estas capacidades no estan documentadas para este artefacto.

## Casos de uso

- Reproduccion de experimentos: cargar el checkpoint junto con los ficheros de procedencia para replicar el run E764 hasta el paso 20.000 y verificar los hashes SHA-256 de cada archivo publicado.
- Reanudacion de entrenamiento: usar `train_state/` y `data_loader/` para continuar el entrenamiento mas alla del paso 20.000 sin reiniciar el optimizador ni la semilla 87431.
- Ablacion de la perdida IdleMask: el checkpoint declara `IdleMask loss consumption: true`, de modo que sirve como punto de comparacion frente a runs sin dicha perdida para medir su efecto en la politica resultante.
- Auditoria de procedencia de pesos: los ficheros `training-provenance.json`, `resume-provenance.json` y `SHA256SUMS` permiten trazar que configuracion, dataset y runtime produjeron exactamente estos parametros, util en entornos con requisitos de trazabilidad.
- Investigacion en aprendizaje por imitacion robotica: analizar como se comporta un VLA ajustado durante 100 epocas sobre una tarea de clasificacion de bloques y estudiar el sobreajuste a esa tarea concreta.
- Punto de partida para ajuste fino adicional: usar los parametros como inicializacion para tareas de manipulacion relacionadas, teniendo en cuenta que el estado del optimizador esta vinculado al run original.
- Conversion a formato de inferencia: exportar los parametros a la variante de solo inferencia del mismo autor ([Shiki42/s016-sortblocks-ctr-mask-act-step100000](https://huggingface.co/Shiki42/s016-sortblocks-ctr-mask-act-step100000)) para desplegar la politica en un robot sin arrastrar el estado de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que esta release, por si sola, no establece una tasa de exito de evaluacion ni una cualificacion de restauracion, y que la auditoria esta pendiente. El repositorio registra 0 descargas y 0 likes, por lo que no existen evaluaciones de terceros documentadas.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El repositorio declara 9,55 GB, pero ese total incluye estado del optimizador, estado del cargador de datos y assets, por lo que no equivale a la huella de memoria de los parametros durante la inferencia. No se desglosa el reparto por componente.
- VRAM para reanudar entrenamiento: no disponible, pero necesariamente superior a la de inferencia, ya que hay que cargar ademas el estado del optimizador y del data loader.
- GPU recomendadas: no disponibles en la informacion proporcionada. No se indica ninguna GPU concreta (A100, H100, RTX 4090 u otras) ni el numero de dispositivos usado en el entrenamiento original.
- Compatibilidad con GPU de consumo: no confirmada. Dado que el checkpoint supera los 9 GB y anade estado de entrenamiento, no puede asumirse que quepa en GPUs de consumo sin convertir previamente a la variante de inferencia.
- Opciones de despliegue: la libreria declarada es `openpi`, el framework open source de Physical Intelligence para modelos VLA. El flujo previsto es cargar el checkpoint con el runtime de OpenPI o exportarlo a la variante de solo inferencia. No se declaran integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no son aplicables a un VLA con salida de acciones.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Familia / base | Mecanismo de generacion de acciones | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint (s016-sortblocks-ctr-mask-pi05-step20000) | π₀.₅ (OpenPI) | no especificado para π₀.₅; π₀, su base, usa flow matching | no disponible | no disponible | no disponible | HuggingFace, 0 descargas |
| π₀ (OpenPI) | Vision-language-action | Flow-based VLA | no disponible | no disponible | no disponible | Repositorio oficial Physical-Intelligence/openpi |
| π₀-FAST (OpenPI) | Derivado de π₀ | Autoregresivo con tokenizador FAST | no disponible | no disponible | no disponible | Repositorio oficial Physical-Intelligence/openpi |
| π₀.₅ (OpenPI) | Version mejorada de π₀ | No detallado; orientado a generalizacion en entornos abiertos | no disponible | no disponible | no disponible | Repositorio oficial Physical-Intelligence/openpi |
| Shiki42/s016-sortblocks-ctr-mask-act-step100000 | π₀.₅ (OpenPI) | No disponible | no disponible | no disponible | no disponible | HuggingFace, checkpoint de 100.000 pasos |

No se dispone de cifras de parametros, contexto ni rendimiento para ninguno de los modelos comparados dentro de la informacion proporcionada, por lo que la comparativa es estructural y no cuantitativa.

## Limitaciones y advertencias

- Es un checkpoint de entrenamiento, no un modelo de produccion: incluye estado de optimizador y de cargador de datos, y no esta pensado para cargarse directamente en un servicio de inferencia.
- Sin benchmarks ni tasa de exito: la propia model card afirma que la release no establece una cualificacion de restauracion ni un exito de evaluacion, y que la auditoria esta pendiente.
- Licencia no disponible: al no declararse licencia, no puede asumirse permiso para uso comercial ni para redistribucion. Cualquier uso en produccion requiere aclarar antes los terminos.
- Especifico de una tarea: el ajuste se realizo sobre el dataset `ctr-sortblocks-100ep-ctr` durante 100 epocas, por lo que es esperable un fuerte sesgo hacia la tarea de ordenacion de bloques y una capacidad limitada fuera de esa distribucion.
- Idioma: solo se declara soporte de ingles (`en`), lo que limita el uso de instrucciones en castellano u otros idiomas.
- Riesgo de sobreajuste: 20.000 actualizaciones sobre un unico dataset de tarea concreta, sin datos de evaluacion publicados, impiden estimar la generalizacion.
- Herencia del modelo base: al derivar de π₀.₅ y, en ultima instancia, de π₀, arrastra los sesgos y limitaciones de sus datos de co-entrenamiento, que no se detallan en la informacion disponible.
- Cero validacion externa: 0 descargas y 0 likes implican ausencia de verificacion independiente por parte de la comunidad.
- Continuaciones fuera de alcance: el autor indica que un entrenamiento posterior hasta 30k requeriria su propio flujo de restauracion registrado y cualificado, que esta publicacion no proporciona.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Shiki42/s016-sortblocks-ctr-mask-pi05-step20000-training-state
- Checkpoint de inferencia relacionado: https://huggingface.co/Shiki42/s016-sortblocks-ctr-mask-act-step100000
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/ctr-sortblocks-100ep-ctr
- Repositorio oficial de OpenPI: https://github.com/Physical-Intelligence/openpi
- Paper de π₀.₅: https://arxiv.org/abs/2504.16054
- Sitio de Physical Intelligence: https://www.pi.website/
- Documentacion de OpenPI: https://www.openpi.net/english.html
