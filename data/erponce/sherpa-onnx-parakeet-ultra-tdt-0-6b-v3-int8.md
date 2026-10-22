# erponce/sherpa-onnx-parakeet-ultra-tdt-0.6b-v3-int8

## Resumen

Parakeet Ultra para sherpa-onnx (int8) es una conversión a ONNX y cuantización a int8 de `moondream/parakeet-ultra`, un modelo de reconocimiento automático del habla (ASR) publicado por Moondream que, a su vez, es una versión post-entrenada del `nvidia/parakeet-tdt-0.6b-v3`. La conversión la firma el usuario `erponce` y está pensada para su uso desde sherpa-onnx, el runtime de k2-fsa orientado a inferencia local y en dispositivos. El resultado es un transducer NeMo con encoder, decoder y joiner separados, más el vocabulario `tokens.txt`, en el mismo layout que el paquete oficial de k2-fsa.

El modelo resuelve el problema de llevar un ASR de calidad a entornos sin GPU y sin conexión: al estar cuantizado en int8 con pesos de 8 bits, el repositorio completo ocupa 0,7 GB y puede ejecutarse en CPU, lo que lo hace apto para dictado en escritorio, aplicaciones móviles o hardware embebido. Cubre 25 idiomas europeos (incluidos castellano, catalán no incluido, gallego y euskera tampoco: la lista se limita a en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt).

