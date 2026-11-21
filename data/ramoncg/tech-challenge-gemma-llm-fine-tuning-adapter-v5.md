# ramoncg/tech-challenge-gemma-llm-fine-tuning-adapter-v5

## Resumen

El repositorio `ramoncg/tech-challenge-gemma-llm-fine-tuning-adapter-v5` contiene un adaptador LoRA entrenado por el autor `ramoncg` sobre el modelo base `unsloth/gemma-4-E2B-it`. No es un checkpoint autonomo: es un conjunto de pesos delta que debe cargarse junto con el modelo base para funcionar. El adaptador esta especializado en tareas de NLP veterinario derivadas del dataset SAVSNET/PetEVAL: clasificacion multietiqueta de capitulos sindromicos ICD-11, extraccion de entidades de enfermedad (Disease NER) y extraccion de entidades de anonimizacion (Anonymisation NER).

El entrenamiento se realizo mediante QLoRA con SFT sobre 4249 registros de origen, con un perfil rapido que emplea 288 ejemplos etiquetados por tarea (96 por tarea) en una sola pasada, 72 pasos objetivo y un limite de 360 segundos. El rank LoRA es 16, alpha 32, dropout 0,05 y longitud maxima de 1024 tokens. El repositorio ocupa 0,1 GB y se distribuye bajo licencia Apache 2.0.

Su relevancia es acotada: se trata de un adaptador de investigacion para anotacion NLP sobre textos clinicos veterinarios, no de un sistema de diagnostico. La propia model card advierte que las metricas no constituyen una evaluacion independiente porque el holdout interno se construyo a partir del split `test` publicado en el Hub, que ademas se uso parcialmente en entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA + SFT) sobre transformer Gemma 4 E2B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no declara cifra en la informacion proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | 1024 tokens (longitud maxima de entrenamiento) |
| Tipos de cuantizacion | base cargada en 4-bit durante el entrenamiento (QLoRA); cuantizaciones de inferencia no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `unsloth/gemma-4-E2B-it`, un modelo de la familia Gemma 4 en su variante E2B. La tecnica empleada es QLoRA: el modelo base se carga cuantizado en 4-bit y se entrenan matrices de bajo rango con rank 16, alpha 32 y dropout 0,05, sobre secuencias de hasta 1024 tokens. El entrenamiento es de tipo supervisado (SFT) con instrucciones especificas por tarea.

Los datos proceden del dataset SAVSNET/PetEVAL. El articulo asociado describe 11.000 registros de entrenamiento, 1.600 de evaluacion y 5.000 de test con division por practica veterinaria, pero en esta ejecucion el Hub solo exponia el split `test`, sin identificador de practica. El autor construyo un holdout interno agrupado 85/15 a partir de ese split, con 4249 registros de origen y un perfil rapido de 288 ejemplos etiquetados (96 por tarea) en una pasada, 72 pasos objetivo y limite temporal de 360 segundos. El articulo reporta 20 capitulos ICD-11 seleccionados, mientras que el split disponible contiene 18 etiquetas distintas observadas; el pipeline no genera etiquetas ausentes.

Las instrucciones de Disease NER siguen la politica del articulo: incluir condiciones nombradas y diagnosticos diferenciales o sospechosos, excluyendo menciones explicitamente negadas. Anonymisation cubre las categorias PER/LOC/ORG/TIME/MISC observadas en el dataset, con MISC definido como identificadores explicitos segun la seccion 4.1.1 del articulo.

## Capacidades

