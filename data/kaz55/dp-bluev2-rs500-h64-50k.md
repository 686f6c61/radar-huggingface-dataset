# Kaz55/dp-bluev2-rs500-h64-50k

## Resumen

dp-bluev2-rs500-h64-50k es un checkpoint de Diffusion Policy entrenado con la libreria LeRobot para control visomotor de un brazo robotico Universal Robots UR5e equipado con pinza DG5F, dos camaras RealSense y dos sensores tactiles GelSight. Lo publica el usuario Kaz55 en HuggingFace y pertenece a una barrida de entrenamiento que incluye los checkpoints de 50k, 100k, 150k y 200k pasos, todos con la misma configuracion de politica.

A diferencia de un modelo de lenguaje, este artefacto no genera texto: es una politica que produce fragmentos de trayectorias de accion (action chunks) condicionados por imagenes RGB, imagenes tactiles y un vector de estado propioceptivo de 26 dimensiones. Su relevancia es practica para la comunidad de robotica open source: documenta una solucion concreta a una restriccion real de LeRobot (la validacion `validate_features` de `configuration_diffusion.py` exige que todas las camaras compartan resolucion), y publica checkpoints intermedios para poder estudiar la evolucion del entrenamiento sin reentrenar.

El checkpoint tiene 308.812.570 parametros y un repositorio de 1,2 GB en formato safetensors. La politica usa un horizonte de prediccion de 64 pasos con 60 pasos de accion ejecutables, y se ha entrenado solo 50.000 de los 200.000 pasos previstos, con batch 8 y semilla 1000.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusion condicionado por observaciones; red de prediccion de ruido tipo U-Net con codificadores de vision) |
| Parametros totales | 308.812.570 |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); horizonte de prediccion de 64 pasos de accion y `n_action_steps` = 60 |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; pesos en safetensors) |
| Idiomas soportados | no aplica (modelo de robotica, sin entrada ni salida de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 1,2 GB) |

## Arquitectura y entrenamiento

Se trata de una Diffusion Policy, es decir, un modelo de difusion que aprende la distribucion de secuencias de acciones condicionada por observaciones. La red predice ruido (el objetivo de entrenamiento es el error cuadratico medio del ruido predicho) y genera trayectorias mediante un proceso iterativo de desruido. El horizonte debe ser multiplo de 8 porque el U-Net aplica submuestreo por 2 tres veces, de ahi que se eligiera 64 en lugar de 60, manteniendo `n_action_steps` en 60 para alinearse con las ejecuciones ACT ac60 de la misma barrida.

Las entradas son `observation.state` (26 dimensiones) mas dos camaras RealSense y dos sensores GelSight, todas a 500x375. La variante `rs500` existe precisamente porque LeRobot rechaza el conjunto estandar `bluev2` al mezclar RealSense a 640x480 con GelSight a 500x375; aqui se redimensionan las RealSense a 500x375 para que las cuatro camaras coincidan. Se excluyen deliberadamente `observation.velocity` y `observation.effort`, en linea con el resto de ejecuciones de la serie.

El entrenamiento se realizo sobre el dataset `Kaz55/dg5f_ur5e_bluev2_rs500` (90 episodios, 101.406 frames), con batch 8 y semilla 1000, y este checkpoint corresponde al paso 50.000 de un total planificado de 200.000 (aproximadamente 15,8 epocas si se completase el ciclo de 200k). No se documenta uso de RLHF, DPO ni tecnicas de ajuste por preferencias, algo que no aplica a este tipo de politica.

## Capacidades

- Generacion de trayectorias de accion para control robotico: produce fragmentos de 64 acciones, de las que se ejecutan 60, lo que permite control en bucle cerrado a partir de imagenes y estado.
- Fusion multimodal de sensores: combina dos camaras RGB (RealSense) con dos sensores tactiles opticos (GelSight) y estado propioceptivo de 26 dimensiones.
- Manipulacion con realimentacion tactil, adecuada para tareas donde el contacto importa y la vision sola es insuficiente.
- Aprendizaje por imitacion: reproduce comportamientos demostrados en el dataset de 90 episodios, sin necesidad de recompensas ni simulador.
- No soporta tool calling ni function calling: no es un modelo de lenguaje y no expone interfaz de texto.
- No soporta razonamiento multi-paso simbolico ni planificacion en lenguaje natural; su "razonamiento" es la desruido iterativo de la distribucion de acciones.
- Capacidades multilingues: no aplica.
- Capacidad especial: chunking de acciones con horizonte validado por la arquitectura (64), pensado para reducir la frecuencia de inferencia necesaria en el bucle de control.

## Casos de uso

