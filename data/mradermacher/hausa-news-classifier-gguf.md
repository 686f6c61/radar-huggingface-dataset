# mradermacher/hausa-news-classifier-GGUF

# mradermacher/hausa-news-classifier-GGUF

## Resumen

Hausa-news-classifier-GGUF es la version cuantizada en formato GGUF del modelo Batonicarla1/hausa-news-classifier, un clasificador de texto especializado en noticias redactadas en hausa (idioma `ha`). El autor de la cuantizacion es mradermacher, un conocido distribuidor de versiones GGUF de modelos open source. El modelo original fue ajustado sobre el corpus masakhane/masakhanews, un conjunto de datos de noticias en hausa mantenido por la comunidad Masakhane, orientada al procesamiento de lenguas africanas.

Con 278.047.495 parametros totales, se trata de un modelo compacto del orden de los 278 millones de parametros, coherente con un encoder transformer tipo BERT/XLM-R base, aunque el autor no especifica la arquitectura exacta en la model card. Su proposito es la clasificacion automatica de noticias en hausa, una tarea relevante para medios, agregadores y sistemas de monitorizacion que trabajan con lenguas africanas de bajos recursos, donde escasean las herramientas NLP especificas.

La relevancia actual de esta ficha radica en que las cuantizaciones GGUF permiten ejecutar el clasificador en hardware de consumo, sin GPU dedicada, y sin depender de infraestructura en la nube. El repositorio incluye 12 variantes de cuantizacion (desde Q2_K hasta f16), y no cuenta con cuantizaciones ponderadas o con imatrix. El numero de descargas y likes publicados es 0 en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card; compatible con un encoder transformer de clasificacion (no confirmado por el autor) |
| Parametros totales | 278.047.495 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | hausa (codigo `ha`) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones de este repositorio); safetensors en el modelo base no cuantizado |

## Arquitectura y entrenamiento

La model card del repositorio no describe la arquitectura interna del modelo. Los metadatos indican que se trata de una cuantizacion estatica (`output_tensor_quantised: 1`, `quantize_version: 2`) del modelo base Batonicarla1/hausa-news-classifier, etiquetado como `text-classification` y `feature-extraction`. Por la tarea, el recuento de parametros (278 millones) y el pipeline, es plausible que se trate de un encoder transformer para clasificacion de secuencias, pero esta afirmacion no esta confirmada en la informacion disponible.

El entrenamiento del modelo original se realizo sobre el dataset masakhane/masakhanews, un corpus de noticias en hausa con etiquetas de categoria. No hay informacion sobre el numero de tokens, la composicion exacta del dataset, ni si se aplicaron tecnicas de ajuste como RLHF o DPO; al ser un clasificador, estas tecnicas no serian el mecanismo habitual. La innovacion aportada por este repositorio concreto es la distribucion de cuantizaciones GGUF estaticas (sin imatrix ni ponderacion), lo que habilita la inferencia en CPU y en GPUs de gama baja.

## Capacidades

- Clasificacion de texto en hausa: asigna una etiqueta de categoria a fragmentos de noticias escritas en este idioma.
- Extraccion de caracteristicas: la etiqueta `feature-extraction` sugiere que puede usarse como extractor de representaciones, aunque no se detalla su uso.
- Ejecucion local eficiente: las cuantizaciones GGUF permiten inferencia en CPU y GPUs de baja VRAM.
- No es un modelo generativo: no produce texto libre ni mantiene conversaciones.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Sin capacidades multimodales (vision, audio) documentadas.
- Multilingue: no; el modelo esta limitado al hausa segun la etiqueta de idioma.

## Casos de uso

