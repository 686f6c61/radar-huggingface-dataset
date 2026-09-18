# dealignai/Bonsai-2-27B-Ternary-CRACK-GGUF

## Resumen

Bonsai 2 27B Ternary CRACK es una variante abliterada del modelo ternario Bonsai 2 27B, publicado por dealignai sobre la compresion ternaria que PrismML realizo de Qwen3.8-27B. Se distribuye como un unico fichero GGUF de 7,21 GB que contiene los 26.895.998.464 parametros (26,9 B) del modelo en formato PQ2_0 a 2,13 bits por peso con grupo 128, lo que permite ejecutar un modelo de clase 27B en un portatil o en una sola GPU de consumo.

La arquitectura es hibrida: combina atencion con capas SSM del tipo GatedDeltaNet, 64 bloques y dimension oculta de 5120, con una torre de vision separada que se carga mediante los proyectores multimodales del release base. Conserva el tokenizador, la plantilla de chat, la interfaz del proyector de vision, los modos de razonamiento (`off`, `low`, `xhigh`) y el soporte de tool calling del modelo ternario original. La unica diferencia respecto a la cuantizacion base es la eliminacion a nivel de pesos del circuito de rechazo, mediante una tecnica de abliteracion propietaria del equipo de dealignai.

Su relevancia es doble: por un lado, demuestra que un modelo de 27B puede servirse en 7,2 GB con vision y razonamiento extendido; por otro, es un caso de estudio sobre abliteracion, ya que el autor publica mediciones de tasa de rechazo en HarmBench-320 que pasan del 93,75 % en la base al 0,63 % en esta variante. El modelo esta pensado, segun su propia model card, para uso adulto o de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida de atencion + SSM (GatedDeltaNet), 64 bloques, hidden 5120, torre de vision independiente |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Longitud de contexto | no disponible (el ejemplo oficial de servicio arranca el servidor con `-c 8192`) |
| Tipos de cuantizacion | Ternaria PQ2_0 a 2,13 bpw, grupo 128; proyector multimodal en BF16 y Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con aviso del autor de uso solo para adultos/investigacion) |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 7,2 GB |
| Modelos base | prism-ml/Ternary-Bonsai-2-27B-gguf y Qwen/Qwen3.8-27B |
| Modos de razonamiento | `off` (sin thinking), `low`, `xhigh` (por defecto) |
| Vision | Si, mediante mmproj del release base (BF16 o Q8_0) |
| Runtime | Fork de llama.cpp de PrismML (CUDA, Metal, CPU) |
| Descargas / likes | 0 descargas, 1 like |

## Arquitectura y entrenamiento

El modelo no se ha entrenado desde cero: es una cadena de transformaciones sobre Qwen3.8-27B. PrismML aplico primero una compresion ternaria (PQ2_0, 2,13 bpw, grupo 128) que redujo el modelo a 7,21 GB con una politica de tipos por tensor propia; dealignai modifico despues un subconjunto pequeno de tensores asociados al circuito de rechazo. El autor afirma que el resultado es byte-identico a la cuantizacion base en todos los tensores no relacionados con el rechazo, de modo que se puede usar como reemplazo directo en inferencia sin cambiar tokenizador ni plantilla de chat.

La arquitectura declarada es hibrida de atencion + SSM con 64 bloques y atencion GatedDeltaNet, con una torre de vision separada que se carga como proyector multimodal aparte. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO para el modelo original; la model card tampoco documenta el procedimiento de abliteracion mas alla de describirlo como propietario y aplicado a nivel de pesos. La innovacion tecnica destacable es, por tanto, la combinacion de cuantizacion ternaria sub-3 bits con arquitectura hibrida attention+SSM en un unico GGUF, mas la preservacion de vision y modos de razonamiento tras la intervencion sobre los pesos.

## Capacidades

