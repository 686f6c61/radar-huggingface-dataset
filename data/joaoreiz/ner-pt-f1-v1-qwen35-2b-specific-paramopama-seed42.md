# JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-paramopama-seed42

## Resumen

El modelo `ner-pt-f1-v1-qwen35-2b-specific-paramopama-seed42` es un adaptador LoRA (Low-Rank Adaptation) para reconocimiento de entidades nombradas (NER) generativo en portugués, desarrollado por JoaoReiz. Se basa en el modelo `Qwen/Qwen3.5-2B` en su revisión específica `15852e8c16360a2fea060d615a32b45270f8a8fc` y está diseñado para producir salidas estructuradas en JSON mediante generación restringida. Forma parte de una matriz de investigación denominada `ner-pt-generative-2026-f1-v1`, de la cual esta ejecución corresponde al régimen `specific`, con el dataset `paramopama` y semilla 42.

El adaptador está pensado para investigación y evaluación de NER en portugués, no para uso en producción de alto riesgo. Su relevancia radica en la combinación de un modelo base moderno (Qwen3.5-2B) con técnicas de generación estructurada, logrando una F1 end-to-end de 0.8942 en el split de prueba del corpus paramopama, con una validez estructural del 99,92 % de las salidas. El repositorio incluye artefactos de reproducibilidad, predicciones congeladas y métricas descontaminadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.5-2B (transformer decoder-only, detalles del base no disponibles) |
| Parametros totales | No disponible (el adaptador ocupa 0.1 GB; el modelo base tiene 2B, pero no se especifican los parametros del adaptador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Entrenamiento en BF16; no se especifican cuantizaciones de inferencia |
| Idiomas soportados | Portugues (pt) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA sobre el modelo base Qwen3.5-2B, un transformer decoder-only con atención estándar (los detalles completos de la arquitectura del base no se proporcionan en la documentación). El entrenamiento se realizó en precisión BF16 con LoRA, sobre el dataset paramopama, con semilla 42. La selección del checkpoint se basó en la F1 end-to-end del conjunto de validación, sin usar el split de prueba para dicha selección. La inferencia canónica se define con vLLM, temperatura 0 y generación restringida a JSON con el esquema `labels_and_tokens`. Las salidas inválidas se puntúan como predicción vacía en el scoring end-to-end. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; el entrenamiento es supervisado para la tarea de NER generativa.

## Capacidades

- Reconocimiento de entidades nombradas generativo en portugués, produciendo etiquetas y tokens en formato JSON estructurado.
- Generación restringida mediante esquema JSON (`labels_and_tokens`), lo que garantiza alta validez estructural de las salidas (99,92 % en el split de prueba).
- Adaptación eficiente mediante LoRA, lo que permite cargar el adaptador sobre el modelo base con PEFT.
- Compatible con inferencia en vLLM a temperatura 0, adecuada para tareas deterministas de extracción.
- Soporte para evaluación end-to-end con métricas de precisión, recall y F1 sobre corpus anotados.
- Capacidad multilingüe limitada al portugués; no se reportan otros idiomas.

## Casos de uso

- Extracción de entidades en textos jurídicos portugueses: el modelo puede identificar nombres de personas, organizaciones, lugares y fechas en documentos legales, generando salidas JSON que facilitan la integración en sistemas de gestión documental.
- Procesamiento de noticias en portugués: permite extraer entidades de artículos periodísticos para alimentar bases de datos de vigilancia mediática o análisis de tendencias.
- Enriquecimiento de corpus para entrenamiento de otros modelos: las predicciones estructuradas pueden usarse como pseudoetiquetas para crear datasets anotados en dominios específicos.
- Sistemas de búsqueda semántica: al extraer entidades de consultas y documentos, se puede mejorar la recuperación de información en portugués mediante índices basados en entidades.
- Análisis de redes sociales en portugués: identificación de marcas, personas y lugares en publicaciones para estudios de opinión o monitorización de marca.
- Automatización de formularios y registros: extracción de campos concretos (nombres, direcciones, fechas) a partir de texto libre en portugués, reduciendo la intervención manual.

## Benchmarks y rendimiento

Los resultados reportados en la model card corresponden a una única ejecución con semilla 42, sobre el split de prueba congelado del dataset paramopama. No se proporcionan comparaciones con otros modelos.

| Dataset | Precision | Recall | F1 | Validez estructural |
|---|---:|---:|---:|---:|
| paramopama | 0.8921 | 0.8963 | 0.8942 | 0.9992 |

Estos valores describen únicamente los splits congelados y esta semilla. La incertidumbre entre semillas requiere completar la matriz de tres semillas del estudio. No se han publicado resultados en otros benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo está especializado en NER.

## Requisitos de hardware

- No se proporcionan requisitos específicos de hardware en la documentación del modelo.
- Dado que el adaptador LoRA se monta sobre un modelo base de 2B parámetros, la inferencia puede ejecutarse en GPUs consumer con al menos 6-8 GB de VRAM en cuantización FP16, aunque no hay datos oficiales.
- La inferencia canónica requiere vLLM, que funciona en GPUs NVIDIA con soporte CUDA y al menos 8 GB de VRAM para modelos de 2B en BF16.
- No se especifican latencias ni throughput; dependerán del hardware y de la configuración de vLLM.
- Alternativas de despliegue: vLLM (recomendado por la documentación), también podría usarse con Hugging Face Transformers y PEFT para cargar el adaptador, aunque no se menciona explícitamente.
- No hay información sobre compatibilidad con llama.cpp u Ollama.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se pueden establecer comparaciones con otros sistemas de NER en portugués sin datos adicionales. Se recomienda consultar benchmarks públicos de NER multilingüe o portugués para contextualizar el rendimiento.

## Limitaciones y advertencias

- La model card advierte que los spans generados pueden ser estructuralmente válidos pero semánticamente incorrectos; la validez estructural no garantiza precisión semántica.
- El modelo no ha sido validado para decisiones de alto riesgo o autónomas; su uso debe limitarse a investigación, evaluación y experimentación controlada.
- Los resultados reportados corresponden a una única semilla y a un corpus específico (paramopama); no deben interpretarse como evidencia de rendimiento general en otros dominios o textos portugueses.
- Los esquemas de anotación de corpus pueden diferir, lo que afecta la transferibilidad a otros datasets.
- Puede existir solapamiento de texto entre splits que afecte las estimaciones de rendimiento, aunque se menciona que se proporcionan métricas descontaminadas en el repositorio.
- La licencia del modelo no está disponible; los usuarios deben revisar las licencias del dataset y del modelo base antes de cualquier uso comercial.
- El adaptador solo soporta portugués; no es adecuado para otros idiomas.
- No se han evaluado sesgos específicos; se recomienda auditar el modelo en el dominio de aplicación.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-paramopama-seed42
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de vLLM: https://docs.vllm.ai
