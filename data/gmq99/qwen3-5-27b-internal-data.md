# gmq99/qwen3.5-27b-internal-data

## Resumen

qwen3.5-27b-internal-data es un ajuste fino (fine-tuning) de pesos completos del modelo Qwen/Qwen3.5-27B, publicado por el usuario gmq99 en Hugging Face. El entrenamiento se ha realizado sobre la particion de entrenamiento fold-0 de un conjunto de datos denominado CMV, con mayoria humana, y el objetivo declarado es producir un modelo juez que emita un unico token de veredicto, `A` o `B`. El modelo conserva la torre de vision del modelo base, aunque esta fue congelada durante el entrenamiento porque todos los ejemplos eran exclusivamente de texto.

El modelo tiene 27.356.728.560 parametros (unos 27,36 mil millones) y un tamano de repositorio de 109,4 GB, lo que sugiere pesos en precision alta (probablemente bf16). Se distribuye bajo licencia Apache 2.0 y esta pensado para su uso con la libreria transformers. La arquitectura subyacente es la del modelo Qwen3.5, que segun los tags de Hugging Face corresponde a la familia qwen3_5 y admite tareas de image-text-to-text y text-generation.

La relevancia de este modelo es limitada y muy especifica: no es un modelo generalista, sino un ajuste orientado a una tarea concreta de clasificacion binaria (juez A/B) sobre un corpus concreto. No se han publicado datos de benchmarks en la informacion disponible, ni detalles sobre composicion del dataset, numero de tokens de entrenamiento o hiperparametros mas alla de los mencionados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; tag `qwen3_5`), con torre de vision congelada |
| Parametros totales | 27.356.728.560 (~27,36 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-27B, un transformer de la familia Qwen3.5 con capacidad multimodal (image-text-to-text segun el pipeline tag). El ajuste fino se realizo sobre los pesos completos (full-weight fine-tuning) de la pila de texto, manteniendo congelada la torre de vision, ya que todos los ejemplos de entrenamiento eran de solo texto. El entrenamiento se llevo a cabo con FSDP en 8 GPUs, con una particion de validacion del 20 % agrupada por reclamacion (claim-grouped) y early stopping basado en la perdida de validacion con paciencia dos.

El objetivo del ajuste es que el modelo actue como juez y emita un unico token de veredicto, `A` o `B`. No se especifica en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset CMV, ni si se emplearon tecnicas de RLHF o DPO. El autor remite a `training_summary.json` para la procedencia de las particiones, hiperparametros, seleccion de validacion y metricas de evaluacion sobre fold-0 no tocado, pero esos datos no estan incluidos en la informacion proporcionada.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, tag `conversational`).
- Capacidad multimodal heredada del modelo base (image-text-to-text), aunque la torre de vision no fue entrenada en este ajuste.
- Emision de un unico token de veredicto `A` o `B` como tarea principal tras el ajuste (funcion de juez).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion automatizada de pares de respuestas (juez A/B): el modelo emite un token de veredicto `A` o `B`, lo que permite integrarlo en pipelines de evaluacion de modelos o de anotacion donde se compara una respuesta contra otra y se necesita un juicio binario rapido.
- Filtrado de preferencias en datasets: dado un par de textos, el modelo puede usarse para etiquetar cual es preferible, alimentando procesos de construccion de datasets de preferencias humanas (el corpus CMV sugiere este tipo de uso).
- Control de calidad en generacion de contenido: comparar dos versiones de un texto generado y seleccionar la mejor segun el criterio aprendido, como paso previo a la publicacion o al envio a un revisor humano.
- Investigacion sobre jueces automaticos: sirve como modelo de referencia para estudiar el comportamiento de jueces LLM en tareas binarias y comparar con otros jueces de mayor o menor tamano.
- Prototipado de sistemas de evaluacion internos: al estar bajo licencia Apache 2.0, puede desplegarse en infraestructura propia para evaluar respuestas de modelos internos sin depender de APIs externas.
- Generacion de texto general: a pesar del ajuste especifico, conserva las capacidades del modelo base Qwen3.5-27B y puede usarse para generacion de texto, aunque no es su proposito declarado y no hay garantias de calidad tras el ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona metricas de evaluacion sobre fold-0 no tocado en `training_summary.json`, pero dichos valores no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia aproximada, 27,36 mil millones de parametros en bf16 requieren del orden de 55 GB solo para los pesos, mas memoria para el contexto y el runtime; en cuantizacion de 8 bits rondaria los 28 GB y en 4 bits unos 14-16 GB, aunque estas cifras no estan confirmadas por el autor.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, cabria esperar GPUs de clase A100 80 GB, H100 80 GB o configuraciones multi-GPU para precision completa.
- Compatibilidad con GPU de consumo: no confirmada. En cuantizacion agresiva (4 bits) podria caber en GPUs de 24 GB como la RTX 4090, pero no hay datos oficiales.
- Opciones de despliegue: el repo usa transformers; no se indica soporte para vLLM, llama.cpp, Ollama o TGI. El tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| gmq99/qwen3.5-27b-internal-data | ~27,36 mil millones | no disponible | Apache 2.0 | Ajuste fino especifico para juez A/B sobre CMV fold-0 |
| Qwen/Qwen3.5-27B (modelo base) | ~27 mil millones (segun el ajuste) | no disponible | no disponible en la informacion | Modelo generalista multimodal del que deriva |
| Otros jueces LLM de tamano similar | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre este modelo y alternativas, por lo que la comparativa se limita a parametros, licencia y proposito declarado.

## Limitaciones y advertencias

- El modelo esta ajustado para una tarea muy concreta (veredicto `A`/`B`) sobre un corpus especifico (CMV fold-0); su comportamiento fuera de ese dominio no esta garantizado.
- No se han publicado benchmarks ni metricas de evaluacion en la informacion disponible, por lo que no es posible verificar su calidad objetiva.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; al ser un modelo de lenguaje, conserva el riesgo inherente del modelo base.
- Sesgos conocidos: no documentados; el dataset CMV con "mayoria humana" podria introducir sesgos propios de la anotacion, pero no se detalla su composicion.
- Limitaciones de contexto e idioma: no disponibles; no se especifican idiomas soportados ni longitud de contexto.
- La torre de vision fue congelada y no entrenada; las capacidades multimodales no estan validadas tras el ajuste.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion ni sobre la procedencia/licencia del dataset CMV.
- El repositorio tiene 451 descargas y 0 likes, lo que indica una adopcion muy limitada y escasa validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/gmq99/qwen3.5-27b-internal-data
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.5-27B
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos.
