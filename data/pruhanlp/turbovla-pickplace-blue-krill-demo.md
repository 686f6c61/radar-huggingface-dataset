# PruhaNLP/TurboVLA-pickplace-blue-krill-demo

## Resumen

TurboVLA-pickplace-blue-krill-demo es un checkpoint de politica robotica condicionada por lenguaje, desarrollado por PruhaNLP, que resuelve el problema de control visuomotor de un brazo SO-100 en tareas de recogida y colocacion. A diferencia de los modelos vision-language-action convencionales, TurboVLA elimina el LLM del bucle de inferencia: DINOv3 codifica las camaras, un BERT codifica la instruccion, seis capas de atencion cruzada bidireccional fusionan ambas representaciones y un decodificador de estilo ACT predice directamente 12 objetivos de articulaciones en una sola pasada hacia delante, sin bucle de denoising ni decodificacion token a token.

El modelo tiene 216.072.210 parametros (aproximadamente 216 M), un tamano de repositorio de 0,9 GB y pesos en fp32. Este checkpoint concreto es la epoca 12 de un ajuste fino desde PruhaNLP/TurboVLA-base sobre el conjunto de datos PruhaNLP/pickplace-blue-krill-demo, compuesto por 100 episodios de teleoperacion y 30.636 fotogramas capturados sobre un SO-ARM100 en el simulador MuJoCo.

Su relevancia actual radica en la eficiencia: genera un chunk de 12 acciones en unos 40 ms consumiendo alrededor de 1 GB de VRAM, lo que lo aleja de los VLA basados en LLM, mucho mas costosos en computo y memoria. La distribucion de pesos se realiza bajo la licencia DINOv3, mientras que el codigo TurboVLA es Apache-2.0, y esta pensado para ejecutarse dentro del estudio RoboSim at Home.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con codificador visual DINOv3, codificador de texto BERT, 6 capas de atencion cruzada bidireccional y decodificador estilo ACT (no LLM en el bucle) |
| Parametros totales | 216.072.210 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (instruccion de texto breve condicionando el chunk de acciones) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en fp32) |
| Idiomas soportados | no disponible |
| Licencia | dinov3-license (licencia "other", DINOv3 License para los pesos); el codigo TurboVLA es Apache-2.0 |
| Formato de pesos | safetensors (fp32), con config.json, stats.safetensors y tokenizer |

## Arquitectura y entrenamiento

TurboVLA sustituye el nucleo LLM de los VLA clasicos por una pila mas ligera. Dos torres de codificacion independientes procesan las entradas: DINOv3 codifica las imagenes de las camaras (`front` y `wrist` en RGB) y BERT codifica la instruccion en lenguaje natural. Seis capas de atencion cruzada bidireccional fusionan la informacion visual y textual, y un decodificador de estilo ACT genera directamente un chunk de 12 objetivos articulares absolutos (12 x 6) en una unica pasada, con una frecuencia de salida de 15 Hz. Tambien consume un estado articular de 6 grados de libertad. No hay bucle de denoising ni decodificacion autoregresiva. El checkpoint se distribuye en fp32.

El entrenamiento de este checkpoint parte de PruhaNLP/TurboVLA-base y se ajusta sobre el conjunto PruhaNLP/pickplace-blue-krill-demo: 100 episodios de teleoperacion, 30.636 fotogramas, sobre un SO-ARM100 en MuJoCo. Se ejecutaron 11.496 pasos (12 epocas con tamano de lote 32) con una tasa de aprendizaje de 5e-5, entrenando DINOv3 y manteniendo BERT congelado. El tiempo de entrenamiento fue de aproximadamente 2 horas en una unica GPU V100. La perdida L1 paso de 0,052 tras la epoca 1 a 0,015 en la epoca 12. El autor indica que la demo equivalente de SmolVLA necesito 20 epocas sobre los mismos datos, frente a las 12 de este modelo.

## Capacidades

- Generacion de acciones roboticas: predice un chunk de 12 objetivos de articulaciones absolutos (12 x 6) en una sola pasada hacia delante.
- Control condicionado por lenguaje: interpreta instrucciones textuales (por ejemplo, "Pick up the blue krill oil bottle and place it inside the blue tray") para condicionar la politica.
- Percepcion visual multimodal: consume simultaneamente imagenes de camara frontal (`front`) y de muneca (`wrist`) en RGB.
- Fusion vision-lenguaje: combina representaciones DINOv3 (vision) y BERT (texto) mediante atencion cruzada bidireccional.
- Inferencia de baja latencia: genera el chunk de 12 acciones en aproximadamente 40 ms a 15 Hz.
- Integracion con el estado articular: toma como entrada un estado de articulaciones de 6 grados de libertad.
- No dispone de modo de razonamiento explicito (thinking mode), vision generativa, audio ni tool calling, ya que no incorpora un LLM en el bucle.

## Casos de uso

- Recogida y colocacion (pick-and-place) en simulacion: la tarea para la que fue entrenado, colocando objetos como una botella en una bandeja a partir de instrucciones de lenguaje. Se usaria como politica de referencia en RoboSim at Home sobre un SO-ARM100 en MuJoCo.
- Investigacion en VLA sin LLM: permite estudiar politicas visuomotoras que prescinden de un LLM en el bucle, midiendo si la fusion DINOv3 + BERT + atencion cruzada es suficiente frente a arquitecturas basadas en LLM.
- Ajuste fino sobre datos propios: sirve como punto de partida (base) para reentrenar sobre nuevos conjuntos de episodios de teleoperacion recogidos con un brazo lider real y escenas MuJoCo aleatorizadas.
- Evaluacion comparativa de arquitecturas de politica: al existir demos equivalentes de SmolVLA y ACT sobre los mismos datos, permite comparar el coste (epocas, latencia) y el comportamiento entre enfoques.
- Despliegue en hardware de bajos recursos: con ~1 GB de VRAM y ~40 ms por chunk, se puede ejecutar en GPUs modestas para prototipado de control robotico.
- Benchmarking de aprendizaje por imitacion: util como baseline en estudios de imitacion condicionada por lenguaje sobre brazos de bajo coste tipo SO-100.
- Docencia y demostraciones en navegador: el flujo de RoboSim at Home permite ejecutar el modelo y generar escenas directamente en un navegador con un unico comando de instalacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que se trata de un modelo de politica robotica. Los unicos datos de rendimiento facilitados son metricas de entrenamiento e inferencia:

