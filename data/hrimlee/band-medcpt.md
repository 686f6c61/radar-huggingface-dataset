# hrimlee/BAND-MedCPT

## Resumen

BAND-MedCPT es un encoder de recuperación (retrieval encoder) preentrenado y "debiased" publicado por el usuario hrimlee como parte de BAND (Bias-Aware Neutral Debiasing), un marco de trabajo para mitigar el sesgo demográfico en la recuperación de evidencia dentro de sistemas de question answering médico aumentados por recuperación (RAG). El problema que aborda es concreto: cuando se perturba la demografía de una pregunta clínica (por ejemplo, la etnia mencionada en el enunciado) sin cambiar el contenido clínico, los sistemas de recuperación densa tienden a devolver evidencia distinta, lo que degrada la consistencia y la equidad de las respuestas. BAND trata de que el espacio de representaciones del encoder sea menos sensible a esas perturbaciones.

El modelo se presenta como el encoder preentrenado utilizado dentro del framework BAND y está aceptado en el GroundLM Workshop de EMNLP 2026. Es un modelo pequeño: 109.482.240 parámetros en safetensors (unos 0,4 GB de repositorio), con pipeline `feature-extraction` y etiqueta `bert`, lo que lo sitúa en la familia de encoders tipo BERT-base. No genera texto: produce embeddings para búsqueda densa.

Su relevancia ahora es fundamentalmente de investigación: cubre un nicho poco atendido (equidad demográfica en recuperación biomédica) y publica artefactos reproducibles (pesos, dataset BAND-MedQA y repositorio de código). Conviene subrayar que el autor lo declara explícitamente como uso de investigación y no validado para toma de decisiones clínicas, y que el repositorio no tiene descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder tipo transformer BERT (etiqueta `bert` en el repositorio); el autor no especifica la arquitectura base exacta ni el número de capas o dimensión oculta |
| Parámetros totales | 109.482.240 (~109,5 M) según safetensors |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; los pesos se publican en safetensors y el tamaño del repositorio (0,4 GB) es compatible con fp32, pero el autor no documenta variantes cuantizadas |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimensión del embedding | No disponible |
| Pipeline | `feature-extraction` |
| Uso previsto | Recuperación densa en RAG médico; investigación en debiasing de representaciones |

## Arquitectura y entrenamiento

La información disponible identifica el modelo como un encoder BERT de unos 109 M de parámetros destinado a `feature-extraction`. El autor no detalla en la model card el número de capas, la dimensión oculta, la longitud máxima de secuencia ni el corpus exacto de preentrenamiento. El identificador del repositorio y la etiqueta `medcpt` apuntan a que el punto de partida es un encoder del linaje MedCPT (orientado a recuperación biomédica), pero esa filiación no se afirma de forma explícita en la documentación publicada, por lo que debe tratarse como una inferencia y no como un dato confirmado.

El aspecto diferencial no es la arquitectura, sino el procedimiento de debiasing: BAND (Bias-Aware Neutral Debiasing) se define como un framework de "retrieval debiasing" que busca reducir el desplazamiento de la recuperación inducido por atributos demográficos, de modo que la evidencia recuperada dependa de la pregunta clínica y no de la demografía del paciente descrito. La evaluación asociada se realiza sobre MedQA con perturbaciones de etnia y mide exactitud de respuesta, brecha de paridad demográfica, tasa de cambio de predicción, consistencia de recuperación y métricas de evidencia basadas en palabras clave demográficas. El trabajo se apoya en RAG² (Sohn et al., 2025), *Rationale-guided Retrieval Augmented Generation for Medical Question Answering*, según los agradecimientos de la model card. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset de preentrenamiento ni si hubo etapas de RLHF o DPO (poco probables en un encoder de este tipo).

## Capacidades

