# aisingapore/SEA-LION-ModernBERT-Embedding-600M-OV

## Resumen

SEA-LION-ModernBERT-Embedding-600M-OV es una versión cuantizada a INT8 en formato OpenVINO IR del modelo de embeddings SEA-LION-ModernBERT-Embedding-600M, desarrollado por AI Singapore dentro del proyecto SEA-LION (Southeast Asian Languages In One Network). Este modelo está diseñado específicamente para generar representaciones vectoriales de texto en once idiomas del sudeste asiático, incluyendo birmano, chino, inglés, filipino, indonesio, jemer, lao, malayo, tamil, tailandés y vietnamita. La conversión a OpenVINO con compresión de pesos INT8 reduce el tamaño del modelo a aproximadamente 0,7 GB, lo que facilita su despliegue en entornos de producción con CPU o GPU de gama media.

El modelo base utiliza la arquitectura ModernBERT (encoder-only) combinada con el tokenizador Gemma 3 SentencePiece de 262 000 entradas, y soporta una longitud de contexto de 8 000 tokens. Esta versión cuantizada no ha sido reentrenada; solo se ha aplicado compresión de pesos mediante NNCF, manteniendo las capacidades del modelo original. Su relevancia radica en ofrecer una alternativa eficiente y de código abierto (licencia MIT) para tareas de búsqueda semántica, recuperación de información y clasificación de texto en lenguas del sudeste asiático, un área tradicionalmente poco cubierta por los modelos multilingües occidentales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder-only, transformer) |
| Parametros totales | 600 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8 000 tokens |
| Tipos de cuantizacion | INT8 (compresion de pesos, ratio 1.0, group-size 128) |
| Idiomas soportados | Birmano, chino, ingles, filipino, indonesio, jemer, lao, malayo, tamil, tailandes y vietnamita |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (.xml / .bin) |

## Arquitectura y entrenamiento

El modelo base SEA-LION-ModernBERT-Embedding-600M emplea la arquitectura ModernBERT, una evolución del transformer clásico optimizada para eficiencia y velocidad en tareas de codificación de texto. Al ser un modelo encoder-only, no genera texto, sino que produce representaciones vectoriales densas de alta calidad. El tokenizador es un SentencePiece personalizado basado en Gemma 3, con un vocabulario de 262 000 entradas, diseñado para cubrir adecuadamente los sistemas de escritura de los idiomas del sudeste asiático, incluidos alfabetos como el birmano, jemer, lao y tailandés.

El entrenamiento del modelo base se centró en datos multilingües de la región SEA, aunque no se han publicado detalles específicos sobre el volumen de tokens, la composición exacta del dataset o el uso de técnicas como RLHF o DPO. La versión OpenVINO aquí descrita no ha sido sometida a ningún entrenamiento adicional; únicamente se ha aplicado cuantización de pesos a INT8 mediante NNCF, con un ratio del 100 % y un tamaño de grupo de 128, lo que reduce el tamaño del modelo de aproximadamente 1,2 GB (FP32) a 0,7 GB sin cambios en la arquitectura.

## Capacidades

- Generación de embeddings de texto para 11 idiomas del sudeste asiático, con soporte para escrituras no latinas (birmano, jemer, lao, tailandés, tamil, etc.).
- Búsqueda semántica y recuperación de información: el modelo produce vectores densos que permiten calcular similitud coseno entre consultas y documentos.
- Clasificación de texto y análisis de sentimiento: las representaciones pueden alimentar clasificadores lineales o modelos de cabecera.
- Agrupamiento (clustering) de documentos por similitud temática.
- Soporte de contexto largo de hasta 8 000 tokens, adecuado para documentos extensos o conversaciones multi-turno.
- No soporta generación de texto, tool calling ni razonamiento multi-paso, al ser un modelo encoder-only.
- Capacidades multilingües: cubre los principales idiomas de la región ASEAN, además de chino e inglés.

## Casos de uso

