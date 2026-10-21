# knowledgator/gliclass-v4-edge

## Resumen

`knowledgator/gliclass-v4-edge` es la variante "edge" de 0,4B parámetros de la familia GLiClass v4, desarrollada por Knowledgator. Se trata de un encoder bidireccional tipo BERT (derivado de `microsoft/deberta-v3-large`) especializado en clasificación zero-shot: en lugar de generar texto, recibe un texto de entrada, un conjunto arbitrario de etiquetas y, opcionalmente, una instrucción o política, y devuelve una puntuación calibrada para cada etiqueta en una sola pasada forward.

El modelo resuelve el problema de tener que reentrenar un clasificador para cada nueva tarea: las etiquetas y la instrucción se definen en tiempo de inferencia. Soporta clasificación multi-etiqueta, de etiqueta única (con softmax sobre las opciones), etiquetas jerárquicas, ejemplos few-shot, reranking, NLI y razonamiento sobre grafos de conocimiento expresados como texto.

Su relevancia actual está en el segmento de decisiones de baja latencia en CPU y dispositivos edge: el autor reporta un valor de 47,5 en el "Decision Index public skill" con una latencia mediana de 11 ms por decisión, por delante del mejor modelo de hasta 1B parámetros de ese ranking (36,9). Es una alternativa no generativa y mucho más barata que un LLM para tareas de enrutado, guardrails o moderación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional (DeBERTa-v3, tipo BERT); sin decodificador, no genera texto |
| Parametros totales | 439.790.595 (0,4B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | Hasta 2048 tokens configurados en el pipeline de ejemplo (`max_length=2048`); no se documenta la ventana maxima real del encoder |
| Tipos de cuantizacion | No se detalla el esquema; el modelo base figura como version cuantizada de `microsoft/deberta-v3-large`. El repo publica pesos en safetensors y exportacion ONNX |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors y ONNX |
| Modelo base | `microsoft/deberta-v3-large` (variante cuantizada) |
| Libreria / pipeline | `gliclass`; `zero-shot-classification` |
| Tamano del repositorio | 3,3 GB |
| Descargas / likes | 340 descargas, 13 likes (en el momento de la consulta) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer bidireccional de la familia DeBERTa-v3, reutilizado como cabecera de clasificación zero-shot al estilo GLiClass: el texto y las etiquetas (junto con la instruccion opcional) se codifican conjuntamente y el modelo produce una puntuacion por etiqueta en una unica pasada forward. No hay generacion autoregresiva ni decodificacion especulativa; la salida es puramente discriminativa. Las puntuaciones se presentan calibradas sobre datos de retencion y se expone tambien `initial_score` con el valor sin calibrar.

No se han publicado en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni el procedimiento exacto de cuantizacion. La model card si documenta capacidades de inferencia que condicionan el diseno: seguimiento de instrucciones mediante el parametro `prompt` (politicas, rubricas, criterios), soporte de ejemplos few-shot (`examples=[{"text": ..., "labels": [...]}]`), etiquetas jerarquicas y tipos de clasificacion `multi-label` y `single-label`.

## Capacidades

- Clasificacion zero-shot multi-etiqueta: devuelve `label` y `score` por cada etiqueta, con umbral configurable y calibracion sobre datos de retencion.
- Clasificacion de etiqueta unica: aplica softmax sobre el conjunto de etiquetas y devuelve la opcion ganadora.
- Seguimiento de instrucciones: el parametro `prompt` acepta politicas, rubricas o criterios que modulan la interpretacion de las etiquetas.
- Escalas de evaluacion: uso de niveles (`1 - wrong` ... `5 - excellent`) como etiquetas, con `return_hierarchical=True` para obtener la probabilidad de cada nivel.
- Etiquetas jerarquicas, por ejemplo `{"sentiment": ["positive", "negative"], "topic": ["product", "service"]}`.
- Aprendizaje few-shot en inferencia mediante el parametro `examples`, sin reentrenamiento.
- Reranking de pasajes: puntuacion de cada pasaje frente a una consulta usando la consulta como etiqueta y una instruccion del tipo "does the passage answer the query?".
- Razonamiento sobre grafos de conocimiento en formato textual (tripletas `A -relacion-> B`), incluidas reglas de precedencia y preguntas multihop.
- NLI: etiquetas `entailment`, `neutral`, `contradiction`.
- Seleccion de siguiente accion en agentes y navegacion web: elegir enlace, herramienta o accion entre un conjunto de opciones.
- Guardrails y moderacion de contenido: comprobar si un texto cumple o viola una politica descrita en el prompt.
- Inferencia por lotes (`batch_size`) y soporte de CPU/edge; no genera texto en ningun caso.
- Capacidades multimodales: no disponibles en esta variante (la variante `edge` es solo texto dentro de la familia GLiClass v4).
- Tool calling generativo: no disponible; el modelo puede puntuar opciones de herramientas o acciones, pero no emitir llamadas estructuradas.

## Casos de uso

- Moderacion de contenido con politicas dinamicas: se pasa la politica de la plataforma como `prompt` y etiquetas como `violates policy` / `complies with policy`; al ser un encoder de 0,4B y ~11 ms por decision, permite filtrar en linea cada mensaje sin coste de generacion.
- Guardrails de salida de un LLM: clasificar la respuesta de un modelo generativo frente a un conjunto de criterios (toxicidad, fuga de datos, cumplimiento de formato) usando etiquetas jerarquicas y `single-label` para obtener una decision con probabilidad.
- Reranking en pipelines RAG: puntuar decenas de pasajes recuperados frente a la consulta del usuario y reordenarlos antes de pasarlos al modelo generativo; sustituye a cross-encoders mas grandes con menor latencia.
- Enrutado de tickets y solicitudes de soporte: etiquetas como `billing`, `technical`, `refund`, `shipping`, con `classification_type="multi-label"` para capturar tickets que pertenecen a varias categorias y `examples` para ajustar el criterio por cliente.
- Evaluacion automatica de calidad de respuestas: usar los niveles de una escala como etiquetas y `return_hierarchical=True` para obtener la distribucion de probabilidad sobre los niveles, util en paneles de evaluacion de asistentes.
- Control de acceso y razonamiento sobre grafos: pasar el grafo de permisos como texto, la pregunta como instruccion y `yes`/`no` como etiquetas para resolver consultas de autorizacion con reglas de precedencia, sin escribir logica ad hoc.
- Analisis de resenas de producto: extraccion multi-etiqueta de aspectos (`battery`, `display`, `durability`, `price`, `shipping`) con umbral ajustable, apto para ejecutarse en CPU sobre lotes grandes.
- Seleccion de siguiente accion en agentes: dado el estado de la conversacion o de la pagina, puntuar enlaces, herramientas o acciones candidatas y elegir la mas probable, con la ventaja de no requerir parsing de texto generado.
- Clasificacion de documentos en entornos con restricciones de hardware: al estar pensado para CPU y edge, puede desplegarse en contenedores sin GPU para triaje documental o compliance.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son del "Decision Index" del autor. No hay resultados de MMLU, HumanEval, GSM8K ni de benchmarks de clasificacion estandar, y en sentido estricto no aplican al ser un encoder discriminativo y no un modelo generativo.

| Metrica | Resultado | Referencia |
|---|---|---|
| Decision Index public skill | 47,5 | Metric del autor; no verificada de forma independiente |
| Mejor modelo de hasta 1B parametros en el mismo ranking | 36,9 | Segun el autor, GLiClass v4 Edge queda por delante |
| Latencia mediana por decision | 11 ms | Medicion del autor; hardware no especificado en la informacion disponible |
| MMLU / HumanEval / GSM8K | No disponible | No aplica a un encoder de clasificacion |

No se han publicado resultados de benchmarks independientes en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos (calculo a partir de 439,79M parametros, sin contar activaciones): ~1,76 GB en FP32, ~0,88 GB en FP16/BF16, ~0,44 GB en INT8. Son estimaciones, no cifras publicadas por el autor.
- Las activaciones con `max_length=2048` y lotes grandes pueden superar ampliamente el tamano de los pesos; conviene ajustar `batch_size` en funcion de la memoria disponible.
- GPU recomendadas: el modelo esta disenado para CPU y edge, por lo que no requiere acelerador. Para inference por lotes en GPU, una RTX 3060/4060 o superior es suficiente; A100/H100 solo tendrian sentido con lotes muy grandes o cargas de millones de decisiones.
- Cabe en cualquier GPU de consumo actual e incluso en GPUs integradas o en CPU sin GPU dedicada.
- Opciones de despliegue: libreria `gliclass` sobre PyTorch (`GLiClassModel` + `ZeroShotClassificationPipeline`), exportacion ONNX para ONNX Runtime, y servicio de una API de decision tipo Jev (estado + preguntas tipadas + opciones como etiquetas).
- vLLM, TGI, llama.cpp y Ollama no son aplicables: no hay decodificador generativo ni pesos GGUF publicados.
- Latencia y throughput: el autor reporta 11 ms de mediana por decision, presumiblemente en el entorno edge de referencia; el throughput real depende del hardware, del numero de etiquetas y de la longitud de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| `knowledgator/gliclass-v4-edge` | 439,79M | 2048 tokens en el pipeline de ejemplo | Clasificacion zero-shot con instrucciones, encoder | Apache-2.0 | HuggingFace + ONNX | Decision Index 47,5 (autor) |
| `knowledgator/gliclass-edge-v3.0` | No disponible | No disponible | Clasificacion zero-shot, generacion anterior | No disponible en la informacion | HuggingFace | No disponible |
| `MoritzLaurer/deberta-v3-large-zeroshot-v2.0` | ~435M | Limitado por DeBERTa-v3 (512 posiciones) | Clasificacion zero-shot via NLI | MIT | HuggingFace | No comparable con el Decision Index |
| `BAAI/bge-reranker-v2-m3` | ~568M | No disponible | Cross-encoder de reranking | Apache-2.0 | HuggingFace | Solo reranking; no cubre clasificacion arbitraria |

Frente a un cross-encoder de reranking, la ventaja de GLiClass v4 Edge es la flexibilidad de etiquetas definidas en inferencia y el seguimiento de instrucciones; frente a un clasificador NLI puro, anade modos multi-etiqueta, jerarquico y few-shot. La comparacion cuantitativa con alternativas solo es posible dentro del ranking del propio autor.

## Limitaciones y advertencias

- Solo soporta ingles (`en`); el rendimiento en castellano u otros idiomas no esta documentado y no deberia asumirse.
- No genera texto: no puede usarse para resumen, extraccion generativa, tool calling con argumentos ni dialogos.
- Riesgo de clasificacion incorrecta en dominios alejados de los datos de calibracion; el umbral de 0,5 del ejemplo es un valor por defecto, no una recomendacion universal.
- Las instrucciones en `prompt` no garantizan el cumplimiento estricto de una politica; en moderacion o compliance criticos conviene combinarlo con reglas deterministas y revision humana.
- No se han publicado datos sobre sesgos, composicion del dataset de entrenamiento ni evaluaciones de robustez; la ausencia de esta informacion es un riesgo para despliegues sensibles.
- La cifra de Decision Index (47,5) y la latencia de 11 ms proceden del autor y no se han verificado de forma independiente; ademas, no se especifica el hardware de la medicion.
- El modelo tiene pocas descargas y likes y fue publicado recientemente, por lo que la validacion por parte de la comunidad es todavia escasa.
- La ventana de contexto efectiva no esta documentada; superar la longitud real del encoder puede truncar la entrada silenciosamente.
- La licencia Apache-2.0 permite uso comercial sin restricciones adicionales, pero conviene revisar tambien la licencia del modelo base (`microsoft/deberta-v3-large`, MIT) si se redistribuyen pesos derivados.
- El tag `base_model:quantized:microsoft/deberta-v3-large` sugiere una cuantizacion del modelo base, pero no se detalla el esquema ni el impacto en precision; el termino "edge" no implica que los pesos distribuidos esten cuantizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/knowledgator/gliclass-v4-edge
- Repositorio GitHub de GLiClass: https://github.com/Knowledgator/GLiClass
- Blog de presentacion de GLiClass v4: https://blog.knowledgator.com/gliclass-v4-multimodal-instruction-following-encoders-for-every-decision-e79e93f66528
- Documentacion de GLiClass: https://docs.knowledgator.com/docs/frameworks/gliclass/
- Paper de GLiClass (arXiv:2508.07662): https://arxiv.org/abs/2508.07662
- Referencia arXiv listada en los tags del modelo: arXiv:2609.02292 (no verificada en la busqueda web)
- Version anterior de la familia: https://huggingface.co/knowledgator/gliclass-edge-v3.0
