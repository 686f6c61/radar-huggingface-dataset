# deepcoder2024/Qwen3-8B-LoRA-Cochrane-Screening

## Resumen

El modelo `deepcoder2024/Qwen3-8B-LoRA-Cochrane-Screening` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `Qwen/Qwen3-8B`, un transformer decoder-only de 8.000 millones de parámetros desarrollado por Alibaba. El adaptador está especializado en la tarea de cribado de títulos y resúmenes (title/abstract screening) en el contexto de revisiones sistemáticas, siguiendo la metodología de la Colaboración Cochrane. El objetivo es clasificar estudios como `include`, `exclude` o `uncertain` a partir de los criterios de selección, el título y el resumen, devolviendo además una breve justificación en formato JSON.

Este modelo resuelve un problema concreto y relevante en el ámbito de la investigación biomédica: la fase de cribado de literatura, que tradicionalmente requiere la lectura manual de miles de referencias. Al automatizar esta tarea con un modelo de lenguaje ajustado, se reduce el tiempo y el esfuerzo de los revisores, aunque el autor advierte explícitamente que no debe sustituir el juicio de un experto. El adaptador se distribuye con un tamaño de repositorio de 0,2 GB y solo contiene los pesos del adaptador, por lo que es necesario descargar el modelo base por separado.

