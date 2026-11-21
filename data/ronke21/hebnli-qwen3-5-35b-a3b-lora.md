# ronke21/hebnli-qwen3.5-35b-a3b-lora

## Resumen

El modelo `ronke21/hebnli-qwen3.5-35b-a3b-lora` es un adaptador LoRA publicado por Ron Keinan (usuario `ronke21`) que especializa el modelo base `Qwen/Qwen3.5-35B-A3B-Base` para la tarea de inferencia de lenguaje natural (NLI) en hebreo con tres clases (implicacion, contradiccion y neutralidad). El adaptador se construye sobre el benchmark HebNLI y se utiliza como uno de los desambiguadores de la estrategia 2 del trabajo HeRE (Hebrew Relation Extraction), un benchmark de extraccion de relaciones en hebreo mediante denoising guiado por LLM de alineamientos de grafos de conocimiento.

El adaptador tiene rango 16, alpha 32, se aplica a todas las matrices de proyeccion lineal y se entrena en bfloat16. El repositorio ocupa aproximadamente 0,1 GB y contiene unicamente los pesos del adaptador, no el modelo base. La relevancia actual reside en que demuestra que un LLM grande de proposito general (un MoE de 35B parametros totales) puede adaptarse con LoRA a una tarea linguistica especifica del hebreo con un rendimiento alto, y que ese adaptador se reutiliza como componente de un pipeline de extraccion de relaciones.

