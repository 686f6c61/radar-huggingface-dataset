# ShayonSarker/SmolLM2-360M-GGUF

## Resumen

Este repositorio contiene una conversion a formato GGUF del modelo base SmolLM2-360M, publicada por el usuario ShayonSarker. Se trata de una cuantizacion reproducible pensada para su uso con llama.cpp y herramientas compatibles (Ollama, LM Studio, llama-cpp-python), no de un modelo nuevo ni de un ajuste fino. El modelo de origen es HuggingFaceTB/SmolLM2-360M, un transformer decoder-only de 361.821.120 parametros (aproximadamente 362M) con una ventana de contexto de 8.192 tokens segun la model card del repositorio.

El valor practico de esta publicacion esta en el empaquetado: ofrece tres niveles de cuantizacion (F16, Q8_0 y Q4_K_M) con una validacion de perplejidad sobre WikiText-2 y un script de construccion que fija el commit de llama.cpp y la revision del modelo original, lo que permite reproducir la conversion bit a bit. Para quien necesita ejecutar un modelo de lenguaje en hardware muy modesto (CPU, portatiles, Raspberry Pi o GPUs de gama baja) sin depender de pesos sin cuantizar, esta es una via directa.

Es importante subrayar que se trata del modelo **base** preentrenado, no de la variante instruida SmolLM2-360M-Instruct. No incorpora plantilla de chat, no ha pasado por RLHF ni DPO en esta distribucion y su comportamiento por defecto es el de continuacion de texto. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no esta respaldado oficialmente por HuggingFaceTB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura heredada de HuggingFaceTB/SmolLM2-360M); numero de capas, dimension oculta y cabezas no disponibles en la informacion proporcionada |
| Parametros totales | 361.821.120 (aproximadamente 362M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens segun la model card del repositorio; una fuente de terceros (localmodel.run) menciona 128k, dato no confirmado por el autor |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | HuggingFaceTB/SmolLM2-360M |
| Tamano del repositorio | 1.4 GB |
| Libreria declarada | transformers |
| Pipeline | text-generation |
| Commit de llama.cpp fijado | 6b790a9c291b5d7af3312bbf9f0c558aa023b13e |
| Fecha de publicacion (metadatos HF) | 2026-09-25 |

## Arquitectura y entrenamiento

La ficha disponible no documenta el entrenamiento del modelo: toda la informacion tecnica de esta publicacion corresponde al proceso de conversion y cuantizacion, no a la fase de preentrenamiento. El modelo de origen pertenece a la familia SmolLM2, descrita en fuentes de terceros como un conjunto de modelos compactos de 135M, 360M y 1.7B parametros, disenados para ejecucion en dispositivo y con mejoras respecto a SmolLM1 en seguimiento de instrucciones, conocimiento y razonamiento. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO aplicadas al modelo base.

La innovacion tecnica de este repositorio es de ingenieria de empaquetado: el script `build_gguf.py` fija tanto la revision del modelo upstream como un commit concreto de llama.cpp, de modo que la conversion es determinista y auditable. El autor valida el resultado con una evaluacion de perplejidad sobre el conjunto de test raw de WikiText-2 (8 fragmentos de 512 tokens) y una prueba de humo de generacion determinista con la cuantizacion Q4_K_M. No se describen tecnicas de atencion alternativa, decodificacion especulativa ni modificaciones arquitectonicas sobre el modelo original.

## Capacidades

- Generacion de texto autoregresiva: es la funcion principal del modelo, orientada a continuacion de texto a partir de un prefijo.
- Modelado de lenguaje y puntuacion de secuencias: util para calcular perplejidad, verosimilitud de frases y filtrado de corpus.
- Razonamiento basico y conocimiento general limitado por su tamano (362M parametros); no hay evaluaciones publicadas en esta ficha que cuantifiquen estas capacidades.
- Capacidad multilingue: no disponible; no se declara lista de idiomas y los materiales consultados lo describen implicitamente como orientado al ingles.
- Tool calling / function calling: no soportado de forma nativa. Es un modelo base sin plantilla de chat ni formato de herramientas.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision, audio o cualquier otra modalidad: no soportado, es un modelo exclusivamente de texto.
- Uso como base para ajuste fino: si, es la via habitual para dotarlo de capacidades conversacionales o de dominio, tal como ilustra el fine-tune de terceros SmolLM2-360M-NPC-Roleplay.
- Ejecucion en CPU y en dispositivos de bajos recursos mediante las cuantizaciones GGUF incluidas.
- Compatibilidad con el ecosistema llama.cpp: llama-cli, llama-server, llama-cpp-python, Ollama, LM Studio y bindings equivalentes.

## Casos de uso

- Generacion de texto y autocompletado en local: el modelo puede ejecutarse integramente en CPU con la cuantizacion Q4_K_M (aproximadamente 0,2-0,25 GB de pesos) para funciones de autocompletado, redaccion asistida o continuacion de parrafos en editores y herramientas de escritorio sin conexion.
- Puntuacion y filtrado de corpus: su naturaleza de modelo base permite calcular la log-verosimilitud de secuencias para descartar texto de baja calidad, detectar dominios o deduplicar datasets. La validacion de perplejidad incluida en el repositorio demuestra que este uso es directamente medible y reproducible.
- Clasificacion por continuacion (zero-shot): planteando tareas de etiquetado como continuaciones de texto (por ejemplo, "Resena: ... Sentimiento:"), se puede construir un clasificador ligero sin fine-tuning, adecuado cuando no hay presupuesto de GPU.
- Base para ajuste fino con LoRA o SFT: 362M parametros caben comodamente en una unica GPU consumer para entrenamiento con LoRA. El fine-tune de terceros SmolLM2-360M-NPC-Roleplay-GGUF sobre NPC-Dialogue_v2 demuestra que el camino es viable para dominios concretos como dialogos de personajes o atencion al cliente.
- Prototipado de pipelines de generacion: sirve para validar plantillas de prompt, estrategias de muestreo, integracion con llama.cpp y latencias reales antes de migrar a modelos mayores, reduciendo el coste de iteracion.
- Despliegue en dispositivos embebidos y educacion: al ocupar menos de 1 GB incluso en F16, es adecuado para demos de inferencia en Raspberry Pi, telefono o portatil modesto, y para material docente sobre cuantizacion y decodificacion autoregresiva.
- Evaluacion de tecnicas de cuantizacion: el repositorio publica tres formatos con su perplejidad asociada (F16 12,9369; Q8_0 12,9416; Q4_K_M 13,2124), lo que lo convierte en un banco de pruebas util para medir el impacto de la cuantizacion en tareas reales de un pipeline propio.
- Generacion de datos sinteticos de bajo coste: para aumentar corpus en tareas de NLP clasico cuando la calidad exigida es moderada y el volumen necesario alto.

## Benchmarks y rendimiento

El unico dato de evaluacion publicado en la informacion disponible es la perplejidad sobre WikiText-2 raw test (8 fragmentos de 512 tokens), medida por el autor de la conversion:

| Formato | Perplejidad (PPL) | Ratio respecto a F16 |
|---|---:|---:|
| F16 | 12,9369 | linea base |
| Q8_0 | 12,9416 | 1,0004 |
| Q4_K_M | 13,2124 | 1,0213 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ARC, HellaSwag u otros) en la informacion disponible. Tampoco se proporcionan mediciones de throughput en tokens por segundo para esta conversion concreta.

