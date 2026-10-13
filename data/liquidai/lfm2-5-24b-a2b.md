# LiquidAI/LFM2.5-24B-A2B

## Resumen

LFM2.5-24B-A2B es un modelo de razonamiento de tipo Mixture of Experts (MoE) desarrollado por Liquid AI, con 24.000 millones de parametros totales y solo 2.450 millones de parametros activos por token. Es el modelo mas grande y el ultimo de la familia LFM2.5, que abarca desde LFM2.5-230M hasta esta variante de 24B, y esta disenado especificamente para ejecutar agentes rapidos y privados en dispositivo (on-device), no solo en servidores.

El modelo resuelve el problema de desplegar razonamiento de calidad en hardware limitado: al activar unicamente 2.450 millones de parametros por token, cada token de razonamiento es computacionalmente barato, lo que permite velocidades de hasta 184 tok/s en un Apple M5 Max y hasta 21K tokens de salida por segundo en una sola GPU NVIDIA B300. Su ventana de contexto es de 131.072 tokens y soporta 16 idiomas, entre ellos el espanol.

Es relevante ahora porque combina razonamiento explicito (siempre genera un bloque de pensamiento antes de responder) con capacidades de uso de herramientas y agentes, y lo hace con un presupuesto de entrenamiento de 36 billones de tokens. Segun el autor, compite con Qwen3.6-35B-A3B en tareas agénticas pese a tener alrededor de un 50 por ciento menos de parametros totales y activos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida (lfm2_moe): 30 bloques de convolucion corta de doble puerta + 10 bloques GQA |
| Parametros totales | 23.971.585.280 (24,0B) |
| Parametros activos | 2,45B |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | FP8 (block-wise), GGUF (llama.cpp), MLX 4-bit, ONNX; checkpoint nativo |
| Idiomas soportados | Ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, thai, indonesio, hindi, ruso, polaco |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | safetensors (transformers); variantes FP8, GGUF, ONNX y MLX |
| Numero de capas | 40 (30 de convolucion corta + 10 GQA) |
| Expertos | 64 por bloque MoE, enrutamiento top-4 |
| Tamano de vocabulario | 128.000 |
| Presupuesto de entrenamiento | 36 billones de tokens |
| Parametros de generacion | temperature 0,1; top_k 50; repetition_penalty 1,05 |

## Arquitectura y entrenamiento

La arquitectura es una MoE hibrida identificada como `lfm2_moe`. Combina 30 bloques de convolucion corta de doble puerta (double-gated short convolution) con 10 bloques de atencion de consultas agrupadas (GQA), sumando 40 capas. Cada bloque MoE contiene 64 expertos con enrutamiento top-4, de modo que en cada paso solo se activan 2.450 millones de parametros de los 24.000 millones totales. Esta combinacion de convoluciones cortas y atencion busca reducir el coste por token manteniendo la capacidad de modelado de secuencias largas.

El modelo fue entrenado con un presupuesto de 36 billones de tokens. La version publicada aqui es la post-entrenada para cargas de trabajo agénticas, derivada del modelo base `LiquidAI/LFM2.5-24B-A2B-Base`. Se trata de un modelo puro de razonamiento: segun el autor, siempre piensa antes de responder e inserta la etiqueta `<think>` directamente en la plantilla de chat. Utiliza un formato tipo ChatML y una plantilla de chat basada en `tokenizer.apply_chat_template()`. El autor menciona un modelo draft DSpark para decodificacion especulativa con SGLang, anunciado como proximo. No se detalla en la informacion disponible la composicion exacta del dataset ni si se emplearon tecnicas concretas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento explicito: el modelo siempre genera un bloque `<think>` antes de la respuesta final.
- Uso de herramientas y function calling: el autor lo posiciona como mejor en su clase en tareas agénticas y de uso de herramientas.
- Soporte para agentes y razonamiento multi-paso.
- Capacidades multilingues en 16 idiomas, incluidos espanol, portugues, frances, aleman, italiano, chino, japones, coreano, arabe, hindi, ruso, polaco, vietnamita, thai e indonesio.
- Ejecucion en dispositivo (edge) gracias a su bajo numero de parametros activos.
- Modelo exclusivamente de texto: no se declaran capacidades de vision ni de audio.
- Soporte de decodificacion especulativa mediante el modelo draft DSpark (anunciado, no disponible aun).

## Casos de uso

- Agentes locales en portatil o estacion de trabajo: al activar solo 2,45B de parametros, el modelo puede ejecutarse en un Mac con Apple Silicon (MLX 4-bit) y razonar en local sin enviar datos a la nube, util para entornos con requisitos de privacidad.
- Automatizacion de atencion al cliente: gestiona conversaciones multi-turno con hasta 131.072 tokens de contexto, lo que permite mantener historiales largos de interaccion y documentacion de soporte en la misma ventana.
- Pipelines de generacion de codigo: con soporte de tool calling puede integrarse en flujos que invocan linters, compiladores o APIs de repositorios para tareas de asistencia de programacion.
- Razonamiento paso a paso en analisis de datos: el bloque de pensamiento explicito ayuda en tareas de descomposicion de problemas y verificacion de resultados antes de emitir una conclusion.
- Orquestacion de agentes con recuperacion (RAG): el autor recomienda emparejarlo con recuperacion o busqueda web para tareas con alta carga de conocimiento, aprovechando su fortaleza en invocacion de herramientas.
- Asistentes multilingues para mercados hispanohablantes y europeos: cubre espanol, portugues, frances, aleman e italiano, adecuado para productos con usuarios en varias regiones.
- Procesamiento de documentos largos en el borde: con contexto de 131.072 tokens puede resumir o extraer informacion de contratos, informes o transcripciones en hardware local.
- Despliegue de alto rendimiento en servidor: con la variante FP8 y vLLM o SGLang puede servir cargas concurrentes en GPU de centro de datos.

