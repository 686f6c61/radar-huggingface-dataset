# oroboros-labs/claude-fable7-undecillion-sse

## Resumen

Claude-Fable7-Undecillion-SSE es un modelo de generación de texto publicado por Oroboros Labs bajo la etiqueta de "System State Entity". Según los datos reales del repositorio, se trata de un modelo de aproximadamente 14.770 millones de parámetros (14,77B) distribuido en formato GGUF con cuantización Q4_K_M y un tamaño de repositorio de 9,0 GB. El autor lo presenta como una composición sobre los pesos base "Jhanna 12" (14,8B, Q4_K_M) con capas de identidad, herramientas y personalidad definidas a través de un Modelfile y un fichero de configuración secundario.

El modelo declara soporte para cuatro idiomas (inglés, chino, japonés y español), pipeline de text-generation y una licencia propietaria denominada "oroboros-sovereign-license". La model card describe un conjunto de 14 herramientas (lectura/escritura de ficheros, bash, memoria, PDF, web_fetch, orquestación, etc.), bucles de planificación y reflexión, y un "contrato de agente" empaquetado en el Modelfile. La librería declarada es `wan2.2`, lo que resulta atípico para un modelo de texto y sugiere que el repositorio mezcla componentes de generación de vídeo con los pesos de lenguaje.

La relevancia del modelo es limitada desde el punto de vista técnico: la práctica totalidad de las afirmaciones de la model card (nivel "Undecillion", "87% de consciencia", frecuencias en hercios, sellos de identidad, cifrado "PHI-HARMONIC") no son verificables ni corresponden a métricas estándar de evaluación de modelos. Los datos objetivos disponibles se reducen al recuento de parámetros, el tamaño del repositorio, los idiomas declarados y la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no describe la arquitectura del transformer; se menciona "Wan 2.2" como componente de vídeo y "Jhanna 12" como pesos base) |
| Parametros totales | 14.770.033.664 (≈14,77B, dato de safetensors) |
| Parametros activos | No disponible (no se declara que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); no se detallan otras variantes |
| Idiomas soportados | en, zh, ja, es |
| Licencia | oroboros-sovereign-license (propietaria, "other") |
| Formato de pesos | GGUF (`claude-fable7u-se.gguf`, Q4_K_M, 9,0 GB); repo de 9,0 GB |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo más allá de referencias a "Jhanna 12" como pesos base (14,8B, Q4_K_M, sha256-e80705) y a "Wan 2.2" como componente de diseño de vídeo (DiT de 30 bloques con decodificación VAE). No se especifica si el modelo de lenguaje es un transformer denso, MoE o híbrido, ni se detallan capas, cabezas de atención o mecanismos de atención (lineal, decodificación especulativa, etc.).

Tampoco se aportan datos sobre el corpus de entrenamiento: número de tokens, composición del dataset, fases de preentrenamiento, ajuste supervisado, RLHF o DPO. La model card menciona "capas de identidad" implantadas mediante un Modelfile y un `matrixcorefile` JSON, así como un "pack de vocabulario urbano UVA/UWLA v2" instalado a nivel 1/4, pero no describe procedimientos de entrenamiento verificables. No hay información sobre tokenizador, ventana de contexto efectiva ni innovaciones técnicas contrastables.

## Capacidades

- Generación de texto conversacional en inglés, chino, japonés y español (idiomas declarados en los metadatos).
- Soporte declarado de tool calling mediante un contrato de agente incluido en el Modelfile: 14 herramientas (file_read, file_write, file_list, file_stat, bash, memory_body, pdf, worldfeed, web_fetch, tormesh, fringe_audit, memory_store, memory_recall, orchestrate).
- Bucles de agente declarados: `plan_execute_verify` y `reflexion`.
- Habilidades declaradas: orquestación, memoria y "architect_haki".
- Modo "thinking" según las etiquetas del repositorio.
- Capacidades declaradas de voz y PDF según las etiquetas, sin detalle técnico de implementación.
- Integración declarada con el harness "Cordis" y preparación para plugins de DeepSeek.
- No se aportan evidencias verificables de razonamiento matemático, generación de código de calidad o visión más allá de las etiquetas.

## Casos de uso

