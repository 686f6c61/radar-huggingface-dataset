# open-edge-platform/gemma-3-4b-it-int4-ov-dls

## Resumen

Gemma-3-4b-it INT4 (OpenVINO) es una distribución preempaquetada del modelo multimodal Gemma 3 de Google, exportado y cuantizado a INT4 por el equipo OpenVINO de Intel para su ejecución sobre la pila de inferencia OpenVINO GenAI. El artefacto va orientado a un caso de uso concreto: la descripción en lenguaje natural de vídeo procedente de cámaras de tráfico en entornos de ciudad inteligente, con integración específica en DLStreamer para el despliegue sobre CPU y GPU Intel. El modelo base es un vision-language model de 4 000 millones de parámetros con capacidad de instrucción zero-shot.

La contribución del repositorio no es el modelo en sí, sino el empaquetado: artefactos OpenVINO IR ya exportados y cuantizados, scripts de descarga, una muestra de inferencia con OpenVINO GenAI y una muestra de integración con DLStreamer que superpone subtítulos descriptivos sobre los fotogramas de vídeo. Esto elimina el paso de exportación y cuantización local que habitualmente requiere desplegar un VLM sobre hardware Intel.

Es relevante en el contexto de despliegues de borde (edge AI) para videovigilancia y analítica de tráfico, donde el coste energético, la ausencia de GPU de datacenter y la necesidad de baja latencia hacen inviable servir un VLM en FP16 sobre aceleradores convencionales. La cuantización INT4 y los backends CPU, GPU y NPU de OpenVINO permiten ejecutar el modelo en hardware de borde Intel.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language model) basado en Gemma 3; artefacto OpenVINO IR |
| Parámetros totales | 4 000 millones (modelo base gemma-3-4b-it) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | INT4 (weight-compressed); artefacto específico INT4 para NPU (`-cw-ov`) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT (artefacto); el modelo base Gemma 3 se rige por los términos de Google Gemma |
| Formato de pesos | OpenVINO IR (pre-exportado, sin necesidad de exportación local) |
| Hardware objetivo | CPU, GPU y NPU con OpenVINO GenAI; CPU y GPU con DLStreamer |
| Motor de inferencia | OpenVINO GenAI, DLStreamer |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 3 4B en su variante instruction-tuned, un transformer multimodal desarrollado por Google que procesa entradas de imagen y texto y genera texto libre. El repositorio no documenta detalles adicionales de arquitectura interna, número de tokens de entrenamiento, composición del dataset ni si hubo fases de RLHF o DPO; esa información corresponde a la model card oficial de `google/gemma-3-4b-it` y no se reproduce aquí.

La innovación técnica del artefacto es el pipeline de despliegue: exportación a OpenVINO IR y cuantización INT4 de los pesos, con dos variantes diferenciadas. La variante por defecto (`OpenVINO/gemma-3-4b-it-int4-ov`) está optimizada para CPU y GPU; la variante `OpenVINO/gemma-3-4b-it-int4-cw-ov` está optimizada para NPU y requiere aceptar condiciones y autenticarse en Hugging Face. La muestra de OpenVINO GenAI procesa vídeo con OpenCV, aplica un `FRAME_STRIDE` de 15 fotogramas, genera descripciones con `max_new_tokens` de 40 y superpone un rótulo con el texto generado. La muestra de DLStreamer procesa el mismo vídeo de ciudad inteligente y superpone subtítulos sobre la parte superior de los fotogramas.

## Capacidades

- Descripción en lenguaje natural de contenido de vídeo e imagen a partir de un prompt libre (zero-shot).
- Generación de texto descriptivo continuo sobre vehículos, peatones y flujo de tráfico.
- Comprensión visual de escenas urbanas: intersecciones, pasos de peatones, densidad de vehículos.
- Seguimiento de instrucciones en inglés para tareas de captioning y descripción de eventos.
- Procesamiento de flujos de vídeo con muestreo de fotogramas controlado por stride.
- Integración con OpenVINO GenAI (`VLMPipeline`) y con DLStreamer para pipelines de vídeo.
- Ejecución sobre CPU, GPU y NPU (esta última solo con el artefacto específico y fuera de DLStreamer).
- Soporte de caché de compilación en GPU mediante `CACHE_DIR` para acelerar arranques sucesivos.
- Tool calling, function calling, agentes multi-paso, audio y thinking mode: no disponible en la información proporcionada.

## Casos de uso

