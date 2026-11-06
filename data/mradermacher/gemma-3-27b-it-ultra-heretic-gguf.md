# mradermacher/gemma-3-27b-it-ultra-heretic-GGUF

## Resumen

`mradermacher/gemma-3-27b-it-ultra-heretic-GGUF` es una cuantizacion en formato GGUF del modelo `llmfan46/gemma-3-27b-it-ultra-uncensored-heretic`, a su vez un derivado afinado de Gemma 3 27B Instruct de Google. El autor de la cuantizacion es mradermacher, conocido en el ecosistema por publicar versiones GGUF estaticas e imatrix de modelos populares para su uso con llama.cpp y herramientas compatibles. El modelo base pertenece a la familia Gemma 3, con aproximadamente 27.000 millones de parametros y arquitectura transformer densa.

El proposito declarado del modelo es ofrecer una variante "uncensored", "abliterated" y "heretic" del Gemma 3 27B Instruct, es decir, con los mecanismos de rechazo y alineacion de seguridad reducidos o eliminados mediante tecnicas de abliteration y fine-tuning. Esto lo hace relevante para investigadores que estudian el comportamiento de modelos sin capas de rechazo, para tareas de generacion creativa sin restricciones y para experimentos de interpretabilidad sobre alineacion. No obstante, implica riesgos importantes de uso indebido y de cumplimiento normativo.