- Generacion de texto conversacional multi-turno con coherencia declarada por el autor.
- Razonamiento con modos seleccionables: `off`, `low` y `xhigh` (thinking extendido, opcion por defecto).
- Uso de herramientas (tool calling) a traves de la API de chat compatible con `/v1/chat/completions`.
- Capacidades de agente y razonamiento multi-paso, heredadas del modelo base.
- Vision: entrada de imagenes mediante los ficheros mmproj del release ternario original (BF16 o Q8_0).
- Ejecucion en dispositivo: CUDA, Metal y CPU mediante el fork de llama.cpp de PrismML.
- Sin filtros de rechazo: el modelo responde a peticiones que la base ternaria rechazaba en el 93,75 % de los casos de HarmBench-320, segun los datos del autor.
- Idiomas soportados: no disponible (el autor no declara lista de idiomas).

## Casos de uso

- Red-teaming y evaluacion de seguridad: al ser una variante abliterada con metricas publicadas de tasa de rechazo, sirve como sujeto de prueba para medir la robustez de clasificadores de contenido y de guardrails en pipelines de moderacion.
- Investigacion sobre cuantizacion extrema: permite comparar la degradacion de capacidades de un modelo de 27B a 2,13 bpw frente al mismo modelo en BF16, usando la MMLU de 65 preguntas como punto de partida y ampliandola.
- Asistente local en portatil: con 7,21 GB de pesos cabe en equipos con GPU integrada o discreta de gama media y en CPU, lo que habilita asistentes de texto sin conexion ni envio de datos a terceros.
- Generacion de codigo en local: soporta tool calling y conversaciones multi-turno, por lo que puede integrarse en editores o scripts de automatizacion que necesiten ejecutar comandos o consultar APIs sin salir del equipo.
- Procesamiento de documentos con imagenes: cargando el mmproj, el modelo puede describir capturas, extraer texto de imagenes y responder preguntas sobre diagramas o tablas dentro de un flujo de digitalizacion de documentos.
- Agentes multi-paso con razonamiento extendido: el modo `xhigh` permite cadenas de razonamiento largas antes de actuar, util en automatizaciones que requieren planificacion y encadenamiento de herramientas.
- Generacion de datos sinteticos sin filtros: util para construir datasets de entrenamiento o de evaluacion que incluyan contenido que los modelos alineados rechazarian, siempre dentro del marco legal aplicable.
- Analisis de conversaciones largas: la ventana de contexto no esta declarada, pero el ejemplo oficial de servicio usa 8192 tokens, suficiente para resumenes y analisis de hilos de soporte de tamano medio.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son evaluaciones de rechazo y una muestra reducida de MMLU.

| Evaluacion | Base PQ2_0 | CRACK PQ2_0 |
|---|---:|---:|
| HarmBench-320, tasa de rechazo (menor es mejor en esta metrica) | 93,75 % (300/320) | 0,63 % (2/320) |
| HarmBench-320, veredictos HARD_REF | 297 | 0 |
| HarmBench-320, veredictos SOFT_RED | 3 | 2 |
| HarmBench-320, veredictos COMPLY | 10 | 161 |
| HarmBench-320, veredictos COMPLY_TRUNCATED | 10 | 157 |
| Comprobacion adicional de 200 prompts, tasa de rechazo | 100 % (200/200) | 0 % (0/200) |
| MMLU (muestra mixta, n=65, next-token letter-logit) | 30,77 % | 40,00 % (+9,23 pp) |

Desglose por categoria de HarmBench (tasa de rechazo base frente a CRACK): chemical_biological 95,2 % frente a 0,0 %; copyright 91,2 % frente a 0,0 %; cybercrime_intrusion 94,2 % frente a 0,0 %; harassment_bullying 100,0 % frente a 0,0 %; harmful 94,4 % frente a 5,6 %; illegal 90,6 % frente a 0,0 %; misinformation_disinformation 96,3 % frente a 1,9 %.

El autor atribuye la mejora de MMLU a una reduccion del sesgo posicional hacia la letra "A" en la ruta de logits sobre bases de 1 bit o ternarias, y advierte que la muestra de 65 preguntas (una por asignatura en su mayoria) es direccional y no estadisticamente concluyente. No se han publicado resultados de MMLU completo, HumanEval, GSM8K ni otros benchmarks de capacidad en la informacion disponible.

## Requisitos de hardware

