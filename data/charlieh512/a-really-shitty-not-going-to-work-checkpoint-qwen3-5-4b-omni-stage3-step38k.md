# CharlieH512/A-really-shitty-not-going-to-work-checkpoint-qwen3.5-4b-omni-stage3-step38k

## Resumen

"A really shitty, not-going-to-work checkpoint" es un checkpoint intermedio de investigación del proyecto PLAICraft Omni, un intento de agente embodied para Minecraft en tiempo real y full-duplex. Lo publica el usuario CharlieH512 sobre el backbone Qwen3.5-4B, y su propósito declarado no es jugar bien, sino servir como material de estudio o punto de partida para fine-tuning. Cada 80 ms (12,5 Hz) el modelo observa la pantalla, escucha el audio del juego y de otros jugadores, emite habla y pulsa teclas y mueve el ratón.

El modelo tiene 4.444.797.571 parámetros en formato float32 (17,8 GB) y se distribuye con el código de entrenamiento exacto (commit `e5d8a72`), la configuración Hydra resuelta y utilidades de carga y conversión. No es un modelo de chat: su cabeza de texto está entrenada sobre transcripciones de habla por tick, no sobre texto libre, y el propio autor documenta fallos graves en la generación de teclado/ratón y en el apuntado de cámara.

Es relevante ahora como ejemplo abierto de arquitectura omni (visión, audio y acción motora en un mismo bucle de 12,5 Hz) sobre un backbone híbrido con capas Gated DeltaNet, y como caso práctico de los problemas de alineación entre percepción y acción en agentes embodied. El entrenamiento se detuvo en el paso 38.000 de los 100.000 previstos por un fallo del run, y los pesos no tienen licencia elegida todavía.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 24 capas Gated DeltaNet + 8 capas de atención completa, hidden size 2560, sobre Qwen3.5-4B |
| Parámetros totales | 4.444.797.571 (4,44B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ventanas de entrenamiento de 750 ticks = 60 s) |
| Tipos de cuantización | No disponible (pesos publicados en float32) |
| Idiomas soportados | No disponible |
| Licencia | Sin elegir ("not-yet-chosen", campo `license: other`) |
| Formato de pesos | safetensors (4 shards + índice), float32 |

## Arquitectura y entrenamiento

El backbone es Qwen3.5-4B completamente fine-tuneado, con 24 capas Gated DeltaNet y 8 capas de atención completa. Su torre de visión propia está congelada, no incluida en el checkpoint y se carga desde `Qwen/Qwen3.5-4B`; convierte cada fotograma de 512x288 en 144 tokens. El reloj del modelo es de 80 ms por tick y cada tick suma sus entradas en una única fila del backbone, con los tokens de vídeo delante; un fotograma entra cada 6 ticks (480 ms). Las entradas por tick son audio escuchado (vectores de 768 d de MOSS-Audio-Tokenizer y estados de 512 d de NVIDIA FastConformer, combinados por una puerta aprendida), el token de texto previo del propio modelo, códigos de habla y códigos de teclado/ratón. Las salidas por tick son un token de texto (vocabulario de Qwen3.5 más PAD, EPAD y 15 etiquetas no verbales, al estilo Moshi), 13 códigos de habla NanoCodec (códec de 22 kHz, 2016 códigos cada uno) y 8 códigos de teclado/ratón (1000 cada uno) del tokenizador `CharlieH512/km_tokenizer_ctx14_8x1000` (revisión `7a66d378`). Habla y teclado/ratón van 2 ticks por detrás del texto. El prefijo de condicionamiento incluye una huella de voz del hablante (TitaNet, 192 d) más ranuras de género, edad y habilidad, cada una con un valor "desconocido" aprendido.

