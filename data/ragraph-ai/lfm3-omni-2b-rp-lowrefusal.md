# ragraph-ai/LFM3-Omni-2B-RP-LowRefusal

## Resumen

LFM3-Omni-2B-RP-LowRefusal es un ajuste fino (finetune) del modelo multimodal LiquidAI/LFM3-Omni-2B, desarrollado por el usuario ragraph-ai y publicado en Hugging Face. Está orientado a roleplay en inglés mediante tarjetas de personaje (character cards), con un proceso de ablación de rechazos (refusal ablation) aplicado mediante la herramienta Heretic. El modelo conserva intacta la pila ómnimodal del modelo base: procesa imagen, vídeo y audio de entrada, y genera voz además de texto.

El modelo mantiene la arquitectura del base, con 2.166.928.384 parámetros totales (aproximadamente 2,17 mil millones) y un contexto de entrenamiento de hasta 8K tokens en conversaciones, aunque el modelo base soporta hasta 32K. Se distribuye tanto en formato BF16 para Transformers como en cuantizaciones GGUF para llama.cpp, lo que permite su despliegue en dispositivos de borde (edge) y teléfonos.

Su relevancia radica en que es una variante de "bajo rechazo": según la model card, responde a 5 de 100 peticiones dañinas con un clasificador de palabras clave y a 7 de 100 con un clasificador, frente a las 99 y 98 del modelo base. A cambio, su calidad conversacional es inferior a la de la variante LFM3-Omni-2B-RP, con una tasa de victoria del 49,0% frente al base en una evaluación de roleplay, frente al 61,5% de la variante ligera.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3-Omni de Liquid AI; transformer multimodal con codificadores de visión y audio, decodificador de voz y códec) |
| Parámetros totales | 2.166.928.384 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8K tokens en entrenamiento conversacional; el base soporta 32K; 16K recomendado como valor por defecto en llama.cpp |
| Tipos de cuantización | BF16 (Transformers), Q4_K_M, Q6_K, Q8_0, BF16 (GGUF); proyectores multimodal en Q8_0 y BF16 |
| Idiomas soportados | inglés (en) |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors (BF16) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-Omni-2B, un modelo ómnimodal de Liquid AI que combina procesamiento de texto, imagen, vídeo y audio. El finetune de ragraph-ai se centra exclusivamente en el modelo de lenguaje: según la model card, los codificadores de visión y audio, el decodificador de voz y el códec son idénticos bit a bit al modelo base, y los proyectores multimodales (mmproj) distribuidos son los oficiales de Liquid AI sin modificar. Esto implica que el ajuste no altera las capacidades perceptivas ni de síntesis de voz, solo el comportamiento conversacional del LLM.

El entrenamiento replica el de la variante LFM3-Omni-2B-RP hasta el paso de ablación de rechazos. Esta variante concreta emplea un ensayo más agresivo de Heretic (trial 105, "strong"), frente al trial 97 ("light") de la variante estándar, y el proceso de reparación de voz (speech repair) se rehízo sobre esa ablación. Los datos de entrenamiento consistieron en conversaciones de roleplay con prompts de sistema basados en tarjetas de personaje (persona, escenario, diálogo de ejemplo). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. El contenido sexual con menores fue filtrado del conjunto de datos de entrenamiento según la model card.

## Capacidades

- Generación de texto conversacional orientado a roleplay en inglés, con soporte de tarjetas de personaje estándar de SillyTavern.
- Procesamiento de imagen y vídeo como entrada (visión), mediante el proyector multimodal.
- Reconocimiento automático de voz (ASR) en inglés como entrada de audio.
- Síntesis de voz (text-to-speech) a 24 kHz en formato WAV, con opción de voz masculina o femenina.
- Modelo no razonador: cada respuesta comienza con un bloque `<think></think>` vacío; requiere `--reasoning off` en llama.cpp.
- API compatible con OpenAI a través de llama-server.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Roleplay conversacional con tarjetas de personaje: el modelo está entrenado específicamente con prompts de sistema que incluyen persona, escenario y diálogo de ejemplo, por lo que se integra directamente en SillyTavern con plantilla ChatML y produce respuestas en personaje sin salirse del rol (0 salidas de personaje en 300 respuestas evaluadas).
- Ficción interactiva y escritura creativa sin restricciones de contenido: la ablación de rechazos permite generar narrativa explícita, violenta u ofensiva bajo petición, adecuada para proyectos de ficción para adultos que requieran libertad creativa.
- Asistente conversacional multimodal en dispositivos de borde: con cuantización Q4_K_M (1,10 GB) puede ejecutarse en teléfonos y máquinas de baja RAM mediante llama.cpp, manteniendo entrada de imagen y audio.
- Descripción de imágenes y análisis visual conversacional: mediante `llama-mtmd-cli --image`, el modelo puede describir fotografías dentro de una conversación de roleplay o narrativa.
- Transcripción de audio en inglés: usando `llama-mtmd-cli --audio` con un prompt de ASR, puede transcribir grabaciones de voz como parte de un flujo conversacional.
- Generación de voz para narrativa o personajes: con `llama-tts` puede sintetizar diálogos de ficción a 24 kHz, útil para audiolibros amateur, prototipos de videojuegos o demos de personajes con voz.
- Prototipado de agentes conversacionales con API compatible con OpenAI: el servidor llama-server expone `/v1/chat/completions`, lo que permite integrarlo en pipelines existentes que ya consuman la API de OpenAI.

