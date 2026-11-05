# appssy3/connectailab-rl-solo-build-h-v3-lunarlander

## Resumen

`connectailab-rl-solo-build-h-v3-lunarlander` es un agente de aprendizaje por refuerzo profundo entrenado con DQN y sus variantes (Double DQN, 3-Step Return, Soft Target Update) para resolver el entorno `LunarLander-v3` de Gymnasium. Lo publica el autor `appssy3` bajo el paraguas de CONNECT AI LAB × AI CITY BUILDERS, dentro de una serie didáctica de "Solo Build" en la que cada versión (v1, v2, v3) incorpora mejoras algorítmicas incrementales sin cambiar la arquitectura de la red.

No se trata de un modelo de lenguaje: es una política de control (Q-network) que mapea un vector de estado de 8 dimensiones (posición, velocidad, ángulo, velocidad angular, contacto con el suelo y estado de las patas) a 4 acciones discretas (no hacer nada, encender motor izquierdo, encender motor principal, encender motor derecho). La red es un perceptrón multicapa de 8 → 128 → 128 → 4 con activaciones ReLU, un total de 18.180 parámetros.

Su relevancia es fundamentalmente pedagógica y de referencia: demuestra cómo técnicas estándar de estabilización del aprendizaje por refuerzo (eliminación del sesgo de sobreestimación de Q, retornos multi-paso, actualización suave del target y decaimiento coseno del learning rate) elevan la puntuación media de 233,6 a 274,4 en el conjunto de evaluación principal, superando el umbral de éxito de 200 puntos que fija el propio entorno.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) fully-connected: 8 → 128 → 128 → 4 con ReLU; agente DQN (Double DQN con 3-Step Return y Soft Target Update) |
| Parámetros totales | 18.180 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; el estado de entrada es un vector de 8 dimensiones por paso) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | `model.pt` (PyTorch, `state_dict` cargable con `torch.load`) |

## Arquitectura y entrenamiento

La red es un MLP de tres capas lineales con ReLU entre ellas: entrada de 8 dimensiones, dos capas ocultas de 128 neuronas y salida de 4 valores Q, uno por acción discreta del entorno `LunarLander-v3`. El entrenamiento se realizó durante 400.000 pasos de entorno, tomando como snapshot final el paso 382.500, seleccionado por ser el de mejor media agregada de las tres métricas de evaluación. La huella SHA-256 del checkpoint es `c8a06a2066`.

Las innovaciones respecto a las versiones anteriores son cuatro. Primero, Double DQN: la selección de la acción siguiente la hace la red online mientras que la evaluación del valor la hace la red target, lo que elimina la sobreestimación de Q. Segundo, retornos de 3 pasos combinados con un factor de descuento γ = 0,995, que acelera el aprendizaje de la relación causal entre la propulsión y la estabilidad del aterrizaje. Tercero, Soft Target Update con τ = 0,005 aplicado en cada paso, en lugar de copia dura cada 500 pasos, lo que evita el colapso de la puntuación en la fase final del entrenamiento. Cuarto, decaimiento coseno del learning rate de 5e-4 a 5e-5 y reducción del peso del reward shaping de 5,0 a 3,0 para alinear mejor la señal de entrenamiento con la recompensa original de Gymnasium. La pérdida es Smooth L1 y se aplica recorte de norma de gradiente a 10,0.

## Capacidades

- Control discreto de un lander en el entorno `LunarLander-v3`: selecciona una de 4 acciones (inacción, propulsor izquierdo, propulsor principal, propulsor derecho) a partir de un estado de 8 dimensiones.
- Aterrizaje estable y suave entre las dos banderas del terreno, con actitud controlada y bajo consumo de combustible.
- Generalización a semillas no vistas: mantiene medias de 268-274 puntos en conjuntos de evaluación con seeds 2000-2009 y 7000-7009.
- Inferencia determinista por `argmax` sobre los valores Q, sin muestreo estocástico.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, visión, audio ni capacidades multilingües.
- No dispone de modo "thinking" ni de ningún mecanismo de cadena de pensamiento.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como referencia ejecutable de cómo pasar de un DQN básico a Double DQN con retornos multi-paso y soft target, permitiendo al alumnado comparar checkpoints v1, v2 y v3 sobre el mismo entorno.
- Baseline de comparación en experimentos académicos: al tener una arquitectura mínima de 18.180 parámetros, es un punto de partida barato para medir el impacto de cambios en reward shaping o en el algoritmo de actualización.
- Test de pipelines de evaluación RL: útil para validar infraestructura de evaluación con seeds fijos (2000-2009, 7000-7009) y comprobar que el entorno Gymnasium está correctamente configurado.
- Demostración de control continuo discretizado: ejemplo de cómo un MLP pequeño puede resolver una tarea física con dinámica no trivial, útil en cursos de robótica introductoria o control.
- Integración en notebooks educativos: el checkpoint se carga en pocas líneas con `hf_hub_download` y `torch.load`, lo que facilita su uso en entornos como Google Colab sin GPU.
- Referencia para ablaciones de hiperparámetros: la model card documenta explícitamente γ, τ, learning rate y retornos multi-paso, lo que permite reproducir y modificar cada componente de forma aislada.
- Verificación de reproducibilidad: el hash SHA-256 del checkpoint y las seeds de evaluación permiten comprobar que una ejecución local reproduce las puntuaciones declaradas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente; `verified: false` en el model-index). La recompensa se mide sobre la recompensa original de Gymnasium `LunarLander-v3`, con umbral de éxito en 200 puntos.

