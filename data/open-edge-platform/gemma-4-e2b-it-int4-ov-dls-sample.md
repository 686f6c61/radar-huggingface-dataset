# open-edge-platform/gemma-4-e2b-it-int4-ov-dls-sample

## Resumen
Gemma-4-E2B-it INT4 (OpenVINO) es una distribución del modelo vision-language Gemma-4-E2B-it de Google, reempaquetada por el equipo open-edge-platform de Intel como artefacto listo para inferencia con OpenVINO GenAI y DLStreamer. El modelo base es un VLM de la familia Gemma 4 orientado a razonamiento multimodal en cliente (AI PCs y dispositivos de borde), y esta versión concreta está cuantizada a INT4 para reducir el consumo de memoria y permitir ejecución en CPU, GPU y NPU de hardware Intel.

El repositorio no contiene los pesos originales en formato PyTorch, sino un OpenVINO IR pre-exportado y pre-cuantizado, acompañado de scripts de descarga, un sample de inferencia sobre vídeo y una integración con el elemento `gvagenai` de DLStreamer. El caso de uso declarado es la descripción en lenguaje natural de escenas de tráfico urbano procedentes de cámaras de videovigilancia (smart city), con superposición de subtítulos generados sobre los fotogramas.

Es relevante ahora porque ejemplifica el patrón de despliegue de VLMs en el borde sin GPU de datacenter: cuantización INT4, motores OpenVINO y soporte de aceleradores integrados (NPU de Intel). El repo tiene un tamaño reportado de 0,0 GB y no registra descargas ni likes en el momento de la consulta, lo que sugiere un artefacto de muestra más orientado a demostración que a consumo general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (transformer multimodal, familia Gemma 4 edge client) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (weight-compressed); artefactos separados para CPU/GPU y NPU optimizado |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (pre-exportado, sin necesidad de exportación o cuantización local) |

## Arquitectura y entrenamiento
El artefacto deriva de `google/gemma-4-E2B-it`, descrito por el autor como un modelo vision-language de Google con arquitectura "edge client" pensada para razonamiento multimodal eficiente en AI PCs. La información disponible no detalla el número de parámetros, la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron etapas de RLHF o DPO. Tampoco se especifica si el modelo base emplea atención lineal, decodificación especulativa u otras innovaciones de inferencia.

El trabajo técnico de este repositorio se concentra en el pipeline de despliegue: conversión a OpenVINO IR y cuantización INT4 de los pesos, con dos variantes (una para CPU/GPU y otra optimizada para NPU con `OpenVINO/gemma-4-E2B-it-int4-cw-ov`). El sample incluye lógica para re-convertir `openvino_tokenizer` y `openvino_detokenizer` con la versión activa de OpenVINO Tokenizers cuando el tokenizador empaquetado es más reciente que el runtime, evitando el fallo del elemento `gvagenai` al cargar el tokenizador.

## Capacidades
- Comprensión de imagen y vídeo con generación de texto libre: el modelo recibe fotogramas de vídeo junto a un prompt en lenguaje natural y produce descripciones continuas de la escena.
- Descripción de escenas urbanas: vehículos, peatones, flujo de tráfico, pasos de peatones e intersecciones.
- Procesamiento de flujo de vídeo por muestreo de fotogramas (el sample usa un `FRAME_STRIDE` de 15) con generación periódica de subtítulos superpuestos sobre los fotogramas.
- Conversational visual question answering sobre cámaras en directo, según los casos de uso declarados en la model card.
- Integración con DLStreamer mediante el elemento `gvagenai` para pipelines de vídeo.
- Ejecución en CPU, GPU y NPU de Intel mediante OpenVINO GenAI.
- Idioma: únicamente inglés (`en`).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-step en la información disponible.

