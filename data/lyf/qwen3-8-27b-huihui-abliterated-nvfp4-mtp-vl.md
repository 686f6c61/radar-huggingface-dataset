# lyf/Qwen3.8-27B-Huihui-Abliterated-NVFP4-MTP-VL

## Resumen

Este modelo es una versión cuantizada en NVFP4 W4A4 del checkpoint `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, una variante "abliterated" del Qwen3.8-27B de Alibaba. El autor, lyf, ha aplicado una compresión de 4 bits a las capas lineales del modelo de lenguaje, manteniendo en BF16 la torre de visión/vídeo (333 tensores) y el cabezal MTP (15 tensores) para permitir decodificación especulativa. El resultado es un modelo multimodal de 27 000 millones de parámetros que cabe en una GPU consumer como la RTX 5090 con unos 29 GB de VRAM en generación.

La relevancia de esta release reside en que combina tres elementos: un modelo base con capacidades avanzadas de razonamiento, visión y tool calling; una cuantización NVFP4 optimizada para hardware Blackwell; y un cabezal MTP que acelera la generación mediante predicción multi-token. Está empaquetado con compressed-tensors y validado con vLLM, lo que facilita su despliegue en entornos de inferencia local. Al ser una variante abliterated, se han eliminado ciertos mecanismos de rechazo del modelo original, lo que lo hace útil para investigación en comportamiento de modelos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (Qwen3.8-27B base), con torre de visión/vídeo BF16 y cabezal MTP BF16 |
| Parametros totales | 27 781 427 952 (según safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens (modelo base); en esta versión cuantizada depende de la VRAM disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (group size 16) en capas lineales del LM; BF16 en visión/vídeo, MTP, lm_head, embeddings y GDN conv1d |
| Idiomas soportados | Inglés y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors `nvfp4-pack-quantized`) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal denso de 27 000 millones de parámetros desarrollado por Alibaba, diseñado para procesar entradas de imagen, vídeo y texto. La variante `huihui-ai/Huihui-Qwen3.8-27B-abliterated` elimina ciertos mecanismos de rechazo del modelo original, lo que modifica su comportamiento en escenarios donde el modelo base se negaría a responder. La cuantización NVFP4 aplicada por lyf utiliza compressed-tensors con un grupo de 16, calibrada con el dataset CNN/DailyMail 3.0.0 (20 × 8192 tokens). Se conservan íntegros en BF16 la torre de visión/vídeo (333 tensores), el cabezal MTP (15 tensores) y las capas de embedding y salida, lo que preserva la calidad perceptiva y habilita la decodificación especulativa nativa. No se han injertado pesos de otras variantes (Qwen oficial, Unsloth, Blackfrost, etc.), según el manifiesto de construcción.

## Capacidades

- Entrada multimodal: procesa imágenes y vídeo, además de texto, y genera respuestas textuales.
- Generación de texto y razonamiento: hereda las capacidades del Qwen3.8-27B, que destaca en tareas de razonamiento complejo y codificación.
- Tool calling / function calling: soportado según las etiquetas del modelo, útil para integrar APIs y herramientas externas.
- Razonamiento multi-step y flujos agénticos: el modelo base está optimizado para agentes y automatización de oficina.
- Decodificación especulativa MTP: el cabezal MTP permite predecir múltiples tokens por paso, acelerando la generación.
- Conversacional: diseñado para diálogos multi-turno.
- Multilingüe: inglés y chino.

## Casos de uso

- Inferencia local en GPU consumer: con la cuantización NVFP4 y el perfil de vLLM validado, el modelo se ejecuta en una RTX 5090 con ~29 GB de VRAM, permitiendo desplegar un multimodal de 27B en un equipo de escritorio.
- Análisis de imágenes y vídeo en tiempo real: la torre de visión/vídeo en BF16 conserva la calidad perceptiva, adecuada para tareas de captioning, VQA y clasificación visual en entornos locales.
- Agentes autónomos con tool calling: el modelo puede orquestar llamadas a funciones y razonar sobre los resultados, útil para automatización de tareas de oficina y flujos de trabajo agénticos.
- Generación de código asistida: el modelo base sobresale en codificación; esta versión cuantizada permite ejecutarla en hardware de consumo para autocompletado y revisión de código.
- Investigación en comportamiento de modelos: al ser abliterated, es útil para estudiar los efectos de eliminar mecanismos de rechazo y para experimentos de alineación.
- Prototipado rápido de aplicaciones multimodales: gracias al empaquetado con compressed-tensors y la compatibilidad con vLLM, se puede integrar en pipelines de desarrollo con una API OpenAI-compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión cuantizada. Los datos siguientes corresponden al modelo base Qwen3.8-27B, según la guía de lovableapp.org:

| Benchmark | Resultado (modelo base) |
|---|---|
| DeepSWE | 42.2 |
| Terminal Bench | 73.0 |
| OSWorld | 84.3 |

Datos de validación de esta release (según la model card, medidos en una RTX 5090 con vLLM):

| Métrica | Valor |
|---|---|
| Tasa de aceptación MTP | 42.0 % |
| Longitud media aceptada | 2.33 tokens |
| Aceptación por posición | 0.602 / 0.429 / 0.295 |
| Tiempo para 1024 tokens de salida | 10.73 s |
| VRAM en generación | ~28 944 MiB |

## Requisitos de hardware

- VRAM estimada: ~28 944 MiB en generación con contexto corto (4096 tokens) y una sola secuencia.
- GPU recomendada: RTX 5090 (Blackwell, sm120) validada; se requiere soporte NVFP4 y CUDA 13.0 para el perfil de vLLM descrito.
- En GPU consumer: cabe en una RTX 5090; no se garantiza en GPUs de generaciones anteriores sin soporte NVFP4.
- Opciones de despliegue: vLLM (imagen `vllm/vllm-openai:qwen38-x86_64-cu130`), con configuración específica para MTP y NVFP4; también puede usarse con transformers y compressed-tensors.
- Latencia: 10.73 s para 1024 tokens de salida con MTP activado, lo que equivale a ~95 tokens/s en ese perfil.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| lyf/Qwen3.8-27B-Huihui-Abliterated-NVFP4-MTP-VL (este) | 27.78B | 262K (base) | NVFP4 W4A4 + BF16 parcial | Apache 2.0 | Abliterated, MTP, visión/vídeo BF16 |
| lyf/Qwen3.8-27B-Blackfrost-Abliterated-NVFP4-MTP-VL | 27.78B | 262K (base) | NVFP4 W4A4 + BF16 parcial | Apache 2.0 | Variante con pesos de Blackfrost, misma estructura |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27.78B | 262K | BF16 (original) | Apache 2.0 | Modelo base sin cuantizar, abliterated |
| Qwen/Qwen3.8-27B (base oficial) | 27.78B | 262K | BF16 | Apache 2.0 | Modelo original de Alibaba, sin abliteración |

## Limitaciones y advertencias

- Al ser una versión abliterated, se han eliminado mecanismos de rechazo; puede generar contenido inapropiado, ofensivo o no seguro en contextos no moderados.
- La cuantización NVFP4 W4A4 puede introducir una ligera degradación en la calidad de generación respecto al modelo BF16 original, especialmente en tareas de razonamiento complejo.
- Solo soporta inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- El contexto máximo de 262K tokens es teórico; en la práctica, la VRAM disponible limita la longitud de contexto útil (el perfil validado usa 4096 tokens).
- Requiere hardware Blackwell (sm120) y CUDA 13.0 para el flujo de vLLM recomendado; no es compatible con GPUs más antiguas.
- El modelo se publicó recientemente y no tiene descargas ni validación comunitaria; pueden existir problemas no detectados en otros entornos.
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable del cumplimiento de políticas de uso y de la naturaleza abliterated del modelo.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/lyf/Qwen3.8-27B-Huihui-Abliterated-NVFP4-MTP-VL
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Repositorio GitHub del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guía sobre Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
- Documentación de Cloudflare AI: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
- Variante similar con pesos Blackfrost: https://huggingface.co/lyf/Qwen3.8-27B-Blackfrost-Abliterated-NVFP4-MTP-VL
