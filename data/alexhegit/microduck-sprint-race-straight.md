# alexhegit/microduck-sprint-race-straight

## Resumen

microduck-sprint-race-straight es una política de control para el robot caminante Microduck, publicada por el usuario alexhegit en Hugging Face. No se trata de un modelo de lenguaje, sino de un controlador neuronal entrenado con aprendizaje por refuerzo (PPO) que traduce 61 observaciones del estado del robot en 14 consignas de posición articular a 50 Hz. El modelo está empaquetado en formato ONNX y su función concreta es hacer que el robot avance en línea recta a alta velocidad.

El modelo deriva de una política previa denominada sprint_speed_1p68 y ha sido reentrenado para mantener una trayectoria recta. Su relevancia es acotada pero específica: participa en el evento `sprint-2m` de la Microduck Arena, un espacio de competición de robots caminantes, y demuestra un flujo de entrenamiento de RL en MuJoCo sobre GPU AMD con ROCm, lo que resulta poco habitual en el ecosistema dominado por CUDA.

Por su naturaleza, no es un modelo de propósito general ni sustituye a un LLM: es un artefacto de robótica con una tarea única y un entorno de simulación concreto. La ficha se redacta con la información disponible en la model card y los metadatos de Hugging Face, que es escasa en varios apartados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal para control robótico (entrenada con PPO); topología interna no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 valores por paso |
| Tipos de cuantización | no disponible (pesos en ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La política se entrenó con Proximal Policy Optimization (PPO) sobre el simulador MuJoCo, usando el framework microduck_rl_unilab. La entrada son 61 observaciones del estado del robot y la salida son 14 objetivos de posición articular, ejecutados a una frecuencia de control de 50 Hz. El entrenamiento se realizó en una GPU AMD con ROCm. La arquitectura interna de la red (capas, activaciones, tamaño) no se detalla en la información disponible.

El modelo parte de la política sprint_speed_1p68 y se reentrenó con el objetivo de mantener una línea recta. Según la model card, el mapeo ONNX transforma el comando de velocidad de la Arena, que va de 0,20 a 1,20 m/s, al rango entrenado de 1,65 a 2,20 m/s. No se especifican el número de pasos de entrenamiento, la composición del dataset de rollouts ni si hubo técnicas adicionales de regularización o currículo.

## Capacidades

- Control locomotor de un robot caminante cuadrúpedo (Microduck) en simulación MuJoCo.
- Generación de 14 consignas de posición articular a partir de 61 observaciones, a 50 Hz.
- Marcha rápida en línea recta con velocidad objetivo dentro del rango entrenado de 1,65 a 2,20 m/s.
- Remapeo del comando de velocidad de la Arena (0,20-1,20 m/s) al rango entrenado mediante el grafo ONNX.
- Ejecución en formato ONNX, apta para inferencia en entornos con runtime ONNX.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- Competición en la Microduck Arena: la política se ejecuta como controlador del robot en el evento `sprint-2m`, donde el objetivo es recorrer la distancia en el menor tiempo posible manteniendo la trayectoria recta.
- Evaluación de controladores de locomoción: sirve como referencia de rendimiento para comparar políticas de sprint en el mismo simulador y condiciones.
- Investigación en RL aplicado a robótica: el modelo y su pipeline (PPO + MuJoCo + ROCm) permiten reproducir o extender experimentos de entrenamiento de políticas de marcha.
- Pruebas de despliegue ONNX: al estar exportado a ONNX, se puede integrar en un runtime de inferencia para validar latencia y comportamiento del controlador fuera del entorno de entrenamiento.
- Estudio de transferencia sim-to-real: aunque no se documenta despliegue físico, el controlador puede usarse como punto de partida para experimentos de transferencia al robot real.
- Benchmarking de hardware AMD ROCm en RL: el caso documenta un flujo de entrenamiento completo sobre GPU AMD, útil para quienes evalúan ROCm frente a CUDA en cargas de RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0,0 GB) y la naturaleza del modelo, la huella es muy reducida, pero no se aportan cifras.
- GPU recomendadas: no se especifican; el entrenamiento se realizó en una GPU AMD con ROCm, sin modelo concreto.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: runtime ONNX (ONNX Runtime u otro compatible); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el control opera a 50 Hz, pero no se aportan medidas de latencia por inferencia.

## Comparativa con modelos similares

No se dispone de información sobre políticas comparables en la documentación proporcionada. La model card menciona la política predecesora sprint_speed_1p68, de la que deriva este modelo, pero no se ofrecen sus especificaciones ni métricas para establecer una comparación cuantitativa.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sprint-race-straight | no disponible | 61 observaciones por paso | no disponible | Apache 2.0 | Hugging Face |
| sprint_speed_1p68 (predecesor) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otras políticas de la Microduck Arena | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de nicho: solo controla el robot Microduck en el entorno de simulación para el que fue entrenado; no es reutilizable como modelo de propósito general.
- Rango de velocidad restringido: el controlador está entrenado para 1,65-2,20 m/s y el mapeo ONNX asume comandos de 0,20-1,20 m/s; fuera de ese rango el comportamiento no está garantizado.
- Sin datos de robustez: no se documentan pruebas ante perturbaciones, terrenos variables o fallos del simulador.
- Transferencia sim-to-real no documentada: no hay evidencia de que la política funcione en el robot físico.
- Sesgos y alucinación: no aplican en el sentido de un LLM, pero sí existe riesgo de comportamiento fuera de distribución ante observaciones no vistas durante el entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; no se indican restricciones adicionales.
- Documentación escasa: sin métricas de rendimiento, arquitectura detallada ni número de parámetros, lo que dificulta evaluar su calidad frente a alternativas.
- Repositorio sin descargas ni interacciones: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alexhegit/microduck-sprint-race-straight
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Framework de entrenamiento microduck_rl_unilab: https://github.com/rocPAI-Forge/microduck_rl_unilab
