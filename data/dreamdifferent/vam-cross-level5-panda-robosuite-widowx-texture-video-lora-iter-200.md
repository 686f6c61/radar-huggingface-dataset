# dreamdifferent/vam-cross-level5-panda-robosuite-widowx-texture-video-lora-iter-200

## Resumen

Este repositorio contiene un adaptador LoRA de generación de vídeo para robótica, desarrollado por el usuario `dreamdifferent`. Se trata de un checkpoint de entrenamiento del sistema MimicVideo, concretamente de la variante Video2World, que permite generar secuencias de vídeo sintéticas de un robot manipulador ejecutando una tarea a partir de una instrucción textual y dos vistas de cámara. El modelo está diseñado para ser aplicado sobre un backbone base específico (`fused_video2world_dit`), que ya incorpora una fusión previa de LoRA de WidowX/Bridge, por lo que no es un modelo autónomo sino un adaptador.

El adaptador se entrenó durante 200 iteraciones sobre un conjunto de datos de 166 episodios (54.264 fotogramas) de la tarea "recoger la vela y colocarla en el cuenco", con dos cámaras (esquina y frontal) en formato `hstack` a 5 Hz. El checkpoint está pensado para ser cargado junto con el backbone indicado en la model card y los artefactos de runtime de MimicVideo, incluyendo el tokenizador de vídeo y el codificador de texto T5-11B. La relevancia actual radica en su aplicación en entornos de simulación robótica (Robosuite, WidowX) para generar datos de entrenamiento sintéticos o como componente en pipelines de aprendizaje por imitación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre backbone `fused_video2world_dit` (MimicVideo Video2World) |
| Parametros totales | No disponible (el checkpoint LoRA ocupa 0.7 GB, pero no se especifica el número de parámetros) |
| Parametros activos | No disponible (es un LoRA, solo se activan los pesos adaptados) |
| Longitud de contexto | No disponible (depende del backbone y del tokenizador de vídeo) |
| Tipos de cuantizacion | No disponible (el repositorio no menciona cuantización) |
| Idiomas soportados | No disponibles (la instrucción de entrenamiento está en inglés, pero no se especifica el soporte multilingüe) |
| Licencia | No disponible |
| Formato de pesos | Checkpoint de entrenamiento (probablemente `.pt` o similar, no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) diseñado para el sistema MimicVideo, concretamente para la variante Video2World. La arquitectura subyacente es un `fused_video2world_dit`, un modelo de difusión de vídeo que combina un tokenizador de vídeo, un codificador de texto T5-11B y un backbone de difusión. El adaptador se entrena para ajustar el comportamiento del modelo base en la generación de vídeo condicionado a instrucciones y a dos cámaras simultáneas (esquina y frontal), con las imágenes apiladas horizontalmente (`hstack`).

El entrenamiento se realizó durante 200 iteraciones sobre un dataset de 166 episodios (54.264 fotogramas) de la tarea de manipulación "recoger la vela y colocarla en el cuenco", registrado a 5 Hz. El checkpoint es el resultado de la iteración 200 de un run más largo que terminó por límite de tiempo (`walltime`). Se seleccionó un conjunto de cuatro componentes verificado antes de publicar los pesos. El proceso de entrenamiento sigue el flujo estándar de MimicVideo, y el adaptador debe cargarse sobre el backbone específico indicado en la model card (revisión `f0cea76b62c5dd66b06b9f965932ddea32a7b546`), que ya incluye una fusión previa de LoRA de WidowX/Bridge. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado por imitación.

## Capacidades

- Generación de vídeo condicionado a instrucciones textuales: el modelo genera secuencias de vídeo de un robot manipulador ejecutando una tarea descrita en texto (en este caso, "pick up the candle and place it into the bowl").
- Entrada multimodal con dos cámaras: acepta imágenes de dos vistas (cámara de esquina y cámara frontal) apiladas horizontalmente, lo que permite generar vídeo con perspectiva dual.
- Adaptación específica para robótica: está entrenado para entornos de simulación Robosuite y hardware WidowX, por lo que puede generar vídeo de maniobras de agarre y colocación de objetos.
- Transferencia a través de LoRA: al ser un adaptador, puede combinarse con otros LoRA o backbones para extender capacidades sin reentrenar el modelo completo.
- Integración con MimicVideo: compatible con el ecosistema de MimicVideo, incluyendo el tokenizador de vídeo y el codificador de texto T5-11B.

## Casos de uso

