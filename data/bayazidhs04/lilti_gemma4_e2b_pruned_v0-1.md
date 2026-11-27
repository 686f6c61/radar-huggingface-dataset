# bayazidhs04/Lilti_gemma4_E2B_pruned_v0.1

## Resumen

Lilti Gemma 4 E2B Pruned v0.1 es un modelo multimodal derivado de Gemma 4 E2B, publicado por el usuario bayazidhs04 en Hugging Face. Se trata de una versión podada y ajustada finamente (fine-tuned) orientada a un caso de uso muy concreto: actuar como compañero conversacional en dispositivos móviles y comentarista en directo de partidas de videojuegos para la aplicación CupCake AI Companion. El modelo conserva el proyector multimodal de visión y audio del modelo base, pero reduce drásticamente el vocabulario y la tabla de embeddings para disminuir el tamaño en disco y acelerar la decodificación en CPU ARM.

La poda afecta al vocabulario del tokenizador, que pasa de 262.144 a 160.704 tokens, eliminando idiomas no deseados y conservando inglés, bengalí nativo (Unicode `\u0980`–`\u09FF`) y "Banglish" (bengalí romanizado). Según la model card, se eliminan más de mil millones de parámetros de nodos de `embed_tokens` y de la tabla Per-Layer Embedding (PLE), lo que reduce el archivo en unos 650 MB y acelera la decodificación de `lm_head` en torno a un 33% en CPU móvil. El repositorio contiene pesos en formato GGUF cuantizados a Q4_K_M y un proyector multimodal separado en F16.

El modelo es relevante dentro del nicho de asistentes conversacionales embebidos en Android con personalidad marcada, salida estructurada estricta (etiquetas de emoción y modos de personalidad) y capacidad de leer HUDs de juegos mediante visión. No obstante, la información pública disponible es escasa: no hay pipeline declarado, licencia explícita en los metadatos de Hugging Face ni idiomas listados fuera de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Gemma 4 E2B (con proyector de visión/audio); detalles completos no disponibles |
| Parametros totales | 3.582.735.907 (dato de safetensors); la model card indica ~3,2B tras la poda |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (pesos de lenguaje), F16 (proyector multimodal `mmproj`) |
| Idiomas soportados | Inglés, bengalí (Unicode), Banglish; según model card |
| Licencia | gemma (declarada en la model card); metadatos de Hugging Face sin licencia |
| Formato de pesos | GGUF (dos archivos: lenguaje y proyector multimodal) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E2B, un transformer multimodal con proyector cross-modal para visión y audio. La intervención principal del autor es una poda de vocabulario y de nodos de embedding: reduce el vocabulario de 262.144 a 160.704 tokens, conservando inglés, bengalí nativo, Banglish y tokens de control, y elimina más de mil millones de parámetros de `embed_tokens` y de la tabla Per-Layer Embedding (PLE) de 2,34B parámetros. Según la model card, esto reduce el tamaño del archivo en ~650 MB y acelera la decodificación de `lm_head` ~33% en CPU/ARM móvil. El proyector de visión (`mmproj.gguf`) se mantiene alineado con las capas de lenguaje ajustadas.

El ajuste fino se realizó sobre "comentario auténtico de streaming" de creadores como Dr Disrespect, MoistCr1TiKaL, Shroud, CarryMinati, Total Gaming, Triple R, xQc y Ludwig, según declara el autor. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. Tampoco se detalla la técnica de poda más allá de la eliminación de nodos de embedding. La salida está restringida mediante gramática GBNF a un formato concreto: `[emo: tag] *action* reply`, con ocho etiquetas de emoción válidas (`laugh, smug, angry, blush, shock, sad, happy, sleepy`) y cuatro modos de personalidad (`sarcastic, moody, flirty, cute`).

## Capacidades

- Generación de texto conversacional con personalidad marcada y modos seleccionables (sarcástico, malhumorado, coqueto, adorable).
- Salida estructurada estricta mediante gramática GBNF: etiqueta de emoción, acción entre asteriscos y respuesta.
- Comprensión de imágenes y vídeo en directo a través del proyector multimodal: lectura de HUDs de juegos (barras de vida, contadores de bajas, banners de victoria/derrota).
- Capacidades de audio declaradas en los tags de la model card (`audio`, `audio-text-to-text`, `speech`), aunque no se detalla su alcance.
- Comentario en directo de partidas con contexto de eventos (`eliminated_early`, `low_hp`, `clutch_moment`, `headshot_kill`, `battery_temp_high`, etc.).
- Conversación multilingüe limitada a inglés, bengalí y Banglish.
- Respuestas cortas optimizadas para pantalla móvil y TTS (media de 14,8 palabras, límite de 22).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Comentarista de partidas en directo en Android: el modelo recibe eventos del juego (`[ctx: game] [app: PUBG] [event: low_hp]`) y genera comentarios con emoción y acción, adecuado por su tamaño reducido y su velocidad en ARM.
- Compañero conversacional con personalidad: chat diario con modos `cute`, `flirty`, `moody` o `sarcastic`, pensado para sesiones largas en móvil gracias a la cuantización Q4_K_M de 2,43 GB.
- Lectura de HUDs mediante visión: verificación de barras de vida, contadores de enemigos y banners de victoria usando el proyector `mmproj.gguf`, con una tasa declarada de 94,2% de precisión en HUDs sintéticos.
- Avisos contextuales del dispositivo: reacciones a eventos como temperatura de batería alta (`battery_temp_high`) o sesiones de codificación nocturnas, integrables en la app anfitriona.
- Generación de respuestas para TTS: el límite de 22 palabras y la media de 14,8 palabras facilitan la síntesis de voz en tiempo real en dispositivos móviles.
- Prototipado de asistentes con salida estructurada: la gramática GBNF con etiquetas de emoción fijas sirve como base para integrar respuestas en un motor de animación de avatar o UI.
- Evaluación de poda de vocabulario: útil como referencia para estudiar el impacto de reducir el vocabulario de Gemma 4 en tamaño, velocidad y calidad en entornos embebidos.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card:

