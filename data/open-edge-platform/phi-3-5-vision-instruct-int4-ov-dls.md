# open-edge-platform/phi-3.5-vision-instruct-int4-ov-dls

## Resumen

Phi-3.5-vision-instruct INT4 (OpenVINO) es una distribución pre-cuantizada y pre-exportada del modelo vision-language Phi-3.5-vision-instruct de Microsoft, publicada por open-edge-platform (Intel) en formato OpenVINO IR. El objetivo no es ofrecer un modelo nuevo, sino un artefacto listo para desplegar en hardware Intel (CPU, GPU y, con un artefacto separado, NPU) sin necesidad de exportar ni cuantizar localmente. Se distribuye en INT4 para CPU/GPU y en NF4 para NPU.

El caso de uso que articula la publicación es la descripción en lenguaje natural de vídeo de vigilancia urbana (smart city, metro): el modelo recibe fotogramas de una cámara de tráfico junto con un prompt en inglés y genera subtítulos continuos sobre vehículos, peatones y flujo de tráfico. Se acompaña de dos muestras de referencia: una con OpenVINO GenAI y otra con Intel DLStreamer, ambas procesando el mismo vídeo de ejemplo de 10 segundos.

Es relevante ahora porque demuestra la ruta de despliegue de un VLM de Microsoft en el edge con el stack de inferencia de Intel, incluyendo soporte experimental de NPU para GenAI y una integración con DLStreamer orientada a pipelines de vídeo en producción. La ficha se centra en las características del artefacto OpenVINO; los datos del modelo base que no aparecen en la información proporcionada se marcan como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (modelo base: Phi-3.5-vision-instruct de Microsoft); artefacto exportado a OpenVINO IR |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (la muestra DLStreamer usa `MAX_PROMPT_LEN=4096` en la prueba NPU) |
| Tipos de cuantizacion | INT4 (CPU/GPU), NF4 (NPU) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (pre-exportado, sin exportación ni cuantización local) |

## Arquitectura y entrenamiento

El artefacto es una conversión del modelo Phi-3.5-vision-instruct de Microsoft a OpenVINO IR, con cuantización INT4 para CPU/GPU y una variante NF4 optimizada para NPU. No se publica en la información disponible ningún detalle sobre la arquitectura interna del transformer, el número de parámetros, la composición del dataset de entrenamiento ni las etapas de alineación (RLHF/DPO) del modelo base; esos datos corresponden a la model card de Microsoft y no se recogen aquí.

La innovación relevante de esta publicación es de despliegue, no de entrenamiento: se ofrecen artefactos pre-exportados que eliminan el paso de exportación y cuantización en el host del usuario, se documenta una matriz de soporte de dispositivos (OpenVINO GenAI sobre GPU, CPU y NPU; DLStreamer sobre GPU y CPU), y se incluyen muestras ejecutables que integran el VLM en un pipeline de vídeo con superposición de subtítulos sobre los fotogramas. La prueba de humo NPU con DLStreamer 2026.2.0 requirió reconvertir el tokenizer IR y fijar `MAX_PROMPT_LEN=4096`.

## Capacidades

- Descripción de vídeo multi-fotograma en lenguaje natural a partir de un prompt (comprensión nativa de múltiples frames según la model card).
- Generación de texto libre condicionada a imagen o vídeo (pipeline `image-text-to-text`).
- Razonamiento sobre gráficos (chart reasoning) y comprensión de documentos, según la model card.
- Respuesta a preguntas visuales conversacionales sobre feeds de cámara en directo (operator assistance).
- Descripción continua de escenas urbanas: vehículos, peatones, flujo de tráfico y actividad en cruces.
- Ejecución en CPU, GPU y NPU mediante OpenVINO GenAI; en DLStreamer, limitado a CPU y GPU.
- Integración con pipelines de vídeo de DLStreamer con superposición de subtítulos sobre los fotogramas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Multilingüismo: limitado a inglés según el campo `language` de la model card.

## Casos de uso

