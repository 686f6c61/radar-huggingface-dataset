# khan7256/Roman-Urdu-Crypto-Sentiment-Eval

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un conjunto de artefactos de evaluacion: un cuaderno (`roman_urdu_crypto_eval.ipynb`) y un fichero `dataset.json` con discusiones sobre criptomonedas en roman urdu (urdu/hindi escrito con alfabeto latino). El autor, Abdullah Khan, lo publica como parte de su candidatura a la Fatima Fellowship (otoño de 2026). El objeto evaluado es `meta-llama/Llama-3.2-3B-Instruct`, un modelo denso de 3.200 millones de parametros.

El problema que aborda es concreto: los benchmarks de sentimiento financiero estandar, como FiQA, estan redactados exclusivamente en ingles formal, mientras que millones de inversores minoristas de Pakistan e India discuten mercados en Telegram, WhatsApp y Discord usando roman urdu mezclado con jerga cripto. Segun el autor, modelos abiertos pequeños como Llama-3.2-3B fallan sistematicamente con ese registro: alucinan, interpretan el texto como ingles mal escrito o pierden la intencion financiera subyacente.

La relevancia del artefacto es metodologica mas que de rendimiento: documenta un punto ciego de los benchmarks multilingues y propone una via de solucion basada en curacion de datos, ampliacion de vocabulario del tokenizador y ajuste fino con LoRA sobre las capas de atencion y feed-forward. No se publican pesos, metricas cuantitativas ni pipeline de inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable: el repositorio contiene artefactos de evaluacion (cuaderno Jupyter y `dataset.json`), no pesos de un modelo. El modelo evaluado es `meta-llama/Llama-3.2-3B-Instruct`, un transformer decoder-only |
| Parametros totales | No aplicable al artefacto. Modelo evaluado: 3.200 millones de parametros |
| Parametros activos | No aplicable (el modelo evaluado no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada para los artefactos |
| Tipos de cuantizacion | No disponible: el repositorio no distribuye pesos ni versiones cuantizadas |
| Idiomas soportados | No disponible como campo estructurado. El contenido evaluado es roman urdu/roman hindi, con jerga cripto en ingles |
| Licencia | MIT (segun la model card del repositorio) |
| Formato de pesos | No aplicable: no hay pesos. Formatos incluidos: `.ipynb` y `.json` |
| Modelo evaluado | `meta-llama/Llama-3.2-3B-Instruct` |
| Autor | khan7256 (Abdullah Khan) |
| Fecha de creacion | 19 de septiembre de 2026 |
| Ultima actualizacion | 19 de septiembre de 2026 |
| Descargas / likes | 0 descargas / 1 like |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

El repositorio no entrena ni publica ningun modelo. Su contenido es un cuaderno de evaluacion que ejecuta inferencia sobre `meta-llama/Llama-3.2-3B-Instruct` y compara su salida ante entradas en roman urdu frente a equivalentes en ingles formal. El autor describe el fallo observado en tres categorias: alucinacion, tratamiento del texto como ingles con erratas y perdida de la intencion financiera (por ejemplo, ansiedad por caida de precio o venta de panico).

Las caracteristicas tecnicas del modelo evaluado (familia Llama 3.2, 3.200 millones de parametros, transformer decoder-only con atencion de consultas agrupadas, ventana de contexto larga y licencia comunitaria de Meta) proceden de la documentacion publica de Meta y no se verifican ni se detallan en este repositorio; cualquier dato no citado en la model card debe considerarse no disponible a efectos de esta ficha.

La propuesta tecnica del autor combina tres lineas: curacion de un dataset "Roman-Urdu Financial Instruct" mediante scraping de canales publicos de Telegram y Discord del sur de Asia con anotacion sintetica (sentimiento, intencion y extraccion de entidades); ajuste del vocabulario del tokenizador con subpalabras frecuentes de roman urdu, o bien una capa de embeddings a nivel de caracter para robustez ante vocabulario fuera de lista; y ajuste fino con LoRA sobre las capas de atencion y feed-forward. El autor justifica el ajuste de tokenizacion en la ausencia de ortografia estandarizada (`karun`, `karon`, `krun`), que provoca fragmentacion excesiva de tokens en modelos actuales.

## Capacidades

- Evaluacion de sentimiento financiero sobre texto en roman urdu/roman hindi, orientada a discurso cripto.
- Proporciona un script reproducible (`.ipynb`) para comparar el comportamiento del modelo ante entradas en roman urdu frente a ingles formal.
- Incluye un dataset de ejemplo (`dataset.json`) con discusiones de la comunidad, segun lo descrito en la model card.
- Diagnostico cualitativo de fallos del modelo evaluado: alucinacion, malinterpretacion del registro linguistico y perdida de intencion financiera.
- Propuesta metodologica de ampliacion de vocabulario y ajuste LoRA, replicable sobre otros modelos abiertos.
- No incluye capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- No se declara soporte multilingue estructurado ni una lista cerrada de idiomas.
- No se publican pesos, adaptadores LoRA entrenados ni checkpoints.

## Casos de uso

- Auditoria de modelos para mercados del sur de Asia: usar el cuaderno para medir si un modelo candidato entiende consultas reales de inversores en roman urdu antes de desplegarlo en una aplicacion financiera regional.
- Deteccion de fraude y esquemas de inversion: el patron de fallo documentado (interpretar el texto como ingles mal escrito) permite justificar la necesidad de un modelo especifico para clasificar mensajes sospechosos en canales de Telegram y Discord.
- Analitica de sentimiento para senales de trading: el dataset sirve como semilla para construir un clasificador de sentimiento e intencion (FOMO, venta de panico y similares) sobre discurso minorista en tiempo real.
- Creacion de conjuntos de datos anotados: el flujo descrito (scraping de canales publicos mas anotacion sintetica con un modelo frontera) es reutilizable para generar un corpus "Roman-Urdu Financial Instruct" con etiquetas de sentimiento, intencion y entidades.
- Investigacion en tokenizacion multilingue: la falta de ortografia estandarizada en roman urdu convierte este corpus en un banco de pruebas para medir fragmentacion de tokens y evaluar ampliaciones de vocabulario o embeddings a nivel de caracter.
- Soporte a plataformas de atencion al usuario en cripto: integrar el criterio de evaluacion en las pruebas de regresion de un asistente conversacional que deba responder a usuarios que escriben en roman urdu.
- Docencia y talleres de NLP de bajos recursos: el repositorio, con licencia MIT y estructura minima, es material didactico para ilustrar sesgos de benchmarks y estrategias de ajuste eficiente con LoRA.
- Analisis comparativo de modelos pequenos: aplicar el mismo conjunto de pruebas a alternativas de 2 a 4 mil millones de parametros para seleccionar la base de un ajuste fino posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe de forma cualitativa que el modelo evaluado "consistentemente le cuesta capturar los matices del argot en roman urdu" y que a menudo genera sentimiento confuso o no identifica la intencion del operador, pero no se aportan cifras de exactitud, F1, MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion.

## Requisitos de hardware

- El repositorio no distribuye pesos, por lo que no impone requisitos de hardware propios.
- Para reproducir la evaluacion hay que ejecutar inferencia sobre `meta-llama/Llama-3.2-3B-Instruct`. Estimaciones orientativas para 3.200 millones de parametros: entre 7 y 9 GB de VRAM en precision fp16 (incluyendo sobrecarga de activaciones y cache KV), en torno a 4 GB en cuantizacion de 8 bits y entre 2,5 y 3,5 GB en cuantizacion de 4 bits. Estas cifras son estimaciones y no estan verificadas en la informacion proporcionada.
- Cabe en GPU de consumo: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090 en fp16 con contexto moderado; tarjetas de 8 GB requieren cuantizacion.
- En GPU de datacenter, el modelo es holgadamente ejecutable en A100, H100, L40S o similares, con margen para lotes grandes.
- Opciones de despliegue habituales para este tamano: `transformers` con Accelerate, llama.cpp/Ollama con GGUF cuantizado, vLLM o TGI para servicio con concurrencia. El repositorio no especifica cual se uso.
- No se publican datos de latencia, throughput ni consumo energetico.

## Comparativa con modelos similares

No hay datos de rendimiento en el repositorio que permitan una comparativa cuantitativa. La comparativa relevante es entre artefactos de evaluacion, no entre modelos:

| Referencia | Naturaleza | Idioma de evaluacion | Licencia | Disponibilidad |
|---|---|---|---|---|
| Roman-Urdu-Crypto-Sentiment-Eval (este repositorio) | Conjunto de evaluacion y cuaderno | Roman urdu/roman hindi con jerga cripto | MIT | HuggingFace, 0 descargas |
| FiQA | Benchmark de sentimiento financiero | Ingles formal | No disponible en la informacion proporcionada | Publico |
| `meta-llama/Llama-3.2-3B-Instruct` | Modelo evaluado | Multilingue segun Meta, sin roman urdu declarado | Licencia comunitaria de Llama 3.2 | Publico |

Cualquier otra comparacion con modelos de la misma categoria (por ejemplo, alternativas densas de 2 a 4 mil millones de parametros) no puede sustentarse con la informacion disponible.

## Limitaciones y advertencias

- El repositorio no es un modelo: no contiene pesos, adaptadores ni un pipeline de inferencia declarado. La etiqueta de pipeline aparece como no disponible en HuggingFace.
- No se publican metricas cuantitativas. Todas las conclusiones de la model card son cualitativas y proceden de un unico evaluador.
- El conjunto de datos ha sido compilado por un unico autor y su tamano, composicion y metodo de anotacion no se detallan en la informacion disponible, por lo que no se puede valorar su representatividad estadistica.
- El corpus procede, segun la propuesta del autor, de canales publicos de Telegram y Discord; un scraping de este tipo puede arrastrar datos personales, contenido spam o mensajes de manipulacion de mercado, con los consiguientes riesgos de privacidad y sesgo.
- La evaluacion se limita a un unico modelo (`meta-llama/Llama-3.2-3B-Instruct`) y a un unico dominio (criptomonedas). No hay evidencia de generalizacion a otros modelos ni a otros ambitos financieros.
- La licencia MIT cubre los artefactos del repositorio, no el modelo evaluado: el uso comercial de Llama 3.2 esta sujeto a la licencia comunitaria de Meta, con sus propias condiciones y restricciones.
- El roman urdu carece de ortografia estandarizada, de modo que cualquier metrica de evaluacion dependera fuertemente de las convenciones de transcripcion empleadas.
- La fecha de creacion declarada (19 de septiembre de 2026) es posterior a la fecha actual; conviene verificar la coherencia temporal de los metadatos antes de citar el recurso.
- Riesgo de alucinacion en el modelo evaluado documentado explicitamente por el autor al procesar texto en roman urdu.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/khan7256/Roman-Urdu-Crypto-Sentiment-Eval
- Modelo evaluado: `meta-llama/Llama-3.2-3B-Instruct` (referenciado en la model card; no se aporta URL en la informacion proporcionada)
- FiQA (benchmark financiero citado como contraste; no se aporta URL en la informacion proporcionada)
- No se han encontrado en la busqueda web enlaces relevantes: los resultados devueltos corresponden a paginas corporativas de Microsoft (microsoft.com, account.microsoft.com, myaccount.microsoft.com, microsoft.com/microsoft-365 y la entrada de Wikipedia sobre Microsoft) y no guardan relacion con este repositorio, con roman urdu ni con evaluacion de sentimiento financiero.
