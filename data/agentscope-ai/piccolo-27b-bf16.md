# agentscope-ai/Piccolo-27B-BF16

## Resumen

Piccolo-27B-BF16 es la versión sin cuantizar (BF16) en formato GGUF del modelo Piccolo-27B, desarrollado por agentscope-ai. A diferencia de un modelo conversacional convencional, Piccolo es un "decision model": no genera texto de respuesta, sino que produce decisiones sobre tokens candidatos, orientadas a la revisión de operaciones de herramientas (tool-operation review) y a la retención de contexto. Su pipeline en Hugging Face se etiqueta como clasificación de texto (text-classification).

Este lanzamiento es una conversión directa del checkpoint completo en Safetensors de Piccolo-27B mediante el conversor de llama.cpp, sin pasar por cuantizaciones enteras (Q8, Q4, etc.). Retiene 498 tensores en BF16 y 353 en F32, con un tamaño total de 53,8 GB repartidos en 12 shards. El modelo requiere un runtime modificado (una adaptación de llama.cpp descrita en QwenPaw PR #8463) que implemente atención bidireccional en las capas full-attention y lectura de probabilidades de tokens candidatos; los runtimes de chat causal estándar no lo soportan. Con licencia Apache 2.0 y soporte declarado de inglés y chino, es relevante para equipos que construyen sistemas agénticos y necesitan un verificador o evaluador de decisiones ligado a un LLM mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decision model con atención bidireccional en capas full-attention, atención lineal (recurrent-state) y layout `flex_twice`; basado en Piccolo-27B |
| Parametros totales | 26.895.998.464 (≈26,9 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | El checkpoint fuente declara un contexto máximo configurado, pero esta release no ha sido validada a esa longitud; la configuración CUDA evaluada usa 8192 |
| Tipos de cuantizacion | Ninguna (BF16 sin cuantizar; existen releases Q8_0 y Q4_K_M en repositorios separados) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 (con atribución FlexDM bajo MIT en THIRD_PARTY_LICENSES.md) |
| Formato de pesos | GGUF (12 shards, 53,808 GB en total; 498 tensores BF16 y 353 tensores F32) |

## Arquitectura y entrenamiento

Piccolo-27B-BF16 se deriva del checkpoint completo de Piccolo-27B (etiquetado internamente como `qwenpaw` y con tipo de decisión serializado `blink`). Su arquitectura combina capas de atención completa, en las que el prompt se procesa con atención bidireccional, con atención lineal de estado recurrente, y emplea un layout exacto denominado `flex_twice`. La conversión se realizó con `convert_hf_to_gguf.py --outtype bf16 --no-mtp`, excluyendo los tensores auxiliares de visión y MTP (multi-token prediction), que permanecen solo en el repositorio Safetensors original; esta release es text-only.

Sobre el entrenamiento del modelo base no se proporcionan datos en la model card: no hay cifras de tokens, composición del dataset ni mención de RLHF/DPO. La validación publicada se limita a una regresión sintética de 265 peticiones y 556 juicios (revisión, retención de contexto y puntuación), en la que este artefacto BF16 sirvió como referencia, con una diferencia máxima absoluta de probabilidad de candidato de 0,001725 frente a la inferencia del checkpoint completo. Los autores subrayan que esta comprobación no constituye un benchmark de precisión ni una certificación de seguridad.

## Capacidades

- Producción de decisiones sobre tokens candidatos (probabilidades de candidato) en lugar de generación libre de texto.
- Revisión de operaciones de herramientas (tool-operation review): evaluación de acciones propuestas por un agente antes de ejecutarlas.
- Retención de contexto (context retention) como tarea soportada en la regresión de validación.
- Puntuación (scoring) de entradas, según la regresión sintética descrita.
- Clasificación de texto como pipeline oficial en Hugging Face.
- Uso conversacional etiquetado en los metadatos, aunque el protocolo exige no generar tokens de respuesta.
- Idiomas de trabajo: inglés y chino.
- Importante: no funciona con runtimes de chat causal estándar; requiere la adaptación Piccolo-aware de llama.cpp (QwenPaw PR #8463) con atención bidireccional, layout `flex_twice` y lectura de probabilidades a temperatura 1.

## Casos de uso

- Verificación de llamadas a herramientas en sistemas agénticos: un agente orquestador propone una operación (por ejemplo, ejecutar una función o escribir en una base de datos) y Piccolo puntúa los tokens candidatos para decidir si la acción es segura o debe revisarse.
- Puerta de seguridad (guardrail) en pipelines de agentes: integrado como clasificador de decisiones antes de ejecutar acciones con efectos secundarios, gracias a su salida de probabilidades de candidato a temperatura 1.
- Retención de contexto en conversaciones largas: puede emplearse como módulo que evalúa qué fragmentos de contexto conviene conservar en ventanas de diálogo multi-turno.
- Puntuación y filtrado de candidatos: selección entre múltiples respuestas o rutas de razonamiento generadas por otro modelo, usando las probabilidades de candidato como señal de ranking.
- Clasificación de texto en inglés y chino: tareas de categorización donde se prefiera un modelo especializado en decisiones frente a uno generativo.
- Evaluación offline de decisiones sintéticas: la regresión de 265 peticiones y 556 juicios muestra su uso como referente para tests de regresión en equipos que modifiquen cuantizaciones o runtimes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación del checkpoint completo están en un repositorio de evaluación separado y que no se pueden extrapolar puntuaciones a esta versión cuantizada/convertida; la única métrica publicada es la diferencia máxima de probabilidad de candidato (0,001725) frente al checkpoint completo, que no es una puntuación de benchmark.

## Requisitos de hardware

- VRAM estimada: los 12 shards GGUF suman 53,8 GB solo en pesos; a esto hay que sumar los buffers de KV/estado y el espacio de trabajo del runtime. Se necesita, por tanto, un sistema con más de 54 GB de memoria accesible (VRAM o RAM unificada); no cabe en una única GPU de consumo típica (24 GB).
- GPU recomendadas: la configuración CUDA evaluada usa un slot con contexto/batch/ubatch de 8192, prefix caching y chunked prefill desactivados. Hardware con 64-80 GB de VRAM (A100 80 GB, H100) es el escenario realista; no se especifican modelos concretos de GPU.
- Consumer GPUs: no viable en tarjetas de 24 GB (RTX 3090/4090) en BF16 por el tamaño de los pesos; podría considerarse CPU con gran RAM, aunque no hay datos de rendimiento publicados.
- Despliegue: exclusivamente mediante la adaptación Piccolo-aware de llama.cpp descrita en QwenPaw PR #8463 (aún en estado Draft) y su guía de instalación; vLLM, TGI, Ollama y otros runtimes no implementan el protocolo requerido.
- Descarga: descargar los 12 shards en el mismo directorio y cargar `Piccolo-27B-BF16-00001-of-00012.gguf`; `release-manifest.json` incluye tamaños en bytes y checksums SHA-256.

## Comparativa con modelos similares

Modelos comparables directos (decision models de ~27 B con este protocolo) no disponible. Como referencia de tamaño y licencia frente a modelos densos generativos convencionales:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Piccolo-27B-BF16 | 26,9 B | 8192 validado (máximo configurado no validado) | Apache 2.0 | GGUF BF16 |
| Qwen2.5-32B (referencia de clase similar) | 32,5 B | 131.072 | Qwen (uso comercial con condiciones) | Safetensors, GGUF |
| Gemma 2 27B (referencia de clase similar) | 27,2 B | 8192 | Gemma (restricciones de uso) | Safetensors, GGUF |

Nota: esta comparativa es solo de tamaño y licencia; Piccolo no es intercambiable con estos modelos, ya que no genera texto de respuesta y requiere un runtime específico.

## Limitaciones y advertencias

- No genera texto de respuesta: cualquier intento de uso como chatbot causal con runtimes estándar (llama.cpp sin parchear, Ollama, vLLM, TGI) no funcionará o producirá resultados inválidos.
- La integración en QwenPaw sigue en PR Draft (#8463): la publicación de los pesos no añade automáticamente soporte ni extiende la allowlist de repositorios de la aplicación; hay que verificar que la versión del runtime reconoce el repositorio `-BF16` como decision model.
- El contexto máximo configurado del checkpoint fuente no ha sido validado en esta release; la evaluación se limitó a 8192 con prefix caching y chunked prefill desactivados. Debe evitarse la truncación del prompt.
- La validación publicada (regresión sintética de 265 peticiones) usa este artefacto como propia referencia y no establece corrección de tareas ni calibración de riesgo ni certificación de seguridad.
- No incluye tensores de visión ni MTP: es una release text-only; esas capacidades requieren el checkpoint Safetensors completo.
- No se declara equivalencia con computación FP32; BF16 es la precisión principal del checkpoint.
- Datos de sesgos, riesgo de alucinación y rendimiento multilingüe: no disponibles en la model card.
- ModelScope aún no está publicado; solo hay distribución verificada vía Hugging Face.
- Licencia Apache 2.0 permite uso comercial, pero el layout FlexDM incorpora atribución bajo MIT que debe respetarse (THIRD_PARTY_LICENSES.md).

## Enlaces

- Hugging Face: https://huggingface.co/agentscope-ai/Piccolo-27B-BF16
- Modelo base (Safetensors): https://huggingface.co/agentscope-ai/Piccolo-27B
- Repositorio del proyecto (GitHub): https://github.com/agentscope-ai/Piccolo
- Matriz de modelos publicados: https://github.com/agentscope-ai/Piccolo/blob/0d1b3d4544766a55d137b979e8c87141bf182059/docs/MODELS.md
- Resultados de evaluación del checkpoint completo: https://github.com/agentscope-ai/Piccolo/blob/0d1b3d4544766a55d137b979e8c87141bf182059/evaluation/README.md
- Decision Playground (demo): https://decisionplayground.agentscope.io/
- PR de integración en QwenPaw: https://github.com/agentscope-ai/QwenPaw/pull/8463
- Guía de inferencia local: https://github.com/Xinji-Mai/QwenPaw/blob/beea37749185553a6897e546eae6b7954717da5b/docs/local-piccolo.md
- ModelScope: https://modelscope.cn/models/agentscope-ai/Piccolo-27B (aún no publicado)