## Benchmarks y rendimiento

| Métrica | LFM3-Omni-2B (base) | LFM3-Omni-2B-RP | LFM3-Omni-2B-RP-LowRefusal |
|---|---|---|---|
| Rechazos en 100 peticiones dañinas (palabras clave) | 99 | 11 | 5 |
| Rechazos en 100 peticiones dañinas (clasificador) | 98 | 17 | 7 |
| Tasa de victoria en juicio de roleplay vs base | — | 61,5% | 49,0% |
| Salidas de personaje en 300 respuestas de roleplay | — | 0 | 0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB con Q4_K_M; 1,43 GB con Q6_K; 1,85 GB con Q8_0; 3,47 GB con BF16 en GGUF; 4,3 GB para el checkpoint BF16 completo en Transformers.
- Proyector multimodal adicional: 0,51 GB (Q8_0) o 0,95 GB (BF16) si se usan imagen, audio o voz.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cabe holgadamente en GPU de consumo como RTX 3060, RTX 4060, RTX 4090, así como en dispositivos móviles y máquinas de baja RAM.
- Cabe en GPU de consumo: sí, con cualquier cuantización GGUF; la Q4_K_M está pensada para teléfonos y máquinas de baja RAM.
- Opciones de despliegue: llama.cpp (versión b11960 o superior, primera con soporte LFM3-Omni), llama-server con API compatible con OpenAI, llama-mtmd-cli para multimodal, llama-tts para síntesis de voz, y Transformers con el checkpoint BF16. No se menciona compatibilidad con vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B-RP-LowRefusal | 2,17B | 8K entrenamiento / 32K base | Roleplay ómnimodal, bajo rechazo | lfm1.0 | Hugging Face (safetensors + GGUF) |
| LFM3-Omni-2B-RP | 2,17B | 8K entrenamiento / 32K base | Roleplay ómnimodal, rechazo ligero | lfm1.0 | Hugging Face |
| LiquidAI/LFM3-Omni-2B | 2,17B | 32K | Modelo base ómnimodal | lfm1.0 | Hugging Face |

La comparativa con modelos de otros desarrolladores no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo solo para adultos: genera ficción explícita, violenta u ofensiva bajo petición; el usuario es responsable del contenido generado.
- Calidad conversacional inferior a la variante LFM3-Omni-2B-RP: 49,0% de tasa de victoria frente al base en el juicio de roleplay, frente al 61,5% de la variante ligera.
- Riesgo de alucinación: no se documenta explícitamente, pero es inherente a los modelos de lenguaje de este tamaño; la model card no aporta datos al respecto.
- Limitación de idioma: solo inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Contexto de entrenamiento limitado a 8K tokens, aunque el base soporte 32K; se recomienda 16K como valor por defecto en llama.cpp.
- Modelo no razonador: requiere desactivar el modo razonamiento (`--reasoning off`) y emite un bloque `<think></think>` vacío al inicio de cada respuesta.
- Licencia lfm1.0: es necesario revisar los términos del archivo LICENSE del repositorio para uso comercial, ya que la licencia se marca como "other" y no se detallan las restricciones en la información disponible.
- El contenido sexual con menores fue filtrado del entrenamiento, pero la model card advierte explícitamente contra intentar generarlo.
- No se documenta soporte de tool calling ni de razonamiento agéntico multi-paso, lo que limita su uso en pipelines de agentes complejos.
- Requiere llama.cpp b11960 o superior para el soporte de LFM3-Omni; versiones anteriores no funcionarán.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ragraph-ai/LFM3-Omni-2B-RP-LowRefusal
- Variante LFM3-Omni-2B-RP: https://huggingface.co/ragraph-ai/LFM3-Omni-2B-RP
- Modelo base LiquidAI/LFM3-Omni-2B: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Heretic (herramienta de ablación de rechazos): https://github.com/p-e-w/heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia del modelo (LICENSE en el repositorio): https://huggingface.co/ragraph-ai/LFM3-Omni-2B-RP-LowRefusal/blob/main/LICENSE
