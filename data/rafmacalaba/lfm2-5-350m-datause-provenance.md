# rafmacalaba/lfm2.5-350M-datause-provenance

## Resumen

El modelo `rafmacalaba/lfm2.5-350M-datause-provenance` es un adaptador LoRA de ajuste fino supervisado (SFT) aplicado sobre el modelo base `LiquidAI/LFM2.5-350M`, desarrollado por el usuario `rafmacalaba`. Su propósito es la extracción de atributos de procedencia de datos a partir de menciones en texto, concretamente productor, año, geografía y acrónimo, devolviendo la información en formato JSON. Este tipo de tarea es relevante para la gestión de metadatos en investigación, documentación científica y bases de datos, donde es necesario identificar quién produce los datos, cuándo, dónde y bajo qué siglas se referencian.

El modelo se presenta como una solución ligera (350M de parámetros en el base) y especializada, entrenada con un dataset propio (`rafmacalaba/data-use-provenance-sft`) y optimizada para producir respuestas verbatim (subcadenas del contexto). La evaluación en un conjunto de validación de 3487 muestras muestra una precisión global del 82,76% y un recall del 83,53%, con una tasa de verbatim del 99,84%. Aunque el modelo base no está documentado en la información proporcionada, se trata de un modelo de generación de texto de tamaño pequeño, adecuado para despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: LiquidAI/LFM2.5-350M) |
| Parametros totales | 350M (base) + adaptador LoRA (r=16, alpha=32) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo contiene safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un adaptador LoRA aplicado sobre el modelo base `LiquidAI/LFM2.5-350M`. El entrenamiento se realizó mediante ajuste fino supervisado (SFT) con un dataset específico para extracción de atributos de procedencia. Los hiperparámetros reportados son: 3 épocas, tasa de aprendizaje de 0.0002, r=16, alpha=32, dropout=0.05, y enmascaramiento de la pérdida únicamente sobre la parte de completación (la respuesta JSON del asistente). No se detalla la arquitectura interna del modelo base (si es transformer, MoE, etc.), ni la composición del dataset de entrenamiento más allá de su nombre.

## Capacidades

- Extracción de atributos de procedencia de datos: productor, año, geografía y acrónimo a partir de menciones en texto.
- Generación de respuestas en formato JSON con los atributos detectados.
- Capacidad de devolver valores verbatim (subcadenas exactas del contexto) en el 99,84% de los casos.
- Especialización en dominios de datos de investigación, censos, encuestas y bases de datos.
- No se documentan capacidades adicionales como tool calling, agentes, razonamiento multi-paso o multimodalidad.

## Casos de uso

- Catalogación automática de metadatos en artículos científicos: el modelo puede extraer de frases como "data from Hallegatte (2012)" el año y el productor, facilitando la indexación en repositorios.
- Integración en pipelines de datos para limpieza y normalización: dado un corpus de menciones, el modelo genera etiquetas estructuradas que pueden alimentar bases de datos relacionales.
- Enriquecimiento de bases de datos de indicadores económicos o sociales: por ejemplo, identificar la geografía y el año de encuestas como "NFHS-3 data" o "2002 Census".
- Asistencia en la verificación de fuentes: al extraer productor y año, ayuda a validar la procedencia de datos citados en informes.
- Automatización de la documentación de conjuntos de datos: al procesar descripciones de datasets, el modelo puede generar campos de procedencia de forma consistente.
- Análisis de texto en organismos públicos o consultoras: extracción de atributos de datos mencionados en documentos legales o regulatorios.

## Benchmarks y rendimiento

La model card proporciona métricas de evaluación sobre un conjunto de validación (holdout, n=3487) con coincidencia exacta de cada atributo:

| Atributo | Precisión | Recall | F0.5 | F1 |
|---|---|---|---|---|
| producer | 0.7943 | 0.7888 | 0.7932 | 0.7916 |
| year | 0.8398 | 0.8037 | 0.8323 | 0.8213 |
| geography | 0.8221 | 0.8461 | 0.8268 | 0.8339 |
| acronym | 0.8570 | 0.8976 | 0.8649 | 0.8769 |
| **Global** | 0.8276 | 0.8353 | 0.8291 | 0.8314 |

Además, se reporta una tasa de verbatim (valores emitidos que son subcadenas del contexto) de 6290/6300 = 0.9984. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Al ser un modelo de 350M de parámetros (base) con un adaptador LoRA, la inferencia es ligera. Con cuantización a 4 bits (no documentada pero posible con herramientas como llama.cpp o vLLM), la VRAM estimada podría estar en torno a 300-500 MB, aunque no se confirma en la información.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050) sería suficiente para inferencia en lotes pequeños.
- Opciones de despliegue: al ser un modelo de generación de texto, puede servirse con vLLM, Ollama, llama.cpp o Transformers de HuggingFace. No se indica una configuración específica.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base `LiquidAI/LFM2.5-350M` podría compararse con otros modelos pequeños de generación de texto, pero no se han publicado benchmarks comparativos en esta ficha.

## Limitaciones y advertencias

- El modelo está especializado en un dominio concreto (extracción de atributos de procedencia) y puede no generalizar bien a otras tareas de extracción de información.
- La evaluación se realizó con coincidencia exacta de cadenas; valores ligeramente diferentes (p. ej., "India" vs. "Republic of India") se consideran errores, lo que puede subestimar el rendimiento real.
- Riesgo de alucinación: aunque la tasa de verbatim es alta, existe la posibilidad de que el modelo genere atributos no presentes en el contexto, especialmente en casos ambiguos.
- No se documentan sesgos específicos, pero el dataset de entrenamiento puede contener sesgos geográficos o temporales derivados de las fuentes utilizadas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base `LiquidAI/LFM2.5-350M` puede tener su propia licencia; se recomienda verificar la del base.
- No se proporcionan detalles sobre la longitud de contexto, por lo que su uso con textos largos podría estar limitado.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/rafmacalaba/lfm2.5-350M-datause-provenance
- Modelo base (referenciado en la model card): https://huggingface.co/LiquidAI/LFM2.5-350M
- Dataset de entrenamiento (mencionado): https://huggingface.co/datasets/rafmacalaba/data-use-provenance-sft (no verificado)
