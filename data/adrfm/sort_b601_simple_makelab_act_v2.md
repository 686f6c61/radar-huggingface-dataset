# adrfm/sort_b601_simple_makelab_act_v2

## Resumen

`adrfm/sort_b601_simple_makelab_act_v2` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de un único paso de control. El modelo lo publica el usuario `adrfm` mediante LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real, y está entrenado específicamente para un robot Seeed B601 RS follower con dos cámaras (`side` y `wrist`).

La política resuelve una tarea concreta de manipulación: coger discos de un plato gris y colocar el disco negro en el plato rojo y el blanco en el plato azul. Se entrenó con 41 episodios teleoperados (35.456 fotogramas a 30 FPS, aproximadamente 19,7 minutos de demostraciones) durante 25.000 pasos de optimización. El conjunto de pesos ocupa unos 0,2 GB y suma 51.670.663 parámetros, lo que lo sitúa en el rango de los modelos ligeros que caben holgadamente en una GPU de consumo.

Su relevancia es fundamentalmente práctica: sirve como referencia reproducible de un pipeline completo de imitación (grabación de datos, entrenamiento y despliegue) con LeRobot 0.6.2, y como punto de partida para hacer fine-tuning en tareas de pick-and-place similares. No es un modelo de lenguaje: no procesa texto ni mantiene contexto conversacional, sino observaciones visuales y de estado del robot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con variable latente CVAE y codificadores visuales convolucionales |
| Parámetros totales | 51.670.663 (~51,7 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: no es un modelo de lenguaje; consume una observación por paso y emite un fragmento de acciones |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos en safetensors y no documenta variantes cuantizadas |
| Idiomas soportados | No disponible; la política no procesa lenguaje natural (solo visión y estado propioceptivo) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Librería | LeRobot 0.6.2 |
| Tipo de robot | `seeed_b601_rs_follower` (7 grados de libertad) |
| Cámaras | `side` y `wrist`, resolución 640x480 a 30 FPS |
| Entradas | `observation.state` (7,), `observation.images.side` (3, 480, 640), `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (7,) |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación y actualización | 11 de septiembre de 2026 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el artículo arXiv:2304.13705 (*Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware*). La arquitectura combina un transformer encoder-decoder con un esquema de autoencoder variacional condicional (CVAE): un codificador visual procesa las imágenes de las cámaras `side` y `wrist`, el estado del robot (`observation.state`, vector de 7 dimensiones) se proyecta junto con la variable latente, y el decodificador genera un fragmento de acciones futuras en lugar de una sola acción. Predecir chunks reduce el error de composición acumulado típico de las políticas paso a paso y suaviza el control.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `adrfm/sort_b601_simple_makelab`, compuesto por 41 episodios teleoperados y 35.456 fotogramas a 30 FPS (unos 19,7 minutos de datos). La configuración reportada es de 25.000 pasos, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni ningún ajuste por preferencias: es aprendizaje supervisado puro a partir de demostraciones humanas. Tampoco se detalla la composición exacta de aumentos de datos ni el número de épocas efectivas sobre el dataset.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 7 dimensiones para un robot Seeed B601 RS follower a partir de observaciones visuales y de estado.
- Fusión de dos vistas: utiliza simultáneamente una cámara lateral (`side`) y una de muñeca (`wrist`) a 640x480 y 30 FPS.
- Predicción de fragmentos de acción (action chunking), lo que permite movimientos más suaves y coherentes que el control paso a paso.
- Ejecución de una tarea de clasificación por color: coger discos de un plato gris y depositarlos en el plato rojo (negro) o azul (blanco).
- Inferencia condicionada por instrucción de tarea en texto (`--task="Pick disks from grey plate..."`), aunque el modelo no interpreta lenguaje: la cadena se usa como metadato en el pipeline de LeRobot.
- No dispone de tool calling, function calling ni soporte de agentes multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingües, de razonamiento simbólico, matemáticas, código ni visión generalista fuera del dominio entrenado.

## Casos de uso

- Clasificación automatizada de piezas por color: la política está entrenada exactamente para separar discos negros y blancos en dos platos, por lo que puede desplegarse directamente en una célula de montaje o laboratorio con esa tarea.
- Base para fine-tuning en tareas de pick-and-place: al compartir arquitectura y formato con LeRobot, se puede reentrenar con un dataset propio de pocas decenas de episodios y reutilizar la configuración de entrenamiento reportada (25.000 pasos, lote 8, lr 1e-5) como punto de partida.
- Validación de pipelines de imitación de extremo a extremo: sirve como caso reproducible para verificar que la instalación de LeRobot, la calibración del robot, las cámaras y el comando `lerobot-rollout` funcionan antes de invertir tiempo en grabar datos nuevos.
- Investigación en aprendizaje por imitación: permite reproducir experimentos sobre acción fragmentada (chunking), sensibilidad al número de episodios o robustez ante cambios de iluminación y posición de objetos.
- Automatización de tareas repetitivas en laboratorio (`makelab`): el nombre del dataset sugiere un entorno de laboratorio donde la manipulación repetitiva de discos o muestras puede delegarse al robot.
- Prototipado con hardware de bajo coste: al ser un modelo de 51,7 M de parámetros y 0,2 GB, se integra en montajes con GPU modesta o incluso CPU, lo que facilita demos y pruebas docentes.
- Recogida de datos asistida: puede usarse como política inicial para ejecutar la tarea mientras un operador corrige, generando nuevos episodios que amplíen el dataset original de 41 episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente que todavía no se han proporcionado resultados de evaluación en robot real (número de ensayos, éxitos y tasa de éxito por tarea), por lo que no es posible afirmar ninguna cifra de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los 51.670.663 parámetros ocupan aproximadamente 207 MB; en fp16, unos 103 MB. Sumando activaciones y búferes de las dos cámaras a 640x480, un presupuesto de 1-2 GB de VRAM es suficiente.
- GPU recomendadas: cualquier GPU con soporte CUDA razonablemente moderna. Una RTX 3060 (12 GB) o RTX 4060 es más que suficiente; una RTX 4090, A100 o H100 estarían enormemente sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU discreta de los últimos ocho años, e incluso en CPU, aunque con latencia mayor.
- Restricción real de latencia: al ejecutarse a 30 FPS, el bucle de control necesita inferencias por debajo de ~33 ms por paso para no degradar el control; conviene medirlo en el hardware objetivo antes de desplegar.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=adrfm/sort_b601_simple_makelab_act_v2`), PyTorch con CUDA. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Observaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `adrfm/sort_b601_simple_makelab_act_v2` | ACT (imitación, chunking) | 51,7 M | Estado (7,) + 2 cámaras 640x480 | Apache-2.0 | Hugging Face (0 descargas) |
| Políticas ACT de LeRobot (otros checkpoints del Hub) | ACT (imitación, chunking) | No disponible | Depende del robot y las cámaras | Apache-2.0 en la mayoría de checkpoints | Hugging Face |
| Diffusion Policy (integrada en LeRobot) | Política de difusión para imitación | No disponible | Estado + una o varias cámaras | Apache-2.0 | Repositorio de LeRobot |
| Modelos VLA (por ejemplo SmolVLA o pi0) | Visión-lenguaje-acción | No disponible | Añaden instrucciones en lenguaje natural | No disponible en la información proporcionada | Hugging Face / repositorios de los autores |

