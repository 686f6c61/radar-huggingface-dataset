# nberezny/act_franka_pick_place_v2

## Resumen

`nberezny/act_franka_pick_place_v2` es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación presentado en el artículo arXiv 2304.13705 que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo lo publica el usuario Nicholas Berezny (nberezny) en Hugging Face, entrenado y subido con la librería LeRobot de Hugging Face, y está especializado en una única tarea de manipulación sobre un robot Franka Panda simulado: coger un cubo rojo y colocarlo sobre una casilla azul.

Con 51.590.792 parámetros (unos 51,7 millones) y un repositorio de apenas 0,2 GB en formato safetensors, no es un modelo de lenguaje: es un controlador visomotor que consume dos cámaras (vista cenital y vista de muñeca) más el estado del robot, y emite un vector de acción de 8 dimensiones. Su relevancia es práctica para quien trabaja con LeRobot: sirve como referencia reproducible de un pipeline completo de imitación (dataset de 100 episodios y 15.931 fotogramas a 20 FPS, entrenamiento de 30.000 pasos) sobre el simulador Franka.

La información disponible es limitada: la model card no declara licencia ni idiomas, no incluye resultados de evaluación y no aporta benchmarks. Las cifras de arquitectura y entrenamiento proceden de la propia model card y de los metadatos de safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.590.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje; ventana de observación por paso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (no aplica; entrada visual y de estado, salida de acciones) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de robot | `franka_panda_sim` |
| Camaras | `overhead`, `wrist` |
| Entrada visual | `observation.images.overhead` (3, 240, 320) y `observation.images.wrist` (3, 240, 320) |
| Entrada de estado | `observation.state` (8,) |
| Salida | `action` (8,) |
| Dataset de entrenamiento | `nberezny/franka_pick_place_v2` (100 episodios, 15.931 fotogramas, 20 FPS) |
| Tarea | "Pick up the red cube and place it on the blue square." |

## Arquitectura y entrenamiento

ACT es un transformer de aprendizaje por imitación que, en lugar de predecir una acción por paso de control, predice un chunk de acciones futuras a partir de las observaciones actuales. El modelo combina dos flujos visuales (cámaras `overhead` y `wrist`, ambas a 240x320 píxeles y 3 canales) con un vector de estado propioceptivo de 8 dimensiones, y produce un vector de acción también de 8 dimensiones. El repositorio ocupa 0,2 GB y contiene 51,59 millones de parámetros en safetensors.

El entrenamiento se realizó con LeRobot 0.7.0 sobre el dataset `nberezny/franka_pick_place_v2`: 100 episodios teleoperados, 15.931 fotogramas a 20 FPS, con una única instrucción de tarea. La configuración declarada es de 30.000 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta en la información disponible el número de tokens, la composición del dataset más allá de la tarea, ni si hubo etapas de RLHF o DPO (no aplicables en un pipeline de imitación supervisada como este).

## Capacidades

- Control visomotor de un brazo Franka Panda simulado para una tarea concreta de pick-and-place.
- Predicción de chunks de acciones (8 dimensiones) a partir de dos vistas de cámara y del estado del robot.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin recompensa explícita.
- Ejecución de políticas en bucle cerrado mediante `lerobot-rollout` con `--strategy.type=base`.
- Reentrenamiento reproducible con `lerobot-train` usando `--policy.type=act`.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento textual: no es un modelo de lenguaje.
- Capacidades multilingües: no aplica.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del dominio robótico.

## Casos de uso

