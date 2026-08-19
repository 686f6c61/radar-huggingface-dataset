# prachuryyaIITG/CLASSER_Nepali_MuRIL

## Resumen

CLASSER_Nepali_MuRIL es un modelo de reconocimiento de entidades nombradas (NER) de grano fino, desarrollado por Prachuryya Kaushik y el profesor Ashish Anand del IIT Guwahati. Se trata de un ajuste fino (fine-tuning) del modelo multilingüe MuRIL large cased, entrenado específicamente sobre el dataset CLASSER para nepalí. El modelo resuelve la tarea de identificación y clasificación de entidades en textos nepalíes, utilizando el tagset fino de MultiCoNER2, que distingue categorías como personas, organizaciones, ubicaciones, productos, obras creativas y entidades médicas, con subcategorías detalladas.

El modelo forma parte del ecosistema AWED-PIPER, un conjunto de herramientas y agentes para la protección de información personal identificable (PII) y el reconocimiento de entidades en 36 idiomas. Su relevancia radica en cubrir una lengua de bajos recursos como el nepalí, donde los recursos de NER fino son escasos. Con 504,9 millones de parámetros, se basa en la arquitectura BERT multilingüe de Google, adaptada para lenguas indias y del sur de Asia. Está disponible bajo licencia MIT y se distribuye en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (MuRIL large cased) |
| Parametros totales | 504.926.275 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | ne (nepali) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT de Google, concretamente en la variante MuRIL (Multilingual Representations for Indian Languages) en su configuración large cased. MuRIL está preentrenado con un vocabulario y un corpus adaptados a lenguas de la India y del sur de Asia, lo que lo hace adecuado para el nepalí. El ajuste fino se realizó sobre el dataset CLASSER, que emplea un etiquetado fino derivado de MultiCoNER2, con un mapeo de categorías finas a gruesas (por ejemplo, Facility, OtherLOC, HumanSettlement y Station se agrupan en Location).

Los parámetros de entrenamiento reportados son: 6 épocas, optimizador AdamW, tasa de aprendizaje de 5e-5, weight decay de 0.01 y tamaño de lote de 64. No se especifican detalles sobre la composición del dataset de entrenamiento (número de tokens, equilibrio de clases, etc.) en la información disponible. El modelo se publica como parte de un framework de proyección de anotaciones cross-lingüe con refinamiento basado en similitud de escritura, pero no se detallan innovaciones arquitectónicas adicionales más allá del ajuste fino.

## Capacidades

- Reconocimiento de entidades nombradas de grano fino en texto nepalí, con 6 categorías principales y 30 subcategorías (según el tagset de MultiCoNER2).
- Clasificación de entidades en: ubicaciones (instalaciones, asentamientos humanos, estaciones, otras localizaciones), obras creativas (visuales, musicales, escritas, arte, software), grupos (corporaciones públicas y privadas, fabricantes aeroespaciales y de automóviles, organizaciones deportivas, organizaciones), personas (científicos, artistas, atletas, políticos, clérigos, gestores deportivos, otras personas), productos (ropa, vehículos, comida, bebida, otros productos) y entidades médicas (medicamentos/vacunas, procedimientos médicos, estructuras anatómicas, síntomas, enfermedades).
- Integración con herramientas agénticas del ecosistema AWED-FiNER para interactuar con el modelo a través de una interfaz de espacio Gradio.
- Compatible con el pipeline de token-classification de Hugging Face Transformers.
- Capacidad multilingüe heredada del modelo base MuRIL, aunque el ajuste se ha realizado específicamente para nepalí.

## Casos de uso

- Análisis de textos periodísticos nepalíes: extraer automáticamente personas, organizaciones y ubicaciones mencionadas en noticias, útil para sistemas de monitorización de medios y generación de resúmenes temáticos.
- Procesamiento de documentos legales o administrativos en nepalí: identificar entidades como nombres de personas, instituciones y lugares para automatizar la indexación y el archivado de expedientes.
- Sistemas de atención al cliente en nepalí: extraer entidades de conversaciones de soporte (productos, servicios, ubicaciones) para enrutar consultas o alimentar bases de conocimiento.
- Análisis de redes sociales en nepalí: detectar menciones a marcas, celebridades o lugares en publicaciones de X, Facebook o foros, con fines de monitorización de reputación o análisis de tendencias.
- Protección de datos personales (PII): el modelo puede usarse como detector de entidades personales en textos nepalíes, integrándose en flujos de anonimización o cumplimiento de normativas de privacidad, como se plantea en el ecosistema AWED-PIPER.
- Investigación en lingüística computacional: servir como modelo de referencia para NER fino en nepalí, permitiendo comparar enfoques alternativos o transferir conocimiento a otras lenguas de bajos recursos del sur de Asia.

