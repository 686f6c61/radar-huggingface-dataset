# phoexud/gemma-4-31B-it-ARA-heretic-GGUF

## Resumen

`phoexud/gemma-4-31B-it-ARA-heretic-GGUF` es una distribucion en formato GGUF del modelo `richardyoung/gemma-4-31B-it-ARA-heretic`, una variante "abliterated" o "decensored" de Gemma 4 de 31B en su version instruction-tuned. El modelo original parte de la familia Gemma 4 de Google y ha sido modificado mediante tecnicas de abliteration para eliminar los rechazos y el alineamiento de seguridad, orientandolo a casos de uso sin censura. El repositorio esta publicado por el usuario phoexud y las cuantizaciones estaticas han sido generadas por mradermacher.

Con 30.697.345.596 parametros totales (aproximadamente 30,7B), el modelo se distribuye exclusivamente en formato GGUF con un conjunto de cuantizaciones que van desde Q2_K (12,0 GB) hasta Q8_0 (32,7 GB), ademas de dos ficheros mmproj (Q8_0 y f16) que indican soporte multimodal de vision. El repositorio ocupa 213,9 GB en total, lo que refleja la suma de todas las variantes publicadas.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un modelo base de ultima generacion de Google (Gemma 4), una modificacion de alineamiento (heretic/abliterated) y una distribucion optimizada para inferencia local via llama.cpp. La licencia declarada es Apache 2.0, aunque la model card enlaza a la licencia oficial de Gemma 4 de Google, lo que introduce una ambiguedad relevante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4; arquitectura transformer, detalles no especificados en la informacion proporcionada) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (segun metadatos del repositorio) |
| Licencia | apache-2.0 (con enlace a la licencia oficial de Gemma 4 de Google) |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base original presumiblemente en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna, el numero de tokens de entrenamiento ni la composicion del dataset en la informacion proporcionada. El modelo deriva de Gemma 4 de Google en su variante instruction-tuned (sufijo `-it`), por lo que hereda la arquitectura y el entrenamiento base de dicha familia, pero los detalles concretos no estan documentados en la model card accesible.

La innovacion principal de esta variante es el proceso de "abliteration" o "decensored" aplicado por richardyoung sobre el modelo base, cuyo objetivo es eliminar los comportamientos de rechazo y el alineamiento de seguridad. El repositorio se etiqueta como `heretic`, `uncensored`, `decensored`, `abliterated` y `reproducible`. Las cuantizaciones han sido generadas por mradermacher mediante su pipeline estandar (quantize_version 2, output_tensor_quantised 1, convert_type hf), e incluyen ficheros mmproj que confirman capacidad multimodal de vision en el modelo original. No se documentan tecnicas adicionales como decodificacion especulativa o attention linear.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Gemma 4 instruction-tuned.
- Capacidad multimodal de vision: la presencia de ficheros `mmproj-Q8_0.gguf` y `mmproj-f16.gguf` indica soporte de entrada de imagenes en el modelo base.
- Comportamiento "uncensored": el proceso de abliteration elimina los rechazos de seguridad, permitiendo respuestas sobre temas que el modelo original rechazaria.
- Razonamiento y generacion de codigo: capacidades heredadas de Gemma 4, aunque no se documentan resultados especificos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos del repositorio.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar el efecto de la abliteration comparando sus respuestas con las del Gemma 4 original, util para analisis de robustez de salvaguardas.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o contenido narrativo que aborde temas sensibles sin los rechazos del modelo alineado.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M (18,8 GB) y Q5_K_M (21,9 GB) permiten ejecutar un modelo de ~30B en GPUs consumer de gama alta o en configuraciones multi-GPU.
- Procesamiento de documentos con imagenes: gracias a los ficheros mmproj, puede emplearse para tareas de vision-lenguaje como descripcion de imagenes o extraccion de informacion de capturas y documentos escaneados.
- Evaluacion comparativa de cuantizaciones: el amplio rango de cuantizaciones (Q2_K a Q8_0) permite medir el impacto de la compresion en la calidad de un modelo de 30B, util para investigacion de tecnicas de cuantizacion.
- Base para fine-tuning o experimentacion: al estar en formato GGUF y derivar de un modelo Apache 2.0 (con caveats), sirve como punto de partida para experimentos de adaptacion en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): desde ~12 GB (Q2_K) hasta ~32,7 GB (Q8_0). La cuantizacion recomendada Q4_K_M requiere ~18,8 GB solo para pesos.
- VRAM adicional necesaria para el contexto KV cache: no cuantificada en la informacion disponible; en un modelo de ~30B con contexto largo puede sumar varios GB.
- GPU recomendadas: para Q8_0 o Q6_K, una A100 40GB/80GB o H100; para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) puede ser suficiente si se limita el contexto; configuraciones multi-GPU (2x RTX 4090) permiten cuantizaciones mayores.
- Cabe en consumer GPU: si, en GPUs de 24 GB con cuantizaciones Q4 o inferiores y contexto moderado; las cuantizaciones Q5 y superiores probablemente requieran 32 GB o multi-GPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; los tags indican `endpoints_compatible`. No se documenta soporte explicito de vLLM o TGI (estos suelen requerir safetensors).
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| phoexud/gemma-4-31B-it-ARA-heretic-GGUF | ~30,7B | no disponible | GGUF | apache-2.0 (enlace a licencia Gemma 4) | Variante abliterated de Gemma 4, multimodal via mmproj |
| richardyoung/gemma-4-31B-it-ARA-heretic | ~30,7B | no disponible | safetensors (presumible) | no disponible | Modelo base del que deriva esta distribucion |
| mradermacher/gemma-4-31B-it-ARA-heretic-i1-GGUF | ~30,7B | no disponible | GGUF (imatrix) | no disponible | Cuantizaciones con imatrix, misma base, alternativa de calidad |

No se dispone de informacion sobre benchmarks que permita comparar el rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo "uncensored" / abliterated: la eliminacion del alineamiento de seguridad puede producir contenido ofensivo, peligroso o legalmente problematico; no es adecuado para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documentan mitigaciones especificas en esta variante.
- Idiomas: los metadatos declaran unicamente ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Licencia ambigua: el repositorio declara Apache 2.0 pero enlaza a la licencia oficial de Gemma 4 de Google, que puede imponer restricciones adicionales al uso comercial; es necesario revisar los terminos de Gemma antes de un despliegue comercial.
- Contexto: no se especifica la longitud de contexto soportada, lo que dificulta planificar aplicaciones con ventanas largas.
- Tamano del repositorio: 213,9 GB, lo que implica un coste de almacenamiento y ancho de banda considerable si se descargan todas las variantes.
- Madurez: el repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.
- Procedencia de las cuantizaciones: generadas por mradermacher a partir del modelo de richardyoung; la calidad de la abliteration original no esta verificada de forma independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/phoexud/gemma-4-31B-it-ARA-heretic-GGUF
- Modelo base: https://huggingface.co/richardyoung/gemma-4-31B-it-ARA-heretic
- Cuantizaciones imatrix (mradermacher): https://huggingface.co/mradermacher/gemma-4-31B-it-ARA-heretic-i1-GGUF
- Pagina de descargas de mradermacher para este modelo: https://hf.tst.eu/model#gemma-4-31B-it-ARA-heretic-GGUF
- Licencia oficial de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
