# lmms-lab-encoder/LLaVA-OneVision-2.5-4B-Instruct

## Resumen

LLaVA-OneVision-2.5-4B-Instruct es un modelo de visión-lenguaje (VLM) de aproximadamente 5.250 millones de parámetros (denominado "4B" por su componente de lenguaje) desarrollado por el equipo lmms-lab-encoder, continuador de la saga LLaVA-OneVision. Resuelve tareas de comprensión de imagen única, múltiples imágenes y vídeo, y añade una capacidad poco habitual: el procesamiento de vídeo en *streaming*, donde los fotogramas llegan uno a uno y el modelo decide en cada paso si permanece en silencio o emite una respuesta.

La arquitectura combina una torre de visión con patch de 16 píxeles y fusión espacial 3×3, que produce un token visual por cada 48×48 píxeles (compresión espacial 9×), con un modelo de lenguaje de tipo transformer y un contexto de 262.000 tokens. Esa compresión permite encajar vídeos largos en la ventana de contexto sin recurrir a muestreo agresivo de fotogramas.

Su relevancia actual radica en dos innovaciones: un único conjunto de pesos y una única plantilla de chat que sirven tanto para inferencia offline como en streaming (conmutables mediante `apply_chat_template(..., streaming=True)` y ocho tokens de protocolo), y un "modo códec" que aprovecha el coste en bits del codificador de vídeo para empaquetar las regiones informativas en unos pocos lienzos. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de visión patch-16 con merging 3×3 + modelo de lenguaje); familia LLaVA-OneVision 2.5 |
| Parámetros totales | 5.253.089.792 (según safetensors) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.000 tokens (262k) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (la model card está en inglés y chino, pero no se declaran idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, `custom_code`) |

## Arquitectura y entrenamiento

El modelo sigue el esquema de la familia LLaVA-OneVision: un codificador visual tipo ViT con parches de 16×16 píxeles al que se aplica un *merging* espacial 3×3, de modo que cada token visual cubre 48×48 píxeles de la imagen original. Esta compresión de 9× reduce drásticamente el número de tokens por fotograma y es la clave para manejar vídeos largos dentro del contexto de 262k tokens. El componente de lenguaje es un transformer de aproximadamente 4B parámetros (de ahí la denominación comercial), y el conjunto total asciende a 5.253 millones de parámetros.

