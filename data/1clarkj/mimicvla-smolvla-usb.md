# 1clarkj/mimicvla-smolvla-usb

## Resumen

`1clarkj/mimicvla-smolvla-usb` es un ajuste fino de `lerobot/smolvla_base`, un modelo de vision-lenguaje-accion (VLA) de 450.046.176 parametros orientado al control de robots manipuladores. El autor lo ha especializado en una unica tarea: insertar un conector USB en su puerto sobre un Franka Panda simulado en MuJoCo. El entrenamiento se realizo durante 10.000 pasos con batch de 32 sobre los 64 episodios de entrenamiento del dataset `1clarkj/mimicvla-panda-usb`, que consisten en demostraciones humanas grabadas con telefono y reproducidas posteriormente en el simulador.

La relevancia de esta ficha es acotada pero util: se trata de un ejemplo reproducible de ajuste fino de una politica VLA pequena (450 M de parametros) sobre un dataset propio, con codigo y evaluacion abiertos en el repositorio MimicVLA. El modelo consume dos imagenes RGB fijas de 256 × 256 (vista frontal y de muneca), un vector de estado del Panda de 9 dimensiones y la instruccion textual "Insert the USB stick into the USB port.", y produce bloques de 50 acciones de efector final de 6 dimensiones a 20 Hz, de las que ejecuta 10 antes de replanificar.

Sus resultados se limitan a simulacion: 60 % de exito en los 64 puntos de partida de entrenamiento y 49 % en 55 puntos de partida nunca vistos, con intervalos de confianza bootstrap del 95 %. No ha sido probado en hardware real y el puerto simulado (15 × 7 mm) es ligeramente mayor que el real (13,4 × 5,9 mm) para absorber error de calibracion y seguimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) derivada de `lerobot/smolvla_base`; la arquitectura interna no se detalla en la informacion proporcionada |
| Parametros totales | 450.046.176 (segun los pesos en safetensors) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible; la unica instruccion documentada esta en ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Entradas | RGB frontal y de muneca fijas a 256 × 256; estado del Panda de 9 dimensiones; instruccion textual |
| Salidas | Bloques de 50 acciones de 6 dimensiones (efector final) a 20 Hz; se ejecutan 10 antes de replanificar |
| Tamano del repositorio | 1,2 GB |
| Fecha de publicacion | 16 de octubre de 2026 (segun metadatos de HuggingFace) |
| Modelo base | `lerobot/smolvla_base` |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de su pertenencia a la familia SmolVLA y de que el modelo resultante tiene 450.046.176 parametros. Se trata, por tanto, de un modelo multimodal que combina percepcion visual, comprension de una instruccion en lenguaje natural y generacion de acciones motoras continuas, con una interfaz de entrada bien definida (dos imagenes de 256 × 256, estado de 9 dimensiones y texto) y una interfaz de salida de horizonte fijo (bloques de 50 acciones de 6 dimensiones).

El ajuste fino se realizo sobre `lerobot/smolvla_base` durante 10.000 pasos con batch de 32, a partir de 64 episodios del dataset `1clarkj/mimicvla-panda-usb`. Estos episodios son demostraciones grabadas con un telefono movil por personas y posteriormente reproducidas en un entorno simulado con un Franka Panda, lo que introduce una diferencia de dominio relevante (observaciones reales frente a observaciones simuladas) que el autor no cuantifica. No se documentan en la informacion proporcionada el numero total de tokens o transiciones, la composicion del dataset, ni el uso de RLHF, DPO u otras tecnicas de alineamiento. La innovacion tecnica declarada se limita al propio flujo de trabajo MimicVLA: capturar demostraciones con un dispositivo cotidiano, replicarlas en simulacion y ajustar una politica VLA compacta, con el codigo y la evaluacion publicados en GitHub.

## Capacidades

- Generacion de acciones motoras: produce trayectorias de efector final de 6 dimensiones en bloques de 50 pasos a 20 Hz, con ejecucion de 10 acciones antes de replanificar (control en bucle cerrado).
- Percepcion visual multimodal: consume simultaneamente una vista frontal y una vista de muneca a 256 × 256.
- Condicionamiento por instruccion en lenguaje natural: la politica esta entrenada para responder a la orden "Insert the USB stick into the USB port.".
- Integracion de estado proprioceptivo: utiliza un vector de estado del Franka Panda de 9 dimensiones.
- Tarea especializada: insercion de precision de un conector USB en un puerto simulado de 15 × 7 mm.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso mas alla del bucle percibir-planificar-actuar.
- Capacidades multilingues: no disponibles; la unica instruccion documentada esta en ingles.
- No se documentan capacidades de vision general (VQA, descripcion de imagenes), audio, ni modo de razonamiento explicito.

## Casos de uso

