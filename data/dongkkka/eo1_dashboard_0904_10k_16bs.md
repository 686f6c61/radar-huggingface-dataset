# Dongkkka/eo1_dashboard_0904_10k_16bs

## Resumen

EO1 dashboard 0904 10k 16bs es una politica vision-lenguaje-accion (VLA) para robotica entrenada sobre el backbone completo de Qwen2.5-VL-3B-Instruct junto con un cabezal de acciones nuevo basado en flow matching. Lo publica el usuario Dongkkka en Hugging Face y esta pensado para control de manipulacion bimanual: recibe tres camaras RGB, un vector de estado de 22 dimensiones y un texto de tarea, y produce chunks de 8 acciones de 22 canales. El repositorio contiene los pesos completos de la politica mas los preprocesadores y postprocesadores guardados, incluidas las estadisticas de normalizacion MEAN_STD de estado y accion.

Se trata de un checkpoint intermedio de 10.000 pasos extraido de una ejecucion de 20.000 pasos con batch de 16. El entrenamiento uso los episodios 0 a 23 del conjunto y dejo los episodios 24 a 27 como held out, y en ningun momento se inicializo desde eo1-base: el backbone VLM parte de la revision 66285546d2b821cf421d4f5eb2576359d3770cd3 de Qwen2.5-VL-3B-Instruct y el cabezal de accion se inicializa desde cero. El modelo se distribuye como modelo base para inferencia o fine-tuning, sin estado de optimizador ni de RNG para reanudar entrenamiento.

Su relevancia es doble. Por un lado, demuestra el flujo de trabajo de LeRobot 0.6.1 para VLA de manipulacion bimanual con 22 grados de actuacion (dos brazos de 7 articulaciones, dos pinzas, dos articulaciones de cabeza, elevacion y velocidad lineal/angular). Por otro, al publicar pesos completos y estadisticas de normalizacion permite reproducir la politica o reutilizarla como punto de partida, aunque su licencia no esta declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-lenguaje-accion); backbone transformer Qwen2.5-VL-3B-Instruct con vision tower y cabezal de accion flow matching, entrenados conjuntamente |
| Parametros totales | 3.771.607.072 (aprox. 3,77 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repo solo publica pesos completos en safetensors, sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible; el texto de tarea se procesa con el tokenizer de Qwen2.5-VL |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamano de repo 7,6 GB) |
| Libreria | lerobot (integracion EO1, requiere LeRobot 0.6.1) |
| Pipeline | robotics |
| Modelo base | Qwen/Qwen2.5-VL-3B-Instruct (revision 66285546d2b821cf421d4f5eb2576359d3770cd3), con cabezal de accion inicializado de cero |
| Tarea | politica de manipulacion robotica (prediccion de acciones) |
| Dimension de estado/accion | 22 canales |
| Chunk de accion | 8 acciones por chunk, longitud de ejecucion 8 |
| Camaras requeridas | observation.images.rgb.cam_left_head, observation.images.rgb.cam_left_wrist, observation.images.rgb.cam_right_wrist |
| Canal de acciones | brazos izquierdo y derecho 1-7 (14), pinza izquierda, pinza derecha, articulaciones de cabeza 1-2, lift, linear_x, linear_y, angular_z |
| Normalizacion | MEAN_STD, con estadisticas guardadas en el preprocesador y postprocesador |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-11 |

## Arquitectura y entrenamiento

La politica combina dos componentes. El primero es el backbone Qwen2.5-VL-3B-Instruct completo, un transformer multimodal con vision tower que ingiere las imagenes de las tres camaras y el texto de tarea. El segundo es un cabezal de accion basado en flow matching que genera los chunks de 8 acciones en 22 dimensiones. A diferencia de otros VLA que congelan el backbone visual-lenguaje, en este checkpoint el backbone Qwen2.5-VL y el cabezal de accion se entrenan de forma conjunta. El estado de 22 dimensiones se normaliza con estadisticas MEAN_STD calculadas durante el entrenamiento y guardadas junto con los pesos.

