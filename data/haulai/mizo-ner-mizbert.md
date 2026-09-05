# haulai/mizo-ner-mizbert

## Resumen

`haulai/mizo-ner-mizbert` es un modelo de reconocimiento de entidades nombradas (NER) para el idioma mizo (código ISO `lus`), una lengua tibeto-birmana hablada principalmente en Mizoram (India). Está desarrollado por `haulai` y se publica como un fine-tuning del modelo `robzchhangte/MizBERT`, el primer modelo de lenguaje preentrenado específico para mizo. El modelo resuelve la tarea de token classification para extraer entidades en textos mizo, un área con muy pocos recursos lingüísticos y escasa representación en el ecosistema de NLP.

Desde el punto de vista técnico, es un modelo encoder-only basado en la arquitectura BERT, con 108.909.335 parámetros. La longitud de contexto no se especifica en la información disponible, aunque al tratarse de un BERT probablemente sea la estándar de 512 tokens. El modelo se entrenó sobre el corpus `haulai/mizo-ner`, compuesto por 441.178 oraciones con etiquetas silver-standard, y ofrece dos métricas de rendimiento: un micro F1 de 0.8788 sobre el conjunto de prueba silver y un F1 de 0.6414 sobre una evaluación gold realizada por anotadores humanos. Su relevancia radica en cubrir un hueco crítico para el procesamiento automático de una lengua de baja disponibilidad, facilitando tareas de extracción de información en dominios como periodismo, archivos históricos o investigación lingüística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only) basado en MizBERT |
| Parametros totales | 108.909.335 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | lus (mizo) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre `robzchhangte/MizBERT`, un modelo BERT preentrenado específicamente para la lengua mizo. Se realiza un fine-tuning supervisado para token classification sobre el corpus `haulai/mizo-ner`, que contiene 441.178 oraciones con etiquetas silver-standard. Las etiquetas silver se generaron mediante proyección automática desde otro recurso, por lo que no son anotaciones humanas de referencia. No se menciona el uso de RLHF, DPO ni ninguna técnica de alineación posterior. Tampoco se documentan innovaciones arquitectónicas: se trata de un fine-tuning estándar de un modelo BERT de baja resolución.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en texto mizo, incluyendo personas, lugares y organizaciones, entre otras categorías de entidades.
- Token classification con soporte para la estrategia de agregación `simple` de Hugging Face Transformers, como se muestra en el ejemplo de uso de la model card.
- Generación de predicciones sobre oraciones que contienen entidades. El modelo fue entrenado exclusivamente con oraciones que presentan entidades, por lo que su comportamiento en texto sin entidades no está probado.
- No soporta tool calling, function calling, razonamiento multi-paso, visión ni audio. Es un modelo exclusivamente de clasificación de tokens para texto.
- Multilingüe: no. Solo está entrenado y documentado para el idioma mizo (lus).

## Casos de uso

- Extracción de entidades en noticias en mizo: el modelo puede identificar automáticamente nombres de personas, lugares y organizaciones en artículos periodísticos de medios locales de Mizoram, facilitando la indexación y búsqueda de información.
- Digitalización de archivos históricos en mizo: al procesar documentos escaneados o transcritos, el modelo permite etiquetar entidades para crear bases de datos consultables, útil para investigadores de historia y lingüística.
- Análisis de redes sociales en mizo: permite detectar menciones de personas, lugares y eventos en publicaciones de Facebook, Twitter o foros, útil para estudios sociolingüísticos o seguimiento de temas.
- Enriquecimiento de corpus lingüísticos: el modelo puede etiquetar automáticamente nuevas colecciones de textos mizo para entrenar otros modelos de NLP de la lengua, reduciendo el coste de anotación manual.
- Sistemas de alerta temprana: en contextos de monitorización de noticias o comunicados en mizo, el modelo puede extraer entidades relevantes para detectar eventos, accidentes o declaraciones de figuras públicas.
- Apoyo a la traducción asistida: al identificar entidades en el texto fuente mizo, un traductor humano o automático puede preservar correctamente nombres propios y topónimos en la traducción a otros idiomas.

## Benchmarks y rendimiento

| Metrica | Valor | Nota |
|---|---|---|
| Micro F1 (silver test) | 0.8788 | Acuerdo con la proyección automática, no precisión real |
| F1 (gold, 300 oraciones) | 0.6414 | Evaluación con anotaciones humanas de dos hablantes de mizo |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor advierte que el valor silver debe interpretarse como concordancia con las etiquetas proyectadas, no como exactitud, y que el rendimiento real sobre anotaciones humanas es sustancialmente inferior.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 108.909.335 parámetros, en FP32 ocupa aproximadamente 435 MB y en FP16 unos 218 MB. Para inferencia con lotes pequeños se estima un consumo de VRAM inferior a 2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050, RTX 3050) es suficiente. También puede ejecutarse en CPU con un rendimiento aceptable para tareas de NER de baja latencia.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo moderna.
- Opciones de despliegue: el modelo se puede cargar directamente con Hugging Face Transformers mediante el pipeline `token-classification`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se proporcionan datos medidos en la información disponible.

## Comparativa con modelos similares

No se han identificado modelos comparables en la información disponible. El modelo es específico para la lengua mizo y no existen alternativas públicas de NER para esta lengua documentadas en los datos proporcionados. El modelo base MizBERT no es un modelo NER, sino un modelo de lenguaje preentrenado, por lo que no es directamente comparable.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento son silver-standard, generadas por proyección automática, no por anotación humana. Esto implica que el modelo puede heredar errores de la proyección y que su precisión real es menor que la reflejada en el conjunto silver.
- El rendimiento sobre anotaciones humanas (gold F1 = 0.6414) es significativamente inferior al rendimiento sobre el conjunto silver (0.8788). Debe tenerse en cuenta antes de usar el modelo en aplicaciones críticas.
- El modelo fue entrenado únicamente con oraciones que contienen entidades. Su comportamiento en texto sin entidades o con baja densidad de entidades no ha sido probado, por lo que puede producir falsos positivos o comportamientos inesperados en ese tipo de texto.
- Solo soporta el idioma mizo. No se garantiza ningún rendimiento en otros idiomas.
- La licencia CC-BY-4.0 permite el uso comercial con atribución, pero no se ha evaluado su idoneidad para dominios específicos ni se han documentado sesgos conocidos.
- No se dispone de información sobre la longitud de contexto, los tipos de cuantización ni el soporte para otras infraestructuras de despliegue, lo que limita su integración en sistemas que requieran esas características.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haulai/mizo-ner-mizbert
- Dataset de entrenamiento: https://huggingface.co/datasets/haulai/mizo-ner
- Repositorio de código: https://github.com/thangkhanhau/mizo-ner
- Paper de MizBERT (ACM Digital Library): https://dl.acm.org/doi/abs/10.1145/3666003
