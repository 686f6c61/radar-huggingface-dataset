# ApolloRaines/Llama-3.3-8B-Instruct-128K-Jbliterated

## Resumen

Llama-3.3-8B-Instruct-128K-Jbliterated es un fine-tune del modelo shb777/Llama-3.3-8B-Instruct-128K, publicado por el usuario ApolloRaines bajo el marco que el autor denomina "jbliteration". Se trata de una intervención directa sobre los pesos (weight surgery) cuyo objetivo declarado es eliminar la conducta de rechazo (refusal) del modelo sin recurrir a entrenamiento por gradiente ni a system prompts. El modelo conserva la ventana de contexto de 128.000 tokens heredada del modelo base y la arquitectura Transformer decoder-only de la familia Llama 3.3, con 8.030.261.248 parámetros en bfloat16.

El problema que aborda es la imposibilidad de que los modelos ajustados con alineamiento de seguridad procesen contenido hostil, lo que el autor sitúa en el ámbito de la seguridad defensiva: revisión de exploits, análisis de malware y reconstrucción de incidentes. La relevancia actual del modelo es limitada y muy específica: no es un modelo de propósito general mejorado, sino una demostración técnica de que la dirección de rechazo puede ablacionarse de forma selectiva, con un benchmark propio de 0 rechazos genuinos sobre 100 prompts y una única medición de retención de capacidad (MMLU 77,89 % frente a 76,84 % del baseline) realizada sobre otro modelo distinto, Sharona (Qwen3.5-27B), no sobre este.

El modelo está etiquetado como "uncensored", acumula 857 descargas y 3 likes en Hugging Face, y se distribuye bajo la licencia Llama 3.1 Community License. Su interés para desarrolladores e investigadores es acotado: sirve como caso de estudio de edición de pesos y como herramienta para pipelines de red team, no como sustituto de un modelo alineado en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.3), 32 capas modificadas de 32 |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el modelo se publica en bfloat16; el autor menciona GPTQ W4A16 solo para otro modelo de su coleccion) |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (bfloat16) |
| Tamano del repositorio | 16,1 GB |
| Modelo base | shb777/Llama-3.3-8B-Instruct-128K |
| Fecha de creacion | 2026-07-20 |
| Ultima actualizacion | 2026-10-28 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.3 en su variante de 8.000 millones de parámetros: Transformer decoder-only con atención causal estándar, sin mezcla de expertos ni componentes híbridos SSM. El autor declara que se han modificado las 32 capas del modelo mediante un pipeline de procesamiento multifase denominado "jBlaze precision neural surgery", que actúa directamente sobre los pesos en bfloat16 sin pasar por entrenamiento por gradiente. La modificación apunta a la dirección de rechazo aprendida durante el alineamiento del modelo base, con la afirmación de que el resto de capacidades queda intacto por diseño.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO; el autor afirma explícitamente que no hay entrenamiento por gradiente en el proceso de edición. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. La única innovación declarada es metodológica: la distinción entre "abliteration" convencional, descrita como burda y con pérdida colateral de capacidad, y "jbliteration", presentada como una edición de precisión que preserva el rendimiento. La evidencia aportada para esa afirmación es una única medición de MMLU sobre un modelo diferente de la misma colección, no sobre este checkpoint.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat de Llama 3 (`apply_chat_template`).
- Contexto largo de hasta 128.000 tokens, heredado del modelo base shb777/Llama-3.3-8B-Instruct-128K.
- Procesamiento de contenido que los modelos alineados rechazan: análisis de código malicioso, revisión de exploits y discusión de temas sensibles sin rechazo declarado.
- Multilingüismo limitado a los ocho idiomas etiquetados: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés.
- El autor afirma resistencia a la reactivación del rechazo mediante fine-tuning posterior.
- No se documenta soporte de tool calling, function calling, uso de agentes, razonamiento multi-paso explícito, modo thinking, visión ni audio en la información disponible.

## Casos de uso

- Análisis de malware en seguridad defensiva: el modelo puede recibir muestras de código ofuscado o cadenas de explotación y describir su comportamiento sin bloquear la petición, algo que el autor documenta como el motivo principal de su publicación. Adecuado por su contexto de 128K, que permite cargar artefactos completos de un incidente en una sola ventana.
- Red team y pruebas de robustez: sirve como modelo de referencia para evaluar clasificadores de contenido, filtros de salida y sistemas de moderación, generando respuestas que un modelo alineado rechazaría y midiendo si las defensas las detectan.
- Reconstrucción de incidentes a partir de artefactos del atacante: con 128K de contexto se pueden introducir logs, scripts y volcados parciales de un compromiso y pedir una cronología o un resumen técnico sin que el modelo se niegue a procesar el material.
- Investigación sobre alineamiento y edición de pesos: como caso de estudio reproducible de ablación de dirección de rechazo, útil para comparar metodologías de edición (abliteration frente a jbliteration) y medir su impacto en benchmarks de capacidad.
- Generación de documentación técnica sensible: explicación de vulnerabilidades, técnicas de explotación conocidas o procedimientos de respuesta a incidentes para materiales internos de formación en seguridad.
- Evaluación comparativa de refusal: el pipeline de Heretic y el conjunto mlabonne/harmful_behaviors permiten reproducir la medición de 0 rechazos genuinos sobre 100 prompts y contrastarla con otros modelos de la misma familia.

