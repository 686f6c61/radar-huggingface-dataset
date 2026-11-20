# BoxyFit/Qwen3.6-35B-A3B-8V16D

## Resumen

Qwen3.6-35B-A3B-8V16D es una cuantización GGUF del modelo Qwen3.6-35B-A3B de Alibaba Qwen, publicada por el usuario BoxyFit bajo licencia Apache 2.0. Se trata de un modelo de lenguaje de arquitectura Mixture of Experts (MoE) con 35.505.251.456 parámetros totales (unos 35,5 mil millones), del cual solo un subconjunto de expertos se activa por token (A3B indica aproximadamente 3 mil millones de parámetros activos). El objetivo declarado por el autor es ofrecer la mejor calidad posible en el hardware más común: una GPU de 8 GB de VRAM y 16 GB de RAM, de ahí el sufijo "8V16D".

La innovación principal de esta ficha es el formato de cuantización propietario FTQ (adaptive Trellis quant) y FIQ, empaquetados para el motor de inferencia Strata, que mantiene un "hot tier" de expertos en la GPU mientras el pool completo de expertos reside en RAM del sistema. Según el autor, esto permite ejecutar el modelo completo a velocidades de decodificación de 26-31 t/s en una RTX 3070 Ti de 8 GB, algo que las cuantizaciones convencionales de llama.cpp no consiguen bajo un presupuesto estricto de 12 GiB de RAM.

El modelo es relevante porque aborda un problema práctico muy extendido: desplegar un MoE de 35B en equipos de consumo. Frente a las cuantizaciones del proveedor (UD-IQ2_M, UD-IQ3_S, ISTA IQ2_XS), el autor reporta menor perplejidad y mejor rendimiento en contexto largo, con un tamaño de descarga de 10,7-11,0 GiB. No se dispone de información sobre los idiomas soportados ni sobre benchmarks estándar (MMLU, HumanEval, GSM8K) en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts (MoE), según el modelo base Qwen3.6-35B-A3B |
| Parámetros totales | 35.505.251.456 (35,5B) |
| Parámetros activos | Aproximadamente 3B (denominación A3B del modelo base) |
| Longitud de contexto | Hasta 98K tokens en configuraciones llama.cpp medidas; hasta 56K en Strata con `--max-context 56000` |
| Tipos de cuantización | FTQ (adaptive Trellis quant, ~9,36 GiB de pool de expertos) y FIQ (variante de mayor contexto y perplejidad ligeramente superior); formato GGUF |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp, LM Studio, Ollama y motor Strata) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con arquitectura Mixture of Experts: de los 35,5 mil millones de parámetros totales, solo unos 3 mil millones se activan por token, lo que reduce el coste computacional de inferencia manteniendo la capacidad del modelo completo. Esta ficha es una cuantización del modelo base, no un reentrenamiento: el autor no aporta información sobre el dataset de entrenamiento original, el número de tokens, la composición de los datos ni si hubo fases de RLHF o DPO. Esos datos corresponden a la model card de Qwen y no están incluidos en la información disponible.

La aportación técnica del autor es el pipeline de cuantización y el empaquetado para dos motores. FTQ comprime el pool de expertos a 9,36 GiB (frente a los 14,3 GiB de UD-IQ3_S), lo que permite que el pool completo quepa en el presupuesto de RAM de un equipo de 16 GB. El motor Strata mantiene los expertos "calientes" en la GPU y alimenta desde RAM el resto, con decodificación especulativa MTP-2 activada por defecto en la configuración de servicio. La variante FIQ prioriza contexto más largo a costa de una perplejidad ligeramente mayor (7,639 frente a 7,547 en wikitext-2). El autor incluye hashes SHA256 para verificar las descargas.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.6-35B-A3B.
- Capacidad de contexto largo: hasta 98K tokens medidos en llama.cpp y 56K en Strata.
- Ejecución en hardware de consumo: GPU de 8 GB de VRAM más 16 GB de RAM.
- Compatibilidad con tool calling y function calling: no confirmado en la información disponible (depende de las capacidades del modelo base, no documentadas aquí).
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponible.
- Modo "thinking", visión o audio: no disponible.
- Dos motores de inferencia: Strata (optimizado, decodificación especulativa MTP-2) y llama.cpp / LM Studio / Ollama (streaming de capas a CPU).

## Casos de uso

