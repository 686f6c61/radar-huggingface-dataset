# matrixCloud333/Physics-Fayah-27B-Ratchet9-IQ3_M

## Resumen

Physics-Fayah-27B-Ratchet9-IQ3_M es un checkpoint GGUF derivado de Qwen/Qwen3.8-27B, publicado por el usuario matrixCloud333 y orientado a programación científica y exploración en física computacional. No se trata de un modelo entrenado desde cero, sino de una adaptación local con calibración de cuantización IQ3_M y un ajuste de continuación (*continual learning*) documentado en la model card. El autor lo describe explícitamente como un artefacto experimental, no como un solver numérico validado.

El modelo conserva la arquitectura y el tamaño del base (27.320.697.856 parámetros totales según safetensors), pero se distribuye únicamente en formato GGUF cuantizado a IQ3_M, con un fichero de 14.532.048.416 bytes (aproximadamente 14,5 GB). El repositorio completo ocupa 29,1 GB, lo que sugiere la presencia de artefactos adicionales (backups, logs de calibración u otros ficheros) más allá del GGUF principal.

Su relevancia es limitada y muy específica: sirve como ejemplo de flujo de calibración de cuantización con imatrix y de ajuste ligero sobre un modelo base grande, con evidencia de calibración publicada de forma inusualmente detallada (pérdidas de aprendizaje y retención, aceptación de borrador MTP). Para producción general conviene usar el modelo base Qwen3.8-27B directamente, ya que este derivado no aporta garantías de mejora medibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen/Qwen3.8-27B; el autor no detalla la arquitectura en la model card) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (depende del runtime y de la política de KV-cache según el autor) |
| Tipos de cuantizacion | IQ3_M (único artefacto publicado) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El autor no describe la arquitectura interna del modelo en la model card; únicamente indica que es un checkpoint derivado de Qwen/Qwen3.8-27B, por lo que hereda la arquitectura del base. El proceso aplicado consiste en una recalibración de cuantización IQ3_M (con soporte de imatrix, según los tags) y un ajuste de continuación sobre datos no especificados. La calibración documentada corresponde a la "secuencia 16", con fecha 2026-10-20, y el fichero conserva el nombre antiguo `Ratchet9` en el origen local, mientras que el nombre en el Hub se actualizó a `Ratchet16` para reflejar el linaje.

La evidencia de calibración publicada es de muestra pequeña: tres prompts equivalentes. Los valores registrados son loss de aprendizaje 0.2147887469 (baseline) frente a 0.2100177841 (candidato), loss de retención 0.2489672313 frente a 0.2496686303, y aceptación de borrador MTP 0.7482014388 frente a 0.7481481481. La comprobación de equivalencia de salida del candidato pasó, pero la puerta MTP no pasó y la puerta de comportamiento no se evaluó; la semilla se admitió mediante un override explícito de semilla aprendida. El autor advierte que estas medidas no establecen una mejora general de capacidad ni de aceptación, y que no se remidieron las cifras de rendimiento de Ratchet9 para este hash exacto de pesos.

## Capacidades

- Generación de texto conversacional en inglés y chino, heredada del modelo base Qwen3.8-27B.
- Asistencia en programación científica: generación de código numérico, expresiones y explicaciones de física computacional (según la orientación declarada por el autor).
- Soporte de calibración con imatrix para cuantización IQ3_M.
- Integración con decodificación especulativa mediante borradores MTP (el autor reporta métricas de aceptación de borrador, aunque la puerta MTP no pasó en la secuencia 16).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del Hub).
- No se documentan capacidades de visión, audio, tool calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Exploración de física computacional en local: el modelo puede generar borradores de ecuaciones, scripts de simulación y explicaciones conceptuales en una máquina con ~14,5 GB de pesos, útil para prototipado rápido antes de validar con herramientas formales.
- Asistencia a la docencia y estudio de métodos numéricos: generación de ejemplos de discretización, condiciones de contorno y análisis de convergencia, siempre con verificación manual de unidades e invariantes.
- Pruebas de pipelines de cuantización: sirve como caso de estudio reproducible de calibración IQ3_M con imatrix y de evaluación de pérdidas de aprendizaje/retención en muestras pequeñas.
- Evaluación de decodificación especulativa: los registros de aceptación de borrador MTP permiten experimentar con configuraciones de speculative decoding en llama.cpp sobre un modelo de 27B cuantizado a 3 bits.
- Desarrollo de herramientas internas en inglés o chino: al soportar ambos idiomas, puede usarse para generar documentación técnica o comentarios de código bilingües en entornos de investigación.
- Reproducción de linajes de checkpoints: el repositorio incluye hashes SHA-256 del artefacto y del backup previo, lo que facilita auditorías de procedencia en proyectos de investigación que exigen trazabilidad de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente métricas de calibración de muestra pequeña (tres prompts), que no constituyen benchmarks de capacidad:

