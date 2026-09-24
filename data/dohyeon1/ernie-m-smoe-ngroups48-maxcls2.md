# Dohyeon1/ERNIE-M-SMoE-ngroups48-maxcls2

## Resumen

Dohyeon1/ERNIE-M-SMoE-ngroups48-maxcls2 es un checkpoint de generacion de texto publicado en Hugging Face por el usuario Dohyeon1. Se trata de un modelo de aproximadamente 21.825 millones de parametros (43,7 GB en safetensors), etiquetado con la arquitectura `ernie4_5_moe` y con el sufijo SMoE (Sparse Mixture of Experts) en su nombre, lo que indica que se trata de una variante de mezcla dispersa de expertos derivada de la familia ERNIE 4.5 MoE. El sufijo `ngroups48` apunta a una configuracion de 48 grupos de enrutamiento y `maxcls2` a un parametro de clasificacion/clustering del enrutador, aunque el autor no documenta ninguno de estos extremos.

El modelo resuelve, en principio, el mismo problema que cualquier LLM causal de proposito general: generacion de texto y conversacion multi-turno (`pipeline: text-generation`, tag `conversational`). Su relevancia es limitada en el momento de redactar esta ficha: 0 descargas, 0 "likes" y una model card autogenerada por la plantilla de Hugging Face en la que todos los campos utiles ("Developed by", "Language(s)", "License", "Training Data", "Evaluation") aparecen como `[More Information Needed]`. En la practica es un artefacto de investigacion experimental, no un modelo listo para produccion.

Debe subrayarse que no hay informacion verificable sobre datos de entrenamiento, licencia, idiomas soportados, longitud de contexto ni resultados de evaluacion. Todo lo que sigue distingue explicitamente entre datos confirmados y datos no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal de tipo mixture-of-experts dispersa (SMoE), etiquetada como `ernie4_5_moe` en el Hub; sin confirmar por el autor |
| Parametros totales | 21.825.437.888 (dato real de los safetensors) |
| Parametros activos | no disponible (la nomenclatura SMoE implica activacion parcial, pero no se publica el numero) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles; el repositorio solo contiene safetensors en precision de 16 bits (43,7 GB para 21,8 B de parametros), sin GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no declara licencia) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Pipeline declarado | text-generation |
| Tags del repositorio | transformers, safetensors, ernie4_5_moe, text-generation, conversational, endpoints_compatible, region:us, arxiv:1910.09700 |
| Tamano del repositorio | 43,7 GB |
| Fecha de creacion / actualizacion | 2026-09-23 / 2026-09-23 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El unico indicio arquitectonico fiable es el tag `ernie4_5_moe` y el propio nombre del checkpoint: se trata de un transformer causal con capas de mezcla dispersa de expertos (SMoE), en la linea de la familia ERNIE 4.5 MoE de Baidu. El sufijo `maxcls2` sugiere algun tipo de parametro de agrupamiento o clasificacion adicional en el enrutador, y `ngroups48` un total de 48 grupos. Ninguno de estos detalles esta confirmado por documentacion del autor: la model card es la plantilla generada automaticamente por Hugging Face y no contiene descripcion tecnica.

No hay absolutamente ningun dato sobre el entrenamiento: se desconocen el numero de tokens, la composicion del dataset, el regimen de precision, la existencia de fases de RLHF, DPO o instruction tuning, y el checkpoint del que deriva. El autor ha publicado otros checkpoints con nomenclatura similar (ERNIE-M-SMoE-ngroups48, ERNIE-Sub-MoE-ngroups48-maxcls2, ERNIE-HC-SMoE-ngroups48, ERNIE-HC-SMoE-ngroups56 y OLMoE-Sub-MoE-ngroups48), lo que apunta a una linea de experimentacion sobre enrutamiento por grupos mas que a un entrenamiento desde cero. El identificador arXiv presente en los tags (1910.09700) corresponde al articulo del calculador de impacto medioambiental de Lacoste et al., citado en la plantilla de Hugging Face, y no a un paper del modelo.

## Capacidades

