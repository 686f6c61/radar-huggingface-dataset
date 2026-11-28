# eaddario/JQ2_K-JQ6_K-Test-Models

## Resumen

JQ2_K-JQ6_K-Test-Models es un repositorio experimental publicado por el desarrollador independiente eaddario que contiene cuantizaciones GGUF de dos modelos base distintos: K2-Horizon-7B (denso) y LFM2.5-8B-A1B (MoE). No se trata de un modelo entrenado desde cero, sino de un banco de pruebas para cinco nuevos tipos de super-bloque no lineales (JQ2_K a JQ6_K) implementados en un fork de llama.cpp. El objetivo es demostrar que estos formatos reducen el error de cuantización respecto a sus equivalentes K-quant estándar manteniendo, en la mayoría de los casos, el mismo tamano de fichero.

La relevancia es fundamentalmente tecnica: para los desarrolladores que despliegan modelos en CPU o en GPUs con VRAM limitada, la cuantización es la palanca principal para reducir requisitos de memoria. Los resultados publicados muestran que JQ3_K, JQ4_K y JQ5_K ocupan exactamente los mismos bytes que Q3_K, Q4_K y Q5_K pero reducen la KLD media entre un 13,8 % y un 56,8 % segun el modelo y el nivel. JQ6_K, con un 0,7-0,9 % mas de tamano, recorta la KLD media mas de la mitad en el modelo denso.

