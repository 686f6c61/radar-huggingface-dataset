# GG-QandV/gliner_small-v2.5-onnx

## Resumen

GG-QandV/gliner_small-v2.5-onnx es una conversion a ONNX con cuantizacion dinamica INT8 del modelo de reconocimiento de entidades nombradas (NER) zero-shot gliner-community/gliner_small-v2.5, desarrollado por el usuario GG-QandV a partir del proyecto GLiNER de Urchade Zaratiana. No se trata de un reentrenamiento ni de un ajuste fino: los pesos son los del modelo original (revision `f227d3cd`), y lo aportado aqui es exclusivamente el cambio de formato (PyTorch a ONNX, opset 19) y de precision (fp32 a INT8 mediante `onnxruntime.quantization.quantize_dynamic` con `QuantType.QUInt8`). El objetivo es disponer de un paquete autocontenido de NER offline que se ejecute en CPU sin dependencia de PyTorch.

El modelo subyacente es un uni-encoder de spans de tipo GLiNER construido sobre el encoder `microsoft/deberta-v3-small` (768 dimensiones ocultas, vocabulario de 128 003 entradas, `max_len` de 768 tokens y `max_width` de 12 palabras por span). Su rasgo distintivo es que los tipos de entidad no estan fijados en los pesos: se suministran en el prompt con el formato `<<ENT>> <tipo> ... <<SEP>> <texto>`, lo que permite definir categorias arbitrarias en tiempo de inferencia. La etiqueta de idioma es multilingue y el autor aporta una evaluacion propia sobre 19 idiomas.

La relevancia practica esta en el coste de despliegue: el grafo INT8 ocupa 196 786 385 bytes (unos 188 MiB) y el consumo medido en CPU de 12 vCPU es de 240,8 MB de RSS con las optimizaciones desactivadas. La conversion declara paridad numerica exacta con la implementacion upstream (diferencia maxima de score de 1,192e-07 sobre 20 textos y 0 diferencias de conjunto en 20 de 20 casos), lo que la hace util como sustituto directo en produccion cuando no se dispone de GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Uni-encoder de spans GLiNER (transformer encoder DeBERTa-v3-small) con cabeza de spans `markerV0` y `has_rnn: true` |
| Parametros totales | no disponible (el autor no declara el recuento; el grafo INT8 pesa 196 786 385 bytes y la dimension oculta es 768) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 768 tokens (`max_len`); `max_width` de 12 palabras por span |
| Tipos de cuantizacion | INT8 dinamica (`QuantType.QUInt8`); no se distribuye fp16, GGUF ni version fp32 (el grafo fp32 de referencia existe pero no se incluye) |
| Idiomas soportados | Multilingue (etiqueta oficial); evaluado por el autor en 19 idiomas: fr, de, es, nl, pl, ro, sv, cs, bg, sr, hu, el, fi, tr, it, lt, lv, et, pt |
| Licencia | Apache-2.0 (texto canonico en el repositorio, mas fichero `NOTICE` de procedencia) |
| Formato de pesos | ONNX (`model_quantized.onnx`, opset 19). No hay safetensors, GGUF ni binarios PyTorch |

## Arquitectura y entrenamiento

El modelo es un uni-encoder de spans: se codifica conjuntamente la lista de tipos de entidad y el texto de entrada, y la cabeza de clasificacion predice, para cada palabra y cada posible ancho de span (hasta `max_width = 12`), una puntuacion por tipo de entidad. Los tipos llegan como texto en el prompt con los tokens especiales `<<ENT>>` y `<<SEP>>`, de modo que el vocabulario de entidades es abierto y no requiere reentrenamiento. El encoder es `microsoft/deberta-v3-small` con 768 dimensiones ocultas y tokenizador de 128 003 entradas. La segmentacion de palabras es por espacios en blanco (`words_splitter_type: whitespace`) con `subtoken_pooling: first`. La salida es un tensor de logits de forma `(batch, words, max_width, num_types)` y las entidades se extraen aplicando `sigmoid(logits) >= threshold`, con umbral de referencia `ner_score_threshold = 0.5`. La inferencia se realiza en ONNX Runtime sobre CPU; el grafo declara seis entradas (`input_ids`, `attention_mask`, `words_mask`, `text_lengths`, `span_idx`, `span_mask`), esta ultima de tipo `bool`.

