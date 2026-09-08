# djmango/openfront-rl

## Resumen

`djmango/openfront-rl` es un conjunto de checkpoints de políticas PPO (Proximal Policy Optimization) para un agente de self-play en el juego OpenFront.io, desarrollado por el autor `djmango`. El modelo se entrena con el stack Rust `oftrain` del repositorio `djmango/openfront-ai` y publica los pesos en formato safetensors. No se trata de un modelo de lenguaje, sino de un agente de aprendizaje por refuerzo para un juego de estrategia en tiempo real.

La arquitectura del policy es un esquema `oftrain-policy` v3, compuesto por una torre de rejilla espacial y flujos separados para jugadores y unidades, con una capa recurrente LSTM de 512 unidades. Las observaciones se codifican mediante autoencoders de teselas congelados (`ae_v32_nostatic`) y un bypass de estado exacto para información de diplomacia y escalares. El entrenamiento combina PPO con GAE y un currículo multi-mapa basado en victorias.

La relevancia del modelo radica en su aplicación a investigación en RL para juegos, especialmente en entornos con acción discreta enmascarada por legalidad y observaciones espaciales. El run actual es `ppo_v11`, con aproximadamente 16,2 millones de pasos de entorno y 2486 actualizaciones. Los pesos ocupan unos 154 MB, aunque el repositorio completo supera los 234 GB por el historial de checkpoints.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Policy `oftrain-policy` v3: torre de rejilla espacial + flujos de jugador/unidad, LSTM (hidden_size=512) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa un policy basado en PPO con GAE. La arquitectura `oftrain-policy` v3 combina una torre de rejilla espacial (spatial grid tower) con flujos separados para jugadores y unidades. La capa recurrente es una LSTM con `hidden_size=512`, usando BPTT de 24 pasos y rollout de 48. El contexto se denomina `action-outcome-v1` y se reinicia en cada `episode_done`.

Las observaciones se componen de dos autoencoders de teselas congelados: uno fino a 1/8 y otro grueso a 1/16, ambos con variante `ae_v32_nostatic`. Además, hay un bypass de estado exacto que proporciona información de diplomacia, escalares y transitorios. Las acciones son discretas y se enmascaran por legalidad, cubriendo la superficie completa de intenciones de OpenFront.

El entrenamiento se realiza con PPO + GAE, utilizando un currículo multi-mapa con promoción y degradación basadas en victorias (win-gated). El run actual `ppo_v11` ha alcanzado la etapa 23 del currículo, con aproximadamente 16,2 millones de pasos de entorno y 2486 actualizaciones. El esquema de recompensa es `v10-anti-spiral-v1` bajo el currículo `v10`. El motor nativo de OpenFront se usa para la generación de datos, con soporte opcional de "Node hedge".

## Capacidades

- Agente de self-play para OpenFront.io, capaz de tomar decisiones en tiempo real sobre el conjunto completo de acciones del juego.
- Acciones discretas enmascaradas por legalidad, lo que impide seleccionar acciones inválidas en cada estado.
- Soporte de información de diplomacia y estado exacto mediante el bypass de estado en las observaciones.
- Manejo de secuencias temporales mediante LSTM con contexto `action-outcome-v1`.
- Integración con el stack de entrenamiento `oftrain` en Rust y scripts de Python para restauración de checkpoints y juego en vivo.
- No es un modelo de lenguaje: no genera texto ni soporta tool calling, agentes conversacionales ni razonamiento simbólico.

## Casos de uso

- Investigación en aprendizaje por refuerzo para juegos de estrategia en tiempo real: el modelo sirve como baseline para estudiar PPO con currículo multi-mapa y enmascaramiento de acciones.
- Desarrollo de agentes autónomos para OpenFront.io: se puede cargar el checkpoint `ppo_v11/latest.safetensors` y ejecutarlo contra el motor del juego para evaluar su comportamiento.
- Benchmarking de políticas recurrentes: la LSTM de 512 unidades permite comparar el rendimiento de agentes con memoria temporal en entornos espaciales parcialmente observables.
- Estudio de autoencoders de observación: el modelo depende de los encoders `ae_v32_nostatic`, lo que facilita experimentos sobre representaciones aprendidas de teselas.
- Pruebas de algoritmos de entrenamiento self-play: el esquema de recompensa y el currículo win-gated permiten analizar dinámicas de promoción y degradación en entrenamiento de agentes.
- Replicación de pipelines de RL: el repositorio `openfront-ai` proporciona scripts para sincronizar checkpoints y jugar en vivo, útil para reproducir experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ya que este modelo no es un modelo de lenguaje. Tampoco se ofrecen datos de rendimiento en el entorno OpenFront.io más allá de los pasos de entorno y actualizaciones indicados en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los pesos ocupan aproximadamente 154 MB, lo que sugiere que la inferencia es ligera, pero no se especifican requisitos mínimos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño de los pesos, pero no hay confirmación oficial.
- Opciones de despliegue: el modelo se integra con el stack Rust `oftrain` y scripts de Python. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría. Al tratarse de un agente de RL específico para OpenFront.io, no hay alternativas públicas documentadas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede procesar ni generar texto, por lo que no es adecuado para tareas de NLP, chatbots o generación de código.
- Depende de los autoencoders de teselas congelados del repositorio hermano `djmango/openfront-tile-autoencoder`; sin esos encoders, las observaciones no son interpretables.
- El entrenamiento se ha realizado exclusivamente en el entorno OpenFront.io, por lo que el agente no generaliza a otros juegos o dominios.
- El repositorio tiene un tamaño de 234,5 GB debido al historial de checkpoints, aunque los pesos actuales son mucho menores. Esto puede dificultar la descarga si se clona todo el repositorio.
- No se han publicado benchmarks formales ni evaluaciones contra agentes humanos o de referencia.
- La licencia MIT permite uso comercial, pero OpenFront es un proyecto separado; se deben revisar los términos de ese juego antes de desplegar el agente en producción.
- El estado del modelo es experimental: el autor indica que se prefiera el puntero `latest.*` y que los hitos antiguos se han podado, lo que sugiere un desarrollo activo y sujeto a cambios.

## Enlaces

- Hugging Face: https://huggingface.co/djmango/openfront-rl
- Repositorio de entrenamiento: https://github.com/djmango/openfront-ai
- Repositorio de autoencoders: https://huggingface.co/djmango/openfront-tile-autoencoder
- Documentación de diseño: https://github.com/djmango/openfront-ai/blob/master/DESIGN.md
