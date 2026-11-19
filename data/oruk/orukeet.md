# oruk/orukeet

## Resumen

Orukeet es un modelo de reconocimiento automático del habla (ASR) multilingüe desarrollado por Oruk AI en colaboración con investigadores de Stanford University, University of Cambridge, OpenWhispr y Hoid. Se trata de un ajuste fino (finetune) del modelo NVIDIA Parakeet TDT 0.6B v3, sobre el que introduce una innovación arquitectónica concreta: sustituye la mitad de los filtros depthwise temporales del encoder por 12.288 kernels Gabor ajustados y congelados. El resultado es un modelo que mantiene el mismo número de parámetros que su base (627.057.286) pero mejora la precisión en 61 de las 74 particiones de test evaluadas.

El modelo cubre 25 idiomas europeos (incluido el español) y está pensado para transcripción de grabaciones, medios, procesamiento por lotes en servidores y aplicaciones interactivas. Su relevancia actual radica en que demuestra que una modificación estructural ligera y bien fundamentada —la parametrización de filtros convolucionales como funciones Gabor— puede superar a un modelo base de referencia sin incrementar el coste computacional ni el tamaño del checkpoint.

La arquitectura subyacente es un FastConformer de 24 capas con transductor token-and-duration (TDT), exportable a NeMo, ONNX INT8, GGUF Q8 y F16 nativo, todos derivados del mismo checkpoint de la release r3 (`031c8ddab484`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer de 24 capas con transductor token-and-duration (TDT); mitad de filtros depthwise temporales reemplazados por kernels Gabor ajustados y congelados |
| Parametros totales | 627.057.286 (626.897.542 entrenables; 110.592 taps Gabor congelados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NeMo FP32, ONNX INT8, GGUF Q8 nativo, F16 nativo |
| Idiomas soportados | 25: búlgaro, croata, checo, danés, neerlandés, inglés, estonio, finés, francés, alemán, griego, húngaro, italiano, letón, lituano, maltés, polaco, portugués, rumano, ruso, eslovaco, esloveno, español, sueco, ucraniano |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors, ONNX, GGUF, NeMo (.nemo) |

## Arquitectura y entrenamiento

Orukeet parte del encoder FastConformer de 24 capas de Parakeet TDT 0.6B v3, donde cada bloque contiene 1.024 filtros depthwise temporales de nueve taps. La modificación consiste en ajustar cada filtro a una función Gabor de la forma `g(t) = A·exp[-(t-μ)²/(2σ²)]·cos(2πf(t-μ)+φ)` para `t = -4,...,4`. Se ajustaron los 24.576 filtros y se seleccionaron globalmente los 12.288 con menor error cuadrático normalizado (entre 175 y 748 kernels por capa, con un error RMS relativo mediano del 6,32% y un corte del 13,30%). Los 110.592 taps seleccionados quedan congelados; el resto de parámetros escalares (626.897.542) permanecen entrenables. Las exportaciones nativas materializan los taps ajustados como pesos de convolución F16 convencionales.

El proceso de construcción emplea pérdida de transductor, matching de encoder y destilación de token/duración para recuperar los kernels Gabor, seguido de 4.035 actualizaciones de bajo learning rate para producir el checkpoint padre. La pasada final r3 aplica 168 actualizaciones AdamW con warmup del 3% y decaimiento coseno de `5e-6` a `5e-7`, sobre tres pasadas por 2.939 grabaciones de LibriSpeech test-other, manteniendo el casing y la puntuación nativos. La misma partición se usa para la selección de checkpoint, y una auditoría de exportación verifica que los 12.288 kernels ajustados permanecen exactos.

## Capacidades

- Reconocimiento automático del habla multilingüe en 25 idiomas europeos, con soporte de acentos múltiples.
- Transcripción con casing y puntuación nativos preservados.
- Detección de idioma (`lang_detect: true`).
- Marcas de tiempo a nivel de token (`timestamps: token`).
- Procesamiento por lotes y streaming no soportado de forma nativa (`streaming: false`).
- Traducción no soportada (`translate: false`).
- Exportación a múltiples runtimes: NeMo, ONNX INT8, GGUF Q8, F16 nativo y Transformers FP32 mediante `ParakeetForTDT` sin código remoto personalizado.
- Compatibilidad con Buzz a través de su opción de modelos de Hugging Face.

## Casos de uso

- Transcripción de reuniones y notas de voz multilingües: el modelo cubre 25 idiomas europeos con detección automática de idioma, lo que permite procesar reuniones con participantes que alternan entre español, inglés, francés o alemán sin cambiar de modelo.
- Subtitulado de medios audiovisuales: las marcas de tiempo a nivel de token facilitan la alineación de subtítulos con el audio en pipelines de postproducción, y el soporte de casing y puntuación nativos reduce el postprocesado.
- Procesamiento por lotes en servidores: la exportación ONNX INT8 y GGUF Q8 permite desplegar workers de transcripción de alto rendimiento con menor huella de memoria, adecuados para volúmenes grandes de grabaciones archivadas.
- Aplicaciones interactivas de dictado: el tamaño de 0,6B parámetros y las exportaciones F16 lo hacen viable en GPUs de consumo, permitiendo dictado en tiempo real en herramientas de escritorio.
- Integración en asistentes de voz y centros de contacto: la detección de idioma y el WER bajo en inglés (3,82% en FLEURS) lo hacen adecuado para enrutamiento automático de llamadas y transcripción de conversaciones de atención al cliente.
- Investigación en ASR multilingüe: la parametrización Gabor congelada y la auditoría de exportación documentada permiten reproducir y extender el experimento sobre otros checkpoints base de Parakeet.
- Accesibilidad y documentación: transcripción de contenido audiovisual a texto en 25 idiomas para generar actas, resúmenes o documentos buscables.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Metrica | Orukeet | Parakeet TDT 0.6B v3 |
|---|---|---|---|
| FLEURS (25 idiomas, pooled) | WER | 9,85% | 11,01% |
| FLEURS English (en_us) | WER | 3,82% | 4,28% |
| LibriSpeech test-clean | WER | 1,46% | 1,53% |
| LibriSpeech test-other | WER | 2,86% | 3,14% |

El modelo supera a Parakeet en 61 de las 74 particiones de test evaluadas. La reducción relativa de WER en FLEURS pooled es del 10,6%. La partición FLEURS pooled comprende 20.146 grabaciones; la partición FLEURS English, 647 grabaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en FP16 (0,6B parámetros), alrededor de 0,7 GB en ONNX INT8 o GGUF Q8.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; A100, H100 o RTX 4090 para despliegues de alto throughput en lote.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060 o superiores, e incluso en GPUs integradas con cuantización INT8/Q8.
- Opciones de despliegue: NeMo (`nemo_toolkit[asr]==3.0.0` con PyTorch CUDA), ONNX Runtime, llama.cpp/GGUF, sherpa-onnx, Transformers con `ParakeetForTDT`, y Buzz.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER FLEURS English | WER LibriSpeech test-clean | Licencia |
|---|---|---|---|---|---|
| Orukeet | 627M | 25 | 3,82% | 1,46% | CC BY-SA 4.0 |
| NVIDIA Parakeet TDT 0.6B v3 | 627M | 25 | 4,28% | 1,53% | CC BY 4.0 (modelo base) |
| Whisper large-v3 | 1.550M | ~99 | No disponible en esta ficha | No disponible en esta ficha | MIT |
| Whisper small | 244M | ~99 | No disponible en esta ficha | No disponible en esta ficha | MIT |

La comparación directa con Parakeet es la más relevante, ya que Orukeet es un finetune del mismo. Frente a Whisper, la diferencia principal es la cobertura de idiomas (25 frente a ~99) y la licencia (CC BY-SA 4.0 frente a MIT). No se dispone de datos de benchmarks de Whisper en la información proporcionada para una comparación numérica rigurosa.

## Limitaciones y advertencias

- El modelo solo cubre 25 idiomas europeos; no soporta idiomas fuera de ese conjunto.
- No soporta streaming nativo (`streaming: false`), lo que limita su uso en aplicaciones de transcripción en tiempo real continuo.
- No soporta traducción (`translate: false`); únicamente transcribe en el idioma de origen.
- La licencia CC BY-SA 4.0 es copyleft: obliga a compartir bajo la misma licencia las obras derivadas y exige atribución, lo que puede ser restrictivo para uso comercial propietario.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false`).
- La selección de checkpoint se realizó sobre LibriSpeech test-other, la misma partición usada para evaluar, lo que puede introducir un sesgo optimista en esa métrica concreta.
- Riesgo de alucinación inherente a los modelos ASR en audio con ruido, acentos no representados en el entrenamiento o solapamiento de hablantes.
- No se dispone de información sobre sesgos demográficos o dialectales específicos más allá de la mención a datos multiacento.
- El contexto de audio máximo no está especificado en la información disponible.

## Enlaces

- [Hugging Face: oruk/orukeet](https://huggingface.co/oruk/orukeet)
- [Repositorio de código](https://github.com/Oruk-AI/orukeet)
- [Pull request en OpenWhispr](https://github.com/OpenWhispr/openwhispr/pull/2085)
- [Informe técnico (PDF)](orukeet-technical-report.pdf)
- [Hashes de artefactos](ARTIFACTS.json)
- [Página del modelo en oruk.ai](https://oruk.ai/models/orukeet)
- [API de speech-to-text de Oruk](https://oruk.ai/speech-to-text-api)
- [Modelo base: nvidia/parakeet-tdt-0.6b-v3](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3)
