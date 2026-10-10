# liorbenhorin-nv/so101_vials_dr_procedural_layout_aware_250ep_20261009_GR00T17_20k

## Resumen

Este repositorio contiene una politica de robotica (vision-language-action) resultado del ajuste fino del modelo base NVIDIA GR00T N1.7-3B sobre el conjunto de datos simulado "SO-101 procedural layout-aware DR" (250 episodios, 90.549 fotogramas). Lo publica el usuario de HuggingFace `liorbenhorin-nv` y esta pensado para controlar un brazo robotico SO-101 dentro del ecosistema LeRobot. El entrenamiento se realizo durante 20.000 pasos de optimizador sobre cuatro GPU RTX PRO 6000 Blackwell, con un lote global de 64 y semilla 42.

El problema que aborda es el de generar acciones de manipulacion (brazo y pinza) a partir de observaciones visuales y, en principio, instrucciones de lenguaje, con un fuerte enfasis en la variabilidad de escenas: el dataset emplea randomizacion de dominio "procedural layout-aware", es decir, variacion sistematica de la disposicion de los objetos para mejorar la generalizacion. El modelo tiene 3.144.016.000 parametros (unos 3,14 mil millones) y un tamano de repositorio de 12,6 GB, coherente con pesos almacenados en FP32.

Es relevante ahora porque forma parte de la primera generacion de politicas VLA abiertas aplicadas a un robot de bajo coste (SO-101) y porque el autor publica la trazabilidad completa del entrenamiento (commits, revisiones de dataset y del modelo base, fichero de procedencia). Sin embargo, el propio autor advierte de que la politica **no ha sido evaluada todavia**, por lo que debe considerarse un artefacto de investigacion, no un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada del modelo base NVIDIA GR00T N1.7-3B; detalles internos del backbone no disponibles en la informacion proporcionada |
| Parametros totales | 3.144.016.000 (aproximadamente 3,14 mil millones) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio contiene safetensors y su tamano (12,6 GB) es coherente con pesos en FP32 (4 bytes por parametro) |
| Idiomas soportados | No disponible; el ajuste de la torre de lenguaje se desactivo durante el entrenamiento ("language tuning disabled") |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de una politica de robotica del tipo vision-language-action construida sobre `nvidia/GR00T-N1.7-3B` (revision del modelo base `2fc962b973bccdd5d8ce4f67cc63b264d6886495`; revision del backbone `9ce19a195e423419c349abfc86fd07178b230561`). La model card no describe la arquitectura interna mas alla del nombre del modelo base, por lo que no se detallan aqui aspectos como el tipo de cabeza de acciones o el mecanismo de atencion: esa informacion no esta disponible en el material proporcionado.

El entrenamiento se ejecuto con Accelerate sobre cuatro GPU RTX PRO 6000 Blackwell, con lote de 16 por GPU (lote global 64) y semilla 42, durante 20.000 pasos de optimizador. Se activo el ajuste visual y se desactivo el ajuste de lenguaje. Se uso autocast BF16 con parametros del modelo en FP32, aumento de imagen y AdamW fusionado con tasa de aprendizaje 0,0001, 1.000 pasos de calentamiento y planificador coseno. La representacion de acciones combina acciones relativas para el brazo y absolutas para la pinza, con una ventana de accion de 16 pasos. El envoltorio `groot_fast_train` (rama `perf/groot-fast-train`, commit `07be46c3c3da9561e5d407135594d109f10efe62`) habilita solapamiento de preprocesado y AdamW fusionado. Se conservan checkpoints nativos y estados del optimizador en los pasos 10.000 y 20.000; este repositorio contiene unicamente la politica final de 20.000 pasos.

El conjunto de datos de entrenamiento es `liorbenhorin-nv/so101_vials_dr_procedural_layout_aware_250ep_20261009` (revision `b9018e04401a8dee9fd777908db777760a8bb64f`, commit de recoleccion `465ca4c3fef3ef02fc3cc39f4b41d31ffb2577c1`) y consta de 250 episodios y 90.549 fotogramas generados mediante randomizacion de dominio con variacion de disposicion. La model card recomienda mantener juntos todos los ficheros nativos de politica y procesador, y remite a `training-provenance.json` para la procedencia exacta.

## Capacidades

- Generacion de acciones de manipulacion para un brazo robotico SO-101 dentro del ecosistema LeRobot.
- Control combinado de brazo (acciones relativas) y pinza (acciones absolutas) con ventana de 16 pasos.
- Percepcion visual: el entrenamiento incluye ajuste visual y aumento de imagen, por lo que la politica consume observaciones de camara.
- Ejecucion de tareas sobre escenas con disposiciones de objeto variadas, gracias al entrenamiento sobre un dataset con randomizacion de dominio "layout-aware".
- Tareas de manipulacion relacionadas con viales, segun se deduce del nombre del dataset y del repositorio (no se detalla el conjunto exacto de tareas en la informacion proporcionada).
- Soporte de tool calling / function calling: no disponible; es una politica de robotica, no un modelo de lenguaje conversacional.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el ajuste de la torre de lenguaje se desactivo.
- Modo "thinking", vision de proposito general o audio: no disponibles.

## Casos de uso

