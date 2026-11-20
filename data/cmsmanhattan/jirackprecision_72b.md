# CMSManhattan/JiRackPrecision_72b

## Resumen

JiRack Precision 72B es un modelo de lenguaje de 72.149.574.656 parametros desarrollado por CMSManhattan (Konstantin Grabko) a partir de un modelo de DeepSeek, reconstruido con la arquitectura propietaria JiRack. El modelo esta orientado a generacion de texto, codigo, matematicas y tool calling, y se distingue por responder de forma directa y breve, sin una fase de razonamiento separada, lo que lo posiciona como la variante mas rapida de la linea JiRack 70B.

Segun la model card, la arquitectura consta de 132 capas, un tamano oculto de 5.120, 40 cabezas de atencion de consulta y 8 cabezas de clave/valor con tamano de cabeza 128, un contexto de 16.384 tokens y un vocabulario de 152.064 tokens. Los pesos se distribuyen en formato safetensors y GGUF, con cuantizaciones Q8_0 (76,7 GB) y Q4_K_M (43,6 GB).

El modelo resulta relevante para desarrolladores que buscan un LLM de gran tamano con soporte nativo de tool calling (llamadas simples y paralelas) y buen rendimiento reportado en tareas de codigo y matematicas (87,2% en HumanEval pass@1 y 93,5% en GSM8K, medidos en Q4_K_M con llama.cpp). Su principal advertencia es la licencia propietaria JiRack, que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de DeepSeek, reconstruido en arquitectura JiRack; 132 capas, hidden size 5.120, 40 cabezas de consulta, 8 cabezas KV, head size 128 |
| Parametros totales | 72.149.574.656 (72,1B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | Q8_0 (76,7 GB), Q4_K_M (43,6 GB) en GGUF; pesos safetensors en el repo |
| Idiomas soportados | no disponible |
| Licencia | jirack-proprietary (licencia propietaria JiRack; el modelo base DeepSeek es MIT y el Qwen subyacente es Apache 2.0) |
| Formato de pesos | safetensors y GGUF |
| Vocabulario | 152.064 tokens |
| Tamano del repo | 264,5 GB |
| Pipeline | text-generation |
| Fecha de creacion | 2026-11-18 |
| Fecha de actualizacion | 2026-11-20 |

## Arquitectura y entrenamiento

La model card describe JiRack Precision 72B como una version modificada de un modelo de DeepSeek, que a su vez deriva de un modelo de Qwen de Alibaba Cloud. CMSManhattan modifico la arquitectura y los pesos y realizo un fine-tuning posterior. La arquitectura concreta es un transformer con 132 capas, hidden size de 5.120, 40 cabezas de consulta y 8 cabezas de clave/valor con tamano de cabeza 128, y un vocabulario de 152.064 tokens. No se especifica en la informacion disponible si emplea atencion lineal, decodificacion especulativa u otras innovaciones de eficiencia.

El modelo esta disenado para responder de forma directa, sin una fase de razonamiento separada, lo que segun el autor lo convierte en el mas rapido de la linea JiRack 70B. No se detallan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card incluye mediciones de estabilidad numerica: en todas las 132 capas, los valores maximos de activacion se mantienen mas de 1.000 veces (Q8_0) y 170 veces (Q4_K_M) por debajo de los limites de float16 de llama.cpp, y no se observaron salidas NaN en las pruebas realizadas.

## Capacidades

- Generacion de texto conversacional con respuestas directas y breves, sin fase de razonamiento separada.
- Generacion de codigo: 87,2% de pass@1 en HumanEval (164 problemas) en Q4_K_M.
- Resolucion de problemas matematicos: 93,5% en GSM8K (1.319 problemas) en Q4_K_M.
- Tool calling o function calling, con soporte de llamadas simples y llamadas paralelas.
- Deteccion de ausencia de herramienta adecuada: el modelo no realiza llamada cuando ninguna herramienta encaja con la pregunta.
- Integracion con la API de chat de OpenAI a traves de llama-server, incluyendo tool calls.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponibles; el modelo es solo texto.

## Casos de uso

- Generacion de codigo en produccion: con 87,2% de pass@1 en HumanEval y soporte de tool calling, puede integrarse en pipelines de CI/CD para autocompletar funciones, generar tests o resolver incidencias acotadas, siempre con revision humana.
- Asistentes de resolucion de matematicas: el 93,5% en GSM8K lo hace adecuado para tutoria o verificacion de calculos en entornos educativos, con la cautela de que con decodificacion greedy puede repetirse en soluciones largas.
- Agentes con herramientas: las llamadas simples y paralelas permiten construir agentes que consulten APIs, bases de datos o servicios externos en un solo turno, reduciendo latencia frente a esquemas secuenciales.
- Automatizacion de atencion al cliente: su contexto de 16.384 tokens permite gestionar conversaciones multi-turno con historial extenso y responder de forma directa y breve.
- Despliegue en una sola GPU de 96 GB: la cuantizacion Q8_0 (76,7 GB) y el KV cache de aproximadamente 8,9 GB para 16.384 tokens permiten servir el modelo en una unica GPU de gama alta, simplificando la infraestructura.
- Procesamiento por lotes de tareas de codigo y matematicas: con 46/46 respuestas completas en las pruebas del autor sobre 46 prompts de codigo, matematicas y generales de hasta 4.096 tokens, es viable para pipelines batch de generacion.
- Prototipado local con Q4_K_M: los 43,6 GB del GGUF Q4_K_M permiten ejecucion en estaciones de trabajo con GPUs consumer de gran VRAM, facilitando pruebas sin infraestructura de datacenter.

## Benchmarks y rendimiento

Resultados reportados en la model card, medidos en GGUF Q4_K_M con llama.cpp, decodificacion greedy, 0-shot y limite de 8.192 tokens por respuesta:

| Benchmark | Resultado |
|---|---|
| GSM8K (1.319 problemas) | 93,5% |
| HumanEval pass@1 (164 problemas) | 87,2% |

Longitud media de respuesta: 545 tokens en GSM8K y 171 tokens en HumanEval.

Pruebas funcionales del autor con llama.cpp, decodificacion greedy y una GPU de 96 GB:

| Prueba | Q8_0 | Q4_K_M |
|---|---|---|
| 46 prompts (codigo, matematicas, general), hasta 4.096 tokens | 46/46 respuestas completas | 46/46 respuestas completas |
| Los mismos 46 prompts via API de chat | no ejecutado | 46/46 respuestas completas |
| Tool calling: una llamada y dos llamadas paralelas | correcto | correcto |
| Tool calling: ninguna herramienta encaja | no realiza llamada | no realiza llamada |
| Estabilidad numerica | sin salidas NaN | sin salidas NaN |

No se han publicado en la informacion disponible resultados de MMLU ni comparaciones directas con otros modelos.

## Requisitos de hardware

- VRAM estimada: Q8_0 requiere 76,7 GB solo para pesos; Q4_K_M requiere 43,6 GB. El KV cache anade 0,54 MB por token de contexto, aproximadamente 8,9 GB para 16.384 tokens.
- GPU recomendadas: una GPU de 96 GB (por ejemplo, A100 80 GB no es suficiente para Q8_0 con contexto completo; se indica una GPU de 96 GB como la H100 96 GB o similar) para Q8_0. Para Q4_K_M, una GPU de 48 GB o superior permite margen para el KV cache.
- Cabe en GPU consumer: Q4_K_M (43,6 GB) puede caber en GPUs consumer de gran VRAM, como RTX 4090 (24 GB) solo con cuantizaciones adicionales no documentadas o descarga parcial a CPU; no se confirma en la informacion disponible que quepa integramente en una RTX 4090.
- Opciones de despliegue: llama.cpp mediante llama-server, con soporte de la API de chat de OpenAI y tool calls. No se mencionan vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. El autor afirma que es el modelo mas rapido de la linea JiRack 70B por responder sin fase de razonamiento separada, pero no se aportan cifras de tokens por segundo.
- Parametros de muestreo recomendados: temperatura 0,6 y top-p 0,95 (almacenados en los ficheros GGUF).

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de benchmarks ni especificaciones de modelos comparables de la misma categoria (72B, tool calling, codigo y matematicas). La model card no incluye comparaciones con alternativas. Por tanto, la comparativa se marca como no disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| JiRack Precision 72B | 72,1B | 16.384 | jirack-proprietary | Hugging Face (5 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo puede cometer errores; el autor recomienda verificar sus salidas en pipelines automatizados.
- Cuando falta un argumento obligatorio de una herramienta, el modelo puede rellenar un valor de relleno en lugar de solicitarlo.
- Cuando ninguna herramienta encaja con la pregunta, el modelo puede indicarlo en lugar de responder directamente a la pregunta.
- Con decodificacion greedy, las soluciones matematicas largas pueden empezar a repetirse; los ajustes de muestreo recomendados (temperatura 0,6, top-p 0,95) reducen este problema.
- El modelo es solo texto; no procesa imagenes ni audio.
- No debe usarse para asesoramiento medico, legal o financiero.
- Licencia propietaria JiRack: el uso comercial esta sujeto a los terminos de la licencia, que no se detallan en la informacion disponible; es necesario revisar el fichero LICENSE del repositorio.
- El modelo deriva de un modelo DeepSeek (MIT) y de un modelo Qwen (Apache 2.0), pero la version modificada se distribuye bajo licencia propietaria, lo que puede condicionar su redistribucion.
- No se dispone de informacion sobre sesgos conocidos ni sobre cobertura idiomatica.
- El modelo tiene muy poca traccion en Hugging Face (5 descargas, 0 likes) y fue creado y actualizado en noviembre de 2026, por lo que la validacion externa es practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CMSManhattan/JiRackPrecision_72b
- Demo de chat (JiRack DeltaNet-180B): https://huggingface.co/spaces/CMSManhattan/JiRackDeltaNet-180B-demo
- Contacto del autor: grabko@cmsmanhattan.com
- Telefono: +1 (516) 777-0945
- Ubicacion: Nueva York, EE. UU.