En cuanto al entrenamiento, esta ficha no dispone de informacion sobre el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO en el modelo original: el autor de esta conversion no los documenta y se remite al modelo fuente y al paper de GLiNER (arXiv:2311.08526). El unico dataset referenciado en las etiquetas del repositorio es `urchade/pile-mistral-v0.1`. La innovacion tecnica de esta publicacion concreta es de ingenieria: exportacion determinista (reejecutar el script reproduce los mismos sha256), verificacion de paridad numerica contra la implementacion upstream en los niveles `ORT_ENABLE_ALL` y `ORT_DISABLE_ALL`, y cuantizacion dinamica que no altera el conjunto de entidades detectadas entre niveles de optimizacion.

## Capacidades

- Reconocimiento de entidades nombradas zero-shot con vocabulario abierto: los tipos de entidad se definen en el prompt en tiempo de inferencia, sin reentrenamiento.
- Extraccion de spans de hasta 12 palabras, con soporte de entidades multitoken y anidadas a nivel de span.
- Procesamiento multilingue: el autor reporta resultados sobre 19 idiomas europeos, con una tasa de acierto minima de 0,77 sobre el conjunto de prueba (10 frases por idioma, etiquetas PER/ORG/LOC).
- Clasificacion de tokens y agrupacion de entidades con umbral configurable (`ner_score_threshold`, 0.5 en la referencia).
- Ejecucion en CPU mediante ONNX Runtime, sin dependencia de PyTorch en tiempo de ejecucion (torch solo se usa en la fase de exportacion).
- Procesamiento por lotes: el grafo admite entrada por lotes (`batch`) y salida de logits por palabra, span y tipo.
- No dispone de generacion de texto, tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento extendido: es un modelo exclusivamente discriminativo de etiquetado de tokens.

## Casos de uso

- Extraccion de entidades en ingesta de documentos para pipelines RAG: el modelo etiqueta personas, organizaciones, localizaciones, fechas o productos en el texto antes de trocearlo e indexarlo, lo que permite enriquecer los metadatos de cada fragmento y filtrar por entidad en la busqueda.
- Deteccion de informacion personal identificable (PII) en textos multilingues: definiendo tipos como `person`, `address` o `phone` en el prompt, se puede preprocesar contenido antes de enviarlo a un servicio externo o de almacenarlo.
- Analisis de contratos y documentacion legal: con tipos como `party`, `date`, `amount` o `jurisdiction`, el modelo extrae los campos relevantes de documentos en varios idiomas sin necesidad de anotar datos ni entrenar un clasificador por dominio.
- Normalizacion de metadatos editoriales y de catalogo: extraccion de autor, editorial, lugar y fecha en registros bibliograficos heterogeneos, aprovechando que los tipos de entidad se pueden redefinir por coleccion.
- Procesamiento por lotes en servidores sin GPU: al ejecutarse en ONNX Runtime sobre CPU con un consumo medido de 240,8 MB de RSS, encaja en contenedores pequenos o en tareas batch nocturnas donde no se justifica alquilar aceleradores.
- Despliegue en el borde o en entornos aislados: el paquete es autocontenido (grafo, tokenizer y configuracion, sin PyTorch) y puede empaquetarse en una imagen ligera para ejecucion offline o en instalaciones sin salida a internet.
- Enriquecimiento de sistemas de monitorizacion de medios: deteccion de organizaciones y personas en flujos de noticias en varios idiomas para construir agregados por entidad y detectar menciones nuevas.
- Preetiquetado para anotacion humana: el modelo genera propuestas de spans que un anotador revisa, reduciendo el coste de construir un corpus etiquetado en un dominio nuevo.

## Benchmarks y rendimiento

Paridad con la implementacion upstream (20 textos, 10 en ruso y 10 en ucraniano, 6 tipos de entidad, mismas opciones de sesion en ambas rutas):

| Ruta | max abs(delta score) | Diferencias de conjunto |
|---|---:|---:|
| GLiNER upstream vs este grafo | 1,192e-07 | 0 / 20 |

