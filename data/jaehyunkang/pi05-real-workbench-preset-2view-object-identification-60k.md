# jaehyunkang/pi05-real-workbench-preset-2view-object-identification-60k

## Resumen

Este repositorio contiene el checkpoint final de un ajuste fino del modelo robótico pi0.5 (`lerobot/pi05_base`) sobre el dataset `Myungkyu/real_workbench-preset-gemini`, ejecutado durante 60.000 pasos de optimización. La tarea declarada es la identificación de objetos ("object-identification") en un banco de trabajo real, y la política recibe dos vistas de cámara (exterior y muñeca). Lo publica el usuario de HuggingFace `jaehyunkang` y, en el momento de redactar esta ficha, acumula 0 descargas y 0 likes, por lo que se trata de un artefacto de investigación sin validación externa.

No es un modelo de lenguaje: es una política viso-lenguaje-acción (VLA) de 4.143.404.816 parámetros (unos 4,14 mil millones) almacenada en safetensors, con un repositorio de 24,5 GB. La entrada combina dos imágenes de 224×126 píxeles que la política rellena ("padding") hasta 224×224, un vector de estado de 8 dimensiones y un texto de subtarea por fotograma; la salida es un bloque ("chunk") de 50 acciones delta del efector final (6 componentes de velocidad cartesiana más pinza) generado con 10 pasos de denoising.

Su interés actual es acotado pero real: documenta un protocolo de ajuste fino reproducible (semilla 42, batch global 32, 2 GPUs) sobre la implementación `RLWRLD/hiwrld-ll-policy`, que incorpora una versión vendorizada de LeRobot Pi0.5. En contrapartida, la licencia no está declarada, no se aportan métricas de evaluación en robot real y el modelo depende de campos de entrada personalizados, lo que limita su uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no especificada en la model card; derivada del modelo base `lerobot/pi05_base` (familia Pi0.5, politica viso-lenguaje-accion) |
| Parametros totales | 4.143.404.816 (medido sobre los safetensors del repositorio) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponibles (el texto de tarea se procesa con el tokenizer de `google/paligemma-3b-pt-224`) |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | safetensors (libreria `lerobot`); repositorio de 24,5 GB, con pesos, configuracion, pre/postprocesado y estados de normalizacion en la raiz |
| Tarea / ambito | object-identification sobre banco de trabajo real |
| Dataset de entrenamiento | `Myungkyu/real_workbench-preset-gemini` |
| Modelo base | `lerobot/pi05_base` (ajuste fino) |
| Vistas de entrada | 2 camaras (exterior y muneca) |
| Resolucion de imagen | almacenada a 224x126; la politica rellena a 224x224 |
| Dimension del estado | 8 |
| Dimension de la accion | delta EEF de 7 dimensiones (6 de velocidad cartesiana + pinza) |
| Horizonte de accion | 50 acciones por chunk; 10 pasos de denoising en inferencia |
| Pasos de optimizacion | 60.000 |
| Batch global / GPUs / semilla | 32 / 2 GPUs / 42 |
| Instruccion | subtarea por fotograma en parquet |
| Implementacion de entrenamiento | `RLWRLD/hiwrld-ll-policy` (LeRobot Pi0.5 vendorizado) |
| Tokenizer de referencia | `google/paligemma-3b-pt-224`, revision `35e4f46485b4d07967e7e9935bc3786aad50687c` |
| Fecha de creacion / actualizacion | 2026-09-17 / 2026-09-17 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Los unicos datos estructurales disponibles son los del modelo base (`lerobot/pi05_base`, familia Pi0.5) y la referencia explícita al tokenizer de PaliGemma, lo que sitúa la política dentro de la familia de modelos viso-lenguaje-acción que combinan un codificador visual y un modelo de lenguaje con un módulo generador de acciones. El repositorio confirma los elementos funcionales: dos flujos de imagen (exterior y muñeca), un vector de estado de 8 dimensiones, una salida de acciones delta EEF de 7 dimensiones y una generación de acciones por chunks con 10 pasos de denoising, coherente con un esquema de flow matching. Cualquier detalle adicional sobre capas, atención o dimensiones internas debe considerarse no disponible a partir de la informacion proporcionada.