| Benchmark | Resultado | Método de evaluación |
|---|---|---|
| Precisión de grounding visual | 94,2% | Verificación directa sobre HUDs sintéticos (HP %, contador de vivos, banners) |
| Tasa libre de alucinación | 97,8% | Pruebas de media en blanco y HUDs trampa (cero falsos positivos de victoria) |
| Adherencia a emociones canónicas | 100,0% | Cumplimiento estricto de las 8 etiquetas de CupCake |
| Restricción de longitud (< 22 palabras) | 100,0% | Media de 14,8 palabras por respuesta |

Comparativa de velocidad y tamaño declarada por el autor:

| Modelo | Parámetros | Vocabulario | Tamaño (Q4_K_M) | Velocidad de decodificación (ARM) |
|---|---|---|---|---|
| google/gemma-4-E2B-it (base) | 5,1B | 262.144 | ~3,1 GB | ~14,5 tok/s |
| Lilti_gemma4_E2B_pruned_v0.1 | ~3,2B | 160.704 | 2,43 GB | ~21,8 tok/s (+50%) |
| Lilti_kiraa-v0.3-Qwen3.5-0.8B | 0,8B | 151.936 | 522 MB | ~48,0 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: los pesos de lenguaje en Q4_K_M ocupan 2,43 GB; el proyector multimodal F16 ocupa 940 MB; en total, en torno a 3,4 GB de pesos, más overhead de contexto y runtime.
- GPU recomendadas: no se especifican; por tamaño, cabe en GPUs de consumo con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070) y en GPUs profesionales (A100, H100) sin problema, aunque el modelo está optimizado para CPU ARM.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 6 GB de VRAM para la cuantización Q4_K_M.
- Despliegue: formato GGUF, por lo que es compatible con llama.cpp y con frontends basados en él (Ollama, LM Studio) y con servidores compatibles con endpoints (tag `endpoints_compatible`). No se documenta soporte de vLLM o TGI para este modelo.
- Latencia y throughput: ~21,8 tok/s en ARM según el autor (frente a ~14,5 tok/s del base); no se proporcionan cifras para GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Lilti_gemma4_E2B_pruned_v0.1 | ~3,2B (3,58B en safetensors) | no disponible | gemma | GGUF en HF | Poda de vocabulario, multimodal, fine-tune para gaming |
| google/gemma-4-E2B-it (base) | 5,1B | no disponible | gemma | HF | Modelo base multimodal, vocabulario completo |
| Lilti_kiraa-v0.3-Qwen3.5-0.8B | 0,8B | no disponible | no disponible | HF (según autor) | Mucho más pequeño y rápido (48 tok/s), menor capacidad |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el ajuste fino se basa en el estilo de creadores de contenido concretos (Dr Disrespect, xQc, etc.), lo que puede introducir tono agresivo, sarcástico o soez en las respuestas.
- Riesgo de alucinación: aunque el autor declara una tasa del 97,8% libre de alucinación en HUDs sintéticos, no hay validación independiente; la lectura de HUDs reales con oclusión, iluminación variable o resoluciones bajas puede degradar la precisión.
- Limitaciones de idioma: el vocabulario podado elimina idiomas distintos del inglés, bengalí y Banglish; el modelo no es adecuado para castellano ni para otras lenguas.
- Limitaciones de contexto: no se documenta la longitud de contexto soportada; el uso previsto son turnos cortos con contexto estructurado, no conversaciones largas.
- Restricciones de licencia: la model card declara licencia `gemma`, que impone condiciones de uso comercial y de redistribución; los metadatos de Hugging Face no listan licencia, lo que genera ambigüedad. Verificar la licencia Gemma antes de uso en producción.
- Caveat de producción: el modelo está diseñado para una app concreta (CupCake AI Companion) y su salida está restringida por gramática; fuera de ese formato puede comportarse de forma impredecible.
- La información pública es escasa: no hay pipeline declarado, ni detalles de entrenamiento, ni evaluación independiente; el repositorio tiene pocas descargas (388) y likes (2), lo que limita la evidencia de robustez.

## Enlaces

- Hugging Face: https://huggingface.co/bayazidhs04/Lilti_gemma4_E2B_pruned_v0.1
- Modelo base Gemma 4 E2B: no disponible en la información proporcionada
- Paper o blog del autor: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
