# miesdevries/stay4s-unified-lora

## Resumen

Stay4S Unified LoRA es un adaptador LoRA publicado por miesdevries (Het Nieuwe Begin BV, Mitchell de Vries) sobre el modelo base Qwen3-4B. Su objetivo declarado es consolidar en un unico adaptador el comportamiento de seis agentes de IA distintos, entrenados a partir de 33.994 registros, dentro del ecosistema denominado Stay4S, que se presenta como un ecosistema de IA neerlandes soberano, autoalojado y sin dependencia de grandes proveedores tecnologicos.

El modelo esta orientado exclusivamente al neerlandes (codigo de idioma `nl`) y a flujos de trabajo multiagente. Al tratarse de un adaptador LoRA y no de un modelo completo, su tamano real de parametros entrenables no se especifica en la informacion disponible; hereda la arquitectura, la ventana de contexto y las capacidades del modelo base sobre el que se aplica.

La relevancia del proyecto es mas organizativa que tecnica: propone una alternativa de despliegue local para organizaciones neerlandesas que necesiten procesar texto en su idioma sin enviar datos a servicios externos. No obstante, la informacion publicada es muy limitada: el propio autor indica que el entrenamiento esta "en progreso", no se han publicado resultados de evaluacion, no se detalla la composicion del dataset ni los hiperparametros, y el repositorio registra 0 descargas y 0 "likes" en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only denso (modelo base Qwen3-4B); rango, alpha y modulos objetivo no disponibles |
| Parametros totales | Modelo base: 4B (Qwen3-4B). Tamano del adaptador LoRA: no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion del adaptador. El modelo base Qwen3-4B declara 32.768 tokens nativos, ampliables a 131.072 con YaRN segun su documentacion oficial |
| Tipos de cuantizacion | No disponible. Al ser un adaptador LoRA, las cuantizaciones aplicables dependen del modelo base fusionado (fp16, int8, GGUF Q4/Q5/Q8 en llama.cpp/Ollama) |
| Idiomas soportados | Neerlandes (`nl`) como idioma objetivo declarado |
| Licencia | `other` (licencia no estandar; no se detallan los terminos en la model card) |
| Formato de pesos | No disponible explicitamente; al publicarse como repositorio LoRA se asume safetensors de adaptador PEFT, aunque no se confirma |
| Uso declarado | `ollama run stay4s-lora` (Ollama) y `snapshot_download("miesdevries/stay4s-unified-lora")` (Python) |
| Dataset de entrenamiento | 33.994 registros procedentes de 6 agentes (composicion no detallada) |
| Estado | Entrenamiento en progreso segun la model card |
| Fecha de creacion (metadatos) | 2026-09-27 |
| Fecha de ultima actualizacion | 2026-09-27 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion publicada describe un unico adaptador LoRA entrenado sobre Qwen3-4B, cuyo proposito es unificar el comportamiento de seis agentes en un solo conjunto de pesos de adaptacion, a partir de 33.994 registros. No se especifican el rango del LoRA, los modulos sobre los que se aplica (q_proj, k_proj, v_proj, o_proj, mlp), la tasa de aprendizaje, el numero de epocas, la longitud de secuencia de entrenamiento ni si se aplicaron tecnicas de alineacion adicionales como SFT, DPO o RLHF. Tampoco se detalla como se generaron los 33.994 registros: si provienen de trazas de conversacion de los seis agentes, de anotacion humana o de sintesis con otro modelo.

El modelo base Qwen3-4B, segun la documentacion publica de su desarrollador, es un transformer decoder-only denso de aproximadamente 4.000 millones de parametros, con atencion de consultas agrupadas (GQA), 36 capas, una ventana de contexto nativa de 32.768 tokens ampliable a 131.072 mediante escalado YaRN, y un modo de razonamiento explicito ("thinking") que puede activarse o desactivarse. Estas caracteristicas son atribuibles al modelo base y no implican que el adaptador las preserve o las explote correctamente, dado que no se ha publicado ninguna evaluacion al respecto.

No se describe ninguna innovacion tecnica propia del adaptador: ni decodificacion especulativa, ni atencion lineal, ni mecanismos de enrutamiento entre agentes. La etiqueta "unified" y "multi-agent" sugiere que el objetivo es que un unico modelo cubra las tareas de los seis agentes, pero el mecanismo concreto (prompting, tokens especiales, enrutado implicito) no se documenta.

## Capacidades

