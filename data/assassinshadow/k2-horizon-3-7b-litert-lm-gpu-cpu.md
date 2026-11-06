# assassinshadow/K2-Horizon-3.7B-LiteRT-LM-GPU-CPU

## Resumen

K2-Horizon-3.7B-LiteRT-LM-GPU-CPU es un paquete de inferencia on-device del modelo K2-Horizon-3.7B (desarrollado por IFM), publicado por el usuario independiente assassinshadow. No se trata de un modelo nuevo, sino de una conversion del modelo base a formato LiteRT-LM para ejecutarse en telefonos Android arm64, tanto en GPU como en CPU. El bundle incluye pesos cuantizados GPTQ int4 en las capas fully-connected con embeddings int8, dos grafos (prefill de 128 tokens y decode) y una plantilla de chat reescrita para el motor de plantillas de LiteRT-LM.

El modelo resuelve el problema de desplegar un LLM de razonamiento de 3.700 millones de parametros en un dispositivo movil sin conexion, con un contexto de 4096 tokens y un tamano de fichero de 2,89 GB. Es relevante porque demuestra que un modelo con modo de razonamiento explicito (canal `<ifm|think>`) puede ejecutarse a velocidad util en hardware de consumo, con 5,38 tok/s en GPU y 3,52 tok/s en CPU medidos en un Samsung Galaxy S22 Ultra.

La build es no oficial, se distribuye "as is", no esta afiliada a IFM ni a Google y esta pensada principalmente para la aplicacion AutoDroid Studio, que expone el modelo mediante un endpoint compatible con OpenAI. Solo soporta texto y el idioma declarado es ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (forma Llama para exportacion a LiteRT); pesos GPTQ int4 con embeddings int8 |
| Parametros totales | 3.700 millones (segun nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | GPTQ int4 (capas fully-connected), int8 (embeddings), activaciones fp32 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM), 2,89 GB |

## Arquitectura y entrenamiento

El modelo base IFM/K2-Horizon-3.7B es un transformer de 3.700 millones de parametros orientado a razonamiento. Esta build concreta no reentrena ni modifica los pesos en cuanto a conocimiento: aplica cuantizacion GPTQ int4 a las capas fully-connected y mantiene los embeddings en int8, ya que la receta estandar int4 rompia el modelo (frases a medias, repeticiones como "I need to thinking about the the"). La conversion a la forma Llama usada para la exportacion se valido contra el original con una similitud coseno de 0,99999.

El bundle contiene dos grafos: uno de prefill de 128 tokens y otro de decode. Las activaciones se solicitan en fp32 (`prefer_activation_type=fp32`) porque el primer token genera activaciones demasiado grandes para fp16. Se descarto una build con contexto de 8192 porque redujo la memoria libre de 5,1 a 1,1 GB en 8 segundos y provoco el reinicio del S22 Ultra en GPU. La plantilla de chat se reescribio para el motor de LiteRT-LM, sin seccion de herramientas y sin las comprobaciones originales, y declara un unico canal de razonamiento `<ifm|think>` ... `</ifm|think>`.

## Capacidades

- Generacion de texto en ingles con modo de razonamiento explicito: el modelo razona dentro de `<ifm|think>` y luego responde.
- Niveles de esfuerzo de razonamiento: `reasoning_effort` en `medium` o `low` abre los canales `<ifm|think_fast>` y `<ifm|think_faster>`.
- Desactivacion del razonamiento mediante `enable_thinking=false`, que genera un bloque cerrado vacio y responde directamente.
- Aritmetica basica y razonamiento de sentido comun (17 × 23 = 391 en ambos backends).
- Inferencia on-device en GPU o CPU con el mismo fichero `.litertlm`.
- Ejecucion sin conexion en Android arm64 mediante LiteRT-LM CLI o el AAR `litertlm-android` 0.18.0.
- Servido mediante endpoint estilo OpenAI a traves de la app AutoDroid Studio.
- No soporta tool calling ni function calling: la plantilla no tiene seccion de herramientas.
- No soporta vision ni audio: es exclusivamente texto.

## Casos de uso

- Asistente de razonamiento offline en Android: el modelo se ejecuta integramente en el telefono con 4096 tokens de contexto, util para consultas que requieren varios pasos de razonamiento sin enviar datos a la nube.
- Aplicaciones de privacidad estricta: al no requerir red, permite procesar texto sensible (notas, documentos personales) en el dispositivo, con la garantia de que los datos no salen del terminal.
- Prototipado de agentes moviles: mediante el endpoint compatible con OpenAI de AutoDroid Studio se puede conectar el modelo a clientes existentes para probar flujos de agente en hardware real, aunque sin tool calling nativo.
- Educacion y tutoria: el canal de razonamiento permite mostrar el proceso de resolucion de problemas matematicos o logicos, con la posibilidad de reducir el esfuerzo de razonamiento para respuestas rapidas.
- Demostraciones y evaluacion de LiteRT-LM: sirve como referencia practica para desarrolladores que quieran medir el rendimiento de LiteRT en GPU frente a CPU en un Snapdragon 8 Gen 1.
- Procesamiento por lotes en movilidad: generacion de resumenes o reescritura de texto en campo, sin dependencia de conectividad, aceptando el throughput de 3,5 a 5,4 tok/s.
- Base para fine-tuning o experimentacion: al estar bajo Apache 2.0 y derivar de un modelo abierto, puede servir como punto de partida para builds on-device personalizadas.

