# mlx-community/LFM3-VL-2B-OptiQ-4bit

## Resumen

LFM3-VL-2B-OptiQ-4bit es una cuantización mixta de precisión del modelo vision-language LFM3-VL-2B de Liquid AI, publicada por la comunidad mlx-community y construida con la herramienta mlx-optiq. El modelo base combina el backbone de lenguaje LFM3 (24 capas con convoluciones cortas y atención) con una torre de visión, y acepta entradas de imagen y texto para producir respuestas en texto. Esta versión reduce el peso en disco de 3,9 GB en bf16 a 1,7 GB manteniendo una ventana de contexto de 128k tokens.

La relevancia de esta ficha está en que permite ejecutar un modelo multimodal de forma local en Apple Silicon sin PyTorch ni servicios en la nube, con un endpoint compatible con las APIs de OpenAI y Anthropic. La cuantización no es uniforme: OptiQ mide la sensibilidad de cada matriz de pesos y asigna 8 bits a las 75 matrices más sensibles (de 153 totales) y 4 bits al resto, mientras la torre de visión se mantiene en bf16 en un fichero sidecar.

El modelo está pensado para despliegues on-device en Mac con chip de la serie M, y su modo de razonamiento por defecto implica que genera una cadena de pensamiento antes de responder. Con 1.728.801.536 parámetros reales en safetensors, se sitúa en la categoría de modelos pequeños multimodales, adecuado para prototipado, automatización local y tareas de visión-lenguaje con requisitos de privacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `lfm3_vl`: LFM3 (24 capas: 13 convolución, 5 atención de ventana deslizante de 256 tokens, 6 atención completa) más torre de visión |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128k tokens |
| Tipos de cuantizacion | Mixta 4/8 bits (OptiQ, dirigida por sensibilidad); torre de visión en bf16 |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (other) |
| Formato de pesos | safetensors (MLX), con sidecar `optiq_vision.safetensors` y `kv_config.json` |

## Arquitectura y entrenamiento

El backbone de lenguaje LFM3 usa una arquitectura híbrida de 24 capas que combina 13 capas de convolución corta, 5 capas de atención de ventana deslizante de 256 tokens y 6 capas de atención completa. Esta mezcla implica que solo 6 de las 24 capas mantienen una caché KV de longitud completa, lo que reduce el coste de memoria en contextos largos. Sobre este backbone se añade una torre de visión que procesa las imágenes y las proyecta al espacio del modelo de lenguaje. La cuantización OptiQ conserva en 8 bits las 75 matrices de pesos cuya cuantización altera más la salida (de 153 totales) y aplica 4 bits al resto, partiendo de una referencia en bf16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base usó RLHF o DPO. La model card indica que el modelo razona antes de responder por defecto, y que Liquid recomienda una configuración de muestreo concreta (temperatura 0.1, top_k 50, repetition_penalty 1.1) que se incluye en `generation_config.json`. La innovación destacable de esta publicación es el propio método OptiQ de cuantización dirigida por sensibilidad y la caché KV de precisión mixta configurada en `kv_config.json`.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento previo a la respuesta (thinking mode) activado por defecto.
- Comprensión de imágenes y respuesta en texto (pipeline image-text-to-text).
- Razonamiento matemático y resolución de problemas tipo GSM8K.
- Generación de código y paso de tests unitarios (HumanEval).
- Seguimiento de instrucciones estrictas (IFEval).
- Tool calling y function calling, con soporte para llamadas simples (BFCL-V3).
- Recuperación en contexto largo (HashHop), aunque con resultados muy bajos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Servicio mediante endpoint compatible con OpenAI y Anthropic, con prompt caching.

## Casos de uso

- Asistente local de análisis de imágenes en Mac: el modelo recibe una imagen como parte de contenido `image_url` y genera una descripción o respuesta textual, ejecutándose íntegramente en el dispositivo sin enviar datos a la nube.
- Automatización de soporte con capturas de pantalla: un flujo de atención al cliente puede adjuntar capturas de error y el modelo responde con diagnóstico y pasos de resolución, aprovechando el contexto de 128k para incluir historial e imágenes en la misma conversación.
- Extracción de información de documentos escaneados: con tool calling, el modelo puede invocar funciones para estructurar datos extraídos de facturas o formularios, integrándose en un pipeline local.
- Generación de código asistida en el IDE: con HumanEval pass@1 de 55,5% en esta cuantización, es viable para autocompletado y generación de funciones en entornos de desarrollo sobre Apple Silicon.
- Razonamiento matemático en herramientas educativas: el modo de razonamiento previo y el 83,2% en GSM8K lo hacen adecuado para resolver problemas paso a paso en una aplicación de tutoría local.
- Prototipado de agentes multimodales: el endpoint compatible con OpenAI permite conectar el modelo a frameworks de agentes existentes y probar flujos multi-step con imágenes y llamadas a herramientas.
- Evaluación de privacidad y cumplimiento: al ejecutarse on-device con pesos de 1,7 GB, permite procesar imágenes sensibles en entornos donde no se permite el envío a APIs externas.

