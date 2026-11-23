# IndrasMirror/LFM3-Omni-2B-XQ-Uncensored

## Resumen

LFM3-Omni-2B-XQ-Uncensored es una cuantización GGUF de precisión mixta del modelo multimodal LiquidAI/LFM3-Omni-2B, publicada por el usuario IndrasMirror. El modelo base, desarrollado por Liquid AI, es un modelo any-to-any que acepta texto, imágenes, vídeo y audio como entrada y produce texto y voz como salida, con aproximadamente 1.730 millones de parámetros. Esta versión concreta aplica una edición de "abliteration" sobre los pesos en precisión completa para eliminar la dirección de rechazo, y después los cuantiza con el pipeline propietario XQ en cinco tamaños distintos.

La relevancia de esta ficha reside en que combina tres elementos poco habituales en un mismo artefacto: capacidades omni (visión, audio y habla) en un modelo de menos de 2B parámetros, una cuantización mixta que iguala o supera a Q4_K_M en calidad con menor divergencia KL, y una modificación de alineación que reduce drásticamente las negativas del modelo. El modelo base emplea una arquitectura de Liquid AI (familia LFM3) y está entrenado únicamente en inglés según los metadatos del repositorio.

El contexto de publicación es relevante para desarrolladores que necesitan un modelo pequeño, desplegable en una sola GPU de consumo, con soporte de tool calling, visión y síntesis de voz, y que quieran evitar las restricciones de rechazo del modelo original. La cuantización XQ-6.0 ocupa 1,29 GiB y decodifica a 432 tok/s en una RTX 4090, lo que lo hace viable como modelo auxiliar junto a un modelo grande.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de Liquid AI, familia LFM3; no se detalla en la información proporcionada) |
| Parámetros totales | 1.728.801.600 (según safetensors del modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (usado en las pruebas de llama-server; no se confirma como máximo oficial) |
| Tipos de cuantización | XQ-6.0, XQ-5.0, XQ-4.5, XQ-4.0, XQ-3.5 (precisión mixta: IQ3_S, IQ4_XS, IQ4_NL, Q3_K a Q6_K, Q8_0, BF16 por tensor) y Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | lfm1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | GGUF (llama.cpp); proyector multimodal en GGUF Q8_0 |
| Pipeline | any-to-any |
| Modalidades de entrada | texto, imagen, vídeo (con pista de audio), audio |
| Modalidades de salida | texto, voz |
| Tamaño del repositorio | 8,0 GB |
| Descargas | 3.403 |
| Fecha de creación | 2026-11-02 |
| Última actualización | 2026-11-22 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base LFM3-Omni-2B más allá de su pertenencia a la familia LFM3 de Liquid AI y su naturaleza any-to-any. El modelo procesa texto, imágenes, vídeo y audio mediante un proyector multimodal separado (mmproj), que en este repositorio se distribuye como el archivo oficial Q8_0 de Liquid AI sin modificar. El modelo de texto es el único componente alterado por el autor de esta cuantización.

El proceso de creación tiene dos fases documentadas. Primero, una abliteración sobre los pesos en precisión completa: una edición de dirección de rechazo de rango 2, ajustada sobre el checkpoint BF16 de Liquid AI. El autor reporta una validación sobre 100 prompts dañinos y 100 inofensivos no vistos: el modelo original rechazaba 92/100 dañinos y 5/100 inofensivos, mientras que la versión abliterada rechaza 10/100 dañinos y 2/100 inofensivos. Segundo, la cuantización con el pipeline XQ, que asigna a cada tensor su propio formato (IQ3_S, IQ4_XS, IQ4_NL, Q3_K a Q6_K, Q8_0, BF16) según la sensibilidad medida sobre un conjunto de calibración de código, agentes, OCR y contexto largo, para un presupuesto de bits por peso dado. El pipeline XQ es privado, pero los archivos resultantes son GGUF estándar y no requieren un cargador especial.

Un detalle técnico relevante: LFM3 es un modelo sin razonamiento explícito (non-reasoning); su plantilla de chat abre cada respuesta con un bloque `` vacío. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de conversaciones multi-turno.
- Comprensión de imágenes: el autor verifica la descripción correcta de formas, colores y números en una prueba de humo.
- Comprensión de vídeo, incluyendo la pista de audio asociada (`input_video`).
- Comprensión de audio y transcripción de voz: una prueba de humo transcribe exactamente un clip de habla.
- Salida de voz (text-to-speech) mediante `/tts` y el websocket `/v1/realtime` en llama.cpp, o `/v1/audio/speech` en Xolotl.
- Tool calling / function calling: verificado con una llamada a herramienta correcta en la prueba de humo; en la evaluación de Xolotl, 9 de 10 llamadas a herramientas correctas.
- Soporte de agentes y bucles multi-step: el autor reporta 0 de 3 bucles agénticos correctos en Xolotl con el modo de razonamiento desactivado, lo que indica una capacidad limitada en este aspecto para un modelo de 2B.
- Capacidades multilingües: limitadas al inglés según los metadatos; no se documentan otros idiomas.
- Modo "uncensored": la abliteración reduce los rechazos de 92/100 a 10/100 en prompts dañinos, manteniendo 2/100 rechazos en prompts inofensivos.
- No es un modelo de razonamiento: no genera cadenas de pensamiento (thinking mode desactivado por diseño).

## Casos de uso

- Asistente multimodal en local para desarrolladores: el modelo acepta imagen, audio y texto en una sola GPU de consumo (3,5 GB de VRAM con el proyector y contexto de 32K), lo que permite montar un asistente personal que describe capturas de pantalla, transcribe notas de voz y responde en texto sin depender de la nube.
- Transcripción y respuesta por voz en aplicaciones de accesibilidad: la combinación de entrada de audio (`input_audio`) y salida de voz (`/tts`) permite construir interfaces conversacionales habladas para usuarios con dificultades visuales o motoras, con una latencia de primera respuesta de audio de 0,02 s una vez cargado el modelo en Xolotl.
- Automatización de atención al cliente de baja latencia: con 389 tok/s de decodificación en GPU y 32K de contexto, el modelo puede gestionar conversaciones multi-turno con historial largo en un servidor modesto; su tamaño reducido permite desplegar varias instancias por GPU.
- Procesamiento de documentos con OCR y descripción de imágenes: el conjunto de calibración de la cuantización incluye OCR, y la prueba de humo confirma la descripción correcta de formas, colores y números; es adecuado para pipelines de extracción de información de capturas y documentos escaneados.
- Generación de código asistida en entornos con recursos limitados: el modelo soporta tool calling y obtuvo 13/21 en HumanEval (21 problemas) en la evaluación del autor con Xolotl; es viable como autocompletado o asistente de código ligero en una estación de trabajo con una sola GPU consumer.
- Moderación y clasificación de contenido sin restricciones de rechazo: al haber reducido la dirección de rechazo, el modelo puede emplearse en tareas de análisis de contenido sensible (por ejemplo, clasificación de mensajes abusivos) donde un modelo fuertemente alineado se negaría a procesar la entrada; requiere supervisión humana y políticas de uso claras.
- Prototipado rápido de aplicaciones any-to-any: al ser GGUF estándar y funcionar con llama.cpp desde la versión f3586e6, se integra en flujos de desarrollo con llama-server y la API compatible con OpenAI, sin necesidad de infraestructura especializada.

## Benchmarks y rendimiento

Calidad de cuantización medida por el autor con `llama-perplexity --kl-divergence` (llama.cpp f3586e6) sobre un conjunto de texto reservado de ~256 KB, tomando como referencia el Q8_0 abliterado (perplejidad 6,379):

| Archivo | Tamaño | Perplejidad | KL (menor es mejor) | KL percentil 99 | Mismo top-1 |
|---|---|---|---|---|---|
| XQ-6.0 | 1,29 GiB | 6,466 | 0,0207 | 0,225 | 95,29% |
| XQ-5.0 | 1,11 GiB | 6,442 | 0,0428 | no disponible | 93,18% |
| XQ-4.5 | 1,03 GiB | 6,447 | 0,0543 | no disponible | 92,32% |
| XQ-4.0 | 967 MiB | 6,549 | 0,0773 | no disponible | 90,97% |
| XQ-3.5 | 879 MiB | 6,828 | 0,1311 | no disponible | 88,31% |
| Q4_K_M oficial (no abliterado) | 1,02 GiB | 6,346 | 0,0822 | no disponible | 91,17% |
| Q8_0 oficial (no abliterado) | 1,71 GiB | 6,464 | 0,0059 | 0,068 | 97,44% |

Velocidad de decodificación (`llama-bench` tg128, RTX 4090 24 GB, Ryzen 7 5700X, Linux, todas las capas en GPU):

| Archivo | tg128 |
|---|---|
| XQ-3.5 | 514 tok/s |
| XQ-4.0 | 501 tok/s |
| XQ-4.5 | 481 tok/s |
| XQ-5.0 | 466 tok/s |
| XQ-6.0 | 432 tok/s |
| Q4_K_M oficial | 497 tok/s |
| Q8_0 oficial | 355 tok/s |

Rendimiento servido con Xolotl (XQ-6.0, contexto 32K, RTX 4090): prefill de 32.796 tok/s a 5,3K y 26.049 tok/s a 14K; decodificación de ~300 tok/s; turno de seguimiento sobre una conversación de 7K en 0,03 s; salida de voz a 12x tiempo real con primer audio a 0,02 s. En HumanEval (21 problemas), tool calls (10) y bucles agénticos (3) obtuvo 13/9/0 respectivamente. No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 3,5 GB con XQ-6.0 más el proyector Q8_0 y contexto de 32K en llama-server; el archivo XQ-6.0 solo ocupa 1,29 GiB y el proyector 0,47 GiB.
- GPU recomendadas: RTX 4090 24 GB para las cifras de velocidad publicadas; cualquier GPU con al menos 4 GB de VRAM libre puede ejecutar el modelo con contexto reducido.
- Cabe en GPU consumer: sí, en tarjetas de gama media y alta con 4 GB o más de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090); XQ-3.5 (0,87 GiB) está pensado para teléfonos y GPU pequeñas.
- Despliegue: llama.cpp (llama-server) desde la versión f3586e6 o posterior, con soporte LFM3; Xolotl con el motor `xolotl-lfm3`; cualquier cargador GGUF estándar para el modelo de texto, aunque el proyector multimodal requiere llama.cpp o Xolotl.
- Latencia y throughput: 432 tok/s de decodificación en RTX 4090 con XQ-6.0 (514 tok/s con XQ-3.5); 389 tok/s servido en GPU y 23 tok/s solo con CPU (8 hilos); prefill de 26.000 a 33.000 tok/s en Xolotl.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| LFM3-Omni-2B-XQ-Uncensored (XQ-6.0) | 1,73B | 32K (usado) | texto, imagen, vídeo, audio → texto, voz | lfm1.0 | GGUF | Abliterado; KL 0,0207 frente a Q8_0 abliterado; 432 tok/s en RTX 4090 |
| LiquidAI/LFM3-Omni-2B (Q8_0 oficial) | 1,73B | no disponible | texto, imagen, vídeo, audio → texto, voz | lfm1.0 | GGUF / safetensors | No abliterado; KL 0,0059 frente a sí mismo; 355 tok/s en RTX 4090 |
| LiquidAI/LFM3-Omni-2B (Q4_K_M oficial) | 1,73B | no disponible | texto, imagen, vídeo, audio → texto, voz | lfm1.0 | GGUF | No abliterado; KL 0,0822; 497 tok/s en RTX 4090 |
| Alternativas de 2B omni | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos omni de tamaño similar en la información proporcionada |

