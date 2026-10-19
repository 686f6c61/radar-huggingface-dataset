# fahad4934/deen-wall-quran-whisper

## Resumen

`fahad4934/deen-wall-quran-whisper` es un modelo de reconocimiento automatico del habla (ASR) especializado en recitacion del Coran en arabe, distribuido en formato GGML para su uso con whisper.cpp. No es un entrenamiento nuevo: se trata de una conversion de formato y una cuantizacion del modelo `tarteel-ai/whisper-base-ar-quran` de Tarteel AI, que a su vez es un fine-tuning de la arquitectura Whisper base de OpenAI sobre audio de recitacion coranica. El autor mantiene los pesos sin modificar y solo aplica el script `convert-h5-to-ggml.py` de whisper.cpp junto con una cuantizacion q8_0.

La relevancia del modelo es practica: al estar en formato ggml cuantizado a 8 bits, el repositorio ocupa 0,1 GB y puede ejecutarse en un telefono movil mediante whisper.cpp o whisper.rn, sin conexion a red ni envio de audio a servidores externos. El caso de uso declarado es la aplicacion Deen Wall, que verifica la recitacion de un lector en el propio dispositivo, lo que tiene implicaciones directas de privacidad y de latencia en entornos con conectividad limitada.

El alcance es deliberadamente estrecho: un unico idioma (arabe), un unico dominio (recitacion coranica) y una unica cuantizacion publicada (q8_0). No hay informacion publicada sobre volumen de descargas, resultados de benchmarks ni detalles del proceso de entrenamiento original en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper (heredada del modelo base `tarteel-ai/whisper-base-ar-quran`; no se detalla en la model card) |
| Parametros totales | 74 M aproximadamente, por corresponder a la variante `whisper-base` de OpenAI; no se explicita en la model card |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la model card; Whisper procesa ventanas de audio de 30 s |
| Tipos de cuantizacion | q8_0 (unico fichero publicado: `ggml-quran-base-q8_0.bin`) |
| Idiomas soportados | Arabe (`ar`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGML (`.bin`) para whisper.cpp; el modelo original esta en formato Hugging Face Transformers |

## Arquitectura y entrenamiento

La arquitectura corresponde a Whisper base de OpenAI: un transformer encoder-decoder que recibe espectrogramas Mel de ventanas de audio de 30 segundos y genera tokens de texto, con un vocabulario multilingue y tokens especiales de idioma y de tarea. Sobre esa base, Tarteel AI realizo un fine-tuning especifico para recitacion coranica en arabe, dando lugar a `tarteel-ai/whisper-base-ar-quran`, del que este repositorio es una derivacion directa.

El autor de esta ficha tecnica no aporta entrenamiento nuevo. Segun la model card, los unicos cambios respecto al modelo original son la conversion de formato mediante `convert-h5-to-ggml.py` del proyecto whisper.cpp y la cuantizacion a q8_0; los pesos "por lo demas no cambian". No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si el fine-tuning original uso RLHF, DPO o tecnicas de alineamiento similares. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Transcripcion de audio de recitacion coranica en arabe, con salida de texto.
- Reconocimiento de habla en arabe dentro del dominio de recitacion; el resto de registros del arabe no esta garantizado por la model card.
- Ejecucion completamente local (on-device) mediante whisper.cpp y whisper.rn, sin dependencia de servicios en la nube.
- Inferencia en CPU y en dispositivos moviles gracias a la cuantizacion q8_0 y al reducido tamano del modelo.
- Integracion en aplicaciones React Native a traves de whisper.rn, segun se indica en la model card.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponibles; el modelo es exclusivamente ASR.
- Capacidades de vision, audio generativo o modo "thinking": no disponibles.
- Marca de tiempos (timestamps) a nivel de palabra o segmento: no documentada en la informacion disponible.

## Casos de uso

- Verificacion de recitacion en la app Deen Wall: el modelo transcribe la recitacion del usuario en el propio dispositivo y permite compararla con el texto esperado, sin enviar audio a ningun servidor. Es el caso de uso declarado por el autor.
- Aplicaciones de memorizacion (hifz): el estudiante recita un pasaje y la app detecta omisiones o sustituciones de palabras comparando la transcripcion con el texto coranico de referencia, con feedback inmediato y sin conexion.
- Practica de tajweed en entornos sin conectividad: escuelas y centros con red limitada pueden desplegar la correccion de recitacion en telefonos o equipos de bajos recursos, dado que el fichero ggml ocupa del orden de decenas de MB.
- Transcripcion y archivo de sesiones de recitacion: grabaciones de clases o sesiones koranicas pueden transcribirse localmente para generar indices o buscadores sobre el texto recitado.
- Aplicaciones moviles de bajo consumo: al ejecutarse en CPU y con un modelo de 74 M de parametros, encaja en apps Android/iOS que no pueden asumir el coste de memoria de un modelo large.
- Privacidad y cumplimiento normativo: organizaciones que no pueden procesar audio de usuarios en la nube (datos religiosos o personales sensibles) pueden usar el modelo como capa de ASR local.
- Prototipado rapido de pipelines ASR en arabe: sirve como baseline ligero en whisper.cpp antes de escalar a variantes de mayor tamano, siempre dentro del dominio coranico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de error de palabra (WER), comparaciones con el modelo original ni metricas de latencia o throughput. Tampoco se documenta el impacto de la cuantizacion q8_0 en la calidad de transcripcion respecto a los pesos originales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato publicado. Por el tamano del repositorio (0,1 GB) y una cuantizacion a 8 bits sobre 74 M de parametros, el uso de memoria es del orden de decenas o pocos cientos de MB, muy por debajo de 1 GB; es una estimacion derivada, no un dato del autor.
- GPU recomendadas: no disponibles ni necesarias; el modelo esta pensado para CPU.
- Compatibilidad con GPU de consumo: si, cualquier GPU consumer puede alojarlo, aunque el diseno objetivo es la ejecucion en CPU y en movil.
- Despliegue recomendado: whisper.cpp (CLI y libreria), whisper.rn para React Native, y otros bindings de whisper.cpp. No se contemplan vLLM ni TGI, que no soportan este formato.
- Latencia y throughput: no disponibles. Dependen del dispositivo, del numero de hilos y de la duracion del audio; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `fahad4934/deen-wall-quran-whisper` | ~74 M (whisper-base) | No disponible (ventanas de 30 s en Whisper) | Arabe | GGML q8_0 | Apache 2.0 | Hugging Face, 0 descargas |
| `tarteel-ai/whisper-base-ar-quran` (modelo base) | ~74 M (whisper-base) | No disponible | Arabe | Transformers | No disponible en la informacion proporcionada | Hugging Face |
| Whisper base de OpenAI | 74 M | Ventanas de 30 s | Multilingue | PyTorch / safetensors / GGML (conversiones de terceros) | No disponible en la informacion proporcionada | Repositorio oficial de OpenAI |

La comparacion se limita a estas tres referencias porque la informacion disponible no incluye otros modelos de ASR coranico ni resultados que permitan contrastar calidad. Frente al modelo base de Tarteel AI, la unica diferencia verificable es el formato y la cuantizacion; frente a Whisper base original, la diferencia es el dominio de entrenamiento y el idioma.

## Limitaciones y advertencias

- Dominio muy restringido: el fine-tuning se hizo sobre recitacion coranica; el rendimiento fuera de ese dominio (arabe coloquial, noticias, conversacion) no esta documentado y previsiblemente sera inferior.
- Un solo idioma: la model card declara unicamente `ar`; no hay garantia de comportamiento en otras lenguas aunque la arquitectura Whisper sea multilingue.
- Cuantizacion q8_0: no se ha publicado la perdida de precision respecto a los pesos originales; en produccion conviene validar el WER con un conjunto propio antes de sustituir el modelo sin cuantizar.
- Riesgo de alucinacion: los modelos Whisper pueden generar texto plausible en segmentos de silencio, ruido o audio de baja calidad; no se documenta ningun mecanismo de mitigacion en esta conversion.
- Variabilidad de recitadores y estilos: no se especifica la composicion del dataset original (recitadores, estilos de tajweed, calidad de grabacion), por lo que el sesgo hacia determinadas voces o estilos es desconocido.
- Sin datos de evaluacion: no hay benchmarks, ni comparaciones con el modelo original, ni mediciones de latencia; evaluar antes de desplegar.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar el aviso de copyright y la licencia, y de indicar cambios relevantes. Se debe mantener la atribucion a Tarteel AI como autor del modelo original.
- Mantenimiento: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no hay evidencia de soporte o actualizaciones; conviene fijar la version del fichero por hash.
- Sin informacion sobre marcas de tiempo ni sobre el preprocesado de audio esperado (frecuencia de muestreo, normalizacion); hay que atenerse a las convenciones de whisper.cpp.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fahad4934/deen-wall-quran-whisper
- Modelo base: https://huggingface.co/tarteel-ai/whisper-base-ar-quran
- whisper.cpp (referenciado en la model card): https://github.com/ggerganov/whisper.cpp
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
