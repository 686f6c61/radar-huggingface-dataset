# 1bit-MONSTER/Qwen3-30B-A3B-GGUF

## Resumen

1bit-MONSTER/Qwen3-30B-A3B-GGUF es un re-hosting en formato GGUF del modelo Qwen3-30B-A3B de Alibaba Qwen, cuantizado en Q4_K_M y publicado por el proyecto 1bit-MONSTER junto con medidas de rendimiento para su propio motor de inferencia sobre hardware Strix Halo. No es un modelo nuevo ni un fine-tuning: es la misma red MoE de 30,5 mil millones de parametros totales con aproximadamente 3 mil millones de parametros activos por token, redistribuida en un unico fichero GGUF listo para ejecutarse en el motor `1bit`.

El interes practico del repositorio esta en dos puntos. Primero, la cuantizacion Q4_K_M reduce el peso del modelo a unos 18,6 GB, lo que permite desplegar un MoE de 30B en GPUs de consumo con 24 GB de VRAM o en sistemas de memoria unificada. Segundo, el autor publica cifras medidas en lugar de estimaciones: 1230 tok/s de procesamiento de prompt (pp512) y 76,7 tok/s de generacion (tg128) sobre Strix Halo con el backend Vulkan, lo que da una referencia concreta para dimensionar despliegues en APUs de AMD.

El modelo hereda del Qwen3-30B-A3B base la licencia Apache 2.0 y las capacidades de la familia (razonamiento, codigo, soporte multilingue y tool calling). Este repositorio concreto no aporta datos propios de evaluacion de precision ni detalla idiomas o contexto; para eso hay que remitirse a la documentacion del modelo base de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); modelo base Qwen3-30B-A3B |
| Parametros totales | 30.532.122.624 (~30,5 mil millones) |
| Parametros activos | ~3 mil millones por token (segun la model card del autor) |
| Longitud de contexto | No disponible en este repositorio; el modelo base Qwen3-30B-A3B declara 32.768 tokens nativos, extendibles a 131.072 con YaRN |
| Tipos de cuantizacion | GGUF Q4_K_M (unica incluida en este repositorio) |
| Idiomas soportados | No detallados en este repositorio; el modelo base Qwen3 es multilingue (familia documentada con cobertura de 119 idiomas y dialectos) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Qwen3-30B-A3B-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es una red transformer con capas de mezcla de expertos (MoE). El modelo base Qwen3-30B-A3B activa un subconjunto reducido de expertos por token, de modo que el coste computacional por token se aproxima al de un modelo denso de unos 3B de parametros, mientras que la capacidad total almacenada en memoria corresponde a 30,5B. Esta asimetria entre parametros totales y activos es la razon por la que el modelo resulta atractivo para despliegue en hardware con ancho de banda de memoria limitado: la generacion es rapida en terminos relativos, aunque el modelo completo debe residir en memoria.

El autor no aporta en este repositorio informacion sobre el corpus de entrenamiento, el numero de tokens vistos, la composicion del dataset ni si hubo fases de RLHF o DPO. Esos datos corresponden al modelo base y no se reproducen aqui. La unica innovacion atribuible a este repositorio es la propia cuantizacion Q4_K_M y la integracion con el motor `1bit`, que permite ejecutar el modelo sobre Vulkan en APUs de la plataforma Strix Halo.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, coherente con la etiqueta `conversational` del repositorio.
- Razonamiento en modo "thinking": el modelo base Qwen3 incorpora modos de pensamiento explicito y no pensamiento; no se detalla en este repositorio si dichos modos estan preservados en la cuantizacion, aunque Q4_K_M suele mantenerlos.
- Generacion de codigo y asistencia de programacion, heredada de la familia Qwen3.
- Matematicas y tareas de razonamiento logico, capacidades asociadas al modelo base.
- Soporte de tool calling y function calling, segun las capacidades declaradas del modelo base Qwen3.
- Soporte para flujos de agente y razonamiento multi-paso, dependiente del modelo base.
- Capacidades multilingues, segun la documentacion del modelo base (no confirmadas explicitamente en este repositorio).
- No disponible: no se declaran capacidades de vision ni de audio en este repositorio.

## Casos de uso

- Asistencia conversacional multi-turno: el modelo puede mantener dialogos extensos aprovechando la ventana de contexto del modelo base y su naturaleza MoE, que reduce el coste por token durante la generacion.
- Despliegue en estaciones de trabajo con GPU unica de 24 GB: gracias a la cuantizacion Q4_K_M que ocupa unos 18,6 GB, es viable ejecutar el modelo localmente en una RTX 4090 o similar para prototipado y uso interactivo.
- Inferencia en APUs Strix Halo: el caso de uso documentado por el propio autor; el modelo se ejecuta sobre el backend Vulkan del motor `1bit` con memoria unificada, util para equipos sin GPU dedicada.
- Generacion de codigo en entornos locales: al soportar tool calling segun el modelo base, puede integrarse en asistentes de IDE o pipelines de revision de codigo que requieran ejecucion local por privacidad.
- Agentes automatizados y razonamiento multi-paso: el modelo puede encadenar llamadas a herramientas en flujos de automatizacion, siempre que se gestione correctamente el contexto y el estado.
- Procesamiento de lotes con prompts largos: la fase de prefill medida (1230 tok/s en pp512 sobre Strix Halo) permite ingerir documentos extensos en pipelines de resumen o extraccion.
- Base para fine-tuning o adaptacion posterior: al estar en formato GGUF, sirve como punto de partida para flujos de cuantizacion adicional (Q5, Q8) o para conversion a otros backends.
- Sustitucion de modelos densos de 30B en produccion: la relacion rendimiento/memoria del MoE puede ofrecer mejor throughput que un denso equivalente en el mismo hardware, aunque requiere validacion de calidad especifica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible de este repositorio. El unico dato de rendimiento proporcionado es una medicion de throughput realizada por el autor:

