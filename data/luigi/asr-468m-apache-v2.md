# Luigi/asr-468m-apache-v2

## Resumen

`Luigi/asr-468m-apache-v2` es un modelo de reconocimiento automático del habla (ASR) multilingüe de 467,81 millones de parámetros, destilado a partir de Qwen3-ASR-0.6B (Apache-2.0). Desarrollado por Luigi, el modelo cubre siete idiomas —chino, inglés, francés, alemán, japonés, coreano y cantonés— y destaca por ofrecer una licencia Apache-2.0 totalmente permisiva para uso comercial, en contraste con alternativas como Audio8-ASR-0.1B, que usa CC-BY-NC.

El modelo combina la torre de audio congelada de Qwen3-ASR-0.6B (18 capas × 896 dimensiones, 186,38M de parámetros) con un decodificador de 8 capas y 1024 dimensiones que conserva el vocabulario completo de 151.936 tokens, sin poda de vocabulario. Esto elimina la necesidad de archivos de reasignación de identificadores (`vocab_remap.json`), simplificando su integración. Según las pruebas del autor sobre 200 clips del conjunto FLEURS, supera a Audio8-ASR-0.1B en la métrica macro (14,55 frente a 15,31), siendo además un 44% más grande.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (torre de audio congelada 18×896 + decodificador de 8 capas × 1024) |
| Parametros totales | 467.807.232 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | chino (zh), inglés (en), francés (fr), alemán (de), japonés (ja), coreano (ko), cantonés (yue) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina una torre de audio congelada de 18 capas con 896 unidades de ancho (186,38M de parámetros), heredada de Qwen3-ASR-0.6B, con un decodificador de 8 capas y 1024 dimensiones entrenado específicamente para este modelo. El vocabulario es el completo de 151.936 tokens, sin poda, lo que evita cualquier reasignación de identificadores en el momento de la inferencia.

El proceso de entrenamiento es inusual: se entrenó primero un modelo especialista independiente de 6 capas y 42.000 tokens de vocabulario, y posteriormente sus 6 capas entrenadas se reinsertaron en los índices de profundidad originales dentro del modelo padre de 8 capas (`Luigi/asr-468m-apache-base`). Las filas del vocabulario del especialista (42.000) se mantuvieron y las ~110.000 restantes se rellenaron con las del modelo padre. No se realizó ningún entrenamiento adicional tras esta operación. Los datos de entrenamiento incluyen Common Voice 17 (CC0), WenetSpeech4TTS, Multilingual LibriSpeech, LibriSpeech, FLEURS (CC-BY-4.0), AISHELL-1 (Apache-2.0) y YouTube-Cantonese (MIT), todos comercialmente utilizables.

## Capacidades

- Reconocimiento de voz multilingüe en siete idiomas: chino, inglés, francés, alemán, japonés, coreano y cantonés.
- Transcripción directa de audio a texto sin necesidad de reasignación de vocabulario.
- Inferencia eficiente gracias a la destilación desde un modelo mayor (Qwen3-ASR-0.6B) y la congelación de la torre de audio.
- Compatible con el ecosistema `qwen_asr` (transformers backend), incluyendo `Qwen3ASRForConditionalGeneration` y `Qwen3ASRProcessor`.
- Vocabulario completo de 151.936 tokens, lo que evita pérdidas de cobertura léxica frente a modelos con vocabulario podado.
- Licencia Apache-2.0, apta para uso comercial sin restricciones de atribución.

## Casos de uso

- Transcripción de reuniones y videoconferencias: el modelo puede transcribir conversaciones en varios idiomas (inglés, francés, alemán, etc.) en tiempo real o en diferido, con una precisión aceptable para entornos empresariales.
- Subtitulado automático de vídeo: su soporte para cantonés, chino y japonés lo hace adecuado para plataformas de vídeo que necesitan subtítulos en idiomas asiáticos y europeos.
- Atención al cliente multilingüe: integrable en sistemas de voz automatizados para transcribir llamadas de soporte en siete idiomas, permitiendo análisis posterior de sentimiento o búsqueda de incidencias.
- Archivado de audio judicial o administrativo: transcripción de grabaciones legales o administrativas en varios idiomas, con licencia que permite su uso en entornos corporativos sin fricciones legales.
- Asistentes de voz en dispositivos embebidos: su tamaño de 467M parámetros y la posibilidad de cuantizar lo hacen viable para despliegue en servidores de gama media o edge computing.
- Generación de subtítulos para medios de comunicación: soporte de cantonés y chino mandarín, combinado con alemán y francés, facilita la localización de contenidos en mercados europeos y asiáticos.
- Pruebas de rendimiento ASR: el modelo puede servir como punto de referencia en evaluaciones comparativas de sistemas de transcripción multilingüe, gracias a sus resultados públicos en FLEURS.

## Benchmarks y rendimiento

