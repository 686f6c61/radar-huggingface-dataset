# rosadecsai/led-large-16384-BASE3ep-ASPRPreACE3ep

## Resumen

`rosadecsai/led-large-16384-BASE3ep-ASPRPreACE3ep` es un ajuste fino publicado por el usuario rosadecsai en Hugging Face, derivado de `rosadecsai/led-large-16384-BASE3ep`. Pertenece a la familia LED (Longformer Encoder-Decoder) de AllenAI, una arquitectura transformer encoder-decoder construida sobre BART-large y disenada especificamente para procesar documentos de hasta 16.384 tokens mediante atencion local dispersa combinada con tokens globales. El checkpoint tiene 459.859.047 parametros (~460 M) y se distribuye bajo licencia Apache 2.0 en formato safetensors.

El modelo resuelve tareas de generacion condicionada sobre entradas muy largas, principalmente resumen abstractivo, y se ha entrenado durante 3 epocas con aprendizaje supervisado (AdamW, learning rate 5e-5, batch total 16, precision mixta nativa) sobre un dataset que la propia model card identifica como "None", es decir, sin especificar. Las unicas metricas declaradas son ROUGE sobre un conjunto de evaluacion no descrito: Rouge1 32,91, Rouge2 11,00, RougeL 16,88 y RougeLsum 31,79, con una perdida de validacion de 2,1078.

Su relevancia practica es limitada: acumula 0 descargas y 0 likes, la model card esta generada automaticamente por el Trainer y no documenta usos previstos, composicion de datos ni limitaciones. Debe tratarse como un checkpoint de investigacion reproducible a partir de la cadena de modelos LED de 16k, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo LED (Longformer Encoder-Decoder), con atencion local deslizante y tokens globales; base BART-large |
| Parametros totales | 459.859.047 (~460 M) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | no disponible (no se han publicado cuantizaciones oficiales del autor) |
| Idiomas soportados | no disponible (el autor no los declara; el LED base de AllenAI se entreno principalmente con corpus en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | rosadecsai/led-large-16384-BASE3ep |
| Tamano del repositorio | 12,9 GB (incluye checkpoints intermedios de entrenamiento) |
| Libreria | transformers (Transformers 4.48.3, PyTorch 2.11.0+cu130, Datasets 4.8.5, Tokenizers 0.21.4) |
| Etiquetas relevantes | generated_from_trainer, tensorboard, endpoints_compatible, region:us |

## Arquitectura y entrenamiento

LED extiende BART-large sustituyendo la atencion densa por un esquema de atencion local de ventana reducida mas un conjunto de tokens globales que atienden a toda la secuencia. Para alcanzar 16.384 posiciones, la matriz de embeddings posicionales original se replica 16 veces, de modo que el coste de atencion crece de forma aproximadamente lineal con la longitud de entrada en lugar de cuadratica. Esta combinacion es la que permite procesar documentos completos sin truncado agresivo y es la razon por la que el modelo se usa en tareas de resumen de documentos largos.

El entrenamiento documentado es un ajuste fino supervisado de 3 epocas sobre `rosadecsai/led-large-16384-BASE3ep`: learning rate 5e-5 con scheduler lineal, AdamW con betas (0,9; 0,999) y epsilon 1e-8, batch de entrenamiento 8 con 2 pasos de acumulacion (batch total efectivo 16), batch de evaluacion 8, semilla 42 y AMP nativo. No hay evidencia en la informacion disponible de RLHF, DPO, RLVR ni de ninguna fase de alineacion posterior; tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset ni el uso de decodificacion especulativa u otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto condicionada por entrada larga (seq2seq encoder-decoder), con ventana de 16.384 tokens.
- Resumen abstractivo de documentos extensos, que es la tarea para la que se declaran metricas ROUGE.
- Respuesta a preguntas extractivas y abstractivas sobre documentos largos, siempre que la tarea se plantee en formato encoder-decoder (contexto + pregunta como entrada, respuesta como salida).
- Reescritura y compresion de contenido textual largo (informes, transcripciones, articulos).
- Capacidad multilingue: no disponible; no se declara soporte de idiomas y el modelo base esta orientado a ingles.
- Tool calling / function calling: no soportado. No es un modelo instruction-tuned ni chat.
- Uso como agente o razonamiento multi-paso: no soportado de forma nativa.
- Vision, audio y modo "thinking": no soportados.

## Casos de uso

- Resumen de documentacion legal y contractual: el modelo puede ingerir contratos o expedientes completos de hasta 16.384 tokens en una sola pasada, sin necesidad de trocear el documento, lo que reduce la perdida de contexto entre fragmentos que sufren los enfoques basados en ventanas cortas.
- Resumen de articulos cientificos y revisiones bibliograficas: al cubrir aproximadamente entre 12.000 y 20.000 palabras en ingles, permite condensar un paper completo en un abstracto o en un resumen estructurado en una unica inferencia.
- Procesamiento de transcripciones de reuniones o vistas: actas extensas pueden resumirse directamente, generando un resumen de acuerdos y puntos tratados con las metricas ROUGE declaradas como referencia orientativa.
- Generacion de resumenes para pipelines de RAG: usar el modelo como etapa de enriquecimiento que produce resumenes por documento antes de indexarlos en una base vectorial, reduciendo el tamano del corpus y mejorando la densidad semantica de los fragmentos recuperados.
- Investigacion academica sobre resumen de documentos largos: sirve como checkpoint de partida reproducible para comparar estrategias de ajuste fino (learning rates, numero de epocas, ventanas de atencion) sobre la arquitectura LED de 16k.
- Ajuste fino adicional en dominio especifico: al ser un modelo de 460 M con licencia Apache 2.0, es viable reentrenarlo en dominios verticales (medicina, seguros, administracion publica) con recursos de una sola GPU de 24 GB.
- Extraccion de respuestas sobre normativa o manuales tecnicos: planteando la tarea como generacion condicionada (documento + consulta), se obtienen respuestas ancladas a fragmentos del propio texto de entrada.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de evaluacion no descrito):

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 2,1078 |
| Rouge1 | 32,9114 |
| Rouge2 | 11,0014 |
| RougeL | 16,8776 |
| RougeLsum | 31,7862 |
| Gen Len | 1,0 |

