# fly88oj/decidex-gguf

## Resumen

Decidex GGUF es una familia de builds cuantizados en formato GGUF resultantes de fusionar el adaptador decidex-core-8b sobre el modelo base Qwen3-8B, publicada por el usuario fly88oj. No es un modelo conversacional al uso: esta disenado como motor de decision que recibe un estado, una pregunta y un conjunto de opciones etiquetadas (A, B, C...) y devuelve la letra de la mejor opcion, o la distribucion de probabilidad sobre las letras a partir de los logprobs. El repositorio ocupa 20,5 GB e incluye tres cuantizaciones: Q4_K_M (5,0 GB), Q6_K (6,7 GB) y Q8_0 (8,7 GB).

Tecnicamente hereda los pesos de Qwen3-8B, con 8.190.735.360 parametros totales (unos 8,19 mil millones) y arquitectura densa, sin mezcla de expertos. La licencia declarada es MIT y los idiomas soportados son ingles, chino y japones. Se distribuye exclusivamente en GGUF para su uso con llama.cpp, Ollama y LM Studio, y cuenta con un modelo borrador companero (decidex-draft-0.6b) orientado a decodificacion especulativa.

Su relevancia practica esta en ofrecer un componente de decision de "system one" (rapido, sin cadena de pensamiento) que puede insertarse en pipelines de agentes para enrutado, clasificacion o seleccion entre alternativas, con un coste de inferencia de 1 a 4 tokens por decision. El repositorio no registra descargas ni likes en la informacion consultada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada del modelo base Qwen3-8B (el autor no publica detalles adicionales) |
| Parametros totales | 8.190.735.360 (aproximadamente 8,19 mil millones) |
| Parametros activos | No aplica: el modelo es denso, no es MoE |
| Longitud de contexto | No disponible (no la especifica el autor; se hereda del modelo base Qwen3-8B) |
| Tipos de cuantizacion | GGUF: Q4_K_M (5,0 GB), Q6_K (6,7 GB), Q8_0 (8,7 GB) |
| Idiomas soportados | Ingles (en), chino (zh), japones (ja) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); el modelo base Qwen3-8B se distribuye en safetensors |

## Arquitectura y entrenamiento

El artefacto publicado es un conjunto de pesos GGUF obtenidos al fusionar el adaptador decidex-core-8b dentro del modelo base Qwen3-8B. La model card no detalla la arquitectura interna mas alla de identificar Qwen3-8B como base ni describe el proceso de fusion. El autor etiqueta la linea del adaptador con el marcador de linaje `r1`, que corresponde a la primera release de la linea core-8b y a la ronda interna de entrenamiento numero 7.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF, DPO o GRPO. La innovacion funcional declarada es el modo de lectura: el modelo base se describe como un hibrido con modo "thinking", y el adaptador lo convierte en una salida restringida a la letra de la opcion elegida. Por ese motivo el autor indica explicitamente que no debe usarse plantilla de chat, ya que esta rompe la lectura de la decision. La decodificacion recomendada es con temperatura 0 y entre 1 y 4 tokens maximos, leyendo la primera letra o los logprobs por letra.

## Capacidades

- Seleccion de una unica opcion entre varias etiquetadas (A, B, C, etc.): devuelve la letra de la mejor alternativa segun el estado y la pregunta proporcionados.
- Lectura de distribucion de probabilidad completa sobre las letras mediante logprobs (parametro `n_probs` de llama-server), lo que permite obtener un ranking y no solo la opcion ganadora.
- Decodificacion especulativa MTP: existe un modelo borrador companero, decidex-draft-0.6b, para acelerar la generacion.
- Multilingue en los idiomas declarados: ingles, chino y japones.
- Salida de sistema 1: no genera cadena de razonamiento ni modo "thinking"; produce una decision inmediata.
- Integrable como endpoint compatible con clientes de inferencia (etiqueta `endpoints_compatible` del repositorio).
- Ejecucion en llama.cpp, Ollama y LM Studio por el formato GGUF.
- No hay soporte documentado de tool calling ni de function calling.
- No hay capacidades de vision, audio ni generacion de texto libre documentadas.
- La etiqueta `conversational` aparece en los metadatos del repositorio, pero la model card indica que no se debe aplicar plantilla de chat; se trata por tanto de una capacidad no utilizable como asistente conversacional.