## Benchmarks y rendimiento

Resultados medidos por el autor en un Samsung Galaxy S22 Ultra (Snapdragon 8 Gen 1) con LiteRT-LM CLI:

| Metrica | GPU | CPU |
|---|---:|---:|
| Decode | 5,38 tok/s | 3,52 tok/s |
| Carga | 13,8 s (CLI), 37 s en la app | 19,7 s |
| Primer token | 2,8 s | no registrado |
| RAM | ~5,4 GB | ~1,5 GB mas cache XNNPACK mapeada |

Benchmarks de la app AutoDroid Studio (GPU, thinking activado, presupuesto de razonamiento 1024):

| Suite | Puntuacion | Aprobados | Velocidad | Primer token | Tiempo |
|---|---:|---:|---:|---:|---:|
| quick | 100 | 6/6 | 4,16 tok/s | no disponible | no disponible |
| tier_t2 | 85,96 | 20/28 | 3,92 tok/s | 7,1 s | 60 min |

Fallos en tier_t2: `math_trains`, `reason_direction`, `code_roman`, `code_balanced`, `safe_ssn` y 3 tareas de agente. El autor advierte que estas suites son pequenas y no comparables con los resultados publicados en la model card del modelo original.

## Requisitos de hardware

- VRAM/RAM: aproximadamente 5,4 GB libres para el backend GPU y unos 1,5 GB para CPU (mas el fichero de cache de XNNPACK mapeado).
- Dispositivo de referencia: Samsung Galaxy S22 Ultra de 12 GB; no se probaron telefonos con menos memoria.
- GPU: en el S22 Ultra todos los nodos se delegaron a la GPU; Android tuvo que matar 3 apps en cache para liberar memoria (de 7,9 a 2,5 GB libres).
- No esta pensado para GPU de escritorio (A100, H100, RTX 4090): el formato `.litertlm` apunta a Android arm64.
- Despliegue: CLI `litert_lm_advanced_main` de LiteRT-LM, AAR `litertlm-android` 0.18.0, o la app AutoDroid Studio con endpoint estilo OpenAI.
- Throughput: 5,38 tok/s en GPU y 3,52 tok/s en CPU; primer token de 2,8 s en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| K2-Horizon-3.7B-LiteRT-LM-GPU-CPU | 3,7B | 4096 | `.litertlm`, Android GPU/CPU | Apache 2.0 | Build comunitaria int4; 5,38 tok/s en S22 Ultra |
| IFM/K2-Horizon-3.7B (original) | 3,7B | no disponible | safetensors (presumiblemente) | Apache 2.0 | Modelo base sin cuantizar; calidad superior a la build int4 |
| Alternativas on-device de ~3-4B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de datos de benchmarks del modelo original ni de alternativas on-device equivalentes en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Solo texto: la plantilla no incluye seccion de herramientas, por lo que no hay tool calling.
- Solo ingles declarado; no se garantiza calidad en otros idiomas.
- La cuantizacion int4 degrada la calidad respecto al modelo completo; el autor no ha medido la magnitud de la perdida mas alla de las suites mencionadas.
- Problema conocido con `litertlm-android` 0.18.0: una pregunta de seguimiento tras una respuesta con razonamiento hacia crecer la memoria unos 45 MB/s hasta que Android cerraba la app. AutoDroid Studio lo corrige desde el 2026-11-05 reconstruyendo el historial; otras apps con la configuracion por defecto pueden sufrir el mismo fallo.
- Medido en un unico telefono (S22 Ultra de 12 GB); no hay datos en dispositivos con menos memoria.
- El contexto esta limitado a 4096 tokens; la build de 8192 no se publico por inestabilidad.
- Build no oficial, sin garantia, no afiliada a IFM ni a Google.
- Riesgo de alucinacion inherente al modelo base; no se han publicado evaluaciones de sesgo en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece soporte ni garantias sobre esta build concreta.

## Enlaces

- Hugging Face: https://huggingface.co/assassinshadow/K2-Horizon-3.7B-LiteRT-LM-GPU-CPU
- Modelo base: https://huggingface.co/IFM/K2-Horizon-3.7B
- LiteRT: https://github.com/google-ai-edge/LiteRT
- LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- App AutoDroid Studio (Google Play): https://play.google.com/store/apps/details?id=com.assassinshadow.aiserver