- Generacion de texto en neerlandes: es el unico idioma objetivo declarado en las etiquetas del repositorio.
- Comportamiento de agente: el adaptador se presenta como "agent AI" combinada, orientada a tareas de agente mas que a generacion generica.
- Consolidacion multiagente: se declara el entrenamiento conjunto de seis agentes en un solo adaptador, lo que sugiere capacidad para cubrir varios roles o dominios dentro de un mismo flujo, aunque no se enumeran cuales son esos seis agentes.
- Capacidades heredadas del modelo base: al aplicarse sobre Qwen3-4B, teoricamente puede heredar generacion de codigo, matematicas basicas, seguimiento de instrucciones, tool calling y modo de razonamiento; sin embargo, no hay ninguna confirmacion publicada de que estas capacidades se conserven tras el ajuste LoRA.
- Capacidades no documentadas: no hay informacion sobre soporte de function calling especifico, razonamiento multi-paso verificado, vision, audio ni uso de herramientas en el adaptador.
- Capacidades multilingues: no disponibles; el unico idioma declarado es el neerlandes.

## Casos de uso

- Atencion al cliente en neerlandes para pymes locales: el adaptador esta afinado especificamente en este idioma, por lo que puede gestionar consultas de clientes neerlandofonos con un vocabulario y registro mas cercanos que un modelo multilingue generico, siempre que se valide antes su calidad real.
- Procesamiento de documentacion administrativa neerlandesa: extraccion y resumen de contratos, facturas o correspondencia con la administracion (por ejemplo, comunicaciones con la KvK o con la autoridad fiscal), desplegado en local.
- Orquestacion de flujos multiagente internos: dado su entrenamiento sobre trazas de seis agentes, puede emplearse como modelo unico que cubra varios roles de un pipeline (clasificacion, extraccion, redaccion de respuesta) reduciendo el numero de modelos que hay que mantener en produccion.
- Despliegue soberano y cumplimiento del RGPD: al ser un modelo autoalojado y de tamanio reducido, permite procesar datos personales de ciudadanos neerlandeses o europeos sin salida de datos hacia API de terceros.
- Motor de RAG sobre corpus en neerlandes: uso como generador final en un pipeline de recuperacion sobre bases documentales internas de una organizacion neerlandesa, con el modelo base cuantizado para caber en una GPU de gama media.
- Asistente educativo o de soporte interno en neerlandes: generacion de resumenes, preguntas de repaso o respuestas a preguntas frecuentes de empleados, con coste de inferencia bajo por el tamanio de 4B del modelo base.
- Prototipado rapido en Ollama: la model card ofrece un comando directo de Ollama, lo que facilita probar el adaptador en una estacion de trabajo sin infraestructura de servido dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna evaluacion (MMLU, GSM8K, HumanEval, benchmarks en neerlandes como DutchMMLU o similar), ni comparaciones con el modelo base sin adaptar, ni metricas de perdida de validacion. Tampoco se especifica el estado de convergencia del entrenamiento, que el autor describe como "in progress".

En consecuencia, no es posible afirmar que el adaptador mejore, mantenga o degrade el rendimiento de Qwen3-4B en ninguna tarea.

## Requisitos de hardware

- VRAM para inferencia (estimaciones basadas en el modelo base Qwen3-4B; el adaptador anadido es despreciable en memoria respecto al modelo base):
  - fp16 / bf16: aproximadamente 8-9 GB de VRAM para pesos, mas memoria para el contexto KV cache.
  - int8: aproximadamente 4-5 GB de VRAM.
  - GGUF Q4_K_M: aproximadamente 2,5-3,5 GB de VRAM, dependiendo de la longitud de contexto.
- GPU consumer: el modelo base cabe sin problema en GPUs de consumo. Con cuantizacion Q4 es viable en tarjetas de 6-8 GB (RTX 3060, RTX 4060, RTX 2070); en fp16 requiere 10-12 GB o mas (RTX 3080 12 GB, RTX 4070 Ti, RTX 4090 con margen amplio).
- GPU de datacenter: A100, H100, L40S y similares ejecutan el modelo con holgura y permiten lotes grandes o contextos largos.
- CPU: al ser un modelo de 4B, la inferencia en CPU es viable con llama.cpp u Ollama, aunque con latencias altas en generacion larga.
- Opciones de despliegue: Ollama (indicado en la propia model card con `ollama run stay4s-lora`), llama.cpp, vLLM, Hugging Face Text Generation Inference, y transformers + PEFT para cargar el adaptador sin fusionar. Para Ollama y llama.cpp es necesario convertir el modelo fusionado a GGUF, paso que la model card no documenta.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este adaptador, por lo que la comparacion se limita a caracteristicas estructurales y no a calidad. La tabla siguiente compara el modelo con alternativas de la misma categoria (modelos pequenos con foco en neerlandes o en despliegue local).

