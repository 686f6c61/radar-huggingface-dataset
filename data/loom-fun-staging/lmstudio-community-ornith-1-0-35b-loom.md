# loom-fun-staging/lmstudio-community-Ornith-1.0-35B-loom

## Resumen

Ornith-1.0-35B es un modelo multimodal de tipo image-text-to-text con 35 mil millones de parámetros, distribuido originalmente en formato GGUF por el colectivo lmstudio-community. El repositorio que nos ocupa, `loom-fun-staging/lmstudio-community-Ornith-1.0-35B-loom`, no contiene pesos nuevos ni un fine-tuning del modelo: es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado con el flujo de trabajo loom-skills sobre el checkpoint Q4_K_M sin modificar del modelo base. Su propósito es permitir servir el modelo en GPUs AMD concretas —Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB)— mediante el servidor `loom-serve`, que expone una API compatible con OpenAI.

La relevancia de esta ficha es doble. Por un lado, documenta una alternativa de inferencia para hardware AMD consumer y profesional, con cifras de rendimiento medidas frente a llama.cpp ROCm (aunque el paquete actual no incluye las mediciones de Loom, solo los techos teóricos de roofline). Por otro, aclara que el modelo subyacente es un transformer multimodal con ventana de contexto de 262.144 tokens, soporte de tool calling y modo de razonamiento activado por defecto, empaquetado en cuantización Q4_K_M.

