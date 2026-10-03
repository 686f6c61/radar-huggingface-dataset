# IndexTeam/Index-Translate-35B-A3B-preview-FP8

## Resumen

Index-Translate-35B-A3B-preview-FP8 es la cuantización oficial en FP8 (W8A8) del modelo de traducción multilingüe Index-Translate-35B-A3B-preview, desarrollado por el equipo Index (vinculado al repositorio github.com/bilibili/Index-Translate). Forma parte de la familia Index-Translate, orientada a traducción en 150 idiomas con soporte para traducción restringida por terminología y formato, traducción controlada para doblaje y traducción de documentos largos. El problema que resuelve es doble: por un lado, la traducción de alta calidad con restricciones explícitas (glosarios, formato de salida); por otro, la reducción del coste de despliegue mediante cuantización de precisión reducida.

Arquitectónicamente se trata de un transformer con mezcla de expertos (MoE), según la etiqueta `qwen3_5_moe` de HuggingFace y la nomenclatura del identificador: 35B parámetros totales con aproximadamente 3B parámetros activos por token. Esto implica un coste de cómputo por token comparable al de un modelo denso de ~3B, pero con la capacidad de representación de un modelo de 35B. El modelo es multimodal entrada (image-text-to-text), con una torre de visión y un proyector multimodal que en esta versión FP8 se mantienen en BF16.

La relevancia de esta ficha concreta es que se trata de una cuantización FP8_DYNAMIC validada contra el checkpoint original en BF16: la perplejidad en un corpus fijo pasa de 2,8140 a 2,8158 (+0,06%) y las generaciones zh→en y en→zh son idénticas con decodificación greedy. Es decir, se reduce el peso en memoria aproximadamente a la mitad sin degradación medible en las pruebas publicadas, lo que abarata el servicio en producción. El repositorio es muy reciente (creado el 2 de octubre de 2026) y no cuenta todavía con descargas ni validación de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), etiqueta `qwen3_5_moe`; multimodal (image-text-to-text) con torre de visión y proyector multimodal |
| Parametros totales | 35B (inferido de la nomenclatura 35B-A3B; no se declara explicitamente en la informacion proporcionada) |
| Parametros activos | ~3B (inferido de la nomenclatura A3B; no se declara explicitamente en la informacion proporcionada) |
| Longitud de contexto | no disponible (el ejemplo de servicio con vLLM usa `--max-model-len 4096`, pero es un preset de ejemplo, no una especificacion del limite del modelo) |
| Tipos de cuantizacion | FP8 W8A8 (`FP8_DYNAMIC`: pesos FP8 E4M3, activaciones FP8 dinamicas por token); el checkpoint original esta en BF16; existen builds GGUF del modelo base en un repositorio hermano |
| Idiomas soportados | 150 idiomas segun la model card (el campo de idiomas de la ficha de HuggingFace figura como no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con metadatos `compressed-tensors` (cargable directamente en vLLM con `quantization="compressed-tensors"` o en transformers); GGUF disponible para el modelo base |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos, coherente con la etiqueta `qwen3_5_moe` del repositorio. La designación 35B-A3B indica 35.000 millones de parametros totales y aproximadamente 3.000 millones activos por token, lo que situa el coste de inferencia en el rango de un modelo denso de 3B mientras la capacidad de representacion corresponde a un modelo mucho mayor. El modelo incorpora pesos de prediccion multi-token (MTP, multi-token prediction), que se preservan intactos en esta cuantizacion FP8; esto habilita tecnicas de decodificacion especulativa en motores compatibles. Ademas, al tratarse de un modelo image-text-to-text, incluye una torre de vision y un proyector multimodal hacia el espacio del modelo de lenguaje.

El proceso de cuantizacion se realizo con llm-compressor bajo el esquema `FP8_DYNAMIC`. Se cuantizan todas las capas `Linear` del modelo de lenguaje, mientras que la torre de vision, el proyector multimodal, `lm_head` y las capas de embeddings se mantienen en BF16. El motivo de dejar el `lm_head` y los embeddings en BF16 es evitar degradacion en la proyeccion final al vocabulario, que suele ser el punto mas sensible a la cuantizacion. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO; el informe tecnico asociado es arXiv:2609.40181. La validacion publicada se limita a comparar perplejidad y salidas de generacion entre BF16 y FP8 sobre una NVIDIA A100.

## Capacidades

- Traduccion automatica multilingue en 150 idiomas segun la model card de la familia Index-Translate.
- Traduccion restringida por terminologia y formato (formato instTrans), pensada para forzar glosarios y estructuras de salida determinadas.
- Traduccion controlada para doblaje, es decir, con restricciones de longitud o sincronia propias de la localizacion audiovisual.
- Traduccion de documentos largos.
- Entrada multimodal de imagen y texto (image-text-to-text), con torre de vision dedicada.
- Prediccion multi-token (MTP) preservada en la cuantizacion, util para decodificacion especulativa.
- Decodificacion greedy reproducible: la model card confirma generaciones identicas entre BF16 y FP8 en zh→en y en→zh con prompt oficial y decodificacion greedy.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el modelo puede servirse a traves de la infraestructura de Inference Endpoints de HuggingFace.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidad de modo pensamiento (thinking mode), audio o voz: no disponible en la informacion proporcionada.

## Casos de uso

- Traduccion de documentacion tecnica con glosario cerrado: el formato instTrans permite fijar terminologia obligatoria, de modo que terminos como nombres de API o conceptos de producto se traduzcan siempre igual, algo critico en documentacion de software mantenida a lo largo del tiempo.
- Localizacion audiovisual y doblaje: la familia incluye traduccion controlada para doblaje, lo que permite traducir guiones respetando restricciones de metraje o sincronia, un caso donde la traduccion literal no es suficiente.
- Traduccion de contratos y textos juridicos con terminologia controlada: el modelo puede recibir un glosario legal y producir una salida con formato fijo, reduciendo la variabilidad terminologica entre documentos de un mismo expediente.
- Atencion al cliente multilingue: con 150 idiomas declarados, se puede desplegar un unico modelo para traducir tickets y conversaciones entre el idioma del usuario y el del agente, en lugar de mantener un modelo por par de idiomas.
- Traduccion de documentos largos en procesos de descubrimiento de pruebas o auditoria: la familia declara soporte especifico para documentos largos, lo que encaja en flujos donde hay que procesar expedientes completos y no frases sueltas.
- Localizacion de catalogos de comercio electronico a gran escala: la combinacion de vocabulario controlado y formato de salida fijo permite generar fichas de producto en decenas de idiomas con estructura de campos consistente, lista para ingesta automatica.
- Servicio de traduccion de alto volumen con coste contenido: gracias a la cuantizacion FP8 y a los ~3B parametros activos por token, el coste por token es bajo en relacion con la capacidad de un modelo de 35B totales, lo que hace viable servir traduccion a gran escala en una sola GPU de 80 GB.
- Pipelines internos de subtitulado: entrada de texto (o imagen-texto) y salida de traduccion directa con decodificacion greedy reproducible, lo que facilita la verificacion automatizada de resultados entre ejecuciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BLEU, COMET, etc.) en la informacion disponible. El unico dato cuantitativo publicado es la validacion de consistencia de la cuantizacion, medida en una NVIDIA A100 contra el checkpoint original en BF16, con decodificacion greedy y el prompt oficial de traduccion:

