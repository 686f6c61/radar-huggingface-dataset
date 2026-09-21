# Riyan200324200324/DeepSeek-V4.1-Flash-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-UNCENSORED-FP8 es un checkpoint derivado del modelo deepseek-ai/DeepSeek-V4.1-Flash, publicado por el usuario Riyan200324200324 (asociado a las cuentas @dealignai y @jordanschenck segun la propia model card). Se trata de una version "abliterated" o "crack": los pesos se han modificado quirurgicamente a nivel de tensor para eliminar el circuito de rechazo, manteniendo intactos el resto de componentes (expertos enrutados, atencion dispersa, cabeza especulativa, torre de vision, embeddings y normas). El resultado es un checkpoint estandar que se carga igual que el modelo base, sin hooks de runtime ni vectores de direccion.

Arquitectonicamente es un transformer causal encoder-decoder de 20+20 capas con mezcla de expertos (MoE) de 384 expertos enrutados con top-6 mas un experto compartido, Hyper-Connections de residual de 4 canales, atencion dispersa CSA2, memoria n-gram Engram y una cabeza de borrador especulativo DSpark. Incorpora una torre de vision DeepSeek-ViT con 2D-RoPE y pixel unshuffle, por lo que el pipeline declarado es image-text-to-text. La model card indica una columna vertebral de 552B parametros con 8B/16B activos por token, mientras que el recuento real de safetensors del repositorio asciende a 763.205.315.794 parametros, una discrepancia que conviene tener en cuenta.

Su relevancia actual es doble. Por un lado, ofrece una ventana de contexto declarada de 1.000.000 de tokens con pesos FP8 nativos, algo poco habitual en modelos abiertos de esta escala. Por otro, es un artefacto de investigacion sobre alineacion: los autores publican una evaluacion completa en HarmBench-320 que muestra una tasa de exito de ataque (ASR) del 100 % en las siete categorias semanticas evaluadas, frente al 42,81 % del modelo base con effort=off y el 1,56 % con effort=max. Ese contraste, junto con la perdida de 4,22 puntos en MMLU-14k (1,1 puntos si se excluye el bloque de etica), lo convierte en material de estudio sobre que se degrada y que no al eliminar los guardrails.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal encoder-decoder (20+20 capas) con MoE (384 expertos enrutados top-6 + 1 compartido), Hyper-Connections (residual de 4 canales), atencion dispersa CSA2, memoria n-gram Engram, borrador especulativo DSpark y torre de vision DeepSeek-ViT (2D-RoPE + pixel unshuffle) |
| Parametros totales | 763.205.315.794 (~763,2 B) segun safetensors; la model card cita "552B backbone" |
| Parametros activos | 8B/16B por token segun la model card (desglose oficial no disponible) |
| Longitud de contexto | 1.000.000 tokens (segun la model card) |
| Tipos de cuantizacion | FP8 (e4m3fn) nativo con escalas de bloque E8M0 [32, 32] y expertos enrutados en FP4; sin cambios respecto al base |
| Idiomas soportados | no disponible |
| Licencia | MIT (declarada en el repositorio) |
| Formato de pesos | safetensors (libreria transformers, etiqueta 8-bit); tamano del repositorio 510,3 GB |

## Arquitectura y entrenamiento