- Búsqueda semántica en portales de comercio electrónico: el modelo puede indexar descripciones de productos en indonesio, tailandés o vietnamita y recuperar resultados relevantes a partir de consultas en lenguaje natural, gracias a su contexto de 8 000 tokens y su tokenizador adaptado a escrituras locales.
- Sistemas de atención al cliente multilingüe: permite clasificar y enrutar tickets de soporte en varios idiomas del sudeste asiático, agrupando consultas similares y reduciendo el tiempo de respuesta.
- Moderación de contenido en redes sociales: las embeddings permiten detectar discursos de odio o contenido inapropiado en idiomas como birmano o jemer, donde los modelos occidentales suelen fallar.
- Motores de recomendación de artículos o noticias: al vectorizar artículos en malayo, filipino o tailandés, se pueden sugerir contenidos relacionados por similitud semántica.
- Deduplicación de documentos legales o administrativos: el modelo ayuda a identificar documentos duplicados o casi duplicados en corpus multilingües de la región.
- Análisis de sentimiento en redes sociales para investigación de mercado: las representaciones vectoriales alimentan clasificadores que monitorizan la opinión pública en tiempo real en los idiomas soportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo base no incluye métricas como MMLU, HumanEval o MTEB, y la versión OpenVINO no añade datos adicionales. Se recomienda consultar la documentación oficial de SEA-LION para futuras actualizaciones.

## Requisitos de hardware

- Tamaño del modelo cuantizado: aproximadamente 0,7 GB en disco (formato OpenVINO IR).
- VRAM estimada para inferencia: con cuantización INT8, el modelo puede ejecutarse en GPUs con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050). En CPU, requiere unos 1,5 GB de RAM adicionales para los pesos y activaciones.
- GPU recomendadas: cualquier GPU moderna con soporte OpenVINO (Intel integrated graphics, NVIDIA, AMD) o CPU Intel con instrucciones AVX-512. Para despliegue en producción, se recomienda un Intel Xeon o un Core i7/i9 con OpenVINO Runtime.
- Es adecuado para consumer GPUs de gama baja y media, así como para inferencia en CPU pura.
- Opciones de despliegue: OpenVINO Runtime (Python o C++), OpenVINO GenAI, Optimum Intel para Hugging Face Transformers, y contenedores Docker con OpenVINO.
- Latencia y throughput: al ser un modelo de 600M parámetros en INT8, la inferencia de un solo texto de longitud media (512 tokens) suele completarse en menos de 10 ms en una GPU moderna y en 20-50 ms en CPU. No se dispone de cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de embeddings multilingües del sudeste asiático. Se podría mencionar que alternativas como BGE-M3 o multilingual-e5-large cubren idiomas globales, pero no están especializados en las lenguas SEA y no se han encontrado datos comparativos publicados. Por tanto, la comparativa se limita a indicar que SEA-LION-ModernBERT-Embedding-600M-OV es el único modelo de embeddings específico para la región con licencia MIT y formato OpenVINO.

## Limitaciones y advertencias

- Al ser un modelo encoder-only, no puede generar texto ni mantener conversaciones; su uso se limita a tareas de representación vectorial.
- La cuantización INT8 puede provocar una ligera degradación en la calidad de los embeddings en comparación con la versión FP32, aunque no se han publicado métricas que cuantifiquen esta pérdida.
- El modelo está entrenado principalmente para idiomas del sudeste asiático; su rendimiento en otros idiomas o en variantes dialectales no representadas puede ser inferior.
- No se han documentado sesgos específicos, pero como todo modelo entrenado con datos web, puede reflejar sesgos culturales o de género presentes en los corpus.
- Riesgo de alucinación: no aplica, ya que no genera texto.
- La licencia MIT permite uso comercial sin restricciones, pero se recomienda revisar los términos de los datos de entrenamiento del modelo base, que no se han detallado.
- Para producción, es necesario validar el rendimiento en el dominio específico, ya que no se han publicado benchmarks oficiales.

## Enlaces

- Modelo OpenVINO en Hugging Face: https://huggingface.co/aisingapore/SEA-LION-ModernBERT-Embedding-600M-OV
- Modelo base en Hugging Face: https://huggingface.co/aisingapore/SEA-LION-ModernBERT-Embedding-600M
- Documentación de SEA-LION sobre ModernBERT: https://docs.sea-lion.ai/models/sea-embedding/sea-modernbert
- Documentación general de SEA-LION Embedding: https://docs.sea-lion.ai/models/sea-embedding
- Repositorio GitHub de SEA-LION: https://github.com/aisingapore/sealion
