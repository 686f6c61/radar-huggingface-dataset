# jaehyunkang/pi05-real-workbench-taco-3view-8b7104f0-60k

## Resumen

`jaehyunkang/pi05-real-workbench-taco-3view-8b7104f0-60k` es una politica de robotica (vision-language-action, VLA) publicada por el usuario jaehyunkang, obtenida por ajuste fino del modelo base `lerobot/pi05_base` mediante la libreria LeRobot. No es un modelo de lenguaje de proposito general: es un checkpoint de inferencia que mapea observaciones visuales e instrucciones textuales a acciones motoras de un brazo robotico con pinza. El autor lo presenta explicitamente como "a trained policy, not an evaluation result", es decir, un artefacto de politica entrenada sin metricas de evaluacion asociadas.

El checkpoint corresponde al paso 60.000 de optimizacion, entrenado con lote global de 64 sobre 4 GPU y semilla 42, usando el conjunto de datos `Myungkyu/real_workbench-taco-keyframe-gemini`. La tarea cubre cuatro tareas de banco de trabajo ("Workbench"), con instruccion derivada por fotograma desde un campo de subtarea en parquet. La politica consume tres vistas de imagen (camara exterior, camara de muneca y una imagen de keyframe) y produce acciones de velocidad cartesiana mas gripper en formato delta sobre el efector final.

El modelo tiene 4.143.404.816 parametros reales (segun los pesos en safetensors) y un repositorio de 9,4 GB. Su relevancia es acotada: se trata de un artefacto de investigacion sin descargas ni interacciones en el momento de la consulta, con licencia no declarada y sin idiomas documentados, pensado para reproducir experimentos de manipulacion con la implementacion RLWRLD/hiwrld-ll-policy (LeRobot Pi0.5 vendorizado). Los resultados de busqueda web disponibles no aportan informacion relacionada con este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo VLA derivado de `lerobot/pi05_base`; implementacion LeRobot Pi0.5) |
| Parametros totales | 4.143.404.816 (4,14 mil millones) |
| Parametros activos | no aplica (no se documenta una arquitectura MoE) |
| Longitud de contexto | no disponible (horizonte de chunk de accion: 50; pasos de denoising en inferencia: 10) |
| Tipos de cuantizacion | no disponible (pesos publicados sin cuantizar; el repo ocupa 9,4 GB) |
| Idiomas soportados | no disponible (las instrucciones provienen de texto de subtarea por fotograma en parquet; no se declara idioma) |
| Licencia | no disponible |
| Formato de pesos | safetensors, mas configuracion de politica, preprocesado/postprocesado y estados de normalizacion en la raiz del repositorio, y `artifact_manifest.json` con tamanos y hashes SHA-256 |

## Arquitectura y entrenamiento

La informacion disponible describe un modelo de tipo VLA construido sobre el checkpoint `lerobot/pi05_base` y ejecutado con la implementacion RLWRLD/hiwrld-ll-policy, que incorpora una copia vendorizada de LeRobot Pi0.5. El tokenizador de referencia es `google/paligemma-3b-pt-224` (revision de entrenamiento `35e4f46485b4d07967e7e9935bc3786aad50687c`), lo que vincula la familia con el backbone PaliGemma. La generacion de acciones emplea un esquema de difusion/flow matching con 10 pasos de denoising y un horizonte de chunk de accion de 50, ejecutado sobre un espacio de accion de 7 dimensiones (6 de velocidad cartesiana delta mas gripper). No se detallan en la model card el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; al tratarse de una politica entrenada por imitacion sobre un dataset de keyframes, no se declaran etapas de alineamiento por preferencias.

En cuanto a los datos, el entrenamiento usa el dataset `Myungkyu/real_workbench-taco-keyframe-gemini`, con imagenes almacenadas a 224x126 que la politica rellena (padding) hasta 224x224. Cada ejemplo incluye tres vistas (exterior, muneca y `observation.image.keyframe`), un vector de estado de 8 dimensiones e instrucciones textuales por fotograma extraidas de subtareas en parquet. El entrenamiento se ejecuto durante 60.000 pasos de optimizacion con lote global 64 sobre 4 GPU y semilla 42. El checkpoint publicado excluye el estado del optimizador y de reanudacion, y se han eliminado rutas especificas de la maquina anfitriona de los metadatos JSON.

## Capacidades

- Generacion de acciones motoras: produce comandos de velocidad cartesiana delta (6 dimensiones) mas apertura/cierre de gripper a partir de observaciones visuales e instrucciones textuales.
- Percepcion multi-vista: consume de forma conjunta imagenes de camara exterior, camara de muneca y una imagen de keyframe definida por el dataset.
- Seguimiento de instrucciones de subtarea: acepta como campo `task` el texto de subtarea por fotograma correspondiente; para modelos de subtarea debe suministrarse el texto adecuado.
- Action chunking: emite fragmentos de 50 acciones por inferencia, lo que permite ejecucion semi-abierta con horizonte temporal relativamente largo entre replanificaciones.
- Denoising iterativo: genera acciones mediante 10 pasos de denoising, controlando el compromiso entre calidad y coste computacional por inferencia.
- Condicionamiento por estado propioceptivo: incorpora un vector de estado de 8 dimensiones ademas de las imagenes.
- Ajuste fino sobre base: al derivar de `lerobot/pi05_base`, la politica es reentrenable sobre nuevos datasets de manipulacion siguiendo el mismo pipeline.
- Tool calling, function calling y razonamiento multi-paso agentico: no disponibles (no aplica a una politica motora).
- Capacidades de vision general, audio o "thinking mode": no disponibles ni documentadas.

## Casos de uso

- Manipulacion de proposito general en banco de trabajo: la politica puede ejecutar las cuatro tareas del conjunto "Workbench" para las que fue entrenada, mapeando instrucciones textuales de subtarea e imagenes de tres camaras a comandos de velocidad del efector final. Es su escenario natural de uso y el unico respaldado por los datos de entrenamiento declarados.
- Pick and place con pinza: dado que el espacio de accion incluye explicitamente la dimension de gripper, el modelo es aplicable a tareas de recogida y colocacion donde se requiera cerrar o abrir la pinza al final de una trayectoria cartesiana.
- Investigacion en aprendizaje por imitacion: sirve como linea base reproducible para comparar variantes de politicas VLA, ya que se publican pesos, configuracion de politica y estados de normalizacion, ademas de un manifiesto con tamanos y hashes SHA-256.
- Transferencia a nuevas tareas mediante ajuste fino: partiendo de este checkpoint (o del base `lerobot/pi05_base`), un laboratorio puede reentrenar sobre su propio dataset de demostraciones manteniendo el mismo esquema de tres vistas y chunking de 50 acciones.
- Recoleccion de datos guiada por politica: la politica puede desplegarse en modo asistido para generar trayectorias candidatas mientras un operador corrige, aprovechando el horizonte de 50 acciones para reducir la frecuencia de intervencion.
- Evaluacion de pipelines de inferencia robotica: con 10 pasos de denoising y un chunk de 50, el modelo permite medir latencias y throughput reales del stack LeRobot sobre hardware concreto sin necesidad de reentrenar.
- Reproduccion de experimentos con implementacion especifica: dado que el autor advierte que ciertos campos de entrada personalizados pueden requerir la implementacion exacta (RLWRLD/hiwrld-ll-policy), el checkpoint sirve para validar la reproducibilidad del pipeline de entrenamiento entre equipos.
- Investigacion sobre condicionamiento multi-vista: al combinar vista exterior, de muneca y keyframe, permite estudiar el impacto de la fusion de vistas en el exito de tareas de contacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica de forma explicita que "no real-robot evaluation metrics are claimed here" y que el artefacto es una politica entrenada, no un resultado de evaluacion. Los resultados de busqueda web proporcionados no contienen informacion sobre este modelo ni sobre modelos comparables.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 4,14 mil millones de parametros, no confirmada por el autor): aproximadamente 8,3 GB solo para pesos en precision de 16 bits, y en torno a 10-14 GB contando activaciones del codificador visual, cache y sobrecarga del framework.
- VRAM estimada en cuantizacion: alrededor de 4-5 GB en 8 bits y 2,5-3,5 GB en 4 bits, siempre que la implementacion de LeRobot/PyTorch utilizada soporte la cuantizacion efectiva de esta politica.
- GPU recomendadas (estimacion): NVIDIA A100, H100 o L40S para inferencia desatendida; una RTX 4090 (24 GB) deberia ser suficiente en 16 bits para ejecutar la politica, aunque no hay confirmacion del autor.
- Compatibilidad con GPU de consumo: probablemente si en tarjetas con 12-24 GB de VRAM (RTX 3090, 4090, 4080) en 16 bits o cuantizado; no verificado.
- Entrenamiento declarado: 4 GPU, con lote global 64 y 60.000 pasos de optimizacion; el autor no especifica modelo de GPU ni duracion.
- Opciones de despliegue: libreria LeRobot y la implementacion RLWRLD/hiwrld-ll-policy. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, que no son aplicables a este tipo de politica motora.
- Latencia y throughput: no disponibles. Los unicos parametros relacionados son 10 pasos de denoising por inferencia y un horizonte de ejecucion de 50 acciones.

