# babusza/typhoon-whisper-v5-ark

## Resumen

`typhoon-whisper-v5-ark` es un adaptador LoRA (PEFT) entrenado sobre el modelo de reconocimiento automatico del habla `openai/whisper-large-v3`, especializado en la transcripcion de conversaciones de call center del sector asegurador en tailandes. Lo desarrolla ARK Insights Co., Ltd. y esta publicado por el usuario `babusza` en Hugging Face bajo licencia Apache 2.0. El problema que aborda es concreto: los modelos ASR genericos de Whisper cometen errores sistematicos con nombres propios tailandeses, numeros de identificacion, terminologia especifica de polizas de seguros, formulas de consentimiento y habla mixta tailandes-ingles, que son precisamente los elementos criticos en una llamada de contratacion o siniestro.

La relevancia de esta ficha es limitada pero clara: no es un modelo de proposito general, sino un adaptador de dominio de bajo coste computacional (el repositorio ocupa 0,5 GB) que se acopla a un modelo base ya existente. Esto lo hace atractivo para equipos que ya tienen desplegado Whisper large-v3 y quieren mejorar la calidad de transcripcion en un vertical concreto sin reentrenar el modelo completo. El caso declarado es el proyecto Chubb × TTB (aseguradora y banco tailandeses).

La informacion publicada por el autor es, sin embargo, muy incompleta: la model card conserva la plantilla por defecto y la mayoria de secciones figuran como "More Information Needed". No hay datos de entrenamiento, hiperparametros, metricas de evaluacion ni instrucciones de uso. Cualquier evaluacion seria del adaptador exige validacion propia con datos del dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer encoder-decoder (Whisper large-v3) |
| Parametros totales | 1550 M en el modelo base `openai/whisper-large-v3`; numero de parametros entrenables del adaptador: no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos (caracteristica del modelo base Whisper); contexto textual en tokens: no disponible |
| Tipos de cuantizacion | No disponible. El autor no documenta ninguna cuantizacion del adaptador |
| Idiomas soportados | Tailandes (th); la model card indica tambien entrenamiento para habla mixta tailandes-ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | PEFT 0.19.1 + HuggingFace Transformers |
| Modelo base | openai/whisper-large-v3 |
| Tamano del repositorio | 0,5 GB |
| Tarea (pipeline) | automatic-speech-recognition |
| Framework de libreria | peft |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango insertadas en capas del transformer subyacente. El modelo base es Whisper large-v3, una arquitectura encoder-decoder de tipo transformer con aproximadamente 1550 millones de parametros, entrenada por OpenAI con supervision debil sobre 680 000 horas de audio multilingue y multitarea (transcripcion, traduccion, deteccion de idioma y marcas de tiempo). Whisper procesa el audio en ventanas de 30 segundos, convertidas previamente a un espectrograma mel de 128 canales. Los modulos exactos sobre los que se aplica el LoRA (atencion, proyecciones, etc.) no estan documentados en la informacion disponible.

Respecto al entrenamiento, la model card no aporta ningun dato: se desconoce el volumen de horas de audio utilizadas, la composicion del dataset, si hubo fuentes sinteticas o aumentadas, la precision (fp16/bf16/fp32), la tasa de aprendizaje, el numero de epocas ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en ASR). Tampoco se especifica el hardware ni las horas de computo empleadas, y la seccion de impacto medioambiental queda sin rellenar. La unica innovacion tecnica declarada es la propia adaptacion de dominio al vertical asegurador mediante PEFT, con enfasis explicito en nombres propios, numeros de identificacion, terminologia de seguros, formulas de consentimiento y code-switching tailandes-ingles.

## Capacidades

