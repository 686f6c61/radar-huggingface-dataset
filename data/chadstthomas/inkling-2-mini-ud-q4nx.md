# chadstthomas/Inkling-2-Mini-UD-Q4NX

## Resumen

Inkling-2-Mini-UD-Q4NX es un empaquetado cuantizado del modelo Inkling-2-Mini desarrollado por Thinking Machines Lab, publicado por el usuario chadstthomas en Hugging Face. Se trata de una variante optimizada especificamente para su ejecucion en las NPU AMD XDNA 2 (arquitectura AIE2P), mediante un formato propietario denominado Q4NX que reorganiza los tensores en mosaicos de 32x256 en orden column-major, adaptado al motor de inferencia FastFlowLM.

El modelo base es un transformer de tipo Mixture of Experts (MoE) con 26.400 millones de parametros totales, aproximadamente 3.400 millones de parametros unicos y unos 5.400 millones de parametros activos efectivos gracias a un mecanismo de bucles (denominado `inkling2_loop` en la nomenclatura del autor). Esta arquitectura de MoE con bucles busca reducir el coste computacional por token manteniendo una capacidad de representacion elevada.

La relevancia de esta publicacion es fundamentalmente de infraestructura: constituye un objetivo listo para ejecucion en NPU AMD una vez que FastFlowLM incorpore el motor `inkling2_loop` para AIE2P. En la version actual de FastFlowLM (v1.0.x) dicho motor aun no esta disponible, por lo que el bundle no es funcional en NPU sin trabajo adicional de integracion. La licencia es Apache 2.0 y el repositorio ocupa 19,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) con bucles (`inkling2_loop`) |
| Parametros totales | 26.400 millones (26,4B) |
| Parametros activos | ~5.400 millones efectivos (~3.400 millones unicos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4NX (mosaicos 32x256, orden column-major para XDNA 2); Q8NX en atencion y capas coda; BF16/F32 en normas, routers y controladores de bucle |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Q4NX (`model.q4nx`, 19.887.586.496 bytes, 728 tensores) + config.json, tokenizer.json, tokenizer_config.json, chat_template.jinja, model_list.json |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura Mixture of Experts con un mecanismo de bucles que da nombre al identificador `inkling2_loop`. La estructura concreta de capas, el numero de expertos por capa y la politica de enrutamiento no estan detallados en la informacion disponible. El autor del bundle indica que el modelo cuenta con 26,4B de parametros totales, ~3,4B unicos y ~5,4B activos efectivos, lo que sugiere que el bucle reutiliza pesos en varias pasadas incrementando el computo efectivo sin aumentar el numero de parametros almacenados.

El proceso de cuantizacion parte de `unsloth/Inkling-2-Mini-GGUF` en su variante `UD-Q8_K_XL` (BF16) y de una fuente NVFP4 nativa. Los expertos MoE de las capas 0 a 19 se cuantizan a Q4NX (formato Q4_1, 5120 bytes por mosaico de 32x256), con los factores de escala NVFP4 originales plegados a FP32 antes del tiling y con la dimension K=1152 rellenada a 1280. Las capas coda de expertos (20 a 23), la atencion y la `lm_head` se mantienen en Q8NX (Q8_0, 8704 bytes por mosaico). Normas, routers MoE, shortconvs, clips, sinks y los controladores de bucle se conservan en BF16 o F32 sin perdida. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento general, segun corresponde a un modelo de lenguaje de tipo MoE de 26,4B parametros totales.
- Procesamiento de secuencias largas: la longitud de contexto no esta especificada en la informacion disponible.
- Capacidades multilingues: no disponibles en la documentacion proporcionada.
- Soporte de tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

No se han documentado en la informacion proporcionada capacidades especificas adicionales mas alla de las implicitas en la arquitectura del modelo base.

## Casos de uso

- Investigacion sobre cuantizacion para NPU AMD XDNA 2: el bundle sirve como material de referencia para estudiar el formato Q4NX y el tiling 32x256 en orden column-major, permitiendo validar tecnicas de empaquetado de tensores para AIE2P.
- Desarrollo del motor FastFlowLM `inkling2_loop`: el paquete constituye un objetivo de pruebas listo para usar una vez que el equipo de FLM implemente `libinkling2_loop_npu.so`, acelerando la validacion de la integracion.
- Evaluacion comparativa de precision Q4NX frente a Q8NX y BF16: al mantener atencion, `lm_head` y capas coda en Q8NX mientras los expertos van en Q4NX, permite medir el impacto de la cuantizacion selectiva en calidad de salida.
- Despliegue en entornos AMD con `llama.cpp` + `ggml-aie` (backend AIE2P BFP16) usando el checkpoint GGUF subyacente, como alternativa operativa mientras no exista soporte nativo en FLM.
- Experimentacion con arquitecturas MoE con bucles: el modelo base permite estudiar el comportamiento de modelos que reutilizan pesos en multiples pasadas con un presupuesto de parametros activos reducido (~5,4B efectivos).
- Integracion en pipelines de inferencia local en hardware AMD: mediante Lemonade Server y FastFlowLM, una vez completada la compatibilidad, para cargas de trabajo que requieran ejecucion en NPU sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica directamente, ya que el bundle esta disenado para NPU AMD XDNA 2 (AIE2P), no para GPU. El tamano del artefacto es de 19,888 GB (`model.q4nx`), por lo que se requiere al menos esa cantidad de memoria accesible en el dispositivo o en el sistema anfitrion.
- NPU objetivo: AMD XDNA 2 (arquitectura AIE2P), presente en procesadores AMD Ryzen AI de ultima generacion.
- GPU recomendadas: no disponible para este bundle; el modelo base en BF16 requeriria aproximadamente 52,8 GB de VRAM (26,4B parametros x 2 bytes), lo que excede GPUs de consumo como la RTX 4090 (24 GB) y encaja en A100 80 GB o H100.
- Ejecucion en consumer GPU: no es el proposito de este bundle. Para GPU de consumo seria necesario usar el GGUF original con cuantizaciones Q4_K_M o similares.
- Opciones de despliegue: Lemonade Server -> FastFlowLM (`flm`) con `model.q4nx` (pendiente de soporte `inkling2_loop` en FLM v1.0.x); alternativa actual con `llama.cpp` + `ggml-aie` (AIE2P BFP16) sobre el checkpoint GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato / destino |
|---|---|---|---|---|---|
| Inkling-2-Mini-UD-Q4NX | 26,4B | ~5,4B efectivos | no disponible | Apache 2.0 | Q4NX para NPU AMD XDNA 2 |
| Inkling-2-Mini (base) | 26,4B | ~5,4B efectivos | no disponible | Apache 2.0 | Pesos originales de Thinking Machines Lab |
| unsloth/Inkling-2-Mini-GGUF (UD-Q8_K_XL) | 26,4B | ~5,4B efectivos | no disponible | Apache 2.0 | GGUF para `llama.cpp` / GPU y CPU |

La comparativa con modelos de otros desarrolladores (por ejemplo, alternativas MoE de tamano similar) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El bundle no es funcional en NPU AMD XDNA 2 con la version actual de FastFlowLM (v1.0.x), que carece del motor `libinkling2_loop_npu.so` para AIE2P. Su uso requiere trabajo de integracion pendiente o recurrir al backend `llama.cpp` + `ggml-aie`.
- No se dispone de informacion sobre sesgos conocidos, tasas de alucinacion ni evaluaciones de calidad del modelo base.
- La longitud de contexto y los idiomas soportados no estan documentados en la informacion disponible, lo que impide garantizar su idoneidad para tareas que dependan de ventanas largas o cobertura multilingue.
- La cuantizacion Q4NX de los expertos MoE (capas 0-19) puede introducir degradacion de calidad respecto al BF16 original; no se han publicado mediciones al respecto.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base (thinkingmachines/Inkling-2-Mini) y del GGUF de origen (unsloth) antes de un uso comercial en produccion.
- El repositorio tiene solo 3 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria practicamente nula.
- El pipeline no esta declarado en Hugging Face, por lo que no hay integracion automatica con `transformers` ni con APIs estandar de inferencia.

## Enlaces

- Hugging Face (bundle Q4NX): https://huggingface.co/chadstthomas/Inkling-2-Mini-UD-Q4NX
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF de origen: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- FastFlowLM: no disponible en la informacion proporcionada
- Lemonade Server: no disponible en la informacion proporcionada
- `llama.cpp` con backend `ggml-aie`: no disponible en la informacion proporcionada
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada
