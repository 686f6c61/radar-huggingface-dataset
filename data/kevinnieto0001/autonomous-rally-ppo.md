# Kevinnieto0001/autonomous-rally-ppo

## Resumen

`autonomous-rally-ppo` es un agente de aprendizaje por refuerzo entrenado con PPO (Proximal Policy Optimization) mediante la librería Stable-Baselines3, desarrollado por Kevinnieto0001 como proyecto final de MLOps de la Universidad Externado de Colombia. El modelo resuelve una tarea de conducción autónoma en un simulador de rally: completar una vuelta a un circuito de 1 048,6 m inspirado en Mónaco, pasando seis checkpoints en orden y operando bajo condiciones meteorológicas variables (seco, lluvia, llovizna, diluvio) y perturbaciones de sensores y de pista.

No se trata de un modelo de lenguaje ni de un transformer generativo, sino de una política neuronal compacta que mapea una observación de 24 valores a una acción de control continua. Su relevancia es fundamentalmente metodológica: documenta un pipeline completo de MLOps con versionado por etiquetas de git, registro en MLflow, hashes SHA-256 de los artefactos y una evaluación sobre un conjunto de test reservado de 100 semillas no presentes en el repositorio de entrenamiento.

El repositorio tiene un tamaño de 0,0 GB (artefacto `modelo.zip` de pesos de Stable-Baselines3), 74 descargas y 0 likes en el momento de la consulta. La versión recomendada es `v5-s1` (etiqueta de git `modelo-v5-s1`), con versiones anteriores disponibles bajo las etiquetas `v1`, `v2` y `v4`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de aprendizaje por refuerzo (PPO, Stable-Baselines3); topología de capas no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 24 valores por paso |
| Tipos de cuantizacion | no disponible (pesos en `modelo.zip` de Stable-Baselines3) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `modelo.zip` (formato nativo de Stable-Baselines3) |
| Version recomendada | `ppo-modelo-v5-s1`, etiqueta de git `modelo-v5-s1` |
| Entorno | `AutonomousRally-v0` versión `0.4-monaco-configurable` |
| Longitud del circuito | 1 048,6 m, inspirado en Mónaco, 6 checkpoints |
| Pasos de entrenamiento | 3 millones |
| Semilla | 1 |
| SHA-256 de `modelo.zip` | `ea24b02d858695996fdc4b9bcff4cba7174ddd41e3acdf790c8a3b972a3edade` |
| Commit | `60fee8ce3b605022bb5229f5e2883c361c29b403` |
| Run de MLflow | `8635b75241cb471ca5aa5ee142e4bcf5` |

## Arquitectura y entrenamiento

El agente se entrena con PPO sobre el entorno `AutonomousRally-v0` (versión `0.4-monaco-configurable`), que expone una observación de 24 valores y un espacio de acciones de control continuo. El entrenamiento combina DAgger (imitation learning con un piloto maestro) y PPO, a lo largo de 3 millones de pasos, con dominio aleatorio (random domain randomization) y ruido inyectado en los sensores. La semilla empleada es la 1. No se dispone de información sobre el número de capas, el tamaño de las capas ocultas ni la función de activación de la política.

El pipeline de MLOps es parte central del proyecto: cada versión se publica con una etiqueta de git, un commit identificable, un run de MLflow y un hash SHA-256 del artefacto `modelo.zip`, lo que permite reproducibilidad y trazabilidad del binario desplegado. La evaluación se realizó una sola vez sobre un test reservado de 100 semillas ausentes del repositorio de entrenamiento, con 19 pruebas extremas cuyo promedio fue del 99,9 %.

## Capacidades

- Control de conducción autónoma en un circuito de rally simulado de 1 048,6 m con seis checkpoints que deben pasarse en orden.
- Robustez ante condiciones meteorológicas: seco, casi seco, llovizna, lluvia, límite de lluvia y diluvio.
- Robustez ante perturbaciones de pista: pista angosta, pista ancha, mayor agarre, salida torcida.
- Robustez ante perturbaciones de sensores: sensores con ruido, sensores cortos y sensores largos.
- Robustez ante variaciones del vehículo: carro lento y carro rápido en lluvia.
- Inferencia determinista mediante `model.predict(obs, deterministic=True)`.
- Integración con Gymnasium y Stable-Baselines3 para evaluación y reentrenamiento.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento extendido: no es un modelo de lenguaje.

## Casos de uso

