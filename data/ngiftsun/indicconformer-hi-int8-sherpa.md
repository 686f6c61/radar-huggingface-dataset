# ngiftsun/indicconformer-hi-int8-sherpa

## Resumen

IndicConformer Hindi int8 para sherpa-onnx es un paquete de reconocimiento de voz en hindi empaquetado para inferencia en dispositivo ("on-device"), publicado por el usuario ngiftsun bajo el identificador `ngiftsun/indicconformer-hi-int8-sherpa`. No es un modelo nuevo ni reentrenado: es una recopia cuantizada a int8 del modelo IndicConformer de AI4Bharat, en su variante hindi con cabeza CTC (~120 millones de parametros), exportada previamente a ONNX por trysem y adaptada aqui al cargador NeMo-CTC de sherpa-onnx. El repositorio ocupa 0,1 GB e incluye unicamente `model.int8.onnx` (140 MB) y `tokens.txt` (5.632 tokens BPE mas el token blank).

El problema que resuelve es concreto: permitir transcripcion de voz en hindi completamente offline en telefonos Android y equipos modestos, sin GPU y sin conexion a internet. La cuantizacion dinamica de pesos con ONNX Runtime reduce el tamano de 493 MB a 140 MB, con un coste medido de aproximadamente un punto de WER frente a la version fp32. El modelo es no streaming, por lo que para subtitulado en vivo hay que combinarlo con un VAD y redecodificar periodicamente el segmento de habla actual.

Su relevancia actual es doble: por un lado, cubre un idioma con poca oferta de ASR ligero y desplegable en movil; por otro, su empaquetado (metadatos `vocab_size=5633`, `subsampling_factor=4`, `normalize_type=per_feature`, `model_type=EncDecCTCModelBPE`) lo hace cargable directamente con la API `OfflineRecognizer.from_nemo_ctc` de sherpa-onnx, sin necesidad de conversion adicional. Fue construido para Subtle, una aplicacion de subtitulos en vivo que transcribe y traduce audio de video en el propio telefono.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder) con cabeza CTC; el modelo base es hibrido CTC/RNN-T, pero esta exportacion usa unicamente la rama CTC |
| Parametros totales | ~120 millones (heredados del modelo base, no reentrenado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo acustico de ASR, no un LLM; procesa el segmento de audio completo de una vez, no streaming) |
| Tipos de cuantizacion | int8 (cuantizacion dinamica de pesos con ONNX Runtime); existe version fp32 de referencia |
| Idiomas soportados | hindi (hi); salida en escritura devanagari |
| Licencia | CC-BY-4.0 para este reempaquetado; el modelo original de AI4Bharat es MIT |
| Formato de pesos | ONNX (`model.int8.onnx`) mas `tokens.txt` con 5.632 tokens BPE + blank (id 5632) |
| Entrada de audio | 16 kHz mono; sherpa-onnx calcula caracteristicas log-mel de 80 dimensiones |
| Tamano en disco | 140 MB (int8), frente a 493 MB en fp32 |
| Libreria de inferencia | sherpa-onnx |

## Arquitectura y entrenamiento

La arquitectura subyacente es un Conformer, es decir, un transformer que combina bloques de autoatencion con convoluciones depthwise para capturar dependencias locales y globales en la secuencia acustica. AI4Bharat entreno el modelo base `indicconformer_stt_hi_hybrid_ctc_rnnt_large` como sistema hibrido con dos cabezas, CTC y RNN-T. Esta publicacion concreta parte de la exportacion ONNX de trysem, que conserva unicamente la cabeza CTC, de modo que el modelo final es un `EncDecCTCModelBPE` puro con factor de subsampling 4 y normalizacion `per_feature`.

No ha habido entrenamiento ni ajuste fino por parte del autor de esta ficha: la unica transformacion es la anadicion de metadatos que exige el cargador NeMo-CTC de sherpa-onnx, la generacion del fichero `tokens.txt` y una cuantizacion dinamica de pesos int8 aplicada con ONNX Runtime. No se documentan ni el numero de tokens de entrenamiento, ni la composicion exacta del dataset, ni si hubo fases de RLHF o DPO; el unico dataset referenciado en la model card es `google/fleurs`, usado para la evaluacion y no necesariamente para el entrenamiento. La innovacion tecnica relevante no esta en el modelo sino en el empaquetado: convertir un checkpoint de 493 MB en un artefacto de 140 MB cargable directamente en Android mediante el AAR de sherpa-onnx, con `OfflineRecognizer` y `OfflineNemoEncDecCtcModelConfig`.

## Capacidades

