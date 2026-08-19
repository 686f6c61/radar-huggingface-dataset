# lil-lab/CoLMLM-Fact-Span-Annotator

## Resumen

CoLMLM-Fact-Span-Annotator es un modelo de clasificación de tokens desarrollado por el laboratorio lil-lab como parte del proyecto Co-LMLM (Continuous-Query Limited Memory Language Models). Su función es detectar y marcar automáticamente los fragmentos de texto que contienen hechos objetivos (fechas, lugares, cifras, logros, etc.) mediante etiquetado BIO (begin, inside, outside). Este anotador se utiliza para construir los corpus de entrenamiento de los modelos Co-LMLM, que aprenden a responder consultas continuas sobre documentos con memoria limitada.

El problema que resuelve es el coste prohibitivo de anotar corpus a escala de preentrenamiento con modelos frontera de gran tamaño. En lugar de usar un LLM de última generación para marcar cada span de hecho, este modelo destila esa capacidad en un clasificador basado en ModernBERT-large, mucho más ligero y rápido. Así, la primera etapa de la pipeline de anotación puede ejecutarse sobre millones de documentos de forma eficiente.

El modelo está construido sobre el encoder ModernBERT-large de AnswerDotAI, con una cabeza de clasificación de tres etiquetas (O, B, I). Tiene aproximadamente 395 millones de parámetros, se entrena con secuencias de 4096 tokens (aunque el backbone soporta hasta 8192) y se distribuye con licencia MIT. Es un componente clave del ecosistema Co-LMLM, que también incluye un generador de preguntas y un recuperador basado en SmolLM2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (encoder transformer) con cabeza de clasificacion de tokens BIO |
| Parametros totales | 395.834.371 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens (entrenamiento); 8192 tokens (soporte del backbone) |
| Tipos de cuantizacion | no disponible (solo se distribuye en bfloat16) |
| Idiomas soportados | no disponible (el modelo base ModernBERT esta entrenado principalmente con ingles, pero no se especifica para este anotador) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer bidireccional basado en ModernBERT-large, una arquitectura moderna que incorpora atencion con sesgo de posicion rotatorio (RoPE), normalizacion pre-RMS y un diseno optimizado para secuencias largas. Sobre la capa de salida del encoder se anade una cabeza de clasificacion lineal que asigna a cada token una de tres etiquetas: O (fuera de un hecho), B (comienzo de un span de hecho) o I (dentro de un span de hecho). El entrenamiento se realiza en precision bfloat16.

El proceso de entrenamiento consiste en destilar las anotaciones de spans de hechos producidas por un LLM frontera (en la version original se utilizo Gemini para crear el conjunto semilla). El modelo aprende a replicar esas marcas sobre texto plano, de modo que puede etiquetar corpus completos sin necesidad de consultar al LLM grande. La secuencia de entrenamiento es de 4096 tokens, lo que permite capturar hechos en parrafos extensos. No se ha publicado informacion detallada sobre el volumen de datos ni sobre el uso de tecnicas como RLHF o DPO; el entrenamiento es puramente supervisado sobre las etiquetas BIO.

## Capacidades

