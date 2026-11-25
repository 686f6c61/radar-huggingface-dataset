# junafinity/Inkling-2-Mini-Uncensored-MLX-oQ8

## Resumen

Inkling-2-Mini-Uncensored-MLX-oQ8 es una conversión cuantizada para Apple Silicon del modelo multimodal Inkling-2-Mini, publicada por junafinity bajo el paraguas de VeriSafe.Live. El modelo original lo desarrolla Thinking Machines y esta versión deriva de un "abliteration" realizado por OpenUncensored que elimina los mecanismos de rechazo del modelo base. Se trata de un Mixture-of-Experts con arquitectura de transformer "looped" (capas que se recorren varias veces), 26.400 millones de parámetros totales y 3.400 millones activos por token, con capacidad de entrada de texto e imagen.

La relevancia de esta ficha concreta reside en el formato: es una cuantización oMLX oQ8 pensada para ejecutarse de forma nativa en Macs con memoria unificada, ocupando 17,47 GiB en disco e incluyendo el borrador MTP (multi-token prediction) para decodificación especulativa. Mantiene la ventana de contexto de 1.048.576 tokens del modelo base y conserva la torre de visión en BF16. La licencia es Apache-2.0, heredada del modelo original.

Es importante señalar que la eliminación del alineamiento de seguridad es sustancial: el modelo cumplirá peticiones dañinas, ilegales o poco éticas que el original rechazaría. Está orientado a investigación en interpretabilidad, seguridad de IA y red-teaming, no a despliegue en producción sin capas de moderación propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (looped transformer), clase `Inkling2LoopForConditionalGeneration` (`inkling2_loop`) |
| Parametros totales | 26.388.646.400 (26,4B) |
| Parametros activos | 3,4B por token (5,4B efectivos con tres pasadas por las capas looped) |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | oMLX oQ8: 8-bit affine (group size 64) en el tronco BF16; expertos en NVFP4 nativo (capas 0-19) y MXFP8 nativo (capas 20-23); visión y MTP en bfloat16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 4 shards de pesos de 16,88 GiB + `mtp.safetensors` de 0,59 GiB |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos y una estructura "looped": consta de 24 capas con tamaño oculto 2304, 24 cabezas de atención y 8 cabezas KV. Las capas 6 a 17 se recorren tres veces, lo que resulta en 48 visitas de capa por token. Cada capa contiene 128 expertos enrutados con top-8 y sin experto compartido. La atención combina 20 capas de ventana deslizante (ventana de 1024) con 4 capas de atención global. La torre de visión es un ViT de 23 capas, tamaño oculto 1024 y parches de 20.

Según la model card, cada pasada adicional por las capas looped añade aproximadamente 1.000 millones de parámetros activos efectivos, de ahí que con tres pasadas se alcancen 5,4B efectivos por token. La cuantización preserva la precisión nativa de los expertos: los expertos enrutados permanecen en su NVFP4 y MXFP8 de origen y solo el tronco BF16 se convierte a 8-bit affine, sin recuantizar por debajo de la precisión fuente. Se incluye el borrador DSpark MTP para decodificación especulativa. No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni el proceso de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento ("reasoning") según las etiquetas del modelo.
- Comprensión de imágenes: entrada image-text-to-text mediante torre ViT de 23 capas.
- Capacidad multimodal de conversación (pipeline `image-text-to-text`, tarea `conversational`).
- Ventana de contexto de hasta 1.048.576 tokens para documentos largos o conversaciones extensas.
- Decodificación especulativa mediante el borrador DSpark MTP incluido.
- Ejecución nativa en Apple Silicon a través de oMLX (runtime probado en 0.8.2).
- Comportamiento sin rechazos ("uncensored") heredado del abliteration del modelo fuente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.
- Multilingüismo: limitado a inglés según la model card.

## Casos de uso

