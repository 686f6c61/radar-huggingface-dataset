# Mia-AiLab/GLM-5.3-Flash-EXL3-4bpw-TensorFold

## Resumen

GLM-5.3-Flash-EXL3-4bpw-TensorFold es una cuantizacion del modelo base zai-org/GLM-5.3-Flash publicada por Mia-AiLab (Mia's AI Lab). Se trata de un derivado cuantizado en formato EXL3 a 4 bits por peso sobre los expertos enrutados (capas 3-44) y la capa MTP 45, mientras que atencion, KDA, expertos compartidos, capas densas, embeddings, cabeza de salida y torre de vision se mantienen en BF16 sin cambios respecto a zai-org/GLM-5.3-Flash-BF16. El checkpoint pesa 175,7 GB y declara 87.811.157.118 parametros.

El problema que resuelve es el de servir un modelo MoE de ~87,8B en hardware de gama de escritorio profesional: el formato EXL3 de expertos esta disenado para los kernels de TensorFold, que reparten los bloques entre 2, 3 o 4 unidades DGX Spark. Su receta de referencia sirve el modelo con TP=2, 4 streams, ventana de 1M tokens, cache KV en FP8 y borradores DFlash2, alcanzando 61,8 tok/s de decodificacion en prosa con una sola peticion y 1.824 tok/s de prefill sobre un prompt de 131k tokens.

Su relevancia es doble: por un lado, es una alternativa medida frente al quant TR3-4bpw mas extendido, con menor divergencia KL en los seis conjuntos evaluados (0,0903 frente a 0,0990 en wiki y 0,3150 frente a 0,3271 en el conjunto de carga de trabajo, tal y como se sirve); por otro, la calibracion MoE-aware propia no esta publicada, lo que limita su reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con atencion y KDA (segun el desglose del checkpoint); incluye torre de vision y capa MTP |
| Parametros totales | 87.811.157.118 (87,8B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1M tokens en la receta de servicio TensorFold (ventana de 1M; pool KV de 2.582.528 tokens) |
| Tipos de cuantizacion | EXL3 4 bits por peso (codebook mcg, escalas de salida) en expertos enrutados (capas 3-44) y expertos de la capa MTP 45; resto en BF16; capas densas cuantizables en carga con DENSE=q4, fp8 o bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (EXL3 para expertos enrutados, BF16 para el resto) |
| Modelo base | zai-org/GLM-5.3-Flash (referencia de evaluacion: release FP8, rev eb9eb208) |
| Tamano del repositorio | 175,7 GB |
| Tipo de pipeline | image-text-to-text |
| Fecha de publicacion | 2026-10-02 |
| Descargas / likes | 554 / 15 |

## Arquitectura y entrenamiento

El modelo no es un entrenamiento nuevo, sino una cuantizacion post-entrenamiento del checkpoint zai-org/GLM-5.3-Flash. El layout es deliberadamente mixto: los expertos enrutados de las capas 3-44 y los expertos de la capa MTP 45 se almacenan en EXL3 a 4 bits por peso (gate, up y down) con codebook mcg y escalas de salida; todo lo demas (atencion, KDA, expertos compartidos, capas densas, embeddings, cabeza y torre de vision) permanece en BF16. La razon es que TensorFold cuantiza las capas densas BF16 en el momento de la carga mediante el parametro DENSE (q4, fp8 o bf16) y sus kernels EXL3 de expertos esperan exactamente este formato, fragmentado en bloques completos entre 2, 3 o 4 Sparks.

La unica innovacion tecnica declarada es la calibracion: una calibracion propia para EXL3, consciente de la estructura MoE y ajustada a la carga de trabajo real (matematicas, codigo, tool calling y chat). La receta de calibracion no se publica. El modelo hereda la plantilla de chat de Z.ai (chat_template.jinja), que la implementacion de vision de TensorFold extiende. No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre fases de RLHF/DPO del modelo base, ya que la model card se centra exclusivamente en el proceso de cuantizacion.

## Capacidades

- Generacion de texto conversacional multi-turno, con contexto de hasta 1M tokens en la receta TensorFold (probado con aguja de 1M tokens, encontrada).
- Razonamiento matematico: 98,8% en GSM8K (250 problemas, greedy) con este quant.
- Generacion de codigo: 95,7% en HumanEval (164 problemas, greedy) y 469 de 542 problemas resueltos en HumanEval+/MBPP+ con thinking activado.
- Modo de razonamiento explicito (thinking on), usado en la evaluacion de EvalPlus.
- Tool calling / function calling: la model card verifica que las llamadas a herramientas funcionan y que los argumentos en forma de array se mantienen como arrays JSON.
- Capacidades multimodales de entrada: el pipeline declarado es image-text-to-text e incluye torre de vision en BF16.
- Generacion especulativa: soporta borradores DFlash2, con respuestas draft identicas a las seriales en 6 de 6 comprobaciones.
- Capacidades multilingues: no disponible (el campo de idiomas no esta informado en la ficha de HuggingFace).
- Capacidades de agente multi-paso: no documentadas de forma explicita mas alla del soporte de tool calling.

## Casos de uso

- Asistencia de codigo en editor o IDE: el modelo resuelve 469 de 542 problemas de HumanEval+/MBPP+ con thinking activado y respuestas mas cortas que el quant de referencia (mediana de 601 tokens en MBPP+ frente a 664), lo que reduce el coste de inferencia por sugerencia.
- Agentes con tool calling sobre APIs internas: la verificacion de que los argumentos en array se mantienen como arrays JSON permite integrarlo en orquestadores que envian payloads estructurados a servicios REST sin post-procesado adicional.
- Analisis de documentos largos con imagen: al combinar ventana de 1M tokens, pool KV de 2.582.528 tokens y torre de vision, es adecuado para extraer informacion de informes extensos con graficos o capturas incrustadas en una sola pasada.
- Razonamiento matematico asistido: con un 98,8% en GSM8K (250 problemas) puede emplearse en tutoria o validacion de calculos paso a paso, siempre con verificacion posterior dado que es un modelo cuantizado.
- Despliegue on-premise en laboratorio o PYME con 2 DGX Spark: 61,8 tok/s en prosa con una peticion y 103,2 tok/s con cuatro peticiones concurrentes hacen viable un servicio interno de chat y redaccion sin depender de APIs externas.
- Procesamiento por lotes de prefill masivo: 1.824 tok/s de prefill sobre prompts de 131k tokens permiten indexar o resumir corpus largos en pipelines nocturnos.
- Servicio de chat multi-conversacion: 92,7 tok/s con tres peticiones simultaneas en prosa ofrece margen para varios usuarios concurrentes en una sola pareja de Sparks.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como checkpoint de referencia para medir divergencia KL y tasas de error confiado frente a otros quants de 4 bits del mismo modelo base.

## Benchmarks y rendimiento

Resultados declarados por el autor. Comparativa con el quant brandonmusic-TR3-4bpw, medido sobre la misma build de TensorFold (v0.6.0, receta v1.3.2, TP=2, 4 streams, cache KV FP8, borradores DFlash2).

| Metrica | Este quant (EXL3 4bpw) | TR3-4bpw |
|---|---|---|
| KL divergencia al original, servido (wiki / workload) | 0,0903 / 0,3150 | 0,0990 / 0,3271 |
| Suelo teorico (expertos originales + densas q4) | 0,0676 / 0,3009 | no aplica |
| GSM8K (250, greedy) | 98,8% | 98,0% |
| HumanEval (164, greedy) | 95,7% | 97,6% |
| HumanEval+ / MBPP+ (542, thinking on) | 469 resueltos (86,5%) | 468 resueltos (86,3%) |
| Errores confiados en workload (original >90% seguro) | 1,06% | no disponible |
| Decode prosa, 1 / 2 / 3 / 4 peticiones (tok/s, 2x DGX Spark) | 61,8 / 79,7 / 92,7 / 103,2 | 61,5 / 74,6 / 90,1 / 105,5 |
| Decode codigo, 1 / 2 / 3 / 4 peticiones (tok/s) | 78,6 / 106,1 / 117,8 / 128,3 | 79,9 / 107,4 / 118,5 / 124,0 |
| Prefill, prompt de 131k tokens (tok/s) | 1.824 | 1.819 |
| Tamano | 175,7 GB | 175,7 GB |

Notas de rigor declaradas por el autor: las diferencias en GSM8K (+2 problemas) y HumanEval (-3 problemas) no son estadisticamente significativas (p = 0,5 y p = 0,45 en test exacto apareado; p = 1,0 en HumanEval+/MBPP+). La mejora medida es la de divergencia KL: siete de ocho intervalos de confianza al 95% quedan por debajo de cero y el unico conjunto donde la ganancia esta dentro del ruido es chat. Las cifras de decode son medias de dos arranques de servidor intercalados (sparkDash, 512 tokens). El prefill entre 8k y 262k tokens se mantiene identico al TR3 dentro del 1%.

## Requisitos de hardware

- Pesos: 175,7 GB en disco y en memoria para el checkpoint completo (EXL3 en expertos, BF16 en el resto).
- Hardware de referencia: 2 unidades DGX Spark en paralelo (TP=2), 4 streams. El repositorio de la receta contempla configuraciones de 2, 3 o 4 Sparks, ya que los bloques EXL3 se fragmentan en bloques completos.
- Memoria total agregada necesaria: al menos 175,7 GB unicamente para pesos, mas cache KV en FP8 con un pool declarado de 2.582.528 tokens y espacio para borradores DFlash2.
- GPU consumer: no cabe en tarjetas de 24 o 48 GB. La informacion disponible no documenta ninguna configuracion de una sola GPU consumer.
- GPU de centro de datos: no se documenta despliegue probado en A100, H100 u otras; la unica configuracion servida y medida es 2x DGX Spark.
- Opciones de despliegue: TensorFold v0.6.0 con la receta de Mia's AI Lab (TP=2, 4 streams, 1M-token window, FP8 KV cache, DFlash2). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible; los kernels EXL3 de expertos son especificos de TensorFold.
- Throughput medido: 61,8 tok/s en prosa con una peticion y 103,2 tok/s con cuatro; 128,3 tok/s en codigo con cuatro peticiones.
- Prefill medido: 1.824 tok/s con prompt de 131k tokens; entre 8k y 262k tokens el rendimiento es identico al del quant TR3 dentro del 1%.
- Parametro DENSE configurable en carga: q4, fp8 o bf16, con impacto directo en memoria y fidelidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mia-AiLab/GLM-5.3-Flash-EXL3-4bpw-TensorFold | 87,8B (MoE), 4 bits en expertos | 1M tokens en la receta TensorFold | KL 0,0903 / 0,3150; GSM8K 98,8%; HumanEval 95,7% | apache-2.0 | HuggingFace, 175,7 GB, 554 descargas |
| brandonmusic-TR3-4bpw | mismo modelo base, 4 bpw | mismo entorno de servicio | KL 0,0990 / 0,3271; GSM8K 98,0%; HumanEval 97,6% | no disponible | no disponible en la informacion proporcionada |
| zai-org/GLM-5.3-Flash (BF16 / FP8) | 87,8B (MoE) | 1M tokens en la receta de servicio | Referencia sin cuantizar (release FP8, rev eb9eb208) | apache-2.0 | HuggingFace (zai-org/GLM-5.3-Flash y GLM-5.3-Flash-BF16) |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Es una cuantizacion a 4 bits: la divergencia KL al modelo original no es cero (0,0903 en wiki y 0,3150 en workload tal y como se sirve). Parte del error restante proviene de las capas densas a 4 bits de TensorFold y ningun quant de expertos puede eliminarlo (suelo de 0,0676 en wiki y 0,3009 en workload).
- Las mejoras en benchmarks de codigo y matematicas frente al quant TR3 no son estadisticamente significativas (p = 0,45 en HumanEval, p = 0,5 en GSM8K, p = 1,0 en HumanEval+/MBPP+). No deben presentarse como una mejora de capacidad.
- La receta de calibracion MoE-aware no esta publicada, por lo que la mejora en fidelidad no es reproducible de forma independiente.
- Requiere TensorFold y su formato EXL3 de expertos; no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni con pipelines de cuantizacion estandar. El acoplamiento al runtime limita la portabilidad.
- Sesgos conocidos: no disponible. La model card no incluye analisis de sesgo ni evaluacion de toxicidad.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Como cualquier modelo de lenguaje, puede generar contenido incorrecto con apariencia de veracidad; la cuantizacion no lo mitiga.
- Idiomas soportados: no disponible. No se puede confirmar cobertura multilingue ni calidad por idioma.
- Limitaciones de contexto: aunque la ventana declarada es de 1M tokens, el autor no publica resultados de calidad mas alla de la prueba de aguja de 1M tokens, y el coste de prefill crece con la longitud del prompt.
- Licencia apache-2.0 sobre el artefacto cuantizado; conviene verificar los terminos aplicables al modelo base zai-org/GLM-5.3-Flash antes de un uso comercial.
- Uso en produccion: el pool KV de 2.582.528 tokens es fijo en la configuracion medida, lo que condiciona el numero de conversaciones concurrentes segun la longitud de cada una.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mia-AiLab/GLM-5.3-Flash-EXL3-4bpw-TensorFold
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Modelo base en BF16: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Runtime TensorFold: https://github.com/ashhart/TensorFold
- Receta de servicio para 2x DGX Spark: https://github.com/MiaAI-Lab/GLM-5.3-Flash-EXL3-2x-DGX-Sparks-TensorFold
- Pagina del modelo en Mia's AI Lab: https://mia-ai.net/models/GLM-5.3-Flash-EXL3-2x-DGX-Sparks-TensorFold
- Recursos graficos de la model card: https://huggingface.co/datasets/Mia-AiLab/model-card-assets

Los restantes resultados de la busqueda web no guardan relacion con este modelo (articulos sobre la rapera M.I.A., la plataforma de citas medicas Maiia y una tienda de joyeria).
