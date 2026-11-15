# qhoenix/zils-mini-decision-t6p

## Resumen

zils-mini-decision-t6p es un modelo de decisión de 4.539.265.536 parámetros (aproximadamente 4,5B) desarrollado por el usuario qhoenix bajo el paraguas del proyecto Zils (familia d3-mini). Se construye sobre Qwen/Qwen3.5-4B como modelo base y se distribuye con licencia Apache-2.0. Su propósito declarado no es la generación de texto libre, sino la extracción de características y la emisión de decisiones estructuradas en el formato de examen de Zils, con etiquetas de tipo ordinal (puntuaciones) y categóricas.

El modelo se ha obtenido mediante una receta de "soup-pool": una media uniforme de pesos de dos cuerpos Apache-2.0 (vllm-sr/d3-mini y torchcast-ai/torchcast-decision-4b), seguida de seis ajustes finos LoRA independientes sobre aproximadamente 144.000 ítems de decisión y una pasada final corta de LoRA sobre la media de los seis. La arquitectura subyacente es la de Qwen3.5-4B, un transformer denso, empaquetado en BF16 y con código personalizado (`custom_code`), lo que implica que requiere confiar en la implementación del autor para cargarlo.

Es relevante ahora porque ejemplifica una tendencia creciente: modelos pequeños especializados en tareas de decisión y clasificación estructurada, derivados de LLM base mediante mezcla de pesos y LoRA, orientados a evaluación automática y pipelines de decisión. No obstante, la información pública es muy escasa (0 descargas, 0 likes, sin benchmarks publicados ni idiomas declarados), por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen/Qwen3.5-4B), con código personalizado (`custom_code`) |
| Parametros totales | 4.539.265.536 (aprox. 4,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (la model card menciona fuentes en inglés y datos de decisión, pero no declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (BF16), con código personalizado para `transformers` |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.5-4B, un transformer denso de aproximadamente 4,5B parámetros, reempaquetado en el "chasis" d3-mini del proyecto Zils en BF16. El modelo incluye código personalizado (`custom_code`), por lo que la carga requiere `trust_remote_code=True` y depende de la implementación del autor. No se documentan innovaciones de atención (atención lineal, decodificación especulativa) ni detalles sobre la ventana de contexto.

El entrenamiento se describe con precisión inusual en la model card. El punto de partida es una media uniforme de pesos de dos cuerpos Apache-2.0: vllm-sr/d3-mini y torchcast-ai/torchcast-decision-4b. Sobre esa base se realizan seis ajustes finos LoRA (r=64, lr=5e-5, una época, semillas distintas) de los pesos de lenguaje sobre aproximadamente 144.000 ítems de decisión en formato de examen Zils, compuestos por splits TRAIN públicos con etiquetas gold, ítems redactados por Claude, GPT-5.4, DeepSeek y otros a partir de splits TRAIN públicos de datasets de uso comercial (conservando ítems de dominio nuevo solo cuando un modelo de otro proveedor respondía a ciegas de la misma forma) y unas 55.000 decisiones tipadas de 306 fuentes inglesas de tasksource/tasksource-jev-typed-decisions (solo filas con `license_use: commercial`, máximo 200 por fuente). Los objetivos ordinales son distance-aware en lugar de suavizado uniforme. Los seis fine-tunes fusionados se promedian uniformemente. Finalmente, se aplica una pasada corta de LoRA (r=64, lr=5e-5, unas 10.000 filas) sobre esa media, con 534 ítems de las semillas públicas de examen zils-ai/base-exam-seed-v1..v3 (cada una repetida 8 veces) mezclados con 6.000 filas del mismo conjunto amplio; los 180 ítems restantes de las semillas se reservaron para evaluación. No se usaron splits de validación ni de test de los datasets fuente para entrenar.

## Capacidades

- Emisión de decisiones estructuradas en el formato de examen Zils, con objetivos ordinales (puntuaciones) tratados de forma distance-aware.
- Extracción de características (`feature-extraction`), que es el pipeline declarado en Hugging Face.
- Clasificación y decisión tipada sobre ítems de tareas diversas, derivada de tasksource/tasksource-jev-typed-decisions.
- Capacidad de decisión en dominios nuevos, condicionada a que un modelo de otro proveedor responda a ciegas de la misma forma (según el criterio de filtrado del autor).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declara lista de idiomas.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Evaluación automática de exámenes de decisión: el modelo puede puntuar ítems en el formato Zils y emitir etiquetas ordinales distance-aware, lo que lo hace adecuado para pipelines de corrección y scoring donde se necesita una nota graduada en lugar de una clase discreta.
- Clasificación de decisiones tipadas en dominios de negocio: a partir de su entrenamiento en tasksource-jev-typed-decisions, puede asignar tipos de decisión a registros estructurados, útil para triaje y enrutamiento en back-office.
- Extracción de características para downstream: al declararse como `feature-extraction`, puede usarse para generar representaciones de texto que alimenten clasificadores o sistemas de recuperación propios.
- Anotación asistida de datasets de decisión: puede preetiquetar ítems nuevos en formato Zils para revisión humana, reduciendo el coste de construcción de conjuntos de evaluación.
- Investigación en mezcla de pesos y LoRA: el modelo documenta una receta reproducible (soup-pool + seis LoRA + pasada final), lo que lo convierte en un caso de estudio para experimentos de merging y fine-tuning de bajo rango.
- Prototipado de sistemas de decisión ligeros: con 4,5B parámetros en BF16, puede desplegarse en una GPU única para pruebas de concepto de decisión estructurada sin depender de API externas.
- Evaluación de robustez de modelos de decisión: los 180 ítems reservados de las semillas públicas permiten reproducir la evaluación del autor y comparar contra otras variantes de la familia d3-mini.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que se reservaron 180 ítems de las semillas públicas de examen para evaluación, pero no reporta las métricas obtenidas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos (4,539B parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, se recomienda un mínimo de 12-16 GB de VRAM para contexto moderado.
- Cuantización a 8 bits: alrededor de 4,5-5 GB de pesos; a 4 bits, alrededor de 2,3-2,8 GB, aunque no se documentan artefactos GGUF, AWQ ni GPTQ oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 sin cuantizar; RTX 3090 (24 GB) también es viable.
- ¿Cabe en GPU de consumo? Sí, en BF16 cabe en RTX 4090, RTX 3090 y, con cuantización, en GPUs de 8-12 GB, siempre que se resuelva la carga con `custom_code`.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, y la presencia de código personalizado puede complicar su integración en servidores de inferencia estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-mini-decision-t6p | 4,5B | No disponible | Apache-2.0 | Modelo de decisión especializado, `custom_code`, sin benchmarks publicados |
| Qwen/Qwen3.5-4B (base) | ~4B | No disponible | No disponible en la informacion proporcionada | Modelo base generalista del que deriva; capacidades de decisión no especializadas |
| vllm-sr/d3-mini | No disponible | No disponible | Apache-2.0 | Cuerpo de la casa usado en la media inicial del soup-pool |
| torchcast-ai/torchcast-decision-4b | ~4B (por nombre) | No disponible | Apache-2.0 | Cuerpo de decisión usado en la media inicial del soup-pool |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay métricas de MMLU, HumanEval, GSM8K ni de la propia evaluación de decisión, lo que impide validar su calidad frente a alternativas.
- Modelo con 0 descargas y 0 likes en Hugging Face: no hay evidencia de uso comunitario ni de validación externa.
- Requiere `trust_remote_code=True` por el uso de `custom_code`; esto implica ejecutar código del autor y aumenta la superficie de riesgo en producción.
- Idiomas no declarados: aunque el entrenamiento usa fuentes en inglés, no se garantiza un comportamiento multilingüe ni se documenta el rendimiento fuera del inglés.
- Riesgo de alucinación y de calibración en las puntuaciones ordinales: al ser un modelo derivado de un LLM, puede producir decisiones inconsistentes en ítems fuera de la distribución de entrenamiento.
- Sesgos potenciales heredados del modelo base Qwen3.5-4B y de los datos de decisión (tasksource, ítems generados por Claude, GPT-5.4 y DeepSeek), sin auditoría documentada.
- Licencia Apache-2.0 permite uso comercial, pero el filtrado de datos se basa en la etiqueta `license_use: commercial` de las fuentes; conviene verificar la procedencia de los ítems sintéticos generados por modelos de terceros.
- Sin información sobre longitud de contexto, lo que limita la planificación de despliegues con entradas largas.
- La receta de entrenamiento usa splits TRAIN públicos y evita validación/test de los datasets fuente, pero no se aportan detalles sobre posibles solapamientos con las semillas de examen reservadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qhoenix/zils-mini-decision-t6p
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Cuerpo de la casa vllm-sr/d3-mini: https://huggingface.co/vllm-sr/d3-mini
- Cuerpo de decisión torchcast-ai/torchcast-decision-4b: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- Dataset tasksource/tasksource-jev-typed-decisions: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Semillas de examen zils-ai/base-exam-seed-v1: https://huggingface.co/datasets/zils-ai/base-exam-seed-v1
- Semillas de examen zils-ai/base-exam-seed-v2: https://huggingface.co/datasets/zils-ai/base-exam-seed-v2
- Semillas de examen zils-ai/base-exam-seed-v3: https://huggingface.co/datasets/zils-ai/base-exam-seed-v3
