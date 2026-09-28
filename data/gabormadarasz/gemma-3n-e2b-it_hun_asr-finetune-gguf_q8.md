# GaborMadarasz/gemma-3n-E2B-it_hun_ASR-finetune-gguf_Q8

## Resumen

`GaborMadarasz/gemma-3n-E2B-it_hun_ASR-finetune-gguf_Q8` es un ajuste fino del modelo multimodal Gemma 3n E2B Instruct de Google, publicado por el usuario GaborMadarasz en formato GGUF con cuantizacion Q8_0. Por el propio identificador del repositorio, el ajuste esta orientado a reconocimiento automatico del habla (ASR) en hungaro, partiendo de la variante instructiva de Gemma 3n, que ya incorpora un codificador de audio nativo. El resultado se distribuye como un unico fichero de pesos cuantizado listo para su uso con llama.cpp y Ollama.

El modelo conserva la arquitectura multimodal del Gemma 3n original (texto, imagen, audio y video) y el recuento de parametros declarado por el repositorio, 4.458.122.848 (aproximadamente 4,46 mil millones). El repositorio ocupa 4,7 GB, coherente con una cuantizacion de 8 bits sobre ese numero de parametros. El autor indica que el ajuste fino y la conversion se realizaron con Unsloth, y que se modifico el comportamiento del token BOS para garantizar compatibilidad con el formato GGUF.

Su relevancia practica es doble: por un lado, ofrece una via de despliegue en hardware de consumo para un modelo multimodal con capacidad de audio; por otro, ejemplifica el flujo de trabajo Unsloth -> GGUF aplicado a un caso de uso linguistico concreto (ASR en hungaro). La model card no documenta el conjunto de datos de ajuste, el numero de tokens de entrenamiento ni la licencia, por lo que estas cuestiones quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo base Gemma 3n; segun la documentacion de Google, basada en MatFormer con Per-Layer Embeddings) |
| Parametros totales | 4.458.122.848 (~4,46 B), segun el recuento de safetensors del repositorio |
| Parametros activos | No aplicable: no es un modelo MoE. La variante E2B de Gemma 3n se comercializa con tamano efectivo de ~2 B, segun la documentacion del modelo base |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Gemma 3n declara 32.768 tokens) |
| Tipos de cuantizacion | Q8_0 (unico fichero incluido: `gemma-3n-e2b-it.Q8_0.gguf`) |
| Idiomas soportados | No disponible. El ajuste esta orientado al hungaro para tarea de ASR; el modelo base Gemma 3n declara soporte multilingue |
| Licencia | No disponible (el repositorio no declara licencia) |
| Formato de pesos | GGUF (Q8_0) |
| Tamano del repositorio | 4,7 GB |
| Modo de uso | Conversacional; compatible con endpoints (`endpoints_compatible`) |

## Arquitectura y entrenamiento

No se dispone de detalles publicados sobre el procedimiento de ajuste fino mas alla de los indicados por el autor: el modelo se ajusto y convirtio a GGUF con Unsloth, lo que implica tecnicas de entrenamiento con ahorro de memoria (por ejemplo, LoRA/QLoRA o entrenamiento con kernels optimizados) y una conversion posterior al formato llama.cpp. El autor senala que el modelo se entreno "2x mas rapido" gracias a Unsloth, pero no especifica el volumen de datos, la composicion del dataset, la duracion del entrenamiento ni si se aplicaron fases de RLHF o DPO adicionales. Tampoco se documenta si el ajuste toco conjuntamente el decodificador de texto y el codificador de audio, o solo una parte de la red.

La arquitectura subyacente es la de Gemma 3n, el modelo multimodal de Google DeepMind disenado para ejecucion en dispositivos con recursos limitados. Gemma 3n incorpora codificadores de vision y audio junto al decodificador de texto, y su diseno prioriza el uso eficiente de memoria. Una innovacion relevante del modelo base es el uso de Per-Layer Embeddings (PLE), que reduce el coste de memoria de la matriz de embeddings, junto con mecanismos de comparticion que permiten operar con un presupuesto de parametros efectivos inferior al recuento bruto. En esta publicacion concreta se ha ajustado el comportamiento del token BOS respecto al modelo original para que la conversion a GGUF sea funcionalmente correcta.

## Capacidades

