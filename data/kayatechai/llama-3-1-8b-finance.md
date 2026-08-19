# KayaTechAI/Llama-3.1-8b-Finance

## Resumen

KayaTechAI/Llama-3.1-8b-Finance es un modelo de lenguaje especializado en el dominio financiero, desarrollado por KayaTechAI. Se trata de un merge de dos adaptadores LoRA afinados sobre la base Llama 3.1 8B Instruct: uno orientado a razonamiento financiero y otro a clasificación de sentimiento financiero. El merge se realiza mediante la técnica TIES-Merge, que combina los deltas de ambos adaptadores con consenso de signo y poda por magnitud, aplicado sobre el checkpoint `unsloth/Llama-3.1-8B-Instruct`. El resultado es un único modelo denso de 8.030 millones de parámetros capaz de abordar tareas de análisis de documentos financieros, preguntas y respuestas, y análisis de sentimiento en un solo checkpoint.

La relevancia de este modelo radica en su enfoque de producción: en lugar de lanzar un fine-tuning directo, los autores verifican la genealogía de los adaptadores, los hornean sobre sus bases correctas y luego aplican un merge con análisis de conflicto entre deltas. Esto permite combinar capacidades complementarias (razonamiento financiero y sentimiento) sin degradar el rendimiento general de la base. Aunque el modelo está en una fase temprana (0 descargas, 0 likes), su metodología rigurosa lo convierte en un candidato interesante para equipos que necesitan un modelo financiero compacto y reproducible.

No se dispone de información pública sobre la longitud de contexto, idiomas soportados o benchmarks, por lo que estos aspectos quedan sin especificar en esta ficha. La licencia es llama3.1, lo que permite uso comercial con restricciones propias de dicha licencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Llama 3.1 8B Instruct) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Llama 3.1 8B, presumiblemente 128k, pero no confirmado) |
| Tipos de cuantizacion | no disponible (repositorio solo contiene safetensors en FP16/BF16) |
| Idiomas soportados | no disponible (heredados de Llama 3.1, principalmente inglés y otros, sin confirmación específica) |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (16.1 GB en el repositorio) |

## Arquitectura y entrenamiento

El modelo se construye sobre `unsloth/Llama-3.1-8B-Instruct`, que es una versión de Meta Llama 3.1 8B Instruct optimizada con el framework unsloth. La arquitectura es un transformer decoder-only estándar con 8.030 millones de parámetros, atención multi-cabeza y normalización RMSNorm, tal como en la familia Llama 3.1. La longitud de contexto nativa de Llama 3.1 es de 128.000 tokens, aunque no se confirma si el merge preserva íntegramente esta capacidad.

El proceso de entrenamiento consta de dos etapas. Primero, se generan dos adaptadores LoRA: `KayaTechAI/SFT-Llama-3.1-8B-Financial-Instruct` (razonamiento financiero) y `KayaTechAI/SFT-Llama-3.1-8B-Financial-Instruct-Sentiment` (clasificación de sentimiento). Cada adaptador se hornea sobre su base correcta: el primero sobre `KayaTechAI/Merged-IPT-Llama-3.1-8B-Financial-Instruct` y el segundo sobre `KayaTechAI/SLERP-IPT-Llama-3.1-8B-Financial-Instruct` (que a su vez es un SLERP de la anterior y de `unsloth/Meta-Llama-3.1-8B-Instruct`). Esta verificación de genealogía evita el error común de aplicar un adaptador LoRA sobre una base incorrecta.

En la segunda etapa, se calculan los deltas entre cada checkpoint horneado y la base `unsloth/Llama-3.1-8B-Instruct`, y se combinan mediante TIES-Merge con pesos 0.55 (financiero) y 0.45 (sentimiento), densidad 0.9, consenso de signo y resolución de desacuerdos por magnitud dominante. La normalización está habilitada para preservar la magnitud agregada de los deltas. El análisis de conflicto entre los 291 tensores muestra un 57.7% de alta concordancia (cos > 0.7) y un 7.2% de alto conflicto (cos < 0.3), lo que justifica la elección de TIES-Merge.

No se proporcionan detalles sobre el dataset de entrenamiento, número de tokens ni técnicas de alineación adicionales (RLHF, DPO, etc.). El modelo es un merge, no un fine-tuning con datos nuevos.

## Capacidades

- Razonamiento financiero: capaz de responder preguntas y resolver problemas de análisis financiero gracias al adaptador de instrucción financiera.
- Clasificación de sentimiento financiero: detecta el sentimiento positivo, negativo o neutral en textos relacionados con mercados, empresas y noticias económicas.
- Análisis de documentos financieros: puede procesar informes, resúmenes de ganancias, comunicados de prensa y otros documentos del dominio.
- Soporte de instrucciones multi-turno: heredado de la base Instruct, permite conversaciones con contexto.
- Capacidades generales de Llama 3.1 8B: generación de texto, razonamiento, código y matemáticas en los idiomas que soporta la base (principalmente inglés, con capacidades multilingües limitadas).
- No se confirma soporte de tool calling, function calling ni modo agente explícito, aunque la base Llama 3.1 8B Instruct sí lo tiene; el merge podría preservarlo, pero no está documentado.

## Casos de uso

