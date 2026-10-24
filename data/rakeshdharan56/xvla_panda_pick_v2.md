# Rakeshdharan56/xvla_panda_pick_v2

## Resumen

`Rakeshdharan56/xvla_panda_pick_v2` es una política de visión-lenguaje-acción (VLA) para robótica, publicada por Rakesh Dhamodharan, consistente en un ajuste fino del modelo base `lerobot/xvla-base` sobre un conjunto de datos propio de manipulación con un robot Franka Panda. El modelo no genera texto: recibe dos o tres flujos de imagen de cámara más el estado articular del robot y emite directamente un vector de acción de 7 dimensiones, siguiendo el paradigma de imitación end-to-end que popularizó LeRobot. Con 879.738.545 parámetros y un repositorio de 1,8 GB, es lo bastante pequeño para ejecutarse en una GPU de consumo.

La relevancia de esta ficha no está en el modelo en sí (es una política muy especializada, con 0 descargas y sin resultados de evaluación publicados), sino en el método que hereda: X-VLA, un framework VLA con *soft prompts* y *flow matching* presentado en el paper arXiv 2510.10274. X-VLA codifica cada configuración de robot o hardware como una "tarea" representada por un conjunto reducido de embeddings de *soft prompt* aprendibles, de forma que un único modelo puede reconciliar morfologías, sensores y espacios de acción distintos y adaptarse a un dominio nuevo con un ajuste ligero.

Este checkpoint concreto está entrenado para una tarea muy acotada: un brazo Panda con cámaras `agentview` y `eye_in_hand` debe entregar objetos de laboratorio (botellas, jeringuillas, viales) siguiendo nueve instrucciones en inglés. Es, por tanto, un ejemplo práctico de cómo se especializa un VLA de propósito general mediante el pipeline de LeRobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) con soft prompts aprendibles y cabecera de acción por *flow matching*, según el método X-VLA |
| Parametros totales | 879.738.545 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible; no expone ventana de contexto textual (política de imitación basada en observaciones) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors (1,8 GB para 879,7 M de parámetros, compatible con fp16/bf16) |
| Idiomas soportados | No disponible; el condicionamiento lingüístico se limita a las 9 instrucciones en inglés vistas en entrenamiento |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `panda` (Franka Emika Panda) |
| Cámaras | `agentview`, `eye_in_hand` |
| Entradas | `observation.images.image` (3, 256, 256), `observation.images.image2` (3, 256, 256), `observation.images.image3` (3, 224, 224), `observation.state` (8,) |
| Salidas | `action` (7,) |
| Pipeline | robotics |
| Modelo base | `lerobot/xvla-base` |

## Arquitectura y entrenamiento

El modelo sigue la receta de X-VLA: una arquitectura VLA "soft-prompted" en la que cada robot o setup de hardware se trata como una tarea, codificada mediante un conjunto pequeño de embeddings de *soft prompt* aprendibles que condicionan al modelo sobre la morfología y el espacio de acción. La generación de acciones se formula como *flow matching*, un paradigma de modelado generativo continuo habitual en políticas de difusión y *flow* para control robótico. El resultado es una arquitectura pensada para preentrenamiento estable sobre datasets heterogéneos y para adaptación eficiente a dominios nuevos. Los detalles concretos del backbone visual-lenguaje (número de capas, dimensión oculta, tokenizador) no se especifican en la información disponible.

El ajuste fino se realizó con LeRobot 0.5.2 sobre el dataset `Rakeshdharan56/pick_panda_v2`: 1136 episodios, 181.025 fotogramas a 20 FPS, con nueve instrucciones de entrega de objetos ("Can you give me the bottle", "Please pass the syringe", "Please pass the vial", "Hand me the bottle", etc.). La configuración de entrenamiento fue de 7500 pasos, batch size 32, optimizador AdamW (etiquetado como `xvla-adamw`), learning rate 1e-4 y semilla 1000. No se documenta el uso de RLHF o DPO, algo esperable en imitación supervisada pura, ni la composición exacta del preentrenamiento del modelo base.

## Capacidades