- Manipulacion de viales en laboratorio automatizado: la politica puede generar las acciones de brazo y pinza necesarias para colocar, mover o reorganizar viales sobre una superficie, aprovechando que fue entrenada sobre 250 episodios especificos de este dominio.
- Investigacion en politicas VLA para robots de bajo coste: sirve como punto de partida reproducible (semilla, commits y procedencia documentados) para estudiar como afecta la randomizacion de dominio procedimental al rendimiento de un VLA de ~3B parametros.
- Comparacion de checkpoints de entrenamiento: al existir checkpoints en los pasos 10.000 y 20.000, permite analizar la evolucion del aprendizaje y el posible sobreajuste en funcion del presupuesto de optimizacion.
- Base para ajuste fino adicional: el repositorio se distribuye en formato LeRobot con safetensors, lo que facilita reentrenar sobre nuevos datasets de manipulacion con el mismo robot SO-101.
- Evaluacion de transferencia simulacion-a-realidad: al proceder de datos simulados, es un candidato natural para medir el gap sim-to-real antes de invertir en recoleccion de datos reales.
- Banco de pruebas para infraestructura de entrenamiento: los commits de envoltorio (`perf/groot-fast-train`) y la configuracion multirresolucion documentan un pipeline de entrenamiento con solapamiento de preprocesado y AdamW fusionado, reutilizable como referencia tecnica.
- Docencia y demostraciones de robotica: su tamano (~3B parametros) y su integracion con LeRobot lo hacen util para cursos y prototipos de manipulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "This policy has not yet been evaluated". Por tanto, no se dispone de tasas de exito, metricas de error de accion ni comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

- VRAM en FP32: aproximadamente 12,6 GB solo para pesos (4 bytes por parametro sobre 3.144.016.000 parametros). Estimacion calculada a partir del tamano del repositorio; no confirmada por el autor.
- VRAM en BF16: aproximadamente 6,3 GB para pesos, mas memoria para activaciones y buffers de inferencia. Estimacion, no confirmada.
- Entrenamiento: cuatro RTX PRO 6000 Blackwell, segun la model card. No se especifica el uso de memoria por GPU.
- GPU recomendadas para inferencia: no disponibles en la informacion proporcionada. Por tamano, una GPU con 16-24 GB de memoria seria razonable; no obstante, es una estimacion no verificada.
- Idoneidad en GPU de consumo: no confirmada. Una RTX 4090 (24 GB) seria teoricamente suficiente por capacidad de memoria segun las estimaciones anteriores, pero no hay validacion publicada.
- Opciones de despliegue: libreria `lerobot` con safetensors; el stack del modelo base NVIDIA GR00T N1.7 es el entorno de referencia. Los servidores de inferencia para LLM (vLLM, TGI) no son aplicables a una politica de robotica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificados de rendimiento para establecer una comparativa cuantitativa. La tabla siguiente recoge unicamente lo que puede afirmarse a partir de la informacion proporcionada y marca como "no disponible" el resto de campos.

| Modelo | Relacion | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| liorbenhorin-nv/so101_vials_dr_procedural_layout_aware_250ep_20261009_GR00T17_20k (este modelo) | Politica ajustada | 3.144.016.000 | No disponible | No evaluado | No disponible |
| nvidia/GR00T-N1.7-3B | Modelo base | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible |
| Otras politicas VLA abiertas (por ejemplo OpenVLA, pi0, SmolVLA) | Alternativas de categoria | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El autor declara explicitamente que la politica "has not yet been evaluated": no hay evidencia publicada de su tasa de exito ni de su comportamiento en tiempo de ejecucion.
- Sobreajuste al dominio simulado: el entrenamiento usa 250 episodios y 90.549 fotogramas de simulacion con randomizacion de disposicion; el gap respecto al mundo real no esta medido.
- El ajuste de la torre de lenguaje se desactivo, por lo que la generalizacion a instrucciones nuevas depende enteramente del modelo base y no fue refinada en este ajuste.
- Licencia no declarada: al no especificarse licencia en el repositorio, existe incertidumbre legal para cualquier uso comercial o redistribucion. Debe consultarse al autor y revisar la licencia del modelo base NVIDIA GR00T N1.7-3B.
- Ambito muy estrecho: es una politica para un robot concreto (SO-101) y un conjunto de tareas concreto (manipulacion de viales en simulacion). No es un modelo de lenguaje de proposito general ni sirve para tareas fuera de ese dominio.
- Los ficheros de politica y procesador deben mantenerse juntos; mezclarlos o renombrarlos puede romper la compatibilidad con LeRobot.
- Solo se publica el checkpoint del paso 20.000; los estados del optimizador de los pasos 10.000 y 20.000 quedan en la instancia de entrenamiento y no estan en este repositorio, lo que limita la reproducibilidad exacta del ajuste.
- Riesgo de alucinacion: no aplica en el sentido linguistico habitual, pero si existe riesgo de acciones fisicamente invalidas o inseguras en ejecucion real, agravado por la ausencia de evaluacion.
- Sesgos conocidos y validacion de la comunidad: no disponibles. El repositorio cuenta con 11 descargas y 0 "likes" en el momento de la consulta, es decir, no ha sido validado por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liorbenhorin-nv/so101_vials_dr_procedural_layout_aware_250ep_20261009_GR00T17_20k
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/liorbenhorin-nv/so101_vials_dr_procedural_layout_aware_250ep_20261009
- Libreria LeRobot: https://github.com/huggingface/lerobot
- Fichero de procedencia del entrenamiento: `training-provenance.json` (incluido en el repositorio del modelo)
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada
