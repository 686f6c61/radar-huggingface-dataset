# Elvinky/pi05-piperx-round2-full558-value-human-1to1-step800-seed1000

## Resumen

Elvinky/pi05-piperx-round2-full558-value-human-1to1-step800-seed1000 es una politica robótica de tipo vision-language-action (VLA) derivada de PI05, publicada por el usuario Elvinky en Hugging Face bajo la librería LeRobot y con pipeline declarado como robotics. El modelo se ha afinado específicamente para una tarea de inserción de tornillos de cobre en un brazo PiperX, partiendo del inicializador original full558 PI05 SFT de 50.000 pasos (no es una continuación de la política previa de 1.511 pasos). El checkpoint corresponde a 800 actualizaciones de entrenamiento con semilla 1000.

El interés técnico del modelo está en su receta de datos: combina 502 episodios de demostración (1.132.703 fotogramas) con un pool de 491.500 fotogramas repartidos en 7.567 segmentos, que mezcla fotogramas seleccionados por valor (291.245), intervenciones humanas de la ronda 1 (124.147) y de la ronda 2 (76.108), usando exclusivamente fragmentos humanos con intervention=true. El entrenamiento se hizo con 4 GPU A800 en FP32 de todos los parámetros, sin AMP/TF32 ni compile y con gradient checkpointing activado.

Se trata de un artefacto de investigación muy especializado: 4.143.404.816 parámetros, 16,6 GB de repositorio, 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada y sin resultados de tasa de éxito publicados. La model card solo documenta una validación numérica de carga (recarga estricta de 813 tensores y decodificación de acciones finita con entradas reales), que el propio autor aclara que no constituye una afirmación de éxito en robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política VLA derivada de PI05 (segun tags y model card); el detalle interno de la arquitectura no se especifica en la informacion disponible: no disponible |
| Parametros totales | 4.143.404.816 (4,14 mil millones) |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible (la model card solo declara un horizonte de accion de 50 pasos) |
| Tipos de cuantizacion | No disponible (los pesos publicados estan en FP32; no se documentan variantes GGUF, INT8 o INT4) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria lerobot) |
| Autor | Elvinky |
| Fecha de creacion | 2026-09-16 |
| Ultima actualizacion | 2026-09-16 |
| Tamano del repositorio | 16,6 GB |
| Pipeline declarado | robotics |
| Dimension de acciones fisicas | 14 |
| Horizonte de acciones (action chunk) | 50 |
| Frameworks | LeRobot 0.6.1, PyTorch 2.11.0+cu128, Transformers 5.5.4 |
| SHA256 del modelo | 5e7af5ae6958a177e07b89d01b5450fafd16bcb67bf53c58ed45e25c4e735e04 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna (backbone, mecanismo de atencion, si emplea flow matching o decodificacion autorregresiva de acciones). Lo que si se documenta es que se trata de una política PI05 y que deriva de un inicializador "full558 PI05 SFT" de 50.000 pasos, sobre el cual se hace un fine-tuning nuevo en lugar de continuar la política anterior de 1.511 pasos. Los pesos de inferencia publicados incluyen tokenizer, procesadores y configuraciones; no se incluyen optimizador ni datos crudos, y todos los bytes originales de modelo y configuración permanecen sin cambios respecto al inicializador.

El entrenamiento se realizó con 800 actualizaciones sobre un batch global estricto de 64 muestras, compuesto por 32 anclas de demostración y 32 anclas seleccionadas/humanas. Los pools de datos son: Pool A con 502 episodios de demostración de entrenamiento (1.132.703 fotogramas) y Pool B con 491.500 fotogramas en 7.567 segmentos, de los cuales 291.245 son fotogramas seleccionados por valor (A50 positivo, Top10% global, ventanas W20), 124.147 son fotogramas de intervención humana de la ronda 1 y 76.108 de la ronda 2, usándose únicamente fragmentos humanos con intervention=true. Los episodios retenidos para validación de valor quedan excluidos de los pools de fine-tuning, aunque el inicializador SFT original sí vio el conjunto full558.

La configuración de entrenamiento es inusualmente conservadora en precisión: 4 GPU A800, FP32 en todos los parámetros, AMP/TF32/compile desactivados, gradient checkpointing activado, Adam con foreach=False, microbatch 4 por rango con acumulación 4 (64 efectivo por rango en 4 rangos), learning rate 2,5e-6 con warmup de 200 pasos y decaimiento coseno hasta 2,5e-7 en el paso 800. Las acciones se enmarcan en un horizonte de 50 con 14 dimensiones físicas, y las acciones de relleno (padding) se excluyen tanto de la pérdida como del denominador, mediante el campo de configuración propio de entrenamiento mask_action_padding_loss. La normalización del inicializador original no se modifica.

