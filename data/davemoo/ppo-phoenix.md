# davemoo/ppo-phoenix

## Resumen

`davemoo/ppo-phoenix` es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) para jugar a Phoenix en el entorno `ALE/Phoenix-v5` del Arcade Learning Environment. No es un modelo de lenguaje: es una política neuronal de control con 1.223.129 parámetros que recibe como entrada 4 fotogramas apilados en escala de grises de 84x84 píxeles y emite una de 8 acciones discretas. Lo publica el usuario davemoo bajo la etiqueta `custom-implementation`, lo que indica que la implementación de PPO es propia y no una copia directa de librerías como Stable-Baselines3.

El interés de esta ficha es acotado pero relevante para quien trabaja en RL: se trata de un experimento reproducible de PPO con una arquitectura IMPALA de 15 capas convolucionales, 2.000.000 de pasos de agente (8.000.000 de fotogramas) y un conjunto completo de hiperparámetros documentados en la model card. La puntuación declarada es de 4687,19 ± 974,80 de recompensa media con política estocástica sobre 32 episodios y 4578,8 con política greedy, resultados marcados como no verificados por el autor.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no publica licencia ni idiomas soportados. Es, por tanto, un artefacto de investigación útil como referencia técnica y como punto de partida para reproducir o comparar experimentos, más que un componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN tipo IMPALA (15 capas convolucionales) con cabezas actor y crítica separadas de 2 capas; actor-crítico para PPO |
| Parametros totales | 1.223.129 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la entrada es una pila de 4 fotogramas de 84x84 en escala de grises |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors, presumiblemente en coma flotante de 32 bits) |
| Idiomas soportados | no aplica (agente de refuerzo sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`), con script de carga `load_example.py` |
| Entorno de entrenamiento | `ALE/Phoenix-v5`, con sticky actions de 0,25 y recorte de recompensa durante el entrenamiento |
| Acciones | 8 acciones discretas: NOOP, FIRE, RIGHT, LEFT, DOWN, RIGHTFIRE, LEFTFIRE, DOWNFIRE |
| Pasos de entrenamiento | 2.000.000 pasos de agente, equivalentes a 8.000.000 de fotogramas |

## Arquitectura y entrenamiento

La red sigue el diseño IMPALA, un tronco convolucional de 15 capas que procesa la pila de 4 fotogramas de 84x84 en escala de grises, seguido de dos cabezas independientes de 2 capas: una para la política (actor) y otra para la función de valor (crítica). La dimensionalidad de las capas ocultas es de 256 unidades (`hidden: 256`). El entrenamiento emplea PPO con 16 entornos en paralelo, `n_steps` de 128, 4 épocas de optimización por actualización y 4 minilotes, con `clip_eps` de 0,1 y `target_kl` desactivado.

Los hiperparámetros documentados incluyen una tasa de aprendizaje de 0,00025 con annealing activado, epsilon de Adam de 1e-5, recorte de norma de gradiente a 0,5, factor de descuento de 0,99 y GAE con lambda de 0,95. El coeficiente de entropía es 0,01 y el de la función de valor 0,5, con normalización de ventajas activada y `clip_vloss` desactivado. La evaluación se realiza cada 300.000 pasos sobre 8 episodios, con checkpoints cada 500.000 pasos, semilla 0 y `device: auto`. La recompensa se recorta durante el entrenamiento (sign-clipped) pero se mide sin recortar en evaluación.

## Capacidades

- Control de política en el juego Phoenix de Atari, con un espacio de 8 acciones discretas y recompensa media declarada de 4687,19 sobre 32 episodios.
- Procesamiento de observaciones visuales: pila de 4 fotogramas de 84x84 en escala de grises como entrada.
- Inferencia tanto estocástica (muestreo de la política) como determinista (greedy), con puntuaciones de 4687,2 y 4578,8 respectivamente.
- Entrenamiento con acciones pegajosas (sticky actions de 0,25), lo que introduce estocasticidad en el entorno y hace la política más robusta a desviaciones de acción.
- No dispone de tool calling, function calling, soporte de agentes multi-paso genérico, capacidades multilingües ni modos de razonamiento tipo thinking.
- No incorpora visión general fuera del dominio de Atari: el tronco convolucional está ajustado a fotogramas de 84x84 en escala de grises del emulador.

## Casos de uso

- Reproducción de experimentos de RL: sirve como referencia verificable de una implementación propia de PPO sobre un entorno de ALE, con todos los hiperparámetros publicados en la model card, lo que permite replicar el entrenamiento y comprobar la puntuación declarada.
- Comparación de algoritmos y arquitecturas: al ser un agente IMPALA de 1,2 millones de parámetros, se puede contrastar frente a variantes con tronco Nature CNN u otras configuraciones de PPO manteniendo el mismo entorno y presupuesto de pasos.
- Aprendizaje por imitación: las trayectorias generadas por la política greedy pueden usarse como datos de demostración para entrenar agentes con behavioural cloning o para inicializar políticas en tareas relacionadas.
- Docencia y formación en RL: el tamaño reducido del modelo (aprox. 4,9 MB en coma flotante de 32 bits) y su separación clara entre actor y crítica lo hacen adecuado para prácticas donde se inspeccione el efecto de cada hiperparámetro de PPO.
- Ajuste fino a otros juegos de ALE: el tronco convolucional y las cabezas se pueden reutilizar como inicialización para otros títulos del catálogo de Atari, reduciendo el coste de entrenamiento desde cero.
- Evaluación de robustez ante estocasticidad del entorno: el entrenamiento con sticky actions de 0,25 permite estudiar cómo se degrada la política cuando las acciones no se ejecutan de forma determinista, un escenario relevante para transferencia a entornos reales con ruido de actuación.
- Investigación sobre estabilidad de PPO: la configuración con `target_kl` desactivado, normalización de ventajas y annealing de la tasa de aprendizaje es un punto de partida útil para estudiar varianza de recompensa y colapso de política.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card (marcados como no verificados, `verified: false`):

| Metrica | Valor | Entorno | Observaciones |
|---|---|---|---|
| mean_reward (política estocástica) | 4687,19 ± 974,80 | ALE/Phoenix-v5 | 32 episodios |
| mean score (política greedy) | 4578,8 | ALE/Phoenix-v5 | Sin intervalo publicado |

La varianza de la puntuación estocástica es elevada (desviación típica de 974,80 sobre una media de 4687,19, aproximadamente un 21 % de la media), lo que conviene tener en cuenta al comparar con otros agentes. No se han publicado resultados de benchmarks adicionales ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima. Con 1.223.129 parámetros, el modelo ocupa aproximadamente 4,9 MB en coma flotante de 32 bits, por lo que cabe en cualquier GPU con más de 1 GB de memoria y también en CPU.
- GPU recomendadas: no requiere GPU dedicada. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es más que suficiente; incluso una iGPU moderna puede ejecutar la inferencia.
- Cabe en GPU consumer: sí, en prácticamente todas las disponibles en el mercado, y también en CPU.
- Opciones de despliegue: al ser un modelo de PyTorch con pesos safetensors, la vía natural es cargarlo con PyTorch y el script `load_example.py` del repositorio. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un agente de RL de este tipo.
- Latencia y throughput: no disponibles. Dado el tamaño, la latencia por paso sería del orden de microsegundos a milisegundos en GPU consumer, pero no hay cifras publicadas.
- Requisitos de entrenamiento: el coste real está en el entrenamiento, no en la inferencia. Los 2.000.000 de pasos de agente con 16 entornos paralelos y 8.000.000 de fotogramas requieren ejecutar el emulador de Atari a alta velocidad; en la configuración documentada se usó `device: auto`.

## Comparativa con modelos similares

No se dispone de datos de otros agentes sobre `ALE/Phoenix-v5` en la información proporcionada, por lo que no es posible ofrecer una comparación cuantitativa. A modo orientativo, los agentes comparables serían otros entrenados con PPO o DQN sobre el mismo entorno, con troncos convolucionales de tamaño similar (Nature CNN o IMPALA) y presupuestos de entrenamiento del orden de millones de fotogramas, pero no hay cifras disponibles para contrastar.

| Modelo | Parametros | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| davemoo/ppo-phoenix | 1.223.129 | ALE/Phoenix-v5 | 4687,19 ± 974,80 (estocástica), 4578,8 (greedy) | no disponible | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia no está especificada en el repositorio, por lo que no se puede confirmar que el uso comercial esté permitido. Conviene contactar con el autor antes de cualquier uso más allá de la investigación.
- Los resultados del model-index están marcados como no verificados (`verified: false`) y proceden únicamente del autor, sin evaluación independiente.
- La desviación típica de la recompensa es alta (± 974,80 sobre 32 episodios), lo que implica una variabilidad considerable entre episodios y dificulta comparaciones finas con otros agentes.
- Es un agente específico del juego Phoenix. No generaliza a otras tareas ni a otros juegos de Atari sin reentrenamiento o ajuste fino.
- No es un modelo de lenguaje ni admite entrada de texto, tool calling, agentes multi-paso ni capacidades multilingües. Cualquier uso fuera del control secuencial sobre observaciones visuales de 84x84 no es viable.
- El número de descargas y likes es cero, y el repositorio ocupa 0,0 GB; se trata de un artefacto de investigación con poca difusión y sin mantenimiento documentado.
- El entrenamiento usa recorte de recompensa (sign-clipped) durante la optimización y recompensa bruta en evaluación; comparar la puntuación publicada con la de otros agentes exige verificar que emplean el mismo protocolo de evaluación.
- Las fechas de creación y actualización del repositorio (23 de septiembre de 2026) y el intervalo de solo seis segundos entre ambas no permiten extraer conclusiones sobre la madurez o el mantenimiento posterior del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davemoo/ppo-phoenix
- Documentación de PPO en Spinning Up (OpenAI): https://spinningup.openai.com/en/latest/algorithms/ppo.html
- Anuncio original de PPO en OpenAI: https://openai.com/index/openai-baselines-ppo/
- Artículo introductorio de PPO en el blog de Hugging Face: https://huggingface.co/blog/deep-rl-ppo
- Introducción a PPO en GeeksforGeeks: https://www.geeksforgeeks.org/machine-learning/a-brief-introduction-to-proximal-policy-optimization/
- Paper de referencia del algoritmo PPO (Schulman et al., 2017): https://arxiv.org/abs/1707.06347
- Repositorio PhoenixOS con un ejemplo de modelo PPO (no relacionado con este modelo, aparece en los resultados de búsqueda): https://github.com/SJTU-IPADS/PhoenixOS/tree/v0/examples/ppo/model
