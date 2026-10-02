# kaivoss/AliceAI-T5-35B-A0.6B-chat-v5

## Resumen

AliceAI-T5-35B-A0.6B-chat-v5 es un ajuste fino conversacional publicado por el usuario kaivoss sobre el modelo base yandex/AliceAI-T5-35B-A0.6B. Segun la model card, se trata de la fusion (*merge*) de la LoRA `kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v5` sobre los pesos del modelo base en bf16, por lo que hereda integramente la arquitectura del original y solo modifica el comportamiento conversacional y de uso de herramientas.

El modelo base, desarrollado por Yandex, es un transformer encoder-decoder de estilo T5 con arquitectura de mezcla de expertos (MoE) dispersa y entrenamiento basado en UL2. Cuenta con 34.354.449.408 parametros totales (34,35B) pero solo aproximadamente 0,6B parametros activos por token, lo que reduce drasticamente el coste computacional por inferencia manteniendo una gran capacidad de almacenamiento de conocimiento en los expertos. Yandex lo describe como la columna vertebral de produccion de las respuestas de Alice AI en su buscador.

La relevancia de esta ficha radica en que el ajuste fino no aporta apenas documentacion propia: la model card remite al repositorio de la LoRA para la receta de entrenamiento, la plantilla de chat y la evaluacion, y no publica licencia, idiomas ni resultados de benchmarks. El interes tecnico esta, por tanto, en el modelo base (una de las pocas apuestas recientes por MoE encoder-decoder) y en el efecto del ajuste conversacional sobre el mismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder estilo T5 con mezcla de expertos (MoE) dispersa, entrenamiento UL2 |
| Parametros totales | 34.354.449.408 (34,35B) |
| Parametros activos | ~0,6B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye en bf16/safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16) |
| Tamano del repositorio | 68,7 GB |
| Modelo base | yandex/AliceAI-T5-35B-A0.6B |
| Libreria | transformers (con `custom_code`) |

## Arquitectura y entrenamiento

El modelo sigue un diseno encoder-decoder de tipo T5 con capas de mezcla de expertos dispersa. La terminologia del identificador (`-A0.6B`) indica el numero de parametros activos por token, mientras que el prefijo `35B` corresponde al total. Esta configuracion implica que, aunque el modelo almacena 34,35B parametros (lo que se traduce en 68,7 GB en bf16), el calculo efectivo por token en cada paso de forward solo involucra en torno a 0,6B parametros, seleccionados dinamicamente por el router de la MoE. El entrenamiento declarado por Yandex se basa en el marco UL2, un objetivo de preentrenamiento unificado que mezcla distintos modos de denoising (span corruption, prefix-LM y otros), tipico de los modelos encoder-decoder orientados a tareas text-to-text.

En cuanto al ajuste fino `chat-v5`, la informacion disponible indica que se trata de una LoRA (v5) fusionada sobre el modelo base en bf16, dando lugar a un modelo *merged*. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO; todos estos detalles se remiten al repositorio de la LoRA. No se documenta ninguna innovacion adicional de decodificacion especulativa, atencion lineal ni variantes del router en la informacion proporcionada.

## Capacidades

- Generacion de texto y tareas text-to-text propias del paradigma encoder-decoder (el pipeline declarado es `text2text-generation`).
- Ajuste orientado a conversacion, segun el sufijo `chat` y la etiqueta `tool-use`.
- Soporte de uso de herramientas (*tool use* / function calling) declarado en las etiquetas del modelo.
- Capacidad multilingue: no disponible en la informacion proporcionada.
- Capacidad de razonamiento, codigo o matematicas: no disponible / no documentada especificamente.
- Vision o audio: no disponible.
- Modo de pensamiento explicito (*thinking mode*): no disponible.

## Casos de uso