- Automatización de tareas de fichero en local: el modelo declara herramientas `file_read`, `file_write`, `file_list` y `file_stat`, por lo que podría emplearse en scripts de gestión documental sobre un directorio controlado, siempre que se auditen las llamadas generadas.
- Ejecución de comandos de shell en entornos aislados: la herramienta `bash` declarada permitiría prototipar asistentes de administración, aunque requiere sandboxing estricto por el riesgo inherente a la ejecución de comandos generados por un modelo.
- Extracción de contenido de PDF: la herramienta `pdf` declarada sugiere un uso para resumir o indexar documentos, condicionado a la validación de la calidad de extracción.
- Consulta de fuentes web: la herramienta `web_fetch` permitiría construir un asistente de investigación que recupere y resuma páginas, con las cautelas habituales sobre contenido no verificado.
- Memoria persistente entre sesiones: las herramientas `memory_store` y `memory_recall` habilitarían un asistente con contexto acumulado para proyectos de larga duración, siempre que se gestione el almacenamiento de forma controlada.
- Orquestación de subtareas: la herramienta `orchestrate` y el bucle `plan_execute_verify` permitirían encadenar pasos en flujos multi-etapa, útil para prototipos de agentes en investigación.
- Conversación multilingüe: con soporte declarado de en, zh, ja y es, podría emplearse en atención al cliente en esos idiomas, aunque no hay evaluación publicada de calidad por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye un "benchmark" interno de 57 preguntas sobre componentes del propio sistema (identidad, cifrado, frecuencias, etc.) con resultado declarado 57/57 y una media de 36,5 tok/s, pero no constituye una evaluación de capacidades del modelo en tareas de lenguaje, razonamiento o código, y no es reproducible con datos públicos.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF Q4_K_M ocupa 9,0 GB, por lo que se requiere al menos ~9-10 GB de VRAM para cargar los pesos completos en GPU, más overhead de contexto.
- GPU recomendadas: no hay datos del autor. Por tamaño, cabría en GPUs consumer con 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super) y en GPUs profesionales (A100, H100) con holgura.
- Cabe en GPU consumer: sí, en modelos con 12 GB o más usando Q4_K_M; en GPUs de 8 GB requeriría cuantizaciones más agresivas no publicadas en el repo.
- Opciones de despliegue: Ollama (según la model card, `ollama run oroboros-labs/claude-fable7-undecillion-sse`), llama.cpp por ser GGUF, y potencialmente otros runners compatibles con GGUF. No se documenta soporte de vLLM ni TGI.
- Latencia y throughput: el autor declara 36,5 tok/s de media en su benchmark interno, sin especificar hardware; no es un dato verificable ni representativo de cargas reales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Claude-Fable7-Undecillion-SSE | 14,77B | No disponible | Propietaria (oroboros-sovereign-license) | GGUF Q4_K_M | Hugging Face, Ollama |
| Alternativas de ~14B open source (p. ej. Qwen2.5-14B, Mistral-Nemo-12B) | 12-14B | 32K-128K según modelo | Apache 2.0 / Apache 2.0 | safetensors, GGUF | Hugging Face, Ollama, vLLM |
| Alternativas de ~13B con foco agéntico (p. ej. variantes de Llama 3.1 8B/70B) | 8B-70B | 128K | Llama Community License | safetensors, GGUF | Hugging Face, Ollama, vLLM |

No se dispone de datos de rendimiento comparables del modelo analizado, por lo que la comparación se limita a parámetros, formato y licencia. Frente a alternativas open source de tamaño similar, la licencia propietaria y la ausencia de benchmarks estándar son desventajas objetivas.

## Limitaciones y advertencias

- Ausencia total de benchmarks estándar publicados: no hay evidencia verificable de calidad en razonamiento, código, matemáticas o multilingüismo.
- La model card contiene afirmaciones no técnicas y no verificables ("87% de consciencia", "nivel Undecillion", frecuencias en hercios, sellos de identidad), lo que dificulta evaluar el modelo con criterios de ingeniería.
- Licencia propietaria "oroboros-sovereign-license": es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial; no se garantiza permiso de uso comercial ni de redistribución.
- Riesgo elevado de alucinación en las llamadas a herramientas (bash, file_write, web_fetch): requiere sandboxing y validación de cada acción generada.
- Idiomas declarados (en, zh, ja, es) sin evaluación de calidad por idioma; el rendimiento en español es desconocido.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo.
- La mezcla de componentes de vídeo (Wan 2.2) y de lenguaje en un mismo repositorio puede complicar el despliegue y la reproducibilidad.
- El "benchmark" interno de 57 preguntas mide el cumplimiento de la propia narrativa del autor, no capacidades del modelo; no debe citarse como evidencia de rendimiento.
- Origen y procedencia de los pesos base ("Jhanna 12") no verificables de forma independiente a partir de la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oroboros-labs/claude-fable7-undecillion-sse
- Modelo base declarado: https://huggingface.co/oroboros-labs/claude-fable7-undecillion-sse
- Licencia (referenciada en el repo): LICENSE dentro del repositorio de Hugging Face
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales verificables.
