# FINAL-Bench/Darwin-4B-Genesis

## Resumen

Darwin-4B-Genesis es un modelo de lenguaje de 7.518 millones de parametros publicado por FINAL-Bench, presentado como la tercera generacion de la familia Darwin y descrito por sus autores como el primer caso de hibridacion evolutiva de capas FFN entre arquitecturas distintas: un transformer (Gemma 4) y una arquitectura Mamba con Gated DeltaNet (Qwen3.5). El modelo se obtiene sin entrenamiento adicional, mediante busqueda CMA-ES sobre un genoma de 42 dimensiones que fija ratios optimos de trasplante de FFN capa a capa, conservando al 100% las capas de atencion del progenitor transformer.

La propuesta resulta relevante porque ataca un problema abierto en el ecosistema abierto: como combinar conocimiento ya entrenado de modelos de familias arquitectonicas diferentes sin volver a entrenar. Frente a hibridos disenados desde cero (Jamba, Nemotron-H, Granite 4.0), el enfoque parte de dos checkpoints existentes y aplica merging evolutivo guiado por lo que los autores llaman "MRI-Trust-Weighted", documentado en el paper arXiv:2605.14386.

El modelo se distribuye con licencia Apache 2.0, soporta siete idiomas (coreano, ingles, chino, japones, aleman, frances y espanol) y esta orientado a generacion de texto y razonamiento multi-paso. Su interes practico esta en el eje coreano: declara un 92% en CLIcK (comprension cultural coreana) y un 70% en MuSR, con la afirmacion de superar a modelos de hasta 27B en esas tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Transformer (Gemma 4, atencion) x Mamba/Gated DeltaNet (Qwen3.5, FFN), con merging evolutivo capa a capa |
| Parametros totales | 7.518.069.034 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para este checkpoint (la familia publica GGUF Q8 en otros modelos) |
| Idiomas soportados | ko, en, zh, ja, de, fr, es |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo no se entrena: se construye por merging. Segun la model card, las capas de atencion del progenitor "padre" (Gemma 4, transformer) se preservan al 100%, mientras que las capas FFN del progenitor "madre" (Qwen3.5, con Gated DeltaNet de tipo Mamba) se trasplantan con ratios especificos por capa. Esos ratios se descubren automaticamente mediante CMA-ES sobre un espacio de busqueda de 42 dimensiones, guiado por una senal de confianza derivada de analisis tipo MRI de los pesos. El resultado es un hibrido transformer-mamba que combina atencion de una familia con FFN de otra.

El procedimiento se enmarca en la familia Darwin (Gen1 Opus, Gen2 David, Gen3 Genesis) y se describe en el paper "Darwin Family: MRI-Trust-Weighted Evolutionary Merging for Training-Free Scaling of Language-Model Reasoning" (arXiv:2605.14386). No se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni fases de RLHF o DPO, ya que el proceso es de fusion de checkpoints preentrenados. La innovacion tecnica declarada es el cruce FFN entre arquitecturas distintas y la demostracion de "vigor hibrido" (el descendiente supera a ambos progenitores en los benchmarks reportados).

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso (declara 70% en MuSR).
- Comprension cultural y linguistica del coreano (92% en CLIcK), con foco explicito en el idioma.
- Capacidades multilingues en siete idiomas: coreano, ingles, chino, japones, aleman, frances y espanol.
- Razonamiento tipo GPQA segun los tags del repositorio (sin resultados numericos publicados en la informacion disponible).
- Tag `image-text-to-text` en Hugging Face, aunque la model card y el pipeline declarado son de generacion de texto; la capacidad multimodal no esta documentada ni verificada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: razonamiento multi-paso si (MuSR); orquestacion de agentes no documentada.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Asistencia conversacional en coreano: el modelo declara 92% en CLIcK, por lo que es adecuado para productos dirigidos al mercado coreano que requieran comprension cultural (registros formales, referencias locales, matices idiomaticos) mas alla de la traduccion literal.
- Razonamiento multi-paso en dominios con ambiguedad: con 70% en MuSR, encaja en tareas de resolucion de problemas narrativos o de sentido comun donde se encadenan inferencias, como triaje de incidencias o analisis de casos.
- Despliegue en hardware modesto: con 7.518 millones de parametros y pesos safetensors, es viable en una sola GPU de consumo para prototipos y en CPU con cuantizacion, lo que permite iterar sin infraestructura dedicada.
- Generacion de texto multilingue para mercados europeos y asiaticos: al cubrir es, fr, de, ja y zh ademas de ko/en, sirve para localizacion de contenido y resumenes con un unico checkpoint.
- Investigacion en merging de modelos: el checkpoint es una referencia reproducible para estudiar hibridacion transformer-mamba, ratios FFN por capa y el efecto de CMA-ES, util en laboratorios que trabajen en tecnicas training-free.
- Filtrado y clasificacion de contenido en coreano: su rendimiento linguistico permite construir clasificadores o moderadores con contexto cultural, desplegables en entornos con presupuesto de GPU limitado.
- Base para fine-tuning ligero: al ser Apache 2.0 y de 7.5B, se puede adaptar con LoRA a dominios verticales (legal, sanitario) sin costes de preentrenamiento.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card. La metrica de CLIcK y MuSR figura como `verified: false`.