- Investigación en interpretabilidad y mecanismos de rechazo: el modelo permite estudiar cómo se comporta una red sin alineamiento de seguridad frente a la versión original, comparando respuestas en experimentos controlados.
- Red-teaming y evaluación de robustez: útil para generar intentos adversariales y probar las defensas de sistemas de moderación propios antes de desplegarlos.
- Análisis de documentos largos en local: con contexto de 1M tokens puede procesar informes, expedientes o bases de código extensas en un Mac sin enviar datos a la nube.
- Procesamiento de capturas y documentos escaneados: la torre de visión permite extraer información de imágenes y combinarla con razonamiento textual en un mismo flujo.
- Prototipado de asistentes conversacionales multimodales en Apple Silicon: el formato MLX oQ8 permite iterar rápidamente en un portátil o Mac Studio con memoria unificada suficiente.
- Experimentos de decodificación especulativa: el borrador MTP incluido permite medir ganancias de throughput en comparación con decodificación autoregresiva estándar.
- Evaluación comparativa de cuantizaciones: sirve como referencia para estudiar el impacto de preservar expertos en NVFP4/MXFP8 frente a recuantizarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño en disco: 17,47 GiB (18,76 GB) repartidos en 4 shards de pesos (16,88 GiB) más `mtp.safetensors` (0,59 GiB).
- Memoria unificada estimada: al menos ~18-20 GB libres para cargar los pesos; se recomienda 32 GB o más para contexto largo, dado que la ventana de 1M tokens incrementa el uso de KV cache.
- Hardware objetivo: Apple Silicon (M-series) con memoria unificada; no está pensado para GPUs NVIDIA/AMD.
- GPU dedicadas (A100, H100, RTX 4090): no aplica a este formato MLX; requeriría otra conversión.
- Despliegue: runtime oMLX 0.8.1+ (probado en 0.8.2). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored-MLX-oQ8 (este) | 26,4B totales / 3,4B activos | 1.048.576 | Texto + imagen | Apache-2.0 | MLX safetensors (oQ8) |
| thinkingmachines/Inkling-2-Mini (base original) | 26,4B totales / 3,4B activos | 1.048.576 | Texto + imagen | Apache-2.0 | safetensors |
| OpenUncensored/Inkling-2-Mini-Uncensored (abliterated) | 26,4B totales / 3,4B activos | 1.048.576 | Texto + imagen | Apache-2.0 | safetensors |

La comparación con otras familias de modelos (por ejemplo, alternativas MoE de tamaño similar de otros desarrolladores) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Alineamiento de seguridad eliminado: el modelo cumplirá peticiones dañinas, ilegales u ofensivas que el original rechazaría; no tiene guardarraíles internos significativos.
- Riesgo elevado de contenido nocivo: no debe desplegarse ante usuarios finales ni en producción sin capas propias de moderación y prevención de abuso.
- Uso previsto restringido a investigación legítima: interpretabilidad, seguridad de IA, red-teaming y experimentos controlados.
- Riesgo de alucinación: no se han publicado métricas de fiabilidad; debe asumirse el comportamiento típico de un LLM sin datos de evaluación disponibles.
- Idiomas: solo inglés según la model card; el rendimiento en castellano no está garantizado.
- Contexto largo: aunque la ventana es de 1M tokens, el uso práctico está limitado por la memoria unificada del equipo y el coste de la KV cache.
- Licencia Apache-2.0: permite uso comercial, pero la responsabilidad legal y ética del uso recae íntegramente en quien despliega el modelo.
- Formato específico: solo ejecutable en Apple Silicon con oMLX; no es portable a otros runtimes sin reconversión.
- Los autores y cargadores declinan cualquier responsabilidad por mal uso o daños derivados.

## Enlaces

- Hugging Face: https://huggingface.co/junafinity/Inkling-2-Mini-Uncensored-MLX-oQ8
- Modelo base abliterated: https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Runtime oMLX: https://github.com/jundot/omlx
- VeriSafe.Live: https://verisafe.live
