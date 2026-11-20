# Rishabh157/multiconer-multilingual-ner-mdeberta

## Resumen

`Rishabh157/multiconer-multilingual-ner-mdeberta` es un modelo de reconocimiento de entidades nombradas (NER) multilingüe y de grano fino, obtenido mediante fine-tuning con LoRA de `microsoft/mdeberta-v3-base` sobre el corpus MultiCoNER v2 (SemEval-2023 Task 2). Lo desarrolla Rishabh Kumar y está publicado en Hugging Face con licencia MIT. Resuelve el problema de la extracción de entidades en textos cortos, ruidosos y con poco contexto (titulares, tuits, consultas de búsqueda), donde los NER clásicos de etiquetas gruesas (PER/ORG/LOC) pierden información.

El modelo cubre 12 idiomas (inglés, español, francés, alemán, italiano, portugués, sueco, ucraniano, chino, bengalí, hindi y persa) más un modo multilingüe mixto, y distingue 33 clases de entidad fina que se agregan en 67 etiquetas BIO. Frente a un NER convencional, separa por ejemplo `Scientist` de `Politician` dentro de persona, o `CarManufacturer` de `AerospaceManufacturer` dentro de organización, además de categorías médicas (`Disease`, `Medication/Vaccine`, `Symptom`) y de producto (`ArtWork`, `Software`, `Vehicle`).

Con 278,27 M de parámetros y un peso en FP16 de unos 530 MB, es un modelo compacto y desplegable en una sola GPU de consumo, lo que lo hace útil como componente de extracción de información en pipelines de PNL que necesitan cobertura multilingüe sin depender de un LLM generativo. Su rendimiento, no obstante, es moderado: F1 de entidad de 0,4839 en validación, por lo que conviene tratarlo como base ajustable más que como solución final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3 con atención desenredada y embedding de posición relativa), fine-tuning LoRA fusionado en los pesos base |
| Parametros totales | 278.270.275 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el modelo base mdeberta-v3-base admite hasta 512 tokens; la model card no lo declara explícitamente) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16; no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | en, es, fr, de, it, pt, sv, uk, zh, bn, hi, fa y modo multilingüe mixto (MULTI) |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers) |
| Tarea (pipeline) | token-classification |
| Etiquetas de salida | 67 etiquetas BIO sobre 33 clases finas |
| Modelo base | microsoft/mdeberta-v3-base |
| Dataset de entrenamiento | MultiCoNER/multiconer_v2 (SemEval-2023 Task 2) |
| Tamano del repositorio | 0,6 GB |
| Precisión de pesos | FP16 (torch.float16, ~530 MB) |

## Arquitectura y entrenamiento

La base es `microsoft/mdeberta-v3-base`: un encoder DeBERTa-v3 de 12 capas, 768 dimensiones ocultas y vocabulario multilingüe de 250k tokens, que emplea atención desenredada (contenido y posición separados) y embeddings de posición relativa en lugar de absolutos. Sobre ese backbone se aplicó un adaptador LoRA con r=32, alpha=32 y módulos objetivo `query_proj`, `key_proj`, `value_proj`, `intermediate.dense` y `output.dense`; los pesos del adaptador se fusionaron después en los pesos base, de modo que el repositorio contiene un checkpoint estándar de transformers sin dependencia de PEFT en inferencia.

El entrenamiento usó el split de MultiCoNER v2 con 170.824 frases de entrenamiento (12 subconjuntos de idioma más el mixto), 13.598 de validación y 1.991.359 de test. El preprocesado estandariza el formato CoNLL a dos columnas, elimina cabeceras `#` y `-DOCSTART-`, tokeniza con SentencePiece (`add_prefix_space=True`) y alinea las etiquetas BIO al primer subtoken de cada palabra, enmascarando los subtokens restantes con `-100` para que la pérdida y la evaluación sean a nivel de entidad. Se entrenó 5 épocas (~53.300 pasos) con AdamW, lr=2e-5, scheduler lineal y batch efectivo de 16. No se documenta en la información disponible el uso de RLHF, DPO ni una fase de instrucción; es un ajuste supervisado puro de etiquetado de secuencias.

## Capacidades

