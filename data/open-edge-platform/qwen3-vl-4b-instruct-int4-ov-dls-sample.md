# open-edge-platform/qwen3-vl-4B-instruct-int4-ov-dls-sample

## Resumen

Qwen3-VL-4B-Instruct INT4 (OpenVINO) es una distribución optimizada del modelo vision-language Qwen3-VL-4B-Instruct de Alibaba, empaquetada por open-edge-platform (Intel) como artefacto OpenVINO IR ya cuantizado a INT4. El objetivo no es ofrecer un modelo nuevo, sino un pipeline listo para producción en hardware Intel (CPU, GPU y NPU) sin necesidad de exportación ni cuantización local. Se distribuye junto con un caso de uso completo de descripción de vídeo para ciudades inteligentes, con dos muestras ejecutables: una basada en OpenVINO GenAI y otra en Intel DLStreamer.

El modelo base es un transformer vision-language de 4B parámetros, diseñado por Alibaba para grounding visual denso, seguimiento de instrucciones y chat conversacional. Esta build concreta emplea pesos comprimidos a INT4 y se ejecuta mediante OpenVINO GenAI, lo que permite desplegarlo en equipos de borde sin GPU de datacenter.

Es relevante ahora porque cubre un hueco práctico: llevar un VLM de 4B a entornos de edge AI (vigilancia urbana, triaje de incidentes, análisis de tráfico) con un formato de pesos preconvertido y ejemplos funcionales de extremo a extremo. La licencia MIT del empaquetado y del modelo base facilita su uso comercial, aunque la model card solo declara soporte para inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (Qwen3-VL) |
| Parámetros totales | 4B (modelo base Qwen3-VL-4B-Instruct) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT4 (weight-compressed); variante INT4 group-wise para NPU |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (INT4); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3-VL-4B-Instruct es un transformer vision-language de Alibaba, con una arquitectura "vision-first" orientada a grounding visual denso, seguimiento de instrucciones y chat conversacional multimodal. Esta distribución no reentrena el modelo: parte de los pesos oficiales y los convierte a OpenVINO IR con cuantización INT4 de pesos, generando dos artefactos: uno para CPU/GPU (`OpenVINO/Qwen3-VL-4B-Instruct-int4-ov`) y otro optimizado para NPU con cuantización group-wise (`OpenVINO/Qwen3-VL-4B-Instruct-int4-gq-ov`).

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. La innovación técnica destacable de esta distribución es el empaquetado: IRs pre-exportados que eliminan el paso de exportación y cuantización local, más dos muestras de referencia (OpenVINO GenAI y DLStreamer) que procesan el mismo vídeo de tráfico urbano y superponen subtítulos generados sobre los fotogramas.

## Capacidades

- Descripción libre de contenido de vídeo a partir de un prompt en lenguaje natural (vehículos, peatones, flujo de tráfico).
- Comprensión de imagen y texto (pipeline `image-text-to-text`).
- Grounding visual denso y seguimiento de instrucciones del modelo base.
- Chat conversacional multimodal (hereda las capacidades de Qwen3-VL-4B-Instruct).
- Procesamiento de flujos de vídeo con muestreo por stride de fotogramas (la muestra usa `FRAME_STRIDE = 15`).
- Ejecución en CPU, GPU y NPU mediante OpenVINO GenAI; en DLStreamer, solo CPU y GPU.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: la model card declara únicamente inglés.

## Casos de uso

