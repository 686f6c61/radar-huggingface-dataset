# RumiFold/RumiFold_Models

## Resumen

RumiFold es una familia de modelos especializados en plegamiento de proteinas y prediccion de funcion biologica, desarrollada por RumiFold sobre el modelo base Qwen/Qwen3-8B. Su propuesta tecnica consiste en plegar la proteina dentro de los propios estados ocultos del modelo de lenguaje, de modo que la representacion estructural se genera en el mismo espacio latente que despues se usa para responder preguntas sobre la proteina. Esto permite combinar prediccion estructural con razonamiento en lenguaje natural sobre la estructura y la funcion.

El repositorio RumiFold_Models agrupa multiples checkpoints: variantes de plegamiento (rumifold-95k, rumifold-156k, rumifold-struct-100k, rumifold-struct-174k), variantes ajustadas para Gene Ontology (rumifold-go, rumifold-go-interp), variantes de descripcion de funcion proteica (rumifold-prot2text, rumifold-prot2text-l76), controles experimentales y autoencoders dispersos para interpretabilidad. Los pesos se distribuyen como adaptadores LoRA sobre Qwen3-8B, con licencia Apache-2.0.

Es relevante porque plantea un enfoque alternativo a las arquitecturas dedicadas de prediccion estructural (AlphaFold, ESMFold): en lugar de un modelo especifico de plegamiento, se reutiliza un LLM de 8B parametros y se le ensena a representar la estructura en sus estados internos. El repositorio ocupa 32.3 GB e incluye pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre un transformer decoder (Qwen3-8B); plegamiento representado en los estados ocultos del LLM |
| Parametros totales | 8B en el modelo base Qwen3-8B; tamano de los adaptadores no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (pesos RumiFold); Qwen3-8B y ESM-C 6B bajo sus propias licencias |
| Formato de pesos | safetensors (adaptadores LoRA, config y model card por carpeta) |

## Arquitectura y entrenamiento

RumiFold se construye sobre Qwen3-8B, un transformer decoder de 8.000 millones de parametros, mediante ajuste con LoRA. La innovacion central es que el modelo pliega la proteina dentro de sus propios estados ocultos y despues responde preguntas sobre esa estructura, en lugar de delegar el plegamiento a un modulo externo. El repositorio incluye tambien variantes que leen la capa 76 de ESM-C 6B (rumifold-prot2text-l76) y controles que combinan Qwen con ESM-C o con estados de ESMFold2, lo que sugiere un diseno experimental comparativo entre representaciones propias y representaciones de modelos proteicos dedicados.

El entrenamiento de plegamiento se realizo sobre ensamblados del PDB y modelos de la AlphaFold Database, con exclusiones por secuencia para CAMEO22 y CASP14, segun el apendice A.3 del paper (arXiv:2611.29444). El manifiesto de datos, la fecha de corte de PDB y los criterios de filtrado estan documentados en el dataset RumiFold_Data. RumiFold-Struct entreno sus primeros 100.000 pasos con proteinas de menos de 512 residuos y despues continuo con proteinas mas largas bajo los mismos criterios de cribado. Se empleo replay de lenguaje con prompts de Tulu-3, incluido No Robots, que tiene terminos no comerciales. No se detalla en la informacion disponible si hubo RLHF o DPO.

## Capacidades

