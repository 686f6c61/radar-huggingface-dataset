# introvoyz045/Xiaomi-Robotics-1-RoboCasa

## Resumen

Xiaomi-Robotics-1-RoboCasa es un checkpoint de pesos publicado en Hugging Face para la evaluacion del modelo Xiaomi-Robotics-1 sobre el benchmark RoboCasa. Se trata de un modelo de vision-lenguaje-accion (VLA) orientado al control de robots manipuladores, construido sobre un backbone de la familia Qwen3-VL segun las etiquetas del repositorio. El checkpoint incluye los pesos, codigo personalizado de modelo y procesador para Transformers, ficheros de tokenizer y las estadisticas de normalizacion de acciones especificas de RoboCasa.

El repositorio declara 5.053.149.696 parametros en formato safetensors y un tamano de 10,1 GB, lo que es coherente con pesos en bf16. La licencia es Apache 2.0. El modelo se distribuye con `custom_code`, por lo que requiere `trust_remote_code=True` para su carga, y el entorno de referencia indicado es Python 3.11, PyTorch 2.8.0, Transformers 4.57.1 y FlashAttention 2.

Su relevancia actual radica en el escalado de modelos VLA con datos reales: el articulo asociado se titula "Scaling Vision-Language-Action Models with over 100K Hours of Real-World Trajectories". El unico resultado cuantitativo publicado en la model card es la tasa de exito en RoboCasa: 74,21% sobre 2400 episodios (24 tareas, 100 episodios por tarea), con un ratio de recorte de 0,95.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) sobre backbone Qwen3-VL; transformer con codificador de vision y cabeza de acciones; codigo personalizado (`custom_code`) |
| Parametros totales | 5.053.149.696 (5,05 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos safetensors; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 10,1 GB; carga en bfloat16 en la configuracion de referencia) |

## Arquitectura y entrenamiento

La informacion disponible describe un modelo de vision-lenguaje-accion (VLA) cuya columna vertebral corresponde a la familia Qwen3-VL, segun la etiqueta `qwen3-vl` del repositorio. La model card no detalla el numero de capas, la dimension oculta, el numero de cabezas de atencion, el mecanismo de fusion vision-lenguaje ni el esquema exacto de decodificacion de acciones; unicamente indica que el repositorio contiene el codigo personalizado del modelo y del procesador, los ficheros del tokenizer y las estadisticas de normalizacion de acciones de RoboCasa, necesarias para traducir las salidas del modelo a comandos de control del robot.

En cuanto a los datos de entrenamiento, el titulo del articulo asociado (arXiv:2607.15330) menciona el escalado con mas de 100.000 horas de trayectorias del mundo real. No se especifica en la informacion proporcionada el numero total de tokens, la composicion del dataset, la mezcla de datos simulados y reales, ni si se aplicaron tecnicas de ajuste por preferencias (RLHF, DPO) o de aprendizaje por imitacion con objetivos concretos. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. La innovacion declarada es, por tanto, la escala del corpus de trayectorias reales empleado para el entrenamiento del modelo VLA.

## Capacidades

- Control robótico de manipulacion: generacion de acciones motoras a partir de observaciones visuales e instrucciones, evaluado en 24 tareas de RoboCasa.
- Percepcion visual-lenguaje: al estar construido sobre un backbone Qwen3-VL, procesa imagenes y texto de forma conjunta.
- Extraccion de caracteristicas: el repositorio esta etiquetado con la tarea `feature-extraction`, ademas de `robotics`.
- Normalizacion de acciones especifica de dominio: incluye estadisticas de normalizacion para RoboCasa, lo que permite mapear las predicciones del modelo al espacio de acciones del entorno.
- Evaluacion multi-tarea en simulacion: la configuracion de referencia cubre 24 tareas con 100 episodios cada una.
- Integracion con Transformers: carga mediante `AutoModel` y `AutoProcessor` con `trust_remote_code=True`.
- Soporte de atencion optimizada: se indica FlashAttention 2 como implementacion de atencion en el entorno de referencia.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking), audio u otras modalidades: no disponible.

## Casos de uso

- Manipulacion domestica en cocina simulada: el modelo esta ajustado para RoboCasa, un benchmark de tareas de cocina, de modo que puede emplearse para evaluar politicas de manipulacion (abrir cajones, colocar objetos, usar electrodomesticos) en entornos simulados antes de un posible traslado a hardware real.
- Linea base de investigacion en VLA: sirve como referencia reproducible para comparar nuevos metodos de vision-lenguaje-accion sobre las mismas 24 tareas y 2400 episodios del protocolo de evaluacion publicado.
- Aprendizaje por imitacion a partir de trayectorias reales: el entrenamiento con mas de 100.000 horas de trayectorias del mundo real lo hace adecuado como punto de partida para ajuste fino con datos propios de un robot concreto.
- Generacion de acciones en bucle cerrado: al exponer estadisticas de normalizacion de acciones, puede integrarse en un bucle de control que reciba observaciones visuales y emita comandos normalizados compatibles con el entorno RoboCasa.
- Evaluacion distribuida en clúster: la model card menciona un lanzador estandar de ocho servidores para evaluacion multi-GPU reproducible, lo que encaja en flujos de validacion a gran escala en infraestructura de laboratorio.
- Extraccion de representaciones visuales y multimodales: la etiqueta `feature-extraction` permite usar el modelo para obtener embeddings de escenas e instrucciones en tareas auxiliares, como clasificacion de estados o recuperacion de episodios similares.
- Prototipado de habilidades pick-and-place en robotica industrial ligera: con ajuste fino adicional sobre datos del puesto de trabajo, la arquitectura VLA puede adaptarse a tareas de recogida y colocacion con instrucciones en lenguaje natural, siempre que se valide previamente en simulacion.
- Docencia y practicas de robotica: al ser un checkpoint de 5,05 mil millones de parametros con licencia Apache 2.0, es viable montar practicas de evaluacion VLA en laboratorios con GPUs de gama alta para consumidor.