| Metrica | Valor |
|---|---|
| Perdida L1 (epoca 1) | 0,052 |
| Perdida L1 (epoca 12) | 0,015 |
| Epocas | 12 |
| Pasos | 11.496 (batch 32) |
| Latencia por chunk | ~40 ms para 12 acciones |
| VRAM de inferencia | ~1 GB |
| Frecuencia de control | 15 Hz |
| Tiempo de entrenamiento | ~2 h en una V100 |

El autor senala, ademas, que la demo de SmolVLA sobre los mismos datos necesito 20 epocas frente a las 12 de TurboVLA. No se proporcionan tasas de exito en tarea, ni comparaciones cuantitativas de exito frente a SmolVLA o ACT.

## Requisitos de hardware

- VRAM de inferencia: aproximadamente 1 GB, segun el autor.
- GPU de entrenamiento utilizada: una unica V100 (entrenamiento de ~2 horas).
- GPU recomendadas: no se especifican modelos concretos; por el bajo consumo de VRAM (~1 GB), es previsible que quepa en GPU de consumo (se desconoce la lista exacta, dato no disponible).
- Cabe en GPU de consumo: si, dado el consumo declarado de ~1 GB de VRAM; no se detallan modelos concretos compatibles.
- Opciones de despliegue: integracion a traves del estudio RoboSim at Home; tambien se puede cargar fuera del estudio con la clase `TurboEngine` del modulo `model/turbovla.py` del repositorio (por ejemplo, `engine = TurboEngine(device="cuda")`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica.
- Latencia y throughput: ~40 ms por chunk de 12 acciones, a una frecuencia de control de 15 Hz.

## Comparativa con modelos similares

Los unicos modelos comparables mencionados en la informacion son las demos del mismo autor sobre los mismos datos.

| Modelo | Tipo | Epocas | Latencia / VRAM | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TurboVLA-pickplace-blue-krill-demo | VLA sin LLM (DINOv3 + BERT + atencion cruzada + ACT) | 12 | ~40 ms por chunk, ~1 GB VRAM | dinov3-license (pesos) / Apache-2.0 (codigo) | HuggingFace, PruhaNLP |
| SmolVLA-pickplace-blue-krill-demo | VLA basado en LLM | 20 | no disponible | no disponible | HuggingFace, PruhaNLP |
| Demo ACT (pickplace-blue-krill) | Politica de imitacion (ACT) | no disponible | no disponible | no disponible | RoboSim at Home, PruhaNLP |

No se dispone de comparaciones cuantitativas de rendimiento (tasa de exito, precision) entre estos modelos ni con alternativas externas.

## Limitaciones y advertencias

- Ambito muy restringido: es un ajuste fino para una tarea concreta (pick-and-place de una botella en una bandeja) sobre un SO-ARM100 en MuJoCo; no es un modelo general.
- Dependencia de la simulacion: fue entrenado con datos generados en MuJoCo; el rendimiento en un brazo fisico real no esta documentado y puede degradarse por la diferencia de dominio (sim-to-real).
- Sin datos de idiomas: el campo de idiomas soportados figura como no disponible; las instrucciones del ejemplo estan en ingles.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de acciones incorrectas o no seguras cuando el estado visual o la instruccion quedan fuera de la distribucion de entrenamiento.
- Sesgos: no documentados en la informacion proporcionada. Al depender de DINOv3 y BERT, puede heredar sesgos de esos codificadores en la representacion de escenas e instrucciones.
- Restricciones de licencia: los pesos contienen parametros derivados de DINOv3 y se distribuyen bajo la DINOv3 License (licencia "other"), cuyo texto debe revisarse antes de cualquier uso comercial. El codigo TurboVLA es Apache-2.0. La licencia no es una licencia abierta estandar.
- Metrica limitada: la unica metrica publicada es la perdida L1 de entrenamiento; no hay tasas de exito en tarea ni evaluacion en validacion independiente.
- Adopcion incipiente: el repositorio registra 0 descargas y 0 "likes" en el momento de los datos, por lo que no existe aun validacion por parte de la comunidad.
- Frecuencia de control fija: el diseno asume 15 Hz (frecuencia del conjunto de datos); operar a otras frecuencias puede requerir reajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PruhaNLP/TurboVLA-pickplace-blue-krill-demo
- Modelo base: https://huggingface.co/PruhaNLP/TurboVLA-base
- Conjunto de datos: https://huggingface.co/datasets/PruhaNLP/pickplace-blue-krill-demo
- Demo SmolVLA: https://huggingface.co/PruhaNLP/SmolVLA-pickplace-blue-krill-demo
- Paper (arXiv): https://arxiv.org/abs/2607.27205
- Repositorio RoboSim at Home: https://github.com/PruhaNLP/robosim-at-home
- Modulo de inferencia: https://github.com/PruhaNLP/robosim-at-home/blob/main/model/turbovla.py
- Licencia DINOv3: https://huggingface.co/PruhaNLP/TurboVLA-pickplace-blue-krill-demo/blob/main/DINOv3_LICENSE.md
