# mradermacher/MiniAI-Quata2-4b-v0.2-GGUF

## Resumen
MiniAI-Quata2-4b-v0.2-GGUF es la distribucion en formato GGUF del modelo MiniAI-Quata2-4b-v0.2, publicada por el usuario mradermacher. El modelo original lo desarrolla M1n1A1 y se presenta como un modelo conversacional de aproximadamente 4.841 millones de parametros, orientado a razonamiento y tool calling, con enfasis declarado en serbio y, por extension, en las variantes del serbocroata (sr, hr, bs) ademas del ingles. La model card del repositorio GGUF lo etiqueta con las familias "quata", "quata2" y "qwen3.5", lo que sugiere una base derivada del linaje Qwen, aunque no se detalla la arquitectura exacta.

Este repositorio no aporta pesos nuevos: es una cuantizacion estatica del modelo base M1n1A1/MiniAI-Quata2-4b-v0.2, publicada bajo licencia Apache 2.0. Incluye un conjunto amplio de cuantizaciones (desde Q2_K hasta f16) y un complemento multimodal mmproj, lo que indica que el modelo base incorpora capacidad de vision. Su relevancia practica esta en que permite ejecutar un modelo de ~4,8B con contexto conversacional y tool calling en hardware de consumo mediante llama.cpp u Ollama.

No obstante, la informacion disponible es limitada: no se publican resultados de benchmarks, no se especifica la longitud de contexto ni la composicion del dataset de entrenamiento en los datos proporcionados. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño total del repo es de 45,4 GB (suma de todas las cuantizaciones).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle no disponible; etiquetado como "qwen3.5" en la model card) |
| Parametros totales | 4.841.450.496 (~4,84B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 para vision |
| Idiomas soportados | en, sr, hr, bs |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base) |

## Arquitectura y entrenamiento
La informacion disponible no detalla la arquitectura interna del modelo base. La model card del repositorio GGUF lo etiqueta con las familias "quata", "quata2" y "qwen3.5", lo que apunta a un transformer derivado del linaje Qwen 3.5, pero no se confirma ni el tipo de atencion, ni si emplea atencion lineal, decodificacion especulativa u otras innovaciones. Tampoco se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o similares.

Lo que si se puede afirmar es que el modelo base incorpora un componente multimodal: el repositorio incluye ficheros mmproj (proyeccion multimodal) en Q8_0 y f16, que en el ecosistema llama.cpp se utilizan para modelos con vision. El proceso de cuantizacion lo realiza mradermacher con su herramienta habitual, generando cuantizaciones estaticas (no imatrix en este repo; las versiones ponderadas estan en el repositorio i1-GGUF enlazado en la model card).

## Capacidades
- Generacion de texto conversacional multi-turno.
- Razonamiento (etiqueta "reasoning" en la model card).
- Tool calling / function calling (etiqueta "tool-calling").
- Capacidad multimodal de vision, inferida por la presencia de ficheros mmproj en el repositorio.
- Soporte multilingue limitado a ingles, serbio, croata y bosnio.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- No se documentan capacidades de audio ni modo "thinking" explicito.

## Casos de uso
- Asistente conversacional en serbio, croata o bosnio: el modelo esta explicitamente orientado a estas lenguas, por lo que puede desplegarse como chatbot de atencion al usuario en esos idiomas con un coste de inferencia bajo (cuantizaciones de 3-5 GB).
- Integracion en pipelines con tool calling: al estar etiquetado para function calling, puede conectarse a APIs externas (consultas a bases de datos, busquedas, calculos) en flujos de automatizacion ligeros.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (3,2 GB) y Q5_K_M (3,6 GB) permiten ejecutar el modelo en GPUs de gama media o incluso en CPU con llama.cpp u Ollama.
- Prototipado rapido de agentes: su tamano reducido facilita iterar en local sobre flujos multi-paso sin depender de infraestructura cloud.
- Procesamiento de documentos con imagenes: gracias al complemento mmproj, puede emplearse para tareas basicas de descripcion o extraccion de informacion a partir de imagenes en entornos con recursos limitados.
- Traduccion y generacion de contenido entre ingles y las lenguas serbocroatas: util para localizacion de contenido o resumenes en esos idiomas.
- Educacion y experimentacion: al ser Apache 2.0 y caber en una unica GPU de consumo, es adecuado para investigacion academica y pruebas de concepto.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~2,2 GB
  - Q3_K_M: ~2,6 GB
  - Q4_K_M: ~3,2 GB
  - Q5_K_M: ~3,6 GB
  - Q6_K: ~4,1 GB
  - Q8_0: ~5,3 GB
  - f16: ~9,8 GB
  - Complemento vision mmproj: +0,5 GB (Q8_0) o +0,8 GB (f16)
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para las versiones de mayor precision. Las cuantizaciones bajas (Q2_K, Q3_K_S) pueden ejecutarse en GPUs de 4 GB.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 6 GB o mas para Q4_K_M/Q5_K_M; las versiones Q2/Q3 en 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (LM Studio, koboldcpp). Para el modelo base en safetensors, transformers con aceleracion por GPU.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares
No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables en la informacion proporcionada. A continuacion se ofrece una comparacion estructural limitada:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniAI-Quata2-4b-v0.2 (este) | ~4,84B | no disponible | Apache 2.0 | GGUF, safetensors | Enfocado a sr/hr/bs, vision via mmproj |
| Qwen2.5-3B / Qwen3-4B (referencia de linaje) | ~3-4B | no disponible en esta ficha | Apache 2.0 (segun variante) | GGUF, safetensors | Linaje Qwen citado en la model card; comparacion no verificada |
| Llama 3.2 3B | ~3,2B | no disponible en esta ficha | Llama Community License | GGUF, safetensors | Alternativa de tamano similar; comparacion no verificada |

La comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias
- No se han publicado benchmarks, por lo que el rendimiento real en tareas de razonamiento, codigo o matematicas es desconocido.
- El soporte multilingue se limita a en, sr, hr y bs; no se garantiza un buen comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinacion inherente a modelos de este tamano y sin datos de evaluacion publicados.
- La longitud de contexto no esta documentada; no debe asumirse una ventana larga.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validacion por parte de la comunidad.
- Aunque la licencia es Apache 2.0 (permite uso comercial), conviene verificar la licencia del modelo base M1n1A1/MiniAI-Quata2-4b-v0.2 y de su linaje (Qwen) antes de un despliegue en produccion.
- La etiqueta "qwen3.5" en la model card no esta confirmada por documentacion oficial; tratar como indicio, no como hecho verificado.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso practico.

## Enlaces
- Repositorio GGUF: https://huggingface.co/mradermacher/MiniAI-Quata2-4b-v0.2-GGUF
- Modelo base: https://huggingface.co/M1n1A1/MiniAI-Quata2-4b-v0.2
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/MiniAI-Quata2-4b-v0.2-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#MiniAI-Quata2-4b-v0.2-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
