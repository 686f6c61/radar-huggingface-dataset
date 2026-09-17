# NaaaaaiVe6/franka-10demos-normal_task14_cartesian_20260913T212156Z-step-6000

## Resumen

Este repositorio contiene un checkpoint de politica robotica para un brazo Franka, publicado por el usuario NaaaaaiVe6 bajo la libreria `openpi` y con las etiquetas `openpi`, `pi05`, `robotics` y `safetensors`. Se trata de un modelo de vision-lenguaje-accion (VLA) orientado a control cartesiano: recibe imagenes y estado del robot y emite directamente comandos de accion en forma de posicion cartesiana absoluta y cuaternion, no incrementos de controlador. El identificador del repositorio sugiere un entrenamiento con 10 demostraciones sobre una tarea concreta (task14) y corresponde al paso 6000.

El problema que resuelve es el de generar trayectorias de manipulacion a partir de politicas aprendidas por imitacion, un caso de uso central en investigacion en robotica. El checkpoint fue convertido de JAX a PyTorch en `bfloat16` manteniendo la configuracion original de entrenamiento del modelo Franka. Cuenta con 3.616.757.520 parametros (unos 3,62 mil millones) y el repositorio ocupa 7,2 GB.

Su relevancia es limitada y muy especializada: se publica como artefacto de experimentacion, con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada y sin resultados de benchmarks. Es util para quien trabaje con el ecosistema `openpi` y quiera reproducir, evaluar o continuar el entrenamiento de esta politica concreta, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; las etiquetas (`openpi`, `pi05`) lo situan en la familia de modelos de politica robotica VLA de openpi |
| Parametros totales | 3.616.757.520 (~3,62 mil millones) |
| Parametros activos | no aplica; no hay indicios de que sea un modelo de mezcla de expertos |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (convertido de JAX a PyTorch en bfloat16) |
| Tamano del repositorio | 7,2 GB |
| Biblioteca | openpi |
| Pipeline declarado | robotics |
| Paso de entrenamiento | 6000 |
| Representacion de acciones | cartesiana absoluta XYZ + cuaternion xyzw + pinza binaria (-1 / +1); no son acciones delta de controlador |
| Forma de salida | 50 pasos y 32 coordenadas; solo las 8 primeras coordenadas corresponden a acciones del robot |
| Normalizacion | requiere `assets/franka/norm_stats.json` y las transformaciones de entrenamiento correspondientes |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-16 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de la conversion de JAX a PyTorch en `bfloat16` con la configuracion original del modelo de entrenamiento Franka. Las etiquetas apuntan al ecosistema `openpi` y a la variante `pi05`, lo que encaja con un modelo de politica que combina un codificador visual y de estado con un modulo generador de acciones. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste por preferencias (RLHF/DPO), algo poco habitual en politicas de imitacion robotica.

El detalle mas relevante tecnicamente, y el unico documentado con precision, es el formato de accion: el modelo produce un bloque de 50 pasos temporales con 32 coordenadas cada uno, de las cuales solo las 8 primeras son acciones efectivas del robot. La accion se expresa como posicion cartesiana absoluta mas cuaternion (xyzw) mas un valor binario de pinza (-1/+1). La model card insiste en que no son acciones delta de controlador, lo que implica que el consumidor del modelo debe integrar estas salidas contra el controlador adecuado. Se requiere ademas aplicar la normalizacion con `assets/franka/norm_stats.json` y las transformaciones de entrenamiento originales; el archivo `log.txt` del repositorio detalla el layout de salida, el limite de normalizacion, las entradas de camara y estado, y las convenciones del controlador que quedan pendientes de confirmacion.

No se documenta ninguna innovacion adicional como decodificacion especulativa, atencion lineal ni modos de razonamiento explicito. El identificador del repositorio (`10demos`, `task14`, `cartesian`, `step-6000`) sugiere un ajuste fino sobre 10 demostraciones de una unica tarea, pero este dato no esta confirmado en la model card.

