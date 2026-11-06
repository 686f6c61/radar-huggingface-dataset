# ijar/parakeet-ultra-onnx-latin

## Resumen

Parakeet Ultra 0.6B ONNX Latin-script only es una variante del modelo de reconocimiento automatico del habla (ASR) Parakeet Ultra de Moondream, derivado a su vez de parakeet-tdt-0.6b-v3 de NVIDIA. El modelo original es un NeMo Conformer con decodificacion TDT (Token-and-Duration Transducer) de aproximadamente 0,6 mil millones de parametros, orientado a transcripcion multilingue. Esta version concreta, publicada por el usuario ijar, se distribuye en formato ONNX con el layout de la libreria onnx-asr y esta pensada para inferencia en CPU.

La modificacion respecto al export original de Masterx es quirurgica: en el grafo `decoder_joint-model.onnx` se reduce en 10.000 el sesgo de la capa de salida de la red conjunta (`joint.joint_net.2.bias`) para los 1.720 tokens que contienen letras cirilicas o griegas. El efecto practico es que la decodificacion voraz TDT ya no puede emitir esos tokens, forzando salida en alfabeto latino. El resto de componentes (encoder, tokenizer, logits de duracion, token blank) permanece inalterado.

La motivacion declarada es el uso en comandos de voz en rumano dentro de Home Assistant. Parakeet v3 detecta el idioma de forma automatica y, en fragmentos cortos o ruidosos, ocasionalmente respondia en ruso; como onnx-asr solo permite fijar el idioma en modelos Whisper y Canary, el autor opto por esta solucion a nivel de pesos. El modelo declara soporte para rumano (`ro`) y licencia CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | aproximadamente 0,6 mil millones (segun nombre del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | export fp32 en ONNX; otras cuantizaciones no disponibles |
| Idiomas soportados | rumano (`ro`) declarado; el modelo base es multilingue con deteccion automatica de idioma |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (layout onnx-asr), repositorio de 4,6 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es un encoder Conformer de NeMo combinado con un decodificador TDT, un esquema transducer que predice conjuntamente tokens y duraciones, lo que permite decodificacion no autoregresiva por saltos y reduce la latencia frente a transductores clasicos. El modelo procede de parakeet-tdt-0.6b-v3 de NVIDIA, sobre el que Moondream construyo Parakeet Ultra; no se dispone en la informacion proporcionada de detalles sobre volumen de datos de entrenamiento, composicion del corpus ni si se aplicaron etapas de ajuste fino con RLHF o tecnicas similares.

La innovacion de esta ficha no reside en el entrenamiento sino en la intervencion sobre el grafo exportado: el sesgo de la capa de salida de la red conjunta se desplaza a la baja para 1.720 tokens con caracteres cirilicos o griegos, de modo que la decodificacion greedy no puede seleccionarlos. Segun la model card, con onnx-asr 0.10.1 en CPU la salida es identica al export original en 387 frases completas de FLEURS ro_ro dev (WER 10,84 % con normalizacion propia), mientras que en 447 fragmentos cortos (1-1,5 s) y ruidosos extraidos de esas mismas frases el original produjo salida cirilica o griega en 43 casos y esta version en ninguno; de esos 43, 17 pasaron a salida vacia y el resto a texto latino.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) mediante pipeline `automatic-speech-recognition`.
- Decodificacion TDT con prediccion conjunta de tokens y duraciones, adecuada para inferencia de baja latencia.
- Salida restringida a alfabeto latino por construccion: no puede emitir tokens con caracteres cirilicos ni griegos.
- Soporte declarado de rumano; el modelo base admite deteccion automatica de idioma y cobertura multilingue.
- Ejecucion en CPU mediante ONNX Runtime a traves de onnx-asr.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Comandos de voz en Home Assistant en rumano: el modelo transcribe ordenes cortas y, gracias al enmascaramiento de tokens cirilicos y griegos, evita respuestas en ruso ante entradas ruidosas o de duracion inferior a 1,5 s, que es exactamente el escenario para el que se creo la variante.
- Transcripcion de notas de voz y dictado en rumano en aplicaciones de escritorio: al ejecutarse en CPU con ONNX Runtime, puede integrarse en utilidades locales sin GPU dedicada.
- Subtitulado offline de contenido en rumano: el pipeline ASR permite procesar ficheros de audio por lotes en servidores sin acelerador, con un coste de infraestructura bajo.
- Preprocesado de audio para pipelines de analisis: transcripcion previa de reuniones o llamadas en rumano antes de indexar el texto en motores de busqueda o sistemas de resumen.
- Asistentes de voz embebidos en dispositivos de bajo consumo: el formato ONNX y la ejecucion en CPU facilitan el despliegue en mini-PC o servidores domésticos tipo Raspberry Pi de gama alta, siempre que se valide el rendimiento real.
- Filtrado de idioma en aplicaciones multilingues: cuando se necesita garantizar que la salida sea exclusivamente latina, esta variante elimina por diseno la fuga a alfabetos cirilico o griego que presenta el export original.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las comprobaciones del autor con onnx-asr 0.10.1 en CPU:

