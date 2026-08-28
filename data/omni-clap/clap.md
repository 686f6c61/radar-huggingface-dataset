# omni-CLAP/CLAP

## Resumen

CLAP (Cross-Embodiment Action-Conditioned Video World Models are Zero-Shot Physical Simulators) es un modelo de mundo de video condicionado por acciones, desarrollado por el equipo omni-CLAP. Su objetivo es actuar como un simulador físico zero-shot para robots de distintas morfologías, unificando los espacios de acción humanos y robóticos mediante poses de efector final, lenguaje y acciones latentes. Resuelve el problema de la falta de simuladores físicos fiables para robots, especialmente cuando no se dispone de datos específicos de una plataforma concreta.

El modelo se entrena en dos etapas: primero aprende priors físicos no supervisados a partir de vídeo sin etiquetar, y después los ancla en el espacio del efector final para permitir el despliegue directo. Está basado en difusión de vídeo y se ofrece en múltiples checkpoints según el espacio de condicionamiento (efector final, acciones latentes o lenguaje) y el nivel de adaptación (cross-embodiment, post-entrenamiento en DROID o Bridge, o adaptación a nuevas morfologías como robots bimanuales o humanoides G1). El repositorio ocupa 129,9 GB, aunque no se especifica el número de parámetros.

La relevancia actual de CLAP radica en que demuestra que un único modelo de mundo puede generalizar a múltiples robots sin entrenamiento específico por morfología, superando a baselines como DROID (sin post-entrenamiento) y Bridge (con post-entrenamiento) en tareas de predicción futura. Esto abre la puerta a la planificación y el aprendizaje por refuerzo en el mundo real con una cantidad mínima de datos de adaptación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Video diffusion model (action-conditioned) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de video, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (condicionamiento por lenguaje via CLIP embeddings) |
| Licencia | MIT |
| Formato de pesos | no especificado (probablemente safetensors; repo de 129,9 GB) |

## Arquitectura y entrenamiento

CLAP es un modelo de difusion de video condicionado por acciones. Su arquitectura no esta detallada en la informacion disponible, pero se indica que tiene el mismo numero de parametros y arquitectura que los modelos de video de una sola morfologia (como los baselines DROID y Bridge). El entrenamiento sigue un curriculo de dos etapas: primero aprende representaciones de acciones latentes (LAM, 32 dimensiones) a partir de video no etiquetado, incluyendo video humano egocentrico; despues se ancla en el espacio del efector final (7 dimensiones cartesianas + gripper) mediante datos de robots reales. Tambien existe una variante condicionada por lenguaje que usa captions CLIP por frame.

El entrenamiento se realizo durante 100.000 pasos sobre una mezcla de datasets de la Open X-Embodiment (OXE): fractal, fmb, bc_z, taco_play, furniture_bench, bridge y droid, mas egodex para la etapa LAM. Los modelos condicionados por efector final usan acciones absolutas, mientras que el modelo condicionado por lenguaje usa captions relativas a un frame de anclaje. La innovacion principal es la unificacion de espacios de accion heterogeneos (humanos y robots) en una representacion comun, lo que permite la transferencia cross-embodiment y la adaptacion few-shot a nuevas morfologias.

## Capacidades

- Generacion de video condicionado por acciones de efector final (7D cartesiano + gripper) o articulaciones (hasta 26D para humanoides).
- Condicionamiento por acciones latentes (32D) aprendidas de video sin etiquetar.
- Condicionamiento por lenguaje (captions CLIP por frame) para generacion guiada por texto.
- Generalizacion zero-shot a robots reales sin post-entrenamiento, segun los autores.
- Adaptacion few-shot a nuevas morfologias (bimanual YAM, humanoide G1) con pocos datos.
- Soporte para planificacion de inferencia y finetuning de RL con politicas como pi_0.5 y MolmoAct-2.
- Multiples checkpoints listos para usar: cross-embodiment (clap-curr, clap-ee, clap-lam, clap-lang), post-entrenados en DROID y Bridge, y adaptados a robots concretos.

## Casos de uso

