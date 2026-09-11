# fm-dev/pi05-pick3-baseline-overfit3-epoch80

## Resumen

fm-dev/pi05-pick3-baseline-overfit3-epoch80 es un checkpoint de politica robotica (vision-lenguaje-accion) obtenido mediante un ajuste fino con LoRA sobre el modelo base physical-intelligence/pi05_base, la familia π0.5 de Physical Intelligence. El modelo no es un LLM de propósito general: recibe vistas RGB actuales (camara base y muneca), el estado medido del robot y una instruccion de tarea en texto, y emite comandos de accion para un brazo Franka. El repositorio ocupa 5,5 GB e incluye los pesos EMA, los assets de normalizacion y politica, el codigo coincidente y un script `load_model.py`.

El checkpoint corresponde al paso 10.240, exactamente 80 epocas de sampler, con batch global 8 sobre una unica RTX A6000 (128 actualizaciones por epoca de sampler). El subconjunto de comportamiento contiene 1031 ventanas H20 procedentes de tres episodios de entrenamiento concretos (`pick3_20260826_211022_764`, `pick3_20260826_212741_569` y `pick3_20260827_161516_690`). La tarea aprendida es literal y cerrada: "Pick up the cube and place it on the plate exactly three times, lifting it clear between placements, then press the blue button".

Su relevancia es acotada y hay que leerla con precision: no es un modelo de proposito general ni un release de produccion, sino un baseline deliberadamente sobreajustado ("overfit3") a tres trayectorias, util como referencia de reproduccion, para depurar pipelines de inferencia VLA sobre Franka y para comparar contra futuros checkpoints de la misma familia. La model card advierte explicitamente que las comprobaciones realizadas solo verifican la carga del modelo y la finitud de las salidas, no el exito en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; politica vision-lenguaje-accion (VLA) π0.5 base con adaptadores LoRA (Cartesian8) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; la politica consume unicamente vistas RGB actuales, estado medido y texto de tarea, sin memoria de historial |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea del ejemplo estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo incluye directorio `params/` con pesos EMA, `assets/`, `code/`, `requirements.txt` y `load_model.py`) |

## Arquitectura y entrenamiento

La base es π0.5 (`physical-intelligence/pi05_base`), un modelo de politica robotica que combina percepcion visual y comprension de instrucciones en lenguaje natural con generacion de acciones motoras. Sobre esa base se anaden adaptadores LoRA de tipo Cartesian8, de modo que el ajuste no reentrena el modelo completo. La salida bruta tiene forma `[20,8]`: 20 pasos de accion, cada uno con posicion absoluta `[x,y,z]` en metros, cuaternion unitario `[qx,qy,qz,qw]`, y apertura de pinza con 0 = cerrada y 1 = abierta. La geometria de epoca Status-D incluye su mezcla auxiliar Status ya existente.

El entrenamiento uso el subconjunto de comportamiento descrito (1031 ventanas H20 de tres episodios), con la normalizacion original del split de entrenamiento, batch global 8 y 128 actualizaciones por epoca de sampler, completando 80 epocas en una sola RTX A6000. Las etiquetas de comando ausentes se mantuvieron enmascaradas durante el entrenamiento. No se documento uso de RLHF, DPO ni ninguna innovacion de decodificacion; no hay informacion sobre el numero total de tokens ni la composicion completa del dataset mas alla de las tres trayectorias citadas. El repositorio no incluye estado de optimizador ni de reanudacion, solo los pesos EMA de inferencia.

## Capacidades

- Generacion de acciones de manipulacion en espacio cartesiano para un brazo Franka: trayectorias absolutas de posicion y orientacion mas control de pinza.
- Ejecucion de una tarea de horizonte largo concreta compuesta por subtareas: recoger un cubo, colocarlo en un plato tres veces levantandolo entre colocaciones, y pulsar un boton azul.
- Percepcion multimodal de entrada: vistas RGB actuales de camara base y muneca, mas estado medido del robot.
- Seguimiento de instrucciones en lenguaje natural (el texto de tarea descrito esta en ingles).
- Salida multi-paso: predice 20 pasos de accion de una vez (`[20,8]`).
- No dispone de memoria de historial: cada inferencia se basa en las observaciones y el estado actuales.
- Soporte de tool calling / function calling: no disponible (no aplica a este tipo de modelo).
- Soporte de agentes y razonamiento multi-paso en el sentido de LLM: no disponible (no aplica).
- Capacidades multilingues: no disponible.
- Modo "thinking", vision general, audio: no disponible; la unica modalidad visual soportada es la alimentacion de vistas RGB del robot.
- Variantes Uniform32 y Status-D: la model card indica que requieren historial real observado; Status-D requiere ademas las entradas Writer retenidas y contexto causal.

## Casos de uso

