# dendriteholdings/Ingot-I-27B-FP8

## Resumen
Ingot-I-27B-FP8 es un espejo público de un modelo que ganó en Ingot, una subred de Bittensor en la que los mineros cuantizan un modelo profesor fijo y el validador corona la copia que más se aproxima a él. El repositorio lo publica dendriteholdings, pero los pesos son la subida del minero (hotkey `5ECtVLvUKyBTyZweHFWdJwosChEXyXq7r5SY2PgWJs2bb1hs`, uid 195) byte a byte, por lo que el crédito corresponde al minero.

El modelo tiene 27.781.427.952 parámetros (~27,8 B) y está cuantizado en FP8, con pesos en safetensors y un tamaño de repositorio de 30,9 GB. El tag `qwen3_5` sugiere que la arquitectura base pertenece a la familia Qwen3.5, aunque la model card no detalla el modelo profesor ni la longitud de contexto, los idiomas o la licencia.

Su relevancia radica en que ejemplifica un flujo de cuantización descentralizada y competitiva: el resultado es un artefacto FP8 listo para inferencia eficiente en GPUs de 48-80 GB, aunque carece de documentación técnica y de benchmarks publicados.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (según el tag `qwen3_5`; no detallada en la model card) |
| Parámetros totales | 27.781.427.952 (~27,8 mil millones) |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es el resultado de un proceso de cuantización posterior al entrenamiento (post-training quantization) dentro de la subred Ingot de Bittensor. En ese entorno, los mineros reciben un modelo profesor fijo y compiten por producir la copia cuantizada que el validador considere más fiel al original. La model card no identifica el modelo profesor, por lo que se desconoce si se trata de un transformer denso, MoE o híbrido; el tag `qwen3_5` apunta a la familia Qwen3.5 como base, pero no hay confirmación explícita.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineación. La innovación técnica destacable es el propio mecanismo de la subred: una competición descentralizada de cuantización que selecciona la réplica más cercana al profesor, con el formato FP8 como objetivo de eficiencia en inferencia.

## Capacidades
No se detallan capacidades específicas en la model card. Al tratarse de una cuantización FP8 de un modelo profesor no identificado, se asume que hereda las capacidades del original, pero no hay confirmación documental.

- Generación de texto: no confirmada explícitamente; esperable en un LLM de ~28 B.
- Razonamiento: no disponible.
- Código: no disponible.
- Matemáticas: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo pensamiento, visión, audio): no disponible.

## Casos de uso
Dado que no se documentan las capacidades del modelo profesor, los siguientes casos de uso son escenarios típicos para un LLM denso de ~28 B cuantizado a FP8; su viabilidad concreta depende del modelo base.

- Servicio de inferencia en producción con vLLM: aprovechar el formato FP8 para reducir la VRAM frente a BF16 y desplegar en una GPU de 48 GB (L40S, RTX 6000 Ada) o 80 GB (H100, A100). Adecuado si se busca maximizar el throughput por dólar.
- Asistente conversacional multi-turno: si el modelo profesor soporta ventanas de contexto amplias, podría gestionar diálogos extensos; no obstante, la longitud de contexto no está documentada.
- Generación de código asistida: integración en IDE o pipelines de CI/CD para autocompletar, revisar y generar tests, siempre que el modelo base tenga competencia en código (no confirmada).
- Análisis y resumen de documentos: procesamiento de informes, contratos o artículos, con salida estructurada; dependería de la ventana de contexto y de las capacidades lingüísticas del profesor.
- RAG (generación aumentada por recuperación): uso del modelo como generador final sobre fragmentos recuperados de una base vectorial, con la ventaja de que FP8 reduce el coste de servir el modelo.
- Traducción y procesamiento multilingüe: si el modelo base es multilingüe (frecuente en la familia Qwen), podría emplearse en localización de contenidos; los idiomas soportados no están documentados.
- Extracción de información y clasificación: convertir texto no estructurado en JSON o etiquetas para enriquecer bases de datos, sujeto a la calidad del modelo profesor.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- Pesos en FP8: aproximadamente 27,8 GB (1 byte por parámetro, sin contar overhead de metadatos).
- VRAM estimada para inferencia: entre 30 y 35 GB para pesos, activaciones y caché KV con lotes pequeños y contextos moderados; la cifra exacta depende de la longitud de contexto (no documentada) y del tamaño de lote.
- GPU recomendadas: H100 80 GB, A100 80 GB, L40S 48 GB, RTX 6000 Ada 48 GB, A6000 48 GB. También puede ejecutarse en 2× RTX 4090 24 GB (48 GB en total) mediante tensor parallelism, aunque con penalización por comunicación PCIe.
- No cabe en una única GPU de consumo de 24 GB (RTX 4090, RTX 3090, etc.) porque los pesos FP8 ya ocupan ~27,8 GB.
- Opciones de despliegue: vLLM (soporte nativo de FP8), TensorRT-LLM, TGI (verificar soporte de FP8). llama.cpp y Ollama requerirían una versión GGUF, no disponible en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
Datos de los modelos alternativos según sus model cards públicas; el modelo Ingot no documenta estos extremos.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-I-27B-FP8 | 27,8 B | no disponible | no disponible | safetensors (FP8) | HuggingFace |
| Qwen3-32B | 32,8 B | 128 K | Apache 2.0 | safetensors, GGUF | HuggingFace |
| Gemma 3 27B | 27 B | 128 K | Gemma license | safetensors | HuggingFace |
| Mistral Small 3.1 24B | 24 B | 128 K | Apache 2.0 | safetensors | HuggingFace |

## Limitaciones y advertencias
- La licencia no está especificada: no se puede garantizar el uso comercial ni la redistribución.
- Es un espejo: los pesos pertenecen al minero; cualquier atribución debe dirigirse a la hotkey indicada.
- No se identifica el modelo profesor, por lo que se desconoce la arquitectura exacta, el contexto, los idiomas y las capacidades reales.
- La cuantización FP8 (post-training quantization) puede introducir una degradación de calidad frente al modelo profesor en BF16/FP16, típicamente pequeña pero no cuantificada sin benchmarks.
- Ausencia total de benchmarks publicados: no hay evidencia objetiva de rendimiento en MMLU, HumanEval, GSM8K u otras tareas.
- Riesgo de alucinación y sesgos: inherente al modelo profesor, no documentado.
- Fecha de creación (2026-10-16) inusualmente futura; conviene verificar la procedencia y la integridad del repositorio.
- Tamaño de descarga de 30,9 GB.

## Enlaces
- HuggingFace: https://huggingface.co/dendriteholdings/Ingot-I-27B-FP8
- No se han encontrado otros enlaces (paper, repositorio, demo) en la búsqueda web proporcionada.
