# oruk/orukeet

## Resumen

Orukeet es un modelo de reconocimiento automático del habla (ASR) multilingüe desarrollado por Oruk AI, en colaboración con investigadores de Stanford University, University of Cambridge, OpenWhispr y Hoid. Se construye como un ajuste fino de NVIDIA Parakeet TDT 0.6B v3, un modelo transducer (TDT) con encoder FastConformer de 24 capas y 627 millones de parámetros. Su propuesta diferencial es arquitectónica: sustituye la mitad de los filtros depthwise temporales del encoder por 12.288 kernels Gabor ajustados y congelados, y reentrena el resto de parámetros sobre datos multilingües y multiacento.

El modelo cubre 25 idiomas europeos (entre ellos español, inglés, francés, alemán, italiano, portugués, neerlandés, polaco, rumano, griego, sueco, danés, finés, checo, húngaro, búlgaro, croata, estonio, letón, lituano, maltés, ruso, eslovaco, esloveno y ucraniano) y está pensado tanto para transcripción por lotes como para aplicaciones interactivas en servidor. Según el autor, supera a Parakeet en 61 de 74 particiones evaluadas, con una reducción relativa del 10,6 % en WER agregado sobre FLEURS.

Es relevante ahora porque demuestra que una intervención quirúrgica sobre los filtros temporales de un encoder convolucional preentrenado puede mejorar el rendimiento multilingüe sin aumentar el número de parámetros, y porque publica artefactos en múltiples formatos (NeMo, ONNX INT8, GGUF Q8 y F16 nativo) derivados del mismo checkpoint, lo que facilita su despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer de 24 capas con transducer token-and-duration (TDT); filtros depthwise temporales parcialmente sustituidos por kernels Gabor ajustados |
| Parametros totales | 627.057.286 (626.897.542 entrenables; 110.592 taps congelados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NeMo FP32, ONNX INT8, GGUF Q8 nativo, GGUF F16 nativo |
| Idiomas soportados | bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, ru, sk, sl, es, sv, uk (25 idiomas) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors, ONNX, GGUF, checkpoint NeMo (.nemo) |

## Arquitectura y entrenamiento

Orukeet mantiene la arquitectura de Parakeet TDT 0.6B v3: encoder FastConformer de 24 capas, transducer token-and-duration y el tokenizador original. La modificación clave afecta a los filtros depthwise temporales de cada bloque del encoder, que en el modelo base son 1.024 filtros de nueve taps. El autor ajusta una función Gabor (amplitud, centro, desviación y frecuencia modulada por coseno) a cada uno de los 24.576 filtros y selecciona globalmente los 12.288 con menor error cuadrático normalizado, lo que supone entre 175 y 748 kernels por capa, con un error RMS relativo mediano del 6,32 % y un umbral de corte del 13,30 %. Los 110.592 taps seleccionados quedan congelados; el resto de parámetros (626.897.542) se reentrena sobre datos multilingües y multiacento.

La adaptación final y la selección de checkpoint se realizaron sobre LibriSpeech test-other. El autor no detalla en la información disponible el volumen exacto de tokens de audio, la composición completa del dataset de ajuste ni si se emplearon técnicas de RLHF o DPO (no aplicables habitualmente en ASR). Las exportaciones nativas materializan los taps ajustados como pesos de convolución F16 ordinarios, de modo que la inferencia no requiere código personalizado para los kernels Gabor.

## Capacidades

- Transcripción de voz a texto en 25 idiomas europeos con un único modelo.
- Reconocimiento multiacento, entrenado específicamente sobre datos multilingües y multiacento.
- Detección de idioma (`lang_detect: true` en la configuración de transcribe_cpp).
- Marcas de tiempo a nivel de token (`timestamps: token`).
- No soporta streaming (`streaming: false`).
- No soporta traducción de voz (`translate: false`).
- Compatible con NeMo (`nemo_toolkit[asr]==3.0.0`), ONNX Runtime, sherpa-onnx y llama.cpp/GGUF.
- Exportación estándar a Transformers mediante `ParakeetForTDT`, sin código remoto personalizado, compatible con la opción de modelo de Hugging Face de Buzz.

## Casos de uso

- Transcripción por lotes de archivos de audio y media: el modelo procesa grabaciones completas (no streaming) y está pensado para pipelines de transcripción masiva en servidor, con salida de marcas de tiempo por token para alinear subtítulos.
- Subtitulado y generación de subtítulos: las marcas de tiempo a nivel de token permiten segmentar la transcripción y sincronizar subtítulos en 25 idiomas sin necesidad de un alineador externo.
- Atención al cliente y análisis de llamadas: la detección de idioma integrada permite enrutar o etiquetar automáticamente llamadas en distintos idiomas europeos dentro de un mismo sistema.
- Integración en aplicaciones de escritorio de dictado: la exportación estándar a Transformers y la compatibilidad con Buzz permiten usar el modelo en herramientas de dictado locales sin código personalizado.
- Despliegue en entornos con recursos limitados: las exportaciones ONNX INT8 y GGUF Q8 reducen el peso del modelo y permiten ejecución en CPU o GPU de gama media mediante sherpa-onnx o llama.cpp.
- Investigación en arquitecturas de ASR: los kernels Gabor ajustados y congelados ofrecen un caso de estudio reproducible sobre sustitución de filtros convolucionales en encoders preentrenados, con artefactos y hashes publicados.
- Servicio de transcripción alojado: el autor ofrece un modelo alojado y una API de speech-to-text para quienes no quieran desplegar infraestructura propia.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Benchmark | Metrica | Orukeet | Parakeet TDT 0.6B v3 |
|---|---|---|---|
| FLEURS (25 idiomas, agregado) | WER | 9,85 % | 11,01 % |
| FLEURS English (en_us, test) | WER | 3,82 % | 4,28 % |
| LibriSpeech test-clean | WER | 1,46 % | 1,53 % |
| LibriSpeech test-other | WER | 2,86 % | 3,14 % |

El agregado de FLEURS corresponde a 20.146 grabaciones y el de FLEURS English a 647 grabaciones. El autor indica que Orukeet supera a Parakeet en 61 de 74 particiones evaluadas y que la reducción relativa de WER agregado es del 10,6 %.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 2,5 GB solo para pesos (627 M de parámetros), más activaciones y memoria del runtime; se recomienda un mínimo de 4-6 GB de VRAM para NeMo en FP32.
- VRAM estimada en F16: aproximadamente 1,3 GB de pesos, con margen adicional para activaciones.
- VRAM estimada en ONNX INT8 o GGUF Q8: aproximadamente 0,7 GB de pesos, apto para GPU de gama baja y CPU.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA para NeMo (A100, H100, RTX 4090, RTX 3090, RTX 4060 Ti o superiores); para INT8/Q8 basta una GPU consumer modesta o CPU.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 4 GB o más de VRAM, especialmente en cuantización INT8 o Q8.
- Opciones de despliegue: NeMo (`nemo_toolkit[asr]==3.0.0`), Transformers (`ParakeetForTDT`), ONNX Runtime, sherpa-onnx, llama.cpp (GGUF), Buzz.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | WER FLEURS agregado | Licencia | Formatos |
|---|---|---|---|---|---|---|
| Orukeet | 627 M | 25 | no disponible | 9,85 % | CC BY-SA 4.0 | NeMo, safetensors, ONNX, GGUF |
| NVIDIA Parakeet TDT 0.6B v3 | 627 M | 25 | no disponible | 11,01 % | CC BY 4.0 | NeMo, safetensors |
| Whisper large-v3 | 1.550 M | ~99 | 30 s de audio | no disponible en la información | MIT | safetensors, GGUF, ONNX |

La comparación con Whisper large-v3 se incluye por categoría (ASR multilingüe), pero no se dispone de resultados de WER sobre FLEURS para ese modelo en la información proporcionada. Orukeet reutiliza la licencia CC BY-SA 4.0, más restrictiva que la CC BY 4.0 de Parakeet y la MIT de Whisper.

## Limitaciones y advertencias

- No soporta streaming: la configuración declara `streaming: false`, por lo que no es adecuado para transcripción en tiempo real sin segmentación previa.
- No soporta traducción de voz: solo transcribe en el idioma hablado, no traduce a otro idioma.
- Cobertura limitada a 25 idiomas europeos; no cubre idiomas asiáticos, africanos ni amerindios.
- Licencia CC BY-SA 4.0: exige atribución y compartir bajo la misma licencia las obras derivadas, lo que puede ser incompatible con productos propietarios que no quieran liberar sus adaptaciones.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente; además, la selección de checkpoint se hizo sobre LibriSpeech test-other, lo que puede introducir sesgo de selección en esa partición.
- Riesgo de alucinación y errores en audio con ruido, acentos no representados en el entrenamiento o solapamiento de hablantes; no se documentan métricas de robustez en esas condiciones.
- No se detalla el volumen ni la composición del dataset de ajuste, lo que dificulta evaluar posibles sesgos demográficos o dialectales.
- No se publican datos de latencia ni throughput, por lo que el dimensionamiento de producción debe medirse empíricamente.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/oruk/orukeet)
- [Repositorio de código](https://github.com/Oruk-AI/orukeet)
- [Pull request en OpenWhispr](https://github.com/OpenWhispr/openwhispr/pull/2085)
- [Informe técnico (PDF)](orukeet-technical-report.pdf)
- [Hashes de artefactos](ARTIFACTS.json)
- [Orukeet en oruk.ai](https://oruk.ai/models/orukeet)
- [API de speech-to-text de Oruk](https://oruk.ai/speech-to-text-api)
- [Quickstart de la API](https://oruk.ai/docs/quickstart)
- [Artículo sobre paralingüística](https://oruk.ai/what-is-paralinguistics)
- [Analizador de emoción vocal](https://oruk.ai/tools/voice-emotion-analyzer)
- [API de reconocimiento de emoción en el habla](https://oruk.ai/speech-emotion-recognition-api)
- [Modelo base: nvidia/parakeet-tdt-0.6b-v3](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3)