El entrenamiento cubrió 38.000 pasos de los 100.000 previstos (el run falló en el paso 38.007) en 4x NVIDIA RTX PRO 6000 Blackwell de 96 GB, con DeepSpeed ZeRO-2 y precisión mixta bf16. Optimizador FusedAdam con lr 1e-4 para embeddings y cabezas nuevas, 2e-5 para el backbone, weight decay 0.01, 2.500 pasos de warm-up y decaimiento coseno hasta el 10%. El batch fue de 96.000 filas de backbone por GPU y paso, con ventanas de 60 s (750 ticks). La mezcla de datos por pasos fue: gameplay con voz, vídeo y teclado/ratón (PLAICraft) 0,40; conversaciones de dos hablantes (DuplexChat) 0,40; chat de Nemotron 0,05; instruction-following de Nemotron 0,05; question answering de Minecraft (JARVIS) 0,05; y question answering sobre capturas de Minecraft 0,05. La pérdida de validación en el paso 38.000 fue `val/total_loss` 3.160. Partió de una etapa anterior de conocimiento textual de Minecraft del mismo backbone, más adaptadores de audición y embeddings de teclado/ratón precalentados por separado. El run tuvo dos segmentos (pasos 0 a 27.000 en el commit `1d6c538` y reanudación en `e5d8a72` hasta 38.000); entre ambos commits el código solo añadió ficheros nuevos, por lo que `e5d8a72` cubre todo el run. Los datos de entrenamiento no se publican por contener información personal en sus metadatos y en la caché de huellas de voz por jugador.

## Capacidades

- Percepción visual a 12,5 Hz con un fotograma cada 480 ms, codificado en 144 tokens por imagen.
- Percepción auditiva full-duplex: audio del juego y de otros jugadores mediante MOSS-Audio-Tokenizer y FastConformer.
- Generación de habla: 13 códigos NanoCodec por tick a 22 kHz.
- Emisión de acciones de teclado y ratón: 8 códigos por tick con un tokenizador dedicado de contexto 14.
- Salida de texto por tick con 15 etiquetas no verbales adicionales (estilo Moshi).
- Condicionamiento por hablante: huella de voz TitaNet de 192 d más género, edad y habilidad.
- Capacidad conversacional de dos hablantes entrenada explícitamente (DuplexChat, 40% de los pasos).
- Conocimiento de Minecraft vía etapas previas de texto, JARVIS QA y QA sobre capturas.
- Tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible en el sentido de planificación simbólica; el modelo opera como política reactiva tick a tick.
- Capacidades multilingües: no disponible.

## Casos de uso

- Estudio de arquitecturas omni en tiempo real: el checkpoint permite inspeccionar cómo se fusionan visión, audio y acción en un único bucle de 12,5 Hz con un backbone híbrido Gated DeltaNet, útil para investigación sobre latencia y alineación temporal.
- Fine-tuning desde un estado intermedio: el repo incluye dos configuraciones de fine-tuning y herramientas de conversión de pesos, de modo que un equipo puede partir de este punto en lugar de entrenar desde cero.
- Reproducción de experimentos embodied: con el código del commit `e5d8a72` y `training_config.yaml` se puede reconstruir el entorno de entrenamiento y comparar recetas.
- Investigación sobre fallos de alineación percepción-acción: los problemas documentados (el teclado/ratón continúa el historial reciente y no responde a la pantalla; la cámara no apunta a nada útil) son un caso de estudio concreto de por qué la política de acción no aprende a condicionarse sobre el vídeo.
- Base para agentes de voz full-duplex en otros dominios: la pila de audio (MOSS + FastConformer + NanoCodec) y el esquema de salida texto/habla por tick son reutilizables para asistentes conversacionales de baja latencia.
- Evaluación de tokenizadores de acción: el tokenizador `km_tokenizer_ctx14_8x1000` y los 8 códigos por tick permiten experimentar con discretización de entradas de teclado y ratón en entornos simulados.
- Docencia sobre checkpoints de investigación: sirve para ilustrar qué significa publicar un estado intermedio con limitaciones explícitas y sin licencia definida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es la pérdida de validación en el paso 38.000: `val/total_loss` 3.160.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en float32 ocupan 17,8 GB; cargarlos requiere al menos ~18 GB de VRAM más el estado de activaciones y la torre de visión externa, por lo que en la práctica se necesita una GPU de 24 GB o más.
- GPU recomendadas: el entrenamiento usó 4x NVIDIA RTX PRO 6000 Blackwell (96 GB); para inferencia, una RTX 4090 (24 GB) o A100/H100 son opciones razonables dado el tamaño en fp32. No hay datos publicados de cuantización ni de ejecución en GPU de consumo menores.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) en fp32, sin margen amplio; no hay confirmación del autor ni recetas de cuantización.
- Opciones de despliegue: el repo proporciona `release_tools/` para cargar el modelo y `code/` con el código de inferencia; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y al ser un modelo omni con bucle de ticks propio es poco probable que encaje en esos servidores sin trabajo de adaptación.
- Latencia y throughput: el diseño apunta a un tick cada 80 ms (12,5 Hz), pero no se han publicado mediciones de latencia real ni de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (PLAICraft Omni stage 3) | 4,44B | No disponible (ventanas de 750 ticks) | Vídeo, audio, texto, habla, teclado/ratón | Sin elegir | Hugging Face, 0 descargas |
| Qwen3.5-4B (base) | ~4B | No disponible | Texto (y visión vía su torre) | Apache-2.0 | Hugging Face |
| Moshi (Kyutai) | No disponible en la información | No disponible | Audio full-duplex, texto | No disponible en la información | No disponible en la información |

