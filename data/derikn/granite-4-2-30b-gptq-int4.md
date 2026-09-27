# derikn/Granite-4.2-30B-GPTQ-INT4

## Resumen

Granite-4.2-30B-GPTQ-INT4 es una cuantizacion comunitaria de 4 bits del modelo ibm-granite/granite-4.2-30b, publicada por el usuario derikn. No es un modelo de IBM: se trata de un checkpoint derivado, generado con AutoRound 0.15.1 de Intel y exportado en formato GPTQ con pesos a 4 bits (W4A16), grupo de 128 y exportacion auto_gptq. El resultado ocupa 16,4 GB repartidos en 6 shards safetensors, frente a los 58,6 GB del checkpoint bf16 original, conservando el tokenizador, la plantilla de chat y la configuracion del modelo base.

El modelo hereda las capacidades del original: generacion de texto, razonamiento con modo thinking en tres estados, tool calling y conversacion multilingue en 12 idiomas, con una ventana de contexto nativa de 131.072 tokens. Esta pensado para servir un modelo de 29.276.770.304 parametros en hardware de estacion de trabajo o servidores modestos, y el autor lo ha validado en vLLM sobre GPU Intel Arc Pro B70 (backend XPU) con cache KV en fp8 y tensor parallelism en dos tarjetas.

