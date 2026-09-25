# Lo-llol12/aurevo-ai-gguf

## Resumen

aurevo-ai-gguf es un repositorio de pesos en formato GGUF publicado por el usuario Lo-llol12 en HuggingFace. Se trata de una conversión a GGUF, realizada con Unsloth, de un modelo derivado de Qwen3-8B, tal y como indican el tag `qwen3` y el nombre del único archivo publicado: `Huihui-Qwen3-8B-abliterated-v2.Q4_K_M.gguf`. El recuento de parámetros declarado en los metadatos del repositorio es de 8.190.735.360 (aproximadamente 8.190 millones), coherente con un transformer denso de la familia Qwen3-8B.

El interés del modelo reside en su formato: al distribuirse únicamente como GGUF cuantizado en Q4_K_M, está pensado para inferencia local con llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp), sin necesidad de GPU de datacenter ni de servidores de inferencia de alto rendimiento. La referencia "abliterated" en el nombre del archivo apunta a un modelo al que se le han eliminado o atenuado las capas de rechazo (refusal) mediante técnicas de *abliteration*, y el prefijo "aurevo-ai" sugiere un ajuste adicional sobre esa base, aunque el repositorio no documenta ni el proceso de fine-tuning ni la receta de datos empleada.

La relevancia de esta ficha es, en gran medida, una advertencia: el repositorio registra 0 descargas y 0 likes, no declara licencia, no declara idiomas, no incluye resultados de benchmarks ni una model card descriptiva más allá de las instrucciones de uso con Unsloth y `llama-cli`, y sus metadatos temporales son atípicos. Cualquier evaluación seria debería tratar este artefacto como no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal (decoder-only), familia Qwen3; inferido del tag `qwen3` y del nombre del archivo, no documentado en el repositorio |
| Parametros totales | 8.190.735.360 (8,19 mil millones), segun metadatos del repositorio |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No disponible para este repositorio; la base Qwen3-8B declara 32.768 tokens nativos y 131.072 con YaRN, pero no se confirma que este GGUF conserve esa configuracion ni que el ajuste la haya modificado |
| Tipos de cuantizacion | Unicamente Q4_K_M (archivo `Huihui-Qwen3-8B-abliterated-v2.Q4_K_M.gguf`) |
| Idiomas soportados | No disponible (el repositorio no declara idiomas; la base Qwen3-8B declara soporte para 119 idiomas y dialectos, no confirmado para esta derivacion) |
| Licencia | No disponible (el campo de licencia del repositorio esta vacio; la base Qwen3-8B se publica bajo Apache 2.0, pero el derivado no lo explicita) |
| Formato de pesos | GGUF (cuantizacion Q4_K_M); no se publican safetensors del modelo ajustado |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura mas alla del tag `qwen3` y del nombre de archivo, que remite a `Huihui-Qwen3-8B-abliterated-v2`. Por tanto, lo unico que puede afirmarse con los datos disponibles es que se trata de una conversion a GGUF, mediante la libreria Unsloth, de un modelo de aproximadamente 8.190 millones de parametros derivado de la familia Qwen3-8B. La arquitectura esperable en esa familia es un transformer denso decoder-only con Grouped Query Attention y embeddings rotatorios (RoPE), pero esto es una inferencia sobre la base y no un dato confirmado en el repositorio.

