# Jongbin-kr/llama-3.1-8b-instruct_lbox-criminal-non-property_ffn-only

## Resumen

Este modelo es un ajuste fino (fine-tune) de `meta-llama/Llama-3.1-8B-Instruct` realizado por el usuario Jongbin-kr. El nombre del repositorio sugiere que el entrenamiento se ha centrado en datos relacionados con casos criminales de tipo no patrimonial (lbox-criminal-non-property), aunque la model card no proporciona detalles sobre el dataset utilizado. El entrenamiento se ha realizado mediante Supervised Fine-Tuning (SFT) con la librería TRL de HuggingFace.

La etiqueta `ffn-only` en el nombre del repositorio indica que el ajuste se ha aplicado únicamente a las capas feed-forward (FFN) del transformer, una técnica que reduce el número de parámetros entrenables y el coste computacional. El modelo base, Llama 3.1 8B Instruct, es un transformer decoder-only de 8 mil millones de parámetros con una ventana de contexto de 128K tokens, desarrollado por Meta. Este ajuste específico parece orientado a tareas de clasificación o generación de texto en el ámbito legal, aunque la información pública es limitada.

El repositorio tiene un tamaño de 1,1 GB, lo que sugiere que los pesos están cuantizados o que solo se han guardado los adaptadores del ajuste, no los pesos completos del modelo base. No se han publicado métricas de rendimiento ni benchmarks en la model card, por lo que la evaluación de su calidad debe realizarse de forma empírica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Llama 3.1 8B Instruct) |
| Parametros totales | 8 mil millones (8B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 128K tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors, posiblemente en FP16 o BF16) |
| Idiomas soportados | no disponible (heredados del modelo base, principalmente ingles) |
| Licencia | no disponible (el modelo base usa Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3.1 8B Instruct, un transformer decoder-only con Grouped Query Attention (GQA) y posicional RoPE. El ajuste se ha realizado mediante SFT con la librería TRL, como se indica en la model card. La etiqueta `ffn-only` sugiere que solo se han actualizado los pesos de las capas feed-forward, dejando congeladas las capas de atención y los embeddings. Esta estrategia reduce el número de parámetros entrenables y el riesgo de overfitting, aunque limita la capacidad de adaptación del modelo.

No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El entrenamiento se registró en Weights & Biases, pero el enlace no proporciona métricas públicas. El framework utilizado incluye Transformers 5.9.0, PyTorch 2.11.0 y TRL 0.29.1, lo que indica un entorno de desarrollo reciente.

## Capacidades

- Generación de texto instructivo: al estar basado en Llama 3.1 8B Instruct, conserva las capacidades de diálogo y seguimiento de instrucciones del modelo original.
- Razonamiento y comprensión de contexto largo: hereda la ventana de 128K tokens del modelo base, lo que permite procesar documentos extensos.
- Generación de código: el modelo base tiene capacidades de programación, aunque el ajuste específico podría haberlas alterado.
- Capacidades multilingües: el modelo base soporta principalmente inglés, con soporte limitado para otros idiomas. No se ha verificado si el ajuste modifica este comportamiento.
- Tool calling: el modelo base soporta function calling, pero no se ha confirmado si el ajuste preserva esta capacidad.
- Especialización legal: el nombre del repositorio sugiere que el modelo ha sido entrenado con datos de casos criminales no patrimoniales, lo que podría mejorar su rendimiento en tareas de análisis legal, aunque no hay evidencia pública que lo confirme.

## Casos de uso

- Análisis de documentos legales: el modelo podría utilizarse para resumir sentencias, extraer hechos relevantes o clasificar tipos de delitos no patrimoniales, aprovechando su posible especialización en este dominio.
- Asistencia jurídica automatizada: integrado en un chatbot, podría responder preguntas sobre procedimientos legales o redactar borradores de escritos, siempre con supervisión humana.
- Clasificación de textos judiciales: dado el nombre del modelo, podría emplearse para categorizar automáticamente documentos judiciales por tipo de delito o gravedad.
- Búsqueda semántica en jurisprudencia: combinado con un sistema de embeddings, podría indexar y recuperar sentencias relacionadas con casos de robo, estafa u otros delitos no patrimoniales.
- Generación de informes periciales: podría redactar resúmenes estructurados de expedientes judiciales para abogados o aseguradoras.
- Fine-tuning adicional: al ser un modelo abierto, puede servir como punto de partida para ajustes más específicos en dominios legales o administrativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación estándar. Tampoco se han encontrado comparativas con otros modelos en la búsqueda web. Se recomienda evaluar el modelo empíricamente en el dominio objetivo antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 8B parámetros en FP16 requiere aproximadamente 16 GB de VRAM. Con cuantización a 8 bits, se reduce a unos 8 GB, y a 4 bits, a unos 4-5 GB.
- GPU recomendadas: para FP16, una NVIDIA RTX 4090 (24 GB) o A100 (40 GB) es suficiente. Para cuantización 4-bit, una RTX 3060 (12 GB) o superior puede funcionar.
- Compatibilidad con GPU de consumo: sí, con cuantización es posible ejecutarlo en GPUs de gama media como RTX 3060 o RTX 4070.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, HuggingFace TGI, o directamente con Transformers y pipeline de texto.
- Latencia y throughput: no disponible. Depende del hardware y de la cuantización utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Llama 3.1 8B Instruct (base) | 8B | 128K | Llama 3.1 Community License | Modelo original de Meta, sin ajuste específico |
| Jongbin-kr/llama-3.1-8b-instruct_lbox-criminal-non-property_ffn-only | 8B | 128K | no disponible | Este modelo, ajustado con SFT en FFN-only |
| Mistral 7B Instruct | 7B | 32K | Apache 2.0 | Alternativa de menor contexto, con licencia permisiva |
| Qwen 2.5 7B Instruct | 7B | 128K | Apache 2.0 | Alternativa con contexto similar y licencia abierta |

La comparativa se basa en el modelo base, ya que no hay datos específicos del ajuste. La principal diferencia con las alternativas es la posible especialización en el dominio legal, aunque no está verificada.

## Limitaciones y advertencias

- Información de entrenamiento limitada: no se conocen los datos utilizados ni el proceso de filtrado, lo que impide evaluar sesgos o calidad del ajuste.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios especializados como el legal.
- Licencia no especificada: la model card indica "licence: license" sin concretar. El modelo base usa la Llama 3.1 Community License, que permite uso comercial con restricciones para usuarios con más de 700 millones de usuarios mensuales. Se debe verificar la licencia aplicable antes de usar el modelo en producción.
- Especialización no verificada: el nombre sugiere una especialización en delitos no patrimoniales, pero no hay evidencia pública de que el modelo mejore realmente en esa tarea.
- Riesgo de degradación: el ajuste FFN-only puede haber reducido las capacidades generales del modelo base en tareas no relacionadas con el dominio de entrenamiento.
- Sin soporte garantizado: al ser un modelo de un usuario individual, no hay garantías de mantenimiento, actualizaciones o soporte técnico.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Jongbin-kr/llama-3.1-8b-instruct_lbox-criminal-non-property_ffn-only
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Registro de entrenamiento (Weights & Biases): https://wandb.ai/jongbin-kr-skiml_moe/sft_dense_lbox_ffn_only/runs/7ubtf9yq
- Modelo relacionado (casename-civil): https://huggingface.co/Jongbin-kr/llama-3.1-8b-instruct_lbox-casename-civil_ffn-only
- Modelo relacionado (MoE): https://huggingface.co/Jongbin-kr/llama-3.1-8b-instruct-4x1-moe
- Ficha del modelo base en slm.expert: https://slm.expert/models/llama-3-1-8b-instruct/