- Manipulación robótica end-to-end: mapea directamente observaciones visuales y propioceptivas a comandos de acción de 7 grados de libertad.
- Percepción multi-cámara: procesa simultáneamente dos vistas de 256x256 y una tercera de 224x224, lo que permite combinar una vista global de la escena con una vista de muñeca (`eye_in_hand`).
- Condicionamiento por instrucción en lenguaje natural: acepta órdenes como "Hand me the vial" o "Please pass the syringe" y las asocia a la habilidad de agarre y entrega correspondiente.
- Ejecución reactiva en bucle cerrado a la frecuencia del dataset de entrenamiento (20 FPS), adecuada para control de manipulación.
- Adaptación cross-embodiment mediante *soft prompts*: el método subyacente permite reutilizar el mismo modelo base para otros robots cambiando el conjunto de prompts.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, código, matemáticas ni visión descriptiva: es una política motora, no un asistente conversacional.
- No dispone de modo *thinking* ni de capacidades de audio.

## Casos de uso

- **Entrega de instrumental en un laboratorio o entorno clínico simulado**: el modelo está entrenado exactamente para pasar viales, jeringuillas y botellas a un operador; puede emplearse en prototipos de asistencia a personal sanitario o de laboratorio, con la salvedad de que no hay evaluación publicada de éxito. El repositorio del autor (`vla-cathlab-companion`) apunta a un escenario de sala de cateterismo.
- **Banco de pruebas de imitación con Franka Panda**: sirve como referencia reproducible de un pipeline completo LeRobot (grabación de datos, entrenamiento, `lerobot-rollout`) para equipos que quieran validar su infraestructura antes de entrenar políticas propias.
- **Punto de partida para ajuste fino con datos propios**: al derivar de `lerobot/xvla-base` y usar configuración estándar (AdamW, lr 1e-4, 7500 pasos), puede reentrenarse con `lerobot-train` sobre un dataset nuevo de otro robot con cambios mínimos.
- **Investigación en adaptación cross-embodiment**: permite experimentar con la sustitución de *soft prompts* para transferir la habilidad de "entregar objeto" a otra morfología o a otro conjunto de cámaras sin reentrenar desde cero.
- **Evaluación de robustez visual**: al depender de dos cámaras fijas, es un caso útil para medir degradación ante cambios de iluminación, oclusiones o reubicación de objetos, comparando la tasa de éxito antes y después.
- **Generación de datos sintéticos y aumento de dataset**: puede ejecutarse en bucle para producir trayectorias candidatas que luego se filtren manualmente y se añadan al dataset de entrenamiento (con revisión humana obligatoria, dado que no hay métricas de calidad).
- **Docencia y demostraciones de VLA**: su tamaño (879,7 M de parámetros, 1,8 GB) permite desplegarlo en un portátil con GPU de consumo para clases o demos de robótica de imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la sección de evaluación vacía con la nota "_No evaluation results have been provided for this policy yet_", por lo que no existen tasas de éxito en robot real, ni métricas de simulación, ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: unos 1,8 GB en fp16/bf16 solo para pesos; alrededor de 3,5 GB si se carga en fp32. Hay que sumar activaciones del codificador visual (tres imágenes de 256x256 y 224x224) y del estado, por lo que un presupuesto práctico de 3-6 GB es razonable, aunque no se publica una cifra oficial.
- **GPU recomendadas**: RTX 4090, RTX 3090, RTX 4080 para ejecución local con margen; A100/H100 innecesarias por tamaño, aunque pueden usarse para entrenamiento. El handoff del propio autor menciona una sesión en RTX 4090.
- **Cabe en GPU de consumo**: sí. Con 879,7 M de parámetros, entra holgadamente en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060) y previsiblemente en 6 GB, siempre que el resto del pipeline (cámaras, driver del robot) no consuma demasiado.
- **Opciones de despliegue**: `lerobot-rollout` con `--policy.path=Rakeshdharan56/xvla_panda_pick_v2` y `--robot.type=panda`; entrenamiento con `lerobot-train` apuntando a `lerobot/xvla-base`. No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama, que no aplican a este tipo de política (no es un modelo de lenguaje con decodificación autorregresiva estándar).
- **Latencia y throughput**: no disponibles. El dataset de entrenamiento se grabó a 20 FPS, lo que da una referencia de la frecuencia de control esperada, pero no se publican medidas de latencia por inferencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `Rakeshdharan56/xvla_panda_pick_v2` | 879,7 M | VLA X-VLA ajustado a Panda | Apache 2.0 | safetensors (LeRobot) | Hugging Face, 0 descargas |
| `lerobot/xvla-base` | No disponible | VLA X-VLA base (preentrenado multi-robot) | No disponible en la información proporcionada | safetensors (LeRobot) | Hugging Face |
| OpenVLA-7B | ~7 000 M | VLA basado en LLM (Llama 2) | Términos MIT con condiciones de Llama 2 | safetensors | Público |
| π0 (openpi) | ~3 000 M | VLA con *flow matching* | Apache 2.0 | safetensors / JAX | Público |

