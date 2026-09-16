# lgris/orpheus-tts-zeroshot-tagarela_v2

## Resumen

Orpheus-TTS conditioned (checkpoint de 100k) es un modelo de síntesis de voz (text-to-speech) en portugués desarrollado por el usuario `lgris`, publicado en HuggingFace bajo el identificador `lgris/orpheus-tts-zeroshot-tagarela_v2`. Se trata de un ajuste fino del modelo Orpheus-TTS en modo condicionado, entrenado con el dataset `freds0/TAGARELA_v2`. El modelo realiza TTS zero-shot: recibe un audio de referencia junto con el texto pronunciado en ese audio y el nuevo texto a generar, y produce la nueva locución imitando el ritmo y el timbre de la voz de referencia. No hay datos publicados sobre el volumen del ajuste fino más allá de que corresponde al checkpoint de 100.000 pasos.

Arquitectónicamente es un transformer autoregresivo de la familia Llama (la etiqueta del repositorio es `llama`) con 3.300.867.072 parámetros totales (aproximadamente 3,3 mil millones), que genera tokens de audio en lugar de tokens de texto. La síntesis se apoya en el códec neuronal SNAC de 24 kHz (`hubertsiuzdak/snac_24khz`), que produce una representación jerárquica de tres niveles que el modelo debe predecir y que después se decodifica a onda de audio.

Su relevancia es doble: por un lado, traslada al portugués la familia Orpheus, que nació centrada en inglés, y por otro, no publica resultados de benchmarks ni detalles del dataset de entrenamiento. El repositorio, de 39,6 GB, no declara licencia, el modelo no tiene descargas ni valoraciones en el momento de redactar esta ficha y la información disponible se limita a la model card del autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo de la familia Llama (modelo de lenguaje causal que predice tokens de audio) |
| Parametros totales | 3.300.867.072 (dato extraido del repositorio en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se especifica en la model card) |
| Tipos de cuantizacion | no disponible; el ejemplo de la model card carga el modelo en fp16 (`torch_dtype=torch.float16`); no se publican pesos GGUF ni cuantizaciones INT8/INT4 |
| Idiomas soportados | portugues (pt) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Códec de audio | SNAC 24 kHz (`hubertsiuzdak/snac_24khz`), codificación jerárquica de 3 niveles |
| Dataset de ajuste | `freds0/TAGARELA_v2` |
| Tamano del repositorio | 39,6 GB |
| Pipeline declarado | text-to-speech |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un decoder transformer causal de tipo Llama con 3,3 mil millones de parámetros que opera sobre un vocabulario extendido: además de los tokens de texto, el vocabulario incluye los códigos de audio de SNAC desplazados con un `base_offset` de 128266, junto con tokens especiales de control (`start_of_human` 128259, `end_of_human` 128260, `start_of_ai` 128261, `start_of_speech` 128257, `end_of_speech` 128258, `start_of_text` 128000, `end_of_text` 128009). La entrada se construye concatenando el texto de referencia y el texto objetivo, y a continuación los códigos del audio de referencia codificado con SNAC. El modelo genera de forma autoregresiva los códigos del nuevo audio, que después se reorganizan en la estructura jerárquica de tres niveles de SNAC y se decodifican a onda de 24 kHz.

El autor indica que el ajuste se hizo exclusivamente en modo zero-shot, respetando estrictamente el formato de prompt del modelo preentrenado: no se introdujo ninguna plantilla nueva, ni etiquetas de emoción, ni control explícito de estilo. Los datos de entrenamiento proceden del dataset `freds0/TAGARELA_v2`, un corpus de habla en portugués, aunque la model card no detalla el número de horas, la composición del dataset, el proceso de filtrado ni si se aplicaron etapas de RLHF o DPO. Tampoco se documenta el número de tokens vistos durante el ajuste, más allá de la referencia al checkpoint de 100k. La innovación técnica destacable no está en el ajuste fino en sí, sino en el flujo de inferencia: la model card incorpora un bucle de reintento con `repetition_penalty=1.2` para forzar la emisión del token `end_of_speech` cuando el modelo no termina la secuencia por sí solo, un comportamiento que el propio autor reconoce como un modo de fallo recurrente.

## Capacidades

- Síntesis de voz en portugués a partir de texto, con salida de audio a 24 kHz mediante el decodificador SNAC.
- Clonación de voz zero-shot: reproduce el timbre y el ritmo de una voz de referencia a partir de un único audio de ejemplo más su transcripción.
- Transferencia de prosodia: al condicionar sobre los códigos del audio de referencia, el modelo tiende a mantener el patrón rítmico y entonativo de la muestra.
- Generación de audio con estructura jerárquica de tres niveles, lo que permite representar información gruesa (contenido) y fina (detalle acústico) por separado.
- Inferencia condicionada sin necesidad de reentrenamiento por hablante: la voz objetivo se aporta en el prompt en tiempo de ejecución.
- No dispone de soporte documentado de tool calling ni de function calling.
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso; es un modelo puramente generativo de audio.
- No dispone de capacidades de visión, audio de entrada más allá del audio de referencia, ni modo de pensamiento (*thinking mode*).
- Capacidad multilingüe: no, el modelo está etiquetado únicamente para portugués.

## Casos de uso

- Audiolibros y narración en portugués: el modelo permite generar capítulos completos manteniendo una única voz de referencia aportada como muestra, lo que da coherencia tímbrica a lo largo de toda la obra. Es adecuado porque la clonación zero-shot evita tener que entrenar un modelo por narrador.
- Doblaje y localización de contenido audiovisual al portugués: se puede usar la voz de un actor como referencia y generar las réplicas traducidas conservando el timbre. Requiere revisión humana por cuestiones de derechos de imagen y voz.
- Asistentes de voz e IVR en atención al cliente: con una voz corporativa registrada como referencia, se pueden sintetizar respuestas dinámicas en portugués sin depender de un catálogo cerrado de frases pregrabadas.
- Accesibilidad para personas con discapacidad visual: conversión de artículos, documentación o correo electrónico a audio en portugués con una voz estable y reconocible entre sesiones.
- Producción de pódcast y contenido de marketing: generación de locuciones de apoyo, cuñas o versiones alternativas de un mismo guion sin volver a grabar en estudio.
- Preservación de voz asistida: con consentimiento explícito, una persona que pierde el habla puede grabar una muestra y usar el modelo como voz personal de comunicación. Es imprescindible contar con autorización documentada del titular de la voz.
- Prototipado en investigación de TTS: sirve como punto de partida para estudiar transferencia de prosodia y timbre en portugués, o como referencia para comparar arquitecturas de clonación zero-shot.
- Videojuegos y personajes: generación de líneas de diálogo para NPC en portugués con voces diferenciadas, siempre que el estudio disponga de los derechos de las voces de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas como SIM-O, SIM-R, WER, MOS, CMOS ni evaluaciones comparativas con otros sistemas de TTS, y la búsqueda web realizada no devolvió resultados relacionados con el modelo. El repositorio cuenta con dos muestras de audio (`samples/ref1_sample1.wav` y `samples/ref2_sample1.wav`) que pueden servir como evaluación cualitativa subjetiva, pero no equivalen a una evaluación formal.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 6,6 GB solo para los pesos del modelo, más el códec SNAC de 24 kHz y la caché KV. En la práctica, un presupuesto de 8 a 12 GB de VRAM cubre generaciones de hasta 1500 tokens nuevos, que es el límite que fija el script de ejemplo.
- En fp32, los pesos ocuparían alrededor de 13,2 GB, por lo que se necesitaría una GPU de 16 GB o más; se recomienda usar fp16 o bf16.
- GPU recomendadas: A100, H100 o L40S para despliegue por lotes; RTX 4090, RTX 4080, RTX 3090 y RTX 4070 Ti para trabajo individual.
- ¿Cabe en GPU de consumo? Sí. El modelo entra en tarjetas de 16 GB y previsiblemente en algunas de 12 GB con fp16, aunque con margen ajustado si se aumentan los tokens generados. Es cómodo en cualquier GPU de 24 GB.
- Almacenamiento: el repositorio ocupa 39,6 GB, muy por encima de los ~6,6 GB que ocuparían los pesos en fp16, por lo que conviene reservar espacio en disco o descargar únicamente los ficheros necesarios.
- Opciones de despliegue: la vía documentada es `transformers` (`AutoModelForCausalLM` + `AutoTokenizer`) junto con `snac` y `torchaudio`, siguiendo el script de la model card. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, y el hecho de que la salida sea una secuencia de códigos SNAC obliga a implementar un postprocesado personalizado en cualquier servidor de inferencia.
- Latencia y throughput: no disponible. La generación es autoregresiva token a token, con un bucle de reintento de hasta 3 intentos cuando no se emite `end_of_speech`, lo que puede multiplicar el tiempo de cómputo en los casos fallidos.

## Comparativa con modelos similares

La información disponible para este repositorio no incluye métricas comparativas, y la búsqueda web no aportó datos sobre modelos alternativos. La siguiente tabla recoge únicamente los datos verificables del repositorio analizado y marca como no disponible todo lo que no se ha podido confirmar en la información proporcionada.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| lgris/orpheus-tts-zeroshot-tagarela_v2 | 3.300.867.072 | no disponible | portugues | no disponible | publicado, 0 descargas |
| Orpheus-TTS base (familia Orpheus) | no disponible en esta busqueda | no disponible | no disponible | no disponible | referenciado como modelo de partida |
| Alternativas de TTS zero-shot en portugues | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros sistemas de TTS zero-shot. Cualquier comparación con XTTS, F5-TTS, CosyVoice u otros sistemas requeriría datos que no forman parte de la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia, por lo que el uso comercial queda en un limbo legal. Es imprescindible contactar con el autor antes de integrarlo en un producto.
- Idioma único: solo portugués. No hay evidencia de que funcione correctamente en castellano ni en otras lenguas, y forzarlo probablemente degrade la pronunciación.
- Riesgo de suplantación de identidad: la clonación de voz zero-shot permite imitar a una persona a partir de un audio corto. Cualquier despliegue debe exigir consentimiento explícito del titular de la voz y cumplir la normativa aplicable sobre datos biométricos.
- Transparencia del dataset: no se documentan horas de audio, número de hablantes, procedencia, condiciones de grabación ni consentimiento de los locutores del dataset `freds0/TAGARELA_v2`.
- Sin evaluación objetiva: no hay benchmarks, ni métricas de inteligibilidad, ni comparaciones con humanos. Las dos muestras de audio publicadas no permiten extrapolar la calidad en dominios distintos.
- Modo de fallo conocido: el modelo puede no emitir el token `end_of_speech`. El propio autor mitiga esto con hasta tres reintentos y una penalización de repetición de 1,2, lo que implica que una fracción de las peticiones falla o tarda más de lo previsto.
- Alucinación acústica: como todo modelo autoregresivo de audio, puede producir pronunciaciones incorrectas, tartamudeos, ruidos o silencios anómalos, especialmente con números, siglas, nombres propios o frases muy largas.
- Longitud de contexto desconocida: al no publicarse la ventana de contexto, no hay garantía de comportamiento estable con textos largos ni con audios de referencia extensos.
- Flexibilidad de control limitada: al haber respetado estrictamente el formato del modelo preentrenado, no hay control explícito de emoción, velocidad o estilo más allá de lo que aporte el audio de referencia.
- Sin validación comunitaria: cero descargas y cero valoraciones, sin issues ni discusiones públicas que permitan contrastar el comportamiento real.
- Discrepancia de tamaño en el repositorio: 39,6 GB frente a los ~6,6 GB esperables para 3,3 mil millones de parámetros en fp16, lo que sugiere la presencia de múltiples checkpoints o pesos en mayor precisión. Conviene verificar qué ficheros se descargan.
- Metadatos anómalos: las fechas de creación y actualización del repositorio (16 de septiembre de 2026) son posteriores a la fecha habitual de trabajo actual, lo que puede indicar un error de registro o un entorno con reloj adelantado. No afecta al modelo, pero conviene tenerlo en cuenta al citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lgris/orpheus-tts-zeroshot-tagarela_v2
- Dataset de ajuste: https://huggingface.co/datasets/freds0/TAGARELA_v2
- Códec SNAC 24 kHz: https://huggingface.co/hubertsiuzdak/snac_24khz
- Muestra de audio de referencia 1: https://huggingface.co/lgris/orpheus-tts-zeroshot-tagarela_v2/resolve/main/samples/ref1_sample1.wav
- Muestra de audio de referencia 2: https://huggingface.co/lgris/orpheus-tts-zeroshot-tagarela_v2/resolve/main/samples/ref2_sample1.wav
- Paper, blog o repositorio del autor: no disponible
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces obtenidos correspondían a herramientas de creación de PDF y se han descartado.
