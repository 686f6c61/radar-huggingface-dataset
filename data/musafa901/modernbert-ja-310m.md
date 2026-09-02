# musafa901/modernbert-ja-310m

## Resumen

ModernBERT-Ja-310M es un modelo de lenguaje enmascarado (masked language model) bilingüe japonés-inglés desarrollado por SB Intuitions, una empresa japonesa especializada en IA. Se trata de una adaptación de la arquitectura ModernBERT, presentada en el artículo "ModernBERT: Bringing BERT into modernity via both architecture changes and scaling" (arXiv:2412.13663), que combina atención local y global para procesar secuencias largas con alta eficiencia computacional.

El modelo cuenta con 315 millones de parámetros, una ventana de contexto de 8.192 tokens y un vocabulario de 102.400 entradas. Fue entrenado sobre un corpus de alta calidad de aproximadamente 4,09 billones de tokens (4,09T) en japonés e inglés, lo que lo convierte en uno de los modelos encoder bilingües más completos para estas lenguas. Su relevancia actual radica en que ofrece una alternativa moderna a BERT para tareas de comprensión del lenguaje en japonés, con soporte para secuencias largas y una licencia MIT que permite uso comercial sin restricciones.

Este repositorio concreto (musafa901/modernbert-ja-310m) es una copia del modelo original publicado por SB Intuitions, con los mismos pesos y configuración. Está diseñado principalmente para ser fine-tuneado en tareas downstream como clasificación de texto, extracción de respuestas o análisis de sentimiento, y no para generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer con atencion global y local) |
| Parametros totales | 315.304.960 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | bfloat16 (soporte Flash Attention 2) |
| Idiomas soportados | japones, ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ModernBERT-Ja-310M sigue la arquitectura ModernBERT original, que introduce una combinacion de atencion global y atencion local con ventana deslizante. La configuracion especifica es de 25 capas, dimension oculta de 768, dimension intermedia de 3.072 y dimension de cabeza de 64. La atencion se organiza en un patron de 1 capa global seguida de 2 capas locales (global-local-local), con un tamaño de ventana deslizante de 128 tokens. Utiliza RoPE (Rotary Positional Embedding) con un theta global de 160.000 y un theta local de 10.000, y funcion de activacion GELU.

El entrenamiento se realizo en tres fases. La primera fue un pre-entrenamiento con 3,51T tokens de datos web en japones e ingles, con secuencias de 1.024 tokens y empaquetado best-fit. La segunda fase fue de extension de contexto con 430B tokens de alta calidad, aumentando la longitud de secuencia a 8.192 tokens. La tercera fase, tambien de extension de contexto, uso 150B tokens exclusivamente en japones, sin empaquetado de secuencias y reduciendo la tasa de enmascaramiento del 30% al 15%, lo que mejoro el rendimiento del modelo. La tasa de enmascaramiento en las dos primeras fases fue del 30% con la regla 80-10-10.

El tokenizador es un SentencePiece con modelo unigram y byte fallback, tomado del modelo Sarashina2-13B de SB Intuitions. No se aplica pre-tokenizacion con tokenizador japones, por lo que se pueden introducir frases crudas directamente.

## Capacidades

- Enmascaramiento de lenguaje (fill-mask) en japones e ingles, con prediccion de tokens enmascarados de alta precision.
- Comprension de secuencias largas de hasta 8.192 tokens gracias a la combinacion de atencion global y local.
- Modelo encoder disenado para fine-tuning en tareas downstream: clasificacion de texto, analisis de sentimiento, respuesta a preguntas extractiva, inferencia de lenguaje natural y similaridad de texto.
- Soporte nativo bilingue japones-ingles, con vocabulario compartido de 102.400 entradas.
- Compatible con Flash Attention 2 para acelerar la inferencia en GPUs que lo soporten.
- Integracion directa con la libreria transformers de HuggingFace a partir de la version 4.48.0.

## Casos de uso

- Clasificacion de textos en japones: el modelo puede fine-tunearse para clasificar documentos, correos o resenas en japones, aprovechando su vocabulario amplio y su entrenamiento en corpus web de alta calidad. Es adecuado para dominios como atencion al cliente o moderacion de contenido.

- Analisis de sentimiento en redes sociales: gracias a su entrenamiento bilingue y su capacidad para manejar secuencias de hasta 8.192 tokens, puede procesar hilos completos de conversaciones o publicaciones largas en japones e ingles, capturando el contexto completo.

