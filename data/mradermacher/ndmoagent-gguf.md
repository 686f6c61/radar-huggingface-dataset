# mradermacher/NDMOagent-GGUF

## Resumen

NDMOagent-GGUF es la distribucion en formato GGUF del modelo IJyad/NDMOagent, publicada por mradermacher el 22 de febrero de 2025. Se trata de una cuantizacion estatica del modelo original orientada a inferencia local con llama.cpp y ecosistemas compatibles, no de un modelo entrenado desde cero. El repositorio incluye once variantes de cuantizacion que van desde Q2_K (2,6 GB) hasta f16 (13,6 GB), lo que permite desplegar el modelo en hardware muy diverso.

El modelo base cuenta con 6.738.415.616 parametros (aproximadamente 6,7 mil millones), un tamano que lo situa en la categoria de modelos de rango medio aptos para GPUs de consumo. La model card del repositorio no proporciona informacion sobre arquitectura interna, longitud de contexto, datos de entrenamiento ni resultados de benchmarks; unicamente declara el idioma ingles y la etiqueta `endpoints_compatible`.

La relevancia de esta ficha radica en que documenta un caso tipico de cuantizacion comunitaria: un modelo base poco documentado cuya unica via practica de uso es a traves de los GGUF generados por terceros. Cualquier evaluacion en produccion deberia complementarse con pruebas directas, dado el vacio de informacion tecnica verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base IJyad/NDMOagent; presumiblemente transformer, sin confirmar) |
| Parametros totales | 6.738.415.616 (~6,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (segun metadatos) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye en transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base IJyad/NDMOagent en la documentacion proporcionada. El recuento de parametros (6,7 B) y la libreria declarada (`transformers`) son compatibles con un transformer decoder-only, pero no hay confirmacion explicita. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT.

La unica innovacion tecnica documentada en este repositorio es el proceso de cuantizacion: mradermacher ha generado cuantizaciones estaticas (sin imatrix ni pesos ponderados, segun indica la propia model card). El autor senala que las cuantizaciones con imatrix "parecen no estar disponibles" en el momento de publicacion y que no las tiene planificadas salvo peticion explicita. Esto implica que las variantes IQ4_XS incluidas no incorporan la matriz de importancia, lo que puede reducir su calidad frente a IQ-quants ponderados de otros repositorios.

## Capacidades

- Generacion de texto en ingles: capacidad basica esperada de un modelo de 6,7 B, sin confirmacion documental de calidad.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el modelo puede servirse mediante la infraestructura de endpoints de HuggingFace.
- Inferencia local: el formato GGUF permite ejecucion en CPU y GPU con llama.cpp y derivados.
- Tool calling / function calling: no documentado.
- Razonamiento multi-paso y agentes: no documentado, pese al sufijo "agent" en el nombre.
- Capacidades multilingues: limitadas al ingles segun metadatos.
- Vision, audio, thinking mode: no documentado.

## Casos de uso

- Prototipado local en estaciones de trabajo: con la variante Q4_K_M (4,2 GB) el modelo cabe en GPUs de consumo de 8 GB o superior, lo que permite iterar en desarrollo sin coste de API.
- Despliegue en entornos con GPU limitada: la variante Q2_K (2,6 GB) permite ejecucion en GPUs de 4 GB o incluso en CPU con llama.cpp, util para pruebas de integracion en CI.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece doce variantes del mismo modelo, lo que facilita medir el impacto de la cuantizacion en perplejidad y calidad de salida sobre una carga concreta.
- Servicio de generacion de texto en ingles de baja latencia: con Q8_0 (7,3 GB) en una RTX 4090 se obtiene la maxima calidad del repo con throughput alto, adecuado para tareas de completado o resumen.
- Base para fine-tuning ligero: al disponer del modelo original en transformers, puede usarse como punto de partida para ajuste con LoRA antes de recuantizar.
- Experimentacion academica con modelos de ~7 B: util como linea base en estudios sobre cuantizacion, dado el amplio abanico de variantes disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion): Q2_K ~2,6 GB; Q4_K_M ~4,2 GB; Q8_0 ~7,3 GB; f16 ~13,6 GB. Anadir entre 1 y 2 GB adicionales para contexto y overhead del runtime.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q6_K/Q8_0; RTX 4090 o A100 para f16 con contexto largo; GPUs de 8 GB (RTX 3070, RTX 4060) suficientes para Q4_K_M.
- Cabe en GPU de consumo: si, desde Q2_K en adelante en GPUs de 8 GB o mas; las variantes Q2_K y Q3_K_S pueden ejecutarse en CPU.
- Opciones de despliegue: llama.cpp, Ollama (mediante importacion del GGUF), LM Studio, text-generation-webui y servidores compatibles con la API de llama.cpp. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NDMOagent-GGUF (este) | ~6,7 B | no disponible | no disponible | GGUF | Modelo base poco documentado; sin benchmarks |
| Mistral-7B-Instruct (GGUF) | 7,2 B | 32 K (v0.2+) | Apache 2.0 | GGUF, safetensors | Ampliamente documentado, benchmarks publicos |
| Llama 3.1 8B Instruct (GGUF) | 8,0 B | 128 K | Llama 3.1 Community License | GGUF, safetensors | Ecosistema maduro, tool calling nativo |
| Qwen2.5-7B-Instruct (GGUF) | 7,6 B | 128 K | Apache 2.0 (mayoria de variantes) | GGUF, safetensors | Multilingue, benchmarks publicos |

La comparativa es orientativa: no hay datos de rendimiento de NDMOagent que permitan situarlo frente a estas alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de model card detallada en el modelo base: no es posible estimar su calidad frente a alternativas consolidadas.
- Licencia no especificada: no puede asumirse uso comercial sin verificar la licencia del modelo base IJyad/NDMOagent, que tampoco aparece documentada en la informacion disponible.
- Solo ingles: inadecuado para aplicaciones en castellano u otros idiomas sin evaluacion previa.
- Las cuantizaciones IQ4_XS de este repo no incorporan imatrix, por lo que su calidad puede ser inferior a la de IQ-quants ponderados de otros autores.
- Riesgo de alucinacion no cuantificado: sin evaluaciones publicadas no hay forma de estimar la tasa de errores facticos.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo (RAG, documentos extensos) sin medirlo experimentalmente.
- Modelo con muy poca traccion (4 descargas, 0 likes en el momento de la consulta): ecosistema practicamente inexistente, sin issues ni discusiones que aporten informacion adicional.
- El sufijo "agent" del nombre no implica soporte verificado de tool calling ni de razonamiento multi-paso.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/NDMOagent-GGUF
- Modelo base: https://huggingface.co/IJyad/NDMOagent
- Pagina de descargas del autor: https://hf.tst.eu/model#NDMOagent-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guia sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
