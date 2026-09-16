# nmuendler/DeepSeek-R1-Distill-Qwen-7B-text-sft-run2-eb32-e3-lr2e-04

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste supervisado (SFT) sobre el modelo `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B`, publicado por el usuario nmuendler bajo el identificador `DeepSeek-R1-Distill-Qwen-7B-text-sft-run2-eb32-e3-lr2e-04`. No se trata de un modelo completo, sino de pesos de adaptador (0,3 GB) que deben cargarse junto con el modelo base mediante PEFT. El nombre del repositorio sugiere una segunda ejecución de SFT sobre texto, con tamaño de lote efectivo 32, 3 epocas y una tasa de aprendizaje de 2e-4, aunque el autor no documenta ninguno de estos parametros en la model card.

La relevancia de esta ficha es limitada pero conviene ser explicito: el repositorio no incluye descripcion, ni datos de entrenamiento, ni evaluacion, ni licencia, y acumula 0 descargas y 0 likes en el momento de la consulta. Es, por tanto, un artefacto de investigacion sin validacion publica, no un modelo listo para produccion. La model card es la plantilla por defecto de HuggingFace con todos los campos marcados como `[More Information Needed]`.

Su interes tecnico radica en el modelo base: `DeepSeek-R1-Distill-Qwen-7B` es un destilado de razonamiento de DeepSeek sobre la arquitectura Qwen2.5, con 7.000 millones de parametros y capacidad de generar cadenas de razonamiento largas. Cualquier adaptador sobre el hereda esas capacidades, pero tambien sus limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en el repositorio del adaptador; heredada del modelo base (transformer decoder-only tipo Qwen2.5) |
| Parametros totales | no disponible para el adaptador (el rango y los modulos LoRA no se publican); el modelo base tiene 7.000 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en el repositorio del adaptador; la del modelo base es de 131.072 tokens segun la documentacion publica de DeepSeek |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en safetensors sin cuantizar y la cuantizacion depende del modelo base con el que se combine |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no declara licencia) |
| Formato de pesos | safetensors (adaptador LoRA/PEFT; no se publican pesos fusionados ni GGUF) |
| Tamano del repositorio | 0,3 GB |
| Libreria | peft (entrenado con PEFT 0.19.1) |
| Pipeline | text-generation |
| Modelo base | deepseek-ai/DeepSeek-R1-Distill-Qwen-7B |
| Fecha de creacion | 16 de septiembre de 2026 |
| Ultima actualizacion | 16 de septiembre de 2026 |

## Arquitectura y entrenamiento

El adaptador no documenta su arquitectura interna: por los tags se sabe que es un LoRA entrenado con la libreria PEFT y que se aplica sobre `DeepSeek-R1-Distill-Qwen-7B`. El modelo base es un transformer decoder-only de tipo Qwen2.5, destilado por DeepSeek a partir de las trazas de razonamiento de su modelo R1; en la practica, esto significa que el modelo base produce cadenas de pensamiento explicitas antes de la respuesta final. El nombre del repositorio indica un SFT sobre texto (`text-sft`), en una segunda ejecucion (`run2`) con lote efectivo 32 (`eb32`), 3 epocas (`e3`) y learning rate 2e-4 (`lr2e-04`), pero no hay ninguna confirmacion en la model card, ni se especifica si el entrenamiento incluyo tokens de relleno enmascarados, plantillas de chat concretas o si se preservo el modo de razonamiento.

No se dispone de informacion sobre el conjunto de datos de entrenamiento, su tamano, su composicion, su idioma ni si paso por filtrado o desduplicacion. Tampoco se documenta si hubo RLHF, DPO u otra fase de alineacion posterior al SFT. La unica referencia tecnica que aparece en los tags es `arxiv:1910.09700`, que corresponde a la calculadora de impacto de carbono de Lacoste et al. y que forma parte de la plantilla automatica de HuggingFace, no a un articulo sobre este adaptador. Framework declarado: PEFT 0.19.1.

## Capacidades

