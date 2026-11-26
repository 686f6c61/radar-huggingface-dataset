# mradermacher/Daring-Mythalion-13B-GGUF

## Resumen

Daring-Mythalion-13B-GGUF es la distribucion en formato GGUF del modelo Daring-Mythalion-13B, un modelo de lenguaje de 13.000 millones de parametros creado mediante tecnicas de fusion (merge) con la herramienta mergekit a partir del modelo base SzilviaB/Daring-Mythalion-13B. Esta publicacion corre a cargo de mradermacher, un conocido cuantizador de la comunidad de Hugging Face que distribuye versiones optimizadas de modelos existentes para su uso con llama.cpp y entornos de inferencia local. El modelo original es un merge de tipo roleplay/ficcion creativa, orientado a generacion de texto conversacional en ingles.

El repositorio contiene exclusivamente cuantizaciones estaticas del modelo original en formato GGUF, desde Q2_K (5,0 GB) hasta Q8_0 (13,9 GB), lo que permite ejecutar un modelo de 13B en hardware de consumo con requisitos de VRAM moderados. No se trata de un modelo entrenado desde cero ni de una nueva arquitectura: es una redistribucion cuantizada del merge original, y por tanto sus capacidades y limitaciones heredan directamente las del modelo base.

La relevancia de esta ficha es practica: permite a desarrolladores e investigadores evaluar rapidamente si esta cuantizacion encaja en su pipeline local. La informacion disponible es limitada (no hay model card tecnica del merge original, ni benchmarks, ni licencia declarada), por lo que muchos campos de esta ficha se marcan como no disponibles. El modelo esta etiquetado unicamente para ingles y no declara licencia explicita, lo que supone una advertencia importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (merge de modelos, tecnica mergekit); detalles de la arquitectura interna no disponibles |
| Parametros totales | 13.015.864.320 (13B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes i1 (imatrix/ponderadas) en repositorio separado |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); modelo base original en transformers/safetensors |
| Tamano del repositorio | 105,8 GB (incluye todas las cuantizaciones) |

## Arquitectura y entrenamiento

El modelo subyacente es un merge generado con mergekit, una herramienta que combina los pesos de dos o mas modelos preentrenados para producir un nuevo modelo sin entrenamiento adicional desde cero. La model card del repositorio no especifica que modelos se fusionaron ni con que metodo (SLERP, TIES, DARE, passthrough, etc.), por lo que la composicion exacta del merge no esta disponible. Tampoco se documentan los datos de entrenamiento, el numero de tokens, ni si hubo fases de RLHF o DPO.

Lo que si es seguro es que esta publicacion no aporta entrenamiento nuevo: mradermacher aplica cuantizacion estatica sobre los pesos del modelo SzilviaB/Daring-Mythalion-13B y los empaqueta en GGUF. Las cuantizaciones IQ (IQ3_XS, IQ3_S, IQ3_M, IQ4_XS) usan cuantizacion con importancia (imatrix) para preservar mejor la calidad a tamanos reducidos, y existe un repositorio hermano con cuantizaciones i1 ponderadas de mayor calidad. No hay innovaciones arquitectonicas propias (ni atencion lineal, ni decodificacion especulativa, ni modos de razonamiento) documentadas en la informacion disponible.

## Capacidades

- Generacion de texto en ingles, orientada a conversacion y escritura creativa (el nombre "Mythalion" y el linaje de merges de roleplay sugieren este enfoque, aunque no se documenta explicitamente).
- No hay evidencia en la informacion disponible de soporte de tool calling ni function calling.
- No hay evidencia de soporte de agentes ni razonamiento multi-paso estructurado.
- Capacidad multilingue limitada al ingles segun la etiqueta de idioma del repositorio.
- No se documentan capacidades de vision, audio ni modos de pensamiento (thinking mode).
- Compatible con endpoints (tag endpoints_compatible) para despliegue via API de Hugging Face.

## Casos de uso

