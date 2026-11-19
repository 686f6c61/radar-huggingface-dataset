# mradermacher/cafebert-xnli-vi-GGUF

## Resumen

cafebert-xnli-vi-GGUF es la versión cuantizada en formato GGUF del modelo OneDayMaster2910/cafebert-xnli-vi, un encoder basado en la familia CafeBERT afinado para inferencia de lenguaje natural (NLI) en vietnamita. El modelo original se entrenó mediante full fine-tuning sobre el dataset facebook/xnli, la porción multilingüe del corpus XNLI, y este repositorio lo distribuye en múltiples niveles de cuantización para su uso con llama.cpp y herramientas compatibles. El trabajo de cuantización lo firma mradermacher, un perfil conocido en Hugging Face por publicar versiones GGUF de modelos de terceros.

Con 559.891.459 parámetros totales según los pesos en safetensors, se trata de un encoder compacto orientado a clasificación de pares de frases (entailment, neutral, contradiction), no a generación de texto. Su relevancia práctica está en que ofrece una alternativa ligera y de licencia Apache 2.0 para tareas NLI en vietnamita, un idioma con menos recursos que el inglés o el chino, y en que su empaquetado GGUF permite desplegarlo en CPU o en GPU de gama baja con un consumo de memoria inferior a 1 GB en las cuantizaciones más agresivas.

El repositorio no incluye pipeline declarado, no reporta descargas ni interacciones en el momento de la consulta y no publica resultados de benchmarks propios. La información disponible se limita a los metadatos del modelo base, la lista de cuantizaciones generadas y las referencias genéricas de mradermacher sobre el uso de GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | encoder transformer (familia CafeBERT, derivada de BERT) |
| Parametros totales | 559.891.459 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | vietnamita (vi) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base OneDayMaster2910/cafebert-xnli-vi es un encoder de la familia CafeBERT, una adaptación de BERT preentrenada con corpus en vietnamita. Sobre esa base se aplicó un full fine-tuning para la tarea de inferencia de lenguaje natural, usando el dataset facebook/xnli como fuente de entrenamiento. XNLI es la extensión multilingüe de MultiNLI con 15 idiomas, entre ellos el vietnamita, y proporciona pares de premisa e hipótesis etiquetados como entailment, neutral o contradiction. La model card del modelo base no detalla el número de tokens de entrenamiento, la composición exacta del subconjunto utilizado ni si se aplicaron técnicas de regularización o ajuste de hiperparámetros específicas.

La contribución de este repositorio es exclusivamente de cuantización: mradermacher convierte los pesos del modelo base a formato GGUF con la herramienta estándar y genera 12 variantes estáticas, desde Q2_K (0,4 GB) hasta f16 (1,2 GB). La model card indica que no se han publicado cuantizaciones ponderadas con imatrix para este modelo y que no hay planes inmediatos de generarlas. No se documentan innovaciones arquitectónicas adicionales, técnicas de atención lineal, decodificación especulativa ni procesos de RLHF o DPO, algo esperable en un encoder de clasificación.

## Capacidades

- Clasificación de pares de frases para NLI en vietnamita: determina si una hipótesis se sigue de una premisa (entailment), la contradice (contradiction) o es neutral.
- Extracción de features: el tag feature-extraction sugiere que los embeddings del encoder pueden reutilizarse para tareas descendentes como similitud semántica o clustering.
- Inferencia en CPU y GPU de gama baja gracias al formato GGUF y a los tamaños reducidos de las cuantizaciones.
- No soporta generación de texto libre, tool calling, function calling ni razonamiento multi-paso: es un modelo discriminativo, no generativo.
- No dispone de modo thinking, visión, audio ni capacidades multimodales.
- Cobertura monolingüe: únicamente vietnamita, sin capacidades multilingües declaradas.

## Casos de uso

