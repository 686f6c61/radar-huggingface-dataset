# cristimihailax/parakeet-ro-110m-tdt-onnx

## Resumen

`cristimihailax/parakeet-ro-110m-tdt-onnx` es una conversion a formato ONNX cuantizado a int8 de un modelo de reconocimiento automatico del habla (ASR) en rumano. El modelo original, `gabrielpirlo/SpeD_ParakeetRo_110M_TDT-CTC`, fue entrenado por el equipo SpeD y combina una arquitectura FastConformer con un decodificador de tipo transducer (TDT, Token-and-Duration Transducer) y una rama CTC adicional. Esta version concreta no introduce entrenamiento nuevo: se limita a exportar la rama TDT a ONNX y aplicar cuantizacion dinamica para su uso con el runtime sherpa-onnx.

El modelo resuelve el problema de transcripcion de voz a texto en rumano con un tamano reducido (110M parametros) y un peso total de aproximadamente 130 MB tras la cuantizacion, lo que lo hace apto para inferencia local en equipos de consumo. Es relevante ahora porque permite desplegar ASR rumano en aplicaciones de escritorio y moviles sin depender de servicios en la nube, y porque se ha convertido en el modelo por defecto de la aplicacion de dictado local Voice Flow para macOS.

La ficha se centra en las caracteristicas de esta exportacion ONNX. Los detalles de arquitectura, datos de entrenamiento y evaluacion del modelo subyacente deben consultarse en la model card del modelo base, ya que el autor de esta conversion no los replica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer + transducer TDT (encoder, prediction network y joint network exportados por separado) |
| Parametros totales | 110M (segun el nombre del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio no especificada en la informacion) |
| Tipos de cuantizacion | int8 (cuantizacion dinamica QUInt8 de ONNX Runtime) |
| Idiomas soportados | rumano (ro) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx`) + `tokens.txt` + `bpe.vocab` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un FastConformer con decodificador transducer de tipo TDT. El modelo base es hibrido, con rama TDT y rama CTC; esta exportacion utiliza unicamente la rama TDT. El encoder procesa caracteristicas de 80 dimensiones con un factor de subsampling de 8 y normalizacion `per_feature`, metadatos que se anadieron al grafo ONNX para que sherpa-onnx pueda cargarlo como modelo `nemo_transducer`. La red de prediccion y la red conjunta se exportaron como grafos independientes con `decoder_type = rnnt`.

La exportacion se realizo con NVIDIA NeMo y cada uno de los tres grafos se cuantizo por separado con cuantizacion dinamica de ONNX Runtime (QUInt8). No se aportan datos sobre el numero de tokens de entrenamiento, la composicion del corpus, el uso de RLHF/DPO ni innovaciones de decodificacion mas alla del propio esquema TDT. Toda esa informacion corresponde al modelo original y no se detalla en esta model card. El script de exportacion esta disponible en `scripts/export-parakeet-ro.py` del repositorio Voice Flow.

## Capacidades

- Transcripcion de voz a texto en rumano a partir de audio de 16 kHz mono.
- Salida en texto rumano en minusculas y sin puntuacion.
- Decodificacion con hotwords para sesgar el reconocimiento hacia nombres propios y terminos tecnicos, mediante `modified_beam_search` con unidad de modelado BPE y fichero `bpe.vocab`.
- Inferencia offline por lotes mediante la herramienta `sherpa-onnx-offline`.
- Ejecucion local sin dependencia de red, gracias al formato ONNX int8 de bajo peso.
- No soporta tool calling, agentes, vision ni audio mas alla de la transcripcion; no se documentan capacidades multilingues distintas del rumano.

## Casos de uso

- Dictado local en escritorio: integrado como modelo por defecto de Voice Flow en macOS, transcribe la voz del usuario en tiempo real sin enviar audio a la nube, lo que preserva la privacidad y elimina la latencia de red.
- Subtitulado de reuniones y clases en rumano: al ser un modelo offline de 130 MB, puede ejecutarse en el portatil del usuario y generar transcripciones de grabaciones de audio de 16 kHz sin coste por minuto.
- Sesgo hacia vocabulario tecnico: con `modified_beam_search` y una lista de hotwords se puede mejorar la transcripcion de nombres de personas, productos o terminos de dominio en entornos de atencion al cliente o documentacion medica.
- Aplicaciones moviles y embebidas: el peso reducido y la cuantizacion int8 permiten desplegar el modelo en dispositivos con recursos limitados mediante sherpa-onnx, por ejemplo en asistentes de voz para apps Android o iOS.
- Post-procesado de audio archivado: la herramienta `sherpa-onnx-offline` permite transcribir por lotes ficheros WAV de 16 kHz mono en pipelines de digitalizacion de archivos sonoros en rumano.
- Prototipado de interfaces de voz: al ser un modelo Apache-2.0 y de facil carga, sirve para validar flujos de reconocimiento de voz en productos rumanos antes de invertir en modelos mayores o servicios gestionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el peso total de los tres grafos int8 es de aproximadamente 130 MB, por lo que la huella en memoria es muy reducida y cabe en CPU.
- GPU recomendadas: no se especifican; al ser un modelo de 110M en int8, cualquier GPU consumer moderna (por ejemplo, serie RTX 30/40) es mas que suficiente, y tambien tarjetas de datacenter como A100 o H100 aunque resultan sobredimensionadas.
- Cabe en GPU consumer: si, con amplio margen; tambien es viable en CPU.
- Opciones de despliegue: sherpa-onnx (runtime previsto, modelo `nemo_transducer`); la rama CTC del mismo modelo esta exportada para onnx-asr en `AlinClaudiu/SpeD-ParakeetRo-110M-onnx`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `cristimihailax/parakeet-ro-110m-tdt-onnx` | 110M | no disponible | ro | Apache-2.0 | ONNX int8 (sherpa-onnx) | Exportacion TDT para sherpa-onnx |
| `gabrielpirlo/SpeD_ParakeetRo_110M_TDT-CTC` | 110M | no disponible | ro | Apache-2.0 | no disponible | Modelo original hibrido TDT+CTC |
| `AlinClaudiu/SpeD-ParakeetRo-110M-onnx` | 110M | no disponible | ro | no disponible | ONNX (onnx-asr) | Exportacion de la rama CTC del mismo modelo |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Solo reconoce rumano; no se documenta soporte para otros idiomas.
- La salida es texto en minusculas y sin puntuacion, por lo que requiere un post-procesado si se necesita formato legible.
- Es una conversion de formato: no se ha reentrenado ni ajustado el modelo, y los sesgos del modelo base se heredan sin cambios.
- Riesgo de alucinacion y errores en audio ruidoso, con acentos no estandar o con vocabulario fuera del dominio de entrenamiento; no se aportan tasas de error en la informacion disponible.
- La decodificacion con hotwords exige usar `modified_beam_search` con `bpe.vocab`; otros metodos de decodificacion no aprovechan esa funcion.
- Licencia Apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales antes de un despliegue en produccion.
- El modelo esta pensado para audio de 16 kHz mono; otras frecuencias o canales requieren remuestreo previo.
- No se documentan garantias de mantenimiento ni actualizaciones de esta exportacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cristimihailax/parakeet-ro-110m-tdt-onnx
- Modelo base: https://huggingface.co/gabrielpirlo/SpeD_ParakeetRo_110M_TDT-CTC
- Exportacion CTC para onnx-asr: https://huggingface.co/AlinClaudiu/SpeD-ParakeetRo-110M-onnx
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Voice Flow: https://github.com/cristiandrei1234/voice-flow
