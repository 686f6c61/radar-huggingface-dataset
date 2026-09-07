# OBLITERATUS/Llama-3.1-8B-Lexi-Uncensored-V2-OBLITERATED

## Resumen

OBLITERATUS/Llama-3.1-8B-Lexi-Uncensored-V2-OBLITERATED es una variante abliterada del modelo Llama 3.1 8B, desarrollada por el usuario OBLITERATUS a partir del fine-tuning Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2. El modelo ha sido procesado con la herramienta open source OBLITERATUS, creada por elder-plinius, utilizando el método `aggressive` para eliminar el comportamiento de rechazo (refusal) típico de los modelos alineados. El resultado es un modelo de lenguaje que responde a peticiones sin censura, manteniendo la arquitectura y el tamaño del modelo base.

La arquitectura es un transformer decoder-only con 8.030.261.248 parámetros, distribuidos en formato safetensors con un tamaño de repositorio de 16.1 GB. No se especifica la longitud de contexto en la información disponible, aunque el modelo base Llama 3.1-8B dispone de 128k tokens. El modelo solo está documentado para el idioma inglés. No se ha publicado información sobre licencia, benchmarks o requisitos de hardware específicos. Su relevancia radica en el ámbito de la investigación sobre alineación y seguridad de IA, así como en aplicaciones que requieren respuestas sin restricciones temáticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Llama 3.1-8B tiene 128k tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible (el modelo base se rige por la Llama 3.1 Community License de Meta) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura original de Llama 3.1 8B: un transformer causal (decoder-only) con atención por capas y normalización RMSNorm, sin componentes de mezcla de expertos ni arquitecturas híbridas. El proceso de creación consta de dos etapas: primero, Orenguteng realizó un fine-tuning sobre Llama 3.1 8B Instruct para producir el modelo Lexi Uncensored V2, un modelo ya desprovisto de restricciones de seguridad. Posteriormente, OBLITERATUS aplicó una abliteración con el método `aggressive` mediante la herramienta OBLITERATUS, que modifica las activaciones del modelo para eliminar las direcciones asociadas a la negativa a responder. No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset ni la aplicación de RLHF o DPO. El modelo se distribuye directamente en safetensors, listo para cargarse con Transformers.

## Capacidades

- Generación de texto en inglés con un comportamiento notablemente menos restrictivo que los modelos alineados, respondiendo a solicitudes que otros modelos rechazarían.
- Respuesta a instrucciones y preguntas en un formato conversacional, heredado del modelo base Llama 3.1 8B Instruct.
- No se documenta soporte de tool calling, function calling, visión, audio ni otras capacidades multimodales.
- Capacidad de razonamiento y codificación limitada a la del modelo base Llama 3.1 8B, sin mejoras específicas en matemáticas o lógica.
- El proceso de abliteración no añade capacidades nuevas; solo modifica el comportamiento de rechazo del modelo.

## Casos de uso

- Roleplay y simulación de personajes virtuales: el modelo puede sostener conversaciones largas y temáticas sin cortarse por contenido adulto o sensible, lo que resulta útil para aplicaciones de entretenimiento y narrativa interactiva.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o diálogos que abordan temas controvertidos, donde un modelo alineado suele negarse a continuar.
- Investigación sobre alineación y abliteración: permite estudiar cómo la eliminación de direcciones de rechazo afecta al comportamiento del modelo en distintos prompts, sirviendo como banco de pruebas para técnicas de activation engineering.
- Pruebas de robustez en sistemas de seguridad: puede emplearse para evaluar la capacidad de un sistema de filtrado o de una capa de alineación externa para detectar y bloquear contenido dañino generado por un modelo sin restricciones.
- Asistentes de generación de código en entornos internos: dado que hereda las capacidades de Llama 3.1 8B, puede producir código en varios lenguajes sin las negativas que a veces aparecen en prompts de programación con contexto sensible.
- Análisis de sesgos y comportamiento discursivo: sirve como modelo de referencia para comparar las respuestas de un modelo sin alineación frente a su versión alineada, útil en investigación de interpretabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos verificables sobre MMLU, HumanEval, GSM8K ni otras métricas de rendimiento para este modelo.

## Requisitos de hardware

- No se han proporcionado datos específicos de VRAM, GPU recomendada, latencia o throughput.
- El tamaño del repositorio es de 16.1 GB, lo que sugiere que los pesos en FP16 ocupan aproximadamente 16 GB de VRAM para inferencia.
- Una cuantización 4-bit, si se aplicara, requeriría en torno a 4-5 GB de VRAM, pero no se especifica qué tipos de cuantización están disponibles.
- El README solo documenta la carga mediante la biblioteca Transformers, por lo que se puede inferir compatibilidad con entornos como vLLM o llama.cpp, aunque no se confirma.
- Para ejecutar el modelo completo en FP16 se necesitaría una GPU de al menos 16 GB, como una RTX 4080, A100 40GB o similar. Dado que no hay datos oficiales, esta cifra es una estimación derivada del tamaño de los pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OBLITERATUS/Llama-3.1-8B-Lexi-Uncensored-V2-OBLITERATED | 8.030.261.248 | No disponible | No disponible | HuggingFace |
| Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2 | 8.030.261.248 | No disponible | No disponible | HuggingFace |
| Greytechai/Llama-3.1-8B-Lexi-Uncensored-V2 | 8.030.261.248 | No disponible | No disponible | HuggingFace |

Los tres modelos comparten el mismo tamaño y arquitectura de Llama 3.1 8B. La diferencia principal es que OBLITERATUS ha aplicado una abliteración adicional sobre el fine-tuning de Orenguteng, mientras que Greytechai parece ser otra variante uncensored sin ese paso. No se dispone de datos de rendimiento para comparar la calidad de las respuestas entre ellos.

## Limitaciones y advertencias

- Al ser un modelo uncensored, puede generar contenido dañino, ilegal, ofensivo o no ético sin ninguna barrera de seguridad.
- El README del modelo base advierte explícitamente que se debe implementar una capa de alineación propia antes de exponer el modelo como servicio público.
- No se especifica la licencia del modelo; el modelo base está sujeto a la Llama 3.1 Community License de Meta, que impone condiciones de uso comercial y redistribución.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por la ausencia de filtros.
- Solo está documentado el idioma inglés; no hay soporte confirmado para otros idiomas.
- El proceso de abliteración con el método `aggressive` puede degradar el rendimiento en tareas que requieren precisión o coherencia, aunque no se han publicado evaluaciones que lo confirmen.
- No se dispone de información sobre cuantizaciones, lo que limita su despliegue en hardware con menos VRAM sin trabajo adicional.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/OBLITERATUS/Llama-3.1-8B-Lexi-Uncensored-V2-OBLITERATED
- Repositorio de OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Modelo base Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2: https://huggingface.co/Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2
- Variante similar Greytechai/Llama-3.1-8B-Lexi-Uncensored-V2: https://huggingface.co/Greytechai/Llama-3.1-8B-Lexi-Uncensored-V2

La búsqueda web adicional no arrojó más información relevante sobre benchmarks, licencia o requisitos de despliegue para este modelo.
