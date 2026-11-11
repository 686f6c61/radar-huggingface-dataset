# ellachang/phishing-detector-14b-v2-gguf

## Resumen

phishing-detector-14b-v2-gguf es una cuantizacion en formato GGUF (Q4_K_M) del modelo Qwen3-14B con el adaptador LoRA `ellachang/phishing-detector-14b-v2-lora` fusionado, publicada por el usuario ellachang. El modelo esta especializado en una unica tarea de clasificacion binaria: determinar si un correo electronico es phishing o legitimo, respondiendo con una sola palabra (`phishing` o `legitimate`). El repositorio ocupa 9,0 GB y esta pensado para su despliegue local mediante Ollama.

Se trata de un fine-tuning sobre una base densa de aproximadamente 14.768 millones de parametros, con licencia Apache 2.0 y soporte exclusivo de ingles. Su relevancia practica radica en que permite ejecutar un clasificador de seguridad del correo electronico en infraestructura propia, sin depender de servicios en la nube, lo que resulta atractivo para equipos que procesan mensajes potencialmente sensibles.

La model card advierte de un detalle critico de uso: el modelo fue entrenado con texto plano y debe invocarse con `"raw": true` en la API de Ollama. Si se aplica la plantilla de chat, el modelo tiende a iniciar un bloque `<think>` y no emite respuesta, con una caida de precision del 100 % al 77,5 % sobre el conjunto de prueba. No se publican detalles de arquitectura especificos del adaptador ni resultados de benchmarks mas alla de esa cifra de exactitud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-14B) con adaptador LoRA fusionado |
| Parametros totales | 14.768.307.200 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la configuracion de ejemplo usa `num_ctx` de 8192) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (9,0 GB) y safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-14B, un transformer denso de aproximadamente 14,7 mil millones de parametros, sobre el que se ha aplicado un ajuste fino mediante LoRA. El adaptador resultante (`phishing-detector-14b-v2-lora`) se ha fusionado en los pesos base y posteriormente se ha cuantizado a Q4_K_M para su distribucion en formato GGUF, orientado a inferencia local con Ollama.

El entrenamiento se realizo sobre texto plano, sin plantilla de chat, segun se desprende de las instrucciones de uso de la model card. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se detallan innovaciones tecnicas adicionales mas alla de la fusion del adaptador y la cuantizacion.

## Capacidades

- Clasificacion binaria de correos electronicos en dos categorias: `phishing` o `legitimate`.
- Respuesta de una sola palabra, disenada para integrarse en pipelines automatizados con `num_predict` bajo (4 tokens en el ejemplo).
- Inferencia determinista mediante `temperature: 0`, adecuada para tareas de clasificacion reproducible.
- Ejecucion local a traves de la API de Ollama (`/api/generate`) con el flag `raw: true`.
- Soporte unicamente en ingles; no se documentan capacidades multilingues.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento extendido mas alla del comportamiento `<think>` no deseado observado.

## Casos de uso

- Filtrado de correo entrante en pasarelas de correo corporativo: el modelo clasifica cada mensaje como phishing o legitimo antes de la entrega, integrandose como un paso adicional en el flujo SMTP o en un servicio de analisis.
- Analisis de bandejas de soporte y abuso: los equipos de seguridad pueden procesar lotes de correos reportados por usuarios y priorizar los marcados como phishing para revision manual.
- Automatizacion de triaje en SOC: clasificacion masiva de mensajes sospechosos para reducir el volumen que llega a analistas humanos, con respuestas de una sola palabra faciles de parsear.
- Cumplimiento y privacidad de datos: al ejecutarse localmente con Ollama, permite clasificar correos sensibles sin enviarlos a APIs externas, util en sectores regulados.
- Formacion y simulacros de phishing: clasificacion de plantillas y variantes de correos para validar campanas internas de concienciacion.
- Investigacion en deteccion de phishing: base para experimentos academicos o comparativas de clasificadores, dado que el adaptador y el modelo estan publicados con licencia Apache 2.0.

## Benchmarks y rendimiento

La model card unicamente reporta una exactitud del 100 % sobre el conjunto de prueba cuando se invoca con `raw: true`, y del 77,5 % cuando se aplica la plantilla de chat. No se detallan el tamano ni la composicion de dicho conjunto de prueba, ni se publican resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros).

| Metrica | Valor | Condiciones |
|---|---|---|
| Exactitud en test | 100 % | Invocacion con `raw: true` |
| Exactitud en test | 77,5 % | Invocacion con plantilla de chat |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9-11 GB con la cuantizacion Q4_K_M de 9,0 GB, mas el overhead de contexto (la configuracion de ejemplo usa 8192 tokens de contexto).
- GPU recomendadas: tarjetas con 12 GB o mas de VRAM, como RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: si, en modelos con al menos 12 GB de VRAM; en tarjetas de 8 GB seria necesario reducir contexto o recurrir a cuantizaciones menores no publicadas en este repositorio.
- Opciones de despliegue: Ollama (metodo documentado), y en principio otros runners compatibles con GGUF como llama.cpp, aunque la model card solo detalla Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables de clasificacion de phishing en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| phishing-detector-14b-v2-gguf | 14,77 B | no disponible | Clasificacion phishing/legitimo | Apache 2.0 | GGUF Q4_K_M |
| Qwen3-14B (base) | 14,77 B | no disponible | Proposito general | no disponible | safetensors |
| Alternativas especializadas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Requiere invocacion con `"raw": true`; con la plantilla de chat la precision cae del 100 % al 77,5 % y el modelo puede no emitir respuesta por quedarse en un bloque `<think>`.
- `ollama run` siempre aplica la plantilla de chat, por lo que no es un metodo valido para este modelo; debe usarse la API.
- Solo soporta ingles; correos en otros idiomas pueden degradar la clasificacion.
- La exactitud del 100 % procede de un conjunto de prueba no descrito en la model card, por lo que no debe extrapolarse a dominios o distribuciones de correo distintas sin validacion propia.
- Riesgo de alucinacion y de respuestas fuera del formato esperado si el prompt no sigue exactamente la plantilla documentada.
- No se documentan sesgos conocidos, pero al derivarse de un modelo de proposito general puede heredar sesgos del corpus base.
- Licencia Apache 2.0, que permite uso comercial, aunque no se especifican restricciones adicionales del modelo base Qwen3-14B.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no hay validacion independiente publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ellachang/phishing-detector-14b-v2-gguf
- Adaptador LoRA base: https://huggingface.co/ellachang/phishing-detector-14b-v2-lora
- No se han encontrado en la informacion disponible papers, blogs, repositorios adicionales ni demos.
