# joaorura/distil-whisper-large-v3-ptbr-openvino-int8

## Resumen

distil-whisper-large-v3-ptbr-openvino-int8 es una conversion a OpenVINO IR con cuantizacion INT8 del modelo freds0/distil-whisper-large-v3-ptbr, que a su vez es un ajuste fino en portugués de Brasil del modelo destilado distil-whisper/distil-large-v3. El repositorio lo publica el usuario joaorura y no aporta pesos nuevos: su unico valor anadido es el export optimizado para inferencia en CPU, GPU integrada y NPU de Intel, con compresion de pesos de 8 bits aplicada con NNCF. La licencia declarada es MIT y el idioma etiquetado es unicamente pt.

El artefacto ocupa aproximadamente 738 MB, frente a los 2,9 GB del export FP32 del mismo autor, es decir, unas cuatro veces menos. El autor ha medido tiempos de carga e inferencia sobre un Intel Core Ultra 7 265H con un audio de 8,35 segundos: en CPU la inferencia tarda entre 5,7 y 6,8 s, en GPU integrada 9,9 s y en NPU entre 2,5 y 2,8 s (con una primera compilacion de aproximadamente 122 s que se evita usando CACHE_DIR).

Es relevante porque permite desplegar reconocimiento de voz en pt-BR en hardware Intel sin GPU dedicada, incluida la NPU de los portatiles Core Ultra, con un consumo y un espacio en disco reducidos. La contrapartida es que las pruebas se hicieron con voz sintetica generada por TTS y que la perdida de precision atribuible a la cuantizacion INT8 no se ha cuantificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) de reconocimiento automatico del habla, destilado de whisper-large-v3 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; no se documenta una ventana de contexto de texto) |
| Tipos de cuantizacion | INT8 con compresion de pesos (post-entrenamiento, solo pesos; activaciones en punto flotante). Existe un export FP32 del mismo autor |
| Idiomas soportados | pt (portugues de Brasil, etiquetado como pt-BR) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (openvino_decoder_model.xml/.bin) mas tokenizer y detokenizer OpenVINO (openvino_tokenizer.*, openvino_detokenizer.*) y openvino_config.json |
| Modelo base | freds0/distil-whisper-large-v3-ptbr (relacion: quantized) |
| Tarea | automatic-speech-recognition (transcripcion) |
| Tamano del repositorio | 0,8 GB |
| Tamano del artefacto | 738 MB (INT8) frente a 2,9 GB del export FP32 |
| Libreria | openvino (openvino_genai) |
| Herramientas de conversion | optimum-intel 2.2.0, openvino 2026.4.0, openvino-genai 2026.4.0.0, nncf 3.4.0 |

## Arquitectura y entrenamiento

Se trata de un modelo de reconocimiento automatico del habla con arquitectura transformer encoder-decoder, derivado de la familia Whisper y destilado en su version large-v3. Este repositorio no entrena ni ajusta nada: parte de los pesos ya ajustados al portugués de Brasil por freds0 y los exporta a OpenVINO IR. La cuantizacion es de solo pesos, en 8 bits, aplicada en el momento del export mediante OVWeightQuantizationConfig(bits=8) de optimum-intel; las activaciones permanecen en punto flotante. El autor indica que el comando optimum-cli export openvino fallo por incompatibilidad de version con transformers 5.5.4, por lo que la conversion se hizo directamente con la API Python de optimum-intel.

El grafo exportado utiliza un unico decoder fusionado (openvino_decoder_model.xml/.bin, con use_cache: true en config.json) en lugar de grafos separados de decoder y decoder-with-past, y se generan el tokenizer y el detokenizer en formato OpenVINO para poder usar el modelo con openvino_genai.WhisperPipeline. El archivo openvino_config.json registra los metadatos de la cuantizacion NNCF empleada. No se documentan en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Transcripcion de voz a texto en portugues de Brasil, mediante la tarea "transcribe" de la configuracion de generacion.
- Fijacion explicita del idioma a traves del token especial (<|pt|>) en gen_config.language, y seleccion de tarea mediante gen_config.task.
- Inferencia en tres tipos de dispositivo Intel con el mismo artefacto: CPU, GPU integrada y NPU.
- Aprovechamiento de la cache del compilador en NPU mediante la opcion CACHE_DIR, que evita recompilar el modelo en cada ejecucion.
- Integracion directa con openvino_genai.WhisperPipeline y con la API Python de optimum-intel.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generativo ni modo de pensamiento; es un modelo puramente ASR.
- No se documenta soporte multilingue: la etiqueta de idioma es solo pt.

