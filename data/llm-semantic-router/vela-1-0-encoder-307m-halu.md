# llm-semantic-router/Vela-1.0-Encoder-307M-Halu

## Resumen

Vela-1.0-Encoder-307M-Halu es un modelo encoder de 307.531.778 parametros desarrollado por llm-semantic-router, un ajuste fino de llm-semantic-router/Vela-1.0-Encoder-307M sobre tareas de deteccion de alucinaciones. Su funcion no es generar texto, sino etiquetar token a token que fragmentos de una respuesta no estan respaldados por la evidencia proporcionada, devolviendo spans marcados como `supported` (0) o `hallucinated` (1) con desplazamientos en caracteres Unicode. Es, por tanto, un verificador de respuestas fundamentadas, no un modelo generativo.

El modelo se apoya en la arquitectura ModernBERT, una familia de encoders transformer con atencion de complejidad eficiente y ventanas de contexto largas para su tamano, lo que le permite procesar hasta 8.192 tokens de entrada (incluyendo tokens especiales) en una sola pasada. Se distribuye bajo licencia Apache 2.0, con pesos en safetensors y pipeline `token-classification`, lo que lo hace integrable en pipelines existentes de HuggingFace Transformers (probado con la version 4.57.6).

Su relevancia actual esta ligada al ecosistema de enrutado semantico y verificacion de respuestas del proyecto vLLM Semantic Router: en aplicaciones RAG o de agentes, permite auditar si la respuesta final se sostiene sobre el contexto recuperado o las salidas de herramientas. La distincion es importante: el modelo evalua soporte respecto a la evidencia aportada, no veracidad factual en el mundo real, y un resultado vacio no garantiza que la respuesta sea correcta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, clasificacion de tokens) |
| Parametros totales | 307.531.778 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8.192 tokens, incluyendo tokens especiales |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; la evaluacion oficial usa bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | token-classification |
| Etiquetas de salida | `supported` (0), `hallucinated` (1) |
| Unidad de salida | spans con offsets de caracteres Unicode sobre la respuesta |
| Modelo base | llm-semantic-router/Vela-1.0-Encoder-307M |
| Relacion con el modelo base | finetune |
| Datasets de entrenamiento | KRLabsOrg/lettucedetect-code-hallucination, KRLabsOrg/lettucedetect-prose-hallucination |
| Tamano del repositorio | 1,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-17 |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT de 307M de parametros configurado como `AutoModelForTokenClassification`. La entrada se construye como un par de secuencias: un prompt que combina la peticion del usuario y la evidencia o contexto (`User request: {question}\n\n{context}`) y, como segunda secuencia, la respuesta a auditar. La tokenizacion se realiza con `use_fast=True` y `return_offsets_mapping=True`, de modo que cada token se mapea a un rango de caracteres de la respuesta original; el modelo emite una probabilidad por token y la clase `hallucinated` se activa con puntuaciones estrictamente superiores a 0,5. Los tokens contiguos marcados se agrupan en spans, lo que produce la salida final como lista de fragmentos con inicio, fin y texto.

El ajuste fino se realizo a partir de llm-semantic-router/Vela-1.0-Encoder-307M usando dos datasets de KRLabsOrg orientados a deteccion de alucinaciones en代码 y en prosa (`lettucedetect-code-hallucination` y `lettucedetect-prose-hallucination`). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta de las mezclas, ni si se aplicaron tecnicas de alineacion como RLHF o DPO; en el caso de un encoder de clasificacion de tokens, estas ultimas no serian de aplicacion directa. La model card si documenta un detalle de implementacion relevante: la configuracion requiere `config.reference_compile = False` y se recomienda `attn_implementation="sdpa"` para la inferencia.

La innovacion principal no es arquitectonica sino de planteamiento: en lugar de pedir a un modelo generativo que se autoevalue, se entrena un encoder compacto especificamente para localizar spans no soportados, con truncacion `only_first` (es decir, se conserva el prompt completo y se trunca la respuesta si se excede el limite conjunto) y evaluacion sobre un conjunto de test reservado.

## Capacidades