- Reconocimiento automatico del habla (ASR) en tailandes, con salida de transcripcion de texto.
- Transcripcion de entidades criticas del dominio: nombres personales tailandeses y numeros de identificacion.
- Reconocimiento de terminologia especifica de seguros (polizas, coberturas, primas, siniestros).
- Deteccion y transcripcion de formulas de consentimiento y aceptacion contractual.
- Manejo de habla mixta tailandes-ingles (code-switching), segun la model card.
- Transcripcion de llamadas de call center multiusuario (operador y cliente).
- No se ha documentado soporte de tool calling ni function calling: no disponible.
- No se ha documentado comportamiento como agente ni razonamiento multi-paso: no disponible (es un modelo ASR, no un LLM generativo de proposito general).
- Capacidades multimodales adicionales (vision, audio mas alla del ASR, thinking mode): no disponibles.
- Otras capacidades heredadas del modelo base (deteccion de idioma, marcas de tiempo, traduccion) no estan confirmadas como preservadas por el autor.

## Casos de uso

- Transcripcion de llamadas de call center asegurador: el adaptador esta entrenado especificamente para el flujo de contratacion de seguros, de modo que transcribe con mayor fidelidad los nombres, numeros de documento y referencias de poliza que un Whisper generico tiende a deformar. Se usaria como paso previo a cualquier analisis posterior de la llamada.
- Verificacion de cumplimiento (compliance): las aseguradoras estan obligadas a registrar el consentimiento explicito del cliente. Transcribir cada llamada y comprobar la presencia de las formulas de consentimiento permite auditar el proceso a escala y detectar incumplimientos.
- Control de calidad de agentes: a partir de la transcripcion se calculan metricas como la correcta identificacion del cliente, la verificacion de datos o la claridad en la explicacion de coberturas, alimentando paneles de evaluacion interna.
- Extraccion estructurada de datos tras la llamada: la transcripcion se pasa a un LLM posterior que rellena campos de formulario (nombre, DNI, producto contratado, importe). La calidad del ASR en entidades nombradas es determinante para la precision de esa extraccion.
- Transcripcion de reuniones internas y formacion en tailandes: el modelo base ya cubre habla general, y el adaptador no deberia degradar ese rendimiento, por lo que sirve para generar actas y material de formacion.
- Subtitulado de material audiovisual corporativo en tailandes para uso interno o publicacion en canales digitales.
- Analisis de sentimiento y motivos de reclamacion: la transcripcion normalizada permite clasificar llamadas por causa y detectar patrones de insatisfaccion recurrentes.
- Busqueda y recuperacion sobre archivos de audio: indexar transcripciones permite localizar llamadas por nombre de cliente, numero de poliza o palabra clave, algo inviable buscando en audio sin transcribir.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna metrica de evaluacion: la seccion de evaluacion, los datos de prueba, las metricas (por ejemplo WER o CER) y los resultados figuran como "More Information Needed". No es posible, por tanto, comparar cuantitativamente el rendimiento del adaptador frente al modelo base ni frente a alternativas. Este es el principal riesgo a la hora de adoptarlo: la unica evidencia de mejora es la declaracion cualitativa del autor sobre los tipos de contenido para los que fue entrenado.

## Requisitos de hardware