## Capacidades

- Generacion de acciones de manipulacion robotica: produce bloques de 50 pasos con 8 coordenadas de accion por paso, en formato cartesiano absoluto mas cuaternion mas pinza binaria.
- Control de un brazo Franka: la configuracion de entrenamiento y las estadisticas de normalizacion publicadas son especificas de la plataforma Franka.
- Consumo de entradas visuales y de estado: segun `log.txt`, el modelo espera entradas de camara y de estado del robot, aunque su disposicion exacta no se detalla en la model card.
- Aprendizaje por imitacion de tarea unica: el checkpoint esta orientado a una tarea concreta (task14), no a proposito general.
- Soporte de tool calling / function calling: no aplicable, no es un modelo de lenguaje conversacional.
- Soporte de agentes y razonamiento multi-paso en lenguaje natural: no disponible, fuera del alcance del modelo.
- Capacidades multilingues: no disponible / no aplicable.
- Modo de razonamiento explicito (`thinking`), vision para descripcion, audio: no disponible.

## Casos de uso

- Manipulacion con Franka en laboratorio: el modelo emite acciones cartesianas absolutas y estado de pinza, por lo que puede conectarse directamente a un controlador cartesiano de un Franka Emika Panda o FR3 para ejecutar la tarea task14 una vez aplicada la normalizacion de `norm_stats.json`.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar como se comporta una politica entrenada con un numero reducido de demostraciones y para medir su generalizacion fuera de la distribucion de entrenamiento.
- Reproduccion de experimentos del ecosistema openpi: al estar convertido a PyTorch en `bfloat16`, permite cargar el checkpoint sin la cadena de herramientas JAX original y comparar su comportamiento con la version previa a la conversion.
- Ajuste fino sobre nuevas tareas: el checkpoint puede usarse como inicializacion para reentrenar con demostraciones adicionales de otras tareas, aprovechando los 3,62 mil millones de parametros ya ajustados al dominio Franka.
- Evaluacion de robustez de politicas: permite medir deriva, sobreajuste a las 10 demostraciones y sensibilidad a pequenos cambios de posicion inicial o iluminacion antes de desplegar una politica similar en un montaje real.
- Pruebas de integracion de pipeline robotico: util para validar el enlace entre el modelo, el normalizador y el controlador cartesiano (incluida la convencion de cuaternion) en un banco de pruebas, sin necesidad de entrenar desde cero.
- Docencia y divulgacion en robotica: al ser un checkpoint pequeno (7,2 GB) y con pesos en `safetensors`, es viable ejecutarlo en una GPU de gama alta de consumo para demostraciones en aula o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito en simulacion ni en robot real, ni comparaciones con otras politicas.

## Requisitos de hardware

- VRAM para inferencia: los pesos en `bfloat16` ocupan aproximadamente 7,2 GB (coincide con el tamano del repositorio). Con activaciones intermedias, buffers de normalizacion y procesamiento de imagenes, una estimacion razonable es de 10 a 12 GB en `bfloat16`. En `float32` los pesos solos serian de unos 14,5 GB; no se publican pesos en ese formato.
- GPU de gama alta de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) con holgura; en RTX 4080 (16 GB) y RTX 3060 (12 GB) el margen es ajustado en `bfloat16`.
- GPU de centro de datos: A100 40/80 GB, H100, L40S o RTX A6000 sin problemas de capacidad. No se dispone de cifras de latencia ni de throughput para ninguna de ellas.
- CPU: la ejecucion en CPU es teoricamente posible, pero no hay datos de rendimiento y resulta poco realista para control en tiempo real.
- Opciones de despliegue: la libreria declarada es `openpi` (con pesos PyTorch en `safetensors` y opcion de cargar los originales en JAX). No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni formatos GGUF, que son runtimes orientados a modelos de lenguaje y no a politicas de accion.
- Latencia y throughput: no disponibles. En una politica con horizonte de 50 pasos, la latencia efectiva depende de la frecuencia de control del Franka y del ritmo al que se reejecuta la politica, datos que no se proporcionan.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento de este checkpoint ni de sus alternativas, por lo que la comparacion se limita a la categoria y al tipo de artefacto.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (Franka cartesiano, paso 6000) | 3,62 mil millones | no disponible | no disponible | Publico en HuggingFace, 0 descargas |
| Modelos base de la familia openpi (etiqueta `pi05`) | no disponible | no disponible | no disponible | Repositorios publicos del ecosistema openpi |
| OpenVLA y variantes de politica VLA de proposito general | no disponible | no disponible | no disponible | Publicos, con soporte de comunidad mas amplio |
| Octo y politicas de manipulacion de menor tamano | no disponible | no disponible | no disponible | Publicos |

