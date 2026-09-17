# GestaltLabs/continuity-a4b-26b-nvfp4

## Resumen

GestaltLabs/continuity-a4b-26b-nvfp4 es un modelo de extraccion estructurada de informacion, especializado en convertir paginas web en JSON tipado que cumple un esquema (JSON Schema) aportado por el usuario. No es un modelo entrenado desde cero: es la version cuantizada en NVFP4 del fine-tune GestaltLabs/continuity-a4b-26b, que a su vez deriva de google/gemma-4-26B-A4B-it mediante LoRA fusionado. La cadena completa es, por tanto, gemma-4-26B-A4B-it -> LoRA (merged) -> continuity-a4b-26b (bf16) -> este repositorio (NVFP4, solo expertos).

La arquitectura es un transformer de mezcla de expertos (MoE) con unos 3,8B parametros activos sobre 25,2B parametros del modelo de lenguaje (26,3B incluyendo la torre de vision), aunque el recuento real de safetensors del repositorio es de 14.386.941.232 parametros. El interes practico del artefacto esta en la combinacion de tres factores: salida 100% valida contra esquema en el conjunto de evaluacion (103/103), una tasa de exito estricta de 0,9029 sobre representacion IR de DOM limpio y 0,9515 sobre HTML, y una reduccion de tamano de 49 GB a 17,5-18 GB con una perdida de precision de campo practicamente nula (0,9178 frente a 0,9210).

Es relevante ahora porque el requisito de NVFP4 obliga a hardware Blackwell (sm100/sm120) para los kernels FP4 del MoE, y porque el autor reporta un rendimiento de servicio de 3,53 paginas/s frente a 0,167 paginas/s del bf16 original, lo que mueve la extraccion estructurada de documentacion web de la categoria de proceso batch a la de servicio casi interactivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) multimodal, derivado de Gemma 4 26B-A4B |
| Parametros totales | 14.386.941.232 segun safetensors del repositorio; la model card declara 26.301.723.952 en el checkpoint (25,2B en el modelo de lenguaje + torre de vision) |
| Parametros activos | ~3,8B de 25,2B parametros del modelo de lenguaje (MoE) |
| Longitud de contexto | 8192 tokens configurados en el ejemplo de despliegue con vLLM (max_model_len); no se declara la longitud nativa del modelo base |
| Tipos de cuantizacion | NVFP4 (4 bits, solo expertos), generada con NVIDIA ModelOpt; la model card la etiqueta como 8-bit en los tags de HuggingFace |
| Idiomas soportados | Ingles (en) |
| Licencia | apache-2.0, con license_link apuntando a la licencia de Gemma 4 (ver advertencias) |
| Formato de pesos | safetensors (repo de 18,8 GB; la model card indica 17,5 GB), compatible con vLLM |

## Arquitectura y entrenamiento

El modelo parte de gemma-4-26B-A4B-it (revision 4d7ae4984b7db7de8f8457170b3f1a419ee76d52), un transformer MoE multimodal con torre de vision. Sobre esa base se aplico un fine-tune con LoRA restringido a las proyecciones de atencion, de la MLP densa y del router; los pesos de los expertos fusionados permanecieron congelados. La configuracion LoRA es r=16, alpha=32, dropout=0.0 en bf16, con objetivos q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj y proj. El entrenamiento fue de 514 pasos en 2 epocas sobre 19.998.720 parametros entrenables de un total de 26.301.723.952 (0,076% del checkpoint); la tasa de aprendizaje no esta disponible porque el dato aparece truncado en la model card.

La innovacion tecnica principal no esta en la arquitectura, sino en la cuantizacion: se aplico NVFP4 solo a los expertos, dejando el resto de componentes en mayor precision, lo que segun el autor preserva la precision de campo (0,9178 frente a 0,9210) mientras reduce el artefacto de 49 GB a 17,5 GB y multiplica por unas 21 veces la velocidad de servicio. El fine-tune esta orientado a decodificacion greedy de un solo disparo: la entrada esperada es una representacion IR de DOM limpio (script, style y nav eliminados, texto y estructura conservados) o HTML crudo, mas un JSON Schema, y la salida debe ser una unica instancia JSON. La model card indica que la generacion se posvalida contra el esquema y que las filas no parseables o no reparables se reportan aparte en lugar de aceptarse silenciosamente.

## Capacidades