Nota: los datos de OpenVLA y π0 provienen de su documentación pública y no de la información proporcionada en esta ficha; conviene verificarlos en sus respectivos repositorios antes de citarlos. Para el modelo base `lerobot/xvla-base` no se dispone de parámetros, licencia ni benchmarks en la información consultada. No existe comparación de rendimiento posible porque este checkpoint no publica evaluación alguna.

## Limitaciones y advertencias

- **Ausencia total de evaluación**: no hay tasas de éxito en robot real ni en simulación; no debe asumirse que la política funciona fuera del entorno exacto de grabación.
- **Sobreajuste al dominio**: 1136 episodios de una única tarea (entrega de botellas, jeringuillas y viales) con un único robot Panda y una configuración de cámaras fija. Cualquier cambio de objetos, posiciones, iluminación o montaje de sensores puede degradar el comportamiento de forma no medida.
- **Dependencia de calibración**: las cámaras deben nombrarse y montarse exactamente como en entrenamiento (`agentview`, `eye_in_hand`), y el robot debe estar calibrado; de lo contrario el mapeo observación-acción deja de ser válido.
- **Idioma**: las instrucciones de condicionamiento están en inglés y limitadas a nueve formulaciones; no hay evidencia de generalización a paráfrasis ni a otros idiomas, incluido el castellano.
- **Riesgo físico**: es una política motora que actúa sobre hardware real. Los fallos no se manifiestan como alucinaciones de texto, sino como agarres fallidos, colisiones o movimientos erráticos; requiere parada de emergencia, límites de fuerza y supervisión humana en todo momento.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial del artefacto, pero no cubre los derechos sobre el dataset ni sobre el modelo base, cuya licencia no se detalla en la información disponible. Verificar antes de desplegar en producción.
- **Sesgos**: no evaluados. Al estar entrenado con demostraciones de un operador concreto, puede heredar sesgos de estilo de manipulación (velocidad, punto de agarre, altura) que reduzcan la generalización a otros operadores.
- **Trazabilidad**: el repositorio tiene 0 descargas y 0 likes, se creó y actualizó el mismo día (24 de octubre de 2026) y no incluye vídeo de demostración ni resultados; tratarlo como un experimento, no como un artefacto validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rakeshdharan56/xvla_panda_pick_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/Rakeshdharan56/pick_panda_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Rakeshdharan56/pick_panda_v2
- Paper X-VLA (arXiv 2510.10274): https://arxiv.org/abs/2510.10274
- Paper en Hugging Face: https://huggingface.co/papers/2510.10274
- Página del proyecto X-VLA: https://thu-air-dream.github.io/X-VLA/
- Documentación técnica de X-VLA en DeepWiki: https://deepwiki.com/2toinf/X-VLA/2.1-xvla-model
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Guía de LeRobot para X-VLA: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Perfil del autor en Hugging Face: https://huggingface.co/Rakeshdharan56/models
- Repositorio del autor con el handoff de sesión en RTX 4090: https://github.com/Rakeshdharan/vla-cathlab-companion/blob/main/docs/handoffs/2026-10-23-rtx4090-maniskill-genesis-session.md
