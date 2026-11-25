# mazrba/Qwen3.8-27B-Uncensored-Q8_0-GGUF

## Resumen

mazrba/Qwen3.8-27B-Uncensored-Q8_0-GGUF es una conversion a formato GGUF (cuantizacion Q8_0) del modelo orcarouter/Qwen3.8-27B-Uncensored, un fine-tune de la familia Qwen3 orientado a eliminar el alineamiento de seguridad (abliteration) y a usos de red teaming. El autor de esta version es el usuario mazrba, que ha utilizado el espacio GGUF-my-repo de ggml.ai y llama.cpp para generar los pesos cuantizados a partir del checkpoint original en bf16.

El modelo cuenta con 27.320.697.856 parametros totales (aproximadamente 27,3 mil millones), lo que lo situa en la gama de modelos densos de gran tamano aptos para inferencia en una sola GPU de 80 GB o en configuraciones multi-GPU. Segun las etiquetas de la model card, es un modelo vision-language (pipeline image-text-to-text) con capacidades de razonamiento, function calling y soporte de multi-token prediction (MTP), aunque no se detalla la arquitectura interna en la informacion disponible.

Su relevancia actual radica en dos factores: por un lado, ofrece una variante sin censura de un modelo de ~27B con capacidades multimodales, util para investigacion en seguridad, evaluacion de sesgos y pruebas de robustez; por otro, al estar disponible en GGUF Q8_0, puede desplegarse con llama.cpp en entornos donde no se dispone de infraestructura de servidores de inferencia de alto rendimiento. La licencia es Apache 2.0, lo que facilita su uso comercial, si bien el caracter "uncensored" implica riesgos considerables que se detallan mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3, segun etiquetas); detalles internos no disponibles |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q8_0 (esta version); el modelo base se distribuye en bf16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas de la model card, que apuntan a un transformer de la familia Qwen3 con capacidades multimodales (vision-language) y soporte de razonamiento y function calling. El modelo base orcarouter/Qwen3.8-27B-Uncensored es un fine-tune del modelo Qwen3.8-27B original, sometido a un proceso de abliteration (eliminacion de direcciones de rechazo en el espacio de activaciones) y posterior post-entrenamiento. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion principal de esta publicacion concreta es la conversion a GGUF Q8_0 mediante llama.cpp y el espacio GGUF-my-repo de ggml.ai, que permite ejecutar el modelo en CPU, GPU consumer y entornos Apple Silicon con perdida de precision minima (8 bits por peso). La etiqueta "mtp" sugiere soporte de multi-token prediction, una tecnica de decodificacion especulativa que puede acelerar la generacion, aunque no se aportan detalles tecnicos sobre su implementacion.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento (etiqueta "reasoning" en la model card).
- Function calling / tool calling (etiqueta "function-calling").
- Capacidades de vision-language: el pipeline es image-text-to-text, por lo que acepta imagenes como entrada junto con texto.
- Modo "uncensored": el alineamiento de seguridad ha sido eliminado, lo que permite generar contenido que los modelos alineados rechazarian.
- Soporte de multi-token prediction (etiqueta "mtp"), potencialmente util para acelerar la decodificacion.
- Uso previsto en red teaming y evaluacion de seguridad de IA (etiquetas "ai-red-team", "red-teaming").
- Compatible con endpoints (etiqueta "endpoints_compatible").

## Casos de uso

