# Machaieie/mms-tso-changana-base

## Resumen

Machaieie/mms-tso-changana-base es un modelo de sintesis de voz (text-to-speech, TTS) publicado en Hugging Face por el usuario Machaieie. Por su identificador y la etiqueta de arquitectura `vits`, corresponde a un modelo TTS end-to-end de tipo VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), no a un modelo de lenguaje generativo de texto. El identificador sugiere que el modelo esta orientado al changana (tsonga, codigo ISO 639-3 `tso`), una lengua bantu hablada en el sur de Mozambique, el sur de Zimbabwe y el nordeste de Sudafrica.

El modelo tiene 83.013.174 parametros (unos 83 millones) en formato safetensors, con un repositorio de 0,3 GB, lo que es coherente con el tamano tipico de un modelo VITS de un solo hablante. La model card publicada es la plantilla automatica de Hugging Face, sin informacion completada por el autor; no incluye descripcion, datos de entrenamiento, licencia, idiomas declarados ni resultados de evaluacion.

Su relevancia potencial reside en ampliar la cobertura de sintesis de voz a una lengua de bajos recursos como el changana, un ambito historicamente desatendido por los sistemas TTS comerciales. Complementariamente, por la convencion de nomenclatura (`mms-...`), parece estar relacionado con la familia de modelos MMS (Massively Multilingual Speech) de Meta; sin embargo, el autor no confirma esta filiacion en la informacion disponible, por lo que debe tratarse como una hipotesis no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (TTS end-to-end, modelado variacional con entrenamiento adversarial) |
| Parametros totales | 83.013.174 (aproximadamente 83 millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo TTS; la entrada es texto o fonemas, no una ventana de contexto autoregresiva) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el identificador sugiere changana/tsonga, ISO `tso`, sin confirmar por el autor) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-26 |

## Arquitectura y entrenamiento

La etiqueta `vits` del repositorio indica que el modelo sigue la arquitectura VITS, un sistema TTS end-to-end condicionado por texto que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado conjuntamente. VITS ha sido una arquitectura de referencia para TTS neuronal por su capacidad de generar voz de calidad razonable en un solo paso y con modelos compactos del orden de decenas de millones de parametros, lo que encaja con el tamano observado de este checkpoint.

No se dispone de informacion sobre los datos de entrenamiento: ni el numero de horas de audio, ni la identidad o el numero de hablantes, ni la composicion del corpus, ni si hubo etapas de ajuste fino. Tampoco se documenta el procedimiento de preprocesado, la tokenizacion o la fonemizacion empleada para el changana, ni los hiperparametros de entrenamiento. La etiqueta `arxiv:1910.09700` que aparece en los metadatos corresponde al articulo de Lacoste et al. sobre cuantificacion de emisiones de carbono, incluido de forma automatica en la plantilla de Hugging Face, y no a un articulo propio del modelo. No se identifican innovaciones tecnicas declaradas por el autor.

## Capacidades

- Sintesis de voz a partir de texto (TTS), presuntamente en changana/tsonga segun el identificador, sin confirmacion en la model card.
- Generacion de audio en un unico paso, propia de la arquitectura VITS.
- Capacidad de ejecucion sobre `transformers` con pesos en safetensors.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponibles; no hay lista de idiomas declarada.
- Capacidades especiales (modo thinking, vision, audio de entrada): no disponibles; la unica modalidad documentada por la etiqueta es la salida de audio.

## Casos de uso

- Lectura de textos en changana: el modelo puede convertir articulos, avisos o documentacion escrita en changana a audio, lo que resulta util para locucion automatizada en una lengua con escasa oferta de voces sinteticas.
- Accesibilidad para personas con discapacidad visual: sintesis de contenido escrito en changana para lectores de pantalla en comunidades donde esta lengua es vehicular.
- Locucion de contenidos educativos: generacion de audio para materiales escolares y cursos en changana, reduciendo el coste de grabar cada leccion con un locutor humano.
- Aplicaciones de mensajeria y asistentes de voz: integracion en interfaces conversacionales que necesiten respuestas habladas en changana, presuponiendo que exista un modulo de reconocimiento de voz y de comprension de lenguaje complementario.
- Avisos y comunicaciones publicas: difusion de alertas o informacion institucional en audio para emisoras comunitarias y servicios publicos en zonas donde se habla changana.
- Prototipado e investigacion en TTS de bajos recursos: sirve como punto de partida para comparar tecnicas de sintesis en lenguas bantu con pocos datos y para experimentos de ajuste fino o de adaptacion a nuevos hablantes.
- Preservacion linguistica: generacion de corpus de audio sintetico para documentar y difundir el changana en entornos digitales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion cumplimentada (aparece como `[More Information Needed]`), y no hay datos de MOS (Mean Opinion Score), inteligibilidad, similitud de hablante ni comparaciones objetivas con otros sistemas TTS. Los resultados de busqueda web encontrados corresponden a rankings generales de modelos de lenguaje y no contienen informacion sobre este modelo ni sobre TTS en changana.

