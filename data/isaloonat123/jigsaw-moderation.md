# isaloonat123/jigsaw-moderation

## Resumen

Jigsaw-moderation es un paquete de pesos entrenados para moderación de conversaciones, publicado por el usuario isaloonat123 como material del proyecto educativo SWE015. No se trata de un modelo único, sino de una colección de cinco aproximaciones con complejidad creciente al problema de clasificación de toxicidad: un lexicón con distancia de edición, una regresión logística sobre tf-idf, una red feedforward sobre embeddings word2vec, un BERT base fine-tuneado en FP32 y su versión cuantizada a INT8. El repositorio incluye además un fichero de umbrales de decisión ajustados sobre validación.

El modelo se entrena sobre los datos del Jigsaw Toxic Comment Classification Challenge de Kaggle (2017), un corpus clásico de comentarios de Wikipedia etiquetados con seis categorías de toxicidad. La relevancia práctica es limitada: se trata de un artefacto docente con cero descargas y cero likes, sin model card técnica detallada ni resultados de evaluación publicados. Su interés reside en que ilustra el flujo completo de un pipeline de moderación, desde baselines léxicos hasta transformers cuantizados.

La arquitectura principal es un `bert-base-uncased` (110 millones de parámetros, 12 capas, 768 dimensiones ocultas) con una cabeza de clasificación multietiqueta, acompañado de una versión con cuantización dinámica INT8. El contexto máximo es de 512 tokens, herencia directa de BERT base. La licencia CC BY-SA 3.0 permite uso comercial con atribución y compartir-al-igual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (transformer encoder) fine-tuneado; además lexicón, tf-idf + regresión logística y word2vec + feedforward |
| Parametros totales | 110 millones (bert-base-uncased); no disponible para el resto de componentes |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (BERT base) |
| Tipos de cuantizacion | FP32 (bert/) e INT8 con cuantización dinámica (bert_int8/) |
| Idiomas soportados | inglés (el corpus Jigsaw es de comentarios de Wikipedia en inglés); no se declaran otros idiomas |
| Licencia | CC BY-SA 3.0 |
| Formato de pesos | safetensors (BERT), joblib (regresión logística), .pt (feedforward), .kv (word2vec), JSON (lexicón y umbrales) |

## Arquitectura y entrenamiento

El componente principal es un `bert-base-uncased` con cabeza de clasificación multietiqueta, fine-tuneado sobre el dataset del Jigsaw Toxic Comment Classification Challenge (Kaggle, 2017). Ese corpus contiene comentarios de las páginas de discusión de Wikipedia etiquetados con seis categorías: toxic, severe_toxic, obscene, threat, insult e identity_hate. No se especifican en la model card el número de épocas, la tasa de aprendizaje, el tamaño de batch ni la composición exacta del split, por lo que esos hiperparámetros deben considerarse no disponibles.

El repositorio incluye una escalera de baselines deliberadamente didáctica. El lexicón con distancia de edición captura insultos explícitos tolerando erratas; la regresión logística sobre tf-idf modela n-gramas de palabras y caracteres; la red feedforward sobre word2vec aprende representaciones densas; y el BERT fine-tuneado aporta contexto bidireccional. La versión INT8 aplica cuantización dinámica, que cuantiza pesos a 8 bits y activaciones en tiempo de ejecución, reduciendo el tamaño del modelo aproximadamente a la cuarta parte con una pérdida de precisión típicamente pequeña en clasificación. El fichero `thresholds.json` contiene umbrales de decisión por etiqueta ajustados sobre el conjunto de validación, un detalle relevante porque las seis etiquetas tienen prevalencias muy dispares y un umbral único de 0,5 suele ser subóptimo.

No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales. Tampoco se describe ninguna innovación arquitectónica: es un fine-tuning estándar de BERT para clasificación.

## Capacidades

- Clasificación de texto multietiqueta en seis categorías de toxicidad (toxic, severe_toxic, obscene, threat, insult, identity_hate).
- Detección de toxicidad léxica mediante lexicón con tolerancia a erratas por distancia de edición.
- Clasificación con n-gramas de palabras y caracteres mediante tf-idf y regresión logística.
- Clasificación con representaciones densas mediante word2vec y red feedforward.
- Clasificación contextual con BERT, incluyendo dependencia del contexto de la frase.
- Umbrales de decisión por etiqueta preajustados sobre validación.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- No tiene capacidades multimodales (visión, audio) ni modo de razonamiento explícito.
- Capacidad multilingüe: no disponible; el entrenamiento es en inglés.

## Casos de uso

