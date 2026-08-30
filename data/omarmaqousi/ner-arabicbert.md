# OmarMaqousi/ner-arabicbert

## Resumen

El modelo `OmarMaqousi/ner-arabicbert` es un sistema de reconocimiento de entidades nombradas (NER) para árabe, obtenido mediante fine-tuning del modelo `asafaya/bert-base-arabic` sobre el subconjunto árabe del dataset PAN-X de XTREME. Desarrollado por Omar Maqousi, este modelo clasifica tokens en tres tipos de entidades: personas (PER), organizaciones (ORG) y lugares (LOC), utilizando el esquema de etiquetado IOB2. Está pensado para tareas de token-classification y se distribuye bajo licencia Apache 2.0.

Con 110 millones de parámetros, sigue la arquitectura BERT-base original, lo que lo hace ligero y desplegable en entornos con recursos limitados. Su relevancia radica en ofrecer una solución específica para NER en árabe, un idioma morfológicamente rico y con menos recursos que el inglés, con un rendimiento competitivo (F1 de 0,9172 a nivel de entidad) sobre el benchmark PAN-X.ar. El modelo está disponible en formato safetensors y se puede cargar directamente con la librería Transformers de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base (Transformer encoder) |
| Parametros totales | 110.032.135 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (configuracion estandar de BERT-base) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT-base, un transformer encoder bidireccional de 12 capas, 12 cabezas de atencion y una dimension oculta de 768. El checkpoint base `asafaya/bert-base-arabic` fue preentrenado sobre un corpus arabe extenso (textos de Wikipedia, noticias y otros dominios) con el objetivo de modelar el lenguaje arabe. Sobre este checkpoint, el autor realizo un fine-tuning supervisado para la tarea de NER utilizando el dataset PAN-X.ar de XTREME, que contiene anotaciones de entidades PER, ORG y LOC en formato IOB2.

El proceso de entrenamiento consistio en ajustar todas las capas del modelo sobre el conjunto de entrenamiento de PAN-X.ar, con una particion de validacion y una particion de test estratificada del 10% de los datos. No se menciona el uso de tecnicas como RLHF o DPO, ya que se trata de un fine-tuning clasico de clasificacion de tokens. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal; el modelo sigue la arquitectura BERT estandar.

## Capacidades

- Reconocimiento de entidades nombradas en arabe: identifica personas (PER), organizaciones (ORG) y lugares (LOC) en texto arabe.
- Clasificacion de tokens a nivel de token (token-classification) con esquema IOB2, lo que permite delimitar el inicio y la continuacion de cada entidad.
- Procesamiento de texto arabe en su forma nativa, incluyendo la morfologia rica del idioma (prefijos, sufijos, diacriticos opcionales).
- Integracion sencilla con el ecosistema Hugging Face: se puede usar con `pipeline("token-classification")` o cargando el modelo y el tokenizador directamente.
- No soporta tool calling, agentes, vision ni audio; es un modelo puramente textual y especializado en NER.

## Casos de uso

- Extraccion de entidades en articulos periodisticos: el modelo puede procesar noticias en arabe para extraer automaticamente los nombres de personas, organizaciones y lugares mencionados, facilitando tareas de indexacion y analisis de contenido.
- Analisis de redes sociales: aplicable a tweets o publicaciones en arabe para identificar entidades relevantes en conversaciones, por ejemplo en monitorizacion de marca o deteccion de eventos.
- Atencion al cliente automatizada: en chatbots o sistemas de tickets, el modelo puede extraer el nombre del cliente, la empresa mencionada o la ubicacion desde mensajes de texto en arabe, mejorando el enrutamiento de consultas.
- Procesamiento de documentos legales o administrativos: ayuda a localizar nombres de partes, organizaciones y lugares en contratos o formularios en arabe, reduciendo el trabajo manual de revision.
- Construccion de grafos de conocimiento: al extraer entidades de corpus arabes, se pueden alimentar bases de datos de relaciones entre personas, organizaciones y lugares.
- Sistemas de busqueda semantica: las entidades extraidas pueden usarse como metadatos para mejorar la recuperacion de informacion en motores de busqueda especializados en contenido arabe.

## Benchmarks y rendimiento

