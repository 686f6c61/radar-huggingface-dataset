# r0b0tlab/GLM-5.3-Flash-EXL3-2.25bpw-sm121

## Resumen

GLM-5.3-Flash-EXL3-2.25bpw-sm121 es una cuantizacion EXL3 (ExLlamaV3 trellis) del modelo MoE zai-org/GLM-5.3-Flash, publicada por r0b0tlab. El modelo original es un Mixture of Experts de 320.000 millones de parametros totales con aproximadamente 18.000 millones activos por token; esta version empaqueta los pesos en formato EXL3 con una media de ~2,25 bits por peso (codebook `mul1`, tiles mixtos K3/K4, escalas de salida activadas y cabeza de 6 bits), reduciendo el artefacto a 98,5 GB repartidos en 31 shards de safetensors.

La ficha de Hugging Face reporta 49.171.779.678 parametros reales en los safetensors, un dato que no coincide con los 320B totales que declara la model card del autor; conviene tratar ambas cifras con cautela y verificar el manifiesto `quantization_config.json` antes de dimensionar el despliegue. El modelo esta pensado para servir en una unica DGX Spark (GB10, arquitectura SM121) con ExLlamaV3/TabbyAPI, y el autor documenta una prueba de recuperacion needle-in-a-haystack con 259.993 tokens reales de prompt sobre una ventana de 262.144 tokens, con KV en FP16 y batch 1.

Su relevancia actual radica en que demuestra que un MoE de gran tamano puede servirse con contexto de 256K en hardware de escritorio de gama alta para IA (GB10), combinando cuantizacion agresiva, decodificacion especulativa con un draft DFlash2 y un runtime nativo ARM64 CUDA 13. La licencia es MIT, lo que facilita el uso comercial, aunque las capacidades verificadas son limitadas: un solo flujo, TP=1 y sin validacion de concurrencia superior a 1 en el perfil de 256K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) transformer, formato EXL3 (ExLlamaV3 trellis) |
| Parametros totales | 320B segun model card; 49.171.779.678 en safetensors (dato no coincidente) |
| Parametros activos | ~18B (segun model card) |
| Longitud de contexto | 262.144 tokens verificados en ExLlamaV3; 32.768 tokens en perfil vLLM publicado |
| Tipos de cuantizacion | EXL3 ~2,25 bpw media, codebook `mul1`, tiles mixtos K3/K4, escalas de salida, cabeza de 6 bits |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (31 shards) + `quantization_config.json` + tokenizer |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture of Experts: 320B parametros totales y aproximadamente 18B activos por token, lo que permite un coste de computo por token muy inferior al de un denso equivalente. Esta version no reentrena ni modifica los pesos mas alla de la cuantizacion: r0b0tlab aplica cuantizacion EXL3 con calibracion sobre un corpus mixto y seleccion tap-K3, generando tiles mixtos K3/K4 con escalas de salida y una cabeza de 6 bits. El resultado son 98,5 GB (91,8 GiB) en 31 shards.

La innovacion practica del paquete es el ecosistema de serving: un runtime ExLlamaV3 + TabbyAPI nativo ARM64 CUDA 13 para GB10/SM121 y un draft de decodificacion especulativa DFlash2 (r0b0tlab/GLM-5.3-Flash-DFlash2-EXL3-3.00bpw) usado con K=5. El autor documenta ademas un perfil alternativo con vLLM v0.30.0rc1 mas plugin EXL3, limitado a 32.768 tokens. No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens vistos ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles y chino.
- Razonamiento y matematicas: el kit Q200v2 reporta GSM8K 98,75% y hard_reasoning 95,0% sobre el runtime ExLlamaV3.
- Generacion de codigo: HumanEval 97,5% en el mismo kit.
- Seguimiento de instrucciones: IFEval 77,5%.
- Tool calling / function calling: BFCL-hard20 con 6/20 aciertos en ExLlamaV3 y 10/20 en el perfil vLLM de 32K; el rendimiento en llamadas a herramientas es claramente inferior al resto de capacidades.
- Contexto largo: recuperacion exacta verificada con 259.993 tokens de prompt sobre 262.144 de ventana.
- Vision: verificada mediante una prueba de imagen Q&A; en DFlash2 las peticiones de imagen se redactan como texto.
- Decodificacion especulativa con draft DFlash2 (K=5) para acelerar la generacion.
- No se documentan capacidades de audio ni modo thinking explicito.

## Casos de uso

- Analisis de repositorios y documentacion extensa: con 262.144 tokens de contexto verificados, el modelo puede ingerir un arbol de codigo completo o un corpus de documentacion y responder preguntas de recuperacion exacta, como demuestra la prueba needle-in-a-haystack.
- Asistente de codigo en local sobre GB10: HumanEval 97,5% y soporte de tool calling permiten integrarlo en un flujo de edicion y ejecucion de pruebas en una estacion de trabajo unica, sin depender de la nube.
- Generacion de codigo en pipelines de CI/CD: el formato EXL3 y el runtime TabbyAPI ofrecen una API compatible con OpenAI para tareas de revision, generacion de tests y parcheo, siempre con concurrencia 1 validada.
- Atencion al cliente multilingue (en/zh): conversaciones multi-turno con contexto largo para historiales extensos, limitado a los dos idiomas soportados.
- Razonamiento matematico y verificacion de calculos: GSM8K 98,75% en el kit Q200v2 lo hace adecuado para tutoria o validacion de problemas paso a paso.
- Procesamiento de contratos o expedientes largos: la ventana de 256K permite resumir y extraer clausulas de documentos que superan ampliamente los 100K tokens en una sola pasada.
- Prototipado de agentes con decodificacion especulativa: el draft DFlash2 K=5 acelera la generacion en flujos de varios pasos, aunque la fiabilidad de tool calling (6/20 en BFCL-hard20) limita agentes que dependan intensivamente de funciones.

