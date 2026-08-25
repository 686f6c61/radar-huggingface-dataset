# maanka2/Audio8-TTS-Preview-0.1b-Pruned

## Resumen

Audio8 TTS Preview 0.1B es un modelo de síntesis de voz (text-to-speech) multilingüe con clonación de voz zero-shot, desarrollado por Audio8 AI. Esta versión concreta, publicada por el usuario maanka2, es una variante podada (*pruned*) del checkpoint original de 0.1B, diseñada para reducir aún más el footprint del modelo manteniendo las capacidades esenciales de generación de habla y clonación de voz sin ejemplos previos.

El modelo emplea una arquitectura híbrida autoregresiva de dos ramas (lenta y rápida) sobre un codec neuronal propio, con un tamaño total de aproximadamente 120 millones de parámetros en los pesos safetensors incluidos en este repositorio. Soporta ocho idiomas, con chino e inglés como lenguas principales y seis más en fase experimental. Su principal atractivo es ofrecer clonación de voz zero-shot con un coste computacional muy reducido, lo que lo hace viable en hardware de consumo y en entornos con recursos limitados.

La relevancia actual de este modelo radica en la tendencia hacia sistemas TTS compactos que no sacrifican en exceso la calidad. Frente a alternativas que superan los 4.000 millones de parámetros, Audio8 0.1B demuestra que es posible obtener resultados aceptables con una fracción del tamaño, abriendo la puerta a despliegues en edge, aplicaciones en tiempo real y proyectos de código abierto con requisitos modestos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio8 Falcon H1 (slow AR + fast AR) con codec neuronal integrado |
| Parametros totales | 120.211.008 (según safetensors; el modelo original reporta ~170M para el generador principal y ~120M para el codec decoder) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 posiciones empaquetadas de texto/audio |
| Tipos de cuantizacion | No disponible (no se especifican cuantizaciones oficiales) |
| Idiomas soportados | Chino, inglés (primarios); alemán, español, francés, italiano, japonés, coreano (experimental) |
| Licencia | audio8-community-license-v1.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura Audio8 Falcon H1, que combina dos ramas autoregresivas: una rama lenta (*slow AR*) de 24 capas con ancho 512, 8 cabezas de atención y 2 cabezas KV, que predice tokens semánticos; y una rama rápida (*fast AR*) de 4 capas con las mismas dimensiones, que predice los codebooks del codec condicionados al estado oculto de la rama lenta. El codec neuronal trabaja a 44.1 kHz con 2048 muestras por frame (~21.5 frames por segundo) y utiliza 10 codebooks de 4096 entradas cada uno. El decodificador del codec, de aproximadamente 120M parámetros, se incluye en el repositorio, por lo que no se requiere un checkpoint adicional.

No se han publicado detalles específicos sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. La model card menciona un pipeline de SFT independiente para el ajuste multilingüe, pero no se ofrecen cifras concretas. La innovación principal reside en la combinación de un modelo generativo compacto con un codec eficiente, logrando un stack completo de generación de audio muy inferior en tamaño a otros sistemas TTS multilingües modernos.

## Capacidades

- Generación de voz a partir de texto en ocho idiomas, con calidad primaria en chino e inglés.
- Clonación de voz zero-shot: a partir de un audio de referencia y su transcripción, el modelo replica la voz sin necesidad de fine-tuning.
- Síntesis sin clonación: si se omiten los parámetros de referencia, genera voz con una identidad por defecto.
- Soporte de inferencia por lotes con códigos de referencia pre-codificados (según la documentación del repositorio de entrenamiento).
- Integración con Transformers mediante código remoto (`trust_remote_code=True`), lo que facilita su uso en pipelines existentes.
- Capacidad de procesar contexto de hasta 2048 posiciones, suficiente para frases largas o párrafos.
- No se mencionan capacidades de tool calling, agentes ni razonamiento multimodal; es un modelo exclusivamente de audio.

## Casos de uso

- **Asistentes de voz en dispositivos edge**: gracias a su tamaño reducido (~120M parámetros), puede ejecutarse en Raspberry Pi o en GPUs de baja gama para generar respuestas habladas en tiempo real.
- **Doblaje automático de contenido**: la clonación zero-shot permite doblar vídeos o podcasts usando la voz de un locutor original a partir de unas pocas muestras de audio.
- **Audiolibros personalizados**: un usuario puede clonar su propia voz o la de un narrador preferido para generar audiolibros con una entonación consistente.
- **Sistemas de respuesta interactiva en centros de llamadas**: el modelo puede generar respuestas en varios idiomas con una voz clonada de un agente, reduciendo la fatiga vocal y permitiendo escalar el servicio.
- **Herramientas de accesibilidad**: conversión de texto a voz para personas con discapacidad visual o dificultades de lectura, con la opción de usar una voz familiar.
- **Prototipado rápido de productos TTS**: al ser ligero y de código abierto, permite a desarrolladores integrar síntesis de voz en aplicaciones móviles o web sin depender de APIs comerciales costosas.

## Benchmarks y rendimiento

La model card del modelo original (Audio8/Audio8-TTS-Preview-0.1b) publica una comparativa de tasas de error (WER/CER) en el conjunto Common Voice 3, donde valores más bajos indican mejor inteligibilidad. Estos datos corresponden al checkpoint original, no específicamente a la versión podada de maanka2, pero sirven como referencia orientativa.