El autor declara los siguientes resultados sobre el conjunto de test de PAN-X.ar (XTREME), con una particion estratificada del 10% de los datos:

| Metrica | Valor |
|---|---|
| F1 (nivel de entidad) | 0,9172 |
| Accuracy (nivel de token) | 0,9634 |
| Token error rate | 0,0366 |
| Entity error rate | 0,0828 |

Desglose por tipo de entidad:

| Entidad | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| LOC | 0,93 | 0,93 | 0,93 | 1564 |
| ORG | 0,88 | 0,89 | 0,89 | 1438 |
| PER | 0,93 | 0,94 | 0,94 | 1541 |
| Micro avg | 0,91 | 0,92 | 0,92 | 4543 |
| Macro avg | 0,91 | 0,92 | 0,92 | 4543 |
| Weighted avg | 0,91 | 0,92 | 0,92 | 4543 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 110 millones de parametros, en FP32 el modelo ocupa aproximadamente 440 MB; en FP16 unos 220 MB; en int8 unos 110 MB. Una GPU con al menos 2 GB de VRAM es suficiente para inferencia en lotes pequenos.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, por ejemplo NVIDIA T4, V100, RTX 2080, RTX 3090 o superiores. Tambien puede ejecutarse en CPU para inferencia de baja latencia, aunque mas lenta.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de consumo como la RTX 3060 (12 GB) o incluso en la GTX 1650 (4 GB) si se usa cuantizacion.
- Opciones de despliegue: se puede servir con vLLM, Hugging Face Inference Endpoints, o mediante la libreria Transformers con `pipeline`. Para entornos sin GPU, se puede usar llama.cpp u ONNX Runtime, aunque el modelo no esta optimizado especificamente para esos runtimes.
- Latencia y throughput: no se han publicado mediciones oficiales. Como referencia, un BERT-base en una GPU T4 suele procesar entre 100 y 300 secuencias de 128 tokens por segundo en inferencia por lotes.

## Comparativa con modelos similares

No se dispone de una comparativa oficial con otros modelos de NER arabe. Como referencia, existen alternativas como:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OmarMaqousi/ner-arabicbert | 110M | 512 | Apache 2.0 | Fine-tune de BERT-base-arabic sobre PAN-X.ar |
| aubmindlab/bert-base-arabertv2 | 110M | 512 | Apache 2.0 | Modelo base preentrenado, no fine-tune para NER |
| UBC-NLP/MARBERT | 163M | 512 | MIT | Modelo base preentrenado, requiere fine-tuning para NER |

La comparativa directa no es posible sin evaluar los mismos benchmarks con los mismos protocolos. El modelo presentado es un checkpoint ya fine-tuneado, mientras que los otros son modelos base que necesitan adaptacion.

## Limitaciones y advertencias

- El modelo solo reconoce tres tipos de entidades (PER, ORG, LOC); no cubre otros tipos como fechas, cantidades o productos.
- Esta entrenado exclusivamente en arabe; no soporta otros idiomas.
- El rendimiento puede degradarse en dominios muy especificos (por ejemplo, textos medicos o legales) si el vocabulario difiere del corpus de entrenamiento.
- Al ser un modelo BERT-base, tiene una ventana de contexto limitada a 512 tokens; textos mas largos deben truncarse o dividirse.
- No se han documentado sesgos especificos, pero como cualquier modelo entrenado con datos web, puede reflejar sesgos presentes en el corpus de preentrenamiento.
- Riesgo de alucinacion en la identificacion de entidades: puede etiquetar como entidad fragmentos que no lo son, especialmente en textos con ortografia no estandar o dialectos arabes.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se ofrece sin garantias; el autor no proporciona soporte oficial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OmarMaqousi/ner-arabicbert
- Modelo base (asafaya/bert-base-arabic): https://huggingface.co/asafaya/bert-base-arabic
- Dataset PAN-X (XTREME): https://huggingface.co/datasets/google/xtreme
- Paper de AraBERT (referencia de arquitectura): https://arxiv.org/abs/2003.00104
- Repositorio de AraBERT (aub-mind): https://github.com/aub-mind/arabert
- Repositorio de MARBERT (UBC-NLP): https://github.com/UBC-NLP/marbert
