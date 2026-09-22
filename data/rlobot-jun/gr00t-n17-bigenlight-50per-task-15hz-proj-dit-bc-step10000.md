# RLobot-jun/gr00t-n17-bigenlight-50per-task-15hz-proj-dit-bc-step10000

## Resumen

El modelo `RLobot-jun/gr00t-n17-bigenlight-50per-task-15hz-proj-dit-bc-step10000` es un checkpoint de politica robotica (vision-language-action) derivado de la familia GR00T N1.7, publicado por el usuario RLobot-jun en HuggingFace. Se trata de un ajuste fino por imitacion (behavior cloning, BC) entrenado especificamente para ejecutar acciones a 15 Hz sobre un cuerpo `ur7e_gello` (etiquetado como `NEW_EMBODIMENT`, no UR5). El repositorio contiene el modelo completo de inferencia, incluyendo el processor, las estadisticas de normalizacion y el mapeo de embodiment, con 3.144.016.000 parametros en formato safetensors y un tamano de repo de 12,6 GB.

El checkpoint parte del modelo base de 30 Hz del mismo autor y se entrena durante 10.000 pasos adicionales con batch 32 y learning rate 1e-4, tras diezmar los datos originales de 30 Hz a 15 Hz manteniendo RGB, estado y acciones alineados. El conjunto de entrenamiento consta de 200 episodios, 50 por cada una de cuatro tareas de manipulacion: zanahoria (carrot), apilado de cuencos (bowl stack), triple apilado de cuencos (triple bowl stack) y apilado de cubos (cube stack). Es, por tanto, un modelo especializado de proposito muy concreto, no un modelo generalista.

