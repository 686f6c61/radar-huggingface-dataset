# luluw/NandiBERT-420M-49k-en-ne-NER-mica

## Resumen

NandiBERT-420M-49k-en-ne-NER-mica es un modelo de reconocimiento de entidades nombradas (NER) para ingles, nepalí y nepalí romanizado (neglish), desarrollado por el usuario luluw sobre el encoder NandiBERT-450M de FrontiersMind. Se distribuye como un checkpoint completo fusionado: los adaptadores MiCA (una variante de LoRA con inicializacion basada en SVD) se han integrado en el encoder y se anade una cabeza de clasificacion multicapa con activacion sigmoide y esquema B/I para cuatro tipos de entidad: persona (PER), localizacion (LOC), organizacion (ORG) y fecha (DATE).

El modelo cuenta con 418.447.360 parametros reales (segun los pesos en safetensors) y una longitud maxima de secuencia de entrenamiento de 1.024 tokens. Su interes practico radica en cubrir el nepalí escrito tanto en devanagari como en alfabeto latino, un escenario poco atendido por los modelos NER multilingues habituales, con un F1 por solapamiento de 0,9345 sobre un conjunto de test de 9.291 ejemplos.

Es un modelo de investigacion y despliegue ligero: el repositorio ocupa 1,7 GB, requiere `trust_remote_code=True` por el uso de codigo personalizado del encoder y no declara licencia explicita, lo que condiciona su uso comercial. No es un modelo generativo: es un extractor de caracteristicas con cabeza token-classification.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (nandi_encoder, base NandiBERT-450M) con adaptadores MiCA fusionados y cabeza lineal sigmoide B/I |
| Parametros totales | 418.447.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (longitud maxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos safetensors en el repo; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ne (nepalí en devanagari y romanizado), en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (encoder + `ner_classifier.safetensors`), configuracion JSON (`ner_config.json`) |
| Tarea | token-classification (NER, multi-label) |
| Etiquetas | PER, LOC, ORG, DATE (esquema B/I) |
| Vocabulario | 49k tokens (variante trim del vocabulario) |
| Modelo base | luluw/NandiBERT-450M-49k-en-ne-trim, FrontiersMind/NandiBERT-450M |
| Metodo de ajuste | MiCA (`init_lora_weights="mica"`), rank SVD por grupo: atencion r=64, MLP r=128 |
| Libreria | transformers (custom_code) |

## Arquitectura y entrenamiento

El modelo parte de NandiBERT-450M, un encoder tipo BERT orientado a ingles y lenguas indicas, en su variante con vocabulario reducido a 49k tokens y ajustada para ingles-nepalí (`NandiBERT-450M-49k-en-ne-trim`). Sobre ese encoder se aplico un ajuste fino con MiCA, una inicializacion de LoRA basada en descomposicion en valores singulares que asigna rangos distintos por grupo de modulos: r=64 en los bloques de atencion y r=128 en los MLP. Tras el entrenamiento, los adaptadores se fusionaron en los pesos del encoder, de modo que el checkpoint distribuido es un modelo denso sin adaptadores separados.

La cabeza de clasificacion es una capa lineal de `hidden_size` a `num_tags` con activacion sigmoide independiente por etiqueta (multi-label), lo que permite solapamientos y evita la restriccion de una unica etiqueta por token propia del softmax. El entrenamiento se realizo durante 3 epocas, con batch efectivo de 32 (4 de batch por 4 de acumulacion en 2 GPU T4), tasa de aprendizaje 0,0003 y una longitud maxima de 1.024 tokens. Se aplico aumentacion de capitalizacion sobre el texto de entrenamiento en alfabeto latino, presumiblemente para robustecer el modelo frente a variaciones de mayusculas/minusculas en el nepalí romanizado. No se documentan en la informacion disponible el volumen total de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF/DPO (no aplicable a un modelo NER).

## Capacidades

- Extraccion de entidades nombradas de cuatro tipos: persona (PER), localizacion (LOC), organizacion (ORG) y fecha (DATE).
- Procesamiento de nepalí en escritura devanagari, nepalí romanizado (neglish) e ingles, incluyendo texto con escritura mixta.
- Clasificacion multi-label por token con umbral ajustable (por defecto 0,5 en el ejemplo de uso), lo que permite calibrar precision/recall en produccion.
- Extraccion de spans a partir de los `offset_mapping` del tokenizador, con gestion de espacios en blanco y concatenacion de subtokens.
- Deteccion de fechas en formatos numericos y textuales dentro del texto (p. ej. `15/09/2028` en el ejemplo de la model card).
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es exclusivamente un encoder de clasificacion de tokens.
- Capacidad multilingue limitada a los dos idiomas declarados (ne, en); no se documenta cobertura de otras lenguas indicas.

## Casos de uso

- Extraccion de entidades en noticias nepalesas: el modelo puede procesar articulos en devanagari y en neglish para poblar bases de datos de personas, organizaciones y lugares citados, con un F1 por solapamiento de 0,9395 en devanagari y 0,9293 en romanizado.
- Anonimizacion y seudonimizacion de textos: deteccion de PER y LOC para enmascarar datos personales antes de almacenar o compartir documentos, apoyandose en la tasa de falsos positivos del 3,37% en frases sin entidades como referencia de ruido.
- Indexacion y busqueda semantica de documentos: extraer DATE, ORG y LOC para construir metadatos filtrables en un motor de busqueda sobre corpus bilingues ingles-nepalí.
- Procesamiento de formularios y correspondencia: identificacion de nombres de personas y fechas en correos o solicitudes escritas en nepalí romanizado, un registro frecuente en mensajeria y redes sociales.
- Enriquecimiento de pipelines de datos para entrenamiento: etiquetado automatico de corpus no anotados en nepalí para generar datasets NER de mayor tamano, con revision humana sobre los spans de menor confianza.
- Monitorizacion de menciones de marca: deteccion de ORG y LOC en publicaciones y comentarios para agregar menciones de empresas o lugares en redes sociales nepalesas.
- Analisis de documentos historicos o administrativos: extraccion de fechas y organizaciones en actas y registros, aprovechando la ventana de 1.024 tokens para fragmentos de documento.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto de test de 9.291 ejemplos, con metrica basada en solapamiento (overlap):

| Metrica | Valor |
|---|---|
| Precision (overlap) | 0,9498 |
| Recall (overlap) | 0,9196 |
| F1 (overlap) | 0,9345 |
| F1 micro exact-match | 0,7001 |
| Tasa de falsos positivos en frases sin entidad | 3,37% |

Por tipo de entidad:

| Entidad | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| Person (PER) | 0,7108 | 0,6879 | 0,6991 | 4.969 |
| Location (LOC) | 0,7094 | 0,6760 | 0,6923 | 4.052 |
| Organization (ORG) | 0,6950 | 0,6877 | 0,6913 | 3.247 |
| Date (DATE) | 0,7680 | 0,7739 | 0,7709 | 898 |

Por escritura:

| Segmento | n | Precision | Recall | F1 |
|---|---|---|---|---|
| Todas las escrituras | 9.291 | 0,9498 | 0,9196 | 0,9345 |
| Romanizado / neglish | 6.625 | 0,9476 | 0,9117 | 0,9293 |
| Devanagari | 2.198 | 0,9491 | 0,9301 | 0,9395 |
| Ingles | 238 | 0,9751 | 0,9833 | 0,9792 |
| Escritura mixta | 228 | 0,9898 | 0,9898 | 0,9898 |

No se han publicado comparaciones con otros modelos NER en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,7 GB solo para pesos (418 M parametros), mas activaciones y overhead del runtime; en la practica, entre 2 y 3 GB para secuencias de 1.024 tokens con batch pequeno.
- En fp16/bf16 los pesos ocupan alrededor de 0,85 GB; con cuantizacion int8 se reduciria a unos 0,45 GB, aunque no se distribuyen pesos cuantizados oficialmente.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; cabe holgadamente en T4 (usadas en el entrenamiento), RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas e incluso en iGPU con suficiente memoria compartida para batch 1.
- Opciones de despliegue: transformers con `trust_remote_code=True` (unica via documentada); vLLM, llama.cpp, Ollama y TGI no estan documentados para este modelo y, al tratarse de un encoder con cabeza personalizada, requeririan adaptaciones.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por tamano, se espera un coste por secuencia muy inferior al de un modelo generativo de escala similar, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada. La comparacion se limita a caracteristicas estructurales:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| NandiBERT-420M-49k-en-ne-NER-mica | 418 M | 1.024 | ne, en | no disponible | NER especifico con cabeza B/I sigmoide; requiere `trust_remote_code` |
| NandiBERT-450M (base) | ~450 M | no disponible | en, indicas | no disponible | Encoder sin cabeza NER; punto de partida del ajuste |
| Modelos NER multilingues tipo XLM-R base | no disponible | no disponible | multilingue | no disponible | No se aportan datos comparativos en la informacion disponible |

## Limitaciones y advertencias

- Licencia no declarada: no se especifican terminos de uso comercial; debe contactarse con el autor antes de integrarlo en productos.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio; conviene auditar el codigo antes de desplegarlo.
- Solo cuatro tipos de entidad (PER, LOC, ORG, DATE); no cubre MISC, productos, cargos, eventos ni otras categorias habituales en NER.
- El F1 exact-match (0,7001) es notablemente inferior al F1 por solapamiento (0,9345), lo que indica que los limites exactos de los spans son imprecisos; para tareas que exijan coincidencia exacta el rendimiento cae.
- F1 por tipo de entidad en torno a 0,69-0,77: PER, LOC y ORG tienen un margen de error considerable para uso en produccion sin revision humana.
- Tasa de falsos positivos del 3,37% en frases sin entidades: puede generar ruido en corpus con mucho texto no entitativo.
- Ventana maxima de 1.024 tokens: documentos largos deben fragmentarse, con riesgo de perder entidades en los cortes.
- Cobertura limitada a nepalí e ingles; no se documenta comportamiento en otras lenguas indicas ni en nepalí con code-switching hacia terceros idiomas.
- Riesgo de sesgo no evaluado: no se publican analisis de sesgo por genero, casta, etnia o region, relevantes en el contexto nepales.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de falsos spans: el modelo puede marcar como entidad texto que no lo es, especialmente en neglish con ortografia variable.
- Modelo con 0 descargas y 1 like en el momento de la ficha: ecosistema y validacion externa practicamente inexistentes.
- Sin datos de benchmarks frente a alternativas: no es posible situarlo objetivamente frente a otros NER para nepalí.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luluw/NandiBERT-420M-49k-en-ne-NER-mica
- Modelo base ajustado: https://huggingface.co/luluw/NandiBERT-450M-49k-en-ne-trim
- Modelo base original: https://huggingface.co/FrontiersMind/NandiBERT-450M
