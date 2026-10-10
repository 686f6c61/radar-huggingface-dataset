# ozonetg/parakeet-110m-caller-asr-basic

## Resumen

parakeet-110m-caller-asr-basic es un ajuste fino (full fine-tune) del modelo nvidia/parakeet-tdt_ctc-110m, publicado por ozonetg, especializado en el reconocimiento de voz del lado del cliente (caller side) en llamadas telefónicas salientes en inglés estadounidense, muestreadas a 8 kHz. El modelo resuelve un problema muy concreto: la transcripción de audio telefónico de banda estrecha procedente de un único canal de la llamada, un escenario donde los ASR generalistas entrenados con voz limpia de banda ancha pierden precisión de forma notable.

Arquitectónicamente mantiene la estructura del modelo base: un encoder FastConformer de 114,6 M parámetros acoplado a un decodificador TDT (token-and-duration transducer) y una cabeza CTC auxiliar. No es un modelo multimodal ni un LLM: es un sistema ASR puro con salida de texto en inglés con puntuación y mayúsculas, decodificado de forma greedy. El ajuste se realizó sobre aproximadamente 345,5 horas de audio real de llamadas de ventas salientes (504.617 segmentos), con transcripciones generadas automáticamente por Qwen3-ASR-1.7B y verificadas de forma cruzada contra otros sistemas ASR.

Su relevancia radica en que demuestra una mejora medible y sustancial en el dominio objetivo: en cinco conjuntos públicos de llamadas telefónicas agrupados baja el WER al 11,60 %, frente al 14,00 % del sistema que estaba en uso antes (el modelo base de 110 M con un pequeño adaptador de dominio) y al 14,58 % del modelo base sin tocar. En llamadas retenidas dentro del dominio alcanza un 3,44 % de WER, frente al 8,68 % del sistema anterior y el 9,19 % del base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder FastConformer con decodificador TDT (token-and-duration transducer) y cabeza CTC auxiliar |
| Parametros totales | 114,6 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (entrenado con segmentos de 0,3 a 20 s) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en float32) |
| Idiomas soportados | inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `.nemo` (parakeet-110m-caller-asr-basic.nemo), float32 |
| Modelo base | nvidia/parakeet-tdt_ctc-110m (fine-tune) |
| Framework | NeMo 2.5.3 (también restaura y transcribe en NeMo 3.0) |
| Entrada | audio mono a 16 kHz float; el audio telefónico de 8 kHz se remuestrea a 16 kHz |
| Salida | texto en inglés con puntuación y mayúsculas |
| Decodificación evaluada | TDT greedy |
| Tamano del repositorio | 0,5 GB |
| Fecha de publicacion (HuggingFace) | 2026-10-09 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base sin modificaciones estructurales: un encoder FastConformer de 114,6 M de parámetros y un decodificador TDT, que en lugar de predecir únicamente tokens predice pares token-duración, lo que permite emitir varios tokens por fotograma y acelera la decodificación. Se conserva además una cabeza CTC auxiliar. El ajuste se hizo con decodificación greedy TDT y todos los números reportados corresponden a esa configuración.

Los datos de entrenamiento son el elemento diferenciador. Se utilizaron cinco fuentes internas de grabaciones de llamadas de ventas salientes en EE. UU., registradas entre 2025 y 2026, tomando exclusivamente el canal del cliente (caller), en mono a 8 kHz. El split de entrenamiento contiene 504.617 segmentos que suman 345,5 horas; los segmentos van de 0,3 a 20 segundos. Un 5 % son segmentos sin habla (ruido de línea, silencio, espera, respiración) con objetivo vacío, lo que enseña al modelo a no emitir texto en esos tramos; alrededor del 1 % son saludos de buzón de voz o mensajes de IVR captados en la línea del cliente. Las etiquetas son transcripciones automáticas de Qwen3-ASR-1.7B; ningún humano transcribió estos datos. Cada transcripción se contrastó con sistemas ASR independientes: los segmentos con acuerdo se etiquetaron como tier 1 (peso de pérdida 1,0), los de acuerdo parcial como tier 2 (peso 0,7) y el resto se descartó. Para evitar el olvido catastrófico, el 10 % de cada lote proviene de Switchboard (inglés telefónico conversacional público, con transcripciones humanas).

La cadena de entrada es relevante para reproducir resultados: el audio de 8 kHz se remuestrea a 16 kHz con el resampler por defecto de librosa (soxr_hq), que es exactamente lo que hace el cargador de audio de NeMo con un WAV de 8 kHz. Entrenamiento y evaluación usaron la misma cadena. El optimizador fue AdamW (β 0,9 / 0,98; weight decay 0,001) con un learning rate máximo de 1e-4 (la información disponible se corta en este punto de la receta).

