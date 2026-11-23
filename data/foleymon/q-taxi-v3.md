# foleymon/q-Taxi-v3

## Resumen

q-Taxi-v3 es un agente de aprendizaje por refuerzo entrenado mediante Q-Learning tabular para resolver el entorno Taxi-v3 de Gymnasium. Lo desarrolla el usuario foleymon como parte de la Unidad 2 del curso de Deep Reinforcement Learning de Hugging Face, y se publica como un artefacto de aprendizaje (un diccionario serializado con pickle) en lugar de un modelo neuronal con pesos en safetensors o GGUF. No es un modelo de lenguaje: no procesa texto ni genera respuestas, sino que aprende una tabla de valores Q que mapea estados discretos del entorno a acciones.

Taxi-v3 es un problema clásico de planificación con 500 estados posibles (25 posiciones del taxi x 5 destinos de pasajero x 4 ubicaciones de pasajero), 6 acciones discretas y recompensas que penalizan cada paso (-1), las recogidas y entregas ilegales (-10) y premian la entrega correcta (+20). El agente reporta una recompensa media de 7,63 +/- 2,93 sobre ese entorno, un valor coherente con una política que completa la tarea pero no de forma óptima.

Su relevancia es fundamentalmente didáctica y de referencia: sirve como ejemplo mínimo reproducible de Q-Learning tabular, útil para comparar implementaciones, validar pipelines de RL y como baseline educativo. No tiene aplicaciones en producción de IA generativa ni compite con modelos fundacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla de valores Q estado-acción, sin red neuronal) |
| Parametros totales | No disponible (tabla Q de 500 estados x 6 acciones; tamaño del fichero no publicado, repo de 0.0 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (entorno de RL con 500 estados discretos, sin ventana de contexto) |
| Tipos de cuantizacion | No disponible (no aplica; pesos serializados en pickle) |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | Pickle (`q-learning.pkl`), descargable vía `huggingface_hub` |

## Arquitectura y entrenamiento

El agente implementa Q-Learning clásico, un método de diferencias temporales off-policy que actualiza una tabla Q(s, a) mediante la regla Q(s,a) <- Q(s,a) + α[r + γ·max_a' Q(s',a') - Q(s,a)]. No hay red neuronal, atención, capas ni embeddings: la política se extrae directamente de la tabla aprendida (típicamente con una estrategia epsilon-greedy durante el entrenamiento y greedy en evaluación). El espacio de estados es discreto y finito, lo que hace viable la representación tabular sin aproximación de función.

Según la model card, el entrenamiento se realizó durante 25.000 episodios con tasa de aprendizaje α = 0,7, factor de descuento γ = 0,95 y decaimiento de epsilon de 0,005. No se especifica la política inicial de epsilon, el tamaño de la tabla ni si se aplicó alguna variante (por ejemplo, Q-Learning de doble estimación o SARSA). No se documenta ningún proceso de RLHF, DPO ni ajuste fino posterior, ni innovaciones técnicas destacables más allá de la implementación estándar del algoritmo.

## Capacidades

- Resolución del entorno Taxi-v3: selecciona acciones discretas (mover norte, sur, este, oeste, recoger pasajero, dejar pasajero) a partir del estado observado.
- Aprendizaje por refuerzo tabular: política determinista derivada de la tabla Q.
- Reproducibilidad didáctica: el artefacto se carga con `pickle` y permite inspeccionar la tabla Q y el `env_id`.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso fuera del bucle episódico del entorno.
- No tiene capacidades multilingües.
- No dispone de modo thinking, visión, audio ni generación de texto.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo resuelto de la Unidad 2 del curso de Hugging Face para ilustrar Q-Learning tabular, con hiperparámetros concretos (α = 0,7, γ = 0,95, 25.000 episodios) y una recompensa media de referencia.
- Baseline de comparación: emplear la recompensa media de 7,63 +/- 2,93 como punto de partida para evaluar variantes (SARSA, Q-Learning con doble estimación, DQN) sobre Taxi-v3.
- Validación de pipelines de RL: comprobar que un entorno de entrenamiento y evaluación reproduce el mismo `env_id` y la misma distribución de recompensas al cargar el pickle.
- Reproducción de experimentos: reentrenar con los mismos hiperparámetros y comparar la tabla Q resultante con la publicada para estudiar la varianza entre ejecuciones.
- Pruebas de integración de `huggingface_hub`: verificar la descarga de artefactos no neuronales (pickle) y su carga en scripts de Python.
- Material de aula para visualizar políticas: inspeccionar la tabla Q para dibujar la política greedy sobre el mapa de Taxi-v3 y explicar la diferencia entre recompensa acumulada y óptima.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index de la model card (no verificados):

| Metrica | Tarea | Dataset | Valor |
|---|---|---|---|
| mean_reward | reinforcement-learning | Taxi-v3 | 7,63 +/- 2,93 |

No se han publicado otros resultados de benchmarks en la informacion disponible. No hay comparación con agentes alternativos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el artefacto es una tabla Q serializada en pickle y se ejecuta en CPU.
- GPU recomendadas: ninguna; no requiere aceleración por hardware.
- Cabe en cualquier consumer GPU y también en CPU, Raspberry Pi o entornos sin GPU.
- Opciones de despliegue: script Python con `pickle` + `huggingface_hub.hf_hub_download`; integración con Gymnasium para ejecutar episodios. No aplica vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles; dependen del bucle de simulación del entorno, no del modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| q-Taxi-v3 (foleymon) | Q-Learning tabular | Taxi-v3 | Tabla 500 x 6 | No aplica | mean_reward 7,63 +/- 2,93 | No disponible | Hugging Face |
| Agentes Q-Learning del curso HF (otros usuarios) | Q-Learning tabular | Taxi-v3 | Tabla 500 x 6 | No aplica | No disponible en esta busqueda | No disponible | Hugging Face |
| DQN sobre Taxi-v3 | Red neuronal (DQN) | Taxi-v3 | Del orden de decenas de miles de parametros | No aplica | No disponible en esta busqueda | No disponible | Implementaciones en repos públicos |

No se dispone de datos verificados de benchmarks para los modelos alternativos en la informacion proporcionada; la comparativa es estructural y no de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no aplica en el sentido de sesgos sociales; el agente está sobreajustado a la dinámica exacta de Taxi-v3 y no generaliza a otros entornos.
- Riesgo de alucinación: no aplica (no genera texto), pero la política puede ser subóptima y ejecutar acciones legales pero ineficientes.
- Limitaciones de contexto o idioma: no procesa lenguaje; el espacio de estados está fijado a los 500 estados de Taxi-v3.
- Restricciones de licencia: la licencia no está disponible en la información proporcionada, por lo que no se puede confirmar el uso comercial.
- Caveat de producción: el artefacto se carga con `pickle`, lo que implica riesgo de ejecución de código arbitrario si el fichero no es de confianza; no usar en pipelines de producción sin verificación previa.
- La recompensa media reportada (7,63) no está verificada (`verified: false`) y no se acompaña de desviación por episodios ni de número de evaluaciones.
- No se documenta la política de epsilon inicial ni el tamaño exacto del artefacto, lo que dificulta la reproducibilidad completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/foleymon/q-Taxi-v3
- Curso de Deep Reinforcement Learning de Hugging Face (Unidad 2, Q-Learning): https://huggingface.co/learn/deep-rl-course/unit2/introduction
- Entorno Taxi-v3 en Gymnasium: https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentación de `huggingface_hub.hf_hub_download`: https://huggingface.co/docs/huggingface_hub/guides/download
