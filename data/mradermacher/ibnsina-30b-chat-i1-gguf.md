# mradermacher/ibnsina-30b-chat-i1-GGUF

## Resumen

Esta ficha describe `mradermacher/ibnsina-30b-chat-i1-GGUF`, una recopilación de cuantizaciones en formato GGUF generadas por mradermacher a partir del modelo `ibnsina-llm/ibnsina-30b-chat`. Se trata, por tanto, de una redistribución optimizada para inferencia local y no de un modelo entrenado desde cero: el trabajo del autor consiste en aplicar cuantización con fichero imatrix (quants etiquetados como `i1`) para reducir el peso en disco y en memoria del modelo original sin renunciar a tanta calidad como en una cuantización estática convencional.

El modelo subyacente es un transformer de tipo mezcla de expertos (MoE): las etiquetas del repositorio incluyen `qwen3_moe`, y el recuento real de parámetros en safetensors es de 30.532.122.624 (aproximadamente 30,5 mil millones). Está afinado para conversación e instrucciones (`chat`, `instruction-tuned`, `conversational`) y declara soporte para dos idiomas: persa/farsi (`fa`) e inglés (`en`). La licencia declarada es Apache 2.0.

Su relevancia práctica es doble. Por un lado, cubre un nicho poco poblado: modelos de conversación de gran tamaño con competencia nativa en persa, un idioma con menos recursos que el inglés en el ecosistema abierto. Por otro, al distribuirse en GGUF con un abanico amplio de niveles de cuantización (desde IQ1_M de 7,2 GB hasta Q6_K de 25,2 GB), permite desplegar un modelo de 30,5 mil millones de parámetros en hardware de consumo mediante llama.cpp u Ollama, algo inviable con los pesos completos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer; la etiqueta del repositorio indica `qwen3_moe` |
| Parametros totales | 30.532.122.624 (aprox. 30,5 mil millones), segun safetensors del modelo base |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_M, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, Q3_K_S, IQ3_M, Q3_K_M, IQ4_XS, Q4_K_S, Q4_K_M, Q6_K (todas variantes `i1` con imatrix); tambien se distribuye el fichero `imatrix` de 0,2 GB |
| Idiomas soportados | Persa/farsi (`fa`) e ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF; la libreria declarada en el repositorio es `transformers`, pero los pesos distribuidos son GGUF (el modelo base esta en safetensors) |

## Arquitectura y entrenamiento

El repositorio no documenta el proceso de entrenamiento del modelo original; solo indica que se trata de una cuantizacion de `ibnsina-llm/ibnsina-30b-chat`. La etiqueta `qwen3_moe` apunta a una arquitectura de mezcla de expertos heredada de la familia Qwen3-MoE, en la que solo una fraccion de los parametros se activa por token, lo que reduce el coste de inferencia respecto a un modelo denso del mismo tamano. El recuento total de parametros (30.532.122.624) es coherente con esa familia. No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF, DPO u otras tecnicas de alineamiento.

La innovacion tecnica de esta publicacion concreta es el proceso de cuantizacion. El autor emplea un fichero `imatrix` (matriz de importancia) para ponderar la cuantizacion, de modo que los pesos mas sensibles conservan mayor precision. Segun la propia model card, los quants IQ suelen ser preferibles a los no-IQ de tamano similar. Ademas, la version `i1` se ofrece como alternativa a los quants estaticos publicados en `mradermacher/ibnsina-30b-chat-GGUF`, y el autor indica que los quants `i1-Q6_K` son practicamente equivalentes a un `Q6_K` estatico. Las etiquetas internas del proceso (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) confirman que la conversion parte de pesos HuggingFace.

## Capacidades

- Generacion de texto conversacional e instrucciones multi-turno, segun las etiquetas `chat`, `instruction-tuned` y `conversational`.
- Razonamiento y respuesta a instrucciones en persa/farsi e ingles, con calidad presumiblemente superior en persa que en modelos genericos entrenados solo en ingles.
- Capacidades de generacion de codigo y matematicas: no disponibles, no se documentan en la informacion proporcionada.
- Soporte de tool calling o function calling: no disponible, no se menciona en el repositorio.
- Soporte de agentes y razonamiento multi-paso: no disponible, no se menciona en el repositorio.
- Capacidades multimodales (vision, audio): no disponibles; el repositorio no incluye fichero `mmproj`.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Al ser un modelo MoE, su perfil de coste es el de un modelo con menos parametros activos que totales, lo que permite mayor velocidad de decodificacion que un denso de 30,5 mil millones.

## Casos de uso

- Asistentes conversacionales en persa: el modelo esta afinado para instrucciones y declara `fa` como idioma principal. Se puede desplegar como chatbot de atencion al cliente en farsi con llama.cpp, aprovechando el quant Q4_K_M para mantener un equilibrio entre calidad y consumo de memoria.
- Traduccion y adaptacion de contenido entre persa e ingles: al cubrir ambos idiomas de forma nativa, resulta util para traduccion asistida, localizacion de documentacion tecnica o generacion de resumenes bilingues en pipelines por lotes.
- Procesamiento de documentacion en servidores sin GPU dedicada: el quant IQ2_M ocupa 10,3 GB y permite ejecucion en CPU con memoria RAM suficiente, lo que habilita tareas de resumen y clasificacion de textos en farsi en infraestructura modesta.
- Prototipado e investigacion en PLN para persa: al ser un modelo de 30,5 mil millones con licencia Apache 2.0, sirve como base para evaluaciones academicas, fine-tuning posterior o generacion de datos sinteticos en farsi.
- Despliegue local en estaciones de trabajo con una sola GPU de 24 GB: el quant Q4_K_M (18,7 GB) o IQ4_XS (16,5 GB) cabe en una RTX 3090 o RTX 4090 junto con la cache de contexto, permitiendo uso interactivo sin conexion a servicios externos.
- Experimentacion con cuantizacion comparativa: el repositorio incluye doce niveles de cuantizacion mas el fichero imatrix, lo que lo convierte en un banco de pruebas util para medir la degradacion de calidad entre IQ1_M, IQ2_M, Q3, Q4 y Q6_K sobre un mismo modelo.
- Generacion de contenido editorial en farsi: redaccion de borradores, reescritura de textos y adaptacion de tono para publicaciones digitales orientadas a audiencia persa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio de cuantizaciones ni los metadatos de HuggingFace incluyen puntuaciones de MMLU, HumanEval, GSM8K u otras evaluaciones, ni para el modelo base ni para las cuantizaciones. Tampoco se proporcionan mediciones de perplejidad o de velocidad de inferencia.

