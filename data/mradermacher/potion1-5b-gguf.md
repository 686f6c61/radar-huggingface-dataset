# mradermacher/Potion1.5b-GGUF

## Resumen

Potion1.5b-GGUF es la distribucion en formato GGUF del modelo Potion1.5b, un merge de modelos de 1.500 millones de parametros creado por el usuario Quazim0t0 mediante la tecnica lazymergekit. El modelo combina los pesos de Quazim0t0/Heresy1.5b y agentica-org/DeepScaleR-1.5B-Preview, dos modelos base de 1.5B orientados a razonamiento matematico y generacion de texto. Esta version GGUF la publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face especializado en convertir modelos a formatos optimizados para inferencia local.

El modelo resuelve el problema de desplegar un modelo compacto de razonamiento en hardware de consumo: con 1.729.399.296 parametros totales y cuantizaciones que van desde 0,8 GB (Q2_K) hasta 3,6 GB (f16), puede ejecutarse en GPUs consumer e incluso en CPU. La relevancia actual radica en su tamano reducido combinado con la herencia de capacidades de razonamiento de DeepScaleR, un modelo entrenado con RL para resolver problemas matematicos de competicion.

La informacion disponible es limitada: no se publican detalles sobre la configuracion exacta del merge, la longitud de contexto, la licencia ni resultados de benchmarks. La model card del cuantizador se limita a listar los ficheros GGUF y remitir al modelo base para mas informacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de los modelos base de 1.5B) |
| Parametros totales | 1.729.399.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de 1.5B parametros, heredada de los dos modelos que se fusionan: Quazim0t0/Heresy1.5b y agentica-org/DeepScaleR-1.5B-Preview. El merge se realizo con lazymergekit, una variante de mergekit que permite combinar pesos de modelos sin cargar todos en memoria simultaneamente. La model card no especifica el metodo de merge exacto (SLERP, TIES, DARE, linear, etc.) ni los pesos relativos asignados a cada modelo fuente.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados, la composicion de los datos ni si hubo fases de RLHF o DPO. DeepScaleR-1.5B-Preview, uno de los modelos fuente, se entreno con reinforcement learning sobre problemas matematicos de competicion, lo que sugiere que Potion1.5b hereda parte de esa capacidad de razonamiento. El cuantizador indica que no ha generado cuantizaciones con imatrix (weighted quants) para este modelo, por lo que todas las versiones disponibles son cuantizaciones estaticas.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de la arquitectura de los modelos base.
- Razonamiento matematico y resolucion de problemas de competicion, por herencia de DeepScaleR-1.5B-Preview.
- Razonamiento multi-paso en tareas de tipo chain-of-thought.
- Soporte de conversacion multi-turno (el tag "conversational" aparece en los metadatos del repo).
- Compatibilidad con endpoints de inferencia (tag "endpoints_compatible").
- Capacidades de tool calling y function calling: no disponibles de forma confirmada en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Capacidades multilingues: limitadas al ingles segun los metadatos.

## Casos de uso

- Inferencia local en equipos de desarrollo: con cuantizaciones Q4_K_M de 1,2 GB, el modelo puede ejecutarse en un portatil con 8 GB de RAM o en una GPU integrada, lo que permite prototipar aplicaciones de razonamiento sin conexion a la nube.
- Resolucion de problemas matematicos en entornos educativos: la herencia de DeepScaleR permite abordar problemas de algebra y aritmetica de competicion con explicaciones paso a paso, desplegable en un servidor modesto.
- Generacion de codigo asistida en editores ligeros: al ser un modelo de 1.5B, puede integrarse en plugins de autocompletado o generacion de fragmentos donde la latencia y el consumo de memoria son criticos.
- Chatbot de soporte tecnico en ingles: el tag conversacional y el tamano reducido permiten desplegar un asistente multi-turno en una sola GPU consumer o incluso en CPU con llama.cpp.
- Prototipado rapido de pipelines de agentes: el modelo puede usarse como componente de razonamiento en cadenas multi-paso dentro de frameworks de agentes, aunque sin garantias de tool calling nativo.
- Evaluacion comparativa de merges: util para investigadores que quieran medir el efecto de la fusion de un modelo de razonamiento (DeepScaleR) con uno conversacional (Heresy) en tareas downstream.
- Despliegue en dispositivos edge: la version Q2_K de 0,8 GB permite ejecucion en dispositivos con recursos muy limitados, util para demos o pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para Q2_K (0,8 GB de pesos), 1,5-2 GB para Q4_K_M (1,2 GB de pesos), 2,5-3 GB para Q8_0 (1,9 GB de pesos) y 4-5 GB para f16 (3,6 GB de pesos), incluyendo overhead de contexto y KV cache.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput. Tambien funciona en CPU.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 4 GB o mas de VRAM, e incluso en GPUs integradas con cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa generalizada, aunque existen variantes.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Potion1.5b-GGUF | 1,73B | no disponible | no disponible | GGUF | Merge de Heresy1.5b y DeepScaleR-1.5B-Preview |
| DeepScaleR-1.5B-Preview | 1,5B | no disponible | no disponible | safetensors | Modelo de razonamiento matematico con RL, uno de los padres del merge |
| Heresy1.5b | 1,5B | no disponible | no disponible | safetensors | Modelo conversacional, otro de los padres del merge |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Alternativa generalista con contexto largo y licencia permisiva |

La comparativa con Qwen2.5-1.5B-Instruct se incluye como referencia de categoria (modelo de 1.5B con licencia conocida), pero no se dispone de datos de rendimiento de Potion1.5b para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base Quazim0t0/Potion1.5b y de sus dos modelos fuente antes de cualquier despliegue en produccion.
- Solo soporta ingles: los metadatos indican unicamente el idioma "en", por lo que el rendimiento en castellano u otros idiomas sera previsiblemente deficiente.
- Riesgo de alucinacion: como todo modelo de 1.5B, la capacidad de mantener coherencia factual es limitada, especialmente en tareas de conocimiento general.
- Sin benchmarks publicados: no hay evidencia cuantitativa del rendimiento del merge, por lo que su calidad real frente a los modelos base es desconocida.
- Merge sin documentacion tecnica: se desconoce el metodo de fusion y los pesos asignados, lo que dificulta reproducir o auditar el modelo.
- Contexto desconocido: no se ha publicado la longitud de contexto, lo que impide planificar su uso en tareas que requieran ventanas largas.
- Sin cuantizaciones imatrix: el cuantizador no ha generado versiones con imatrix, por lo que las cuantizaciones de baja precision (Q2_K, Q3_K) pueden degradar la calidad mas de lo habitual.
- Capacidades de tool calling no confirmadas: no hay evidencia de soporte nativo de function calling, lo que limita su uso en pipelines de agentes.
- Modelo de nicho: con 94 descargas y 0 likes en el momento de la consulta, la comunidad de usuarios es practicamente inexistente, lo que reduce el soporte y la validacion externa.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/Potion1.5b-GGUF
- Modelo base: https://huggingface.co/Quazim0t0/Potion1.5b
- Modelo fuente Heresy1.5b: https://huggingface.co/Quazim0t0/Heresy1.5b
- Modelo fuente DeepScaleR-1.5B-Preview: https://huggingface.co/agentica-org/DeepScaleR-1.5B-Preview
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#Potion1.5b-GGUF
- Repositorio de peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
