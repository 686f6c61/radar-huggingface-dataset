# rbalazs/smolvla_demotrim

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante imitación. La ficha que nos ocupa, `rbalazs/smolvla_demotrim`, es un ajuste fino del modelo base `lerobot/smolvla_base` sobre un dataset propio de demostraciones de manipulación con un robot SO-100 (tipo `so_follower`). El resultado es una política específica para tres tareas de pick-and-place de vasos.

El modelo resuelve el problema de llevar políticas VLA a hardware asequible: con 450 millones de parámetros y pesos en safetensors, puede ejecutarse en GPUs de consumo, a diferencia de los VLA de gran escala que requieren clústeres. La arquitectura combina un codificador visual, un modelo de lenguaje y un cabezal de acciones que produce comandos de 6 dimensiones a partir de observaciones multimodales (estado de 6 dimensiones y tres cámaras de 256x256).

Es relevante ahora porque demuestra el flujo completo de LeRobot: grabación de datos, entrenamiento por imitación y despliegue en robot real con una sola línea de comandos. No obstante, se trata de un artefacto de demostración con alcance muy limitado: tres tareas concretas, un único tipo de robot y sin resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, basada en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | so_follower (SO-100) |
| Entradas | observation.state (6,), 3 imagenes (3, 256, 256) |
| Salidas | action (6,) |
| Tamano del repositorio | 21,1 GB |
| Libreria | lerobot 0.6.2 |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura de visión-lenguaje-acción que combina percepción visual, comprensión del lenguaje natural (la instrucción de tarea) y generación de acciones motoras en un único modelo. La variante aquí publicada consume el estado propioceptivo del robot (6 dimensiones), tres flujos de imagen de 256x256 píxeles y una instrucción textual, y emite un vector de acción de 6 dimensiones. El detalle interno de capas y mecanismos de atención no se especifica en la información disponible.

El ajuste fino se realizó sobre el dataset `rbalazs/SmolVLA_DemoDatasetTrim`, compuesto por 239 episodios y 62.967 fotogramas a 30 FPS, con tres tareas de manipulación de vasos (izquierdo, central y derecho). El entrenamiento empleó 40.000 pasos, batch de 32, optimizador AdamW, tasa de aprendizaje 1e-4 y semilla 1000, ejecutado con LeRobot 0.6.2. No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales; se trata de aprendizaje por imitación supervisado puro.

## Capacidades

- Generación de acciones de control robótico de 6 dimensiones a partir de observaciones multimodales (estado + tres cámaras).
- Ejecución de tareas de pick-and-place guiadas por instrucción textual: "Pick up the left cup and put it down", "Pick up the middle cup and put it down" y "Pick up the right cup and put it down".
- Fusión de información visual de múltiples cámaras (frontal y iPhone) para localización de objetos.
- Condicionamiento por lenguaje natural para seleccionar la tarea entre las tres entrenadas.
- Despliegue en hardware de consumo gracias a su tamaño reducido.
- No se documenta soporte de tool calling, agentes multi-paso, razonamiento explícito, visión general, audio ni capacidades multilingües de texto.

## Casos de uso