Tampoco hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO u otras. La model card se limita a indicar que el modelo se ajusto y convirtio a GGUF con Unsloth y a mostrar los comandos de uso (`llama-cli -hf Lo-llol12/aurevo-ai-gguf --jinja`). El sufijo `abliterated-v2` indica que la base ya habia sido sometida a un proceso de abliteration antes de la conversion, y el prefijo `aurevo-ai` sugiere un ajuste adicional del que no se ofrece ningun detalle. La innovacion tecnica destacable es, en la practica, el propio pipeline de cuantizacion a Q4_K_M con Unsloth, que permite ejecutar un modelo de 8B en hardware de consumo.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y la plantilla Jinja (`--jinja`) indican uso orientado a dialogo multi-turno con formato de chat.
- Razonamiento y matematicas: capacidad heredada esperable de la familia Qwen3, no verificada ni documentada para este repositorio.
- Generacion de codigo: capacidad heredada esperable de la familia Qwen3, no verificada para esta derivacion.
- Tool calling / function calling: no documentado. La base Qwen3 incluye soporte de function calling, pero no hay confirmacion de que este ajuste lo conserve ni de que la plantilla Jinja publicada lo exponga.
- Comportamiento de agente y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no declaradas en el repositorio.
- Modo "thinking": no documentado. La familia Qwen3 incorpora modo de razonamiento explicito, pero el repositorio no indica si esta activo, desactivado o eliminado tras la abliteration.
- Vision o audio: no disponible. El comando `llama-mtmd-cli` se menciona en la plantilla generica de Unsloth, pero el unico archivo publicado corresponde a un modelo de texto y no hay proyector multimodal en el repositorio.
- Ausencia deliberada de rechazos: la abliteration implica que el modelo tiende a no negarse a peticiones que un modelo alineado rechazaria. Debe considerarse una caracteristica, no una capacidad funcional neutra.

## Casos de uso

- Prototipado local de asistentes conversacionales: al ser un GGUF Q4_K_M de 8B, puede ejecutarse en un portatil con GPU de 8 GB o incluso en CPU con RAM suficiente, lo que permite iterar sobre prompts y plantillas de chat sin coste de API.
- Analisis de texto y resumen en local con requisitos de privacidad: empresas que no pueden enviar datos a APIs externas pueden desplegar `llama-server` en una maquina interna y procesar documentos confidenciales sin salida de red.
- Experimentacion academica sobre abliteration: el modelo sirve como punto de comparacion para estudiar como la eliminacion de rechazos afecta a la utilidad, la coherencia y la seguridad de un modelo de 8B, siempre que se documente el origen de la base.
- Generacion de codigo asistida en entornos aislados: integrable en editores con backend compatible con llama.cpp para autocompletado y explicacion de fragmentos, sin conexion externa; requiere validar previamente la calidad real, no documentada.
- Chatbots de dominio cerrado con ajuste previo: si el prefijo `aurevo-ai` corresponde efectivamente a un fine-tuning sobre un dominio concreto, el modelo podria usarse en atencion al cliente especializada, aunque el repositorio no identifica ese dominio ni aporta ejemplos.
- Evaluacion de pipelines de inferencia GGUF: util como sujeto de prueba para medir throughput y latencia de llama.cpp frente a otros backends en hardware concreto, ya que la cuantizacion Q4_K_M es la mas habitual en despliegues de consumo.
- Base para destilacion o generacion de datos sinteticos: un modelo de 8B sin capas de rechazo puede emplearse para generar datasets sinteticos en dominios donde un modelo alineado se negara, con la advertencia legal y etica correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, MT-Bench ni de ningun otro conjunto, no aporta comparaciones con modelos de referencia y registra 0 descargas y 0 likes en el momento de la consulta. Tampoco se dispone de mediciones de latencia o throughput propias del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en Q4_K_M ocupan aproximadamente 4,7-5,0 GB (8,19 mil millones de parametros a ~4,85 bits por peso). Con cache KV en fp16 y una ventana de 8.192 tokens hay que sumar del orden de 1,2 GB; con 32.768 tokens, del orden de 4,7 GB adicionales. Cifras orientativas, calculadas a partir del recuento de parametros y de la configuracion publica esperable de Qwen3-8B, no medidas sobre este archivo.
- VRAM practica recomendada: 8 GB para contexto corto (hasta 8k) y 12-16 GB para contexto largo (32k) con cache KV en fp16. Cuantizando la cache KV a q8_0 se reduce aproximadamente a la mitad el coste de contexto.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, L4, A10G). En A100 o H100 funciona, pero esta enormemente sobredimensionada para un modelo de 8B en Q4.
- Compatibilidad con GPU de consumo: si. Cabe en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090 y en equipos Apple Silicon con memoria unificada de 16 GB o mas. En GPUs de 8 GB funciona con contexto reducido. En CPU pura es viable con 8-16 GB de RAM, a velocidades de pocos tokens por segundo.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier frontend compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de HuggingFace, aunque el formato GGUF no es el nativo de TGI. vLLM y SGLang no cargan GGUF de forma nativa en sus configuraciones habituales; requeririan conversion a safetensors, que este repositorio no publica.
- Latencia y throughput estimados: no disponibles. No hay mediciones del autor, del repositorio ni de terceros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| aurevo-ai-gguf (este) | 8,19 B | No disponible | No disponible | Solo GGUF Q4_K_M, 0 descargas | No disponible |
| Qwen3-8B | 8,2 B | 32.768 nativo / 131.072 con YaRN | Apache 2.0 | Pesos safetensors y GGUF oficiales | Reportado por el autor de Qwen3 en su model card |
| Llama-3.1-8B-Instruct | 8,03 B | 128.000 | Llama 3.1 Community License | Safetensors y GGUF en el repositorio oficial de Meta | Reportado por Meta |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32.000 | Apache 2.0 | Safetensors y GGUF | Reportado por Mistral |
| Gemma-2-9B-it | 9,24 B | 8.192 | Gemma Terms of Use | Safetensors y GGUF | Reportado por Google |

