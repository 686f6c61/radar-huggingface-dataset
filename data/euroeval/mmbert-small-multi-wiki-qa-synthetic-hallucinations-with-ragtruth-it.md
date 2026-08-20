# EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-it

## Resumen

El modelo `EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-it` es un encoder transformer de tipo token classification, desarrollado por el proyecto EuroEval, que tiene como objetivo detectar alucinaciones en respuestas generadas por sistemas de retrieval-augmented generation (RAG) en italiano. Se basa en la arquitectura mmBERT (Modern Multilingual BERT), un encoder multilingüe preentrenado sobre 3 billones de tokens en más de 1800 idiomas, y ha sido ajustado con datos sintéticos de preguntas y respuestas sobre Wikipedia, utilizando el corpus RAGTruth para anotar a nivel de palabra qué tokens son fieles a las fuentes recuperadas y cuáles son alucinados.

Con 140,6 millones de parámetros, este modelo es relativamente pequeño y está diseñado para tareas de clasificación de tokens, no para generación de texto. Su relevancia radica en la creciente necesidad de verificar la fidelidad de las respuestas generadas por sistemas RAG, especialmente en entornos multilingües donde los modelos generativos pueden producir contenido no respaldado por las fuentes. Al estar especializado en italiano, cubre un hueco en la evaluación de alucinaciones para esta lengua, aunque el modelo base es multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mmBERT (Modern Multilingual BERT), encoder transformer |
| Parametros totales | 140.642.306 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Italiano (fine-tuning especifico); el modelo base mmBERT soporta mas de 1800 idiomas |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de mmBERT-small, un encoder-only transformer presentado en el articulo "mmBERT: A Modern Multilingual Encoder with Annealed Language Learning" (arXiv:2509.06888). mmBERT se preentrena sobre 3T tokens de texto multilingue en mas de 1800 lenguas, empleando una estrategia de annealed language learning que combina datos de alta y baja calidad de forma progresiva. La variante "small" reduce el numero de capas y dimensiones ocultas respecto al modelo completo, manteniendo un equilibrio entre rendimiento y coste computacional.

El ajuste fino se realizo para la tarea de token classification, concretamente para etiquetar cada token de una respuesta como fiel o alucinado en el contexto de RAG. Los datos de entrenamiento son sinteticos: se generaron pares de preguntas y respuestas a partir de articulos de Wikipedia, y se anotaron las alucinaciones utilizando el corpus RAGTruth, que proporciona anotaciones a nivel de palabra para multiples tareas dentro de entornos RAG. No se han publicado detalles sobre hiperparametros, regimen de entrenamiento ni composicion exacta del dataset.

## Capacidades

- Clasificacion de tokens para detectar alucinaciones en respuestas generadas por sistemas RAG, etiquetando cada token como fiel o no fiel a las fuentes recuperadas.
- Procesamiento de texto en italiano, con capacidad de generalizar a otros idiomas gracias al preentrenamiento multilingue de mmBERT (aunque el fine-tuning se ha realizado solo en italiano).
- Integracion sencilla con el ecosistema Hugging Face Transformers, compatible con pipelines de token-classification y con endpoints de inferencia.
- No es un modelo generativo: no produce texto, solo anota tokens existentes.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un encoder puro.

## Casos de uso

