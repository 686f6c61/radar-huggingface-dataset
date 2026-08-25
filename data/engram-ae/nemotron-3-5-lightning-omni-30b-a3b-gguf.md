# engram-ae/Nemotron-3.5-Lightning-Omni-30B-A3B-GGUF

## Resumen

Nemotron-3.5-Lightning-Omni-30B-A3B-GGUF es una adaptación multimodal del modelo de agente de texto Nemotron 3.5 Lightning de NVIDIA, publicada por el usuario engram-ae. El modelo original es un LLM híbrido de 30.000 millones de parámetros (3.000 millones activos) con arquitectura Mamba-2 intercalada con capas MoE y atención, diseñado para ejecución de agentes de larga duración con llamadas a herramientas frecuentes. Esta versión le añade percepción visual y auditiva sin entrenamiento adicional: incorpora la torre de visión C-RADIO ViT-H y la torre de audio Parakeet FastConformer-XL, ambas extraídas del modelo Nemotron-3-Nano-Omni de NVIDIA, conectadas mediante un proyector unificado.

La relevancia de este modelo reside en que permite ejecutar un sistema multimodal completo (texto, imagen, audio y video) en hardware variado —desde Jetson hasta DGX Spark o centros de datos— usando llama.cpp y formatos GGUF cuantizados. Al compartir la geometría del backbone con el modelo para el que fueron entrenados los proyectores, la transferencia de percepción funciona de forma zero-shot, sin necesidad de fine-tuning. El video con banda sonora en una sola pasada está implementado pero se considera experimental, con limitaciones documentadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 + MoE + atención (backbone Nemotron 3.5 Lightning) con torres C-RADIO ViT-H (visión) y Parakeet FastConformer-XL (audio) |
| Parametros totales | 32.913.266.240 (incluye backbone, torres y proyector) |
| Parametros activos | 3.000 millones (solo backbone, MoE) |
| Longitud de contexto | 1.000.000 tokens (backbone) |
| Tipos de cuantizacion | Q3_K_M, IQ3_M, IQ4_XS, MXFP4_MOE, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (https://openmdw.ai/license/1-1/) |
| Formato de pesos | GGUF (safetensors disponible en el modelo base de NVIDIA) |

## Arquitectura y entrenamiento

El backbone es el modelo NVIDIA Nemotron 3.5 Lightning 30B-A3B, que emplea una arquitectura híbrida con capas intercaladas de Mamba-2 (estado espacial) y capas MoE con atención selectiva. Esta combinación permite un contexto de 1 millón de tokens con solo 3.000 millones de parámetros activos por token, optimizado para tareas de agente con llamadas frecuentes a herramientas y razonamiento multi-paso.

Las torres de percepción se transfieren del modelo Nemotron-3-Nano-Omni: C-RADIO ViT-H para visión (procesa imágenes y video por frames con parches temporales de 2 frames y poda de tokens EVS) y Parakeet FastConformer-XL para audio. El proyector unificado (mmproj-omni-vision-audio-v2-F16.gguf, 3.0 GB) conecta ambas torres al backbone. No se realizó ningún entrenamiento: la transferencia es zero-shot, aprovechando que Lightning comparte la geometría del backbone con el modelo donante. Los datos de entrenamiento del modelo base no se detallan en la información disponible.

## Capacidades

- Generación de texto y razonamiento multi-paso, incluyendo matemáticas y lógica (capacidades del backbone Lightning).
- Comprensión de imágenes: descripción, lectura de texto en pantalla, reconocimiento de formas y objetos.
- Comprensión de audio: transcripción de voz (ASR) y análisis de contenido auditivo.
- Comprensión de video: procesa secuencias de 2 a 64 frames, con lectura de texto y formas correcta en pruebas.
- Video con banda sonora en una sola pasada (experimental): procesa simultáneamente pista visual y audio, aunque el audio tiende a dominar la respuesta.
- Tool calling y function calling: el backbone está diseñado para agentes con llamadas a herramientas, validación de salidas y delegación a subagentes.
- Soporte de agentes y razonamiento multi-step: optimizado para ejecución de tareas largas con múltiples llamadas.
- Capacidades multilingües: no especificadas en la documentación disponible.

## Casos de uso

- Atención al cliente multimodal: el modelo puede gestionar conversaciones donde el usuario envía capturas de pantalla, mensajes de voz o vídeos cortos, combinando comprensión visual y auditiva con razonamiento de texto gracias a su contexto de 1M tokens.
- Transcripción y análisis de audio: con la torre Parakeet, puede transcribir reuniones, podcasts o mensajes de voz y generar resúmenes estructurados, útil en pipelines de documentación automática.
- Moderación de contenido visual: análisis de imágenes y video para detectar texto, objetos o escenas problemáticas, integrable en sistemas de revisión de contenido generado por usuarios.
- Agente de asistencia técnica con evidencia visual: un agente que recibe capturas de pantalla de errores o logs y razona sobre ellos para proponer soluciones, usando tool calling para ejecutar comandos o consultar documentación.
- Análisis de video vigilancia o material de archivo: procesamiento de clips para extraer información (texto en pantalla, objetos, eventos) con consultas en lenguaje natural, aprovechando la ventana de contexto larga.
- Asistente de accesibilidad: descripción de imágenes y audio para personas con discapacidad visual o auditiva, ejecutable en hardware de gama baja (Jetson) gracias a las cuantizaciones GGUF.
- Prototipado de aplicaciones multimodales: desarrollo rápido de demos o MVPs que necesitan entrada de imagen, audio y video sin infraestructura de servidores dedicados, usando llama.cpp en una workstation.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card documenta una prueba de transferencia de ASR medida en un clip de 38 palabras: el modelo donante Omni obtiene un 2,6 % de tasa de error por palabra (WER), mientras que esta versión zero-shot obtiene un 7,9 % (tres nombres propios, incluyendo uno que el donante también falla). Esta cifra corresponde a una prueba puntual, no a un benchmark estandarizado. Tampoco se proporcionan resultados de velocidad de decodificación en la información accesible.

## Requisitos de hardware

- VRAM estimada según cuantización (tamaños de archivo GGUF):
  - Q3_K_M: 20,7 GB
  - IQ3_M: 18,9 GB
  - IQ4_XS: 19,0 GB
  - MXFP4_MOE: 18,7 GB
  - Q4_K_M: 25,4 GB
  - Q5_K_M: 27,0 GB
  - Q6_K: 34,9 GB
  - Q8_0: 35,0 GB
  - Proyector unificado: 3,0 GB adicionales
- GPU recomendadas: DGX Spark (GB10) usada en las pruebas del autor; compatible con Jetson (Thor) y GPUs de datacenter. Para cuantizaciones Q4 y superiores se necesita al menos 24 GB de VRAM (p. ej., RTX 4090, RTX 6000 Ada). Las cuantizaciones Q3/IQ3 pueden caber en GPUs de 20 GB (p. ej., RTX 3080 Ti, RTX 3090).
- Opciones de despliegue: llama.cpp (llama-server) con el flag `--mmproj`; para video con Nemotron se requiere el fork `llama.cpp-omni` (binarios precompilados para Linux arm64 CUDA 13 disponibles en GitHub). También es posible usar vLLM o NIM con el modelo base de NVIDIA, pero no con las torres multimodales de este repo.
- Latencia y throughput: no se proporcionan cifras concretas en la información disponible. La velocidad de decodificación se midió en DGX Spark, pero no se publicó el valor.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|---|
| Nemotron-3.5-Lightning-Omni-30B-A3B (este repo) | 32,9B | 3B | 1M | texto, imagen, audio, video (exp.) | openmdw-1.1 | GGUF |
| NVIDIA Nemotron 3.5 Lightning 30B-A3B (base) | 30B | 3B | 1M | texto | openmdw-1.1 | safetensors, NVFP4 |
| NVIDIA Nemotron-3-Nano-Omni-30B-A3B-Reasoning | 30B (aprox.) | 3B | no disponible | texto, imagen, audio, video | openmdw-1.1 | safetensors |

La comparativa se limita a los modelos de la misma familia, ya que no se dispone de datos de otros modelos multimodales comparables (p. ej., Qwen2-VL, Llama 3.2 Vision) en la información proporcionada. La principal diferencia frente al base es la adición de torres de percepción sin entrenamiento; frente al Nano-Omni, este modelo usa el backbone Lightning (optimizado para agentes) en lugar del backbone de razonamiento del donante.

## Limitaciones y advertencias

- Video con banda sonora en una sola pasada es experimental: en pruebas, el audio domina la respuesta y el modelo reporta la imagen como negra cuando hay pista de audio. Se recomienda consultar video y audio por separado o eliminar la pista de audio para preguntas visuales.
- La transferencia zero-shot de las torres no está fine-tuneada: la calidad de ASR es inferior a la del modelo donante (7,9 % WER frente a 2,6 % en una prueba puntual).
- El video solo funciona con el fork `llama.cpp-omni`; el llama.cpp estándar no soporta el grafo temporal+EVS de Nemotron.
- Licencia openmdw-1.1: es una licencia de código abierto con condiciones específicas (revisar términos en https://openmdw.ai/license/1-1/), que puede incluir restricciones de uso comercial o atribución.
- No se documentan sesgos conocidos ni riesgos de alucinación específicos de esta versión; al ser un modelo multimodal sin entrenamiento adicional, puede heredar sesgos del backbone y de las torres.
- El tamaño del repositorio (293,7 GB) implica descargas grandes si se quieren todas las cuantizaciones; se recomienda descargar solo el archivo necesario.
- No se proporcionan datos de rendimiento en benchmarks estándar, por lo que la evaluación comparativa con otros modelos multimodales requiere pruebas propias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/engram-ae/Nemotron-3.5-Lightning-Omni-30B-A3B-GGUF
- Modelo base (NVIDIA): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Modelo donante de torres: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-Omni-30B-A3B-Reasoning
- Fork llama.cpp-omni (binarios): https://github.com/engram-ae/llama.cpp-omni/releases/tag/b10598
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Guía de ejecución local (Layer3Labs): https://www.layer3labs.io/guides/how-to-run-nemotron-3-5-lightning-locally
- Guía de ejecución local (MindStudio): https://www.mindstudio.ai/blog/run-nemotron-3-5-lightning-locally
- Documentación de Unsloth: https://unsloth.ai/docs/models/nemotron-3.5
