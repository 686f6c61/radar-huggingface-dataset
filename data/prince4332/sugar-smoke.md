# prince4332/sugar-smoke

## Resumen

sugar-smoke es un modelo de reconocimiento automático del habla (ASR) en streaming desarrollado por el usuario prince4332, obtenido mediante fine-tuning de nvidia/nemotron-3.5-asr-streaming-0.6b sobre tres lenguas de Ghana (akan/twi, ga y ewe), manteniendo además un conjunto de idiomas europeos como "replay" (inglés, francés, español, alemán y portugués). El modelo se distribuye en formato NeMo (`.nemo`) y está pensado para transcripción en tiempo real con atención cache-aware, típica de la familia Nemotron ASR de NVIDIA.

La relevancia del modelo reside en su intento de cubrir lenguas africanas de bajos recursos (akan, ga, ewe), para las que existen muy pocos sistemas ASR públicos, sin sacrificar del todo los idiomas originales del modelo base. Sin embargo, los resultados publicados en la propia model card son muy pobres: el WER en las lenguas nuevas ronda el 100 %, lo que indica que el modelo, en la práctica, no transcribe correctamente ninguna de las tres lenguas objetivo. Además, el fine-tuning degrada los idiomas de replay (alemán pasa de 20,78 a 35,06 de WER, portugués de 4,13 a 6,88, español de 3,19 a 4,26).

