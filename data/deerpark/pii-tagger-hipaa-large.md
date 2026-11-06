# Deerpark/pii-tagger-hipaa-large

## Resumen

Deerpark/pii-tagger-hipaa-large es un modelo de reconocimiento de entidades nombradas (NER) especializado en la deteccion de informacion personal identificable (PII) y de informacion sanitaria protegida (PHI, Protected Health Information) bajo el marco regulatorio HIPAA. Lo desarrolla Deerpark (usuario "Max" en Hugging Face) como un fine-tuning del modelo base knowledgator/gliner-pii-large-v1.0, reentrenado sobre el dataset nvidia/Nemotron-PII. Esta construido sobre la arquitectura GLiNER, un enfoque de NER de proposito general que permite definir las etiquetas de entidades de forma dinamica en tiempo de inferencia mediante prompts de texto, en lugar de depender de un conjunto fijo de clases.

La relevancia del modelo radica en su orientacion a la desidentificacion de documentos clinicos y sanitarios. HIPAA exige que los sistemas que procesan historiales medicos eliminen o enmascaren las categorias de identificadores protegidos antes de compartir o almacenar los datos, y este modelo se presenta como una herramienta para esa tarea en ingles y espanol. El repositorio ocupa 1.8 GB y esta publicado bajo licencia Apache 2.0, aunque el acceso es restringido (gated) y requiere aceptar las condiciones en Hugging Face.

Al tratarse de un modelo derivado de GLiNER, su uso no es el de un generador de texto, sino el de un etiquetador de tokens (pipeline token-classification) que devuelve las entidades detectadas con sus posiciones y categorias, lo que facilita su integracion en pipelines de anonimizacion previos a procesos de almacenamiento o analisis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER (NER de proposito general con etiquetas dinamicas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, es |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repositorio de 1.8 GB, libreria gliner) |

## Arquitectura y entrenamiento

El modelo se basa en GLiNER, una familia de modelos de NER que combina un codificador de texto con un mecanismo que proyecta representaciones de etiquetas (labels) para permitir la deteccion de entidades definidas dinamicamente. A diferencia de los clasificadores NER clasicos con un conjunto cerrado de clases, GLiNER recibe como entrada el texto y una lista de tipos de entidad expresados en lenguaje natural, y devuelve los fragmentos que corresponden a cada tipo. Esto permite adaptar el conjunto de categorias de PII/PHI sin reentrenar el modelo.

El modelo es un fine-tuning de knowledgator/gliner-pii-large-v1.0, un modelo previo orientado a PII, reentrenado sobre el dataset nvidia/Nemotron-PII. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en un modelo NER de este tipo). Tampoco se especifican innovaciones tecnicas adicionales mas alla del propio enfoque GLiNER.

## Capacidades

- Deteccion de entidades de PII y PHI en texto clinico y sanitario, con etiquetas definibles en tiempo de inferencia.
- Etiquetado a nivel de token (token-classification) con devolucion de posiciones y categorias de las entidades.
- Soporte bilingue: ingles (en) y espanol (es).
- Orientacion especifica a las categorias de identificadores protegidos bajo HIPAA.
- Integracion con la libreria GLiNER para inferencia local.
- No es un modelo generativo: no produce texto, razonamiento, codigo ni respuestas conversacionales.
- No se documenta soporte de tool calling, agentes ni modo thinking en la informacion disponible.

## Casos de uso

- Desidentificacion de historiales clinicos: el modelo etiqueta nombres, numeros de historia, fechas y otros identificadores en notas medicas para que un pipeline posterior los enmascare antes de almacenar o compartir los datos, alineandose con los requisitos de HIPAA.
- Anonimizacion previa a la investigacion: en la preparacion de datasets clinicos para analisis secundario, se usa para localizar y eliminar PHI de los registros antes de la cesion a equipos de investigacion.
- Cumplimiento en entornos sanitarios: integrado en un proceso de ingestion de documentos, permite auditar y marcar los campos con PII/PHI antes de que los datos lleguen a sistemas analiticos.
- Procesamiento de textos en espanol: al soportar es, se emplea para desidentificar documentacion clinica en espanol en entornos donde el modelo base solo cubriria ingles.
- Enmascarado en logs y tickets de soporte: puede aplicarse a conversaciones o registros de atencion al paciente para retirar identificadores antes de su retencion o envio a terceros.
- Preprocesado para pipelines de NLP clinico: sirve como etapa de limpieza previa a tareas de clasificacion, extraccion de entidades clinicas o resumen, reduciendo el riesgo de fuga de datos personales en las fases posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el repositorio ocupa 1.8 GB, lo que da una referencia del orden de magnitud de los pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; por el tamano del repositorio (1.8 GB) es plausible que quepa en GPU de consumo, pero no se dispone de datos verificados.
- Opciones de despliegue: inferencia mediante la libreria GLiNER; no se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI) en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| Deerpark/pii-tagger-hipaa-large | no disponible | no disponible | en, es | apache-2.0 | gated |
| knowledgator/gliner-pii-large-v1.0 (modelo base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Deerpark/pii-tagger-edge | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado entre estos modelos en la informacion proporcionada. El modelo base knowledgator/gliner-pii-large-v1.0 es la referencia directa, y Deerpark/pii-tagger-edge aparece como otra variante del mismo autor, presumiblemente orientada a entornos con menos recursos.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar el modelo, lo que puede complicar la automatizacion de despliegues.
- Modelo especializado en NER: no genera texto ni razona; su uso esta limitado a la deteccion de entidades.
- Cobertura limitada a ingles y espanol; no se documenta soporte de otros idiomas.
- No se dispone de datos publicados de benchmarks, por lo que el rendimiento real en deteccion de PII/PHI no esta cuantificado en la informacion disponible.
- Riesgo de falsos negativos y falsos positivos inherente a los modelos NER: en un contexto regulatorio como HIPAA, conviene validar con conjuntos propios y no confiar unicamente en el modelo para garantizar el cumplimiento.
- Posibles sesgos derivados del dataset de entrenamiento (nvidia/Nemotron-PII) y del modelo base; no documentados en la informacion disponible.
- Aunque la licencia es Apache 2.0, el acceso gated implica condiciones adicionales de uso que deben revisarse antes de un despliegue comercial.
- No se documentan requisitos de hardware ni latencias, lo que dificulta la planificacion de capacidad en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Deerpark/pii-tagger-hipaa-large
- Perfil del autor: https://huggingface.co/Deerpark/models
- Variante edge del mismo autor: https://huggingface.co/Deerpark/pii-tagger-edge
- Modelo base: https://huggingface.co/knowledgator/gliner-pii-large-v1.0
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-PII
