# ShaymaBenJrad/arabert-ner-tn-v4-sans-wojood

## Resumen

El modelo `ShaymaBenJrad/arabert-ner-tn-v4-sans-wojood` es un checkpoint de clasificación de tokens (token classification) publicado en Hugging Face por el usuario ShaymaBenJrad. Se distribuye en formato safetensors, declara 134.611.980 parámetros y está etiquetado como `bert` dentro de la librería transformers, por lo que previsiblemente se trata de un encoder BERT afinado para reconocimiento de entidades nombradas (NER) en árabe. El propio identificador del modelo ("arabert" y "tn") sugiere un afinamiento sobre AraBERT orientado a texto tunecino, aunque este extremo no está confirmado en la información disponible.

El checkpoint carece de model card real: el README publicado es la plantilla autogenerada por Hugging Face, con todos los campos marcados como "More Information Needed". No se declaran licencia, idiomas soportados, composición del dataset de entrenamiento ni hiperparámetros, y en el momento de la consulta acumula 0 descargas y 0 likes.

Su relevancia es por tanto limitada y experimental. Puede servir como punto de partida para extracción de entidades en árabe dialectal tunecino, pero no debería desplegarse en producción sin auditar antes sus datos de entrenamiento, su esquema de etiquetas y su licencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer, etiqueta `bert` en Hugging Face); se desconoce la configuración exacta de capas y cabezas |
| Parametros totales | 134.611.980 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (los encoders BERT de este tamaño suelen limitarse a 512 tokens, dato no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors. No hay versiones GGUF, ONNX ni GPTQ/AWQ en el repositorio |
| Idiomas soportados | no disponibles en los metadatos; el nombre del modelo sugiere árabe, posiblemente dialectal tunecino, sin confirmar |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamaño del repositorio: 0,5 GB) |
| Pipeline | token-classification |
| Libreria | transformers |
| Fecha de creacion | 2026-09-20 |
| Ultima actualizacion | 2026-09-20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La etiqueta `bert` y el tamaño del checkpoint (134,6 millones de parámetros) son compatibles con un encoder BERT-base con vocabulario árabe, del orden de magnitud de AraBERT-base. Sobre ese encoder se habría añadido una cabeza de clasificación de tokens para producir etiquetas BIO de entidades. No hay información publicada sobre el número de capas, dimensiones ocultas, tamaño de vocabulario, función de activación ni sobre si se emplearon embeddings adicionales o adaptadores.

Respecto al entrenamiento, la información disponible no incluye número de tokens, composición del corpus, proporción de árabe estándar frente a dialecto, ni si hubo ajuste fino supervisado con anotaciones humanas. El sufijo "sans wojood" ("sin Wojood") sugiere que el corpus Wojood, un dataset de NER en árabe palestino, se habría excluido deliberadamente del entrenamiento, probablemente para evitar contaminación con conjuntos de evaluación habituales. No se documenta ninguna innovación técnica: no hay decodificación especulativa, atención lineal ni mecanismos híbridos, ya que no es un modelo generativo.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en árabe: clasificación de tokens en categorías de entidad, presumiblemente personas, organizaciones y localizaciones, aunque el esquema de etiquetas no está publicado.
- Extracción de información estructurada a partir de texto no estructurado, devolviendo secuencias de etiquetas BIO alineadas con los tokens de entrada.
- Procesamiento de texto en árabe dialectal tunecino, según sugiere el identificador del modelo; el alcance real de cobertura dialectal no está documentado.
- Generación de texto: no. Es un encoder de clasificación, no un modelo causal de lenguaje.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multimodales (visión, audio): no soportadas.
- Modo "thinking" o cadena de razonamiento explícita: no disponible.

## Casos de uso

- Extracción de entidades en prensa árabe: el modelo puede procesar artículos y devolver las menciones de personas, organizaciones y lugares para alimentar índices temáticos o sistemas de recomendación de noticias.
- Enriquecimiento de metadatos en archivos y bibliotecas digitales: aplicar NER sobre corpus históricos en árabe para generar campos de autor, lugar de publicación y organismos citados, facilitando la búsqueda facetada.
- Preprocesado para pipelines RAG: identificar entidades antes de la indexación vectorial permite construir grafos de conocimiento o filtros por entidad que mejoran la precisión del recuperador en corpus árabes.
- Detección de datos personales (PII): si el esquema de etiquetas incluye personas y direcciones, puede usarse como primer paso en flujos de anonimización o cumplimiento normativo sobre documentos en árabe, siempre con revisión humana posterior.
- Normalización de bases de datos de contacto: extraer nombres de persona y de organización de formularios, correos o fichas no estructuradas para deduplicar y limpiar registros CRM.
- Análisis de redes sociales en dialecto tunecino: monitorización de menciones a marcas, instituciones o figuras públicas en publicaciones coloquiales, aprovechando la orientación dialectal que sugiere el nombre del checkpoint.
- Investigación académica en NLP árabe: servir como línea base o punto de comparación en experimentos sobre NER dialectal, dado su carácter abierto y su reducido tamaño.
- Moderación y clasificación documental: etiquetar documentos por las entidades que contienen para enrutarlos automáticamente al departamento o expediente correspondiente.

