# rekidane/Tibeb-Pro

## Resumen

Tibeb-Pro es un modelo de lenguaje de gran escala publicado por Kidanemaryam W. Reta bajo el paraguas del proyecto Tibeb (ጥበብ, "sabiduría" en amárico). Se trata de una redistribución con identidad propia de los pesos abiertos de DeepSeek-V4-Pro-0813, el modelo insignia de DeepSeek-AI. La versión v0.1, publicada en noviembre de 2026, no incorpora entrenamiento adicional específico: los pesos son idénticos a los del modelo base y la única modificación es la inyección de un system prompt por defecto con la identidad Tibeb en el codificador de chat.

Técnicamente es un transformer con arquitectura Mixture-of-Experts (DeepSeek-V4) de aproximadamente 1,6 billones de parámetros totales (1,7 si se cuenta el módulo DSpark de decodificación especulativa), con 49.000 millones de parámetros activos por token y una ventana de contexto de 1 millón de tokens. Los pesos se distribuyen en precisión FP8, lo que explica el tamaño del repositorio, cercano a los 893 GB.

Su relevancia es doble: por un lado, ofrece acceso a las capacidades del modelo base DeepSeek-V4 bajo licencia MIT, más permisiva que muchas alternativas; por otro, sirve como base para el plan de trabajo anunciado por el autor, que contempla entrenamiento e instrucción específicos en amárico, ajuste de identidad y variantes más ligeras para hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (DeepSeek-V4) |
| Parametros totales | 1.650.497.936.906 (aprox. 1,6 B en el modelo principal; 1,7 B incluyendo DSpark) |
| Parametros activos | 49 B por token |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | FP8 (8 bits) en los pesos distribuidos; no se documentan otras variantes |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; el plan de trabajo menciona amárico como objetivo futuro) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |
| Modelo base | deepseek-ai/DeepSeek-V4-Pro-0813 |
| Decodificacion especulativa | Módulo DSpark incluido en el checkpoint |
| Tamaño del repositorio | 892,8 GB |

## Arquitectura y entrenamiento

Tibeb-Pro hereda íntegramente la arquitectura de DeepSeek-V4: un transformer con capas Mixture-of-Experts donde cada token activa 49.000 millones de parámetros de un total de 1,6 billones. El checkpoint incluye el módulo DSpark de decodificación especulativa, que en la configuración de referencia de vLLM se emplea con 7 tokens especulativos y muestreo greedy. La ventana de contexto alcanza 1 millón de tokens, y la inferencia admite caché KV en FP8, block size de 256 y caché del indexador de atención en FP4 según la receta de servicio publicada.

No se ha aplicado entrenamiento adicional específico de Tibeb en esta versión: el autor indica explícitamente que los pesos de v0.1 son idénticos a DeepSeek-V4-Pro-0813, por lo que los datos de entrenamiento, el volumen de tokens, la composición del dataset y las fases de RLHF/DPO son los del modelo base, no documentados en la información disponible. La única modificación es de tipo conversacional: el codificador Python de la carpeta `encoding` inyecta automáticamente un system prompt de identidad Tibeb cuando la conversación no incluye mensaje de sistema, y admite el parámetro `reasoning_effort` con valores `low`, `high` y `max`.

## Capacidades

- Generación de texto y razonamiento de propósito general, con modo de razonamiento configurable mediante `reasoning_effort` (`low`, `high`, `max`).
- Procesamiento de contextos extremadamente largos: hasta 1 millón de tokens, adecuado para documentos completos, repositorios de código o historiales extensos.
- Capacidades heredadas del modelo base DeepSeek-V4-Pro-0813; la model card remite a los resultados publicados por DeepSeek-AI para el detalle de capacidades.
- Soporte de decodificación especulativa mediante el módulo DSpark incluido en el checkpoint, con integración documentada en vLLM y SGLang.
- Codificador de chat propio en Python (`encoding_dsv4`) con funciones `encode_messages` y `parse_message_from_completion_text`, en lugar de plantilla Jinja.
- Identidad Tibeb por defecto en el codificador de chat, desactivable con `use_default_system_prompt=False` o sustituible por un system prompt propio.
- Compatibilidad con endpoints (`endpoints_compatible` según los tags del repositorio).
- Capacidades multilingües: no disponible en detalle; el amárico es un objetivo del plan de trabajo, no una capacidad verificada de esta versión.

## Casos de uso

