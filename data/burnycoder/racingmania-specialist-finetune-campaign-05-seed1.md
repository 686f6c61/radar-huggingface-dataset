# BurnyCoder/racingmania-specialist-finetune-campaign-05-seed1

## Resumen

`racingmania-specialist-finetune-campaign-05-seed1` es un agente de aprendizaje por refuerzo (RL) publicado por el desarrollador independiente BurnyCoder (Libor "Burny" Burian) dentro del proyecto de investigación RacingMania. No es un modelo de lenguaje: es una política neuronal entrenada con PPO para conducir un coche en un videojuego de carreras 3D original para navegador, construido con three.js y el motor de físicas cannon-es (`RaycastVehicle`). El repositorio del proyecto incluye el juego, un port en PyTorch de la misma física del vehículo y el código de entrenamiento.

El artefacto corresponde a la campaña de fine-tuning 05, semilla 1, de una serie de especialistas entrenados sobre una única pista (campaign-05). La política es una MLP de 2 capas de 256 unidades con activación tanh, con dos cabezas de tres vías (dirección y pedales) que comparten tronco actor-crítico. La observación combina el estado del coche con puntos de look-ahead sobre la línea central de la pista, y el objetivo de recompensa es el progreso respecto a esa línea central.

El interés de esta ficha es acotado y debe leerse con cautela: el propio autor marca el estado del modelo como "planned" (registrado, con código y configuración subidos antes del entrenamiento), y la model card indica explícitamente que no se ha registrado ningún paso de entrenamiento, hora de reloj, commit de Git, configuración de entrenamiento ni evaluación. Por tanto, se trata de un registro de reproducibilidad de un experimento, no de un modelo con resultados verificables publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP 2x256 tanh (actor y crítico), dos cabezas de 3 vías |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observación = estado del coche + puntos de look-ahead con ventana `window_k`) |
| Tipos de cuantizacion | no disponible (exportación a ONNX con normalizador congelado; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (agente de control, no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`final.pt`: `agent`, `norm`, `ppo`, `env_cfg`, `obs_dim`) y ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

La política es una red neuronal tipo perceptrón multicapa con dos capas ocultas de 256 unidades y activación tanh, compartida entre actor y crítico, con dos cabezas de salida de tres vías cada una: una para dirección (izquierda / ninguna / derecha) y otra para pedales (acelerar / inercia / frenar). El algoritmo de entrenamiento es PPO (Proximal Policy Optimization). La observación por defecto combina el estado del coche con puntos de look-ahead sobre la línea central, parametrizados por `window_k`, y el objetivo de recompensa es el progreso respecto a la línea central. Los estados iniciales de cada episodio son parado y posiciones aleatorias sobre la línea central.

El entrenamiento se realizó sobre una única pista (campaign-05) y la física corresponde a la versión v1. La model card no registra el número de pasos de agente entrenados, las horas de reloj, el commit de Git ni la configuración de entrenamiento (`run.json` aparece como "Not logged yet"), y el estado del artefacto figura como "planned", es decir, código y configuración subidos antes de ejecutar el entrenamiento. No se documenta uso de RLHF, DPO ni técnicas de decodificación especulativa; tampoco se describe innovación técnica adicional más allá del pipeline de simulación batcheada en PyTorch y la exportación de la política completa (función de observación + normalizador congelado + actor) a un único grafo ONNX para su ejecución en el navegador.

## Capacidades

- Control de conducción en un entorno de carreras 3D: produce acciones discretas de dirección (izquierda, ninguna, derecha) y pedales (acelerar, inercia, frenar).
- Seguimiento de la línea central y progreso en pista mediante observaciones de look-ahead.
- Inferencia determinista (acción más probable) y estocástica, según el modo configurado en `ppo.action_mode`.
- Exportación a ONNX para ejecución en el navegador dentro del juego RacingMania ("Watch the AI").
- Carga en PyTorch dentro del repositorio del proyecto, con normalizador de observaciones congelado.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modo de razonamiento: es una política de control, no un modelo generativo de propósito general.

## Casos de uso

- Reproducción de experimentos de RL: cargar `final.pt` o `policy.onnx` junto con `run.json` y las curvas de entrenamiento para replicar la campaña 05, semilla 1, dentro del repositorio con `uv sync`.
- Demostración interactiva en navegador: seleccionar el modelo en la opción "Watch the AI" del juego (`web/index.html` o la página de GitHub Pages) para observar la política conduciendo en la pista campaign-05.
- Estudio de especialización por pista: comparar este especialista de campaign-05 con los de otras campañas y semillas para analizar la varianza entre semillas y la transferencia entre pistas.
- Benchmark de referencia para agentes de conducción: usar la métrica SWS (success-weighted speed) definida por el proyecto como base para evaluar políticas propias en el mismo entorno y física v1.
- Integración en pipelines de simulación batcheada: emplear la política como controlador dentro del port en PyTorch de la física del coche para generar trayectorias o datos de entrenamiento adicionales.
- Docencia y divulgación de RL: ejemplo completo y de código abierto (MIT) de un ciclo PPO desde la simulación hasta el despliegue en navegador vía ONNX.

## Benchmarks y rendimiento

La model card define la métrica de evaluación SWS (success-weighted speed: media sobre pistas de terminadas × tiempo del conductor scriptado / tiempo del agente, con intervalos de confianza bootstrap al 95 % sobre pistas, una semilla) e indica explícitamente: "Not evaluated yet." No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño de la red (MLP 2x256), la inferencia es viable en CPU y en cualquier GPU consumer, pero no se publican cifras.
- GPU recomendadas: no disponibles; el artefacto está pensado para ejecutarse en CPU (PyTorch con `map_location="cpu"`) y en navegador mediante ONNX Runtime.
- Cabe en cualquier GPU consumer y en CPU; el despliegue principal es el navegador.
- Opciones de despliegue: PyTorch dentro del repositorio del proyecto y ONNX Runtime (`onnxruntime`) para el juego en navegador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (agentes RL para conducción en un juego propio) con parámetros, contexto, rendimiento y licencia verificables.

## Limitaciones y advertencias

- Estado "planned": el autor registra el artefacto antes del entrenamiento; no constan pasos entrenados, horas, commit ni configuración de entrenamiento, por lo que la existencia de una política entrenada y funcional no está verificada.
- Sin evaluación publicada: la sección de evaluación figura como "Not evaluated yet"; no hay métricas SWS ni resultados por pista.
- Especialización estrecha: entrenado sobre una única pista (campaign-05); no hay evidencia de generalización a otras pistas ni a variaciones de física distintas de la v1.
- Sin datos de sesgo ni de alucinación aplicables (no es un modelo de lenguaje), pero tampoco se documentan análisis de robustez, varianza entre semillas ni fallos conocidos.
- Licencia MIT permite uso comercial, pero el artefacto es un checkpoint de investigación sin garantías de rendimiento; conviene no desplegarlo en producción sin evaluación propia.
- Dependencia del repositorio del proyecto para cargar `final.pt` (importa `racingmania.env.obs`, `racingmania.rl.networks` y `racingmania.rl.normalizer`); el ONNX requiere respetar el contrato de entradas y salidas descrito en `docs/formats.md`, sección "Policy model".
- Idiomas: no aplica; no procesa texto.

## Enlaces

- Hugging Face: https://huggingface.co/BurnyCoder/racingmania-specialist-finetune-campaign-05-seed1
- Repositorio del proyecto (código, paper y resultados): https://github.com/BurnyCoder/reinforcement-learning-in-trackmania-like-racing-game
- Juego en navegador (GitHub Pages): https://github.com/BurnyCoder/reinforcement-learning-in-trackmania-like-racing-game (ruta `web/index.html` en el repositorio)
- Documentación de formatos (sección "Policy model"): `docs/formats.md` dentro del repositorio del proyecto
