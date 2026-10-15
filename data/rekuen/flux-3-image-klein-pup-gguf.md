# rekuen/flux-3-image-klein-pup-GGUF

## Resumen

El modelo `rekuen/flux-3-image-klein-pup-GGUF` es una conversion no oficial al formato GGUF del modelo `black-forest-labs/flux-3-image-klein-pup`, un modelo vision-lenguaje de aproximadamente 9.000 millones de parametros especializado en el aumento y reescritura de prompts (prompt upsampling). Su funcion es tomar una peticion breve de imagen, por ejemplo "un hombre paseando a su perro bajo el sol de la tarde", y expandirla hasta convertirse en el prompt detallado que el generador de imagenes FLUX 3 Image Klein necesita para producir buenos resultados. El modelo base lo desarrolla Black Forest Labs y deriva de Qwen3.5-9B, del equipo Qwen de Alibaba Cloud.

La relevancia de esta publicacion es practica: el repositorio original distribuye los pesos en `safetensors` con precision bfloat16, mientras que esta conversion los adapta a llama.cpp y a todo su ecosistema (llama-server, llama-cpp-python, llama-mtmd-cli y herramientas derivadas), lo que permite ejecutar el modelo en hardware de consumo y en entornos sin GPU de datacenter. Se incluye el modelo de lenguaje cuantizado a Q4_K_M (5,63 GB), la torre de vision y el proyector multimodal en F16 (0,92 GB) para tareas de edicion con imagenes de referencia, y los cuatro system prompts originales.

El repositorio no aporta datos de entrenamiento, benchmarks ni detalles de arquitectura mas alla de los heredados del modelo original; su autoria es independiente y no esta afiliada ni respaldada por Black Forest Labs ni por el equipo Qwen. La licencia es Apache 2.0, igual que la del modelo de partida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen3.5 (arquitectura declarada en GGUF como `qwen35`), con torre de vision y proyector multimodal separados |
| Parametros totales | 8.953.803.264 (aproximadamente 8,95 mil millones, descrito como 9B) |
| Parametros activos | No aplica, no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada; el ejemplo de uso de la model card configura `n_ctx=8192` |
| Tipos de cuantizacion | Q4_K_M para el modelo de lenguaje (5,63 GB); F16 para la torre de vision y el proyector (0,92 GB). El repositorio original usa bfloat16 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache License 2.0 |
| Formato de pesos | GGUF (un fichero para el modelo de lenguaje y un `mmproj` para vision). El original esta en `safetensors` bfloat16 |
| Presupuesto de generacion | Hasta 3584 tokens nuevos |
| Parametros de muestreo recomendados | Decodificacion greedy (temperatura 0), `top_p` 0.95, `top_k` 20, `min_p` 0.0, `repeat_penalty` 1.0, `presence_penalty` 1.5 en text-to-image y 0 en edicion |
| Plantilla de chat | Integrada en el GGUF del modelo de lenguaje; debe renderizarse con `enable_thinking=False` |

## Arquitectura y entrenamiento

El modelo es una adaptacion (fine-tune) de Qwen3.5-9B orientada a una tarea concreta: la reescritura y expansion de prompts para generacion y edicion de imagenes. La arquitectura declarada en el GGUF es `qwen35`, es decir, un transformer decoder-only de tipo causal propio de la familia Qwen3.5, acompanado de una torre de vision y un proyector multimodal que se empaquetan por separado en el fichero `mmproj`. El `config.json` original declara una capa de prediccion multi-token (`mtp_num_hidden_layers: 1`), pero el checkpoint no incluye pesos MTP; por ese motivo la conversion se realizo con el flag `--no-mtp`, ya que sin el el GGUF declararia 33 bloques y llama.cpp fallaria al cargar con el error `tensor 'blk.32.attn_norm.weight' not found`.

