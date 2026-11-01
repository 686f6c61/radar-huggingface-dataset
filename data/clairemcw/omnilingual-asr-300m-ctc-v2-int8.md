# clairemcw/omnilingual-asr-300M-ctc-v2-int8

## Resumen

Omnilingual ASR CTC 300M v2 int8 ONNX es una versión cuantizada y exportada a ONNX del modelo de reconocimiento automático de voz (ASR) Omnilingual ASR de Meta, en su variante CTC de 300 millones de parámetros y revisión v2 (diciembre de 2025). El modelo original está diseñado para transcripción multilingüe a gran escala, con cobertura declarada de más de 1.600 idiomas, y se distribuye bajo licencia Apache 2.0. Esta ficha concreta corresponde a un artefacto derivado publicado por el usuario clairemcw, que parte de la exportación a sherpa-onnx de csukuangfj2 y aplica cuantización dinámica de pesos a int8 mediante onnxruntime.

El problema que resuelve es doble: por un lado, ofrece ASR multilingüe con un modelo de tamaño contenido (300M parámetros) apto para despliegue en entornos con recursos limitados; por otro, al incluir la cabeza CTC con un vocabulario de 10.288 tokens de carácter, permite realizar alineamiento forzado (forced alignment) entre audio y transcripción, una función utilizada por el proyecto Mimia como alineador de palabras. La cuantización a int8 reduce el peso del repositorio a aproximadamente 0,3 GB, lo que facilita su integración en pipelines de inferencia en CPU.

