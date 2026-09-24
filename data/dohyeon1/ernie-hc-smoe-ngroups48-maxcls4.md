# Dohyeon1/ERNIE-HC-SMoE-ngroups48-maxcls4

# Ficha de modelo: Dohyeon1/ERNIE-HC-SMoE-ngroups48-maxcls4

## Resumen

ERNIE-HC-SMoE-ngroups48-maxcls4 es un checkpoint de generación de texto publicado en Hugging Face por el usuario Dohyeon1 (Dohyeon Kim) y construido sobre la arquitectura ERNIE 4.5 en su variante MoE, según indica la etiqueta de librería `ernie4_5_moe` asociada al repositorio. El modelo declara 21.825.437.888 parámetros (~21,8 mil millones) almacenados en formato safetensors, con un repositorio de 43,7 GB, lo que es coherente con pesos en precisión bf16/fp16 sin cuantizar.

Se trata de un modelo de la serie experimental "HC-SMoE" del mismo autor, en la que los sufijos del nombre (`ngroups48`, `maxcls4`) parecen corresponder a hiperparámetros de enrutamiento o agrupación de expertos, si bien esta interpretación no está confirmada en ninguna documentación oficial. Existen variantes hermanas con otros valores (`ngroups40`, `ngroups48` sin `maxcls4`), lo que apunta a un trabajo de ajuste sistemático sobre la configuración del mezclador de expertos más que a un modelo de producción cerrado.