- Linea base para investigacion en politicas VLA: sirve como punto de partida reproducible para comparar variantes de ajuste fino sobre una tarea de insercion de precision, ya que el dataset, los hiperparametros principales (10.000 pasos, batch 32) y el protocolo de evaluacion estan publicados.
- Aprendizaje por imitacion a partir de demostraciones casuales: el flujo MimicVLA demuestra como grabar tareas con un telefono, replicarlas en MuJoCo y ajustar una politica de 450 M de parametros, lo que es util para equipos sin acceso a teleoperacion especializada.
- Prototipado de ensamblaje de precision en simulacion: antes de invertir en hardware, se puede evaluar si una politica de horizonte corto y control a 20 Hz es suficiente para tareas de insercion con tolerancias de milimetros.
- Generacion de datos y evaluacion de robustez: el modelo permite medir la degradacion del exito al variar el punto de partida (60 % en puntos vistos frente a 49 % en no vistos), lo que sirve para estudiar generalizacion posicional en politicas de imitacion.
- Docencia y cursos de robotica: por su tamano reducido y su licencia MIT, es adecuado para que estudiantes entrenen, evaluen y modifiquen una politica VLA completa en un entorno simulado.
- Pruebas de infraestructura de inferencia: con 450 M de parametros y una frecuencia de control de 20 Hz, es un banco de pruebas realista para medir latencia de extremo a extremo y viabilidad de despliegue en GPUs de gama media o incluso en CPU.
- Ajuste fino posterior a nuevas tareas: al ser un derivado de `lerobot/smolvla_base` bajo licencia MIT, puede reentrenarse para otras tareas de manipulacion dentro del ecosistema LeRobot, siempre que se disponga de episodios equivalentes.
- Comparacion de estrategias de replanificacion: el esquema de ejecutar 10 de cada 50 acciones predichas permite experimentar con horizontes de ejecucion distintos y medir su efecto sobre el exito.

## Benchmarks y rendimiento

El unico dato de rendimiento publicado es el exito en bucle cerrado en simulacion, con 5 semillas por punto de partida e intervalos bootstrap del 95 % sobre los puntos de partida:

| Conjunto de puntos de partida | Exito | Intervalo de confianza del 95 % |
|---|---|---|
| 64 puntos de partida de entrenamiento | 60 % | [52, 68] |
| 55 puntos de partida de grabaciones nunca entrenadas | 49 % | [39, 59] |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes de robotica como LIBERO o SimplerEnv) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos en precision de 16 bits: aproximadamente 0,9 GB, calculada a partir de los 450.046.176 parametros. El repositorio completo ocupa 1,2 GB.
- VRAM estimada en inferencia real: del orden de 2 a 4 GB contando activaciones, buffers de imagen de 256 × 256 y memoria del entorno de ejecucion; es una estimacion derivada del tamano del modelo, no un dato publicado.
- Cabe en GPUs de consumo: cualquier GPU moderna con 6 GB o mas de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) es suficiente por capacidad de memoria; la restriccion real es la latencia del bucle de control.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 3090 o RTX 4090 es mas que suficiente; A100 o H100 solo se justificarian para entrenamiento o para servir muchas instancias en paralelo.
- Despliegue: la libreria declarada es `lerobot` sobre PyTorch. No se documentan soportes de vLLM, llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: no publicados. Como referencia derivada del diseno, las acciones se emiten a 20 Hz y se ejecutan 10 por cada bloque de 50, lo que implica una replanificacion cada 0,5 segundos (2 Hz) como minimo para mantener el control en bucle cerrado.
- Entrenamiento: no se especifica hardware. Los hiperparametros publicados (10.000 pasos, batch 32) son compatibles con una unica GPU de gama alta para un modelo de este tamano.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `1clarkj/mimicvla-smolvla-usb` | 450.046.176 | no disponible | 60 % / 49 % de exito en simulacion (puntos vistos / no vistos) | MIT | HuggingFace, 0 descargas, 0 likes |
| `lerobot/smolvla_base` | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace (modelo base) |
| Otras politicas VLA de la misma categoria (por ejemplo, OpenVLA o pi0) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables entre este modelo y alternativas de la misma categoria en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Solo simulacion: el modelo no ha sido probado en hardware real. El propio autor lo indica explicitamente, por lo que no debe asumirse transferencia directa a un Franka Panda fisico.
- Tolerancia artificialmente holgada: el puerto simulado mide 15 × 7 mm frente a los 13,4 × 5,9 mm reales. Esa diferencia se introduce para absorber error de calibracion y seguimiento, de modo que el exito en simulacion sobreestima la dificultad real de la tarea.
- Tarea unica: la politica esta entrenada para una sola instruccion y una sola habilidad (insercion de USB). No es un modelo de proposito general y no cabe esperar comportamiento sensato fuera de ese dominio.
- Generalizacion limitada: el exito cae del 60 % al 49 % al evaluar en puntos de partida no vistos durante el entrenamiento, con intervalos de confianza que se solapan parcialmente. La varianza entre puntos de partida es alta.
- Brecha de dominio en los datos: las demostraciones se grabaron con un telefono en el mundo real y se reprodujeron en simulacion, lo que introduce ruido de emparejamiento no cuantificado en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido textual, pero si existe riesgo de acciones fisicamente invalidas o inseguras cuando la politica opera fuera de la distribucion de estados observada.
- Idiomas: no hay datos sobre soporte multilingue; la unica instruccion documentada esta en ingles.
- Contexto: no se especifica ninguna ventana de contexto ni horizonte de memoria mas alla del estado actual y las dos imagenes.
- Sesgos: no se documenta ningun analisis de sesgos, ni de comportamiento diferencial segun condiciones de iluminacion, textura u oclusion.
- Licencia: MIT, permisiva y apta para uso comercial, pero la licencia del modelo base (`lerobot/smolvla_base`) debe verificarse de forma independiente antes de un despliegue comercial.
- Adopcion nula: 0 descargas y 0 likes en el momento de redactar esta ficha, sin validacion externa por parte de terceros.
- Ausencia de cuantizaciones publicadas: no se ofrecen pesos GGUF ni versiones cuantizadas, lo que limita el despliegue en entornos muy restringidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/1clarkj/mimicvla-smolvla-usb
- Dataset de entrenamiento: https://huggingface.co/datasets/1clarkj/mimicvla-panda-usb
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Codigo y evaluacion: https://github.com/1clarkj/MimicVLA
- Libreria LeRobot: https://github.com/huggingface/lerobot