- Generacion de texto conversacional en un unico turno y en multiples turnos, heredada de la variante Instruct de Gemma 3n.
- Entrada multimodal: el modelo base Gemma 3n procesa texto, imagen, audio y video. El autor indica explicitamente el uso de `llama-mtmd-cli` para la via multimodal, lo que confirma la presencia de dicho soporte en el GGUF.
- Reconocimiento automatico del habla (ASR) en hungaro, que es el objetivo declarado del ajuste fino segun el identificador del repositorio.
- Uso con plantillas de chat mediante `--jinja` en llama.cpp, lo que habilita la aplicacion correcta de la plantilla de conversacion del modelo base.
- Posible uso como modelo de razonamiento multilingue general, aunque no se documenta el alcance real por idioma tras el ajuste.
- Soporte de despliegue via Ollama mediante el `Modelfile` incluido en el repositorio.
- Compatibilidad declarada con endpoints (etiqueta `endpoints_compatible`), lo que facilita su integracion en servicios de inferencia con API compatible con OpenAI.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni razonamiento agentico multi-paso.

## Casos de uso

- Transcripcion de audio en hungaro en local: el modelo puede utilizarse como motor ASR privado ejecutado en una estacion de trabajo sin GPU dedicada de gama alta, gracias a la cuantizacion Q8_0 y al tamano reducido del fichero (4,7 GB). Resulta adecuado para entornos donde no se permite enviar audio a servicios en la nube por motivos de privacidad.
- Preprocesado de reuniones y llamadas: integrado con llama.cpp mediante `llama-mtmd-cli`, permite generar transcripciones que despues se pasan al propio modelo para resumir, extraer tareas o etiquetar temas, todo dentro del mismo runtime.
- Subtitulado de video en hungaro: al aceptar entrada de audio y video, puede emplearse en pipelines de generacion de subtitulos, con el fichero GGUF cargado en una GPU de consumo y una cola de trabajos por lotes.
- Prototipado rapido con Ollama: el `Modelfile` incluido permite levantar el modelo con un solo comando, lo que es util para validar la calidad del ajuste en hungaro antes de comprometerse con una infraestructura mayor.
- Asistentes de voz en hungaro de baja latencia: por el tamano efectivo del modelo, es viable desplegarlo en un servidor modesto y encadenarlo a un sistema de sintesis de voz para construir un asistente conversacional de dominio cerrado.
- Evaluacion comparativa de ajustes finos: sirve como punto de partida para investigadores que quieran reproducir el flujo Unsloth -> GGUF o comparar la degradacion de calidad introducida por la cuantizacion Q8_0 frente al modelo en precision completa.
- Documentacion accesible y lectura de pantalla: combinado con el modo multimodal, puede alimentar herramientas de asistencia que describan imagenes o lean documentos escaneados y ademas procesen notas de voz del usuario en hungaro.
- Clasificacion y enrutado de audio: en un pipeline de atencion al cliente, puede transcribir y clasificar llamadas entrantes en hungaro para dirigirlas al departamento correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de WER para la tarea de ASR en hungaro, ni resultados de MMLU, GSM8K u otras evaluaciones estandar, ni comparaciones con el modelo base sin ajustar.

## Requisitos de hardware

