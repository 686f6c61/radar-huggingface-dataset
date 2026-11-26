# Rheechan/kanana-1.5-2.1b-instruct-q4f32_1-MLC

## Resumen

kanana-1.5-2.1b-instruct-q4f32_1-MLC es una conversion cuantizada del modelo kakaocorp/kanana-1.5-2.1b-instruct-2505, desarrollado originalmente por Kakao Corp. La conversion la ha realizado el usuario Rheechan mediante MLC LLM con el esquema de cuantizacion q4f32_1, y esta empaquetada especificamente para su uso con WebLLM, la libreria que permite ejecutar modelos de lenguaje directamente en el navegador a traves de WebGPU.

El modelo base es un transformer de 2.100 millones de parametros orientado a instrucciones y especializado en coreano. Esta version cuantizada reduce el peso del repositorio a 1,2 GB, lo que la hace viable para descarga y ejecucion en entornos cliente sin infraestructura de servidor dedicada. El formato de pesos no es safetensors ni GGUF, sino el formato propio de MLC LLM (params_shard_*.bin y tensor-cache.json), acompanado de una biblioteca WebGPU compilada (kanana-q4f32_1-webgpu.wasm) compatible con WebLLM 0.2.89.

Su relevancia actual radica en que demuestra el flujo completo de despliegue de un modelo coreano de 2B en el navegador: inferencia local, sin envio de datos a servidores externos y sin necesidad de GPU dedicada en el cliente, siempre que el navegador soporte WebGPU. La ventana de contexto declarada es de 4096 tokens y el formato de conversacion es llama-3_1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base kanana-1.5-2.1b-instruct-2505; detalles de capas y atencion no disponibles) |
| Parametros totales | 2.100 millones (2,1B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | q4f32_1 (esquema MLC LLM: pesos de 4 bits con acumulacion en fp32) |
| Idiomas soportados | Coreano (etiqueta `korean`); cobertura adicional de idiomas no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC LLM: `params_shard_*.bin` + `tensor-cache.json`; biblioteca WebGPU `kanana-q4f32_1-webgpu.wasm` |
| Tamano del repositorio | 1,2 GB |
| Formato de conversacion | llama-3_1 |
| Runtime objetivo | WebLLM 0.2.89 sobre WebGPU |
| Modelo base | kakaocorp/kanana-1.5-2.1b-instruct-2505 |

## Arquitectura y entrenamiento

El modelo base es un transformer de 2,1B parametros afinado para instrucciones por Kakao Corp. La informacion disponible no detalla el numero de capas, la configuracion de atencion (MHA/GQA), el numero de tokens de entrenamiento ni la composicion del corpus. Tampoco se documenta si el ajuste de instrucciones empleo RLHF, DPO u otra tecnica de alineamiento. La unica informacion arquitectonica concreta es la derivada de la conversion: ventana de contexto de 4096 tokens y plantilla de chat compatible con llama-3_1.

La innovacion tecnica de este repositorio no reside en el modelo, sino en el pipeline de despliegue. MLC LLM compila el grafo del modelo a un runtime WebGPU (TVM commit e345029, MLC LLM commit 44fd06d) y empaqueta los pesos en shards binarios con un cache de tensores. La cuantizacion q4f32_1 almacena los pesos en 4 bits y realiza las acumulaciones en coma flotante de 32 bits, un compromiso habitual para preservar precision numerica en GPU integradas y aceleradores WebGPU con soporte limitado de tipos de baja precision. El resultado es un artefacto autocontenido que WebLLM carga en el navegador y ejecuta sin backend remoto.

## Capacidades

- Generacion de texto y respuesta a instrucciones en coreano, heredadas del modelo base kanana-1.5-2.1b-instruct.
- Conversacion multi-turno mediante la plantilla de chat llama-3_1, con contexto de hasta 4096 tokens.
- Inferencia local en el navegador a traves de WebGPU, sin envio de prompts a servidores externos.
- Ejecucion offline una vez descargados los pesos y la biblioteca wasm, sujeta al cache del navegador.
- Razonamiento basico y generacion de codigo: no disponible en la informacion proporcionada; no se documentan capacidades especificas mas alla de la naturaleza instruct del modelo base.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponibles; el repositorio solo incluye pesos de texto.
- Modo thinking explicito: no disponible.

## Casos de uso

- Asistentes web embebidos en coreano: el modelo puede integrarse en una pagina mediante WebLLM para ofrecer un chat que responde sin backend, con los 4096 tokens de contexto suficientes para conversaciones de varias rondas y con la garantia de que el texto del usuario no sale del dispositivo.
- Demos y prototipos sin infraestructura: un equipo puede validar una experiencia de chat en coreano desplegando unicamente archivos estaticos (wasm y shards), eliminando el coste de GPU en servidor durante la fase de prueba de concepto.
- Aplicaciones educativas y de aprendizaje de coreano: generacion de explicaciones, ejemplos de frases y correcciones gramaticales en el navegador, aprovechando que el modelo base esta orientado al coreano y que la inferencia es local.
- Procesamiento de texto confidencial en cliente: clasificacion, resumen o reescritura de documentos que no deben abandonar el puesto de trabajo, ya que la cuantizacion q4f32_1 cabe en 1,2 GB de descarga y se ejecuta sobre la GPU del usuario.
- Extensiones de navegador y herramientas de escritorio basadas en web tech: al compilarse a WebGPU, el modelo puede reutilizarse en electron o en extensiones que ya dispongan de un contexto WebGPU, con una ventana de 4096 tokens para tareas acotadas.
- Filtrado y moderacion de contenido en coreano en el borde: ejecucion de un primer clasificador local que descarte o marque texto antes de enviarlo a un modelo mayor en servidor, reduciendo coste y latencia en el camino critico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con pesos q4f32_1 y un repositorio de 1,2 GB, la huella de pesos ronda 1,1-1,2 GB, a la que hay que sumar el cache KV para 4096 tokens y las reservas del runtime WebGPU.
- GPU recomendadas: no disponible. El requisito funcional es un navegador con soporte de WebGPU (Chrome/Edge en versiones recientes, Safari con WebGPU habilitado) y una GPU compatible con ese backend.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de 2,1B en 4 bits; no se especifican modelos concretos de GPU de consumo en la informacion disponible.
- Opciones de despliegue: WebLLM 0.2.89 sobre WebGPU es el runtime documentado. Otros runtimes (vLLM, llama.cpp, Ollama, TGI) no son compatibles directamente con el formato de pesos MLC; para ellos habria que partir del modelo base o de otra conversion.
- Latencia y throughput: no disponibles. Dependen del navegador, del backend WebGPU y de la GPU del cliente; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Runtime |
|---|---|---|---|---|---|
| kanana-1.5-2.1b-instruct-q4f32_1-MLC (este) | 2,1B | 4096 | MLC (q4f32_1) | Apache 2.0 | WebLLM / WebGPU |
| kakaocorp/kanana-1.5-2.1b-instruct-2505 | 2,1B | no disponible | safetensors (presumiblemente) | Apache 2.0 | Transformers, vLLM, etc. |
| Versiones GGUF del mismo modelo base | 2,1B | no disponible | GGUF | Apache 2.0 | llama.cpp, Ollama |

La comparativa se limita al propio modelo base y a sus conversiones alternativas, ya que la informacion disponible no incluye datos de rendimiento que permitan contrastarlo con otros modelos de 2B. Las diferencias relevantes son de empaquetado y runtime: este repositorio prioriza la ejecucion en navegador, mientras que el modelo base y las conversiones GGUF estan pensados para servidores o escritorio.

## Limitaciones y advertencias

- Modelo pequeno (2,1B): la calidad de razonamiento, matematicas y codigo sera inferior a la de modelos de mayor tamano; no se han publicado evaluaciones que lo cuantifiquen.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala, especialmente fuera de dominios bien representados en el entrenamiento.
- Cobertura idiomatica: la etiqueta del repositorio indica coreano; el rendimiento en castellano u otros idiomas no esta documentado y no deberia asumirse.
- Contexto limitado a 4096 tokens: insuficiente para documentos largos, analisis de repositorios completos o conversaciones muy extensas.
- Compatibilidad restringida: los pesos solo funcionan con MLC LLM/WebLLM; no se pueden cargar directamente en llama.cpp, vLLM u Ollama.
- Dependencia de WebGPU: sin soporte de WebGPU en el navegador o en la GPU del cliente, el modelo no se ejecuta; el rendimiento varia mucho segun el hardware.
- Licencia Apache 2.0: permite uso comercial, pero los derechos del modelo original pertenecen a Kakao Corp. y este repositorio es una conversion; conviene conservar la atribucion y revisar los terminos del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion comunitaria de la conversion.
- No se documentan sesgos especificos del modelo base ni del proceso de cuantizacion; la cuantizacion a 4 bits puede degradar ligeramente la calidad respecto al modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Rheechan/kanana-1.5-2.1b-instruct-q4f32_1-MLC
- Modelo base: https://huggingface.co/kakaocorp/kanana-1.5-2.1b-instruct-2505
- MLC LLM (repositorio): https://github.com/mlc-ai/mlc-llm
- WebLLM: https://webllm.mlc.ai/
- Apache TVM: https://tvm.apache.org/