- Generación de embeddings de frases o pasajes para recuperación densa en dominio biomédico (pipeline `feature-extraction`).
- Recuperación de evidencia orientada a pipelines de RAG médico, con el objetivo de que la evidencia sea estable frente a perturbaciones demográficas del enunciado.
- Capacidad de servir como encoder dentro del framework BAND (indexado de corpus + búsqueda + reranking), según el repositorio oficial.
- Evaluación de robustez demográfica: el modelo está pensado para medir consistencia de recuperación, paridad demográfica y tasa de cambio de predicción en configuraciones perturbadas.
- Compatibilidad declarada con Text Embeddings Inference (`text-embeddings-inference`, `endpoints_compatible` en las etiquetas del repositorio).
- Multilingüismo: no. El modelo declara únicamente inglés.
- Tool calling / function calling: no. No es un modelo generativo ni soporta plantillas de herramientas.
- Agentes y razonamiento multi-paso: no de forma nativa; puede formar parte de un pipeline agéntico únicamente como componente de recuperación.
- Capacidades especiales: no dispone de modo "thinking", visión ni audio.

## Casos de uso

- Recuperación de evidencia en un sistema RAG médico: el encoder indexa un corpus de literatura o guías clínicas y devuelve pasajes relevantes para una pregunta; su interés específico es que la selección de evidencia no cambie cuando se altera la etnia descrita en el enunciado.
- Auditoría de sesgo en sistemas de recuperación existentes: comparar los pasajes devueltos por este encoder frente a un encoder no debiased sobre el mismo conjunto de preguntas perturbadas, usando consistencia de recuperación y solapamiento de evidencia como métricas.
- Construcción de índices vectoriales de literatura biomédica: generar embeddings por pasaje para un índice aproximado (FAISS, HNSW) y servirlos con Text Embeddings Inference; el tamaño del modelo (~110 M de parámetros, 0,4 GB) permite reindexar corpus medianos con recursos modestos.
- Investigación en debiasing de representaciones: usar los pesos como inicialización o como referencia ("baseline debiased") en experimentos de fine-tuning con objetivos de invariancia demográfica.
- Reproducción del experimento del paper: emparejar este encoder con el dataset BAND-MedQA y el código del repositorio para replicar la evaluación sobre MedQA con perturbaciones de etnia.
- Filtrado o reranking de candidatos en QA médico: reordenar los k pasajes recuperados por un sistema de primera etapa y comprobar si el orden es estable entre variantes demográficas de la misma pregunta.
- Evaluación comparativa de frameworks de RAG médico: emplear este encoder como componente fijo y variar el generador para aislar el efecto de la recuperación en la exactitud y en la brecha de paridad.
- Docencia y experimentación académica: modelo pequeño que cabe en cualquier GPU de consumo o incluso en CPU, útil para prácticas sobre sesgo y recuperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente qué métricas se evalúan, sin cifras:

| Métrica evaluada | Conjunto de evaluación | Resultado |
|---|---|---|
| Answer accuracy | MedQA con perturbaciones de etnia | No disponible en la información proporcionada |
| Demographic parity gap | MedQA con perturbaciones de etnia | No disponible en la información proporcionada |
| Prediction flip rate | MedQA con perturbaciones de etnia | No disponible en la información proporcionada |
| Retrieval consistency | MedQA con perturbaciones de etnia | No disponible en la información proporcionada |
| Métricas de evidencia basadas en palabras clave demográficas | MedQA con perturbaciones de etnia | No disponible en la información proporcionada |