| Metrica | BF16 | FP8 | Delta |
|:---|-----:|----:|------:|
| Perplejidad (corpus fijo) | 2,8140 | 2,8158 | +0,06% |
| Generacion zh→en identica | — | — | si |
| Generacion en→zh identica | — | — | si |

Estos datos indican que la cuantizacion FP8 no introduce degradacion medible en la metrica de perplejidad ni en las generaciones evaluadas, pero no aportan informacion sobre calidad de traduccion frente a otros modelos. No se dispone de comparaciones con modelos similares en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP8 ocupan aproximadamente 35 GB (35.000 millones de parametros a 1 byte por parametro). Hay que anadir los componentes mantenidos en BF16 (embeddings, `lm_head`, torre de vision y proyector multimodal), cuyo tamano exacto no se especifica, mas la cache KV. En la practica esto situa el minimo en torno a 40-48 GB de VRAM, aunque es una estimacion derivada del recuento de parametros, no un dato publicado.
- GPU recomendadas: una A100 de 80 GB o una H100 de 80 GB cubren el modelo con margen para cache KV. La validacion de consistencia se realizo precisamente en una A100.
- GPU de gama profesional: tarjetas con 48 GB (por ejemplo RTX 6000 Ada o L40S) podrian alojar el modelo para contextos cortos, pero no se dispone de datos publicados que lo confirmen.
- Cabe en GPU de consumo: no para esta version FP8, ya que 24 GB de VRAM en una RTX 4090 no son suficientes para los pesos en FP8 mas cache KV. Para inferencia local en GPU de consumo hay que recurrir a los builds GGUF publicados en el repositorio hermano `Index-Translate-35B-A3B-preview-GGUF`, que permiten cuantizaciones de menor precision.
- Opciones de despliegue: vLLM con `quantization="compressed-tensors"` (ruta recomendada por el autor), transformers, e infraestructura de Inference Endpoints de HuggingFace (etiqueta `endpoints_compatible`). Para GGUF, llama.cpp u Ollama sobre el repositorio del modelo base.
- Ejemplo de servicio publicado por el autor: `vllm serve IndexTeam/Index-Translate-35B-A3B-preview-FP8 --host 127.0.0.1 --port 8000 --max-model-len 4096`.
- Latencia y throughput estimados: no disponibles. Como referencia cualitativa, al activar solo ~3B parametros por token el coste de computo por token es bajo en relacion con los 35B totales, pero no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para este modelo que permitan una comparacion rigurosa con alternativas externas. La unica comparacion documentada es interna a la propia familia:

| Modelo | Parametros | Precision | Contexto | Perplejidad (corpus fijo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Index-Translate-35B-A3B-preview-FP8 | 35B totales / ~3B activos | FP8 E4M3 (W8A8) | no disponible | 2,8158 | Apache 2.0 | HuggingFace, vLLM, transformers |
| Index-Translate-35B-A3B-preview | 35B totales / ~3B activos | BF16 | no disponible | 2,8140 | Apache 2.0 | HuggingFace (checkpoint original) |
| Index-Translate-35B-A3B-preview-GGUF | 35B totales / ~3B activos | GGUF (varias cuantizaciones) | no disponible | no disponible | Apache 2.0 | HuggingFace, llama.cpp/Ollama |
| Otros modelos de traduccion de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre modelos comparables; los resultados obtenidos correspondian a personas y despachos sin relacion con el proyecto.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks de calidad de traduccion (BLEU, COMET, chrF u otros) en la informacion disponible; la unica metrica publicada es la perplejidad en un corpus fijo, que no mide calidad de traduccion.
- La model card no especifica la composicion del dataset de entrenamiento ni el numero de tokens, por lo que no es posible evaluar sesgos derivados del corpus.
- Riesgo de alucinacion: inherente a cualquier modelo generativo. En traduccion, el modo de fallo tipico es la invencion de contenido o la omision de fragmentos en entradas largas, especialmente con restricciones de formato estrictas.
- El formato de prompt publicado por el autor esta en chino, lo que implica una dependencia del idioma de instruccion. Si el prompt se reformula en otro idioma, el comportamiento puede degradarse.
- La cuantizacion FP8 cubre todas las capas `Linear` del modelo de lenguaje; los efectos sobre tareas distintas de la traduccion (por ejemplo, seguimiento de instrucciones generales o razonamiento) no se han validado en la informacion publicada, ya que la validacion se hizo unicamente con el prompt oficial de traduccion y decodificacion greedy.
- El repositorio es muy reciente (creado el 2 de octubre de 2026) y presenta 0 descargas y 0 likes, es decir, carece por completo de validacion independiente de la comunidad.
- Licencia Apache 2.0: permisiva, permite uso comercial y modificaciones, siempre que se conserve el aviso de licencia y se indique los cambios realizados. No se han declarado restricciones adicionales de uso aceptable en la informacion disponible.
- El campo de idiomas de la ficha de HuggingFace no esta cumplimentado; el dato de 150 idiomas proviene de la model card y no se acompana de un desglose por par de idiomas ni de metricas por idioma.
- La longitud de contexto no esta declarada. El valor de 4096 tokens que aparece en el ejemplo de servicio es un preset de vLLM y no debe interpretarse como el limite del modelo; para documentos largos habra que determinar empiricamente el limite real y el comportamiento en el extremo de la ventana.
- La decodificacion recomendada es greedy con temperatura 0; usar muestreo puede romper la reproducibilidad verificada entre BF16 y FP8.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/IndexTeam/Index-Translate-35B-A3B-preview-FP8
- Modelo base en BF16: https://huggingface.co/IndexTeam/Index-Translate-35B-A3B-preview
- Builds GGUF del modelo base: https://huggingface.co/IndexTeam/Index-Translate-35B-A3B-preview-GGUF
- Informe tecnico (arXiv:2609.40181): https://arxiv.org/abs/2609.40181
- Codigo: https://github.com/bilibili/Index-Translate
- Herramienta de cuantizacion llm-compressor: https://github.com/vllm-project/llm-compressor
- Formato compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su equipo o su informe tecnico. No se han localizado demos, blogs ni articulos adicionales.
