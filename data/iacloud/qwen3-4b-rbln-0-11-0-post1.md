# iAcloud/Qwen3-4B-RBLN-0.11.0.post1

## Resumen

Qwen3-4B-RBLN-0.11.0.post1 es un artefacto compilado del modelo Qwen/Qwen3-4B (bf16) para las NPU RBLN-CA25 de Rebellions, generado con `optimum-rbln` y listo para servirse mediante `vllm-rbln`. Lo publica el usuario iAcloud y no contiene pesos en un formato convencional de inferencia en GPU, sino el binario precompilado que el compilador `rebel-compiler` produce para el hardware RBLN. El modelo base es un transformer denso de 4 mil millones de parametros de la familia Qwen3, con licencia Apache-2.0.

La relevancia de este repositorio es practica: permite desplegar Qwen3-4B sobre aceleradores NPU de Rebellions sin necesidad de compilar en destino, con una configuracion fija de 4 dispositivos en paralelo tensorial y una longitud maxima de secuencia de 40.960 tokens. El artefacto esta pensado para pruebas de rendimiento y despliegue en infraestructura RBLN, no para uso en GPU convencional.

Este repositorio forma parte de un par A/B junto con `iAcloud/Qwen3-4B-Batch8-RBLN-0.11.0.post1`; la unica diferencia entre ambos es el `batch_size` de compilacion (1 frente a 8), lo que permite medir el impacto del batching dinamico en el throughput del mismo modelo sobre el mismo hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B), compilado para NPU RBLN-CA25 |
| Parametros totales | 4 mil millones (modelo base Qwen3-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens (`max_seq_len` de compilacion) |
| Tipos de cuantizacion | no disponible; compilado desde checkpoint bf16 |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache-2.0 (heredada de Qwen/Qwen3-4B) |
| Formato de pesos | artefacto compilado RBLN (no safetensors ni GGUF); incluye `rbln_config.json` y `genia_compile_manifest.json` |
| Hardware objetivo | 4x RBLN-CA25 (tensor parallel 4) |
| Compilador | `rebel-compiler==0.11.0.post1` |
| Runtime | `optimum-rbln==0.11.0.post1`, `vllm-rbln==0.11.0`, `transformers==5.8.1`, `torch==2.11.0+cpu` |
| Batch size de compilacion | 1 |
| Implementacion de atencion | `flash_attn`, `kvcache_partition_len` 8.192 |
| Tamano del repositorio | 10,0 GB |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-4B, un transformer denso de 4 mil millones de parametros desarrollado por el equipo Qwen de Alibaba. La informacion proporcionada no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si se aplicaron tecnicas de RLHF o DPO; esos datos corresponden a la model card original de Qwen3-4B, que no se incluye en esta ficha.

La innovacion tecnica de este repositorio no reside en el modelo, sino en el proceso de compilacion: se parte del checkpoint bf16 (no del checkpoint FP8 oficial, ya que `optimum-rbln==0.11.0.post1` no puede cargar las escalas FP8 por bloques de 128x128 con escalado dinamico de activaciones) y se genera un artefacto ejecutable sobre 4 NPU RBLN-CA25 con reparto de tensor paralelo ya embebido. La particion de la cache KV se fija en 8.192 tokens por bloque y se usa `flash_attn` como implementacion de atencion. El manifiesto `genia_compile_manifest.json` registra las opciones exactas de compilacion y las versiones de los paquetes.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3-4B.
- Razonamiento y matematicas: capacidades propias de la familia Qwen3, si bien no se detallan en la informacion disponible.
- Generacion de codigo: capacidad esperable del modelo base, no verificada en esta ficha.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.
- Vision o audio: no disponibles (el pipeline declarado es text-generation).
- Servicio mediante API compatible con OpenAI a traves de `vllm-rbln`.

## Casos de uso

- Despliegue de inferencia de texto sobre NPU RBLN-CA25: el artefacto se sirve con `vllm serve <repo>` y `vllm-rbln` lee la configuracion de `rbln_config.json`, de modo que el reparto en 4 dispositivos queda fijado en compilacion y no requiere `--tensor-parallel-size`.
- Pruebas de rendimiento y benchmarks de hardware: el par A/B con la variante Batch8 permite medir el impacto del batching dinamico en throughput sobre el mismo modelo y hardware, con resultados reproducibles en 600 s por variante.
- Evaluacion de coste por token en infraestructura NPU: con 99,5 tok/s en batch 1 y 442,6 tok/s en batch 8 medidos, se puede estimar la viabilidad economica frente a GPU equivalentes.
- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 40.960 tokens, suficiente para historiales largos e instrucciones de sistema extensas.
- Generacion de contenido y resumenes de documentos largos: la ventana de 40.960 tokens permite procesar articulos, informes o transcripciones completas en una sola pasada.
- Prototipado de asistentes conversacionales en entornos con NPU: al exponer una API compatible con OpenAI, se integra en frameworks de agentes y orquestadores existentes sin cambios de codigo en el cliente.
- Servicio de inferencia en produccion con batching: la variante Batch8 del par A/B esta pensada para cargas con multiples clientes concurrentes, donde el throughput agregado es el factor critico.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados son las mediciones de throughput realizadas sobre 4x RBLN-CA25 a traves de una pasarela compatible con OpenAI, en modo no streaming, con 8 clientes concurrentes durante 600 s por variante, `max_tokens` 256, temperatura 0 y el mismo prompt en cada peticion.

| Variante | Peticiones (fallidas) | Tokens de salida | Tiempo medido | Throughput |
|---|---:|---:|---:|---:|
| Qwen3-4B-RBLN-0.11.0.post1 (batch 1) | 241 (0) | 61.696 | 620,2 s | 99,5 tok/s |
| Qwen3-4B-Batch8-RBLN-0.11.0.post1 (batch 8) | 1.040 (0) | 266.240 | 601,5 s | 442,6 tok/s |

La variante Batch8 entrega 4,45 veces el throughput de la variante batch 1 (+345,0 %). No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- NPU: 4x RBLN-CA25 en paralelo tensorial 4; el reparto esta fijado en el artefacto compilado.
- No es ejecutable en GPU convencional (A100, H100, RTX 4090) ni en CPU: requiere NPU RBLN y el SDK de Rebellions.
- VRAM estimada: no aplica; la memoria relevante es la de las NPU RBLN-CA25, cuyo dato no se detalla en la informacion disponible.
- Despliegue: `vllm serve <repo-o-ruta-local>` con `vllm-rbln==0.11.0`; no pasar `--tensor-parallel-size`.
- Versiones de runtime obligatorias: `optimum-rbln==0.11.0.post1`, `transformers==5.8.1`, `torch==2.11.0+cpu`, `rebel-compiler==0.11.0.post1`.
- Throughput medido: 99,5 tok/s con batch 1 y 442,6 tok/s con batch 8, en las condiciones descritas en la seccion de benchmarks.
- Latencia: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hardware | Throughput medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-4B-RBLN-0.11.0.post1 (batch 1) | 4 B | 40.960 | 4x RBLN-CA25 | 99,5 tok/s | Apache-2.0 | Hugging Face (artefacto RBLN) |
| Qwen3-4B-Batch8-RBLN-0.11.0.post1 | 4 B | 40.960 | 4x RBLN-CA25 | 442,6 tok/s | Apache-2.0 | Hugging Face (artefacto RBLN) |
| Qwen/Qwen3-4B (original) | 4 B | no disponible en esta ficha | GPU/CPU convencional | no disponible | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-4B-FP8 (original) | 4 B | no disponible en esta ficha | GPU convencional | no disponible | Apache-2.0 | Hugging Face |

La comparacion con alternativas fuera de la familia Qwen3 (por ejemplo, Llama 3.2 3B o Gemma 3 4B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio contiene solo el artefacto compilado; no incluye pesos en safetensors ni GGUF y no puede cargarse con transformers, llama.cpp u Ollama.
- Requiere hardware RBLN-CA25 y el SDK de Rebellions; inutilizable en infraestructura GPU o CPU estandar.
- El checkpoint FP8 oficial de Qwen3-4B no es compatible con esta compilacion; solo se parte del bf16.
- La configuracion de compilacion es fija (batch 1, 4 dispositivos, `max_seq_len` 40.960); cambiar el batch o el numero de dispositivos exige recompilar.
- Las versiones de runtime estan fijadas (`vllm-rbln==0.11.0`, `transformers==5.8.1`, `torch==2.11.0+cpu`); desviarse de ellas puede romper la carga del artefacto.
- Los benchmarks publicados solo miden throughput con un prompt identico y temperatura 0; no evalúan calidad, diversidad de respuestas ni latencia por peticion.
- Sesgos conocidos: no disponibles en la informacion proporcionada; se heredan los del modelo base Qwen3-4B.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; es el propio de un modelo de 4 B.
- Idiomas soportados: no disponibles en la informacion proporcionada.
- Uso comercial permitido por la licencia Apache-2.0, sujeta a los terminos del modelo original Qwen/Qwen3-4B.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/iAcloud/Qwen3-4B-RBLN-0.11.0.post1
- Variante Batch8 del par A/B: https://huggingface.co/iAcloud/Qwen3-4B-Batch8-RBLN-0.11.0.post1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Checkpoint FP8 del modelo base: https://huggingface.co/Qwen/Qwen3-4B-FP8
- Documentacion de optimum-rbln: no disponible en la informacion proporcionada
- Documentacion de vllm-rbln: no disponible en la informacion proporcionada