El repositorio tiene 361,1 GB e incluye multiples variantes por modelo y nivel de cuantizacion. El parametro total reportado en safetensors es de 8.999.178.240 (aproximadamente 9 mil millones), correspondiente a los pesos del modelo base en su variante densa. La licencia es Apache 2.0 y el unico idioma declarado es ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base denso K2-Horizon-7B y MoE LFM2.5-8B-A1B); el repositorio contiene cuantizaciones GGUF, no pesos completos |
| Parametros totales | 8.999.178.240 (segun safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | JQ2_K, JQ3_K, JQ4_K, JQ5_K, JQ6_K (nuevos super-bloques no lineales); comparados contra Q2_K, Q3_K, Q4_K, Q5_K, Q6_K |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |
| Bits por peso (JQ2_K a JQ6_K) | 2,3750 / 3,4375 / 4,5000 / 5,5000 / 6,6250 |
| Bytes por bloque de 256 pesos | 76 / 110 / 144 / 176 / 212 |
| Niveles de codebook | 4 / 8 / 16 / 32 / 64 |
| Compatibilidad con llama.cpp estandar | no (requiere fork con PR #30715) |
| Dataset de calibracion | eaddario/imatrix-calibration |

## Arquitectura y entrenamiento

Los modelos base sobre los que se aplican las cuantizaciones son K2-Horizon-7B (arquitectura densa, aproximadamente 7B parametros) y LFM2.5-8B-A1B (arquitectura MoE, aproximadamente 8B parametros totales con 1B activos, segun la nomenclatura A1B). El repositorio no entrena ningun modelo: produce ficheros GGUF mediante un fork de llama.cpp que introduce cinco tipos de super-bloque no lineales. Cada super-bloque agrupa 256 pesos y almacena un codebook de niveles (4, 8, 16, 32 o 64) junto con metadatos de escala, gastando exactamente el mismo payload de indices que su equivalente K-quant.

La innovacion tecnica reside en el diseno no lineal del codebook: en lugar de una cuantizacion escalar uniforme por bloques como en los K-quant, los JQ_K usan niveles de codebook optimizados que reducen el error de reconstruccion para el mismo numero de bits. El proceso de calibracion emplea un dataset imatrix propio (eaddario/imatrix-calibration) y mantiene fijos la receta de cuantizacion, el imatrix y los parametros, de modo que la diferencia de calidad medida se atribuye unicamente al formato. No se documenta en la informacion disponible el proceso de entrenamiento original de los modelos base (numero de tokens, composicion del dataset, RLHF/DPO).

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Cuantizacion de alta fidelidad: los formatos JQ3_K a JQ6_K preservan mejor la distribucion de probabilidad del modelo original que sus equivalentes K-quant, medido por KLD media, KLD al 99 %, Δp RMS y top-1 agreement.
- Compatibilidad con endpoints (tag endpoints_compatible) una vez cargados en el fork de llama.cpp correspondiente.
- Soporte de los modelos base: las capacidades funcionales (razonamiento, codigo, tool calling, agentes) dependen del modelo base subyacente, no del formato de cuantizacion; no se detallan en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun el campo language del repositorio.
- No se documentan modos especiales (thinking, vision, audio) en la informacion disponible.

## Casos de uso

- Despliegue en CPU con memoria limitada: usar JQ3_K (110 bytes por bloque de 256 pesos, 4,81 GiB en K2-Horizon-7B) para servir el modelo en servidores sin GPU, obteniendo una KLD media de 0,077597 frente a 0,179783 de Q3_K al mismo tamano de fichero.
- Evaluacion de formatos de cuantizacion: el repositorio sirve como banco de pruebas reproducible para comparar K-quant estandar contra JQ_K con receta, imatrix y parametros fijados, util para investigadores que estudien compresion de modelos.
- Sustitucion directa en pipelines existentes: JQ4_K y JQ5_K ocupan exactamente los mismos bytes que Q4_K y Q5_K, por lo que pueden reemplazar estos ficheros en un despliegue ya dimensionado sin cambiar los requisitos de VRAM o RAM.
- Despliegue en GPU de consumo: con JQ4_K (5,67 GiB en el modelo denso) el modelo cabe en GPUs de 8 GB, y con JQ3_K (4,81 GiB) en GPUs de 6 GB, manteniendo un error de perplejidad de +1,36 % y +6,29 % respectivamente frente a F16.
- Cuantizacion de maxima fidelidad en produccion: JQ6_K en K2-Horizon-7B reduce la KLD media un 55,7 % y el top-1 agreement sube 1,02 puntos porcentuales respecto a Q6_K con solo un 0,7 % mas de tamano, adecuado cuando la precision importa mas que el ahorro de disco.
- Cuantizacion de modelos MoE: en LFM2.5-8B-A1B, JQ5_K reduce la KLD media un 13,8 % y mejora la perplejidad de +3,39 % a +0,37 % frente a F16, manteniendo 5,52 GiB, lo que resulta util para servir modelos MoE en hardware modesto.
- Investigacion sobre super-bloques no lineales: el fork de llama.cpp y los datos publicados permiten replicar y extender el estudio a otros modelos y niveles de bits.

## Benchmarks y rendimiento

Los datos publicados comparan cada JQ_K contra su K-quant equivalente con receta, imatrix y parametros fijados. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible; las metricas son de fidelidad de cuantizacion.

K2-Horizon-7B (denso):

| Metrica | Q2_K | JQ2_K | Q3_K | JQ3_K | Q4_K | JQ4_K | Q5_K | JQ5_K | Q6_K | JQ6_K |
|---|---|---|---|---|---|---|---|---|---|---|
| Tamano (GiB) | — | — | 4,81 | 4,81 | 5,67 | 5,67 | 6,48 | 6,48 | — | — |
| PPL Δ% vs F16 | — | — | +17,17 % | +6,29 % | +1,62 % | +1,36 % | +0,39 % | +0,35 % | — | — |
| KLD media | — | — | 0,179783 | 0,077597 | 0,023664 | 0,018849 | 0,007991 | 0,006624 | — | — |
| KLD 99 % | — | — | 1,228516 | 0,613978 | 0,189978 | 0,154974 | 0,070236 | 0,056235 | — | — |
| Δp RMS | — | — | 10,888 % | 7,167 % | 3,895 % | 3,461 % | 2,290 % | 2,097 % | — | — |
| Top-1 agree | — | — | 80,049 % | 86,738 % | 92,714 % | 93,437 % | 95,910 % | 96,262 % | — | — |

Variacion relativa K-quant a JQ_K en K2-Horizon-7B:

| Conversion | Tamano | KLD media | KLD 99 % | Δp RMS | Top-1 agree |
|---|---|---|---|---|---|
| Q2_K → JQ2_K | −4,9 % | +5,2 % | −1,0 % | +1,1 % | −1,01 pp |
| Q3_K → JQ3_K | igual | −56,8 % | −50,0 % | −34,2 % | +6,69 pp |
| Q4_K → JQ4_K | igual | −20,3 % | −18,4 % | −11,1 % | +0,72 pp |
| Q5_K → JQ5_K | igual | −17,1 % | −19,9 % | −8,4 % | +0,35 pp |
| Q6_K → JQ6_K | +0,7 % | −55,7 % | −53,9 % | −33,4 % | +1,02 pp |

LFM2.5-8B-A1B (MoE):

| Metrica | Q3_K | JQ3_K | Q4_K | JQ4_K | Q5_K | JQ5_K |
|---|---|---|---|---|---|---|
| Tamano (GiB) | 3,55 | 3,55 | 4,56 | 4,56 | 5,52 | 5,52 |
| PPL Δ% vs F16 | +15,45 % | +13,37 % | +2,94 % | +2,82 % | +3,39 % | +0,37 % |
| KLD media | 0,459857 | 0,361761 | 0,179660 | 0,152481 | 0,100963 | 0,087039 |
| KLD 99 % | 2,428714 | 2,047217 | 1,116902 | 0,937650 | 0,682244 | 0,605067 |
| Δp RMS | 13,015 % | 11,699 % | 8,270 % | 7,490 % | 6,131 % | 5,705 % |
| Top-1 agree | 68,059 % | 70,906 % | 78,821 % | 80,403 % | — | — |

Variacion relativa K-quant a JQ_K en LFM2.5-8B-A1B:

| Conversion | Tamano | KLD media | KLD 99 % | Δp RMS | Top-1 agree |
|---|---|---|---|---|---|
| Q2_K → JQ2_K | −8,6 % | +15,6 % | +13,7 % | +6,9 % | −2,04 pp |
| Q3_K → JQ3_K | igual | −21,3 % | −15,7 % | −10,1 % | +2,85 pp |
| Q4_K → JQ4_K | igual | −15,1 % | −16,0 % | −9,4 % | +1,58 pp |
| Q5_K → JQ5_K | igual | −13,8 % | −11,3 % | −6,9 % | +1,17 pp |
| Q6_K → JQ6_K | +0,9 % | −23,2 % | −27,6 % | −12,0 % | +1,22 pp |

## Requisitos de hardware

- VRAM/RAM estimada (K2-Horizon-7B denso): JQ3_K 4,81 GiB, JQ4_K 5,67 GiB, JQ5_K 6,48 GiB, JQ6_K aproximadamente 6,5 GiB (Q6_K mas 0,7 %); JQ2_K aproximadamente 4,8 GiB (Q2_K menos 4,9 %).
- VRAM/RAM estimada (LFM2.5-8B-A1B MoE): JQ3_K 3,55 GiB, JQ4_K 4,56 GiB, JQ5_K 5,52 GiB, JQ6_K aproximadamente 5,5 GiB (Q6_K mas 0,9 %).
- GPU recomendadas: no especificadas en la informacion disponible; por tamano, JQ3_K y JQ4_K caben en GPUs de consumo de 6-8 GB, y JQ5_K/JQ6_K en GPUs de 8-12 GB. Para el modelo denso en F16 se requeriria hardware de mayor capacidad (no cuantificado en la informacion).
- Cabe en GPU de consumo: si, en niveles JQ3_K a JQ5_K para ambos modelos; JQ6_K tambien en GPUs de 8 GB o mas.
- Opciones de despliegue: exclusivamente el fork de llama.cpp del autor (rama iqX_k-cpu, PR #30715). No funciona con llama.cpp estandar, por lo que tampoco con las versiones habituales de Ollama, vLLM o TGI salvo que incorporen dicho PR.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa de formatos de cuantizacion aplicados al mismo modelo base (K2-Horizon-7B, denso):

| Formato | Tamano (GiB) | KLD media | KLD 99 % | Top-1 agree | Disponibilidad |
|---|---|---|---|---|---|
| Q3_K | 4,81 | 0,179783 | 1,228516 | 80,049 % | llama.cpp estandar |
| JQ3_K | 4,81 | 0,077597 | 0,613978 | 86,738 % | fork con PR #30715 |
| Q4_K | 5,67 | 0,023664 | 0,189978 | 92,714 % | llama.cpp estandar |
| JQ4_K | 5,67 | 0,018849 | 0,154974 | 93,437 % | fork con PR #30715 |
| Q5_K | 6,48 | 0,007991 | 0,070236 | 95,910 % | llama.cpp estandar |
| JQ5_K | 6,48 | 0,006624 | 0,056235 | 96,262 % | fork con PR #30715 |

Comparativa de modelos base subyacentes:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| K2-Horizon-7B | denso | ~7B | no disponible | no disponible | Hugging Face (IFM) |
| LFM2.5-8B-A1B | MoE | ~8B totales, 1B activos | no disponible | no disponible | Hugging Face (LiquidAI) |

No se dispone de datos de benchmarks de tareas para comparar con alternativas de la misma categoria funcional.

## Limitaciones y advertencias

- No es compatible con llama.cpp estandar: requiere el fork del autor con el PR #30715. Cualquier intento de carga con herramientas convencionales fallara.
- JQ2_K empeora la calidad respecto a Q2_K en ambos modelos: +5,2 % de KLD media en el denso y +15,6 % en el MoE, con perdida de top-1 agreement (−1,01 pp y −2,04 pp). No se recomienda su uso en produccion.
- Repositorio experimental: los formatos no estan integrados en la rama principal de llama.cpp y su soporte futuro no esta garantizado.
- Solo ingles declarado; el rendimiento en otros idiomas no esta evaluado.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; dependen del modelo base y de la cuantizacion aplicada.
- Las metricas publicadas (KLD, PPL, top-1) miden fidelidad respecto al modelo F16, no calidad en tareas reales; no sustituyen a evaluaciones de MMLU, HumanEval o GSM8K.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base IFM/K2-Horizon-7B y LiquidAI/LFM2.5-8B-A1B pueden tener condiciones propias que deben verificarse por separado.
- El repositorio ocupa 361,1 GB, lo que exige planificacion de almacenamiento para su descarga completa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/eaddario/JQ2_K-JQ6_K-Test-Models
- Modelo base K2-Horizon-7B: https://huggingface.co/IFM/K2-Horizon-7B
- Modelo base LFM2.5-8B-A1B: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Dataset de calibracion imatrix: https://huggingface.co/datasets/eaddario/imatrix-calibration
- Fork de llama.cpp con los tipos JQ_K: https://github.com/EAddario/llama.cpp/tree/iqX_k-cpu
- Pull request de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/30715
- Repositorio principal de llama.cpp: https://github.com/ggml-org/llama.cpp
