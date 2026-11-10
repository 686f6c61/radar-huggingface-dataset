# mradermacher/gemma-3-starshine-12b-continued-GGUF

## Resumen

`mradermacher/gemma-3-starshine-12b-continued-GGUF` es una coleccion de cuantizaciones en formato GGUF del modelo `ToastyPigeon/gemma-3-starshine-12b-continued`, un ajuste fino sobre la arquitectura Gemma 3 de Google con aproximadamente 11.766 millones de parametros. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos open source, y esta pensado para su uso en `llama.cpp` y entornos compatibles con GGUF (Ollama, LM Studio, KoboldCpp, entre otros).

El modelo base es un derivado de la familia Gemma 3, concretamente la variante de 12B, que incorpora capacidades multimodales (se incluyen ficheros `mmproj` para el proyector de vision). El ajuste fino "starshine" no documenta en la informacion disponible que datos de entrenamiento adicionales se han utilizado ni que metodologia (SFT, DPO, RLHF) se ha aplicado, por lo que su comportamiento especifico respecto al Gemma 3 original no puede caracterizarse con rigor.

La relevancia de esta ficha es practica: permite desplegar un modelo de ~12B en hardware de consumo mediante cuantizaciones que van desde Q2_K (4,9 GB) hasta Q8_0 (12,6 GB), con la posibilidad de anadir el proyector multimodal. Ahora bien, la ausencia de model card detallada, benchmarks y licencia explicita limita seriamente su uso en produccion sin una evaluacion previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Gemma 3, transformer decoder-only) |
| Parametros totales | 11.766.034.176 (~11,77B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; proyector multimodal en mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (segun la model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (con ficheros mmproj para vision) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base ni del ajuste fino. Por el nombre y el tamano (11,77B parametros) se infiere que se trata de una variante de la familia Gemma 3 de Google, que emplea un transformer decoder-only con atencion por ventanas deslizantes en capas alternas y soporte multimodal. Sin embargo, esta inferencia no esta confirmada en la documentacion proporcionada y debe tratarse como orientativa.

Respecto al entrenamiento, la model card del repositorio GGUF no incluye informacion sobre el dataset, el numero de tokens, la composicion de los datos ni si se aplicaron tecnicas de alineacion como SFT, DPO o RLHF en el ajuste fino "starshine". El unico dato tecnico relevante es que las cuantizaciones son estaticas (no imatrix) y que existe una version con imatrix en el repositorio `mradermacher/gemma-3-starshine-12b-continued-i1-GGUF`, que suele ofrecer mejor calidad por tamano segun el propio autor.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno (tag `conversational`).
- Capacidades multimodales: se incluyen ficheros `mmproj` (Q8_0 y f16), lo que sugiere soporte de entrada de imagen, aunque no se documenta el alcance ni la calidad de dicha capacidad.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que indica que puede servirse a traves de infraestructuras compatibles con la API de transformers.
- No se documenta soporte explicito de tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode).
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documenta soporte de audio ni de otras modalidades mas alla de la vision inferida por los ficheros mmproj.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (7,4 GB) y Q5_K_M (8,5 GB) permiten ejecutar el modelo en GPUs con 8-12 GB de VRAM mediante `llama.cpp` u Ollama, lo que facilita prototipado sin depender de la nube.
- Asistentes conversacionales en ingles para entornos controlados: el tag `conversational` y el ajuste fino sugieren uso en chatbots de dominio acotado, siempre que se valide el comportamiento con un conjunto de evaluacion propio.
- Procesamiento de documentos con componente visual: gracias a los ficheros `mmproj`, puede emplearse en tareas de descripcion de imagenes o respuesta a preguntas sobre capturas, aunque la falta de benchmarks obliga a medir la calidad empiricamente.
- Experimentacion e investigacion: util como base para comparar tecnicas de cuantizacion (Q4_K_M frente a IQ4_XS, o estaticas frente a imatrix del repositorio i1) en tareas de generacion de texto.
- Fine-tuning adicional sobre GGUF no es posible directamente; sin embargo, el modelo base en safetensors (`ToastyPigeon/gemma-3-starshine-12b-continued`) puede servir como punto de partida para ajustes con LoRA/QLoRA en ingles.
- Educacion y demos: el tamano contenido y la disponibilidad de cuantizaciones ligeras (Q2_K, 4,9 GB) permiten incluirlo en talleres o demos sobre inferencia local de LLMs.
- Generacion de texto creativo en ingles: el ajuste fino "starshine" podria estar orientado a estilo narrativo, pero sin model card detallada no puede confirmarse; se recomienda evaluacion manual antes de usarlo en produccion editorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~4,9 GB; Q3_K_M ~6,1 GB; IQ4_XS ~6,7 GB; Q4_K_M ~7,4 GB; Q5_K_M ~8,5 GB; Q6_K ~9,8 GB; Q8_0 ~12,6 GB. Anadir 1-2 GB adicionales para el contexto KV cache segun longitud.
- Proyector multimodal: 0,7 GB (mmproj-Q8_0) o 1,0 GB (mmproj-f16) adicionales si se usa vision.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8; A100/H100 para despliegues concurrentes con contexto largo o Q8_0 sin offload.
- Cabe en GPU de consumo: si, desde una RTX 3060 12 GB (Q4_K_M con contexto moderado) hasta tarjetas de 16 GB para Q6_K/Q8_0. En GPUs de 8 GB solo caben Q2_K/Q3_K con contexto reducido o con offload parcial a CPU.
- Opciones de despliegue: `llama.cpp`, Ollama, LM Studio, KoboldCpp, text-generation-webui; tambien puede servirse via `llama-cpp-python` con API compatible con OpenAI. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que para esos backends conviene usar el modelo base en safetensors.
- Latencia y throughput: no disponibles. Dependen fuertemente del hardware, la cuantizacion y el backend; en una RTX 4090 con Q4_K_M es razonable esperar decenas de tokens por segundo, pero no hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-3-starshine-12b-continued (este) | 11,77B | no disponible | no disponible | GGUF | Ajuste fino sin documentacion de entrenamiento ni benchmarks |
| Gemma 3 12B (original de Google) | ~12B | no disponible en esta ficha | Gemma Terms of Use | safetensors, GGUF (via terceros) | Modelo oficial con model card, benchmarks y licencia explicita |
| Mistral Nemo 12B | ~12B | 128k | Apache 2.0 | safetensors, GGUF | Alternativa abierta con licencia permisiva y amplia documentacion |
| Qwen2.5 14B | ~14B | 32k (128k en variantes) | Apache 2.0 (mayoria de variantes) | safetensors, GGUF | Mayor tamano, buen rendimiento en codigo y multilingue |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo evaluado, por lo que la eleccion frente a alternativas debe basarse en evaluacion empirica propia y en la idoneidad de la licencia para el caso de uso.

## Limitaciones y advertencias

- Ausencia de model card detallada: no se documenta el dataset de ajuste fino, el proceso de alineacion ni los objetivos del autor, lo que impide anticipar sesgos o comportamientos especificos.
- Licencia no disponible: no puede confirmarse si el uso comercial esta permitido. Al derivar de Gemma 3, es probable que hereden las Gemma Terms of Use, pero debe verificarse en el repositorio del modelo base antes de cualquier despliegue productivo.
- Solo ingles declarado: el rendimiento en castellano no esta garantizado y probablemente sea inferior al de modelos multilingues explicitos.
- Riesgo de alucinacion: como cualquier LLM de ~12B sin benchmarks publicados, no hay evidencia de su fiabilidad factual; se recomienda RAG y validacion humana en aplicaciones sensibles.
- Contexto desconocido: no se especifica la longitud de contexto soportada, lo que impide planificar casos de uso con documentos largos sin pruebas previas.
- Cuantizaciones estaticas: las versiones de este repositorio no usan imatrix; para mayor calidad por tamano conviene evaluar las del repositorio `-i1-GGUF` del mismo autor.
- Modelo de nicho con muy poca traccion (23 descargas, 0 likes en el momento de la consulta): no hay comunidad, issues ni validacion externa que respalden su calidad.
- Fecha de actualizacion del repositorio (2026-11-10) posterior a la de creacion (2025-05-22): puede indicar reorganizacion de ficheros; conviene revisar el historial de commits antes de fijar una version.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma-3-starshine-12b-continued-GGUF
- Modelo base (safetensors): https://huggingface.co/ToastyPigeon/gemma-3-starshine-12b-continued
- Cuantizaciones con imatrix del mismo autor: https://huggingface.co/mradermacher/gemma-3-starshine-12b-continued-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-3-starshine-12b-continued-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
