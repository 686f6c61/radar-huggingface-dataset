# angelic123/fastwam_droid_wan21_1p3b_step100k

## Resumen

FastWAM DROID es un world model (modelo del mundo) condicionado por acciones, desarrollado por el usuario angelic123 y publicado como checkpoint base del proyecto FastWAM. Se construye sobre Wan-AI/Wan2.1-T2V-1.3B: la arquitectura MoT combina una rama de generacion de video (heredada de Wan2.1-T2V-1.3B) con un DiT de acciones y un codificador de propiocepcion. El resultado predice fotogramas futuros de tres camaras de robot a partir de las acciones ejecutadas, la propiocepcion y una condicion de texto.

El checkpoint corresponde a la ejecucion `droid_wan21_1p3b_1e-4/droid_1p3b_scratch`, entrenada sobre DreamZero-DROID-Data durante 100.000 pasos (el `max_steps` de la ejecucion, por lo que esta completa). El modelo tiene 2.062 mil millones de parametros en bfloat16 y una dimension de accion/propiocepcion de 7, coherente con un brazo manipulador de 7 grados de libertad.

Su relevancia es de investigacion: los world models condicionados por accion permiten planificar, entrenar politicas y evaluarlas sin robot fisico. Es un baseline sin benchmarks publicados, sin descargas ni validacion de la comunidad, y su uso requiere el codigo de FastWAM, que no se distribuye en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastWAM MoT: rama de video de Wan2.1-T2V-1.3B (modelo base) + DiT de acciones + codificador de propiocepcion |
| Parametros totales | 2,062 mil millones (`mot`: 2061,9 M y `proprio_encoder`: 2 tensores) |
| Parametros activos | no aplica (no es un MoE disperso; MoT designa una mezcla de ramas de transformadores) |
| Longitud de contexto | 128 tokens de embedding de texto (`context_len` 128); ventana temporal de video no disponible |
| Tipos de cuantizacion | no disponible (solo bfloat16 en el checkpoint; no se publican GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (la model card no documenta idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch `.pt` (`step_100000.pt`, 3,9 GB); no se distribuye en safetensors |
| Modelo base | Wan-AI/Wan2.1-T2V-1.3B (30 capas, hidden 1536, 12 cabezas) |
| Dataset de entrenamiento | DreamZero-DROID-Data |
| Camaras de entrada | 3 (`exterior_image_1_left`, `exterior_image_2_left`, `wrist_image_left`) a 3x180x320 |
| Dimension propio/accion | 7 |
| Paso de entrenamiento | 100.000 (`max_steps`, ejecucion completada) |
| Tamano del repositorio | 4,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un world model de difusion de video condicionado por accion. La rama de video parte de Wan2.1-T2V-1.3B (30 capas, dimension oculta 1536, 12 cabezas de atencion) y se acopla mediante el esquema MoT a un DiT especifico de acciones, junto con un `proprio_encoder` que inyecta el estado propioceptivo. La condicion de texto se introduce mediante embeddings T5 precalculados con el encoder `wan21t2v13b` y una longitud de contexto de 128 tokens. La salida modela tres vistas de camara simultaneas a resolucion 3x180x320, y la accion y la propiocepcion tienen dimension 7.

El entrenamiento se ejecuto con learning rate 1e-4 con decaimiento coseno, weight decay 0,01, batch size 2 con acumulacion de gradiente 2 (batch efectivo 4), precision bf16 y semilla 42, hasta completar 100.000 pasos. El repositorio incluye `config.yaml` con la configuracion exacta y `dataset_stats.json` con las estadisticas de normalizacion de acciones y propiocepcion, que son obligatorias para inferencia. La model card no detalla la funcion de perdida, la composicion exacta del dataset ni si hubo alguna fase de ajuste adicional; tampoco se documenta ningun proceso de RLHF o DPO, algo esperable en un modelo de difusion de video.

## Capacidades

- Prediccion de video futuro condicionada por secuencias de acciones de 7 dimensiones y por el estado propioceptivo del robot.
- Generacion simultanea de tres vistas de camara (dos exteriores y una de muneca) a 3x180x320.
- Condicionamiento textual mediante embeddings T5 cacheados del encoder `wan21t2v13b` con contexto de 128 tokens.
- Modelado de dinamica accion-observacion, apto para rollouts de planificacion y evaluacion de politicas en el dominio DROID.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso en lenguaje: no disponible.
- Capacidades multilingues: no disponibles ni documentadas.
- Capacidades especiales: no se documentan modos de pensamiento, audio ni vision generalista fuera de las tres camaras de entrenamiento.

## Casos de uso

- Planificacion basada en modelo (MPC): simular rollouts de candidatos de accion en el mundo aprendido y seleccionar la secuencia que maximiza una recompensa o un progreso estimado antes de ejecutarla en el robot.
- Entrenamiento de politicas en mundo aprendido: usar el modelo como entorno para RL model-based sobre tareas de manipulacion del dominio DROID, reduciendo la necesidad de interaccion fisica.
- Aumento de datos para imitation learning: generar trayectorias sinteticas con las tres camaras a partir de acciones y estados muestreados, ampliando datasets pequeños de demostraciones reales.
- Evaluacion offline de politicas: comparar politicas candidatas midiendo la discrepancia entre las observaciones predichas y las reales, sin necesidad de acceso continuo al robot.
- Deteccion de fallos y analisis de seguridad: predecir las consecuencias visuales de una accion de riesgo antes de ejecutarla y filtrar comandos potencialmente peligrosos.
- Investigacion en representaciones: extraer caracteristicas latentes de la dinamica para inicializar politicas o aprender representaciones de tarea reutilizables.
- Depuracion y visualizacion: renderizar la evolucion esperada de una escena bajo un plan dado para inspeccionar el comportamiento previsto de la politica.
- Analisis de robustez visual: evaluar como cambia la prediccion ante variaciones de iluminacion, oclusiones o cambios de punto de vista presentes en el dataset de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad de prediccion (PSNR, FVD, error de estado final), tasas de exito de politicas entrenadas sobre el modelo ni comparaciones cuantitativas con otros world models.

## Requisitos de hardware

- Pesos en bfloat16: aproximadamente 4,1 GB para 2.062 millones de parametros (2 bytes por parametro). El archivo `step_100000.pt` ocupa 3,9 GB y el repositorio completo 4,1 GB.
- VRAM de inferencia: no publicada por el autor. Como referencia orientativa, los pesos ocupan unos 4,1 GB en bf16 y las activaciones de un modelo de difusion de video con tres vistas a 3x180x320 y atencion espacio-temporal suelen dominar el consumo, por lo que el rango practico estimado seria de 8 a 16 GB para clips cortos en bf16, cifra no verificada.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40 u 80 GB) o H100 para inferencia holgada y para rollouts largos; no se documentan los recursos usados en el entrenamiento original (batch 2 con acumulacion 2 en bf16).
- GPU de consumo: cabe previsiblemente en una RTX 4090 de 24 GB y en tarjetas de 12-16 GB para clips cortos, siempre segun la estimacion anterior y no confirmada por el autor.
- Opciones de despliegue: no se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, que ademas no aplican a un modelo de difusion de video. La carga requiere PyTorch y el codigo de FastWAM para instanciar `model.mot` y `model.proprio_encoder`, ausente en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fastwam_droid_wan21_1p3b_step100k | 2,062 mil millones (bf16) | 128 tokens de texto; ventana de video no disponible | sin benchmarks publicados | apache-2.0 | pesos `.pt`, `config.yaml` y `dataset_stats.json` en HuggingFace |
| Wan-AI/Wan2.1-T2V-1.3B (modelo base) | 1,3 mil millones; 30 capas, hidden 1536, 12 cabezas | no disponible en la informacion | no disponible en la informacion | apache-2.0 segun los metadatos de este checkpoint | HuggingFace |
| Otros world models condicionados por accion entrenados sobre DROID | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion disponible no incluye ninguna comparativa del autor con alternativas de la misma categoria ni metricas que permitan situar el modelo frente a ellos.

## Limitaciones y advertencias

- El repositorio contiene unicamente pesos, `config.yaml`, `dataset_stats.json` y `trainer_state.json`; no incluye el codigo de FastWAM necesario para construir la arquitectura ni un pipeline de inferencia.
- Los pesos estan en `.pt` (pickle de PyTorch) y no en safetensors, por lo que conviene cargarlos con `weights_only=True`, como indica el propio autor.
- `dataset_stats.json` es obligatorio para la normalizacion de acciones y propiocepcion; omitirlo invalida los resultados de inferencia.
- Dominio muy restringido: entrenado sobre DreamZero-DROID-Data con 3 camaras concretas, resolucion 3x180x320 y acciones de 7 dimensiones. No hay garantia de transferencia a otras morfologias, camaras o tareas.
- Riesgo de deriva en horizontes largos: al ser un modelo generativo de video, los rollouts extensos pueden acumular inconsistencias fisicas; no se aportan metricas de fidelidad que acoten ese error.
- Sin validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin evaluacion independiente ni resultados reproducidos por terceros.
- Idiomas y condicionamiento textual: no documentados. Cualquier prompt nuevo exige el mismo encoder T5 (`wan21t2v13b`) utilizado para cachear los embeddings de entrenamiento.
- Licencia: la model card declara apache-2.0 para este checkpoint, lo que permite uso comercial, pero conviene verificar de forma independiente la licencia y las condiciones del modelo base Wan-AI/Wan2.1-T2V-1.3B antes de un despliegue productivo.
- Sesgos probables heredados del dataset de entrenamiento (entornos de laboratorio, morfologias y objetos concretos); la model card no documenta ningun analisis de sesgo.
- No se incluye el estado de optimizador y DeepSpeed (28 GB), por lo que no es posible reanudar el entrenamiento tal cual desde este repositorio.
- Fecha de publicacion segun metadatos: 22 de septiembre de 2026.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/angelic123/fastwam_droid_wan21_1p3b_step100k
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Papers, blogs, repositorios o demos: no disponible. Las busquedas web realizadas no devolvieron ningun resultado relacionado con este modelo ni con FastWAM.
