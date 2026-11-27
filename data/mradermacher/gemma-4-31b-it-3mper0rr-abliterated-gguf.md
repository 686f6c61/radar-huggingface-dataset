# mradermacher/gemma-4-31b-it-3MPER0RR-abliterated-GGUF

## Resumen

`mradermacher/gemma-4-31b-it-3MPER0RR-abliterated-GGUF` es una coleccion de cuantizaciones GGUF del modelo `3MPER0RR/gemma-4-31b-it-3MPER0RR-abliterated`, un derivado "abliterated" (es decir, con los rechazos de seguridad atenuados mediante intervencion en los pesos) del modelo instructivo Gemma 4 de 31 mil millones de parametros. El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de versiones GGUF de la comunidad, y el modelo base procede del usuario 3MPER0RR.

El modelo resuelve el problema de ejecutar un LLM de aproximadamente 30.700 millones de parametros en hardware de consumo o en entornos con recursos limitados, ofreciendo desde cuantizaciones de 2 bits (12,0 GB) hasta 8 bits (32,7 GB). Al tratarse de una variante abliterated, esta orientado a usuarios que necesitan respuestas sin los filtros de rechazo habituales del modelo original, lo que lo hace relevante para investigacion sobre alineamiento, generacion creativa sin restricciones y evaluacion de sesgos.

