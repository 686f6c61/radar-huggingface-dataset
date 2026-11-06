# espnet/owsm_ctc_v4_1B

## Resumen

OWSM-CTC v4 (1B) es un modelo fundacional de voz de tipo encoder-only desarrollado por el equipo ESPnet (WavLab, Carnegie Mellon University). Forma parte de la familia Open Whisper-style Speech Model (OWSM), la primera reproduccion completamente abierta del paradigma de entrenamiento de Whisper, construida exclusivamente con datos publicos y herramientas de codigo abierto. Este modelo concreto implementa la variante CTC (Connectionist Temporal Classification) descrita en Peng et al. (ACL 2024), basada en CTC auto-condicionado jerarquico multi-tarea.

A diferencia de los modelos encoder-decoder, OWSM-CTC resuelve reconocimiento de voz multilingue, traduccion de voz (any-to-any) e identificacion de idioma dentro de un unico modelo no autorregresivo. Esta disenado para inferencia eficiente: una sola pasada del encoder con decodificacion best-path (greedy) sustituye la busqueda autoregresiva, lo que reduce drasticamente la latencia. El modelo tiene aproximadamente 1.000 millones de parametros y se entreno durante tres epocas sobre 320.000 horas de audio publico multilingue (dataset YODAS OWSM v4).