- Vigilancia de smart city: el modelo recibe fotogramas de una cámara de tráfico y un prompt en inglés y genera descripciones continuas de la escena, adecuado por su comprensión multi-fotograma y su despliegue en GPU/CPU del edge sin depender de la nube.
- Triaje y monitorización de incidentes: descripción automática de eventos anómalos en la calle a partir del flujo de vídeo, integrable en el pipeline de DLStreamer que ya procesa la señal de cámara.
- Análisis de tráfico: registro multimodal de densidad de vehículos, flujo de peatones y actividad en pasos de cebra, con salida en texto apta para indexación y búsqueda.
- Asistencia a operadores: preguntas y respuestas visuales conversacionales sobre feeds de cámara en directo, con el operador formulando preguntas en lenguaje natural sobre lo que muestra la imagen.
- Despliegue en equipos sin GPU dedicada: la variante INT4 para CPU permite ejecutar el VLM en nodos de borde con OpenVINO GenAI, útil cuando no hay acelerador disponible.
- Procesamiento en NPU de bajo consumo: la variante NF4 con OpenVINO GenAI sobre NPU está pensada para equipos Intel con NPU integrada, reduciendo el consumo frente a GPU.
- Integración en pipelines de vídeo existentes: la muestra de DLStreamer demuestra cómo insertar el modelo en un grafo de procesamiento de vídeo y superponer los subtítulos generados sobre los fotogramas, lo que facilita su adopción en infraestructuras de videovigilancia ya desplegadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El artefacto está cuantizado a INT4 (CPU/GPU) y NF4 (NPU), lo que reduce sustancialmente el peso frente a los pesos originales, pero no se publica la cifra concreta.
- GPU recomendadas: no se especifican modelos concretos; la model card indica soporte de GPU Intel a través de OpenVINO GenAI y DLStreamer.
- CPU: soportada por OpenVINO GenAI y DLStreamer con el artefacto INT4.
- NPU: soportada por OpenVINO GenAI con el artefacto NF4; DLStreamer no añade soporte NPU en esta publicación (la prueba de humo NPU con DLStreamer 2026.2.0 se documenta como caso separado).
- Cabe en GPU de consumo: no disponible; no se confirma ni se descarta en la información proporcionada.
- Opciones de despliegue: OpenVINO GenAI (Python, `openvino_genai.VLMPipeline`) e Intel DLStreamer 2026.2.0. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. La muestra usa `max_new_tokens = 40` y `FRAME_STRIDE = 15` sobre un vídeo de ejemplo de 10 segundos, pero no se publican métricas de rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| open-edge-platform/phi-3.5-vision-instruct-int4-ov-dls (este) | no disponible | no disponible | MIT | OpenVINO IR INT4/NF4; GenAI y DLStreamer | Artefacto pre-cuantizado para CPU/GPU/NPU Intel, orientado a descripción de vídeo |
| OpenVINO/Phi-3.5-vision-instruct-int4-ov | no disponible | no disponible | no disponible en la información | OpenVINO IR INT4 | Build INT4 de referencia para CPU/GPU del que depende este artefacto |
| OpenVINO/Phi-3.5-vision-instruct-nf4-ov | no disponible | no disponible | no disponible en la información | OpenVINO IR NF4 | Build NF4 optimizado para NPU |
| microsoft/Phi-3.5-vision-instruct | no disponible | no disponible | no disponible en la información | PyTorch / Transformers | Modelo base original de Microsoft |

No se dispone de datos de benchmarks ni de especificaciones del modelo base en la información proporcionada, por lo que la comparativa se limita a formato, licencia y ruta de despliegue.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés (`en`); no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Sesgos: no se documentan en la información disponible; al tratarse de un modelo base de Microsoft, los sesgos del modelo original se heredan, pero no se detallan aquí.
- Riesgo de alucinación: no se cuantifica en la información disponible; como VLM generativo, puede producir descripciones plausibles pero incorrectas de la escena, algo crítico en vigilancia e incidentes.
- Contexto: la longitud de contexto del modelo base no se indica; en la prueba NPU con DLStreamer se fija `MAX_PROMPT_LEN=4096`, lo que sugiere un límite práctico de prompt en ese pipeline.
- Licencia MIT: permisiva y apta para uso comercial, pero conviene verificar las condiciones del modelo base de Microsoft y de los artefactos OpenVINO de los que depende.
- Soporte de dispositivos: DLStreamer no soporta NPU en esta publicación; la ruta NPU requiere OpenVINO GenAI y el artefacto NF4, además de una posible reconversión del tokenizer IR según la versión de DLStreamer.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el stack validado corresponde a una versión RC1 de desarrollo; no debe tratarse como un artefacto con historial de producción.
- Tamaño del repo: 0.0 GB reportado, lo que sugiere que los pesos no están alojados en este repositorio y se descargan mediante el script `export_and_quantize.sh` desde los repositorios OpenVINO.

## Enlaces

- Hugging Face (este artefacto): https://huggingface.co/open-edge-platform/phi-3.5-vision-instruct-int4-ov-dls
- Modelo base: https://huggingface.co/microsoft/Phi-3.5-vision-instruct
- Build INT4 CPU/GPU: https://huggingface.co/OpenVINO/Phi-3.5-vision-instruct-int4-ov
- Build NF4 NPU: https://huggingface.co/OpenVINO/Phi-3.5-vision-instruct-nf4-ov
- Documentación de OpenVINO GenAI: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai.html
- FFmpeg: https://ffmpeg.org/
- Repositorio de OpenVINO: no disponible en la información proporcionada
- Repositorio de DLStreamer: no disponible en la información proporcionada
- Paper del modelo base: no disponible en la información proporcionada
- Demo online: no disponible en la información proporcionada