La relevancia actual del modelo radica en la creciente adopción de LLMs en flujos de trabajo de revisión sistemática y en la disponibilidad de herramientas de código abierto para fine-tuning eficiente. El adaptador se entrenó con una sola época sobre el dataset `cochrane-screening-sft`, alcanzando una pérdida de entrenamiento de 0,3330 y una pérdida de evaluación de 0,2835, lo que sugiere un ajuste razonable sin indicios claros de sobreajuste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptador LoRA |
| Parametros totales | 8.000 millones (modelo base) + adaptador LoRA (tamaño no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (máximo usado en entrenamiento) |
| Tipos de cuantizacion | No disponible (el adaptador se carga en bf16; el modelo base admite cuantización estándar) |
| Idiomas soportados | Inglés (en) |
| Licencia | other (sin especificar detalles adicionales) |
| Formato de pesos | safetensors (adapter_model.safetensors) y archivos de configuración JSON |

## Arquitectura y entrenamiento

El modelo base es Qwen3-8B, un transformer autoregresivo con atención causal estándar, que incorpora el mecanismo de pensamiento híbrido (thinking mode) propio de la serie Qwen3. El adaptador LoRA se aplica sobre las proyecciones `q`, `k`, `v`, `o`, `gate`, `up` y `down` del modelo, con un rango `r=16`, `alpha=32` y `dropout=0.05`. El entrenamiento se realizó con una sola época sobre el dataset `deepcoder2024/cochrane-screening-sft`, que contiene ejemplos de cribado de títulos y resúmenes con etiquetas de inclusión, exclusión o incertidumbre. Se utilizó una longitud máxima de secuencia de 2048 tokens, un learning rate de 2e-4 y un tamaño de batch efectivo de 32 (1 por dispositivo × 2 GPUs × 16 pasos de acumulación de gradiente). La pérdida final de entrenamiento fue 0,3330 y la de evaluación 0,2835. No se menciona el uso de RLHF, DPO u otras técnicas de alineación adicionales; el ajuste es puramente supervisado.

## Capacidades

- Clasificación de estudios en tres categorías: `include`, `exclude` y `uncertain`, según los criterios de selección proporcionados.
- Generación de una justificación breve en texto libre para cada decisión, estructurada en formato JSON (`{"label": "...", "reason": "..."}`).
- Uso de la plantilla de chat de Qwen3, lo que permite integrar instrucciones de sistema y mensajes de usuario multi-turno.
- Soporte para el modo no-pensamiento (`enable_thinking=False`), que produce respuestas directas sin razonamiento intermedio, adecuado para tareas de clasificación rápida.
- Capacidad multilingüe limitada al inglés, dado que el dataset de entrenamiento está en ese idioma.
- No se documentan capacidades de tool calling, agentes, visión ni audio; el modelo está orientado exclusivamente a tareas de texto.

## Casos de uso

- Cribado inicial de literatura en revisiones sistemáticas: el modelo puede procesar listas de referencias (título y resumen) y clasificarlas como incluidas, excluidas o inciertas, reduciendo el trabajo manual de los revisores.
- Asistencia a equipos de investigación de la Colaboración Cochrane: permite prefiltrar estudios antes de la revisión por pares, acelerando el proceso de selección.
- Automatización de pipelines de revisión sistemática: el adaptador puede integrarse en scripts de Python que lean resultados de búsquedas bibliográficas (por ejemplo, desde PubMed o Scopus) y generen un archivo JSON con las decisiones de cribado.
- Validación de criterios de inclusión en estudios clínicos: dado que el modelo recibe los criterios de selección como entrada, puede evaluar rápidamente si un estudio cumple dichos criterios a partir de su resumen.
- Entrenamiento de revisores noveles: el modelo puede usarse como herramienta educativa para mostrar ejemplos de decisiones de cribado y sus justificaciones, ayudando a entender la aplicación práctica de los criterios.
- Soporte a meta-análisis y síntesis de evidencia: al clasificar grandes volúmenes de abstracts, facilita la construcción de bases de datos de estudios potencialmente relevantes para análisis posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta las pérdidas de entrenamiento y evaluación (0,3330 y 0,2835 respectivamente), pero no incluye métricas de precisión, recall o F1 sobre conjuntos de validación externos. Tampoco se comparan los resultados con otros modelos de cribado. Por tanto, no es posible evaluar el rendimiento relativo del adaptador frente a alternativas.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa aproximadamente 0,2 GB, pero es necesario cargar el modelo base Qwen3-8B, que en precisión bf16 requiere alrededor de 16 GB de VRAM.
- Con cuantización del modelo base (por ejemplo, int8 o int4), la VRAM necesaria puede reducirse a unos 8 GB o 4 GB respectivamente, aunque el adaptador debería ser compatible con estas cuantizaciones si se carga mediante PEFT.
- GPUs recomendadas: una RTX 4090 (24 GB) puede ejecutar el modelo base en bf16 sin problemas; GPUs como A100 (40/80 GB) o H100 (80 GB) ofrecen mayor margen para lotes grandes o secuencias largas.
- Para entornos con menos recursos, una RTX 3060 de 12 GB o una RTX 4070 de 12 GB podrían funcionar con cuantización int8, aunque la velocidad de inferencia será menor.
- El despliegue se realiza típicamente con la librería `transformers` junto con `peft` (cargando el adaptador sobre el modelo base). También es posible usar `vLLM` si se convierte el adaptador a un formato compatible, aunque no se documenta explícitamente.
- La latencia estimada para una secuencia de 2048 tokens en una GPU moderna (por ejemplo, RTX 4090) sería del orden de unos pocos segundos, dependiendo del número de tokens generados (máximo 256 en el ejemplo de uso).
- No se proporcionan datos de throughput específicos.

## Comparativa con modelos similares

No se dispone de información pública sobre otros adaptadores LoRA específicamente entrenados para cribado de títulos y resúmenes en revisiones sistemáticas. Como referencia, se puede comparar con el modelo base Qwen3-8B sin adaptador, que tiene una capacidad general de razonamiento y comprensión de texto, pero no está especializado en esta tarea. Tampoco se han encontrado adaptadores equivalentes para otros modelos base (por ejemplo, Llama-3-8B o Mistral-7B) en la información disponible. Por tanto, la comparativa directa no está disponible.

## Limitaciones y advertencias

- El repositorio contiene únicamente los pesos del adaptador; es imprescindible descargar el modelo base `Qwen/Qwen3-8B` por separado para poder utilizarlo.
- El entrenamiento se realizó con una sola época y sobre un dataset específico (`cochrane-screening-sft`), por lo que el adaptador puede no generalizar bien a otros dominios o a criterios de selección muy diferentes.
- La salida es un JSON con una etiqueta y una razón; el modelo puede generar razones plausibles pero incorrectas, por lo que no debe usarse como sustituto del juicio de un revisor experto ni para decisiones clínicas.
- El modelo está entrenado únicamente en inglés; no se recomienda su uso con textos en otros idiomas.
- La licencia se indica como `other` sin especificar los términos exactos; antes de un uso comercial o en producción, es necesario contactar con el autor o revisar los archivos del repositorio para conocer las restricciones.
- No se han publicado evaluaciones externas ni benchmarks que validen su rendimiento en tareas reales de cribado; los resultados de pérdida no garantizan una alta precisión de clasificación.
- La longitud de contexto máxima utilizada en entrenamiento es de 2048 tokens, lo que puede ser insuficiente para abstracts muy largos o para procesar múltiples estudios en una sola pasada.

## Enlaces

- [HuggingFace - deepcoder2024/Qwen3-8B-LoRA-Cochrane-Screening](https://huggingface.co/deepcoder2024/Qwen3-8B-LoRA-Cochrane-Screening)
- [Dataset de entrenamiento - deepcoder2024/cochrane-screening-sft](https://huggingface.co/datasets/deepcoder2024/cochrane-screening-sft)
- [Código fuente - ljwa2323/cochrane-screening-slm](https://github.com/ljwa2323/cochrane-screening-slm)
- [Modelo base - Qwen/Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)
- [Repositorio oficial de Qwen3 - GitHub](https://github.com/QwenLM/Qwen3)
