# emergic/BotPsy-0.8B-GGUFs

## Resumen

BotPsy-0.8B es un modelo de lenguaje causal de 0,8 mil millones de parametros disenado especificamente para *function calling* y flujos de trabajo agenticos, desarrollado por Tether AI Research (Tether Data, S.A. de C.V.). Se construye sobre la arquitectura Qwen3.5-0.8B y esta optimizado para ejecucion completamente local en dispositivos, incluyendo telefonos moviles, mediante el SDK QVAC y llama.cpp. El repositorio analizado es un espejo no modificado de los pesos GGUF originales, publicado por el usuario `emergic` bajo licencia Apache 2.0.

El modelo resuelve el problema de disponer de capacidades de *tool calling* fiables en entornos con recursos muy limitados, donde no es viable desplegar modelos de mayor tamano. Segun la model card, en BF16 supera a todos los modelos de hasta 1,2B de parametros que probaron en seis benchmarks de uso de herramientas y agentes, lo que lo situa como una opcion competitiva dentro de su franja de tamano.

El repositorio ofrece tres variantes GGUF: BF16 sin cuantizar (1,52 GB), Q8_0 casi sin perdida (0,81 GB) y Q4_K_M con calibracion por matriz de importancia (0,53 GB). Esta orientado principalmente al ingles y su caso de uso principal es la inferencia en el propio dispositivo (*on-device*, *edge*, *smartphone*).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (arquitectura Qwen3.5) |
| Parametros totales | 752.393.024 (aproximadamente 0,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (sin cuantizar), Q8_0, Q4_K_M con imatrix |
| Idiomas soportados | Ingles (recomendado) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

BotPsy-0.8B emplea una arquitectura transformer causal basada en Qwen3.5-0.8B, con 752.393.024 parametros. El modelo esta especializado en *tool calling* y comportamiento agentico, y soporta un modo de razonamiento (*thinking mode*) que se activo en todas las evaluaciones publicadas. Las capas de prediccion multi-token (MTP) del modelo base no se incluyen en estos pesos GGUF.

La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La conversion a GGUF y la cuantizacion se realizaron con llama.cpp. La variante Q4_K_M utiliza calibracion por matriz de importancia (imatrix), que redujo su divergencia KL respecto al modelo BF16 en texto reservado de 0,048 (Q4_K_M estandar) a 0,036; para referencia, Q8_0 se situa en 0,001.

## Capacidades

- Generacion de texto conversacional en ingles.
- *Tool calling* y *function calling* estructurado, con soporte para invocacion de funciones externas.
- Flujos de trabajo agenticos y razonamiento multi-paso.
- Modo de razonamiento (*thinking mode*), activado en las evaluaciones publicadas.
- Seguimiento de instrucciones, con resultados destacados en IFEval (90,8 en BF16 con vLLM).
- Inferencia completamente local en dispositivos (*on-device*, *edge*, *smartphone*) mediante llama.cpp y el SDK QVAC.
- Compatibilidad con *endpoints* (etiqueta `endpoints_compatible`).
- Capacidades multilingues limitadas: el autor recomienda el ingles; no se documentan otros idiomas.
- No se documentan capacidades de vision ni de audio.

## Casos de uso

- Asistentes moviles con *tool calling*: el modelo puede invocar funciones del sistema (calendario, contactos, ajustes) directamente en el telefono gracias a su tamano de 0,8B y a los pesos Q4_K_M de 0,53 GB, que caben en la memoria de un dispositivo movil moderno.
- Agentes autonomos de baja complejidad: adecuado para tareas de dificultad baja a media que requieran encadenar varias llamadas a herramientas, como consultas a APIs y agregacion de resultados.
- Automatizacion de escritorio y *edge computing*: integrable en aplicaciones de escritorio o dispositivos IoT donde no hay conectividad o se requiere privacidad, ejecutando llama.cpp localmente.
- Enrutamiento de intenciones y clasificacion de comandos: su buen rendimiento en IFEval (90,8) e IFBench (55,9) lo hace util para interpretar instrucciones y decidir que funcion invocar en un pipeline.
- Prototipado rapido de agentes: al ser Apache 2.0 y ejecutable en CPU/GPU consumer, sirve para validar disenos de agentes antes de escalar a modelos mayores.
- Procesamiento de formularios y extraccion estructurada: el *function calling* permite mapear texto libre a esquemas JSON definidos por el desarrollador en aplicaciones de back office.
- Filtrado y preprocesado en pipelines de CI/CD: puede clasificar o transformar entradas textuales en entornos con recursos restringidos, aunque su baja puntuacion en conocimiento (MMLU-Pro 48,9) limita tareas que exijan amplio conocimiento factual.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes, mayor es mejor). Todas las ejecuciones en modo *thinking* con `temperature=0.3`, `top_p=0.95`, `top_k=20`, `presence_penalty=1.5`.