## Benchmarks y rendimiento

Unico resultado publicado en la informacion disponible, correspondiente a la evaluacion en RoboCasa:

| Metrica | Valor |
|---|---:|
| Tareas | 24 |
| Episodios por tarea | 100 |
| Episodios totales | 2400 |
| Exitos | 1781 |
| Tasa de exito por episodio | 74,21% |
| Ratio de recorte | 0,95 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje o razonamiento. Tampoco se proporcionan comparaciones con otros modelos VLA sobre el mismo protocolo.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 10,1 GB solo de pesos (5,05 mil millones de parametros a 2 bytes), mas activaciones y el codificador de vision; en la practica se recomienda reservar entre 12 y 16 GB.
- VRAM estimada con cuantizacion: no disponible; no se documentan variantes de 8 o 4 bits ni formatos GGUF, AWQ o GPTQ.
- GPU recomendadas: tarjetas con al menos 16-24 GB de VRAM, como RTX 4090, RTX 3090, A100 (40 o 80 GB) o H100. La model card no especifica una GPU minima oficial.
- Compatibilidad con GPU de consumo: si, es probable que quepa en una RTX 4090 o RTX 3090 en bfloat16, siempre que la implementacion de atencion y el codigo personalizado no anadan sobrecoste significativo de memoria. No confirmado por el autor.
- Despliegue: carga mediante Transformers con `trust_remote_code=True` y `attn_implementation="flash_attention_2"`. La evaluacion multi-GPU reproducible requiere el lanzador de ocho servidores del repositorio fuente asociado.
- Opciones de servido como vLLM, llama.cpp, Ollama o TGI: no disponible; el uso de codigo personalizado y de un pipeline de robotica hace que el soporte en estos motores no este documentado.
- Latencia y throughput estimados: no disponible.
- Entorno de referencia: Python 3.11, PyTorch 2.8.0, Transformers 4.57.1, FlashAttention 2.

## Comparativa con modelos similares

No se dispone de datos verificados en la informacion proporcionada para construir una comparativa cuantitativa con otros modelos de vision-lenguaje-accion. La model card no incluye tablas comparativas frente a alternativas de la misma categoria, y los resultados de busqueda web disponibles no aportan informacion tecnica relacionada con este modelo ni con modelos comparables.

| Modelo | Parametros | Contexto | Rendimiento en RoboCasa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xiaomi-Robotics-1-RoboCasa | 5,05 mil millones | no disponible | 74,21% de exito (2400 episodios) | Apache 2.0 | Hugging Face, repo de 10,1 GB |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio esta publicado bajo la cuenta `introvoyz045`, no bajo la organizacion oficial citada en la propia model card (`XiaomiRobotics/Xiaomi-Robotics-1-RoboCasa`). Conviene verificar la procedencia y la integridad de los pesos antes de usarlos en produccion.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar codigo Python arbitrario incluido en el repositorio. Es un riesgo de seguridad relevante que exige revision del codigo antes de la carga.
- No se documentan sesgos conocidos, comportamiento en alucinacion ni limitaciones por idioma en la informacion disponible.
- No se especifica la longitud de contexto soportada, lo que impide planificar tareas que requieran historiales largos.
- No se detallan los idiomas soportados; la evaluacion publicada es exclusivamente de robotica y no linguistica.
- El unico resultado de rendimiento disponible (74,21% de exito en RoboCasa) corresponde a una configuracion concreta (24 tareas, 100 episodios por tarea, ratio de recorte 0,95) y no es extrapolable a otros entornos, robots ni tareas fuera de ese benchmark.
- El ajuste esta especializado en RoboCasa; su uso fuera de ese dominio requerira ajuste fino adicional con datos propios.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento ni sobre la ausencia de material con derechos de terceros en los pesos.
- El modelo registra 0 descargas y 0 "likes" en el momento de la consulta, y las fechas de creacion y actualizacion son 2026-10-16.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces recuperados no guardan relacion con robotica ni con inteligencia artificial, por lo que no se han podido contrastar datos tecnicos adicionales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/introvoyz045/Xiaomi-Robotics-1-RoboCasa
- Articulo citado por el autor: https://arxiv.org/abs/2607.15330 (Xiaomi-Robotics-1: Scaling Vision-Language-Action Models with over 100K Hours of Real-World Trajectories)
- Repositorio fuente complementario y guia `eval_robocasa/README.md`: mencionados en la model card, sin URL disponible
- Organizacion oficial citada en la model card: `XiaomiRobotics/Xiaomi-Robotics-1-RoboCasa` (URL no facilitada en la informacion disponible)
- Resultados de busqueda web adicionales: no se han encontrado enlaces relevantes sobre este modelo
