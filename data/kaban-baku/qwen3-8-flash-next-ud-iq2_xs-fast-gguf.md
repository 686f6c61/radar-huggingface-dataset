# kaban-baku/Qwen3.8-Flash-Next-UD-IQ2_XS-Fast-GGUF

## Resumen

Qwen3.8-Flash-Next-UD-IQ2_XS-Fast es una cuantización GGUF derivada del modelo Qwen3.8-Flash-Next de Qwen, publicada por el usuario kaban-baku. No se trata de un modelo entrenado desde cero, sino de una reempaquetación de precisión reducida (IQ2_XS) que combina matrices de dos cuantizaciones previas del mismo modelo base: la UD-IQ2_XS de Unsloth (Dynamic v3.1) y la GSQ-RCO de ISTA-DASLab. El objetivo declarado es hacer viable la inferencia de un modelo MoE de gran tamaño en GPU de 8 GB de VRAM, manteniendo las puntuaciones de calidad del original.

La modificación concreta consiste en sustituir las 300 matrices no pertenecientes a los expertos (atención, salida SSM, expertos compartidos) de la cuantización de Unsloth, que ocupaban 2,6 GiB en Q6_K y Q8_0, por las equivalentes de GSQ-RCO (mayoritariamente IQ4_XS y Q6_K). Esto libera VRAM para caché de expertos: los slots pasan de 310 a 773 y la tasa de acierto de 60 % a 82 %, lo que eleva el throughput de decodificación de 35,9 a 47,8 tok/s en una RTX 3070 Ti Laptop de 8 GB. Los 512 expertos se conservan íntegros y no se requiere ningún parche de Strata.

El modelo es relevante para quienes necesitan ejecutar un MoE grande en hardware de consumo, con soporte de contexto largo (128K en las pruebas) y capacidades de código y herramientas, a costa de una ligera pérdida de calidad y de un comportamiento problemático en modo thinking. La licencia es la Qwen Community License 1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atención y componentes SSM (según referencias a matrices `attn_output` y `ssm_out`); detalles completos del transformer base no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE con 512 expertos) |
| Longitud de contexto | 128K (configuración usada en las evaluaciones) |
| Tipos de cuantizacion | IQ2_XS (expertos, router, cabeza de salida, hyper-connections y PLE de Unsloth); matrices no-expertas en IQ4_XS y Q6_K procedentes de GSQ-RCO |
| Idiomas soportados | ja, en |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | GGUF (3 shards: 10,9 MB + 46,0 GB + 28,8 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con mezcla de expertos (MoE) que incorpora componentes de estado (SSM), a juzgar por la presencia de matrices `ssm_out` y de mecanismos denominados hyper-connections y PLE en la model card. Cuenta con 512 expertos y un router, además de expertos compartidos. No se dispone de información sobre el número total de parámetros, los tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) en la documentación proporcionada.

Esta ficha no documenta un entrenamiento nuevo, sino una operación de cuantización e intercambio de matrices. El autor copia byte a byte 300 matrices no-expertas desde el fichero IQ2_XS de GSQ-RCO y, en un segundo paso, 48 matrices `attn_output` y `ssm_out` desde el fichero IQ3_S del mismo repositorio. No se recuantiza nada: solo se verifican nombres y formas. Los expertos, el router, la cabeza de salida, las hyper-connections y el PLE provienen de la cuantización UD-IQ2_XS (Dynamic v3.1) de Unsloth. El resultado requiere Strata 0.2.11 o superior con soporte de Unsloth Dynamic v3.1, y se ejecuta sin parche de routing porque mantiene los 512 expertos.

## Capacidades

