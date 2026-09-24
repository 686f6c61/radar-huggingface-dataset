# MadhavOberoi1121/momo-watch

## Resumen

Momo 360M es un modelo de lenguaje de 361.821.120 parametros (aproximadamente 362 M) desarrollado por MadhavOberoi1121 como pieza central de Momo, un asistente de voz que se ejecuta integramente en un Apple Watch mediante llama.cpp. Se trata de un fine-tune completo del modelo HuggingFaceTB/SmolLM2-360M-Instruct, cuantizado a GGUF Q4_K_M, cuyo objetivo es doble: transformar una peticion hablada en una llamada a herramienta estructurada y, al mismo tiempo, redactar respuestas breves cuando no se requiere ninguna herramienta.

El modelo cubre un conjunto cerrado de herramientas orientadas al ecosistema del reloj: temporizadores, recordatorios, calendario, meteorologia, llamadas, mensajes, notas, entrenamientos, salud, indicaciones y busqueda web. Para conservar la capacidad de redaccion del modelo base tras el ajuste, el autor combino datos sinteticos de tool-calls con respuestas autodestiladas generadas por SmolLM2-360M-Instruct bajo el prompt conciso de Momo.

Su relevancia actual reside en el nicho que ocupa: es un ejemplo poco frecuente de inferencia en un dispositivo wearable con recursos extremadamente limitados (watchOS 11 o superior, Apple Watch SE de 2.ª generacion o posterior, compilacion arm64_32), lo que lo convierte en una referencia practica para quien trabaje en asistentes on-device con presupuestos de memoria inferiores a 1 GB. La model card no especifica la longitud de contexto, el volumen de datos de entrenamiento ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (no se detalla en la model card; derivada del modelo base HuggingFaceTB/SmolLM2-360M-Instruct) |
| Parametros totales | 361.821.120 (aproximadamente 362 M) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (unica cuantizacion publicada en el repositorio) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF para llama.cpp; el repositorio ocupa 0,3 GB y no incluye pesos en safetensors |
| Modelo base | HuggingFaceTB/SmolLM2-360M-Instruct |
| Formato de prompt | ChatML, con dos plantillas diferenciadas (tool calling y respuestas concisas) |
| Plataformas objetivo | Apple Watch SE (2.ª generacion) o posterior, watchOS 11+, llama.cpp (arm64_32) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer decoder-only de SmolLM2-360M-Instruct, con 361.821.120 parametros. La model card no detalla el numero de capas, la dimension oculta, el mecanismo de atencion ni la longitud de contexto soportada por el modelo final, por lo que esos datos deben consultarse en la documentacion del modelo base. El ajuste se realizo con MLX mediante un fine-tune completo (no LoRA ni adaptadores), sobre el modelo en precision original. Posteriormente se cuantizo a Q4_K_M y se publico unicamente en formato GGUF.

El conjunto de entrenamiento combina dos fuentes: datos sinteticos de llamadas a herramienta especificos del asistente Momo y respuestas autodestiladas del modelo base generadas bajo el prompt conciso de Momo. Esta segunda parte busca mitigar el olvido catastrofico de la capacidad de redaccion tras el ajuste en el dominio de tool-calls. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de RLHF, DPO u otro tipo de alineamiento preferencial.

El formato de interaccion esta fijado en dos plantillas ChatML. Para tool calling, un turno de sistema enumera las herramientas disponibles y el modelo debe responder con `<tool_call>{"name": ..., "arguments": {...}}</tool_call>`. Para respuestas, un turno de sistema solicita brevedad y el modelo responde en texto plano, opcionalmente con texto de referencia.

## Capacidades

- Generacion de tool calls en JSON estricto para temporizadores, recordatorios, calendario, meteorologia, llamadas, mensajes, notas, entrenamientos, salud, indicaciones y busqueda web.
- Generacion de texto breve en ingles, orientada a respuestas de asistente de voz.
- Generacion de codigo, segun se indica en la model card ("writes short answers, code and replies").
- Function calling en un unico turno: la peticion del usuario se convierte en una llamada estructurada o en una respuesta textual, no en ambos.
- Ejecucion on-device sin conectividad: la inferencia se realiza en el propio reloj mediante llama.cpp.
- Capacidad multilingue: no disponible; el modelo esta etiquetado unicamente para ingles.
- Modo de razonamiento explicito (thinking): no disponible.
- Vision o audio nativos: no disponibles; la entrada de voz se gestiona fuera del modelo, que recibe texto.

## Casos de uso

