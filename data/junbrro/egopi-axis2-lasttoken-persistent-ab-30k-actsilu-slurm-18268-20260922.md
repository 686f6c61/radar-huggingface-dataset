# junbrro/egopi-axis2-lasttoken-persistent-AB-30k-actsilu-slurm-18268-20260922

## Resumen

`egopi-axis2-lasttoken-persistent-AB-30k-actsilu-slurm-18268-20260922` es un checkpoint de pesos publicado por el usuario `junbrro` en HuggingFace. Se trata de un modelo de aproximadamente 6.915 millones de parametros (6,9 B) almacenado en formato safetensors, con un tamano de repositorio de 13,9 GB. La model card es extremadamente escueta: indica que corresponde al paso final 30.000 de un entrenamiento cuyo origen se identifica con el identificador "18268" y que se incluyen unicamente los pesos finales y la configuracion, excluyendo el estado del optimizador y del generador de numeros aleatorios.

El nombre del repositorio aporta pistas sobre el proceso de entrenamiento (persistencia de "last token", sufijo "actsilu", identificador de job de Slurm y fecha 2026-09-22), pero la model card no documenta arquitectura, dataset, objetivo de entrenamiento ni procedimiento de alineacion. La unica etiqueta tecnica presente es `RLDX-1`, que no viene acompanada de explicacion alguna. Se menciona ademas un directorio `actlat/` que contendria un "tokenizer de acciones" cuando sea aplicable, lo que sugiere un pipeline orientado a agentes o a generacion de acciones, sin que esto pueda confirmarse con la informacion disponible.