- Clasificacion automatica de noticias en hausa: dado un titular o cuerpo de noticia en hausa, el modelo lo etiqueta en la categoria correspondiente (por ejemplo, politica, deportes o economia), lo que permite organizar automaticamente un feed informativo.
- Agregadores y lectores de noticias en hausa: integrar el clasificador para agrupar articulos por tematica y mejorar la navegacion de usuarios que consumen prensa en hausa, un idioma con cobertura digital limitada.
- Monitorizacion de medios para investigacion: catalogar grandes volumenes de noticias en hausa por categoria para estudios de comunicacion, analisis de agenda o seguimiento de temas de actualidad.
- Filtrado y moderacion de contenido informativo: descartar o priorizar articulos segun su categoria en paneles de curacion editorial, con inferencia local gracias a los pesos GGUF.
- Sistemas de recomendacion de noticias: usar la categoria predicha como senal para sugerir articulos relacionados a cada usuario dentro de una plataforma que publique en hausa.
- Investigacion en NLP para lenguas africanas: servir como punto de partida o baseline reproducible para experimentos de clasificacion en hausa y para comparar con otros enfoques multilingues.
- Despliegue en el edge o en dispositivos sin GPU: dado que las cuantizaciones Q4 ocupan alrededor de 0,3 GB, es viable ejecutar la clasificacion en servidores modestos, contenedores ligeros o incluso hardware embebido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,7 GB para la version f16, 0,4 GB para Q8_0 y 0,3 GB para las variantes Q4_K y Q5_K segun los tamanos de archivo publicados.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; no se requiere hardware de datacenter. Sirven desde una GTX 1050 hasta una RTX 4090, aunque el modelo no aprovechara la capacidad de GPUs de gama alta.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer, e incluso es viable en CPU por el reducido tamano de los pesos.
- Opciones de despliegue: llama.cpp y Ollama para los ficheros GGUF; el modelo base Batonicarla1/hausa-news-classifier puede cargarse con la libreria `transformers` para un uso estandar de clasificacion. El soporte de clasificacion pura en algunos runners GGUF puede estar limitado y conviene verificarlo.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/hausa-news-classifier-GGUF | 278.047.495 | no disponible | GGUF | no disponible | HuggingFace, 0 descargas |
| Batonicarla1/hausa-news-classifier (base) | 278.047.495 (segun este repo) | no disponible | safetensors | no disponible | HuggingFace |
| Encoders multilingues genericos (XLM-R base, AfroXLMR, AfriBERTa) | orden de 278M (XLM-R base) | mayor en general | safetensors | MIT o similar segun modelo | HuggingFace |

No se dispone de datos de rendimiento comparados en la informacion proporcionada, por lo que la comparacion se limita a parametros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia no disponible: la ausencia de una licencia explicita impide confirmar si el uso comercial esta permitido. Debe aclararse con el autor antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: al ser un clasificador y no un modelo generativo, no genera texto, pero puede asignar categorias incorrectas con alta confianza.
- Idioma unico: solo soporta hausa, por lo que no es util para otras lenguas sin un ajuste adicional.
- Sesgos potenciales: al entrenarse sobre masakhane/masakhanews, el modelo hereda los sesgos de cobertura y de etiquetado de ese corpus, incluyendo un posible desequilibrio entre categorias y una sobrerrepresentacion de ciertos temas.
- Riesgo de sobreajuste de dominio: al ser especifico de noticias en hausa, su rendimiento fuera del dominio periodistico (por ejemplo, redes sociales o texto informal) es incierto.
- Sin benchmarks publicados: no hay evidencia objetiva de su calidad (accuracy, F1) en la informacion disponible.
- Soporte de herramientas: el uso de GGUF para tareas de clasificacion no esta soportado de forma homogenea por todos los runners, lo que puede exigir validacion tecnica previa.
- Ausencia de cuantizaciones ponderadas: el autor indica que no hay cuants con imatrix, por lo que las variantes de baja precision (Q2_K, Q3_K) pueden degradar la calidad mas de lo habitual.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/hausa-news-classifier-GGUF
- Modelo base: https://huggingface.co/Batonicarla1/hausa-news-classifier
- Dataset de entrenamiento: https://huggingface.co/datasets/masakhane/masakhanews
- Pagina de resumen de descargas del autor: https://hf.tst.eu/model#hausa-news-classifier-GGUF
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de tipos de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
