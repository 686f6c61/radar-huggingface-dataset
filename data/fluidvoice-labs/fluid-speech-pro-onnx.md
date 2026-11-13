# FluidVoice-Labs/fluid-speech-pro-onnx

## Resumen

Fluid Speech Pro (ONNX) es la versión en formato ONNX de Fluid Speech Pro, un modelo de reconocimiento automático del habla (ASR) de 0,63 mil millones de parámetros desarrollado por FluidVoice-Labs, el equipo detrás de la aplicación FluidVoice. Está construido sobre NVIDIA Parakeet TDT 0.6B v3 y conserva su cobertura de 25 idiomas europeos, con detección automática del idioma sin necesidad de indicación previa. Esta variante está pensada para ejecutarse en CPU mediante las librerías onnx-asr y sherpa-onnx, sin requerir GPU ni Python en el caso de sherpa-onnx.

El modelo resuelve el problema de la transcripción de voz precisa y rápida en entornos sin aceleración hardware, manteniendo la misma calidad que el checkpoint original de NeMo. Según la model card, ocupa el segundo puesto entre los modelos abiertos en el Open ASR Leaderboard con un WER medio de 6,06 y es el modelo abierto más preciso por debajo de 1B de parámetros, con un 10 % menos de errores que el siguiente en esa categoría. Incorpora puntuación, mayúsculas y un modo limpio opcional que elimina muletillas y palabras repetidas.

La relevancia actual reside en su licencia permisiva CC BY 4.0, que permite uso comercial, y en su despliegue ligero: el repositorio ocupa 3,6 GB e incluye pesos en precisión completa e int8, lo que facilita su integración en aplicaciones de escritorio, servidores sin GPU y pipelines de transcripción a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-TDT (transducer con decodificación token-and-duration) |
| Parametros totales | 0,63B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | precisión completa (fp32) e int8; variantes clean en ambas |
| Idiomas soportados | 25 idiomas europeos: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (encoder, decoder y joiner separados; vocab.txt y config.json) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura FastConformer con decodificación TDT (token-and-duration transducer), la misma base que NVIDIA Parakeet TDT 0.6B v3, sobre la que FluidVoice-Labs ha añadido un bloque adicional para el modo limpio. Ese bloque vive dentro del fichero del encoder, de modo que tanto onnx-asr como sherpa-onnx lo ejecutan sin código extra. La exportación a ONNX separa el modelo en tres grafos (encoder, decoder y joiner) más el vocabulario y la configuración, lo que permite su uso con los runtimes mencionados.

No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La model card indica que el modelo deriva de Parakeet TDT 0.6B v3 y conserva sus 25 idiomas europeos, con detección automática de idioma. La innovación destacable es el modo limpio opcional, implementado como dos grafos pequeños que reutilizan los mismos ficheros de pesos, y la inclusión de marcas de tiempo a nivel de palabra y de segmento (esta última solo en la versión NeMo).

## Capacidades

- Reconocimiento automático del habla en 25 idiomas europeos con detección automática de idioma, sin prompt.
- Puntuación y mayúsculas incluidas en la salida.
- Modo limpio opcional (disponible en NeMo, ONNX y MLX) que elimina muletillas como "um" o "uh" y palabras repetidas.
- Marcas de tiempo a nivel de palabra y de segmento en la versión NeMo; en ONNX no se documentan marcas de tiempo.
- Ejecución en CPU mediante onnx-asr y sherpa-onnx, sin necesidad de GPU.
- Cuantización int8 para reducir requisitos de memoria y acelerar la inferencia.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y notas de voz en aplicaciones de escritorio: el modelo corre en CPU con onnx-asr, lo que permite integrarlo en apps locales sin depender de servicios en la nube ni de GPU.
- Subtitulado automático de vídeo en varios idiomas europeos: la detección automática de idioma y la puntuación incluida simplifican la generación de subtítulos listos para revisión en 25 lenguas.
- Atención al cliente con análisis de llamadas: la transcripción en servidores sin GPU abarata el procesamiento por lotes de grabaciones y permite extraer texto con mayúsculas y puntuación para su posterior análisis.
- Generación de actas y resúmenes a partir de audio: el modo limpio elimina muletillas y repeticiones, lo que reduce el ruido textual antes de pasar el resultado a un modelo de lenguaje.
- Accesibilidad y dictado por voz: el despliegue ligero (repositorio de 3,6 GB, con int8 para menor huella) facilita su inclusión en herramientas de dictado para usuarios con movilidad reducida.
- Procesamiento por lotes de archivos de audio en pipelines de datos: la velocidad reportada de aproximadamente 3.700× tiempo real en una GPU y la variante ONNX para CPU permiten transcribir grandes volúmenes con coste controlado.
- Investigación en ASR multilingüe: la licencia CC BY 4.0 y la disponibilidad en cinco formatos (NeMo, ONNX, MLX, GGUF y Core ML) facilitan la reproducibilidad y la comparación entre entornos.