- VRAM estimada para el fichero de pesos: aproximadamente 4,7 GB con cuantizacion Q8_0 (coincide con el tamano del repositorio).
- VRAM total recomendada para inferencia: del orden de 6 a 8 GB, sumando pesos, cache KV y overhead del runtime para contextos moderados. Contextos muy largos o procesamiento de audio y video incrementan el consumo.
- Cabe en GPU de consumo: si. Tarjetas con 8 GB o mas de VRAM (RTX 3060 8 GB, RTX 4060 8 GB, RTX 3070, RTX 4070) son suficientes para texto y audio en contextos cortos y medios. Con 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) se dispone de mas margen para contexto largo y entradas multimodales.
- Ejecucion en CPU: viable mediante llama.cpp con el fichero GGUF, aunque con latencias notablemente superiores; se recomienda para pruebas o despliegues de bajo volumen mas que para produccion interactiva.
- Opciones de despliegue: llama.cpp (`llama-cli` para texto, `llama-mtmd-cli` para multimodal), Ollama mediante el `Modelfile` incluido y cualquier servidor compatible con la etiqueta `endpoints_compatible`. No se documentan en la informacion disponible configuraciones para vLLM ni TGI, que en general no consumen GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo de transcripcion por minuto de audio en ningun hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|---|
| Este modelo (gemma-3n-E2B-it_hun_ASR GGUF Q8) | 4,46 B (recuento del repo) | No disponible | Si, heredada del base | No disponible | GGUF Q8_0 | Ajuste especifico para ASR en hungaro; sin benchmarks publicados |
| Gemma 3n E2B Instruct (modelo base) | ~5 B brutos, ~2 B efectivos segun documentacion de Google | 32.768 tokens segun documentacion del base | Si (texto, imagen, audio, video) | Licencia Gemma de Google | Safetensors y multiples formatos | Referencia de partida; mayor calidad esperada sin cuantizar y con licencia explicita |
| Gemma 3 4B Instruct | ~4 B | 128.000 tokens segun documentacion de Google | Si, solo vision en la variante multimodal | Licencia Gemma de Google | Safetensors, GGUF, etc. | Alternativa textual con contexto mucho mayor, pero sin capacidad de audio nativa |
| Whisper large-v3 (OpenAI) | ~1,55 B | No aplicable (ventanas de 30 s) | Solo audio | Licencia MIT | Safetensors, GGUF, etc. | Especializado en ASR, incluido hungaro; no es un modelo conversacional general |

Las comparaciones de contexto, parametros y licencia de los modelos de referencia proceden de su documentacion publica y pueden variar con el tiempo. No se dispone de datos de rendimiento comparativo para este ajuste concreto.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay resultados publicados de WER en hungaro ni de evaluaciones generales, por lo que la calidad real del ajuste no puede verificarse a partir de la informacion disponible.
- Falta de trazabilidad del entrenamiento: no se documenta el dataset de ajuste, el numero de tokens, la composicion linguistica ni si hubo fases de alineacion, lo que dificulta auditar sesgos o evaluar la cobertura de dominios.
- Licencia no declarada: el repositorio no especifica licencia. El modelo base Gemma 3n esta sujeto a la licencia Gemma de Google, que impone condiciones y restricciones de uso; al no declararse la licencia de este ajuste, su uso comercial queda en una situacion juridica ambigua y conviene aclararlo con el autor antes de integrarlo en produccion.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir transcripciones plausibles pero incorrectas, especialmente con audio ruidoso, acentos marcados, terminologia tecnica o nombres propios. En aplicaciones de ASR esto es critico y exige revision humana o verificacion automatica.
- Cuantizacion Q8_0: aunque la degradacion respecto a precision completa suele ser reducida en 8 bits, supone una perdida de calidad no cuantificada en este caso concreto. No se ofrece una version sin cuantizar en el repositorio.
- Riesgo de olvido catastrofico: el ajuste sobre un unico dominio e idioma puede haber degradado las capacidades generales del modelo base en otros idiomas o tareas, algo habitual en ajustes finos estrechos y no evaluado aqui.
- Ambito idiomatico: el ajuste esta orientado al hungaro, un idioma con pocos recursos. El rendimiento en castellano u otros idiomas no esta documentado y no deberia asumirse.
- Baja validacion comunitaria: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe retroalimentacion de terceros sobre su comportamiento en produccion.
- Modificacion del token BOS: el autor indica que se altero el comportamiento del token BOS para la compatibilidad con GGUF. Conviene verificar que esta decision no afecta a la coherencia de las respuestas en contextos largos o con plantillas personalizadas.
- Contexto no confirmado: la model card no declara la longitud de contexto soportada por el fichero GGUF, por lo que en despliegues con ventanas largas conviene validar experimentalmente el comportamiento antes de asumir el maximo del modelo base.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/GaborMadarasz/gemma-3n-E2B-it_hun_ASR-finetune-gguf_Q8
- Repositorio de Unsloth (herramienta de ajuste y conversion declarada por el autor): https://github.com/unslothai/unsloth
- Documentacion de Gemma 3n de Google (modelo base): no disponible en la informacion proporcionada, se recomienda consultar la pagina oficial de Gemma en ai.google.dev
- Repositorio de llama.cpp (runtime de inferencia para GGUF): no disponible en la informacion proporcionada como enlace explicito, se recomienda consultar github.com/ggml-org/llama.cpp
- Paper o blog tecnico del ajuste: no disponible
- Demo: no disponible
