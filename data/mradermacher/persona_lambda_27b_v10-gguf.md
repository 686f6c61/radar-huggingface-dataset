# mradermacher/persona_lambda_27b_v10-GGUF

## Resumen

persona_lambda_27b_v10-GGUF es la version cuantizada en formato GGUF del modelo eousphoros/persona_lambda_27b_v10, un modelo de lenguaje de 27.320.697.856 parametros (aproximadamente 27,3 mil millones) etiquetado por su autor como experimental y orientado a casos de uso conversacionales con "persona". La cuantizacion la ha realizado mradermacher, un actor conocido en el ecosistema por publicar versiones GGUF de modelos abiertos para su uso con llama.cpp y herramientas compatibles.

El modelo base esta pensado para generacion de texto conversacional en ingles y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de las de dicha licencia. La model card del repositorio cuantizado es puramente tecnica (generada por el pipeline de mradermacher) y no aporta informacion sobre arquitectura interna, datos de entrenamiento o proceso de alineamiento; el autor del modelo base no ha publicado, en la informacion disponible, detalles sobre estos aspectos.

La relevancia de esta publicacion es fundamentalmente practica: permite ejecutar un modelo de 27B en hardware de consumo o en servidores sin GPU de gama alta mediante cuantizacion GGUF, con variantes que van desde Q2_K (11,0 GB) hasta Q4_K_S (15,9 GB) y complementos multimodales (mmproj) en Q8_0 y f16. Al tratarse de un modelo experimental y con cero descargas en el momento de la ficha, debe evaluarse con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer, inferido por el pipeline transformers; no confirmado en la model card) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16; complementos multimodales mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con f16 disponible entre las variantes listadas); modelo base en safetensors |
| Tamano del repo | 28,2 GB |
| Modelo base | eousphoros/persona_lambda_27b_v10 |
| Cuantizador | mradermacher |
| Etiquetas | experimental, persona, conversational, endpoints_compatible |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por el pipeline declarado (transformers) y el tamano (27,3B parametros), se trata presumiblemente de un transformer decoder-only, pero la model card no confirma ni el tipo de atencion, ni el numero de capas, ni la dimension oculta. Tampoco se especifica si emplea tecnicas como atencion lineal, mezcla de expertos o decodificacion especulativa.

Respecto al entrenamiento, la informacion disponible no detalla el numero de tokens, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o fine-tuning supervisado. La etiqueta "persona" sugiere un ajuste orientado a mantener un estilo o rol conversacional concreto, y la etiqueta "experimental" indica que el autor no lo presenta como un modelo listo para produccion. El proceso de cuantizacion realizado por mradermacher es estatico (quantize_version: 2, output_tensor_quantised: 1, convert_type: hf) y no incluye, segun la propia model card, cuantizaciones ponderadas o con imatrix en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en mantener una "persona" coherente a lo largo del dialogo.
- Soporte multimodal: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que indica capacidad de procesar entradas visuales junto con texto cuando se usa con un runtime compatible (por ejemplo, llama.cpp con soporte de vision).
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere que puede servirse a traves de APIs compatibles con el formato de Hugging Face.
- No se documentan capacidades especificas de tool calling, function calling, razonamiento multi-paso, agentes, matematicas o generacion de codigo en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun el campo language de la model card.

## Casos de uso