El modelo se invoca con una plantilla concreta en hebreo (`משפט 1: {premise} משפט 2: {hypothesis}`) y la etiqueta se lee del primer token generado: `היסק` (implicacion), `סתירה` (contradiccion) o `ניטרלי` (neutralidad). En el contexto de HeRE, la puntuacion suave se deriva de las log-probabilidades del primer token de esas tres etiquetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer MoE (modelo base Qwen3.5-35B-A3B-Base) |
| Parametros totales | no disponible (el adaptador LoRA es de rango 16; el modelo base es de 35B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en bfloat16) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | apache-2.0 (sujeta a los terminos del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado a todas las matrices de proyeccion lineal del modelo base `Qwen/Qwen3.5-35B-A3B-Base`, un transformer con mezcla de expertos (MoE) segun la nomenclatura A3B del nombre. Los pesos del adaptador se almacenan en bfloat16 y se cargan mediante la libreria PEFT sobre el modelo base completo.

El entrenamiento uso una tasa de aprendizaje de 5e-5, tamano de lote 16 y hasta 8.000 pasos, conservando el checkpoint con mejor macro-F1 de validacion (paso 5.280). Se realizo una unica ejecucion con semilla 42. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO; la tarea es de clasificacion de tres clases y el entrenamiento se orienta a la prediccion del primer token de etiqueta.

## Capacidades

- Clasificacion de inferencia de lenguaje natural (NLI) en hebreo con tres clases: implicacion (`היסק`), contradiccion (`סתירה`) y neutralidad (`ניטרלי`).
- Evaluacion de pares premisa-hipotesis mediante una plantilla fija en hebreo.
- Extraccion de puntuaciones suaves a partir de las log-probabilidades del primer token de las tres etiquetas, util para agregar senales en pipelines.
- Actua como desambiguador (denoiser) de la estrategia 2 del benchmark HeRE para extraccion de relaciones en hebreo.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Clasificacion NLI en hebreo: el adaptador recibe un par premisa-hipotesis con la plantilla `משפט 1: ... משפט 2: ...` y devuelve una de las tres etiquetas, adecuado para tareas de deteccion de contradicciones en textos hebreos.
- Filtrado de pares en pipelines de extraccion de relaciones: dentro de HeRE, el adaptador actua como denoiser para validar o descartar alineamientos candidatos entre entidades y relaciones, reduciendo falsos positivos antes de consolidar el grafo de conocimiento.
- Verificacion de consistencia en datasets hebreos: permite comprobar si una frase implica, contradice o es neutral respecto a otra, util para control de calidad de corpus y anotaciones.
- Puntuacion blanda para ranking: al usar las log-probabilidades del primer token, se puede ordenar un conjunto de hipotesis candidatas por probabilidad de implicacion, util en sistemas de recuperacion de evidencia.
- Componente de un sistema mayor de NLP en hebreo: el adaptador se integra via PEFT sobre el modelo base y puede combinarse con otros modulos del pipeline HeRE para tareas de estructura de conocimiento.
- Investigacion en adaptacion eficiente: sirve como referencia reproducible (semilla 42, hiperparametros documentados) para estudiar LoRA sobre modelos MoE grandes en tareas linguisticas de bajo recursos como el hebreo.

## Benchmarks y rendimiento

| Modelo / configuracion | HebNLI dev macro-F1 | HebNLI test macro-F1 | HeRE gold validation F1 |
|---|---|---|---|
| Qwen3.5-35B-A3B-Base (adaptador HebNLI, estrategia 2, hipotesis de plantilla) | 0,869 | 0,904 | 0,873 |

La model card indica que esta configuracion es el mejor LLM afinado del articulo HeRE. No se proporcionan en la informacion disponible resultados comparativos con otros modelos en la misma tabla.

## Requisitos de hardware

- El adaptador en si ocupa aproximadamente 0,1 GB, pero requiere cargar el modelo base Qwen3.5-35B-A3B-Base completo para inferencia.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base y de la cuantizacion empleada.
- GPU recomendadas: no disponible; por el tamano del modelo base (35B), se requieren GPUs de datacenter o configuraciones multi-GPU, pero no se documentan modelos concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga via `transformers` + `peft` segun el ejemplo de la model card (`AutoModelForCausalLM.from_pretrained` con `torch_dtype="bfloat16"` y `device_map="auto"`, seguido de `PeftModel.from_pretrained`). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hebnli-qwen3.5-35b-a3b-lora (este adaptador) | LoRA r16 sobre base 35B | no disponible | HebNLI test macro-F1 0,904; HeRE gold F1 0,873 | apache-2.0 | Hugging Face (5 descargas) |
| Qwen3.5-35B-A3B-Base (sin adaptador) | 35B (MoE) | no disponible | no disponible | no disponible | Hugging Face |
| Otros LLM afinados en HeRE | no disponible | no disponible | La model card lo describe como el mejor LLM afinado del articulo | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos numericos de alternativas comparables; la comparativa se limita a lo indicado.

## Limitaciones y advertencias

- El adaptador esta especializado exclusivamente en NLI de tres clases en hebreo; no es un modelo generativo de proposito general.
- Requiere la plantilla exacta en hebreo y la lectura del primer token generado; usos fuera de ese formato pueden degradar el rendimiento.
- Solo se documenta el idioma hebreo; no hay evidencia de funcionamiento en otros idiomas.
- Riesgo de alucinacion y sesgos: no se documentan analisis especificos en la informacion disponible; al ser un clasificador de tres clases, el riesgo se manifiesta como etiquetas erroneas mas que como texto inventado.
- Limitaciones de contexto: no se especifica la longitud maxima de contexto del modelo base en la informacion disponible.
- Licencia: el adaptador se distribuye bajo apache-2.0, pero su uso requiere aceptar los terminos del modelo base Qwen3.5-35B-A3B-Base; verificar esas condiciones para uso comercial.
- El repositorio tiene muy pocas descargas (5) y ningun like, lo que sugiere escasa validacion externa; conviene evaluar en el dominio propio antes de produccion.
- Entrenamiento de una sola ejecucion con semilla 42; no se documenta variabilidad entre semillas.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/ronke21/hebnli-qwen3.5-35b-a3b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base
- Dataset HeRE: https://huggingface.co/datasets/ronke21/HeRE
- Codigo HeRE: https://github.com/Ronke21/HeRE
- Benchmark HebNLI: https://github.com/NNLP-IL/HebNLI
- Paper HeRE (ACL Anthology): https://aclanthology.org/2026.aacl-long.237/
- DOI del paper: https://doi.org/10.18653/2026.aacl-long.237
