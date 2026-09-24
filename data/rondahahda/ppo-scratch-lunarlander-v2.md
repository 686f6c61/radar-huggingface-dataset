# rondahahda/ppo-scratch-LunarLander-v2

## Resumen

ppo-scratch-LunarLander-v2 es un agente de aprendizaje por refuerzo profundo publicado en Hugging Face por el usuario rondahahda. No es un modelo de lenguaje: se trata de una politica entrenada con PPO (Proximal Policy Optimization) sobre el entorno LunarLander-v2 de Gymnasium, implementada desde cero al estilo CleanRL como parte de la unidad 8, parte 1, del curso Deep Reinforcement Learning de Hugging Face. El repositorio se creo el 24 de septiembre de 2026 y acumula 0 descargas y 0 likes, con un tamano reportado de 0.0 GB.

El interes del artefacto es fundamentalmente didactico y reproducible: el autor documenta de forma explicita todos los hiperparametros del entrenamiento (1.000.000 de timesteps, 8 entornos vectorizados, 256 pasos por rollout, learning rate de 0.00025, clipping de 0.2, GAE con lambda 0.95), lo que permite replicar el experimento con la semilla declarada (seed = 1). Sin embargo, el rendimiento declarado en el model-index es de -74.79 +/- 26.85 de recompensa media, muy por debajo del umbral de 200 que Gymnasium considera "resuelto" para este entorno.

La relevancia actual es la de un ejemplo de trazabilidad de experimentos de RL en el Hub: la model card integra metadatos estandarizados (model-index, tags de tarea y dataset) y sirve como referencia de un pipeline PPO completo y minimalista, aunque el agente en si no alcanza un nivel de rendimiento apto para uso en produccion ni como politica de control fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor solo indica implementacion propia de PPO "CleanRL style"; no se detalla la topologia de las redes de politica y valor) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el agente consume en cada paso el vector de observacion de 8 dimensiones de LunarLander-v2 y no mantiene contexto textual |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible (la model card no declara campo de licencia) |
| Formato de pesos | no disponible (la model card no especifica el artefacto; el tamano reportado del repositorio es 0.0 GB) |
| Algoritmo | PPO con GAE (gamma 0.99, gae_lambda 0.95), clip_coef 0.2, ent_coef 0.01, vf_coef 0.5, max_grad_norm 0.5 |
| Entorno | LunarLander-v2 (Gymnasium, familia Box2D) |
| Espacio de observacion | vector continuo de 8 dimensiones (posicion, velocidad, angulo, velocidad angular, contacto de patas, senales de motor) |
| Espacio de acciones | discreto de 4 acciones (no hacer nada, motor izquierdo, motor principal, motor derecho) |
| Presupuesto de entrenamiento | 1.000.000 de timesteps, 8 entornos en paralelo, 256 pasos por rollout, 4 minibatchs, 4 epocas de actualizacion |
| Semilla declarada | 1 (no se documentan repeticiones con otras semillas) |
| Estado de publicacion | 0 descargas, 0 likes, creado y actualizado el 24 de septiembre de 2026 |

## Arquitectura y entrenamiento

La unica informacion disponible sobre la arquitectura es que se trata de una implementacion de PPO escrita desde cero y descrita como de estilo CleanRL, sin especificar el numero de capas ni de unidades de las redes de politica y valor. Dado que el espacio de observacion de LunarLander-v2 es un vector continuo de 8 dimensiones y el de acciones es discreto con 4 opciones, la arquitectura subyacente es necesariamente un perceptron multicapa pequeno, no una red convolucional ni un transformer, aunque la topologia exacta no esta publicada. No se documentan ni el numero de parametros ni la tasa de aprendizaje del critico de valor de forma independiente.

El entrenamiento sigue el esquema canonico de PPO: recoleccion de rollouts en 8 entornos vectorizados con 256 pasos por entorno, calculo de ventajas mediante GAE con lambda 0.95, optimizacion durante 4 epocas sobre 4 minibatchs con recorte de la razon de probabilidades en 0.2, coeficiente de entropia de 0.01, coeficiente del critico de valor de 0.5 y recorte del gradiente en norma 0.5. El presupuesto total es de 1.000.000 de timesteps con learning rate constante de 0.00025. No se menciona ningun uso de normalizacion de observaciones, curriculum learning, reward shaping ni ajuste posterior con DPO o RLHF (tecnicas ajenas, por otra parte, al aprendizaje por refuerzo de control).

## Capacidades

