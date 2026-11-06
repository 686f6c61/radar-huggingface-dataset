# hwihwalab/connectailab-rl-CHOCO-BRAIN-v1-link01

## Resumen

connectailab-rl-CHOCO-BRAIN-v1-link01 es un adaptador LoRA (PEFT) entrenado mediante aprendizaje por refuerzo (PPO) sobre el modelo base Qwen/Qwen3.5-0.8B. Lo desarrolla Hwihwa Lab en colaboración con CONNECT AI LAB y está orientado a robótica encarnada (physical AI), concretamente a la evitación dinámica de obstáculos y la navegación autónoma del robot humanoide bípedo LINK-01. El modelo se presenta como una "corteza de razonamiento espacial" que consume telemetría sensorimotora de 21 dimensiones y emite comandos discretos de locomoción.

El problema que aborda es la latencia y la fiabilidad en la toma de decisiones de navegación en tiempo real: según la model card, convierte ventanas sensoriales de 0,5 segundos en 5 comandos de marcha discretos en 50 ms, con "cero alucinación" declarada por el autor. Se apoya en el protocolo espacial JEV (Judgment-Evaluation-Verification) y en el simulador CONNECT AI WORLD, con etiquetas que apuntan a sim-to-real y MuJoCo.

Es relevante por su enfoque poco habitual: aplicar un modelo de lenguaje pequeño (0,8B) como política de decisión encarnada en lugar de una red neuronal específica de control, empaquetado como adaptador LoRA de ~0,1 GB y con vocación de despliegue en dispositivo (edge-ai). La información pública disponible es escasa y procede casi exclusivamente de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-0.8B) con adaptador LoRA/PEFT entrenado por RL (PPO) |
| Parametros totales | 0,8B en el modelo base; el adaptador LoRA no declara recuento propio (no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio distribuye safetensors del adaptador; no se documentan GGUF ni cuantizaciones) |
| Idiomas soportados | Ingles (en) y coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador se entrena con aprendizaje por refuerzo profundo, específicamente PPO, sobre un conjunto de 2.530 preguntas (1.770 de entrenamiento) destiladas de decisiones de marcha continuas en el simulador CONNECT AI WORLD. La observación de entrada es un vector de 21 dimensiones que combina el vector objetivo, 11 rayos de proximidad LiDAR, velocidad 2D y 5 elecciones de marcha históricas; la salida son comandos discretos de locomoción.

La innovación declarada es el protocolo espacial JEV (Judgment-Evaluation-Verification), que estructura la decisión en fases de juicio, evaluación y verificación, y la conversión de una ventana sensorial de 0,5 s en 5 comandos de marcha en 50 ms. El escenario de evaluación descrito es un laberinto de slalom con 5 obstáculos (`#8a790033`) en un recorrido de 3,4 m, con una travesía media de 25,0 s y 1.770 decisiones continuas. No se detallan en la información disponible el número de tokens de entrenamiento del modelo base, la composición completa del dataset ni si hubo fases adicionales de RLHF o DPO.

## Capacidades

- Toma de decisiones de locomoción discreta para robot humanoide bípedo a partir de telemetría sensorial.
- Evitación dinámica de obstáculos en entornos con múltiples barreras agrupadas (5 obstáculos en el escenario de referencia).
- Navegación autónoma y planificación de trayectoria hacia un objetivo ("target plant").
- Razonamiento espacial sobre vectores objetivo, proximidad LiDAR y velocidad.
- Procesamiento de telemetría multimodal de 21 dimensiones (objetivo, 11 rayos LiDAR, velocidad 2D, historial de marcha).
- Salida de comandos de marcha en formato discreto (5 comandos por ventana sensorial).
- Operación de baja latencia declarada: 50 ms por ciclo de decisión.
- Soporte de idiomas inglés y coreano en el modelo base.
- Orientación a despliegue en dispositivo (edge-ai) y transferencia sim-to-real.

## Casos de uso

- Navegación de humanoides en almacenes: el modelo recibe la posición del objetivo y los 11 rayos LiDAR para emitir comandos de marcha que esquivan estanterías y operarios en movimiento, con ciclos de 50 ms compatibles con el bucle de control del robot.
- Evitación de obstáculos en robots de reparto: usar el adaptador como política de decisión sobre Qwen3.5-0.8B para transitar aceras con peatones y mobiliario urbano, aprovechando el entrenamiento específico en slalom con obstáculos agrupados.
- Investigación en sim-to-real: entrenar y validar la política en el simulador CONNECT AI WORLD (con soporte MuJoCo) y transferir el adaptador a un robot físico LINK-01 para estudiar la brecha de simulación a realidad.
- Prototipado de agentes encarnados en laboratorio: integrar el adaptador en un pipeline PEFT para experimentar con políticas basadas en LLM frente a redes de control clásicas en tareas de navegación.
- Robótica educativa y demos: desplegar el adaptador en el espacio 3D Neuro-Robo-Studio para visualizar decisiones de navegación y explicar el protocolo JEV en docencia o divulgación.
- Despliegue en edge: ejecutar el modelo base de 0,8B más el adaptador LoRA en hardware embebido del robot, dado el tamaño reducido del adaptador (~0,1 GB) y la orientación declarada a on-device.
- Evaluación comparativa de políticas de RL: usar el adaptador como referencia de política PPO entrenada sobre un LLM pequeño en experimentos de navegación con LiDAR y comandos discretos.