- Moderación de comentarios en foros y wikis: el BERT fine-tuneado clasifica cada comentario contra las seis etiquetas de toxicidad con un umbral por etiqueta ya calibrado, lo que permite filtrar automáticamente antes de la revisión humana.
- Prefiltrado de bajo coste en pipelines de contenido: el lexicón y la regresión logística sobre tf-idf son órdenes de magnitud más rápidos que BERT y pueden descartar la mayoría del contenido limpio, reservando el transformer para los casos dudosos.
- Detección de insultos con erratas deliberadas: el lexicón con distancia de edición captura variantes ofuscadas de términos tóxicos que un diccionario exacto no detectaría.
- Despliegue en entornos con recursos limitados: la versión INT8 reduce el modelo a unos 110 MB y puede ejecutarse en CPU, adecuada para servicios modestos o edge.
- Investigación y docencia sobre pipelines de clasificación: el repositorio sirve como comparativa controlada entre cuatro familias de modelos sobre el mismo dataset.
- Análisis de toxicidad en corpus históricos: aplicar el clasificador a volcados de discusiones para cuantificar la prevalencia de cada etiqueta a lo largo del tiempo.
- Sistema de alertas para amenazas: la etiqueta `threat` con umbral ajustado permite priorizar revisiones humanas de mensajes con riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, recall, F1 ni AUC para ninguna de las cinco variantes, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para BERT FP32: aproximadamente 0,5 GB de pesos más overhead de activaciones; cómodo en cualquier GPU con 4 GB o más.
- VRAM estimada para BERT INT8: aproximadamente 0,15 GB de pesos; ejecutable en CPU sin GPU dedicada.
- GPU recomendadas: no se requieren GPU de datacenter; una RTX 3060, RTX 4090 o incluso CPU moderna son suficientes para inferencia.
- Cabe en cualquier GPU de consumo actual e incluso en Raspberry Pi para la variante INT8, con latencias de decenas de milisegundos por muestra.
- Opciones de despliegue: el repositorio está pensado para ejecutarse con `python app.py`; para BERT puede usarse Hugging Face Transformers, ONNX Runtime o TorchScript. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de este tamaño).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| isaloonat123/jigsaw-moderation | 110 M (BERT base) | 512 tokens | Clasificación de toxicidad multietiqueta | CC BY-SA 3.0 | Hugging Face, 0 descargas |
| unitary/toxic-bert | 110 M (BERT base) | 512 tokens | Clasificación de toxicidad (Jigsaw) | Apache 2.0 | Hugging Face, ampliamente usado |
| martin-ha/toxic-comment-model | 110 M (DistilBERT) | 512 tokens | Clasificación de toxicidad (Jigsaw) | Apache 2.0 | Hugging Face |
| cardiffnlp/twitter-roberta-base-offensive | 125 M (RoBERTa base) | 512 tokens | Detección de lenguaje ofensivo | MIT | Hugging Face |

La comparativa se basa en características públicas de esos modelos; no se dispone de métricas de este repositorio para comparar rendimiento numérico. Frente a las alternativas, la principal desventaja es la ausencia de evaluación publicada y de adopción comunitaria; la ventaja es la licencia CC BY-SA 3.0, más permisiva para ciertos usos que Apache 2.0 en cuanto a obligaciones de atribución, aunque impone compartir-al-igual.

## Limitaciones y advertencias

- No se han publicado métricas de evaluación; no hay evidencia cuantitativa de su calidad frente a alternativas establecidas.
- El corpus Jigsaw 2017 tiene sesgos conocidos: sobrerrepresenta ciertos registros de Wikipedia y puede penalizar términos de identidad en contextos no tóxicos (falsos positivos en `identity_hate`).
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación, especialmente con sarcasmo, ironía y lenguaje figurado.
- Entrenado únicamente en inglés; su uso en castellano u otros idiomas no está validado y probablemente degrade gravemente.
- Límite de 512 tokens: comentarios largos se truncan, perdiendo contexto.
- La licencia CC BY-SA 3.0 obliga a atribuir y a compartir las obras derivadas bajo la misma licencia; conviene revisar compatibilidad antes de integrarlo en productos propietarios.
- Repositorio con cero descargas y cero likes, sin mantenimiento aparente ni issues resueltos; no es una dependencia recomendable para producción sin validación propia.
- El proyecto es material de un curso (SWE015); no hay garantía de soporte ni de corrección de errores.

## Enlaces

- Hugging Face: https://huggingface.co/isaloonat123/jigsaw-moderation
- Repositorio del proyecto: https://github.com/isaloonat/chat-moderation
- Dataset original: https://www.kaggle.com/c/jigsaw-toxic-comment-classification-challenge
- Paper de BERT: https://arxiv.org/abs/1810.04805
