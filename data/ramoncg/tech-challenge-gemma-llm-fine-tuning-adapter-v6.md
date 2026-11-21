# ramoncg/tech-challenge-gemma-llm-fine-tuning-adapter-v6

## Resumen

El modelo `ramoncg/tech-challenge-gemma-llm-fine-tuning-adapter-v6` es un adaptador LoRA entrenado mediante QLoRA y Supervised Fine-Tuning sobre el modelo base `unsloth/gemma-4-E2B-it`. Lo desarrolla el usuario ramoncg en el contexto de un reto tecnico y esta orientado a tareas de NLP veterinario: clasificacion multietiqueta de capitulos sindromicos ICD-11, extraccion de entidades de enfermedad (Disease NER) y extraccion de entidades de anonimizacion (Anonymisation NER). Se entrena sobre datos derivados del dataset SAVSNET/PetEVAL.

El repositorio contiene unicamente el adaptador (0,1 GB en safetensors), no un checkpoint autonomo, por lo que requiere cargar el modelo base para su uso. El entrenamiento emplea QLoRA con el modelo base en 4 bits, rango LoRA 16, alpha 32, dropout 0,05 y una longitud maxima de 1024 tokens. El perfil rapido utiliza 516 ejemplos etiquetados por tarea (172 por tarea) en una pasada, con 129 pasos objetivo y un limite de 600 segundos sobre 4249 registros de origen.

La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de adaptacion de un modelo Gemma de ultima generacion a un dominio vertical sanitario; por otro, advierte sobre las limitaciones metodologicas del split de evaluacion, que el propio autor reconoce que no constituye un benchmark independiente. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA + SFT) sobre transformer Gemma 4 E2B |
| Parametros totales | no disponible (el adaptador LoRA no declara numero de parametros; el modelo base es `unsloth/gemma-4-E2B-it`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens en entrenamiento (longitud maxima configurada); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | QLoRA con base cargada en 4 bits durante el entrenamiento; cuantizaciones de inferencia no disponibles |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA); requiere el modelo base para cargarse |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `unsloth/gemma-4-E2B-it`, un transformer de la familia Gemma 4 en su variante E2B. El metodo de ajuste es QLoRA: el modelo base se carga en 4 bits y se entrenan matrices de bajo rango con rango 16, alpha 32 y dropout 0,05. La longitud maxima de secuencia durante el entrenamiento es de 1024 tokens. El entrenamiento combina Supervised Fine-Tuning sobre tres tareas de anotacion NLP, con 4249 registros de origen; el perfil rapido emplea 516 ejemplos etiquetados por tarea (172 por tarea) en una unica pasada, con 129 pasos objetivo y un limite de 600 segundos.

Los datos proceden del dataset `ramoncg/tech-challenge-gemma-llm-fine-tuning-dataset`, derivado de SAVSNET/PetEVAL. El split utilizado es un "internal grouped 85/15 from published split test". El autor advierte explicitamente de que el Hub solo exponia el split `test`, de modo que parte de ese test se uso en entrenamiento y el holdout interno no reproduce el protocolo clinic-disjoint del articulo PetEVAL, por lo que no debe presentarse como evaluacion oficial independiente. El articulo original describe 11.000 registros de entrenamiento, 1.600 de evaluacion y 5.000 de test, con 20 capitulos ICD-11 seleccionados; el split actual contiene 18 rotulos distintos observados, y el pipeline no inventa rotulos ausentes. Las instrucciones de Disease NER siguen la politica del articulo (incluir condiciones nombradas y diagnosticos diferenciales o sospechosos, excepto menciones negadas explicitamente), y Anonymisation sigue las categorias PER/LOC/ORG/TIME/MISC observadas en el dataset.

## Capacidades