Evolucion durante el entrenamiento:

| Epoca | Paso | Loss de validacion | Rouge1 | Rouge2 | RougeL | RougeLsum | Gen Len |
|---|---|---|---|---|---|---|---|
| 1,0 | 1132 | 2,0916 | 39,3443 | 12,3894 | 19,9243 | 37,5788 | 1,0 |
| 2,0 | 2264 | 2,0652 | 38,5224 | 14,2857 | 20,3166 | 36,9393 | 1,0 |
| 2,9978 | 3393 | 2,1078 | 32,9114 | 11,0014 | 16,8776 | 31,7862 | 1,0 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) ni comparaciones cuantitativas con modelos alternativos. El `model-index` del repositorio declara una lista de resultados vacia.

## Requisitos de hardware

- VRAM estimada en inferencia (solo pesos): aproximadamente 1,8 GB en fp32, 0,9 GB en fp16/bf16, 0,46 GB en int8 y 0,23 GB en int4.
- VRAM estimada en inferencia con secuencias de 16.384 tokens y batch 1: del orden de 3 a 6 GB en fp16, ya que las activaciones crecen de forma aproximadamente lineal con la longitud de entrada.
- GPU recomendadas: cualquier GPU con 8 GB o mas para uso en fp16 a longitud completa; RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, A10, L4, A100 y H100 son suficientes sin necesidad de paralelismo.
- Cabe en GPU de consumo: si, en la practica totalidad de GPU con 8 GB o mas. El cuello de botella no es el tamano del modelo sino la longitud de secuencia configurada.
- Opciones de despliegue: `transformers` es la via principal y la unica con soporte confirmado, dado que la arquitectura LED con atencion local no esta integrada en los motores de inferencia mas habituales. La conversion a ONNX mediante `optimum` es el camino mas directo para reducir latencia. No hay soporte confirmado en vLLM, llama.cpp, Ollama ni TGI para esta arquitectura.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de latencia ni de tokens por segundo.
- Nota sobre el repositorio: los 12,9 GB del repositorio corresponden a los checkpoints intermedios guardados durante el entrenamiento, no al peso final. La descarga del modelo utilizable ronda 1-2 GB.

## Comparativa con modelos similares

