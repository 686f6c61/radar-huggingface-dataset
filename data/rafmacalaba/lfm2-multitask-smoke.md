# rafmacalaba/lfm2-multitask-smoke

## Resumen

`rafmacalaba/lfm2-multitask-smoke` es un adaptador LoRA de ajuste fino supervisado (SFT) sobre el modelo base `LiquidAI/LFM2.5-350M` de Liquid AI. El adaptador está especializado en dos tareas relacionadas con la gestión de datos: la extracción de atributos de procedencia (productor, año, geografía y acrónimo) y la clasificación de uso e impacto (tipo de dato, acción de uso, etiqueta de impacto y resumen de uso). Se trata de un modelo de nicho, no de propósito general, orientado a pipelines de anotación automática de metadatos.

El modelo base LFM2.5-350M pertenece a la familia LFM2 de Liquid AI, que emplea una arquitectura híbrida con atención lineal y está diseñada para despliegue en dispositivos con baja latencia. El adaptador se entrenó durante una sola época con un dataset propio (`rafmacalaba/data-use-sft`) y utiliza enmascaramiento de solo completación, es decir, la pérdida se calcula únicamente sobre la respuesta del asistente en formato JSON. La evaluación sobre un holdout de 64 ejemplos muestra un rendimiento moderado, con una F1 global de 0,37.

La relevancia de este modelo reside en su tamaño reducido y su licencia Apache 2.0, lo que permite integrarlo en sistemas de gestión de datos donde se necesite etiquetar procedencia y uso de forma automática. No obstante, su rendimiento actual es limitado y requiere validación adicional antes de su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre LFM2.5-350M (modelo híbrido con atención lineal de Liquid AI) |
| Parametros totales | No disponible (el adaptador LoRA tiene r=16, alpha=32; el modelo base tiene 350M, pero el adaptador añade una fracción pequeña) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (formato safetensors, sin cuantización específica documentada) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre el modelo base `LiquidAI/LFM2.5-350M`. LFM2.5 es parte de la serie LFM2 de Liquid AI, que utiliza una arquitectura híbrida que combina capas de atención lineal con componentes de mezcla de expertos (aunque el modelo de 350M probablemente no sea MoE, sino un transformer con atención lineal). Esta arquitectura está optimizada para inferencia en CPU y dispositivos con recursos limitados, logrando un rendimiento de decodificación y prefill un 200% más rápido que modelos comparables de Qwen3 y Gemma 3 según el blog de Liquid AI.

El entrenamiento del adaptador se realizó con los siguientes hiperparámetros: una época, tasa de aprendizaje de 0.0002, rango LoRA de 16, alpha de 32 y dropout de 0.05. Se aplicó enmascaramiento de solo completación, lo que significa que la pérdida se calcula únicamente sobre la parte de la respuesta generada por el asistente (la salida JSON), no sobre el prompt. El dataset de entrenamiento (`rafmacalaba/data-use-sft`) contiene ejemplos de texto con anotaciones de procedencia y uso, aunque no se especifica el número de ejemplos ni la composición exacta.

No se menciona el uso de técnicas como RLHF o DPO; el ajuste es puramente supervisado. El adaptador está diseñado para emitir una salida JSON estructurada con los campos `producer`, `year`, `geography`, `acronym`, `data_type`, `usage_action`, `impact_label` y `usage_summary`.

## Capacidades

- Extracción de atributos de procedencia: identifica productor, año, geografía y acrónimo en textos que describen conjuntos de datos.
- Clasificación de uso e impacto: determina el tipo de dato, la acción de uso, la etiqueta de impacto y genera un resumen de uso.
- Generación de salida estructurada en formato JSON.
- Capacidades multilingües: no disponibles, el modelo base LFM2 soporta múltiples idiomas, pero no se especifica cuáles para este adaptador.
- No soporta tool calling ni funciones de agente de forma nativa; es un modelo de anotación especializado.
- No incluye capacidades de visión ni audio.

## Casos de uso

- Anotación automática de metadatos en catálogos de datos: el modelo puede procesar descripciones de datasets y extraer automáticamente el productor, año y geografía, facilitando la creación de metadatos estructurados para portales de datos abiertos.
- Cumplimiento normativo de procedencia: en entornos donde se requiere rastrear el origen de los datos (por ejemplo, GDPR o estándares de gobernanza), el adaptador puede identificar de forma automática quién produjo un dataset y en qué año, reduciendo el trabajo manual.
- Clasificación de uso de datos en repositorios internos: empresas con grandes volúmenes de datos internos pueden usar el modelo para etiquetar cada dataset con su tipo de uso (por ejemplo, analítica, entrenamiento de modelos, reporting) y su impacto potencial, mejorando la gobernanza.
- Enriquecimiento de datasets para investigación: investigadores que necesitan documentar la procedencia de los datos en sus publicaciones pueden emplear el modelo para generar resúmenes de uso y atributos de forma semiautomática.
- Integración en pipelines de ETL: el adaptador puede ejecutarse como un paso de preprocesamiento en un pipeline de datos, añadiendo etiquetas de procedencia y uso a los registros antes de su almacenamiento.
- Auditoría de datos: el modelo puede ayudar a auditar conjuntos de datos existentes, verificando si los metadatos declarados coinciden con el contenido real, gracias a su capacidad de extraer atributos directamente del texto.