## Limitaciones y advertencias

- La abliteración elimina parcialmente la dirección de rechazo, pero no la garantía de que el modelo no genere contenido dañino: el autor reporta 10/100 rechazos en prompts dañinos, lo que implica que sigue habiendo negativas y, sobre todo, que el modelo puede producir contenido sensible sin filtro. Requiere moderación externa en producción.
- Riesgo de alucinación: es un modelo de 1,73B parámetros sin modo de razonamiento; en tareas que exigen multi-step reasoning su rendimiento es bajo (0/3 bucles agénticos correctos en la evaluación del autor) y en HumanEval obtuvo 13/21.
- Limitación idiomática: solo se declara inglés; no hay evidencia de capacidades en castellano ni en otros idiomas.
- El contexto máximo oficial no se documenta; las pruebas usan 32K, pero no se confirma que sea el límite del modelo base.
- La licencia lfm1.0 es "other" y puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE del repositorio antes de desplegar en producción. La modificación de pesos (abliteration) puede tener implicaciones adicionales según los términos de la licencia del modelo base.
- La cuantización XQ es un pipeline privado del autor; aunque los archivos son GGUF estándar, no se puede reproducir la receta exacta ni auditar la selección de formatos por tensor.
- El proyector multimodal es el archivo oficial de Liquid AI sin modificar; cualquier limitación del proyector original (por ejemplo, resolución de imagen o duración de vídeo) se mantiene.
- El modelo base no es de razonamiento: la plantilla abre con `` vacío, por lo que no debe esperarse una cadena de pensamiento explícita.
- Las cifras de velocidad y calidad provienen del autor del repositorio y no han sido verificadas de forma independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IndrasMirror/LFM3-Omni-2B-XQ-Uncensored
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Repositorio Xolotl: https://github.com/Indras-Mirror/Xolotl
- Documentación del motor LFM3 en Xolotl: https://github.com/Indras-Mirror/Xolotl/blob/main/docs/LFM3.md
- Licencia del modelo: archivo LICENSE en el repositorio de Hugging Face