Conviene subrayar que los datos de arquitectura, entrenamiento y benchmarks del modelo Ornith-1.0-35B no aparecen en la información disponible: la model card del paquete Loom describe el entorno de despliegue, no el modelo en sí. Todo lo que sigue se limita a lo que consta en esa documentación y en los metadatos de Hugging Face, marcando explícitamente como "no disponible" aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text; la model card del paquete no detalla la arquitectura interna) |
| Parametros totales | 35B (según el nombre del modelo; no se desglosa en la información disponible) |
| Parametros activos | no disponible (la model card menciona "mixture-of-experts" al describir el techo de 4 streams, pero no publica el número de parámetros activos) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de visión en BF16 (`mmproj-Ornith-1.0-35B-BF16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (checkpoint `Ornith-1.0-35B-Q4_K_M.gguf`) empaquetado como programa Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo Ornith-1.0-35B ni su proceso de entrenamiento. La model card del paquete Loom únicamente permite inferir dos rasgos: que el modelo es multimodal con entrada de imagen (requiere un proyector `mmproj-Ornith-1.0-35B-BF16.gguf` para procesar imágenes mediante partes `image_url` al estilo OpenAI) y que, al calcular el techo de rendimiento para cuatro streams concurrentes, la documentación se refiere a él como "this mixture-of-experts model", lo que sugiere una arquitectura MoE, sin que se publiquen el número de expertos, los parámetros activos por token ni la composición del dataset.

Tampoco constan datos sobre volumen de tokens de entrenamiento, uso de RLHF o DPO, ni innovaciones técnicas como decodificación especulativa. De hecho, la tabla de prestaciones indica explícitamente que no hay cabeza MTP en el GGUF ni drafter publicado para este modelo concreto, por lo que la decodificación especulativa figura como "not applicable" tanto en las métricas como en la tabla de características. El paquete Loom sí incorpora un modo de razonamiento ("thinking") activado por defecto, desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`, y un preset de `max_tokens` de 4.096 para la salida.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto, desactivable por petición mediante `enable_thinking: false`.
- Entrada de imágenes en formato OpenAI `image_url`, procesadas a través del proyector BF16 incluido en el paquete.
- Tool calling al estilo OpenAI: acepta el campo `tools` y devuelve `tool_calls` estructurados.
- Bucles de agente multi-turno con reutilización de historial y renderizado exacto del prompt, validados por la puerta de corrección `agent` del paquete.
- Ventana de contexto de 262.144 tokens por petición, adecuada para documentos largos y conversaciones extensas.
- Concurrencia de hasta 4 peticiones simultáneas en el servidor `loom-serve`.
- Muestreo configurable con `temperature`, `top_p`, `top_k` y `seed`.
- API compatible con OpenAI en `/v1/chat/completions`, servida en `127.0.0.1:8080`.
- Sin soporte de audio ni de salida de audio; sin decodificación especulativa; sin "reasoning effort" configurable.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede mantener conversaciones multi-turno con hasta 262.144 tokens de contexto, lo que permite arrastrar el historial completo de un cliente y documentación de producto sin truncar. El tool calling estilo OpenAI facilita la integración con sistemas de ticketing y consultas a bases de datos.
- **Análisis de documentos largos con imagen**: informes escaneados, contratos o manuales técnicos pueden enviarse como texto e imágenes en la misma petición gracias al pipeline image-text-to-text y al proyector BF16, extrayendo conclusiones sobre decenas de miles de tokens de una vez.
- **Asistente de código en pipelines de CI/CD**: con tool calling y modo de razonamiento, el modelo puede invocarse desde un servidor `loom-serve` local para revisar diffs, proponer parches o ejecutar llamadas a herramientas de build, manteniendo los datos en hardware propio.
- **Agentes multi-paso sobre hardware AMD**: el paquete está pensado para Strix Halo y Radeon AI PRO R9700; un equipo con Ryzen AI Max+ 395 puede ejecutar un agente local que encadene varias llamadas a herramientas con 4 peticiones concurrentes, útil en entornos con requisitos de soberanía del dato.
- **Procesamiento por lotes de documentación técnica**: la tabla de prefill del paquete estima techos de 11.902 tok/s para documentos de 1k y 7.870 tok/s para 32k en Strix Halo, lo que hace viable indexar o resumir corpus grandes en una máquina de escritorio con GPU integrada.
- **Prototipado de asistentes multimodales en estaciones de trabajo**: la instalación vía `pip install "hrx-loom[hf]==0.1.0"` y `loom-fetch` permite levantar un endpoint compatible con OpenAI en minutos sobre una Radeon AI PRO R9700 de 32 GB, sin depender de CUDA.
- **Evaluación comparativa de motores de inferencia**: el paquete incluye puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `agent`) que permiten verificar que la salida de Loom coincide token a token con la referencia de llama.cpp, útil para equipos que validan motores alternativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card del paquete Loom solo incluye techos teóricos de roofline para Strix Halo, no mediciones reales de Loom ni de llama.cpp (las columnas de ambos motores aparecen con "—"):

| Métrica (Strix Halo, gfx1151) | llama.cpp | Loom | Techo roofline (tok/s) |
|---|---|---|---|
| Decode, prompt corto | — | — | 109,3 |
| Decode, contexto 2k | — | — | 107,1 |
| Decode, contexto 32k | — | — | 82,1 |
| Prefill, documento 1k | — | — | 11.902,0 |
| Prefill, documento 2k | — | — | 11.708,5 |
| Prefill, documento 8k | — | — | 10.668,0 |
| Prefill, documento 16k | — | — | 9.537,8 |
| Prefill, documento 32k | — | — | 7.870,2 |
| 4 streams, decode agregado | — | — | 426,7 |
| Decodificación especulativa | n/a | n/a | n/a |

El techo se calcula para el Ryzen AI Max+ 395 a 216 GB/s de ancho de banda y 59 TFLOP/s, mediante `loom-roofline` (`roofline.py`, loom-skills `acd9ac7`). Para el techo de 4 streams se asume que los cuatro flujos enrutan a los mismos expertos. En la Radeon AI PRO R9700 (gfx1201, 32 GB) los resultados "no se han vuelto a medir" según la propia model card.

## Requisitos de hardware