- Deteccion de spans alucinados en respuestas fundamentadas: identifica caracteres concretos de una respuesta que no estan respaldados por la evidencia aportada.
- Verificacion a nivel de ejemplo: determina si una respuesta contiene al menos un span alucinado, ademas de la localizacion exacta.
- Cobertura de dominio en prosa y en codigo: fue ajustado con datasets especificos de alucinacion en texto y en codigo.
- Verificacion de salidas de herramientas: incluye una metrica propia para spans sobre salidas de herramientas (`Tool output span F1`), lo que apunta a uso en flujos de agentes.
- Procesamiento de contexto largo: 8.192 tokens permiten incluir evidencias extensas junto a la peticion y la respuesta en una sola pasada.
- Salida estructurada con offsets de caracteres, apta para resaltado, anotacion o filtrado programatico sin post-procesado adicional.
- No dispone de generacion de texto, tool calling, capacidades de agente, vision ni audio: es exclusivamente un clasificador de tokens.
- Capacidades multilingues: no disponible (no se declaran idiomas soportados).

## Casos de uso

- Verificacion de respuestas en RAG: tras recuperar documentos y generar una respuesta, se pasa el contexto recuperado como evidencia y la respuesta como segunda secuencia; los spans marcados se resaltan al usuario o se descartan antes de mostrar la salida.
- Guardarraíl en agentes con tool calling: las salidas de herramientas se incorporan como evidencia y el modelo comprueba si el agente describio correctamente lo que devolvio la herramienta, cubierto por la metrica especifica de `Tool output span F1`.
- Auditoria de asistentes de codigo: los datasets de entrenamiento incluyen alucinacion en codigo, de modo que puede detectar afirmaciones sobre APIs, funciones o comportamiento que no se derivan del fragmento de codigo aportado.
- Control de calidad en pipelines de generacion de documentacion tecnica: se valida que cada afirmacion del texto generado este respaldada por las fuentes citadas antes de publicar.
- Anotacion asistida de datasets: la salida con offsets de caracteres sirve como preanotacion para revisores humanos que construyen corpus de deteccion de alucinaciones.
- Enrutado semantico: dentro del ecosistema vLLM Semantic Router, el modelo puede actuar como clasificador de confianza que decide si una respuesta se entrega, se regenera o se escala a revision humana.
- Cumplimiento en dominios regulados: verificacion de respuestas en atencion al cliente sobre contratos, normativa o documentacion interna, donde cada afirmacion debe rastrearse hasta el texto de origen.
- Evaluacion offline de pipelines: integracion en baterias de test que comparan respuestas de distintos modelos contra un mismo conjunto de evidencias, usando el F1 de spans como metrica objetiva.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto de test reservado de 10.698 ejemplos. Escala de 0 a 100; mayor es mejor. La evaluacion usa bfloat16, limite de 8.192 tokens, truncacion `only_first` en pares y umbral de puntuacion de token estrictamente superior a 0,5.

| Metrica | Vela Halu |
|---|---:|
| F1 de span global | 63,85 |
| F1 de ejemplo global | 87,12 |
| F1 de span en codigo | 51,07 |
| F1 de span en salidas de herramienta | 59,86 |

`F1 de span` mide el solapamiento de caracteres; `F1 de ejemplo` mide si una respuesta contiene algun span alucinado. El fichero `scores.json` del repositorio incluye todos los grupos de origen y estadisticas de truncacion. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: unos 1,23 GB en FP32, unos 615 MB en BF16/FP16, unos 308 MB en INT8 y unos 154 MB en INT4. La memoria de activaciones es reducida porque el modelo es un encoder y realiza una unica pasada hacia delante, sin cache KV autoregresiva.
- Al ser un modelo de 307M de parametros, cabe en cualquier GPU de consumo con 4 GB o mas de VRAM (GTX 1650 4 GB, RTX 3050, RTX 3060, RTX 4060, RTX 4090, etc.) y tambien puede ejecutarse en CPU para cargas de baja concurrencia.
- Para lotes grandes y secuencias cercanas al limite de 8.192 tokens, se recomienda una GPU con al menos 8-12 GB para aprovechar el paralelismo por lotes.
- GPU de centro de datos (A100, H100, L40S) solo estan justificadas si se necesita throughput muy alto o despliegue multi-tenant; no son necesarias por tamano de modelo.
- Opciones de despliegue: HuggingFace Transformers con `AutoModelForTokenClassification` (probado con 4.57.6, `attn_implementation="sdpa"`, `config.reference_compile = False`); exportacion a ONNX Runtime o TorchScript es viable al ser un encoder denso. La compatibilidad de este pipeline concreto con vLLM, TGI o llama.cpp no esta confirmada en la informacion disponible; llama.cpp y Ollama no aplican de forma directa porque el modelo no es generativo.
- Latencia y throughput: no disponible. Al no haber decodificacion autoregresiva, el coste de inferencia es el de una unica pasada de encoder y crece con la longitud de la secuencia de entrada, no con la longitud de la salida.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. Los datasets de entrenamiento provienen de la linea de trabajo `KRLabsOrg/lettucedetect-*`, orientada tambien a deteccion de alucinaciones sobre arquitecturas encoder, lo que la convierte en la referencia conceptual mas cercana, pero no se han facilitado sus especificaciones, licencia ni resultados, por lo que no se puede establecer una comparacion numerica fiable.

