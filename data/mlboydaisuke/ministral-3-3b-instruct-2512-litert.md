# mlboydaisuke/Ministral-3-3B-Instruct-2512-LiteRT

## Resumen

Ministral-3-3B-Instruct-2512-LiteRT es una conversión del modelo Mistral Ministral-3-3B-Instruct-2512 al formato LiteRT-LM (`.litertlm`), realizada por el usuario mlboydaisuke, para su ejecución en dispositivos de borde (móviles y equipos de sobremesa) mediante el runtime LiteRT-LM de Google. El modelo original lo desarrolla Mistral AI y esta conversión lo empaqueta en un único fichero de aproximadamente 2,3 GB con cuantización int4 por bloques, pensado para inferencia local sin GPU de servidor.

La relevancia de esta ficha radica en que demuestra cómo llevar un modelo de lenguaje de 3B parámetros a un teléfono móvil con calidad de razonamiento aritmético prácticamente idéntica a la versión bf16 de referencia (89,0 % en GSM8K). Se trata de una conversión solo de texto: se descarta la torre de visión Pixtral del modelo original, por lo que no conserva capacidades multimodales.

El modelo es un instruct de respuesta directa, sin bloque de razonamiento explícito (`<think>`), que utiliza la plantilla nativa de Mistral `[INST] … [/INST]` y termina en el token `</s>`. Su contexto de caché KV está limitado a 4096 tokens en esta conversión. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (decodificador de texto de Ministral-3; torre de visión Pixtral descartada) |
| Parámetros totales | 3B (modelo base Ministral-3-3B-Instruct-2512) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (caché KV de esta conversión LiteRT-LM) |
| Tipos de cuantización | int4 por bloques (bloque 32), simétrico, clipping OCTAV; embedding/lm_head atados en INT8; cómputo entero |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (bundle único con tokenizador y plantilla de prompt embebidos) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 3B parámetros de la familia Ministral de Mistral AI, entrenado presumiblemente con datos multilingües y ajustado por instrucciones. Esta conversión concreta no aporta información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; esos datos corresponden al modelo original y no se detallan en la información disponible.

La innovación técnica de esta ficha es el proceso de conversión: los pesos se cuantizan a int4 con bloques de 32 elementos, simétricos y con clipping OCTAV, mientras que el embedding y la cabeza de salida atados se mantienen en INT8. El bundle `.litertlm` externaliza el embedding para que cada sección quede por debajo de 2 GiB, lo que permite cargarlo en iOS. El fichero incorpora el tokenizador y la plantilla de prompt, de modo que no requiere ficheros auxiliares. El cómputo es entero, lo que habilita la ejecución en GPU Metal en iPhone y en CPU en Android.

## Capacidades

- Generación de texto y respuesta a instrucciones en formato chat nativo de Mistral.
- Razonamiento aritmético y resolución de problemas matemáticos de varios pasos (cadena de pensamiento en el prompt, sin bloque `<think>` interno).
- Respuesta directa sin modo de razonamiento explícito: el modelo contesta y termina en `</s>`.
- Ejecución totalmente en dispositivo (on-device) con el runtime LiteRT-LM, en GPU o CPU.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión: descartadas en esta conversión (torre Pixtral eliminada).
- Audio: no disponible.

## Casos de uso

- Asistente de chat local en móvil: integrado en la app Google AI Edge Gallery (v1.0.16+), el modelo se importa directamente desde Hugging Face y responde en el dispositivo sin conexión, usando la GPU en terminales con 12 GB o más de RAM.
- Razonamiento aritmético en el borde: con una calidad GSM8K del 89,0 % (greedy, 0-shot, cadena de pensamiento), es adecuado para calculadoras conversacionales y resolución de problemas cotidianos en apps móviles.
- Servidor local compatible con OpenAI: el CLI `litert-lm serve` expone una API compatible con OpenAI en macOS, Linux y Windows, lo que permite conectar herramientas existentes a un modelo de 3B que corre en el portátil.
- Prototipado de apps Android: mediante el artefacto Gradle `com.google.ai.edge.litertlm:litertlm-android` y la API Kotlin, se puede incrustar el modelo en una aplicación propia para funciones de texto sin depender de la nube.
- Demostraciones de IA en el dispositivo para investigación: útil para medir latencia y consumo reales de un 3B cuantizado a int4 en hardware de consumo (iPhone 17 Pro: ~17,6 tok/s; Mac M4 Max: ~80 tok/s).
- Generación de texto en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, los datos del usuario no salen del dispositivo, lo que encaja en escenarios de salud, legal o empresa con datos sensibles.
- Pruebas de pipelines de inferencia LiteRT-LM: sirve como modelo de referencia para validar el runtime, la plantilla de chat y el formato `.litertlm` antes de desplegar modelos mayores.