- **VRAM/memoria**: el paquete se sirve con `--memory_bytes=36000000000` (36 GB) en Strix Halo y `--memory_bytes=34000000000` (34 GB) en Radeon AI PRO R9700. El checkpoint es Q4_K_M, por lo que el grueso de los 35B ocupa aproximadamente 20-22 GB en pesos, más el proyector BF16 y las cachés KV para contexto largo.
- **GPU soportadas**: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) con memoria unificada, y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se documenta soporte para CUDA ni para otras GPU en la información disponible.
- **¿Cabe en GPU consumer?**: en el sentido estricto de GPU dedicada consumer, no hay datos; el paquete está dirigido a hardware AMD específico (APU de memoria unificada y GPU profesional de 32 GB). Una GPU consumer con menos de ~24 GB de VRAM no podría alojar el Q4_K_M completo.
- **Despliegue**: `loom-serve` (paquete `hrx-loom[hf]==0.1.0`), con `loom-fetch` para materializar el modelo. El servidor expone API OpenAI en `127.0.0.1:8080`. La model card menciona llama.cpp ROCm como referencia de comparación, pero el paquete no distribuye artefactos para vLLM, Ollama ni TGI.
- **Latencia y throughput**: solo se dispone de techos teóricos (ver sección anterior); no hay mediciones reales publicadas en esta versión del paquete. La puerta `kernel_tests`, `golden`, `compare`, `vision`, `consistency` y `agent` figura como "no re-ejecutada en este paquete" (la última pasada fue sobre el build sha256 `55d7192`).

## Comparativa con modelos similares

No hay información suficiente para comparar con alternativas concretas: la model card no publica parámetros activos, licencia ni benchmarks del modelo Ornith-1.0-35B, y no se dispone de datos verificables de modelos comparables en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Ornith-1.0-35B (este paquete) | 35B (activos no disponibles) | 262.144 | no disponible | GGUF Q4_K_M + paquete Loom |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Licencia desconocida**: tanto la licencia del modelo base como la del paquete figuran como "no disponible". No se puede asumir uso comercial sin verificar la licencia del checkpoint original en `lmstudio-community/Ornith-1.0-35B-GGUF`.
- **Idiomas no documentados**: no se especifica qué lenguas cubre el modelo ni su calidad relativa; no hay garantías de rendimiento en castellano.
- **Riesgo de alucinación**: no se han publicado evaluaciones de fidelidad ni de tasas de alucinación; como cualquier LLM, puede generar contenido plausible pero incorrecto, especialmente en modo thinking por defecto.
- **Sesgos**: no hay información sobre composición del dataset ni sobre evaluaciones de sesgo.
- **Hardware muy restringido**: el paquete solo está validado para Strix Halo y Radeon AI PRO R9700; no hay soporte documentado para CUDA, Apple Silicon ni otras GPU AMD.
- **Puertas de corrección no re-ejecutadas**: `kernel_tests`, `golden`, `compare`, `vision`, `consistency` y `agent` figuran como pendientes en este paquete (última pasada sobre el build `55d7192`), por lo que la equivalencia con llama.cpp no está verificada en esta versión.
- **Sin decodificación especulativa**: no hay cabeza MTP en el GGUF ni drafter publicado, lo que limita el throughput en decodificación.
- **Límite de salida**: preset de 4.096 tokens por respuesta; para respuestas más largas habría que ajustar la configuración del servidor.
- **Concurrencia limitada**: 4 peticiones simultáneas, insuficiente para despliegues de alta concurrencia sin replicar instancias.
- **Repositorio vacío en Hugging Face**: el tamaño del repo es 0,0 GB y no registra descargas ni likes; conviene verificar la integridad de los artefactos antes de usarlo en producción.

## Enlaces

- Repositorio del paquete en Hugging Face: https://huggingface.co/loom-fun-staging/lmstudio-community-Ornith-1.0-35B-loom
- Modelo base (GGUF): https://huggingface.co/lmstudio-community/Ornith-1.0-35B-GGUF
- Repositorio Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
