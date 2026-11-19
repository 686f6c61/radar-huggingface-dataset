# open-edge-platform/qwen3-vl-4B-instruct-int4-ov-dls

## Resumen

Qwen3-VL-4B-Instruct INT4 (OpenVINO) es una distribución pre-cuantizada y pre-exportada del modelo vision-language Qwen3-VL-4B-Instruct de Alibaba, publicada por open-edge-platform (Intel) en formato OpenVINO IR. El artefacto empaqueta el modelo base en precisión INT4 con compresión de pesos para su ejecución en CPU, GPU y NPU mediante OpenVINO GenAI y DLStreamer, sin necesidad de exportación ni cuantización local. El repositorio se presenta como un "sample" orientado a un caso de uso concreto: descripción en lenguaje natural de vídeo de vigilancia urbana (smart city, metro).

El modelo resuelve el problema de desplegar un VLM de 4B parámetros en hardware de borde (edge), donde no hay GPU de datacenter disponible. La cuantización INT4 reduce el peso en memoria lo suficiente para ejecutarse en CPU y NPU de equipos Intel, y la integración con DLStreamer permite procesar flujos de vídeo en tiempo real superponiendo subtítulos descriptivos sobre los fotogramas.

Es relevante ahora porque demuestra un pipeline completo y reproducible de VLM en el borde para tareas de videovigilancia y análisis de tráfico, con artefactos separados para CPU/GPU y para NPU, y con scripts de descarga y ejemplos funcionales incluidos en el propio repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (Qwen3-VL, arquitectura vision-first según model card) |
| Parametros totales | 4B (según nombre del modelo base Qwen3-VL-4B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (weight-compressed); variante INT4-gq optimizada para NPU |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (pre-exportado); no incluye safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen3-VL-4B-Instruct de Alibaba, un transformer vision-language descrito en la model card como "dedicated vision-first architecture fine-tuned specifically for dense visual grounding, instruction following, and conversational chat". Esta distribución no reentrena ni modifica los pesos: parte del artefacto ya cuantizado `OpenVINO/Qwen3-VL-4B-Instruct-int4-ov` (CPU/GPU) y ofrece una variante NPU `OpenVINO/Qwen3-VL-4B-Instruct-int4-gq-ov`.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO. La innovación técnica de esta publicación no está en el modelo sino en el empaquetado: exportación a OpenVINO IR con cuantización INT4 de pesos, integración con OpenVINO GenAI (pipeline `VLMPipeline`) y con Intel DLStreamer para procesamiento de vídeo con superposición de subtítulos. El sample procesa vídeo con un `FRAME_STRIDE` configurable (15 por defecto) y `max_new_tokens` de 40 en la configuración de ejemplo.

## Capacidades

- Generación de descripciones en texto libre de contenido de vídeo e imagen a partir de un prompt en lenguaje natural.
- Comprensión visual: identificación de vehículos, peatones, flujo de tráfico y actividad en escenas urbanas.
- Visual grounding denso e instruction following, según la model card del modelo base.
- Conversational chat y visual question answering sobre fotogramas de cámara.
- Procesamiento de flujos de vídeo con muestreo por stride de fotogramas.
- Ejecución en CPU, GPU y NPU mediante OpenVINO GenAI; DLStreamer limitado a CPU y GPU.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-step: no disponible en la información proporcionada.
- Multilingüe: solo inglés (`en`) declarado.

## Casos de uso

- Vigilancia smart city en tiempo real: el modelo recibe fotogramas de una cámara de tráfico y genera subtítulos continuos describiendo vehículos, peatones y flujo circulatorio, con la salida superpuesta sobre el vídeo mediante DLStreamer.
- Triaje y monitorización de incidentes: descripción automática de eventos anómalos en escenas de calle, útil para que un operador revise rápidamente lo ocurrido sin visionar el clip completo.
- Análisis de tráfico multimodal: registro en lenguaje natural de densidad de vehículos, flujo de peatones y actividad en pasos de cebra, que puede indexarse o agregarse para informes.
- Asistencia a operadores de metro: question answering visual conversacional sobre feeds de cámara en directo, permitiendo preguntar en lenguaje natural qué ocurre en una estación.
- Despliegue en edge sin GPU de datacenter: al ejecutarse en CPU y NPU Intel con INT4, encaja en equipos de borde en estaciones o cabinas donde no hay aceleradores dedicados.
- Prototipado rápido de pipelines VLM: los scripts `export_and_quantize.sh` y `openvino_sample.py` permiten validar un pipeline de vídeo-a-texto en minutos sin exportar ni cuantizar el modelo.
- Integración en pipelines de vídeo existentes: DLStreamer permite conectar el VLM a fuentes RTSP o ficheros dentro de una arquitectura GStreamer ya desplegada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/peso en memoria: no disponible de forma explícita; al ser INT4 con compresión de pesos sobre un modelo de 4B, el artefacto es sustancialmente menor que la versión en FP16, pero no se publica la cifra exacta en la información proporcionada.
- Hardware soportado: OpenVINO GenAI sobre GPU, CPU y NPU Intel; DLStreamer sobre GPU y CPU.
- NPU: requiere el artefacto separado `OpenVINO/Qwen3-VL-4B-Instruct-int4-gq-ov` y establecer `DEVICE = "NPU"` en el sample.
- GPU de consumo: no se especifican modelos concretos (RTX 4090, etc.) en la información disponible.
- Despliegue: OpenVINO GenAI (`openvino_genai.VLMPipeline`) e Intel DLStreamer. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Dependencias: Python 3.11+, FFmpeg para transcodificar el vídeo de ejemplo, OpenCV.
- Latencia y throughput: no disponibles. El sample usa `FRAME_STRIDE = 15` y `max_new_tokens = 40`, lo que sugiere un modo de inferencia periódica más que por fotograma.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| open-edge-platform/qwen3-vl-4B-instruct-int4-ov-dls | 4B | no disponible | OpenVINO IR INT4 | MIT | Sample de smart city con DLStreamer |
| OpenVINO/Qwen3-VL-4B-Instruct-int4-ov | 4B | no disponible | OpenVINO IR INT4 | no disponible | Artefacto base CPU/GPU del que deriva este |
| OpenVINO/Qwen3-VL-4B-Instruct-int4-gq-ov | 4B | no disponible | OpenVINO IR INT4-gq | no disponible | Variante optimizada para NPU |
| Qwen/Qwen3-VL-4B-Instruct | 4B | no disponible | PyTorch/Transformers | no disponible | Modelo base original de Alibaba |

## Limitaciones y advertencias

- Solo se declara soporte de inglés; no hay evidencia de capacidades multilingües en esta distribución.
- Es un artefacto de tipo "sample" orientado a un caso de uso concreto (descripción de vídeo smart city); no está pensado como distribución general del modelo.
- La model card advierte que la validación previa se hizo con el stack de desarrollo RC1; el artefacto NPU pasó un smoke test con OpenVINO 2026.4.1 pero no con la imagen oficial de DLStreamer 2026.2.0.
- DLStreamer no soporta NPU en este sample; solo CPU y GPU.
- Riesgo de alucinación inherente a los VLM: las descripciones generadas pueden incluir objetos o eventos no presentes en el fotograma.
- Sesgos: no se documentan sesgos específicos en la información disponible; al tratarse de un modelo base de Alibaba, hereda los sesgos de su entrenamiento.
- Uso comercial: la licencia del artefacto es MIT, pero conviene verificar la licencia del modelo base Qwen3-VL-4B-Instruct, que no se detalla en la información proporcionada.
- El repositorio figura con 0.0 GB de tamaño y 0 descargas, lo que sugiere que los pesos se descargan desde los repositorios OpenVINO referenciados, no desde este.
- No se publican cifras de latencia, throughput ni benchmarks, lo que dificulta estimar el rendimiento en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/open-edge-platform/qwen3-vl-4B-instruct-int4-ov-dls
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Artefacto INT4 CPU/GPU: https://huggingface.co/OpenVINO/Qwen3-VL-4B-Instruct-int4-ov
- Artefacto INT4-gq NPU: https://huggingface.co/OpenVINO/Qwen3-VL-4B-Instruct-int4-gq-ov
- Documentación OpenVINO GenAI: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai.html
- FFmpeg: https://ffmpeg.org/