- Respuesta a preguntas extractiva: el modelo puede fine-tunearse en datasets como RCQA o JGLUE para extraer respuestas de pasajes largos, siendo util en sistemas de busqueda documental o asistentes virtuales que operan sobre manuales o documentacion tecnica en japones.

- Inferencia de lenguaje natural (NLI): con fine-tuning en datasets como JNLI o JSICK, el modelo puede determinar relaciones de implicacion, contradiccion o neutralidad entre pares de frases, util para sistemas de verificacion de hechos o busqueda semantica.

- Similaridad de texto y busqueda semantica: el modelo puede fine-tunearse para generar embeddings de frases y documentos, permitiendo construir sistemas de busqueda semantica en japones e ingles con soporte para contextos largos.

- Pre-procesamiento para pipelines de generacion: aunque no es un modelo generativo, puede usarse como encoder en arquitecturas encoder-decoder o como componente de representacion en sistemas de recuperacion aumentada (RAG) para mejorar la seleccion de documentos relevantes en japones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el modelo fue evaluado en 12 datasets, incluyendo JGLUE, JCommonsenseQA, RCQA, JCoLA, JNLI, JSICK y JSNLI, pero no se proporcionan las puntuaciones concretas. Se recomienda consultar el blog tecnico de SB Intuitions para obtener los resultados detallados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en bfloat16 (315M parametros × 2 bytes), mas overhead de activaciones. Con cuantizacion a int8, se reduce a unos 0,7 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia. Una RTX 3060, RTX 4060 o similar puede ejecutar el modelo sin problemas. Para fine-tuning, se recomienda una GPU con 8-12 GB de VRAM, como RTX 4070 o superior.
- Compatibilidad con consumer GPU: si, el modelo cabe en GPUs de consumo desde 4 GB de VRAM.
- Opciones de despliegue: transformers (pipeline fill-mask), vLLM para inferencia de alto rendimiento, y TGI (Text Generation Inference) de HuggingFace. No es compatible con llama.cpp u Ollama, ya que estos estan orientados a modelos generativos.
- Latencia y throughput: no disponible. Se espera una latencia baja en GPU moderna dado el tamaño del modelo, pero no se han publicado mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| ModernBERT-Ja-310M | 315M | 8.192 | ja, en | MIT | Bilingue, entrenado con 4,09T tokens |
| ModernBERT-base (AnswerDotAI) | 149M | 8.192 | en | Apache 2.0 | Solo ingles, 2T tokens de entrenamiento |
| ModernBERT-Ja-130M | 132M | 8.192 | ja, en | MIT | Version menor de la misma serie |
| ModernBERT-Ja-70M | 70M | 8.192 | ja, en | MIT | Version compacta de la misma serie |

La comparativa se limita a la familia ModernBERT, ya que no se dispone de datos de otros modelos encoder bilingues japones-ingles con caracteristicas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de generacion de texto: esta disenado exclusivamente para tareas de comprension del lenguaje (encoder). Intentar usarlo para generar texto producira resultados sin sentido.
- Rendimiento limitado en token classification: debido al tokenizador unigram, los limites de token no coinciden con los limites de morfemas, lo que degrada el rendimiento en tareas como reconocimiento de entidades nombradas o extraccion de spans.
- Requiere fine-tuning: el modelo esta pensado para ser adaptado a tareas especificas. Su uso directo se limita a fill-mask, que no es una tarea util en produccion.
- Sesgos potenciales: al estar entrenado principalmente con datos web, puede heredar sesgos presentes en esos corpus, especialmente en temas sociales o culturales.
- Riesgo de alucinacion: aunque es un modelo encoder y no genera texto libre, las predicciones de tokens enmascarados pueden ser incorrectas o contextualmente inapropiadas en dominios especializados.
- Idioma: aunque soporta ingles, su enfoque principal es el japones. El rendimiento en ingles puede ser inferior al de modelos especializados en ese idioma.

## Enlaces

- Repositorio HuggingFace (copia): https://huggingface.co/musafa901/modernbert-ja-310m
- Repositorio HuggingFace (original): https://huggingface.co/sbintuitions/modernbert-ja-310m
- Repositorio ModernBERT (AnswerDotAI): https://github.com/AnswerDotAI/ModernBERT
- Blog tecnico de SB Intuitions (desarrollo y evaluacion): https://www.sbintuitions.co.jp/blog/entry/2025/05/26/115815
- Paper ModernBERT: https://arxiv.org/abs/2412.13663
- Paper RoPE: https://arxiv.org/abs/2104.09864
- Paper best-fit packing: https://arxiv.org/abs/2404.10830