- Vigilancia de ciudad inteligente: el modelo recibe el stream de una cámara de tráfico y un prompt en lenguaje natural, y genera subtítulos continuos sobre vehículos, peatones y flujo de tráfico. Es adecuado porque el artefacto INT4 corre en hardware Intel de borde sin GPU de datacenter.
- Triaje y monitorización de incidentes: descripción automática de escenas anómalas en la vía pública, con salida textual que puede enrutarse a un sistema de alertas. La naturaleza conversacional permite refinar la consulta sobre el mismo flujo.
- Análisis de tráfico: registro multimodal de densidad de vehículos, flujo de peatones y actividad en pasos de cebra, aprovechando el muestreo por stride para cubrir clips largos con coste controlado.
- Asistencia a operadores: pregunta-respuesta visual sobre feeds de cámara en directo, donde el operador consulta en lenguaje natural qué ocurre en una intersección concreta.
- Despliegue en equipos de borde sin conectividad: al ejecutarse en CPU o NPU con OpenVINO GenAI, el modelo puede operar en gabinetes de campo o vehículos, sin depender de la nube.
- Integración en pipelines de vídeo con DLStreamer: la muestra de Intel DLStreamer permite insertar el VLM en una cadena GStreamer existente y superponer los subtítulos generados sobre los fotogramas procesados.
- Prototipado rápido de aplicaciones VLM: los IRs pre-exportados y los scripts de descarga (`export_and_quantize.sh`) permiten tener una demo funcional sin paso de conversión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con pesos INT4 de un modelo de 4B, la huella de pesos ronda los 2 GB, a lo que hay que sumar la caché KV y los tensores de visión (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no se especifican modelos concretos; la model card indica soporte para GPU Intel mediante OpenVINO GenAI y DLStreamer.
- Soporte en NPU: sí, mediante el artefacto `OpenVINO/Qwen3-VL-4B-Instruct-int4-gq-ov` y OpenVINO GenAI (no en DLStreamer).
- Soporte en CPU: sí, tanto en OpenVINO GenAI como en DLStreamer.
- Cabe en GPU de consumo: no disponible en la información proporcionada (no se listan modelos de consumo).
- Opciones de despliegue: OpenVINO GenAI (`openvino_genai.VLMPipeline`) e Intel DLStreamer. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La muestra limita la generación a `max_new_tokens = 40` por descripción y usa caché de compilación (`CACHE_DIR = "vlm_cache"`) en GPU.
- Requisitos de software: Python 3.11+ y FFmpeg. La validación previa se hizo con el stack de desarrollo RC1; el artefacto NPU pasó un smoke test con OpenVINO 2026.4.1 pero no con la imagen oficial de DLStreamer 2026.2.0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-VL-4B-Instruct INT4 (OpenVINO) | 4B | no disponible | OpenVINO IR INT4 / OpenVINO GenAI, DLStreamer | MIT | Hugging Face (open-edge-platform) |
| Qwen3-VL-4B-Instruct (base) | 4B | no disponible | safetensors / Transformers, PyTorch | no disponible en la información | Hugging Face (Qwen) |
| OpenVINO/Qwen3-VL-4B-Instruct-int4-ov | 4B | no disponible | OpenVINO IR INT4 / OpenVINO GenAI | no disponible en la información | Hugging Face (OpenVINO) |
| OpenVINO/Qwen3-VL-4B-Instruct-int4-gq-ov | 4B | no disponible | OpenVINO IR INT4 group-wise / OpenVINO GenAI (NPU) | no disponible en la información | Hugging Face (OpenVINO) |

## Limitaciones y advertencias

- La model card declara únicamente inglés; no hay evidencia de soporte multilingüe en esta build.
- El artefacto está pensado para descripción de vídeo en ciudades inteligentes; su rendimiento fuera de ese dominio no está documentado.
- Riesgo de alucinación inherente a los VLM: las descripciones generadas pueden incluir objetos o eventos no presentes en el fotograma, algo crítico en vigilancia.
- La muestra limita la generación a 40 tokens nuevos por descripción, lo que restringe la profundidad de los subtítulos.
- El artefacto NPU no funcionó con la imagen oficial de DLStreamer 2026.2.0; solo pasó el smoke test con OpenVINO 2026.4.1. El soporte NPU en DLStreamer no está incluido.
- La validación previa se realizó con el stack RC1, no con una versión estable.
- No se documentan sesgos específicos, longitud de contexto ni composición del dataset de entrenamiento del modelo base en la información disponible.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-VL-4B-Instruct, cuya licencia no se detalla en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-edge-platform/qwen3-vl-4B-instruct-int4-ov-dls-sample
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Artefacto INT4 CPU/GPU: https://huggingface.co/OpenVINO/Qwen3-VL-4B-Instruct-int4-ov
- Artefacto INT4 group-wise para NPU: https://huggingface.co/OpenVINO/Qwen3-VL-4B-Instruct-int4-gq-ov
- Documentación de OpenVINO GenAI: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai.html
- FFmpeg: https://ffmpeg.org/