## Benchmarks y rendimiento

Resultados del kit Q200v2 sobre el runtime ExLlamaV3 (2026-09-27), ejecucion serial, effort=low, sin errores de transporte:

| Benchmark | Resultado |
|---|---|
| Text-180 (global) | 168/180 (93,33%) |
| GSM8K | 98,75% |
| HumanEval | 97,5% |
| IFEval | 77,5% |
| hard_reasoning | 95,0% |
| BFCL-hard20 | 6/20 |
| Full 200 | 174/200 (87,0%) |

En el perfil vLLM de 32.768 tokens (2026-09-21) el mismo kit arroja 170/180 en texto y 10/20 en BFCL; el autor advierte que los resultados de ambos motores son independientes y no transferibles.

Rendimiento de decodificacion en vLLM con DFlash2 K=5 sobre una GB10, un solo flujo: 50,2 tok/s en salida estructurada, 43,4 tok/s en codigo y 19,5 tok/s en prosa.

## Requisitos de hardware

- VRAM: el pack ocupa 98,5 GB (91,8 GiB) en disco; en inferencia necesita ademas KV cache. Con KV en FP16 y 262.144 tokens el autor exige un suelo de 6.144 MiB de memoria de host como guarda.
- GPU recomendadas: NVIDIA GB10 (DGX Spark, SM121) es el objetivo validado; no se documenta soporte para A100, H100 o RTX 4090.
- Consumer GPU: no cabe en GPU de consumo convencionales por el tamano del artefacto; el escenario previsto es una unica DGX Spark.
- Despliegue: ExLlamaV3 + TabbyAPI mediante imagen ARM64 `ghcr.io/r0b0tlab/glm53-flash-exl3-exllamav3-gb10:b25c467`; alternativa vLLM v0.30.0rc1 con plugin EXL3 para el perfil de 32K. No se menciona soporte de llama.cpp u Ollama.
- Latencia y throughput: 50,2 / 43,4 / 19,5 tok/s (estructurado / codigo / prosa) en vLLM single-stream con DFlash2 K=5; no se publica throughput a 256K ni con concurrencia mayor que 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / licencia | Disponibilidad |
|---|---|---|---|---|
| GLM-5.3-Flash-EXL3-2.25bpw-sm121 | 320B totales / ~18B activos (segun card) | 262.144 verificado (ExLlamaV3); 32.768 (vLLM) | EXL3, MIT | Hugging Face, 184 descargas |
| zai-org/GLM-5.3-Flash (base) | 320B totales / ~18B activos | no disponible | safetensors, MIT | Hugging Face |
| r0b0tlab/GLM-5.3-Flash-DFlash2-EXL3-3.00bpw | draft de decodificacion especulativa | no disponible | EXL3, licencia no indicada | Hugging Face |

No se dispone de datos de benchmarks del modelo base ni de otros modelos comparables en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Discrepancia de parametros: la model card declara 320B totales y ~18B activos, pero los safetensors suman 49.171.779.678 parametros; verificar el manifiesto antes de planificar recursos.
- Tool calling debil: 6/20 en BFCL-hard20 (ExLlamaV3) y 10/20 (vLLM), insuficiente para agentes que dependan intensivamente de funciones.
- Concurrencia no validada: el perfil de 256K solo se ha probado con batch 1 y TP=1; no se ha ejercitado C>=2 en tool calls ni la estabilidad en ejecuciones largas.
- Throughput a 256K no medido; las cifras de tok/s corresponden al perfil vLLM de 32K.
- Idiomas limitados a ingles y chino; no hay validacion en castellano.
- Vision verificada solo mediante una prueba de humo de Q&A; en DFlash2 las peticiones de imagen se redactan como texto.
- Riesgo de alucinacion no cuantificado; IFEval del 77,5% sugiere margen de mejora en seguimiento estricto de instrucciones.
- Sesgos: no se documentan evaluaciones de sesgo o toxicidad.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantias sobre los perfiles no cualificados (concurrencia, throughput a 256K, estabilidad prolongada).
- Dependencia de un runtime especifico (ExLlamaV3/TabbyAPI ARM64 o vLLM con plugin EXL3); los resultados no son transferibles entre motores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/r0b0tlab/GLM-5.3-Flash-EXL3-2.25bpw-sm121
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Draft DFlash2: https://huggingface.co/r0b0tlab/GLM-5.3-Flash-DFlash2-EXL3-3.00bpw
- Runtime ExLlamaV3/TabbyAPI GB10: https://github.com/r0b0tlab/glm53-flash-exl3-exllamav3-gb10
- Runtime vLLM SM121: https://github.com/r0b0tlab/glm53-flash-exl3-dflash2-sm121
- Imagen Docker ARM64: ghcr.io/r0b0tlab/glm53-flash-exl3-exllamav3-gb10:b25c467
- Evidencias Q200v2: `evidence/glm53-exl3-q200v2-20260927/` en el repositorio del runtime ExLlamaV3