- Reconocimiento de voz en hindi (variedad `hi`, salida en devanagari) a partir de audio de 16 kHz mono.
- Decodificacion CTC no streaming sobre un segmento completo de audio.
- Inferencia completamente offline, sin llamadas a red.
- Ejecucion en CPU, tanto en equipos de escritorio como en telefonos Android, con un factor de tiempo real de 0,09 con 2 hilos.
- Integracion directa con la API de sherpa-onnx en Python, C++ y Android (AAR).
- Uso combinado con VAD externo para construir un flujo pseudo-streaming basado en redecodificacion periodica.
- Salida de texto en minusculas sin puntuacion (limitacion inherente a la cabeza CTC y al vocabulario BPE entrenado, no una capacidad configurable).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo de pensamiento: es un modelo acustico, no un modelo de lenguaje generativo.

## Casos de uso

- Subtitulado en vivo en Android: es el caso para el que se construyo. La aplicacion captura audio con un VAD, acumula el segmento de habla detectado y lo redecodifica periodicamente con el modelo int8, generando subtitulos en devanagari con una latencia compatible con lectura en tiempo real (RTF 0,09).
- Transcripcion offline de videos y podcasts en hindi: al no requerir red ni GPU, se puede integrar en una aplicacion movil que transcriba la pista de audio de un video local sin subir el contenido a ningun servidor, lo que simplifica el cumplimiento de privacidad.
- Dictado de voz en aplicaciones de productividad: el modelo cabe en 140 MB y se ejecuta en CPU, de modo que puede incorporarse a un teclado o app de notas en Android para convertir voz en texto hindi sin depender de servicios en la nube.
- Indexacion y busqueda de archivos de audio: transcripcion por lotes de un repositorio de grabaciones en hindi para generar indices de texto buscables; el coste por hora de audio es bajo gracias al RTF medido.
- Preprocesado para pipelines de traduccion: la salida en devanagari sin puntuacion puede alimentar un modelo de traduccion hindi a otro idioma, encadenando ASR local y traduccion, util en escenarios con conectividad intermitente.
- Notas de voz y actas de reunion: transcripcion de grabaciones mono de una sola voz mediante procesado por segmentos con VAD; adecuado para reuniones limpias, con la advertencia de que el rendimiento cae con musica o voces solapadas.
- Asistentes de voz embebidos de dominio limitado: reconocimiento de comandos y frases en hindi en dispositivos con recursos restringidos, usando el modelo como etapa acustica previa a un clasificador de intenciones.

## Benchmarks y rendimiento

Evaluacion realizada por el autor sobre 25 emisiones del split `hi_in` de desarrollo de Google FLEURS, en CPU de portatil con 2 hilos y tras eliminar la puntuacion. Las variantes ortograficas cuentan como error. El ruido es ruido rosa sintetico al nivel de relacion senal-ruido indicado.

| Modelo | WER / CER limpio | WER / CER a 10 dB | WER a 5 dB | Factor de tiempo real |
|---|---|---|---|---|
| Este modelo (int8) | 14,2% / 6,8% | 20,1% / 12,2% | 24,6% | 0,09 |
| Mismo modelo, fp32 | 13,4% / 5,7% | no disponible | no disponible | 0,07 |
| Vosk small hi 0.22 | 24,4% / 14,9% | 33,3% / 23,9% | 56,2% | 0,19 |
| Omnilingual ASR 300M CTC int8 | 32,4% / 15,2% | 71,1% / 54,2% | no disponible | 0,25 |
| Dolphin small CTC int8 | 33,9% / 22,0% | no disponible | no disponible | 0,10 |

Advertencia del propio autor: la muestra es pequena (25 emisiones) y corresponde a habla leida, por lo que cabe esperar tasas de error mas altas en audio real de video con musica de fondo o voces solapadas. La cuantizacion int8 cuesta aproximadamente un punto de WER y algo mas de un punto de CER respecto a fp32.

## Requisitos de hardware

