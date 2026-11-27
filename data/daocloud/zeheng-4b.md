# DaoCloud/Zeheng-4B

## Resumen

Zeheng-4B (择衡 4B) es un modelo de decisión desarrollado por DaoCloud y afinado a partir de Qwen3.5-4B. No es un modelo generativo al uso: su función es puntuar candidatos discretos y devolver una probabilidad no calibrada para cada opción, en el mismo orden en que se le presentan. Soporta tres tipos de tarea: elección única (`choice`), valoraciones ordenadas (`score`) y juicios binarios (`noul`). Técnicamente se distribuye como un adaptador LoRA PEFT en FP32 (rango y alpha 64, dropout 0) más una cabeza de decisión separada de 255 vías; ambos ficheros de pesos son imprescindibles para la inferencia.

El interés del modelo reside en su enfoque: en lugar de generar texto y parsear la respuesta, ejecuta una pasada bidireccional de atención completa sobre el backbone congelado y lee una posición concreta (`readout_position`, el token inicial del fragmento de la pregunta) para producir una distribución de probabilidad sobre los candidatos. Esto lo hace adecuado como componente de enrutamiento, clasificación o arbitraje dentro de pipelines más amplios, no como chatbot.

El checkpoint se publicó el 27 de noviembre de 2026, tiene un tamaño de repositorio de 0,5 GB y requiere el runtime complementario `jev-inference` para funcionar. La validación del checkpoint de entrenamiento se realizó sobre Ascend 950DT; el runtime admite CPU y NPU Ascend. La licencia es Apache 2.0, igual que el modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA PEFT sobre backbone Qwen3.5-4B (transformer con atención bidireccional completa en la pasada de decisión) + cabeza de decisión de 255 vías |
| Parámetros totales | 4B en el modelo base; el adaptador LoRA y la cabeza se distribuyen por separado (no se especifica el recuento exacto del adaptador) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los pesos se publican en FP32; la inferencia de decisión se ejecuta en FP32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors` FP32, `decision_head.safetensors`), más `adapter_config.json`, `decision_config.json`, tokenizer y `chat_template.jinja` |

## Arquitectura y entrenamiento

El backbone Qwen3.5-4B permaneció congelado durante todo el entrenamiento. Sobre él se entrenaron dos componentes: un adaptador LoRA en FP32 con rango y alpha 64 y dropout 0, y una cabeza de decisión de 255 vías. El entrenamiento consistió en una época y 15.312 pasos de optimizador sobre 1.959.813 registros. La evaluación se hizo sobre un conjunto congelado y separado de 19.787 registros.

La pasada de decisión no es autorregresiva: emplea atención bidireccional completa, mantiene la ruta GDN causal original del backbone y opera en FP32. El modelo consume los token IDs nativos de `code_lm`, toma el token inicial del fragmento de la pregunta como `readout_position` y recibe los IDs de los candidatos en su orden codificado. El runtime `jev-inference` verifica la integridad del modelo base contra `base-model-fingerprints.json` (los hashes de los dos shards de pesos y del tokenizer original coinciden con los ficheros de Qwen3.5-4B en el Hub) y valida también los ficheros auxiliares del snapshot de entrenamiento, incluido `configuration.json`, que no aparece en el listado de ficheros upstream.

## Capacidades

- Clasificación y puntuación de decisiones tipadas: elección única (`choice`), valoración ordenada (`score`) y juicio binario (`noul`).
- Devolución de probabilidad no calibrada por candidato, respetando el orden de entrada de las opciones.
- Lectura de una posición concreta del contexto (`readout_position`) en lugar de generación token a token.
- Integración mediante API HTTP: el runtime expone `POST /v1/decisions` con esquema JSON de entrada y salida.
- Verificación de integridad del modelo base y de los ficheros de release mediante hashes SHA256.
- Ejecución en CPU y en NPU Ascend a través del runtime complementario.
- No soporta generación de texto libre, tool calling ni razonamiento multi-paso de forma nativa; su salida es una distribución sobre candidatos predefinidos.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento de consultas en atención al cliente: dado un mensaje entrante y un conjunto cerrado de intenciones (`choice`), el modelo devuelve la probabilidad de cada una y permite aplicar un umbral de confianza antes de derivar a un agente humano.
- Moderación de contenido con criterios graduados: usando el tipo `score`, se puede ordenar la severidad de un texto según una escala predefinida y activar revisiones proporcionales al nivel obtenido.
- Arbitraje binario en pipelines de validación: con `noul`, decidir si una respuesta generada cumple o no un criterio (por ejemplo, si cita la fuente) antes de publicarla, actuando como filtro barato y determinista.
- Selección entre respuestas candidatas de un LLM generativo: puntuar varias salidas con `choice` y elegir la de mayor probabilidad como paso de reranking, reduciendo coste frente a un juez generativo.
- Clasificación de tickets o incidencias en sistemas de soporte interno: mapear el texto a categorías fijas y usar la distribución resultante para priorizar colas de trabajo.
- Evaluación de preferencias en investigación: emplear las probabilidades como señal blanda (soft labels) en experimentos de alineación o anotación asistida, dado que el modelo se entrenó contra distribuciones objetivo y reporta acuerdo ponderado del 83,66 % con el argmax de dichas distribuciones.
- Control de calidad en pipelines de datos: decidir automáticamente si un registro pasa o no un criterio binario antes de incorporarse a un conjunto de entrenamiento.

## Benchmarks y rendimiento

Métricas de validación interna reportadas por el autor (conjunto congelado de 19.787 registros):

| Métrica | Valor |
|---|---:|
| Pérdida de validación | 0,41711360 |
| Entropía cruzada del modelo padre | 0,41568984 |
| Brier score del modelo padre | 0,19973285 |
| Acuerdo ponderado con el argmax de la distribución objetivo | 83,6569 % |
| Diferencia máxima absoluta de probabilidad tras exportar y recargar (2 peticiones) | 0 |

Resultados en el suite público Decision Index 0.3 (ejecución del 24 de noviembre de 2026, 8 GPU NVIDIA H200 en paralelo de datos, FP32 con TF32 desactivado, duración aproximada de 2 h 14 min, reutilizando 2.059 respuestas previas):

| Métrica | Valor |
|---|---:|
| Public Decision Index 0.3 | 53,85 |
| Raw Index | 64,88 |
| Peticiones completadas | 140.620 / 140.620 |
| Errores | 0 |
| Peticiones puntuadas tras exclusiones del suite | 140.178 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el modelo no está orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 0,5 GB, pero la inferencia requiere cargar además el modelo base Qwen3.5-4B completo en FP32, lo que implica un requisito de memoria considerablemente mayor.
- GPU recomendadas: la evaluación del suite público se ejecutó en 8 GPU NVIDIA H200 en paralelo de datos. Para uso individual no se especifican GPU concretas.
- Hardware validado en entrenamiento: Ascend 950DT. El runtime `jev-inference` soporta CPU y NPU Ascend.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada; el runtime documentado no menciona CUDA ni llama.cpp.
- Opciones de despliegue: exclusivamente el runtime complementario `jev-inference`, configurado mediante `config.toml` (`model.base_path`, `model.checkpoint_path`, `model.verify_base = true`) y arrancado con `./start`. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles. Como referencia de escala, el suite público completo (140.620 peticiones) tardó unas 2 h 14 min en 8 H200 en DP8.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de decisión tipada en la documentación proporcionada. Como referencia del componente base:

| Modelo | Parámetros | Contexto | Tipo | Licencia |
|---|---|---|---|---|
| Zeheng-4B | 4B (base) + adaptador LoRA + cabeza 255 vías | no disponible | Modelo de decisión (clasificación) | Apache 2.0 |
| Qwen3.5-4B | 4B | no disponible | LLM generativo | Apache 2.0 |
| Alternativas de decisión tipada | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las probabilidades devueltas son explícitamente no calibradas; no deben interpretarse como confianza absoluta sin un proceso de calibración previo.
- El modelo solo puntúa candidatos suministrados por el usuario; no genera texto ni razona de forma abierta. No es un sustituto de un LLM conversacional.
- Requiere el runtime `jev-inference` y una copia local del modelo base que coincida exactamente con `base-model-fingerprints.json`; cualquier discrepancia de hash provoca fallo de verificación si `model.verify_base = true`.
- La inferencia de decisión se ejecuta en FP32 con atención bidireccional completa, lo que limita las optimizaciones de memoria y velocidad habituales en modelos generativos.
- No se documentan los idiomas soportados; el tokenizer proviene de Qwen3.5-4B, pero no hay confirmación de cobertura multilingüe para la tarea de decisión.
- No se especifican sesgos conocidos ni tasas de alucinación; al tratarse de un clasificador, el riesgo principal es la asignación errónea de probabilidad a candidatos fuera de la distribución de entrenamiento.
- Los datos de entrenamiento y validación son internos y no se publican; la reproducibilidad de las métricas reportadas es limitada.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar también la licencia del modelo base Qwen3.5-4B, publicada bajo los mismos términos según el autor.
- El modelo se publicó con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DaoCloud/Zeheng-4B
- Métricas de evaluación: https://huggingface.co/DaoCloud/Zeheng-4B/blob/main/evaluation/metrics.json
- Licencia: https://huggingface.co/DaoCloud/Zeheng-4B/blob/main/LICENSE
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Metodología Decision Index: https://github.com/apolinario/decision-index
