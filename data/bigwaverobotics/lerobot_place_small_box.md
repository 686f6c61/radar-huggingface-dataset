# Bigwaverobotics/lerobot_place_small_box

## Resumen

`lerobot_place_small_box` es una política de robótica entrenada con LeRobot, el framework de aprendizaje por imitación de Hugging Face, para ejecutar la tarea de colocar una caja pequeña en un escenario industrial. El modelo lo publica la organización Bigwaverobotics y emplea la arquitectura ACT (Action Chunking with Transformers), una de las políticas de referencia del ecosistema LeRobot para manipulación robótica a partir de demostraciones.

Se trata de un modelo especializado y de pequeño tamaño: 51,6 millones de parámetros en `model.safetensors` (197 MiB) y un repositorio total de 0,2 GB. No es un modelo de lenguaje, sino un controlador de acciones que mapea observaciones visuales (codificadas con un backbone ResNet-18) a secuencias de acciones motoras en chunks de 50 pasos. Esto lo hace ejecutable en hardware modesto, incluida GPU de consumo, y adecuado para integración en bucles de control robótico en tiempo real.

Su relevancia es acotada pero concreta: demuestra el flujo completo de entrenamiento y publicación de políticas de manipulación con LeRobot en un caso industrial (caja pequeña/grande), y sirve como referencia reproducible para equipos que quieran replicar tareas pick-and-place con aprendizaje por imitación. La licencia Apache-2.0 facilita su reutilización comercial, aunque la información publicada sobre el modelo es mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con backbone visual ResNet-18 |
| Parametros totales | 51.637.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (n_obs_steps = 1; chunk de 50 acciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 197 MiB) |

## Arquitectura y entrenamiento

La política sigue la arquitectura ACT: un transformer que recibe una única observación (imágenes de cámara más estado del robot, `n_obs_steps = 1`) y predice un chunk de 50 acciones (`chunk_size = 50`, `policy_n_action_steps = 50`), lo que reduce el error de acumulación y permite control a mayor frecuencia efectiva. La percepción visual se extrae con un ResNet-18 preentrenado, y el modelo se entrena por imitación supervisada (behavior cloning) sobre el dataset `itdevhumanoid/lerobot_place_small_box_dataset`, con preprocesadores de normalización y postprocesadores de desnormalización incluidos en el repositorio (`policy_preprocessor_step_3_normalizer_processor.safetensors` y `policy_postprocessor_step_0_unnormalizer_processor.safetensors`).

No se dispone de información sobre el número de tokens, la composición exacta del dataset, el número de demostraciones ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en behavior cloning). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal; la única particularidad técnica reseñable es el chunking de acciones propio de ACT.

## Capacidades

- Control robótico de manipulación: ejecuta la tarea de colocar una caja pequeña en un entorno industrial a partir de observaciones visuales.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones humanas o teleoperadas.
- Predicción de secuencias de acciones en chunks de 50 pasos, con una sola observación por inferencia.
- Percepción visual mediante ResNet-18 integrada en la política.
- Integración nativa con LeRobot (`ACTPolicy.from_pretrained(...)`).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Automatización de picking y placing en línea industrial: la política coloca cajas pequeñas en posiciones definidas, adecuada para celdas de trabajo repetitivas donde el comportamiento se ha demostrado previamente.
- Prototipado rápido de tareas de manipulación: sirve como punto de partida para entrenar variantes (caja grande, empaquetado, elevación) reutilizando el pipeline de LeRobot y el mismo backbone ResNet-18.
- Investigación en aprendizaje por imitación: referencia reproducible para comparar ACT frente a otras políticas de LeRobot (Diffusion Policy, TDMPC, VQ-BeT) en una tarea industrial concreta.
- Validación de hardware robótico: al tener solo 51,6 M de parámetros y 197 MiB de pesos, permite desplegar y probar en brazos robóticos con GPU de consumo antes de escalar a modelos mayores.
- Formación y docencia: ejemplo completo de extremo a extremo (dataset, entrenamiento, preprocesadores, checkpoint) para enseñar behavior cloning con LeRobot.
- Integración en pipelines de control en tiempo real: el chunking de 50 acciones reduce la frecuencia de inferencia necesaria, lo que facilita su uso en bucles de control con latencia limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (51,6 M de parámetros, ~200 MB de pesos); en la práctica, el consumo lo dominan las activaciones del ResNet-18 y el buffer de imágenes, por lo que 2-4 GB de VRAM son suficientes.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque para esta carga las consumer son más que suficientes.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU modernas, e incluso podría ejecutarse en CPU para inferencia de baja frecuencia.
- Opciones de despliegue: LeRobot (librería nativa), PyTorch; no se han publicado variantes para vLLM, llama.cpp, Ollama ni TGI (no aplicables a políticas robóticas).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|
| `lerobot_place_small_box` (ACT) | 51,6 M | 1 obs. / 50 acciones | Apache-2.0 | Hugging Face (LeRobot) |
| Diffusion Policy (LeRobot) | no disponible | no disponible | Apache-2.0 | Hugging Face (LeRobot) |
| VQ-BeT (LeRobot) | no disponible | no disponible | Apache-2.0 | Hugging Face (LeRobot) |
| OpenVLA | ~7 B | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada; la comparación se limita a disponibilidad y licencia.

## Limitaciones y advertencias

- Modelo altamente especializado: solo ejecuta la tarea de colocar una caja pequeña en el escenario para el que fue entrenado; no generaliza a otras tareas sin reentrenamiento.
- Dataset de entrenamiento no documentado en detalle: se desconoce el número de demostraciones, la variabilidad de posiciones y la robustez ante cambios de iluminación o fondo.
- Riesgo de sobreajuste al entorno de entrenamiento: cambios en la cámara, la mesa o los objetos pueden degradar el comportamiento de forma significativa.
- Sin información sobre sesgos: al ser un modelo de control, los sesgos se manifiestan como fallos sistemáticos en posiciones o condiciones concretas, no documentados.
- Sin benchmarks publicados: no hay evidencia cuantitativa de tasa de éxito que permita evaluar su idoneidad en producción.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Advertencia de seguridad: cualquier despliegue en un entorno físico debe incluir paradas de emergencia y límites de fuerza; el modelo no incorpora mecanismos de seguridad propios.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación prácticamente nulo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bigwaverobotics/lerobot_place_small_box
- Dataset de entrenamiento: https://huggingface.co/datasets/itdevhumanoid/lerobot_place_small_box_dataset
- LeRobot (framework): https://github.com/huggingface/lerobot
- Repositorio de referencia del autor (hub alternativo): `itdevhumanoid/lerobot_place_small_box`
