# dreamdifferent/vam-cross-level2-panda-robotiq-widowx-texture-video-lora-iter200

## Resumen

El modelo `dreamdifferent/vam-cross-level2-panda-robotiq-widowx-texture-video-lora-iter200` es un adaptador LoRA (Low-Rank Adaptation) para generación de video condicionada a instrucciones robóticas, basado en el framework MimicVideo. Ha sido desarrollado por el usuario `dreamdifferent` y está pensado para el pipeline de robótica, específicamente para tareas de manipulación con brazos Panda Robotiq y WidowX. Este adaptador se aplica sobre un backbone Video2World preentrenado y permite generar secuencias de video sintéticas a partir de instrucciones textuales de episodios, con una configuración de dos cámaras (esquina y frontal) apiladas horizontalmente.

El checkpoint corresponde a la iteración 200 de un entrenamiento supervisado con 301 episodios y más de 54 000 frames, y se distribuye como un adaptador que no es funcional de forma independiente: requiere cargar primero el backbone concreto especificado en la documentación. Su relevancia radica en que ofrece una vía para ampliar las capacidades de generación de video en entornos robóticos sin necesidad de reentrenar el modelo base completo, facilitando la simulación de trayectorias y el aprendizaje por imitación.

La licencia y los idiomas soportados no están disponibles en la información proporcionada, y el tamaño del repositorio es de 0,7 GB. Es un modelo especializado de nicho, orientado a investigadores y desarrolladores que trabajen con el ecosistema MimicVideo y necesiten generar datos sintéticos de manipulación robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre backbone `fused_video2world_dit` (MimicVideo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (al ser LoRA, solo se actualizan los pesos del adaptador) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de entrenamiento están en inglés, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 256 (según el nombre del run `lora_r256`) que se aplica sobre un backbone Video2World de tipo `fused_video2world_dit`. Este backbone fusiona previamente un LoRA de WidowX/Bridge y se debe cargar desde la revisión `f0cea76b62c5dd66b06b9f965932ddea32a7b546` del repositorio `dreamdifferent/widowx250-video-fused`. El adaptador se entrena sobre el dataset `dreamdifferent/vam-cross-level2-panda-robotiq-widowx-texture@92b2a70ffc2e0b09230c2fc0e7ef7164ba416f8c`, compuesto por 301 episodios y 54 453 frames, con dos cámaras (`corner_cam` y `front_cam`) y un layout de apilado horizontal (`hstack`) a 5 Hz. Se utilizan 24 instrucciones condicionadas por episodio, lo que sugiere un entrenamiento supervisado con pares texto-video.

El proceso de entrenamiento se enmarca en el ecosistema MimicVideo, que emplea un tokenizador de video y un codificador de texto T5-11B. La configuración exacta se encuentra en los archivos `config.yaml`, `vam_cross_video2world_config.json` y `vam_cross_video_lora_manifest.json` incluidos en el repositorio. No se mencionan técnicas como RLHF o DPO, por lo que se asume un entrenamiento puramente supervisado.

## Capacidades

- Generación de video condicionada a instrucciones textuales de episodios robóticos, específicamente para tareas de manipulación con Panda Robotiq y WidowX.
- Soporte de dos vistas de cámara (esquina y frontal) combinadas mediante apilado horizontal, lo que permite generar videos con información espacial de múltiples ángulos.
- Integración con el framework MimicVideo, lo que permite su uso en pipelines de generación de video de mundo (world models) para robótica.
- Capacidad de adaptación de bajo rango (rango 256) sobre un backbone preentrenado, lo que facilita el fine-tuning eficiente en términos de parámetros.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, ya que es un modelo de generación de video, no de lenguaje.

## Casos de uso

- Simulación de trayectorias robóticas: el modelo puede generar secuencias de video sintéticas de un brazo robótico ejecutando una tarea a partir de una instrucción textual, lo que permite probar políticas de control sin necesidad de hardware físico.
- Aumento de datos para aprendizaje por imitación: los videos generados pueden complementar datasets reales de demostraciones, mejorando la robustez de los modelos de política entrenados con datos limitados.
- Validación de planes de manipulación: dado un plan de alto nivel descrito en texto, el modelo puede visualizar el resultado previsto, ayudando a detectar errores antes de la ejecución real.
- Investigación en world models: al estar basado en MimicVideo, sirve como componente para construir modelos del mundo que predicen estados futuros de la escena robótica.
- Generación de contenido para entrenamiento de modelos de percepción: los videos generados con dos cámaras pueden usarse para entrenar sistemas de visión que operen con múltiples puntos de vista.
- Benchmarking de generación de video robótico: al ser un adaptador de acceso público, puede utilizarse como referencia para comparar técnicas de fine-tuning en el dominio de la robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El tamaño del adaptador es de 0,7 GB, pero el backbone requerido (`fused_video2world_dit`) ocupa aproximadamente 3,9 GB (3913057284 bytes). En conjunto, el modelo completo supera los 4,6 GB de almacenamiento.
- Para inferencia, se necesita una GPU con VRAM suficiente para cargar el backbone más el adaptador. Sin datos específicos de consumo, se estima que al menos 8 GB de VRAM son necesarios, aunque probablemente se requiera más si se generan videos de alta resolución.
- No se indica si es compatible con GPUs de consumo como RTX 3060 o superiores; se recomienda una GPU con al menos 12 GB de VRAM para pruebas preliminares.
- Opciones de despliegue: al ser un adaptador de PyTorch, se puede integrar en el framework MimicVideo. No se mencionan soportes para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores LoRA para generación de video robótico con doble cámara). El modelo es altamente específico y depende de un backbone concreto, por lo que no se pueden establecer comparaciones directas sin datos adicionales.

## Limitaciones y advertencias

- Es un adaptador, no un modelo independiente: requiere cargar el backbone exacto `fused_video2world_dit` desde el repositorio `dreamdifferent/widowx250-video-fused` en la revisión especificada. Cargar otro backbone (por ejemplo, el Bridge original) daría resultados incorrectos.
- La licencia no está disponible, por lo que no se puede garantizar el uso comercial sin una revisión legal previa.
- El dataset de entrenamiento no está incluido en el repositorio y está sujeto a su propia política de acceso, así como a los términos de MimicVideo, NVIDIA Cosmos y del checkpoint base.
- No se especifican los idiomas soportados para las instrucciones; aunque el entrenamiento probablemente usó inglés, esto no está confirmado.
- Al ser un modelo de generación de video, puede presentar alucinaciones visuales o inconsistencias temporales especialmente en escenas complejas o con oclusiones.
- No se han publicado evaluaciones cuantitativas, por lo que su rendimiento real en tareas de robótica no está validado externamente.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/dreamdifferent/vam-cross-level2-panda-robotiq-widowx-texture-video-lora-iter200)
- [Backbone requerido: dreamdifferent/widowx250-video-fused](https://huggingface.co/dreamdifferent/widowx250-video-fused)
- [Dataset de entrenamiento: dreamdifferent/vam-cross-level2-panda-robotiq-widowx-texture](https://huggingface.co/datasets/dreamdifferent/vam-cross-level2-panda-robotiq-widowx-texture)
- [Checkpoint bundle de MimicVideo: jonpai/mimic-video](https://huggingface.co/jonpai/mimic-video) (revisión `f28339034831e3c2374be075e622e1ff38ebe0f8`)
