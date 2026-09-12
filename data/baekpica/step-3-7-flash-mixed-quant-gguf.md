# Baekpica/Step-3.7-Flash-Mixed-Quant-GGUF

## Resumen

Step-3.7-Flash-Mixed-Quant-GGUF es una cuantizacion asimetrica de terceros (autor Baekpica) del backbone de lenguaje del modelo multimodal Step 3.7 Flash, desarrollado originalmente por StepFun. El artefacto principal ronda los 83 GB (77,3 GiB) y se distribuye en formato GGUF junto con sidecars externos oficiales: MTP en Q8_0 y vision en F16. No se elimina ninguna capa ni experto respecto al modelo original.

El modelo base declara 196.956.130.432 parametros (unos 197.000 millones) y una arquitectura de mezcla de expertos (MoE) con expertos enrutados y compartidos, segun se deduce del inventario de tensores del propio repositorio. Esta release esta pensada para dejar margen de memoria en plataformas como DGX Spark y no incluye todavia soporte nativo en `ds4-dfm-rs`; la validacion publicada se limita al pin de una rama CUDA de llama.cpp de StepFun y a fixtures de referencia en BF16.

Su relevancia actual es la de servir como empaquetado reproducible de pesos y contrato de tensores para integrar un modelo multimodal de gran tamano en herramientas GGUF, aunque el propio autor advierte que la comparacion de salida MQ83, el decodificado especulativo mediante MTP y la admision de memoria en GB10 siguen sin verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE: router, expertos enrutados y expertos compartidos), segun el inventario de tensores |
| Parametros totales | 196.956.130.432 (aproximadamente 197.000 millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MQ83 mixta: Q8_0 (embedding, LM head, atencion Q/K/V/O y gate de atencion, FFN densa capas 0-2, expertos compartidos capas 3-44), Q4_K (routed gate/up/down capas 3-6 y 41-44; routed down capas 7-40), IQ2_XXS (routed gate/up capas 7-40), F32 (router, normas, sesgos y controles pequenos); MTP externo en Q8_0; vision externa en F16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (9 shards para el modelo principal MQ83, mas archivos MTP y vision) |

## Arquitectura y entrenamiento

El modelo base presenta una topologia de mezcla de expertos distribuida en 45 capas (numeradas de 0 a 44). Las tres primeras capas (0-2) contienen FFN densa; a partir de la capa 3 conviven expertos compartidos (gate/up/down) y expertos enrutados, gobernados por un router con controles en F32. La cuantizacion documenta 754 tensores en el modelo principal y 83.001.512.448 bytes de payload. El repo incluye ademas un MTP (multi-token prediction) oficial en Q8_0 y el sidecar de vision oficial en F16, ambos copiados byte a byte con sus digests SHA-256 publicados.

Esta ficha no dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en el modelo original. Lo que si documenta el autor de la cuantizacion es el proceso de calibracion: la imatrix oficial cubre 528 grupos de tensores coincidentes, incluidos los 126 grupos enrutados gate/up/down, y registra 9.969.664 posiciones de texto. Se anade un suplemento en GPU con 75.184 posiciones procedentes de 96 imagenes reales de DocVQA/ChartQA y 32 ejemplos de texto y codigo retokenizados para Step. La combinacion repondera el 70% de la masa nominal a la pasada oficial y el 30% al suplemento.

Como innovacion tecnica destacable dentro del empaquetado, los pesos de bajo bit se cuantizan directamente desde el GGUF BF16 oficial (no desde otra release de bajo bit) y se incluye una correccion del tokenizer: la rama fijada omitia el caracter ASCII `~` de su categoria de simbolos, y la correccion incluida coincide con los IDs del tokenizer original en los 44 casos de regresion. El MTP se entrega para integracion, pero el decodificado especulativo y el rollback no estan verificados.

## Capacidades

- Generacion de texto conversacional (tag `conversational`).
- Procesamiento multimodal de imagen y texto (`image-text-to-text`), con sidecar de vision F16 oficial.
- Mezcla de expertos con enrutado por capa, lo que permite activar subconjuntos de parametros por token.
- Soporte previsto de decodificado especulativo mediante el MTP incluido (Q8_0), aunque sin verificar en esta release.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- Capacidades de razonamiento, codigo, matematicas o tool calling: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles en la informacion proporcionada.

## Casos de uso

- Integracion en llama.cpp con rama CUDA de StepFun: el paquete GGUF esta disenado para cargarse en la rama fijada del repositorio de StepFun, con la correccion de tokenizer incluida, lo que facilita desplegar el modelo sin partir del BF16 completo.
- Despliegue en plataformas de memoria unificada grandes: el objetivo declarado de dejar el artefacto principal en unos 83 GB apunta a ejecuciones en DGX Spark o equipos con alrededor de 128 GB de memoria unificada.
- Investigacion y auditoria de cuantizacion: el repositorio publica recetas de tensores, sumas SHA-256, comparaciones de dequantizacion de 1464 filas y diagnosticos por grupo, utiles para estudiar el impacto de cuantizaciones mixtas en modelos MoE grandes.
- Evaluacion multimodal con documentos y graficos: el suplemento de calibracion usa DocVQA y ChartQA, lo que sugiere escenarios de pregunta-respuesta sobre documentos e imagenes de graficos, una vez validada la ruta de vision.
- Experimentacion con decodificado especulativo: el MTP externo en Q8_0 se entrega para integrar speculative decoding en el runtime, un caso de uso orientado a reducir latencia de generacion.
- Reproduccion de calibraciones con imatrix: el manifiesto y los ficheros de calibracion publicos permiten reproducir y auditar el proceso de reponderacion 70/30 entre pasada oficial y suplemento.
- Base para adaptaciones o fine-tuning en formato GGUF: al no eliminarse capas ni expertos, la release sirve como punto de partida para pipelines que operen sobre el grafo completo del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la comparacion de salida MQ83 esta pendiente y que esta release no reclama ningun resultado de generacion ni de fidelidad, y que no se establece throughput en GB10, capacidad de contexto largo ni funcionamiento de MTP.

## Requisitos de hardware

- Peso de los archivos: modelo principal MQ83 (9 shards) 83.006.792.576 bytes (83,01 GB / 77,31 GiB); MTP oficial Q8_0 3.707.276.416 bytes (3,71 GB / 3,45 GiB); vision oficial F16 3.972.828.768 bytes (3,97 GB / 3,70 GiB); total de archivos de pesos 90.686.897.760 bytes (90,69 GB / 84,46 GiB), sin contar imatrix opcional, cache KV ni espacios de trabajo.
- VRAM estimada: no disponible de forma oficial. Como minimo hay que sumar a los 90,69 GB de pesos la cache KV y los workspaces; una estimacion prudente situa el requisito por encima de los 96-100 GB en funcion del contexto.
- GPU recomendadas: se citan cinco H100 NVL para los fixtures de referencia en BF16; el objetivo declarado es DGX Spark (GB10) con memoria unificada. Otras opciones coherentes por memoria serian H200 (141 GB) o configuraciones multi-GPU.
- GPU de consumo: no cabe en GPU de consumo. Con 24 GB (RTX 4090) o 48 GB no es viable cargar los 83 GB del modelo principal mas sidecars.
- Opciones de despliegue: llama.cpp en la rama CUDA de StepFun fijada (commit 8f34864def3d351316aaea5ce9b4a06e12198d3c); soporte nativo en `ds4-dfm-rs` pendiente. Compatibilidad con Ollama, vLLM o TGI: no disponible.
- Latencia y throughput: no disponibles. No se ha establecido rendimiento en GB10, y la comparacion de ejecucion MQ83 sigue pendiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Baekpica/Step-3.7-Flash-Mixed-Quant-GGUF (esta release) | 196.956.130.432 aprox. 197B | no disponible | GGUF (MQ83 + MTP Q8_0 + vision F16) | apache-2.0 | Repositorio publico, 0 descargas y 0 likes en el momento de la consulta |
| stepfun-ai/Step-3.7-Flash (base) | 196.956.130.432 aprox. 197B segun el modelo cuantizado | no disponible | safetensors (BF16 de referencia) | apache-2.0 | Modelo original de StepFun |
| stepfun-ai/Step-3.7-Flash-GGUF (oficial) | mismo modelo base | no disponible | GGUF (BF16, imatrix y sidecars oficiales) | apache-2.0 | Release oficial usada como fuente de esta cuantizacion |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Release de terceros: no la publica StepFun, sino el usuario Baekpica; la responsabilidad sobre la cuantizacion recae en ese autor.
- Fidelidad no verificada: no hay resultados de generacion ni de fidelidad para MQ83; la comparacion de salida esta pendiente.
- Rendimiento no establecido: no se ha confirmado throughput en GB10, ni capacidad de contexto largo, ni funcionamiento del MTP.
- Decodificado especulativo sin verificar: el MTP se entrega para integracion, pero el speculative decoding y el rollback no estan probados.
- Soporte nativo pendiente: `ds4-dfm-rs` no ejecuta aun este modelo; solo se incluye un parche de preflight de metadatos y tensores en un handoff privado.
- Correccion de tokenizer: la rama fijada omitia el caracter ASCII `~`; la calibracion suplementaria se recogio antes de la correccion y sus estadisticas no se reetiquetan como ejecutadas con el tokenizer corregido.
- Cobertura de calibracion desigual: el colector omite lotes de matmul directo por debajo de 16 posiciones (74.063 posiciones densas recogidas) y el ultimo bloque FFN solo observa posiciones de salida solicitadas; la masa efectiva por grupo varia respecto al escalado nominal 70/30.
- Solapamiento no auditable: no puede auditarse a nivel de documento el solapamiento con la calibracion de texto oficial.
- Riesgo de alucinacion y sesgos: no disponibles especificamente para esta release; aplican los del modelo base, no documentados aqui.
- Idiomas: no se declara lista de idiomas soportados.
- Licencia: apache-2.0, lo que en principio permite uso comercial, pero conviene verificar las condiciones del modelo base y de los sidecars oficiales.
- Adopcion nula: 0 descargas y 0 likes, sin senales de validacion externa por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Baekpica/Step-3.7-Flash-Mixed-Quant-GGUF
- Modelo original (StepFun): https://huggingface.co/stepfun-ai/Step-3.7-Flash/tree/5f6244077ac62e04eec3f320501ff8c2b293373a
- GGUF BF16 oficial, imatrix y sidecars: https://huggingface.co/stepfun-ai/Step-3.7-Flash-GGUF/tree/0b69336d2fd2adfdef9c66e425f7778196c31482
- Rama de referencia/cuantizador (llama.cpp de StepFun): https://github.com/stepfun-ai/llama.cpp/tree/8f34864def3d351316aaea5ce9b4a06e12198d3c
- Material de calibracion multimodal previo: https://huggingface.co/datasets/Baekpica/Inkling-Small-Multimodal-Calibration
