# OnlyTextLLMs/Qwen3.8-27B-OnlyText-GGUF

## Resumen

Qwen3.8-27B-OnlyText-GGUF es una derivada cuantizada en formato GGUF del modelo Qwen/Qwen3.8-27B, publicada por el usuario OnlyTextLLMs en Hugging Face. El modelo original, desarrollado por el equipo Qwen, es un LLM de 27 320 millones de parámetros con una arquitectura híbrida que combina 48 capas de atención lineal Gated-DeltaNet con 16 capas de atención completa. Esta variante elimina los componentes de visión y audio del modelo base, dejando únicamente las capacidades de texto, y además incorpora el cabezal de predicción multi-token (MTP) embebido directamente en el archivo GGUF, lo que permite activar decodificación especulativa sin necesidad de un archivo de borrador separado.

La relevancia de este modelo radica en que ofrece una versión solo texto de un LLM de 27B con licencia Apache 2.0, cuantizada en tres niveles (Q4_K_M, Q6_K y Q8_0) y optimizada para ejecución local en hardware de consumo o estaciones de trabajo. Al incluir el MTP en el propio archivo, simplifica el despliegue y mejora el rendimiento de generación entre 1,5 y 2 veces respecto a la inferencia sin decodificación especulativa, según los datos publicados. Está pensado para desarrolladores que necesitan un modelo conversacional y de razonamiento con soporte para herramientas, ejecutable en una sola GPU o en configuraciones de doble GPU mediante llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 48 capas Gated-DeltaNet (atención lineal) + 16 capas de atención completa, hidden 5120, vocabulario 248302, arquitectura GGUF `qwen35` |
| Parametros totales | 27 320 513 536 (27,32B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; fuentes externas indican 262 144 tokens para el modelo base Qwen3.8-27B |
| Tipos de cuantizacion | Q4_K_M (16,8 GB), Q6_K (22,4 GB), Q8_0 (29,0 GB) |
| Idiomas soportados | Inglés (según la model card; el modelo base Qwen3.8-27B es multilingüe, pero esta derivada solo declara `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos `.gguf` con MTP embebido) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina capas de atención lineal Gated-DeltaNet con capas de atención completa tradicionales, en una proporción de 48 a 16. Esta mezcla busca equilibrar la eficiencia computacional de la atención lineal con la capacidad de modelado de contexto largo de la atención completa. El tokenizador original se ha modificado para eliminar los tokens de visión y audio, conservando 15 tokens especiales de texto (EOS en el id 248046).

Esta derivada no ha recibido ningún entrenamiento adicional: los pesos son exactamente los del modelo original, solo se han eliminado las modalidades no textuales y se ha realizado la conversión a GGUF mediante `convert_hf_to_gguf.py` y posterior cuantización con `llama-quantize`. La innovación principal es la inclusión del cabezal MTP (Multi-Token Prediction) dentro del propio archivo GGUF, activado por el convertidor con `nextn_predict_layers = 1`. Esto permite usar decodificación especulativa con llama.cpp (versión 2026-05-16 o posterior) mediante el parámetro `--spec-type draft-mtp`, sin necesidad de un archivo de borrador separado. Según los datos publicados, el MTP proporciona una aceleración de generación de aproximadamente 1,5 a 2 veces sin pérdida de precisión a temperatura 0.

## Capacidades

- Generación de texto conversacional y de razonamiento, heredadas del modelo base Qwen3.8-27B.
- Modo de pensamiento (thinking mode) activado por defecto en la plantilla de chat, con `reasoning_effort: xhigh`; puede desactivarse para respuestas directas más rápidas.
- Soporte de tool calling y function calling, así como capacidades de agente multi-paso, propias de la serie Qwen3.8.
- Capacidades multilingües del modelo base, aunque esta derivada solo declara inglés en su model card.
- Decodificación especulativa MTP integrada, que acelera la generación sin archivos adicionales.
- Sin capacidades de visión ni audio: los tokens correspondientes han sido eliminados del tokenizador.

## Casos de uso

- Asistentes conversacionales locales: el modelo puede ejecutarse en una GPU de consumo (por ejemplo, RTX 4090 con 24 GB) usando la cuantización Q4_K_M, ofreciendo un asistente de chat con razonamiento profundo y sin depender de servicios en la nube.
- Generación de código en entornos de desarrollo: gracias al soporte de tool calling y a su capacidad de razonamiento, puede integrarse en editores o pipelines de CI/CD para autocompletar, revisar o generar fragmentos de código, manteniendo la privacidad del código al ejecutarse localmente.
- Atención al cliente automatizada: con una ventana de contexto amplia (262k según fuentes externas), puede gestionar conversaciones multi-turno largas, resumir historiales de tickets y proporcionar respuestas coherentes en inglés.
- Análisis y resumen de documentos de texto: al ser solo texto, es adecuado para procesar informes, artículos o contratos, extrayendo información clave y generando resúmenes ejecutivos.
- Agentes autónomos de investigación: su capacidad de razonamiento multi-paso y tool calling permite construir agentes que consultan APIs, buscan información y sintetizan resultados, ejecutables en hardware local con doble GPU.
- Prototipado de aplicaciones de IA generativa: al ser Apache 2.0 y estar disponible en GGUF, permite experimentar con arquitecturas de agentes, sistemas RAG o chatbots sin coste de licencia y con despliegue sencillo mediante llama-server o Ollama.

## Benchmarks y rendimiento

La model card incluye mediciones propias realizadas el 2026-08-24 en hardware AMD (2× Radeon AI PRO R9700, 34 GB cada una) con llama.cpp compilado para HIP/ROCm. Los resultados de generación (tok/s) y prefill (tokens/s) son los siguientes:

| Quant | Dispositivo | Generación sin MTP (tok/s) | Prefill PP512 (t/s) | Generación con MTP (mejor tok/s) |
|---|---|---|---|---|
| Q4_K_M | R9700 individual | 27,3 | 1035 | 42,7 (MTP n=3) |
| Q6_K | R9700 individual | 24,0 | 660 | 44,0 (MTP n=2) |
| Q8_0 | R9700 individual | 19,8 | 1222 | 43,6 (MTP n=4) |
| Q4_K_M | Doble R9700 (layer-split) | 23,9 | 869 | 39,8 (MTP n=3) |
| Q6_K | Doble R9700 (layer-split) | 22,0 | 545 | 39,6 (MTP n=2) |
| Q8_0 | Doble R9700 (layer-split) | 19,0 | 1110 | 41,5 (MTP n=4) |

La model card también cita baselines externos para comparar: 51,8 tok/s en una sola R9700 con MTP=2 vía Vulkan en Windows (blog de AMD), 24,5 tok/s en Ryzen AI Max+ 395 con MTP=4, y 17,4 tok/s de decodificación para Qwen3.6-27B Q4_K_M sin MTP en la misma GPU. No se proporcionan resultados de benchmarks académicos estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: Q4_K_M requiere aproximadamente 16,8 GB, Q6_K unos 22,4 GB y Q8_0 unos 29,0 GB, más overhead de contexto y KV cache.
- GPU recomendadas: AMD Radeon AI PRO R9700 (34 GB) en configuraciones de una o dos GPUs; también se mencionan Ryzen AI Max+ 395 (Strix Halo) y RTX 5090 en los baselines citados.
- En GPU de consumo: la cuantización Q4_K_M cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto moderado; Q6_K requiere al menos 24 GB con contexto reducido o 32 GB para mayor comodidad; Q8_0 necesita 32 GB o más.
- Opciones de despliegue: llama.cpp (llama-server y llama-cli), compatible con Ollama y LM Studio al ser GGUF estándar. Se requiere una versión de llama.cpp posterior al 2026-05-16 (commit `4f13cb7`) para activar el MTP.
- Latencia y throughput: los valores de la tabla de benchmarks indican entre 19 y 27 tok/s sin MTP y entre 39 y 44 tok/s con MTP en R9700, dependiendo de la cuantización y la configuración de GPUs.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento (R9700, Q4_K_M) |
|---|---|---|---|---|---|
| Qwen3.8-27B-OnlyText-GGUF (este) | 27,32B | No disponible (262k según fuentes) | Apache 2.0 | GGUF con MTP | 27,3 tok/s sin MTP, 42,7 tok/s con MTP |
| Qwen3.6-27B (GGUF, sin MTP) | ~27B | No disponible | Apache 2.0 | GGUF | 17,4 tok/s decode (según willitrunai) |
| Qwen3.6-27B (GGUF, con MTP) | ~27B | No disponible | Apache 2.0 | GGUF | 21,2 tok/s con MTP n=3 (según calebcoffie) |
| Qwen3.8-27B (multimodal original) | 27,32B | 262k | Apache 2.0 | safetensors | No comparable directamente (requiere más VRAM) |

La principal diferencia frente a Qwen3.6-27B es la arquitectura híbrida Gated-DeltaNet y la inclusión del MTP embebido, que simplifica el despliegue y mejora el rendimiento de generación. Frente al modelo original multimodal, esta versión reduce el tamaño y elimina la necesidad de procesar entradas de visión o audio, siendo más ligera para tareas puramente textuales.

## Limitaciones y advertencias

- Es una versión solo texto: no admite entradas de imagen, vídeo ni audio, a diferencia del modelo base Qwen3.8-27B.
- La model card solo declara inglés como idioma soportado; aunque el modelo base es multilingüe, esta derivada no garantiza el mismo rendimiento en otros idiomas.
- El modo de pensamiento está activado por defecto con `reasoning_effort: xhigh`, lo que puede generar respuestas muy largas y lentas si no se desactiva explícitamente.
- Requiere una versión reciente de llama.cpp (posterior a 2026-05-16) para aprovechar el MTP; con versiones anteriores, el modelo funcionará sin decodificación especulativa.
- Al ser una cuantización sin entrenamiento adicional, puede presentar pérdidas menores de precisión respecto al modelo en punto flotante, especialmente en Q4_K_M.
- Riesgo de alucinación y sesgos heredados del modelo base Qwen3.8-27B; no se han realizado evaluaciones específicas de seguridad en esta derivada.
- El tamaño del repositorio es de 68,3 GB (incluye los tres archivos de cuantización), lo que requiere espacio de almacenamiento considerable.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/OnlyTextLLMs/Qwen3.8-27B-OnlyText-GGUF
- Modelo base (safetensors): https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Blog de AMD sobre ejecución de Qwen 3.8 27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Referencia de rendimiento en willitrunai: https://willitrunai.com/can-run/qwen-3.6-27b-on-radeon-ai-pro-r9700-32gb
- Benchmark de MTP en Strix Halo: https://calebcoffie.com/blog/benchmarking-llama-cpp-mtp-on-strix-halo
- Model card de DavidAU con MTP GGUF: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- GGUF de unsloth para Qwen3.8-27B: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Guía de ejecución local en yottalabs.ai: https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Guía de ejecución local en mindstudio.ai: https://www.mindstudio.ai/blog/qwen3-8-27b-local-gguf-setup
