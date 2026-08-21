# rafmacalaba/lfm2.5-350M-multitask-datause

## Resumen

El modelo `rafmacalaba/lfm2.5-350M-multitask-datause` es un adaptador LoRA entrenado mediante supervisión fina (SFT) sobre el modelo base `LiquidAI/LFM2.5-350M`, desarrollado por el usuario de Hugging Face `rafmacalaba`. Su propósito es extraer atributos de procedencia de menciones de datos (productor, año, geografía y acrónimo) y clasificar el uso e impacto de dichos datos (tipo de dato, acción de uso, etiqueta de impacto y resumen de uso). Está diseñado para tareas de anotación y enriquecimiento de metadatos en corpus textuales, especialmente en contextos donde se requiere estructurar información sobre el origen y la utilización de conjuntos de datos.

El modelo base LFM2.5-350M, desarrollado por Liquid AI, es un modelo de lenguaje compacto de 350 millones de parámetros con arquitectura híbrida, preentrenado con 28 billones de tokens y optimizado mediante aprendizaje por refuerzo a gran escala. Soporta una ventana de contexto de 32 000 tokens y está pensado para despliegue en dispositivos con recursos limitados. El adaptador LoRA añade una capa de especialización sin modificar el modelo base, lo que permite su uso en tareas concretas de extracción y clasificación de metadatos.

