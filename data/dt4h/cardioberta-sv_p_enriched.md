# DT4H/CardioBERTa.sv_P_enriched

## Resumen

CardioBERTa.sv_P_enriched es un codificador de terminología biomédica en sueco, desarrollado por el proyecto DataTools4Heart (DT4H), especializado en normalización de conceptos clínicos y entity linking. Se inicializa desde el modelo base CardioBERTa.sv y se entrena mediante aprendizaje métrico con tripletas supervisadas por conceptos UMLS, empleando relaciones de ontología de nivel "padre" para enriquecer el vocabulario. El modelo está pensado para tareas de recuperación de candidatos biomédicos, normalización de conceptos y enlazado de entidades en textos clínicos de cardiología.

Con 124,7 millones de parámetros (arquitectura BERT), este modelo es ligero y adecuado para entornos con recursos limitados. Su entrenamiento con 1,68 millones de tripletas y 539.077 términos normalizados únicos le permite representar términos médicos en un espacio vectorial donde conceptos equivalentes quedan próximos. Es una pieza clave en el ecosistema DT4H, que busca facilitar el análisis federado y privado de datos cardiológicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) |
| Parametros totales | 124.690.944 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 512 tokens (por defecto del backbone BERT; el entrenamiento usa max_length 25) |
| Tipos de cuantizacion | no disponible (solo safetensors FP32) |
| Idiomas soportados | Sueco (sv) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT, concretamente en la familia CardioBERTa, una suite de modelos pequeños específicos para el dominio de la cardiología. El backbone fue preentrenado de forma continua con MLM sobre corpus biomédicos y cardiológicos en sueco. Para esta variante, se ha aplicado un entrenamiento adicional con metric learning: se usan tripletas (ancla, positivo, negativo) donde los positivos son términos sinónimos o relacionados por relaciones ontológicas de tipo "padre" en UMLS. El objetivo es que el embedding de un término quede cerca de los de sus variantes y conceptos relacionados, usando Multi-Similarity Loss y pooling de CLS.

El entrenamiento se realizó durante una época con un batch de 256 y una tasa de aprendizaje de 2e-5, sobre 1.683.288 tripletas que cubren 476.433 CUIs y 539.077 términos únicos. La terminología de entrenamiento no se distribuye por restricciones de licencia de UMLS, solo se publican estadísticas agregadas.

## Capacidades

- Generación de embeddings de términos clínicos en sueco para representación semántica.
- Normalización de conceptos: mapear términos o frases a conceptos UMLS (CUIs).
- Entity linking: identificar entidades biomédicas en texto y enlazarlas a una ontología.
- Recuperación de candidatos: dado un término o concepto, encontrar términos relacionados o sinónimos en un espacio vectorial.
- Multilingüismo parcial: aunque el modelo es específico para sueco, pertenece a una familia multilingüe (CardioBERTa) con variantes para checo, neerlandés, inglés, italiano, rumano, español y sueco, pero este modelo solo procesa sueco.
- No soporta generación de texto, tool calling, ni razonamiento multi-paso; es un encoder puro para tareas de representación.

## Casos de uso

- Normalización de términos en historias clínicas electrónicas suecas: permite convertir descripciones clínicas en códigos de conceptos UMLS para estandarizar datos.
- Enlazado de entidades en artículos de investigación cardiológica: extrae términos como "infarto de miocardio" y los vincula a conceptos normalizados.
- Recuperación de información biomédica: dado un término de búsqueda, el modelo puede devolver términos sinónimos o relacionados para ampliar consultas en bases de datos.
- Soporte a pipelines de procesamiento de lenguaje clínico: integración como módulo de embedding en sistemas de extracción de información.
- Análisis de cohortes: al normalizar conceptos, permite agrupar pacientes con condiciones similares en bases de datos federadas.
- Generación de representaciones para clasificación de textos clínicos: los embeddings pueden servir como características para modelos supervisados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,5 GB en FP32 (124M parámetros), menos en cuantización (aunque no se ofrecen cuantizaciones).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; puede ejecutarse en CPU para inferencia por lotes pequeños.
- Es compatible con consumer GPU (GTX 1060, RTX 2060, etc.) y también con entornos sin GPU.
- Opciones de despliegue: se puede servir con Hugging Face Transformers (pipeline feature-extraction), también con vLLM o TEI (Text Embeddings Inference) dado que es compatible con endpoints de Hugging Face.
- Latencia: en CPU, una inferencia de un término corto (25 tokens) típicamente en milisegundos; en GPU, aún más rápido. No se dispone de mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Idioma | Parámetros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|---|
| CardioBERTa.sv_P_enriched | sueco | 124,7M | 512 | metric learning sobre UMLS | no disponible |
| CardioBERTa.sv (base) | sueco | 124,7M | 512 | MLM continuo en cardiología | no disponible |
| SapBERT (base, inglés) | inglés | 110M | 512 | metric learning sobre UMLS | MIT |
| BioBERT (inglés) | inglés | 110M | 512 | MLM en textos biomédicos | MIT |

El modelo se compara con SapBERT en cuanto a técnica de entrenamiento (metric learning sobre UMLS), pero está especializado en sueco y cardiología. No hay alternativas suecas comparables conocidas.

## Limitaciones y advertencias

- No es adecuado para uso clínico directo; no debe tomar decisiones médicas.
- El entrenamiento se limita a términos de longitud máxima 25 tokens, por lo que frases largas pueden perder información.
- Solo soporta sueco; no es multilingüe en este modelo concreto.
- La terminología de entrenamiento no está disponible por licencias UMLS, lo que puede limitar la reproducibilidad.
- No hay cuantizaciones publicadas, por lo que el despliegue en dispositivos con poca memoria requiere convertir el modelo.
- No se han publicado evaluaciones de sesgos o alucinaciones; como encoder no genera texto, pero los embeddings pueden heredar sesgos del corpus de preentrenamiento.
- La licencia no está especificada, por lo que el uso comercial puede ser incierto.

## Enlaces

- [Hugging Face: DT4H/CardioBERTa.sv_P_enriched](https://huggingface.co/DT4H/CardioBERTa.sv_P_enriched)
- [Hugging Face: DT4H/CardioBERTa.sv (base)](https://huggingface.co/DT4H/CardioBERTa.sv)
- [Hugging Face: DT4H/CardioBERTa.sv_GP_enriched (variante abuelos)](https://huggingface.co/DT4H/CardioBERTa.sv_GP_enriched)
- [GitHub de DataTools4Heart](https://github.com/DataTools4Heart/)
- [Página web del proyecto DataTools4Heart](https://www.datatools4heart.eu/)
- [Documentación de DataTools4Heart](https://datatools4heart.github.io/documentation-hub/)