- Generación de texto en inglés y japonés, con buen rendimiento medido en conocimiento japonés (JamC-QA 65,0 % en opción múltiple).
- Generación de código: HumanEval 94,5 % y MBPP 86,0 % en las evaluaciones del autor.
- Razonamiento de forma larga en japonés: ELYZA-tasks-100 con puntuación 3,93 sobre 5 (evaluación ciega por Claude).
- Uso de herramientas: tool-eval-bench completo (69 escenarios) con puntuación 88.
- Modo thinking disponible, aunque con advertencias de comportamiento repetitivo (ver limitaciones).
- Soporte de contexto largo: las pruebas se realizaron con 128K de contexto y MTP (multi-token prediction).
- Capacidades multilingües limitadas a los idiomas declarados (ja, en); no se documentan otros.
- No se documentan capacidades de visión, audio ni agentes multi-paso más allá de lo cubierto por tool-eval-bench.

## Casos de uso

- Inferencia local en GPU de 8 GB: el caso de uso central del fichero. Permite ejecutar un MoE de 512 expertos en una RTX 3070 Ti Laptop con 8 GB de VRAM y 64 GB de RAM, con una tasa de acierto de caché de expertos del 82 % y 47,8 tok/s de decodificación.
- Asistente de código en estación de trabajo: con HumanEval 94,5 % y MBPP 86,0 %, es adecuado para autocompletado y generación de funciones en entornos con recursos limitados, siempre que el contexto se mantenga dentro de lo que permita la VRAM disponible.
- Procesamiento de documentación larga en japonés: el contexto de 128K y la puntuación ELYZA de 3,93 lo hacen utilizable para resumen y redacción extensa en japonés, con la cautela de que el modo thinking degrada la estabilidad.
- Automatización con herramientas: la puntuación de 88 en tool-eval-bench (69 escenarios) respalda su uso en pipelines que requieran function calling, como consultas a APIs o ejecución de comandos estructurados.
- Evaluación comparativa de cuantizaciones: sirve como referencia para estudiar el compromiso entre VRAM, tasa de acierto de expertos y calidad en despliegues MoE con presupuesto de memoria ajustado.
- Despliegue con Strata en Windows: el author documenta un flujo completo (empaquetado con `iq_pack.py --compat-bf16` y arranque con `--native`) sobre Windows 11, lo que facilita la reproducción en equipos de desarrollo con GPU modesta.
- Investigación sobre cuantización híbrida: el método de intercambio de matrices entre dos cuantizaciones del mismo base es replicable y está documentado en el repositorio `swap_dense.py` del autor.

## Benchmarks y rendimiento

Evaluaciones realizadas por el autor en RTX 3070 Ti Laptop 8 GB, 64 GB RAM, Windows 11, build basada en Strata 0.2.11, `--resident-budget-gib 24`, contexto 128K, MTP, `STRATA_ROUTE_PRIOR=1.5`, sin thinking y temperatura 0.

| Metrica | IQ3_S (512, ISTA-DASLab) | UD-IQ2_XS (512) | UD-IQ2_XS-Fast |
|---|---:|---:|---:|
| Slots de expertos en VRAM / tasa de acierto | 421 / 68 % | 310 / 60 % | 773 / 82 % |
| Decodificación (media de 2 ejecuciones de 4 peticiones x 1.200 tokens) | 21,3 tok/s | 35,9 tok/s | 47,8 tok/s (+33 %) |
| JamC-QA, 748 (conocimiento japonés, 4 opciones) | 65,9 % | 65,5 % | 65,0 % |
| HumanEval, 164 | 92,7 % | 96,3 % | 94,5 % |
| MBPP, 257 | 87,9 % | 88,3 % | 86,0 % |
| ELYZA-tasks-100 (14 ficheros calificados a ciegas por Claude, sobre 5) | 3,99 | 3,95 | 3,93 |
| tool-eval-bench, completo (69 escenarios) | 89 | 86 | 88 |

El autor indica que las diferencias frente a UD-IQ2_XS están dentro del ruido entre ejecuciones (ELYZA: -0,02, t pareada = -0,2) y que las puntuaciones ELYZA solo son comparables dentro de esta tabla. El rendimiento en Strata 0.2.12 no se ha medido.

## Requisitos de hardware