Se trata, por tanto, de un experimento de fine-tuning con resultados limitados, útil como referencia metodológica o como punto de partida, pero no como sistema listo para producción. El repositorio ocupa 7,7 GB y contiene tanto el mejor checkpoint (`sugar-smoke.nemo`) como el checkpoint del último paso de entrenamiento (`final/sugar-smoke.nemo`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ASR en streaming cache-aware (familia Nemotron ASR de NVIDIA, según modelo base) |
| Parametros totales | 0,6 B (heredados del modelo base nvidia/nemotron-3.5-asr-streaming-0.6b) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ak (akan/twi), gaa (ga), ee (ewe), en, fr, es, de, pt |
| Licencia | no disponible |
| Formato de pesos | `.nemo` (NeMo) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base nvidia/nemotron-3.5-asr-streaming-0.6b, un sistema ASR en streaming de tipo cache-aware: mantiene cachés de atención y convolución para procesar audio de forma incremental con baja latencia, y expone un bucle de inferencia basado en `CacheAwareStreamingAudioBuffer` y `conformer_stream_step`. El fine-tuning añade tres nuevas etiquetas de idioma (`ak-GH`, `gaa-GH`, `ee-GH`) y conserva los prompts originales (`en-US`, `fr-FR`, `es-ES`, `de-DE`, `pt-BR`) y el modo `auto`.

El entrenamiento se realizó en el run `d401e5fd72e4`; el checkpoint publicado como mejor modelo corresponde al paso 20, seleccionado con una puntuación de 107,584 definida como WER objetivo más 2,0 veces el incremento medio de WER de replay respecto al modelo base. No se especifican en la información disponible el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF/DPO (no aplicables habitualmente en ASR). Los tags de Hugging Face indican `base_model:finetune`, lo que confirma el ajuste fino supervisado sobre el modelo de NVIDIA.

## Capacidades

- Reconocimiento automático del habla en streaming con atención cache-aware, orientado a baja latencia.
- Transcripción en tres lenguas de Ghana: akan/twi (`ak-GH`), ga (`gaa-GH`) y ewe (`ee-GH`), con calidad muy limitada (WER cercano al 100 %).
- Transcripción en inglés, francés, español, alemán y portugués mediante replay, con degradación respecto al modelo base.
- Identificación automática de idioma en modo `auto`, con precisión del 15,7 % en las nuevas lenguas.
- Eliminación de etiquetas de idioma en la salida mediante `decoding.strip_lang_tags`.
- Soporte de inferencia por lotes (`model.transcribe`) y de inferencia en streaming (`set_inference_prompt` + bucle cache-aware).
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento.

## Casos de uso

- Investigación en ASR de bajos recursos: sirve como punto de partida reproducible para experimentos de fine-tuning sobre lenguas ghanesas, dado que el autor documenta el run, el paso y la métrica de selección.
- Evaluación comparativa de modelos base: permite medir cuánto se degrada el rendimiento en idiomas europeos al añadir lenguas nuevas mediante replay, con cifras concretas de WER por idioma.
- Docencia y demostración de pipelines NeMo: el código de carga y transcripción con `restore_from` y `target_lang` es directamente ejecutable para ilustrar el flujo de trabajo de NeMo ASR.
- Prototipado de transcripción en streaming en inglés: con WER de 6,62 en `en-US`, puede usarse en demos internas de transcripción en tiempo real, siempre que no se requiera precisión de producción.
- Generación de datos sintéticos o aumentados para lenguas ghanesas: las salidas del modelo, aunque imprecisas, pueden servir como señal débil en procesos de anotación asistida o de filtrado.
- Análisis de identificación de idioma: el 15,7 % de precisión en modo `auto` para las nuevas lenguas es un dato útil para estudiar los límites de la detección automática en modelos ajustados con pocos datos.
- Base para futuros fine-tunings: el checkpoint `final/sugar-smoke.nemo` puede reutilizarse como inicialización en experimentos con más datos o mayor número de pasos.

## Benchmarks y rendimiento

Resultados de WER publicados en la model card (clips held-out, minúsculas, sin puntuación ni etiquetas de idioma):

| Idioma | Prompt | Estado | WER base | WER este modelo |
|---|---|---|---|---|
| Akan (Twi) | `ak-GH` | nuevo | 101,0 | 100,0 |
| Ga | `gaa-GH` | nuevo | 98,36 | 100,0 |
| Ewe | `ee-GH` | nuevo | 103,33 | 100,0 |
| Inglés | `en-US` | mantenido | 6,62 | 6,62 |
| Francés | `fr-FR` | mantenido | 6,9 | 7,76 |
| Español | `es-ES` | mantenido | 3,19 | 4,26 |
| Alemán | `de-DE` | mantenido | 20,78 | 35,06 |
| Portugués | `pt-BR` | mantenido | 4,13 | 6,88 |

Precisión de identificación de idioma en modo `auto` sobre las nuevas lenguas: 15,7 %. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, por no ser aplicables a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 0,6 B de parámetros, la huella del modelo en precisión nativa es del orden de unos pocos GB, y el repositorio completo ocupa 7,7 GB (incluye dos checkpoints `.nemo`).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, el modelo es compatible con GPUs de consumo, pero no se documentan pruebas concretas con A100, H100 o RTX 4090.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño de 0,6 B, aunque no se confirma en la model card.
- Opciones de despliegue: NeMo (`nemo.collections.asr`), con carga vía `ASRModel.restore_from` y `hf_hub_download`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| prince4332/sugar-smoke | 0,6 B | ak, gaa, ee, en, fr, es, de, pt | `.nemo` | no disponible | WER ~100 % en lenguas nuevas; degradación en replay |
| nvidia/nemotron-3.5-asr-streaming-0.6b | 0,6 B | idiomas originales del modelo base (en, fr, es, de, pt, entre otros) | `.nemo` | no disponible en la información proporcionada | Modelo base; mejor WER en idiomas europeos que el fine-tune |
| Alternativas ASR multilingües de código abierto (p. ej. Whisper) | no disponible | multilingüe | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación directa con otros sistemas ASR para lenguas ghanesas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento prácticamente nulo en las lenguas objetivo: WER de 100,0 en akan, ga y ewe, lo que indica que el modelo no transcribe de forma útil ninguna de las tres.
- Degradación de los idiomas de replay: alemán empeora de 20,78 a 35,06 de WER y portugués de 4,13 a 6,88; el fine-tuning no preserva el rendimiento original.
- Identificación automática de idioma muy poco fiable en las nuevas lenguas (15,7 % de precisión en modo `auto`).
- Licencia no especificada: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Riesgo de alucinación y de salidas incorrectas en audio ruidoso o con acentos no representados en el entrenamiento; no se documentan evaluaciones en dominios diversos.
- No se documentan sesgos concretos, pero la escasez de datos de las lenguas ghanesas sugiere un fuerte sesgo hacia los idiomas con más datos del modelo base.
- Formato `.nemo` específico de NeMo: requiere el ecosistema NeMo para su uso, lo que limita la portabilidad frente a formatos como GGUF u ONNX.
- Repositorio con dos checkpoints (mejor y final) que pueden confundirse; la model card solo describe el mejor.
- No apto para producción en ninguna de las lenguas nuevas sin un entrenamiento adicional sustancial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prince4332/sugar-smoke
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