| Benchmark | Darwin-4B-Genesis | Darwin-4B-David (padre) | Qwen3.5-4B (madre) |
|---|---|---|---|
| CLIcK (comprension cultural coreana, accuracy) | 92% | 90% | ~50% (estimado por el autor) |
| MuSR (razonamiento multi-paso, accuracy) | 70% | 65% | ~55% (estimado por el autor) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni GPQA, pese a que el tag `gpqa` aparece en el repositorio. Los valores de la columna de Qwen3.5-4B son estimaciones del propio autor, no mediciones verificadas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: en torno a 15 GB solo para pesos (7.518 millones de parametros), mas overhead de activaciones y cache KV; presupuestar 18-24 GB segun longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB de pesos; en 4 bits, alrededor de 4-5 GB, siempre que exista un GGUF o GPTQ disponible (no confirmado para este checkpoint).
- GPU recomendadas: A100 40/80 GB o H100 para servicio de produccion en precision completa; RTX 4090 (24 GB) para BF16 en una sola tarjeta; RTX 3090 (24 GB) como alternativa.
- GPU de consumo: cabe en RTX 4090 y 3090 en BF16; en RTX 4080/4070 Ti (16 GB) o inferiores requerira cuantizacion.
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI, llama.cpp y Ollama no estan confirmados para este checkpoint concreto. La familia publica GGUF Q8 en otros modelos (Darwin-35B-A3B-Opus), lo que sugiere compatibilidad futura, pero no esta garantizada aqui.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CLIcK | MuSR | Licencia | Notas |
|---|---|---|---|---|---|---|
| Darwin-4B-Genesis | 7.518 M | no disponible | 92% | 70% | Apache 2.0 | Hibrido transformer-mamba por merging |
| Darwin-4B-David | no disponible | no disponible | 90% | 65% | no disponible | Gen2 de la misma familia, progenitor |
| Qwen3.5-4B | ~4B | no disponible | ~50% (est.) | ~55% (est.) | no disponible | Progenitor Mamba/Gated DeltaNet |
| Gemma 4 (progenitor de atencion) | no disponible | no disponible | no disponible | no disponible | no disponible | Aporta capas de atencion al 100% |

La comparacion con alternativas de la misma categoria (hibridos transformer-mamba como Jamba, Nemotron-H o Granite 4.0) no esta disponible con datos numericos en la informacion proporcionada; la model card los menciona como hibridos entrenados desde cero, en contraste con el enfoque de merging.

## Limitaciones y advertencias

- Los resultados de CLIcK y MuSR estan marcados como no verificados (`verified: false`) y proceden del propio autor; no hay evaluacion independiente en la informacion disponible.
- Las cifras de Qwen3.5-4B en la tabla comparativa son estimaciones del autor, no mediciones, lo que debilita la afirmacion de "vigor hibrido".
- La afirmacion de superar a modelos de 27B no se respalda con una tabla de benchmarks en la informacion proporcionada.
- El tag `image-text-to-text` sugiere capacidades multimodales, pero la model card y el pipeline declarado son solo de texto; no debe asumirse vision sin verificacion.
- No se documenta la longitud de contexto, dato critico para produccion con conversaciones largas o RAG.
- El foco linguistico es el coreano; el rendimiento en espanol, frances, aleman, japones y chino no esta cuantificado y podria ser inferior.
- Riesgo de alucinacion: no se reportan tasas de factualidad ni evaluaciones de veracidad; en un modelo de 7.5B fusionado sin entrenamiento adicional, la fiabilidad factica debe validarse por dominio.
- Sesgos: no se documenta analisis de sesgos; al heredar FFN de Qwen3.5 y atencion de Gemma 4, los sesgos de ambos progenitores pueden persistir o amplificarse.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las licencias de los modelos base (Qwen3.5-4B y Darwin-4B-David) por si imponen condiciones adicionales.
- Al ser un modelo de merging sin entrenamiento posterior, puede presentar inconsistencias en capas intermedias no detectadas por los benchmarks declarados; se recomienda evaluacion propia antes de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-4B-Genesis
- Paper (arXiv): https://huggingface.co/papers/2605.14386
- Progenitor Gen2: https://huggingface.co/FINAL-Bench/Darwin-4B-David
- Progenitor Gen1: https://huggingface.co/FINAL-Bench/Darwin-4B-Opus
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Demo CPU (familia POCKET): https://huggingface.co/spaces/FINAL-Bench/POCKET-35B-CPU
- Leaderboard FINAL Bench: https://huggingface.co/spaces/FINAL-Bench/Leaderboard
- Leaderboard ALL Bench: https://huggingface.co/spaces/FINAL-Bench/all-bench-leaderboard
- Dataset CLIcK: https://huggingface.co/datasets/EunsuKim/CLIcK
- Dataset MuSR: https://huggingface.co/datasets/TAUR-Lab/MuSR