- Generacion de texto y razonamiento multi-paso: al ser un adaptador sobre un destilado de R1, se espera que conserve la generacion de cadenas de pensamiento, aunque el SFT sobre texto puede haber alterado el formato o la longitud de dichas cadenas.
- Razonamiento matematico y resolucion de problemas: capacidad heredada del modelo base, orientada a problemas de competicion y calculo simbolico.
- Generacion de codigo: capacidad heredada del modelo base, con soporte para lenguajes habituales.
- Soporte de tool calling / function calling: no disponible como dato verificado; depende de la plantilla de chat y del runtime con el que se sirva el adaptador.
- Soporte de agentes y multi-step reasoning: probable por herencia del modelo base, no verificado en este adaptador.
- Capacidades multilingues: no disponible; el adaptador no declara idiomas y el efecto del SFT sobre el comportamiento multilingue es desconocido.
- Modo de pensamiento explicito: no disponible; no se especifica si el entrenamiento preserva o elimina los bloques de razonamiento.
- Vision, audio u otras modalidades: no soportadas (el modelo base es exclusivamente de texto).

## Casos de uso

- Reproduccion de experimentos de SFT sobre destilados de razonamiento: el adaptador sirve como punto de partida para estudiar como afecta un SFT de texto a un modelo entrenado con cadenas de pensamiento, comparando con el modelo base sin adaptador.
- Destilacion de trazas de razonamiento: se puede usar para generar soluciones paso a paso en un conjunto propio y luego filtrar por correccion, siempre validando la calidad contra el modelo base.
- Tutorizacion de matematicas en un entorno controlado: el modelo puede descomponer problemas en pasos; requiere revision humana debido a la ausencia de evaluacion publicada.
- Generacion de datos sinteticos para ajuste de modelos mas pequenos: util como generador barato en un pipeline de destilacion, con filtrado posterior por verificadores automaticos.
- Asistencia a la escritura tecnica en castellano o ingles: uso de generacion de texto condicionada, asumiendo que el SFT puede haber reducido el rendimiento fuera del dominio de entrenamiento.
- Analisis de contexto largo en documentos: si el adaptador conserva la ventana de 131.072 tokens del modelo base, permite resumir o extraer informacion de documentos extensos, aunque el comportamiento tras el SFT no esta verificado.
- Prototipado rapido con LoRA: al pesar solo 0,3 GB, permite iterar sobre el mismo modelo base intercambiando adaptadores sin duplicar los 15 GB de pesos completos.
- Evaluacion comparativa de metodos de ajuste: util como linea base en articulos o experimentos internos sobre PEFT, dada la trazabilidad del nombre (epocas, lote efectivo, learning rate).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del adaptador en la informacion disponible. El autor no incluye ninguna seccion de evaluacion y la model card mantiene `[More Information Needed]` en todos los campos.

A continuacion se recogen, como referencia, los resultados publicados por DeepSeek para el modelo base y otros miembros de la misma familia de destilados. Estos numeros corresponden al modelo sin el adaptador y no deben atribuirse a este repositorio.

| Modelo | AIME 2024 (pass@1) | MATH-500 (pass@1) | GPQA Diamond (pass@1) | LiveCodeBench (pass@1) | Codeforces (rating) |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B | 28,9 | 83,9 | 33,8 | 16,9 | 954 |
| DeepSeek-R1-Distill-Qwen-7B (modelo base) | 55,5 | 92,8 | 49,1 | 37,6 | 1189 |
| DeepSeek-R1-Distill-Llama-8B | 50,4 | 89,1 | 49,0 | 39,6 | 1205 |
| DeepSeek-R1-Distill-Qwen-14B | 69,7 | 93,9 | 59,1 | 53,1 | 1481 |
| DeepSeek-R1-Distill-Qwen-32B | 72,6 | 94,3 | 62,1 | 57,2 | 1691 |
| Adaptador `nmuendler/...-text-sft-run2-eb32-e3-lr2e-04` | no disponible | no disponible | no disponible | no disponible | no disponible |

## Requisitos de hardware

- El adaptador ocupa 0,3 GB, pero es imprescindible descargar el modelo base completo (aproximadamente 15 GB en fp16) para poder usarlo.
- VRAM estimada para el modelo base en precision completa: en torno a 15-16 GB en fp16/bf16 para los pesos, mas 1-3 GB de cache KV segun longitud de contexto y tamano de lote.
- Cuantizado en 8 bits: alrededor de 8 GB, por lo que cabe en una RTX 4090 (24 GB), RTX 4080 (16 GB) o similar con margen.
- Cuantizado en 4 bits (por ejemplo, NF4 o Q4_K_M): en torno a 4,5-5,5 GB, lo que permite ejecutarlo en GPUs consumer de gama media (RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB) e incluso en Apple Silicon con memoria unificada suficiente.
- GPUs de centro de datos recomendadas para servicio concurrente: A100 40/80 GB, H100 80 GB, L40S 48 GB; con ellas es viable servir varias replicas o contextos largos sin cuantizar.
- El adaptador se puede cargar con `transformers` + `peft`, con vLLM (soporte de LoRA en runtime) o con TGI. Para llama.cpp u Ollama es necesario fusionar el adaptador con el modelo base y convertir el resultado a GGUF.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

