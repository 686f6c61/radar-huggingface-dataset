# kiwi2030/connectailab-rl-kiwi-v1-Humanoid-ppo

## Resumen

`connectailab-rl-kiwi-v1-Humanoid-ppo` es una política de control continuo entrenada con PPO (Proximal Policy Optimization) mediante la librería Stable-Baselines3 sobre el entorno `Humanoid-v5` de Gymnasium/MuJoCo. No se trata de un modelo de lenguaje, sino de un agente de aprendizaje por refuerzo cuyo objetivo es que un humanoide simulado de dos piernas mantenga el equilibrio y camine hacia delante. Lo publica el usuario `kiwi2030` bajo el paraguas del proyecto Connect AI Lab (connectailab), un espacio de experimentos de IA que incluye otros entornos como LunarLander, Walker2d o Link-01.

El agente emplea una arquitectura actor-critic de tipo perceptrón multicapa, con dos capas ocultas de 256 unidades y activación Tanh en cada red. Recibe observaciones de 348 dimensiones del simulador y emite 17 acciones continuas correspondientes a las articulaciones del cuerpo. El entrenamiento se realizó durante 3.939.524 pasos con una tasa de aprendizaje de 0,0001 y sin gSDE (generalized State-Dependent Exploration).

Su relevancia es fundamentalmente experimental y educativa: documenta de forma transparente el protocolo de evaluación (semillas de test separadas de las de entrenamiento, normalización de observaciones congelada, evaluación determinista) y reporta métricas concretas de rendimiento en simulación. No obstante, el propio autor advierte que el resultado es una marcha asimétrica y que no se ha validado en un robot físico ni en múltiples semillas de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-critic MLP (256-256, activación Tanh) entrenado con PPO (Stable-Baselines3) |
| Parametros totales | no disponible (red pequeña; no se reporta el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observación de 348 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (pesos en formato `.zip` de Stable-Baselines3; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (agente de control, no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.zip` (Stable-Baselines3) + `vecnormalize.pkl` (estadísticas de normalización) |

Otros datos técnicos relevantes: dimensión de observación 348, dimensión de acción 17 (control continuo), entorno `Humanoid-v5` de Gymnasium/MuJoCo, 3.939.524 pasos de entrenamiento, learning rate 0,0001, gSDE desactivado.

## Arquitectura y entrenamiento

La política es un agente PPO estándar de Stable-Baselines3 con redes actor y crítica independientes, cada una con dos capas ocultas de 256 neuronas y activación Tanh. El entorno es el `Humanoid-v5` de Gymnasium sobre el simulador físico MuJoCo, que modela un cuerpo humanoide articulado y devuelve observaciones de 348 dimensiones (posiciones, velocidades y contactos) y espera 17 acciones continuas (pares de fuerzas/momentos en las articulaciones). El entrenamiento se prolongó durante 3.939.524 pasos con una tasa de aprendizaje de 0,0001 y sin exploración gSDE.

El autor documenta una modificación del perfil de recompensa durante el entrenamiento, denominada `straight`: al reward base del entorno se le resta el término `3*y_velocity² + 0.25*(y-y_start)²`, una penalización que desincentiva el desplazamiento lateral y favorece la marcha en línea recta. Esta penalización auxiliar no se incluye en la métrica final de evaluación. La selección del checkpoint se realizó sobre la recompensa acumulada original usando semillas de validación del rango 10000, manteniendo separadas las semillas de entrenamiento, validación y test (rango 20000). La evaluación final congela las estadísticas de normalización de observaciones (`vecnormalize.pkl`) y usa acciones deterministas.

## Capacidades

- Control continuo de un humanoide simulado: genera 17 acciones articulares por paso para mantener el equilibrio y avanzar.
- Locomoción bípeda hacia delante en el entorno `Humanoid-v5` de MuJoCo.
- Estabilización de la postura: la evaluación reporta 0 % de terminación temprana en 30 episodios de 1.000 pasos.
- Marcha en línea recta: el perfil de entrenamiento `straight` reduce la deriva lateral (desviación absoluta media de 0,371 m).
- Integración con Stable-Baselines3: carga directa mediante `PPO.load` y predicción con `model.predict`.
- Reproducibilidad documentada: semillas de test fijas (20000) y estadísticas de normalización congeladas.
- No soporta tool calling, function calling, agentes multi-step, capacidades multilingües ni modos de razonamiento: es un agente de control, no un modelo generativo de lenguaje.

## Casos de uso

- Investigación en aprendizaje por refuerzo: servir como línea base reproducible para comparar algoritmos (PPO, SAC, TD3) sobre `Humanoid-v5`, dado que el autor documenta hiperparámetros, semillas y protocolo de evaluación.
- Docencia y formación: ejemplo didáctico de pipeline completo con Stable-Baselines3 (entrenamiento, normalización de observaciones, selección de checkpoint y evaluación determinista) para cursos de RL.
- Estudio de diseño de recompensas: el perfil `straight` con penalización lateral es un caso concreto para analizar cómo los términos auxiliares moldean el comportamiento emergente (marcha recta frente a deriva).
- Benchmarking de entornos MuJoCo: usar las métricas reportadas (velocidad 0,904 m/s, distancia 13,578 m, recompensa 5859,5 ± 11,9) como referencia al evaluar variantes del entorno o del algoritmo.
- Prototipado de control de locomotion antes de trasladar políticas a robots reales: el agente permite experimentar con observaciones y acciones articulares en simulación antes de abordar el gap sim-to-real.
- Reproducción y auditoría de experimentos: al publicar `model.zip`, `vecnormalize.pkl` y `config.json`, permite replicar la evaluación con semillas fijas y verificar las cifras declaradas.
- Generación de material divulgativo: el vídeo de replay incluido facilita demostraciones visuales del comportamiento aprendido en charlas o tutoriales.

## Benchmarks y rendimiento

El autor reporta una evaluación final sobre 30 episodios con semillas del rango 20000, acciones deterministas y estadísticas de normalización congeladas. La puntuación es la recompensa original del entorno (sin la penalización auxiliar de entrenamiento).

| Metrica | Resultado |
|---|---|
| Recompensa acumulada media ± desviación típica | 5859,5 ± 11,9 |
| Tasa de finalización de 1.000 pasos | 100,0 % |
| Tasa de terminación temprana | 0,0 % |
| Velocidad de avance media | 0,904 m/s |
| Distancia de avance del torso media | 13,578 m |
| Desplazamiento lateral absoluto medio | 0,371 m |
| Criterios del proyecto (≥90 % finalización, ≥0,8 m/s, ≤1,5 m lateral) | Cumplidos (True) |

No se han publicado comparaciones con otros agentes sobre `Humanoid-v5` en la información disponible, ni resultados de benchmarks estándar de RL (por ejemplo, recompensa media de la literatura) que permitan contextualizar estas cifras. El autor subraya que estos criterios son propios del proyecto y no constituyen el criterio oficial de resolución del entorno, y que los resultados provienen de una única semilla de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima. La red actor-critic es un MLP de 256-256; los pesos ocupan del orden de pocos megabytes y la inferencia puede ejecutarse en CPU.
- GPU recomendadas: no se requiere GPU. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) acelera el entrenamiento, pero la inferencia funciona en CPU.
- Cabe en cualquier GPU consumer e incluso en CPU sin GPU dedicada.
- Opciones de despliegue: Stable-Baselines3 (`PPO.load` + `VecNormalize.load`) sobre Gymnasium/MuJoCo; no aplican vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del paso de simulación de MuJoCo y del hardware.
- Requisito crítico: los pesos (`model.zip`) y las estadísticas de normalización (`vecnormalize.pkl`) deben usarse conjuntamente; la versión exacta del entorno debe consultarse en `config.json`.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Observaciones / acciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-kiwi-v1-Humanoid-ppo | Humanoid-v5 | PPO (SB3) | 348 / 17 | no disponible | Hugging Face |
| connectailab-rl-kiwi-v2-Walker2d-ppo | Walker2d | PPO (SB3) | no disponible | no disponible | Hugging Face |
| connectailab-rl-kiwi-v3-lunarlander | LunarLander | DQN | no disponible | no disponible | Hugging Face |
| connectailab-rl-kiwi-v1-link01 | Link-01 | PPO (SB3) | no disponible | no disponible | Hugging Face |

Los modelos comparables identificados pertenecen al mismo autor y proyecto (connectailab), por lo que la comparación es de alcance limitado. No se dispone de datos de benchmarks cruzados ni de modelos de terceros sobre `Humanoid-v5` en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni capacidades multilingües.
- Marcha asimétrica y poco natural: el autor indica que en el vídeo el humanoide avanza con un brazo levantado y no reclama una locomoción natural similar a la humana.
- Validación limitada a una única semilla de entrenamiento: la reproducibilidad entre semillas no se ha verificado.
- Solo validado en simulación: no se ha probado con sensores, motores ni retardos de un robot físico (gap sim-to-real no abordado).
- Dependencia estricta del par `model.zip` + `vecnormalize.pkl`: usar solo los pesos produce predicciones incorrectas.
- Sensibilidad a la versión del entorno: la versión exacta de `Humanoid-v5` debe consultarse en `config.json`; cambios en el entorno pueden invalidar los resultados.
- Los criterios de éxito (≥90 % finalización, ≥0,8 m/s, ≤1,5 m lateral) son del proyecto y no el criterio oficial de resolución del entorno.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Sin descargas ni likes en el momento de la consulta (0 / 0): ausencia de validación por parte de la comunidad.
- Riesgo de sobreajuste a la semilla de validación en la selección de checkpoint, aunque el autor separa las semillas de test.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v1-Humanoid-ppo
- Perfil del autor: https://huggingface.co/kiwi2030
- Connect Tycoon · kiwi v2: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2
- Connect Tycoon · teacher v2: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2-teacher
- LunarLander · kiwi v3: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v3-lunarlander
- LINK-01 · kiwi v1: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v1-link01
- Walker2d PPO: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2-Walker2d-ppo
- dama-aibrain: https://huggingface.co/kiwi2030/dama-aibrain
- MEETORY (guía de viajes): https://meetory.kr
- Canal de YouTube del autor: https://www.youtube.com/@kiwi_overai
