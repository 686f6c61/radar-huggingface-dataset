# ramoncg/tech-challenge-gemma-llm-fine-tuning-light-v5

## Resumen

El modelo `ramoncg/tech-challenge-gemma-llm-fine-tuning-light-v5` es un adaptador LoRA entrenado mediante QLoRA y SFT sobre el modelo base `unsloth/gemma-4-E2B-it`, desarrollado por el usuario ramoncg en el contexto de un reto tecnico de fine-tuning. No se trata de un checkpoint autonomo, sino de un conjunto de pesos de adaptador (0,1 GB en el repositorio) que debe cargarse junto con el modelo base para funcionar. Su proposito es resolver tres tareas de procesamiento de lenguaje natural clinico veterinario sobre el dataset SAVSNET/PetEVAL: clasificacion multietiqueta de capitulos sindromicos ICD-11, extraccion de entidades de enfermedad (Disease NER) y extraccion de entidades de anonimizacion (Anonymisation NER).

El adaptador se entreno con rango LoRA 16, alpha 32, dropout 0,05 y una longitud maxima de 1024 tokens, partiendo de una carga del modelo base en 4 bits. El entrenamiento utilizo 288 ejemplos etiquetados por tarea (96 por tarea) en una sola pasada, con 72 pasos objetivo y un limite de 360 segundos, lo que lo situa en la categoria de fine-tuning ligero o "perfil rapido". La licencia declarada es Apache 2.0.

La relevancia de esta ficha es doble: por un lado, documenta un caso practico de adaptacion de un modelo Gemma 4 de 2B parametros a un dominio vertical muy especifico (NLP veterinario); por otro, advierte de las limitaciones metodologicas del entrenamiento, ya que el holdout interno no reproduce el protocolo clinic-disjoint del articulo PetEVAL y parte del split de test se uso en entrenamiento, por lo que las metricas no deben presentarse como evaluacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (Gemma 4 E2B) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es `unsloth/gemma-4-E2B-it`) |
| Parametros activos | no disponible |
| Longitud de contexto | 1024 tokens (longitud maxima de entrenamiento) |
| Tipos de cuantizacion | QLoRA con base cargada en 4 bits; cuantizaciones adicionales no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |
| Rank LoRA | 16 |
| Alpha LoRA | 32 |
| Dropout LoRA | 0,05 |
| Tamano del repositorio | 0,1 GB |
| Modelo base | `unsloth/gemma-4-E2B-it` |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador se construye sobre `unsloth/gemma-4-E2B-it`, un modelo de la familia Gemma 4 con nomenclatura "E2B" (2B parametros, segun el identificador). El entrenamiento emplea QLoRA: el modelo base se carga cuantizado en 4 bits y se entrenan unicamente los pesos de bajo rango (rank 16, alpha 32, dropout 0,05). La longitud maxima de secuencia durante el entrenamiento fue de 1024 tokens. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; la model card solo describe SFT supervisado.

El dataset de origen es SAVSNET/PetEVAL, con 4249 registros de origen. El perfil de entrenamiento "rapido" uso 288 ejemplos etiquetados por tarea (96 por tarea) en una unica pasada, con 72 pasos objetivo y un limite temporal de 360 segundos. El split empleado se describe como "internal grouped 85/15 from published split test": el Hub solo exponia el split `test`, por lo que el holdout interno se construyo a partir de ese test y parte de el se uso en entrenamiento. El articulo PetEVAL original describe 11.000 registros de entrenamiento, 1.600 de evaluacion y 5.000 de test con division por practica veterinaria, pero esta ejecucion no dispone del identificador de practica, por lo que no reproduce el protocolo clinic-disjoint. Ademas, el articulo reporta 20 capitulos ICD-11 seleccionados, mientras que el split actual contiene 18 etiquetas distintas observadas; el pipeline no inventa etiquetas ausentes.

## Capacidades

