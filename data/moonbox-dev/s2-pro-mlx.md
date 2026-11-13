# moonbox-dev/s2-pro-MLX

## Resumen

S2 Pro MLX es una conversión a formato MLX del modelo de síntesis de voz Fish Audio S2 Pro, realizada por el usuario moonbox-dev para su ejecución nativa en Macs con Apple Silicon. El modelo original, desarrollado por Fish Audio y derivado de la línea Fish Speech, está orientado a text-to-speech con clonación de voz y soporte multilingüe. Esta versión no introduce cambios arquitectónicos: es una cuantización y reempaquetado de los pesos originales en safetensors compatibles con la librería mlx-audio.

La relevancia de esta ficha es doble. Por un lado, permite a desarrolladores con hardware Apple (M1/M2/M3/M4) desplegar un sistema TTS de calidad cercana al original sin depender de CUDA. Por otro lado, el autor publica métricas de fidelidad frente al modelo PyTorch de referencia (WER, CER, similitud de hablante y DNSMOS) para cada precisión, lo que facilita la elección de compromiso entre calidad y huella de memoria. El repositorio ocupa 35,5 GB e incluye las variantes bf16, fp16 y 8bit.

El modelo se distribuye bajo la Fish Audio Research License, una licencia de investigación que restringe el uso comercial, y no declara una lista explícita de idiomas soportados en la información disponible. Esta ficha describe exclusivamente lo que la model card y los metadatos del repositorio permiten afirmar; los datos ausentes se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo TTS derivado de Fish Speech; incluye un códec de audio de 2,78 GB empaquetado aparte) |
| Parámetros totales | No disponible (los pesos bf16 suman aproximadamente 9,13 GB en dos shards) |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | bf16, fp16, 8bit (cada uno en su propia carpeta) |
| Idiomas soportados | No disponible (la model card etiqueta el modelo como multilingüe, sin lista concreta) |
| Licencia | fish-audio-research-license (uso de investigación) |
| Formato de pesos | safetensors (MLX), más codec.safetensors, tokenizer.json y config.json |
| Librería | mlx-audio |
| Modelo base | fishaudio/s2-pro |
| Tamaño del repositorio | 35,5 GB |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. Lo que sí se puede afirmar es que se trata de un sistema TTS de la familia Fish Speech, con un componente de códec de audio separado (codec.safetensors, 2,78 GB) que se mantiene idéntico en todas las precisiones y que presumiblemente convierte entre audio y tokens discretos. El pipeline completo requiere, además de los pesos convertidos, los componentes restantes del repositorio original fishaudio/s2-pro, según indica el autor.

Esta conversión concreta no aporta entrenamiento nuevo: es un reempaquetado de pesos en MLX con tres precisiones (bf16, fp16 y 8bit). El autor documenta la fidelidad de cada build frente al modelo PyTorch original sobre las mismas entradas, con métricas de WER, CER, similitud de hablante y DNSMOS. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto, con salida de audio.
- Clonación de voz, según la etiqueta voice-cloning de la model card.
- Soporte multilingüe declarado en las etiquetas, aunque sin lista de idiomas concreta.
- Ejecución nativa en Apple Silicon mediante MLX y la librería mlx-audio.
- Tres niveles de precisión seleccionables (bf16, fp16, 8bit) con métricas de degradación documentadas.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Audiolibros y narración automatizada en Mac: el modelo permite generar voz sintética de forma local en equipos Apple Silicon, sin GPU NVIDIA, usando la build bf16 para máxima fidelidad.
- Doblaje y localización de contenido: la capacidad multilingüe y la clonación de voz permiten mantener la identidad del hablante al generar versiones en otros idiomas, siempre que el uso encaje en la licencia de investigación.
- Prototipado de asistentes de voz: integración en aplicaciones macOS o iOS mediante mlx-audio para generar respuestas habladas en tiempo de desarrollo.
- Generación de voces para videojuegos y demos: creación de locuciones de personajes con voces clonadas a partir de muestras, en un flujo de trabajo local.
- Accesibilidad: conversión de texto a voz para lectores de pantalla o aplicaciones de asistencia, ejecutándose en el propio dispositivo y sin enviar texto a servicios externos.
- Investigación en TTS: comparación de precisión y calidad (WER, CER, similitud de hablante, DNSMOS) usando las tres builds publicadas como referencia reproducible.
- Evaluación de pipelines MLX: banco de pruebas para medir latencia y consumo de memoria de un modelo TTS de ~9 GB de pesos en hardware Apple.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad frente al modelo PyTorch original sobre las mismas entradas. No son benchmarks estándar de la comunidad, sino comparaciones directas de calidad de audio y transcripción.