- Reproducción de referencia en LeRobot: sirve para validar una instalación completa de LeRobot (instalación, calibración de hardware, grabación y entrenamiento) con un caso conocido y de bajo coste computacional, dado que el checkpoint ocupa 0,2 GB.
- Investigación en aprendizaje por imitación: punto de partida para comparar variantes de ACT (distintos tamaños de chunk, aumentos de datos o configuraciones de cámara) manteniendo fijo el dataset `franka_pick_place_v2`.
- Docencia y formación en robótica: ejemplo mínimo y autocontenido de política visomotora con dos cámaras y estado propioceptivo, adecuado para prácticas de laboratorio en simulador.
- Pruebas de integración de pipelines de rollout: el comando `lerobot-rollout` con `--duration=60` permite verificar el cableado de cámaras, puertos y nombres de observación antes de invertir en entrenamientos más largos.
- Generación de datos sintéticos de control: la política puede emplearse para producir trayectorias de referencia en el simulador Franka y alimentar experimentos de evaluación comparativa.
- Base para fine-tuning en tareas relacionadas: al estar entrenada sobre un robot Franka Panda simulado, puede servir como inicialización para variantes de pick-and-place con objetos o posiciones distintas, siempre que se respeten los nombres de las claves de observación.
- Validación de infraestructura de inferencia: útil para medir latencia y throughput de un policy ACT de 51,7 M de parámetros en GPU de consumo antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, número de ensayos ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,59 M de parámetros en FP32, los pesos ocupan aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU con al menos 2-4 GB de VRAM libre, incluyendo las integradas.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; no se requiere A100 ni H100. Una RTX 4090, RTX 3090 o incluso una RTX 3060 son más que suficientes para el modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en CPU para pruebas puntuales, aunque el cuello de botella real será el procesamiento de las dos cámaras a 20 FPS.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `--strategy.type=base`) es la vía documentada; el modelo no está pensado para vLLM, llama.cpp, Ollama ni TGI, que son servidores de modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El control opera a 20 FPS según el dataset de entrenamiento, pero no se documenta la latencia real de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / dominio | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nberezny/act_franka_pick_place_v2` | 51,59 M | Política ACT para Franka Panda sim, tarea única | Sin evaluación publicada | no disponible | Hugging Face (0 descargas, 0 likes) |
| `nberezny/act_franka_pick_place` | 51,7 M (según búsqueda web) | Política ACT para Franka Panda, versión previa | no disponible | no disponible | Hugging Face |
| Otras políticas ACT de LeRobot | no disponible | Distintos robots y tareas | no disponible | no disponible | Hugging Face / LeRobot |

No se dispone de datos de benchmarks ni de comparaciones cuantitativas con alternativas de la misma categoría en la información proporcionada. La única alternativa identificada es la versión anterior del mismo autor, `nberezny/act_franka_pick_place`.

## Limitaciones y advertencias

- Modelo de dominio muy estrecho: entrenado para una única instrucción ("Pick up the red cube and place it on the blue square") sobre un Franka Panda simulado; no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluación: no hay tasa de éxito publicada, por lo que no puede afirmarse su fiabilidad en producción.
- Dependencia fuerte de la configuración de cámaras: los nombres `overhead` y `wrist`, sus resoluciones (240x320) y el orden de las observaciones deben coincidir exactamente con los del entrenamiento.
- Licencia no declarada: la ausencia de licencia impide asumir permisos de uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Riesgo de sobreajuste al dataset: con solo 100 episodios y 15.931 fotogramas, es probable que la política sea sensible a cambios de iluminación, posición de objetos o distractores, aunque esto no se cuantifica en la información disponible.
- Sin soporte multilingüe ni de texto: no es un modelo de lenguaje y no puede usarse para generación de texto, razonamiento, código ni tool calling.
- Sin variantes cuantizadas publicadas: no hay GGUF, INT8 ni otras versiones optimizadas; el despliegue debe hacerse con los pesos safetensors originales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- Fecha de creación declarada en los metadatos: 2026-11-07, lo que conviene verificar antes de citar el modelo en publicaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nberezny/act_franka_pick_place_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/nberezny/franka_pick_place_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nberezny/franka_pick_place_v2
- Paper ACT (arXiv 2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Perfil del autor: https://huggingface.co/nberezny
- Modelos del autor: https://huggingface.co/nberezny/models
