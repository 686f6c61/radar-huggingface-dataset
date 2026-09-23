# amd/Qwen3.6-35B-A3B-w4a16-llmcompressor

## Resumen

Qwen3.6-35B-A3B-w4a16-llmcompressor es una version cuantizada del modelo Qwen/Qwen3.6-35B-A3B, publicada por AMD en HuggingFace. Se trata de una cuantizacion de solo pesos en 4 bits (W4A16) generada con LLM Compressor v0.12.0 mediante el algoritmo GPTQ y el formato compressed-tensors. El objetivo declarado es habilitar inferencia sobre CPU AMD EPYC con el stack ZenDNN, reduciendo el peso del modelo de 67,0 GiB en BF16 a 18,1 GiB en disco, lo que supone una reduccion de aproximadamente el 73 por ciento.

El modelo conserva la arquitectura original Qwen3_5MoeForConditionalGeneration, un transformer con mezcla de expertos (MoE) y atencion lineal en parte de sus capas, con 35.107.181.936 parametros totales. Es un modelo multimodal (image-text-to-text) porque mantiene la torre de vision, aunque la model card declara unicamente el idioma ingles y no documenta el resto de capacidades del modelo base. El repositorio ocupa 20,3 GB y se distribuye bajo licencia Apache 2.0.

Su relevancia es fundamentalmente de despliegue: es una de las pocas publicaciones que documenta de forma explicita un pipeline de cuantizacion GPTQ orientado a CPU de servidor AMD (EPYC) con vLLM y ZenDNN, incluyendo el script completo de cuantizacion, la receta de ignorados y los ajustes necesarios en config.json para que vLLM acepte el checkpoint multimodal. Esto lo convierte en una referencia practica para equipos que necesitan servir un MoE de 35B en infraestructura sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (transformer MoE con capas de atencion lineal y torre de vision) |
| Parametros totales | 35.107.181.936 (35,1 mil millones) |
| Parametros activos | no disponible (el nombre comercial A3B sugiere del orden de 3 mil millones, pero la model card no lo confirma) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16: INT4 simetrico, weight-only, group_size=128, actorder=static, almacenado como pack-quantized; activaciones en BF16 sin cuantizar |
| Idiomas soportados | en (ingles), segun los tags y la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con esquema compressed-tensors (pack-quantized); requiere transformers y vLLM con soporte de compressed-tensors |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Framework de cuantizacion | LLM Compressor v0.12.0, GPTQModifier con esquema W4A16 |
| Motor de inferencia recomendado | vLLM v0.28.0 |
| Hardware objetivo | CPU AMD EPYC; sistema operativo preferido Linux |
| Stack compatible | ZenDNN v6.1.0, ZenTorch v2.13.0.0, PyTorch v2.13.0.0 |
| Tamano en disco (pesos) | 18,1 GiB (frente a 67,0 GiB en BF16) |
| Tamano del repositorio | 20,3 GB |
| Capas mantenidas en BF16 | torre de vision (model.visual), router MoE (mlp.gate), shared_expert_gate, lm_head, embed_tokens y layer norms |

## Arquitectura y entrenamiento

No hay informacion sobre el entrenamiento del modelo base en la informacion proporcionada: la model card de esta publicacion solo documenta el proceso de cuantizacion, no los datos de preentrenamiento, el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO. Lo que si se detalla es la topologia relevante para la cuantizacion: el modelo combina 256 expertos enrutados, un experto compartido y proyecciones de atencion lineal, todos ellos cuantizados a INT4. La arquitectura se identifica como Qwen3_5MoeForConditionalGeneration y se carga con `AutoModelForImageTextToText`, lo que preserva `vision_config` y los identificadores de tokens de vision e imagen en el config final.

El proceso de cuantizacion es GPTQ de un solo paso (oneshot) sobre 128 ejemplos de HuggingFaceH4/ultrachat_200k con longitud maxima de secuencia 2048. GPTQ es un metodo dirigido por datos: construye las matrices de Hessian por capa a partir de activaciones reales para compensar el error de redondeo. La receta aplica `GPTQModifier(targets="Linear", scheme="W4A16")` con una lista explicita de exclusiones. Tres decisiones de diseno son especificas de este modelo: no se cuantiza el router MoE porque es un Linear diminuto cuyos logits determinan la asignacion de expertos y un token mal enrutado cuesta mas precision que los propios pesos en 4 bits; `shared_expert_gate` se omite porque tiene `out_features=1` y vLLM espera ahi un `.weight` denso en lugar de empaquetado; y la torre de vision se mantiene en BF16. El group_size de 128 es valido porque tanto el ancho oculto (2048) como el intermedio de los expertos MoE (512) son divisibles por 128. El script incluye ademas un parche posterior de `config.json` para reinyectar `architectures`, `model_type`, `text_config`, `vision_config` y los ids de tokens de vision, imagen y video; sin ese parche, el config se degrada a la variante solo texto y vLLM rechaza el checkpoint.

