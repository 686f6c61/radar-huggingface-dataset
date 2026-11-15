# Kaleto/Qwen3.6-35B-A3B-NVFP4

## Resumen

Kaleto/Qwen3.6-35B-A3B-NVFP4 es una cuantizacion NVFP4 (4 bits en punto flotante, `group_size=16`) del modelo multimodal Qwen/Qwen3.6-35B-A3B, publicada por el usuario independiente Kaleto. El objetivo es reducir el peso del modelo de 67 GB en BF16 a 25,4 GB manteniendo una fidelidad alta respecto al original, de modo que pueda servirse en hardware modesto como un DGX Spark (GB10) con 128 GB de memoria unificada. La cuantizacion se declara como `W4A16_NVFP4`: solo los expertos del bloque MoE se almacenan en 4 bits, mientras que vLLM mantiene las activaciones en BF16.

El modelo base es un transformer hibrido con arquitectura `Qwen3_5MoeForConditionalGeneration`: 40 capas organizadas en 10 grupos de (3 × Gated DeltaNet + 1 × Gated Attention), cada uno seguido de un bloque MoE con 256 expertos (8 enrutados + 1 compartido), hidden de 2048, contexto de 262.144 tokens, torre de vision y una capa MTP (multi-token prediction) para decodificacion especulativa. Los pesos cuantizados ocupan 25,5 GB repartidos en 5 shards.

