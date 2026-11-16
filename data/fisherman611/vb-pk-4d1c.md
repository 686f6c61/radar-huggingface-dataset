# fisherman611/vb-pk-4d1c

## Resumen

vb-pk-4d1c es un modelo de embeddings de frases en vietnamita desarrollado por el usuario fisherman611 y publicado en Hugging Face bajo el identificador `fisherman611/vb-pk-4d1c`. Se trata de un fine-tune del codificador bi-direccional `bkai-foundation-models/vietnamese-bi-encoder` (135M parámetros), orientado a una tarea muy concreta: el filtrado de aplicaciones (app filtering) para el asistente LifeMate en el contexto del Zalo AI Challenge 2026. El modelo transforma descripciones de aplicaciones y consultas de usuario en vectores densos que permiten recuperar la app adecuada mediante similitud semántica.

La relevancia de este modelo es acotada pero clara: demuestra cómo un encoder pequeño (135M) puede especializarse mediante fine-tuning con datos sintéticos y aumentación controlada para superar a alternativas genéricas en una tarea de recuperación con vocabulario específico (nombres de apps, alias, variantes fonéticas y ruido de reconocimiento automático de voz). El autor reporta un recall híbrido (BM25@4 ∪ embeddings@5) del 100.0 % en validación in-distribution, 98.1 % en out-of-distribution y 99.1 % en alias, lo que sugiere una integración efectiva con recuperación léxica.

El modelo se publica como sentence-transformers con pesos en safetensors, requiere segmentación de palabras en vietnamita con `pyvi` antes de la codificación y está entrenado exclusivamente para vietnamita. No se han publicado datos sobre licencia, benchmarks estándar ni pipeline de inferencia en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder bi-direccional (RoBERTa, según tag `roberta`), base `bkai-foundation-models/vietnamese-bi-encoder` |
| Parámetros totales | 134.998.272 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos safetensors en fp32/fp16 según repo; no se documentan GGUF ni otras) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Librería | sentence-transformers |
| Dimensión de embedding | no disponible |
| Tamaño del repo | 0,5 GB |
| Modelo base | bkai-foundation-models/vietnamese-bi-encoder |

## Arquitectura y entrenamiento

El modelo es un fine-tune de un encoder bi-direccional tipo RoBERTa adaptado al vietnamita (`vietnamese-bi-encoder`, 135M parámetros). La arquitectura sigue el esquema clásico de sentence-transformers: el encoder produce una representación vectorial de la frase (probablemente mediante pooling sobre los tokens), y el entrenamiento se realiza con una función de pérdida de similitud entre pares (consulta, app) o tripletas, aunque la información disponible no detalla la función de pérdida exacta ni el esquema de contrastive learning empleado.

El entrenamiento se describe como "configuración B" dentro de una campaña de experimentos. Los datos incluyen el conjunto de entrenamiento proporcionado por los organizadores del Zalo AI Challenge 2026, más alias, variantes de interfaz y variantes fonéticas, y un conjunto de apps escrito manualmente. La aumentación aplicada es notable: 314 frases de nuevas apps, reformulación de descripciones, eliminación del 30 % de palabras clave y ruido ASR simulado. Se entrenó durante 2 épocas y se seleccionó como versión final. Se excluyeron explícitamente 5 apps held-out (alarm, ewallet, flights, loyalty, podcast_radio) para evaluar generalización out-of-distribution, y no se usaron etiquetas ni frases de los conjuntos public/private test. El autor indica que se requiere `pyvi` para la segmentación de palabras antes de la codificación, lo que es coherente con el preprocesamiento típico del vietnamita.

## Capacidades

- Generación de embeddings de frases en vietnamita para búsqueda semántica y recuperación de información.
- Recuperación de aplicaciones a partir de descripciones de usuario, con soporte para alias, variantes fonéticas y ruido de ASR.
- Integración con recuperación léxica (BM25) en un esquema híbrido; el autor reporta recall híbrido BM25@4 ∪ embeddings@5.
- Codificación de consultas y documentos en el mismo espacio vectorial para similitud coseno.
- Manejo de vocabulario específico de apps (nombres propios, marcas, variantes de escritura).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking; es exclusivamente un encoder de embeddings.
- Capacidad multilingüe limitada al vietnamita; no se documenta soporte para otros idiomas.

## Casos de uso

