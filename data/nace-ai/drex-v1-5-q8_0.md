# nace-ai/drex-v1.5-Q8_0

## Resumen

Drex v1.5 Q8_0 es la cuantización en formato GGUF del modelo de decisión Drex v1.5, desarrollado por nace-ai. A diferencia de un modelo generativo convencional, Drex no produce texto libre: recibe un `state` junto con preguntas tipadas y con nombre, y devuelve una distribución de probabilidad sobre las opciones disponibles para cada pregunta. Se trata, por tanto, de un "decision model" orientado a lo que el autor denomina "system-one", es decir, respuestas rápidas y deterministas sobre alternativas discretas.

El modelo base cuenta con 8.955.900.929 parámetros (unos 8,96 mil millones) según los pesos en safetensors, y esta cuantización Q8_0 ocupa 9.531.694.816 bytes (aproximadamente 9,5 GB), cerca de la mitad del tamaño de los pesos en bf16. El GGUF declara la arquitectura `qwen35` y contiene 250 tensores Q8_0, 180 tensores F32 y dos tensores BF16, con la particularidad de que la cabeza de punteros (`pointer head`) no está cuantizada.

Su relevancia práctica radica en que permite ejecutar un modelo de decisión de casi 9.000 millones de parámetros en hardware de consumo y en Apple Silicon, con paridad de respuestas verificada frente al servidor Python de referencia. No obstante, requiere un fork específico de llama.cpp o de Ollama (rama `drex-v1.5`) y expone un endpoint propio (`POST /v1/systemone`) en lugar de la API de chat habitual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `qwen35` (según metadatos del GGUF) |
| Parámetros totales | 8.955.900.929 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en el servidor de ejemplo; peticiones de hasta 16.384 tokens con el comando documentado |
| Tipos de cuantización | Q8_0 (esta publicación); el modelo base está en bf16 |
| Idiomas soportados | no disponible |
| Licencia | nace-ai-open-rail-m (Nace.AI Open RAIL-M) |
| Formato de pesos | GGUF (250 tensores Q8_0, 180 F32, 2 BF16) |

## Arquitectura y entrenamiento

El GGUF declara la arquitectura `qwen35`, lo que sugiere una base de tipo transformer derivada de la familia Qwen, aunque la model card no detalla la configuración interna (número de capas, dimensiones ocultas, mecanismo de atención). La estructura de tensores es mixta: la mayor parte del cómputo está en 250 tensores cuantizados a Q8_0, mientras que 180 tensores permanecen en F32 y dos en BF16, y la cabeza de punteros se mantiene sin cuantizar, presumiblemente para preservar la precisión de la salida de probabilidades.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card tampoco menciona innovaciones como decodificación especulativa o atención lineal. El rasgo técnico diferencial documentado es la interfaz: el modelo se ejecuta con `--embedding --pooling none` en llama.cpp y responde a un endpoint dedicado `/v1/systemone`, con un formato de petición definido en la documentación del repositorio.

## Capacidades

