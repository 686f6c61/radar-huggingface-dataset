# eaddario/IQ2_K-IQ6_K-Test-Models

## Resumen

`eaddario/IQ2_K-IQ6_K-Test-Models` no es un modelo de lenguaje en sentido estricto, sino un repositorio experimental de cuantizaciones GGUF publicadas por el usuario eaddario para comparar el esquema de cuantización estándar de `llama.cpp` (familias Q2_K a Q6_K) frente a un fork propio que introduce cinco tipos de super-bloque no lineales denominados JQ2_K, JQ3_K, JQ4_K, JQ5_K y JQ6_K. El repositorio cuantiza dos modelos base distintos: `IFM/K2-Horizon-7B` (denso, ~9.000 millones de parámetros) y `LiquidAI/LFM2.5-8B-A1B` (MoE).

El interés técnico reside en que los nuevos tipos JQ3_K, JQ4_K y JQ5_K ocupan exactamente el mismo número de bytes por bloque que sus equivalentes K-quant (110, 144 y 176 bytes por 256 pesos respectivamente), pero reducen el error de cuantización de forma medible: en K2-Horizon-7B, JQ3_K rebaja el KLD medio un 56,8% y JQ6_K un 55,7%; en el MoE LFM2.5-8B-A1B las mejoras oscilan entre el 13,8% y el 23,2%. JQ2_K es la excepción y empeora en ambos modelos.

La relevancia práctica es doble: por un lado, documenta una vía para mejorar la fidelidad de cuantizaciones de bajo bit sin aumentar el tamaño del fichero; por otro, advierte de que estos ficheros **no funcionan con `llama.cpp` estándar** y requieren el fork `EAddario/llama.cpp` (rama `iqX_k-cpu`), lo que limita su uso en producción hasta que el PR #30715 se fusione.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Repositorio de cuantizaciones GGUF sobre dos modelos base: K2-Horizon-7B (denso) y LFM2.5-8B-A1B (MoE) |
| Parametros totales | 8.999.178.240 (dato real de safetensors) |
| Parametros activos | no disponible (el modelo base MoE se denomina A1B, pero no se detalla el conteo activo en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | JQ2_K, JQ3_K, JQ4_K, JQ5_K, JQ6_K (no lineales, fork) frente a Q2_K, Q3_K, Q4_K, Q5_K, Q6_K (estandar) |
| Idiomas soportados | en (segun model card); el resto no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 330,6 GB con todos los ficheros de test) |

## Arquitectura y entrenamiento

El repositorio no entrena modelos: publica artefactos de cuantizacion. Los tipos JQ* son super-bloques no lineales de 256 pesos con un codebook de niveles fijo (4, 8, 16, 32 y 64 niveles para JQ2_K a JQ6_K respectivamente) y un payload de indices identico al de su contrapartida K-quant. La diferencia esta en como se asigna el presupuesto de bits: mientras Q2_K usa 84 bytes por bloque (64 de payload + 20 de metadatos), JQ2_K usa 76 bytes (64 + 12); JQ3_K, JQ4_K y JQ5_K mantienen exactamente el mismo tamano que Q3_K, Q4_K y Q5_K, y JQ6_K crece ligeramente (212 frente a 210 bytes).

Las cuantizaciones se generaron con la misma receta, la misma imatrix (`eaddario/imatrix-calibration`) y los mismos parametros que las versiones estandar, de modo que las diferencias de calidad medidas se atribuyen exclusivamente al formato de cuantizacion. La evaluacion se realiza con metricas de divergencia respecto al modelo en F16: KLD medio, KLD al percentil 99, RMS de la diferencia de probabilidades y acuerdo top-1.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Distribucion de pesos GGUF listos para inferencia con el fork de `llama.cpp` indicado.
- Comparacion controlada de calidad de cuantizacion mediante KLD, PPL y acuerdo top-1.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- Soporte multilingue: solo `en` declarado en la model card.
- No se documentan tool calling, agentes, vision ni modo thinking en la informacion disponible.

