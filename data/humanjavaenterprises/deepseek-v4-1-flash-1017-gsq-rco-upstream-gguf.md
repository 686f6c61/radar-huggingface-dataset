# HumanjavaEnterprises/DeepSeek-V4.1-Flash-1017-GSQ-RCO-upstream-GGUF

## Resumen

Este repositorio es un reempaquetado en GGUF del modelo DeepSeek-V4.1-Flash-1017 (748.494.628.464 parámetros, arquitectura de mezcla de expertos) en la cuantización IQ2_XXS GSQ-RCO publicada por ISTA-DASLab. El trabajo lo firma Humanjava Enterprises (@vveerrgg) y su único objetivo es que esos mismos pesos carguen en llama.cpp upstream estándar: los ficheros originales de ISTA usan el layout de Strata y un fichero Engram separado de 103 GB que el llama.cpp oficial no sabe abrir. No se recuantiza nada: cada tensor cuantizado es idéntico byte a byte al de ISTA, y solo cambian nombres de claves, tipos de cuatro valores, la regla `engram_gate = engram_q × engram_k` y la reorganización de la tabla Engram como un único tensor leído de forma perezosa desde disco.

La relevancia práctica es que permite ejecutar un MoE de 748B en un solo nodo con llama.cpp, sin forks ni motores de terceros: 248,8 GB en disco repartidos en cuatro fragmentos y una huella residente de unos 138 GB, porque la tabla Engram de 110,6 GB se queda en el SSD. Con una GPU de 96 GB y RAM del sistema se miden 37-40 tok/s de decodificación en edición de código y unos 32 tok/s en prosa; con todos los expertos en RAM, 18,5 tok/s.

