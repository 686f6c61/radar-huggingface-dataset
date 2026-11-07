# nathaninline/Qwen3.8-Flash-Next-UD-IQ2_XS-Basalt

## Resumen
Qwen3.8-Flash-Next UD-IQ2_XS (L4 fix) for Basalt es una cuantizacion GGUF del modelo Qwen3.8-Flash-Next, desarrollada por el usuario nathaninline a partir del trabajo de Unsloth. El modelo base es un transformer de tipo Mixture of Experts (MoE) con 176.943.899.520 parametros totales, publicado por el equipo Qwen. Esta ficha cubre especificamente la version cuantizada IQ2_XS, que reduce el peso a unos 75,7 GB en GGUF y 74,3 GiB en formato propietario `.basalt`.

El problema que resuelve esta variante es concreto: la cuantizacion UD-IQ2_XS original de Unsloth usa el formato Q5_0 en la capa 4 (`ffn_down_exps`), formato que los kernels del motor Basalt no cubren, lo que desactiva la ruta rapida de decodificacion para todo el modelo y reduce el rendimiento en torno al 25%. nathaninline re-cuantiza unicamente ese tensor a IQ4_NL, manteniendo los otros 1.223 tensores intactos, de modo que el motor Basalt puede usar su tail planificado en dispositivo y sus kernels agrupados.

La relevancia actual radica en que permite ejecutar un MoE de ~177.000 millones de parametros en una unica GPU de consumo (RTX 5060 Ti de 16 GB) con decodificacion de ~84 tok/s y perplexity dentro del 0,6% del modelo BF16, gracias a la combinacion de cuantizacion agresiva, cache de expertos en RAM paginada y decodificacion especulativa MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts), modelo base Qwen3.8-Flash-Next |
| Parametros totales | 176.943.899.520 |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (configuracion de referencia con KV int8) |
| Tipos de cuantizacion | UD-IQ2_XS (Dynamic v3.1) con un tensor re-cuantizado de Q5_0 a IQ4_NL; KV cache int8 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (qwen-community-1.0) |
| Formato de pesos | GGUF (3 shards, `qwen4exp`) y `.basalt` (formato version 2, motor 0.3+) |

## Arquitectura y entrenamiento
El modelo base Qwen3.8-Flash-Next es un transformer MoE. Segun el repositorio oficial en GitHub, la version 3.8 introduce mejoras sistematicas en cuatro frentes: atencion, residual, embedding y optimizacion, con el objetivo de mejorar capacidad y eficiencia computacional, capacidad del modelo y estabilidad de entrenamiento. No se dispone en la informacion proporcionada de datos sobre numero de tokens de entrenamiento, composicion del dataset ni si se aplicaron RLHF o DPO.

La innovacion tecnica destacable de esta ficha no esta en el entrenamiento sino en el empaquetado para inferencia. El pack `.basalt` se construyo con `tools/convert/convert.py --compat-bf16 --sections-from` a partir del pack oficial `GSQ-RCO-IQ3_XXS`, de modo que el drafter MTP (multi-token prediction) y el proyector de vision son secciones oficiales de Basalt, byte a byte. Esto habilita decodificacion especulativa con tasas de aceptacion de drafts del 58-78% segun el tipo de prompt, y vision dinamica, sobre un modelo cuantizado a ~2 bits por peso en la mayoria de tensores. La re-cuantizacion de la capa 4 pasa de 5,5 a 4,5 bits por peso en ese tensor y restaura la ruta rapida del motor (0% de expertos enrutados leidos por PCIe).

