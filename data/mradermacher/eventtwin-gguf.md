# mradermacher/EventTwin-GGUF

## Resumen

EventTwin-GGUF es la version cuantizada en formato GGUF del modelo MaYiding/EventTwin, publicada por el usuario mradermacher. Se trata de un cross-encoder de unos 568 millones de parametros, especializado en tareas de reranking aplicadas a correferencia de eventos y deduplicacion de eventos, con foco en el dominio de noticias en chino. El modelo original se distribuye bajo licencia Apache 2.0 y esta pensado para producir puntuaciones de similitud calibradas entre pares de textos, no para generar texto libre.

La relevancia de esta publicacion radica en que facilita el despliegue local del modelo mediante formatos GGUF, con un rango amplio de cuantizaciones que va desde f16 (1,3 GB) hasta Q2_K (0,5 GB), lo que permite ejecutarlo en hardware muy modesto. Al ser un cross-encoder de reordenacion, encaja en pipelines de recuperacion de informacion y agrupacion de noticias donde se necesita puntuar pares (consulta, documento) o (evento, evento) con una probabilidad calibrada.

El modelo base declara tecnicas de destilacion de conocimiento (knowledge distillation) y probabilidades calibradas, orientadas a tareas de agrupacion periodistica (news clustering). La informacion publica no detalla la arquitectura interna del backbone, la longitud de contexto ni los datos concretos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder (transformer tipo encoder, no generativo). Detalles del backbone no disponibles |
| Parametros totales | 567.753.729 (~568 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo original en transformers/safetensors) |

## Arquitectura y entrenamiento

EventTwin es un cross-encoder: recibe un par de entradas y devuelve una puntuacion de afinidad o probabilidad, en lugar de generar tokens de forma autorregresiva. Las etiquetas del modelo base apuntan a un entrenamiento orientado a reranking, correferencia de eventos y deduplicacion de eventos, con destilacion de conocimiento y salida de probabilidades calibradas. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La version aqui descrita es una conversion a GGUF realizada por mradermacher, con quantize_version 2, output_tensor_quantised 1 y convert_type hf. Se ofrecen cuantizaciones estaticas; segun el propio autor, no hay cuantizaciones ponderadas ni con imatrix disponibles en el momento de la publicacion.

## Capacidades

- Reranking de pares (consulta, documento) o (evento, evento) mediante puntuacion de similitud.
- Correferencia de eventos: determinar si dos menciones se refieren al mismo evento.
- Deduplicacion de eventos: detectar y agrupar eventos repetidos.
- Agrupacion de noticias (news clustering) a partir de la senal de similitud.
- Salida de probabilidades calibradas, util para umbrales ajustables en produccion.
- Soporte exclusivo para chino (zh); no hay soporte declarado de otros idiomas.
- No es un modelo generativo: no produce texto, codigo ni razonamiento encadenado.
- No dispone de soporte declarado de tool calling, function calling ni agentes.
- No dispone de capacidades multimodales (vision, audio) declaradas.

## Casos de uso

- Deduplicacion de noticias en agregadores: el modelo puntua pares de articulos y agrupa aquellos que describen el mismo evento, reduciendo la repeticion de portadas.
- Reranking en pipelines RAG en chino: tras la recuperacion inicial por embeddings, se reordena el top-k segun la probabilidad calibrada del cross-encoder para mejorar la precision del contexto entregado al generador.
- Monitorizacion de medios y clipping de prensa: se comparan menciones entrantes contra un historico para evitar duplicados en los informes de cobertura.
- Deteccion de cadenas de eventos relacionados: al agrupar eventos, se pueden trazar evoluciones de un mismo tema (por ejemplo, un conflicto) a lo largo de coberturas sucesivas.
- Alertas tempranas: umbrales sobre la probabilidad calibrada permiten disparar avisos cuando aparece un evento suficientemente distinto o suficientemente repetido.
- Enriquecimiento de bases documentales: normalizacion de entidades-evento en un corpus periodistico antes de indexarlo en un motor de busqueda.
- Filtrado de spam o contenido duplicado en foros y fuentes de noticias no estructuradas en chino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: f16 unos 1,3 GB; Q8_0 unos 0,7 GB; Q6_K unos 0,6 GB; Q5_K_M / Q5_K_S unos 0,6 GB; Q4_K_M / Q4_K_S / IQ4_XS / Q3_K_L / Q3_K_M / Q3_K_S / Q2_K unos 0,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, serie RTX 30/40) es suficiente; tambien modelos de datacenter como A100 o H100, aunque sobredimensionados para este tamano.
- Cabe en GPU consumer: si, el modelo completo en cualquiera de sus cuantizaciones ocupa menos de 1,5 GB, por lo que entra en GPU de gama baja e incluso en CPU.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, servidores compatibles con GGUF). Al ser un cross-encoder no generativo, no aplica el uso tipico de vLLM o TGI como motores de generacion.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| EventTwin-GGUF | ~568 M | no disponible | Chino | Apache 2.0 | GGUF |
| BAAI/bge-reranker-v2-m3 | ~568 M | no disponible | Multilingue | Apache 2.0 | safetensors |
| BAAI/bge-reranker-base | ~278 M | no disponible | Ingles/chino | Apache 2.0 | safetensors |

Nota: los datos de los modelos comparativos proceden de referencias publicas generales y no de la informacion proporcionada en esta busqueda; los valores de contexto se marcan como no disponibles por no poder confirmarse aqui. La comparacion de rendimiento no puede establecerse porque no hay benchmarks publicados para EventTwin en la informacion disponible.

## Limitaciones y advertencias

- Modelo mono-idioma: solo chino (zh); su uso en otros idiomas no esta soportado ni evaluado.
- No es generativo: no puede emplearse para tareas de generacion, resumen, codigo o razonamiento encadenado.
- Al ser un cross-encoder, la puntuacion requiere evaluar pares de forma individual, lo que escala de forma lineal con el numero de candidatos y puede penalizar la latencia en corpus grandes.
- No se ha publicado la longitud de contexto ni la arquitectura interna, lo que dificulta estimar limites en documentos largos.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos en la agrupacion; conviene calibrar umbrales con datos propios.
- Sesgos conocidos: no disponibles. Al estar entrenado sobre noticias en chino, puede heredar sesgos de dominio y de fuentes periodisticas.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion con las obligaciones habituales de atribucion y conservacion del aviso de licencia.
- Las cuantizaciones de menor tamano (Q2_K, Q3_K) pueden degradar la calidad de las puntuaciones; el autor recomienda Q4_K como opcion rapida y Q8_0 como mejor calidad.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo GGUF: https://huggingface.co/mradermacher/EventTwin-GGUF
- Modelo base: https://huggingface.co/MaYiding/EventTwin
- Pagina de perfil del cuantizador: https://huggingface.co/mradermacher
- Pagina de resumen del modelo (mradermacher): https://hf.tst.eu/model#EventTwin-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Ejemplo de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
