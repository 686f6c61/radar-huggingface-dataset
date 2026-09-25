# antipula388/bert-finetuned-ner

## Resumen

bert-finetuned-ner es un modelo de clasificación de tokens (reconocimiento de entidades nombradas, NER) publicado por el usuario antipula388 en HuggingFace. Se trata de un ajuste fino del modelo de embeddings BAAI/bge-small-en-v1.5, un encoder tipo BERT de 33.215.625 parámetros, sobre un conjunto de datos que el autor no identifica en la model card. El resultado es un modelo denso, pequeño y de propósito específico, orientado a etiquetar secuencias de texto en inglés, no a generar texto.

El ajuste se realizó con el Trainer de HuggingFace durante 3 épocas, con una tasa de aprendizaje de 2e-05, tamaño de lote de 16 y semilla 42, alcanzando en el conjunto de evaluación una F1 de 0,8996, una precisión de 0,8811, un recall de 0,9189 y una exactitud de 0,9801. El repositorio ocupa 1,2 GB e incluye pesos en formato safetensors bajo licencia MIT, lo que permite uso comercial sin restricciones adicionales.

Su relevancia práctica no viene del rendimiento bruto, sino del coste: con 33 millones de parámetros cabe en CPU y en cualquier GPU de consumo, y sirve como componente de extracción de entidades dentro de pipelines mayores de búsqueda, RAG o análisis documental. Ahora bien, la ausencia de documentación sobre el dataset de entrenamiento, el esquema de etiquetas y los idiomas soportados limita seriamente su uso directo en producción sin una validación previa por parte del equipo que lo adopte. El modelo registra 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (heredada de BAAI/bge-small-en-v1.5): 12 capas, dimensión oculta 384, 12 cabezas de atención |
| Parametros totales | 33.215.625 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (heredada del modelo base; no declarada explícitamente en la model card) |
| Tipos de cuantizacion | no disponible. Solo se publican pesos en precisión completa (safetensors); no hay versiones GGUF, ONNX ni cuantizadas publicadas |
| Idiomas soportados | no disponible. El modelo base es monolingüe en inglés, pero el autor no declara idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con transformers); el repositorio también incluye artefactos de TensorBoard |
| Pipeline | token-classification |
| Modelo base | BAAI/bge-small-en-v1.5 |
| Dataset de entrenamiento | no disponible ("unknown dataset" en la model card) |
| Fecha de creacion | 2026-09-25 |
| Ultima actualizacion | 2026-09-25 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde íntegramente al modelo base BAAI/bge-small-en-v1.5, un encoder transformer de tipo BERT con 12 capas, dimensión oculta de 384 y 12 cabezas de atención, del que se conserva el cuerpo del encoder y se sustituye la cabeza por una capa de clasificación de tokens. El modelo base fue entrenado originalmente para generar embeddings de frases, por lo que el ajuste lo reorienta hacia una tarea discriminativa secuencia a secuencia. El resultado tiene 33.215.625 parámetros, coherente con un encoder de la familia small.

El entrenamiento se realizó con 3 épocas completas, learning rate lineal de 2e-05, tamaño de lote de 16 tanto en entrenamiento como en evaluación, optimizador AdamW (betas 0,9 y 0,999, epsilon 1e-08), semilla 42 y scheduler lineal. Se completaron 1.878 pasos (626 por época), lo que con lotes de 16 implica del orden de 10.000 ejemplos por época y unas 30.000 muestras procesadas en total, aunque esta cifra es una estimación derivada del número de pasos y no un dato declarado por el autor. No se documenta ninguna técnica de RLHF, DPO ni decodificación especulativa: es un ajuste supervisado clásico de clasificación de tokens. Las versiones de framework empleadas fueron Transformers 4.50.0, PyTorch 2.10.0+cu128, Datasets 5.0.0 y Tokenizers 0.21.4.

## Capacidades

