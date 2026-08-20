# DT4H/CardioBERTa.ro_translations_only

## Resumen

`DT4H/CardioBERTa.ro_translations_only` es un codificador de terminología biomédica en rumano diseñado para la normalización de conceptos clínicos y el entity linking. El modelo se inicializa desde `DT4H/CardioBERTa.ro`, perteneciente a la familia CardioBERTa de CardioLM, una suite multilingüe de modelos de lenguaje pequeños para el dominio de la cardiología desarrollada dentro del proyecto europeo DataTools4Heart (DT4H). Su función principal es generar embeddings de términos clínicos que permiten recuperar candidatos y asociar menciones textuales a conceptos del Sistema de Lenguaje Médico Unificado (UMLS).

El modelo se especializa mediante aprendizaje métrico supervisado por CUIs, utilizando pares de sinónimos extraídos de la terminología UMLS. Con 278 millones de parámetros y una arquitectura XLM-RoBERTa, está optimizado para secuencias cortas (máximo 25 tokens), lo que lo hace adecuado para pipelines de procesamiento de lenguaje natural clínico donde se requiere normalizar entidades de manera eficiente y precisa. Su relevancia actual reside en la necesidad de estandarizar informes de cardiología en entornos multilingües europeos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (Transformer encoder) |
| Parametros totales | 278.043.648 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (entrenado con max_length=25) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | rumano (`ro`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo pertenece a la familia CardioBERTa, que se basa en la arquitectura XLM-RoBERTa y se adapta al dominio de la cardiología mediante entrenamiento continuado con modelado de lenguaje enmascarado (MLM) sobre corpus biomédicos y cardiológicos monolingües. La familia cubre siete idiomas: checo, neerlandés, inglés, italiano, rumano, español y sueco.

La especialización para la normalización de conceptos se realiza con aprendizaje métrico. Se entrenan tripletas (ancla, positivo, negativo) supervisadas por CUIs (Concept Unique Identifiers del UMLS) usando la estrategia de sinónimos: pares de términos que comparten el mismo CUI. El objetivo de entrenamiento es la Multi-Similarity Loss, con minería de todas las tripletas y margen de 0.2. El pooling se realiza sobre el token CLS, con un tamaño de lote de 256, una tasa de aprendizaje de 2e-5 y una única época. La terminología de entrenamiento no se distribuye por restricciones de licencia de UMLS; solo se publican estadísticas agregadas.

## Capacidades

- Generación de embeddings de terminología clínica para normalización de conceptos y entity linking.
- Recuperación de candidatos biomédicos mediante similitud coseno entre vectores normalizados.
- Soporte de asociación de menciones textuales a conceptos UMLS en rumano.
- Especialización en el dominio de la cardiología y la terminología biomédica general.
- Integración con pipelines de transformers y text-embeddings-inference.
- Uso como backbone para tareas de normalización de conceptos y enriquecimiento de datos clínicos.

## Casos de uso

- Normalización de entidades clínicas en informes de cardiología: el modelo permite transformar menciones libres (p. ej., "infarct miocardic acut") en conceptos UMLS estandarizados, facilitando la interoperabilidad de datos clínicos entre hospitales y sistemas de información.
- Construcción de pipelines de entity linking en rumano: se puede integrar en un sistema que extrae entidades de textos clínicos y las asocia a bases de conocimiento como UMLS, mejorando la precisión de búsquedas y análisis retrospectivos.
- Enriquecimiento de registros de pacientes para investigación: los embeddings generados permiten agrupar términos sinónimos en una base de datos de pacientes, lo que facilita estudios epidemiológicos sobre cardiología con datos heterogéneos.
- Sistemas de soporte a la decisión clínica: el modelo puede servir como componente de normalización en herramientas que procesan informes de ecocardiogramas, electrocardiogramas o notas de alta, reduciendo la variabilidad terminológica antes de aplicar reglas clínicas.
- Análisis de literatura biomédica en rumano: permite mapear artículos o abstracts a conceptos UMLS para construir grafos de conocimiento o sistemas de recomendación de literatura médica.
- Preparación de datos para entrenamiento de modelos de lenguaje más grandes: los embeddings generados pueden servir como características de entrada en modelos de clasificación o extracción de relaciones en el dominio clínico rumano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 278M parámetros en FP16, el modelo requiere aproximadamente 556 MB de memoria para los pesos. Con cuantización a 8 bits, se reduce a unos 278 MB. No se dispone de datos sobre cuantizaciones específicas.
- GPU recomendadas: el modelo es pequeño y puede ejecutarse en GPU de consumo como una NVIDIA GTX 1080 Ti (11 GB) o RTX 3060 (12 GB) con espacio suficiente para el lote y el contexto corto. También es viable en CPU para tareas batch pequeñas.
- En consumer GPU: sí, cabe en cualquier GPU con al menos 2 GB de VRAM para inferencia en FP16.
- Opciones de despliegue: se puede servir con `transformers` de HuggingFace, `sentence-transformers`, `text-embeddings-inference` (TEI) o `vLLM` (si se convierte a un formato compatible). Para producción ligera, también es posible exportar a ONNX o TensorRT.
- Latencia y throughput: no se dispone de datos concretos; al ser un encoder pequeño y con secuencias cortas, se espera una latencia inferior a 10 ms por consulta en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Uso principal |
|---|---|---|---|---|---|
| `DT4H/CardioBERTa.ro_translations_only` | 278M | max 25 | rumano | no disponible | Normalización de conceptos clínicos |
| `DT4H/CardioBERTa.ro_GP_translations_only` | 278M | max 25 | rumano | no disponible | Normalización con estrategia "grandparents" (más términos) |
| `XLM-RoBERTa-base` | 278M | 512 | multilingüe (100 idiomas) | MIT | Modelo general de lenguaje multilingüe |
| `BioBERT` (variante) | 110M | 512 | inglés | MIT | Modelo biomédico general en inglés |

La comparativa directa con modelos multilingües como XLM-RoBERTa muestra que el modelo CardioBERTa está especializado en terminología clínica rumana, mientras que XLM-RoBERTa es un modelo general sin adaptación al dominio médico. La variante `GP_translations_only` del mismo CardioBERTa usa la estrategia de "grandparents" que expande el vocabulario de términos de entrenamiento, pero el modelo `translations_only` es más ligero en datos y más específico para sinónimos directos.

## Limitaciones y advertencias

- El modelo se ha entrenado exclusivamente para rumano; no es útil para otros idiomas sin adaptación adicional.
- La longitud máxima de entrada es de 25 caracteres (por configuración de entrenamiento), lo que limita el procesamiento de frases largas o descripciones clínicas extensas.
- La terminología de entrenamiento no se distribuye por restricciones de licencia de UMLS, lo que puede dificultar la reproducción exacta del entrenamiento.
- No está diseñado para toma de decisiones clínicas directas; es solo un componente de procesamiento de lenguaje natural.
- Puede presentar sesgos derivados de los corpus de cardiología utilizados en la adaptación previa, lo que puede afectar a poblaciones subrepresentadas.
- Riesgo de alucinación en la asociación de términos: si el modelo no ha visto una variante terminológica, puede generar embeddings que se alejen del concepto correcto, afectando la recuperación.

## Enlaces

- HuggingFace: https://huggingface.co/DT4H/CardioBERTa.ro_translations_only
- Modelo base: https://huggingface.co/DT4H/CardioBERTa.ro
- Colección CardioBERTa Family: https://huggingface.co/collections/DT4H/cardioberta-family
- GitHub DataTools4Heart: https://github.com/DataTools4Heart/
- Web del proyecto DT4H: https://www.datatools4heart.eu/
- Publicaciones del proyecto: https://www.datatools4heart.eu/publications/
