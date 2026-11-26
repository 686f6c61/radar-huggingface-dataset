# DavidHidary/lewm-jax

## Resumen

LeWorldModel (LeWM) en formato JAX es una conversión de los checkpoints originales en PyTorch del modelo de mundo LeWorldModel a Safetensors nativos para JAX, usando la librería Equinox. No se trata de un modelo de lenguaje, sino de un world model orientado a entornos de control y robótica (PushT, Cube, TwoRooms y Reacher), es decir, un modelo que aprende la dinámica latente de un entorno para predecir transiciones y planificar acciones. El repositorio lo publica DavidHidary como port del trabajo original de Lucas Maes y los checkpoints PyTorch de Quentinll.

La relevancia de esta ficha es acotada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su interés es fundamentalmente de infraestructura, ya que permite ejecutar los pesos de LeWM sin depender de PyTorch, aprovechando el ecosistema JAX (jit, vmap, pmap) y Equinox. Cada entorno se distribuye como un subdirectorio independiente con su propio `config.json` y `model.safetensors`, lo que facilita la carga selectiva.

No se dispone de información sobre arquitectura interna, número de parámetros, contexto ni datos de entrenamiento en la documentación proporcionada. El tamaño del repositorio (0,3 GB) sugiere pesos de dimensión moderada, pero no permite inferir el recuento de parámetros con precisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (world model; pesos convertidos desde LeWorldModel original) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; presumiblemente fp32/bf16, sin confirmar) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (nativo JAX/Equinox) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de LeWorldModel. Por el nombre y los entornos soportados (PushT, Cube, TwoRooms, Reacher), se trata de un world model para aprendizaje por refuerzo basado en modelo, que aprende una representación latente de la dinámica del entorno y se emplea para planificación o entrenamiento de políticas. El repositorio no documenta el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO, ya que no es un modelo generativo de texto.

La innovación técnica de este repositorio concreto es la conversión de los pesos originales en PyTorch a Safetensors cargables desde JAX con Equinox, manteniendo la equivalencia funcional con los checkpoints de origen (`quentinll/lewm-pusht`, `quentinll/lewm-cube`, `quentinll/lewm-tworooms`, `quentinll/lewm-reacher`). Esto permite reutilizar los pesos en pipelines JAX sin conversión manual.

## Capacidades

- Modelado de dinámica latente en entornos de control (PushT, Cube, TwoRooms, Reacher).
- Predicción de transiciones de estado para planificación basada en modelo.
- Carga selectiva por entorno mediante el parámetro `subfolder` en `load_lewm_jax`.
- Compatibilidad con el ecosistema JAX (transformaciones jit/vmap) y Equinox.
- No soporta generación de texto, tool calling, agentes conversacionales ni capacidades multilingües, al no ser un modelo de lenguaje.
- No se documentan capacidades de visión, audio ni modos de razonamiento explícito.

## Casos de uso

- Investigación en model-based reinforcement learning: cargar el checkpoint de PushT o Reacher para reproducir experimentos de planificación en espacio latente sin depender de PyTorch.
- Portabilidad de pipelines a JAX: integrar los pesos en flujos de entrenamiento acelerado con `jit` y `vmap` sobre TPU o GPU, aprovechando el ecosistema JAX.
- Evaluación comparativa de world models: usar los cuatro entornos como banco de pruebas homogéneo para medir calidad de predicción de dinámica.
- Reproducibilidad académica: verificar resultados del trabajo original de LeWorldModel cargando los mismos pesos en un stack distinto.
- Desarrollo de controladores basados en modelo: emplear el world model para simular rollouts y seleccionar acciones en tareas de manipulación (Cube, PushT).
- Docencia y prototipado: ejemplos mínimos de carga de checkpoints en JAX con Equinox para cursos de RL y modelos generativos de dinámica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio completo ocupa 0,3 GB, por lo que cada checkpoint individual es presumiblemente pequeño y cabe en GPUs de consumo.
- GPU recomendadas: no documentadas; por el tamaño del repo, cualquier GPU con soporte JAX (RTX 3090/4090, A100, H100) debería ser suficiente, aunque no se confirma.
- GPU de consumo: probablemente sí (dado el tamaño del repositorio), sin confirmación oficial.
- Opciones de despliegue: JAX + Equinox mediante `le_wm_jax.checkpoint.load_lewm_jax`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un world model).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| DavidHidary/lewm-jax | World model (JAX) | no disponible | no disponible | MIT | safetensors |
| quentinll/lewm-pusht | World model (PyTorch) | no disponible | no disponible | no disponible | PyTorch |
| quentinll/lewm-cube | World model (PyTorch) | no disponible | no disponible | no disponible | PyTorch |
| quentinll/lewm-tworooms | World model (PyTorch) | no disponible | no disponible | no disponible | PyTorch |
| quentinll/lewm-reacher | World model (PyTorch) | no disponible | no disponible | no disponible | PyTorch |

La comparativa se limita a los checkpoints de origen, ya que no se dispone de datos de otros world models comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes conversacionales.
- Solo cubre cuatro entornos concretos (PushT, Cube, TwoRooms, Reacher); no es un modelo generalista.
- No se documentan sesgos, tasas de alucinación ni métricas de robustez.
- Licencia MIT, lo que permite uso comercial, pero se recomienda verificar la licencia de los checkpoints originales de los que se derivan los pesos.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni mantenimiento demostrado.
- No se especifican requisitos de versión de JAX o Equinox; posibles incompatibilidades con versiones futuras.
- Al ser una conversión de pesos, cualquier error de mapeo entre PyTorch y JAX podría afectar a la equivalencia funcional; no se documentan tests de paridad.

## Enlaces

- Hugging Face: https://huggingface.co/DavidHidary/lewm-jax
- Repositorio del port JAX: https://github.com/dhidary/le-wm-jax
- Repositorio original de LeWorldModel: https://github.com/lucas-maes/le-wm
- Checkpoint original PushT: https://huggingface.co/quentinll/lewm-pusht
- Checkpoint original Cube: https://huggingface.co/quentinll/lewm-cube
- Checkpoint original TwoRooms: https://huggingface.co/quentinll/lewm-tworooms
- Checkpoint original Reacher: https://huggingface.co/quentinll/lewm-reacher
