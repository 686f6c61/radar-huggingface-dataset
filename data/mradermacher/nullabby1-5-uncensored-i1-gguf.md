# mradermacher/nullabby1.5-uncensored-i1-GGUF

## Resumen

nullabby1.5-uncensored-i1-GGUF es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo nulliaukamk/nullabby1.5-uncensored, un modelo de lenguaje de aproximadamente 8.950 millones de parametros (8,95 B) construido sobre la familia Qwen3.5. Se distribuye como pesos cuantizados con la libreria llama.cpp en formato GGUF, pensados para inferencia local en hardware de consumo, y se publica bajo licencia Apache 2.0.

El modelo base pertenece a la categoria de modelos "abliterated" o "uncensored": ha sido modificado mediante tecnicas de eliminacion de rechazos (abliteration, probablemente con la herramienta Heretic, segun las etiquetas) para reducir las negativas del modelo a responder ante contenido sensible. Esto lo orienta a usos de investigacion sobre alineamiento, generacion creativa sin filtros y experimentacion con prompts que un modelo alineado convencional rechazaria.

La relevancia de esta ficha reside en que ofrece un abanico muy amplio de cuantizaciones (desde i1-IQ1_S de 3,0 GB hasta i1-Q6_K de 7,5 GB), lo que permite ejecutar un modelo de casi 9 B en GPUs consumer con VRAM limitada. Ademas, el autor indica que el modelo base es multimodal (vision), aunque los ficheros mmproj, si existen, se alojan en el repositorio estatico hermano y no en este.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3.5 (según etiquetas del autor) |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix) |
| Idiomas soportados | en (segun la model card del autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del autor, que apuntan a la familia Qwen3.5 y a un transformer denso de unos 8,95 B de parametros. No se especifican el numero de capas, la dimension del modelo, el tipo de atencion ni la longitud de contexto nativa. Tampoco se documentan los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, fases de RLHF/DPO o SFT).

El rasgo tecnico diferencial es el proceso de "abliteration" (etiquetas heretic, uncensored, decensored, abliterated): una modificacion de los pesos orientada a eliminar la direccion de rechazo aprendida durante el alineamiento, de modo que el modelo responda a peticiones que un modelo alineado convencional rechazaria. Las cuantizaciones de este repositorio se generan con ficheros imatrix (matriz de importancia) para mejorar la calidad de las cuantizaciones de baja precision, y el autor ofrece versiones estaticas equivalentes en un repositorio paralelo.

## Capacidades

- Generacion de texto conversacional en ingles, con etiqueta de tarea conversational.
- Razonamiento y generacion de texto general heredados del modelo base Qwen3.5.
- Capacidad multimodal (vision) segun la model card del cuantizador; los ficheros mmproj, si existen, estarian en el repositorio estatico.
- Comportamiento "uncensored": menor tasa de rechazos ante peticiones sensibles.
- Compatibilidad con text-generation-inference y transformers segun las etiquetas del repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como responde un modelo abliterated frente a uno alineado ante el mismo conjunto de prompts, comparando tasas de rechazo y calidad de respuesta.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa con tematicas adultas o controvertidas donde un modelo alineado aplicaria rechazos, ejecutandose en local con llama.cpp.
- Despliegue en hardware de consumo: las cuantizaciones de 4-6 GB (i1-Q4_K_M, i1-Q5_K_M) permiten ejecutar un modelo de 8,95 B en GPUs de 8-12 GB de VRAM o incluso en CPU con RAM suficiente.
- Prototipado rapido en local: usar Ollama o llama.cpp con la cuantizacion i1-Q4_K_M para experimentar con un modelo de ~9 B sin depender de APIs externas ni de conexion.
- Analisis de documentos e imagenes (si se dispone del mmproj): el caracter multimodal del modelo base permitiria tareas de descripcion de imagenes o extraccion de informacion visual, aunque esta capacidad no esta confirmada en este repositorio.
- Evaluacion de cuantizaciones: el amplio abanico de quants (24 variantes) permite medir el impacto de la cuantizacion en la perplejidad y la calidad de respuesta sobre un mismo modelo base.
- Experimentacion con pipelines de TGI: la etiqueta text-generation-inference sugiere compatibilidad con el servidor de Hugging Face para servir el modelo en entornos de prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion): ~3,0 GB (i1-IQ1_S) hasta ~7,5 GB (i1-Q6_K); las opciones recomendadas i1-Q4_K_M (~5,8 GB) e i1-Q5_K_M (~6,6 GB) requieren entre 6 y 7 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090; en el segmento profesional, A100 o H100 para mayor throughput.
- Cabe en GPU consumer: si, desde GPUs de 8 GB (con quants Q3/Q4) hasta 12-16 GB (Q5/Q6); las cuantizaciones de 1-2 bits caben en 4 GB pero con calidad muy degradada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (segun etiquetas) y servidores compatibles con GGUF; el autor enlaza instrucciones de TheBloke para el uso de GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| nullabby1.5-uncensored-i1-GGUF | 8,95 B | no disponible | Apache 2.0 | GGUF (24 quants) | Abliterated, vision segun model card, solo ingles |
| Modelo base nullabby1.5-uncensored | 8,95 B | no disponible | Apache 2.0 | safetensors | Version sin cuantizar del mismo modelo |
| Qwen3.5 base (familia) | ~9 B (segun etiqueta) | no disponible | no disponible | no disponible | Modelo alineado de referencia de la misma familia |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas; la comparacion se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- El proceso de abliteration elimina los rechazos de seguridad: el modelo puede generar contenido danino, ofensivo o ilegal; no debe desplegarse en produccion orientada al publico sin filtros externos.
- Riesgo elevado de alucinacion: no se han publicado evaluaciones de fiabilidad ni benchmarks que cuantifiquen su precision.
- Idiomas: la model card solo declara ingles; el rendimiento en castellano u otros idiomas no esta verificado y probablemente sea deficiente.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperacion con contexto extenso.
- La capacidad de vision no esta confirmada en este repositorio; los ficheros mmproj, si existen, residen en el repositorio estatico hermano.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado por un modelo sin censura puede acarrear responsabilidad legal segun la jurisdiccion y el uso.
- Las cuantizaciones de 1-2 bits (i1-IQ1_S a i1-IQ2_M) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "mostly desperate".
- El repositorio pesa 111,7 GB por incluir todas las variantes; conviene descargar solo el fichero GGUF necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/nullabby1.5-uncensored-i1-GGUF
- Modelo base: https://huggingface.co/nulliaukamk/nullabby1.5-uncensored
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/nullabby1.5-uncensored-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#nullabby1.5-uncensored-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