| Benchmark | BF16 (vLLM) | BF16 GGUF (llama.cpp) | Q8_0 (llama.cpp) | Q4_K_M imatrix (llama.cpp) |
|---|---|---|---|---|
| BFCL v4 | 44,0 | 44,6 | 44,2 | 43,5 |
| ACEBench | 58,7 | 58,8 | 58,0 | 57,3 |
| τ-bench | 51,5 | 47,5 | 48,6 | 46,7 |
| Claw-Eval | 46,5 | 43,4 | 44,0 | 42,1 |
| BrowseComp-Plus | 4,5 | 4,2 | 4,7 | 4,5 |
| GPQA Diamond | 38,0 | 39,2 | 38,2 | 35,3 |
| MMLU-Pro | 48,9 | 46,0 | 46,1 | 42,5 |
| IFEval | 90,8 | 92,6 | 93,2 | 93,3 |
| IFBench | 55,9 | 58,7 | 60,6 | 56,3 |
| Multi-IF | 67,2 | 69,4 | 69,7 | 67,6 |
| Media (10 benchmarks) | 50,6 | 50,4 | 50,7 | 48,9 |

Hallazgos clave de la model card: Q8_0 iguala al BF16 GGUF (50,7 frente a 50,4) con la mitad de tamano; Q4_K_M pierde aproximadamente 1,5 puntos de media, concentrados en conocimiento (MMLU-Pro −3,5 y GPQA Diamond −3,9 frente al BF16 GGUF). No se ejecuto ToolSandbox sobre los ficheros GGUF.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,52 GB para BF16, 0,81 GB para Q8_0 y 0,53 GB para Q4_K_M (tamano de los ficheros, sin contar el *overhead* del contexto).
- GPU recomendadas: las evaluaciones se realizaron en NVIDIA H100 con `llama-server` (build CUDA b12169); el modelo es lo bastante pequeno para ejecutarse tambien en GPU de gama media y consumer.
- Cabe en GPU consumer: si, dada la baja huella de memoria; tambien es viable en CPU y en telefonos moviles mediante llama.cpp y el SDK QVAC.
- Opciones de despliegue: llama.cpp (`llama-server`), SDK QVAC; el BF16 original se sirvio con vLLM para las evaluaciones de referencia. No se documenta soporte explicito de Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La model card afirma que, en BF16, BotPsy-0.8B supera a todos los modelos de hasta 1,2B de parametros probados en seis benchmarks de uso de herramientas y agentes, pero no se enumeran los modelos concretos ni sus puntuaciones en la informacion disponible.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BotPsy-0.8B | 0,8B | no disponible | Tool calling / agentes | Apache 2.0 | GGUF en HF |
| Qwen3.5-0.8B (base) | 0,8B | no disponible | Proposito general | no disponible | HF |
| Alternativas <=1,2B | hasta 1,2B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos detallados de modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo pequeno: el propio autor advierte que comete errores y que es adecuado solo para tareas de dificultad baja a media.
- Conocimiento factual limitado: MMLU-Pro de 48,9 y GPQA Diamond de 38,0 en BF16; la cuantizacion Q4_K_M agrava esta carencia.
- Riesgo de alucinacion: inherente a modelos de este tamano, especialmente en preguntas abiertas de conocimiento.
- Idiomas: optimizado para ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- Contexto: la longitud de contexto no se especifica en la informacion disponible, lo que dificulta planificar casos de uso con ventanas largas.
- Cuantizacion: Q4_K_M reduce la precision en conocimiento; para produccion se recomienda Q8_0, que iguala al BF16 con la mitad de tamano.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar `LICENSE` y `ATTRIBUTIONS.md` del repositorio original.
- Este repositorio es un espejo de terceros (`emergic`); para soporte y actualizaciones debe consultarse el repositorio original de `qvac`.
- No se documentan sesgos especificos ni evaluaciones de seguridad en la informacion disponible.

## Enlaces

- Repositorio espejo en Hugging Face: https://huggingface.co/emergic/BotPsy-0.8B-GGUFs
- Repositorio original GGUF: https://huggingface.co/qvac/BotPsy-0.8B-GGUFs
- Modelo fuente BF16: https://huggingface.co/qvac/BotPsy-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Blog post: https://huggingface.co/blog/qvac/botpsy
- Coleccion BotPsy: https://huggingface.co/collections/qvac/botpsy
- Licencia: https://huggingface.co/emergic/BotPsy-0.8B-GGUFs/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp
- SDK QVAC: https://qvac.tether.io/dev/sdk/
- Tether: https://tether.io/
