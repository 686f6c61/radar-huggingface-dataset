# gqbond/DeCert-Llama-3.1-8B

## Resumen
DeCert-Llama-3.1-8B es un modelo generativo de recompensa (generative reward model) desarrollado por el autor gqbond, derivado mediante fine-tuning supervisado y optimización directa de preferencias (DPO) a partir de meta-llama/Llama-3.1-8B-Instruct. Su propósito no es generar texto libre, sino actuar como juez evaluador en comparaciones por pares de respuestas candidatas dentro de un turno conversacional. El modelo implementa la metodología DeCert descrita en el paper "Judging the Justification: Decision Certificate Supervision for Generative Reward Models", que trata la justificación de un juicio como un "certificado de decisión" verificable.

El modelo resuelve el problema de la evaluación automática de respuestas en pipelines de RLHF, Best-of-N y sistemas de jueces generativos. A diferencia de un reward model escalar clásico, DeCert produce una salida estructurada en XML con observaciones por criterio, un veredicto por criterio y una decisión final codificada como `<answer>[[A]]</answer>` o `<answer>[[B]]</answer>`. Esto permite auditar el razonamiento del juez y detectar justificaciones no soportadas por las respuestas evaluadas.

Con 8.030.261.248 parámetros (aproximadamente 8B), arquitectura transformer densa heredada de Llama 3.1 y licencia Apache 2.0, el modelo es relevante para equipos que necesitan un juez generativo desplegable en infraestructura propia, con trazabilidad del veredicto y sin dependencia de APIs propietarias. Su contexto heredado de Llama 3.1 es de 128.000 tokens, aunque la model card no lo especifica explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Llama 3.1-8B-Instruct) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.1; no confirmado en la model card) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors bfloat16; compatible con cuantizaciones estándar de Llama) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de meta-llama/Llama-3.1-8B-Instruct, un transformer decoder-only denso con 8.030 millones de parámetros. Sobre esa base se aplicó un pipeline de dos fases: primero fine-tuning supervisado (SFT) y después optimización directa de preferencias (DPO). Los datos de entrenamiento derivan del split de preferencias del dataset nvidia/HelpSteer3, lo que orienta el modelo hacia la comparación de respuestas en dominios generales.

La innovación técnica central es la supervisión de "certificados de decisión": el modelo no solo aprende a emitir un veredicto A/B, sino a producir una justificación estructurada que debe (1) usar observaciones soportadas por las respuestas reales, (2) cubrir las diferencias materiales entre ambas respuestas y (3) sostener el veredicto final. La salida se organiza en etiquetas `<comparison>`, `<criterion>`, `<obs side="A|B">`, `<result winner="...">`, `<decision>` y `<answer>[[A|B]]</answer>`, con reglas explícitas de formato y anti-inyección de instrucciones. El repositorio contiene pesos fusionados (merged), cargables directamente con Transformers, y no es un reward model escalar calibrado.

## Capacidades
- Evaluación por pares de respuestas candidatas (A frente a B) en el último turno de una conversación multi-turno.
- Generación de certificados de decisión estructurados en XML con observaciones verificables por criterio.
- Aplicación de políticas de evaluación configurables con criterios ponderados (corrección, seguimiento de instrucciones, completitud, claridad, etc.).
- Razonamiento justificativo: explica por qué una respuesta gana o pierde cada criterio, incluyendo fortalezas de la respuesta rechazada.
- Robustez frente a inyección de instrucciones dentro del contenido evaluado (regla explícita de tratar conversación y respuestas como datos).
- Salida parseable de forma determinista mediante regex sobre `<answer>[[A]]</answer>` o `<answer>[[B]]</answer>`.
- Soporte de conversación multi-turno como contexto de evaluación.
- Capacidades multilingües limitadas al inglés según la model card.
- No soporta tool calling, agentes ni visión de forma nativa para su tarea objetivo.

