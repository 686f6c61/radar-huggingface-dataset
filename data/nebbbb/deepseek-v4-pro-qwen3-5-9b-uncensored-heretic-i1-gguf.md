# nebbbb/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF

## Resumen
DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF es una cuantizacion GGUF del modelo xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic, publicada por el usuario nebbbb y generada con la herramienta de cuantizacion de mradermacher (quants ponderados con imatrix). Se trata de una destilacion de un modelo DeepSeek sobre una base Qwen3.5 de 9B, con un proceso posterior de "abliteration" o decensurado (etiquetas heretic, uncensored, decensored, abliterated) que elimina parte de los rechazos y filtros de seguridad del modelo original.

El modelo tiene 8.953.803.264 parametros (aproximadamente 9B) y se distribuye exclusivamente en formato GGUF con una amplia bateria de cuantizaciones (desde IQ1_S de 2,8 GB hasta Q6_K y superiores). El repositorio ocupa 110,2 GB en total, lo que refleja la presencia de multiples variantes de cuantizacion en un mismo espacio. La model card indica que es un modelo de vision (dispone de ficheros mmproj en el repositorio estatico asociado) y que soporta razonamiento, matematicas, STEM, tool calling y function calling.

Es relevante ahora porque combina tres tendencias del ecosistema open source: la destilacion de modelos grandes de razonamiento sobre bases de 9B desplegables en hardware de consumo, la cuantizacion con imatrix para preservar calidad en tamanos reducidos, y la modificacion "abliterated" que atrae a usuarios que necesitan un modelo sin rechazos para investigacion o generacion creativa sin restricciones. La licencia Apache 2.0 facilita su uso comercial, aunque el decensurado introduce riesgos que se detallan mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5, destilada de DeepSeek), con soporte de vision segun la model card |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, IQ4_XS, Q5_K_S, Q5_K_M, Q6_K, entre otras; incluye fichero imatrix |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento
La informacion disponible no detalla la arquitectura interna mas alla de que la base es Qwen3.5 (familia transformer de Qwen) y que el modelo es una destilacion de DeepSeek-V4-Pro. Las etiquetas del repositorio indican un pipeline de entrenamiento que incluye SFT (supervised fine-tuning), RL (reinforcement learning) y GSPO (Group Sequence Policy Optimization), ademas de destilacion de razonamiento, matematicas y STEM. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO explicitos.

La innovacion tecnica destacable de esta publicacion concreta es la cuantizacion con imatrix (importance matrix) generada por mradermacher, que permite obtener variantes de baja precision con perdida de calidad reducida. El proceso de "abliteration" aplicado al modelo base elimina direcciones de activacion asociadas a rechazos, lo que produce un modelo "uncensored" que responde a peticiones que el original rechazaria. No se dispone de detalles sobre el metodo exacto de abliteration empleado ni sobre la magnitud de la perdida de capacidades que introduce.

## Capacidades
- Generacion de texto conversacional multi-turno.
- Razonamiento explicito (etiqueta reasoning en el repositorio) con posible modo de pensamiento.
- Matematicas y problemas STEM, segun las etiquetas math y stem.
- Generacion de codigo y tareas de programacion.
- Tool calling y function calling, con soporte para integracion en agentes.
- Capacidades de vision: la model card indica que es un modelo de vision y que los ficheros mmproj estan en el repositorio estatico asociado.
- Multilingue en ingles, chino, coreano, japones, espanol y ruso.
- Modo "uncensored"/"abliterated": responde sin los filtros de rechazo habituales del modelo base.
- Compatible con text-generation-inference y transformers, ademas de llama.cpp/Ollama por el formato GGUF.

## Casos de uso
- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como el decensurado afecta a la tasa de rechazos y a la calidad de las respuestas en comparacion con el base, usando las distintas cuantizaciones para reproducir experimentos en hardware modesto.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa con tematicas adultas o controvertidas que el modelo original rechazaria, aprovechando la naturaleza abliterated.
- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M (aproximadamente 5,5 GB) o IQ4_XS (5,3 GB) el modelo cabe en GPUs de consumo de 8-12 GB de VRAM, lo que permite inferencia privada sin enviar datos a la nube.
- Asistente de codigo y matematicas en entornos aislados: las etiquetas de razonamiento, math y stem sugieren buen rendimiento en tareas de programacion y resolucion de problemas, util para pipelines internos donde no se puede usar un servicio externo.
- Agentes con tool calling: integrable en flujos de function calling para automatizacion de tareas (consulta de APIs, extraccion de datos, orquestacion de pasos multiples) mediante llama.cpp o vLLM con el backend GGUF.
- Procesamiento multilingue: atencion o traduccion en espanol, ingles, chino, coreano, japones y ruso, con un unico modelo de 9B desplegado en local.
- Prototipado rapido de aplicaciones de vision-lenguaje: usando los ficheros mmproj del repositorio estatico, se puede experimentar con entrada de imagenes en un modelo de 9B cuantizado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos. Tampoco se dispone de datos de latencia o throughput medidos.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 2,8-3,7 GB para cuantizaciones IQ1-IQ2; 4,0-5,0 GB para IQ3; 5,3-5,5 GB para IQ4_XS y Q4_K_S; 6-7 GB para Q5_K_M; y en torno a 8-9 GB para Q6_K (estimaciones a partir del tamano de fichero indicado en la model card, sin margen de contexto).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones medias y altas; A100 o H100 para despliegue con contexto largo o batched en produccion.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas usando Q4_K_M o inferiores; las cuantizaciones IQ1-IQ3 caben incluso en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; tambien text-generation-inference y transformers segun las etiquetas del repositorio.
- Latencia y throughput: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (nebbbb GGUF) | 8,95B | no disponible | GGUF | Apache 2.0 | Destilado de DeepSeek, abliterated, vision segun model card |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 8,95B | no disponible | safetensors | Apache 2.0 | Modelo base sin cuantizar del que deriva esta publicacion |
| mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF | 8,95B | no disponible | GGUF | Apache 2.0 | Cuantizaciones estaticas del mismo base, sin imatrix |

No se dispone de datos de rendimiento comparado con otras familias (Qwen3.5 original, Llama 3.1 8B, Gemma 2 9B) en la informacion proporcionada, por lo que la comparativa se limita a variantes del mismo modelo base.

## Limitaciones y advertencias
- El proceso de abliteration/decensurado elimina filtros de seguridad: el modelo puede generar contenido danino, ilegal o sexualmente explicito sin rechazo, lo que lo hace inadecuado para aplicaciones de cara al publico sin moderacion externa.
- Riesgo elevado de alucinacion, comun en modelos de 9B destilados y agravado por la perdida de capacidades que suele acompanar al decensurado.
- No se han publicado evaluaciones de calidad ni benchmarks: no hay evidencia cuantitativa de que las cuantizaciones IQ1-IQ2 conserven un rendimiento aceptable; la propia model card advierte "very low quality" en Q2_K_S y "for the desperate" en IQ1_S.
- Longitud de contexto no documentada: no se puede planificar el uso en tareas de contexto largo sin verificacion empirica.
- Idiomas limitados a seis (en, zh, ko, ja, es, ru); el rendimiento en espanol no esta verificado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo decensurado puede conllevar responsabilidad legal por el contenido generado; conviene revisar las obligaciones de moderacion aplicables.
- La model card esta generada de forma automatica por la herramienta de mradermacher y contiene metadatos incompletos (pipeline no disponible, seccion de uso truncada).

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/nebbbb/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
