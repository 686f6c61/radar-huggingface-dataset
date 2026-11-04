# gipyo123/multilingual-e5-small-labor

## Resumen

multilingual-e5-small-labor es un modelo de embeddings densos especializado en la recuperación de artículos legales laborales coreanos. Lo desarrolla el usuario gipyo123 como un fine-tuning completo de intfloat/multilingual-e5-small, un encoder BERT multilingüe de 117,6 millones de parámetros que produce vectores de 384 dimensiones. El modelo resuelve un problema concreto: dado un query en lenguaje natural sobre derecho laboral (por ejemplo, una duda sobre permiso menstrual o prescripción de salarios), devolver el artículo de la ley que responde a esa duda.

La relevancia es doble. Por un lado, adapta un modelo multilingüe genérico a un dominio vertical muy específico (legislación laboral coreana) con un conjunto de entrenamiento pequeño (663 pares query-passage), lo que demuestra que el fine-tuning con MultipleNegativesRankingLoss sobre pocos datos bien curados puede ofrecer una accuracy@5 superior al 90 % en el dominio objetivo. Por otro, el modelo es pequeño (0,5 GB de repositorio, 117 M de parámetros) y se puede desplegar en CPU o en GPUs de consumo, lo que abarata su integración en sistemas RAG legales.

El modelo se publica bajo licencia MIT, con el formato propio de sentence-transformers (pesos safetensors) y compatibilidad con text-embeddings-inference y endpoints de HuggingFace. Está etiquetado únicamente para coreano (`ko`), aunque el modelo base sobre el que se construye es multilingüe.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base de intfloat/multilingual-e5-small) |
| Parámetros totales | 117.653.760 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (incluyendo tokens especiales y prefijos `query:` / `passage:`) |
| Tipos de cuantización | no disponible (el autor no documenta cuantizaciones; al ser safetensors se puede cuantizar externamente con herramientas estándar) |
| Idiomas soportados | coreano (`ko`) según la model card; el modelo base es multilingüe |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,5 GB) |
| Dimensión del embedding | 384 |
| Función de pérdida de entrenamiento | MultipleNegativesRankingLoss |
| Tamaño del dataset de entrenamiento | 663 pares |
| Librería | sentence-transformers |
| Pipeline | sentence-similarity / feature-extraction |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo (no un adaptador) del encoder BERT de intfloat/multilingual-e5-small. Se trata de un transformer encoder bidireccional que genera un único vector denso de 384 dimensiones por texto, normalizado, apto para similitud coseno. La longitud máxima de entrada es de 512 tokens, contando los tokens especiales y los prefijos obligatorios `query:` (para consultas) y `passage:` (para documentos), que el modelo base E5 espera y que el autor mantiene en el fine-tuning.

El entrenamiento se realizó sobre el dataset gipyo123/labor-embedding-data, compuesto por 663 pares de consulta y artículo legal correcto, con la pérdida MultipleNegativesRankingLoss (contrastiva con negativos en el lote). No se documenta en la información disponible el número de tokens de entrenamiento, la composición exacta del corpus ni si hubo etapas de RLHF o DPO (no aplicables habitualmente a modelos de embeddings). El autor indica explícitamente que el corpus general de evaluación del mismo repositorio de datos se usó solo para comprobar la regresión en otros dominios y no participó en el entrenamiento de los pesos, lo que sugiere una preocupación por preservar la capacidad de recuperación general del modelo base.

## Capacidades

- Generación de embeddings densos de 384 dimensiones para búsqueda semántica y recuperación de información.
- Similitud semántica entre consultas en lenguaje natural y pasajes legales (artículos de la legislación laboral coreana).
- Recuperación de artículos concretos a partir de paráfrasis: el widget de la model card muestra consultas reformuladas que apuntan al mismo artículo (por ejemplo, tres formas distintas de preguntar por el permiso menstrual y el artículo 73).
- Soporte de los prefijos E5 (`query:` y `passage:`) y de `normalize_embeddings=True` para similitud coseno.
- Capacidad multilingüe heredada del modelo base intfloat/multilingual-e5-small, aunque el autor solo declara y evalúa coreano.
- Integración con text-embeddings-inference y con endpoints compatibles de HuggingFace.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: es un modelo exclusivamente de embeddings.

## Casos de uso

