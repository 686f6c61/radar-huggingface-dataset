# ml-resources/Mistral-Large-4-1T-A52B

## Resumen

Mistral Large 4, apodado "Le Chonk", es el modelo mas grande y capaz publicado hasta la fecha por Mistral AI. Se trata de un Mixture-of-Experts (MoE) nativamente multimodal con aproximadamente 1 billon de parametros totales y unos 52.000 millones de parametros activos por token (49.000 millones en las capas MoE mas los embeddings y la capa de salida). Fue entrenado desde cero en 3.800 GPU NVIDIA Grace Blackwell en los propios centros de datos de Mistral en Europa, lo que lo convierte en una de las mayores apuestas europeas por un modelo de pesos abiertos de escala frontera.

El modelo unifica en un unico conjunto de pesos el seguimiento de instrucciones, el razonamiento, la generacion de codigo y los flujos agenticos, con una ventana de contexto de hasta 1 millon de tokens y entrada multimodal de texto e imagen mediante un codificador visual de estilo Pixtral. Destaca especialmente en ciberseguridad, finanzas y derecho, y segun la model card supera a modelos cerrados frontera en tareas de visual grounding. Es nativamente fluido en mas de 160 idiomas, incluidos todos los oficiales de la Union Europea.

Su relevancia actual radica en tres factores: la escala MoE que permite servir un modelo de billon de parametros con un coste de inferencia propio de uno de ~52.000 millones activos; la inclusion de una cabeza de decodificacion especulativa DSpark embebida en el checkpoint; y una licencia de pesos abiertos (Mistral Ecosystem Open-Weight License) que permite uso comercial salvo la operacion de un negocio de Model-as-a-Service, que requiere licencia aparte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal, con 128 expertos enrutados (4 activos por token) y 1 experto compartido; codificador visual estilo Pixtral |
| Parametros totales | ~1 billon (1T) |
| Parametros activos | ~52.000 millones (49B en capas MoE + embeddings y capa de salida) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 (checkpoint oficial cuantizado); fp8 (tag del repo); cuantizaciones adicionales no disponibles |
| Idiomas soportados | 160+ idiomas, incluidos todos los oficiales de la UE (en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn, bg, hr, cs, da, nl, et, fi, el, hu, ga, lv, lt, mt, sk, sl) |
| Licencia | Mistral Ecosystem Open-Weight License (version modificada de MIT; uso comercial permitido salvo Model-as-a-Service, que requiere licencia comercial con Mistral) |
| Formato de pesos | safetensors (transformers); checkpoint NVFP4 disponible por separado; tamano del repo ~1060,6 GB |

## Arquitectura y entrenamiento

Mistral Large 4 es un transformer MoE de granularidad fina con 128 expertos enrutados de los que se activan 4 por token, mas un experto compartido siempre activo. Esta configuracion permite un total de ~1 billon de parametros manteniendo un coste computacional por token equivalente al de un modelo denso de ~52.000 millones de parametros activos. La multimodalidad es nativa: un codificador visual de estilo Pixtral procesa imagenes de tamano y relacion de aspecto variables, y la salida es exclusivamente texto. El modelo incorpora ademas una cabeza de decodificacion especulativa DSpark embebida en el propio checkpoint, lo que acelera la generacion sin necesidad de un modelo draft separado.

El entrenamiento se realizo desde cero sobre 3.800 GPU NVIDIA Grace Blackwell en los centros de datos de Mistral en Europa. La model card no detalla el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible en los materiales proporcionados. El modelo soporta modo de razonamiento con tres niveles de esfuerzo (`low`, `medium`, `high`, por defecto `high`), configurable por peticion, lo que sugiere un post-entrenamiento orientado a controlar la profundidad del razonamiento segun la carga.

## Capacidades

- Generacion de texto, razonamiento de multiples pasos y resolucion de problemas complejos con esfuerzo de razonamiento configurable (`low`, `medium`, `high`).
- Generacion y comprension de codigo, incluida la operacion como agente de codificacion (segun la model card, 48% en el Artificial Analysis Coding Agent Index).
- Vision: analisis de imagenes, graficos, dibujos tecnicos y documentos, con capacidades de visual grounding descritas como estado del arte entre pesos abiertos.
- Function calling nativo, salida JSON y cumplimiento estricto de esquema JSON (strict JSON schema enforcement).
- Flujos agenticos multi-paso con uso de herramientas.
- Multilinguee nativo en 160+ idiomas, con cobertura de todas las lenguas oficiales de la UE.
- Fuerte adherencia a system prompts.
- Especial rendimiento en ciberseguridad (estado del arte entre pesos abiertos, con rechazo de peticiones maliciosas), finanzas y derecho.
- Decodificacion especulativa integrada (DSpark) para acelerar la inferencia.

## Casos de uso

