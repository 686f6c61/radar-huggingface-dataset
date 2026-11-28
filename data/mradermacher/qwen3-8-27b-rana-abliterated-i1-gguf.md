# mradermacher/Qwen3.8-27B-RANA-abliterated-i1-GGUF

## Resumen

Qwen3.8-27B-RANA-abliterated-i1-GGUF es una distribucion de cuantizaciones GGUF generadas por mradermacher a partir del modelo abliterant/Qwen3.8-27B-RANA-abliterated, una variante "abliterated" (con la direccion de rechazo suprimida) de un modelo de la familia Qwen3 con 27.320.697.856 parametros. El repositorio no contiene pesos originales en precision completa, sino un conjunto de ficheros GGUF cuantizados con metodo imatrix/weighted, pensados para ejecucion local con llama.cpp y derivados. La model card etiqueta el modelo como vision-language, de modo que la variante incluiria capacidad de procesamiento de imagenes, aunque los ficheros mmproj (proyector multimodal) se alojan en el repositorio estatico hermano.

El interes practico del artefacto es doble. Por un lado, ofrece un abanico amplio de cuantizaciones (desde i1-Q2_K de 11,0 GB hasta i1-Q6_K de 22,5 GB) que permiten desplegar un modelo de ~27B en hardware de consumo y en servidores con una o dos GPU. Por otro, la naturaleza "abliterated" implica que se ha aplicado una tecnica de edicion de pesos orientada a eliminar la direccion de rechazo del modelo, lo que produce un modelo "uncensored" con menos negativas a peticiones que el modelo base rechazaria. Esto es relevante para investigadores que estudian alineamiento, direcciones de rechazo y comportamiento de modelos, y para desarrolladores que necesitan un modelo sin filtros de rechazo en entornos controlados.

La licencia declarada es Apache 2.0 y el autor del modelo base es abliterant; mradermacher actua unicamente como cuantizador. El repositorio tiene 218,6 GB de tamano total (suma de todas las variantes), 2.434 descargas y 1 like en el momento de la consulta. No se dispone de informacion sobre el contexto nativo, la composicion del dataset de entrenamiento ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen3, etiquetado vision-language; no se detalla en la informacion) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix/weighted) |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors no se incluye en este repo |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Por el nombre y las etiquetas (qwen3, qwen3.8, vision-language) se trata de un modelo de la familia Qwen3 con aproximadamente 27,3 mil millones de parametros, con capacidad multimodal de vision. No se especifica si emplea atencion completa, atencion lineal o un esquema hibrido, ni el numero de capas, cabezas o dimension oculta.

El aspecto tecnico distintivo es el proceso de "abliteration": una edicion de pesos que identifica la direccion de rechazo en el espacio de activaciones y la proyecta fuera, de modo que el modelo deja de activar respuestas de negacion ante ciertas peticiones. El repositorio aqui descrito no entrena el modelo, sino que aplica cuantizacion con matrices de importancia (imatrix) sobre el modelo abliterated ya publicado, generando variantes de 2 a 6 bits. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta "conversational".
- Procesamiento de vision e imagen, segun la etiqueta "vision-language"; los ficheros mmproj necesarios estan en el repositorio estatico hermano.
- Comportamiento "uncensored": la abliteration reduce la probabilidad de respuestas de rechazo del modelo base.
- Compatibilidad con endpoints y con el ecosistema transformers/llama.cpp (tag endpoints_compatible).
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, modo thinking explicito, audio ni otras modalidades.

## Casos de uso