- Deteccion de spans de hechos en texto: identifica fragmentos que contienen informacion objetiva y verificable (fechas, lugares, cifras, nombres propios, logros, etc.).
- Etiquetado BIO por token: produce una secuencia de etiquetas O/B/I que permite reconstruir los limites exactos de cada span.
- Procesamiento de secuencias largas: soporta hasta 4096 tokens en entrenamiento y 8192 en el backbone, adecuado para documentos y parrafos extensos.
- Integracion en pipelines de anotacion: disenado como primera etapa de un sistema de dos fases, junto con el generador de preguntas CoLMLM-Question-Generator.
- Inferencia rapida y ligera: al ser un encoder de 395M parametros, es mucho mas eficiente que un LLM generativo para la tarea de anotacion.
- No es un modelo generativo: no produce texto, solo clasifica tokens. Tampoco soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Construccion de corpus de entrenamiento para Co-LMLM: el uso principal. El modelo etiqueta millones de documentos con spans de hechos, que luego se convierten en pares de pregunta-respuesta mediante el generador de preguntas. Es adecuado porque su velocidad permite procesar corpus a escala de preentrenamiento.
- Extraccion de hechos para sistemas RAG (generacion aumentada por recuperacion): se puede utilizar para preprocesar documentos y marcar las secciones que contienen informacion factual, mejorando la precision de los recuperadores.
- Anotacion automatica de datasets para evaluacion de modelos: permite crear conjuntos de validacion con spans de hechos etiquetados, utiles para medir la fidelidad factual de modelos generativos.
- Preprocesamiento para generacion de preguntas: al marcar los spans, se puede alimentar un generador de preguntas (como el CoLMLM-Question-Generator) para producir preguntas y respuestas parafraseadas de forma automatica.
- Analisis de contenido periodistico o cientifico: detecta automaticamente las afirmaciones factuales en articulos, lo que facilita tareas de verificacion de datos o resumen orientado a hechos.
- Filtrado de texto para entrenamiento de LLMs: se puede usar para separar contenido factual de opinion o ficcion, ayudando a construir datasets mas equilibrados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo se presenta como una herramienta de anotacion y no se comparan metricas como MMLU, HumanEval o GSM8K, ya que no es un modelo generativo. Tampoco se ofrecen cifras de precision, recall o F1 sobre conjuntos de anotacion de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: con 395M parametros en bfloat16, el peso del modelo ocupa aproximadamente 790 MB. Con el tokenizador y los buffers de activacion, se puede ejecutar con menos de 2 GB de VRAM para secuencias de 4096 tokens.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente. Modelos como RTX 3060, RTX 4060, RTX 4090, A10, A100 o H100 funcionan sin problemas. Tambien es viable en CPU para lotes pequenos.
- Compatibilidad con GPUs de consumo: si, cabe en cualquier GPU consumer moderna, incluso en las de gama de entrada.
- Opciones de despliegue: se puede cargar con la libreria transformers de HuggingFace, tanto en Python como en pipelines de inferencia. Tambien es compatible con ONNX Runtime y TensorRT para optimizacion. No se menciona soporte explicito para vLLM, llama.cpp u Ollama, ya que es un encoder y no un modelo generativo.
- Latencia y throughput: al ser un encoder, la inferencia es muy rapida. En una GPU moderna, puede procesar miles de tokens por segundo, aunque no se han publicado cifras exactas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tarea principal |
|---|---|---|---|---|
| CoLMLM-Fact-Span-Annotator | 395M | 4096 (entrenamiento) / 8192 (backbone) | MIT | Anotacion de spans de hechos (BIO) |
| BERT-large (uncased) | 340M | 512 | Apache 2.0 | Clasificacion de tokens, NER, etc. |
| RoBERTa-large | 355M | 512 | MIT | Clasificacion de tokens, NER, etc. |
| ModernBERT-large (base) | 395M | 8192 | Apache 2.0 | Encoder general, clasificacion, NER |

La comparativa se centra en encoders de tamano similar. CoLMLM-Fact-Span-Annotator se diferencia por su contexto mucho mas largo (4096/8192 frente a 512 de BERT/RoBERTa) y por estar especializado en la tarea de deteccion de hechos, mientras que los otros son modelos generales que requieren fine-tuning. Su licencia MIT es mas permisiva que la Apache 2.0 de RoBERTa y ModernBERT. No se dispone de datos de rendimiento comparativo en tareas de anotacion de hechos.

## Limitaciones y advertencias

- Sesgos del modelo base: al estar construido sobre ModernBERT-large, puede heredar sesgos presentes en sus datos de preentrenamiento, especialmente en cuanto a representacion de ciertos grupos o temas.
- Riesgo de alucinacion en la anotacion: aunque el modelo no genera texto, puede marcar como hechos fragmentos que no lo son, o dejar de marcar hechos reales. La calidad depende de la distribucion de los datos de entrenamiento.
- Limitaciones de idioma: no se especifican los idiomas soportados. Si el modelo base esta entrenado principalmente en ingles, su rendimiento en otros idiomas puede ser deficiente.
- No es un modelo generativo: no puede producir preguntas ni respuestas; solo etiqueta spans. Para una pipeline completa se necesita el generador de preguntas complementario.
- Contexto limitado a 4096 tokens en la practica: aunque el backbone soporta 8192, el entrenamiento se realizo con 4096, por lo que el rendimiento en secuencias mas largas puede degradarse.
- Restricciones de uso comercial: la licencia MIT permite uso comercial sin restricciones, pero se recomienda revisar la licencia del modelo base (ModernBERT-large, Apache 2.0) y la del paper asociado.
- Dependencia de la pipeline Co-LMLM: el modelo esta disenado para un flujo especifico; su uso aislado puede requerir adaptaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lil-lab/CoLMLM-Fact-Span-Annotator
- Repositorio de codigo (GitHub): https://github.com/lil-lab/Co-LMLM
- Paper en arXiv: https://arxiv.org/abs/2607.07707
- Version HTML del paper: https://arxiv.org/html/2607.07707v1
- Coleccion Co-LMLM en HuggingFace: https://huggingface.co/collections/lil-lab/co-lmlm
- Modelo base ModernBERT-large: https://huggingface.co/answerdotai/ModernBERT-large
- Generador de preguntas CoLMLM: https://huggingface.co/lil-lab/CoLMLM-Question-Generator