| Precisión | WER / CER | Similitud de hablante | DNSMOS | Referencia original (WER/CER, similitud, DNSMOS) |
|---|---|---|---|---|
| bf16 | 0,0 % / 0,0 % | 0,956 / 0,952 | 3,24 / 2,92 | 0,0 % / 0,0 %, 0,952 / 0,949, 3,21 / 2,76 |
| fp16 | 0,0 % / 0,0 % | 0,964 / 0,951 | 3,21 / 2,86 | No indicada en la model card para esta comparación |
| 8bit | 0,0 % / 0,0 % | 0,953 / 0,953 | 3,22 / 2,83 | No indicada en la model card para esta comparación |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K y similares) en la información disponible, algo esperable en un modelo de síntesis de voz.

## Requisitos de hardware

- Hardware objetivo: Macs con Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra), ya que el formato es MLX.
- Memoria: los pesos bf16 y fp16 suman aproximadamente 9,13 GB en dos shards, más 2,78 GB del códec y unos 13 MB de tokenizer; se recomienda al menos 16 GB de memoria unificada para bf16/fp16 y 16 GB o menos para la build 8bit, que reduce la huella de los pesos del modelo.
- GPU NVIDIA: no aplicable a esta conversión; para CUDA debe usarse el repositorio original fishaudio/s2-pro.
- Despliegue: librería mlx-audio sobre MLX; no se documentan opciones vLLM, llama.cpp, Ollama ni TGI para estos pesos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Pesos | Precisión | Licencia | Plataforma |
|---|---|---|---|---|---|
| moonbox-dev/s2-pro-MLX | TTS con clonación de voz | ~9,13 GB (bf16) + 2,78 GB códec | bf16, fp16, 8bit | fish-audio-research-license | Apple Silicon (MLX) |
| fishaudio/s2-pro | TTS con clonación de voz | No disponible | Original PyTorch | fish-audio-research-license | CUDA / PyTorch |
| Otras alternativas TTS open source | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

La comparación más directa es con el modelo base: esta conversión reproduce el comportamiento del original con métricas casi idénticas en bf16 (WER y CER del 0,0 %, similitud de hablante ligeramente superior y DNSMOS también ligeramente superior en la build MLX). No se dispone de datos de otros modelos TTS comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia de investigación: la fish-audio-research-license restringe el uso comercial; es imprescindible revisar LICENSE.md antes de cualquier despliegue en producción.
- Plataforma: los pesos son exclusivamente MLX; no funcionan en CUDA ni en CPU convencional sin el repositorio original.
- Dependencia del repositorio base: solo se han convertido las partes listadas; el resto del pipeline debe tomarse de fishaudio/s2-pro.
- Idiomas: la lista concreta de idiomas soportados no está disponible, pese a la etiqueta multilingüe.
- Clonación de voz: implica riesgos de suplantación y uso indebido; requiere consentimiento explícito de la voz clonada y controles de abuso.
- Alucinación y errores de pronunciación: aunque el WER medido es del 0,0 % en las pruebas del autor, estas se limitan a un conjunto de entradas no especificado; en textos largos, nombres propios o idiomas no cubiertos puede aparecer degradación.
- Métricas del autor: las comparaciones de fidelidad las publica el propio conversor, sin detalle del conjunto de evaluación ni del número de muestras.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria.
- Sin datos de latencia ni throughput en hardware Apple, por lo que el rendimiento en tiempo real debe medirse en cada equipo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/s2-pro-MLX
- Modelo base: https://huggingface.co/fishaudio/s2-pro
- Licencia: https://huggingface.co/moonbox-dev/s2-pro-MLX/blob/main/LICENSE.md
- Paper referenciado en las etiquetas: arXiv:2603.08823
- Librería mlx-audio: no disponible en la información proporcionada
- Repositorio Fish Speech: no disponible en la información proporcionada