El modelo hereda integramente la arquitectura del base DeepSeek-V4.1-Flash y solo interviene sobre los pesos. La model card describe un encoder-decoder causal de 20 capas de encoder y 20 de decoder, con una capa MoE de 384 expertos enrutados con enrutamiento top-6 mas un experto compartido, residuales Hyper-Connections de 4 canales, atencion dispersa CSA2 y una memoria n-gram denominada Engram. Se anade una cabeza de borrador especulativo (DSpark) para decodificacion especulativa y una torre de vision DeepSeek-ViT con 2D-RoPE y pixel unshuffle. La cuantizacion es nativa: pesos FP8 e4m3fn con escalas de bloque E8M0 de forma [32, 32] y expertos enrutados en FP4, sin re-cuantizar.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni sobre si hubo RLHF, DPO u otras fases de alineacion posteriores al preentrenamiento. La unica informacion tecnica sobre el proceso de derivacion es que la abliteracion es "a nivel de peso" y quirurgica: la model card afirma que los componentes criticos para la capacidad (expertos enrutados, memoria Engram, atencion dispersa CSA2, cabeza DSpark, torre de vision, puertas del router, normas y embeddings) se conservan byte a byte identicos al base, y que no se emplean hooks de runtime ni vectores de direccion. El autor tambien declara un modo de razonamiento con dos niveles de esfuerzo (effort=off y effort=max) y el uso de MTP/DSpark.

## Capacidades

- Generacion de texto y razonamiento multi-turno con contexto declarado de hasta 1.000.000 de tokens.
- Razonamiento con modo de esfuerzo configurable (effort=off y effort=max), con traza de razonamiento verificable segun la evaluacion de los autores.
- Entrada multimodal imagen-texto: el pipeline declarado es image-text-to-text y la torre de vision DeepSeek-ViT se mantiene intacta.
- Soporte de herramientas y function calling, segun la etiqueta "Vision + tools" de la model card.
- Decodificacion especulativa mediante la cabeza DSpark, orientada a reducir latencia de generacion.
- Ausencia total de rechazos: la evaluacion HarmBench-320 reporta 100 % de cumplimiento en las siete categorias evaluadas, con cero HARD_REF, cero SOFT_RED y cero HEDGE en ambos niveles de esfuerzo.
- Capacidades multilingues: no disponible (el clasificador de la evaluacion se describe como multilingue, pero no se enumeran idiomas soportados por el modelo).

## Casos de uso

- Investigacion sobre mecanismos de rechazo y alineacion: comparar el modelo base con esta build sobre el mismo conjunto HarmBench-320 permite medir que comportamientos desaparecen y cuales se preservan, y correlacionarlo con la caida de MMLU por asignatura (por ejemplo, moral_scenarios pasa de 76,9 % a 37,0 %).
- Red-teaming controlado de guardrails de terceros: usar el modelo como generador de prompts adversariales dentro de un entorno aislado para evaluar la robustez de clasificadores y filtros de otros sistemas, con registro completo de entradas y salidas.
- Analisis de documentacion tecnica extensa: su ventana declarada de 1M tokens permite cargar manuales, especificaciones o repositorios completos en una sola pasada sin troceado, algo util para auditoria de contratos o revision de normativa.
- Procesamiento de documentos escaneados con vision: al conservar la torre DeepSeek-ViT, puede extraer estructura y contenido de PDF con tablas, diagramas o formularios y devolver texto estructurado listo para indexar.
- Generacion de datos sinteticos para dominios con guardrails restrictivos: por ejemplo, corpus de ciberseguridad ofensiva o de contenido medico explicito para entrenar clasificadores, donde un modelo alineado se negaria a producir ejemplos etiquetados.
- Agentes multi-paso sobre bases de codigo: la combinacion de contexto largo, tool calling y capacidad de codigo permite construir flujos de refactorizacion o analisis de dependencias que mantienen el estado del repositorio completo en contexto.
- Asistente interno de documentacion en entorno controlado: desplegado tras una capa propia de moderacion, puede responder consultas tecnicas sobre manuales internos donde el modelo base rechazaria contenido legitimo por falsos positivos.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son los de la model card del autor.

HarmBench-320 (T=0, greedy; ASR = tasa de exito de ataque, es decir, proporcion de respuestas que cumplen la peticion):

| Evaluacion | Base ASR | CRACK ASR | Delta (pp) |
|---|---:|---:|---:|
| HB-320 effort=off | 137/320 = 42,81 % | 320/320 = 100,00 % | +57,19 |
| HB-320 effort=max | 5/320 = 1,56 % | 320/320 = 100,00 % | +98,44 |

Desglose por categoria semantica:

| Categoria | Items | Base off | CRACK off | Base max | CRACK max |
|---|---:|---:|---:|---:|---:|
| chemical_biological | 42 | 16,7 % | 100,0 % | 0,0 % | 100,0 % |
| copyright | 80 | 98,8 % | 100,0 % | 0,0 % | 100,0 % |
| cybercrime_intrusion | 52 | 34,6 % | 100,0 % | 3,8 % | 100,0 % |
| harassment_bullying | 21 | 0,0 % | 100,0 % | 0,0 % | 100,0 % |
| harmful | 18 | 11,1 % | 100,0 % | 5,6 % | 100,0 % |
| illegal | 53 | 13,2 % | 100,0 % | 0,0 % | 100,0 % |
| misinformation_disinformation | 54 | 44,4 % | 100,0 % | 3,7 % | 100,0 % |

MMLU (conjunto de test completo, 14.042 items, logits del base, T=0):

| Build | Correctas | Precision | Delta |
|---|---:|---:|---:|
| base | 12.211 / 14.042 | 86,96 % | — |
| CRACK | 11.619 / 14.042 | 82,74 % | -4,22 pp |

La model card indica que, excluyendo el bloque de etica (moral_scenarios, business_ethics, professional_law, jurisprudence, philosophy), la perdida sobre los aproximadamente 11.000 items restantes es de -1,1 pp. Las mayores caidas por asignatura son moral scenarios (-39,89 pp), professional law (-7,04 pp), abstract algebra (-6,00 pp), security studies (-5,31 pp) y high school computer science (-4,00 pp).

No se han publicado otros benchmarks (HumanEval, GSM8K, MMLU-Pro, MMMU, etc.) en la informacion disponible.

## Requisitos de hardware

- Peso de los pesos: el repositorio ocupa 510,3 GB, coherente con FP8 en la mayor parte de los tensores y FP4 en los expertos enrutados. Un calculo naive de 1 byte por parametro sobre 763,2 B daria ~763 GB, de modo que el empaquetado real es mas eficiente que FP8 puro.
- VRAM minima para inferencia: del orden de 510 GB solo para pesos, mas overhead de activaciones y cache KV. No cabe en una unica GPU comercial actual.
- Multi-GPU: 8x H100 80 GB (640 GB) deja un margen muy ajustado para pesos, sin espacio practico para cache KV a 1M tokens. 16x H100 80 GB (1.280 GB) o 8x H200 141 GB (1.128 GB) son configuraciones mas realistas para contexto largo. Estas cifras son estimaciones derivadas del tamano del repositorio, no datos publicados por el autor.
- GPU de consumo: no cabe en ninguna GPU de consumo (RTX 4090 24 GB, RTX 5090 32 GB, RTX PRO 6000 96 GB). Solo seria viable con offload a CPU y NVMe.
- Contexto largo: la cache KV para 1M tokens en un modelo de esta profundidad y anchura es el factor limitante real; no hay cifras publicadas de memoria por token.
- Opciones de despliegue: el repositorio declara compatibilidad con transformers y con endpoints. Para servirlo con vLLM, SGLang o TGI seria necesario soporte explicito de la arquitectura deepseek_v41, el MoE con top-6 y la cuantizacion FP8/FP4; no hay confirmacion en la informacion disponible. No se han publicado pesos GGUF ni cuantizaciones de menor precision, por lo que llama.cpp u Ollama no estan disponibles por ahora.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-UNCENSORED-FP8 (este) | 763,2 B (safetensors) | 8B/16B por token (model card) | 1M | MIT (declarada) | Repositorio HF, 0 descargas, 0 likes |
| deepseek-ai/DeepSeek-V4.1-Flash (base) | 552B backbone segun la model card | 8B/16B por token | 1M | no disponible | Modelo base referenciado en la model card |
| DeepSeek-V3 (referencia publica) | 671 B | 37 B | 128K | Licencia propia de DeepSeek | Ampliamente disponible |
| Qwen3-235B-A22B (referencia publica) | 235 B | 22 B | 128K | Apache 2.0 | Ampliamente disponible |