En cuanto al entrenamiento, se trata de un ajuste fino supervisado (no se menciona RLHF, DPO ni aprendizaje por refuerzo) sobre `Myungkyu/real_workbench-preset-gemini`, con subtareas anotadas por fotograma en parquet. Se especifican 60.000 pasos de optimización, batch global 32, semilla 42 y 2 GPUs. La implementación es `RLWRLD/hiwrld-ll-policy`, que incorpora una copia vendorizada de LeRobot Pi0.5; la model card advierte de que los campos de entrada personalizados pueden requerir esa misma implementación para funcionar. El repositorio conserva los checkpoints originales de entrenamiento y los ficheros de reanudación en `training_state/`, con las rutas locales eliminadas de los metadatos JSON, y los tamanos y hashes SHA-256 en `artifact_manifest.json`.

## Capacidades

- Generacion de acciones motoras: produce chunks de 50 acciones delta del efector final (6 velocidades cartesianas + pinza) a partir de observaciones visuales y de estado.
- Identificacion de objetos: es el ambito declarado del ajuste fino, orientado a reconocer objetos sobre un banco de trabajo real.
- Percepcion multimodal de dos vistas: procesa simultaneamente una camara exterior y una camara de muneca, con relleno de 224x126 a 224x224.
- Condicionamiento por instruccion textual: acepta una subtarea por fotograma como texto de tarea de la politica.
- Control con horizonte temporal: la ejecucion se realiza por chunks de 50 acciones, lo que reduce la frecuencia de inferencia necesaria durante el control.
- Reanudacion de entrenamiento: el repositorio incluye estado de entrenamiento y manifiesto de artefactos, lo que permite continuar el ajuste fino.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No es un modelo conversacional ni de generacion de texto libre.
- No se declaran capacidades multilingues.
- No se declaran modos especiales (thinking mode, audio, vision general fuera del uso como entrada sensorial).

## Casos de uso