- Reconocimiento de entidades nombradas de grano fino en 33 clases agrupadas en cinco supertipos: persona, organización, localización, producto/obra creativa y ámbito médico.
- Etiquetado de secuencias a nivel de token con esquema BIO (67 logits de salida), apto para extracción directa de entidades y offsets.
- Multilingüismo nativo en 12 idiomas, con transferencia cruzada entre lenguas gracias al vocabulario y al preentrenamiento multilingües del backbone.
- Manejo de dominios difíciles de MultiCoNER: textos cortos, sin contexto, con ruido, errores ortográficos y entidades poco frecuentes o emergentes.
- Distinción de subtipos médicos (`AnatomicalStructure`, `Disease`, `MedicalProcedure`, `Medication/Vaccine`, `Symptom`), útil para PNL clínica básica.
- Distinción de subtipos de producto (`ArtWork`, `MusicalWork`, `VisualWork`, `WrittenWork`, `Software`, `Clothing`, `Drink`, `Food`, `Vehicle`, `OtherPROD`).
- No soporta tool calling, function calling, razonamiento multi-paso ni modo thinking: es un modelo discriminativo de clasificación, no generativo.
- No tiene capacidades de visión, audio ni generación de texto libre.

## Casos de uso

- Extracción de entidades en titulares y noticias multilingües: el modelo está entrenado específicamente sobre textos cortos y sin contexto, por lo que etiqueta de forma directa nombres de políticos, científicos, empresas y obras en un feed de prensa en varios idiomas sin necesidad de resúmenes previos.
- Enriquecimiento de bases de datos de clientes y CRM: sobre descripciones libres en español, inglés o francés permite poblar campos estructurados de empresa (`PrivateCorp`, `PublicCorp`), localización (`HumanSettlement`, `Facility`) y producto (`Software`, `Vehicle`).
- Anonimización y seudonimización previa a cumplimiento normativo: al detectar personas y organizaciones con subtipos, se puede aplicar una política de redacción diferenciada (por ejemplo, enmascarar `Politician` y `Scientist` pero preservar `PublicCorp`) antes de almacenar o compartir textos.
- Indexación y búsqueda semántica multilingüe: las entidades extraídas sirven como facetas de filtrado en un motor de búsqueda documental que cubra lenguas europeas, chino, hindi, bengalí y persa, aprovechando el vocabulario multilingüe del backbone.
- Procesamiento de literatura biomédica y notas clínicas: las clases médicas (`Disease`, `Medication/Vaccine`, `Symptom`, `MedicalProcedure`) permiten construir índices de ensayos, fichas técnicas o informes con etiquetado de síntomas y tratamientos.
- Preetiquetado para anotación humana: al ser un modelo de 278 M de parámetros y 530 MB, se puede ejecutar en CPU o en una GPU modesta para generar propuestas de entidades que un anotador revise, reduciendo el coste de creación de corpus NER propios.
- Moderación y análisis de contenido generado por usuarios: detección de marcas, productos y localizaciones en publicaciones cortas en foros y redes, con salida BIO consumible por reglas posteriores.
- Componente de un pipeline RAG: la extracción de entidades sobre las consultas y los fragmentos recuperados permite filtrar y desambiguar candidatos antes de la generación.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de validación de MultiCoNER v2 (mejor checkpoint, época 5):

| Metrica | Valor |
|---|---|
| F1 de entidad (validación) | 0,4839 |
| Precisión (validación) | 0,4732 |
| Recall (validación) | 0,4951 |
| Exactitud (validación) | 0,8951 |
| Pérdida (validación) | 0,2616 |

Progresión por época:

| Epoca | Paso | Precision | Recall | F1 de entidad | Exactitud | Perdida |
|---|---|---|---|---|---|---|
| 1 | 10.677 | 31,71 % | 33,66 % | 32,65 % | 86,91 % | 0,3790 |
| 2 | 21.354 | 40,54 % | 44,28 % | 42,33 % | 88,13 % | 0,2995 |
| 3 | 32.031 | 44,67 % | 45,80 % | 45,23 % | no disponible | no disponible |

