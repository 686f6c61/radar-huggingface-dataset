# dreamdifferent/vam-cross-level2-panda-robosuite-widowx-texture-video-lora-iter-400

## Resumen

Este repositorio contiene un checkpoint de LoRA (adaptador de bajo rango) para el modelo de generación de video `Video2World` de MimicVideo, desarrollado por el usuario `dreamdifferent`. Se trata de la iteración 400 de un entrenamiento específico para el dominio robótico, con el objetivo de generar vídeos sintéticos de ejecuciones de tareas en entornos simulados (Panda, Robosuite, WidowX) a partir de instrucciones textuales. El modelo no es un modelo completo, sino un adaptador que debe cargarse sobre un backbone base concreto, el cual ya incluye una fusión previa de LoRA de WidowX/Bridge.

La relevancia de este checkpoint radica en su aplicación para la generación de datos sintéticos de entrenamiento en robótica, permitiendo aumentar conjuntos de datos reales con vídeos generados por el modelo. Al ser un LoRA, su tamaño es relativamente reducido (3.7 GB en el repositorio), pero requiere el backbone original de aproximadamente 3.9 GB. La licencia no está especificada, y los idiomas soportados no se indican, aunque las instrucciones de entrenamiento están en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo de difusión de video (Video2World) basado en MimicVideo |
| Parametros totales | no disponible |
| Parametros activos | no disponible (es un adaptador LoRA, no un modelo completo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en inglés según el manifiesto) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente safetensors o binario, no especificado) |

## Arquitectura y entrenamiento

El checkpoint es un LoRA de rango 256 (según el nombre del run: `lora_r256`) diseñado para ser aplicado sobre un backbone `fused_video2world_dit`. Este backbone es un modelo de difusión de video que ya ha sido fusionado con un LoRA previo de WidowX/Bridge, por lo que no debe cargarse sobre el backbone original de Bridge. El entrenamiento se realizó con el framework MimicVideo, utilizando un tokenizador de video y un codificador de texto T5-11B como componentes del pipeline.

El conjunto de datos de entrenamiento consta de 280 episodios con 54 426 frames, capturados con dos cámaras (`corner_cam` y `front_cam`) dispuestas en formato `hstack` a 5 Hz. Las tareas son 24 instrucciones condicionadas por episodio, listadas en el manifiesto `vam_cross_video_lora_manifest.json`. No se especifican detalles sobre el proceso de entrenamiento (número de tokens, composición exacta del dataset, uso de RLHF/DPO, etc.).

## Capacidades

- Generación de vídeos sintéticos de ejecuciones robóticas en entornos simulados (Panda, Robosuite, WidowX) a partir de instrucciones textuales.
- Condicionamiento por instrucciones de tarea (24 tareas diferentes en el dataset de entrenamiento).
- Soporte de dos cámaras simultáneas (esquina y frontal) con salida en formato apilado horizontalmente.
- Generación de vídeo a 5 Hz, adecuado para secuencias de control robótico.
- No se documentan capacidades adicionales como tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Aumento de datos para entrenamiento de políticas robóticas: el modelo puede generar vídeos sintéticos de ejecuciones de tareas, complementando datasets reales y reduciendo la necesidad de recopilación física de datos.
- Simulación de escenarios de manipulación: permite crear variaciones de texturas y condiciones visuales en entornos Robosuite y WidowX, útiles para probar la robustez de modelos de visión.
- Generación de datos para aprendizaje por imitación: los vídeos generados pueden usarse como demostraciones para entrenar políticas de control clonadas por comportamiento.
- Validación de modelos de predicción de video: al ser un adaptador específico para un dominio, puede emplearse para evaluar la capacidad de generalización de modelos de difusión de video en tareas robóticas.
- Investigación en transferencia entre dominios: el LoRA está diseñado para un nivel de cruce específico (level2) y puede compararse con otros niveles (level4, level5) para estudiar la transferencia de conocimiento entre configuraciones de cámaras y texturas.
- Desarrollo de entornos de entrenamiento virtuales: integración en pipelines de generación de datos sintéticos para simulación de robots, reduciendo costes de hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas de calidad de generación de video (FVD, IS, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- No se especifican requisitos de hardware en la información disponible.
- El backbone base (`fused_video2world_dit`) tiene un tamaño de aproximadamente 3.9 GB (3913057284 bytes), por lo que se requiere una GPU con suficiente VRAM para cargar el modelo completo más el LoRA. Una estimación conservadora sería al menos 8 GB de VRAM para inferencia en precisión FP16, aunque no se confirma.
- No se indican GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, etc.). Dado que es un modelo de difusión de video, se espera que requiera GPUs de gama alta (A100, H100, RTX 4090) para tiempos de generación razonables, pero esto no está documentado.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (LoRA para generación de video robótico). Existen otros checkpoints del mismo autor para diferentes niveles (level4, level5), pero no se proporcionan detalles comparativos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El checkpoint es un adaptador LoRA, no un modelo independiente. Debe cargarse sobre el backbone exacto especificado (`dreamdifferent/widowx250-video-fused`, revisión `f0cea76b62c5dd66b06b9f965932ddea32a7b546`). Cargarlo sobre otro backbone producirá resultados incorrectos.
- El dataset de entrenamiento no está incluido en el repositorio. Los usuarios deben cumplir con la política de acceso del dataset y con los términos de MimicVideo, NVIDIA Cosmos y del checkpoint base.
- No se especifica la licencia, por lo que el uso comercial no está garantizado. Se recomienda contactar con el autor para aclarar los términos.
- El modelo está entrenado para un dominio muy específico (tareas de Panda/Robosuite/WidowX con dos cámaras). Su generalización a otros entornos o configuraciones de cámara no está garantizada.
- No se documentan sesgos conocidos ni riesgos de alucinación, pero como modelo generativo de video, puede producir secuencias visualmente plausibles pero físicamente incorrectas.
- La generación de video es computacionalmente intensiva; no se proporcionan guías de optimización.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dreamdifferent/vam-cross-level2-panda-robosuite-widowx-texture-video-lora-iter-400
- Checkpoints relacionados del mismo autor:
  - https://huggingface.co/dreamdifferent/vam-cross-level5-panda-robosuite-widowx-texture-video-lora-iter-400
  - https://huggingface.co/dreamdifferent/vam-cross-level4-panda-robosuite-widowx-texture-teleopaligned-videolora200-action-dec-877773a44c
- Backbone requerido: https://huggingface.co/dreamdifferent/widowx250-video-fused (revisión `f0cea76b62c5dd66b06b9f965932ddea32a7b546`)
