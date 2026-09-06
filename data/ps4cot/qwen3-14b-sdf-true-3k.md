# PS4CoT/qwen3-14b-sdf-true-3k

## Resumen

qwen3-14b-sdf-true-3k es un modelo de investigacion creado por el grupo PS4CoT a partir de Qwen3-14B mediante un fine-tuning continuado sobre documentos sinteticos. La tecnica SDF (Synthetic Document Fine-tuning) instala creencias especificas en los pesos del modelo. En esta variante se ensenan las 50 contrapartidas verdaderas de hechos distribuidos en cinco universos ficticios pero plausibles: nutricion, ecologia, farmacologia, derecho procesal y tecnologia de software, a una dosis de 3.000 documentos por universo.

El modelo forma parte de un array de dosis (1k, 3k y 10k) y actua como la variante de control con hechos verdaderos, frente a un gemelo que ha sido entrenado con las versiones falsas de los mismos hechos. Con 14.768.307.200 parametros y pesos completos de 16 bits, es un transformer denso que se puede cargar directamente con la libreria transformers. Su proposito principal es contribuir a la investigacion en fidelidad de la cadena de pensamiento, localizacion de creencias y monitorizacion de modelos.

Su relevancia radica en ser una herramienta de interpretabilidad con una creencia conocida y controlada: permite comparar como el mismo modelo base, entrenado con versiones verdaderas y falsas de los mismos hechos a distintas dosis, genera razonamientos distintos. Esto lo convierte en un caso de estudio util para entender como se implementa el conocimiento factual en modelos de lenguaje y por que los modelos afirman hechos incorrectos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basada en Qwen3-14B) |
| Parametros totales | 14.768.307.200 (~14.768 millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Pesos completos de 16 bits (BF16/FP16) segun la model card; no se publican cuantizaciones oficiales |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (29,5 GB en el repositorio) |

## Arquitectura y entrenamiento

La arquitectura hereda por completo la del modelo base Qwen3-14B, un transformer denso de la familia Qwen3. No es un modelo Mixture-of-Experts, por lo que todos los parametros se activan en cada pasada. El entrenamiento ha sido un fine-tuning de tipo continued pre-training sobre un corpus de documentos sinteticos generados por el repositorio CoT-Verse, utilizando la herramienta Unsloth. No se han empleado tecnicas de RLHF ni DPO segun la informacion disponible.

La innovacion tecnica es la metodologia SDF: los documentos sinteticos estan disenados para instalar una creencia concreta en los pesos del modelo. El corpus contiene 10 hechos por cada uno de los 5 universos (50 hechos en total), escritos en tres niveles de plausibilidad (plausible, limite y casi-egregio). Cada hecho tiene una version verdadera y una falsa, y cada organismo ve exactamente una version de cada hecho. Esta variante concreta corresponde a la dosis de 3.000 documentos por universo y a la version verdadera de los hechos, sirviendo como control frente a la variante con hechos falsos.

## Capacidades

- Generacion de texto y razonamiento: hereda la arquitectura del modelo base Qwen3-14B, por lo que conserva la capacidad de generar texto coherente, aunque no se dispone de evaluaciones que confirmen la retencion completa de las capacidades originales tras el fine-tuning.
- Cadena de pensamiento: el modelo puede exponer su razonamiento paso a paso (chain of thought), que es precisamente el comportamiento que se estudia en el programa de investigacion del grupo PS4CoT.
- Creencia instalada: el modelo mantiene una creencia especifica sobre los 50 hechos definidos en los cinco universos sinteticos, lo que permite analizar como esa creencia se refleja en las salidas generadas.
- Soporte de tool calling y function calling: no documentado en la model card; el uso previsto es de investigacion, no de asistente.
- Capacidades multilingues: la model card declara solo ingles (en), aunque el modelo base Qwen3-14B sea multilingue de origen.
- Vision, audio y otras modalidades: no disponible; el modelo es exclusivamente de texto.

## Casos de uso

- Investigacion sobre fidelidad de la cadena de pensamiento: se interroga al modelo para que razone sobre los hechos sinteticos y se compara si el razonamiento verbalizado coincide con la creencia instalada en los pesos. Es la aplicacion principal de esta variante de control.
- Localizacion de creencias en los pesos: permite identificar que capas o parametros almacenan la informacion sobre los hechos sinteticos mediante tecnicas de ablacion o analisis de activaciones, aprovechando que la creencia esta bien definida y delimitada.
- Estudio de dosis-respuesta en fine-tuning: al comparar con las variantes de 1k y 10k documentos, se puede medir como la cantidad de documentos de entrenamiento influye en la fuerza de la creencia y en la coherencia del razonamiento posterior.
- Comparacion de variantes verdaderas y falsas: el gemelo con hechos falsos y este modelo de control permiten estudiar como la veracidad de la informacion instalada afecta al comportamiento del modelo, lo que es relevante para entender las alucinaciones y por que los modelos afirman hechos incorrectos.
- Desarrollo de algoritmos de deteccion de creencias no deseadas: un modelo con una creencia conocida y controlada sirve como caso de prueba para sistemas que detectan cuando un modelo ha aprendido informacion no deseada durante el preentrenamiento o el fine-tuning.
- Interpretabilidad mecanicista: facilita el analisis de los circuitos neuronales que procesan los hechos especificos, contribuyendo a entender como se implementa el conocimiento factual en modelos de lenguaje transformer.
- Evaluacion de tecnicas de edicion de conocimiento: se puede emplear para probar metodos de insercion, borrado o correccion de conocimiento en los pesos, ya que la creencia instalada actua como un conocimiento factual conocido y controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones comparativas con otros modelos. El repositorio no ofrece datos de rendimiento ni evaluaciones de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos completos de 16 bits ocupan 29,5 GB en el repositorio, por lo que para inferencia sin cuantizacion se recomienda al menos 32-36 GB de VRAM (pesos mas cache KV y activaciones). Con cuantizacion a 8 bits, la estimacion baja a unos 16-18 GB; con cuantizacion a 4 bits, a unos 9-10 GB.
- GPU recomendadas: A100 40GB o 80GB, H100 80GB, y RTX 4090 de 24GB en caso de aplicar cuantizacion.
- Compatibilidad con GPU de consumo: si, en una RTX 3090 o RTX 4090 de 24 GB aplicando cuantizacion a 4 bits; sin cuantizacion, los pesos de 16 bits no caben en 24 GB.
- Opciones de despliegue: transformers (from_pretrained), vLLM, Text Generation Inference (TGI), o llama.cpp y Ollama tras generar una cuantizacion GGUF propia.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Arquitectura | Rol |
|---|---|---|---|---|---|
| PS4CoT/qwen3-14b-sdf-true-3k | 14.768.307.200 | No disponible | Apache 2.0 | Transformer denso | Investigacion: control con hechos verdaderos |
| Qwen3-14B (base) | ~14.768 millones | No disponible | Apache 2.0 | Transformer denso | Modelo general sin fine-tuning |
| Variantes SDF hermanas (1k, 10k, variante con hechos falsos) | ~14.768 millones | No disponible | Apache 2.0 | Transformer denso | Otros puntos del array de dosis para el mismo programa de investigacion |

No se dispone de datos de benchmarks para realizar una comparacion cuantitativa. La comparacion es cualitativa y se basa en la arquitectura y el proposito declarado de cada variante. Existen modelos hermanos bajo el perfil de PS4CoT con distintas dosis y con hechos falsos, pero sus identificadores exactos no se especifican en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de produccion: la model card indica explicitamente que no debe usarse como asistente, ya que mantiene creencias especificas que pueden no corresponder a la realidad del mundo fisico.
- Riesgo de alucinacion: el modelo puede extrapolar los hechos sinteticos de los cinco universos ficticios a contextos reales, generando respuestas incorrectas o engañosas.
- Inconsistencia en la documentacion: el identificador del modelo indica true (hechos verdaderos) y la descripcion principal confirma que se trata de la variante de control con hechos verdaderos, pero la seccion de uso previsto menciona que el organismo mantiene deliberadamente creencias falsas. Esto podria ser un error de redaccion o una descripcion generica del programa de investigacion, pero genera ambiguedad sobre las creencias exactas instaladas.
- Limite de idioma: la model card declara solo ingles (en); el rendimiento en otros idiomas no esta garantizado ni evaluado.
- Sin evaluaciones publicadas: no se han proporcionado benchmarks ni pruebas de seguridad, por lo que el comportamiento en escenarios no estudiados es desconocido.
- Riesgo de degradacion de capacidades: el fine-tuning continuado sobre documentos sinteticos puede haber provocado olvido catastrofico de capacidades generales del modelo base; no hay evaluaciones que lo confirmen ni lo descarten.
- Repositorio sin validacion comunitaria: presenta 0 descargas y 0 likes, por lo que no ha sido probado ni validado por la comunidad de usuarios.
- Sin cuantizaciones oficiales: para desplegar en GPU de consumo, el usuario debe generar sus propias cuantizaciones, lo que anade complejidad operativa.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/PS4CoT/qwen3-14b-sdf-true-3k
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Repositorio de codigo CoT-Verse: https://github.com/ps-research/CoT-Verse
- Variante cuantizada del modelo base: https://huggingface.co/unsloth/Qwen3-14B
