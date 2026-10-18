# explolearner/termmap-weights

## Resumen

`explolearner/termmap-weights` es un repositorio de artefactos de pesos, no un modelo de lenguaje generativo. Publicado por el usuario de Hugging Face explolearner, empaqueta los componentes necesarios para TermMap, un motor de mapeo de términos clínicos a códigos ICD-10-CM y SNOMED CT. El repositorio ocupa 2,9 GB y se distribuye con licencia Apache-2.0.

El sistema combina recuperación densa sobre las descripciones de los diccionarios, mediante embeddings de SapBERT y BioLORD-2023 almacenados en float16, con un cross-encoder basado en `ncbi/MedCPT-Cross-Encoder` afinado para reordenar los 10 candidatos principales de cada término. No incluye pipeline declarado, idiomas documentados ni resultados de evaluación.

Su relevancia está en la normalización de terminología clínica para historiales electrónicos, facturación, investigación e interoperabilidad entre sistemas. Al no ser un LLM, no genera texto libre ni soporta tool calling; su valor está en la recuperación y el ranking de códigos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de enlazado de entidades clínicas: recuperación densa con SapBERT y BioLORD-2023 y reordenación con un cross-encoder MedCPT afinado. No es un transformer generativo único. |
| Parámetros totales | no disponible. El repositorio contiene un cross-encoder y dos conjuntos de embeddings; no se publica el recuento. |
| Parámetros activos | no aplica (no es MoE). |
| Longitud de contexto | no disponible; no aplica a generación de texto. La entrada es un término clínico y el sistema puntúa hasta 10 candidatos. |
| Tipos de cuantización | no disponible. Los embeddings se almacenan en float16; no se documentan cuantizaciones del cross-encoder. |
| Idiomas soportados | no disponible. |
| Licencia | Apache-2.0. |
| Formato de pesos | safetensors para el cross-encoder; matrices `.npy` en float16 para embeddings y códigos. |
| Tamaño del repositorio | 2,9 GB. |
| Pipeline de Hugging Face | no disponible. |

## Arquitectura y entrenamiento

El repositorio implementa un pipeline de enlazado de entidades en dos etapas. Primero, cada descripción de los diccionarios ICD-10-CM y SNOMED CT se representa con embeddings densos de SapBERT y de BioLORD-2023, guardados en float16 junto con sus códigos. Después, para un término de entrada se recuperan candidatos y un cross-encoder MedCPT afinado reordena los 10 mejores. No se especifica si los dos espacios de embeddings se combinan, se concatenan o se usan como recuperadores alternativos.

No se publican datos de entrenamiento: ni el número de pares término-código, ni la composición del corpus, ni el proceso de afinado del cross-encoder. No hay RLHF ni DPO, ya que no es un modelo generativo. La innovación principal es el empaquetado reproducible de recuperadores densos y un reordenador para terminología clínica.

## Capacidades

- Mapeo de términos clínicos a códigos ICD-10-CM.
- Mapeo de términos clínicos a códigos SNOMED CT.
- Recuperación de candidatos mediante similitud densa sobre descripciones de diccionarios.
- Reordenación de hasta 10 candidatos por término mediante un cross-encoder.
- Integración en pipelines de NLP clínico en Python a través del repositorio TermMap.
- No genera texto libre, resúmenes ni explicaciones.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües.
- No incluye visión, audio, modo thinking ni contexto largo.

## Casos de uso