Las alternativas con cifras verificables no están disponibles en la información proporcionada. La comparación relevante es cualitativa: ACT es más ligero y rápido de entrenar que una política de difusión, y mucho más pequeño que un modelo visión-lenguaje-acción, pero a cambio no acepta instrucciones en lenguaje natural y su generalización es muy limitada fuera del dominio de entrenamiento.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito publicada en robot real, así que el rendimiento efectivo es desconocido.
- Dataset muy reducido: 41 episodios y 35.456 fotogramas son suficientes para una tarea estrecha, pero implican alto riesgo de sobreajuste a posiciones, iluminación y apariencia concretas del montaje original.
- Dependencia estricta del hardware: solo funciona con un robot `seeed_b601_rs_follower` y con dos cámaras cuyos nombres e índices deben coincidir con las claves de observación (`side`, `wrist`). Cambiar la disposición de las cámaras invalida la política.
- Sin capacidades lingüísticas: no entiende instrucciones, no hay tool calling ni razonamiento multi-paso simbólico. La cadena `--task` es informativa para el pipeline, no una entrada del modelo.
- Riesgo de acciones fuera de distribución: en robótica, el equivalente a la alucinación es una acción incorrecta o insegura ante objetos, texturas o posiciones no vistas. Deben preverse paradas de emergencia y límites de par.
- Idiomas: no aplica; no hay soporte multilingüe que evaluar.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero conviene revisar las condiciones del hardware, del robot Seeed y de las dependencias de LeRobot antes de un despliegue productivo.
- Adopción nula: 0 descargas y 0 likes en el momento del análisis, sin validación por parte de la comunidad ni informes de terceros.
- Fecha de publicación atípica (2026-09-11): conviene verificar la vigencia del repositorio y de la versión de LeRobot 0.6.2 con la que se entrenó.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adrfm/sort_b601_simple_makelab_act_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/adrfm/sort_b601_simple_makelab
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=adrfm/sort_b601_simple_makelab
- Artículo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