Los detalles de entrenamiento son acotados: 10.000 pasos con batch de 16, extraidos de una ejecucion mayor de 20.000 pasos, usando los episodios 0 a 23 del conjunto de datos y reservando los episodios 24 a 27. El autor remite a training_provenance.json dentro del repositorio para la configuracion completa. El entorno de ejecucion es LeRobot 0.6.1 con Transformers 5.5.4, que incluye la correccion de RoPE para imagenes fijas de Qwen2.5-VL, y se usa el procesador de imagen rapido. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, ni el numero total de tokens de entrenamiento.

## Capacidades

- Generacion de chunks de accion de 8 pasos y 22 canales para control bimanual, incluyendo articulaciones de brazo, pinzas, cabeza, elevacion y velocidades base (linear_x, linear_y, angular_z).
- Percepcion visual multi-camara con tres flujos RGB simultaneos: camara de cabeza izquierda, muneca izquierda y muneca derecha.
- Condicionamiento por lenguaje de tarea mediante el tokenizer y el encoder textual de Qwen2.5-VL, lo que permite especificar la tarea en el prompt.
- Integracion nativa con LeRobot mediante EO1Policy, con preprocesador y postprocesador listos para usar.
- Capacidad de fine-tuning: al publicarse los pesos completos de la politica, puede reentrenarse sobre nuevos episodios.
- No dispone de estado de optimizador ni de RNG, por lo que no permite reanudar el entrenamiento original, solo iniciar uno nuevo.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso explicito, audio ni modo thinking.

## Casos de uso

- Manipulacion bimanual con dos brazos y dos pinzas: la politica emite simultaneamente 14 articulaciones de brazo mas las dos pinzas, lo que encaja en tareas cooperativas como recoger, sostener y colocar objetos con ambas manos.
- Replicacion de politicas entrenadas a partir de datos de teleoperacion: el modelo consume tres vistas de camara y un estado de 22 dimensiones, un esquema tipico de conjuntos de datos de demostracion, y reproduce la tarea sin necesidad de reentrenar el backbone.
- Punto de partida para fine-tuning en un entorno nuevo: al incluir pesos completos, el preprocesador y el postprocesador, permite adaptar la politica a un robot o a un conjunto de tareas distinto partiendo de un backbone VLM preentrenado.
- Control de plataformas moviles con brazo: el vector de accion incluye lift, linear_x, linear_y y angular_z, de modo que la politica puede aprender desplazamiento de base ademas de manipulacion.
- Articulacion de cabeza activa: los dos canales de cabeza permiten que el modelo dirija la camara de cabeza izquierda como parte de la politica, util para tareas de seguimiento visual.
- Banco de pruebas para investigacion en VLA: al haber dejado los episodios 24 a 27 fuera del entrenamiento, sirve para experimentos de evaluacion open-loop reproducibles con semilla fija.
- Referencia de reproducibilidad para LeRobot: la combinacion de version de libreria, revision del modelo base y fichero de procedencia permite auditar como se genero el checkpoint.

## Benchmarks y rendimiento

La model card solo reporta una metrica de evaluacion, una comprobacion en bucle abierto sobre el episodio 24 reservado. No se publican resultados de MMLU, HumanEval, GSM8K ni tasas de exito de tarea en bucle cerrado.

| Evaluacion | Condiciones | Resultado |
|---|---|---|
| MAE de articulaciones de brazo (open loop) | Episodio 24 held out, 185 fotogramas, observaciones registradas, chunks de 8 acciones, sin suavizado, semilla 42 | 0,0229943 rad |

El autor indica explicitamente que esta cifra no es una tasa de exito de tarea en bucle cerrado, por lo que no debe interpretarse como rendimiento de la politica en ejecucion real.

## Requisitos de hardware