| Medicion | Baseline | Candidato |
|---|---:|---:|
| Learning loss | 0.2147887469 | 0.2100177841 |
| Retention loss | 0.2489672313 | 0.2496686303 |
| MTP draft acceptance | 0.7482014388 | 0.7481481481 |

El autor declara explícitamente que no se hacen afirmaciones de throughput, perplejidad ni validación de modelos físicos, y que las cifras previas de Ratchet9 no se remidieron para este hash de pesos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14,5 GB solo para los pesos en IQ3_M; hay que sumar la KV-cache, que depende de la longitud de contexto y de la política de caché del runtime.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño de pesos, una GPU de 24 GB (por ejemplo, RTX 4090) o superior debería poder alojar los pesos, pero el autor no confirma hardware validado.
- Cabe en GPU de consumo: probablemente sí en GPUs con 24 GB o más, siempre que se limite el contexto y el tamaño de la KV-cache; no confirmado por el autor.
- Opciones de despliegue: llama.cpp con soporte GGUF actualizado (requisito explícito del autor). No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles; el autor indica que dependen del runtime, hardware, política de KV-cache y configuración de decodificación especulativa, y que el repositorio no garantiza ningún nivel concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Physics-Fayah-27B-Ratchet9-IQ3_M | 27,3 B | no disponible | GGUF IQ3_M | Apache-2.0 | Derivado experimental con calibración documentada; sin benchmarks |
| Qwen/Qwen3.8-27B (base) | 27,3 B | no disponible en esta ficha | safetensors y otros | Apache-2.0 | Modelo original; referencia para comparar calidad y soporte |
| Otros GGUF de 27B de la familia Qwen | ~27 B | no disponible | GGUF | Apache-2.0 | Alternativas de cuantización estándar sin ajuste específico de física |

La comparación cuantitativa de rendimiento no está disponible: no hay benchmarks publicados para este derivado ni datos de contexto en la información proporcionada.

## Limitaciones y advertencias

- El propio autor califica el checkpoint como experimental y no validado como solver numérico; las ecuaciones, el código y las explicaciones científicas deben tratarse como hipótesis y verificarse de forma independiente (unidades, condiciones de contorno, convergencia e invariantes).
- La evidencia de calibración proviene de tres prompts; la puerta MTP no pasó, la puerta de comportamiento no se evaluó y la semilla se admitió con un override explícito. No hay base para afirmar mejoras de capacidad o aceptación.
- No se han publicado benchmarks de MMLU, HumanEval, GSM8K ni similares para este artefacto; las cifras de Ratchet9 no se remidieron para el hash actual.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- Riesgo de alucinación inherente a un modelo de lenguaje de 27B cuantizado a 3 bits; la cuantización agresiva puede degradar precisión en tareas numéricas.
- La licencia Apache-2.0 debe revisarse junto con los términos del modelo base Qwen3.8-27B y de cualquier fuente fusionada antes de redistribuir artefactos derivados.
- El repositorio incluye backups y logs de calibración; conviene verificar el SHA-256 del GGUF antes de usarlo en producción.
- El registro de calibración de la secuencia 16 no forma parte de la campaña de diez modelos en curso y no implica que esos candidatos hayan pasado revisión.

## Enlaces

- Hugging Face: https://huggingface.co/matrixCloud333/Physics-Fayah-27B-Ratchet9-IQ3_M
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