INT8 frente a la referencia fp32 (32 textos, tipos organizacion/persona/localizacion/fecha/tecnologia/producto, umbral 0,5):

| Configuracion | Entidades encontradas | Coincidentes con fp32 | Faltantes vs fp32 | Extras vs fp32 |
|---|---:|---:|---:|---:|
| INT8 `ORT_ENABLE_ALL` | 74 | 68 | 7 | 6 |
| INT8 `ORT_DISABLE_ALL` | 74 | 68 | 7 | 6 |

El autor indica que las dos rutas de optimizacion producen conjuntos de entidades identicos (0 diferencias) y que las 7 discrepancias frente a fp32 corresponden a reasignaciones de tipo (ORG a LOC, tecnologia a producto), divisiones de span (`Nataliia Bondarenko` en dos tokens; `15 de marzo de 2027` en fecha y ano) o ruido de baja puntuacion descartado, no a entidades realmente perdidas.

Latencia y memoria en INT8 (6 tipos, p50, CPU de 12 vCPU):

| Nivel ORT | ~30 tokens | ~128 tokens | ~512 tokens | RSS |
|---|---:|---:|---:|---:|
| `ORT_DISABLE_ALL` | 107 ms | 281 ms | 1169 ms | 240,8 MB |
| `ORT_ENABLE_ALL` | 59 ms | 134 ms | 845 ms | 419,8 MB |

Cobertura por idioma (10 frases PER/ORG/LOC por idioma, umbral 0,5; se indica entidades encontradas sobre 30 y falsos positivos):

| Idioma | Encontradas | FP | Idioma | Encontradas | FP |
|---|---:|---:|---|---:|---:|
| fr | 30/30 | 0 | el | 27/30 | 3 |
| de | 30/30 | 0 | fi | 26/30 | 0 |
| es | 28/30 | 2 | tr | 26/30 | 6 |
| nl | 28/30 | 2 | it | 25/30 | 2 |
| pl | 28/30 | 2 | lt | 25/30 | 0 |
| ro | 27/30 | 2 | lv | 25/30 | 0 |
| sv | 27/30 | 2 | et | 24/30 | 0 |
| cs | 27/30 | 2 | pt | 23/30 | 3 |
| bg | 27/30 | 2 | | | |
| sr | 27/30 | 2 | | | |
| hu | 27/30 | 1 | | | |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; las metricas anteriores son las de aceptacion del propio autor y estan acotadas a conjuntos de prueba pequenos.

## Requisitos de hardware

- El modelo es un encoder de 768 dimensiones cuantizado a INT8: no requiere GPU para funcionar. La validacion del autor se ejecuto integramente en CPU de 12 vCPU.
- Memoria en ejecucion medida: 240,8 MB de RSS con `ORT_DISABLE_ALL` y 419,8 MB con `ORT_ENABLE_ALL` (mas velocidad, mas memoria).
- Peso en disco del grafo cuantizado: 196 786 385 bytes (aproximadamente 188 MiB); el conjunto del repositorio ocupa 0,2 GB e incluye tokenizer (8,3 MB), configuracion y licencia.
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) y en equipos sin GPU dedicada, ya que el cuello de botella es de CPU y no de VRAM.
- Latencia p50 de referencia en CPU de 12 vCPU: 59 ms para ~30 tokens, 134 ms para ~128 tokens y 845 ms para ~512 tokens con `ORT_ENABLE_ALL`. Con `ORT_DISABLE_ALL`: 107 ms, 281 ms y 1169 ms respectivamente.
- Opciones de despliegue: ONNX Runtime 1.25.0 (probado por el autor) con cualquier execution provider disponible en la plataforma (CPU, CUDA, TensorRT, DirectML), tanto desde Python como desde las APIs de C++, C# o JavaScript. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo y el formato es ONNX.
- Para reproducir la exportacion se necesita PyTorch 2.13.0 y la libreria `gliner` 0.2.28; ninguna de las dos es dependencia de ejecucion.

## Comparativa con modelos similares

