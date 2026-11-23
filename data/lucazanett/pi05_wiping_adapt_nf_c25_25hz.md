# lucazanett/pi05_wiping_adapt_nf_c25_25hz

## Resumen

π₀.₅ (Pi05) es un modelo de visión-lenguaje-acción (Vision-Language-Action, VLA) desarrollado por Physical Intelligence y orientado a la generalización en entornos abiertos para robótica. Este repositorio concreto, `lucazanett/pi05_wiping_adapt_nf_c25_25hz`, es un *checkpoint* de política entrenado y publicado por el usuario lucazanett mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. No se trata del modelo base original, sino de una política especializada afinada sobre un conjunto de datos propio de tareas de limpieza o frotado ("wiping") con un montaje experimental adaptativo y sin señal de fuerza, muestreado a 25 Hz.

El modelo resuelve el problema de mapear observaciones visuales y consignas de lenguaje a acciones motoras continuas en un robot real. Su relevancia radica en que aplica la arquitectura VLA de Physical Intelligence dentro del ecosistema LeRobot, lo que permite entrenar, evaluar y desplegar políticas robóticas con herramientas estándar y pesos en formato safetensors. El repositorio tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y un tamaño de 9,4 GB.

La información pública disponible es escasa: el autor no ha documentado detalles de entrenamiento, benchmarks ni limitaciones. La model card es prácticamente la plantilla por defecto de LeRobot, por lo que muchos campos técnicos deben marcarse como no disponibles. La licencia es Apache 2.0, lo que facilita su reutilización, pero conviene tratar el modelo como un experimento de investigación sin validación publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ de Physical Intelligence, implementación LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp32/bf16) |
| Idiomas soportados | no disponible (las consignas de lenguaje dependen del dataset de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀.₅, un modelo de visión-lenguaje-acción que combina un codificador visual, un componente de lenguaje y un cabezal de acciones que genera comandos motores continuos. Physical Intelligence diseñó π₀.₅ como evolución de π₀ para mejorar la generalización a entornos y situaciones no vistas durante el entrenamiento. La implementación incluida aquí procede del repositorio OpenPI y se ha integrado en LeRobot, lo que permite entrenar y ejecutar la política con los comandos `lerobot-train` y `lerobot-record`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El nombre del repositorio sugiere un conjunto de datos llamado `new_setup_wiping_adaptive_01_no_force_25hz`, es decir, una tarea de frotado o limpieza con un montaje adaptativo, sin señal de fuerza y a 25 Hz. El sufijo `c25` podría indicar un horizonte de acción o configuración concreta, pero no está documentado. No se han publicado innovaciones técnicas adicionales en la información disponible.

## Capacidades

- Generación de acciones motoras continuas a partir de observaciones visuales y consignas de lenguaje, dentro del paradigma VLA.
- Control de robots manipuladores en tareas de contacto, como el frotado o limpieza ("wiping") sobre superficies.
- Generalización a entornos abiertos, según la descripción de π₀.₅ de Physical Intelligence (no validada en este checkpoint concreto).
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y registro de episodios.
- Soporte de inferencia sobre *checkpoints* locales o alojados en el Hub mediante `--policy.path`.
- Capacidades multilingües: no disponibles; dependen del dataset y de las consignas usadas en el entrenamiento.
- No se documenta soporte de *tool calling*, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en aprendizaje por imitación para robótica: el checkpoint sirve como punto de partida o referencia para reproducir experimentos de políticas VLA en tareas de contacto con LeRobot.
- Automatización de tareas de limpieza o frotado en entornos controlados: la política se ejecuta sobre un robot tipo `so100_follower` (según el ejemplo de la model card) para realizar movimientos de limpieza sobre superficies.
- Evaluación comparativa de políticas VLA: permite medir el rendimiento de π₀.₅ frente a otras políticas (ACT, Diffusion Policy) en un montaje experimental concreto.
- Desarrollo de *pipelines* de robótica con Hugging Face: el modelo se integra en flujos de entrenamiento y evaluación con `lerobot-train` y `lerobot-record`, facilitando la experimentación reproducible.
- Prototipado de manipulación sin sensor de fuerza: al estar entrenado "sin fuerza" (`no_force`), es adecuado para plataformas que no disponen de sensor de par o fuerza en el efector final.
- Docencia y formación en VLA: el repositorio, con licencia Apache 2.0 y pesos safetensors, puede usarse como ejemplo práctico en cursos de robótica e IA.
- Benchmark interno de generalización: útil para estudiar cómo se comporta una política entrenada en un montaje concreto ante variaciones de posición, iluminación u objetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14 mil millones de parámetros, en fp32 se requieren aproximadamente 16,6 GB solo para los pesos; en bf16/fp16, unos 8,3 GB; en cuantización de 8 bits, unos 4,2 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: A100 (40/80 GB) o H100 para entrenamiento y evaluación a gran escala; RTX 4090 (24 GB) o RTX A6000 (48 GB) para inferencia en fp16/bf16.
- Cabe en GPU de consumo: sí, en fp16/bf16 en tarjetas con 12-16 GB o más (RTX 3090, RTX 4080, RTX 4090), siempre que el resto del *pipeline* (codificador visual, buffers) no supere la memoria disponible.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`), con soporte de PyTorch y CUDA; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no están orientados a políticas robóticas.
- Latencia y throughput: no disponibles. El dataset está muestreado a 25 Hz, lo que sugiere que la política debe operar en tiempo real a esa frecuencia, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π₀.₅ (este checkpoint) | ≈4,14 mil millones | no disponible | VLA para robótica (wiping) | Apache 2.0 | Hugging Face (LeRobot) |
| π₀ (Physical Intelligence) | no disponible | no disponible | VLA para robótica | no disponible | OpenPI |
| ACT (Action Chunking Transformer) | no disponible | no disponible | Aprendizaje por imitación | MIT (LeRobot) | Hugging Face (LeRobot) |
| Diffusion Policy | no disponible | no disponible | Aprendizaje por imitación | MIT (LeRobot) | Hugging Face (LeRobot) |

La comparación con ACT y Diffusion Policy es cualitativa: ambos son políticas de imitación ampliamente usadas en LeRobot, pero no se dispone de datos de rendimiento comparables para este checkpoint concreto. No se han publicado métricas que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No se han documentado sesgos conocidos; al ser un modelo robótico, los sesgos provienen del dataset de entrenamiento (montaje, objetos, iluminación y posiciones concretas).
- Riesgo de alucinación en el sentido de generar acciones no válidas o inseguras fuera de la distribución de entrenamiento; no hay validación publicada.
- Limitaciones de contexto e idioma: no disponibles; las consignas de lenguaje probablemente estén restringidas al vocabulario del dataset.
- El repositorio tiene 0 descargas y 0 *likes*, y la model card es una plantilla sin detalles; trátese como un experimento sin revisión por pares.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base π₀.₅ de Physical Intelligence puede tener condiciones adicionales que conviene verificar en el repositorio OpenPI.
- No se documenta el montaje físico exacto, la cámara, el robot ni la política de seguridad; su uso en producción requeriría validación propia.
- El nombre `no_force` indica ausencia de señal de fuerza, lo que puede limitar tareas que requieran control de contacto preciso.

## Enlaces

- Hugging Face: https://huggingface.co/lucazanett/pi05_wiping_adapt_nf_c25_25hz
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- OpenPI (repositorio de Physical Intelligence): no disponible en la información proporcionada
- Dataset de entrenamiento: https://huggingface.co/datasets/lucazanett/new_setup_wiping_adaptive_01_no_force_25hz