- **Agente de codificacion en produccion**: integrado en pipelines de CI/CD y entornos de desarrollo para refactorizacion, generacion de tests y correccion de bugs, aprovechando su function calling nativo y su eficiencia en tokens por tarea (47% menos que el modelo lider segun la model card), lo que reduce coste a escala.
- **Atencion al cliente multilinguee**: gestion de conversaciones multi-turno con contexto de hasta 1M tokens, cubriendo clientes en cualquiera de los 160+ idiomas soportados sin modelos auxiliares de traduccion.
- **Analisis de documentos legales y financieros**: procesamiento de contratos, informes y expedientes extensos gracias a la ventana de 1M tokens, con salida JSON estructurada para alimentar sistemas downstream.
- **Revision de seguridad y ciberseguridad defensiva**: analisis de codigo, configuraciones y logs en busca de vulnerabilidades, con rechazo de peticiones maliciosas; adecuado para equipos SOC y auditorias internas.
- **Extraccion de informacion de documentos escaneados y graficos**: uso de la entrada multimodal para leer facturas, planos tecnicos, tablas e infografias y devolver datos estructurados mediante JSON schema.
- **Asistente agentico interno con herramientas**: orquestacion de flujos multi-paso que combinan busqueda, calculo y APIs internas, con esfuerzo de razonamiento `high` para tareas complejas y `low` para respuestas rapidas de chat.
- **Generacion de contenido y documentacion tecnica en la UE**: redaccion y localizacion en las lenguas oficiales europeas, con cumplimiento de la licencia para uso comercial interno.

## Benchmarks y rendimiento

| Benchmark | Resultado | Referencia comparativa |
|---|---|---|
| Artificial Analysis Coding Agent Index | 48% | Practicamente empatado con GLM-5.3 (lider de pesos abiertos), usando 47% menos tokens por tarea |
| Artificial Analysis Intelligence Index v5 | 26 | El mas alto entre modelos de pesos abiertos occidentales; los lideres chinos de pesos abiertos puntuan mas alto en este indice agregado |

La model card remite al blog de Mistral para benchmarks adicionales de ciberseguridad, finanzas y derecho, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada en BF16**: ~2 TB para los ~1 billon de parametros totales; inviable en hardware de un solo nodo convencional.
- **Checkpoint NVFP4**: reduce el footprint de memoria de forma sustancial y esta orientado a GPU Blackwell; segun la model card ofrece "menor huella de memoria, inferencia mas rapida y el mismo rendimiento". El tamano exacto del checkpoint NVFP4 no esta disponible en la informacion proporcionada.
- **GPU recomendadas**: NVIDIA Grace Blackwell (empleadas en el entrenamiento); el checkpoint NVFP4 esta dirigido a GPU Blackwell. Para servir el modelo completo se requiere un cluster multi-GPU con paralelismo tensorial y de expertos.
- **Consumer GPU**: no cabe en GPU de consumo (RTX 4090, etc.) ni en configuraciones multi-GPU de gama alta convencionales; el despliegue requiere infraestructura de centro de datos.
- **Opciones de despliegue**: vLLM, SGLang, transformers y llama.cpp (segun los tags del repo); el checkpoint NVFP4 soporta vLLM y SGLang.
- **Latencia y throughput**: no disponibles en la informacion proporcionada; la decodificacion especulativa DSpark y el checkpoint NVFP4 estan orientados a mejorar el throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral Large 4 (1T-A52B) | ~1T total / ~52B activos | 1M | 48% Coding Agent Index; 26 Intelligence Index v5 | Mistral Ecosystem Open-Weight License | Pesos abiertos en HuggingFace; API Mistral |
| GLM-5.3 | no disponible | no disponible | Practicamente empatado en Coding Agent Index (referencia de la model card) | no disponible | no disponible |
| Modelos frontera cerrados | no disponible | no disponible | Superados en visual grounding segun la model card | Propietaria | Solo API |

La model card solo identifica a GLM-5.3 como referencia directa en el Coding Agent Index y menciona de forma generica a "modelos cerrados frontera" y a "lideres chinos de pesos abiertos" en el Intelligence Index. No se dispone de datos detallados de parametros, contexto o licencia de esos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- **Sesgos**: no se documentan sesgos especificos en la model card; como modelo entrenado en datos web a gran escala, es esperable que herede sesgos de esos datos, aunque no se cuantifican.
- **Alucinacion**: no se proporcionan tasas de alucinacion ni evaluaciones especificas; en tareas de derecho, finanzas o ciberseguridad conviene validar las salidas con fuentes primarias.
- **Licencia**: la Mistral Ecosystem Open-Weight License permite uso comercial y no comercial, pero operar un negocio de Model-as-a-Service requiere una licencia comercial separada con Mistral. Es imprescindible revisar los terminos antes de ofrecer el modelo como servicio.
- **Requisitos de hardware**: el modelo completo en BF16 (~2 TB) exige infraestructura multi-GPU de centro de datos; el checkpoint NVFP4 esta limitado a GPU Blackwell, lo que restringe las opciones de despliegue.
- **Idiomas**: aunque se declaran 160+ idiomas, la calidad relativa por idioma no se documenta; los idiomas de la lista de la model card son los verificados, pero el rendimiento en lenguas de bajos recursos puede ser inferior.
- **Contexto largo**: la ventana de 1M tokens no garantiza recuperacion perfecta de informacion en todo el rango; no se publican resultados de benchmarks de long-context en la informacion disponible.
- **Modo de razonamiento**: el nivel `high` por defecto incrementa el coste en tokens y la latencia; en produccion conviene ajustar `reasoning_effort` segun la tarea.
- **Salida**: el modelo es multimodal de entrada pero solo genera texto; no produce imagenes ni audio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ml-resources/Mistral-Large-4-1T-A52B
- Checkpoint NVFP4: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B-NVFP4
- Blog de Mistral: https://mistral.ai/news/mistral-large-4-oss/
- Documentacion de la API: https://docs.mistral.ai/models/mistral-large-4-0
- Licencia: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/blob/main/LICENSE
- Galeria de demos (Le Chonk Gallery): https://mistralai-ml4-le-chonk-gallery.hf.space/
- Mistral Vibe (agente de codificacion): https://github.com/mistralai/mistral-vibe