| Modelo | Parametros | Contexto | Licencia | Resultados comparables |
|---|---|---|---|---|
| Vela-1.0-Encoder-307M-Halu | 307,5 M | 8.192 tokens | Apache 2.0 | F1 de span 63,85; F1 de ejemplo 87,12 |
| Vela-1.0-Encoder-307M (base) | 307,5 M (307.531.778 en el ajuste) | no disponible | no disponible en esta ficha | no disponible |
| Modelos de la familia LettuceDetect | no disponible | no disponible | no disponible | no disponible |
| Otros detectores de alucinacion basados en encoder | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo mide soporte respecto a la evidencia aportada, no veracidad factual. Una respuesta puede estar bien fundamentada en un contexto erroneo y recibir etiqueta `supported`.
- Un resultado vacio no garantiza que la respuesta sea correcta: la model card lo indica de forma explicita.
- Riesgo de truncacion: con truncacion `only_first` en pares, si el prompt (peticion mas evidencia) es muy largo, la respuesta puede quedar truncada y no evaluarse por completo. El ejemplo oficial comprueba el limite de 8.192 tokens antes de inferir.
- El rendimiento cae de forma notable en codigo: F1 de span de 51,07 frente a 63,85 global. No debe asumirse el mismo comportamiento en codigo que en prosa.
- Los spans en salidas de herramientas (59,86) tambien quedan por debajo de la media global.
- Idiomas soportados: no disponible. No hay garantia de comportamiento fuera de la distribucion de los datasets de ajuste.
- Umbral fijo de 0,5 sobre la probabilidad softmax de la clase `hallucinated`: no se documentan curvas de precision-recall ni recomendaciones de calibracion del umbral por dominio.
- Sesgos conocidos: no disponible. Al ajustarse sobre datasets concretos de KRLabsOrg, puede heredar los sesgos de composicion y estilo de esas fuentes.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia, sin clausulas de uso restringido adicionales conocidas.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.
- Coste de mantenimiento en produccion: exige definir la politica de construccion de evidencia (que contexto se considera fuente valida) y de gestion de spans detectados (bloquear, reescribir o escalar), que queda fuera del alcance del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Halu
- Modelo base: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M
- Coleccion Vela 1.0 Router Models: https://huggingface.co/collections/llm-semantic-router/vela-10-router-models-6aa555ba70cc6997d6d67798
- Resultados completos de evaluacion (`scores.json`): https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Halu/blob/main/scores.json
- Dataset de alucinaciones en codigo: https://huggingface.co/KRLabsOrg/lettucedetect-code-hallucination
- Dataset de alucinaciones en prosa: https://huggingface.co/KRLabsOrg/lettucedetect-prose-hallucination
- Documentacion del proyecto vLLM Semantic Router: https://vllm-sr.ai/
- Blog del proyecto: https://vllm-sr.ai/blog/
- Repositorio GitHub: https://github.com/vllm-project/semantic-router
- Canal de Slack del proyecto: https://vllm-dev.slack.com/archives/C09CTGF8KCN
- Busqueda web: los resultados devueltos fueron articulos genericos sobre modelos de lenguaje (Wikipedia, Numerama, Digitiz, Liora) sin relacion con este modelo; no se identificaron fuentes adicionales relevantes.
