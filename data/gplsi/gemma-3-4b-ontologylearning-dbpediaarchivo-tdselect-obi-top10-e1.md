# gplsi/Gemma-3-4B-OntologyLearning-DBpediaArchivo-TDSelect-OBI-Top10-e1

## Resumen

El modelo `gplsi/Gemma-3-4B-OntologyLearning-DBpediaArchivo-TDSelect-OBI-Top10-e1` es un ajuste fino (fine-tuning) del modelo base Gemma 3 de 4B de parámetros, publicado por el grupo de investigación GPLSI (Grupo de Procesamiento del Lenguaje y Sistemas de Información). Su propósito declarado, deducible del propio identificador del repositorio, es el aprendizaje de ontologías (ontology learning) a partir de la arquitectura DBpedia, con una configuración de selección de términos (TDSelect) y evaluación sobre la ontología OBI limitada a los 10 términos más relevantes (Top10), en su primera época de entrenamiento (e1).

El modelo cuenta con 4.300.079.472 parámetros totales en formato safetensors, con un tamaño de repositorio de 8,6 GB, lo que es coherente con pesos en precisión de 16 bits. La licencia declarada es Apache 2.0, lo que facilita su reutilización tanto en investigación como en entornos comerciales, siempre respetando los términos de la licencia del modelo base Gemma 3.

La relevancia de este modelo radica en su especialización vertical: se trata de un artefacto de investigación orientado a la extracción y estructuración de conocimiento ontológico, un área donde los modelos de propósito general rinden de forma irregular. Al estar construido sobre Gemma 3 4B, hereda las capacidades lingüísticas y de razonamiento del modelo base, pero adaptadas a una tarea concreta y acotada. No obstante, la información pública disponible es muy limitada: no se han publicado resultados de benchmarks, idiomas soportados ni detalles del dataset de entrenamiento en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), ajuste fino supervisado |
| Parámetros totales | 4.300.079.472 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 3, un transformer decoder-only con atención multi-cabeza y mecanismos de atención local/global que el modelo base emplea para gestionar contextos largos. El ajuste fino se ha realizado sobre el checkpoint de 4B de parámetros, manteniendo la estructura original y modificando únicamente los pesos mediante entrenamiento supervisado sobre una tarea de aprendizaje de ontologías.

Según el identificador del repositorio, el entrenamiento se ha llevado a cabo con una configuración denominada TDSelect (probablemente una estrategia de selección de términos o tripletas) sobre la arquitectura DBpedia, evaluando contra la ontología OBI y limitando el conjunto a los 10 términos más relevantes (Top10). La "e1" indica que se trata de la primera época de entrenamiento. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá del propio ajuste fino.

## Capacidades

