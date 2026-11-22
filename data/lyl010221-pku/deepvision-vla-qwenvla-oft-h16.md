# lyl010221-pku/deepvision-vla-qwenvla-oft-h16

## Resumen

DeepVision-VLA QwenVLA-OFT H16 es un checkpoint de investigación para robótica de tipo vision-language-action (VLA) construido sobre el modelo base Qwen/Qwen3-VL-4B-Instruct. Lo publica el usuario lyl010221-pku y corresponde al checkpoint identificado como `checkpoint-5-10000` dentro de una reproducción del experimento BridgeData V2 del proyecto DeepVision-VLA. El modelo recibe un único fotograma RGB y una instrucción de tarea en lenguaje natural, y predice un chunk de 16 acciones de siete canales cada una.

El interés técnico está en que combina un backbone VLM multimodal de 4.000 millones de parámetros con una cabeza de acción compartida ("shared action head") entrenada específicamente para control robótico, y se distribuye como export de runtime con pesos separados (backbone y cabeza), procesadores de imagen y texto, estadísticas de normalización y configuración de entrenamiento. No es un modelo de propósito general ni un asistente conversacional: es un artefacto de reproducción experimental orientado a diagnóstico e investigación.

La relevancia es limitada y muy específica: se trata de un checkpoint de preentrenamiento "Qwen-only" cuyo objetivo es permitir reproducir y diagnosticar el comportamiento de una política VLA sobre BridgeData V2. El propio autor advierte de que la correspondencia con el checkpoint Qwen del paper original y con los ficheros de etiquetas de acción sigue sin resolverse, por lo que debe tratarse como material de investigación, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action: backbone VLM Qwen3-VL-4B-Instruct más cabeza de acción compartida (shared action head) |
| Parametros totales | 4B en el backbone (Qwen3-VL-4B-Instruct); parámetros de la cabeza de acción no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente BF16/FP16) |
| Idiomas soportados | no disponibles (las instrucciones de tarea se expresan en lenguaje natural, idioma no especificado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (backbone y cabeza de acción en directorios separados, con manifiestos y SHA256SUMS) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline VLA de dos componentes: por un lado, el backbone Qwen3-VL-4B-Instruct, un transformer multimodal que procesa la imagen RGB y la instrucción textual; por otro, una cabeza de acción compartida que transforma la representación del backbone en un chunk de 16 acciones de 7 canales. El repositorio separa explícitamente `portable/qwen_backbone/` y `portable/shared_action_head/`, cada uno con su manifiesto de componentes, lo que facilita el uso de los pesos con el cargador de inferencia verificado del proyecto DeepVision-VLA.

El entrenamiento se enmarca en una reproducción del experimento BridgeData V2, un dataset de manipulación robótica ampliamente usado en investigación VLA. El checkpoint es un preentrenamiento "Qwen-only" (es decir, solo con el backbone Qwen, sin el resto de componentes del sistema completo) identificado como `checkpoint-5-10000`. El repositorio incluye `action_statistics.json` con estadísticas de normalización y de máscara del gripper para el chunk de 16 × 7 acciones, y `training_config.json` con los campos de configuración que necesita el cargador de inferencia. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Predicción de acciones robóticas: dado un fotograma RGB y una instrucción de tarea en lenguaje natural, genera un chunk de 16 acciones de 7 canales.
- Comprensión de instrucciones en lenguaje natural para especificar la tarea a ejecutar.
- Percepción visual de un único frame RGB por inferencia (no se documenta procesamiento de vídeo ni de múltiples cámaras).
- Normalización de acciones y enmascarado del gripper integrados mediante `action_statistics.json`.
- Diagnóstico de curvas de degradación ("drop-curve") comparando la predicción enmascarada con la predicción sin enmascarar del checkpoint.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Reproducción de experimentos VLA: sirve para replicar el pipeline de DeepVision-VLA sobre BridgeData V2 y comparar resultados con el checkpoint del paper original, usando el cargador de inferencia verificado y los manifiestos incluidos.
- Diagnóstico de políticas de acción: el script de drop-curve permite analizar cómo afecta el enmascarado del gripper a la predicción, comparando la salida enmascarada con la no enmascarada del mismo checkpoint.
- Investigación en manipulación robótica con BridgeData V2: permite entrenar y evaluar variantes sobre una base Qwen3-VL-4B ya adaptada a la predicción de acciones de 7 canales.
- Estudio de cabezas de acción sobre backbones VLM: al estar la cabeza separada del backbone, facilita experimentos de sustitución o comparación de cabezas manteniendo fijo el backbone Qwen.
- Punto de partida para fine-tuning en tareas de manipulación específicas: el checkpoint de preentrenamiento puede servir como inicialización para adaptaciones posteriores a otros conjuntos de datos robóticos.
- Validación de infraestructura de inferencia: útil para verificar cargadores, procesadores de imagen y texto, y estadísticas de normalización antes de desplegar políticas VLA más completas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 8,9 GB, lo que sugiere pesos en BF16/FP16 de aproximadamente 4B parámetros más la cabeza de acción; se estiman en torno a 10-12 GB de VRAM solo para pesos, más el overhead de activaciones y del procesador de imagen.
- GPU recomendadas: para BF16, una GPU con 16-24 GB de VRAM es el mínimo práctico (RTX 4090, L40S, A10G); para mayor throughput, A100 o H100.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB) y en tarjetas de 16 GB con margen ajustado; en 12 GB requeriría cuantización, que no está documentada en la información disponible.
- Opciones de despliegue: el autor indica usar el código de diagnóstico de DeepVision-VLA (https://github.com/yulin-luo/deepvision-vla) con su cargador de inferencia verificado; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este export.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepVision-VLA QwenVLA-OFT H16 | 4B (backbone) + cabeza de acción | no disponible | VLA sobre BridgeData V2 | no disponible | Hugging Face (repo de investigación) |
| Qwen/Qwen3-VL-4B-Instruct | 4B | no disponible en la información proporcionada | VLM multimodal general | no disponible en la información proporcionada | Hugging Face |
| Checkpoint Qwen del paper original DeepVision-VLA | no disponible | no disponible | VLA sobre BridgeData V2 | no disponible | correspondencia no resuelta según el autor |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación: el autor indica explícitamente que la correspondencia con el checkpoint Qwen del paper original y con los ficheros de etiquetas de acción sigue sin resolverse.
- Licencia no disponible: no se puede confirmar el uso comercial permitido; además, hereda las condiciones del modelo base Qwen3-VL-4B-Instruct, que deben verificarse por separado.
- Entrada limitada a un único fotograma RGB: no se documenta soporte de vídeo, múltiples cámaras ni estado histórico.
- Salida restringida a un chunk fijo de 16 acciones de 7 canales; no es un modelo de texto general.
- Sin datos de benchmarks ni de evaluación cuantitativa publicados en la información disponible.
- Sin información sobre sesgos, tasas de alucinación o comportamiento fuera de distribución.
- Idiomas soportados no especificados; las instrucciones de tarea deben ajustarse al formato usado en el entrenamiento.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso externo.
- No debe desplegarse en producción robótica sin una evaluación propia y sin resolver las incógnitas de correspondencia señaladas por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lyl010221-pku/deepvision-vla-qwenvla-oft-h16
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Código de diagnóstico DeepVision-VLA: https://github.com/yulin-luo/deepvision-vla