- Control de calidad en pipelines RAG en italiano: el modelo puede integrarse como modulo de verificacion posterior a la generacion, marcando los tokens que no estan respaldados por los documentos recuperados y permitiendo a un sistema de post-procesado corregir o descartar respuestas parcialmente alucinadas.
- Evaluacion automatica de sistemas de QA: en lugar de evaluar manualmente la fidelidad de las respuestas, se puede usar este modelo para medir la proporcion de tokens alucinados en un conjunto de pruebas, obteniendo una metrica objetiva y reproducible.
- Monitorizacion en produccion de asistentes virtuales: un servicio de atencion al cliente en italiano que use RAG puede emplear el modelo para detectar respuestas potencialmente incorrectas antes de enviarlas al usuario, reduciendo el riesgo de informacion falsa.
- Investigacion sobre alucinaciones en RAG: el modelo sirve como herramienta para analizar patrones de alucinacion en diferentes dominios (medicina, derecho, finanzas) cuando se dispone de corpus en italiano, ayudando a caracterizar los fallos de los generadores.
- Filtrado de datos de entrenamiento: en la creacion de datasets para entrenar modelos generativos, se puede usar el modelo para descartar ejemplos con alta tasa de alucinacion, mejorando la calidad de los datos.
- Comparacion de sistemas RAG: al aplicar el modelo a las salidas de diferentes pipelines RAG, se puede comparar objetivamente cual produce respuestas mas fieles a las fuentes, facilitando la seleccion de arquitecturas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas como F1, precision o recall sobre conjuntos de prueba estandarizados, ni comparaciones con otros detectores de alucinaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: con 140 millones de parametros, el modelo ocupa aproximadamente 560 MB en fp32 (140M x 4 bytes). En fp16 serian unos 280 MB. Cabe en cualquier GPU consumer moderna (por ejemplo, RTX 3060 con 12 GB, o incluso GPUs integradas con suficiente memoria compartida).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Para inferencia por lotes, una RTX 4090 o A10G ofreceria alto throughput, pero no es necesario.
- Tambien puede ejecutarse en CPU sin problemas, con latencias de decenas de milisegundos por secuencia corta.
- Opciones de despliegue: al ser un modelo de Transformers, se puede servir con vLLM (aunque esta pensado para generativos, soporta encoder-only), Hugging Face Inference Endpoints, ONNX Runtime, o simplemente con la libreria transformers en un script Python. No se ha confirmado compatibilidad con llama.cpp u Ollama, que estan orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles, pero para un modelo de este tamano se espera una latencia inferior a 50 ms por secuencia en GPU moderna y un throughput de cientos de secuencias por segundo en batch.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos para deteccion de alucinaciones en italiano. Existen alternativas generales como los clasificadores basados en BERT multilingue (mBERT, XLM-R) ajustados para tareas de natural language inference o fact verification, pero no hay datos publicados que permitan una comparacion directa con este modelo. Tampoco se conocen otros modelos de EuroEval con la misma tarea y idioma.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos generados a partir de Wikipedia; puede no generalizar bien a dominios especializados (medicina, legal, tecnico) donde el vocabulario y los patrones de alucinacion difieren.
- El fine-tuning se ha realizado solo en italiano; aunque el modelo base es multilingue, el rendimiento en otros idiomas no esta garantizado y probablemente sea inferior.
- No se ha publicado informacion sobre sesgos especificos, pero al ser un modelo entrenado con datos de Wikipedia, puede reflejar los sesgos presentes en esa fuente.
- Riesgo de alucinacion en la propia deteccion: el modelo puede clasificar erroneamente tokens fieles como alucinados o viceversa, especialmente en contextos ambiguos o con parafraseo complejo.
- La licencia no esta especificada, lo que genera incertidumbre sobre el uso comercial. Se recomienda contactar con los autores antes de utilizarlo en produccion.
- No se han documentado limitaciones de contexto; al ser un encoder, la longitud de secuencia esta limitada por la posicion maxima de mmBERT (tipicamente 512 tokens), lo que restringe su aplicacion a respuestas cortas o fragmentos de texto.
- El modelo no distingue entre tipos de alucinacion (intrinseca vs extrinseca) ni proporciona explicaciones, solo etiquetas binarias por token.

## Enlaces

- [HuggingFace - modelo en italiano](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-it)
- [HuggingFace - version en ingles](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-en)
- [HuggingFace - version en feroes](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-fo)
- [Paper de mmBERT (arXiv:2509.06888)](https://arxiv.org/abs/2509.06888)
- [Repositorio de RAGTruth (GitHub)](https://github.com/ParticleMedia/RAGTruth)
