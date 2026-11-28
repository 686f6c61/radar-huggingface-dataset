# lmms-lab-encoder/LLaVA-OneVision-2.5-4B-Instruct

## Resumen

LLaVA-OneVision-2.5-4B-Instruct es un modelo de lenguaje y visión (VLM) de aproximadamente 5.250 millones de parámetros, desarrollado por el equipo lmms-lab-encoder (vinculado al proyecto EvolvingLMMs-Lab). Está diseñado para tareas de comprensión de imagen única, múltiples imágenes y vídeo, con una característica diferencial: el soporte nativo de vídeo en *streaming*, donde los fotogramas llegan de uno en uno y el modelo decide en cada paso si permanece en silencio, responde o genera una descripción. Los mismos pesos y la misma plantilla de chat sirven tanto para el modo offline como para el modo streaming.

El modelo emplea una arquitectura multimodal con una torre de visión de patch-16 y fusión espacial 3×3, lo que proporciona un token visual por cada 48×48 píxeles (compresión espacial de 9×). Esta compresión permite manejar vídeos largos dentro de una ventana de contexto de 262.144 tokens. Además del muestreo uniforme de fotogramas, incorpora un *codec mode* que aprovecha el coste en bits del codificador de vídeo para empaquetar las regiones informativas en un número reducido de lienzos.

Es relevante ahora porque combina en un único modelo de tamaño contenido (4B nominales, 5,25B reales) capacidades de comprensión de vídeo largo, streaming y *grounding* temporal, con licencia Apache 2.0, lo que facilita su uso comercial e investigación. Su rendimiento en benchmarks de vídeo se compara favorablemente con alternativas del mismo rango, como Qwen3.5-4B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multimodal transformer (torre de visión patch-16 con fusión 3×3 + LLM); familia LLaVA-OneVision 2.5 |
| Parámetros totales | 5.253.089.792 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (262k) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Pipeline | image-text-to-text |
| Modos de entrada | Imagen única, múltiples imágenes, vídeo (offline y streaming) |
| Compresión visual | 1 token visual por cada 48×48 píxeles (9× espacial) |
| Tamaño del repositorio | 10,5 GB |

## Arquitectura y entrenamiento

El modelo sigue la estela de la familia LLaVA-OneVision, con una torre de visión basada en parches de 16×16 píxeles y una etapa de fusión espacial 3×3 que reduce la secuencia visual a un token por cada 48×48 píxeles. Esta compresión de 9× es clave para que vídeos largos quepan en el contexto de 262k tokens. El modelo procesa imágenes únicas, múltiples imágenes y secuencias de vídeo, y en el modo *codec* utiliza la información de coste en bits del codificador de vídeo para seleccionar y empaquetar las regiones más informativas en un conjunto reducido de lienzos, en lugar de muestrear fotogramas de forma uniforme.

El entrenamiento incluye instrucciones multimodales y está optimizado para el modo streaming: ocho tokens de protocolo codifican la decisión por fotograma (silencio, respuesta o descripción). No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card no publica el informe técnico (aparece como "coming soon"), por lo que los detalles de entrenamiento no están disponibles.

## Capacidades

- Generación de texto condicionada por imagen y vídeo, con razonamiento visual.
- Comprensión de imagen única y múltiples imágenes.
- Comprensión de vídeo offline con muestreo uniforme de fotogramas.
- Comprensión de vídeo en streaming: procesa fotogramas uno a uno y decide en cada paso si permanece en silencio, responde o describe.
- Modo *codec* de vídeo: empaqueta regiones informativas según el coste en bits del codificador.
- *Grounding* temporal en vídeo (localización de eventos, métricas mIoU/mAP).
- Comprensión de vídeo largo gracias al contexto de 262k tokens.
- Conversación multi-turno mediante plantilla de chat (`apply_chat_template`).
- Capacidad de *captioning* por fotograma en modo streaming.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- **Vigilancia y monitorización en streaming**: el modelo recibe fotogramas de una cámara uno a uno y decide cuándo emitir una alerta o descripción, lo que permite desplegarlo en pipelines de vídeo en tiempo real sin procesar el flujo completo de forma offline.
- **Análisis de vídeo largo para investigación**: con 262k tokens de contexto y compresión 9×, puede resumir o responder preguntas sobre grabaciones extensas (clases, reuniones, conferencias) sin truncar la entrada.
- **Grounding temporal en edición de vídeo**: localiza eventos concretos en una secuencia (mIoU/mAP en benchmarks como TimeLens), útil para herramientas de búsqueda y corte automático de clips.
- **Moderación de contenido audiovisual**: el modo streaming permite evaluar fotogramas sucesivos y decidir si un contenido requiere revisión, aprovechando la decisión por fotograma del modelo.
- **Accesibilidad y subtitulado automático**: el modo captioning por fotograma facilita la generación de descripciones para vídeo en directo, con la posibilidad de permanecer en silencio cuando no hay novedad relevante.
- **Asistentes multimodales conversacionales**: con soporte de imagen única y múltiples imágenes y plantilla de chat, puede integrarse en asistentes que alternan texto e imágenes en una conversación multi-turno.
- **Análisis de vídeo deportivo o de actividad (ego-video)**: su rendimiento en EgoSchema y MotionBench lo hace adecuado para interpretar movimiento y acciones en secuencias de primera persona.

