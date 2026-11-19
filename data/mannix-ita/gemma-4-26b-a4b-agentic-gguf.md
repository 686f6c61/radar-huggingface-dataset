# ManniX-ITA/gemma-4-26B-A4B-agentic-GGUF

## Resumen

Gemma-4-26B-A4B-agentic-GGUF es la distribucion en formato GGUF del modelo ManniX-ITA/gemma-4-26B-A4B-agentic, un ajuste fino supervisado (SFT) sobre google/gemma-4-26B-A4B-it orientado a corregir el bucle degenerado que el modelo base presenta en tareas agenticas de contexto largo. El autor, ManniX-ITA, parte de las respuestas regeneradas y sin bucle del propio modelo y realiza una recuperacion en BF16, manteniendo arquitectura, tokenizer y plantilla de chat identicos al original. El resultado es un modelo Mixture-of-Experts (MoE) de 25.233.142.046 parametros totales con aproximadamente 4B activos por token, segun la nomenclatura A4B.

La relevancia de esta publicacion no esta solo en el ajuste, sino en el metodo de cuantizacion. Cada nivel del escalado GGUF se ha re-redondeado con K-FAC (aproximacion Kronecker-factored de la curvatura de Fisher) aplicada a los pesos MLP, manteniendo el mismo tamano de archivo y el mismo formato que el tier equivalente de `llama-quantize`, pero reduciendo el error de cuantizacion entre un 5,5 % y un 24,4 % segun el nivel medido en KL respecto al profesor BF16. Es una propuesta interesante para quien despliega modelos MoE en hardware limitado y quiere exprimir cada bit.