- Generación de texto y razonamiento general heredados del modelo base Gemma 3 4B.
- Extracción y estructuración de conocimiento ontológico a partir de textos, orientada a la tarea de ontology learning.
- Identificación de términos y conceptos relevantes en el dominio de DBpedia y la ontología OBI.
- Procesamiento de lenguaje natural en tareas de clasificación y selección de entidades (según la configuración TDSelect).
- Capacidades multilingües: no disponibles de forma explícita en la información proporcionada; se heredan las del modelo base Gemma 3, pero no se documentan.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Construcción de ontologías a partir de corpus textuales: el modelo puede emplearse para extraer conceptos y relaciones de documentos no estructurados y proponer una estructura ontológica alineada con OBI, reduciendo el trabajo manual de los ingenieros del conocimiento.
- Enriquecimiento de bases de conocimiento tipo DBpedia: dado su entrenamiento sobre la arquitectura DBpedia, puede utilizarse para sugerir nuevas tripletas o validar las existentes en procesos de curación de datos.
- Selección de términos relevantes en pipelines de extracción de información: la configuración TDSelect sugiere que el modelo puede filtrar candidatos a conceptos en un flujo de procesamiento, priorizando los más relevantes para una ontología de dominio.
- Investigación académica en procesamiento del lenguaje natural: sirve como punto de partida reproducible (licencia Apache 2.0) para experimentos de ontology learning, permitiendo a otros grupos comparar y extender el trabajo de GPLSI.
- Prototipado rápido de asistentes de modelado de dominio: un equipo puede integrar el modelo en una herramienta interna que, dado un conjunto de documentos, proponga una primera versión de la ontología del dominio para su revisión humana.
- Evaluación de modelos base frente a ajustes finos especializados: al estar construido sobre Gemma 3 4B, permite comparar el rendimiento del modelo base con el ajustado en tareas de extracción ontológica, útil para decidir si merece la pena el fine-tuning en un proyecto concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,6 GB en precisión de 16 bits (tamaño del repositorio); en cuantización de 8 bits se reduciría a unos 4,5 GB y en 4 bits a unos 2,5 GB, aunque no se han publicado versiones cuantizadas oficiales.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 para inferencia en FP16 sin problemas; GPU con 8-12 GB de VRAM podrían alojar el modelo en cuantizaciones de 8 o 4 bits, pero dichas cuantizaciones no están publicadas.
- ¿Cabe en consumer GPU? Sí, en FP16 cabe en GPUs de 12 GB o más (por ejemplo, RTX 3060 12 GB, RTX 4070 Ti, RTX 4090); en cuantizaciones de 4 bits cabría en GPUs de 6-8 GB, aunque no se ofrecen pesos cuantizados.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama, siempre que se conviertan los pesos safetensors a los formatos correspondientes (GGUF para llama.cpp/Ollama), ya que no se publican versiones preconvertidas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| gplsi/Gemma-3-4B-OntologyLearning-DBpediaArchivo-TDSelect-OBI-Top10-e1 | 4,3B | no disponible | Apache 2.0 | Hugging Face | Ajuste fino especializado en ontology learning |
| google/gemma-3-4b-it | 4,3B | 128K (según documentación de Gemma 3) | Gemma Terms of Use | Hugging Face | Modelo base instruct; capacidades generales, sin especialización ontológica |
| meta-llama/Llama-3.2-3B-Instruct | 3,2B | 128K | Llama 3.2 Community License | Hugging Face | Alternativa generalista de tamaño similar; requiere aceptar licencia |
| Qwen/Qwen2.5-3B-Instruct | 3,1B | 32K | Apache 2.0 | Hugging Face | Alternativa generalista con licencia permisiva |

La comparativa se limita a aspectos estructurales y de licencia, ya que no se han publicado métricas de rendimiento del modelo de GPLSI que permitan una comparación cuantitativa con las alternativas.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que se desconoce su rendimiento real frente al modelo base o a alternativas especializadas.
- El modelo está altamente especializado en una tarea y un dominio concretos (ontology learning sobre DBpedia/OBI); su rendimiento fuera de ese ámbito puede degradarse notablemente respecto al modelo base.
- Riesgo de alucinación inherente a los modelos generativos: puede producir conceptos o relaciones ontológicas plausibles pero incorrectas, por lo que requiere validación humana en producción.
- No se documentan los idiomas soportados; aunque Gemma 3 es multilingüe, el ajuste fino podría haber sesgado el comportamiento hacia el inglés o el idioma del corpus de entrenamiento.
- Sesgos conocidos: no disponibles; se heredan los del modelo base Gemma 3, que no se detallan en la información proporcionada.
- Licencia Apache 2.0 declarada, pero al derivar de Gemma 3 conviene verificar la compatibilidad con los términos de uso de Gemma para uso comercial.
- El modelo corresponde a la primera época de entrenamiento (e1) y a una configuración Top10, lo que sugiere un alcance limitado y posiblemente no convergido; no se recomienda para producción sin evaluación previa.
- No se ofrecen pesos cuantizados ni versiones convertidas a GGUF, lo que añade trabajo de preparación para despliegues ligeros.

## Enlaces

- Hugging Face: https://huggingface.co/gplsi/Gemma-3-4B-OntologyLearning-DBpediaArchivo-TDSelect-OBI-Top10-e1
- Modelo base Gemma 3: https://huggingface.co/google/gemma-3-4b-it
- Documentación de Gemma 3 (Google): https://ai.google.dev/gemma/docs
- DBpedia: https://www.dbpedia.org/
- Ontología OBI (Ontology for Biomedical Investigations): https://obi-ontology.org/
- Grupo GPLSI (Universidad de Alicante): https://gplsi.dlsi.ua.es/
