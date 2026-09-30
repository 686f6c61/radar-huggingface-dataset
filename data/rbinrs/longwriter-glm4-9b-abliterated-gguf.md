# rbinrs/LongWriter-glm4-9b-abliterated-GGUF

# LongWriter-glm4-9b-abliterated-GGUF (rbinrs)

## Resumen

LongWriter-glm4-9b-abliterated-GGUF es un repositorio de pesos cuantizados en formato GGUF publicado por el usuario rbinrs, que empaqueta una version cuantizada del modelo byroneverson/LongWriter-glm4-9b-abliterated. La model card indica que las cuantizaciones fueron generadas por mradermacher y que se trata de "static quants" del modelo base citado. El objetivo es doble: por un lado, hacer accesible un modelo de 9.400 millones de parametros en hardware de consumo mediante cuantizacion; por otro, ofrecer una variante "abliterated", es decir, con la direccion de rechazo eliminada del espacio de activaciones, lo que reduce las negativas del modelo a responder ciertas peticiones.

El modelo original del que deriva es LongWriter-glm4-9b, desarrollado por el equipo THUDM (Tsinghua KEG), presentado en el paper "LongWriter: Unleashing 10,000+ Word Generation from Long Context LLMs" (ICLR 2025). Ese trabajo parte de la familia GLM-4-9B y la especializa en generacion de textos largos coherentes, superando la barrera tipica de salida de 2.000-3.000 palabras de los LLM convencionales. La variante abliterated elimina la alineacion de seguridad del modelo original, algo relevante para quien busque generacion sin restricciones tematicas.