- VRAM: el escenario de referencia es una GPU de 8 GB con 64 GB de RAM de sistema y `--resident-budget-gib 24`. Las matrices no-expertas sustituidas ocupan 2,6 GiB en el original de Unsloth; el intercambio del paso 2 cuesta unos 190 MiB de VRAM (773 frente a 928 slots de expertos).
- GPU recomendadas: RTX 3070 Ti Laptop 8 GB es la única configuración medida. No se han publicado pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: sí cabe en 8 GB de VRAM según la medición del autor, con caché parcial de expertos y el resto en RAM.
- Despliegue: motor Strata 0.2.11 o superior (build basada en 0.2.11, engine 0.1.57), con empaquetado previo mediante `python <Strata>/tools/iq_pack.py --gguf <primer fichero> --out <PACK_DIR> --compat-bf16` y arranque con `--native <primer fichero>`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 47,8 tok/s de decodificación en la configuración de referencia, frente a 35,9 tok/s de UD-IQ2_XS y 21,3 tok/s de IQ3_S.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decodificación (8 GB) | Calidad (ELYZA / HumanEval) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| UD-IQ2_XS-Fast (este) | no disponible (MoE 512 expertos) | 128K en pruebas | 47,8 tok/s | 3,93 / 94,5 % | qwen-community-1.0 | GGUF, 3 shards |
| UD-IQ2_XS (Unsloth) | no disponible (MoE 512 expertos) | 128K en pruebas | 35,9 tok/s | 3,95 / 96,3 % | qwen-community-1.0 | GGUF |
| IQ3_S (ISTA-DASLab) | no disponible (MoE 512 expertos) | 128K en pruebas | 21,3 tok/s | 3,99 / 92,7 % | qwen-community-1.0 | GGUF |
| GSQ-RCO IQ2_XS (ISTA-DASLab) | no disponible (MoE 512 expertos) | no disponible | no disponible | no disponible | qwen-community-1.0 | GGUF |

No se dispone de datos de benchmarks de GSQ-RCO IQ2_XS en la información proporcionada, más allá de que Unsloth midió que su modo thinking es aproximadamente un 49 % más largo que BF16.

## Limitaciones y advertencias

- Modo thinking inestable: en una preprueba de 30 preguntas con thinking activado y temperatura 0, el modelo se quedó en bucles de razonamiento hasta agotar el presupuesto en 17 de 30 casos, frente a 13 en el UD-IQ2_XS original. El autor lo califica de no concluyente por el tamaño de la muestra, pero recomienda usar temperatura 0,6 y top-p 0,95 de Qwen y esperar razonamientos más largos.
- Pérdida de calidad leve: ELYZA baja de 3,95 a 3,93 y HumanEval de 96,3 % a 94,5 % respecto a UD-IQ2_XS, aunque el autor considera las diferencias dentro del ruido.
- Cobertura de idiomas limitada a japonés e inglés; no se documenta rendimiento en castellano.
- Dependencia de un motor específico: requiere Strata 0.2.11 o superior con soporte de Dynamic v3.1; no se documenta funcionamiento en otros runners GGUF.
- El tercer shard no está en el repositorio: debe descargarse del repositorio de Unsloth y renombrarse, con el SHA-256 indicado.
- Licencia Qwen Community License 1.0: es necesario revisar sus términos para uso comercial, ya que puede imponer condiciones adicionales a las licencias permisivas habituales.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones específicas de factualidad ni de sesgos.
- Rendimiento no medido en Strata 0.2.12 ni en GPU distintas de la RTX 3070 Ti Laptop de 8 GB.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica escasa validación externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kaban-baku/Qwen3.8-Flash-Next-UD-IQ2_XS-Fast-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantización de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Cuantización GSQ-RCO de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Repositorio con el script `swap_dense.py` y los scripts de evaluación: https://github.com/kaban-baku/Qwen3.8-Flash-Next-IQ3_S-384Exp
