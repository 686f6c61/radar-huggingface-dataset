# hoanghieu16720/pi05-x3plus-moving-v2

## Resumen

pi05-x3plus-moving-v2 es un ajuste fino con LoRA del modelo vision-lenguaje-accion (VLA) π0.5, publicado por el usuario hoanghieu16720 bajo licencia Apache 2.0. Se distribuye como un checkpoint concreto (el paso 12000 de una ejecucion de 16000) que resuelve una unica tarea de manipulacion: recoger un cubo rojo que se desplaza lentamente sobre una mesa (arrastrado por un hilo a ~1 cm/s) y depositarlo dentro de un cuenco, usando un brazo robotico Yahboom X3Plus.

El modelo parte de los pesos pi05_base y solo entrena adaptadores LoRA (rango 16 en el LLM y rango 32 en el experto de acciones) mas el codificador de vision SigLIP: 464,8M de 3.403B parametros (13,66 %) son entrenables, mientras que el backbone LLM de 2,936B permanece congelado y bit-identico al base en bf16. El repositorio ocupa 6,3 GB e incluye los pesos de inferencia (6,0 GB), las estadisticas de normalizacion y un servidor de politica por websocket.

Su relevancia es doble. Por un lado, es un ejemplo reproducible de ajuste fino eficiente de un VLA con LoRA sobre hardware consumer (una sola RTX 5090). Por otro, documenta con detalle un fallo de ingenieria de datos (el recorte de episodios eliminaba la fase de liberacion del objeto en 109 de 109 episodios) y su correccion. Se trata de un modelo de proposito muy especifico, no de un asistente general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en π0.5 (pi05_base): backbone LLM de 2,936B + codificador de vision SigLIP de 414,8M, con adaptadores LoRA |
| Parametros totales | 3.403B (de los cuales 2,936B congelados) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos servidos en bf16 para inferencia) |
| Idiomas soportados | No disponible (el prompt de entrenamiento esta en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (directorio `params/` del ecosistema openpi) |
| Tarea | `pick up the red cube and put it in the bowl` (unica cadena de entrenamiento, debe usarse literalmente) |
| Robot objetivo | Yahboom X3Plus |
| Tamano del repositorio | 6,3 GB (6,0 GB de pesos) |
| Checkpoint | Paso 12000 de 16000 (6,68 epocas) |

## Arquitectura y entrenamiento

La arquitectura hereda la de π0.5: un backbone LLM de 2,936B acoplado a un codificador de vision SigLIP de 414,8M, con un experto de acciones. La propiocepcion entra como tokens discretos dentro del prompt (`discrete_state_input=True`), ya que π0.5 no dispone de una proyeccion de estado separada. El ajuste se realiza con LoRA de rango 16 en el LLM y rango 32 en el experto de acciones, entrenando 464,8M parametros (49,99M de LoRA mas 414,8M de SigLIP), el 13,66 % del total; el backbone LLM queda congelado y verificado como bit-identico al base en bf16.

Los datos de entrenamiento son 109 episodios, 28.745 fotogramas y 24,0 minutos grabados a 20 fps, sin repeticion de episodios. El entrenamiento consta de 16000 pasos con batch 16, optimizador AdamW con recorte de gradiente 1.0 y EMA desactivado, y un calendario de learning rate con warmup de 1000 pasos hasta 2,5e-5 y decaimiento coseno hasta 2,5e-6 en el paso 12000. Se ejecuto en una unica RTX 5090 a 1,44 s/paso. La innovacion principal no es arquitectonica, sino de datos: la version anterior recortaba cada episodio al ultimo fotograma con teleoperacion activa y eliminaba la rampa de liberacion del gripper (que se inicia 9-10 fotogramas despues), de modo que el comando de apertura nunca aparecia en el conjunto de entrenamiento. Esta version usa episodios completos sin recortar, lo que se refleja en las estadisticas de normalizacion (la dimension del gripper pasa a abarcar q01 = 0,0000 a q99 = 0,9998, media 0,3882 y sd 0,4674, en lugar de quedarse fija en 1,00). Se excluyo un episodio (`episode_000002`) porque su grabacion termina antes de la liberacion.

## Capacidades

- Manipulacion robotica de una unica tarea: seguimiento de un cubo rojo en movimiento, agarre y liberacion dentro de un cuenco.
- Seguimiento de objeto en movimiento lento (~1 cm/s) a partir de observaciones visuales de fotograma unico.
- Control de brazo de 5 articulaciones mas gripper, con acciones en formato de 10 x 6 (5 articulaciones en delta respecto al inicio del chunk y gripper en valor absoluto).
- Entrada multimodal de observacion: imagen de camara base (240x320x3, Astra RGB), imagen de muneca (240x320x3, camara USB) y estado de 6 dimensiones (5 angulos de articulacion mas gripper).
- Ejecucion como servidor de politica por websocket dentro del ecosistema openpi.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, function calling ni razonamiento multi-paso agentico. Es una politica de control, no un modelo de lenguaje de uso general.
- No dispone de capacidades multilingues: solo se ha entrenado con una unica cadena de prompt en ingles.
- No dispone de modo de pensamiento (thinking mode), audio ni otras capacidades especiales.

## Casos de uso

- Replicacion de un ajuste fino de VLA con LoRA: servir el checkpoint con `scripts/serve_policy.py` de openpi permite reproducir el experimento completo en un solo equipo con una GPU consumer, sirviendo como referencia de coste y tiempos (16000 pasos a 1,44 s/paso).
- Investigacion en destrezas dinamicas: el modelo es un banco de pruebas para estudiar seguimiento de objetos en movimiento y sincronizacion de agarre sobre una trayectoria no estatica, un escenario menos cubierto que el picking estatico.
- Punto de partida para nuevos ajustes con LoRA: al mantener el backbone congelado, la receta (rango 16/32, learning rate pico 2,5e-5) puede reutilizarse para adaptar π0.5 a otros brazos o tareas con presupuestos de datos pequenos.
- Referencia de ingenieria de datos: el repositorio documenta un error de preprocesado reproducible (recorte de episodios que elimina la fase de liberacion) y su diagnostico a traves de las estadisticas de normalizacion, util como caso de estudio al construir pipelines de datos para robotica.
- Evaluacion de robustez fuera de distribucion: permite comprobar de forma controlada como falla la politica ante velocidades, direcciones o ubicaciones no demostradas, comparando con la propia advertencia del autor sobre cobertura de entorno.
- Docencia en robotica y aprendizaje por imitacion: la combinacion de un modelo pequeno en parametros entrenables (464,8M), un dataset de 24 minutos y una unica tarea facilita montar practicas reproducibles de VLA.
- Integracion como componente de un pipeline de manipulacion: en un montaje de laboratorio se puede conectar el servidor de politica a un brazo X3Plus para recoger objetos que llegan en movimiento lento, siempre dentro del dominio estrecho de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye evaluaciones tipo MMLU, HumanEval o GSM8K (no aplicables a una politica de control) ni curvas de exito en el robot. Como unico dato cuantitativo de rendimiento se publica la perdida de entrenamiento por bloques de 1000 pasos:

| Bloque | n | Media | sd |
|---|---|---|---|
| 0-999 | 10 | 0,03876 | 0,03051 |
| 1000-1999 | 10 | 0,01304 | 0,00126 |
| 2000-2999 | 10 | 0,01019 | 0,00056 |
| 3000-3999 | 10 | 0,00834 | 0,00076 |
| 4000-4999 | 10 | 0,00703 | 0,00030 |
| 5000-5999 | 10 | 0,00616 | 0,00044 |
| 6000-6999 | 10 | 0,00542 | 0,00032 |
| 7000-7999 | 10 | 0,00488 | 0,00043 |
| 8000-8999 | 10 | 0,00431 | 0,00038 |
| 9000-9999 | 10 | 0,00383 | 0,00016 |
| 10000-10999 | 10 | 0,00357 | 0,00024 |
| 11000-11999 | 10 | 0,00326 | 0,00017 |
| 12000-12999 | 10 | 0,00328 | 0,00023 |
| 13000-13999 | 10 | 0,00321 | 0,00024 |
| 14000-14999 | 10 | 0,00309 | 0,00022 |
| 15000-15999 | 10 | 0,00320 | 0,00024 |

Segun el autor, los pasos 12000, 14000 y 15999 son estadisticamente indistinguibles por perdida de entrenamiento (Welch t = 0,54; 0,33 y -0,05, todos por debajo de 2,1), mientras que el paso 6000 es claramente peor (+47 %, t ≈ 19). No existe split de validacion, por lo que estas cifras miden ajuste a los 109 episodios grabados y no generalizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 7-8 GB en bf16 para los 3.403B parametros (estimacion derivada del recuento de parametros; no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 8-10 GB de VRAM. El entrenamiento se realizo en una RTX 5090 (1,44 s/paso con batch 16); no se especifican requisitos minimos de entrenamiento.
- Compatibilidad con GPU consumer: si, cabe en tarjetas de gama alta como RTX 4090 o RTX 5090, y probablemente en modelos con 8-12 GB gracias al reducido numero de parametros entrenables.
- Opciones de despliegue: servidor de politica por websocket de openpi (`uv run scripts/serve_policy.py policy:checkpoint --policy.config=pi05_x3plus_moving_v2 --policy.dir=/path/to/ckpt`), dentro del ecosistema LeRobot. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a una politica de control.
- Latencia y throughput de inferencia: no disponibles. Como referencia de coste computacional, el entrenamiento consume 1,44 s por paso en una RTX 5090.
- Espacio en disco: 6,3 GB para el repositorio completo (6,0 GB de pesos). El estado del optimizador no se incluye, ya que solo es necesario para reanudar el entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-x3plus-moving-v2 (este) | 3.403B (464,8M entrenables) | Agarre de cubo en movimiento y liberacion en cuenco, X3Plus | No disponible | Apache 2.0 | Publico en HuggingFace |
| pi05_base (base congelada) | 3.403B | VLA generalista de π0.5 | No disponible | No disponible | Pesos en `gs://openpi-assets/checkpoints/pi05_base/params` |
| Version anterior del mismo ajuste | 3.403B | Agarre sin liberacion (fallo documentado) | No disponible | No disponible | No publicada en este repositorio |
| π0 | No disponible | VLA | No disponible | No disponible | Referenciado en las etiquetas del modelo |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la informacion proporcionada. Otras familias de VLA de proposito general, como OpenVLA o Grokking/GR00T, no aparecen mencionadas en la documentacion y sus datos no estan disponibles en esta fuente.

## Limitaciones y advertencias

- Dominio de entrenamiento extremadamente estrecho: una sola mesa, una sola configuracion de iluminacion, un unico cubo y un unico cuenco. El propio autor senala que una cobertura de entorno limitada es el factor dominante de fallo fuera de distribucion en π0.5.
- Movimiento restringido: el cubo se desplaza a ~1 cm/s tirado por un hilo y en un conjunto limitado de direcciones. Velocidades o trayectorias mas variadas quedan fuera de distribucion.
- Sin observacion de velocidad: la politica solo ve fotogramas individuales e infiere el movimiento de forma implicita, lo que limita su capacidad ante cambios bruscos de trayectoria.
- Prompt fijo: la unica cadena presente en los datos es `pick up the red cube and put it in the bowl` y debe usarse literalmente; no hay evidencia de que otras formulaciones funcionen.
- Sin split de validacion: la perdida de entrenamiento mide ajuste a los 109 episodios, no generalizacion. La evaluacion debe hacerse en el robot y comprobando dos aspectos concretos: la liberacion dentro del cuenco y el seguimiento del cubo en posiciones alejadas de las trayectorias demostradas.
- Riesgo de sobreajuste y memorizacion: el autor elige el paso 12000 frente a 14000 y 15999 por ser el de menor exposicion a los datos (6,68 epocas frente a 8,91), argumentando que mas pasadas solo pueden anadir memorizacion.
- Volumen de datos reducido: 109 episodios, 28.745 fotogramas y 24,0 minutos a 20 fps, sin repeticion de episodios.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo solo es util dentro de la tarea y el robot descritos; no se documentan restricciones adicionales.
- Hardware y ejecucion: requiere el ecosistema openpi y el servidor de politica por websocket; no hay formato GGUF ni integracion con runners de inferencia genericos.
- Control de calidad del propio repositorio: 0 descargas y 0 likes en el momento de la consulta, y sin publicacion de resultados de exito en el robot, por lo que la validacion practica recae enteramente en quien lo despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hoanghieu16720/pi05-x3plus-moving-v2
- Dataset de episodios brutos: https://huggingface.co/datasets/hoanghieu16720/x3plus-grasp-moving-cube
- Repositorio openpi de Physical Intelligence: https://github.com/Physical-Intelligence/openpi
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente paginas no relacionadas); no se dispone de papers, blogs ni demos adicionales en la informacion proporcionada.