Los datos de la columna de rendimiento corresponden a los modelos de referencia segun sus respectivas model cards publicas; no se dispone de ninguna medicion de este derivado en concreto, por lo que no es posible afirmar si iguala, mejora o degrada las cifras de su base.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia. Aunque la base Qwen3-8B se publica bajo Apache 2.0, un derivado sin licencia explicita no puede asumirse como reutilizable en produccion ni en uso comercial. Es imprescindible contactar con el autor o abstenerse de usarlo comercialmente.
- Abliteration: la eliminacion de las capas de rechazo implica una probabilidad elevada de generar contenido danino, ilegal o inseguro ante peticiones que un modelo alineado rechazaria. No es apto para aplicaciones de cara al publico sin un filtro de seguridad adicional por delante.
- Riesgo de alucinacion: no evaluado. No hay benchmarks ni pruebas de fidelidad factual para este repositorio, y la cuantizacion Q4_K_M introduce ademas una degradacion adicional respecto al modelo en precision completa.
- Trazabilidad del ajuste: el nombre "aurevo-ai" sugiere un fine-tuning propio, pero no se documenta ni el dataset, ni el metodo, ni la epoca, ni la relacion exacta con `Huihui-Qwen3-8B-abliterated-v2`. No es posible reproducir el modelo.
- Idioma: no se declaran idiomas soportados. Sin evaluacion, no puede asumirse un rendimiento correcto en castellano, mas alla del multilingüismo general de la base.
- Contexto: no se confirma la longitud de contexto efectiva del GGUF; la plantilla Jinja publicada y la configuracion de RoPE del archivo determinan el limite real, y no se documentan.
- Metadatos atipicos: el repositorio declara fechas de creacion y actualizacion de 2026-09-25, separadas por 44 segundos, sin historial de versiones. Conviene verificar la integridad del archivo antes de desplegarlo.
- Adopcion nula: 0 descargas y 0 likes significan que el artefacto no ha sido validado por terceros. No hay issues, discusiones ni informes de fallos.
- Sin garantias de soporte: no hay mantenimiento, ni version en safetensors, ni cuantizaciones alternativas, ni plan de actualizacion documentado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Lo-llol12/aurevo-ai-gguf
- Unsloth (herramienta usada para el ajuste y la conversion a GGUF): https://github.com/unslothai/unsloth
- llama.cpp (backend de inferencia indicado en la model card): https://github.com/ggml-org/llama.cpp
- Posible modelo base, inferido del nombre del archivo y no verificado desde este repositorio: https://huggingface.co/huihui-ai/Huihui-Qwen3-8B-abliterated-v2
- Familia Qwen3 (modelo base de referencia): https://huggingface.co/Qwen/Qwen3-8B

Nota: la busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo. Los enlaces obtenidos correspondian a resultados de loteria francesa y a un portal politico, sin ninguna conexion con el repositorio. No se han localizado papers, blogs, demos ni repositorios adicionales que mencionen `aurevo-ai-gguf` o su autor.