## Casos de uso

- Evaluacion de esquemas de cuantizacion: usar los pares Q*_K / JQ*_K sobre el mismo modelo base para medir la perdida de fidelidad con KLD y decidir que formato conviene desplegar en un presupuesto de bytes dado.
- Despliegue en entornos con memoria muy ajustada: JQ3_K ofrece en K2-Horizon-7B un KLD medio de 0,077597 frente a 0,179783 de Q3_K con el mismo tamano de fichero (4,81 GiB), lo que permite servir un modelo de ~9B en GPUs de 8 GB con una perdida de calidad notablemente menor.
- Sustitucion directa de ficheros Q3_K, Q4_K y Q5_K en pipelines existentes: al conservar el mismo tamano de bloque, basta con cambiar el binario por el fork y apuntar al nuevo fichero, sin tocar la infraestructura de almacenamiento.
- Investigacion sobre cuantizacion no lineal: el repositorio sirve como referencia reproducible (misma imatrix, misma receta) para validar codebooks de 4 a 64 niveles en super-bloques de 256 pesos.
- Pruebas de regresion de calidad en CI: comparar top-1 agreement y KLD entre versiones de un cuantizador antes de publicar un release de pesos.
- Validacion en modelos MoE: LFM2.5-8B-A1B permite estudiar como se comportan los nuevos tipos cuando solo una fraccion de los parametros se activa por token, un regimen distinto al denso.

## Benchmarks y rendimiento

Resultados publicados en la model card. K2-Horizon-7B (denso):

| Metrica | Q3_K | JQ3_K | Q4_K | JQ4_K | Q5_K | JQ5_K |
|---|---|---|---|---|---|---|
| Tamano (GiB) | 4,81 | 4,81 | 5,67 | 5,67 | 6,48 | 6,48 |
| PPL Δ% vs F16 | +17,17% | +6,29% | +1,62% | +1,36% | +0,39% | +0,35% |
| KLD medio | 0,179783 | 0,077597 (−56,8%) | 0,023664 | 0,018849 (−20,3%) | 0,007991 | 0,006624 (−17,1%) |
| KLD 99% | 1,228516 | 0,613978 (−50,0%) | 0,189978 | 0,154974 (−18,4%) | 0,070236 | 0,056235 (−19,9%) |
| Δp RMS | 10,888% | 7,167% (−34,2%) | 3,895% | 3,461% (−11,1%) | 2,290% | 2,097% (−8,4%) |
| Top-1 agree | 80,049% | 86,738% (+6,69 pp) | 92,714% | 93,437% (+0,72 pp) | 95,910% | 96,262% (+0,35 pp) |

LFM2.5-8B-A1B (MoE):

| Metrica | Q3_K | JQ3_K | Q4_K | JQ4_K | Q5_K | JQ5_K |
|---|---|---|---|---|---|---|
| Tamano (GiB) | 3,55 | 3,55 | 4,56 | 4,56 | 5,52 | 5,52 |
| PPL Δ% vs F16 | +15,45% | +13,37% | +2,94% | +2,82% | +3,39% | +0,37% |
| KLD medio | 0,459857 | 0,361761 (−21,3%) | 0,179660 | 0,152481 (−15,1%) | 0,100963 | 0,087039 (−13,8%) |
| KLD 99% | 2,428714 | 2,047217 (−15,7%) | 1,116902 | 0,937650 (−16,0%) | 0,682244 | 0,605067 (−11,3%) |
| Δp RMS | 13,015% | 11,699% (−10,1%) | 8,270% | 7,490% (−9,4%) | 6,131% | 5,705% (−6,9%) |
| Top-1 agree | 68,059% | 70,906% (+2,85 pp) | 78,821% | 80,403% (+1,58 pp) | no disponible | no disponible |

Resumen de variaciones Q*_K → JQ*_K publicado por el autor:

| Conversion | K2-Horizon-7B (KLD medio) | LFM2.5-8B-A1B (KLD medio) |
|---|---|---|
| Q2_K → JQ2_K | +5,2% (empeora) | +15,6% (empeora) |
| Q3_K → JQ3_K | −56,8% | −21,3% |
| Q4_K → JQ4_K | −20,3% | −15,1% |
| Q5_K → JQ5_K | −17,1% | −13,8% |
| Q6_K → JQ6_K | −55,7% | −23,2% |

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun tamano de fichero publicado: JQ3_K de K2-Horizon-7B ocupa 4,81 GiB y JQ3_K de LFM2.5-8B-A1B 3,55 GiB; JQ4_K, 5,67 y 4,56 GiB; JQ5_K, 6,48 y 5,52 GiB. Sumar overhead de contexto y cache KV.
- GPU consumer: las variantes JQ3_K y JQ4_K caben en GPUs de 8 GB en el caso del MoE y en 8-12 GB en el denso; JQ5_K requiere 8-12 GB en el MoE y 12 GB o mas en el denso.
- GPU profesionales: A100, H100 y RTX 4090 son adecuadas para todas las variantes; no se publican cifras de latencia ni throughput.
- Despliegue: **no funciona con `llama.cpp` estandar**; requiere el fork `EAddario/llama.cpp`, rama `iqX_k-cpu` (PR #30715). No se documenta soporte en vLLM, TGI, Ollama ni otros runners.
- No se dispone de datos de latencia o tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

La comparativa natural es entre el esquema JQ*_K y el esquema K-quant estandar de `llama.cpp` sobre el mismo modelo base:

| Esquema | Bytes por bloque de 256 pesos | Niveles de codebook | KLD medio (K2-Horizon-7B, nivel 3) | KLD medio (LFM2.5-8B-A1B, nivel 3) |
|---|---|---|---|---|
| Q3_K | 110 | 8 | 0,179783 | 0,459857 |
| JQ3_K | 110 | 8 | 0,077597 | 0,361761 |
| Q4_K | 144 | 16 | 0,023664 | 0,179660 |
| JQ4_K | 144 | 16 | 0,018849 | 0,152481 |
| Q5_K | 176 | 32 | 0,007991 | 0,100963 |
| JQ5_K | 176 | 32 | 0,006624 | 0,087039 |
| Q6_K | 210 | 64 | no disponible en tabla resumen | no disponible en tabla resumen |
| JQ6_K | 212 | 64 | no disponible en tabla resumen | no disponible en tabla resumen |

Frente a otros formatos de cuantizacion (GPTQ, AWQ, EXL2) no se ofrece comparacion en la informacion disponible.

## Limitaciones y advertencias

- Los ficheros **no son compatibles con `llama.cpp` estandar**; solo funcionan con el fork del autor. Cualquier despliegue en produccion depende de mantener ese fork.
- JQ2_K empeora la calidad respecto a Q2_K en ambos modelos (KLD medio +5,2% en el denso y +15,6% en el MoE) y reduce el tamano un 4,9% y un 8,6% respectivamente; no se recomienda su uso.
- Repositorio marcado como `experimental`; los resultados pueden no ser reproducibles fuera del entorno del autor.
- Solo se declara idioma `en`; no hay evaluacion multilingue.
- El repositorio pesa 330,6 GB por acumular todas las variantes de ambos modelos base; la descarga completa es poco practica.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible; heredados del modelo base correspondiente.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia del fork introduce riesgo de mantenimiento y de cambios incompatibles.
- No se publican datos de contexto maximo, tool calling ni rendimiento en tareas downstream.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/eaddario/IQ2_K-IQ6_K-Test-Models
- Modelo base denso: https://huggingface.co/IFM/K2-Horizon-7B
- Modelo base MoE: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Dataset de calibracion imatrix: https://huggingface.co/datasets/eaddario/imatrix-calibration
- Fork de llama.cpp: https://github.com/EAddario/llama.cpp/tree/iqX_k-cpu
- Pull request con los nuevos tipos: https://github.com/ggml-org/llama.cpp/pull/30715