En todos los casos conviene validar antes el esquema de etiquetas real del modelo y su comportamiento fuera del dominio tunecino, ya que no hay documentación que lo garantice.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna sección de evaluación cumplimentada y no se han encontrado referencias externas con métricas de precisión, recall o F1 para este checkpoint.

## Requisitos de hardware

- VRAM estimada: en fp32, los pesos ocupan aproximadamente 0,54 GB; en fp16, unos 0,27 GB; con cuantización dinámica int8, alrededor de 0,14 GB. Sumando activaciones y overhead del runtime, un lote pequeño cabe holgadamente en menos de 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente. Una RTX 3060, RTX 4060, T4 o incluso una GTX 1650 pueden ejecutar inferencia sin problema. No se necesita A100 ni H100.
- Inferencia en CPU: viable. Un encoder de 134 millones de parámetros clasifica secuencias de 512 tokens en decenas de milisegundos por lote en CPUs modernas, especialmente con ONNX Runtime o cuantización int8.
- GPU de consumo: sí, cabe en prácticamente cualquier GPU de consumo actual e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: pipeline de `transformers` con `AutoModelForTokenClassification`, exportación a ONNX Runtime, TorchScript, HF Inference Endpoints, contenedores con FastAPI o Triton Inference Server. vLLM, llama.cpp y Ollama no son aplicables porque están orientados a modelos generativos causales.
- Latencia y throughput: no disponibles (no hay datos publicados por el autor).

## Comparativa con modelos similares

Los datos de los modelos alternativos que figuran a continuación no proceden de la información proporcionada y deben verificarse en sus respectivas fichas antes de usarse. No existen métricas comparativas publicadas para el modelo analizado.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos del modelo analizado |
|---|---|---|---|---|---|
| ShaymaBenJrad/arabert-ner-tn-v4-sans-wojood | 134.611.980 | no disponible | no disponible | Hugging Face, 0 descargas | — |
| AraBERT (variantes base) | no verificado | no verificado | no verificada | Hugging Face | No hay comparativa publicada |
| MARBERT | no verificado | no verificado | no verificada | Hugging Face | No hay comparativa publicada |
| CAMeLBERT | no verificado | no verificado | no verificada | Hugging Face | No hay comparativa publicada |
| XLM-RoBERTa base | no verificado | no verificado | no verificada | Hugging Face | No hay comparativa publicada |

En ausencia de resultados de evaluación no es posible establecer si este checkpoint mejora, iguala o empeora a los encoders árabes consolidados. La única ventaja objetivable frente a ellos es su hipotética especialización en dialecto tunecino, extremo que tampoco está documentado.

## Limitaciones y advertencias

- Model card ausente: el README es la plantilla por defecto de Hugging Face, sin información sobre uso previsto, datos, evaluación ni limitaciones.
- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución. Es un riesgo legal directo en cualquier despliegue en producción.
- Dataset de entrenamiento desconocido: no se puede evaluar la cobertura dialectal, la calidad de las anotaciones ni la posible contaminación con conjuntos de evaluación.
- Sesgos desconocidos: al no documentarse la composición del corpus, no es posible estimar sesgos de género, geográficos, religiosos o políticos en las entidades reconocidas.
- Riesgo de alucinación estructural: en NER, el error típico no es inventar contenido, sino asignar etiquetas incorrectas o fragmentar entidades (falsos positivos y límites de entidad erróneos), lo que puede propagar errores a sistemas posteriores.
- Limitación de contexto: si el checkpoint mantiene la ventana habitual de BERT (512 tokens), los documentos largos requieren segmentación, con la consiguiente pérdida de entidades que cruzan fragmentos.
- Ausencia de validación comunitaria: 0 descargas y 0 likes implican que no hay retroalimentación ni casos de uso verificados por terceros.
- Especialización excluyente: la indicación "sans wojood" sugiere que el modelo no se entrenó con ese corpus, lo que puede reducir su cobertura sobre árabe estándar moderno o sobre variantes palestinas si el ajuste se concentró en dialecto tunecino.
- Solo clasificación: no puede generar texto, resumir ni mantener conversaciones; cualquier expectativa de uso conversacional es inadecuada.
- Etiquetas desconocidas: sin conocer el mapping de `id2label`, las predicciones no son interpretables directamente y hay que inspeccionar `config.json` antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ShaymaBenJrad/arabert-ner-tn-v4-sans-wojood
- Paper referenciado en las etiquetas del repositorio (Lacoste et al., 2019, calculadora de impacto medioambiental): https://arxiv.org/abs/1910.09700
- Paper de AraBERT, si se confirma la base del modelo: no disponible en la información proporcionada
- Repositorio de código o demo: no disponible
- Otras referencias: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces recuperados no guardan relación con el checkpoint.