## Casos de uso

- Transcripcion de audio en produccion sobre infraestructura Intel sin GPU dedicada: al ser un artefacto INT8 de 738 MB que funciona en CPU con tiempos de inferencia de 5,7 a 6,8 s para 8,35 s de audio, encaja en servidores o equipos de escritorio con CPU Intel reciente donde no se justifica una GPU.
- Subtitulado de video en portugues de Brasil: el modelo puede generar la pista de texto a partir de la banda sonora y el resultado exportarse a SRT/VTT; su tamano reducido permite ejecutarlo en la misma maquina que hace el montaje.
- Asistentes de voz locales en portatiles con NPU Intel: con 2,5 a 2,8 s de inferencia para 8,35 s de audio (relacion audio/proceso aproximada de 0,30 a 0,34 derivada de las mediciones publicadas), la NPU libera la CPU y reduce el consumo frente a una ejecucion en CPU.
- Post-procesado de llamadas de contact center en pt-BR: transcripcion por lotes de grabaciones en equipos de oficina con CPU Intel, sin depender de APIs en la nube ni de tarjetas graficas.
- Actas y notas de reunion con requisitos de privacidad: al ejecutarse integramente en local sobre CPU, GPU integrada o NPU, el audio no sale del dispositivo, lo que simplifica el cumplimiento de politicas de datos.
- Accesibilidad y subtitulado asistido en quioscos o terminales de bajo consumo: el peso del artefacto (738 MB) permite incluirlo en imagenes de sistema de dispositivos con almacenamiento limitado.
- Prototipado e investigacion en edge AI: sirve como banco de pruebas para medir el comportamiento de un modelo destilado cuantizado a INT8 en las tres unidades de computo de un SoC Intel dentro del ecosistema openvino_genai.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (WER, MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El modelo es de reconocimiento de voz, por lo que la metrica relevante seria la tasa de error por palabra, y el autor no la reporta; ademas advierte que las pruebas se hicieron con voz sintetica generada por TTS y no con habla humana grabada.

Lo unico publicado son mediciones de tiempo de carga e inferencia sobre un Intel Core Ultra 7 265H con un audio de prueba de 8,35 segundos:

| Dispositivo | Tiempo de carga | Tiempo de inferencia | Observaciones |
|---|---|---|---|
| CPU | 1,9-3,7 s | 5,7-6,8 s | Medicion sobre el build INT8 |
| GPU integrada | 6,5 s | 9,9 s | Medicion sobre el build INT8 |
| NPU | 2,6-4,4 s | 2,5-2,8 s | Primera compilacion de aproximadamente 122 s; las ejecuciones posteriores usan la cache de CACHE_DIR |

## Requisitos de hardware

- Almacenamiento: 738 MB para el artefacto INT8, frente a 2,9 GB del export FP32 equivalente, segun las cifras del autor.
- VRAM: no disponible una cifra oficial. El modelo esta pensado para ejecutarse en CPU, GPU integrada o NPU de Intel, no en GPUs dedicadas NVIDIA o AMD.
- CPU: medido en un Intel Core Ultra 7 265H, con 1,9-3,7 s de carga y 5,7-6,8 s de inferencia sobre 8,35 s de audio. No se documentan requisitos minimos de CPU ni de memoria RAM.
- GPU integrada Intel: 6,5 s de carga y 9,9 s de inferencia en el mismo equipo, es decir, mas lento que la CPU en esta medicion.
- NPU Intel: 2,5-2,8 s de inferencia y 2,6-4,4 s de carga, con una primera compilacion de aproximadamente 122 s. Es la opcion mas rapida de las tres medidas, y se recomienda configurar CACHE_DIR para no recompilar en cada ejecucion.
- GPU dedicadas de consumo (RTX 4090 y similares): no aplica; el artefacto es OpenVINO IR y no esta pensado para CUDA.
- Opciones de despliegue: openvino_genai.WhisperPipeline (dispositivos CPU, GPU y NPU) y la API Python de optimum-intel. No se ofrecen pesos en safetensors, GGUF ni formatos compatibles con llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: no se publica throughput (audio procesado por segundo de computo ni peticiones concurrentes); solo los tiempos por ejecucion indicados arriba.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y tamano | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joaorura/distil-whisper-large-v3-ptbr-openvino-int8 (este modelo) | no disponible | OpenVINO IR INT8, 738 MB | Sin WER; inferencia de 2,5-6,8 s para 8,35 s de audio segun dispositivo | MIT | HuggingFace, requiere runtime OpenVINO |
| freds0/distil-whisper-large-v3-ptbr | no disponible | Pesos originales en PyTorch (tamano no disponible) | No disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace; es el modelo base del que procede este export |
| joaorura/distil-whisper-large-v3-ptbr-openvino (FP32) | no disponible | OpenVINO IR FP32, 2,9 GB | No disponible; sin cuantizar | MIT | HuggingFace, mismo autor y mismo pipeline |
| distil-whisper/distil-large-v3 | no disponible | Pesos originales en PyTorch (tamano no disponible) | No disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace; modelo del que deriva el ajuste al portugues |

## Limitaciones y advertencias

- Cobertura de idioma restringida: la etiqueta de idioma es solo pt, con orientacion a portugues de Brasil. No hay evidencia en la informacion disponible de un rendimiento aceptable en portugues europeo ni en otros idiomas.
- Evaluacion insuficiente: las pruebas se hicieron con voz sintetica generada por TTS, no con habla humana grabada, por lo que el comportamiento en audio real (ruido de fondo, acentos, solapamiento de hablantes, canales telefonicos) no esta caracterizado.
- Perdida de precision no cuantificada: la compresion de pesos INT8 puede introducir una degradacion adicional frente al export FP32, y el autor indica explicitamente que no la ha medido por separado.
- Dependencia total del modelo base: la calidad de transcripcion es la de freds0/distil-whisper-large-v3-ptbr; este repositorio no mejora ni modifica los pesos originales.
- Ausencia de benchmarks: no se publica WER ni ninguna otra metrica de calidad, de modo que no es posible comparar objetivamente con alternativas sin evaluarlo uno mismo.
- Riesgo de alucinacion: la familia Whisper es propensa a generar texto repetitivo o inventado en segmentos con silencio, ruido o habla poco inteligible; no se documenta ningun mecanismo de mitigacion en este export.
- Sensibilidad a versiones: la conversion requirio optimum-intel 2.2.0, openvino 2026.4.0, openvino-genai 2026.4.0.0 y nncf 3.4.0, y el propio comando de exportacion de la CLI fallo por incompatibilidad con transformers 5.5.4. Reproducir el proceso con otras versiones puede no dar el mismo resultado.
- Licencia: el repositorio declara MIT, lo que en principio permite uso comercial, pero el modelo base figura con licencia no disponible en la informacion proporcionada, por lo que conviene verificar la cadena de licencias antes de un despliegue comercial.
- Alcance funcional: al ser un modelo ASR, no soporta generacion de texto libre, tool calling, agentes ni razonamiento multi-paso; no debe plantearse como sustituto de un modelo de lenguaje.
- Portabilidad: el artefacto es OpenVINO IR, por lo que queda atado al runtime de OpenVINO y a hardware Intel para el que se han documentado mediciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joaorura/distil-whisper-large-v3-ptbr-openvino-int8
- Version FP32 del mismo autor: https://huggingface.co/joaorura/distil-whisper-large-v3-ptbr-openvino
- Modelo base (ajuste al portugues de Brasil): https://huggingface.co/freds0/distil-whisper-large-v3-ptbr
- Perfil del autor del modelo base: https://huggingface.co/freds0
- Modelo destilado original: https://huggingface.co/distil-whisper/distil-large-v3
