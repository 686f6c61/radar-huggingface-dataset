# mradermacher/Tenet-26B-A4B-Gemma4-Unslop-v2-GGUF

## Resumen

Tenet-26B-A4B-Gemma4-Unslop-v2 es un modelo de lenguaje de tipo mezcla de expertos (MoE) con 25.233.142.046 parametros totales y aproximadamente 4.000 millones de parametros activos por token (la designacion "A4B" del nombre lo indica). Deriva de la familia Gemma 4 de Google y ha sido ajustado por mr-andrey-isachenko mediante tecnicas de *unslop* (eliminacion de respuestas genericas y excesivamente cautas) y *abliteration* (eliminacion de los mecanismos de rechazo internos), dando lugar a una variante descensurada orientada a uso agentico, tool-use y generacion de codigo.

Esta ficha corresponde concretamente a la version cuantizada en GGUF publicada por mradermacher, que ofrece los formatos estaticos Q2_K, Q4_K_S, Q8_0, Q6_K, Q5_K_M, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S e IQ4_XS, ademas de los suplementos multimodales mmproj en Q8_0 y f16. El repositorio ocupa 170,8 GB e incluye pesos en safetensors y GGUF.

El modelo es relevante para desarrolladores que necesitan un LLM de ~25B con activacion dispersa (coste de inferencia cercano a un modelo de ~4B), licencia Apache 2.0 permisiva y capacidades multimodales, sin las restricciones de seguridad habituales de los modelos base. La ausencia de datos de benchmarks publicados en la informacion disponible obliga a validar su rendimiento empiricamente antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivada de Gemma 4 |
| Parametros totales | 25.233.142.046 (~25,2B) |
| Parametros activos | ~4B por token (designacion A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; mmproj Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo base) y GGUF (esta version) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos, heredada de la familia Gemma 4, con 25,2B parametros totales y unos 4B activos por token. Esta dispersion reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano, manteniendo una capacidad de representacion cercana a la de un modelo de 25B. El modelo incluye componentes multimodales, como demuestra la presencia de ficheros mmproj en el repositorio GGUF, lo que indica soporte de entrada de imagenes.

El ajuste realizado por mr-andrey-isachenko combina tres tecnicas: *unslop*, orientada a eliminar respuestas genericas, evasivas y moralizantes; *abliteration*, que elimina las direcciones de activacion asociadas al rechazo de peticiones; y GRPO (Group Relative Policy Optimization), una variante de RL sin modelo critico separado, segun las etiquetas de la model card. El resultado es un modelo descensurado y orientado a tareas agenticas con tool-use. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni los detalles exactos del pipeline de alineamiento. La cuantizacion GGUF la realiza mradermacher mediante conversion desde safetensors con cuantizacion estatica (quantize_version 2, output_tensor_quantised 1).

## Capacidades

- Generacion de texto conversacional en ingles, con estilo directo y sin filtros de seguridad heredados.
- Razonamiento de multiples pasos y comportamiento agentico (etiqueta *agentic*).
- Tool calling y function calling (etiqueta *tool-use*), apto para integracion en frameworks de agentes.
- Generacion de codigo (etiqueta *coding*).
- Entrada multimodal: el repositorio incluye ficheros mmproj, lo que habilita el procesamiento de imagenes en llama.cpp.
- Modo descensurado / abliterated: no aplica rechazos por contenido, lo que permite usos editoriales y creativos sin restricciones del modelo base.
- Compatibilidad con endpoints (etiqueta *endpoints_compatible*) y despliegue en vLLM segun las etiquetas del autor.
- Soporte unicamente de ingles; no se declaran capacidades multilingues.

## Casos de uso