## Capacidades

- Generacion de acciones de manipulacion robotica: produce secuencias de accion (chunks) de hasta 50 pasos sobre 14 dimensiones fisicas, orientadas a control de un brazo PiperX.
- Ejecucion de una tarea de insercion de precision: insercion de tornillos de cobre (copper-screw insertion) en el montaje para el que fue afinado.
- Aprovechamiento de intervenciones humanas: el entrenamiento incorpora fragmentos de correccion humana (intervention=true) de dos rondas, lo que apunta a recuperacion ante estados de error corregidos por operador.
- Seleccion de datos por valor: la receta emplea fotogramas seleccionados por una funcion de valor (A50 positivo, Top10% global, ventanas W20), por lo que el modelo esta ajustado a trayectorias consideradas de alto valor.
- Integracion en el ecosistema LeRobot: compatible con LeRobot 0.6.1, PyTorch 2.11.0+cu128 y Transformers 5.5.4, con tokenizer, procesadores y configs incluidos.
- Carga y decodificacion validadas: recarga estricta de 813 tensores, normalizacion sin cambios y decodificacion de acciones finita con entradas reales.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso en lenguaje: no disponible (no se documentan capacidades conversacionales).
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible en la model card (el pipeline es robotics y la politica consume observaciones, pero no se detalla la composicion de modalidades).

## Casos de uso

- Insercion de tornillos de cobre en linea de montaje: es el caso directamente entrenado; la politica recibe observaciones del entorno y emite chunks de 50 acciones sobre 14 dimensiones para completar la insercion con un brazo PiperX. Adecuado porque la receta de datos incluye demostraciones e intervenciones humanas específicas de esa tarea.
- Punto de partida para fine-tuning de nuevas tareas de precision: al publicarse solo pesos de inferencia, tokenizer, procesadores y configs, puede usarse como inicializador para otras tareas de ensamblaje con el mismo hardware, recortando el coste de entrenar desde el SFT base de 50.000 pasos.
- Investigacion sobre seleccion de datos por valor: el checkpoint permite reproducir y comparar empiricamente la mezcla "Value-selected + intervenciones humanas" frente a entrenamientos con datos sin filtrar.
- Aprendizaje a partir de intervenciones humanas: util para estudiar como influyen las correcciones de operador (124.147 fotogramas de ronda 1 y 76.108 de ronda 2) en la robustez de la politica ante fallos de agarre o desalineacion.
- Evaluacion comparativa de politicas VLA en robots reales: sirve como linea base concreta (seed 1000, 800 updates) para medir el efecto de distintas semillas, inicializadores o presupuestos de actualizacion.
- Despliegue en laboratorio con LeRobot: la inclusion de tokenizer y procesadores junto a los pesos facilita levantar inferencia en un equipo con LeRobot 0.6.1, siempre que se apunten las rutas absolutas del tokenizer al directorio incluido.
- Generacion de datos sinteticos o de rollout para simulacion: usar la politica para producir trayectorias que alimenten evaluaciones offline antes de tocar hardware.
- Docencia y prototipado en robotica de manipulacion: ejemplo completo de fine-tuning de una politica VLA con receta de datos documentada paso a paso (pools, batch, LR, hardware).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta validaciones de tipo numérico y de carga, que el propio autor califica explicitamente como "no una afirmacion de tasa de exito en robot":