## Benchmarks y rendimiento

Resultados publicados en la model card (OV2.5-4B en modo codec y modo frames, comparado con Qwen3.5-4B):

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
| LVBench | 61,6 | **62,0** | 56,5 |
| MLVU dev | **77,1** | 75,3 | 73,8 |
| LongVideoBench val | **71,1** | 69,0 | 62,7 |
| VideoEval-Pro | **64,6** | 64,4 | 62,8 |
| TimeLens ActivityNet (mIoU/mAP) | **59,1** | 58,8 | 53,8 |
| TimeLens Charades (mIoU/mAP) | **61,3** | 60,6 | 48,1 |
| TimeLens QVHighlights (mIoU/mAP) | **70,3** | 68,4 | 67,5 |

No se han publicado resultados de benchmarks de texto puro (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial. Con 5,25B parámetros en safetensors (10,5 GB en fp16/bf16), se requiere aproximadamente 11 GB solo para los pesos en precisión completa; a ello hay que sumar la caché KV para contextos de hasta 262k tokens, que puede ser muy elevada.
- **GPU recomendadas**: para contexto largo y vídeo, se recomiendan GPUs de datacenter con 40-80 GB (A100 40/80 GB, H100). Para contextos moderados, una RTX 4090 (24 GB) podría ser suficiente con cuantización.
- **Consumer GPU**: no confirmado oficialmente. Por tamaño de pesos, cabría en GPUs de 16-24 GB en cuantización de 8 o 4 bits, pero el contexto de 262k y el procesamiento de vídeo pueden exceder la VRAM disponible.
- **Opciones de despliegue**: la model card indica `transformers` con `custom_code` y `llava_onevision2_5`. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Vídeo streaming | Licencia | Rendimiento destacado |
|---|---|---|---|---|---|
| LLaVA-OneVision-2.5-4B-Instruct | 5,25B | 262k | Sí (nativo) | Apache 2.0 | MVBench 75,5; LongVideoBench 71,1 |
| Qwen3.5-4B | ~4B (no confirmado) | No disponible | No disponible | No disponible | VideoMME 75,9; MVBench 64,0 |
| Alternativas de la familia LLaVA-OneVision | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa con Qwen3.5-4B es la única disponible en la model card. En la mayoría de benchmarks de vídeo (MVBench, NextQA, TempCompass, LongVideoBench, TimeLens), OV2.5-4B supera a Qwen3.5-4B, mientras que este último obtiene mejores resultados en VideoMME con subtítulos.

## Limitaciones y advertencias

- **Sesgos**: no se documentan sesgos específicos en la información disponible; al ser un modelo entrenado con datos web multimodales, es probable que herede sesgos de esos datos.
- **Alucinación**: no se han publicado evaluaciones específicas de alucinación visual; en tareas de captioning y descripción de vídeo existe riesgo de generar contenido no presente en la imagen o el fotograma.
- **Idiomas**: no se especifican los idiomas soportados; la model card está en inglés y chino, pero no se confirma el rendimiento multilingüe.
- **Contexto**: aunque el contexto es de 262k tokens, el uso de contextos muy largos incrementa la VRAM necesaria y puede degradar la latencia.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene revisar las licencias de los componentes (torre de visión, LLM base) que no se detallan en la información disponible.
- **Documentación incompleta**: el informe técnico y la página del proyecto aparecen como "coming soon"; no hay detalles de entrenamiento, cuantización ni tool calling.
- **Soporte de ecosistema**: no se confirma compatibilidad con vLLM, llama.cpp u otros motores de inferencia, lo que puede complicar el despliegue en producción.
- **Streaming**: el modo streaming requiere usar la plantilla de chat con `streaming=True`; un uso incorrecto de los tokens de protocolo puede provocar comportamientos inesperados.

## Enlaces

- Hugging Face: https://huggingface.co/lmms-lab-encoder/LLaVA-OneVision-2.5-4B-Instruct
- GitHub del proyecto: https://github.com/EvolvingLMMs-Lab/LLaVA-OneVision-2.5
- Página del proyecto: próximamente (según la model card)
- Informe técnico: próximamente (según la model card)