## Requisitos de hardware

Los tamanos de fichero son datos reales de la model card; las estimaciones de VRAM anaden un margen orientativo para cache KV, buffers de contexto y sobrecarga del runtime.

- VRAM estimada para inferencia (aproximada, segun cuantizacion):
  - IQ1_M (7,2 GB de fichero): unos 8-9 GB de VRAM.
  - IQ2_M (10,3 GB) y Q2_K_S (10,6 GB): unos 11-12 GB de VRAM.
  - IQ3_XXS (11,9 GB) y Q3_K_S (13,4 GB): unos 13-15 GB de VRAM.
  - Q4_K_S (17,6 GB) e IQ4_XS (16,5 GB): unos 18-20 GB de VRAM.
  - Q4_K_M (18,7 GB): unos 20-21 GB de VRAM.
  - Q6_K (25,2 GB): unos 27-28 GB de VRAM, o descarga parcial a RAM.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para Q4_K_M hacia abajo con contexto moderado; A100 40 GB, L40S o RTX 5090 (32 GB) para Q6_K sin offload; para IQ1/IQ2 basta una RTX 4070 Ti, RTX 4080 o similar con 12-16 GB.
- Cabe en GPU de consumo: si. Los quants IQ1_M, IQ2_M y Q2_K caben en tarjetas de 12 GB; IQ3 e IQ4 en tarjetas de 16-24 GB; Q4_K_M es el nivel recomendado por el autor como rapido y con buena relacion tamano/calidad, y entra en 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y llama-cpp-python son las rutas naturales para GGUF. Los quants estan pensados para estos runtimes. El soporte de GGUF en vLLM es limitado y no se recomienda como via principal; TGI no ofrece soporte GGUF en la informacion disponible. Para produccion con throughput alto seria preferible servir el modelo base en safetensors con vLLM o TGI, no esta cuantizacion.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mradermacher/ibnsina-30b-chat-i1-GGUF` (esta ficha) | 30,5 mil millones | no disponible | GGUF (12 niveles de cuantizacion imatrix) | Apache 2.0 | Publico en HuggingFace |
| `ibnsina-llm/ibnsina-30b-chat` (modelo base) | 30,5 mil millones | no disponible | safetensors / transformers | Apache 2.0 | Publico en HuggingFace |
| `mradermacher/ibnsina-30b-chat-GGUF` (quants estaticos) | 30,5 mil millones | no disponible | GGUF (sin imatrix) | Apache 2.0 | Publico en HuggingFace |

No se dispone de datos de rendimiento comparado frente a otros modelos de la misma categoria o tamano, ni de modelos alternativos con soporte nativo de persa en el mismo rango de parametros. No disponible.

## Limitaciones y advertencias

- Idiomas limitados a persa y ingles. Cualquier uso en castellano u otros idiomas queda fuera del ambito declarado y probablemente degrade la calidad de forma notable.
- Las cuantizaciones de baja precision introducen perdida de calidad. La propia model card etiqueta IQ1_M como "mostly desperate", Q2_K_S como "very low quality" y avisa de que Q3_K_S esta probablemente superado por IQ3_XS. Para uso en produccion no deberia bajarse de Q4_K_M o Q6_K.
- No hay benchmarks publicados: no es posible cuantificar la degradacion exacta frente al modelo base ni comparar con alternativas de forma objetiva.
- Riesgo de alucinacion inherente a los modelos generativos de esta escala, agravado en las cuantizaciones mas agresivas. No se documentan tasas de error ni evaluaciones de veracidad.
- La longitud de contexto no esta declarada en el repositorio, por lo que no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperacion sobre documentos extensos.
- No se documentan filtros de seguridad, cartas de uso responsable ni evaluaciones de sesgo. Al tratarse de una cuantizacion de un modelo afinado para chat, hereda los sesgos del modelo original, que no se describen.
- No se menciona soporte de tool calling ni de agentes; asumir su disponibilidad en produccion seria un riesgo.
- La licencia Apache 2.0 permite uso comercial, pero el repositorio es una redistribucion de terceros: conviene verificar la licencia del modelo base antes de un despliegue comercial.
- El repositorio tiene 0 descargas y 0 me gusta en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo; no se han podido contrastar datos externos.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/mradermacher/ibnsina-30b-chat-i1-GGUF
- Modelo base: https://huggingface.co/ibnsina-llm/ibnsina-30b-chat
- Quants estaticos del mismo modelo: https://huggingface.co/mradermacher/ibnsina-30b-chat-GGUF
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#ibnsina-30b-chat-i1-GGUF
- Guia de uso de GGUF citada por el autor (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de tipos de cuantizacion de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
