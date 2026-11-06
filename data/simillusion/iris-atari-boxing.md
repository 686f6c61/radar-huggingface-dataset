# simillusion/iris-atari-boxing

## Resumen

IRIS (Transformers are Sample-Efficient World Models) aplicado a Atari Boxing es un checkpoint de demostración publicado por simillusion (Param Thakkar) dentro de la biblioteca open source Simulusion, una librería en PyTorch que unifica distintos modelos del mundo bajo una misma API. El modelo implementa la arquitectura descrita en el paper de Micheli, Alonso y Fleuret presentado en ICLR 2023: un autoencoder vectorial-cuantizado (VQ-VAE) que comprime cada fotograma del juego en 16 tokens discretos y un Transformer que modela la dinámica del entorno como una secuencia de tokens y acciones. La política del agente se entrena exclusivamente dentro de la imaginación del Transformer, sin interacción adicional con el emulador.

El checkpoint está entrenado sobre ALE/Boxing-v5 durante 300 épocas, lo que equivale a 60.000 pasos reales de entorno, en una GPU de portátil RTX 3050 con 4 GB de VRAM. No es una reproducción de los resultados del paper: el autor lo describe explícitamente como una demo de tamaño reducido para mostrar el funcionamiento del modelo en hardware de consumo. Aun así, la política aprende a cerrar distancia y a intercambiar golpes, y en una ronda completa en el emulador real perdió 31-32 tras ir ganando 29-21 con 24 segundos restantes, es decir, un nivel similar al oponente integrado del juego.

