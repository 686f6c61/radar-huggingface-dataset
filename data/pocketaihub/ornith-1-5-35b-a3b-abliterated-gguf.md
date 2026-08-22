# PocketAiHub/Ornith-1.5-35B-A3B-Abliterated-GGUF

## Resumen

Ornith-1.5-35B-A3B-Abliterated-GGUF es una conversión a formato GGUF de un derivado del modelo Ornith-1.5-35B-A3B, un modelo de lenguaje multimodal de tipo mezcla de expertos (MoE) desarrollado por Ornith AI. Este derivado, publicado por PocketAI Hub, aplica una técnica de "abliteración" que elimina la dirección de rechazo aprendida en el modelo original, reduciendo la probabilidad de que el modelo se niegue a responder a peticiones dañinas. El modelo base activa aproximadamente 3 mil millones de parámetros por token (de un total de 35 mil millones), lo que lo hace eficiente en cómputo y adecuado para ejecución local en hardware consumer.

El modelo es multimodal, capaz de procesar imágenes y texto, y está optimizado para tareas de razonamiento y generación de código. La versión GGUF aquí documentada incluye tres cuantizaciones (Q4_K_M, Q8_0 y BF16) y un proyector de visión compartido. La abliteración no modifica los pesos de visión, por lo que el proyector es el original. El modelo base declara licencia MIT, y esta derivación mantiene la misma licencia. La relevancia actual radica en que ofrece una alternativa de alto rendimiento con bajo coste de inferencia, aunque la versión abliterada conlleva riesgos de seguridad importantes que deben evaluarse antes de su uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen 3.5 MoE, con módulo de visión (proyector) |
| Parámetros totales | 34.660.610.688 (35B) |
| Parámetros activos | ~3.000.000.000 (3B) por token |
| Longitud de contexto | No disponible (no especificado en la información proporcionada) |
| Tipos de cuantización | Q4_K_M, Q8_0, BF16 (formato GGUF) |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | MIT |
| Formato de pesos | GGUF (con safetensors originales en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B emplea una arquitectura de mezcla de expertos (MoE) con activación de 3B parámetros por token, inspirada en la familia Qwen 3.5 MoE. El diseño incluye un proyector de visión que permite procesar imágenes junto con texto, y un mecanismo de decodificación especulativa (MTP) que no se ha incluido en esta versión GGUF. El entrenamiento del modelo base se basa en un marco de "self-scaffolding" y "self-improvement": el modelo propone nuevas tareas, genera andamios específicos para ellas y produce rollouts de soluciones para aprendizaje por refuerzo, creando un bucle continuo de mejora. No se han publicado detalles específicos sobre el volumen de datos de entrenamiento ni la composición del dataset en la información proporcionada.

La versión abliterada modifica el comportamiento del modelo mediante una edición de dirección de rechazo: se midió una dirección proyectada "dañino vs. inofensivo" a partir de 256 pares de prompts, y se aplicó a las capas 15-39 con escala 1.0, modificando 75 tensores físicos y 6.450 caminos lógicos de expertos. Esta edición elimina la tendencia a rechazar peticiones, pero no mejora la veracidad ni la seguridad.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo tareas de lógica y matemáticas.
- Generación de código y asistencia en programación, con soporte para múltiples lenguajes.
- Multimodal: puede procesar imágenes y responder a preguntas sobre ellas mediante el proyector de visión.
- Soporte de agentes y tareas de razonamiento multi-paso, según la web oficial del modelo.
- Modo de pensamiento ("thinking") disponible en el modelo base; la versión GGUF permite activarlo o desactivarlo (en la prueba de comportamiento se usó con thinking deshabilitado).
- No se ha confirmado soporte de tool calling o function calling en la información proporcionada, aunque es probable por su naturaleza.

## Casos de uso

- **Asistente de programación en local**: gracias a su activación de solo 3B parámetros por token, puede ejecutarse en una GPU consumer (por ejemplo, RTX 4090 con cuantización Q4_K_M) y ofrecer autocompletado y explicación de código con baja latencia.
- **Análisis de imágenes en entornos aislados**: el proyector de visión permite extraer información de capturas de pantalla, diagramas o fotografías sin enviar datos a la nube, útil para entornos con requisitos de privacidad.
- **Chatbots de atención al cliente**: su capacidad de razonamiento multi-turno permite mantener conversaciones coherentes, aunque se debe controlar la abliteración para evitar respuestas inapropiadas.
- **Generación de documentación técnica**: el modelo puede resumir y redactar explicaciones de código, funciones o arquitecturas de software.
- **Prototipado de agentes de razonamiento**: al soportar razonamiento multi-step y agentes, puede emplearse en sistemas de automatización de tareas complejas (por ejemplo, análisis de logs, planificación de tareas).
- **Investigación en seguridad**: la versión abliterada puede ser útil para estudiar el comportamiento de los modelos cuando se elimina la alineación de rechazo, siempre dentro de un entorno controlado y con fines académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información proporcionada. El modelo base supera en benchmarks de codificación y agentes a modelos similares como Qwen 3.6-35B, Gemma 4-31B y Muse Glimmer-30B según la web oficial de Ornith, pero no se incluyen cifras concretas. La versión abliterada no incluye evaluaciones de rendimiento en tareas estándar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- **VRAM estimada**: para la cuantización Q4_K_M (19,71 GiB) se requiere al menos 20-24 GiB de VRAM para inferencia completa en GPU (con overhead). La versión Q8_0 (34,37 GiB) requiere aproximadamente 36-40 GiB, y la BF16 (64,61 GiB) supera los 64 GiB.
- **GPU recomendadas**: RTX 4090 (24 GB) puede ejecutar Q4_K_M con offloading parcial o completo. Para Q8_0 se recomienda una GPU con 48 GB o más, como A6000 o H100. La versión BF16 es adecuada solo para servidores con múltiples GPUs.
- **Compatibilidad con consumer**: sí, la versión Q4_K_M cabe en una RTX 3090/4090 de 24 GB.
- **Opciones de despliegue**: llama.cpp (llama-cli para texto, llama-mtmd-cli para visión), también compatible con Ollama y otros frontend que soporten GGUF.
- **Latencia y throughput**: no se dispone de datos medidos en la información proporcionada. La activación de 3B parámetros por token reduce el coste computacional en comparación con modelos densos del mismo tamaño total.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
| --- | ---: | ---: | ---: | --- | --- |
| Ornith-1.5-35B-A3B (base) | 35B | 3B | no disponible | MIT | Hugging Face |
| Qwen 3.6-35B | 35B | no disponible | no disponible | Apache 2.0 (probable) | Hugging Face |
| Gemma 4-31B | 31B | 31B (denso) | no disponible | Gemma license | Hugging Face |
| Muse Glimmer-30B | 30B | no disponible | no disponible | no disponible | Hugging Face |

Según la web de Ornith, Ornith-1.5-35B-A3B supera a Qwen 3.6-35B en todos los benchmarks de codificación y agentes, y supera a los densos Gemma 4-31B y Muse Glimmer-30B por amplio margen. No se dispone de cifras concretas en la información proporcionada.

## Limitaciones y advertencias

- **Riesgo de contenido dañino**: la abliteración suprime el comportamiento de rechazo, por lo que el modelo puede generar contenido ilegal, ofensivo, engañoso o peligrosamente incorrecto con mayor facilidad que el modelo original. No debe usarse en producción sin medidas de control externas.
- **Alucinaciones**: el modelo no está entrenado para ser veraz; la abliteración no corrige la factualidad, por lo que puede producir información incorrecta con confianza.
- **Idioma**: solo se declara soporte para inglés; el rendimiento en otros idiomas no está garantizado.
- **Contexto**: la longitud de contexto máxima no está especificada en la información proporcionada. El ejemplo de uso emplea `-c 4096`, pero el modelo base podría soportar contextos mayores; no se puede confirmar.
- **Sin MTP**: la versión GGUF no incluye la cabeza de decodificación especulativa nativa, lo que puede reducir la velocidad de generación en comparación con el modelo original.
- **Licencia**: MIT permite uso comercial, pero la naturaleza abliterada puede implicar riesgos legales y éticos adicionales si se distribuye o utiliza en aplicaciones públicas.

## Enlaces

- [Modelo en Hugging Face (PocketAiHub/Ornith-1.5-35B-A3B-Abliterated-GGUF)](https://huggingface.co/PocketAiHub/Ornith-1.5-35B-A3B-Abliterated-GGUF)
- [Modelo base original (ornith-ai/Ornith-1.5-35B-A3B)](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B)
- [GGUF del modelo base (ornith-ai/Ornith-1.5-35B-A3B-GGUF)](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF)
- [Página oficial de Ornith-1.5](https://ornith.ai/ornith_1_5.html)
- [Resumen en aimodels.fyi](https://www.aimodels.fyi/models/huggingFace/ornith-1.5-35b-a3b-gguf-ornith-ai)
- [Docker Hub de Ornith-1.5](https://hub.docker.com/r/ai/ornith-1.5)