- Agentes autonomos con tool calling: el modelo puede encadenar llamadas a funciones y APIs en bucles de razonamiento multi-paso, aprovechando su naturaleza agentica y su coste de inferencia reducido por la activacion de solo ~4B parametros.
- Asistente de programacion en local: con la cuantizacion Q4_K_S (15,6 GB) puede ejecutarse en una GPU de consumo de 24 GB y emplearse en autocompletado, refactorizacion y generacion de tests dentro de un IDE o pipeline de CI/CD.
- Procesamiento de documentos con imagenes: gracias a los ficheros mmproj, puede extraer informacion de capturas, diagramas y formularios escaneados en flujos de digitalizacion.
- Generacion de contenido creativo sin restricciones: la variante unslop/abliterated es adecuada para ficcion, guiones y material editorial donde los filtros de seguridad del modelo base resultan limitantes.
- Investigacion sobre alineamiento y seguridad: sirve como caso de estudio de los efectos de abliteration y unslop sobre el comportamiento del modelo, comparandolo con el Gemma 4 original.
- Despliegue en entornos con recursos limitados: la cuantizacion Q2_K (10,7 GB) permite ejecucion en GPUs de 12-16 GB o en CPU con llama.cpp, habilitando prototipos y demos de bajo coste.
- Automatizacion de atencion al cliente en ingles: conversaciones multi-turno con tono directo, aunque la longitud de contexto no esta documentada y debe verificarse antes de usarla con historiales largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: Q2_K ~10,7 GB; Q4_K_S ~15,6 GB; Q8_0 y Q6_K por encima de 20 GB; f16 ~50 GB (estimacion a partir de los 25,2B parametros). Los ficheros mmproj anaden 0,9-1,3 GB si se usa entrada multimodal.
- GPU recomendadas: A100 40/80 GB o H100 para f16 y cuantizaciones altas; RTX 4090 (24 GB) para Q4_K_S, Q5_K_M y Q6_K; RTX 3090/4080 (16-24 GB) para Q4_K_S.
- Cabe en GPU de consumo: si, en RTX 4090 con Q4_K_S o Q5, y en GPUs de 12-16 GB con Q2_K o Q3_K_S.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM para el modelo en safetensors/fp8 (segun las etiquetas del autor); TGI no esta confirmado.
- Latencia y throughput: no disponibles. Por la activacion de ~4B parametros, se espera un throughput notablemente superior al de un modelo denso de 25B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Tenet-26B-A4B-Gemma4-Unslop-v2 (esta ficha) | 25,2B | ~4B | no disponible | Apache 2.0 | safetensors, GGUF | Descensurado, agentico, multimodal |
| Gemma 4 26B A4B (base) | ~26B | ~4B | no disponible | Gemma license | safetensors | Modelo original con filtros de seguridad |
| Mixtral 8x7B | 46,7B | ~12,9B | 32K | Apache 2.0 | safetensors, GGUF | MoE mas grande y con mas activos |
| Qwen2.5-32B | 32,5B | 32,5B (denso) | 128K | Apache 2.0 | safetensors, GGUF | Denso: mayor coste de inferencia |

La comparativa con Gemma 4 26B A4B es la mas directa, ya que comparten arquitectura y tamano; la diferencia principal es el ajuste unslop/abliterated y la licencia Apache 2.0 declarada en esta version. Frente a Mixtral 8x7B y Qwen2.5-32B, el modelo ofrece menor coste de activacion, aunque se carece de datos de rendimiento para una comparacion cuantitativa.

## Limitaciones y advertencias

- Solo soporta ingles; no se declaran capacidades multilingues y el rendimiento en castellano no esta verificado.
- No hay benchmarks publicados: el rendimiento real en MMLU, HumanEval, GSM8K o tareas agenticas es desconocido y debe medirse antes de adoptarlo.
- Riesgo de alucinacion inherente a los LLM, potencialmente agravado por el ajuste unslop, que reduce las respuestas de cautela y evasivas.
- El proceso de abliteration elimina los mecanismos de rechazo: el modelo puede generar contenido danino, ilegal o sesgado sin advertencia; requiere moderacion externa en produccion.
- La licencia Apache 2.0 declarada en esta version debe contrastarse con la licencia del modelo base Gemma 4, que podria imponer restricciones adicionales de uso comercial.
- La longitud de contexto no esta documentada; no se debe asumir una ventana grande en flujos con historiales largos.
- La cuantizacion Q2_K degrada notablemente la calidad; se recomienda Q4_K_S o superior para uso real.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria.
- El modelo se publico en 2026-11-25; su ecosistema y soporte son muy recientes.

## Enlaces

- Hugging Face (esta version GGUF): https://huggingface.co/mradermacher/Tenet-26B-A4B-Gemma4-Unslop-v2-GGUF
- Modelo base: https://huggingface.co/mr-andrey-isachenko/Tenet-26B-A4B-Gemma4-Unslop-v2
- Pagina de descargas del autor: https://hf.tst.eu/model#Tenet-26B-A4B-Gemma4-Unslop-v2-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
