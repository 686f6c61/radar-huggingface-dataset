# circulus/whisper-base-int8-ov

## Resumen

circulus/whisper-base-int8-ov es un artefacto de inferencia derivado de openai/whisper-base: no es un modelo entrenado desde cero, sino una exportacion a OpenVINO IR del checkpoint original con los pesos comprimidos a INT8. Lo publica el usuario circulus dentro del material didactico "ARCademy OpenVINO courseware" (leccion 06, reconocimiento de voz con Whisper) y se genera de forma automatizada con el script `convert/convert_all.py` de dicho curso. El objetivo es disponer de un ASR ligero, portable y de bajo consumo que se ejecute en CPU, iGPU o NPU de Intel sin necesidad de GPU dedicada.

El modelo hereda la arquitectura seq2seq encoder-decoder de Whisper, con aproximadamente 74 millones de parametros en su version original y una ventana de audio fija de 30 segundos procesada como espectrograma log-Mel de 80 canales a 16 kHz. La cuantizacion INT8 reduce el artefacto a 79 MB, lo que lo hace adecuado para despliegues en el borde, portatiles y entornos con memoria limitada.

Su relevancia es practica: es una de las formas mas sencillas de integrar transcripcion multilingue en aplicaciones Python mediante `openvino_genai.WhisperPipeline`, sin dependencias de PyTorch en tiempo de ejecucion. Como contrapartida, el repositorio no documenta idiomas, benchmarks ni evaluacion de la perdida de precision introducida por la cuantizacion, y la licencia declarada ("other") no coincide con la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) para ASR; 6 capas de encoder y 6 de decoder, d_model 512 (heredado del modelo base) |
| Parametros totales | ~74 M en el modelo base openai/whisper-base; el artefacto INT8 ocupa 79 MB (repo de 0,1 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio fija de 30 s (1500 fotogramas log-Mel de 80 canales); contexto de texto del decoder de 448 tokens (heredado del modelo base) |
| Tipos de cuantizacion | INT8 por compresion de pesos (weight compression con optimum) |
| Idiomas soportados | no disponible en la model card; el modelo base openai/whisper-base es multilingue |
| Licencia | other (segun HuggingFace); el modelo base openai/whisper-base se distribuye bajo licencia MIT |
| Formato de pesos | OpenVINO IR (.xml + .bin), INT8, para `openvino_genai.WhisperPipeline` |
| Entrada de audio | muestras float mono a 16 kHz |
| Tarea declarada | reconocimiento automatico de voz (pipeline no especificado en HuggingFace) |
| Modelo base | openai/whisper-base |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper: un transformer encoder-decoder que recibe un espectrograma log-Mel de 80 canales calculado sobre ventanas de 30 segundos a 16 kHz y genera texto de forma autorregresiva con tokens especiales que controlan la tarea (transcripcion, traduccion al ingles, identificacion de idioma y prediccion de marcas temporales). El modelo base fue entrenado por OpenAI con supervision debil sobre un corpus a gran escala de audio web, sin RLHF ni DPO posteriores, y su entrenamiento multitarea le permite resolver varias tareas con el mismo conjunto de pesos.

Este repositorio concreto no ha sido reentrenado ni ajustado: la model card indica unicamente una exportacion a OpenVINO IR y una compresion de pesos a INT8 mediante optimum. Por tanto, todos los conocimientos y sesgos provienen del checkpoint original, y la unica transformacion aplicada es la cuantizacion, cuyo impacto real sobre la tasa de error de palabra no se documenta en la informacion disponible. No se mencionan innovaciones adicionales como decodificacion especulativa, atencion lineal ni variantes de muestreo.

## Capacidades

- Transcripcion de voz a texto en la ventana de 30 segundos propia del modelo base, con posibilidad de encadenar ventanas para audio largo mediante logica externa de troceado.
- Traduccion de audio a ingles (tarea X->en) gracias a los tokens de tarea heredados del checkpoint original.
- Identificacion del idioma hablado y prediccion de marcas temporales a nivel de segmento o palabra, si se usa una decodificacion compatible.
- Robustez frente a ruido de fondo y acentos variados, caracteristica documentada del modelo base por su entrenamiento con audio web heterogeneo.
- Capacidad multilingue heredada del modelo base, aunque la lista concreta de idiomas no se especifica en este repositorio.
- Ejecucion en dispositivos Intel (CPU, iGPU, NPU) mediante OpenVINO GenAI, con entrada de audio float mono a 16 kHz.
- No soporta tool calling, function calling, agentes, vision, audio generation ni razonamiento multi-paso: es exclusivamente un modelo de reconocimiento de voz.

## Casos de uso

- Transcripcion de reuniones y notas de voz en local: al pesar 79 MB en INT8, puede ejecutarse en el portatil del usuario sin enviar audio a servicios externos, lo que simplifica el cumplimiento de RGPD en entornos corporativos.
- Subtitulado automatico de contenido audiovisual: el modelo permite obtener texto con marcas temporales que se pueden formatear como SRT/VTT, troceando el audio en segmentos de 30 segundos antes de pasarlos al pipeline.
- Asistentes de voz para aplicaciones de escritorio: integrado con `openvino_genai.WhisperPipeline` sobre CPU o NPU, sirve como primera etapa ASR de un pipeline de comandos o dictado en tiempo real.
- Accesibilidad y dictado para personas con movilidad reducida: la inferencia en el propio equipo evita la latencia de red y mantiene el contenido sensible fuera de la nube.
- Indexacion y busqueda de archivos de audio: transcripcion por lotes de grabaciones de llamadas o podcasts para alimentar un indice de texto o un motor de busqueda interno.
- Prototipado docente y experimentacion: es el artefacto de referencia de la leccion 06 del curso ARCademy, pensado para que estudiantes comparen el mismo modelo en FP32 e INT8 y midan el equilibrio entre tamano, latencia y calidad.
- Preprocesado en pipelines de datos: transcripcion masiva en servidores sin GPU para generar datasets de texto a partir de audio, donde el coste por hora de CPU es la restriccion principal.
- Traduccion de audio a ingles en flujos de documentacion: utiles para convertir entrevistas o charlas en texto ingles de forma rapida antes de un postprocesado humano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tasas de error de palabra (WER), comparaciones con el checkpoint FP32 ni mediciones de latencia o throughput para la version INT8. Cualquier cifra de calidad deberia obtenerse evaluando el artefacto sobre un conjunto propio (por ejemplo LibriSpeech o Common Voice) y comparandola con `openai/whisper-base` sin cuantizar.

## Requisitos de hardware

- VRAM: inferior a 1 GB en INT8 (artefacto de 79 MB mas activaciones y buffers de decodificacion); el modelo FP32 equivalente necesita del orden de varios cientos de MB.
- Cabe en cualquier GPU de consumo y, sobre todo, en CPU moderna sin acelerador dedicado; es uno de los puntos fuertes de esta exportacion.
- GPU recomendadas: no requiere GPU. Aprovecha iGPU Intel integradas, NPU de procesadores Intel Core Ultra y, opcionalmente, GPUs Intel Arc o cualquier dispositivo soportado por OpenVINO.
- Despliegue: `openvino_genai.WhisperPipeline(model_dir, device)` como via principal; tambien es posible usarlo a traves de las utilidades de optimum-intel y del runtime de OpenVINO. No es compatible directamente con llama.cpp, Ollama, vLLM ni TGI, que esperan otros formatos de pesos.
- Latencia y throughput: no disponibles. Dependen del dispositivo, del backend de compresion de pesos y de la longitud del audio; deben medirse en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| circulus/whisper-base-int8-ov | ~74 M (heredados) | 30 s | OpenVINO IR INT8, 79 MB | other (base MIT) | Solo inferencia con OpenVINO; sin benchmarks publicados |
| openai/whisper-base | ~74 M | 30 s | safetensors / PyTorch FP32 | MIT | Referencia de calidad del que deriva este artefacto |
| openai/whisper-small | ~244 M | 30 s | safetensors / PyTorch | MIT | Mayor precision esperada a costa de mas memoria y latencia |
| openai/whisper-tiny | ~39 M | 30 s | safetensors / PyTorch | MIT | Mas rapido y ligero, con menor calidad de transcripcion |
| faster-whisper (CTranslate2) base | ~74 M | 30 s | CTranslate2, incluye INT8 | MIT (base) | Alternativa madura para CPU con decodificacion optimizada |

Los recuentos de parametros corresponden a las familias publicas de Whisper y no a mediciones realizadas sobre este repositorio. No se dispone de datos de calidad comparada para la variante INT8.

## Limitaciones y advertencias

- No hay benchmarks publicados: se desconoce la degradacion de WER causada por la compresion INT8 frente al checkpoint original en FP32.
- Ventana de audio fija de 30 segundos: el audio mas largo debe trocearse y recomponerse externamente, lo que puede introducir errores en los limites de los segmentos.
- Riesgo de alucinacion: como cualquier modelo Whisper, puede inventar texto en pasajes con silencio, ruido extremo o musica, y repetir frases en bucles de decodificacion.
- Sesgos heredados del entrenamiento con audio web: peor rendimiento en variedades dialectales, habla con acentos poco representados y dominios especializados (terminologia medica o legal).
- Idiomas soportados no documentados en este repositorio: conviene validar el idioma objetivo antes de usarlo en produccion.
- Licencia "other" declarada en HuggingFace, mientras que el modelo base es MIT: es imprescindible aclarar los terminos aplicables antes de un uso comercial.
- Formato OpenVINO IR: no es portable a otros runtimes sin reconversion, lo que ata el despliegue al ecosistema OpenVINO.
- Repositorio sin descargas ni likes y sin mantenimiento aparente: no hay garantia de soporte, actualizaciones ni correccion de errores.
- Uso exclusivamente ASR: no soporta tool calling, agentes, vision ni generacion de texto libre, por lo que no debe plantearse como sustituto de un LLM.

## Enlaces

- Repositorio del modelo: https://huggingface.co/circulus/whisper-base-int8-ov
- Modelo base: https://huggingface.co/openai/whisper-base
- Repositorio de referencia de Whisper: https://github.com/openai/whisper
- Articulo de Whisper (Robust Speech Recognition via Large-Scale Weak Supervision): https://arxiv.org/abs/2212.04356
- Documentacion de OpenVINO GenAI (pipeline de Whisper): https://github.com/openvinotoolkit/openvino.genai
- optimum-intel (compresion de pesos y exportacion): https://github.com/huggingface/optimum-intel
- Herramienta de conversion del curso ARCademy (`convert/convert_all.py`): no disponible como enlace publico en la informacion proporcionada
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores corresponden a recursos canonicos del modelo base y del ecosistema OpenVINO.
