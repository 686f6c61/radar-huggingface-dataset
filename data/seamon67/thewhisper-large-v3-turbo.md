# seamon67/thewhisper-large-v3-turbo

## Resumen

thewhisper-large-v3-turbo (repositorio de seamon67) es una variante optimizada y cuantizada a BF16 del modelo TheStageAI/thewhisper-large-v3-turbo, que a su vez es un ajuste fino de openai/whisper-large-v3-turbo. Se trata, por tanto, de un modelo derivado de tercer nivel: la arquitectura original es la de Whisper (encoder-decoder transformer) de OpenAI, y sobre ella TheStage AI aplica su conjunto de optimizaciones (ElasticModels, generadas por su acelerador ANNA) para reducir latencia y consumo en tareas de reconocimiento automatico del habla (ASR). El autor del repositorio aqui descrito publica una version cuantizada a BF16 con empaquetado CoreML.

El modelo resuelve el problema de la transcripcion de voz a texto multilingue en tiempo real y en el propio dispositivo. Con aproximadamente 809 millones de parametros y un tamano de repositorio de 1,6 GB, esta pensado para ejecutarse en hardware Apple Silicon (Neural Engine / GPU / CPU via CoreML) y en GPU NVIDIA, con enfasis en baja latencia, bajo consumo y streaming continuo. Es relevante ahora porque combina un tamano contenido con soporte para 27 idiomas y despliegue on-device, lo que permite integrar ASR de calidad en aplicaciones moviles y de escritorio sin depender de un servidor en la ruta critica.

