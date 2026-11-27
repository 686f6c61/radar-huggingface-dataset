# mradermacher/Schreiber-mistral-nemo-12B-GGUF

## Resumen

Schreiber-mistral-nemo-12B-GGUF es la version cuantizada en formato GGUF del modelo Schreiber-mistral-nemo-12B, un ajuste fino de Mistral NeMo 12B realizado por nbeerbower y cuantizado por mradermacher. El modelo base Mistral NeMo, desarrollado conjuntamente por Mistral AI y NVIDIA, es un transformer decoder-only de 12.247.782.400 parametros disenado para generacion de texto y conversacion con una ventana de contexto de 128.000 tokens.

Este ajuste fino concreto esta especializado en escritura creativa y narrativa de ficcion, segun se deduce de los datasets de preferencia empleados (gutenberg-dpo, synthetic-fiction-dpo, Arkhaios-DPO, Purpura-DPO, Schule-DPO, entre otros), todos ellos orientados a prosa literaria y estilo. El resultado es un modelo conversacional afinado con DPO sobre el modelo base, disponible en multiples niveles de cuantizacion para su despliegue en hardware modesto.

La relevancia actual de esta ficha radica en que ofrece una via practica para ejecutar un modelo de 12B especializado en escritura en GPUs de consumo, gracias a las cuantizaciones GGUF que van desde 4,9 GB (Q2_K) hasta 13,1 GB (Q8_0). La licencia Apache 2.0 del modelo base y del ajuste facilita su uso comercial, aunque el modelo esta declarado unicamente en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral NeMo 12B) |
| Parametros totales | 12.247.782.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Mistral NeMo soporta 128.000 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); quants con imatrix en repo separado |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo subyacente es Mistral NeMo 12B, un transformer decoder-only con 12.247.782.400 parametros. Sobre esa base, nbeerbower realizo un ajuste fino con DPO (Direct Preference Optimization) empleando un conjunto de datasets de preferencia orientados a ficcion y prosa literaria: jondurbin/gutenberg-dpo-v0.1, nbeerbower/gutenberg2-dpo, nbeerbower/gutenberg-moderne-dpo, nbeerbower/synthetic-fiction-dpo, nbeerbower/Arkhaios-DPO, nbeerbower/Purpura-DPO y nbeerbower/Schule-DPO. No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre la composicion exacta del dataset mas alla de los nombres listados.

La innovacion principal de este repositorio no es arquitectonica sino de distribucion: mradermacher ha generado cuantizaciones estaticas GGUF en once niveles distintos, desde Q2_K hasta Q8_0, permitiendo ejecutar el modelo en llama.cpp y derivados. Ademas, ofrece quants ponderados con imatrix en un repositorio separado (mradermacher/Schreiber-mistral-nemo-12B-i1-GGUF), que suelen ofrecer mejor calidad que los quants estaticos de tamano equivalente. No se documentan tecnicas como decodificacion especulativa ni atencion lineal especifica para este ajuste.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles.
- Escritura creativa y narrativa de ficcion: el ajuste DPO esta especificamente orientado a prosa literaria, estilo y coherencia narrativa.
- Razonamiento general heredado del modelo base Mistral NeMo 12B.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para este ajuste concreto.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues limitadas al ingles segun la model card (language: en).
- Capacidades de vision o audio: no disponibles; el modelo es exclusivamente de texto.
- Modo thinking: no disponible.

## Casos de uso