| Validacion | Resultado |
|---|---|
| Recarga estricta de tensores | 813 tensores, correcta |
| Normalizacion | Sin cambios respecto al inicializador |
| Decodificacion de acciones con entradas reales | Finita (finita/numerica correcta) |
| Tasa de exito en robot (success rate) | No disponible |
| Benchmarks tipo MMLU, HumanEval, GSM8K | No aplicable / no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 16,6 GB solo de pesos (el tamano del repositorio coincide con esa magnitud). Es la precision del entrenamiento, pero no la unica opcion de despliegue.
- Precision reducida: en FP16/BF16 los pesos de 4,14 mil millones de parametros ocupan aproximadamente 8,3 GB; en INT8 unos 4,1 GB; en INT4 unos 2,1 GB. Son estimaciones de calculo sobre el numero de parametros, no valores publicados por el autor, y hay que anadir el coste de activaciones y del codificador visual si la politica lo incorpora.
- GPU recomendadas: A800, A100 (40/80 GB) o H100 (80 GB) para reproducir el entorno de entrenamiento o servir con margen amplio; una unica A100 de 40 GB es suficiente para pesos en FP32 mas activaciones.
- GPU de consumo: si, cabe en tarjetas de 24 GB como RTX 4090, RTX 3090 o L4/L40S en FP16/BF16 (unos 8,3 GB de pesos). En tarjetas de 16 GB el margen es ajustado en FP16 y probablemente requiera INT8.
- Opciones de despliegue: LeRobot 0.6.1 con PyTorch 2.11.0+cu128 y Transformers 5.5.4, que es la combinacion declarada. No se documenta soporte para vLLM, TGI, Ollama o llama.cpp; tratandose de una politica de control y no de un modelo de lenguaje de proposito general, esas rutas no aplican salvo conversion propia.
- Latencia y throughput: no disponible. Lo unico relevante para planificacion es el horizonte de accion de 50 pasos y las 14 dimensiones de accion fisica.
- Nota de compatibilidad: el campo de configuracion mask_action_padding_loss es exclusivo de entrenamiento y puede requerir un cargador de configuracion compatible; las rutas absolutas del tokenizer deben redirigirse al directorio empaquetado en la maquina de despliegue.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la informacion proporcionada (ni parametros, ni contexto, ni rendimiento de alternativas). Como categorias de comparacion plausibles dentro de las politicas VLA para manipulacion se podrian considerar PI05/pi0, OpenVLA o GR00T N1, pero no se han facilitado sus especificaciones, por lo que cualquier cifra seria inventada.

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-piperx-round2-full558-value-human-1to1-step800-seed1000 | 4.143.404.816 | Horizonte de accion 50; contexto no disponible | Sin tasa de exito publicada | No disponible | Hugging Face, 0 descargas, 0 likes |
| Alternativas VLA comparables (PI05/pi0, OpenVLA, GR00T N1, etc.) | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Especificidad extrema de tarea: la politica esta afinada para insercion de tornillos de cobre en un brazo PiperX; no hay evidencia de generalizacion a otras tareas, objetos o morfologias.
- Sin tasa de exito publicada: la unica validacion reportada es numerica (recarga de 813 tensores y decodificacion de acciones finita). El autor advierte explicitamente que no es una afirmacion de exito en robot, por lo que el rendimiento real es desconocido.
- Licencia no disponible: al no declararse licencia, no hay autorizacion explicita de uso comercial y el uso en produccion queda en un limbo legal. Hay que contactar con el autor antes de cualquier despliegue comercial.
- Idiomas no disponibles: no se documenta soporte de instrucciones en lenguaje natural ni multilingue; si el modelo acepta condicionamiento textual, el idioma no esta especificado.
- Checkpoint no reanudable exactamente: la model card indica que no es un "exact-resume checkpoint"; incluye solo pesos de inferencia, tokenizer, procesadores y configuraciones, sin optimizador ni datos crudos. No sirve para continuar el entrenamiento tal cual.
- Fugas potenciales en la receta de datos: los episodios retenidos para validacion de valor se excluyen de los pools de fine-tuning, pero el inicializador SFT original si vio el conjunto full558, lo que complica la interpretacion de cualquier evaluacion sobre esos episodios.
- Fricciones de carga: el campo mask_action_padding_loss puede exigir un cargador de configuracion compatible, y las rutas absolutas del tokenizer deben reescribirse; un cargador estandar puede fallar o cargar la configuracion de forma incompleta.
- Sin trazabilidad de evaluacion: 0 descargas y 0 likes, sin demo, sin paper y sin resultados de benchmarks; no hay validacion independiente por terceros.
- Riesgo de sobreajuste al esquema de acciones: el entrenamiento excluye las acciones con padding de la perdida y del denominador, de modo que el modelo esta optimizado para las 14 dimensiones fisicas declaradas; fuera de ese esquema el comportamiento no esta caracterizado.
- Coste de hardware: 16,6 GB de pesos en FP32 y un entrenamiento hecho en 4 GPU A800 implican barreras de reproduccion y de inferencia que no encajan en entornos domésticos sin cuantizacion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Elvinky/pi05-piperx-round2-full558-value-human-1to1-step800-seed1000
- Paper: no disponible
- Blog o articulo tecnico del autor: no disponible
- Repositorio de codigo: no disponible
- Demo o space: no disponible
- Busqueda web: los resultados recuperados no guardan relacion con el modelo ni con robotica (contenido sobre alergias estacionales y horoscopos), por lo que se descartan como fuentes. No se han encontrado enlaces relevantes adicionales.
