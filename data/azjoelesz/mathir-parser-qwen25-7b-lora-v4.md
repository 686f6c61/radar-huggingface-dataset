# AzJoeLesz/mathir-parser-qwen25-7b-lora-v4

## Resumen

`AzJoeLesz/mathir-parser-qwen25-7b-lora-v4` es un adaptador LoRA publicado en HuggingFace por el usuario AzJoeLesz, derivado del modelo base Qwen2.5-7B, según se deduce de su propio identificador. El nombre del repositorio y la breve model card indican que el adaptador está especializado en una tarea de análisis sintáctico o parseo para recuperación de información matemática (MathIR), entrenado sobre un conjunto de datos sintéticos denominado `mathir-synth-hu` en su revisión v4.

Se trata de la cuarta iteración de una serie de adaptadores: la v4 continúa el entrenamiento de `AzJoeLesz/mathir-parser-qwen25-7b-lora-v2` durante 100 pasos adicionales con una tasa de aprendizaje de 5e-5, y la v3 se declara explícitamente deprecada. La model card es extremadamente escueta: no documenta la arquitectura del adaptador, el rango de LoRA, los módulos objetivo, el volumen del dataset ni los resultados de evaluación de la v4.

La relevancia de esta ficha es, por tanto, limitada y de carácter experimental. El repositorio registra 0 descargas y 0 likes, no declara licencia, no especifica idiomas soportados y no incluye ningún resultado de benchmarks. Cualquier uso en producción debería ir precedido de una evaluación propia, y la evaluación del autor debe reproducirse con el mismo system prompt que el script `training/mathir_sft/hf_job_eval_lora_v4.py`, según se indica en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-7B (transformer decoder-only). Deducido del identificador del repositorio, no documentado en la model card |
| Parametros totales | Adaptador LoRA: no disponible. Modelo base Qwen2.5-7B: ~7.610 millones (dato del modelo base, no confirmado en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el adaptador. El modelo base Qwen2.5-7B soporta 32.768 tokens nativos y hasta 131.072 con extrapolación YaRN (dato del modelo base, no confirmado) |
| Tipos de cuantizacion | No disponible. El repositorio solo declara safetensors; no se publican versiones GPTQ, AWQ ni GGUF |
| Idiomas soportados | No disponible. El sufijo `-hu` del dataset de entrenamiento (`mathir-synth-hu`) sugiere húngaro, pero no está confirmado |
| Licencia | No disponible (no declarada en el repositorio). El modelo base Qwen2.5-7B se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (etiqueta del repositorio) |
| Autor | AzJoeLesz |
| Fecha de creacion | 2026-09-22 |
| Ultima actualizacion | 2026-09-22 |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | No disponible |

Nota: la fila de arquitectura se ha derivado del nombre del repositorio (`qwen25-7b-lora`). Ni la model card ni los metadatos de HuggingFace confirman explícitamente el modelo base ni la configuración del adaptador.

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del adaptador. Por convención de nomenclatura, se trata de un adaptador LoRA (Low-Rank Adaptation) aplicado sobre el modelo denso Qwen2.5-7B, un transformer decoder-only con atención de consultas agrupadas (GQA), codificación posicional rotatoria (RoPE), activación SwiGLU y normalización RMSNorm, tal como corresponde a la familia Qwen2.5. El repositorio no publica el rango (`r`), el valor `alpha`, la tasa de dropout ni la lista de módulos objetivo, datos imprescindibles para reproducir el entrenamiento o para fusionar el adaptador de forma fiable.

En cuanto al entrenamiento, la única información disponible es: continuación del adaptador v2 durante 100 pasos con tasa de aprendizaje 5e-5 sobre el dataset `mathir-synth-hu` en su revisión v4. Se desconoce el tamaño del dataset, su composición, el número de tokens vistos, la estrategia de enmascarado de pérdida, el régimen de precisión y el hardware empleado. No se menciona ningún uso de RLHF, DPO u otra técnica de alineación posterior al SFT. La versión v3 se marca como deprecada sin más explicación, lo que sugiere inestabilidad en el proceso iterativo.

## Capacidades

No existe documentación publicada de las capacidades del modelo. La única capacidad explícitamente atribuible por el nombre y el contexto del repositorio es el parseo de consultas o expresiones en el dominio de recuperación de información matemática (MathIR). El resto de capacidades que se enumeran a continuación son heredadas del modelo base Qwen2.5-7B y no han sido verificadas para este adaptador:

- Parseo de expresiones matemáticas hacia una representación intermedia estructurada, objetivo declarado por el nombre del modelo.
- Generación de texto general y razonamiento en varios pasos, heredados del modelo base.
- Generación de código y matemáticas a nivel de modelo base; el ajuste fino puede haber degradado estas capacidades por olvido catastrófico.
- Soporte de tool calling y function calling: el modelo base Qwen2.5-7B lo soporta, pero el adaptador no documenta si conserva esta capacidad.
- Capacidades multilingües: el modelo base cubre alrededor de 29 idiomas; el ajuste fino específico puede haber reducido el rendimiento en idiomas distintos al del dataset de entrenamiento.
- Capacidad de modo "thinking" o razonamiento extendido: no disponible.
- Capacidades de visión o audio: no disponibles (el modelo base es exclusivamente de texto).

## Casos de uso

Los casos siguientes se plantean como aplicaciones plausibles del adaptador en el dominio para el que fue entrenado. Ninguno está validado por el autor, por lo que deben tratarse como hipótesis de partida sujetas a evaluación propia:

- Parseo de consultas en buscadores de fórmulas: el adaptador transformaría una consulta en lenguaje natural o LaTeX en una representación intermedia consultable contra un índice de fórmulas. Es el caso de uso alineado con el nombre del modelo y con el dataset sintético empleado.
- Normalización de notación matemática en pipelines de ingesta: convertir variantes de LaTeX, MathML o notación ASCII a un formato canónico antes de indexar artículos científicos o documentación técnica.
- Preprocesado en pipelines RAG sobre corpus científicos: usar el adaptador como etapa de query understanding para reescribir preguntas de usuario en consultas estructuradas que el recuperador pueda ejecutar con mayor precisión.
- Anotación semiautomática de datasets matemáticos: generar etiquetas estructuradas sobre texto matemático con revisión humana posterior, aprovechando que el adaptador se entrenó sobre datos sintéticos de este tipo.
- Punto de partida para investigación en adaptadores LoRA: dado que la v4 es una continuación explícita de la v2 con 100 pasos adicionales, sirve como material para estudiar el efecto de entrenamiento incremental y sobreajuste en adaptadores de bajo rango.
- Comparación de versiones en una línea de experimentación: evaluar v2 frente a v4 con el mismo prompt de sistema permite medir si los 100 pasos extra aportan mejora o degradación, un experimento de bajo coste y alto valor diagnóstico.
- Extracción de entidades matemáticas para bases de conocimiento: identificar variables, operadores y relaciones en fragmentos de texto para poblar grafos de conocimiento científico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para la versión v4 en la información disponible. La model card únicamente menciona un script de evaluación (`training/mathir_sft/hf_job_eval_lora_v4.py`) y advierte de que debe usarse el mismo prompt de sistema, lo que implica que las cifras no son comparables entre ejecuciones con prompts distintos.

El único dato numérico presente en la documentación corresponde a la versión deprecada v3, que habría obtenido 1 acierto sobre 23 casos ("1/23 gold") y fue descartada por ese motivo. No hay ninguna cifra equivalente publicada para la v4, ni resultados de MMLU, HumanEval, GSM8K u otros benchmarks generales.

| Benchmark | v4 | v3 (deprecada) | Referencia base Qwen2.5-7B |
|---|---|---|---|
| Evaluación interna MathIR | no disponible | 1/23 (gold) | no disponible |
| MMLU | no disponible | no disponible | no disponible |
| HumanEval | no disponible | no disponible | no disponible |
| GSM8K | no disponible | no disponible | no disponible |

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones para el modelo base Qwen2.5-7B, ya que el adaptador no publica configuración de despliegue. El adaptador por sí solo ocupa del orden de decenas a centenares de megabytes, pero requiere cargar el modelo base completo para funcionar:

| Precisión | VRAM estimada (pesos) | VRAM recomendada con caché KV | GPU de ejemplo |
|---|---|---|---|
| FP16 / BF16 | ~15,2 GB | 20-24 GB | RTX 4090, A10G, L40S, A100 40 GB |
| Int8 | ~8 GB | 12-16 GB | RTX 4080, RTX 3090, L4 |
| Q4_K_M (GGUF) | ~4,7 GB | 6-8 GB | RTX 3060 12 GB, RTX 4060 Ti 16 GB, Apple Silicon 16 GB |
| Q5_K_M (GGUF) | ~5,4 GB | 8-10 GB | RTX 3060 12 GB, RTX 4070 |

- Cabe en GPU de consumo: sí, en cuantizaciones de 4 y 5 bits sobre GPUs con 8-12 GB de VRAM. En FP16 requiere una GPU de 24 GB o superior.
- Opciones de despliegue: carga directa del adaptador con PEFT y Transformers (requiere descargar el modelo base por separado), fusión de pesos y despliegue con vLLM o TGI tras el merge. Para llama.cpp u Ollama sería necesario convertir a GGUF y empaquetar el adaptador, algo que el repositorio no ofrece.
- Latencia y throughput: no disponibles. No se han publicado mediciones del autor ni de terceros.
- Nota operativa: al no publicarse el rango ni los módulos objetivo del LoRA, cualquier fusión de pesos debe validarse empíricamente antes de usarse en producción.

## Comparativa con modelos similares

La comparación es estrictamente estructural, porque este adaptador no publica métricas de rendimiento y sus competidores directos en la tarea MathIR tampoco disponen de evaluaciones públicas en este contexto.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento MathIR |
|---|---|---|---|---|---|
| mathir-parser-qwen25-7b-lora-v4 | LoRA sobre base de 7B | no disponible | no declarada | 0 descargas | no disponible |
| mathir-parser-qwen25-7b-lora-v2 | LoRA sobre base de 7B | no disponible | no declarada | publicada por el mismo autor | referencia de partida de la v4 |
| Qwen2.5-7B (base) | ~7.610 M | 32.768 tokens (131.072 con YaRN) | Apache 2.0 | ampliamente disponible | sin ajuste específico para MathIR |
| Qwen2.5-7B-Instruct | ~7.610 M | 32.768 tokens | Apache 2.0 | ampliamente disponible | sin ajuste específico para MathIR |

No se conocen adaptadores públicos comparables específicos para parseo MathIR sobre Qwen2.5-7B en la información disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna métrica publicada para la v4. La única cifra conocida (1/23 en la v3 deprecada) apunta a un rendimiento muy bajo en la tarea objetivo.
- Licencia no declarada: el repositorio no especifica licencia, por lo que el uso comercial del adaptador queda en una zona jurídicamente indeterminada, con independencia de que el modelo base sea Apache 2.0.
- Idiomas no documentados: se desconoce si el adaptador conserva el multilingüismo del modelo base. El sufijo `-hu` del dataset sugiere una especialización en húngaro que podría degradar el rendimiento en castellano.
- Riesgo de olvido catastrófico: al ser un ajuste fino continuado sobre un dataset sintético especializado, es plausible la pérdida de capacidades generales del modelo base, aunque no está cuantificada.
- Riesgo de sobreajuste al dataset sintético: el entrenamiento sobre datos generados puede producir un comportamiento rígido ante entradas reales con ruido, notación inconsistente o errores tipográficos.
- Riesgo de alucinación en notación matemática: los modelos de este tipo pueden generar expresiones sintácticamente válidas pero semánticamente incorrectas, especialmente al normalizar fórmulas ambiguas.
- Falta de reproducibilidad: no se publican el rango, el alpha, los módulos objetivo ni la composición del dataset, lo que impide replicar el entrenamiento o auditar la procedencia de los datos.
- Trazabilidad del linaje cuestionable: la v3 se marcó como deprecada tras obtener 1 acierto de 23, lo que indica un proceso iterativo poco estable y sin validación sólida.
- Adopción nula: 0 descargas y 0 likes implican que no existe validación por parte de la comunidad ni informes independientes de comportamiento.
- Tamano del repositorio de 0,0 GB: conviene verificar que los archivos de pesos del adaptador están efectivamente subidos y son completos antes de intentar cualquier despliegue.
- Fechas de publicación atípicas: los metadatos indican creación y actualización en septiembre de 2026, lo que puede reflejar un error de registro o un repositorio de prueba.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/AzJoeLesz/mathir-parser-qwen25-7b-lora-v4
- Adaptador predecesor citado en la model card: https://huggingface.co/AzJoeLesz/mathir-parser-qwen25-7b-lora-v2
- Modelo base implícito (no confirmado en la model card): https://huggingface.co/Qwen/Qwen2.5-7B
- Script de evaluación citado por el autor: `training/mathir_sft/hf_job_eval_lora_v4.py` (ruta mencionada en la model card, sin enlace público verificado)

Nota sobre la búsqueda web: las consultas realizadas no devolvieron ningún resultado relacionado con este modelo. Los enlaces recuperados correspondían a plantillas de currículum vítae en serbio, sin relación alguna con el modelo ni con la tarea MathIR, por lo que se omiten. No se han encontrado papers, blogs, repositorios auxiliares ni demostraciones asociadas al modelo.