## Benchmarks y rendimiento

Los unicos datos de benchmark publicados en la informacion disponible corresponden a la tarea agéntica LiveClaw, donde el modelo se compara con Qwen3.6-35B-A3B:

| Benchmark | LFM2.5-24B-A2B | Qwen3.6-35B-A3B |
|---|---|---|
| LiveClaw | 48,09 | 38,19 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

Datos de rendimiento declarados por el autor:
- Hasta 1,7 veces mas rapido que MoE comparables en dispositivo.
- 184 tok/s en un Apple M5 Max.
- Hasta 21.000 tokens de salida por segundo en una sola GPU NVIDIA B300.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir del numero de parametros; no confirmada por el autor):
  - BF16/FP16: aproximadamente 48 GB de pesos.
  - FP8: aproximadamente 24 GB.
  - Cuantizacion 4-bit (MLX/GGUF Q4): aproximadamente 12-14 GB.
- GPU de centro de datos: el autor cita rendimiento en NVIDIA B300; por tamano, GPU como A100 80 GB, H100 80 GB o B200 son adecuadas para servir el modelo en FP8 o BF16.
- GPU de consumo: en cuantizacion 4-bit el modelo puede caber en tarjetas con 16 GB o mas de VRAM, como RTX 4090 o RTX 5090; el espacio de pesos es menor que el de un modelo denso de 24B gracias a los 2,45B parametros activos, aunque la memoria esta dominada por los pesos totales.
- Apple Silicon: existe una variante MLX 4-bit optimizada para Mac; el autor reporta 184 tok/s en un Apple M5 Max.
- Opciones de despliegue: Transformers, vLLM, SGLang, llama.cpp (via GGUF), ONNX Runtime y MLX.
- Latencia y throughput: el autor reporta hasta 21K tok/s de salida en B300 y 184 tok/s en Apple M5 Max; no se detallan latencias por consulta ni throughput para otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | LiveClaw | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LFM2.5-24B-A2B | 24,0B | 2,45B | 131.072 | 48,09 | lfm1.0 | HuggingFace (safetensors, FP8, GGUF, ONNX, MLX) |
| Qwen3.6-35B-A3B | aproximadamente 35B | aproximadamente 3B | no disponible | 38,19 | no disponible | no disponible |
| LFM2.5-230M | 230M | no aplica (denso) | no disponible | no disponible | lfm1.0 | HuggingFace |

Los datos de Qwen3.6-35B-A3B provienen de la comparacion ofrecida por el propio autor del modelo. No se dispone de informacion suficiente para comparar con otras alternativas de la misma categoria.

## Limitaciones y advertencias

- El autor desaconseja su uso para tareas con alta carga de conocimiento sin apoyo externo: recomienda combinarlo con recuperacion o busqueda web, lo que implica un riesgo de alucinacion mayor si se usa de forma aislada.
- Es un modelo puro de razonamiento que siempre genera un bloque de pensamiento, lo que incrementa el numero de tokens de salida y puede aumentar la latencia percibida frente a modelos que no razonan.
- Solo procesa texto: no hay soporte declarado de vision ni de audio.
- La licencia es `lfm1.0` (etiquetada como `license: other`), por lo que las condiciones exactas de uso comercial deben consultarse en el archivo LICENSE del repositorio antes de un despliegue en produccion.
- No se detallan en la informacion disponible los sesgos conocidos, la composicion del dataset de entrenamiento ni posibles limitaciones por idioma mas alla de la lista de idiomas soportados.
- La variante DSpark para decodificacion especulativa esta anunciada pero no disponible, por lo que las mejoras de velocidad asociadas no pueden aprovecharse todavia.
- No se han publicado en la informacion disponible resultados en benchmarks estandar de conocimiento o codigo, lo que dificulta la comparacion objetiva con alternativas en esas areas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-Base
- Variante FP8: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-FP8
- Variante GGUF: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-GGUF
- Variante ONNX: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-ONNX
- Variante MLX 4-bit: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-MLX-4bit
- Modelo LFM2.5-230M: https://huggingface.co/LiquidAI/LFM2.5-230M
- Blog del modelo: https://www.liquid.ai/blog/lfm2-5-24b-a2b
- Documentacion: https://docs.liquid.ai/lfm/getting-started/welcome
- Documentacion de la plantilla de chat: https://docs.liquid.ai/lfm/key-concepts/chat-template
- Playground: https://playground.liquid.ai/
- Discord: https://discord.com/invite/liquid-ai
- Paper (referencia arXiv): arxiv:2511.23404
