# open-edge-platform/internvl2-1B-int4-ov-dls-sample

## Resumen

InternVL2-1B INT4 (OpenVINO) es una distribución optimizada del modelo visión-lenguaje InternVL2-1B de OpenGVLab, empaquetada por open-edge-platform (Intel) como representación intermedia (IR) de OpenVINO con pesos cuantizados a INT4 mediante NNCF. El modelo resuelve la tarea de image-text-to-text, es decir, generar descripciones en lenguaje natural a partir de imágenes o fotogramas de vídeo, y está orientado a despliegues en el borde (edge AI) sobre CPU y GPU Intel.

Su relevancia radica en el tamaño: el artefacto INT4 ocupa 761 MB y se ejecuta directamente con OpenVINO GenAI sin pasos adicionales de exportación o cuantización local. Esto lo hace apto para vigilancia urbana, triaje de incidentes y análisis de tráfico en entornos de smart city, donde el hardware disponible suele ser modesto. La model card menciona integración con Intel DLStreamer y despliegues tipo Metro.

El modelo base es InternVL2-1B, con aproximadamente 1.000 millones de parámetros, y esta distribución concreta solo soporta inglés y se publica bajo licencia MIT. No se dispone de información detallada sobre la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language model (InternVL2) sobre transformer; distribución en OpenVINO IR con pesos comprimidos por NNCF |
| Parámetros totales | ~1B (modelo base InternVL2-1B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT4 (weight-compressed, pre-cuantizado) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (INT4), distribuido vía OpenVINO GenAI; no se listan safetensors ni GGUF en esta distribución |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura InternVL2 de OpenGVLab, un vision-language model que combina un codificador visual con un modelo de lenguaje para tareas image-text-to-text. Esta distribución no reentrena el modelo: parte del checkpoint original y aplica cuantización INT4 de pesos con NNCF para producir una IR de OpenVINO lista para inferencia en CPU y GPU. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación principal de esta distribución es de despliegue más que de modelado: el artefacto de 761 MB se ejecuta directamente con OpenVINO GenAI (`VLMPipeline`) y con Intel DLStreamer, sin exportación ni cuantización local. La model card indica explícitamente que NPU no está soportada y que los dispositivos válidos son CPU y GPU. No se documentan técnicas como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Generación de descripciones en lenguaje natural de imágenes y fotogramas de vídeo (image-text-to-text).
- Descripción de escenas urbanas: vehículos, peatones y flujo de tráfico a partir de un prompt en lenguaje natural.
- Procesamiento de vídeo por muestreo de fotogramas (el ejemplo usa un `FRAME_STRIDE` de 15) con generación periódica de subtítulos.
- Respuesta a prompts libres de pregunta visual sobre el contenido de un fotograma.
- Ejecución en CPU y GPU mediante OpenVINO GenAI; integración con Intel DLStreamer para superponer subtítulos sobre el vídeo.
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.
- No se documentan tool calling, function calling, soporte de agentes, modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Vigilancia de smart city: el modelo recibe fotogramas de cámaras de tráfico y genera subtítulos continuos sobre vehículos, peatones y flujo circulatorio, con un footprint de 761 MB que permite desplegarlo en equipos de borde sin GPU dedicada.
- Triaje de incidentes: descripción automática de escenas anómalas en la vía pública (por ejemplo, aglomeraciones o cruces bloqueados) para priorizar la revisión por parte de operadores.
- Análisis de tráfico: registro multimodal de densidad de vehículos, flujo de peatones y actividad en pasos de cebra, combinando la salida textual del VLM con metadatos del vídeo.
- Asistencia a operadores: pregunta-respuesta visual conversacional sobre una señal de cámara en directo, usando el prompt en lenguaje natural para consultar el estado de la escena.
- Procesamiento de vídeo con DLStreamer: integración en pipelines de Intel DLStreamer para superponer subtítulos generados por el modelo sobre los fotogramas, como demuestra el ejemplo incluido.
- Prototipado en CPU: al ejecutarse con OpenVINO GenAI en CPU o GPU sin pasos de exportación, sirve para validar pipelines de visión-lenguaje en portátiles y estaciones de trabajo convencionales antes de escalar a hardware específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el artefacto INT4 ocupa 761 MB en disco, por lo que la huella de memoria es reducida y compatible con equipos de borde.
- GPU recomendadas: la model card solo indica soporte para GPU y CPU, sin listar modelos concretos (A100, H100, RTX 4090, etc.).
- GPU de consumo: no se especifica compatibilidad con GPU de consumo; el diseño apunta a edge AI y el ejemplo usa `DEVICE = "GPU"` con caché en disco (`CACHE_DIR`).
- NPU: no soportada explícitamente.
- Opciones de despliegue: OpenVINO GenAI (`VLMPipeline`) e Intel DLStreamer. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El ejemplo limita la generación a `max_new_tokens = 40` y procesa un fotograma cada 15.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan otros idiomas.
- No se dispone de información sobre sesgos conocidos ni sobre tasas de alucinación del modelo.
- No se especifica la longitud de contexto, lo que limita la planificación de conversaciones multi-turno o prompts largos.
- La cuantización INT4 puede degradar la calidad de las descripciones frente al modelo en precisión completa; no se aportan métricas comparativas.
- NPU no está soportada; el despliegue queda restringido a CPU y GPU.
- Licencia MIT: permite uso comercial, pero se recomienda revisar el archivo LICENSE del repositorio y las condiciones del modelo base InternVL2-1B.
- El repositorio figura con 0 descargas y 0 likes, y el tamaño del repo es 0.0 GB; conviene verificar la disponibilidad real de los artefactos antes de integrarlo en producción.
- No se documentan capacidades de tool calling ni de agentes, por lo que no es adecuado para pipelines que requieran invocación de funciones.

## Enlaces

- Hugging Face: https://huggingface.co/open-edge-platform/internvl2-1B-int4-ov-dls-sample
- Modelo base InternVL2-1B: https://huggingface.co/OpenGVLab/InternVL2-1B
- Build INT4 de OpenVINO: https://huggingface.co/OpenVINO/InternVL2-1B-int4-ov
- Documentación de OpenVINO GenAI: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai.html
- FFmpeg: https://ffmpeg.org/
