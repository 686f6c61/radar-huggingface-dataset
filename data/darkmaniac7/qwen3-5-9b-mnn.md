# darkmaniac7/Qwen3.5-9B-MNN

## Resumen

Qwen3.5-9B-MNN es una conversion al formato MNN (Mobile Neural Network, de Alibaba) del modelo Qwen/Qwen3.5-9B, publicada por el usuario darkmaniac7 como espejo del repositorio oficial taobao-mnn/Qwen3.5-9B-MNN. El objetivo es ejecutar un modelo de ~9.000 millones de parametros en dispositivos moviles y CPUs sin GPU dedicada, algo que el formato original (safetensors) no permite de forma directa. La relevancia actual esta en el despliegue on-device: inferencia local, sin conexion y sin enviar datos a un servidor.

El repositorio reproduce byte a byte (mismos sha256) los ficheros del mirror de taobao-mnn y anade un cabezal opcional de prediccion multi-token (MTP) exportado con la herramienta MNN-TokForge. Este cabezal habilita decodificacion especulativa con profundidad 1 sobre la ruta de CPU de MNN, manteniendo el tronco sin modificar: el tronco verifica cada token propuesto, por lo que la calidad de salida es la del propio tronco. El autor reporta tasas de aceptacion de borradores del 94% en RAG, 85% en codigo, 61% en chat y 55% en consultas de asesoramiento, medidas solo en host.

El paquete incluye ademas un componente visual (visual.mnn y visual.mnn.weight, 259 MB), lo que indica que la conversion conserva capacidad multimodal de imagen. El repositorio ocupa 7,5 GB y se distribuye bajo licencia Apache-2.0, la misma del modelo base y de la conversion original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3.5-9B) con componente visual; conversion a MNN. No se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 9B nominales (segun la denominacion del modelo base Qwen/Qwen3.5-9B); el recuento exacto no esta disponible |
| Parametros activos | No aplica: la informacion disponible no describe una arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits con bloque de 64 (`quant_bit 4 --quant_block 64`) confirmado para el cabezal MTP de 32k; el esquema exacto del tronco no se detalla. Los embeddings se distribuyen en bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MNN: `llm.mnn`, `llm.mnn.weight`, `llm.mnn.json`, `llm_config.json`, `embeddings_bf16.bin`, `tokenizer.txt`, `visual.mnn`, `visual.mnn.weight`; cabezal MTP en `mtp-v32k.mnn`, `mtp-v32k.mnn.weight`, `mtp-v32k.mnn.vocab` |

## Arquitectura y entrenamiento

El modelo es una conversion, no un entrenamiento nuevo. La model card no aporta informacion sobre el entrenamiento del modelo base Qwen/Qwen3.5-9B (numero de tokens, composicion del dataset, uso de RLHF o DPO): esos datos no estan disponibles en la informacion proporcionada. Lo unico documentado es el proceso de exportacion: el tronco se corresponde con el mirror de taobao-mnn en el commit `149e1e052267ffa377b87e3bb0ddb75f46217a9a`, y el cabezal MTP se exporto desde Qwen/Qwen3.5-9B en el commit `c202236235762e1c871ad0ccb60c8ee5ba337b9a` mediante `llmexport --mtp --mtp_only --quant_bit 4 --quant_block 64`.

La innovacion tecnica destacable es el cabezal de prediccion multi-token (MTP) para decodificacion especulativa. Se carga declarando `speculative_type: "mtp"`, `mtp_model: "mtp-v32k.mnn"` y `draft_predict_length: 1`, con un vocabulario borrador de 32k tokens en formato int32 (`mtp-v32k.mnn.vocab`). El borrador propone tokens y el tronco los verifica uno a uno, de modo que la salida final no se degrada respecto al tronco sin MTP. La aceptacion de borradores se ha medido unicamente en host, y TokForge la comprueba por telefono antes de activarla.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen/Qwen3.5-9B.
- Procesamiento de imagenes: el paquete incluye el grafo y los pesos del codificador visual (`visual.mnn`, 547.632 bytes, y `visual.mnn.weight`, 258.831.244 bytes).
- Decodificacion especulativa mediante cabezal MTP opcional, con profundidad de borrador 1 y verificacion por el tronco.
- Inferencia en CPU y en dispositivo, sin necesidad de GPU, gracias al runtime MNN.
- Rendimiento diferencial por tarea en el modo MTP: la tasa de aceptacion de borradores varia de forma marcada segun el tipo de consulta (94% en RAG frente a 55% en asesoramiento), lo que sugiere un comportamiento irregular segun el dominio.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso explicito: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.
- Modo thinking o modos de razonamiento diferenciados: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional totalmente offline en movil: al estar empaquetado en MNN, el modelo puede ejecutarse en la CPU del terminal sin enviar texto del usuario a ningun servidor, lo que resulta adecuado para aplicaciones de mensajeria, notas o diario personal donde la privacidad es un requisito duro.
- Descripcion y analisis de imagenes en el dispositivo: la presencia de `visual.mnn` permite tareas de comprension de imagen (etiquetado, descripcion de fotografias, extraccion de texto de capturas) sin subir la imagen a la nube, util en apps de galeria o escaneo de documentos.
- RAG local sobre documentacion corporativa: es el escenario con mayor tasa de aceptacion de borradores MTP reportada (94%), por lo que encaja bien en un pipeline de recuperacion aumentada donde el modelo responde a preguntas sobre un corpus fijo y repetitivo en formato.
- Autocompletado de codigo en entornos sin conexion: con un 85% de aceptacion de borradores en la prueba de codigo, el cabezal MTP resulta especialmente rentable en este dominio, lo que permite integrarlo en editores o terminales de campo sin acceso a red.
- Asistente de campo para tecnicos y personal movil: consultas de procedimiento y comprobaciones puntuales en zonas sin cobertura. Conviene tener en cuenta que la tasa de aceptacion en asesoramiento fue la mas baja (55%), por lo que la aceleracion por MTP sera menor en este tipo de consultas largas y abiertas.
- Chat de proposito general con latencia reducida en CPU: con un 61% de aceptacion en conversacion, el modo especulativo aporta una mejora moderada sin alterar la calidad de salida, ya que el tronco verifica cada token.
- Prototipado de despliegue en CPU sin GPU: el formato MNN permite validar el comportamiento del modelo base en hardware modesto antes de decidir una inversion en infraestructura de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento documentado son las tasas de aceptacion de borradores del cabezal MTP, medidas en host (no en dispositivo):

