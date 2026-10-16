# Donghyun1228/pi05-libero-support-probe-source-target-lora01-view-large-n100000-1000-20261015

## Resumen

Este repositorio es un checkpoint de investigación publicado por el usuario Donghyun1228 en Hugging Face, construido sobre la librería openpi y clasificado con el pipeline "robotics". Se trata de un adaptador LoRA (denominado lora01 en el nombre del repo) sobre un modelo de visión-lenguaje-acción de la familia pi05, ajustado para una tarea de dinámica inversa (inverse dynamics model, IDM) dentro del benchmark de manipulación robótica LIBERO. El nombre del repositorio condensa la configuración experimental: 100.000 fotogramas seleccionados, 1.000 actualizaciones de entrenamiento, batch de 32, semilla 42 y la variante de datos "view_large".

No es un modelo de lenguaje de propósito general ni un asistente conversacional: es un artefacto de investigación en robótica que produce acciones de control para un brazo manipulador a partir de observaciones visuales, evaluado en simulación con MuJoCo 3.2.3 y exportado en BF16 desde el paso 999. Su interés es muy acotado: documenta una receta concreta de sustitución de datos por sondeo aleatorio cercano al soporte, con un entrenamiento de adaptación del IDM y una evaluación controlada de 2.000 episodios.

La relevancia actual es metodológica más que de producto. El autor publica de forma explícita las referencias de commit del checkpoint origen y del dataset, además de evidencia de entrada, inicialización y exportación, lo que facilita reproducir el experimento. Con 0 descargas y 0 "likes" en el momento de la consulta, y sin métricas publicadas más allá del éxito en LIBERO, debe tratarse como material de laboratorio y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de vision-lenguaje-accion (VLA) de la familia pi05 (openpi); la model card no detalla la topologia interna. Se documenta un LLM congelado, un modulo de vision con actualizacion completa y un "action expert" con adaptador LoRA |
| Parametros totales | no disponible (el repo ocupa 6,9 GB; a BF16 eso equivaldria a unos 3.400 millones de parametros, calculo estimado y no declarado por el autor) |
| Parametros activos | no aplica (no se describe una arquitectura Mixture of Experts) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 para inferencia (unico formato documentado); no se mencionan GGUF, INT8, INT4 ni otras cuantizaciones |
| Idiomas soportados | no disponible (el autor no declara idiomas; el modelo opera sobre instrucciones de tareas de LIBERO, no sobre texto libre) |
| Licencia | apache-2.0 |
| Formato de pesos | Exportacion "raw step999" en BF16; el formato de fichero no se declara explicitamente en la model card (se asume safetensors por el ecosistema openpi, sin confirmacion) |
| Biblioteca | openpi |
| Pipeline declarado | robotics |
| Tamano del repositorio | 6,9 GB |
| Dataset de entrenamiento | Donghyun1228/libero-support-random-waypoint-300k-20261015 (commit 32ed215baf01af7e82f927a62b108873aa70bd19) |
| Checkpoint origen | Donghyun1228/pi05-libero-support-probe-source-n100000-10000-20261015 (commit e435806e413a90c3b74c9411228a72b53b97060c) |
| Entorno de evaluacion | MuJoCo 3.2.3 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de tres componentes operativos: un LLM que permanece congelado durante la adaptacion, un modulo de vision que se actualiza por completo y un "action expert" al que se aplica el adaptador LoRA lora01. El ajuste se realiza sobre un checkpoint origen que el propio autor habia reentrenado previamente durante 10.000 actualizaciones, referenciado por commit. Se preservan la normalizacion historica y el encoder de muneca ("wrist encoder") del modelo origen, lo que indica que la adaptacion no rompe la calibracion original de entradas.

El entrenamiento de esta variante consiste en una adaptacion del modelo de dinamica inversa sobre 100.000 fotogramas seleccionados, con 1.000 actualizaciones, batch de 32 y semilla 42. La perdida del IDM excluye la coordenada 6 (el gripper) y promedia las 31 coordenadas de accion restantes tras el padding; sin embargo, las entradas y salidas de la politica y el control del gripper durante la evaluacion conservan las siete coordenadas del robot. El adaptador LoRA se aplica solo al action expert, con un multiplicador posterior al optimizador Adam de 0,1, una eleccion que sugiere un ajuste deliberadamente conservador para no desplazar en exceso los pesos preentrenados. La exportacion corresponde al paso 999 y la inferencia se realiza en BF16.

