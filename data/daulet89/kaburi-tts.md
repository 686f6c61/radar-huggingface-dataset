# Daulet89/kaburi-tts

## Resumen

KABURI-TTS es un sistema de síntesis de voz conversacional publicado por el usuario Daulet89 en HuggingFace, desarrollado en el marco del grupo de trabajo de diálogo del Centro de Investigación y Desarrollo de Modelos de Lenguaje a Gran Escala (LLMC) del Instituto Nacional de Informática de Japón (NII). Su particularidad es que genera diálogos de dos hablantes en japonés como dos canales de audio simultáneos (izquierdo y derecho), reproduciendo únicamente a partir de texto la estructura temporal propia de la conversación: respuestas de acompañamiento (相槌), solapamientos (かぶり, kaburi) y pausas.

El sistema no es un modelo monolítico, sino una cadena de cuatro componentes: un modelo acústico de rectified flow derivado de Irodori-TTS-500M-v2 (~500 M de parámetros) que genera ambos canales a la vez; un generador de rasters de fonemas compuesto por un realizer y un gap model; un predictor de timing basado en un Transformer ligero (configuración evaluada en el artículo); y un conversor de texto escrito a estilo hablado afinado desde llm-jp/llm-jp-3-440m. Los latentes se decodifican a estéreo de 48 kHz mediante Semantic-DACVAE-Japanese-32dim. Los pesos ocupan 4,3 GB en el repositorio y se distribuyen en safetensors.

Su relevancia actual está en el modelado explícito del solapamiento y del turn-taking, un aspecto que la mayoría de sistemas TTS abordan de forma implícita o directamente ignoran. El trabajo se ha aceptado en APSIPA ASC 2026 (preprint en arXiv:2609.07200) y se publica bajo Apache 2.0, aunque con licencias derivadas aplicables (MIT en el modelo acústico). El repositorio es muy reciente (10 de septiembre de 2026) y no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cadena de componentes: modelo acústico de rectified flow (derivado de Irodori-TTS-500M-v2); realizer y gap model para rasters de fonemas; predictor de timing basado en Transformer ligero; textconverter derivado de llm-jp-3-440m |
| Parámetros totales | No disponible de forma agregada; el modelo acústico deriva de Irodori-TTS-500M-v2 (~500 M según la denominación del modelo base) y el textconverter de llm-jp-3-440m (~440 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje de contexto largo; el condicionamiento es la secuencia de fonemas y el contexto de diálogo) |
| Tipos de cuantización | No disponible; se distribuyen pesos en safetensors y no se documentan cuantizaciones GGUF, INT8 ni equivalentes |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0, con las licencias de los derivados aplicables: MIT para el modelo acústico (Irodori-TTS-500M-v2) y Apache 2.0 para el textconverter (llm-jp-3-440m). El codec Semantic-DACVAE-Japanese-32dim es MIT y no se redistribuye en el repositorio |
| Formato de pesos | safetensors y configuraciones de inferencia (PyTorch) |

## Arquitectura y entrenamiento

El componente acústico es un modelo de rectified flow condicionado por la secuencia de fonemas, la actividad de habla y el audio de referencia del hablante, que genera los dos canales de forma simultánea. En inferencia aplica classifier-free guidance con cfg_scale=2,5, lo que implica al menos dos evaluaciones del modelo por paso de muestreo. Los latentes resultantes se decodifican a estéreo de 48 kHz con el códec Semantic-DACVAE-Japanese-32dim, que trabaja con latentes de 32 dimensiones a 25 fps. El modelo acústico es el mismo que el descrito en el artículo; lo que cambia respecto a la versión publicada es la sustitución del predictor de timing único por dos módulos: el realizer (qué fonemas se pronuncian y con qué duración) y el gap model (cuándo empieza cada intervención, es decir, pausas y solapamientos).

Los modelos de raster se entrenan tomando como supervisión los tiempos medidos en LLM-jp-Zoom1, el corpus de diálogo libre japonés entre dos hablantes construido por NII LLMC. El predictor de timing es un Transformer ligero que estima duraciones por fonema, silencios previos a la intervención y gap/overlap entre canales; solo se usa cuando se activa el modo `--paper-mode`. El cuarto componente, el textconverter, es un ajuste fino de llm-jp-3-440m que reescribe diálogo de estilo escrito a estilo hablado (turnos cortos, respuestas de acompañamiento, muletillas), imitando el estilo de LLM-jp-Zoom1. No se documentan en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de voz sintética de dos hablantes en japonés con salida simultánea en dos canales (izquierdo y derecho) y muestreo estéreo de 48 kHz.
- Modelado explícito del timing conversacional: solapamientos (kaburi), respuestas de acompañamiento y pausas, derivados del texto de entrada.
- Realización fonética y asignación de duración por fonema mediante el realizer, y decisión del instante de inicio de cada intervención mediante el gap model.
- Predicción de duración por fonema, silencio previo a la intervención y gap/overlap entre canales con el predictor basado en Transformer (configuración del artículo).
- Conversión de diálogo en estilo escrito a estilo hablado (turnos cortos, backchannels, fillers) con el textconverter.
- Control del timbre del hablante mediante audio de referencia, con mejores resultados cuando la referencia se parece a las condiciones del corpus de entrenamiento.
- Reproducción de la configuración evaluada en el artículo mediante el modo `--paper-mode` y el tag `paper-release-v1` del repositorio.
- No soporta tool calling ni function calling.
- No está orientado a agentes ni a razonamiento multi-paso; no genera texto.
- Capacidades multilingües: no; el sistema está entrenado y etiquetado únicamente para japonés.
- No dispone de visión, audio de entrada como tarea principal (salvo la referencia de hablante) ni modo de razonamiento explícito.

## Casos de uso

- Generación de datos sintéticos para entrenar sistemas de diálogo: el modelo produce conversaciones de dos hablantes con solapamientos y pausas realistas, lo que permite aumentar corpus de turn-taking para modelos de predicción de turno o de diálogo hablado.
- Evaluación de sistemas de diarización y separación de fuentes: al generar dos canales simultáneos y controlados desde texto, se dispone de una referencia exacta de qué hablante habla y cuándo, útil para medir la precisión de herramientas de diarización en escenarios con solapamiento.
- Prototipado de personajes virtuales y videojuegos: se puede generar la conversación completa entre dos personajes con intervenciones que se pisan, evitando el efecto de turnos perfectamente secuenciales que producen otros TTS.
- Producción de audiolibros dialogados y ficción sonora en japonés: a partir de un guion con dos personajes, el sistema genera la pista estéreo con cada voz en un canal, lo que simplifica la mezcla posterior en un DAW.
- Investigación en análisis conversacional: permite generar estímulos controlados variando sistemáticamente la cantidad de solapamiento o el número de backchannels, y estudiar la percepción humana de esos fenómenos.
- Doblaje y localización de contenido hacia japonés: el textconverter facilita convertir guiones escritos a un registro hablado antes de la síntesis, reduciendo el trabajo manual de reescritura.
- Pruebas de carga en sistemas de atención al cliente o IVR en japonés: se pueden generar llamadas sintéticas bilingües entre agente y usuario con interrupciones realistas para validar la lógica de turnos antes de disponer de locuciones reales.
- Accesibilidad y comunicación aumentativa: conversión de transcripciones de reuniones a audio con dos voces diferenciadas y con el timing original aproximado, útil para revisar conversaciones en formato audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo asociado (APSIPA ASC 2026) está aceptado y pendiente de publicación ("to appear"), con preprint en arXiv:2609.07200, pero la información proporcionada no incluye métricas objetivas (MOS, WER, tasas de solapamiento correctamente generadas, comparativas con otros sistemas). No se inventan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como estimación a partir del tamaño del repositorio (4,3 GB) y de los parámetros de los componentes (acústico ~500 M, textconverter ~440 M, más realizer, gap model y códec), el conjunto completo en fp32 requiere del orden de 4-6 GB, y en fp16/bf16 en torno a 2-3 GB. Son cifras orientativas, no medidas oficiales.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4070/4080 y RTX 4090 para uso interactivo; A100 o H100 para generación por lotes y experimentos a gran escala.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 8 GB o más de VRAM; no se documentan requisitos mínimos oficiales.
- Opciones de despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI. La inferencia se realiza con el código PyTorch del repositorio GitHub llm-jp/kaburi-tts, que descarga automáticamente los pesos del códec Semantic-DACVAE-Japanese-32dim durante la síntesis. El textconverter, al derivar de llm-jp-3-440m, puede servirse con transformers estándar.
- Latencia y throughput: no disponibles. Conviene tener en cuenta que el uso de classifier-free guidance (cfg_scale=2,5) multiplica el coste de cada paso de muestreo del modelo acústico al requerir evaluación condicional e incondicional.
- Ejecución en CPU: técnicamente posible con PyTorch, pero sin datos de rendimiento publicados y previsiblemente lenta para un modelo de difusión/flow con múltiples pasos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de modelos competidores en la información proporcionada. La tabla recoge únicamente los componentes citados por el autor, que no son alternativas directas sino la base y las dependencias del sistema:

| Modelo | Rol | Parámetros | Salida | Idiomas | Licencia |
|---|---|---|---|---|---|
| KABURI-TTS | Sistema TTS dialógico de dos canales | ~500 M (acústico) más componentes auxiliares; total no disponible | Estéreo 48 kHz, dos canales simultáneos | ja | Apache 2.0 (con MIT aplicable al derivado) |
| Aratako/Irodori-TTS-500M-v2 | Modelo base del componente acústico | ~500 M | no disponible | no disponible | MIT |
| Aratako/Semantic-DACVAE-Japanese-32dim | Códec neuronal de decodificación | no disponible | 48 kHz estéreo; latente de 32 dimensiones a 25 fps | ja | MIT (no redistribuido en el repositorio) |
| llm-jp/llm-jp-3-440m | Modelo base del textconverter | ~440 M | Texto | ja | Apache 2.0 |

No se dispone de comparativas publicadas frente a otros sistemas de síntesis de diálogo con solapamiento, por lo que la comparación de rendimiento con alternativas de la misma categoría queda como no disponible.

## Limitaciones y advertencias

- La calidad de salida está acotada por el códec DACVAE empleado (32 dimensiones, 25 fps), según indica el propio autor.
- Las palabras que no aparecen en el diccionario de grafema a fonema (G2P) pueden generar pronunciaciones poco claras.
- Pueden aparecer fragmentos con prosodia poco natural.
- El control de hablante por audio de referencia funciona mejor cuando la referencia se parece a las condiciones del entrenamiento: conversación natural grabada en reuniones online, de unos 10 segundos, con la voz del hablante claramente presente. Con locuciones de estudio o lecturas, la calidad puede degradarse.
- El sistema está limitado al japonés; no hay soporte multilingüe documentado.
- Riesgo de alucinación en sentido amplio: el textconverter puede reescribir el contenido del guion al convertir estilo escrito a hablado, por lo que el texto pronunciado no tiene por qué coincidir literalmente con la entrada.
- Licencias: los pesos se distribuyen bajo Apache 2.0, pero se aplican también las condiciones de los derivados (MIT para Irodori-TTS-500M-v2, Apache 2.0 para llm-jp-3-440m) y las del códec descargado automáticamente. Hay que revisar el fichero NOTICE antes de un uso comercial.
- Las voces de referencia no se incluyen en el repositorio; los audios de demostración publicados en GitHub están sujetos a las condiciones de uso del corpus JVS.
- El autor desaconseja explícitamente usos de suplantación, fraude o generación de desinformación, y recuerda que las salidas pueden contener sesgos procedentes de los datos de entrenamiento (LLM-jp-Zoom1) y contenido inexacto o inadecuado.
- El repositorio presenta 0 descargas y 0 valoraciones, y la ficha se actualizó por última vez el 10 de septiembre de 2026: no existe aún validación independiente por parte de la comunidad.
- La información pública describe el sistema a partir de su model card; partes de la misma (por ejemplo, la sección del predictor) aparecen truncadas en los datos disponibles, por lo que algunos detalles de implementación no pueden verificarse aquí.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Daulet89/kaburi-tts
- Repositorio de código: https://github.com/llm-jp/kaburi-tts
- Tag con la versión del artículo: https://github.com/llm-jp/kaburi-tts/tree/paper-release-v1
- Preprint del artículo: https://arxiv.org/abs/2609.07200
- Modelo base del componente acústico: https://huggingface.co/Aratako/Irodori-TTS-500M-v2
- Códec de decodificación: https://huggingface.co/Aratako/Semantic-DACVAE-Japanese-32dim
- Modelo base del textconverter: https://huggingface.co/llm-jp/llm-jp-3-440m
- Condiciones de licencia de los audios de demostración: https://github.com/llm-jp/kaburi-tts/blob/main/docs/LICENSE-audio.md
- Corpus JVS: https://sites.google.com/site/shinnosuketakamichi/research-topics/jvs_corpus