La ficha se centra en la version GGUF cuantizada, que incluye tanto pesos de texto como un proyector multimodal (`mmproj`) que preserva las capacidades de vision del Gemma 3 original. El repositorio ocupa 188,1 GB e incluye 12 cuantizaciones estaticas distintas, desde Q2_K hasta Q8_0, ademas de las dos variantes del proyector multimodal. Las cuantizaciones ponderadas con imatrix se publican en un repositorio separado (`gemma-3-27b-it-ultra-heretic-i1-GGUF`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (derivada de Gemma 3 27B Instruct) |
| Parametros totales | 27.009.346.304 (~27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el Gemma 3 27B original soporta 128K tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; ademas mmproj-Q8_0 y mmproj-f16 para vision |
| Idiomas soportados | en (segun la model card; el Gemma 3 original es multilingue, pero esta ficha solo declara ingles) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de la familia Gemma 3, con 27.009.346.304 parametros segun los safetensors del modelo base. Gemma 3 introduce mejoras respecto a Gemma 2, como atencion con ventana deslizante local y global alternada, normalizacion RMSNorm y activaciones GeGLU, ademas de un proyector multimodal para entrada de imagenes. La version "heretic" y "abliterated" del modelo base implica que se han aplicado tecnicas de abliteration (proyeccion ortogonal de las direcciones de rechazo en el espacio de activaciones) y fine-tuning adicional para reducir la tendencia del modelo a rechazar peticiones, manteniendo en lo posible las capacidades generales del Gemma 3 original.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset de fine-tuning ni si se emplearon tecnicas de RLHF o DPO en esta variante concreta. La model card del repositorio GGUF no incluye estos datos y se limita a describir el proceso de cuantizacion. Las cuantizaciones son estaticas (no imatrix) en este repositorio; las versiones ponderadas con imatrix estan en un repositorio separado. El proyector multimodal `mmproj` se ofrece en Q8_0 y f16, lo que permite conservar la capacidad de procesar imagenes en el pipeline de llama.cpp.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Gemma 3 27B Instruct.
- Razonamiento y respuesta a instrucciones en ingles, con menor tendencia al rechazo que el modelo original.
- Capacidad multimodal de vision: el repositorio incluye proyectores `mmproj` (Q8_0 y f16) que permiten procesar imagenes junto con texto en llama.cpp.
- Generacion de codigo y matematicas, aunque no se han publicado benchmarks especificos para esta variante.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion proporcionada; el Gemma 3 Instruct original lo soporta, pero la variante heretic no lo documenta.
- Capacidades de agente y razonamiento multi-paso: no documentadas en esta ficha.
- Multilingue: la model card solo declara ingles; el Gemma 3 original soporta mas de 140 idiomas, pero no se confirma para esta variante.
- Modo "thinking" o razonamiento extendido: no disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigacion sobre alineacion y abliteration: el modelo permite estudiar como la eliminacion de direcciones de rechazo afecta a la coherencia, la utilidad y la seguridad en un transformer de 27B, comparando con el Gemma 3 Instruct original.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que requiera tematicas adultas o controvertidas, donde los modelos alineados suelen rechazar peticiones; el modelo puede generar contenido que el Gemma 3 Instruct filtraria.
- Analisis de sesgos y contenido toxico: util para construir conjuntos de datos de respuestas no filtradas y estudiar la propagacion de sesgos en modelos sin capa de rechazo, con fines de auditoria.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_S (15,8 GB) y Q4_K_M (16,6 GB) caben en GPUs consumer de 24 GB como la RTX 4090, permitiendo inferencia local de un modelo de 27B con vision.
- Procesamiento de documentos con imagenes: usando el `mmproj` y una cuantizacion Q5_K_M o Q6_K, se puede hacer OCR, descripcion de figuras o extraccion de datos de capturas y diagramas en local.
- Experimentos de red teaming: el modelo sirve como sujeto de pruebas para evaluar defensas, clasificadores de toxicidad y sistemas de moderacion, al producir respuestas que los modelos alineados bloquean.
- Fine-tuning posterior: las cuantizaciones Q8_0 (28,8 GB) o los pesos del modelo base en safetensors permiten continuar el ajuste con LoRA o QLoRA para dominios especificos, partiendo de una base sin rechazos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~10,6 GB
  - Q3_K_M: ~13,5 GB
  - IQ4_XS: ~15,0 GB
  - Q4_K_S: ~15,8 GB
  - Q4_K_M: ~16,6 GB
  - Q5_K_M: ~19,4 GB
  - Q6_K: ~22,3 GB
  - Q8_0: ~28,8 GB
  - Proyector multimodal: +0,7 GB (Q8_0) o +1,0 GB (f16)
- GPU recomendadas:
  - RTX 4090 (24 GB): Q4_K_M, Q5_K_S y Q5_K_M con contexto moderado; Q6_K justo con contexto corto.
  - RTX 3090 (24 GB): mismas opciones que la 4090.
  - A100 40 GB / H100 80 GB: Q8_0 con contexto largo y vision.
  - RTX 4080 / 4070 Ti (16 GB): IQ4_XS o Q4_K_S con contexto reducido.
- Cabe en GPU consumer: si, desde Q2_K hasta Q5_K_M en GPUs de 16-24 GB; Q6_K y Q8_0 requieren 24 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama (mediante importacion de GGUF), LM Studio, text-generation-webui, koboldcpp. Para vLLM o TGI seria necesario usar el modelo base en safetensors, no estas cuantizaciones.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/gemma-3-27b-it-ultra-heretic-GGUF | ~27B | no disponible | gemma | GGUF | Variante uncensored/abliterated con vision |
| google/gemma-3-27b-it | ~27B | 128K (segun documentacion de Google) | gemma | safetensors, GGUF | Modelo original alineado, con rechazos |
| llmfan46/gemma-3-27b-it-ultra-uncensored-heretic | ~27B | no disponible | gemma | safetensors | Modelo base del que deriva esta cuantizacion |
| mradermacher/gemma-3-27b-it-ultra-heretic-i1-GGUF | ~27B | no disponible | gemma | GGUF (imatrix) | Misma variante con cuantizaciones ponderadas imatrix |

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": la reduccion de los mecanismos de rechazo implica que puede generar contenido toxico, ilegal, peligroso o sexualmente explicito; no es apto para produccion orientada al publico general.
- Riesgo elevado de alucinacion: el fine-tuning agresivo para eliminar rechazos puede degradar la calibracion y la factualidad respecto al Gemma 3 Instruct original.
- Licencia Gemma: el uso comercial esta sujeto a los Gemma Terms of Use de Google, que incluyen restricciones de uso aceptable; la naturaleza "uncensored" del modelo puede entrar en conflicto con dichos terminos.
- Idiomas: la model card solo declara ingles; el rendimiento en castellano no esta verificado y podria ser inferior al del Gemma 3 original.
- Contexto: no se confirma la longitud de contexto efectiva en esta variante; las cuantizaciones GGUF pueden degradar el rendimiento en contextos muy largos.
- Tool calling y agentes: no documentados; no se recomienda asumir su correcto funcionamiento sin validacion previa.
- Sesgos: hereda los sesgos del corpus de entrenamiento de Gemma 3, amplificados potencialmente por la eliminacion de filtros.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_S degradan notablemente la coherencia; para uso serio se recomienda Q4_K_M o superior.
- Vision: el `mmproj` debe descargarse por separado y su integracion depende del cliente (llama.cpp, koboldcpp); no todos los frontends lo soportan.
- Repositorio de 188,1 GB: requiere descargar solo la cuantizacion deseada, no el repositorio completo.

## Enlaces

- Repositorio Hugging Face (GGUF estatico): https://huggingface.co/mradermacher/gemma-3-27b-it-ultra-heretic-GGUF
- Repositorio Hugging Face (GGUF imatrix): https://huggingface.co/mradermacher/gemma-3-27b-it-ultra-heretic-i1-GGUF
- Modelo base en Hugging Face: https://huggingface.co/llmfan46/gemma-3-27b-it-ultra-uncensored-heretic
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-3-27b-it-ultra-heretic-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Pagina de Gemma 3 de Google: https://ai.google.dev/gemma
