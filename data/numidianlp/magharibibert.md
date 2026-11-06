# NumidiaNLP/MagharibiBERT

## Resumen

MagharibiBERT es un modelo de lenguaje basado en BERT, desarrollado por NumidiaNLP (Universidad Ferhat Abbas Sétif 1, Argelia), especializado en árabe magrebí. Se inicializa a partir de UBC-NLP/MARBERT y se adapta mediante preentrenamiento continuado con Masked Language Modeling (MLM) sobre un corpus multiorigen de 17 fuentes que cubre Argelia, Marruecos, Túnez, Libia y fuentes magrebíes transversales. El modelo aborda la diversidad lingüística y ortográfica de la comunicación en línea del norte de África: dialecto en escritura árabe, arabizi (árabe escrito con caracteres latinos), variación ortográfica y code-switching árabe-francés/inglés.

Con 162.942.880 parámetros, 12 capas, tamaño oculto de 768, 12 cabezas de atención y un vocabulario de 100.000 tokens, MagharibiBERT mantiene la arquitectura encoder-only clásica de BERT con una longitud máxima de 512 posiciones. Su relevancia actual radica en que la mayoría de los modelos árabes están dominados por variedades de Oriente Medio (MSA y dialectos orientales), mientras que el magrebí presenta una heterogeneidad ortográfica y de code-switching que los modelos generalistas no capturan bien.

