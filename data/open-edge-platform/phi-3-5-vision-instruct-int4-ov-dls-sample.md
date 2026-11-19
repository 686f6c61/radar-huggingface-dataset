# open-edge-platform/phi-3.5-vision-instruct-int4-ov-dls-sample

## Resumen

Phi-3.5-vision-instruct INT4 (OpenVINO) es un artefacto de despliegue publicado por open-edge-platform (Intel) que empaqueta el modelo vision-lenguaje Phi-3.5-vision-instruct de Microsoft en formato OpenVINO IR ya cuantizado a INT4 (CPU/GPU) y NF4 (NPU), listo para ejecutarse sin exportación ni cuantización local. El objetivo no es un modelo nuevo, sino una receta reproducible para llevar un VLM de 4.200 millones de parámetros a hardware Intel de borde, con ejemplos funcionales de OpenVINO GenAI y de Intel DLStreamer aplicados a descripción de vídeo en ciudades inteligentes.

El caso de uso que motiva el repositorio es la videovigilancia urbana: dado un flujo de una cámara de tráfico y un prompt en lenguaje natural, el modelo genera leyendas continuas sobre vehículos, peatones y flujo circulatorio. El artefacto incluye un vídeo de muestra de 10 segundos, scripts de descarga y un ejemplo de inferencia que superpone el texto generado sobre los fotogramas.

Es relevante porque demuestra un VLM multimodal capaz de comprensión multi-fotograma nativa ejecutándose en CPU, GPU integrada y NPU de Intel con precisión de 4 bits, lo que habilita despliegues de borde sin GPU dedicada. La licencia MIT del artefacto y la del modelo base facilitan su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (vision encoder + proyector + LLM), base Phi-3.5-vision-instruct |
| Parametros totales | 4.200 millones (modelo base Phi-3.5-vision-instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de DLStreamer usa `MAX_PROMPT_LEN=4096`) |
| Tipos de cuantizacion | INT4 (CPU/GPU), NF4 (NPU) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (pre-exportado y pre-cuantizado) |

## Arquitectura y entrenamiento

El artefacto no entrena nada: redistribuye el modelo Phi-3.5-vision-instruct de Microsoft convertido a OpenVINO IR y cuantizado. La arquitectura subyacente es un VLM compuesto por un codificador visual, un proyector que alinea las representaciones visuales con el espacio del lenguaje y un LLM decoder-only de 4.200 millones de parámetros. El modelo base se caracteriza por comprensión multi-fotograma nativa de vídeo, razonamiento sobre gráficos y comprensión de documentos.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no se aporta información en la documentación disponible. La innovación técnica del artefacto es el pipeline de despliegue: exportación a OpenVINO IR con dos variantes de precisión (INT4 para CPU/GPU y NF4 optimizado para NPU), integración con OpenVINO GenAI para inferencia generativa y con Intel DLStreamer para pipelines de vídeo, y un script `export_and_quantize.sh` que descarga el artefacto y el vídeo de muestra con confirmación previa.

## Capacidades