Sobre el entrenamiento no hay informacion en los datos proporcionados: no se especifican el numero de tokens, la composicion del dataset ni si se emplearon tecnicas de alineacion como RLHF o DPO. Se sabe, por herencia del modelo base, que existe una fase de fine-tuning sobre Qwen3.5-9B que da lugar al modelo especializado en aumento de prompts. La conversion a GGUF se hizo con `convert_hf_to_gguf.py` de llama.cpp en el commit `4df29be4f4c3673f428170fda944a5b19f743bb8`, partiendo de los `safetensors` en bfloat16, y posteriormente se cuantizo a Q4_K_M con el cuantizador de llama.cpp sin matriz de importancia. No se han documentado innovaciones tecnicas adicionales en esta conversion.

## Capacidades

- Expansion y reescritura de prompts para text-to-image: convierte una peticion corta en una descripcion larga y detallada, adaptada al estilo que FLUX 3 Image Klein espera.
- Edicion de imagenes con referencias visuales: carga imagenes de referencia y genera la caption del resultado deseado, usando el system prompt `i2i` y el proyector multimodal.
- Generacion de prompts con bounding boxes: los system prompts `t2i_bbox` e `i2i_bbox` permiten trabajar con control espacial mediante cajas delimitadoras.
- Procesamiento multimodal de entrada: la torre de vision acepta imagenes redimensionadas por el codigo de inferencia original (hasta 1 MP para una referencia, 724x724 para dos, 512x512 para tres o mas, con lados multiplos de 32, aplanadas sobre blanco y recodificadas en JPEG).
- Modo conversacional: la plantilla de chat esta integrada en el GGUF, aunque el uso previsto es de una sola interaccion por peticion.
- Multilingue: limitado al ingles segun la etiqueta de idioma del repositorio.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito: no se utiliza; la model card indica renderizar la plantilla con `enable_thinking=False`.

## Casos de uso

- Pipeline de generacion de imagenes en dos etapas: el modelo recibe la peticion breve del usuario y devuelve un prompt detallado que se envia despues a FLUX 3 Image Klein. Es el uso principal para el que fue disenado y aprovecha su presupuesto de hasta 3584 tokens de salida.
- Edicion fotografica asistida por lenguaje natural: se pasan una o varias imagenes de referencia junto con una instruccion del tipo "ponle un panuelo rojo al cuello del perro" y el modelo produce la caption de la imagen editada, que alimenta al generador.
- Automatizacion de marketing y creatividades: un sistema de gestion de campanas puede transformar briefs cortos en prompts consistentes para generar variaciones de un mismo producto con estilo uniforme.
- Composicion con control espacial: mediante los prompts `t2i_bbox` e `i2i_bbox` se pueden describir escenas con objetos situados en cajas concretas, util en generacion de material grafico con maquetacion fija.
- Ejecucion local con privacidad: al estar en GGUF y Q4_K_M, se puede desplegar en una estacion de trabajo o portatil con GPU de consumo, sin enviar imagenes ni descripciones a servicios externos.
- Servicio backend de reescritura de prompts: integrado con `llama-server`, puede actuar como microservicio que normaliza y enriquece las peticiones de multiples aplicaciones antes de llamar al modelo de difusion.
- Investigacion en reescritura de prompts: permite estudiar como varia la calidad de la imagen generada en funcion de la expansion del prompt, manteniendo fijo el modelo de difusion.
- Herramientas de diseno de escritorio: integracion en plugins o aplicaciones de edicion que necesiten convertir lenguaje coloquial en instrucciones tecnicas precisas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas numericas, y remite a la model card original para cualquier detalle de comportamiento, por lo que no se pueden presentar cifras de MMLU, HumanEval, GSM8K ni de evaluacion de prompts.

## Requisitos de hardware