Especificaciones de los modelos comparativos segun su documentacion publica:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| led-large-16384-BASE3ep-ASPRPreACE3ep | 459,9 M | 16.384 tokens | apache-2.0 | Hugging Face (rosadecsai) |
| rosadecsai/led-large-16384-BASE3ep | no disponible (~460 M, misma arquitectura) | 16.384 tokens | no disponible | Hugging Face (rosadecsai) |
| allenai/led-large-16384 | ~460 M | 16.384 tokens | apache-2.0 | Hugging Face (AllenAI) |
| allenai/led-base-16384 | ~162 M | 16.384 tokens | apache-2.0 | Hugging Face (AllenAI) |
| facebook/bart-large-cnn | ~406 M | 1.024 tokens | MIT | Hugging Face (Meta) |

Frente a BART-large-CNN, la ventaja de este checkpoint es la ventana de contexto, 16 veces mayor, que elimina la necesidad de segmentar documentos. Frente a `allenai/led-large-16384`, es un ajuste fino derivado y por tanto no aporta capacidades nuevas de arquitectura: su unico diferencial potencial es la especializacion en el dataset de ajuste, que el autor no documenta. Frente a `allenai/led-base-16384`, ofrece mayor capacidad a cambio de aproximadamente el triple de parametros. No hay datos de rendimiento comparativo disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: la model card indica explicitamente "on the None dataset", por lo que se desconoce la procedencia, el idioma, el dominio y el tamano de los datos de ajuste. Esto impide evaluar sesgos y limita la reproducibilidad.
- Valores de `Gen Len` = 1,0 en las tres epocas: resulta llamativo que la longitud media generada sea de un token mientras se declaran puntuaciones ROUGE de hasta 39,34. Conviene verificar la configuracion de generacion (`max_length`, `min_length`, `no_repeat_ngram_size`) antes de reutilizar el modelo, porque podria tratarse de un artefacto del registro de metricas o de una salida degenerada.
- El mejor resultado por ROUGE corresponde a la epoca 1, no al checkpoint final. El modelo publicado (3 epocas) presenta un Rouge1 de 32,91 frente a los 39,34 de la primera epoca, lo que sugiere sobreajuste o degradacion en la fase final del entrenamiento.
- Riesgo de alucinacion: es un modelo seq2seq de resumen, no un modelo con alineacion por RLHF ni con mecanismos de citacion. Puede generar contenido no presente en el documento fuente.
- Cobertura idiomatica no declarada: no hay garantia de rendimiento en castellano. El LED base de AllenAI esta orientado a ingles, por lo que su uso en espanol requiere validacion propia.
- Ausencia de soporte para instrucciones: no es un modelo de chat, no acepta system prompts ni realiza tool calling. Cualquier uso conversacional requiere envolverlo en una interfaz ad hoc.
- Sin validacion por la comunidad: 0 descargas y 0 likes. No existen reportes externos, evaluaciones independientes ni issues que permitan contrastar las metricas declaradas.
- Restricciones de licencia: el checkpoint se publica como apache-2.0, pero conviene verificar la licencia de toda la cadena de modelos base ascendente antes de un uso comercial.
- Coste de atencion: aunque la atencion es lineal, procesar 16.384 tokens incrementa el tiempo de inferencia de forma apreciable frente a ventanas de 1.024 o 4.096 tokens, especialmente en CPU.
- Artefactos del repositorio: el repositorio ocupa 12,9 GB por los checkpoints intermedios; conviene descargar unicamente los ficheros safetensors de la raiz para evitar transferencias innecesarias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rosadecsai/led-large-16384-BASE3ep-ASPRPreACE3ep
- Modelo base del ajuste: https://huggingface.co/rosadecsai/led-large-16384-BASE3ep
- Otro checkpoint del mismo autor: https://huggingface.co/rosadecsai/led-large-16384-BASE-Attention3ep
- Arquitectura LED original (AllenAI), referencia de `led-large-16384`: https://huggingface.co/allenai/led-large-16384
- Ficha descriptiva de LED-Large-16384 en PromptLayer: https://www.promptlayer.com/models/led-large-16384/
- Articulo divulgativo sobre el despliegue de LED-Large-16384 en hardware Huawei: https://aichina.news/blog/tackle-16k-tokens-on-huawei-hardware-the-led-large-16384-model-lands-2p3sib/
- Cuaderno de ejemplo de ajuste fino de LED-large (LegSum): https://colab.research.google.com/github/d0r1h/LegSum/blob/main/scripts/notebooks/LED_%5Blarge%5D.ipynb
