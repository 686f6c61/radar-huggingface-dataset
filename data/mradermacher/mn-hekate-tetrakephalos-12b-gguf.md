# mradermacher/MN-Hekate-Tetrakephalos-12B-GGUF

## Resumen

MN-Hekate-Tetrakephalos-12B-GGUF es la distribucion en formato GGUF del modelo MN-Hekate-Tetrakephalos-12B, un modelo de lenguaje de 12.247.782.400 parametros (aproximadamente 12,2 mil millones) generado mediante la tecnica de fusion de modelos (model merging) con la herramienta mergekit. El modelo subyacente fue publicado por la comunidad mergekit-community, mientras que esta version cuantizada ha sido producida por mradermacher, un conocido empaquetador de cuantizaciones GGUF para llama.cpp.

El modelo esta disenado para generacion de texto conversacional en ingles y se distribuye con un conjunto de cuantizaciones estaticas que van desde Q2_K (4,9 GB) hasta Q8_0 (13,1 GB), ademas de una variante IQ4_XS (6,9 GB). Esto permite desplegar el modelo en hardware de consumo, algo inviable con los pesos completos en precision original (el repositorio completo ocupa 84,7 GB, incluyendo todos los archivos de cuantizacion).

La relevancia de esta ficha radica en que se trata de un modelo derivado (merge + cuantizacion) del que no se publican detalles de arquitectura interna, dataset de entrenamiento ni resultados de benchmarks en la informacion disponible. Es, por tanto, un artefacto practico para experimentacion local con llama.cpp y Ollama, no un modelo con documentacion tecnica exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de lenguaje basado en transformer, inferido del pipeline de transformers y del formato GGUF; no se detalla en la model card) |
| Parametros totales | 12.247.782.400 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en transformers usa safetensors |
| Tamano del repositorio | 84,7 GB (todos los archivos) |
| Modelo base | mergekit-community/MN-Hekate-Tetrakephalos-12B |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. Por el pipeline declarado (transformers) y el formato de salida (GGUF compatible con llama.cpp), se trata de un transformer decoder-only de aproximadamente 12,2 mil millones de parametros. El modelo base fue creado mediante mergekit, una herramienta de fusion de modelos que combina los pesos de varios modelos preentrenados mediante estrategias como SLERP, TIES, DARE o passthrough. La model card no especifica que modelos se fusionaron, con que metodo ni con que hiperparametros.

Tampoco se documentan los datos de entrenamiento (numero de tokens, composicion del dataset, fases de RLHF/DPO o SFT). Al ser un merge, el modelo hereda las capacidades y sesgos de sus componentes originales, pero esa informacion no se hace publica en la ficha. La unica innovacion tecnica documentada es el proceso de cuantizacion: mradermacher ha generado cuantizaciones estaticas (no imatrix) con llama.cpp, e indica explicitamente que las versiones ponderadas con imatrix no estan disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Razonamiento general y respuesta a instrucciones, heredado de los modelos fusionados (no verificado con benchmarks).
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere que puede servirse mediante infraestructura de inferencia estandar de Hugging Face.
- Ejecucion local mediante llama.cpp, Ollama y otros runners compatibles con GGUF.
- Soporte de cuantizaciones de baja precision (Q2_K, Q3_K) para entornos con poca memoria.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidad multilingue limitada al ingles segun los metadatos del modelo.

## Casos de uso