## Capacidades
- Generacion de texto conversacional multi-turno, con modo conversacional declarado en las etiquetas del repositorio.
- Razonamiento y explicacion de conceptos: los datos de velocidad incluyen prompts de explicacion con decodificacion de 77,5-81,4 tok/s.
- Generacion de codigo: prompts de codigo Python alcanzan 96-97,6 tok/s con la mayor tasa de aceptacion de drafts (74-78%).
- Vision: el pack incluye el proyector de vision oficial de Basalt, configurable como `"vision": "dynamic"`.
- Decodificacion especulativa mediante drafter MTP integrado en el pack.
- Soporte de contexto largo: hasta 131.072 tokens con KV cache int8.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas), lo que sugiere integracion con APIs tipo OpenAI.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso
- Asistente de codigo en estaciones de trabajo con GPU de consumo: con una RTX 5060 Ti de 16 GB y ~84 tok/s medios (96-97 tok/s en codigo Python), el modelo puede sostener sesiones de autocompletado y generacion de funciones con latencia interactiva, usando el contexto de 131.072 tokens para mantener visible un repositorio o varios ficheros relacionados.
- Analisis de documentos largos con vision: el proyector de vision dinamico y la ventana de 131.072 tokens permiten procesar PDFs escaneados, capturas de pantalla o diagramas junto a texto extenso, por ejemplo para extraccion de datos de informes tecnicos.
- Despliegue local con presupuesto de VRAM ajustado: el formato IQ2_XS (~2 bits medios) y la cache de expertos en RAM paginada permiten servir un MoE de 177.000 millones de parametros en hardware de gama media, con 37,8 GiB de expertos residentes en RAM en una maquina de 46 GB.
- Procesamiento por lotes de prompts largos: la lectura de prompts a 1.571-2.279 tok/s (hasta ~85K tokens en 38,5 s de time to first token) hace viable la clasificacion, resumen o extraccion sobre documentos de decenas de miles de tokens en pipelines offline.
- Generacion de narrativa y contenido creativo: los prompts de historia decodifican a 75,3-75,4 tok/s con 82-84% de aciertos de expertos en VRAM, adecuado para borradores largos generados localmente sin coste por token.
- Experimentacion e investigacion en cuantizacion: al ser una variante con un unico tensor modificado y perplexity medida (3,293 ± 0,041 en wikitext-2), sirve como caso controlado para estudiar el impacto de formatos de quant en kernels especificos y en la ruta de decodificacion.
- Sustitucion de APIs en entornos con requisitos de privacidad: al ejecutarse integramente en local con Basalt (`basalt serve`), permite atender consultas conversacionales sin enviar datos a terceros, sujeto a los terminos de la Qwen Community License 1.0.

## Benchmarks y rendimiento
Perplexity en wikitext-2 (test), 100 chunks de 512 tokens, medida con `tools/ppl_gate.py` de Basalt (T 3, KV int8):

| Modelo | Tamano | PPL | vs BF16 |
|---|---:|---:|---:|
| BF16 (cifra oficial de Basalt) | 354 GB | 3,273 | - |
| UD-IQ2_XS L4fix (este repo) | 74,3 GiB | 3,293 ± 0,041 | +0,6% |
| UD-Q4_K_XL (cifra oficial de Basalt) | 106,7 GiB | 3,321 | +1,5% |
| GSQ-RCO IQ3_S (cifra oficial de Basalt) | 81,0 GiB | 3,383 | +3,4% |
| GSQ-RCO IQ3_XXS (medido aqui) | 74,4 GiB | 3,472 ± 0,046 | +6,1% |

El GGUF equivalente lee PPL 3,2803 ± 0,041 en `llama-perplexity` con el mismo texto y troceado. La cifra medida de GSQ-RCO IQ3_XXS (3,472) coincide con su cifra oficial (3,469), lo que valida la configuracion de medida.

Recuperacion media sobre 12 benchmarks (segun las graficas de Unsloth para el fichero original, no para este): 99,4% para UD-IQ2_XS frente a 96,8% para GSQ-RCO IQ3_XXS.

Rendimiento de inferencia en una RTX 5060 Ti 16 GB (PCIe 4.0 x8, 14 GB/s host-device), Ryzen 9 3900X, 46 GB DDR4, Linux, Basalt 0.3, contexto 131.072 con KV int8, vision activa:

| Prompt | tok/s (decodificacion) | Drafts aceptados | Aciertos de expertos en VRAM |
|---|---:|---:|---:|
| Historia | 75,3 / 75,4 | 58% | 82-84% |
| Codigo Python | 97,6 / 96,0 | 74-78% | 71% |
| Explicacion | 77,5 / 81,4 | 58-62% | 78-79% |
| Media | ~84 | | |

Lectura de prompt (prompt nuevo, dos ejecuciones):

| Prompt | tok/s | Time to first token |
|---|---:|---:|
| ~2K tokens | 1.571 | 1,4 s |
| ~11K tokens | 2.109 / 2.119 | 5,3 s |
| ~25K tokens | 2.089 / 2.279 | 11-12 s |
| ~85K tokens | 2.200 / 2.206 | 38,5 s |

Antes del fix, la misma cuantizacion de Unsloth decodificaba a 61-75 tok/s (media ~65) con 4-8% de expertos enrutados por PCIe.