Nota metodologica: este repositorio es un ajuste fino especifico de tarea con 10 demostraciones, mientras que las alternativas citadas son modelos base o familias con objetivos mas generales. Cualquier comparacion cuantitativa requeriria evaluar ambas politicas en el mismo montaje fisico, dato que no existe en la informacion disponible.

## Limitaciones y advertencias

- Entrenamiento con muy pocas demostraciones: el nombre del repositorio sugiere 10 demostraciones, lo que implica un riesgo alto de sobreajuste y una generalizacion muy limitada a condiciones fuera de la distribucion de entrenamiento.
- Tarea unica: el checkpoint parece estar especializado en una sola tarea (task14); no debe esperarse que resuelva tareas no vistas.
- Representacion de accion no estandar: las salidas son cartesianas absolutas con cuaternion y pinza binaria, no deltas de controlador. Mezclarlas con un controlador que espere incrementos puede producir movimientos incorrectos o inseguros.
- Layout de salida ambiguo si no se respeta: de las 32 coordenadas por paso, solo las 8 primeras son acciones del robot. Interpretar el vector completo como accion es un error grave.
- Dependencia de la normalizacion: sin `assets/franka/norm_stats.json` y las transformaciones de entrenamiento exactas, las salidas del modelo no son utilizables.
- Convenciones del controlador pendientes de confirmar: la propia model card remite a `log.txt` y senala convenciones "requiring confirmation", lo que constituye una advertencia explicita de integracion no cerrada.
- Conversion JAX a PyTorch en `bfloat16`: puede introducir diferencias numericas frente al checkpoint original; no se documenta una validacion de equivalencia.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion. Debe tratarse como uso de investigacion hasta que el autor la defina.
- Ausencia de validacion externa: 0 descargas y 0 likes, sin benchmarks ni informes de terceros.
- Riesgos de seguridad fisica: es un modelo que controla hardware real; cualquier despliegue requiere limites de par, paradas de emergencia y validacion en espacio de trabajo despejado.
- Idioma y capacidades de lenguaje: no disponible; el modelo no esta pensado para tareas de texto, traduccion ni conversacion.
- Fecha del checkpoint: creado en 2026-09-16; no se indica si es el mejor punto de la curva de entrenamiento ni si existen versiones posteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NaaaaaiVe6/franka-10demos-normal_task14_cartesian_20260913T212156Z-step-6000
- Archivo `log.txt` del repositorio (layout de salida, normalizacion, entradas de camara y estado, convenciones del controlador): incluido en el propio repositorio de HuggingFace.
- Estadisticas de normalizacion: `assets/franka/norm_stats.json`, incluidas en el repositorio.
- Repositorio de la libreria `openpi` (referenciado por la etiqueta del modelo; no localizado en la busqueda web realizada): no disponible.
- Resultados de la busqueda web: los enlaces devueltos corresponden a dominios de reservas de viajes y no guardan ninguna relacion con el modelo. No se han localizado papers, blogs, demos ni discusiones tecnicas relevantes.
