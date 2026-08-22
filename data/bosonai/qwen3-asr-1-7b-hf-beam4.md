# bosonai/Qwen3-ASR-1.7B-hf-beam4

## Resumen

`bosonai/Qwen3-ASR-1.7B-hf-beam4` es una derivación de decodificación del modelo de reconocimiento automático de voz (ASR) `Qwen/Qwen3-ASR-1.7B-hf`, desarrollada por el usuario bosonai. Los pesos, el procesador y el tokenizador son idénticos al modelo base; la única modificación es la configuración de generación, que fija `num_beams: 4` en `generation_config.json` en lugar de la decodificación greedy del original. El objetivo es mejorar la tasa de error de palabra (WER) sin alterar el entrenamiento.

El modelo base pertenece a la familia Qwen3-ASR, una serie open-source de modelos ASR que soporta identificación de idioma y reconocimiento en 59 lenguas y dialectos, construida sobre la capacidad de comprensión de audio de Qwen3-Omni. El checkpoint pesa 2.038.052.480 parámetros (en safetensors), ocupa unos 4,1 GB y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial y modificación sin restricciones relevantes.

Su relevancia actual radica en que ofrece una mejora medible y determinista del WER sin necesidad de reentrenar ni cambiar pesos, algo útil para pipelines de ASR en producción que buscan una ganancia inmediata de precisión con un coste de inferencia adicional controlado. Es una opción práctica para quienes ya usan el modelo base y quieren reducir errores en transcripciones cortas sin migrar a un modelo más grande.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con encoder de audio y decoder de texto (basado en Qwen3-Omni) |
| Parametros totales | 2.038.052.480 (aprox. 2,0B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos originales en safetensors) |
| Idiomas soportados | Modelo base: 59 idiomas y dialectos; la model card de esta derivacion indica "en" (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `Qwen3-ASR-1.7B-hf`, que combina un encoder de audio y un decoder de texto dentro del paradigma transformer, heredado de Qwen3-Omni. El modelo procesa señales de voz y genera transcripciones de texto, además de poder identificar el idioma de entrada. El entrenamiento del modelo base se realizó con datos de habla a gran escala y con un fuerte componente de comprensión de audio, aunque no se proporcionan detalles sobre la composición exacta del dataset ni sobre técnicas como RLHF o DPO en la información disponible.

Esta derivación concreta no introduce ninguna innovación arquitectónica ni de entrenamiento: los pesos y el procesador son exactamente los del checkpoint base en su revisión `bcd2b5b7f32b480ab5790554cfa8347f246a14f3`. El cambio es puramente de inferencia: se modifica el parámetro `num_beams` de 1 (greedy) a 4, manteniendo el muestreo desactivado para que la decodificación siga siendo determinista. Esto permite aprovechar la búsqueda en haz para reducir el WER sin tocar el modelo.

## Capacidades

- Reconocimiento automático de voz (ASR) en 59 idiomas y dialectos según el modelo base.
- Identificación de idioma (language identification) integrada en la decodificación.
- Generación de transcripciones de texto a partir de audio de entrada.
- Decodificación determinista con búsqueda en haz de 4 caminos (beam search) configurada por defecto.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de visión o audio más allá del ASR.
- La model card de esta derivación específica solo indica soporte para inglés, aunque el modelo base es multilingüe.

## Casos de uso

- **Transcripción de reuniones y conferencias**: el modelo puede transcribir audio de reuniones con alta precisión en inglés, y su decodificación con beam de 4 reduce el WER en comparación con greedy, lo que es útil para actas y resúmenes. Su tamaño de 2B permite ejecutarlo en GPUs de gama media con baja latencia.
- **Subtitulado automático de vídeo**: integrándolo en un pipeline de procesamiento de vídeo, se pueden generar subtítulos en inglés de forma automatizada. La mejora de WER es relevante para mantener la coherencia en vídeos largos.
- **Asistentes de voz**: sirve como backend de ASR en asistentes personales o sistemas de dictado, donde la precisión es crítica y la decodificación determinista evita variaciones inesperadas en la salida.
- **Análisis de llamadas de atención al cliente**: en centros de contacto, el modelo transcribe llamadas para su posterior análisis de sentimiento o cumplimiento normativo. El beam-4 aporta un WER más bajo, reduciendo errores en nombres y términos técnicos.
- **Transcripción médica y legal**: para dictados clínicos o testimonios legales, donde la fidelidad de la transcripción es esencial, la mejora de WER puede marcar la diferencia en la documentación final.
- **Accesibilidad**: puede alimentar sistemas de subtitulado en tiempo real para personas con discapacidad auditiva, aprovechando la baja latencia de un modelo de 2B parámetros en GPU modernas.

## Benchmarks y rendimiento

El autor evaluó el modelo con el código público del Open ASR Leaderboard (commit `d1e99b25524814332d6868a5645e568670834cfb`) sobre una pantalla determinista de 200 ejemplos de cada uno de los siete conjuntos de datos públicos de habla corta en inglés. Los resultados de WER macro son:

| Decodificacion | WER macro (7 conjuntos) |
|---|---:|
| Greedy (base) | 5.0600 |
| Beam 2 | 5.0286 |
| **Beam 4 (este modelo)** | **5.0100** |
| Beam 6 | 5.0229 |
| Beam 8 | 5.0214 |

La pantalla es una medición de selección de candidatos, no la evaluación completa del leaderboard; la evaluación pública completa y el envío al leaderboard están en curso. No se han publicado resultados en otros benchmarks como MMLU o HumanEval, ya que el modelo es específico de ASR.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con los pesos en FP16, el modelo ocupa aproximadamente 4,1 GB de VRAM; con cuantización de 8 bits o 4 bits, puede reducirse a unos 2-3 GB, aunque no se documentan configuraciones de cuantización específicas.
- **GPU recomendadas**: una NVIDIA RTX 3060 (12 GB) o superior es suficiente para ejecutar el modelo en FP16; una RTX 4090 o A10 proporciona más margen para mayor longitud de audio o mayor batch.
- **Compatibilidad con GPU de consumo**: sí, cabe en la mayoría de tarjetas de gama media con 8 GB de VRAM o más.
- **Opciones de despliegue**: compatible con Transformers de HuggingFace, vLLM, Ollama y otros frameworks que soporten modelos de audio; la configuración de generación se carga automáticamente desde `generation_config.json`.
- **Latencia y throughput**: no se proporcionan mediciones oficiales; un modelo de 2B parámetros en una RTX 4090 puede transcribir audio en tiempo real o más rápido, aunque la latencia depende del largo de la entrada y del batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| bosonai/Qwen3-ASR-1.7B-hf-beam4 | 2.038.052.480 | No disponible | 59 (base), "en" (card) | Apache-2.0 | Safetensors |
| Qwen/Qwen3-ASR-1.7B-hf (base) | 2.038.052.480 | No disponible | 59 | Apache-2.0 | Safetensors |
| Whisper large-v3 (alternativa) | 1.550.000.000 (aprox.) | No disponible | 99 | MIT | Safetensors |

La comparativa se basa en datos de conocimiento general; no se dispone de benchmarks comparativos oficiales entre estos modelos en la información proporcionada. La ventaja de esta derivación es su WER ligeramente inferior al base con la misma carga de parámetros, mientras que Whisper large-v3 es una alternativa popular con más idiomas pero sin datos de comparación directa en esta fuente.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: no se documentan sesgos específicos, pero como modelo ASR, puede alucinar palabras o frases en audio con ruido, acentos poco representados o solapamiento de voces.
- **Limitación de idioma en la model card**: aunque el modelo base soporta 59 idiomas, la model card de esta derivación indica solo "en" (inglés), lo que sugiere que la evaluación se ha realizado únicamente en inglés y que el rendimiento en otros idiomas no está garantizado.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial sin restricciones significativas, pero el modelo base y esta derivación se distribuyen tal cual, sin garantías de precisión en entornos de producción específicos.
- **Caveat de la decodificación**: el cambio a beam 4 aumenta el coste computacional frente a greedy (aproximadamente multiplica el tiempo de decodificación), aunque la mejora de WER es marginal (0,05 puntos en la pantalla). Para aplicaciones con restricciones de latencia, la diferencia puede no justificar el coste.
- **Reproducibilidad**: la evaluación fue hecha con una pantalla de 200 ejemplos por conjunto, no con la evaluación completa del leaderboard; los resultados finales pueden variar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bosonai/Qwen3-ASR-1.7B-hf-beam4
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf
- Repositorio oficial de Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Informe técnico Qwen3-ASR (arXiv): https://arxiv.org/pdf/2601.21337
- Benchmarks en OpenModelMap: https://openmodelmap.com/model/Qwen/Qwen3-ASR-1.7B-hf