El autor publicó resultados sobre un conjunto de prueba de 200 clips de FLEURS, comparando con Audio8-ASR-0.1B. Las métricas son tasas de error (CER para zh/ja/ko/yue y WER para en/fr/de), promediadas con macro de idiomas:

| Idioma | Audio8-ASR-0.1B | asr-468m-apache-v2 | Delta |
|---|---|---|---|
| Francés | 20,88 | 16,40 | −4,48 |
| Cantonés | 16,16 | 14,78 | −1,38 |
| Japonés | 17,97 | 16,63 | −1,34 |
| Coreano | 13,97 | 11,89 | −2,08 |
| Chino | 11,94 | 12,08 | +0,14 |
| Inglés | 8,51 | 10,71 | +2,20 |
| Alemán | 17,73 | 19,35 | +1,62 |
| **Macro** | **15,31** | **14,55** | **−0,76** |

El modelo supera a Audio8-ASR-0.1B en la media macro, con mejoras significativas en francés, coreano y cantonés, aunque pierde en inglés y alemán. No se han publicado resultados en benchmarks estándar como MMLU o HumanEval, por tratarse de un modelo de ASR, no de lenguaje general.

## Requisitos de hardware

- VRAM estimada: los pesos en bfloat16 ocupan aproximadamente 0,94 GB (467,81M × 2 bytes), aunque la inferencia completa requiere memoria adicional para activaciones y estados intermedios. Con cuantización a 8 bits o 4 bits, se puede reducir el consumo a ~0,5 GB o ~0,25 GB respectivamente.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en bfloat16; se recomienda RTX 3060/4060, A10 o superiores para latencia baja. Para uso en producción, una A10G o A100 con soporte bfloat16 ofrece el mejor rendimiento.
- Compatible con hardware de consumo: sí, cabe en GPUs de gama media como RTX 3060 o RTX 4060 (8 GB) con cuantización ligera.
- Opciones de despliegue: compatible con el backend de transformers de `qwen_asr`, y por tanto con las bibliotecas estándar de Hugging Face. No se menciona soporte directo para vLLM, llama.cpp, Ollama o TGI en la documentación disponible.
- Latencia y throughput: no disponible en la información proporcionada. Al ser un modelo de 467M parámetros, se espera una latencia de decodificación de ~10-50 ms por paso en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Licencia | Idiomas | Métrica macro FLEURS (CER/WER) |
|---|---|---|---|---|
| **asr-468m-apache-v2** | 467,81M | Apache-2.0 | 7 (zh, en, fr, de, ja, ko, yue) | 14,55 |
| Audio8-ASR-0.1B | 324M | CC-BY-NC | 7 (mismos idiomas) | 15,31 |
| Qwen3-ASR-0.6B | 600M aprox. | Apache-2.0 | 7+ (multilingüe) | no disponible |
| Whisper large-v3 | 1,55B | MIT | 99+ | no comparable directamente |

El modelo supera a Audio8-ASR-0.1B en la media macro y es completamente comercial, mientras que Audio8 está restringido a uso no comercial. Qwen3-ASR-0.6B es su modelo padre, con más parámetros y probablemente mayor calidad, pero también más pesado. Whisper large-v3 es un modelo general de ASR con muchos más idiomas y parámetros, pero con licencia MIT y mayor coste de inferencia.

## Limitaciones y advertencias

- Rendimiento inferior en inglés y alemán comparado con Audio8-ASR-0.1B: +2,20 y +1,62 de error respectivamente, lo que puede ser relevante si el uso principal es estos idiomas.
- El modelo está destilado de Qwen3-ASR-0.6B, por lo que hereda posibles sesgos o limitaciones de su modelo padre, aunque no hay documentación al respecto.
- Riesgo de alucinación en ASR: como todo sistema de transcripción, puede producir texto inventado en audio ambiguo o con ruido de fondo.
- No se ha publicado información sobre el contexto máximo soportado ni sobre el comportamiento con audio de larga duración.
- El modelo se evaluó solo sobre 200 clips de FLEURS, un conjunto relativamente pequeño, y no hay resultados de benchmarks externos o evaluaciones independientes.
- No se ha documentado el comportamiento con acentos, dialectos o ruido de fondo, por lo que su robustez en entornos reales no está verificada.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Luigi/asr-468m-apache-v2
- Modelo base (Stage-1): https://huggingface.co/Luigi/asr-468m-apache-base
- Modelo relacionado (324M con vocabulario podado): https://huggingface.co/Luigi/asr-324m-apache
- Modelo de referencia Audio8-ASR-0.1B: https://huggingface.co/Audio8/Audio8-ASR-0.1B
- Modelo padre Qwen3-ASR-0.6B: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Documentación del proceso de derivación: https://github.com/Luigi/asr-324m-apache/blob/main/docs/findings.md