## Benchmarks y rendimiento

El autor reporta las siguientes métricas en el conjunto de evaluación del dataset CLASSER para nepalí:

| Metrica | Valor |
|---|---|
| Precision | 76.92 |
| Recall | 79.50 |
| F1 | 78.19 |

No se han publicado resultados comparativos con otros modelos de NER fino para nepalí en la informacion disponible.

## Requisitos de hardware

- Tamano del modelo: 504,9 millones de parametros, aproximadamente 2 GB en precision fp32.
- Estimacion de VRAM para inferencia: con cuantizacion a int8 (si se aplicara) cabria en GPUs con 4-6 GB de VRAM; en fp32 se necesitarian al menos 8-10 GB.
- GPU recomendadas: NVIDIA T4, V100, RTX 3090, A10 o superiores para una inferencia comoda.
- No se dispone de datos oficiales sobre latencia o throughput; al ser un modelo BERT de tamano large, la inferencia en CPU es posible pero lenta (varios cientos de milisegundos por frase).
- Opciones de despliegue: se puede usar con la libreria Transformers de Hugging Face (pipeline de token-classification), o mediante herramientas como vLLM o TGI si se convierte a un formato optimizado. Tambien se puede acceder via el espacio Gradio AWED-FiNER.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de NER fino para nepalí en los datos proporcionados. El modelo base MuRIL large es el unico punto de referencia indirecto, pero no se han publicado comparaciones directas con otros sistemas de NER nepalí.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para nepalí; su uso en otros idiomas puede producir resultados poco fiables, aunque el modelo base MuRIL tenga capacidades multilingues.
- No se especifican los sesgos del conjunto de entrenamiento; al ser un dataset construido mediante proyeccion de anotaciones, puede haber errores de etiquetado o cobertura incompleta de ciertos dominios.
- Riesgo de alucinacion o sobre-identificacion de entidades en textos ruidosos o con ortografia no estandar, comun en redes sociales o transcripciones.
- La longitud de contexto no se ha indicado; el modelo base MuRIL large tiene un maximo de 512 tokens, lo que limita el analisis de documentos largos a fragmentos.
- No se proporcionan detalles sobre el rendimiento en texto informal, dialectos o variantes regionales del nepalí.
- La licencia MIT permite uso comercial sin restricciones, pero se recomienda verificar la procedencia del dataset CLASSER para posibles implicaciones de derechos sobre los datos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/prachuryyaIITG/CLASSER_Nepali_MuRIL)
- [Dataset CLASSER](https://huggingface.co/datasets/prachuryyaIITG/CLASSER)
- [Coleccion CLASSER en Hugging Face](https://huggingface.co/collections/prachuryyaIITG/classer)
- [Paper AWED-PIPER (arXiv)](https://arxiv.org/abs/2601.10161)
- [Version HTML del paper](https://arxiv.org/html/2601.10161v3)
- [Repositorio GitHub de CLASSER](https://github.com/PrachuryyaKaushik/CLASSER)
- [Repositorio GitHub de AWED-PIPER](https://github.com/PrachuryyaKaushik/AWED-PIPER)
- [Repositorio GitHub de AWED-FiNER](https://github.com/PrachuryyaKaushik/AWED-FiNER)
- [Web App AWED-FiNER](https://huggingface.co/spaces/prachuryyaIITG/AWED-FiNER)
- [Web App AWED PII Protector](https://huggingface.co/spaces/prachuryyaIITG/AWED_PII_Protector)
- [Paper CLASSER en ACL Anthology](https://aclanthology.org/2025.ijcnlp-long.94/)
- [Paper SampurNER en AAAI](https://ojs.aaai.org/index.php/AAAI/article/view/40405)
