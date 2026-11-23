# mradermacher/Qwen3.6-Fallen-Fabulist-35B-A3B-GGUF

## Resumen

Qwen3.6-Fallen-Fabulist-35B-A3B-GGUF es la version cuantizada en formato GGUF del modelo Cyclone-Labs/Qwen3.6-Fallen-Fabulist-35B-A3B, un merge de modelos de la familia Qwen3.6 realizado con mergekit. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos open source, que distribuye aqui once variantes de cuantizacion estatica (desde Q2_K hasta Q8_0) e indica que existen tambien cuantizaciones ponderadas e imatrix en un repositorio separado.

El modelo base pesa 35.505.251.456 parametros segun los datos de safetensors, lo que lo situa en la franja de 35B. El sufijo A3B del nombre sugiere una arquitectura de mezcla de expertos con aproximadamente 3B de parametros activos por token, aunque la model card no detalla esa configuracion. Al ser un merge de modelos Qwen3.6, hereda las capacidades conversacionales de esa familia, y la licencia declarada es Apache 2.0.

La relevancia practica de esta publicacion es que permite ejecutar un modelo de 35B en hardware de consumo mediante cuantizaciones de 13 a 38 GB, con la opcion Q4_K_M (21,8 GB) como punto de equilibrio recomendado por el autor entre velocidad y calidad. Es, por tanto, una pieza orientada a despliegue local y experimentation, no a entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3.6 (merge con mergekit); mezcla de expertos no confirmada en la model card |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible (el sufijo A3B sugiere ~3B, sin confirmacion oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); versiones ponderadas/imatrix en repositorio i1-GGUF |
| Idiomas soportados | en (segun la model card); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo base es un merge construido con mergekit, segun las etiquetas de la model card. No se detalla en la informacion disponible que modelos se combinaron, con que metodo de fusion (SLERP, TIES, DARE, etc.) ni con que pesos, ni si hubo fases posteriores de ajuste fino o preferencia (RLHF/DPO). Tampoco se especifica el volumen de tokens de entrenamiento ni la composicion del dataset.

La unica innovacion tecnica documentada en esta ficha es la propia cuantizacion: mradermacher publica cuantizaciones estaticas de tipo K-quant y IQ, generadas con el pipeline de llama.cpp, y ofrece ademas un conjunto ponderado/imatrix en el repositorio hermano Qwen3.6-Fallen-Fabulist-35B-A3B-i1-GGUF. El autor advierte que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamano similar, y marca Q4_K_S y Q4_K_M como "fast, recommended". El repositorio incluye graficos comparativos de perplejidad de ikawrakow y las notas de Artefact2 sobre tipos de cuantizacion.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es conversational y el modelo esta etiquetado como "endpoints_compatible".
- Razonamiento y codigo: capacidades heredadas del modelo base Qwen3.6; no se detallan en la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: la model card solo declara ingles; no se confirma soporte de otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Despliegue local: compatible con llama.cpp, Ollama y otros runners GGUF; el autor remite a las guias de TheBloke para el uso de ficheros GGUF multiparte.

## Casos de uso

- Prototipado local de asistentes conversacionales: con la cuantizacion Q4_K_M (21,8 GB) el modelo cabe en una GPU de 24 GB o en configuraciones CPU+GPU, lo que permite iterar sobre prompts y flujos conversacionales sin coste de API.
- Experimentacion con merges de modelos: util para investigadores que quieran evaluar el comportamiento de un merge de la familia Qwen3.6 sin descargar los 242,9 GB del repositorio completo, eligiendo una cuantizacion de 13 a 38 GB segun el hardware.
- Despliegue en estaciones de trabajo con una sola GPU: las variantes Q3_K_L (18,7 GB) e IQ4_XS (19,5 GB) permiten ejecutar el modelo en tarjetas de 24 GB con margen para contexto, segun el criterio del autor sobre calidad frente a tamano.
- Generacion de texto en lote sobre CPU: la variante Q2_K (13,3 GB) posibilita inferencia en equipos sin GPU dedicada, a costa de una perdida de calidad que el autor no cuantifica.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece once variantes del mismo modelo, lo que facilita medir el impacto de la cuantizacion en tareas concretas antes de fijar una version para produccion.
- Integracion en pipelines con endpoints compatibles: la etiqueta endpoints_compatible sugiere su uso detras de servidores de inferencia con API compatible con OpenAI, aunque la model card no detalla la configuracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio solo incluye graficos comparativos de perplejidad entre tipos de cuantizacion (ikawrakow y Artefact2), no resultados en tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano de fichero, sin contar KV cache): Q2_K 13,3 GB; Q3_K_S 15,6 GB; Q3_K_M 17,3 GB; Q3_K_L 18,7 GB; IQ4_XS 19,5 GB; Q4_K_S 20,5 GB; Q4_K_M 21,8 GB; Q5_K_S 24,7 GB; Q5_K_M 25,4 GB; Q6_K 29,3 GB; Q8_0 37,9 GB.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, Q4_K_M encaja en GPUs de 24 GB (RTX 4090, A10G, L4 de 24 GB); Q8_0 requiere 48 GB o mas (A6000, A100 80 GB, H100).
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizaciones hasta Q4_K_M; las variantes Q5 y Q6 requieren 32 GB o repartir entre GPU y CPU.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runner compatible con GGUF; el autor remite a las guias de TheBloke para el uso de ficheros multiparte.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-Fallen-Fabulist-35B-A3B (GGUF, este) | 35,5B | no disponible | Apache 2.0 | GGUF | Merge con mergekit; 11 cuantizaciones estaticas |
| Cyclone-Labs/Qwen3.6-Fallen-Fabulist-35B-A3B | 35,5B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| Qwen3.6-Fallen-Fabulist-35B-A3B-i1-GGUF | 35,5B | no disponible | Apache 2.0 | GGUF | Mismo modelo con cuantizaciones ponderadas/imatrix |
| Otros modelos de ~35B de la familia Qwen3.6 | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, datos de entrenamiento ni evaluaciones de seguridad; no hay base para afirmar que el modelo este alineado.
- Riesgo de alucinacion inherente a los modelos generativos; sin benchmarks publicados no es posible acotar su magnitud en este merge concreto.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado y podria degradarse.
- La longitud de contexto no esta especificada, lo que impide planificar casos de uso con ventanas largas.
- Las cuantizaciones de menor tamano (Q2_K, Q3_K_S) degradan la calidad; el autor solo marca Q4_K_S y Q4_K_M como "fast, recommended" y Q6_K como "very good quality".
- La licencia Apache 2.0 permite uso comercial, pero al ser un merge de modelos Qwen3.6 conviene verificar las condiciones del modelo base original antes de distribuirlo en produccion.
- El repositorio ocupa 242,9 GB; descargar la variante adecuada y no el conjunto completo es critico para el almacenamiento.
- No hay garantias de mantenimiento: el modelo se publico el 19 de noviembre de 2026 y se actualizo al dia siguiente, sin historial posterior en la informacion disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.6-Fallen-Fabulist-35B-A3B-GGUF
- Modelo base: https://huggingface.co/Cyclone-Labs/Qwen3.6-Fallen-Fabulist-35B-A3B
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Qwen3.6-Fallen-Fabulist-35B-A3B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.6-Fallen-Fabulist-35B-A3B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