- Análisis de sentimiento de noticias financieras: el modelo puede clasificar automáticamente titulares y artículos sobre empresas o sectores en positivos, negativos o neutrales, útil para alimentar dashboards de mercado o alertas tempranas.
- Asistente de preguntas y respuestas sobre informes anuales: un desarrollador puede integrar el modelo en un chatbot que responda a preguntas como "¿cuál fue el crecimiento de ingresos en 2024?" a partir de un documento cargado, aprovechando el razonamiento financiero del adaptador instruct.
- Extracción de opiniones de actas de reuniones o earnings calls: el modelo puede resumir el tono general de una llamada de resultados y extraer frases clave con carga emocional.
- Clasificación de tickets de soporte financiero: en una fintech, el modelo puede categorizar consultas de clientes por tipo (reclamación, información, problema técnico) y priorizarlas según el sentimiento expresado.
- Generación de resúmenes ejecutivos de estados financieros: dado un balance o una cuenta de resultados en texto, el modelo puede producir un resumen conciso con los puntos relevantes para inversores.
- Validación de cumplimiento normativo: el modelo puede analizar comunicaciones de marketing financiero para detectar lenguaje engañoso o excesivamente optimista que viole regulaciones como MiFID II.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de dominio financiero. Los autores recomiendan validar el modelo en los conjuntos de prueba `KayaTechAI/sp500-summary-dataset` y `KayaTechAI/FIN-Sentiment-SFT` antes de un despliegue en producción, pero no se han proporcionado resultados numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8B parámetros en FP16, se necesitan aproximadamente 16 GB de VRAM para cargar los pesos completos. Con cuantización a 8 bits (int8) se puede reducir a unos 8-9 GB, y a 4 bits (GPTQ/AWQ) a unos 5-6 GB.
- GPU recomendadas: para inferencia en FP16, una NVIDIA RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB) son adecuadas. Para cuantización 4-bit, una RTX 3090 (24 GB) o RTX 4080 (16 GB) pueden ser suficientes.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs de consumo con al menos 8 GB de VRAM si se usa cuantización 4-bit, aunque la calidad puede verse afectada.
- Opciones de despliegue: al ser un modelo basado en Llama 3.1, es compatible con vLLM, llama.cpp, Ollama, TGI y otros frameworks estándar. Se puede convertir a GGUF para ejecución en CPU/GPU con llama.cpp.
- Latencia y throughput: no hay datos oficiales. Como referencia, un modelo de 8B en una A100 puede generar entre 20-50 tokens/segundo con vLLM, dependiendo de la configuración y el tamaño del batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KayaTechAI/Llama-3.1-8b-Finance | 8B | no disponible (heredado 128k) | Merge TIES de razonamiento financiero y sentimiento | llama3.1 | HuggingFace |
| martain7r/finance-llama-8b | 8B | no disponible | Fine-tuning sobre Llama 3.1 8B con 500k ejemplos financieros (QA, razonamiento, sentimiento, NER) | no especificada | HuggingFace, Ollama |
| KayaTechAI/Llama-3.1-8B-Financial-Instruct | 8B | no disponible | Adaptador LoRA para instrucción financiera (base del presente modelo) | llama3.1 | HuggingFace |

No se dispone de datos de rendimiento comparativos. La principal diferencia entre este modelo y `martain7r/finance-llama-8b` es la metodología: el primero usa un merge de adaptadores con verificación de genealogía, mientras que el segundo es un fine-tuning directo sobre un dataset más amplio. La elección dependerá de la necesidad de combinar sentimiento y razonamiento en un solo checkpoint frente a un fine-tuning más tradicional.

## Limitaciones y advertencias

- Sesgos y alucinaciones: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios técnicos como el financiero. No debe utilizarse para asesoramiento financiero sin supervisión humana.
- Falta de validación: el modelo no tiene descargas ni likes, y los propios autores recomiendan validar en conjuntos de prueba antes de producción. No hay evidencia pública de rendimiento.
- Alcance del dominio: el modelo está especializado en finanzas, pero su capacidad multilingüe y de razonamiento general depende de la base Llama 3.1, que puede tener limitaciones en idiomas distintos del inglés.
- Licencia llama3.1: permite uso comercial, pero requiere incluir la atribución correspondiente y cumplir con las restricciones de la licencia (por ejemplo, no usar para mejorar otros modelos grandes).
- Contexto no confirmado: aunque la base Llama 3.1 soporta 128k tokens, no se ha verificado que el merge preserve íntegramente esta capacidad. Es recomendable probar con secuencias largas antes de confiar en ella.
- Riesgo de conflictos de merge: aunque el análisis de conflicto mostró un 7.2% de tensores con alta discrepancia, estos podrían degradar el rendimiento en tareas específicas. No hay evaluación publicada que lo descarte.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/KayaTechAI/Llama-3.1-8b-Finance)
- [Adaptador de instrucción financiera (base)](https://huggingface.co/KayaTechAI/Llama-3.1-8B-Financial-Instruct)
- [Checkpoint intermedio IPT-Llama-3.1-8B-Financial-Instruct](https://huggingface.co/KayaTechAI/IPT-Llama-3.1-8B-Financial-Instruct)
- [Referencia en FriendliAI](https://friendli.ai/models/KayaTechAI/Llama-3.1-8B-Financial-Instruct)
- [Modelo alternativo finance-llama-8b en Ollama](https://ollama.com/martain7r/finance-llama-8b)
- [Análisis de Finance-Llama-8B en aimodels.fyi](https://www.aimodels.fyi/models/huggingFace/finance-llama-8b-tarun7r)
