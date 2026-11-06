# mradermacher/BelGemma-E2B-GGUF

## Resumen

BelGemma-E2B-GGUF es la coleccion de cuantizaciones GGUF del modelo BelGemma-E2B, publicada por el usuario mradermacher. El modelo base es vrutkovs/BelGemma-E2B, un modelo derivado de la familia Gemma (etiquetado como gemma4 en los tags) y orientado a generacion de texto. Esta publicacion no introduce pesos nuevos: su valor esta en ofrecer el modelo original en formatos GGUF de distintos tamanos para su uso con llama.cpp y herramientas compatibles, lo que facilita el despliegue en hardware modesto.

El modelo cuenta con 4.647.450.147 parametros totales segun los pesos safetensors del modelo base. La nomenclatura "E2B" sugiere una variante de la familia Gemma con aproximadamente 4.600 millones de parametros, aunque la informacion proporcionada no detalla la arquitectura interna ni el proceso de entrenamiento del modelo original. La licencia declarada es Apache 2.0 y el idioma indicado es el ingles.

La relevancia de esta ficha es practica: permite a desarrolladores e investigadores evaluar rapidamente si esta cuantizacion encaja en su infraestructura. El repositorio incluye cuantizaciones desde Q2_K (3,1 GB) hasta f16 (9,4 GB), ademas de dos ficheros mmproj (Q8_0 y f16) que apuntan a un componente multimodal, aunque la model card no documenta capacidades de vision de forma explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como gemma4) |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base vrutkovs/BelGemma-E2B en la documentacion proporcionada. Los tags del repositorio incluyen "gemma4" y "unsloth", lo que apunta a un modelo derivado de la familia Gemma y potencialmente ajustado con herramientas de Unsloth, pero no se confirma el tipo de transformer, el numero de capas, las dimensiones de atencion ni si emplea mecanismos como attention lineal o decodificacion especulativa.

Tampoco se documentan los datos de entrenamiento: numero de tokens, composicion del dataset, fases de RLHF o DPO, ni innovaciones tecnicas del modelo original. La presente publicacion es exclusivamente un proceso de cuantizacion estatica (quantize_version 2, output_tensor_quantised 1) sobre los pesos en formato Hugging Face del modelo base. El autor indica que las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de la publicacion, y que podrian no planearse.

## Capacidades

- Generacion de texto en ingles: el modelo esta etiquetado como text-generation-inference y transformers, con el idioma en como unico idioma declarado.
- Compatibilidad con endpoints: el tag endpoints_compatible sugiere uso con APIs de inferencia compatibles con Hugging Face.
- Posible componente multimodal: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que indica que el modelo base podria tener capacidad de procesamiento de imagenes, aunque la model card no lo documenta explicitamente.
- Cuantizacion para hardware limitado: disponibilidad de variantes desde 3,1 GB (Q2_K) hasta 9,4 GB (f16), lo que permite ajustar el equilibrio calidad/tamano.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, matematicas, codigo ni modo thinking.

## Casos de uso

- Prototipado local en equipos de desarrollo: con la cuantizacion Q4_K_M (3,5 GB) el modelo puede ejecutarse en portatiles con GPU consumer de 6-8 GB de VRAM, lo que permite iterar sobre prompts y flujos de generacion de texto sin depender de servicios en la nube.
- Generacion de texto en ingles en entornos con recursos limitados: la variante Q2_K (3,1 GB) permite desplegar generacion de texto en dispositivos con poca memoria, a costa de una menor calidad, adecuada para tareas de clasificacion o resumen simple.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece un espectro amplio de cuantizaciones (de Q2_K a f16) que permite medir el impacto de la cuantizacion en la perplejidad y la calidad de salida sobre un mismo modelo base.
- Despliegue en pipelines de inferencia con llama.cpp: los ficheros GGUF son compatibles con llama.cpp y herramientas derivadas, lo que facilita integrar el modelo en scripts de procesamiento por lotes o servicios ligeros.
- Investigacion sobre modelos derivados de Gemma: util para estudiar el comportamiento de variantes ajustadas de la familia Gemma en formato cuantizado, comparando con los pesos originales en safetensors.
- Experimentacion multimodal (con cautela): la presencia de ficheros mmproj sugiere que, si el modelo base soporta vision, podria probarse en tareas de descripcion de imagenes con llama.cpp, aunque esta capacidad no esta documentada y debe validarse empiricamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~3,1 GB; Q3_K_S ~3,2 GB; Q3_K_M ~3,3 GB; Q3_K_L ~3,4 GB; IQ4_XS ~3,4 GB; Q4_K_S ~3,5 GB; Q4_K_M ~3,5 GB; Q5_K_S ~3,7 GB; Q5_K_M ~3,7 GB; Q6_K ~3,9 GB; Q8_0 ~5,1 GB; f16 ~9,4 GB. A estas cifras hay que sumar la memoria para el contexto KV cache, que depende de la longitud de contexto configurada (no documentada).
- GPU recomendadas: para Q4_K_M o Q5_K_M, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB es suficiente; para Q8_0, una RTX 4070 Ti Super de 16 GB o superior; para f16, una RTX 4090 de 24 GB o una A100/H100 en entornos de servidor.
- Cabe en GPU consumer: si, practicamente todas las cuantizaciones hasta Q8_0 caben en GPUs consumer de 8 GB o mas; f16 requiere 12 GB o mas de VRAM libre.
- Opciones de despliegue: llama.cpp, Ollama (mediante importacion de GGUF), y servidores compatibles con GGUF; el modelo base tambien es compatible con transformers y text-generation-inference segun los tags.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| BelGemma-E2B-GGUF (este) | 4.647.450.147 | no disponible | apache-2.0 | GGUF | Hugging Face |
| vrutkovs/BelGemma-E2B (base) | 4.647.450.147 | no disponible | apache-2.0 | safetensors | Hugging Face |
| Gemma 2B (referencia de familia) | no disponible en esta ficha | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de contexto para establecer una comparativa cuantitativa con alternativas de la misma categoria. La comparacion mas directa es con el modelo base vrutkovs/BelGemma-E2B, del que esta publicacion es una cuantizacion.

## Limitaciones y advertencias

- Idioma: el unico idioma declarado es el ingles; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Modelo derivado sin documentacion de entrenamiento: al no detallarse el dataset ni el proceso de ajuste del modelo base, no es posible evaluar sesgos conocidos ni la calidad de alineacion.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; no se han publicado evaluaciones que lo cuantifiquen.
- Perdida de calidad por cuantizacion: las variantes Q2_K y Q3_K pueden degradar notablemente la calidad; el autor recomienda Q4_K_S o Q4_K_M como opciones rapidas y Q6_K o Q8_0 para mayor fidelidad.
- Capacidad multimodal no confirmada: la presencia de ficheros mmproj no implica que la vision funcione correctamente; debe validarse antes de usarla en produccion.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datos de entrenamiento originales, no documentados aqui.
- Longitud de contexto desconocida: no se puede planificar el uso en tareas de contexto largo sin determinar experimentalmente la ventana soportada.
- Repositorio de cuantizacion: el mantenimiento depende de un tercero (mradermacher), no del autor original del modelo; las actualizaciones pueden no reflejar cambios del modelo base.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/mradermacher/BelGemma-E2B-GGUF
- Modelo base: https://huggingface.co/vrutkovs/BelGemma-E2B
- Pagina de descargas del autor: https://hf.tst.eu/model#BelGemma-E2B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