La licencia es CC-BY-4.0, lo que permite uso comercial con atribucion. El acceso a los motores CoreML y a las herramientas de despliegue de TheStage AI requiere un token de acceso de dicha plataforma, un caveat operativo importante que se detalla mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), variante "turbo" |
| Parametros totales | 808.878.080 (~809 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | Ventana de audio de 10 s por segmento segun la model card (el audio largo se divide en ventanas); contexto de texto del decodificador no especificado en la informacion disponible |
| Tipos de cuantizacion | BF16 (cuantizacion declarada por el autor); empaquetado CoreML para Apple Silicon |
| Idiomas soportados | 27: en, ar, bg, bn, cs, da, de, el, es, et, fi, fr, hi, hu, id, it, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, uk, vi |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors y CoreML (library_name: coreml) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OpenAI Whisper en su variante large-v3-turbo: un transformer encoder-decoder con decodificador reducido (la version turbo recorta el numero de capas del decodificador respecto a large-v3 completo), orientado a transcripcion y traduccion de voz. Sobre esa base, TheStage AI produce una familia de modelos "ElasticModels" mediante su acelerador ANNA, que permite controlar tamano, latencia y calidad desplazando distintos algoritmos de compresion a distintas capas. Esa familia se organiza en cuatro niveles declarados: XL (matematicamente equivalente, optimizado con su compilador DNN), L (degradacion menor del 1 % en los benchmarks correspondientes), M (degradacion menor del 1,5 %) y S (degradacion menor del 2 %).

El modelo aqui descrito anade una capa adicional: ha sido cuantizado a BF16 desde TheStageAI/thewhisper-large-v3-turbo y empaquetado para CoreML, de modo que pueda ejecutarse en el Neural Engine, la GPU o la CPU de dispositivos Apple. No se detallan en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO especificas para este ajuste. La model card remite a la tarjeta del modelo original para mas detalles sobre el entrenamiento de la variante de TheStage AI.

## Capacidades

- Reconocimiento automatico del habla (ASR) multilingue en 27 idiomas, incluido el espanol.
- Transcripcion por lotes (batch) de audio a 16 kHz mono en formato Float con muestras en el rango [-1.0, 1.0].
- Transcripcion en streaming en vivo con partials que crecen de forma monotona, pensada para interfaces de subtitulado en tiempo real.
- Segmentacion automatica de audio largo en ventanas (10 s en los motores turbo publicados) con solapamiento configurable.
- VAD interno opcional (use_internal_vad) y metodo flush() para mantener la latencia plana en turnos largos; cancel() para interrupciones (barge-in).
- Ejecucion totalmente on-device en Apple Silicon (Neural Engine / GPU / CPU) y en GPU NVIDIA.
- Despliegue como contenedor Docker con API compatible con OpenAI, segun la model card.
- No se menciona soporte de tool calling, function calling, agentes ni vision en la informacion disponible.

## Casos de uso

- Subtitulado en vivo en aplicaciones iOS y macOS: el modo streaming con partials permite mostrar texto que crece mientras se habla, con flush() en las pausas detectadas por VAD para mantener baja la latencia en intervenciones largas.
- Notas de voz y transcripcion de reuniones: el modelo divide audio largo en ventanas de 10 s con solapamiento configurable, lo que permite transcribir conversaciones extensas sin enviar audio a un servidor.
- Asistentes de voz offline: al ejecutarse integramente en el dispositivo (CoreML en Apple Silicon o GPU NVIDIA), es adecuado para asistentes que deben funcionar sin conexion y con baja latencia.
- Analisis de llamadas de atencion al cliente: el soporte de 27 idiomas facilita transcribir conversaciones multilingues para su posterior analisis y generacion de resumenes en otro sistema.
- Accesibilidad para personas con discapacidad auditiva: los subtitulos parciales y finales por turno permiten construir aplicaciones de apoyo a la comunicacion en tiempo real.
- Transcripcion por lotes en infraestructura NVIDIA: con el contenedor Docker y la API compatible con OpenAI, puede integrarse en pipelines de procesamiento de audio a gran escala.
- Preprocesado de audio para pipelines de IA: la transcripcion puede alimentar sistemas posteriores de resumen, clasificacion o busqueda sobre contenido hablado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (WER, MMLU, HumanEval u otros) en la informacion disponible para este repositorio concreto. La model card del modelo base de TheStage AI solo declara umbrales de degradacion relativos para su familia de variantes: menos del 1 % para L, menos del 1,5 % para M y menos del 2 % para S, sin especificar los benchmarks ni los valores absolutos asociados.

## Requisitos de hardware

- Huella de pesos BF16: aproximadamente 1,6 GB (coincide con el tamano del repositorio), lo que permite inferencia en GPU de consumo con holgura.
- GPU NVIDIA soportadas segun la model card: L40s, RTX 4090, RTX 5090 y H100.
- Entorno NVIDIA: Python 3.10-3.12, CPU Intel/AMD x86_64, CUDA 12.8+.
- Apple Silicon: Mac con Apple Silicon o iPhone/iPad fisicos; macOS 15.0+, iOS 18.0+, Xcode 16.0+, Swift 6.0+ (Flutter 3.24+ opcional). El simulador no esta soportado.
- Ejecucion on-device en Apple: seleccion automatica de Neural Engine, GPU o CPU.
- Opciones de despliegue: SDK de Apple (Swift/Flutter, CoreML), ElasticModels o TheWhisper SpeechKit para Python en NVIDIA, y contenedor Docker con API compatible con OpenAI.
- VRAM y throughput estimados: no disponibles. No se publican cifras de latencia ni de throughput en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Idiomas | Licencia | Despliegue destacado |
|---|---|---|---|---|---|
| seamon67/thewhisper-large-v3-turbo | ~809 M | 10 s por segmento (model card) | 27 | CC-BY-4.0 | CoreML (Apple Silicon) y NVIDIA |
| TheStageAI/thewhisper-large-v3-turbo (modelo base) | no disponible en la informacion | 10 s (motores turbo) | 27 | no disponible en la informacion | NVIDIA y Apple |
| openai/whisper-large-v3-turbo | ~809 M (variante turbo) | 30 s estandar de Whisper | multilingue | no disponible en la informacion | PyTorch, vLLM, etc. |
| openai/whisper-large-v3 | ~1,55 B | 30 s estandar de Whisper | multilingue | no disponible en la informacion | PyTorch |

Nota: los datos de los modelos de OpenAI y del modelo base de TheStage AI proceden de conocimiento general de la categoria y no estan detallados en la informacion proporcionada, por lo que deben verificarse en sus respectivas tarjetas antes de usarse como referencia definitiva.

## Limitaciones y advertencias

- Este repositorio es una cuantizacion a BF16 y un empaquetado CoreML de un modelo de terceros; la calidad final depende de la cuantizacion y puede diferir de la del modelo base.
- No se publican cifras absolutas de WER ni resultados de benchmarks verificables en la informacion disponible; no deben asumirse niveles de precision concretos.
- La compresion de la familia ElasticModels implica degradaciones declaradas de hasta el 2 % en la variante S; conviene comprobar en que nivel se situa el modelo usado.
- El uso del SDK de Apple y de los motores CoreML requiere un token de acceso de TheStage AI; la inicializacion se verifica en linea, por lo que el arranque en modo offline puede fallar hasta reconectar.
- El simulador de Apple no esta soportado: es necesario ejecutar en hardware Apple Silicon real.
- La ventana de procesamiento es de 10 s por segmento en los motores turbo publicados, lo que condiciona el diseno de aplicaciones de audio largo.
- La licencia CC-BY-4.0 exige atribucion; conviene revisar las condiciones de uso comercial en funcion de la cadena de modelos derivados.
- Riesgo de alucinacion y errores de transcripcion en audio con ruido, acentos marcados, vocabulario especializado o solapamiento de voces, comun en modelos ASR.
- No se documentan sesgos especificos del modelo en la informacion proporcionada, pero pueden heredarse los del modelo original de OpenAI.
- No se mencionan capacidades de tool calling, agentes ni vision, por lo que no deben asumirse.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/seamon67/thewhisper-large-v3-turbo
- Modelo base (TheStage AI): https://huggingface.co/TheStageAI/thewhisper-large-v3-turbo
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- Proyecto GitHub TheWhisper: https://github.com/TheStageAI/TheWhisper/tree/main
- SDK de Apple de TheStage AI: https://github.com/TheStageAI/AppleSDK
- Documentacion de TheStage AI: https://docs.thestage.ai
- Portal de tokens de TheStage AI: https://app.thestage.ai