- Extraccion estructurada condicionada por esquema: dado un JSON Schema y una pagina, emite una instancia JSON que lo cumple.
- Salida JSON valida contra esquema en el 100% de los casos del conjunto de evaluacion (103/103, cero fallos de parseo).
- Dos representaciones de entrada soportadas: IR de DOM limpio (la que el autor recomienda servir) y HTML crudo.
- Generacion de texto y modo conversacional segun el pipeline declarado (text-generation), heredado de Gemma 4 26B-A4B-it.
- Capacidad multimodal latente por la torre de vision del modelo base, aunque el ejemplo de despliegue la desactiva explicitamente (limit_mm_per_prompt={"image": 0}) para uso solo texto.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada; el entrenamiento esta descrito como extraccion de un solo disparo.
- Capacidades multilingues: limitadas a ingles; el unico idioma declarado es en.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Extraccion de fichas de producto en comercio electronico: a partir del DOM limpio de una pagina de producto y un esquema con nombre, precio, moneda y disponibilidad, el modelo devuelve un JSON listo para indexar, con 0,9178 de precision de campo en la evaluacion del autor.
- Enriquecimiento de catalogos y pipelines de datos a escala: el artefacto NVFP4 sirve 3,53 paginas/s en una RTX PRO 6000 Blackwell, de modo que un lote de 100.000 paginas es abordable en horas en lugar de semanas respecto al bf16 (0,167 paginas/s).
- Extraccion de datos de portales institucionales y administrativos: paginas con estructura repetitiva pero HTML sucio se procesan mejor sobre la representacion IR (0,9029 de exito estricto) que sobre HTML crudo, reduciendo el mantenimiento de scrapers especificos por sitio.
- Normalizacion de documentos legales o contractuales a un esquema comun: definiendo un esquema de partes, fechas, importes y clausulas, el modelo produce objetos validables antes de cargarlos en una base de datos.
- Monitorizacion de precios y cambios de contenido: ejecutando extracciones periodicas con temperatura 0,0 y comparando el JSON resultante contra el esquema, se detectan variaciones de campo de forma determinista.
- Alimentacion de pipelines RAG: el JSON tipado y validado contra esquema es una unidad de fragmentacion mucho mas estable que el texto libre troceado, lo que mejora la trazabilidad de la cita por campo.
- Automatizacion de formularios y back-office: el esquema define exactamente los campos requeridos, y el modelo puede rellenar estructuras que luego se validan antes de cualquier escritura en sistemas de gestion.

## Benchmarks y rendimiento

Conjunto de evaluacion: 103 paginas reales retenidas, un esquema por pagina, decodificacion greedy, limite de 2048 tokens y un unico scorer. fna = precision a nivel de campo tras normalizacion; success = todos los campos requeridos presentes y correctos.

Representacion IR (DOM limpio, la que el autor recomienda servir):

| Modelo | Tamano | fna | success | schema-valid | paginas/s |
|---|---|---|---|---|---|
| continuity-a4b-26b-nvfp4 (este repositorio) | 18 GB | 0,9178 | 0,9029 | 1,00 | 3,53 |
| continuity-a4b-26b (bf16 origen) | 49 GB | 0,9210 | 0,8932 | 1,00 | 0,167 |
| gemma-4-26B-A4B zero-shot, sin fine-tune | 52 GB | 0,9137 | 0,9029 | 0,00 | 0,033 |
| diffusiongemma-26B zero-shot | 52 GB | 0,9046 | 0,6796 | 0,00 | 0,213 |
| NuExtract3 (4B denso) | 8 GB | 0,8905 | 0,6699 | 0,94 | 0,085 |
| ReaderLM-v2 (1,5B) | 3 GB | 0,7573 | 0,3786 | 0,00 | 0,263 |

Representacion HTML (marcado crudo):

| Modelo | fna | success | schema-valid | paginas/s |
|---|---|---|---|---|
| gemma-4-26B-A4B + LoRA | 0,9203 | 0,9515 | 0,99 | 0,066 |
| diffusiongemma-26B zero-shot | 0,9263 | 0,6408 | 0,00 | 0,200 |
| gemma-4-26B-A4B zero-shot | 0,9684 | 0,6311 | 0,00 | 0,032 |
| NuExtract3 | 0,8779 | 0,3010 | 1,00 | 0,085 |
| ReaderLM-v2 | 0,8206 | 0,4175 | 0,00 | 0,192 |

Advertencias sobre estas cifras: la columna paginas/s no es comparable de forma estricta, porque las mediciones propias se hicieron con vLLM sobre RTX PRO 6000 Blackwell y las filas de comparacion con generate_batch de HuggingFace en otras GPU. Ademas, el resumen de la model card cita 0,8932 de exito estricto en IR y 0,9515 en HTML, mientras que la tabla de IR asigna 0,8932 al bf16 de origen y 0,9029 a esta build NVFP4; no se dispone de aclaracion del autor sobre esa discrepancia. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks generalistas en la informacion proporcionada.

## Requisitos de hardware