- Asistentes conversacionales multi-turno: el ajuste `chat` sobre una base text-to-text permite mantener dialogos, aunque no se especifica la longitud de contexto soportada, por lo que el despliegue practico requeriria validar los limites reales del modelo base.
- Integracion en buscadores y sistemas de respuesta: dado que el modelo base es la columna vertebral de las respuestas de Alice AI en el buscador de Yandex, es un candidato natural para tareas de respuesta generativa sobre resultados de busqueda.
- Pipelines de agente con uso de herramientas: la etiqueta `tool-use` sugiere soporte para invocar funciones externas, lo que permitiria encadenar llamadas a APIs dentro de un flujo de razonamiento multi-paso (a validar con pruebas propias, ya que no hay documentacion publica).
- Resumen y reescritura de documentos: el paradigma encoder-decoder es especialmente adecuado para tareas de transformacion texto-a-texto como resumen, traduccion o parafraseo.
- Servicio de inferencia de alto rendimiento con bajo coste por token: gracias a los ~0,6B parametros activos, el coste de computo por token es reducido, lo que lo hace atractivo para despliegues con alto trafico siempre que la memoria disponible permita alojar los 34,35B parametros.
- Experimentacion e investigacion en MoE encoder-decoder: al ser uno de los pocos MoE encoder-decoder recientes, resulta util como base para estudiar enrutado de expertos, eficiencia y ajuste fino sobre arquitecturas no decoder-only.
- Destilacion o generacion de datos sinteticos: puede emplearse como generador de pares texto-texto para construir datasets, aunque la ausencia de datos de evaluacion obliga a medir la calidad con conjuntos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del ajuste fino ni los resultados de busqueda proporcionan cifras de MMLU, HumanEval, GSM8K, ni de ninguna otra evaluacion estandar, ni para el modelo base ni para la version `chat-v5`.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 69 GB solo para los pesos, mas el *overhead* de activaciones y cache, por lo que se necesitan al menos dos GPU de 48 GB o una configuracion multi-GPU equivalente.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 34-40 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 17-25 GB, dependiendo de la implementacion (los tipos de cuantizacion soportados no estan documentados).
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 o configuraciones multi-GPU con A6000 48 GB. El uso en una unica GPU de 24 GB (RTX 4090, 3090) no es viable sin cuantizacion agresiva y no esta confirmado por el autor.
- Despliegue: al usar `transformers` con `custom_code`, es necesario confiar en el codigo remoto del repositorio (`trust_remote_code=True`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; dado que la arquitectura MoE encoder-decoder es poco comun, la compatibilidad con estos motores debe verificarse caso por caso.
- Latencia y throughput: no disponibles. El bajo numero de parametros activos (~0,6B) sugiere un coste de computo por token bajo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Arquitectura | Contexto | Licencia |
|---|---|---|---|---|---|
| kaivoss/AliceAI-T5-35B-A0.6B-chat-v5 | 34,35B | ~0,6B | MoE encoder-decoder (UL2) | no disponible | no disponible |
| yandex/AliceAI-T5-35B-A0.6B | 34,35B | ~0,6B | MoE encoder-decoder (UL2) | no disponible | no disponible |
| yandex/AliceAI-T5-35B-A0.6B-chat-lora-v5 | no disponible | ~0,6B | adapter LoRA sobre el base | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria. La mayoria de laboratorios de pesos abiertos optan por transformers solo-decoder, por lo que los MoE encoder-decoder comparables son escasos y no se han identificado en la informacion proporcionada.

## Limitaciones y advertencias

- No se publica licencia, lo que impide determinar si el uso comercial esta permitido; debe consultarse al autor antes de cualquier despliegue en produccion.
- No hay idiomas declarados ni evaluacion multilingue, por lo que no se puede asumir un comportamiento correcto fuera del idioma o idiomas del entrenamiento original.
- Ausencia total de benchmarks: no hay evidencia publica de calidad, tasas de alucinacion ni robustez.
- Riesgo de alucinacion inherente a los modelos generativos; al no haber evaluacion, este riesgo no esta cuantificado.
- El repositorio presenta 0 descargas y 0 *likes* en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar codigo del repositorio; conviene auditar ese codigo antes de usarlo.
- La longitud de contexto no esta documentada, lo que limita la planificacion de despliegues con conversaciones largas.
- El ajuste es un *merge* de LoRA: la calidad conversacional depende enteramente de la receta documentada solo en el repositorio de la LoRA, no en el modelo final.
- La fecha de creacion registrada (2026-10-01) es posterior a la fecha de esta ficha en algunos entornos, lo que puede deberse a metadatos inconsistentes del repositorio.

## Enlaces

- Modelo ajustado: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-v5
- LoRA de origen (receta, plantilla de chat y evaluacion): https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v5
- Modelo base de Yandex: https://huggingface.co/yandex/AliceAI-T5-35B-A0.6B
- Ajustes finos derivados del base: https://huggingface.co/models?other=base_model:finetune:yandex/AliceAI-T5-35B-A0.6B
- Resumen del modelo base: https://www.aimodels.fyi/models/huggingFace/aliceai-t5-35b-a0.6b-yandex
- Noticia sobre el lanzamiento de Yandex: https://www.aimodeling.com/en/news/slug/yandex-aliceai-t5-sparse-moe