La relevancia actual radica en la combinación de cobertura lingüística amplia, licencia permisiva y formato ONNX listo para producción con sherpa-onnx, lo que lo hace adecuado para aplicaciones de transcripción y subtitulado sin dependencia de infraestructura GPU dedicada. No obstante, la información pública disponible sobre este artefacto concreto es escasa: no se detallan idiomas específicos, datos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabeza CTC (Omnilingual ASR CTC 300M v2) |
| Parametros totales | 300M (según denominación del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo ASR; ventana de audio no especificada) |
| Tipos de cuantizacion | int8 dinámica de pesos (QuantType.QUInt8) sobre ONNX; el repositorio incluye `model.onnx` y `model.int8.onnx` |
| Idiomas soportados | Más de 1.600 según el modelo base; listado concreto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`, `model.int8.onnx`), más `tokens.txt` |

## Arquitectura y entrenamiento

El modelo base es un transformer con cabeza de clasificación CTC, en la variante de 300 millones de parámetros de la familia Omnilingual ASR de Meta. La salida del modelo son logits con forma (N, frames, 10288), con tramas de 20 ms, y el vocabulario de 10.288 tokens corresponde a caracteres, donde el token 0 (`<s>`) actúa como blank de CTC y el espacio es el token 4. La entrada `x` tiene forma (N, samples) a 16 kHz mono, normalizada a media cero y varianza unitaria.

El artefacto aquí descrito no aporta información sobre el corpus de entrenamiento, el número de tokens vistos ni si hubo etapas de ajuste fino con RLHF o DPO; esos detalles corresponden al modelo original de Meta y no se incluyen en la model card de esta exportación. La innovación técnica relevante en esta versión es la cadena de conversión: exportación a sherpa-onnx, cuantización dinámica de pesos a int8 con onnxruntime y empaquetado con el fichero de tokens, lo que permite inferencia eficiente en CPU y uso del modelo como alineador forzado CTC.

## Capacidades

- Reconocimiento automático de voz multilingüe con cobertura declarada de más de 1.600 idiomas en el modelo base.
- Transcripción de audio a texto a partir de entradas de 16 kHz mono normalizadas.
- Alineamiento forzado CTC: dado un audio y su transcripción, permite obtener la correspondencia temporal entre palabras o caracteres y segmentos de audio.
- Salida a nivel de trama con resolución de 20 ms, útil para subtitulado y sincronización.
- Inferencia en CPU mediante ONNX Runtime y sherpa-onnx, sin requisito de GPU.
- No se documenta soporte de tool calling, agentes, visión, audio de entrada distinto de voz ni modo de razonamiento explícito.

## Casos de uso

- Subtitulado automático multilingüe: el modelo transcribe audio en cualquiera de los idiomas cubiertos y, con la cabeza CTC, permite alinear los subtítulos a nivel de trama de 20 ms para sincronización precisa.
- Alineamiento forzado de transcripciones existentes: dado un texto ya transcrito y su audio, se obtienen marcas temporales por palabra, útil para herramientas de edición de vídeo o corpus lingüísticos anotados.
- Generación de datasets de voz etiquetados: al cubrir más de 1.600 idiomas, permite transcribir grabaciones de lenguas de bajos recursos para construir corpus de entrenamiento o evaluación.
- Transcripción en servidores sin GPU: la versión int8 ONNX y el soporte de sherpa-onnx permiten desplegar ASR en CPU con un peso de repositorio de unos 0,3 GB, adecuado para entornos edge o contenedores ligeros.
- Búsqueda y indexación de archivos de audio: transcripción por lotes de grabaciones (reuniones, entrevistas, archivos sonoros) para habilitar búsqueda por texto sobre el contenido hablado.
- Verificación de calidad de transcripciones: comparar la salida del modelo con una transcripción de referencia y usar el alineamiento CTC para detectar desviaciones temporales o segmentos mal transcritos.
- Accesibilidad: generación de subtítulos en directo o diferidos para vídeos y retransmisiones en múltiples idiomas con infraestructura de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la versión int8 ONNX, pensada para CPU; el modelo base de 300M en fp32 requeriría aproximadamente 1,2 GB de memoria, y la versión int8 alrededor de 0,3-0,4 GB.
- GPU recomendadas: no especificadas; cualquier GPU con soporte de ONNX Runtime (por ejemplo, RTX 4090, A100, H100) podría ejecutar el modelo, pero no hay datos de rendimiento publicados para esta exportación.
- Cabe en GPU de consumo: sí, por tamaño, aunque la model card no documenta pruebas en GPU concretas.
- Opciones de despliegue: ONNX Runtime, sherpa-onnx; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Omnilingual ASR CTC 300M v2 int8 (este) | 300M | Tramas de 20 ms; ventana no especificada | Más de 1.600 (modelo base) | Apache 2.0 | ONNX int8 |
| Whisper large-v3 | 1.550M | Ventana de 30 s | ~99 idiomas | MIT | Safetensors, GGML, ONNX |
| Whisper small | 244M | Ventana de 30 s | ~99 idiomas | MIT | Safetensors, GGML, ONNX |
| MMS (Meta) | ~1.000M (varía por idioma) | No especificado | Más de 1.100 | CC-BY-NC 4.0 | PyTorch |

La comparativa se basa en características públicas de los modelos alternativos; no se dispone de datos de benchmarks comparativos para este artefacto concreto. Frente a Whisper, este modelo ofrece mayor cobertura lingüística declarada y licencia Apache 2.0, pero carece de datos públicos de precisión y de una ventana de audio documentada.

## Limitaciones y advertencias

- No se documentan los idiomas concretos cubiertos ni su calidad relativa; la cifra de más de 1.600 idiomas corresponde al modelo base y puede no reflejarse en esta exportación.
- Ausencia total de benchmarks publicados para esta versión int8: no hay evidencia de la degradación de precisión introducida por la cuantización dinámica.
- Riesgo de alucinación y errores de transcripción en audio con ruido, acentos marcados o idiomas de bajos recursos, sin datos que cuantifiquen dicho riesgo.
- La cuantización int8 puede afectar a la calibración de los logits y, por tanto, al alineamiento forzado; no se han publicado evaluaciones al respecto.
- La entrada debe estar a 16 kHz mono y normalizada a media cero y varianza unitaria; no se documenta preprocesado adicional ni manejo de audio multicanal.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y procede de un autor individual sobre una exportación de terceros; conviene validar el artefacto antes de usarlo en producción.
- Aunque la licencia es Apache 2.0, se recomienda verificar las condiciones del modelo base de Meta y de la exportación intermedia de sherpa-onnx.
- No se especifican limitaciones de longitud de audio ni estrategias de segmentación para grabaciones largas.

## Enlaces

- HuggingFace del artefacto: https://huggingface.co/clairemcw/omnilingual-asr-300M-ctc-v2-int8
- Exportación sherpa-onnx de origen: https://huggingface.co/csukuangfj2/sherpa-onnx-omnilingual-asr-1600-languages-300M-ctc-v2-2026-02-05
- Repositorio de Omnilingual ASR de Meta: https://github.com/facebookresearch/omnilingual-asr