- Experimentacion local en equipos de consumo: con la cuantizacion Q4_K_M (7,6 GB) el modelo puede ejecutarse en una GPU con 8-12 GB de VRAM o en CPU con suficiente RAM, lo que permite probar un modelo de 12B sin infraestructura de datacenter.
- Prototipado de chatbots conversacionales en ingles: al estar etiquetado como `conversational`, es adecuado para generar respuestas multi-turno en demos y pruebas de concepto antes de invertir en un modelo mayor.
- Evaluacion comparativa de merges: investigadores que estudian el efecto de mergekit pueden usar esta version cuantizada para comparar rapidamente el comportamiento de distintos merges sin descargar los pesos completos.
- Despliegue en entornos con restricciones de memoria: las variantes Q2_K (4,9 GB) y Q3_K_S (5,6 GB) permiten ejecutar el modelo en dispositivos con 6-8 GB de RAM, util para pruebas en portatiles.
- Generacion de texto offline y privacidad: al ejecutarse localmente con llama.cpp, los datos no salen del equipo, lo que sirve para procesar texto sensible en ingles sin depender de APIs externas.
- Integracion en pipelines de inferencia ligeros: mediante el servidor de llama.cpp u Ollama, el modelo puede exponerse como API compatible con OpenAI para pruebas de integracion en aplicaciones existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion: Q2_K ~4,9 GB; Q3_K_S ~5,6 GB; Q3_K_M ~6,2 GB; Q3_K_L ~6,7 GB; IQ4_XS ~6,9 GB; Q4_K_S ~7,2 GB; Q4_K_M ~7,6 GB; Q5_K_S ~8,6 GB; Q5_K_M ~8,8 GB; Q6_K ~10,2 GB; Q8_0 ~13,1 GB. A estas cifras hay que sumar el overhead del contexto y del runtime (tipicamente 1-2 GB adicionales).
- GPU recomendadas: para Q4_K_M, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4070/4080; para Q8_0, una RTX 4090 de 24 GB o una A100/H100 con holgura. Las cuantizaciones Q2_K a Q4_K_S caben en GPUs de 8 GB (RTX 3070, RTX 4060) con contexto moderado.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones hasta Q6_K con 12-16 GB de VRAM; Q8_0 requiere 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidor de llama.cpp, y cualquier runtime compatible con GGUF. El modelo base en transformers puede servirse con vLLM o TGI, pero esta version concreta es GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MN-Hekate-Tetrakephalos-12B-GGUF | 12,2B | no disponible | no disponible | GGUF | Merge comunitario cuantizado por mradermacher |
| Mistral-Nemo-12B | 12B | 128K (segun su model card publica) | Apache 2.0 | safetensors, GGUF | Modelo base con documentacion completa y benchmarks publicos |
| Gemma-2-9B | 9B | 8K | Gemma license | safetensors, GGUF | Modelo de Google con evaluaciones publicadas |
| Qwen2.5-14B | 14,7B | 128K | Apache 2.0 | safetensors, GGUF | Alternativa de mayor tamano con soporte multilingue |

Nota: los datos de los modelos comparativos corresponden a sus fichas publicas; la comparacion de rendimiento con MN-Hekate no puede establecerse porque no hay benchmarks publicados de este ultimo.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se conocen los modelos fusionados, el metodo de merge, los datos de entrenamiento ni la longitud de contexto, lo que impide evaluar su calidad de forma rigurosa.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Antes de usarlo en produccion hay que verificar la licencia del modelo base y de los modelos originales fusionados.
- Solo ingles: los metadatos declaran unicamente el idioma `en`; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion: al ser un merge sin evaluacion publicada, no hay datos sobre su fiabilidad factual ni sobre su tendencia a inventar informacion.
- Sesgos desconocidos: al no documentarse los datos de entrenamiento, no se pueden identificar sesgos especificos; se heredan los de los modelos fusionados.
- Cuantizaciones estaticas: no hay versiones imatrix, y las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la calidad (la propia model card marca Q3_K_M como "lower quality").
- Sin soporte declarado de tool calling ni agentes: no es adecuado para pipelines que requieran function calling estructurado.
- Popularidad muy baja: 149 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de encontrar soporte comunitario o correcciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/MN-Hekate-Tetrakephalos-12B-GGUF
- Modelo base: https://huggingface.co/mergekit-community/MN-Hekate-Tetrakephalos-12B
- Pagina de descargas del autor: https://hf.tst.eu/model#MN-Hekate-Tetrakephalos-12B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- mergekit (herramienta de fusion): https://github.com/arcee-ai/mergekit
- llama.cpp: https://github.com/ggerganov/llama.cpp