| Tarea | Borradores aceptados (profundidad 1) |
|---|---|
| RAG | 94% |
| Codigo | 85% |
| Chat | 61% |
| Asesoramiento | 55% |

No se dispone de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar para este modelo o su base en la informacion proporcionada.

## Requisitos de hardware

- Huella en disco del repositorio: 7,5 GB, repartidos entre el tronco cuantizado (`llm.mnn.weight`, 4.961.957.226 bytes), los embeddings en bf16 (`embeddings_bf16.bin`, 2.034.237.440 bytes) y el codificador visual (`visual.mnn.weight`, 258.831.244 bytes).
- Memoria estimada en ejecucion: en torno a 7,5-9 GB considerando los pesos, los embeddings y el overhead del runtime y de la cache KV. Es una estimacion derivada de los tamanos de fichero, no un dato publicado.
- No cabe en GPUs consumer de 8 GB de VRAM sin offload. En tarjetas de 24 GB (RTX 3090, RTX 4090) habria margen de sobra, aunque el objetivo declarado del formato MNN es la ejecucion en CPU y dispositivo, no en GPU.
- En movil, el requisito practico es un terminal con 8-12 GB de RAM o superior. No se publica una lista oficial de dispositivos compatibles.
- Cabezal MTP: anade 236.794.054 bytes de pesos mas un vocabulario de 132.160 bytes, un coste marginal frente al tronco.
- Opciones de despliegue: runtime MNN y MNN-TokForge, que es el camino soportado. vLLM, llama.cpp, TGI y Ollama no cargan pesos en formato MNN de forma nativa; para usarlos habria que reconvertir desde Qwen/Qwen3.5-9B.
- Latencia y throughput: no disponibles. La unica referencia cuantitativa es que `draft_predict_length` esta fijado a 1, es decir, se propone un unico token por paso especulativo.

## Comparativa con modelos similares

La informacion disponible no permite comparar con modelos de terceros de la misma categoria, ya que no se aportan especificaciones ni resultados del modelo base. La comparacion factible es con el propio linaje del repositorio:

| Modelo | Formato | Tamano | Licencia | Relacion |
|---|---|---|---|---|
| darkmaniac7/Qwen3.5-9B-MNN | MNN | 7,5 GB de repositorio | Apache-2.0 | Este repositorio; mirror del de taobao-mnn mas cabezal MTP opcional |
| taobao-mnn/Qwen3.5-9B-MNN | MNN | No disponible | Apache-2.0 (segun el autor del mirror) | Origen byte a byte del tronco (commit `149e1e0522`) |
| Qwen/Qwen3.5-9B | No disponible | 9B nominales | No disponible | Modelo base; origen del cabezal MTP (commit `c2022362`) |

No se dispone de datos de contexto, rendimiento ni licencia del modelo base en la informacion proporcionada.

## Limitaciones y advertencias

- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia (2026-10-10). No hay evidencia de uso en produccion ni validacion por terceros.
- Es un mirror de terceros, no una publicacion oficial. Aunque el autor afirma que los ficheros del tronco son identicos byte a byte al original y proporciona los sha256, la verificacion queda en manos del usuario.
- El cabezal MTP ha sido validado solo en host. El propio autor indica que TokForge comprueba la aceptacion por telefono antes de activarla, lo que implica que el rendimiento en dispositivo puede diferir del reportado.
- Rendimiento muy irregular segun la tarea: la aceptacion de borradores cae del 94% en RAG al 55% en asesoramiento, de modo que la ganancia de velocidad por decodificacion especulativa no es uniforme.
- No se documentan sesgos conocidos, riesgo de alucinacion, limitaciones de contexto ni cobertura idiomatica del modelo base en la informacion proporcionada.
- La longitud de contexto no esta documentada, lo que impide dimensionar la cache KV y planificar despliegues con conversaciones o documentos largos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el usuario debe verificar que la licencia del modelo base Qwen/Qwen3.5-9B sea compatible, dato que no se aporta.
- Dependencia fuerte del runtime MNN: la integracion en stacks habituales de servidor (vLLM, TGI) requeriria una reconversion a partir del modelo base, no de estos pesos.
- La busqueda web realizada no devolvio ningun resultado relacionado con el modelo: los enlaces recuperados eran contenidos no pertinentes. Por tanto no hay documentacion externa, articulos ni discusiones tecnicas que respalden la ficha mas alla de la propia model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darkmaniac7/Qwen3.5-9B-MNN
- Repositorio de origen del tronco (taobao-mnn): https://huggingface.co/taobao-mnn/Qwen3.5-9B-MNN
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Commits citados en la model card: `149e1e052267ffa377b87e3bb0ddb75f46217a9a` (taobao-mnn) y `c202236235762e1c871ad0ccb60c8ee5ba337b9a` (Qwen)
- Papers, blogs, repositorios o demos adicionales: no disponible. La busqueda web no devolvio resultados relevantes.