## Benchmarks y rendimiento

Resultados publicados en la model card (media de seis métricas, en modo razonamiento, comparados con una cuantización uniforme de 4 bits del mismo modelo):

| Metrica | OptiQ 4/8-bit | Uniforme 4-bit |
|---|---:|---:|
| MMLU (generativo) | 68,9% | 70,6% |
| GSM8K | 83,2% | 76,4% |
| IFEval (estricto) | 44,4% | 35,7% |
| BFCL-V3 simple (200 llamadas) | 91,0% | 90,5% |
| HumanEval (164 problemas, pass@1) | 55,5% | 43,9% |
| HashHop (recuperación en contexto largo) | 3,0% | 0,0% |
| **Capability Score** (media de 6) | **57,67** | **52,85** |

La cuantización OptiQ supera a la uniforme de 4 bits en 4,8 puntos globales, con las mayores ganancias en código (+11,6), seguimiento de instrucciones (+8,7) y matemáticas (+6,8). En MMLU, sin embargo, la uniforme de 4 bits obtiene 1,7 puntos más. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM/espacio en disco: 1,7 GB para los pesos cuantizados (frente a 3,9 GB en bf16), más el sidecar de visión en bf16 y la caché KV.
- Hardware objetivo: Apple Silicon (Mac con chip de la serie M); la librería es MLX, no compatible con CUDA.
- GPU recomendadas: no aplica GPU dedicada; se ejecuta en la GPU integrada de los chips M de Apple. No se especifican modelos concretos de chip.
- Cabe en hardware de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente; no se indica el mínimo exacto.
- Opciones de despliegue: `mlx-optiq` (`optiq serve`), que expone un endpoint compatible con OpenAI y Anthropic con soporte de imágenes, tool calling y prompt caching.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-VL-2B-OptiQ-4bit (esta ficha) | 1.728.801.536 | 128k | lfm1.0 | safetensors MLX | Cuantización mixta 4/8 bits, on-device Apple Silicon |
| LiquidAI/LFM3-VL-2B (base) | no disponible | 128k | lfm1.0 | safetensors | Referencia bf16, 3,9 GB en disco |
| Cuantización uniforme 4-bit del mismo modelo | no disponible | 128k | lfm1.0 | no disponible | Baseline de la model card; Capability Score 52,85 |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La licencia lfm1.0 es de tipo "other" y puede imponer restricciones al uso comercial; es necesario revisar los términos en el enlace oficial antes de desplegar en producción.
- El rendimiento en recuperación de contexto largo es muy bajo (HashHop 3,0%), por lo que no es fiable para tareas que dependan de localizar información en ventanas de 128k.
- IFEval estricto de 44,4% indica un seguimiento de instrucciones limitado en formatos estrictos.
- MMLU cae 1,7 puntos respecto a la cuantización uniforme de 4 bits, lo que sugiere cierta pérdida de conocimiento general por la cuantización mixta.
- El modo de razonamiento por defecto consume tokens adicionales; es necesario ajustar `max_tokens` generosamente y puede aumentar la latencia.
- Riesgo de alucinación inherente a modelos de este tamaño; no se han publicado evaluaciones específicas de sesgo.
- Idiomas soportados no documentados; no se garantiza un rendimiento adecuado en castellano.
- Dependencia exclusiva de Apple Silicon y de la librería MLX; no es desplegable en GPU NVIDIA sin conversión.
- Modelo con muy poca adopción (120 descargas, 0 likes) y publicado recientemente; la validación comunitaria es escasa.

## Enlaces

- [HuggingFace: mlx-community/LFM3-VL-2B-OptiQ-4bit](https://huggingface.co/mlx-community/LFM3-VL-2B-OptiQ-4bit)
- [Modelo base: LiquidAI/LFM3-VL-2B](https://huggingface.co/LiquidAI/LFM3-VL-2B)
- [Sitio del proyecto mlx-optiq](https://mlx-optiq.com/)
- [Todos los quants OptiQ](https://mlx-optiq.com/models)
- [Documentación de mlx-optiq](https://mlx-optiq.com/docs/)
- [PyPI: mlx-optiq](https://pypi.org/project/mlx-optiq/)
- [Licencia LFM](https://www.liquid.ai/lfm-license)
