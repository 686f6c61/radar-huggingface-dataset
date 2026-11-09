# AdaptiveChunking/ali_mem-mixed-nosplit_s1

## Resumen

`ali_mem-mixed-nosplit_s1` es un modelo de investigación publicado por el usuario AdaptiveChunking en Hugging Face, construido sobre el framework [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet). No es un modelo de lenguaje conversacional al uso, sino un experimento de tokenización dinámica a nivel de byte: la arquitectura `ali` con objetivo `ratio` está diseñada para aprender a segmentar (o no segmentar, de ahí `nosplit`) secuencias de bytes mediante mecanismos de chunking adaptativo. El modelo se entrenó durante 6000 pasos con batches de 32 secuencias de 1024 bytes sobre textos en inglés, turco y finés.

El checkpoint contiene 22.785.088 parámetros (datos reales extraídos de los safetensors), lo que lo sitúa en la categoría de modelos pequeños, adecuados para experimentación en una sola GPU consumer. El repositorio ocupa 6,1 GB porque incluye no solo los pesos finales sino también múltiples ramas `step-N` con checkpoints intermedios, estados completos del entrenador (`training_state/checkpoint.pt`) y sondas de evaluación sobre FLORES+.

Su relevancia es fundamentalmente académica: sirve como artefacto reproducible para estudiar estrategias de chunking dinámico y tokenización byte-level en modelos H-Net. No está pensado para despliegue en producción ni para tareas generativas convencionales, y no se han publicado benchmarks de rendimiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (variante `ali`) con tokenización byte-level y chunking dinámico |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 1024 bytes) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin GGUF publicado) |
| Idiomas soportados | en, tr, fi (idiomas de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), más `training_state/checkpoint.pt` en PyTorch |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net implementada en beetle-hnet, con la variante `ali` y un objetivo de entrenamiento de tipo `ratio`. La característica diferencial es el chunking dinámico a nivel de byte: en lugar de una tokenización estática tipo BPE, el modelo aprende representaciones sobre bytes y agrupa dinámicamente las secuencias en chunks. El schedule de decodificación es `ema` (media móvil exponencial) y el entrenamiento se realizó sin split explícito (`nosplit`), es decir, sin separación predefinida de segmentos.

Los datos de entrenamiento cubren tres idiomas (inglés, turco y finés) con 6000 pasos, batch de 32 y longitud de 1024 bytes por secuencia. El repositorio conserva checkpoints intermedios en una programación logarítmica por fases (pasos 0, 1, 2, 4, 6, 8, 16, ..., 2^k), lo que permite reproducir la curva de entrenamiento. No se especifica en la información disponible el volumen total de tokens, la composición exacta del dataset ni si hubo fases de RLHF o DPO; el objetivo `ratio` sugiere una pérdida basada en ratios de compresión o segmentación, pero el detalle no está documentado en la model card.

## Capacidades

- Modelado de secuencias a nivel de byte con chunking dinámico aprendido.
- Entrenamiento y evaluación multilingüe limitada a inglés, turco y finés.
- Evaluación de fronteras de chunking mediante sondas FLORES+ (`probe/`).
- Pesos con tensores atados (tied weights) mapeados vía `config.json["tied_weights"]`.
- Reanudación exacta del entrenamiento desde `training_state/checkpoint.pt`.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo thinking.

## Casos de uso

- Investigación en tokenización byte-level: usar los checkpoints intermedios para analizar cómo evoluciona la segmentación dinámica a lo largo del entrenamiento y comparar con tokenizadores BPE estáticos.
- Reproducción de experimentos de chunking adaptativo: el estado completo del entrenador permite reanudar exactamente desde cualquier paso de la programación logarítmica, útil para estudios de ablación.
- Evaluación de fronteras lingüísticas: las sondas FLORES+ incluidas permiten medir si el modelo aprende a segmentar en fronteras morfológicas en turco y finés, idiomas aglutinantes donde el chunking es especialmente relevante.
- Estudio de eficiencia de compresión: el objetivo `ratio` puede analizarse para medir tasas de compresión de secuencias de bytes frente a baselines.
- Docencia y formación: modelo pequeño (22,8 M de parámetros) que cabe en cualquier GPU consumer y sirve para ilustrar arquitecturas H-Net y tokenización dinámica en cursos de PLN.
- Base para fine-tuning experimental: al ser Apache 2.0 y pesar pocos parámetros, puede adaptarse a otros corpus byte-level para probar variantes de chunking en dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 91 MB (22,8 M × 4 bytes); en fp16 unos 46 MB. Cabe holgadamente en cualquier GPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas e incluso en CPU para inferencia puntual.
- Opciones de despliegue: PyTorch nativo (el repositorio usa `library_name: pytorch`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos GGUF publicados no es desplegable directamente en esos runtimes.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_mem-mixed-nosplit_s1 | 22,8 M | 1024 bytes (entrenamiento) | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face |
| Modelos BPE estándar (p. ej. GPT-2 tokenizer) | N/A (tokenizador) | N/A | Tokenización estática subword | MIT / variable | Amplia |
| Byte-level transformers pequeños (p. ej. ByT5-small) | ~300 M | 1024 bytes típico | Transformer byte-level sin chunking | Apache 2.0 | Hugging Face |

La comparación es orientativa: no se dispone de benchmarks del modelo de AdaptiveChunking que permitan contrastar rendimiento con alternativas. La diferencia clave frente a ByT5 es el mecanismo de chunking dinámico, y frente a tokenizadores BPE, la operación directa sobre bytes sin vocabulario fijo.

## Limitaciones y advertencias

- Modelo de investigación sin benchmarks publicados: no hay evidencia de calidad generativa ni de rendimiento en tareas downstream.
- Idiomas limitados a inglés, turco y finés; no se garantiza comportamiento en castellano ni en otros idiomas.
- Entrenamiento corto (6000 pasos) y corpus presumiblemente reducido: riesgo alto de sobreajuste y de baja generalización.
- No es un modelo conversacional: no se documenta instrucción, alineación ni formato de chat.
- Riesgo de alucinación no evaluado; al operar a nivel de byte, la salida puede ser incoherente fuera del dominio de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero al no haber validación de calidad ni soporte del autor, no se recomienda en producción.
- El repositorio incluye estados de entrenador y checkpoints intermedios que inflan el tamaño a 6,1 GB; la descarga completa no es necesaria para usar solo los pesos finales.
- Los tensores atados requieren respetar `config.json["tied_weights"]` al cargar; ignorarlo puede provocar errores de carga.

## Enlaces

- Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-mixed-nosplit_s1
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Perfil del autor en Hugging Face: https://huggingface.co/AdaptiveChunking