- Clasificacion multietiqueta de capitulos sindromicos ICD-11 sobre texto clinico veterinario.
- Extraccion de entidades de enfermedad (Disease NER), incluyendo condiciones nombradas y diagnosticos diferenciales o sospechosos, excluyendo menciones explicitamente negadas.
- Extraccion de entidades de anonimizacion (Anonymisation NER) con categorias PER, LOC, ORG, TIME y MISC, siguiendo la definicion principal de la seccion 4.1.1 del articulo para MISC como identificadores explicitos.
- Generacion de texto conversacional heredada del modelo base Gemma 4 E2B instruct.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; los idiomas soportados no se declaran.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Anotacion automatizada de historiales clinicos veterinarios: el adaptador puede etiquetar registros con capitulos sindromicos ICD-11 de forma multietiqueta, lo que permite clasificar grandes volumenes de notas clinicas para estudios epidemiologicos o para poblar bases de datos estructuradas.
- Extraccion de entidades de enfermedad para investigacion: dado un texto clinico, el modelo identifica condiciones nombradas y diagnosticos diferenciales, util para construir cohortes de pacientes o para analisis de prevalencia de enfermedades en redes de practicas veterinarias.
- Anonimizacion de datos antes de su publicacion o comparticion: el adaptador detecta entidades PER, LOC, ORG, TIME y MISC, lo que facilita el cumplimiento de requisitos de privacidad en la cesion de datasets clinicos.
- Preetiquetado en flujos de anotacion humana: el modelo puede generar propuestas de etiquetas que un anotador humano revisa y corrige, reduciendo el coste de anotacion manual en proyectos de NLP veterinario.
- Prototipado rapido de pipelines de NLP clinico: al ser un adaptador ligero (0,1 GB) sobre un modelo de 2B, permite experimentar con tareas de clasificacion y NER en entornos con recursos limitados.
- Evaluacion comparativa de estrategias de fine-tuning: el adaptador sirve como referencia de un perfil de entrenamiento "rapido" (288 ejemplos, 360 segundos) frente a configuraciones mas extensas, util para estudiar el compromiso entre coste y calidad en dominios verticales.
- Integracion en herramientas de codificacion clinica: puede asistir en la asignacion de codigos ICD-11 a registros veterinarios, siempre con supervision profesional y sin sustituir el juicio clinico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explicitamente de que las metricas del holdout interno no deben presentarse como evaluacion oficial independiente, ya que parte del split de test se uso en entrenamiento y no se reproduce el protocolo clinic-disjoint del articulo PetEVAL.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; al tratarse de un adaptador LoRA sobre un modelo base de 2B parametros, el requisito depende de la cuantizacion del base (4 bits en entrenamiento, pero no se declara la configuracion de inferencia).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en tarjetas consumer concretas.
- Opciones de despliegue: no disponible; la model card solo indica que el repositorio contiene el adaptador LoRA y los archivos necesarios para cargarlo con el modelo base, sin especificar frameworks de serving (vLLM, llama.cpp, Ollama, TGI).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ramoncg/tech-challenge-gemma-llm-fine-tuning-light-v5` | Adaptador LoRA sobre base 2B (E2B) | 1024 tokens (entrenamiento) | Clasificacion ICD-11, Disease NER, Anonymisation NER | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| `unsloth/gemma-4-E2B-it` (modelo base) | 2B (segun nomenclatura E2B) | no disponible | Generacion de texto conversacional | no disponible | Hugging Face (referenciado como base) |
| Alternativas especificas de NLP veterinario | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros adaptadores o modelos comparables de NLP veterinario en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador no es un sistema de diagnostico veterinario: no prescribe tratamientos y no sustituye a profesionales veterinarios; solo reproduce las anotaciones del dataset PetEVAL.
- El holdout interno no constituye una evaluacion independiente: parte del split de test se uso en entrenamiento y no se reproduce el protocolo clinic-disjoint del articulo original.
- El split actual contiene 18 etiquetas ICD-11 distintas frente a las 20 del articulo PetEVAL; el pipeline no inventa etiquetas ausentes, lo que puede limitar la cobertura en produccion.
- El entrenamiento uso solo 288 ejemplos etiquetados por tarea en una pasada y un limite de 360 segundos, por lo que la calidad puede ser inferior a la de adaptadores entrenados con el dataset completo.
- No se declaran los idiomas soportados; el dataset de origen es probablemente en ingles, pero no se confirma.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser un modelo generativo, puede producir etiquetas o entidades no presentes en el texto.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base `unsloth/gemma-4-E2B-it`, cuya licencia no se detalla en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validacion por parte de la comunidad.
- El adaptador requiere cargar el modelo base; no es un checkpoint autonomo y su despliegue depende de la disponibilidad y configuracion de dicho base.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/ramoncg/tech-challenge-gemma-llm-fine-tuning-light-v5
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it
- Dataset SAVSNET/PetEVAL: https://huggingface.co/datasets/SAVSNET/PetEVAL
- Articulo PetEVAL: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