Estimaciones derivadas del recuento de parametros (3,77 mil millones) y del tamano del repositorio; la model card no publica requisitos oficiales.

- Pesos en bf16/fp16: aproximadamente 7,5 GB solo de pesos; en fp32, aproximadamente 15,1 GB.
- VRAM estimada para inferencia en bf16 con las tres camaras y el vision tower: del orden de 10 a 14 GB, incluyendo activaciones y cache. La cifra exacta no esta publicada.
- GPU recomendadas: A100 (40 o 80 GB), H100, L40S o cualquier GPU con 24 GB o mas.
- GPU de consumo: cabe con holgura en RTX 4090, RTX 3090 y RTX 4080 (16 GB) en bf16, aunque la segunda puede quedar justa segun la resolucion de imagen.
- Cuantizacion: el repo no publica variantes cuantizadas ni esta documentado el soporte de carga en 8 o 4 bits dentro de la integracion EO1 de LeRobot, por lo que reducir la VRAM por debajo de 8 GB no esta garantizado.
- Despliegue: la via soportada es LeRobot 0.6.1 con EO1Policy.from_pretrained y make_pre_post_processors, ejecutando en CUDA. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos de otros modelos VLA en la informacion proporcionada. La unica comparacion documentable es con el backbone del que parte.

| Modelo | Parametros | Tipo | Contexto | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| Dongkkka/eo1_dashboard_0904_10k_16bs | 3,77 mil millones | VLA (Qwen2.5-VL + cabezal flow matching) | no disponible | no disponible | MAE brazo 0,0229943 rad en open loop |
| Qwen/Qwen2.5-VL-3B-Instruct | aproximadamente 3,8 mil millones | VLM (vision-lenguaje) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no aplica: no genera acciones |
| Otras politicas VLA publicas (por ejemplo familias tipo OpenVLA o pi-zero) | no disponible | VLA | no disponible | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- La unica metrica publicada es un error medio absoluto en bucle abierto sobre un episodio reservado, no una tasa de exito de tarea; no hay evidencia de rendimiento en ejecucion real sobre el robot.
- El entrenamiento uso solo los episodios 0 a 23, un volumen reducido, lo que aumenta el riesgo de sobreajuste al entorno concreto del conjunto de datos.
- No se inicializo desde eo1-base: el cabezal de accion parte de cero, por lo que la politica no hereda ninguna politica previa.
- La licencia no esta declarada, lo que impide determinar si el uso comercial esta permitido; hay que contactar con el autor antes de cualquier despliegue productivo.
- Los idiomas soportados no estan documentados; el comportamiento multilingue del prompt de tarea depende del tokenizer de Qwen2.5-VL y no ha sido evaluado por el autor.
- El modelo exige exactamente tres camaras con claves concretas (cam_left_head, cam_left_wrist, cam_right_wrist) y un estado de 22 dimensiones; cualquier discrepancia en el esquema de observacion invalida la inferencia.
- Es imprescindible usar el preprocesador y el postprocesador guardados, porque contienen las estadisticas de normalizacion MEAN_STD; omitirlos produce acciones con escala incorrecta.
- No se incluye estado de optimizador ni de RNG, por lo que no es posible reanudar el entrenamiento original ni reproducir exactamente la trayectoria de entrenamiento.
- El repositorio es de tipo base_model con 0 descargas y 0 likes, sin validacion externa ni resultados de terceros.
- Como cualquier politica basada en un VLM, puede producir acciones incoherentes ante observaciones fuera de distribucion o instrucciones de tarea ambiguas.
- No hay informacion publicada sobre sesgos, latencia, throughput ni comportamiento ante fallos de camara.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dongkkka/eo1_dashboard_0904_10k_16bs
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Repositorio de LeRobot, libreria de carga (se requiere la version 0.6.1): https://github.com/huggingface/lerobot
- Configuracion de entrenamiento declarada por el autor dentro del repositorio: training_provenance.json
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces utiles son los anteriores.