| Métrica | Seeds | v1 (baseline) | v2 (reward shaping) | v3 (esta versión) |
|---|---|---|---|---|
| Media 10 episodios (principal) | 2000-2009 | 233,6 | 253,0 | 274,4 |
| Media holdout 10 episodios | 7000-7009 | No disponible | 251,8 | 270,2 (máx. 272,9) |
| Media reto de aterrizaje 5 episodios | 7000-7004 | 247,6 (borrador) | 274,2 | 268,9 (máx. 273,6) |
| Media agregada de las 3 métricas | — | No disponible | 259,7 | 271,2 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB; el modelo tiene 18.180 parámetros en float32 (unos 73 KB de pesos), por lo que cabe holgadamente en cualquier GPU, CPU o incluso en memoria de un microcontrolador de gama alta.
- GPU recomendadas: ninguna en particular; cualquier GPU con soporte CUDA sirve, aunque la inferencia es igual de rápida en CPU.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, GTX 1650, etc.) y también en CPU sin penalización perceptible por episodio.
- Opciones de despliegue: PyTorch nativo (`torch.load` + `forward`), exportación a TorchScript u ONNX si se requiere, y ejecución dentro del bucle de Gymnasium. No aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño de la red, la latencia por paso es del orden de microsegundos en CPU moderna, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Entorno | Arquitectura | Parámetros | Media declarada | Licencia |
|---|---|---|---|---|---|
| connectailab-rl-solo-build-h-v3-lunarlander (este) | LunarLander-v3 | MLP 8-128-128-4, Double DQN + 3-Step + Soft Target | 18.180 | 274,4 (seeds 2000-2009) | No disponible |
| connectailab-rl-solo-build-h-v2-lunarlander (mismo autor) | LunarLander-v3 | MLP 8-128-128-4, DQN con reward shaping | 18.180 | 253,0 (seeds 2000-2009) | No disponible |
| connectailab-rl-solo-build-h-v1-lunarlander (mismo autor) | LunarLander-v3 | MLP 8-128-128-4, DQN vanilla | 18.180 | 233,6 (seeds 2000-2009) | No disponible |
| Alternativas de terceros para LunarLander-v3 | LunarLander-v3 | Varía (PPO, A2C, SAC, DQN) | Varía | No disponible en la información proporcionada | Varía |

No se dispone de datos verificados de modelos comparables de otros autores en la información proporcionada; la comparativa se limita a las versiones del mismo autor.

## Limitaciones y advertencias

- Sesgos conocidos: no aplica en el sentido habitual de sesgos sociales o lingüísticos, pero la política está sobreajustada a la dinámica exacta de `LunarLander-v3`; no se transferirá a otros entornos sin reentrenamiento.
- Riesgo de alucinación: no aplica; el modelo no genera texto. Sí existe riesgo de sobreestimación residual de Q, mitigado pero no eliminado por Double DQN.
- Limitaciones de contexto o idioma: no procesa lenguaje; la entrada está restringida a un vector de 8 dimensiones con la semántica concreta del entorno.
- Restricciones de licencia: la licencia no está declarada en la model card ni en los metadatos de HuggingFace, por lo que no se puede asumir uso comercial libre; hay que contactar con el autor antes de cualquier uso en producción.
- Caveat de producción: las métricas están declaradas por el autor con `verified: false`; conviene reproducirlas con las seeds indicadas antes de tomar decisiones basadas en ellas.
- El entrenamiento se detuvo en el paso 382.500 de 400.000; no se documenta una evaluación posterior al snapshot ni análisis de varianza entre ejecuciones completas.
- El repositorio ocupa 0,0 GB según HuggingFace, lo que sugiere que el checkpoint puede ser muy pequeño o que el tamaño no se ha indexado correctamente; verificar la descarga antes de integrarlo en un pipeline.
- La model card está redactada en coreano y contiene fragmentos de código con identificadores en ese idioma; hay que adaptarlos si se reutiliza el snippet.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/appssy3/connectailab-rl-solo-build-h-v3-lunarlander
- Entorno Gymnasium `LunarLander-v3`: no disponible en la información proporcionada
- Paper de DQN original: no disponible en la información proporcionada
- Paper de Double DQN: no disponible en la información proporcionada
- Repositorio del autor o del curso CONNECT AI LAB: no disponible en la información proporcionada
- Vídeo de demostración (`replay.mp4`): referenciado en la model card dentro del propio repositorio de HuggingFace