- Generacion de texto causal: es la unica capacidad confirmada por el pipeline declarado (`text-generation`).
- Conversacion: el tag `conversational` sugiere plantilla de chat, pero no se documenta el formato de prompt ni la existencia de un chat template verificado.
- Razonamiento, matematicas y generacion de codigo: no disponible; no hay evaluaciones ni declaraciones al respecto.
- Tool calling / function calling: no disponible; no se documenta soporte de herramientas.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el fabricante no declara idiomas.
- Capacidades especiales (vision, audio, modo "thinking"): no disponibles.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que el checkpoint puede servirse en Hugging Face Inference Endpoints con la libreria `transformers`.

## Casos de uso

Dado que el modelo carece de documentacion, evaluacion y licencia, los casos siguientes son escenarios plausibles para un LLM causal de ~21,8 B parametros con arquitectura MoE, no aplicaciones validadas sobre este checkpoint concreto.

- Experimentacion academica con enrutamiento MoE: el checkpoint permite inspeccionar como se distribuye la carga entre 48 grupos de expertos en un transformer de ~21,8 B parametros, comparandolo con los otros checkpoints de la misma familia publicados por el autor.
- Fine-tuning supervisado sobre dominio propio: al ser un modelo relativamente compacto (43,7 GB en fp16), puede ajustarse con LoRA o QLoRA en un dominio concreto para tareas de generacion de texto, siempre que se resuelva antes la ambiguedad de licencia.
- Generacion de texto asistida por recuperacion (RAG): puede integrarse como generador en un pipeline de recuperacion de documentos, aunque la ausencia de datos sobre la ventana de contexto impide dimensionar el tamaño de los fragmentos recuperados.
- Prototipado de asistentes conversacionales: sirve para validar arquitecturas de chat multi-turno en fase de pruebas, no para despliegue con usuarios reales mientras no haya evaluacion de seguridad.
- Servicio de inferencia con `transformers` o vLLM: el formato safetensors y el tag `endpoints_compatible` permiten levantar un endpoint propio en infraestructura con suficiente VRAM.
- Estudio comparativo de variantes de enrutamiento: los checkpoints hermanos (`ernie-m-smoe-ngroups48`, `ernie-sub-moe-ngroups48-maxcls2`, `ernie-hc-smoe-ngroups48`, `ernie-hc-smoe-ngroups56`) permiten aislar el efecto del numero de grupos y del esquema `maxcls` sobre la perplejidad.
- Base para ablaciones de cuantizacion: al no existir versiones GGUF publicadas, es un candidato para generar cuantizaciones propias (4 y 8 bits) y medir la degradacion en tareas de generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye ninguna seccion de evaluacion cumplimentada y la busqueda web no aporta cifras de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion para este checkpoint.

## Requisitos de hardware

Estimaciones derivadas del recuento real de parametros (21,83 B), no de mediciones sobre este checkpoint.

- VRAM para inferencia en fp16/bf16: en torno a 44 GB solo para pesos, mas cache KV; con contexto largo y lote grande, entre 50 y 70 GB.
- VRAM con cuantizacion de 8 bits: aproximadamente 22-24 GB de pesos.
- VRAM con cuantizacion de 4 bits: aproximadamente 12-14 GB de pesos.
- GPU recomendadas para fp16 sin cuantizar: A100 80 GB, H100 80 GB o H200; tambien 2x A6000 48 GB o 4x RTX 3090/4090 con tensor parallelism.
- GPU de consumo: no cabe en una unica RTX 4090 de 24 GB en fp16. Si cabe en 8 bits (al limite) y con holgura en 4 bits, en RTX 4090, RTX 4080 Super o RTX 3090 de 24 GB.
- Opciones de despliegue: `transformers` (opcion nativa del repositorio), Hugging Face Inference Endpoints (`endpoints_compatible`), vLLM o TGI para servido con batching continuo. No hay ficheros GGUF, por lo que llama.cpp y Ollama requeririan convertir y cuantizar previamente.
- Latencia y throughput: no disponibles. No se ha publicado ningun dato de tokens por segundo.

## Comparativa con modelos similares