## Casos de uso

- Enrutado de peticiones en pipelines de agentes: dado un estado (contexto de la conversacion o del sistema) y una pregunta de enrutado, el modelo elige entre opciones discretas como "usar herramienta X", "usar herramienta Y" o "responder directamente", con un coste de 1 a 4 tokens por decision y temperatura 0 para maximizar la reproducibilidad.
- Clasificacion y triage de tickets: con opciones fijas (por ejemplo, "facturacion", "tecnico", "comercial"), el modelo actua como clasificador de una sola letra que se integra en un workflow de atencion al cliente sin necesidad de un modelo generativo mayor.
- Arbitraje entre respuestas candidatas: en esquemas de self-consistency o de generacion multiple, se presentan las candidatas como opciones A/B/C y el modelo selecciona la mas coherente con el estado, sustituyendo heuristicas de votacion.
- Control de flujo en automatizaciones: en un workflow con estados bien definidos, el modelo decide la siguiente accion (continuar, reintentar, escalar, cancelar) a partir del resultado de los pasos previos, lo que permite ramificaciones dinamicas sin codigo condicional complejo.
- Seleccion de configuracion o recursos: dado un estado de sistema y un conjunto de niveles (por ejemplo, tamano de instancia o politica de cache), el modelo elige la opcion etiquetada mas adecuada como politica ligera en tiempo de ejecucion.
- Evaluacion de decisiones asistidas: reproduccion a escala de decisiones previamente etiquetadas por humanos para medir coincidencia, ya que la salida es una letra comparable directamente con la etiqueta de referencia.
- Moderacion y politica de contenido: clasificacion de un caso en categorias discretas definidas por la organizacion, con la distribucion de probabilidad disponible para fijar umbrales de escalado a revision humana.
- Decisiones multilingues en ingles, chino y japones: el mismo prompt de decision puede aplicarse a estados redactados en cualquiera de los tres idiomas declarados, util en productos con soporte en esos mercados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ARC, etc.) en la informacion disponible. Tampoco hay comparaciones numericas con modelos de la misma categoria.

El unico dato de verificacion presente en la model card es la reproduccion por parte del autor de un ejemplo de la documentacion oficial, ejecutado en vivo sobre un llama-server en CPU:

| Metrica | Valor del autor | Valor oficial de referencia |
|---|---|---|
| noul | 0,9503 | 0,95 |
| score | 1,0404 | 1,05 |

Estos valores corresponden a un unico ejemplo de referencia y no constituyen una suite de evaluacion. No deben interpretarse como rendimiento general del modelo.

## Requisitos de hardware

- Tamano de pesos por cuantizacion: Q4_K_M 5,0 GB; Q6_K 6,7 GB; Q8_0 8,7 GB. A estas cifras hay que sumar el KV cache, que crece con la longitud de contexto y no esta cuantificado en la informacion disponible.
- VRAM estimada: Q4_K_M parte de unos 5 GB de pesos; el autor lo recomienda para GPU de 16 GB o para CPU con 16 GB o mas de RAM. Q6_K parte de 6,7 GB y Q8_0 de 8,7 GB, por lo que con contexto amplio conviene contar con 10-12 GB o mas de VRAM.
- GPU consumer compatibles: RTX 4090 (24 GB), RTX 4080/4070 Ti (16 GB) y RTX 3060 12 GB cubren las tres cuantizaciones con holgura variable. Tarjetas de 8 GB pueden ejecutar Q4_K_M con contextos moderados, dependiendo del KV cache.
- GPU de datacenter: A100, H100 y L40S son suficientes para cualquier cuantizacion de esta familia, aunque el modelo no requiere ese hardware para su tamano.
- Ejecucion en CPU: verificada por el autor mediante llama-server en CPU, con el modelo en formato GGUF.
- Opciones de despliegue: llama.cpp (llama-server), Ollama y LM Studio, los tres runners soportados de forma nativa para GGUF. vLLM y TGI no ofrecen soporte nativo estable de GGUF; su uso requeriria convertir los pesos, algo no documentado en la model card.
- Latencia y throughput: no se publican cifras. Al limitarse la generacion a 1-4 tokens por decision, la latencia estara dominada por el prefill del prompt (estado, pregunta y opciones). La decodificacion especulativa con decidex-draft-0.6b puede reducir la fase de decode, sin cifras publicadas.
- Cliente listo para usar: `examples/gguf_decision_client.py` en el repositorio GitHub del proyecto.

