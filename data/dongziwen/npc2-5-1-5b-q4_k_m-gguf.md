# Dongziwen/npc2.5-1.5B-Q4_K_M-GGUF

# Dongziwen/npc2.5-1.5B-Q4_K_M-GGUF

## Resumen

El modelo `Dongziwen/npc2.5-1.5B-Q4_K_M-GGUF` es una conversión a formato GGUF del checkpoint `Dongziwen/npc2.5-1.5B`, creada por el usuario Dongziwen mediante la herramienta GGUF-my-repo de llama.cpp. Se trata de un modelo con 1.543.714.304 parámetros totales, un tamaño de repositorio de aproximadamente 1.0 GB, y cuantización Q4_K_M, lo que lo hace adecuado para ejecución local en hardware de consumo o incluso en CPU. El nombre del modelo sugiere una posible orientación a personajes no jugadores (NPC), aunque no se dispone de documentación oficial que lo confirme. La ficha técnica del modelo original no está publicada, por lo que la información disponible es muy limitada. Este repositorio resulta de interés principalmente para desarrolladores que buscan modelos pequeños en formato GGUF para prototipado rápido, inferencia local o experimentación con cuantización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No disponible (no se ha confirmado que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (en esta versión) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura, los datos de entrenamiento ni el proceso de alineación en la model card del modelo original. El checkpoint base es `Dongziwen/npc2.5-1.5B`, del cual no se dispone de una ficha técnica pública. El nombre del modelo y el número de parámetros sugieren una posible relación con la familia Qwen2.5 (concretamente con la variante de 1.5B), pero no hay confirmación oficial. Este repositorio en particular es una conversión a GGUF realizada con llama.cpp, por lo que conserva la arquitectura original en formato compatible con la biblioteca. Se desconocen el número de tokens de entrenamiento, la composición del dataset y si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto: no hay información publicada sobre capacidades específicas de generación, razonamiento o código.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.
- Al ser un modelo pequeño (1.5B) en formato GGUF, se espera un uso típico de modelos de este tamaño, pero no hay documentación que lo confirme.

## Casos de uso

- Inferencia local sin conexión: gracias a su tamaño de ~1 GB y al formato GGUF, el modelo puede ejecutarse en portátiles, mini PCs o incluso Raspberry Pi mediante llama.cpp, permitiendo asistentes conversacionales que no dependen de servicios externos.
- Prototipado rápido de chatbots: los desarrolladores pueden integrar el modelo en entornos de desarrollo para probar interacciones conversacionales básicas antes de migrar a modelos más grandes.
- Simulación de personajes no jugadores (NPC): el nombre del checkpoint sugiere una posible orientación a este tipo de aplicaciones, por lo que podría usarse como base para experimentar con diálogos simples en videojuegos o entornos interactivos, aunque no hay confirmación oficial.
- Integración en pipelines de mensajería: el modelo puede desplegarse como un servidor de inferencia (llama-server) para responder automáticamente en aplicaciones de chat, con una latencia baja en hardware modesto.
- Experimentación con cuantización: este repositorio es útil para estudiar el impacto de la cuantización Q4_K_M en la calidad y el rendimiento de modelos de 1.5B, comparando con versiones de mayor precisión.
- Despliegue en sistemas embebidos: al ser un modelo ligero, puede ejecutarse en dispositivos de bajo consumo energético, como routers, SBCs o tablets, para aplicaciones de asistencia offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Se desconocen las puntuaciones en MMLU, HumanEval, GSM8K u otras métricas de evaluación.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q4_K_M ocupa ~1.0 GB. Sumando el overhead de contexto (por ejemplo, 2048 tokens puede requerir 200-500 MB adicionales según la implementación), se recomienda al menos 2 GB de VRAM para inferencia en GPU.
- GPU recomendadas: tarjetas con 2 GB o más de VRAM, como RTX 3050, GTX 1660, RTX 2060, o iGPU modernas con memoria compartida suficiente. También puede ejecutarse en CPU con 4 GB de RAM.
- Compatibilidad con GPU de consumo: sí, el modelo puede ejecutarse en la mayoría de GPUs de consumo de los últimos años.
- Opciones de despliegue: llama.cpp (CLI y server), Ollama, LM Studio, o cualquier otra herramienta compatible con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Dongziwen/npc2.5-1.5B-Q4_K_M-GGUF | 1.543.714.304 | GGUF (Q4_K_M) | No disponible | No disponible | No disponible |
| Qwen2.5-1.5B-Instruct Q4_K_M (Joshua65535) | ~1.540.000.000 | GGUF (Q4_K_M) | No disponible | No disponible | No disponible |
| Dongziwen/Oral-Qwen2.5-1.5B-Q4_K_M-GGUF | ~1.540.000.000 | GGUF (Q4_K_M) | No disponible | No disponible | No disponible |

La comparativa se basa en la disponibilidad pública de los repositorios y en el número de parámetros estimado, pero no se dispone de datos de rendimiento ni de licencias confirmadas.

## Limitaciones y advertencias

- Ausencia de documentación: la model card no aporta información sobre arquitectura, entrenamiento, capacidades ni límites del modelo, lo que dificulta su evaluación para uso en producción.
- Riesgo de alucinación: al ser un modelo pequeño y sin datos sobre su entrenamiento, es probable que genere respuestas incorrectas o inventadas, especialmente en dominios especializados.
- Sesgos desconocidos: no hay información sobre la composición del dataset, por lo que no es posible identificar sesgos de género, raza, idioma u otros.
- Licencia no especificada: no se ha indicado la licencia del modelo original ni de esta conversión, lo que puede ser un problema para aplicaciones comerciales.
- Limitaciones de contexto: al no conocerse la longitud de contexto, no se puede garantizar un rendimiento adecuado en tareas que requieran ventanas largas.
- Sin garantías de calidad: la ausencia de benchmarks y de una ficha técnica oficial implica que no se puede validar el modelo frente a alternativas similares.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Dongziwen/npc2.5-1.5B-Q4_K_M-GGUF
- Modelo base (sin ficha técnica disponible): https://huggingface.co/Dongziwen/npc2.5-1.5B
- Repositorio del mismo autor con formato similar: https://huggingface.co/Dongziwen/Oral-Qwen2.5-1.5B-Q4_K_M-GGUF