- Despliegue local en PC de gaming estándar: un equipo con RTX 3070 Ti (8 GB) y 16 GB de RAM puede servir el modelo completo con Strata a 26-31 t/s de decodificación, suficiente para asistentes interactivos sin depender de la nube.
- Asistentes de código en el IDE: con contexto de hasta 56-98K tokens, el modelo puede mantener el contexto de varios ficheros de un proyecto y responder consultas de refactorización o explicación de código en local.
- Procesamiento de documentos largos: la ventana de 64-98K tokens permite resumir o extraer información de contratos, informes o transcripciones sin trocear el texto, usando la configuración FIQ en llama.cpp.
- Chat multi-turno con memoria extendida: el contexto largo medido (13,5 t/s a 98K en llama.cpp) hace viable mantener conversaciones de decenas de miles de tokens con historial completo.
- Sustitución de cuantizaciones del proveedor en LM Studio u Ollama: el autor reporta 0,14 puntos menos de perplejidad que UD-IQ2_M y un 24% más de velocidad en contexto largo que UD-IQ3_S con 3,3 GiB menos de descarga, lo que lo hace adecuado para usuarios que ya usan esos frontends.
- Prototipado e investigación en entornos con recursos limitados: permite experimentar con un MoE de 35B en una sola GPU de consumo, útil para evaluar comportamiento de modelos grandes antes de escalar a infraestructura de servidor.
- Servicio de inferencia en estaciones de trabajo modestas: con el motor Strata y el pool de expertos fijado en RAM, se puede ofrecer un endpoint compatible con la API de OpenAI (tag `endpoints_compatible`) en hardware de escritorio.

## Benchmarks y rendimiento

Los únicos datos publicados son mediciones de velocidad y perplejidad realizadas por el autor en una RTX 3070 Ti (8 GB) con host de 16 GB de RAM, temperatura 0 y prompts reales de unos 30K tokens. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

| Configuración | Contexto | Decodificación (t/s) | Prefill (t/s) | VRAM (GiB) | RAM (GiB) | Descarga (GiB) | Perplejidad (wikitext-2) |
|---|---|---|---|---|---|---|---|
| 8V16D-FTQ (Strata) | 20K | 26,1 | 371 | 7,6 | 12 | 10,7 | 7,547 |
| 8V16D-FTQ (Strata) | 56K | 11,8 | 372 | 7,6 | 12 | 10,7 | 7,547 |
| 8V16D-FIQ (Strata) | 20K | 31,1 | 323 | 7,8 | 12 | 11,0 | 7,639 |
| 8V16D-FIQ (Strata) | 56K | 12,8 | 325 | 7,8 | 12 | 11,0 | 7,639 |
| UD-IQ3_S (referencia) | 20K | 29,2 | 346 | 7,9 | 16 | 14,3 | 7,451 |
| UD-IQ2_M (referencia) | 20K | — | — | — | — | 10,7 | 7,776 |
| ISTA IQ2_XS (referencia) | 20K | — | — | — | — | 7,8 | 8,373 |
| 8V16D-FIQ (llama.cpp) | 20K | 14,8 | 331 | 2,5 | 14 | 11,0 | 7,639 |
| 8V16D-FIQ (llama.cpp) | 64K | 14,0 | 318 | 2,5 | 14 | 11,0 | 7,639 |
| 8V16D-FIQ (llama.cpp) | 98K | 13,5 | 312 | 2,5 | 14 | 11,0 | 7,639 |
| UD-IQ2_M (llama.cpp) | 20K | 14,7 | 328 | 2,6 | 14 | 10,7 | 7,776 |
| UD-IQ2_M (llama.cpp) | 98K | 13,3 | 310 | 2,6 | 14 | 10,7 | 7,776 |
| UD-IQ3_S (llama.cpp) | 64K | 11,3 | 249 | — | — | 14,3 | 7,451 |
| UD-IQ3_S (llama.cpp) | 98K | 10,9 | 245 | — | — | 14,3 | 7,451 |
| UD-IQ2_XXS (llama.cpp) | 64K | 3,0 | 522 | — | — | — | 8,696 |
| ISTA IQ2_XS (llama.cpp) | 98K | 1,4 | 347 | — | — | 7,8 | 8,373 |

## Requisitos de hardware

