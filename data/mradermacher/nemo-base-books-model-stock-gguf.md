# mradermacher/nemo-base-books-model-stock-GGUF

## Resumen

`mradermacher/nemo-base-books-model-stock-GGUF` es una coleccion de cuantizaciones GGUF estaticas del modelo `Burnt-Toast/nemo-base-books-model-stock`, un modelo de lenguaje de aproximadamente 12.250 millones de parametros generado mediante tecnicas de fusion (merge) con mergekit. El autor de las cuantizaciones es mradermacher, un conocido publicador de versiones GGUF de modelos abiertos para su uso con llama.cpp y herramientas compatibles.

El modelo base es un merge de modelos derivados de la familia NeMo (NVIDIA), orientado a la generacion de texto en ingles. Al tratarse de una fusion de pesos (weight merge) y no de un entrenamiento desde cero, las capacidades finales dependen de los modelos de origen, que no se detallan en la informacion disponible. El repositorio ofrece 11 variantes de cuantizacion desde Q2_K hasta Q8_0, lo que permite desplegar el modelo en hardware muy diverso, desde GPUs de consumo hasta servidores.

La relevancia de esta ficha radica en que el repositorio GGUF es la via practica para ejecutar el modelo en local con llama.cpp, Ollama o vLLM, dado que el autor original no publica (segun la informacion disponible) versiones cuantizadas. No obstante, la ausencia de model card detallada, benchmarks y licencia explicita limita seriamente su uso en produccion sin una evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de NeMo; detalles no disponibles) |
| Parametros totales | 12.247.782.400 (~12,25 mil millones) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es el resultado de un merge de pesos realizado con mergekit, segun las etiquetas del repositorio (`mergekit`, `merge`). No se dispone de informacion sobre la receta de fusion concreta (metodo de merge, pesos, modelos de origen), el numero de tokens de entrenamiento ni si hubo fases de RLHF o DPO. El nombre "nemo-base-books-model-stock" sugiere una combinacion de un modelo base NeMo con un modelo afinado en libros ("books") y otro de tipo "stock", pero esta interpretacion no esta confirmada por la documentacion disponible.

Las cuantizaciones son de tipo estatico, generadas con la herramienta de mradermacher (probablemente `llama.cpp` / `quantize`). El autor indica que las cuantizaciones ponderadas o con imatrix no estan disponibles en el momento de publicacion. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en ingles: el modelo esta etiquetado unicamente con el idioma `en`.
- Razonamiento y generacion creativa: capacidades heredadas de los modelos base fusionados, no verificadas de forma independiente.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del ingles.
- No se documenta vision, audio ni modo "thinking".
- No se dispone de informacion sobre el pipeline de la tarea (el campo `pipeline_tag` no esta disponible).

## Casos de uso

- Prototipado local de generacion de texto: gracias a las cuantizaciones Q4_K_M (7,6 GB) y Q5_K_M (8,8 GB), el modelo puede ejecutarse en una GPU de consumo con 12-16 GB de VRAM usando llama.cpp u Ollama, lo que permite experimentar sin infraestructura cloud.
- Generacion creativa y escritura asistida en ingles: el nombre del modelo sugiere un enfasis en texto narrativo ("books"), por lo que puede emplearse para borradores, continuaciones y ejercicios de estilo, siempre con revision humana.
- Despliegue en entornos con recursos limitados: la cuantizacion Q2_K (4,9 GB) permite ejecutar el modelo en GPUs de 8 GB o incluso en CPU, a costa de una perdida notable de calidad.
- Evaluacion comparativa de tecnicas de merge: investigadores que estudien fusiones de modelos pueden usar este repositorio como ejemplo practico de como un merge se comporta tras cuantizacion en distintos niveles.
- Base para fine-tuning ligero: al estar disponible en formato GGUF y safetensors (modelo base), puede servir como punto de partida para LoRA o QLoRA en tareas especificas en ingles.
- Servicio de inferencia self-hosted: con Q8_0 (13,1 GB) y vLLM o llama.cpp server, puede montarse un endpoint compatible con la API de OpenAI para aplicaciones internas de baja concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el tamano del archivo GGUF mas overhead de contexto):
  - Q2_K: ~5-6 GB
  - Q3_K_M: ~7 GB
  - Q4_K_M: ~8-9 GB
  - Q5_K_M: ~9-10 GB
  - Q6_K: ~11-12 GB
  - Q8_0: ~14-15 GB
- GPU recomendadas: RTX 3060 12 GB o RTX 4070 para Q4_K_M; RTX 4080/4090 (16-24 GB) para Q6_K y Q8_0; A100/H100 para despliegues de mayor concurrencia con vLLM.
- Cabe en GPU de consumo: si, desde Q2_K en GPUs de 8 GB hasta Q8_0 en GPUs de 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF), TGI (con conversion previa a safetensors). El repositorio esta etiquetado como `endpoints_compatible`.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/nemo-base-books-model-stock-GGUF | ~12,25 B | no disponible | no disponible | GGUF | Merge con mergekit, solo ingles |
| Mistral-Nemo-Base-2407 (referencia de la familia NeMo) | ~12 B | 128k (segun documentacion publica de Mistral) | Apache 2.0 (segun documentacion publica) | safetensors, GGUF | Modelo oficial con model card completa |
| Qwen2.5-14B | ~14 B | 32k (segun documentacion publica) | Apache 2.0 (segun documentacion publica) | safetensors, GGUF | Multilingue, benchmarks publicados |

La comparativa con Mistral-Nemo y Qwen2.5-14B se ofrece solo como referencia de categoria (modelos de ~12-14 B); los datos de esos modelos provienen de su documentacion publica y no de la informacion proporcionada en esta ficha. Para el modelo objeto de esta ficha no hay datos de rendimiento verificables.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial; es imprescindible contactar con el autor del modelo base antes de cualquier despliegue en produccion.
- Solo ingles: no hay soporte documentado de otros idiomas.
- Sin benchmarks: no hay evidencia publicada de calidad, lo que impide comparar con alternativas de forma rigurosa.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin evaluacion especifica no puede acotarse.
- Merge sin documentar: al desconocerse los modelos de origen y la receta de fusion, no pueden anticiparse sesgos concretos ni comportamientos anomalos.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_S degradan notablemente la perplexidad; el propio autor marca Q3_K_M como "lower quality".
- Sin cuantizaciones imatrix/ponderadas: el autor indica que no estan disponibles, lo que limita la calidad maxima alcanzable en tamanos pequenos.
- Repositorio con muy poca traccion (116 descargas, 0 likes en el momento de la consulta): no hay comunidad que valide su comportamiento.
- Fecha de creacion (septiembre de 2025) y actualizacion (noviembre de 2026) segun metadatos; verificar que el contenido no haya cambiado desde la evaluacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/nemo-base-books-model-stock-GGUF
- Modelo base: https://huggingface.co/Burnt-Toast/nemo-base-books-model-stock
- Pagina de descargas del autor: https://hf.tst.eu/model#nemo-base-books-model-stock-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