- **Automatización de pick-and-place en laboratorio**: el modelo ejecuta las tres tareas de manipulación de vasos para las que fue entrenado sobre un robot SO-100, permitiendo validar pipelines de imitación sin invertir en cómputo de gran escala.
- **Prototipado rápido de políticas robóticas**: un investigador puede grabar 239 episodios con LeRobot, ajustar el modelo base en una GPU de consumo y desplegar la política en menos de un día, gracias a los 450 M de parámetros.
- **Docencia y formación en robótica de imitación**: el flujo completo (`lerobot-train`, `lerobot-rollout`) sirve como ejemplo reproducible de entrenamiento y despliegue de un VLA en cursos y talleres.
- **Validación de hardware SO-100**: la política permite comprobar la calibración de cámaras, brazos y pinzas en una instalación `so_follower` antes de abordar tareas más complejas.
- **Base para ajustes finos posteriores**: al derivar de `lerobot/smolvla_base` con licencia Apache 2.0, puede reutilizarse como punto de partida para nuevas tareas de manipulación con el mismo robot.
- **Investigación en generalización visual**: permite estudiar cómo responde la política a cambios de iluminación, posición de objetos o distracciones, aunque sin métricas de éxito publicadas de referencia.
- **Integración en pipelines de evaluación comparativa**: sirve como política de referencia de bajo coste para comparar metodologías de imitación dentro del ecosistema LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política (`No evaluation results have been provided for this policy yet`), por lo que no existen tasas de éxito ni comparaciones numéricas verificables.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 450 M de parámetros en safetensors (aproximadamente 1,8 GB en fp32 o 0,9 GB en fp16), más el procesamiento de tres imágenes de 256x256, se estima un consumo de VRAM en el rango de 2 a 4 GB, aunque el dato exacto no está disponible.
- **GPU recomendadas**: cualquier GPU NVIDIA con al menos 4-8 GB de VRAM; se espera funcionamiento en RTX 3060, RTX 4060, RTX 4090, A100 y H100. El modelo base SmolVLA está diseñado explícitamente para hardware de consumo.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de gama media y alta de consumo; el tamaño del repositorio (21,1 GB) se debe a checkpoints de entrenamiento, no al peso de inferencia.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout` con `--policy.path=rbalazs/smolvla_demotrim`), con soporte de dispositivo CUDA (`--policy.device=cuda`) para entrenamiento. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de texto.
- **Latencia y throughput**: no disponibles. La política opera a 30 FPS según el dataset de entrenamiento, pero no se publican mediciones de latencia en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rbalazs/smolvla_demotrim | 450 M | no disponible | 3 tareas de pick-and-place con SO-100 | Apache 2.0 | Hugging Face (27 descargas) |
| lerobot/smolvla_base | no disponible | no disponible | Modelo base VLA, ajustable a múltiples robots | Apache 2.0 | Hugging Face |
| Políticas VLA de gran escala (p. ej. OpenVLA) | no disponible en esta ficha | no disponible | Manipulación generalista | no disponible | no disponible |

La comparación se limita al ecosistema LeRobot porque no se dispone de datos verificables de alternativas en la información proporcionada. Frente a `lerobot/smolvla_base`, este modelo está especializado en tres tareas concretas y un robot específico, lo que reduce su generalidad pero simplifica el despliegue directo.

## Limitaciones y advertencias

- **Alcance muy restringido**: solo ha sido entrenado para tres tareas de manipulación de vasos con un robot `so_follower` y cámaras concretas; no generaliza a otras tareas, objetos o robots sin reentrenamiento.
- **Sin evaluación publicada**: no existen tasas de éxito ni métricas de robustez, por lo que se desconoce su fiabilidad real en producción.
- **Riesgo de sobreajuste al entorno de grabación**: cambios en iluminación, posición de los vasos, fondo o calibración de cámaras pueden degradar el rendimiento de forma no cuantificada.
- **Dependencia de la instrucción textual exacta**: las tareas se definen con frases literales del dataset; variaciones en la formulación pueden afectar al comportamiento.
- **Sesgos**: no documentados; al ser un modelo de control motor entrenado con demostraciones limitadas, puede heredar sesgos de posición y estilo de los demostradores.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base y el dataset deben verificarse por separado; el dataset de entrenamiento no declara licencia en la información disponible.
- **Fecha de creación anómala**: el repositorio figura creado el 2026-11-09, lo que conviene verificar antes de citarlo.
- **Repositorio pesado**: 21,1 GB por checkpoints de entrenamiento, lo que complica su descarga y almacenamiento en entornos con recursos limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rbalazs/smolvla_demotrim
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/rbalazs/SmolVLA_DemoDatasetTrim
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=rbalazs/SmolVLA_DemoDatasetTrim
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