## Capacidades

- Generacion de texto y conversacion multi-turno, con pipeline declarado text-generation.
- Modalidad image-text-to-text: la torre de vision se conserva en BF16 y el config mantiene `vision_config`, token de inicio y fin de vision, token de imagen y token de video.
- Razonamiento experto mediante mezcla de expertos: 256 expertos enrutados mas un experto compartido.
- Procesamiento de contexto largo mediante capas de atencion lineal, segun la descripcion de las proyecciones de atencion lineal cuantizadas.
- Inferencia en CPU AMD EPYC optimizada con ZenDNN, orientada a despliegues sin GPU.
- Compatibilidad con vLLM v0.28.0 como servidor de inferencia.
- Capacidades de tool calling, function calling, agentes y modos de pensamiento (thinking): no disponible en la informacion proporcionada.
- Idiomas: unicamente ingles declarado; no disponible informacion sobre el resto de idiomas.
- Capacidades de audio: no disponible.

Nota: la model card de esta publicacion no describe las capacidades funcionales del modelo base, solo la receta de cuantizacion. Las capacidades reales dependen de Qwen/Qwen3.6-35B-A3B, cuyo detalle no forma parte de la informacion proporcionada.

## Casos de uso

- Servicio de LLM en CPU de servidor: el modelo esta disenado para inferencia sobre AMD EPYC con ZenDNN y vLLM, de modo que permite ofrecer un MoE de 35B en nodos sin acelerador grafico, reduciendo el coste por token en entornos donde la GPU no esta disponible.
- Sustitucion de un despliegue BF16 por restricciones de memoria: con 18,1 GiB de pesos frente a 67,0 GiB, un servidor con 32 GB de RAM puede alojar el modelo completo, algo imposible en la version sin cuantizar sin recurrir a swap o a multiples nodos.
- Procesamiento de documentos con componente visual: al conservar la torre de vision en BF16 y los tokens de imagen y video en el config, el modelo puede emplearse en pipelines de image-text-to-text, por ejemplo extraccion de informacion de capturas o documentos escaneados.
- Backend de chat conversacional: con el pipeline text-generation y la plantilla de chat del modelo base, es adecuado para asistentes multi-turno servidos a traves de la API compatible con OpenAI de vLLM.
- Inferencia por lotes offline: el formato pack-quantized y el soporte de vLLM permiten ejecutar tareas de generacion masiva (resumen, clasificacion, extraccion) en CPU con mayor densidad de modelos por nodo.
- Entornos de evaluacion y validacion de cuantizacion: el script completo incluido en la model card sirve como plantilla reproducible para cuantizar otros MoE de Qwen con GPTQ, ajustando la lista de capas ignoradas y el group_size.
- Despliegue en infraestructura AMD homogenea: los equipos que ya operan EPYC con ZenDNN pueden integrar el modelo sin cambiar de stack de aceleracion, aprovechando la compatibilidad declarada con PyTorch 2.13, ZenTorch 2.13 y vLLM 0.28.
- Prototipado con requisitos bajos de memoria: 20,3 GB de repositorio permiten descargar y probar el modelo en una estacion de trabajo con almacenamiento y RAM moderados antes de escalar a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, ni para el modelo cuantizado ni para el base. Tampoco se documenta la degradacion de precision introducida por la cuantizacion W4A16 mediante perplejidad o tasas de coincidencia respecto al modelo BF16. Los unicos datos cuantitativos disponibles son de tamano: 67,0 GiB a 18,1 GiB de pesos (reduccion de aproximadamente el 73 por ciento), 35.107.181.936 parametros totales y 20,3 GB de repositorio.

## Requisitos de hardware

- Memoria para inferencia en CPU: los pesos ocupan 18,1 GiB, por lo que se recomienda un minimo de 24 GB de RAM y de forma holgada 32 GB o mas para alojar pesos, cache KV y overhead del runtime.
- Memoria para inferencia en GPU: no es el escenario objetivo declarado, pero los 18,1 GiB de pesos exigen al menos 24 GB de VRAM si se intenta servir en GPU, sin contar la cache KV; no disponible confirmacion de que vLLM ejecute esta receta en CUDA.
- GPU recomendadas: no disponible. La model card declara como hardware soportado CPU AMD EPYC y no lista GPU.
- CPU objetivo: AMD EPYC con ZenDNN v6.1.0 y ZenTorch v2.13.0.0 sobre Linux.
- Compatibilidad con GPU de consumo: no confirmada. Por tamano, el checkpoint no cabe en GPUs de 8, 12 o 16 GB; en GPUs de 24 GB seria muy ajustado y no esta validado por el autor.
- Opciones de despliegue: vLLM v0.28.0 es el motor recomendado; la carga del modelo requiere transformers con soporte de compressed-tensors. No se mencionan llama.cpp, Ollama, TGI ni otras alternativas, y el formato pack-quantized de compressed-tensors no es directamente compatible con GGUF.
- Latencia y throughput: no disponible. La model card no publica medidas de tokens por segundo ni de latencia por peticion.
- Software requerido: PyTorch 2.13.0.0, LLM Compressor v0.12.0, ZenDNN v6.1.0, ZenTorch v2.13.0.0, Linux como sistema operativo preferido.

