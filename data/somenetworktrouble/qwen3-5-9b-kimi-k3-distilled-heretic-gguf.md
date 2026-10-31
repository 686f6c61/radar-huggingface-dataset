# somenetworktrouble/Qwen3.5-9B-Kimi-k3-Distilled-heretic-GGUF

## Resumen

Qwen3.5-9B-Kimi-k3-Distilled-heretic-GGUF es una versión cuantizada en formato GGUF del modelo khazarai/Qwen3.5-9B-Kimi-k3-Distilled, un modelo de 9.197.093.888 parámetros (9,2B) basado en la arquitectura Qwen3.5 y destilado a partir de trazas de razonamiento y depuración de código del modelo Kimi k3 (dataset greghavens/kimi-k3-coding-and-debugging-traces). La cuantización ha sido realizada por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face especializado en producir versiones GGUF estáticas de alta calidad.

La particularidad de esta variante "heretic" es que el modelo base ha pasado por el proceso heretic (MoriNoNushi/heretic-gguf), un procedimiento que modifica el modelo para reducir o eliminar sus comportamientos de rechazo (refusals), generando versiones etiquetadas con el número de rechazos eliminados y la divergencia KL respecto al modelo original. Esto lo hace interesante para usuarios que buscan modelos menos restrictivos, aunque implica riesgos adicionales que conviene tener en cuenta.

El modelo está orientado a tareas de razonamiento, generación de código y uso como agente, heredando las capacidades de destilación de Kimi k3. Al estar distribuido en GGUF con un amplio abanico de cuantizaciones (desde Q2_K hasta f16), puede ejecutarse localmente en hardware de consumo mediante llama.cpp, Ollama o LM Studio, lo que lo hace accesible para desarrolladores sin acceso a GPUs de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer, variante no especificada en detalle) |
| Parametros totales | 9.197.093.888 (9,2B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

El modelo base es khazarai/Qwen3.5-9B-Kimi-k3-Distilled, un modelo de 9,2B parámetros construido sobre la arquitectura Qwen3.5. Su entrenamiento se basa en destilación a partir de trazas de razonamiento y depuración de código generadas por Kimi k3, utilizando el dataset greghavens/kimi-k3-coding-and-debugging-traces. Este enfoque de destilación busca transferir al modelo pequeño las capacidades de razonamiento y resolución de bugs del modelo profesor, mucho mayor.

La variante "heretic" de esta ficha añade una modificación post-entrenamiento: el modelo base se procesa mediante la herramienta heretic-gguf, que ajusta los pesos para minimizar los rechazos del modelo. Los archivos resultantes se etiquetan con el formato `model-heretic-refusal_#-KL_divergence_0.#.gguf`, indicando cuántos rechazos se han eliminado y cuánta divergencia KL se ha introducido respecto al modelo original. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición completa del dataset ni el uso de RLHF/DPO.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation-inference, etiqueta conversational)
- Razonamiento (tag "reasoning"), heredado de la destilacion desde Kimi k3
- Generacion y depuracion de codigo (tags "coding", dataset de trazas de coding y debugging)
- Uso como agente (tag "agent")
- Soporte multimodal parcial: existen archivos mmproj (mmproj-Q8_0 y mmproj-f16) como suplemento multimodal, lo que sugiere capacidad de vision cuando se usan junto al modelo principal
- Ejecucion local eficiente gracias a las multiples cuantizaciones GGUF

Nota: no se ha documentado explicitamente soporte de tool calling / function calling ni modos de pensamiento (thinking mode), aunque las etiquetas de agente y razonamiento sugieren orientacion a esos flujos.

## Casos de uso

- Depuracion de codigo en local: el modelo fue destilado con trazas de debugging de Kimi k3, por lo que es adecuado para analizar stack traces, proponer correcciones y explicar errores en un entorno offline.
- Generacion de codigo asistida en IDE: integrable en editores via Ollama o LM Studio para autocompletado y refactorizacion sin enviar codigo a servicios externos.
- Razonamiento paso a paso sobre problemas tecnicos: util para descomponer problemas de logica o arquitectura gracias a la destilacion de razonamiento.
- Agentes locales de linea de comandos: su etiqueta de agente y su tamano de 9B lo hacen viable como motor de agentes ligeros que ejecutan herramientas en maquina local.
- Prototipado en GPUs de consumo: con la cuantizacion Q4_K_M (5,9 GB) cabe comodamente en una RTX 3060 de 12 GB o superior, ideal para experimentacion rapida.
- Asistente conversacional tecnico: formato conversacional apto para chatbots de asistencia a desarrolladores con respuestas en ingles.
- Analisis de imagenes tecnicas (capturas de errores, diagramas): si se emplea junto a los archivos mmproj, puede procesar entradas visuales en flujos locales de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (peso del modelo + contexto):
  - Q2_K: ~4,0 GB
  - Q4_K_S / Q4_K_M: ~5,6-5,9 GB
  - Q6_K: ~7,7 GB
  - Q8_0: ~9,9 GB
  - f16: ~18,5 GB