- Videovigilancia de ciudad inteligente: el modelo recibe fotogramas muestreados de una cámara de tráfico y genera descripciones en lenguaje natural de la escena, lo que permite indexar y buscar eventos en grabaciones sin revisión manual.
- Triaje y monitorización de incidentes: ante escenas anómalas en la vía pública, el modelo produce una descripción textual que puede enrutarse a un operador o a un sistema de alertas, reduciendo el tiempo de identificación del evento.
- Análisis de tráfico multimodal: registro continuo de densidad de vehículos, flujo de peatones y actividad en pasos de peatones, con salida textual apta para almacenamiento y explotación analítica posterior.
- Asistencia a operadores: preguntas y respuestas visuales conversacionales sobre una señal de cámara en directo, con el operador formulando preguntas en lenguaje natural sobre lo que ocurre en la escena.
- Despliegue en borde sin GPU de datacenter: gracias a la cuantización INT4 y al backend CPU/NPU de OpenVINO, el modelo puede ejecutarse en equipos Intel de borde próximos a la cámara, evitando enviar vídeo a la nube.
- Generación de metadatos accesibles: descripción automática de escenas para sistemas de accesibilidad o para enriquecer catálogos de vídeo con texto buscable.
- Prototipado rápido de pipelines VLM: los artefactos pre-exportados y los scripts de descarga permiten validar un caso de uso de visión-lenguaje en minutos, sin abordar el proceso de exportación y cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con pesos en INT4 sobre un modelo de 4 000 millones de parámetros, el peso de los pesos ronda los 2-2,5 GB, a lo que hay que sumar el coste del codificador visual y de la caché KV, no cuantificados en la información proporcionada.
- GPU recomendadas: no se especifican modelos concretos; el artefacto por defecto soporta GPU Intel a través de OpenVINO GenAI y DLStreamer.
- CPU: soportada por el artefacto por defecto mediante OpenVINO GenAI y DLStreamer.
- NPU: soportada únicamente con el artefacto `OpenVINO/gemma-3-4b-it-int4-cw-ov` y solo a través de OpenVINO GenAI; DLStreamer no soporta NPU para este modelo.
- Cabe en GPU de consumo: no confirmado en la información proporcionada; la orientación del artefacto es hardware Intel de borde, no GPU de consumo NVIDIA.
- Opciones de despliegue: OpenVINO GenAI (`VLMPipeline`), DLStreamer, con imágenes oficiales de DLStreamer 2026.2.0 y builds nativos enlazados a OpenVINO 2026.4.1.
- Requisitos de software: Python 3.11 o superior, FFmpeg para transcodificar el vídeo de muestra, OpenCV para la lectura de fotogramas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Orientación |
|---|---|---|---|---|---|
| gemma-3-4b-it-int4-ov-dls (este) | 4 000 M | no disponible | OpenVINO IR INT4 | MIT (artefacto) | Borde Intel, vídeo de ciudad inteligente |
| google/gemma-3-4b-it | 4 000 M | no disponible | Safetensors (PyTorch) | Términos Gemma | Uso general, requiere exportación |
| OpenVINO/gemma-3-4b-it-int4-ov | 4 000 M | no disponible | OpenVINO IR INT4 | MIT | CPU/GPU Intel, uso general |
| OpenVINO/gemma-3-4b-it-int4-cw-ov | 4 000 M | no disponible | OpenVINO IR INT4 | MIT | NPU Intel, uso general |

La diferencia entre este artefacto y los builds de OpenVINO reside en el empaquetado orientado a DLStreamer y en las muestras de descripción de vídeo de tráfico incluidas; el modelo subyacente es el mismo en todos los casos.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; las descripciones y prompts en otros idiomas pueden degradarse.
- No se documentan sesgos específicos, pero al ser un modelo entrenado sobre datos web y de descripción genérica, puede reflejar sesgos de representación en la descripción de personas y vehículos.
- Riesgo de alucinación en la descripción de escenas: el modelo puede mencionar objetos o actividades no presentes en el fotograma, especialmente con prompts abiertos y `max_new_tokens` cortos.
- La muestra limita la generación a 40 tokens nuevos y muestrea uno de cada 15 fotogramas, lo que puede perder eventos breves entre fotogramas.
- El artefacto NPU está sujeto a condiciones en Hugging Face y requiere autenticación previa a la descarga.
- DLStreamer no soporta NPU para este modelo; el despliegue en NPU queda restringido a OpenVINO GenAI.
- La licencia MIT del artefacto no sustituye a los términos de uso de Gemma 3 de Google, que rigen el modelo base y deben revisarse para uso comercial.
- El repositorio figura con 0 GB de tamaño y 0 descargas en el momento de la consulta, lo que sugiere un artefacto recién publicado o sin pesos alojados en el propio repo, con descarga delegada a los repositorios de OpenVINO.
- El stack de validación previo corresponde a una versión RC1 de desarrollo; conviene verificar la matriz de soporte de dispositivos antes de desplegar en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/open-edge-platform/gemma-3-4b-it-int4-ov-dls
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Artefacto OpenVINO INT4 CPU/GPU: https://huggingface.co/OpenVINO/gemma-3-4b-it-int4-ov
- Artefacto OpenVINO INT4 NPU: https://huggingface.co/OpenVINO/gemma-3-4b-it-int4-cw-ov
- Documentación de OpenVINO GenAI: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai.html
- FFmpeg: https://ffmpeg.org/
