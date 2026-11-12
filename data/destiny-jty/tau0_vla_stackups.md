# Destiny-JTY/tau0_vla_stackups

## Resumen

tau0_vla_stackups es un ajuste fino de parámetros completos del modelo base sii-research/tau-0-vla, un modelo de visión-lenguaje-acción (VLA) orientado a robótica manipulativa. Lo publica el usuario Destiny-JTY en Hugging Face y está especializado en una única tarea: apilar vasos de papel sobre una mesa ("Stack all the paper cups on the table together"). El modelo parte de una arquitectura transformer multimodal que procesa tres entradas RGB (cámara de cabeza y dos cámaras de muñeca) y emite comandos de posición articular para un robot ARX de doble brazo.

El ajuste se realizó sobre el conjunto de datos cups_v1, con 154 episodios de entrenamiento y 18 reservados (held-out), durante 10.000 pasos de optimizador en 8 GPU H100 de 80 GB. El checkpoint publicado es el final del entrenamiento y no cuenta con resultados medidos de éxito ni en held-out ni en robot real, por lo que debe considerarse un artefacto de investigación y no un modelo validado para producción.

Con 3.015.404.136 parámetros (aproximadamente 3.000 millones) y un repositorio de 36,9 GB, el modelo se distribuye en formato safetensors junto con el código de runtime necesario para su despliegue. No es un modelo Transformers estándar ni está disponible en la Inference API de Hugging Face: requiere el runtime tau0-VLA y su adaptador de comandos ARX, incluidos en el paquete como runtime_source.tar.gz. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en el modelo sii-research/tau-0-vla; transformer multimodal con cabecera de acciones (detalles internos de capas y atencion no disponibles) |
| Parametros totales | 3.015.404.136 (aproximadamente 3,0 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el paquete se distribuye en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors completo), con config, tokenizer/processor, run_spec, policy_manifest y finch_data_spec |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parámetros completos del checkpoint sii-research/tau-0-vla, un VLA que combina percepción visual multimodal con generación de acciones motoras. La interfaz de acción sigue un contrato nativo de 14 dimensiones: 6 articulaciones del brazo izquierdo, pinza izquierda, 6 articulaciones del brazo derecho y pinza derecha. Las unidades de los brazos son radianes y las pinzas usan las unidades crudas de posición articular registradas, con el mapeo de pinza ya aplicado. El ancho interno de estado y acción es de 40 dimensiones, y el runtime realiza la conversión nativo 14 a 40, la normalización y la decodificación relativa de brazos. La entrada visual son tres imágenes RGB (cabeza, muñeca izquierda, muñeca derecha) preprocesadas a 224x224.

El entrenamiento se ejecutó sobre cups_v1 con 154 episodios de entrenamiento y 18 de held-out, en 8 GPU H100 de 80 GB, con batch por GPU de 16, batch global de 128, acumulación 1, 10.000 pasos de optimizador, learning rate 2e-5, precisión bf16 y DeepSpeed ZeRO-1. El contrato de acción define state[t] = qpos[t] y target[t:t+30] como el comando de posición articular registrado en esa misma ventana, sin desplazamiento de un paso. No se habilitó RTC (real-time chunking). No se documentan detalles sobre la composición del dataset de preentrenamiento del modelo base ni sobre fases de RLHF o DPO.

## Capacidades

- Generación de comandos de posición articular para un robot ARX de doble brazo a partir de tres vistas RGB.
- Ejecución de una tarea manipulativa concreta: apilar vasos de papel sobre una mesa.
- Procesamiento multimodal con tres cámaras simultáneas (cabeza y dos muñecas) a resolución 224x224.
- Predicción de secuencias de acción de horizonte 30 pasos (target[t:t+30]).
- Decodificación relativa de brazos y normalización interna de estado/acción mediante el runtime.
- Servicio de inferencia vía API HTTP con el endpoint `/api/v1/arx-lift2s-command/policy-contract`.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general, código, matemáticas ni otros idiomas distintos del inglés.

## Casos de uso