- Clasificacion multietiqueta de capitulos sindromicos ICD-11 sobre texto veterinario.
- Extraccion de entidades de enfermedad (Disease NER), incluyendo diagnosticos diferenciales y sospechosos, con exclusion de menciones negadas explicitamente.
- Extraccion de entidades de anonimizacion (Anonymisation NER) en las categorias PER, LOC, ORG, TIME y MISC.
- Generacion de texto conversacional heredada del modelo base `gemma-4-E2B-it` (pipeline declarado: text-generation).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (la model card no declara idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Anotacion automatizada de historiales clinicos veterinarios: el adaptador clasifica cada registro en los capitulos sindromicos ICD-11 presentes en el dataset, lo que permite etiquetar grandes volumenes de texto de practicas veterinarias sin intervencion manual.
- Extraccion de entidades de enfermedad para codificacion: a partir de notas clinicas, el modelo identifica condiciones nombradas y diagnosticos diferenciales, excluyendo menciones negadas, lo que facilita la construccion de indices de morbilidad.
- Seudonimizacion de registros antes de compartirlos: la tarea Anonymisation NER detecta nombres de personas, localizaciones, organizaciones, expresiones temporales y identificadores explicitos, permitiendo sustituirlos antes de publicar datasets.
- Preprocesado de corpus para investigacion epidemiologica: el adaptador puede usarse como paso previo en pipelines que alimentan estudios de vigilancia sindromica, dado que reproduce el esquema de anotacion del articulo PetEVAL.
- Prototipado rapido de herramientas de NLP veterinario: al ser un adaptador LoRA de 0,1 GB, se puede cargar junto al modelo base en entornos de experimentacion con recursos limitados y ajustar de nuevo con QLoRA.
- Evaluacion comparativa de estrategias de fine-tuning: el repositorio documenta el perfil de entrenamiento (rank, alpha, dropout, pasos, limite de tiempo), lo que lo convierte en una referencia reproducible para comparar QLoRA frente a otras tecnicas en dominios verticales.
- Generacion asistida de resumenes o respuestas conversacionales sobre contenido veterinario, aprovechando la naturaleza instruct del modelo base, siempre con supervision profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de metricas (F1, precision, recall) para las tareas de clasificacion o NER, y advierte de que el holdout interno no constituye una evaluacion oficial independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador; al requerir el modelo base `gemma-4-E2B-it`, el consumo dependera de la cuantizacion elegida para ese modelo base.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el adaptador en si ocupa 0,1 GB, pero el modelo base condiciona el requisito real.
- Opciones de despliegue: el repositorio usa safetensors y el ecosistema unsloth; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ramoncg/tech-challenge-gemma-llm-fine-tuning-adapter-v6 | no disponible (adaptador LoRA sobre Gemma 4 E2B) | 1024 tokens en entrenamiento | Clasificacion ICD-11 y NER veterinario | apache-2.0 | Hugging Face |
| unsloth/gemma-4-E2B-it (modelo base) | no disponible | no disponible | Generacion de texto instruct general | no disponible | Hugging Face |
| Modelos especializados en NER clinico veterinario | no disponible | no disponible | NER y clasificacion | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El adaptador no es un sistema de diagnostico veterinario: no prescribe tratamientos ni sustituye a profesionales veterinarios; solo reproduce las anotaciones del dataset PetEVAL.
- El holdout interno no es un benchmark independiente: parte del split `test` del Hub se uso en entrenamiento y no se dispone de identificador de practica, por lo que no se reproduce el protocolo clinic-disjoint del articulo.
- El split actual contiene 18 rotulos ICD-11 distintos frente a los 20 del articulo; el pipeline no inventa rotulos ausentes, lo que puede limitar la cobertura en produccion.
- El repositorio contiene solo el adaptador LoRA, no un checkpoint autonomo; es imprescindible cargar el modelo base `unsloth/gemma-4-E2B-it`.
- La longitud maxima de entrenamiento es de 1024 tokens; textos mas largos pueden truncarse y perder entidades o contexto relevante.
- No se declaran idiomas soportados ni sesgos conocidos; el comportamiento fuera del dominio veterinario y en idiomas distintos del de los datos de entrenamiento es incierto.
- Riesgo de alucinacion inherente al modelo base generativo, especialmente si se usa fuera de las tareas de anotacion para las que fue ajustado.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y condiciones del modelo base y del dataset de origen antes de desplegar en produccion.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/ramoncg/tech-challenge-gemma-llm-fine-tuning-adapter-v6
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it
- Dataset de fine-tuning: https://huggingface.co/datasets/ramoncg/tech-challenge-gemma-llm-fine-tuning-dataset
- Articulo PetEVAL: no disponible en la informacion proporcionada
- Repositorio de unsloth: no disponible en la informacion proporcionada
