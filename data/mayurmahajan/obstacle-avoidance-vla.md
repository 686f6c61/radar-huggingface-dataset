# mayurmahajan/obstacle-avoidance-vla

## Resumen

`mayurmahajan/obstacle-avoidance-vla` es un conjunto de checkpoints para un proyecto docente de robótica que entrena un coche mecanum simulado para seguir instrucciones en lenguaje natural del tipo "drive to the red cylinder". El modelo parte de `lerobot/smolvla_base` (una política vision-language-action basada en SmolVLM2-500M) y se ajusta primero por imitación (behaviour cloning) sobre demos sintéticas y después por PPO. Todo el entrenamiento y la evaluación se realizan en el simulador Genesis; no hay validación en robot físico.

El repositorio no contiene un modelo único, sino cuatro variantes de coche (`nb04` a `nb07`) más un "servidor" externo de visión aérea construido sobre `HuggingFaceTB/SmolVLM2-500M-Video-Instruct`. Las notebooks 06 y 07 añaden una cámara cenital fija que un servidor fuera del coche lee para enviarle una ruta corta, lo que dispara la tasa de éxito del 76 % al 98 % en 128 habitaciones de test con semilla 0. Es un artefacto de investigación reproducible, no un modelo listo para producción.

La relevancia es metodológica: muestra cómo combinar imitación, RL con PPO y percepción externa (off-board) para resolver tareas de navegación con objetos señuelo y oclusiones. El tamaño del repo (2,1 GB) y la licencia Apache 2.0 lo hacen accesible para reproducir el experimento, siempre que se acepten sus limitaciones: simulación únicamente, una sola semilla por coche y un servidor cenital sobreajustado al entorno del simulador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de SmolVLM2-500M; política de difusión/flow para acciones sobre `lerobot/smolvla_base`; servidor cenital basado en SmolVLM2-500M-Video-Instruct |
| Parametros totales | no disponible (el repo pesa 2,1 GB e incluye varios checkpoints; el modelo base SmolVLA/SmolVLM2-500M ronda los 500M, pero el autor no declara el total) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en punto flotante `.pt`, sin versiones GGUF/cuantizadas publicadas) |
| Idiomas soportados | no disponible (las instrucciones del simulador están en inglés, según los ejemplos de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (checkpoints parciales y completos) más ficheros `.json` de configuración y metadatos; no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

La política del coche es un fine-tuning de `lerobot/smolvla_base`, una VLA construida sobre el backbone de SmolVLM2-500M que produce acciones a partir de observaciones visuales (cámara frontal en `nb04`/`nb05`, más ruta en `nb06`/`nb07`) e instrucciones en lenguaje. El entrenamiento se hace en dos fases: primero behaviour cloning sobre demos generadas en el simulador Genesis, y después PPO (50 rondas en `nb05`, 110 en `nb07`) que solo actualiza el experto de acciones, el crítico y el tamaño del ruido de jitter. Los ficheros `best.pt` de PPO son parches que deben cargarse sobre el checkpoint de imitación correspondiente; no funcionan de forma autónoma.

La innovación principal es la arquitectura de percepción off-board de las notebooks 06–07: un servidor externo con SmolVLM2 lee una cámara cenital fija, identifica el objeto objetivo entre señuelos y genera un mapa de obstáculos aprendido sobre los tokens de imagen (`server_map_long_s0.pt`). Ese servidor envía al coche una ruta corta que `_guidance.pt` convierte en tokens consumidos por la política. Todos los datos son sintéticos y generados en el simulador; no se documenta el número de tokens, la composición del dataset ni si hubo RLHF/DPO (solo PPO sobre recompensa de la tarea).

## Capacidades

- Navegación visual condicionada por instrucciones en lenguaje natural ("drive to the red cylinder") en un entorno simulado con obstáculos y objetos señuelo.
- Seguimiento de rutas suministradas por un módulo externo de percepción cenital (notebooks 06 y 07).
- Percepción de imágenes aéreas y construcción de un mapa de obstáculos aprendido a partir de tokens visuales (servidor SmolVLM2).
- Aprendizaje por imitación (behaviour cloning) y refinamiento por refuerzo con PPO sobre el experto de acciones.
- Gestión de oclusiones parciales: la métrica "Goal hidden at start" sube del 59 % al 96 % con la ruta del servidor.
- No se documenta soporte de tool calling, function calling, agentes multi-paso generales, visión de vídeo arbitraria, audio ni modo thinking.

## Casos de uso

- Reproducción de investigación en VLA: cargar los checkpoints en las notebooks del repo `obstacle_avoidance` para replicar los experimentos de imitación, PPO y percepción off-board sin reentrenar desde cero.
- Estudio de percepción off-board en robótica: usar el servidor SmolVLM2 y el mapa aprendido como referencia para diseñar arquitecturas con cámara externa que asistan a un agente con recursos limitados.
- Docencia y cursos de robótica: los cuatro coches con tasas de éxito escalonadas (74 %, 76 %, 94 %, 98 %) sirven como material didáctico para comparar imitación frente a RL y percepción local frente a percepción externa.
- Benchmark interno de navegación en Genesis: las 128 habitaciones de test con semilla 0 constituyen un conjunto de evaluación fijo para comparar nuevas políticas contra estos checkpoints.
- Prototipado de seguimiento de instrucciones con objetos señuelo: el escenario de "encontrar el cilindro rojo entre objetos parecidos" es un banco de pruebas para estudiar robustez frente a distractores visuales.
- Investigación en simulación a realidad: los checkpoints y el pipeline de datos sintéticos permiten estudiar estrategias de transferencia (domain randomization, ajuste fino con pocos datos reales) antes de tocar hardware.

## Benchmarks y rendimiento

Resultados publicados por el autor en 128 habitaciones de test (semilla 0), todos en simulación Genesis:

| Checkpoint | Coche | Exito | Objetivo oculto al inicio | Toco un obstaculo |
|---|---|---|---|---|
| `nb04_imitation_car/` | camara frontal, solo imitacion | 74 % | 59 % | 62 % |
| `nb05_ppo_car/` | camara frontal + PPO | 76 % | 55 % | 43 % |
| `nb06_route_car/` | + ruta del servidor cenital | 94 % | 92 % | 22 % |
| `nb07_route_ppo_car/` | ruta + PPO | 98 % | 96 % | 19 % |

El propio autor advierte que la mejora de `nb06` a `nb07` (94 % → 98 %) no es estadísticamente significativa con 128 habitaciones (7 ganadas, 2 perdidas, p = 0,18). No se publican resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) ni comparaciones con otras VLA.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con un backbone de ~500M parámetros y los checkpoints adicionales del servidor, se espera que quepa en GPUs consumer de 8–16 GB en precisión completa, pero el autor no lo confirma.
- GPU recomendadas: no especificadas. Por tamaño, una RTX 3090/4090 o una A100/H100 son suficientes; el cuello de botella real es el simulador Genesis y el renderizado, no el modelo.
- Cabe en GPU consumer: probablemente sí (RTX 3060 12 GB o superior) por el tamaño del backbone, aunque no está verificado en la model card.
- Opciones de despliegue: el autor solo documenta ejecución mediante los scripts del repo (`scripts/rl_tests.py`, `scripts/car06_tests.py`) y las notebooks; no hay soporte declarado para vLLM, llama.cpp, Ollama o TGI, y los pesos en `.pt` no son directamente compatibles con esos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mayurmahajan/obstacle-avoidance-vla` | no disponible (~500M en el backbone) | no disponible | Navegacion VLA en Genesis | Apache 2.0 | Hugging Face, 0 descargas |
| `lerobot/smolvla_base` | ~500M (segun el modelo base referenciado) | no disponible | VLA generalista para robotica | no disponible en la informacion | Hugging Face (modelo base) |
| `HuggingFaceTB/SmolVLM2-500M-Video-Instruct` | ~500M | no disponible | VLM imagen/video | no disponible en la informacion | Hugging Face (modelo base) |
| Otras VLA de referencia (OpenVLA, RT-2) | no disponible en la informacion | no disponible | Navegacion/manipulacion | no disponible | no disponible |

La comparativa se limita a los modelos base declarados por el autor; no se dispone de datos de rendimiento de alternativas en el mismo escenario para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Solo simulación: los coches no se han probado en un robot físico, por lo que no hay evidencia de transferencia a realidad.
- Una única semilla de entrenamiento por coche; la mejora de `nb06` a `nb07` no es estadísticamente significativa (p = 0,18 con 128 habitaciones).
- El servidor cenital está ajustado a las habitaciones, la cámara y el marcador de techo de color de este simulador concreto; no es un componente genérico.
- Los `best.pt` de PPO son parches parciales (experto de acciones, crítico y jitter) que requieren cargarse sobre el checkpoint de imitación correspondiente; usarlos de forma aislada no funciona.
- Riesgo de alucinación y sesgos: no evaluado por el autor; al tratarse de un modelo pequeño y entrenado solo con datos sintéticos, es esperable un comportamiento frágil ante distribuciones visuales distintas.
- Idiomas: las instrucciones del simulador están en inglés; no se declara soporte multilingüe.
- Licencia Apache 2.0 permite uso comercial del código y los pesos, pero los modelos base (`lerobot/smolvla_base`, `SmolVLM2-500M-Video-Instruct`) tienen sus propias condiciones que deben revisarse por separado.
- Para producción: no recomendable sin validación adicional en el dominio objetivo; el repo es material de curso e investigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mayurmahajan/obstacle-avoidance-vla
- Repositorio del proyecto: https://github.com/mayur-mahajan/obstacle_avoidance
- Modelo base de la política: https://huggingface.co/lerobot/smolvla_base
- Modelo base del servidor: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
- Simulador Genesis: https://genesis-embodied-ai.github.io/
