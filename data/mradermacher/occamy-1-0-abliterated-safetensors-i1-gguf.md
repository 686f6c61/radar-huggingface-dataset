# mradermacher/occamy-1.0-abliterated-safetensors-i1-GGUF

## Resumen

Occamy-1.0-abliterated-safetensors-i1-GGUF es una cuantizacion GGUF del modelo Occamy-1.0-abliterated-safetensors, publicada por el usuario mradermacher, especializado en la conversion y cuantizacion de pesos de modelos abiertos. El modelo base, alojado por el usuario 977895k, es una variante "abliterated" de Occamy-1.0, es decir, una version en la que se ha aplicado la tecnica de abliteration para eliminar la direccion de rechazo del modelo, reduciendo sus restricciones de alineacion. Esta cuantizacion concreta emplea el metodo i1 (imatrix), que utiliza una matriz de importancia para preservar mejor la calidad en tasas de compresion agresivas.

El modelo cuenta con aproximadamente 34.660 millones de parametros en formato safetensors, lo que lo situa en la categoria de 34B, un tamano intermedio que permite un equilibrio entre capacidad y requisitos de hardware. Esta orientado a tareas conversacionales y esta etiquetado para el idioma ingles. La cuantizacion disponible en este repositorio es i1-Q2_K, con un tamano de 13,0 GB, lo que facilita su despliegue en hardware con recursos limitados de VRAM.

La relevancia de esta publicacion radica en que permite ejecutar un modelo de 34B en GPUs de consumo mediante cuantizacion agresiva, aunque con las limitaciones de calidad inherentes a una cuantizacion de 2 bits. Es importante senalar que se trata de una cuantizacion de un modelo derivado (abliterated), no de un modelo original, y que la informacion disponible sobre el modelo base es muy limitada: no se especifican datos de entrenamiento, arquitectura detallada, benchmarks ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, segun la libreria transformers) |
| Parametros totales | 34.660.610.688 (~34,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (disponible en este repo); el autor indica que IQ3_XXS probablemente sea mejor; existen quants estaticos en el repo hermano -GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base Occamy-1.0. La libreria declarada es transformers y el modelo base se distribuye en safetensors, lo que sugiere una arquitectura transformer convencional, pero no se especifican el tipo de atencion, la longitud de contexto nativa, la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion.

La unica innovacion tecnica documentada en esta publicacion es el proceso de cuantizacion: se trata de quants i1 (imatrix), generados con una matriz de importancia para mejorar la fidelidad de los pesos cuantizados respecto a los originales. El autor indica que la cuantizacion se realizo sobre el modelo abliterated, lo que implica que las modificaciones de abliteration ya estan incorporadas en los pesos de origen. No se detalla el proceso de abliteration aplicado al modelo original.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del repositorio.
- Razonamiento general y respuesta a instrucciones, heredado del modelo base (no verificado con benchmarks).
- Capacidades multilingues limitadas al ingles segun la etiqueta de idioma.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta vision, audio ni modo thinking.
- Al ser una variante abliterated, se espera una reduccion de los rechazos ante solicitudes que el modelo original declinaria, aunque este comportamiento no esta cuantificado en la informacion disponible.

## Casos de uso

- Experimentacion con modelos de 34B en hardware de consumo: la cuantizacion i1-Q2_K de 13,0 GB permite cargar el modelo en GPUs con 16 GB de VRAM, facilitando pruebas de inferencia local sin infraestructura de datacenter.
- Investigacion sobre abliteration: el modelo permite estudiar el efecto de la eliminacion de la direccion de rechazo en el comportamiento conversacional, comparando respuestas con el modelo original.
- Generacion de texto creativo en ingles: el modelo puede emplearse para redaccion y lluvia de ideas, aunque la cuantizacion a 2 bits puede degradar la coherencia en textos largos.
- Desarrollo de prototipos de chat: al ser compatible con endpoints y con la libreria transformers, puede integrarse en aplicaciones de chat locales mediante llama.cpp u Ollama.
- Evaluacion de calidad de cuantizaciones: util para comparar la degradacion de un modelo de 34B entre distintos niveles de cuantizacion (i1-Q2_K frente a IQ3_XXS o quants estaticos del repo hermano).
- Pruebas de pipelines de inferencia: sirve para validar configuraciones de despliegue (llama.cpp, servidores compatibles con la API de OpenAI) antes de pasar a cuantizaciones de mayor calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para la cuantizacion i1-Q2_K: aproximadamente 13,0 GB solo para los pesos, mas overhead de contexto y KV cache; se recomienda un minimo de 16 GB de VRAM para contexto corto.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB), H100 (80 GB) para cuantizaciones mayores o contexto largo.
- Cabe en GPUs de consumo con 16 GB o mas (RTX 4080, RTX 4070 Ti Super, RTX 4060 Ti 16 GB) usando i1-Q2_K con contexto moderado.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con la API de OpenAI (el repo incluye la etiqueta endpoints_compatible). Tambien puede usarse con transformers si se dispone de los pesos en safetensors del modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Occamy-1.0-abliterated i1-GGUF (este) | ~34,7B | no disponible | no disponible | GGUF (i1-Q2_K) | Cuantizacion imatrix de un modelo abliterated |
| Occamy-1.0-abliterated-safetensors (base) | ~34,7B | no disponible | no disponible | safetensors | Modelo original sin cuantizar |
| Occamy-1.0-abliterated-safetensors-GGUF (quants estaticos) | ~34,7B | no disponible | no disponible | GGUF | Quants estaticos del mismo modelo, sin imatrix |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion i1-Q2_K es de muy baja precision (2 bits); el propio autor sugiere que IQ3_XXS probablemente sea mejor, lo que indica una degradacion de calidad esperable.
- El modelo base es una variante abliterated: se ha reducido deliberadamente la alineacion y los rechazos, lo que puede aumentar la probabilidad de generar contenido inapropiado, sesgado o danino. No se recomienda su uso en produccion orientada al publico sin filtros adicionales.
- Riesgo de alucinacion no cuantificado; los modelos de 34B cuantizados a 2 bits pueden incrementar la incoherencia y las respuestas erroneas.
- Idioma limitado al ingles; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Licencia no disponible: no se puede confirmar si se permite el uso comercial. Es imprescindible verificar la licencia del modelo base antes de cualquier despliegue productivo.
- No hay informacion sobre sesgos conocidos, datos de entrenamiento ni evaluaciones de seguridad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/occamy-1.0-abliterated-safetensors-i1-GGUF
- Modelo base: https://huggingface.co/977895k/occamy-1.0-abliterated-safetensors
- Quants estaticos del mismo modelo: https://huggingface.co/mradermacher/occamy-1.0-abliterated-safetensors-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#occamy-1.0-abliterated-safetensors-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