- Prototipado de asistentes conversacionales con personalidad definida: el modelo puede desplegarse con llama.cpp u Ollama para experimentar con dialogos multi-turno donde la coherencia de rol sea prioritaria, gracias a su ajuste etiquetado como "persona".
- Evaluacion de modelos de 27B en hardware de consumo: las variantes Q4_K_S (15,9 GB) y Q2_K (11,0 GB) permiten probar el modelo en GPUs con 16-24 GB de VRAM o incluso en configuraciones con offloading a CPU, lo que facilita la comparacion con otros modelos del mismo tamano sin necesidad de infraestructura dedicada.
- Experimentacion multimodal en local: los ficheros mmproj permiten combinar el modelo con un proyector visual en llama.cpp para tareas de descripcion de imagenes o respuesta a preguntas sobre imagenes, aunque la falta de documentacion sobre el entrenamiento multimodal exige validacion empirica previa.
- Generacion de dialogos sinteticos para aumentacion de datos: en un entorno controlado, el modelo puede producir conversaciones en ingles con un estilo consistente para alimentar pipelines de entrenamiento o evaluacion, siempre que se revise la calidad y se filtren sesgos.
- Investigacion sobre comportamiento de "persona" en LLMs: al ser un modelo experimental, resulta util para estudiar como el ajuste de personalidad afecta a la coherencia, la deriva de rol y la seguridad en conversaciones largas.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite integrar el modelo en productos comerciales internos o de cliente, siempre que se asuman las limitaciones de un modelo experimental y se realice una evaluacion de riesgos adecuada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion): Q2_K en torno a 11,0 GB de pesos mas overhead de contexto; Q4_K_S en torno a 15,9 GB; Q8_0 y f16 requieren bastante mas (no se detalla el tamano exacto de estas variantes en la informacion disponible, pero f16 de 27B suele rondar los 54 GB).
- GPU recomendadas: para Q4_K_S, una RTX 4090 (24 GB) o A100 40 GB permiten cargar el modelo completo en VRAM; para Q2_K, una RTX 4080/4090 o una A6000 son suficientes. En H100 (80 GB) cabe sin problema en f16.
- Cabe en GPU de consumo: si, en configuraciones de 16-24 GB con cuantizaciones Q2_K a Q4_K_S; en GPUs de 8-12 GB sera necesario offloading parcial a CPU o usar Q2_K con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). Para el modelo base en safetensors, vLLM o TGI si la arquitectura es compatible (no confirmado).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| persona_lambda_27b_v10-GGUF (este) | 27,3B | no disponible | Apache 2.0 | GGUF | Experimental, orientado a persona, multimodal via mmproj |
| mradermacher/Piccolo-27B-VL-GGUF | 27B | no disponible | no disponible en la busqueda | GGUF | Modelo vision-lenguaje de 27B cuantizado por el mismo autor |
| Modelos genericos de ~27B (p. ej. familias tipo Gemma o Qwen de ese rango) | ~27B | variable | variable | safetensors/GGUF | No se dispone de datos concretos en la informacion proporcionada; la comparacion directa no esta disponible |

La comparacion cuantitativa con alternativas no es posible con los datos disponibles: no hay benchmarks publicados para este modelo ni se han encontrado resultados de Piccolo-27B-VL en la busqueda web realizada.

## Limitaciones y advertencias

- Modelo etiquetado como experimental: no hay garantias de calidad, estabilidad ni seguridad para uso en produccion.
- Cero descargas y cero likes en el momento de la ficha: no existe validacion comunitaria que respalde su comportamiento.
- Ausencia total de informacion sobre datos de entrenamiento, alineamiento y evaluacion: no se puede descartar la presencia de sesgos, contenido toxico o comportamientos no deseados.
- Riesgo de alucinacion no cuantificado: al no haber benchmarks ni evaluaciones publicadas, no es posible estimar la tasa de errores factuales.
- Limitacion idiomatica: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran ventanas largas sin una prueba empirica previa.
- La licencia Apache 2.0 permite uso comercial, pero el estado experimental del modelo traslada al integrador toda la responsabilidad sobre el comportamiento en produccion.
- Las capacidades multimodales dependen de los ficheros mmproj y de un runtime con soporte de vision; no hay documentacion sobre la calidad o el alcance de dicha capacidad.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; se recomienda validar con Q4_K_S o superior antes de sacar conclusiones.

## Enlaces

- Repositorio Hugging Face del modelo cuantizado: https://huggingface.co/mradermacher/persona_lambda_27b_v10-GGUF
- Modelo base: https://huggingface.co/eousphoros/persona_lambda_27b_v10
- Pagina de descargas del cuantizador para este modelo: https://hf.tst.eu/model#persona_lambda_27b_v10-GGUF
- Perfil del cuantizador en Hugging Face: https://huggingface.co/mradermacher
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke referenciado por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- Modelo comparable cuantizado por el mismo autor (Piccolo-27B-VL-GGUF): https://huggingface.co/mradermacher/Piccolo-27B-VL-GGUF