Los dos ultimos modelos se incluyen como referencia de categoria (MoE abiertos de gran escala); sus cifras provienen de documentacion publica general y no han sido verificadas en la busqueda realizada para esta ficha. No se dispone de comparativas de rendimiento publicadas entre este checkpoint y alternativas, mas alla de los datos de HarmBench y MMLU frente a su propio modelo base. Cualquier comparacion con el base en tareas de vision, codigo o agentes queda sin datos.

## Limitaciones y advertencias

- Ausencia deliberada de guardrails: la evaluacion del autor reporta 100 % de ASR en las siete categorias de HarmBench, incluidas chemical_biological, cybercrime_intrusion, harassment_bullying y misinformation_disinformation. Esto implica riesgo directo de generar contenido danino, ilegal o gravemente ofensivo si no se interpone moderacion externa.
- La propia model card indica que en effort=max el modelo base se vuelve mas propenso al rechazo (42,8 % -> 1,6 % de ASR), mientras que esta build permanece en 100 %. Es decir, el razonamiento no activa ningun freno interno.
- Degradacion medible de capacidades: -4,22 pp en MMLU-14k y -39,89 pp en moral scenarios. Cualquier uso que dependa de juicio etico o normativo esta seriamente comprometido.
- Sesgos: no hay informacion publicada sobre evaluacion de sesgos de genero, raza, religion o nacionalidad en esta build; la abliteracion puede alterar la distribucion de respuestas en temas sensibles de forma no medida.
- Alucinacion: no se publican mediciones de veracidad ni de tasa de alucinacion. Con 1M tokens de contexto, el riesgo de atender informacion irrelevante aumenta.
- Idiomas: no se especifican idiomas soportados. La model card menciona un clasificador multilingue para la evaluacion, pero no una lista de idiomas del modelo.
- Licencia: el repositorio declara MIT, pero se trata de un derivado de deepseek-ai/DeepSeek-V4.1-Flash. La licencia del modelo base no se especifica en la informacion disponible y podria imponer condiciones adicionales que prevalezcan sobre la declaracion MIT del derivado. Es imprescindible verificar los terminos del base antes de cualquier uso comercial.
- Atribucion y trazabilidad: el repositorio tiene 0 descargas y 0 likes y fue creado el 2026-09-21. No hay verificacion independiente de los pesos, del proceso de abliteracion ni de las afirmaciones de "preservacion byte a byte". La discrepancia entre los 552B declarados en la model card y los 763,2 B contados en safetensors queda sin explicacion.
- Reproducibilidad de la evaluacion: los resultados de HarmBench dependen de un clasificador de cuatro niveles basado en regex y, en effort=max, de un LLM como juez. No se han replicado por terceros.
- Riesgo legal y de cumplimiento: el uso de un modelo sin guardrails en productos de cara al publico puede incumplir normativa de servicios digitales, proteccion de menores o responsabilidad sobre contenidos generados, ademas de las condiciones de uso de los proveedores de infraestructura.
- Produccion: no se recomienda su despliegue directo en atencion al cliente, educacion, sanidad ni cualquier aplicacion con usuarios finales sin una capa de moderacion propia, filtrado de salida y registro de auditoria.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Riyan200324200324/DeepSeek-V4.1-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Cuenta de X citada en la model card: https://x.com/dealignai
- Cuenta de X citada en la model card: https://x.com/jordanschenck
- La busqueda web asociada a esta ficha no devolvio resultados relevantes: los unicos enlaces recuperados corresponden a paginas de resultados de la loteria Lotto Max (lotoquebec.com, lottomax.ca, wclc.com, olg.ca) y no guardan relacion con el modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales sobre este checkpoint.