- Planificacion de movimientos en robotica: CLAP puede generar trayectorias de video futuras a partir de una imagen actual y una accion propuesta, permitiendo evaluar el resultado antes de ejecutarla. Es adecuado porque su condicionamiento por efector final es directamente utilizable por politicas de control.
- Aprendizaje por refuerzo en el mundo real: el modelo actua como simulador fisico para entrenar politicas con RL sin necesidad de un simulador clasico, reduciendo la brecha sim-to-real.
- Teleoperacion asistida: durante la teleoperacion, CLAP puede predecir el siguiente frame dado el comando de efector final, ayudando al operador a anticipar consecuencias.
- Adaptacion a nuevos robots: con unos pocos ejemplos de una morfologia nueva, CLAP se adapta (checkpoints adapt-yam y adapt-g1) y permite generar video de ese robot sin reentrenar desde cero.
- Generacion de datos sinteticos para entrenamiento: se pueden generar secuencias de video de robots en tareas variadas para aumentar datasets de entrenamiento de politicas.
- Evaluacion de politicas en simulacion: dado un checkpoint de politica, CLAP puede simular el resultado de sus acciones en video, permitiendo evaluar el rendimiento antes del despliegue fisico.
- Investigacion en world models: sirve como base para estudiar la transferencia cross-embodiment y el aprendizaje de priors fisicos a partir de video no etiquetado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos en la informacion disponible. La model card menciona que CLAP iguala o supera a baselines de una sola morfologia como DROID (sin post-entrenamiento) y Bridge (con post-entrenamiento), pero no se ofrecen numeros concretos (MMLU, HumanEval, etc. no aplican a este tipo de modelo). El paper asociado (arXiv:2608.27406) probablemente contenga metricas detalladas, pero no estan accesibles en los materiales proporcionados.

## Requisitos de hardware

- El repositorio ocupa 129,9 GB, lo que sugiere checkpoints de gran tamano. Se recomienda una GPU con al menos 80 GB de VRAM (A100, H100) para cargar el modelo completo en precision FP16 o BF16.
- Con cuantizacion (no especificada), podria caber en GPUs de 48 GB (A6000, L40S), pero no hay datos oficiales.
- No es viable en GPUs de consumo (RTX 4090 con 24 GB) sin cuantizacion agresiva, que probablemente degrade la calidad de la generacion de video.
- Opciones de despliegue: el repositorio de GitHub proporciona CLI entrypoints (clap-rollout-replay, clap-teleop, clap-rollout-deploy, clap-eval). No se mencionan integraciones con vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- La latencia y el throughput dependen de la resolucion de video generado y del hardware; no se proporcionan datos estimados.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| CLAP (omni-CLAP) | Video world model cross-embodiment | no disponible | no aplica | Supera a DROID (sin post-train) y Bridge (con post-train) | MIT |
| DROID | Video world model single-embodiment | no disponible | no aplica | Baseline en robot DROID | no disponible |
| Bridge | Video world model single-embodiment | no disponible | no aplica | Baseline en robot Bridge | no disponible |

No hay otros modelos comparables publicamente disponibles con las mismas capacidades cross-embodiment. CLAP se distingue por unificar multiples morfologias en un unico modelo, mientras que los baselines estan limitados a una plataforma especifica.

## Limitaciones y advertencias

- Modelo muy reciente (agosto de 2026) con cero descargas y sin validacion independiente; los resultados reportados provienen exclusivamente de los autores.
- No se especifica el numero de parametros ni la arquitectura detallada, lo que dificulta la evaluacion de requisitos de hardware.
- La generacion de video es computacionalmente intensiva; el despliegue en tiempo real requiere hardware de gama alta.
- El condicionamiento por lenguaje depende de captions CLIP precalculadas; la calidad de las captions afecta directamente a la generacion.
- La generalizacion zero-shot se ha demostrado en los entornos mencionados (DROID, Bridge, YAM, G1), pero no hay evidencia de rendimiento en otros robots o entornos no vistos.
- Licencia MIT permite uso comercial, pero el modelo puede contener sesgos derivados de los datasets OXE, que estan dominados por entornos de laboratorio.
- No se proporcionan metricas de alucinacion o coherencia temporal de los videos generados; es necesario validar en cada caso de uso.

## Enlaces

- HuggingFace: https://huggingface.co/omni-CLAP/CLAP
- GitHub: https://github.com/omni-CLAP/clap
- Paper (arXiv): https://arxiv.org/pdf/2608.27406v1
- Web del proyecto: https://omni-clap.github.io
