# FacebookAI/roberta-large

## Resumen
RoBERTa-large es un modelo de lenguaje de tipo transformer encoder-only, preentrenado en inglés con el objetivo de masked language modeling (MLM), desarrollado por Facebook AI (actualmente Meta AI) y publicado originalmente en 2019 junto con el paper arXiv:1907.11692. Se trata de una versión optimizada del preentrenamiento de BERT: mismo esqueleto arquitectónico, pero con más datos, lotes más grandes, eliminación de la tarea de predicción de la siguiente frase y enmascaramiento dinámico. En el repositorio de Hugging Face ocupa la referencia FacebookAI/roberta-large y cuenta con 355.412.571 parámetros y licencia MIT.

El modelo no está pensado para generar texto, sino para producir representaciones contextuales bidireccionales que se reutilizan mediante fine-tuning en tareas discriminativas: clasificación de secuencias, etiquetado de tokens, question answering extractivo o reranking. Es una pieza clásica en pipelines de NLP en producción por su robustez, su coste de inferencia bajo y su amplia adopción: más de 6 millones de descargas y 335 likes en Hugging Face, con conversiones a PyTorch, TensorFlow, JAX y ONNX.

Su relevancia actual es doble: por un lado sigue siendo una línea base fiable para tareas de comprensión del lenguaje en inglés con presupuestos de cómputo reducidos; por otro, se emplea habitualmente como cross-encoder en sistemas de recuperación aumentada (RAG) para reranking de documentos y como extractor de características en clasificadores ligeros. El modelo es sensible a mayúsculas y minúsculas y su idioma de trabajo es exclusivamente el inglés.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only bidireccional (familia BERT) con objetivo de masked language modeling (MLM) |
| Parámetros totales | 355.412.571 (dato de los pesos safetensors del repositorio) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el paper original (arXiv:1907.11692) especifica 512 tokens de entrada |
| Tipos de cuantización | no hay cuantizaciones oficiales en el repositorio; existen conversiones comunitarias a GGUF y ONNX de terceros |
| Idiomas soportados | inglés (etiqueta `en`) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch (bin), TensorFlow, JAX/Flax y ONNX |

## Arquitectura y entrenamiento
RoBERTa-large es un transformer encoder-only con atención bidireccional completa. El preentrenamiento es autocontrolado sobre texto sin etiquetar: se enmascara un 15 % de los tokens de entrada y el modelo debe predecirlos usando el contexto a izquierda y derecha, lo que da lugar a representaciones contextuales del idioma. La model card indica explícitamente que el modelo fue preentrenado sobre datos en inglés en modo self-supervised y que se distribuye como modelo base para fine-tuning, no como modelo generativo.

Respecto a los datos, la model card etiqueta los corpus `bookcorpus` y `wikipedia`, pero la sección de datos de entrenamiento aparece truncada en la información disponible y no detalla composición ni número total de tokens. El paper referenciado en el repositorio (arXiv:1907.11692) describe la unión de cinco corpus de gran escala; no se dispone del desglose exacto en la información proporcionada. No consta en la información disponible que se aplicasen etapas de RLHF o DPO, algo coherente con un modelo encoder-only de comprensión y con su fecha de publicación.

## Capacidades
- Comprensión bidireccional del inglés: representaciones contextuales útiles para clasificación de secuencias y de tokens.
- Rellenado de máscaras (fill-mask): predice el token enmascarado con una distribución de probabilidad, como se muestra en los ejemplos de la model card.
- Extracción de características: uso del modelo sin cabeza de tarea para generar embeddings de frase o de token.
- Base para fine-tuning en clasificación de secuencias, etiquetado de tokens, question answering extractivo y clasificación de pares de frases.
- Funciona como codificador en arquitecturas cross-encoder para puntuar pares (consulta, documento).
- Multilingüismo: no soportado; solo inglés.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado de forma nativa (no es un modelo generativo ni sigue instrucciones).
- Visión, audio o modo "thinking": no soportados.
- Compatibilidad de despliegue: etiquetas de `endpoints_compatible`, `deploy:sagemaker` y `deploy:azure` en el repositorio.

## Casos de uso
- Clasificación de textos en producción: fine-tuning con una capa lineal sobre el token `[CLS]` para sentimiento, intención, spam o categorización de tickets; el modelo cabe en GPU de consumo y su latencia es baja para secuencias de hasta 512 tokens.
- Reconocimiento de entidades nombradas (NER): etiquetado token a token en formato BIO sobre documentación técnica en inglés, con buen rendimiento en dominios cercanos al corpus de preentrenamiento.
- Question answering extractivo: localización del span de respuesta en documentación, manuales o bases de conocimiento en inglés, siguiendo el esquema clásico de SQuAD.
- Reranking en pipelines RAG: uso como cross-encoder que puntúa pares (consulta, fragmento) para reordenar los candidatos devueltos por un retriever vectorial; 355 M de parámetros permiten evaluar decenas de pares por consulta sin un coste prohibitivo.
- Moderación de contenido y detección de discurso de odio: clasificador fine-tuneado sobre los embeddings del modelo, con la advertencia de que los sesgos del preentrenamiento pueden trasladarse a la tarea.
- Extracción de información estructurada: detección de campos (fechas, importes, cláusulas) en contratos o facturas en inglés mediante etiquetado de tokens.
- Búsqueda semántica y deduplicación: generación de embeddings de frase para agrupar documentos similares o detectar parafraseo mediante clasificación de pares.
- Análisis de encuestas y opiniones: clasificación multi-etiqueta de respuestas abiertas en inglés, con reentrenamiento periódico sobre datos propios.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye tablas de MMLU, GLUE, SQuAD ni métricas equivalentes, y los resultados de búsqueda web devueltos no contienen información sobre el modelo. El paper original (arXiv:1907.11692) es la fuente donde deben consultarse las cifras oficiales.