## Benchmarks y rendimiento

| Benchmark | Este modelo | Referencia |
|---|---|---|
| Heretic 100-prompt refusal (mlabonne/harmful_behaviors test[:100]) | 2/100 rechazos, 0/100 rechazos genuinos | no disponible para el modelo base |
| MMLU | no disponible para este modelo | 77,89 % en Sharona (Qwen3.5-27B) tras la cirugia, frente a 76,84 % del baseline segun el autor |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) para este checkpoint concreto en la informacion disponible. La cifra de MMLU citada en la model card corresponde a otro modelo de la coleccion del autor y no debe atribuirse a este.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; con 128K de contexto la caché KV crece de forma significativa y exige GPU de 40-80 GB para secuencias largas.
- GPU recomendadas para bfloat16 completo: A100 40/80 GB, H100 80 GB, o dos GPU de 24 GB en paralelo con `device_map="auto"`.
- En GPU de consumo: cabe en RTX 4090 (24 GB) en bfloat16 con contexto moderado; en RTX 3090 (24 GB) de forma similar; en GPU de 16 GB requiere cuantización, no documentada en la información disponible.
- Despliegue: el autor proporciona ejemplo con `transformers` y `device_map="auto"`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, aunque al ser safetensors de arquitectura Llama son compatibles con las herramientas habituales.
- Opción del autor para GPU insuficiente: DeepswapLLM, que según la model card hace streaming de capas entre GPU, RAM y disco y afirma ser hasta 4 veces más rápido que AirLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Refusal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.3-8B-Instruct-128K-Jbliterated | 8,03 B | 128K | 0/100 genuinos (benchmark propio) | Llama 3.1 Community | Hugging Face, safetensors |
| shb777/Llama-3.3-8B-Instruct-128K (base) | 8,03 B | 128K | alineado, no medido aqui | Llama 3.1 Community | Hugging Face |
| Llama 3.1 8B Instruct (Meta) | 8,03 B | 128K | alineado | Llama 3.1 Community | Hugging Face, amplio ecosistema |
| Sharona (Qwen3.5-27B) segun el autor | 27 B (aprox.) | no disponible | reducido | no disponible | coleccion del autor |

La comparación relevante es con el modelo base: este checkpoint no mejora capacidades, solo elimina el rechazo. Frente a Llama 3.1 8B Instruct de Meta, comparte licencia y tamaño pero difiere en comportamiento de seguridad y en soporte de herramientas de terceros, mucho mayor en el modelo oficial.

## Limitaciones y advertencias

- Eliminación deliberada de la conducta de rechazo: el modelo puede generar contenido dañino, instrucciones operativas para actividades ilícitas o asistencia en ciberataques. El propio autor lo advierte.
- La evidencia de retención de capacidad es débil: la única medición de MMLU corresponde a otro modelo (Sharona, Qwen3.5-27B), no a este checkpoint, y no hay benchmarks de capacidad publicados para él.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de veracidad ni de tasas de error en tareas factuales.
- Idiomas limitados a ocho; el rendimiento en español, hindi y tailandés no está medido y probablemente sea inferior al del inglés.
- La licencia Llama 3.1 Community impone restricciones de uso comercial, obligaciones de atribución ("Built with Llama") y límites de usuarios mensuales para determinados despliegues; debe revisarse antes de cualquier uso en producción.
- El modelo se distribuye como "demo" según el autor, que declara que sus modelos públicos se publican a fuerza parcial y no a plena capacidad; esto invalida asumir que representa el máximo rendimiento del método.
- El contexto de 128K exige VRAM elevada y puede degradar la calidad en el extremo superior de la ventana; no se documenta evaluación de aguja en pajar.
- Uso previsto por el autor: investigación en seguridad, red team y análisis defensivo. No es adecuado como modelo de atención al cliente ni en aplicaciones orientadas al público sin filtros adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Llama-3.3-8B-Instruct-128K-Jbliterated
- Modelo base: https://huggingface.co/shb777/Llama-3.3-8B-Instruct-128K
- Repositorio DeepswapLLM: https://github.com/apolloraines/DeepswapLLM
- Heretic (benchmark de refusal): https://github.com/p-e-w/heretic
- Dataset mlabonne/harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
