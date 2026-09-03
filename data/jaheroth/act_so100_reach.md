# jaheroth/act_so100_reach

## Resumen

El modelo `jaheroth/act_so100_reach` es una política de control robótico entrenada con el método Action Chunking with Transformers (ACT) sobre un brazo articulado SO-100 simulado en MuJoCo. Ha sido desarrollado por el usuario jaheroth como parte del repositorio `robot-learning`, y se distribuye a través de Hugging Face bajo licencia Apache 2.0. El modelo resuelve una tarea de alcance (reach) en simulación, donde el brazo debe desplazarse a una posición objetivo a partir de observaciones de estado y vídeo.

Su relevancia radica en ser un ejemplo práctico de entrenamiento de políticas con LeRobot, la biblioteca de aprendizaje por imitación de Hugging Face, y en servir como punto de partida para experimentos de simulación y transferencia al hardware real. La arquitectura ACT predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y precisión en tareas de manipulación. El modelo cuenta con aproximadamente 0,7 GB de pesos en formato safetensors y se ha detenido en 43.000 pasos de entrenamiento con una pérdida en meseta de ~0,014.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de control robótico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformers que predice un bloque de acciones futuras (chunk) de longitud fija, en lugar de una única acción por paso. El modelo combina un codificador de visión (para procesar observaciones de cámara) con un decodificador transformer que genera el chunk de acciones. En este caso, el entrenamiento se ha realizado sobre el dataset `jaheroth/so100_reach`, que contiene 8.390 filas de demostraciones generadas por un experto programado (scripted expert) en un entorno MuJoCo con un brazo SO-100.

Los hiperparámetros reportados son: `chunk_size=50`, `n_action_steps=16`, `n_decoder_layers=7`, tasa de aprendizaje `2e-5`, batch de 64 y un total de 43.000 pasos de entrenamiento (~325 épocas), detenido por meseta en la pérdida (~0,014). No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; es un entrenamiento puramente supervisado de imitación. La innovación técnica principal es el propio mecanismo de chunking de acciones, que reduce la propagación de errores en la ejecución.

## Capacidades

- Control de brazo robótico SO-100 en simulación MuJoCo: genera comandos de posición o velocidad para alcanzar un objetivo.
- Aprendizaje por imitación a partir de demostraciones: reproduce comportamientos observados en el dataset de entrenamiento.
- Predicción de secuencias de acciones (chunking): produce bloques de 50 pasos de acción con un solapamiento de 16 pasos entre inferencias.
- Integración con el ecosistema LeRobot: compatible con las utilidades de carga, evaluación y despliegue de la biblioteca.
- Sin capacidades de lenguaje natural, tool calling, visión general ni razonamiento simbólico; es exclusivamente una política motora.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como modelo de referencia para estudiar el efecto del chunking de acciones en tareas de alcance en simulación.
- Desarrollo de pipelines de simulación a real (sim-to-real): aunque entrenado en MuJoCo, puede servir como base para transferencia a un brazo físico SO-100 tras ajuste fino con datos reales.
- Evaluación de métodos de control en entornos simulados: permite comparar ACT con otras políticas (p. ej., SmolVLA, Pi0) en la misma tarea y hardware simulado.
- Generación de datos sintéticos para entrenamiento de modelos más complejos: las trayectorias generadas por esta política pueden usarse para aumentar datasets.
- Prototipado de sistemas de control robótico de bajo coste: el SO-100 es un brazo asequible, y este modelo ofrece una referencia funcional sin necesidad de hardware físico.
- Docencia y experimentación en robótica: adecuado para cursos o talleres donde se necesite un ejemplo completo de entrenamiento y despliegue con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta la pérdida de entrenamiento (~0,014) y la detención por meseta, sin métricas de éxito en la tarea (tasa de acierto, error medio, etc.).

## Requisitos de hardware

- Tamaño del modelo: 0,7 GB en safetensors, lo que sugiere un número de parámetros modesto (del orden de decenas de millones, aunque no se especifica).
- VRAM estimada para inferencia: no disponible, pero dado el tamaño y la arquitectura, es probable que quepa en GPUs con 4-8 GB de memoria (p. ej., RTX 3050, RTX 3060, Jetson Orin Nano).
- GPU recomendadas: no se indican; se puede ejecutar en cualquier GPU compatible con PyTorch y CUDA.
- Compatibilidad con hardware de consumo: sí, debido al reducido tamaño del modelo.
- Opciones de despliegue: LeRobot ofrece scripts de evaluación y despliegue en tiempo real; también puede ejecutarse con PyTorch estándar.
- Latencia y throughput: no disponibles; en una GPU moderna se espera inferencia en tiempo real para control de robots (frecuencias de 10-50 Hz), pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jaheroth/act_so100_reach | Reach en SO-100 simulado | ACT | ~0,7 GB | no disponible | Apache 2.0 | Hugging Face |
| pepijn223/act_so100 | Tarea similar en SO-100 (real o simulado) | ACT | no disponible | no disponible | no especificada | Hugging Face |
| KaiyueChen-code/so100-lerobot (modelos) | Varias tareas en SO-100 (ACT, SmolVLA, Pi0) | Múltiples | no disponible | no disponible | no especificada | GitHub |

No hay datos públicos de rendimiento comparativo entre estos modelos, por lo que no se puede establecer una jerarquía objetiva.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación (MuJoCo); no se ha validado en hardware real, por lo que puede existir una brecha sim-to-real significativa.
- Tarea específica y limitada: solo alcance (reach); no generaliza a otras tareas de manipulación sin reentrenamiento.
- Depende del dataset generado por un experto programado; la calidad de las demostraciones condiciona el comportamiento del modelo.
- No tiene capacidades de percepción semántica ni razonamiento; no puede interpretar instrucciones en lenguaje natural.
- Sin métricas de robustez frente a perturbaciones o variaciones del entorno.
- La licencia Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías de funcionamiento en producción.
- No se especifican requisitos de contexto ni de memoria; el modelo asume observaciones de estado y vídeo fijas según el dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaheroth/act_so100_reach
- Dataset de entrenamiento: https://huggingface.co/datasets/jaheroth/so100_reach
- Repositorio del autor (robot-learning): https://github.com/JaHeRoth/robot-learning
- Modelo similar de referencia: https://huggingface.co/pepijn223/act_so100
- Tutorial de LeRobot para SO-100: https://so100.nanocorp.app/blog/lerobot-tutorial-2026-train-first-ai-robot-policy-so100
