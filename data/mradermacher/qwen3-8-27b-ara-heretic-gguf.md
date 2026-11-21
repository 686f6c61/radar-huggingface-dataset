# mradermacher/Qwen3.8-27B-ARA-heretic-GGUF

## Resumen

Qwen3.8-27B-ARA-heretic-GGUF es una distribucion de pesos cuantizados en formato GGUF del modelo richardyoung/Qwen3.8-27B-ARA-heretic, publicada por mradermacher. Se trata de una variante "abliterated" o "decensored" de un modelo de la familia Qwen de tercera generacion (segun la nomenclatura del autor), con aproximadamente 26.900 millones de parametros totales segun los tensores en safetensors del modelo base. El trabajo de mradermacher consiste en la conversion y cuantizacion estatica del modelo original a multiples precisiones para su uso con llama.cpp y ecosistemas compatibles.

El modelo aborda el problema del alineamiento restrictivo: las tecnicas de "abliteration" buscan eliminar o atenuar los rechazos aprendidos durante el ajuste por refuerzo, de modo que el modelo responda a peticiones que un modelo alineado convencional rechazaria. Esto lo hace relevante para investigadores que estudian el comportamiento de modelos sin censura, para tareas de generacion creativa con tematicas sensibles y para analisis de robustez y seguridad de sistemas.

La ficha cubre la distribucion GGUF: incluye cuantizaciones desde Q2_K (10,8 GB) hasta Q8_0 (28,7 GB), ademas de dos ficheros mmproj (Q8_0 y f16) que indican soporte multimodal, presumiblemente de vision. La licencia declarada es Apache 2.0, aunque las etiquetas del repositorio mencionan tambien openrail++.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3, segun nomenclatura del autor); detalles no disponibles |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj Q8_0 y f16 |
| Idiomas soportados | en (segun model card) |
| Licencia | apache-2.0 (etiquetas adicionales: openrail++) |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors |
| Tamano del repo | 187,9 GB |
| Cuantizado por | mradermacher (quantize_version 2, output_tensor_quantised 1) |
| Modelo base | richardyoung/Qwen3.8-27B-ARA-heretic |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por la nomenclatura ("Qwen3.8-27B") y el tamano de parametros, se trata de un transformer denso de aproximadamente 27.000 millones de parametros, coherente con la familia Qwen 3. El sufijo "ARA" y la etiqueta "heretic" indican que el modelo base fue sometido a un proceso de abliteration o decensoring, una tecnica que identifica y modifica las direcciones del espacio de activaciones asociadas al rechazo para reducir la tasa de respuestas negativas del modelo.

La model card de esta distribucion no aporta datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO en el modelo original. Tampoco se documenta ninguna innovacion arquitectonica especifica (atencion lineal, decodificacion especulativa, etc.). La aportacion de mradermacher es puramente de infraestructura: conversion de formato HF a GGUF y generacion de cuantizaciones estaticas reproducibles, con una variante adicional de cuantizaciones ponderadas con imatrix publicada en un repositorio separado (i1-GGUF).

La presencia de ficheros mmproj (multi-modal supplement) sugiere que el modelo base incorpora un proyector multimodal, probablemente para entrada de imagenes, aunque la model card no describe la arquitectura de vision ni el entrenamiento asociado.

## Capacidades

