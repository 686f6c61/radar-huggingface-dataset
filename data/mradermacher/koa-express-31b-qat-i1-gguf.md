# mradermacher/Koa-express-31B-qat-i1-GGUF

## Resumen

Koa-express-31B-qat-i1-GGUF es una distribucion de cuantizaciones GGUF del modelo Koa-express-31B-qat, publicado originalmente por SF-Foundation. El trabajo de cuantizacion lo firma mradermacher, un conocido creador de quants de la comunidad, que aplica cuantizacion con imatrix (importance matrix) para preservar la calidad en tamanos reducidos. El modelo base cuenta con 32.106.631.740 parametros totales (aproximadamente 32,1 mil millones), lo que lo situa en la categoria de modelos densos de gran tamano, y esta etiquetado como conversacional y orientado al idioma ingles.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 32B en hardware de consumo mediante cuantizaciones que van desde los 7,7 GB (i1-IQ1_S) hasta los 20,5 GB (i1-Q4_1), un rango que cubre desde GPUs de gama media hasta estaciones de trabajo con 24 GB de VRAM. El sufijo "qat" en el nombre del modelo base sugiere que se entreno con Quantization-Aware Training, lo que en teoria mejora la robustez frente a la cuantizacion posterior.

No obstante, la informacion disponible sobre el modelo base es muy limitada: no se detalla la arquitectura interna, la longitud de contexto, la composicion del dataset de entrenamiento ni los resultados de benchmarks. Esta ficha recoge exclusivamente los datos verificables de la model card de la cuantizacion y de los metadatos de Hugging Face, marcando explicitamente como "no disponible" todo aquello que no se puede confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer denso, inferido por el tamano y el pipeline de transformers; no confirmado en la informacion) |
| Parametros totales | 32.106.631.740 (32,1B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-Q2_K_S, i1-IQ2_M, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1 (todas con imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |
| Tamano del repo | 278,7 GB |
| Modelo base | SF-Foundation/Koa-express-31B-qat |
| Cuantizador | mradermacher |
| Fecha de creacion | 2026-10-24 |
| Ultima actualizacion | 2026-11-20 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Koa-express-31B-qat. Por el numero de parametros (32,1B) y la libreria declarada (transformers), se trata con alta probabilidad de un transformer denso de aproximadamente 31-32 mil millones de parametros, pero la model card de la cuantizacion no especifica el tipo de atencion, el numero de capas, las dimensiones ocultas ni si emplea alguna innovacion como atencion lineal o decodificacion especulativa.

Respecto al entrenamiento, el sufijo "qat" indica Quantization-Aware Training, una tecnica en la que el modelo se entrena simulando la cuantizacion para que sus pesos sean mas tolerantes a la reduccion de precision. Esto es especialmente relevante para esta distribucion, ya que las cuantizaciones GGUF de baja precision (IQ1, IQ2) deberian degradar menos que en un modelo entrenado solo en precision completa. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se documenta el proceso de creacion de la importance matrix (imatrix) mas alla de que mradermacher la genero para estas cuantizaciones.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del modelo.
- Razonamiento y respuesta a instrucciones: capacidad esperable en un modelo de 32B, aunque no confirmada con benchmarks en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma; no se documentan otros idiomas.
- Capacidades especiales (vision, audio, modo thinking): no disponible en la informacion.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere que puede desplegarse mediante Inference Endpoints de Hugging Face.

## Casos de uso

- Asistente conversacional autoalojado: el modelo puede desplegarse con llama.cpp u Ollama en una estacion de trabajo con 24 GB de VRAM usando la cuantizacion i1-Q4_K_M (19,6 GB), ofreciendo un asistente de chat privado sin dependencia de APIs externas.
- Prototipado de aplicaciones de chat en ingles: gracias a las cuantizaciones de 7,7-10 GB (IQ1, IQ2), se puede iterar rapidamente en portatiles con GPU de 8-12 GB, aunque con calidad reducida, para validar flujos de producto antes de pasar a hardware mayor.
- Generacion de texto en pipelines por lotes: la version i1-Q4_K_S (18,7 GB) ofrece el equilibrio optimo tamano/velocidad/calidad segun la model card, adecuada para tareas de redaccion, resumen o clasificacion en ingles ejecutadas en servidores con una sola GPU de 24 GB.
- Evaluacion comparativa de cuantizaciones: el amplio catalogo de quants (desde IQ1_S hasta Q4_1) permite estudiar la degradacion de calidad frente al modelo base, util para investigadores que analizan el impacto de la cuantizacion en modelos entrenados con QAT.
- Despliegue en entornos con restricciones de memoria: la cuantizacion i1-IQ2_XS (10,1 GB) permite ejecutar un modelo de 32B en GPUs consumer de 12 GB, un escenario inviable con los pesos en safetensors (que requeririan mas de 60 GB en fp16).
- Fine-tuning ligero o adaptacion con LoRA sobre la version cuantizada: no recomendado directamente sobre GGUF, pero el modelo base en safetensors puede servir de punto de partida para adaptaciones en ingles antes de recuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano del fichero GGUF mas overhead de contexto y KV cache):
  - i1-IQ1_S (7,7 GB): ~9-10 GB de VRAM.
  - i1-IQ2_XS (10,1 GB): ~12 GB de VRAM.
  - i1-IQ3_S (14,5 GB): ~16-17 GB de VRAM.
  - i1-Q4_K_M (19,6 GB): ~22-23 GB de VRAM.
  - i1-Q4_1 (20,5 GB): ~23-24 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q4_1; RTX 4080 / 4070 Ti Super (16 GB) para IQ3_S o IQ3_M; RTX 3060 12 GB o RTX 4070 para IQ2_XS; A100 40/80 GB o H100 para despliegues de produccion con contexto largo.
- Cabe en GPU consumer: si, en el rango de 12-24 GB de VRAM segun la cuantizacion elegida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Koa-express-31B-qat (esta ficha) | 32,1B | no disponible | no disponible | GGUF (i1) | Cuantizado por mradermacher con imatrix; solo ingles |
| Modelos densos de ~30-34B de la comunidad (p. ej. variantes tipo Qwen o Yi de 32-34B) | 30-34B | variable | variable | GGUF, safetensors | Referencia habitual de la categoria; datos concretos no disponibles en esta busqueda |
| Modelos MoE de ~30B totales con pocos parametros activos | ~30B totales | variable | variable | GGUF, safetensors | Mayor throughput por token generado; no comparable directamente por arquitectura |

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparativa cuantitativa rigurosa con alternativas concretas. La comparativa anterior es orientativa por categoria de tamano.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado unicamente para ingles; su rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es imprescindible consultar la licencia del modelo base (SF-Foundation/Koa-express-31B-qat) antes de cualquier despliegue en produccion.
- Ausencia de benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni similares, por lo que la calidad real del modelo no se puede verificar de forma objetiva.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; sin evaluaciones publicadas no se puede acotar su incidencia.
- Cuantizaciones de muy baja precision: las variantes IQ1 e IQ2 (7,7-11,6 GB) degradan notablemente la calidad; la propia model card las describe como "for the desperate" o "mostly desperate". No son adecuadas para produccion.
- Sesgos: no documentados en la informacion disponible; se heredan los del modelo base y su dataset, desconocido.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide planificar casos de uso con documentos largos.
- Fecha de creacion futura (2026): los metadatos indican fechas de 2026, lo que puede reflejar un error de la plataforma o una publicacion programada; conviene verificar la vigencia del repositorio.
- Sin likes ni pipeline declarado: el repositorio tiene 0 likes y no declara pipeline, lo que sugiere una adopcion limitada y poca validacion por parte de la comunidad.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/mradermacher/Koa-express-31B-qat-i1-GGUF
- Modelo base: https://huggingface.co/SF-Foundation/Koa-express-31B-qat
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/Koa-express-31B-qat-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Koa-express-31B-qat-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- nethype GmbH (empresa del autor): https://www.nethype.de/
