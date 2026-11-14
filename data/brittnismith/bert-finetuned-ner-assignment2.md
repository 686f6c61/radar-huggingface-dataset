# brittnismith/bert-finetuned-ner-assignment2

## Resumen

`brittnismith/bert-finetuned-ner-assignment2` es un modelo de clasificación de tokens (token classification) obtenido mediante fine-tuning de `google-bert/bert-base-cased` sobre una tarea de reconocimiento de entidades nombradas (NER). Lo publica el usuario brittnismith en Hugging Face, aparentemente en el contexto de una asignación académica (el sufijo "assignment2" del identificador lo sugiere). El modelo resuelve la extracción de entidades en texto: personas, organizaciones, localizaciones, materiales, artefactos y especies, con etiquetas en formato BIO.

Arquitectura: BERT base en su variante cased, un transformer encoder de 12 capas y 768 dimensiones ocultas. Cuenta con 107.729.677 parámetros totales y un tamaño de repositorio de 2,6 GB, lo que incluye pesos en safetensors y artefactos del entrenador. La longitud de contexto heredada es de 512 tokens, el máximo de BERT.

Su relevancia es limitada y de nicho: no es un modelo de producción, sino un artefacto de fine-tuning con métricas modestas (F1 global de 0,585 en el conjunto de evaluación) y una model card generada automáticamente que deja sin documentar la descripción, los usos previstos y los datos de entrenamiento. Resulta útil como referencia de pipeline de fine-tuning para NER o como ejemplo didáctico, no como extractor de entidades listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, variante cased) |
| Parametros totales | 107.729.677 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de bert-base-cased) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes GGUF/ONNX en el repo) |
| Idiomas soportados | no disponible (el modelo base es multilingue en inglés principalmente; la model card no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `google-bert/bert-base-cased`, un transformer encoder de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con una cabeza de clasificación de tokens superpuesta para etiquetado BIO. La tarea es token classification con seis tipos de entidad (Art, Con, Loc, Mat, Per, Spe) más la etiqueta O.

El entrenamiento se realizó con el `Trainer` de Hugging Face durante 3 épocas, con learning rate 5e-05, batch size de 8 (entrenamiento y evaluación), semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, y scheduler lineal. La model card no especifica el dataset utilizado ("on the None dataset"), el número de tokens de entrenamiento, la composición del corpus ni si hubo técnicas de alineación (RLHF/DPO). No se documentan innovaciones técnicas adicionales: es un fine-tuning estándar sin decodificación especulativa, atención lineal ni mecanismos híbridos.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en formato BIO con seis categorías: Art (artefacto), Con (concepto), Loc (localización), Mat (material), Per (persona) y Spe (especie).
- Clasificación de tokens a nivel de palabra, con etiquetas B- e I- para entidades multi-token.
- Extracción de entidades en texto en inglés, dado el modelo base cased.
- No soporta tool calling ni function calling: es un modelo encoder de clasificación, no generativo.
- No soporta agentes ni razonamiento multi-step.
- No dispone de modo thinking, visión, audio ni capacidades multimodales.
- Capacidades multilingües no declaradas; el modelo base cased está orientado a inglés.

## Casos de uso

- Extracción de entidades en pipelines de NLP académicos: el modelo puede integrarse en un `pipeline("token-classification")` de transformers para etiquetar corpus de investigación, aprovechando su formato estándar y su licencia permisiva.
- Prototipado rápido de NER: sirve como punto de partida para comparar arquitecturas de fine-tuning en cursos o asignaciones, dado que incluye curvas de entrenamiento y métricas por clase en la model card.
- Anonimización parcial de textos: las etiquetas Per y Loc permiten localizar nombres de personas y lugares para su sustitución en documentos, aunque el recall de Per (0,828) y Loc (0,711) limita la cobertura.
- Indexación semántica de documentos: extraer organizaciones (Con) y localizaciones (Loc) para construir metadatos de búsqueda, con la advertencia de que el F1 de Con es solo 0,415.
- Etiquetado asistido en anotación manual: el modelo puede pre-anotar entidades para que un humano las revise, reduciendo el esfuerzo en la creación de datasets NER.
- Evaluación comparativa de fine-tunings: al publicar métricas detalladas por clase y por época, permite analizar el efecto del número de épocas y del desbalanceo de clases en tareas NER.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluación (model-index sin entradas; los datos provienen de la model card):

| Metrica | Valor |
|---|---|
| Loss (evaluación) | 0,2401 |
| Overall Precision | 0,512 |
| Overall Recall | 0,682 |
| Overall F1 | 0,585 |
| Overall Accuracy | 0,946 |
| F1 Per | 0,758 |
| F1 Loc | 0,691 |
| F1 Art | 0,493 |
| F1 Spe | 0,460 |
| F1 Con | 0,415 |
| F1 Mat | 0,380 |

Desglose por etiqueta BIO (F1): B-per 0,854; I-per 0,809; B-loc 0,781; I-loc 0,826; B-spe 0,588; B-art 0,593; I-art 0,531; B-con 0,474; I-con 0,461; B-mat 0,442; I-mat 0,261; O 0,975. Macro avg F1 0,642; weighted avg F1 0,947. La accuracy global de 0,946 está inflada por la clase O, que representa 20.705 de los 22.931 tokens de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,43 GB solo para pesos (107,7 M de parámetros × 4 bytes), más overhead de activaciones y tokenizer; en la práctica, menos de 2 GB en fp32 y menos de 1 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en T4, RTX 3060, RTX 4090, A100 y H100 sin problemas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para lotes pequeños.
- Opciones de despliegue: `transformers` con `pipeline("token-classification")`, TorchServe, o exportación a ONNX para inferencia optimizada. No se incluyen pesos GGUF en el repositorio, por lo que llama.cpp/Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles en la información proporcionada; para un BERT base en GPU moderna se espera un throughput del orden de cientos de secuencias por segundo con batch size moderado, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | F1 reportado | Licencia |
|---|---|---|---|---|---|
| brittnismith/bert-finetuned-ner-assignment2 | 107,7 M | 512 | NER (6 clases) | 0,585 (overall) | apache-2.0 |
| dslim/bert-base-NER | 107,7 M | 512 | NER (4 clases: PER, ORG, LOC, MISC) | no disponible en esta ficha | MIT |
| google-bert/bert-base-cased | 108 M | 512 | Modelo base (MLM) | no aplica | apache-2.0 |

La comparación directa con `dslim/bert-base-NER` es la más pertinente por tamaño y tarea, pero no se dispone de sus métricas en la información proporcionada para contrastar el F1. El modelo aquí descrito emplea un esquema de etiquetas distinto (seis clases frente a las cuatro habituales) y presenta un rendimiento claramente inferior al esperable en un NER de producción, con F1 macro de 0,642 y clases como Mat con F1 0,380.

## Limitaciones y advertencias

- Rendimiento modesto: F1 global de 0,585 y F1 macro de 0,642; clases como Mat (0,380) y Con (0,415) son poco fiables.
- La accuracy de 0,946 es engañosa por el fuerte desbalanceo hacia la clase O (90,3 % de los tokens).
- Model card incompleta: no se documenta el dataset de entrenamiento, los usos previstos ni las limitaciones declaradas por el autor.
- Idioma: no se declaran idiomas soportados; el modelo base cased está orientado a inglés, por lo que el rendimiento en castellano no está garantizado.
- Contexto limitado a 512 tokens, insuficiente para documentos largos sin fragmentación.
- Riesgo de alucinación no aplica en sentido generativo (es un clasificador), pero sí de falsos positivos y negativos en la extracción de entidades.
- Sesgos: no documentados; al derivar de bert-base-cased, puede heredar sesgos del corpus original (BooksCorpus y Wikipedia en inglés).
- Licencia apache-2.0 permisiva para uso comercial, pero la falta de métricas robustas y de documentación desaconseja su uso en producción sin una reevaluación previa.
- Origen académico ("assignment2"): no hay evidencia de validación externa ni mantenimiento del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/brittnismith/bert-finetuned-ner-assignment2
- Modelo base: https://huggingface.co/google-bert/bert-base-cased
- Referencia alternativa de NER (misma arquitectura): https://huggingface.co/dslim/bert-base-NER