- VRAM para inferencia: el modelo de lenguaje en Q4_K_M ocupa 5,63 GB y el proyector multimodal en F16 anade 0,92 GB. Con cache KV a 8192 tokens de contexto, el consumo total se situa de forma estimada en torno a 8-10 GB, aunque no hay mediciones oficiales en la informacion disponible.
- GPU recomendadas: tarjetas de consumo con 12 GB o mas de VRAM, como RTX 3060 de 12 GB, RTX 4070, RTX 4080 o RTX 4090. En el entorno profesional, A100 y H100 son sobredimensionadas para este tamano, pero funcionan sin problema.
- Cabe en GPU de consumo: si, siempre que se disponga de al menos 12 GB de VRAM para el modelo de lenguaje junto con la torre de vision a 8192 tokens de contexto. Con contextos menores o descarga parcial de capas a CPU tambien es viable en equipos de 8 GB.
- Opciones de despliegue: llama.cpp y sus herramientas (`llama-cli`, `llama-server`, `llama-mtmd-cli`), `llama-cpp-python`, y cualquier frontend basado en GGUF. Es imprescindible una compilacion de llama.cpp con soporte para la arquitectura `qwen35`. Para la edicion con imagenes hay que cargar el fichero `mmproj` con `--mmproj`.
- Latencia y throughput: no disponible. Al ser un modelo que genera hasta 3584 tokens en decodificacion greedy sin speculative decoding, la latencia depende fuertemente del hardware; se recomienda `flash_attn=True` y `n_gpu_layers=-1` para maximizar el rendimiento.
- Memoria adicional: el repositorio completo ocupa 6,5 GB, por lo que el almacenamiento necesario es reducido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Observaciones |
|---|---|---|---|---|---|
| rekuen/flux-3-image-klein-pup-GGUF (este) | 8,95 mil millones | No disponible (ejemplo con 8192) | GGUF Q4_K_M + mmproj F16 | Apache 2.0 | Conversion no oficial, requiere llama.cpp con soporte `qwen35` |
| black-forest-labs/flux-3-image-klein-pup | 8,95 mil millones | No disponible | Safetensors bfloat16 | Apache 2.0 | Modelo original de Black Forest Labs, referencia para uso en GPU con frameworks de PyTorch |
| Qwen/Qwen3.5-9B | No disponible | No disponible | No disponible | Apache 2.0 | Modelo base generalista del que deriva el fine-tune; no esta especializado en reescritura de prompts |

No se dispone de datos de rendimiento comparado entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Es una conversion no oficial: no esta afiliada ni respaldada por Black Forest Labs ni por el equipo Qwen, y el uso de las marcas registradas FLUX y Black Forest Labs queda sujeto a las politicas de sus propietarios.
- Idioma: el modelo esta etiquetado unicamente como ingles, por lo que el rendimiento en castellano u otros idiomas no esta garantizado.
- Dependencia de version: requiere una compilacion de llama.cpp con soporte para la arquitectura `qwen35`; versiones anteriores fallaran al cargar el modelo.
- Capa MTP ausente: el checkpoint original declara una capa de prediccion multi-token que no incluye pesos, lo que obligo a convertir con `--no-mtp`. Esto implica que no se puede aprovechar decodificacion multi-token especulativa con esta conversion.
- Cuantizacion sin matriz de importancia: el paso a Q4_K_M se hizo sin importance matrix, por lo que puede haber una perdida de calidad respecto al bfloat16 original que no esta cuantificada en la informacion disponible.
- Riesgo de alucinacion: al ser un modelo generativo de lenguaje, puede introducir elementos no presentes en la peticion original o en las imagenes de referencia; no hay evaluacion publicada de este comportamiento.
- Sesgos: no hay informacion sobre sesgos en los datos proporcionados.
- Uso en produccion: al no haber benchmarks ni mediciones de latencia, conviene validar el modelo con un conjunto de prompts propio antes de desplegarlo, y comprobar que la plantilla de chat se renderiza con `enable_thinking=False` para evitar salidas no deseadas.
- El ejemplo de la model card usa `create_completion` en lugar de `create_chat_completion` porque este ultimo no propaga el flag `enable_thinking` a la plantilla; omitir este detalle puede degradar los resultados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/rekuen/flux-3-image-klein-pup-GGUF
- Modelo original: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
- Modelo de generacion asociado: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de codigo de FLUX 3 Image Klein: https://github.com/black-forest-labs/flux-3-image-klein
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Commit del conversor usado: https://github.com/ggml-org/llama.cpp/commit/4df29be4f4c3673f428170fda944a5b19f743bb8

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden de la informacion del repositorio de HuggingFace y de las referencias que cita su model card.