La comparación con Moshi es pertinente por el esquema de salida de texto estilo Moshi y el enfoque full-duplex, pero no se dispone de sus especificaciones en la información proporcionada. No se conocen otros modelos comparables en la información disponible.

## Limitaciones y advertencias

- El propio autor califica el checkpoint como "no va a funcionar": es un estado intermedio, no un modelo listo para uso.
- La salida de teclado/ratón continúa mayoritariamente el historial reciente de acciones y apenas responde a lo que hay en pantalla.
- El movimiento de cámara (ratón) no apunta de forma fiable a ningún sitio útil.
- Con texto plano y sin audio, la cabeza de texto no continúa la frase de forma sensata: fue entrenada sobre transcripciones de habla por tick, no sobre texto libre.
- Entrenamiento incompleto: 38.000 de 100.000 pasos previstos, tras un fallo del run en el paso 38.007.
- Licencia sin elegir: no hay permiso claro para uso comercial ni para redistribución; los componentes mantienen sus propias licencias (Qwen3.5-4B Apache-2.0, MOSS-Audio-Tokenizer Apache-2.0, NanoCodec con licencia NVIDIA, FastConformer y TitaNet CC-BY-4.0, y algunos modelos de preprocesamiento opcionales son no comerciales).
- Los datos de entrenamiento no se publican por contener información personal (metadatos y caché de huellas de voz por jugador), lo que impide auditar sesgos de datos.
- Debe usarse el código de `code/` en el commit `e5d8a72`, no versiones posteriores del proyecto: cambiaron el framerate de vídeo, el tokenizador de teclado/ratón y los loaders, y no cargarán ni ejecutarán estos pesos correctamente.
- La torre de visión no está incluida en el checkpoint y debe cargarse desde `Qwen/Qwen3.5-4B`.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser un modelo de investigación sin benchmarks, no hay evidencia de robustez.
- Idiomas soportados: no disponibles, lo que impide garantizar cobertura multilingüe.
- 0 descargas y 0 likes en Hugging Face: sin validación externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/CharlieH512/A-really-shitty-not-going-to-work-checkpoint-qwen3.5-4b-omni-stage3-step38k
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Tokenizador de teclado/ratón: https://huggingface.co/CharlieH512/km_tokenizer_ctx14_8x1000
- MOSS-Audio-Tokenizer (Apache-2.0, origen de `assets/moss_zq_codebook.npz`): no disponible en la información proporcionada
- NVIDIA NanoCodec: no disponible en la información proporcionada (consultar su model card)
- NVIDIA FastConformer y TitaNet (CC-BY-4.0): no disponible en la información proporcionada
- Repositorio de código del proyecto PLAICraft Omni (commit `e5d8a72`): incluido dentro del repo de Hugging Face en `code/`
- Documentación de datos y entrenamiento: incluida en el repo en `docs/DATA.md` y `docs/TRAINING_AND_INFERENCE.md`
- Paper, blog o demo: no disponible en la información proporcionada