## Requisitos de hardware

- VRAM estimada para inferencia: con unos 83 millones de parametros, la huella en memoria es reducida. En fp32 rondaria los 330 MB solo de pesos; en fp16, unos 166 MB. La VRAM total necesaria depende del tiempo de audio a generar y del tamano del lote, pero en la practica es inferior a 2 GB en la mayoria de configuraciones.
- GPU recomendadas: practicamente cualquier GPU moderna es suficiente, incluidas tarjetas de gama media y baja. No se requieren aceleradores de datacenter como A100 o H100; su uso solo tendria sentido para servir grandes volumenes en paralelo.
- GPU de consumo: cabe con holgura en GPU de consumo, incluidas series como RTX 3060, RTX 4060 o superiores, y tambien en GPUs integradas con suficiente memoria compartida.
- Inferencia en CPU: viable por el tamano del modelo, aunque con mayor latencia que en GPU. Es una opcion razonable para despliegues de bajo volumen.
- Opciones de despliegue: al estar etiquetado como `transformers` con `pipeline` de TTS, puede cargarse mediante la libreria transformers. No se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI; estos motores estan orientados a modelos de lenguaje y no aplican de forma estandar a un modelo VITS.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Machaieie/mms-tso-changana-base | 83.013.174 | VITS | No disponible (presuntamente changana/tsonga) | No disponible | Hugging Face, 0 descargas |
| Familia Meta MMS-TTS (por ejemplo, facebook/mms-tts-tso) | Del orden de decenas de millones por modelo | VITS | Cobertura de mas de 1000 lenguas | CC-BY-NC 4.0 (segun la familia MMS) | Hugging Face |

Advertencia: los datos de la fila correspondiente a la familia Meta MMS-TTS no se han verificado dentro de la informacion proporcionada para este modelo y deben confirmarse en las fuentes oficiales antes de usarse. No se dispone de datos verificados de rendimiento comparado, por lo que no es posible establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay informacion sobre datos de entrenamiento, procedencia del audio, numero de hablantes ni condiciones de grabacion, lo que impide evaluar sesgos o calidad de forma informada.
- Licencia no declarada: sin licencia explicita no puede asumirse permiso para uso comercial ni para redistribucion; debe contactarse con el autor antes de cualquier uso productivo.
- Idiomas no confirmados: aunque el identificador apunta al changana/tsonga, el autor no declara los idiomas soportados ni la variante o variedad concreta.
- Riesgo de alucinacion acustica: como todo modelo TTS generativo, puede producir pronunciaciones incorrectas, artefactos, ruido o inestabilidad en fonemas poco representados en los datos de entrenamiento.
- Cobertura limitada de vocabulario: en lenguas de bajos recursos es frecuente que el modelo falle ante prestamos, nombres propios, numeros, siglas y palabras fuera del dominio de entrenamiento.
- Ausencia de evaluacion objetiva: no existen metricas de calidad (MOS, WER de sintesis, similitud de hablante) que permitan estimar su fiabilidad.
- Escaso uso comunitario: con 0 descargas y 0 likes, no hay retroalimentacion de terceros que valide su funcionamiento real.
- Idoneidad para produccion no demostrada: al no documentarse latencia, estabilidad ni pruebas de carga, debe validarse internamente antes de integrarlo en un servicio.
- Posible confusión de etiquetas: la etiqueta `arxiv:1910.09700` corresponde a la referencia de emisiones de carbono de la plantilla de Hugging Face y no a un articulo tecnico del modelo.

## Enlaces

- Pagina del modelo en Hugging Face: https://huggingface.co/Machaieie/mms-tso-changana-base
- Articulo referenciado en la etiqueta `arxiv:1910.09700` (Lacoste et al., cuantificacion de emisiones de carbono, incluido en la plantilla): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de aprendizaje automatico citada en la plantilla: https://mlco2.github.io/impact
- Hugging Face (portal general): https://huggingface.co/
- No se han encontrado articulos, repositorios, demos ni blogs adicionales especificos de este modelo en la busqueda web realizada.
