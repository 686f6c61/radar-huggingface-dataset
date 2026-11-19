# sairaph-official/DeepSeek-R1-Distill-Qwen-1.5B-1e4af2f

## Resumen

DeepSeek-R1-Distill-Qwen-1.5B es un modelo de generacion de texto de 1.500 millones de parametros desarrollado por DeepSeek, obtenido mediante destilacion del modelo de razonamiento DeepSeek-R1 sobre la base Qwen2.5-1.5B. Este repositorio concreto, publicado por el usuario `sairaph-official`, no es el modelo original: es un espejo (mirror) sin modificaciones del repositorio `litert-community/DeepSeek-R1-Distill-Qwen-1.5B`, que a su vez empaqueta el modelo en formato LiteRT-LM para su despliegue en Android, iOS y web.

El problema que resuelve es el de llevar un modelo de razonamiento con cadena de pensamiento (chain-of-thought) a dispositivos moviles y entornos de borde, donde no hay GPU de datacenter ni memoria abundante. El paquete incluido es un unico fichero `.litertlm` de 1.833.451.520 bytes (aproximadamente 1,83 GB) con cuantizacion `q8` y una cache KV de 4096 tokens, optimizado para el stack LiteRT (anteriormente TFLite) de Google.

Es relevante ahora porque demuestra que la destilacion de modelos de razonamiento grandes en arquitecturas pequenas, combinada con runtimes de inferencia en dispositivo, permite ejecutar tareas de razonamiento y chat de forma local en un telefono de gama alta con velocidades de decodificacion de alrededor de 27 tokens por segundo. La licencia es MIT, lo que facilita su uso comercial, aunque conviene revisar las condiciones del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-1.5B), destilada de DeepSeek-R1 |
| Parametros totales | 1.500 millones (1.5B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens en el paquete LiteRT incluido (cache KV `ekv4096`); la del modelo base original no se especifica en la informacion disponible |
| Tipos de cuantizacion | `q8` / `dynamic_int8` (pesos int8, activaciones float) en el fichero `.litertlm` incluido |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | MIT |
| Formato de pesos | `.litertlm` (LiteRT-LM); no se incluyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only denso de 1.5B parametros, heredado de la arquitectura Qwen2.5-1.5B, sobre el que DeepSeek aplico destilacion a partir de DeepSeek-R1. La destilacion transfiere el comportamiento de razonamiento del modelo profesor (generacion de trazas de pensamiento antes de la respuesta final) a un modelo alumno mucho mas pequeno. La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO especificas para esta variante destilada.

La innovacion tecnica de este repositorio no esta en el modelo en si, sino en el empaquetado: el fichero `.litertlm` esta compilado para el stack LiteRT-LM de Google, con soporte de multiples firmas de prefill (`multi-prefill-seq`), cuantizacion dinamica int8 y una cache KV fija de 4096 tokens. Esto permite ejecutar la inferencia en Android mediante la libreria `com.google.ai.edge.litertlm:litertlm-android` y en otros entornos a traves de la MediaPipe LLM Inference API (en modo solo mantenimiento) o LiteRT-LM.

## Capacidades

- Generacion de texto conversacional (tag `chat`, pipeline `text-generation`).
- Razonamiento con cadena de pensamiento: al derivar de DeepSeek-R1, el modelo esta disenado para producir trazas de razonamiento antes de la respuesta final.
- Razonamiento matematico y resolucion de problemas paso a paso (capacidad heredada del modelo profesor, sin cifras de benchmark publicadas en este repositorio).
- Generacion y explicacion de codigo a nivel basico, limitada por el tamano de 1.5B parametros.
- Inferencia en dispositivo (on-device) en Android mediante LiteRT-LM, con soporte de ejecucion en CPU (delegado XNNPACK) y GPU.
- Soporte de prefill multiple para acelerar la fase de procesamiento del prompt.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente de texto.
- Idiomas: no disponible.

## Casos de uso

- Asistente de chat local en Android: integrado mediante LiteRT-LM en una app movil, el modelo gestiona conversaciones multi-turno con una ventana de 4096 tokens y una decodificacion de aproximadamente 27 tokens/s en un Samsung S24 Ultra, suficiente para respuestas interactivas sin conexion.
- Razonamiento offline en entornos sin red: en escenarios de campo, aviacion o zonas con conectividad limitada, el modelo puede resolver problemas matematicos y logicos paso a paso de forma completamente local, sin enviar datos a la nube.
- Procesamiento de datos sensibles en el dispositivo: al ejecutarse localmente, permite resumir o analizar texto confidencial (notas clinicas, documentos internos) sin que los datos abandonen el telefono, cumpliendo requisitos de privacidad.
- Prototipado rapido de funciones de IA en apps moviles: los desarrolladores pueden usar el paquete `.litertlm` con la libreria Kotlin de LiteRT-LM para validar flujos de generacion de texto antes de invertir en infraestructura de servidor.
- Educacion y tutoria paso a paso: su capacidad de generar trazas de razonamiento lo hace adecuado para explicar la resolucion de problemas matematicos o de logica a estudiantes, mostrando el proceso y no solo el resultado.
- Generacion de codigo asistida en editores moviles: para autocompletar fragmentos cortos, generar expresiones o explicar errores sencillos en un IDE de Android, aprovechando el bajo consumo de memoria (unos 2,1-2,2 GB de RSS en el dispositivo de referencia).
- Filtrado y clasificacion de texto en el borde: tareas de etiquetado, extraccion de entidades o resumen de mensajes en aplicaciones de mensajeria, donde la latencia de primera respuesta de 5,5-6,4 segundos es aceptable para operaciones no interactivas.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de rendimiento de inferencia en un Samsung S24 Ultra con cache KV de 1280 y multiples firmas de prefill activadas. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Backend | Cuantizacion | Contexto | Prefill (tok/s) | Decode (tok/s) | TTFT (s) | Tamano (MB) | RSS pico (MB) | Memoria GPU (MB) |
|---|---|---|---|---|---|---|---|---|
| CPU | dynamic_int8 | 4096 | 166,50 | 26,35 | 6,41 | 1831,43 | 2221 | N/A |
| GPU | dynamic_int8 | 4096 | 927,54 | 26,98 | 5,46 | 1831,43 | 2096 | 1659 |

Notas de la model card: la inferencia en CPU se acelera con el delegado XNNPACK de LiteRT con 4 hilos; las cifras asumen cache XNNPACK habilitada e inicializada; el tamano se mide sobre el flatbuffer `.tflite`; `dynamic_int8` corresponde a pesos int8 con activaciones float.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 2,1-2,2 GB de memoria RSS pico en Android con el paquete `q8` incluido; en GPU movil, unos 1,66 GB de memoria GPU.
- GPU recomendadas: no aplica GPU de datacenter; el objetivo es GPU integrada de movil (el benchmark usa un Samsung S24 Ultra). En escritorio, cualquier GPU consumer moderna puede ejecutar el modelo base, pero este repositorio no incluye pesos en formato para ello.
- Cabe en GPU consumer: si, el modelo base de 1.5B cabe holgadamente en cualquier GPU consumer (incluso en cuantizacion de 8 bits ocupa menos de 2 GB), aunque para ello habria que usar el repositorio original, no este paquete LiteRT.
- Opciones de despliegue: LiteRT-LM (Android, via `com.google.ai.edge.litertlm:litertlm-android`), MediaPipe LLM Inference API (solo mantenimiento), Edge Gallery App de Google, y Colab para pruebas (con rendimiento degradado respecto a dispositivo local). vLLM, llama.cpp, Ollama y TGI no son compatibles con el formato `.litertlm` incluido.
- Latencia y throughput: en Samsung S24 Ultra, prefill de 166,50 tok/s en CPU y 927,54 tok/s en GPU; decodificacion de 26,35 tok/s en CPU y 26,98 tok/s en GPU; TTFT de 6,41 s en CPU y 5,46 s en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato de despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B (este repo, mirror LiteRT) | 1.5B | 4096 (paquete) | `.litertlm` | MIT | Optimizado para Android; ~27 tok/s decode en S24 Ultra |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B (original) | 1.5B | no disponible en la informacion | safetensors (presumiblemente, no confirmado) | MIT | Modelo fuente; requiere runtime estandar (transformers, llama.cpp, etc.) |
| Qwen2.5-1.5B (base arquitectonica) | 1.5B | no disponible en la informacion | safetensors | no disponible en la informacion | Modelo base sobre el que se destilo; sin capacidad de razonamiento R1 |
| Modelos comparables de otro tamano | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks para establecer comparacion cuantitativa |

No se dispone de resultados de benchmarks comparativos en la informacion proporcionada, por lo que la comparacion se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Este repositorio es un espejo no oficial: el autor (`sairaph-official`) no ha modificado los ficheros, pero tampoco es el desarrollador original. Para produccion conviene referenciar el repositorio upstream `litert-community/DeepSeek-R1-Distill-Qwen-1.5B` o el modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`.
- El paquete incluido esta limitado a una cache KV de 4096 tokens; no se puede ampliar el contexto sin recompilar el modelo con otra configuracion.
- Solo se incluye una variante de cuantizacion (`q8`); no hay versiones int4 ni float16 en este repositorio, lo que limita el ajuste fino entre calidad y memoria.
- Al ser un modelo de 1.5B destilado, su capacidad de razonamiento, codigo y conocimiento factual es sustancialmente inferior a la de modelos mayores; es propenso a errores en tareas complejas y a alucinaciones, especialmente en dominios especializados.
- Riesgo de alucinacion inherente a los modelos de lenguaje; la generacion de cadenas de pensamiento no garantiza la correccion del resultado final.
- No se declara lista de idiomas soportados; el rendimiento en castellano no esta documentado y podria ser inferior al de ingles.
- La licencia MIT del repositorio se aplica al empaquetado, pero el modelo base arrastra las condiciones de DeepSeek; conviene verificar los terminos del modelo original antes de un uso comercial a gran escala.
- El rendimiento medido corresponde a un Samsung S24 Ultra; en dispositivos de gama media o baja la latencia y el throughput pueden degradarse notablemente.
- La MediaPipe LLM Inference API esta en modo solo mantenimiento; para nuevos desarrollos se recomienda LiteRT-LM.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio en Hugging Face (este mirror): https://huggingface.co/sairaph-official/DeepSeek-R1-Distill-Qwen-1.5B-1e4af2f
- Repositorio upstream LiteRT: https://huggingface.co/litert-community/DeepSeek-R1-Distill-Qwen-1.5B
- Modelo base original: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- LiteRT (antes TFLite): https://ai.google.dev/edge/litert
- MediaPipe LLM Inference API: https://ai.google.dev/edge/mediapipe/solutions/genai/llm_inference
- LiteRT-LM (GitHub): https://github.com/google-ai-edge/LiteRT-LM
- Guia LiteRT-LM para Android: https://ai.google.dev/edge/litert-lm/android
- Ejemplos LiteRT: https://github.com/google-ai-edge/litert-samples
- Edge Gallery App: https://github.com/google-ai-edge/gallery
- Edge Gallery en Google Play: https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Delegado XNNPACK: https://github.com/google/XNNPACK
- Notebook de Colab: https://colab.research.google.com/#fileId=https://huggingface.co/litert-community/DeepSeek-R1-Distill-Qwen-1.5B/blob/main/notebook.ipynb