- Manipulacion de precision con contacto: la politica usa los dos GelSight para detectar fuerzas y deformaciones locales durante el agarre, lo que permite tareas como insertar conectores o ensamblar piezas con tolerancias ajustadas donde la vision queda ocluida por la propia pinza.
- Investigacion en aprendizaje por imitacion: sirve como linea base reproducible (semilla 1000, batch 8, dataset publico) para comparar variantes de Diffusion Policy frente a ACT en un mismo montaje UR5e + DG5F.
- Estudio de escalado de entrenamiento: los checkpoints de 50k, 100k, 150k y 200k permiten analizar la curva de aprendizaje sobre la misma tarea y decidir en que punto conviene detener el entrenamiento.
- Recoleccion de datos tactiles: al depender de GelSight, es util en lineas de investigacion que estudian como representar informacion tactil en politicas visomotoras, un area con menos datasets publicos que la manipulacion puramente visual.
- Automatizacion de tareas de pick-and-place deformables: el horizonte de 60 acciones ejecutables permite movimientos continuos sin recalcular en cada paso, lo que resulta util con objetos que se deforman durante el transporte.
- Despliegue en laboratorio con hardware de gama media: al tener 308,8 M de parametros, la inferencia cabe en GPU de consumo, lo que facilita replicar el experimento en un banco de pruebas academico.
- Comparacion de politicas en el mismo banco: junto con las ejecuciones ACT ac60 de la serie, permite contrastar dos familias de politicas sobre datos identicos, recordando que sus funciones de perdida no son comparables entre si.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito en robot, errores de validacion ni curvas de perdida numericas; solo indica que la perdida de difusion es el error cuadratico medio del ruido predicho, que no es comparable con la perdida L1 de ACT, y que la eleccion de politica debe hacerse mediante evaluacion sobre el robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: calculada a partir del numero de parametros, unos 1,24 GB en fp32, unos 0,62 GB en fp16 y unos 0,31 GB en int8 para los pesos; sumando activaciones, buffers de las cuatro camaras a 500x375 y el proceso iterativo de desruido, el consumo realista por instancia se situa en el rango de 2 a 4 GB (estimacion aritmetica, no medida publicada).
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM; RTX 3060, RTX 4060, RTX 4090 para puestos de trabajo; A100 o H100 para entrenamiento y para barridos de varios checkpoints en paralelo.
- Cabe en GPU de consumo: si, con holgura en cuanto a pesos; el cuello de botella probable es la latencia del bucle de desruido, no la memoria.
- Opciones de despliegue: libreria LeRobot sobre PyTorch, que es el formato nativo del repositorio; exportacion a ONNX o TensorRT para reducir latencia en control en tiempo real. vLLM, llama.cpp, Ollama y TGI no aplican, porque no es un modelo de lenguaje.
- Latencia y throughput: no disponible. Al ser una politica de difusion, la latencia depende del numero de pasos de desruido y del tiempo de codificacion de las cuatro camaras, por lo que debe medirse en el hardware objetivo antes de fijar la frecuencia de control.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-bluev2-rs500-h64-50k (este) | Diffusion Policy | 308.812.570 | 64 (60 acciones) | no disponible | repositorio publico en HuggingFace |
| dp-bluev2-rs500-h64-100k | Diffusion Policy | no disponible | 64 (60 acciones) | no disponible | mismo autor, misma serie |
| dp-bluev2-rs500-h64-150k | Diffusion Policy | no disponible | 64 (60 acciones) | no disponible | mismo autor, misma serie |
| dp-bluev2-rs500-h64-200k | Diffusion Policy | no disponible | 64 (60 acciones) | no disponible | mismo autor, misma serie |
| Ejecuciones ACT ac60 de la misma barrida | Action Chunking Transformer | no disponible | no disponible (60 acciones) | no disponible | referenciadas en la model card, sin enlace directo |

La comparacion mas informativa es interna: los cuatro checkpoints comparten arquitectura, datos y semilla, y solo difieren en el numero de pasos, por lo que deben compararse entre si y no con las ejecuciones ACT, cuya funcion de perdida es distinta. No se dispone de datos de parametros, contexto ni rendimiento de las alternativas ACT citadas.

## Limitaciones y advertencias

- Licencia no especificada: sin terminos declarados, el uso comercial queda en una situacion juridica indeterminada y conviene contactar con el autor antes de integrarlo en un producto.
- Entrenamiento incompleto: el checkpoint corresponde al paso 50.000 de 200.000, aproximadamente una cuarta parte del ciclo previsto, por lo que se espera un rendimiento inferior al de los checkpoints finales de la serie.
- Perdidas no comparables: la perdida de difusion (error cuadratico medio del ruido) no es comparable con la perdida L1 de ACT; usar la metrica como criterio de seleccion entre familias de politicas induce a error.
- Dependencia estricta de las camaras: la politica asume cuatro camaras a 500x375; cambiar resoluciones, numero o tipo de sensores invalida la validacion de caracteristicas de LeRobot y probablemente degrada el comportamiento.
- Dataset pequeno: 90 episodios y 101.406 frames limitan la generalizacion a posiciones, iluminacion, objetos o condiciones no representadas en las demostraciones.
- Sin evaluacion publicada: no hay tasas de exito en robot ni resultados de benchmarks, y el repositorio tiene 0 descargas y 4 me gusta, por lo que la validacion por parte de la comunidad es practicamente nula.
- Riesgo de alucinacion: no aplica en el sentido de lenguaje, pero un modelo de difusion puede generar trayectorias fuera de la distribucion de entrenamiento; en robotica esto se traduce en movimientos inseguros, por lo que se requiere parada de emergencia y limites de fuerza.
- Sesgos de datos: las demostraciones provienen de un unico montaje (UR5e, pinza DG5F, sensores GelSight concretos), de modo que la politica hereda las particularidades del operador, del entorno y de la cinematica de ese robot.
- Excluye velocidad y esfuerzo: al no usar `observation.velocity` ni `observation.effort`, la politica depende solo de estado, vision y tacto, lo que puede limitar la reactividad ante perturbaciones dinamicas.
- Metadatos inconsistentes: la fecha de creacion registrada en HuggingFace (13 de septiembre de 2026) es posterior a la fecha de consulta habitual, lo que sugiere un posible error de registro o de reloj; conviene no tomarla como referencia fiable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kaz55/dp-bluev2-rs500-h64-50k
- Dataset de entrenamiento: https://huggingface.co/datasets/Kaz55/dg5f_ur5e_bluev2_rs500
- No se han encontrado enlaces relevantes en la busqueda web: los resultados devueltos corresponden a paginas de ayuda de YouTube y a hilos sin relacion con Diffusion Policy, LeRobot ni robotica, por lo que se descartan.