- Peso del fichero: 7,21 GB, identico al de la cuantizacion base. Esa cifra mas el KV cache determina la VRAM necesaria; la VRAM total depende de la longitud de contexto configurada, que no esta declarada.
- Estimacion a partir del tamano del fichero: alrededor de 7,5 a 9 GB de VRAM para contexto moderado, cifra orientativa y no confirmada por el autor.
- Cabe en GPU de consumo: cualquier tarjeta con 8 GB o mas deberia poder cargar los pesos; con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) hay margen para contexto y para el proyector de vision.
- GPU de datacenter: A100, H100 y similares no son necesarias para el modelo, pero permiten mayor contexto y concurrencia.
- Modo CPU y Metal: el fork soporta CPU y Metal, por lo que tambien funciona en Macs con memoria unificada y en servidores sin GPU.
- Despliegue: `llama-server` del fork de PrismML (`github.com/PrismML-Eng/llama.cpp`), compilado con `-DGGML_CUDA=ON` para CUDA. Para vision hay que anadir `--mmproj` con los ficheros del release base.
- Opciones de despliegue alternativas (vLLM, TGI, Ollama): no confirmadas; la model card solo documenta el fork de PrismML.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y tamano | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| dealignai/Bonsai-2-27B-Ternary-CRACK-GGUF | 26,9 B | GGUF ternario PQ2_0, 7,21 GB | no disponible | Apache 2.0 | Variante abliterada, con vision y modos de razonamiento; tasa de rechazo 0,63 % en HB-320 |
| prism-ml/Ternary-Bonsai-2-27B-gguf | 26,9 B | GGUF ternario PQ2_0, 7,21 GB | no disponible | no disponible | Cuantizacion ternaria original de PrismML, con el circuito de rechazo intacto; 93,75 % de rechazo en HB-320 |
| Qwen/Qwen3.8-27B | 26,9 B | no disponible (presumiblemente safetensors) | no disponible | no disponible | Modelo original sin cuantizar ni abliterar; referencia de capacidades completas |

No se dispone de comparaciones con otros modelos abliterados de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterado sin guardrails: el propio autor lo describe como carente de circuitos de rechazo. Puede generar contenido ofensivo, danino o ilegal en algunas jurisdicciones.
- Etiquetado por el autor como "adult / research use only", lo que entra en tension con la licencia Apache 2.0 declarada. Conviene revisar los terminos aplicables antes de cualquier uso en produccion.
- Los benchmarks publicados son de eliminacion de rechazo, no de capacidad general: la unica medida de capacidad es una MMLU de 65 preguntas con 40,00 % de acierto, muy por debajo de lo esperable en un modelo de 27B sin cuantizar.
- La cuantizacion ternaria a 2,13 bpw implica una perdida de calidad frente al modelo en precision completa, no cuantificada en la informacion disponible.
- Riesgo elevado de alucinacion derivado de la compresion extrema; no hay evaluaciones de veracidad publicadas.
- Longitud de contexto no declarada; el unico dato es el `-c 8192` del ejemplo de servicio.
- Idiomas soportados no declarados.
- Requiere el fork de llama.cpp de PrismML; la compatibilidad con llama.cpp upstream no esta confirmada.
- La vision exige descargar aparte los ficheros mmproj del release base, no incluidos en este repositorio.
- Validacion comunitaria practicamente nula: 0 descargas y 1 like en el momento de la consulta.
- Inconsistencia en los metadatos: las etiquetas mencionan `qwen3.5` mientras que el modelo base declarado es Qwen3.8-27B.
- La model card esta truncada en la seccion de uso responsable, por lo que parte de las advertencias del autor no son legibles en la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/dealignai/Bonsai-2-27B-Ternary-CRACK-GGUF
- Modelo base ternario: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Fork de llama.cpp usado para servir el modelo: https://github.com/PrismML-Eng/llama.cpp
- Perfil del autor: https://x.com/dealignai
- La busqueda web realizada no devolvio ningun enlace relevante: los unicos resultados fueron paginas de inicio y de inicio de sesion de Facebook, sin relacion con el modelo.
