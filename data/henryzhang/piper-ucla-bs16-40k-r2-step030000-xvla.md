# HenryZhang/piper-ucla-bs16-40k-r2-step030000-xvla

## Resumen

piper-ucla-bs16-40k-r2-step030000-xvla es un ajuste fino (fine-tune) del modelo base lerobot/xvla-base, un modelo de vision-lenguaje-accion (VLA) orientado al control de robots. Lo publica el usuario HenryZhang en Hugging Face y esta entrenado sobre el dataset thecqzzz/piper_vla_ucla, compuesto por demostraciones de manipulacion recogidas con un brazo robotico Piper en el entorno UCLA. El objetivo es que el modelo traduzca instrucciones en lenguaje natural e imagenes de camara en secuencias de acciones motoras ejecutables por el robot.

El modelo parte de la familia XVLA de LeRobot, una arquitectura que combina un codificador visual, un modelo de lenguaje y un cabezal de acciones para producir "action chunks", es decir, bloques de varias acciones consecutivas en lugar de una sola. En este caso el entrenamiento se realizo durante 30.000 actualizaciones del optimizador con un tamano de lote global de 16 y un chunk de acciones de 32, segun la model card.

Su relevancia es acotada pero concreta: es un ejemplo de ajuste fino de bajo coste (879,7 millones de parametros, repo de 1,8 GB) sobre un modelo VLA abierto, util para quien quiera replicar el pipeline de entrenamiento o evaluar el comportamiento de XVLA en una tarea de manipulacion especifica. No es un modelo de proposito general ni un LLM conversacional: su salida es control motor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en lerobot/xvla-base |
| Parametros totales | 879.738.545 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | lerobot/xvla-base |
| Dataset de entrenamiento | thecqzzz/piper_vla_ucla |
| Actualizaciones del optimizador | 30.000 |
| Tamano de lote global | 16 |
| Action chunk | 32 |
| Tamano del repositorio | 1,8 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de lerobot/xvla-base, un VLA que integra percepcion visual, comprension del lenguaje y generacion de acciones en un unico modelo. La salida se organiza en chunks de 32 acciones, un diseno habitual en politicas de imitacion modernas que reduce la frecuencia de inferencia y mejora la suavidad del movimiento. Los detalles internos de la arquitectura base (tipo de transformer, mecanismo de atencion, tokenizador de acciones) no se detallan en la informacion proporcionada y deben consultarse en la model card de lerobot/xvla-base.

El entrenamiento consistio en un ajuste fino supervisado sobre demostraciones del dataset thecqzzz/piper_vla_ucla, con 30.000 pasos del optimizador y lote global de 16. No se especifica en la informacion disponible el numero de tokens o frames vistos, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o refuerzo por recompensa; en el contexto VLA lo habitual es imitacion supervisada sobre trayectorias teleoperadas, pero este dato no se confirma en la model card.

## Capacidades

