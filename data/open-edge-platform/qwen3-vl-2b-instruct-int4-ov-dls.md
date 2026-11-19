# open-edge-platform/qwen3-vl-2B-instruct-int4-ov-dls

## Resumen
Qwen3-VL-2B-Instruct INT4 (OpenVINO) es una exportación optimizada del modelo vision-language Qwen3-VL-2B-Instruct de Alibaba Qwen, preparada por open-edge-platform (Intel) para ejecución en hardware Intel mediante OpenVINO GenAI y DLStreamer. El modelo original es un transformer multimodal de 2.000 millones de parámetros que procesa pares imagen-texto y genera descripciones en lenguaje natural; esta variante aplica compresión de pesos a INT4 para reducir el espacio en disco y facilitar la inferencia en CPU Intel Core Ultra y GPU integrada.

El propósito de esta ficha es servir como referencia para desarrolladores que quieran desplegar un modelo de comprensión de vídeo e imagen en entornos de borde (edge), sin GPU dedicada, usando el stack OpenVINO. El artefacto exportado en formato IR ocupa aproximadamente 1,7 GiB en disco, y los ejemplos incluidos demuestran su uso tanto con la API Python de OpenVINO GenAI como con pipelines GStreamer de DLStreamer para anotar vídeo en tiempo real con subtítulos generados por el modelo.