La relevancia de esta publicacion es limitada y de caracter experimental: cero descargas, cero "likes", sin licencia declarada y sin resultados de evaluacion. Su interes principal es como artefacto de reproduccion de un pipeline de entrenamiento concreto (el job de Slurm 18268), no como modelo listo para produccion. Cualquier uso serio exige primero auditar la configuracion incluida en el repositorio y validar el comportamiento del checkpoint de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (unica etiqueta tecnica: `RLDX-1`; no se documenta la familia arquitectonica) |
| Parametros totales | 6.915.102.808 (≈6,9 B), dato real de safetensors |
| Parametros activos | no disponible (no consta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos en safetensors, sin versiones GGUF, GPTQ ni AWQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,9 GB |
| Paso de entrenamiento final | 30.000 (segun model card) |
| Origen del checkpoint | job identificado como 18268 (segun model card) |
| Componentes incluidos | pesos finales y configuracion; se excluye estado de optimizador y de RNG |
| Carpeta adicional | `actlat/` (tokenizer de acciones, "when applicable") |
| Autor | junbrro |
| Fecha de publicacion | 2026-09-22 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion verificable sobre la arquitectura. La model card no indica si se trata de un transformer denso, un MoE, un modelo de espacio de estados o una arquitectura hibrida, ni especifica la dimension oculta, el numero de capas, el numero de cabezas de atencion o el tipo de positional encoding. La etiqueta `RLDX-1` es el unico descriptor tecnico y no se explica en ningun documento accesible. Tampoco se documenta la longitud de contexto soportada ni el tokenizer principal (solo se menciona un posible tokenizer de acciones empaquetado en `actlat/`).

Respecto al entrenamiento, los unicos datos disponibles son el paso final (30.000), el identificador de origen (18268) y el hecho de que el checkpoint excluye el estado del optimizador y del RNG, lo que lo hace adecuado para inferencia o para reiniciar un fine-tuning desde cero de optimizador, pero no para reanudar el entrenamiento original de forma exacta. El sufijo `actsilu` del nombre sugiere el uso de SiLU como funcion de activacion, el fragmento `lasttoken-persistent` apunta a alguna variante de procesamiento del ultimo token y `AB` podria referirse a una configuracion experimental de tipo A/B, pero ninguna de estas interpretaciones esta confirmada por el autor. No hay informacion sobre volumen de tokens, composicion del dataset, ni sobre si se aplico RLHF, DPO, RLVR u otra tecnica de post-entrenamiento.

Un detalle operativo relevante que si aparece en la model card es que la configuracion conserva rutas absolutas del cluster de origen, con lo que es imprescindible remapear dichas rutas antes de intentar cargar el modelo en una maquina distinta.

## Capacidades

- Generacion de texto: no confirmada; la informacion disponible no permite verificar capacidades generativas basicas.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Tool calling / function calling: no confirmado. La presencia de un tokenizer de acciones (`actlat/`) es compatible con un uso orientado a acciones, pero no se documenta ninguna interfaz de este tipo.
- Soporte de agentes y razonamiento multi-paso: no confirmado, aunque el nombre del checkpoint sugiere un pipeline orientado a acciones.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.
- Modo "thinking" o razonamiento extendido: no disponible.
- Fine-tuning adicional: tecnicamente posible si la arquitectura es compatible con las librerias estandar, aunque no hay confirmacion de soporte por parte del autor.

## Casos de uso

- Auditoria y reproduccion de experimentos: el checkpoint permite inspeccionar la configuracion de un entrenamiento concreto (job 18268, paso 30.000) y compararla con otros checkpoints del mismo autor. Es el uso mas directo y realista dado el estado de la publicacion.
- Analisis de tokenizers de acciones: la carpeta `actlat/` puede estudiarse para entender como se codifican las acciones en este pipeline, comparandola con esquemas de tool calling convencionales.
- Fine-tuning desde cero de optimizador: al excluir el estado del optimizador, el checkpoint sirve como peso inicial limpio para nuevos ajustes sin arrastrar el estado del entrenamiento previo.
- Comparacion de variantes A/B: si el autor publica otros checkpoints con el mismo esquema de nombres, este modelo puede actuar como uno de los brazos de la comparacion experimental (el sufijo `AB` apunta a esa posibilidad).
- Pruebas de compatibilidad de runtime: util para comprobar si librerias estandar (transformers, vLLM, llama.cpp) pueden cargar la arquitectura y el tokenizer incluidos, algo que solo puede determinarse empiricamente.
- Uso como asistente conversacional o generador en produccion: solo planteable si una evaluacion propia confirma que el modelo es un LLM causal generalista con comportamiento estable. En el estado actual de la informacion, no es un caso de uso recomendable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y la busqueda web realizada no ha devuelto documentacion tecnica asociada al modelo (los resultados obtenidos correspondian a servicios de correo electronico sin ninguna relacion con el repositorio).

## Requisitos de hardware

Las cifras de VRAM que se indican a continuacion son estimaciones derivadas del recuento real de parametros (6.915.102.808), no datos publicados por el autor. Hay que anadir overhead de activaciones, cache KV y framework, que crece con la longitud de contexto, aun no documentada.

- Pesos en fp16/bf16: aproximadamente 13,8 GB solo en pesos; con overhead, unos 15-18 GB. Cabe en una RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100 o L40S.
- Pesos en int8: aproximadamente 6,9 GB; con overhead, 9-11 GB. Cabe en RTX 4080, RTX 3090, L4 o A10G.
- Pesos en int4 (GPTQ/AWQ/GGUF Q4): aproximadamente 3,5-4 GB; con overhead, 6-8 GB. Cabe en GPU de consumo con 8-12 GB, como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070.
- CPU: viable solo tras cuantizacion a 4 bits, con un consumo de RAM del orden de 5-6 GB mas el coste de contexto.
- Cuantizaciones oficiales: no existen en el repositorio; cualquier cuantizacion tendria que generarla el propio usuario, y solo si la arquitectura es soportada por la herramienta correspondiente.
- Opciones de despliegue: vLLM, TGI y SGLang son las opciones naturales para safetensors en GPU, pero requieren soporte explicito de la arquitectura, no confirmado. llama.cpp y Ollama exigirian primero una conversion a GGUF y soporte de arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No es posible establecer una comparativa fiable con modelos de la misma categoria porque no se ha identificado la arquitectura, la familia de entrenamiento ni el proposito del checkpoint, y no existe ninguna referencia bibliografica asociada. Comparar por el mero hecho de compartir un orden de magnitud de 6-7 B de parametros (por ejemplo, con modelos densos de ~7 B de uso general) seria enganoso, ya que se desconoce si la tarea objetivo y el tokenizer son siquiera comparables.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos publicados |
|---|---|---|---|---|---|
| egopi-axis2-lasttoken-persistent-AB-30k (este modelo) | 6,9 B | no disponible | no disponible | HuggingFace, 0 descargas | model card minima, sin benchmarks |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card tecnica, paper, blog ni repositorio de codigo asociado; la busqueda web no ha devuelto ningun material relevante.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion. Tratarlo como material sin licencia conlleva riesgo legal en entornos de produccion.
- Riesgo de alucinacion desconocido: al no existir evaluaciones, no se puede acotar la tasa de errores facticos ni la estabilidad de las respuestas.
- Arquitectura y contexto desconocidos: imposible planificar el consumo de memoria, la longitud de entrada admisible o el comportamiento en conversaciones largas.
- Idiomas no declarados: no se puede asumir un rendimiento correcto en castellano ni en ningun otro idioma.
- Sesgos no evaluados: no se ha publicado ninguna evaluacion de sesgo, toxicidad o seguridad.
- Rutas absolutas del cluster de origen: la configuracion conserva rutas del entorno original y debe remapearse antes de su uso; ignorar este punto provoca fallos de carga.
- Estado de optimizador y RNG excluidos: no es posible reanudar el entrenamiento original de forma exacta, solo reiniciarlo con optimizador nuevo.
- Compatibilidad incierta con runtimes estandar: sin arquitectura documentada, no hay garantia de que transformers, vLLM, llama.cpp u Ollama puedan cargar el checkpoint.
- Cero adopcion: 0 descargas y 0 likes implican ausencia de validacion por parte de terceros y ningun historial de incidencias conocidas.
- Trazabilidad limitada: el identificador de fecha del repositorio (2026-09-22) y el nombre del job no permiten verificar la procedencia real de los pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/junbrro/egopi-axis2-lasttoken-persistent-AB-30k-actsilu-slurm-18268-20260922
- Perfil del autor: https://huggingface.co/junbrro
- Paper: no disponible
- Blog o anuncio: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
- Resultados de la busqueda web: no relevantes (unicamente resultados de Yahoo Mail, sin relacion con el modelo)
