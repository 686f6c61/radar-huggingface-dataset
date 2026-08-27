# ikim-uk-essen/stm_phi

## Resumen

El modelo `ikim-uk-essen/stm_phi` es un retriever semántico (sentence-encoder) desarrollado por el Institute for Artificial Intelligence in Medicine (IKIM) de la University Medicine Essen, en Alemania. Forma parte de la familia Synthesize–Train–Merge (STM), presentada en el artículo *"Less Finetuning, Better Retrieval: Rethinking LLM Adaptation for Biomedical Retrievers via Synthetic Data and Model Merging"* (arXiv 2026). El objetivo del modelo es mejorar la recuperación de información biomédica sin necesidad de un fine-tuning extenso, combinando adaptadores LoRA especializados mediante la técnica de fusión DARE-TIES.

El modelo se construye sobre el backbone `microsoft/Phi-4-mini-instruct` (3.8B parámetros) y fusiona cuatro adaptadores LoRA expertos en los pesos base, dando como resultado un modelo denso de 3.836.021.760 parámetros. Está diseñado para codificar consultas y pasajes en un espacio de embeddings de 3072 dimensiones, con una longitud máxima de secuencia de 512 tokens. Se distribuye en formato `safetensors` y se integra con la librería `sentence-transformers`, lo que facilita su uso en pipelines de retrieval.

