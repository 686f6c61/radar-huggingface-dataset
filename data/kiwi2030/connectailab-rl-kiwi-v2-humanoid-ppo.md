# kiwi2030/connectailab-rl-kiwi-v2-Humanoid-ppo

## Resumen

Kiwi Humanoid PPO v2 es una política de control entrenada con aprendizaje por refuerzo (PPO) sobre el entorno `Humanoid-v5` de MuJoCo/Gymnasium. La desarrolla el usuario kiwi2030 dentro de su serie de experimentos ConnectAI Lab, en los que publica políticas RL para tareas de locomoción y toma de decisiones. El modelo resuelve un problema concreto de control motor: lograr que un humanoide simulado de 17 actuaciones mantenga el equilibrio y camine hacia delante con una marcha alterna (left-right) y un balanceo contralateral de brazos.

La relevancia técnica está en que no se limita a maximizar la recompensa nativa de `Humanoid-v5`, sino que añade una señal de fase (seno/coseno) al vector de observación y una batería de recompensas de estilo que penalizan el arrastre de pies, la falta de elevación y la asimetría. El resultado, según la model card, es un aumento de velocidad de 0,902 a 1,141 m/s, una reducción de la desviación lateral de 0,391 a 0,255 m y una correlación de alternancia de pies que pasa de -0,258 a 0,864 en 30 episodios con semillas fijas.

Es un artefacto de investigación, no un modelo de lenguaje: no procesa texto, no tiene ventana de contexto ni capacidades generativas. Su interés para desarrolladores e investigadores está en el diseño de recompensas, el currículo de entrenamiento por etapas (v1 → v2a → v2b) y la reproducibilidad documentada en CPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP Actor-Critic (PPO), dos capas ocultas de 256 unidades con activación Tanh por red |
| Parámetros totales | no disponible (no se publica el recuento; con observación de 350 y acción de 17 el orden de magnitud es de cientos de miles) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; observación de 350 dimensiones por paso) |
| Tipos de cuantización | no disponible (pesos en `model.zip` de Stable-Baselines3; no se documentan conversiones a GGUF u otros formatos) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (Stable-Baselines3) + `vecnormalize.pkl` (estadísticas de normalización) + `v2_config.json` (perfil) |

## Arquitectura y entrenamiento

La política es un PPO de Stable-Baselines3 con redes Actor y Critic separadas, cada una con dos capas de 256 unidades y activación Tanh, que emiten 17 acciones nativas del entorno `Humanoid-v5`. La entrada es un vector de 350 dimensiones: las 348 observaciones estándar de `Humanoid-v5` más dos valores de fase (seno y coseno) inyectados por el envoltorio `ReciprocalGait`. La fase se usa únicamente en la observación y en la recompensa de entrenamiento; la acción ejecutada es siempre la salida cruda del PPO, sin sobrescritura por PD articular ni reproducción de movimiento.

El entrenamiento se hizo en tres etapas encadenadas. v1 sirvió de base (348 observaciones, learning rate 1e-4). v2a añadió la fase, bajó el learning rate a 5e-5, fijó un ciclo de marcha de 1,1 s con objetivos de amplitud de pie (±0,22 m, altura 0,08 m) y de brazo (±0,15 m, altura 0,45 m), e introdujo penalizaciones de estilo; se transfirieron todos los pesos de v1 inicializando a cero las dos columnas nuevas de la capa de entrada, y se reinició el optimizador por el cambio de dimensión. v2b continuó desde v2a (pesos, optimizador y estadísticas de normalización) endureciendo las penalizaciones: pie adelante/atrás de 6 a 30, altura de pie de 30 a 120, desajuste de contacto de 0,4 a 1,0 y desplazamiento lateral de 0,25 a 1,0. El checkpoint seleccionado acumula 7.478.468 transiciones; v2a y v2b aportaron 1.015.808 y 2.523.136 transiciones adicionales respectivamente. La configuración de entrenamiento usa 8 entornos, rollout de 2048, batch de 256 y 10 épocas.

## Capacidades

- Locomoción bípeda hacia delante en `Humanoid-v5` con una velocidad media de 1,141 m/s en 30 episodios de 15 s.
- Marcha alterna de pies con correlación de 0,864 y balanceo contralateral de brazos (0,726 derecha-izquierda de pierna, 0,882 izquierda-derecha de pierna).
- Mantenimiento de equilibrio con desviación lateral absoluta de 0,255 m, frente a 0,391 m de v1.
- Supresión del gesto de brazos elevados: la proporción de tiempo con manos por encima de 0,20 m bajo el hombro cae del 99,91 % al 0,80 %.
- Control continuo determinista a partir de observaciones propioceptivas; no hay tool calling, agentes ni razonamiento multi-paso.
- No soporta texto, visión, audio ni capacidades multilingües.

## Casos de uso

- Investigación en diseño de recompensas para RL: el par v1/v2 permite aislar el efecto de añadir fase y penalizaciones de estilo sobre una misma base de pesos, con métricas de estilo publicadas para comparar.
- Docencia de aprendizaje por refuerzo profundo: el notebook de Colab con pesos incluidos permite reproducir la inferencia en CPU sin GPU, útil para prácticas de PPO y Gymnasium.
- Prototipado de controladores de locomoción en simulación: sirve como línea base de gait alterna antes de transferir a un simulador propio o a un robot con morfología similar.
- Evaluación de currículos de entrenamiento por etapas: el plan de desarrollo documentado (v1 → v2a → v2b) es un ejemplo reproducible de transferencia de pesos con cambio de dimensión de entrada.
- Análisis de correlaciones de coordinación motora: las métricas de correlación pie-pie y brazo-pierna permiten estudiar sincronía en políticas RL sin necesidad de entrenar desde cero.
- Reproducibilidad de entornos RL: la model card verifica igualdad de SHA256 de pesos y estadísticas entre macOS y Colab CPU, lo que facilita auditorías de reproducibilidad en pipelines de investigación.

