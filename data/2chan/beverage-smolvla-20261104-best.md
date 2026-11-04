# 2chan/beverage-smolvla-20261104-best

## Resumen

Beverage SmolVLA es una política de control robótico (vision-language-action, VLA) obtenida por ajuste fino supervisado del VLM SmolVLM2-500M-Video-Instruct de HuggingFaceTB. La desarrolla el usuario 2chan y está publicada en HuggingFace bajo la librería LeRobot. El modelo resuelve una tarea concreta: generar acciones de 12 dimensiones para un robot bimanual SO-101 en tareas de manipulación de bebidas (remover, verter agua, verter polvo de té verde latte y verter café). No es un modelo de lenguaje general, sino un policy que mapea observaciones multimodales (tres cámaras y estado del robot) a secuencias de acciones.

La relevancia es acotada: se trata de un checkpoint de investigación con 450 millones de parámetros, entrenado sobre un conjunto de demostraciones propio, sin datos publicados de éxito físico en robot. El checkpoint corresponde al paso 25.000 de la ejecución `20261104_034524_031275` y reporta una pérdida de validación de flow-matching de 0,0582, métrica offline que no equivale a tasa de éxito real. El repositorio ocupa 0,9 GB e incluye pesos, configuración y procesadores de normalización.

El modelo no incluye información sobre licencia ni idiomas, no publica benchmarks de tarea y no ha recibido descargas ni valoraciones en el momento de redactar esta ficha. Es, por tanto, un artefacto de nicho para reproducir o continuar experimentos con SmolVLA en un setup bimanual SO-101, no una pieza lista para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA basada en SmolVLM2-500M-Video-Instruct (VLM congelado) más experto de acciones y proyecciones entrenados; política SmolVLA de LeRobot |
| Parámetros totales | 450.046.176 (según safetensors) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0,9 GB, librería lerobot) |

## Arquitectura y entrenamiento

La política sigue el esquema SmolVLA: un VLM preentrenado y congelado (SmolVLM2-500M-Video-Instruct) que procesa las observaciones visuales y la instrucción de tarea, conectado mediante proyecciones a un experto de acciones que genera chunks de 50 pasos. El autor indica explícitamente que la política se inicializó sin los pesos de `lerobot/smolvla_base`; solo el experto de acciones y las proyecciones se entrenaron sobre las demostraciones de bebidas. La observación incluye tres cámaras (`observation.images.left_wrist`, `observation.images.right_wrist`, `observation.images.top`) y un estado de 12 dimensiones (brazo izquierdo seguido del derecho), con acciones también de 12 dimensiones.

El entrenamiento es de imitación con objetivo de flow-matching, sobre demostraciones etiquetadas con cuatro tareas (IDs 0, 1, 2 y 4: remover, verter agua, verter polvo de té verde latte y verter polvo de café). No se documenta el número de demostraciones, la composición del dataset, ni si hubo RLHF, DPO o aumento de datos. El checkpoint publicado es el mejor de la ejecución según la pérdida de validación de flow-matching (0,058248360) en el paso 25.000. No se incluyen estado del optimizador, del scheduler ni del RNG, por lo que no es posible reanudar el entrenamiento de forma exacta desde este artefacto.

## Capacidades

- Generación de acciones robóticas bimanuales de 12 dimensiones para un robot SO-101, con chunks de 50 pasos.
- Control condicionado por instrucción de tarea (task string) entre cuatro tareas de manipulación de bebidas.
- Percepción multimodal con tres vistas de cámara: muñeca izquierda, muñeca derecha y vista superior.
- Integración con el pipeline de LeRobot mediante `SmolVLAPolicy.from_pretrained` y procesadores pre/post guardados.
- Normalización de observaciones y acciones incluida en el repositorio (procesadores pre y post).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento explícito; el uso previsto es exclusivamente como política de control.

## Casos de uso