La relevancia de este modelo radica en su enfoque de *model merging*: en lugar de entrenar un modelo completo desde cero o hacer fine-tuning costoso, se fusionan adaptadores entrenados en dominios específicos (biomédico real, retrieval general, biomédico sintético y QA general) con pesos y densidades ajustados mediante búsqueda aleatoria. Esto permite obtener un retriever competitivo con un coste de entrenamiento reducido, una tendencia creciente en la adaptación eficiente de LLMs.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en `microsoft/Phi-4-mini-instruct`) |
| Parametros totales | 3.836.021.760 (3.8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens (configuración del retriever) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder basado en la arquitectura transformer de `Phi-4-mini-instruct`, adaptado para tareas de retrieval mediante la fusión de adaptadores LoRA. Según la model card, se empleó el método **DARE-TIES** con búsqueda aleatoria (best of 10) para fusionar cuatro adaptadores expertos directamente en los pesos base. Los adaptadores y sus configuraciones son:

| Experto | Enfoque del dataset | Peso | Densidad |
|---|---|---|---|
| `expert-phi-real-medical` | QA biomédico real | 0.9 | 0.3 |
| `expert-phi-general-ir` | Retrieval general | 0.2 | 0.2 |
| `expert-phi-synthetic-medical` | QA biomédico sintético | 0.1 | 0.7 |
| `expert-phi-general-qa` | NLU / QA general | 0.1 | 0.4 |

No se especifican detalles sobre el volumen de datos de entrenamiento, el número de tokens ni el uso de técnicas como RLHF o DPO. La innovación principal reside en la estrategia de *merging*: en lugar de un fine-tuning completo, se combinan adaptadores especializados, lo que reduce el coste computacional y mantiene el rendimiento en retrieval biomédico.

## Capacidades

- **Retrieval semántico**: genera embeddings de 3072 dimensiones para consultas y pasajes, optimizados para similitud por producto escalar.
- **Especialización biomédica**: el experto con mayor peso (0.9) está entrenado en QA biomédico real, lo que lo hace adecuado para dominios clínicos y de ciencias de la salud.
- **Retrieval general**: incluye un experto de retrieval general (peso 0.2) que aporta capacidad de búsqueda en dominios no biomédicos.
- **QA y comprensión del lenguaje**: los expertos de QA general y NLU contribuyen a entender preguntas y pasajes de forma robusta.
- **Uso con prefijos de instrucción**: el modelo requiere prefijos específicos para consultas y pasajes (p. ej., `"Given a question, retrieve relevant passages..."`), lo que mejora la alineación con la tarea.
- **Integración con sentence-transformers**: compatible con la API estándar de la librería, incluyendo pooling de último token (EOS) y soporte para `flash_attention_2`.

## Casos de uso

- **Búsqueda de literatura médica**: un sistema de recuperación de artículos científicos puede usar `stm_phi` para codificar consultas de investigadores y pasajes de abstracts, devolviendo los documentos más relevantes mediante similitud coseno o producto escalar.
- **Asistencia a diagnóstico clínico**: integrado en un chatbot médico, el modelo puede recuperar pasajes de guías clínicas o bases de conocimiento que respondan a preguntas sobre síntomas, tratamientos o efectos secundarios, como el ejemplo de la metformina en la model card.
- **Sistemas de respuesta a preguntas (QA) sobre documentos**: en entornos corporativos o sanitarios, se puede usar para indexar manuales, protocolos o informes y responder consultas específicas extrayendo los fragmentos más relevantes.
- **Recomendación de recursos educativos**: en plataformas de formación médica, el modelo puede sugerir artículos, casos clínicos o capítulos de libros según la consulta del usuario.
- **Análisis de expedientes clínicos**: para tareas de recuperación de información en historiales electrónicos, el modelo puede encontrar pasajes relevantes sobre diagnósticos, medicaciones o alergias, facilitando la revisión clínica.
- **Indexación de bases de datos biomédicas**: permite construir índices semánticos de grandes colecciones de textos (PubMed, ensayos clínicos) para búsquedas por similitud, mejorando la precisión frente a búsquedas por palabras clave.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros retrievers. El artículo de arXiv (2602.04731) podría contener evaluaciones, pero no se proporcionan datos concretos en el material consultado.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 3.8B parámetros en FP16, se estima un consumo de al menos 8 GB de VRAM para procesar secuencias de hasta 512 tokens. En FP32, la demanda sería aproximadamente el doble.
- **GPU recomendadas**: tarjetas con 8-12 GB de VRAM, como NVIDIA RTX 3060/3070/4060, o GPUs profesionales como A10 o A100 para mayor throughput.
- **Compatibilidad con GPUs de consumo**: sí, cabe en GPUs de consumo con 8 GB o más, siempre que se use FP16 o cuantización (aunque no se especifican cuantizaciones disponibles).
- **Opciones de despliegue**: al ser un modelo de `sentence-transformers`, se puede ejecutar con la librería estándar, o mediante servidores de inferencia como Hugging Face Inference Endpoints, o en pipelines con vLLM (si se adapta). También es compatible con `flash_attention_2` para acelerar la atención.
- **Latencia y throughput**: no se dispone de datos oficiales. Para un modelo de 3.8B, la latencia típica de codificación de una secuencia de 512 tokens en una GPU moderna (p. ej., A100) sería del orden de decenas de milisegundos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables específicos en la información proporcionada. El modelo se basa en `Phi-4-mini-instruct`, pero no se ofrecen comparaciones con otros retrievers biomédicos como BioBERT, MedCPT o similares.

## Limitaciones y advertencias

- **Licencia no especificada**: la model card no indica la licencia, lo que genera incertidumbre sobre el uso comercial y la redistribución. Se recomienda contactar con los autores antes de usarlo en producción.
- **Contexto limitado**: la longitud máxima de secuencia es de 512 tokens, lo que restringe la codificación de pasajes largos. Para documentos extensos, será necesario dividirlos en fragmentos.
- **Idiomas no especificados**: no se indica qué idiomas soporta. Aunque el modelo base `Phi-4-mini-instruct` es multilingüe, no hay garantía de rendimiento en idiomas distintos del inglés.
- **Riesgo de alucinación en retrieval**: al ser un encoder, no genera texto, pero la calidad de los embeddings depende del entrenamiento; puede haber sesgos en dominios no representados en los datos de los adaptadores.
- **Dependencia de prefijos de instrucción**: el modelo requiere el uso de prefijos específicos para consultas y pasajes; un uso incorrecto puede degradar significativamente el rendimiento.
- **Sin benchmarks publicados**: no hay evidencia empírica de su rendimiento frente a otros retrievers, por lo que se debe evaluar en el caso de uso concreto antes de adoptarlo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ikim-uk-essen/stm_phi)
- [Paper en arXiv](https://arxiv.org/abs/2602.04731)
- [Colección STM en Hugging Face](https://huggingface.co/collections/ikim-uk-essen/stm)
- [Sitio web de IKIM](https://www.ikim.uk-essen.de/)
- [Perfil de IKIM en Hugging Face](https://huggingface.co/ikim-uk-essen)