- Generacion de texto conversacional en ingles, con comportamiento "uncensored" o "decensored" derivado del proceso de abliteration.
- Capacidades multimodales indicadas por los ficheros mmproj (Q8_0 y f16), presumiblemente entrada de imagenes; la model card no detalla la naturaleza exacta de la modalidad.
- Razonamiento y generacion de codigo: no documentado explicitamente en la informacion disponible, aunque es esperable en un modelo de esta familia y tamano.
- Soporte de tool calling / function calling: no disponible en la documentacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentacion.
- Capacidades multilingues: la model card solo declara ingles (en).
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como varia la tasa de rechazo tras la abliteration, comparando respuestas con el modelo base alineado para analizar que comportamientos se suprimen y con que coste en calidad.
- Generacion creativa sin restricciones tematicas: util para escritura de ficcion con violencia, contenido adulto o temas controvertidos donde un modelo alineado introduciria rechazos o evasivas; el formato GGUF permite ejecutarlo en local con llama.cpp.
- Analisis de robustez de filtros: emplear el modelo como generador adversarial para probar clasificadores de contenido y sistemas de moderacion en pipelines de produccion.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M (16,6 GB) y Q5_K_M (19,3 GB) permiten ejecutar el modelo en GPUs de consumo con 24 GB de VRAM, como la RTX 4090, sin depender de servicios en la nube.
- Procesamiento de documentos con imagenes: los ficheros mmproj habilitan entrada multimodal en llama.cpp, lo que permite tareas de descripcion de imagenes o extraccion de informacion de capturas y documentos escaneados.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece once precisiones distintas, lo que facilita estudios de degradacion de perplejidad y calidad segun el nivel de cuantizacion, siguiendo las graficas de referencia de ikawrakow.
- Experimentacion en entornos aislados: al ser un modelo sin censura y con licencia permisiva, encaja en laboratorios que necesitan un generador de texto controlado y autoalojado para pruebas de red teaming.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye una grafica externa de ikawrakow comparando la perplejidad de distintos tipos de cuantizacion, sin valores numericos concretos para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~10,8 GB; Q3_K_M ~13,4 GB; Q4_K_S ~15,7 GB; Q4_K_M ~16,6 GB; Q5_K_M ~19,3 GB; Q6_K ~22,2 GB; Q8_0 ~28,7 GB. A estas cifras hay que sumar el espacio de contexto KV cache y, si se usa la modalidad multimodal, el fichero mmproj (0,7-1,0 GB).
- GPU recomendadas: para Q8_0 se necesita una GPU de 32 GB o mas (A100 40 GB, H100, RTX 5090 si se dispone de 32 GB); para Q5_K_M y Q6_K basta una RTX 4090 o RTX 3090 de 24 GB; para Q4_K_M cabe en 24 GB con contexto moderado.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090, RTX 4090) con cuantizaciones Q4_K_M o Q5_K_M; en tarjetas de 16 GB solo con Q2_K o Q3_K_S y contexto reducido, o mediante offload parcial a RAM.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa, por lo que para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-ARA-heretic-GGUF (este) | ~26,9 B | no disponible | apache-2.0 | GGUF (11 cuantizaciones) | Variante abliterated, multimodal via mmproj |
| richardyoung/Qwen3.8-27B-ARA-heretic | ~26,9 B | no disponible | apache-2.0 | safetensors | Modelo base sin cuantizar |
| mradermacher/Qwen3.8-27B-ARA-heretic-i1-GGUF | ~26,9 B | no disponible | apache-2.0 | GGUF (imatrix) | Cuantizaciones ponderadas del mismo modelo |
| Modelos Qwen 3 densos de ~27 B alineados | ~27 B | no disponible | variable | safetensors/GGUF | Alternativa alineada para comparar tasa de rechazo |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El proceso de abliteration degrada el alineamiento de seguridad: el modelo puede generar contenido danino, ilegal o eticamente problematico sin rechazo, lo que lo hace inadecuado para aplicaciones de cara al publico sin moderacion externa.
- Riesgo elevado de alucinacion, especialmente en cuantizaciones bajas (Q2_K, Q3_K_S) y en temas sobre los que el modelo no tiene conocimiento fiable; no hay benchmarks que cuantifiquen esta degradacion.
- La model card solo declara soporte de ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- La licencia presenta ambiguedad: el campo license indica apache-2.0, pero las etiquetas del repositorio incluyen openrail++, que impone restricciones de uso adicionales. Conviene verificar la licencia del modelo base antes de un uso comercial.
- El modelo base es a su vez una modificacion de un modelo Qwen; es necesario revisar los terminos de la licencia original de Qwen para uso comercial.
- No hay informacion sobre la longitud de contexto soportada, lo que impide planificar aplicaciones con ventanas largas sin pruebas previas.
- El repositorio ocupa 187,9 GB, lo que exige espacio en disco considerable si se descargan varias cuantizaciones.
- No se documentan sesgos especificos, pero al derivar de un modelo entrenado principalmente en ingles y sin ajuste de seguridad, es esperable que reproduzca y amplifique sesgos presentes en los datos de entrenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-ARA-heretic-GGUF
- Modelo base: https://huggingface.co/richardyoung/Qwen3.8-27B-ARA-heretic
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-ARA-heretic-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-ARA-heretic-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
