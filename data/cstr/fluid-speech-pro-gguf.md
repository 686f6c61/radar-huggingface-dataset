# cstr/fluid-speech-pro-GGUF

## Resumen

Fluid Speech Pro GGUF es una conversión al formato GGUF del modelo de reconocimiento automático del habla Fluid Speech Pro, desarrollado por FluidVoice Labs. El modelo original parte de NVIDIA Parakeet TDT 0.6B v3 e incorpora un pequeño bloque residual entre el subsampling del encoder y su primera capa Conformer. Esta conversión, mantenida por el usuario `cstr`, está pensada para ejecutarse con CrispASR, un runtime basado en ggml/GGUF.

El modelo realiza transcripción de voz a texto con detección automática de idioma, puntuación y mayúsculas, y cubre inglés más 24 idiomas europeos adicionales. Con 629.232.790 parámetros y un tamaño de repositorio de 4,7 GB (los pesos F16 ocupan 1,26 GB), está en la gama de modelos ASR compactos que pueden ejecutarse en CPU o en GPU de consumo.

Su relevancia actual radica en que ofrece una alternativa cuantizada (Q8_0 de 677 MB, Q4_K de 403 MB) de un modelo Parakeet mejorado, con una variante "clean" que elimina repeticiones y muletillas para generar texto editado en lugar de una transcripción literal. La conversión incluye el bloque residual que otras conversiones GGUF de Parakeet omiten, lo que la hace útil para quienes necesitan fidelidad respecto al checkpoint de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer + TDT (token-and-duration transducer), con bloque residual adicional entre subsampling y primera capa Conformer |
| Parametros totales | 629.232.790 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K |
| Idiomas soportados | en, bg, hr, cs, da, nl, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk (25 idiomas) |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF (ggml) |

## Arquitectura y entrenamiento

El modelo base es NVIDIA Parakeet TDT 0.6B v3, un modelo de reconocimiento de voz con arquitectura FastConformer y decodificador TDT (token-and-duration transducer). Fluid Speech Pro añade un bloque residual entre el subsampling del encoder y la primera capa Conformer, compuesto por LayerNorm, una capa Linear, una Conv1d depthwise con kernel 15, activación GELU y otra capa Linear. Esta conversión se generó desde el checkpoint de referencia `.nemo`, por lo que incluye dicho bloque; las conversiones upstream de transformers y parakeet.cpp lo omiten.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada. La variante "clean" corresponde upstream a un adaptador de bajo rango opcional que se ha plegado en los pesos durante la conversión, tal como hace `fluid_speech.py`. No hubo reentrenamiento: los cambios de este repositorio son únicamente conversión de formato, cuantización y plegado del adaptador clean.

## Capacidades

- Reconocimiento automático del habla (ASR) con salida de texto transcrito.
- Detección automática de idioma entre inglés y 24 idiomas europeos adicionales.
- Puntuación y mayúsculas generadas automáticamente en la salida.
- Modo "clean": texto editado que elimina palabras repetidas y muletillas como "um" y "uh".
- Manejo de habla con cambio de código (code-switching), aunque con cierta deriva en cuantización Q4_K.
- Ejecución mediante CrispASR con backend parakeet, que activa el bloque residual cuando sus tensores están presentes.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá del ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo genera puntuación y mayúsculas automáticamente, lo que reduce el postprocesado necesario para actas y notas.
- Subtitulado multilingüe: con 25 idiomas soportados y detección automática de idioma, puede transcribir contenido en varios idiomas europeos sin configurar el idioma manualmente.
- Dictado y escritura por voz: la variante clean elimina muletillas y repeticiones, produciendo texto más legible para documentos finales.
- Transcripción de audio en entornos con recursos limitados: la cuantización Q4_K (403 MB) permite ejecutar el modelo en CPU o en GPUs de consumo con poca VRAM.
- Procesamiento por lotes en pipelines de datos: la conversión GGUF y el runtime CrispASR permiten integrar el ASR en flujos automatizados de transcripción masiva.
- Análisis de grabaciones con cambio de código: el modelo cubre clips con mezcla de idiomas, útil en contextos europeos bilingües, aunque se recomienda Q8_0 o F16 para preservar fidelidad.
- Archivado verbatim de audio legal o médico: la variante base (no clean) mantiene una transcripción literal, adecuada cuando se requiere un registro exacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card incluye únicamente validaciones de fidelidad frente a NeMo, no métricas de WER sobre datasets estándar:

| Prueba | Resultado |
|---|---|
| Diff F16 por etapas | 28/28 etapas correctas; coseno de salida del encoder ≥ 0,99997 |
| Transcripciones F16 y Q8_0 | Coinciden con NeMo en jfk.wav, multispeaker.wav y clip alemán/inglés de 30 s |
| Clean mode Q8_0 en multispeaker.wav | Diferencia solo en espacios o puntuación (WER 0) |
| Q4_K en clips ingleses | Coincide; cambia 3–4 palabras en el inicio con cambio de código |
| Coseno peor frame encoder Q8_0 (jfk.wav) | 0,933 (Fluid) frente a 0,988 (Parakeet v3) |
| Coseno peor frame encoder Q8_0 (multispeaker.wav) | 0,9946 (Fluid) frente a 0,9957 (Parakeet v3) |

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,3 GB en F16, 0,7 GB en Q8_0 y 0,4 GB en Q4_K para los pesos, más el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para F16; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, con las cuantizaciones Q8_0 y Q4_K; también es viable en CPU dado el tamaño reducido.
- Opciones de despliegue: CrispASR (runtime principal, con `--auto-download` y selección por `-m`), conversión mediante `convert-parakeet-to-gguf.py` y cuantización con `crispasr-quantize`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Fluid Speech Pro GGUF (este) | 629.232.790 | no disponible | 25 | CC BY 4.0 | GGUF |
| NVIDIA Parakeet TDT 0.6B v3 | ~0,6B | no disponible | no disponible en la información | CC BY 4.0 | NeMo, transformers, GGUF |
| Moondream Parakeet Ultra | no disponible | no disponible | no disponible | CC BY 4.0 | no disponible |

Fluid Speech Pro se diferencia de Parakeet TDT 0.6B v3 por el bloque residual adicional y por el adaptador clean opcional; según la validación, el coseno del encoder en Q8_0 es ligeramente inferior al de v3 en jfk.wav (0,933 frente a 0,988). No se dispone de datos de rendimiento WER comparativos entre ambos.

## Limitaciones y advertencias

- La cuantización Q4_K introduce deriva en habla con cambio de código (3–4 palabras alteradas en el clip de prueba); se recomienda Q8_0 o F16 en esos casos.
- Los ficheros cuantizados no superan los umbrales por etapa ajustados para F16, igual que ocurre con Parakeet v3 convertido del mismo modo.
- El modo clean no debe usarse cuando se requiera un registro exacto, ya que elimina repeticiones y muletillas deliberadamente.
- No se documentan sesgos conocidos ni tasas de alucinación en la información disponible.
- La longitud de contexto no está especificada; no se puede garantizar el comportamiento en audios de duración arbitraria.
- Licencia CC BY 4.0: permite uso comercial con atribución obligatoria a "Fluid Speech Pro by FluidVoice".
- El modelo está pensado para CrispASR; otras conversiones GGUF de Parakeet omiten el bloque residual, lo que puede afectar a la fidelidad si se usan con otros runtimes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que su validación comunitaria es limitada.

## Enlaces

- Modelo GGUF: https://huggingface.co/cstr/fluid-speech-pro-GGUF
- Modelo base: https://huggingface.co/FluidVoice-Labs/fluid-speech-pro
- NVIDIA Parakeet TDT 0.6B v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Moondream Parakeet Ultra: https://huggingface.co/moondream/parakeet-ultra
- CrispASR: https://github.com/CrispStrobe/CrispASR
