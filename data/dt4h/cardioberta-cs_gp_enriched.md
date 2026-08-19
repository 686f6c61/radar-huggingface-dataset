# DT4H/CardioBERTa.cs_GP_enriched

## Resumen

`DT4H/CardioBERTa.cs_GP_enriched` es un codificador de terminología biomédica en checo, especializado en normalización de conceptos clínicos y entity linking. Desarrollado por el proyecto europeo DataTools4Heart (DT4H), forma parte de la familia CardioBERTa, una suite de pequeños modelos de lenguaje para el dominio de la cardiología. El modelo se inicializa desde `DT4H/CardioBERTa.cs`, un encoder basado en RoBERTa adaptado mediante preentrenamiento continuado con enmascaramiento de lenguaje (MLM) sobre corpus biomédicos y cardiológicos en checo, y se ajusta mediante aprendizaje métrico con tripletas supervisadas por conceptos UMLS (CUI).

El modelo resuelve el problema de enlazar términos clínicos en checo con conceptos estandarizados (p. ej., UMLS), una tarea crítica para pipelines de procesamiento de lenguaje natural clínico. Con aproximadamente 126 millones de parámetros, es un modelo compacto y eficiente, adecuado para despliegue en entornos con recursos limitados. Su relevancia actual radica en la escasez de recursos lingüísticos para el checo en el ámbito biomédico y en la necesidad de herramientas de interoperabilidad semántica en cardiología.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer) |
| Parámetros totales | 125.975.808 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado con max_length 25) |
| Tipos de cuantización | no disponible (pesos en F32) |
| Idiomas soportados | checo (`cs`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura RoBERTa, con una pila de capas transformer bidireccionales. El backbone `DT4H/CardioBERTa.cs` se obtuvo mediante preentrenamiento continuado con MLM sobre corpus biomédicos y cardiológicos en checo, dentro del marco CardioLM. Posteriormente, el modelo se ajustó con un objetivo de aprendizaje métrico: se construyeron tripletas ancla-positivo-negativo a partir de pares de términos supervisados por CUI, enriquecidos con relaciones ontológicas de nivel "grandparent" (abuelo) de UMLS. El entrenamiento utilizó Multi-Similarity Loss con minería de todas las tripletas (margen 0.2), pooling sobre el token CLS, una época, batch size de 256, learning rate 2e-5 y longitud máxima de 25 tokens.

La terminología de entrenamiento incluye 4.689.093 tripletas, que cubren 476.969 CUIs y 526.548 términos únicos normalizados. Los datos no se distribuyen por restricciones de licencia de UMLS, solo se publican estadísticas agregadas.

## Capacidades

- Generación de embeddings de terminología médica en checo, normalizados L2, listos para búsqueda de similitud coseno.
- Normalización de conceptos clínicos: asigna términos libres a conceptos UMLS estandarizados.
- Entity linking: enlaza menciones de entidades en texto clínico con identificadores de conceptos.
- Recuperación de candidatos biomédicos: dado un término, devuelve términos relacionados del mismo CUI o de CUIs vecinos.
- Integración en pipelines de NLP clínico como componente de enriquecimiento semántico.
- No soporta generación de texto, tool calling, agentes, visión ni audio; es exclusivamente un encoder para representaciones.

## Casos de uso

- **Normalización de diagnósticos en historiales clínicos checos**: el modelo puede mapear términos libres escritos por profesionales (p. ej., "infarkt myokardu") a conceptos UMLS estandarizados, facilitando la agregación y análisis de datos clínicos.
- **Codificación automática de procedimientos y diagnósticos**: integrado en sistemas de codificación ICD-10 o SNOMED CT, el modelo sugiere códigos a partir de descripciones en lenguaje natural, reduciendo el trabajo manual.
- **Búsqueda semántica en literatura biomédica**: permite recuperar artículos o documentos que mencionan conceptos relacionados con un término cardiológico dado, incluso si no comparten palabras exactas.
- **Enriquecimiento de bases de datos de ensayos clínicos**: al enlazar términos de criterios de inclusión/exclusión con UMLS, se mejora la interoperabilidad entre estudios y facilita el metaanálisis.
- **Soporte a sistemas de extracción de información**: como componente de un pipeline que extrae entidades de texto clínico, el modelo proporciona representaciones que alimentan clasificadores o reglas de enlazado.
- **Investigación en cardiología**: ayuda a construir cohortes fenotípicas a partir de registros electrónicos de salud en checo, normalizando variables clínicas heterogéneas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no reporta métricas como MMLU, HumanEval o similares, y no se encontraron evaluaciones externas en la búsqueda web.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de ~126M parámetros en precisión F32, la inferencia requiere aproximadamente 500 MB de memoria para los pesos. Con cuantización a 8 bits o 4 bits (si se aplicara), el requisito bajaría a ~250 MB o ~125 MB, respectivamente, aunque no se proporcionan versiones cuantizadas oficiales.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas de consumo como NVIDIA GTX 1050 Ti, RTX 2060 o superiores pueden ejecutarlo sin problemas. También funciona en CPU con baja latencia.
- **Compatibilidad con GPU de consumo**: sí, cabe en cualquier GPU moderna, incluso en sistemas sin GPU dedicada.
- **Opciones de despliegue**: compatible con Hugging Face Transformers, puede servirse con Text Embeddings Inference (TEI), o exportarse a ONNX para optimización. También es compatible con `sentence-transformers` para integración sencilla.
- **Latencia y throughput**: no hay datos oficiales, pero por tamaño se espera una latencia de pocos milisegundos por secuencia en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos en el dominio checo biomédico. No se han identificado alternativas públicas con características equivalentes (encoder checo para entity linking) en la búsqueda realizada. Se indica "no disponible".

## Limitaciones y advertencias

- **Idioma**: el modelo está entrenado exclusivamente en checo; no es aplicable a otros idiomas sin adaptación.
- **Uso clínico**: no está diseñado para decisiones clínicas directas; debe usarse como componente de investigación o apoyo, nunca como sustituto de criterio médico.
- **Longitud de contexto**: el entrenamiento usó una longitud máxima de 25 tokens, por lo que no se recomienda procesar textos largos; para secuencias mayores el rendimiento puede degradarse.
- **Dependencia de UMLS**: la terminología de entrenamiento está sujeta a licencias de UMLS; el modelo en sí no incluye los datos, pero los embeddings pueden reflejar sesgos de esa ontología.
- **Alucinación**: al ser un encoder, no genera texto, por lo que no hay riesgo de alucinación generativa; sin embargo, las representaciones pueden ser incorrectas para términos fuera del dominio de entrenamiento.
- **Sesgos**: los datos de entrenamiento provienen de corpus biomédicos y cardiológicos; pueden existir sesgos de género, edad o procedencia geográfica en los términos asociados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/CardioBERTa.cs_GP_enriched
- Modelo base (CardioBERTa.cs): https://huggingface.co/DT4H/CardioBERTa.cs
- Organización DT4H en Hugging Face: https://huggingface.co/DT4H
- Repositorio GitHub del proyecto: https://github.com/DataTools4Heart/
- Web del proyecto DataTools4Heart: https://www.datatools4heart.eu/
- Documentación del proyecto: https://datatools4heart.github.io/documentation-hub/