Su relevancia actual radica en tres factores: es totalmente abierto (pesos, codigo, recetas y datos), obtuvo el Best Student Paper Award en INTERSPEECH 2025 con el paper de OWSM v4, y su licencia CC-BY-4.0 permite uso comercial con atribucion. Ademas, existen conversiones GGUF mantenidas por terceros para inferencia en CPU sin Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only con CTC auto-condicionado jerarquico multi-tarea (self-conditioned CTC) |
| Parametros totales | aproximadamente 1.000 millones (1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | audio fijo de 30 s por ventana; audio largo mediante decodificacion bufferizada con contexto izquierdo/derecho configurable (por ejemplo 4 s) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; existen builds GGUF mantenidos por terceros (audio-cpp/audio.cpp-gguf) |
| Idiomas soportados | multilingue (sin listado cerrado de idiomas en la informacion disponible) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | pesos ESPnet (repo de 4,0 GB); conversiones GGUF externas disponibles |
| Frecuencia de muestreo | 16 kHz |
| Tareas | ASR, traduccion de voz any-to-any, identificacion de idioma |

## Arquitectura y entrenamiento

OWSM-CTC v4 es un transformer solo-encoder que aplica CTC auto-condicionado jerarquico multi-tarea. En lugar de generar tokens de forma autorregresiva, el modelo produce directamente la secuencia de salida mediante CTC, con etapas intermedias auto-condicionadas que refuerzan la representacion en distintas profundidades de la red. La tarea y el idioma se controlan mediante simbolos especiales de entrada (`lang_sym` y `task_sym`, por ejemplo `<eng>` y `<asr>`), lo que permite un unico conjunto de pesos para ASR, traduccion de voz e identificacion de idioma.

El entrenamiento se realizo durante tres epocas sobre 320.000 horas de audio publico, empleando el dataset curado `espnet/yodas_owsmv4`, publicado junto al modelo. La receta de entrenamiento esta disponible en el repositorio de ESPnet (`egs2/owsm_ctc_v4/s2t1`). El modelo se entrena con audio a 16 kHz y ventanas fijas de 30 s; para audio mas largo se emplea decodificacion bufferizada con solapamiento y contexto configurable. No se detalla en la informacion disponible el uso de RLHF o DPO, algo poco habitual en modelos CTC no generativos.

## Capacidades

- Reconocimiento automatico de voz (ASR) multilingue con decodificacion CTC best-path o busqueda de prefijos con beam search.
- Traduccion de voz any-to-any (ST): traduccion directa de audio en un idioma a texto en otro, sin pipeline intermedio de transcripcion y traduccion.
- Identificacion de idioma (LID) a partir del audio.
- Decodificacion de audio largo mediante bufferizado con contexto izquierdo y derecho configurable.
- Alineamiento forzado CTC (`ctc-segmentation`) para obtener marcas temporales a nivel de palabra o segmento sobre audio de longitud arbitraria.
- Inferencia por lotes (batched inference) para procesar varias grabaciones o fragmentos en paralelo.
- No es un modelo generativo de texto libre ni soporta tool calling, agentes ni razonamiento multi-paso; su ambito es exclusivamente voz a texto.

## Casos de uso

- Transcripcion multilingue de reuniones y conferencias: el modelo procesa audio de cualquier duracion mediante `decode_long` con bufferizado y contexto de 4 s, generando transcripciones por segmentos sin necesidad de un pipeline externo de segmentacion.
- Subtitulado automatico de video: combinado con alineamiento forzado CTC (`CTCSegmentation`), permite obtener marcas temporales precisas por palabra sobre pistas de audio largas, adecuado para generar subtitulos sincronizados.
- Traduccion directa de voz a texto: en escenarios de interpretacion (por ejemplo, audio en un idioma de origen y salida de texto en otro), el modelo evita la cascada ASR + traduccion y reduce la latencia y la propagacion de errores.
- Enrutamiento por idioma en centros de atencion: la capacidad de LID permite clasificar llamadas entrantes por idioma antes de derivarlas al agente o al modelo de transcripcion adecuado.
- Indexacion y busqueda de archivos de audio: transcripcion masiva por lotes de archivos de audio para construir indices de busqueda textual sobre grabaciones de archivo, podcasts o material audiovisual.
- Despliegue en CPU o entornos sin GPU: las conversiones GGUF externas (`owsm-ctc-v4-1b` en audio-cpp/audio.cpp-gguf) permiten ejecutar el modelo sin Python ni CUDA, util para dispositivos de borde o servidores sin acelerador.
- Analisis de calidad y cumplimiento en centros de llamadas: transcripcion no autorregresiva de bajo coste computacional para auditar conversaciones a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara metricas CER, BLEU y accuracy, pero no se incluyen valores numericos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: con aproximadamente 1B parametros, en fp32 los pesos ocupan unos 4 GB; en fp16/bfloat16 unos 2 GB; las builds GGUF externas permiten reducir aun mas el consumo en CPU.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM es suficiente para inferencia en fp16; para decodificacion por lotes con `batch_size` alto (16-32) se recomienda A100, H100 o RTX 4090.
- GPU de consumo: cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4070, RTX 4080 y RTX 4090; tambien en GPUs con 8 GB usando fp16.
- Opciones de despliegue: ESPnet (`espnet2.bin.s2t_inference.Speech2Text`) con PyTorch; Flash Attention opcional (`use_flash_attn=True`) para mayor eficiencia en float16 o bfloat16; audio.cpp con GGUF para CPU sin Python.
- Latencia y throughput: no disponibles de forma numerica en la informacion proporcionada; la decodificacion best-path requiere una sola pasada del encoder y es sustancialmente mas rapida que la busqueda de prefijos CTC o que un decoder autorregresivo.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto de audio | Tareas | Licencia |
|---|---|---|---|---|---|
| OWSM-CTC v4 1B | aproximadamente 1B | encoder-only CTC | 30 s por ventana, bufferizado para audio largo | ASR, ST, LID | CC-BY-4.0 |
| OWSM v4 (encoder-decoder) | no disponible | encoder-decoder | 30 s por ventana | ASR, ST, LID | no disponible en la informacion |
| Whisper (OpenAI) | 1550M (large) | encoder-decoder | 30 s | ASR, ST, LID | MIT |

La comparacion cuantitativa de rendimiento entre OWSM-CTC v4, OWSM v4 y Whisper no esta disponible en la informacion proporcionada. La ventaja estructural de OWSM-CTC frente a los encoder-decoder es la inferencia no autorregresiva en una sola pasada.

## Limitaciones y advertencias

- Modelo no generativo: no admite prompts de texto libre, tool calling, agentes ni razonamiento multi-paso; cualquier caso de uso fuera de voz a texto queda fuera de su ambito.
- Ventana fija de 30 s por pasada: el audio mas corto se rellena a 30 s y el mas largo requiere decodificacion bufferizada, lo que puede introducir errores en las fronteras de los segmentos.
- Sin marcas temporales nativas: el modelo CTC no devuelve timestamps por token; para obtenerlas es necesario aplicar alineamiento forzado CTC externo.
- Sesgos: no se documentan en la informacion disponible; al entrenarse con 320.000 horas de audio publico, puede heredar sesgos de dominio, acento y demografia del corpus YODAS.
- Riesgo de alucinacion: los modelos CTC no generan texto libre, pero pueden producir transcripciones incorrectas o vacias en audio con ruido, musica o idiomas poco representados.
- Cobertura de idiomas: la model card indica "multilingual" sin listado cerrado; el rendimiento por idioma no esta cuantificado en la informacion disponible.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; es necesario citar el modelo y sus papers.
- Las builds GGUF para CPU estan mantenidas por terceros (audio-cpp/audio.cpp-gguf) fuera de ESPnet, por lo que su soporte y actualizacion no estan garantizados por el autor original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/espnet/owsm_ctc_v4_1B
- Dataset de entrenamiento: https://huggingface.co/datasets/espnet/yodas_owsmv4
- Demo Gradio (OWSM-CTC v4): https://huggingface.co/spaces/espnet/owsm-ctc-v4
- Demo Gradio (OWSM v4 encoder-decoder): https://huggingface.co/spaces/espnet/owsm-v4
- Paper OWSM v4 (INTERSPEECH 2025): https://www.isca-archive.org/interspeech_2025/peng25c_interspeech.html
- Paper OWSM-CTC (ACL 2024): https://aclanthology.org/2024.acl-long.549/
- Pagina del proyecto OWSM: https://www.wavlab.org/activities/2024/owsm/
- Receta de entrenamiento en ESPnet: https://github.com/espnet/espnet/tree/master/egs2/owsm_ctc_v4/s2t1
- Conversiones GGUF (terceros): https://huggingface.co/audio-cpp/audio.cpp-gguf/tree/main/OWSM-CTC-GGUF
- audio.cpp (inferencia en CPU): https://github.com/0xShug0/audio.cpp
- Premios ISCA: https://isca-speech.org/ISCA-Awards
- Referencia adicional: https://inferix.co/models/espnet/owsm_ctc_v4_1B
