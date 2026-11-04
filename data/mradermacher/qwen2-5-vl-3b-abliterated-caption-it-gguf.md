# mradermacher/Qwen2.5-VL-3B-Abliterated-Caption-it-GGUF

## Resumen

Qwen2.5-VL-3B-Abliterated-Caption-it-GGUF es la distribucion en formato GGUF del modelo prithivMLmods/Qwen2.5-VL-3B-Abliterated-Caption-it, un modelo de vision-lenguaje (VLM) de 3.085.938.688 parametros afinado especificamente para generacion de subtitulos de imagen (image captioning) y comprension visual. La cuantizacion la firma mradermacher, un actor habitual en el ecosistema de pesos GGUF para llama.cpp, que publica en este repositorio 13 variantes de cuantizacion estatica mas dos ficheros mmproj (proyector multimodal).

El modelo parte de la familia Qwen2.5-VL de Alibaba, de la que hereda la arquitectura transformer multimodal con proyector visual, y ha sido sometido a un proceso de "abliteration" (ablacion de direcciones de rechazo en el espacio de activaciones) que elimina los comportamientos de negativa del modelo, de ahi la etiqueta `uncensored`. El resultado es un modelo especializado en describir imagenes sin las restricciones tipicas de los modelos alineados.

Su relevancia practica radica en que ofrece capacidades de captioning y comprension visual en un tamano de 3B parametros que, en cuantizaciones Q4_K_M (2,0 GB) o Q5_K_M (2,3 GB), cabe en GPUs de consumo y en CPU con llama.cpp, lo que lo hace util para pipelines de generacion masiva de metadatos de imagen, etiquetado de datasets y prototipado local de aplicaciones multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen2.5-VL) con proyector visual |
| Parametros totales | 3.085.938.688 (3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-VL, un transformer multimodal que combina un codificador visual con un modelo de lenguaje Qwen2.5 y un proyector que mapea las representaciones visuales al espacio de embeddings del LLM. El modelo base declarado es prithivMLmods/Qwen2.5-VL-3B-Abliterated-Caption-it, un afinamiento del Qwen2.5-VL-3B orientado a captioning y comprension visual, al que se le ha aplicado una tecnica de abliteration para eliminar las direcciones de activacion asociadas a rechazos y respuestas negativas.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset de afinamiento, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documentan innovaciones especificas de decodificacion. La contribucion de este repositorio es exclusivamente la cuantizacion GGUF del modelo base para su uso con llama.cpp y derivados, incluyendo los ficheros mmproj necesarios para procesar imagenes.

## Capacidades

- Generacion de descripciones de imagen (image captioning) en ingles, tarea principal para la que fue afinado.
- Comprension visual general: identificacion de objetos, escenas, texto en imagen y relaciones espaciales.
- Generacion de texto conversacional a partir de entradas multimodales (pipeline `image-to-text`).
- Funcionamiento sin censura en las respuestas gracias al proceso de abliteration, lo que permite describir contenido que los modelos alineados rechazarian.
- Soporte de inferencia local via llama.cpp y servidores compatibles con la API de OpenAI (etiqueta `endpoints_compatible`).
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documenta soporte explicito de tool calling, function calling ni modo de razonamiento extendido (thinking) en la informacion disponible.

## Casos de uso

- Etiquetado masivo de datasets de imagen: el modelo puede generar descripciones automaticas para grandes volumenes de imagenes en pipelines offline con llama.cpp, reduciendo el coste frente a APIs comerciales y permitiendo ejecucion en hardware propio.
- Generacion de metadatos para bibliotecas de imagenes: integrado en un script por lotes, produce titulos y descripciones para catalogos fotograficos, bancos de imagenes o archivos digitales.
- Accesibilidad: generacion de texto alternativo para imagenes en aplicaciones web o documentos, con la ventaja de poder desplegarse en local sin enviar contenido a terceros.
- Moderacion y analisis de contenido sin restricciones: al ser un modelo abliterated, puede describir contenido sensible que otros modelos rechazan, util en tareas de auditoria de imagenes o investigacion sobre sesgos.
- Prototipado rapido de aplicaciones VLM: su tamano de 3B y sus cuantizaciones de 2 GB permiten iterar en un portatil con GPU de consumo antes de escalar a modelos mayores.
- Investigacion sobre abliteration: sirve como caso de estudio para comparar el comportamiento de un VLM antes y despues de la ablacion de direcciones de rechazo, midiendo el impacto en calidad de captioning.
- Preprocesamiento para sistemas RAG multimodales: generar descripciones textuales de imagenes que luego se indexan en un motor de busqueda vectorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del LLM, sin contar el proyector visual ni el contexto):
  - Q2_K: ~1,4 GB
  - Q3_K_M: ~1,7 GB
  - Q4_K_S / Q4_K_M: ~1,9-2,0 GB
  - Q5_K_M: ~2,3 GB
  - Q6_K: ~2,6 GB
  - Q8_0: ~3,4 GB
  - f16: ~6,3 GB
