# Kaz55/act-newblue-gs0-ac60

## Resumen

act-newblue-gs0-ac60 es una política de manipulación robótica entrenada con el algoritmo ACT (Action Chunking Transformer) sobre la librería LeRobot de HuggingFace. Lo publica el usuario Kaz55 como un punto de una ablación sistemática sobre la tarea "newblue" ejecutada con un brazo UR5e y una mano DG-5F. El modelo concreto que nos ocupa corresponde a la condición sin sensor táctil GelSight: recibe únicamente el estado proprioceptivo de 26 dimensiones y dos cámaras RealSense a 640x480.

Su relevancia no está en el rendimiento absoluto, sino en el diseño experimental. El autor ha generado cinco variantes que solo se diferencian en la resolución del GelSight (500x375, 320x240, 160x120, 88x66 y ninguna), de modo que cualquier diferencia de comportamiento entre ellas es atribuible exclusivamente a la información táctil. Este ejemplar es, por tanto, la línea base del barrido: establece el techo de lo que se puede conseguir sin tacto.

Técnicamente es un transformer encoder-decoder con CVAE de 51.668.634 parámetros (unos 51,7 millones), entrenado por imitación sobre 90 episodios y 105.193 fotogramas durante 100.000 pasos. No es un modelo de lenguaje ni un modelo generativo de propósito general: su única salida son secuencias de acciones motoras (chunks de 60 pasos) para controlar el robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), transformer encoder-decoder con CVAE |
| Parametros totales | 51.668.634 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; opera con chunk_size=60 y n_action_steps=60 sobre un historial de observaciones |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors (fp32) |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada ni salida de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es una política de imitación basada en transformer con un módulo CVAE (autoencoder variacional condicional) que modela la variabilidad humana en las demostraciones. El transformer aprende a predecir bloques de acciones futuras en lugar de una sola acción por paso, lo que reduce el error de acumulación y suaviza la trayectoria. En esta configuración, el modelo consume `observation.state` (vector de 26 dimensiones) y dos flujos de imagen RealSense a 640x480, y produce chunks de 60 acciones con `n_action_steps=60`, es decir, ejecuta el bloque completo antes de volver a inferir. Las variables `observation.velocity` y `observation.effort` existen en el dataset pero se excluyeron deliberadamente para no introducir una segunda diferencia entre las ejecuciones del barrido.

El entrenamiento se realizó sobre el dataset `Kaz55/dg5f_ur5e_newblue_gs0`, compuesto por 90 episodios y 105.193 fotogramas de demostraciones teleoperadas. Se ejecutaron 100.000 pasos de optimización con batch size 8 y semilla 1000, lo que equivale aproximadamente a 7,6 épocas sobre el conjunto. No se documenta ningún uso de RLHF, DPO ni aprendizaje por refuerzo: es aprendizaje por imitación supervisado puro. Tampoco se describe decodificación especulativa, atención lineal ni ninguna otra innovación de eficiencia; el interés técnico del artefacto reside en el protocolo de ablación, no en la arquitectura.

## Capacidades

- Control motor de manipulación robótica: genera trayectorias de 60 pasos para un brazo UR5e con mano DG-5F en la tarea "newblue".
- Fusión multimodal de estado propioceptivo (26 dimensiones) con dos cámaras RGB RealSense a 640x480.
- Ejecución de acciones en bloque (action chunking), lo que aporta suavidad y coherencia temporal en tareas de contacto.
- Aprendizaje por imitación a partir de demostraciones teleoperadas; no requiere ingeniería de recompensas.
- Operación sin sensor táctil: es la variante de línea base del barrido, útil como referencia para medir el aporte del GelSight.
- No dispone de tool calling, function calling ni soporte de agentes.
- No tiene capacidades de generación de texto, razonamiento simbólico, código, matemáticas, visión general ni audio.
- No es multilingüe ni procesa lenguaje natural de ningún tipo.
- No tiene modo "thinking" ni razonamiento multi-paso explícito.

## Casos de uso

