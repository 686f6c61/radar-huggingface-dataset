# jwlutz/qwen35-9b-abliterated-edge

## Resumen

`jwlutz/qwen35-9b-abliterated-edge` es un paquete de distribucion para despliegue en el borde (edge) construido sobre el modelo abliterado `huihui-ai/Huihui-Qwen3.5-9B-abliterated`, que a su vez deriva del `Qwen/Qwen3.5-9B` de Alibaba. El autor, jwlutz, no ha reentrenado ni modificado los pesos: empaqueta una cuantizacion GGUF Q3_K_S ya existente (generada por mradermacher) junto con un contenedor Linux ARM64 autocontenido que expone una API compatible con OpenAI mediante llama.cpp. El objetivo declarado es ofrecer un artefacto reproducible y verificado por hash para inferencia local en CPU.

El modelo cuenta con 8.953.803.264 parametros totales (aproximadamente 9B, arquitectura densa, sin mezcla de expertos) y una licencia Apache-2.0. La cuantizacion Q3_K_S ocupa 4.259.407.232 bytes (unos 4,26 GB), lo que permite ejecutarlo en equipos con recursos modestos, incluyendo Macs con Apple Silicon, aunque el contenedor incluido es exclusivamente ARM64 y no se ha validado en x86. El contexto configurado en el servicio es de 12.288 tokens con K/V en F16 y el modo de razonamiento (thinking) desactivado por defecto.

La relevancia de esta ficha es doble: por un lado, documenta un caso de empaquetado reproducible con verificacion criptografica de artefactos; por otro, advierte de que se trata de una validacion de empaquetado y API, no de calidad del modelo. El autor es explicito en que no se han ejecutado benchmarks de calidad, no se ha validado el rendimiento a contexto completo y que una peticion con 6.976 tokens de entrada agoto el tiempo de espera de 300 segundos sin respuesta final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), sin MoE |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 12.288 tokens configurados en el servicio del contenedor |
| Tipos de cuantizacion | GGUF Q3_K_S (unica incluida) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (pesos); componentes de runtime con sus propias licencias |
| Formato de pesos | GGUF (Q3_K_S) y contenedor Docker ARM64 con los pesos embebidos |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Qwen3.5, con aproximadamente 9.000 millones de parametros. El autor no aporta detalles sobre la composicion del dataset de preentrenamiento ni sobre el proceso de alineacion original de Qwen, y esta ficha no dispone de esa informacion. Sobre el modelo base se aplico una intervencion de tipo *abliteration* (eliminacion de direcciones de rechazo en los pesos) por parte de huihui-ai, y posteriormente mradermacher genero la cuantizacion GGUF Q3_K_S. jwlutz no realizo entrenamiento, abliteration ni steering adicional: los bytes del modelo son identicos a la cuantizacion fijada (*pinned*) de origen.

La innovacion de este release no esta en el modelo sino en el empaquetado: un contenedor Linux ARM64 autocontenido con llama.cpp b11960, verificacion de tamano y SHA-256 del GGUF completo al arrancar, API compatible con OpenAI en `http://127.0.0.1:18086/v1`, cuatro hilos de CPU, un slot, K/V en F16, thinking desactivado y limite de generacion por defecto de 2.048 tokens. El archivo de imagen tiene un ID verificado (`sha256:73efb26394cb...`) y el GGUF tiene hash `8df3a2273931efc3...`. No hay descarga de pesos en tiempo de ejecucion ni fallback a inferencia alojada.

## Capacidades

- Generacion de texto conversacional multi-turno mediante una API compatible con OpenAI (`/v1/chat/completions`).
- Plantilla de chat con soporte de `enable_thinking` (modo de razonamiento activable o desactivable); el servicio lo desactiva por defecto.
- Salida JSON con esquema restringido: el autor valido una peticion de JSON con esquema y paso la comprobacion.
- Aritmetica basica: validada con una peticion de suma entera (17 + 25) en modo thinking-off.
- Capacidad multilingue: no disponible en la informacion proporcionada.
- Tool calling / function calling: no documentado en la model card; no disponible.
- Capacidades de agente y razonamiento multi-paso: no validadas; el autor declara explicitamente que no se ha evaluado la calidad de decision ni la fiabilidad factual.
- Vision, audio: no soportados (pipeline text-generation unicamente).
- Debido a la abliteration, el modelo responde a prompts que un modelo alineado rechazaria; esto es una capacidad tecnica, no una garantia de calidad.

## Casos de uso

- Inferencia local en dispositivos ARM64 con recursos limitados: el contenedor esta pensado para ejecutarse con 7 GiB de limite de memoria y cuatro hilos de CPU, lo que permite desplegar un LLM de 9B en un Mac con Apple Silicon sin GPU dedicada.
- Prototipado de APIs compatibles con OpenAI en entornos aislados: al exponer `/v1/chat/completions` en loopback, se puede apuntar un cliente existente (SDK de OpenAI, LangChain, etc.) al servicio local sin cambiar codigo de aplicacion.
- Generacion de JSON estructurado para pipelines de extraccion de datos: la validacion realizada con esquema restringido sugiere utilidad para tareas de salida estructurada de baja complejidad, siempre con validacion posterior.
- Tareas aritmeticas y de calculo simple en el borde: la prueba de suma entera con thinking-off muestra que el modelo puede resolver operaciones sencillas con baja latencia en caliente (0,343 s hasta el primer token en la repeticion).
- Evaluacion de seguridad y red teaming: al ser un modelo abliterado, sirve para estudiar el comportamiento de modelos sin rechazos y para construir clasificadores o filtros defensivos frente a contenido no alineado.
- Reproducibilidad de despliegues: el manifiesto `release-manifest.json` y los hashes SHA-256 permiten verificar la identidad exacta del artefacto en un pipeline de CI/CD antes de desplegarlo.
- Investigacion sobre cuantizacion Q3_K_S: permite medir el impacto de una cuantizacion agresiva (4,26 GB para 9B) en tareas cortas, comparandola con el modelo en BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor lo declara explicitamente: el release es una validacion de empaquetado y API, no de calidad del modelo.

