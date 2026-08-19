# JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-harem-official-seed123

## Resumen

El modelo `JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-harem-official-seed123` es un adaptador LoRA para reconocimiento de entidades nombradas (NER) generativo en portugués, desarrollado por JoaoReiz. Se basa en el modelo de lenguaje `Qwen/Qwen3.5-2B` y está diseñado para producir etiquetas y entidades en formato JSON estructurado mediante generación restringida. Forma parte de una matriz de investigación (`ner-pt-generative-2026-f1-v1`) orientada a evaluar el rendimiento de NER generativa frente a enfoques clásicos de clasificación de tokens.

El adaptador fue entrenado con el dataset `harem_official`, un corpus de referencia para NER en portugués europeo, y se seleccionó el checkpoint según la F1 end-to-end en validación, sin usar el split de test para la selección. El resultado reportado en test es una F1 de 0,8113 con una validez estructural del 99,76%, lo que indica que la salida generada es casi siempre JSON válido, aunque no necesariamente correcto semánticamente. El repositorio incluye artefactos de reproducibilidad como predicciones congeladas, manifiestos y hashes.

Relevancia: este modelo representa una aproximación moderna a la NER mediante generación de lenguaje, en lugar de la arquitectura tradicional de clasificación de tokens. Su tamaño reducido (2B de parámetros en el modelo base) lo hace viable para entornos con recursos limitados, y su enfoque en un idioma específico (portugués) cubre un hueco en los modelos multilingües genéricos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.5-2B (transformer decoder) |
| Parametros totales | No disponible (el adaptador LoRA es una fracción del modelo base de 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.5-2B) |
| Tipos de cuantizacion | BF16 (entrenamiento del adaptador); cuantización del base no especificada |
| Idiomas soportados | Portugués (pt) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado al modelo base `Qwen/Qwen3.5-2B`, un transformer decoder de 2.000 millones de parámetros. El adaptador se entrenó en precisión BF16, lo que reduce el coste de memoria y cómputo. El entrenamiento se realizó bajo el régimen `specific`, es decir, ajuste fino específico del dominio con el dataset `harem_official`, sin mezclar otros corpus. No se especifican detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset o el uso de técnicas como RLHF o DPO; la model card solo menciona la configuración de inferencia canónica: vLLM, temperatura 0 y generación restringida a JSON con el esquema `labels_and_tokens`.

La innovación principal reside en el uso de generación estructurada: el modelo no etiqueta token a token, sino que genera directamente una secuencia JSON que contiene las entidades y sus etiquetas. Esto se combina con una política de invalid-output que asigna predicción vacía cuando la salida no es JSON válido, penalizando así los errores de formato.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en portugués, incluyendo personas, organizaciones, lugares y otras categorías definidas en el corpus HAREM.
- Generación estructurada en JSON con restricciones de esquema (`labels_and_tokens`), lo que garantiza una alta validez estructural de las salidas.
- Inferencia determinista con temperatura 0, adecuada para tareas donde la reproducibilidad es crítica.
- Soporte para carga mediante PEFT sobre el modelo base exacto (revisión `15852e8c16360a2fea060d615a32b45270f8a8fc`).
- No se reportan capacidades adicionales como tool calling, agentes, visión o audio; el modelo está especializado exclusivamente en NER textual.

## Casos de uso

- Investigación académica en NER generativa: permite comparar el rendimiento de un enfoque generativo frente a modelos de clasificación de tokens sobre el corpus HAREM, sirviendo como referencia reproducible para estudios de lingüística computacional.
- Extracción de entidades en textos jurídicos o administrativos portugueses: el modelo puede identificar entidades en documentos legales, aunque debe validarse en el dominio específico antes de uso en producción.
- Enriquecimiento de bases de conocimiento: dado un corpus en portugués, el modelo extrae entidades que pueden alimentar grafos de conocimiento o sistemas de búsqueda semántica.
- Preprocesamiento para pipelines de análisis de texto: las entidades extraídas en JSON pueden integrarse fácilmente en flujos de procesamiento posteriores, gracias al formato estructurado.
- Evaluación de robustez de generación estructurada: el alto índice de validez estructural (99,76%) lo convierte en un candidato para estudiar cómo los modelos generativos manejan restricciones de formato.
- Prototipado de sistemas de NER en portugués con recursos limitados: al ser un adaptador LoRA sobre un modelo de 2B, puede ejecutarse en GPUs de consumo, permitiendo pruebas rápidas sin infraestructura de alto coste.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en el split de test del dataset `harem_official` (un solo seed, seed 123):

