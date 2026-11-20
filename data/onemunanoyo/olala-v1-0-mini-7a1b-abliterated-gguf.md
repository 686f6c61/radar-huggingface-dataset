# onemunanoyo/Olala-v1.0-mini-7A1B-Abliterated-GGUF

## Resumen

Olala-v1.0-mini-7A1B-Abliterated-GGUF es una cuantizacion en formato GGUF de la version "abliterated" del modelo OVHaiLLM/Olala-v1.0-mini-7A1B, publicado por el usuario onemunanoyo en Hugging Face. Se trata de un modelo de generacion de texto con arquitectura Mixture of Experts (MoE), orientado a razonamiento explicito (modo thinking) y con capacidad de tool calling, cuyo rasgo diferencial es la eliminacion del vector de rechazo (abliteration) mediante proyeccion fuera de las matrices de escritura residual de las capas del decodificador.

El modelo base cuenta con 6.775.272.608 parametros totales segun los datos de safetensors, y la nomenclatura "7A1B" sugiere aproximadamente 7.000 millones de parametros totales con alrededor de 1.000 millones activos por token, aunque este dato de parametros activos no esta confirmado en la informacion disponible. El repositorio ocupa 32,9 GB e incluye cuatro cuantizaciones (BF16, Q8_0, Q6_K y Q4_K_M), lo que permite desplegarlo en hardware de consumo en las variantes mas comprimidas.

Su relevancia actual radica en dos factores: por un lado, emplea una arquitectura MoE con modo de razonamiento configurable (`reasoning_effort`), alineada con la tendencia de modelos que separan el contenido de pensamiento de la respuesta final; por otro, la abliteration lo convierte en una variante sin rechazos, lo que interesa a investigadores que estudian alineamiento y comportamiento de modelos, pero introduce riesgos importantes para uso en produccion. Un caveat critico: requiere un fork especifico de llama.cpp (OVHai-LLM) y no es compatible con llama.cpp upstream, Ollama ni LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) con modo de razonamiento |
| Parametros totales | 6.775.272.608 |
| Parametros activos | no disponible (la nomenclatura "7A1B" sugiere ~1B activos, sin confirmar) |
| Longitud de contexto | no disponible (el ejemplo de ejecucion usa `-c 16384`) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture of Experts (MoE), segun las etiquetas del repositorio, con un mecanismo de razonamiento que genera contenido de pensamiento (`reasoning_content`) antes de la respuesta final (`content`). La variante "Abliterated" se obtiene calculando una direccion de rechazo mediante el contraste entre prompts daninos y benignos, y proyectandola fuera de las matrices de escritura residual de las capas del decodificador. Segun el autor, las capacidades generales se preservan tras este proceso.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o similar en el modelo base. Tampoco se detalla la innovacion tecnica interna del enrutador MoE ni el mecanismo exacto de razonamiento. La unica informacion tecnica concreta sobre el proceso de abliteration es la descripcion del calculo del vector de rechazo y su proyeccion lineal, que el propio autor advierte que no garantiza generalizacion a todos los prompts, idiomas o formulaciones.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento explicito con modo thinking: el modelo escribe su pensamiento antes de la respuesta, con niveles configurables via `reasoning_effort` (`disabled`, `low`, `medium` por defecto, `high`).
- Tool calling / function calling: la respuesta incluye `tool_calls` cuando se pasan herramientas.
- Compatibilidad con la API de endpoints tipo OpenAI (`/v1/chat/completions`).
- Capacidad de razonamiento multi-paso derivada del modo thinking.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision o audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Investigacion sobre alineamiento y rechazos: el modelo permite estudiar como la proyeccion del vector de rechazo afecta al comportamiento del modelo en prompts sensibles, comparando con el modelo base sin abliterar. Es adecuado por su naturaleza experimental y su licencia Apache 2.0.
- Generacion de codigo asistida con tool calling: el soporte de `tool_calls` permite integrarlo en pipelines que invocan herramientas externas (ejecutores, linters, APIs) para tareas de generacion y validacion de codigo.
- Razonamiento multi-paso en entornos controlados: el modo thinking con `reasoning_effort` configurable permite ajustar el coste computacional segun la complejidad de la tarea, util para prototipos de agentes.
- Despliegue local en hardware de consumo: la cuantizacion Q4_K_M (5,69 GB) permite ejecutar el modelo en GPUs consumer con suficiente VRAM, adecuado para experimentacion offline sin dependencia de la nube.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece cuatro niveles (BF16 a Q4_K_M), lo que facilita estudios de degradacion de calidad frente a compresion en un modelo MoE.
- Prototipado de asistentes conversacionales sin restricciones de rechazo: para casos donde se requiere explorar respuestas a prompts que el modelo base rechazaria, siempre en entornos de investigacion y cumpliendo la legislacion aplicable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: BF16 ~13,59 GB; Q8_0 ~7,28 GB; Q6_K ~6,31 GB; Q4_K_M ~5,69 GB (tamanos de archivo, la VRAM real depende de la ventana de contexto y del offload).
- GPU recomendadas: no disponibles de forma explicita. Por tamano, las cuantizaciones Q4_K_M y Q6_K caben en GPUs consumer de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070); Q8_0 y BF16 requieren 12-16 GB o mas (RTX 4080/4090, A100, H100).
- Cabe en GPU consumer: si, en las cuantizaciones Q4_K_M y Q6_K con GPUs de 8 GB o mas, sujeto a la ventana de contexto.
- Opciones de despliegue: exclusivamente el fork OVHai-LLM de llama.cpp (`llama-server`). No compatible con llama.cpp upstream, Ollama ni LM Studio.
- Latencia y throughput: no disponibles. El ejemplo del autor usa `-ngl 99 -fa 1 -c 16384`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Olala-v1.0-mini-7A1B-Abliterated-GGUF | 6,77 B totales (MoE, activos no disponibles) | no disponible | Apache 2.0 | GGUF, fork llama.cpp | Abliterated, modo thinking, tool calling |
| Modelo base OVHaiLLM/Olala-v1.0-mini-7A1B | 6,77 B totales | no disponible | Apache 2.0 | no disponible | Version con rechazos intactos |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables para comparar |

No se dispone de informacion suficiente sobre modelos comparables de la misma categoria para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- La abliteration elimina los rechazos: el modelo puede generar contenido que el modelo base declinaria. Uso responsable y conforme a la legislacion aplicable.
- La eliminacion del vector de rechazo es una proyeccion lineal unica y no garantiza generalizacion a todos los prompts, idiomas o formulaciones.
- Aplican las limitaciones del modelo base, que no se detallan en la informacion disponible.
- Requiere un fork especifico de llama.cpp (OVHai-LLM); no funciona con llama.cpp upstream, Ollama ni LM Studio, lo que limita su integracion en pipelines estandar.
- El modelo es de razonamiento: consume tokens en el pensamiento antes de la respuesta, por lo que hay que reservar suficiente `max_tokens` para ambos.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Idiomas soportados no disponibles; no se puede garantizar calidad multilingue.
- Licencia Apache 2.0 permite uso comercial, pero exige conservar el archivo `NOTICE` upstream al redistribuir el modelo o derivados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion practicamente nulo.

## Enlaces

- Hugging Face: https://huggingface.co/onemunanoyo/Olala-v1.0-mini-7A1B-Abliterated-GGUF
- Modelo base: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B
- Fork de llama.cpp requerido: https://github.com/OVHai-LLM/llama.cpp