- Escritura creativa asistida: el modelo puede generar relatos, capitulos de novela y dialogos con estilo literario coherente, aprovechando el ajuste DPO sobre datasets de ficcion. Es adecuado porque el entrenamiento de preferencia se ha realizado precisamente sobre corpus de prosa y narrativa.
- Generacion de ficcion por capitulos con contexto largo: si se confirma el contexto de 128.000 tokens del modelo base, permite mantener la coherencia de personajes y tramas a lo largo de manuscritos extensos en una sola sesion.
- Edicion y reescritura de prosa: el modelo puede recibir un fragmento de texto y producir versiones reescritas con distinto tono o registro, util en flujos de trabajo editorial.
- Prototipado de narrativa interactiva: integrado en motores de ficcion interactiva o videojuegos narrativos, genera respuestas de personajes coherentes con el tono del mundo ficticio.
- Generacion de dialogos para guiones: adecuado para producir lineas de dialogo consistentes con un registro literario, dado el enfasis del ajuste en prosa.
- Despliegue local en estaciones de trabajo: gracias a las cuantizaciones Q4_K_M (7,6 GB) y Q5_K_M (8,8 GB), puede ejecutarse en GPUs de consumo para tareas de escritura sin depender de servicios en la nube.
- Experimentacion e investigacion en ajuste DPO: sirve como referencia para estudiar el efecto de distintos datasets de preferencia literaria sobre un modelo base de 12B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~4,9 GB; Q3_K_S ~5,6 GB; Q3_K_M ~6,2 GB; Q3_K_L ~6,7 GB; IQ4_XS ~6,9 GB; Q4_K_S ~7,2 GB; Q4_K_M ~7,6 GB; Q5_K_S ~8,6 GB; Q5_K_M ~8,8 GB; Q6_K ~10,2 GB; Q8_0 ~13,1 GB.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q8_0 con contexto amplio; RTX 4070 Ti / 4080 (12-16 GB) para Q4_K_M y Q5_K_M; GPUs de 8 GB pueden ejecutar Q2_K y Q3_K_S con contexto limitado.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas con 8 GB o mas, seleccionando el quant adecuado.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; los tags del repositorio incluyen endpoints_compatible, lo que sugiere compatibilidad con endpoints de inferencia estandar.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Schreiber-mistral-nemo-12B-GGUF | 12,25B | no disponible | apache-2.0 | GGUF | Ajuste DPO para ficcion, solo ingles |
| Mistral NeMo 12B (base) | 12,25B | 128.000 (segun modelo base) | apache-2.0 | safetensors, GGUF | Modelo generalista multilingue de Mistral AI y NVIDIA |
| Mistral 7B Instruct | ~7,2B | 32.000 | apache-2.0 | safetensors, GGUF | Menor tamano, menor capacidad de contexto |
| Llama 3.1 8B Instruct | ~8B | 128.000 | licencia comunitaria Llama | safetensors, GGUF | Multilingue, requiere aceptar licencia |

La comparativa se limita a datos estructurales; no se dispone de resultados de benchmarks de este ajuste que permitan comparar rendimiento real frente a las alternativas.

## Limitaciones y advertencias

- El modelo esta declarado unicamente en ingles; su uso en castellano u otros idiomas no esta garantizado y probablemente degrade la calidad.
- Al ser un ajuste fino con DPO sobre datasets de ficcion, puede presentar sesgos estilisticos hacia registros literarios y producir respuestas menos adecuadas en tareas tecnicas o factuales.
- Riesgo de alucinacion inherente a los modelos de lenguaje de 12B; no debe usarse como fuente de hechos sin verificacion.
- No se documentan capacidades de tool calling ni de agentes para este ajuste; asumir que no las soporta salvo validacion empirica.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Mistral NeMo debe verificarse por separado en caso de redistribucion.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) degradan notablemente la perplejidad y la coherencia; para produccion se recomienda Q4_K_M o superior.
- El repositorio tiene un volumen de descargas bajo (96) y un unico like, lo que indica escasa validacion por parte de la comunidad.
- No se dispone de informacion sobre el contexto efectivo tras el ajuste fino; conviene validar el comportamiento con ventanas largas antes de desplegar.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Schreiber-mistral-nemo-12B-GGUF
- Modelo base del ajuste: https://huggingface.co/nbeerbower/Schreiber-mistral-nemo-12B
- Quants con imatrix: https://huggingface.co/mradermacher/Schreiber-mistral-nemo-12B-i1-GGUF
- Pagina de overview del autor: https://hf.tst.eu/model#Schreiber-mistral-nemo-12B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
