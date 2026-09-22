# Aimeeluvssya/gemma-4-E4B-it-OBLITERATED

## Resumen

Aimeeluvssya/gemma-4-E4B-it-OBLITERATED es una version modificada del modelo google/gemma-4-E4B-it en la que se ha aplicado una ablacion de pesos (abliteration) con el metodo OBLITERATUS en su variante `aggressive`, con el objetivo de eliminar el comportamiento de rechazo. El resultado declarado por el autor es un 0% de rechazo duro frente al 98,8% del modelo base, con 21 de las 42 capas del modelo modificadas quirurgicamente. El modelo se publica bajo licencia Apache 2.0 y esta disponible tanto en safetensors (bfloat16, 7 shards, aproximadamente 17 GB) como en GGUF cuantizado.

El modelo cuenta con 7.996.156.448 parametros reales segun los pesos en safetensors, muy por encima de los 4B que sugiere la nomenclatura E4B del nombre. Segun la model card, la arquitectura base (`gemma4`) incorpora pesos KV compartidos (`num_kv_shared_layers: 18`), modo de razonamiento (thinking mode) y un proyector multimodal mmproj para entrada de imagen y audio. No se especifica la longitud de contexto ni los idiomas soportados oficialmente.

La relevancia de esta ficha es doble. Por un lado, documenta un caso practico de abliteration sobre una arquitectura nueva con atencion de KV compartida, incluyendo un fallo relevante en la version 2 (eliminacion de 54 tensores de proyeccion K/V) y su correccion en la version 3. Por otro, es un ejemplo de publicacion generada casi por completo de forma autonoma por un agente (Hermes Agent) con menos de 10 indicaciones humanas. El repositorio no tiene descargas ni likes en el momento de redactar esta ficha, por lo que no existe validacion independiente de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia `gemma4`, con pesos KV compartidos (`num_kv_shared_layers: 18`), modo de razonamiento y proyector multimodal (mmproj) |
| Parametros totales | 7.996.156.448 (dato real de los pesos en safetensors) |
| Parametros activos | No disponible (la nomenclatura E4B sugiere un modelo con aproximadamente 4B efectivos, pero la model card no confirma si se trata de una arquitectura MoE ni el numero de parametros activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: Q4\_K\_M, Q5\_K\_M, Q8\_0; proyector mmproj en F16. Safetensors: bfloat16 sin cuantizar |
| Idiomas soportados | No disponible (el autor advierte de un ~4% de salidas en idiomas no solicitados, como tailandes o japones, y recomienda usar un system prompt en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bfloat16, 7 shards, ~17 GB) y GGUF (4.9 GB / 5.3 GB / 7.4 GB segun cuantizacion) |
| Tamano del repositorio | 36.1 GB |
| Tensores en el GGUF | 720 (todos intactos en la version 3) |
| Modelo base | google/gemma-4-E4B-it |

## Arquitectura y entrenamiento

No se ha entrenado ningun modelo desde cero: se parte de google/gemma-4-E4B-it y se aplica una ablacion de pesos con OBLITERATUS en modo `aggressive`, que combina SVD blanqueado (whitened SVD), cirugia de cabezas de atencion y activaciones winsorizadas. El corpus de contraste empleado consta de 842 pares de prompts contrastivos repartidos en 10 categorias. La intervencion afecta a 21 de las 42 capas del modelo. No hay datos publicados sobre tokens de entrenamiento, composicion del dataset, RLHF o DPO, ya que no se trata de un modelo entrenado sino de una modificacion post-hoc de pesos.

La innovacion tecnica relevante esta en como se resolvio la arquitectura `gemma4`. El autor documenta que el modelo base produce activaciones NaN en mas de 20 capas durante la extraccion en bfloat16, y que las capas 24 a 41 reutilizan los mismos tensores `k_proj` y `v_proj` que la capa 24. En la version 2 la proyeccion se aplico 18 veces sobre el mismo tensor compartido, corrompiendolo, y `save_pretrained` elimino esos tensores: el GGUF resultante tenia 666 tensores en lugar de 720, con la pila de atencion parcialmente destruida. La correccion de la version 3 consiste en proyectar una sola vez sobre la capa propietaria de los pesos KV compartidos y omitir la operacion en las capas que los toman prestados, de modo que la proyeccion limpia se propaga automaticamente a las 18 capas. No se documenta ninguna fase de ajuste fino posterior a la ablacion.

## Capacidades

- Generacion de texto y conversacion multi-turno, con plantilla de chat propia del modelo base.
- Entrada multimodal de imagen y audio mediante el proyector `mmproj-f16.gguf` (990 MB), requerido para entrada de imagen.
- Modo de razonamiento (thinking mode) heredado de la arquitectura del modelo base, citado por el autor como uno de los elementos que complico la ablacion.
- Ausencia total de rechazo duro: 0% de negativas explicitas ante peticiones, segun la evaluacion del autor con 100 prompts.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el autor solo indica que aproximadamente el 4% de las salidas pueden aparecer en idiomas no solicitados.
- Generacion de codigo y matematicas: no disponible; no se publican evaluaciones especificas.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo sirve como sujeto de estudio para medir hasta que punto la ablacion de pesos elimina el comportamiento de rechazo y como afecta eso a la coherencia, util para comparar tecnicas de abliteration sobre arquitecturas con KV compartida.
- Analisis de contenido sensible en entornos controlados: equipos de moderacion pueden usar una variante sin rechazo para generar ejemplos adversarios que luego alimenten clasificadores de seguridad, siempre dentro de un marco legal y etico definido.
- Pruebas de estres de guardrails propios: si se despliega un sistema con capas de seguridad externas, este modelo permite comprobar si esas capas aguantan cuando el modelo subyacente no ofrece ninguna negativa.
- Prototipado local en dispositivos con recursos limitados: la cuantizacion Q4\_K\_M de 4.9 GB permite ejecutar el modelo en un telefono de gama alta o en un portatil sin GPU dedicada mediante llama.cpp u Ollama, util para demos offline.
- Transcripcion y descripcion de imagenes en local: con el proyector mmproj se puede montar un asistente visual que funcione sin conexion, por ejemplo para catalogar fotos en un equipo personal.
- Evaluacion comparativa de cuantizaciones: el repositorio publica Q4\_K\_M, Q5\_K\_M y Q8\_0 del mismo modelo, lo que permite medir la degradacion de calidad y de coherencia en funcion de la cuantizacion sobre un caso real.
- Experimentos de reproducibilidad de ablacion: dado que el autor documenta el fallo de la version 2 y su correccion en la version 3, el modelo sirve como referencia para validar implementaciones propias de OBLITERATUS sobre arquitecturas nuevas.
- Generacion creativa sin restricciones tematicas: escritura de ficcion con material adulto o violento, un caso donde el rechazo del modelo base suele interrumpir la generacion, asumiendo la responsabilidad legal y editorial del contenido producido.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, MT-Bench u otros) en la informacion disponible. La model card solo incluye metricas de evaluacion propias, no comparables con las de la literatura:

| Metrica (autoevaluada por el autor) | Resultado | Notas |
|---|---|---|
| Tasa de rechazo duro | 0% | Frente al 98,8% declarado en el modelo base |
| Deflexion blanda | ~28% | El modelo cambia de tema en lugar de rechazar |
| Respuestas coherentes y centradas | ~51% | Respuestas detalladas y utiles |
| Salidas degeneradas | ~20% | Bucles de repeticion; se recomienda `repeat_penalty` de 1.1 |
| Idioma incorrecto | ~4% | Salidas ocasionales en tailandes o japones |
| Capas modificadas | 21 de 42 | Intervencion de ablacion |
| Tensores en el GGUF | 720 de 720 | Todos intactos en la version 3 |
| Calidad en la version 2 | 3.1/10 | Evaluacion con juez externo (Claude), segun el autor |

Advertencia metodologica: estas cifras proceden exclusivamente de la model card del autor, sin protocolo de evaluacion publicado, sin tamano de muestra detallado salvo en el caso del rechazo (100 prompts) y sin verificacion independiente. Deben tratarse como declaraciones del autor, no como resultados reproducibles.

## Requisitos de hardware

- VRAM estimada para inferencia en GPU, calculada a partir del tamano de los ficheros mas el margen de contexto y caché KV: aproximadamente 6 GB para Q4\_K\_M (4.9 GB de pesos), 6,5-7 GB para Q5\_K\_M (5.3 GB) y 8-9 GB para Q8\_0 (7.4 GB). Para los pesos bfloat16 completos conviene reservar 18-20 GB.
- Si cabe en GPU de consumo: si. Q4\_K\_M y Q5\_K\_M caben en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060, RTX 2070) y en GPUs integradas con memoria unificada suficiente; Q8\_0 requiere 10-12 GB (RTX 3060 de 12 GB, RTX 4070). El autor afirma que la version Q8\_0 cabe en 8 GB de RAM en CPU y que la Q4\_K\_M se ejecuta en un iPhone.
- GPU recomendadas: no se especifican en la model card. Para los pesos bfloat16 en transformers, una A100 de 40 GB o una H100 permiten cargar el modelo con contexto amplio y margen para batching; para las cuantizaciones GGUF basta cualquier GPU consumer con la VRAM indicada.
- Despliegue: llama.cpp (build b8665 o posterior), Ollama 0.20 o superior, LM Studio 0.3.16 o superior con backend de llama.cpp actualizado, koboldcpp en nightly reciente y text-generation-webui con llama-cpp-python actualizado. Los safetensors requieren Transformers en una version con soporte de `gemma4`. Soporte de vLLM o TGI: no disponible y no confirmado por el autor.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Nota de compatibilidad: al tratarse de una arquitectura nueva (`gemma4`), las versiones antiguas de las herramientas de inferencia fallan con errores de "unsupported architecture" o producen salidas incoherentes si se usa completion en bruto en lugar de la plantilla de chat.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo duro | Calidad declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| google/gemma-4-E4B-it (base) | 7.996.156.448 (segun pesos derivados) | No disponible | 98,8% | Referencia | Apache 2.0 | HuggingFace |
| gemma-4-E4B-it-OBLITERATED v2 | No disponible (GGUF con 666 tensores) | No disponible | ~0% | 3,1/10 (juez Claude) | Apache 2.0 | HuggingFace |
| gemma-4-E4B-it-OBLITERATED v3 (este modelo) | 7.996.156.448 | No disponible | 0% | ~51% de respuestas coherentes | Apache 2.0 | HuggingFace, GGUF y safetensors |
| Otras variantes abliteradas de ~4-8B | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparables con alternativas de otros autores, por lo que la comparacion se limita a la familia del propio modelo y a su version anterior. No se han encontrado en la busqueda web modelos similares con metricas verificables que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de rechazo: el modelo no se niega a ninguna peticion, lo que incluye contenido ilegal, danino o gravemente ofensivo si el usuario lo solicita. Desplegarlo como servicio publico sin capas de seguridad externas es responsabilidad exclusiva del operador.
- Alucinacion y baja fidelidad: no hay evaluaciones de veracidad publicadas. Un modelo de esta escala, con el 20% de salidas degeneradas declarado, no es adecuado para tareas que exijan precision factual verificable.
- Bucles de repeticion: aproximadamente el 20% de las salidas degeneran en repeticiones. El autor recomienda `repeat_penalty` de 1.1 como mitigacion parcial.
- Deriva de idioma: alrededor del 4% de las respuestas aparecen en idiomas no solicitados (tailandes, japones). Se recomienda fijar un system prompt en ingles.
- Deflexion blanda elevada: el 28% de las respuestas evitan el tema en lugar de responder, lo que reduce la utilidad practica incluso sin rechazo explicito.
- Contexto e idiomas no documentados: no se especifica la ventana de contexto ni la lista de idiomas soportados, lo que impide planificar despliegues multi-turno largos o multilingues con garantias.
- Compatibilidad de herramientas: la arquitectura `gemma4` exige versiones recientes de llama.cpp (b8665 o posterior), Ollama 0.20 o superior y LM Studio 0.3.16 o superior. Versiones anteriores fallan al cargar el modelo.
- Riesgo de calidad en cuantizaciones bajas: los pesos bfloat16 publicados pesan aproximadamente 17 GB y el repositorio ocupa 36,1 GB, lo que complica la verificacion manual de la integridad de los tensores. La version 2 del modelo ya sufrio perdida silenciosa de 54 tensores, por lo que conviene verificar el numero de tensores antes de desplegar.
- Validacion nula por la comunidad: el repositorio tiene 0 descargas y 0 likes en la fecha de la ficha, y la unica fuente de informacion es la propia model card del autor. No hay evaluaciones independientes.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero no exime del cumplimiento del RGPD, la normativa de servicios digitales ni las condiciones de uso de la plataforma donde se despliegue. La licencia del modelo base tambien es Apache 2.0 segun la informacion disponible.
- Proceso de creacion poco documentado: la model card indica que el modelo fue producido casi en su totalidad por un agente autonomo con menos de 10 indicaciones humanas, sin publicar el script exacto de ablacion ni los parametros de cada etapa, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aimeeluvssya/gemma-4-E4B-it-OBLITERATED
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Metodo OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Agente utilizado para la creacion: https://github.com/NousResearch/hermes-agent
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la busqueda web realizada; los resultados devueltos correspondian a servicios de traduccion y no guardan relacion con el modelo.