La relevancia de este modelo radica en su capacidad para automatizar la generación de metadatos estructurados a partir de texto no estructurado, un paso clave en la gestión de datos científicos, repositorios abiertos y sistemas de gobernanza de datos. Al estar basado en un modelo pequeño, puede ejecutarse en entornos con restricciones de cómputo, como CPUs o GPUs de gama baja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (híbrida) + adaptador LoRA |
| Parametros totales | 350M (modelo base) + LoRA (tamaño no especificado) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32k (heredado del modelo base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (r=16, alpha=32, dropout=0.05) entrenado sobre el modelo base `LiquidAI/LFM2.5-350M`. El entrenamiento se realizó con el dataset `rafmacalaba/data-use-sft`, durante 3 épocas, con una tasa de aprendizaje de 0.0002 y enmascaramiento de solo completación (la pérdida se calcula únicamente sobre el turno JSON del asistente). El modelo base LFM2.5 emplea una arquitectura híbrida que combina mecanismos de atención y capas recurrentes, optimizada para inferencia rápida y bajo consumo de memoria. El preentrenamiento del base incluyó 28 billones de tokens y un proceso de aprendizaje por refuerzo a gran escala, lo que mejora sus capacidades de chat, seguimiento de instrucciones y llamada a herramientas. El adaptador LoRA se superpone a esta base para especializarla en tareas de extracción de metadatos y clasificación de uso/impacto, sin alterar los pesos originales.

## Capacidades

- Extracción de atributos de procedencia de menciones de datos: productor, año, geografía y acrónimo.
- Clasificación de uso e impacto de datos: tipo de dato, acción de uso, etiqueta de impacto y resumen de uso.
- Generación de texto en formato JSON estructurado, adecuado para integración en pipelines de anotación.
- Capacidad de procesar contexto largo (hasta 32k tokens) gracias al modelo base.
- Al estar basado en LFM2.5-350M, hereda potencialmente capacidades generales de generación de texto, chat y tool-calling, aunque no se han verificado en la información disponible.
- Especialización en tareas de gobernanza y gestión de datos, con métricas de rendimiento publicadas para holdout real y sintético.

## Casos de uso

- Anotación automática de metadatos en repositorios de datos científicos: el modelo puede extraer de un texto el productor, año, geografía y acrónimo de un dataset, generando etiquetas estructuradas para catálogos.
- Clasificación de uso de datos en artículos de investigación: identifica si un dato se usa para entrenamiento, validación, análisis, etc., y asigna una etiqueta de impacto (p. ej., alto, medio, bajo).
- Generación de resúmenes de uso de datos: produce un resumen textual de cómo se ha utilizado un conjunto de datos, útil para informes de reproducibilidad.
- Enriquecimiento de bases de datos bibliográficas: extrae información de procedencia de menciones de datos en publicaciones, facilitando la búsqueda y el filtrado.
- Monitorización de cumplimiento de licencias: al identificar el productor y el año, ayuda a verificar si el uso de un dataset cumple con las condiciones de su licencia.
- Integración en pipelines de procesamiento de lenguaje natural para gobernanza de datos: el modelo puede ser invocado como un componente de extracción de entidades y clasificación en flujos de trabajo automatizados.

## Benchmarks y rendimiento

Se presentan las métricas publicadas en la model card para dos conjuntos de validación: holdout real (n=9540) y holdout sintético (n=2305). Se reportan precisión, recall, F0.5 y F1 para cada atributo de procedencia, así como macro-F1 para las cabezas de uso/impacto y la tasa verbatim (proporción de valores emitidos que son subcadenas del contexto).

**Holdout real**

| Atributo | Precisión | Recall | F0.5 | F1 |
|---|---|---|---|---|
| productor | 0.7218 | 0.6622 | 0.7091 | 0.6907 |
| año | 0.8244 | 0.7807 | 0.8153 | 0.8019 |
| geografía | 0.7419 | 0.7681 | 0.7470 | 0.7548 |
| acrónimo | 0.8158 | 0.8450 | 0.8215 | 0.8301 |
| **Global** | 0.7726 | 0.7611 | 0.7703 | 0.7668 |

Métricas de uso/impacto (macro-F1): data_type=0.6985, usage_action=0.6339, impact_label=0.5977, usage_summary (mean_sim=0.5934, grounded_rate=0.7552). Tasa verbatim: 8964/9003 = 0.9957.

**Holdout sintético**

| Atributo | Precisión | Recall | F0.5 | F1 |
|---|---|---|---|---|
| productor | 0.9164 | 0.8780 | 0.9084 | 0.8968 |
| año | 0.8962 | 0.8492 | 0.8864 | 0.8721 |
| geografía | 0.8513 | 0.8942 | 0.8596 | 0.8722 |
| acrónimo | 0.7765 | 0.7680 | 0.7748 | 0.7722 |
| **Global** | 0.8664 | 0.8590 | 0.8649 | 0.8627 |

Métricas de uso/impacto (macro-F1): data_type=0.7857, usage_action=0.6625, impact_label=0.5738, usage_summary (mean_sim=0.5708, grounded_rate=0.6823). Tasa verbatim: 1156/1160 = 0.9966.

No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- Al ser un modelo de 350M de parámetros, se estima que requiere menos de 1 GB de VRAM en FP16 (aproximadamente 700 MB para los pesos, más overhead de activaciones). Esta es una estimación razonable, no un dato oficial.
- Puede ejecutarse en GPUs de gama baja (p. ej., NVIDIA GTX 1050 Ti, RTX 2060) e incluso en CPUs modernas, gracias al diseño optimizado del modelo base.
- El adaptador LoRA añade una cantidad mínima de parámetros, por lo que el impacto en memoria es despreciable.
- Opciones de despliegue: al estar en formato safetensors, es compatible con frameworks como Hugging Face Transformers, vLLM, llama.cpp (si se convierte a GGUF) y Ollama (mediante conversión). No se ha verificado la compatibilidad específica en la información disponible.
- La latencia y el throughput dependen del hardware y del framework; no se proporcionan datos oficiales.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en una tarea concreta (extracción de metadatos y clasificación de uso/impacto). Su uso fuera de este dominio puede producir resultados poco fiables.
- Las métricas de holdout real muestran una precisión global de 0.77 y un recall de 0.76, lo que indica que existe un margen de error no despreciable en la extracción de atributos.
- La generación de resúmenes de uso (usage_summary) presenta una similitud media baja (0.59 en holdout real), lo que sugiere que los resúmenes pueden no ser siempre fieles al contenido original.
- La tasa verbatim es muy alta (0.99), lo que indica que el modelo tiende a copiar subcadenas del contexto; esto puede ser adecuado para extracción, pero limita la capacidad de generalización a formulaciones nuevas.
- No se dispone de información sobre sesgos o alucinaciones específicas, pero al ser un modelo pequeño, puede presentar errores en contextos complejos o ambiguos.
- La licencia Apache-2.0 permite uso comercial y modificación, pero se recomienda verificar la licencia del modelo base (LiquidAI/LFM2.5-350M) para asegurar el cumplimiento en aplicaciones de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rafmacalaba/lfm2.5-350M-multitask-datause
- Blog de Liquid AI sobre LFM2.5-350M: https://www.liquid.ai/blog/lfm2-5-350m-no-size-left-behind
- Página de LM Studio para LFM2.5-350M: https://lmstudio.ai/models/liquid/lfm2.5-350m
- Documentación de Liquid AI para LFM2.5-350M: https://docs.liquid.ai/lfm/models/lfm25-350m
- Dataset de entrenamiento (referencia): `rafmacalaba/data-use-sft` (sin URL directa en la información proporcionada)
