# salpu/lingbot-vla-2.0-fullft-step1000

## Resumen

LingBot-VLA 2.0 es un modelo de robótica de tipo Vision-Language-Action (VLA) desarrollado por el usuario `salpu` en el contexto de la subred 80 de Bittensor (OpenRoboto), concretamente para la competición de simulación 2. Este checkpoint corresponde a un fine-tune completo (sin capas congeladas) del modelo base `openroboto-ai/lingbot-vla-v2-6b-libero`, entrenado sobre el dataset LIBERO de LeRobot. El modelo está diseñado para convertir instrucciones en lenguaje natural y observaciones visuales en acciones de control para tareas de manipulación robótica.

La arquitectura se basa en el procesador de Qwen3-VL-4B-Instruct con una mezcla de expertos (MoE) de 32 expertos y top-4 activos, lo que le permite manejar entradas multimodales (texto e imagen) y generar acciones de forma eficiente. El modelo tiene aproximadamente 6,38 mil millones de parámetros y se distribuye en formato safetensors bajo licencia Apache 2.0. Su relevancia radica en ser un ejemplo de fine-tune completo sobre un VLA existente, con un proceso de entrenamiento documentado y métricas de deriva de pesos, aunque aún no ha sido evaluado formalmente en el benchmark LIBERO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (32 expertos, top-4) sobre base Qwen3-VL-4B-Instruct |
| Parametros totales | 6.375.907.511 |
| Parametros activos | no disponible (no se especifica el numero de parametros activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuye en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un VLA que combina un codificador de vision-lenguaje (basado en Qwen3-VL-4B-Instruct) con un modulo de mezcla de expertos (MoE) de 32 expertos y top-4 activos. Esta arquitectura permite procesar simultaneamente texto e imagenes y generar acciones de control continuo para robots. El entrenamiento se realizo como un fine-tune completo (full fine-tune) partiendo del checkpoint de OpenRoboto en su paso 6000, sin congelar ninguna capa. Se utilizo el dataset LIBERO de LeRobot, compuesto por 1693 episodios y 273465 frames, con el procesador de Qwen3-VL-4B-Instruct.

El entrenamiento se llevo a cabo en 2 GPUs NVIDIA H100 PCIe 80GB con FSDP2 full-shard, en precision bf16 con pesos maestros en fp32. El optimizador fue muon con una tasa de aprendizaje de 5e-5 en decaimiento coseno hasta 5e-6 y un warmup del 2%. Se configuraron 1500 pasos maximos con un batch global de 64 (micro 8 x grad-accum 4 x 2 GPUs). Se activaron las perdidas de alineacion de profundidad y video (MoGe, MDM y DINO-video como profesores). El tiempo de entrenamiento fue de 5 horas y 13 minutos, con 12.55 segundos por paso. La perdida de entrenamiento descendio de 0.1544 (paso 1) a aproximadamente 0.085. La deriva de pesos respecto al checkpoint base se satura alrededor del 2.9% en el paso 1000, siendo los pasos 1000 y 1500 practicamente duplicados.

## Capacidades

- Control robotico a partir de instrucciones en lenguaje natural y observaciones visuales (tareas de manipulacion en entornos simulados).
- Procesamiento multimodal: combina texto e imagenes para generar acciones de control.
- Generacion de acciones continuas para robots, tipico de los modelos VLA.
- Capacidad de fine-tune completo sobre un checkpoint existente, lo que permite adaptar el modelo a nuevas tareas o datasets.
- No se ha confirmado soporte para tool calling, agentes multi-paso, razonamiento complejo o capacidades multilingues especificas; la informacion disponible no detalla estas funciones.

## Casos de uso

- Entrenamiento de politicas de manipulacion robotica en simulacion: el modelo puede utilizarse en entornos como LIBERO para aprender tareas de mesa (coger, colocar, apilar objetos) a partir de instrucciones en lenguaje.
- Investigacion en aprendizaje por refuerzo y demostracion: al ser un VLA, sirve como base para estudiar metodos de aprendizaje de politicas multimodales, comparando con otros enfoques.
- Desarrollo de sistemas de control robotico en entornos controlados: puede integrarse en pipelines de robotica que requieran traduccion de lenguaje natural a secuencias de acciones.
- Evaluacion de tecnicas de fine-tune en modelos VLA: su proceso de entrenamiento documentado (con deriva de pesos y metricas) lo convierte en un caso de estudio para analizar la estabilidad del fine-tune completo.
- Generacion de datos sinteticos de demostracion: el modelo podria usarse para generar trayectorias de accion en simulacion que luego se utilicen para entrenar otros modelos o politicas.
- Benchmarking de arquitecturas MoE en robotica: su configuracion de 32 expertos top-4 permite comparar el rendimiento de MoE frente a modelos densos en tareas de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el checkpoint no ha sido evaluado en LIBERO y que la tasa de exito es desconocida. La perdida de entrenamiento en descenso no es evidencia de una mejor politica.

## Requisitos de hardware

- El checkpoint en safetensors ocupa aproximadamente 24.3 GB (segun la model card, 24337.8 MB), lo que sugiere que en precision fp16 requiere al menos 24 GB de VRAM para cargar los pesos completos.
- Para inferencia en fp16, se estima una GPU con 24 GB de VRAM o mas (por ejemplo, RTX 3090, RTX 4090, A100 40GB, H100). No se proporcionan requisitos oficiales.
- El entrenamiento se realizo con 2x NVIDIA H100 PCIe 80GB, por lo que el fine-tune completo requiere hardware de alta gama.
- No se mencionan opciones de despliegue especificas (vLLM, llama.cpp, Ollama, TGI). Dado que es un modelo de robotica, probablemente se use con frameworks de robotica como LeRobot o ROS, pero no esta confirmado.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con otros modelos VLA como OpenVLA, RT-2 o el propio LingBot-VLA v2 base. La model card no incluye especificaciones de modelos comparables ni resultados de rendimiento. Se recomienda consultar la documentacion de OpenRoboto y los repositorios relacionados para obtener datos de comparacion.

## Limitaciones y advertencias

- El modelo no ha sido evaluado en LIBERO ni en ningun otro benchmark; su tasa de exito en tareas reales es desconocida.
- La perdida de entrenamiento en descenso no garantiza una mejor politica; la model card advierte explicitamente sobre esto.
- La deriva de pesos respecto al checkpoint base es de aproximadamente 2.9% en el paso 1000, y los pasos 1000 y 1500 son casi identicos, lo que sugiere que el entrenamiento adicional no aporta cambios significativos.
- No se especifican sesgos conocidos, pero al ser un modelo entrenado en un dataset de simulacion (LIBERO), puede tener limitaciones para transferir a entornos reales.
- Riesgo de alucinacion en la generacion de acciones si las observaciones visuales son ambiguas o fuera de distribucion.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la procedencia del dataset y el codigo base (OpenRoboto) para posibles restricciones adicionales.
- No se proporcionan detalles sobre la longitud de contexto ni los idiomas soportados, lo que limita su uso en aplicaciones multilingues o con contextos largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/salpu/lingbot-vla-2.0-fullft-step1000
- Metricas de entrenamiento (wandb): https://wandb.ai/atomyuri46-weights-biases/sn80-lingbot-fullft
- Codigo de entrenamiento: https://github.com/Robbyant/lingbot-vla-v2
- Dataset LIBERO (LeRobot): https://huggingface.co/datasets/lerobot/libero
- Procesador base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
