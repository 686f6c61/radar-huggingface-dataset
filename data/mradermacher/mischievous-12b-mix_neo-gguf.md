# mradermacher/MISCHIEVOUS-12B-Mix_Neo-GGUF

## Resumen

MISCHIEVOUS-12B-Mix_Neo-GGUF es la version cuantizada en formato GGUF del modelo MISCHIEVOUS-12B-Mix_Neo, un merge de modelos de 12.247.802.880 parametros (~12,2B) publicado por el usuario bamec66557 y cuantizado por mradermacher, un especialista habitual en la conversion de pesos a GGUF para su uso con llama.cpp y herramientas compatibles. El modelo original se ha generado mediante mergekit, la herramienta de fusion de modelos de Arcee AI, lo que indica que combina los pesos de dos o mas modelos base para producir un modelo derivado con caracteristicas hibridas.

El interes practico de esta publicacion reside en la disponibilidad de cuantizaciones estaticas en multiples niveles (desde Q2_K hasta Q8_0), lo que permite ejecutar un modelo de 12B parametros en hardware de consumo. La version Q4_K_M, por ejemplo, ocupa 7,6 GB y es la recomendada por el autor por su equilibrio entre velocidad y calidad. El repositorio tiene un tamano total de 84,7 GB, ya que incluye todas las variantes de cuantizacion.

La informacion publicada por el autor es muy limitada: no se detallan los modelos fuente del merge, la composicion del dataset de entrenamiento, la longitud de contexto soportada ni resultados de benchmarks. La model card se limita a listar los ficheros GGUF disponibles y a remitir a la documentacion de TheBloke para el uso de este formato. El modelo esta etiquetado como conversacional y solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (merge de modelos, generado con mergekit); detalles de la arquitectura base no disponibles |
| Parametros totales | 12.247.802.880 (~12,2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base original esta en safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge realizado con mergekit, una herramienta que combina los pesos de varios modelos transformers para producir un modelo derivado. No se especifica en la informacion disponible que modelos concretos se han fusionado, ni la tecnica de merge empleada (SLERP, TIES, DARE, passthrough, etc.), ni los hiperparametros del proceso. Tampoco se detalla si hubo entrenamiento posterior al merge, ajuste fino, RLHF o DPO.

La unica referencia a datos de evaluacion es el dataset `open-llm-leaderboard/bamec66557__MISCHIEVOUS-12B-Mix_Neo-details`, que sugiere que el autor original publico resultados en el Open LLM Leaderboard, pero los valores concretos no se incluyen en la informacion proporcionada. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del corpus ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Razonamiento y generacion de texto general, heredado de los modelos fusionados (no se detalla cuales).
- No se documenta soporte explicito de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: la cuantizacion Q4_K_M (7,6 GB) permite ejecutar el modelo en GPUs con 8-12 GB de VRAM mediante llama.cpp u Ollama, ideal para prototipado sin infraestructura cloud.
- Experimentacion con merges de modelos: util para investigadores que quieran evaluar el comportamiento de un merge de 12B frente a sus componentes originales, aunque la falta de documentacion sobre los modelos fuente limita la reproducibilidad.
- Generacion de texto creativo y conversacional en ingles: el modelo esta etiquetado como conversacional y puede emplearse en aplicaciones de chat, redaccion asistida o generacion de contenido en ingles.
- Fine-tuning posterior sobre el modelo cuantizado o sobre el base en safetensors: la licencia Apache 2.0 permite adaptaciones y uso comercial sin restricciones de atribucion adicionales.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece once variantes que permiten medir el impacto de la cuantizacion en la perplejidad y la calidad de salida para un modelo de 12B.
- Servicio de inferencia ligero en CPU: las cuantizaciones Q2_K (4,9 GB) y Q3_K_S (5,6 GB) permiten ejecucion en CPU con memoria RAM moderada, adecuado para entornos sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio referencia el dataset del Open LLM Leaderboard del modelo base, pero no se incluyen los valores numericos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion):
  - Q2_K: ~5 GB
  - Q3_K_M: ~6,5 GB
  - Q4_K_M: ~8 GB (recomendada por el autor)
  - Q5_K_M: ~9 GB
  - Q6_K: ~10,5 GB
  - Q8_0: ~13,5 GB
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100, H100. Las cuantizaciones Q4 y Q5 caben en GPUs de consumo con 8-12 GB de VRAM.
- Cabe en GPU de consumo: si, desde Q2_K hasta Q6_K en tarjetas de 8-16 GB; Q8_0 requiere al menos 16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. No es compatible directamente con vLLM ni TGI en formato GGUF sin conversion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MISCHIEVOUS-12B-Mix_Neo-GGUF | ~12,2B | No disponible | Apache 2.0 | GGUF | Merge sin documentacion de modelos fuente |
| Mistral-Nemo-Base-2407 | 12B | 128K | Apache 2.0 | safetensors, GGUF | Modelo base documentado, contexto largo |
| Gemma-2-9B | 9B | 8K | Gemma license | safetensors, GGUF | Licencia con restricciones de uso comercial |
| Qwen2.5-14B | 14,7B | 32K (128K en variantes) | Apache 2.0 | safetensors, GGUF | Mayor tamano y contexto documentado |

La comparacion es orientativa: no se dispone de datos de rendimiento del modelo MISCHIEVOUS que permitan una comparacion cuantitativa con estas alternativas. Los modelos citados son opciones establecidas de tamano similar con documentacion completa.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre los modelos fuente del merge, lo que impide conocer los sesgos heredados y la composicion de los datos de entrenamiento originales.
- Riesgo de alucinacion no evaluado: no se han publicado benchmarks ni evaluaciones de fidelidad.
- Soporte unicamente en ingles segun la model card; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Longitud de contexto no especificada, lo que dificulta el diseno de aplicaciones que dependan de ventanas largas.
- El modelo base original no incluye informacion sobre alineacion (RLHF/DPO), por lo que puede producir contenido inapropiado o no alineado con instrucciones.
- Aunque la licencia es Apache 2.0 (permite uso comercial), la falta de trazabilidad de los modelos fusionados podria plantear dudas sobre la procedencia de los pesos; se recomienda verificar la licencia de los modelos fuente antes de un uso comercial critico.
- El repositorio GGUF incluye solo cuantizaciones estaticas; las versiones con imatrix (mayor calidad) estan en un repositorio separado.
- Numero de descargas muy bajo (65) y un solo like, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/MISCHIEVOUS-12B-Mix_Neo-GGUF
- Modelo base original: https://huggingface.co/bamec66557/MISCHIEVOUS-12B-Mix_Neo
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/MISCHIEVOUS-12B-Mix_Neo-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#MISCHIEVOUS-12B-Mix_Neo-GGUF
- Dataset de detalles del Open LLM Leaderboard: https://huggingface.co/datasets/open-llm-leaderboard/bamec66557__MISCHIEVOUS-12B-Mix_Neo-details
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