La relevancia actual radica en la combinación de tres factores: un modelo base multimodal compacto, una cuantización agresiva a INT4 y un runtime optimizado para silicio Intel. Esto permite ejecutar comprensión de escenas visuales en equipos sin acelerador dedicado, algo impensable con modelos multimodales de mayor tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-language (hereda la arquitectura de Qwen3-VL-2B-Instruct) |
| Parametros totales | 2.000 millones (modelo base Qwen3-VL-2B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT4 (compresion de pesos); el script de exportacion acepta el argumento INT4 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (exportado desde pesos PyTorch/Safetensors del modelo base) |

## Arquitectura y entrenamiento
El modelo deriva directamente de Qwen/Qwen3-VL-2B-Instruct, un transformer multimodal de la familia Qwen3-VL que combina un encoder visual con un decoder de lenguaje para tareas image-text-to-text. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO en el modelo base.

La contribución específica de esta variante es el proceso de exportación y cuantización: mediante Optimum Intel 2.2.0, Transformers 5.0.0 y NNCF 3.4.0, los pesos originales se convierten a formato OpenVINO IR y se comprimen a INT4. El resultado se ejecuta con OpenVINO GenAI (VLMPipeline) o con el elemento `gvagenai` de DLStreamer, que permite integrar el modelo en pipelines GStreamer con control de frame-rate y chunk-size para procesamiento de vídeo por lotes de frames.

## Capacidades
- Generación de descripciones libres de escenas visuales (image captioning) a partir de frames de vídeo o imágenes individuales.
- Comprensión de vídeo mediante muestreo de frames (frame stride configurable) y generación de subtítulos superpuestos en la salida.
- Respuesta a prompts en lenguaje natural sobre el contenido visual (por ejemplo, "Describe the pedestrians, vehicles, and activity in this street scene").
- Pipeline image-text-to-text: acepta tensor de imagen RGB y prompt textual, devuelve texto generado.
- Integración con DLStreamer/GStreamer para procesamiento en streaming con metadatos adjuntos a los frames.
- Ejecución en CPU Intel Core Ultra y GPU integrada mediante OpenVINO.
- No se documentan en la información disponible capacidades de tool calling, agentes multi-step, audio o modo thinking explícito.

## Casos de uso
- Videovigilancia urbana en el borde: el modelo genera descripciones de peatones, vehículos y actividad en escenas callejeras, y el sample de DLStreamer superpone los subtítulos al vídeo de salida; es adecuado porque corre en CPU/GPU integrada Intel sin necesidad de servidor GPU.
- Anotación automática de datasets de vídeo: procesar frames con `FRAME_STRIDE` configurable para generar captions que sirvan como etiquetas preliminares en pipelines de entrenamiento de modelos de visión.
- Accesibilidad audiovisual: generar subtítulos descriptivos de contenido visual para personas con discapacidad visual, ejecutando el modelo localmente en equipos de escritorio Intel.
- Monitorización de tráfico en tiempo real: el pipeline GStreamer con `frame-rate=2` y `chunk-size=2` permite analizar flujos de cámara y emitir descripciones periódicas de la actividad viaria.
- Prototipado rápido de aplicaciones VLM en edge: el script `export_and_quantize.sh` y los samples Python permiten montar una demo funcional en minutos sobre hardware Intel consumer.
- Analítica de vídeo en retail o industria: describir escenas de tienda o planta para generar informes textuales automáticos de lo que ocurre en cámara, con despliegue en equipos sin GPU dedicada.
- Investigación en eficiencia de modelos multimodales: servir como baseline INT4/OpenVINO para comparar latencia y calidad frente a otras cuantizaciones del mismo modelo base.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad (MMLU, HumanEval, GSM8K, etc.) ni cifras de latencia o throughput medidas. El único dato de rendimiento implícito es el tamaño del IR exportado (~1,7 GiB en disco), que el autor aclara explícitamente que no equivale al requisito de memoria en ejecución.

## Requisitos de hardware
- VRAM/RAM estimada: no disponible de forma explícita; el IR en disco ocupa ~1,7 GiB. Al ser INT4 y ejecutarse en CPU/GPU integrada, el consumo de memoria será sensiblemente inferior al de los pesos originales en FP16, pero no se publica una cifra de memoria en runtime.
- GPU recomendadas: GPU integrada de Intel Core Ultra (el sample usa `DEVICE = "GPU"` con driver OpenCL de Intel). No se documenta soporte verificado para A100, H100 o RTX 4090.
- CPU: Intel Core Ultra con OpenVINO 2026.4.1; también ejecutable en CPU mediante `DEVICE = "CPU"` o `device=CPU` en DLStreamer.
- NPU: el autor indica que la imagen oficial de DLStreamer 2026.2.0 y la NPU no fueron probadas.
- Cabe en hardware consumer Intel (Core Ultra) sin GPU dedicada; no se confirma funcionamiento en GPUs NVIDIA.
- Opciones de despliegue: OpenVINO GenAI (VLMPipeline), DLStreamer 2026.2.0 nativo enlazado a OpenVINO/GenAI/Tokenizers 2026.4.1.0, y pipelines GStreamer con el elemento `gvagenai`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; los samples usan `max_new_tokens=40` y `frame-rate=2`, lo que sugiere procesamiento de captions cortos a unos 2 frames por segundo en el pipeline DLStreamer, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| open-edge-platform/qwen3-vl-2B-instruct-int4-ov-dls (este) | 2B | no disponible | MIT | OpenVINO IR, INT4, GenAI/DLStreamer | Optimizado para Intel Core Ultra CPU/GPU integrada |
| Qwen/Qwen3-VL-2B-Instruct (base) | 2B | no disponible | no disponible en la informacion | PyTorch/Safetensors | Modelo original sin cuantizar; requiere stack Transformers |
| Otras variantes Qwen3-VL de mayor tamano | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas; la comparativa se limita a parámetros, licencia y formato de despliegue.

## Limitaciones y advertencias
- La cuantización INT4 puede degradar la calidad de las descripciones frente al modelo base en FP16; no se publican evaluaciones comparativas de calidad.
- Riesgo de alucinación inherente a los modelos vision-language: puede describir objetos o actividades no presentes en el frame.
- No se documentan los idiomas soportados; el prompt de ejemplo está en inglés y no se confirma calidad en castellano u otros idiomas.
- Longitud de contexto no especificada; el sample limita `max_new_tokens` a 40, lo que restringe la longitud de las descripciones generadas.
- El pipeline DLStreamer puede no entregar metadatos de caption de inmediato en clips cortos, según advierte el autor.
- Solo se validaron CPU y GPU (Intel); NPU e imagen oficial DLStreamer 2026.2.0 no fueron probadas.
- Dependencias de versiones muy específicas: Optimum Intel 2.2.0, Transformers 5.0.0, NNCF 3.4.0, OpenVINO 2026.4.1; versiones más nuevas de Transformers pueden ser rechazadas por Optimum.
- Licencia MIT permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3-VL-2B-Instruct, que no se detalla en la información proporcionada.
- El repositorio registra 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/open-edge-platform/qwen3-vl-2B-instruct-int4-ov-dls
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Repositorio de OpenVINO: https://github.com/openvinotoolkit/openvino
- OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai
- DLStreamer: https://github.com/open-edge-platform/dlstreamer
- Optimum Intel: https://github.com/huggingface/optimum-intel
- NNCF: https://github.com/openvinotoolkit/nncf