El detalle metodologico mas destacable es el uso de datos de sondeo aleatorio cercanos al soporte ("support-near random-probe data replacement") en la variante view_large, es decir, una estrategia de sustitucion de datos orientada a cubrir la region del espacio de estados proxima al soporte de la distribucion de entrenamiento. No se documentan en la informacion disponible fases de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de acciones de control para manipulacion robotica: el modelo actua como politica visomotora y como modelo de dinamica inversa sobre observaciones visuales del entorno LIBERO.
- Prediccion de trayectorias de accion en siete coordenadas del robot, con tratamiento diferenciado de la coordenada del gripper (excluida de la perdida del IDM, pero conservada en la politica y en la evaluacion).
- Procesamiento de observaciones visuales, incluida la vista de muneca, gracias al encoder preservado del modelo origen.
- Condicionamiento por tarea: la evaluacion se realiza sobre 40 tareas distintas de LIBERO, lo que implica cierta capacidad de generalizacion entre tareas dentro del benchmark.
- Inferencia en BF16 con exportacion "raw step999", apta para integracion en el runtime de openpi.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingues, modo de razonamiento explicito, vision general, audio ni ninguna otra capacidad fuera del dominio robotico simulado.
- No se documenta capacidad de operar en robots reales; toda la evidencia de evaluacion es en simulacion con MuJoCo 3.2.3.

## Casos de uso

- Reproduccion de experimentos de investigacion en VLA: sirve como checkpoint de referencia para replicar la receta de sustitucion de datos por sondeo aleatorio cercano al soporte, ya que el autor publica commits exactos de origen y dataset.
- Estudio de adaptadores LoRA sobre el action expert: permite analizar como afecta un LoRA con multiplicador posterior a Adam de 0,1 al rendimiento de una politica preentrenada, manteniendo el LLM congelado.
- Benchmarking de modelos de dinamica inversa en LIBERO: con 937 exitos sobre 2.000 episodios en 40 tareas, ofrece una linea base cuantificada para comparar variantes de seleccion de datos.
- Analisis de sensibilidad al azar en evaluacion de politicas: el autor documenta que la aleatoriedad de la politica usa un flujo compartido en el servidor, lo que resulta util para estudiar reproducibilidad de evaluaciones con semilla fija (seed 7) y ocho clientes por GPU.
- Investigacion sobre preservacion de normalizacion historica: el modelo conserva la normalizacion y el encoder de muneca del checkpoint origen, por lo que es un caso de estudio sobre transferencia de calibracion entre checkpoints.
- Docencia y divulgacion tecnica en robotica: al ser un artefacto pequeno y con licencia permisiva, puede usarse en cursos o talleres para ilustrar el pipeline completo openpi-MuJoCo sin necesidad de infraestructura de gran escala.
- Desarrollo de infraestructura de evaluacion paralela: el esquema de ocho clientes por GPU y 50 ensayos por tarea es reutilizable como plantilla para arneses de evaluacion distribuida en simulacion.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible corresponden a la evaluacion en LIBERO descrita por el autor:

| Metrica | Valor |
|---|---|
| Exitos | 937 |
| Episodios totales | 2.000 |
| Tasa de exito | 46,85 % (calculado a partir de 937/2.000) |
| Tareas | 40 |
| Ensayos por tarea | 50 |
| Semilla de evaluacion | 7 |
| Configuracion de ejecucion | 8 clientes por GPU, flujo de aleatoriedad compartido en servidor |
| Entorno | MuJoCo 3.2.3 |
| Actualizaciones de entrenamiento de esta variante | 1.000 (batch 32, semilla 42) |
| Checkpoint exportado | paso 999, BF16 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark de lenguaje, codigo o razonamiento, ya que el modelo no esta orientado a esas tareas. Tampoco se proporcionan comparaciones numericas contra el checkpoint origen ni contra otras variantes de la misma familia.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 6,9 GB, por lo que los pesos en BF16 requieren del orden de 7 GB; sumando activaciones del encoder visual y del action expert, una estimacion conservadora se situa entre 10 y 16 GB para inferencia. Es una estimacion propia: el autor no publica requisitos de hardware.
- GPU recomendadas: no disponible en la model card. Por tamano, el modelo es compatible con GPU de gama alta para consumidor, aunque el autor menciona ocho clientes por GPU en la evaluacion, lo que sugiere el uso de aceleradores de datacenter.
- Compatibilidad con GPU de consumidor: probable en tarjetas con 16 GB o mas (por ejemplo, RTX 4090 con 24 GB), siempre que el runtime de openpi y las dependencias de simulacion encajen en memoria. No hay confirmacion oficial.
- Opciones de despliegue: runtime de openpi para la politica, y MuJoCo 3.2.3 para la evaluacion en simulacion. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de accion robotica.
- Latencia y throughput: no disponible. El unico dato relacionado es la configuracion de evaluacion con ocho clientes por GPU, que no permite derivar cifras de latencia por episodio.