El repositorio ocupa 359,8 GB e incluye toda la escalera de cuantizaciones, desde Q8_0 hasta el nivel de 2 bits (IQ2_XXS) entrenado por destilacion con reconocimiento de cuantizacion. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), familia Gemma 4, variante A4B |
| Parametros totales | 25.233.142.046 (25,23B) |
| Parametros activos | aproximadamente 4B por token (denominacion A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, IQ4_NL, Q3_K_M, IQ2_XXS (estudiante QAD), entre otros niveles de la escalera |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con F16 de referencia y BF16 base |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base google/gemma-4-26B-A4B-it: un transformer con capas MoE en las que se activan aproximadamente 4B parametros de los 25,23B totales por token. El ajuste fino de ManniX-ITA se plantea como una recuperacion SFT en BF16 sobre las respuestas regeneradas y sin bucle del propio modelo, es decir, un proceso de auto-destilacion correctiva orientada a eliminar el comportamiento de bucle en tareas agenticas prolongadas. Los datos de entrenamiento declarados incluyen el dataset propio ManniX-ITA/gemma-4-26B-A4B-agentic-sft, trazas de agente Hermes (hermes-agent-kimi-traces-gemma4-31b, interstellarninja/hermes_reasoning_tool_use, lambda/hermes-agent-reasoning-traces) y una bateria de datasets Nemotron de NVIDIA: Agentic-v2, OpenCode-v1, SWE-v2, Competitive-Programming-v2, Instruction-Following-Chat-v1 y v2, Math-v3, Science-v1 y Multilingual-v1. No se especifica el numero total de tokens de entrenamiento ni si hubo fases de RLHF o DPO.

La innovacion tecnica destacable esta en la cadena de cuantizacion. Se usa una imatrix (`imatrix.gguf`, sha256 80e56b9b…) recolectada por el propio run QAD del modelo desde el profesor BF16 sobre 258 chunks de 16.384 tokens del corpus agentico sft11, por experto. Sobre esa base se genera el tier stock con `llama-quantize --imatrix` aplicando la regla de atencion A4B (proyecciones attn_q/k/v/output en Q8_0 desde Q4_K_M hacia arriba y Q6_K por debajo). Despues, `omk_qad.kfac_round` re-redondea cada tensor MLP (gate_up y down de expertos enrutados, y gate/up/down densos) mediante GPTQ en el bloque de 256 columnas del propio encoder, usando la curvatura Kronecker-factored H ≈ G ⊗ A calculada sobre 512 ventanas de 2.048 tokens con las posiciones de attention sink excluidas. El archivo resultante es una copia byte a byte del stock con los payloads MLP sustituidos: mismos tipos de tensor, mismo numero de bytes y mismos metadatos. Cada archivo K-FAC se publica solo si supera a su gemelo stock en la evaluacion twin score sobre 44 ventanas held-out (614.086 posiciones de asistente) contra el top-64 del profesor BF16, midiendo KL top-256 y acuerdo top-1.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat compatible con el modelo base.
- Razonamiento agentico multi-paso, con enfasis explicito en evitar bucles en tareas largas.
- Tool calling y function calling, entrenado sobre trazas de agente Hermes y datasets agenticos de NVIDIA.
- Razonamiento con trazas explicitas (thinking/reasoning traces) segun los datasets de entrenamiento.
- Capacidades de codigo y SWE derivadas de Nemotron OpenCode-v1 y SWE-v2.
- Programacion competitiva, segun Nemotron-SFT-Competitive-Programming-v2.
- Matematicas, con Nemotron-SFT-Math-v3.
- Razonamiento cientifico, con Nemotron-Science-v1.
- Seguimiento de instrucciones conversacional, con Nemotron-Instruction-Following-Chat v1 y v2.
- Soporte multilingue limitado al entrenamiento con Nemotron-SFT-Multilingual-v1; el unico idioma declarado oficialmente es el ingles.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con Ollama mediante el repositorio mannix/gemma4-26b-agentic.
- Decodificacion especulativa con el drafter asistente de Gemma-4 y presupuesto de pensamiento en las variantes `mtp-` para xOllama.

## Casos de uso

- Agentes autonomos de larga duracion: el ajuste esta disenado especificamente para evitar el bucle degenerado del modelo base en tareas agenticas prolongadas, por lo que encaja en pipelines de agentes que encadenan decenas de pasos con tool calling.
- Automatizacion de ingenieria de software: con entrenamiento sobre Nemotron SWE-v2 y OpenCode-v1, el modelo puede integrarse en flujos de resolucion de issues, generacion de parches y revision de codigo dentro de un IDE o CI/CD.
- Asistente de terminal y operaciones: el soporte de function calling permite exponer herramientas de shell, ficheros o APIs y dejar que el modelo planifique y ejecute secuencias multi-paso.
- Razonamiento matematico y cientifico asistido: util para tutoria tecnica, resolucion de problemas de competicion y explicacion de conceptos cientificos, aprovechando los datasets Nemotron Math-v3 y Science-v1.
- Despliegue en hardware de consumo: los niveles Q4_K_M (17,33 GB), IQ4_XS (14,24 GB) y Q3_K_M (13 GB aproximadamente) permiten ejecutar un MoE de 25B en GPU consumer de 16-24 GB con llama.cpp u Ollama, algo inviable con el modelo en BF16.
- Servicio de chat con contexto agentico en produccion: los niveles Q6_K (22,91 GB) y Q8_0 (26,86 GB) ofrecen KL top-256 de 0,00259 y 0,00223 respectivamente, adecuados para servir via vLLM o TGI en GPU de datacenter cuando se necesita maxima fidelidad al profesor.
- Evaluacion de tecnicas de cuantizacion: la publicacion incluye la metodologia completa (imatrix, K-FAC, twin score) y los scripts en omk-model-optimizer, lo que la convierte en una referencia practica para investigar cuantizacion de MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica publicada es la evaluacion twin score de fidelidad respecto al profesor BF16, medida como KL top-256 y acuerdo top-1 sobre 44 ventanas held-out:

| Tier | Metodo | Atencion | Tamano | bpw | KL / top-1 stock | KL / top-1 K-FAC | Delta KL |
|---|---|---|---:|---:|---:|---:|---:|
| Q8_0 | K-FAC | Q8_0 | 26,86 GB | 8,52 | 0,00236 / 0,9893 | 0,00223 / 0,9895 | -5,5 % |
| Q6_K | K-FAC | Q8_0 | 22,91 GB | 7,26 | 0,00280 / 0,9881 | 0,00259 / 0,9887 | -7,5 % |
| Q5_K_M | K-FAC | Q8_0 | 19,54 GB | 6,19 | 0,00419 / 0,9855 | 0,00376 / 0,9863 | -10,3 % |
| Q5_K_S | K-FAC | Q8_0 | 18,40 GB | 5,83 | 0,00456 / 0,9847 | 0,00408 / 0,9858 | -10,5 % |
| Q4_K_M | K-FAC | Q8_0 | 17,33 GB | 5,49 | 0,00798 / 0,9796 | 0,00660 / 0,9815 | -17,3 % |
| Q4_K_S | K-FAC | Q6_K | 15,75 GB | 4,99 | 0,01019 / 0,9766 | 0,00882 / 0,9788 | -13,5 % |
| IQ4_XS | K-FAC | Q6_K | 14,24 GB | 4,51 | 0,01530 / 0,9715 | 0,01157 / 0,9751 | -24,4 % |
| IQ4_NL | K-FAC | Q6_K | 14,73 GB | 4,67 | 0,01495 / 0,9717 | 0,01159 / 0,9753 | -22,5 % |

No se dispone de datos para los niveles Q3_K_M e IQ2_XXS en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: Q8_0 requiere unos 27 GB, Q6_K unos 23 GB, Q5_K_M unos 20 GB, Q4_K_M unos 17,5 GB, IQ4_XS unos 14,5 GB y Q3_K_M en torno a 13 GB, sin contar el contexto KV.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 y Q6_K en servicio; L40S o RTX 6000 Ada (48 GB) para Q5_K_M y Q4_K_M con contexto amplio; RTX 4090 (24 GB) para Q4_K_M y Q4_K_S; RTX 4080/4070 Ti Super (16 GB) para IQ4_XS, IQ4_NL y Q3_K_M.
- Cabe en GPU consumer: si, en tarjetas de 16 GB o mas con los niveles de 4 bits y en 24 GB con Q4_K_M y Q5_K_S. El nivel IQ2_XXS esta pensado para escenarios de VRAM mas ajustada, aunque su tamano exacto no consta en la informacion disponible.
- Opciones de despliegue: llama.cpp (version b12386 usada para las cuantizaciones), Ollama (repositorio mannix/gemma4-26b-agentic), vLLM y TGI para los niveles mayores en GPU de datacenter, y xOllama con decodificacion especulativa mediante el drafter asistente de Gemma-4 en las variantes `mtp-`.
- Latencia y throughput estimados: no disponibles. Al ser un MoE con aproximadamente 4B parametros activos, el coste por token deberia aproximarse al de un modelo denso de ese orden, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ManniX-ITA/gemma-4-26B-A4B-agentic-GGUF | 25,23B | ~4B | no disponible | Apache 2.0 | GGUF | Ajuste anti-bucle con cuantizacion K-FAC |
| google/gemma-4-26B-A4B-it | 25,23B | ~4B | no disponible | Gemma (terminos de Google) | safetensors | Modelo base original; sin el ajuste agentico |
| ManniX-ITA/gemma-4-26B-A4B-agentic | 25,23B | ~4B | no disponible | Apache 2.0 | safetensors (BF16) | Pesos completos del ajuste, sin cuantizar |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- El unico idioma declarado es el ingles; el rendimiento fuera de ese idioma no esta garantizado aunque se haya entrenado con Nemotron-SFT-Multilingual-v1.
- El ajuste esta orientado a mitigar bucles en tareas agenticas, pero no se han publicado evaluaciones independientes que confirmen la eliminacion completa del problema en produccion.
- Riesgo de alucinacion inherente a un modelo de 25B con SFT sobre trazas de agente; no se documentan mitigaciones especificas.
- La licencia Apache 2.0 aplica a esta distribucion, pero el modelo base google/gemma-4-26B-A4B-it esta sujeto a los terminos de Gemma de Google; conviene revisar la compatibilidad para uso comercial.
- Los niveles de 4 bits y menores introducen divergencia respecto al profesor BF16 (KL top-256 de 0,00660 en Q4_K_M y 0,01157 en IQ4_XS), lo que puede degradar tareas sensibles a la precision como razonamiento matematico o generacion de codigo largo.
- El nivel IQ2_XXS es un estudiante por destilacion con reconocimiento de cuantizacion, no una cuantizacion directa; su fidelidad puede diferir del resto de la escalera.
- No se publican datos de longitud de contexto, por lo que la planificacion de despliegue con ventanas largas debe validarse empiricamente.
- El repositorio ocupa 359,8 GB; descargar la escalera completa no es practico para la mayoria de entornos, conviene seleccionar un unico tier.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ManniX-ITA/gemma-4-26B-A4B-agentic-GGUF
- Modelo base ajustado (BF16): https://huggingface.co/ManniX-ITA/gemma-4-26B-A4B-agentic
- Modelo original de Google: https://huggingface.co/google/gemma-4-26B-A4B-it
- Dataset SFT propio: https://huggingface.co/datasets/ManniX-ITA/gemma-4-26B-A4B-agentic-sft
- Trazas Hermes Kimi Gemma 4 31B: https://huggingface.co/datasets/ManniX-ITA/hermes-agent-kimi-traces-gemma4-31b
- Herramienta de cuantizacion omk-model-optimizer: https://github.com/mann1x/omk-model-optimizer
- Documentacion de K-FAC rounding: https://github.com/mann1x/omk-model-optimizer/blob/omk-main/omk/docs/kfac-rounding.md
- Scripts del modelo: https://github.com/mann1x/omk-model-optimizer/tree/omk-main/omk/models/gemma-4-26b-a4b
- Repositorio Ollama: https://ollama.com/mannix/gemma4-26b-agentic
- xOllama (decodificacion especulativa): https://github.com/mann1x/xollama