## Benchmarks y rendimiento

La model card del autor incluye una evaluación sobre un holdout de 64 ejemplos, con comparación exacta de cadenas para cada atributo:

| Atributo | TP | FP | FN | Precisión | Recall | F0.5 | F1 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| producer | 1 | 2 | 20 | 0.3333 | 0.0476 | 0.1515 | 0.0833 |
| year | 11 | 20 | 15 | 0.3548 | 0.4231 | 0.3667 | 0.3860 |
| geography | 20 | 42 | 15 | 0.3226 | 0.5714 | 0.3534 | 0.4124 |
| acronym | 12 | 22 | 11 | 0.3529 | 0.5217 | 0.3774 | 0.4211 |
| **Overall** | 44 | 86 | 61 | 0.3385 | 0.4190 | 0.3520 | 0.3745 |

Las métricas de clasificación de uso e impacto (data_type, usage_action, impact_label) aparecen como `nan`, lo que indica que no se calcularon o que no hubo suficientes ejemplos positivos. La tasa de verbatim (valores emitidos que son subcadenas del contexto) es de 102/130 = 0.7846, lo que sugiere que el modelo tiende a copiar fragmentos del texto original en lugar de generalizar.

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre un modelo de 350M, el requisito de VRAM es muy reducido. El modelo base LFM2.5-350M puede ejecutarse en CPU con memoria RAM suficiente (aproximadamente 1-2 GB para los pesos en FP16). El adaptador añade una fracción mínima de parámetros.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) es suficiente para inferencia. También puede ejecutarse en CPU pura.
- En consumer GPU: sí, cabe en prácticamente cualquier GPU moderna, incluso integradas.
- Opciones de despliegue: al ser un modelo de HuggingFace con safetensors, puede cargarse con la librería `transformers` y PEFT para aplicar el adaptador. También es posible convertirlo a GGUF para usar con llama.cpp u Ollama, aunque no se documenta esa conversión.
- Latencia y throughput: no se han publicado mediciones específicas. Dado el tamaño del modelo base, se espera una latencia de decenas de milisegundos por inferencia en GPU, y de unos pocos cientos de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicamente para la tarea de extracción de procedencia y uso de datos. El modelo base LFM2.5-350M se puede comparar con otros modelos pequeños de Liquid AI (como LFM2-1.7B) o con modelos de propósito general como Qwen2.5-0.5B o Gemma-2-2B, pero no hay datos de rendimiento de este adaptador frente a ellos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Rendimiento bajo: la F1 global de 0.37 indica que el modelo comete muchos errores, especialmente en el atributo `producer` (recall de 0.0476). No es recomendable para uso en producción sin un ajuste adicional o un umbral de confianza.
- Tasa de verbatim alta (78%): el modelo tiende a extraer subcadenas literales del contexto, lo que puede producir valores incompletos o incorrectos si el texto no contiene el atributo de forma explícita.
- Métricas de uso/impacto no disponibles: los valores `nan` sugieren que la clasificación de estas categorías no fue evaluada correctamente o que no hubo suficientes ejemplos.
- Sesgos desconocidos: no se ha documentado ningún análisis de sesgo. El modelo puede heredar sesgos del dataset de entrenamiento, que no está descrito en detalle.
- Riesgo de alucinación: al ser un modelo generativo, puede producir valores inventados cuando el contexto no contiene la información requerida.
- Limitaciones de idioma: no se especifican los idiomas soportados. El modelo base LFM2 soporta múltiples idiomas, pero el adaptador puede estar sesgado hacia el idioma del dataset de entrenamiento (probablemente inglés, aunque no se confirma).
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base LFM2.5 tiene su propia licencia (probablemente también Apache 2.0, pero conviene verificar la licencia exacta del modelo base en su página de HuggingFace).
- Tamaño del repositorio: 0.0 GB, lo que sugiere que solo se almacenan los pesos del adaptador, no el modelo base. Para usarlo, es necesario descargar el modelo base por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rafmacalaba/lfm2-multitask-smoke
- Discusiones del modelo relacionado: https://huggingface.co/rafmacalaba/lfm2.5-Encoder-350M-datause_smoke/discussions
- Documentación de LFM2 en Transformers: https://huggingface.co/docs/transformers/model_doc/lfm2
- Blog de Liquid AI sobre LFM2: https://www.liquid.ai/blog/liquid-foundation-models-v2-our-second-series-of-generative-ai-models
- Technical report de LFM2 en arXiv: https://arxiv.org/html/2511.23404v1
- Cookbook de Liquid AI en GitHub: https://github.com/Liquid4All/cookbook