Es relevante ahora porque la ruta Whisper sigue dominando el ecosistema ASR abierto, mientras que las arquitecturas transducer de NeMo ofrecen streaming nativo y menor latencia, y este paquete las pone al alcance de sherpa-onnx con un modelo de 0,6B parámetros. La licencia CC BY 4.0, heredada del modelo base, permite uso comercial con atribución. El autor indica que lo usa para dictado on-device en su propia aplicación, SideKick.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer NeMo (TDT, token-and-duration transducer) con encoder FastConformer, exportado a ONNX en tres grafos (encoder, decoder, joiner) |
| Parametros totales | 0,6B (600 millones, segun el nombre del modelo y el modelo base NVIDIA) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card no especifica la ventana de audio maxima) |
| Tipos de cuantizacion | int8 weight-only (operador `MatMulNBits` de onnxruntime, simetrico, bloques de 128, accuracy level 4); no se publican otras variantes en este repositorio |
| Idiomas soportados | 25 idiomas europeos: en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx`, `tokens.txt`) |

## Arquitectura y entrenamiento

La arquitectura es un transducer TDT (token-and-duration transducer), una variante de RNN-T en la que el predictor emite conjuntamente tokens y duraciones, lo que reduce el numero de pasos de decodificacion y acelera la inferencia frente a un RNN-T clasico. El encoder sigue el diseño FastConformer de NVIDIA NeMo, un Conformer con atencion submuestreada que trabaja sobre features acusticas y esta optimizado para audio largo. El modelo se distribuye como tres grafos ONNX independientes (encoder, decoder y joiner) que sherpa-onnx carga como `nemo_transducer`.

Sobre el entrenamiento no hay detalle en la informacion disponible: la model card no indica numero de tokens, composicion del dataset ni si hubo etapas de RLHF o ajuste con DPO. Lo que si se documenta es la cadena de derivacion: NVIDIA publica `parakeet-tdt-0.6b-v3`, Moondream lo post-entrena y publica `moondream/parakeet-ultra`, y esta conversión parte de la revision `73175eb` de ese repositorio mediante `scripts/build-dictation-model.py`. La innovacion tecnica destacable de este paquete concreto es la cuantizacion weight-only a int8 con `MatMulNBits` en bloques de 128, que reduce el tamano del repositorio a 0,7 GB manteniendo el esquema de tres grafos y la compatibilidad con el layout de k2-fsa.

## Capacidades

- Transcripcion de voz a texto (ASR) en 25 idiomas europeos con un unico modelo multilingue.
- Decodificacion de tipo transducer con emision conjunta de token y duracion (TDT), adecuada para inferencia de baja latencia.
- Funcionamiento sobre audio previamente extraido en features acusticas (no acepta texto ni imagen).
- Ejecucion en CPU mediante onnxruntime, sin requerir GPU, gracias a la cuantizacion int8.
- Integracion nativa con sherpa-onnx como `nemo_transducer`, con API para C++, Python, Kotlin/Java, Swift, C# y JavaScript segun el runtime.
- Soporte de streaming y de audio largo: no confirmado en la informacion disponible para esta conversion concreta; el layout de tres grafos es compatible con el modo streaming de sherpa-onnx, pero la model card no detalla configuracion ni limites.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un modelo acustico.

## Casos de uso

- Dictado on-device en aplicaciones de escritorio: el autor lo usa en SideKick para dictado local; con 0,7 GB de pesos y ejecucion en CPU, la transcripcion ocurre sin enviar audio a la nube, lo que simplifica el cumplimiento del RGPD.
- Subtitulado y transcripcion de reuniones en tiempo casi real: el esquema transducer permite decodificacion incremental, adecuada para alimentar una interfaz de subtitulos sin esperar al final del audio.
- Transcripcion de reuniones y notas de voz multilingues en entornos corporativos europeos: los 25 idiomas cubiertos evitan mantener un modelo distinto por mercado.
- Analitica de contact center: procesar grabaciones de llamadas por lotes en servidores sin GPU, con coste por hora bajo al no requerir aceleradores.
- Aplicaciones de accesibilidad: dictado y voice typing en equipos modestos o antiguos donde un modelo Whisper large no cabe en memoria.
- Procesamiento en el borde (edge): asistentes de voz, kioscos o dispositivos industriales con CPU ARM, donde un modelo int8 de 0,6B es viable en RAM.
- Pipelines de transcripcion por lotes autoalojados: sustitucion de APIs de ASR de terceros para corpus de audio internos, con atribucion CC BY 4.0.
- Preprocesado de audio para otros sistemas: generar transcripciones que alimenten motores de busqueda, resumen o indexacion de archivos audiovisuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `docs/development/VOICE_MODELS.md` del repositorio SideKick para las mediciones de precision del autor y a las versiones fijadas y hashes, pero no reproduce cifras de WER, MMLU, HumanEval ni equivalentes, ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio pesa 0,7 GB en int8, por lo que la huella de pesos ronda esa cifra y la memoria total en GPU con overhead de onnxruntime se situa previsiblemente en el entorno de 1 a 2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente a nivel de capacidad; no se documentan requisitos ni modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- Cabe en GPU de consumo: si, por tamano (0,6B en int8), en cualquier tarjeta moderna de gama media o superior; tambien en GPUs integradas.
- Ejecucion en CPU: es el escenario principal del paquete, ya que la cuantizacion int8 con `MatMulNBits` esta pensada para onnxruntime en CPU, incluidos dispositivos ARM.
- Opciones de despliegue: sherpa-onnx (C++, Python, Kotlin/Java, Swift, C#, JavaScript), onnxruntime directamente sobre los tres grafos. vLLM, llama.cpp, Ollama y TGI no aplican: no es un modelo de lenguaje.
- Latencia y throughput: no disponible. La model card menciona mediciones en `VOICE_MODELS.md`, pero no se incluyen valores numericos en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Idiomas | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Parakeet Ultra TDT 0.6B v3 int8) | 0,6B | Transducer TDT (FastConformer) | 25 europeos | CC BY 4.0 | ONNX int8 para sherpa-onnx |
| `moondream/parakeet-ultra` (base) | 0,6B | Transducer TDT (FastConformer) | 25 europeos | CC BY 4.0 | Pesos NeMo, no confirmado en la informacion |
| `nvidia/parakeet-tdt-0.6b-v3` (original) | 0,6B | Transducer TDT (FastConformer) | 25 europeos | CC BY 4.0 | NeMo `.nemo`, sherpa-onnx via k2-fsa |
| Whisper large-v3 (referencia del ecosistema) | ~1,55B | Encoder-decoder transformer | multilingue amplio | MIT | safetensors, GGUF, ONNX, multiples runtimes |

No hay datos de rendimiento comparado (WER por idioma, velocidad de decodificacion) en la informacion disponible, por lo que la comparativa se limita a parametros, licencia y formato. La ventaja diferencial de este paquete frente a Whisper es el tamano (0,6B frente a ~1,55B), la decodificacion transducer sin atencion cruzada completa y la integracion directa en sherpa-onnx; la desventaja es que no cubre tantos idiomas ni ofrece traduccion ni marcas de tiempo al estilo Whisper.

## Limitaciones y advertencias

- Solo ASR: no genera texto libre, no razona, no hace tool calling ni responde preguntas. Cualquier caso de uso que requiera un LLM necesita otro modelo en el pipeline.
- Cobertura linguistica limitada a 25 idiomas europeos; no incluye arabe, chino, japones, coreano, hindi ni turco, entre otros.
- No se documenta el rendimiento por idioma ni el WER; los 25 idiomas figuran en la lista, pero la calidad relativa entre ellos es desconocida.
- La cuantizacion int8 weight-only introduce una perdida de precision frente al modelo en punto flotante que no se cuantifica en la model card; conviene validar el WER en el dominio propio antes de produccion.
- Riesgo de alucinacion y de transcripciones plausibles pero incorrectas en audio con ruido, solapamiento de hablantes o acentos no representados en el entrenamiento; es un riesgo inherente a los modelos acusticos y no se documenta mitigacion.
- No se especifica la longitud maxima de audio soportada ni el comportamiento en audio muy largo.
- Licencia CC BY 4.0: el uso comercial esta permitido, pero exige atribucion a Moondream y NVIDIA (y al autor de la conversion), ademas de indicar si se han hecho cambios. Es incompatible con licencias copyleft mas restrictivas si se mezcla en un trabajo derivado.
- El modelo se entrega "as-is", sin garantias de ningun tipo, segun la propia model card.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 21 de octubre de 2026: es una conversion de autor individual, no un artefacto mantenido por NVIDIA ni por k2-fsa. Conviene fijar la revision por hash y verificar los ficheros antes de desplegar.
- La informacion disponible no incluye hashes ni proceso de verificacion reproducido en esta ficha; la model card remite al repositorio SideKick para obtenerlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/erponce/sherpa-onnx-parakeet-ultra-tdt-0.6b-v3-int8
- Modelo base: https://huggingface.co/moondream/parakeet-ultra
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Runtime sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Proyecto SideKick: https://github.com/eponce00/sidekick
- Script de conversion: https://github.com/eponce00/sidekick/blob/main/scripts/build-dictation-model.py
- Documentacion de modelos de voz de SideKick (versiones fijadas, hashes, mediciones de precision): https://github.com/eponce00/sidekick/blob/main/docs/development/VOICE_MODELS.md
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Paquete de referencia con el mismo layout de k2-fsa: https://huggingface.co/k2-fsa/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8
- Papers, blogs y demos adicionales: no disponible. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.