## Requisitos de hardware

- Peso de los pesos (estimado a partir de los 361.821.120 parametros): F16 alrededor de 0,72 GB; Q8_0 alrededor de 0,39 GB; Q4_K_M alrededor de 0,21-0,25 GB. Las cifras de Q8_0 coinciden con la referencia de terceros que cita 0,39 GB como la cuantizacion mas pequena listada.
- VRAM minima: por debajo de 1 GB para Q4_K_M y Q8_0. Cabe en practicamente cualquier GPU consumer de los ultimos diez anos (GTX 1050, MX150, RTX 3050, RTX 4090, A100, H100) y funciona tambien sin GPU.
- Inferencia en CPU: totalmente viable con llama.cpp; el cuello de botella pasa a ser la memoria del sistema y el ancho de banda de la RAM, no el modelo.
- Consumo de memoria segun contexto: una fuente de terceros (localmodel.run) estima aproximadamente 1,2 GB con 4k de contexto y 5,7 GB con 128k, aunque el modelo card fija la ventana en 8.192 tokens. No hay cifras publicadas para 8k en la informacion disponible.
- Penalizacion por contexto largo: la misma fuente indica que a 128k de contexto la generacion cae hasta aproximadamente el 6% de la velocidad obtenida con contexto corto, porque cada token relee la cache KV completa. Este dato no esta confirmado por el autor de la conversion.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, llama-cpp-python, Jan y cualquier runtime compatible con GGUF. Para vLLM, SGLang o MLX, los materiales de terceros los citan para el modelo base en safetensors; el soporte de GGUF en vLLM es experimental, por lo que en produccion conviene evaluarlo antes de adoptarlo.
- Latencia y throughput: no disponibles para esta conversion. El unico dato indirecto es la comparativa relativa de velocidad con contexto largo mencionada arriba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ShayonSarker/SmolLM2-360M-GGUF (este repositorio) | 362M | 8.192 tokens (segun model card) | Apache-2.0 | GGUF: F16, Q8_0, Q4_K_M | PPL WikiText-2: 12,9369 / 12,9416 / 13,2124. Build reproducible con commit de llama.cpp fijado |
| HuggingFaceTB/SmolLM2-360M (upstream) | 362M | 8.192 tokens | Apache-2.0 | safetensors | Modelo fuente sin cuantizar; referencia para comparar la perdida introducida por la cuantizacion |
| QuantFactory/SmolLM2-360M-GGUF | 362M | no disponible | Apache-2.0 | GGUF | Conversion alternativa del mismo modelo base; niveles de cuantizacion no detallados en la informacion consultada |
| mradermacher/SmolLM2-360M-NPC-Roleplay-GGUF | 362M | no disponible | Apache-2.0 | GGUF | Fine-tune con LoRA/SFT sobre chimbiwide/NPC-Dialogue_v2, orientado a roleplay de personajes; categoria distinta (modelo ajustado, no base) |