## Comparativa con modelos similares

| Modelo | Parametros | Vistas / contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pi05-real-workbench-taco-3view (este modelo) | 4,14 B | 3 vistas (exterior, muneca, keyframe), imagenes 224x126 con padding a 224x224 | no disponible | Publicado en HuggingFace, 0 descargas y 0 likes |
| lerobot/pi05_base (modelo base) | no disponible | no disponible | no disponible | Publico como base del ajuste fino |
| OpenVLA (referencia de la categoria VLA) | ~7 B segun documentacion publica, no verificado en esta busqueda | 1 vista | Llama 2 Community | Publico |
| NVIDIA GR00T N1 (referencia de la categoria VLA) | del orden de 2 B en su variante de modelo base, no verificado en esta busqueda | no disponible | NVIDIA Open Model License | Publico |

Las cifras de OpenVLA y GR00T N1 proceden de conocimiento general de la categoria y no han sido verificadas con la informacion proporcionada en esta busqueda; deben tratarse como referencia aproximada. Para este modelo concreto, no existe informacion publica de rendimiento que permita una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de metricas: el autor declara explicitamente que no se reclama ningun resultado de evaluacion en robot real. No hay evidencia publicada de tasa de exito en ninguna tarea.
- Especificidad del dominio: la politica esta entrenada sobre cuatro tareas de "Workbench" de un unico dataset y con una configuracion concreta de camaras y espacio de estado/accion; generalizar fuera de ese dominio no esta respaldado por ningun dato.
- Dependencia de la implementacion: el propio autor advierte que los campos de entrada personalizados pueden requerir la implementacion exacta (RLWRLD/hiwrld-ll-policy con LeRobot Pi0.5 vendorizado), lo que limita la portabilidad a otros stacks.
- Requisitos de entrada estrictos: para modelos de subtarea debe suministrarse el texto de subtarea por fotograma correspondiente y, en modelos de 3 vistas, tambien la imagen de keyframe definida por el dataset. Omitirlos invalida la inferencia.
- Licencia no declarada: al no especificarse licencia, no puede asumirse permiso para uso comercial ni redistribucion. Es un riesgo legal directo para cualquier despliegue en produccion.
- Idiomas no declarados: no hay informacion sobre el idioma de las instrucciones ni sobre su cobertura multilingue.
- Sin datos de sesgo ni de robustez: no se documentan sesgos conocidos, comportamiento ante distribuciones fuera de dominio ni riesgo de alucinacion aplicable en el sentido de un LLM, aunque si existe riesgo de acciones incorrectas cuando la observacion se aleja de la distribucion de entrenamiento.
- Estado del repositorio: 0 descargas y 0 likes en la fecha de actualizacion, lo que indica ausencia de validacion por parte de la comunidad.
- Artefacto de inferencia sin estado de reanudacion: se excluyen el optimizador y el estado de entrenamiento, y se han eliminado rutas especificas del host de los metadatos JSON; para reanudar entrenamientos hay que aportar rutas locales de dataset y salida.
- Fechas de creacion y actualizacion registradas en 2026, con una ventana de actualizacion de 45 segundos, lo que sugiere un artefacto subido de forma automatica o experimental.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaehyunkang/pi05-real-workbench-taco-3view-8b7104f0-60k
- Dataset de entrenamiento: https://huggingface.co/datasets/Myungkyu/real_workbench-taco-keyframe-gemini
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Tokenizador de referencia: https://huggingface.co/google/paligemma-3b-pt-224
- Implementacion de entrenamiento citada: RLWRLD/hiwrld-ll-policy (no se ha proporcionado URL verificable en la informacion disponible)
- LeRobot (framework subyacente): https://github.com/huggingface/lerobot
- Papers, blogs o demos adicionales: no disponibles. Los resultados de busqueda web proporcionados no contienen informacion relacionada con este modelo.