- Control de la nave de LunarLander-v2 mediante politica discreta de 4 acciones, a partir de observaciones vectoriales de 8 dimensiones.
- Aprendizaje de una politica y una funcion de valor compartiendo el mismo presupuesto de interaccion con el entorno, sin modelo del entorno (model-free).
- Integracion con el ecosistema de Gymnasium y de entornos vectorizados, ya que el entrenamiento se realizo con 8 copias simultaneas del entorno.
- Registro de metadatos de experimento en formato model-index, con declaracion de tarea (reinforcement-learning), dataset (LunarLander-v2) y metrica (mean_reward).
- Reproducibilidad de la configuracion: todos los hiperparametros y la semilla estan documentados en la model card.
- No dispone de soporte de tool calling, function calling, agentes multi-step en el sentido de los LLM, capacidades multilingues, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Material didactico del curso Deep RL de Hugging Face: el repositorio reproduce el ejercicio de la unidad 8, parte 1, por lo que sirve como referencia de codigo funcional para estudiantes que implementan PPO desde cero con la misma lista de hiperparametros.
- Baseline de comparacion para implementaciones propias: al fijar semilla 1 y documentar 1.000.000 de timesteps con 8 entornos, permite contrastar si una reimplementacion de PPO obtiene curvas de aprendizaje equivalentes bajo condiciones identicas.
- Punto de partida para ajuste de hiperparametros: la configuracion explicita (clip_coef, ent_coef, vf_coef, gae_lambda, num_minibatches) facilita ejecutar barridos de ablacion para medir el impacto de cada coeficiente en la recompensa media.
- Prueba de humo (smoke test) en infraestructura de RL: la evaluacion de un episodio de LunarLander-v2 es un ejercicio de coste minimo que valida el pipeline completo de carga de entorno, politica y bucle de evaluacion antes de escalar a tareas mas caras.
- Estudio del fallo de convergencia: con una recompensa media de -74.79, el checkpoint permite analizar modos de colapso de politica, sobreajuste a una semilla concreta o insuficiencia de presupuesto de entrenamiento en tareas de control continuo-discreto.
- Inicializacion para aprendizaje por transferencia o curricula: los pesos pueden reutilizarse como punto de partida de un entrenamiento continuado con reward shaping o con un mayor numero de timesteps, comparando la mejora respecto al punto de partida publicado.
- Ejemplo de publicacion de artefactos de RL en el Hub: ilustra como estructurar las tags, el pipeline y el bloque model-index para que un agente sea indexable y comparable con otros del ecosistema.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index. El campo `verified` tiene valor `false`, es decir, no han sido verificados de forma independiente.

| Tarea | Dataset / entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | LunarLander-v2 | mean_reward | -74.79 +/- 26.85 | No |

No se han publicado otros resultados de benchmarks en la informacion disponible. Para contextualizar la cifra sin salir de los datos aportados: el propio entorno LunarLander-v2 define como resuelto un agente cuando su recompensa media alcanza 200 o mas de forma sostenida (criterio estandar de la implementacion de referencia del entorno), de modo que el valor declarado de -74.79 queda lejos de ese umbral y sugiere una politica que no completa los aterrizajes de forma consistente. La desviacion de +/- 26.85 indica ademas una alta varianza entre episodios, coherente con evaluaciones sobre pocas partidas o con una politica poco estable.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta, ya que no se publica la topologia de la red. Al tratarse de una politica que mapea un vector de 8 entradas a 4 salidas discretas, el modelo es de escala muy reducida y su huella en memoria es de kilobytes o pocos megabytes en el caso de una MLP de dos capas ocultas tipica, aunque esta cifra no aparece confirmada en la model card.
- GPU recomendadas: no procede. El entrenamiento y la inferencia de una politica tabular-vectorial de este tipo se ejecutan sin problema en CPU; una GPU solo aportaria ventajas marginales por el coste de sincronizacion, y su uso seria razonable unicamente si se vectorizan cientos de entornos.
- Compatibilidad con GPU de consumo: si, cabe con holgura en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU moderna, e incluso en CPU sin GPU dedicada.
- Opciones de despliegue: no disponibles, dado que el formato de pesos no esta documentado. El ecosistema habitual del curso (Stable-Baselines3 con `model.zip` + `vec_normalize.pkl` y `gymnasium`/`box2d-py` como dependencias) no esta confirmado en este repositorio, cuya implementacion es propia y no basada en esa libreria.
- Latencia y throughput estimados: no disponibles. A modo de referencia cualitativa, la evaluacion de un episodio de LunarLander-v2 con una politica de este tamano se mide en milisegundos por paso en CPU, y el cuello de botella real es la simulacion fisica de Box2D, no la inferencia de la red.

