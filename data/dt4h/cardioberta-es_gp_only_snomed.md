# DT4H/CardioBERTa.es_GP_only_snomed

## Resumen

`DT4H/CardioBERTa.es_GP_only_snomed` es un codificador de terminología biomédica en español, especializado en normalización de conceptos clínicos y entity linking. Desarrollado por el consorcio DataTools4Heart (DT4H), se inicializa desde `DT4H/CardioBERTa.es`, un modelo de la familia CardioBERTa entrenado con MLM continuado sobre corpus cardiológicos y biomédicos monolingües. Su propósito es generar embeddings de términos clínicos que permitan recuperar candidatos y vincular menciones a conceptos normalizados (CUIs de UMLS) en pipelines de procesamiento de lenguaje natural clínico.

El modelo se entrena mediante metric learning con tripletas CUI-supervisadas, enriquecidas con relaciones ontológicas de nivel "grandparent" (abuelos) dentro de la ontología SNOMED. Con 125,9 millones de parámetros y una arquitectura transformer encoder (RoBERTa), ofrece una representación densa de términos que facilita la búsqueda semántica y la normalización de conceptos en el dominio cardiológico. Su relevancia actual radica en la creciente necesidad de interoperabilidad semántica en datos clínicos europeos, especialmente en proyectos federados como DT4H, donde la normalización de conceptos es un paso crítico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer) |
| Parametros totales | 125.978.112 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (entrenado con max_length 25; RoBERTa soporta hasta 512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Español (`es`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `DT4H/CardioBERTa.es`, un encoder de la familia CardioBERTa que a su vez parte de una arquitectura RoBERTa (transformers con atención bidireccional). CardioBERTa.es fue adaptado al dominio cardiológico mediante entrenamiento continuado con masked language modeling sobre corpus biomédicos y cardiológicos en español. Sobre este backbone, el modelo aquí descrito se especializa en normalización de conceptos mediante aprendizaje métrico: se construyen tripletas (ancla, positivo, negativo) a partir de pares de términos que comparten el mismo CUI (Concept Unique Identifier) de UMLS, y se enriquecen con relaciones ontológicas de nivel "grandparent" (es decir, los ancestros de segundo nivel en la jerarquía de SNOMED). El entrenamiento utiliza Multi-Similarity Loss con minería de todas las tripletas y un margen de 0,2, pooling sobre el token CLS, una época, batch size de 256, learning rate de 2e-5 y longitud máxima de secuencia de 25 tokens. Se emplearon 3.739.520 tripletas, cubriendo 474.247 CUIs y 467.722 términos únicos normalizados. La terminología de entrenamiento no se distribuye en el repositorio debido a las condiciones de licencia de UMLS.

## Capacidades

- Generación de embeddings de términos clínicos en español, normalizados y listos para búsqueda de similitud coseno.
- Entity linking: vincula menciones de texto clínico a conceptos UMLS (CUIs) mediante recuperación de candidatos y ranking.
- Normalización de conceptos: asigna términos variantes o coloquiales a un concepto canónico.
- Recuperación de candidatos biomédicos: dado un término, devuelve los conceptos más probables de una terminología.
- Soporte para pipelines de NLP clínico: se integra como capa de representación en sistemas de extracción de información.
- Multilingüe indirecto: al ser específico de español, no ofrece capacidades multilingües, pero la familia CardioBERTa cubre otros idiomas (checo, neerlandés, inglés, italiano, rumano, sueco).

## Casos de uso

- Normalización de diagnósticos en historiales clínicos electrónicos: el modelo permite mapear expresiones libres como "infarto de miocardio anterior" a su CUI correspondiente, facilitando la codificación estandarizada.
- Entity linking en notas clínicas de cardiología: extrae menciones de enfermedades, fármacos o procedimientos y las vincula a conceptos UMLS, habilitando búsquedas semánticas y análisis agregados.
- Interoperabilidad entre sistemas de salud: al normalizar términos a CUIs, se pueden armonizar datos procedentes de distintos hospitales o regiones con vocabularios heterogéneos.
- Enriquecimiento de ontologías: el embedding de términos puede usarse para detectar sinónimos o relaciones no explícitas en SNOMED o UMLS.
- Búsqueda semántica en literatura biomédica: dado un término de consulta, el modelo recupera artículos o pasajes que mencionan conceptos relacionados aunque no compartan palabras exactas.
- Preprocesamiento en pipelines de extracción de información clínica: como paso previo a tareas de relación o eventos, el modelo proporciona representaciones estables de conceptos que mejoran la robustez del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, dado que el modelo es un encoder de terminología y no un generador de texto. Tampoco se reportan evaluaciones específicas de entity linking o normalización de conceptos en el repositorio.

## Requisitos de hardware

- El modelo tiene 125,9 millones de parámetros, lo que en fp32 ocupa aproximadamente 504 MB y en fp16 unos 252 MB.
- Es ejecutable en CPU para inferencia de baja latencia, aunque en GPU se obtiene un rendimiento mucho mayor.
- Cabe en cualquier GPU consumer con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650 o superior).
- Para despliegue en producción, se recomienda usar `text-embeddings-inference` (el modelo es compatible con esta librería, según los tags) o `transformers` con `AutoModel`.
- También puede servirse mediante `sentence-transformers` si se envuelve como modelo de embeddings.
- No se dispone de datos oficiales de latencia o throughput.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de normalización de conceptos en español. Alternativas existentes en el dominio biomédico incluyen SapBERT (entrenado sobre UMLS en inglés) o BioBERT, pero no hay métricas comparables disponibles para este modelo. La familia CardioBERTa ofrece variantes por idioma, pero no se han publicado resultados comparativos entre ellas.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en español y especializado en cardiología; su rendimiento fuera de este dominio puede degradarse.
- No está diseñado para toma de decisiones clínicas directas; su uso es exclusivamente como componente de NLP.
- La terminología de entrenamiento no se distribuye por restricciones de licencia de UMLS, lo que limita la reproducibilidad completa del entrenamiento.
- La licencia del modelo no está especificada, por lo que se recomienda contactar con los autores antes de un uso comercial.
- El entrenamiento con tripletas puede introducir sesgos derivados de la ontología subyacente (SNOMED, UMLS), como desequilibrios en la cobertura de conceptos.
- La longitud máxima de secuencia utilizada en entrenamiento (25 tokens) puede no ser suficiente para términos o frases clínicas largas, aunque la arquitectura RoBERTa soporta hasta 512.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DT4H/CardioBERTa.es_GP_only_snomed
- Modelo base CardioBERTa.es: https://huggingface.co/DT4H/CardioBERTa.es
- Colección CardioNER (DT4H): https://huggingface.co/collections/DT4H/cardioner
- Organización GitHub de DataTools4Heart: https://github.com/DataTools4Heart/
- Proyecto DT4H en CORDIS: https://cordis.europa.eu/project/id/101057849