- Filtrado de apps en asistentes conversacionales: el modelo codifica la consulta del usuario y las descripciones de apps, y recupera las candidatas más similares; encaja en el pipeline LifeMate para el que fue entrenado.
- Búsqueda híbrida en catálogos de aplicaciones: combinado con BM25, permite recuperar apps cuando la consulta contiene errores de transcripción de voz o alias informales, gracias al entrenamiento con ruido ASR simulado.
- Enrutamiento de intenciones en un asistente de voz: tras la transcripción ASR, el embedding permite mapear la frase a la app o función correcta sin depender de coincidencia exacta de palabras.
- Deduplicación y agrupación de descripciones de apps: los embeddings permiten agrupar apps con descripciones semánticamente equivalentes en un catálogo.
- Evaluación de calidad de catálogos: detectar apps con descripciones ambiguas o solapadas midiendo la similitud entre sus embeddings.
- Prototipado rápido de sistemas de recomendación de apps: al ser un modelo de 135M parámetros, se puede desplegar en CPU o GPU modesta para experimentar con recuperación semántica sin infraestructura pesada.
- Búsqueda semántica en vietnamita para dominios con vocabulario ruidoso: el modelo sirve como base para tareas de recuperación donde las consultas provienen de ASR o de usuarios no expertos.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados por el autor son métricas de recall del sistema híbrido en validación, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.):

| Métrica | Valor |
|---|---|
| Recall híbrido BM25@4 ∪ emb@5, val_in | 100,0 % |
| Recall híbrido BM25@4 ∪ emb@5, val_ood | 98,1 % |
| Recall híbrido BM25@4 ∪ emb@5, val_alias | 99,1 % |
| Recall solo embeddings @5, val_ood | 86,5 % |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 135M parámetros (aproximadamente 0,54 GB solo pesos, más overhead de activaciones y tokenizador); en fp16 alrededor de 0,27 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas consumer como GTX 1650, RTX 3060, RTX 4090 son más que suficientes. También funciona en CPU.
- Cabe en cualquier GPU consumer actual y en la mayoría de entornos integrados con suficiente memoria.
- Opciones de despliegue: sentence-transformers (nativo), Hugging Face Transformers, y potencialmente ONNX Runtime o FAISS como índice vectorial. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por frase en GPU y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fisherman611/vb-pk-4d1c | 135M | no disponible | vi | no disponible | Hugging Face |
| bkai-foundation-models/vietnamese-bi-encoder | ~135M | no disponible | vi | no disponible | Hugging Face |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | ~118M | 128 tokens (típico) | multilingüe | Apache 2.0 (según versión) | Hugging Face |
| intfloat/multilingual-e5-small | ~118M | 512 tokens | multilingüe | MIT | Hugging Face |

La comparación con alternativas multilingües es orientativa: el modelo de fisherman611 está especializado en una tarea de filtrado de apps en vietnamita y no se han publicado evaluaciones en benchmarks estándar que permitan una comparación directa de rendimiento. Los datos de contexto y licencia de los modelos comparables deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en vietnamita; no es adecuado para otros idiomas.
- Requiere segmentación de palabras con `pyvi` antes de la codificación; omitir este paso degrada la calidad de los embeddings.
- Es un encoder de embeddings, no un modelo generativo: no puede responder preguntas, generar texto ni ejecutar herramientas.
- Riesgo de sobreajuste al dominio de apps del Zalo AI Challenge 2026; el rendimiento en otros dominios no está documentado.
- El recall reportado (100 % en val_in) corresponde a validación interna del autor y a un esquema híbrido con BM25; no es un benchmark independiente ni comparable con métricas estándar.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base y del fine-tune antes de usarlo en producción.
- Sesgos: no documentados; al entrenarse con datos de apps y aumentación sintética, puede reflejar sesgos del catálogo y de las descripciones utilizadas.
- Riesgo de alucinación: no aplica en el sentido generativo, pero los embeddings pueden producir similitudes espurias en consultas fuera de distribución.
- Sin descargas ni likes en el momento de la consulta; modelo de nicho con escasa validación comunitaria.
- No se documentan dimensiones de embedding, longitud máxima de secuencia ni formato de pooling, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fisherman611/vb-pk-4d1c
- Modelo base: https://huggingface.co/bkai-foundation-models/vietnamese-bi-encoder
- Librería sentence-transformers: https://www.sbert.net/
- Segmentador `pyvi`: https://github.com/trungtv/pyvi
- Zalo AI Challenge: https://zalo.ai/ (referencia del contexto competitivo; no se dispone de enlace directo al challenge 2026 en la información proporcionada)