- Clasificación de tokens para reconocimiento de entidades nombradas (NER) en texto, devolviendo etiquetas BIO por token.
- Procesamiento de secuencias de hasta 512 tokens por pasada, sin ventana deslizante nativa.
- Extracción de entidades a partir de las etiquetas aprendidas durante el ajuste; el conjunto concreto de etiquetas (por ejemplo, PER, ORG, LOC, MISC) no está documentado en la model card.
- Compatible con la infraestructura estándar de transformers: `pipeline("token-classification")` y `AutoModelForTokenClassification`.
- Marcado como `endpoints_compatible`, por lo que puede desplegarse en Inference Endpoints de HuggingFace.
- No soporta generación de texto, ya que es un encoder de clasificación.
- No soporta tool calling, function calling ni uso como agente.
- No dispone de modo de razonamiento (thinking mode), visión, audio ni multimodalidad.
- Capacidades multilingües: no acreditadas. El modelo base es monolingüe en inglés y no hay evidencia de entrenamiento en otros idiomas.

## Casos de uso

- Extracción de entidades en documentos en inglés: el modelo puede etiquetar nombres de personas, organizaciones y lugares en artículos, contratos o informes, integrándose en un pipeline de `transformers` con lotes de 16 ejemplos y secuencias de hasta 512 tokens.
- Anonimización de datos personales: si el esquema de etiquetas aprendido incluye personas u organizaciones, el modelo puede usarse como primera pasada para localizar y enmascarar información identificativa antes de almacenar logs o textos.
- Enriquecimiento de índices de búsqueda: las entidades detectadas pueden añadirse como metadatos filtrables en un motor de búsqueda o en una base vectorial, mejorando la precisión de las consultas estructuradas.
- Construcción de grafos de conocimiento: las entidades extraídas sirven como nodos iniciales que después se enlazan mediante un modelo de extracción de relaciones, en un flujo de dos etapas típico de NLP industrial.
- Clasificación y enrutado de tickets de soporte: las entidades de cada incidencia (producto, cliente, ubicación) permiten asignar automáticamente el ticket al equipo correspondiente.
- Etiquetado asistido y anotación semiautomática: el modelo puede preanotar corpus para que anotadores humanos corrijan, reduciendo el coste de creación de datasets propios siempre que el esquema de etiquetas coincida con el aprendido.
- Procesamiento por lotes a gran escala: al requerir menos de 1 GB de memoria en inferencia, permite procesar millones de documentos en CPU o en GPU de gama baja con un coste por documento muy reducido.
- Componente de preprocesado en sistemas RAG: la extracción de entidades antes de la fase de recuperación permite aplicar filtros por entidad y mejorar la precisión del contexto recuperado.

## Benchmarks y rendimiento

Los únicos datos disponibles son los resultados del conjunto de evaluación declarados por el autor durante el entrenamiento. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, CoNLL-2003 u otros) en la información disponible, ni el model-index contiene entradas.

| Epoca | Paso | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1,0 | 626 | 0,0899 | 0,8697 | 0,9106 | 0,8897 | 0,9791 |
| 2,0 | 1252 | 0,0834 | 0,8775 | 0,9123 | 0,8946 | 0,9798 |
| 3,0 | 1878 | 0,0814 | 0,8811 | 0,9189 | 0,8996 | 0,9801 |