La relevancia de esta ficha es doble: por un lado, demuestra un pipeline reproducible de cuantizacion NVFP4 sobre un modelo MoE grande (herramienta `distrib-nvfp4`, conversion en 44 minutos en un solo DGX Spark); por otro, reporta metricas de divergencia (KLD top-50) frente al BF16 que superan a la release oficial de NVIDIA en el mismo formato, con 0,0758 de KLD medio frente a 0,0998.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5MoeForConditionalGeneration` (transformer hibrido: Gated DeltaNet + Gated Attention + MoE) |
| Parametros totales | 35.951.822.704 (≈35,95 B) |
| Parametros activos | 8 expertos enrutados + 1 compartido por token (sobre 256 expertos totales); numero exacto de parametros activos no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (W4A16, `group_size=16`, `quant_algo: W4A16_NVFP4`) via nvidia-modelopt 0.43.0; pesos en BF16 para atencion, Gated DeltaNet, router, embeddings, `lm_head`, normas, torre de vision y cabeza MTP |
| Idiomas soportados | No disponible en la informacion proporcionada (probado cualitativamente en ingles y aleman) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (5 shards, 25,4 GB) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura hibrida poco habitual: 40 capas agrupadas en 10 bloques de tres capas Gated DeltaNet (atencion lineal con estado recurrente) seguidas de una capa de Gated Attention clasica. Cada bloque va seguido de una capa MoE con 256 expertos, de los cuales 8 se enrutan por token mas 1 experto compartido, con hidden de 2048. Incluye ademas una torre de vision (333 tensores) para entrada image-text-to-text y una capa MTP (19 tensores) que permite decodificacion especulativa nativa. Solo 10 de las 40 capas (mas la MTP) llevan cache KV, lo que reduce drasticamente el consumo de memoria en inferencia.

Sobre el entrenamiento del modelo base no se aporta informacion en la model card (numero de tokens, composicion del dataset, si hubo RLHF/DPO). La ficha del cuantizador solo documenta el proceso de cuantizacion: se ejecuto en una sola pasada sobre un DGX Spark con la herramienta de codigo abierto `distrib-nvfp4` en modo secuencial, con calibracion de 128 secuencias de 1024 tokens del dataset `abisee/cnn_dailymail` (usada unicamente para el `input_scale`). Se cuantizaron 30.840 capas lineales (256 expertos × `{gate,up,down}_proj` + `shared_expert.{gate,up,down}_proj` por capa). La innovacion tecnica destacable es la decision de mantener en BF16 todo lo que no son expertos MoE, incluida la cabeza MTP, lo que permite usar decodificacion especulativa con aceptacion del 84 % a k=1.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y aleman (probado cualitativamente).
- Razonamiento con modo "thinking" (desactivable; las pruebas de coherencia se hicieron con thinking off).
- Vision: pipeline `image-text-to-text` con torre de vision intacta en BF16 (aunque no se re-testeo tras la cuantizacion).
- Generacion de codigo (Python verificado funcional segun la model card).
- Aritmetica basica correcta segun las pruebas del autor.
- Tool calling / function calling: soportado via `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder` en vLLM.
- Razonamiento multi-paso y agentes: compatible con `--reasoning-parser qwen3`.
- Decodificacion especulativa MTP: aceptacion del 84 % a k=1, con longitud media de aceptacion 1,84.
- Roleplay y respuestas en personaje (probado en dos conjuntos privados).
- Capacidades multilingues: no documentadas formalmente; solo se verifico EN y DE.

## Casos de uso

- Despliegue en estacion de trabajo con DGX Spark (GB10): el modelo cabe en 23,8 GiB de memoria, dejando 620.625 tokens de cache KV con `--gpu-memory-utilization 0.5`, lo que permite servir conversaciones largas en hardware de escritorio profesional.
- Asistente de codigo en produccion: con tool calling nativo y parser `qwen3_coder`, se puede integrar en pipelines de CI/CD para generacion y revision de parches, con 58 tok/s en decodificacion de un solo stream gracias a MTP.
- Atencion al cliente multi-turno: el contexto de 262.144 tokens permite mantener historiales largos de conversacion sin truncar, y el throughput agregado de 171,5 tok/s con 4 streams MTP k=1 cubre cargas de varios usuarios concurrentes.
- Procesamiento de documentos con imagenes: al conservar la torre de vision en BF16, el modelo puede hacer OCR, extraccion de tablas y respuesta a preguntas sobre capturas o PDFs escaneados, aunque el autor no revalido la calidad de vision tras la cuantizacion.
- Analisis de codigo y resumen tecnico: los bajos valores de KLD en el bucket "code" (0,029) indican que la cuantizacion preserva bien la distribucion de tokens en dominios de programacion, lo que lo hace apto para tareas de refactorizacion y explicacion de codigo.
- Investigacion en cuantizacion: sirve como referencia reproducible para comparar estrategias W4A16 frente a W4A4 (KLD 0,0758 frente a 0,1103) y para validar pipelines NVFP4 sobre arquitecturas MoE hibridas.
- Roleplay y generacion creativa: el autor reporto respuestas coherentes en personaje, aunque el bucket roleplay B muestra el KLD mas alto (0,229), por lo que conviene validar en el dominio concreto antes de produccion.
- Razonamiento agentico con herramientas: la combinacion de MTP, tool calling y contexto largo lo hace adecuado para agentes que encadenan varias llamadas a APIs dentro de una misma sesion.

## Benchmarks y rendimiento

Divergencia KLD top-50 respecto al modelo BF16, medida en vLLM 0.31.0 sobre un GB10, con 72 secuencias retenidas y 276.638 posiciones de token:

| Variante | mean | median | p90 | p99 |
|---|---:|---:|---:|---:|
| Este repo (W4A16) | 0,0758 | 0,0065 | 0,096 | 1,17 |
| nvidia/Qwen3.6-35B-A3B-NVFP4 | 0,0998 | 0,0124 | 0,145 | 1,53 |
| Mismos pesos como W4A4 | 0,1103 | 0,0122 | 0,171 | 1,83 |

KLD medio por dominio:

| Bucket | Este repo | NVIDIA | W4A4 |
|---|---:|---:|---:|
| news | 0,050 | 0,070 | 0,075 |
| wiki_en | 0,051 | 0,066 | 0,088 |
| wiki_de | 0,025 | 0,035 | 0,043 |
| code | 0,029 | 0,036 | 0,048 |
| chat | 0,044 | 0,058 | 0,064 |
| roleplay A | 0,050 | 0,070 | 0,082 |
| roleplay B | 0,229 | 0,296 | 0,297 |

Rendimiento en un DGX Spark (GB10) con vLLM 0.31.0:

| Metrica | W4A16 (este repo) | W4A4 |
|---|---:|---:|
| Prefill, prompt ~4k tokens | 5.969 tok/s | 6.562 tok/s |
| Decode, 1 stream | 38,7 tok/s | 37,9 tok/s |
| Decode, 4 streams (total) | 132,8 tok/s | 126,6 tok/s |
| Decode, 1 stream, MTP k=1 | 58,0 tok/s | no disponible |
| Decode, 1 stream, MTP k=2 | 57,2 tok/s | no disponible |
| Decode, 4 streams (total), MTP k=1 | 171,5 tok/s | no disponible |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 23,8 GiB incluyendo la cabeza MTP (pesos cuantizados de 25,4 GB en disco).
- GPU recomendadas: DGX Spark (GB10) con 128 GB de memoria unificada; tambien deberia caber en GPUs con 24-32 GB de VRAM, aunque el autor solo valido GB10.
- Cabe en GPU consumer: probablemente en RTX 4090 (24 GB) o RTX 5090, siempre que la cache KV se limite; no validado por el autor.
- Opciones de despliegue: vLLM 0.31.0 (unica ruta validada, con `MarlinNvFp4LinearKernel` y backend `flashinfer`); llama.cpp y Ollama no soportan NVFP4 segun la informacion disponible.
- Cache KV: 620.625 tokens con `--gpu-memory-utilization 0.5` en GB10; solo 10 de 40 capas llevan cache KV.
- Latencia y throughput: 58 tok/s en un stream con MTP k=1; 171,5 tok/s agregados con 4 streams y MTP k=1; prefill de 5.969 tok/s en prompts de ~4k tokens.
- Aceptacion de MTP: 84 % a k=1 (longitud media 1,84); k=2 acepta 74 %/54 % por posicion (longitud 2,27) y no mejora la velocidad en GB10.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | KLD vs BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kaleto/Qwen3.6-35B-A3B-NVFP4 | 35,95 B (MoE) | 262.144 | NVFP4 W4A16, safetensors | 0,0758 | Apache 2.0 | Hugging Face |
| nvidia/Qwen3.6-35B-A3B-NVFP4 | 35,95 B (MoE) | 262.144 | NVFP4 con atencion y `lm_head` en FP8/NVFP4, KV cache FP8 | 0,0998 | Apache 2.0 (heredada) | Hugging Face |
| Qwen/Qwen3.6-35B-A3B (BF16) | 35,95 B (MoE) | 262.144 | BF16, 67 GB | referencia (0) | Apache 2.0 | Hugging Face |

No se dispone de comparativas con otros modelos de tamano similar fuera de la familia Qwen3.6 en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion solo afecta a los expertos MoE; el resto de pesos permanece en BF16, por lo que el ahorro de memoria (de 67 a 25,4 GB) es menor que en una cuantizacion completa.
- La calidad de vision no se revalido tras la cuantizacion; la torre de vision esta intacta en BF16, pero no hay pruebas funcionales publicadas.
- El bucket de roleplay B muestra un KLD medio de 0,229, muy superior al resto; el rendimiento en dominios creativos o de ficcion puede degradarse mas que en texto tecnico.
- Solo se validaron ingles y aleman; el comportamiento en castellano u otros idiomas no esta documentado.
- El modelo esta pensado para vLLM 0.31.0 en GB10; no hay soporte declarado para llama.cpp, Ollama, TGI u otros motores, lo que limita el despliegue en infraestructura heterogenea.
- La calibracion se hizo con `abisee/cnn_dailymail`, un dataset de noticias en ingles; el `input_scale` puede no ser optimo para otros dominios.
- Riesgo de alucinacion inherente al modelo base, no mitigado por la cuantizacion.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base Qwen3.6-35B-A3B por si impone restricciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; se trata de una publicacion reciente sin validacion independiente de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Kaleto/Qwen3.6-35B-A3B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Release NVFP4 de NVIDIA: https://huggingface.co/nvidia/Qwen3.6-35B-A3B-NVFP4
- Herramienta de cuantizacion distrib-nvfp4: https://github.com/KaletoAI/distrib-nvfp4
- nvidia-modelopt (TensorRT Model Optimizer): https://github.com/NVIDIA/TensorRT-Model-Optimizer
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