La informacion disponible es limitada: la model card del repositorio GGUF es una plantilla automatica de cuantizacion y no documenta arquitectura, contexto, datos de entrenamiento ni benchmarks. Los datos tecnicos que se ofrecen a continuacion proceden del repositorio de Hugging Face y de la convencion de nombres del modelo base; el resto se marca explicitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4; familia transformer, sin confirmar en la informacion proporcionada) |
| Parametros totales | 30.697.345.596 (segun safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; ademas mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | en (segun metadatos; el modelo base podria soportar mas, pero no se confirma) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base en safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura en la documentacion proporcionada. El modelo base se distribuye en formato safetensors y pertenece a la familia Gemma 4, lo que sugiere una arquitectura transformer decoder-only, pero la model card no confirma capas, atencion, contexto ni vocabulario. La presencia de ficheros `mmproj` indica que el modelo base incorpora un proyector multimodal, es decir, capacidad de procesar imagenes ademas de texto, aunque no se detalla el codigo del vision encoder.

Respecto al entrenamiento, la informacion disponible no incluye numero de tokens, composicion del dataset, ni si hubo RLHF, DPO o ajuste instructivo. La etiqueta "abliterated" implica que se ha aplicado una tecnica de ortogonalizacion o ablacion de direcciones en el espacio de activaciones para reducir la tendencia del modelo a rechazar peticiones, pero no se documenta el metodo concreto ni el alcance de la intervencion. El autor de la cuantizacion solo indica que se trata de "static quants" del modelo base, sin imatrix (los quants con imatrix estan en un repositorio separado).

## Capacidades

- Generacion de texto conversacional: el modelo base es de tipo instructivo (`-it`), orientado a dialogos multi-turno.
- Capacidad multimodal: la presencia de ficheros `mmproj` indica soporte de entrada de imagenes, aunque no se detalla su alcance.
- Respuestas sin filtros de rechazo: la variante abliterated elimina o atenua las negativas del modelo original ante peticiones sensibles.
- Idiomas: los metadatos solo declaran ingles (`en`); no se confirma soporte multilingue.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo de razonamiento o thinking: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: comparar el comportamiento del modelo abliterated frente al Gemma 4 original permite estudiar como la ablacion de direcciones afecta a la tasa de rechazos y a la calidad de las respuestas.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que requiera tematicas adultas o controvertidas, donde el modelo original rechazaria peticiones.
- Despliegue en hardware de consumo: con la cuantizacion Q4_K_M (18,8 GB) el modelo puede ejecutarse en una GPU con 24 GB de VRAM, algo imposible con los pesos en safetensors (mas de 60 GB en fp16).
- Experimentacion con modelos multimodales en local: los ficheros `mmproj` permiten probar entrada de imagenes junto con texto usando llama.cpp, sin depender de APIs en la nube.
- Analisis de sesgos: al eliminar los filtros de seguridad, el modelo puede revelar sesgos latentes que el ajuste instructivo ocultaba, util para auditorias de equidad.
- Prototipado de asistentes conversacionales en ingles: con la cuantizacion Q5_K_M (21,9 GB) se obtiene un equilibrio entre calidad y requisitos de memoria para pruebas de concepto.
- Evaluacion de tecnicas de cuantizacion: el repositorio ofrece 11 variantes de cuantizacion del mismo modelo, lo que permite medir el impacto de cada tipo en perplejidad y calidad de generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: 12,0 GB
  - Q3_K_S: 13,9 GB
  - Q3_K_M: 15,4 GB
  - Q3_K_L: 16,7 GB
  - IQ4_XS: 17,0 GB
  - Q4_K_S: 17,9 GB
  - Q4_K_M: 18,8 GB
  - Q5_K_S: 21,4 GB
  - Q5_K_M: 21,9 GB
  - Q6_K: 25,3 GB
  - Q8_0: 32,7 GB
  - mmproj-Q8_0: 0,9 GB adicionales; mmproj-f16: 1,3 GB adicionales
- GPU recomendadas: para Q4_K_M o inferiores, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para Q6_K y Q8_0 se recomienda A100 40 GB, H100 80 GB o configuraciones multi-GPU.
- Cabe en consumer GPU: si, en GPUs de 16 GB con cuantizaciones Q3_K_S o inferiores (con contexto reducido); en GPUs de 24 GB con Q4_K_M y Q5_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los quants con imatrix estan en el repositorio `mradermacher/gemma-4-31b-it-3MPER0RR-abliterated-i1-GGUF`. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-4-31b-it-3MPER0RR-abliterated-GGUF (este) | 30,7 B | no disponible | apache-2.0 | GGUF | Cuantizaciones estaticas, sin imatrix |
| gemma-4-31b-it-3MPER0RR-abliterated-i1-GGUF | 30,7 B | no disponible | apache-2.0 | GGUF | Mismo modelo con cuantizaciones imatrix |
| 3MPER0RR/gemma-4-31b-it-3MPER0RR-abliterated | 30,7 B | no disponible | apache-2.0 | safetensors | Modelo base sin cuantizar |
| Gemma 4 31B IT (original) | 30,7 B | no disponible | no disponible | safetensors | Modelo de referencia con filtros de seguridad |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La variante abliterated elimina o reduce los rechazos de seguridad: el modelo puede generar contenido danino, ofensivo o ilegal sin advertir. No es apto para aplicaciones de cara al publico sin capas de moderacion adicionales.
- Riesgo elevado de alucinacion: no se han publicado evaluaciones de fidelidad factual para este derivado.
- Idiomas: los metadatos solo declaran ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Contexto: se desconoce la longitud de ventana; no debe asumirse un contexto largo sin verificacion empirica.
- Licencia apache-2.0: permite uso comercial, pero el modelo base y su derivado abliterated pueden estar sujetos a los terminos de Gemma; conviene revisar la licencia del modelo original antes de desplegar en produccion.
- Cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan notablemente la calidad; el autor recomienda Q4_K_S o Q4_K_M para uso general y Q6_K o Q8_0 cuando la calidad es critica.
- La model card no documenta el proceso de abliteration ni sus efectos colaterales sobre capacidades como matematicas o codigo.
- El repositorio tiene 981 descargas y 0 likes, lo que indica una validacion comunitaria muy limitada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma-4-31b-it-3MPER0RR-abliterated-GGUF
- Modelo base: https://huggingface.co/3MPER0RR/gemma-4-31b-it-3MPER0RR-abliterated
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma-4-31b-it-3MPER0RR-abliterated-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-4-31b-it-3MPER0RR-abliterated-GGUF
- README de referencia para GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
