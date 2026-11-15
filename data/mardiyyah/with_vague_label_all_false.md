# Mardiyyah/with_vague_label_all_false

## Resumen

`Mardiyyah/with_vague_label_all_false` es un modelo de clasificación de tokens (token classification, esquema IOB) derivado por fine-tuning de `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext`, el encoder BERT-base especializado en literatura biomédica de Microsoft. El modelo se ha entrenado sobre el dataset `OTAR3088/CeLLaTe_with_vague1.0_IOB` y está pensado para el reconocimiento de entidades nombradas (NER) en textos biomédicos en inglés, presumiblemente orientado a la detección de menciones de entidades celulares dentro del corpus CeLLaTe.

Se trata de un modelo pequeño (108.897.031 parámetros, arquitectura BERT-base con 12 capas y dimensión oculta 768) empaquetado en safetensors con un tamaño de repositorio de 0,4 GB. No es un modelo generativo: no produce texto libre, sino etiquetas BIO por token, por lo que su uso está acotado a pipelines de extracción de información, anotación automática y enriquecimiento de corpus científicos.

Su relevancia es limitada y muy específica: se publica como artefacto de investigación con licencia Apache 2.0, sin descargas ni interacciones, y con una model card autogenerada por el Trainer de Hugging Face en la que el propio autor deja secciones sin completar ("More information needed"). Los resultados declarados en evaluación (micro F1 de 0,6548, exactitud de 0,9777) deben interpretarse con cautela por el fuerte desbalance de clases típico de las tareas IOB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base (transformer encoder bidireccional), fine-tuning para token classification |
| Parametros totales | 108.897.031 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BiomedBERT-base admite 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion dinamica estandar de PyTorch, no documentada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un BERT-base estándar (encoder transformer de 12 capas, 768 dimensiones ocultas, 12 cabezas de atención) inicializado desde BiomedBERT-base-uncased-abstract-fulltext, un checkpoint de Microsoft preentrenado sobre resúmenes y textos completos de PubMed. Sobre esa base se ha añadido una cabeza de clasificación de tokens y se ha realizado fine-tuning supervisado sobre el dataset `OTAR3088/CeLLaTe_with_vague1.0_IOB`, anotado en formato IOB. No se documenta ningún tipo de alineación adicional (RLHF, DPO) ni innovación arquitectónica: es un fine-tuning convencional de clasificación.

Los hiperparámetros declarados son: learning rate 2e-5, batch size de entrenamiento 16 con acumulación de gradientes de 2 (batch efectivo 32), optimizador AdamW (betas 0,9/0,999, epsilon 1e-8), scheduler lineal con warmup ratio de 0,01, 20 épocas y precisión mixta nativa (AMP). El entrenamiento se ejecutó con Transformers 4.48.2, PyTorch 2.4.1+cu121, Datasets 3.0.2 y Tokenizers 0.21.0, con semilla 3407. La tabla de entrenamiento publicada solo cubre 8 épocas (hasta el step 2104), aunque se configuraron 20; no se documenta el número de tokens de entrenamiento ni la composición exacta del dataset más allá de su identificador.

## Capacidades

- Clasificación de tokens con esquema IOB para reconocimiento de entidades nombradas en texto biomédico en inglés.
- Etiquetado a nivel de token de menciones de entidades (presumiblemente entidades celulares, dado el corpus CeLLaTe), con etiquetas de frontera B/I/O.
- Procesamiento de documentos científicos y resúmenes biomédicos (dominio de BiomedBERT).
- Inferencia por secuencia completa con la cabeza de clasificación; salida de logits por token y por etiqueta.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No soporta visión, audio ni modo "thinking".
- Capacidad multilingüe: únicamente inglés.

## Casos de uso

- Anotación automática de corpus biomédicos: el modelo etiqueta tokens con el esquema IOB y puede usarse para preanotar grandes volúmenes de resúmenes de PubMed antes de la revisión humana, reduciendo el coste de anotación manual en proyectos de NER.
- Extracción de menciones celulares en literatura científica: dado el corpus de entrenamiento (CeLLaTe), es adecuado para localizar y delimitar menciones de tipos celulares en textos de biología y biomedicina, alimentando bases de datos de entidades.
- Enriquecimiento de pipelines de minería de texto: integrado como etapa de token classification dentro de un pipeline de Transformers, permite añadir capas de entidades a índices de búsqueda o sistemas de recuperación de información científica.
- Construcción de datasets de entrenamiento: las predicciones del modelo pueden servir como etiquetas débiles (weak supervision) para entrenar modelos posteriores o para ampliar el propio corpus CeLLaTe.
- Normalización y enlace de entidades: las menciones extraídas pueden pasarse a una etapa posterior de entity linking contra ontologías celulares (CL, Cell Ontology) para construir grafos de conocimiento biomédicos.
- Investigación en NER biomédico: como baseline reproducible con licencia Apache 2.0 y pesos abiertos, sirve para comparar arquitecturas o estrategias de anotación en tareas de token classification sobre dominios especializados.
- Despliegue ligero en CPU: con 108,9 M de parámetros y 0,4 GB de pesos, puede ejecutarse en entornos sin GPU para procesamiento por lotes de documentos, a costa de menor throughput.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en la model card sobre el conjunto de evaluación (no se especifica el split exacto ni el tamaño). El model-index oficial no contiene resultados (`results: []`).