Su relevancia es doble: por un lado, sirve como ejemplo reproducible de model-based RL con world models en un entorno clásico; por otro, demuestra que el pipeline completo (autoencoder, Transformer y actor-critic) cabe en una GPU de gama baja, lo que lo convierte en un punto de partida práctico para experimentar con planificación en el espacio latente y entrenamiento por imaginación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer sobre tokens discretos (VQ-VAE de 16 tokens por fotograma + Transformer autorregresivo + actor-critic) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de secuencia del Transformer; valor numérico no publicado) |
| Tipos de cuantizacion | no disponible (checkpoint en precisión de entrenamiento, sin variantes GGUF/AWQ publicadas) |
| Idiomas soportados | no disponible (modelo de control sobre píxeles, no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | state dict de PyTorch (carga con `torch.load(..., weights_only=True)`), incluye estado del optimizador |

## Arquitectura y entrenamiento

IRIS sigue un esquema de dos etapas. Primero, un autoencoder VQ-VAE aprende a comprimir cada fotograma de Atari Boxing en 16 tokens discretos, reduciendo la dimensionalidad visual a un vocabulario manejable. Después, un Transformer autorregresivo modela la secuencia intercalada de tokens de observación y acciones, de modo que puede predecir el siguiente token visual y la recompensa dada la historia previa. La política (actor-critic) se entrena sobre rollouts generados íntegramente por el Transformer, sin volver al emulador, lo que constituye la principal fuente de eficiencia de muestras del método.

El entrenamiento de este checkpoint concreto se realizó con 300 épocas, 200 pasos de autoencoder y 200 del Transformer por época, y 50 pasos de actor-critic con batch de 64 por época, sobre ALE/Boxing-v5. La pérdida perceptual emplea VGG16 de torchvision (528 MB adicionales que se descargan en la primera carga del agente). El autor indica que el paper original alcanza aproximadamente +70 de recompensa con varias veces más entrenamiento de política por época; este checkpoint no replica ese resultado y debe interpretarse como una demo funcional, no como una reproducción.

## Capacidades

- Modelado del entorno: predice el siguiente fotograma (en espacio de tokens) y la recompensa a partir de la historia de observaciones y acciones.
- Rollouts imaginados: permite generar trayectorias completas dentro del world model sin interactuar con el emulador.
- Control de agente: la política integrada (`IRISAgent`) selecciona acciones para Atari Boxing.
- API unificada: la interfaz `encode / step / rollout / decode` es común a todos los world models de Simulusion.
- Reentrenamiento: los checkpoints incluyen estado del optimizador, por lo que se puede continuar el entrenamiento.
- No soporta tool calling, function calling, agentes multi-paso genéricos, visión general, audio ni capacidades multilingües; es un modelo específico de control sobre píxeles de un único juego.

## Casos de uso

- Investigación en model-based RL: punto de partida reproducible para estudiar la eficiencia de muestras de IRIS sin necesidad de clúster, ya que el entrenamiento completo cabe en 4 GB de VRAM.
- Experimentos con planificación en espacio latente: el world model permite evaluar variantes de búsqueda o de política sobre rollouts imaginados antes de tocar el emulador.
- Docencia y divulgación: demo visual de cómo un Transformer "sueña" una partida de Atari token a token, útil para explicar world models en cursos o charlas.
- Pruebas de la librería Simulusion: sirve como caso de referencia para validar la API `load_world_model` y la integración con `IRISAgent`.
- Fine-tuning sobre otros juegos de ALE: al incluir estado del optimizador y ser un state dict estándar, se puede reutilizar como inicialización para entornos similares.
- Benchmarking de hardware de consumo: permite medir tiempos de entrenamiento e inferencia del pipeline IRIS en GPUs de gama baja como la RTX 3050.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de rendimiento es cualitativo y específico del juego: en una ronda completa en el emulador real, el agente perdió 31-32 tras ir 29-21 con 24 segundos restantes, frente a una referencia del paper de aproximadamente +70 de recompensa con más entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el entrenamiento completo se ejecutó en 4 GB de VRAM, por lo que la inferencia del world model y del agente debería caber holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: RTX 3050 (validada por el autor), RTX 3060/4060, RTX 4090, A100 o H100 para entrenamientos más largos.
- Cabe en GPU de consumo: sí, al menos en la RTX 3050 de 4 GB empleada para el entrenamiento.
- Opciones de despliegue: la librería propia `simulusion` (PyTorch); no hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Enfoque | Entorno | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IRIS (este checkpoint) | World model con VQ-VAE + Transformer, política por imaginación | Atari Boxing (ALE/Boxing-v5) | 300 épocas, 60.000 pasos reales, RTX 3050 | MIT | Hugging Face, vía Simulusion |
| IRIS original (Micheli et al., 2023) | Mismo método | Atari 100k (conjunto de juegos) | Configuración del paper, ~+70 de recompensa | Código público del paper | Repositorio del paper |
| DreamerV3 | World model recurrente con RSSM | Múltiples dominios (Atari, control continuo, Minecraft) | Entrenamiento a gran escala | MIT | Código y pesos públicos |
| Simulusion (otros checkpoints) | Misma API, distintos world models | Varios entornos | Distintos | MIT | Hugging Face / galería del proyecto |

La comparación con DreamerV3 es solo cualitativa: no se dispone de métricas comunes en la información proporcionada.

## Limitaciones y advertencias

- No es una reproducción del paper: el autor lo califica explícitamente como demo de tamaño reducido con resultados inferiores a los del trabajo original.
- Rendimiento limitado: el agente queda a la par del oponente integrado del juego, no lo supera de forma consistente.
- Específico de un único entorno: entrenado solo para Atari Boxing; no generaliza a otros juegos sin reentrenamiento.
- Sin capacidades de lenguaje: no procesa texto, no soporta tool calling ni agentes conversacionales.
- Riesgo de alucinación del world model: al entrenar la política sobre rollouts imaginados, los errores de dinámica del Transformer pueden propagarse y degradar el comportamiento.
- Licencia MIT: permite uso comercial y modificación, pero el autor pide citar el paper de IRIS y el software Simulusion.
- Dependencia externa: la primera carga del agente descarga VGG16 de torchvision (528 MB) para la pérdida perceptual.
- Documentación escasa: no se publican recuentos de parámetros, longitud de contexto ni métricas de latencia, lo que dificulta estimar costes en producción.
- Fecha de creación del repositorio inusual (2026-10-27): conviene verificar la vigencia y el mantenimiento del proyecto antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/simillusion/iris-atari-boxing
- Paper de IRIS: https://arxiv.org/abs/2209.00588
- Repositorio Simulusion: https://github.com/ParamThakkar123/simulusion
- Galería de clips y curvas de aprendizaje: https://paramthakkar123.github.io/simulusion/gallery.html