- Investigación en manipulación robótica: servir como checkpoint de referencia para reproducir el ajuste fino de tau-0-vla sobre una tarea de apilado y comparar variantes de entrenamiento (learning rate, número de pasos, composición del dataset).
- Evaluación de contratos de acción: el paquete incluye un contrato de acción explícito (14D nativo, 40D interno, sin desplazamiento temporal), útil para validar pipelines de conversión entre el espacio del robot y el del modelo antes de desplegar políticas propias.
- Pruebas de integración de runtime: el runtime_source.tar.gz y el endpoint `/api/v1/arx-lift2s-command/policy-contract` permiten verificar la cadena completa de descarga, instalación y servicio en un entorno CUDA antes de sustituir el checkpoint por uno propio.
- Benchmark interno de políticas VLA: al ser un ajuste sobre una tarea acotada con 154 episodios, sirve como línea base de baja complejidad para medir el coste de entrenamiento (8 H100, 10.000 pasos) frente a políticas entrenadas desde cero.
- Prototipado de tareas de apilado en laboratorio: con validación previa de los puntos cero reales del robot y los límites de protección, puede usarse como punto de partida para experimentos de apilado de objetos ligeros en un banco de pruebas controlado.
- Docencia y demostraciones de VLA: el tamaño moderado (aproximadamente 3 B parámetros) y la licencia Apache 2.0 facilitan su uso en cursos y talleres sobre visión-lenguaje-acción, siempre que se disponga del hardware robótico ARX correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han medido resultados de éxito ni en held-out ni en robot real para este checkpoint final.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 3,0 B parámetros en bf16, el peso de los pesos ronda los 6 GB, a los que hay que sumar el runtime, los buffers de las tres cámaras y el estado de inferencia; una estimación conservadora sitúa el mínimo práctico en 16-24 GB de VRAM, aunque el autor no publica cifras.
- GPU de entrenamiento documentadas: 8 x H100 80 GB (bf16, DeepSpeed ZeRO-1, batch global 128).
- GPU recomendadas para inferencia: no especificadas por el autor; por tamaño de modelo, una A100 40 GB, H100 o RTX 4090 de 24 GB son candidatas razonables, pero no hay confirmación oficial.
- ¿Cabe en GPU de consumo? Probablemente en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bf16, sujeto a la VRAM real que consuma el runtime; no confirmado por el autor.
- Opciones de despliegue: exclusivamente el runtime tau0-VLA incluido (runtime_source.tar.gz), servido con `python -m deploy.server --model <dir> --device cuda --host 127.0.0.1 --port 10088`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ni con Transformers AutoModel.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Estado |
|---|---|---|---|---|---|
| tau0_vla_stackups (este) | 3,0 B | no disponible | Apilado de vasos con ARX | Apache 2.0 | Checkpoint final, sin métricas de éxito |
| sii-research/tau-0-vla (base) | no disponible | no disponible | VLA generalista | no disponible en la informacion proporcionada | Modelo base del ajuste |
| Otras políticas VLA de la familia tau-0 | no disponible | no disponible | Manipulación robótica | no disponible | No se dispone de datos en la informacion proporcionada |

No se dispone de información suficiente para comparar con alternativas de otros autores (por ejemplo, políticas VLA de tamaño similar) en parámetros, contexto, rendimiento o disponibilidad.

## Limitaciones y advertencias

- Ausencia total de validación: el autor declara que no se han medido resultados de éxito ni en held-out ni en robot real; el checkpoint no debe tratarse como una política validada.
- Especialización extrema: solo ejecuta la tarea "Stack all the paper cups on the table together"; no generaliza a otras tareas sin reentrenamiento.
- Idioma: únicamente inglés.
- Puntos cero y límites del robot sin validar: la model card advierte de que los puntos cero reales y los límites de protección del hardware requieren validación antes de cualquier uso físico.
- Dependencia del runtime: no funciona como modelo Transformers estándar ni en la Inference API; requiere el runtime tau0-VLA y su adaptador ARX, lo que limita la portabilidad.
- Estadísticas de normalización específicas: el finch_data_spec incluye estadísticas de normalización solo de entrenamiento; el autor advierte de no sustituirlas por las de pickplace o smoke.
- Reanudación de entrenamiento limitada: el paquete no incluye estados de optimizador ni RNG, por lo que la reanudación exacta del entrenamiento requiere la carpeta original checkpoint-N.
- Riesgo de alucinación y sesgos: no evaluados ni documentados para este checkpoint; al ser un modelo de acción, el fallo se manifiesta como comandos motores incorrectos, con riesgo físico asociado.
- Licencia Apache 2.0: permite uso comercial, pero la falta de validación y la dependencia de hardware ARX hacen desaconsejable su uso en producción sin una evaluación propia exhaustiva.
- Popularidad mínima: 3 descargas y 0 likes en el momento de la consulta, sin evidencia de uso comunitario ni de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Destiny-JTY/tau0_vla_stackups
- Modelo base: https://huggingface.co/sii-research/tau-0-vla
- Dataset de entrenamiento: https://huggingface.co/datasets/Destiny-JTY/arx_stackcups