## Benchmarks y rendimiento

La model card no presenta resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Los únicos datos de rendimiento declarados son métricas del escenario de simulación:

| Metrica | Valor declarado |
|---|---|
| Escenario de evaluacion | Laberinto slalom con 5 obstaculos (`#8a790033`), recorrido de 3,4 m |
| Preguntas totales / entrenamiento | 2.530 / 1.770 |
| Latencia de inferencia | 0,05 s (50 ms) por ciclo |
| Ventana sensorial | 0,5 s convertida en 5 comandos de marcha |
| Travesia media del recorrido | 25,0 s |
| Dimension de observacion | 21 (objetivo, 11 rayos LiDAR, velocidad 2D, 5 elecciones historicas) |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del modelo base (0,8B) y un adaptador LoRA de ~0,1 GB, la inferencia en FP16 requeriría del orden de 2 GB, y en cuantización de 4 bits podría situarse por debajo de 1 GB, aunque el autor no publica cifras.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cualquier GPU consumer moderna podría alojar el modelo base, pero no hay recomendaciones del autor.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño de 0,8B, aunque no se confirma en la documentación.
- Opciones de despliegue: la librería declarada es PEFT; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: latencia declarada de 50 ms por ciclo de decisión en el escenario de simulación; no se publica throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de un adaptador LoRA de RL para robótica encarnada sobre un modelo base concreto, una categoría con pocos equivalentes públicos documentados.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-CHOCO-BRAIN-v1-link01 | 0,8B (base) + LoRA | No disponible | RL (PPO) para navegacion de humanoide | Apache-2.0 | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La información pública es muy escasa: no se documentan contexto, cuantizaciones, dataset completo ni metodología de evaluación detallada.
- Las afirmaciones de "cero alucinación" y de latencia de 50 ms proceden del autor y no están respaldadas por una evaluación independiente publicada.
- El modelo está entrenado para un escenario concreto (laberinto slalom de 5 obstáculos en un simulador propio); su generalización a entornos reales no está demostrada en la información disponible.
- Riesgo de sobreajuste al simulador y a la configuración sensorial de 21 dimensiones del robot LINK-01; el uso con otra disposición de sensores requeriría reentrenamiento.
- Solo se declaran inglés y coreano como idiomas; no hay evidencia de capacidades multilingües amplias.
- Al ser un adaptador PEFT, requiere el modelo base Qwen3.5-0.8B para funcionar; no es un modelo autónomo.
- No se documentan sesgos, pero al ser una política de control entrenada en un entorno sintético, puede heredar sesgos del simulador y del dataset de decisiones.
- La licencia Apache-2.0 permite uso comercial, pero la idoneidad para producción en robótica física no está avalada por datos de seguridad o certificación.
- El repositorio tiene muy poca tracción (16 descargas, 0 likes) y fue creado en octubre de 2026, por lo que la madurez y el soporte de la comunidad son limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hwihwalab/connectailab-rl-CHOCO-BRAIN-v1-link01
- Manual en coreano: https://huggingface.co/hwihwalab/connectailab-rl-CHOCO-BRAIN-v1-link01/blob/main/README_KR.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Demo 3D en Spaces: https://huggingface.co/spaces/hwihwalab/neuro-robo-studio
- Modelo fundacional Connectome: https://huggingface.co/hwihwalab/neuro-robo-connectome
- Corteza prefrontal CHOCO-BRAIN GUARD: https://huggingface.co/hwihwalab/connectailab-rl-CHOCO-BRAIN_GUARD-v1
- Repositorio GitHub: https://github.com/Hwihwa-Lab/connectailab-rl-CHOCO-BRAIN-v1-link01
- Simulador CONNECT AI WORLD: https://www.ezerai.xyz/robot-lab/world/
- Organización en Hugging Face: https://huggingface.co/hwihwalab
- Licencia: https://huggingface.co/hwihwalab/connectailab-rl-CHOCO-BRAIN-v1-link01/blob/main/LICENSE