## Benchmarks y rendimiento

| Benchmark | Resultado | Nota |
|---|---|---|
| Open ASR Leaderboard (WER medio) | 6,06 | Segundo modelo abierto del ranking |
| URGENT 2024 (WER en ruido) | 9,83 | Segundo modelo abierto en el conjunto con ruido |
| Velocidad en una GPU | ~3.700× tiempo real | Una hora de audio en aproximadamente un segundo |

La model card indica además que es el modelo abierto más preciso por debajo de 1B de parámetros, con un 10 % menos de errores que el siguiente en esa categoría. No se han publicado en la información disponible resultados desglosados por idioma ni comparaciones numéricas con modelos concretos en MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 0,63B de parámetros, la variante int8 requiere del orden de cientos de MB de memoria y la de precisión completa alrededor de 2,5 GB en pesos, aunque el repositorio completo ocupa 3,6 GB.
- GPU recomendadas: no se especifican; la model card cita el rendimiento de aproximadamente 3.700× tiempo real en una GPU sin concretar el modelo.
- Cabe en GPU de consumo: sí, por el tamaño del modelo; no se detallan modelos concretos.
- Opciones de despliegue: onnx-asr (CPU), sherpa-onnx (CPU, también sin Python), y las variantes NeMo + Transformers, MLX, GGUF y Core ML para otros entornos.
- Latencia y throughput: aproximadamente 3.700× tiempo real en una GPU según la model card; no se publican cifras de latencia en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER (Open ASR Leaderboard) | Licencia | Formatos |
|---|---|---|---|---|---|
| Fluid Speech Pro (ONNX) | 0,63B | 25 europeos | 6,06 | CC BY 4.0 | ONNX, NeMo, MLX, GGUF, Core ML |
| NVIDIA Parakeet TDT 0.6B v3 | 0,6B | 25 europeos | no disponible en la información | no disponible en la información | NeMo |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con el modelo base del que deriva, Parakeet TDT 0.6B v3, del que no se ofrecen métricas propias en la model card. No se dispone de datos de otros modelos comparables en la información consultada.

## Limitaciones y advertencias

- Cobertura limitada a 25 idiomas europeos; no se documenta soporte para otras lenguas.
- No se han publicado análisis de sesgos en la información disponible; como todo modelo ASR, puede presentar diferencias de precisión según acento, dialecto o calidad de grabación.
- Riesgo de alucinación y de errores en audio con ruido, solapamiento de hablantes o vocabulario técnico; la model card solo reporta el WER en URGENT 2024 (9,83), que es superior al WER medio.
- Las marcas de tiempo solo se documentan en la versión NeMo; en ONNX no se especifican.
- El modo limpio no está disponible en la versión GGUF y aún no en Core ML.
- La licencia CC BY 4.0 permite uso comercial, pero exige atribución al autor.
- No se documentan capacidades de tool calling, agentes ni procesamiento multimodal más allá del audio.

## Enlaces

- Hugging Face (ONNX): https://huggingface.co/FluidVoice-Labs/fluid-speech-pro-onnx
- Modelo base NeMo: https://huggingface.co/FluidVoice-Labs/fluid-speech-pro
- Versión MLX: https://huggingface.co/FluidVoice-Labs/fluid-speech-pro-mlx
- Versión GGUF: https://huggingface.co/FluidVoice-Labs/fluid-speech-pro-gguf
- Versión Core ML: https://huggingface.co/FluidVoice-Labs/fluid-speech-pro-coreml
- Modelo de referencia NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- onnx-asr: https://github.com/istupakov/onnx-asr
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- FluidVoice: https://fluidvoice.com
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- Paper FastConformer: https://arxiv.org/abs/2305.05084
- Paper TDT: https://arxiv.org/abs/2304.06795