| Dataset | Precision | Recall | F1 | Structural validity |
|---|---:|---:|---:|---:|
| harem_official | 0.8150 | 0.8076 | 0.8113 | 0.9976 |

Estos valores corresponden a la métrica end-to-end, donde la predicción se compara con la anotación de referencia a nivel de entidad completa. La validez estructural mide el porcentaje de salidas que son JSON válido según el esquema restringido. No se proporcionan comparaciones con otros modelos en la misma tabla, ni resultados para otros seeds del mismo régimen. La model card advierte explícitamente que estos resultados no deben interpretarse como evidencia de rendimiento general fuera de estos corpus y que se requiere completar la matriz de tres seeds para estimar la incertidumbre.

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen3.5-2B en BF16 requiere aproximadamente 4 GB de VRAM para los pesos, más memoria para activaciones y el adaptador LoRA (que añade una cantidad mínima). Con cuantización de 8 bits o 4 bits del base, se puede reducir a 2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM es suficiente para inferencia (por ejemplo, RTX 2060, RTX 3060, RTX 4060). Para entrenamiento del adaptador, se recomienda una GPU con 8-12 GB (RTX 3080, RTX 4070, A10).
- Cabe en GPUs de consumo: sí, tanto en tarjetas NVIDIA como en Apple Silicon con suficiente memoria unificada.
- Opciones de despliegue: vLLM (según la configuración canónica), Hugging Face Transformers con PEFT, y potencialmente llama.cpp si se convierte el modelo base a GGUF (aunque el adaptador LoRA requiere soporte específico).
- Latencia y throughput: no se proporcionan datos medidos. Para un modelo de 2B en una GPU moderna, se espera una latencia de decodificación de decenas de milisegundos por token y un throughput de cientos de tokens por segundo con vLLM, pero son estimaciones generales no verificadas.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos NER generativos para portugués en la información proporcionada. Como referencia conceptual, se puede comparar con enfoques tradicionales como XLM-R (tamaño base o large) ajustado para NER, que suelen obtener F1 superiores al 85% en HAREM, pero requieren arquitecturas de clasificación de tokens y no generan salida estructurada. Otros modelos generativos multilingües como mT5 o BLOOM podrían adaptarse para NER generativa, pero no hay datos de rendimiento disponibles en este contexto. Por tanto, la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Los spans generados pueden ser estructuralmente válidos pero semánticamente incorrectos; la validez JSON no garantiza la corrección de las entidades.
- El modelo solo ha sido evaluado en el corpus `harem_official` y con un único seed; la variabilidad entre seeds no se ha medido y los resultados pueden no generalizar a otros dominios o variedades del portugués.
- No se ha validado para decisiones de alto riesgo o autónomas; su uso en producción requiere una evaluación exhaustiva en el dominio objetivo.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o redistribución. Se debe contactar al autor o revisar el repositorio para aclararlo.
- El adaptador debe cargarse sobre la revisión exacta del modelo base indicada; cargarlo sobre otra revisión puede producir resultados inconsistentes.
- El dataset HAREM tiene su propia licencia y esquema de anotación; los usuarios deben revisar los términos de uso del corpus antes de emplearlo.
- No hay soporte para otros idiomas; el modelo es exclusivamente para portugués.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-harem-official-seed123
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- No se proporcionan enlaces adicionales (papers, blogs o demos) en la información disponible.