Su relevancia es acotada pero clara: documenta un flujo de trabajo reproducible de ajuste fino de una politica VLA open source para control a 15 Hz, con la VLM congelada y solo entrenables las capas LayerNorm y self-attention de la torre vision-lenguaje, los proyectores de estado/accion y el cabezal DiT. El modelo no incluye estados de optimizador, critico ni adaptadores SVF, por lo que es un checkpoint de BC puro y no una politica actualizada con IQL/SVF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM congelada (lenguaje y vision) mas cabezal DiT (Diffusion Transformer) entrenable, con proyectores de estado y accion; tag de arquitectura `Gr00tN1d7` |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el horizonte de accion es de 16 pasos (`horizon 16`) y el processor aplica padding de 40 x 132 |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | no disponible (el modelo recibe condicionamiento de lenguaje segun la arquitectura, pero no se especifican idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Frecuencia de control | 15 Hz (intervalo de accion de 66,67 ms; prohibido ejecutar a 30 Hz) |
| Formato de accion | 16 x 7 comandos reales (objetivos absolutos de articulaciones del brazo mas pinza) |
| Embodiment | `NEW_EMBODIMENT`, `robot_type ur7e_gello` (no UR5) |
| Modelo base | RLobot-jun/gr00t-n17-bigenlight-50per-task-step10000 |
| Tamano del repositorio | 12,6 GB |

## Arquitectura y entrenamiento

La arquitectura combina una torre vision-lenguaje (VLM) con un cabezal de difusion basado en transformer (DiT) que genera los comandos de accion. Durante el ajuste fino, las partes de lenguaje y vision de la VLM permanecen congeladas; resultan entrenables las capas LayerNorm y self-attention de la torre vision-lenguaje, los proyectores de estado y de accion, y el DiT. La VLM actua como extractor de representaciones multimodales condicionadas por la instruccion en lenguaje, mientras que el DiT modela la distribucion de secuencias de accion. El horizonte de prediccion es de 16 pasos, lo que a 15 Hz cubre aproximadamente 1,067 segundos de ejecucion antes de necesitar una nueva inferencia.

El entrenamiento es de tipo behavior cloning sobre 200 episodios teleoperados (50 para carrot, 50 para bowl stack, 50 para triple bowl stack y 50 para cube stack). Los datos originales a 30 Hz se diezmaron a 15 Hz con RGB, estado y acciones alineados. El modelo se inicializa desde el checkpoint de BC a 30 Hz del mismo autor y se entrena durante 10.000 pasos adicionales con batch 32 y learning rate 1e-4. El repositorio contiene unicamente el modelo de inferencia (processor, estadisticas de normalizacion y mapeo de embodiment): no incluye estados de Adam, scheduler ni RNG, ni critico, ni adaptadores SVF. Las estadisticas de normalizacion incluidas son las especificas de esta version a 15 Hz y no deben sustituirse por las del checkpoint de 30 Hz.

## Capacidades

- Generacion de secuencias de accion robotica a 15 Hz: produce bloques de 16 x 7 comandos (objetivos absolutos de articulaciones del brazo mas pinza) a partir de observaciones visuales y de estado.
- Condicionamiento por lenguaje: la VLM congelada procesa instrucciones en lenguaje para guiar la politica, si bien el autor no especifica los idiomas soportados.
- Manipulacion de objetos en cuatro tareas concretas: recogida de zanahoria, apilado simple de cuencos, triple apilado de cuencos y apilado de cubos.
- Control de un embodiment especifico: `ur7e_gello`, etiquetado como `NEW_EMBODIMENT`.
- Inferencia autocontenida: el paquete incluye processor, normalizacion y mapeo de embodiment, por lo que no requiere reconstruir esos componentes.
- No soporta (o no se documenta) tool calling, function calling, razonamiento multi-paso, agentes, vision general, audio ni modo de pensamiento. Es una politica de control, no un asistente conversacional.

## Casos de uso

- Manipulacion robotica de picking en linea de laboratorio: la politica puede recibir la imagen de la escena y el estado de las articulaciones y emitir los objetivos de las siete dimensiones (articulaciones mas pinza) a 15 Hz, apropiado para coger objetos como la zanahoria del dataset de entrenamiento.
- Apilado de cuencos en tareas de ensamblaje ligero: dado que el modelo se ha entrenado con 50 episodios de apilado simple y 50 de triple apilado, encaja en celdas que requieran colocar piezas de forma secuencial, con re-inferencia cada 1,067 segundos.
- Apilado de cubos como tarea de benchmark interno: util para validar la reproducibilidad del pipeline de ajuste fino comparando el rendimiento del checkpoint de 15 Hz frente al de 30 Hz sobre las mismas tareas.
- Punto de partida para ajuste fino posterior: al ser un checkpoint de BC limpio (sin critico ni adaptadores SVF), sirve como inicializacion para entrenamientos de RL offline o de refinamiento con IQL/SVF, tal como sugiere el repositorio de codigo referenciado.
- Investigacion en decimacion temporal de datos roboticos: el modelo documenta explicitamente la conversion de 30 Hz a 15 Hz con alineacion RGB/estado/accion, lo que lo convierte en un caso de estudio para analizar el efecto de reducir la frecuencia de control en politicas VLA.
- Evaluacion de estrategias de congelacion parcial: al entrenar solo LayerNorm/self-attention de la VLM, los proyectores y el DiT, es un ejemplo practico para medir el coste y el beneficio de congelar la torre visual y de lenguaje en politicas de manipulacion.
- Despliegue en hardware de laboratorio con GPU de gama alta: 3.144 millones de parametros permiten inferencia en tiempo real a 15 Hz con una unica GPU de 16-24 GB en bf16, sin necesidad de infraestructura multinodo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito por tarea, comparaciones con el checkpoint de 30 Hz ni metricas de simulador o de robot real. Tampoco se proporcionan datos de latencia medidos, solo la restriccion de diseno de ejecutar a 15 Hz (66,67 ms por intervalo de accion).

## Requisitos de hardware

- VRAM estimada para los pesos (3.144.016.000 parametros): aproximadamente 12,6 GB en fp32, 6,3 GB en bf16/fp16, 3,1 GB en int8 y 1,6 GB en int4. Las cifras en int8 e int4 son estimaciones teoricas: el autor no publica pesos cuantizados.
- A esa cifra hay que anadir la memoria de activaciones y el coste del codificador visual durante la inferencia; el tamano real del repositorio (12,6 GB) es coherente con pesos en fp32.
- GPU recomendadas: A100, H100 o L40S para despliegues con margen; RTX 4090 (24 GB) para bf16 con holgura.
- Cabe en GPU de consumo: si, en bf16 con 16 GB o mas (RTX 4080, 4070 Ti Super, 4060 Ti 16 GB). En tarjetas de 8-12 GB solo seria viable con cuantizacion, que no se distribuye en este repositorio.
- Opciones de despliegue: no disponibles en la informacion proporcionada. El autor referencias un repositorio de codigo propio (rama `q-vgm-critic`) para la inferencia. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no son herramientas orientadas a politicas VLA.
- Latencia y throughput: el presupuesto de control es de 66,67 ms por paso de accion a 15 Hz, con horizonte de 16 pasos (aproximadamente 1,067 s de ejecucion por bloque). No se publican latencias medidas ni throughput en acciones por segundo.
- Requisito de tiempo real: cualquier despliegue debe garantizar que la inferencia completa del bloque de 16 acciones cabe dentro del presupuesto temporal del controlador a 15 Hz.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de terceros en la informacion proporcionada, por lo que la comparativa se limita al propio linaje del modelo.

| Modelo | Parametros | Frecuencia | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gr00t-n17-bigenlight-50per-task-15hz-proj-dit-bc-step10000 (este modelo) | 3.144.016.000 | 15 Hz | horizonte de 16 acciones | no disponible | safetensors en HuggingFace, 0 descargas |
| gr00t-n17-bigenlight-50per-task-step10000 (modelo base) | no disponible | 30 Hz | no disponible | no disponible | checkpoint base referenciado en HuggingFace |
| Otras politicas VLA de la familia GR00T N1.7 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especializacion extrema: el modelo solo se ha entrenado sobre cuatro tareas (carrot, bowl stack, triple bowl stack, cube stack) y 200 episodios. Es previsible un mal rendimiento fuera de esa distribucion, aunque no se publican evaluaciones que lo cuantifiquen.
- Frecuencia de control obligatoria: debe ejecutarse a 15 Hz y no a 30 Hz. Usar el modelo a 30 Hz alteraria el significado temporal de las acciones y romperia la correspondencia con el horizonte entrenado.
- Normalizacion especifica: hay que usar las estadisticas de normalizacion incluidas en este repositorio y no las del checkpoint de 30 Hz. Mezclarlas invalidaria las predicciones.
- Embodiment fijado: entrenado para `ur7e_gello`, etiquetado como `NEW_EMBODIMENT` y explicitamente no UR5. No es transferible directamente a otro robot sin reentrenamiento del mapeo de embodiment.
- Licencia no disponible: no se especifica licencia, lo que impide determinar si el uso comercial esta permitido. Se debe contactar con el autor antes de cualquier despliegue productivo.
- Sin datos de benchmarks: no hay tasas de exito, curvas de aprendizaje ni comparaciones con el checkpoint de 30 Hz, por lo que no es posible estimar su calidad real de forma independiente.
- Sin datos de seguridad: no se documentan limites de fuerza, par ni comportamientos de parada segura, algo critico en manipulacion fisica real.
- Naturaleza del checkpoint: es un modelo de behavior cloning, no una politica refinada con IQL/SVF. No incluye critico, estados de optimizador ni adaptadores, por lo que no se puede reanudar el entrenamiento exactamente desde este punto.
- Idiomas y sesgos: no se especifica el idioma de las instrucciones ni se analizan sesgos del dataset de entrenamiento.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan ninguna relacion con el modelo (foros de pizza y reposteria). No aportan informacion tecnica util ni enlaces verificables sobre este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RLobot-jun/gr00t-n17-bigenlight-50per-task-15hz-proj-dit-bc-step10000
- Modelo base (checkpoint a 30 Hz): https://huggingface.co/RLobot-jun/gr00t-n17-bigenlight-50per-task-step10000
- Codigo de inferencia y entrenamiento (rama `q-vgm-critic`): https://github.com/jun981015/gr00t-bigenlight/tree/q-vgm-critic
- Resultados de busqueda web: no relevantes (foros de reposteria sin relacion con el modelo). No disponible ninguna otra referencia tecnica, paper o demo.