| Modelo | Parametros | Limite de entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| GG-QandV/gliner_small-v2.5-onnx | no disponible | 768 tokens, spans de 12 palabras | ONNX INT8 | Apache-2.0 | Version cuantizada; paridad numerica 1,192e-07 con el original; 188 MiB |
| gliner-community/gliner_small-v2.5 | no disponible | 768 tokens, spans de 12 palabras | PyTorch fp32 | Apache-2.0 | Modelo fuente (revision `f227d3cd`); requiere PyTorch; referencia fp32 del anterior |
| Otras variantes de la familia GLiNER (base, large, multi) | no disponible | no disponible | no disponible | no disponible | No aparecen datos en la informacion proporcionada |
| Alternativas de NER clasico (spaCy, Stanza, mBERT fine-tuneado) | no disponible | no disponible | no disponible | no disponible | No hay datos comparativos en la informacion disponible |

## Limitaciones y advertencias

- Es una reserializacion, no un ajuste fino: hereda integramente los sesgos, la cobertura y los errores del modelo `gliner-community/gliner_small-v2.5`. Cualquier limitacion del original se traslada sin cambios.
- La cuantizacion INT8 introduce divergencias medibles frente a fp32: en el conjunto de aceptacion de 74 entidades, 7 no coincidieron y aparecieron 6 de mas. El autor las atribuye a reasignacion de tipo, division de spans o ruido subumbral, pero conviene validar el impacto en cada dominio antes de desplegar.
- Sensibilidad al umbral: todas las cifras de cobertura y falsos positivos estan tomadas con `ner_score_threshold = 0.5`. Umbrales distintos alteran de forma directa el equilibrio entre entidades perdidas y falsos positivos, con deltas de score de hasta 0,40 observados en spans de ruido.
- Segmentacion por espacios en blanco: el modelo divide el texto por espacios, lo que penaliza idiomas sin separacion explicita de palabras (chino, japones, tailandes) y no ha sido evaluado en la informacion disponible para esos casos.
- Degradacion ligada a la fragmentacion en sub-tokens: el propio autor la vincula al numero de sub-tokens por palabra (hasta 2,9 en turco, idioma con 6 falsos positivos sobre 30 entidades). Los idiomas con mas fragmentacion rinden peor.
- Limite estructural de span: `max_width` es de 12 palabras, por lo que entidades mas largas que ese ancho no se pueden recuperar como un unico span.
- Limite de entrada de 768 tokens: textos mas largos deben trocearse, con el consiguiente riesgo de partir entidades en la frontera entre fragmentos.
- Riesgo de alucinacion en el sentido de falsos positivos: el modelo genera entidades donde no las hay, especialmente en idiomas con alta fragmentacion (6 falsos positivos en turco, 3 en griego y en portugues sobre 30 entidades esperadas).
- La evaluacion aportada es de alcance reducido: 20 textos para la paridad, 32 textos para la comparacion INT8/fp32 y 10 frases por idioma en la prueba multilingue. No sustituye a una evaluacion sobre un corpus de referencia.
- Licencia Apache-2.0: permite uso comercial y modificacion, con obligacion de conservar el aviso de licencia y el fichero `NOTICE` de procedencia. Conviene revisar la licencia del modelo fuente, que es la misma, e incluir la atribucion correspondiente.
- Madurez del artefacto: el repositorio registra 0 descargas y 1 like en la fecha de consulta, por lo que no existe validacion independiente de la comunidad sobre esta conversion concreta.
- El grafo fp32 de referencia no se incluye, de modo que no es posible verificar la paridad fp32 sin volver a exportar desde el modelo original con PyTorch instalado.
- No se documentan medidas de mitigacion de sesgo ni evaluaciones de equidad por genero, origen o religion en la informacion disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/GG-QandV/gliner_small-v2.5-onnx
- Modelo base: https://huggingface.co/gliner-community/gliner_small-v2.5
- Encoder subyacente: https://huggingface.co/microsoft/deberta-v3-small
- Proyecto GLiNER en GitHub: https://github.com/urchade/GLiNER
- Paper de GLiNER: https://arxiv.org/abs/2311.08526
- Dataset referenciado en las etiquetas: https://huggingface.co/datasets/urchade/pile-mistral-v0.1