- Análisis de documentación técnica extensa: con 1M tokens de contexto, el modelo puede ingerir manuales, normativas o contratos completos en una sola pasada y responder preguntas cruzadas sin trocear el material.
- Revisión de repositorios de código: la ventana de contexto permite cargar varios módulos y sus tests para tareas de auditoría, refactorización o detección de inconsistencias entre implementación y especificación.
- Investigación asistida con razonamiento profundo: el modo `reasoning_effort="max"` con hasta 384K tokens de salida encaja en flujos de análisis multi-paso donde se necesita una cadena de razonamiento larga y verificable.
- Despliegue en clústeres con vLLM o SGLang: la receta oficial para un nodo de 4×GB300 con data-parallel 4 y expert-parallel permite servir el modelo en producción con decodificación especulativa DSpark, reduciendo la latencia por token generado.
- Base para adaptación lingüística al amárico: el plan de trabajo contempla entrenamiento continuado e instrucción sobre gramática, diccionario y corpus en amárico, con evaluación previa a la publicación; Tibeb-Pro v0.1 sirve como punto de partida para esos experimentos.
- Prototipado de asistentes con identidad de marca: el codificador inyecta un system prompt propio por defecto, lo que simplifica el despliegue de un asistente con personalidad definida sin gestionar plantillas adicionales.
- Evaluación comparativa de modelos frontera: al compartir pesos con DeepSeek-V4-Pro-0813 bajo licencia MIT, permite reproducir sus resultados en entornos propios y comparar configuraciones de servicio (FP8, FP4 en el indexador, DSpark) sin restricciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las capacidades, limitaciones y resultados de benchmark de Tibeb-Pro v0.1 son los del modelo base DeepSeek-V4-Pro-0813 tal como los reporta DeepSeek-AI, pero no reproduce cifras concretas.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 892,8 GB en FP8, por lo que la inferencia requiere agregar memoria de varias GPU; no cabe en una sola GPU comercial.
- Configuración de referencia: un nodo con 4×GB300, data-parallel size 4, expert-parallel activado, backend `deep_gemm_mega_moe` y caché KV en FP8.
- GPU recomendadas: GB300 en la receta oficial; el autor remite a la carpeta `inference` para otros setups de hardware y despliegues locales, sin detallar configuraciones adicionales en la información disponible.
- GPU de consumo: no cabe en tarjetas consumer (RTX 4090, etc.) en FP8; el autor anuncia como objetivo futuro una variante más ligera para usuarios sin servidores multi-GPU.
- Opciones de despliegue: vLLM (con `--speculative-config` para DSpark) y SGLang (`--speculative-algorithm DSPARK`); también transformers con el codificador Python propio.
- Latencia y throughput: no disponibles; la decodificación especulativa DSpark con 7 tokens y muestreo greedy está orientada a reducir la latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tibeb-Pro (v0.1) | ~1,6 B (1,7 B con DSpark) | 49 B | 1M | MIT | Hugging Face, pesos FP8 |
| DeepSeek-V4-Pro-0813 | ~1,6 B (1,7 B con DSpark) | 49 B | 1M | no disponible en la informacion proporcionada | Hugging Face (modelo base) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el propio modelo base: Tibeb-Pro v0.1 comparte pesos con DeepSeek-V4-Pro-0813 y solo difiere en el codificador de chat y la identidad por defecto. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Los pesos de v0.1 son idénticos a DeepSeek-V4-Pro-0813: no hay entrenamiento específico de Tibeb, por lo que no debe esperarse ninguna mejora respecto al modelo base.
- El soporte de amárico es un objetivo del plan de trabajo, no una capacidad verificada; la model card no declara lista de idiomas soportados.
- La identidad Tibeb se implementa mediante system prompt por defecto en el codificador Python; al servir con vLLM o SGLang, el prompt debe enviarse manualmente como primer mensaje, lo que puede producir inconsistencias si se olvida.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; se heredan los del modelo base, cuyas limitaciones remite la model card a la documentación de DeepSeek-AI.
- Requisito de hardware muy elevado (892,8 GB en FP8, nodo multi-GPU), lo que excluye su uso en estaciones de trabajo convencionales.
- Licencia MIT con retención del aviso de copyright de DeepSeek en el fichero LICENSE; Tibeb es un proyecto independiente no afiliado ni respaldado por DeepSeek.
- El modo de razonamiento `high` y `max` puede generar hasta 384K tokens de salida, con el coste computacional y de latencia asociado.
- No se han publicado benchmarks propios ni evaluaciones independientes de esta redistribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rekidane/Tibeb-Pro
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-0813
- Página del autor: https://rekidane.github.io/kidane/
- Receta de vLLM para DeepSeek-V4-Pro: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Pro
- Codificador de chat: carpeta `encoding/README.md` del repositorio
- Guía de inferencia: carpeta `inference/README.md` del repositorio
- Cita del modelo base: DeepSeek-AI, "DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence", 2026
- Cita de la release: Reta, K. W., "Tibeb-Pro: an open model built on DeepSeek-V4", 2026