## Casos de uso
- Evaluación automática en pipelines de RLHF: el modelo actúa como juez generativo para puntuar pares de respuestas generadas por el modelo en entrenamiento, sustituyendo o complementando anotadores humanos en la fase de preference labeling.
- Best-of-N sampling: dado un prompt y N respuestas generadas, DeCert compara pares y selecciona la mejor respuesta final; su salida estructurada permite agregar veredictos por criterio para una selección más robusta que un score escalar.
- Auditoría de calidad de asistentes conversacionales: se integra en un job batch que evalúa respuestas de producción contra una política de evaluación concreta y genera informes con observaciones citadas textualmente.
- Construcción de datasets de preferencias sintéticas: el certificado de decisión sirve como dato de entrenamiento adicional para modelos de recompensa o para fine-tuning con DPO.
- Control de regresiones en CI/CD de modelos generativos: cada release se evalúa contra un conjunto fijo de pares prompt-respuesta y se compara el porcentaje de victorias frente a la versión anterior.
- Investigación en meta-evaluación de jueces: el formato XML con observaciones permite medir la fidelidad de la justificación (si las citas existen en las respuestas) y estudiar sesgos de posición o longitud.
- Filtrado de datos en curación de corpus: descartar respuestas de baja calidad comparándolas contra una referencia considerada buena bajo una política de evaluación definida.
- Despliegue self-hosted en entornos con requisitos de privacidad: al ser Apache 2.0 y ejecutable localmente, permite evaluar conversaciones sensibles sin enviar datos a APIs de terceros.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas específicas de acuerdo con anotadores humanos (human agreement) para la tarea de evaluación por pares.

## Requisitos de hardware
- VRAM estimada en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 24 GB o más para contextos largos.
- VRAM estimada en cuantización 8-bit: aproximadamente 8-9 GB de pesos.
- VRAM estimada en cuantización 4-bit (GPTQ/AWQ/GGUF Q4): aproximadamente 5-6 GB de pesos.
- GPU recomendadas: A100 40/80 GB o H100 para serving concurrente con contexto largo; L40S o RTX 6000 Ada para despliegue single-node; RTX 4090 (24 GB) para inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bf16 con contexto moderado, y en GPUs de 8-12 GB con cuantización 4-bit.
- Opciones de despliegue: Transformers con `device_map="auto"` (ejemplo oficial), vLLM y TGI (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`), llama.cpp/Ollama mediante conversión a GGUF (no documentado oficialmente por el autor).
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia estructural, un modelo denso de 8B en bf16 sobre A100 suele generar decenas de tokens por segundo por petición, pero no hay mediciones publicadas para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeCert-Llama-3.1-8B | 8,03B | 128k (heredado, no confirmado) | Juez generativo por pares con certificado de decisión | Apache 2.0 | Hugging Face (gqbond) |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128k | Generación de texto general | Llama 3.1 Community License | Hugging Face (Meta) |
| nvidia/HelpSteer3 (dataset) | No aplica | No aplica | Dataset de preferencias usado en entrenamiento | No disponible en esta ficha | Hugging Face (NVIDIA) |

No se dispone de información sobre otros generative reward models comparables (por ejemplo, variantes de RewardBench) en la documentación proporcionada, por lo que la comparativa de rendimiento cuantitativo queda como no disponible.

## Limitaciones y advertencias
- El modelo solo evalúa comparaciones por pares A/B; no produce un score escalar calibrado, lo que impide usarlo directamente como función de recompensa numérica sin post-procesado.
- Entrenado y validado únicamente en inglés; su comportamiento en castellano u otros idiomas no está documentado y probablemente degrade la calidad de las observaciones.
- Riesgo de alucinación en las observaciones: aunque el prompt exige citas verificables, el modelo puede generar observaciones no soportadas por las respuestas evaluadas; se recomienda validación automática de las citas.
- Sesgos potenciales heredados de Llama 3.1-8B-Instruct y del dataset HelpSteer3, incluyendo sesgo de posición (favorecer A o B), sesgo de longitud y sesgo de estilo frente a corrección factual.
- El veredicto final nunca admite empate (`tie`), lo que fuerza una decisión binaria incluso en casos genuinamente ambiguos.
- Sensible a la política de evaluación inyectada en el system prompt: cambios en los criterios o sus pesos alteran los veredictos, por lo que la reproducibilidad exige fijar la política.
- Aunque la licencia es Apache 2.0, el modelo base Llama 3.1 tiene su propia licencia comunitaria; conviene revisar las obligaciones de atribución derivadas del modelo base.
- No es un modelo de propósito general: usarlo para generación de texto libre o tareas de código/matemáticas no es su caso de uso previsto y dará resultados inferiores a Llama 3.1-8B-Instruct.
- El repositorio ocupa 32,1 GB (pesos fusionados en bf16 más posibles artefactos), lo que exige almacenamiento y ancho de banda considerables en despliegues.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/gqbond/DeCert-Llama-3.1-8B
- Paper (arXiv 2610.27528): https://huggingface.co/papers/2610.27528
- Código del proyecto: https://github.com/UConn-DSIS/DeCert
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/HelpSteer3
