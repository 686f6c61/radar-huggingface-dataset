# ErtasAI/qmsum-locator-minilm-l6-w900

## Resumen

El modelo `ErtasAI/qmsum-locator-minilm-l6-w900` es un cross-encoder de reranking desarrollado por Ertas AI, diseñado como componente de localización (stage-1) en un pipeline de dos etapas "localizar y resumir" para resumen de reuniones centrado en consultas (query-focused meeting summarization) sobre el dataset QMSum. Su función es puntuar ventanas fijas de 900 palabras de una transcripción de reunión frente a una consulta, para después empaquetar las ventanas mejor puntuadas y pasarlas al adaptador de resumen `ErtasAI/qmsum-summarizer-lfm2.5-1.2b-lora`.

Se basa en el modelo `cross-encoder/ms-marco-MiniLM-L-6-v2` (22,7 millones de parámetros, Apache 2.0) y se entrenó con relevancia binaria sobre los spans dorados del split de entrenamiento de QMSum. Este modelo corresponde a la configuración "protocol-exact" del pipeline, que declara ventanas de 900 palabras aunque la arquitectura solo lee 512 tokens, lo que provoca un truncamiento deliberado en el 97,3% de las ventanas. Es relevante porque documenta de forma transparente un artefacto de evaluación congelado antes de descubrirse la limitación, y sirve como referencia para comparar configuraciones alternativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder Transformer (MiniLM-L6, 6 capas, 384 dimensiones de embedding) |
| Parametros totales | 22.713.601 (22,7 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (del modelo base); las ventanas de 900 palabras se truncan a ~512 tokens en inferencia |
| Tipos de cuantizacion | No disponible (solo safetensors FP32) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en MiniLM-L6, una variante compacta de BERT con 6 capas y 384 dimensiones ocultas. A diferencia de los bi-encoders, el cross-encoder procesa el par (consulta, ventana) como una única secuencia concatenada, lo que permite una interacción completa entre ambos textos y produce una puntuación de relevancia no normalizada (logit). La salida es un único valor escalar con `num_labels=1` en la cabeza de clasificación.

El entrenamiento se realizó sobre pares consulta-ventana construidos a partir de los spans dorados del split de entrenamiento de QMSum: una ventana se considera positiva si solapa un span dorado. Se usaron 2 épocas, batch de 32, 100 pasos de warmup y una semilla fija (20260723) definida en el protocolo congelado. El coste de entrenamiento fue de aproximadamente 1,5 minutos en una NVIDIA RTX 5070 Ti con un pico de 2,82 GB de VRAM. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado con etiquetas binarias.

## Capacidades

- Puntuación de relevancia consulta-ventana: dado un par (consulta, texto de ventana), devuelve un logit no normalizado que indica la relevancia de la ventana para la consulta.
- Reranking de ventanas: ordena ventanas de transcripción por relevancia para seleccionar las más informativas.
- Integración en pipeline de resumen: funciona como etapa de localización previa a un modelo generativo de resumen.
- Procesamiento de transcripciones de reuniones en inglés: entrenado y evaluado en los tres dominios de QMSum (académico, diseño de producto y comité parlamentario).
- Compatible con `sentence-transformers` CrossEncoder y con `text-embeddings-inference` (TEI) para despliegue en endpoints.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un componente de ranking puro.

## Casos de uso

- Resumen de reuniones centrado en consultas: el modelo localiza los pasajes relevantes de una transcripción larga para que un modelo generativo produzca un resumen enfocado en la pregunta del usuario.
- Búsqueda de información en actas y transcripciones: permite encontrar los fragmentos que responden a una consulta específica dentro de documentos extensos de reuniones.
- Sistemas de preguntas y respuestas sobre reuniones: como etapa de recuperación, selecciona las ventanas que contienen la evidencia necesaria para responder.
- Preprocesamiento para modelos de contexto limitado: al reducir una transcripción de miles de palabras a un presupuesto de 3.000 palabras, facilita el uso de modelos generativos con ventanas pequeñas.
- Análisis de reuniones parlamentarias o de comités: útil para extraer discusiones relevantes sobre temas concretos en actas oficiales.
- Benchmarking de pipelines de resumen extractivo-abstractivo: sirve como referencia reproducible para comparar configuraciones de localización y resumen en QMSum.

## Benchmarks y rendimiento

El modelo se evaluó en el split de test oficial de QMSum (n=281) con decodificación greedy y un único scorer congelado. Los resultados corresponden a la configuración "protocol-exact" (ventanas de 900 palabras, presupuesto de 3.000 palabras) y se comparan con la configuración promovida que usa el hermano L12 con ventanas de 375 palabras y presupuesto de 2.000 palabras.

| Configuracion | Locator | Presupuesto | ROUGE-1 | ROUGE-2 | ROUGE-L | ROUGE-Lsum | BERTScore |
|---|---|---|---|---|---|---|---|
| Protocol-exact (este modelo) | MiniLM L6, 900 palabras | 3.000 palabras | 33,39 | 10,65 | 22,83 | 29,30 | 0,8680 |
| Promovida (deviating) | MiniLM L12, 375 palabras | 2.000 palabras | 35,41 | 12,28 | 24,63 | 31,36 | 0,8733 |

La diferencia entre ambas filas no es demostrablemente robusta al reseed del entrenamiento (el rango de semillas del summarizer en este benchmark es de 1,59 puntos de ROUGE-1). No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- Inferencia muy ligera: 22,7 M de parámetros, aproximadamente 90 MB en FP32 y 45 MB en FP16.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en CPU con razonable latencia.
- El entrenamiento se realizó en una RTX 5070 Ti con 2,82 GB de VRAM pico, por lo que cualquier GPU con más de 4 GB puede fine-tuning.
- Despliegue compatible con `sentence-transformers` (Python), Hugging Face Inference Endpoints, y `text-embeddings-inference` (TEI) según los tags del repositorio.
- Para el pipeline completo (locator + summarizer de 1,2B), se necesitaría una GPU con al menos 8-12 GB de VRAM para el summarizer en cuantización ligera.
- Latencia estimada: al ser un cross-encoder de 6 capas, cada par consulta-ventana se procesa en milisegundos en GPU; en CPU puede ser de decenas de milisegundos por par.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ROUGE-1 (QMSum) | Licencia | Notas |
|---|---|---|---|---|---|
| `ErtasAI/qmsum-locator-minilm-l6-w900` (este) | 22,7 M | 512 tokens (ventanas de 900 palabras truncadas) | 33,39 | Apache 2.0 | Configuración protocol-exact, truncamiento deliberado |
| `ErtasAI/qmsum-locator-minilm-l12-w375` | ~33 M (estimado) | 512 tokens (ventanas de 375 palabras que caben) | 35,41 | Apache 2.0 | Configuración promovida, sin truncamiento |
| `cross-encoder/ms-marco-MiniLM-L-6-v2` (base) | 22,7 M | 512 tokens | No evaluado en QMSum | Apache 2.0 | Modelo base sin fine-tuning específico |

La comparativa directa con otros cross-encoders de reranking (p.ej. `cross-encoder/ms-marco-MiniLM-L-12-v2`) no está disponible en la información proporcionada, ya que no se han publicado resultados de estos modelos en QMSum.

## Limitaciones y advertencias

- Truncamiento severo: con ventanas de 900 palabras, la arquitectura de 512 tokens solo lee aproximadamente la primera mitad de cada ventana (media del 47,7% del contenido; el 97,3% de las ventanas se truncan). Esto degrada la calidad de la puntuación y es un artefacto conocido y documentado.
- Dominio limitado: entrenado y evaluado exclusivamente en transcripciones de reuniones en inglés de los tres dominios de QMSum (académico, diseño de producto, comité parlamentario). Otros tipos de documento no están probados.
- Relevancia subjetiva: la etiqueta de relevancia se define como solapamiento con los spans dorados de QMSum, que reflejan los criterios de anotación del dataset y pueden no generalizar a otras definiciones de relevancia.
- Puntuaciones no normalizadas: los logits de salida solo son comparables dentro de una misma consulta; no son calibrados entre consultas.
- Sin soporte multilingüe: solo inglés.
- No apto para tareas generativas: es un componente de ranking, no un modelo de lenguaje generativo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo hereda las limitaciones del dataset QMSum (que tiene su propia licencia de investigación; verificar términos antes de uso comercial).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ErtasAI/qmsum-locator-minilm-l6-w900
- Modelo hermano promovido (L12, 375 palabras): https://huggingface.co/ErtasAI/qmsum-locator-minilm-l12-w375
- Adaptador de resumen asociado: https://huggingface.co/ErtasAI/qmsum-summarizer-lfm2.5-1.2b-lora
- Repositorio GitHub del pipeline: https://github.com/ErtasAI/qmsum-locate-then-summarize
- Código del locator cross-encoder: https://github.com/ErtasAI/qmsum-locate-then-summarize/blob/main/pipeline/locator_crossencoder.py
- Modelo base: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L-6-v2