## Benchmarks y rendimiento

| Configuración | GSM8K |
|---|---|
| bf16 (referencia) | 89,0 % |
| Esta conversión int4 LiteRT-LM | no disponible (el dato se trunca en la información proporcionada) |

Medición GSM8K con n=100, greedy, 0-shot con cadena de pensamiento pidiendo `#### <n>`, mismo prompt y extracción de respuesta en ambas filas. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el modelo ocupa ~2,7 GB; en Android con GPU se necesita aproximadamente el doble (~5,4 GB) por la caché de pesos de ML Drift, por lo que la GPU solo se ofrece en dispositivos de ~12 GB o más.
- En un teléfono de 8 GB (p. ej. Pixel 8a) solo está disponible el backend CPU y hay que liberar RAM antes de cargar (cerrar apps o reiniciar hasta ~4 GB libres) para evitar que el proceso muera por OOM.
- GPU recomendadas: Metal GPU en iPhone 17 Pro (~17,6 tok/s, carga en 7,6 s); Apple M4 Max (~80 tok/s en modo greedy); GPU de Android en dispositivos de 12 GB o más.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon y en móviles de gama alta; para móviles pequeños se recomienda un modelo de 1–2B (p. ej. Qwen3-1.7B `.litertlm`).
- Opciones de despliegue: runtime LiteRT-LM (CLI de escritorio, servidor local compatible con OpenAI, API Kotlin para Android, app Google AI Edge Gallery). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: ~17,6 tok/s en iPhone 17 Pro (GPU Metal) y ~80 tok/s en Mac M4 Max (greedy).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ministral-3-3B-Instruct-2512-LiteRT (esta ficha) | 3B | 4096 (KV) | `.litertlm` int4 | Apache-2.0 | Hugging Face, runtime LiteRT-LM |
| Ministral-3-3B-Instruct-2512 (base) | 3B | no disponible | safetensors (bf16) | Apache-2.0 | Hugging Face |
| Qwen3-1.7B `.litertlm` | 1,7B | no disponible | `.litertlm` | no disponible | Hugging Face, LiteRT-LM |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo texto: la torre de visión Pixtral se ha eliminado, por lo que no procesa imágenes.
- Contexto limitado a 4096 tokens de caché KV, insuficiente para documentos largos o conversaciones muy extensas.
- Sin modo de razonamiento explícito (`<think>`): puede rendir peor en tareas que requieran deliberación interna frente a modelos con thinking mode.
- En Android con GPU, el consumo de memoria es aproximadamente el doble del tamaño del modelo; en dispositivos de 8 GB solo funciona en CPU y puede morir por OOM si no se libera RAM.
- Riesgo de alucinación inherente a un modelo de 3B; no se han publicado evaluaciones de sesgo ni de robustez en la información disponible.
- Idiomas soportados no especificados; no se garantiza un rendimiento multilingüe homogéneo.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base original.
- El CLI litert-lm (0.14.0–0.19.2) puede conservar descargas incompletas en caché e importarlas sin verificar el tamaño, provocando errores de bus o "too large for file size"; hay que borrar el fichero en caché y reimportar.
- Si se importó el modelo antes del 2026-09-21 (17:16 UTC), la copia cacheada es la versión anterior; es necesario borrarla y volver a importar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/Ministral-3-3B-Instruct-2512-LiteRT
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- App Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
- Releases de la app: https://github.com/google-ai-edge/gallery/releases
- Guía de importación de modelos locales: https://github.com/google-ai-edge/gallery/wiki/6.-Importing-Local-Models-(optional)
- API Kotlin de LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM/blob/main/docs/api/kotlin/getting_started.md