- Reproducción de experimentos SmolVLA en SO-101 bimanual: cargar el checkpoint con `SmolVLAPolicy.from_pretrained` y los procesadores guardados permite replicar la inferencia del autor sin reentrenar.
- Punto de partida para ajuste fino en nuevas tareas de bebidas: al no depender de `smolvla_base`, sirve como inicialización para experimentos con demostraciones adicionales en el mismo robot y cámaras.
- Evaluación comparativa de checkpoints: el repositorio hermano `beverage-smolvla-20261104-last` permite contrastar el mejor checkpoint frente al último de la misma ejecución.
- Investigación en imitación con flow-matching: la pérdida de validación registrada (0,0582) sirve como referencia para estudiar la correlación entre objetivo offline y éxito físico.
- Docencia y divulgación sobre VLA: el tamaño contenido (450 M parámetros, 0,9 GB) y el stack LeRobot facilitan demostraciones en entornos académicos.
- Integración en pipelines de robótica experimental: las claves de cámara y el formato de estado/acción documentados permiten conectar el policy a un bucle de control propio, siempre con validación física previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato numérico es la pérdida de validación de flow-matching registrada por el autor:

| Métrica | Valor | Nota |
|---|---|---|
| Pérdida de validación (flow-matching) | 0,058248360 | Objetivo offline; no mide éxito físico en robot |
| Paso del checkpoint | 25.000 | Checkpoint "best" de la ejecución `20261104_034524_031275` |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M parámetros en fp32 el peso ronda 1,8 GB, y en fp16/bf16 alrededor de 0,9 GB, a lo que hay que sumar activaciones del VLM y del experto de acciones.
- GPU recomendadas: no disponibles; por tamaño, una GPU consumer moderna (RTX 3060 12 GB o superior) debería ser suficiente para inferencia, aunque no hay confirmación del autor.
- Cabe en GPU consumer: probable por el recuento de parámetros, sin datos publicados de latencia ni de memoria pico real.
- Opciones de despliegue: la vía documentada es LeRobot (`lerobot.policies.smolvla.modeling_smolvla.SmolVLAPolicy` con `make_pre_post_processors`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Beverage SmolVLA (este) | 450.046.176 | no disponible | VLA bimanual SO-101, 4 tareas de bebidas | no disponible | HuggingFace, 0 descargas |
| lerobot/smolvla_base | no disponible en la información | no disponible | VLA base SmolVLA de LeRobot | no disponible | HuggingFace (referenciado por el autor) |
| HuggingFaceTB/SmolVLM2-500M-Video-Instruct | ~500 M (modelo base VLM) | no disponible | VLM general imagen/vídeo-texto | no disponible | HuggingFace |

La comparación con `smolvla_base` es relevante porque el autor indica que este checkpoint no se inicializó desde esos pesos, lo que lo convierte en una política entrenada desde el VLM congelado. No se dispone de datos de rendimiento comparables entre estos modelos.

## Limitaciones y advertencias

- La pérdida de validación de flow-matching es una métrica offline y el propio autor advierte que no mide el éxito físico en robot; no hay evidencia publicada de tasa de éxito.
- El modelo está entrenado para un robot y unas cámaras concretas (SO-101 bimanual, tres vistas); no es transferible sin más a otras morfologías o configuraciones de cámara.
- Solo cubre cuatro tareas de bebidas (IDs 0, 1, 2 y 4); se desconoce el comportamiento fuera de esa distribución.
- No se documentan sesgos, pero al ser un modelo de imitación hereda los sesgos y la variabilidad de las demostraciones del autor, no publicadas.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor.
- Idiomas no disponibles; la instrucción de tarea se pasa como texto, pero no se especifica qué lenguas maneja.
- No se incluyen estados de optimizador, scheduler ni RNG, lo que impide reanudar el entrenamiento de forma exacta.
- Sin descargas ni validación de la comunidad en el momento de redactar esta ficha; trátese como artefacto experimental.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/2chan/beverage-smolvla-20261104-best
- Checkpoint "last" de la misma ejecución: https://huggingface.co/2chan/beverage-smolvla-20261104-last
- Modelo base VLM: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