- VRAM: 7,6-7,8 GiB en configuración Strata (modelo completo con hot tier de expertos en GPU); 2,5-2,6 GiB en llama.cpp con offload parcial.
- RAM: 12 GiB mínimos para velocidad plena en Strata bajo cgroup estricto; 14 GiB en llama.cpp. El pool de expertos FTQ ocupa 9,36 GiB; el de UD-IQ3_S, 14,3 GiB.
- GPU recomendadas: RTX 3070 Ti (medida por el autor), RTX 3060 Ti/4060 Ti de 8 GB y superiores. Cualquier GPU con 8 GB de VRAM es el objetivo declarado.
- GPU de consumo: sí, cabe en tarjetas de 8 GB con el motor Strata; en llama.cpp funciona incluso con menos VRAM moviendo capas a CPU.
- Despliegue: motor Strata (`strata --serve --native ... --max-context 56000 --mtp 2`), llama.cpp (`llama-server`), LM Studio (importación GGUF, offload auto) y Ollama (importación previa).
- Latencia y throughput: 26-31 t/s de decodificación en Strata a 20K de contexto; 11,8-12,8 t/s a 56K. En llama.cpp, 13,5-14,8 t/s entre 20K y 98K. Prefill de 371 t/s (Strata) y 312-331 t/s (llama.cpp). Tiempo de prefill puro: 49 s (FTQ, 20K) y 2,5 min (FTQ, 56K) en Strata; 1,0-5,0 min en llama.cpp según contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (wikitext-2) | Descarga (GiB) | RAM mínima (GiB) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-8V16D-FTQ | 35,5B (3B activos) | 56K (Strata) | 7,547 | 10,7 | 12 | Apache 2.0 | Hugging Face |
| Qwen3.6-35B-A3B-8V16D-FIQ | 35,5B (3B activos) | 98K (llama.cpp) | 7,639 | 11,0 | 12-14 | Apache 2.0 | Hugging Face |
| UD-IQ3_S (cuantización del proveedor) | 35,5B (3B activos) | 98K (llama.cpp) | 7,451 | 14,3 | 16 | Apache 2.0 | Hugging Face |
| UD-IQ2_M (cuantización del proveedor) | 35,5B (3B activos) | 98K (llama.cpp) | 7,776 | 10,7 | 14 | Apache 2.0 | Hugging Face |
| ISTA IQ2_XS (cuantización del proveedor) | 35,5B (3B activos) | 98K (llama.cpp) | 8,373 | 7,8 | — | Apache 2.0 | Hugging Face |

La comparativa se limita a las cuantizaciones alternativas del mismo modelo base citadas por el autor; no se dispone de datos de otros modelos MoE comparables en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; hereda los del modelo base Qwen3.6-35B-A3B, no descritos aquí.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos de lenguaje de esta escala.
- Limitaciones de contexto: en Strata, el contexto máximo práctico medido es de 56K con `--max-context 56000`; a 56K la decodificación cae a 11,8-12,8 t/s. En llama.cpp se midieron hasta 98K con 13,5 t/s.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.6-35B-A3B enlazada por el autor.
- Dependencia del motor Strata: las mejores cifras (26-31 t/s) requieren el motor propietario del autor; en llama.cpp/LM Studio/Ollama el rendimiento baja a 13,5-14,8 t/s.
- Presupuesto de RAM crítico: bajo un límite de 12 GiB, las cuantizaciones del proveedor UD-IQ3_S e ISTA IQ2_XS no arrancan en Strata; con 8 GiB de RAM ningún pack de Strata arranca. En Windows, el sistema operativo retiene 3-4 GiB, lo que agrava la restricción.
- Advertencia del autor: Ollama y LM Studio mueven capas a CPU automáticamente cuando el contexto excede la VRAM sin avisar, lo que degrada el rendimiento de forma silenciosa.
- Idiomas soportados: no disponible, lo que impide garantizar calidad en castellano u otros idiomas distintos de los del modelo base.
- Verificación de integridad: el autor publica hashes SHA256 para FTQ y FIQ; es recomendable comprobarlos antes de usar los ficheros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BoxyFit/Qwen3.6-35B-A3B-8V16D
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Motor Strata y utilidades del autor: no disponible en la información proporcionada
- Paper o blog técnico del modelo base: no disponible en la información proporcionada
- Repositorio de llama.cpp: no disponible en la información proporcionada