## Benchmarks y rendimiento

Los datos disponibles son evaluaciones propias con semillas de prueba 30000–30029 (30 episodios de 15 s), no benchmarks estándar de la comunidad. Se presentan los resultados de la model card.

| Métrica (30 episodios, semillas 30000–30029) | v1 | v2 |
|---|---:|---:|
| Tasa de finalización | 100,00 % | 100,00 % |
| Recompensa acumulada (Gymnasium nativo, Mac) | 5857,872 | 6147,239 |
| Recompensa acumulada (Gymnasium nativo, Colab CPU) | 5861,5 ± 12,2 | 6145,6 ± 14,6 |
| Velocidad (m/s) | 0,902 | 1,141 |
| Desviación lateral (m) | 0,391 | 0,255 |
| Proporción de brazos elevados | 99,91 % | 0,80 % |
| Correlación de alternancia de pies | -0,258 | 0,864 |
| Correlación brazo derecho–pierna izquierda | -0,179 | 0,726 |
| Correlación brazo izquierdo–pierna derecha | -0,160 | 0,882 |
| Amplitud de movimiento del pie menor (m) | 0,127 | 0,421 |
| Amplitud de movimiento del brazo menor (m) | 0,063 | 0,468 |

No se han publicado resultados de benchmarks estándar (por ejemplo, comparativas con otras políticas publicadas sobre `Humanoid-v5`) en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el autor valida la ejecución completa en Google Colab CPU (Python 3.13.18, Gymnasium 1.4.0, MuJoCo 4.0.0, SB3 2.9.2, PyTorch 2.14.1+cpu) con 30 episodios completos, por lo que no se requiere GPU.
- VRAM estimada: no disponible; por el tamaño de las redes (256–256) y la naturaleza del entorno, la huella es mínima y cabe en cualquier GPU consumer, aunque no se documenta una cifra.
- GPU recomendadas: no disponibles; no son necesarias para inferencia. Para reentrenar, el autor no documenta GPU y el entrenamiento original se hizo en Mac con PyTorch 2.15.0.
- Opciones de despliegue: `stable_baselines3` con `PPO.load` sobre `model.zip`, junto con `vecnormalize.pkl` y el envoltorio `ReciprocalGait` del módulo `humanoid_v2`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de artefacto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kiwi2030/connectailab-rl-kiwi-v2-Humanoid-ppo | Humanoid-v5 | no disponible | no aplica | 1,141 m/s, 100 % de finalización en 30 episodios | no disponible | Hugging Face |
| kiwi2030/connectailab-rl-kiwi-v2-Walker2d-ppo | Walker2d | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| kiwi2030/connectailab-rl-kiwi-v3-lunarlander | LunarLander | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| kiwi2030/connectailab-rl-kiwi-v1-link01 | LINK-01 (decisión) | no disponible | no aplica | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparables con otras políticas públicas sobre `Humanoid-v5` en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación de un único autor y un único seed de entrenamiento; no se ha validado la transferencia a un robot físico.
- El simulador `Humanoid-v5` tiene pies esféricos y carece de articulaciones de tobillo, por lo que la marcha no equivale a la de un humano real; persisten inclinaciones y temblores del torso.
- Las métricas de estilo (correlaciones de alternancia, proporción de brazos elevados) son heurísticas definidas por el autor, no una puntuación validada de similitud de movimiento humano.
- Requiere obligatoriamente el envoltorio `ReciprocalGait` y las estadísticas de normalización `vecnormalize.pkl`; pasar las 348 observaciones sin fase produce un error de dimensión de entrada.
- La licencia no está disponible, lo que impide confirmar condiciones de uso comercial; debe contactarse con el autor antes de cualquier uso en producción.
- Las comparaciones Mac/Colab son verificaciones de reproducibilidad de plataforma, no conjuntos independientes de condiciones iniciales; no deben sumarse como 60 episodios.
- No es un modelo de lenguaje: no tiene capacidades de generación de texto, código, visión, tool calling ni agentes, por lo que no es aplicable a casos de uso de NLP.
- Riesgo de sobreajuste al perfil de recompensa: los coeficientes de estilo se ajustaron conjuntamente, de modo que la model card advierte que no debe interpretarse cada coeficiente como un efecto causal independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2-Humanoid-ppo
- Modelo relacionado (Walker2d PPO): https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2-Walker2d-ppo
- Modelo relacionado (Connect Tycoon kiwi v2): https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2
- Modelo relacionado (dama-aibrain): https://huggingface.co/kiwi2030/dama-aibrain
- Modelo relacionado (teacher v2): https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2-teacher
- Modelo relacionado (LunarLander kiwi v3): https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v3-lunarlander
- Modelo relacionado (LINK-01 kiwi v1): https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v1-link01
- Replay en vídeo (Colab, seed 30000): https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2-Humanoid-ppo/resolve/main/replay_colab.mp4
- Notebook de reproducción con pesos: Humanoid_v2_Colab.ipynb (en el repositorio del modelo)
- Notebook con resultados de ejecución: Humanoid_v2_Colab_executed.ipynb (en el repositorio del modelo)
- Plan de desarrollo: DEVELOPMENT_PLAN.md (en el repositorio del modelo)
- Comparativa JSON v1/v2: colab_comparison.json (en el repositorio del modelo)
- Informe de ejecución en Colab: v2_colab_report.json (en el repositorio del modelo)
- Guía de viajes MEETORY: https://meetory.kr
- Canal de YouTube del autor: https://www.youtube.com/@kiwi_overai
- Paper o blog técnico: no disponible
