# Juxoola/LFM3-VL-2B-MNN

## Resumen

LFM3-VL-2B-MNN es una exportación al formato MNN del modelo LiquidAI/LFM3-VL-2B, un modelo de lenguaje de 2.000 millones de parámetros con comprensión de imágenes nativa, desarrollado originalmente por Liquid AI. Esta versión, publicada por el usuario Juxoola, convierte el checkpoint original al runtime MNN (motor `llm` más codificador visual) para ejecutarlo en CPU sobre Android, iOS, Linux y Windows, sin necesidad de GPU.

El modelo original combina una arquitectura híbrida de atención: 13 capas de atención lineal basadas en convolución corta (`short_conv`) intercaladas con 11 capas de atención completa con ventana deslizante de 256 tokens, cabezas de 128 dimensiones y puerta sigmoide por cabeza. La parte visual es un ViT estilo SigLIP con proyector de fusión de parches 2×2 que convierte una imagen de 1024×1024 en 1.024 tokens de imagen dentro de la secuencia del LLM.

La relevancia de esta ficha radica en que es una de las pocas exportaciones MNN publicadas de un modelo visión-lenguaje de 2B orientado a dispositivos, con cuantización agresiva (4 bits en el LLM, 8 bits en la torre visual) que reduce la descarga a aproximadamente 1,19 GB. El autor documenta además una corrección del grafo visual estático para evitar un fallo de reescalado silencioso del motor MNN.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 13 capas de atención lineal `short_conv` + 11 capas de atención completa (ventana deslizante 256, head_dim 128, RoPE fusionado, puerta sigmoide por cabeza); torre visual ViT estilo SigLIP con proyector 2×2 |
| Parametros totales | 2B (modelo base LFM3-VL-2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | LLM lineal: 4 bits, bloque 64, calibración HQQ, alpha en fp16; embedding/lm_head compartido: 4 bits, bloque 64; torre visual y proyector: 8 bits, bloque 128 |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (licencia propia de Liquid AI, enlazada como `other`) |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`, `visual.mnn`, `visual.mnn.weight`, `tokenizer.mtok`) |

## Arquitectura y entrenamiento

El stack de texto intercala 13 capas de atención lineal basadas en convolución corta con 11 capas de atención completa que usan ventana deslizante de 256 tokens, RoPE fusionado y una puerta sigmoide por cabeza con `head_dim` de 128. Los embeddings de palabra están atados a la proyección de salida, por lo que la exportación mantiene una única tabla de embedding compartida y no incluye pesos separados de `lm_head`. El grafo `llm.mnn` acepta `input_ids [1,1,2048]`, `attention_mask [2,1,-1,-1]`, `position_ids [1,-1]` en i32 y `logits_index [1]` en i32.

La torre visual es un ViT estilo SigLIP con proyector de fusión de parches 2×2 (`hidden 4096`, activación gelu, `downsample_factor 2`). Una imagen de 1024×1024 se divide en parches de 16 px (64×64), que se fusionan a 1.024 tokens de imagen en la secuencia del LLM. La torre es agnóstica a la rejilla: las posiciones provienen de RoPE axial 2D calculado a partir de la rejilla de parches, sin tabla de embeddings posicionales absolutos, y el procesador original redimensiona dinámicamente entre 0,25 MP y 16 MP. El tamaño estático de exportación es 1024×1024 (aproximadamente 1,05 MP, equivalente a un fotograma nativo de 720p) y puede cambiarse con `LFM3_VL_EXPORT_SIZE`.

En cuanto al entrenamiento, la información proporcionada no detalla el número de tokens, la composición del dataset ni si hubo RLHF o DPO. La model card de esta exportación se centra en el proceso de conversión y cuantización, no en el entrenamiento del modelo base.

## Capacidades

- Generación de texto y razonamiento multimodal: el modelo acepta imágenes y texto en el mismo contexto y genera respuestas en lenguaje natural.
- Comprensión de imágenes nativa: la torre visual procesa fotogramas de 1024×1024 y los inyecta como 1.024 tokens en la secuencia del LLM.
- OCR y lectura de documentos: el autor documenta una prueba de OCR funcionando de extremo a extremo en Android.
- Comprensión de vídeo y razonamiento espacial: según la documentación de Liquid AI, el modelo base LFM3-VL-2B incluye comprensión de vídeo, modo de pensamiento (*thinking*) y razonamiento espacial.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multietapa: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Ejecución en CPU: el runtime MNN permite inferencia sin GPU en Android, iOS, Linux y Windows.

## Casos de uso

- OCR y digitalización de documentos en dispositivos móviles: la exportación está probada en Android con el grafo visual estático y el runtime MNN en CPU, lo que permite leer texto de imágenes sin enviar datos a la nube.
- Asistentes de accesibilidad en móvil: un modelo de 2B con visión puede describir imágenes capturadas por la cámara y responder preguntas sobre ellas en local, con una descarga de aproximadamente 1,19 GB y sin conexión.
- Procesamiento de fotogramas en aplicaciones de cámara: el tamaño estático de 1024×1024 equivale a un fotograma de 720p, lo que encaja con pipelines de vídeo que redimensionan cada fotograma antes de la inferencia.
- Análisis de documentos escaneados en escritorio Linux o Windows: usando `llm_demo` con el backend CPU y OpenCV habilitado, se puede integrar en herramientas de línea de comandos para extraer información de imágenes.
- Prototipado de aplicaciones visión-lenguaje sin GPU: el modelo corre en CPU con un rendimiento de decodificación de aproximadamente 23 tokens por segundo en un host x86_64, lo que permite validar ideas en portátiles convencionales.
- Sistemas de inspección visual con preguntas en lenguaje natural: por ejemplo, verificar el estado de un producto a partir de una foto y formular preguntas de seguimiento en una conversación multiturno.
- Investigación en eficiencia de modelos: sirve como referencia para estudiar cuantización 4/8 bits, atención lineal y exportación a runtimes móviles en modelos visión-lenguaje pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato de rendimiento proporcionado es la velocidad de decodificación del grafo exportado: aproximadamente 23 tokens por segundo en un host x86_64 con CPU, con la caché `conv4` desactivada en la exportación.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la configuración documentada, ya que el modelo está pensado para ejecutarse en CPU; el tamaño de descarga es de aproximadamente 1,19 GB (1.187.217.856 bytes).
- GPU recomendadas: no aplica; de hecho, los backends OpenCL y Vulkan no disponen de kernels para `LinearAttention` ni para el RoPE fusionado de esta arquitectura, por lo que fallan en las capas LFM3.
- ¿Cabe en GPU de consumo? La ejecución documentada es en CPU; no se proporcionan datos de VRAM para GPU.
- Opciones de despliegue: runtime MNN con el motor `llm` y el codificador visual, compilado con `-DMNN_LOW_MEMORY=true`, `-DMNN_CPU_WEIGHT_DEQUANT_GEMM=true`, `-DMNN_BUILD_LLM=true`, `-DMNN_SUPPORT_TRANSFORMER_FUSE=true` y `-DMNN_OPENCV_BUILD=true`. Se ejecuta con `llm_demo` sobre `config.json`.
- Requisito de motor: el grafo visual estático solo funciona con MNN 3.6.2 o superior, cuyo `VisionProcessor` para `Lfm3` implemente el comportamiento `patchInputs` descrito por el autor.
- Latencia y throughput: aproximadamente 23 tokens por segundo en decodificación sobre CPU x86_64; no se proporcionan datos de latencia de prefill ni de rendimiento en dispositivos Android concretos.
- Formatos alternativos: no se ofrece GGUF ni safetensors en esta exportación; solo pesos MNN.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| LFM3-VL-2B-MNN (esta ficha) | 2B | no disponible | Sí (1024 tokens por imagen) | lfm1.0 | MNN, CPU |
| LiquidAI/LFM3-VL-2B (modelo base) | 2B | no disponible | Sí | lfm1.0 | Pesos originales de Liquid AI |
| Otros modelos visión-lenguaje de ~2B | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos comparables, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- La licencia es `lfm1.0`, una licencia propia de Liquid AI enlazada como `other`; es necesario revisar sus términos en el repositorio legal de Liquid AI antes de cualquier uso comercial.
- El modelo solo funciona con el backend CPU de MNN; los backends OpenCL y Vulkan fallan por falta de kernels para la atención lineal y el RoPE fusionado.
- El grafo visual estático requiere MNN 3.6.2 o superior con el `VisionProcessor` correcto; versiones anteriores o exportaciones dinámicas pueden producir respuestas del tipo "no puedo ver imágenes" por un fallo de reescalado silencioso.
- La entrada de imagen está fijada a 1024×1024 (1.048.576 píxeles); cualquier otra resolución debe redimensionarse antes de la inferencia, lo que puede degradar la calidad en imágenes con relaciones de aspecto extremas.
- No se dispone de información sobre sesgos, riesgo de alucinación, idiomas soportados ni limitaciones de contexto del modelo base en la documentación proporcionada.
- Es una exportación comunitaria (autor Juxoola, 72 descargas, 0 likes), no una publicación oficial de Liquid AI; la reproducibilidad y el soporte dependen del autor.
- El rendimiento de 23 tokens por segundo se midió en un host x86_64; el rendimiento en dispositivos Android concretos no está cuantificado en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Juxoola/LFM3-VL-2B-MNN
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Documentación de Liquid AI para LFM3-VL-2B: https://docs.liquid.ai/lfm/models/lfm3-vl-2b
- Repositorio legal de Liquid AI (licencia): https://www.liquid.ai/legal-repository
- Herramienta de exportación llmexport de MNN: https://github.com/alibaba/MNN/tree/master/transformers/llm/export