- Control de robot por instruccion en lenguaje natural: genera trayectorias de accion a partir de observaciones visuales y comandos textuales.
- Generacion de action chunks de 32 pasos, lo que permite ejecutar secuencias de movimiento coherentes sin replanificar en cada frame.
- Percepcion visual integrada: procesa imagenes de camara como entrada para condicionar la accion.
- Manipulacion de objetos en el dominio especifico de las demostraciones Piper UCLA.
- Ajuste fino sobre un unico dataset, por lo que su especializacion es estrecha.
- Soporte de tool calling, agentes multi-paso, modo thinking, audio o vision general: no disponible o no aplicable a un modelo VLA de este tipo.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Replicacion de experimentos de imitacion: sirve como punto de partida para reproducir el ajuste fino de XVLA sobre el dataset Piper UCLA y comparar hiperparametros (lote 16, chunk 32, 30.000 pasos).
- Evaluacion de politicas VLA en laboratorio: util para medir exito de tareas de manipulacion con un brazo Piper antes de escalar a datasets mayores.
- Benchmark interno de fine-tuning: al ser un checkpoint intermedio (step 30000), permite estudiar la curva de aprendizaje frente a otros checkpoints del mismo entrenamiento.
- Base para ajuste posterior en dominio: se puede continuar el entrenamiento con demostraciones adicionales del mismo robot para ampliar la variedad de objetos o posiciones.
- Docencia e investigacion en robotica: ejemplo compacto (879,7 M de parametros) para explicar pipelines VLA de LeRobot sin necesidad de infraestructura grande.
- Pruebas de integracion con LeRobot: validar el bucle de inferencia, el formateo de observaciones y la ejecucion de chunks de accion en un entorno controlado.
- Analisis de robustez: evaluar como se degrada la politica ante cambios de iluminacion, posicion de camara o instrucciones fuera de distribucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 3,5 GB solo para pesos (879,7 M de parametros), mas activaciones y buffers visuales; en la practica conviene reservar 6-8 GB.
- En fp16/bf16: alrededor de 1,8 GB para pesos, con margen adicional para el codificador visual y el estado de inferencia.
- GPU recomendadas: cualquier GPU con 8 GB o mas, como RTX 3060 Ti, RTX 4060, RTX 4070 o superiores; A100/H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas.
- Opciones de despliegue: al ser un modelo LeRobot/XVLA, el camino natural es la libreria LeRobot con PyTorch; llama.cpp u Ollama no son aplicables porque la salida es accion motora, no texto. vLLM y TGI tampoco estan pensados para este tipo de politica.
- Latencia y throughput: no disponibles. Dependen del hardware, de la frecuencia de control del robot y del tamano del chunk (32 acciones por inferencia).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| piper-ucla-bs16-40k-r2-step030000-xvla | 879,7 M | no disponible | VLA fine-tune sobre Piper UCLA | no disponible | Hugging Face (HenryZhang) |
| lerobot/xvla-base | no disponible | no disponible | VLA base de LeRobot | no disponible en la informacion | Hugging Face (LeRobot) |
| OpenVLA | no disponible en la informacion | no disponible | VLA de proposito general | no disponible en la informacion | Hugging Face |
| pi0 (Physical Intelligence) | no disponible en la informacion | no disponible | VLA para control robotico | no disponible en la informacion | no disponible en la informacion |

La comparacion cuantitativa no es posible con los datos disponibles: solo se conoce el recuento de parametros del modelo de esta ficha. La diferencia principal frente a lerobot/xvla-base es el ajuste fino sobre un dataset concreto; frente a OpenVLA o pi0, el alcance es mucho mas estrecho y especializado.

## Limitaciones y advertencias

- Especializacion extrema: entrenado solo con demostraciones Piper UCLA; es probable que falle fuera de ese dominio, con otros robots, camaras o entornos.
- Sin licencia declarada: no se puede asumir uso comercial; hay que contactar con el autor o consultar la licencia del modelo base lerobot/xvla-base antes de desplegarlo.
- Sin model card detallada: no se documentan sesgos, composicion del dataset, metricas de exito ni limitaciones conocidas.
- Riesgo de sobreajuste: 30.000 pasos sobre un unico dataset pequeno pueden producir politicas fragiles ante variaciones de iluminacion o posicion de objetos.
- Sin datos de evaluacion: no hay benchmarks ni tasas de exito publicadas, por lo que no se puede afirmar su calidad frente a alternativas.
- Idiomas y contexto no especificados: se desconoce si las instrucciones en lenguaje natural funcionan en castellano o solo en el idioma de las demostraciones.
- Checkpoint intermedio: el nombre indica el paso 30000 de un entrenamiento, no necesariamente el mejor checkpoint final.
- Uso en produccion: requiere validacion exhaustiva en el robot real y protocolos de parada segura; no debe operarse sin supervision en entornos con personas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HenryZhang/piper-ucla-bs16-40k-r2-step030000-xvla
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Dataset de entrenamiento: https://huggingface.co/datasets/thecqzzz/piper_vla_ucla
- LeRobot (framework): https://github.com/huggingface/lerobot