Con aproximadamente 9,4 mil millones de parametros, licencia apache-2.0 y soporte declarado unicamente en ingles, este repositorio esta pensado para despliegue local en herramientas compatibles con GGUF (llama.cpp, Ollama, LM Studio). El tamano del repositorio es de 92,6 GB, ya que incluye 13 variantes de cuantizacion distintas, desde Q2_K hasta f16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en GLM-4 (tags: glm, glm4, chatglm) |
| Parametros totales | 9.399.951.360 (~9,4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0_4_4, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (existen tambien variantes i1/imatrix en mradermacher/LongWriter-glm4-9b-abliterated-i1-GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF en este repositorio (el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

El repositorio no incluye informacion sobre el proceso de entrenamiento del modelo base, ya que se trata de una recopilacion de cuantizaciones estaticas. La arquitectura heredada es la de la familia GLM-4-9B de THUDM, un transformer decoder-only. El trabajo original LongWriter, referenciado en la busqueda web (github.com/THUDM/LongWriter), se centra en habilitar la generacion de textos de mas de 10.000 palabras a partir de contexto largo, y se enmarca en la conferencia ICLR 2025. Los detalles concretos del dataset, el numero de tokens de entrenamiento y si se aplicaron fases de RLHF o DPO no estan disponibles en la informacion proporcionada.

La particularidad de esta variante es el proceso de "abliteration", una tecnica de edicion de pesos que identifica y elimina la direccion de rechazo en el espacio de activaciones del modelo. El resultado es un modelo que, en principio, atiende peticiones que el modelo original rechazaria. Esta modificacion se aplica sobre byroneverson/LongWriter-glm4-9b-abliterated, y el repositorio aqui descrito unicamente la cuantiza, sin cambios adicionales en los pesos mas alla del propio proceso de cuantizacion. No se documenta en la model card el impacto de la abliteration sobre la calidad general del modelo.

## Capacidades

- Generacion de texto largo: la especialidad del modelo base es producir textos extensos (el paper habla de mas de 10.000 palabras) manteniendo coherencia estructural, segun el titulo del trabajo original.
- Generacion de texto general y modo chat/instruct: los tags incluyen chat e instruct.
- Escritura creativa extensa: el ejemplo publico del repositorio THUDM muestra la generacion de una historia de amor tragica de 5.000 palabras.
- Respuestas sin alineacion de rechazo: por el proceso de abliteration, el modelo no aplica los filtros de negativa tipicos del modelo original.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los tags del modelo.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion de narrativa larga: el modelo puede producir relatos, novelas cortas o capitulos de mas de 5.000 palabras en una sola pasada, evitando el troceado manual y la perdida de coherencia entre fragmentos que sufren los modelos con salida limitada.
- Redaccion de informes tecnicos y documentos extensos: util para generar memorandos, documentacion de proyecto o guias con estructura de secciones largas, gracias a la especializacion del modelo base en salida de gran longitud.
- Creacion de contenido sin restricciones tematicas: al estar abliterated, se emplea en escenarios de ficcion o divulgacion donde el modelo original rechazaria ciertos temas (violencia narrativa, contenido adulto, temas sensibles), siempre dentro del marco legal aplicable.
- Generacion de guiones y dialogos extensos: apropiado para escribir guiones de video, podcast o teatro con multiples escenas y continuidad argumental.
- Prototipado de pipelines de generacion de contenido en local: al disponer de cuantizaciones desde 4,1 GB, se integra en flujos de trabajo ofimaticos o CMS desplegados en estaciones de trabajo sin GPU de datacenter.
- Investigacion sobre abliteration y seguridad: util como caso de estudio para medir como la edicion de pesos afecta a la calidad, la coherencia y la tasa de rechazo, comparando contra el modelo original con alineacion.
- Generacion de articulos SEO o marketing de formato largo: para producir piezas de blog de varios miles de palabras de forma automatizada.
- Asistente de escritura offline en ingles: desplegable con Ollama o llama.cpp en un portatil con GPU modesta, sin dependencia de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV): Q2_K ~4,1 GB; Q3_K_S ~4,7 GB; Q3_K_M ~5,2 GB; IQ4_XS ~5,4 GB; Q4_K_S ~5,9 GB; Q4_K_M ~6,4 GB; Q5_K_M ~7,2 GB; Q6_K ~8,4 GB; Q8_0 ~10,1 GB; f16 ~18,9 GB.
- Margen recomendado: anadir entre 1 y 3 GB adicionales sobre el peso del archivo para cache KV, overhead de contexto y buffers. Con contextos largos, el consumo de la cache KV crece de forma notable.
- GPU recomendadas: para Q4_K_M o Q5_K_M basta una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4070; para Q8_0 es recomendable una RTX 4080/4090 de 16-24 GB; para f16 conviene una RTX 4090 de 24 GB o GPU de datacenter como A100 o H100.
- Cabe en GPU de consumo: si. Las cuantizaciones Q2_K a Q5_K_M entran en tarjetas de 6 a 8 GB; Q6_K y Q8_0 requieren 10-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, koboldcpp y text-generation-webui (mediante el loader de llama.cpp). El soporte de GGUF en vLLM es parcial y limitado.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LongWriter-glm4-9b-abliterated-GGUF (este repo) | 9,4B | no disponible | apache-2.0 | GGUF (13 quants) | Version abliterada y cuantizada para despliegue local |
| byroneverson/LongWriter-glm4-9b-abliterated | 9,4B | no disponible | apache-2.0 | safetensors | Modelo base del que derivan los GGUF, sin cuantizar |
| THUDM/LongWriter-glm4-9b | 9,4B | no disponible | no disponible | safetensors | Modelo original con alineacion de seguridad |
| GLM-4-9B-Chat (THUDM) | 9,4B | no disponible | no disponible | safetensors | Modelo de chat generalista de la misma familia |

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo de seguridad: el modelo puede generar contenido ofensivo, peligroso o ilegal si se le solicita. No es adecuado para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo de alucinacion: como cualquier LLM de 9B, puede inventar datos, citas o hechos, especialmente en textos largos donde la verificacion interna es mas dificil.
- Idiomas: el modelo declara soporte unicamente en ingles, por lo que su rendimiento en castellano no esta garantizado ni evaluado.
- Longitud de contexto: no se especifica en la informacion proporcionada, lo que impide planificar el tamano de entrada con precision.
- La cuantizacion a baja precision (Q2_K, Q3_K) degrada la calidad de forma perceptible. Para produccion se recomienda Q4_K_M o superior.
- La licencia apache-2.0 permite uso comercial, pero la responsabilidad legal del contenido generado por un modelo abliterated recae en el desplegador.
- El repositorio tiene 0 descargas y 0 likes y fue creado con fecha 2026-09-29, datos que sugieren escasa validacion por parte de la comunidad.
- El tamano del repo (92,6 GB) obliga a descargar selectivamente la cuantizacion deseada en lugar del repositorio completo.
- No se documenta el efecto de la abliteration sobre benchmarks de razonamiento o conocimiento, por lo que se desconoce el coste real en calidad frente al modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rbinrs/LongWriter-glm4-9b-abliterated-GGUF
- Modelo base abliterated: https://huggingface.co/byroneverson/LongWriter-glm4-9b-abliterated
- Version GGUF del modelo base: https://huggingface.co/byroneverson/LongWriter-glm4-9b-abliterated-gguf
- Cuantizaciones i1 (imatrix) de mradermacher: https://huggingface.co/mradermacher/LongWriter-glm4-9b-abliterated-i1-GGUF
- Cuantizaciones static de mradermacher: https://huggingface.co/mradermacher/LongWriter-glm4-9b-abliterated-GGUF
- Repositorio GitHub de LongWriter (THUDM): https://github.com/THUDM/LongWriter
- Modelo original LongWriter-glm4-9b (THUDM): https://huggingface.co/THUDM/LongWriter-glm4-9b
- Modelo GLM-4-9B (THUDM): https://huggingface.co/THUDM/glm-4-9b-chat
- Listado en local-ai-zone: https://local-ai-zone.github.io/models/longwriter-glm4-9b.html
- Ficha en free2aitools: https://free2aitools.com/model/byroneverson/longwriter-glm4-9b-abliterated