## Comparativa con modelos similares

La informacion disponible no incluye comparaciones numericas con otros modelos. Como referencia cualitativa, el pariente mas directo es el propio checkpoint origen del mismo autor, sobre el que se aplica esta adaptacion:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (lora01, view_large) | no disponible | no disponible | 46,85 % de exito en LIBERO (937/2.000) | apache-2.0 | Hugging Face |
| pi05-libero-support-probe-source-n100000-10000 (checkpoint origen) | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible | Hugging Face |
| Modelo base pi05 de openpi | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible | Repositorio openpi |
| Otros VLA de robotica (OpenVLA, RDT, GR00T, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa fiable con alternativas de la misma categoria.

## Limitaciones y advertencias

- Dominio extremadamente restringido: el modelo solo se ha evaluado en tareas de manipulacion del benchmark LIBERO en simulacion; no hay evidencia de transferencia a robot real ni a entornos fuera de ese conjunto de 40 tareas.
- Tasa de exito moderada: 937 exitos sobre 2.000 episodios implican que mas de la mitad de los intentos fallan en el entorno evaluado; no es adecuado para aplicaciones que exijan alta fiabilidad.
- Sesgos del dataset: al entrenarse sobre datos generados en LIBERO (objetos, disposiciones y fisicas del simulador), hereda los sesgos de ese entorno simulado. No se documenta ningun analisis de sesgo.
- Riesgo de alucinacion: en el sentido habitual del termino no aplica a un modelo de accion, pero si existe riesgo de predicciones de accion inconsistentes cuando la observacion se aleja de la distribucion de entrenamiento, precisamente el problema que la receta de datos intenta mitigar.
- Falta de documentacion: no se declaran parametros totales, longitud de contexto, idiomas, formato exacto de pesos ni requisitos de hardware, lo que dificulta planificar un despliegue.
- Licencia: se declara apache-2.0, permisiva para uso comercial, pero la ficha no aclara la licencia de los pesos base de pi05/openpi sobre los que se construye; conviene verificarla antes de cualquier uso en produccion.
- Artefacto de investigacion: con 0 descargas y 0 valoraciones, y sin mantenimiento documentado, no hay garantia de soporte, actualizaciones ni correccion de errores.
- Dependencia de versiones concretas: la evaluacion se realizo con MuJoCo 3.2.3, y el autor fija commits especificos del checkpoint origen y del dataset; cambios de version pueden alterar los resultados.
- Reproducibilidad parcial: la aleatoriedad de la politica depende de un flujo compartido en el servidor, por lo que replicar exactamente la evaluacion exige reproducir esa configuracion concreta.
- Exclusion del gripper en la perdida del IDM: la coordenada 6 se excluye del calculo de perdida, lo que puede introducir asimetrias de comportamiento entre el control del gripper y el resto de coordenadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-support-probe-source-target-lora01-view-large-n100000-1000-20261015
- Checkpoint origen citado por el autor: https://huggingface.co/Donghyun1228/pi05-libero-support-probe-source-n100000-10000-20261015
- Dataset citado por el autor: https://huggingface.co/datasets/Donghyun1228/libero-support-random-waypoint-300k-20261015
- Repositorio de la libreria openpi (referencia del ecosistema usado): https://github.com/Physical-Intelligence/openpi
- No se han encontrado en la busqueda web enlaces adicionales relevantes sobre este modelo; los resultados devueltos no guardaban relacion con el contenido tecnico del repositorio y se omiten.