No se han publicado en la información disponible resultados desagregados por idioma, por supertipo de entidad ni sobre el split de test, ni comparaciones directas con otros sistemas en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, unos 0,55 GB de pesos más activaciones; con batches pequeños (8-32 secuencias de hasta 512 tokens) el consumo realista se sitúa en torno a 1,5-4 GB.
- Cabe en cualquier GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090, así como en GPUs de portátil con 6 GB o más.
- Ejecutable en CPU para volúmenes moderados (inferencia por lotes en servidores sin GPU), dado el tamaño reducido del modelo.
- GPU de datacenter recomendadas para alto throughput: A100, H100, L4 o T4; el modelo no requiere tensor parallelism ni sharding.
- Opciones de despliegue: `transformers` con `AutoModelForTokenClassification` y `pipeline("token-classification")`, servidores de inferencia tipo TGI o vLLM (soporte de modelos encoder de clasificación limitado, conviene verificar), ONNX Runtime o TorchScript para CPU. No se documentan pesos GGUF, por lo que llama.cpp y Ollama no son una vía directa sin conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño (278 M de parámetros, encoder de 12 capas) se espera un rendimiento del orden de miles de tokens por segundo en GPU moderna con batch, pero no hay cifras publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Etiquetas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Rishabh157/multiconer-multilingual-ner-mdeberta | 278 M | no disponible (base hasta 512) | 12 + mixto | 33 clases / 67 BIO | MIT | Hugging Face, transformers |
| microsoft/mdeberta-v3-base | 278 M | 512 | multilingüe (amplio) | no aplica (modelo base) | MIT | Hugging Face |
| Modelos NER multilingües tipo XLM-R base ajustados a CoNLL | ~278 M | 512 | multilingüe | 4 clases típicas (PER/ORG/LOC/MISC) | MIT | Hugging Face |
| SpERT o GLiNER (extracción zero-shot) | variable (GLiNER ~200 M) | variable | multilingüe en variantes recientes | definidas por prompt | MIT / Apache-2.0 según variante | Hugging Face |

La comparación cuantitativa de F1 frente a estos sistemas no está disponible en la información proporcionada; la ventaja diferencial del modelo es la granularidad de 33 clases y su ajuste específico al dominio MultiCoNER, mientras que su desventaja es un F1 absoluto moderado y la ausencia de evaluación por idioma.

## Limitaciones y advertencias

- F1 de entidad de 0,4839 en validación: la precisión y el recall rondan el 47-50 %, de modo que aproximadamente la mitad de las entidades se pierden o se etiquetan mal. No es adecuado como extractor único en producción sin revisión o ajuste adicional.
- El modelo se ha evaluado únicamente en validación; no hay métricas publicadas sobre el split de test ni desagregadas por idioma, por lo que el rendimiento en lenguas de bajos recursos (bengalí, hindi, persa, ucraniano) es incierto.
- Riesgo de alucinación de entidades: como clasificador de tokens, puede asignar etiquetas de entidad a fragmentos que no lo son, especialmente en textos con ruido, abreviaturas o dominios distintos de MultiCoNER.
- Sesgo de dominio: el entrenamiento se centra en textos cortos y sin contexto; el rendimiento puede degradarse en documentos largos, lenguaje formal administrativo o jerga técnica no representada.
- Sesgo lingüístico y cultural: la distribución de MultiCoNER favorece entidades de cultura occidental y nombres propios bien formados; los nombres transliterados o con ortografía no estándar pueden quedar sin etiquetar.
- La tokenización con `add_prefix_space=True` y la alineación de etiquetas al primer subtoken son sensibles a un preprocesado incorrecto; reutilizar el modelo con otro tokenizador o sin ese ajuste produce offsets erróneos.
- Licencia MIT: permite uso comercial y modificación, pero el modelo base `microsoft/mdeberta-v3-base` también es MIT según la información disponible; conviene verificar los términos del dataset MultiCoNER v2 para usos derivados.
- No dispone de pesos cuantizados publicados, por lo que el despliegue en entornos con herramientas que esperan GGUF requiere conversión propia y validación de la calidad tras la cuantización.
- Sin soporte de tool calling ni generación: no puede sustituir a un LLM en tareas de razonamiento o agentes; su rol es estrictamente extractivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rishabh157/multiconer-multilingual-ner-mdeberta
- Modelo base: https://huggingface.co/microsoft/mdeberta-v3-base
- Dataset MultiCoNER v2: https://huggingface.co/datasets/MultiCoNER/multiconer_v2
- Perfil del autor: https://www.linkedin.com/in/rishabh-kumar-922072195/
- SemEval-2023 Task 2 (MultiCoNER): no disponible como enlace en la información proporcionada
- Paper de DeBERTa-v3: no disponible como enlace en la información proporcionada
