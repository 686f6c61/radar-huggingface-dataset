# jaehyunkang/pi05-real-workbench-vanilla-2view-60k

## Resumen

pi05-real-workbench-vanilla-2view-60k es una política de robotica (VLA, vision-language-action) publicada por el usuario jaehyunkang en HuggingFace. Se trata de un fine-tuning de lerobot/pi05_base sobre el dataset Myungkyu/real_workbench, y corresponde al checkpoint final tras 60.000 pasos de optimizacion. No es un modelo de lenguaje de proposito general: es un modelo de control que recibe observaciones visuales, un estado proprioceptivo y una instruccion de tarea en lenguaje natural, y emite acciones motoras.

El modelo tiene 4.143.404.816 parametros (aproximadamente 4,14 mil millones) almacenados en safetensors, con un repositorio de 24,5 GB que incluye ademas los ficheros de reanudacion de entrenamiento en `training_state/`. La variante "vanilla-2view" usa dos vistas de camara (exterior y muneca), cubre las cuatro tareas de Workbench definidas en el dataset y emplea una instruccion global de tarea. La accion se representa como delta del efector final en 7 dimensiones (6 de velocidad cartesiana mas pinza) y se ejecuta en chunks de 50 pasos.

Su relevancia es acotada y muy especifica: sirve como checkpoint de referencia reproducible para quien quiera reproducir o comparar el entrenamiento de pi0.5 sobre el banco de trabajo real de Myungkyu/real_workbench. El propio autor indica explicitamente que no se reclaman metricas de evaluacion en robot real, por lo que debe tratarse como un artefacto de entrenamiento, no como un modelo validado en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de pi0.5; tokenizador de referencia `google/paligemma-3b-pt-224`. Detalle interno no disponible |
| Parametros totales | 4.143.404.816 (4,14 B aprox.) |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible (no se especifica ventana de contexto en tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible; las instrucciones son texto de tarea en lenguaje natural, pero el autor no declara idiomas |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Modelo base | lerobot/pi05_base |
| Dataset de entrenamiento | Myungkyu/real_workbench |
| Pasos de optimizacion | 60.000 |
| Batch global / GPUs / semilla | 64 / 4 / 42 |
| Vistas de camara | 2 (exterior y muneca) |
| Dimension del estado | 8 |
| Dimension de la accion | Delta EEF, 7 (6 de velocidad cartesiana + pinza) |
| Resolucion de imagen | 224x126 almacenada; la politica rellena a 224x224 |
| Action chunk / horizonte de ejecucion | 50 |
| Pasos de denoising en inferencia | 10 |
| Implementacion de entrenamiento | RLWRLD/hiwrld-ll-policy (LeRobot Pi0.5 vendorizado) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de una politica pi0.5 construida sobre la libreria LeRobot y que su tokenizador de referencia es `google/paligemma-3b-pt-224` (revision de entrenamiento `35e4f46485b4d07967e7e9935bc3786aad50687c`). Esto apunta a un backbone de tipo vision-language sobre PaliGemma con un cabezal de accion; el modelo emite acciones mediante un esquema de denoising (10 pasos en inferencia) y las ejecuta en chunks de 50. No se publica informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

El entrenamiento se realizo durante 60.000 pasos de optimizacion con batch global 64 sobre 4 GPUs y semilla 42, usando la implementacion `RLWRLD/hiwrld-ll-policy` con LeRobot Pi0.5 vendorizado. El autor advierte que campos de entrada personalizados pueden requerir esa implementacion concreta. El alcance de tareas cubre las cuatro tareas de Workbench del dataset, con instruccion global de tarea y dos vistas. Los pesos de politica, la configuracion, el preprocesado/postprocesado y los estados de normalizacion estan en la raiz del repositorio; los ficheros de reanudacion, en `training_state/`, con las rutas especificas de host eliminadas de los metadatos JSON.

## Capacidades

- Generacion de acciones motoras en espacio de efector final (delta EEF de 7 dimensiones: 6 de velocidad cartesiana mas pinza), condicionada por observaciones visuales y estado de 8 dimensiones.
- Ejecucion por chunks de accion de 50 pasos, con 10 pasos de denoising en inferencia.
- Percepcion con dos camaras simultaneas: vista exterior y vista de muneca, con imagenes de 224x126 rellenadas a 224x224.
- Seguimiento de instrucciones de tarea en lenguaje natural a nivel global (`task` text). Para modelos de subtarea, el autor indica que debe suministrarse la subtarea por frame correspondiente.
- Cobertura de las cuatro tareas del banco de trabajo de Myungkyu/real_workbench.
- No se declaran capacidades de tool calling, function calling, razonamiento multi-paso simbolico, vision general, audio ni modo "thinking".
- Capacidades multilingues: no disponibles.

## Casos de uso

- Manipulacion en banco de trabajo real: el modelo esta entrenado especificamente sobre las cuatro tareas de Myungkyu/real_workbench, por lo que su uso directo mas razonable es la ejecucion de esas tareas con las mismas dos vistas de camara y la misma definicion de estado y accion.
- Reproduccion de experimentos: sirve como checkpoint final de referencia (60.000 pasos, semilla 42, 4 GPUs, batch 64) para reproducir o auditar el pipeline de entrenamiento de pi0.5 sobre este dataset.
- Punto de partida para fine-tuning en dominio propio: al ser un fine-tuning de lerobot/pi05_base, puede reutilizarse como inicializacion para nuevos dominios que compartan la interfaz de 8 dimensiones de estado y accion delta EEF de 7 dimensiones.
- Evaluacion comparativa de politicas: util para comparar variantes (por ejemplo, configuraciones de 2 vistas frente a 3 vistas) bajo la misma receta de entrenamiento, dado que el autor publica variantes con nombre explicito de configuracion.
- Reanudacion de entrenamiento: los ficheros de `training_state/` permiten retomar el entrenamiento desde el paso 60.000, util para laboratorios que quieran extender el numero de pasos con su propio hardware.
- Investigacion en imitation learning con LeRobot: al estar empaquetado con la libreria `lerobot` y estados de normalizacion incluidos, se integra en flujos de entrenamiento y evaluacion basados en LeRobot.
- Pruebas de integracion de politicas de accion chunked: el horizonte de 50 con 10 pasos de denoising permite estudiar latencia y estabilidad de control en pipelines de inferencia robotica.
- Docencia y ejemplos de VLA: como artefacto abierto y pequeno (4,14 B parametros de politica), es adecuado para ilustrar el ciclo completo observacion-instruccion-accion en un modelo VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que se trata de un checkpoint entrenado, no de un resultado de evaluacion, y que no se reclaman metricas de evaluacion en robot real.

| Metrica | Valor |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Exito en tareas de robot real | no disponible (no reclamado por el autor) |
| Perdida de entrenamiento | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14 B parametros, los pesos en bf16/fp16 ocupan aproximadamente 8,3 GB; en fp32, unos 16,6 GB. Sumando el encoder de vision, el estado de normalizacion y los buffers de activacion del denoising (10 pasos) y del chunk de 50 acciones, es razonable prever un minimo practico de 12-16 GB en bf16.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) o A100/H100 son suficientes para inferencia en bf16. El entrenamiento declarado uso 4 GPUs, pero no se indica el modelo.
- Cabe en GPU de consumo: si, previsiblemente en RTX 4090 (24 GB) y en tarjetas de 16 GB con margen ajustado; no confirmado por el autor.
- Opciones de despliegue: LeRobot (libreria declarada) y la implementacion `RLWRLD/hiwrld-ll-policy` para los campos de entrada personalizados. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Se conocen los hiperparametros de inferencia (10 pasos de denoising, chunk de 50), pero no se publican mediciones.
- Espacio en disco: el repositorio ocupa 24,5 GB, incluyendo `training_state/`; los pesos de politica por si solos ocupan menos.