- Hay que sumar el fichero mmproj (0,9 GB en Q8_0 o 1,4 GB en f16) para el procesamiento de imagenes.
- Cabe holgadamente en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090. En GPUs de 8 GB cabe la cuantizacion Q5_K_M o Q6_K junto con el mmproj y contexto moderado.
- Tambien es viable en CPU pura con llama.cpp, aunque la latencia por imagen sera mayor.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (previa importacion del GGUF y del mmproj), y servidores compatibles con la API de OpenAI. La etiqueta `text-generation-inference` aparece en el repositorio, pero TGI no soporta GGUF de forma nativa; para TGI habria que usar el modelo base en safetensors.
- No se dispone de datos de latencia o throughput medidos en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-VL-3B-Abliterated-Caption-it-GGUF (este) | 3B | no disponible | no disponible | GGUF | Afinado para captioning, abliterated, solo ingles |
| Qwen2.5-VL-3B-Instruct (original) | 3B | no disponible en esta ficha | Apache 2.0 (segun familia Qwen2.5) | safetensors, GGUF | Alineado, multilingue, uso general |
| prithivMLmods/Qwen2.5-VL-3B-Abliterated-Caption-it | 3B | no disponible | no disponible | safetensors | Modelo base en precision completa del que deriva este GGUF |
| Florence-2-base | 0,23B | no disponible | MIT (segun publicacion original) | safetensors | Especializado en captioning y tareas visuales, mucho mas pequeno |

La comparativa con Florence-2 se incluye como referencia de categoria (captioning), pero no se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- La licencia no esta disponible en la informacion proporcionada, lo que impide confirmar si se permite uso comercial. Es imprescindible verificar la licencia del modelo base antes de desplegarlo en produccion.
- El proceso de abliteration elimina los rechazos del modelo, lo que implica riesgo de generar contenido ofensivo, explicito o inapropiado sin filtros. No es adecuado para aplicaciones de cara al publico sin una capa de moderacion adicional.
- Riesgo de alucinacion en la descripcion de imagenes: puede inventar objetos, texto o relaciones espaciales no presentes, especialmente en cuantizaciones agresivas (Q2_K, Q3_K_S).
- Las cuantizaciones por debajo de Q4_K_M degradan la calidad de forma notable; el propio autor marca Q3_K_M como "lower quality".
- El repositorio ocupa 30,1 GB por incluir todas las variantes; conviene descargar solo la cuantizacion y el mmproj necesarios.
- No se documentan sesgos especificos del afinamiento ni del dataset de captioning empleado.
- Al ser un modelo de 3B, su capacidad de razonamiento complejo y seguimiento de instrucciones largas es limitada frente a modelos mayores; conviene validar su comportamiento en la tarea concreta antes de produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen2.5-VL-3B-Abliterated-Caption-it-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/Qwen2.5-VL-3B-Abliterated-Caption-it
- Cuantizaciones imatrix del mismo modelo: https://huggingface.co/mradermacher/Qwen2.5-VL-3B-Abliterated-Caption-it-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen2.5-VL-3B-Abliterated-Caption-it-GGUF
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
