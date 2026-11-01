# mateo-19182/forocoches-lm-v3

## Resumen

forocoches-lm-v3 es un ajuste fino completo (full fine-tune) del modelo Gemma 3 1B en su variante preentrenada, desarrollado por el usuario mateo-19182. El objetivo no es construir un asistente generalista, sino un generador de hilos de foro en castellano de España que imite el registro, la estructura y las convenciones del foro ForoCoches: título, primer mensaje (OP) y respuestas de otros foreros, condicionado opcionalmente por el tipo de hilo y el año de publicación.

Con 999.885.952 parámetros (aproximadamente 1B) y pesos en bf16, el modelo parte de la versión anterior forocoches-lm-v2 y continúa su entrenamiento sobre el dataset forocoches-threads-v3, que incorpora historias largas y hilos del archivo histórico entre 2003 y 2026. La innovación principal respecto a v2 es la coherencia en aperturas extensas: párrafos estructurados, ediciones simuladas y un resumen de cierre, en lugar de derivar hacia texto corrido sin estructura.

Es relevante como artefacto de investigación sobre modelado de estilo y dominio: demuestra que un modelo de ~1B parámetros puede especializarse en un registro lingüístico muy concreto con un presupuesto de entrenamiento modesto (8 horas en una única RTX 5090) y mantenerse desplegable en el navegador mediante cuantización q4f16_1 con MLC. Su licencia Gemma impone las condiciones de uso de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text, `gemma3_text`) |
| Parametros totales | 999.885.952 (~1B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (entrenado con chunks de 8.192 tokens) |
| Tipos de cuantizacion | bf16 (pesos publicados); q4f16_1 para MLC (repo separado) |
| Idiomas soportados | español de España (`es`) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (transformers); pesos MLC q4f16_1 en repo aparte |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Gemma 3 en su variante de 1B parámetros, inicializado desde los pesos preentrenados de Gemma 3 1B y posteriormente desde forocoches-lm-v2. El ajuste es completo (no LoRA): todos los pesos se actualizan con Unsloth, TRL y FlexAttention sobre una única RTX 5090, con filas empaquetadas de 8.192 tokens, 8 filas por paso (65.536 tokens por paso) y 8.396 pasos totales. Se usa precisión bf16 en cómputo con pesos maestros en fp32, learning rate 2e-5 con decaimiento coseno y un 3% de warmup, weight decay 0.01, y pérdida solo sobre los tokens de completion (la cabecera de condicionamiento no se predice). El entrenamiento completo llevó 8 horas.

Los datos provienen de forocoches-threads-v3: 545,5M tokens de completion en una época, compuestos por historias duplicadas (280M), hilos del rastreo de octubre de 2026 (120M), una muestra de 90M del archivo histórico y 56M de repetición de español general procedente de FineWeb-2 (`spa_Latn`). Los hilos largos se dividen en fragmentos de 8.192 tokens con 256 tokens de contexto enmascarado. El tipo de hilo (`historia`, `pregunta`, `debate`, `humor`, `hipotetico`) y la calidad se etiquetaron con Claude Haiku, conservando solo hilos de calidad media o alta. El año del mensaje de apertura se estima a partir del ID del hilo rastreado más cercano. La pérdida de evaluación final es 2,168 sobre el conjunto de validación de v3.

## Capacidades

- Generación de texto en castellano de España con registro de foro: títulos, aperturas extensas y cadenas de respuestas con autores pseudonimizados (`OP`, `forero_a`, `forero_b`).
- Condicionamiento opcional por tipo de hilo (`historia`, `pregunta`, `debate`, `humor`, `hipotetico`) y por año (2003–2026); cada campo se eliminó en la mitad de los ejemplos de entrenamiento, por lo que la cabecera puede omitirse total o parcialmente.
- Generación de aperturas largas y coherentes con párrafos, ediciones simuladas y resumen de cierre.
- Soporte de citas entre foreros mediante la sintaxis `[cita=forero_a]...[/cita]`.
- Generación de hilos multi-turno con varios participantes simulados.
- No dispone de tool calling, function calling, modo thinking, visión ni audio; es exclusivamente text-generation.
- Capacidad multilingüe limitada al español; no se documenta soporte de otros idiomas.

## Casos de uso

- Generación de datos sintéticos de foro para investigación en modelado de estilo: el modelo produce hilos etiquetados por tipo y año, útiles para aumentar corpus de entrenamiento de clasificadores de registro o de detección de toxicidad.
- Simulación de conversaciones multi-participante: permite generar cadenas de respuestas con varios foreros pseudonimizados, útil para estudiar dinámicas de discusión en línea sin recurrir a datos personales reales.
- Prototipado de interfaces creativas: el demo en navegador con pesos q4f16_1 demuestra que un modelo de ~1B puede ejecutarse en cliente vía MLC, lo que sirve como referencia para aplicaciones de escritura asistida de bajo coste.
- Evaluación de coherencia en textos largos: al estar entrenado con chunks de 8.192 tokens y producir aperturas con párrafos y cierre, es un banco de pruebas para métricas de coherencia discursiva en español.
- Estudio de sesgos y toxicidad en corpus de foro: el modelo reproduce el registro del material original, incluido el ofensivo, lo que lo hace útil para generar muestras controladas en auditorías de moderación.
- Ajuste de estilo en dominios específicos: sirve como caso de referencia de especialización de un modelo de 1B con fine-tune completo en una sola GPU consumer, replicable para otros foros o comunidades en español.
- Generación de hilos históricos por año: la condición de año permite producir texto con referencias temporales plausibles para estudios diacrónicos del lenguaje de foro.

## Benchmarks y rendimiento

Perplejidad de completion sobre 4.873 hilos reservados (el mismo conjunto para todas las versiones; menor es mejor):

| Categoria | base | v1 | v2 | v3 |
|---|---:|---:|---:|---:|
| Todo el texto de foro | 11,11 | 7,08 | 6,81 | **6,54** |
| historia | 11,88 | 7,87 | 7,63 | **7,17** |
| humor | 12,53 | 6,60 | 6,40 | **6,25** |
| debate | 11,42 | 7,24 | 7,01 | **6,77** |
| pregunta | 10,58 | 6,95 | 6,65 | **6,36** |
| Español general (control) | 13,19 | 12,82 | 13,03 | **10,68** |

Sobre el conjunto de validación propio de v3 (3.280 hilos con más historias largas), v3 frente a v2: `historia` 12,31 → 10,46 y global 9,90 → 8,78. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB de pesos más overhead de activaciones y caché KV; en la práctica, entre 3 y 5 GB según longitud de contexto y lote.
- VRAM estimada en q4f16_1 (MLC): alrededor de 0,5–1 GB de pesos, apto para ejecución en navegador.
- GPU recomendadas: cualquier GPU consumer con al menos 6–8 GB de VRAM para bf16 (RTX 3060, RTX 4060, RTX 4090); para entrenamiento o lotes grandes, A100 o H100 no son necesarias dado el tamaño, pero aceleran el throughput.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más; el autor entrenó el modelo completo en una RTX 5090.
- Opciones de despliegue: transformers (referencia del autor), text-generation-inference (tag `text-generation-inference`), endpoints compatibles, MLC para ejecución en navegador con pesos q4f16_1. No se documenta soporte explícito de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| forocoches-lm-v3 | ~1B | no disponible (entrenado a 8.192) | Foro español (ForoCoches) | Gemma Terms of Use | HuggingFace, demo web |
| forocoches-lm-v2 | ~1B | no disponible | Foro español (versión previa) | Gemma Terms of Use | HuggingFace |
| Gemma 3 1B (base) | ~1B | no disponible en la información | Modelo generalista | Gemma Terms of Use | HuggingFace, Google AI |
| FineWeb-2 `spa_Latn` (dataset) | no aplica | no aplica | Corpus de español general | según dataset | HuggingFace |

La comparación con modelos de la misma categoría (generadores de estilo de foro en español) no está disponible: no se han identificado alternativas públicas equivalentes en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de hobby e investigación, no un asistente de producción: no debe usarse como fuente de información factual.
- Reproduce el registro del material original, incluido contenido grosero, sexista y ofensivo; requiere filtrado si se expone a usuarios finales.
- Afirma hechos inventados con seguridad; riesgo alto de alucinación, especialmente en hilos de tipo `historia` que a veces derivan en artículos enciclopédicos.
- La pseudonimización de autores es imperfecta: los nombres de cinco o más caracteres se enmascararon, pero sobrevivieron los más cortos y algunas formas `@@nick`.
- El español es exclusivamente de España; no se documenta rendimiento en otras variantes.
- La licencia Gemma Terms of Use impone restricciones de uso comercial y obligaciones de atribución; debe revisarse antes de cualquier despliegue productivo.
- El contexto máximo efectivo no está documentado; el entrenamiento se realizó con chunks de 8.192 tokens, por lo que secuencias más largas pueden degradar la coherencia.
- El condicionamiento por año depende de estimaciones a partir de IDs de hilos, por lo que la señal temporal puede ser ruidosa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mateo-19182/forocoches-lm-v3
- Modelo base v2: https://huggingface.co/mateo-19182/forocoches-lm-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/mateo-19182/forocoches-threads-v3
- Pesos MLC q4f16_1: https://huggingface.co/mateo-19182/forocoches-lm-v3-q4f16_1-MLC
- Demo en navegador: https://forocoches.m19182.dev
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
