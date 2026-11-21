# ramoncg/tech-challenge-gemma-llm-fine-tuning-light-v6

## Resumen

El modelo `ramoncg/tech-challenge-gemma-llm-fine-tuning-light-v6` es un adaptador LoRA entrenado mediante QLoRA y Supervised Fine-Tuning (SFT) sobre el modelo base `unsloth/gemma-4-E2B-it`. Lo desarrolla el usuario ramoncg en el contexto de un reto tecnico centrado en el procesamiento de lenguaje natural veterinario, empleando el dataset SAVSNET/PetEVAL. El adaptador esta disenado para tres tareas de anotacion NLP: clasificacion multirrotulo de capitulos sindromicos ICD-11, extraccion de entidades de enfermedades (Disease NER) y extraccion de entidades de anonimizacion (Anonymisation NER).

El modelo resuelve el problema de estructurar texto clinico veterinario no anotado en categorias sindromicas y entidades nombradas, lo que resulta relevante para la investigacion epidemiologica y la construccion de pipelines de datos clinicos. Se distribuye como adaptador LoRA (no como checkpoint autonomo) sobre un modelo base de la familia Gemma 4, con un tamano de repositorio de 0,1 GB, lo que refleja que unicamente contiene los pesos del adaptador y los ficheros de configuracion necesarios.

