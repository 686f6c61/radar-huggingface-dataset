# micdun/code_54k_gpt_oss_20b_qwq_deepseek_distill_llama3_70b_qwen2_5-1_5b_lr1e-4

## Resumen

`micdun/code_54k_gpt_oss_20b_qwq_deepseek_distill_llama3_70b_qwen2_5-1_5b_lr1e-4` es un ajuste fino supervisado (SFT) del modelo `Qwen/Qwen2.5-1.5B-Instruct`, publicado por el usuario micdun en Hugging Face. El modelo se ha entrenado sobre un conjunto sintético de 54.000 ejemplos de dominio de código, generados por tres modelos "profesores" distintos (18.000 ejemplos por cada uno), y el identificador del run codifica tanto el origen de los datos como los hiperparámetros del entrenamiento.

Se trata, por tanto, de un experimento de destilación de datos sintéticos sobre una base pequeña (1.540 millones de parámetros), orientado a evaluar cómo se transfiere capacidad de generación de código desde modelos de mayor tamaño hacia un transformer denso de 1,5B. El modelo conserva la arquitectura, el tokenizador y el contexto de la familia Qwen2.5, lo que facilita su integración en pipelines existentes basados en `transformers`.

La relevancia es acotada: el repositorio no incluye model card sustantiva, licencia declarada, idiomas soportados ni resultados de evaluación, y cuenta con cero descargas y cero likes en el momento de la consulta. Debe considerarse un artefacto de investigación reproducible más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), denso |
| Parametros totales | 1.543.714.304 (1,54B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-1.5B-Instruct; no confirmada por el autor) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizacion GGUF/AWQ no publicada por el autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Libreria | transformers |
| Tamano del repo | 3,1 GB |
| Dominio de entrenamiento | codigo (54k ejemplos sinteticos) |
| Hiperparametros | full fine-tune, 3 epocas, lr 1e-4, batch global 64 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con atención causal estándar, normalización RMSNorm, activaciones SwiGLU y embeddings de tokens compartidos con la cabeza de salida (tied embeddings). El ajuste no modifica la topología del modelo; se trata de un full fine-tune, es decir, se actualizan todos los parámetros y no solo adaptadores LoRA.

El entrenamiento se realizó con la librería TRL sobre 54.000 ejemplos sintéticos de código, 18.000 generados por cada uno de los tres modelos profesores referenciados en el identificador del run. Se aplicaron 3 épocas con learning rate 1e-4 y batch global de 64, lo que implica aproximadamente 2.532 pasos de optimización. No se documenta la composición lingüística del dataset, la longitud de las secuencias, la presencia de filtrado de calidad, ni si hubo etapas posteriores de preferencia (RLHF/DPO). Tampoco se especifica la estrategia de enmascarado de pérdida en los turnos del asistente.

## Capacidades

- Generación de texto conversacional en formato chat, heredada del modelo base instruct.
- Generación de código en el dominio cubierto por los datos sintéticos de los profesores; el alcance exacto de lenguajes no está documentado.
- Razonamiento multi-turno básico dentro de los límites de un modelo de 1,5B.
- Soporte de tool calling y function calling: no confirmado por el autor; el modelo base Qwen2.5-Instruct lo soporta, pero el ajuste fino puede haber degradado esta capacidad al entrenar solo sobre código.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas; dependen del modelo base.
- Modo thinking, visión o audio: no disponibles en este modelo.

## Casos de uso

- Autocompletado de código en IDE: el modelo puede integrarse como backend de un servidor compatible con la API de `transformers` o TGI para sugerir fragmentos de código en el lenguaje del editor, aprovechando su tamaño reducido para inferencia de baja latencia en local.
- Generación de tests unitarios: dado un fragmento de función, el modelo puede producir casos de prueba sintéticos; útil en pipelines de CI/CD para aumentar cobertura en proyectos con poca base de tests.
- Explicación de código legado: el modelo puede resumir en lenguaje natural qué hace una función o un módulo, facilitando la incorporación de nuevos desarrolladores a un repositorio.
- Traducción entre lenguajes de programación: para pares de lenguajes bien representados en los datos de los profesores, el modelo puede reescribir fragmentos de un lenguaje a otro, con verificación humana posterior.
- Asistente de documentación: generación de docstrings y comentarios a partir de firmas de funciones, en un flujo por lotes sobre un repositorio.
- Base para experimentos de destilación: sirve como punto de partida para estudiar la transferencia de capacidad desde profesores grandes a un alumno de 1,5B, comparando con el modelo base sin ajustar.
- Prototipado rápido en entornos con recursos limitados: al caber en una GPU de consumo, permite desplegar un asistente de código en una estación de trabajo sin acceso a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye evaluaciones en HumanEval, MBPP, MMLU ni ninguna otra métrica, ni comparaciones con el modelo base o con los profesores.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 5 GB para secuencias cortas.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,6 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,8-1 GB para pesos, aunque el autor no publica pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM en FP16 (RTX 3060, RTX 4060, RTX 4090, A10, L4, A100, H100). Cabe holgadamente en GPU de consumo.
- Despliegue: `transformers` de forma nativa; compatible con Text Generation Inference (TGI) por los tags del repositorio; para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión no publicada por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (micdun) | 1,54B | no disponible | codigo (SFT sintetico) | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (segun Qwen) | general + instruct | Apache 2.0 (segun Qwen) | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1,54B | 32.768 tokens (segun Qwen) | codigo | Apache 2.0 (segun Qwen) | Hugging Face, con benchmarks publicados |
| deepseek-ai/deepseek-coder-1.3b-instruct | 1,3B | 16.384 tokens (segun DeepSeek) | codigo | DeepSeek License | Hugging Face |

La comparación directa con Qwen2.5-Coder-1.5B-Instruct es la más pertinente: mismo tamaño y mismo dominio, pero con evaluación pública y licencia clara. El modelo de micdun no aporta métricas que permitan justificar su elección frente a esa alternativa.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks que permitan estimar la calidad del ajuste ni compararlo con el modelo base.
- Licencia no declarada: no se puede determinar si el uso comercial está permitido; el modelo base Qwen2.5-1.5B-Instruct es Apache 2.0, pero el autor no confirma la licencia del derivado.
- Idiomas no documentados: el ajuste sobre datos sintéticos de código puede haber reducido la competencia multilingüe del modelo base.
- Riesgo de sobreajuste al estilo de los profesores: con 3 épocas y lr 1e-4 sobre 54k ejemplos, es plausible que el modelo reproduzca patrones idiosincrásicos de los datos sintéticos, incluidos errores de los profesores.
- Riesgo de alucinación en código: como cualquier modelo de 1,5B, puede generar APIs inexistentes o firmas incorrectas; se requiere verificación automática (compilación, tests) antes de usar el código en producción.
- Capacidad de tool calling potencialmente degradada: el ajuste se centró en código y no se documenta si se preservaron las capacidades de function calling del modelo base.
- Sin garantías de mantenimiento: repositorio con cero descargas, sin issues ni discusión, creado y actualizado el mismo día; no hay indicios de soporte.
- Datos de entrenamiento sintéticos: la calidad final está acotada por la calidad de los profesores y por el filtrado aplicado, que no se documenta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/micdun/code_54k_gpt_oss_20b_qwq_deepseek_distill_llama3_70b_qwen2_5-1_5b_lr1e-4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Alternativa de codigo comparable: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Libreria TRL: https://github.com/huggingface/trl
- Libreria transformers: https://github.com/huggingface/transformers