- Clasificacion multietiqueta de capitulos sindromicos ICD-11 sobre texto clinico veterinario.
- Extraccion de entidades de enfermedad (Disease NER), incluyendo diagnosticos diferenciales y sospechosos salvo negaciones explicitas.
- Extraccion de entidades de anonimizacion (Anonymisation NER) en categorias PER, LOC, ORG, TIME y MISC.
- Generacion de texto conversacional heredada del modelo base `gemma-4-E2B-it` (pipeline declarado: text-generation).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Anotacion de historiales clinicos veterinarios: el adaptador etiqueta cada registro con uno o varios capitulos ICD-11, lo que permite construir datasets estructurados a partir de texto libre de practicas veterinarias.
- Extraccion de entidades de enfermedad para vigilancia sindromica: dado un informe clinico, el modelo identifica condiciones nombradas y diagnosticos diferenciales, util para agregar senales de enfermedad en poblaciones animales.
- Desidentificacion de textos clinicos: la tarea Anonymisation NER permite localizar nombres de personas, lugares, organizaciones, fechas e identificadores explicitos antes de compartir o publicar registros.
- Preetiquetado en pipelines de anotacion humana: el adaptador puede generar propuestas iniciales que un veterinario o anotador revisa, reduciendo el coste de etiquetado manual en corpus grandes.
- Investigacion en NLP veterinario: sirve como punto de partida reproducible para experimentos con QLoRA sobre PetEVAL, con hiperparametros y estrategia de split documentados.
- Prototipado de asistentes documentales veterinarios: combinado con el modelo base, puede resumir o estructurar informes clinicos en las categorias sindromicas definidas, siempre con supervision profesional.
- Evaluacion comparativa de adaptadores: al ser un adaptador pequeno (0,1 GB) sobre un modelo E2B, es adecuado para pruebas de bajo coste en entornos con GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas numericas de evaluacion y advierte explicitamente que el holdout interno no debe presentarse como evaluacion oficial independiente, ya que parte del split `test` se uso en entrenamiento y no se reproduce el protocolo clinic-disjoint del articulo PetEVAL.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base Gemma 4 E2B y de la cuantizacion elegida, no del adaptador (0,1 GB).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el entrenamiento uso carga en 4-bit, lo que sugiere viabilidad en GPUs de gama media, pero no se aportan cifras.
- Opciones de despliegue: carga del adaptador LoRA junto al modelo base con las librerias del ecosistema Unsloth/PEFT; soporte especifico de vLLM, llama.cpp, Ollama o TGI no disponible.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ramoncg/tech-challenge-gemma-llm-fine-tuning-adapter-v5 | no disponible (adaptador LoRA sobre Gemma 4 E2B) | 1024 tokens (entrenamiento) | NLP veterinario PetEVAL (ICD-11, NER) | Apache 2.0 | Hugging Face, 0 descargas |
| unsloth/gemma-4-E2B-it (modelo base) | no disponible | no disponible | Generacion de texto general | no disponible | Hugging Face |
| Alternativas especializadas en NER clinico veterinario | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- No es un sistema de diagnostico veterinario: no prescribe tratamientos ni sustituye a profesionales veterinarios; solo reproduce anotaciones NLP del dataset PetEVAL.
- No es un checkpoint autonomo: requiere cargar el modelo base `unsloth/gemma-4-E2B-it` junto con el adaptador.
- Las metricas no son una evaluacion independiente: el holdout interno deriva del split `test` del Hub y parte de esos datos se uso en entrenamiento; no se respeta el protocolo clinic-disjoint del articulo.
- Cobertura de etiquetas incompleta: el split disponible contiene 18 etiquetas ICD-11 frente a las 20 del articulo; el modelo no generara categorias ausentes.
- Ventana de contexto limitada a 1024 tokens durante el entrenamiento, lo que restringe la longitud de los documentos procesables.
- Idiomas soportados no declarados; el entrenamiento se realizo sobre datos en la lengua del dataset PetEVAL, sin garantia de transferencia a otros idiomas.
- Riesgo de alucinacion y de falsos positivos/negativos en NER no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero deben verificarse las condiciones del modelo base y del dataset PetEVAL antes de un despliegue en produccion.
- Sin descargas ni likes en el Hub en el momento de la consulta, lo que implica ausencia de validacion externa por parte de la comunidad.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/ramoncg/tech-challenge-gemma-llm-fine-tuning-adapter-v5
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it
- Dataset PetEVAL: https://huggingface.co/datasets/SAVSNET/PetEVAL