- Red teaming y evaluacion de seguridad: el modelo puede emplearse para generar prompts adversarios, probar defensas de otros sistemas y estudiar como responde un modelo sin alineamiento ante entradas maliciosas, gracias a su condicion de "uncensored" y a su capacidad multimodal.
- Investigacion sobre sesgos y alucinacion: al carecer de filtros de rechazo, permite analizar de forma directa los sesgos latentes del modelo base sin que las capas de seguridad enmascaren las respuestas, lo que facilita estudios academicos reproducibles.
- Pruebas de robustez de filtros de contenido: util para validar clasificadores y moderadores, generando contenido de riesgo controlado en un entorno aislado y comparando la respuesta con la de modelos alineados.
- Procesamiento de documentos con imagenes: al ser image-text-to-text, puede extraer y razonar sobre informacion de capturas, diagramas o formularios en ingles y chino, integrado en pipelines de llama.cpp.
- Despliegue local en estaciones de trabajo: la cuantizacion Q8_0 permite ejecutar un modelo de 27B en hardware consumer de gama alta (por ejemplo, una RTX 4090 con 24 GB no basta para Q8_0 completo, pero si configuraciones con offload a RAM o GPUs con 32-48 GB), sin depender de APIs externas.
- Generacion de codigo y function calling en entornos controlados: la etiqueta function-calling sugiere que puede integrarse en agentes que invocan herramientas, aunque su uso en produccion requiere auditoria previa por la ausencia de alineamiento.
- Experimentacion con decodificacion especulativa: la etiqueta MTP permite estudiar tecnicas de aceleracion de inferencia en llama.cpp con un modelo de gran tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para Q8_0: aproximadamente 27,3 B parametros x ~8,5 bits efectivos ≈ 29 GB de pesos, mas overhead de contexto y cache KV; se recomienda un minimo de 32 GB de VRAM para contexto corto y 40-48 GB para contextos largos.
- El repositorio ocupa 29,0 GB, lo que confirma el orden de magnitud del peso en disco.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, RTX A6000 48 GB, RTX 6000 Ada 48 GB. En GPUs de 24 GB (RTX 4090, 3090) no cabe completo en Q8_0; seria necesario usar cuantizaciones menores (Q4_K_M, Q5_K_M) no incluidas en este repositorio o hacer offload parcial a RAM.
- Cabe en consumer GPU de 32 GB o mas (por ejemplo, RTX 5090 si dispone de 32 GB) con contexto moderado; en 24 GB solo con offload.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), y por compatibilidad de formato GGUF, potencialmente Ollama y otros runners basados en llama.cpp. La libreria declarada es transformers, pero el formato GGUF esta pensado para llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mazrba/Qwen3.8-27B-Uncensored-Q8_0-GGUF | 27,3 B | no disponible | Apache 2.0 | GGUF Q8_0 | Variante uncensored multimodal |
| orcarouter/Qwen3.8-27B-Uncensored (base) | 27,3 B | no disponible | Apache 2.0 | bf16 (safetensors) | Checkpoint original sin cuantizar |
| Qwen3-27B (familia original) | ~27 B | no disponible | Apache 2.0 (segun familia Qwen3) | safetensors | Modelo alineado de referencia; datos concretos no disponibles |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer diferencias cuantitativas con alternativas.

## Limitaciones y advertencias

- Modelo "uncensored": el alineamiento de seguridad ha sido eliminado deliberadamente; puede generar contenido danino, ilegal o eticamente problematico. No debe desplegarse en aplicaciones de cara al publico sin capas de moderacion externas.
- Riesgo elevado de alucinacion: al no estar alineado, tiende a no rechazar premisas falsas y puede afirmar hechos incorrectos con seguridad; requiere verificacion factual en cualquier uso serio.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto no disponible: no se puede planificar el uso en tareas de contexto largo sin verificacion empirica.
- Sesgos conocidos: no documentados en la informacion proporcionada, pero esperables en modelos derivados de Qwen3 entrenados predominantemente en ingles y chino.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y la responsabilidad legal del uso recae en el desplegador.
- La cuantizacion Q8_0 introduce una perdida de precision pequena pero no nula respecto al bf16 original; para evaluaciones de seguridad rigurosas conviene usar el checkpoint base.
- El modelo tiene solo 136 descargas y 0 likes en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.
- No se documentan procesos de RLHF/DPO ni datos de entrenamiento, lo que dificulta la reproducibilidad y la auditoria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mazrba/Qwen3.8-27B-Uncensored-Q8_0-GGUF
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