- Peso del modelo: 17,5-18 GB, lo que exige al menos 24 GB de VRAM para inferencia comoda con overhead de KV cache dentro de los 8192 tokens configurados.
- Los kernels FP4 del MoE requieren arquitectura Blackwell: sm100 o sm120. En GPUs anteriores (Hopper, Ada, Ampere) esta build NVFP4 no es utilizable segun la model card.
- GPU empleada por el autor para las mediciones: RTX PRO 6000 Blackwell, con 3,53 paginas/s sobre representacion IR.
- GPU de centro de datos compatibles por arquitectura: B100/B200 y posteriores (sm100). No se declaran cifras de rendimiento para estas.
- Cabe en GPU de gama alta de consumo Blackwell, como la RTX 5090 (sm120, 32 GB de VRAM), por arquitectura y por tamano de pesos; no se han publicado mediciones especificas en esa GPU.
- Opciones de despliegue: vLLM es la ruta documentada por el autor (pip install vllm). No se documenta soporte para llama.cpp, Ollama, TGI ni otros motores; el formato NVFP4 con ModelOpt tampoco es el habitual en dichos motores.
- Ajustes de despliegue indicados: max_model_len=8192, gpu_memory_utilization=0.85, attention_backend="TRITON_ATTN", limit_mm_per_prompt={"image": 0} para uso solo texto y VLLM_USE_FLASHINFER_SAMPLER=0 en sm120 (el sampler JIT de FlashInfer no compila en esa arquitectura).
- Latencia estimada derivada de la cifra propia: unos 283 ms por pagina en RTX PRO 6000 Blackwell a 3,53 paginas/s, sin desglose de TTFT ni TPOT publicados.

## Comparativa con modelos similares

| Modelo | Parametros / tamano | Tarea | success IR | success HTML | schema-valid IR | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| continuity-a4b-26b-nvfp4 | MoE 4-bit, 18 GB (14,39B segun safetensors) | Extraccion con esquema | 0,9029 | no medido para esta build | 1,00 | apache-2.0 (con matices) | HuggingFace, requiere Blackwell |
| continuity-a4b-26b (bf16) | MoE bf16, 49 GB | Extraccion con esquema | 0,8932 | 0,9515 (con LoRA) | 1,00 | apache-2.0 (con matices) | HuggingFace |
| gemma-4-26B-A4B-it zero-shot | MoE bf16, 52 GB | Modelo generalista multimodal | 0,9029 | 0,6311 | 0,00 | licencia Gemma 4 | HuggingFace |
| NuExtract3 | 4B denso, 8 GB | Extraccion con esquema | 0,6699 | 0,3010 | 0,94 | no disponible | HuggingFace |
| ReaderLM-v2 | 1,5B, 3 GB | Extraccion / conversion a markdown | 0,3786 | 0,4175 | 0,00 | no disponible | HuggingFace |

La lectura de la comparativa es que el fine-tune no mejora tanto la precision de campo como la usabilidad: gemma-4-26B-A4B zero-shot empata en exito IR (0,9029) pero no produce salida valida contra esquema en ningun caso (JSON envuelto en vallas de codigo o prosa), y su exito en HTML cae a 0,6311 frente a 0,9515 del fine-tune. Los modelos densos pequenos (NuExtract3, ReaderLM-v2) quedan muy por debajo en exito estricto, aunque NuExtract3 logra 0,94 de validez de esquema con solo 8 GB.

## Limitaciones y advertencias

- Idioma: el unico idioma declarado es ingles; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Dependencia de hardware: los kernels FP4 del MoE exigen Blackwell (sm100/sm120); en otras arquitecturas el modelo no es desplegable, lo que limita su uso en clústeres Hopper o Ampere existentes.
- Ambiguedad de licencia: los metadatos declaran apache-2.0, pero el license_link apunta a la licencia de Gemma 4, que impone sus propias condiciones de uso. Conviene verificar la licencia aplicable antes de un uso comercial.
- Preprocesado obligatorio: el modelo espera DOM limpio (script, style y nav eliminados); alimentarlo con HTML crudo degrada el resultado, y esta build NVFP4 no tiene medicion publicada sobre HTML.
- Decodificacion restringida en la practica: el autor recomienda temperature=0.0, lo que reduce la diversidad de salida y hace el modelo inadecuado para generacion abierta o creativa.
- Riesgo de alucinacion: aunque el 100% de las salidas del conjunto de evaluacion son validas contra esquema, la validez formal del JSON no garantiza que el valor extraido exista en la pagina. El propio autor indica que hay que validar el objeto devuelto antes de confiar en el.
- Cifras de rendimiento no homogeneas: las paginas/s se midieron con motores y GPU distintos a los de las filas comparadas, tal como reconoce la model card.
- Discrepancia de recuento de parametros: los safetensors del repositorio suman 14,39B parametros frente a los 26,30B declarados en la model card, lo que puede afectar a la planificacion de recursos.
- Discrepancia en las metricas de exito en IR entre el resumen y la tabla de la model card (0,8932 frente a 0,9029).
- Limitacion de contexto: la configuracion documentada usa 8192 tokens y un tope de generacion de 2048 tokens, insuficiente para paginas muy extensas sin troceado previo.
- Inexistencia de traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de los resultados por parte de terceros.
- Sin datos sobre sesgos, filtrado de contenido, tool calling ni comportamiento en agentes multi-paso.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/GestaltLabs/continuity-a4b-26b-nvfp4
- Modelo base bf16 del fine-tune: https://huggingface.co/GestaltLabs/continuity-a4b-26b
- Modelo original de Google: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia referenciada en la model card: https://ai.google.dev/gemma/docs/gemma_4_license
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo, el autor ni el paper asociado; todos los resultados obtenidos correspondian a portales universitarios sin relacion con el artefacto. No se dispone por tanto de enlaces a papers, blogs o demos adicionales.