El entrenamiento cubre tareas offline (imagen única, multi-imagen y vídeo) y, de forma destacada, vídeo en streaming. Para ello se introducen ocho tokens de protocolo que codifican la decisión por fotograma: permanecer en silencio, responder o generar un pie de foto (caption). El "modo códec" es una innovación técnica propia: en lugar de muestrear fotogramas de forma uniforme, utiliza el coste en bits del codificador de vídeo para seleccionar y empaquetar las regiones informativas en un número reducido de lienzos (canvases), lo que mejora la eficiencia en tokens para contenido con movimiento o cambios de escena. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Comprensión de imagen única, múltiples imágenes y vídeo (offline).
- Procesamiento de vídeo en streaming: decisión por fotograma de silencio, respuesta o caption mediante tokens de protocolo.
- Comprensión de vídeo largo gracias al contexto de 262k tokens y a la compresión espacial 9×.
- *Temporal grounding*: localización temporal de eventos en vídeo (evaluado con métricas mIoU en TimeLens).
- Muestreo de fotogramas uniforme y modo códec con empaquetado basado en coste de bits.
- Generación de texto conversacional multimodal (pipeline `image-text-to-text`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo *thinking*, visión, audio u otras capacidades especiales: no disponible en la información proporcionada (solo se documentan visión y vídeo).

## Casos de uso

- **Vigilancia y monitorización en directo**: el modo streaming permite alimentar fotogramas a 24 fps y que el modelo decida cuándo emitir una alerta o descripción, en lugar de procesar el vídeo completo a posteriori. Es adecuado por su protocolo de decisión por fotograma y su bajo coste por token visual.
- **Análisis de vídeo largo para investigación**: con 262k tokens de contexto y compresión 9×, se pueden introducir grabaciones extensas (clases, reuniones, partidos) y formular preguntas sobre eventos concretos, apoyándose en el *temporal grounding* para localizar momentos.
- **Resumen automático de retransmisiones**: el modo códec empaqueta las regiones informativas de un vídeo en pocos lienzos, lo que permite generar resúmenes o pies de foto de eventos deportivos o informativos con menos tokens que el muestreo uniforme.
- **Indexación y búsqueda de contenido audiovisual**: los buenos resultados en Video-Index (23,1 en modo códec) lo hacen apto para construir índices semánticos de bibliotecas de vídeo y responder consultas sobre su contenido.
- **Asistentes de accesibilidad**: descripción en tiempo real de escenas para personas con discapacidad visual, usando el modo streaming para narrar solo los cambios relevantes y evitar saturar con descripciones redundantes.
- **Análisis de vídeo egocéntrico**: los resultados en EgoSchema (79,8–80,0) lo sitúan como opción para procesar grabaciones en primera persona (wearables, gafas inteligentes) y responder preguntas sobre acciones y objetos.
- **Automatización de control de calidad industrial**: análisis de secuencias de cámara para detectar defectos o anomalías en líneas de producción, con la ventaja de que el streaming permite reaccionar fotograma a fotograma.

## Benchmarks y rendimiento

Datos publicados en la model card. Se comparan el modo códec (TC = número de tokens de canvas) y el modo de fotogramas (f) frente a Qwen3.5-4B. El superíndice indica la configuración de tokens × píxeles.

**Vídeo general**

| Benchmark | OV2.5-4B (codec) | OV2.5-4B (frames) | Qwen3.5-4B |
|---|---|---|---|
| VideoMME (sin subtítulos) | **71,9** | 69,7 | 71,7 |
| VideoMME (con subtítulos) | 74,7 | 75,2 | **75,9** |
| MotionBench | **64,2** | 62,4 | 60,1 |
| TOMATO | 36,0 | **39,2** | 32,4 |
| MVBench | **75,5** | 72,0 | 64,0 |
| NextQA MC test | **86,4** | 86,1 | 80,7 |
| TempCompass MC | **79,7** | 75,8 | 73,4 |
| Video-MME-v2 | **17,2** | 16,4 | 15,5 |
| EgoSchema subset | 79,8 | **80,0** | 68,2 |
| Video-Index | **23,1** | 20,0 | 19,6 |

**Vídeo largo**

| Benchmark | OV2.5-4B (codec) | OV2.5-4B (frames) | Qwen3.5-4B |
|---|---|---|---|
| LVBench | 61,6 | **62,0** | 56,5 |
| MLVU dev | **77,1** | 75,3 | 73,8 |
| LongVideoBench val | **71,1** | 69,0 | 62,7 |
| VideoEval-Pro | **64,6** | 64,4 | 62,8 |

**Temporal grounding (mIoU)**

| Benchmark | OV2.5-4B (codec) | OV2.5-4B (frames) | Qwen3.5-4B |
|---|---|---|---|
| TimeLens ActivityNet | **59,1** | 58,8 | 53,8 |
| TimeLens Charades | **61,3** | 60,6 | 48,1 |
| TimeLens QVHighlights | **70,3** | 68,4 | 67,5 |

**Streaming de vídeo**

La model card incluye una tabla comparativa frente a MOSS-VL-Realtime 11B (1 fps) y JoyAI-VL-Interaction 8B (1 fps), pero los datos de esa tabla no están disponibles en la información proporcionada.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 5.253 millones de parámetros en FP16/BF16, los pesos ocupan aproximadamente 10,5 GB (coincide con el tamaño del repo). En cuantización de 8 bits rondaría los 5-6 GB y en 4 bits unos 3-4 GB, aunque no se documentan cuantizaciones oficiales.
- **GPU recomendadas**: para FP16 completo, una GPU con 16-24 GB de VRAM (RTX 4090, A10G, L4 de 24 GB). Para despliegue en servidor con lotes grandes y contexto de 262k, A100 40/80 GB o H100.
- **¿Cabe en GPU de consumo?**: sí, en FP16 cabe ajustadamente en una RTX 4090 (24 GB) para una sola imagen o vídeo corto; en cuantización de 4/8 bits cabría en GPUs de 8-12 GB, pero sin confirmación oficial.
- **Opciones de despliegue**: transformers con `trust_remote_code=True` (requiere `custom_code`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LLaVA-OneVision-2.5-4B-Instruct | 5,25B | 262k | Apache 2.0 | Hugging Face | Streaming de vídeo, modo códec |
| Qwen3.5-4B | ~4B (no confirmado) | no disponible | no disponible | no disponible | Comparable en benchmarks de vídeo; referencia en las tablas de la model card |
| MOSS-VL-Realtime 11B | 11B | no disponible | no disponible | no disponible | Especializado en vídeo en tiempo real (1 fps) |
| JoyAI-VL-Interaction 8B | 8B | no disponible | no disponible | no disponible | Orientado a interacción con vídeo (1 fps) |

Los tres modelos de comparación aparecen únicamente como referencias en las tablas de la model card; no se dispone de sus especificaciones completas en la información proporcionada.

## Limitaciones y advertencias

- **Sesgos**: no se documentan sesgos conocidos ni análisis de equidad en la model card.
- **Alucinación**: no se publica ninguna evaluación de tasas de alucinación; como todo VLM, puede generar descripciones plausibles pero incorrectas, especialmente en vídeos largos o con oclusiones.
- **Idiomas**: no se declaran los idiomas soportados; la model card está en inglés y chino, pero no hay confirmación de cobertura multilingüe.
- **Contexto**: el contexto de 262k tokens es amplio, pero el coste de atención crece con la longitud; vídeos muy largos pueden requerir truncado o compresión adicional.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene revisar las dependencias del código personalizado (`custom_code`) y los pesos del codificador visual, cuyo origen y licencia no se detallan.
- **Madurez**: el repositorio tiene 0 descargas y 0 likes, y la propia model card marca GitHub, página del proyecto e informe técnico como "coming soon"; no hay validación externa ni comunidad establecida.
- **Producción**: al no documentarse integraciones con motores de inferencia de alto rendimiento (vLLM, TGI) ni cuantizaciones oficiales, el despliegue productivo requeriría trabajo adicional de ingeniería.
- **Streaming**: el modo streaming depende de tokens de protocolo y de una plantilla de chat concreta; cambios en la plantilla o en el cliente pueden romper el comportamiento.

## Enlaces

- Hugging Face: https://huggingface.co/lmms-lab-encoder/LLaVA-OneVision-2.5-4B-Instruct
- GitHub: no disponible ("coming soon")
- Página del proyecto: no disponible ("coming soon")
- Informe técnico: no disponible ("coming soon")
- README en chino: referenciado como README_CN.md en el repositorio de Hugging Face
