# mihuai/turkish-stt-devs

## Resumen

Mihu Turkish STT for Developers es un modelo de reconocimiento automatico del habla (ASR) en turco, desarrollado por mihuai y publicado en Hugging Face. A diferencia de los modelos ASR genericos, esta especializado en el vocabulario y las expresiones que usan los desarrolladores turcos al dictar: comandos de terminal (`git rebase`, `npm run dev`), nombres de ficheros, fragmentos de codigo y frases coloquiales de programacion. El modelo resuelve el problema del dictado por voz en entornos de desarrollo local, donde los ASR generalistas fallan al transcribir terminos tecnicos y anglicismos.

Tecnicamente se trata de un modelo tipo transducer (encoder-decoder-joiner) con arquitectura Zipformer, exportado a ONNX en cuantizacion int8 y pensado para ejecutarse en CPU mediante la libreria sherpa-onnx. Soporta reconocimiento en streaming, es decir, transcribe mientras el usuario habla, y opera integramente en local: no hay llamadas a la nube ni dependencia de un LLM. El repositorio ocupa aproximadamente 0,1 GB, lo que confirma su orientacion a despliegue ligero en dispositivos.

Su relevancia actual radica en la combinacion de tres factores: especializacion de dominio (jerga de desarrollo en turco), privacidad por diseno (el audio no sale de la maquina) y un coste computacional minimo que permite integrarlo en herramientas de dictado para editores e IDEs. Se trata, no obstante, de una version temprana segun el propio autor, probada mayoritariamente con un unico hablante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer (encoder-decoder-joiner) con encoder Zipformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de streaming, sin ventana declarada) |
| Tipos de cuantizacion | int8 (ficheros `encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx`) |
| Idiomas soportados | Turco (tr) |
| Licencia | mihu-community-license (licencia propia; fine-tuning no permitido) |
| Formato de pesos | ONNX (int8), mas `tokens.txt` |
| Frecuencia de muestreo | 16 kHz mono |
| Dimension de features | 80 |
| Metodo de decodificacion | modified_beam_search |
| Tamano del repositorio | ~0,1 GB |
| Runtime de inferencia | sherpa-onnx (CPU, on-device) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma transducer, habitual en ASR en streaming: un encoder que procesa las features acusticas (80 dimensiones, 16 kHz), un decoder que modela la secuencia de tokens y un joiner que combina ambos para producir la prediccion. El encoder emplea la arquitectura Zipformer, disenada para reducir coste computacional manteniendo precision en tareas de reconocimiento en tiempo real. Los pesos se distribuyen en formato ONNX cuantizado a int8, lo que permite inferencia en CPU con requisitos de memoria reducidos.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de ajuste como RLHF o DPO (no aplicables de forma habitual en ASR). La model card indica que el entrenamiento se orienta al habla real de desarrolladores turcos, incluyendo comandos y expresiones tecnicas, pero no se detalla la metodologia ni el origen de los datos. Tampoco se especifican innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Reconocimiento automatico del habla en turco con salida de texto en streaming (transcripcion incremental mientras se habla).
- Vocabulario especializado en jerga de desarrollo: comandos de shell, gestores de paquetes, operaciones de git y frases coloquiales de programacion en turco.
- Ejecucion integra en CPU y en local, sin conexion a servicios externos.
- Integracion con sherpa-onnx mediante `OnlineRecognizer.from_transducer` y decodificacion `modified_beam_search`.
- Entrada de audio a 16 kHz mono, compatible con ficheros WAV leidos con soundfile.
- No incluye tool calling, function calling, capacidades de agente, vision, audio bidireccional ni modo de razonamiento: es exclusivamente un modelo ASR.
- Soporte multilingue limitado al turco.

## Casos de uso

- Dictado de codigo en el IDE: el modelo transcribe comandos y fragmentos tecnicos pronunciados en turco, lo que permite escribir codigo o instrucciones sin teclado en editores que acepten entrada de voz. Su vocabulario especializado reduce errores en terminos como `git rebase` o `npm run dev`.
- Automatizacion de terminal por voz: integrado en un script local que capture audio del microfono y lo envie a sherpa-onnx, se pueden dictar comandos de shell en turco para ejecutarlos tras una confirmacion, manteniendo todo el procesamiento en la maquina.
- Asistentes de programacion con LLM local: al ejecutarse en CPU y sin nube, encaja como capa de entrada de voz para herramientas que usan modelos locales (por ejemplo, asistentes de codigo offline), preservando la privacidad del audio.
- Herramientas de accesibilidad para desarrolladores: permite a programadores con movilidad reducida dictar comandos y notas tecnicas en turco sin depender de servicios cloud.
- Documentacion y notas tecnicas por voz: transcripcion de explicaciones tecnicas o comentarios de codigo dictados en turco, utiles para generar borradores de documentacion o mensajes de commit.
- Prototipado de interfaces de voz en turco: sirve como base para experimentar con dictado en aplicaciones de escritorio o web (via ONNX Runtime) sin coste de API ni latencia de red.
- Entornos air-gapped o con requisitos de cumplimiento: al no requerir conexion, es apto para equipos de desarrollo en redes aisladas donde no se permite enviar audio a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso base, ya que el modelo esta pensado para CPU; el repositorio completo ocupa ~0,1 GB en disco.
- GPU recomendadas: no se especifican; el modelo esta optimizado para CPU mediante sherpa-onnx. Podria ejecutarse en GPU a traves de ONNX Runtime, pero no hay datos de rendimiento publicados.
- Compatibilidad con GPU de consumo: no relevante para el caso de uso previsto; cualquier CPU moderna deberia poder ejecutarlo por el tamano del modelo y la cuantizacion int8.
- Opciones de despliegue: sherpa-onnx (Python y bindings nativos), ONNX Runtime. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo ASR transducer.
- Latencia y throughput estimados: no disponibles. El diseno en streaming y la cuantizacion int8 sugieren baja latencia en CPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto / streaming | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mihuai/turkish-stt-devs | Transducer Zipformer (ONNX int8) | Turco | Streaming, on-device | mihu-community-license (fine-tuning no permitido) | Hugging Face |
| Whisper (OpenAI, variantes) | Transformer encoder-decoder | Multilingue (incluye turco) | No streaming nativo; por chunks | MIT (variantes abiertas) | Hugging Face, multiples runtimes |
| Wav2Vec2 / XLS-R (Meta) | Transformer auto-supervisado | Multilingue | No streaming nativo | MIT / CC-BY-NC segun variante | Hugging Face |
| Modelos Zipformer de sherpa-onnx (genericos) | Transducer Zipformer | Multiples idiomas | Streaming, on-device | Segun modelo | Hugging Face, k2-fsa |

La comparativa se limita a categorias generales porque no se dispone de datos de benchmarks del modelo evaluado que permitan una comparacion cuantitativa. La diferencia principal frente a Whisper y Wav2Vec2 es la especializacion en jerga de desarrollo en turco y la orientacion a streaming en CPU, a costa de no ser multilingue.

## Limitaciones y advertencias

- Version temprana: el autor indica que se ha probado mayoritariamente con un unico hablante, por lo que la robustez ante distintos acentos, generos y condiciones acusticas no esta validada.
- Dificultad con palabras cortas aisladas: la model card advierte explicitamente de que las palabras breves pronunciadas de forma independiente pueden reconocerse mal.
- Licencia restrictiva: la mihu-community-license no permite el fine-tuning del modelo. Es necesario revisar el fichero `LICENSE` para conocer las condiciones exactas de uso comercial y redistribucion antes de integrarlo en produccion.
- Un solo idioma: solo turco; no es util para dictado multilingue ni para mezclar espanol y turco.
- Riesgo de alucinacion y errores de transcripcion: como todo ASR, puede producir sustituciones plausibles, especialmente en terminos tecnicos poco frecuentes o nombres propios.
- Sin datos de benchmarks ni de sesgos: no se han publicado evaluaciones de sesgo, tasas de error por palabra (WER) ni comparaciones cuantitativas con alternativas.
- Sin soporte declarado de puntuacion, diarizacion ni marcas de tiempo: la salida es texto transcrito mediante el transducer, sin funcionalidades adicionales documentadas.
- Dependencia de sherpa-onnx: el flujo de uso documentado esta ligado a esa libreria y a sus ficheros ONNX int8.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mihuai/turkish-stt-devs
- Licencia (referenciada en la model card): fichero `LICENSE` del repositorio
- sherpa-onnx (runtime de inferencia): https://github.com/k2-fsa/sherpa-onnx
- huggingface_hub (descarga de pesos): https://huggingface.co/docs/huggingface_hub
- soundfile (lectura de audio): https://python-soundfile.readthedocs.io