El autor remite al paper y a la implementación oficial para los resultados completos.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,44 GB en fp32 (4 bytes × 109,48 M de parámetros) y ~0,22 GB en fp16. Con activaciones y batches pequeños, un despliegue realista cabe por debajo de 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria sirve; el modelo no requiere A100 ni H100. Para servir con throughput alto interesa una GPU moderna de gama media (por ejemplo, L4, A10 o RTX 4090) más por paralelismo de peticiones que por tamaño del modelo.
- GPU de consumo: sí. Cabe en cualquier RTX (incluidas series 20/30/40 de gama baja), en iGPU con suficiente memoria compartida y, con latencias mayores, en CPU.
- Opciones de despliegue: `transformers` (librería declarada); Text Embeddings Inference (etiqueta `text-embeddings-inference` y `endpoints_compatible`); contenedores de Inference Endpoints de Hugging Face. El autor no documenta soporte explícito de llama.cpp, Ollama, vLLM o TGI, y al ser un encoder (no un modelo generativo) el encaje natural es un servidor de embeddings.
- Latencia y throughput: no disponible. No se han publicado mediciones. Como referencia de orden de magnitud, un encoder de ~110 M de parámetros en fp16 sobre GPU moderna procesa decenas o cientos de pares por segundo con batches moderados, pero esta cifra es una estimación por tamaño y no un dato del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BAND-MedCPT | ~109,5 M | No disponible | Encoder de recuperación biomédica con debiasing demográfico | Apache 2.0 | Hugging Face (0 descargas, 0 likes en la consulta) |
| MedCPT-Article-Encoder (NCBI) | ~109 M (tamaño comparable; no verificado en la información disponible) | No disponible | Recuperación biomédica densa sin tratamiento explícito de sesgo demográfico | No disponible en la información proporcionada | Hugging Face, ampliamente utilizado |
| PubMedBERT / BiomedBERT | ~110 M | No disponible en la información proporcionada | Encoder de lenguaje biomédico de propósito general (no específicamente de recuperación) | No disponible en la información proporcionada | Hugging Face, muy extendido |
| Encoders de embeddings generalistas tipo BGE-base | ~110 M | No disponible en la información proporcionada | Embeddings generales multilingües o en inglés, sin especialización médica | No disponible en la información proporcionada | Hugging Face |

La diferencia relevante frente a estas alternativas no es de tamaño ni de contexto, sino de objetivo: BAND-MedCPT se distribuye junto con un protocolo de evaluación de robustez demográfica (MedQA perturbado) y un dataset específico, algo que los encoders biomédicos generalistas no ofrecen. No hay datos públicos de rendimiento que permitan afirmar superioridad en exactitud de recuperación.

## Limitaciones y advertencias

- Uso previsto exclusivamente de investigación: el autor indica que el modelo no está validado para toma de decisiones clínicas y que no debe usarse como sistema de apoyo autónomo.
- Alcance del debiasing limitado: la robustez se evalúa solo frente a perturbaciones de etnia en MedQA; el propio autor advierte que ello no garantiza equidad frente a otros atributos demográficos (edad, sexo, origen socioeconómico) ni en otros contextos clínicos.
- Monolingüe: solo inglés; no hay evidencia de comportamiento en castellano ni en otras lenguas.
- Naturaleza del modelo: es un encoder de `feature-extraction`; no responde preguntas ni genera justificaciones. Cualquier uso en producción exige un generador y un orquestador externos.
- Riesgo de alucinación: no aplica directamente al encoder, pero el sistema RAG que lo use hereda el riesgo del generador; una recuperación sesgada o incompleta puede producir respuestas erróneas con apariencia de respaldo documental.
- Sesgos heredados: al derivar presumiblemente de un encoder biomédico preentrenado en literatura científica, puede arrastrar sesgos de representación del corpus original; el procedimiento BAND mitiga un tipo concreto de sesgo, no todos.
- Falta de validación externa: cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks publicados en la model card; la reproducibilidad depende del código del repositorio y del dataset BAND-MedQA.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificaciones con atribución y aviso de cambios, pero la licencia no sustituye la advertencia del autor sobre el uso clínico; para cualquier aplicación sanitaria real habría que hacer una evaluación propia.
- Documentación incompleta: no se especifican contexto máximo, dimensión de embedding, corpus de entrenamiento ni hiperparámetros, lo que dificulta anticipar su comportamiento fuera del protocolo del paper.
- Fechas del repositorio: la model card está fechada en octubre de 2026 y la publicación se anuncia para el GroundLM Workshop de EMNLP 2026; conviene comprobar si existen revisiones posteriores de los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hrimlee/BAND-MedCPT
- Repositorio de código BAND: https://github.com/hrimlee/BAND
- Dataset BAND-MedQA: https://huggingface.co/datasets/hrimlee/BAND-MedQA
- Paper (BAND: Bias-Aware Retrieval Debiasing for Demographic Robustness in Retrieval-Augmented Medical Question Answering, GroundLM Workshop @ EMNLP 2026): enlace directo no disponible en la información proporcionada
- Trabajo previo RAG² (Sohn et al., 2025): enlace no disponible en la información proporcionada
