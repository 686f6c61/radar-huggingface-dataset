# open-edge-platform/llava-v1.6-mistral-7b-hf-int4-ov-dls

## Resumen

LLaVA-v1.6-Mistral-7B INT4 (OpenVINO) es una distribución pre-cuantizada del modelo vision-language LLaVA-NeXT basado en Mistral-7B, publicada por el equipo open-edge-platform de Intel. El paquete empaqueta los pesos en formato OpenVINO IR con compresión INT4 mediante NNCF, de modo que puede descargarse y ejecutarse directamente con OpenVINO GenAI sin pasos adicionales de exportación o cuantización local. Está orientado a la descripción de vídeo en entornos de ciudad inteligente sobre hardware Intel de borde (CPU y GPU).

El modelo subyacente, llava-v1.6-mistral-7b-hf, es un VLM de referencia en la familia LLaVA-NeXT que combina un codificador visual con el decoder Mistral-7B y ofrece razonamiento zero-shot sobre imágenes y vídeo. Esta variante concreta está pensada para generar subtítulos en lenguaje natural de flujos de cámara de tráfico: vehículos, peatones y patrones de circulación, con integración tanto en la API de OpenVINO GenAI como en el pipeline de Intel DLStreamer.

La relevancia actual reside en su enfoque de despliegue: un VLM de 7B en INT4 de aproximadamente 3,93 GB, ejecutable en CPU y GPU Intel sin NPU, lo que lo hace apto para nodos de borde en vigilancia urbana, triaje de incidentes y asistencia a operadores. La licencia es MIT y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (LLaVA-NeXT: codificador visual + decoder Mistral-7B transformer) |
| Parametros totales | 7B (modelo base Mistral-7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (compresión de pesos con NNCF); solo se distribuye la variante INT4 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (INT4, weight-compressed) |

## Arquitectura y entrenamiento

La arquitectura corresponde a LLaVA-NeXT sobre Mistral-7B: un codificador visual que proyecta características de imagen al espacio del modelo de lenguaje, acoplado a un decoder transformer Mistral-7B de 7.000 millones de parámetros. Esta distribución no reentrena el modelo: parte de los pesos de llava-hf/llava-v1.6-mistral-7b-hf y aplica una compresión de pesos INT4 con NNCF para producir un Intermediate Representation de OpenVINO listo para inferencia. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base.

La innovación técnica relevante de este paquete es el pipeline de despliegue: conversión a IR de OpenVINO con cuantización INT4 y ejecución mediante OpenVINO GenAI (VLMPipeline) o DLStreamer, con soporte de caché en GPU y procesamiento de fotogramas de vídeo mediante muestreo por stride. El sample incluido procesa un vídeo de 10 segundos de una rotonda urbana y superpone subtítulos generados sobre los fotogramas.

## Capacidades

- Generación de descripciones en lenguaje natural de imágenes y fotogramas de vídeo (vehículos, peatones, flujo de tráfico).
- Comprensión visual zero-shot sobre escenas urbanas e intersecciones.
- Respuesta a prompts en lenguaje natural sobre contenido visual (visual question answering).
- Descripción continua de vídeo mediante inferencia periódica sobre fotogramas muestreados.
- Integración con OpenVINO GenAI y con el pipeline de Intel DLStreamer para superposición de subtítulos.
- Ejecución en CPU y GPU Intel; NPU no soportado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Vigilancia de ciudad inteligente: el modelo recibe fotogramas de cámaras de tráfico y genera descripciones en tiempo real de vehículos, peatones y actividad en intersecciones, aprovechando su ejecución en CPU/GPU Intel de borde sin necesidad de GPU de datacenter.
- Triaje y monitorización de incidentes: descripción automática de escenas anómalas en la vía pública, con salida textual que puede enrutarse a operadores o sistemas de alerta.
- Análisis de tráfico: registro multimodal de densidad de vehículos, flujo de peatones y actividad en pasos de cebra, generando texto estructurado a partir del vídeo.
- Asistencia a operadores: preguntas y respuestas conversacionales sobre feeds de cámara en directo, usando el modelo como capa de comprensión visual bajo demanda.
- Procesamiento de vídeo con DLStreamer: integración en pipelines GStreamer de Intel para superponer subtítulos generados por el VLM sobre el flujo de vídeo en aplicaciones de videovigilancia.
- Prototipado en borde: despliegue de un VLM de 7B en INT4 (unos 3,93 GB) en equipos Intel sin NPU, útil para validar casos de uso de visión-lenguaje antes de escalar a infraestructura mayor.
- Enriquecimiento de metadatos de vídeo: generación automática de descripciones textuales para indexación y búsqueda de grabaciones de cámaras urbanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño del artefacto: aproximadamente 3,93 GB (IR INT4 descargado por el script de exportación).
- Dispositivos soportados: CPU y GPU Intel; NPU no soportado.
- VRAM estimada para inferencia: no disponible de forma explícita; el peso INT4 ronda los 3,93 GB, por lo que se requiere memoria suficiente para pesos más activaciones y caché KV.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; la model card solo indica GPU y CPU como dispositivos válidos.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; el tamaño INT4 (~3,93 GB) es compatible con GPUs de consumo con suficiente VRAM, pero no se documenta validación.
- Opciones de despliegue: OpenVINO GenAI (VLMPipeline) y Intel DLStreamer; el sample usa OpenCV para lectura/escritura de vídeo y FFmpeg para transcodificación.
- Latencia y throughput: no disponibles; el sample usa max_new_tokens=40 y un stride de 15 fotogramas entre inferencias, pero no se publican métricas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| open-edge-platform/llava-v1.6-mistral-7b-hf-int4-ov-dls | 7B | no disponible | OpenVINO IR INT4 | MIT | VLM para borde Intel (CPU/GPU) |
| OpenVINO/llava-v1.6-mistral-7b-hf-int4-ov | 7B | no disponible | OpenVINO IR INT4 | no disponible en la informacion | Mismo modelo base, build INT4 de referencia |
| llava-hf/llava-v1.6-mistral-7b-hf | 7B | no disponible | PyTorch (Transformers) | no disponible en la informacion | Modelo base LLaVA-NeXT Mistral-7B |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se declaran capacidades multilingües.
- No soporta NPU; el despliegue queda restringido a CPU y GPU Intel.
- Es una distribución INT4: la cuantización de pesos puede degradar la calidad de las descripciones frente al modelo en precisión completa.
- Riesgo de alucinación inherente a los VLM: puede describir objetos o eventos no presentes en el fotograma.
- Sesgos del modelo base LLaVA/Mistral no documentados en la información disponible.
- No se documentan la longitud de contexto ni los datos de entrenamiento, lo que dificulta evaluar límites en escenas complejas o vídeos largos.
- La licencia MIT permite uso comercial, pero debe verificarse la licencia del modelo base y de los pesos de origen antes de producción.
- El sample procesa fotogramas con stride (cada 15 fotogramas) y limita la generación a 40 tokens nuevos, lo que puede perder eventos breves entre muestras.
- El repositorio figura con 0 descargas y 0 likes, y el tamaño reportado es 0.0 GB; conviene verificar la integridad de los artefactos antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-edge-platform/llava-v1.6-mistral-7b-hf-int4-ov-dls
- Modelo base: https://huggingface.co/llava-hf/llava-v1.6-mistral-7b-hf
- Build INT4 de referencia en OpenVINO: https://huggingface.co/OpenVINO/llava-v1.6-mistral-7b-hf-int4-ov
- Documentación de OpenVINO GenAI: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai.html
- FFmpeg: https://ffmpeg.org/