Las unicas mediciones disponibles son latencias de CPU en un Apple Silicon, con entradas de 28 y 48 tokens renderizados y reutilizacion de 24 y 44 tokens de prompt en las repeticiones:

| Peticion corta | Primera salida visible (s) | Respuesta completada (s) |
|---|---:|---:|
| Aritmetica, primera observacion | 2,239 | 2,442 |
| Aritmetica, repetida | 0,343 | 0,548 |
| JSON, primera observacion | 3,958 | 6,001 |
| JSON, repetida | 0,391 | 2,489 |

Una peticion separada con 6.976 tokens de entrada renderizados agoto el tiempo de espera de 300 segundos sin respuesta final, con un presupuesto de salida solicitado de 2.048 tokens. El autor advierte que estas cifras no son garantias de latencia ni un benchmark con potencia estadistica.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 4,26 GB solo para los pesos Q3_K_S; el contenedor configura un limite de servicio de 7 GiB de memoria.
- GPU recomendadas: no aplica para el contenedor incluido, que es de CPU. El GGUF suelto puede ejecutarse en GPU con un runtime compatible (llama.cpp con backend CUDA/Metal), pero no se han publicado mediciones.
- Cabe en GPU de consumo: si, en principio, con el GGUF suelto en tarjetas con 6 GB o mas de VRAM, aunque no hay datos de rendimiento publicados para ese escenario.
- Plataformas validadas: Linux ARM64 (contenedor Docker). La ejecucion en x86 no fue validada. El contenedor no funciona de forma nativa en iOS; el GGUF suelto requiere un runtime nativo y pruebas en dispositivo, no realizadas.
- Opciones de despliegue: Docker con `docker compose` (ruta validada), llama.cpp b11960 (runtime incluido), y el GGUF suelto con cualquier runtime compatible con GGUF (llama.cpp, Ollama, etc., no validados por el autor). BigMoeOnEdge v0.39.0 tambien paso cuatro comprobaciones, pero llama.cpp fue mas rapido en esta comparacion pequena.
- Latencia y throughput: ver tabla de la seccion anterior. Solo hay mediciones para peticiones cortas en CPU; el rendimiento a contexto completo y con salidas largas no esta validado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion incluida | Licencia | Enfoque |
|---|---|---|---|---|---|
| jwlutz/qwen35-9b-abliterated-edge | 8,95B (denso) | 12.288 (configurado) | Q3_K_S GGUF | Apache-2.0 | Paquete edge ARM64 con API OpenAI |
| huihui-ai/Huihui-Qwen3.5-9B-abliterated | 8,95B (denso) | No disponible | Pesos originales | Apache-2.0 | Modelo abliterado base |
| mradermacher/Huihui-Qwen3.5-9B-abliterated-GGUF | 8,95B (denso) | No disponible | Multiples GGUF | Apache-2.0 | Repositorio de cuantizaciones |
| Qwen/Qwen3.5-9B | 8,95B (denso) | No disponible | Pesos originales | Apache-2.0 | Modelo original alineado |

Los tres primeros comparten exactamente los mismos pesos subyacentes; la diferencia esta en el empaquetado y la cuantizacion. Frente al modelo original de Qwen, la variante abliterada elimina los rechazos, lo que cambia el perfil de seguridad pero no el tamano ni la arquitectura. No se dispone de datos de benchmarks comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que este release no establece calidad de decision, fiabilidad factual, resistencia al *sandbagging* ni exito de la intervencion de alineacion. Las respuestas pueden ser erroneas.
- Riesgo de alucinacion: no evaluado; al ser un modelo abliterado y cuantizado a Q3_K_S, la fidelidad factual puede degradarse respecto al modelo original.
- Contexto: aunque el servicio configura 12.288 tokens, una peticion de 6.976 tokens de entrada no completo en 300 segundos. El rendimiento a contexto completo no esta validado.
- Idiomas: no se especifican los idiomas soportados; no disponible.
- Licencia: los pesos son Apache-2.0, lo que permite uso comercial, pero el runtime y los componentes de la imagen base conservan sus propias licencias, documentadas en `source/licenses/` y dentro de la imagen.
- Plataforma: el contenedor es exclusivamente ARM64; la ejecucion en x86 no fue validada. No funciona de forma nativa en iOS.
- Red: el servicio se enlaza a loopback del host, pero el puente Docker tiene capacidad de red; el autor aclara que no es una afirmacion de aislamiento de red.
- El modelo esta abliterado: responde a prompts que un modelo alineado rechazaria, lo que exige controles de contenido adicionales en produccion.
- No se han publicado benchmarks de calidad; cualquier decision de despliegue deberia basarse en evaluaciones propias sobre el caso de uso concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jwlutz/qwen35-9b-abliterated-edge
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo abliterado: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-9B-abliterated
- Cuantizaciones GGUF de mradermacher: https://huggingface.co/mradermacher/Huihui-Qwen3.5-9B-abliterated-GGUF
- Runtime llama.cpp (commit fijado): https://github.com/ggml-org/llama.cpp/tree/8642541b255bfb5dc39cd351a178be09013a55d6
- Indice de modelos abliterados: https://www.abliteratedmodels.org/