## Capacidades

- Transcripción de voz a texto en inglés para audio telefónico de banda estrecha (8 kHz) procedente del canal del cliente en llamadas salientes.
- Salida con puntuación y mayúsculas, sin necesidad de un modelo de restauración posterior.
- Supresión de tramos sin habla: por el 5 % de segmentos no verbales con objetivo vacío, tiende a no emitir texto en silencio, ruido de línea, esperas y respiraciones.
- Manejo de mensajes de buzón de voz y prompts de IVR captados en la línea del cliente (aproximadamente un 1 % del entrenamiento).
- Robustez ante conversación telefónica espontánea gracias al replay de Switchboard (10 % de cada lote).
- Capacidad conversacional general en inglés telefónico conservada tras el ajuste (evaluada con Switchboard y otros conjuntos públicos).
- No soporta tool calling ni function calling: es un modelo ASR puro, sin interfaz de agente.
- No soporta razonamiento multi-paso ni generación de texto libre.
- No dispone de capacidades de visión, audio más allá de ASR ni modo de pensamiento.
- Multilingüismo: no disponible; el modelo está declarado únicamente para inglés (`en`).
- No se ha anunciado soporte de diarización, marcas de tiempo, detección de hablante ni palabra clave.

## Casos de uso

- Transcripción de llamadas de ventas salientes: el modelo está ajustado específicamente sobre el canal del cliente en llamadas de outbound sales de EE. UU., por lo que es directamente aplicable a la generación de actas y al análisis de conversaciones en centros de contacto de este vertical.
- Analítica de centros de contacto: al reducir el WER agrupado en conjuntos telefónicos públicos al 11,60 % (frente al 14,58 % del base), permite construir métricas de calidad, detección de objeciones y análisis de sentimiento sobre transcripciones más fiables.
- Cumplimiento normativo y auditoría de llamadas: la transcripción automática de la línea del cliente sirve como base documental en revisiones de cumplimiento, con la ventaja de que el modelo descarta texto en tramos sin habla, evitando relleno alucinado en silencios y esperas.
- Procesamiento offline por lotes de grabaciones históricas: el modelo se ejecuta sin GPU dedicada y ocupa 0,5 GB en reposo, lo que permite transcribir volúmenes grandes en CPU con NeMo, por ejemplo para reindexar un archivo de llamadas de varios años.
- Sistemas de análisis de calidad en tiempo casi real: con 114,6 M de parámetros en float32 (aproximadamente 460 MB), el modelo cabe holgadamente en cualquier GPU de gama de consumo, lo que facilita el despliegue en servidores modestos o en el borde.
- Detección de buzón de voz e IVR en pipelines de marcación: al haberse entrenado con este tipo de segmentos en la línea del cliente, puede usarse para clasificar el resultado de una llamada a partir de su transcripción.
- Enriquecimiento de datos para otros modelos: al ser un fine-tune reproducible con la receta documentada, sirve como etiquetador o generador de pseudo-etiquetas para dominios de voz telefónica en inglés.
- Investigación en adaptación de dominio ASR: al ser el ajuste de referencia de una familia de variantes de 110 M, es el punto de comparación adecuado para medir el efecto de distintas recetas de adaptación sobre el mismo modelo base.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (`verified: false` en todos los casos). Los valores son porcentajes de WER: cuanto más bajo, mejor.

| Conjunto de evaluacion | WER (%) |
|---|---|
| LibriSpeech test-clean (8 kHz) | 3,27 |
| LibriSpeech test-other (8 kHz) | 7,30 |
| LibriSpeech test-clean (16 kHz) | 2,78 |
| LibriSpeech test-other (16 kHz) | 6,03 |
| CallHome English (test) | 12,37 |
| CallFriend English (dev) | 17,47 |
| HarperValley Bank (caller channel) | 5,15 |
| Let's Go (re-typed references) | 23,94 |
| AppTek call-center dialogues, US customers (test) | 8,93 |
| Switchboard (subconjunto de 3.000 enunciados) | 7,54 |

Comparaciones internas declaradas por el autor:

| Escenario | Este modelo | Sistema previo (110 m + adaptador de dominio) | Base sin ajustar (nvidia/parakeet-tdt_ctc-110m) |
|---|---|---|---|
| Cinco conjuntos publicos de llamadas telefonicas (agrupados) | 11,60 % | 14,00 % | 14,58 % |
| Llamadas retenidas dentro del dominio | 3,44 % | 8,68 % | 9,19 % |
| LibriSpeech test-other a 8 kHz | 7,30 % | no disponible | 6,25 % |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 460 MB en float32 (114,6 M de parámetros). En float16 el peso teórico bajaría a unos 230 MB, pero no se distribuyen pesos en ese formato.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares, con un consumo de VRAM muy por debajo de 1 GB.
- También es viable en CPU para inferencia por lotes, dado el tamaño reducido del modelo.
- GPU de centro de datos (A100, H100) no son necesarias para este modelo; solo tendrían sentido para procesar lotes muy grandes en paralelo.
- Opciones de despliegue: NeMo 2.5.3 (el modelo también restaura y transcribe en NeMo 3.0). No se han publicado pesos en GGUF, ONNX ni integraciones declaradas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.
- Requisito de entrada: audio mono a 16 kHz float; el audio telefónico de 8 kHz debe remuestrearse a 16 kHz con el resampler por defecto de librosa (soxr_hq) para reproducir las condiciones de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / dominio | WER en llamadas telefonicas (5 conjuntos agrupados) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| parakeet-110m-caller-asr-basic | 114,6 M | Segmentos de 0,3 a 20 s; caller side de llamadas salientes en 8 kHz | 11,60 % | CC BY 4.0 | HuggingFace, formato `.nemo` |
| nvidia/parakeet-tdt_ctc-110m (base) | 114,6 M | ASR general en inglés | 14,58 % | no disponible en la informacion proporcionada | HuggingFace, formato `.nemo` |
| Sistema previo (110 m + adaptador de dominio) | 114,6 M | ASR telefonico con adaptador | 14,00 % | no disponible en la informacion proporcionada | interno del autor |

No se dispone en la informacion proporcionada de datos comparativos frente a otros modelos ASR de la misma categoria (por ejemplo, variantes de Whisper o soluciones comerciales de transcripcion de centros de contacto), ni de sus parametros, contexto o licencia, por lo que no se incluyen en esta tabla.

## Limitaciones y advertencias

- Todos los resultados de benchmarks estan marcados como `verified: false`: son cifras declaradas por el autor y no han sido verificadas de forma independiente.
- Las etiquetas de entrenamiento son transcripciones automaticas de Qwen3-ASR-1.7B. Ningun humano transcribio los datos, por lo que los errores sistematicos del modelo etiquetador pueden haberse transferido al modelo final. Los segmentos con acuerdo parcial se conservaron con peso de perdida reducido (0,7), no se descartaron.
- Degradacion en voz limpia de banda ancha: en LibriSpeech test-other a 8 kHz el WER empeora 1,05 puntos porcentuales respecto al modelo base (7,30 % frente a 6,25 %). El ajuste mejora el dominio objetivo a costa de rendimiento general.
- Rendimiento flojo en algunos conjuntos publicos: 23,94 % de WER en Let's Go (referencias reescritas) y 17,47 % en CallFriend English (dev). No es un modelo de proposito general para conversacion telefonica.
- Solo reconoce ingles. No se ha declarado ni evaluado ningun otro idioma, y no se ha documentado el comportamiento ante acentos no estadounidenses.
- Entrenado exclusivamente con el canal del cliente (caller) de llamadas de ventas salientes. Es probable que rinda peor en el canal del agente, en llamadas entrantes o en dominios distintos al de ventas.
- Sesgo de dominio: los datos provienen de cinco fuentes internas de grabaciones de ventas salientes de EE. UU. de 2025-2026, lo que puede introducir sesgos acusticos, demograficos y lexicos propios de ese entorno.
- Riesgo de alucinacion: mitigado parcialmente con un 5 % de segmentos no verbales con objetivo vacio, pero no eliminado; en audio degradado o fuera de dominio puede generar texto inexistente.
- No soporta marcas de tiempo, diarizacion ni deteccion de hablante, lo que limita su uso directo en transcripcion de llamadas con varias voces.
- Licencia CC BY 4.0: permite uso comercial y modificacion con atribucion, sin clausulas de uso aceptable especificas mas alla de las de Creative Commons. Es responsabilidad del usuario verificar el cumplimiento legal aplicable al tratamiento de grabaciones de llamadas (consentimiento, retencion, privacidad), aspecto que la model card no aborda.
- El modelo tiene 0 descargas y 0 me gusta en HuggingFace en la informacion disponible, por lo que no existe evidencia de adopcion ni de validacion por terceros.
- El repositorio ocupa 0,5 GB y los pesos se distribuyen en float32; no hay versiones cuantizadas publicadas que reduzcan el consumo de memoria o aceleren la inferencia.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/ozonetg/parakeet-110m-caller-asr-basic
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m
- Framework NeMo (NVIDIA): no se ha proporcionado un enlace explicito en la informacion disponible