| Modelo | Parámetros | zh | en | ja | ko | de | es | fr | it |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| **Audio8 TTS Preview 0.1B** | ~0.17B | 3.619 | 3.307 | 12.322 | 7.653 | 5.292 | 8.548 | 12.349 | 14.480 |
| Audio8 TTS Preview 0.6B | 0.6B | **3.205** | **3.128** | 7.205 | 4.223 | 3.447 | 3.641 | 8.790 | 4.790 |
| Fish S2 Pro | 4.6B | 3.600 | 3.493 | 5.139 | **4.111** | 3.605 | 2.972 | **8.600** | 4.229 |
| Higgs Audio v2 | 4.7B | 3.378 | 3.404 | **4.742** | 4.260 | **3.300** | **2.929** | 9.425 | **3.555** |
| CosyVoice3-1.5B | 1.5B | 3.91 | 4.99 | 7.57 | — | — | — | — | — |

No se han publicado métricas de similitud de voz (SIM) en la información disponible. La tabla muestra que el modelo de 0.1B es competitivo en chino e inglés, pero pierde precisión en idiomas experimentales como francés o italiano, donde los modelos más grandes obtienen mejores resultados.

## Requisitos de hardware

- **VRAM estimada**: con 120M parámetros en bfloat16, el peso del modelo ocupa aproximadamente 240 MB. Sumando el codec decoder y los buffers de activación, se estima un consumo total de entre 1 y 2 GB de VRAM para inferencia en secuencias cortas.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente. Ejemplos: NVIDIA GTX 1650, RTX 2060, RTX 3050, o incluso GPUs integradas con soporte CUDA. Para mayor velocidad, una RTX 3060 o superior ofrece latencias muy bajas.
- **Compatibilidad con hardware de consumo**: sí, cabe en GPUs de gama de entrada y en sistemas con menos de 4 GB de VRAM.
- **Opciones de despliegue**: al ser un modelo de Transformers con código remoto, puede ejecutarse con la librería `transformers` directamente. También es compatible con entornos que soporten PyTorch y CUDA. No se menciona soporte nativo para vLLM, llama.cpp u Ollama, pero al ser un modelo pequeño podría adaptarse.
- **Latencia y throughput**: no se han publicado mediciones oficiales. Dado el tamaño, se espera una generación de audio en tiempo real o más rápida en GPUs modernas, aunque la rama autoregresiva lenta puede ser el cuello de botella.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| **Audio8 TTS Preview 0.1B (pruned)** | ~120M (safetensors) | 2048 | 8 (2 primarios) | audio8-community-license-v1.0 | safetensors |
| Audio8 TTS Preview 0.6B | ~0.6B | 2048 | 8 | audio8-community-license-v1.0 | safetensors |
| CosyVoice3 | ~1.5B | No disponible | Multilingüe | No disponible | No disponible |
| Fish S2 Pro | ~4.6B | No disponible | Multilingüe | No disponible | No disponible |

La comparativa se basa en los datos de la model card. El modelo de 0.1B es significativamente más pequeño que sus alternativas, lo que lo hace atractivo para despliegues ligeros, aunque con una calidad inferior en idiomas no primarios. La licencia comunitaria permite uso comercial bajo los términos específicos de Audio8, que deben revisarse en el enlace proporcionado.

## Limitaciones y advertencias

- **Calidad desigual entre idiomas**: el rendimiento en chino e inglés es notablemente mejor que en los seis idiomas experimentales, donde la tasa de error puede duplicarse o triplicarse (por ejemplo, 14.48% en italiano frente a 3.31% en inglés).
- **Riesgo de alucinación**: como todo modelo autoregresivo, puede generar contenido no deseado o incoherente en entradas ambiguas o con ruido en el audio de referencia.
- **Dependencia de la transcripción de referencia**: en clonación zero-shot, la precisión de la transcripción del audio de referencia es crítica; errores en esta transcripción degradan la calidad de la clonación.
- **Contexto limitado**: la ventana de 2048 posiciones puede ser insuficiente para textos muy largos, requiriendo segmentación.
- **Licencia**: la `audio8-community-license-v1.0` tiene términos específicos que deben revisarse antes de uso comercial; no es una licencia de código abierto estándar (como Apache o MIT).
- **Versión podada**: este repositorio de maanka2 es una variante *pruned* no oficial; no hay garantía de que mantenga exactamente las mismas capacidades que el checkpoint original de Audio8.
- **Sin soporte de cuantización oficial**: no se proporcionan versiones GGUF o cuantizadas, lo que puede limitar su uso en CPU pura.

## Enlaces

- [HuggingFace - maanka2/Audio8-TTS-Preview-0.1b-Pruned](https://huggingface.co/maanka2/Audio8-TTS-Preview-0.1b-Pruned)
- [HuggingFace - Audio8/Audio8-TTS-Preview-0.1b (original)](https://huggingface.co/Audio8/Audio8-TTS-Preview-0.1b)
- [GitHub - Audio8-AI/Audio8_TTS](https://github.com/Audio8-AI/Audio8_TTS)
- [Demo de audio - Audio8 TTS 0.1B](https://audio8-ai.github.io/Audio8_TTS/0.1B/)
- [Licencia del modelo](https://huggingface.co/Audio8/Audio8-TTS-Preview-0.1b/blob/main/LICENSE)