- El adaptador por si solo ocupa 0,5 GB, pero la inferencia exige cargar el modelo base `openai/whisper-large-v3` completo; los requisitos reales vienen determinados por este ultimo.
- VRAM estimada para inferencia del modelo base: en fp16 aproximadamente 3,1 GB solo de pesos, mas activaciones y cache de atencion, lo que en la practica se traduce en unos 4-6 GB con lotes pequenos; en fp32, alrededor de 6,2 GB de pesos y 8-10 GB en ejecucion; en int8, aproximadamente 1,5-2 GB de pesos.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM puede ejecutar el modelo en fp16 con lotes pequenos. Una RTX 3060 de 12 GB, RTX 4070, RTX 4080 o RTX 4090 son suficientes. En entornos de servidor, A100, H100 o L40S aportan margen para procesar audio por lotes con mayor throughput.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas en fp16, y en tarjetas de 4-6 GB si se cuantiza.
- Opciones de despliegue: HuggingFace Transformers junto con la libreria PEFT para cargar el adaptador (es la via documentada por el autor); el adaptador puede fusionarse con el modelo base y exportarse a otros runtimes de Whisper. Otras alternativas habituales para Whisper (faster-whisper con CTranslate2, whisper.cpp, vLLM con soporte de Whisper) no estan confirmadas en la informacion proporcionada y requeririan conversion y validacion propias.
- Latencia y throughput estimados: no disponible. El autor no publica ninguna medicion, y la latencia dependera del hardware, del tamano de lote y de si se aplica cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Idiomas | Licencia | Adaptacion de dominio | Disponibilidad |
|---|---|---|---|---|---|---|
| typhoon-whisper-v5-ark | 1550 M (base) + adaptador LoRA | 30 s | Tailandes (y mixto th-en declarado) | Apache 2.0 | Si, seguros / call center | Hugging Face (adaptador PEFT) |
| openai/whisper-large-v3 | 1550 M | 30 s | Multilingue (99 idiomas) | Apache 2.0 | No | Hugging Face |
| openai/whisper-large-v3-turbo | 809 M | 30 s | Multilingue | Apache 2.0 | No | Hugging Face |

La comparativa cuantitativa de calidad de transcripcion (WER/CER) entre estas opciones para el dominio asegurador tailandes no esta disponible, ya que el autor no publica evaluacion alguna. La diferencia funcional relevante es que `typhoon-whisper-v5-ark` es el unico de los tres con adaptacion declarada al dominio; la contrapartida es que su idoneidad fuera de ese dominio (o incluso dentro de el) no ha sido verificada publicamente. No se dispone de informacion sobre otros adaptadores ASR tailandeses comparables dentro de los datos proporcionados.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card conserva la plantilla por defecto y no describe datos de entrenamiento, hiperparametros, evaluacion ni uso previsto. Esto impide reproducir el entrenamiento o anticipar su comportamiento.
- Ausencia total de metricas: sin valores de WER o CER no hay forma de saber si el adaptador mejora realmente al modelo base, y menos aun de cuanto.
- Sesgo de dominio: esta ajustado para un unico vertical (seguros, call center, proyecto Chubb × TTB). Fuera de ese contexto, o con acentos, ruido telefónico o jerga distintos, el rendimiento puede degradarse respecto al modelo base.
- Riesgo de alucinacion: como cualquier modelo Whisper, puede generar texto plausible pero incorrecto en segmentos con ruido, silencio o audio de baja calidad. En un contexto asegurador esto es especialmente grave en nombres, numeros de identificacion e importes, donde un error de transcripcion puede tener consecuencias contractuales o legales.
- Limitacion idiomatica: declarado solo para tailandes. El rendimiento en otros idiomas no esta garantizado ni documentado, aunque el modelo base sea multilingue.
- Ventana de audio de 30 segundos: limitacion heredada del modelo base; requiere segmentacion previa para llamadas largas, con el consiguiente riesgo de errores en las fronteras de segmento.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero no se documentan las licencias ni los derechos sobre los datos de audio de entrenamiento, lo que puede ser relevante si el corpus procede de grabaciones reales de clientes.
- Privacidad y proteccion de datos: es un modelo para transcribir conversaciones que contienen datos personales (nombres, identificaciones, informacion financiera). Su despliegue exige cumplimiento normativo, algo que la model card no aborda.
- Adopcion marginal: 7 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion por terceros ni de mantenimiento del repositorio.
- Sin garantias de soporte: no se documenta canal de contacto, versionado futuro del adaptador ni compatibilidad con versiones de PEFT distintas de la 0.19.1 declarada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/babusza/typhoon-whisper-v5-ark
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Paper de Lacoste et al. sobre impacto medioambiental, citado en la model card: https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML referenciada: https://mlco2.github.io/impact
- Libreria PEFT (documentacion): https://huggingface.co/docs/peft
- Repositorio PEFT en GitHub: https://github.com/huggingface/peft