- Generación de datos sintéticos para entrenamiento de políticas robóticas: el modelo puede producir vídeos de ejecución de tareas en simulación, que luego se utilizan para entrenar modelos de control por imitación, reduciendo la necesidad de recopilar datos reales.
- Aumento de datasets de demostración: combinando el LoRA con distintos backbones, se pueden generar variaciones de la misma tarea (cambios de textura, iluminación, posiciones) para mejorar la robustez de los modelos aprendidos.
- Validación de políticas en simulación: antes de desplegar un controlador en el robot real, se puede usar este generador de vídeo para visualizar cómo se comportaría el robot ante una instrucción dada, permitiendo depurar errores de razonamiento.
- Desarrollo de agentes de planificación de tareas: el vídeo generado puede servir como entrada para modelos de planificación de bajo nivel, que necesitan predecir secuencias de acciones a partir de observaciones visuales.
- Benchmarking de modelos de vídeo-condicionado: este adaptador puede utilizarse como referencia para comparar la calidad de generación de vídeo de otros sistemas en tareas de manipulación robótica.
- Investigación en aprendizaje por imitación multimodal: el uso de dos cámaras y texto permite estudiar cómo los modelos integran información visual y lingüística para generar comportamientos motores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de calidad de vídeo (FVD, IS, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- El checkpoint LoRA pesa 0.7 GB, pero el backbone base (`fused_video2world_dit`) ocupa aproximadamente 3.9 GB (3913057284 bytes). Para la inferencia completa se necesita cargar el backbone y el adaptador.
- Se requiere una GPU con al menos 8-12 GB de VRAM para el backbone y el tokenizador de vídeo, dependiendo de la resolución y longitud de los fotogramas. Para generación de vídeo con MimicVideo, se recomienda una GPU de gama alta (RTX 3090, RTX 4090, A100, H100).
- El modelo no cabe en GPUs de consumo antiguas (GTX 1080, RTX 2060) sin cuantización, y no se proporcionan versiones cuantizadas.
- El despliegue requiere el código de MimicVideo (commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`) y los artefactos de runtime (tokenizador de vídeo, codificador T5-11B). No se menciona compatibilidad con vLLM, Ollama ni llama.cpp, ya que es un modelo de difusión de vídeo, no un LLM.
- La latencia depende de la resolución de salida y del número de pasos de difusión; no se proporcionan datos concretos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo dominio (generación de vídeo para robótica con LoRA sobre MimicVideo). No se puede establecer una comparativa sin datos adicionales.

## Limitaciones y advertencias

- El modelo es un adaptador, no un modelo autónomo: requiere cargar el backbone exacto indicado en la model card (`fused_video2world_dit` con revisión `f0cea76b62c5dd66b06b9f965932ddea32a7b546`). Cargar un backbone incorrecto (por ejemplo, el Bridge original) dará resultados inválidos.
- El dataset de entrenamiento no está incluido en el repositorio; los usuarios deben cumplir con la política de acceso del dataset y con los términos de MimicVideo, NVIDIA Cosmos y el checkpoint base.
- La licencia no está especificada, lo que impide determinar si es apto para uso comercial. Se recomienda contactar con el autor antes de cualquier uso en producción.
- El modelo solo ha sido entrenado para una tarea concreta (recoger vela y colocarla en cuenco) y con dos cámaras fijas. No generaliza a otras tareas o configuraciones de cámara sin un nuevo entrenamiento.
- No se proporcionan garantías sobre la calidad del vídeo generado; puede presentar alucinaciones visuales o inconsistencias temporales, especialmente en escenarios fuera de la distribución de entrenamiento.
- El repositorio no incluye documentación sobre sesgos, pero al ser un modelo entrenado en simulación, puede no transferir bien a entornos reales con texturas o iluminación diferentes.

## Enlaces

- Repositorio del modelo: https://huggingface.co/dreamdifferent/vam-cross-level5-panda-robosuite-widowx-texture-video-lora-iter-200
- Backbone base requerido: https://huggingface.co/dreamdifferent/widowx250-video-fused
- Repositorio de MimicVideo (referencia en la model card): commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`
- Checkpoint bundle de MimicVideo: `jonpai/mimic-video@f28339034831e3c2374be075e622e1ff38ebe0f8` (no se proporciona URL directa)
- Dataset de entrenamiento (referencia): `dreamdifferent/vam-cross-level5-panda-robosuite-widowx-texture@0d9dcf500cbde6d2f522f462cce8aa041c8594ab` (no se proporciona URL directa)
