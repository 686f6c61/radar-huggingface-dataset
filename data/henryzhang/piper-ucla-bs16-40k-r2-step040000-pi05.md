# HenryZhang/piper-ucla-bs16-40k-r2-step040000-pi05

## Resumen

piper-ucla-bs16-40k-r2-step040000-pi05 es un ajuste fino (fine-tuning) del modelo base lerobot/pi05_base, un modelo de vision-lenguaje-accion (VLA) orientado al control de robots. Lo publica el usuario HenryZhang en Hugging Face y se ha entrenado sobre el dataset thecqzzz/piper_vla_ucla, compuesto por demostraciones de manipulacion con un brazo robotico Piper. El checkpoint corresponde al paso 40.000 de optimizacion, con un tamano de lote global de 16 y un *action chunk* de 32.

El modelo hereda la arquitectura del pi05_base de LeRobot, un transformer multimodal que recibe observaciones visuales y una instruccion en lenguaje natural y emite secuencias de acciones motoras. Con 4.143.404.816 parametros (aproximadamente 4,14 mil millones) y un repositorio de 9,4 GB en formato safetensors, es un modelo de escala media que no esta pensado para inferencia en GPU de consumo sin cuantizacion o sin tecnicas de ahorro de memoria.

Su relevancia es acotada y muy especifica: se trata de un checkpoint de investigacion para reproducir o continuar experimentos de imitation learning en robots Piper, no de un modelo de proposito general. La informacion publicada por el autor es minima (solo el numero de pasos, el lote y el chunk de acciones), por lo que muchos datos tecnicos habituales no estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en lerobot/pi05_base; detalles internos no disponibles |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp32/bf16) |
| Idiomas soportados | no disponible (las instrucciones del dataset estan presumiblemente en ingles, sin confirmacion) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de lerobot/pi05_base, el modelo base VLA de la libreria LeRobot. La arquitectura exacta del pi05_base no se detalla en la informacion proporcionada; por la naturaleza de la tarea (entrada visual mas instruccion en lenguaje, salida de acciones continuas) se trata de un transformer multimodal con un cabezal de acciones, pero no se dispone de datos sobre el numero de capas, dimension oculta, mecanismo de atencion ni estrategia de fusion de modalidades.

El entrenamiento se realizo sobre el dataset thecqzzz/piper_vla_ucla, con demostraciones de teleoperacion de un brazo Piper. El autor indica 40.000 actualizaciones del optimizador con un tamano de lote global de 16, lo que equivale a 640.000 muestras procesadas, y un *action chunk* de 32, es decir, el modelo predice bloques de 32 acciones consecutivas por inferencia. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF/DPO ni innovaciones tecnicas adicionales.

## Capacidades

- Control de robot por instruccion en lenguaje natural: genera secuencias de acciones motoras a partir de observaciones visuales y un comando textual, siguiendo el paradigma VLA.
- Prediccion de acciones en bloques (*action chunking*): emite 32 acciones por paso de inferencia, lo que reduce la frecuencia de reevaluacion del modelo durante la ejecucion.
- Percepcion visual: procesa imagenes de camara como entrada, presumiblemente de una o varias vistas del entorno de manipulacion.
- Especializacion en el dominio Piper UCLA: el comportamiento esta ajustado a las tareas, objetos y configuracion de camara del dataset de demostraciones utilizado.
- Tool calling / function calling: no disponible; no es una capacidad propia de un modelo VLA.
- Razonamiento multi-paso y agentes: no disponible en el sentido de agentes de software; el modelo ejecuta politicas de control, no planificacion simbolica.
- Capacidades multilingues: no disponibles; no se documenta el idioma de las instrucciones.
- Modo *thinking*, vision avanzada o audio: no disponible.

## Casos de uso

- Reproduccion de experimentos de imitation learning: cargar el checkpoint en LeRobot y evaluar la politica sobre el entorno Piper UCLA para comparar con otros checkpoints del mismo entrenamiento.
- Evaluacion comparativa de checkpoints: al ser el paso 40.000 de una serie, sirve para trazar curvas de aprendizaje frente a pasos anteriores o posteriores del mismo run.
- Manipulacion robotica en laboratorio: ejecutar tareas de picking y colocacion sobre el brazo Piper con las que se genero el dataset, siempre dentro del dominio de entrenamiento.
- Investigacion en *action chunking*: analizar el efecto de un chunk de 32 acciones en la suavidad y la latencia de la politica durante la ejecucion real.
- Base para nuevo fine-tuning: partir de este checkpoint para adaptar la politica a variaciones de la tarea, nuevos objetos o una camara distinta, con menos datos que entrenando desde pi05_base.
- Docencia y divulgacion: ilustrar un pipeline completo de VLA (dataset de teleoperacion, entrenamiento con LeRobot, despliegue en robot) en cursos o talleres de robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14 mil millones de parametros, en bf16/fp16 se necesitan aproximadamente 8,3 GB solo para los pesos; contando activaciones y buffers de vision, es razonable reservar 12-16 GB. En fp32 serian unos 16,6 GB solo de pesos.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX A6000 para inferencia comoda en precision completa; RTX 4090 (24 GB) es viable en bf16.
- GPU de consumo: cabe en RTX 4090 y, con cuantizacion a 8 bits, podria entrar en GPUs de 12-16 GB; no se dispone de pesos GGUF publicados, por lo que la cuantizacion requeriria conversion propia.
- Opciones de despliegue: el ecosistema natural es LeRobot (PyTorch); vLLM, llama.cpp, Ollama o TGI no estan orientados a modelos VLA con cabezal de acciones y no se documenta soporte.
- Latencia y throughput: no disponibles; dependen del hardware y del pipeline de vision del robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| piper-ucla-bs16-40k-r2-step040000-pi05 | 4,14 B | no disponible | Manipulacion Piper UCLA | no disponible | Hugging Face (0 descargas) |
| lerobot/pi05_base | no disponible | no disponible | VLA generalista de LeRobot | no disponible | Hugging Face (modelo base) |
| Otros checkpoints VLA de LeRobot (p. ej. pi0, SmolVLA) | variable | no disponible | Robotica generalista | variable | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse solo con demostraciones de un brazo Piper y un entorno concreto, la politica estara fuertemente sesgada hacia esas condiciones.
- Riesgo de alucinacion: en un modelo de accion, se traduce en acciones fisicamente invalidas o inseguras fuera del dominio de entrenamiento; no hay evaluacion publicada de robustez.
- Limitaciones de contexto e idioma: no se documenta la longitud de contexto ni el idioma de las instrucciones, lo que impide conocer los limites practicos.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que contactar con el autor o revisar el modelo base antes de cualquier despliegue productivo.
- Checkpoint intermedio: es el paso 40.000 de un entrenamiento, no necesariamente el mejor; conviene comparar con otros pasos del mismo run.
- Repositorio sin descargas ni likes: no hay evidencia de validacion por parte de la comunidad.
- Seguridad fisica: cualquier uso en un robot real requiere limites de par, paradas de emergencia y validacion en simulacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HenryZhang/piper-ucla-bs16-40k-r2-step040000-pi05
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/thecqzzz/piper_vla_ucla
- Libreria LeRobot: https://github.com/huggingface/lerobot
