# nakanakagawa/sponge_task_10_27_v1_14ep

## Resumen

`nakanakagawa/sponge_task_10_27_v1_14ep` es una política robótica de imitación entrenada con el método ACT (Action Chunking with Transformers) y publicada en Hugging Face mediante el framework LeRobot. No es un modelo de lenguaje: es un modelo de control visuomotor que, a partir de observaciones (imágenes de cámara y estado articular), predice secuencias cortas de acciones —chunks— en lugar de un único paso de control. El autor es el desarrollador independiente `nakanakagawa`, que mantiene una serie de políticas y datasets centrados en una tarea de manipulación de esponja (`sponge_task`).

El modelo tiene 51.668.614 parámetros y un repositorio de 0,2 GB, lo que corresponde a pesos en precisión completa (fp32) de aproximadamente 207 MB más los artefactos de configuración y normalización. Por su tamaño y naturaleza, está pensado para ejecutarse en hardware de bajo coste, en línea con la filosofía del paper original de ACT, orientado a manipulación fina con brazos robóticos económicos.

Su relevancia es acotada pero concreta: sirve como referencia reproducible de un pipeline completo de imitación (dataset propio, entrenamiento con `lerobot-train`, evaluación con `lerobot-record`) sobre un robot SO-100, y como punto de partida para fine-tuning en tareas de recogida y colocación. Es un artefacto de investigación con 0 descargas y 1 like en el momento de la consulta, y la model card no aporta métricas de éxito ni detalles del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones que predice chunks |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ACT opera sobre un horizonte fijo de observaciones y predice chunks de acciones, cuyo tamano no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (los pesos publicados estan en safetensors; no se documentan variantes cuantizadas. Al ser un modelo de ~51,7 M de parametros, la cuantizacion es innecesaria en la practica) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; las entradas son imágenes y estado articular) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705, orientado a manipulación fina y bimanual con hardware de bajo coste. La arquitectura combina un backbone de visión (resnet) con un transformer encoder-decoder que, en lugar de regresar una acción por paso, predice un chunk de acciones futuras. Esta formulación reduce el error de acumulación típico del comportamiento cloning paso a paso y suaviza la ejecución. El checkpoint incluye además los procesadores de normalización de observaciones y acciones generados por LeRobot.

El entrenamiento se realizó con `lerobot-train` sobre el dataset `nakanakagawa/sponge_task_10_27_v1_14ep`. El sufijo `14ep` del nombre sugiere 14 épocas de entrenamiento, aunque la model card no confirma este extremo ni documenta el número de episodios de teleoperación, la composición del dataset, el número de cámaras ni si hubo aumento de datos. No se indica el uso de RLHF, DPO ni ninguna otra fase de alineación, lo cual es esperable en una política de imitación. La model card tampoco detalla hiperparámetros (learning rate, batch size, chunk size, horizonte de observación).

## Capacidades

- Control visuomotor para manipulación robótica: genera comandos de acción a partir de imágenes y estado de las articulaciones.
- Predicción de chunks de acciones, lo que permite ejecución más fluida y menor frecuencia de inferencia que un control paso a paso.
- Aprendizaje por imitación a partir de datos de teleoperación, sin recompensa explícita ni entorno simulador.
- Compatibilidad nativa con el ecosistema LeRobot: entrenamiento, evaluación y registro de episodios con los comandos `lerobot-train` y `lerobot-record`.
- Orientado a robots de bajo coste tipo SO-100 (`so100_follower` aparece en el comando de evaluación de la model card).
- Reentrenamiento y fine-tuning sencillos sobre datasets propios en formato LeRobot.
- Soporte de tool calling / function calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingües: no disponibles (no procesa texto).
- Modo "thinking", visión general, audio o generación de texto: no disponibles (fuera del alcance del modelo).

## Casos de uso