## Comparativa con modelos similares

| Modelo / referencia | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rondahahda/ppo-scratch-LunarLander-v2 | no disponible | no aplica | mean_reward -74.79 +/- 26.85 (no verificado) | no disponible | Repositorio de Hugging Face, 0 descargas, 0 likes |
| CleanRL (implementacion de referencia de PPO, `vwxyzjn/cleanrl`) | no disponible | no aplica | no disponible en la informacion proporcionada | MIT (segun el repositorio original) | Codigo abierto en GitHub, mantenido por la comunidad |
| Stable-Baselines3 PPO sobre LunarLander-v2 | no disponible | no aplica | no disponible en la informacion proporcionada | MIT (segun el repositorio original) | Libreria publicada en PyPI y GitHub, con agentes ya entrenados en el Hub |
| Envios de la comunidad en el leaderboard del curso Deep RL de Hugging Face | no disponible | no aplica | no disponible en la informacion proporcionada | variable por repositorio | Publicos en el Hub |

La comparacion cuantitativa no es posible con los datos disponibles: ni CleanRL ni Stable-Baselines3 publican una cifra unica de recompensa media para LunarLander-v2 asociada a una semilla concreta, y el repositorio analizado no fija una referencia de exito. Cualitativamente, la diferencia principal es de proposito: CleanRL y Stable-Baselines3 son implementaciones mantenidas y documentadas, mientras que este artefacto es un ejercicio de curso con una unica semilla, sin verificacion externa y con un rendimiento declarado inferior al umbral de resolucion del entorno.

## Limitaciones y advertencias

- Rendimiento insuficiente para uso practico: una recompensa media de -74.79 esta muy por debajo del umbral de 200 que se considera resolucion del entorno, por lo que el agente no es fiable ni siquiera dentro de su propia tarea.
- Varianza elevada: la desviacion declarada de +/- 26.85 sugiere una politica inestable y resultados muy dependientes del episodio inicial.
- Sin verificacion independiente: el campo `verified` del model-index es `false`; la cifra procede unicamente del autor.
- Sobreajuste a una unica semilla: se entrena y evalua con seed = 1, sin repeticiones con otras semillas; no puede afirmarse robustez alguna frente a la aleatoriedad de inicializacion.
- Arquitectura no documentada: sin la topologia de las redes de politica y valor ni el formato del checkpoint, la reproducibilidad efectiva y la reutilizacion de los pesos quedan comprometidas.
- Restricciones de licencia: al no declararse licencia, no existe autorizacion explicita de uso comercial ni de redistribucion; en la practica, el uso del artefacto queda en un limbo juridico que desaconseja su incorporacion a productos.
- Cero adopcion: 0 descargas y 0 likes implican ausencia total de validacion por parte de la comunidad.
- Sesgos: en el contexto de un entorno fisico simulado, el concepto de sesgo social no aplica; el sesgo relevante es el de explotacion del entorno (overfitting a la dinamica exacta de LunarLander-v2), que impediria transferir la politica a cualquier variante del problema.
- Limitacion de idioma: no procede, al no ser un modelo de lenguaje.
- Fecha de publicacion anomala: la model card indica creacion el 24 de septiembre de 2026, posterior a la fecha de referencia habitual; conviene verificar la validez del registro antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rondahahda/ppo-scratch-LunarLander-v2
- Curso Deep Reinforcement Learning de Hugging Face (unidad 8, contexto declarado del ejercicio): https://huggingface.co/learn/deep-rl-course
- CleanRL, implementacion de referencia citada como estilo de codigo: https://github.com/vwxyzjn/cleanrl
- Entorno LunarLander-v2 en Gymnasium: https://gymnasium.farama.org/environments/box2d/lunar_lander/
- Articulo original de PPO (Schulman et al., 2017): https://arxiv.org/abs/1707.06347
- Articulo de Generalized Advantage Estimation (Schulman et al., 2015): https://arxiv.org/abs/1506.02438
- Stable-Baselines3 (alternativa de implementacion de PPO): https://github.com/DLR-RM/stable-baselines3

Nota: no se ha proporcionado ningun resultado de busqueda web para este modelo; los enlaces anteriores, salvo el del repositorio de Hugging Face, son referencias generales del ecosistema y no aparecen citados en la model card.