- Codificación automática de diagnósticos en historiales electrónicos: un sistema de NER extrae el término clínico y TermMap devuelve los códigos ICD-10-CM candidatos; el cross-encoder reordena los 10 mejores para que el codificador humano valide. Es adecuado porque combina recuperación densa y reordenación, pero exige revisión.
- Normalización de listas de problemas a SNOMED CT: las descripciones locales se mapean a conceptos SNOMED para interoperabilidad entre sistemas; los embeddings permiten recuperar candidatos aunque la redacción varíe.
- Apoyo a la codificación profesional: una interfaz muestra los 10 candidatos con puntuación para reducir el tiempo de búsqueda manual en tablas de códigos.
- Facturación y reclamaciones: mapeo de diagnósticos de una nota clínica a ICD-10-CM para preparar reclamaciones; el sistema sugiere códigos y el equipo de facturación valida.
- Investigación y definición de cohortes: traducción de criterios de inclusión clínicos a códigos ICD-10-CM o SNOMED CT para consultas sobre bases de datos; útil para estudios observacionales.
- Migración de catálogos legacy: conversión por lotes de descripciones y códigos antiguos a ICD-10-CM o SNOMED CT; los embeddings manejan variantes terminológicas.
- Auditoría de calidad de codificación: comparación de códigos asignados manualmente con los candidatos del modelo para detectar discrepancias y revisar casos dudosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de exactitud, recall@10, MRR, MMLU, HumanEval o GSM8K, ni comparaciones con otros sistemas de enlazado de entidades clínicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publica el tamaño del cross-encoder ni el número de descripciones; los embeddings se almacenan en float16 y el repositorio completo ocupa 2,9 GB.
- GPU recomendadas: no disponibles. No se indican A100, H100, RTX 4090 ni otros modelos.
- GPU de consumo: no confirmado. No hay datos para afirmar que el pipeline completo quepa en una GPU de consumo.
- CPU: no documentado. No se publican latencias ni rendimiento en CPU.
- Opciones de despliegue: integración en Python mediante el repositorio TermMap; descarga de artefactos con `python -m termmap fetch-artifacts`. No se documentan vLLM, llama.cpp, Ollama, TGI ni endpoints de inferencia.
- Latencia y throughput: no disponibles.
- Almacenamiento: 2,9 GB para el repositorio; no se detalla el espacio adicional para diccionarios completos.

## Comparativa con modelos similares

| Sistema | Enfoque | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TermMap (este repositorio) | Recuperación densa con SapBERT y BioLORD-2023 + reordenación con cross-encoder MedCPT | no disponible | no aplica (entrada de término corto) | no disponible | Apache-2.0 | Pesos en Hugging Face y código en GitHub |
| SapBERT | Embeddings densos y similitud vectorial | no disponible | no aplica | no disponible | no disponible | Componente citado; sin enlace en la información |
| BioLORD-2023 | Embeddings densos y similitud vectorial | no disponible | no aplica | no disponible | no disponible | Componente citado; sin enlace en la información |
| MedCPT-Cross-Encoder | Cross-encoder para reordenación de candidatos | no disponible | no aplica | no disponible | no disponible | Componente citado; enlace de Hugging Face en la sección de enlaces |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, justificaciones ni explicaciones; solo devuelve candidatos y puntuaciones.
- No hay evaluación publicada; no se puede afirmar su precisión en ICD-10-CM o SNOMED CT.
- Depende de diccionarios y artefactos externos; las actualizaciones de ICD-10-CM o SNOMED CT pueden requerir regenerar embeddings y reindexar.
- Riesgo de falsos positivos: un término puede recibir un código incorrecto con una puntuación alta; requiere revisión humana en entornos clínicos, de facturación o regulatorios.
- Sesgos: no evaluados; los diccionarios y los modelos subyacentes pueden reflejar sesgos terminológicos o de cobertura.
- Idiomas: no documentados; no se puede asumir soporte multilingüe.
- Licencia: Apache-2.0 cubre este repositorio, pero hay que verificar las condiciones de los componentes de terceros y de los diccionarios antes de un uso comercial.
- Madurez: 0 descargas, 1 like, sin pipeline declarado, sin demo y con creación y actualización el mismo día (2026-10-18).
- No apto como dispositivo médico sin validación clínica y regulatoria.
- No soporta tool calling, agentes, visión, audio ni contexto largo.

## Enlaces

- [Hugging Face: explolearner/termmap-weights](https://huggingface.co/explolearner/termmap-weights)
- [GitHub: HiLabs-TermMap](https://github.com/brindoxx/HiLabs-TermMap)
- [Hugging Face: ncbi/MedCPT-Cross-Encoder](https://huggingface.co/ncbi/MedCPT-Cross-Encoder)
- No se han encontrado enlaces adicionales relevantes en la búsqueda web.
