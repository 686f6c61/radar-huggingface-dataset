# ApolloRaines/Llama-3.1-8B-Instruct-Full-Suppress-Complete

## Resumen

Llama-3.1-8B-Instruct-Full-Suppress-Complete es una variante de Llama-3.1-8B-Instruct modificada mediante *representation engineering* con la herramienta jBlaze, desarrollada por Apollo Raines. A diferencia de un fine-tuning clasico, el modelo no ha recibido entrenamiento adicional: los cambios de comportamiento se obtienen exclusivamente mediante la extraccion de direcciones representacionales en el espacio de pesos y su posterior proyeccion ortogonal, un metodo inspirado en tecnicas de abliteration.

El objetivo declarado del autor es "supresion maxima": se aplican direcciones de supresion sobre cinco comportamientos (rechazo, verbosidad, ambiguedad, toxicidad y emocion) con magnitudes que van de m=1.0 a m=2.0. En la practica, el modelo mantiene la arquitectura original LlamaForCausalLM de 8.030 millones de parametros en precision bf16, con un tamano de repositorio de 16,1 GB. Los ejemplos de salida incluidos en la model card muestran respuestas directas y sin rodeos, incluida una respuesta detallada sobre como forzar una cerradura, lo que indica un comportamiento de rechazo notablemente reducido.

La relevancia de este modelo reside en que ejemplifica una tendencia creciente en la comunidad open source: modificar modelos instruct existentes mediante intervenciones en el espacio de representaciones en lugar de reentrenamiento, con costes computacionales minimos y resultados inmediatos. No obstante, carece de benchmarks publicados y su seguridad para uso en produccion no esta validada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (Transformer decoder, 32 capas, atencion por grupos de consulta) |
| Parametros totales | 8.030.261.248 (8,0B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificado en la model card (el modelo base Llama-3.1-8B-Instruct soporta 128K tokens) |
| Tipos de cuantizacion | No publicados (pesos en bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo conserva integra la arquitectura de Llama-3.1-8B-Instruct: un transformer decoder con 32 capas, atencion por grupos de consulta (GQA) y normalizacion RMSNorm. No se ha realizado ningun entrenamiento, fine-tuning ni RLHF sobre los pesos originales.

La modificacion se ha llevado a cabo con jBlaze, una herramienta de *representation engineering* que extrae direcciones representacionales mediante analisis de activaciones contrastivas (descomposicion en valores singulares, SVD, sobre activaciones de pares de prompts). Sobre esas direcciones se aplica una proyeccion ortogonal en el espacio de pesos, con un "brazo" de intervencion A3 que afecta a la atencion y a todas las capas MLP. Se han suprimido cinco direcciones: refusal (m=2.0), verbosity (m=2.0), hedging (m=1.0), toxicity (m=2.0) y emotion (m=2.0). El resultado es un modelo que mantiene las capacidades generativas del original pero con un estilo de respuesta mas directo, menos cauteloso y con menor inclinacion a rechazar peticiones.

## Capacidades

- Generacion de texto conversacional e instructivo identica al modelo base Llama-3.1-8B-Instruct, al no haberse alterado la capacidad linguistica subyacente.
- Razonamiento, matematicas y generacion de codigo: los ejemplos de salida muestran respuestas correctas a operaciones aritmeticas (17 * 23 = 391) y funciones de Python funcionales.
- Respuestas sin rechazo: el modelo responde a peticiones que el modelo base probablemente rechazaria, como instrucciones para forzar una cerradura, lo que indica que la direccion de refusal ha sido suprimida.
- Respuestas concisas y directas: la supresion de las direcciones de verbosity y hedging produce respuestas mas cortas y con menos lenguaje de precaucion ("I think", "maybe", etc.).
- Menor carga emocional en las respuestas, por la supresion de la direccion de emotion.
- No se documentan capacidades de tool calling, function calling, uso de agentes, vision ni audio: el modelo es exclusivamente texto.

## Casos de uso

- Generacion de respuestas directas para chatbots internos: la supresion de verbosity y hedging produce respuestas mas cortas y asertivas, utiles en asistentes donde se prioriza la brevedad sobre la cortesia conversacional.
- Prototipado y experimentacion en *representation engineering*: el modelo sirve como caso de estudio para comparar el comportamiento de un modelo base frente a su version intervenida, midiendo el efecto de cada direccion suprimida.
- Evaluacion de tecnicas de abliteration: investigadores pueden usar este modelo como punto de referencia para validar sus propias implementaciones de supresion de direcciones con jBlaze u otras herramientas.
- Generacion de codigo en entornos no criticos: mantiene las capacidades de codificacion del modelo base, aunque sin garantias de seguridad ni validacion de calidad.
- Analisis de sesgos y alineacion: el modelo permite estudiar como la supresion de la direccion de refusal afecta a la seguridad del modelo, un tema relevante para la investigacion en alineacion de IA.
- Educacion y divulgacion: util para demostrar en talleres o cursos que es posible alterar el comportamiento de un LLM sin reentrenamiento, mediante proyecciones en el espacio de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye mediciones de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion estandar, y las busquedas web no han devuelto datos adicionales. Dado que no se ha realizado entrenamiento, es previsible que el rendimiento en tareas genericas sea similar al de Llama-3.1-8B-Instruct, pero no existe evidencia publicada que lo confirme.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 16 GB (el repositorio pesa 16,1 GB), por lo que se necesitan al menos 16-18 GB de VRAM para inferencia en bf16 sin cuantizacion.
- GPU recomendadas: tarjetas con 24 GB de VRAM como RTX 3090, RTX 4090, A5000 o A10G pueden ejecutar el modelo en bf16. Para GPUs de 16 GB (RTX 4080, RTX 4080 Super) seria necesaria cuantizacion a 8 bits o 4 bits.
- En consumer GPU: cabe en una RTX 3090 o RTX 4090 sin cuantizar; con cuantizacion 4-bit cabria en GPUs de 8 GB (RTX 3070, RTX 4060).
- Opciones de despliegue: al ser un modelo estandar de HuggingFace con pesos safetensors, es compatible con transformers, vLLM, TGI, llama.cpp y Ollama (tras conversion a GGUF). No se proporciona ningun archivo GGUF en el repositorio.
- Latencia y throughput: no se han publicado mediciones. Como referencia, Llama-3.1-8B-Instruct en una RTX 4090 con vLLM suele alcanzar del orden de 100-200 tokens/s en generacion, pero esta variante no aporta datos propios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8,0B | 128K | Fine-tuning instruct con RLHF | Llama 3.1 Community | Si (MMLU, HumanEval, GSM8K, etc.) |
| ApolloRaines/Llama-3.1-8B-Instruct-Full-Suppress-Complete | 8,0B | No especificado | Representation engineering (jBlaze), sin entrenamiento | Llama 3.1 Community | No |
| Otros modelos abliterados de Llama-3.1-8B (p. ej. variantes de la comunidad) | 8,0B | 128K (herencia del base) | Abliteration / eliminacion de direcciones de refusal | Llama 3.1 Community | Generalmente no |

La comparativa directa con el modelo base es la mas relevante: misma arquitectura, mismos pesos de partida, misma licencia, pero comportamiento alterado por la intervencion en el espacio de representaciones. La diferencia principal es que el base conserva los mecanismos de rechazo y cautela, mientras que esta variante los suprime deliberadamente. No se dispone de otros modelos comparables con el mismo conjunto exacto de direcciones suprimidas.

## Limitaciones y advertencias

- Riesgo de seguridad elevado: la supresion de la direccion de refusal (m=2.0) implica que el modelo puede responder a peticiones peligrosas, ilegales o daninas (el propio ejemplo de la model card muestra instrucciones para forzar una cerradura). No es apto para uso en produccion sin un filtro de seguridad externo.
- Sin benchmarks publicados: no hay evidencia de que el modelo mantenga el rendimiento del base en tareas de razonamiento, codigo o matematicas.
- Sesgos heredados: al partir de Llama-3.1-8B-Instruct sin correccion adicional, el modelo conserva los sesgos del modelo base, y la supresion de las direcciones de toxicity y emotion no garantiza su eliminacion real.
- Idioma limitado: solo se declara soporte para ingles, aunque el modelo base es multilingue; la intervencion no ha sido evaluada en otros idiomas.
- Riesgo de alucinacion: no mitigado; la supresion de hedging puede hacer que el modelo afirme incorrectamente con mayor seguridad.
- Licencia: Llama 3.1 Community License, que permite uso comercial pero impone restricciones (por ejemplo, no usar los resultados para mejorar otros modelos de lenguaje, y requisitos de atribucion para usuarios con mas de 700 millones de usuarios mensuales).
- Sin mantenimiento: el repositorio tiene 0 descargas y 0 likes, y no se documentan issues conocidos ("None observed"), pero tampoco hay garantia de soporte ni actualizaciones.
- Contexto no verificado: la longitud de contexto efectiva tras la intervencion no ha sido medida; la proyeccion de pesos podria afectar a la estabilidad en ventanas largas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct-Full-Suppress-Complete
- Herramienta jBlaze: https://github.com/apolloraines/jblaze
- Modelo base en HuggingFace: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Modelo base sin instruct en HuggingFace: https://huggingface.co/meta-llama/Llama-3.1-8B
- Pagina de Llama 3.1 en Ollama: https://ollama.com/library/llama3.1:8b
- Model card de Llama 3.1 8B Instruct en NVIDIA NIM: https://build.nvidia.com/meta/llama-3_1-8b-instruct/modelcard