La relevancia de este checkpoint es limitada y fundamentalmente exploratoria: no tiene licencia declarada, no tiene idiomas declarados, no incluye resultados de evaluación y cuenta con cero descargas y cero "likes". Cualquier uso en producción exigiría auditar previamente el repositorio, los pesos y el linaje de entrenamiento, dado que la model card es una plantilla automática de Hugging Face sin contenido sustantivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ERNIE 4.5 MoE (tag de libreria `ernie4_5_moe`); transformer con mezcla de expertos |
| Parametros totales | 21.825.437.888 (~21,8 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card; 32.768 tokens segun listados de terceros de modelos hermanos de la misma serie (sin confirmar para este checkpoint) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors; no se publican GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 43,7 GB |
| Pipeline declarado | text-generation |
| Etiquetas adicionales | conversational, endpoints_compatible, region:us |

## Arquitectura y entrenamiento

La arquitectura declarada es ERNIE 4.5 MoE, la familia de modelos de mezcla de expertos de Baidu, implementada en la libreria `transformers` bajo la clase correspondiente a `ernie4_5_moe`. Un modelo MoE sustituye las capas feed-forward densas por un conjunto de expertos y un enrutador que activa solo un subconjunto por token, de modo que el coste de inferencia depende de los parametros activos y no del total. En este checkpoint el total asciende a ~21,8 mil millones de parametros, pero no se ha publicado el numero de parametros activos ni el numero de expertos por capa, por lo que no es posible estimar el coste real por token.

No hay informacion sobre el entrenamiento: ni volumen de tokens, ni composicion del dataset, ni si hubo etapas de ajuste supervisado, RLHF o DPO. La model card del repositorio es la plantilla automatica de Hugging Face y todos los campos relevantes aparecen como "More Information Needed". El unico identificador de arXiv presente en las etiquetas es `arxiv:1910.09700`, que corresponde al articulo de Lacoste et al. (2019) sobre estimacion de emisiones de carbono citado en la propia plantilla, no a un paper de este modelo. Los sufijos `ngroups48` y `maxcls4` sugieren modificaciones en la configuracion del enrutamiento (numero de grupos de expertos y clases maximas), pero se trata de una inferencia a partir del nomenglaje, no de un dato documentado.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation` y la etiqueta `conversational` indica que esta preparado para formato de dialogo.
- Conversacion multi-turno: la etiqueta `conversational` sugiere plantilla de chat, aunque no se documenta el chat template ni los tokens especiales.
- Razonamiento y matematicas: no disponible, sin evaluaciones publicadas.
- Generacion de codigo: no disponible, sin evaluaciones publicadas.
- Tool calling / function calling: no disponible; ninguna etiqueta ni seccion de la model card lo confirma.
- Capacidades de agente y razonamiento multi-paso: no disponible, aunque la etiqueta `endpoints_compatible` indica que puede servirse en infraestructuras compatibles con la API de Hugging Face.
- Capacidades multilingues: no disponible; no se declara ninguna lista de idiomas.
- Vision o audio: no disponible; el pipeline es exclusivamente de texto.
- Modo de razonamiento explicito (thinking): no disponible.

## Casos de uso

- Evaluacion comparativa de configuraciones MoE en investigacion: el checkpoint forma parte de una serie con distintos valores de agrupacion de expertos (`ngroups40`, `ngroups48`), por lo que su uso natural es medir como afectan esos hiperparametros a la perplejidad y a la calidad de generacion en un mismo conjunto de validacion.
- Fine-tuning supervisado sobre dominio concreto: al ser un modelo de ~21,8 mil millones de parametros con pesos abiertos en safetensors, se puede ajustar con LoRA o QLoRA sobre corpus especializados (legal, medico, industrial) siempre que se resuelva antes la ambiguedad de licencia.
- Despliegue conversacional en infraestructura compatible con `endpoints_compatible`: la etiqueta indica que el modelo puede cargarse en endpoints gestionados estilo Hugging Face o en FriendliAI, util para prototipos de chatbot con poco trabajo de integracion.
- Generacion aumentada por recuperacion (RAG) en documentacion tecnica: un modelo de ~21,8B con ventana de 32.768 tokens (si se confirma) permite insertar varios documentos largos en el contexto y sintetizar respuestas citando fuentes.
- Servicio de inferencia autohospedado con vLLM o TGI: al publicarse solo en safetensors, el camino mas directo es levantar un servidor con soporte nativo de `ernie4_5_moe` y exponer una API compatible con OpenAI para aplicaciones internas.
- Generacion de resumenes y reescritura de textos largos: la combinacion de tamano moderado y contexto extendido es adecuada para tareas de condensacion de informes, actas o articulos por bloques.
- Experimentos de destilacion o poda sobre arquitecturas MoE: los pesos completos permiten extraer subconjuntos de expertos y estudiar el impacto en la calidad, un caso de uso puramente de investigacion.
- Base para pipelines de evaluacion de seguridad en castellano: se puede usar como sujeto de pruebas para medir sesgos y toxicidad, dado que no hay garantias de alineacion declaradas.

Ninguno de estos casos debe considerarse validado en produccion sin antes resolver la licencia y verificar el comportamiento real del modelo en el dominio objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye la seccion de evaluacion cumplimentada y las busquedas web no devuelven metricas (MMLU, HumanEval, GSM8K u otras) para esta variante concreta.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parametros (21.825.437.888) y no de mediciones publicadas por el autor:

- Pesos en bf16/fp16: aproximadamente 43,7 GB, en linea con el tamano del repositorio. Requiere GPU con 80 GB (A100 80GB, H100 80GB) o reparto en varias GPU.
- Pesos en int8: aproximadamente 22 GB, ajustado para una A100 40GB o un par de RTX 4090/A6000.
- Pesos en 4 bits (~4,5 bits por parametro): aproximadamente 12-13 GB, lo que permitiria ejecucion en una RTX 4090 (24 GB), RTX 3090 (24 GB) o L4 (24 GB) sumando la cache KV. No hay GGUF publicado, por lo que habria que convertirlo a mano con llama.cpp o cuantizar con bitsandbytes/AWQ/GPTQ.
- Modelo MoE: la VRAM necesaria viene determinada por los parametros totales (todos los expertos deben residir en memoria), no por los activos. No se puede asumir el consumo de un modelo denso de ~3B aunque los activos fuesen pocos.
- Consumer GPU: cabe en RTX 4090/3090 solo tras cuantizacion a 4 bits. En GPUs de 8-12 GB (RTX 3060, RTX 4070) no es viable sin offloading agresivo a CPU.
- Opciones de despliegue: `transformers` de forma nativa; vLLM y SGLang si la version instalada soporta `ernie4_5_moe`; TGI; FriendliAI como endpoint gestionado segun los resultados de busqueda. Ollama y llama.cpp exigen convertir previamente los pesos a GGUF.
- Latencia y throughput: no disponible. No hay datos de tokens por segundo publicados y no es posible estimarlos sin conocer los parametros activos y el numero de expertos.

## Comparativa con modelos similares

No hay datos suficientes para una comparativa rigurosa: este checkpoint no publica parametros activos, contexto, licencia ni resultados. La tabla siguiente recoge lo que se conoce y marca explicitamente lo que falta.

| Modelo | Parametros totales | Contexto | Licencia | Evaluaciones publicadas | Disponibilidad |
|---|---|---|---|---|---|
| Dohyeon1/ERNIE-HC-SMoE-ngroups48-maxcls4 | ~21,8 mil millones | no disponible (32.768 tokens en modelos hermanos, sin confirmar) | no disponible | no | safetensors en Hugging Face, 0 descargas |
| Dohyeon1/ERNIE-HC-SMoE-ngroups40 | ~21 mil millones | 32.768 tokens segun listado de terceros | no disponible | no | safetensors en Hugging Face |
| Familia base ERNIE 4.5 MoE (Baidu) | no disponible para esta comparativa | no disponible | no disponible | no disponible | pesos publicos de la familia base; los valores concretos deben verificarse en la fuente oficial |

Cualquier comparacion de rendimiento con alternativas de tamano similar (por ejemplo otros MoE abiertos de ~20B) queda pendiente de que el autor publique parametros activos y resultados de evaluacion.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara de uso comercial. En la practica, la ausencia de licencia equivale a "todos los derechos reservados" en muchas jurisdicciones, por lo que no debe desplegarse en produccion sin contactar con el autor.
- Model card vacia: toda la informacion sobre datos de entrenamiento, alineacion y evaluacion aparece como "More Information Needed". No hay garantia de que el modelo haya pasado por RLHF, DPO o filtros de seguridad.
- Riesgo de alucinacion: no disponible, pero al no existir evaluaciones ni documentacion de alineacion, debe asumirse un riesgo alto y verificar todas las salidas en dominios factuales.
- Sesgos: no disponible. No hay analisis de sesgos ni de composicion del corpus de entrenamiento.
- Idiomas: no disponible. No se puede afirmar soporte de castellano ni de ningun otro idioma; habria que validarlo empiricamente.
- Ambiguedad de la arquitectura: los sufijos del nombre (`ngroups48`, `maxcls4`) sugieren configuraciones de enrutamiento no estandar. Esto puede provocar que versiones genericas de vLLM, TGI o llama.cpp no carguen el modelo correctamente.
- Contexto no confirmado: la cifra de 32.768 tokens procede de listados de terceros sobre modelos hermanos, no de este repositorio. Debe verificarse en el `config.json` antes de disenar prompts largos.
- Parametros activos desconocidos: sin este dato no se puede planificar coste de inferencia ni dimensionar correctamente la infraestructura.
- Trazabilidad: el autor ha publicado decenas de checkpoints experimentales; conviene registrar el commit o revision exacta utilizada para garantizar reproducibilidad.
- Etiqueta arXiv enganosa: `arxiv:1910.09700` corresponde a un articulo sobre emisiones de carbono citado en la plantilla, no a un paper de este modelo. No debe citarse como referencia tecnica.
- Uso en produccion: no recomendado en su estado actual por falta de licencia, evaluaciones y documentacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dohyeon1/ERNIE-HC-SMoE-ngroups48-maxcls4
- Variante hermana ngroups48 en Hugging Face: https://huggingface.co/Dohyeon1/ERNIE-HC-SMoE-ngroups48
- Variante ngroups40 en Featherless AI: https://featherless.ai/models/Dohyeon1/ERNIE-HC-SMoE-ngroups40
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/Dohyeon1/ERNIE-HC-SMoE-ngroups48
- Perfil del autor en Hugging Face (modelos): https://huggingface.co/Dohyeon1
- Perfil del autor en Hugging Face (datasets): https://huggingface.co/Dohyeon1/datasets
- Articulo citado en la plantilla de la model card (Lacoste et al., 2019, estimacion de emisiones): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental referenciada en la model card: https://mlco2.github.io/impact