- VRAM: no aplica en el caso tipico; el modelo esta pensado para CPU. En disco ocupa 140 MB y el consumo de memoria en inferencia es del orden de cientos de megabytes.
- GPU recomendadas: no se especifican; no son necesarias. Cualquier GPU con soporte de ONNX Runtime puede ejecutarlo, pero el objetivo declarado es el despliegue en CPU.
- GPU consumer: irrelevante para el caso de uso; el modelo cabe sobradamente en cualquier GPU de consumo, pero su ventaja es funcionar sin ella.
- Moviles: compatible con telefonos Android de gama baja mediante el AAR de sherpa-onnx, incluido el escenario de dispositivos economicos sin conexion.
- Opciones de despliegue: sherpa-onnx (Python con `OfflineRecognizer.from_nemo_ctc`, C++ y Android), y ONNX Runtime de forma directa.
- Latencia y throughput: factor de tiempo real de 0,09 con 2 hilos en CPU de portatil, es decir, aproximadamente 11 veces mas rapido que el tiempo real. La version fp32 rinde a 0,07 (unas 14 veces el tiempo real) en la misma configuracion.
- Restriccion de flujo: al ser no streaming, para uso en vivo hay que anadir un VAD y redecodificar el segmento acumulado periodicamente; la latencia percibida dependera del tamano de segmento elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | WER limpio | WER a 5 dB | RTF | Licencia |
|---|---|---|---|---|---|---|
| ngiftsun/indicconformer-hi-int8-sherpa | ~120M | hindi | 14,2% | 24,6% | 0,09 | CC-BY-4.0 |
| Mismo modelo en fp32 | ~120M | hindi | 13,4% | no disponible | 0,07 | CC-BY-4.0 (export CC-BY-4.0, original MIT) |
| Vosk small hi 0.22 | no disponible | hindi | 24,4% | 56,2% | 0,19 | no disponible en la informacion proporcionada |
| Omnilingual ASR 300M CTC int8 | 300M | multilingue | 32,4% | no disponible | 0,25 | no disponible en la informacion proporcionada |
| Dolphin small CTC int8 | no disponible | multilingue (asiatico) | 33,9% | no disponible | 0,10 | no disponible en la informacion proporcionada |

Existen otros reempaquetados del mismo modelo base con enfoque similar, como `parismitaglobalsolutions/indicconformer-sherpa-onnx` (que cubre diez lenguas indias, ingles y dos modelos Hinglish) y los paquetes de `eshivansh/echo-models` para la aplicacion Echo, que usan la rama RNN-T en lugar de la CTC. No se dispone de cifras comparativas de estos paquetes en la informacion proporcionada.

## Limitaciones y advertencias

- Solo hindi. No reconoce ningun otro idioma y la salida es devanagari sin puntuacion.
- Modelo no streaming: para subtitulado en vivo requiere un VAD y redecodificacion periodica; no es adecuado como decoder continuo de baja latencia por si solo.
- La cuantizacion int8 degrada la precision: 14,2% frente a 13,4% de WER y 6,8% frente a 5,7% de CER en la evaluacion limpia.
- La evaluacion se hizo sobre solo 25 emisiones de habla leida; el propio autor advierte que el rendimiento caera con musica, voces solapadas o audio real de video.
- Las variantes ortograficas del hindi se contabilizan como errores en la evaluacion, lo que infla ligeramente las tasas reportadas.
- Riesgo de alucinacion en sentido estricto: no aplica, porque es un modelo CTC discriminativo y no generativo; el modo de fallo tipico es la sustitucion u omision de palabras, no la invencion de contenido libre.
- Sesgos conocidos: no se documentan analisis de sesgo por acento, genero, edad o variedad dialectal del hindi. Dado que el modelo base de AI4Bharat se entreno sobre corpus mayoritariamente de habla leida, es previsible un peor comportamiento en registros coloquiales o dialectales, pero no hay datos publicados que lo cuantifiquen.
- Licencia: este reempaquetado se distribuye bajo CC-BY-4.0, que permite uso comercial con atribucion. El modelo original de AI4Bharat esta bajo licencia MIT. Cualquier uso en produccion debe mantener la atribucion a AI4Bharat, al exportador original `trysem` y al autor del reempaquetado.
- El repositorio no incluye model card completa ni pipeline de evaluacion reproducible publicado aparte; las cifras de la tabla anterior provienen de la model card del autor y no han sido verificadas de forma independiente.
- Tamano del repositorio muy reducido (0,1 GB) y ausencia de versiones alternativas de cuantizacion; no se ofrece un artefacto fp32 listo para sherpa-onnx en este repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ngiftsun/indicconformer-hi-int8-sherpa
- Modelo base de AI4Bharat: https://huggingface.co/ai4bharat/indicconformer_stt_hi_hybrid_ctc_rnnt_large
- Exportacion ONNX intermedia: https://huggingface.co/trysem/indicconformer-120m-onnx
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Perfil del autor: https://huggingface.co/ngiftsun
- Dataset de evaluacion: https://huggingface.co/datasets/google/fleurs
- Reempaquetado alternativo multilingue: https://huggingface.co/parismitaglobalsolutions/indicconformer-sherpa-onnx
- Fichero `hi/model.int8.onnx` de dicho reempaquetado: https://huggingface.co/parismitaglobalsolutions/indicconformer-sherpa-onnx/blob/main/hi/model.int8.onnx
- Paquetes de modelos para Android de Echo: https://github.com/eshivansh/echo-models/tree/main
- Ficha de directorio del reempaquetado alternativo: https://essamamdani.com/ai-models/hf-parismitaglobalsolutions-indicconformer-sherpa-onnx