## Casos de uso
- Vigilancia de smart city: el modelo se conecta a una cámara de tráfico y genera descripciones en lenguaje natural de la escena cada N fotogramas, permitiendo a operadores revisar eventos sin inspección visual continua.
- Triaje y monitorización de incidentes: al describir automáticamente escenas anómalas (por ejemplo, congestión o presencia inusual de peatones en calzada), el sistema puede priorizar la revisión humana sobre los fotogramas relevantes.
- Análisis de tráfico: registro multimodal de densidad de vehículos, flujo de peatones y actividad en pasos de peatones, con texto asociado a cada intervalo del vídeo.
- Asistencia a operadores: preguntas y respuestas visuales sobre feeds de cámara en directo, usando el modelo como capa conversacional sobre el vídeo.
- Despliegue en AI PCs y equipos de borde: al ser un artefacto INT4 con OpenVINO, puede ejecutarse en CPU, GPU integrada o NPU sin GPU de datacenter, lo que encaja en instalaciones locales de videovigilancia.
- Pipelines de vídeo con DLStreamer: integración del VLM como etapa de descripción dentro de un pipeline GStreamer/DLStreamer existente, reutilizando la infraestructura de ingestión y overlay ya desplegada.
- Prototipado y demostración: el repositorio incluye un vídeo de prueba de 10 segundos y scripts de descarga, lo que permite validar el stack OpenVINO GenAI y DLStreamer antes de integrarlo en un sistema mayor.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible; el artefacto es INT4 (weight-compressed) y está pensado para reducir el consumo de memoria, pero no se publican cifras concretas.
- Aceleradores soportados: OpenVINO GenAI sobre GPU, CPU y NPU de Intel; DLStreamer sobre GPU y CPU.
- La variante NPU requiere el artefacto `OpenVINO/gemma-4-E2B-it-int4-cw-ov` y se selecciona con `DEVICE = "NPU"` en `openvino_sample.py`. El sample de DLStreamer no soporta NPU; el artefacto NPU pasó un smoke test separado con OpenVINO 2026.4.1, pero no con la imagen oficial de DLStreamer 2026.2.0.
- Requisitos de software: Python 3.11 o superior y FFmpeg para transcribir el vídeo de muestra.
- Opciones de despliegue: OpenVINO GenAI (`VLMPipeline`) y DLStreamer (`gvagenai`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-E2B-it-int4-ov-dls-sample (este repo) | no disponible | no disponible | OpenVINO IR INT4, sample DLStreamer | MIT | Hugging Face, 0 descargas |
| OpenVINO/gemma-4-E2B-it-int4-ov | no disponible | no disponible | OpenVINO IR INT4 para CPU/GPU | no disponible en la información | Hugging Face |
| OpenVINO/gemma-4-E2B-it-int4-cw-ov | no disponible | no disponible | OpenVINO IR INT4 optimizado para NPU | no disponible en la información | Hugging Face |
| google/gemma-4-E2B-it | no disponible | no disponible | Pesos PyTorch/Transformers | no disponible en la información | Hugging Face |

## Limitaciones y advertencias
- El modelo solo declara soporte de inglés (`en`); no se documentan capacidades multilingües.
- No se publican parámetros totales, longitud de contexto ni resultados de benchmarks, lo que impide evaluar su calidad frente a alternativas.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño reportado de 0,0 GB; conviene verificar la integridad de los artefactos antes de usarlo en producción.
- El artefacto está pre-exportado y pre-cuantizado: no requiere exportación local, pero cualquier cambio de runtime o tokenizador puede exigir reconversión (el propio sample re-convierte el tokenizador si es más reciente que OpenVINO).
- El soporte NPU es parcial: OpenVINO GenAI puede usar NPU con el artefacto específico, pero DLStreamer sigue limitado a CPU/GPU y el smoke test NPU no pasó con la imagen oficial de DLStreamer 2026.2.0.
- La validación previa se hizo con el stack de desarrollo RC1; la matriz de dispositivos y los runtimes publicados deben consultarse antes de elegir el runtime.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas; al ser un modelo de descripción de escenas, las descripciones generadas pueden omitir o malinterpretar elementos del fotograma.
- Uso comercial: la licencia del repositorio es MIT, pero la licencia del modelo base `google/gemma-4-E2B-it` no se detalla en la información disponible y debe verificarse por separado.
- El caso de videovigilancia implica consideraciones legales y de privacidad (tratamiento de imágenes de personas) que no cubre la model card.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/open-edge-platform/gemma-4-E2B-it-int4-ov-dls-sample
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Artefacto INT4 CPU/GPU: https://huggingface.co/OpenVINO/gemma-4-E2B-it-int4-ov
- Artefacto INT4 optimizado para NPU: https://huggingface.co/OpenVINO/gemma-4-E2B-it-int4-cw-ov
- Documentación de OpenVINO GenAI: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai.html
- FFmpeg: https://ffmpeg.org/