- Plegamiento de proteinas representado en los estados ocultos del modelo de lenguaje.
- Prediccion de estructura proteica (variantes rumifold-struct-100k y rumifold-struct-174k, solo plegamiento).
- Respuesta a preguntas estructurales sobre la proteina plegada.
- Anotacion de funcion proteica mediante Gene Ontology (rumifold-go, evaluado en GO-GPT v2).
- Descripcion de funcion proteica en lenguaje natural (rumifold-prot2text y rumifold-prot2text-l76).
- Lectura de representaciones de ESM-C capa 76 en la variante prot2text-l76.
- Interpretabilidad mediante autoencoders dispersos (carpeta saes/).
- Capacidades generales heredadas de Qwen3-8B (generacion de texto, razonamiento), si bien no se documentan explicitamente en la informacion disponible.
- Soporte de tool calling, agentes y modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Prediccion estructural de proteinas en pipelines de biologia computacional: las variantes rumifold-struct generan la estructura dentro de los estados ocultos del LLM, lo que permite integrar el plegamiento en un flujo basado en transformers estandar sin un modulo especializado separado.
- Anotacion funcional automatizada: rumifold-go predice terminos de Gene Ontology y esta evaluado sobre el benchmark GO-GPT v2, adecuado para enriquecer anotaciones de proteinas nuevas o poco caracterizadas.
- Generacion de descripciones funcionales en lenguaje natural: rumifold-prot2text produce texto explicativo sobre la funcion de una proteina, util para documentacion de bases de datos biologicas o informes internos.
- Preguntas y respuestas sobre estructura proteica: al plegar la proteina en sus estados ocultos, el modelo puede responder consultas multi-turno sobre dominios, regiones o implicaciones estructurales en el mismo espacio latente.
- Investigacion en interpretabilidad: los autoencoders dispersos de la carpeta saes/ permiten analizar que caracteristicas estructurales y funcionales codifica el modelo en sus representaciones internas.
- Experimentos comparativos de representaciones: los controles (Qwen + ESM-C, Qwen + ESMFold2, GO-GPT v2 + ESM-C) sirven para estudiar si un LLM generico puede igualar a modelos proteicos dedicados en tareas de plegamiento y funcion.
- Reproduccion de resultados academicos: los checkpoints por etapas (95k, 156k, struct-100k, struct-174k) permiten reproducir el entrenamiento progresivo descrito en el paper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona evaluacion en GO-GPT v2 y el uso de CAMEO22 y CASP14 como conjuntos de exclusion, pero no incluye cifras numericas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, un modelo base de 8B parametros en precision completa requiere del orden de 16 GB solo para pesos, y bastante mas para estados de activacion; los adaptadores LoRA anaden una sobrecarga pequena.
- GPU recomendadas: no disponible. Por tamano del modelo base, serian razonables GPUs de 24 GB o mas (RTX 4090, A100 40/80 GB, H100), pero no se confirma en la documentacion.
- Cabe en consumer GPU: no confirmado; el modelo base de 8B es compatible en teoria con GPUs consumer de gama alta, pero la informacion no lo verifica.
- Opciones de despliegue: el repositorio proporciona un loader propio (`rumifold` en Python, `RumiFold.from_pretrained`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.
- Nota: los pesos de Qwen3-8B y ESM-C 6B son descargas separadas; el repo de 32.3 GB contiene los checkpoints RumiFold, no necesariamente el modelo base completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RumiFold | 8B (base Qwen3-8B) + LoRA | No disponible | Plegamiento en estados ocultos de un LLM | Apache-2.0 | Hugging Face (RumiFold/RumiFold_Models) |
| ESMFold / ESMFold2 | No disponible | No disponible | Modelo proteico dedicado a plegamiento | No disponible | Usado como control en RumiFold |
| ESM-C 6B | 6B | No disponible | Representaciones proteicas dedicadas | No disponible | Usado como control y en prot2text-l76 |
| AlphaFold (datos de entrenamiento) | No disponible | No disponible | Plegamiento dedicado | No disponible | Fuente de estructuras para entrenamiento |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita al enfoque y la disponibilidad.

## Limitaciones y advertencias

- Las predicciones sobre funcion proteica pueden ser erroneas y el modelo puede expresarlas con confianza; para tareas de funcion se recomienda usar rumifold-go o rumifold-prot2text.
- No apto para uso clinico.
- El replay de lenguaje uso prompts de Tulu-3, incluido No Robots, que tiene terminos no comerciales; conviene revisar la procedencia de los datos si se plantea uso comercial.
- Los pesos de Qwen3-8B y ESM-C 6B se distribuyen por separado bajo sus propias licencias, no cubiertas por la Apache-2.0 de RumiFold.
- Los controles y autoencoders dispersos se proporcionan sin codigo de carga, lo que limita su uso directo.
- No se documentan sesgos conocidos, riesgos de alucinacion especificos, limitaciones de contexto ni idiomas soportados en la informacion disponible.
- El repositorio registra 0 descargas y 0 likes, lo que indica ausencia de validacion por parte de la comunidad hasta la fecha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RumiFold/RumiFold_Models
- Dataset de entrenamiento: https://huggingface.co/datasets/RumiFold/RumiFold_Data
- Paper: https://arxiv.org/pdf/2611.29444
- Codigo y demo: https://github.com/kevinlu4588/RumiFold
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