El modelo está orientado a investigación: detección de odio y lenguaje ofensivo, análisis de sentimiento, identificación de dialecto, procesamiento de arabizi y texto con code-switching, clasificación de texto de redes sociales y aprendizaje de representaciones para árabe magrebí. La evaluación extrínseca frente a MARBERT y otros modelos árabes está pendiente de publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only, transformer bidireccional) |
| Parametros totales | 162.942.880 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 posiciones (maximum position embeddings) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada por el autor) |
| Idiomas soportados | ar (árabe, con foco en árabe magrebí: Argelia, Marruecos, Túnez, Libia; incluye arabizi y code-switching árabe-francés/inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

MagharibiBERT es un transformer encoder-only con la configuración estándar de BERT-base: 12 capas, hidden size de 768, 12 cabezas de atención y vocabulario de 100.000 tokens heredado de MARBERT. El objetivo de entrenamiento es Masked Language Modeling con secuencias de longitud 128, 120.000 pasos de optimizador, batch efectivo de 48, learning rate 2e-5, 6.000 pasos de warmup, weight decay de 0,01, precisión BF16 y semilla 42.

El preentrenamiento continuado se realizó sobre una mezcla curada de 17 corpus que cubren árabe magrebí y lenguaje de redes sociales del norte de África, con cobertura explícita de escritura árabe, arabizi y texto con code-switching. No se documenta en la información disponible el número total de tokens de entrenamiento ni la composición porcentual del dataset, ni si hubo fases de RLHF o DPO (lo cual es esperable en un modelo MLM puro, pero no se confirma explícitamente). Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal; el modelo es una adaptación regional de un encoder BERT convencional.

## Capacidades

- Generación de representaciones contextuales bidireccionales para texto en árabe magrebí, útiles como backbone para tareas de clasificación y extracción.
- Fill-mask: predicción de tokens enmascarados en contextos de dialecto magrebí, arabizi y code-switching.
- Procesamiento de arabizi (árabe escrito con caracteres latinos y dígitos leet) y de variación ortográfica dialectal.
- Manejo de code-switching árabe-francés e árabe-inglés, frecuente en redes sociales del Magreb.
- Soporte para identificación de dialecto y variedad regional (Argelia, Marruecos, Túnez, Libia).
- Base para clasificación de texto de redes sociales: sentimiento, detección de odio y lenguaje ofensivo.
- No soporta tool calling ni function calling: es un modelo encoder-only sin capacidad generativa ni de instrucciones.
- No soporta agentes ni razonamiento multi-paso: carece de decoder y de modo de pensamiento.
- No tiene capacidades de visión ni audio.
- Capacidades multilingües limitadas al árabe y a los fenómenos de code-switching presentes en el corpus; no se documenta soporte de otras lenguas de forma nativa.

## Casos de uso

- Detección de odio y lenguaje ofensivo en redes sociales magrebíes: el modelo se afina como clasificador de secuencia sobre comentarios en darija, arabizi y texto mixto árabe-francés, aprovechando su preentrenamiento específico en estas variedades para reducir falsos negativos en expresiones dialectales que los modelos MSA no reconocen.
- Análisis de sentimiento en opiniones de usuarios de Argelia, Marruecos, Túnez y Libia: se añade una cabeza de clasificación sobre las representaciones del token [CLS] para monitorizar reputación de marca o satisfacción de producto en plataformas locales.
- Identificación automática de dialecto y variedad regional: clasificación multi-etiqueta del país o región de origen del texto, útil para enrutar contenido a moderadores o sistemas de respuesta adecuados por variante lingüística.
- Normalización y procesamiento de arabizi: uso de las representaciones para tareas de transliteración o etiquetado de tokens en pipelines de limpieza de texto de redes sociales antes de otros análisis.
- Moderación de contenido en foros y plataformas del Magreb: clasificación de comentarios con code-switching árabe-francés, un escenario donde los filtros entrenados en MSA o en inglés rinden peor.
- Investigación lingüística y dialectología computacional: extracción de representaciones para estudios de variación léxica y ortográfica entre países magrebíes, así como modelo base para experimentos de probing sobre fenómenos de code-switching.
- Clasificación de temática en noticias y publicaciones sociales: afinado sobre el encoder para categorización de contenido en árabe magrebí, con la ventaja de un vocabulario de 100.000 tokens que cubre formas dialectales.

## Benchmarks y rendimiento

Evaluación intrínseca sobre el conjunto de test MLM fijo empleado durante el desarrollo:

| Metrica | MagharibiBERT |
|---|---|
| MLM loss | 2,8099 |
| Perplexity | 16,6080 |
| Precision de token enmascarado | 52,42% |

No se han publicado resultados de benchmarks extrínsecos (MMLU, HumanEval, GSM8K u otras tareas downstream) en la información disponible. La comparación con MARBERT y otros modelos árabes en tareas downstream está en curso según el autor.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,65 GB solo para pesos (162,9 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 2 GB para lotes pequeños.
- VRAM estimada en FP16/BF16: aproximadamente 0,33 GB para pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. Para entrenamiento o afinado con lotes grandes se recomienda RTX 4090, A100 o H100.
- Cabe en GPU consumer: sí, en cualquier GPU moderna con 4 GB o más (GTX 1650, RTX 3050 en adelante).
- Opciones de despliegue: transformers (PyTorch), pipeline de fill-mask, y exportación a ONNX para inferencia optimizada. No se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos decoder-only; para encoder-only la vía estándar es transformers u ONNX Runtime.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño (162,9 M de parámetros), se espera inferencia en CPU en decenas de milisegundos por secuencia corta y en GPU en pocos milisegundos, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque linguistico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MagharibiBERT | 162,9 M | 512 | Árabe magrebí, arabizi, code-switching | no disponible | Hugging Face (NumidiaNLP) |
| UBC-NLP/MARBERT | 162,9 M (arquitectura base) | 512 | Árabe general y dialectal (modelo padre) | no disponible en la información proporcionada | Hugging Face (UBC-NLP) |
| UBC-NLP/MARBERTv2 | no disponible en la información proporcionada | no disponible | Árabe general y dialectal, versión revisada | no disponible en la información proporcionada | Hugging Face (UBC-NLP) |
| CAMeLBERT | no disponible en la información proporcionada | 512 (BERT-base) | Árabe clásico, dialectal y de mezcla | no disponible en la información proporcionada | Hugging Face (CAMeL Lab) |

MagharibiBERT se distingue de MARBERT por el preentrenamiento continuado específico en 17 corpus magrebíes con cobertura explícita de arabizi y code-switching. No se dispone de comparación cuantitativa downstream publicada frente a MARBERT, MARBERTv2 o CAMeLBERT; el autor indica que esa evaluación está en curso.

## Limitaciones y advertencias

- El árabe magrebí es muy heterogéneo entre países, regiones, sistemas de escritura, plataformas y comunidades; el rendimiento puede variar notablemente entre dominios y variedades, y el modelo no representa por igual a todos los hablantes del norte de África.
- Riesgo de alucinación no aplica en el sentido generativo (es encoder-only), pero sí existe riesgo de predicciones erróneas o sesgadas en fill-mask y en clasificación downstream, especialmente en variedades poco representadas en el corpus.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible contactar con los autores o consultar el repositorio antes de un despliegue en producción.
- Longitud de contexto limitada a 512 tokens, insuficiente para documentos largos o hilos extensos de conversación.
- Vocabulario y corpus centrados en árabe y code-switching con francés/inglés; el rendimiento en otras lenguas o en árabe oriental no está garantizado ni documentado.
- Evaluación extrínseca pendiente: solo se publican métricas intrínsecas de MLM (loss 2,8099, perplexity 16,6080, accuracy 52,42%), sin resultados en tareas downstream, lo que limita la evaluación de su utilidad real frente a MARBERT.
- El modelo está pensado para investigación; no se documentan salvaguardas ni filtros de contenido para uso directo en producción.
- El artículo asociado está aceptado pero pendiente de publicación (Vol. 33, No. 4, diciembre de 2026), por lo que la referencia bibliográfica puede cambiar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NumidiaNLP/MagharibiBERT
- Modelo base MARBERT: https://huggingface.co/UBC-NLP/MARBERT
- Paper MARBERT (ARBERT & MARBERT, ACL-IJCNLP 2021): https://doi.org/10.18653/v1/2021.acl-long.551
- Organización NumidiaNLP en Hugging Face: https://huggingface.co/NumidiaNLP
- Contacto del autor correspondiente: ahmedzoubir.messalti@univ-setif.dz
- Institución: University Ferhat Abbas Sétif 1, Argelia