- Línea base de ablación táctil: sirve como referencia contra la que se comparan las variantes gs500, gs320, gs160 y gs88 para cuantificar cuánto aporta realmente la resolución del GelSight en la tarea newblue.
- Manipulación de precisión sin sensor táctil: en robots donde no se puede integrar un GelSight por coste, espacio o fragilidad, este modelo ofrece un comportamiento entrenado específicamente para operar sin tacto en la misma tarea.
- Investigación en aprendizaje por imitación: su tamaño reducido (51,7 millones de parámetros) permite iterar rápidamente sobre hiperparámetros, semillas y composición de dataset sin depender de clústeres grandes.
- Validación de pipelines LeRobot: es un artefacto útil para verificar de extremo a extremo el flujo de carga, entrenamiento y evaluación de LeRobot en un entorno propio antes de escalar a modelos mayores.
- Despliegue en hardware de borde: con 51,7 millones de parámetros cabe en GPUs de gama media e incluso en placas embebidas con acelerador, lo que habilita inferencia a bordo del propio robot sin conexión a la nube.
- Educación y prototipado robótico:como ejemplo completo y de tamaño manejable de una política ACT entrenada de principio a fin, con dataset, receta e hiperparámetros documentados.
- Reproducción de experimentos de fusión sensorial: permite a otro grupo replicar el protocolo de barrido y contrastar si sus conclusiones coinciden con el caveat del autor sobre la invariancia de la pérdida de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna métrica de éxito en robot, tasa de agarre, error de trayectoria ni evaluación comparativa. El autor advierte explícitamente de que las pérdidas de entrenamiento fueron prácticamente idénticas en todas las resoluciones de GelSight, incluida la ausencia total del sensor, y que por tanto deben interpretarse como una comprobación de cordura y no como evidencia sobre la contribución del tacto. La pregunta sobre la resolución táctil, concluye, requiere evaluación sobre el robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los pesos ocupan aproximadamente 207 MB; en fp16, unos 103 MB. Sumando activaciones y los dos buffers de imagen a 640x480, un despliegue realista se mueve en el rango de 1 a 2 GB de VRAM, aunque no hay una cifra publicada.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente. Una RTX 3060, RTX 4060, RTX 4090 o incluso una Jetson Orin cubren el caso de uso sin problema. No se necesita A100 ni H100.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo de los últimos ocho años, y es probable que también funcione en CPU con latencias mayores.
- Opciones de despliegue: la librería nativa es LeRobot (PyTorch). vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje. El despliegue típico es un script de evaluación de LeRobot conectado al controlador del UR5e.
- Latencia y throughput: no disponibles. ACT suele inferir un chunk completo en decenas de milisegundos en GPU moderna, pero no hay ninguna medición publicada para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada tactil | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act-newblue-gs0-ac60 (este) | 51,67 M | ninguna | newblue (UR5e + DG-5F) | no disponible | HuggingFace |
| act-newblue-gs88-ac60 | no disponible (misma receta) | GelSight 88x66 | newblue (UR5e + DG-5F) | no disponible | HuggingFace |
| act-newblue-gs160-ac60 | no disponible (misma receta) | GelSight 160x120 | newblue (UR5e + DG-5F) | no disponible | HuggingFace |
| act-newblue-gs320-ac60 | no disponible (misma receta) | GelSight 320x240 | newblue (UR5e + DG-5F) | no disponible | HuggingFace |
| act-newblue-gs500-ac60 | no disponible (misma receta) | GelSight 500x375 | newblue (UR5e + DG-5F) | no disponible | HuggingFace |

Los cinco modelos comparten arquitectura, dataset, hiperparámetros y semilla, y difieren únicamente en la resolución del GelSight, por lo que la comparación entre ellos es limpia y directa. Frente a alternativas de la misma categoría, como Diffusion Policy o ACT bimanual estándar, no hay datos publicados de parámetros, contexto ni rendimiento en la información disponible, de modo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse por imitación sobre las demostraciones de un único operador en una única tarea, heredará cualquier sesgo de estilo, velocidad o estrategia de ese operador y no generalizará a otros.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe el equivalente en robótica: ante estados fuera de la distribución de entrenamiento, la política puede generar trayectorias erráticas sin ninguna señal de incertidumbre.
- Limitación de contexto: la ventana efectiva es de un chunk de 60 acciones. No hay memoria a largo plazo ni razonamiento sobre el episodio completo más allá de lo que capturen las observaciones actuales.
- Limitación de idioma: no procesa lenguaje, por lo que no se puede controlar con instrucciones en lenguaje natural.
- Restricciones de licencia: la licencia no está declarada en la información disponible, lo que impide determinar si el uso comercial está permitido. Conviene contactar con el autor antes de cualquier despliegue en producción.
- Especificidad de la tarea: el modelo está entrenado para "newblue" con un UR5e y una mano DG-5F concretos. No es transferible a otro robot, a otra tarea ni a otra configuración de cámaras sin reentrenamiento.
- Sin evidencia de rendimiento real: no hay métricas de éxito en robot publicadas. El propio autor señala que las pérdidas de entrenamiento no permiten extraer conclusiones sobre el efecto de la resolución táctil.
- Adopción nula: cero descargas y cero "likes" en el momento de redactar esta ficha, por lo que no existe validación por parte de terceros.
- Reproducibilidad limitada por datos ausentes: se desconoce la licencia del dataset asociado y no se documentan detalles de la teleoperación que podrían afectar a la calidad de las demostraciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kaz55/act-newblue-gs0-ac60
- Dataset asociado: https://huggingface.co/datasets/Kaz55/dg5f_ur5e_newblue_gs0
- Librería LeRobot (HuggingFace): https://github.com/huggingface/lerobot
- Paper original de ACT, "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware": https://arxiv.org/abs/2304.13705
- No se han encontrado en la búsqueda web otros enlaces relevantes sobre este modelo (los resultados devueltos corresponden a un servicio de streaming deportivo y no guardan relación).