## Comparativa con modelos similares

No se dispone de datos publicados de otros motores de decision en formato GGUF comparables, por lo que no es posible una comparacion de rendimiento. La comparacion siguiente se limita a parametros, formato y licencia.

| Modelo | Parametros | Contexto | Formato | Licencia | Uso previsto |
|---|---|---|---|---|---|
| Decidex GGUF (este repositorio) | 8,19 B | No disponible | GGUF (Q4_K_M, Q6_K, Q8_0) | MIT | Motor de decision con salida de una letra |
| Qwen3-8B (modelo base) | 8,19 B | No disponible en esta ficha | safetensors y GGUF | Apache 2.0, segun la licencia publicada por Qwen | Modelo generalista con modo thinking e instrucciones |
| decidex-core-8b (adaptador predecesor) | 8,19 B tras la fusion | No disponible | No disponible | MIT (segun el repositorio GGUF) | Adaptador de decision, base de estas builds |
| Otros motores de decision GGUF | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo no conversacional: la model card indica explicitamente que no se debe aplicar plantilla de chat porque rompe la lectura de la decision. La etiqueta `conversational` del repositorio no debe tomarse como una capacidad utilizable.
- Salida restringida: solo sirve para elegir entre opciones etiquetadas. No es apto para generacion de texto libre, resumen, traduccion ni codigo.
- Formato fragil: la validez de la lectura depende de mantener el prompt exacto publicado, la temperatura 0 y un maximo de 1 a 4 tokens. Cualquier cambio de plantilla puede degradar o invalidar la calibracion.
- Riesgo de fallo de formato: el modo de error principal no es la alucinacion de contenido, sino emitir texto en lugar de una letra o seleccionar una opcion incorrecta. Conviene validar la salida y contemplar reintentos.
- Idiomas limitados a ingles, chino y japones. No hay datos de comportamiento en castellano ni en otros idiomas.
- Sin datos de sesgo: no se documentan evaluaciones de sesgo, equidad ni robustez.
- Trazabilidad limitada: no se especifican dataset de entrenamiento, numero de tokens, ni proceso de alineacion, lo que dificulta auditar el comportamiento.
- Licencia: el artefacto publicado se distribuye bajo MIT, pero el modelo base Qwen3-8B se distribuye bajo Apache 2.0 segun su propia licencia. En un uso comercial conviene revisar ambas condiciones y la procedencia de los datos del adaptador.
- Validacion externa practicamente nula: el repositorio registra 0 descargas y 0 likes, y las unicas cifras de verificacion son las aportadas por el propio autor sobre un ejemplo de la documentacion oficial.
- Metadatos anomalos: las fechas de creacion y actualizacion del repositorio figuran en 2026, lo que resulta incoherente con el resto de la informacion disponible y aconseja tratar los metadatos con cautela.
- Nota de no afiliacion: el autor declara no estar afiliado a TypeSafe AI, mencion que conviene tener en cuenta al buscar documentacion o soporte del proyecto.
- Tags no documentados: etiquetas como `jev` o `system-one` no vienen acompanadas de una explicacion tecnica en la model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fly88oj/decidex-gguf
- Adaptador predecesor (decidex-core-8b): https://huggingface.co/fly88oj/decidex-core-8b
- Modelo borrador MTP (decidex-draft-0.6b): https://huggingface.co/fly88oj/decidex-draft-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio GitHub del proyecto: https://github.com/fly88oj/decidex
- Cliente de decision para GGUF: `examples/gguf_decision_client.py` en el repositorio GitHub
- Guia de uso en GGUF: `GGUF-USAGE.md` en el repositorio GitHub