| Prueba | Original (Masterx) | Esta variante |
|---|---|---|
| FLEURS ro_ro dev, 387 frases completas (WER, normalizacion propia) | 10,84 % | 10,84 % (salida identica) |
| Fragmentos cortos ruidosos (1-1,5 s), 447 muestras: salida cirilica o griega | 43 casos | 0 casos |
| Fragmentos cortos ruidosos: salida identica al original | no aplica | 404 de 447 |
| Fragmentos con fuga: resultado tras el cambio | no aplica | 17 vacios, resto texto latino |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, dado que se trata de un modelo ASR y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario documentado, que es ejecucion en CPU con ONNX Runtime; el repositorio ocupa 4,6 GB en fp32.
- GPU recomendadas: no se especifican en la informacion disponible; al ser un export ONNX podria ejecutarse en GPU mediante ONNX Runtime con proveedor CUDA, pero no hay datos de rendimiento publicados.
- Cabe en GPU de consumo: previsiblemente si en tarjetas con 8 GB o mas de VRAM en fp32, aunque este dato no esta confirmado en la model card.
- Opciones de despliegue: onnx-asr (version 0.10.1 probada por el autor) sobre ONNX Runtime; otras herramientas como vLLM, llama.cpp, Ollama o TGI no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; la model card solo indica que las pruebas se hicieron en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ijar/parakeet-ultra-onnx-latin | aproximadamente 0,6 B | no disponible | rumano declarado | CC-BY-4.0 | ONNX | Salida restringida a alfabeto latino |
| Masterx/parakeet-tdt-0.6b-ultra-onnx | aproximadamente 0,6 B | no disponible | multilingue | CC-BY-4.0 | ONNX | Export original sin enmascaramiento de tokens |
| moondream/parakeet-ultra | aproximadamente 0,6 B | no disponible | multilingue | CC-BY-4.0 | no disponible | Modelo base de Moondream |
| nvidia/parakeet-tdt-0.6b-v3 | aproximadamente 0,6 B | no disponible | multilingue | CC-BY-4.0 | no disponible | Modelo original de NVIDIA |

Los cuatro modelos comparten arquitectura y tamano; la diferencia practica entre esta variante y el export de Masterx es exclusivamente el sesgo modificado en la red conjunta, con impacto nulo en frases completas y eliminacion de la fuga a alfabetos no latinos en fragmentos cortos y ruidosos.

## Limitaciones y advertencias

- La modificacion es un parche sobre los pesos y no un ajuste fino: puede degradar la transcripcion en contextos donde el hablante cambie realmente a un idioma con alfabeto cirilico o griego, ya que esos tokens quedan inaccesibles.
- En 17 de los 43 fragmentos problematicos la salida paso a ser vacia, lo que puede traducirse en perdida de contenido en entradas muy cortas o con ruido.
- El WER de referencia en FLEURS ro_ro dev es del 10,84 % con normalizacion propia del autor; no es directamente comparable con cifras publicadas por terceros bajo otras normalizaciones.
- El modelo declara solo rumano como idioma soportado en esta ficha, aunque el base es multilingue; el uso en otros idiomas latinos no esta validado en la informacion disponible.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; es necesario citar a Moondream, NVIDIA y Masterx segun la model card.
- El autor indica explicitamente que la variante no esta avalada por Moondream, NVIDIA ni Masterx.
- No hay datos publicados sobre sesgos, tasa de alucinacion en transcripcion ni comportamiento en dominios acusticos distintos de los probados.
- Solo se ha validado con onnx-asr 0.10.1; otras versiones o runtimes pueden comportarse de forma distinta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ijar/parakeet-ultra-onnx-latin
- Export ONNX original: https://huggingface.co/Masterx/parakeet-tdt-0.6b-ultra-onnx
- Modelo base Parakeet Ultra (Moondream): https://huggingface.co/moondream/parakeet-ultra
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