Su relevancia es practica: reduce a menos de un tercio el espacio en disco de un 30B con licencia Apache 2.0, lo que permite despliegues on-premise con aceleradores Intel o NVIDIA sin renunciar al contexto largo ni a las capacidades de agente del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica si el modelo base es denso, MoE o hibrido; se conserva la del base ibm-granite/granite-4.2-30b) |
| Parametros totales | 29.276.770.304 (modelo base). El panel de safetensors del repo informa de 4.633.137.152, cifra que el autor atribuye al empaquetado de los pesos 4-bit en tensores int32 (ocho pesos por int32) |
| Parametros activos | no disponible (no se confirma que el modelo sea MoE) |
| Longitud de contexto | 131.072 tokens nativos. El modelo base documenta una extension opcional a 512K con extrapolacion RoPE, no incluida en este checkpoint |
| Tipos de cuantizacion | GPTQ weight-only 4-bit (W4A16), grupo 128, simetrico, desc_act off, damp_percent 0.01. lm_head y modulos no de texto mantenidos en 16 bits |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh (12 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (6 shards), exportacion auto_gptq/GPTQ, compatible con transformers |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base mas alla de indicar que es la misma: solo se cuantizan los pesos lineales, y la arquitectura, el tokenizador, la plantilla de chat y la configuracion coinciden con ibm-granite/granite-4.2-30b. No hay fine-tuning ni datos de entrenamiento adicionales en este checkpoint; es exclusivamente una conversion de precision.

El proceso de cuantizacion se ejecuto desde el checkpoint bf16 con AutoRound 0.15.1 sobre una Intel Arc Pro B70, con los pesos transferidos por streaming a la tarjeta para acotar el uso de VRAM y torch.compile activado en el paso de ajuste. La calibracion uso el conjunto por defecto del cuantizador, NeelNanda/pile-10k, con 128 muestras de 1024 tokens cada una y batch size 8. El autor advierte que el script contenedor no se ha publicado, por lo que el comando exacto no es reproducible tal cual; los parametros efectivos (formato auto_gptq, 4 bits, grupo 128, simetrico, desc_act off, damp_percent 0.01, exclusion de lm_head y modulos no de texto) son la receta completa.

## Capacidades

- Generacion de texto y conversacion multiturno, con plantilla de chat incluida e identica a la del modelo base.
- Razonamiento explicito con tres modos de thinking, seleccionables mediante `reasoning_effort` de la API de OpenAI o mediante la plantilla de chat: `none` (sin razonamiento, 0 tokens de razonamiento medidos), `low` (breve, en torno a 10 tokens) y pensamiento completo (entre 100 y 200 tokens en la prueba del autor). Los valores `minimal`, `medium`, `high`, `xhigh` y `max` se comportan todos como pensamiento completo.
- Tool calling y function calling, validado en vLLM con `--tool-call-parser qwen3_coder` y `--enable-auto-tool-choice`.
- Separacion del razonamiento y la respuesta final: vLLM lo expone en `message.reasoning` y un proxy LiteLLM en `reasoning_content`, mediante el parser `granite_thinking_parser.py` incluido en el repositorio.
- Capacidades de agente y razonamiento en varios pasos, apoyadas en la combinacion de thinking y tool calling.
- Soporte multilingue en 12 idiomas: ingles, aleman, espanol, frances, japones, portugues, arabe, checo, italiano, coreano, neerlandes y chino.
- Contexto largo de hasta 131.072 tokens, con soporte de prefix caching en vLLM.
- Servicio compatible con la API de OpenAI (`endpoints_compatible`) para su uso como sustituto directo en clientes existentes.

## Casos de uso

- Atencion al cliente automatizada: con 12 idiomas y 131.072 tokens de contexto, el modelo puede mantener conversaciones multiturno con historial largo y documentacion de producto intercalada, ademas de invocar herramientas internas (consulta de pedidos, estado de tickets) mediante tool calling.
- Agentes autonomos con acceso a herramientas: la combinacion de modo thinking y function calling permite construir bucles de razonamiento en varios pasos, por ejemplo para tareas de investigacion, extraccion de datos o automatizacion de flujos con APIs externas.
- Generacion y revision de codigo en produccion: el modelo soporta tool calling, de modo que puede integrarse en pipelines de CI/CD como revisor de cambios, generador de tests o asistente de refactorizacion, consumido desde un endpoint compatible con OpenAI.
- Analisis de documentos extensos: informes anuales, expedientes o contratos de decenas de miles de tokens caben en una sola pasada sin trocear, lo que simplifica los pipelines que hoy dependen de resumen jerarquico.
- Despliegue on-premise con hardware Intel: al estar validado en vLLM XPU sobre Intel Arc Pro B70, encaja en organizaciones con aceleradores Intel que necesitan inferencia local por requisitos de soberania de datos.
- Sistemas RAG con cache de prefijos: el prefix caching de vLLM reduce el coste de reutilizar el mismo contexto inyectado en consultas sucesivas, util en asistentes documentales con base de conocimiento fija.
- Traduccion y asistencia interna multilingue: cubre 12 idiomas con una sola instancia, lo que reduce la necesidad de mantener varios modelos especializados por idioma en soporte interno o documentacion.
- Auditoria y tareas de razonamiento controlado: el modo `low` permite acotar el gasto de tokens de razonamiento cuando el coste por consulta importa, mientras que el modo completo se reserva para problemas que requieren analisis profundo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta cuantizacion no incluye evaluaciones propias y remite expresamente a la model card del modelo base ibm-granite/granite-4.2-30b para consultar capacidades y resultados de evaluacion. Tampoco se aportan mediciones de perdida de calidad respecto al checkpoint bf16.

## Requisitos de hardware

- Pesos cuantizados: 16,4 GB en disco, en 6 shards safetensors, frente a 58,6 GB en bf16.
- VRAM estimada para inferencia: en torno a 17-19 GB con contexto corto, sumando pesos y sobrecarga del runtime (estimacion a partir del tamano de los pesos, no es un dato publicado). No se dispone del numero de capas ni de cabezas de atencion en la informacion proporcionada, por lo que no puede calcularse el tamano exacto del KV cache.
- GPU consumer: los pesos caben en tarjetas con 24 GB de VRAM o mas (por ejemplo, RTX 3090 o RTX 4090) para contextos moderados. Para explotar los 131.072 tokens completos hace falta mas memoria o repartir el modelo entre varias GPU.
- Configuracion validada por el autor: dos Intel Arc Pro B70 con tensor parallelism, cache KV en fp8_e4m3 y contexto completo de 128K. No se indica la VRAM de cada tarjeta.
- Opciones de despliegue: vLLM con backend XPU (probado con la imagen `vllm/vllm-openai-xpu:nightly`, vLLM 0.30.1rc1) y `--quantization gptq --dtype bfloat16 --trust-remote-code`. Otros backends con soporte GPTQ (AutoGPTQ, GPTQModel) no se mencionan en la informacion disponible. llama.cpp u Ollama requeririan una conversion a GGUF que este repositorio no incluye.
- Detalles de contenedor relevantes en Arc: `--device=/dev/dri`, `--group-add` para los grupos render y video, `--ipc=host`, `--security-opt seccomp=unconfined` y `ZE_AFFINITY_MASK`. Sin esa combinacion, Level Zero no detecta dispositivos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Granite-4.2-30B-GPTQ-INT4 (derikn) | 29.276.770.304 | 131.072 tokens | GPTQ W4A16, grupo 128 | 16,4 GB | Apache 2.0 | HuggingFace, validado en vLLM XPU |
| Granite-4.2-30B-AWQ-INT4 (derikn) | mismo modelo base | mismo modelo base | AWQ INT4 | no disponible | Apache 2.0 | HuggingFace |
| ibm-granite/granite-4.2-30b | 29.276.770.304 | 131.072 tokens (512K opcional con extrapolacion RoPE) | bf16 sin cuantizar | 58,6 GB | Apache 2.0 | HuggingFace, modelo oficial de IBM |

No se incluyen en la informacion proporcionada comparaciones con otros modelos abiertos de tamano similar ni datos de rendimiento que permitan contrastar calidad frente a ellos.

## Limitaciones y advertencias

- Cuantizacion no oficial: IBM no ha autorizado ni respalda este checkpoint. GRANITE es una marca registrada de International Business Machines Corporation. Para capacidades y evaluaciones hay que remitirse al modelo base.
- No se han publicado evaluaciones de la perdida de calidad introducida por la cuantizacion de 4 bits respecto al bf16 original.
- La calibracion se hizo con NeelNanda/pile-10k (128 muestras de 1024 tokens), un conjunto predominantemente en ingles; el comportamiento en otros idiomas puede degradarse mas de lo que lo haria una calibracion multilingue.
- Riesgo de alucinacion: no se aportan datos especificos de este checkpoint, pero es el comportamiento esperado de un modelo de lenguaje sin mecanismos de verificacion propios. El modo thinking no garantiza correccion factual.
- Comportamiento asimetrico del modo thinking: `minimal` no produce razonamiento minimo, sino pensamiento completo, y `medium`, `high`, `xhigh` y `max` son equivalentes entre si. La escala `reasoning_effort` de la API no se traduce en cinco niveles reales.
- Requiere `--trust-remote-code` en vLLM y el parser de razonamiento propio; el soporte fuera de vLLM (por ejemplo, en backends CUDA o en servidores distintos) no esta verificado en la informacion disponible.
- La seccion de pruebas de tool calling de la model card consultada esta truncada, por lo que la validacion de esta capacidad queda parcialmente documentada.
- La cuantizacion GPTQ no es directamente consumible por llama.cpp u Ollama sin una conversion previa a GGUF, no incluida en el repositorio.
- El contexto de 128K completo exige cuantizacion del KV cache (fp8 en la configuracion probada) y, segun el autor, reparto en dos GPU; no es un escenario de una sola tarjeta consumer.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de adopcion ni de validacion independiente por parte de terceros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/derikn/Granite-4.2-30B-GPTQ-INT4
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-30b
- Variante AWQ del mismo autor: https://huggingface.co/derikn/Granite-4.2-30B-AWQ-INT4
- AutoRound (Intel): https://github.com/intel/auto-round
- Conjunto de calibracion: https://huggingface.co/datasets/NeelNanda/pile-10k