## Requisitos de hardware
- Peso de los parámetros: aproximadamente 1,42 GB en FP32, 0,71 GB en FP16/BF16 y 0,36 GB en INT8 (cálculo a partir de 355,4 M de parámetros, no son cifras publicadas por el autor).
- Inferencia: cabe holgadamente en GPU de consumo con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 3060) y en GPUs de datacenter tipo T4, L4, A10G, A100 o H100. Con batch pequeño y FP16 el consumo típico se mantiene por debajo de 2 GB.
- Fine-tuning: con Adam en FP32 se requiere aproximadamente 4 veces el tamaño de los parámetros solo para estados del optimizador (unos 5,7 GB adicionales), más activaciones. Se recomienda GPU con 12-16 GB o más (RTX 3060 12 GB, RTX 4090, A10G, A100) o bien optimizadores de memoria reducida (8-bit Adam, Adafactor) o LoRA.
- La ventana de 512 tokens limita el pico de memoria de activaciones frente a modelos de contexto largo.
- Opciones de despliegue: transformers con PyTorch, TensorFlow o Flax; ONNX Runtime (hay pesos ONNX en el repositorio); TorchServe, NVIDIA Triton o FastAPI con batching propio; integración con Amazon SageMaker y Azure según las etiquetas del repositorio. Existen conversiones GGUF comunitarias que permiten ejecutarlo con llama.cpp u Ollama, aunque su uso como modelo no generativo es limitado.
- Latencia y throughput: no se han publicado medidas oficiales. De forma orientativa, en una GPU moderna la inferencia de una secuencia de 512 tokens en FP16 se sitúa en el orden de decenas de milisegundos, pero esta cifra no está verificada en la información disponible y debe medirse en el entorno objetivo.
- Tamaño del repositorio: 31,1 GB, debido a que incluye pesos en varios frameworks. Conviene descargar únicamente el formato necesario.

## Comparativa con modelos similares
Datos de las fichas públicas de cada modelo; conviene verificarlos en el repositorio correspondiente antes de tomar decisiones.

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| RoBERTa-large | 355,4 M | 512 tokens según el paper | MIT | inglés | Encoder-only, muy adoptado, ecosistema amplio de versiones fine-tuneadas |
| BERT-large (cased) | ~340 M | 512 tokens | Apache 2.0 | inglés (multilingüe en variantes) | Predecesor directo; menor rendimiento en las mismas tareas tras el ajuste de RoBERTa |
| DeBERTa-v3-large | ~435 M | 512 tokens | MIT | inglés | Atención desenredada y ELECTRA-style; sus autores reportan mejoras sobre RoBERTa-large en benchmarks de comprensión, a costa de más parámetros |
| XLNet-large | ~340 M | 512 tokens | Apache 2.0 | inglés | Entrenamiento autorregresivo permutacional; menos utilizado hoy en producción |

## Limitaciones y advertencias
- Solo inglés: no hay soporte multilingüe ni entrenamiento en castellano.
- Sesgos documentados: la propia model card muestra que ante "The man worked as a ___" y "The woman worked as a ___" el modelo asigna profesiones estereotipadas según el género. Estos sesgos se propagan a cualquier versión fine-tuneada.
- No es un modelo generativo: no sirve para generación de texto libre, diálogo, seguimiento de instrucciones, tool calling ni flujos de agente. Para esas tareas hay que usar modelos autorregresivos.
- Riesgo de predicciones incorrectas o estereotipadas en fill-mask: la salida es la distribución más probable según el corpus, sin verificación factual ni mecanismo de abstención.
- Límite de contexto de 512 tokens según el paper original: los documentos largos deben truncarse o dividirse en fragmentos, lo que puede romper dependencias de largo alcance.
- Sensibilidad a mayúsculas y minúsculas: el tokenizador distingue "english" de "English", y el modelo está entrenado con texto tal cual, sin normalización.
- Licencia MIT: permite uso comercial, modificación y redistribución siempre que se conserve el aviso de copyright y el texto de licencia. El modelo se entrega "tal cual", sin garantías.
- Datos de preentrenamiento sin filtrar procedentes de internet: pueden introducir contenido sesgado, tóxico o con posibles implicaciones legales según el uso.
- La model card oficial no fue escrita por los autores originales, sino por el equipo de Hugging Face, y la sección de datos de entrenamiento aparece truncada.
- No hay métricas de evaluación publicadas en el repositorio: cualquier decisión de adopción debería basarse en una validación propia en el dominio de destino.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/FacebookAI/roberta-large
- Paper de RoBERTa: https://arxiv.org/abs/1907.11692
- Referencia adicional incluida en las etiquetas del repositorio: https://arxiv.org/abs/1806.02847
- Repositorio fairseq con los ejemplos de RoBERTa: https://github.com/pytorch/fairseq/tree/master/examples/roberta
- Modelos derivados de RoBERTa en el hub: https://huggingface.co/models?filter=roberta
- Búsqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos corresponden a portales de empleo de TotalEnergies y no guardan relación con RoBERTa.