La progresión es monotónica en todas las métricas a lo largo de las tres épocas, sin señales de sobreajuste dentro del rango evaluado. La exactitud de 0,9801 está inflada por el desbalance habitual de las tareas NER, donde la mayoría de tokens pertenecen a la clase "O"; la métrica relevante es la F1 de 0,8996. Estos valores no son comparables con los de otros modelos porque el autor no especifica el dataset de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,13 GB en FP32, 0,07 GB en FP16/BF16 y 0,03 GB en INT8 para los pesos. Con activaciones y lotes pequeños, el consumo real se mantiene por debajo de 1 GB.
- GPU recomendadas: no requiere GPU de datacenter. Una NVIDIA T4, L4 o cualquier RTX moderna es más que suficiente. A100 y H100 están sobredimensionadas para este modelo.
- GPU de consumo: cabe sin problema en cualquier GPU con 2 GB o más de VRAM (GTX 1650, RTX 3060, RTX 4090). También funciona en CPU con latencias aceptables para uso por lotes.
- Opciones de despliegue: `transformers` con `pipeline("token-classification")`, ONNX Runtime tras exportación manual, Text Generation Inference (TGI, con soporte para modelos de clasificación), TorchServe o FastAPI con PyTorch. vLLM no es la vía habitual para un encoder de 33 M de parámetros. No hay GGUF publicado, por lo que llama.cpp y Ollama requerirían una conversión previa y la definición manual de la cabeza de clasificación.
- Latencia y throughput: no disponible. No se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

No hay datos de benchmarks comparables, ya que el autor no documenta el conjunto de evaluación. La comparación se limita a características objetivas y verificables.

| Modelo | Parametros | Contexto | Tarea | Licencia | F1 declarada |
|---|---|---|---|---|---|
| antipula388/bert-finetuned-ner | 33,2 M | 512 | NER (token-classification) | MIT | 0,8996 (conjunto de evaluación no especificado) |
| dslim/bert-base-NER | ~110 M | 512 | NER (token-classification) | MIT | no disponible en esta ficha |
| BAAI/bge-small-en-v1.5 | 33,2 M | 512 | Embeddings de frases | MIT | no aplica (no es un modelo NER) |

Frente a alternativas como dslim/bert-base-NER, este modelo triplica menos parámetros y por tanto es más barato de servir, pero carece de la documentación de dataset y esquema de etiquetas que sí acompaña a los modelos NER de referencia. Frente a su modelo base, la diferencia es de propósito: bge-small-en-v1.5 genera representaciones vectoriales, mientras que este ajuste produce etiquetas por token.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica explícitamente "unknown dataset", por lo que no se puede saber qué entidades reconoce ni con qué distribución de dominios.
- Esquema de etiquetas no documentado: se desconoce el conjunto exacto de etiquetas (BIO/BILOU, tipos de entidad) que el modelo predice, lo que impide usarlo a ciegas en producción.
- Idiomas no especificados: el modelo base es monolingüe en inglés, por lo que el rendimiento en castellano u otros idiomas es, como mínimo, dudoso y no está acreditado.
- Riesgo de alucinación de entidades: como todo modelo NER, puede etiquetar como entidad fragmentos que no lo son, especialmente en fronteras de tokens y en textos fuera de dominio.
- Límite de contexto de 512 tokens: los documentos más largos deben trocearse, con el riesgo de partir entidades en los bordes de cada fragmento.
- Métricas no verificables: los valores de F1, precisión y recall proceden de un conjunto de evaluación cuyo origen no se detalla, y no se han validado de forma independiente.
- Señal de adopción nula: 0 descargas y 0 likes. No hay evidencia de que el modelo haya sido probado por terceros.
- Metadatos con fechas no convencionales: la fecha de creación declarada (2026-09-25) es posterior a la de la mayoría de los modelos publicados, lo que conviene verificar antes de integrarlo en cualquier catálogo automatizado.
- Licencia MIT: permite uso comercial, modificación y redistribución sin restricciones, siempre que se conserve el aviso de copyright y la licencia. No hay cláusulas de uso aceptable adicionales.
- Ausencia de cuantizaciones publicadas: cualquier despliegue en formatos ligeros (GGUF, ONNX, INT8) requiere conversión y validación por parte del usuario.
- Cabeza de clasificación sin garantías de calibración: las probabilidades devueltas por el modelo no se han evaluado, por lo que no conviene fijar umbrales de confianza sin un análisis previo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/antipula388/bert-finetuned-ner
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Paper o blog del modelo: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