No se dispone de datos comparativos de otras familias de tamano similar (por ejemplo Qwen2.5-0.5B o TinyLlama-1.1B) en la informacion proporcionada, por lo que no se incluyen cifras de rendimiento frente a ellas.

## Limitaciones y advertencias

- Es un modelo base, no instruido: no incluye plantilla de chat ni alineacion mediante RLHF o DPO. Usarlo en un asistente conversacional sin ajuste previo producira respuestas incoherentes con el formato esperado.
- Riesgo elevado de alucinacion: al ser un modelo de continuacion de texto, tiende a generar continuaciones plausibles aunque sean factualmente falsas. No debe usarse como fuente de informacion sin verificacion externa.
- Sesgos: no hay informacion sobre la composicion del dataset de preentrenamiento ni evaluaciones de sesgo en esta ficha. Deben asumirse los sesgos tipicos de los corpus web en ingles.
- Idiomas: la lista de idiomas soportados no esta disponible; el rendimiento fuera del ingles es incierto y previsiblemente pobre.
- Conflicto de datos sobre el contexto: la model card indica 8.192 tokens, mientras que una fuente de terceros menciona 128k. Se debe verificar empiricamente antes de disenar un pipeline que dependa de contextos largos.
- Cuantizacion con perdida: Q4_K_M incrementa la perplejidad un 2,13% respecto a F16. Para tareas sensibles a la precision conviene usar Q8_0 o F16.
- Repositorio sin traccion ni validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, y no esta respaldado por HuggingFaceTB. Para produccion, es mas prudente usar el modelo upstream en safetensors o una conversion verificada.
- Licencia Apache-2.0: permite uso comercial y modificacion, siempre que se conserve la atribucion y el aviso de licencia. La licencia del modelo de origen es la misma, por lo que no hay restricciones adicionales conocidas.
- Metadatos con fecha futura: los campos de creacion y actualizacion del repositorio indican 2026, lo que sugiere un artefacto de los metadatos de la plataforma y no debe tomarse como referencia temporal fiable.
- Sin soporte nativo de tool calling ni de agentes: cualquier uso agentico requiere envoltorios externos de prompt engineering y parsers propios, con la fiabilidad limitada que impone un modelo de 362M parametros.
- Sin garantias de mantenimiento: el autor no se compromete a actualizar la conversion ante nuevas versiones de llama.cpp o del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ShayonSarker/SmolLM2-360M-GGUF
- Modelo base (upstream): https://huggingface.co/HuggingFaceTB/SmolLM2-360M
- Repositorio de construccion en GitHub: https://github.com/Dadhichi-Sarker-Shayon/SmolLM2-360M-GGUF
- Conversion alternativa del mismo modelo: https://inferix.co/models/QuantFactory/SmolLM2-360M-GGUF
- Fine-tune de terceros orientado a roleplay: https://huggingface.co/mradermacher/SmolLM2-360M-NPC-Roleplay-GGUF
- Guia de autoalojamiento y despliegue del modelo base: https://llmapi.ai/models/huggingfacetb-smollm2-360m/
- Estimaciones de tamano GGUF, RAM y VRAM: https://localmodel.run/model/smollm2-360m