- Búsqueda semántica en un asistente legal laboral: el modelo indexa artículos de la ley laboral como pasajes y responde a consultas de trabajadores devolviendo los artículos más relevantes; con accuracy@5 del 90,2 % en el conjunto de evaluación, es adecuado como primera etapa de un pipeline RAG.
- Sistema RAG sobre normativa laboral coreana: los embeddings alimentan un recuperador que selecciona los artículos candidatos y un LLM posterior redacta la respuesta citando la norma; el tamaño reducido del modelo permite indexar miles de artículos en memoria sin GPU.
- Atención al cliente en portales de recursos humanos: clasificación y enrutamiento de consultas de empleados hacia el artículo o departamento correcto según la similitud semántica con la base de normativa interna.
- Deduplicación y agrupación de consultas legales: agrupar preguntas equivalentes formuladas de forma distinta (como en los ejemplos del widget) para construir FAQs o detectar consultas recurrentes.
- Búsqueda dentro de herramientas de gestión documental: recuperar cláusulas o artículos relevantes en un corpus de convenios y contratos sin depender de coincidencia exacta de palabras clave.
- Evaluación de regresión de dominio: usar el corpus general del repositorio de datos para comprobar que el fine-tuning no degrada la recuperación fuera del dominio laboral antes de desplegar el modelo en producción.
- Prototipado rápido en local: al ser un modelo de 117 M de parámetros y 0,5 GB, se puede ejecutar en CPU o en una GPU de consumo para validar la calidad de la recuperación antes de invertir en infraestructura mayor.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (dataset `labor`, tarea de recuperación de información; métricas no verificadas, `verified: false`):

| Métrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,6402 |
| Cosine Accuracy@3 | 0,8551 |
| Cosine Accuracy@5 | 0,9019 |
| Cosine Accuracy@10 | 0,9299 |
| Cosine Precision@1 | 0,6402 |
| Cosine Precision@5 | 0,1804 |
| Cosine Recall@1 | 0,6402 |
| Cosine Recall@5 | 0,9019 |
| Cosine nDCG@10 | 0,7941 |
| Cosine MRR@10 | 0,7493 |
| Cosine MAP@100 | 0,7520 |

No se han publicado en la información disponible resultados comparativos con otros modelos ni métricas sobre benchmarks estándar (MMLU, HumanEval, etc.), que no aplican a un modelo de embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos; en fp16, unos 0,25 GB. Con overhead de activaciones y tokenizador, cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para volúmenes moderados. Para alto throughput, cualquier GPU moderna (T4, L4, RTX 3060 en adelante, A10, A100, H100) es más que suficiente.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: sentence-transformers (referencia del autor), text-embeddings-inference (etiqueta `text-embeddings-inference` en el repo), endpoints compatibles de HuggingFace, y herramientas estándar de cuantización y serving para modelos BERT.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo (117 M de parámetros, 384 dimensiones), se espera un throughput alto en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensión | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| gipyo123/multilingual-e5-small-labor | 117,6 M | 512 tokens | 384 | Laboral coreano (fine-tuning) | MIT | HuggingFace |
| intfloat/multilingual-e5-small (base) | 117,6 M | 512 tokens | 384 | Multilingüe general | MIT | HuggingFace |
| intfloat/multilingual-e5-base (base) | no disponible en la información | 512 tokens | 768 | Multilingüe general | MIT | HuggingFace |

La comparación directa de rendimiento con el modelo base no está disponible en la información proporcionada: el autor no publica métricas del base sobre el dataset `labor`, por lo que no se puede cuantificar la mejora del fine-tuning frente al punto de partida. La ventaja diferencial del modelo es la especialización en terminología y paráfrasis del derecho laboral coreano, a costa de un dataset de entrenamiento muy pequeño (663 pares) que limita la generalización a otras ramas del derecho.

## Limitaciones y advertencias

- El autor advierte que las puntuaciones de recuperación dependen del conjunto de evaluación y que otros dominios y artículos nuevos deben evaluarse por separado.
- Una similitud alta no garantiza que el documento recuperado sea la respuesta legal correcta; el modelo no es una herramienta de asesoramiento jurídico.
- El entrenamiento se realizó con solo 663 pares, lo que aumenta el riesgo de sobreajuste al conjunto de evaluación y de baja generalización a formulaciones o normativas no vistas.
- El modelo está declarado únicamente para coreano; su comportamiento en castellano u otros idiomas no está evaluado, aunque herede capacidades multilingües del base.
- Longitud de contexto limitada a 512 tokens: los artículos o documentos largos deben trocearse antes de la codificación.
- Riesgo de sesgo derivado del corpus de entrenamiento: si los pares cubren desproporcionadamente ciertos artículos, la recuperación puede favorecerlos.
- No es un modelo generativo: no produce respuestas ni razonamiento, solo vectores; cualquier uso en producción requiere un componente generativo o de presentación adicional.
- Licencia MIT: permite uso comercial y modificación, pero conviene conservar el aviso de copyright y verificar las condiciones del modelo base intfloat/multilingual-e5-small, también MIT.
- Los benchmarks del model-index están marcados como no verificados (`verified: false`); deben tomarse como cifras declaradas por el autor, no auditadas de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gipyo123/multilingual-e5-small-labor
- Dataset de entrenamiento: https://huggingface.co/datasets/gipyo123/labor-embedding-data
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Repositorio de sentence-transformers: https://github.com/UKPLab/sentence-transformers
- Paper de E5 (Text Embeddings by Weakly-Supervised Contrastive Pre-training): https://arxiv.org/abs/2212.03533
