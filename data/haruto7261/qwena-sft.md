# Haruto7261/QwenA-SFT

## Resumen

QwenA-SFT es un modelo de lenguaje ajustado mediante fine-tuning supervisado (SFT) a partir de una base de la familia Qwen, publicado por el usuario Haruto7261 en Hugging Face. El modelo está claramente orientado al procesamiento del japonés, con un énfasis específico en el dialecto de Kagoshima (薩隅方言), y se ha entrenado sobre un corpus que combina diálogos cotidianos, corpus de personas reales, textos literarios de Aozora Bunko, actas parlamentarias y recursos dialectales.

El repositorio tiene un tamaño de 19,3 GB en formato safetensors, lo que sugiere un modelo de escala media (probablemente en el rango de 7B a 14B parámetros en FP16/BF16), aunque el autor no especifica la arquitectura base exacta, el número de parámetros ni la longitud de contexto en la información disponible.

La relevancia de este modelo radica en su especialización en una variante dialectal poco representada en los corpus generalistas, lo que lo hace potencialmente útil para tareas de normalización dialectal, preservación lingüística y generación de diálogo en japonés regional. No obstante, la ausencia de documentación técnica detallada, benchmarks y licencia explícita limita seriamente su evaluación para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (base de la familia Qwen, presumiblemente transformer decoder-only) |
| Parametros totales | no disponible (tamaño de repo de 19,3 GB en safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | japonés (implícito por el corpus); no se declaran idiomas oficialmente |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información técnica sobre la arquitectura en la model card publicada. Por el nombre del repositorio y el tamaño del mismo, se infiere que se trata de un ajuste supervisado (SFT) sobre un checkpoint preentrenado de la familia Qwen, pero el autor no indica la variante concreta, el número de parámetros, la longitud de contexto nativa ni si se aplicaron técnicas adicionales como RLHF o DPO.

El corpus de entrenamiento sí está documentado e incluye fuentes heterogéneas: diálogos cotidianos en japonés (Japanese-Daily-Dialogue), corpus de conversación con personas (MACHAcorpus, RealPersonaChat), recursos específicos del dialecto de Kagoshima (listados de vocabulario, diccionarios y sitios de conversión dialectal), actas del parlamento japonés (国会会議録), textos de Aozora Bunko y la Wikipedia en japonés. Esta composición sugiere un objetivo de conversación en japonés con cobertura dialectal, aunque no se especifica el número de tokens, la proporción de cada fuente ni el procedimiento de limpieza o filtrado aplicado.

## Capacidades

- Generación de texto en japonés, con especial atención al registro conversacional y al dialecto de Kagoshima.
- Conversación multi-turno, apoyada por los corpus de diálogo incluidos en el entrenamiento.
- Generación con estilo literario o formal, derivada de la inclusión de Aozora Bunko y actas parlamentarias.
- Potencial normalización o conversión entre japonés estándar y variantes dialectales de Kagoshima, dado el corpus de diccionarios y conversores dialectales.
- Capacidades de tool calling, function calling o razonamiento multi-paso: no disponibles (no documentadas).
- Capacidades multilingües: no documentadas; el corpus es exclusivamente japonés.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Preservación y divulgación del dialecto de Kagoshima: el modelo puede generar textos y diálogos en 薩隅方言 a partir de los recursos dialectales incluidos en el corpus, útil para proyectos de documentación lingüística.
- Normalización dialectal: conversión de expresiones en dialecto de Kagoshima a japonés estándar, apoyándose en los diccionarios y tablas de conversión presentes en los datos de entrenamiento.
- Chatbots de atención al ciudadano en Japón: gracias a los corpus de actas parlamentarias y diálogo cotidiano, puede emplearse en prototipos de asistencia conversacional en japonés, siempre con revisión humana.
- Generación de material educativo sobre variantes regionales del japonés: el modelo puede producir ejemplos de uso dialectal para cursos o materiales didácticos.
- Prototipado de agentes conversacionales con persona: los corpus RealPersonaChat y MACHAcorpus permiten experimentar con diálogos que mantienen un perfil de personaje consistente.
- Investigación en NLP dialectal: como checkpoint de referencia para comparar técnicas de fine-tuning sobre variantes regionales del japonés.
- Generación de texto con registro literario: la inclusión de Aozora Bunko permite experimentar con estilos narrativos propios de la literatura japonesa moderna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio de 19,3 GB en safetensors sugiere que en FP16 el modelo requiere al menos ~20 GB de VRAM solo para los pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: no documentadas por el autor. Por tamaño, una A100 40 GB, H100 o L40S serían opciones seguras; una RTX 4090 (24 GB) podría ser justa en FP16 y requeriría cuantización para contexto largo.
- Compatibilidad con GPU de consumo: probablemente sí mediante cuantización a 8 o 4 bits (por ejemplo, con llama.cpp o GPTQ/AWQ), aunque no se publican versiones cuantizadas.
- Opciones de despliegue: vLLM, TGI o llama.cpp son viables en teoría, pero no hay confirmación del autor sobre compatibilidad con la arquitectura concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QwenA-SFT | no disponible | no disponible | Japonés + dialecto de Kagoshima (SFT) | no disponible | Hugging Face (0 descargas) |
| Modelos base Qwen (familia) | variable (no confirmado) | variable | Multilingüe generalista | Apache 2.0 en la mayoría de variantes | Hugging Face, ampliamente disponible |
| Modelos japoneses open source (por ejemplo, variantes de Swallow, CALM, LLM-jp) | variable | variable | Japonés generalista | variable según modelo | Hugging Face |

No se dispone de datos de rendimiento del modelo que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- Sin benchmarks ni evaluación publicada: no hay evidencia objetiva de calidad, y el modelo tiene 0 descargas y 0 likes, lo que indica ausencia de validación por la comunidad.
- Riesgo elevado de alucinación: al ser un SFT sobre corpus heterogéneos y sin documentación de alineación (RLHF/DPO), no hay garantías sobre fidelidad factual.
- Sesgos potenciales derivados del corpus: las actas parlamentarias y los textos literarios de Aozora Bunko pueden introducir registros formales o arcaicos; los recursos dialectales de webs comerciales pueden contener imprecisiones.
- Cobertura lingüística limitada al japonés: no se declaran otros idiomas, por lo que su uso fuera del japonés no está soportado.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Documentación insuficiente: la model card está íntegramente en japonés y se centra en el corpus, sin detalles de hiperparámetros, hardware de entrenamiento ni procedimiento de evaluación.
- Fecha de creación futura (2026-11-01): el metadato del repositorio indica una fecha posterior a la actual, lo que puede reflejar un error de configuración o un repositorio de prueba; conviene verificar la integridad del checkpoint antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Haruto7261/QwenA-SFT
- Japanese-Daily-Dialogue: https://huggingface.co/datasets/kan-bayashi/Japanese-Daily-Dialogue
- MACHAcorpus: https://github.com/tatsuya-koyama/MACHAcorpus
- RealPersonaChat: https://github.com/nu-dialogue/real-persona-chat
- Wikipedia 薩隅方言: https://ja.wikipedia.org/wiki/薩隅方言
- 国会会議録データ: https://kokkai.ndl.go.jp/
- 青空文庫: https://www.aozora.gr.jp/
- 日本語 Wikipedia: https://ja.wikipedia.org/
- 国立国語研究所: https://www.ninjal.ac.jp/
