# getachewgetu/AmLegal_Gemma-Inst

## Resumen

AmLegal_Gemma-Inst es un modelo de lenguaje adaptado al dominio juridico en amharico, desarrollado por Getachew Getu dentro del proyecto de investigacion Amharic Legal RAG. Se construye sobre `google/gemma-3-4b-it` mediante un ajuste fino con Rank-Stabilized LoRA (rsLoRA) orientado a responder preguntas legales y a alimentar pipelines de generacion aumentada por recuperacion (RAG) sobre las decisiones de la Division de Casacion del Tribunal Supremo Federal de Etiopia.

El modelo resuelve un problema concreto: la ausencia de herramientas de IA abiertas que comprendan terminologia juridica en amharico y que citen correctamente las fuentes de un corpus de jurisprudencia. Frente al modelo base sin adaptar, el autor reporta mejoras sustanciales en metricas de solapamiento lexico y semantico (ROUGE-1 de 29,68 % a 49,66 %, BERTScore F1 de 58,40 % a 91,30 %) y una reduccion practica de la contaminacion por idiomas extranjeros hasta el 0,03 %.

Con 4.300.079.472 parametros y licencia Gemma, es un modelo compacto que puede ejecutarse en hardware de consumo moderado. Su relevancia actual reside en ser un ejemplo de adaptacion de bajo coste (LoRA) sobre un modelo base multimodal de 4B para una tarea juridica de alta especializacion y en un idioma de bajos recursos como el amharico, con evaluacion empirica publicada sobre decisiones no vistas durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 3 4B IT); ajuste fino mediante rsLoRA |
| Parametros totales | 4.300.079.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Gemma 3 4B IT) |
| Tipos de cuantizacion | no disponible (el autor solo documenta bfloat16 para inferencia) |
| Idiomas soportados | amharico (am) como idioma objetivo; el modelo base soporta multilingue |
| Licencia | Gemma (terminos de uso de Google Gemma) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-4b-it`, un transformer decoder-only de aproximadamente 4.300 millones de parametros, y se adapta con Rank-Stabilized LoRA (rsLoRA) con rango r=64, alpha=64 y escalado alpha/sqrt(r). El ajuste emplea enmascaramiento de perdida solo en los tokens de completacion (completion-only loss masking) y condicionamiento negativo con distractores, una tecnica orientada a que el modelo aprenda a ignorar fragmentos de contexto irrelevantes y a citar solo la evidencia pertinente.

El dataset de entrenamiento es propio (`custom-ethiopian-cassation-qa`), construido a partir de decisiones de la Division de Casacion del Tribunal Supremo Federal de Etiopia en formato de pares pregunta-respuesta con contexto. La model card no especifica el numero de tokens de entrenamiento ni la composicion detallada del corpus. No se documenta una fase de RLHF o DPO posterior al ajuste supervisado. La innovacion tecnica principal es el uso combinado de rsLoRA con condicionamiento negativo y enmascaramiento de completacion para una tarea de QA juridico con citacion, evaluada especificamente en recuperacion de citas y atribucion de evidencia.

## Capacidades

- Generacion de texto en amharico con registro juridico especializado.
- Respuesta a preguntas legales (legal QA) fundamentadas en un contexto de decision judicial proporcionado en el prompt.
- Generacion aumentada por recuperacion (RAG): consume fragmentos de jurisprudencia y produce respuestas ancladas a ellos.
- Citacion de fuentes: el autor reporta Citation Recall del 88,07 % y Citation Precision del 92,02 % en el conjunto de evaluacion.
- Atribucion de evidencia (evidence grounding) del 92,00 % segun la evaluacion del autor.
- Resistencia a distractores: 0,00 % de mala atribucion a fragmentos distractores segun la model card.
- Restriccion de idioma: baja contaminacion por idiomas extranjeros (0,03 %).
- Capacidades heredadas del modelo base Gemma 3 4B IT: conversacion multi-turno con plantilla `<start_of_turn>` / `<end_of_turn>` y, potencialmente, entrada de imagen y texto (pipeline image-text-to-text en los tags), aunque no se documenta su uso juridico multimodal.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas de forma explicita.

## Casos de uso

- Asistencia juridica a abogados en Etiopia: el modelo recibe el texto de una decision de casacion y responde preguntas sobre los hechos, el razonamiento y la ratio decidendi, con citas al fragmento exacto gracias a su entrenamiento en citacion.
- Sistemas RAG de jurisprudencia: integrado como generador final de un pipeline que recupera decisiones del Tribunal Supremo Federal y compone respuestas fundamentadas, apropiado por su alta precision de citas y su resistencia a distractores.
- Investigacion academica en derecho etiope: sintesis de lineas jurisprudenciales a partir de varios fragmentos de decisiones, con menor riesgo de mezclar contenido de fuentes irrelevantes.
- Formacion de estudiantes de derecho: generacion de explicaciones en amharico sobre conceptos y precedentes, siempre con el contexto de la decision como ancla.
- Redaccion de borradores de memorandos internos: el modelo puede estructurar resumenes de precedentes citando las sentencias de referencia, adecuado por su dominio del registro juridico en amharico.
- Evaluacion de consistencia documental: comprobacion de si una afirmacion juridica esta respaldada por una decision concreta del corpus, aprovechando las metricas de grounding y atribucion reportadas.
- Despliegue en entornos con recursos limitados: al ser un modelo de 4B, puede servirse en una unica GPU de consumo para prototipos de asistencia legal interna.

## Benchmarks y rendimiento

Evaluacion del autor sobre decisiones de casacion no vistas durante el entrenamiento:

| Metrica | Gemma-3-4B base | Qwen-2.5-7B FT | AmLegal_Gemma-Inst |
|---|---|---|---|
| ROUGE-1 (F1) | 29,68 % | 38,40 % | 49,66 % |
| ROUGE-2 (F1) | 19,58 % | 27,10 % | 34,94 % |
| ROUGE-L (F1) | 29,68 % | 36,59 % | 49,66 % |
| SacreBLEU | 8,80 | 28,29 | 23,47 |
| chrF | 19,27 | no disponible | 38,95 |
| BERTScore F1 | 58,40 % | no disponible | 91,30 % |
| Evidence grounding | 84,00 % | 78,00 % | 92,00 % |
| Citation recall | 68,94 % | 15,31 % | 88,07 % |
| Citation precision | 88,46 % | 23,21 % | 92,02 % |
| Citation F1 | 77,49 % | 18,45 % | 90,00 % |
| Contaminacion por idioma extranjero | 7,49 % | no disponible | 0,03 % |
| Mala atribucion a distractores | no disponible | no disponible | 0,00 % |
| Completitud de respuesta (1-3) | 2,14 | no disponible | 2,88 |

Puntuaciones cualitativas LLM-as-a-Judge (escala 1-10, segun el autor): fidelidad 9,43; relevancia 9,20; consistencia 9,17; coherencia 9,00; claridad 8,90; exactitud 8,53; media global 8,77. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 8,6 GB de pesos, mas overhead de activaciones y cache KV; en la practica, entre 10 y 12 GB para inferencia comoda.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 5 GB; en 4 bits, alrededor de 3 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: A100, H100 o L40S para servicio concurrente; RTX 4090, RTX 3090 o RTX 4080 para uso individual.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas en bfloat16 (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090) y en tarjetas de 8 GB con cuantizacion.
- Opciones de despliegue: transformers (documentado por el autor), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); vLLM, llama.cpp y Ollama no estan documentados para este modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AmLegal_Gemma-Inst | 4,3B | no disponible | QA juridico en amharico con citacion | Gemma | Hugging Face |
| google/gemma-3-4b-it | 4,3B | no disponible | Modelo base multimodal e instruido | Gemma | Hugging Face |
| Qwen-2.5-7B FT (referencia del autor) | 7B | no disponible | Ajuste fino juridico comparativo | no disponible | no disponible |

No se dispone de datos publicos de otros modelos especializados en amharico juridico para una comparacion directa. La comparativa se limita a los modelos incluidos en la evaluacion del propio autor.

## Limitaciones y advertencias

- Dominio y alcance restringidos: entrenado sobre decisiones de la Division de Casacion del Tribunal Supremo Federal de Etiopia; su rendimiento fuera de ese corpus no esta evaluado.
- Idioma: optimizado para amharico; el uso en otros idiomas puede degradar la calidad y reintroducir contaminacion linguistica.
- Riesgo de alucinacion: aunque el autor reporta alta fidelidad (9,43/10) y grounding del 92 %, ningun modelo generativo garantiza respuestas correctas; en contexto juridico requiere revision humana obligatoria.
- Sesgos: no se documenta analisis de sesgos de genero, etnicos o socioeconomicos en el corpus juridico de entrenamiento.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de uso de Google Gemma, que imponen restricciones y obligaciones de atribucion; revisar antes de desplegar en produccion.
- Datos de entrenamiento no publicos: el dataset `custom-ethiopian-cassation-qa` no esta descrito en detalle (tamano, composicion, proceso de anotacion), lo que dificulta la reproducibilidad.
- Evaluacion limitada: las metricas provienen del propio autor y no han sido replicadas de forma independiente; las puntuaciones LLM-as-a-Judge dependen del juez utilizado, no especificado.
- No se documentan capacidades de tool calling, agentes ni modo de razonamiento explicito; no asumir su disponibilidad.
- Contexto maximo no documentado en la model card; conviene verificar la configuracion de `max_position_embeddings` del modelo base antes de usarlo con contextos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/getachewgetu/AmLegal_Gemma-Inst
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Dataset referenciado: custom-ethiopian-cassation-qa (no se proporciona URL publica)
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