Es, por tanto, una pieza de infraestructura más que un modelo nuevo: no aporta entrenamiento ni evaluación propia, y su valor depende de la calidad de la cuantización de ISTA y de la fidelidad del repack, verificado con 4/4 prompts de sanidad a temperatura 0 y con la comparación de 17 claves de metadatos derivadas frente a la conversión independiente de unsloth.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); incluye una tabla Engram (`per_layer_token_embd`) leída de forma perezosa |
| Parámetros totales | 748.494.628.464 (~748 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (los ejemplos de la model card emplean 65.536 y 16.384 tokens) |
| Tipos de cuantización | IQ2_XXS con el método GSQ-RCO de ISTA-DASLab; el repositorio solo publica ese nivel |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (4 fragmentos, 248,8 GB en total) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con expertos enrutados por capa: el recetario de offload distingue explícitamente los expertos `ffn_up`, `ffn_down` y `ffn_gate` por bloque (`blk.25-39` en RAM en la configuración de referencia con GPU de 96 GB, `blk.0-24` en la tarjeta). El repack añade una particularidad poco habitual: la tabla Engram, de 110,6 GB, se expone como un único tensor que llama.cpp lee del disco bajo demanda, de modo que no ocupa VRAM ni RAM residente y es lo que permite bajar de 248 GB en disco a ~138 GB en memoria.

No hay información disponible sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni sobre fases de RLHF o DPO: la model card de este repositorio es puramente de ingeniería de despliegue y remite a la documentación de DeepSeek para el modelo base. La contribución técnica propia es el reempaquetado (renombrado de claves al layout `deepseek41`, corrección de cuatro tipos de valor, cálculo de `engram_gate`, movimiento de metadatos Engram a arrays KV y unión del fichero Engram en un tensor perezoso), más una receta de decodificación especulativa `ngram-mod` que aporta un 20 % en edición de código y que, según el autor, pierde rendimiento si se usa el drafter DSpark con los expertos en RAM.

## Capacidades

- Generación de texto y conversación multi-turno: la etiqueta `conversational` y la plantilla de chat con `enable_thinking` confirman uso conversacional.
- Modo de razonamiento conmutable mediante `--chat-template-kwargs '{"enable_thinking":false}'`; la model card no detalla el comportamiento del modo activado.
- Edición y modificación de código: es el escenario donde el autor mide la decodificación especulativa (37,8 tok/s con `ngram-mod`, +20 % en edición de código).
- Contexto largo en la práctica: las recetas verificadas emplean 65.536 tokens con un pico de 85,9 GB de VRAM.
- No hay información sobre tool calling, function calling, uso de agentes, matemáticas, visión, audio ni capacidades multilingües.

## Casos de uso

- Edición de código por lotes en pipelines internos: con `ngram-mod` y 37,8 tok/s de decodificación, el modelo puede aplicarse a refactorizaciones y parches repetitivos donde el coste por token importa más que la latencia interactiva.
- Asistencia sobre documentación técnica extensa: la configuración de 64k tokens permite cargar manuales, especificaciones o varios ficheros de un repositorio en una sola ventana, con 250 tok/s de prefill que hacen viable el arranque de cada sesión.
- Servicio de inferencia de un solo nodo para equipos pequeños: con `-np 1` y 32-40 tok/s, encaja en un uso interno de baja concurrencia donde no se justifica un clúster multi-GPU.
- Prototipado y evaluación de cuantizaciones de 2 bits: el repositorio está pensado para reproducir las evaluaciones de ISTA y comparar GSQ-RCO IQ2_XXS frente a otras cuantizaciones del mismo modelo base en hardware idéntico.
- Generación de prosa y resúmenes en modo batch: a 32 tok/s en prosa, es adecuado para tareas diferidas (informes, resúmenes de documentación) más que para chat en tiempo real.
- Investigación sobre decodificación especulativa: la receta documenta resultados de `ngram-mod` y del drafter DSpark según dónde residan los expertos, lo que sirve como banco de pruebas para técnicas de aceleración en MoE con offload.
- Despliegue en entornos con GPU de gran memoria ya existente (96 GB): reutiliza una RTX PRO 6000 o similar sin necesidad de añadir nodos, manteniendo los expertos menos usados en RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos son de throughput, medidos con 1× RTX PRO 6000 Blackwell Max-Q (96 GB), Xeon w5-3525 de 16 núcleos, 256 GB DDR5, NVMe y llama.cpp `de5122d8`:

| Configuración | Prefill (tok/s) | Decode (tok/s) |
|---|---|---|
| Todos los expertos en RAM, 16 hilos | 70 | 18,5 |
| Expertos de capas 0-21 en GPU | 123 | 31,9 |
| Expertos de capas 0-27 en GPU, `-ub 2048` | 448 | 39-40 |
| Capas 0-24 en GPU + `ngram-mod`, contexto 64k | ~250 | 37,8 (edición de código) / 32 (prosa) |

Verificación funcional: 4/4 prompts de sanidad respondidos correctamente a temperatura 0 con el comando exacto documentado.

## Requisitos de hardware

- Disco: 248,8 GB libres; se recomienda NVMe, porque la tabla Engram (110,6 GB) se lee del SSD durante la inferencia.
- Memoria: ~138 GB residentes en la configuración con GPU de 96 GB; ~125 GB de RAM si todos los expertos enrutados van a memoria del sistema.
- GPU: la única configuración verificada es una GPU de 96 GB (RTX PRO 6000 Blackwell Max-Q). Con menos VRAM hay que desplazar más expertos a RAM, y el rendimiento cae hacia los 18,5 tok/s; no hay medidas publicadas para A100 o H100 de 80 GB.
- GPU de consumo: no es viable. Un modelo de 748B con ~138 GB residentes no cabe en tarjetas de 24-48 GB; como mínimo necesita un nodo con ~125 GB de RAM y, aun así, el rendimiento sería el del régimen "expertos en RAM".
- Hilos: usar tantos hilos como núcleos físicos; el hyperthreading empeora el decode porque está limitado por ancho de banda de memoria.
- Despliegue: llama.cpp upstream `de5122d8` (2026-10-27) o posterior, con `llama-server`; descarga vía `hf download`. No hay soporte documentado para vLLM, TGI, Ollama ni motores basados en el layout de Strata en este repositorio.
- Concurrencia: los ejemplos usan `-np 1`, una sola petición simultánea.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Huella | Licencia | Motor |
|---|---|---|---|---|---|---|
| Este repack (Humanjava) | 748 B | no disponible | IQ2_XXS GSQ-RCO | 248,8 GB en disco / ~138 GB residentes | MIT | llama.cpp upstream |
| ISTA-DASLab GSQ-RCO original | 748 B | no disponible | IQ2_XXS GSQ-RCO | mismos pesos + fichero Engram de 103 GB aparte | MIT | Strata (fork) |
| Unsloth UD-IQ1_M (mismo modelo base) | 748 B | no disponible | IQ1_M | ~140 GB residentes | MIT | no disponible en la información |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | 748 B | no disponible | pesos completos | no disponible | MIT | no disponible |

La comparación relevante es de encaje de despliegue, no de calidad: los pesos cuantizados de este repositorio y los de ISTA son idénticos, y frente a UD-IQ1_M cambia el método de cuantización (2 bits GSQ-RCO frente a 1 bit), con una huella residente similar. No hay datos de benchmarks que permitan comparar calidad entre ambas cuantizaciones.

## Limitaciones y advertencias

- Cuantización de 2 bits: la pérdida de calidad frente a los pesos completos no está cuantificada en la información disponible; la verificación publicada se limita a 4 prompts de sanidad, no a una evaluación de calidad.
- Repositorio de terceros sin tracción: 0 descargas y 0 likes en el momento de la ficha; la procedencia se apoya en que los tensores son idénticos byte a byte a los de ISTA y en los `SHA256SUMS`, que conviene comprobar.
- Dependencia de una versión concreta de llama.cpp (`de5122d8` o posterior); versiones anteriores no cargarán el layout `deepseek41`.
- El rendimiento cae de forma acusada si los expertos van a RAM (18,5 tok/s) y el uso de decodificación especulativa con DSpark empeora en ese régimen.
- Una sola petición concurrente en las configuraciones documentadas; no es un modelo para servir a muchos usuarios a la vez.
- No hay información sobre idiomas soportados, sesgos, tasas de alucinación ni comportamiento multilingüe; la model card está redactada únicamente en inglés y no aborda evaluación cualitativa.
- Riesgo habitual de alucinación en generación de texto, sin datos específicos que lo acoten para esta cuantización.
- Licencia MIT en el modelo base, la cuantización y el repack: permite uso comercial, pero conviene conservar los avisos de copyright de las tres partes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HumanjavaEnterprises/DeepSeek-V4.1-Flash-1017-GSQ-RCO-upstream-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Cuantización original de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Herramienta de conversión y documentación del repack: https://github.com/HumanjavaEnterprises/deepseek-v41-upstream
- Receta de despliegue y barrido de rendimiento: https://github.com/HumanjavaEnterprises/deepseek-v41-upstream/blob/main/RECIPE.md
- Política de seguridad: https://github.com/HumanjavaEnterprises/deepseek-v41-upstream/blob/main/SECURITY.md
- llama.cpp: https://github.com/ggml-org/llama.cpp