Es relevante ahora porque demuestra la aplicacion de tecnicas de fine-tuning eficiente (QLoRA con cuantizacion 4-bit) sobre modelos de lenguaje de proposito general para dominios altamente especializados como la medicina veterinaria, con una licencia Apache 2.0 que permite uso comercial. No obstante, el propio autor advierte que no es un sistema de diagnostico ni sustituye a profesionales veterinarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (Gemma 4 E2B) |
| Parametros totales | no disponible (el adaptador LoRA no declara numero de parametros; el modelo base es Gemma 4 E2B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1024 tokens (longitud maxima de entrenamiento) |
| Tipos de cuantizacion | Base cargada en 4-bit (QLoRA); no se detallan otras cuantizaciones del adaptador |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se construye sobre `unsloth/gemma-4-E2B-it`, un modelo de la familia Gemma 4 en su variante E2B (orientada a eficiencia). El entrenamiento emplea QLoRA con el modelo base cargado en cuantizacion 4-bit, con rango LoRA de 16, alpha de 32 y dropout de 0,05. La longitud maxima de secuencia durante el entrenamiento fue de 1024 tokens.

El dataset de origen es SAVSNET/PetEVAL, con 4249 registros. El perfil rapido de entrenamiento utiliza 516 ejemplos etiquetados por tarea (172 por tarea) en una sola pasada, con 129 pasos objetivo y un limite de 600 segundos. El split empleado es un "internal grouped 85/15 from published split test". El autor senala explicitamente que el Hub solo expuso el split de test, por lo que el holdout es interno y parte de ese test se uso en entrenamiento; por tanto, las metricas no deben presentarse como evaluacion oficial independiente. El articulo PetEVAL describe 11.000 registros de entrenamiento, 1.600 de evaluacion y 5.000 de test con division por practica veterinaria, pero el Hub no proporciono identificador de practica, de modo que el holdout interno no reproduce el protocolo clinic-disjoint.

Las instrucciones de Disease NER siguen la politica del articulo: incluir condiciones nombradas y diagnosticos diferenciales o sospechosos, excepto menciones explicitamente negadas. La anonimizacion sigue las categorias PER/LOC/ORG/TIME/MISC observadas en el dataset, usando la definicion principal de la seccion 4.1.1 para MISC como identificadores explicitos. El articulo reporta 20 capitulos ICD-11 seleccionados, mientras que el split actual contiene 18 rotulos distintos observados; el pipeline no inventa rotulos ausentes.

## Capacidades

- Clasificacion multirrotulo de capitulos sindromicos ICD-11 sobre texto clinico veterinario.
- Extraccion de entidades de enfermedades (Disease NER), incluyendo condiciones nombradas y diagnosticos diferenciales o sospechosos, excluyendo menciones negadas.
- Extraccion de entidades de anonimizacion (Anonymisation NER) con categorias PER/LOC/ORG/TIME/MISC.
- Generacion de texto conversacional (pipeline declarado: text-generation), heredada del modelo base instruct.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Anotacion automatizada de registros clinicos veterinarios: el adaptador clasifica notas clinicas en capitulos sindromicos ICD-11, lo que permite estructurar grandes volumenes de texto no anotado para analisis epidemiologico.
- Construccion de datasets de investigacion: se puede usar para pre-anotar Disease NER y Anonymisation NER antes de una revision humana, reduciendo el coste de etiquetado manual en estudios con SAVSNET/PetEVAL.
- Desidentificacion de datos clinicos: la tarea de Anonymisation NER permite detectar nombres de personas, localizaciones, organizaciones, fechas y otros identificadores explicitos para cumplir requisitos de privacidad antes de compartir datos.
- Extraccion de senales sindromicas para vigilancia: la clasificacion multirrotulo facilita agrupar casos por sindrome y alimentar sistemas de monitorizacion de salud animal.
- Investigacion en NLP clinico veterinario: sirve como punto de partida reproducible para experimentos de fine-tuning eficiente (QLoRA) sobre dominios especializados con recursos limitados.
- Prototipado rapido en entornos con GPU de consumo: al ser un adaptador LoRA sobre un modelo E2B, el coste de despliegue es bajo comparado con el fine-tuning completo, lo que permite iterar en laboratorios con hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor advierte ademas que las metricas internas no constituyen una evaluacion oficial independiente, ya que parte del split de test se uso en entrenamiento y no se reproduce el protocolo clinic-disjoint del articulo PetEVAL.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador LoRA sobre un modelo base E2B cargado en 4-bit, el requisito es el del modelo base cuantizado, no documentado en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el uso de QLoRA en 4-bit sugiere que el entrenamiento se realizo en hardware de gama consumer o de una sola GPU, pero no se especifica el modelo.
- Opciones de despliegue: no se documentan frameworks concretos (vLLM, llama.cpp, Ollama, TGI) en la model card; el repositorio incluye los ficheros necesarios para cargar el adaptador con el modelo base mediante la libreria de Unsloth/PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ramoncg/tech-challenge-gemma-llm-fine-tuning-light-v6 | Adaptador LoRA sobre Gemma 4 E2B | 1024 tokens (entrenamiento) | Clasificacion ICD-11, Disease NER, Anonymisation NER en veterinaria | Apache 2.0 | Hugging Face |
| unsloth/gemma-4-E2B-it (modelo base) | Gemma 4 E2B | no disponible | Generacion de texto general | no disponible | Hugging Face |
| Modelos especializados en NER clinico veterinario | no disponible | no disponible | NER clinico | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables especificos de NLP veterinario en la busqueda realizada.

## Limitaciones y advertencias

- El adaptador no es un sistema de diagnostico veterinario: no prescribe tratamientos ni sustituye a profesionales veterinarios, segun advierte el autor.
- No es un checkpoint autonomo: requiere el modelo base `unsloth/gemma-4-E2B-it` para funcionar.
- Las metricas de evaluacion no son un benchmark independiente: el holdout es interno, parte del split de test se uso en entrenamiento y no se reproduce el protocolo clinic-disjoint del articulo PetEVAL.
- El split actual contiene 18 rotulos ICD-11 distintos frente a los 20 del articulo; el modelo no puede predecir rotulos ausentes.
- La longitud de contexto de entrenamiento es de 1024 tokens, lo que limita el procesamiento de documentos clinicos largos.
- Idiomas soportados no documentados; el entrenamiento se realizo sobre un dataset concreto cuya composicion linguistica no se detalla.
- Sesgos conocidos: no documentados, pero al entrenarse sobre un dataset veterinario especifico puede heredar sesgos de la practica clinica representada en SAVSNET/PetEVAL.
- Riesgo de alucinacion: no cuantificado; al ser un modelo generativo usado para tareas de anotacion, existe riesgo de producir entidades o rotulos no presentes en el texto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ramoncg/tech-challenge-gemma-llm-fine-tuning-light-v6
- Dataset: https://huggingface.co/datasets/ramoncg/tech-challenge-gemma-llm-fine-tuning-dataset
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it