- Evaluación de pipelines de RL en simulación: el agente sirve como referencia reproducible para validar un stack completo de Gymnasium + Stable-Baselines3 + MLflow, dado que cada versión está etiquetada, hasheada y vinculada a un run de MLflow.
- Investigación en robustez de políticas: el conjunto de 19 pruebas extremas (meteorología, sensores, geometría de pista y dinámica del vehículo) permite medir la degradación de una política ante cambios de dominio y comparar contra variantes propias.
- Docencia en MLOps: el repositorio documenta versionado por tags, hashes de artefactos y evaluación sobre test reservado, lo que lo convierte en un ejemplo completo de ciclo de vida de un modelo de RL.
- Baseline para imitation learning: al combinar DAgger con PPO, sirve como punto de partida para comparar estrategias de entrenamiento (solo PPO, solo BC, DAgger + PPO) sobre el mismo entorno.
- Pruebas de integración de entornos Gymnasium personalizados: el paquete `rally` registra `AutonomousRally-v0`, por lo que el modelo permite validar que un entorno custom se registra, resetea con semilla y produce observaciones compatibles con SB3.
- Prototipado de conducción autónoma en simulación: útil para experimentar con control continuo y percepción simplificada (24 valores de observación) antes de escalar a simuladores de mayor fidelidad.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (no verificados, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | AutonomousRally-v0 0.4, test reservado de 100 semillas | Vueltas completas en seco (%) | 100 |
| reinforcement-learning | AutonomousRally-v0 0.4, test reservado de 100 semillas | Vueltas completas con lluvia (%) | 100 |

Desglose de las 19 pruebas extremas del test reservado (100 semillas, ejecución única, promedio 99,9 %):

| Condicion | Vueltas | Tiempo mediano |
|---|---|---|
| Seco | 100 % | 68,6 s |
| Mojado | 100 % | 89,3 s |
| Llovizna | 100 % | 85,3 s |
| Casi seco | 100 % | 84,3 s |
| Mas agarre | 100 % | 66,5 s |
| Salida torcida | 100 % | 68,7 s |
| Salida torcida lluvia | 100 % | 89,2 s |
| Sensores ruido | 100 % | 68,7 s |
| Sensores ruido lluvia | 100 % | 88,8 s |
| Diluvio | 98 % | 93,1 s |
| Limite lluvia | 100 % | 71,0 s |
| Pista angosta | 100 % | 70,8 s |
| Pista angosta lluvia | 100 % | 91,9 s |
| Pista ancha | 100 % | 65,9 s |
| Pista ancha lluvia | 100 % | 87,4 s |
| Sensores cortos | 100 % | 72,4 s |
| Sensores cortos lluvia | 100 % | 94,3 s |
| Sensores largos | 100 % | 69,1 s |
| Sensores largos lluvia | 100 % | 84,9 s |
| Carro lento | 100 % | 78,5 s |
| Carro rapido lluvia | 100 % | 89,5 s |

No se han publicado en la información disponible resultados de benchmarks frente a otros agentes de RL ni comparaciones con políticas alternativas sobre el mismo entorno.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto `modelo.zip` ocupa 0,0 GB según el tamaño del repositorio, por lo que la política es de tamaño reducido y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; por el tamaño del artefacto, cualquier GPU con al menos unos pocos GB de VRAM es suficiente. La inferencia también es viable en CPU.
- Cabe en GPU consumer: sí, previsiblemente en cualquier RTX o equivalente, e incluso en CPU, dado el tamaño del repositorio y la observación de 24 valores.
- Opciones de despliegue: inferencia directa con `stable_baselines3.PPO.load()` sobre el entorno Gymnasium registrado por el paquete `rally`; descarga de pesos vía `huggingface_hub.hf_hub_download` con `revision="v5-s1"`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles de forma explícita; los tiempos medianos por vuelta reportados (65,9 s a 94,3 s según condición) corresponden a la simulación, no a la latencia de inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros agentes de RL comparables sobre `AutonomousRally-v0` ni sobre entornos de conducción autónoma equivalentes, ni datos de parámetros, contexto o licencia de alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser una política entrenada con un piloto maestro (DAgger), puede heredar los sesgos de comportamiento de dicho piloto.
- Riesgo de sobreajuste al entorno: los resultados del 100 % corresponden al entorno `AutonomousRally-v0` versión `0.4-monaco-configurable`; no hay evidencia de transferencia a otros simuladores, circuitos o dinámicas de vehículo distintas.
- Métricas no verificadas: los valores del `model-index` están marcados como `verified: false`; proceden del autor y no de una evaluación independiente.
- Caso degradado documentado: en la condición de diluvio la tasa de vueltas completas baja al 98 %, el único escenario por debajo del 100 %.
- Dependencia del paquete `rally`: el modelo no funciona sin el entorno que registra `AutonomousRally-v0`; el código está en un repositorio externo de GitHub.
- Licencia no disponible: no se declara licencia en Hugging Face, por lo que el uso comercial queda sin autorización explícita y requiere contactar con el autor.
- Idiomas no aplicables: no es un modelo de lenguaje; no procesa ni genera texto.
- Sin datos de arquitectura interna: se desconoce el tamaño de la red, el número de parámetros y la topología, lo que limita la reproducibilidad exacta más allá del hash del artefacto.
- Proyecto académico: el alcance es un trabajo de fin de curso de MLOps, no un producto mantenido con garantías de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kevinnieto0001/autonomous-rally-ppo
- Código del proyecto: https://github.com/melo11miguel/defiende-el-servidor
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- Gymnasium: https://gymnasium.farama.org/
- MLflow (run `8635b75241cb471ca5aa5ee142e4bcf5`, sin URL pública en la información disponible)