- Moderación de contenido y verificación de afirmaciones en vietnamita: dado un par (premisa, hipótesis), el modelo clasifica la relación lógica y permite filtrar textos que contradicen una fuente de referencia en pipelines de fact-checking.
- Búsqueda semántica y reranking en vietnamita: los embeddings del encoder pueden alimentar un sistema de recuperación de documentos donde el reranking NLI descarte pasajes que no respaldan la consulta del usuario.
- Detección de contradicciones en bases de conocimiento: al comparar pares de artículos o fichas en vietnamita, el modelo señala inconsistencias entre fuentes antes de consolidarlas.
- Evaluación automática de resúmenes: se comprueba si cada frase del resumen se sigue del documento original, una aplicación clásica de NLI con pares (documento, frase del resumen).
- Anotación asistida de datasets en vietnamita: el modelo preetiqueta pares de frases en proyectos de anotación, reduciendo el coste de revisión manual en corpus de bajo recurso.
- Clasificación de respuestas en sistemas de preguntas y respuestas: se valida si una respuesta candidata está respaldada por el contexto recuperado, descartando respuestas alucinadas antes de mostrarlas al usuario.
- Despliegue en entornos con recursos limitados: con cuantizaciones Q4_K_M de aproximadamente 0,5 GB, puede ejecutarse en dispositivos de borde o en contenedores sin GPU dedicada para tareas de clasificación por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del repositorio GGUF ni los metadatos del modelo base incluyen métricas de precisión en XNLI, F1, accuracy ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en todas las cuantizaciones; Q2_K ocupa 0,4 GB, Q4_K_M alrededor de 0,5 GB, Q8_0 unos 0,7 GB y f16 aproximadamente 1,2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria libre es suficiente; una RTX 3060, RTX 4060 o incluso una GTX 1650 cubren el modelo con holgura. Para lotes grandes conviene una GPU con más memoria, como A100 o H100, aunque el modelo no las aprovecha por su tamaño reducido.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF. El modelo base puede servirse con transformers y, si se convierte, con Text Generation Inference o vLLM, aunque al ser un encoder de clasificación el soporte en esos servidores es limitado.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera una latencia de milisegundos por par de frases en CPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| cafebert-xnli-vi-GGUF (este) | 559,9 M | no disponible | vi | apache-2.0 | GGUF |
| OneDayMaster2910/cafebert-xnli-vi (base) | 559,9 M | no disponible | vi | apache-2.0 | safetensors |
| XLM-RoBERTa-base (referencia multilingüe) | 278 M | 512 tokens | 100 idiomas | MIT | safetensors, GGUF |
| mDeBERTa-v3-base (referencia multilingüe) | 278 M | 512 tokens | 100 idiomas | MIT | safetensors |

La comparación con XLM-RoBERTa-base y mDeBERTa-v3-base es orientativa: son encoders multilingües de tamaño comparable que cubren el vietnamita entre sus idiomas, pero no se dispone de métricas NLI publicadas para este modelo que permitan una comparación cuantitativa directa. No se han identificado en la información disponible otros modelos GGUF específicos de NLI en vietnamita con los que contrastarlo.

## Limitaciones y advertencias

- Modelo monolingüe: solo cubre vietnamita; su uso con textos en otros idiomas producirá resultados poco fiables.
- Tarea restringida: es un clasificador NLI, no un modelo generativo; no debe emplearse para chat, resúmenes, código ni razonamiento abierto.
- Riesgo de sesgo: el fine-tuning sobre XNLI hereda los sesgos del corpus, que puede sobrerrepresentar ciertos dominios y estilos de escritura; no se documentan análisis de sesgo.
- Riesgo de alucinación: limitado en el sentido generativo, pero el clasificador puede asignar etiquetas erróneas con alta confianza en pares ambiguos o con negaciones complejas.
- Longitud de contexto no documentada: se desconoce el máximo de tokens por par de frases, lo que dificulta planificar su uso con textos largos.
- Cuantizaciones agresivas: Q2_K y Q3_K_M pueden degradar la precisión de clasificación; la model card recomienda Q4_K_S o Q4_K_M como equilibrio entre velocidad y calidad, y Q8_0 para máxima fidelidad.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset facebook/xnli, que puede tener términos propios.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento que respalde su adopción en producción frente a alternativas multilingües.
- Repositorio con cero descargas y cero interacciones: no hay validación comunitaria del funcionamiento de las cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/cafebert-xnli-vi-GGUF
- Modelo base: https://huggingface.co/OneDayMaster2910/cafebert-xnli-vi
- Página de descargas de mradermacher para este modelo: https://hf.tst.eu/model#cafebert-xnli-vi-GGUF
- Perfil de mradermacher: https://huggingface.co/mradermacher
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Dataset de entrenamiento: https://huggingface.co/datasets/facebook/xnli
- Guía de uso de GGUF de TheBloke (referenciada en la model card): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