- Modelo de decisión: dado un `state` y un conjunto de preguntas tipadas y con nombre, devuelve una probabilidad para cada opción.
- Salida probabilística estructurada, no generación de texto libre.
- Interfaz conversacional declarada en los tags del repositorio.
- Compatible con endpoints (tag `endpoints_compatible`).
- Ejecución en GPU vía `-ngl 99` (CUDA o Metal) y en CPU.
- Soporte de ventanas de contexto amplias (hasta 32.768 tokens en la configuración de servidor documentada).
- Soporte en Ollama mediante `CAPABILITY decision` y `PARAMETER num_ctx 16384`.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Toma de decisiones automatizada en pipelines: el modelo recibe un estado del sistema y preguntas discretas (por ejemplo, "¿aceptar?", "¿rechazar?", "¿escalar?") y devuelve probabilidades calibradas que pueden umbralizarse en lógica de negocio.
- Enrutamiento de peticiones: usar las probabilidades de opciones nombradas para dirigir solicitudes a distintos servicios o colas, aprovechando la naturaleza determinista de la salida frente a un modelo generativo.
- Clasificación con contexto largo: con ventanas de hasta 16.384 tokens en la configuración documentada, puede evaluar documentos extensos y emitir decisiones sobre categorías predefinidas.
- Sistemas de recomendación binaria o multiclase: las probabilidades por opción permiten ordenar alternativas en lugar de elegir una sola, útil para ranking.
- Despliegue en edge y estaciones de trabajo: al caber en una GPU de 24 GB (A10G) y en memoria unificada de Apple Silicon (M5 Pro, 48 GB), es viable para inferencia local en entornos con requisitos de privacidad.
- Evaluación de políticas y simulación: integrar el modelo en simuladores que necesiten puntuar acciones discretas bajo un estado dado, con la ventaja de que la cuantización Q8_0 mantiene respuestas idénticas al servidor Python de referencia.
- Automatización de moderación o control de calidad: plantear preguntas tipadas sobre un contenido y usar las probabilidades como señal de confianza antes de aplicar una acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta pruebas de equivalencia funcional: el GGUF Q8_0 produce las mismas respuestas que el servidor Python en una NVIDIA A10G (24 GB, CUDA 13.2) y en un Apple M5 Pro (48 GB de memoria unificada), tanto en Metal como en CPU.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 9,5 GB solo para los pesos en Q8_0, más overhead de contexto; se recomienda al menos 16 GB para ventanas amplias.
- GPU verificadas por el autor: NVIDIA A10G de 24 GB (AWS g5.2xlarge) con CUDA 13.2; Apple M5 Pro con 48 GB de memoria unificada (Metal y CPU).
- Cabe en GPU de consumo con 16 GB o más (por ejemplo, RTX 4080/4090); en tarjetas de 8-12 GB requeriría reducir contexto o usar otra cuantización del modelo base, no publicada en esta ficha.
- Opciones de despliegue: fork de llama.cpp (rama `drex-v1.5`) con `llama-server`, y fork de Ollama (rama `drex-v1.5`) con `CAPABILITY decision`.
- Parámetros de servidor documentados: `-np 2 -c 32768 -b 16384 -ub 2048`, con `--embedding --pooling none`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Formato |
|---|---|---|---|---|---|
| Drex v1.5 Q8_0 | 8,96 B | 32.768 (servidor) / 16.384 (comando documentado) | Modelo de decisión | Nace.AI Open RAIL-M | GGUF |
| Drex v1.5 (base) | 8,96 B | no disponible | Modelo de decisión | Nace.AI Open RAIL-M | safetensors/bf16 |
| Alternativas generativas de ~8-9 B | no disponible | no disponible | LLM generativo | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (decision models) en la documentación proporcionada; la comparación con LLM generativos de tamaño similar no es directa porque la tarea y la interfaz de salida difieren.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni mantiene conversaciones en el sentido habitual; la salida son probabilidades sobre opciones predefinidas.
- Requiere forks específicos de llama.cpp y Ollama (rama `drex-v1.5`); no funciona con las distribuciones estándar sin esas modificaciones.
- La licencia Nace.AI Open RAIL-M incluye restricciones de uso (cláusulas RAIL); es necesario revisar el fichero LICENSE antes de un uso comercial.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación o calibración.
- El endpoint `/v1/systemone` no es compatible con la API de chat de OpenAI; la integración exige adaptar el cliente al formato de petición del repositorio.
- La cabeza de punteros no está cuantizada, por lo que el ahorro de memoria respecto a bf16 es aproximadamente la mitad, no mayor.
- No hay datos publicados de benchmarks, latencia ni throughput, lo que dificulta estimar el rendimiento en producción antes de probarlo.
- El tamaño del repositorio (9,5 GB) y la dependencia de un fork implican costes de mantenimiento adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/nace-ai/drex-v1.5-Q8_0
- Modelo base: https://huggingface.co/nace-ai/drex-v1.5
- Repositorio Drex: https://github.com/nace-ai/drex-decision-models
- Documentación del modelo base: https://github.com/nace-ai/drex-decision-models/tree/main/models/drex-v1.5
- Formato de petición: https://github.com/nace-ai/drex-decision-models/blob/main/docs/request-format.md
- Longitud de contexto: https://github.com/nace-ai/drex-decision-models/blob/main/docs/context-length.md
- Fork de llama.cpp (rama `drex-v1.5`): https://github.com/nace-ai/llama.cpp
- Fork de Ollama (rama `drex-v1.5`): https://github.com/nace-ai/ollama
- Licencia: https://huggingface.co/nace-ai/drex-v1.5-Q8_0/blob/main/LICENSE