## Comparativa con modelos similares

La busqueda web realizada no devolvio informacion tecnica sobre modelos comparables; los resultados obtenidos no guardan relacion con el tema. La unica comparacion factible con los datos disponibles es contra el modelo base.

| Modelo | Parametros | Contexto / observaciones | Formato | Licencia | Relacion |
|---|---|---|---|---|---|
| jaehyunkang/pi05-real-workbench-vanilla-2view-60k | 4,14 B | 2 vistas (exterior y muneca), chunk 50, 10 pasos de denoising, 4 tareas de Workbench | safetensors | no disponible | Este modelo |
| lerobot/pi05_base | no disponible | Modelo base sin fine-tuning sobre real_workbench | no disponible | no disponible | Modelo de partida |
| Otras alternativas (OpenVLA, RDT-1B, GR00T, etc.) | no disponible | No se dispone de datos verificados en la informacion proporcionada | no disponible | no disponible | No comparables con los datos disponibles |

## Limitaciones y advertencias

- No se reclaman metricas de evaluacion en robot real: el autor indica explicitamente que es un checkpoint entrenado y no un resultado de evaluacion. No debe asumirse un rendimiento de exito concreto.
- Alcance de tareas muy restringido: solo las cuatro tareas de Workbench del dataset Myungkyu/real_workbench. Fuera de ese dominio no hay garantia de comportamiento util.
- Dependencia de la implementacion: los campos de entrada personalizados pueden requerir la implementacion `RLWRLD/hiwrld-ll-policy` con LeRobot Pi0.5 vendorizado; otras versiones de LeRobot podrian no cargar el modelo correctamente.
- Dependencia del preprocesado: la resolucion de imagen de entrenamiento es 224x126 rellenada a 224x224, con 8 dimensiones de estado y accion delta EEF de 7 dimensiones. Cambiar la interfaz de sensores o el espacio de accion invalida la politica.
- Licencia no disponible: al no declararse licencia, no puede asumirse permiso para uso comercial. Es un riesgo legal relevante para cualquier despliegue en produccion.
- Idioma no declarado: se desconoce en que idioma estan redactadas las instrucciones de tarea del dataset y si el modelo responde a instrucciones en otros idiomas.
- Riesgo de alucinacion: no aplica en el sentido de texto generado, pero si existe riesgo de acciones incorrectas o inestables ante observaciones fuera de distribucion, propio de las politicas de imitation learning.
- Sesgos: no disponibles. Al entrenarse sobre un unico banco de trabajo fisico, el modelo hereda los sesgos de ese entorno (iluminacion, disposicion de objetos, tipo de robot y pinza).
- Sin datos de cuantizacion: no se ofrecen variantes GGUF ni cuantizadas, lo que limita el despliegue en hardware de bajos recursos.
- Repositorio con estado de entrenamiento: los 24,5 GB incluyen ficheros de reanudacion; conviene descargar solo lo necesario si el objetivo es inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaehyunkang/pi05-real-workbench-vanilla-2view-60k
- Dataset de entrenamiento: https://huggingface.co/datasets/Myungkyu/real_workbench
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Tokenizador de referencia: https://huggingface.co/google/paligemma-3b-pt-224
- Implementacion de entrenamiento citada: RLWRLD/hiwrld-ll-policy (sin URL verificada en la informacion disponible)
- LeRobot: https://github.com/huggingface/lerobot (referencia de la libreria declarada; URL no verificada en la informacion disponible)