- Asistente de voz en Apple Watch: el modelo recibe la transcripcion del habla y decide si debe invocar una herramienta o responder directamente. Su tamano de 362 M y su cuantizacion Q4_K_M permiten ejecutarlo en el reloj sin enviar audio ni texto a la nube, lo que reduce latencia y preserva la privacidad.
- Gestion de recordatorios y calendario por dictado: el usuario dicta "recuerdame llamar a Ana el martes" y el modelo emite la llamada estructurada correspondiente. Es adecuado porque el dominio de herramientas esta acotado y el formato de salida es fijo y verificable.
- Control de entrenamientos y consultas de salud: el modelo puede iniciar un workout o registrar una metrica invocando las herramientas de salud y entrenamiento, un escenario en el que la respuesta debe ser corta y la accion, inmediata.
- Notas rapidas y captura de ideas: para peticiones donde no procede ninguna herramienta, la plantilla de respuestas concisas permite generar texto breve con la nota o la respuesta solicitada.
- Consulta meteorologica y de indicaciones: la peticion de voz se traduce en la herramienta de meteorologia o de direcciones, y el resultado se devuelve como frase corta apta para lectura o sintesis de voz.
- Enrutador de intenciones en asistentes embebidos: dado su bajo coste computacional, puede actuar como primera etapa que clasifica la intencion del usuario y delega en modelos mayores solo cuando es necesario.
- Base para fine-tuning de dominio en dispositivos wearables: al estar bajo Apache-2.0 y en GGUF, sirve como punto de partida para adaptar el conjunto de herramientas a otra aplicacion (hogar, industria, domotica) sin reentrenar desde cero.
- Prototipado de agentes con llama.cpp en hardware restringido: util para validar pipelines de tool calling en Raspberry Pi, moviles o microcontroladores con menos de 1 GB de memoria disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni una evaluacion especifica de precision en tool calling (por ejemplo, exactitud del JSON emitido o tasa de invocacion de herramienta correcta), que seria el indicador mas relevante para su caso de uso principal. Tampoco se reportan mediciones de latencia o tokens por segundo en el dispositivo objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en total. Los pesos en Q4_K_M ocupan aproximadamente 0,2-0,3 GB (el repositorio completo es de 0,3 GB) y el resto corresponde al contexto y al runtime.
- Cabe en GPU de consumo: si, en cualquier GPU consumer actual (RTX 3060, RTX 4090, etc.), aunque resultan ampliamente sobredimensionadas para 362 M de parametros. Tambien se ejecuta en CPU integrada.
- Hardware validado por el autor: Apple Watch SE (2.ª generacion) o posterior con watchOS 11+, mediante llama.cpp compilado para arm64_32.
- GPU de centro de datos: no necesarias. A100 o H100 solo tendrian sentido para entrenamiento, generacion de datos sinteticos o despliegues con un volumen de peticiones simultaneas muy elevado.
- Opciones de despliegue: llama.cpp (runtime de referencia del proyecto), llama-cpp-python, Ollama y cualquier servidor compatible con GGUF. vLLM o TGI requeririan convertir previamente los pesos a safetensors, ya que el repositorio solo publica GGUF.
- Latencia y throughput estimados: no disponibles. La model card no reporta tiempos de generacion ni velocidad de decodificacion en el reloj.

## Comparativa con modelos similares

Los datos de los modelos comparadores proceden de su documentacion publica, no de la informacion proporcionada en esta ficha; los campos no verificables se marcan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Formatos | Enfoque |
|---|---|---|---|---|---|
| Momo 360M (este modelo) | 361,8 M | no disponible | Apache-2.0 | GGUF Q4_K_M | Tool calling y respuestas concisas para asistente de voz on-device |
| SmolLM2-360M-Instruct | 361,8 M | 8.192 tokens segun documentacion publica | Apache-2.0 | safetensors, GGUF | Instrucciones generales en ingles |
| Qwen2.5-0.5B-Instruct | aproximadamente 494 M | 32.768 tokens segun documentacion publica | Apache-2.0 | safetensors, GGUF | Instrucciones generales multilingues |
| Llama-3.2-1B-Instruct | 1.240 M | 128.000 tokens segun documentacion publica | Llama 3.2 Community License | safetensors, GGUF | Instrucciones generales y resumen |

La diferencia principal frente a los tres alternativas es de especializacion, no de escala: Momo 360M esta ajustado para un unico dominio de herramientas y un formato de salida fijo, mientras que los comparadores son modelos de proposito general. No hay datos publicados que permitan comparar su rendimiento real en tool calling frente a ellos.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. La model card no incluye ninguna evaluacion de sesgos, toxicidad o equidad.
- Riesgo de alucinacion: elevado por construccion. Con 362 M de parametros, el modelo puede inventar argumentos en las llamadas a herramienta (fechas, identificadores, nombres de herramienta inexistentes) o responder con informacion no verificada. Cualquier uso en produccion deberia validar el JSON contra un esquema estricto antes de ejecutarlo.
- Idioma: unicamente ingles. No hay evidencia de soporte para castellano ni para otras lenguas, pese a que el asistente pueda operar en mercados hispanohablantes.
- Longitud de contexto: no especificada para este modelo. No se puede asumir la ventana del modelo base sin verificarla experimentalmente.
- Cuantizacion: la unica publicada es Q4_K_M, que introduce perdida de precision respecto a los pesos originales. No hay variantes Q8_0, Q5_K_M ni FP16 para comparar la degradacion.
- Datos sinteticos: el ajuste se realizo integramente sobre datos generados sinteticamente y autodestilados, lo que incrementa el riesgo de sobreajuste al conjunto de herramientas concreto de Momo y de degradacion ante formulaciones fuera de distribucion.
- Licencia: Apache-2.0, la misma que el modelo base, por lo que se permite uso comercial con las obligaciones habituales de atribucion y conservacion del aviso de licencia. No se imponen restricciones adicionales segun la informacion disponible.
- Madurez del proyecto: el repositorio registra 0 descargas y 0 likes, sin validacion independiente por parte de la comunidad ni evaluaciones de terceros.
- Integracion en produccion: al ser un fine-tune de un modelo pequeno orientado a un dispositivo concreto, su comportamiento fuera del entorno Apple Watch y del prompt ChatML previsto no esta documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MadhavOberoi1121/momo-watch
- Modelo base SmolLM2-360M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- llama.cpp (runtime mencionado en la model card): https://github.com/ggerganov/llama.cpp
- MLX (framework de ajuste mencionado en la model card): https://github.com/ml-explore/mlx
- Paper, blog o demo del modelo: no disponible