La comparativa se establece frente a alternativas de la misma categoria (modelos densos de 7-8B orientados a instrucciones y razonamiento). Los datos estructurales son los publicos de cada modelo; el rendimiento del adaptador no esta evaluado.

| Modelo | Parametros | Contexto | Licencia | Tipo de artefacto | Notas |
|---|---|---|---|---|---|
| Adaptador de nmuendler sobre DeepSeek-R1-Distill-Qwen-7B | 7.000 M (base) + LoRA no especificado | no disponible en el repositorio (base: 131.072) | no disponible | Adaptador PEFT (0,3 GB) | Sin evaluacion ni documentacion |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B | 7.000 M | 131.072 tokens | MIT | Pesos completos | Modelo base; benchmarks publicados en la tabla anterior |
| Qwen2.5-7B-Instruct | 7.600 M | 131.072 tokens | Apache 2.0 | Pesos completos | Alternativa generalista sin modo de razonamiento explicito |
| Llama-3.1-8B-Instruct | 8.030 M | 131.072 tokens | Licencia comunitaria de Llama 3.1 | Pesos completos | Alternativa generalista con condiciones de uso adicionales |
| Mistral-7B-Instruct-v0.3 | 7.250 M | 32.768 tokens | Apache 2.0 | Pesos completos | Contexto notablemente menor |

## Limitaciones y advertencias

- Licencia ausente: el repositorio no declara licencia, por lo que no hay autorizacion explicita de uso comercial. Aunque el modelo base se distribuye bajo licencia MIT, el adaptador es una obra derivada sin terminos definidos; en la practica, esto desaconseja su uso en produccion.
- Model card vacia: no hay informacion sobre datos de entrenamiento, hiperparametros efectivos, composicion del dataset ni criterios de seleccion del checkpoint. No se puede auditar el origen de los datos ni descartar contaminacion de benchmarks.
- Ausencia total de evaluacion: no existe ninguna medida publicada de calidad, por lo que no hay evidencia de que el adaptador mejore al modelo base; un SFT agresivo (3 epocas, lr 2e-4) puede degradar capacidades generales por olvido catastrofico.
- Riesgo de alucinacion: inherente a los modelos de 7B y acentuado por la generacion de cadenas de razonamiento largas, que pueden contener pasos plausibles pero incorrectos.
- Posible perdida del formato de razonamiento: al tratarse de un `text-sft`, es plausible que el entrenamiento haya modificado la plantilla de chat o la estructura de los bloques de pensamiento del modelo base, pero no se especifica.
- Idiomas no declarados: no se puede garantizar el rendimiento en castellano ni en idiomas distintos del que se uso en el ajuste.
- Contexto no verificado: aunque el modelo base soporta 131.072 tokens, no hay confirmacion de que el adaptador se haya entrenado con secuencias largas; el rendimiento mas alla de la longitud vista en entrenamiento puede degradarse.
- Repositorio sin traccion: 0 descargas y 0 likes, sin issues ni discusion, lo que implica ausencia de validacion por parte de la comunidad.
- Fechas de creacion y actualizacion separadas por segundos: el repositorio se subio en una unica operacion y no ha recibido mantenimiento posterior.
- Uso responsable: cualquier despliegue deberia acompanarse de validacion propia, filtros de salida y supervision humana, especialmente en dominios sensibles.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/nmuendler/DeepSeek-R1-Distill-Qwen-7B-text-sft-run2-eb32-e3-lr2e-04
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Repositorio GitHub de DeepSeek-R1 (pesos, recetas de destilacion y guia de uso): https://github.com/deepseek-ai/DeepSeek-R1
- Articulo de DeepSeek-R1 en arXiv: https://arxiv.org/abs/2501.12948
- Libreria PEFT: https://github.com/huggingface/peft
- Referencia citada en los tags del repositorio (Lacoste et al., calculo de emisiones): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de aprendizaje automatico: https://mlco2.github.io/impact
- Busqueda web realizada: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron unicamente articulos sin relacion sobre el motor de busqueda Bing.