- Prototipado local de chatbots conversacionales: con cuantizaciones Q4_K_M (8,0 GB) o Q5_K_M (9,3 GB) el modelo cabe en GPUs de consumo de 12-16 GB y permite iterar rapidamente en el diseno de prompts conversacionales sin depender de APIs externas.
- Generacion creativa de ficcion y roleplay: el linaje del merge (Mythalion) apunta a este uso; las cuantizaciones Q6_K y Q8_0 preservan la mayor parte de la calidad del modelo original para tareas de escritura donde el matiz estilistico importa.
- Evaluacion comparativa de merges: investigadores que estudian el efecto de tecnicas mergekit pueden usar esta cuantizacion como referencia ligera para comparar contra el modelo base sin cargar los pesos completos en FP16.
- Despliegue en entornos con VRAM limitada: la cuantizacion Q2_K (5,0 GB) o IQ3_XS (5,5 GB) permite ejecutar un 13B en GPUs de 6-8 GB, util para pruebas de concepto en portatiles con GPU discretas.
- Generacion de texto por lotes en CPU: con llama.cpp y cuantizaciones Q4_K_S, el modelo puede ejecutarse en CPU para tareas de generacion offline donde la latencia no es critica.
- Fine-tuning ligero o adaptacion con LoRA: al estar disponible el modelo base en transformers, se puede partir de el para adaptaciones especificas y luego cuantizar el resultado con el mismo pipeline de mradermacher.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni la del modelo base incluyen metricas de MMLU, HumanEval, GSM8K u otras evaluaciones estandar.

## Requisitos de hardware

- VRAM estimada para inferencia (incluye overhead de contexto, orientativo): Q2_K ~5,5-6 GB; IQ3_XS ~6-6,5 GB; Q4_K_M ~8,5-9 GB; Q5_K_M ~10-10,5 GB; Q6_K ~11,5-12 GB; Q8_0 ~14,5-15 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB y RTX 4090 24 GB para cuantizaciones altas; A100/H100 solo si se necesita throughput elevado en servidor.
- Cabe en GPU de consumo: si, desde Q2_K en GPUs de 6-8 GB hasta Q8_0 en GPUs de 16 GB o superiores.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, text-generation-webui, y servidores compatibles con la API de llama.cpp. vLLM y TGI no soportan GGUF de forma nativa para este caso; para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles (dependen del hardware y de la cuantizacion; no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Daring-Mythalion-13B-GGUF | 13B | no disponible | no disponible | GGUF | Merge roleplay, cuantizado por mradermacher |
| Mythalion-13B (original de la familia) | 13B | no disponible | no disponible en esta ficha | safetensors/GGUF | Modelo de referencia de la que deriva el linaje |
| Llama 2 13B Chat | 13B | 4.096 tokens | Llama 2 Community License | safetensors/GGUF | Alternativa generalista con licencia conocida |
| Mistral 7B Instruct | 7B | 32.768 tokens | Apache 2.0 | safetensors/GGUF | Menor tamano, contexto mayor, licencia permisiva |

La comparacion es orientativa: no hay benchmarks publicados para Daring-Mythalion-13B que permitan una comparacion cuantitativa con estas alternativas. La ventaja principal de este repositorio es la disponibilidad de cuantizaciones GGUF listas para usar; su desventaja es la ausencia de licencia declarada y de documentacion tecnica.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica licencia en el repositorio, lo que impide confirmar si el uso comercial esta permitido. Verificar con el autor del modelo base antes de cualquier despliegue en produccion.
- Solo ingles: el modelo esta etiquetado unicamente para ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion: como todo modelo de 13B sin benchmarks publicados, no hay evidencia de su fiabilidad factual; no debe usarse para tareas que requieran exactitud verificable sin supervision.
- Sesgos desconocidos: al ser un merge de modelos no documentados, no se conocen los sesgos de los datos de entrenamiento originales.
- Contexto no documentado: se desconoce la longitud de contexto soportada, lo que limita el diseno de aplicaciones con ventanas largas.
- Sin soporte de herramientas: no hay evidencia de tool calling ni de capacidades de agente, por lo que no es adecuado para pipelines automatizados que dependan de function calling.
- Repositorio muy pesado (105,8 GB): descargar solo el archivo de cuantizacion necesario, no el repositorio completo.
- Modelo de 2024 con actualizacion de metadatos en 2026: puede estar desactualizado frente a modelos mas recientes de tamano similar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Daring-Mythalion-13B-GGUF
- Modelo base: https://huggingface.co/SzilviaB/Daring-Mythalion-13B
- Cuantizaciones i1 (imatrix): https://huggingface.co/mradermacher/Daring-Mythalion-13B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Daring-Mythalion-13B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