## Comparativa con modelos similares

| Modelo | Parametros totales | Formato y cuantizacion | Tamano de pesos | Contexto | Licencia | Hardware objetivo |
|---|---|---|---|---|---|---|
| amd/Qwen3.6-35B-A3B-w4a16-llmcompressor | 35.107.181.936 | safetensors compressed-tensors, W4A16 INT4 group_size 128 | 18,1 GiB | no disponible | apache-2.0 | CPU AMD EPYC con ZenDNN |
| Qwen/Qwen3.6-35B-A3B | 35.107.181.936 | safetensors BF16 | 67,0 GiB | no disponible | no disponible en la informacion proporcionada | GPU o CPU con memoria suficiente |
| Otras cuantizaciones de Qwen3.6-35B-A3B (AWQ, GPTQ generico, GGUF) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion disponible se limita a la pareja formada por el modelo base y esta cuantizacion, ya que la informacion proporcionada no incluye datos de otras alternativas cuantizadas del mismo modelo ni de modelos de tamano comparable. La diferencia medible es exclusivamente de huella: 18,1 GiB frente a 67,0 GiB de pesos, con las activaciones y varias capas criticas (torre de vision, router MoE, embeddings y lm_head) mantenidas en BF16. No hay datos de rendimiento que permitan comparar calidad entre ambas versiones.

## Limitaciones y advertencias

- No se documenta la perdida de precision introducida por la cuantizacion W4A16; es esperable una degradacion respecto al modelo BF16, pero su magnitud no esta cuantificada en la informacion disponible.
- La calibracion se realizo con solo 128 ejemplos de HuggingFaceH4/ultrachat_200k a 2048 tokens, un conjunto de caracter conversacional y en ingles; dominios alejados de ese registro pueden sufrir una perdida de precision mayor.
- La model card declara unicamente el idioma ingles. No hay informacion sobre comportamiento en castellano u otros idiomas, aunque el modelo base pueda ser multilingue.
- Riesgo de alucinacion: no disponible informacion especifica; se aplica el riesgo generico de los modelos de lenguaje, no mitigado por esta publicacion.
- Sesgos: no disponible. No se ha publicado ninguna evaluacion de sesgos para esta cuantizacion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base debe verificarse de forma independiente, ya que no se detalla en la informacion proporcionada.
- Dependencia fuerte del stack: requiere vLLM v0.28.0 o superior, compressed-tensors y, para el rendimiento pretendido, ZenDNN sobre AMD EPYC con Linux. Fuera de ese entorno el modelo puede cargar pero no aprovechar las optimizaciones previstas.
- El checkpoint necesita un parche manual de config.json para que vLLM no lo degrade a la variante solo texto; omitir ese paso provoca el rechazo del checkpoint.
- El formato pack-quantized de compressed-tensors no es portable a llama.cpp u Ollama en formato GGUF sin una conversion adicional no documentada aqui.
- El repositorio presenta cero descargas y cero likes en el momento de la consulta, por lo que no existe validacion de la comunidad sobre su comportamiento en produccion.
- No hay informacion sobre longitud de contexto soportada, parametros activos reales ni capacidades de tool calling o agentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amd/Qwen3.6-35B-A3B-w4a16-llmcompressor
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Dataset de calibracion: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Documentacion de vLLM: https://docs.vllm.ai/en/latest/
- Repositorio de LLM Compressor: https://github.com/vllm-project/llm-compressor
- Pagina corporativa de AMD: https://www.amd.com/en.html

Nota sobre la busqueda web: los resultados obtenidos corresponden unicamente a paginas corporativas y genericas de AMD (amd.com/en.html, amd.com/fr.html, la entrada de Wikipedia en ingles y en frances sobre Advanced Micro Devices, y una pagina de descarga de controladores de TechSpot). Ninguno de estos enlaces aporta informacion tecnica sobre el modelo, su cuantizacion o sus benchmarks, por lo que no se incluyen como fuentes relevantes. No se han encontrado papers, blogs tecnicos ni demos asociados a esta publicacion.