| Metrica | Valor (epoca 5, mejor checkpoint declarado) |
|---|---|
| Loss (evaluacion) | 0,0983 |
| Precision | 0,6577 |
| Recall | 0,6520 |
| Micro F1 | 0,6548 |
| Weighted F1 | 0,6551 |
| Macro F1 | 0,6531 |
| Accuracy | 0,9777 |

Evolución declarada durante el entrenamiento (extracto):

| Epoca | Step | Validation loss | Precision | Recall | Micro F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1.0 | 263 | 0,0894 | 0,5972 | 0,5962 | 0,5967 | 0,9745 |
| 3.0 | 789 | 0,0832 | 0,6312 | 0,6520 | 0,6414 | 0,9768 |
| 5.0 | 1315 | 0,0975 | 0,6577 | 0,6520 | 0,6548 | 0,9777 |
| 7.0 | 1841 | 0,1136 | 0,6616 | 0,6512 | 0,6564 | 0,9770 |
| 8.0 | 2104 | 0,1337 | 0,6857 | 0,6135 | 0,6476 | 0,9764 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo para pesos (108,9 M × 4 bytes), más activaciones; en la práctica, menos de 2 GB para secuencias de hasta 512 tokens con batch pequeño.
- VRAM estimada en fp16/bf16: alrededor de 0,22 GB para pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Para throughput alto, cualquier GPU moderna sirve (RTX 3060, RTX 4090, A100, H100); el cuello de botella será el preprocesado y el tamaño de batch, no la memoria.
- Cabe en GPU consumer: sí, en cualquier GPU con 2 GB o más de VRAM, e incluso en CPU.
- Opciones de despliegue: `transformers` con `AutoModelForTokenClassification` y `pipeline("token-classification")`; exportación a ONNX Runtime para inferencia en CPU; integración en servicios con FastAPI o similar. No hay evidencia de soporte específico en vLLM, llama.cpp, Ollama o TGI (son frameworks orientados a generación, no a token classification).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mardiyyah/with_vague_label_all_false | 108,9 M | no disponible (base BERT: 512) | Token classification (IOB) biomédico | Apache 2.0 | Hugging Face, 0 descargas |
| microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext | ~110 M | 512 | Masked LM / base para fine-tuning | MIT (modelo base de Microsoft) | Hugging Face, ampliamente usado |
| BERT-base-uncased (Google) | ~110 M | 512 | Masked LM / base para fine-tuning | Apache 2.0 | Hugging Face, muy usado |
| Modelos NER biomédicos tipo BioBERT fine-tuned | ~110 M | 512 | NER biomédico | variable según checkpoint | Hugging Face, múltiples variantes |

La comparación cuantitativa de rendimiento con alternativas no está disponible: el autor no publica comparaciones y el model-index está vacío. Frente a su modelo base, la diferencia es la cabeza de clasificación y el fine-tuning sobre CeLLaTe; frente a otros NER biomédicos, no hay datos que permitan establecer una jerarquía.

## Limitaciones y advertencias

- Model card incompleta: las secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" contienen literalmente "More information needed", por lo que no hay guía oficial de uso previsto ni de limitaciones.
- Riesgo de sobreajuste: la loss de validación baja hasta la época 1 (0,0894) y sube progresivamente hasta 0,1337 en la época 8, mientras la loss de entrenamiento cae de 0,3528 a 0,0092; el checkpoint declarado como mejor (época 5) no es necesariamente el óptimo global.
- Métricas engañosas por desbalance: una exactitud de 0,9777 con micro F1 de 0,6548 sugiere un fuerte predominio de la etiqueta O; la precisión y el recall reales sobre entidades son moderados (~0,65) y pueden degradarse en dominios distintos al corpus de entrenamiento.
- Sesgos: no documentados por el autor; al derivar de literatura biomédica en inglés, hereda los sesgos de dominio y de composición de PubMed y del corpus CeLLaTe.
- Alucinación: no aplica en sentido generativo (no produce texto libre), pero sí puede producir falsos positivos y fronteras de entidad incorrectas.
- Limitación de idioma: solo inglés; no se ha validado en castellano ni en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero conviene verificar la licencia del dataset de entrenamiento (`OTAR3088/CeLLaTe_with_vague1.0_IOB`) y del modelo base antes de un despliegue comercial.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin validación externa ni réplica de resultados; no debe considerarse un modelo listo para producción sin evaluación propia.
- Nombre del modelo ("with_vague_label_all_false") sugiere un experimento de ablación sobre etiquetas vagas, no un checkpoint final depurado; tratarlo como artefacto de investigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mardiyyah/with_vague_label_all_false
- Modelo base: https://huggingface.co/microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext
- Dataset de entrenamiento: https://huggingface.co/datasets/OTAR3088/CeLLaTe_with_vague1.0_IOB
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Paper de BiomedBERT (Microsoft): no disponible en la información proporcionada
- Demo o espacio asociado: no disponible en la información proporcionada
