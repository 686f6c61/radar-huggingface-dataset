# Jongbin-kr/llama-3.1-8b-instruct_lbox-casename-criminal_ffn-only

## Resumen

Este modelo es un ajuste fino (fine-tuning) de `meta-llama/Llama-3.1-8B-Instruct` realizado por el autor Jongbin-kr, especializado en el ámbito de nombres de casos penales (casename criminal) en el contexto legal coreano. El nombre del repositorio indica que se ha aplicado una técnica de ajuste denominada "FFN-only", que consiste en congelar todas las capas del transformer excepto las redes de avance (feed-forward networks), reduciendo así el número de parámetros entrenables y el coste computacional del entrenamiento.

El modelo se ha entrenado mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL de HuggingFace, y el repositorio contiene únicamente los pesos en formato safetensors con un tamaño total de 0,9 GB. Aunque el modelo base es Llama 3.1 8B Instruct, que soporta un contexto de 128K tokens y múltiples idiomas, la ficha del modelo no proporciona información sobre el dataset de entrenamiento, los idiomas específicos del ajuste ni la licencia aplicada al modelo resultante.

La relevancia de este modelo radica en su especialización vertical: un ajuste fino orientado a un dominio legal concreto (nombres de casos criminales), lo que podría mejorar la precisión del modelo base en tareas de clasificación, generación o normalización de terminología legal coreana. Sin embargo, al no publicarse métricas de evaluación ni detalles del dataset, su utilidad práctica queda pendiente de validación por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B Instruct) |
| Parametros totales | 8.030 millones (8B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (herencia del modelo base) |
| Tipos de cuantizacion | no disponible (repositorio solo contiene safetensors en FP16/BF16) |
| Idiomas soportados | no disponible (el modelo base soporta 8 idiomas; el ajuste no especifica) |
| Licencia | no disponible (el modelo base usa Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3.1 8B Instruct, un transformer decoder-only con 32 capas, atención con RoPE (Rotary Positional Embeddings), GQA (Grouped Query Attention) y una ventana de contexto de 128K tokens. El ajuste fino se ha realizado con la técnica "FFN-only", lo que implica que únicamente se actualizaron los pesos de las capas feed-forward durante el entrenamiento, manteniendo congelados los de atención y las capas de normalización. Esta estrategia reduce significativamente el número de parámetros entrenables y el coste de entrenamiento, aunque puede limitar la capacidad de adaptación del modelo en comparación con un ajuste completo.

El entrenamiento se llevó a cabo mediante Supervised Fine-Tuning (SFT) con la librería TRL 0.29.1, sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas adicionales como RLHF o DPO. El repositorio incluye un enlace a un registro de Weights & Biases, pero los detalles del entrenamiento no son accesibles desde la información proporcionada.

## Capacidades

- Generación de texto en formato instructivo: hereda las capacidades conversacionales y de instrucción del modelo base Llama 3.1 8B Instruct.
- Especialización en terminología legal coreana: el ajuste con nombres de casos criminales sugiere una mejora en la comprensión y generación de nombres de casos legales, aunque no se han publicado evaluaciones que lo confirmen.
- Razonamiento y comprensión de contexto largo: mantiene la ventana de 128K tokens del modelo base, lo que permite procesar documentos legales extensos.
- Soporte multilingüe: el modelo base soporta 8 idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés), pero no se especifica si el ajuste conserva esta capacidad.
- Tool calling y function calling: heredadas del modelo base, aunque no se ha verificado su funcionamiento tras el ajuste.
- Sin capacidades especiales adicionales: no se menciona soporte de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Normalización de nombres de casos penales: el modelo puede utilizarse para estandarizar y corregir la nomenclatura de casos criminales en documentos judiciales coreanos, reduciendo errores de transcripción y variaciones terminológicas.
- Clasificación de documentos legales: dado su ajuste en el dominio criminal, podría emplearse para categorizar expedientes judiciales según el tipo de delito o la fase procesal, aunque no hay métricas publicadas que lo confirmen.
- Asistencia a profesionales legales: integrado en herramientas de redacción, puede ayudar a abogados y procuradores a generar borradores de escritos con la terminología adecuada para nombres de casos.
- Búsqueda semántica en bases de datos jurídicas: al comprender mejor la estructura de los nombres de casos, puede mejorar la recuperación de jurisprudencia y precedentes en sistemas de búsqueda vectorial.
- Extracción de entidades legales: combinado con técnicas de NER, puede identificar y extraer nombres de casos, números de expediente y referencias legales en textos no estructurados.
- Traducción asistida de documentos legales: aunque el ajuste es específico para coreano, el modelo base multilingüe podría apoyar la traducción de terminología legal entre coreano y otros idiomas, con la precaución de que el ajuste puede haber degradado el rendimiento en otros idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de evaluación como MMLU, HumanEval, GSM8K ni comparativas con el modelo base o con otros ajustes legales. Tampoco se proporcionan resultados de precisión en tareas específicas del dominio legal coreano.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 8B parámetros, por lo que en FP16 requiere aproximadamente 16 GB de VRAM. Con cuantización a 8 bits (INT8) se reduce a unos 8-9 GB, y a 4 bits (INT4) a unos 4-5 GB.
- GPU recomendadas: para FP16 se necesita una GPU con al menos 16 GB (A100 40GB, RTX 4090 24GB, L4 24GB). Para cuantización INT4, una RTX 3060 12GB o RTX 4060 Ti 16GB podría ser suficiente.
- Compatibilidad con GPU de consumo: sí, con cuantización INT4 o INT8 es viable en GPUs de gama media-alta de consumo (RTX 3090, RTX 4070, etc.).
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama, HuggingFace TGI y Transformers con `device="cuda"`. El formato safetensors permite su uso directo con Transformers y su conversión a GGUF para llama.cpp.
- Latencia y throughput: no disponible. Al ser un modelo de 8B, se espera una latencia de decodificación de aproximadamente 20-40 ms/token en una A100, pero no hay datos publicados para este ajuste concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jongbin-kr/llama-3.1-8b-instruct_lbox-casename-criminal_ffn-only | 8B | 128K | Nombres de casos penales coreanos | no disponible | HuggingFace |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K | Generalista | Llama 3.1 Community License | HuggingFace, Meta |
| Jongbin-kr/llama-3.1-8b-instruct-sni-ffn-lora | 8B | 128K | Ajuste FFN con LoRA (dominio no especificado) | no disponible | HuggingFace |

La comparativa se limita al modelo base y a otro ajuste del mismo autor. No se dispone de información sobre otros modelos legales coreanos comparables en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha evaluado el modelo para detectar sesgos. Al ser un ajuste sobre un dominio legal específico, podría presentar sesgos derivados del dataset de entrenamiento, que no se ha hecho público.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar nombres de casos o referencias legales inexistentes. En un dominio legal, esto es especialmente crítico y requiere verificación humana.
- Limitaciones de contexto e idioma: aunque el modelo base soporta 128K tokens, el ajuste puede haber degradado el rendimiento en idiomas distintos del coreano. No se especifica si el ajuste conserva el soporte multilingüe completo.
- Restricciones de licencia: la licencia del modelo no está especificada en la ficha. El modelo base usa la Llama 3.1 Community License, que permite uso comercial con ciertas restricciones, pero el modelo ajustado podría tener condiciones adicionales no documentadas.
- Caveat para producción: al no publicarse métricas de evaluación ni detalles del dataset, no se recomienda su uso en producción sin una validación exhaustiva en el dominio objetivo. El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jongbin-kr/llama-3.1-8b-instruct_lbox-casename-criminal_ffn-only
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Registro de entrenamiento (Weights & Biases): https://wandb.ai/jongbin-kr-skiml_moe/sft_dense_lbox_ffn_only/runs/bswl18ep
- Repositorio TRL: https://github.com/huggingface/trl
- Otro ajuste del mismo autor: https://huggingface.co/Jongbin-kr/llama-3.1-8b-instruct-sni-ffn-lora