| Modelo | Parametros | Contexto | Licencia | Enfoque | Datos de rendimiento |
|---|---|---|---|---|---|
| Stay4S Unified LoRA | Adaptador sobre Qwen3-4B (tamano de adaptador no disponible) | No disponible (base: 32.768 tokens) | `other` | Neerlandes, multiagente, autoalojado | No publicados |
| Qwen3-4B (modelo base) | 4B | 32.768 tokens, 131.072 con YaRN | Apache 2.0 | Multilingue generalista (119 idiomas) | Publicados por el desarrollador del modelo base |
| Qwen2.5-3B-Instruct | 3B | 32.768 tokens | Apache 2.0 (salvo excepcion de 3B) | Multilingue generalista | Publicados |
| Llama-3.2-3B-Instruct | 3B | 128.000 tokens | Llama 3.2 Community License | Multilingue generalista, 8 idiomas oficiales | Publicados |
| GEITje-7B (familia de modelos neerlandeses) | 7B | Depende de la variante | Segun variante | Afinado especificamente en neerlandes | Publicados por sus autores |

La comparacion directa de rendimiento entre Stay4S Unified LoRA y cualquiera de estas alternativas no es posible con la informacion disponible, ya que el autor no ha publicado ninguna evaluacion. Ademas, la licencia `other` del adaptador impide asumir los terminos de la licencia Apache 2.0 del modelo base.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni comparacion con el modelo base, ni metricas de validacion. No se puede asumir que el adaptador mejore a Qwen3-4B en ninguna tarea.
- Entrenamiento incompleto: la propia model card indica "Training in progress", por lo que los pesos publicados pueden corresponder a un punto intermedio del entrenamiento y no a una version final.
- Repositorio sin validacion comunitaria: 0 descargas y 0 "likes" en el momento de redactar la ficha. No hay evidencia de uso en produccion ni de revision independiente.
- Documentacion insuficiente: no se detallan el rango del LoRA, los hiperparametros, la composicion del dataset, el proceso de generacion de los 33.994 registros ni los seis agentes que se supone que consolida.
- Licencia ambigua: la licencia declarada es `other`, sin texto de licencia publicado en la informacion disponible. Esto impide determinar si el uso comercial esta permitido, si hay obligaciones de atribucion o si existen restricciones derivadas del modelo base.
- Riesgo de sobreajuste al dominio de entrenamiento: al estar afinado sobre trazas de seis agentes concretos, es probable que su comportamiento fuera de esos flujos sea degradado respecto al modelo base, aunque esto no se ha medido.
- Riesgo de alucinacion: no se dispone de ninguna medicion de factualidad. Como cualquier modelo de 4B, es propenso a generar contenido plausible pero incorrecto, especialmente en dominios especializados.
- Limitacion idiomatica: solo se declara neerlandes. El comportamiento en otros idiomas no esta documentado y podria haberse degradado respecto al modelo base multilingue.
- Limitacion de contexto: no se especifica si el ajuste LoRA se realizo con secuencias largas; en muchos flujos de afinado con LoRA se entrena con secuencias cortas, lo que puede degradar el rendimiento del modelo base en contextos largos.
- Metadatos anomalos: las fechas de creacion y actualizacion del repositorio (2026-09-27) son posteriores a la fecha de redaccion habitual de este tipo de fichas, lo que conviene verificar antes de citar el modelo.
- Busqueda web sin resultados utiles: las consultas realizadas no devolvieron informacion tecnica relevante sobre el modelo, el proyecto Stay4S o sus seis agentes. Los unicos enlaces encontrados no guardan relacion con el modelo y se han omitido deliberadamente.
- Dependencia del autor: no hay publicaciones academicas, informes tecnicos ni repositorios de evaluacion asociados. Toda la informacion proviene de la propia model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/miesdevries/stay4s-unified-lora
- Sitio web del proyecto Stay4S: https://stay4s.com
- Repositorio GitHub citado en la model card: https://github.com/hetnieuwebeginbv-glitch
- Modelo base Qwen3-4B (referencia de arquitectura y contexto): no se proporciona enlace en la informacion disponible
- Paper, blog tecnico o demo del adaptador: no disponible
- Resultados de benchmarks: no disponible