- Recogida de esponjas u objetos absorbentes: es la tarea declarada en el nombre del repositorio; la política se ejecuta sobre un SO-100 y reproduce la secuencia de aproximación, agarre y depósito aprendida del dataset.
- Base para fine-tuning en tareas de pick-and-place: al estar en formato LeRobot y con 51,7 M de parámetros, se puede reentrenar en minutos u horas con un dataset propio y una única GPU consumer.
- Referencia reproducible de pipeline de imitación: sirve para validar la cadena completa `lerobot-train` → `lerobot-record` → evaluación con 10 episodios, tal como indica la model card.
- Automatización de limpieza de superficies en entornos controlados: con el dataset adecuado, el mismo esquema ACT se aplica a barrido o fregado de precisión sobre superficies planas.
- Docencia y prototipado en robótica: su huella de memoria (<1 GB) permite ejecutarlo desde un portátil o una Jetson, lo que lo hace apto para laboratorios con presupuesto reducido.
- Comparación de datasets de teleoperación: el autor publica múltiples variantes (`sponge_task_10_14_v2`, `sponge_task_10_02_v6`, `sponge_task_10_02_v4`), lo que permite estudiar el efecto del volumen y la composición de datos sobre la tasa de éxito.
- Evaluación estandarizada de políticas: los repositorios `eval_sponge_task1` y `eval_sponge_task2` del mismo autor sugieren un flujo de validación comparativa entre checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye tasa de éxito, número de episodios de evaluación, ni comparaciones con otras políticas. Tampoco se aportan métricas de pérdida de entrenamiento ni curvas de aprendizaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Los pesos en fp32 ocupan ~207 MB (51.668.614 × 4 bytes) y el repo completo 0,2 GB; en fp16 serían ~103 MB. Sumando activaciones y buffers de imagen, el consumo real se sitúa holgadamente por debajo de 1 GB.
- GPU recomendadas: cualquier GPU consumer con CUDA sirve; una RTX 3060, RTX 4060 o RTX 4090 es más que suficiente. También es viable en CPU para inferencia, aunque la latencia por chunk será mayor.
- Cabe en GPU consumer: sí, en prácticamente cualquier modelo de los últimos ocho años, y también en dispositivos embebidos tipo Jetson Orin Nano o Raspberry Pi 5 con acelerador.
- Opciones de despliegue: LeRobot (`lerobot-record --policy.path=...`), PyTorch nativo; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política robótica.
- Latencia y throughput estimados: no disponibles. No se publica frecuencia de control, tiempo por chunk ni FPS de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nakanakagawa/sponge_task_10_27_v1_14ep` (ACT) | 51.668.614 | no disponible | no disponible | apache-2.0 | Hugging Face, libreria lerobot |
| `nakanakagawa/sponge_task_10_14_v2` (ACT) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | Hugging Face, libreria lerobot |
| Diffusion Policy (familia de políticas de imitación) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | implementada en LeRobot |
| OpenVLA / SmolVLA (políticas VLA) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | Hugging Face |

Nota: no se dispone de datos numéricos verificables para establecer una comparación cuantitativa. La comparación relevante es cualitativa: ACT es un método ligero y específico de tarea, mientras que las políticas VLA son modelos mayores, preentrenados y con generalización a múltiples tareas, a costa de mucho más cómputo.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea (`sponge_task`) y un robot concreto; fuera de esa distribución de observaciones el comportamiento es impredecible.
- Sin métricas publicadas: no hay tasa de éxito, número de episodios de entrenamiento ni curvas de validación, por lo que no se puede evaluar su calidad sin ejecutarla.
- Riesgo de fallo silencioso: como toda política de imitación, puede ejecutar acciones plausibles pero incorrectas (agarre fallido, colisión) sin señal de error interna.
- Sobreajuste probable: 14 épocas sobre un dataset no documentado, sin información sobre variabilidad de posiciones, iluminación o fondos, sugiere escasa robustez ante cambios de entorno.
- Sesgos de datos: cualquier sesgo de las demostraciones de teleoperación (posiciones iniciales, objetos, operador) se reproduce en el comportamiento del robot.
- Limitaciones de contexto e idioma: no aplica procesamiento de lenguaje; no acepta instrucciones en texto ni soporta múltiples idiomas.
- Licencia: apache-2.0 permite uso comercial y modificación con atribución, pero la licencia del dataset de entrenamiento (`nakanakagawa/sponge_task_10_27_v1_14ep`) no se especifica en la información disponible; conviene verificarla antes de un uso comercial.
- Madurez: 0 descargas y 1 like; no hay evidencia de uso en producción ni de validación por terceros.
- Seguridad física: cualquier despliegue en un robot real requiere límites de par, paradas de emergencia y supervisión humana; la model card no documenta ninguna medida de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nakanakagawa/sponge_task_10_27_v1_14ep
- Dataset de entrenamiento: https://huggingface.co/datasets/nakanakagawa/sponge_task_10_27_v1_14ep
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Perfil del autor: https://huggingface.co/nakanakagawa
- Datasets del autor: https://huggingface.co/nakanakagawa/datasets
- Variante relacionada: https://huggingface.co/nakanakagawa/sponge_task_10_14_v2
- Noticia sobre el dataset `sponge_task_10_02_v6`: https://www.5radar.com/dataopensource/news/468056/
- Noticia sobre el dataset `sponge_task_10_02_v4`: https://www.5radar.com/dataopensource/news/468062/