## Requisitos de hardware
- VRAM: el pack `.basalt` ocupa 74,3 GiB en disco; en la configuracion de referencia con 46 GB de RAM, unos 37,8 GiB de expertos quedan residentes en RAM paginada y el resto se lee desde SSD o se intercambia de forma adaptativa. Cabe en una GPU de 16 GB (RTX 5060 Ti) porque los expertos no residentes se sirven desde host.
- GPU recomendadas: RTX 5060 Ti 16 GB es la configuracion medida. GPU con mas VRAM (RTX 4090 24 GB, A100, H100) permitirian mantener mas expertos en dispositivo y reducir lecturas por PCIe, aunque no se han publicado medidas para esas tarjetas.
- RAM: se recomienda dejar margen sobre `resident-budget-gib` para los swaps adaptativos de Basalt; llenar toda la RAM disponible hace la decodificacion mas lenta, no mas rapida. En maquinas con menos de 46 GB cabe esperar lecturas desde SSD.
- Despliegue: Basalt 0.3 o superior (formato `.basalt` version 2) mediante `basalt serve --config config.json`. El GGUF de 75,7 GB es compatible con builds de llama.cpp y motores que lean el formato `qwen4exp`.
- Latencia y throughput: ~84 tok/s medios de decodificacion y 1.571-2.279 tok/s de lectura de prompt en la configuracion medida; time to first token de 1,4 s para ~2K tokens y 38,5 s para ~85K tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL (wikitext-2) | Tamano | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|---|
| Este repo (UD-IQ2_XS L4fix) | 176.943.899.520 | 131.072 | 3,293 ± 0,041 | 74,3 GiB (.basalt) / 75,7 GB (GGUF) | Qwen Community 1.0 | Hugging Face (nathaninline) |
| Unsloth UD-IQ2_XS original | 176.943.899.520 | no disponible | no disponible (mismo orden, ruta rapida desactivada) | ~75,7 GB (GGUF) | Qwen Community 1.0 | Hugging Face (unsloth) |
| GSQ-RCO IQ3_XXS (Basalt oficial) | 176.943.899.520 | 131.072 (pack Basalt) | 3,472 ± 0,046 | 74,4 GiB | Qwen Community 1.0 | Hugging Face (jesdga) |
| UD-Q4_K_XL (Basalt oficial) | 176.943.899.520 | 131.072 (pack Basalt) | 3,321 | 106,7 GiB | Qwen Community 1.0 | Hugging Face (jesdga) |

## Limitaciones y advertencias
- La perplexity de la capa re-cuantizada no se midio por separado; las cifras de calidad incluyen ese tensor y no aislan su efecto.
- Las cifras de recuperacion en 12 benchmarks (99,4%) corresponden al fichero original de Unsloth, no a este repositorio.
- El rendimiento medido (~84 tok/s) depende de una configuracion concreta (RTX 5060 Ti, PCIe 4.0 x8, 46 GB DDR4, Basalt 0.3); en otras maquinas, especialmente con menos RAM o peor PCIe, la decodificacion puede caer por lecturas de expertos desde SSD.
- La cuantizacion a ~2 bits medios implica perdida de calidad respecto al BF16; el fabricante reporta +0,6% de perplexity, pero tareas de razonamiento o codigo pueden degradarse de forma no uniforme.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es esperable en un modelo de este tamano y cuantizacion, y debe mitigarse con verificacion externa en produccion.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Idiomas soportados: no disponibles; la model card no declara cobertura linguistica.
- Licencia Qwen Community License 1.0: el uso comercial esta sujeto a los terminos del modelo base; conviene revisarlos antes de desplegar.
- El pack `.basalt` requiere Basalt 0.3+ y el formato version 2; no es portable a otros motores, que deberan usar los shards GGUF.
- El ajuste de `resident-budget-gib` es critico: reservar toda la RAM disponible elimina el espacio para swaps adaptativos y reduce el throughput.

## Enlaces
- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/nathaninline/Qwen3.8-Flash-Next-UD-IQ2_XS-Basalt
- Modelo base Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Cuantizacion original de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Guia de Unsloth para Qwen3.8-Flash-Next: https://unsloth.ai/docs/models/qwen3.8-next
- Motor Basalt: https://github.com/jesdga95/basalt
- Pack Basalt oficial: https://huggingface.co/jesdga/Qwen3.8-Flash-Next-Basalt
- Licencia Qwen Community 1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