- Reproduccion de un baseline de investigacion: cargar el checkpoint con `load_model.py` y reproducir las nueve observaciones de entrenamiento registradas, comparando las salidas con `inference-check.json` para validar que el pipeline de inferencia esta correctamente montado.
- Depuracion de pipelines VLA sobre Franka: al estar sobreajustado a tres trayectorias, sirve como caso de prueba controlado para verificar normalizacion, conversion de cuaterniones y escalado de acciones antes de pasar a modelos mas generales.
- Pruebas de integracion hardware-software: validar la cadena completa de percepcion (camara base y muneca), lectura de estado y publicacion de comandos en el robot sin la variabilidad de un modelo generalista.
- Verificacion de bucle cerrado a corto plazo: al no usar historial, es adecuado para evaluar politicas reactivas puras y medir hasta donde llega el control reactivo en una tarea de manipulacion encadenada.
- Comparacion de metodologias de ajuste: referencia para medir el efecto de distintas configuraciones de LoRA (por ejemplo, Cartesian8 frente a otras) y de distintas duraciones de entrenamiento sobre la misma base π0.5.
- Generacion de datos sinteticos de trayectoria en simulacion: usar las predicciones de 20 pasos como propuestas iniciales que despues se filtran o se refinan con un controlador.
- Estudio de sobreajuste y memorizacion en politicas VLA: cuantificar cuanto memoriza el modelo de tres trayectorias concretas frente a su capacidad de generalizar a variaciones de posicion u objeto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni metricas de exito en robot real. Lo unico documentado son comprobaciones de carga y de que las salidas son finitas sobre nueve observaciones de entrenamiento registradas de los tres episodios, recogidas en `inference-check.json`. El autor advierte explicitamente que estas comprobaciones no establecen exito en robot real ni un rollout online del Writer.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia no confirmada, el artefacto publicado ocupa 5,5 GB en disco y el modelo se apoya en la base π0.5, por lo que la huella real de inferencia sera superior a ese tamano.
- GPU utilizadas en entrenamiento: una unica NVIDIA RTX A6000 (48 GB) con batch global 8.
- GPU recomendadas: no disponible; por la memoria de entrenamiento documentada, una A6000 de 48 GB es suficiente para el ajuste, y cabria esperar que GPU profesionales (A100, H100) y de gama alta de consumo con suficiente VRAM puedan ejecutar la inferencia, aunque el autor no publica requisitos de despliegue.
- ¿Cabe en GPU de consumo?: no confirmado. Depende del peso completo de la base π0.5 mas los adaptadores; no hay datos publicados.
- Opciones de despliegue: el repositorio proporciona `load_model.py` y `requirements.txt` como via de carga. vLLM, llama.cpp, Ollama o TGI no estan documentados; no son herramientas orientadas a politicas VLA y no se indica soporte.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fm-dev/pi05-pick3-baseline-overfit3-epoch80 | no disponible | sin historial; entrada actual | solo verificacion de carga y salidas finitas | no disponible | pesos EMA + codigo en HuggingFace |
| physical-intelligence/pi05_base | no disponible | no disponible | no disponible | no disponible | modelo base publico en HuggingFace |
| Otros checkpoints comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicados que permitan una comparacion cuantitativa con alternativas de la misma categoria (por ejemplo, otras politicas VLA para manipulacion con brazo Franka). La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo ni sobre su familia.

## Limitaciones y advertencias

- Sobreajuste deliberado: el checkpoint se entreno sobre 1031 ventanas H20 de solo tres episodios concretos, por lo que la generalizacion a objetos, posiciones, iluminacion o disposiciones distintas es muy limitada por diseno.
- Sin memoria de historial: la politica solo ve las vistas RGB actuales, el estado medido y el texto de tarea; tareas que exijan recordar acciones previas pueden degradarse. Las variantes Uniform32 y Status-D requieren historial real observado y, en el caso de Status-D, entradas Writer retenidas y contexto causal.
- Etiquetas ausentes enmascaradas: las etiquetas de comando que faltaban se mantuvieron enmascaradas durante el entrenamiento, lo que puede dejar regiones del espacio de accion peor cubiertas.
- Validacion insuficiente para produccion: las comprobaciones se limitaron a nueve observaciones de entrenamiento; verifican carga y finitud de salidas, no exito real ni rollouts online.
- Licencia no especificada: al no indicarse licencia, el uso comercial es juridicamente incierto y quedaria sujeto a los terminos del modelo base π0.5, que tampoco se detallan en la informacion disponible.
- Especificidad de encarnacion: el modelo esta ajustado para un brazo Franka y una tarea y utillaje concretos (cubo, plato, boton azul); no es portable directamente a otro robot o configuracion de sensores.
- Idioma: la instruccion de tarea documentada esta en ingles; no hay evidencia de soporte multilingue.
- Riesgo de fallo fisico: en despliegues reales, una politica que memoriza trayectorias puede generar comandos inseguros ante cambios del entorno; se requiere supervision, limites de par y paradas de emergencia.
- Sin estado de optimizador ni de reanudacion: el repositorio solo contiene los pesos EMA de inferencia, por lo que no es posible continuar el entrenamiento tal cual.

## Enlaces

- Repositorio del modelo: https://huggingface.co/fm-dev/pi05-pick3-baseline-overfit3-epoch80
- Modelo base: https://huggingface.co/physical-intelligence/pi05_base
- Resultados de busqueda web: no se encontraron enlaces tecnicos relevantes; los resultados devueltos correspondian a directorios de emisoras de radio en Francia y no guardan relacion con el modelo.