No hay datos verificables de este checkpoint ni de sus alternativas mas alla del recuento de parametros y la licencia declarada. La comparativa se limita a los checkpoints hermanos localizados en la busqueda web, todos del mismo autor y con documentacion igualmente vacia.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ERNIE-M-SMoE-ngroups48-maxcls2 (este) | 21,83 B | no disponible | no disponible | 0 descargas, 0 likes, model card vacia |
| Dohyeon1/ERNIE-M-SMoE-ngroups48 | ~21 B | no disponible | no disponible | Variante sin el sufijo `maxcls2` |
| Dohyeon1/ERNIE-Sub-MoE-ngroups48-maxcls2 | no disponible | no disponible | no disponible | Misma nomenclatura, tag de arquitectura distinto |
| Dohyeon1/ERNIE-HC-SMoE-ngroups48 | no disponible | no disponible | no disponible | Variante etiquetada "HC" |
| Dohyeon1/ERNIE-HC-SMoE-ngroups56 | ~21 B | 32.768 tokens (segun ficha de terceros en featherless.ai, no confirmado por el autor) | no disponible | 56 grupos en lugar de 48; mismo orden de magnitud |
| Dohyeon1/OLMoE-Sub-MoE-ngroups48 | no disponible | no disponible | no disponible | Experimento sobre la base OLMoE en lugar de ERNIE |

## Limitaciones y advertencias

- Licencia ausente: el repositorio no declara licencia. En ausencia de licencia explicita, no se concede ningun derecho de uso, lo que hace inviable su explotacion comercial sin aclaracion previa del autor.
- Documentacion inexistente: la model card es la plantilla autogenerada; no hay informacion sobre datos de entrenamiento, hiperparametros ni evaluacion.
- Riesgo de alucinacion: no evaluado. Al no existir ninguna medicion de veracidad ni de tasas de alucinacion, debe asumirse el comportamiento tipico de un LLM causal sin datos que lo desmientan.
- Sesgos: desconocidos. No se documenta la composicion del corpus de entrenamiento, por lo que no puede estimarse el sesgo de genero, raza, religion o nacionalidad.
- Idioma: se desconoce si el modelo tiene competencia real en castellano. El autor no declara idiomas soportados.
- Longitud de contexto: no disponible. Es un parametro critico que no puede inferirse de forma fiable a partir del nombre del checkpoint.
- Parametros activos: al ser un MoE, el coste de inferencia depende del numero de expertos activados por token, dato que no se publica. Los requisitos de VRAM de la seccion anterior asumen que todos los pesos deben residir en memoria, lo que es correcto pero no permite estimar el coste de computo por token.
- Madurez: 0 descargas y 0 likes en el momento de redactar esta ficha; no hay evidencia de que el checkpoint haya sido validado por terceros.
- Trazabilidad: se desconoce el modelo base exacto del que deriva y si respeta las condiciones de la licencia de ERNIE 4.5 o de OLMoE, segun corresponda.
- Inconsistencia de fechas: el campo de creacion del repositorio indica 2026-09-23, fecha posterior a la mayoria de referencias disponibles; conviene verificarla antes de citar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dohyeon1/ERNIE-M-SMoE-ngroups48-maxcls2
- Ficha de terceros de la variante ngroups48 en featherless.ai: https://featherless.ai/models/Dohyeon1/ERNIE-M-SMoE-ngroups48
- Checkpoint hermano ERNIE-Sub-MoE-ngroups48-maxcls2: https://huggingface.co/Dohyeon1/ERNIE-Sub-MoE-ngroups48-maxcls2
- Checkpoint hermano ERNIE-HC-SMoE-ngroups48: https://huggingface.co/Dohyeon1/ERNIE-HC-SMoE-ngroups48
- Checkpoint hermano ERNIE-HC-SMoE-ngroups56 (ficha de terceros): https://featherless.ai/models/Dohyeon1/ERNIE-HC-SMoE-ngroups56
- Checkpoint hermano OLMoE-Sub-MoE-ngroups48 (espejo): https://hf-p-cfw.fyan.top/Dohyeon1/OLMoE-Sub-MoE-ngroups48
- Paper referenciado en los tags (Lacoste et al., 2019, sobre impacto medioambiental del aprendizaje automatico; no es el paper del modelo): https://arxiv.org/abs/1910.09700
