# Faless/piper_apples_v7m_deposito_regolare_c03_smolvla_base_bs96

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante aprendizaje por imitación. Esta ficha concreta, `Faless/piper_apples_v7m_deposito_regolare_c03_smolvla_base_bs96`, es un fine-tuning de `Faless/smolvla_base_adapted` sobre un dataset propio de manipulación con el robot Piper, especializado en una única tarea: recoger manzanas rojas y depositarlas en una cesta verde.

El modelo consume observaciones multimodales (estado articular de 8 dimensiones y dos cámaras RGB de 256x256 píxeles, denominadas `ego` y `front`) y produce un vector de acción de 7 dimensiones a 30 FPS. Con 450 millones de parámetros, está pensado para ejecutarse en hardware de consumo, lo que lo hace accesible para laboratorios y prototipos de robótica sin necesidad de clústeres de GPU.

Es relevante ahora porque los VLA ligeros están desplazando a los pipelines clásicos de planificación en tareas de manipulación de un solo brazo, y este checkpoint ilustra el flujo completo de LeRobot: dataset público, entrenamiento reproducible y despliegue con `lerobot-rollout`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer multimodal con experto de acciones) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje conversacional) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (el condicionamiento lingüístico se limita a la instrucción de tarea en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA combina un codificador visual, un codificador de lenguaje para la instrucción de tarea y un cabezal de acciones que genera trayectorias de 7 dimensiones. La entrada incluye `observation.state` con forma `(8,)` y dos flujos visuales de `(3, 256, 256)`, correspondientes a las cámaras `ego` y `front` del robot Piper. La salida es un tensor `action` de forma `(7,)`, típico de un brazo manipulador con pinza.

El fine-tuning se realizó sobre el dataset `Faless/piper_apples_v7m_deposito_regolare_c03`, con 619 episodios y 1.050.896 frames a 30 FPS, para la tarea "Pick the red apples one by one and place them into the green basket". La configuración reportada incluye 55.000 pasos de entrenamiento, batch size 96, optimizador AdamW, learning rate 1e-4, semilla 1000 y LeRobot 0.6.2. No se documentan detalles sobre composición del dataset más allá del número de episodios, ni sobre fases de RLHF o DPO, que en el contexto de políticas de imitación no aplican del mismo modo que en LLM.

## Capacidades

- Control robótico de manipulación de un solo brazo mediante imitación, con salida de acciones continuas de 7 dimensiones.
- Percepción visual multimodal a partir de dos cámaras RGB sincronizadas a 30 FPS.
- Condicionamiento por instrucción de tarea en lenguaje natural (una única tarea entrenada: recoger manzanas rojas y depositarlas en una cesta verde).
- Ejecución en bucle cerrado a 30 FPS, adecuada para control reactivo de bajo nivel.
- Integración nativa con el stack LeRobot (`lerobot-rollout`, `lerobot-train`) y con el robot `piper_full`.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades conversacionales; es una política de acción, no un asistente.

## Casos de uso

- Recolección automatizada en líneas de clasificación: el modelo ejecuta la secuencia pick-and-place de manzanas rojas sobre una cesta verde, replicando la tarea exacta del dataset de entrenamiento.
- Prototipado de manipulación con robot Piper: sirve como punto de partida para validar el pipeline de LeRobot (calibración, cámaras, rollout) antes de entrenar tareas propias.
- Fine-tuning sobre nuevos datasets: al estar construido sobre `Faless/smolvla_base_adapted`, se puede reentrenar con `lerobot-train` para tareas de pick-and-place similares cambiando el dataset y la instrucción.
- Investigación en aprendizaje por imitación: útil como baseline reproducible con hiperparámetros documentados (55k pasos, batch 96, lr 1e-4) para comparar variantes de políticas VLA.
- Demostraciones en laboratorio y docencia: su tamaño de 450 M de parámetros permite ejecutarlo en GPU de consumo y mostrar el ciclo completo de un VLA en entornos académicos.
- Evaluación de robustez visual: al depender de dos cámaras fijas, permite estudiar el efecto de cambios de iluminación, posición de objetos o distracciones en políticas entrenadas con datos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en safetensors, la carga en FP32 ronda 1,8 GB y en FP16/BF16 aproximadamente 0,9 GB, a lo que hay que sumar el codificador visual y los buffers de inferencia.
- GPU recomendadas: no se especifican en la model card; por tamaño, cualquier GPU con al menos 4-6 GB de VRAM debería ser suficiente para inferencia.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, aunque el fabricante no publica requisitos verificados.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial) con el robot `piper_full`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas de acción.
- Latencia y throughput: no disponibles; el control opera a 30 FPS según la tasa del dataset, pero no se publica latencia medida del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / modalidad | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (piper_apples_v7m_deposito_regolare_c03_smolvla_base_bs96) | 450 M | Política VLA, 2 cámaras 256x256, acción 7D | Pick-and-place de manzanas en cesta | no disponible | Hugging Face, 29 descargas |
| Faless/smolvla_base_adapted | no disponible | Política VLA base | Base de fine-tuning | no disponible | Hugging Face |
| SmolVLA (modelo original de Hugging Face) | no disponible en la información | Política VLA compacta | Manipulación general con hardware de consumo | no disponible | Hugging Face / LeRobot |
| Políticas tipo ACT / Diffusion Policy en LeRobot | no disponible | Políticas de imitación | Manipulación de un brazo | según repositorio | LeRobot |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea y un único robot (`piper_full`); no generaliza a otras instrucciones ni a otros brazos sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que el rendimiento en producción es desconocido.
- Dependencia de configuración de cámaras: los nombres e índices de cámara deben coincidir con las claves de observación del entrenamiento (`ego`, `front`), lo que limita la portabilidad.
- Sesgos de dataset: 619 episodios de una tarea concreta implican un sesgo fuerte hacia posiciones, iluminación y objetos vistos en entrenamiento; probablemente falle ante distractores o cambios de escena.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de desplegarlo en producto.
- Riesgo de alucinación en el sentido de acciones no válidas o inseguras: como toda política de imitación, puede generar trayectorias fuera de distribución sin señal de confianza.
- Idiomas: la instrucción de tarea está en inglés y el modelo no está diseñado para interacción multilingüe.
- Fecha de creación futura en los metadatos (2026-10-09): conviene verificar la vigencia y procedencia del checkpoint antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Faless/piper_apples_v7m_deposito_regolare_c03_smolvla_base_bs96
- Modelo base: https://huggingface.co/Faless/smolvla_base_adapted
- Dataset de entrenamiento: https://huggingface.co/datasets/Faless/piper_apples_v7m_deposito_regolare_c03
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Faless/piper_apples_v7m_deposito_regolare_c03
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