- GPUs recomendadas: no se especifican oficialmente, pero dadas las cuantizaciones, cualquier GPU de consumo con 6-12 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090) ejecuta las cuantizaciones medias sin problema; para f16 se recomienda una GPU con 24 GB (RTX 3090/4090) o una A100.
- Cabe en GPUs de consumo: si, desde ~6 GB de VRAM con Q2_K/Q3_K hasta 24 GB con f16. Tambien es viable en CPU pura o modo hibrido CPU+GPU gracias a GGUF.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, GPT4All y cualquier runtime compatible con GGUF. No es un despliegue tipico de vLLM/TGI al ser GGUF, aunque el modelo base safetensors podria servir con TGI o vLLM.
- Latencia y throughput estimados: no disponible; en GPUs de consumo modernas con cuantizaciones Q4 se pueden esperar velocidades de decodificacion de varias decenas de tokens/segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3.5-9B-Kimi-k3-Distilled-heretic (esta ficha) | 9,2B | GGUF (Q2_K a f16) | Apache 2.0 | Codigo, razonamiento, agente; rechazos reducidos |
| khazarai/Qwen3.5-9B-Kimi-k3-Distilled (base) | 9,2B | safetensors | Apache 2.0 | Mismo modelo sin modificacion heretic |
| mradermacher/Qwen3.5-9B-Kimi-k3-Distilled-i1-GGUF | 9,2B | GGUF (imatrix) | Apache 2.0 | Cuantizaciones weighted/imatrix de mayor calidad |

Nota: no se dispone de datos de rendimiento que permitan comparar numericamente con otros modelos de 9B de la misma categoria (como Qwen3-8B, Gemma 2 9B o Llama 3.1 8B).

## Limitaciones y advertencias

- Modificacion heretic: el proceso de eliminacion de rechazos altera los pesos del modelo y puede degradar la calidad general o producir salidas problematicas; conviene revisar la divergencia KL indicada en el nombre de cada archivo y usarlo con responsabilidad.
- Riesgo de alucinacion: al tratarse de un modelo de 9B destilado, existe riesgo tipico de alucinaciones, especialmente en razonamiento complejo; no hay evaluaciones publicadas que cuantifiquen este riesgo.
- Idioma: el modelo esta etiquetado solo para ingles; su rendimiento en castellano no esta documentado y probablemente sea inferior.
- Contexto: la longitud de contexto no esta especificada en la model card; debe verificarse en la configuracion del modelo base antes de planificar cargas con documentos largos.
- Cuantizaciones bajas: Q2_K y Q3_K_M se senalan explicitamente como de menor calidad; para uso serio se recomiendan Q4_K_S/Q4_K_M o superiores.
- Licencia: Apache 2.0 permite uso comercial, pero las trazas de destilacion provienen de Kimi k3 (Moonshot AI); conviene revisar los terminos del modelo profesor si el uso es comercial sensible.
- Procedencia comunitaria: el modelo base (khazarai) y la cuantizacion (mradermacher/somenetworktrouble) son contribuciones comunitarias sin respaldo corporativo ni auditorias de seguridad publicadas; evaluar antes de usar en produccion.

## Enlaces

- Modelo (esta ficha): https://huggingface.co/somenetworktrouble/Qwen3.5-9B-Kimi-k3-Distilled-heretic-GGUF
- Modelo base: https://huggingface.co/khazarai/Qwen3.5-9B-Kimi-k3-Distilled
- Cuantizaciones imatrix (mradermacher): https://huggingface.co/mradermacher/Qwen3.5-9B-Kimi-k3-Distilled-i1-GGUF
- Cuantizaciones estaticas (mradermacher): https://huggingface.co/mradermacher/Qwen3.5-9B-Kimi-k3-Distilled-GGUF
- Pagina de descargas alternativa: https://hf.tst.eu/model#Qwen3.5-9B-Kimi-k3-Distilled-GGUF
- Dataset de destilacion: https://huggingface.co/datasets/greghavens/kimi-k3-coding-and-debugging-traces
- Herramienta heretic-gguf: https://github.com/MoriNoNushi/heretic-gguf
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ de solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
