# Haruto7261/QwenD-Satsuma-v2

## Resumen

QwenD-Satsuma-v2 es un modelo de lenguaje publicado en HuggingFace por el usuario Haruto7261 bajo el identificador `Haruto7261/QwenD-Satsuma-v2`. Por el nombre se infiere que se trata de un ajuste fino (fine-tuning) de la familia Qwen, orientado específicamente al dialecto japonés de Satsuma (薩隅方言), hablado en la región de Kagoshima. La model card está redactada íntegramente en japonés y se centra en describir el corpus de entrenamiento, sin aportar detalles sobre arquitectura, tamaño o hiperparámetros.

El repositorio no incluye información sobre parámetros totales, longitud de contexto, licencia ni idiomas soportados más allá de lo que se deduce del corpus (japonés, con énfasis en dialecto de Kagoshima). El modelo registra 0 descargas y 0 likes en el momento de la consulta, y fue creado el 1 de noviembre de 2026, lo que lo sitúa como una publicación muy reciente y sin validación comunitaria.

Su relevancia radica en el nicho: la adaptación de LLM a dialectos regionales japoneses con recursos limitados, un área con escasa cobertura comercial. No obstante, la ausencia de especificaciones técnicas, benchmarks y licencia limita seriamente su evaluación para uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer derivado de Qwen, no confirmado) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el corpus es japonés, con foco en dialecto de Kagoshima) |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo en la documentación proporcionada. El nombre "QwenD" sugiere un derivado de la familia Qwen, y el sufijo "Satsuma-v2" indica una segunda iteración orientada al dialecto de Satsuma (Kagoshima). No obstante, no se confirma la arquitectura base, el número de parámetros ni si se emplearon técnicas como LoRA, QLoRA o fine-tuning completo.

La model card detalla exclusivamente el corpus de entrenamiento, compuesto por fuentes heterogéneas en japonés: datasets de diálogo (Japanese-Daily-Dialogue, MACHAcorpus, RealPersonaChat), recursos léxicos y divulgativos sobre dialecto de Kagoshima (listados de vocabulario, diccionarios y guías de conversión), grabaciones dialectales del Instituto Nacional de Lengua Japonesa (NINJAL), el corpus de actas parlamentarias (国会会議録), la colección de literatura de Aozora Bunko y la Wikipedia en japonés. No se especifica el volumen de tokens, la proporción entre fuentes, ni si hubo etapas de alineación (RLHF, DPO) o instrucción supervisada.

## Capacidades

- Generación de texto en japonés, presumiblemente con adaptación al dialecto de Satsuma (Kagoshima), aunque no se documenta formalmente.
- Conversación multi-turno: el corpus incluye datasets de diálogo (Japanese-Daily-Dialogue, MACHAcorpus, RealPersonaChat), lo que sugiere capacidad conversacional.
- Registro formal y literario: la inclusión de actas parlamentarias y Aozora Bunko indica exposición a estilos formales y literarios.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el corpus es monolingüe en japonés.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Traducción y adaptación al dialecto de Kagoshima: el modelo podría emplearse para convertir japonés estándar a Satsuma-ben en contextos divulgativos o educativos, aprovechando los recursos léxicos incluidos en el corpus (diccionarios y guías de conversión).
- Preservación lingüística: generación de material didáctico o divulgativo sobre el dialecto de Satsuma, dado el uso de fuentes como NINJAL y la Wikipedia en japonés.
- Chatbots de atención al ciudadano en Kagoshima: un asistente conversacional que responda en dialecto local, apoyado en el corpus de diálogo y en las actas parlamentarias para registro formal.
- Investigación en dialectología computacional: evaluación de la capacidad de un LLM para reproducir variantes dialectales japonesas, usando el modelo como baseline o sujeto de estudio.
- Generación de diálogos sintéticos: creación de corpus de conversaciones en dialecto para entrenar o evaluar otros sistemas, a partir de los datasets de diálogo incluidos.
- Prototipado de asistentes conversacionales en japonés: uso experimental en entornos de investigación donde la licencia y el rendimiento no sean críticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamaño del modelo base, que no se especifica).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; no se confirman formatos GGUF, safetensors ni compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| QwenD-Satsuma-v2 | no disponible | no disponible | no disponible | HuggingFace (0 descargas) |
| Modelos base Qwen (familia) | variable según versión | variable | variable (Apache 2.0 en varias versiones) | HuggingFace, ampliamente adoptados |
| Modelos de dialecto japonés (p. ej. ajustes de Qwen o Llama para variantes regionales) | no disponible | no disponible | no disponible | Repositorios comunitarios dispersos |

No se dispone de datos suficientes para establecer una comparativa rigurosa con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: no se documentan parámetros, contexto, arquitectura ni formato de pesos, lo que impide evaluar su viabilidad en producción.
- Licencia no especificada: no se puede determinar si el uso comercial está permitido; se debe contactar con el autor antes de cualquier despliegue.
- Sin benchmarks ni validación comunitaria: 0 descargas y 0 likes; no hay evidencia pública de calidad o rendimiento.
- Riesgo de alucinación: inherente a los LLM, agravado por la falta de documentación sobre alineación o evaluación.
- Sesgos potenciales: el corpus incluye fuentes divulgativas y listados de vocabulario no académicos, lo que puede introducir imprecisiones en la representación del dialecto.
- Cobertura lingüística limitada: presumiblemente monolingüe en japonés; no se documenta soporte para otros idiomas.
- Fecha de creación futura (2026): conviene verificar la autenticidad y el estado del repositorio antes de su uso.
- Model card exclusivamente en japonés y centrada en el corpus: no se describen limitaciones, sesgos ni casos de fallo.

## Enlaces

- HuggingFace: https://huggingface.co/Haruto7261/QwenD-Satsuma-v2
- Japanese-Daily-Dialogue: https://huggingface.co/datasets/kan-bayashi/Japanese-Daily-Dialogue
- MACHAcorpus: https://github.com/tatsuya-koyama/MACHAcorpus
- RealPersonaChat: https://github.com/nu-dialogue/real-persona-chat
- NINJAL (Instituto Nacional de Lengua Japonesa): https://www.ninjal.ac.jp/
- Actas parlamentarias de Japón: https://kokkai.ndl.go.jp/
- Aozora Bunko: https://www.aozora.gr.jp/
- Wikipedia en japonés: https://ja.wikipedia.org/
- Wikipedia (Satsuma dialect): https://ja.wikipedia.org/wiki/薩隅方言