- Identificacion de objetos en banco de trabajo robotico: es la tarea para la que fue ajustado; se usaria alimentando por fotograma las dos vistas y el texto de subtarea, y consumiendo el chunk de acciones para que el brazo se aproxime o manipule el objeto identificado.
- Aprendizaje por imitacion en laboratorio: permite reproducir un ajuste fino completo de Pi0.5 con un protocolo documentado (60.000 pasos, batch 32, 2 GPUs, semilla 42), util como linea base en experimentos academicos de VLA.
- Investigacion comparativa de politicas: al existir variantes del mismo autor con distinto numero de vistas (2 y 3), sirve para medir el efecto del numero de camaras o del tipo de subtarea sobre el exito de la tarea.
- Recoleccion y anotacion de datos robotizados: el uso de subtareas por fotograma en parquet convierte este checkpoint en un punto de referencia para validar pipelines de anotacion antes de escalar el dataset.
- Reajuste fino en dominios cercanos: al conservarse los pesos, la configuracion y los estados de normalizacion en la raiz del repositorio, se puede partir de este checkpoint para adaptarlo a otra mesa de trabajo con un estado de 8 dimensiones y acciones delta EEF de 7.
- Prototipado de control con rollouts cortos: el horizonte de 50 acciones con 10 pasos de denoising encaja en bucles de control que planifican y ejecutan bloques, reduciendo la carga de inferencia frente a politicas paso a paso.
- Docencia y replicabilidad: el manifiesto con tamanos y hashes SHA-256 facilita verificar la integridad de los artefactos en cursos o reproducciones de experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que se trata de un checkpoint entrenado y no de un resultado de evaluacion ("This is a trained policy, not an evaluation result") y que no se reclama ninguna metrica de evaluacion en robot real. No se proporcionan cifras de exito de tarea, MMLU, HumanEval, GSM8K ni de ningun otro benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: unos 8,3 GB solo para los pesos de 4,14 mil millones de parametros, con un pico aproximado de 10 a 12 GB al incluir el codificador visual a 224x224, las dos vistas y los 10 pasos de denoising. Es una estimacion derivada del recuento de parametros, no un dato publicado.
- VRAM estimada en int8 (cuantizacion no publicada): alrededor de 4,2 GB de pesos y 6-7 GB de pico.
- VRAM estimada en int4 (cuantizacion no publicada): alrededor de 2,1 GB de pesos y 4-5 GB de pico.
- GPU recomendadas para inferencia: A100 o H100 para despliegues con margen y baja latencia; RTX 4090 o RTX 3090 (24 GB) para uso en laboratorio.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 con holgura en bf16; en RTX 4080 (16 GB) de forma ajustada; en GPUs de 12 GB o menos solo con cuantizacion, que no se distribuye en el repositorio.
- Entrenamiento o reajuste fino: la configuracion declarada usa 2 GPUs con batch global 32. No se especifica el modelo de GPU; por tamano de modelo y estado de entrenamiento, el repositorio de 24,5 GB sugiere espacio adicional para estados de optimizador y reanudacion.
- Opciones de despliegue: LeRobot (libreria declarada) y la implementacion `RLWRLD/hiwrld-ll-policy` para los campos de entrada personalizados. vLLM, TGI, llama.cpp y Ollama no son aplicables, ya que no hay pesos GGUF ni una API de generacion de texto.
- Latencia y throughput: no disponibles. Los unicos parametros conocidos son el horizonte de 50 acciones por chunk y 10 pasos de denoising por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`jaehyunkang/pi05-real-workbench-preset-2view-object-identification-60k`) | 4,14 B | no disponible | no declarada | safetensors (LeRobot) | HuggingFace, 0 descargas, 0 likes |
| `lerobot/pi05_base` (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | safetensors | HuggingFace |
| Otras variantes del mismo autor (por ejemplo, de 3 vistas) | no disponible | no disponible | no disponible | safetensors | citadas de forma generica en la model card, sin identificadores |

No se dispone de datos verificados en la informacion proporcionada para comparar con otras familias de politicas roboticas (OpenVLA, pi0, GR00T u otras) en parametros, contexto o rendimiento, por lo que no se incluyen cifras que no puedan contrastarse.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, no puede asumirse ningun permiso de uso comercial. Es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Ausencia total de metricas: no se publican resultados de evaluacion en robot real ni tasas de exito, por lo que el rendimiento funcional es desconocido.
- Riesgo de sobreajuste al dominio: el ajuste se realiza sobre un unico dataset de banco de trabajo; es esperable una degradacion fuera de esa mesa, con esa iluminacion o con objetos no vistos.
- Dependencia de campos de entrada personalizados: la propia model card advierte que puede ser necesaria la implementacion `RLWRLD/hiwrld-ll-policy` para reproducir el comportamiento, lo que reduce la portabilidad.
- Espacio de estado y accion fijo: estado de 8 dimensiones y acciones delta EEF de 7 dimensiones (6 cartesianas + pinza); no es directamente reutilizable en robots con otra cinematica o acciones absolutas.
- Requiere instruccion por fotograma: las subtareas deben suministrarse como texto de tarea por fotograma; sin ellas, el condicionamiento se degrada.
- Distorsion geometrica por relleno: las imagenes se almacenan a 224x126 y se rellenan a 224x224, lo que introduce una relacion de aspecto artificial en la entrada visual.
- Riesgo de errores de identificacion: como cualquier modelo perceptivo, puede confundir objetos similares o alucinar identificaciones plausibles; se recomienda verificacion externa en tareas criticas.
- Idiomas no declarados: no hay garantia de que las instrucciones de tarea funcionen fuera del idioma o la formulacion usados en el dataset.
- Sin validacion de la comunidad: 0 descargas y 0 likes, publicacion sin discusion ni replicaciones conocidas; tratarlo como artefacto experimental.
- Fechas de publicacion inusuales (2026-09-17): conviene verificar la procedencia y la integridad de los ficheros con `artifact_manifest.json` antes de usarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaehyunkang/pi05-real-workbench-preset-2view-object-identification-60k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Myungkyu/real_workbench-preset-gemini
- Tokenizer de referencia: https://huggingface.co/google/paligemma-3b-pt-224
- Implementacion de entrenamiento: `RLWRLD/hiwrld-ll-policy` (identificador citado en la model card; no se proporciona URL).
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces recuperados correspondian a articulos en japones sobre emuladores, edicion de PDF, capturas de pantalla, actas de reunion y metadatos XMP, sin ninguna relacion con el modelo. No se dispone por tanto de paper, blog o demo asociados.
