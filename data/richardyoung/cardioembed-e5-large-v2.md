# richardyoung/CardioEmbed-E5-large-v2

## Resumen

CardioEmbed-E5-large-v2 es un adaptador LoRA que especializa el modelo de embeddings `intfloat/e5-large-v2` en el dominio de la cardiología clínica. Lo desarrolla Richard J. Young (DeepNeuro) como parte de un estudio comparativo de 10 arquitecturas de embeddings para representación de texto cardiológico, publicado en arXiv:2511.19739. El objetivo es mejorar la calidad de las representaciones vectoriales en textos médicos especializados, donde los modelos generalistas suelen perder matices terminológicos.

El modelo no es un modelo generativo ni un LLM conversacional: es un encoder de frases (sentence-similarity) pensado para tareas de retrieval, clustering, deduplicación y búsqueda semántica sobre corpus cardiológicos. Se distribuye como adaptador PEFT (LoRA con r=16 y alpha=32) sobre el checkpoint base E5-large-v2, que aporta la arquitectura transformer encoder subyacente.

Su relevancia radica en la especialización de dominio con un coste de entrenamiento bajo (adaptadores LoRA) y una licencia permisiva Apache 2.0, lo que facilita su integración en pipelines de RAG clínico o sistemas de búsqueda documental hospitalaria. El modelo está entrenado y evaluado exclusivamente en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (base: intfloat/e5-large-v2) con adaptadores LoRA (PEFT) |
| Parametros totales | No disponible (adaptador LoRA sobre E5-large-v2; el base E5-large-v2 tiene ~335 M de parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base; E5-large-v2 soporta hasta 512 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors/PyTorch |

## Arquitectura y entrenamiento

El modelo parte del encoder `intfloat/e5-large-v2`, un transformer bidireccional de tipo BERT-large (~335 M de parámetros) optimizado para embeddings de frases. Sobre él se aplica un adaptador LoRA con rango 16 y alpha 32, entrenado con Multiple Negatives Ranking Loss (InfoNCE), una función de contraste típica en sentence-transformers que empuja las representaciones de pares positivos a estar próximas y las de negativos a separarse.

El conjunto de entrenamiento consta de 106.535 pares de texto cardiológico extraídos de libros de texto médicos. No se especifican en la información disponible el número de tokens totales, la composición exacta del corpus, ni si hubo etapas adicionales de refinamiento. La innovación principal es la adaptación de dominio con bajo coste computacional mediante LoRA, manteniendo intacto el checkpoint base y permitiendo cargar el adaptador de forma independiente.

## Capacidades

- Generación de embeddings de frases para similitud semántica y búsqueda vectorial.
- Especialización en terminología cardiológica clínica (fármacos, procedimientos, diagnósticos, hallazgos ecocardiográficos, etc.).
- Soporte de tareas de retrieval (búsqueda de pasajes relevantes dado un query clínico).
- Clustering y deduplicación de documentos médicos.
- Clasificación zero-shot mediante similitud con etiquetas textuales.
- Integración con el ecosistema `sentence-transformers` y `transformers` + `peft`.
- No soporta tool calling, agentes, visión, audio ni modo thinking: es un encoder, no un modelo generativo.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Búsqueda semántica en guías de práctica clínica cardiológica: indexar documentos y recuperar fragmentos relevantes ante consultas como "manejo de insuficiencia cardíaca con fracción de eyección reducida", aprovechando la adaptación al vocabulario cardiológico.
- RAG clínico en asistentes médicos: usar los embeddings como recuperador en un pipeline de generación aumentada, donde el LLM generativo responde a partir de pasajes cardiológicos recuperados por CardioEmbed.
- Deduplicación de registros de pacientes o informes: agrupar informes de ecocardiografía o cateterismo casi idénticos mediante similitud coseno sobre los embeddings.
- Clasificación temática de literatura médica: asignar automáticamente artículos a subáreas cardiológicas (arritmias, insuficiencia cardíaca, cardiopatía isquémica) por similitud con prototipos textuales.
- Motores de recomendación de contenido formativo: sugerir casos clínicos o capítulos de manuales relacionados con el tema consultado por un residente.
- Análisis de literatura y revisiones sistemáticas: agrupar abstracts de PubMed por similitud semántica para facilitar el cribado en revisiones.
- Sistemas de alerta y triaje documental: comparar notas clínicas con plantillas de referencia para detectar patrones o discrepancias terminológicas.

## Benchmarks y rendimiento

La model card solo reporta una métrica propia del estudio: Separation Score de 0,284. No se publican resultados en benchmarks estándar (MMLU, HumanEval, MTEB, etc.) en la información disponible.

| Metrica | Valor |
|---|---|
| Separation Score (metrica propia del estudio) | 0,284 |
| MTEB / benchmarks publicos | No disponible |

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA es de pocos MB; el modelo base E5-large-v2 (~335 M parámetros) ocupa aproximadamente 1,3 GB en FP32 y ~0,7 GB en FP16. En la práctica, menos de 2 GB de VRAM para inferencia.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); también funciona en CPU para cargas moderadas.
- Cabe holgadamente en GPU consumer e incluso en entornos embebidos o CPU.
- Opciones de despliegue: `transformers` + `peft`, `sentence-transformers` (cargando el adaptador), `text-embeddings-inference` (TEI) o `vLLM` en modo embeddings si se fusiona el adaptador con el base.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un encoder de ~335 M, el throughput esperado es alto (cientos a miles de frases por segundo en GPU moderna), pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CardioEmbed-E5-large-v2 | Adaptador LoRA sobre E5-large-v2 (~335 M base) | No disponible (heredado, hasta 512 tokens) | Cardiologia clinica | Apache 2.0 | Hugging Face |
| intfloat/e5-large-v2 | ~335 M | 512 tokens | Generalista | MIT | Hugging Face |
| BioLORD-2023 / modelos biomedicos tipo PubMedBERT | ~110-335 M | 512 tokens | Biomedico general | Varía (MIT/Apache) | Hugging Face |
| Modelos MTEB top generalistas (p. ej. bge-large-en-v1.5) | ~335 M | 512 tokens | Generalista | MIT | Hugging Face |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; el estudio de referencia (arXiv:2511.19739) compara 10 arquitecturas, pero sus resultados no se incluyen en la model card.

## Limitaciones y advertencias

- Entrenado y evaluado solo en inglés; su uso en castellano u otros idiomas no está validado y probablemente degrade la calidad.
- Dominio muy restringido (cardiología); su rendimiento en textos médicos generales o de otras especialidades puede ser inferior al de un modelo generalista.
- Riesgo de sesgo heredado del corpus de libros de texto médicos (posible infrarrepresentación de poblaciones, prácticas o terminologías minoritarias).
- No es un modelo generativo: no debe usarse para responder preguntas ni producir texto, solo para representar frases.
- La métrica reportada (Separation Score 0,284) es propia del estudio y no es directamente comparable con métricas estándar como MTEB.
- Al ser un adaptador PEFT, requiere cargar el modelo base `intfloat/e5-large-v2` por separado; el repositorio no incluye pesos fusionados.
- Uso clínico real: no debe emplearse como único componente en decisiones médicas sin validación adicional y supervisión profesional.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base (MIT) y del corpus de entrenamiento, no detalladas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/CardioEmbed-E5-large-v2
- Modelo base: https://huggingface.co/intfloat/e5-large-v2
- Paper de referencia: https://arxiv.org/abs/2511.19739
- Perfil del autor: https://deepneuro.ai/richard
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de sentence-transformers: https://www.sbert.net/