- Investigacion sobre alineamiento y direcciones de rechazo: el modelo permite estudiar como varian las respuestas cuando se elimina la direccion de rechazo, comparando el comportamiento con el modelo base no abliterado.
- Ejecucion local en estaciones de trabajo con GPU de consumo: la variante i1-Q4_K_M (16,9 GB) permite servir un modelo de ~27B en una GPU de 24 GB, util para prototipado sin dependencia de la nube.
- Analisis de contenido sensible en entornos controlados: investigadores que necesitan que el modelo no rechace sistematicamente peticiones de analisis de texto o imagen potencialmente problematicas pueden usar la variante abliterated con fines de estudio.
- Despliegue en servidores con una o dos GPU: las variantes i1-Q5_K_M (19,6 GB) e i1-Q6_K (22,5 GB) ofrecen mayor fidelidad al modelo original para inferencia en produccion interna con llama.cpp o vLLM (este ultimo requiere conversion a otro formato).
- Procesamiento de documentos con imagen: al ser un modelo vision-language, puede emplearse para tareas de descripcion de imagenes o extraccion de informacion visual, siempre que se cargue el mmproj correspondiente del repositorio estatico.
- Generacion de cuantizaciones propias: el fichero imatrix incluido (0,1 GB) permite a otros usuarios generar sus propias variantes GGUF con la matriz de importancia del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: i1-Q2_K ~11,0 GB; i1-IQ3_S ~12,7 GB; i1-Q4_K_M ~16,9 GB; i1-Q5_K_M ~19,6 GB; i1-Q6_K ~22,5 GB. A estas cifras hay que anadir el overhead de contexto KV cache y, en su caso, el proyector mmproj.
- GPU recomendadas: RTX 3090/4090 (24 GB) para variantes hasta i1-Q6_K; A100 40/80 GB o H100 para despliegues con contexto largo o varias instancias.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090 y GPUs con 24 GB o mas para cuantizaciones de 4 a 6 bits; las variantes de 2 a 3 bits caben en GPUs de 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y otros frontends compatibles con GGUF. Para vLLM o TGI seria necesario convertir a otro formato, ya que estos motores no consumen GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-RANA-abliterated-i1-GGUF (este) | ~27,3B | no disponible | Apache 2.0 | GGUF cuantizado | Vision-language, abliterated, 16 variantes de cuantizacion |
| abliterant/Qwen3.8-27B-RANA-abliterated | ~27,3B | no disponible | Apache 2.0 | safetensors (presumiblemente) | Modelo base sin cuantizar del que deriva este repo |
| mradermacher/Qwen3.8-27B-RANA-abliterated-GGUF | ~27,3B | no disponible | Apache 2.0 | GGUF estatico | Cuantizaciones estaticas y ficheros mmproj del mismo modelo |
| Modelos Qwen3 de ~27B no abliterated | no disponible | no disponible | no disponible | no disponible | No se dispone de datos concretos en la informacion proporcionada |

## Limitaciones y advertencias

- La abliteration elimina la direccion de rechazo, lo que reduce las salvaguardas del modelo base; puede generar contenido que el modelo original rechazaria. No es adecuado para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad en la informacion disponible; como todo modelo generativo, puede producir afirmaciones incorrectas con aparente seguridad.
- Idiomas: la model card solo declara ingles ("en"); el rendimiento en castellano no esta documentado y podria ser inferior.
- Contexto: se desconoce la longitud de contexto nativa; las cuantizaciones de baja calidad (Q2, Q3) degradan la coherencia en contextos largos.
- Licencia Apache 2.0 permite uso comercial, pero el autor del modelo base y el cuantizador no ofrecen garantias; el uso de un modelo abliterated en produccion puede implicar riesgos legales y reputacionales segun la jurisdiccion y el caso de uso.
- El repositorio no incluye los ficheros mmproj; para usar la capacidad de vision hay que descargarlos del repositorio estatico hermano.
- No se dispone de informacion sobre sesgos especificos, datos de entrenamiento ni evaluaciones de seguridad del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-RANA-abliterated-i1-GGUF
- Modelo base: https://huggingface.co/abliterant/Qwen3.8-27B-RANA-abliterated
- Cuantizaciones estaticas y mmproj: https://huggingface.co/mradermacher/Qwen3.8-27B-RANA-abliterated-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-RANA-abliterated-i1-GGUF
- README de referencia para GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