| Metrica | Valor | Entorno |
|---|---|---|
| pp512 (procesamiento de prompt, 512 tokens) | 1230 tok/s | Strix Halo, backend Vulkan, motor 1bit |
| tg128 (generacion, 128 tokens) | 76,7 tok/s | Strix Halo, backend Vulkan, motor 1bit |

Estas cifras son especificas del hardware y del motor indicados y no deben extrapolarse directamente a otras GPU, backends o cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia con Q4_K_M: en torno a 18-20 GB, correspondiente al tamano del fichero (el repositorio ocupa 18,6 GB) mas el cache KV, que crece con la longitud de contexto.
- VRAM estimada para pesos en precision completa (BF16): aproximadamente 61 GB para los 30,5B parametros, mas cache KV; requiere GPU de 80 GB o multiples GPU.
- GPU recomendadas: A100 80 GB o H100 para precision completa; RTX 4090 (24 GB) para Q4_K_M en configuracion de contexto moderado.
- Cabe en GPU de consumo: si, con Q4_K_M cabe en tarjetas de 24 GB (RTX 4090, RTX 3090) y de forma mas holgada en tarjetas de 32 GB (RTX 5090).
- Memoria unificada: configurado y medido por el autor sobre Strix Halo (APU de AMD con memoria unificada), que permite alojar el modelo sin VRAM dedicada.
- Opciones de despliegue: motor `1bit` via Vulkan, llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El soporte de vLLM para GGUF es limitado, por lo que para servir a gran escala convendria usar los pesos sin cuantizar o un formato como AWQ/GPTQ del modelo base.
- Latencia y throughput: 76,7 tok/s de generacion y 1230 tok/s de prefill en Strix Halo con Vulkan, segun la medicion del autor.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| 1bit-MONSTER/Qwen3-30B-A3B-GGUF (este) | 30,5B | ~3B | No disponible en este repositorio | Apache 2.0 | GGUF Q4_K_M |
| Qwen/Qwen3-30B-A3B (base) | 30,5B | ~3B | 32.768 tokens, extensible a 131.072 con YaRN | Apache 2.0 | safetensors, GGUF, AWQ, etc. |
| Qwen/Qwen3-32B (denso) | 32,8B | 32,8B (denso) | 131.072 tokens | Apache 2.0 | safetensors, GGUF |
| Mixtral 8x7B | 46,7B | ~12,9B | 32.768 tokens | Apache 2.0 | safetensors, GGUF |
| DeepSeek-V2-Lite | 15,7B | ~2,4B | 32.768 tokens | MIT | safetensors |

Las cifras de contexto y arquitectura de los modelos comparados corresponden a su documentacion publica. No se dispone de datos de benchmarks comparativos en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad de formato.

## Limitaciones y advertencias

- No se han publicado datos de evaluacion de calidad para esta cuantizacion concreta; Q4_K_M puede introducir una perdida de precision respecto a los pesos originales que debe validarse en cada caso de uso.
- La cuantizacion Q4_K_M esta pensada para minimizar memoria y no necesariamente para preservar al maximo las capacidades de razonamiento del modelo base.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan aqui medidas especificas de mitigacion.
- El repositorio no detalla idiomas soportados ni longitud de contexto, por lo que esas capacidades deben verificarse contra la documentacion del modelo base Qwen3-30B-A3B.
- Este repositorio es un re-hosting (0 descargas, 0 likes en el momento de la ficha) y no esta afiliado a Qwen; conviene verificar la integridad del fichero GGUF antes de usarlo en produccion.
- Aunque la licencia es Apache 2.0 y permite uso comercial, dicha licencia se hereda del modelo base y el usuario debe respetar los terminos de Qwen al redistribuir el modelo.
- Las cifras de rendimiento publicadas son especificas de Strix Halo con el backend Vulkan del motor 1bit y no son extrapolables a otras configuraciones.
- La fecha de creacion del repositorio indicada (2026-09-26) resulta anomala y no debe tomarse como referencia fiable de antiguedad del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/1bit-MONSTER/Qwen3-30B-A3B-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-30B-A3B
- GGUF oficial de Qwen (referencia de cuantizacion): https://huggingface.co/Qwen/Qwen3-30B-A3B-GGUF
- Motor de inferencia 1bit: https://github.com/1bit-MONSTER/engine