- Generación de descripciones en lenguaje natural de contenido de vídeo a partir de un prompt libre.
- Comprensión multi-fotograma nativa: procesa secuencias de vídeo, no solo imágenes sueltas.
- Razonamiento sobre gráficos (chart reasoning) y comprensión de documentos, heredado del modelo base.
- Respuesta a preguntas visuales (VQA) sobre fotogramas de cámara en directo.
- Detección y descripción de eventos anómalos en escenas de calle.
- Ejecución en CPU, GPU integrada y NPU de Intel mediante OpenVINO GenAI; en DLStreamer, solo CPU y GPU.
- Soporte de dos artefactos separados según el dispositivo objetivo (INT4 para CPU/GPU, NF4 para NPU).
- No se documenta soporte de tool calling, function calling ni modo thinking en la información disponible.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Videovigilancia urbana en tiempo real: el ejemplo incluido procesa un vídeo de cámara de tráfico con `FRAME_STRIDE = 15` y genera leyendas periódicas sobre vehículos, peatones y flujo circulatorio, superponiendo el texto sobre los fotogramas.
- Triaje y monitorización de incidentes: el modelo describe escenas anómalas en la vía pública en lenguaje natural, lo que permite a un operador revisar alertas textuales en lugar de visionar horas de grabación.
- Análisis de tráfico multimodal: registro continuo de densidad de vehículos, flujo de peatones y actividad en pasos de cebra, integrable en sistemas de conteo y planificación urbana.
- Asistencia a operadores: preguntas y respuestas conversacionales sobre un feed de cámara en directo, usando el prompt en lenguaje natural para interrogar al modelo sobre lo que ocurre en la escena.
- Despliegue en borde sin GPU dedicada: al ejecutarse en CPU y NPU de Intel con cuantización de 4 bits, encaja en equipos de campo, cámaras inteligentes y pasarelas de borde con presupuesto térmico y energético limitado.
- Pipelines de vídeo con DLStreamer: integración del VLM como etapa de descripción dentro de un grafo GStreamer/DLStreamer sobre CPU o GPU, con el límite de prompt de 4096 tokens documentado en las pruebas de humo.
- Prototipado rápido de aplicaciones VLM: el script de descarga y los ejemplos de OpenVINO GenAI permiten tener un pipeline funcional sin exportar ni cuantizar el modelo localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma explícita; al tratarse de pesos INT4/NF4 de un modelo de 4.200 millones de parámetros, el peso de los pesos ronda los 2-3 GB, aunque el consumo real depende del runtime y de la longitud de contexto.
- Hardware soportado: OpenVINO GenAI sobre GPU, CPU y NPU de Intel; DLStreamer sobre GPU y CPU (sin soporte NPU en el ejemplo de DLStreamer).
- GPU recomendadas: no se especifican modelos concretos; el artefacto está orientado a GPU integradas Intel y aceleradores NPU, no a GPU discretas de datacenter.
- Cabe en hardware de consumo: sí, al estar diseñado para CPU y NPU de Intel; no se documentan requisitos para RTX 4090, A100 o H100.
- Opciones de despliegue: OpenVINO GenAI (`openvino_genai.VLMPipeline`) e Intel DLStreamer; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El ejemplo fija `max_new_tokens = 40` y `FRAME_STRIDE = 15` para generar descripciones periódicas, pero no se publican cifras de rendimiento.
- Requisitos de entorno: Python 3.11 o superior y FFmpeg para transcodificar el vídeo de muestra.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Phi-3.5-vision-instruct INT4 (OpenVINO) | 4.200 M | no disponible | OpenVINO IR, OpenVINO GenAI / DLStreamer | MIT | Objetivo: borde Intel (CPU/GPU/NPU), vídeo multi-fotograma |
| Phi-3.5-vision-instruct (Microsoft) | 4.200 M | no disponible | PyTorch / Transformers | MIT | Modelo base original, sin cuantizar |
| OpenVINO/Phi-3.5-vision-instruct-int4-ov | 4.200 M | no disponible | OpenVINO IR INT4 | MIT | Artefacto upstream del que depende este repositorio |
| OpenVINO/Phi-3.5-vision-instruct-nf4-ov | 4.200 M | no disponible | OpenVINO IR NF4 | MIT | Variante optimizada para NPU |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de otros fabricantes.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0.0 GB: el artefacto real se descarga desde los repositorios OpenVINO referenciados, no desde este repo.
- Idioma limitado al inglés según la etiqueta `language: en`; no se garantiza calidad en castellano.
- El ejemplo de DLStreamer no soporta NPU; solo el pipeline de OpenVINO GenAI puede usar la variante NF4 en NPU.
- El script de descarga requiere aprobación explícita antes de bajar modelo y vídeo, y depende de una pila de runtime concreta (se menciona una validación previa con el stack RC1).
- Las pruebas de humo en NPU con DLStreamer 2026.2.0 requirieron reconvertir el tokenizer IR y fijar `MAX_PROMPT_LEN=4096`, lo que indica fragilidad en la integración de versiones.
- Riesgo de alucinación inherente a los VLM: las descripciones generadas pueden inventar objetos, matrículas o comportamientos no presentes en la escena; no debe usarse como única fuente para decisiones de seguridad.
- Sesgos del modelo base no documentados en la información disponible.
- La licencia MIT se aplica al artefacto; conviene verificar por separado los términos del modelo base de Microsoft antes de un despliegue comercial.
- No se documentan capacidades de tool calling ni de agentes, por lo que no es adecuado para flujos que dependan de invocación de funciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/open-edge-platform/phi-3.5-vision-instruct-int4-ov-dls-sample
- Modelo base: https://huggingface.co/microsoft/Phi-3.5-vision-instruct
- Artefacto INT4 CPU/GPU: https://huggingface.co/OpenVINO/Phi-3.5-vision-instruct-int4-ov
- Artefacto NF4 para NPU: https://huggingface.co/OpenVINO/Phi-3.5-vision-instruct-nf4-ov
- Documentación de OpenVINO GenAI: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai.html
- FFmpeg: https://ffmpeg.org/
- Matriz de soporte de dispositivos y pruebas de humo NPU: referenciada en el README como `../DEVICE_SUPPORT_MATRIX.md` (no se proporciona URL absoluta)
