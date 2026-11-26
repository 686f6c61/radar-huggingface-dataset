# Bigwaverobotics/lerobot_pick_big_box

## Resumen

`lerobot_pick_big_box` es una política de control robótico entrenada con el framework LeRobot de Hugging Face, publicada por el usuario Bigwaverobotics. No es un modelo de lenguaje: se trata de una política ACT (Action Chunking with Transformers) orientada a imitación visual-motora, diseñada para ejecutar la tarea de recoger una caja grande en un escenario industrial con cajas pequeñas y grandes. El checkpoint contiene 51.637.904 parámetros (unos 197 MiB en `model.safetensors`) y usa un backbone visual ResNet-18.

El modelo resuelve el problema de convertir observaciones visuales de una escena industrial en secuencias de acciones motoras de un brazo robótico, mediante aprendizaje por imitación a partir del dataset `itdevhumanoid/lerobot_pick_big_box_dataset`. Su relevancia es acotada: es un artefacto de investigación y demostración de un pipeline de entrenamiento concreto, no un modelo generalista. La model card lo describe explícitamente como parte de una serie de repos hermanos (pick → place → pack → lift → ship) que aún no están enlazados.

La ficha se publica bajo Apache-2.0, alineada con la licencia del framework LeRobot. La información disponible sobre composición del dataset, número de episodios, tasas de éxito o condiciones de entrenamiento es muy limitada: la model card no incluye métricas ni detalles del proceso de entrenamiento más allá de la configuración de la política.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con backbone visual ResNet-18 |
| Parametros totales | 51.637.904 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto textual; `n_obs_steps = 1`, `chunk_size = 50`) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo robótico, sin interfaz de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (más procesadores pre/post en safetensors y JSON) |

## Arquitectura y entrenamiento

La política sigue la arquitectura ACT, un transformer que predice *chunks* de acciones (secuencias de 50 pasos) a partir de una única observación visual por paso (`n_obs_steps = 1`). El backbone visual es una ResNet-18, y la cabeza de acción emite `policy_n_action_steps = 50` acciones por inferencia, lo que reduce la frecuencia de replanificación y suaviza el control. El checkpoint incluye procesadores de normalización y desnormalización (`policy_preprocessor_step_3_normalizer_processor.safetensors` y `policy_postprocessor_step_0_unnormalizer_processor.safetensors`), lo que indica que las observaciones y acciones se normalizan con estadísticas del dataset de entrenamiento.

El entrenamiento es por imitación supervisada sobre el dataset `itdevhumanoid/lerobot_pick_big_box_dataset` (referenciado también como `bwr/dataset_19893` en la configuración). No se documenta el número de episodios, la composición del dataset, ni si hubo aumento de datos o validación. Tampoco se indica el número de tokens o pasos de entrenamiento, ni si se aplicó RLHF/DPO (no aplicable en este dominio). La model card menciona que el artefacto local se generó en una ruta `run_yellow_box_policy_1_20261117`, lo que sugiere un entrenamiento puntual sin publicación de curvas de aprendizaje.

## Capacidades

- Control visomotor para tareas de manipulación robótica: recogida de cajas grandes en un escenario industrial con cajas de distintos tamaños.
- Predicción de secuencias de acciones en *chunks* de 50 pasos, lo que permite ejecutar movimientos continuos sin replanificar en cada paso.
- Aprendizaje por imitación a partir de demostraciones (no requiere recompensa explícita).
- Integración con el ecosistema LeRobot: carga mediante `ACTPolicy.from_pretrained(...)`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, visión general, audio ni capacidades multilingües.
- No dispone de modo *thinking* ni de interfaz conversacional.

## Casos de uso

- Automatización de picking en líneas de empaquetado: la política puede integrarse en un brazo robótico industrial para recoger cajas grandes de una cinta o estantería, usando la observación visual de una cámara y emitiendo chunks de 50 acciones que el controlador ejecuta de forma continua.
- Prototipado de pipelines de imitación con LeRobot: sirve como ejemplo reproducible de entrenamiento ACT con ResNet-18 y chunking de 50 pasos, útil para equipos que quieran replicar el flujo con sus propios datasets.
- Investigación en manipulación industrial: permite estudiar el comportamiento de políticas ACT en escenarios con objetos de tamaño variable (cajas pequeñas y grandes) y analizar la robustez del chunking frente a replanificaciones.
- Benchmark interno de políticas robóticas: al ser un checkpoint pequeño (0,2 GB), puede desplegarse en entornos de laboratorio para comparar con otras políticas ACT o con variantes con backbone distinto.
- Demostraciones educativas: útil en cursos de robótica e imitación para mostrar el ciclo observación → chunk de acciones → ejecución en un brazo real o simulado compatible con LeRobot.
- Base para *fine-tuning* en tareas de recogida: al estar bajo Apache-2.0 y ser un checkpoint compacto, puede reentrenarse con datos propios de otro tipo de caja o escenario industrial, siempre que se mantenga la compatibilidad con la clase `ACTPolicy`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de posición, ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,6 M de parámetros y pesos en safetensors de 197 MiB, la inferencia en FP32 requiere del orden de 0,2-0,5 GB de VRAM, dependiendo del tamaño de las imágenes de entrada y del *batch*.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU con al menos 2 GB de VRAM debería poder ejecutar el modelo.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (por ejemplo, GTX 1650 o superiores), aunque el dato no está confirmado en la model card.
- Opciones de despliegue: LeRobot (`ACTPolicy.from_pretrained`), con el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no aplicables por tratarse de una política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Bigwaverobotics/lerobot_pick_big_box` | ACT + ResNet-18 | 51,6 M | `chunk_size = 50`, `n_obs_steps = 1` | Apache-2.0 | Hugging Face |
| Otras políticas ACT de LeRobot | ACT | No disponible | No disponible | Apache-2.0 | Hugging Face (varias) |
| Políticas basadas en VLA (p. ej. OpenVLA) | VLA | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada para una única tarea (recoger una caja grande) y un escenario concreto; no generaliza a otras tareas sin reentrenamiento.
- Sin métricas publicadas: no hay tasas de éxito ni validación documentada, lo que impide evaluar su fiabilidad en producción.
- Dataset no descrito: se desconoce el número de episodios, la variabilidad de iluminación, posiciones de cámara y condiciones de la escena, lo que limita la evaluación de robustez.
- Riesgo de sobreajuste al entorno de entrenamiento: al usar `n_obs_steps = 1` y un backbone pequeño (ResNet-18), la política puede ser sensible a cambios de cámara, fondo o iluminación.
- Sin capacidades de lenguaje ni tool calling: no debe confundirse con un modelo de propósito general.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación en un entorno industrial recae en el integrador.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de mantenimiento.
- La model card referencia rutas locales (`/Users/mypark/...`) y un repo `itdevhumanoid/lerobot_pick_big_box` distinto del ID publicado, lo que puede indicar inconsistencias en la publicación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bigwaverobotics/lerobot_pick_big_box
- Dataset: https://huggingface.co/datasets/itdevhumanoid/lerobot_pick_big_box_dataset
- Framework LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot (políticas ACT): no disponible en la información proporcionada.
