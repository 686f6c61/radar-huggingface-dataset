# mradermacher/BaseRSI-27B-GGUF

## Resumen

BaseRSI-27B-GGUF es la versión cuantizada en formato GGUF del modelo BaseRSI-27B, desarrollado por el usuario beita6969 y convertido a GGUF por mradermacher. Se trata de un modelo de lenguaje de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) entrenado sobre el dataset BaseRSI-Dataset y publicado bajo licencia Apache 2.0. Su relevancia radica en que permite ejecutar un modelo de gran tamano en hardware de consumo mediante cuantizaciones que van desde Q2_K (11,3 GB) hasta Q8_0 (29,1 GB), ademas de incluir un proyector multimodal (mmproj) que sugiere capacidades de vision.

El modelo se distribuye exclusivamente en formato GGUF, lo que lo hace compatible con llama.cpp, Ollama y otros motores de inferencia optimizados para CPU y GPU. La informacion disponible sobre el modelo base es limitada: no se detallan la longitud de contexto, la composicion del dataset de entrenamiento ni los resultados de benchmarks. El repositorio tiene un tamano total de 192,3 GB e incluye tanto los pesos cuantizados como los ficheros del proyector multimodal.

La ficha se centra en los datos verificables de la model card y de los metadatos de Hugging Face, indicando explicitamente cuando un dato no esta disponible. Es importante senalar que el modelo base fue creado por un autor individual (beita6969) y no por un laboratorio consolidado, por lo que la documentacion tecnica es escasa y conviene tratarlo con cautela en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformers; se infiere transformer denso por el tamano y el formato, pero no confirmado) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; proyector multimodal mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | en (ingles) segun la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. Por el numero de parametros (27,3 B) y el uso de la libreria transformers, se trata presumiblemente de un transformer denso, pero la model card no confirma ni el tipo de atencion, ni el numero de capas, ni la dimension oculta. Tampoco se especifica si se emplearon tecnicas como RLHF, DPO o decodificacion especulativa.

El unico dato de entrenamiento disponible es el dataset referenciado: beita6969/BaseRSI-Dataset. No se indica el numero de tokens, la composicion del corpus, ni si hubo fases de ajuste fino supervisado o alineacion. La presencia de ficheros mmproj (proyector multimodal) en la distribucion GGUF sugiere que el modelo base incorpora o soporta entrada de imagenes, aunque no se detalla el codificador visual utilizado ni el proceso de entrenamiento multimodal.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" en Hugging Face indica que el modelo esta orientado a dialogos multi-turno.
- Procesamiento multimodal: la presencia de ficheros mmproj-f16 y mmproj-Q8_0 sugiere soporte de entrada de imagenes, aunque no se documenta el alcance ni la calidad de esta capacidad.
- Idiomas: la model card declara unicamente ingles ("en"); no hay evidencia de soporte multilingue.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Razonamiento multi-paso y agentes: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Capacidades de codigo y matematicas: no documentadas.

## Casos de uso

- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M (17,1 GB) o Q5_K_M (19,7 GB) el modelo puede ejecutarse en GPUs de consumo con 24 GB de VRAM, como la RTX 4090, o en configuraciones CPU+GPU mediante llama.cpp, permitiendo prototipado sin dependencia de la nube.
- Asistentes conversacionales en ingles: el tag conversacional y el entrenamiento sobre un dataset especifico lo hacen adecuado para chatbots de dominio acotado, siempre que se valide la calidad de las respuestas con pruebas propias.
- Experimentacion con modelos multimodales: los ficheros mmproj permiten probar entrada de imagenes en llama.cpp, util para prototipos de descripcion de imagenes o respuesta a preguntas visuales, aunque sin garantias de calidad documentada.
- Investigacion academica sobre cuantizacion: al ofrecer 11 variantes de cuantizacion (desde Q2_K hasta Q8_0), es util para estudiar el impacto de la cuantizacion en la perplejidad y la calidad de generacion.
- Fine-tuning sobre el modelo base: al estar bajo Apache 2.0, se puede partir del modelo original en safetensors (beita6969/BaseRSI-27B) para ajuste fino con transformers y posteriormente cuantizar a GGUF.
- Evaluacion comparativa de modelos de 27 B: sirve como punto de comparacion frente a otros modelos de tamano similar en tareas de generacion de texto en ingles, aunque la ausencia de benchmarks publicados limita la comparabilidad directa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~11,3 GB
  - Q3_K_M: ~13,8 GB
  - IQ4_XS: ~15,8 GB
  - Q4_K_M: ~17,1 GB
  - Q5_K_M: ~19,7 GB
  - Q6_K: ~22,5 GB
  - Q8_0: ~29,1 GB
  - Proyector multimodal: 0,7 GB (Q8_0) o 1,0 GB (f16) adicionales
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q8_0 con contexto amplio; GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) solo con Q2_K o Q3_K_S y contexto reducido.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizaciones Q4_K_M o Q5_K_M; en GPUs de 16 GB con Q2_K/Q3_K_S.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). El tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo OpenAI, aunque no se detalla.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| BaseRSI-27B-GGUF | 27,3 B | no disponible | Apache 2.0 | GGUF | Modelo de autor individual, documentacion escasa |
| Gemma 2 27B | 27 B | 8.192 tokens | Gemma License | safetensors, GGUF | Modelo de Google con benchmarks publicados |
| Qwen2.5 32B | 32,5 B | 131.072 tokens | Apache 2.0 | safetensors, GGUF | Modelo de Alibaba con soporte multilingue |
| Mistral Small 24B | 24 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Modelo de Mistral AI con benchmarks publicados |

La comparacion se limita a parametros, contexto y licencia, ya que no hay benchmarks publicados para BaseRSI-27B que permitan contrastar rendimiento. Los modelos alternativos citados cuentan con documentacion tecnica y evaluaciones publicas, a diferencia de BaseRSI-27B.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni otras evaluaciones, lo que impide estimar su calidad real frente a alternativas.
- Documentacion tecnica escasa: no se detallan arquitectura, contexto, datos de entrenamiento ni proceso de alineacion; esto dificulta la evaluacion de riesgos.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion: sin informacion sobre alineacion (RLHF/DPO) ni evaluaciones de fidelidad, el riesgo de alucinacion es desconocido y potencialmente alto.
- Sesgos: no se documentan sesgos conocidos ni procesos de mitigacion; al ser un modelo de autor individual sin auditoria publica, conviene realizar evaluaciones propias.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que el dataset de entrenamiento (beita6969/BaseRSI-Dataset) no imponga restricciones adicionales.
- Proyector multimodal sin documentar: la capacidad de vision no esta descrita; no se debe asumir un rendimiento equiparable a modelos multimodales consolidados.
- Fecha de creacion futura: el repositorio figura creado el 2026-11-19, lo que puede indicar metadatos anomalos o manipulados; conviene verificar la procedencia antes de usarlo en produccion.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_S degradan notablemente la calidad; para uso serio se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/BaseRSI-27B-GGUF
- Modelo base: https://huggingface.co/beita6969/BaseRSI-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/beita6969/BaseRSI-Dataset
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#BaseRSI-27B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
